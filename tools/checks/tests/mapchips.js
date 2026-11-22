// tools/checks/tests/mapchips.js: the map chips out of BETA (Greg, 2026-11-22, v15.49): HEADSTART (any node in the first
// 2 rows), INTO THE FIRE (an event in sector 1), PIER PASS (phish at a rest stop, once a sector), ALMANAC (the next sector's card early),
// FORGET-ME-NOT (last time's path on the map). Run by tools/test.js.
module.exports = { name: 'mapchips', body: `
  B.startRun('MAPCHIPS', false); await settle('start');
  const run = st.run;
  check(['HS1', 'EV2', 'PP2', 'AL4', 'MM4'].every(k => !deckBeta(k)), 'none of them is BETA now');
  // HEADSTART
  run.chips = []; const a0 = availableNodes().map(id => run.map[id].step);
  run.chips = ['HS1']; const a1 = availableNodes().map(id => run.map[id].step);
  check(!a0.includes(2) && a1.includes(2) && a1.includes(1) && !a1.some(s => s > 2), 'HEADSTART: the first move reaches row 2 too: ' + a1.join(','));
  // INTO THE FIRE: sector 1 gets an event; the later ones stay the same
  run.chips = []; check(!sectorEvent(0, run.map), 'no chip: no event in sector 1');
  const corps0 = Object.values(run.map).filter(n => n.type === 'corp').map(n => n.id + n.corp).sort().join();
  run.chips = ['EV2']; deckFireEvent(run);
  const ev0 = sectorEvent(0, run.map);
  check(!!ev0 && !DECK_FIRE_SKIP.includes(ev0) && ev0 !== rollEvent(run.seed, 1), 'INTO THE FIRE: sector 1 has an event: ' + ev0);
  const corps1 = Object.values(run.map).filter(n => n.type === 'corp').map(n => n.id + n.corp).sort().join();
  check(ev0 === 'copypaste' || ev0 === 'timeismoney' || corps1 === corps0, '...and the same corps (unless the event picks them)');
  // PIER PASS: once a sector, a rest stop can be your PIER instead (no node turns into one)
  { const rest = Object.values(run.map).filter(n => n.sector === 0 && ['shop', 'repair', 'cache'].includes(n.type)), types = rest.map(n => n.type).join();
    run.chips = []; check(!rest.some(n => deckPhishHere(n)), 'no chip: no phishing at rest stops');
    run.chips = ['PP2']; check(rest.length && rest.every(n => deckPhishHere(n)), 'PIER PASS: every rest stop in the sector offers it');
    await enterNode(rest[0], true, true); await sleep(400);
    check(st.mode === 'fish' && run.pierSec === 0 && run.at === rest[0].id, 'phishing there: the PIER, not the stop');
    check(rest.map(n => n.type).join() === types, 'no node changed type');
    check(!rest.some(n => deckPhishHere(n)), 'then not again this sector');
    check(canGoBack(rest[0]), 'going back in: the PIER again');
    leavePier(); await sleep(900); }
  // ALMANAC: once a sector, the next sector's card
  run.chips = ['AL4']; st.evCard = null; run.almSeen = [];
  const nxt = rollEvent(run.seed, 1), shown = deckAlmanac(run);
  check(nxt ? shown && st.evCard && st.evCard.almanac && st.evCard.sector === 1 && st.evCard.ev === nxt : !shown, 'ALMANAC: the next sector card: ' + nxt);
  check(!deckAlmanac(run), '...once');
  if (st.evCard) check(/NEXT UP/.test(eventCardRows(st.evCard.ev, 1, null, true)[0].t), 'its card says NEXT UP');
  st.evCard = null;
  // FORGET-ME-NOT: every run's path is kept (the last 20 seeds), and the chip draws it
  save.paths = []; for (let i = 0; i < 25; i++) deckSavePath({ seed: 'S' + i, visited: ['0:1', '1:' + (i % 3)] });
  check(save.paths.length === 20 && !deckLastPath('S0') && deckLastPath('S24').join() === '0:1,1:0', 'paths: the last 20 seeds');
  deckSavePath({ seed: 'S10', visited: ['0:1', '1:2', '2:2'] }); check(save.paths.length === 20 && deckLastPath('S10').length === 3 && save.paths[19][0] === 'S10', 'played again: the newest');
  run.lastPath = ['0:1', '1:2', '2:2']; check(deckWasPath(run, '1:2', '2:2') && deckWasPath(run, '2:2', '1:2') && !deckWasPath(run, '0:1', '2:2'), 'a link on the last path');
  check(buildScene(performance.now(), false).length > 100, 'the map draws');
  save.paths = [];
`};
