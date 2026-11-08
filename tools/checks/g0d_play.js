// g0d_play.js: lets G0D.exe (engine/g0dexe.js) play every corp in headless Chrome, as a corp you've beaten, and lists
// the ones it can't get through: those need an `auto` hook in their corp file (docs/BACKLOG.md, G0D.exe step 2).
//
// For each corp (tier 1, god mode, 4x speed, all the clicks it wants): enter it, switch G0D.exe on, and wait until the
// corp is done, G0D.exe pauses (stuck), or 90s pass. Records: how far it got, clicks used against layers, ICE it
// hit, and layers it cleared for no pay.
//
// Usage:
//   node tools/checks/g0d_play.js [corp ...]   play (all corps, or just these), print the list, save tools/checks/out/g0d-play.json
// Needs Chrome (Windows default path, or set CHROME=...). Runs 4 Chromes side by side (tools/checks/harness.js).

if (['-h', '--help'].includes(process.argv[2])) { console.log('usage: node tools/checks/g0d_play.js [corp ...]   (G0D.exe plays every corp headless; lists where it gets stuck)'); process.exit(0); }
const fs = require('fs'), path = require('path'), H = require('./harness.js');
const DIR = path.join(__dirname, 'out'), PARTS = 4;

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
  const [from, to, only] = location.hash.slice(1).split(':');
  const keys = only ? only.split(',') : Object.keys(B.CORPS).slice(Number(from), Number(to));
  save.g0dx = { clicks: 9999, speed: 4, beaten: 1 };
  for (const key of keys) {
    const rec = out.corps[key] = {};
    try {
      if (st.run) { st.run.ended = true; }
      B.showTitle(); await sleep(50);
      B.startRun('G0DPLAY', true); await settle('start');
      await B.pick(st.lv.safe); await settle('public net');
      if (st.mode !== 'map') { B.toMap(); await settle('map'); }
      st.god = true;
      corpStat(key).breached = Math.max(1, corpStat(key).breached);
      const run = st.run, id = B.availableNodes().find(x => run.map[x].type === 'corp');
      Object.assign(run.map[id], { corp: key, tier: 1 }); delete run.map[id].mod;
      g0dxGive(); run.g0dx.card = false; run.g0dx.on = true;
      B.enterNode(run.map[id], true); await settle('enter');
      const c = st.corp, t0 = performance.now();
      let lastLv = null; const seen = [];
      while (performance.now() - t0 < 90000 && st.corp === c && st.mode === 'play' && run.g0dx.on) {
        if (st.intro) st.intro.skip = true;
        if (st.bossIntro) st.bossIntro.skip = true;
        if (st.hkCard) { st.hkCard.t0 = 0; hkCardClose(); }
        if (st.lv && st.lv !== lastLv) { lastLv = st.lv; if (st.corp === c) seen.push(st.lv); }
        await sleep(100);
      }
      rec.ice = seen.reduce((a, lv) => a + lv.tiles.filter(t => t.lockedBy === 'hit').length, 0);   // ICE it hit
      rec.noPay = seen.filter(lv => lv.payCut === 1).length;   // layers it cleared for no pay (it played, not the way the corp wants)
      rec.layers = c ? c.counts.length : 0;
      rec.reached = c ? Math.min(c.idx + (st.corp === c ? 0 : 1), rec.layers) : 0;
      rec.clicks = run.g0dx.used;
      rec.end = st.corp !== c || st.mode !== 'play' ? 'done:' + st.mode : !run.g0dx.on ? 'stuck' : 'timeout';
      if (rec.end !== 'stuck' && rec.end !== 'timeout' && rec.reached < rec.layers) rec.end = 'left:' + st.mode;
      if (run.g0dx.stuck) rec.stuck = run.g0dx.stuck;
      if (st.lv && st.corp === c) rec.hint = String(st.msg || '').slice(0, 60);
      rec.log = (run.g0dx.log || []).slice(-4);
      run.g0dx.on = false;
    } catch (e) { rec.error = e.message; }
  }
  const p = document.createElement('pre'); p.id = 'out'; p.textContent = JSON.stringify(out); document.body.appendChild(p);
})();`;

async function play(only) {
  const page = H.testPage(undefined, PLAYER, { key: 'g0dplay' });
  const jobs = only.length ? [only.join(',')].map(o => `0:0:${o}`)
    : Array.from({ length: PARTS }, (_, i) => { const step = Math.ceil(100 / PARTS); return `${i * step}:${(i + 1) * step}`; });
  const parts = await Promise.all(jobs.map(hash => H.runPage(page, { hash, ms: 6000000, size: '420,860', timeout: 40 * 60 * 1000 })));
  const all = { corps: {}, errors: [] };
  for (const p of parts) { if (p.error) { all.errors.push(p.error); continue; } Object.assign(all.corps, p.corps); all.errors.push(...p.errors); }
  return all;
}

(async () => {
  const only = process.argv.slice(2);
  const res = await play(only);
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(path.join(DIR, 'g0d-play.json'), JSON.stringify(res, null, 2) + '\n');
  const rows = Object.entries(res.corps), bad = rows.filter(([, r]) => r.error || !/^done/.test(r.end || '') || r.noPay || r.ice);
  for (const [k, r] of rows) {
    const ok = !r.error && /^done/.test(r.end || '') && !r.noPay && !r.ice;
    const extra = r.clicks - r.layers;
    console.log(`${ok ? 'ok   ' : 'LOOK '} ${k.padEnd(12)} ${r.error ? 'error: ' + r.error : `${r.end.padEnd(12)} layers ${r.reached}/${r.layers}  clicks ${r.clicks}${extra > 0 ? ` (+${extra})` : ''}${r.ice ? `  ICE ${r.ice}` : ''}${r.noPay ? `  NO PAY ${r.noPay}` : ''}${r.stuck ? '  at ' + r.stuck : ''}${!ok && r.hint ? '  msg: ' + r.hint : ''}`}`);
  }
  console.log(`\n${rows.length - bad.length}/${rows.length} corps played through clean. ${bad.length ? 'to look at: ' + bad.map(([k]) => k).join(' ') : ''}`);
  if (res.errors.length) console.log('page errors:\n  ' + [...new Set(res.errors)].join('\n  '));
  console.log('saved tools/checks/out/g0d-play.json');
})();
