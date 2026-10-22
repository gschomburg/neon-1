// NeoN+1 corps/gravitas.js
'use strict';
NEON_FILES.push(['corps/gravitas.js', 'v12.00']);
CORPS.gravitas = {
  key: 'gravitas', name: 'GRAVITAS LABS', letter: 'I', level: 5, moves: true,
  intel: '"what goes up. you know the rest."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: the floor drops on a timer.',
  rules: () => 'a miss drops the grid. one floats.',
  mods: ['antigrav'],
  // Gravity, like a falling-block game. A second in, and after every miss, everything falls
  // and stacks. The real node is lighter than air: it rises a row (past the node above it
  // if it has to). Deeper: one decoy floats on the first drop too. Boss: drops every 4.5s.
  dress(lv, k) {
    const r = k.r, real = k.real, cols = lv.cols;
    const used = new Set(lv.tiles.map(t => t.cell));
    if (real.row === 0 || used.has(real.cell - cols)) {   // room above the real node, so the first drop shows it
      const opts = [];
      for (let c = cols; c < cols * lv.rows; c++) if (!used.has(c) && !used.has(c - cols)) opts.push(c);
      if (opts.length) setCellOf(lv, real, pickR(opts, r));
    }
    const decoys = lv.tiles.filter(t => t !== real && !t.loaded && t.col !== real.col);
    lv.grav = { first: 1200, every: k.boss ? 4500 : 0, next: null, n: 0, bounce: (k.tier >= 2 || k.boss) && decoys.length ? pickR(decoys, r) : null };
  },
  tick(lv, lt) {
    const g = lv.grav;
    if (!g || lv.anchor) return;
    if (g.next == null) g.next = lt + g.first * moveScale();
    if (g.next < 0 || lt < g.next) return;
    g.next = g.every ? lt + g.every * moveScale() : -1;
    gravDrop(lv);
  },
  async afterHit(t, lv) { if (lv.grav && !lv.anchor) await gravDrop(lv, false); },
  hint: lv => lv.grav ? { text: lv.anchor ? 'gravity> off.' : `gravity> ${lv.grav.n} drop${lv.grav.n === 1 ? '' : 's'}`, col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.gravitas = "a second in, and after every miss, gravity: everything falls and stacks. the real node is lighter than air: it rises a row.";

// intro art
CORP_ART.gravitas = [
  "     .--.",
  "    (    )",
  "     '--'",
  "      ||",
  "      vv",
  " ============",
  " G R A V I T A S",
];
