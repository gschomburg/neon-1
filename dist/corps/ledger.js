// NeoN+1 corps/ledger.js
'use strict';
NEON_FILES.push(['corps/ledger.js', 'v12.09']);
// Its boss mod: INTEREST (interest), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const digitSum = s => [...s].reduce((t, d) => t + (+d || 0), 0);

// ---- its music
SONGS.compound = { name: 'COMPOUND',       bpm: 90,  root: 43, scale: 'minor',    prog: [0, 3, 5, 4], bass: 'march',   drums: 'half',  arp: 'updown' };
MUSIC_FOR.ledger = 'compound';

// ---- the corp
CORPS.ledger = {
  key: 'ledger', name: 'LEDGER TRUST', letter: 'L', level: 2,
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

// intro art
CORP_ART.ledger = [
  '    _____________',
  '   /   LEDGER    \\',
  '  /_______________\\',
  '   | |  | |  | | |',
  '   | |  | |  | | |',
  '  _|_|__|_|__|_|_|_',
  ' [_________________]',
];
