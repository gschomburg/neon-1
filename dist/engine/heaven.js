// NeoN+1 engine/heaven.js: H3AV3N in the real game (docs/QUESTS.md, step 11 and "G0D's fights"). Built a step at a time
// (the user, 2026-10-30: work the G0D prototype into the engine):
//   1. heaven's sector 2 as a real sector map: 3 rows of corps, the MAZE right under G0D, a market off to the side
//      (after the maze), G0D in the boss spot. The editor's g0d tab jumps there.
//   2. G0D MAZE as a real corp (the corp kit): real layers, node tiles, wipes, mods; its own rules (the codex order).
//   3+. (next) the fight as the boss, the fake win, the final stand, the collapse.
// The heaven corps aren't in CORPS (so they never come up in a normal run): corpDef looks here too (engine/corps.js).
'use strict';
NEON_FILES.push(['engine/heaven.js', 'v13.95']);

const HEAVEN = {};

// ---------------- The sector ----------------
// Sector s (heaven's second): rows 1-3 corps (deep ones), row 4 the maze (one node), row 5 G0D, a market beside it that
// the maze leads to (you can go there after the maze, then on to G0D).
function addHeavenSector(nodes, seed, s) {
  const r = rngFor(seed, 'heaven', s), base = SECTOR_STEPS * s;
  for (const id of Object.keys(nodes)) if (nodes[id].sector === s && nodes[id].step > base) delete nodes[id];
  const add = (step, lane, type, extra = {}) => { const id = `${step}:${lane}`; nodes[id] = Object.assign({ id, step, lane, sector: s, type, next: [] }, extra); return nodes[id]; };
  for (let ls = 1; ls <= 3; ls++) {
    const corps = pickCorps(r, 5, 3);
    [0, 1, 2].forEach(lane => add(base + ls, lane, 'corp', { corp: corps[lane], tier: 4 }));
  }
  const maze = add(base + 4, 1, 'corp', { corp: 'maze', tier: 4, heaven: 'maze' });
  const g0d = add(base + 5, 1, 'final', { corp: 'g0d', tier: 5, heaven: 'g0d' });
  const shop = add(base + 5, 0, 'shop', { heaven: 'shop' });
  const start = Object.values(nodes).find(n => n.step === base && (n.type === 'start' || n.type === 'final'));
  if (start) start.next = [0, 1, 2].map(l => `${base + 1}:${l}`);
  for (let ls = 1; ls <= 2; ls++) for (const lane of [0, 1, 2]) {
    const n = nodes[`${base + ls}:${lane}`];
    n.next.push(`${base + ls + 1}:${lane}`);
    for (const d of [-1, 1]) if (lane + d >= 0 && lane + d < 3 && r() < 0.45) n.next.push(`${base + ls + 1}:${lane + d}`);
  }
  for (const lane of [0, 1, 2]) nodes[`${base + 3}:${lane}`].next.push(maze.id);   // every road leads into the maze
  maze.next.push(g0d.id, shop.id);
  shop.next.push(g0d.id);
  return nodes;
}
// The editor's jump (TESTING / g0d tab): a practice run whose first sector is heaven's sector 2.
function heavenSetup() {
  const run = st.run;
  if (!run) return;
  run.heaven = true;
  addHeavenSector(run.map, run.seed, 0);
  st.mapSel = null;
}

// ---------------- G0D MAZE: a corp ----------------
// The right path is the codex order: PROMPT, DIAMOND, THE CROSS, STORAGE UNIT, UPLINK, THE WATCHER (G0DP_SEQ). Every
// node is a perfect (+1 INT, pays). Off the path everything is wrong; G0DP.mazeLost wrong layers deep, the next tap
// costs 1 INT and sends you back to the start. The clock: out, -1 INT, and it starts again (it holds through the wipes,
// like every corp's). Nodes per layer: G0DP.mazeNodes by depth. Labels: 2A, 3C... (the depth and the node you took).
HEAVEN.maze = {
  key: 'maze', name: 'G0D MAZE', letter: '#', level: 5,
  intel: '"prompt. diamond. cross. st#%age. upl@#k. wa%#..."',
  tell: null, pay: 0.6, timer: 6, noLoot: true, noOdds: true,
  // out of the maze: a real rewards screen (round 2 of the feedback: "more of a success thing")
  reward(c) {
    const run = st.run, r = rngFor(run.seed, 'mazereward', c.node.id);
    const options = pickMods(r, modsFound('gen', 'minor'), 2).concat([rewardGear(r)]);
    Sound.bossWin(); flash(G0DP_BLUE, 0.25, 0.6); shake(5, 0.35);
    openChoice({ reveal: true, title: 'MAZE CLEARED', col: G0DP_BLUE, head: [['G0D MAZE', C.text], ['the eye is right above you.', C.mid]], by: profile(), options,
      skipLabel: `[ SKIP  +${earnInt(ECON.skip.boss)}cr ]`, onSkip: () => { const cr = earnInt(ECON.skip.boss); run.credits += cr; run.earned += cr; Sound.loot(); },
      msg: { text: '> b0y: we made it. G0D is right up there.', col: G0DP_BLUE } });
  },
  layerMsg: (lv, c) => {
    if (!G0DP.boy || !c.maze) return `> layer ${c.maze ? c.maze.label : ''}. ${lv.n} ways on.`;
    const words = ['prompt', 'diamond', 'the cross', 'storage unit', 'uplink', 'the watcher'];   // (his tags name the glyphs now: the terminal just says what is next)
    return { text: c.maze.lost ? '> b0y: hm. not sure about this.' : '> b0y: ' + words[c.maze.path] + ' next.', col: G0DP_BLUE };
  },
  // b0y in the maze: two cursors on the nodes' top right corners (the one you're after among them), they come together on
  // it; he hides when he's resting. (G0DP.boy off: no b0y.)
  overlay(ctx, lv, now) {
    const c = st.corp;
    if (!G0DP.boy || !c || !c.maze || !lv) return;
    if (st.busy || lv.tiles.some(t => t.state === 'safe')) { c.boy = null; return; }   // a node's been taken: he clears out (the next layer starts him fresh)
    if (!c.boy || c.boyLv !== lv) { c.boy = g0dpBoyNew(); c.boy.until = now + 300; c.boyLv = lv; }
    const dt = Math.min(0.05, (now - (c.boyLast || now)) / 1000); c.boyLast = now;
    const corner = t => { const o = tileOrigin(t); return { x: o.tx + TILE_W - 1, y: o.ty - 1, name: g0dpGlyphName(t.glyph) }; };   // over the corner; the glyph name on his tag
    const open = lv.tiles.filter(t => t.state === 'closed'), real = lv.tiles[lv.safe];
    g0dpBoyTick({ boy: c.boy }, now, dt, { right: !c.maze.lost && real && real.state === 'closed' ? corner(real) : null, others: open.filter(t => t !== real).map(corner) });
    const b = c.boy;
    if (b.phase === 'rest' || (b.phase === 'hold' && now > b.until - 900)) return;   // resting: hidden
    b.curs.slice(0, 2).forEach((cu, i) => {
      const bob = Math.abs(cu.x - cu.tx) < 0.5 && Math.floor((now + i * 170) / 260) % 2 ? 1 : 0, x = Math.round(cu.x), y = Math.round(cu.y) - bob;
      g0dpBoyMark(ctx.put, ctx.bg, x, y, cu.tag);
    });
  },
  rules: () => 'follow the codex. every node is a perfect.',
  bossDesc: '',
  counts: () => Array.from({ length: 200 }, () => G0DP.mazeNodes[0]),
  onEnter(c) { c.maze = { depth: 1, path: 0, lost: 0, label: '1A' }; },
  progLabel: c => (c.maze ? 'LAYER ' + c.maze.label : ''),
  // the right node (if you're on the path) wears the next glyph; the rest are random, now and then another path glyph
  dress(lv, k) {
    const c = st.corp, m = c.maze || (c.maze = { depth: 1, path: 0, lost: 0, label: '1A' }), seq = G0DP_SEQ();
    const seqSet = new Set(seq.map(g => g.join('|')));
    const pool = shuffle(MOTIFS.filter(g => !seqSet.has(g.join('|'))), k.r);
    k.tiles.forEach((t, i) => {
      t.glyph = pool[i % pool.length];
      if (k.r() < 0.3) { const others = seq.filter((_, j) => j !== m.path); t.glyph = others[Math.floor(k.r() * others.length)]; }
    });
    if (!m.lost) k.real.glyph = seq[m.path];
    else if (seqSet.has(k.real.glyph.join('|')) && sameGlyph(k.real.glyph, seq[m.path])) k.real.glyph = pool[pool.length - 1];
  },
  // every tap: the path, then the layer passes (a perfect), or a dead end sends you back (no perfect)
  tap(t, i) {
    const c = st.corp, lv = st.lv, m = c.maze, run = st.run;
    const letter = String.fromCharCode(65 + lv.tiles.filter(o => o.cell < t.cell).length % 26);
    const nextSize = () => G0DP.mazeNodes[Math.min(m.depth - 1, G0DP.mazeNodes.length - 1)];
    if (m.lost >= G0DP.mazeLost) {   // too deep: back to the start
      hurt(1);
      Object.assign(m, { depth: 1, path: 0, lost: 0, label: '1A' });
      flash(C.danger, 0.35, 0.8); shake(10, 0.5);
      setMsg('> dead end. back to the start. -1 INT.', C.danger);
      if (run.integrity <= 0) { die(); return true; }
      c.counts[c.idx + 1] = nextSize();
      lv.payCut = 1; lv.scanned = true;   // (no perfect, no pay)
      onSafe(t);
      return true;
    }
    if (t === lv.tiles[lv.safe] && !m.lost) {
      m.path++;
      if (m.path >= G0DP_SEQ().length) {   // out: the corp is done (no boss layer)
        c.idx = c.counts.length - 1;
        setMsg('> out of the maze. the eye is right above you.', G0DP_BLUE);
        onSafe(t);
        return true;
      }
      if (m.path === G0DP_SEQ().length - 1) setMsg('> b0y: one more. the watcher.', G0DP_BLUE);
    } else {
      m.lost++;
      setMsg('> b0y: ' + G0DP_LINES.boyLost[Math.min(m.lost - 1, G0DP_LINES.boyLost.length - 1)], G0DP_BLUE);
    }
    m.depth++; m.label = `${m.depth}${letter}`;
    c.counts[c.idx + 1] = nextSize();
    onSafe(t);
    return true;
  },
  // the clock runs out: -1 INT, it starts again (no random tap)
  clockOut() {
    hurt(1);
    setMsg('> the clock ran out. -1 INT.', C.danger);
    if (st.run.integrity <= 0) return die();
    st.timer = makeTimer();
  },
};

