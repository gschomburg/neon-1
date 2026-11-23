// tools/checks/tests/feats2.js: the v15.54 feats. The TECH group (WORKBENCH builds and shreds, the deck: slotting, a
// full board, a run with a chip that has no power, chips home; SUDO), BRUTE FORCE, CONFERENCE CALL, ONE MORE TRY,
// PHISH MONGER, and the standing ones featSweep reads (SYSOP, MK IV, COLLECTOR, MOVED IN). Practice runs and the
// WORKBENCH training don't count. Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'feats2', body: `
  const done = id => !!(save.feats && save.feats[id]);
  save.feats = {}; save.stats = {}; FEAT_QUEUE.length = 0;
  check(FEAT_GROUPS.some(g => g[0] === 'tech') && FEATS.filter(f => f.group === 'tech').length === 15, 'the TECH group: 15 feats');
  check(FEATS.every(f => f.name.length <= 16 && (!f.title || f.title.length <= 16)), 'names and titles fit (16)');

  // a practice run counts nothing
  B.startRun('FEATPRAC', true); await settle('practice');
  benchTally({ rc: { kind: 'gear', key: 'purge' } });
  check(!statOf('built'), 'practice: no builds counted');

  // a real run: the WORKBENCH
  B.startRun('FEATTEST', false); await settle('start');
  for (let i = 0; i < 10; i++) benchTally({ rc: { kind: 'gear', key: 'purge' } });
  check(done('handyman') && done('crafty') && !done('tinkerer'), 'HANDYMAN and CRAFTY after 10 gear');
  const ex = Object.keys(MODS).find(k => MODS[k].kind === 'exotic' && MODS[k].short && benchRecipes()[MODS[k].short]);
  benchTally({ rc: benchRecipes()[MODS[ex].short], lucky: true });
  check(done('decompiler') && done('luckyguess'), 'DECOMPILER (an exotic) and LUCKY GUESS (RUN ANYWAY)');
  benchTally({ rc: { kind: 'chip', key: 'x' } });
  check(done('chipmaker'), 'CHIPMAKER');
  // the training doesn't count
  const mods0 = statOf('builtMods'); st.tut = { bench: {} }; benchTally({ rc: { kind: 'mod', key: 'tracer' } }); st.tut = null;
  check(statOf('builtMods') === mods0, 'the WORKBENCH training: not counted');

  // BRUTE FORCE: 8 INT lost in a corp, then breached
  st.corp = { lost: 0 }; corpLost(5); corpLost(3);
  check(st.corp.lost === 8, 'corpLost adds up: ' + st.corp.lost);
  st.corp = null;

  // CONFERENCE CALL: the second call in a layer
  st.lv = { calls: 1 }; st.lv.calls++; if (st.lv.calls === 2) tally('doubleCall');
  check(done('confcall'), 'CONFERENCE CALL');
  st.lv = null;

  // ONE MORE TRY: the same seed, deeper
  save.seedBest = {};
  tallyRunEnd({ seed: 'SEEDX', depth: 5, earned: 0, credits: 0, corps: 1 }, false, 0);
  check(!done('seedbetter') && save.seedBest.SEEDX === 5, 'the first time: just noted');
  tallyRunEnd({ seed: 'SEEDX', depth: 4, earned: 0, credits: 0, corps: 1 }, false, 0);
  check(!done('seedbetter'), 'not as deep: no');
  tallyRunEnd({ seed: 'SEEDX', depth: 9, earned: 0, credits: 0, corps: 1 }, false, 0);
  check(done('seedbetter') && save.seedBest.SEEDX === 9, 'deeper: ONE MORE TRY');

  // the deck: slot a chip, a run with a chip that has no power, a full board
  save.deck = deckFreshSave(); save.legacy = save.legacy || {};
  openDeck(); await sleep(300);
  const free = DECK_SOCKETS.find(s => s.g === 'boot' && deckOpen(s.mk) && !DECK.slots[s.id]);
  const boot = Object.keys(DECK_CHIPS).find(k => DECK_CHIPS[k][1] === 'boot' && DECK_CHIPS[k][3] > 0 && deckFits(k, free));
  DECK.chips[boot] = 1; deckSlot(boot, free.id); deckPersist();
  check(done('pluggedin'), 'PLUGGED IN');
  // no cell: every chip is out of power (off the deck screen first: it writes itself to the save every frame)
  showTitle(); DECK = null; await sleep(300);
  delete save.deck.slots.PSU; save.deck.order = save.deck.order.filter(i => i !== 'PSU');
  check(deckRunChips(st.run).under === true, 'no cell: a chip with no power');
  B.startRun('FEATTEST2', false); await settle('start 2');
  check(done('underpowered'), 'UNDERPOWERED');
  DECK = deckReal();   // (deckFull reads which sockets are open from the deck on screen)
  check(deckFull({ slots: Object.fromEntries(DECK_SOCKETS.map(s => [s.id, 'X'])) }) && !deckFull({ slots: {} }), 'deckFull reads the open sockets');
  DECK = null;

  // the standing feats
  save.legacy.fuse = 1; featSweep();
  check(done('mk4') && profile().title !== undefined, 'MK IV');
  check(FEAT_BY_ID.mk4.title === 'DECK JOCKEY' && FEAT_BY_ID.movedin.title === 'TENANT', 'the titles: DECK JOCKEY, TENANT');
  for (let i = 0; i < 25; i++) save.deck.chips['T' + i] = 1;
  featSweep();
  check(done('collector'), 'COLLECTOR: 25 kinds');
  save.legacy.crew_root = 1; featSweep();
  check(done('movedin'), 'MOVED IN');
  for (let i = 0; i < 30; i++) tally('phishSold');
  check(done('phishmonger'), 'PHISH MONGER');
  delete save.legacy.fuse; delete save.legacy.crew_root;
  for (let i = 0; i < 25; i++) delete save.deck.chips['T' + i];
` };
