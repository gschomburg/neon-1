// playtest.js: plays every corp in headless Chrome and records what happened, to compare builds.
//
// For each corp (tier 1, god mode, a fixed seed): enter it, and on every layer (the boss too) pick
// one ICE node, then the real one. Records per layer: the node count, the corp's hint line, the
// message after the miss, and anything that went wrong; then where the game ended up.
//
// Usage:
//   node tools/playtest.js save <name> [game.html]   play and record (tools/check/play-<name>.json)
//   node tools/playtest.js diff <a> <b>               compare two recordings
//   node tools/playtest.js [game.html]                play, save "now", compare to "baseline"
// Needs Chrome (Windows default path, or set CHROME=...). Runs 4 Chromes side by side.

const fs = require('fs'), path = require('path'), os = require('os'), { execFile } = require('child_process');
const ROOT = path.join(__dirname, '..'), DIR = path.join(__dirname, 'check');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PARTS = 4;

// One self-contained test page: every local script inlined in order, animation frames on a timer
// (headless Chrome doesn't run them), and the player below.
function testPage(file) {
  const base = path.dirname(file);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => /^https?:/.test(src) ? m :
    '<script>' + fs.readFileSync(path.join(base, src.split('?')[0]), 'utf8').replace(/<\/script>/g, '<\\/script>') + '</script>');
  html = html.replace(/<head>/, '<head><script>window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16);</script>');
  html = html.replace(/beta_runner\.v\d+\.save/g, 'beta_runner.playtest.save');
  return html.replace('</body>', '<script>' + PLAYER + '</script></body>');
}

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
      for (let guard = 0; guard < 8 && st.mode === 'play' && st.corp && st.corp.def.key === key; guard++) {
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
        // corps with their own pick rules (FORM 27B, DEMOLITION...) can need more than one find
        await sleep(50);
      }
      rec.end = st.mode + (st.panelTitle ? ':' + st.panelTitle : '');
    } catch (e) { rec.error = e.message; }
  }
  const p = document.createElement('pre'); p.id = 'playtest'; p.textContent = JSON.stringify(out); document.body.appendChild(p);
})();`;

function runChrome(page, hash, profile) {
  return new Promise(res => {
    execFile(CHROME, ['--headless=new', '--disable-gpu', '--window-size=420,860', '--virtual-time-budget=3000000',
      `--user-data-dir=${profile}`, '--dump-dom', 'file:///' + page.replace(/\\/g, '/') + '#' + hash],
      { maxBuffer: 1 << 28, timeout: 30 * 60 * 1000 }, (err, stdout) => {
        const m = String(stdout || '').match(/<pre id="playtest">([\s\S]*?)<\/pre>/);
        if (!m) return res({ corps: {}, errors: ['no report from chrome ' + hash + (err ? ': ' + err.message : '')] });
        const txt = m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
        res(JSON.parse(txt));
      });
  });
}

async function play(file) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'neon-playtest-'));
  const page = path.join(tmp, 'play.html');
  fs.writeFileSync(page, testPage(file));
  const n = (fs.readFileSync(file, 'utf8').length, 100);   // more than the corps there are; the page slices
  const step = Math.ceil(80 / PARTS);
  const parts = await Promise.all(Array.from({ length: PARTS }, (_, i) => runChrome(page, `${i * step}:${(i + 1) * step + (i === PARTS - 1 ? 50 : 0)}`, path.join(tmp, 'p' + i))));
  const all = { corps: {}, errors: [] };
  for (const p of parts) { Object.assign(all.corps, p.corps); all.errors.push(...p.errors); }
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* chrome may still hold it */ }
  return all;
}

// corps whose hint lines run on the clock (brownouts, a lift, typing...): they can differ run to run,
// so a difference there only matters if it errors or ends somewhere else
const TIMING = new Set(['bidblitz', 'brightline', 'liftco', 'seekr', 'squalor', 'streamflix', 'tempo']);
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
  const [cmd, a1, a2] = process.argv.slice(2);
  fs.mkdirSync(DIR, { recursive: true });
  const save = (name, r) => fs.writeFileSync(path.join(DIR, 'play-' + name + '.json'), JSON.stringify(r, null, 1));
  const read = name => JSON.parse(fs.readFileSync(path.join(DIR, 'play-' + name + '.json'), 'utf8'));
  const gameFile = f => f ? path.resolve(f) : path.join(ROOT, 'dist', 'index.html');
  if (cmd === 'diff') return console.log(diff(read(a1), read(a2)).join('\n'));
  const save1 = cmd === 'save' ? a1 : 'now';
  const r = await play(gameFile(cmd === 'save' ? a2 : cmd));
  save(save1, r);
  const nCorps = Object.keys(r.corps).length, nLayers = Object.values(r.corps).reduce((s, c) => s + (c.layers || []).length, 0);
  console.log(`played ${nCorps} corps, ${nLayers} layers${r.errors.length ? ', page errors: ' + [...new Set(r.errors)].join(' | ') : ''}`);
  const broken = Object.entries(r.corps).filter(([, c]) => c.error);
  if (broken.length) console.log('stuck / failed: ' + broken.map(([k, c]) => `${k}: ${c.error}`).join(' | '));
  if (cmd !== 'save' && fs.existsSync(path.join(DIR, 'play-baseline.json'))) console.log(diff(read('baseline'), r).join('\n'));
})();
