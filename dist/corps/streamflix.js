// NeoN+1 corps/streamflix.js
'use strict';
NEON_FILES.push(['corps/streamflix.js', 'v13.77']);
// Its boss reward: FREEZE gear x3 (freeze), defined with the gear in data/mods.js (ITEMS),
// its effect in engine/active.js.

// ---- its music
// Made from NIGHT DRIVE: the same band, its own tune.
SONGS.stillwatching = { name: 'STILL WATCHING', from: 'nightdrive', bpm: 84, root: 46, scale: 'minor', prog: [0, 6, 5, 6], sevenths: true, padVoice: 'glass', echo: 0.45,
  beat: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.' },
  bassLine: '0 - - - - - - - 0 - - - 0 - 0 -',
  melody: ['2 - - - - - 0 - -1 - - - 0 - - -', '4 - - - - - - - . . . . . . . .', '2 - - - - - 4 - 5 - - - 4 - - -', '2 - - - - - - - . . . . . . . .'],
  leadVoice: 'keys' };
MUSIC_FOR.streamflix = 'stillwatching';

// ---- the corp
CORPS.streamflix = {
  key: 'streamflix', name: 'STREAMFLIX', code: 'SF', level: 3,
  intel: '"are you still watching?"',
  tell: null,
  bossDesc: 'boss: buffering... buffering...',
  gear: { key: 'freeze', n: 3 },   // its boss reward: a stack of gear
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
