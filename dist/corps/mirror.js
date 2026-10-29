// NeoN+1 corps/mirror.js
'use strict';
NEON_FILES.push(['corps/mirror.js', 'v13.78']);
// Its boss mod: SHATTER (shatter), AFTERIMAGE (afterimage), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from SLOW TIDE: the same band, its own tune.
SONGS.reflection = { name: 'REFLECTION', from: 'slowtide', bpm: 80, root: 45, scale: 'dorian', prog: [0, 3, 0, 3], kit: 'break', pump: 0, swing: 0.1, padVoice: 'glass', echo: 0.6, feedback: 0.55,
  beat: { kick: 'x.......x.x.....', snare: '....x.......x...', ghost: '.......x.....x..', hat: '..x...x...x...x.' },
  bassVoice: 'sub', bassLine: '0 - - - - - - - 0 - - - - - - -',
  melody: ['. . . . 4 - - - . . . . 4 - - -', '. . . . 5 - - - . . . . 5 - - -', '. . . . 6 - - - . . . . 4 - - -', '. . . . 2 - - - . . . . 2 - - -'],
  melodyAt: 0, leadVoice: 'bell', arpVoice: 'keys', arpLine: '0 . 1 . 2 . 1 . 0 . 1 . 2 . 1 .' };
MUSIC_FOR.mirror = 'reflection';

// ---- the corp
CORPS.mirror = {
  key: 'mirror', name: 'MIRRORLINE', code: 'ML', level: 2,
  intel: '"every step echoes the last."',
  tell: 'mirror', bossTell: 'point',
  bossDesc: 'boss: the echo turns over.',
  mods: ['shatter', 'afterimage'],
};

// the codex, once you've beaten it
CORP_TELL.mirror = 'the real node mirrors the last one. deeper: top-bottom. the boss: through the center.';
