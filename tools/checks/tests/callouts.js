// tools/checks/tests/callouts.js: CALLOUTS (engine/callouts.js, v15.61): a callout's face can be a face's key, a glyph
// (any { art }) or rows of art, and it can bring its own colors and name. A hint drawn with a glyph for a face and its own
// colors, put away with a tap. Run by tools/test.js (tools/checks/harness.js); #shots says a screenshot.
module.exports = { name: 'callouts', body: `
  const shot = n => { if (location.hash === '#shots') say('SHOT ' + n + ' ' + document.querySelector('canvas').toDataURL('image/png')); };
  await settle();
  check(calloutArt('pops') === ART_FACES.pops.art, 'a face by its key');
  const rows = ['/-\\\\', '|o|', '\\\\-/'];
  check(calloutArt(rows) === rows, 'rows of art');
  const gl = ART_GLYPHS.find(x => x.art && x.art.length);
  check(gl && calloutArt(gl) === gl.art, 'a glyph (its art)');
  check(calloutArt('nobody') === CALLOUT.face, 'unknown: the stand-in');

  B.startRun('CALLOUT', false); await settle('start');
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  showHint({ col: { tag: '#7fe3ff', ink: '#062030', hint: '#0e3a4a', shadow: 'rgba(0,0,0,0.5)' }, face: gl, name: 'A GLYPH', text: 'any face: a glyph works too.', at: 'top' });
  await sleep(900);
  check(st.hint && st.hint.pop && st.hint.pop.lay, 'the hint is laid out and drawn');
  shot('glyph');
  hintTap(null); await sleep(600);
  check(!st.hint || !st.hint.pop, 'a tap puts it away');
` };
