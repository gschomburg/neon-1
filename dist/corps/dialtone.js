// NeoN+1 corps/dialtone.js
'use strict';
NEON_FILES.push(['corps/dialtone.js', 'v12.04']);
// Its boss mod: HANDSHAKE (handshake), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.handshake = { name: 'HANDSHAKE',      bpm: 110, root: 46, scale: 'dorian',   prog: [0, 3, 4, 3], bass: 'offbeat', drums: 'four',  arp: 'updown', tick: true };
MUSIC_FOR.dialtone = 'handshake';

// ---- the corp
// ---- Tier 2, group 3: sound tells (each also shows on the hint row, for muted players).
CORPS.dialtone = {
  key: 'dialtone', name: 'DIALTONE ONLINE', letter: 'd', level: 2,
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

// intro art
CORP_ART.dialtone = [
  "   .-----------.",
  "   | o  o  o  o|",
  "   '-----------'",
  "  ~~ eeeEEEkk ~~",
  "  D I A L T O N E",
];
