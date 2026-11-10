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

  // G0D's eyes on the title (engine/fx.js eyes): they come up, only on blank cells (a clear ring around them)
  {
    const E = FX.look('eyes'), titleAny = TITLE_EYES.anywhere;
    TITLE_EYES.anywhere = 0;   // (the rule first: the title's own setting lets half of them land anywhere)
    let seen = 0, onTop = 0, shown = null;
    for (let t = 20000; t < 80000; t += 450) {
      const all = buildScene(t, false, true), eyes = all.filter(c => c.own === 'fx'), rest = all.filter(c => c.own !== 'fx');
      const used = new Set(rest.map(c => Math.round(c.cx) + ',' + Math.round(c.cy)));
      onTop += eyes.filter(c => [-1, 0, 1].some(dy => [-1, 0, 1].some(dx => used.has((c.cx + dx) + ',' + (c.cy + dy))))).length;
      if (eyes.length) { seen++; if (!shown && eyes.some(c => c.bold)) shown = t; }
    }
    check(seen > 20, 'eyes come and go on the title: in ' + seen + ' of 134 frames');
    check(onTop === 0, 'an eye never touches the title\\'s own marks: ' + onTop);
    if (shown) say('TITLE WITH EYES\\n' + text(shown).join('\\n'));
    // anywhere = 1: no clear-space rule, they land on the UI too and clear what's under them
    TITLE_EYES.anywhere = 1;
    const share = FX_LOOKS.eyes.share;
    let over = 0, shownOver = null;
    for (let t = 20000; t < 50000; t += 450) {
      const plain = (() => { FX_LOOKS.eyes.share = 0; const c = buildScene(t, false, true); FX_LOOKS.eyes.share = share; return new Set(c.map(c => Math.round(c.cx) + ',' + Math.round(c.cy))); })();
      const n = buildScene(t, false, true).filter(c => c.own === 'fx' && plain.has(c.cx + ',' + c.cy)).length;
      if (n) { over++; if (!shownOver) shownOver = t; }
    }
    check(over > 10, 'with anywhere on, eyes land on the title\\'s marks: in ' + over + ' frames');
    if (shownOver) say('TITLE WITH EYES ANYWHERE\\n' + text(shownOver).join('\\n'));
    TITLE_EYES.anywhere = titleAny;
  }

  // the eyes transition (data/fx.js eyewipe): red eyes and g / 0 / d letters in the wipe; the eyes go a little after
  {
    st.eyesDev = 1;
    await wipeOut(0);
    const mid = buildScene(performance.now() + 150);
    const red = FX.col(FX_LOOKS.eyes.col), word = FX_LOOKS.eyewipe.word;
    check(mid.some(c => c.col === red && word.includes(c.ch)), 'his letters in the wipe');
    wipeIn();
    check(st.eyeWipe && st.eyeWipe.spots.length >= 3, 'the wipe has eyes: ' + (st.eyeWipe && st.eyeWipe.spots.length));
    let most = 0, at = 0;
    for (let i = 0; i < 40 && st.eyeWipe; i++) { await sleep(100); const n = buildScene(performance.now()).filter(c => c.own === 'wipe' && c.bold && c.col === red && 'o@O'.includes(c.ch)).length; if (n > most) { most = n; at = i; } }
    check(most > 0, 'eyes open in the wipe: ' + most + ' pupils at once');
    for (let i = 0; i < 60 && (st.wipe || st.eyeWipe); i++) await sleep(100);
    check(!st.eyeWipe, 'the eyes go after the wipe');
    st.eyesDev = 0;
    await wipeOut(0); wipeIn();
    check(!st.eyeWipe, 'no eyes at level 0');
    st.eyesDev = null;
    // on their own: about eyewipe.chance of the wipes (the roll), never in the intro
    { let n = 0; for (let i = 0; i < 400; i++) if (rollWipeEyes(1000 + i * 37) > 0) n++;
      const want = FX_LOOKS.eyewipe.chance * 400;
      check(Math.abs(n - want) < want * 0.5 + 8, 'about ' + Math.round(FX_LOOKS.eyewipe.chance * 100) + '% of wipes get G0D: ' + n + ' of 400');
      startIntro(); let b = 0; for (let i = 0; i < 100; i++) if (rollWipeEyes(5000 + i * 41) > 0) b++; endIntro();
      check(b === 0, 'never in the intro: ' + b); }
  }
` };
