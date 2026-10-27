// check.js: a fingerprint of the game, to prove a change didn't change anything it shouldn't.
//
// Loads the game headless (the scripts index.html loads, in order: one file or many), then records:
//   - every corp's layers: 3 tiers x 3 seeds x every layer (boss too), dressed by the corp: node
//     positions, glyphs, tell flags and the corp's layer state
//   - maps (genMap) for a few seeds, and which corps each map step picks
//   - every data table: corps, mods, items, corp art and text, music, glyphs, logos, names, help
//     pages, palettes, player styles...
//   - a hash of every function's code (moving code is fine; editing it shows up here)
//
// Usage:
//   node tools/check.js save <name> [game.html]    record a fingerprint (tools/check/<name>.json)
//   node tools/check.js diff <a> <b>                compare two fingerprints
//   node tools/check.js [game.html]                 record "now" and compare it to "baseline"
// game.html defaults to dist/index.html.

const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(__dirname, 'check');

// ---- load the game into one headless context
function load(file) {
  const html = fs.readFileSync(file, 'utf8');
  const base = path.dirname(file);
  const scripts = [];
  for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1] || '', src = (attrs.match(/src="([^"]+)"/) || [])[1];
    if (src && /^https?:/.test(src)) continue;   // firebase etc.
    if (src) scripts.push({ name: src, code: fs.readFileSync(path.join(base, src.split('?')[0]), 'utf8') });
    else scripts.push({ name: 'inline', code: m[2] });
  }
  // a hook that hands the game's tables to this tool, put where the debug hook is made
  const NAMES = ['CONFIG', 'CORPS', 'FINAL', 'PUBLIC', 'CORP_TELL', 'CORP_ART', 'CODEX_CORPS', 'MODS', 'ITEMS', 'RARITY',
    'STAGES', 'MOD_STAGE', 'ANOMALIES', 'LEGACY', 'SONGS', 'MUSIC_FOR', 'SCALES', 'MOTIFS', 'GLYPHS',
    'NAME_A', 'NAME_B', 'NAME_C', 'HELP_PAGES', 'PALETTES', 'PLAYER_STYLES', 'LOCK_LABEL', 'TITLE', 'COVER',
    'START_NOTE', 'HIT_FX', 'END_FX', 'TAP_FX', 'BOARD_FX', 'CIPHER_SYMS', 'RAINBOW', 'ZODIAC', 'LEX_WORDS'];
  const hook = `window.__check = { genLayer, genMap, pickCorps, ${NAMES.join(', ')} };\n`;
  const hi = scripts.findIndex(s => s.code.includes('window.__br = {'));
  if (hi < 0) throw new Error('no window.__br in the game');
  scripts[hi].code = scripts[hi].code.replace('window.__br = {', hook + 'window.__br = {');

  const noop = () => {};
  const errors = [];
  const ctx2d = new Proxy({}, { get: (t, k) => k === 'measureText' ? () => ({ width: 60 }) : (k in t ? t[k] : noop), set: (t, k, v) => (t[k] = v, true) });
  const canvas = { getContext: () => ctx2d, addEventListener: noop, style: {}, width: 0, height: 0 };
  // a fixed clock, so anything that shows the time (FOURTH WALL) comes out the same every run
  const FIXED = new Date('2026-01-01T12:00:00Z').getTime();
  class FixedDate extends Date { constructor(...a) { super(...(a.length ? a : [FIXED])); } static now() { return FIXED; } }
  const sandbox = {
    performance: { now: () => 0 }, setTimeout: noop, setInterval: noop, clearTimeout: noop, clearInterval: noop,
    requestAnimationFrame: noop, URLSearchParams, Math, JSON, Date: FixedDate, Object, Array, Set, Map, WeakMap, WeakSet, Promise, Number, String, RegExp, Proxy, Symbol, Error,
    console: { log: noop, warn: noop, error: (...a) => errors.push(a.join(' ')) },
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop }, location: { search: '', href: 'file:///game/index.html', protocol: 'file:' },
    navigator: {}, history: { replaceState: noop },
    document: { getElementById: () => canvas, addEventListener: noop, createElement: () => ({ style: {}, setAttribute: noop, addEventListener: noop }),
      documentElement: { style: {} }, body: { style: {}, appendChild: noop }, fonts: null, querySelector: () => null },
    fetch: () => new Promise(() => {}),   // offline: the intro asks the leaderboard (it never answers here)
    window: { innerWidth: 390, innerHeight: 844, devicePixelRatio: 1, addEventListener: noop, matchMedia: () => ({ matches: false }) },
  };
  sandbox.window.window = sandbox.window;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  // the game sets window.X; in the browser window IS the global object, so mirror that
  for (const s of scripts) {
    try { vm.runInContext(s.code.replace(/\bwindow\./g, 'globalThis.window.'), sandbox, { filename: s.name }); }
    catch (e) { throw new Error(`loading ${s.name}: ${e.stack || e.message}`); }
    Object.assign(sandbox, sandbox.window);
  }
  const G = sandbox.window.__check;
  if (!G) throw new Error('the game loaded but the check hook is missing');
  return { G, errors, files: scripts.map(s => s.name) };
}

