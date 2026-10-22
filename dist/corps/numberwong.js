// NeoN+1 corps/numberwong.js
'use strict';
NEON_FILES.push(['corps/numberwong.js', 'v12.11']);
// Its boss mod: PENCIL MARKS (pencil), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const IS_PRIME = v => { if (v < 2) return false; for (let d = 2; d * d <= v; d++) if (v % d === 0) return false; return true; };

// ---- its music
SONGS.numberwong = { name: 'NUMBERWONG',     bpm: 132, root: 50, scale: 'harmonic', prog: [0, 5, 4, 0], bass: 'gallop',  drums: 'heavy', arp: 'updown', tick: true };
MUSIC_FOR.numberwong = 'numberwong';

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

// intro art
CORP_ART.numberwong = [
  " .---. .---. .---.",
  " | 7 | |13 | |42 |",
  " '---' '---' '---'",
  "   N U M B E R",
  "     W O N G",
];
