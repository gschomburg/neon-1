// NeoN+1 corps/gravitas.js
'use strict';
NEON_FILES.push(['corps/gravitas.js', 'v12.23']);
// Its boss mod: ANTIGRAV (antigrav), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// GRAVITAS: gravity. Everything falls and stacks, except the floaters (the real node; deeper,
// one decoy on the first drop), which rise one row, past the node above if they have to.
async function gravDrop(lv, own = true) {
  const g = lv.grav, real = lv.tiles[lv.safe];
  g.n++;
  if (own) st.busy = true;
  const floats = t => t.state === 'closed' && (t === real || (t === g.bounce && g.n === 1));
  let moved = false;
  for (let col = 0; col < lv.cols; col++) {
    const list = lv.tiles.filter(t => t.col === col).sort((a, b) => a.row - b.row);
    const f = list.find(floats), others = list.filter(t => t !== f), place = new Map();
    if (!f) others.forEach((t, j) => place.set(t, lv.rows - others.length + j));
    else {
      const want = Math.max(0, f.row - 1), top = lv.rows - others.length;
      if (want < top) { others.forEach((t, j) => place.set(t, top + j)); place.set(f, want); }
      else {
        const top2 = top - 1, pIdx = want - top2, stack = others.slice();
        stack.splice(pIdx, 0, f);
        stack.forEach((t, j) => place.set(t, top2 + j));
      }
    }
    for (const [t, row] of place) if (row !== t.row) { slideTo(lv, t, row * lv.cols + col, 420); moved = true; }
  }
  if (moved) { Sound.whoosh(); await wait(slideMs(420) + 40); shake(2); }
  if (own && st.lv === lv) { st.busy = false; lv.readyAt = performance.now(); }
}

// ---- its music
SONGS.freefall = { name: 'FREE FALL',      bpm: 100, root: 43, scale: 'dorian',   prog: [0, 6, 5, 4], bass: 'eighths', drums: 'four',  arp: 'down', echo: 0.45, feedback: 0.45 };
MUSIC_FOR.gravitas = 'freefall';

// ---- the corp
CORPS.gravitas = {
  key: 'gravitas', name: 'GRAVITAS LABS', code: 'GV', level: 5, moves: true,
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
