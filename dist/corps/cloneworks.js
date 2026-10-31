// NeoN+1 corps/cloneworks.js
'use strict';
NEON_FILES.push(['corps/cloneworks.js', 'v13.93']);
// Its boss mod: TWIN LOCK (twinlock), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.mitosis = { name: 'MITOSIS',        bpm: 108, root: 44, scale: 'harmonic', prog: [0, 0, 5, 5], bass: 'eighths', drums: 'four',  arp: 'mirror', pingpong: true };
MUSIC_FOR.cloneworks = 'downward';   // DOWNWARD (in data/music.js; the user, 2026-10-25). Its own track above is unused now.

// ---- the corp
CORPS.cloneworks = {
  key: 'cloneworks', name: 'CLONEWORKS', code: 'CW', level: 2,
  intel: '"two of everything. almost."',
  tell: null, nodes: 1,   // at least 3 nodes: the real one and a pair
  bossDesc: 'boss: the clones mutate.',
  mods: ['twinlock'],
  // Every glyph shows up twice, except the real node's. Deeper: the twin is a mirror
  // image. Boss: the twin is one character off.
  dress(lv, k) {
    const r = k.r;
    const deck = shuffle(MOTIFS.slice(), r);
    k.tellTile.glyph = deck.pop();
    const rest = shuffle(k.tiles.filter(t => t !== k.tellTile), r);
    for (let i = 0; i < rest.length; i += 2) {
      const g = deck.pop();
      rest[i].glyph = g;
      const twin = k.boss ? mutateGlyph(g, r, true) : k.tier >= 2 ? mirrorGlyph(g) : g;
      if (rest[i + 1]) rest[i + 1].glyph = twin;
      else rest[i].glyph = rest[i - 1] ? rest[i - 1].glyph : g;   // odd one out: join the last pair (a triple)
    }
  },
};

// the codex, once you've beaten it
CORP_TELL.cloneworks = 'every glyph has a twin except the real node. deeper: the twin is a mirror image. boss: the twin is one character off.';
