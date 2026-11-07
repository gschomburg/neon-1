// tools/tests/batch1453.js: BOX OF WIRES (v14.53, Greg 2026-11-07): a scrap mod that does nothing until you've found
// enough of it; only exotic does anything: every node in every sector open (any order, the boss too); while you carry
// it, offers pull it in more. Run by tools/test.js (a headless page).
module.exports = { name: 'batch1453', body: `
  await settle();
  B.startRun('WIRES1453', false); await settle('start');
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  const run = st.run, before = availableNodes().length;
  addMod('wires', 0);
  check(modTier('wires') === 0 && !wiresOpen() && availableNodes().length === before, 'scrap: it does nothing');
  for (let i = 0; i < 4; i++) addMod('wires', 0);
  check(modTier('wires') === 4 && !wiresOpen() && availableNodes().length === before, 'legendary: still nothing');
  addMod('wires', 0);
  const sec = Object.values(run.map).filter(n => (n.sector || 0) === run.sector && !run.visited.includes(n.id) && n.id !== run.at);
  check(modTier('wires') === 5 && modMaxed('wires') && wiresOpen() && availableNodes().length === sec.length, 'exotic, the top: every node in the sector, ' + availableNodes().length + ' of ' + sec.length);
  check(sec.some(n => n.type === 'final') && availableNodes().includes(sec.find(n => n.type === 'final').id), 'the boss is open too');
  run.sector = 1; check(wiresOpen(), 'and every sector after'); run.sector = 0;
  run.modTier.wires = 1; let hit = 0;
  for (let i = 0; i < 100; i++) if (pickMods(rngFor('w', i), modsFound('gen', 'minor'), 2).some(o => o.key === 'wires')) hit++;
  check(hit > 30, 'carrying it, offers pull it in: ' + hit + ' of 100');
` };
