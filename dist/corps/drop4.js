// NeoN+1 corps/drop4.js
'use strict';
NEON_FILES.push(['corps/drop4.js', 'v12.00']);
CORPS.drop4 = {
  key: 'drop4', name: 'DROP-4', letter: '4', level: 3,
  intel: '"four in a row. or bust."',
  tell: null, nodes: 2,   // a line of four needs 4+ chips
  bossDesc: 'boss: a bigger board.',
  mods: ['fourinarow'],
  // Chips drop in from the top, in two colors (X and O). Exactly one line of four has three of
  // one color and one of the other: that blocker is the real node.
  dress(lv, k) {
    const r = k.r, n = lv.tiles.length;
    for (const t of lv.tiles) if (t.loaded) { t.loaded = false; }   // no $ chips
    let layout = null;
    for (let tries = 0; tries < 600 && !layout; tries++) layout = dropLayout(lv.cols, lv.rows, n, r);
    if (!layout) return;   // (never seen; the layer plays as plain glyphs)
    const q = k.tellTile, rest = shuffle(lv.tiles.filter(t => t !== q), r);
    const cells = layout.cells.filter(c => c !== layout.blocker);
    const place = (t, cell) => { t.cell = cell; t.col = cell % lv.cols; t.row = Math.floor(cell / lv.cols); t.chip = layout.color[cell]; };
    place(q, layout.blocker);
    rest.forEach((t, i) => place(t, cells[i]));
    lv.tiles.forEach(t => { t.glyph = normMotif(['.---.', `| ${t.chip ? 'X' : 'O'} |`, "'---'"]); t.dropAt = t.col * 60 + (lv.rows - 1 - t.row) * 90; });
    lv.drop = true;
    q.tell = true;
  },
  fx(t, ft, lv) {
    if (!lv.drop || t.chip == null) return null;
    const col = t.chip ? C.money : C.accent;
    if (lv.shownAt == null) return { gc: col, dy: -(t.row + 1) * (TILE_H + GAP_Y), clip: true };
    const e = ft - lv.shownAt - t.dropAt, f = clamp(e / 380, 0, 1);
    return { gc: col, dy: f >= 1 ? 0 : -(t.row + 1) * (TILE_H + GAP_Y) * (1 - f * f), clip: true };
  },
  hint: lv => lv.drop ? { text: 'drop-4> find the blocker', col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.drop4 = "chips in two colors, stacked. exactly one line of four (across, down or diagonal) has three of one color and one of the other: that blocker is the real node.";

// intro art
CORP_ART.drop4 = [
  "  |o|x| | |",
  "  |x|o|x| |",
  "  |o|x|o|x|",
  "  '-------'",
  "   D R O P - 4",
];
