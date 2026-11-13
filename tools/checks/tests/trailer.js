// tools/checks/tests/trailer.js: dying to G0D is a run's death now (engine/g0dfight.js g0dfFlatline: the glitch out,
// CONNECTION TERMINATED, then GO AGAIN), and TRAILER MODE (engine/dev.js): K flatlines you in the fight, and the death
// holds on CONNECTION TERMINATED, goes black, and waits for a click (engine/screens.js trailerHold).
module.exports = { name: 'trailer', body: `
  G0DF.skipCine = true;
  save.trailerMode = false;
  B.startRun('TRAILTST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  heavenSetup(); toMap(); await settle('heaven map');
  const node = Object.values(st.run.map).find(o => o.heaven === 'g0d');
  const real = () => ({ real: true, node, startInt: st.run.integrity, startCr: st.run.credits });
  const waitFor = async (fn, ms) => { for (let t = 0; t < ms && !fn(); t += 50) await sleep(50); return fn(); };
  // dying in the fight: the death sequence, then GO AGAIN
  g0dfStart('fight', real()); await sleep(2500);
  g0dfHurt(st.g0df, st.run.integrity, 'test.', 'clock');
  check(st.flatline && !st.flatline.rv && st.g0df.card, 'it falls out first (no card straight away)');
  check(await waitFor(() => st.flatline && st.flatline.rv, 8000), 'then the reveal starts');
  const fl = st.flatline;
  check(fl.lines[0].text === 'CONNECTION TERMINATED' && fl.lines.some(l => l.text === 'FLATLINED') && fl.lines.some(l => l.id === 'g0dagain'), 'CONNECTION TERMINATED, FLATLINED, GO AGAIN');
  check(gameMusicState().song === 'none', 'the music is quiet under it');
  check(await waitFor(() => fl.rv.total && fl.rv.vis >= fl.rv.total, 8000), 'all of it comes in');
  fl.lines.find(l => l.id === 'g0dagain').onTap();
  check(!st.flatline && st.g0df && st.g0df.stage === 'fight' && !st.g0df.card, 'GO AGAIN: the fight starts over');
  // TRAILER MODE: K kills you, the death holds, goes black, a click carries on
  save.trailerMode = true;
  await sleep(1500);
  for (let i = 0; i < 30 && overlayTop(); i++) { st.evCard && (st.evCard.t0 = 0); overlayTop().key('enter'); await sleep(150); }   // (a sector event card takes keys)
  check(!overlayTop(), 'no overlay over the fight (' + (overlayTop() && overlayTop().id) + ')');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
  check(st.flatline && st.run.practice, 'K flatlines you (and marks the run practice)');
  check(await waitFor(() => st.flatline && st.flatline.rv, 8000) && st.flatline.rv.trailer, 'the reveal is a trailer hold');
  const rv = st.flatline.rv;
  check(await waitFor(() => (rv.gone || 0) >= 21, 8000), 'it types in, holds, types back out');
  check(st.trailerHold && !rv.vis, 'black: nothing more comes in while it waits');
  await sleep(500);
  check(st.flatline && !rv.trailerGo, 'it waits for a click');
  const go = hits.find(h => h.id === 'trailergo');
  check(!!go, 'the whole screen is the click');
  go.onTap();
  check(!st.trailerHold && rv.trailerGo, 'the click carries on');
  check(await waitFor(() => rv.total && rv.vis >= rv.total, 8000), 'the normal reveal plays after it');
  save.trailerMode = false; save.trailerNoFooter = false;
  // the dev menu's [G0D] (shellHeaven 'door'): a fresh run on heaven's map, past the maze, G0D next but not breached
  await shellHeaven('door', endRun); await settle('door');
  const g = Object.values(st.run.map).find(o => o.heaven === 'g0d');
  check(st.mode === 'map' && st.run.map[st.run.at].heaven === 'maze' && availableNodes().includes(g.id), 'the door: on the map, G0D is next');
  check(!st.g0df, 'the door: G0D not started');
  check(!(window.__errs || []).length, 'no errors: ' + (window.__errs || []).join(' | '));
` };
