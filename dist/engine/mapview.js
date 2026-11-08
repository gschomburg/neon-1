// NeoN+1 engine/mapview.js: the run's map (buildMap), the results screen's map (drawMapView), and a node's info.
// Moved out of engine/scene.js (2026-11-05).
'use strict';
NEON_FILES.push(['engine/mapview.js', 'v14.63']);

// Map: final node at the top, start at the bottom. Edges are dotted lines.
// x for a node; start / final nodes sit in the middle lane.
const mapX = n => {
  const mid = Math.floor(L.wc / 2);
  return n.type === 'start' || (n.type === 'final' && n.lane === 1) ? mid : mid + (n.lane - 1) * 11;   // (EENY MEENY's other bosses: in their lanes)
};

// Rows of the whole map (top = the newest OMNI), and a node's row in it.
const mapRows = (map = st.run.map) => mapTop(map) * 3 + 1;
const mapRowOf = (n, map = st.run.map) => (mapTop(map) - n.step) * 3;
const SECTOR_ROWS = SECTOR_STEPS * 3 + 1; // one sector on screen: 16 rows

// Dotted link between two nodes. Sideways links (same row) run between the brackets.
function linkDots(a, b, f) {
  if (a.row === b.row) {
    const lo = Math.min(a.x, b.x) + 2, hi = Math.max(a.x, b.x) - 2, out = [];
    for (let x = lo + 1; x < hi; x += 2) out.push({ x, row: a.row, ch: '-' });
    return out;
  }
  const out = [];
  for (let k = 1; k < 6; k++) { const t = k / 6; out.push({ x: a.x + (b.x - a.x) * t, row: a.row + (b.row - a.row) * t }); }
  return out;
}

// Corp node colors on the map: the corp's own palette behind its code. If that
// background is too close to the map's, use the corp's dim color instead so it reads.
const hexLum = h => { const v = parseInt(String(h).slice(1), 16); return ((v >> 16) * 0.299 + ((v >> 8) & 255) * 0.587 + (v & 255) * 0.114) / 255; };
function corpIconCols(n) {
  if ((n.type !== 'corp' && n.type !== 'final') || blinded(n)) return null;   // (BLINDERS: plain, no corp colors)
  const p = PALETTES['c_' + n.corp];
  if (!p) return null;
  const bgc = Math.abs(hexLum(p.bg) - hexLum(C.bg)) < 0.08 ? p.dim : p.bg;
  return { bg: bgc, fg: p.accent };
}

// The run's map on the results screen: the path you took lit, the rest dim, an X
// where you were traced. Shows rows top..top+h of the map, at screen row y.
function drawMapView(ctx, y, ln) {
  const { put } = ctx;
  // A line can be one row (k) of a view viewH tall, so the view can come in row by row.
  const r = ln.r, map = r.map, top = ln.top, k0 = ln.k || 0, h = ln.k != null ? ln.viewH : ln.h;
  y -= k0;   // y is now where the view's first row is
  const pos = n => ({ x: mapX(n), row: mapRowOf(n, map) });
  const lo = ln.k != null ? Math.max(top - 0.01, top + k0 - 0.5) : top - 0.01;
  const hi = ln.k != null ? Math.min(top + h - 0.99, top + k0 + 0.49) : top + h - 0.99;
  const inView = row => row >= lo && row <= hi;
  const onPath = (a, b) => { const i = r.visited.indexOf(a); return i >= 0 && r.visited[i + 1] === b; };
  for (const n of Object.values(map)) {
    for (const id of n.next) {
      const m = map[id], path = onPath(n.id, m.id) || onPath(m.id, n.id);
      for (const d of linkDots(pos(n), pos(m))) if (inView(d.row)) put(d.x, y + d.row - top, d.ch || '·', path ? C.accent : C.dim, 'board');
    }
  }
  for (const n of Object.values(map)) {
    const p = pos(n);
    if (!inView(p.row)) continue;
    const visited = r.visited.includes(n.id), dead = !r.win && n.id === r.at;
    const col = dead ? C.danger : visited ? C.accent : n.type === 'final' ? C.dangerDim : C.dim;
    put(p.x - 1, y + p.row - top, nodeLabel(n), col, 'board', dead || visited);
    if (dead) put(p.x - 3, y + p.row - top, 'X', C.danger, 'board', true);
    if (r.win && n.id === r.at) put(p.x - 3, y + p.row - top, '@', C.bright, 'board', true);
  }
  // more above / below: arrows in both margins (clear of the nodes)
  const blink = Math.floor(performance.now() / 600) % 2 ? C.mid : C.dim;
  const first = ln.k == null || ln.k === 0, last = ln.k == null || ln.k === h - 1;
  if (ln.noArrows) return;   // (the game-over screen has "more" rows instead)
  if ((top > 0 || ln.above) && first) { put(0, y, '^', blink, 'board'); put(L.wc - 1, y, '^', blink, 'board'); }
  if (top + h < mapRows(map) && last) { put(0, y + h - 1, 'v', blink, 'board'); put(L.wc - 1, y + h - 1, 'v', blink, 'board'); }
}

