// NeoN+1 corps/fourthwall.js
'use strict';
NEON_FILES.push(['corps/fourthwall.js', 'v12.00']);
CORPS.fourthwall = {
  key: 'fourthwall', name: 'FOURTH WALL', letter: ']', level: 5,
  intel: '"hi. yes, you. holding the phone."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: runner.exe has stopped.',
  rules: () => 'it knows how you play.',
  mods: ['spoiler'],
  // It talks to you, not your runner, and it reads your save: your deaths, your mods, the
  // time. It knows where you like to pick (every pick you've ever made) and it hides the
  // real node somewhere else, and it says so. Deeper: your favorite column too. Boss: a
  // fake crash. The real node is the [x] that closes it.
  dress(lv, k) {
    const r = k.r;
    if (k.boss) {
      const btn = shuffle(FW_BUTTONS.slice(), r);
      k.tiles.forEach((t, i) => { t.glyph = normMotif(['', t === k.real ? ' [x] ' : btn[i % btn.length], '']); });
      lv.crash = true;
      return;
    }
    const hb = save.habits || { total: 0, corner: 0, edge: 0, middle: 0 };
    const zones = ['corner', 'edge', 'middle'].filter(z => k.tiles.some(t => cellZone(t, lv) === z));
    const top = hb.total >= 5 ? zones.slice().sort((a, b) => (hb[b] || 0) - (hb[a] || 0))[0] : pickR(zones, r);
    let colTop = null;
    if (k.tier >= 2) {
      colTop = randInt(r, 0, lv.cols - 1);
      if (hb.total >= 5) for (let c = 0; c < lv.cols; c++) if ((hb['c' + c] || 0) > (hb['c' + colTop] || 0)) colTop = c;
    }
    const ok = t => cellZone(t, lv) !== top && (colTop == null || t.col !== colTop);
    const q = k.real;
    if (!ok(q)) {
      const opts = k.tiles.filter(t => t !== q && ok(t));
      if (opts.length) { const sw = pickR(opts, r); for (const f of ['cell', 'col', 'row']) { const v = q[f]; q[f] = sw[f]; sw[f] = v; } }
      else {   // nobody to swap with: move the real node to an empty cell somewhere else
        const used = new Set(lv.tiles.map(t => t.cell)), free = [];
        for (let c = 0; c < lv.cols * lv.rows; c++) if (!used.has(c) && ok({ col: c % lv.cols, row: Math.floor(c / lv.cols) })) free.push(c);
        if (free.length) setCellOf(lv, q, pickR(free, r)); else colTop = null;
      }
    }
    lv.fw = fwLines(top, colTop);
  },
  fx(t, ft, lv) { return lv.crash ? { frame: ['+=====+', '+-----+'], side: '|' } : null; },
  async intro(lv) {
    if (!lv.crash) return;
    Sound.trap(); flash(C.bright, 0.3, 0.5); shake(6);
    setMsg('> runner.exe has stopped responding.', C.danger);
    await wait(400);
  },
  hint(lv, now) {
    if (lv.crash) return { text: Math.floor(now / 600) % 2 ? 'FATAL: runner.exe stopped' : 'FATAL: close this window', col: C.danger };
    if (!lv.fw) return null;
    const k = Math.floor(now / 3200);
    return { text: k % 2 === 0 ? lv.fw.tell : lv.fw.chat[(k >> 1) % lv.fw.chat.length], col: k % 2 === 0 ? C.bright : C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.fourthwall = "it knows where you like to pick (every pick you've made) and hides the real node somewhere else, and it tells you so. boss: the real node is the [x].";

// intro art
CORP_ART.fourthwall = [
  " .----------------.",
  " | ERROR      [x] |",
  " | you are here.  |",
  " |  [ OK ]        |",
  " '----------------'",
  "",
  " F O U R T H  W A L L",
];
