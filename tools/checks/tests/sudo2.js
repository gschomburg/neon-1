// tools/checks/tests/sudo2.js: the v15.06 SUDO commands (engine/deck.js): mode.free (FT3) and corp.jump (JM4), the
// player versions of dev commands; rm -rf (RF4) and chmod (CM3). Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'sudo2', body: `
  const out = () => (SHELL.log[SHELL.log.length - 1] || {}).s || '';
  st.devAccess = false;
  B.startRun('SUDO2TEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  if (st.evCard) closeEventCard();
  const run = st.run;
  save.legacy = save.legacy || {}; save.legacy.crew_root = 1; save.shellHi = true;
  run.chips = ['FT3', 'JM4', 'RF4', 'CM3']; deckCharges(run);
  check(run.chargeMax === 3 + 4 + 4 + 3, 'the chips give their charges: ' + run.chargeMax);
  run.chargeMax = run.charges = 99;
  shellOpen();
  check(shellParse('rm -rf').cmd.name === 'rm -rf' && shellParse('rm').cmd.name === 'rm', 'rm -rf reads as its own command, rm as rm');

  // mode.free: this sector, boss and all
  const boss = bossIdOf(run.sector);
  check(!availableNodes().includes(boss), 'before: the boss is out of reach');
  await shellRun('mode.free');
  check(run.freeSector === run.sector && availableNodes().includes(boss) && run.charges === 96 && !st.freeTravel, 'mode.free: the boss is open, 3 spent: ' + out());
  await shellRun('mode.free'); check(/already/.test(out()) && run.charges === 96, 'again: it says so, nothing spent');
  run.sector++; check(!availableNodes().includes(boss), 'next sector: worn off'); run.sector--; run.freeSector = null;

  // chmod: a mod up a rarity till the sector ends
  const mk = Object.keys(MODS).find(k => deckGiveable('mod', k) && !has(k) && !clashWith(k) && !DECK_CHMOD_NO.includes(k) && tierCount(MODS[k]) >= 3);
  addMod(mk, 0);
  await shellRun('chmod buffer'); check(/don't have|won't/.test(out()), 'BUFFER: no: ' + out());
  await shellRun('chmod ' + mk);
  check(modTier(mk) === 1 && run.chmod.key === mk && run.charges === 93, 'chmod: up one, 3 spent: ' + out());
  await shellRun('chmod ' + mk); check(/used/.test(out()) && modTier(mk) === 1, 'again this sector: no');
  run.sector++; deckChmodOff(run);
  check(modTier(mk) === 0 && !run.chmod, 'a new sector: back down');
  run.sector--; removeMod(mk);

  // in a corp: rm -rf, then corp.jump
  const corp = availableNodes().map(id => run.map[id]).find(n => n.type === 'corp');
  await enterNode(corp); await settle('corp');
  const lv = st.lv;
  check(st.mode === 'play' && lv && !lv.boss, 'in a corp, on a layer');
  const ice = () => deckRfIce(lv).length, n0 = ice();
  await shellRun('rm -rf'); await sleep(300 + 80 * n0); await settle('rmrf');
  check(n0 > 0 && ice() === 0 && lv.tiles[lv.safe].state === 'closed', 'rm -rf: every ICE gone, the real one left: ' + n0);
  check(!st.busy, 'and the layer is yours again');
  const ty = st.corp.node.type; st.corp.node.type = 'final';
  await shellRun('rm -rf'); check(/too big/.test(out()), 'not on a sector boss'); st.corp.node.type = ty;
  await shellRun('corp.jump'); await sleep(400); await settle('jump');
  check(st.lv && st.lv.boss, 'corp.jump: at the boss');
  await shellRun('corp.jump'); check(/already/.test(out()), 'again at the boss: no');
  check(!run.practice && run.hacked, 'rooted, not practice');
  if (st.shell) shellClose();
` };
