// NeoN+1 engine/greglytics.js: a copy of greglytics/client/greglytics.js (the scores service on s3iz.com/glx).
// Change the original, then copy it here again (keep this stamp line).
NEON_FILES.push(['engine/greglytics.js', 'v13.74']);
// greglytics: the browser side. Copy this file into a project and include it with a script tag; then:
//   const gl = Greglytics.init({ endpoint: 'https://your.domain/api/', app: 'neon', version: '13.09' });
//   gl.track('run_end', { layers: 21, mods: 3 });
//   gl.submitScore('all', { score: 21, tie: 3, player: 'NEON_RAT', logo: '<#>' }).then(r => r.rank);
//   gl.scores('all', { limit: 10 }).then(b => b.entries);
//   gl.setName('VWD', run);   // a run's name (its entries carry data.run); no run: this device's name (older entries)
//   gl.optOut(true);
// No cookies. An anonymous random id per device (localStorage), a new session id per page load.
// Events are batched: sent every 20 events or 30 seconds, and when the page is hidden or closed.
// Pages opened from a file or from localhost count as dev (kept apart from the real data), unless dev is set.
// A tester device counts as dev everywhere: Greglytics.tester(true) remembers it on the device (e.g. a ?dev=1 page).
(function (root) {
  'use strict';
  const KEY = 'greglytics.';
  const store = {
    get(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } },
    set(k, v) { try { if (v == null) localStorage.removeItem(KEY + k); else localStorage.setItem(KEY + k, v); } catch (e) { /* private mode */ } },
  };
  const rid = n => { const a = new Uint8Array(n); (root.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.random() * 256; }); return Array.from(a, b => b.toString(16).padStart(2, '0')).join(''); };
  const isTester = () => store.get('tester') === '1';
  // a tester device: everything it sends is dev. Clients made after this pick it up.
  const tester = on => { if (on !== undefined) store.set('tester', on ? '1' : null); return isTester(); };
  const isDevPage = () => { const p = root.location || {}; return p.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(p.hostname || ''); };

  function init(opts) {
    if (!opts || !opts.endpoint || !opts.app) throw new Error('greglytics: endpoint and app are needed');
    const base = opts.endpoint.replace(/\/?$/, '/');
    const app = String(opts.app), version = String(opts.version || '');
    const dev = typeof opts.dev === 'boolean' ? opts.dev : isTester() || isDevPage();
    let device = store.get('device'); if (!device) { device = rid(8); store.set('device', device); }
    const session = rid(6);
    const pendingKey = 'pending.' + app;
    let queue = [];
    try { queue = JSON.parse(store.get(pendingKey) || '[]'); } catch (e) { queue = []; }   // unsent from last time
    let timer = 0;
    const out = () => store.get('out') === '1';
    const keep = () => store.set(pendingKey, queue.length ? JSON.stringify(queue.slice(-200)) : null);
    const payload = evs => JSON.stringify({ app, v: version, device, session, dev: dev ? 1 : 0, events: evs });

    // send what's queued; on the way out (page hidden / closing) use sendBeacon, which survives the page going away
    function flush(leaving) {
      clearTimeout(timer); timer = 0;
      if (!queue.length || out()) return;
      const batch = queue.splice(0, 50); keep();
      // text/plain keeps it a "simple" request: no CORS preflight
      const body = new Blob([payload(batch)], { type: 'text/plain' });
      let sent = false;
      if (leaving && navigator.sendBeacon) { try { sent = navigator.sendBeacon(base + 'e.php', body); } catch (e) { sent = false; } }
      if (!sent) {
        fetch(base + 'e.php', { method: 'POST', body, keepalive: true, mode: 'cors' }).then(r => {
          if (!r.ok && (r.status >= 500 || r.status === 429)) { queue = batch.concat(queue); keep(); }   // a server problem, or "slow down": try again later
        }).catch(() => { queue = batch.concat(queue); keep(); });                  // offline: try again later
      }
      if (queue.length) timer = setTimeout(() => flush(false), 1000);
    }
    function track(name, data) {
      if (out()) return;
      queue.push({ n: String(name), t: Math.floor(Date.now() / 1000), d: data === undefined ? null : data });
      keep();
      if (queue.length >= 20) flush(false);
      else if (!timer) timer = setTimeout(() => flush(false), 30000);
    }
    const leave = () => flush(true);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leave(); });
    root.addEventListener('pagehide', leave);
    if (queue.length) timer = setTimeout(() => flush(false), 3000);   // leftovers from last time

    function submitScore(board, s) {
      s = s || {};
      return fetch(base + 'scores.php', {
        method: 'POST', mode: 'cors', body: new Blob([JSON.stringify({ app, board, device, dev: dev ? 1 : 0,
          score: s.score, tie: s.tie || 0, player: s.player || '', logo: s.logo || '', data: s.data === undefined ? null : s.data })], { type: 'text/plain' }),
      }).then(r => r.json());
    }
    function scores(board, o) {
      o = o || {};
      const q = new URLSearchParams({ app, board, limit: String(o.limit || 10), device, dev: dev ? '1' : '0' });
      return fetch(base + 'scores.php?' + q, { mode: 'cors' }).then(r => r.json());
    }
    // this device's name on the boards (e.g. arcade initials): renames all its entries -> {ok, name}
    // run: name just that run's entries (the ones whose data.run is this); without it, the device's name (older entries)
    function setName(name, run) {
      const body = { app, device, dev: dev ? 1 : 0, name: String(name || '') };
      if (run != null) body.run = run;
      return fetch(base + 'name.php', {
        method: 'POST', mode: 'cors', body: new Blob([JSON.stringify(body)], { type: 'text/plain' }),
      }).then(r => r.json());
    }
    function optOut(on) { store.set('out', on ? '1' : null); if (on) { queue = []; keep(); } }

    return { track, flush: () => flush(false), submitScore, scores, setName, optOut, isOptedOut: out, device, session, dev, app };
  }
  root.Greglytics = { init, tester };
})(typeof window !== 'undefined' ? window : this);
