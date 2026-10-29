// NeoN+1 corps/tollgate.js
'use strict';
NEON_FILES.push(['corps/tollgate.js', 'v13.79']);
// Its boss mod: EZPASS (ezpass), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from NIGHT DRIVE: the same band, its own tune.
SONGS.exactchange = { name: 'EXACT CHANGE', from: 'nightdrive', bpm: 96, root: 43, scale: 'minor', prog: [0, 3, 5, 4], echo: 0.4,
  beat: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.' },
  bassLine: '0 - - - 0 - - - 0 - - - 0 - 0 -',
  melody: ['4 - - - 2 - 0 - 2 - - - 4 - - -', '5 - - - - - - - . . . . . . . .', '4 - - - 2 - 0 - -1 - - - 0 - - -', '1 - - - - - - - . . . . . . 2 3'],
  leadVoice: 'saw' };
MUSIC_FOR.tollgate = 'exactchange';

// ---- the corp
CORPS.tollgate = {
  key: 'tollgate', name: 'TOLLGATE', code: 'TG', level: 2,
  intel: '"exact change only."',
  tell: null, pay: 1.3,
  bossDesc: 'boss: the booth is next door.',
  rules: () => `every pick costs ${costInt(ECON.corpCosts.tollgatePick)}cr. pays x1.3`,
  mods: ['ezpass'],
  // A toll booth |=| sits over one column; the real node is in it. Deeper and the boss:
  // in it or right next to it.
  dress(lv, k) {
    const r = k.r;
    let col = k.tellTile.col;
    if ((k.tier >= 2 || k.boss) && r() < 0.5) { const opts = [col - 1, col + 1].filter(c => c >= 0 && c < lv.cols); if (opts.length) col = pickR(opts, r); }
    lv.booth = col;
  },
  hint(lv) {
    if (lv.booth == null) return null;
    const { tx } = tileOrigin({ col: lv.booth, row: 0 });
    return { text: '|=|', col: C.accent, x: tx + 2 };
  },
  onPick() { const run = st.run, c = costInt(ECON.corpCosts.tollgatePick); if (canSpend(c)) run.credits -= c; },
};

// the codex, once you've beaten it
CORP_TELL.tollgate = `the toll booth |=| sits over the real node's column. deeper and boss: that column or the one next to it. every pick costs ${costInt(ECON.corpCosts.tollgatePick)}cr.`;
