// tools/checks/tests/g0dstep4.js: G0D.exe, step 4 (engine/g0dexe.js; docs/BACKLOG.md, Greg 2026-11-08). $ nodes in a corp
// it knows (full health, the UPLINK short, not a boss); MAGNET on a $ node; the pier: it leaves (phishing off), or
// with "phish it all away" it casts till it can't and keeps what it lands; the hand-off flag stops it when every way
// on is a guess and you're low with nothing to heal.
module.exports = { name: 'g0dstep4', body: `
  await settle();
  save.ads = false;
  Object.assign(CONFIG, { wipeSpeed: 8, wipeStagger: 0, revealDelay: 0, revealGap: 0, introHold: 0 });
  B.startRun('G0DST4', true); await settle('start');
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  st.god = true;
  save.g0dx = { clicks: 9999, speed: 16, beaten: 1, popups: true, countWins: true, build: false, phish: false, handoff: false };
  g0dxGive(); st.run.g0dx.card = false;
  const node = Object.values(st.run.map).find(n => n.type === 'corp');
  const ready = async () => { for (let i = 0; i < 100 && !(st.lv && st.lv.readyAt != null && !st.busy && !st.transitioning && !st.wipe); i++) { if (st.intro) st.intro.skip = true; await sleep(100); } };
  // $ nodes, in a corp it knows
  corpStat('basic').breached = 1;
  node.corp = 'basic'; node.tier = 2; startCorp(node, 1); await ready();
  let lv = st.lv; const ice = lv.tiles.find(t => !t.safe && t.state === 'closed'); ice.loaded = true;
  st.run.credits = 0; st.run.integrity = st.run.maxInt;
  check(g0dxChoose(lv) === ice, 'a $ node first: full health, the uplink short of money');
  st.run.integrity = st.run.maxInt - 1;
  check(g0dxChoose(lv) === lv.tiles[lv.safe], 'not when hurt: the real node');
  st.run.integrity = st.run.maxInt; st.run.credits = 9999;
  check(g0dxChoose(lv) === lv.tiles[lv.safe], 'not when the money is there');
  st.run.credits = 0;
  addItem('magnet', 0);
  check(g0dxLayerGear(lv, {}) === 'magnet', 'a MAGNET pulls it instead, when it has one');
  // the pier: phishing off, it leaves
  st.corp = null; st.run.ended = false; B.toMap(); await sleep(1200);
  const pier = Object.assign({}, node, { id: 'g0d-pier', type: 'pier' });
  st.run.credits = 300;
  await swapTo(() => openPier(pier));
  st.run.g0dx.on = true;
  for (let i = 0; i < 60 && st.mode === 'fish'; i++) await sleep(100);
  check(st.mode !== 'fish' && !(st.run.pierCasts || {})['g0d-pier'] && st.run.credits === 300, 'phishing off: it leaves the pier, no casts');
  // phish it all away: casts till the pier is fished out (or the money's gone), keeps what it lands
  save.g0dx.phish = true; st.run.g0dx.on = false;
  const casts0 = ECON.fish.casts; ECON.fish.casts = 4;   // (a short pier: fish swim at their own pace)
  await settle('map');
  const pier2 = Object.assign({}, node, { id: 'g0d-pier2', type: 'pier' });
  const loot0 = (st.run.loot || []).length + st.run.items.length;
  await swapTo(() => openPier(pier2));
  st.run.g0dx.on = true;
  for (let i = 0; i < 1500 && st.mode === 'fish' && !st.g0dxStop; i++) await sleep(100);
  const casts = (st.run.pierCasts || {})['g0d-pier2'] || 0;
  check(casts === 4 || st.run.credits < fishCost(), 'it cast till the pier was fished out (' + casts + ' of 4, ' + st.run.credits + 'cr left)');
  check(st.mode !== 'fish', 'then it moved on (' + st.mode + ')');
  check((st.run.loot || []).length + st.run.items.length > loot0 || /phished|shoe|gear/.test((st.run.g0dx.log || []).join(' ')) || casts > 0, 'and it landed something, or at least tried');
  // at a pier: a popup mid-phish (a CALL) gets clicked through; a gear catch it uses with the belt full: junk goes, it keeps it
  const pier3 = Object.assign({}, node, { id: 'g0d-pier3', type: 'pier' });
  st.run.g0dx.on = false; await settle('map'); st.run.credits = 300;
  await swapTo(() => openPier(pier3));
  while (st.run.items.length < st.run.beltSlots) addItem(['shoe', 'egg', 'lotto', 'flare'].find(k => ITEMS[k] && !holds(k)) || 'shoe', 0);
  for (const s of st.run.items) if (s.key === 'lotto') s.key = 'shoe';   // (it would scratch a LOTTO: junk only)
  if (g0dxJunkSlot() < 0) st.run.items[st.run.items.findIndex(s => s.key !== 'g0dexe')] = { key: 'shoe', tier: 0, n: 1 };   // (some junk to make room with)
  queueCall('pops', ['kid. you fishing?', 'nice.']);
  st.run.g0dx.on = true;
  for (let i = 0; i < 80 && (st.callBox || overlayTop()); i++) await sleep(100);
  check(!st.callBox && !overlayTop() && st.mode === 'fish', 'a popup at the pier: clicked through, still fishing');
  st.run.g0dx.on = false; await sleep(300);
  const f = st.fish; f.hook = null; f.reel = null;
  f.card = { out: { kind: 'gear', key: 'warp', tier: 0, rarity: ITEMS.warp.rarity }, look: '[wrp]', t0: performance.now() };
  const full = st.run.items.length >= st.run.beltSlots && !itemRoom('warp', 0);
  st.run.g0dx.on = true; st.g0dxD = null;
  for (let i = 0; i < 60 && f.card; i++) await sleep(100);
  check(full && holds('warp') && !f.card, 'a gear catch it uses, belt full: junk out, the catch kept (' + st.run.items.map(s => s.key).join(',') + ')');
  st.run.g0dx.on = false;
  ECON.fish.casts = casts0;
  say('pier log: ' + (st.run.g0dx.log || []).slice(-10).join(' / '));
  // the hand-off flag: low, nothing to heal, every way on a guess: it stops
  save.g0dx.phish = false; st.run.g0dx.on = false;
  await settle('map'); if (st.mode !== 'map') { await swapTo(() => toMap()); await settle('map'); }
  for (const id of availableNodes()) Object.assign(st.run.map[id], { type: 'corp', corp: 'kernel' });
  corpStat('kernel').breached = 0;
  st.run.items = st.run.items.filter(s => s.key !== 'patch' && s.key !== 'stim');
  st.run.integrity = 1; st.god = false;
  save.g0dx.handoff = true; st.g0dxStop = null; st.g0dxD = null; st.run.g0dx.on = true;
  for (let i = 0; i < 60 && !st.g0dxStop; i++) await sleep(100);
  check(st.g0dxStop && /every way on/.test(st.g0dxStop.why), 'the hand-off flag: it stops (' + (st.g0dxStop && st.g0dxStop.why) + ')');
  save.g0dx.handoff = false; st.g0dxStop = null; st.god = true;
` };
