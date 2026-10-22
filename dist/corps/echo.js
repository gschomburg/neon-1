// NeoN+1 corps/echo.js
'use strict';
NEON_FILES.push(['corps/echo.js', 'v12.03']);
// Its boss mod: FOGHORN (foghorn), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.sonar = { name: 'SONAR',          bpm: 76,  root: 44, scale: 'minor',    prog: [0, 5, 6, 4], style: 'ambient', echo: 0.7, feedback: 0.6 };
MUSIC_FOR.echo = 'sonar';

// ---- the corp
CORPS.echo = {
  key: 'echo', name: 'ECHO LABS', letter: 'e', level: 3,
  intel: '"we hear everything. ping."',
  tell: null,
  bossDesc: 'boss: one pitch. watch the rings.',
  mods: ['foghorn'],
  // Every few seconds the nodes ping, one after another: a blip and a ring. The real
  // node pings lower, and its ring goes in, not out. Boss: every ping sounds the same.
  dress(lv, k) {
    shuffle(k.tiles.slice(), k.r).forEach((t, i) => { t.pingAt = i * 200; });
    k.tellTile.tell = true;
    lv.sonar = { every: Math.max(2600, k.tiles.length * 200 + 1400), ring: k.boss ? 380 : 520, pitch: !k.boss, lastP: 0 };
  },
  fx(t, ft, lv) {
    const so = lv.sonar;
    if (!so || lv.shownAt == null || t.pingAt == null) return null;
    const p = ((ft - lv.shownAt) % so.every) - t.pingAt;
    if (p < 0 || p >= so.ring) return null;
    const f = t.tell ? 1 - p / so.ring : p / so.ring, o = 0.3 + f * 1.1;
    return { over: [{ dx: -o, dy: 2, ch: '(', col: C.accent }, { dx: TILE_W - 1 + o, dy: 2, ch: ')', col: C.accent }] };
  },
  tick(lv, lt, dt, now) {
    const so = lv.sonar;
    if (!so || lv.shownAt == null) return;
    const p = (now - lv.shownAt) % so.every, a = so.lastP;
    so.lastP = p;
    for (const t of lv.tiles) {
      if (t.state !== 'closed' || t.pingAt == null) continue;
      if (p >= a ? t.pingAt > a && t.pingAt <= p : t.pingAt > a || t.pingAt <= p) Sound.ping(t.tell && so.pitch ? 440 : 880);
    }
  },
};

// the codex, once you've beaten it
CORP_TELL.echo = "the nodes ping one after another. the real node pings lower and its ring goes in, not out. boss: every ping sounds the same; watch the rings.";

// intro art
CORP_ART.echo = [
  "   (  (  ( . )  )  )",
  "",
  "      E C H O",
  "      L A B S",
];
