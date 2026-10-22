// NeoN+1 corps/entropy.js
'use strict';
NEON_FILES.push(['corps/entropy.js', 'v12.01']);
CORPS.entropy = {
  key: 'entropy', name: 'ENTROPY', letter: 'z', level: 4, moves: true,
  intel: '"order is just a phase."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: every hit shuffles too.',
  rules: () => 'it reshuffles every few seconds.',
  mods: ['anchor'],
  // Every few seconds every node jumps to a new cell and the decoys get new glyphs. The
  // real node keeps its glyph: the one that survives a shuffle. Deeper: one decoy keeps
  // its glyph through the first shuffle too. Boss: faster, and each hit shuffles.
  dress(lv, k) {
    const decoys = k.tiles.filter(t => !t.safe);
    lv.ent = { every: k.boss ? 3600 : k.tier >= 2 ? 4300 : 5000, first: 2200, next: null, n: 0, boss: k.boss,
      decoy: (k.tier >= 2 || k.boss) && decoys.length ? pickR(decoys, k.r) : null, seen: new Set(lv.tiles.map(t => t.glyph)) };
  },
  tick(lv, lt) {
    const e = lv.ent;
    if (!e || lv.anchor) return;
    if (e.next == null) e.next = lt + e.first * moveScale();
    if (lt < e.next) return;
    e.next = lt + e.every * moveScale();
    entropyShuffle(lv);
  },
  async afterHit(t, lv) { if (lv.ent && lv.ent.boss && !lv.anchor) { entropyShuffle(lv); await wait(slideMs(450)); } },
  hint(lv) {
    const e = lv.ent;
    if (!e) return null;
    if (lv.anchor) return { text: 'entropy> anchored.', col: C.accent };
    const span = (e.n ? e.every : e.first) * moveScale(), left = Math.max(0, (e.next || 0) - (lv.lt || 0)), n = 6;
    return { text: `entropy [${'#'.repeat(clamp(Math.round(n * (1 - left / span)), 0, n)).padEnd(n, '.')}]`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.entropy = "every few seconds every node jumps to a new cell and the decoys get new glyphs. the real node keeps its glyph: the one that survives a shuffle.";

// intro art
CORP_ART.entropy = [
  " #  .  %   *  ~  ,",
  "   @   ,  +   .  #",
  " .   =   #  ?   %",
  "",
  "  E N T R O P Y",
];
