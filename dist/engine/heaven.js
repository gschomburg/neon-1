// NeoN+1 engine/heaven.js: H3AV3N in the real game (docs/QUESTS.md, step 11 and "G0D's fights"). Built a step at a time
// (the user, 2026-10-30: work the G0D prototype into the engine):
//   1. heaven's sector 2 as a real sector map: 3 rows of corps, the MAZE right under G0D, a market off to the side
//      (after the maze), G0D in the boss spot. The editor's g0d tab jumps there.
//   2. G0D MAZE as a real corp (the corp kit): real layers, node tiles, wipes, mods; its own rules (the codex order).
//   3+. (next) the fight as the boss, the fake win, the final stand, the collapse.
// The heaven corps aren't in CORPS (so they never come up in a normal run): corpDef looks here too (engine/corps.js).
'use strict';
NEON_FILES.push(['engine/heaven.js', 'v14.73']);

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
  for (const n of Object.values(nodes)) if (n.sector === s && n.type === 'corp' && n.step > base && !n.heaven) n.mod = 'mold';   // THE DEEP M0LD on every corp here (batch 2)
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
  g0d.ev = 'deepmold';   // (its event card: data/events.js)
  return nodes;
}
// ---------------- H3AV3N as a seed (the user, 2026-10-31; docs/QUESTS.md "H3AV3N as a seed you can play") ----------------
// Type H3AV3N and the run is a QUEST run: you start with nothing, b0y on your side. Sector 1 is a normal sector (rolled
// from the seed, its market stocked for what's coming: QUEST_STOCK); its uplink is broken (no fee, no cash out); sector 2
// is heaven (addHeavenSector: the corps, the maze, the shop, G0D). A QUEST run isn't scored (like practice) until you've
// beaten G0D once (save.beatG0D): then every seed replay counts. Its death retry starts the seed over, still QUEST.
const QUEST_SEEDS = { H3AV3N: 'h3av3n', HAD3S: 'had3s' };   // (HAD3S: the d0g hunt, engine/quests.js)
const questSeed = seed => QUEST_SEEDS[seed] || null;
// Sector 1's market on the H3AV3N seed (the user's list): PATCH always (a few), BUFFER always, two of the rest
const QUEST_STOCK = { patches: 3, gear: ['shoe', 'frag', 'fwall', 'warp', 'call', 'stim', 'zeroday', 'swap'], mods: ['buffer'] };
// Sector 1's M0LD on the H3AV3N seed (data/events.js 'mold'): its share of the corps, and the event (its card)
function questMold(run) {
  questLayout(run);
  if (!save.heavenSeen) { save.heavenSeen = true; persist(); }   // (the H3AV3N feats show on THE BOARD from now on)
  const r = rngFor(run.seed, 'mold', 0);
  const pool = shuffle(Object.values(run.map).filter(n => (n.sector || 0) === 0 && n.type === 'corp').sort((a, b) => a.step - b.step || a.lane - b.lane), r);
  for (const n of pool.slice(0, Math.max(1, Math.round(SECTOR_EVENTS.mold.share * pool.length)))) n.mod = 'mold';
  const boss = run.map[bossIdOf(0)];
  if (boss) { boss.ev = 'mold'; boss.corp = 'cerberus'; }   // (its boss: CERBERUS)
}
// Sector 1's map on the seed (the user's playtest, 2026-10-31): the cache goes over to the right of its row (not the one
// thing right after the market); no TUMBLER (its locks); no corp twice (the higher one is swapped out).
const QUEST_NO_CORPS = ['tumbler'];
function questLayout(run) {
  const r = rngFor(run.seed, 'questmap', 0), s0 = Object.values(run.map).filter(n => (n.sector || 0) === 0);
  const cache = s0.find(n => n.type === 'cache'), right = cache && s0.find(n => n.step === cache.step && n.lane === 2 && n.type === 'corp');
  if (cache && right && cache.lane !== 2) {   // swap what they are (their places and links stay)
    const keep = ['id', 'step', 'lane', 'sector', 'next'], a = {}, b = {};
    for (const k of Object.keys(cache)) if (!keep.includes(k)) { a[k] = cache[k]; delete cache[k]; }
    for (const k of Object.keys(right)) if (!keep.includes(k)) { b[k] = right[k]; delete right[k]; }
    Object.assign(cache, b); Object.assign(right, a);
  }
  const seen = new Set();
  for (const n of s0.filter(o => o.type === 'corp').sort((x, y) => x.step - y.step || x.lane - y.lane)) {
    if (!QUEST_NO_CORPS.includes(n.corp) && !seen.has(n.corp)) { seen.add(n.corp); continue; }
    const used = new Set(s0.map(o => o.corp)), pick = pickCorps(r, n.tier || 1, 12).find(k => !used.has(k) && !QUEST_NO_CORPS.includes(k));
    if (pick) { n.corp = pick; seen.add(pick); }
  }
}
// Sector 1's data cache on the seed: the CACHE KEY's extra loot, a legendary mod, and a purple (aimed) WARP: crack the
// cache, then warp back down to the corps you passed.
function questCacheOptions(r) {
  const isLeg = k => MODS[k].tiers ? MODS[k].tiers.some(t => t.rarity === 'legendary') : MODS[k].rarity === 'legendary';
  let legend = modsFound('gen', 'minor').filter(isLeg); if (!legend.length) legend = modsOfKind('gen', 'minor').filter(isLeg);   // (none found yet: any)
  const opts = shuffle(legend.filter(k => !has(k) || !modMaxed(k)), r).slice(0, 1).map(key => ({ key, tier: MODS[key].tiers ? MODS[key].tiers.findIndex(t => t.rarity === 'legendary') : 0 }));
  return opts.concat([{ kind: 'gear', key: 'warp', tier: 1, n: 1 }]);
}
const questMarket = node => !!(st.run && st.run.quest === 'h3av3n' && (node.sector || 0) === 0);
// The editor's jump (TESTING / g0d tab): a practice run whose first sector is heaven's sector 2.
function heavenSetup() {
  const run = st.run;
  if (!run) return;
  run.heaven = true;
  addHeavenSector(run.map, run.seed, 0);
  st.mapSel = null;
}

