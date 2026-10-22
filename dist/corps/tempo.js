// NeoN+1 corps/tempo.js
'use strict';
NEON_FILES.push(['corps/tempo.js', 'v13.05']);
// Its boss mod: ON BEAT (onbeat), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.fourfloor = { name: 'FOUR TO THE FLOOR', bpm: 124, root: 45, scale: 'minor', prog: [0, 0, 5, 6], bass: 'eighths', drums: 'four',  arp: 'up' };
MUSIC_FOR.tempo = 'fourfloor';

// ---- the corp
CORPS.tempo = {
  key: 'tempo', name: 'TEMPO RECORDS', code: 'TM', level: 3,
  intel: '"feel the beat. BE the beat."',
  tell: null,
  bossDesc: 'boss: find the off-beat.',
  mods: ['onbeat'],
  // Every node pulses with the music. The real node lands right on the beat; decoys are a
  // little early or late (deeper: closer). A metronome on the hint row keeps time. Boss:
  // the real node is the one on the off-beat.
  dress(lv, k) {
    const r = k.r, near = k.tier >= 2 || k.boss ? 0.11 : 0.18, base = k.boss ? 0.5 : 0;
    k.tiles.forEach(t => { t.beatOff = (r() < 0.5 ? -1 : 1) * (near + r() * 0.1); });
    if (k.boss) k.tiles.forEach(t => { t.beatOff = (r() < 0.5 ? -1 : 1) * (0.1 + r() * 0.1); });
    k.tellTile.beatOff = base;
    k.tellTile.tell = true;
    lv.tempo = true;
  },
  fx(t, ft, lv) {
    if (!lv.tempo) return null;
    const p = ((beatClock(ft).phase - t.beatOff) % 1 + 1) % 1;
    return p < 0.15 ? { bright: true, dy: -0.12 } : null;
  },
  hint(lv, now) {
    const b = beatClock(now), n = ((b.n % 4) + 4) % 4;
    return { text: `tempo> ${[0, 1, 2, 3].map(i => i === n ? (b.phase < 0.2 ? 'O' : 'o') : '.').join(' ')}  ${Math.round(b.bpm)} bpm`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.tempo = "every node pulses with the music. the real node lands right on the beat (watch the metronome); decoys are a hair early or late. boss: the real node is on the off-beat.";

// intro art
CORP_ART.tempo = [
  "     ___",
  "    / o \\  ~ ~",
  "   | (_) |  ~",
  "    \\___/",
  "  T E M P O  rec.",
];
