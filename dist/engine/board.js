// NeoN+1 engine/board.js: the layer's board (buildBoard) and COIN FLIP's coin box and multiplier pop.
// Moved out of engine/scene.js (2026-11-05). buildScene (engine/scene.js) calls buildBoard each frame.
'use strict';
NEON_FILES.push(['engine/board.js', 'v14.47']);

function buildBoard({ now, put, addHit, bg, cells }) {
  const lv = st.lv;
  if (lv.litRow != null && bg) for (const t of lv.tiles) if (t.row === lv.litRow && t.state === 'closed') {
    const { tx, ty } = tileOrigin(t);
    for (let k = 0; k < TILE_H; k++) bg(tx, ty + k, TILE_W, C.accent, 0.12);
  }
  // X-AXIS / Y-AXIS: a color band fills along the scanned line at the scan's pace. A hit fills
  // from the tapped node to the real node and stays (the real node glows); a miss fills out
  // to both edges, dimmer, and fades.
  const sc = lv.scan;
  if (sc && bg && sc.from) for (const ax of sc.axes) {
    const across = ax === 'xaxis', f0 = sc.from, a = tileOrigin(f0);
    const prog = (now - sc.t0) / SCAN_STEP;   // in nodes
    const pos = across ? f0.col : f0.row, n = across ? lv.cols : lv.rows;
    let lo = 0, hi = 0, alpha = 0.22, done = 0;
    if (sc.real) {
      const d = (across ? sc.real.col : sc.real.row) - pos;
      if (d > 0) hi = Math.min(prog, d); else lo = Math.min(prog, -d);
    } else {
      lo = Math.min(prog, pos); hi = Math.min(prog, n - 1 - pos); done = Math.max(pos, n - 1 - pos);
      alpha = 0.14 * Math.max(0, 1 - Math.max(0, now - sc.t0 - done * SCAN_STEP) / 450);
    }
    if (alpha <= 0) continue;
    if (across) {
      const p = TILE_W + GAP_X, x0 = a.tx - lo * p, x1 = a.tx + TILE_W + hi * p;
      for (let k = 0; k < TILE_H; k++) bg(x0, a.ty + k, x1 - x0, C.accent, alpha);
    } else {
      const p = TILE_H + GAP_Y, y0 = Math.round(a.ty - lo * p), y1 = Math.round(a.ty + TILE_H + hi * p);
      for (let y = y0; y < y1; y++) bg(a.tx, y, TILE_W, C.accent, alpha);
    }
    if (sc.real && prog >= scanDist(f0, sc.real)) {   // reached: the real node glows, pulsing
      const r = tileOrigin(sc.real), pulse = 0.25 + 0.15 * Math.sin((now - sc.t0) / 70);
      for (let k = 0; k < TILE_H; k++) bg(r.tx, r.ty + k, TILE_W, C.accent, pulse);
    }
  }
  const used = new Set();
  const masked = lv.maskAt && now > lv.maskAt;
  const boardDef = st.corp && st.corp.hasBoss ? st.corp.def : null;
  // A node's own clock for its animation: it stops while the node is frozen. FREEZE FRAME
  // freezes all but the real node; STREAMFLIX's buffering freezes all but the live one.
  const fzOn = lv.freeze && now < lv.freeze.until;
  const bufAt = boardDef && boardDef.bufferAt ? boardDef.bufferAt(lv, now) : null;
  const liveTime = t => fzOn && !t.safe ? lv.freeze.from : bufAt != null && !t.tell ? bufAt : now;
  // A lit row: LIFTCO's lift (or EXPRESS), WATCHPOINT's camera. Marker on the left edge.
  const bands = [];
  if (lv.lift) { const row = liftRow(lv, now); if (row != null) bands.push({ row, col: C.accent, ch: '>' }); }
  if (boardDef && boardDef.band) { const b = boardDef.band(lv, now); if (b) bands.push(b); }
  if (bg) for (const b of bands) {
    for (let col = 0; col < lv.cols; col++) {
      const { tx, ty } = tileOrigin({ col, row: b.row });
      for (let k = 0; k < TILE_H; k++) bg(tx, ty + k, TILE_W, b.col, 0.1);
    }
    const { tx, ty } = tileOrigin({ col: 0, row: b.row });
    if (tx >= 1) put(tx - 1, ty + 2, b.ch, b.col, 'fx', true);
  }
  lv.tiles.forEach((t, i) => {
    used.add(t.cell);
    if (t.slide) used.add(Math.round(t.slide.fr) * lv.cols + Math.round(t.slide.fc));   // no dot under a moving node
    const { tx, ty } = tileOrigin(t);
    if (t.wide) used.add(t.cell + 1);
    if (t.state === 'closed') addHit(tx, ty, t.wide ? TILE_W * 2 + GAP_X : TILE_W, TILE_H, { kind: 'tile', i });
    else if (boardDef && boardDef.cellTap) addHit(tx, ty, TILE_W, TILE_H, { kind: 'cell', cell: t.cell });
    if (t.hidden) return;
    if (t.wide) {   // TWINLINK's boss: a node two cells wide (always ICE)
      const ww = TILE_W * 2 + GAP_X, gone = t.state === 'locked', hov = (i === st.hover && !st.busy) || t.probing;
      const fc2 = gone ? C.danger : hov ? C.bright : C.mid, gc2 = gone ? C.danger : hov ? C.bright : C.text, solid2 = gone || hov;
      const e2 = '+' + (solid2 ? '-'.repeat(ww - 2) : '- '.repeat((ww - 2) / 2)) + '+', s2 = solid2 ? '|' : ':';
      put(tx, ty, e2, fc2, 't' + i); put(tx, ty + TILE_H - 1, e2, fc2, 't' + i);
      t.glyph.forEach((l, k) => { put(tx, ty + 1 + k, s2, fc2, 't' + i); put(tx + ww - 1, ty + 1 + k, s2, fc2, 't' + i); put(tx + Math.floor((ww - 5) / 2), ty + 1 + k, l, gc2, 't' + i, gone); });
      return;
    }
    const own = 't' + i;
    // A node you hit stays on the board, bold and red.
    if (t.state === 'locked' && t.lockedBy === 'hit') {
      const fresh = now - t.hitAt < 220;   // brief glitch right after the hit
      // SHATTER: no damage, so it's cracked glass, not a red hit
      if (t.shattered && !t.klog && !t.dir) {
        const rows = ['+-. .-+', '| \\|/ |', '|--*--|', '| /|\\ |', '+-\' \'-+'];
        rows.forEach((r, k) => put(tx, ty + k, r, k === 2 && fresh ? C.bright : C.mid, own, k > 0 && k < 4));
        return;
      }
      // ICE EATER: an eaten node is crumbs (keylogger / tracer marks still show on it)
      if (t.eaten && !t.klog && !t.dir && !t.loaded) {
        const rows = ['+ - . -+', ':. , .:', ' ,.:. ', ':. ` ,:', '+-. - +'];
        rows.forEach((r, k) => put(tx, ty + k, r, fresh ? C.accent : C.dim, own));
        return;
      }
      const glyphCol = t.klog ? C.accent : t.loaded ? C.money : t.shattered || t.eaten ? C.mid : C.danger;   // keylogger lines stand out
      // TRACER: the sides facing the real node turn into arrows (< > sides, ^ v top / bottom).
      // They appear with TRACER's callout after the hit (t.dirAt), blinking a moment.
      const d = t.dir && !(t.dirPending && !t.dirAt) ? t.dir : { h: 0, v: 0 };
      const sl = d.h < 0 ? '<' : '|', sr = d.h > 0 ? '>' : '|';
      // KEYLOGGER: the key line types in with its callout (t.klogAt)
      const typed = t.klog ? (t.klogAt ? Math.floor((now - t.klogAt) / 35) : 0) : 99;
      const glyph = t.glyph.map(l => typed >= l.length ? l : l.slice(0, typed) + ' '.repeat(l.length - typed));
      let rows = [d.v < 0 ? '+^^^^^+' : '+-----+', ...glyph.map(l => sl + l + sr), d.v > 0 ? '+vvvvv+' : '+-----+'];
      if (fresh) rows = rows.map(r => r.replace(/[^ ]/g, ch => Math.random() < 0.6 ? noiseCh() : ch));
      const arrowCol = t.dirAt && now - t.dirAt < 800 && Math.floor((now - t.dirAt) / 120) % 2 ? C.accent : C.bright;
      const edgeCol = ch => !fresh && '<>^v'.includes(ch) ? arrowCol : t.shattered || t.eaten ? C.mid : C.danger;
      rows.forEach((r, k) => {
        const isEdge = k === 0 || k === rows.length - 1;
        put(tx, ty + k, r[0], edgeCol(r[0]), own, true);
        put(tx + 1, ty + k, r.slice(1, TILE_W - 1), isEdge ? edgeCol(r[1]) : glyphCol, own, true);
        put(tx + TILE_W - 1, ty + k, r[TILE_W - 1], edgeCol(r[TILE_W - 1]), own, true);
      });
      return;
    }
    if (t.state === 'locked') {
      // Switched off by an item or mod: the whole tile in dim red, with a label
      // saying what did it (and the mod's code, for mods).
      let [word, code] = LOCK_LABEL[t.lockedBy] || ['INERT', ''];
      if (t.lockedBy === 'demo') { word = lv.boss && now - t.hitAt > 1200 ? '?' : String(t.demoN); code = ''; }   // DEMOLITION
      const mid5 = str => { const l = Math.floor((5 - str.length) / 2); return (' '.repeat(l) + str).padEnd(5); };
      const rows = ['+-----+', '|' + t.glyph[0] + '|', '|' + mid5(word) + '|', '|' + (code ? mid5(code) : t.glyph[2]) + '|', '+-----+'];
      const lc = ['xaxis', 'yaxis', 'virus'].includes(t.lockedBy) ? C.accent : C.dangerDim;   // scans and VIRUS: the mod's color
      rows.forEach((r, k) => {
        put(tx, ty + k, r[0], lc, own);
        put(tx + 1, ty + k, r.slice(1, TILE_W - 1), k === 2 ? C.text : k === 3 && code ? C.mid : lc, own, k === 2);
        put(tx + TILE_W - 1, ty + k, r[TILE_W - 1], lc, own);
      });
      return;
    }
    let solid = false, fc = C.mid, gc = C.text, bold = false;
    if (st.sel === i && t.state === 'closed') {   // drag-to-select: the picked-out node, tap again to confirm
      const { tx: sx, ty: sy } = tileOrigin(t);
      put(sx - 1, sy + 2, '>', C.bright, 'fx', true); put(sx + TILE_W, sy + 2, '<', C.bright, 'fx', true);
    }
    if (t.loaded) { fc = C.dangerDim; gc = C.money; }
    if (t.ruledOut) { fc = C.dim; gc = C.dim; }
    if (t.state === 'safe' || t.state === 'reveal') { solid = true; fc = C.accent; gc = C.accent; }
    else if (t.probing || st.sel === i || (i === st.hover && !st.busy && !(st.press && st.press.moved))) { solid = true; fc = C.bright; if (!t.loaded) gc = C.bright; }
    // X-AXIS / Y-AXIS scan (lv.scan, set in engine/run.js): nodes on the line light up as the
    // scan reaches them. A hit stays lit and the real node glows; a miss is dim and fades.
    const sc = lv.scan;
    if (sc && t.state === 'closed' && t !== sc.from && sc.axes.some(a => a === 'xaxis' ? t.row === sc.from.row : t.col === sc.from.col)) {
      const age = now - sc.t0 - scanDist(t, sc.from) * SCAN_STEP;
      if (sc.real && age >= 0) { solid = true; fc = t === sc.real ? C.bright : C.accent; if (t === sc.real) { gc = C.bright; bold = true; } }
      else if (!sc.real && age >= 0 && age < 450 && !solid) { fc = C.accent; }
    }
    // ICE EATER: a scan found the real node's line (lv.warn): its nodes keep a red frame
    if (lv.warn && t.state === 'closed' && !solid && fc === C.mid && (lv.warn.row === t.row || lv.warn.col === t.col)) fc = C.danger;
    if (t.zd && t.state === 'closed') { solid = true; fc = C.money; gc = C.money; bold = true; }   // 0DAY / PING: the real node, marked
    const edge = solid ? '+-----+' : '+- - -+';
    const side = solid ? '|' : ':';
    let glyph = masked && t.state === 'closed' && !t.loaded ? MASK_GLYPH : t.glyph;
    // Node animation (corp fx), plus PIXEL PEEP and FREEZE FRAME's twitch on the real node.
    let dx = 0, dy = 0, kern = null, over = null, corner = null, frame = null, clip = false;
    if (t.say && t.state === 'closed') glyph = normMotif(t.say.length > 2 ? t.say : ['', ...t.say]);   // TURING, SNITCH (3 lines: NOT / ME / its arrow)
    if (t.brand && t.state === 'closed') corner = { corner: 's', cornerCol: C.money };   // BRANDED
    if (st.corp && st.corp.mod === 'armored' && t.state === 'closed') frame = { frame: ['#=====#', '#=====#'], side: '#' };   // ARMORED
    // CCTV: one ICE flashes ### a second into the layer
    if (lv.cctv && lv.cctv.t === t && t.state === 'closed' && lv.shownAt != null && now - lv.shownAt > lv.cctv.at && now - lv.shownAt < lv.cctv.at + 300) { glyph = ICE_FLASH; gc = C.danger; modFiredOnce('cctv', lv); }
    if (t.state === 'closed' && !masked && !t.loaded) {
      const live = liveTime(t, now);
      const fx = boardDef && boardDef.fx ? boardDef.fx(t, live, lv, i) : null;
      if (fx) {
        dx = fx.dx || 0; dy = fx.dy || 0; kern = fx.kern || null; over = fx.over || null;
        if (fx.glyph) glyph = fx.glyph;
        if (fx.gc && !solid) gc = fx.gc;
        if (fx.fc && !solid) fc = fx.fc;
        if (fx.corner) corner = fx;
        if (fx.frame) frame = fx;
        if (fx.clip) clip = true;
        if (fx.line) glyph = glyph.map((l, k) => k === fx.line[0] ? fx.line[1] : l);
        if (!solid && fx.dim) { fc = C.dim; gc = C.dim; }
        if (!solid && fx.bright) { fc = C.text; gc = C.bright; bold = true; }
      }
      if (lv.prismRow === t.row && !solid) fc = C.accent;   // PRISM
      if (has('infrared') && st.corp && st.corp.hasBoss && !lv.pred && lv.n > 1 && lv.shownAt != null && now - lv.shownAt < 1000 && !solid) {
        const v = t.safe ? 0.85 + 0.15 * h01(i, 3) : 0.78 * h01(i, 7 + lv.n);
        glyph = heatGlyph(v, i * 17, now); gc = heatCol(v); modFiredOnce('infrared', lv);
      }
      if (t.safe) {
        if (lv.peepAt && now - lv.peepAt < 1000) dx += 2 / L.cw;
        if (lv.freeze && now - lv.freeze.from < 200) dx += 0.18 * Math.sin((now - lv.freeze.from) / 16);
      }
    }
    if (kern) glyph = glyph.map((l, k) => k === kern.ln ? ' '.repeat(l.length) : l);
    // UPSIDE: the real node is drawn the right way up (its cells get turned back)
    const upr = !!(boardDef && boardDef.flip && t.safe && t.state === 'closed' && !masked && cells);
    if (upr) glyph = glyph.slice().reverse().map(l => [...l].reverse().join(''));
    const c0 = cells ? cells.length : 0;
    let rows = frame ? [frame.frame[0], ...glyph.map(l => frame.side + l + frame.side), frame.frame[1]] : [edge, ...glyph.map(l => side + l + side), edge];
    if (corner) rows[0] = rows[0].slice(0, TILE_W - 1) + ' ';
    if (t.probing) rows = rows.map(r => r.replace(/[^ ]/g, ch => Math.random() < 0.5 ? noiseCh() : ch));
    if (t.infectAt) {   // VIRUS spreading into it: it glitches, more and more, in the mod's color
      const f = Math.min(1, (now - t.infectAt) / 420);
      rows = rows.map(r => r.replace(/[^ ]/g, ch => Math.random() < 0.25 + 0.6 * f ? noiseCh() : ch));
      fc = C.accent; gc = C.accent;
    }
    // ZOMBIE: a cracked node (weak taps). Cracks spread over it as the count climbs, the bottom
    // edge counts taps (3/11), and it jolts on each tap. Looks the same for ICE and the real node.
    if (t.cracks && t.state === 'closed' && zombie()) {
      const need = tapsToBreak(), f = Math.min(1, t.cracks / need), CR = '/\\.`,';
      rows = rows.map((r, k) => k === 0 || k === rows.length - 1 ? r : [...r].map((ch, x) =>
        x > 0 && x < TILE_W - 1 && h01(i * 31 + k * 7 + x, 5) < f * 0.6 ? CR[(x + k + i) % CR.length] : ch).join(''));
      const cnt = `${t.cracks}/${need}`;
      if (cnt.length <= TILE_W - 2) { const l = Math.floor((TILE_W - 2 - cnt.length) / 2); rows[rows.length - 1] = '+' + '-'.repeat(l) + cnt + '-'.repeat(TILE_W - 2 - l - cnt.length) + '+'; }
      if (now - (t.crackAt || 0) < 120) dx += 0.15 * Math.sin((now - t.crackAt) / 12);
      fc = C.mid;
    }
    const ox = tx + dx, oy = ty + dy;
    rows.forEach((r, k) => {
      if (clip && oy + k < BOARD_Y - 0.5) return;   // DROP-4: chips falling in from above the board
      const isEdge = k === 0 || k === rows.length - 1;
      put(ox, oy + k, r[0], fc, own);
      put(ox + 1, oy + k, r.slice(1, TILE_W - 1), isEdge ? fc : gc, own, bold && !isEdge);
      put(ox + TILE_W - 1, oy + k, r[TILE_W - 1], fc, own);
    });
    if (upr) for (let k = c0; k < cells.length; k++) cells[k].r180 = true;
    if (kern) put(ox + 1 + kern.px / L.cw, oy + 1 + kern.ln + kern.py / L.chh, t.glyph[kern.ln], gc, own, bold);
    if (over) for (const o of over) put(ox + o.dx, oy + o.dy, o.ch, o.col || gc, 'fx');
    if (corner) put(ox + TILE_W - 1, oy, corner.corner, corner.cornerCol || gc, own, true);
    if (st.debug && t.safe && t.state === 'closed') put(tx + TILE_W - 1, ty, '*', C.accent, own);
    if (st.kbGrid && i === st.hover && !st.busy && Math.floor(now / 280) % 2) {
      for (const [cx, cy] of [[tx, ty], [tx + TILE_W - 1, ty], [tx, ty + TILE_H - 1], [tx + TILE_W - 1, ty + TILE_H - 1]]) put(cx, cy, '#', C.accent, own, true);
    }
  });
  for (let cell = 0; cell < lv.cols * lv.rows; cell++) {
    if (used.has(cell)) continue;
    const { tx, ty } = tileOrigin({ col: cell % lv.cols, row: Math.floor(cell / lv.cols) });
    if (boardDef && boardDef.cellTap) addHit(tx, ty, TILE_W, TILE_H, { kind: 'cell', cell });
    const lab = boardDef && boardDef.cellLabel ? boardDef.cellLabel(lv, cell) : null;
    if (lab) put(tx + 3 - Math.floor(lab.length / 2), ty + 2, lab, C.accent, 'dot', true);
    else {
      // X-AXIS / Y-AXIS: the scan lights the empty cells on its line too (- for a row, | for a column)
      const sc = lv.scan, c = { col: cell % lv.cols, row: Math.floor(cell / lv.cols) };
      const ax = sc && sc.axes.find(a => a === 'xaxis' ? c.row === sc.from.row : c.col === sc.from.col);
      const age = ax ? now - sc.t0 - scanDist(c, sc.from) * SCAN_STEP : -1;
      const wr = lv.warn && (lv.warn.row === c.row ? '-' : lv.warn.col === c.col ? '|' : null);   // ICE EATER: a warning line
      if (ax && age >= 0 && (sc.real || age < 450)) put(tx + 3, ty + 2, ax === 'xaxis' ? '-' : '|', C.accent, 'dot', !!sc.real);
      else if (wr) put(tx + 3, ty + 2, wr, C.danger, 'dot');
      else put(tx + 3, ty + 2, '.', C.dim, 'dot');
    }
  }
  // corp marks beside a cell (LAGRANGE's early echo and your sent tap)
  if (boardDef && boardDef.marks) for (const m of boardDef.marks(lv, now) || []) {
    const { tx, ty } = tileOrigin({ col: m.cell % lv.cols, row: Math.floor(m.cell / lv.cols) });
    put(tx - 1, ty + 2, m.l || '>', m.col, 'fx', true); put(tx + TILE_W, ty + 2, m.r || '<', m.col, 'fx', true);
  }
  if (boardDef && boardDef.draw) boardDef.draw(put, lv, now);
  if (lv.hks) buildHackers({ put, bg }, lv, now);
  corpHook('overlay', { put, bg, cells }, lv, now);   // a corp's own drawing over its board (G0D MAZE: b0y)
  if (st.hkFx) buildHkFx({ put, bg }, now);   // a hacker going down (engine/hackers.js)   // hackers: cursors, faces, emote covers, DENIED, fire, tape (engine/hackers.js)
  // AFTERIMAGE: cyan corners where the last layer's real node was.
  if (has('afterimage') && lv.after && lv.after.col < lv.cols && lv.after.row < lv.rows) {
    if (lv.shownAt != null) modFiredOnce('afterimage', lv);
    const { tx, ty } = tileOrigin(lv.after);
    const t = lv.tiles.find(o => o.col === lv.after.col && o.row === lv.after.row);
    if (t && t.state === 'closed' && !t.hidden) {
      put(tx, ty, '+', C.accent, 'fx', true);
      put(tx + TILE_W - 1, ty + TILE_H - 1, '+', C.accent, 'fx', true);
    } else if (!t) put(tx + 3, ty + 2, 'o', C.accent, 'fx');
  }
  drawCoin(put, bg, now, lv, cells);
  drawCoinPop(put, bg, now, cells);
}