// ---------------- Step 3: G0D's node. The wake-up, then the fight ----------------
// The wake-up v3 (the user, 2026-10-30: "pace it out more"; docs/QUESTS.md "The wake-up v3"). You breach and the sector
// map turns into things that move. It's the fight's own screen from the first frame (st.mode 'g0dp', p.wake): the map
// is a snapshot of whatever heaven's map shows (its nodes, labels, links, G0D's node: nothing hard-coded), drawn here;
// the fight's real mold rises over it; once it's covered, the fight is already under it and taps work. The beats (ms):
//   G0D's node shivers, breaks out of the grid and opens into an eye; it floats up near the top, firing traces.
//   His bar: G..0..D drop in, red dust off each one as it lands; then the bar fills out both ways.
//   The other nodes wake one at a time, unevenly (x...x.x..xxxx): a shiver, their links snap (the dots burst), they
//   break free and wander, red traces behind them; a couple turn into eyes.
//   Red traces like lightning the whole time; where they burn out they leave the network behind (grey); then the
//   rest of the network fades in.
//   The mold, from the edges (the bottom most), covers the eye last. Then the fight.
const G0D_WAKE = { shiver: [250, 1100], rise: 1100, letters: [1500, 380], fall: 450, fill: [2750, 1300], nodes: [2600, 7600], tension: 700,
  circuit: [5200, 2800], mold: [7000, 4800], grow: 600, ms: 12600, beat: 700 };
