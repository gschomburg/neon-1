// NeoN+1 corps/sigil.js
'use strict';
NEON_FILES.push(['corps/sigil.js', 'v12.00']);
CORPS.sigil = {
  key: 'sigil', name: 'SIGIL DYNAMICS', letter: 'S', level: 2,
  intel: '"we sign everything we make."',
  tell: 'mark', bossTell: 'mark', bossFlash: true,
  bossDesc: 'boss: the signature fades fast.',
  mods: ['sigscan', 'forgery'],
};

// the codex, once you've beaten it
CORP_TELL.sigil = 'the real node always wears the signature, and so do some decoys. the boss signature fades.';

// intro art
CORP_ART.sigil = [
  "        .-'''-.",
  "     .-'   X   '-.",
  '    /  \\       /  \\',
  '   |    >-(*)-<    |',
  '    \\  /       \\  /',
  "     '-.   X   .-'",
  "        '-...-'",
];
