// NeoN+1 corps/chuckecache.js
'use strict';
NEON_FILES.push(['corps/chuckecache.js', 'v13.76']);
// Its boss mod: CONTINUE? (continue), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// CHUCK E. CACHE'S sprites.
const ARCADE_GLYPHS = [[' .-. ', '(o o)', '|^^^|'], ['/oo\\', '<-->', ' /\\ '], [' ^ ^ ', '(@ @)', ' >-< '], ['[- -]', '|ooo|', ' | | '], ['  o  ', ' /|\\ ', ' / \\ '], [' _ _ ', '(*_*)', '/   \\'], ['.-=-.', '|o o|', "'-=-'"], ['<o o>', ' \\_/ ', ' / \\ ']].map(normMotif);

// ---- its music
SONGS.insertcoin = { name: 'INSERT COIN',    bpm: 140, root: 52, scale: 'major',    prog: [0, 5, 3, 4], bass: 'gallop',  drums: 'four',  arp: 'updown', tick: true };
MUSIC_FOR.chuckecache = 'insertcoin';

// ---- the corp
CORPS.chuckecache = {
  key: 'chuckecache', name: "CHUCK E. CACHE'S", code: 'CE', level: 3,
  intel: '"where a hacker can be a kid!"',
  tell: null, tickets: true,
  bossDesc: 'boss: the score runs fast.',
  rules: () => `pays in tickets: x${ECON.corps.chuckecacheTicket} at the end.`,
  mods: ['continue'],
  // Arcade. A score counter ticks on the hint row; the real node is the 1UP: it blinks on
  // every tick. Decoys blink at random (deeper: on ticks too, but they skip some). Pay comes
  // in tickets, cashed in at x1.5 when you beat the corp (lost if you die).
  dress(lv, k) {
    const r = k.r, deck = shuffle(ARCADE_GLYPHS.slice(), r);
    k.tiles.forEach((t, i) => { t.glyph = deck[i % deck.length]; t.noise = r() * 100; });
    k.tellTile.tell = true;
    lv.score = { per: k.boss ? 320 : 450, skip: k.tier >= 2 || k.boss, base: randInt(r, 10, 90) * 10 };
  },
  fx(t, ft, lv) {
    const sc = lv.score;
    if (!sc || lv.shownAt == null) return null;
    const e = ft - lv.shownAt, tick = Math.floor(e / sc.per), on = e % sc.per < 140;
    if (t.tell) return on ? { bright: true } : null;
    if (sc.skip) return on && h01(t.noise, tick) < 0.6 ? { bright: true } : null;
    return h01(t.noise, Math.floor(e / 140)) < 0.12 ? { bright: true } : null;
  },
  hint(lv, now) {
    const sc = lv.score;
    if (!sc || lv.shownAt == null) return null;
    const tick = Math.floor((now - lv.shownAt) / sc.per), c = st.corp;
    return { text: `SCORE ${String(sc.base + tick * 10).padStart(6, '0')}  tix ${c.tickets || 0}`, col: C.accent };
  },
  onClear(c) {
    const tix = c.tickets || 0;
    if (!tix) return null;
    const cr = Math.round(tix * ECON.corps.chuckecacheTicket);
    st.run.credits += cr; st.run.earned += cr;
    return { text: `> prize counter: ${tix} tickets = ${cr}cr!`, col: C.money };
  },
};

// the codex, once you've beaten it
CORP_TELL.chuckecache = "the real node is the 1UP: it blinks on every tick of the score. decoys blink at random (deeper, on ticks too, but they skip some). pay comes in tickets, x1.5 at the prize counter when you beat the corp.";