function g0dWakeStart(node) {
  const run = st.run;
  if (!run || st.g0dp) return;
  const snap = G0DP.skipCine ? null : g0dWakeSnap(node);   // (before the map changes: what it showed)
  run.at = node.id; if (!run.visited.includes(node.id)) run.visited.push(node.id);   // (you're at G0D now)
  st.mapSel = null;
  g0dpStart('fight', { real: true, node, startInt: run.integrity, startCr: run.credits, wake: snap, noWipe: !!snap });
}
// The sector map as it is on screen: its nodes (board cells) and the link dots between them.
function g0dWakeSnap(boss) {
  const run = st.run, map = run.map, mv = st.mapView || { row: sectorViewRow(run.sector) };
  const pos = n => ({ x: mapX(n), row: mapRowOf(n) }), inView = row => row - mv.row >= -0.01 && row - mv.row <= SECTOR_ROWS - 0.99;
  const nodes = [], dots = [];
  for (const n of Object.values(map)) {
    const p = pos(n); if (!inView(p.row)) continue;
    const visited = run.visited.includes(n.id);
    nodes.push({ id: n.id, x: p.x - 1, y: p.row - mv.row, label: nodeLabel(n), cc: visited ? null : corpIconCols(n), visited, boss: n.id === boss.id });
  }
  for (const n of Object.values(map)) for (const id of n.next) {
    const m = map[id]; if (!m) continue;
    for (const d of linkDots(pos(n), pos(m))) if (inView(d.row)) dots.push({ x: d.x, y: d.row - mv.row, ch: d.ch || '·', a: n.id, b: m.id });
  }
  return { nodes, dots };
}
// (engine/g0dproto.js g0dpFightStart, with a snapshot: the fight is set up, its mold held back in f.target)
function g0dWakeNew(p, snap) {
  const f = p.fight, W = f.W, H = f.H, [n0, n1] = G0D_WAKE.nodes, hs = G0D_LOOKS.hs;
  const boss = snap.nodes.find(o => o.boss) || { id: '-', x: Math.floor(W / 2) - 1, y: 0, label: '(@)', boss: true };
  boss.ex = boss.x + 1; boss.ey = boss.y;
  const others = shuffle(snap.nodes.filter(o => !o.boss), Math.random);
  others.forEach((o, k) => {
    const u = others.length > 1 ? k / (others.length - 1) : 0;
    o.wake = n0 + (n1 - n0) * (1 - Math.pow(1 - u, 1.9)) + (k ? rand(-150, 150) : 0);   // x...x.x..xxxx: far apart at first, then all at once
    o.vx = 0; o.vy = 0; o.turnAt = 0; o.gid = Math.random() * 1000;
  });
  others.slice(1).filter((_, k) => k % 3 === 1).slice(0, 2).forEach(o => { o.eyeAt = o.wake + G0D_WAKE.tension + rand(900, 1500); });   // a couple turn into eyes
  const wakeOf = new Map(others.map(o => [o.id, o.wake]));
  for (const d of snap.dots) {   // a link snaps when the first of its two ends breaks free
    const ts = [d.a, d.b].map(id => id === boss.id ? G0D_WAKE.shiver[1] - G0D_WAKE.tension : wakeOf.get(id)).filter(t => t != null);
    d.at = (ts.length ? Math.min(...ts) : rand(n0, n1)) + G0D_WAKE.tension;
  }
  // the mold: when each cell starts to grow. From the edges, the bottom first, the top last; the eye's home very last.
  const home = { x: Math.floor(W / 2), y: 3 }, at = new Float32Array(W * H);
  let hi = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.min((H - 1 - y) * 0.9, x * 0.8, (W - 1 - x) * 0.8, y * 2.2) + hs(x * 7.3 + y * 3.1) * 2.5;
    at[y * W + x] = d; hi = Math.max(hi, d);
  }
  const [m0, m1] = G0D_WAKE.mold;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, nearEye = Math.abs(x - home.x) <= 6 && Math.abs(y - home.y) <= 2;
    at[i] = m0 + m1 * (nearEye ? 0.9 + 0.1 * hs(x + y * 9.1) : 0.86 * at[i] / hi);
  }
  return { e: 0, boss, home, nodes: others, dots: snap.dots, traces: [], lit: new Map(), moldAt: at, said: {} };
}
const g0dWakeShake = (k, now, seed) => k <= 0 ? [0, 0] : [(G0D_LOOKS.hs(seed + Math.floor(now / 45)) - 0.5) * k * 0.9, (G0D_LOOKS.hs(seed * 3.3 + Math.floor(now / 45)) - 0.5) * k * 0.35];
function g0dWakeTick(p, now, dt) {
  const w = p.wake, f = p.fight, W = f.W, H = f.H, B = w.boss, [s0, s1] = G0D_WAKE.shiver;
  w.e += dt * 1000;
  const e = w.e, say = (k, t, fn) => { if (e >= t && !w.said[k]) { w.said[k] = true; fn(); } };
  say('a', 450, () => g0dSay("you can't defeat me."));
  say('break', s1, () => g0dWakeBurst(w, B, true));
  [0, 1, 2].forEach(i => say('L' + i, G0D_WAKE.letters[0] + i * G0D_WAKE.letters[1] + G0D_WAKE.fall, () => g0dWakeLand(i)));
  say('fill', G0D_WAKE.fill[0], () => Sound.bossBuild());
  say('b', 4700, () => g0dSay('every node is mine.'));
  say('m', G0D_WAKE.mold[0], () => { Sound.alarm(); shake(5, 0.4); });
  say('c', 9200, () => g0dSay('you are just meat.'));
  // the eye: up to its home near the top, then it hovers there (a little room, not much)
  if (e >= s1) {
    const k = clamp((e - s1) / G0D_WAKE.rise, 0, 1), ease = 1 - Math.pow(1 - k, 3);
    const hx = w.home.x + Math.sin(e / 900) * 2.5, hy = w.home.y + Math.sin(e / 1300) * 0.6;
    B.ex = B.x + 1 + (hx - (B.x + 1)) * ease; B.ey = B.y + (hy - B.y) * ease;
    w.eyeTr = (w.eyeTr || 0) + dt * (e < G0D_WAKE.mold[0] + G0D_WAKE.mold[1] ? 5 : 1);   // lightning out of it
    while (w.eyeTr >= 1) { w.eyeTr -= 1; g0dpTraceSpawn(w.traces, B.ex + rand(-2, 2), B.ey + rand(-1, 1), 1, 'box'); }
  }
  // the nodes: each wakes (a shiver), breaks free, wanders
  for (const o of w.nodes) {
    if (e < o.wake + G0D_WAKE.tension) continue;
    if (!o.free) {
      o.free = true; g0dWakeBurst(w, o, false);
      const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 2.5; o.vx = Math.cos(a) * v; o.vy = Math.sin(a) * v * 0.45; o.turnAt = now + 1200 + Math.random() * 1600;
    }
    if (o.eyeAt && e >= o.eyeAt && !o.eye) { o.eye = true; Sound.nodeOn(); }
    if (now > o.turnAt) { const a = Math.random() * Math.PI * 2, v = 2.5 + Math.random() * 2.5; o.vx = Math.cos(a) * v; o.vy = Math.sin(a) * v * 0.45; o.turnAt = now + 1500 + Math.random() * 2000; }
    const slow = o.eye ? 0.3 : 1;
    o.x += o.vx * dt * slow; o.y += o.vy * dt * slow;
    if (o.x < 1 || o.x > W - 4) { o.vx *= -1; o.x = clamp(o.x, 1, W - 4); }
    if (o.y < 1 || o.y > H - 2) { o.vy *= -1; o.y = clamp(o.y, 1, H - 2); }
    if (w.said.break && Math.abs(o.x + 1 - B.ex) < 6 && Math.abs(o.y - B.ey) < 2.5) { o.x += Math.sign(o.x + 1 - B.ex || 1) * 8 * dt; o.y += Math.sign(o.y - B.ey || 1) * 3 * dt; }   // out of the eye's way
    o.tr = (o.tr || 0) + dt * (o.eye ? 2.5 : 1.6);
    if (o.tr >= 1) { o.tr -= 1; g0dpTraceSpawn(w.traces, o.x + 1, o.y, 1, 'box'); }
  }
  // the links snap: their dots burst
  const snapped = w.dots.filter(d => !d.gone && e >= d.at);
  if (snapped.length) {
    for (const d of snapped) d.gone = true;
    if (!reduced()) explode(snapped.map(d => ({ ch: d.ch, x: pxX(d.x), y: pxY(BOARD_Y + d.y), col: pickR([C.dim, C.mid, C.dangerDim], Math.random) })), pxX(snapped[0].x), pxY(BOARD_Y + snapped[0].y), { power: 0.55, grav: 1.5, life: [0.4, 0.9] });
  }
  // the traces; where one burns out it leaves the network behind
  const before = new Set();
  for (const t of w.traces) for (const pt of t.pts) before.add(pt[0] + ',' + pt[1]);
  g0dpTraceTick(w.traces, dt, 1, W, H);
  const still = new Set();
  for (const t of w.traces) for (const pt of t.pts) still.add(pt[0] + ',' + pt[1]);
  for (const k of before) if (!still.has(k) && !w.lit.has(k)) w.lit.set(k, e);
  // the mold grows in (the fight's own, up to what the fight starts with)
  if (e >= G0D_WAKE.mold[0]) for (let i = 0; i < f.m.length; i++) {
    const k = (e - w.moldAt[i]) / G0D_WAKE.grow;
    if (k <= 0) continue;
    f.m[i] = Math.max(f.m[i], f.target[i] * Math.min(1, k));
    f.fresh[i] = k < 1 ? 0.8 : Math.max(0, f.fresh[i] - dt * 1.4);   // the growing edge, bright
  }
  if (e >= G0D_WAKE.ms) g0dWakeDone(p);
}
// A node breaks free (G0D's: it breaks the grid round it too): its letters burst
function g0dWakeBurst(w, o, boss) {
  if (boss) { Sound.shatter(); Sound.bossDrop(); shake(12, 0.6); flash(C.danger, 0.25, 0.5); }
  else { Sound.trap(); shake(3, 0.2); }
  if (reduced()) return;
  const cells = [...o.label].map((ch, k) => ({ ch, x: pxX(o.x + k), y: pxY(BOARD_Y + o.y), col: boss ? G0DP_RED : C.danger }));
  if (boss) for (let k = 0; k < 22; k++) cells.push({ ch: pickR(['·', '─', '│', '┼', '.', ':'], Math.random), x: pxX(o.x + 1 + rand(-6, 6)), y: pxY(BOARD_Y + Math.max(0, o.y + rand(-1, 2))), col: pickR([C.dim, C.mid, C.dangerDim, G0DP_RED], Math.random) });
  explode(cells, pxX(o.x + 1), pxY(BOARD_Y + o.y), { power: boss ? 0.9 : 0.5, grav: 1.4, life: [0.4, 1.0] });
}
// a letter of his bar lands: red dust off it
function g0dWakeLand(i, hard = false) {
  Sound.trap(); shake(hard ? 7 : 3, hard ? 0.3 : 0.15);
  if (hard) flash(G0DP_RED, 0.12, 0.25);
  if (reduced()) return;
  const x = Math.floor((L.wc - 5) / 2) + 1 + i, y = G0DP_BAR_ROW, cells = [];
  for (let k = 0; k < (hard ? 16 : 9); k++) cells.push({ ch: pickR(['.', ',', '`', "'", '·', '*'], Math.random), x: pxX(x + rand(-0.6, 0.6)), y: pxY(y), col: pickR([G0DP_RED, C.danger, C.dangerDim], Math.random) });
  explode(cells, pxX(x), pxY(y) - L.chh * 0.6, { power: 0.45, grav: 1.6, life: [0.35, 0.8] });
}
// Over: the fight, under the mold (it's the same mold). Its nodes go where the woken ones went.
function g0dWakeDone(p) {
  const w = p.wake, f = p.fight, now = performance.now();
  if (!w) return;
  f.m.set(f.target); f.fresh.fill(0); f.target = null;
  const spots = shuffle(w.nodes.slice(), Math.random);
  f.nodes.forEach((n, k) => { const o = spots[k % Math.max(1, spots.length)]; if (o) { n.x = clamp(o.x, 3, f.W - 6); n.y = clamp(o.y, 3, f.H - 3); } });
  f.traces = [];   // (the wake-up's run under the mold; the fight's draw on top of it: they'd pop out)
  f.nextHands = now + G0DP.handsEvery * 1000; f.nextLine = now + 8000; f.creepAt = 0;
  f.freshFrom = now;   // (the nodes' fresh-mold glow fades up from here)
  p.wake = null;
  boySay('wtf. ok. start digging.');
}
// A tap skips it (after a beat; off by default: G0DP.tapSkip)
function g0dWakeSkip() { const p = st.g0dp; if (p && p.wake && G0DP.tapSkip && p.wake.e > G0D_WAKE.beat) g0dWakeDone(p); }
// The board while it wakes (buildG0dp): top to bottom, each thing takes its cells; the mold over all of it
function g0dWakeDraw(p, put, bg, now) {
  const w = p.wake, f = p.fight, e = w.e, Y = BOARD_Y, hs = G0D_LOOKS.hs, B = w.boss, [s0, s1] = G0D_WAKE.shiver;
  const moldOn = (x, y) => { const i = g0dpIdx(f, Math.round(x), Math.round(y)); return i >= 0 && f.m[i] >= 0.6; };
  const taken = new Set(), key = (x, y) => Math.round(x) + ',' + Math.round(y);
  const P = (x, y, ch, col, bold = false, bgc = null, ba = 1) => {
    const k = key(x, y);
    if (taken.has(k) || moldOn(x, y) || y < -0.5) return;
    taken.add(k);
    if (bgc) bg(x, Y + y, 1, bgc, ba);
    if (ch && ch !== ' ') put(x, Y + y, ch, col, 'fx', bold);
  };
  // G0D: his node shivers, then the eye
  if (e < s1) {
    const k = clamp((e - s0) / (s1 - s0), 0, 1), [dx, dy] = g0dWakeShake(k * 1.4, now, 7), lab = e < s0 ? B.label : (now % 700 < 110 ? '(-)' : '(@)');
    [...lab].forEach((ch, j) => P(B.x + j + dx, B.y + dy, ch, k > 0 && Math.floor(now / 90) % 2 ? G0DP_RED : C.danger, true));
  } else {
    const age = e - s1, look = Math.round(Math.sin(now / 600) * 1.2), blink = now % 2600 < 130;
    const art = age < 160 ? ['     ', ' (@) ', '     '] : [' .-. ', blink ? '( - )' : '(' + ' '.repeat(1 + look) + '@' + ' '.repeat(1 - look) + ')', " '-' "];
    art.forEach((l, j) => { for (let k = 0; k < 5; k++) P(B.ex - 2 + k, B.ey - 1 + j, l[k], Math.floor(now / 110) % 7 === 0 ? C.bright : G0DP_RED, true); });
  }
  // the other nodes: as they were on the map; a shiver (the tension); free: G0D's (red, glitching); some are eyes
  for (const o of w.nodes) {
    const t = e - o.wake, tension = clamp(t / G0D_WAKE.tension, 0, 1);
    if (o.eye) { const l = now % 1900 < 120 ? '(-)' : '(@)'; [...l].forEach((ch, k) => P(o.x + k, o.y, ch, G0DP_RED, true)); continue; }
    const [dx, dy] = o.free ? [0, 0] : g0dWakeShake(tension, now, o.gid);
    const flip = o.free && hs(o.gid + Math.floor(now / 650) * 3.1) > 0.86;
    [...(flip ? 'G0D' : o.label)].forEach((ch, k) => {
      const x = o.x + k + dx, y = o.y + dy;
      if (o.free || hs(o.gid + k * 5.3 + Math.floor(now / 120)) < tension * 0.8) {   // red: G0D's now (the fight's corp nodes)
        const sh = G0DP_CORP_RED[Math.floor(hs(o.gid + k * 5.3 + Math.floor(now / 140)) * G0DP_CORP_RED.length)];
        const glitch = hs(o.gid * 1.7 + k * 13 + Math.floor(now / 90)) > (o.free ? 0.93 : 1 - tension * 0.3);
        return P(x, y, glitch ? noiseCh() : ch, C.bg, true, flip ? C.bright : sh, 1);
      }
      if (o.cc) return P(x, y, ch, C.dim, false, o.cc.bg, 0.55);
      P(x, y, ch, o.visited ? C.accent : C.dim);
    });
  }
  // the red traces (lightning)
  for (const [k, [ch, col, head]] of g0dpTraceCells(w.traces, now)) { const [x, y] = k.split(',').map(Number); if (ch) P(x, y, ch, col, head); }
  // the links, until they snap (a shiver and red while an end is about to go)
  for (const d of w.dots) {
    if (d.gone) continue;
    const tense = d.at - e < G0D_WAKE.tension, [dx, dy] = tense ? g0dWakeShake(0.6, now, d.x * 3 + d.y) : [0, 0];
    P(d.x + dx, d.y + dy, d.ch, tense ? C.dangerDim : C.dim);
  }
  // the network: where traces burned out (red, cooling to grey), then all of it fading in
  const cf = clamp((e - G0D_WAKE.circuit[0]) / G0D_WAKE.circuit[1], 0, 1);
  for (let y = 1; y < f.H; y++) for (let x = 0; x < f.W; x++) {
    const lt = w.lit.get(x + ',' + y);
    if (lt == null && hs(x * 2.3 + y * 4.1) >= cf * 0.92) continue;
    const age = lt == null ? 1e9 : e - lt;
    P(x, y, g0dpCircuitCh(x, y, now, f.W, f.H), age < 250 ? C.dangerDim : age < 1400 ? C.mid : hs(x * 1.3 + y * 7.9) < 0.25 ? C.mid : C.dim);
  }
  // the M0LD (the fight's own), over all of it
  for (let y = 0; y < f.H; y++) for (let x = 0; x < f.W; x++) {
    const i = y * f.W + x, th = f.m[i];
    if (th < 0.6) continue;
    put(x, Y + y, g0dpMoldGlyph(th, x, y, now), f.fresh[i] > 0.45 ? G0DP_FRESH : th > 2.5 ? G0D_COLS.mold : G0D_COLS.moldDim);
  }
}
// Over the screen while it wakes: his bar. G, 0, D drop in from above with a bounce (red dust as each lands), then it
// fills out from the middle both ways. Filled, it's the fight's bar exactly.
const g0dBounce = k => { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375; return n * (k -= 2.625 / d) * k + 0.984375; };
function g0dWakeOverlay(cells, now, bgs) { return g0dBarDrop(cells, bgs, st.g0dp.wake.e, G0D_WAKE); }
// ---------------- Step 4: the fake win ----------------
// (docs/QUESTS.md "G0D FIGHT: it dies (and doesn't)"; v3, the user 2026-10-31.) The real rewards screen (openChoice: G0D
// BREACHED, the rewards) builds in like after any boss, a few specks of M0LD already on it (on TAKE, a couple of other
// spots); it sits there a moment (taps and keys take nothing). Then a small hole in the middle: the mold punches through,
// each cell in the hole falls out, background and all, mold coming in behind; then the mold spreads out of the hole over
// the whole screen, fast, solid (nothing of the old screen shows through). Covered: the final stand starts under it
// (its opening: wires and eyes come out of that hole; G0D's bar drops back in). G0DP.skipCine skips it outright.
const G0D_FAKE = { pause: 1400, cap: 9000, hole: 1100, holeR: 3.4, spread: 1200, hold: 250, beat: 700 };
function heavenFakeWin(stand) {
  st.g0dp = null;
  if (G0DP.skipCine) return g0dpStart('stand', stand);
  const run = st.run, r = rngFor(run.seed, 'g0dreward');
  const options = pickMods(r, modsOfKind('exotic'), 1).concat(pickMods(r, modsOfKind('gen'), 2));
  const specks = [0, 1, 2].map(() => ({ x: 5 + Math.random() * (L.wc - 10), y: BOARD_Y + 3 + Math.random() * (L.gh - 6), r: 0.9 + Math.random() * 0.6 }));
  st.g0dFake = { t0: performance.now(), stand, said: {}, specks, fell: new Set() };
  openChoice({ reveal: true, title: 'G0D BREACHED', col: C.accent, head: [['G0D', C.text]], by: profile(), options,
    skipLabel: '[ SKIP  +0cr ]', onSkip: () => {}, msg: { text: '> the network is yours.', col: C.accent } });
}
function g0dFakeTick(now) {
  const f = st.g0dFake;
  if (!f || st.mode !== 'panel' || st.pause || st.dev) return;
  const e = now - f.t0, rv = st.panelReveal;
  if (f.doneAt == null && (!rv || rv.done)) f.doneAt = e;
  if (f.holeAt == null && ((f.doneAt != null && e >= f.doneAt + G0D_FAKE.pause) || e >= G0D_FAKE.cap)) { f.holeAt = e; Sound.shatter(); shake(5, 0.3); }
  if (f.holeAt == null) return;
  const h = e - f.holeAt, say = (k, at, fn) => { if (h >= at && !f.said[k]) { f.said[k] = true; fn(); } };
  say('punch', 120, () => { Sound.trap(); shake(8, 0.4); });
  say('spread', G0D_FAKE.hole, () => { Sound.alarm(); shake(6, 0.5); });
  if (h >= G0D_FAKE.hole + G0D_FAKE.spread + G0D_FAKE.hold) g0dFakeEnd();
}
function g0dFakeSkip() { const f = st.g0dFake; if (G0DP.tapSkip && f && performance.now() - f.t0 > G0D_FAKE.beat) g0dFakeEnd(); }
function g0dFakeEnd() {
  const f = st.g0dFake; if (!f) return;
  st.g0dFake = null;
  boySay("he's not done. he's running!");
  g0dpStart('stand', Object.assign({}, f.stand, { noWipe: true, hole: true }));
}
// The mold as a solid cover (the fake win, the stand's opening): the same look at a cell on both sides of the hand-off
const g0dCoverMold = (x, y, now) => { const th = 1.7 + G0D_LOOKS.hs(x * 3.7 + y * 1.3) * 3; return [g0dpMoldGlyph(th, x, y, now), th > 2.6 ? G0D_COLS.mold : G0D_COLS.moldDim]; };
// Out from the hole (the middle of the board): how far a cell is (rows; across counts less: cells are tall)
const g0dHoleD = (x, y) => Math.hypot((x - (L.wc - 1) / 2) / 2.2, y - (BOARD_Y + L.gh / 2)) + G0D_LOOKS.hs(x * 7.3 + y * 3.1) * 1.2;
const g0dHoleMax = () => Math.hypot(L.wc / 4.4, Math.max(BOARD_Y + L.gh / 2, L.hc - BOARD_Y - L.gh / 2)) + 1.3;
// a cell's background this frame (scene.js keeps them in st.frameBgs while it builds)
function g0dBgAt(x, y) {
  const list = st.frameBgs || [];
  for (let i = list.length - 1; i >= 0; i--) { const b = list[i]; if (Math.round(b.cy) === y && x >= b.cx && x < b.cx + b.w && b.alpha >= 0.5) return b.col; }
  return null;
}
// Over the rewards screen: the specks, the hole, the mold taking over (cover everything: own background, solid)
function g0dFakeOverlay(cells, now, bgs) {
  const f = st.g0dFake;
  if (!f) return cells;
  const e = now - f.t0, W = L.wc, Hh = L.hc, hs = G0D_LOOKS.hs;
  if (!f.take && e > 1500) {   // a speck on TAKE (once it's there)
    const rows = new Map();
    for (const c of cells) { const y = Math.round(c.cy); if (!rows.has(y)) rows.set(y, []); rows.get(y)[Math.round(c.cx)] = c.ch; }
    for (const [y, a] of rows) { const s = Array.from({ length: W }, (_, i) => a[i] || ' ').join(''), i = s.indexOf('TAKE'); if (i >= 0) { f.take = { x: i + 1.5, y, r: 1 }; break; } }
  }
  const specks = f.take ? f.specks.concat([f.take]) : f.specks;
  const speck = (x, y) => specks.some(s => Math.hypot((x - s.x) / 2.2, y - s.y) < s.r && hs(x * 9.1 + y * 4.3) > 0.3);
  let R = -1, h = 0;
  if (f.holeAt != null) {
    h = e - f.holeAt;
    const hk = clamp(h / G0D_FAKE.hole, 0, 1), sk = clamp((h - G0D_FAKE.hole) / G0D_FAKE.spread, 0, 1);
    R = G0D_FAKE.holeR * Math.sqrt(hk) + (g0dHoleMax() - G0D_FAKE.holeR) * (1 - Math.pow(1 - sk, 2));
  }
  const covered = (x, y) => (R > 0 && g0dHoleD(x, y) < R) || speck(x, y);
  // what the hole takes falls out, background and all (the spread is too fast for all of it: some)
  if (R > 0 && !reduced()) {
    const at = new Map(); for (const c of cells) at.set(Math.round(c.cx) + ',' + Math.round(c.cy), c);
    const bits = [];
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      const k = x + ',' + y;
      if (f.fell.has(k) || g0dHoleD(x, y) >= R) continue;
      f.fell.add(k);
      if (h > G0D_FAKE.hole && Math.random() > 0.12) continue;
      const c = at.get(k), bgc = g0dBgAt(x, y);
      if (!c && !bgc) continue;
      if (bits.length < 60) bits.push({ ch: c ? c.ch : ' ', x: pxX(x), y: pxY(y), col: c ? c.col : C.text, bg: bgc });
    }
    if (bits.length) explode(bits, pxX((W - 1) / 2), pxY(BOARD_Y + L.gh / 2) - L.chh, { power: 0.35, grav: 1.6, life: [0.6, 1.2] });
  }
  const out = cells.filter(c => !covered(Math.round(c.cx), Math.round(c.cy)));
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    if (!covered(x, y)) continue;
    if (bgs) bgs.push({ cx: x, cy: y, w: 1, col: C.bg, alpha: 1 });
    const [ch, col] = g0dCoverMold(x, y, now), edge = R > 0 && R - g0dHoleD(x, y) < 0.9 && h < G0D_FAKE.hole + G0D_FAKE.spread;
    out.push({ ch, cx: x, cy: y, col: edge ? G0DP_FRESH : col, own: 'fx', bold: false });
  }
  if (G0DP.tapSkip && e > G0D_FAKE.beat) { const tip = 'tap to skip'; out.push(...[...tip].map((ch, k) => ({ ch, cx: L.wc - tip.length + k, cy: BOARD_Y + L.gh - 1, col: C.dim, own: 'fx', bold: false }))); }
  return out;
}

