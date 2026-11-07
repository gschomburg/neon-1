// tools/checks/tests/overlays.js: the boxes over the game (OVERLAYS, engine/scene.js) take input in the same order they draw.
module.exports = { name: 'overlays', body: `
  B.startRun('OVERTEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  check(overlayTop() === null, 'nothing up at the start');
  queueCall('pops', ['one', 'two']); for (let i = 0; i < 60 && !st.callBox; i++) await sleep(100);
  const up = overlayTop();
  check(up && up.id === 'call', 'a CALL comes up and takes input: ' + (up && up.id));
  st.ad = { fake: true };
  check(overlayTop() && overlayTop().id === 'ad', 'an ad hides the CALL and takes input');
  st.dev = true; check(overlayTop() === null, 'nothing takes input under the dev menu'); st.dev = false;
  st.ad = null;
  playScene('disc'); await sleep(300);
  check(overlayTop() && overlayTop().id === 'scene', 'a scene is on top of a CALL: ' + (overlayTop() && overlayTop().id));
` };
