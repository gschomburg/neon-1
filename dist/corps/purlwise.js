// NeoN+1 corps/purlwise.js
'use strict';
NEON_FILES.push(['corps/purlwise.js', 'v13.50']);
// Its boss mod: UNRAVEL (unravel), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.caston = { name: 'CAST ON',        bpm: 136, root: 47, scale: 'dorian',   prog: [0, 4, 3, 4], bass: 'jig',     drums: 'shanty', arp: 'mirror', pingpong: true, meter: 6, swing: 0.46 };   // 6/8 (the user, 2026-10-24)
MUSIC_FOR.purlwise = 'caston';

// ---- the corp
CORPS.purlwise = {
  key: 'purlwise', name: 'PURLWISE', code: 'PW', level: 2,
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
