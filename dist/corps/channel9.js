// NeoN+1 corps/channel9.js
'use strict';
NEON_FILES.push(['corps/channel9.js', 'v13.90']);
// Its boss reward: REMOTE gear x3 (remote), defined with the gear in data/mods.js (ITEMS),
// its effect in engine/active.js.

// ---- its music
// Made from DROP ZONE: the same band, its own tune.
SONGS.breaking = { name: 'BREAKING', from: 'dropzone', bpm: 140, root: 38, scale: 'minor', prog: [0, 5, 6, 4], kit: '808', pump: 0.4, padVoice: 'choir', breakdown: 4,
  beat: { kick: 'x.........x.....', snare: '........x.......', hat: 'x.x.x.x.x.xxx.x.', open: '..............x.' },
  bassVoice: 'acid', bassLine: '0 0 . 0 0 . 0 0 3 3 . 3 6 6 . 6',
  melody: ['. . . . . . . . 7 - - - 7 - 9 -', '. . . . . . . . 7 - 6 - 4 - - -'],
  leadVoice: 'brass', stab: 'x.......x.......', stabVoice: 'brass', stabAt: 3, arpVoice: 'chip', arpLine: '. . . . . . . . . . . . 3 4 5 4' };
MUSIC_FOR.channel9 = 'velvetrope';   // VELVET ROPE (in data/music.js; the user, 2026-10-25). Its own track above is unused now.

// ---- the corp
CORPS.channel9 = {
  key: 'channel9', name: 'CHANNEL 9', code: 'CN', level: 3,
  intel: '"stay tuned."',
  tell: null, timer: 14, pay: 1.3,
  bossDesc: 'boss: more channels.',
  rules: () => '14s clock. CH+ costs 1s. pays x1.3',
  gear: { key: 'remote', n: 3 },   // its boss reward: a stack of gear
  // Static over every node. Flip the channel (CH+, 1s of clock each): on one channel the
  // real node comes in clear. Every flip re-rolls the pictures. Deeper and the boss:
  // more channels.
  dress(lv, k) {
    const r = k.r, n = k.boss ? 5 : k.tier >= 2 ? 4 : 3;
    lv.tv = { n, ch: 0, good: randInt(r, 1, n - 1), seed: r() * 1000, real: k.tellTile };
    k.tellTile.tell = true;
  },
  fx(t, ft, lv) {
    const tv = lv.tv;
    if (!tv) return null;
    if (t === tv.real && tv.ch === tv.good) return null;
    const slot = Math.floor(ft / 90);
    return { glyph: t.glyph.map((l, y) => [...l].map((ch, x) => h01(tv.seed + t.cell * 7 + y * 3 + x, slot) < 0.5 ? noiseCh() : ch).join('')), gc: C.mid };
  },
  hint(lv) { return lv.tv ? { text: `tv> CH ${lv.tv.ch + 2}${lv.tv.ch === lv.tv.good ? '  *clear*' : '  ~static~'}`, col: C.accent } : null; },
  action(lv) {
    const tv = lv.tv;
    if (!tv) return null;
    return { label: 'CH+ 1s', ok: !!st.timer && st.timer.left > 1.5, use() {
      tv.ch = (tv.ch + 1) % tv.n;
      st.timer.left -= 1;
      const r = rngFor(st.run.seed, 'ch9', st.corp.node.id, st.corp.idx, tv.ch, (lv.flips = (lv.flips || 0) + 1));
      const deck = shuffle(MOTIFS.slice(), r);
      lv.tiles.forEach((t, i) => { if (t.state === 'closed' && !t.loaded) t.glyph = deck[i % deck.length]; });
      Sound.ui();
    } };
  },
};

// the codex, once you've beaten it
CORP_TELL.channel9 = "static on every node. flip the channel (1s each): on one channel the real node comes in clear.";
