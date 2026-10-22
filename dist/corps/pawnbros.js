// NeoN+1 corps/pawnbros.js
'use strict';
NEON_FILES.push(['corps/pawnbros.js', 'v12.18']);
// Its boss mod: CHANCE CARD (chancecard), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// PAWN BROS: the outer ring of the grid, clockwise from the top left (GO).
function boardLoop(cols, rows) {
  const out = [];
  for (let c = 0; c < cols; c++) out.push(c);
  for (let r = 1; r < rows; r++) out.push(r * cols + cols - 1);
  for (let c = cols - 2; c >= 0; c--) out.push((rows - 1) * cols + c);
  for (let r = rows - 2; r >= 1; r--) out.push(r * cols);
  return out;
}

// ---- its music
SONGS.freeparking = { name: 'FREE PARKING',   bpm: 112, root: 47, scale: 'major',    prog: [0, 5, 3, 4], bass: 'march',   drums: 'march', arp: 'up' };
MUSIC_FOR.pawnbros = 'freeparking';

// ---- the corp
CORPS.pawnbros = {
  key: 'pawnbros', name: 'PAWN BROS', code: 'PB', level: 3,
  intel: '"do not pass GO. well, ok, pass it."',
  tell: null,
  bossDesc: 'boss: chance cards.',
  mods: ['chancecard'],
  // The board's outer ring is a loop that starts at GO (top left). Each layer rolls a die:
  // the real node is that many squares from GO, clockwise. Deeper: two dice. Boss: plus a
  // Chance card (go back 3, or advance 2).
  dress(lv, k) {
    const r = k.r, loop = boardLoop(lv.cols, lv.rows);
    const dice = k.tier >= 2 || k.boss ? [randInt(r, 1, 6), randInt(r, 1, 6)] : [randInt(r, 1, 6)];
    let steps = dice.reduce((a, b) => a + b, 0), card = null;
    if (k.boss) { card = steps > 4 && r() < 0.5 ? -3 : 2; steps += card; }
    const target = loop[((steps % loop.length) + loop.length) % loop.length];
    const moveTile = (t, cell) => { t.cell = cell; t.col = cell % lv.cols; t.row = Math.floor(cell / lv.cols); };
    const q = k.tellTile, at = lv.tiles.find(t => t.cell === target);
    if (at && at !== q) moveTile(at, q.cell);
    moveTile(q, target);
    const go = lv.tiles.find(t => t.cell === loop[0]);
    if (go && go !== q) {   // keep GO empty when there's room (the real node may land on it)
      const used = new Set(lv.tiles.map(t => t.cell)), free = Array.from({ length: lv.cols * lv.rows }, (_, i) => i).filter(i => !used.has(i));
      if (free.length) moveTile(go, pickR(free, r));
    }
    lv.goCell = loop[0];
    lv.roll = { dice, card };
    q.tell = true;
  },
  cellLabel: (lv, cell) => cell === lv.goCell ? 'GO' : null,
  hint(lv) {
    const rl = lv.roll;
    if (!rl) return null;
    return { text: `rolled ${rl.dice.map(d => `[${d}]`).join('')}${rl.card ? ` chance: ${rl.card > 0 ? '+2' : '-3'}` : ''}  from GO >`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.pawnbros = "the board's outer ring is a loop from GO (top left), clockwise. the real node is the dice roll's number of squares from GO. boss: plus a Chance card.";

// intro art
CORP_ART.pawnbros = [
  "  +--+--+--+--+",
  "  |GO|  |  |  |",
  "  +--+--+--+--+",
  "      [5][2]",
  "  P A W N  B R O S",
];
