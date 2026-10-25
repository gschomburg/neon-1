// NeoN+1 corps/dewey.js
'use strict';
NEON_FILES.push(['corps/dewey.js', 'v13.15']);
// Its boss mod: INDEX (index), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
MUSIC_FOR.dewey = 'hollow';   // HOLLOW (in data/music.js)

// ---- the corp
CORPS.dewey = {
  key: 'dewey', name: 'DEWEY SYSTEMS', code: 'DW', level: 2,
  intel: '"shhh."',
  tell: null, nodes: 1,   // a section needs 2+ books to show
  bossDesc: 'boss: digits swapped.',
  mods: ['index'],
  // Call numbers, shelved in order across the grid. The real node is MISFILED: it belongs
  // to another section. Tier 1: another hundred (300s among 600s). Deeper: the same
  // hundred, another ten (64x among 61x). Boss: two digits swapped (631 among 613s).
  dress(lv, k) {
    const r = k.r, list = k.tiles.slice().sort((a, b) => a.cell - b.cell);
    const hund = randInt(r, 1, 8), ten = randInt(r, 0, 9), one = randInt(r, 0, 9);
    const used = new Set();
    const pick = f => { for (let i = 0; i < 300; i++) { const v = f(); if (!used.has(v)) { used.add(v); return v; } } return f(); };
    const base = k.boss ? hund * 1000 + ten * 100 + one * 10 : k.tier >= 2 ? hund * 1000 + ten * 100 : hund * 1000;
    const span = k.boss ? 10 : k.tier >= 2 ? 100 : 1000;
    const decoy = () => base + randInt(r, 0, span - 1);
    let realV;
    if (k.boss) { const sw = one === ten ? (one + 3) % 10 : one; realV = hund * 1000 + sw * 100 + ten * 10 + randInt(r, 0, 9); }
    else if (k.tier >= 2) realV = hund * 1000 + ((ten + randInt(r, 2, 7)) % 10) * 100 + randInt(r, 0, 99);
    else realV = ((hund + randInt(r, 2, 6)) % 9 + 1) * 1000 + randInt(r, 0, 999);
    const vals = list.map(t => t === k.tellTile ? realV : pick(decoy));
    // the decoys are shelved in order; the misfit stays where it is
    const dec = vals.filter((v, i) => list[i] !== k.tellTile).sort((a, b) => a - b);
    let j = 0;
    list.forEach((t, i) => { const v = t === k.tellTile ? realV : dec[j++]; t.glyph = normMotif(['| | |', (v / 10).toFixed(1), '-----']); });
  },
};

// the codex, once you've beaten it
CORP_TELL.dewey = "the real node is misfiled: its call number is from another section. tier 1: another hundred (300s among 600s). deeper: another ten. boss: two digits swapped.";

// intro art
CORP_ART.dewey = [
  " |=||#||=|| ||=|",
  " | || || || || |",
  " |_||_||_||_||_|",
  " ===============",
  "   DEWEY  SYS",
];
