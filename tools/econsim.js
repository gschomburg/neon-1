// econsim.js: plays whole runs in headless Chrome and reports the credits: what comes in, what the markets
// offer, what gets spent, what's left, sector by sector. For the money balancing (docs/ECONOMY.md).
//
// The bot: god mode (it never dies, so every run reaches the same depth), no ads. On a layer it finds the
// real node first try with chance SKILL (a perfect), otherwise it hits one ICE first. On the map it goes to
// a market whenever it can (so we see every market), then a data cache, a safehouse when hurt, else a
// random corp. At a market it buys repair while hurt, then the priciest things it can afford and has room
// for. Reward screens: the first mod it has room for, else the credits. After each sector boss it pushes on.
//
// Usage:
//   node tools/econsim.js                       5 seeds x skill 0 / 0.5 / 0.9, 3 sectors: a table
//   node tools/econsim.js save <name>           ...and keep the raw numbers (tools/check/econ-<name>.json)
//   node tools/econsim.js diff <a> <b>          compare two saved runs
// Options (env): SEEDS=5 SECTORS=3 SKILLS=0,0.5,0.9 PARALLEL=6 CHROME=...
//   WHATIF=flat2,inflate35   try a change in the sim only: flat2 = perfects pay a flat x2; inflateNN = everything you spend
//     +NN% a sector (ECON.spend.grow); econ.a.b=v = any number in data/economy.js (e.g. econ.repair=3);
//     base2 = base pay 2 + 2n (not 4 + 2n); toll10 = every corp costs 10 x level to jack in; gated = a third of corps cost
//     20 x level and pay x1.5 (couldn't pay: it goes in anyway, counted); stagefeeNNN = pushing on costs NNN x the sector
//     you leave; stagefeeNNpct = NN% of your credits (short: it pushes on anyway, counted: in the game you'd cash out);
//     stagemodNN = pushing on costs NN per mod you hold x the sector you leave (short: how many mods you'd have to drop)
const fs = require('fs'), path = require('path'), os = require('os'), { execFile } = require('child_process');
const ROOT = path.join(__dirname, '..'), DIR = path.join(__dirname, 'check');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SEEDS = +(process.env.SEEDS || 5), SECTORS = +(process.env.SECTORS || 3);
const SKILLS = (process.env.SKILLS || '0,0.5,0.9').split(',').map(Number);
const PARALLEL = +(process.env.PARALLEL || 6);
const WHATIF = (process.env.WHATIF || '').split(',').filter(Boolean);

// the game page with every local script inlined (like tools/playtest.js), plus the bot
function testPage(file, bot) {
  const base = path.dirname(file);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => /^https?:/.test(src) ? m :
    '<script>' + fs.readFileSync(path.join(base, src.split('?')[0]), 'utf8').replace(/<\/script>/g, '<\\/script>') + '</script>');
  html = html.replace(/<head>/, '<head><script>window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 100);</script>');
  html = html.replace(/beta_runner\.v\d+\.save/g, 'beta_runner.econsim.save');
  return html.replace('</body>', '<script>' + bot + '</script></body>');
}

