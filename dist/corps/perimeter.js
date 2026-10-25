// NeoN+1 corps/perimeter.js
'use strict';
NEON_FILES.push(['corps/perimeter.js', 'v13.15']);
// Its boss mod: CORNERS (corners), BULWARK (bulwark), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from MACHINE HEART: the same band, its own tune.
SONGS.fortify = { name: 'FORTIFY', from: 'machineheart', bpm: 100, root: 43, scale: 'minor', prog: [0, 0, 5, 6], kit: 'industrial', pump: 0.2, padVoice: 'choir', breakdown: 4,
  beat: { kick: 'x.....x.x.......', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', ghost: '...........x...x' },
  bassVoice: 'picked', bassLine: '0 . 0 0 . 0 0 . 0 . 0 0 . 0 1 .',
  melody: ['4 - - - . . . . 2 - - - 0 - - -', '-1 - - - - - - - . . . . . . . .', '4 - - - 5 - - - 7 - - - 5 - - -', '4 - - - - - - - . . . . 2 - - -'],
  melodyAt: 0, leadVoice: 'keys', arpVoice: 'pluck', arpLine: '0 . . 0 . . 0 . 1 . . 1 . . 2 .' };
MUSIC_FOR.perimeter = 'fortify';

// ---- the corp
CORPS.perimeter = {
  key: 'perimeter', name: 'PERIMETER SYS', code: 'PR', level: 1,
  intel: '"our corners never fall."',
  tell: 'corner', bossTell: 'center',
  bossDesc: 'boss: the core hides inward.',
  mods: ['corners', 'bulwark'],
};

// the codex, once you've beaten it
CORP_TELL.perimeter = 'the real node is usually in a corner. deeper: on any edge. boss: the center.';

// intro art
CORP_ART.perimeter = [
  ' +==+==============+==+',
  ' |##|              |##|',
  ' +==+  PERIMETER   +==+',
  '    |    [ SYS ]   |',
  ' +==+              +==+',
  ' |##|              |##|',
  ' +==+==============+==+',
];
