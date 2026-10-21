// Tell odds: how much each corp's tell helps once you know it.
//
// Runs the game's own layer generator (genLayer) headless, many times, and measures the
// chance your FIRST pick on a layer is the real node:
//   blind   = picking any node at random
//   knowing = picking at random among the nodes the tell points to
// Then ranks the corps from hardest to easiest (by "knowing" odds).
//
// Usage:   node tools/tell_odds.js [game.html] [runs]
//   default game: the newest versions/vNN folder's beta_runner_vNN.html, runs: 3000
//
// Not modeled: CHRONOS's clock, damage, items/mods, and picks after the first miss.
// The per-tier tell rules (deeper MIRRORLINE = top-bottom, deeper PERIMETER = edge, SIGIL signature level =
// tier) mirror startCorp() in the game; keep them in sync if those change.

const fs = require('fs'), path = require('path'), vm = require('vm');

const root = path.join(__dirname, '..', 'versions');
const newest = () => {
  const dirs = fs.readdirSync(root).filter(d => /^v\d\d/.test(d)).sort();
  for (const d of dirs.reverse()) {
    const f = fs.readdirSync(path.join(root, d)).find(x => /^beta_runner_v\d\d\.html$/.test(x));
    if (f) return path.join(root, d, f);
  }
  throw new Error('no game file found');
};
const file = process.argv[2] || newest();
const RUNS = Number(process.argv[3]) || 3000;

// ---- load the game with a do-nothing browser
const html = fs.readFileSync(file, 'utf8');
const src = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const noop = () => {};
const ctx2d = new Proxy({}, { get: (t, k) => k === 'measureText' ? () => ({ width: 60 }) : (k in t ? t[k] : noop), set: (t, k, v) => (t[k] = v, true) });
const canvas = { getContext: () => ctx2d, addEventListener: noop, style: {}, width: 0, height: 0 };
const sandbox = {
  performance: { now: () => 0 }, setTimeout: noop, setInterval: noop, clearTimeout: noop,
  requestAnimationFrame: noop, URLSearchParams, console, Math, JSON, Date, Object, Array, Set, Map, Promise, Number, String, RegExp, Proxy,
  localStorage: { getItem: () => null, setItem: noop }, location: { search: '' },
  document: { getElementById: () => canvas, addEventListener: noop, createElement: () => ({ style: {}, setAttribute: noop, addEventListener: noop }),
    documentElement: { style: {} }, body: { style: {}, appendChild: noop }, fonts: null },
  window: { innerWidth: 390, innerHeight: 844, devicePixelRatio: 1, addEventListener: noop },
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const B = sandbox.window.__br;
if (!B || !B.genLayer || !B.CORPS) throw new Error('game does not expose genLayer / CORPS (window.__br)');

// layers per corp (boss included) and the node cap, from the game when it has them
const LAYERS = (B.CONFIG && B.CONFIG.corpLayers) || 4;
const MAX_NODES = (B.CONFIG && B.CONFIG.maxNodes) || 99;

// ---- the tell for each layer of a visit (same rules as startCorp / enterLayer)
function layerTells(def, tier, finalTell) {
  let tell = def.key === 'omni' ? finalTell : def.tell;
  if (tell === 'mirror' && tier >= 2) tell = 'vmirror';
  if (tell === 'corner' && tier >= 2 && def.key !== 'omni') tell = 'edge';
  const boss = def.bossTell || tell;
  return { tells: [...Array(LAYERS - 1).fill(tell), boss], mark: tell === 'mark' ? Math.min(3, Math.max(1, tier)) : 0 };
}

// chance a random pick among the nodes the tell points to is the real node
function knowingOdds(lv, tell, prev) {
  const T = lv.tiles, { cols, rows } = lv;
  let cand = T;
  if (tell === 'corner') cand = T.filter(t => (t.col === 0 || t.col === cols - 1) && (t.row === 0 || t.row === rows - 1));
  if (tell === 'edge') cand = T.filter(t => t.col === 0 || t.col === cols - 1 || t.row === 0 || t.row === rows - 1);
  if (tell === 'center') cand = T.filter(t => t.col > 0 && t.col < cols - 1 && t.row > 0 && t.row < rows - 1);
  if (tell === 'mark') cand = T.filter(t => t.marked);
  if (['mirror', 'vmirror', 'point'].includes(tell) && prev) {
    const c = tell === 'vmirror' ? prev.col : cols - 1 - prev.col;
    const r = tell === 'mirror' ? prev.row : rows - 1 - prev.row;
    cand = T.filter(t => t.col === c && t.row === r);
  }
  if (!cand.length) cand = T;   // tell points nowhere: fall back to any node
  return cand.some(t => t.safe) ? 1 / cand.length : 0;
}

function simulate(def, tier, finalTell) {
  const { tells, mark } = layerTells(def, tier, finalTell);
  const blind = Array(LAYERS).fill(0), know = Array(LAYERS).fill(0);
  for (let s = 0; s < RUNS; s++) {
    let prev = null;
    for (let i = 0; i < LAYERS; i++) {
      const n = Math.min(MAX_NODES, tier + 1 + i);
      const mk = mark ? { level: mark, glyph: mark === 1 ? ['  #  ', ' ### ', '  #  '] : null } : null;
      const lv = B.genLayer({ seed: `odds-${def.key}-${tier}-${finalTell}-${s}`, nodeId: '1:0', idx: i, n, tell: tells[i], prevSafe: prev, loot: false, mark: mk });
      blind[i] += 1 / n;
      know[i] += knowingOdds(lv, tells[i], prev);
      prev = lv.safeCell;
    }
  }
  return { blind: blind.map(x => x / RUNS), know: know.map(x => x / RUNS) };
}

const rows = [];
for (const def of Object.values(B.CORPS)) for (const tier of [1, 2]) rows.push({ name: `${def.name} t${tier}`, ...simulate(def, tier) });
for (const ft of ['corner', 'mark', 'mirror']) rows.push({ name: `OMNI//CORE (${ft})`, ...simulate(B.FINAL, 3, ft) });

const pct = x => `${Math.round(x * 100)}%`;
const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
for (const r of rows) { r.k = avg(r.know); r.adv = avg(r.know) / avg(r.blind); }
rows.sort((a, b) => a.k - b.k);

console.log(`Tell odds: first-pick chance of the real node, ${RUNS} visits each (${path.basename(file)})\n`);
console.log(`| Rank | Corp | Knowing: ${Array.from({ length: LAYERS - 1 }, (_, i) => 'L' + (i + 1)).join(' / ')} / Boss | Avg | Blind avg | Tell advantage |`);
console.log('|---|---|---|---|---|---|');
rows.forEach((r, i) => console.log(`| ${i + 1} | ${r.name} | ${r.know.map(pct).join(' / ')} | ${pct(r.k)} | ${pct(avg(r.blind))} | x${r.adv.toFixed(1)} |`));
console.log('\nRank 1 = hardest once you know the tell. Tell advantage = knowing avg / blind avg.');
