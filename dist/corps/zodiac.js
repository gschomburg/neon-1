// NeoN+1 corps/zodiac.js
'use strict';
NEON_FILES.push(['corps/zodiac.js', 'v12.21']);
// Its boss mod: HOROSCOPE (horoscope), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const ZODIAC = [
  ['ARI', 'fire'], ['LEO', 'fire'], ['SAG', 'fire'], ['TAU', 'earth'], ['VIR', 'earth'], ['CAP', 'earth'],
  ['GEM', 'air'], ['LIB', 'air'], ['AQU', 'air'], ['CAN', 'water'], ['SCO', 'water'], ['PIS', 'water'],
];
const ELEMENT_MARK = { fire: '^ ^ ^', earth: '# # #', air: '= = =', water: '~ ~ ~' };
const ELEMENT_OPPOSITE = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' };

// ---- its music
SONGS.retrograde = { name: 'RETROGRADE',     bpm: 84,  root: 46, scale: 'phrygian', prog: [0, 6, 5, 1], bass: 'offbeat', drums: 'half',  arp: 'mirror', pingpong: true, echo: 0.5, feedback: 0.45 };
MUSIC_FOR.zodiac = 'retrograde';

// ---- the corp
CORPS.zodiac = {
  key: 'zodiac', name: 'ZODIAC HOUSE', code: 'ZD', level: 2,
  intel: '"the stars never lie. we do."',
  tell: null,
  bossDesc: 'boss: mercury retrograde.',
  mods: ['horoscope'],
  // Signs with their element (^ fire, # earth, = air, ~ water). The horoscope names the
  // lucky element; the real node is the only sign of it. Boss (retrograde): the real
  // node is the only sign of the OPPOSITE element (fire-air, earth-water).
  dress(lv, k) {
    const r = k.r, els = Object.keys(ELEMENT_MARK);
    const lucky = pickR(els, r), realEl = k.boss ? ELEMENT_OPPOSITE[lucky] : lucky;
    const of = el => ZODIAC.filter(z => z[1] === el);
    const sign = z => normMotif([' * . ', z[0], ELEMENT_MARK[z[1]]]);
    k.tellTile.glyph = sign(pickR(of(realEl), r));
    const rest = els.filter(e => e !== realEl && e !== (k.boss ? lucky : null));
    for (const t of k.tiles) if (t !== k.tellTile) t.glyph = sign(pickR(of(pickR(rest, r)), r));
    lv.lucky = lucky;
  },
  hint: lv => lv.lucky ? { text: `horoscope> lucky element: ${lv.lucky}`, col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.zodiac = "each sign shows its element (^ fire, # earth, = air, ~ water). the real node is the only sign of the lucky element. boss, retrograde: of the opposite one (fire-air, earth-water).";

// intro art
CORP_ART.zodiac = [
  "     *    .   *",
  "  .    \\ /      .",
  "   * -- O -- *",
  "  .    / \\   .",
  "     *    .   *",
  "   ZODIAC HOUSE",
];
