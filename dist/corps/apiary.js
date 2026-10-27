// NeoN+1 corps/apiary.js
'use strict';
NEON_FILES.push(['corps/apiary.js', 'v13.41']);
// Its boss mod: HONEYCOMB (honeycomb), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from DROP ZONE: the same band, its own tune.
SONGS.swarm = { name: 'SWARM', from: 'dropzone', bpm: 138, root: 46, scale: 'harmonic', prog: [0, 0, 1, 0], kit: 'industrial', pump: 0.4, padVoice: 'choir', breakdown: 4,
  beat: { kick: 'x.........x.....', snare: '........x.......', hat: 'x.x.x.x.x.x.x.x.', open: '..............x.' },
  bassVoice: 'acid', bassLine: '0 1 0 1 0 1 0 1 0 1 0 1 3 3 1 1',
  melody: ['. . . . . . . . 4 5 4 5 4 - - -', '. . . . . . . . 7 8 7 8 7 - 6 -'],
  leadVoice: 'dist', arpVoice: 'chip', arpLine: '. . . . . . . . . . . . 0 1 0 1' };
MUSIC_FOR.apiary = 'swarm';

// ---- the corp
CORPS.apiary = {
  key: 'apiary', name: 'APIARY', code: 'AP', level: 3,
  intel: '"long live the queen."',
  tell: null,
  bossDesc: 'boss: half the hive swarms.',
  mods: ['honeycomb'],
  // The real node is the queen. The workers slowly lean toward her; she never moves.
  // Deeper: they lean less. Boss: half of them swarm (buzz around, no lean).
  dress(lv, k) {
    const r = k.r, q = k.tellTile;
    q.tell = true;
    const max = k.tier >= 2 || k.boss ? 0.2 : 0.32;
    k.tiles.forEach(t => {
      t.ph = r() * 6.28;
      if (t === q) return;
      const dc = (q.col - t.col) * 1.4, dr = q.row - t.row, d = Math.hypot(dc, dr) || 1;
      t.lean = k.boss && r() < 0.5 ? null : { x: dc / d * max, y: dr / d * max * 0.7 };
    });
    lv.hive = { ramp: k.tier >= 2 ? 6000 : 4000 };
  },
  fx(t, ft, lv) {
    if (!lv.hive) return null;
    const a = t.tell ? 0.03 : t.lean ? 0.04 : 0.12;   // swarmers buzz harder
    const buzz = { dx: a * Math.sin(ft / 47 + t.ph), dy: a * 0.7 * Math.sin(ft / 61 + t.ph * 2) };
    if (t.tell || !t.lean) return buzz;
    const f = clamp((ft - (lv.shownAt || ft)) / lv.hive.ramp, 0, 1);
    return { dx: buzz.dx + t.lean.x * f, dy: buzz.dy + t.lean.y * f };
  },
};

// the codex, once you've beaten it
CORP_TELL.apiary = "the real node is the queen: she stays put while the workers slowly lean toward her. boss: half the hive swarms instead.";