// ---------------- G0D MAZE: a corp ----------------
// The right path is the codex order: PROMPT, DIAMOND, THE CROSS, STORAGE UNIT, UPLINK, THE WATCHER (G0DF_SEQ). Every
// node is a perfect (+1 INT, pays). Off the path everything is wrong; G0DF.mazeLost wrong layers deep, the next tap
// costs 1 INT and sends you back to the start. The clock: out, -1 INT, and it starts again (it holds through the wipes,
// like every corp's). Nodes per layer: G0DF.mazeNodes by depth. Labels: 2A, 3C... (the depth and the node you took).
HEAVEN.maze = {
  key: 'maze', name: 'G0D MAZE', letter: '#', level: 5,
  intel: '"prompt. diamond. cross. st#%age. upl@#k. wa%#..."',
  tell: null, pay: 0.6, timer: 6, noLoot: true, noOdds: true, mapLine: '> mapping layers ....... ??? ok',   // (its 200 layers are just "keep going": don't say so)
  // out of the maze: a real rewards screen (round 2 of the feedback: "more of a success thing")
  reward(c) {
    const run = st.run, r = rngFor(run.seed, 'mazereward', c.node.id);
    // (the user's playtest: better loot) a blue BUFFER if you don't have one (the next step if you do), a good gear stack
    // (rare or better), and a mod
    const buf = modMaxed('buffer') ? [] : [{ key: 'buffer', tier: has('buffer') ? upgradeTo('buffer', modTier('buffer')) : 1 }];
    let gear = rewardGear(r); for (let k = 0; k < 8 && (GEAR_STEP[ITEMS[gear.key].rarity] || 0) < 2; k++) gear = rewardGear(r);
    const options = buf.concat([gear], pickMods(r, modsFound('gen', 'minor'), 3 - buf.length - 1, buf));
    Sound.bossWin(); flash(G0DF_BLUE, 0.25, 0.6); shake(5, 0.35);
    openChoice({ reveal: true, title: 'MAZE CLEARED', col: G0DF_BLUE, head: [['G0D MAZE', C.text], ['the eye is right above you.', C.mid]], by: profile(), options,
      skipLabel: `[ SKIP  +${earnInt(ECON.skip.boss)}cr ]`, onSkip: () => { const cr = earnInt(ECON.skip.boss); earn(cr, run); Sound.loot(); },
      msg: { text: '> b0y: we made it. G0D is right up there.', col: G0DF_BLUE } });
  },
  layerMsg: (lv, c) => {
    if (!G0DF.boy || !c.maze) return `> layer ${c.maze ? c.maze.label : ''}. ${lv.n} ways on.`;   // (the user, 2026-10-31: his name clue every layer; [b] brings out his cursors, pointing)
    const words = ['prompt', 'diamond', 'the cross', 'storage unit', 'uplink', 'the watcher'];   // (his tags name the glyphs now: the terminal just says what is next)
    return { text: c.maze.lost ? '> b0y: hm. not sure about this.' : '> b0y: ' + words[c.maze.path] + ' next.', col: G0DF_BLUE };
  },
  // b0y in the maze: two cursors on nodes (the one you're after among them), a v over each, the glyph's name in his tag;
  // they come together on it; he hides when he's resting. (G0DF.boy off: no b0y.) His cursor is the hackers' one
  // (engine/hackers.js drawHkCursor; Greg, 2026-11-06), on the node's bottom edge, not its middle like theirs.
  overlay(ctx, lv, now) {
    const c = st.corp;
    if (!G0DF.boy || !c || !c.maze || !lv) return;
    if (!(c.boyCall && now < c.boyCall)) { c.boy = null; return; }   // (batch 2: he only comes out when you call him: [b])
    if (st.busy || lv.tiles.some(t => t.state === 'safe')) { c.boy = null; return; }   // a node's been taken: he clears out (the next layer starts him fresh)
    if (!c.boy || c.boyLv !== lv) { c.boy = g0dfBoyNew(); c.boy.until = now + 300; c.boyLv = lv; }
    const dt = Math.min(0.05, (now - (c.boyLast || now)) / 1000); c.boyLast = now;
    const corner = t => { const o = tileOrigin(t); return { x: o.tx + 3, y: o.ty + TILE_H - 1, t, name: g0dfGlyphName(t.glyph) }; };   // on the node's bottom edge (the glyph is the clue: he doesn't cover it); the glyph name on his tag
    const open = lv.tiles.filter(t => t.state === 'closed'), real = lv.tiles[lv.safe];
    g0dfBoyTick({ boy: c.boy }, now, dt, { right: !c.maze.lost && real && real.state === 'closed' ? corner(real) : null, others: open.filter(t => t !== real).map(corner) });
    const b = c.boy;
    if (b.phase === 'rest' || (b.phase === 'hold' && now > b.until - 900)) return;   // resting: hidden
    const two = b.curs.slice(0, 2);
    two.forEach((cu, i) => {
      if (i > 0 && Math.abs(cu.x - two[0].x) < 0.7 && Math.abs(cu.y - two[0].y) < 0.7) return;   // (together on one node: one cursor)
      drawHkCursor(ctx.put, ctx.bg, Math.round(cu.x - 1), Math.round(cu.y), 'b0y', { say: cu.tag || null });
      const settled = Math.abs(cu.x - cu.tx) < 0.5 && Math.abs(cu.y - cu.ty) < 0.5;
      if (settled && cu.at && cu.at.t && cu.at.t.state === 'closed') { const o = tileOrigin(cu.at.t); drawHkPoint(ctx.put, ctx.bg, o.tx + 3, o.ty - 1, 'b0y', now, i); }
    });
  },
  rules: () => 'follow the codex. every node is a perfect.',
  bossDesc: '',
  counts: () => Array.from({ length: 200 }, () => G0DF.mazeNodes[0]),
  onEnter(c) { c.maze = { depth: 1, path: 0, lost: 0, label: '1A' }; },
  progLabel: c => (c.maze ? 'LAYER ' + c.maze.label : ''),
  // the right node (if you're on the path) wears the next glyph; the rest are random, now and then another path glyph
  dress(lv, k) {
    const c = st.corp, m = c.maze || (c.maze = { depth: 1, path: 0, lost: 0, label: '1A' }), seq = G0DF_SEQ();
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
    const nextSize = () => G0DF.mazeNodes[Math.min(m.depth - 1, G0DF.mazeNodes.length - 1)];
    if (m.lost >= G0DF.mazeLost) {   // too deep: back to the start
      hurt(1);
      Object.assign(m, { depth: 1, path: 0, lost: 0, label: '1A' });
      flash(C.danger, 0.35, 0.8); shake(10, 0.5);
      setMsg('> dead end. back to the start. -1 INT.', C.danger);
      grantFeat('mazelost');   // (LOST: the heaven feats)
      if (run.integrity <= 0) { die(); return true; }
      c.counts[c.idx + 1] = nextSize();
      lv.payCut = 1; lv.scanned = true;   // (no perfect, no pay)
      onSafe(t);
      return true;
    }
    if (t === lv.tiles[lv.safe] && !m.lost) {
      m.path++;
      if (m.path >= G0DF_SEQ().length) {   // out: the corp is done (no boss layer)
        c.idx = c.counts.length - 1;
        setMsg('> out of the maze. the eye is right above you.', G0DF_BLUE);
        onSafe(t);
        return true;
      }
      if (m.path === G0DF_SEQ().length - 1) setMsg('> b0y: one more. the watcher.', G0DF_BLUE);
    } else {
      m.lost++;
      setMsg('> b0y: ' + G0DF_LINES.boyLost[Math.min(m.lost - 1, G0DF_LINES.boyLost.length - 1)], G0DF_BLUE);
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
// map turns into things that move. It's the fight's own screen from the first frame (st.mode 'g0df', p.wake): the map
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
  if (!run || st.g0df) return;
  const snap = G0DF.skipCine ? null : g0dWakeSnap(node);   // (before the map changes: what it showed)
  run.at = node.id; if (!run.visited.includes(node.id)) run.visited.push(node.id);   // (you're at G0D now)
  st.mapSel = null;
  g0dfStart('fight', { real: true, node, startInt: run.integrity, startCr: run.credits, wake: snap, noWipe: !!snap });
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
// (engine/g0dfight.js g0dfFightStart, with a snapshot: the fight is set up, its mold held back in f.target)
function g0dWakeNew(p, snap) {
  const f = p.fight, W = f.W, H = f.H, [n0, n1] = G0D_WAKE.nodes, hs = FX.hs;
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
const g0dWakeShake = (k, now, seed) => k <= 0 ? [0, 0] : [(FX.hs(seed + Math.floor(now / 45)) - 0.5) * k * 0.9, (FX.hs(seed * 3.3 + Math.floor(now / 45)) - 0.5) * k * 0.35];
function g0dWakeTick(p, now, dt) {
  const w = p.wake, f = p.fight, W = f.W, H = f.H, B = w.boss, [s0, s1] = G0D_WAKE.shiver;
  w.e += dt * 1000;
  const e = w.e, say = Seq.cue(w, e);
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
    while (w.eyeTr >= 1) { w.eyeTr -= 1; g0dfTraceSpawn(w.traces, B.ex + rand(-2, 2), B.ey + rand(-1, 1), 1, 'box'); }
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
    if (o.tr >= 1) { o.tr -= 1; g0dfTraceSpawn(w.traces, o.x + 1, o.y, 1, 'box'); }
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
  g0dfTraceTick(w.traces, dt, 1, W, H);
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
  const cells = [...o.label].map((ch, k) => ({ ch, x: pxX(o.x + k), y: pxY(BOARD_Y + o.y), col: boss ? G0DF_RED : C.danger }));
  if (boss) for (let k = 0; k < 22; k++) cells.push({ ch: pickR(['·', '─', '│', '┼', '.', ':'], Math.random), x: pxX(o.x + 1 + rand(-6, 6)), y: pxY(BOARD_Y + Math.max(0, o.y + rand(-1, 2))), col: pickR([C.dim, C.mid, C.dangerDim, G0DF_RED], Math.random) });
  explode(cells, pxX(o.x + 1), pxY(BOARD_Y + o.y), { power: boss ? 0.9 : 0.5, grav: 1.4, life: [0.4, 1.0] });
}
// a letter of his bar lands: red dust off it
function g0dWakeLand(i, hard = false) {
  Sound.trap(); shake(hard ? 7 : 3, hard ? 0.3 : 0.15);
  if (hard) flash(G0DF_RED, 0.12, 0.25);
  if (reduced()) return;
  const x = Math.floor((L.wc - 5) / 2) + 1 + i, y = G0DF_BAR_ROW, cells = [];
  for (let k = 0; k < (hard ? 16 : 9); k++) cells.push({ ch: pickR(['.', ',', '`', "'", '·', '*'], Math.random), x: pxX(x + rand(-0.6, 0.6)), y: pxY(y), col: pickR([G0DF_RED, C.danger, C.dangerDim], Math.random) });
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
  f.nextHands = now + G0DF.handsEvery * 1000; f.nextLine = now + 8000; f.creepAt = 0;
  f.freshFrom = now;   // (the nodes' fresh-mold glow fades up from here)
  f.fightAt = now;   // (the music kicks in from here)
  p.wake = null;
  boySay('wtf. ok. start digging.');
}
// A tap skips it (after a beat; off by default: G0DF.tapSkip)
function g0dWakeSkip() { const p = st.g0df; if (p && p.wake && Seq.canSkip(p.wake.e, G0D_WAKE.beat)) g0dWakeDone(p); }
// The board while it wakes (buildG0df): top to bottom, each thing takes its cells; the mold over all of it
function g0dWakeDraw(p, put, bg, now) {
  const w = p.wake, f = p.fight, e = w.e, Y = BOARD_Y, hs = FX.hs, B = w.boss, [s0, s1] = G0D_WAKE.shiver;
  const moldOn = (x, y) => { const i = g0dfIdx(f, Math.round(x), Math.round(y)); return i >= 0 && f.m[i] >= 0.6; };
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
    [...lab].forEach((ch, j) => P(B.x + j + dx, B.y + dy, ch, k > 0 && Math.floor(now / 90) % 2 ? G0DF_RED : C.danger, true));
  } else {
    const age = e - s1, look = Math.round(Math.sin(now / 600) * 1.2), blink = now % 2600 < 130;
    const art = age < 160 ? ['     ', ' (@) ', '     '] : [' .-. ', blink ? '( - )' : '(' + ' '.repeat(1 + look) + '@' + ' '.repeat(1 - look) + ')', " '-' "];
    art.forEach((l, j) => { for (let k = 0; k < 5; k++) P(B.ex - 2 + k, B.ey - 1 + j, l[k], Math.floor(now / 110) % 7 === 0 ? C.bright : G0DF_RED, true); });
  }
  // the other nodes: as they were on the map; a shiver (the tension); free: G0D's (red, glitching); some are eyes
  for (const o of w.nodes) {
    const t = e - o.wake, tension = clamp(t / G0D_WAKE.tension, 0, 1);
    if (o.eye) { const l = now % 1900 < 120 ? '(-)' : '(@)'; [...l].forEach((ch, k) => P(o.x + k, o.y, ch, G0DF_RED, true)); continue; }
    const [dx, dy] = o.free ? [0, 0] : g0dWakeShake(tension, now, o.gid);
    const flip = o.free && hs(o.gid + Math.floor(now / 650) * 3.1) > 0.86;
    [...(flip ? 'G0D' : o.label)].forEach((ch, k) => {
      const x = o.x + k + dx, y = o.y + dy;
      if (o.free || hs(o.gid + k * 5.3 + Math.floor(now / 120)) < tension * 0.8) {   // red: G0D's now (the fight's corp nodes)
        const sh = G0DF_CORP_RED[Math.floor(hs(o.gid + k * 5.3 + Math.floor(now / 140)) * G0DF_CORP_RED.length)];
        const glitch = hs(o.gid * 1.7 + k * 13 + Math.floor(now / 90)) > (o.free ? 0.93 : 1 - tension * 0.3);
        return P(x, y, glitch ? noiseCh() : ch, C.bg, true, flip ? C.bright : sh, 1);
      }
      if (o.cc) return P(x, y, ch, C.dim, false, o.cc.bg, 0.55);
      P(x, y, ch, o.visited ? C.accent : C.dim);
    });
  }
  // the red traces (lightning)
  for (const [k, [ch, col, head]] of g0dfTraceCells(w.traces, now)) { const [x, y] = k.split(',').map(Number); if (ch) P(x, y, ch, col, head); }
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
    P(x, y, g0dfCircuitCh(x, y, now, f.W, f.H), age < 250 ? C.dangerDim : age < 1400 ? C.mid : hs(x * 1.3 + y * 7.9) < 0.25 ? C.mid : C.dim);
  }
  // the M0LD (the fight's own), over all of it
  for (let y = 0; y < f.H; y++) for (let x = 0; x < f.W; x++) {
    const i = y * f.W + x, th = f.m[i];
    if (th < 0.6) continue;
    put(x, Y + y, g0dfMoldGlyph(th, x, y, now), f.fresh[i] > 0.45 ? G0DF_FRESH : g0dfMoldCol(th, 0));
  }
}
// Over the screen while it wakes: his bar. G, 0, D drop in from above with a bounce (red dust as each lands), then it
// fills out from the middle both ways. Filled, it's the fight's bar exactly.
const g0dBounce = k => { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375; return n * (k -= 2.625 / d) * k + 0.984375; };
function g0dWakeOverlay(cells, now, bgs) { return g0dBarDrop(cells, bgs, st.g0df.wake.e, G0D_WAKE); }
// ---------------- Step 4: the fake win ----------------
// (docs/QUESTS.md "G0D FIGHT: it dies (and doesn't)"; v3, the user 2026-10-31.) The real rewards screen (openChoice: G0D
// BREACHED, the rewards) builds in like after any boss, a few specks of M0LD already on it (on TAKE, a couple of other
// spots); it sits there a moment (taps and keys take nothing). Then a small hole in the middle: the mold punches through,
// each cell in the hole falls out, background and all, mold coming in behind; then the mold spreads out of the hole over
// the whole screen, fast, solid (nothing of the old screen shows through). Covered: the final stand starts under it
// (its opening: wires and eyes come out of that hole; G0D's bar drops back in). G0DF.skipCine skips it outright.
const G0D_FAKE = { pause: 2400, cap: 10000, hole: 2000, plops: 6, holeR: 3.4, spread: 1800, hold: 250, beat: 700, specks: 4 };
// (round 5: his bar comes back at the crack, the mold plopping in under it; it's mostly full when the tendrils go)
const G0D_FAKE_BAR = { letters: [250, 280], fall: 450, fill: [950, 1000] };
// (round 4, the user: the specks come in on the lines as they come in, and ride them up as new lines push the block up;
// the spread isn't a circle: tendrils shoot out of the hole, wandering like the traces but outward, then grow wider and
// fill in between them)
function heavenFakeWin(stand) {
  st.g0df = null;
  if (G0DF.skipCine) return g0dfStart('stand', stand);
  const run = st.run, r = rngFor(run.seed, 'g0dreward');
  const options = shuffle([{ key: 'g0dmold', tier: 0 }].concat(pickMods(r, modsOfKind('exotic'), 2)), r);   // (round 5: all exotics, one of them his)
  st.g0dFake = { t0: performance.now(), stand, said: {}, specks: [], picked: false, cov: null, fell: null, tendrils: [] };
  openChoice({ reveal: true, title: 'G0D BREACHED', col: C.accent, head: [['G0D', C.text]], by: profile(), options,
    skipLabel: '[ SKIP  +0cr ]', onSkip: () => {}, msg: { text: '> the network is yours.', col: C.accent } });
}
function g0dFakeTick(now) {
  const f = st.g0dFake;
  if (!f) return;
  const dt = Math.min(0.05, (now - (f.last || now)) / 1000); f.last = now;
  if (st.mode !== 'panel' || st.pause || st.dev) return;
  const e = now - f.t0, rv = st.panelReveal;
  if (f.doneAt == null && (!rv || rv.done)) f.doneAt = e;
  if (f.holeAt == null && ((f.doneAt != null && e >= f.doneAt + G0D_FAKE.pause) || e >= G0D_FAKE.cap)) { f.holeAt = e; Sound.shatter(); shake(5, 0.3); }
  if (f.holeAt == null) return;
  const h = e - f.holeAt, say = Seq.cue(f, h);
  say('punch', 120, () => { Sound.trap(); shake(8, 0.4); });
  for (let i = 0; i < G0D_FAKE.plops; i++) say('p' + i, 120 + i * (G0D_FAKE.hole - 200) / G0D_FAKE.plops, () => Sound.plop());
  [0, 1, 2].forEach(i => say('L' + i, G0D_FAKE_BAR.letters[0] + i * G0D_FAKE_BAR.letters[1] + G0D_FAKE_BAR.fall, () => g0dWakeLand(i, true)));
  say('fill', G0D_FAKE_BAR.fill[0], () => { Sound.bossBuild(); shake(6, 0.6); });
  say('full', G0D_FAKE_BAR.fill[0] + G0D_FAKE_BAR.fill[1], () => { Sound.bossDrop(); flash(G0DF_RED, 0.2, 0.4); g0dSay('you are just meat.'); });
  say('spread', G0D_FAKE.hole, () => { Sound.alarm(); shake(6, 0.5); });
  g0dFakeSpread(f, h, now, dt);
  if (h >= G0D_FAKE.hole + G0D_FAKE.spread + G0D_FAKE.hold) g0dFakeEnd();
}
// An outward trace: from (x, y), heading away from (cx, cy), its turns mostly away too (engine/g0dfight.js g0dfTraceTick)
function g0dOutTrace(list, x, y, cx, cy, kind, len) {
  const t = g0dfTraceSpawn(list, x, y, 1, kind); if (!t) return null;
  const gx = x - cx, gy = y - cy, across = Math.abs(gx) / 2.2 > Math.abs(gy);
  if (across ? Math.random() < 0.75 : Math.random() < 0.25) { t.dx = Math.sign(gx) || 1; t.dy = 0; } else { t.dx = 0; t.dy = Math.sign(gy) || 1; }
  t.pts[0][2] = t.dx ? '─' : '│'; t.out = [cx, cy]; if (len) t.len = len;
  return t;
}
// The mold coming through (f.cov: when each cell was taken, -1: not yet): the hole, then tendrils, then filling in
function g0dFakeSpread(f, h, now, dt) {
  const W = L.wc, Hh = L.hc, cx = (W - 1) / 2, cy = BOARD_Y + L.gh / 2;
  if (!f.cov) f.cov = new Float64Array(W * Hh).fill(-1);
  const cov = f.cov, set = (x, y) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < Hh && cov[y * W + x] < 0) cov[y * W + x] = now; };
  const pk = Math.min(1, Math.floor(clamp((h - 120) / (G0D_FAKE.hole - 200), 0, 1) * G0D_FAKE.plops + 1) / G0D_FAKE.plops), R = G0D_FAKE.holeR * Math.sqrt(pk);   // (it plops in, a step at a time)
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) if (g0dHoleD(x, y) < R) set(x, y);
  if (h < G0D_FAKE.hole) return;
  const sk = clamp((h - G0D_FAKE.hole) / G0D_FAKE.spread, 0, 1);
  // tendrils: out of the hole's edge, or branching off one already out
  f.tAcc = (f.tAcc || 0) + dt * (26 - 16 * sk);
  while (f.tAcc >= 1) {
    f.tAcc -= 1;
    const from = f.tendrils.length && Math.random() < 0.5 ? pickR(f.tendrils, Math.random) : null, p0 = from && from.pts.length ? pickR(from.pts, Math.random) : null;
    const a = Math.random() * Math.PI * 2;
    g0dOutTrace(f.tendrils, p0 ? p0[0] : cx + Math.cos(a) * G0D_FAKE.holeR * 2.2, p0 ? p0[1] : cy + Math.sin(a) * G0D_FAKE.holeR, cx, cy, 'mold', 30 + Math.floor(Math.random() * 30));
  }
  g0dfTraceTick(f.tendrils, dt, 1, W, Hh);
  for (const t of f.tendrils) for (const [x, y] of t.pts) set(x, y);
  // and they grow wider: a cell next to mold that's been there a moment fills in, faster and faster
  const rate = 0.8 + 16 * sk * sk, grow = [], old = j => cov[j] >= 0 && now - cov[j] > 90;
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (cov[i] >= 0) continue;
    const n = (x > 0 && old(i - 1)) + (x < W - 1 && old(i + 1)) + 0.6 * ((y > 0 && old(i - W)) + (y < Hh - 1 && old(i + W)));
    if (n && Math.random() < dt * rate * n) grow.push(i);
  }
  for (const i of grow) cov[i] = now;
  if (sk >= 1) for (let i = 0; i < cov.length; i++) if (cov[i] < 0) cov[i] = now;   // (the last of it)
}
function g0dFakeSkip() { const f = st.g0dFake; if (f && Seq.canSkip(performance.now() - f.t0, G0D_FAKE.beat)) g0dFakeEnd(); }
function g0dFakeEnd() {
  const f = st.g0dFake; if (!f) return;
  st.g0dFake = null;
  boySay("he's not done. he's running!");
  g0dfStart('stand', Object.assign({}, f.stand, { noWipe: true, hole: true }));
}
// The mold as a solid cover (the fake win, the stand's opening): the same look at a cell on both sides of the hand-off
const g0dCoverMold = (x, y, now) => { const th = 1.7 + FX.hs(x * 3.7 + y * 1.3) * 3; return [g0dfMoldGlyph(th, x, y, now), moldCol(th, 2)]; };   // (stage 2's colors: it comes out of his death)
// Out from the hole (the middle of the board): how far a cell is (rows; across counts less: cells are tall)
const g0dHoleD = (x, y) => Math.hypot((x - (L.wc - 1) / 2) / 2.2, y - (BOARD_Y + L.gh / 2)) + FX.hs(x * 7.3 + y * 3.1) * 1.2;
// a cell's background this frame (scene.js keeps them in st.frameBgs while it builds)
function g0dBgAt(x, y) {
  const list = st.frameBgs || [];
  for (let i = list.length - 1; i >= 0; i--) { const b = list[i]; if (Math.round(b.cy) === y && x >= b.cx && x < b.cx + b.w && b.alpha >= 0.5) return b.col; }
  return null;
}
// The specks: a word on a line gets one as the line comes in (TAKE always; a few others at random), and it stays on
// that word wherever the line goes (the block glides up as lines come in)
function g0dFakeSpecks(f, cells, now) {
  const W = L.wc, rows = new Map();
  for (const c of cells) {
    const y = Math.round(c.cy); if (y < BOARD_Y || y >= BOARD_Y + L.gh) continue;
    let r = rows.get(y); if (!r) rows.set(y, r = { a: Array(W).fill(' '), fy: c.cy });
    const x = Math.round(c.cx); if (x >= 0 && x < W && c.ch) r.a[x] = c.ch;
  }
  const strs = []; for (const [y, r] of rows) strs.push({ y, fy: r.fy, s: r.a.join('') });
  if (!f.picked) {   // which words: ones the screen has just once (so a speck can't jump), a few at random, and TAKE
    f.picked = true;
    const text = panelLines().map(ln => ln.text || '').join(' | '), words = [...new Set(text.match(/[A-Za-z][A-Za-z0-9]{3,}/g) || [])];
    const once = shuffle(words.filter(w => text.split(w).length === 2), Math.random).slice(0, G0D_FAKE.specks - 1);
    f.specks = once.map(w => ({ word: w, off: Math.random() * (w.length - 1), r: 0.8 + Math.random() * 0.6, k: Math.floor(Math.random() * 40) }));
    f.specks.push({ word: 'T A K E', off: 3, r: 1, k: 7 });
  }
  for (const s of f.specks) {   // where its word is now (it shows up once its line is in and readable; the nearest match)
    let best = null;
    for (const r of strs) { const i = r.s.indexOf(s.word); if (i >= 0 && (!best || (s.y != null && Math.abs(r.fy - s.y) < Math.abs(best.fy - s.y)))) best = { fy: r.fy, x: i }; }
    if (best) { s.y = best.fy; s.x = best.x + s.off; if (s.born == null) s.born = now; }
  }
}
// Over the rewards screen: the specks, the hole, the mold taking over (cover everything: own background, solid)
function g0dFakeOverlay(cells, now, bgs) {
  const f = st.g0dFake;
  if (!f) return cells;
  const e = now - f.t0, W = L.wc, Hh = L.hc, hs = FX.hs, cov = f.cov, h = f.holeAt != null ? e - f.holeAt : 0;
  g0dFakeSpecks(f, cells, now);
  const spk = new Map();   // 'x,y' -> [fraction of a row it's off by (gliding), its own glyph spot]
  for (const s of f.specks) {
    if (s.y == null || s.born == null) continue;
    const r = s.r * clamp((now - s.born) / 350, 0, 1); if (r <= 0) continue;
    const yi = Math.round(s.y);
    for (let y = yi - 1; y <= yi + 1; y++) for (let x = Math.floor(s.x - r * 2.2) - 1; x <= Math.ceil(s.x + r * 2.2) + 1; x++) {
      if (x < 0 || x >= W || y < 0 || y >= Hh || Math.hypot((x - s.x) / 2.2, y - s.y) >= r || hs((x - Math.round(s.x)) * 9.1 + (y - yi) * 4.3 + s.k) <= 0.3) continue;
      spk.set(x + ',' + y, [s.y - yi, x - Math.round(s.x) + s.k, y - yi + 50]);
    }
  }
  const taken = (x, y) => cov && cov[y * W + x] >= 0, covered = (x, y) => taken(x, y) || spk.has(x + ',' + y);
  // what the mold takes falls out, background and all (the hole all of it; the spread some)
  if (cov && !reduced()) {
    if (!f.fell) f.fell = new Uint8Array(W * Hh);
    const at = new Map(); for (const c of cells) at.set(Math.round(c.cx) + ',' + Math.round(c.cy), c);
    const bits = [];
    for (let i = 0; i < cov.length; i++) {
      if (cov[i] < 0 || f.fell[i]) continue;
      f.fell[i] = 1;
      if (h > G0D_FAKE.hole && Math.random() > 0.15) continue;
      const x = i % W, y = (i / W) | 0, c = at.get(x + ',' + y), bgc = g0dBgAt(x, y);
      if ((!c && !bgc) || bits.length >= 60) continue;
      bits.push({ ch: c ? c.ch : ' ', x: pxX(x), y: pxY(y), col: c ? c.col : C.text, bg: bgc });
    }
    if (bits.length) explode(bits, pxX((W - 1) / 2), pxY(BOARD_Y + L.gh / 2) - L.chh, { power: 0.35, grav: 1.6, life: [0.6, 1.2] });
  }
  const out = cells.filter(c => !covered(Math.round(c.cx), Math.round(c.cy)));
  const spreading = h < G0D_FAKE.hole + G0D_FAKE.spread;
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    if (!covered(x, y)) continue;
    const i = y * W + x, sp = taken(x, y) ? null : spk.get(x + ',' + y), fy = sp ? sp[0] : 0;
    if (bgs) bgs.push({ cx: x, cy: y + fy, w: 1, col: C.bg, alpha: 1 });
    const [ch, col] = sp ? g0dCoverMold(sp[1], sp[2], now) : g0dCoverMold(x, y, now), fresh = !sp && spreading && now - cov[i] < 170;
    out.push({ ch, cx: x, cy: y + fy, col: fresh ? G0DF_FRESH : col, own: 'fx', bold: false });
  }
  out.push(...Seq.skipTip(e, G0D_FAKE.beat));
  return f.holeAt != null ? g0dBarDrop(out, bgs, h, G0D_FAKE_BAR, true) : out;   // his bar, over the mold
}

