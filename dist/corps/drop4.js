// NeoN+1 corps/drop4.js
'use strict';
NEON_FILES.push(['corps/drop4.js', 'v13.17']);
// Its boss mod: FOUR IN A ROW (fourinarow), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// DROP-4: a stacked board (chips fall to the bottom) where exactly one chip blocks a line of
// four: three of one color plus it. Returns { cells, color, blocker } or null.
function dropLayout(cols, rows, n, r) {
  const h = Array(cols).fill(0);
  for (let i = 0; i < n; i++) { const open = h.map((v, c) => c).filter(c => h[c] < rows); if (!open.length) return null; h[pickR(open, r)]++; }
  const cells = [], color = {};
  for (let c = 0; c < cols; c++) for (let k = 0; k < h[c]; k++) { const cell = (rows - 1 - k) * cols + c; cells.push(cell); color[cell] = r() < 0.5; }
  const at = (c, rw) => c >= 0 && c < cols && rw >= 0 && rw < rows && color[rw * cols + c] != null ? rw * cols + c : null;
  const blockers = new Set();
  for (let c = 0; c < cols; c++) for (let rw = 0; rw < rows; rw++) for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    const line = [0, 1, 2, 3].map(j => at(c + dc * j, rw + dr * j));
    if (line.some(x => x == null)) continue;
    const xs = line.filter(x => color[x]);
    if (xs.length === 3) blockers.add(line.find(x => !color[x]));
    if (xs.length === 1) blockers.add(xs[0]);
  }
  return blockers.size === 1 ? { cells, color, blocker: [...blockers][0] } : null;
}

// ---- its music
// Made from TRACKER: the same band, its own tune.
SONGS.lineclear = { name: 'LINE CLEAR', from: 'tracker', bpm: 140, root: 45, scale: 'harmonic', prog: [0, 4, 5, 4], kit: 'chip', drums: 'break', pump: 0.4, padVoice: 'none',
  bassVoice: 'sub', bassLine: '0 . . 0 . . 0 . . . 0 . 4 . . .', stab: 'x..x....x..x....', stabVoice: 'vox',
  melody: ['4 . 2 . 0 . 2 3 4 . 7 . 4 . 2 .', '3 . 1 . -1 . 1 2 3 . 6 . 3 . 1 .', '2 . 4 . 6 . 4 2 0 . 2 . 4 . 6 .', '7 . 6 . 4 . 3 . 4 . . . . . . .'],
  leadVoice: 'chip', arpVoice: 'chip', arp: 'updown' };
MUSIC_FOR.drop4 = 'lineclear';

// ---- the corp
CORPS.drop4 = {
  key: 'drop4', name: 'DROP-4', code: 'DR', level: 3,
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
