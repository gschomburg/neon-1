// NeoN+1 corps/rydr.js
'use strict';
NEON_FILES.push(['corps/rydr.js', 'v13.55']);
// Its boss mod: SURGE (surge), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
MUSIC_FOR.rydr = 'nightdrive';   // NIGHT DRIVE (in data/music.js)

// ---- the corp
CORPS.rydr = {
  key: 'rydr', name: 'RYDR', code: 'RY', level: 2,
  intel: '"your driver is 2 minutes away."',
  tell: null, timer: 14, surge: true,
  bossDesc: 'boss: everyone rates 5.0.',
  rules: () => '14s clock. surge: pays more late.',
  mods: ['surge'],
  // Star ratings. Fakes rate a perfect 5.0; the real driver is the 4.9. Deeper, some
  // fakes are 4.8 too.
  dress(lv, k) {
    const r = k.r;
    for (const t of k.tiles) {
      const rate = t === k.tellTile ? '4.9' : k.tier >= 2 && r() < 0.35 ? '4.8' : '5.0';
      t.glyph = normMotif(['.-=-.', `*${rate}*`, "'o-o'"]);
    }
  },
};

// the codex, once you've beaten it
CORP_TELL.rydr = "fakes rate a perfect 5.0. the real driver is the 4.9. deeper, some fakes are 4.8. pays more the later you pick.";
