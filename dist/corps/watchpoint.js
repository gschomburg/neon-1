// NeoN+1 corps/watchpoint.js
'use strict';
NEON_FILES.push(['corps/watchpoint.js', 'v13.13']);
// Its boss mod: CCTV (cctv), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.nightshift = { name: 'NIGHT SHIFT',    bpm: 84,  root: 42, scale: 'dorian',   prog: [0, 6, 5, 4], bass: 'offbeat', drums: 'half',  arp: 'down', echo: 0.45, feedback: 0.4 };
MUSIC_FOR.watchpoint = 'nightshift';

// ---- the corp
CORPS.watchpoint = {
  key: 'watchpoint', name: 'WATCHPOINT', code: 'WP', level: 3,
  intel: '"smile. you\'re on camera."',
  tell: null, timer: 12, pay: 1.4,
  bossDesc: 'boss: the camera blinks.',
  rules: () => '12s clock. pays x1.4',
  mods: ['cctv'],
  // A camera sweeps the rows, top to bottom. Each sweep catches one ICE: it flashes ###
  // as the camera passes it. Deeper: shorter flashes. Boss: some sweeps catch nothing.
  dress(lv, k) {
    lv.cam = { per: 750, flash: k.boss ? 160 : k.tier >= 2 ? 240 : 340, seed: k.r() * 1000, blink: k.boss };
  },
  band(lv, now) {
    if (!lv.cam || lv.shownAt == null) return null;
    const tt = now - lv.shownAt;
    return { row: Math.floor((tt % (lv.cam.per * lv.rows)) / lv.cam.per), col: C.danger, ch: 'o' };
  },
  fx(t, ft, lv) {
    const cm = lv.cam;
    if (!cm || lv.shownAt == null || t.safe) return null;
    const tt = ft - lv.shownAt, sweep = Math.floor(tt / (cm.per * lv.rows)), row = Math.floor((tt % (cm.per * lv.rows)) / cm.per);
    if (row !== t.row || tt % cm.per >= cm.flash) return null;
    if (cm.blink && h01(cm.seed, sweep + 0.5) < 0.4) return null;
    const ice = lv.tiles.filter(o => !o.safe && !o.loaded);
    return ice[Math.floor(h01(cm.seed, sweep) * ice.length)] === t ? { glyph: ICE_FLASH, gc: C.danger } : null;
  },
};

// the codex, once you've beaten it
CORP_TELL.watchpoint = "the camera sweeps the rows. each sweep catches one ICE: it flashes ### as the camera passes. boss: some sweeps catch nothing.";

// intro art
CORP_ART.watchpoint = [
  "   ___________",
  "  [__(  o  )__]==",
  "      |   |",
  "      '---'",
  "  W A T C H P O I N T",
];
