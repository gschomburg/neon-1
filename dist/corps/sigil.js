// NeoN+1 corps/sigil.js
'use strict';
NEON_FILES.push(['corps/sigil.js', 'v13.20']);
// Its boss mod: SIGSCAN (sigscan), FORGERY (forgery), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.velvet = { name: 'VELVET HEX',     bpm: 92,  root: 46, scale: 'phrygian', prog: [0, 1, 0, 6], bass: 'pulse',   drums: 'half',  arp: 'updown' };
MUSIC_FOR.sigil = 'velvet';

// ---- the corp
CORPS.sigil = {
  key: 'sigil', name: 'SIGIL DYNAMICS', code: 'SG', level: 2,
  intel: '"we sign everything we make."',
  tell: 'mark', bossTell: 'mark', bossFlash: true,
  bossDesc: 'boss: the signature fades fast.',
  mods: ['sigscan', 'forgery'],
};

// the codex, once you've beaten it
CORP_TELL.sigil = 'the real node always wears the signature, and so do some decoys. the boss signature fades.';

// intro art
CORP_ART.sigil = [
  "        .-'''-.",
  "     .-'   X   '-.",
  '    /  \\       /  \\',
  '   |    >-(*)-<    |',
  '    \\  /       \\  /',
  "     '-.   X   .-'",
  "        '-...-'",
];
