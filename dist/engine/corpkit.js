// NeoN+1 engine/corpkit.js: the corp kit. CORPS / CORP_TELL / CORP_ART start here, every corps/ file adds
// its own corp, and the shared helpers for corp tells come after.
//
// ADDING A CORP
//   1. Copy a corp file in corps/ (corps/boneyard.js is a good one) to corps/KEY.js. It sets
//      CORPS.KEY (the definition and its hooks, see below), CORP_TELL.KEY (the codex text, shown
//      once you beat it) and CORP_ART.KEY (the intro art).
//   2. Add <script src="corps/KEY.js?v=..."></script> to index.html after the other corps (the
//      order of the corps is the order the map picks from, so new ones go at the end).
//   3. Optional: its palette in palettes.js (c_KEY); its music in its own file (SONGS.<track> +
//      MUSIC_FOR.KEY); helpers only it uses go in its own file too. Its boss mod goes in data/mods.js
//      at the END of MODS (the order there decides reward rolls), its effect in engine/run.js or active.js.
//   4. Check it: node tools/check.js and node tools/playtest.js (every corp, headless), and
//      node tools/tell_odds.js for how much a position tell helps.
//
// WHAT THE CORP FILES USE from the rest of the game (generated from the corps/ files at v12.02).
// Anything here can be used in a corp's hooks; most corps need only C, st, setMsg, Sound, pickR,
// shuffle, rngFor, wait and the tile helpers.
//   engine/core.js      C, pickR, shuffle, rngFor, clamp, TILE_H, TILE_W, noiseCh, BOARD_Y, cleanSeed, GAP_X,
//                       GAP_Y, mixHex, NOISE, PAL_LIT
//   data/glyphs.js      normMotif, MOTIFS, BONE_GLYPH
//   data/mods.js        MODS
//   data/music.js       MUSIC_FOR, SONGS
//   engine/corpkit.js   CORP_ART, CORP_TELL, CORPS, randInt, h01, slideTo, slideMs, moveScale, setCellOf,
//                       glyphLine, cellZone, COL_NAMES, mirrorGlyph, moveTile, mutateGlyph, nearness,
//                       ROW_NAMES, sameGlyph, beatClock, floatText, FW_ZONE, heatCol, heatGlyph, ICE_FLASH,
//                       kfmt, lagNext, liftRow, makeLift, NOIR_SIDES, predHeat, SQ_BAD, SQ_GOOD, SQ_MEH,
//                       touching
//   engine/corps.js     corpDef
//   engine/mods.js      tv
//   engine/save.js      save
//   engine/sound.js     Sound
//   engine/screen.js    st, g, tileOrigin, L, tileCenter, has
//   engine/effects.js   shake, flash, rand, explode, snapshot
//   engine/render.js    setMsg, wait, candidates, last
//   engine/run.js       lockTile, pick, die, grantLoot, onSafe, blockHit, frostbite
//
'use strict';
NEON_FILES.push(['engine/corpkit.js', 'v12.04']);

// ---------------- Content ----------------
// tell: how the corp picks its safe tile. bossTell: the boss layer's twist.
// rules: shown on the map only when the corp has something special.
// ---- Corp kit. A corp is data plus optional hooks (see docs/CORPS.md):
//   level         1-5: how hard it is to read. Deeper map steps pick higher levels (pickCorps).
//   dress(lv, k)  puts the corp's tell on the nodes, after the real node is picked.
//                 k = { r, follow, real, tellTile, tiles, tier, boss, idx }
//                 tellTile is the node that carries the tell: the real one, or (when the
//                 tell isn't followed this layer) a random node. It sets t.glyph, plus
//                 tile flags other mods read: t.marked (SIGSCAN), t.forged (FORGERY).
//   hint(lv, now) a line for row 7 (when there's no clock): { text, col } or null.
//   nodes         + / - nodes per layer. pay, timer: as before. rules(tier): the rules line.
const CORPS = {};   // filled by the corps/ files

