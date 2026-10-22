// NeoN+1 corps/lexicon.js
'use strict';
NEON_FILES.push(['corps/lexicon.js', 'v13.01']);
// Its boss mod: SPELLBOUND (spellbound), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const LEX_WORDS = {
  animal: ['TIGER', 'HORSE', 'MOUSE', 'SNAKE', 'EAGLE', 'SHARK', 'ZEBRA', 'OTTER', 'CAMEL'],
  tech: ['PIXEL', 'LASER', 'ROBOT', 'MODEM', 'CABLE', 'CACHE', 'PROXY', 'VIRUS', 'TOKEN', 'LOGIC'],
  food: ['PIZZA', 'BREAD', 'MANGO', 'LEMON', 'SUSHI', 'TACOS', 'CANDY', 'BACON'],
  color: ['GREEN', 'BLACK', 'WHITE', 'AMBER', 'CORAL', 'IVORY', 'OLIVE'],
};
const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWY';

// ---- its music
SONGS.typeset = { name: 'TYPESET',        bpm: 100, root: 48, scale: 'minor',    prog: [0, 3, 6, 5], bass: 'march',   drums: 'four',  arp: 'up' };
MUSIC_FOR.lexicon = 'typeset';

// ---- the corp
CORPS.lexicon = {
  key: 'lexicon', name: 'LEXICON', code: 'LX', level: 3,
  intel: '"in the beginning was the word."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: the last letter.',
  mods: ['spellbound'],
  // A 5-letter word, one letter per layer. The real node carries the next letter; the
  // hint shows the category and the letters so far. Decoys are other letters.
  dress(lv, k) {
    const r = k.r, cr = k.corpR;
    const cat = pickR(Object.keys(LEX_WORDS), cr), word = pickR(LEX_WORDS[cat], cr);
    const i = clamp(k.idx, 0, 4), want = word[i];
    const pool = shuffle([...LETTERS].filter(ch => ch !== want), r);
    k.tiles.forEach((t, j) => { t.glyph = normMotif(['.-.', `|${t === k.real ? want : pool[j % pool.length]}|`, "'-'"]); });
    lv.word = { cat, shown: word.slice(0, i).split('').concat(Array(5 - i).fill('_')).join(' ') };
  },
  hint: lv => lv.word ? { text: `${lv.word.cat}> ${lv.word.shown}`, col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.lexicon = "a 5-letter word, one letter per layer. the hint shows the category and the letters so far. the real node is the next letter.";

// intro art
CORP_ART.lexicon = [
  "  .-.-.-.-.-.",
  "  |L|E|X|I|C|",
  "  '-'-'-'-'-'",
  "  |O|N|",
  "  '-'-'",
];