const BOT = `(async () => {
  const cfg = JSON.parse(decodeURIComponent(location.hash.slice(1)));
  const out = { runs: [], errors: [] };
  window.addEventListener('error', e => out.errors.push(e.message));
  window.addEventListener('unhandledrejection', e => out.errors.push('rejection: ' + ((e.reason && e.reason.message) || e.reason)));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const B = window.__br, st = B.state;
  const busy = () => st.busy || st.transitioning || st.wipe || st.intro || st.bossIntro || st.ad;
  const settle = async what => {
    for (let i = 0; i < 2500; i++) {
      if (st.intro) st.intro.skip = true;
      if (st.bossIntro) st.bossIntro.skip = true;
      if (st.ad) closeAd();
      // a question that pops up mid-tap and waits (SKIPJACK, CONTINUE?): answer it (play it / give up)
      if (st.mode === 'panel' && (st.panelTitle === 'SKIPJACK' || st.panelTitle === 'CONTINUE?')) {
        const h = hits.find(h => h.kind === 'btn' && (h.id === 'play' || h.id === 'giveup') && h.onTap);
        if (h) h.onTap();
      }
      if (!busy()) return;
      await sleep(30);
    }
    throw new Error('stuck: ' + what + ' mode=' + st.mode);
  };
  // a tap: not awaited (it can wait on a question above); settle handles what follows
  const tap = async (i, what) => { B.pick(i); await sleep(30); await settle(what); };
  // a small seeded rng (the bot's choices, so a seed + skill always plays the same)
  const rngOf = s => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  // the report, kept up to date as it goes (an early exit still shows where it got to)
  const pre = document.createElement('pre'); pre.id = 'econsim'; document.body.appendChild(pre);
  const report = () => { pre.textContent = JSON.stringify(out); };
  st.boot = null; save.ads = false;
  // WHAT-IFs (only in this page; the game itself is untouched):
  //   flat2: a perfect pays a flat x2 (not x1 + 0.5 a node);  inflateNN: market prices +NN% a sector (not repair)
  const W = cfg.whatif || [];
  if (W.includes('flat2')) {
    ECON.pay.perfect = 2; ECON.pay.perfectPerNode = 0;   // (the game's own numbers since v13.41)
  }
  if (W.includes('oldperfect')) {   // the curve before v13.41: x(1 + 0.5 x (nodes - 1))
    ECON.pay.perfect = 1; ECON.pay.perfectPerNode = 0.5;
  }
  if (W.includes('base2')) ECON.pay.base = 0.2;   // (data/economy.js: 0.4 units = 4cr -> 2cr)
  // econ.a.b=v: set any number in data/economy.js (e.g. econ.spend.grow=0.35, econ.repair=3)
  for (const w of W.filter(w => w.startsWith('econ.'))) {
    const [p, v] = w.slice(5).split('='), keys = p.split('.'), last = keys.pop();
    const o = keys.reduce((o, k) => o[k], ECON);
    if (!(last in o)) throw new Error('what-if: no ECON.' + p);
    o[last] = +v;
  }
  if (W.includes('gated')) { const pf = payFor; window.payGated = pf; window.eval('payFor = lv => Math.round(payGated(lv) * (st.corp && st.corp.node && st.corp.node.gated ? 1.5 : 1))'); }
  // the fee to jack into a corp (the bot pays it if it can; if not it goes in anyway, and that's counted)
  const feeFor = n => {
    if (n.type !== 'corp' && n.type !== 'final') return 0;
    if (W.includes('toll10')) return 10 * (n.tier || 1);
    if (W.includes('gated')) { let h = 0; for (const ch of n.id + ':' + st.run.seed) h = (h * 31 + ch.charCodeAt(0)) | 0; n.gated = Math.abs(h) % 3 === 0; return n.gated ? 20 * (n.tier || 1) : 0; }
    return 0;
  };
  const infl = (W.find(w => w.startsWith('inflate')) || '').slice(7);   // (no backslashes in here: this is inside a template string)
  const base = { mods: Object.fromEntries(Object.entries(MODS).map(([k, d]) => [k, d.price])), items: Object.fromEntries(Object.entries(ITEMS).map(([k, d]) => [k, d.price])) };
  if (infl) ECON.spend.grow = +infl / 100;   // every price, repair and fee grows a sector (data/economy.js)
  const inflate = () => {};
  // faster screens: the bot doesn't need to watch the wipes and reveals
  Object.assign(CONFIG, { wipeSpeed: 8, wipeStagger: 0, revealDelay: 0, revealGap: 0, introHold: 0 });
  for (const seed of cfg.seeds) {
    const rng = rngOf(seed + ':' + cfg.skill);
    const rec = { seed, skill: cfg.skill, sectors: [], end: '' };
    let sec = null;
    const newSector = s => { sec = { sector: s + 1, earnedAt: st.run.earned, creditsAt: st.run.credits, layers: 0, perfects: 0, pay: 0, corps: 0, tolls: 0, tollsOwed: 0, unpaid: 0, deaths: 0, stageFee: 0, stageShort: 0, heldAtGate: 0,
      markets: [], spent: { mod: 0, item: 0, repair: 0 }, rewards: { mod: 0, credits: 0 }, cache: 0 }; rec.sectors.push(sec); };
    const closeSector = () => { if (!sec) return; sec.earned = st.run.earned - sec.earnedAt; sec.creditsEnd = st.run.credits; delete sec.earnedAt; };
    try {
      if (st.run) st.run.ended = true;
      B.showTitle(); await sleep(50);
      B.startRun(seed, true); await settle('start');
      st.god = true;
      // mod:KEY or mod:KEY:STEP: start the run already holding that mod (the mod pass)
      for (const w of W.filter(w => w.startsWith('mod:'))) { const [, k, t] = w.split(':'); if (!MODS[k]) throw new Error('what-if: no mod ' + k); B.addMod(k, +(t || 0)); }
      // gear:KEY or gear:KEY:STEP: start holding that gear (a test of SELL / cashing in)
      for (const w of W.filter(w => w.startsWith('gear:'))) { const [, k, t] = w.split(':'); if (!ITEMS[k]) throw new Error('what-if: no gear ' + k); B.addItem(k, +(t || 0)); }
      let downNow = false;
      newSector(0);
      let lastLv = null;
      for (let step = 0; step < 4000; step++) {
        if (step % cfg.every === 0) { out.partial = rec; report(); }
        await settle('step');
        const run = st.run;
        // a death the bot would have had (it never dies: god mode); integrity at 0 counts once until it's back up
        if (run && sec) { const down = run.integrity <= 0; if (down && !downNow) sec.deaths++; downNow = down; }
        (rec.trace = rec.trace || []).push([step, st.mode, st.panelTitle || '', run && run.at, st.corp ? st.corp.def.key + ':' + st.corp.idx : '', run && run.credits, run && run.mods.join(','), run && run.items.map(x => x.key).join(',')]); if (rec.trace.length > 12) rec.trace.shift();
        if (!run) { rec.end = 'no run'; break; }
        if (run.sector + 1 !== sec.sector && st.mode === 'map') { closeSector(); newSector(run.sector); }
        if (st.mode === 'map' && inflate.at !== run.sector) { inflate.at = run.sector; inflate(run.sector); }
        if (st.mode === 'play' && st.lv) {
          const lv = st.lv;
          if (lv !== lastLv) {   // a new layer: perfect, or one ICE first
            lastLv = lv;
            if (lv.tiles.length > 1 && rng() >= cfg.skill) {
              const ice = lv.tiles.findIndex(t => !t.safe && t.state === 'closed' && !t.loaded);
              if (ice >= 0) { await tap(ice, 'miss'); if (st.lv !== lv) continue; }
            }
          }
          const real = lv.tiles.findIndex(t => t.safe && t.state === 'closed');
          if (real < 0) { await sleep(40); continue; }
          lv.botTries = (lv.botTries || 0) + 1;
          if (lv.botTries > 60) throw new Error('stuck on a layer: ' + (st.corp ? st.corp.def.key : '?'));
          st.lagBypass = true;   // LAGRANGE: the tap lands now, not after the slide
          await tap(real, 'find');
          if (st.lv !== lv || lv.tiles[real].state === 'safe') {
            if (lv.tiles.length > 1) { sec.layers++; if (lv.misses === 0) sec.perfects++; sec.pay += lv.paid || 0; if (lv.boss) sec.corps++; }
          }
          continue;
        }
        if (st.mode === 'panel') {
          if (st.panelTitle === 'BLACK MARKET' && st.shop) {
            const sh = st.shop, P = o => sh.priceOf(o);
            const m = { credits: run.credits, stock: sh.offers.filter(o => o.kind !== 'repair').reduce((a, o) => a + P(o), 0),
              offers: sh.offers.filter(o => o.kind !== 'repair').map(o => o.kind + ':' + o.key + ':' + P(o)), bought: [] };
            const buy = async k => { const o = sh.offers[k], before = run.credits; sh.buyAt(k); await settle('buy');
              if (run.credits < before) { sec.spent[o.kind] += before - run.credits; m.bought.push(o.kind + ':' + o.key + ':' + (before - run.credits)); } };
            const rep = sh.offers.findIndex(o => o.kind === 'repair');
            for (let i = 0; i < 6 && canHeal() && canSpend(P(sh.offers[rep])); i++) await buy(rep);
            const order = sh.offers.map((o, k) => k).filter(k => sh.offers[k].kind !== 'repair').sort((a, b) => P(sh.offers[b]) - P(sh.offers[a]));
            for (const k of order) {
              const o = sh.offers[k];
              if (o.sold || !canSpend(P(o))) continue;
              if (o.kind === 'mod' && (!modRoom(o.key) || clashWith(o.key))) continue;
              if (o.kind === 'item' && !itemRoom(o.key, o.tier)) continue;
              await buy(k);
            }
            // what-if "market": sell value gear (SHARD, BOND), and reroll while it has credits to spare, buying again
            if (W.includes('market')) {
              for (let i = run.items.length - 1; i >= 0; i--) if (ITEMS[run.items[i].key].value) { sh.sellAt(i); await settle('sell'); m.sold = (m.sold || 0) + 1; }
              while (sh.rerollsLeft() > 0 && run.credits > sh.rerollPrice() * 3) {
                const before = run.credits; sh.reroll(); await settle('reroll'); m.rerolls = (m.rerolls || 0) + 1; sec.spent.reroll = (sec.spent.reroll || 0) + before - run.credits;
                for (const k of sh.offers.map((o, k) => k).sort((a, b) => P(sh.offers[b]) - P(sh.offers[a]))) {
                  const o = sh.offers[k];
                  if (o.kind === 'repair' || o.sold || !canSpend(P(o))) continue;
                  if (o.kind === 'mod' && (!modRoom(o.key) || clashWith(o.key))) continue;
                  if (o.kind === 'item' && !itemRoom(o.key, o.tier)) continue;
                  await buy(k);
                }
              }
            }
            m.left = run.credits;
            sec.markets.push(m);
            st.shop = null; leavePanel(); continue;
          }
          if (st.panelTitle === 'UPLINK' && st.uplink) {
            const u = st.uplink;
            const order = run.mods.filter(k => !u.locked.includes(k)).sort((a, b) => u.fee(a) - u.fee(b));
            for (const k of order) { if (u.canGo()) break; u.keep[k] = false; }
            const t = u.tally();
            Object.assign(sec, { upHeld: run.credits, upFee: t.fee, upSoldN: run.mods.filter(k => !u.keep[k]).length, upSoldCr: t.sold, upMods: run.mods.length });
            if (u.canGo()) { u.push(); continue; }
            sec.upCashed = true; closeSector(); rec.end = 'cashed out at the uplink (sector ' + sec.sector + ')'; break;
          }
          if (st.choice && st.choice.title === st.panelTitle) {
            const ch = st.choice; st.choice = null;
            const before = run.credits;
            const o = ch.options.find(o => o.kind !== 'gear' && modRoom(o.key) && !clashWith(o.key));
            if (st.panelTitle === 'DATA CACHE') sec.cache++;
            if (o) { sec.rewards.mod++; ch.take(o); } else { ch.take(null); sec.rewards.credits += run.credits - before; }
            continue;
          }
          // other screens that wait for an answer (SKIPJACK, CONTINUE?, a corp's offer): tap one of their own
          // buttons (play it rather than skip, so every run plays the same layers), else just leave
          await sleep(150);
          const btn = ['play', 'giveup', 'leave', 'back', 'ok', 'done', 'next'].map(id => hits.find(h => h.kind === 'btn' && h.id === id && h.onTap)).find(Boolean);
          if (btn) btn.onTap(); else leavePanel();
          continue;
        }
        if (st.mode === 'map') {
          if (!st.mapView || st.mapView.row !== st.mapView.target) { await sleep(40); continue; }
          const ids = B.availableNodes(), map = run.map;
          if (!ids.length) { rec.end = 'map: nowhere to go'; break; }
          const of = t => ids.filter(id => map[id].type === t);
          const hurt = run.integrity < run.maxInt;
          const pick = of('shop')[0] || of('cache')[0] || (hurt && of('repair')[0]) || of('final')[0];
          const corps = of('corp');
          const id = pick || (corps.length ? corps[Math.floor(rng() * corps.length)] : ids[0]);
          const fee = feeFor(map[id]);
          if (fee) { if (run.credits >= fee) { run.credits -= fee; sec.tolls += fee; } else { sec.unpaid++; sec.tollsOwed += fee; } }
          B.enterNode(map[id], true); continue;
        }
        if (st.mode === 'over') {
          if (st.result && st.result.sector) {
            if (run.sectorsCleared >= cfg.sectors) { closeSector(); rec.end = 'cleared ' + run.sectorsCleared; break; }
            // stagemodNN: NN per mod you hold x the sector you leave (short: how many mods you'd drop to afford it)
            const sm = W.find(w => w.startsWith('stagemod'));
            if (sm) {
              const per = (+sm.slice(8)) * run.sectorsCleared, held = Math.max(0, run.credits), n = run.mods.length;
              const fee = per * n, keep = Math.min(n, Math.floor(held / per));
              sec.heldAtGate = held; sec.modsAtGate = n;
              if (held >= fee) { run.credits -= fee; sec.stageFee = fee; } else { sec.stageShort = fee - held; sec.dropMods = n - keep; sec.stageFee = per * keep; run.credits -= per * keep; }
            }
            const sf = W.find(w => w.startsWith('stagefee'));
            if (sf) {
              const v = sf.slice(8), held = Math.max(0, run.credits);
              const fee = v.endsWith('pct') ? Math.round(held * (+v.slice(0, -3)) / 100) : (+v) * run.sectorsCleared;
              sec.heldAtGate = held;
              if (held >= fee) { run.credits -= fee; sec.stageFee = fee; } else { sec.stageShort = fee - held; sec.stageFee = held; run.credits -= held; }
              sec.creditsEnd = run.credits;
            }
            swapTo(openUplink); continue;
          }
          closeSector(); rec.end = 'over'; break;
        }
        await sleep(40);
      }
    } catch (e) { rec.error = e.message; closeSector(); }
    out.runs.push(rec);
  }
  delete out.partial; out.done = true; report();
})();`;

