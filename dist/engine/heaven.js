// NeoN+1 engine/heaven.js: H3AV3N in the real game (docs/QUESTS.md, step 11 and "G0D's fights"). Built a step at a time
// (the user, 2026-10-30: work the G0D prototype into the engine):
//   1. heaven's sector 2 as a real sector map: 3 rows of corps, the MAZE right under G0D, a market off to the side
//      (after the maze), G0D in the boss spot. The editor's g0d tab jumps there.
//   2. G0D MAZE as a real corp (the corp kit): real layers, node tiles, wipes, mods; its own rules (the codex order).
//   3+. (next) the fight as the boss, the fake win, the final stand, the collapse.
// The heaven corps aren't in CORPS (so they never come up in a normal run): corpDef looks here too (engine/corps.js).
'use strict';
NEON_FILES.push(['engine/heaven.js', 'v13.91']);

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

// ---------------- Step 3: G0D's node. The wake-up on the map, then the fight ----------------
// The wake-up (docs/QUESTS.md "G0D FIGHT: the wake-up"): you breach the node and the map doesn't change: G0D's node
// opens into an eye (@) and blinks, the M0LD eats the network from the top down, his bar comes up and fills, he talks,
// b0y says we gotta break through. A tap skips it (after a beat); the editor can skip it outright (G0DP.skipCine).
const G0D_WAKE = { ms: 5200, beat: 700 };
function g0dWakeStart(node) {
  if (st.g0dWake) return;
  if (G0DP.skipCine) return g0dWakeEnd(node);
  st.g0dWake = { t0: performance.now(), node, said: {} };
  st.mapSel = null;
  Sound.bossDrop(); shake(8, 0.5); flash(C.danger, 0.2, 0.4);
}
function g0dWakeTick(now) {
  const w = st.g0dWake;
  if (!w || st.mode !== 'map' || st.pause || st.dev) return;
  const e = now - w.t0, say = (k, at, fn) => { if (e >= at && !w.said[k]) { w.said[k] = true; fn(); } };
  say('a', 300, () => g0dSay("you can't defeat me."));
  say('b', 900, () => { Sound.alarm(); shake(5, 0.4); });
  say('c', 2300, () => g0dSay('you are just meat.'));
  say('d', 3100, () => { Sound.bossBuild(); });
  say('e', 4300, () => boySay('we gotta break through that mold.'));
  if (e >= G0D_WAKE.ms) g0dWakeEnd(w.node);
}
function g0dWakeSkip() { const w = st.g0dWake; if (w && performance.now() - w.t0 > G0D_WAKE.beat) g0dWakeEnd(w.node); }
function g0dWakeEnd(node) {
  st.g0dWake = null;
  const run = st.run;
  run.at = node.id; if (!run.visited.includes(node.id)) run.visited.push(node.id);   // (you're at G0D now)
  g0dpStart('fight', { real: true, node, startInt: run.integrity, startCr: run.credits });
}
// Drawn over the map (engine/scene.js): the M0LD from the top down, G0D's bar filling.
function g0dWakeOverlay(cells, now, bgs) {
  const w = st.g0dWake;
  if (!w || st.mode !== 'map') return cells;
  const e = now - w.t0, t = Math.floor(e / 110) + 30, y0 = BOARD_Y, H = L.gh, W = L.wc, eye = w.eyeAt;
  // it creeps in from every edge of the map; G0D's eye stays (it watches)
  const R = Math.max(0, Math.min(1, (e - 700) / 2600)) * (Math.min(W / 4, H / 2) + 3);
  const edge = (x, y) => Math.min(x / 2, (W - 1 - x) / 2, y - y0, y0 + H - 1 - y) + G0D_LOOKS.hs(x * 7.3 + y * 3.1) * 2.5;
  const onEye = c => eye && Math.round(c.cy) === eye.y && c.cx >= eye.x - 1 && c.cx <= eye.x + 3;
  const keep = cells.filter(onEye);
  let out = g0dSpread(cells.filter(c => !onEye(c)), t, R, edge, y0, y0 + H, W).filter(c => !onEye(c)).concat(keep);
  if (eye && bgs) bgs.push({ cx: eye.x - 1, cy: eye.y, w: 5, col: C.bg, alpha: 1 });
  if (eye) out = out.map(c => onEye(c) && c.ch !== ' ' ? Object.assign({}, c, { col: C.danger, bold: true }) : c);
  if (e > 3000) out = g0dpBar(out, bgs, { f: Math.min(1, (e - 3000) / 1200) });
  if (e > G0D_WAKE.beat) { const tip = 'tap to skip'; out.push(...[...tip].map((ch, k) => ({ ch, cx: L.wc - tip.length + k, cy: y0 + L.gh - 1, col: C.dim, own: 'fx', bold: false }))); }
  return out;
}
// ---------------- Step 4: the fake win ----------------
// (docs/QUESTS.md "G0D FIGHT: it dies (and doesn't)") G0D BREACHED comes up like the win screen and types in; about 20%
// of the way it glitches and freezes; a little M0LD in the middle spreads fast over the whole screen; G0D's bar comes back
// and fills; "you are just meat."; then the final stand. A tap skips it (after a beat); G0DP.skipCine skips it outright.
const G0D_FAKE = { type: 22, freeze: 0.22, glitch: 900, spread: 2200, bar: 1400, stand: 6200, beat: 700 };   // chars a second; the freeze (part typed); ms...
function heavenFakeWin(p) {
  const run = st.run, stand = Object.assign(g0dpAgain(p), { startInt: run.integrity, startCr: run.credits });
  st.g0dp = null;
  if (G0DP.skipCine) return g0dpStart('stand', stand);
  const r = run;
  st.g0dFake = { t0: performance.now(), stand, said: {}, lines: [
    ['G0D BREACHED', 'accent', true], ['', ''], ['G0D', 'bright', true], ['the network is yours.', 'text'], ['', ''],
    [`INT ${r.integrity}/${r.maxInt}    CR ${r.credits}`, 'mid'], [`depth ${r.depth}    corps ${r.corps || 0}`, 'mid'], ['', ''], ['[ CONTINUE ]', 'mid']] };
  Sound.bossWin();
  showBoard('g0dfake');
}
const g0dFakeChars = f => f.lines.reduce((a, l) => a + l[0].length, 0);
function g0dFakeTick(now) {
  const f = st.g0dFake;
  if (!f || st.mode !== 'g0dfake' || st.pause || st.dev) return;
  const e = now - f.t0, total = g0dFakeChars(f), frozeAt = total * G0D_FAKE.freeze / G0D_FAKE.type * 1000;
  const say = (k, at, fn) => { if (e >= at && !f.said[k]) { f.said[k] = true; fn(); } };
  f.frozeAt = frozeAt;
  say('freeze', frozeAt, () => { Sound.shatter(); shake(6, 0.3); });
  say('mold', frozeAt + G0D_FAKE.glitch, () => { Sound.alarm(); });
  say('bar', frozeAt + G0D_FAKE.glitch + G0D_FAKE.spread * 0.6, () => { Sound.bossBuild(); });
  say('meat', frozeAt + G0D_FAKE.glitch + G0D_FAKE.spread + 300, () => g0dSay('you are just meat.'));
  if (e >= frozeAt + G0D_FAKE.stand - 1200 + G0D_FAKE.glitch) g0dFakeEnd();
}
function g0dFakeSkip() { const f = st.g0dFake; if (f && performance.now() - f.t0 > G0D_FAKE.beat) g0dFakeEnd(); }
function g0dFakeEnd() {
  const f = st.g0dFake; if (!f) return;
  st.g0dFake = null;
  boySay("he's not done. he's running!");
  g0dpStart('stand', f.stand);
}
// The win screen as it types in (frozen ~20% in, glitching), drawn on the board like a panel
function buildG0dFake(ctx) {
  const f = st.g0dFake, { put, now } = ctx;
  if (!f) return;
  const e = now - f.t0, frozen = f.frozeAt != null && e >= f.frozeAt;
  let left = Math.floor(Math.min(e, f.frozeAt != null ? f.frozeAt : e) / 1000 * G0D_FAKE.type);
  const y0 = BOARD_Y + Math.floor((L.gh - f.lines.length) / 2);
  f.lines.forEach(([text, col, bold], k) => {
    const show = text.slice(0, Math.max(0, left)); left -= text.length;
    let out = show;
    if (frozen) out = [...show].map(ch => ch !== ' ' && Math.random() < 0.12 ? noiseCh() : ch).join('');   // stuck, glitching
    const x = Math.floor((L.wc - text.length) / 2) + (frozen && Math.random() < 0.05 ? (Math.random() < 0.5 ? -1 : 1) : 0);
    if (out) put(x, y0 + k, out, C[col] || C.text, 'ui', !!bold);
    if (!frozen && show.length < text.length && show.length > 0 && Math.floor(now / 120) % 2) put(x + show.length, y0 + k, '_', C.bright, 'ui');   // the cursor
  });
}
// Over it: the M0LD spreading from the middle, G0D's bar filling back up, "tap to skip"
function g0dFakeOverlay(cells, now, bgs) {
  const f = st.g0dFake;
  if (!f || f.frozeAt == null) return cells;
  const e = now - f.t0 - f.frozeAt - G0D_FAKE.glitch, t = Math.floor(now / 110), W = L.wc, Hh = L.hc, cx = W / 2, cy = BOARD_Y + L.gh / 2;
  let out = cells;
  if (e > 0) {
    const R = Math.min(1, e / G0D_FAKE.spread) * (Math.hypot(W / 4, Hh / 2) + 4);
    out = g0dSpread(out, t, R, (x, y) => Math.hypot((x - cx) / 2, y - cy) + G0D_LOOKS.hs(x * 7.3 + y * 3.1) * 2.5, 0, Hh, W);
  }
  const eb = e - G0D_FAKE.spread * 0.6;
  if (eb > 0) out = g0dpBar(out, bgs, { f: Math.min(1, eb / G0D_FAKE.bar) - (G0D_LOOKS.hs(Math.floor(now / 90)) > 0.85 ? 0.06 : 0) });
  if (now - f.t0 > G0D_FAKE.beat) { const tip = 'tap to skip'; out = out.concat([...tip].map((ch, k) => ({ ch, cx: L.wc - tip.length + k, cy: BOARD_Y + L.gh - 1, col: C.dim, own: 'fx', bold: false }))); }
  return out;
}

// The fight is won (step 5 will put the collapse in between): back to the map.
function heavenWon(p) {
  st.g0dp = null;
  setMsg('> G0D is down. (steps 4-5: the collapse, the ending)', G0DP_BLUE);
  toMap();
}

// G0D: the boss spot (its node: the wake-up, then the fight).
HEAVEN.g0d = {
  key: 'g0d', name: 'G0D', letter: '@', level: 5, intel: '"you are just meat."', tell: null,
  rules: () => 'the network is me.',
};
