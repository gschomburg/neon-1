// NeoN+1 corps/brightline.js
'use strict';
NEON_FILES.push(['corps/brightline.js', 'v13.79']);
// Its boss mod: GROUNDED (grounded), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from LIGHT CYCLE: the same band, its own tune.
SONGS.highvoltage = { name: 'HIGH VOLTAGE', from: 'lightcycle', bpm: 124, root: 40, scale: 'minor', prog: [0, 3, 5, 6], kit: '808', pump: 0.7, padVoice: 'glass',
  beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.', open: '..............x.' },
  bassLine: '0 7 0 7 0 7 0 7 0 7 0 7 0 7 0 7',
  melody: ['7 . 7 . 9 . 7 . 4 . . . 2 . 4 .', '7 . 7 . 9 . 10 . 9 . . . 7 . 4 .', '5 . 5 . 7 . 5 . 2 . . . 0 . 2 .', '6 . 6 . 4 . 6 . 7 . . . . . . .'],
  leadVoice: 'saw', arpVoice: 'chip', arpLine: '. . 3 . . . 4 . . . 5 . . . 4 .', stab: 'x.......x.......', stabVoice: 'brass', stabAt: 2 };
MUSIC_FOR.brightline = 'highvoltage';

// ---- the corp
// ---- Tier 2, group 1: node animation (corp `fx`). fx(t, ft, lv) runs every frame for
// each closed node; ft is the node's own clock (it stops while the node is frozen).
CORPS.brightline = {
  key: 'brightline', name: 'BRIGHTLINE POWER', code: 'BL', level: 2,
  intel: '"keeping the lights on. mostly."',
  tell: null,
  bossDesc: 'boss: blink and you miss it.',
  rules: () => 'brownouts. watch who stays lit.',
  mods: ['grounded'],
  // Brownouts: every few seconds the power dips and the decoys go dark. The real node has
  // a backup and stays lit. Deeper: shorter dips. Boss: very short ones.
  dress(lv, k) {
    k.tellTile.tell = true;
    lv.brown = { len: k.boss ? 260 : k.tier >= 2 ? 450 : 700, every: k.boss ? 2600 : 3000, ph: Math.floor(k.r() * 1000) };
  },
  fx(t, ft, lv) {
    const b = lv.brown;
    if (!b || (ft + b.ph) % b.every >= b.len) return null;
    return t.tell ? { bright: true } : { dim: true };
  },
  hint(lv, now) {
    const b = lv.brown;
    if (!b) return null;
    return (now + b.ph) % b.every < b.len ? { text: '!! brownout !!', col: C.danger } : { text: 'grid: nominal', col: C.mid };
  },
};

// the codex, once you've beaten it
CORP_TELL.brightline = "brownouts: every few seconds the decoys go dark. the real node has a backup and stays lit. deeper and boss: shorter dips.";
