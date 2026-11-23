// tools/checks/tests/dangercatch.js: DANGEROUS CATCH (a chip, engine/fishing.js fishDanger, v15.56; CHECKPOINT there v15.59): PHISH sells for more
// with it on; a PHISH you land can bite (-1 INT); a bite at 0 INT ends the run at the pier, and that's FISH FOOD.
// Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'dangercatch', body: `
  await settle();
  save.ads = false;
  Object.assign(CONFIG, { wipeSpeed: 8, wipeStagger: 0, revealDelay: 0, revealGap: 0, introHold: 0 });
  B.startRun('DGCATCH', false); await settle('start');
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  st.run.practice = false;
  const key = Object.keys(ITEMS).find(k => ITEMS[k].fish && !ITEMS[k].bag && ITEMS[k].rarity === 'rare');
  const plain = fishWorth(key);
  st.run.chips = (st.run.chips || []).concat('DG3');
  check(fishWorth(key) === earnInt(ECON.fish.rare * ECON.fish.dangerPay) && fishWorth(key) > plain, 'PHISH sells for more: ' + plain + ' -> ' + fishWorth(key));

  const node = Object.values(st.run.map).find(n => n.type !== 'final');
  const land = () => { const f = st.fish, s = { lane: 0, x: 10, dir: -1, out: { kind: 'fish', key, tier: 0, rarity: 'rare' }, look: '<><', size: 'small', spd: 0 };
    f.shapes.push(s); f.reel = { s, catch: 1, win: 0, winV: 0, mark: 0.5, w: 0.3 }; f.hook = { bite: s }; fishCaught(); };
  await swapTo(() => openPier(Object.assign({}, node, { id: 'dg-pier', type: 'pier' })));
  await sleep(300);
  const danger0 = ECON.fish.danger;

  // never bites: nothing lost
  ECON.fish.danger = 0; st.run.integrity = 3;
  land();
  check(st.run.integrity === 3 && st.fish.card, 'no bite: INT as it was, the catch is in');
  st.fish.card = null;

  // bites: -1 INT
  ECON.fish.danger = 1;
  land();
  check(st.run.integrity === 2 && /bit you/.test(st.msg || ''), 'a bite: -1 INT (' + st.run.integrity + ', ' + st.msg + ')');
  st.fish.card = null;

  // CHECKPOINT takes a bite at 1 INT: back on the map with nothing, full INT (Greg, 2026-11-23)
  st.run.chips.push('CP0'); st.run.integrity = 1; st.run.credits = 50;
  land();
  for (let i = 0; i < 60 && st.mode !== 'map'; i++) await sleep(100);
  check(!st.run.ended && st.mode === 'map' && st.run.integrity === st.run.maxInt && st.run.credits === 0 && st.run.checkpointUsed, 'CHECKPOINT at the pier: back on the map, broke, full INT (' + st.mode + ')');
  await sleep(800);
  await swapTo(() => openPier(Object.assign({}, node, { id: 'dg-pier2', type: 'pier' })));
  await sleep(300);

  // a bite at 1 INT: the run ends at the pier, FISH FOOD
  const died0 = (save.stats && save.stats.diedFishing) || 0;
  st.run.integrity = 1;
  const run = st.run;
  land();
  for (let i = 0; i < 120 && !run.ended; i++) await sleep(100);
  ECON.fish.danger = danger0;
  check(run.ended && run.diedPier, 'dead at the pier');
  for (let i = 0; i < 120 && ((save.stats && save.stats.diedFishing) || 0) === died0; i++) await sleep(100);
  check(((save.stats && save.stats.diedFishing) || 0) === died0 + 1, 'counted: diedFishing ' + died0 + ' -> ' + (save.stats && save.stats.diedFishing));
  check(save.feats && save.feats.fishfood, 'FISH FOOD');
` };
