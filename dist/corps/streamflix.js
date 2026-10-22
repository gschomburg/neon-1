// NeoN+1 corps/streamflix.js
'use strict';
NEON_FILES.push(['corps/streamflix.js', 'v12.00']);
CORPS.streamflix = {
  key: 'streamflix', name: 'STREAMFLIX', letter: '=', level: 3,
  intel: '"are you still watching?"',
  tell: null,
  bossDesc: 'boss: buffering... buffering...',
  mods: ['freezeframe'],
  // Every node is playing (a playhead runs along its bottom line). Every few seconds the
  // screen buffers and everything freezes, except the live node: that's the real one.
  dress(lv, k) {
    const r = k.r;
    k.tiles.forEach(t => { t.ph = Math.floor(r() * 5000); t.spd = 300 + Math.floor(r() * 220); t.glyph = normMotif([t.glyph[0], t.glyph[1], '-----']); });
    k.tellTile.tell = true;
    lv.buffer = { every: k.boss ? 2000 : 2600, len: k.boss ? 340 : k.tier >= 2 ? 440 : 600, ph: Math.floor(r() * 2000) };
  },
  bufferAt(lv, now) {
    const b = lv.buffer;
    if (!b) return null;
    const p = (now + b.ph) % b.every;
    return p < b.len ? now - p : null;
  },
  fx(t, ft) {
    const pos = Math.floor((ft + t.ph) / t.spd) % 5;
    return { line: [2, '-----'.slice(0, pos) + 'o' + '-----'.slice(pos + 1)] };
  },
  hint(lv, now) {
    if (!lv.buffer) return null;
    return this.bufferAt(lv, now) != null ? { text: `buffering ${'|/-\\'[Math.floor(now / 90) % 4]}`, col: C.accent } : { text: '> now playing', col: C.mid };
  },
};

// the codex, once you've beaten it
CORP_TELL.streamflix = "every node is playing. when the screen buffers, everything freezes except the live node: the real one.";

// intro art
CORP_ART.streamflix = [
  "  .-------------.",
  "  |   |\\        |",
  "  |   | >       |",
  "  |   |/        |",
  "  '-------------'",
  "   S T R E A M F L I X",
];
