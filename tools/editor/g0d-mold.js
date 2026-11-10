// ---------------- G0D tab: the mold and eyes sliders (engine/editor.js moldlvl / moldwipe / eyeslvl / eyewipe; read by engine/effects.js) ----------------
(() => {
  const { $, toGame } = NEON_ED;
  const lvl = () => Math.min(1, Math.max(0, +$('#gMold').value || 0));
  const send = () => toGame({ type: 'test', act: 'moldlvl', m: lvl() });
  ScrubField.bind($('#gMoldF'));
  $('#gMold').addEventListener('scrub', send);
  $('#gMold').addEventListener('input', send);
  $('#gMoldWipe').onclick = () => toGame({ type: 'test', act: 'moldwipe', m: lvl() });
  $('#gMoldGlitch').onclick = () => { send(); toGame({ type: 'test', act: 'g0d', key: 'glitch' }); };
  $('#gMoldOff').onclick = () => toGame({ type: 'test', act: 'moldlvl', m: null });
  // G0D's eyes in the transitions (engine/editor.js eyeslvl / eyewipe; read by engine/effects.js wipeEyes)
  const eyes = () => Math.min(1, Math.max(0, +$('#gEyes').value || 0));
  const sendEyes = () => toGame({ type: 'test', act: 'eyeslvl', m: eyes() });
  ScrubField.bind($('#gEyesF'));
  $('#gEyes').addEventListener('scrub', sendEyes);
  $('#gEyes').addEventListener('input', sendEyes);
  $('#gEyesWipe').onclick = () => toGame({ type: 'test', act: 'eyewipe', m: eyes() });   // (with whatever the mold slider is at: off unless you turned it on)
  $('#gEyesBoth').onclick = () => { send(); toGame({ type: 'test', act: 'eyewipe', m: eyes() }); };
  $('#gEyesTitle').onclick = () => toGame({ type: 'test', act: 'fxtitle' });
  $('#gEyesOff').onclick = () => toGame({ type: 'test', act: 'eyeslvl', m: null });
})();
