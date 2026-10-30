// NeoN+1 corps/gridlock.js
'use strict';
NEON_FILES.push(['corps/gridlock.js', 'v13.84']);
// Its boss mod: GREEN WAVE (greenwave), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// GRIDLOCK: a node's traffic light at time `now`.
const lightOf = (lv, t, now) => { const c = lv.lights.cyc, p = (now + (t.ph || 0)) % c; return p < c * 0.42 ? 'green' : p < c * 0.58 ? 'amber' : 'red'; };

// ---- its music
// Made from NIGHT DRIVE: the same band, its own tune.
SONGS.rushhour = { name: 'RUSH HOUR', from: 'nightdrive', bpm: 100, root: 45, scale: 'minor', prog: [0, 3, 6, 5], echo: 0.4,
  beat: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.' },
  bassLine: '0 . 0 . 0 . 0 . 0 . 0 . 0 . 0 .', stab: 'x.......x.......', stabVoice: 'brass', stabAt: 3,
  melody: ['7 - - - - - 6 - 4 - - - 2 - - -', '4 - - - - - - - . . . . . . . .', '7 - - - - - 9 - 10 - - - 9 - - -', '7 - - - - - - - . . . . . . . .'],
  leadVoice: 'saw' };
MUSIC_FOR.gridlock = 'rushhour';

// ---- the corp
CORPS.gridlock = {
  key: 'gridlock', name: 'GRIDLOCK TRAFFIC', code: 'GR', level: 4,
  intel: '"please wait for the signal."',
  tell: null,
  bossDesc: 'boss: rush hour. fast lights.',
  rules: () => 'ICE on red hits for 2. green: 0.',
  mods: ['greenwave'],
  // Every node is a traffic light. The decoys change together (deeper: in two groups);
  // the real node runs out of sync with all of them. Hit ICE on green: no damage. Amber: 1.
  // Red: 2.
  dress(lv, k) {
    const r = k.r, cyc = k.boss ? 3600 : 4800, decoys = k.tiles.filter(t => t !== k.tellTile);
    const groups = (k.tier >= 2 || k.boss) && decoys.length >= 4 ? [0, 0.5] : [0];
    const g0 = r();
    decoys.forEach((t, i) => { t.ph = Math.floor(((g0 + groups[i % groups.length]) % 1) * cyc); });
    k.tellTile.ph = Math.floor(((g0 + (groups.length > 1 ? 0.25 : 0.3 + r() * 0.4)) % 1) * cyc);
    k.tellTile.tell = true;
    lv.lights = { cyc };
  },
  fx(t, ft, lv) {
    if (!lv.lights) return null;
    const l = lightOf(lv, t, ft);
    return { glyph: normMotif([l === 'red' ? '(@)' : '( )', l === 'amber' ? '(@)' : '( )', l === 'green' ? '(@)' : '( )']), gc: l === 'red' ? C.danger : l === 'amber' ? C.money : C.accent };
  },
  block(t, lv) {
    if (!lv.lights || lightOf(lv, t, performance.now()) !== 'green') return null;
    Sound.shield(); flash(C.accent, 0.1, 0.3);
    return '> ICE. green light: no damage.';
  },
  hitDmg: (t, lv) => lv.lights && lightOf(lv, t, performance.now()) === 'red' ? 2 : 1,
};

// the codex, once you've beaten it
CORP_TELL.gridlock = "every node is a traffic light. the decoys change together (deeper: in two groups); the real one is out of sync. ICE on green: 0 damage, amber 1, red 2.";
