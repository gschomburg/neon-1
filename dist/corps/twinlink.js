// NeoN+1 corps/twinlink.js
'use strict';
NEON_FILES.push(['corps/twinlink.js', 'v12.22']);
// Its boss mod: LINKUP (linkup), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.duet = { name: 'DUET',           bpm: 110, root: 44, scale: 'dorian',   prog: [0, 3, 0, 4], bass: 'offbeat', drums: 'four',  arp: 'mirror', pingpong: true };
MUSIC_FOR.twinlink = 'duet';

// ---- the corp
CORPS.twinlink = {
  key: 'twinlink', name: 'TWINLINK', code: 'TL', level: 4,
  intel: '"better together."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: double nodes. they hit for 2.',
  rules: () => 'linked nodes flip together.',
  mods: ['linkup'],
  // Linked pairs of nodes (a line between them) flip together: hit one and its partner
  // flips too (both ICE, both locked). The real node is never linked. Deeper: more unlinked
  // decoys. Boss: a double-width node, always ICE, that hits for 2.
  dress(lv, k) {
    const r = k.r, cols = lv.cols, N = cols * lv.rows, real = k.real;
    const ice = shuffle(lv.tiles.filter(t => t !== real && !t.loaded), r), loot = lv.tiles.filter(t => t.loaded);
    let singles = Math.min(ice.length, k.tier >= 2 || k.boss ? 2 : 1);
    if ((ice.length - singles) % 2) singles = singles + 1 <= ice.length ? singles + 1 : singles - 1;
    const used = new Set(), place = (t, c) => { setCellOf(lv, t, c); used.add(c); };
    const freeCells = () => { const out = []; for (let c = 0; c < N; c++) if (!used.has(c)) out.push(c); return out; };
    const rest = [];
    // the boss's double node takes two cells side by side
    if (k.boss && singles > 0) {
      const opts = freeCells().filter(c => c % cols < cols - 1);
      const w = ice[0], c = pickR(opts, r);
      place(w, c); used.add(c + 1); w.wide = true; w.glyph = normMotif(['', '[ = ]', '']);
    } else if (singles > 0) rest.push(ice[0]);
    for (let j = 1; j < singles; j++) rest.push(ice[j]);
    place(real, pickR(freeCells(), r));
    const links = [];
    for (let j = singles; j + 1 < ice.length; j += 2) {
      const a = ice[j], b = ice[j + 1], opts = [];
      for (const c of freeCells()) {
        if (c % cols < cols - 1 && !used.has(c + 1)) opts.push([c, c + 1]);
        if (c + cols < N && !used.has(c + cols)) opts.push([c, c + cols]);
      }
      if (!opts.length) { rest.push(a, b); continue; }
      const [c1, c2] = pickR(opts, r);
      place(a, c1); place(b, c2); a.partner = b; b.partner = a; links.push([a, b]);
    }
    for (const t of [...rest, ...loot]) place(t, pickR(freeCells(), r));
    lv.links = links;
  },
  hitDmg: t => (t.wide ? 2 : 1),
  onHit(t) {
    const p = t.partner;
    if (p && p.state === 'closed' && !p.safe) { lockTile(p, C.accent, 'link'); setMsg(`${st.msg} link flipped.`, st.msgCol); }
  },
  draw(put, lv) {
    for (const [a, b] of lv.links || []) {
      const col = a.state === 'closed' && b.state === 'closed' ? C.accent : C.dim;
      const A = tileOrigin(a.cell < b.cell ? a : b), horiz = a.row === b.row;
      if (horiz) put(A.tx + TILE_W, A.ty + 2, '==', col, 'fx', true);
      else { put(A.tx + 2, A.ty + TILE_H, '|', col, 'fx', true); put(A.tx + 4, A.ty + TILE_H, '|', col, 'fx', true); }
    }
  },
  hint: lv => lv.links ? { text: `links> ${lv.links.length} pair${lv.links.length === 1 ? '' : 's'}`, col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.twinlink = "linked pairs flip together. the real node is never linked. boss: double-width nodes are always ICE, and hit for 2.";

// intro art
CORP_ART.twinlink = [
  "  [o]==[o]",
  "        |",
  "  [o]  [o]==[o]",
  "",
  "  T W I N L I N K",
];
