// tools/checks/tests/root.js: ROOT's quest, PAPERWORK (docs/CREW_QUESTS.md, engine/quests.js): ROOT is quest crew (no
// CALL, no CREW post), the quest starts at USER, the WORKBENCH step, the lowercase letters a shred gives (engine/bench.js),
// PH1SH's spam ad (engine/ads.js), spelling r o o t with a 4th slot, and THE SHELL opening once ROOT's on the crew.
// Run by tools/test.js (a headless page, tools/checks/harness.js).
module.exports = { name: 'root', body: `
  const calls = [], realQueue = queueCall;
  window.queueCall = (id, lines, btn, onClose) => { calls.push({ id, lines }); };
  const closeCalls = async () => { for (let k = 0; k < 6 && (st.callBox || CALL_QUEUE.length); k++) { if (st.callBox) callClose(); await sleep(120); } };

  // ROOT is quest crew: no plain CALL brings it, no CREW post (its LVL 2 post stays)
  check(HACKERS.root.quest && !hkCallableId('root'), 'a plain CALL never brings ROOT');
  check(!LEGACY.some(u => u.key === 'crew_root') && LEGACY.some(u => u.key === 'crew2_root'), 'no CREW: ROOT post; its LVL 2 post is there');
  check(LEGACY.some(u => u.key === 'crew_pops'), 'the other crew keep their CREW posts');

  // the quest waits for USER
  save.legacy = {}; save.quests = {}; save.rep = 0;
  rootStart(); check(!rootStep(), 'GUEST: no quest yet');
  for (const u of LEGACY.filter(u => u.tier === 1)) save.legacy[u.key] = 1;
  check(boardLevel() >= 2, 'USER now: ' + boardLevel());
  CALL_QUEUE.length = 0;
  rootStart();
  check(rootStep() === 'bench', 'no WORKBENCH: the quest starts on A WORKBENCH: ' + rootStep());
  check(CALL_QUEUE.some(c => c.quest && c.quest.name === 'PAPERWORK'), 'a QUEST card says PAPERWORK');
  rootStart(); check(rootStep() === 'bench', 'it starts once');
  check(questsShown().includes('root') && questsNew(), 'THE BOARD > QUESTS lists it, with news');

  // the WORKBENCH bought: on to the letters
  save.rep = 999; buyPost(LEGACY.find(u => u.key === 'bench'));
  check(rootStep() === 'letters', 'WORKBENCH bought: THE FINE PRINT: ' + rootStep());

  // THE SHELL before ROOT: a chip's command isn't known
  check(!shellRooted(), 'no ROOT: THE SHELL is closed');

  // a shred gives a letter ROOT still needs (corrupted software: always); never one you have enough of
  check(rootNeed() === 'root', 'need all four: ' + rootNeed());
  let got = rootShredLetter(true);
  check('rot'.includes(got), 'corrupted software gives one: ' + got);
  const b0 = benchSave().letters; Object.assign(b0, { r: 1, o: 2 });
  check(rootNeed() === 't' && rootShredLetter(true) === 't', 'only the missing one drops: ' + rootNeed());
  delete b0.r; delete b0.o; delete b0.t;

  // at the bench: a shred with a letter keeps it under the shredder, a QUEST card shows it, then PH1SH's ad
  await shellBench(); await swapTo(() => openBench({ id: 'test-rest', type: 'rest', sector: st.run.sector })); await settle('bench');
  await closeCalls(); CALL_QUEUE.length = 0;
  st.run.loot = [{ key: 'corrupt', tier: 0, n: 1 }];
  st.bench.tab = 'shred'; benchPanel();
  const e = benchShredList().find(x => x.key === 'corrupt');
  benchShred(e);
  const sa = st.bench.shredAnim;
  check(sa && 'rot'.includes(sa.quest), 'the shred has a quest letter: ' + (sa && sa.quest));
  const ch = sa.quest;
  check(benchHave(ch) === 1, 'it is banked right away');
  for (let k = 0; k < 80 && sa.qPhase !== 'wait'; k++) await sleep(50);
  check(sa.qPhase === 'wait' && !!st.bench.shredAnim, 'it waits under the shredder: ' + sa.qPhase);
  for (let k = 0; k < 40 && !st.callBox; k++) await sleep(50);
  check(st.callBox && st.callBox.letter === ch && st.callBox.quest, 'the QUEST card shows the letter');
  check(benchBusy(), 'the bench waits');
  callClose();
  check(st.phish && st.phish.ch === ch && st.phish.spam === PHISH_SPAM[0], 'then PH1SH: the stowaway spam first');
  await sleep(450);
  // take the bait: a fish eats it, PH1SH laughs, credits go
  st.run.credits = 100;
  phishPick(true);
  for (let k = 0; k < 120 && st.phish; k++) await sleep(50);
  check(!st.phish, 'the ad closes on its own');
  check(st.run.credits === 70, 'PH1SH took 30cr: ' + st.run.credits);
  check(benchHave(ch) === 0 && sa.qPhase === 'gone', 'the letter is gone');
  check(calls.some(c => c.lines === QUEST_LINES.rootBit), "POPS: don't click links in ads");
  for (let k = 0; k < 40 && st.bench.shredAnim; k++) await sleep(50);
  check(!st.bench.shredAnim, 'the shred ends');

  // the next one: [ close ] keeps it (force the ad: ROOT_ODDS.phish)
  ROOT_ODDS.phish = 1; calls.length = 0;
  st.run.loot = [{ key: 'corrupt', tier: 0, n: 1 }];
  benchShred(benchShredList().find(x => x.key === 'corrupt'));
  const sa2 = st.bench.shredAnim, ch2 = sa2.quest;
  for (let k = 0; k < 120 && !st.phish; k++) await sleep(50);
  check(st.phish && st.phish.spam === PHISH_SPAM[1], 'the second ad is another spam');
  await sleep(450); phishPick(false);
  for (let k = 0; k < 60 && st.bench.shredAnim; k++) await sleep(50);
  check(benchHave(ch2) === 1 && sa2.qPhase === 'home', 'close: the letter flew home: ' + sa2.qPhase);
  check(calls.some(c => c.lines === QUEST_LINES.rootClosed), 'POPS: good instincts');

  // all four: SIGN HERE
  Object.assign(save.bench.letters, { r: 1, o: 2, t: 1 }); rootCheck();
  check(rootStep() === 'spell', 'all four: SIGN HERE: ' + rootStep());
  check(calls.some(c => c.lines === QUEST_LINES.rootAll), 'POPS says spell it');

  // the 4th slot: a lowercase letter opens it; a digit can't go in; a wrong word gives the letters back
  await closeCalls();
  st.bench.tab = 'build'; benchPanel(); st.bench.slots = [null, null, null, null];
  save.bench.letters['3'] = 1;
  benchPlace('3'); check(st.bench.slots[3] === '3', 'a digit goes in the x slot');
  benchPlace('r'); check(st.bench.slots[0] === 'r' && !st.bench.slots[3], 'r goes in; the digit comes out (the 4th slot is a letter slot)');
  benchPlace('3'); check(!st.bench.slots.includes('3'), 'no digits while spelling ROOT');
  benchPlace('t'); benchPlace('o'); benchPlace('o');
  check(st.bench.slots.join('') === 'rtoo' && benchJudge().kind === 'rbad', 'r t o o: not it: ' + benchJudge().kind);
  const before = JSON.stringify(save.bench.letters);
  benchBuild(); check(JSON.stringify(save.bench.letters) === before, 'a wrong word burns nothing');
  [3, 2, 1, 0].forEach(i => benchUnplace(i, true));
  check(!benchRootMode(), 'cleared: back to three slots');
  // a * fills in
  save.bench.letters['*'] = 1;
  benchPlace('r'); benchPlace('*'); benchPlace('o'); benchPlace('t');
  check(benchJudge().kind === 'root', 'r * o t is ROOT: ' + st.bench.slots.join(''));
  // other words can't use them
  [3, 2, 1, 0].forEach(i => benchUnplace(i, true));
  check(!Object.values(benchRecipes()).some(rc => /[a-z]/.test(rc.code)), 'no recipe has lowercase letters');

  // spell it: the scene, then ROOT's on your crew and THE SHELL opens
  const scenes = [], realPlay = playScene;
  window.playScene = (id, onEnd) => { scenes.push(id); onEnd && onEnd(); };
  benchPlace('r'); benchPlace('o'); benchPlace('o'); benchPlace('t');
  benchBuild();
  for (let k = 0; k < 60 && st.bench.anim; k++) await sleep(50);
  window.playScene = realPlay;
  check(scenes[0] === 'paperwork', 'the PAPERWORK scene plays');
  check(rootOn() && rootStep() === 'done', 'ROOT is on your crew: ' + rootStep());
  check(rootNeed() === 'root', 'the letters were spent');
  check(save.deck ? deckHave('MN1') === 1 : true, "ROOT's chip, man");
  check(shellRooted(), 'THE SHELL is open');
  window.queueCall = realQueue;
` };
