// NeoN+1 corps/channel9.js
'use strict';
NEON_FILES.push(['corps/channel9.js', 'v12.02']);
// Its boss mod: REMOTE (remote), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.snow = { name: 'SNOW',           bpm: 96,  root: 44, scale: 'minor',    prog: [0, 6, 5, 4], bass: 'pulse',   drums: 'half',  arp: 'mirror', echo: 0.45, feedback: 0.4 };
MUSIC_FOR.channel9 = 'snow';

// ---- the corp
CORPS.channel9 = {
  key: 'channel9', name: 'CHANNEL 9', letter: '9', level: 3,
  intel: '"stay tuned."',
  tell: null, timer: 14, pay: 1.3,
  bossDesc: 'boss: more channels.',
  rules: () => '14s clock. CH+ costs 1s. pays x1.3',
  mods: ['remote'],
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

// intro art
CORP_ART.channel9 = [
  "   \\    /",
  "  .-\\--/-----.",
  "  |  .::.:. 9|",
  "  | .:.:.::  |",
  "  '----------'",
  "  CHANNEL 9",
];
