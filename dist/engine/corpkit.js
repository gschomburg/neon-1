// NeoN+1 engine/corpkit.js: the corp kit. CORPS / CORP_TELL / CORP_ART start here, every corps/ file adds
// its own corp, and the shared helpers for corp tells come after.
//
// ADDING A CORP
//   1. Copy a corp file in corps/ (corps/boneyard.js is a good one) to corps/KEY.js. It sets
//      CORPS.KEY (the definition and its hooks, see below), CORP_TELL.KEY (the codex text, shown
//      once you beat it) and CORP_ART.KEY (the intro art).
//   2. Add <script src="corps/KEY.js?v=..."></script> to index.html after the other corps (the
//      order of the corps is the order the map picks from, so new ones go at the end).
//   3. Optional: its palette in palettes.js (c_KEY), its music (a track in data/music.js +
//      MUSIC_FOR.KEY), its boss mod in data/mods.js (+ its effect in engine/run.js or active.js).
//   4. Check it: node tools/check.js and node tools/playtest.js (every corp, headless), and
//      node tools/tell_odds.js for how much a position tell helps.
//
// WHAT THE CORP FILES USE from the rest of the game (generated from the corps/ files at v12.00).
// Anything here can be used in a corp's hooks; most corps need only C, st, setMsg, Sound, pickR,
// shuffle, rngFor, wait and the tile helpers.
//   engine/core.js      C, pickR, shuffle, rngFor, clamp, TILE_W, TILE_H, noiseCh, BOARD_Y, cleanSeed, GAP_X,
//                       GAP_Y, mixHex, NOISE, PAL_LIT
//   data/glyphs.js      normMotif, MOTIFS, BONE_GLYPH
//   engine/corpkit.js   CORP_ART, CORP_TELL, CORPS, randInt, h01, moveScale, setCellOf, slideMs, slideTo,
//                       glyphLine, cellZone, COL_NAMES, mirrorGlyph, moveTile, mutateGlyph, nearness,
//                       ROW_NAMES, sameGlyph, aegisBreach, ARCADE_GLYPHS, AUCTION_CALLS, AUCTION_SOLD,
//                       beatClock, boardLoop, BT_SPIN, digitSum, dropLayout, ELEMENT_MARK, ELEMENT_OPPOSITE,
//                       entropyShuffle, FACE_CH, floatText, FORM_ORDERS, freeNear, FW_BUTTONS, fwLines,
//                       geigerAt, gravDrop, habitTop, HEAD_GLYPH, heatCol, heatGlyph, ICE_FLASH, IS_PRIME,
//                       kfmt, lagLand, lagNext, lagSlide, LETTERS, LEX_WORDS, liftRow, lightOf, makeLift,
//                       MOCHI_BOTS, MOCHI_FACES, MOCHI_TOPS, MONTE_BALL, MONTE_CUP, monteShuffle, NEWS_FILLER,
//                       NEWS_VERBS, noirSide, noirStatement, pbServe, pbStep, PET_BODIES, PET_EYES,
//                       PHONE_KEYS, PLAIN_GLYPH, predHeat, radLimit, RAINBOW, SLOT_SYMS, SQ_BAD, SQ_FACES,
//                       SQ_GOOD, SQ_MEH, touching, TOY_GLYPHS, UP_WORDS, ZODIAC
//   engine/mods.js      tv
//   engine/save.js      save
//   engine/sound.js     Sound
//   engine/screen.js    st, g, L, tileOrigin, tileCenter, has
//   engine/effects.js   shake, flash, explode, rand, snapshot
//   engine/render.js    setMsg, wait, candidates, last
//   engine/run.js       lockTile, pick, die, grantLoot, blockHit, frostbite, onSafe
//
'use strict';
NEON_FILES.push(['engine/corpkit.js', 'v12.01']);

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
const PLAIN_GLYPH = normMotif(['', '[ ]', '']);
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
// SPECTRA's colors, each with its own shape.
const RAINBOW = [
  { n: 'red', c: '#ff4a4a', ch: '#' }, { n: 'orange', c: '#ff9a2a', ch: '%' }, { n: 'yellow', c: '#ffe84a', ch: '*' },
  { n: 'green', c: '#4aff6a', ch: '+' }, { n: 'blue', c: '#4ab0ff', ch: '=' }, { n: 'violet', c: '#c86aff', ch: '~' },
];
// DROP-4: a stacked board (chips fall to the bottom) where exactly one chip blocks a line of
// four: three of one color plus it. Returns { cells, color, blocker } or null.
function dropLayout(cols, rows, n, r) {
  const h = Array(cols).fill(0);
  for (let i = 0; i < n; i++) { const open = h.map((v, c) => c).filter(c => h[c] < rows); if (!open.length) return null; h[pickR(open, r)]++; }
  const cells = [], color = {};
  for (let c = 0; c < cols; c++) for (let k = 0; k < h[c]; k++) { const cell = (rows - 1 - k) * cols + c; cells.push(cell); color[cell] = r() < 0.5; }
  const at = (c, rw) => c >= 0 && c < cols && rw >= 0 && rw < rows && color[rw * cols + c] != null ? rw * cols + c : null;
  const blockers = new Set();
  for (let c = 0; c < cols; c++) for (let rw = 0; rw < rows; rw++) for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    const line = [0, 1, 2, 3].map(j => at(c + dc * j, rw + dr * j));
    if (line.some(x => x == null)) continue;
    const xs = line.filter(x => color[x]);
    if (xs.length === 3) blockers.add(line.find(x => !color[x]));
    if (xs.length === 1) blockers.add(xs[0]);
  }
  return blockers.size === 1 ? { cells, color, blocker: [...blockers][0] } : null;
}
// FORM 27B: the orders a form can ask for.
const FORM_ORDERS = [
  { name: 'in reading order', by: () => (a, b) => a.cell - b.cell },
  { name: 'backwards', by: () => (a, b) => b.cell - a.cell },
  { name: 'by columns', by: () => (a, b) => a.col - b.col || a.row - b.row },
  { name: 'bottom row up', by: () => (a, b) => b.row - a.row || a.col - b.col },
];
// CHUCK E. CACHE'S sprites.
const ARCADE_GLYPHS = [[' .-. ', '(o o)', '|^^^|'], ['/oo\\', '<-->', ' /\\ '], [' ^ ^ ', '(@ @)', ' >-< '], ['[- -]', '|ooo|', ' | | '], ['  o  ', ' /|\\ ', ' / \\ '], [' _ _ ', '(*_*)', '/   \\'], ['.-=-.', '|o o|', "'-=-'"], ['<o o>', ' \\_/ ', ' / \\ ']].map(normMotif);
// NOIR: one statement for node t. true: it must be true if q is the real node (q tells the
// truth, everyone else lies). test(x): is it true if x were the real node.
function noirStatement(t, ts, lv, kind, r, truth, q) {
  const others = ts.filter(o => o !== t);
  const mk = (text, test) => test(q) === truth ? { text, test } : null;
  if (kind === 'me') return mk(['I AM', 'REAL'], x => x === t);
  if (!others.length) return mk(['I AM', 'REAL'], x => x === t);
  if (kind === 'is') { const o = truth ? q : pickR(others.filter(o2 => o2 !== q), r) || others[0]; return mk([`${o.label} IS`, 'REAL'], x => x === o); }
  if (kind === 'not') { const o = pickR(others, r); return mk(['NOT', o.label], x => x !== o); }
  if (kind === 'lies') { const o = pickR(others, r); return mk([o.label, 'LIES'], x => x !== o); }
  if (kind === 'row') { const row = truth ? q.row : randInt(r, 0, lv.rows - 1); return mk(['REAL', `ROW ${row + 1}`], x => x.row === row); }
  const side = pickR(Object.keys(NOIR_SIDES), r);
  return mk(NOIR_SIDES[side].text, NOIR_SIDES[side].test(t));
}
const NOIR_SIDES = {
  LEFT: { text: ['LEFT', 'OF ME'], test: t => x => x.col < t.col }, RIGHT: { text: ['RIGHT', 'OF ME'], test: t => x => x.col > t.col },
  ABOVE: { text: ['ABOVE', 'ME'], test: t => x => x.row < t.row }, BELOW: { text: ['BELOW', 'ME'], test: t => x => x.row > t.row },
};
// A side claim by t that's false whoever is real: q isn't on that side (and t never is).
function noirSide(t, q, r) {
  const ok = Object.keys(NOIR_SIDES).filter(k => !NOIR_SIDES[k].test(t)(q));
  const k = pickR(ok, r);
  return { text: NOIR_SIDES[k].text, test: NOIR_SIDES[k].test(t) };
}
// SYNAPSE: where a pick was (by habit), and what you pick most.
const cellZone = (t, lv) => { const e = (t.col === 0 || t.col === lv.cols - 1) + (t.row === 0 || t.row === lv.rows - 1); return e === 2 ? 'corner' : e === 1 ? 'edge' : 'middle'; };
const habitTop = hb => ['corner', 'edge', 'middle'].sort((a, b) => hb[b] - hb[a])[0] + 's';
// TELEPHONIX keypad: [key, letters]. CHOIR: which way a follower faces (by [dx, dy]).
const PHONE_KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', ''], ['#', '']];
const FACE_CH = ['\\', '^', '/', '<', 'o', '>', '/', 'v', '\\'];
// LUCKEEZ reels, BIDBLITZ's host, BYTEPETS (E = eyes).
const SLOT_SYMS = '7$@*%&#';
const AUCTION_CALLS = ['going once!', 'going twice!', 'do I hear 10?', 'bid now! BID NOW!', 'look at this ICE!'];
const AUCTION_SOLD = ['SOLD!', 'SOLD to the runner!', 'SOLD! another?', 'what a steal!'];
const PET_BODIES = [['/\\_/\\', '(E)', ' u u '], [' .-. ', '(E)', "'' ''"], [' .-. ', '(E)', '|/\\/|'], ['/^ ^\\', '(E)', ' \\_/ '], [' ___ ', '[E]', ' d b '], [' ^ ^ ', '{E}', ' ~~~ ']];
const PET_EYES = ['o.o', 'O.O', '^.^', '-.-', '*.*', 'u.u'];
// PAWN BROS: the outer ring of the grid, clockwise from the top left (GO).
function boardLoop(cols, rows) {
  const out = [];
  for (let c = 0; c < cols; c++) out.push(c);
  for (let r = 1; r < rows; r++) out.push(r * cols + cols - 1);
  for (let c = cols - 2; c >= 0; c--) out.push((rows - 1) * cols + c);
  for (let r = rows - 2; r >= 1; r--) out.push(r * cols);
  return out;
}
// TEMPO: where we are in the beat. The music's own clock when it's playing; otherwise a
// steady one at the corp song's tempo.
function beatClock(now) {
  const b = Music.beat && Music.beat();
  if (b && b.ms > 0) { const d = (now - b.perf) / b.ms; return { phase: ((d % 1) + 1) % 1, n: b.n + Math.floor(d), bpm: 60000 / b.ms }; }
  const sg = SONGS[MUSIC_FOR[st.corp && st.corp.def.key]] || { bpm: 120 }, ms = 60000 / sg.bpm, d = now / ms;
  return { phase: d % 1, n: Math.floor(d), bpm: sg.bpm };
}
// GRIDLOCK: a node's traffic light at time `now`.
const lightOf = (lv, t, now) => { const c = lv.lights.cyc, p = (now + (t.ph || 0)) % c; return p < c * 0.42 ? 'green' : p < c * 0.58 ? 'amber' : 'red'; };
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
// HALFLIFE: which node the Geiger counter is on, and the corp's radiation limit (s).
function geigerAt(lv, lt) {
  const gg = lv.geiger;
  if (!gg) return null;
  const open = gg.order.filter(t => t.state === 'closed');
  return open.length ? open[Math.floor(lt / gg.per) % open.length] : null;
}
const radLimit = c => (c.tier >= 2 ? 7 : 8) * c.counts.length;
// WATCHPOINT / CCTV: ICE caught on camera.
const ICE_FLASH = normMotif(['###', '###', '###']);
// HEADLINE's ticker.
const NEWS_VERBS = ['markets crash', 'mayor resigns', 'icebergs sighted', 'cats elected', 'stocks soar', 'aliens land', 'pizza recalled', 'drones strike'];
const NEWS_FILLER = ['LOCAL MAN WINS NOTHING', 'WEATHER: YES', 'EXPERTS BAFFLED', 'SPORTS: A TEAM WON', 'CELEB SAYS THING', 'NEW PHONE SAME AS OLD PHONE', 'TRAFFIC: BAD'];
// Smooth-ish noise in [0, 1) for flicker schedules: h01(seed, slot).
const h01 = (a, b) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };
// MOCHI MOCHI faces, ears and feet; PLAYTIME toys.
const MOCHI_FACES = ['(^.^)', '(o.o)', '(=.=)', '(>.<)', '(*.*)', '(-.-)', '(^o^)', '(u.u)', "('.')", '(o_o)', '(^_^)', '(;.;)', '(@.@)', '(n.n)'];
const MOCHI_TOPS = ['/\\ /\\', ' ^ ^ ', ' o o ', '  *  ', ' ~ ~ ', '(\\ /)'];
const MOCHI_BOTS = [' u u ', ' <3  ', '  w  ', ' ) ( ', ' v v ', ' " " '];
const TOY_GLYPHS = [
  [' _|_ ', '(___)', '  V  '], ['[o_o]', ' /|\\ ', ' / \\ '], [' \\o/ ', ' |_| ', '[___]'], [' .-. ', '( o )', " '-' "],
  ['  __ ', '<(o )', '(___)'], ['  __ ', '_/__\\', '-o--o'], ['+---+', '| A |', '+---+'], [' (@) ', '  |  ', '  |  '],
  ['_[]_ ', '|___|', 'o-o-o'], ['  /\\ ', ' <  >', '  \\/ '], ['()_()', '(o.o)', '(___)'], ['  |  ', '-(+)-', '  |  '],
].map(normMotif);
// A glyph on one line, for hint lines: [ / \ ][<   >][ \ / ]
const glyphLine = g => g.map(l => `[${l}]`).join('');
// How alike two glyphs are: matching visible characters in the same spots.
const glyphLikeness = (a, b) => { let n = 0; for (let y = 0; y < 3; y++) for (let x = 0; x < 5; x++) if (a[y][x] !== ' ' && a[y][x] === b[y][x]) n++; return n; };
const randInt = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const digitSum = s => [...s].reduce((t, d) => t + (+d || 0), 0);

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
const IS_PRIME = v => { if (v < 2) return false; for (let d = 2; d * d <= v; d++) if (v % d === 0) return false; return true; };
const ZODIAC = [
  ['ARI', 'fire'], ['LEO', 'fire'], ['SAG', 'fire'], ['TAU', 'earth'], ['VIR', 'earth'], ['CAP', 'earth'],
  ['GEM', 'air'], ['LIB', 'air'], ['AQU', 'air'], ['CAN', 'water'], ['SCO', 'water'], ['PIS', 'water'],
];
const ELEMENT_MARK = { fire: '^ ^ ^', earth: '# # #', air: '= = =', water: '~ ~ ~' };
const ELEMENT_OPPOSITE = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' };
const LEX_WORDS = {
  animal: ['TIGER', 'HORSE', 'MOUSE', 'SNAKE', 'EAGLE', 'SHARK', 'ZEBRA', 'OTTER', 'CAMEL'],
  tech: ['PIXEL', 'LASER', 'ROBOT', 'MODEM', 'CABLE', 'CACHE', 'PROXY', 'VIRUS', 'TOKEN', 'LOGIC'],
  food: ['PIZZA', 'BREAD', 'MANGO', 'LEMON', 'SUSHI', 'TACOS', 'CANDY', 'BACON'],
  color: ['GREEN', 'BLACK', 'WHITE', 'AMBER', 'CORAL', 'IVORY', 'OLIVE'],
};
const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWY';
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
const MONTE_CUP = normMotif([' ___ ', '/   \\', "'---'"]);
const MONTE_BALL = normMotif([' ___ ', '/___\\', '  o  ']);
// MONTE: swap cups. Most swaps take the ball along.
async function monteShuffle(lv, count, ms, boss) {
  const m = lv.monte;
  m.moving = true;
  const r = rngFor(st.run.seed, 'monte', st.corp.node.id, st.corp.idx, lv.misses);
  for (let i = 0; i < count && st.lv === lv; i++) {
    const cups = lv.tiles.filter(t => t.state === 'closed');
    if (cups.length < 2) break;
    const real = cups.find(t => t.safe);
    const a = real && r() < 0.65 ? real : pickR(cups, r), b = pickR(cups.filter(t => t !== a), r);
    const pairs = [[a, b]];
    if (boss && i % 2 && cups.length >= 4) {
      const rest = cups.filter(t => t !== a && t !== b), c1 = pickR(rest, r);
      pairs.push([c1, pickR(rest.filter(t => t !== c1), r)]);
    }
    for (const [x, y] of pairs) { const cx = x.cell, cy = y.cell; slideTo(lv, x, cy, ms, 0.5); slideTo(lv, y, cx, ms, -0.5); }
    Sound.whoosh();
    await wait(slideMs(ms) + 40);
  }
  m.moving = false;
}
// ENTROPY: everything still in play jumps to new cells; the decoys get new glyphs.
function entropyShuffle(lv) {
  const e = lv.ent, r = rngFor(st.run.seed, 'ent', st.corp.node.id, st.corp.idx, e.n++);
  const movers = lv.tiles.filter(t => t.state === 'closed');
  const fixed = new Set(lv.tiles.filter(t => t.state !== 'closed').map(t => t.cell));
  const cells = [];
  for (let c = 0; c < lv.cols * lv.rows; c++) if (!fixed.has(c)) cells.push(c);
  const to = shuffle(cells, r).slice(0, movers.length);
  movers.forEach((t, i) => slideTo(lv, t, to[i], 450));
  // new glyphs that were never on the board, so the real one is the only one that stays
  let pool = shuffle(MOTIFS.filter(m => !e.seen.has(m)), r);
  if (pool.length < movers.length) { e.seen = new Set(lv.tiles.map(t => t.glyph)); pool = shuffle(MOTIFS.filter(m => !e.seen.has(m)), r); }
  for (const t of movers) {
    if (t.safe || t.loaded || (t === e.decoy && e.n === 1) || !pool.length) continue;
    t.glyph = pool.pop(); e.seen.add(t.glyph);
  }
  Sound.whoosh();
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
// AEGIS: the line breaks through at the bottom.
async function aegisBreach(lv) {
  const run = st.run, real = lv.tiles[lv.safe];
  st.busy = true;
  lv.scanned = true;   // no perfect after a breach
  const bottom = lv.tiles.filter(t => t.row === lv.rows - 1 && t.state === 'closed');
  if (!st.god) run.integrity -= 1;
  Sound.trap(); shake(9); flash(C.danger, 0.18, 0.35);
  if (bottom.includes(real)) {
    setMsg('> it broke through. -1 int.', C.danger);
    await wait(500);
    if (run.integrity <= 0) return die();
    return onSafe(real);
  }
  for (const t of bottom) lockTile(t, C.danger, 'breach');
  setMsg('> breach! -1 int. they fall back.', C.danger);
  await wait(450);
  if (run.integrity <= 0) return die();
  const top = Math.min(...lv.tiles.map(t => t.row));
  for (const t of lv.tiles) slideTo(lv, t, t.cell - top * lv.cols, 520);
  await wait(slideMs(520));
  st.busy = false; lv.readyAt = performance.now();
}
// GRAVITAS: gravity. Everything falls and stacks, except the floaters (the real node; deeper,
// one decoy on the first drop), which rise one row, past the node above if they have to.
async function gravDrop(lv, own = true) {
  const g = lv.grav, real = lv.tiles[lv.safe];
  g.n++;
  if (own) st.busy = true;
  const floats = t => t.state === 'closed' && (t === real || (t === g.bounce && g.n === 1));
  let moved = false;
  for (let col = 0; col < lv.cols; col++) {
    const list = lv.tiles.filter(t => t.col === col).sort((a, b) => a.row - b.row);
    const f = list.find(floats), others = list.filter(t => t !== f), place = new Map();
    if (!f) others.forEach((t, j) => place.set(t, lv.rows - others.length + j));
    else {
      const want = Math.max(0, f.row - 1), top = lv.rows - others.length;
      if (want < top) { others.forEach((t, j) => place.set(t, top + j)); place.set(f, want); }
      else {
        const top2 = top - 1, pIdx = want - top2, stack = others.slice();
        stack.splice(pIdx, 0, f);
        stack.forEach((t, j) => place.set(t, top2 + j));
      }
    }
    for (const [t, row] of place) if (row !== t.row) { slideTo(lv, t, row * lv.cols + col, 420); moved = true; }
  }
  if (moved) { Sound.whoosh(); await wait(slideMs(420) + 40); shake(2); }
  if (own && st.lv === lv) { st.busy = false; lv.readyAt = performance.now(); }
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
const SQ_FACES = ['[@_@]', '[o_o]', '[^_^]', '[-_-]', '[*_*]', '[>_<]', '[._.]', '[0_0]', '[=_=]', '[u_u]', '[x_x]', '[;_;]'];
const SQ_GOOD = ['<3', '+1', ':)', ':D', '<3 <3', 'lol', 'omg'], SQ_BAD = [':(', '-1', 'ew', '>:(', 'ratio', 'cringe'], SQ_MEH = ['...', 'k', '?', 'meh'];
const kfmt = v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(Math.round(v));
// ---- Tier 3, group 3: time and screen tricks.
// UPSIDE: the whole screen is drawn upside down (render) and taps are flipped back, except
// on its boss, where tile taps land on the node mirrored across the center.
const flipNow = () => !!(st.mode === 'play' && st.lv && st.corp && st.corp.hasBoss && st.corp.def.flip && !st.pause && !st.dev && !st.mp);
const upsideMirror = () => !!(st.flipNow && st.lv && st.lv.boss);
const ptXY = e => st.flipNow ? [W - e.clientX, H - e.clientY] : [e.clientX, e.clientY];
const UP_WORDS = ['REAL', 'TRUE', 'YES', 'NODE', 'KEY', 'UP', 'SKY', 'RISE', 'GO', 'DATA', 'LIFT', 'HERE', 'GATE', 'CORE', 'ROOT', 'PATH'];
// LAGRANGE: everything slides one column right (wrapping) every beat.
const lagNext = (lv, t) => t.row * lv.cols + (t.col + 1) % lv.cols;
function lagSlide(lv) {
  const now = performance.now();
  for (const t of lv.tiles) {
    const wrap = t.col === lv.cols - 1;
    slideTo(lv, t, lagNext(lv, t), 300);
    if (wrap) { t.slide = null; t.wrapAt = now; }   // wraps around: jumps to the left edge (no drawing off the board)
  }
  Sound.whoosh();
}
// a tap that waited for the slide: whatever is in that cell now gets picked
function lagLand(lv, cell) {
  const i = lv.tiles.findIndex(t => t.cell === cell && t.state === 'closed');
  if (i < 0) { setMsg('> lag: it landed on nothing.', C.mid); Sound.deny(); return; }
  st.lagBypass = true;
  pick(i);
}
const BT_SPIN = '|/-\\';
// ---- Tier 3, group 4: loops, the fourth wall, a ball game, and linked nodes.
// FOURTH WALL: what it says to you (from your save). tell: the line that gives it away.
const FW_ZONE = { corner: 'the corners', edge: 'the edges', middle: 'the middle' };
function fwLines(top, colTop) {
  const chat = [];
  const killer = Object.entries(save.corpStats || {}).sort((a, b) => (b[1].lost || 0) - (a[1].lost || 0))[0];
  if (killer && killer[1].lost) chat.push(`> ${killer[1].lost} deaths to ${corpDef(killer[0]).name.toLowerCase()}. again?`);
  chat.push(`> ${save.runs} runs. ${save.wins} wins. hm.`);
  const m = st.run && st.run.mods.length ? MODS[st.run.mods[Math.floor(Math.random() * st.run.mods.length)]] : null;
  chat.push(m ? `> ${m.name.toLowerCase()}? bold choice.` : '> no mods? brave.');
  const d = new Date(), hh = d.getHours();
  chat.push(`> it's ${hh}:${String(d.getMinutes()).padStart(2, '0')}. ${hh >= 23 || hh < 5 ? 'go to bed.' : 'on company time?'}`);
  chat.push('> i can see your cursor, you know.');
  return { tell: `> ${FW_ZONE[top]}${colTop != null ? ` + col ${colTop + 1}` : ''}? not today.`, chat };
}
const FW_BUTTONS = ['  OK ', 'RETRY', ' SEND', ' HELP', ' [X] ', ' (x) ', ' [+] ', ' {x} ', ' [*] ', 'CLOSE', ' x   ', ' [k] '];
// PLAYBALL: ball physics in screen cells. The paddles sit on row 7 and just under the board.
function pbServe(lv, b, now) {
  const yB = BOARD_Y + L.gh;
  Object.assign(b, { x: lv.pad, y: yB - 0.6, vx: (Math.random() < 0.5 ? -1 : 1) * rand(6, 10), vy: -7, out: false, at: now });
}
function pbStep(lv, b, h, now) {
  const left = L.gx - 0.5, right = L.gx + L.gw - 0.5, yT = BOARD_Y - 1, yB = BOARD_Y + L.gh;
  const px = b.x, py = b.y;
  b.x += b.vx * h; b.y += b.vy * h;
  if (b.x < left) { b.x = 2 * left - b.x; b.vx = Math.abs(b.vx); }
  if (b.x > right) { b.x = 2 * right - b.x; b.vx = -Math.abs(b.vx); }
  // the paddles (both move together)
  for (const [row, dir] of [[yT, 1], [yB, -1]]) {
    const crossing = dir > 0 ? b.y <= row + 0.5 && py > row + 0.5 : b.y >= row - 0.5 && py < row - 0.5;
    if (!crossing) continue;
    if (Math.abs(b.x - lv.pad) <= 4.6) {
      b.y = row + 0.5 * dir; b.vy = Math.abs(b.vy) * dir;
      b.vx = clamp(b.vx + (b.x - lv.pad) * 1.3, -15, 15);
      Sound.tick();
    }
  }
  if (b.y < yT - 0.6 || b.y > yB + 0.6) { b.out = true; return 'out'; }
  // nodes: bounce off closed ones and bump them
  for (const t of lv.tiles) {
    if (t.state !== 'closed') continue;
    const { tx, ty } = tileOrigin(t), w = t.wide ? TILE_W * 2 + GAP_X : TILE_W;
    if (b.x < tx - 0.5 || b.x > tx + w - 0.5 || b.y < ty - 0.5 || b.y > ty + TILE_H - 0.5) continue;
    const wasIn = px >= tx - 0.5 && px <= tx + w - 0.5;
    if (wasIn) b.vy = -b.vy; else b.vx = -b.vx;
    b.x = px; b.y = py;
    if (t.safe) { t.ringAt = now; Sound.ping(1760); }
    else {
      t.bumps = (t.bumps || 0) + 1; t.bumpAt = now;
      if (t.bumps >= 2) lockTile(t, C.mid, 'crack'); else Sound.tick();
    }
    return 'bump';
  }
  return null;
}

// ---- v11 corps: CIPHER, HYDRA, BLACKOUT (SPEC §17 ideas, each with its own style).
// CIPHER's alphabet: every letter on screen becomes one of these inside the corp.
// Digits and punctuation stay readable. Shapes only (no card suits or emoji-prone signs).
const CIPHER_SYMS = [...'◆◇▲△▼▽●○■□◐◑◒◓◢◣◤◥★☆✚⌘Ω∆∑¤'];
const HEAD_GLYPH = normMotif([" ,^, ", '<o o>', " 'v' "]); // HYDRA's young heads
// HYDRA: a free cell touching `t` (8 around it), or null.
function freeNear(lv, t, r) {
  const used = new Set(lv.tiles.map(o => o.cell)), out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const col = t.col + dc, row = t.row + dr;
    if ((dr || dc) && col >= 0 && col < lv.cols && row >= 0 && row < lv.rows && !used.has(row * lv.cols + col)) out.push(row * lv.cols + col);
  }
  return out.length ? pickR(out, r) : null;
}
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
