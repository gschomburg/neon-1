// NeoN+1 corps/coldbrew.js
'use strict';
NEON_FILES.push(['corps/coldbrew.js', 'v13.83']);
// Its boss reward: REWIND (epic) gear x2 (rewind; it was ESPRESSO), defined with the gear in data/mods.js (ITEMS),
// its effect in engine/active.js.

// ---- its music
// Made from DROP ZONE: the same band, its own tune.
SONGS.espresso = { name: 'ESPRESSO', from: 'dropzone', bpm: 150, root: 43, scale: 'minor', prog: [0, 0, 3, 5], kit: '808', pump: 0.4, padVoice: 'choir', breakdown: 4,
  beat: { kick: 'x.........x.....', snare: '........x.......', hat: 'x.x.x.x.x.x.x.x.', open: '......x.......x.' },
  bassVoice: 'acid', bassLine: '0 . 0 0 . 0 0 . 3 . 3 3 . 5 7 .',
  melody: ['. . . . . . . . 4 - 3 - 4 - . .', '. . . . . . . . 7 - 6 - 4 - 3 -'],
  leadVoice: 'saw', arpVoice: 'chip', arpLine: '. . . . . . . . . . . . 3 5 4 3' };
MUSIC_FOR.coldbrew = 'espresso';

// ---- the corp
CORPS.coldbrew = {
  key: 'coldbrew', name: 'COLDBREW', code: 'CB', level: 2,
  intel: '"another shot? another shot."',
  tell: null, timer: 12, pay: 1.3, shot: true,
  bossDesc: 'boss: decaf steam. barely.',
  rules: () => 'clock: 1s less each layer. pays x1.3',
  gear: { key: 'rewind', tier: 2, n: 2 },   // its boss reward: a stack of gear
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
