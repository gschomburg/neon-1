// NeoN+1 corps/boneyard.js
'use strict';
NEON_FILES.push(['corps/boneyard.js', 'v12.23']);
// Its boss mod: GRAVE ROBBER (graverobber), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.graveshift = { name: 'GRAVE SHIFT',    bpm: 76,  root: 38, scale: 'harmonic', prog: [0, 5, 1, 4], bass: 'pulse',   drums: 'half',  arp: 'down', echo: 0.5, feedback: 0.45 };
MUSIC_FOR.boneyard = 'graveshift';

// ---- the corp
CORPS.boneyard = {
  key: 'boneyard', name: 'BONEYARD', code: 'BY', level: 3, moves: true,
  intel: '"the guy asked for something spooky."',
  tell: null, money: 'BONES',
  bossDesc: 'boss: the ghosts walk.',
  rules: () => 'they pay in bones here.',
  mods: ['graverobber'],
  // The dead cast no shadow. Every node casts a faint shadow (dim : down its right side)
  // except the real one, and a decoy or two (the ghosts). Shadows flicker now and then.
  // $ nodes are bone piles. Boss: after every miss, a ghost drifts to an empty cell.
  dress(lv, k) {
    const others = shuffle(k.tiles.filter(t => t !== k.tellTile), k.r);
    const extra = Math.min(k.tier >= 2 || k.boss ? 2 : 1, Math.max(0, others.length - 1));
    k.tellTile.noShadow = true; k.tellTile.tell = true;
    for (const t of others.slice(0, extra)) { t.noShadow = true; t.ghost = true; }
    for (const t of lv.tiles) if (t.loaded) t.glyph = BONE_GLYPH;
    lv.shade = { seed: Math.floor(k.r() * 1000), flicker: k.boss ? 0.06 : k.tier >= 2 ? 0.04 : 0.02 };
  },
  onHit() { Sound.rattle(); },
  async afterHit(t, lv) {
    if (!lv.boss || lv.anchor || st.run.integrity <= 0) return;
    const r = rngFor(st.run.seed, 'haunt', st.corp.node.id, st.corp.idx, lv.misses);
    const ghost = pickR(lv.tiles.filter(o => o.ghost && !o.safe && o.state === 'closed' && !o.slide), r);
    if (!ghost) return;
    const used = new Set(lv.tiles.map(o => o.cell)), free = [];
    for (let c = 0; c < lv.cols * lv.rows; c++) if (!used.has(c)) free.push(c);
    if (!free.length) return;
    await wait(200);
    slideTo(lv, ghost, pickR(free, r), 900, 0.6);
    Sound.whoosh();
    setMsg('> something moved.', C.accent);
    await wait(slideMs(900) + 50);
  },
  fx: t => t.ghost && t.slide ? { dim: true } : null,   // a ghost fades while it drifts
  draw(put, lv, now) {
    const sh = lv.shade;
    if (!sh) return;
    for (const t of lv.tiles) {
      if (t.hidden || t.state !== 'closed' || t.noShadow) continue;
      if (h01(sh.seed + t.cell, Math.floor((now + t.cell * 337) / 160)) < sh.flicker) continue;
      const { tx, ty } = tileOrigin(t);
      for (let k = 1; k < TILE_H; k++) put(tx + TILE_W, ty + k, ':', C.dim, 'fx');
    }
  },
};

// the codex, once you've beaten it
CORP_TELL.boneyard = "the dead cast no shadow: every node casts a faint shadow except the real one (and a ghost or two). boss: after every miss, a ghost drifts to a new spot. the real node never moves.";

// intro art
CORP_ART.boneyard = [
  "      .-----.",
  "     / x   x \\",
  "     |   ^   |",
  "      \\ vvv /",
  "   B O N E Y A R D",
];
