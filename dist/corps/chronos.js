// NeoN+1 corps/chronos.js
'use strict';
NEON_FILES.push(['corps/chronos.js', 'v12.00']);
CORPS.chronos = {
  key: 'chronos', name: 'CHRONOS', letter: 'C', level: 3,
  intel: '"time is money. yours is short."',
  tell: null, timer: 10, pay: 1.6, bossShrink: true,
  bossDesc: 'boss: clock shrinks every miss.',
  mods: ['overclock', 'fastpay'],
};

// the codex, once you've beaten it
CORP_TELL.chronos = 'no tell. just the clock. it pays more for the pressure.';

// intro art
CORP_ART.chronos = [
  '      .-----------.',
  '     /   . 12 .    \\',
  '    | .     |     . |',
  '    | 9     o---  3 |',
  '    | .           . |',
  "     \\   '  6  '   /",
  "      '-----------'",
];