// Overlays (the coin box, the multiplier pop): drop whatever was drawn under a rectangle,
// since characters always draw over backgrounds.
const clearRect = (cells, x0, y0, w, h) => { for (let k = cells.length - 1; k >= 0; k--) { const c = cells[k]; if (c.cx >= x0 - 0.5 && c.cx < x0 + w - 0.5 && c.cy >= y0 - 0.5 && c.cy < y0 + h - 0.5) cells.splice(k, 1); } };
// COIN FLIP: the coin box over a held node. Two node-sized faces side by side (a coin spinning
// between them), above the node (below it on the top row), drawn over the board.
function drawCoin(put, bg, now, lv, cells) {
  const cn = st.coin, t = cn && lv.tiles[cn.i];
  if (!t) return;
  const { tx, ty } = tileOrigin(t);
  const w = TILE_W * 2 + 3, x0 = clamp(tx + Math.floor(TILE_W / 2) - Math.floor(w / 2), 0, L.wc - w);
  const y0 = cn.below ? ty + TILE_H : ty - TILE_H;
  clearRect(cells, x0, y0, w, TILE_H);   // drawn over whatever is under it
  for (let r = 0; r < TILE_H; r++) bg(x0, y0 + r, w, C.bg, 1);
  const spinning = cn.flipAt && cn.landed == null;
  const lit = spinning ? Math.floor(now / 90) % 2 : cn.landed != null ? cn.landed : cn.side;
  cn.faces.forEach((f, k) => {
    const x = x0 + k * (TILE_W + 3), on = lit === k, chosen = cn.side === k;
    const sym = f.kind === 'hp' ? '♥' : '$';
    const amt = String(cn.vals ? cn.vals[k] : coinValue(f));
    const mid = s => { const l = Math.floor((TILE_W - 2 - s.length) / 2); return (' '.repeat(l) + s).padEnd(TILE_W - 2); };
    const res = cn.landed != null && chosen ? (cn.landed === k ? 'WIN' : 'LOSE') : f.big ? 'BIG' : '';
    const rows = [on ? '+-----+' : '+- - -+', '|' + mid(sym) + '|', '|' + mid(amt) + '|', '|' + mid(res) + '|', on ? '+-----+' : '+- - -+'];
    const col = f.kind === 'hp' ? C.danger : C.money;
    const fc = on ? C.bright : chosen ? col : C.mid;
    if (on && !spinning) bg(x, y0, TILE_W, col, 0.25);
    rows.forEach((r, i) => put(x, y0 + i, r, fc, 'fx', on));
    put(x + 1, y0 + 1, mid(sym), col, 'fx', true);
    if (res) put(x + 1, y0 + 3, mid(res), res === 'LOSE' ? C.danger : res === 'WIN' ? C.accent : C.money, 'fx', true);
  });
  // the coin between the faces: spins while it's up, fast while flipping
  const spin = '|/-\\'[Math.floor(now / (spinning ? 60 : 160)) % 4];
  put(x0 + TILE_W + 1, y0 + 2, cn.landed != null ? 'o' : spin, C.money, 'fx', true);
  if (!cn.flipAt) put(x0 + TILE_W, y0 + (cn.below ? 4 : 0), '< >', C.dim, 'fx');   // drag to a side
}
// COIN FLIP: the multiplier went up: a boxed xN drops onto the board, bounces, then fades.
function drawCoinPop(put, bg, now, cells) {
  const p = st.coinPop;
  if (!p) return;
  const age = now - p.at;
  if (age > 1300) { st.coinPop = null; return; }
  const txt = ` x ${p.m} `, w = txt.length + 2, x0 = Math.floor((L.wc - w) / 2);
  const land = p.y, fall = Math.min(1, age / 320);
  const bounce = age < 320 ? 0 : Math.max(0, Math.sin((age - 320) / 90) * 0.6 * Math.exp(-(age - 320) / 160));
  const y = land - 5 * (1 - fall) * (1 - fall) - bounce;
  const cols = [C.money, C.accent, C.bright, C.exotic || C.money];
  const col = cols[Math.floor(now / 90) % cols.length];
  clearRect(cells, x0, Math.round(y), w, 3);
  for (let r = 0; r < 3; r++) bg(x0, Math.round(y) + r, w, C.bg, 1);
  put(x0, y, '+' + '='.repeat(w - 2) + '+', col, 'fx', true);
  put(x0, y + 1, '|' + txt + '|', col, 'fx', true);
  put(x0, y + 2, '+' + '='.repeat(w - 2) + '+', col, 'fx', true);
}
