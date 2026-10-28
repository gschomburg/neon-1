// NeoN+1 corps/burgertron.js
'use strict';
NEON_FILES.push(['corps/burgertron.js', 'v13.71']);
// Its boss mod: SUPERSIZE (supersize), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from ANTHEM: the same band, its own tune.
SONGS.orderup = { name: 'ORDER UP', from: 'anthem', bpm: 136, root: 45, scale: 'major', prog: [0, 5, 3, 4], kit: 'break', pump: 0, padVoice: 'organ', echo: 0.3,
  beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
  bassVoice: 'picked', bassLine: '0 . 0 . 0 . 0 . 0 . 0 . 0 . 0 .', stab: 'x.......x.x.....', stabVoice: 'brass', stabAt: 2,
  melody: ['0 - 2 - 4 - 7 - - - 4 - 5 - 4 -', '2 - - - . . . . . . . . . . . .', '0 - 2 - 4 - 7 - - - 9 - 8 - 7 -', '7 - - - . . . . . . . . . . . .'],
  leadVoice: 'brass', arpVoice: 'bell', arp: 'updown' };
MUSIC_FOR.burgertron = 'orderup';

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
