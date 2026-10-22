// NeoN+1 corps/tumbler.js
'use strict';
NEON_FILES.push(['corps/tumbler.js', 'v12.23']);
// Its boss mod: PICKSET (pickset), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.tumblers = { name: 'TUMBLERS',       bpm: 104, root: 41, scale: 'phrygian', prog: [0, 1, 0, 5], bass: 'march',   drums: 'march', arp: 'up' };
MUSIC_FOR.tumbler = 'tumblers';

// ---- the corp
CORPS.tumbler = {
  key: 'tumbler', name: 'TUMBLER LOCKS', code: 'TU', level: 2,
  intel: '"every lock has a weak pin."',
  tell: null, nodes: 1,
  bossDesc: 'boss: pins rattle loose.',
  mods: ['pickset'],
  // Lock pins at different heights. The real node's pin is the one height no decoy has.
  dress(lv, k) {
    const r = k.r, heights = shuffle([0, 1, 2], r), realH = heights[0];
    const pin = (h, x) => { const rows = ['     ', '     ', '     ']; const set = (y, s) => { rows[y] = (' '.repeat(x) + s).padEnd(5).slice(0, 5); };
      set(h, '[=]'); for (let y = h + 1; y < 3; y++) set(y, ' | '); return rows; };
    const decoyH = k.tiles.length <= 5 ? [heights[1]] : [heights[1], heights[2]];
    const others = shuffle(k.tiles.filter(t => t !== k.tellTile), r);
    others.forEach((t, i) => { t.glyph = pin(decoyH[i % decoyH.length], k.tier >= 2 || k.boss ? randInt(r, 0, 2) : 1); });
    k.tellTile.glyph = pin(realH, k.tier >= 2 || k.boss ? randInt(r, 0, 2) : 1);
  },
};

// the codex, once you've beaten it
CORP_TELL.tumbler = "every pin sits at a height. the real pin is the one height no decoy has.";

// intro art
CORP_ART.tumbler = [
  "    .-----.",
  "   / .---. \\",
  "   | |   | |",
  " .-'-'---'-'-.",
  " |    (o)    |",
  " |     |     |",
  " '-----------'",
];