// ---------------- The final stand's opening, out of the hole (engine/g0dfight.js g0dfStandStart opts.hole) ----------------
// The mold covers the screen (the fake win left it so). Wires come out of the hole in the middle and replace the mold, out
// to the edges (the network, drawn in white as it comes); the eyes come out of the hole, (o) first, full size once
// they're out, to their spots; G0D's bar drops back in (like the wake-up's, harder). Then the clock starts.
const G0D_HOLE = { ms: 3900, hole: 1300, holeR: 3.4, drop: [1300, 3000], eyes: [1350, 230], eyeMove: 950, letters: [650, 320], fall: 450, fill: [1850, 1000] };
// (round 4, the user: the wires pop out through the mold: out of the hole, grey (some red at first), the mold breaking
// apart where they go; the hole opens to about 5 across; then the rest of the mold falls away all over, and the eyes
// come out. s.clr: when each cell's mold went, -1: still there.)
// the mold falling away all over: clumps (a few cells together), some cells on their own
const g0dHoleFall = (x, y) => FX.hs(Math.floor(x / 3) * 5.1 + Math.floor(y / 2) * 9.7) * 0.65 + FX.hs(x * 7.7 + y * 3.3) * 0.35;
function g0dHoleTick(p, s, now, dt) {
  const oe = now - s.openFrom, say = Seq.cue(s, oe);
  say('drop', G0D_HOLE.drop[0], () => { Sound.shatter(); shake(5, 0.4); });
  s.eyes.forEach((e, i) => say('e' + i, G0D_HOLE.eyes[0] + i * G0D_HOLE.eyes[1], () => Sound.nodeOn()));
  const W = L.wc, Hh = L.hc, cx = (W - 1) / 2, cy = L.gh / 2;
  if (!s.clr) s.clr = new Float64Array(W * Hh).fill(-1);
  const clr = s.clr, bits = [], clear = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= Hh) return;
    const i = y * W + x; if (clr[i] >= 0) return;
    clr[i] = now;
    if (bits.length < 45 && !reduced()) { const [ch, col] = g0dCoverMold(x, y, now); bits.push({ ch, x: pxX(x), y: pxY(y), col }); }
  };
  // the hole opens (slowly: about 5 across)
  const R = G0D_HOLE.holeR * Math.sqrt(clamp(oe / G0D_HOLE.hole, 0, 1));
  if (R > 0.5) for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) if (g0dHoleD(x, y) < R) clear(x, y);
  // wires out of it: grey (some red at first), mostly heading out; the mold breaks apart where they go
  const early = oe < G0D_HOLE.hole;
  s.traceAcc = (s.traceAcc || 0) + dt * (early ? 20 : 34);
  while (s.traceAcc >= 1) {
    s.traceAcc -= 1;
    const a = Math.random() * Math.PI * 2, r0 = Math.max(0.6, R - 1.2);
    g0dOutTrace(s.traces, cx + Math.cos(a) * r0 * 2.2, cy + Math.sin(a) * r0, cx, cy, Math.random() < (early ? 0.3 : 0.08) ? 'box' : 'white');
  }
  g0dfTraceTick(s.traces, dt, 1, W, L.gh);
  for (const t of s.traces) for (const [x, y] of t.pts) clear(x, BOARD_Y + y);
  // then the rest of it falls away, all over: clumps, faster and faster
  const dk = clamp((oe - G0D_HOLE.drop[0]) / (G0D_HOLE.drop[1] - G0D_HOLE.drop[0]), 0, 1);
  if (dk > 0) { const lim = dk * dk * 1.02; for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) if (g0dHoleFall(x, y) < lim) clear(x, y); }
  if (bits.length) explode(bits, pxX(cx), pxY(BOARD_Y + cy), { power: 0.15, grav: 2, life: [0.5, 1.1] });
}
// where an eye is while it comes out of the hole (null: not out yet), and whether it's full size
function g0dHoleEye(s, i, now) {
  const oe = now - s.openFrom, t = oe - (G0D_HOLE.eyes[0] + i * G0D_HOLE.eyes[1]);
  if (t < 0) return null;
  const e = s.eyes[i], k = clamp(t / G0D_HOLE.eyeMove, 0, 1), ease = 1 - Math.pow(1 - k, 3), cx = (L.wc - 1) / 2, cy = L.gh / 2;
  return { x: cx + (e.x - cx) * ease, y: cy + (e.y - cy) * ease, big: k > 0.45 };
}
// Over the screen: the mold still there (solid), and his bar dropping back in
function g0dHoleOverlay(cells, now, bgs, s) {
  const oe = now - s.openFrom, W = L.wc, Hh = L.hc, clr = s.clr;
  let out = cells;
  if (oe < G0D_HOLE.drop[1] + 400) {
    const covered = (x, y) => !clr || clr[y * W + x] < 0;
    out = out.filter(c => !covered(Math.round(c.cx), Math.round(c.cy)));
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
      if (!covered(x, y)) continue;
      if (bgs) bgs.push({ cx: x, cy: y, w: 1, col: C.bg, alpha: 1 });
      const [ch, col] = g0dCoverMold(x, y, now);
      out.push({ ch, cx: x, cy: y, col, own: 'fx', bold: false });
    }
  }
  return g0dfBar(out, bgs, { f: 1 });   // (round 5: his bar came back in the fake win)
}
// G0D's bar coming in (the wake-up, the stand's opening): G, 0, D drop in from above with a bounce (red dust as each lands:
// g0dWakeLand), then it fills out from the middle both ways. Filled, it's the fight's bar exactly.
function g0dBarDrop(cells, bgs, e, spec, hard = false) {
  const y = G0DF_BAR_ROW, Wd = L.wc, at = Math.floor((Wd - 5) / 2), [l0, gap] = spec.letters;
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
const G0D_DIE = { chrome: [150, 1100], boom: 4000, mold: [200, 1600], net: [1300, 3900], glitch: [1600, 4300], burst: 4300, small: 4900, off: 5600, offMs: 600, fade: [6300, 7400], end: 7800 };
function heavenDie(p) {
  const f = p.fight, stand = Object.assign(g0dfAgain(p), { startInt: st.run.integrity, startCr: st.run.credits });
  st.g0df = null;
  if (G0DF.skipCine) return heavenFakeWin(stand);
  const eye = f && f.eye ? { x: Math.round(f.eye.x), y: Math.round(f.eye.y) } : { x: Math.floor(L.wc / 2), y: Math.floor(L.gh / 2) };
  st.g0dDie = { t0: performance.now(), stand, said: {}, gone: new Set(), eye, stage: f ? f.stage || 0 : 2, m: f ? f.m.slice() : new Float32Array(L.wc * L.gh).fill(2), sucks: [], dmax: 1 };
  { let d = 0; for (const [x, y] of [[0, 1], [L.wc - 1, 1], [0, L.gh - 1], [L.wc - 1, L.gh - 1]]) d = Math.max(d, Math.hypot((x - eye.x) / 2.2, y - eye.y)); st.g0dDie.dmax = d; }
  Sound.hkBoom(); Sound.shatter(); flash(G0DF_BLUE, 0.6, 1.2); shake(16, 0.9);
  Music.powerDown();   // his track sags and goes (the music: g0dMusic)
  showBoard('g0ddie'); st.wipe = null; st.boardStart = -1e9;
}
const g0dDieFrac = (e, [a, b]) => clamp((e - a) / (b - a), 0, 1);
// the network, pulled in: a cell goes when the pull gets to it (the far ones first)
const g0dDieNetGone = (f, x, y, k) => (1 - Math.hypot((x - f.eye.x) / 2.2, y - f.eye.y) / f.dmax) * 0.85 + FX.hs(x * 1.9 + y * 5.3) * 0.15 < k;
function g0dDieTick(now) {
  const f = st.g0dDie;
  if (!f || st.mode !== 'g0ddie' || st.pause || st.dev) return;
  const e = now - f.t0, say = Seq.cue(f, e);
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
    const frac = g0dDieFrac(e, G0D_DIE.mold), hs = FX.hs, cells = [];
    for (let k = 0; k < 60 && cells.length < 16; k++) {
      const x = Math.floor(Math.random() * L.wc), y = Math.floor(Math.random() * L.gh), key = x + ',' + y, th = f.m[y * L.wc + x];
      if (f.gone.has(key) || th < 0.6 || hs(x * 2.7 + y * 5.3) >= frac) continue;
      f.gone.add(key);
      cells.push({ ch: g0dfMoldGlyph(th, x, y, now), x: pxX(x), y: pxY(BOARD_Y + y), col: pickR([moldCol(th, f.stage), moldCol(1, f.stage), MOLD.fresh], Math.random) });
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
      if (ndx !== t.dx || ndy !== t.dy) { const last = t.pts[t.pts.length - 1]; last[2] = G0DF_CORNER[t.dx + ',' + t.dy + '>' + ndx + ',' + ndy] || '+'; t.dx = ndx; t.dy = ndy; }
      t.x += t.dx; t.y += t.dy;
      t.pts.push([t.x, t.y, t.dx ? '─' : '│']);
    }
    if (t.done && !t.pts.length) list.splice(i, 1);
  }
}
// the eye bursts into a smaller one: its letters blow off
function g0dDieBurst(f, w, h, power) {
  Sound.hkBoom(); shake(12, 0.5); flash(G0DF_RED, 0.25, 0.4);
  if (reduced()) return;
  const cells = [];
  for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) if (Math.random() < 0.7) cells.push({ ch: pickR(['(', ')', '-', "'", '.', '@', '*'], Math.random), x: pxX(f.eye.x - (w >> 1) + k), y: pxY(BOARD_Y + f.eye.y - (h >> 1) + j), col: pickR([G0DF_RED, G0DF_BLUE, C.bright], Math.random), bg: Math.random() < 0.3 ? G0DF_RED : null });
  explode(cells, pxX(f.eye.x), pxY(BOARD_Y + f.eye.y), { power, grav: 1.2, life: [0.5, 1.1] });
}
function g0dDieSkip() {
  const f = st.g0dDie;
  if (f && Seq.canSkip(performance.now() - f.t0, G0D_END.beat)) { st.g0dDie = null; heavenFakeWin(f.stand); }   // (G0D_END's beat: G0D_DIE has none)
}
function buildG0dDie(ctx) {
  const f = st.g0dDie, { put, bg, now } = ctx;
  if (!f) return;
  const e = now - f.t0, Y = BOARD_Y, hs = FX.hs, W = L.wc, H = L.gh, moldGone = g0dDieFrac(e, G0D_DIE.mold), netK = g0dDieFrac(e, G0D_DIE.net);
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
  const col = Math.floor(now / 60) % 2 ? G0DF_RED : G0DF_BLUE, jit = hs(tick * 1.3) < gk * 0.3 ? (hs(tick) < 0.5 ? -1 : 1) : 0;
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
  for (const [k, [ch, c2, head]] of g0dfTraceCells(f.sucks, now)) { const [x, y] = k.split(',').map(Number); if (y < 1 || y >= H || taken.has(k) || onEye(x, y)) continue; taken.add(k); put(x, Y + y, ch, c2, 'fx', head); }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (taken.has(x + ',' + y) || onEye(x, y)) continue;
    const th = f.m[y * W + x];
    if (th >= 0.6 && hs(x * 2.7 + y * 5.3) >= moldGone) { put(x, Y + y, g0dfMoldGlyph(th, x, y, now), g0dfMoldCol(th, f.stage)); continue; }   // the mold still on
    if (y >= 1 && !g0dDieNetGone(f, x, y, netK)) put(x, Y + y, g0dfCircuitCh(x, y, now, W, H), hs(x * 1.3 + y * 7.9) < 0.25 ? C.mid : C.dim);   // the network, until it's pulled in
  }
}
// Over it (round 5, the user): the header, the tray and the rest go right away, a letter at a time; G0D's bar (empty)
// and the terminal stay (he's still talking) until they blow off, a beat before the eye goes small; the eye's the last
// thing; then the board's leftovers fade
function g0dDieOverlay(cells, now, bgs) {
  const f = st.g0dDie;
  if (!f) return cells;
  const e = now - f.t0, k = g0dDieFrac(e, G0D_DIE.fade), hs = FX.hs;
  let out = e < G0D_DIE.boom ? g0dfBar(cells, bgs, { f: 0 }) : cells;
  out = g0dChromeFade(out, bgs, g0dDieFrac(e, G0D_DIE.chrome));
  out = g0dChromeBoom(f, out, bgs, G0D_DIE.boom, e);
  if (k > 0) out = out.filter(c => !(c.cy >= BOARD_Y && c.cy < BOARD_Y + L.gh) || hs(Math.round(c.cx) * 3.1 + Math.round(c.cy) * 7.7) >= k * 1.4);
  return out;
}
// Take the backgrounds off some rows (in place: bgs is the frame's list)
function g0dDropBgs(bgs, rowGone) { let j = 0; for (const b of bgs) if (!rowGone(Math.round(b.cy))) bgs[j++] = b; bgs.length = j; }
// The screen's chrome going (G0D's deaths): everything off the board but G0D's bar and the terminal, a letter at a time
const G0D_KEEP_ROWS = () => [G0DF_BAR_ROW, BOARD_Y - 2];
function g0dChromeFade(out, bgs, k) {
  if (k <= 0) return out;
  const keep = G0D_KEEP_ROWS(), hs = FX.hs, gone = (x, y) => hs(x * 3.1 + y * 7.7) < k * 1.05;
  const off = y => (y < BOARD_Y || y >= BOARD_Y + L.gh) && !keep.includes(y);
  out = out.filter(c => { const x = Math.round(c.cx), y = Math.round(c.cy); return !(off(y) && gone(x, y)); });
  if (bgs && k >= 1) { g0dDropBgs(bgs, off); if (st.frameBgs) g0dDropBgs(st.frameBgs, off); return out; }   // all gone: drop what was under it (covering it cell by cell left faint seams: the user), the screen's own too (the tray's chips: they came back as solid blocks)
  if (bgs) for (let y = 0; y < L.hc; y++) { if (!off(y)) continue; for (let x = 0; x < L.wc; x++) if (gone(x, y)) bgs.push({ cx: x, cy: y, w: 1, col: C.bg, alpha: 1 }); }
  return out;
}
// ...then G0D's bar and the terminal blow off (once, at `at`): their letters and their backgrounds fly; then they're gone
function g0dChromeBoom(f, out, bgs, at, e) {
  if (e < at) return out;
  const rows = G0D_KEEP_ROWS();
  if (!f.boomed) {
    f.boomed = true; Sound.hkBoom(); Sound.shatter(); shake(10, 0.5);
    if (!reduced()) {
      const bits = [], has = new Set();
      for (const c of out) { const x = Math.round(c.cx), y = Math.round(c.cy); if (!rows.includes(y) || !c.ch || c.ch === ' ' || bits.length >= 90) continue; has.add(x + ',' + y); bits.push({ ch: c.ch, x: pxX(x), y: pxY(y), col: c.col, bg: g0dBgAt(x, y) }); }
      for (const y of rows) for (let x = 0; x < L.wc; x += 2) { const b = g0dBgAt(x, y); if (b && !has.has(x + ',' + y)) bits.push({ ch: ' ', x: pxX(x), y: pxY(y), col: C.bg, bg: b }); }
      explode(bits, pxX(L.wc / 2), pxY(rows[0]) + L.chh, { power: 1.0, grav: 1.5, life: [0.6, 1.3] });
    }
  }
  out = out.filter(c => !rows.includes(Math.round(c.cy)));
  if (bgs) { g0dDropBgs(bgs, y => rows.includes(y)); for (const y of rows) for (const d of [-0.2, 0.2]) bgs.push({ cx: -1, cy: y + d, w: L.wc + 2, col: C.bg, alpha: 1 }); }   // (the terminal's band: covered, a little over its edges)
  return out;
}

