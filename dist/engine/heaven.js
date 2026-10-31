// NeoN+1 engine/heaven.js: H3AV3N in the real game (docs/QUESTS.md, step 11 and "G0D's fights"). Built a step at a time
// (the user, 2026-10-30: work the G0D prototype into the engine):
//   1. heaven's sector 2 as a real sector map: 3 rows of corps, the MAZE right under G0D, a market off to the side
//      (after the maze), G0D in the boss spot. The editor's g0d tab jumps there.
//   2. G0D MAZE as a real corp (the corp kit): real layers, node tiles, wipes, mods; its own rules (the codex order).
//   3+. (next) the fight as the boss, the fake win, the final stand, the collapse.
// The heaven corps aren't in CORPS (so they never come up in a normal run): corpDef looks here too (engine/corps.js).
'use strict';
NEON_FILES.push(['engine/heaven.js', 'v13.93']);

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
  tell: null, pay: 0.6, timer: 6, noLoot: true, noReward: true, noOdds: true,
  layerMsg: (lv, c) => {
    if (!G0DP.boy || !c.maze) return `> layer ${c.maze ? c.maze.label : ''}. ${lv.n} ways on.`;
    const words = ['prompt', 'diamond', 'cross', 'st#%age', 'upl@#k', 'wa%#'], at = c.maze.lost ? -1 : c.maze.path;
    return { text: '> ' + words.map((w, i) => i === at ? w.toUpperCase() : w).join(' '), col: G0DP_BLUE };   // b0y's clue (round: b0y in the maze)
  },
  // b0y in the maze: two cursors on the nodes' top right corners (the one you're after among them), they come together on
  // it; he hides when he's resting. (G0DP.boy off: no b0y.)
  overlay(ctx, lv, now) {
    const c = st.corp;
    if (!G0DP.boy || !c || !c.maze || !lv || st.busy && !lv.tiles.some(t => t.state === 'closed')) return;
    c.boy = c.boy || g0dpBoyNew();
    const dt = Math.min(0.05, (now - (c.boyLast || now)) / 1000); c.boyLast = now;
    const corner = t => { const o = tileOrigin(t); return { x: o.tx + TILE_W - 1, y: o.ty }; };
    const open = lv.tiles.filter(t => t.state === 'closed'), real = lv.tiles[lv.safe];
    g0dpBoyTick({ boy: c.boy }, now, dt, { right: !c.maze.lost && real && real.state === 'closed' ? corner(real) : null, others: open.filter(t => t !== real).map(corner) });
    const b = c.boy;
    if (b.phase === 'rest' || (b.phase === 'hold' && now > b.until - 900)) return;   // resting: hidden
    b.curs.slice(0, 2).forEach((cu, i) => {
      const bob = Math.abs(cu.x - cu.tx) < 0.5 && Math.floor((now + i * 170) / 260) % 2 ? 1 : 0, x = Math.round(cu.x), y = Math.round(cu.y) - bob;
      ctx.bg(x, y, 1, G0DP_BLUE, 1); ctx.put(x, y, 'v', C.bg, 'fx', true);
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
function g0dWakeSkip() { const w = st.g0dWake; if (G0DP.tapSkip && w && performance.now() - w.t0 > G0D_WAKE.beat) g0dWakeEnd(w.node); }
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
  if (G0DP.tapSkip && e > G0D_WAKE.beat) { const tip = 'tap to skip'; out.push(...[...tip].map((ch, k) => ({ ch, cx: L.wc - tip.length + k, cy: y0 + L.gh - 1, col: C.dim, own: 'fx', bold: false }))); }
  return out;
}
// ---------------- Step 4: the fake win ----------------
// (docs/QUESTS.md "G0D FIGHT: it dies (and doesn't)") G0D BREACHED comes up like the win screen and types in; about 20%
// of the way it glitches and freezes; a little M0LD in the middle spreads fast over the whole screen; G0D's bar comes back
// and fills; "you are just meat."; then the final stand. A tap skips it (after a beat); G0DP.skipCine skips it outright.
const G0D_FAKE = { freezeMs: 4600, glitch: 900, spread: 2200, bar: 1400, stand: 6200, beat: 700 };   // ms: when it freezes; the glitch; the mold; the bar...
// (v2, the user: "the rewards screen should start to come up before G0D comes out"): the real rewards screen (openChoice,
// building in like after any boss: G0D BREACHED, the rewards), frozen partway; taps don't take anything.
function heavenFakeWin(stand) {
  st.g0dp = null;
  if (G0DP.skipCine) return g0dpStart('stand', stand);
  const run = st.run, r = rngFor(run.seed, 'g0dreward');
  const options = pickMods(r, modsOfKind('exotic'), 1).concat(pickMods(r, modsOfKind('gen'), 2));
  st.g0dFake = { t0: performance.now(), stand, said: {} };
  openChoice({ reveal: true, title: 'G0D BREACHED', col: C.accent, head: [['G0D', C.text]], by: profile(), options,
    skipLabel: '[ SKIP  +0cr ]', onSkip: () => {}, msg: { text: '> the network is yours.', col: C.accent } });
}
function g0dFakeTick(now) {
  const f = st.g0dFake;
  if (!f || st.mode !== 'panel' || st.pause || st.dev) return;
  const e = now - f.t0, frozeAt = G0D_FAKE.freezeMs;
  const say = (k, at, fn) => { if (e >= at && !f.said[k]) { f.said[k] = true; fn(); } };
  f.frozeAt = frozeAt;
  const rv = st.panelReveal;   // frozen: the reveal stops where it is (its clock held)
  if (e >= frozeAt && rv) {
    if (f.held == null) { f.held = now - rv.t0; f.pop = rv.firstPop ? now - rv.firstPop : null; f.p0 = st.panelT0 !== Infinity ? now - st.panelT0 : null; }
    rv.t0 = now - f.held; if (f.pop != null) rv.firstPop = now - f.pop; if (f.p0 != null) st.panelT0 = now - f.p0;
  }
  say('freeze', frozeAt, () => { Sound.shatter(); shake(6, 0.3); });
  say('mold', frozeAt + G0D_FAKE.glitch, () => { Sound.alarm(); });
  say('bar', frozeAt + G0D_FAKE.glitch + G0D_FAKE.spread * 0.6, () => { Sound.bossBuild(); });
  say('meat', frozeAt + G0D_FAKE.glitch + G0D_FAKE.spread + 300, () => g0dSay('you are just meat.'));
  if (e >= frozeAt + G0D_FAKE.stand - 1200 + G0D_FAKE.glitch) g0dFakeEnd();
}
function g0dFakeSkip() { const f = st.g0dFake; if (G0DP.tapSkip && f && performance.now() - f.t0 > G0D_FAKE.beat) g0dFakeEnd(); }
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
  if (!f || f.frozeAt == null || now - f.t0 < f.frozeAt) return cells;
  const e = now - f.t0 - f.frozeAt - G0D_FAKE.glitch, t = Math.floor(now / 110), W = L.wc, Hh = L.hc, cx = W / 2, cy = BOARD_Y + L.gh / 2;
  // frozen: the screen glitches (letters swap out, now and then a row jumps)
  let out = cells.map(c => c.ch !== ' ' && Math.random() < 0.08 ? Object.assign({}, c, { ch: noiseCh() }) : c);
  if (e > 0) {
    const R = Math.min(1, e / G0D_FAKE.spread) * (Math.hypot(W / 4, Hh / 2) + 4);
    out = g0dSpread(out, t, R, (x, y) => Math.hypot((x - cx) / 2, y - cy) + G0D_LOOKS.hs(x * 7.3 + y * 3.1) * 2.5, 0, Hh, W);
  }
  const eb = e - G0D_FAKE.spread * 0.6;
  if (eb > 0) out = g0dpBar(out, bgs, { f: Math.min(1, eb / G0D_FAKE.bar) - (G0D_LOOKS.hs(Math.floor(now / 90)) > 0.85 ? 0.06 : 0) });
  if (G0DP.tapSkip && now - f.t0 > G0D_FAKE.beat) { const tip = 'tap to skip'; out = out.concat([...tip].map((ch, k) => ({ ch, cx: L.wc - tip.length + k, cy: BOARD_Y + L.gh - 1, col: C.dim, own: 'fx', bold: false }))); }
  return out;
}

// ---------------- G0D dies (the fight won, before the fake win) ----------------
// (docs/QUESTS.md "G0D FIGHT: it dies (and doesn't)"; the user, 2026-10-30: as long as the final stand's death.) The last
// hit: the M0LD spills off and falls away, the network shows bare, then it crumbles; the eye looks around, frantic, a last
// threat, it fizzles; the board goes dark, then the header and the footer: black. Then the rewards screen builds in.
const G0D_DIE = { mold: [250, 1700], net: [1900, 3300], fizzle: 3500, fade: [3700, 4900], end: 5300 };
function heavenDie(p) {
  const stand = Object.assign(g0dpAgain(p), { startInt: st.run.integrity, startCr: st.run.credits });
  st.g0dp = null;
  if (G0DP.skipCine) return heavenFakeWin(stand);
  st.g0dDie = { t0: performance.now(), stand, said: {}, gone: new Set() };
  Sound.hkBoom(); Sound.shatter(); flash(G0DP_BLUE, 0.6, 1.2); shake(16, 0.9);
  showBoard('g0ddie');
}
const g0dDieFrac = (e, [a, b]) => clamp((e - a) / (b - a), 0, 1);
function g0dDieTick(now) {
  const f = st.g0dDie;
  if (!f || st.mode !== 'g0ddie' || st.pause || st.dev) return;
  const e = now - f.t0, say = (k, at, fn) => { if (e >= at && !f.said[k]) { f.said[k] = true; fn(); } };
  say('a', 400, () => g0dSay('n0. N0. N0000.'));
  say('b', 2400, () => g0dSay('this isn\'t... over...'));
  say('c', G0D_DIE.fizzle, () => { Sound.shatter(); shake(6, 0.4); });
  say('d', G0D_DIE.fade[0], () => Sound.bossDrop());
  // what falls: the mold first, then the network
  if (!reduced()) {
    const hs = G0D_LOOKS.hs, cells = [];
    for (const [layer, span] of [['m', G0D_DIE.mold], ['n', G0D_DIE.net]]) {
      if (e < span[0] || e > span[1] + 200) continue;
      const frac = g0dDieFrac(e, span);
      for (let k = 0; k < 50 && cells.length < 14; k++) {
        const x = Math.floor(Math.random() * L.wc), y = 1 + Math.floor(Math.random() * (L.gh - 1)), key = layer + x + ',' + y;
        if (f.gone.has(key) || hs(x * (layer === 'm' ? 2.7 : 1.9) + y * 5.3) >= frac) continue;
        f.gone.add(key);
        cells.push(layer === 'm' ? { ch: g0dpMoldGlyph(3, x, y, now), x: pxX(x), y: pxY(BOARD_Y + y), col: pickR([G0D_COLS.mold, G0D_COLS.moldDim, G0DP_FRESH], Math.random) }
          : { ch: g0dpCircuitCh(x, y, f.t0, L.wc, L.gh), x: pxX(x), y: pxY(BOARD_Y + y), col: pickR([C.dim, C.mid], Math.random) });
      }
    }
    if (cells.length) explode(cells, pxX(L.wc / 2), pxY(BOARD_Y + 2), { power: 0.3, grav: 1.8, life: [0.6, 1.2] });
  }
  if (e >= G0D_DIE.end) { st.g0dDie = null; heavenFakeWin(f.stand); }
}
function g0dDieSkip() { const f = st.g0dDie; if (G0DP.tapSkip && f && performance.now() - f.t0 > G0D_END.beat) { st.g0dDie = null; heavenFakeWin(f.stand); } }
function buildG0dDie(ctx) {
  const f = st.g0dDie, { put, bg, now } = ctx;
  if (!f) return;
  const e = now - f.t0, Y = BOARD_Y, hs = G0D_LOOKS.hs, moldGone = g0dDieFrac(e, G0D_DIE.mold), netGone = g0dDieFrac(e, G0D_DIE.net);
  const cx = Math.floor(L.wc / 2), cy = Math.floor(L.gh / 2);
  for (let y = 1; y < L.gh; y++) for (let x = 0; x < L.wc; x++) {
    if (Math.abs(x - cx) <= 6 && Math.abs(y - cy) <= 2 && e < G0D_DIE.fizzle + 300) continue;   // (the eye)
    if (hs(x * 2.7 + y * 5.3) >= moldGone) { put(x, Y + y, g0dpMoldGlyph(2 + hs(x + y * 3) * 2.5, x, y, now), hs(x * 4.1 + y) < 0.4 ? G0D_COLS.mold : G0D_COLS.moldDim); continue; }
    if (hs(x * 1.9 + y * 5.3) >= netGone) put(x, Y + y, g0dpCircuitCh(x, y, f.t0, L.wc, L.gh), hs(x * 1.3 + y * 7.9) < 0.25 ? C.mid : C.dim);
  }
  // the eye: frantic, then it fizzles
  if (e < G0D_DIE.fizzle + 300) {
    const dart = Math.floor(now / 80) % 5 - 2, small = e > G0D_DIE.fizzle, col = Math.floor(now / 60) % 2 ? G0DP_RED : G0DP_BLUE;
    const iris = '  ' + ' '.repeat(2 + dart) + '(@)' + ' '.repeat(2 - dart) + '  ';
    const art = small ? ['             ', '             ', e < G0D_DIE.fizzle + 150 ? '     (.)     ' : '      .      ', '             ', '             ']
      : ['   .-----.   ', " .'       '. ", '(' + iris + ')', " '.       .' ", "   '-----'   "];
    art.forEach((l, k) => { bg(cx - 6, Y + cy - 2 + k, 13, C.bg, 1); put(cx - 6, Y + cy - 2 + k, l, col, 'fx', true); });
  }
}
// Over it: G0D's bar (empty), then everything fades to black: the board first, then the header and the footer
function g0dDieOverlay(cells, now, bgs) {
  const f = st.g0dDie;
  if (!f) return cells;
  const e = now - f.t0, k = g0dDieFrac(e, G0D_DIE.fade), hs = G0D_LOOKS.hs;
  let out = e < G0D_DIE.fade[0] ? g0dpBar(cells, bgs, { f: 0 }) : cells;
  if (k > 0) out = out.filter(c => { const onBoard = c.cy >= BOARD_Y && c.cy < BOARD_Y + L.gh, v = hs(c.cx * 3.1 + c.cy * 7.7); return onBoard ? v >= k * 1.4 : v >= (k - 0.45) * 1.8; });
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
