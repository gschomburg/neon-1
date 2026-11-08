// tools/checks/tests/g0drun.js: G0D.exe, step 3 (engine/g0dexe.js; docs/BACKLOG.md, Greg 2026-11-08). Switched on at the
// map in a run where it knows every corp, it plays a whole sector by itself: the map, the corps, rewards, markets, the
// UPLINK (it pays and pushes on). Its reward picks: money mods, then gear it uses, then epic+ mods to sell, else the
// credits. An UPLINK it can't pay: it stops with its card.
module.exports = { name: 'g0drun', body: `
  await settle();
  save.ads = false;
  Object.assign(CONFIG, { wipeSpeed: 8, wipeStagger: 0, revealDelay: 0, revealGap: 0, introHold: 0 });
  // what it picks
  check(g0dxMoneyMod('skimmer') && g0dxMoneyMod('pickpocket') && !g0dxMoneyMod('tracer') && !g0dxMoneyMod('buffer'), 'money mods: SKIMMER, PICKPOCKET yes; TRACER, BUFFER no');
  B.startRun('G0DRUN1', true); await settle('start');
  st.god = true;
  save.g0dx = { clicks: 9999, speed: 16, beaten: 1, popups: true, countWins: true, build: false };
  for (const k of Object.keys(CORPS)) corpStat(k).breached = Math.max(1, corpStat(k).breached);
  const R = (kind, key) => ({ kind, key, tier: 0, n: 2 });
  check(g0dxPickReward([R('mod', 'tracer'), R('mod', 'skimmer'), R('gear', 'warp')]).key === 'skimmer', 'a reward: the money mod first');
  check(g0dxPickReward([R('mod', 'tracer'), R('gear', 'warp')]).key === 'warp', 'then map gear');
  check(g0dxPickReward([R('mod', 'tracer'), R('mod', 'failsafe')]).key === 'failsafe', 'then an epic mod (to sell at the uplink)');
  check(g0dxPickReward([R('mod', 'tracer'), R('mod', 'buffer')]) === null, 'else the credits');
  // a whole sector, by itself
  g0dxGive(); st.run.g0dx.card = false;
  for (let i = 0; i < 100 && (st.busy || st.transitioning || st.wipe); i++) await sleep(100);
  useItem(st.run.items.findIndex(s => s.key === 'g0dexe'));
  const t0 = performance.now();
  while (performance.now() - t0 < 190000 && !st.g0dxStop && !(st.run.sector >= 1 && st.mode === 'map')) await sleep(250);
  const g = st.run.g0dx, log = (g.log || []).join(' / ');
  check(!st.g0dxStop, 'no stop: ' + (st.g0dxStop && st.g0dxStop.why));
  check(st.run.sector >= 1, 'it cleared sector 1 and pushed on (sector ' + (st.run.sector + 1) + ', mode ' + st.mode + ')');
  check(/uplink: keeps/.test(log) && /pushing on/.test(log), 'it settled the uplink and paid');
  check(g.corps >= 3 && g.used > g.corps, 'corps ' + g.corps + ', clicks ' + g.used);
  say('log: ' + (g.log || []).slice(-12).join(' / '));
  // an UPLINK it can't pay: its card says so
  await settle('map');
  for (let i = 0; i < 100 && st.evCard; i++) await sleep(100);   // (a sector event card: it closes it)
  st.run.credits = -9999; st.run.debt = 0;
  await swapTo(openUplink);
  for (let i = 0; i < 80 && !st.g0dxStop; i++) await sleep(100);
  check(st.g0dxStop && /can't pay the uplink/.test(st.g0dxStop.why) && !g0dxOn(), 'can\\'t pay the uplink: it stops (' + (st.g0dxStop && st.g0dxStop.why) + ')');
  check(st.g0dxStop && st.g0dxStop.used === g.used && st.g0dxStop.sector === st.run.sector + 1, 'its card: the clicks and how far');
  check(overlayTop() && overlayTop().id === 'g0dx', 'its card is up');
  st.g0dxStop.t0 = 0; overlayTop().key('enter');
  check(!st.g0dxStop, 'a tap closes it');
  // a safehouse with the WORKBENCH: it shreds the gear it doesn't use (a SHOE), keeps its own, and leaves
  save.legacy = Object.assign(save.legacy || {}, { bench: 1 }); benchSave().popsSeen = true;
  st.uplink = null; st.run.credits = 500; st.g0dxD = null;
  await swapTo(() => toMap()); await settle('map');
  if (!itemRoom('shoe', 0)) st.run.items.splice(st.run.items.findIndex(s => s.key !== 'g0dexe'), 1);   // (room for it, never G0D.exe's slot)
  const useful = st.run.items.filter(s => s.key !== 'g0dexe').map(s => s.key);
  addItem('shoe', 0);
  const before = st.run.items.map(s => s.key).join(',') + ' int ' + st.run.integrity + '/' + st.run.maxInt;
  const safe = Object.values(st.run.map).find(n => n.type === 'repair') || Object.assign({}, Object.values(st.run.map)[0], { type: 'repair', id: 'g0d-safe' });
  st.run.g0dx.on = true;
  await swapTo(() => openRepair(safe));
  for (let i = 0; i < 300 && !(st.mode === 'map' && !st.bench && i > 20) && !st.g0dxStop; i++) await sleep(100);
  check(!holds('shoe') && holds('g0dexe') && useful.every(k => holds(k) || !g0dxUses(k)), 'the workbench: the SHOE shredded; G0D.exe and the gear it uses kept (' + st.run.items.map(s => s.key).join(',') + ' / before: ' + before + ' / ' + (st.run.g0dx.log || []).slice(-6).join(' / ') + ')');
  check(st.mode === 'map' || st.mode === 'play', 'and it left the bench (' + st.mode + (st.g0dxStop ? ', stopped: ' + st.g0dxStop.why : '') + ')');
` };
