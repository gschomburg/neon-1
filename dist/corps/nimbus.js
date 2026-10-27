// NeoN+1 corps/nimbus.js
'use strict';
NEON_FILES.push(['corps/nimbus.js', 'v13.46']);
// Its boss mod: FORECAST (forecast), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.lowpressure = { name: 'LOW PRESSURE',   bpm: 76,  root: 42, scale: 'minor',    prog: [0, 5, 3, 6], bass: 'pulse',   drums: 'half',  arp: 'down', echo: 0.5, feedback: 0.4 };
MUSIC_FOR.nimbus = 'slowtide';   // SLOW TIDE (in data/music.js). Its old track above isn't playing anywhere now.

// ---- the corp
CORPS.nimbus = {
  key: 'nimbus', name: 'NIMBUS WEATHER', code: 'NB', level: 1,
  intel: '"70% chance of ICE."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: storm front. 50-60%.',
  mods: ['forecast'],
  // A forecast: "70% chance: top row". It is right exactly as often as it says.
  dress(lv, k) {
    const r = k.r, pct = k.boss ? pickR([50, 60], r) : k.tier >= 2 ? pickR([60, 70, 80], r) : pickR([70, 80, 90], r);
    const byRow = r() < 0.5, real = k.real;
    const n = byRow ? lv.rows : lv.cols, at = byRow ? real.row : real.col;
    let pick = at;
    if (r() * 100 >= pct) { const other = Array.from({ length: n }, (_, i) => i).filter(i => i !== at); pick = pickR(other, r); }
    lv.forecast = `${pct}% chance: ${byRow ? ROW_NAMES(lv.rows, pick) : COL_NAMES(lv.cols, pick)}`;
  },
  hint: lv => lv.forecast ? { text: `forecast> ${lv.forecast}`, col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.nimbus = "the forecast names a row or column, and it is right exactly as often as it says. the storm boss: 50-60%.";
