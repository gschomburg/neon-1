// NeoN+1 engine/fx.js: the effects library (docs/EFFECTS.md). The shared building blocks (one hash, beats, picking,
// easing, colors) and the named effects built on them. Their settings are data/fx.js (FX_LOOKS).
// Needs engine/core.js (mixHex, C) and data/fx.js first. Used by the cutscene strips (engine/quests.js buildStrip),
// corrupted loot names (data/mods.js glitchName), G0D's mold glitch (engine/g0d.js), and G0D's eyes (the title:
// engine/scene.js; the eyes transition: engine/effects.js).
// (Particles, shakes and flashes are engine/effects.js: they work in pixels, not cells.)
'use strict';
NEON_FILES.push(['engine/fx.js', 'v14.77']);

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

  // ---------- the ticker: one line for text that doesn't fit (CLAUDE.md "Screen space") ----------
  // A beat on the start, then it scrolls a character every `ms`, around and around. t0: when it started showing.
  // Used by the UPLINK's rows (engine/runend.js), the tray's gear tips (engine/tray.js) and the map's node card.
  const TICK = { beat: 900, ms: 140 };
  function ticker(text, w, t0, now, gap = 5) {
    if (text.length <= w) return text;
    const full = text + ' '.repeat(gap), o = Math.max(0, Math.floor((now - t0 - TICK.beat) / TICK.ms)) % full.length;
    return (full + full).slice(o, o + w);
  }
  // Lines that take turns on one row: each up for `hold` ms, or until its ticker has gone round once (a long one).
  // Says { text, k } for now (k: which line).
  function swapLines(lines, w, t0, now, hold = 2600) {
    if (lines.length < 2) return { text: ticker(lines[0] || '', w, t0, now), k: 0 };
    const dur = s => s.length <= w ? hold : TICK.beat + (s.length + 5) * TICK.ms;
    const total = lines.reduce((a, s) => a + dur(s), 0);
    let t = (now - t0) % total, k = 0;
    while (t >= dur(lines[k])) { t -= dur(lines[k]); k++; }
    return { text: ticker(lines[k], w, now - t, now), k };
  }

  // ---------- smooth noise and the mask ----------
  // Value noise: smooth blobs (0-1) instead of one random number per cell. noise1: the same along one line (time).
  const smooth = t => t * t * (3 - 2 * t);
  function noise2(x, y, z = 0) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi);
    const a = hash(xi, yi, z), b = hash(xi + 1, yi, z), c = hash(xi, yi + 1, z), d = hash(xi + 1, yi + 1, z);
    const top = a + (b - a) * xf, bot = c + (d - c) * xf;
    return top + (bot - top) * yf;
  }
  const noise1 = (t, z = 0) => { const i = Math.floor(t), f = smooth(t - i), a = hash(i, 0, z + 31), b = hash(i + 1, 0, z + 31); return a + (b - a) * f; };
  // THE MASK (data/fx.js mask): where an effect sits, and how strongly. A cell's strength (0-1) at (X, Y), in the
  // content's own coordinates (so it rides along with scrolling). W = FX.look('mask', ...): rect [x, y, w, h] (none = all
  // of it), scale (blob size, cells), drift [x, y] (cells a second), density (how much is covered) swinging up and down
  // by `swing` over about swingMs, soft (the edge fade), strength (the most it gets), fade (ms to come in, from t = 0).
  function mask(W, X, Y, now, t = Infinity) {
    if (W.rect) { const [rx, ry, rw, rh] = W.rect; if (X < rx || Y < ry || X >= rx + rw || Y >= ry + rh) return 0; }
    const s = Math.max(0.5, W.scale), sec = now / 1000;
    const v = noise2((X + W.drift[0] * sec) / s, (Y + W.drift[1] * sec) * 2 / s, W.seed);   // (cells are twice as tall as wide: blobs come out round)
    const d = W.density + W.swing * (noise1(now / W.swingMs, W.seed) * 2 - 1);
    const k = W.soft > 0 ? clamp01((d - v) / W.soft) : v < d ? 1 : 0;
    return k * W.strength * (W.fade > 0 ? clamp01(t / W.fade) : 1);
  }
  const where = over => look('mask', over === true ? null : over);   // a place's `where` settings over the mask's

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

  // ---------- riding on a mask (an effect's `where`) ----------
  // Each takes a cell { ch, ink, X, Y } and its mask strength s (0-1). GLITCH: it swaps to a glitch mark now and then
  // (rate x s of the windows). FLICKER: it blinks off (share x s). TINT: its color pulls toward col (amount x s).
  function glitchOn(c, G, s, now) {
    if (s > 0 && hash(c.X, c.Y, step(now, G.ms) + 77) < s * G.rate) { c.ch = pick(G.set, hash(c.X, c.Y, step(now, G.ms))); c.ink = col(G.col); }
  }
  const flickerOff = (c, F, s, now) => s > 0 && hash(c.X, c.Y, step(now, F.ms) + 91) < s * F.share;
  function tint(c, T, s) { if (s > 0) c.ink = mixHex(c.ink.length === 7 ? c.ink : C.text, col(T.col), clamp01(s * T.amount)); }
  // Any of those over a list of screen cells ({ ch, cx, cy, col }): a new list. over = that effect's settings, with
  // `where` for its mask; origin [x, y] = where the content's (0, 0) is on screen now (so the mask scrolls with it);
  // t = ms since it started (for the mask's fade).
  function apply(cells, name, over, now = performance.now(), t = Infinity, origin = [0, 0]) {
    const E = look(name, over), W = where(E.where || true);
    return cells.map(c => {
      const s = mask(W, c.cx - origin[0], c.cy - origin[1], now, t);
      if (s <= 0) return c;
      const cell = { ch: c.ch, ink: c.col, X: Math.round(c.cx - origin[0]), Y: Math.round(c.cy - origin[1]) };
      if (name === 'flicker') return flickerOff(cell, E, s, now) ? Object.assign({}, c, { ch: ' ' }) : c;
      if (name === 'glitch') glitchOn(cell, E, s, now); else if (name === 'tint') tint(cell, E, s);
      return Object.assign({}, c, { ch: cell.ch, col: cell.ink });
    });
  }

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

  // DECRYPT: a line as ciphertext, `k` of its letters (0-1, each in its own order) already clear. The rest churn through
  // D.set: slowly at rest (idleMs), fast while it's decoding (fast: ms). seed: one per line (seedOf), so each scrambles its own way.
  function decrypt(text, k, seed = 0, now = performance.now(), fast = false, D = FX_LOOKS.decrypt) {
    const churn = step(now, fast ? D.ms : D.idleMs);
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      out += ch === ' ' || hash(i, seed, 7) < k ? ch : pick(D.set, hash(i, seed, churn));
    }
    return out;
  }
  // A steady number for a string (a codex key): decrypt's seed.
  const seedOf = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003; return h; };

  // ---------- G0D's eyes (data/fx.js eyes, eyewipe) ----------
  // The eyes, small to big: open and shut rows, and the pupil (its row, its middle column, how far it can look, its mark).
  // The small one can't look sideways: its pupil swaps marks instead.
  const EYE_ART = {
    small: { open: ['( )'], shut: ['(-)'], py: 0, px: 1, range: 0, pupil: 'o', glance: 'o@O' },
    mid: { open: ['(   )'], shut: ['(---)'], py: 0, px: 2, range: 1, pupil: 'o' },
    big: { open: ['.-~~~-.', '(     )', "'-~~~-'"], shut: ['.-~~~-.', '(-----)', "'-~~~-'"], py: 1, px: 3, range: 2, pupil: '@' },
  };
  const eyeSize = kind => { const A = EYE_ART[kind]; return [A.open[0].length, A.open.length]; };
  // One eye's marks right now: [{ x, y, ch, col, bold }] (x, y from its top-left). e = { kind, t0, life, seed, still }:
  // it glitches in over E.inMs (each cell settling on its own), looks around (not when still) and blinks, glitches now
  // and then, and glitches out over the last E.outMs. Nothing before t0 or after t0 + life.
  function eyeMarks(e, E, now) {
    const age = now - e.t0;
    if (!(age >= 0 && age <= e.life)) return [];
    const A = EYE_ART[e.kind], s = e.seed, red = col(E.col), rim = mixHex(C.bg, red, E.rim), left = e.life - age;
    const live = age > E.inMs && left > E.outMs;
    const shut = live && (age + hash(s, 41) * E.blinkEvery) % E.blinkEvery < E.blinkMs;
    const g = step(age, E.look), look = e.still || hash(g, s, 43) < 0.4 ? 0 : Math.round((hash(g, s, 44) * 2 - 1) * A.range);
    const pupil = A.glance && !e.still && hash(g, s, 45) < 0.5 ? pick(A.glance, hash(g, s, 46)) : A.pupil;
    const rows = shut ? A.shut : A.open, out = [];
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      const inAt = hash(x, y, s + 51) * E.inMs, outAt = hash(x, y, s + 52) * E.outMs;
      if (age < inAt * 0.4 || left < outAt * 0.4) return;   // not in yet / gone already
      const noisy = age < inAt || left < outAt || hash(x, y, step(now, E.ms) + s) < E.glitch;
      const eye = !shut && y === A.py && x === A.px + look;
      if (noisy) out.push({ x, y, ch: pick(E.set, hash(x, y, step(now, E.ms) + s + 7)), col: red, bold: false });
      else if (eye) out.push({ x, y, ch: pupil, col: red, bold: true });
      else if (ch !== ' ') out.push({ x, y, ch, col: rim, bold: false });
    }));
    return out;
  }
  // Eyes coming and going in an area (x, y, w, h), only where free(x, y, w, h) says the spot is clear. A slot comes up
  // every E.every ms; `share` of them get an eye, of `big` / `mid` / small size, living life[0] + up to life[1] ms; each
  // tries a few spots. Older eyes keep their spots. `anywhere` of them skip free() and land on anything (the UI too).
  // Calls put(x, y, ch, col, bold) for every mark, and cover(x, y, w, h) for an eye on top of things (clear under it).
  function eyes(E, now, x0, y0, w, h, free, put, cover) {
    if (typeof reduced === 'function' && reduced()) return;   // (reduced motion: no eyes)
    const maxLife = E.life[0] + E.life[1], taken = [];
    for (let n = step(now - maxLife, E.every) - 1; n <= step(now, E.every); n++) {
      if (hash(n, 21, E.seed) >= E.share) continue;
      const t0 = (n + hash(n, 22, E.seed)) * E.every, life = E.life[0] + hash(n, 23, E.seed) * E.life[1];
      if (now < t0 || now > t0 + life) continue;
      const over = hash(n, 47, E.seed) < (E.anywhere || 0), k = hash(n, 24, E.seed), kind = k < E.big ? 'big' : k < E.big + E.mid ? 'mid' : 'small', [ew, eh] = eyeSize(kind);
      for (let tr = 0; tr < 6; tr++) {
        const x = x0 + Math.floor(hash(n, 25 + tr, E.seed) * (w - ew + 1)), y = y0 + Math.floor(hash(n, 35 + tr, E.seed) * (h - eh + 1));
        if (taken.some(([tx, ty, tw, th]) => x < tx + tw + 1 && tx < x + ew + 1 && y < ty + th && ty < y + eh)) continue;
        if (!over && !free(x - 1, y - 1, ew + 2, eh + 2)) continue;   // (a clear ring around it, so it sits in empty space)
        taken.push([x, y, ew, eh]);
        const marks = eyeMarks({ kind, t0, life, seed: n }, E, now);
        if (over && marks.length && cover) cover(x, y, ew, eh);
        for (const m of marks) put(x + m.x, y + m.y, m.ch, m.col, m.bold);
        break;
      }
    }
  }
  // Eyes over a list of screen cells ({ ch, cx, cy }) in an area: a new list, the eyes added (own 'fx') and anything
  // under an `anywhere` eye gone.
  function eyeCells(cells, E, now, x0, y0, w, h) {
    const used = new Set(cells.map(c => Math.round(c.cx) + ',' + Math.round(c.cy))), out = [], gone = new Set();
    const free = (x, y, fw, fh) => { for (let yy = y; yy < y + fh; yy++) for (let xx = x; xx < x + fw; xx++) if (used.has(xx + ',' + yy)) return false; return true; };
    const cover = (x, y, cw, ch) => { for (let yy = y; yy < y + ch; yy++) for (let xx = x; xx < x + cw; xx++) gone.add(xx + ',' + yy); };
    eyes(E, now, x0, y0, w, h, free, (cx, cy, ch, ink, bold) => out.push({ ch, cx, cy, col: ink, own: 'fx', bold }), cover);
    return (gone.size ? cells.filter(c => !gone.has(Math.round(c.cx) + ',' + Math.round(c.cy))) : cells).concat(out);
  }

  // hs: a fast hash of one number to [0, 1) (G0D's looks, the mold: was G0D_LOOKS.hs). The other hashes in the game give
  // other numbers, so they stay where they are (swapping one would change a look): h01 (engine/corpkit.js), hash2
  // (engine/effects.js, the wipes), hh (engine/bench.js), decodeDelay (engine/scene.js).
  const hs = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  return { hs, hash, pick, step, cycle, clamp01, easeOut, col, look, ticker, swapLines, decrypt, seedOf, noise1, noise2, mask, where, glitchOn, flickerOff, tint, apply, order, orderRow, reveal, boxIn, blink, cue, lights, ember, spin,
    glow, glowCone, glowCell, glowWash, tear, swapOn, burst, burstCh, burstCells, tics, putTics, smoke, fogRows, garble,
    EYE_ART, eyeSize, eyeMarks, eyes, eyeCells };
})();