function buildMap(ctx) {
  const { now, put, addHit, putC } = ctx;
  const run = st.run, map = run.map;
  const avail = new Set(availableNodes());
  const nodes = Object.values(map);
  const mv = st.mapView || { row: sectorViewRow(run.sector), sector: run.sector };
  stepMapView(now);
  // Screen y for a map row, and whether it's inside the map area.
  const yOf = row => BOARD_Y + row - mv.row;
  const shown = row => row - mv.row >= -0.01 && row - mv.row <= SECTOR_ROWS - 0.99;
  const pos = n => ({ x: mapX(n), row: mapRowOf(n) });
  const settled = mv.row === mv.target;

  for (const n of nodes) {
    for (const id of n.next) {
      const m = map[id];
      const vi = run.visited.indexOf(n.id), mi = run.visited.indexOf(m.id);
      const onPath = (vi >= 0 && run.visited[vi + 1] === m.id) || (mi >= 0 && run.visited[mi + 1] === n.id);
      const live = run.at === n.id && avail.has(m.id);
      const col = onPath ? C.accent : live ? C.mid : C.dim;
      for (const d of linkDots(pos(n), pos(m))) if (shown(d.row)) put(d.x, yOf(d.row), d.ch || '·', col, 'map');
    }
  }
  // MESH (the user, 2026-10-31: its links didn't show): every node to every node in the next row, all sector (so they
  // are still there after a corp), and on the row under the boss the nodes beside you; drawn after the map's own links, only where the cell is free (cells stack)
  if (run.mesh === run.sector) {
    const used = new Set(ctx.cells.filter(c => c.own === 'map').map(c => Math.round(c.cx) + ',' + Math.round(c.cy)));
    const sec = run.sector || 0, linked = (a, b) => a.next.includes(b.id) || b.next.includes(a.id);
    const meshLink = (n, m) => {
      const vi = run.visited.indexOf(n.id), mi = run.visited.indexOf(m.id);
      const onPath = (vi >= 0 && run.visited[vi + 1] === m.id) || (mi >= 0 && run.visited[mi + 1] === n.id);
      const col = onPath ? C.accent : run.at === n.id && avail.has(m.id) ? C.mid : C.dim;
      for (const d of linkDots(pos(n), pos(m))) { const y = yOf(d.row), k = Math.round(d.x) + ',' + Math.round(y); if (!shown(d.row) || used.has(k)) continue; used.add(k); const ch = d.ch || '·'; put(d.x, y, ch === '·' ? ':' : ch, col, 'map'); }
    };
    for (const n of nodes) if ((n.sector || 0) === sec) for (const m of nodes) if ((m.sector || 0) === sec && m.step === n.step + 1 && !linked(n, m)) meshLink(n, m);
    const cur = map[run.at];
    if (cur) for (const m of meshSides()) if (!linked(cur, m)) meshLink(cur, m);
  }
  // TUNNEL (the user, 2026-11-06: it never drew): armed, a line from you to each node in your row you can dig to; dug,
  // the path you took stays. '=' between the nodes, clear of any node in the way.
  {
    const cur = map[run.at], dig = (run.dug || []).filter(([a, b]) => map[a] && map[b]).map(([a, b]) => [map[a], map[b], true]);
    if (run.tunnel && cur) for (const m of rowMates()) dig.push([cur, m, false]);
    for (const [a, b, done] of dig) {
      if (a.next.includes(b.id) || b.next.includes(a.id)) continue;   // (already linked: its own line shows)
      const xs = nodes.filter(o => o.step === a.step).map(mapX);
      for (const d of linkDots(pos(a), pos(b))) if (shown(d.row) && !xs.some(x => Math.abs(d.x - x) <= 2)) put(d.x, yOf(d.row), '=', done ? C.accent : C.mid, 'map');
    }
  }
  for (const n of nodes) {
    const p = pos(n);
    if (!shown(p.row)) continue;
    const y = yOf(p.row);
    const visited = run.visited.includes(n.id), available = avail.has(n.id);
    const sel = st.mapSel === n.id, hov = st.hoverNode === n.id;
    let col = visited ? C.accent : C.dim;
    if (available) col = sel ? C.accent : (Math.floor(now / 500) % 2 ? C.bright : C.text);
    // corps in their own colors (not once you've been there)
    const cc = !visited ? corpIconCols(n) : null;
    const label = nodeLabel(n);
    if (cc && label[0] !== '[') {
      ctx.bg(p.x - 1, y, 3, cc.bg, available ? 1 : 0.55);
      // Nodes you can go to: a glint sweeps across the code now and then (that cell's colors
      // swap), each node at its own time. Selected: the code is drawn inverted.
      const g = available ? Math.floor(((now + p.x * 397 + p.row * 211) % 2400) / 90) : -1;
      for (let i = 0; i < 3; i++) {
        const inv = available && (sel || g === i);
        if (inv) ctx.bg(p.x - 1 + i, y, 1, cc.fg, 1);
        put(p.x - 1 + i, y, label[i], inv ? cc.bg : available ? cc.fg : col, 'map', available);
      }
    }
    else if (cc) { ctx.bg(p.x - 1, y, 3, cc.bg, available ? 1 : 0.55); put(p.x - 1, y, '[', col, 'map'); put(p.x, y, label[1], available ? cc.fg : col, 'map', available); put(p.x + 1, y, ']', col, 'map'); }
    else put(p.x - 1, y, label, col, 'map');
    if (hov) ctx.bg(p.x - 1, y, 3, C.accent, 0.25);
    if (n.mod && ANOMALIES[n.mod] && !visited) put(p.x + 2, y, ANOMALIES[n.mod].tag, C.money, 'map', true);   // corp modifier
    if (n.worm && !visited) put(p.x - 2, y, '~', C.accent, 'map', true);   // WORM: sent here
    else if (run.wormAim && holds('worm') && !visited && wormTargets().includes(n) && Math.floor(now / 300) % 2) put(p.x - 2, y, '~', C.mid, 'map');   // WORM armed: where it can go
    else if (!visited && questHintNode(n)) put(p.x - 2, y, '!', C.rep, 'map', true);   // THE DISC: POPS's hint (engine/quests.js)
    if (sel) { put(p.x - 3, y, '>', C.accent, 'map'); put(p.x + 3, y, '<', C.accent, 'map'); }
    else if (run.at === n.id) put(p.x - 3, y, '@', C.bright, 'map');
    if (available && settled) addHit(p.x - 1, y, 3, 1, { kind: 'node', id: n.id });
    else if (settled) addHit(p.x - 1, y, 3, 1, { kind: 'peek', id: n.id, noFocus: true });   // out of reach (or been there: the user, a reminder): it only says what it is
    if (st.tut) st.tut.spots[n.id] = [p.x - 1, y];   // the training points at map spots
  }
  // Which sector you're looking at, and arrows when there's more map below.
  if (run.sector > 0) {
    const v = mv.sector, blink = Math.floor(now / 600) % 2 ? C.mid : C.dim;
    const evs = sectorEvents(v), evk = evs[0], full = `SECTOR ${v + 1}` + (evk ? `: ${evs.map(k => SECTOR_EVENTS[k].name).join(' + ')}` : '');
    const label = full.length <= L.wc - 2 ? full : `SECTOR ${v + 1}: ${SECTOR_EVENTS[evk].name} +1`;   // (2 events that don't fit: +1)
    put(0, BOARD_Y - 1, label, v === run.sector ? C.mid : C.accent, 'map');   // (one up: under the terminal, clear of the map's top row)
    if (evk && settled) addHit(0, BOARD_Y - 1, label.length, 1, { kind: 'btn', id: 'evlabel', noFocus: true, onTap: () => { showEventCard(v, true); Sound.ui(); } });   // see the card again
    if (v > 0) { put(0, BOARD_Y + SECTOR_ROWS - 1, 'v', blink, 'map'); put(L.wc - 1, BOARD_Y + SECTOR_ROWS - 1, 'v', blink, 'map'); }
    if (v < run.sector) { put(L.wc - 1, BOARD_Y - 1, '^', blink, 'map'); }
  }

  // Info panel under the map
  const y0 = BOARD_Y + SECTOR_ROWS;
  const id = st.mapSel || (avail.has(st.hoverNode) ? st.hoverNode : null);
  const peek = !id && (st.hoverNode && map[st.hoverNode] && !avail.has(st.hoverNode) ? st.hoverNode : st.mapPeek && map[st.mapPeek] ? st.mapPeek : null);
  if (peek) {   // a node you can't get to (yet): what it is, no button
    const pn = map[peek], info = nodeInfo(pn), been = run.visited.includes(pn.id);
    info.lines.forEach((ln, k) => putC(y0 + k, ln.text, ln.col, 'map'));
    if (canGoBack(pn)) drawBox(ctx, y0 + info.lines.length, { text: 'G O   B A C K   I N', id: 'goback', onTap: () => goBackIn(pn), minW: 22 });   // the market / PIER / cache you're on
    else putC(y0 + info.lines.length + 1, run.at === pn.id ? 'you are here.' : been ? (pn.type === 'corp' || pn.type === 'final' ? 'breached.' : 'been there.') : 'out of reach from here.', C.dim, 'map');
    return;
  }
  if (!id) {
    if (mv.sector !== run.sector) {
      putC(y0 + 1, `sector ${mv.sector + 1}: cleared.`, C.text, 'map');
      putC(y0 + 3, 'scroll up to get back.', C.dim, 'map');
      return;
    }
    putC(y0 + 1, 'choose a target.', C.text, 'map');
    putC(y0 + 3, 'tap any node to see what it is.', C.dim, 'map');   // (the legend was too many lines: the user, 2026-10-28)
    if (run.sector > 0) putC(y0 + 4, 'scroll for older sectors.', C.dim, 'map');
    return;
  }
  const info = nodeInfo(map[id]);
  // Too tall for the room over the tray (a boss with a rival and its own rules: CERBERUS on a phone)? Its extra lines
  // take turns on one row (engine/fx.js swapLines). The box's bottom must stay over the rule (BOARD_Y + L.gh + 1).
  let lines = info.lines;
  const room = BOARD_Y + L.gh + 1 - y0 - (st.mapSel ? 3 : 0), extra = lines.filter(ln => ln.swap);
  if (lines.length > room && extra.length > 1) {
    const sw = st.cardSwap && st.cardSwap.id === id ? st.cardSwap : (st.cardSwap = { id, t0: now });
    const cur = FX.swapLines(extra.map(ln => ln.text), L.wc, sw.t0, now);
    lines = lines.filter(ln => !ln.swap || ln === extra[0]).map(ln => ln === extra[0] ? { text: cur.text, col: extra[cur.k].col } : ln);
  }
  lines.forEach((ln, k) => putC(y0 + k, ln.text, ln.col, 'map'));
  if (st.mapSel) drawBox(ctx, y0 + lines.length, { text: info.action, id: 'enter', onTap: () => enterNode(map[st.mapSel]), minW: 18 });
}

