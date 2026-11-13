// NeoN+1 tools/endcard/endcard.js: the trailer's end card (Greg, 2026-11-13). 8 seconds at 139 x 38 cells (a 4K frame
// at the captures' text size):
//   1. the block NEON and the logotype build in out of black with the game's wipe (engine/effects.js applyWipe);
//   2. they sit a beat, with the intro card's shine and row glitch (engine/intro.js introCard);
//   3. trace wires grow out of the block letters, mostly left and right, some up and down to reach the edges (like
//      G0D's traces, engine/g0dfight.js g0dfTraceTick, but cyan, and they stay);
//   4. mold comes up in patches along the wires, all over, to about half the screen, never on the art.
// The art is asXii's (asxii_art/neon_1_4k_v03: layers NeoN_fullscreen and neon_title), bundled by render.js into
// endcard_art.js. Needs (endcard.html): dist/data/palettes.js, engine/core.js, data/fx.js, engine/fx.js,
// engine/effects.js, endcard_art.js.
(() => {
  'use strict';
  const W = 139, H = 38, FPS = 60, STEP = 1000 / FPS;

  // ---------- the look and the timing (ms from the start) ----------
  const P = {
    dur: 8000,
    seed: 7,
    wipeAt: 120,            // the wipe starts (the frames before it are black)
    copyAt: 1250, key: 38,  // "network intrusion // prototype" types in
    shine: 2600, glitch: 1900, glitchMs: 110,   // the intro card's shine and row glitch (engine/intro.js INTRO_CARD_FX)
    wires: { at: 1900, full: 5200, rate: [6, 40], speed: [20, 46], len: [14, 72], turn: 0.12, branch: 0.035, fromWire: 0.5, max: 340 },
    mold: { at: 3000, full: 7400, cover: 0.5, r: [1.3, 3.4], grow: 1100, amp: [2.2, 4.6], tone: 0.72, keep: [5, 2], pick: 8 },
    wireTone: 0.34,         // the wires: this far from the background to the accent (the intro's are 0.35)
    keep: [2, 1],           // the clean margin around the art (cells across, rows down)
  };

  // ---------- seeded random (the same card every run) ----------
  let seed = 1;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const between = ([a, b], k = rnd()) => a + (b - a) * k;
  const ease = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
  const idx = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? -1 : y * W + x;

  // ---------- the art ----------
  const ART = window.ENDCARD_ART;
  const art = new Array(W * H).fill(null);   // { ch, kind: block | rule | fill | title | copy, row }
  let blockRows = 0, copy = null;
  for (const l of ART.layers) {
    const title = /title/i.test(l.name);
    l.rows.forEach((row, ry) => {
      const s = row.trim();
      if (title && /^[a-z/ ]+$/.test(s)) { copy = { x: l.x + row.indexOf(s), y: l.y + ry, text: s }; return; }   // the copy line types in
      [...row].forEach((ch, rx) => {
        const k = idx(l.x + rx, l.y + ry);
        if (ch === ' ' || k < 0) return;
        const kind = title ? 'title' : ';:.'.includes(ch) ? 'fill' : ch === '_' && /^_+$/.test(s) ? 'rule' : 'block';
        art[k] = { ch, kind, row: title ? 100 + ry : ry };
      });
      if (!title) blockRows = Math.max(blockRows, ry + 1);
    });
  }
  // The clean area: the art and a margin round it (no wires, no mold). The copy line counts as art.
  const keep = new Uint8Array(W * H), isArt = k => art[k] || (copy && Math.floor(k / W) === copy.y && k % W >= copy.x && k % W < copy.x + copy.text.length);
  for (let k = 0; k < W * H; k++) if (isArt(k)) {
    const x = k % W, y = Math.floor(k / W);
    for (let dy = -P.keep[1]; dy <= P.keep[1]; dy++) for (let dx = -P.keep[0]; dx <= P.keep[0]; dx++) { const j = idx(x + dx, y + dy); if (j >= 0) keep[j] = 1; }
  }
  // The mold keeps further off (the logos stay clean, the wires can come in closer)
  const keepMold = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) if (isArt(k)) {
    const x = k % W, y = Math.floor(k / W);
    for (let dy = -P.mold.keep[1]; dy <= P.mold.keep[1]; dy++) for (let dx = -P.mold.keep[0]; dx <= P.mold.keep[0]; dx++) { const j = idx(x + dx, y + dy); if (j >= 0) keepMold[j] = 1; }
  }
  // Where wires start: the cells just outside the block letters' clean area. Sides first (left / right), then top / bottom.
  const sides = [], ends = [];
  let ax0 = W, ax1 = 0;
  for (let k = 0; k < W * H; k++) if (art[k] && art[k].kind !== 'title') { ax0 = Math.min(ax0, k % W); ax1 = Math.max(ax1, k % W); }
  const mid = (ax0 + ax1) / 2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = idx(x, y); if (keep[k]) continue;
    if (keep[idx(x + 1, y)] || keep[idx(x - 1, y)]) sides.push([x, y, x < mid ? -1 : 1, 0]);
    else if (keep[idx(x, y + 1)] || keep[idx(x, y - 1)]) ends.push([x, y, 0, keep[idx(x, y + 1)] ? -1 : 1]);
  }

  // ---------- the simulation (fixed steps, so a frame is always the same) ----------
  const CORNER = { '1,0>0,1': '╮', '1,0>0,-1': '╯', '-1,0>0,1': '╭', '-1,0>0,-1': '╰', '0,1>1,0': '╰', '0,1>-1,0': '╯', '0,-1>1,0': '╭', '0,-1>-1,0': '╮' };   // (engine/g0dfight.js G0DF_CORNER)
  let S;
  function reset() {
    seed = P.seed;
    S = { t: 0, wire: new Array(W * H).fill(null), born: new Float32Array(W * H), traces: [], wireCells: [], acc: 0,
      seeds: [], m: new Float32Array(W * H), mAcc: 0, cover: 0 };
    st.wipe = null;
  }
  function spawnTrace(x, y, dx, dy, out) {
    if (S.traces.filter(t => !t.done).length >= P.wires.max) return;
    const heat = ease((S.t - P.wires.at) / (P.wires.full - P.wires.at));
    S.traces.push({ x, y, dx, dy, acc: 0, n: 0, len: Math.round(between(P.wires.len, 0.3 * rnd() + 0.7 * heat)), speed: between(P.wires.speed, rnd() * (0.4 + 0.6 * heat)), out: out || [x, y], done: false });
    lay(x, y, dx ? '─' : '│');
  }
  function lay(x, y, ch) {
    const k = idx(x, y);
    if (S.wire[k] && S.wire[k] !== ch) ch = '┼';
    if (!S.wire[k]) { S.born[k] = S.t; S.wireCells.push(k); }
    S.wire[k] = ch;
  }
  function stepWires(dt) {
    const Wc = P.wires;
    if (S.t >= Wc.at) {
      const heat = ease((S.t - Wc.at) / (Wc.full - Wc.at));
      S.acc += dt / 1000 * between(Wc.rate, heat);
      while (S.acc >= 1) {
        S.acc -= 1;
        if (S.wireCells.length > 20 && rnd() < Wc.fromWire * heat) {   // a new branch off a wire already out there (to reach the edges)
          const k = S.wireCells[Math.floor(rnd() * S.wireCells.length)], x = k % W, y = Math.floor(k / W);
          const vert = rnd() < 0.55, s = rnd() < 0.5 ? 1 : -1;
          spawnTrace(x, y, vert ? 0 : s, vert ? s : 0, [x - (vert ? 0 : s), y - (vert ? s : 0)]);
        } else {
          const list = rnd() < 0.78 || !ends.length ? sides : ends, [x, y, dx, dy] = list[Math.floor(rnd() * list.length)];
          spawnTrace(x, y, dx, dy, [x - dx, y - dy]);
        }
      }
    }
    for (const t of S.traces) {
      if (t.done) continue;
      t.acc += dt / 1000 * t.speed * (t.dy ? 0.55 : 1);   // (cells are tall: down is slower, as G0D's)
      while (t.acc >= 1 && !t.done) {
        t.acc -= 1;
        if (t.n >= t.len) { t.done = true; break; }
        let { dx, dy } = t;
        if (rnd() < P.wires.turn) {   // a turn, mostly away from where it came out (G0D's outward traces)
          const away = rnd() < 0.8, coin = rnd() < 0.5 ? 1 : -1;
          const nd = dx ? [0, away ? Math.sign(t.y - t.out[1]) || coin : coin] : [away ? Math.sign(t.x - t.out[0]) || coin : coin, 0];
          S.wire[idx(t.x, t.y)] = CORNER[dx + ',' + dy + '>' + nd[0] + ',' + nd[1]] || '┼';
          [dx, dy] = nd; t.dx = dx; t.dy = dy;
        }
        const nx = t.x + dx, ny = t.y + dy, k = idx(nx, ny);
        if (k < 0 || keep[k]) { t.done = true; break; }   // the edge of the screen, or the art's clean area
        t.x = nx; t.y = ny; t.n++;
        lay(nx, ny, dx ? '─' : '│');
        if (rnd() < P.wires.branch) spawnTrace(nx, ny, dy ? (rnd() < 0.5 ? 1 : -1) : 0, dx ? (rnd() < 0.5 ? 1 : -1) : 0, t.out);
      }
    }
  }
  // Mold: patches that come up on wire cells anywhere (not out of the middle), each growing to its size, until about
  // P.mold.cover of the free screen is mold. Ragged edges (a hash on the distance).
  const free = (() => { let n = 0; for (let k = 0; k < W * H; k++) if (!keepMold[k]) n++; return n; })();
  function stepMold(dt) {
    const M = P.mold;
    if (S.t < M.at || !S.wireCells.length) return;
    const target = M.cover * ease((S.t - M.at) / (M.full - M.at));
    S.mAcc += dt;
    if (S.mAcc >= 50) {   // a few new patches a tick while short of the target
      S.mAcc = 0;
      for (let i = 0; i < 3 && S.cover + 0.004 * S.seeds.filter(s => S.t - s.t0 < M.grow).length < target; i++) {
        let k = -1, best = -1;
        for (let c = 0; c < M.pick; c++) {   // of a few wire cells, the one furthest from the patches so far (an even spread)
          const j = S.wireCells[Math.floor(rnd() * S.wireCells.length)]; if (keepMold[j]) continue;
          const x = j % W, y = Math.floor(j / W);
          let d = 1e9; for (const p of S.seeds) d = Math.min(d, Math.hypot((x - p.x) / 2.2, y - p.y));
          if (d > best) { best = d; k = j; }
        }
        if (k < 0) continue;
        S.seeds.push({ x: k % W, y: Math.floor(k / W), r: between(M.r), amp: between(M.amp), t0: S.t });
      }
    }
    // the thickness field, from every patch as it grows
    S.m.fill(0);
    for (const s of S.seeds) {
      const r = s.r * (0.25 + 0.75 * ease((S.t - s.t0) / M.grow));
      for (let y = Math.floor(s.y - r); y <= Math.ceil(s.y + r); y++) for (let x = Math.floor(s.x - r * 2.2); x <= Math.ceil(s.x + r * 2.2); x++) {
        const k = idx(x, y); if (k < 0 || keepMold[k]) continue;
        const d = Math.hypot((x - s.x) / 2.2, y - s.y) / r * (0.75 + 0.5 * FX.hash(x, y, 5)); if (d >= 1) continue;
        S.m[k] = Math.min(5, S.m[k] + s.amp * (1 - d * d));
      }
    }
    let n = 0; for (let k = 0; k < W * H; k++) if (S.m[k] >= 0.6) n++;
    S.cover = n / free;
  }
  function advance(t) {
    while (S.t + STEP <= t + 1e-6) { S.t += STEP; stepWires(STEP); stepMold(STEP); }
  }

  // ---------- one frame's cells ----------
  // A cell: { ch, cx, cy, col, bold } (the game's own cell shape, so applyWipe can work on them)
  function artCells(t) {
    const out = [], shine = ((t % P.shine) / P.shine) * (H + 60) - 10;   // a diagonal band, top-left to bottom-right
    const g = Math.floor(t / P.glitch), glitching = t > 1000 && (t % P.glitch) < P.glitchMs;
    const gRow = glitching ? Math.floor(FX.hash(g, 3, 9) * (blockRows + 5)) : -1;   // a row of the block, or of the logotype
    const gTitle = gRow >= blockRows ? 100 + gRow - blockRows : -1;
    for (let k = 0; k < W * H; k++) {
      const a = art[k]; if (!a) continue;
      const x = k % W, y = Math.floor(k / W), lit = Math.abs(x / 2.2 + y - shine) < 1.6;
      const shift = a.row === gRow || a.row === gTitle ? (g % 2 ? 1 : -1) : 0;
      const ch = shift && Math.random() < 0.25 ? noiseCh() : a.ch;
      let col, bold = false;
      if (a.kind === 'rule') col = C.dim;
      else if (a.kind === 'fill') col = lit ? C.accent : C.dim;
      else if (a.kind === 'title') { col = lit ? C.accent : C.bright; bold = true; }
      else { col = lit ? C.bright : C.accent; bold = lit; }
      out.push({ ch, cx: x + shift, cy: y, col, bold });
    }
    if (copy) {
      const n = Math.max(0, Math.min(copy.text.length, Math.floor((t - P.copyAt) / P.key)));
      const s = copy.text.slice(0, n) + (n > 0 && n < copy.text.length ? '_' : '');
      [...s].forEach((ch, i) => { if (ch !== ' ') out.push({ ch, cx: copy.x + i, cy: copy.y, col: ch === '_' ? C.accent : C.mid }); });
    }
    return out;
  }
  function worldCells(t) {
    const out = [], trace = mixHex(C.bg, C.accent, P.wireTone), heads = new Set();
    for (const tr of S.traces) if (!tr.done) heads.add(idx(tr.x, tr.y));
    for (let k = 0; k < W * H; k++) {
      const x = k % W, y = Math.floor(k / W), m = S.m[k], w = S.wire[k];
      if (m >= 0.6 && !(w && m < 1.4)) {   // mold (thin mold lets a wire show through, tinted)
        const ch = FX.pick(FX_LOOKS.moldwipe.set, FX.hash(x, y, FX.step(t, 140)));
        out.push({ ch, cx: x, cy: y, col: mixHex(C.bg, moldCol(m), P.mold.tone) });
      } else if (w) {
        const age = t - S.born[k];
        const col = heads.has(k) ? C.bright : m >= 0.6 ? mixHex(C.bg, moldCol(m), P.mold.tone) : age < 260 ? mixHex(trace, C.accent, 1 - age / 260) : trace;
        out.push({ ch: heads.has(k) ? '•' : w, cx: x, cy: y, col });
      }
    }
    return out;
  }
  function cellsAt(t) {
    advance(t);
    let cells = worldCells(t).concat(artCells(t));
    if (t < P.wipeAt) return [];
    // the wipe: the game's own, from black (no old screen), building the card in
    const w0 = P.wipeAt, T = WIPE_TIME[0];
    const tIn = w0 + T.travel * CONFIG.wipeOverlap / CONFIG.wipeSpeed;
    const done = tIn + (T.travel + T.decay * 1.3 + CONFIG.wipeStagger) / CONFIG.wipeSpeed;
    if (t < done) {
      st.wipe = st.wipe || { t0: w0, level: 0, cells: [], lit: null, pattern: FILLS.quiet[2], tIn, full: true, top: 0, bot: H, mold: 0, eyes: 0 };
      cells = applyWipe(cells, t);
    } else st.wipe = null;
    return cells;
  }

  // ---------- drawing ----------
  const cv = document.getElementById('card'), g = cv.getContext('2d');
  const PX = { w: 3840, h: 2160 };
  const cw = PX.w / W, fs = cw / 0.6, chh = fs * 1.22, oy = (PX.h - H * chh) / 2;   // (engine/screen.js: a cell is 0.6 x 1.22 of the font size)
  cv.width = PX.w; cv.height = PX.h;
  function fit() { const k = Math.min(innerWidth / PX.w, innerHeight / PX.h); cv.style.width = PX.w * k + 'px'; cv.style.height = PX.h * k + 'px'; }
  addEventListener('resize', fit); fit();
  function draw(t) {
    const cells = cellsAt(t);
    g.fillStyle = C.bg; g.fillRect(0, 0, PX.w, PX.h);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const bold of [false, true]) {   // (engine/render.js: one font weight at a time)
      g.font = `${bold ? 700 : 400} ${fs}px "JetBrains Mono", Consolas, monospace`;
      for (const c of cells) {
        if (!!c.bold !== bold || !c.ch) continue;
        g.fillStyle = c.col;
        g.fillText(c.ch, (c.cx + 0.5) * cw, oy + (c.cy + 0.5) * chh);
      }
    }
  }

  // ---------- running it ----------
  Object.assign(C, PALETTES.c_basic || PALETTES[DEFAULT_PALETTE]);   // BASIC: the intro's colors
  const info = document.getElementById('info');
  const api = {
    P, W, H, FPS,
    frames: () => Math.round(P.dur / STEP),
    ready: false,
    // render.js: frame i (in order from 0; a frame before the last one drawn starts the card over)
    frame(i) { const t = i * STEP; if (!S || t < S.t - 1e-6) reset(); draw(t); return cv.toDataURL('image/png').split(',')[1]; },
    stats: () => ({ t: S.t, wires: S.wireCells.length, traces: S.traces.length, patches: S.seeds.length, cover: +S.cover.toFixed(3) }),
  };
  window.endcard = api;
  const render = /[?&]render\b/.test(location.search);
  if (render) info.hidden = true;
  Promise.all([document.fonts.load(`400 ${fs}px "JetBrains Mono"`), document.fonts.load(`700 ${fs}px "JetBrains Mono"`)]).catch(() => {}).then(() => {
    api.ready = true;
    if (render) return;
    // live: plays, holds the last frame a while, then again. space: again, p: pause, s: a step while paused
    let t0 = performance.now(), paused = false, pt = 0;
    reset();
    addEventListener('keydown', e => {
      if (e.key === ' ') { t0 = performance.now(); reset(); pt = 0; }
      if (e.key === 'p') { paused = !paused; if (!paused) t0 = performance.now() - pt; }
      if (e.key === 's' && paused) { pt += STEP; }
    });
    (function loop(now) {
      let t = paused ? pt : now - t0;
      if (t > P.dur + 2000) { t0 = now; reset(); t = 0; }
      if (!paused) pt = t;
      draw(Math.min(t, P.dur));
      const s = api.stats();
      info.textContent = `${(Math.min(t, P.dur) / 1000).toFixed(2)}s  wires ${s.wires}  mold ${Math.round(s.cover * 100)}%   space: again  p: pause  s: step`;
      requestAnimationFrame(loop);
    })(performance.now());
  });
})();
