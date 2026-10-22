// NeoN+1 corps/entropy.js
'use strict';
NEON_FILES.push(['corps/entropy.js', 'v12.11']);
// Its boss mod: ANCHOR (anchor), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// ENTROPY: everything still in play jumps to new cells; the decoys get new glyphs.
function entropyShuffle(lv) {
  const e = lv.ent, r = rngFor(st.run.seed, 'ent', st.corp.node.id, st.corp.idx, e.n++);
  const movers = lv.tiles.filter(t => t.state === 'closed');
  const fixed = new Set(lv.tiles.filter(t => t.state !== 'closed').map(t => t.cell));
  const cells = [];
  for (let c = 0; c < lv.cols * lv.rows; c++) if (!fixed.has(c)) cells.push(c);
  const to = shuffle(cells, r).slice(0, movers.length);
  movers.forEach((t, i) => slideTo(lv, t, to[i], 450));
  // new glyphs that were never on the board, so the real one is the only one that stays
  let pool = shuffle(MOTIFS.filter(m => !e.seen.has(m)), r);
  if (pool.length < movers.length) { e.seen = new Set(lv.tiles.map(t => t.glyph)); pool = shuffle(MOTIFS.filter(m => !e.seen.has(m)), r); }
  for (const t of movers) {
    if (t.safe || t.loaded || (t === e.decoy && e.n === 1) || !pool.length) continue;
    t.glyph = pool.pop(); e.seen.add(t.glyph);
  }
  Sound.whoosh();
}

// ---- its music
SONGS.scramble = { name: 'SCRAMBLE',       bpm: 136, root: 41, scale: 'phrygian', prog: [0, 1, 6, 1], bass: 'gallop',  drums: 'heavy', arp: 'updown', tick: true };
MUSIC_FOR.entropy = 'scramble';

// ---- the corp
CORPS.entropy = {
  key: 'entropy', name: 'ENTROPY', code: 'EN', level: 4, moves: true,
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
