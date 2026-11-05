// tools/tests/cutscenes.js: G0D's cutscenes play with their cinematics on (engine/heaven.js, Seq in engine/fx.js):
// the wake-up, G0D dying, the fake win into the stand, and the collapse. Their timed beats fire, and taps skip them.
// (tests/heaven.js runs with G0DF.skipCine, so this is the one that plays them.) About 30 seconds.
module.exports = { name: 'cutscenes', body: `
  G0DF.skipCine = false; G0DF.tapSkip = true;
  const errs = () => (window.__errs || []).join(' | ');
  const said = (s, keys) => keys.filter(k => !s.said[k]);

  // Seq on its own
  check(Seq.skipTip(1000, 700).length === 11 && Seq.skipTip(500, 700).length === 0, 'Seq.skipTip: the hint only after the beat');
  G0DF.tapSkip = false; check(!Seq.canSkip(5000, 700) && Seq.skipTip(5000, 700).length === 0, 'Seq: no skipping when tapSkip is off'); G0DF.tapSkip = true;
  { const s = { said: {} }; let n = 0; Seq.cue(s, 100)('x', 200, () => n++); Seq.cue(s, 300)('x', 200, () => n++); Seq.cue(s, 400)('x', 200, () => n++);
    check(n === 1 && s.said.x, 'Seq.cue: fires once, the first time it is due'); }

  B.startRun('CUTTEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  heavenSetup(); toMap(); await settle('heaven map');
  const node = Object.values(st.run.map).find(o => o.heaven === 'g0d');
  const real = () => ({ real: true, node, startInt: st.run.integrity, startCr: st.run.credits });

  // 1. The wake-up: its beats fire, then a tap skips the rest
  await enterNode(node, true); await sleep(5200);
  const w = st.g0df && st.g0df.wake;
  check(!!w, 'the wake-up runs: ' + st.mode);
  if (w) {
    check(!said(w, ['a', 'break', 'L0', 'L1', 'L2', 'fill', 'b']).length, 'wake-up beats by 5s fired; missing: ' + said(w, ['a', 'break', 'L0', 'L1', 'L2', 'fill', 'b']));
    check(!w.said.m, 'wake-up: the mold beat (7s) has not fired yet');
    g0dWakeSkip(); await sleep(100);
    check(st.g0df && !st.g0df.wake && st.g0df.stage === 'fight', 'a tap skips the wake-up into the fight');
  }

  // 2. G0D dies: its beats, then the fake win
  heavenDie(st.g0df); await sleep(5200);
  const d = st.g0dDie;
  check(!!d && st.mode === 'g0ddie', 'G0D dying runs: ' + st.mode);
  if (d) check(!said(d, ['a', 'b', 'n', 'burst', 'small']).length, 'dying beats by 5s fired; missing: ' + said(d, ['a', 'b', 'n', 'burst', 'small']));
  g0dDieSkip(); await sleep(300);
  check(!st.g0dDie && !!st.g0dFake, 'a tap skips the dying into the fake win');

  // 3. The fake win: a tap skips into the stand, out of the mold's hole (its own beats)
  await sleep(800); g0dFakeSkip(); await sleep(1600);
  check(!st.g0dFake && st.g0df && st.g0df.stage === 'stand', 'a tap skips the fake win into the stand: ' + st.mode);

  // 4. The collapse: its beats, then a tap goes straight to G0D DEFEATED
  heavenCollapse({ node }); await sleep(1900);
  const e = st.g0dEnd;
  check(!!e && st.mode === 'g0dend', 'the collapse runs: ' + st.mode);
  if (e) {
    check(!said(e, ['a', 'b', 'k0', 'k1']).length && !e.said.k2, 'collapse beats by 1.9s fired, the last crumble not yet; missing: ' + said(e, ['a', 'b', 'k0', 'k1']));
    g0dEndTap();
    check(!said(e, ['a', 'b', 'k0', 'k1', 'k2', 'burst', 'small', 'off']).length && performance.now() - e.t0 >= G0D_END.title, 'a tap jumps to G0D DEFEATED');
  }
  await sleep(500);
  check(!(window.__errs || []).length, 'no errors in the cutscenes: ' + errs());
` };
