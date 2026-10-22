// NeoN+1 corps/purlwise.js
'use strict';
NEON_FILES.push(['corps/purlwise.js', 'v12.01']);
CORPS.purlwise = {
  key: 'purlwise', name: 'PURLWISE', letter: 'K', level: 2,
  intel: '"knit one, purl two."',
  tell: null,
  bossDesc: 'boss: the dropped stitch hides.',
  mods: ['unravel'],
  // Stitches: knit v and purl -. Every node has the same pattern (deeper: one pattern per
  // grid row); the real node has a dropped stitch, an o. Boss: a V instead of a v.
  dress(lv, k) {
    const r = k.r;
    const pats = [['v-v-v', '-v-v-', 'v-v-v'], ['vv--v', 'vv--v', 'vv--v'], ['v v v', '-----', 'v v v'], ['-v-v-', '-v-v-', '-v-v-']];
    const rowPat = {};
    const patFor = t => k.tier >= 2 || k.boss ? (rowPat[t.row] = rowPat[t.row] || pickR(pats, r)) : (rowPat.all = rowPat.all || pickR(pats, r));
    for (const t of k.tiles) t.glyph = patFor(t).slice();
    const g = k.tellTile.glyph, spots = [];
    g.forEach((l, y) => [...l].forEach((ch, x) => { if (ch === 'v') spots.push([y, x]); }));
    const [y, x] = pickR(spots, r);
    k.tellTile.glyph = g.map((l, yy) => yy === y ? l.slice(0, x) + (k.boss ? 'V' : 'o') + l.slice(x + 1) : l);
  },
};

// the codex, once you've beaten it
CORP_TELL.purlwise = "every node has the same stitch pattern (deeper: one pattern per row). the real node has a dropped stitch: an o (boss: a V).";

// intro art
CORP_ART.purlwise = [
  "    .-~~~-.",
  "   (  @@@  )--.",
  "    '-~~~-'    \\",
  "      v-v-v     )",
  "      -v-v-    /",
];
