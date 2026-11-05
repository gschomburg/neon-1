// ---------------- G0D tab: the mold slider (engine/editor.js moldlvl / moldwipe; read by engine/effects.js wipeMold) ----------------
(() => {
  const $ = q => document.querySelector(q);
  const toGame = m => { try { $('#game').contentWindow.postMessage(Object.assign({ to: 'neon-game' }, m), '*'); } catch (e) { /* not loaded */ } };
  const lvl = () => Math.min(1, Math.max(0, +$('#gMold').value || 0));
  const send = () => toGame({ type: 'test', act: 'moldlvl', m: lvl() });
  ScrubField.bind($('#gMoldF'));
  $('#gMold').addEventListener('scrub', send);
  $('#gMold').addEventListener('input', send);
  $('#gMoldWipe').onclick = () => toGame({ type: 'test', act: 'moldwipe', m: lvl() });
  $('#gMoldGlitch').onclick = () => { send(); toGame({ type: 'test', act: 'g0d', key: 'glitch' }); };
  $('#gMoldOff').onclick = () => toGame({ type: 'test', act: 'moldlvl', m: null });
})();
