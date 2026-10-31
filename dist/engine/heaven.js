// NeoN+1 engine/heaven.js: H3AV3N in the real game (docs/QUESTS.md, step 11 and "G0D's fights"). Built a step at a time
// (the user, 2026-10-30: work the G0D prototype into the engine):
//   1. heaven's sector 2 as a real sector map: 3 rows of corps, the MAZE right under G0D, a market off to the side
//      (after the maze), G0D in the boss spot. The editor's g0d tab jumps there.
//   2. G0D MAZE as a real corp (the corp kit): real layers, node tiles, wipes, mods; its own rules (the codex order).
//   3+. (next) the fight as the boss, the fake win, the final stand, the collapse.
// The heaven corps aren't in CORPS (so they never come up in a normal run): corpDef looks here too (engine/corps.js).
'use strict';
NEON_FILES.push(['engine/heaven.js', 'v13.89']);

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
  intel: '"b0y: the codex order. prompt. diamond. cross. st#%age. upl@#k. wa%#..."',
  tell: null, pay: 0.6, timer: 6, noLoot: true, noReward: true, noOdds: true,
  layerMsg: (lv, c) => `> layer ${c.maze ? c.maze.label : ''}. ${lv.n} ways on.`,
  rules: () => 'every node is a perfect. follow the codex.',
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

// G0D: the boss spot. Step 3 makes it the fight; for now it says so.
HEAVEN.g0d = {
  key: 'g0d', name: 'G0D', letter: '@', level: 5, intel: '"you are just meat."', tell: null,
  rules: () => 'the network is me.',
};
