// NeoN+1 corps/spectra.js
'use strict';
NEON_FILES.push(['corps/spectra.js', 'v13.26']);
// Its boss mod: PRISM (prism), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// SPECTRA's colors, each with its own shape.
const RAINBOW = [
  { n: 'red', c: '#ff4a4a', ch: '#' }, { n: 'orange', c: '#ff9a2a', ch: '%' }, { n: 'yellow', c: '#ffe84a', ch: '*' },
  { n: 'green', c: '#4aff6a', ch: '+' }, { n: 'blue', c: '#4ab0ff', ch: '=' }, { n: 'violet', c: '#c86aff', ch: '~' },
];

// ---- its music
// Made from SLOW TIDE: the same band, its own tune.
SONGS.lightleak = { name: 'LIGHT LEAK', from: 'slowtide', bpm: 88, root: 49, scale: 'major', prog: [0, 3, 5, 4], kit: 'break', pump: 0, swing: 0.1, padVoice: 'glass', echo: 0.45, feedback: 0.45,
  beat: { kick: 'x.......x.x.....', snare: '....x.......x...', ghost: '.......x.....x..', hat: '..x...x...x...x.' },
  bassVoice: 'sub', bassLine: '0 - - - - - - - 4 - - - - - - -',
  melody: ['. . . . 4 - - - 2 - . . 4 - - -', '. . . . 5 - - - 4 - . . 2 - - -', '. . . . 7 - - - 5 - . . 4 - - -', '. . . . 4 - - - 1 - - - . . . .'],
  melodyAt: 0, melodyOct: -1, leadVoice: 'keys', arpVoice: 'bell', arpLine: '0 . 2 . 4 . 5 . 4 . 2 . 1 . 2 .' };
MUSIC_FOR.spectra = 'lightleak';

// ---- the corp
// ---- Tier 2, group 6: node colors (each color also has its own shape, for color-blind
// players).
CORPS.spectra = {
  key: 'spectra', name: 'SPECTRA', code: 'SP', level: 3,
  intel: '"we see what you can\'t."',
  tell: null,
  bossDesc: 'boss: the spectrum runs backwards.',
  mods: ['prism'],
  // Every node is the same block, in a color (and shape). First layer: the odd color out (every
  // other color shows up at least twice). After that, the colors run in order (red, orange,
  // yellow, green, blue, violet): the real node is the color after the last real one.
  // Boss: the order runs backwards.
  dress(lv, k) {
    const r = k.r, q = k.tellTile, D = k.tiles.filter(t => t !== q);
    const prev = k.carry && k.carry.spec != null ? k.carry.spec : null;
    let realC;
    if (prev == null || (k.tier < 2 && !k.boss && D.length >= 2)) {
      realC = randInt(r, 0, RAINBOW.length - 1);
      const pool = shuffle([...Array(RAINBOW.length).keys()].filter(c => c !== realC), r);
      const m = Math.max(1, Math.floor(D.length / 2));
      shuffle(D, r).forEach((t, i) => { t.spec = pool[i % m]; });
      lv.specMode = D.length >= 2 ? 'odd' : 'start';
    } else {
      realC = (prev + (k.boss ? RAINBOW.length - 1 : 1)) % RAINBOW.length;
      D.forEach(t => { t.spec = pickR([...Array(RAINBOW.length).keys()].filter(c => c !== realC), r); });
      lv.specMode = 'seq';
    }
    q.spec = realC;
    lv.specPrev = prev; lv.specReal = realC;
    k.tiles.forEach(t => { const ch = RAINBOW[t.spec].ch; t.glyph = normMotif([ch.repeat(3), ch.repeat(3), ch.repeat(3)]); });
    lv.carryNext = { spec: realC };
    q.tell = true;
  },
  fx: t => t.spec != null ? { gc: RAINBOW[t.spec].c } : null,
  hint(lv) {
    if (!lv.specMode) return null;
    if (lv.specMode === 'odd') return { text: 'spectrum> the odd one out', col: C.accent };
    if (lv.specMode === 'start') return { text: `spectrum> start: ${RAINBOW[lv.specReal].n}`, col: C.accent };
    return { text: `spectrum> last: ${RAINBOW[lv.specPrev].n} ${lv.boss ? '<<' : '>>'}`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.spectra = "first layer: the odd color out (every other color shows up twice or more). then the colors run in order (red, orange, yellow, green, blue, violet): the real node is the color after the last real one. each color has its own shape. boss: backwards.";

// intro art
CORP_ART.spectra = [
  "        /\\",
  "   ----/  \\ ===",
  "      /    \\ ~~~",
  "     '------' ###",
  "   S P E C T R A",
];
