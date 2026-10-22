// NeoN+1 corps/burgertron.js
'use strict';
NEON_FILES.push(['corps/burgertron.js', 'v12.15']);
// Its boss mod: SUPERSIZE (supersize), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.drivethru = { name: 'DRIVE THRU',     bpm: 126, root: 48, scale: 'dorian',   prog: [0, 3, 4, 3], bass: 'offbeat', drums: 'four',  arp: 'updown' };
MUSIC_FOR.burgertron = 'drivethru';

// ---- the corp
CORPS.burgertron = {
  key: 'burgertron', name: 'BURGERTRON', code: 'BG', level: 1,
  intel: '"have it your way. one way."',
  tell: null,
  bossDesc: 'boss: the menu changes.',
  mods: ['supersize'],
  // Combo numbers. The hint names the combo of the day. Boss: it names a wrong one first,
  // then the menu changes.
  dress(lv, k) {
    const r = k.r, nums = shuffle(Array.from({ length: Math.max(9, k.tiles.length) }, (_, i) => i + 1), r);
    k.tiles.forEach((t, i) => { t.combo = nums[i]; t.glyph = normMotif(['.---.', `|#${nums[i]}|`, "'---'"]); });
    const others = k.tiles.filter(t => t !== k.tellTile);
    lv.combo = { real: k.tellTile.combo, fake: k.boss && others.length ? pickR(others, r).combo : null };
  },
  hint(lv, now) {
    if (!lv.combo) return null;
    lv.hintAt = lv.hintAt || now;
    const fake = lv.combo.fake != null && now - lv.hintAt < 3500;
    return fake ? { text: `combo of the day: #${lv.combo.fake}`, col: C.accent }
      : { text: `${lv.combo.fake != null ? 'menu update! ' : ''}combo of the day: #${lv.combo.real}`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.burgertron = "the hint names the combo of the day. boss: the first combo is wrong; wait for the menu update.";

// intro art
CORP_ART.burgertron = [
  "   .-''''''''-.",
  "  /  o  o  o   \\",
  " |~~~~~~~~~~~~~~|",
  " |##############|",
  " |~~~~~~~~~~~~~~|",
  "  \\____________/",
];
