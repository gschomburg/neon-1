// NeoN+1 corps/upside.js
'use strict';
NEON_FILES.push(['corps/upside.js', 'v12.06']);
// Its boss mod: INVERSION (inversion), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const UP_WORDS = ['REAL', 'TRUE', 'YES', 'NODE', 'KEY', 'UP', 'SKY', 'RISE', 'GO', 'DATA', 'LIFT', 'HERE', 'GATE', 'CORE', 'ROOT', 'PATH'];

// ---- its music
SONGS.flipside = { name: 'FLIP SIDE',      bpm: 104, root: 47, scale: 'dorian',   prog: [0, 4, 3, 0], bass: 'offbeat', drums: 'half',  arp: 'down', pingpong: true };
MUSIC_FOR.upside = 'flipside';

// ---- the corp
CORPS.upside = {
  key: 'upside', name: 'UPSIDE', letter: '6', level: 5, flip: true,
  intel: '"we\'re fine. you\'re upside down."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: taps land mirrored.',
  rules: () => 'the screen is upside down.',
  mods: ['inversion'],
  // The whole screen is upside down, HUD and tray too. Every node shows a word; the real
  // one is the only one that reads right side up. Boss: a tap on a node picks the one
  // mirrored across the center.
  dress(lv, k) {
    const words = shuffle(UP_WORDS.slice(), k.r);
    k.tiles.forEach((t, i) => { t.glyph = normMotif(['', words[i % words.length], '']); });
  },
  hint: lv => lv.boss ? { text: 'upside> taps land mirrored', col: C.danger } : { text: 'upside> read the right one', col: C.accent },
};

// the codex, once you've beaten it
CORP_TELL.upside = "the screen is upside down. every node shows a word; the real one is the only one that reads right side up. boss: taps land on the mirrored node.";

// intro art
CORP_ART.upside = [
  "  /\\  /\\  /\\",
  "  \\/  \\/  \\/",
  "  |  UP  |  SIDE",
  "",
  "  U P S I D E",
];
