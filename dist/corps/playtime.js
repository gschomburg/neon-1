// NeoN+1 corps/playtime.js
'use strict';
NEON_FILES.push(['corps/playtime.js', 'v13.73']);
// Its boss mod: JACK-IN-THE-BOX (jackbox), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const TOY_GLYPHS = [
  [' _|_ ', '(___)', '  V  '], ['[o_o]', ' /|\\ ', ' / \\ '], [' \\o/ ', ' |_| ', '[___]'], [' .-. ', '( o )', " '-' "],
  ['  __ ', '<(o )', '(___)'], ['  __ ', '_/__\\', '-o--o'], ['+---+', '| A |', '+---+'], [' (@) ', '  |  ', '  |  '],
  ['_[]_ ', '|___|', 'o-o-o'], ['  /\\ ', ' <  >', '  \\/ '], ['()_()', '(o.o)', '(___)'], ['  |  ', '-(+)-', '  |  '],
].map(normMotif);

// ---- its music
// Made from ANTHEM: the same band, its own tune.
SONGS.winditup = { name: 'WIND IT UP', from: 'anthem', bpm: 132, root: 48, scale: 'major', prog: [0, 3, 4, 0], kit: 'break', pump: 0, padVoice: 'organ', echo: 0.3,
  beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
  bassVoice: 'picked', bassLine: '0 . 0 . 0 . 0 . 0 . 0 . 4 . 4 .',
  melody: ['4 - - - 4 - 5 - 7 - - - 4 - - -', '5 - - - 5 - 4 - 3 - - - 1 - - -', '2 - - - 2 - 3 - 4 - - - 7 - - -', '4 - - - - - - - . . . . . . . .'],
  leadVoice: 'bell', arpVoice: 'chip', arp: 'updown' };
MUSIC_FOR.playtime = 'lookbehind';   // LOOK BEHIND YOU (in data/music.js; the user, 2026-10-25). Its own track above is unused now.

// ---- the corp
CORPS.playtime = {
  key: 'playtime', name: 'PLAYTIME', code: 'PT', level: 1,
  intel: '"wind it up and watch it go!"',
  tell: null,
  bossDesc: 'boss: the spring is almost out.',
  mods: ['jackbox'],
  // The real toy is wound up: it hops now and then. Deeper: the decoys rattle in place
  // (they never leave the ground). Boss: rare, small hops.
  dress(lv, k) {
    const r = k.r, deck = shuffle(TOY_GLYPHS.slice(), r);
    k.tiles.forEach((t, i) => { t.glyph = deck[i % deck.length]; t.ph = Math.floor(r() * 5000); });
    k.tellTile.tell = true;
    lv.hop = { every: k.boss ? 4200 : k.tier >= 2 ? 3000 : 2200, h: k.boss ? 0.25 : 0.45, wob: k.tier >= 2 || k.boss };
  },
  fx(t, ft, lv) {
    const h = lv.hop;
    if (!h) return null;
    const p = (ft + t.ph) % h.every;
    if (t.tell) return p < 260 ? { dy: -h.h * Math.sin(p / 260 * Math.PI) } : null;
    if (h.wob && p < 300) return { dx: 0.12 * Math.sin(p / 300 * Math.PI * 4) };
    return null;
  },
};

// the codex, once you've beaten it
CORP_TELL.playtime = "the real toy is wound up: it hops now and then. deeper, decoys rattle in place, but they never leave the ground.";
