// check.js: a fingerprint of the game, to prove a change didn't change anything it shouldn't.
//
// Loads the game headless (the scripts index.html loads, in order: one file or many), then records:
//   - every corp's layers: 3 tiers x 3 seeds x every layer (boss too), dressed by the corp: node
//     positions, glyphs, tell flags and the corp's layer state
//   - maps (genMap) for a few seeds, and which corps each map step picks
//   - every data table: corps, mods, items, corp art and text, music, glyphs, logos, names, help
//     pages, palettes, player styles...
//   - a hash of every function's code (only with --code: refactors change code on purpose)
//
// The golden file (tools/golden.json, committed) keeps a short hash of each layer, map and table. A plain run compares
// the game to it and exits 1 on any difference, so a refactor that changes what the game makes is caught.
//
// Usage:
//   node tools/check.js                             compare to tools/golden.json (exit 1 on a difference)
//   node tools/check.js --accept                    the game changed on purpose: write tools/golden.json again
//   node tools/check.js save <name> [game.html]    record a full fingerprint (tools/check/<name>.json, not committed)
//   node tools/check.js diff <a> <b> [--code]      compare two full fingerprints in detail
// game.html defaults to dist/index.html.

if (['-h', '--help'].includes(process.argv[2])) { console.log("usage: node tools/check.js [--accept] | save <name> [game.html] | diff <a> <b> [--code]   (fingerprint the game, compare to tools/golden.json)"); process.exit(0); }
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(__dirname, 'check');

// ---- load the game into one headless context (tools/harness.js), with a hook that hands this tool the game's tables
const NAMES = ['CONFIG', 'CORPS', 'FINAL', 'PUBLIC', 'CORP_TELL', 'CORP_ART', 'CODEX_CORPS', 'MODS', 'ITEMS', 'RARITY',
  'STAGES', 'MOD_STAGE', 'ANOMALIES', 'LEGACY', 'SONGS', 'MUSIC_FOR', 'SCALES', 'MOTIFS', 'GLYPHS',
  'NAME_A', 'NAME_B', 'NAME_C', 'HELP_PAGES', 'PALETTES', 'PLAYER_STYLES', 'LOCK_LABEL', 'TITLE', 'COVER',
  'START_NOTE', 'HIT_FX', 'END_FX', 'BOSS_GEAR', 'BOARD_FX', 'CIPHER_SYMS', 'RAINBOW', 'ZODIAC', 'LEX_WORDS'];
