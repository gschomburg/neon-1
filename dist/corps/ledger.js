// NeoN+1 corps/ledger.js
'use strict';
NEON_FILES.push(['corps/ledger.js', 'v13.82']);
// Its boss mod: INTEREST (interest), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const digitSum = s => [...s].reduce((t, d) => t + (+d || 0), 0);

// ---- its music
// Made from LIGHT CYCLE: the same band, its own tune.
SONGS.balancesheet = { name: 'BALANCE SHEET', from: 'lightcycle', bpm: 118, root: 45, scale: 'minor', prog: [0, 5, 6, 4], kit: '808', pump: 0.7, padVoice: 'glass',
  beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.', open: '..............x.' },
  bassLine: '0 . 7 . 0 . 7 . 0 . 7 . 0 7 0 7',
  melody: ['4 . 4 . 2 . 4 . 7 . . . 4 . . .', '5 . 5 . 4 . 5 . 9 . . . 7 . . .', '6 . 6 . 4 . 6 . 8 . . . 6 . . .', '4 . 2 . 1 . 2 . 4 . . . . . . .'],
  leadVoice: 'square', arpVoice: 'chip', arpLine: '. . 3 . . . 4 . . . 5 . . . 4 .', stab: 'x...............', stabVoice: 'brass', stabAt: 2 };
MUSIC_FOR.ledger = 'balancesheet';

// ---- the corp
CORPS.ledger = {
  key: 'ledger', name: 'LEDGER TRUST', code: 'LD', level: 2,
  intel: '"your balance is our business."',
  tell: null,
  bossDesc: 'boss: bigger balances.',
  mods: ['interest'],
  // Every node shows a balance. The real node's digits add up to 10.
  dress(lv, k) {
    const r = k.r, len = k.boss ? 5 : k.tier >= 2 ? 4 : 3;
    const num = ok => { for (;;) { let s = String(randInt(r, 1, 9)); while (s.length < len) s += randInt(r, 0, 9); if (ok(digitSum(s))) return s; } };
    for (const t of k.tiles) {
      const s = t === k.tellTile ? num(v => v === 10) : num(v => v !== 10 && Math.abs(v - 10) <= 4);
      t.glyph = normMotif(['bal', s, '---']);
    }
  },
};

// the codex, once you've beaten it
CORP_TELL.ledger = "the real node's balance: its digits add up to 10. deeper balances are longer.";
