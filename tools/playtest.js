// playtest.js: plays every corp in headless Chrome and records what happened, to compare builds.
//
// For each corp (tier 1, god mode, a fixed seed): enter it, and on every layer (the boss too) pick
// one ICE node, then the real one. Records per layer: the node count, the corp's hint line, the
// message after the miss, and anything that went wrong; then where the game ended up.
//
// Usage:
//   node tools/playtest.js                            play, compare to tools/golden-play.json (exit 1 on a difference)
//   node tools/playtest.js --accept                   the play changed on purpose: write tools/golden-play.json again
//   node tools/playtest.js save <name> [game.html]   play and record (tools/check/play-<name>.json)
//   node tools/playtest.js diff <a> <b>               compare two recordings
// Needs Chrome (Windows default path, or set CHROME=...). Runs 4 Chromes side by side (tools/harness.js).

if (['-h', '--help'].includes(process.argv[2])) { console.log("usage: node tools/playtest.js [--accept] | save <name> [game.html] | diff <a> <b>   (plays every corp in headless Chrome)"); process.exit(0); }
const fs = require('fs'), path = require('path'), H = require('./harness.js');
const ROOT = path.join(__dirname, '..'), DIR = path.join(__dirname, 'check'), GOLDEN = path.join(__dirname, 'golden-play.json');
const PARTS = 4;

const PLAYER = `(async () => {
  const out = { corps: {}, errors: [] };
  window.addEventListener('error', e => out.errors.push(e.message));
  window.addEventListener('unhandledrejection', e => out.errors.push('rejection: ' + ((e.reason && e.reason.message) || e.reason)));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const B = window.__br, st = B.state;
  const settle = async (what) => {
    for (let i = 0; i < 1500; i++) {
      if (st.intro) st.intro.skip = true;
      if (st.bossIntro) st.bossIntro.skip = true;
      if (!st.busy && !st.transitioning && !st.wipe && !st.intro && !st.bossIntro) return;
      await sleep(40);
    }
    throw new Error('stuck: ' + what + ' mode=' + st.mode);
  };
  const [from, to] = location.hash.slice(1).split(':').map(Number);
  const keys = Object.keys(B.CORPS).slice(from, to);
  for (const key of keys) {
    const rec = out.corps[key] = { layers: [] };
    try {
      if (st.run) { st.run.ended = true; }
      B.showTitle(); await sleep(50);
      B.startRun('PLAYTEST', true); await settle('start');
      await B.pick(st.lv.safe); await settle('public net');
      if (st.mode !== 'map') { B.toMap(); await settle('map'); }
      st.god = true;
      const run = st.run, id = B.availableNodes().find(x => run.map[x].type === 'corp');
      Object.assign(run.map[id], { corp: key, tier: 1 }); delete run.map[id].mod;
      B.enterNode(run.map[id], true); await settle('enter');
      for (let guard = 0; guard < 16 && st.mode === 'play' && st.corp && st.corp.def.key === key; guard++) {
        const lv = st.lv, c = st.corp;
        const hint = c.def.hint ? (() => { try { const h = c.def.hint(lv, performance.now()); return h ? h.text : ''; } catch (e) { return 'HINT ERROR ' + e.message; } })() : '';
        const L = { idx: c.idx, boss: !!lv.boss, n: lv.tiles.length };
        if (hint) L.hint = hint;
        const ice = lv.tiles.findIndex(t => !t.safe && t.state === 'closed' && !t.loaded);
        if (ice >= 0 && lv.tiles.length > 1) {
          await B.pick(ice); await settle('miss');
          L.missMsg = String(st.msg || '').replace(/\\d+cr/g, 'Ncr');
          L.after = st.lv === lv ? lv.tiles.length : 'next';
        }
        if (st.mode === 'play' && st.lv === lv) {
          const real = lv.tiles.findIndex(t => t.safe);
          await B.pick(real); await settle('find');
        }
        rec.layers.push(L);
        // corps with their own pick rules (FORM 27B, DEMOLITION...) can need more than one find (FOSSIL: three taps a node, so 16 rounds)
        await sleep(50);
      }
      rec.end = st.mode + (st.panelTitle ? ':' + st.panelTitle : '');
    } catch (e) { rec.error = e.message; }
  }
  const p = document.createElement('pre'); p.id = 'out'; p.textContent = JSON.stringify(out); document.body.appendChild(p);
})();`;

