// NeoN+1 corps/verdant.js
'use strict';
NEON_FILES.push(['corps/verdant.js', 'v13.42']);
// Its boss mod: COMPOST (compost), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from SLOW TIDE: the same band, its own tune.
SONGS.moss = { name: 'MOSS', from: 'slowtide', bpm: 76, root: 43, scale: 'major', prog: [0, 3, 4, 0], kit: 'break', pump: 0, swing: 0.14, padVoice: 'glass', echo: 0.45, feedback: 0.45,
  beat: { kick: 'x.......x.......', snare: '....x.......x...', ghost: '...........x....', hat: '..x...x...x...x.' },
  bassVoice: 'sub', bassLine: '0 - - - - - - - 4 - - - 2 - - -',
  melody: ['. . . . 2 - - - 4 - - - . . . .', '. . . . 3 - - - 5 - - - . . . .', '. . . . 4 - - - 6 - - - 7 - - -', '. . . . 4 - - - 2 - - - . . . .'],
  melodyAt: 0, melodyOct: -1, leadVoice: 'bell', arpVoice: 'pluck', arpLine: '0 . . 2 . . 4 . . 2 . . 1 . . .' };
MUSIC_FOR.verdant = 'moss';

// ---- the corp
CORPS.verdant = {
  key: 'verdant', name: 'VERDANT', code: 'VD', level: 3,
  intel: '"nothing is wasted. nothing."',
  tell: null,
  bossDesc: 'boss: it grows back fast.',
  rules: () => 'ICE you hit grows back. leafy.',
  mods: ['compost'],
  // The real node has a leaf on its frame (so do 1-2 decoys). ICE you hit grows back a
  // few seconds later as a fresh node, leaf and all.
  dress(lv, k) {
    const others = shuffle(k.tiles.filter(t => t !== k.tellTile), k.r);
    const extra = Math.min(k.tier >= 2 || k.boss ? 2 : 1, Math.max(0, others.length - 1));
    for (const t of [k.tellTile, ...others.slice(0, extra)]) { t.leaf = true; t.marked = true; }
    lv.regrowMs = k.boss ? 2500 : 4000;
    lv.regrow = [];
  },
  onHit(t) { const lv = st.lv; if (lv.regrow) lv.regrow.push({ t, at: (lv.lt || 0) + lv.regrowMs }); },
  tick(lv, lt) {
    if (!lv.regrow) return;
    for (const g of lv.regrow.filter(o => lt >= o.at)) {
      const t = g.t;
      lv.regrow.splice(lv.regrow.indexOf(g), 1);
      if (t.state !== 'locked') continue;
      t.state = 'closed'; t.lockedBy = null; t.leaf = true; t.marked = true; t.klog = false; t.dir = null;
      t.glyph = pickR(MOTIFS.filter(m => !lv.tiles.some(o => o.glyph === m)), rngFor(st.run.seed, 'regrow', lv.misses, lt | 0));
      Sound.nodeOn();
      setMsg('> verdant: the ICE grows back.', C.accent);
    }
  },
  fx: t => t.leaf ? { corner: '%', cornerCol: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.verdant = "the real node has a leaf % on its frame, and so do 1-2 decoys. ICE you hit grows back a few seconds later, with a leaf.";
