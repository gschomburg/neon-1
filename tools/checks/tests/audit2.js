// tools/checks/tests/audit2.js: the bugs from the second architecture audit (docs/ARCHITECTURE.md, 2026-11-23), v15.58:
// BOSS chips never drop; OVERCLOCK never lowers a cell; power past F fits one character; a CALL's own buttons by key
// (Esc presses the last); the PIER takes no taps while you die; cheats at the title make the next run practice; ROOT's
// quest finishes when the scene was cut off, and a progress wipe starts it over (the other quests' crew stays).
// Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'audit2', body: `
  await settle();
  save.ads = false;

  // BOSS chips (OMNI'S EYE) never come out of the ordinary roll
  const r = rngFor('AUDIT2', 'roll'); let boss = 0;
  for (let i = 0; i < 3000; i++) if (DECK_CHIPS[deckRollChip(r)][1] === 'boss') boss++;
  check(boss === 0, 'no BOSS chip in 3000 rolls (' + boss + ')');

  // OVERCLOCK: 15, or the cell's own power when that's more; power past F is one character
  save.deck = deckFreshSave(); save.deck.popsSeen = true;
  DECK = deckReal(); DECK.slots.PSU = 'HF9'; DECK.overclock = true;
  check(deckPower().budget >= 18, 'OVERCLOCK on HCF\\'S CORE keeps 18 (' + deckPower().budget + ')');
  DECK.slots.PSU = 'SC1';
  check(deckPower().budget >= 15, 'OVERCLOCK on the STOCK CELL: 15 (' + deckPower().budget + ')');
  DECK = null;
  check(deckHex(18) === 'I' && deckHex(15) === 'F' && deckHex(9) === '9', 'power past F: one character (' + deckHex(18) + ')');

  // a CALL with its own buttons: right picks the next, Esc presses the last
  let got = '';
  st.callBox = { who: 'pops', lines: ['x'], t0: performance.now(), btns: [{ text: '[ A ]', onTap: () => got = 'A' }, { text: '[ B ]', onTap: () => got = 'B' }] };
  callKey('escape');
  check(got === 'B' && !st.callBox, 'Esc presses the last button (' + got + ')');
  st.callBox = { who: 'pops', lines: ['x'], t0: performance.now(), btns: [{ text: '[ A ]', onTap: () => got = 'A' }, { text: '[ B ]', onTap: () => got = 'B' }] };
  callKey('arrowright'); callKey('enter');
  check(got === 'B', 'right, then Enter: the second button');

  // cheats on at the title: the next run is practice
  st.god = true;
  B.startRun('AUDIT2', false); await settle('start');
  check(st.run.practice, 'god mode on at the start: a practice run');
  st.god = false;
  B.startRun('AUDIT2B', false); await settle('start');
  check(!st.run.practice, 'and without it, a real one');

  // the PIER while you die: no casts, no LEAVE
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  const node = Object.values(st.run.map).find(n => n.type !== 'final');
  await swapTo(() => openPier(Object.assign({}, node, { id: 'a2-pier', type: 'pier' })));
  await sleep(300);
  st.busy = true;
  const casts0 = fishCasts();
  check(fishPointer('down', { clientX: innerWidth / 2, clientY: innerHeight / 2 }) === true && fishCasts() === casts0, 'dying: the stream takes no cast');
  leavePier(); await sleep(300);
  check(st.mode === 'fish', 'dying: LEAVE does nothing');
  st.busy = false;

  // ROOT: the letters spent, the scene cut off (the game closed): the next bench or deck finishes it
  save.legacy = save.legacy || {}; delete save.legacy.crew_root;
  save.quests = save.quests || {}; save.quests.root = { step: 'spell', signing: true };
  FEAT_QUEUE.length = 0; CALL_QUEUE.length = 0;
  rootStart();
  check(save.quests.root.step === 'done' && save.legacy.crew_root === 1 && !save.quests.root.signing, 'cut-off PAPERWORK: ROOT joins on the next open');

  // a progress wipe: ROOT starts over; POPS's quest keeps its crew
  save.quests.pops = { step: 'raid' };
  wipeProgress();
  check(!save.quests.root, 'the wipe: ROOT\\'s quest starts over');
  check(save.legacy.crew_pops === 1 && save.legacy.crew_b0y === 1, 'the wipe: POPS and b0y stay on the crew (raid is after TRACE ROUTE)');
` };
