// NeoN+1 corps/upside.js
'use strict';
NEON_FILES.push(['corps/upside.js', 'v13.90']);
// Its boss mod: INVERSION (inversion), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const UP_WORDS = ['REAL', 'TRUE', 'YES', 'NODE', 'KEY', 'UP', 'SKY', 'RISE', 'GO', 'DATA', 'LIFT', 'HERE', 'GATE', 'CORE', 'ROOT', 'PATH'];

// ---- its music
// Made from NIGHT DRIVE: the same band, its own tune.
SONGS.inverted = { name: 'INVERTED', from: 'nightdrive', bpm: 92, root: 41, scale: 'minor', prog: [6, 2, 5, 0], echo: 0.4, pingpong: true,
  beat: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.' },
  bassLine: '0 - - - - - - - 0 - - - 0 - 0 -',
  melody: ['4 - - - - - 5 - 6 - - - 8 - - -', '6 - - - - - - - . . . . . . . .', '3 - - - - - 4 - 5 - - - 6 - - -', '4 - - - - - - - . . . . . . 6 5'],
  leadVoice: 'saw' };
MUSIC_FOR.upside = 'inverted';

// ---- the corp
CORPS.upside = {
  key: 'upside', name: 'UPSIDE', code: 'UP', level: 5, flip: true,
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