function runChrome(page, cfg, profile) {
  return new Promise(res => {
    execFile(CHROME, ['--headless=new', '--disable-gpu', '--window-size=420,860', '--virtual-time-budget=20000000',
      `--user-data-dir=${profile}`, '--dump-dom', 'file:///' + page.replace(/\\/g, '/') + '#' + encodeURIComponent(JSON.stringify(cfg))],
      { maxBuffer: 1 << 28, timeout: 60 * 60 * 1000 }, (err, stdout) => {
        const m = String(stdout || '').match(/<pre id="econsim">([\s\S]*?)<\/pre>/);
        if (!m) return res({ runs: [], errors: ['no report from chrome' + (err ? ': ' + err.message : '')] });
        res(JSON.parse(m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')));
      });
  });
}

async function sim(file) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'neon-econ-'));
  const page = path.join(tmp, 'econ.html');
  fs.writeFileSync(page, testPage(file, BOT));
  const seeds = process.env.SEEDLIST ? process.env.SEEDLIST.split(',') : Array.from({ length: SEEDS }, (_, i) => 'ECON' + (i + 1));
  // one Chrome per skill and seed, PARALLEL at a time
  const jobs = SKILLS.flatMap(skill => seeds.map(seed => ({ seeds: [seed], skill, sectors: SECTORS, every: +(process.env.EVERY || 20), whatif: WHATIF })));
  const parts = [];
  let next = 0;
  await Promise.all(Array.from({ length: PARALLEL }, async (_, w) => { while (next < jobs.length) { const j = next++; parts[j] = await runChrome(page, jobs[j], path.join(tmp, 'p' + j)); } }));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* chrome may still hold it */ }
  return { whatif: WHATIF, skills: SKILLS, sectors: SECTORS, seeds, runs: parts.flatMap(p => p.runs.concat(p.partial ? [Object.assign(p.partial, { end: 'INCOMPLETE (chrome stopped)' })] : [])), errors: [...new Set(parts.flatMap(p => p.errors))] };
}