// ---------------- THE MOLD IN THE CORPS (batch 2 of H3AV3N as a seed; the user, 2026-10-31) ----------------
// A corp tagged M0LD (data/events.js): the mold hides part of the board. Light (sector 1): a few patches grow up, sit a
// second or two, crumble, while new ones grow somewhere else. Heavy (THE DEEP M0LD, heaven): it covers nearly all of
// it, the holes drifting slowly. The light mold only hides things (taps go through). The deep mold breaks (the user's
// playtest, 2026-10-31: it didn't seem clickable): a tap on it digs a hole that closes again (MOLD_FX.hole ms); a node
// mostly under it digs out first, then it's a pick.
// b0y ([b]) holds it back once a layer: it clears from the middle out for a few seconds.
const MOLD_FX = { patches: 2, gap: [400, 1300], r: [1.6, 3.3], grow: 600, sit: [1200, 2200], crumble: 700, heavy: 0.3, wipe: 3200, hole: 3400, holeR: 2.2, holeClose: 900 };
function moldLevel() {
  const run = st.run;
  if (st.mode === 'panel' && st.panelTitle === 'UPLINK' && run && run.quest === 'h3av3n' && (run.sector || 0) === 0 && !st.panelReveal) return 'light';   // the broken UPLINK (the user's playtest): the mold comes and goes on it too
  if (st.mode !== 'play' || !run || !st.lv || st.g0df) return null;
  const n = run.map[run.at];
  if (!n || n.mod !== 'mold') return null;
  return sectorEvent(n.sector || 0) === 'deepmold' ? 'heavy' : 'light';
}
function moldOverlay(cells, now, bgs) {
  const lvl = moldLevel();
  if (!lvl) { st.moldFx = null; return cells; }
  let m = st.moldFx;
  if (!m || m.lv !== st.lv) m = st.moldFx = { lv: st.lv, patches: [], nextAt: now + 300, wipe: null, used: false, holes: [] };
  m.heavy = lvl === 'heavy';
  const W = L.wc, y0 = BOARD_Y, y1 = BOARD_Y + L.gh, hs = FX.hs, cover = new Map(), bits = [];
  // the light patches: spawn, grow, sit, crumble
  const live = m.patches.filter(p => now - p.born < MOLD_FX.grow + p.sit + MOLD_FX.crumble);
  m.patches = live;
  if (live.length < MOLD_FX.patches + (lvl === 'heavy' ? 1 : 0) && now >= m.nextAt) {
    m.patches.push({ x: 4 + Math.random() * (W - 8), y: y0 + 1 + Math.random() * (L.gh - 4), r: (MOLD_FX.r[0] + Math.random() * (MOLD_FX.r[1] - MOLD_FX.r[0])) * (has('bleach') ? 0.65 : 1) /* (BLEACH: smaller) */, born: now, sit: rand(MOLD_FX.sit[0], MOLD_FX.sit[1]), seed: Math.random() * 100, fell: new Set() });
    m.nextAt = now + rand(MOLD_FX.gap[0], MOLD_FX.gap[1]);
  }
  for (const p of m.patches) {
    const e = now - p.born, gk = 1 - Math.pow(1 - clamp(e / MOLD_FX.grow, 0, 1), 2), ck = clamp((e - MOLD_FX.grow - p.sit) / MOLD_FX.crumble, 0, 1), R = p.r * gk;
    for (let y = Math.floor(p.y - p.r - 1); y <= Math.ceil(p.y + p.r + 1); y++) for (let x = Math.floor(p.x - p.r * 2.2 - 2); x <= Math.ceil(p.x + p.r * 2.2 + 2); x++) {
      if (x < 0 || x >= W || y < y0 || y >= y1) continue;
      const d = Math.hypot((x - p.x) / 2.2, y - p.y) + hs(x * 7.3 + y * 3.1 + p.seed) * 1.1;
      if (d >= R) continue;
      const k = x + ',' + y, v = hs(x * 2.9 + y * 5.7 + p.seed);
      if (v < ck) {   // crumbled: it falls
        if (!p.fell.has(k)) { p.fell.add(k); if (bits.length < 30 && !reduced()) { const th = 1 + 3 * (1 - d / p.r); bits.push({ ch: g0dfMoldGlyph(th, x, y, now), x: pxX(x), y: pxY(y), col: g0dfMoldCol(th, 0) }); } }
        continue;
      }
      cover.set(k, Math.max(cover.get(k) || 0, 1 + 3 * clamp(1 - d / p.r, 0, 1)));
    }
  }
  if (bits.length) explode(bits, pxX(W / 2), pxY(y0), { power: 0.12, grav: 2, life: [0.5, 1] });
  // the deep mold: nearly all of it, the holes drifting
  if (lvl === 'heavy') for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) {
    const v = g0dfNoise3(x * 0.16, y * 0.34, now * 0.00025);
    if (v > MOLD_FX.heavy + (has('bleach') ? 0.12 : 0)) cover.set(x + ',' + y, Math.max(cover.get(x + ',' + y) || 0, 1.2 + 3 * (v - MOLD_FX.heavy) / (1 - MOLD_FX.heavy)));
  }
  // b0y holds it back: a hole from the middle out, then it closes again
  if (m.wipe) {
    const e = now - m.wipe.at;
    if (e > MOLD_FX.wipe) m.wipe = null;
    else {
      // (the user's playtest: it could be better) it opens to just short of the corners: his blue edge holds the mold
      // there, trembling, his cursors on it (engine/hackers.js drawHkCursor)
      const k = Math.min(1, e / 500) * (e > MOLD_FX.wipe - 700 ? (MOLD_FX.wipe - e) / 700 : 1), Rw = k * Math.hypot(W / 4.4, L.gh / 2) * 0.86 + Math.sin(now / 90) * 0.15, cx = (W - 1) / 2, cy = y0 + L.gh / 2;
      const dOf = (x, y) => Math.hypot((x - cx) / 2.2, y - cy) + hs(x * 1.7 + y * 9.1) * 1.5;
      for (const key of [...cover.keys()]) { const [x, y] = key.split(',').map(Number); if (dOf(x, y) < Rw) cover.delete(key); }
      m.rim = { Rw, dOf };
    }
  }
  if (!m.wipe) m.rim = null;
  // the holes you dug (the deep mold): open, then they close in again
  m.holes = m.holes.filter(h => now - h.at < MOLD_FX.hole);
  for (const h of m.holes) {
    const e = now - h.at, R = h.r * (e > MOLD_FX.hole - MOLD_FX.holeClose ? (MOLD_FX.hole - e) / MOLD_FX.holeClose : 1);
    for (const key of [...cover.keys()]) { const [x, y] = key.split(',').map(Number); if (Math.hypot((x - h.x) / 2.2, y - h.y) + hs(x * 3.7 + y * 1.9) * 0.6 < R) cover.delete(key); }
  }
  m.cover = cover;
  if (!cover.size) return cells;
  const out = cells.filter(c => !cover.has(Math.round(c.cx) + ',' + Math.round(c.cy)));
  const rim = [];
  for (const [k, th] of cover) {
    const [x, y] = k.split(',').map(Number), onRim = m.rim && m.rim.dOf(x, y) - m.rim.Rw < 1.1;
    if (bgs) bgs.push({ cx: x, cy: y, w: 1, col: C.bg, alpha: 1 });
    if (onRim) rim.push([x, y]);
    out.push({ ch: g0dfMoldGlyph(th, x, y, now), cx: x, cy: y, col: onRim ? G0DF_BLUE : g0dfMoldCol(th, lvl === 'heavy' ? 1 : 0), own: 'fx', bold: onRim });
  }
  if (rim.length > 4 && bgs) {   // b0y's cursors on his edge (the hackers' cursor: engine/hackers.js): one up at the top left ("hold"), one down at the bottom right
    const by = f => rim.reduce((a, c) => (f(c) < f(a) ? c : a));
    const marks = [[by(c => c[0] + 2.2 * (c[1] - y0)), 'hold'], [by(c => -(c[0] + 2.2 * (c[1] - y0))), null]];
    const put = (x, y, str, col, own, bold) => { str = String(str); for (let k = 0; k < str.length; k++) { const cx = x + k, i = out.findIndex(c => Math.round(c.cx) === cx && Math.round(c.cy) === y); if (i >= 0) out.splice(i, 1); out.push({ ch: str[k], cx, cy: y, col, own: 'fx', bold }); } };
    const bg = (x, y, w, col, alpha) => bgs.push({ cx: x, cy: y, w, col, alpha });
    for (const [[x, y], say] of marks) drawHkCursor(put, bg, clamp(x - 1, 0, W - 3), y, 'b0y', say ? { say } : { tag: false });   // (the bottom one: no tag, it would hang off the board)
  }

  return out;
}
// Dig the deep mold at a cell (screen x, y): true if there was mold there to break
function moldDig(cx, cy) {
  const m = st.moldFx, now = performance.now();
  if (!m || !m.heavy || !m.cover || st.busy || moldLevel() !== 'heavy') return false;
  let th = 0; for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 2; x <= cx + 2; x++) th = Math.max(th, m.cover.get(x + ',' + y) || 0);
  if (!th) return false;
  m.holes.push({ x: cx, y: cy, at: now, r: MOLD_FX.holeR * (has('bleach') ? 1.4 : 1) });
  if (!reduced()) { const bits = []; for (let k = 0; k < 14; k++) { const x = cx + Math.round(rand(-4, 4)), y = cy + Math.round(rand(-1.5, 1.5)), t = m.cover.get(x + ',' + y); if (t) bits.push({ ch: g0dfMoldGlyph(t, x, y, now), x: pxX(x), y: pxY(y), col: moldCol(t, 1) }); } if (bits.length) explode(bits, pxX(cx), pxY(cy) - L.chh * 0.5, { power: 0.45, grav: 1.4, life: [0.3, 0.7] }); }
  Sound.moldBreak(th);
  if (!m.dugMsg) { m.dugMsg = true; setMsg('> it breaks. it grows back. quick.', moldCol(2.6, 1)); }
  return true;
}
// A tap on a node mostly under the deep mold digs it out (not a pick)
function moldDigTile(t) {
  const m = st.moldFx;
  if (!t || !m || !m.heavy || !m.cover || moldLevel() !== 'heavy') return false;
  const { tx, ty } = tileOrigin(t); let n = 0;
  for (let y = ty + 1; y <= ty + 3; y++) for (let x = tx + 1; x <= tx + 5; x++) if (m.cover.has(x + ',' + y)) n++;
  return n >= 6 && moldDig(tx + 3, ty + 2);
}
// b0y's button: [b] in his blue, at the rule's left end (across from LOOT). On a heaven run (the H3AV3N seed, the
// editor's jump) and in the G0D prototype. Tap it: he comes out. In the maze he only comes out when called (his tip:
// his cursors and the next glyph); in a M0LD corp he holds the mold back (once a layer); in the fight he comes out now.
const boyOn = () => G0DF.boy && ((st.run && st.run.heaven) || st.mode === 'g0df');
// The OMNI RAID (Greg, 2026-11-06): b0y rides in the tray ([b]) until you clear the sector (run.boyTray: engine/quests.js
// questRunStart / questSector). Tap it in a corp: he's called in like a CALL, for the rest of the corp (once a corp).
const boyTrayOn = () => !!(st.run && st.run.boyTray && !st.run.heaven);
function boyTrayCall() {
  const c = st.corp;
  if (hkUp('b0y')) { Sound.ping(1568); return setMsg('> b0y: ' + hkLine({ id: 'b0y' }, 'clue'), G0DF_BLUE); }
  if (!hkCallable()) { Sound.deny(); return setMsg('> b0y: call me in when we hit a corp.', G0DF_BLUE); }
  if (c.boyTrayUsed) { Sound.deny(); return setMsg("> b0y: lost the signal. next corp.", G0DF_BLUE); }
  c.boyTrayUsed = true; Sound.ping(1175);
  hkSpawn('b0y', 'call');
}
// The OMNI RAID's first call puts away to a hint (Greg, 2026-11-06): the training's popup, in his blue, its arrow on [b].
const BOY_HINT_COL = { tag: '#4aa8ff', ink: '#06162e', hint: '#1d4f8a', shadow: 'rgba(0,0,0,0.55)' };   // (his colors: data/hackers.js b0y style)
function boyTrayHint() {
  if (!boyTrayOn()) return;
  showHint({ target: { btn: 'b0y' }, col: BOY_HINT_COL, face: 'b0y', name: 'b0y', text: QUEST_LINES.raidHint.join(' '), at: 'above' });
}
function buildBoyBtn(ctx, y) {
  if (!(boyOn() || boyTrayOn()) || st.mode === 'title' || st.mode === 'over' || st.mp) return;
  const { put, bg, addHit, now } = ctx, x = 0, c = st.corp, p = st.g0df;
  const out = (c && c.boyCall && now < c.boyCall) || (p && p.boy && !g0dfBoyResting(p.boy)) || (st.moldFx && st.moldFx.wipe) || (boyTrayOn() && !!hkUp('b0y'));
  clearRect(ctx.cells, x, y, 3, 1);
  if (out) bg(x, y, 3, G0DF_BLUE, 1);
  // (the user, 2026-10-31: it cycles b, 0, y: his name, a letter at a time; b most of the time)
  const ph = Math.floor(now / 380) % 10, ch = ph === 7 ? '0' : ph === 8 ? 'y' : 'b';
  put(x, y, '[' + ch + ']', out ? C.bg : G0DF_BLUE, 'ui', true);
  if (st.hoverBtn === 'b0y' && !out) bg(x, y, 3, G0DF_BLUE, 0.2);
  addHit(x, y, 3, 1, { kind: 'btn', id: 'b0y', onTap: boyCall, noFocus: true });
}
// Heaven's market (the user's playtest): a REROLL there always brings an exotic. BLOOD MONEY first (it pays for INT).
function heavenExotic(r) {
  const ok = k => MODS[k] && !has(k) && !clashLockedOut(k);
  if (ok('bloodmoney')) return 'bloodmoney';
  const got = pickMods(r, modsOfKind('exotic').filter(ok), 1);
  return got.length ? got[0].key : null;
}
// b0y in a market ([b]): his shopping list
const BOY_SHOP = ['patches. lots of patches.', 'a BUFFER keeps you up.', 'reroll here. trust me.', 'shoes. he hates shoes.', 'FWALL. the eye bites.', 'buy now. no refunds later.'];
const BOY_TIPS = ['the mold comes and goes.', 'tap [b] when you need me.', 'keep your INT up. patches.', 'the corps up here are his.'];   // (the terminal fits ~30 after b0y:)
function boyCall() {
  if (boyTrayOn() && !boyOn()) return boyTrayCall();
  const now = performance.now(), c = st.corp, p = st.g0df;
  Sound.ping(1175);
  if (p && p.boy) {   // the fight (and the prototype): he comes out now
    if (g0dfBoyResting(p.boy)) { p.boy.until = 0; p.boy.phase = 'rest'; }
    return;
  }
  if (c && c.def && c.def.key === 'maze' && st.lv) {   // the maze: one round of his help (his cursors, the next glyph)
    c.boyCall = now + 7000; c.boy = null;
    return setMsg(MAZE_TIP(c), G0DF_BLUE);
  }
  if (c && c.def && c.def.key === 'cerberus') return setMsg('> b0y: ' + pickR(CERB_TIPS, Math.random), G0DF_BLUE);   // CERBERUS: he tells you what to do
  const lvl = moldLevel();
  if (lvl && st.moldFx) {   // a M0LD corp: he holds it back, once a layer
    if (st.moldFx.used) { Sound.deny(); return setMsg("> b0y: can't. not again so soon.", G0DF_BLUE); }
    st.moldFx.used = true; st.moldFx.wipe = { at: now };
    Sound.whoosh();
    return setMsg("> b0y: i'll hold it back. quick!", G0DF_BLUE);
  }
  if (st.mode === 'panel' && st.shop && st.run && st.shop.node === st.run.at && (st.run.map[st.run.at] || {}).type === 'shop') { Sound.ping(1568); return setMsg('> b0y: ' + pickR(BOY_SHOP, Math.random), G0DF_BLUE); }   // in a market: what to buy
  setMsg('> b0y: ' + pickR(BOY_TIPS, Math.random), G0DF_BLUE);
}
const MAZE_TIP = c => {
  const words = ['prompt', 'diamond', 'the cross', 'storage unit', 'uplink', 'the watcher'];
  return c.maze && c.maze.lost ? '> b0y: hm. not sure about this.' : '> b0y: ' + words[(c.maze && c.maze.path) || 0] + ' next.';
};

