// NeoN+1 engine/layers.js: Layers: the grid, picking the real node, glyphs, the corp dressing a layer.
'use strict';
NEON_FILES.push(['engine/layers.js', 'v13.45']);

// ---------------- Layers ----------------
function gridFor(n) {
  let cols = 4, rows = 4;
  while (n > Math.floor(cols * rows * 0.75)) {
    if (rows <= cols) rows++; else cols++;
  }
  return { cols, rows };
}

function tellCells(tell, cols, rows, prevSafe) {
  const all = [];
  for (let i = 0; i < cols * rows; i++) all.push(i);
  const colOf = i => i % cols, rowOf = i => Math.floor(i / cols);
  if (tell === 'corner') return [0, cols - 1, (rows - 1) * cols, rows * cols - 1];
  if (tell === 'edge') return all.filter(i => colOf(i) === 0 || colOf(i) === cols - 1 || rowOf(i) === 0 || rowOf(i) === rows - 1);
  if (tell === 'center') return all.filter(i => colOf(i) > 0 && colOf(i) < cols - 1 && rowOf(i) > 0 && rowOf(i) < rows - 1);
  if ((tell === 'mirror' || tell === 'vmirror' || tell === 'point') && prevSafe) {
    const col = tell === 'vmirror' ? prevSafe.col : cols - 1 - prevSafe.col;
    const row = tell === 'mirror' ? prevSafe.row : rows - 1 - prevSafe.row;
    if (col >= 0 && col < cols && row >= 0 && row < rows) return [row * cols + col];
  }
  return null;
}

// Sigil signature for one tile. level 1: one glyph for the whole visit.
// level 2: always an X shape, one random character per tile (e.g. all #, all %).
// level 3: always 'x' characters, random arrangement per tile.
function signedGlyph(mark, r) {
  if (mark.level === 1) return mark.glyph;
  if (mark.level === 2) { const ch = pickR(MARK_CHARS, r); return X_SHAPE.map(l => l.replace(/[^ ]/g, ch)); }
  const cells = [];
  for (let i = 0; i < 15; i++) cells.push(i);
  const on = new Set(shuffle(cells, r).slice(0, 3 + Math.floor(r() * 3)));
  const out = [];
  for (let row = 0; row < 3; row++) {
    let s = '';
    for (let col = 0; col < 5; col++) s += on.has(row * 5 + col) ? (r() < 0.5 ? 'x' : 'X') : ' ';
    out.push(s);
  }
  return out;
}

// ctx: { seed, nodeId, idx, n, tell, prevSafe, loot, mark }
function genLayer(ctx) {
  const { seed, nodeId, idx, n, tell, prevSafe, loot, mark, salt } = ctx;
  // salt: after a resumed save, layers come out different (no replaying a layer you saw)
  const r = salt ? rngFor(seed, 'layer', nodeId, idx, 'r' + salt) : rngFor(seed, 'layer', nodeId, idx);
  const { cols, rows } = gridFor(n);
  const cells = [];
  for (let i = 0; i < cols * rows; i++) cells.push(i);
  shuffle(cells, r);
  const tiles = cells.slice(0, n).map(cell => ({
    cell, col: cell % cols, row: Math.floor(cell / cols),
    glyph: null, safe: false, loaded: false, marked: false, ruledOut: false,
    state: 'closed', hidden: false, probing: false, dist: null,
  }));
  const setCell = (t, cell) => { t.cell = cell; t.col = cell % cols; t.row = Math.floor(cell / cols); };

  // Pick the safe tile, following the position tell most of the time.
  let safe = tiles[Math.floor(r() * n)];
  const follow = r() < (ctx.tellStr != null ? ctx.tellStr : CONFIG.tellStrength);
  const targets = n > 1 ? tellCells(tell, cols, rows, prevSafe) : null;
  if (targets && follow) {
    let cand = tiles.filter(t => targets.includes(t.cell));
    if (!cand.length) {
      const used = new Set(tiles.map(t => t.cell));
      const free = targets.filter(c => !used.has(c));
      if (free.length) { const t = pickR(tiles, r); setCell(t, pickR(free, r)); cand = [t]; }
    }
    if (cand.length) safe = pickR(cand, r);
  }
  safe.safe = true;

  // Glyphs. A mark tell puts the signature on the safe tile and some decoys.
  const isMark = tell === 'mark' && mark;
  const pool = MOTIFS.filter(m => {
    if (!isMark) return true;
    if (mark.level === 1) return m.join('|') !== mark.glyph.join('|');
    if (mark.level === 2) return shapeOf(m) !== X_MASK;
    return !/[xX]/.test(m.join(''));
  });
  const deck = shuffle(pool.slice(), r);                         // no two nodes share a glyph
  tiles.forEach((t, i) => { t.glyph = deck[i % deck.length]; });
  if (isMark && n > 1) {
    const others = shuffle(tiles.filter(t => !t.safe), r);
    const k = Math.min(others.length, Math.max(1, Math.round((n - 1) * CONFIG.markDecoyFrac)));
    for (const t of [safe, ...others.slice(0, k)]) { t.marked = true; t.glyph = signedGlyph(mark, r); }
  }
  if (n === 1) tiles[0].glyph = JACK_GLYPH;

  // Loaded ICE: a known trap that drops loot when hit.
  if (loot && (ctx.lootSure || (n >= (ctx.lootMore ? 3 : 4) && r() < (ctx.lootMore ? 0.85 : CONFIG.lootChance)))) {   // lootSure: the training
    const opts = tiles.filter(t => !t.safe && !t.marked);
    if (opts.length) { const t = pickR(opts, r); t.loaded = true; t.glyph = LOOT_GLYPH; }
  }

  // Corp kit: the corp dresses the nodes ($ nodes stay as they are). The tell goes on the
  // real node, or on a random node when this layer doesn't follow the tell.
  const lv = { n, cols, rows, tiles };
  if (ctx.dress && n > 1) {
    const dressable = tiles.filter(t => !t.loaded);
    const tellTile = follow || ctx.alwaysFollow ? safe : pickR(dressable, r);
    ctx.dress(lv, { r, follow, real: safe, tellTile, tiles: dressable, tier: ctx.tier || 1, boss: !!ctx.boss, idx,
      carry: ctx.carry || null, corpR: rngFor(seed, 'corp', nodeId), seed });
  }

  tiles.sort((a, b) => a.cell - b.cell);
  return Object.assign(lv, { safe: tiles.findIndex(t => t.safe), safeCell: { col: safe.col, row: safe.row } });
}