// ---------------- The final stand's opening, out of the hole (engine/g0dproto.js g0dpStandStart opts.hole) ----------------
// The mold covers the screen (the fake win left it so). Wires come out of the hole in the middle and replace the mold, out
// to the edges (the network, drawn in white as it comes); the eyes come out of the hole, (o) first, full size once
// they're out, to their spots; G0D's bar drops back in (like the wake-up's, harder). Then the clock starts.
const G0D_HOLE = { ms: 3900, clear: 2700, eyes: [450, 240], eyeMove: 950, letters: [650, 320], fall: 450, fill: [1850, 1000] };
const g0dHoleClearAt = (x, y) => g0dHoleD(x, y) / g0dHoleMax() * G0D_HOLE.clear;
function g0dHoleTick(p, s, now, dt) {
  const oe = now - s.openFrom, say = (k, at, fn) => { if (oe >= at && !s.said[k]) { s.said[k] = true; fn(); } };
  [0, 1, 2].forEach(i => say('L' + i, G0D_HOLE.letters[0] + i * G0D_HOLE.letters[1] + G0D_HOLE.fall, () => g0dWakeLand(i, true)));
  say('fill', G0D_HOLE.fill[0], () => { Sound.bossBuild(); shake(6, 0.6); });
  say('full', G0D_HOLE.fill[0] + G0D_HOLE.fill[1], () => { Sound.bossDrop(); flash(G0DP_RED, 0.2, 0.4); g0dSay('you are just meat.'); });
  s.eyes.forEach((e, i) => say('e' + i, G0D_HOLE.eyes[0] + i * G0D_HOLE.eyes[1], () => Sound.nodeOn()));
  // wires out of the hole
  s.traceAcc = (s.traceAcc || 0) + dt * 50;
  const cx = (L.wc - 1) / 2, cy = L.gh / 2;
  while (s.traceAcc >= 1) { s.traceAcc -= 1; g0dpTraceSpawn(s.traces, cx + rand(-3, 3), cy + rand(-1.5, 1.5), 0.9, 'white'); }
  g0dpTraceTick(s.traces, dt, 1, L.wc, L.gh);
}
// where an eye is while it comes out of the hole (null: not out yet), and whether it's full size
function g0dHoleEye(s, i, now) {
  const oe = now - s.openFrom, t = oe - (G0D_HOLE.eyes[0] + i * G0D_HOLE.eyes[1]);
  if (t < 0) return null;
  const e = s.eyes[i], k = clamp(t / G0D_HOLE.eyeMove, 0, 1), ease = 1 - Math.pow(1 - k, 3), cx = (L.wc - 1) / 2, cy = L.gh / 2;
  return { x: cx + (e.x - cx) * ease, y: cy + (e.y - cy) * ease, big: k > 0.45 };
}
// Over the screen: the mold not cleared yet (solid), and his bar dropping back in
function g0dHoleOverlay(cells, now, bgs, s) {
  const oe = now - s.openFrom, W = L.wc, Hh = L.hc;
  let out = cells;
  if (oe < G0D_HOLE.clear + 400) {
    const covered = (x, y) => g0dHoleClearAt(x, y) > oe;
    out = out.filter(c => !covered(Math.round(c.cx), Math.round(c.cy)));
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      if (!covered(x, y)) continue;
      if (bgs) bgs.push({ cx: x, cy: y, w: 1, col: C.bg, alpha: 1 });
      const [ch, col] = g0dCoverMold(x, y, now);
      out.push({ ch, cx: x, cy: y, col, own: 'fx', bold: false });
    }
  }
  return g0dBarDrop(out, bgs, oe, G0D_HOLE, true);
}
// G0D's bar coming in (the wake-up, the stand's opening): G, 0, D drop in from above with a bounce (red dust as each lands:
// g0dWakeLand), then it fills out from the middle both ways. Filled, it's the fight's bar exactly.
function g0dBarDrop(cells, bgs, e, spec, hard = false) {
  const y = G0DP_BAR_ROW, Wd = L.wc, at = Math.floor((Wd - 5) / 2), [l0, gap] = spec.letters;
  if (e < l0) return cells;
  const fk = clamp((e - spec.fill[0]) / spec.fill[1], 0, 1), reach = (1 - Math.pow(1 - fk, 2)) * (Wd / 2 + 1), mid = Wd / 2;
  const out = cells.filter(c => Math.round(c.cy) !== y);
  for (let i = 0; i < Wd; i++) {
    const full = fk > 0 && Math.abs(i + 0.5 - mid) <= reach, li = i - at - 1;
    if (full && bgs) bgs.push({ cx: i, cy: y, w: 1, col: C.danger, alpha: 1 });
    if (li < 0 || li > 2) continue;
    const t0 = l0 + li * gap; if (e < t0) continue;
    const k = clamp((e - t0) / spec.fall, 0, 1), cy = 1 + (y - 1) * g0dBounce(k);
    const glitch = hard && k < 1 && Math.floor(e / 60) % 3 === 0;   // (harder: they flicker as they fall)
    out.push({ ch: glitch ? noiseCh() : 'G0D'[li], cx: i, cy, col: full ? C.bg : glitch ? C.bright : C.danger, own: 'hud', bold: true });
  }
  return out;
}