// ---------------- CERBERUS (the H3AV3N seed's sector 1 boss; docs/QUESTS.md, settled 2026-10-30/31) ----------------
// A corp d0g built. Three heads: three eyes, sitting on the nodes (they aren't nodes). Each goes red, then blue, then
// hops to another node. Tap a blue eye: it looks at the real node, and the node blinks a second. Tap a red one: it
// bites (-1 INT). The eyes show through everything. The board is under the M0LD, and here you can break it: a tap on a
// node under mold scrapes it (the way you'll dig in the G0D fight); a node you can see is a pick. The mold grows back.
// Its boss layer: thicker mold, faster eyes. b0y doesn't help much here: he tells you what to do ([b]: a tip).
// Its mod: BLEACH (data/mods.js). Its music: ROOT ACCESS (the user's notes: "cerberus maybe").
// (Round 2, the user 2026-10-31, walking in blind it wasn't clear:) each layer starts clear and the mold grows in, in
// fingers from the edges (grow ms; the eyes come once it's in); you can dig anywhere on the board (boardTap: input.js);
// on the first layer b0y walks you through it, a line as each thing happens; an eye that lands on the real node leaves
// before it goes blue (it never sits there a whole cycle).
// (A plain CERBERUS for the regular game, without the mold, is a note in docs/QUESTS.md.)
// HAD3S's CERBERUS (cb.plain, the user 2026-11-04): no mold at all, the eyes are the whole tell; blue is shorter
// (CERB.plainBlue / plainBossBlue) so it still bites; b0y isn't with you yet: no teaching.
const CERB = { eyes: 3, red: 1.9, blue: 1.0, bossRed: 1.35, bossBlue: 0.75, plainBlue: 0.8, plainBossBlue: 0.6, mold: [1.7, 1.6], bossMold: [2.3, 1.6], regrow: 0.14, scrape: 2.1, look: 1100, hold: 900, grow: 2800, cellGrow: 300 };   // (hold: the clear board a beat first)
const CERB_TEACH = { grow: "it's growing over the nodes.", dig: 'tap the mold. it breaks here.', eyes: 'the eyes. wait for blue. tap.', look: "that's the real one. dig it!" };   // (b0y, the first layer; ~30 fit)
const cerbTeach = (cb, k) => { if (!cb.teach || cb.taught[k] || !G0DF.boy) return; cb.taught[k] = true; setMsg('> b0y: ' + CERB_TEACH[k], G0DF_BLUE); };
// Break the mold around a cell (screen x, y): returns how thick it was there (0: nothing to break)
function cerbScrape(cb, cx, cy, now) {
  const W = L.wc, bl = has('bleach') ? 1.4 : 1, R = 1.8 * bl, bits = [];
  let th = 0;
  for (let y = Math.floor(cy - R - 1); y <= Math.ceil(cy + R + 1); y++) for (let x = Math.floor(cx - R * 2.2); x <= Math.ceil(cx + R * 2.2); x++) {
    if (x < 0 || x >= W || y < BOARD_Y || y >= BOARD_Y + L.gh) continue;
    const d = Math.hypot((x - cx) / 2.2, y - cy) / R; if (d >= 1) continue;
    const j = y * W + x, was = cb.m[j]; cb.scr[j] = 1;
    if (was < 0.6) continue;
    th = Math.max(th, was);
    cb.m[j] = Math.max(0, was - CERB.scrape * bl * (1 - d * 0.5));
    if (bits.length < 18 && Math.random() < 0.6 && !reduced()) bits.push({ ch: g0dfMoldGlyph(was, x, y, now), x: pxX(x), y: pxY(y), col: moldCol(was, cb.boss ? 1 : 0) });
  }
  if (!th) return 0;
  if (bits.length) explode(bits, pxX(cx), pxY(cy) - L.chh * 0.5, { power: 0.45, grav: 1.4, life: [0.3, 0.7] });
  Sound.moldBreak(th);
  if (!cb.said && !cb.teach) { cb.said = true; setMsg('> the mold breaks here. dig it out.', moldCol(2.6, 0)); }
  return th;
}
const CERB_TIPS = ['blue eye: tap it. it looks.', 'red eye: hands off. it bites.', 'the mold breaks here. dig.', 'i built this. wait for blue.'];   // (the terminal fits ~30 after b0y:)
HEAVEN.cerberus = {
  key: 'cerberus', name: 'CERBERUS', code: 'CB', level: 5,
  intel: '"three heads. none of them sleep."',
  tell: null, pay: 1.6, noOdds: true,
  bossDesc: 'boss: thicker mold, faster eyes.',
  rules: () => st.run && st.run.quest === 'had3s' ? 'tap blue eyes. red ones bite.' : 'tap blue eyes. dig the mold.',   // (the map's box: one line, the user)
  mods: ['bleach'],
  layerMsg: (lv, c) => ({ text: lv.cb && lv.cb.boss ? '> faster eyes. thicker mold.' : `> ${lv.n} nodes. three eyes. one is real.`, col: C.text }),
  dress(lv, k) {
    const plain = !!(st.run && st.run.quest === 'had3s');   // HAD3S: no mold
    lv.cb = { boss: k.boss, plain, seed: k.r() * 1000, eyes: [], m: null, look: null, said: false, teach: !plain && k.idx === 0 && !(st.corp && st.corp.cbTaught), taught: {} };
  },
  // a tap anywhere else on the board (not a node): it digs
  boardTap(x, y) {
    const lv = st.lv, cb = lv && lv.cb;
    if (!cb || !cb.m || lv.shownAt == null || st.busy) return false;
    return !!cerbScrape(cb, x, y, performance.now());
  },
  hint(lv) { return lv.cb ? { text: lv.cb.plain ? 'blue: tap it. red: hands off.' : 'blue: tap it. red: hands off. dig.', col: C.mid } : null; },
  // a tap: an eye (blue: it looks; red: it bites), the mold (it breaks), or a pick
  intercept(i) {
    const lv = st.lv, cb = lv && lv.cb, t = lv && lv.tiles[i], now = performance.now();
    if (!cb || !t || !cb.m || lv.shownAt == null) return false;
    const e = cb.eyes.find(o => o.tile === t);
    if (e) {
      if (cerbBlue(e, now)) {   // it looks at the real node
        cb.look = { from: t, at: now }; e.hop = true;
        Sound.ping(1568); flash(G0DF_BLUE, 0.12, 0.25);
        if (cb.teach && !cb.taught.look) { cerbTeach(cb, 'look'); if (st.corp) st.corp.cbTaught = true; }
        else setMsg('> it looks. there.', G0DF_BLUE);
      } else {   // it bites
        hurt(1); Sound.trap(); flash(G0DF_RED, 0.25, 0.5); shake(7, 0.35);
        setMsg('> red. it bites. -1 INT.', C.danger);
        if (st.run.integrity <= 0) die();
      }
      return true;
    }
    const { tx, ty } = tileOrigin(t), W = L.wc;
    let th = 0; for (let y = ty + 1; y <= ty + 3; y++) for (let x = tx + 1; x <= tx + 5; x++) th = Math.max(th, cb.m[y * W + x] || 0);
    if (th >= 0.6) { cerbScrape(cb, tx + 3, ty + 2, now); return true; }   // under the mold: it breaks
    return false;   // you can see it: a pick
  },
  overlay(ctx, lv, now) {
    const cb = lv.cb;
    if (!cb || lv.shownAt == null) return;
    const W = L.wc, Y = BOARD_Y, H = L.gh, hs = FX.hs, dt = Math.min(0.05, (now - (cb.last || now)) / 1000); cb.last = now;
    const base = cb.boss ? CERB.bossMold : CERB.mold;
    if (!cb.m) {   // the mold: it grows in over the clear board, in fingers from the edges (arr: when it gets to a cell)
      cb.m = new Float32Array(W * L.hc); cb.cap = new Float32Array(W * L.hc); cb.arr = new Float32Array(W * L.hc); cb.scr = new Uint8Array(W * L.hc); cb.t0 = now;
      const maxE = Math.max(1, Math.min(W / 4.4, H / 2));
      for (let y = Y; y < Y + H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, sx = Math.min(x, W - 1 - x) / 2.2, sy = Math.min(y - Y, Y + H - 1 - y), e = Math.min(1, Math.min(sx, sy) / maxE);
        const n = sx < sy ? g0dfNoise3(x * 0.1, y * 0.55, cb.seed + 7) : g0dfNoise3(x * 0.5, y * 0.12, cb.seed + 7);   // (fingers: along the way in from the nearest edge)
        cb.cap[i] = cb.plain ? 0 : base[0] + base[1] * g0dfNoise3(x * 0.3, y * 0.5, cb.seed);   // (plain: no mold)
        cb.arr[i] = CERB.hold + e * CERB.grow * (0.12 + 0.88 * Math.pow(n, 1.6));
      }
    }
    const ge = now - cb.t0, growing = ge < CERB.hold + CERB.grow + CERB.cellGrow;
    if (growing) for (let i = 0; i < cb.m.length; i++) {   // it grows in (where you haven't dug)
      if (!cb.cap[i] || cb.scr[i]) continue;
      const g = clamp((ge - cb.arr[i]) / CERB.cellGrow, 0, 1) * cb.cap[i];
      if (g > cb.m[i]) cb.m[i] = g;
    }
    if (cb.teach && ge > CERB.hold) cerbTeach(cb, 'grow');
    if (cb.teach && ge > CERB.hold + CERB.grow + 400 && cb.taught.grow) cerbTeach(cb, 'dig');
    // it grows back (slowly; not where an eye just looked)
    const lookOn = cb.look && now - cb.look.at < CERB.look;
    if (!st.busy) for (let i = 0; i < cb.m.length; i++) if ((!growing || cb.scr[i]) && cb.m[i] < cb.cap[i]) cb.m[i] = Math.min(cb.cap[i], cb.m[i] + CERB.regrow * dt * (cb.m[i] < 0.6 ? 0.35 : 1));
    // the eyes: on closed nodes, red then blue, then they hop (once the mold is in); one on the real node leaves before blue
    const closed = lv.tiles.filter(t => t.state === 'closed' && !t.hidden), red = cb.boss ? CERB.bossRed : CERB.red, real0 = lv.tiles[lv.safe];
    const blue = cb.plain ? (cb.boss ? CERB.plainBossBlue : CERB.plainBlue) : cb.boss ? CERB.bossBlue : CERB.blue;
    if (!cb.eyes.length && closed.length) for (let k = 0; k < Math.min(CERB.eyes, closed.length); k++) cb.eyes.push({ tile: null, at: now, wait: cb.t0 + (cb.plain ? 700 : CERB.hold + CERB.grow) + k * 520, red, blue, k });   // (plain: no mold to wait for)
    for (const e of cb.eyes) {
      if (e.wait) { if (now < e.wait) continue; e.wait = 0; if (cb.teach && cb.taught.dig) setTimeout(() => cerbTeach(cb, 'eyes'), 1600); }
      if (e.rest) { if (now < e.rest) continue; e.rest = 0; }
      const cyc = (e.tile === real0 ? red : red + blue) * 1000;   // (on the real node: it leaves before it goes blue)
      if (!e.tile || e.tile.state !== 'closed' || e.hop || now - e.at > cyc) {   // a new spot (not where another eye is)
        const free = closed.filter(t => t !== e.tile && !cb.eyes.some(o => o !== e && o.tile === t));   // (somewhere new)
        // only the real node left for it (VIRUS burned the rest, the other eyes on what's left): it rests a cycle off the
        // board. Before, it kept landing back on the real node, red, and you couldn't tap it (the user's playtest)
        if (!free.some(t => t !== real0)) { e.tile = null; e.hop = false; e.rest = now + red * 1000; continue; }
        e.tile = pickR(free, Math.random); e.at = now + (e.hop ? 250 : 0); e.hop = false;
      }
    }
    // draw: the mold (it hides the nodes), the look, the eyes over everything
    const covered = new Set();
    for (let y = Y; y < Y + H; y++) for (let x = 0; x < W; x++) if (cb.m[y * W + x] >= 0.6) covered.add(x + ',' + y);
    const keep = ctx.cells.filter(c => !covered.has(Math.round(c.cx) + ',' + Math.round(c.cy)));
    ctx.cells.length = 0; ctx.cells.push(...keep);
    for (const k of covered) { const [x, y] = k.split(',').map(Number), th = cb.m[y * W + x]; ctx.put(x, y, g0dfMoldGlyph(th, x, y, now), g0dfMoldCol(th, cb.boss ? 1 : 0), 'fx'); }
    const real = lv.tiles[lv.safe];
    if (lookOn && real && real.state === 'closed') {   // it looks: a line of dots to the real node; the node's corners blink
      const a = tileOrigin(cb.look.from), b = tileOrigin(real), k = (now - cb.look.at) / CERB.look;
      const steps = Math.max(Math.abs(b.tx - a.tx), Math.abs(b.ty - a.ty) * 2);
      for (let s = 1; s < steps; s++) { if (s / steps > k * 2.2) break; const x = Math.round(a.tx + 3 + (b.tx - a.tx) * s / steps), y = Math.round(a.ty + 2 + (b.ty - a.ty) * s / steps); if (s % 2 === 0) ctx.put(x, y, '·', G0DF_BLUE, 'fx', true); }
      if (Math.floor(now / 120) % 2) for (const [dx, dy, ch] of [[0, 0, '+'], [6, 0, '+'], [0, 4, '+'], [6, 4, '+']]) { ctx.bg(b.tx + dx, b.ty + dy, 1, G0DF_BLUE, 1); ctx.put(b.tx + dx, b.ty + dy, ch, C.bg, 'fx', true); }
    }
    const gt = Math.floor(now / 70);
    for (const e of cb.eyes) {
      if (!e.tile || now < e.at) continue;
      const { tx, ty } = tileOrigin(e.tile), isBlue = cerbBlue(e, now), col = isBlue ? G0DF_BLUE : G0DF_RED;
      const age = now - e.at, opening = age < 160, dart = Math.round(Math.sin(now / 380 + e.k * 2.1) * 1.2);
      const mid = opening ? '( - )' : '(' + ' '.repeat(1 + dart) + '@' + ' '.repeat(1 - dart) + ')';
      [' .-. ', mid, " '-' "].forEach((l, j) => {
        for (let q = 0; q < 5; q++) {
          const x = tx + 1 + q, y = ty + 1 + j, ch = l[q];
          const inv = isBlue ? hs(x * 3.3 + y * 7.1 + gt) > 0.15 : hs(x * 3.3 + y * 7.1 + gt) < 0.2;   // blue: solid (glitching); red: a glitch now and then
          if (inv) { ctx.bg(x, y, 1, col, 1); ctx.put(x, y, ch === ' ' ? ' ' : ch, C.bg, 'fx', true); }
          else { ctx.bg(x, y, 1, C.bg, 1); if (ch !== ' ') ctx.put(x, y, ch, col, 'fx', true); }
        }
      });
    }
  },
  counts: t => Array.from({ length: 4 }, (_, i) => clamp(t + 2 + i, 4, 9)),
};
const cerbBlue = (e, now) => (now - e.at) / 1000 >= e.red;
CORP_TELL.cerberus = 'three eyes sit on the nodes. each goes red, then blue, then moves. tap a blue eye and it looks at the real node, which blinks. tap a red one and it bites. the board is under the mold: tap a node under it to break it, then pick it.';
MUSIC_FOR.cerberus = 'rootaccess';

