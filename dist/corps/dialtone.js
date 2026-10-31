// NeoN+1 corps/dialtone.js
'use strict';
NEON_FILES.push(['corps/dialtone.js', 'v13.91']);
// Its boss mod: HANDSHAKE (handshake), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from TRACKER: the same band, its own tune.
SONGS.handshake56k = { name: 'HANDSHAKE 56K', from: 'tracker', bpm: 128, root: 45, scale: 'minor', prog: [0, 3, 4, 0], kit: 'chip', drums: 'break', pump: 0.4, padVoice: 'none',
  bassVoice: 'sub', bassLine: '0 . . 0 . . 0 . . . 0 . 4 . . .', stab: 'x..x....x..x....', stabVoice: 'vox',
  melody: ['0 . 4 . 7 . 4 . 9 . 7 . 4 . 2 .', '3 . 5 . 8 . 5 . 10 . 8 . 5 . 3 .', '4 . 6 . 9 . 6 . 11 . 9 . 6 . 4 .', '7 . . . 6 . . . 4 . . . 2 . . .'],
  leadVoice: 'chip', arpVoice: 'chip', arp: 'up' };
MUSIC_FOR.dialtone = 'handshake56k';

// ---- the corp
// ---- Tier 2, group 3: sound tells (each also shows on the hint row, for muted players).
CORPS.dialtone = {
  key: 'dialtone', name: 'DIALTONE ONLINE', code: 'DT', level: 2,
  intel: '"welcome! you\'ve got ICE!"',
  tell: null,
  bossDesc: 'boss: it counts from the end.',
  mods: ['handshake'],
  // The modem screeches, then beeps: the count is the real node's place in reading order
  // (1 = top left, $ nodes count too). Dots on the hint row. Deeper: faster beeps. Boss:
  // counted from the end.
  dress(lv, k) {
    const order = lv.tiles.slice().sort((a, b) => a.cell - b.cell), pos = order.indexOf(k.tellTile);
    lv.dial = { count: k.boss ? order.length - pos : pos + 1, gap: k.tier >= 2 || k.boss ? 260 : 380, start: 900, done: 0 };
    k.tellTile.tell = true;
  },
  tick(lv, lt) {
    const d = lv.dial;
    if (!d) return;
    if (!d.screech) { d.screech = true; Sound.modem(); }
    while (d.done < d.count && lt >= d.start + d.done * d.gap) { d.done++; Sound.beep(); }
  },
  hint(lv) {
    const d = lv.dial;
    if (!d) return null;
    return { text: `connect> ${'o'.repeat(d.done)}${d.done < d.count ? '...' : ` = ${d.count}${lv.boss ? ' from end' : ''}`}`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.dialtone = "the modem screeches, then beeps: the count is the real node's place in reading order (1 = top left; $ nodes count too). dots on the hint row. boss: counted from the end.";
