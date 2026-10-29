// NeoN+1 corps/bullettime.js
'use strict';
NEON_FILES.push(['corps/bullettime.js', 'v13.74']);
// Its boss reward: SLOMO gear x2 (slomo), defined with the gear in data/mods.js (ITEMS),
// its effect in engine/active.js.

// ---- its own helpers
const BT_SPIN = '|/-\\';

// ---- its music
SONGS.slowmotion = { name: 'SLOW MOTION',    bpm: 120, root: 44, scale: 'minor',    prog: [0, 5, 3, 6], bass: 'eighths', drums: 'four',  arp: 'up', echo: 0.6, feedback: 0.5 };
MUSIC_FOR.bullettime = 'slowmotion';

// ---- the corp
CORPS.bullettime = {
  key: 'bullettime', name: 'BULLET TIME INC', code: 'BT', level: 5, slowmo: true,
  intel: '"there is no hurry. except yours."',
  tell: null, alwaysFollow: true, timer: 14, pay: 1.2,
  bossDesc: 'boss: two decoys almost keep up.',
  rules: () => 'slow motion. the clock is not.',
  gear: { key: 'slomo', n: 2 },   // its boss reward: a stack of gear
  // Everything runs in slow motion (the music too), but the clock runs in real time. Every
  // node ticks; the real one ticks at full speed. Deeper: the decoys run a little faster.
  // Boss: two decoys run at 70%.
  dress(lv, k) {
    const r = k.r, slow = k.tier >= 2 || k.boss ? 0.35 : 0.2;
    const fast = k.boss ? shuffle(k.tiles.filter(t => !t.safe), r).slice(0, 2) : [];
    for (const t of k.tiles) { t.bt = t.safe ? 1 : fast.includes(t) ? 0.7 : slow; t.ph = r(); }
    lv.slow = true;
  },
  fx(t, ft, lv) {
    if (t.bt == null) return null;
    const ph = (ft - (lv.shownAt || ft)) * t.bt / 900 + t.ph, tri = Math.abs((ph % 2) - 1);
    const pos = Math.round(tri * 4);
    return { glyph: [' .-. ', `( ${BT_SPIN[Math.floor(ph * 4) % 4]} )`, ' '.repeat(pos) + 'o' + ' '.repeat(4 - pos)] };
  },
  hint: lv => lv.slow ? { text: 'bullet time> 20% speed', col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.bullettime = "everything runs in slow motion except the clock. every node ticks; the real one ticks at full speed.";
