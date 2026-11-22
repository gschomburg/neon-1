// tools/checks/tests/devreal.js: dev.real (THE SHELL, Greg 2026-11-21): a dev run that still counts. dev.start, G0D.exe
// and cheats can't make it practice; quests move (questRun); it lasts through a save and a resume; off makes it
// practice again. Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'devreal', body: `
  const out = () => (SHELL.log[SHELL.log.length - 1] || {}).s || '';
  B.startRun('DEVREAL', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  if (st.evCard) closeEventCard();
  shellOpen(); await sleep(150);
  await shellRun('dev.start');
  check(st.run.practice && !questRun(), 'dev.start: practice, quests stand still');
  await shellRun('dev.real on');
  check(/ON/.test(out()) && !st.run.practice && questRun(), 'dev.real on: the run counts, quests move: ' + out());
  await shellRun('heal'); await shellRun('g0dexe');
  check(!st.run.practice && holds('g0dexe'), 'a cheat and G0D.exe: still real');
  const copy = JSON.parse(JSON.stringify(st.run));
  check(copy.practice === false && copy.real === true, 'saved as real');
  check(runKeepReal(copy) && (copy.practice = true, copy.practice === false), 'a resumed copy stays real');
  await shellRun('dev.real off');
  check(st.run.practice && !questRun() && !st.devReal, 'dev.real off: practice again');
  shellClose();
  B.startRun('DEVREAL2', false); await settle('start');
  check(!st.run.real, 'a new run after off: not real');
  st.devReal = true; B.startRun('DEVREAL3', false); await settle('start'); st.run.practice = true;
  check(st.run.real && !st.run.practice, 'a new run with it on: real from the start');
  st.devReal = false;
` };
