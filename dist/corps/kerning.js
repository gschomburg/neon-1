// NeoN+1 corps/kerning.js
'use strict';
NEON_FILES.push(['corps/kerning.js', 'v13.18']);
// Its boss mod: PIXEL PEEP (pixelpeep), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from DEADPAN: the same band, its own tune.
SONGS.sans = { name: 'SANS', from: 'deadpan', bpm: 128, root: 43, scale: 'minor', prog: [0, 3, 0, 4], kit: '808', pump: 0.3, gate: 'xx.xx.xx.xx.xx.x',
  beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.' },
  bassVoice: 'pluck', bassLine: '0 . 0 7 . 0 0 . 0 . 0 7 . 0 3 .',
  melody: ['4 . . . 4 . . . 3 . 4 . . . . .', '4 . . . 4 . . . 5 . 4 . . . . .', '2 . . . 2 . . . 1 . 2 . . . . .', '3 . . . 2 . . . 1 . 0 . . . . .'],
  leadVoice: 'saw', arpVoice: 'chip', arpLine: '. . . . 0 . . . . . . . 3 . . .' };
MUSIC_FOR.kerning = 'sans';

// ---- the corp
CORPS.kerning = {
  key: 'kerning', name: 'KERNING', code: 'KN', level: 3,
  intel: '"everything in place. EVERYTHING."',
  tell: null,
  bossDesc: 'boss: "we fixed it. ALL of it."',
  mods: ['pixelpeep'],
  // KERNING's whole board has OCD about pixels. One character of the real node is drawn
  // a few pixels off; it gets subtler every layer. Boss: every decoy has one character
  // off, and the real node is the only one that's aligned.
  dress(lv, k) {
    const r = k.r, px = k.boss ? 2.5 : (k.tier >= 2 ? [2.5, 2, 1.5] : [3, 2.5, 2])[k.idx] || 1.5;
    const kern = t => {
      const spots = [];
      t.glyph.forEach((l, y) => [...l].forEach((ch, x) => { if (ch !== ' ') spots.push([y, x]); }));
      if (!spots.length) return null;
      const [ln, x] = pickR(spots, r), across = r() < 0.5, sg = r() < 0.5 ? -1 : 1;
      return { ln, x, px: across ? sg * px : 0, py: across ? 0 : sg * px };
    };
    if (k.boss) k.tiles.forEach(t => { if (t !== k.tellTile) t.kern = kern(t); });
    else k.tellTile.kern = kern(k.tellTile);
    k.tellTile.tell = true;
  },
  fx: t => t.kern ? { kern: t.kern } : null,
};

// the codex, once you've beaten it
CORP_TELL.kerning = "KERNING's whole board has OCD about pixels. one character of the real node is a pixel or two off, and once you see it you can't unsee it. boss: every decoy is off; the real node is the aligned one.";

// intro art
CORP_ART.kerning = [
  "  K E R N I N G",
  "  K  E R  N I N G",
  "  KE R N IN G",
  "  K E R N I N G",
  "    fixed. FIXED.",
];
