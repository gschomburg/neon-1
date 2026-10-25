// NeoN+1 corps/kernel.js
'use strict';
NEON_FILES.push(['corps/kernel.js', 'v13.20']);
// Its boss mod: SEED READER (seedreader), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
MUSIC_FOR.kernel = 'lightcycle';   // LIGHT CYCLE (in data/music.js)

// ---- the corp
CORPS.kernel = {
  key: 'kernel', name: 'KERNEL', code: 'KR', level: 3,
  intel: '"the seed knows."',
  tell: null,
  bossDesc: 'boss: two characters lit.',
  mods: ['seedreader'],
  // The run seed is the clue. The hint shows the seed with one character lit (boss:
  // two); the real node's glyph has it (them), decoys have other seed characters.
  dress(lv, k) {
    const r = k.r;
    let chars = [...new Set(cleanSeed(k.seed))];
    if (chars.length < 4) chars = [...new Set(chars.concat([...'KERNL7']))];
    const lit = shuffle(chars.slice(), r).slice(0, k.boss ? 2 : 1);
    const rest = chars.filter(ch => !lit.includes(ch));
    const g3 = cs => normMotif([`${cs[0]} . ${cs[1]}`, ' . . ', `${cs[2]} . ${cs[3] || '.'}`]);
    for (const t of k.tiles) {
      const cs = shuffle(rest.slice(), r).slice(0, 4);
      while (cs.length < 4) cs.push('.');
      if (t === k.tellTile) lit.forEach((ch, j) => { cs[j * 2] = ch; });
      t.glyph = g3(shuffle(cs, r));
    }
    const seed = cleanSeed(k.seed);
    lv.seedShow = [...seed].map(ch => lit.includes(ch) ? `[${ch}]` : ch).join(seed.length > 10 ? '' : ' ');
  },
  hint: lv => lv.seedShow ? { text: `seed> ${lv.seedShow}`, col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.kernel = "the hint lights a character of your seed. the real node has it; decoys have other seed characters. boss: two lit, the real node has both.";

// intro art
CORP_ART.kernel = [
  "   ___________",
  "  | > kernel  |",
  "  | 0x1F 0x2A |",
  "  | seed: ??? |",
  "  '-----------'",
];
