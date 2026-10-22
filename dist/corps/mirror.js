// NeoN+1 corps/mirror.js
'use strict';
NEON_FILES.push(['corps/mirror.js', 'v12.00']);
CORPS.mirror = {
  key: 'mirror', name: 'MIRRORLINE', letter: 'M', level: 2,
  intel: '"every step echoes the last."',
  tell: 'mirror', bossTell: 'point',
  bossDesc: 'boss: the echo turns over.',
  mods: ['shatter', 'afterimage'],
};

// the codex, once you've beaten it
CORP_TELL.mirror = 'the real node mirrors the last one. deeper: top-bottom. the boss: through the center.';

// intro art
CORP_ART.mirror = [
  '   /\\    /\\  ||  /\\    /\\',
  '  /  \\  /  \\ || /  \\  /  \\',
  '  \\  /  \\  / || \\  /  \\  /',
  '   \\/    \\/  ||  \\/    \\/',
];
