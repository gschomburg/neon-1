// NeoN+1 corps/forgetmenot.js
'use strict';
NEON_FILES.push(['corps/forgetmenot.js', 'v12.00']);
CORPS.forgetmenot = {
  key: 'forgetmenot', name: 'FORGET-ME-NOT', letter: 'V', level: 3,
  intel: '"you were here before. remember?"',
  tell: null, maskMs: 2000,
  bossDesc: 'boss: one second to look.',
  mods: ['photographic'],
  // The glyphs show for 2 seconds (deeper 1.5, boss 1), then every node turns face down.
  // Then the hint shows the real node's glyph: remember where it was.
  dress(lv, k) {
    lv.memGlyph = k.tellTile.glyph;
    lv.maskMs = k.boss ? 1000 : k.tier >= 2 ? 1500 : 2000;
  },
  hint(lv, now) {
    if (!lv.memGlyph || !lv.maskAt || now < lv.maskAt) return lv.maskAt ? { text: 'memorize the board...', col: C.mid } : null;
    return { text: `remember> ${glyphLine(lv.memGlyph)}`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.forgetmenot = "look fast: the glyphs turn face down after 2 seconds (deeper 1.5, boss 1). then the hint shows the real node's glyph.";

// intro art
CORP_ART.forgetmenot = [
  "     .-.  .-.",
  "    ( * )( * )",
  "     '-'()'-'",
  "       |  |",
  "     .-'  '-.",
  "   forget-me-not",
];