// ---------------- G0D dies (the fight won, before the fake win) ----------------
// (docs/QUESTS.md "G0D FIGHT: it dies (and doesn't)"; v2, the user 2026-10-31.) The last hit: the fight's own mold blows
// off and falls away; his eye stays where it was; the network is pulled into it, grey lines running in from the edges,
// the circuit going from the outside in; the eye glitches harder and harder (its colors inverting), bursts into a smaller
// eye, smaller still, then goes out like a TV (a line, a dot, nothing). Then it all fades: the board, then the header,
// the terminal band (its background too, a letter at a time) and the footer. Then the rewards screen builds in.
const G0D_DIE = { mold: [200, 1600], net: [1300, 3900], glitch: [1600, 4300], burst: 4300, small: 4900, off: 5600, offMs: 600, fade: [6300, 7400], end: 7800 };
function heavenDie(p) {
  const f = p.fight, stand = Object.assign(g0dpAgain(p), { startInt: st.run.integrity, startCr: st.run.credits });
  st.g0dp = null;
  if (G0DP.skipCine) return heavenFakeWin(stand);
  const eye = f && f.eye ? { x: Math.round(f.eye.x), y: Math.round(f.eye.y) } : { x: Math.floor(L.wc / 2), y: Math.floor(L.gh / 2) };
  st.g0dDie = { t0: performance.now(), stand, said: {}, gone: new Set(), eye, m: f ? f.m.slice() : new Float32Array(L.wc * L.gh).fill(2), sucks: [], dmax: 1 };
  { let d = 0; for (const [x, y] of [[0, 1], [L.wc - 1, 1], [0, L.gh - 1], [L.wc - 1, L.gh - 1]]) d = Math.max(d, Math.hypot((x - eye.x) / 2.2, y - eye.y)); st.g0dDie.dmax = d; }
  Sound.hkBoom(); Sound.shatter(); flash(G0DP_BLUE, 0.6, 1.2); shake(16, 0.9);
  showBoard('g0ddie'); st.wipe = null; st.boardStart = -1e9;
}
const g0dDieFrac = (e, [a, b]) => clamp((e - a) / (b - a), 0, 1);
// the network, pulled in: a cell goes when the pull gets to it (the far ones first)
const g0dDieNetGone = (f, x, y, k) => (1 - Math.hypot((x - f.eye.x) / 2.2, y - f.eye.y) / f.dmax) * 0.85 + G0D_LOOKS.hs(x * 1.9 + y * 5.3) * 0.15 < k;
function g0dDieTick(now) {
  const f = st.g0dDie;
  if (!f || st.mode !== 'g0ddie' || st.pause || st.dev) return;
  const e = now - f.t0, say = (k, at, fn) => { if (e >= at && !f.said[k]) { f.said[k] = true; fn(); } };
  const dt = Math.min(0.05, (now - (f.last || now)) / 1000); f.last = now;
  say('a', 400, () => g0dSay('n0. N0. N0000.'));
  say('b', 2600, () => g0dSay('this isn\'t... over...'));
  say('n', G0D_DIE.net[0], () => Sound.whoosh());
  say('burst', G0D_DIE.burst, () => g0dDieBurst(f, 13, 5, 1.1));
  say('small', G0D_DIE.small, () => g0dDieBurst(f, 5, 3, 0.7));
  say('off', G0D_DIE.off, () => { Sound.shatter(); shake(6, 0.4); flash(C.bright, 0.15, 0.3); });
  say('d', G0D_DIE.fade[0], () => Sound.bossDrop());
  // the mold blows off and falls (the fight's own)
  if (!reduced() && e >= G0D_DIE.mold[0] && e <= G0D_DIE.mold[1] + 200) {
    const frac = g0dDieFrac(e, G0D_DIE.mold), hs = G0D_LOOKS.hs, cells = [];
    for (let k = 0; k < 60 && cells.length < 16; k++) {
      const x = Math.floor(Math.random() * L.wc), y = Math.floor(Math.random() * L.gh), key = x + ',' + y, th = f.m[y * L.wc + x];
      if (f.gone.has(key) || th < 0.6 || hs(x * 2.7 + y * 5.3) >= frac) continue;
      f.gone.add(key);
      cells.push({ ch: g0dpMoldGlyph(th, x, y, now), x: pxX(x), y: pxY(BOARD_Y + y), col: pickR([G0D_COLS.mold, G0D_COLS.moldDim, G0DP_FRESH], Math.random) });
    }
    if (cells.length) explode(cells, pxX(f.eye.x), pxY(BOARD_Y + f.eye.y), { power: 0.45, grav: 1.8, life: [0.6, 1.2] });
  }
  // grey lines from the edges into the eye
  if (e >= G0D_DIE.net[0] && e < G0D_DIE.net[1]) {
    f.suckAcc = (f.suckAcc || 0) + dt * 34;
    while (f.suckAcc >= 1 && f.sucks.length < 60) {
      f.suckAcc -= 1;
      const side = Math.floor(Math.random() * 4), x = side === 0 ? 0 : side === 1 ? L.wc - 1 : Math.floor(Math.random() * L.wc), y = side === 2 ? 1 : side === 3 ? L.gh - 1 : 1 + Math.floor(Math.random() * (L.gh - 1));
      const gx = f.eye.x - x, gy = f.eye.y - y, horiz = Math.abs(gx) / 2.2 > Math.abs(gy);
      const dx = horiz ? Math.sign(gx) : 0, dy = horiz ? 0 : Math.sign(gy) || 1;
      f.sucks.push({ pts: [[x, y, dx ? '─' : '│']], x, y, dx, dy, acc: 0, len: 16 + Math.floor(Math.random() * 16), done: false, kind: 'white' });
    }
  }
  g0dSuckTick(f.sucks, dt, f.eye.x, f.eye.y);
  if (e >= G0D_DIE.end) { st.g0dDie = null; heavenFakeWin(f.stand); }
}
// A trace that runs to (ex, ey): a staircase of straight runs and corners, grey (kind 'white'); in, it eats itself away
function g0dSuckTick(list, dt, ex, ey) {
  for (let i = list.length - 1; i >= 0; i--) {
    const t = list[i];
    t.acc += dt * 40 * (t.dy ? 0.55 : 1);
    while (t.acc >= 1) {
      t.acc -= 1;
      if (t.done || t.pts.length >= t.len) { t.done = true; t.pts.shift(); if (!t.pts.length) break; continue; }
      const gx = ex - t.x, gy = ey - t.y;
      if (Math.abs(gx) <= 3 && Math.abs(gy) <= 1) { t.done = true; continue; }
      let ndx = t.dx, ndy = t.dy;
      const wrong = (t.dx && Math.sign(gx) !== t.dx) || (t.dy && Math.sign(gy) !== t.dy);
      if (wrong || Math.random() < 0.14) {   // a turn: toward the eye on the other axis
        if (t.dx && gy) { ndx = 0; ndy = Math.sign(gy); } else if (t.dy && gx) { ndx = Math.sign(gx); ndy = 0; } else if (wrong) { ndx = Math.sign(gx); ndy = Math.sign(gy); if (ndx && ndy) ndy = 0; }
      }
      if (ndx !== t.dx || ndy !== t.dy) { const last = t.pts[t.pts.length - 1]; last[2] = G0DP_CORNER[t.dx + ',' + t.dy + '>' + ndx + ',' + ndy] || '+'; t.dx = ndx; t.dy = ndy; }
      t.x += t.dx; t.y += t.dy;
      t.pts.push([t.x, t.y, t.dx ? '─' : '│']);
    }
    if (t.done && !t.pts.length) list.splice(i, 1);
  }
}
// the eye bursts into a smaller one: its letters blow off
function g0dDieBurst(f, w, h, power) {
  Sound.hkBoom(); shake(12, 0.5); flash(G0DP_RED, 0.25, 0.4);
  if (reduced()) return;
  const cells = [];
  for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) if (Math.random() < 0.7) cells.push({ ch: pickR(['(', ')', '-', "'", '.', '@', '*'], Math.random), x: pxX(f.eye.x - (w >> 1) + k), y: pxY(BOARD_Y + f.eye.y - (h >> 1) + j), col: pickR([G0DP_RED, G0DP_BLUE, C.bright], Math.random), bg: Math.random() < 0.3 ? G0DP_RED : null });
  explode(cells, pxX(f.eye.x), pxY(BOARD_Y + f.eye.y), { power, grav: 1.2, life: [0.5, 1.1] });
}
function g0dDieSkip() { const f = st.g0dDie; if (G0DP.tapSkip && f && performance.now() - f.t0 > G0D_END.beat) { st.g0dDie = null; heavenFakeWin(f.stand); } }
function buildG0dDie(ctx) {
  const f = st.g0dDie, { put, bg, now } = ctx;
  if (!f) return;
  const e = now - f.t0, Y = BOARD_Y, hs = G0D_LOOKS.hs, W = L.wc, H = L.gh, moldGone = g0dDieFrac(e, G0D_DIE.mold), netK = g0dDieFrac(e, G0D_DIE.net);
  const ex = f.eye.x, ey = f.eye.y, taken = new Set();
  const eyeW = e < G0D_DIE.burst ? 6 : e < G0D_DIE.small ? 2 : 1, eyeH = e < G0D_DIE.burst ? 2 : e < G0D_DIE.small ? 1 : 0;
  const onEye = (x, y) => e < G0D_DIE.off + G0D_DIE.offMs && Math.abs(x - ex) <= eyeW + (e >= G0D_DIE.off ? 3 : 0) && Math.abs(y - ey) <= eyeH;
  // the eye: frantic, glitching harder (its colors inverting), bursting smaller, then off like a TV
  const gk = g0dDieFrac(e, G0D_DIE.glitch), tick = Math.floor(now / 70);
  const P = (x, y, ch, col) => {
    if (ch === ' ') return;
    taken.add(x + ',' + y);
    const inv = hs(x * 3.3 + y * 7.1 + tick) < gk * 0.55, noise = hs(x * 5.7 + y * 1.9 + tick * 3) < gk * 0.25;
    if (inv) { bg(x, Y + y, 1, col, 1); put(x, Y + y, noise ? noiseCh() : ch, C.bg, 'fx', true); }
    else put(x, Y + y, noise ? noiseCh() : ch, col, 'fx', true);
  };
  const col = Math.floor(now / 60) % 2 ? G0DP_RED : G0DP_BLUE, jit = hs(tick * 1.3) < gk * 0.3 ? (hs(tick) < 0.5 ? -1 : 1) : 0;
  let art = null;
  if (e < G0D_DIE.burst) { const dart = Math.floor(now / 80) % 5 - 2, iris = '  ' + ' '.repeat(2 + dart) + '(@)' + ' '.repeat(2 - dart) + '  '; art = ['   .-----.   ', " .'       '. ", '(' + iris + ')', " '.       .' ", "   '-----'   "]; }
  else if (e < G0D_DIE.small) { const d = Math.floor(now / 60) % 3 - 1; art = [' .-. ', '(' + ' '.repeat(1 + d) + '@' + ' '.repeat(1 - d) + ')', " '-' "]; }
  else if (e < G0D_DIE.off) art = [Math.floor(now / 50) % 2 ? '(@)' : '(O)'];
  else if (e < G0D_DIE.off + G0D_DIE.offMs) { const k = (e - G0D_DIE.off) / G0D_DIE.offMs; art = [k < 0.25 ? '---------' : k < 0.5 ? '-----' : k < 0.75 ? '-' : '·']; }
  if (art) {
    const offk = e >= G0D_DIE.off;
    art.forEach((l, j) => { const x0 = ex - (l.length >> 1) + (offk ? 0 : jit), y = ey - (art.length >> 1) + j; for (let k = 0; k < l.length; k++) offk ? (taken.add((x0 + k) + ',' + y), put(x0 + k, Y + y, l[k], C.bright, 'fx', true)) : P(x0 + k, y, l[k], col); });
  }
  // the grey lines running in
  for (const [k, [ch, c2, head]] of g0dpTraceCells(f.sucks, now)) { const [x, y] = k.split(',').map(Number); if (y < 1 || y >= H || taken.has(k) || onEye(x, y)) continue; taken.add(k); put(x, Y + y, ch, c2, 'fx', head); }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (taken.has(x + ',' + y) || onEye(x, y)) continue;
    const th = f.m[y * W + x];
    if (th >= 0.6 && hs(x * 2.7 + y * 5.3) >= moldGone) { put(x, Y + y, g0dpMoldGlyph(th, x, y, now), th > 2.5 ? G0D_COLS.mold : G0D_COLS.moldDim); continue; }   // the mold still on
    if (y >= 1 && !g0dDieNetGone(f, x, y, netK)) put(x, Y + y, g0dpCircuitCh(x, y, now, W, H), hs(x * 1.3 + y * 7.9) < 0.25 ? C.mid : C.dim);   // the network, until it's pulled in
  }
}
// Over it: G0D's bar (empty), then everything fades to black: the board first, then the header, the terminal band (its
// background too) and the footer, a letter at a time
function g0dDieOverlay(cells, now, bgs) {
  const f = st.g0dDie;
  if (!f) return cells;
  const e = now - f.t0, k = g0dDieFrac(e, G0D_DIE.fade), hs = G0D_LOOKS.hs;
  let out = e < G0D_DIE.fade[0] ? g0dpBar(cells, bgs, { f: 0 }) : cells;
  if (k > 0) {
    out = out.filter(c => { const onBoard = c.cy >= BOARD_Y && c.cy < BOARD_Y + L.gh, v = hs(Math.round(c.cx) * 3.1 + Math.round(c.cy) * 7.7); return onBoard ? v >= k * 1.4 : v >= (k - 0.45) * 1.8; });
    if (bgs) for (let x = 0; x < L.wc; x++) if (hs(x * 3.1 + 6 * 7.7) < (k - 0.45) * 1.8) bgs.push({ cx: x, cy: 6, w: 1, col: C.bg, alpha: 1 });   // the terminal band
  }
  return out;
}

