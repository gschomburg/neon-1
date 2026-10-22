// NeoN+1 corps/seekr.js
'use strict';
NEON_FILES.push(['corps/seekr.js', 'v12.16']);
// Its boss mod: AUTOCOMPLETE (autocomplete), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.query = { name: 'QUERY',          bpm: 110, root: 47, scale: 'dorian',   prog: [0, 4, 5, 3], bass: 'offbeat', drums: 'four',  arp: 'updown' };
MUSIC_FOR.seekr = 'query';

// ---- the corp
CORPS.seekr = {
  key: 'seekr', name: 'SEEKR', code: 'SK', level: 1,
  intel: '"did you mean: give up?"',
  tell: null,
  bossDesc: 'boss: did you mean...?',
  mods: ['autocomplete'],
  // The search bar autocompletes the real node's glyph. Deeper: one line is blanked.
  // Boss: "did you mean", with one line swapped for a decoy's.
  dress(lv, k) {
    const g = k.tellTile.glyph.slice(), r = k.r;
    let shown = g.slice(), label = 'seekr>';
    if (k.boss) {
      const others = k.tiles.filter(t => t !== k.tellTile);
      if (others.length) { const y = randInt(r, 0, 2), o = pickR(others, r); shown[y] = o.glyph[y]; }
      label = 'did you mean';
    } else if (k.tier >= 2) shown[randInt(r, 0, 2)] = '?????';
    lv.search = { label, lines: shown };
  },
  hint(lv, now) {
    const s = lv.search; if (!s) return null;
    lv.hintAt = lv.hintAt || now;
    const full = `${s.label} ${glyphLine(s.lines)}`;
    const n = Math.floor((now - lv.hintAt) / 35);
    const caret = n < full.length || Math.floor(now / 400) % 2 ? '_' : ' ';
    return { text: full.slice(0, n) + caret, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.seekr = "the search bar autocompletes the real node's glyph. deeper: one line is missing. boss: \"did you mean\", and one line is a decoy's.";

// intro art
CORP_ART.seekr = [
  '      .-----.',
  '     /  ? ?  \\',
  '    |   ???   |',
  '     \\  ? ?  /',
  "      '-----'\\",
  '              \\\\',
  '               \\\\',
];