// ---------------- The music (2026-10-31) ----------------
// What the G0D fights play (engine/boot.js asks; null: not here). The tracks: data/music.js, the G0D section; which one
// plays: MUSIC_FOR maze (G0D MAZE: the real corp's track; the prototype's maze too), g0d (the fight), g0dstand.
//   the wake-up: the fight's track coming in (pad and bass, then drums as his bar fills, then the arp as the mold rises)
//   the fight (staged, stages: true; round 5): it kicks in on B at level 4 for two bars, then settles on A at 3; his
//     stage 2 is B at 4, stage 3 C; his eye open lifts it (a level, the filter); HANDS OFF's charge is urgency
//   G0D dies: the music powers down (heavenDie); the fake win: the rewards screen's own track, then at the crack the
//     final stand's comes in low with his bar
//   the final stand: its opening, then the clock: urgency, and its A, B, C by thirds of the clock
//   the collapse: it powers down (heavenCollapse) and nothing comes back in
function g0dMusic() {
  const p = st.g0df, now = performance.now(), o = (song, x) => Object.assign({ song: trackFor(song), level: 2, urgency: 0, low: false, tempo: 1, pitch: 1, section: 'A' }, x);
  if (st.mode === 'g0df' && p && !p.card) {
    if (p.stage === 'maze') return o('maze', { level: clamp(1 + Math.floor(((p.maze && p.maze.path) || 0) / 2), 1, 3) });
    if (p.stage === 'fight') {
      const f = p.fight, w = p.wake;
      if (w) return o('godfight', { level: w.e < G0D_WAKE.fill[0] ? 0 : w.e < G0D_WAKE.mold[0] ? 1 : 2 });
      const stg = clamp(f.stage || 0, 0, 2), heat = f.hands ? clamp((now - f.hands.at) / 1000 / G0DF.charge, 0, 1) : 0;
      const tr = SONGS[trackFor('godfight')], bar = tr ? (tr.meter || 4) * 60000 / tr.bpm : 2000;
      const kick = stg === 0 && now - (f.fightAt || 0) < bar * 2.2, eye = f.eye ? 1 : 0;
      return o('godfight', { level: Math.min(4, (kick ? 4 : [3, 4, 4][stg]) + eye), section: kick ? 'B' : 'ABC'[stg], urgency: Math.min(1, heat * 0.8 + eye * 0.45), tempo: 1.05 + stg * 0.03 + eye * 0.02, low: !!(st.run && st.run.integrity <= 1) });
    }
    if (p.stage === 'stand') {
      const s = p.stand, tr = SONGS[trackFor('g0dstand')];
      if (now < s.openUntil) return o('g0dstand', { level: now - s.openFrom < 1500 ? 1 : 2 });
      const k = clamp(1 - s.left / G0DF.standTime, 0, 1);
      return o('g0dstand', { level: 4, section: 'ABC'[Math.min(2, Math.floor(k * 3))], urgency: k, tempo: 1 + (tr && tr.tick ? k * 0.25 : 0) + 0.05, low: !!(st.run && st.run.integrity <= 1) });
    }
  }
  if (st.mode === 'g0ddie' && st.g0dDie) return o('godfight', { level: 2, section: 'C' });   // (it powers down: heavenDie)
  if (st.mode === 'g0dend' && st.g0dEnd) return o('g0dstand', { level: 4, section: 'C' });   // (it trails off: heavenCollapse; nothing else comes in)
  const fk = st.g0dFake;
  if (fk && fk.holeAt != null) return o('g0dstand', { level: performance.now() - fk.t0 - fk.holeAt < G0D_FAKE.hole ? 0 : 1 });   // the crack: the final stand's track comes in, low
  return null;
}
// G0D's voice (round 5, the user): his terminal lines growl as they type (a deep modem); the more he's hurt, the higher
// and chirpier (engine/sound.js g0dVoice). A syllable every few letters (every other one as he breaks down).
function g0dVoiceTick(now) {
  const m = st.msg || '';
  if (!m.startsWith('> G0D: ') || now - st.msgT > 4000) return;
  if (st.g0dVoiceT !== st.msgT) { st.g0dVoiceT = st.msgT; st.g0dVoiceN = 7; }
  const n = Math.min(m.length, Math.floor((now - st.msgT) / 16)), hi = g0dVoiceHi(), every = hi > 0.5 ? 2 : 3;
  for (let k = st.g0dVoiceN; k < n; k++) if (k % every === 0 && m[k] !== ' ') { Sound.g0dVoice(hi); break; }
  st.g0dVoiceN = Math.max(st.g0dVoiceN, n);
}
const g0dVoiceHi = () => {
  const p = st.g0df;
  if (st.g0dDie || st.g0dEnd) return 1;
  if (st.g0dFake) return 0.8;
  if (p && p.stand) return 0.75 + 0.25 * p.stand.cur / p.stand.eyes.length;
  if (p && p.fight && !p.wake) return clamp(1 - p.fight.hp / G0DF.hp, 0, 1) * 0.85;
  return 0;
};

