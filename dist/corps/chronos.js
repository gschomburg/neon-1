// NeoN+1 corps/chronos.js
'use strict';
NEON_FILES.push(['corps/chronos.js', 'v12.22']);
// Its boss mod: OVERCLOCK (overclock), FASTPAY (fastpay), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.overdrive = { name: 'OVERDRIVE',      bpm: 124, root: 50, scale: 'minor',    prog: [0, 6, 5, 6], bass: 'eighths', drums: 'four',  arp: 'up', tick: true };
MUSIC_FOR.chronos = 'overdrive';

// ---- the corp
CORPS.chronos = {
  key: 'chronos', name: 'CHRONOS', code: 'CR', level: 3,
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
