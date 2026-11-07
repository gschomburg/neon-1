// tools/checks/tests/heaven.js: H3AV3N's G0D fight and final stand start and run without errors (engine/g0dfight.js, heaven.js).
module.exports = { name: 'heaven', body: `
  G0DF.skipCine = true;
  B.startRun('HEAVTEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  heavenSetup(); toMap(); await settle('heaven map');
  const node = Object.values(st.run.map).find(o => o.heaven === 'g0d');
  check(!!node, 'heaven has a G0D node');
  const real = () => ({ real: true, node, startInt: st.run.integrity, startCr: st.run.credits });
  g0dfStart('fight', real()); await sleep(3000);
  check(st.mode === 'g0df' && st.g0df && st.g0df.stage === 'fight', 'the fight runs: ' + st.mode + ' ' + (st.g0df && st.g0df.stage));
  // tap around the board for a while: the fight's taps go through g0dfTap
  for (let i = 0; i < 40; i++) { g0dfTap(5 + (i * 7) % 30, 6 + (i * 3) % 12); await sleep(50); }
  check(!(window.__errs || []).length, 'no errors in the fight: ' + (window.__errs || []).join(' | '));
  g0dfStart('stand', real()); await sleep(3000);
  check(st.g0df && st.g0df.stage === 'stand', 'the final stand runs');
  for (let i = 0; i < 40; i++) { g0dfTap(5 + (i * 5) % 30, 6 + (i * 2) % 12); await sleep(50); }
  check(!(window.__errs || []).length, 'no errors in the stand: ' + (window.__errs || []).join(' | '));
` };
