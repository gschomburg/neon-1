// NeoN+1 corps/megamart.js
'use strict';
NEON_FILES.push(['corps/megamart.js', 'v13.60']);
// Its boss mod: COUPON (coupon), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from DEADPAN: the same band, its own tune.
SONGS.pricecheck = { name: 'PRICE CHECK', from: 'deadpan', bpm: 120, root: 41, scale: 'dorian', prog: [0, 0, 6, 3], kit: '808', pump: 0.3, gate: 'x..x..x.x..x..x.',
  beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.' },
  bassVoice: 'pluck', bassLine: '0 . 0 7 . 0 0 . 0 . 0 7 . 0 4 .',
  melody: ['0 . 0 . 0 . 1 . 0 - - - . . . .', '0 . 0 . 0 . 3 . 2 - - - . . . .', '4 . 4 . 4 . 3 . 2 - - - . . . .', '1 . 1 . 2 . 1 . 0 - - - . . . .'],
  leadVoice: 'square', arpVoice: 'chip', arpLine: '. . . . 0 . . . . . . . 2 . . .' };
MUSIC_FOR.megamart = 'pricecheck';

// ---- the corp
CORPS.megamart = {
  key: 'megamart', name: 'MEGAMART', code: 'MM', level: 1,
  intel: '"everyday low prices. everyday."',
  tell: null,
  bossDesc: 'boss: clearance. cheap is a trap.',
  mods: ['coupon'],
  // Every node has a price tag. The real node is on sale: the lowest price.
  // Deeper (and the boss): the one price that ends in .00 (and something else is cheaper).
  dress(lv, k) {
    const r = k.r, icons = ['[=]', '(o)', '<>', '{ }', '/\\', '|#|', 'o-o', '[]]', '<o>', '%'];
    const deep = k.tier >= 2 || k.boss, used = new Set();
    const price = (lo, hi, whole) => { for (;;) { const c = whole ? randInt(r, lo, hi) * 100 : randInt(r, lo, hi); if (!used.has(c) && (whole || c % 100)) { used.add(c); return c; } } };
    const tag = (t, c) => { t.glyph = normMotif([pickR(icons, r), `$${Math.floor(c / 100)}.${String(c % 100).padStart(2, '0')}`, '']); };
    const rest = k.tiles.filter(t => t !== k.tellTile);
    if (!deep) {
      const low = price(100, 299);
      tag(k.tellTile, low);
      for (const t of rest) tag(t, price(low + 1, 999));
    } else {
      const real = price(3, 8, true);
      tag(k.tellTile, real);
      rest.forEach((t, i) => tag(t, i === 0 ? price(100, real - 1) : price(100, 999)));   // a cheaper decoy
    }
  },
};

// the codex, once you've beaten it
CORP_TELL.megamart = 'the real node is on sale: the lowest price. deeper and the boss: the one price that ends in .00. something else is cheaper.';
