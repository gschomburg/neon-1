// NeoN+1 corps/hydra.js
'use strict';
NEON_FILES.push(['corps/hydra.js', 'v12.23']);
// Its boss mod: HEADCOUNT (headcount), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const HEAD_GLYPH = normMotif([" ,^, ", '<o o>', " 'v' "]);
 // HYDRA's young heads
// HYDRA: a free cell touching `t` (8 around it), or null.
function freeNear(lv, t, r) {
  const used = new Set(lv.tiles.map(o => o.cell)), out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const col = t.col + dc, row = t.row + dr;
    if ((dr || dc) && col >= 0 && col < lv.cols && row >= 0 && row < lv.rows && !used.has(row * lv.cols + col)) out.push(row * lv.cols + col);
  }
  return out.length ? pickR(out, r) : null;
}

// ---- its music
SONGS.manyheads = { name: 'MANY HEADS',     bpm: 112, root: 40, scale: 'harmonic', prog: [0, 1, 0, 5], bass: 'gallop',  drums: 'heavy', arp: 'updown' };
MUSIC_FOR.hydra = 'manyheads';

// ---- the corp
CORPS.hydra = {
  key: 'hydra', name: 'HYDRA', code: 'HY', level: 3,
  intel: '"cut off one head..."',
  tell: null,
  bossDesc: 'boss: two heads for every one.',
  rules: () => 'hit ICE: a new head grows.',
  mods: ['headcount'],
  // Heads grow from the body: the real node. Every layer opens with young heads
  // (always ICE, with a head glyph) next to it; deeper, one of them grows anywhere.
  // Every ICE hit grows a new head next to the body. Deeper, the new heads look like
  // any other node (watch them grow in). Boss: no young heads, and two grow per hit
  // (one next to the body, one anywhere), looking like any other node.
  dress(lv, k) {
    const q = k.tellTile, r = k.r;
    q.tell = true;
    lv.hydra = { tier: k.tier, boss: k.boss };
    if (k.boss) return;
    for (let i = 0; i < 2; i++) {
      const near = i === 0 || k.tier < 2;
      const ice = k.tiles.filter(t => t !== q && !t.safe && !t.head);
      if (!ice.length) break;
      const already = near ? ice.filter(t => touching(t, q)) : [];
      let t;
      if (already.length && r() < 0.5) t = pickR(already, r);
      else {
        t = pickR(ice.filter(o => !touching(o, q)).length ? ice.filter(o => !touching(o, q)) : ice, r);
        const cell = near ? freeNear(lv, q, r) : null;
        if (cell != null) moveTile(lv, t, cell);
        else if (near && already.length) t = pickR(already, r);
      }
      t.head = true; t.glyph = HEAD_GLYPH;
    }
  },
  async afterHit(t, lv) {
    const h = lv.hydra;
    if (!h || st.run.integrity <= 0) return;
    if (lv.eater && (lv.hydraGrew || 0) >= (h.boss ? 4 : 3)) return;   // ICE EATER: a head limit, so the eating ends
    const real = lv.tiles[lv.safe], r = rngFor(st.run.seed, 'hydra', st.corp.node.id, st.corp.idx, lv.misses);
    const plain = h.boss || h.tier >= 2;
    const usedGlyphs = new Set(lv.tiles.map(o => o.glyph));
    let grew = 0;
    for (let i = 0; i < (h.boss ? 2 : 1); i++) {
      let cell = i === 0 ? freeNear(lv, real, r) : null;
      if (cell == null) {
        const used = new Set(lv.tiles.map(o => o.cell)), free = [];
        for (let c2 = 0; c2 < lv.cols * lv.rows; c2++) if (!used.has(c2)) free.push(c2);
        if (!free.length) break;
        cell = pickR(free, r);
      }
      const glyph = plain ? pickR(MOTIFS.filter(m => !usedGlyphs.has(m)), r) || HEAD_GLYPH : HEAD_GLYPH;
      usedGlyphs.add(glyph);
      const nt = { cell, col: 0, row: 0, glyph, safe: false, loaded: false, marked: false, ruledOut: false,
        state: 'closed', hidden: false, probing: false, dist: null, head: !plain, spawned: true, bornAt: performance.now() };
      moveTile(lv, nt, cell);
      lv.tiles.push(nt);
      grew++;
    }
    lv.hydraGrew = (lv.hydraGrew || 0) + grew;
    if (!grew) return;
    lv.tiles.sort((a, b) => a.cell - b.cell);
    lv.safe = lv.tiles.indexOf(real);
    st.hover = -1; st.sel = -1;
    Sound.nodeOn(); shake(2);
    setMsg(grew > 1 ? '> two heads grow back.' : '> a new head grows.', C.accent);
    await wait(420);
  },
  // a new head glitches in
  fx(t, ft) {
    if (!t.bornAt || ft - t.bornAt > 450) return null;
    return { glyph: t.glyph.map(l => l.replace(/[^ ]/g, () => noiseCh())), gc: C.accent, fc: C.accent };
  },
  hint(lv) {
    const n = lv.tiles.filter(t => t.spawned).length;
    return { text: `heads grown: ${n}`, col: n ? C.accent : C.mid };
  },
};

// the codex, once you've beaten it
CORP_TELL.hydra = "heads grow from the body. the head nodes are ICE, and they grow next to the real node, and so does every new head after a hit. deeper, one young head grows anywhere and new heads look like any node: watch them grow in. boss: two per hit.";

// intro art
CORP_ART.hydra = [
  "   ,^,  ,^,  ,^,",
  "   \\ \\  | |  / /",
  "    \\ \\_| |_/ /",
  "     '-.___.-'",
  "      H Y D R A",
];
