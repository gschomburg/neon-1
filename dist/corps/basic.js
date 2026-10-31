// NeoN+1 corps/basic.js
'use strict';
NEON_FILES.push(['corps/basic.js', 'v13.92']);
// Its boss mod: BASIC TRAINING (basictraining), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const PLAIN_GLYPH = normMotif(['', '[ ]', '']);

// ---- its music
SONGS.plaintext = { name: 'PLAIN TEXT',     bpm: 100, root: 48, scale: 'dorian',   prog: [0, 3, 4, 0], bass: 'pulse',   drums: 'half',  arp: 'up' };
MUSIC_FOR.basic = 'plaintext';

// ---- the corp
CORPS.basic = {
  key: 'basic', name: 'BASIC CORP', code: 'BC', level: 1,
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
