// NeoN+1 corps/basic.js
'use strict';
NEON_FILES.push(['corps/basic.js', 'v12.00']);
CORPS.basic = {
  key: 'basic', name: 'BASIC CORP', letter: 'B', level: 1,
  intel: '"we do one thing. it is this."',
  tell: null, nodes: -1, pay: 0.7,
  bossDesc: 'boss: just more nodes.',
  rules: () => 'small corp. pays less.',
  mods: ['basictraining'],
  // the real node is the plain one: [ ]
  dress(lv, k) { k.tellTile.glyph = PLAIN_GLYPH; },
};

// the codex, once you've beaten it
CORP_TELL.basic = 'the real node is the plain one: [ ]. that is the whole trick.';

// intro art
CORP_ART.basic = [
  '+------------------+',
  '|                  |',
  '|   B A S I C      |',
  '|   ----------     |',
  '|   corp.  inc.    |',
  '|                  |',
  '+------------------+',
];
