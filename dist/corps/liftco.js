// NeoN+1 corps/liftco.js
'use strict';
NEON_FILES.push(['corps/liftco.js', 'v13.04']);
// Its boss mod: EXPRESS (express), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.muzak = { name: 'MUZAK',          bpm: 92,  root: 53, scale: 'major',    prog: [0, 5, 3, 4], bass: 'pulse',   drums: 'half',  arp: 'updown' };
MUSIC_FOR.liftco = 'muzak';

// ---- the corp
CORPS.liftco = {
  key: 'liftco', name: 'LIFTCO', code: 'LC', level: 3,
  intel: '"going up. going down. going up."',
  tell: null,
  bossDesc: 'boss: express. it barely stops.',
  mods: ['express'],
  // The lift runs up and down the rows (a lit band). It stops a beat longer on the real
  // node's floor. Deeper and the boss: a shorter beat.
  dress(lv, k) {
    lv.lift = makeLift(k.tellTile.row, k.r, k.boss ? 780 : k.tier >= 2 ? 900 : 1150);
    k.tellTile.tell = true;
  },
  hint(lv, now) {
    const row = liftRow(lv, now);
    return row == null ? null : { text: `lift> floor ${lv.rows - row} ${lv.lift.up ? '^' : 'v'}`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.liftco = "the lift runs up and down the floors (the lit row). it stops a beat longer on the real node's floor.";

// intro art
CORP_ART.liftco = [
  "   [ 1 2 3 4 ^ ]",
  "   .-----------.",
  "   |  ||   ||  |",
  "   |  ||   ||  |",
  "   '-----------'",
  "     L I F T C O",
];