async function play(file) {
  const page = H.testPage(file, PLAYER, { key: 'playtest' });
  const step = Math.ceil(80 / PARTS);   // (the last part takes the rest: the page slices the corp list)
  const parts = await Promise.all(Array.from({ length: PARTS }, (_, i) =>
    H.runPage(page, { hash: `${i * step}:${(i + 1) * step + (i === PARTS - 1 ? 50 : 0)}`, ms: 3000000, size: '420,860', timeout: 30 * 60 * 1000 })));
  const all = { corps: {}, errors: [] };
  for (const p of parts) { if (p.error) { all.errors.push(p.error); continue; } Object.assign(all.corps, p.corps); all.errors.push(...p.errors); }
  return all;
}

// corps whose hint lines run on the clock (brownouts, a lift, typing...): they can differ run to run,
// so a difference there only matters if it errors or ends somewhere else
const TIMING = new Set(['bidblitz', 'brightline', 'glacier', 'liftco', 'seekr', 'squalor', 'streamflix', 'tempo']);   // (GLACIER: its frost bar)
const strip = r => r && JSON.stringify(Object.assign({}, r, { layers: (r.layers || []).map(l => Object.assign({}, l, { hint: undefined, missMsg: undefined })) }));
function diff(a, b) {
  const out = [];
  const keys = [...new Set([...Object.keys(a.corps), ...Object.keys(b.corps)])].sort();
  let same = 0;
  for (const k of keys) {
    const x = JSON.stringify(a.corps[k]), y = JSON.stringify(b.corps[k]);
    if (x === y) same++;
    else if (TIMING.has(k) && strip(a.corps[k]) === strip(b.corps[k])) { same++; out.push(`  ${k}: same (its hint runs on the clock)`); }
    else out.push(`~ ${k}\n    was: ${x}\n    now: ${y}`);
  }
  out.unshift(`corps: ${same} same of ${keys.length}`);
  if (b.errors.length) out.unshift('page errors: ' + [...new Set(b.errors)].join(' | '));
  const broken = Object.entries(b.corps).filter(([, r]) => r.error).map(([k, r]) => `${k}: ${r.error}`);
  if (broken.length) out.unshift('stuck / failed: ' + broken.join(' | '));
  return out;
}

(async () => {
  const args = process.argv.slice(2), accept = args.includes('--accept'), [cmd, a1, a2] = args.filter(x => !x.startsWith('--'));
  fs.mkdirSync(DIR, { recursive: true });
  const save = (name, r) => fs.writeFileSync(path.join(DIR, 'play-' + name + '.json'), JSON.stringify(r, null, 1));
  const read = name => JSON.parse(fs.readFileSync(path.join(DIR, 'play-' + name + '.json'), 'utf8'));
  const gameFile = f => f ? path.resolve(f) : H.GAME;
  if (cmd === 'diff') return console.log(diff(read(a1), read(a2)).join('\n'));
  const r = await play(gameFile(cmd === 'save' ? a2 : cmd));
  save(cmd === 'save' ? a1 : 'now', r);
  const nCorps = Object.keys(r.corps).length, nLayers = Object.values(r.corps).reduce((s, c) => s + (c.layers || []).length, 0);
  console.log(`played ${nCorps} corps, ${nLayers} layers${r.errors.length ? ', page errors: ' + [...new Set(r.errors)].join(' | ') : ''}`);
  const broken = Object.entries(r.corps).filter(([, c]) => c.error);
  if (broken.length) { console.log('stuck / failed: ' + broken.map(([k, c]) => `${k}: ${c.error}`).join(' | ')); process.exitCode = 1; }
  if (cmd === 'save') return;
  if (accept || !fs.existsSync(GOLDEN)) { fs.writeFileSync(GOLDEN, JSON.stringify(r, null, 1) + '\n'); return console.log('wrote tools/golden-play.json.'); }
  const d = diff(JSON.parse(fs.readFileSync(GOLDEN, 'utf8')), r);
  console.log(d.join('\n'));
  const m = d[d.findIndex(l => l.startsWith('corps:'))].match(/corps: (\d+) same of (\d+)/);
  if (!m || m[1] !== m[2] || r.errors.length) { console.log('\ndifferent from tools/golden-play.json. on purpose? node tools/playtest.js --accept'); process.exitCode = 1; }
})();