// ---------------- Step 5: the collapse ----------------
// The final stand won. (Round 5, the user: no junk left on the screen; the music trails off like a boss's, nothing else
// comes in.) The header and the tray go first, a letter at a time; his network crumbles in bursts (some, a pause, more,
// then all of it); G0D's bar and the terminal blow off; his last eye (where you got it) glitches harder and harder,
// bursts small, goes off like a TV: black. G0D DEFEATED types in (and "..with a shoe" if it was); a beat; then a CALL:
// go again (the maze, or the G0D fight). The ending, the credits and the rewards come later (docs/ENDGAME.md).
const G0D_END = { chrome: [100, 900], crumble: [[500, 750, 0.16], [1500, 1750, 0.34], [2300, 2700, 1]], boom: 2900, burst: 3300, small: 3800, off: 4300, offMs: 600, title: 5300, shoe: 6300, call: 7300, beat: 700 };
const G0D_END_TITLE = 'G0D DEFEATED';
function heavenCollapse(p) {
  const s = p.stand, le = s && s.eyes[s.cur - 1], eye = le ? { x: clamp(Math.round(le.x), 4, L.wc - 5), y: clamp(Math.round(le.y), 2, L.gh - 2) } : { x: Math.floor(L.wc / 2), y: Math.floor(L.gh / 2) };
  st.g0df = null;
  st.g0dEnd = { t0: performance.now(), node: p.node, said: {}, gone: new Set(), eye, shoe: !!(s && s.shoeKill) };
  if (G0DF.skipCine) g0dEndSkip(st.g0dEnd);
  Sound.shatter(); flash(C.bright, 0.7, 1.4); shake(18, 1);
  Music.powerDown();   // (it trails off like a boss's)
  showBoard('g0dend'); st.wipe = null; st.boardStart = -1e9;
}
// how much of the network has gone (0..1): each burst eases out to its share; the last one is all of it at once
const g0dEndCrumble = e => {
  let v = 0;
  for (const [a, b, to] of G0D_END.crumble) { if (e <= a) return v; const k = clamp((e - a) / (b - a), 0, 1), last = to >= 1; if (e < b) return v + (to - v) * (last ? k * k : 1 - Math.pow(1 - k, 2)); v = to; }
  return v;
};
// which network cells go first: clumps (a few cells together), some on their own
const g0dEndH = (x, y) => FX.hs(Math.floor(x / 4) * 3.7 + Math.floor(y / 2) * 8.3) * 0.6 + FX.hs(x * 1.9 + y * 5.3) * 0.4;
function g0dEndSkip(f) {   // straight to G0D DEFEATED (the editor's skip, a tap)
  f.t0 = performance.now() - G0D_END.title; f.boomed = true;
  for (const k of ['a', 'b', 'k0', 'k1', 'k2', 'burst', 'small', 'off']) f.said[k] = true;
}
function g0dEndTick(now) {
  const f = st.g0dEnd;
  if (!f || st.mode !== 'g0dend' || st.pause || st.dev) return;
  const e = now - f.t0, say = Seq.cue(f, e);
  say('a', 300, () => g0dSay('n0. n0. i AM the net.'));   // (the user, 2026-11-05: it just dies. no "there will be others")
  say('b', 1700, () => g0dSay('i am th3 n3t. i am th3 n%... i am'));   // its code coming apart (scattered across the net: the ending)
  G0D_END.crumble.forEach(([a], i) => say('k' + i, a, () => { const last = i === G0D_END.crumble.length - 1; Sound.shatter(); if (last) Sound.hkBoom(); shake(last ? 14 : 6, last ? 0.7 : 0.35); }));
  say('burst', G0D_END.burst, () => g0dDieBurst(f, 5, 3, 0.9));
  say('small', G0D_END.small, () => g0dDieBurst(f, 3, 1, 0.6));
  say('off', G0D_END.off, () => { Sound.shatter(); shake(6, 0.4); flash(C.bright, 0.15, 0.3); });
  // the network crumbling: what goes this frame falls
  const c0 = G0D_END.crumble[0][0], c1 = G0D_END.crumble[G0D_END.crumble.length - 1][1];
  if (!reduced() && e > c0 && e < c1 + 200) {
    const frac = g0dEndCrumble(e), cells = [];
    for (let y = 1; y < L.gh; y++) for (let x = 0; x < L.wc; x++) {
      const key = x + ',' + y;
      if (f.gone.has(key) || g0dEndH(x, y) >= frac) continue;
      f.gone.add(key);
      if (cells.length < 70 && Math.random() < 0.6) cells.push({ ch: g0dfCircuitCh(x, y, f.t0, L.wc, L.gh), x: pxX(x), y: pxY(BOARD_Y + y), col: pickR([C.dim, C.mid, C.dangerDim], Math.random) });
    }
    if (cells.length) explode(cells, pxX(f.eye.x), pxY(BOARD_Y + f.eye.y), { power: 0.35, grav: 1.6, life: [0.5, 1.1] });
  }
  if (e >= G0D_END.title) { const n = Math.min(G0D_END_TITLE.length, Math.floor((e - G0D_END.title) / 35)); if (n > (f.typed || 0)) { f.typed = n; Sound.tick(); } }
  if (f.shoe) say('shoe', G0D_END.shoe, () => Sound.ui());
  say('call', f.shoe ? G0D_END.call : G0D_END.call - 700, () => g0dEndCall(f));
}
// The ending (a placeholder, docs/ENDGAME.md): on the H3AV3N seed, the cutscene, the credits, "there is more to
// explore", the rewards (the 1UP, REPLAYS, G0D's logo); then POPS's CALL. The editor's jump: the CALL.
function g0dEndCall(f) {
  const run = st.run;
  if (run && run.quest && !f.ended) {
    f.ended = true;
    f.wasBeat = !!save.beatG0D;
    if (!save.beatG0D) { save.beatG0D = true; persist(); }
    save.g0dWins = (save.g0dWins || 0) + 1; persist();
    stat('g0d_win', { quest: run.quest, seed: run.seed, shoe: !!f.shoe });
    if (questOf('pops').step === 'g0d') questStep('pops', 'done');   // the main quest: done
    return playScene('h3av3n', () => heavenRewards(f, () => { showBoard('g0dend'); st.wipe = null; g0dEndCall(f); }));
  }
  const node = f.node, seed = run && run.seed, quest = run && run.quest;
  st.kbFocus = st.hoverBtn = null; Sound.shield();
  st.callBox = ({ t0: performance.now(), who: 'pops', lines: ['kid. you did it. G0D is down.', "b0y's up here with me. he says hi.", 'the net is yours. go again?'],
    btns: [
      { text: '[ G0D FIGHT ]', onTap: () => { st.g0dEnd = null; st.g0df = null; toMap(); setTimeout(() => { if (st.mode === 'map' && st.run && !st.g0df && node) g0dWakeStart(node); }, 700); } },
      { text: '[ TITLE ]', onTap: async () => { st.g0dEnd = null; st.g0df = null; if (quest) { await endRun(true); swapTo(showTitle); } else heavenWon(f); } }],   // (Greg, 2026-11-06: the fight again or out; THE MAZE went: it started sector 2 over, not the maze)
    onClose: () => { if (quest) { st.g0dEnd = null; st.g0df = null; endRun(true); } else heavenWon(f); } });   // (straight up: it doesn't wait in the CALL queue) (the seed: the run ends, a win)
}
// The ending's rewards screen (a placeholder, the user 2026-10-31): your logo, how you did, the REP (the run's, if it
// was practice, plus H3AV3N's own), what it unlocked. No loot, no mods. Then the heaven feats (the FEAT boxes come once
// the run's over) and POPS's CALL. The REP amounts: H3AV3N_REP (the first time, then again).
const H3AV3N_REP = { first: 150, again: 50 };
function heavenRewards(f, next) {
  const run = st.run, bonus = f.wasBeat ? H3AV3N_REP.again : H3AV3N_REP.first, runRep = run.practice ? repFor(run) : 0, rep = bonus + runRep;
  save.rep = (save.rep || 0) + rep; save.repTotal = (save.repTotal || 0) + rep; persist();
  const clean = !run.g0dHurt;
  Sound.bossWin(); flash(G0DF_BLUE, 0.25, 0.6);
  const extra = [['', C.text], [`INT left ${run.integrity}/${run.maxInt}`, C.text], [`corps ${run.corps || 0}   perfects ${run.perfects || 0}`, C.text]];
  if (f.shoe) extra.push(['..with a shoe', C.mid]);
  if (clean) extra.push(['G0D never touched you.', C.accent]);
  extra.push(['', C.text]);
  if (runRep) extra.push([`+${runRep} REP   the run`, C.rep]);
  extra.push([`+${bonus} REP   H3AV3N`, C.rep], ['', C.text]);
  if (!f.wasBeat) extra.push(['unlocked:', C.mid], ["1UP       b0y's crash unit", C.money], ["REPLAYS   POPS's log, on the title", C.money], ['G0D       its logo, yours', C.money]);   // (the ending hands them over: data/quests.js h3av3n)
  else extra.push([`G0D down x${save.g0dWins}.`, C.money]);
  openChoice({ reveal: true, title: 'H3AV3N CLEARED', col: G0DF_BLUE, by: profile(), head: [['G0D', C.text]], extra, options: [],
    skipLabel: '[ CONTINUE ]', msg: { text: "> b0y: we did it. it's quiet now.", col: G0DF_BLUE },
    next: () => { for (const [id, on] of [['g0dslayer', true], ['g0dclean', clean], ['g0dshoe', f.shoe]]) if (on) grantFeat(id); next(); } });   // (the feats after the screen: their boxes come once the run's over)
}
// A tap: skip to G0D DEFEATED (after a beat; G0DF.tapSkip). The CALL takes its own taps.
function g0dEndTap() {
  const f = st.g0dEnd, e = performance.now() - f.t0;
  if (e < G0D_END.title && Seq.canSkip(e, G0D_END.beat)) g0dEndSkip(f);
}
function buildG0dEnd(ctx) {
  const f = st.g0dEnd, { put, bg, now } = ctx;
  if (!f) return;
  const e = now - f.t0, Y = BOARD_Y, hs = FX.hs, frac = g0dEndCrumble(e), ex = f.eye.x, ey = f.eye.y;
  const live = e < G0D_END.off + G0D_END.offMs, onEye = (x, y) => live && Math.abs(x - ex) <= 4 && Math.abs(y - ey) <= 1;
  // the network, bare, crumbling away (nothing's left behind)
  for (let y = 1; y < L.gh; y++) for (let x = 0; x < L.wc; x++) {
    if (g0dEndH(x, y) < frac || onEye(x, y)) continue;
    put(x, Y + y, g0dfCircuitCh(x, y, f.t0, L.wc, L.gh), hs(x * 1.3 + y * 7.9) < 0.3 ? C.dangerDim : C.dim);
  }
  // his last eye: glitching harder and harder (inverting, G0D on it), bursts small, then off like a TV
  if (live) {
    const gk = clamp(e / G0D_END.burst, 0, 1), tick = Math.floor(now / 70), col = Math.floor(now / 60) % 2 ? G0DF_RED : G0DF_BLUE, off = e >= G0D_END.off;
    const P = (x, y, ch, c) => {
      if (ch === ' ') return;
      const inv = hs(x * 3.3 + y * 7.1 + tick) < 0.15 + gk * 0.5, noise = hs(x * 5.7 + y * 1.9 + tick * 3) < gk * 0.3;
      if (inv) { bg(x, Y + y, 1, c, 1); put(x, Y + y, noise ? noiseCh() : ch, C.bg, 'fx', true); } else put(x, Y + y, noise ? noiseCh() : ch, c, 'fx', true);
    };
    let art;
    if (e < G0D_END.burst) { const d = Math.floor(now / 90) % 3 - 1; art = [' .-. ', hs(tick * 0.7) < 0.15 + gk * 0.3 ? '(G0D)' : '(' + ' '.repeat(1 + d) + '@' + ' '.repeat(1 - d) + ')', " '-' "]; }
    else if (e < G0D_END.small) art = [Math.floor(now / 50) % 2 ? '(@)' : '(O)'];
    else if (!off) art = [Math.floor(now / 70) % 2 ? '(.)' : ' · '];
    else { const k = (e - G0D_END.off) / G0D_END.offMs; art = [k < 0.25 ? '-------' : k < 0.5 ? '-----' : k < 0.75 ? '-' : '·']; }
    const jit = !off && hs(tick * 1.3) < gk * 0.35 ? (hs(tick) < 0.5 ? -1 : 1) : 0;
    art.forEach((l, j) => { const x0 = ex - (l.length >> 1) + jit, y = ey - (art.length >> 1) + j; bg(x0, Y + y, l.length, C.bg, 1); for (let k = 0; k < l.length; k++) off ? put(x0 + k, Y + y, l[k], C.bright, 'fx', true) : P(x0 + k, y, l[k], col); });
  }
  // G0D DEFEATED (it types in, like G0D BREACHED did), and how
  if (e >= G0D_END.title) {
    const T = G0D_END_TITLE, n = Math.min(T.length, Math.floor((e - G0D_END.title) / 35)), x0 = Math.floor((L.wc - T.length) / 2);
    const callAt = f.shoe ? G0D_END.call : G0D_END.call - 700, mid = Y + Math.floor(L.gh / 2) - 1, up = Math.max(BOARD_Y, Math.floor((L.hc - 13) / 2) - 4);   // (it rises out of the CALL's way as it comes in)
    const y = Math.round(mid + (up - mid) * clamp((e - callAt + 450) / 450, 0, 1));
    put(x0, y, T.slice(0, n) + (n < T.length && Math.floor(now / 250) % 2 ? '_' : ''), C.accent, 'ui', true);
    if (f.shoe && e >= G0D_END.shoe) { const t = '..with a shoe'; put(Math.floor((L.wc - t.length) / 2), y + 2, t.slice(0, Math.floor((e - G0D_END.shoe) / 45)), C.mid, 'ui'); }
  }
}
// Over it: G0D's bar (empty) and the terminal until they blow off; the header and the tray go first
function g0dEndOverlay(cells, now, bgs) {
  const f = st.g0dEnd;
  if (!f) return cells;
  const e = now - f.t0;
  let out = e < G0D_END.boom ? g0dfBar(cells, bgs, { f: 0 }) : cells;
  out = g0dChromeFade(out, bgs, g0dDieFrac(e, G0D_END.chrome));
  out = g0dChromeBoom(f, out, bgs, G0D_END.boom, e);
  if (e < G0D_END.title) out = out.concat(Seq.skipTip(e, G0D_END.beat));
  return out;
}
// It's over (the placeholder ending): back to the map.
function heavenWon(f) {
  st.g0dEnd = null; st.g0df = null;
  setMsg('> G0D is down. the network goes quiet.', G0DF_BLUE);
  toMap();
}

// G0D: the boss spot (its node: the wake-up, then the fight).
HEAVEN.g0d = {
  key: 'g0d', name: 'G0D', letter: '@', level: 5, intel: '"you are just meat."', tell: null,
  rules: () => 'the network is me.',
};