// ---- turn anything into plain, stable JSON
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const fnHash = f => hash(String(f).replace(/\s+/g, ' '));
function plain(v, seen = new Set(), depth = 0) {
  if (v === null || v === undefined || typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'function') return 'fn:' + fnHash(v);
  if (depth > 12) return '[deep]';
  if (seen.has(v)) return v && typeof v.cell === 'number' ? `[tile@${v.cell}]` : '[ref]';
  if (v instanceof Set) return { $set: [...v].map(x => plain(x, seen, depth + 1)) };
  if (v instanceof Map) return { $map: [...v].map(([k, x]) => [plain(k, seen, depth + 1), plain(x, seen, depth + 1)]) };
  seen.add(v);
  let out;
  if (Array.isArray(v)) out = v.map(x => plain(x, seen, depth + 1));
  else { out = {}; for (const k of Object.keys(v).sort()) out[k] = plain(v[k], seen, depth + 1); }
  seen.delete(v);
  return out;
}
// a tile that another tile points to (TWINLINK partners...) is written as its cell
function plainLayer(lv) {
  const cells = new Set(lv.tiles.map(t => t));
  const fix = (v, top) => {
    if (v && typeof v === 'object' && !top && cells.has(v)) return `[tile@${v.cell}]`;
    if (Array.isArray(v)) return v.map(x => fix(x));
    if (v && typeof v === 'object' && !(v instanceof Set) && !(v instanceof Map)) { const o = {}; for (const k of Object.keys(v)) o[k] = fix(v[k]); return o; }
    return v;
  };
  return plain(Object.assign({}, fix(lv, true), { tiles: lv.tiles.map(t => fix(t, true)) }));
}

