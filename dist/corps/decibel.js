// NeoN+1 corps/decibel.js
'use strict';
NEON_FILES.push(['corps/decibel.js', 'v12.20']);
// Its boss mod: STETHOSCOPE (stethoscope), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.loudness = { name: 'LOUDNESS WAR',   bpm: 122, root: 42, scale: 'minor',    prog: [0, 3, 6, 5], bass: 'eighths', drums: 'heavy', arp: 'updown' };
MUSIC_FOR.decibel = 'loudness';

// ---- the corp
CORPS.decibel = {
  key: 'decibel', name: 'DECIBEL LABS', code: 'DB', level: 5, drag: true,
  intel: '"can you hear that?"',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: an echo off the wrong node.',
  rules: () => 'hover/drag: clearer near the real.',
  mods: ['stethoscope'],
  // Hot and cold by ear: the music is muffled far from the real node and clears up as you
  // get close. The waveform on the hint row shows it too (for muted players). Deeper: you
  // have to be closer. Boss: one decoy echoes back, not quite as loud.
  dress(lv, k) {
    const ice = k.tiles.filter(t => !t.safe);
    lv.db = { echo: k.boss && ice.length ? pickR(ice, k.r) : null, reach: k.tier >= 2 || k.boss ? 2 : 2.6, c: null };
    lv.focus = 0.15;
  },
  tick(lv) {
    const d = lv.db;
    if (!d) return;
    let c = nearness(lv, lv.tiles[lv.safe], d.reach);
    if (c != null && d.echo && d.echo.state === 'closed') c = Math.max(c, 0.72 * nearness(lv, d.echo, d.reach));
    d.c = c;
    lv.focus = c == null ? 0.15 : c;
  },
  hint(lv, now) {
    const d = lv.db;
    if (!d) return null;
    if (d.c == null) return { text: st.kbGrid ? 'db> move the cursor to listen' : 'db> hover or drag to listen', col: C.mid };
    let w = '';
    for (let x = 0; x < 20; x++) w += ' .-~^'[clamp(Math.floor(d.c * (0.55 + 0.45 * Math.sin(now / 80 + x * 0.9)) * 5 + Math.random() * 0.6), 0, 4)];
    return { text: 'db> ' + w, col: d.c > 0.75 ? C.bright : d.c > 0.4 ? C.accent : C.mid };
  },
};

// the codex, once you've beaten it
CORP_TELL.decibel = "hot and cold by ear: the music is muffled far from the real node and clears up as your pointer gets close. the waveform shows it too.";

// intro art
CORP_ART.decibel = [
  "      _.-^-._",
  "  .-^'       '^-.",
  " ~   ) ) )o( ( (   ~",
  "  '-._       _.-'",
  "      '-.v.-'",
  "",
  " D E C I B E L",
];
