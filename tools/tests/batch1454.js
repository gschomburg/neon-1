// tools/tests/batch1454.js: the editor's game posts to the test boards (v14.54, Greg 2026-11-07: "tag the editor runs
// with dev"), practice runs too, so its end screen (ranks, initials, UPLOAD) works there. Run by tools/test.js, as
// the editor's page (?editor=1).
module.exports = { name: 'batch1454', query: 'editor=1&nointro=1', body: `
  await settle();
  window.LB_TEST = true;
  check(EDITOR, 'the page is the editor game');
  const gl = lbClient(); check(gl && gl.dev === true, 'its leaderboard client is always dev (the test boards)');
  let sent = null; const was = gl.submitScore; gl.submitScore = (board, s) => { sent = sent || { board, s }; return Promise.resolve(null); };
  B.startRun('ED1454', true); await settle('start');
  st.run.depth = 3;
  lbSubmit(st.run, false);
  check(st.lbPost && sent, 'a practice run in the editor still posts');
  check(sent && sent.s.data.editor === true && sent.s.data.practice === true, 'tagged editor + practice');
  gl.submitScore = was;
` };
