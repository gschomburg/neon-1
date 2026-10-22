// NeoN+1 corps/coldbrew.js
'use strict';
NEON_FILES.push(['corps/coldbrew.js', 'v13.08']);
// Its boss mod: ESPRESSO (espresso), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.doubleshot = { name: 'DOUBLE SHOT',    bpm: 118, root: 47, scale: 'dorian',   prog: [0, 3, 4, 0], bass: 'offbeat', drums: 'four',  arp: 'updown' };
MUSIC_FOR.coldbrew = 'doubleshot';

// ---- the corp
CORPS.coldbrew = {
  key: 'coldbrew', name: 'COLDBREW', code: 'CB', level: 2,
  intel: '"another shot? another shot."',
  tell: null, timer: 12, pay: 1.3, shot: true,
  bossDesc: 'boss: decaf steam. barely.',
  rules: () => 'clock: 1s less each layer. pays x1.3',
  mods: ['espresso'],
  // The real node steams: a wisp rises off it every couple of seconds. Deeper: decoys
  // give off a faint dot now and then. Boss: the steam is rare.
  dress(lv, k) {
    k.tellTile.tell = true;
    lv.steam = { every: k.boss ? 3400 : 2200, wisp: k.tier >= 2 || k.boss };
    k.tiles.forEach(t => { t.ph = Math.floor(k.r() * 4000); });
  },
  fx(t, ft, lv) {
    const sm = lv.steam;
    if (!sm) return null;
    const p = (ft + t.ph) % sm.every, dur = 900;
    if (t.tell) {
      if (p >= dur) return null;
      const f = p / dur;
      return { over: [{ dx: 3 + Math.round(Math.sin(f * 6) * 0.6), dy: -0.5 - f * 0.8, ch: f < 0.3 ? '.' : f < 0.7 ? '~' : "'", col: C.text }] };
    }
    if (sm.wisp && p < 400 && t.ph % 3 === 0) return { over: [{ dx: 3, dy: -0.5 - p / 1000, ch: '.', col: C.dim }] };
    return null;
  },
};

// the codex, once you've beaten it
CORP_TELL.coldbrew = "the real node steams: a wisp rises off it every couple of seconds. deeper, decoys give off a faint dot. the clock loses 1s every layer.";

// intro art
CORP_ART.coldbrew = [
  "      ) ) )",
  "     ( ( (",
  "    .-----.",
  "    |     |]",
  "    '-----'",
  "   C O L D B R E W",
];
