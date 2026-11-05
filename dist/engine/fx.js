// NeoN+1 engine/fx.js: the effects library (docs/EFFECTS.md). The shared building blocks (one hash, beats, picking,
// easing, colors) and the named effects built on them. Their settings are data/fx.js (FX_LOOKS).
// Needs engine/core.js (mixHex, C) and data/fx.js first. Used by the cutscene strips (engine/quests.js buildStrip),
// corrupted loot names (data/mods.js glitchName) and G0D's mold glitch (engine/g0d.js).
// (Particles, shakes and flashes are engine/effects.js: they work in pixels, not cells.)
'use strict';
NEON_FILES.push(['engine/fx.js', 'v14.34']);

const FX = (() => {
  // ---------- building blocks ----------
  // The one hash: a steady 0-1 for (x, y, z). Put a time step in z for something that changes every so often.
  const hash = (x, y, z = 0) => ((((x + 11) * 73856093) ^ ((y + 7) * 19349663) ^ ((z + 3) * 83492791)) >>> 0) % 1000 / 1000;
  const pick = (set, h) => set[Math.floor(h * set.length)];
  const step = (now, ms) => Math.floor(now / ms);                                    // a number that ticks every ms
  const cycle = (set, now, ms, off = 0) => set[(step(now, ms) + off) % set.length];   // a mark that cycles through set
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const easeOut = k => 1 - Math.pow(1 - k, 3);
  // A color: '#hex', a palette name (C.*), or 'ink:<hacker id>' for a hacker's ink.
  const col = c => c && c[0] === '#' ? c : c && c.startsWith('ink:') ? hkInk(c.slice(4)) : C[c] || C.text;
  // A look: the named settings, with a place's own over them (true = as they are).
  const look = (name, over) => over && typeof over === 'object' ? Object.assign({}, FX_LOOKS[name], over) : FX_LOOKS[name];

  // ---------- drawing in ----------
  // When a mark lands, 0-1 of the draw-in: by its row (rel: 0 top, 1 bottom; from: 'top' or 'bottom'), plus jitter.
  const order = (rel, from, X, Y) => FX_LOOKS.reveal.pos * (from === 'top' ? rel : 1 - rel) + FX_LOOKS.reveal.jitter * hash(X, Y);
  const orderRow = (rel, from) => FX_LOOKS.reveal.pos * (from === 'top' ? rel : 1 - rel);   // (a row's earliest mark)
  // A cell { ch, ink, X, Y } at draw-in progress p: false = not in yet. fl / gl = the flicker / glitch looks, or null.
  function reveal(c, p, ord, fl, gl, now) {
    if (p >= 1) return true;
    if (p < ord) return false;
    const fresh = p - ord;
    if (fl && fresh < fl.window && hash(c.X, c.Y, step(now, fl.ms)) < fl.share) return false;
    if (gl && fresh < gl.window) { c.ch = pick(gl.set, hash(c.X, c.Y, step(now, gl.ms))); c.ink = col(gl.col); }
    else if (fresh < FX_LOOKS.reveal.flash) c.ink = col(FX_LOOKS.reveal.flashCol);
    return true;
  }
  const boxIn = (p, r, now) => p < 1 ? (hash(r, 1, step(now, FX_LOOKS.reveal.boxMs)) < p ? 1 : 0) : 1;   // a logo's color block, row r

  // ---------- on and off ----------
  // BLINK: the mark to show for match position i right now, or null.
  function blink(B, now, i) {
    const per = B.every, n = step(now, per), ph = now % per - hash(n, 9) * per * B.drift, ms = B.ms;
    return (ph >= 0 && ph < ms) || (hash(n, 4) < B.twice && ph >= ms * 2 && ph < ms * 3) ? B.to[i] : null;
  }
  // CUE: `since` = ms since its word typed in. false = hidden this frame. (cc, r: the mark's place in its row, for the swap.)
  function cue(c, Q, since, now, cc, r) {
    if (!(since >= 0)) return false;
    c.ink = col(Q.col);
    if (since < Q.glitchMs) {
      if (hash(c.X, c.Y, step(now, Q.hideMs)) < Q.hide) return false;
      if (hash(c.X, c.Y, step(now, Q.swapMs)) < Q.swap) c.ch = pick(Q.set, hash(cc, r, step(now, Q.swapMs)));
    } else if (hash(0, 0, step(now, Q.every)) < Q.share && step(now, Q.flickMs) % 3 === 0) return false;
    return true;
  }
  // LIGHTS: a light mark goes on and off, or breathes.
  function lights(c, Lt, now) {
    if (!Lt.ch.includes(c.ch)) return;
    const h = hash(c.Y, c.X), lit = col(Lt.col), lv = Lt.level, [b0, b1] = Lt.breathe;
    if (Lt.pulse && h < Lt.pulse) c.ink = mixHex(C.dim, lit, (b0 + b1 * (0.5 + 0.5 * Math.sin(now / Lt.period * 6.283 + h * 40))) * lv);
    else if (hash(c.X, c.Y, Math.floor((now + h * Lt.rate) / Lt.rate)) >= Lt.off) c.ink = mixHex(C.dim, lit, lv);
    else { c.ink = C.dim; if (Lt.offCh) c.ch = Lt.offCh; }
  }
  // EMBER: one mark glows up now and then.
  function ember(c, E, now) {
    const ph = (now + 1000 * hash(c.X, c.Y)) % E.every;
    if (ph < E.ms) c.ink = mixHex(c.ink.length === 7 ? c.ink : C.text, col(E.col), Math.sin(Math.PI * ph / E.ms));
  }
  // SPIN: the mark for row r right now.
  const spin = (S, now, r) => cycle(S.set, now, S.ms, r);

  // ---------- light ----------
  // GLOW: null before it's on; else { G, k: its stutter (1 = full) } for glowCone / glowCell / the wash.
  function glow(G, now, t, dur) {
    if (!G || !(t > dur * G.after)) return null;
    return { G, k: hash(1, 2, step(now, G.flickMs)) < G.flickShare ? G.dimTo : 1 };
  }
  function glowCone(g, X, Y) {   // 0-1: how lit (X, Y) is
    if (!g) return 0;
    const G = g.G, d = Y - G.y;
    if (d < 1 || d > G.rows || Math.abs(X - G.x) > d * G.spread) return 0;
    return (1 - (d - 1) / G.rows) * g.k;
  }
  function glowCell(c, g) {
    const G = g.G;
    if (c.X === G.x && c.Y === G.y) { c.ink = mixHex(C.bright, col(G.col), G.srcMix * g.k + G.srcBase); return; }
    const k = glowCone(g, c.X, c.Y);
    if (k > 0) c.ink = mixHex(c.ink, mixHex(C.bright, col(G.col), G.srcMix), G.lit * k);
  }
  // The wash: calls wash(X0, Y, w, color, alpha) for each row of the cone.
  function glowWash(g, wash) {
    const G = g.G;
    for (let d = 1; d <= G.rows; d++) {
      const half = Math.round(d * G.spread);
      wash(G.x - half, G.y + d, half * 2 + 1, col(G.col), G.alpha * (1 - (d - 1) / G.rows) * g.k);
    }
  }

  // ---------- noise ----------
  // TEAR: -1, 0 or 1: how far row r jumps right now.
  function tear(T, now, r) {
    const k = step(now, T.every);
    return now % T.every < T.ms && hash(k, r, 2) < T.share ? (hash(k, r, 4) < 0.5 ? -1 : 1) : 0;
  }
  // SWAP: true while the swap window is open.
  const swapOn = (S, now) => now % S.every < S.ms && hash(step(now, S.every), 11) < S.share;
  // BURST: this window's cluster in an area (x, y, w, h), or null. burstCh: the noise mark at (X, Y), or null.
  function burst(B, now, x, y, w, h) {
    if (now % B.every >= B.ms) return null;
    const k = step(now, B.every);
    return { B, k, bx: x + hash(k, 5) * w, by: y + hash(k, 6) * h, rad: B.size[0] + hash(k, 7) * B.size[1] };
  }
  function burstCh(b, X, Y) {
    if (!b || Math.hypot((X - b.bx) / 2, Y - b.by) >= b.rad || hash(X * 13 + Y * 7, b.k) <= b.B.gaps) return null;
    return pick(b.B.set, hash(X + Y, b.k));
  }
  // TICS on a block of text rows (a hacker's logo: the rival card, the death screen). T = FX.look('tics', ...): { swap,
  // col, tear, burst }. Gives each row's { tear: cells to shift it, marks: [[i, ch, ink]] to draw over it right now }.
  // (The cutscenes do the same per cell in buildStrip, engine/quests.js: keep the two alike.)
  function tics(rows, T, now) {
    const w = Math.max(0, ...rows.map(r => r.length)), ink = col(T.col), TR = look('tear', T.tear);
    const b = burst(look('burst', T.burst), now, 0, 0, w, rows.length), sw = T.swap && swapOn(FX_LOOKS.swap, now);
    return rows.map((row, r) => {
      const marks = [];
      for (let i = 0; i < row.length; i++) {
        if (row[i] === ' ') continue;
        let ch = null;
        if (sw) { const p = T.swap.find(s => s[0] === row[i]); if (p) ch = p[1]; }
        ch = burstCh(b, i, r) || ch;
        if (ch) marks.push([i, ch, ink]);
      }
      return { tear: tear(TR, now, r), marks };
    });
  }
  // Draws a row with its tics: the plain marks, then the changed ones over the gaps left for them.
  function putTics(put, x, y, text, tk, fg, own = 'hud', bold = true) {
    if (!tk) return put(x, y, text, fg, own, bold);
    const s = [...text];
    for (const [i] of tk.marks) if (i < s.length) s[i] = ' ';
    put(x + tk.tear, y, s.join(''), fg, own, bold);
    for (const [i, ch, ink] of tk.marks) if (i < text.length) put(x + tk.tear + i, y, ch, ink, own, bold);
  }
  // A burst over any list of screen cells ({ ch, cx, cy, col }): a new list, the ones in it swapped to noise.
  function burstCells(cells, B, now, x, y, w, h) {
    const b = burst(B, now, x, y, w, h);
    if (!b) return cells;
    const ink = col(B.col);
    return cells.map(c => { const ch = burstCh(b, c.cx, c.cy); return ch ? Object.assign({}, c, { ch, col: ink }) : c; });
  }

  // ---------- drifting things ----------
  // SMOKE: calls put(X, Y, ch, ink) for each puff (X may be fractional).
  function smoke(S, now, put) {
    for (let n = step(now, S.every); n * S.every > now - S.life; n--) {
      const age = (now - n * S.every) / S.life;
      if (age < 0 || age > 1) continue;
      const X = S.x + S.dx * age + Math.sin(n * 1.7 + age * 6) * S.wobble, Y = Math.round(S.y + S.dy * age);
      put(X, Y, age < 0.18 ? (n % 2 ? '"' : '~') : age < 0.6 ? '~' : age < 0.85 ? '-' : '.', mixHex(C.mid, C.bg, age * S.fade));
    }
  }
  // FOG: rows of dots and colons, w wide, for rows f.rows[0]..f.rows[1].
  function fogRows(f, now, w) {
    const off = Math.floor(now / 1000 * f.drift), out = [];
    for (let y = f.rows[0]; y <= f.rows[1]; y++) {
      let s = '';
      for (let x = 0; x < w; x++) { const v = hash(x + off, y, 5); s += v < f.density * f.colons ? ':' : v < f.density ? '.' : ' '; }
      out.push(s);
    }
    return out;
  }

  // ---------- text ----------
  // GARBLE: one of a few versions of a line, some letters glitched, a little different every moment.
  function garble(alts, seed = 0, G = FX_LOOKS.garble, now = performance.now()) {
    const f = step(now, G.ms), base = alts[Math.floor(now / G.swapMs + seed) % alts.length];
    let out = '';
    for (let i = 0; i < base.length; i++) out += base[i] !== ' ' && hash(i, f, seed) < G.share ? pick(G.set, hash(i, f, seed + 50)) : base[i];
    return out;
  }

  return { hash, pick, step, cycle, clamp01, easeOut, col, look, order, orderRow, reveal, boxIn, blink, cue, lights, ember, spin,
    glow, glowCone, glowCell, glowWash, tear, swapOn, burst, burstCh, burstCells, tics, putTics, smoke, fogRows, garble };
})();
