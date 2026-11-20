// tools/checks/tests/charges.js: THE SHELL's charges (docs/SHELL.md "Charges", engine/deck.js): SHELL chips give them,
// commands cost them, a new sector tops them up (SHELL_REFILL), a corp boss's CHARGE pick adds 2, ROOTKIT (CRASH) burns
// them to save you, and dev.start turns on dev mode (no charges, the run is practice).
// Run by tools/test.js (a headless page, tools/checks/harness.js).
module.exports = { name: 'charges', body: `
  B.startRun('CHARGES', false); await settle('start');
  const run = st.run;
  save.legacy = save.legacy || {}; save.legacy.crew_root = 1;   // THE SHELL is ROOT's
  const lastOut = () => (SHELL.log[SHELL.log.length - 1] || {}).s || '';

  // the pool: what the run's chips give, full at the start
  run.chips = ['WH0', 'CA4']; deckCharges(run);
  check(run.chargeMax === 7 && run.charges === 7, 'whoami (3) + CAPACITOR (4): 7 charges, full: ' + run.charges + '/' + run.chargeMax);
  check(/\\+3 shell charges/.test(DECK_CHIPS.WH0[4]) && /charges/.test(DECK_CHIPS.CA4[6]), "the chips' text says their charges");

  // a command costs its charges; not enough: it doesn't run
  check(shellCost(SHELL_BY.whoami) === 1 && shellCost(SHELL_BY.flatline) === 3, 'whoami costs 1, flatline 3');
  run.charges = 1;
  await shellRun('whoami');
  check(run.charges === 0 && run.hacked, 'whoami ran: 1 charge spent, the run is hacked: ' + run.charges);
  await shellRun('whoami');
  check(/not enough charges/.test(lastOut()) && run.charges === 0, 'no charges: it says so: ' + lastOut());
  // a command that fails costs nothing
  run.charges = 3; run.chips.push('MN1');
  const c0 = st.corp; st.corp = null; await shellRun('man'); st.corp = c0;
  check(run.charges === 3, 'man on the map (it needs a corp): nothing spent: ' + run.charges);

  // a new sector tops it up
  run.charges = 1; deckSector(run);
  check(SHELL_REFILL !== 'sector' || run.charges === run.chargeMax, 'a new sector: full again: ' + run.charges);

  // CHARGE: +2, never past the max; not in markets or at the bench
  run.charges = run.chargeMax - 1; GEAR.charge.use(0, null, run);
  check(run.charges === run.chargeMax, 'CHARGE tops up to the max, no further: ' + run.charges);
  check(!GEAR.charge.ok(), "full: CHARGE can't be used");
  check(!shopGear().includes('charge') && !Object.values(benchRecipes()).some(rc => rc.key === 'charge'), 'no CHARGE in markets or at the bench');
  // a corp boss offers it (with charges and ROOT), on its own stream
  const nodes = Array.from({ length: 40 }, (_, i) => ({ id: 'cr' + i }));
  const offered = nodes.filter(n => deckChargeReward(n)).length;
  check(offered > 4 && offered < 26, 'corp bosses offer a CHARGE now and then: ' + offered + '/40');
  const max0 = run.chargeMax; run.chargeMax = 0;
  check(!nodes.some(n => deckChargeReward(n)), 'no SHELL chips: never');
  run.chargeMax = max0;

  // ROOTKIT: dying with charges burns them all, back at 1 INT; again once there are charges
  run.chips.push('RK1'); run.charges = 3; run.integrity = 0;
  const lv0 = st.lv; st.lv = st.lv || { tiles: [] };
  check(deckRootkit(run) === 3 && run.charges === 0 && run.integrity === 1, 'ROOTKIT: 3 charges burned, 1 INT');
  check(deckRootkit(run) === 0, 'no charges: ROOTKIT does nothing');
  run.charges = 1;
  check(deckRootkit(run) === 1, 'charges back: it saves you again');
  save.legacy.crew_root = 0; run.charges = 2;
  check(deckRootkit(run) === 0, 'no ROOT on the crew: ROOTKIT does nothing');
  save.legacy.crew_root = 1; st.lv = lv0;

  // dev.start: every command, no charges, the run is practice (and it isn't in the autocomplete)
  check(!JSON.stringify(SHELL_CMDS.map(c => c.name)).includes('dev.start'), 'dev.start is not a listed command');
  run.practice = false; run.charges = 0;
  await shellRun('dev.start');
  check(shellDev() && run.practice && shellCost(SHELL_BY.flatline) === 0, 'dev.start: dev mode, the run is practice, no costs');
  st.devAccess = false;
` };
