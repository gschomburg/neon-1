// NeoN+1 corps/perimeter.js
'use strict';
NEON_FILES.push(['corps/perimeter.js', 'v13.04']);
// Its boss mod: CORNERS (corners), BULWARK (bulwark), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.concrete = { name: 'CONCRETE MARCH', bpm: 104, root: 43, scale: 'minor',    prog: [0, 0, 5, 6], bass: 'march',   drums: 'march', arp: 'up' };
MUSIC_FOR.perimeter = 'concrete';

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
