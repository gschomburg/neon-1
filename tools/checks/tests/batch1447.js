// tools/checks/tests/batch1447.js: the v14.47 batch (SYSTEM FAILURE's playtest decisions, 2026-11-06) stays put. Run by
// tools/test.js (a headless page).
module.exports = { name: 'batch1447', body: `
  B.startRun('B1447TEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  const info = QUEST_INFO.pops, q = questOf('pops'), run = st.run;

  // the scene titles' step numbers match the steps (step 3: SAFEHOUSE ...)
  for (const [id, frames] of Object.entries(QUEST_SCENES)) for (const fr of frames) {
    const m = fr.title && /^step (\\d+): (.+)$/.exec(fr.title[1] || '');
    if (m) check(info.steps[+m[1] - 1] && info.steps[+m[1] - 1].name === m[2], id + ': "' + fr.title[1] + '" is that step');
  }
  check(info.name === 'SYSTEM FAILURE' && info.steps[0].key === 'sector', 'the quest: ' + info.name + ', from ' + info.steps[0].key);

  // THE DISC: holding it, the step reads GET OUT WITH THE DISC; MEDIX is marked on the map while you look
  save.stats = save.stats || {}; save.stats.sectors = 1; save.legacy = save.legacy || {}; save.legacy.crew_pops = 1;
  Object.assign(q, { step: 'find', seen: true, lost: false });
  check(questView('pops').name === 'THE DISC', 'looking: ' + questView('pops').name);
  check(questHintNode({ type: 'corp', corp: 'medix' }) && !questHintNode({ type: 'corp', corp: 'omni' }), 'looking: MEDIX gets the hint');
  run.loot = (run.loot || []).concat([{ key: 'disc', tier: 0, n: 1 }]);
  check(questView('pops').name === 'GET OUT WITH THE DISC', 'holding: ' + questView('pops').name);
  check(!questHintNode({ type: 'corp', corp: 'medix' }), 'holding: no hint');
  run.loot = run.loot.filter(s => s.key !== 'disc');

  // the DISC for sale: POPS calls, once a market
  const calls = []; const realQ = window.queueCall; window.queueCall = (who, lines) => calls.push(lines);
  questShop({ id: 777 }, [{ key: 'disc', sold: false }]); questShop({ id: 777 }, [{ key: 'disc', sold: false }]); await sleep(1000);
  check(calls.length === 1 && calls[0] === QUEST_LINES.shop, 'the market DISC: one call: ' + calls.length);
  window.queueCall = realQ;

  // the beat after a scene: it goes dark, the QUEST card comes up over it, then back
  q.step = 'deliver'; CALL_QUEUE.length = 0; st.callBox = null;
  playScene('disc'); sceneEnd();
  check(st.qScene && st.qScene.out && q.step === 'd0g', 'the scene ends: going dark, the step moved: ' + q.step);
  await sleep(SCENE_OUT.dark + 400);
  for (let i = 0; i < 30 && !st.callBox; i++) await sleep(100);
  check(st.callBox && st.callBox.quest && st.qScene, 'the QUEST card is up over the dark');
  await sleep(SCENE_OUT.music); check(sceneOutMusic(performance.now()) && sceneOutMusic(performance.now()).song === 'none', 'the music is let go while dark');
  callClose(); for (let i = 0; i < 30 && st.qScene; i++) await sleep(100);
  check(!st.qScene, 'the card closed: back to the screen');

  // PRODIGAL's upload: a tap starts it, taps while it fills do nothing, then on
  const k = QUEST_SCENES.prodigal.findIndex(f => f.upload);
  check(k > 0, 'PRODIGAL has an upload frame');
  playScene('prodigal'); const sc = st.qScene; sc.i = k; sc.t0 = performance.now() - 60000;
  sceneNext(); check(sc.i === k && uploadU(sc, performance.now()) >= 0, 'the first tap starts the upload');
  sceneNext(); check(sc.i === k, 'a tap while it fills does nothing');
  sc.up -= UPLOAD.ms + 10; sceneNext(); check(sc.i === k + 1, 'once in, a tap goes on');
  check(uploadFill(0.36) < uploadFill(0.28) && uploadFill(1) === 1, 'the mold pushes it back');
  st.qScene = null;

  // d0g: three heads, one taps; his lines are his own now (no doge)
  const hs = { aim: { t: {}, at: performance.now() + 200 } };
  for (let i = 0; i < 20; i++) hkHeads(hs, performance.now());
  check(hs.spread > 0.9, 'about to tap: the heads burst apart: ' + hs.spread.toFixed(2));
  hs.aim = null; hs.headsTill = 0; for (let i = 0; i < 80; i++) hkHeads(hs, performance.now());
  check(hs.spread < 0.05, 'then back together: ' + hs.spread.toFixed(2));
  check(HACKERS.d0g.heads === 3 && HACKERS.w00f.heads === 3, 'w00f has the heads too');
  const lines = [].concat(HACKERS.d0g.enter, HACKERS.d0g.taunt, HACKERS.d0g.out, HACKERS.d0g.kill).join(' ');
  check(!/\\b(wow|such|much|very)\\b/.test(lines), 'd0g: no doge lines: ' + lines);
` };