function nodeInfo(n) {
  const lines = [];
  const T = (text, col = C.text, swap = false) => lines.push({ text, col, swap });   // swap: may share one row (mapview, too tall)
  if (n.type === 'corp' || n.type === 'final' || n.type === 'start') {
    const d = corpDef(n.corp);
    if (blinded(n)) {   // BLINDERS: only the level and the anomaly
      if (n.type === 'final') T('SECTOR BOSS', C.danger);
      T(`UNKNOWN CORP // TIER ${n.tier}${n.type === 'final' ? '' : ' LV' + (d.level || 1)}`, n.type === 'final' ? C.danger : C.accent);
      T('no intel.', C.dim);
      T(`+ ${ANOMALIES.blinders.name}: ${ANOMALIES.blinders.desc}`, C.money);
      return { lines, action: 'B R E A C H' };
    }
    if (n.type === 'final' && n.corp !== 'omni') T('SECTOR BOSS', C.danger);
    T(n.tier ? `${d.name} // TIER ${n.tier}${d.level ? ' LV' + d.level : ''}` : d.name, n.type === 'final' ? C.danger : C.accent);
    T(d.intel, C.text);
    const rules = corpRules(d, n.tier);
    if (rules) T(rules, C.mid);
    if (d.bossDesc) T(d.bossDesc, C.dangerDim, true);
    if (n.mod && ANOMALIES[n.mod]) T(`+ ${ANOMALIES[n.mod].name}: ${ANOMALIES[n.mod].desc}`, C.money, true);
    if (questHintNode(n)) T('! POPS: the DISC could be in here.', C.rep, true);   // (engine/quests.js)
    { const off = modsOffIn(d); if (off.length) T(`off here: ${off.map(k => MODS[k].name.toLowerCase()).join(', ')}.`, C.dangerDim, true); }   // e.g. COIN FLIP in a drag corp
    return { lines, action: 'B R E A C H' };
  }
  if (n.type === 'shop') { T('BLACK MARKET', C.money); T('gear and mods for credits.'); if (n.exit) T('the way out: leave it and the sector is clear.', C.accent); }
  if (n.type === 'cache') { T('DATA CACHE', C.money); T('loot, then pick a mod.'); }
  if (n.type === 'pier') { T('THE PIER', C.accent); T(`phish the data stream. ${fishCost()}cr a cast.`); T('who knows what bites.', C.dim); }
  if (n.type === 'repair') { T('SAFEHOUSE', C.accent); T(`heal ${CONFIG.repairAmount}, then pick a mod.`); }
  if (n.type === 'fence') { const k = (st.run.fence || []).length; T('THE FENCE', C.money); T(k ? `${k} stolen mod${k > 1 ? 's' : ''} for sale. yours.` : 'stolen mods end up here.'); T('then on to the sector boss.', C.dim); }
  return { lines, action: 'E N T E R' };
}