// ---------------- Step 5: the collapse ----------------
// (docs/QUESTS.md, the final stand: "take out all his eyes: a last threat ('there will be others'), more death
// animations. The screen doesn't go to black: it's all messed up from the fight.") The last eye blows: a flash. His
// network shows bare and crumbles away; one small eye left in the middle looks around, frantic, says its last line and
// fizzles out; his bar shatters; what's left is a mess (static, debris), not black. Then a placeholder ending card
// (the ending, the credits and the rewards: docs/ENDGAME.md), then back to the map.
const G0D_END = { crumble: [700, 3400], fizzle: 3900, bar: 4300, card: 5600, beat: 700 };
function heavenCollapse(p) {
  st.g0dp = null;
  st.g0dEnd = { t0: performance.now() - (G0DP.skipCine ? G0D_END.card : 0), node: p.node, said: {}, gone: new Set() };
  Sound.shatter(); Sound.bossDrop(); flash(C.bright, 0.7, 1.4); shake(18, 1);
  showBoard('g0dend');
}
const g0dEndCrumble = e => clamp((e - G0D_END.crumble[0]) / (G0D_END.crumble[1] - G0D_END.crumble[0]), 0, 1);
function g0dEndTick(now) {
  const f = st.g0dEnd;
  if (!f || st.mode !== 'g0dend' || st.pause || st.dev) return;
  const e = now - f.t0, say = (k, at, fn) => { if (e >= at && !f.said[k]) { f.said[k] = true; fn(); } };
  say('a', 500, () => g0dSay('n0. n0. this is my netw0rk.'));
  say('b', 2300, () => g0dSay('there will be others.'));
  say('c', G0D_END.fizzle, () => { Sound.shatter(); shake(6, 0.4); });
  say('d', G0D_END.bar, () => { Sound.trap(); shake(10, 0.5); g0dEndBarBreak(); });
  say('e', G0D_END.card, () => { Sound.bossWin(); boySay("we did it. he's gone. ...right?"); });
  // the network crumbling: what goes this frame falls (a few at a time)
  if (!reduced() && e > G0D_END.crumble[0] && e < G0D_END.crumble[1] + 200) {
    const frac = g0dEndCrumble(e), hs = G0D_LOOKS.hs, cells = [];
    for (let k = 0; k < 40 && cells.length < 10; k++) {
      const x = Math.floor(Math.random() * L.wc), y = 1 + Math.floor(Math.random() * (L.gh - 1)), key = x + ',' + y;
      if (f.gone.has(key) || hs(x * 1.9 + y * 5.3) >= frac) continue;
      f.gone.add(key);
      cells.push({ ch: g0dpCircuitCh(x, y, f.t0, L.wc, L.gh), x: pxX(x), y: pxY(BOARD_Y + y), col: pickR([C.dim, C.mid, C.dangerDim], Math.random) });
    }
    if (cells.length) explode(cells, pxX(L.wc / 2), pxY(BOARD_Y + L.gh / 2), { power: 0.35, grav: 1.6, life: [0.5, 1.1] });
  }
}
function g0dEndBarBreak() {
  if (reduced()) return;
  const y = G0DP_BAR_ROW, cells = [];
  for (let x = 0; x < L.wc; x++) if (Math.random() < 0.6) cells.push({ ch: pickR(['─', '▓', '#', '%', '-'], Math.random), x: pxX(x), y: pxY(y), col: pickR([G0DP_RED, C.danger, C.dangerDim], Math.random) });
  explode(cells, pxX(L.wc / 2), pxY(y) - L.chh, { power: 1.1, grav: 1.5, life: [0.7, 1.4] });
}
// A tap: during the collapse, skip to the card (after a beat); on the card, go on.
function g0dEndTap() {
  const f = st.g0dEnd, e = performance.now() - f.t0;
  if (e < G0D_END.beat) return;
  if (e < G0D_END.card) { if (G0DP.tapSkip) f.t0 = performance.now() - G0D_END.card; return; }
  if (e > G0D_END.card + 500) heavenWon(f);
}
function buildG0dEnd(ctx) {
  const f = st.g0dEnd, { put, bg, now } = ctx;
  if (!f) return;
  const e = now - f.t0, Y = BOARD_Y, hs = G0D_LOOKS.hs, frac = g0dEndCrumble(e), mess = e > G0D_END.fizzle;
  const cardW = 32, cardH = 9, cx0 = Math.floor((L.wc - cardW) / 2), cy0 = Math.floor((L.gh - cardH) / 2);
  const inCard = (x, y) => e >= G0D_END.card && x >= cx0 && x < cx0 + cardW && y >= cy0 - 1 && y <= cy0 + cardH;   // (the card's box stays clear)
  // the network, bare, crumbling away
  for (let y = 1; y < L.gh; y++) for (let x = 0; x < L.wc; x++) {
    if (hs(x * 1.9 + y * 5.3) < frac || inCard(x, y)) continue;
    put(x, Y + y, g0dpCircuitCh(x, y, f.t0, L.wc, L.gh), hs(x * 1.3 + y * 7.9) < 0.3 ? C.dangerDim : C.dim);
  }
  // the mess left behind: static, debris, a little mold (it doesn't go black)
  if (mess) for (let y = 1; y < L.gh; y++) for (let x = 0; x < L.wc; x++) {
    const v = hs(x * 3.7 + y * 11.1 + 7);
    if (v > 0.13 || inCard(x, y)) continue;
    const flick = hs(x + y * 31 + Math.floor(now / 140)) > 0.6;
    put(x, Y + y, flick ? noiseCh() : '.,:;%#'[Math.floor(v * 46) % 6], v < 0.03 ? C.dangerDim : v < 0.07 ? G0D_COLS.moldDim : C.dim);
  }
  // the last eye: looks around, frantic; fizzles out
  if (e < G0D_END.fizzle + 500) {
    const cx = Math.floor(L.wc / 2), cy = Y + Math.floor(L.gh / 2), dart = Math.floor(now / 90) % 5 - 2;
    const art = e < G0D_END.fizzle ? [' .-. ', '(' + ' '.repeat(Math.max(0, 1 + Math.sign(dart))) + '@' + ' '.repeat(Math.max(0, 1 - Math.sign(dart))) + ')', " '-' "]
      : e < G0D_END.fizzle + 200 ? ['     ', ' (.) ', '     '] : ['     ', '  .  ', '     '];
    art.forEach((l, k) => { bg(cx - 2, cy - 1 + k, 5, C.bg, 1); put(cx - 2, cy - 1 + k, l, Math.floor(now / 70) % 2 ? G0DP_RED : C.bright, 'fx', true); });
  }
  // the ending (a placeholder: docs/ENDGAME.md has the real one)
  if (e >= G0D_END.card) {
    const lines = [['G0D IS DOWN', G0DP_BLUE, true], ['', C.text], ['the network goes quiet.', C.text], ['for now.', C.mid], ['', C.text], ['(the ending, the credits and', C.dim], ['your reward: docs/ENDGAME.md)', C.dim], ['', C.text], ['tap: back to the map', Math.floor(now / 500) % 2 ? C.bright : C.mid]];
    const y0 = Y + Math.floor((L.gh - lines.length) / 2), w = 32, x0 = Math.floor((L.wc - w) / 2);
    for (let k = -1; k <= lines.length; k++) bg(x0, y0 + k, w, C.bg, 1);
    lines.forEach(([t, col, b], k) => put(Math.floor((L.wc - t.length) / 2), y0 + k, t, col, 'ui', !!b));
  }
}
// G0D's bar until it shatters (empty), "tap to skip"
function g0dEndOverlay(cells, now, bgs) {
  const f = st.g0dEnd;
  if (!f) return cells;
  const e = now - f.t0;
  let out = cells;
  if (e < G0D_END.bar) out = g0dpBar(out, bgs, { f: 0 });
  if (G0DP.tapSkip && e > G0D_END.beat && e < G0D_END.card) { const tip = 'tap to skip'; out = out.concat([...tip].map((ch, k) => ({ ch, cx: L.wc - tip.length + k, cy: BOARD_Y + L.gh - 1, col: C.dim, own: 'fx', bold: false }))); }
  return out;
}
// It's over (the placeholder ending): back to the map.
function heavenWon(f) {
  st.g0dEnd = null; st.g0dp = null;
  setMsg('> G0D is down. the network goes quiet.', G0DP_BLUE);
  toMap();
}

// G0D: the boss spot (its node: the wake-up, then the fight).
HEAVEN.g0d = {
  key: 'g0d', name: 'G0D', letter: '@', level: 5, intel: '"you are just meat."', tell: null,
  rules: () => 'the network is me.',
};