// ---------- The M0LD's colors (moved here from engine/g0d.js: the fight, heaven, HAD3S, the wipes and events use them) ----------
// ---------------- Over a screen ----------------
// ---------------- THE MOLD's colors: one place for every mold in the game (the user, 2026-10-31) ----------------
// Tweak them here and every mold follows: the G0D fight, the wake-up, his death, the fake win, the final stand, the
// sector M0LD (light and deep), CERBERUS, the maze's edges, the spill, the editor's g0d tab.
// ramps: four shades, thin to thick (steps: the thickness where each starts), one ramp per stage of how close G0D is
// (it goes gradually more yellow): 0 green (sector 1's M0LD, CERBERUS, the wake-up, the fight's stage 1, the maze),
// 1 yellower (heaven's deep M0LD, CERBERUS's boss layer, the fight's stage 2), 2 amber (the fight's stage 3, his
// death, the fake win and the final stand that come out of it). fresh: new growth. clue: the cyan over a buried eye.
const MOLD = {
  ramps: [['#4f6120', '#6f8a2a', '#9fc13a', '#c3e34e'], ['#5a6420', '#848e28', '#b8bd38', '#e2df58'], ['#62521e', '#917228', '#c69834', '#f0c252']],
  steps: [1.6, 2.5, 3.4],
  fresh: '#d8ff70',
  clue: '#5fe0d8',
};
const moldMixCache = new Map();
function moldMix(a, b, k) {   // a hex color k of the way to b (cached)
  const key = a + b + k; let v = moldMixCache.get(key); if (v) return v;
  const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)), A = p(a), B = p(b);
  v = '#' + A.map((c, i) => Math.round(c + (B[i] - c) * k).toString(16).padStart(2, '0')).join('');
  moldMixCache.set(key, v); return v;
}
// The mold's color at a thickness (0-5), a stage (0-2), and how much of the clue's cyan (0-1)
function moldCol(th, stage = 0, clue = 0) {
  const r = MOLD.ramps[clamp(stage | 0, 0, MOLD.ramps.length - 1)], s = MOLD.steps, c = r[th < s[0] ? 0 : th < s[1] ? 1 : th < s[2] ? 2 : 3];
  return clue > 0.04 ? moldMix(c, MOLD.clue, Math.round(clue * 20) / 20) : c;
}

// ---------------- Seq: the cutscenes' shared timing pieces (G0D waking, dying, the fake win, the stand's hole, the end) ----------------
// Each cutscene keeps its own timing table (G0D_WAKE, G0D_DIE... in engine/heaven.js, tuned by eye) and its own state.
// cue(state, e): say(key, at, fn) runs fn once, the first frame e >= at (state.said remembers which ran).
// canSkip(e, beat): a tap may skip it (G0DF.tapSkip on, and the first beat has passed).
// skipTip(e, beat): the dim "tap to skip" cells, bottom right of the board (none when a tap can't skip).
const Seq = {
  cue: (state, e) => (k, at, fn) => { if (e >= at && !state.said[k]) { state.said[k] = true; fn(); } },
  canSkip: (e, beat) => !!G0DF.tapSkip && e > beat,
  skipTip: (e, beat) => {
    if (!Seq.canSkip(e, beat)) return [];
    const tip = 'tap to skip';
    return [...tip].map((ch, k) => ({ ch, cx: L.wc - tip.length + k, cy: BOARD_Y + L.gh - 1, col: C.dim, own: 'fx', bold: false }));
  },
};
