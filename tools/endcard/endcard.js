// NeoN+1 tools/endcard/endcard.js: the trailer's end card (Greg, 2026-11-13). 8 seconds at 139 x 38 cells (a 4K frame
// at the captures' text size):
//   1. the block NEON and the logotype build in out of black with the game's wipe (engine/effects.js applyWipe);
//   2. they sit a beat, with the intro card's shine and row glitch (engine/intro.js introCard);
//   3. trace wires grow out of the block letters, mostly left and right, some up and down to reach the edges (like
//      G0D's traces, engine/g0dfight.js g0dfTraceTick, not red). Four wire styles that mix; they stay, or run as
//      snakes (the tail follows the head);
//   4. mold comes up in patches along the wires, all over, never on the art;
//   5. tech blobs ([@@@], [====], {o}...) pop in along the wires, animate and glitch out, like G0D's eyes on the title
//      (engine/fx.js eyeMarks).
// The settings (SET) are what the panel changes (h shows / hides it); render.js renders with tools/endcard/settings.json.
// The art is asXii's (asxii_art/neon_1_4k_v03: layers NeoN_fullscreen and neon_title), bundled by render.js into
// endcard_art.js. Needs (endcard.html): dist/data/palettes.js, engine/core.js, data/fx.js, engine/fx.js,
// engine/effects.js, endcard_art.js.
(() => {
  'use strict';
  const W = 139, H = 38, FPS = 60, STEP = 1000 / FPS;
  const $ = id => document.getElementById(id);

  // ---------- the settings (the panel's; saved as settings.json for render.js) ----------
  // Sliders are 0-100 with 50 the first look (2026-11-13).
  const DEFAULTS = {
    seed: 7,
    mold: false, moldSpread: 50,   // (mold off for now: Greg, 2026-11-13)
    wireBox: true, wireAscii: false, wireDouble: false, wireDots: false,
    wireSnake: false, snakeLen: 30,
    wireAmount: 50, wireSpeed: 50, wireLength: 50,
    blobs: false, blobAmount: 50,
    wipeLevel: 0, wipeFill: 2,   // the wipe in: 0 quiet (grey fill) / 1 success (cyan, sparks); its fill pattern (engine/effects.js FILLS)
  };
  const SET = Object.assign({}, DEFAULTS);
  const k100 = (v, lo, hi) => v <= 50 ? lo + (1 - lo) * v / 50 : 1 + (hi - 1) * (v - 50) / 50;   // 0 -> lo, 50 -> 1, 100 -> hi

  // ---------- the look and the timing (ms from the start) ----------
  const P = {
    dur: 8000,
    wipeAt: 120,            // the wipe starts (the frames before it are black)
    copyAt: 1250, key: 38,  // "network intrusion // prototype" types in
    shine: 2600, glitch: 1900, glitchMs: 110,   // the intro card's shine and row glitch (engine/intro.js INTRO_CARD_FX)
    wires: { at: 1900, full: 5200, rate: [6, 40], speed: [20, 46], len: [14, 72], turn: 0.12, branch: 0.035, fromWire: 0.5, max: 340 },
    mold: { at: 3000, full: 7400, r: [1.3, 3.4], grow: 1100, amp: [2.2, 4.6], tone: 0.72, keep: [5, 2], pick: 8 },
    blobs: { at: 2600, every: 90, life: [1500, 1800], inMs: 300, outMs: 280, glitch: 0.04, ms: 70 },   // (as data/fx.js eyes)
    keep: [2, 1],           // the clean margin around the art (cells across, rows down)
  };
  // The wire styles: their lines, corners, crossings, heads and ends, and how bright (0-1 from the background to `ink`)
  const CORNER = { '1,0>0,1': '╮', '1,0>0,-1': '╯', '-1,0>0,1': '╭', '-1,0>0,-1': '╰', '0,1>1,0': '╰', '0,1>-1,0': '╯', '0,-1>1,0': '╭', '0,-1>-1,0': '╮' };   // (engine/g0dfight.js G0DF_CORNER)
  const WIRES = {
    box: { h: '─', v: '│', corner: k => CORNER[k] || '┼', cross: '┼', head: '•', end: null, ink: 'accent', tone: 0.34 },
    ascii: { h: '-', v: '|', corner: () => '+', cross: '+', head: 'o', end: 'o', ink: 'text', tone: 0.36 },
    double: { h: '=', v: '║', corner: () => '+', cross: '#', head: '#', end: null, ink: 'accent', tone: 0.48 },
    dots: { h: '·', v: ':', corner: () => '.', cross: ':', head: '*', end: null, ink: 'mid', tone: 0.6 },
  };
  // Tech blobs: art (one row) and how it moves: frame(age, seed) -> the row now. Like the title's [@@] and [====].
  const noisy = () => noiseCh();
  const BLOBS = [
    { w: 5, frame: (a) => '[' + ['@..', '.@.', '..@', '.@.'][Math.floor(a / 160) % 4] + ']' },
    { w: 6, frame: (a, s) => '[' + '='.repeat(Math.round((Math.sin(a / 260 + s) * 0.5 + 0.5) * 4)).padEnd(4, '-') + ']' },
    { w: 3, frame: (a, s) => (a + s * 500) % 1400 < 140 ? '{-}' : '{o}' },
    { w: 4, frame: (a) => Math.floor(a / 380) % 2 ? '|><|' : '|<>|' },
    { w: 3, frame: (a) => '[' + (Math.floor(a / 90) % 3 ? noisy() : '#') + ']' },
    { w: 6, frame: (a, s) => '(' + [0, 1, 2, 3].map(i => FX.hash(i, s, Math.floor(a / 120)) < 0.5 ? '0' : '1').join('') + ')' },
    { w: 6, frame: (a) => { const i = Math.floor(a / 110) % 4; return '<' + '::::'.split('').map((c, j) => j === i ? '.' : c).join('') + '>'; } },
    { w: 5, frame: (a) => '[' + '|||'.split('').map((c, j) => Math.floor(a / 150 + j) % 4 === 0 ? ' ' : c).join('') + ']' },
  ];

  // ---------- seeded random (the same card every run, for a seed) ----------
  let seed = 1;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const between = ([a, b], k = rnd()) => a + (b - a) * k;
  const ease = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
  const idx = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? -1 : y * W + x;

  // ---------- the art ----------
  const ART = window.ENDCARD_ART;
  const art = new Array(W * H).fill(null);   // { ch, kind: block | rule | fill | title, row }
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
  // The clean areas: the art and a margin round it, a wider one for the mold. The copy line counts as art.
  const isArt = k => art[k] || (copy && Math.floor(k / W) === copy.y && k % W >= copy.x && k % W < copy.x + copy.text.length);
  const margin = ([mx, my]) => {
    const out = new Uint8Array(W * H);
    for (let k = 0; k < W * H; k++) if (isArt(k)) {
      const x = k % W, y = Math.floor(k / W);
      for (let dy = -my; dy <= my; dy++) for (let dx = -mx; dx <= mx; dx++) { const j = idx(x + dx, y + dy); if (j >= 0) out[j] = 1; }
    }
    return out;
  };
  const keep = margin(P.keep), keepMold = margin(P.mold.keep);
  const free = (() => { let n = 0; for (let k = 0; k < W * H; k++) if (!keepMold[k]) n++; return n; })();
  // Where wires start: the cells just outside the block letters' clean area. Sides (left / right), then top / bottom.
  const sides = [], ends = [];
  let ax0 = W, ax1 = 0;
  for (let k = 0; k < W * H; k++) if (art[k] && art[k].kind !== 'title') { ax0 = Math.min(ax0, k % W); ax1 = Math.max(ax1, k % W); }
  const mid = (ax0 + ax1) / 2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = idx(x, y); if (keep[k]) continue;
    if (keep[idx(x + 1, y)] || keep[idx(x - 1, y)]) sides.push([x, y, x < mid ? -1 : 1, 0]);
    else if (keep[idx(x, y + 1)] || keep[idx(x, y - 1)]) ends.push([x, y, 0, keep[idx(x, y + 1)] ? -1 : 1]);
  }

  // ---------- the simulation (fixed steps, so a frame is always the same for the same settings) ----------
  let S;
  function reset() {
    seed = SET.seed;
    S = { t: 0, wire: new Array(W * H).fill(null), type: new Array(W * H).fill(null), own: new Int32Array(W * H).fill(-1), born: new Float32Array(W * H),
      traces: [], ever: [], everSet: new Uint8Array(W * H), acc: 0, ids: 0,
      seeds: [], m: new Float32Array(W * H), mAcc: 0, cover: 0, blobs: [], bAcc: 0 };
    st.wipe = null;
  }
  const types = () => { const t = ['box', 'ascii', 'double', 'dots'].filter(k => SET['wire' + k[0].toUpperCase() + k.slice(1)]); return t.length ? t : ['box']; };
  function spawnTrace(x, y, dx, dy, out) {
    if (S.traces.filter(t => !t.done).length >= P.wires.max) return;
    const heat = ease((S.t - P.wires.at) / (P.wires.full - P.wires.at)), ty = types();
    const len = Math.round(between(P.wires.len, 0.3 * rnd() + 0.7 * heat) * k100(SET.wireLength, 0.3, 2.2));
    const t = { id: S.ids++, type: ty[Math.floor(rnd() * ty.length)], x, y, dx, dy, acc: 0, n: 0, len, pts: [], out: out || [x, y], done: false,
      speed: between(P.wires.speed, rnd() * (0.4 + 0.6 * heat)) * k100(SET.wireSpeed, 0.4, 2) };
    S.traces.push(t);
    lay(t, x, y, WIRES[t.type].end || (dx ? WIRES[t.type].h : WIRES[t.type].v));
  }
  function lay(t, x, y, ch) {
    const k = idx(x, y), Wt = WIRES[t.type];
    if (S.wire[k] && S.own[k] !== t.id) ch = Wt.cross;   // crossing another wire
    if (!S.wire[k]) S.born[k] = S.t;
    if (!S.everSet[k]) { S.everSet[k] = 1; S.ever.push(k); }
    S.wire[k] = ch; S.type[k] = t.type; S.own[k] = t.id;
    t.pts.push(k);
  }
  function unlay(t) {   // a snake's tail: its oldest cell goes (unless another wire has it now)
    const k = t.pts.shift();
    if (S.own[k] === t.id) { S.wire[k] = null; S.own[k] = -1; }
  }
  function stepWires(dt) {
    const Wc = P.wires;
    if (S.t >= Wc.at) {
      const heat = ease((S.t - Wc.at) / (Wc.full - Wc.at));
      S.acc += dt / 1000 * between(Wc.rate, heat) * k100(SET.wireAmount, 0.15, 2.5);
      while (S.acc >= 1) {
        S.acc -= 1;
        if (S.ever.length > 20 && rnd() < Wc.fromWire * heat) {   // a new branch off a wire (to reach the edges)
          const k = S.ever[Math.floor(rnd() * S.ever.length)], x = k % W, y = Math.floor(k / W);
          const vert = rnd() < 0.55, s = rnd() < 0.5 ? 1 : -1;
          spawnTrace(x, y, vert ? 0 : s, vert ? s : 0, [x - (vert ? 0 : s), y - (vert ? s : 0)]);
        } else {
          const list = rnd() < 0.78 || !ends.length ? sides : ends, [x, y, dx, dy] = list[Math.floor(rnd() * list.length)];
          spawnTrace(x, y, dx, dy, [x - dx, y - dy]);
        }
      }
    }
    const snake = SET.wireSnake, tail = Math.max(2, Math.round(SET.snakeLen));
    for (let i = S.traces.length - 1; i >= 0; i--) {
      const t = S.traces[i], Wt = WIRES[t.type];
      t.acc += dt / 1000 * t.speed * (t.dy ? 0.55 : 1);   // (cells are tall: down is slower, as G0D's)
      while (t.acc >= 1) {
        t.acc -= 1;
        if (t.done) { if (snake && t.pts.length) unlay(t); else break; continue; }   // a spent snake eats itself from the tail
        if (t.n >= t.len) { t.done = true; continue; }
        let { dx, dy } = t;
        if (rnd() < P.wires.turn) {   // a turn, mostly away from where it came out (G0D's outward traces)
          const away = rnd() < 0.8, coin = rnd() < 0.5 ? 1 : -1;
          const nd = dx ? [0, away ? Math.sign(t.y - t.out[1]) || coin : coin] : [away ? Math.sign(t.x - t.out[0]) || coin : coin, 0];
          const k = idx(t.x, t.y); if (S.own[k] === t.id) S.wire[k] = Wt.corner(dx + ',' + dy + '>' + nd[0] + ',' + nd[1]);
          [dx, dy] = nd; t.dx = dx; t.dy = dy;
        }
        const nx = t.x + dx, ny = t.y + dy, k = idx(nx, ny);
        if (k < 0 || keep[k]) { t.done = true; continue; }   // the edge of the screen, or the art's clean area
        t.x = nx; t.y = ny; t.n++;
        lay(t, nx, ny, dx ? Wt.h : Wt.v);
        if (snake && t.pts.length > tail) unlay(t);
        if (rnd() < P.wires.branch) spawnTrace(nx, ny, dy ? (rnd() < 0.5 ? 1 : -1) : 0, dx ? (rnd() < 0.5 ? 1 : -1) : 0, t.out);
      }
      if (t.done && Wt.end && !snake && !t.capped) { t.capped = true; const k = idx(t.x, t.y); if (S.own[k] === t.id) S.wire[k] = Wt.end; }   // ascii: an o at the end
      if (t.done && (!snake || !t.pts.length)) { if (snake) S.traces.splice(i, 1); }
    }
  }
  // Mold: patches that come up on wire cells anywhere (spread out: of a few cells, the one furthest from the others),
  // each growing to its size, until moldSpread's share of the free screen is mold. Ragged edges (a hash on the distance).
  function stepMold(dt) {
    const M = P.mold;
    if (!SET.mold || S.t < M.at || !S.ever.length) return;
    const cover = 0.02 + 0.96 * SET.moldSpread / 100;   // (50: about half the screen)
    const target = cover * ease((S.t - M.at) / (M.full - M.at));
    S.mAcc += dt;
    if (S.mAcc >= 50) {
      S.mAcc = 0;
      for (let i = 0; i < 3 && S.cover + 0.004 * S.seeds.filter(s => S.t - s.t0 < M.grow).length < target; i++) {
        let k = -1, best = -1;
        for (let c = 0; c < M.pick; c++) {
          const j = S.ever[Math.floor(rnd() * S.ever.length)]; if (keepMold[j]) continue;
          const x = j % W, y = Math.floor(j / W);
          let d = 1e9; for (const p of S.seeds) d = Math.min(d, Math.hypot((x - p.x) / 2.2, y - p.y));
          if (d > best) { best = d; k = j; }
        }
        if (k < 0) continue;
        S.seeds.push({ x: k % W, y: Math.floor(k / W), r: between(M.r), amp: between(M.amp), t0: S.t });
      }
    }
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
  // Tech blobs: one comes up every so often on a wire (somewhere clear of the art and the other blobs), lives a while.
  function stepBlobs(dt) {
    const B = P.blobs;
    S.blobs = S.blobs.filter(b => S.t < b.t0 + b.life);
    if (!SET.blobs || S.t < B.at || !S.ever.length) return;
    S.bAcc += dt * k100(SET.blobAmount, 0.15, 3);
    while (S.bAcc >= B.every) {
      S.bAcc -= B.every;
      if (rnd() < 0.5) continue;
      const art = Math.floor(rnd() * BLOBS.length), w = BLOBS[art].w;
      for (let tr = 0; tr < 6; tr++) {
        const k = S.ever[Math.floor(rnd() * S.ever.length)], x = k % W - Math.floor(w / 2), y = Math.floor(k / W);
        if (x < 0 || x + w > W) continue;
        let ok = true; for (let i = -1; i <= w; i++) if (keep[idx(x + i, y)] !== 0 || idx(x + i, y) < 0) ok = false;
        if (!ok || S.blobs.some(b => b.y === y && x < b.x + b.w + 2 && b.x < x + w + 2)) continue;
        S.blobs.push({ x, y, w, art, t0: S.t, life: between(B.life), seed: Math.floor(rnd() * 1000) });
        break;
      }
    }
  }
  function advance(t) {
    while (S.t + STEP <= t + 1e-6) { S.t += STEP; stepWires(STEP); stepMold(STEP); stepBlobs(STEP); }
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
  function blobMarks(b, t) {   // as engine/fx.js eyeMarks: each cell glitches in, then the art animates, then it glitches out
    const B = P.blobs, age = t - b.t0, left = b.life - age, row = BLOBS[b.art].frame(age, b.seed), out = [];
    const rim = mixHex(C.bg, C.text, 0.55);
    [...row].forEach((ch, x) => {
      const inAt = FX.hash(x, b.y, b.seed + 51) * B.inMs, outAt = FX.hash(x, b.y, b.seed + 52) * B.outMs;
      if (age < inAt * 0.4 || left < outAt * 0.4) return;
      const glitch = age < inAt || left < outAt || FX.hash(x, b.y, FX.step(t, B.ms) + b.seed) < B.glitch;
      const edge = x === 0 || x === row.length - 1;
      if (glitch) out.push({ ch: FX.pick(FX_GLITCH, FX.hash(x, b.y, FX.step(t, B.ms) + b.seed + 7)), cx: b.x + x, cy: b.y, col: C.accent });
      else if (ch !== ' ') out.push({ ch, cx: b.x + x, cy: b.y, col: edge ? rim : C.bright, bold: !edge });
    });
    return out;
  }
  function worldCells(t) {
    const out = [], heads = new Map(), cover = new Set();
    for (const tr of S.traces) if (!tr.done) heads.set(idx(tr.x, tr.y), tr.type);
    for (const b of S.blobs) for (let i = -1; i <= b.w; i++) cover.add(idx(b.x + i, b.y));
    const ink = {}; for (const [k, Wt] of Object.entries(WIRES)) ink[k] = mixHex(C.bg, C[Wt.ink], Wt.tone);
    for (let k = 0; k < W * H; k++) {
      if (cover.has(k)) continue;
      const x = k % W, y = Math.floor(k / W), m = SET.mold ? S.m[k] : 0, w = S.wire[k];
      if (m >= 0.6 && !(w && m < 1.4)) {   // mold (thin mold lets a wire show through, tinted)
        const ch = FX.pick(FX_LOOKS.moldwipe.set, FX.hash(x, y, FX.step(t, 140)));
        out.push({ ch, cx: x, cy: y, col: mixHex(C.bg, moldCol(m), P.mold.tone) });
      } else if (w) {
        const age = t - S.born[k], ty = S.type[k], head = heads.get(k);
        const col = head ? C.bright : m >= 0.6 ? mixHex(C.bg, moldCol(m), P.mold.tone) : age < 260 ? mixHex(ink[ty], C.accent, 1 - age / 260) : ink[ty];
        out.push({ ch: head ? WIRES[head].head : w, cx: x, cy: y, col });
      }
    }
    for (const b of S.blobs) out.push(...blobMarks(b, t));
    return out;
  }
  function cellsAt(t) {
    advance(t);
    if (t < P.wipeAt) return [];
    let cells = worldCells(t).concat(artCells(t));
    // the wipe: the game's own, from black (no old screen), building the card in
    const lvl = SET.wipeLevel ? 1 : 0, fills = lvl ? FILLS.success : FILLS.quiet;
    const w0 = P.wipeAt, T = WIPE_TIME[lvl];
    const tIn = w0 + T.travel * (lvl ? CONFIG.wipeOverlapWin : CONFIG.wipeOverlap) / CONFIG.wipeSpeed;   // (as engine/effects.js wipeOut's hand-off)
    const done = tIn + (T.travel + T.decay * 1.3 + CONFIG.wipeStagger) / CONFIG.wipeSpeed;
    if (t < done) {
      st.wipe = st.wipe || { t0: w0, level: lvl, cells: [], lit: null, pattern: fills[Math.min(SET.wipeFill, fills.length - 1)], tIn, full: true, top: 0, bot: H, mold: 0, eyes: 0 };
      cells = applyWipe(cells, t);
    } else st.wipe = null;
    return cells;
  }

  // ---------- drawing ----------
  const cv = $('card'), g = cv.getContext('2d');
  const PX = { w: 3840, h: 2160 };
  const cw = PX.w / W, fs = cw / 0.6, chh = fs * 1.22, oy = (PX.h - H * chh) / 2;   // (engine/screen.js: a cell is 0.6 x 1.22 of the font size)
  cv.width = PX.w; cv.height = PX.h;
  function fit() { const k = Math.min(innerWidth / PX.w, innerHeight / PX.h); cv.style.width = PX.w * k + 'px'; cv.style.height = PX.h * k + 'px'; }
  addEventListener('resize', fit); fit();
  function draw(t) {
    if (!S || t < S.t - 1e-6) reset();   // (going back: run it again from the start)
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
  const stats = () => ({ t: Math.round(S.t), wires: S.wire.filter(Boolean).length, traces: S.traces.length, patches: S.seeds.length, cover: +S.cover.toFixed(3), blobs: S.blobs.length });

  // ---------- the panel (live only) ----------
  // Built from a list: [key, label, kind (check | range | number), extra]. A change starts the card over at the same time.
  const STORE = 'neon-endcard.settings';
  const PANEL = [
    ['', 'MOLD'], ['mold', 'mold', 'check'], ['moldSpread', 'spread', 'range'],
    ['', 'WIRES'], ['wireBox', 'box  ─│╭╮', 'check'], ['wireAscii', 'ascii  -|+ o', 'check'], ['wireDouble', 'double  =║', 'check'], ['wireDots', 'dots  ·:', 'check'],
    ['wireAmount', 'amount', 'range'], ['wireSpeed', 'speed', 'range'], ['wireLength', 'length', 'range'],
    ['wireSnake', 'snakes (tail follows)', 'check'], ['snakeLen', 'snake length', 'range', { min: 3, max: 80 }],
    ['', 'TECH BLOBS'], ['blobs', 'blobs', 'check'], ['blobAmount', 'amount', 'range'],
    ['', 'WIPE IN'], ['wipeLevel', 'level', 'select', { options: ['quiet', 'success'] }],
    ['wipeFill', 'fill', 'select', { options: () => SET.wipeLevel ? ['streams', 'noise', 'double chevrons', 'arrows'] : ['streams', 'noise', 'chevrons', 'dashes', 'checker'] }],
    ['', 'SEED'], ['seed', 'seed', 'number'],
  ];
  let play = { t0: 0, paused: false, at: 0 };
  function changed() { try { localStorage.setItem(STORE, JSON.stringify(SET)); } catch (e) { /* private mode */ } reset(); }
  function buildPanel() {
    const box = $('panel');
    box.innerHTML = '';
    for (const [key, label, kind, ex] of PANEL) {
      if (!kind) { const h = document.createElement('div'); h.className = 'head'; h.textContent = label; box.appendChild(h); continue; }
      const row = document.createElement('label'); row.className = 'row';
      const name = document.createElement('span'); name.textContent = label;
      const inp = document.createElement(kind === 'select' ? 'select' : 'input');
      if (kind === 'select') {
        const opts = typeof ex.options === 'function' ? ex.options() : ex.options;
        if (SET[key] >= opts.length) SET[key] = 0;
        opts.forEach((o, i) => { const op = document.createElement('option'); op.value = i; op.textContent = o; inp.appendChild(op); });
        inp.value = SET[key];
      } else inp.type = kind === 'check' ? 'checkbox' : kind === 'range' ? 'range' : 'number';
      if (kind === 'range') { inp.min = ex ? ex.min : 0; inp.max = ex ? ex.max : 100; inp.step = 1; inp.value = SET[key]; }
      if (kind === 'number') inp.value = SET[key];
      if (kind === 'check') inp.checked = !!SET[key];
      const val = document.createElement('span'); val.className = 'val'; val.textContent = kind === 'range' ? SET[key] : '';
      inp.addEventListener('input', () => {
        SET[key] = kind === 'check' ? inp.checked : +inp.value;
        if (kind === 'range') val.textContent = inp.value;
        changed();
        if (kind === 'select') { buildPanel(); play = { t0: performance.now(), paused: false, at: 0 }; }   // (the fills list follows the level; and watch the wipe again)
      });
      row.append(kind === 'check' ? inp : name, kind === 'check' ? name : inp, val);
      box.appendChild(row);
    }
    const btns = document.createElement('div'); btns.className = 'btns';
    const btn = (text, fn, tip) => { const b = document.createElement('button'); b.textContent = text; b.title = tip || ''; b.onclick = fn; btns.appendChild(b); };
    btn('new seed', () => { SET.seed = Math.floor(Math.random() * 99999); changed(); buildPanel(); }, 'a different network');
    btn('defaults', () => { Object.assign(SET, DEFAULTS); changed(); buildPanel(); });
    btn('save settings.json', saveSettings, 'render.js renders with tools/endcard/settings.json');
    box.appendChild(btns);
    const scrub = document.createElement('label'); scrub.className = 'row';
    scrub.innerHTML = '<span>time</span><input id="scrub" type="range" min="0" max="' + P.dur + '" step="' + STEP + '"><span class="val" id="tval"></span>';
    box.appendChild(scrub);
    $('scrub').addEventListener('input', e => { play.paused = true; play.at = +e.target.value; });
    const tip = document.createElement('div'); tip.className = 'tip';
    tip.textContent = 'space: again  p: pause  , .: a frame  h: hide this';
    box.appendChild(tip);
  }
  // Save: straight into tools/endcard/settings.json (the File System Access API; it remembers the folder), else a download.
  async function saveSettings() {
    const text = JSON.stringify(SET, null, 2) + '\n';
    try {
      if (window.showSaveFilePicker) {
        const h = await showSaveFilePicker({ id: 'neon-endcard', suggestedName: 'settings.json', types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] });
        const w = await h.createWritable(); await w.write(text); await w.close();
        $('info').textContent = 'saved ' + h.name + ' at ' + new Date().toLocaleTimeString();
        return;
      }
    } catch (e) { if (e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = 'settings.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    $('info').textContent = 'downloaded settings.json: put it in tools/endcard/';
  }

  // ---------- running it ----------
  Object.assign(C, PALETTES.c_basic || PALETTES[DEFAULT_PALETTE]);   // BASIC: the intro's colors
  const api = {
    P, W, H, FPS, SET,
    frames: () => Math.round(P.dur / STEP),
    ready: false,
    set(o) { Object.assign(SET, DEFAULTS, o || {}); reset(); },   // render.js: the settings to render with
    // render.js: frame i (in order from 0 is quickest: going back starts the card over)
    frame(i) { draw(i * STEP); return cv.toDataURL('image/png').split(',')[1]; },
    stats: () => stats(),
  };
  window.endcard = api;
  const render = /[?&]render\b/.test(location.search);
  if (render) { $('info').hidden = true; $('panel').hidden = true; }
  else { try { Object.assign(SET, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { /* private mode */ } }
  reset();
  Promise.all([document.fonts.load(`400 ${fs}px "JetBrains Mono"`), document.fonts.load(`700 ${fs}px "JetBrains Mono"`)]).catch(() => {}).then(() => {
    api.ready = true;
    if (render) return;
    buildPanel();
    play.t0 = performance.now();
    addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' && e.target.type === 'number') return;
      if (e.key === ' ') { e.preventDefault(); play = { t0: performance.now(), paused: false, at: 0 }; reset(); }
      if (e.key === 'p') { play.paused = !play.paused; if (!play.paused) play.t0 = performance.now() - play.at; }
      if (e.key === '.' || e.key === ',') { play.paused = true; play.at = Math.max(0, Math.min(P.dur, play.at + (e.key === '.' ? STEP : -STEP))); }
      if (e.key === 'h') $('panel').hidden = !$('panel').hidden;
    });
    (function loop(now) {
      if (!play.paused) { play.at = now - play.t0; if (play.at > P.dur + 2000) { play.t0 = now; play.at = 0; } }
      const t = Math.min(play.at, P.dur);
      draw(t);
      const s = stats();
      $('info').textContent = `${(t / 1000).toFixed(2)}s  wires ${s.wires}  mold ${Math.round(s.cover * 100)}%  blobs ${s.blobs}`;
      const sc = $('scrub'); if (sc && document.activeElement !== sc) sc.value = t; if ($('tval')) $('tval').textContent = (t / 1000).toFixed(2) + 's';
      requestAnimationFrame(loop);
    })(performance.now());
  });
})();
