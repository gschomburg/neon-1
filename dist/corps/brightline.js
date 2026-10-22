// NeoN+1 corps/brightline.js
'use strict';
NEON_FILES.push(['corps/brightline.js', 'v12.01']);
// ---- Tier 2, group 1: node animation (corp `fx`). fx(t, ft, lv) runs every frame for
// each closed node; ft is the node's own clock (it stops while the node is frozen).
CORPS.brightline = {
  key: 'brightline', name: 'BRIGHTLINE POWER', letter: '*', level: 2,
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

// intro art
CORP_ART.brightline = [
  "     ___|___",
  "    |  /|  |   ~~",
  "    | /_|_ |  ~~~",
  "    |   |/ |   ~~",
  "    |___|__|",
  "  B R I G H T L I N E",
];
