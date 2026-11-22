// tools/checks/tests/devstop.js: dev.stop (THE SHELL, Greg 2026-11-21): out of dev mode, and the run counts again (back to
// what it started as); the switch cheats go off. Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'devstop', body: `
  const out = () => (SHELL.log[SHELL.log.length - 1] || {}).s || '';
  st.devAccess = false;
  B.startRun('DEVSTOP', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  if (st.evCard) closeEventCard();
  shellOpen(); await sleep(150);
  await shellRun('dev.start'); await shellRun('heal'); await shellRun('mode.god on');
  check(st.devAccess && st.run.practice && !questRun() && st.god, 'dev.start and cheats: practice, quests stand still');
  await shellRun('dev.stop');
  check(!st.devAccess && !st.run.practice && questRun() && !st.god, 'dev.stop: out of dev mode, the run counts, god off: ' + out());
  check(/counts again/.test(out()), 'it says so');
  await shellRun('heal'); check(/unknown command/.test(out()) && !st.run.practice, 'a dev command now: unknown, still real');
  shellClose();
  B.startRun('DEVSTOP2', true); await settle('start');
  shellOpen(); await shellRun('dev.start'); await shellRun('dev.stop'); shellClose();
  check(st.run.practice, 'a run that began as practice stays practice');
` };
