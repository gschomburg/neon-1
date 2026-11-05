// ---------------- Ads: every fake ad (dist/data/ads.js), drawn as text; "show" puts it up in the game ----------------
(() => {
  const $ = s => document.querySelector(s);
  if (typeof ADS === 'undefined') { $('#adBody').textContent = "Couldn't load ../dist/data/ads.js."; return; }
  const toGame = m => { try { $('#game').contentWindow.postMessage(Object.assign({ to: 'neon-game' }, m), '*'); } catch (e) { /* not loaded */ } };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let q = '';
  // one screen as the game draws it: ADS_W x ADS_H inside a frame, bars half full
  const screenHtml = (sc, n, of) => {
    const rows = [];
    for (let r = 0; r < ADS_H; r++) {
      const ln = sc[r];
      if (!ln) { rows.push(' '.repeat(ADS_W)); continue; }
      let t = (ln.t || '').replace(/{(r?)bar(?::(\d+))?(?::[\d.]+s)?}/g, (m, rev, w) => { const k = w ? +w : 10, f = Math.round(k / 2); return '[' + '#'.repeat(f) + '-'.repeat(k - f) + ']'; }).slice(0, ADS_W);
      const x = ln.x === 'c' ? Math.floor((ADS_W - t.length) / 2) : (ln.x || 0);
      const cls = ['s-' + (ln.c || 'text'), ln.b ? 'b' : '', ln.inv ? 'inv' : '', ln.btn ? 'btn' : ''].filter(Boolean).join(' ');
      const after = Math.max(0, ADS_W - x - t.length);
      rows.push(' '.repeat(x) + `<span class="${cls}"${ln.btn ? ` title="tap: closes the ad, then shows &quot;${esc(ln.btn)}&quot;"` : ''}>${esc(t)}</span>` + ' '.repeat(after));
    }
    const top = '+[ AD ]' + '-'.repeat(ADS_W + 2 - 7 - 3) + '[x]+';
    return `<div class="adscr"><div class="adn">screen ${n + 1} of ${of}</div><pre>${top}\n${rows.map(r => '| ' + r + ' |').join('\n')}\n+${'-'.repeat(ADS_W + 2)}+</pre></div>`;
  };
  const render = () => {
    const list = Object.entries(ADS).filter(([k, a]) => !q || (k + ' ' + a.name + ' ' + a.screens.flat().map(l => (l.t || '') + ' ' + (l.btn || '')).join(' ')).toLowerCase().includes(q));
    $('#adCount').textContent = `${list.length} of ${Object.keys(ADS).length} ads`;
    $('#adBody').innerHTML = list.map(([k, a]) => `<div class="adcard"><div class="adhead"><b>${esc(a.name)}</b> <span class="mono dim">${esc(k)}</span>
      <span class="dim">${a.screens.length} screen${a.screens.length > 1 ? 's' : ''}</span> <button data-ad="${esc(k)}">show in the game</button></div>
      <div class="adscreens">${a.screens.map((sc, n) => screenHtml(sc, n, a.screens.length)).join('')}</div></div>`).join('') || '<p>nothing matches.</p>';
  };
  $('#adFilter').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); render(); });
  $('#adBody').addEventListener('click', e => { const b = e.target.closest('button[data-ad]'); if (b) toGame({ type: 'test', act: 'ad', key: b.dataset.ad }); });
  $('#adRandom').addEventListener('click', () => { const ks = Object.keys(ADS); toGame({ type: 'test', act: 'ad', key: ks[Math.floor(Math.random() * ks.length)] }); });
  render();
})();