// The table: per skill and sector, averaged over the seeds.
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const r0 = x => String(Math.round(x));
function table(r) {
  const lines = [];
  for (const skill of r.skills) {
    const runs = r.runs.filter(x => x.skill === skill);
    lines.push(`\nskill ${skill} (finds the real node first try ${Math.round(skill * 100)}% of layers), ${runs.length} runs: ` +
      runs.map(x => x.error ? `${x.seed} ERROR ${x.error}` : `${x.seed} ${x.end}`).join(', '));
    lines.push('sector | corps | earned | layer pay | perfect% | market: had / stock / spent | rewards: mods / skip cr | tolls paid (couldn\'t pay) | credits at end');
    for (let s = 1; s <= r.sectors; s++) {
      const ss = runs.map(x => x.sectors.find(y => y.sector === s)).filter(Boolean);
      if (!ss.length) continue;
      const mk = ss.flatMap(x => x.markets);
      const spent = ss.map(x => x.spent.mod + x.spent.item + x.spent.repair);
      lines.push([`  ${s}`, (avg(ss.map(x => x.corps))).toFixed(1), r0(avg(ss.map(x => x.earned || 0))), r0(avg(ss.map(x => x.pay))),
        r0(100 * avg(ss.map(x => x.layers ? x.perfects / x.layers : 0))) + '%',
        `${r0(avg(mk.map(m => m.credits)))} / ${r0(avg(mk.map(m => m.stock)))} / ${r0(avg(spent))} (${(mk.length / ss.length).toFixed(1)} mkts)`,
        `${(avg(ss.map(x => x.rewards.mod))).toFixed(1)} / ${r0(avg(ss.map(x => x.rewards.credits)))}`,
        `${r0(avg(ss.map(x => x.tolls || 0)))} (${(avg(ss.map(x => x.unpaid || 0))).toFixed(1)})` + (ss.some(x => x.upFee) ? ` | uplink: held ${r0(avg(ss.map(x => x.upHeld || 0)))}, fee ${r0(avg(ss.map(x => x.upFee || 0)))}, mods ${(avg(ss.map(x => x.upMods || 0))).toFixed(1)}, sold ${(avg(ss.map(x => x.upSoldN || 0))).toFixed(1)}, cashed out ${ss.filter(x => x.upCashed).length}/${ss.length}` : '') + (ss.some(x => x.heldAtGate) ? ` | stage fee: held ${r0(avg(ss.map(x => x.heldAtGate || 0)))}, paid ${r0(avg(ss.map(x => x.stageFee || 0)))}, short ${ss.filter(x => x.stageShort).length}/${ss.length}` + (ss.some(x => x.modsAtGate) ? `, mods ${(avg(ss.map(x => x.modsAtGate || 0))).toFixed(1)}, would drop ${(avg(ss.map(x => x.dropMods || 0))).toFixed(1)}` : '') : ''),
        r0(avg(ss.map(x => x.creditsEnd || 0)))].join(' | '));
    }
  }
  if (r.errors.length) lines.push('\npage errors: ' + r.errors.join(' | '));
  return lines.join('\n');
}

(async () => {
  const [cmd, a1, a2] = process.argv.slice(2);
  fs.mkdirSync(DIR, { recursive: true });
  const file = n => path.join(DIR, 'econ-' + n + '.json');
  if (cmd === 'diff') {
    const a = JSON.parse(fs.readFileSync(file(a1), 'utf8')), b = JSON.parse(fs.readFileSync(file(a2), 'utf8'));
    return console.log(`=== ${a1}\n${table(a)}\n\n=== ${a2}\n${table(b)}`);
  }
  const t0 = Date.now();
  const r = await sim(path.join(ROOT, 'dist', 'index.html'));
  if (cmd === 'save') fs.writeFileSync(file(a1), JSON.stringify(r, null, 1));
  console.log(table(r));
  console.log(`\n(${Math.round((Date.now() - t0) / 1000)}s)`);
})();
