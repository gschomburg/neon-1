// NeoN+1 corps/gencorp.js
'use strict';
NEON_FILES.push(['corps/gencorp.js', 'v13.85']);
// Its boss mod: MUTATE (mutate), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from RED DEEP: the same band, its own tune.
SONGS.specimen = { name: 'SPECIMEN', from: 'reddeep', bpm: 116, root: 41, scale: 'harmonic', prog: [0, 5, 1, 4], sevenths: true, kit: 'break', pump: 0, padVoice: 'organ', echo: 0.35, feedback: 0.4,
  beat: { kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
  bassLine: '0 . 7 . 5 . 7 . 4 . 7 . 5 . 2 .',
  melody: ['7 . 9 . 10 . 9 . 7 . 9 . 10 . 9 .', '7 . 9 . 10 . 12 . 11 - - - . . . .', '5 . 6 . 8 . 6 . 5 . 6 . 8 . 6 .', '4 . 6 . 7 . 9 . 11 - - - . . . .'],
  leadVoice: 'bell', arpVoice: 'pluck', arpLine: '. . . . . . . . 0 . 1 . 2 . 1 .' };
MUSIC_FOR.gencorp = 'specimen';

// ---- the corp
CORPS.gencorp = {
  key: 'gencorp', name: 'GENCORP', code: 'GC', level: 3,
  intel: '"we only improve on nature."',
  tell: null,
  bossDesc: 'boss: the cousins look close.',
  mods: ['mutate'],
  // A family line. The hint shows the parent glyph (the last layer's real node). The real
  // node is its child: one line changed. Deeper, decoys share a line with it too.
  dress(lv, k) {
    const r = k.r;
    const parent = k.carry || pickR(MOTIFS, k.corpR);
    const pool = shuffle(MOTIFS.filter(m => !sameGlyph(m, parent)), r);
    const child = parent.slice(), y = randInt(r, 0, 2);
    const lines = [...new Set(pool.map(m => m[y]))].filter(l => l !== parent[y]);
    child[y] = lines.length ? pickR(lines, r) : '  o  ';
    k.tellTile.glyph = child;
    const others = k.tiles.filter(t => t !== k.tellTile);
    others.forEach((t, i) => {
      let g = pool[i % pool.length].slice();
      if ((k.tier >= 2 || k.boss) && r() < (k.boss ? 0.7 : 0.4)) g[randInt(r, 0, 2)] = parent[randInt(r, 0, 2)];   // a cousin
      // a decoy never shares 2 lines with the parent (that would make it a child too)
      if (g.filter((l, j) => l === parent[j]).length >= 2 || sameGlyph(g, child)) g = pool[(i + 1) % pool.length].slice();
      t.glyph = g;
    });
    lv.parent = parent;
    lv.carryNext = k.real.glyph;
  },
  hint: lv => lv.parent ? { text: `parent> ${glyphLine(lv.parent)}`, col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.gencorp = "the hint shows the parent: last layer's real node. the real node is its child, the same with one line changed.";
