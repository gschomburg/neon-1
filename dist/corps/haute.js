// NeoN+1 corps/haute.js
'use strict';
NEON_FILES.push(['corps/haute.js', 'v12.02']);
// Its boss mod: RUNWAY (runway), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.catwalk = { name: 'CATWALK',        bpm: 120, root: 41, scale: 'phrygian', prog: [0, 1, 5, 1], bass: 'offbeat', drums: 'four',  arp: 'down' };
MUSIC_FOR.haute = 'catwalk';

// ---- the corp
CORPS.haute = {
  key: 'haute', name: 'HAUTE//COUTURE', letter: 'H', level: 2,
  intel: '"accept no imitations."',
  tell: null, nodes: 1,   // the original only shows with 3+ nodes
  bossDesc: 'boss: the fakes get better.',
  mods: ['runway'],
  // Every node wears this season's label (the Sigil signature, so SIGSCAN reads it).
  // Every fake is one character off; the real node is the original. Fakes are
  // counterfeits, so FORGERY can make one free.
  dress(lv, k) {
    const r = k.r;
    const label = pickR(MOTIFS.filter(m => m.join('').replace(/ /g, '').length >= 6), r);
    for (const t of k.tiles) {
      t.marked = true;
      if (t === k.tellTile) { t.glyph = label; continue; }
      let g; do g = mutateGlyph(label, r, k.boss); while (sameGlyph(g, label));
      t.glyph = g; t.forged = !t.safe;
    }
  },
};

// the codex, once you've beaten it
CORP_TELL.haute = 'every node wears the label. each knockoff is one character off; the real node is the original. FORGERY makes one knockoff free.';

// intro art
CORP_ART.haute = [
  '        ( )',
  '         |',
  "    .-'' ''-.",
  "  .'  HAUTE  '.",
  " '-------------'",
  '     COUTURE',
];