function load(file) {
  const g = require('./harness.js').loadGame(file, { hook: `window.__check = { genLayer, genMap, pickCorps, corpPlan, layerSpec, ${NAMES.join(', ')} };` });
  const G = g.window.__check;
  if (!G) throw new Error('the game loaded but the check hook is missing');
  return { G, errors: g.errors, files: g.files };
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
  // layers: every corp, tiers 1-3, 3 seeds, all layers, set up the way the game does (engine/run.js corpPlan / layerSpec)
  for (const key of Object.keys(G.CORPS)) {
    const def = G.CORPS[key];
    for (const tier of [1, 2, 3]) for (const seed of ['A', 'BB', 'C3']) {
      const run = { seed: 'check-' + seed, finalTell: 'corner' }, node = { id: '2:1', corp: key, tier, type: 'corp', sector: 0, mod: null };
      let c, prev = null;
      try { c = Object.assign({ def, node, tier, hasBoss: true, mod: null }, G.corpPlan(node, def, run)); }
      catch (e) { fp.layers[`${key}/t${tier}/${seed}`] = 'ERROR: ' + e.message; continue; }
      for (let i = 0; i < c.counts.length; i++) {
        const id = `${key}/t${tier}/${seed}/L${i}`;
        try {
          const lv = G.genLayer(G.layerSpec(c, run, i, prev));
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
function diff(a, b, withCode = false) {
  const out = [];
  for (const sect of ['data', 'layers', 'maps'].concat(withCode ? ['code'] : [])) {
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

// ---- the golden file: a short hash per layer / map / table (no code), committed
const GOLDEN = path.join(__dirname, 'golden.json');
function golden(fp) {
  const g = { note: 'Made by tools/check.js --accept. A hash of what the game makes; see the top of tools/check.js.' };
  for (const sect of ['data', 'layers', 'maps']) { g[sect] = {}; for (const k of Object.keys(fp[sect]).sort()) g[sect][k] = hash(JSON.stringify(fp[sect][k]).replace(/"fn:[0-9a-f]{10}"/g, '"fn"')); }   // (a function in a table counts as there, not its code)
  return g;
}

const args = process.argv.slice(2), flags = args.filter(x => x.startsWith('--')), [cmd, a1, a2] = args.filter(x => !x.startsWith('--'));
fs.mkdirSync(DIR, { recursive: true });
const save = (name, fp) => fs.writeFileSync(path.join(DIR, name + '.json'), JSON.stringify(fp));
const read = name => JSON.parse(fs.readFileSync(path.join(DIR, name + '.json'), 'utf8'));
const gameFile = f => f ? path.resolve(f) : path.join(ROOT, 'dist', 'index.html');

if (cmd === 'save') {
  const fp = fingerprint(gameFile(a2));
  save(a1, fp);
  console.log(`saved ${a1}: ${Object.keys(fp.layers).length} layers, ${Object.keys(fp.data).length} tables, ${Object.keys(fp.code).length} functions, files: ${fp.files.length}`);
} else if (cmd === 'diff') {
  console.log(diff(read(a1), read(a2), flags.includes('--code')).join('\n'));
} else {
  const fp = fingerprint(gameFile(cmd)), g = golden(fp);
  save('now', fp);   // (the full one, for a detailed diff: node tools/check.js diff <old> now)
  if (fp.loadErrors.length) { console.log('load errors: ' + fp.loadErrors.join(' | ')); process.exitCode = 1; }
  // every key on a corp def must be a known hook (docs/CORP_HOOKS.md): a misspelled one would do nothing
  const hooksDoc = fs.readFileSync(path.join(ROOT, 'docs', 'CORP_HOOKS.md'), 'utf8'), known = new Set();
  for (const line of hooksDoc.split('\n')) if (line.startsWith('| `')) for (const m of line.split('|')[1].matchAll(/`(\w+)/g)) known.add(m[1]);
  const { G } = load(gameFile(cmd)), odd = [];
  for (const [k, d] of Object.entries(G.CORPS)) for (const key of Object.keys(d)) if (!known.has(key)) odd.push(`${k}.${key}`);
  if (odd.length) { console.log('corp keys not in docs/CORP_HOOKS.md (typo, or document the new hook): ' + odd.join(', ')); process.exitCode = 1; }
  if (flags.includes('--accept') || !fs.existsSync(GOLDEN)) {
    fs.writeFileSync(GOLDEN, JSON.stringify(g, null, 1) + '\n');
    console.log(`wrote tools/golden.json: ${Object.keys(g.layers).length} layers, ${Object.keys(g.maps).length} maps, ${Object.keys(g.data).length} tables.`);
  } else {
    const old = JSON.parse(fs.readFileSync(GOLDEN, 'utf8')), out = [];
    for (const sect of ['data', 'layers', 'maps']) {
      const keys = new Set([...Object.keys(old[sect] || {}), ...Object.keys(g[sect])]);
      for (const k of [...keys].sort()) if ((old[sect] || {})[k] !== g[sect][k]) out.push(`${sect}: ${k}${old[sect][k] === undefined ? ' (new)' : g[sect][k] === undefined ? ' (gone)' : ''}`);
    }
    if (!out.length) console.log(`same as tools/golden.json (${Object.keys(g.layers).length} layers, ${Object.keys(g.maps).length} maps, ${Object.keys(g.data).length} tables).`);
    else {
      const bySect = s => out.filter(l => l.startsWith(s)).length;
      console.log(out.slice(0, 40).join('\n') + (out.length > 40 ? `\n... and ${out.length - 40} more` : ''));
      console.log(`\n${out.length} differences from tools/golden.json (data ${bySect('data')}, layers ${bySect('layers')}, maps ${bySect('maps')}).`);
      console.log('on purpose? node tools/check.js --accept. details: save a fingerprint on the old commit (check.js save old), then check.js diff old now.');
      process.exitCode = 1;
    }
  }
}
