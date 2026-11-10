// tools/checks/tests/titleart.js: the title's art (FACE v2 and the NeoN+1 name, data/title.js) and the intro card's
// wires (engine/intro.js): pulses have routes, the screen fits, the animations swap the right bits, the wires draw in.
// It says the screens it draws (node tools/test.js --log titleart), handy when the art changes.
module.exports = { name: 'titleart', body: `
  const text = now => {
    const g = [...Array(L.hc)].map(() => Array(L.wc).fill(' '));
    buildScene(now, false, true).forEach(c => { const y = Math.round(c.cy), x = Math.round(c.cx); if (g[y] && x >= 0 && x < L.wc) g[y][x] = c.ch; });
    return g.map(r => r.join('').replace(/\\u00a0/g, ' ').replace(/ +$/, ''));   // (asXii's opaque blanks: plain spaces here)
  };
  check(st.mode === 'title', 'on the title: ' + st.mode);
  check(TITLE.W === 36 && TITLE.H === 21, 'the art is 36 x 21: ' + TITLE.W + ' x ' + TITLE.H);
  check(TITLE.paths.length >= 10, 'pulses have routes along the traces: ' + TITLE.paths.length);
  const starts = new Set(TITLE.paths.map(p => p[0]));
  check(starts.size >= 6, 'pulses start from the pads on the head: ' + starts.size);
  // the screen fits, with a saved run's NEW RUN line and an update line too
  st.newVersion = 'v99.99';
  const rows = titleLines(1000).reduce((s, ln) => s + lineRows(ln), 0);
  check(rows <= L.hc - 1, 'the title fits above the version line: ' + rows + ' of ' + L.hc);
  st.newVersion = null;
  // the animations: the blink and the meter (times picked to land on them)
  const at = (sec, row) => titleArtLines(sec * 1000)[row].text;
  check(at(4.3 * 3 + 0.05, 6).includes('{-}') && at(1, 6).includes('{o}'), 'the eye blinks: ' + at(4.3 * 3 + 0.05, 6));
  check(/\\[[=-]{4}\\]/.test(at(0.2, 10)) && at(0.2, 10).includes('[==--]'), 'the meter bounces: ' + at(0.2, 10));
  check(at(1, 5).includes('[@@]') || at(1, 5).includes('[@ ]') || at(1, 5).includes('[ @]'), 'the circuit eye scans');
  const title = text(2000);
  check(title.some(r => r.includes('{]\\\\\\\\  [}')), 'the NeoN+1 name is up');
  say('TITLE\\n' + title.join('\\n'));

  // the intro card: the wires draw in out of the logo, then pulses run along them
  startIntro(); st.boot.stage = 'card';
  const wg = introWireGrid();
  check(wg.paths.length >= 20, 'the wires have routes: ' + wg.paths.length);
  const t0 = performance.now();
  st.boot.t0 = t0; const early = text(t0 + 10);
  st.boot.t0 = t0 - 3000; const late = text(t0);
  const wires = s => s.join('').split('').filter(c => '│─╭╮╯╰┼┴┬├┤'.includes(c)).length;
  check(wires(early) < wires(late) / 3, 'the wires draw in: ' + wires(early) + ' then ' + wires(late));
  check(late.some(r => r.includes('NeoN+1')), 'NeoN+1 has typed in');
  say('CARD\\n' + late.join('\\n'));
  endIntro();
` };
