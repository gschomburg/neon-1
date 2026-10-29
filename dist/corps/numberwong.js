// NeoN+1 corps/numberwong.js
'use strict';
NEON_FILES.push(['corps/numberwong.js', 'v13.76']);
// Its boss mod: PENCIL MARKS (pencil), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const IS_PRIME = v => { if (v < 2) return false; for (let d = 2; d * d <= v; d++) if (v % d === 0) return false; return true; };

// ---- its music
// Made from ANTHEM: the same band, its own tune.
SONGS.thatsnumberwong = { name: "THAT'S NUMBERWONG", from: 'anthem', bpm: 140, root: 43, scale: 'major', prog: [0, 5, 1, 4], kit: 'break', pump: 0, padVoice: 'organ', echo: 0.3,
  beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
  bassVoice: 'picked', bassLine: '0 . 0 . 4 . 0 . 0 . 0 . 4 . 0 .',
  melody: ['7 . 4 . 7 . 4 . 8 - 7 - 4 - . .', '5 . 3 . 5 . 3 . 6 - 5 - 3 - . .', '4 . 2 . 4 . 2 . 5 - 4 - 2 - . .', '0 - 4 - 7 - - - . . 14 - - - . .'],
  leadVoice: 'chip', arpVoice: 'bell', arp: 'updown' };
MUSIC_FOR.numberwong = 'thatsnumberwong';

// ---- the corp
CORPS.numberwong = {
  key: 'numberwong', name: 'NUMBERWONG', code: 'NW', level: 4,
  intel: '"that\'s numberwong!"',
  tell: null,
  bossDesc: 'boss: only prime. no easy outs.',
  mods: ['pencil'],
  // Every node is a number. Tier 1: the only prime. Deeper: the only one that isn't a
  // multiple of 3. Boss: the only prime, and every decoy is odd and doesn't end in 5.
  dress(lv, k) {
    const r = k.r, used = new Set();
    const num = ok => { for (let i = 0; i < 500; i++) { const v = randInt(r, 10, 99); if (!used.has(v) && ok(v)) { used.add(v); return v; } } return 0; };
    const deep = k.tier >= 2 && !k.boss;
    for (const t of k.tiles) {
      const real = t === k.tellTile;
      const v = deep ? num(x => real ? x % 3 !== 0 : x % 3 === 0)
        : k.boss ? num(x => real ? IS_PRIME(x) : !IS_PRIME(x) && x % 2 === 1 && x % 5 !== 0)
        : num(x => real ? IS_PRIME(x) : !IS_PRIME(x));
      t.glyph = normMotif(['', `[${v}]`, '']);
    }
  },
  onHit() { setMsg("> that's numberwong!", C.danger); },
};

// the codex, once you've beaten it
CORP_TELL.numberwong = "tier 1: the only prime. deeper: the only number that is not a multiple of 3. boss: the only prime, and no decoy is even or ends in 5.";