// ---- Corp kit helpers for glyph tells.
const MIRROR_CH = { '/': '\\', '\\': '/', '<': '>', '>': '<', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{' };
const mirrorGlyph = g => g.map(l => [...l].reverse().map(ch => MIRROR_CH[ch] || ch).join(''));
const LOOKALIKE = { o: '0', '0': 'o', '|': '!', '!': '|', '-': '=', '=': '-', '+': '*', '*': '+', '#': 'H', x: 'X', X: 'x', '.': ',', ':': ';', '@': 'a', '%': '&' };
// One visible character changed. sneaky: swap it for a lookalike (o -> 0) when there is one.
function mutateGlyph(g, r, sneaky = false) {
  const spots = [];
  g.forEach((l, y) => [...l].forEach((ch, x) => { if (ch !== ' ') spots.push([y, x]); }));
  if (!spots.length) return g;
  const [y, x] = pickR(spots, r), ch = g[y][x];
  let to = sneaky && LOOKALIKE[ch] ? LOOKALIKE[ch] : pickR([...MARK_CHARS + 'xX'].filter(c => c !== ch), r);
  return g.map((l, yy) => yy === y ? l.slice(0, x) + to + l.slice(x + 1) : l);
}
const sameGlyph = (a, b) => a.join('|') === b.join('|');
const NOIR_SIDES = {
  LEFT: { text: ['LEFT', 'OF ME'], test: t => x => x.col < t.col }, RIGHT: { text: ['RIGHT', 'OF ME'], test: t => x => x.col > t.col },
  ABOVE: { text: ['ABOVE', 'ME'], test: t => x => x.row < t.row }, BELOW: { text: ['BELOW', 'ME'], test: t => x => x.row > t.row },
};
// SYNAPSE: where a pick was (by habit), and what you pick most.
const cellZone = (t, lv) => { const e = (t.col === 0 || t.col === lv.cols - 1) + (t.row === 0 || t.row === lv.rows - 1); return e === 2 ? 'corner' : e === 1 ? 'edge' : 'middle'; };
// TEMPO: where we are in the beat. The music's own clock when it's playing; otherwise a
// steady one at the corp song's tempo.
function beatClock(now) {
  const b = Music.beat && Music.beat();
  if (b && b.ms > 0) { const d = (now - b.perf) / b.ms; return { phase: ((d % 1) + 1) % 1, n: b.n + Math.floor(d), bpm: 60000 / b.ms }; }
  const sg = SONGS[MUSIC_FOR[st.corp && st.corp.def.key]] || { bpm: 120 }, ms = 60000 / sg.bpm, d = now / ms;
  return { phase: d % 1, n: Math.floor(d), bpm: sg.bpm };
}
// LIFTCO (and EXPRESS): a lift that runs up and down the rows and stops longer on one.
const makeLift = (row, r, hold) => ({ row, per: 600, hold, ph: Math.floor(r() * 6000), up: true });
function liftRow(lv, now) {
  const lf = lv.lift;
  if (!lf || lv.rows < 2) return null;
  const path = [];
  for (let k = lv.rows - 1; k >= 0; k--) path.push(k);       // up: bottom to top
  for (let k = 1; k < lv.rows - 1; k++) path.push(k);        // down again
  const dur = k => k === lf.row ? lf.hold : lf.per;
  const total = path.reduce((a, k) => a + dur(k), 0);
  let p = (now + lf.ph) % total;
  for (let j = 0; j < path.length; j++) {
    if (p < dur(path[j])) { lf.up = j < lv.rows - 1; return path[j]; }
    p -= dur(path[j]);
  }
  return path[0];
}
// WATCHPOINT / CCTV: ICE caught on camera.
const ICE_FLASH = normMotif(['###', '###', '###']);
// Smooth-ish noise in [0, 1) for flicker schedules: h01(seed, slot).
const h01 = (a, b) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };
// A glyph on one line, for hint lines: [ / \ ][<   >][ \ / ]
const glyphLine = g => g.map(l => `[${l}]`).join('');
// How alike two glyphs are: matching visible characters in the same spots.
const glyphLikeness = (a, b) => { let n = 0; for (let y = 0; y < 3; y++) for (let x = 0; x < 5; x++) if (a[y][x] !== ' ' && a[y][x] === b[y][x]) n++; return n; };
const randInt = (r, a, b) => a + Math.floor(r() * (b - a + 1));

// ---- The first kit corps (v09). Their tells are all on the glyphs.

// ---- More kit hooks, used by the second batch:
//   alwaysFollow   the tell is always true (accumulating puzzles: the word, the forecast)
//   k.carry        what the last layer left for this one (lv.carryNext); k.corpR: the corp's rng
//   k.seed         the run seed (KERNEL)
//   onEnter(c)     when the corp starts (SAFEHARBOR's premium)
//   onPick(t)      every tap, before the reveal (TOLLGATE's toll)
//   onHit(t)       corp twist after an ICE hit, after your mods (claims, numberwong)
//   maskMs         glyphs flip face down this long after the layer opens (FORGET-ME-NOT)
//   surge          pay grows as the clock runs down (RYDR)
const ROW_NAMES = (rows, r) => r === 0 ? 'top row' : r === rows - 1 ? 'bottom row' : `row ${r + 1}`;
const COL_NAMES = (cols, c) => c === 0 ? 'left column' : c === cols - 1 ? 'right column' : `column ${c + 1}`;
// ---- Tier 3, group 1: moving nodes. slideTo moves a node to another cell with an
// animation; the board draws it (and its tap box) on the way, so taps follow it.
// QUICK EYE makes every move 30% slower. ANCHOR stops them for a layer (lv.anchor).
const moveScale = () => has('quickeye') ? 1.3 : 1;
const slideMs = ms => ms * moveScale();
function setCellOf(lv, t, cell) { t.cell = cell; t.col = cell % lv.cols; t.row = Math.floor(cell / lv.cols); }
// Where a node is drawn right now (part way through a slide). arc: a sideways bow, in cells.
function tilePos(t, now) {
  const s = t.slide;
  if (!s) return t;
  const f = clamp((now - s.at) / s.ms, 0, 1);
  if (f >= 1) { t.slide = null; return t; }
  const e = f < 0.5 ? 2 * f * f : 1 - 2 * (1 - f) * (1 - f);
  const dc = t.col - s.fc, dr = t.row - s.fr, d = Math.hypot(dc, dr) || 1, bow = (s.arc || 0) * Math.sin(Math.PI * f);
  return { col: s.fc + dc * e - dr / d * bow, row: s.fr + dr * e + dc / d * bow };
}
function slideTo(lv, t, cell, ms, arc = 0) {
  const now = performance.now(), p = tilePos(t, now);
  t.slide = { fc: p.col, fr: p.row, at: now, ms: Math.max(1, slideMs(ms)), arc };
  setCellOf(lv, t, cell);
}
// Heat vision (PREDATOR, INFRARED): a node drawn as a heat blob from the ramp.
const HEAT_RAMP = ' .:-=+*#%@';
function heatGlyph(v, ph, now) {
  const slot = Math.floor(now / 140), rows = [];
  for (let y = 0; y < 3; y++) {
    let s = '';
    for (let x = 0; x < 5; x++) {
      const edge = (x === 0 || x === 4 ? 0.7 : 1) * (y === 1 ? 1 : 0.82);
      s += HEAT_RAMP[clamp(Math.floor((v * edge + (h01(ph + x * 13 + y * 31, slot) - 0.5) * 0.22) * 10), 0, 9)];
    }
    rows.push(s);
  }
  return rows;
}
const heatCol = v => v > 0.8 ? C.money : v > 0.62 ? C.danger : v > 0.35 ? C.text : C.mid;
// PREDATOR: heat by the second, blurring from one reading to the next.
function predHeat(t, ft, p) {
  const at = k => t.safe ? 0.76 + 0.24 * h01(t.ph, k) : t === p.hot ? 0.55 + 0.4 * h01(t.ph, k) : p.spread * h01(t.ph, k);
  const k = Math.floor(ft / 1000), f = clamp((ft - k * 1000) / 400, 0, 1);
  return at(k - 1) + (at(k) - at(k - 1)) * f;
}
// ---- Tier 3, group 2: hot and cold by pointer. On desktop you hover; on touch you drag a
// finger around (a drag never picks: lifting selects a node, a second tap confirms; a
// plain tap still picks). nearness: how close the pointer is to a node (0 far .. 1 on it).
const dragCorp = () => !!(st.mode === 'play' && st.corp && st.corp.hasBoss && st.corp.def.drag && !st.mp);
function pointerCell(lv) {
  if (st.kbGrid && st.hover >= 0 && lv.tiles[st.hover]) { const t = lv.tiles[st.hover]; return { col: t.col, row: t.row }; }
  const p = st.ptr;
  if (!p || !L) return null;
  const cx = (p.x - L.ox) / L.cw - 0.5, cy = (p.y - L.oy) / L.chh - 0.5;
  const col = (cx - L.gx - (TILE_W - 1) / 2) / (TILE_W + GAP_X), row = (cy - BOARD_Y - (TILE_H - 1) / 2) / (TILE_H + GAP_Y);
  if (col < -0.8 || row < -0.8 || col > lv.cols - 0.2 || row > lv.rows - 0.2) return null;
  return { col, row };
}
function nearness(lv, t, reach = 2.5) {
  const p = pointerCell(lv);
  if (!p) return null;
  const q = tilePos(t, performance.now());
  return clamp(1 - Math.hypot(p.col - q.col, p.row - q.row) / reach, 0, 1);
}
// Text that floats up and fades (emotes), at a screen position in pixels.
function floatText(text, x, y, col, life = 1.6) {
  [...text].forEach((ch, i) => parts.push({ mode: 'float', ch, x: x + (i - text.length / 2) * L.cw, y, col, t: 0, life, alpha: 1, rot: 0, scr: 0 }));
}
const SQ_GOOD = ['<3', '+1', ':)', ':D', '<3 <3', 'lol', 'omg'], SQ_BAD = [':(', '-1', 'ew', '>:(', 'ratio', 'cringe'], SQ_MEH = ['...', 'k', '?', 'meh'];
const kfmt = v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(Math.round(v));
// ---- Tier 3, group 3: time and screen tricks.
// UPSIDE: the whole screen is drawn upside down (render) and taps are flipped back, except
// on its boss, where tile taps land on the node mirrored across the center.
const flipNow = () => !!(st.mode === 'play' && st.lv && st.corp && st.corp.hasBoss && st.corp.def.flip && !st.pause && !st.dev && !st.mp);
const upsideMirror = () => !!(st.flipNow && st.lv && st.lv.boss);
const ptXY = e => st.flipNow ? [W - e.clientX, H - e.clientY] : [e.clientX, e.clientY];
// LAGRANGE: everything slides one column right (wrapping) every beat.
const lagNext = (lv, t) => t.row * lv.cols + (t.col + 1) % lv.cols;
// ---- Tier 3, group 4: loops, the fourth wall, a ball game, and linked nodes.
// FOURTH WALL: what it says to you (from your save). tell: the line that gives it away.
const FW_ZONE = { corner: 'the corners', edge: 'the edges', middle: 'the middle' };

// ---- v11 corps: CIPHER, HYDRA, BLACKOUT (SPEC §17 ideas, each with its own style).
// CIPHER's alphabet: every letter on screen becomes one of these inside the corp.
// Digits and punctuation stay readable. Shapes only (no card suits or emoji-prone signs).
const CIPHER_SYMS = [...'◆◇▲△▼▽●○■□◐◑◒◓◢◣◤◥★☆✚⌘Ω∆∑¤'];
const touching = (a, b) => a !== b && Math.abs(a.col - b.col) <= 1 && Math.abs(a.row - b.row) <= 1;
const moveTile = (lv, t, cell) => { t.cell = cell; t.col = cell % lv.cols; t.row = Math.floor(cell / lv.cols); };
// CIPHER: the letter-to-symbol map for this visit (a new one after each boss shift), or
// null when the screen should read normally (outside CIPHER, menus, pause, dev menu).
function cipherNow(now) {
  const c = st.corp;
  if (st.mode !== 'play' || st.pause || st.dev || !c || !c.hasBoss || !c.def.cipher) return null;
  const salt = c.cipherSalt || 0;
  if (!c.cipherMap || c.cipherMapSalt !== salt) {
    c.cipherMap = shuffle(CIPHER_SYMS.slice(), rngFor(st.run.seed, 'cipher', c.node.id, salt));
    c.cipherMapSalt = salt;
  }
  const map = c.cipherMap, shifting = c.cipherShiftAt && now - c.cipherShiftAt < 350;
  return ch => {
    const k = ch.toUpperCase().charCodeAt(0) - 65;
    if (k < 0 || k > 25 || ch.length !== 1) return ch;
    return shifting && Math.random() < 0.6 ? noiseCh() : map[k];
  };
}
// Each corp's tell, as written in the codex after you beat it.
const CORP_TELL = {   // the corps/ files add their own
  omni: 'it copies one corp you beat in this sector: its tell, its twists. the intro lists which ones it could be. ICE hits for 2 on its boss.',
};

// Corp intro ("boot up") art. Rows get padded to the same width so they line up.
const CORP_ART = {   // the corps/ files add their own
  omni: [
    '          _______',
    "      .-''       ''-.",
    '     /    .-----.    \\',
    '    |    (   @   )    |',
    "     \\    '-----'    /",
    "      '-._       _.-'",
    "          '''''''",
  ],
};
