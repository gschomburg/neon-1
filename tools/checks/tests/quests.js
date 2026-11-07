// tools/checks/tests/quests.js: POPS's quest moves from step to step (engine/quests.js, the steps in data/quests.js):
// the UPLINK reminders, cashing out with the DISC / DOGTAG, the scenes that end a step, THE BOARD's buttons.
module.exports = { name: 'quests', body: `
  B.startRun('QSTTEST', false); await settle('start');
  const q = questOf('pops'), run = st.run;
  q.seen = true;
  const calls = [], scenes = [], cards = [];
  const realQueue = queueCall, realPlay = playScene, realCard = questCard;
  window.queueCall = (id, lines, btn) => calls.push({ id, lines, btn: btn && btn.text });
  window.playScene = id => scenes.push(id);
  window.questCard = id => cards.push(id);
  const lastCall = () => calls[calls.length - 1] || {};
  const board = () => { const out = []; questBoardLines(t => out.push({ text: t }), x => out.push(x)); return out; };
  const boxOf = () => board().find(x => x.box);
  const replayOf = () => { const r = board().find(x => x.id === 'qreplay'); if (!r) return null; scenes.length = 0; r.onTap(); return scenes[0]; };
  // a scene ending: what sceneEnd does after the scene sc.id
  const endScene = id => { st.qScene = { id, i: 0, t0: 0 }; sceneEnd(); };
  const carry = key => { run.loot = (run.loot || []).filter(s => s.key !== 'disc' && s.key !== 'dogtag'); if (key) run.loot.push({ key, tier: 0, n: 1 }); };

  // find: holding the DISC at the UPLINK, POPS reminds you; cash out with it: deliver
  q.step = 'find'; carry('disc');
  calls.length = 0; questUplink();
  check(calls.length === 1 && lastCall().lines === QUEST_LINES.uplink, 'find: the UPLINK reminder with the DISC');
  carry(null); calls.length = 0; questUplink(); check(!calls.length, 'find: no reminder without it');
  carry('disc'); calls.length = 0; questCashOut(run); await sleep(700);
  check(q.step === 'deliver', 'find: cash out with the DISC -> deliver (' + q.step + ')');
  check(lastCall().lines === QUEST_LINES.deliver && lastCall().btn === '[ TAKE IT TO POPS ]', 'find: POPS asks for it: ' + lastCall().btn);
  check(boxOf() && boxOf().text === 'T A K E   I T   T O   P O P S', 'deliver: the board box: ' + (boxOf() || {}).text);
  { scenes.length = 0; boxOf().onTap(); check(scenes[0] === 'disc', 'deliver: the box plays the DISC scene'); }

  // deliver: the DISC scene ends -> d0g, on a QUEST card. Another scene doesn't move it.
  cards.length = 0; endScene('prodigal'); check(q.step === 'deliver', 'deliver: another scene does nothing');
  endScene('disc'); check(q.step === 'd0g' && cards[0] === 'pops', 'deliver: the DISC scene -> d0g + a QUEST card');
  check(!boxOf() && replayOf() === 'disc', 'd0g: no box; replay the DISC scene');

  // d0g: the DOGTAG at the UPLINK, cash out with it -> trace
  carry('dogtag'); calls.length = 0; questUplink();
  check(calls.length === 1 && lastCall().lines === QUEST_LINES.tagUplink, 'd0g: the UPLINK reminder with the DOGTAG');
  carry('disc'); calls.length = 0; questCashOut(run); await sleep(700);
  check(q.step === 'd0g' && !calls.length, 'd0g: cashing out with the DISC does nothing');
  carry('dogtag'); questCashOut(run); await sleep(700);
  check(q.step === 'trace' && lastCall().lines === QUEST_LINES.traced && lastCall().btn === '[ GO TO POPS ]', 'd0g: cash out with the DOGTAG -> trace: ' + q.step + ' ' + lastCall().btn);
  check(boxOf() && boxOf().text === 'G O   T O   P O P S', 'trace: the board box: ' + (boxOf() || {}).text);
  { scenes.length = 0; boxOf().onTap(); check(scenes[0] === 'prodigal', 'trace: the box plays PRODIGAL'); }

  // trace: PRODIGAL ends -> raid, b0y on the crew
  save.legacy = save.legacy || {}; delete save.legacy.crew_b0y; cards.length = 0;
  endScene('prodigal'); check(q.step === 'raid' && save.legacy.crew_b0y === 1 && cards[0] === 'pops', 'trace: PRODIGAL -> raid, b0y joins the crew');
  check(replayOf() === 'prodigal', 'raid: replay PRODIGAL');
  carry('disc'); calls.length = 0; questUplink(); check(!calls.length, 'raid: no UPLINK reminders');

  // raid: the GATE scene ends -> g0d (the H3AV3N seed)
  endScene('gate'); check(q.step === 'g0d', 'raid: HEAVEN\\'S GATE -> g0d');
  check(replayOf() === 'gate', 'g0d: replay the GATE scene');
  q.step = 'done'; check(replayOf() === 'gate', 'done: replay the GATE scene');
  q.step = 'find'; check(!boxOf() && !replayOf(), 'find: no box, no replay');

  window.queueCall = realQueue; window.playScene = realPlay; window.questCard = realCard;
  check(!(window.__errs || []).length, 'no errors: ' + (window.__errs || []).join(' | '));
` };
