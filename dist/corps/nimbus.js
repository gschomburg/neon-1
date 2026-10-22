// NeoN+1 corps/nimbus.js
'use strict';
NEON_FILES.push(['corps/nimbus.js', 'v12.00']);
CORPS.nimbus = {
  key: 'nimbus', name: 'NIMBUS WEATHER', letter: 'W', level: 1,
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

// intro art
CORP_ART.nimbus = [
  "        .--.",
  "     .-(    ).",
  "    (___.__)__)",
  "     ' ' ' ' '",
  "    ' ' ' ' '",
];
