// NeoN+1 corps/mirror.js
'use strict';
NEON_FILES.push(['corps/mirror.js', 'v12.05']);
// Its boss mod: SHATTER (shatter), AFTERIMAGE (afterimage), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.glass = { name: 'GLASS ECHO',     bpm: 100, root: 52, scale: 'dorian',   prog: [0, 3, 0, 4], bass: 'offbeat', drums: 'four',  arp: 'mirror', pingpong: true };
MUSIC_FOR.mirror = 'glass';

// ---- the corp
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
