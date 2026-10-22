// NeoN+1 corps/perimeter.js
'use strict';
NEON_FILES.push(['corps/perimeter.js', 'v12.01']);
CORPS.perimeter = {
  key: 'perimeter', name: 'PERIMETER SYS', letter: 'P', level: 1,
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