// ---- the fingerprint
function fingerprint(file) {
  const { G, errors, files } = load(file);
  const fp = { files, loadErrors: errors, data: {}, layers: {}, maps: {}, code: {} };
  for (const k of Object.keys(G)) {
    if (typeof G[k] === 'function') { fp.code[k] = fnHash(G[k]); continue; }
    fp.data[k] = plain(G[k]);
  }
  // every function inside the tables (corp hooks, mod effects) by name
  for (const [tname, t] of Object.entries(G)) if (t && typeof t === 'object') for (const [k, v] of Object.entries(t)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) for (const [h, f] of Object.entries(v)) if (typeof f === 'function') fp.code[`${tname}.${k}.${h}`] = fnHash(f);
    if (typeof v === 'function') fp.code[`${tname}.${k}`] = fnHash(v);
  }
  // layers: every corp, tiers 1-3, 3 seeds, all layers
  const LAYERS = G.CONFIG.corpLayers || 5;
  for (const key of Object.keys(G.CORPS)) {
    const def = G.CORPS[key];
    for (const tier of [1, 2, 3]) for (const seed of ['A', 'BB', 'C3']) {
      let prev = null;
      for (let i = 0; i < LAYERS; i++) {
        const boss = i === LAYERS - 1, n = Math.min(G.CONFIG.maxNodes || 12, tier + 1 + i);
        const id = `${key}/t${tier}/${seed}/L${i}`;
        try {
          const lv = G.genLayer({ seed: 'check-' + seed, nodeId: '2:1', idx: i, n, tell: boss && def.bossTell ? def.bossTell : def.tell || null,
            prevSafe: prev, loot: !boss, mark: def.tell === 'mark' ? { level: Math.min(3, tier), glyph: ['  #  ', ' ### ', '  #  '] } : null,
            dress: def.dress || null, tier, boss });
          prev = lv.safeCell;
          fp.layers[id] = plainLayer(lv);
        } catch (e) { fp.layers[id] = 'ERROR: ' + e.message; }
      }
    }
  }
  for (const seed of ['MAP1', 'NOIR', 'ZZZZ']) {
    try { fp.maps[seed] = plain(G.genMap(seed)); } catch (e) { fp.maps[seed] = 'ERROR: ' + e.message; }
  }
  return fp;
}

// ---- compare two fingerprints; layers that use Math.random (not seeded) are reported apart
function diff(a, b) {
  const out = [];
  for (const sect of ['data', 'layers', 'maps', 'code']) {
    const keys = new Set([...Object.keys(a[sect] || {}), ...Object.keys(b[sect] || {})]);
    let same = 0;
    for (const k of [...keys].sort()) {
      const x = JSON.stringify(a[sect][k]), y = JSON.stringify(b[sect][k]);
      if (x === y) { same++; continue; }
      if (x === undefined) out.push(`${sect}: + ${k} (new)`);
      else if (y === undefined) out.push(`${sect}: - ${k} (gone)`);
      else {
        let i = 0; while (i < x.length && x[i] === y[i]) i++;
        out.push(`${sect}: ~ ${k}\n    was: ...${x.slice(Math.max(0, i - 40), i + 80)}\n    now: ...${y.slice(Math.max(0, i - 40), i + 80)}`);
      }
    }
    out.unshift(`${sect}: ${same} same of ${keys.size}`);
  }
  if ((b.loadErrors || []).length) out.unshift('load errors: ' + b.loadErrors.join(' | '));
  return out;
}

const [cmd, a1, a2] = process.argv.slice(2);
fs.mkdirSync(DIR, { recursive: true });
const save = (name, fp) => fs.writeFileSync(path.join(DIR, name + '.json'), JSON.stringify(fp));
const read = name => JSON.parse(fs.readFileSync(path.join(DIR, name + '.json'), 'utf8'));
const gameFile = f => f ? path.resolve(f) : path.join(ROOT, 'dist', 'index.html');

if (cmd === 'save') {
  const fp = fingerprint(gameFile(a2));
  save(a1, fp);
  console.log(`saved ${a1}: ${Object.keys(fp.layers).length} layers, ${Object.keys(fp.data).length} tables, ${Object.keys(fp.code).length} functions, files: ${fp.files.length}`);
} else if (cmd === 'diff') {
  console.log(diff(read(a1), read(a2)).join('\n'));
} else {
  const fp = fingerprint(gameFile(cmd));
  save('now', fp);
  if (!fs.existsSync(path.join(DIR, 'baseline.json'))) { save('baseline', fp); console.log('no baseline yet: saved this one as the baseline.'); }
  else {
    const d = diff(read('baseline'), fp);
    console.log(d.join('\n'));
    const changed = d.filter(l => /^\w+: [~+-] /.test(l)).length;
    console.log(changed ? `\n${changed} differences from the baseline.` : '\nsame as the baseline.');
  }
}
