// NeoN+1 engine/g0dproto.js: the G0D PROTOTYPE (the user, 2026-10-30: "an initial prototype so i can see how fun it
// plays"; docs/QUESTS.md, "G0D's fights"). Three stages you can play from the neon editor's g0d tab: G0D MAZE, G0D FIGHT
// (the M0LD, the eye, HANDS OFF, the mold stealing), G0D FINAL STAND. A rough b0y (3 cursors that point, never tap) can be
// switched on and off. It runs as its own screen (st.mode 'g0dp') over a practice run: the header shows your INT and
// credits, the board is the stage. Nothing here touches a real run's rules. Things will change in testing: the numbers
// are all in G0DP, and the editor can change them.
'use strict';
NEON_FILES.push(['engine/g0dproto.js', 'v13.88']);

const G0DP = {
  boy: true,                 // b0y helps (his cursors and his lines)
  // the maze
  mazeTimer: 5,              // s: each maze layer's clock (out: -1 INT, it starts again)
  mazeLost: 6,               // wrong layers deep before the next tap sends you back (and costs 1 INT)
  mazeNodes: [8, 9, 10, 10, 12, 12],   // nodes per layer, by depth
  // the fight
  hp: 12,                    // G0D's hits
  hitsPerEye: 3,             // hits before the eye closes
  eyeOpen: 5,                // s the eye stays open
  decoys: 4,                 // corp nodes in the network (besides the eye's node)
  spew: 1.6,                 // mold a node spews a second (thickness, at its middle)
  creep: 0.25,               // how fast mold creeps on its own
  handsEvery: 22,            // s between HANDS OFF attacks
  charge: 4,                 // s: the charge (eyes appear, red fades in; no damage; the counter works)
  burn: 3,                   // s: the burn (all red: every tap costs 1 INT)
  stealEvery: 3,             // s of thick mold on the INT / credits corner before it steals
  // the final stand
  standEyes: 8, standTime: 30, red: 1.2, blue: 0.8,   // eyes, the clock (s), an eye's red and blue (s; red gets shorter as you win)
};
const G0DP_BLUE = '#4aa8ff', G0DP_RED = '#ff3b3b', G0DP_FRESH = '#d8ff70';

// ---------------- Lines ----------------
// (the terminal fits about 37 characters after "> b0y: ": keep them short)
const G0DP_LINES = {
  boyMaze: 'the codex order. watch:',   // the clue itself sits at the bottom of the maze (G0DP_CLUE)
  boyLost: ['hm.', "not sure this is the right way.", "this doesn't look right.", "we're lost, man.", 'everything down here is wrong.', 'next one sends us back.'],
  boyFight: ['we gotta break through that mold.', 'find the node that looks back.', 'fresh mold = a node under it.'],
  boyHands: "it's red! hands off!",
  boyStand: "he's running. stop him!",
  g0d: ['you are just meat.', 'you are a rounding error.', 'every node is mine.', 'you are standing in me.', 'i saw you jack in.', 'your crew will forget you.'],
  g0dLow: ['everyday low prices. everyday.', '70% chance of ICE.', 'your call is important to us.', 'the forecast is m0ld.', 'a byte is e1ght. e19ht. bits.', 'please hold. please hold. ple', 'n0de n0t f0und', 'have you tried turning me of'],
  hit: ['AAGH.', 'you dare.', 'that eye cost me a sector.', 'it does not hurt. it does not.'],
};
// b0y's clue in the maze: the codex order, half eaten by the mold (two lines at the bottom of the board)
const G0DP_CLUE = ['b0y: prompt. diamond. cross.', '     st#%age. upl@#k. wa%#...'];
// where each answer's word sits in the clue: [line, column, length] (path step 0-5)
const G0DP_CLUE_AT = [[0, 5, 6], [0, 13, 7], [0, 22, 5], [1, 5, 7], [1, 14, 6], [1, 22, 4]];
const g0dSay = (text, col = C.danger) => setMsg('> G0D: ' + text, col);
// b0y's lines: in the terminal, and on the board's bottom row a few seconds (the terminal gets stepped on; the user, round 1)
const boySay = text => { if (!G0DP.boy) return; setMsg('> b0y: ' + text, G0DP_BLUE); if (st.g0dp) st.g0dp.boyLine = { text, at: performance.now() }; };
const g0dpBoyLineOn = (p, now) => !!(G0DP.boy && p.boyLine && now - p.boyLine.at < 4500);
function g0dpBoyLineDraw(p, put, bg, now) {
  if (!g0dpBoyLineOn(p, now)) return;
  const y = BOARD_Y + L.gh - 1, t = ('b0y: ' + p.boyLine.text).slice(0, L.wc);
  bg(0, y, L.wc, C.bg, 1); put(0, y, t, G0DP_BLUE, 'fx', true);
}

// ---------------- Start / stop ----------------
// stage: 'maze' | 'fight' | 'stand'
function g0dpStart(stage) {
  const run = st.run;
  if (!run) return;
  run.integrity = run.maxInt;
  const p = st.g0dp = { stage, t0: performance.now(), boy: g0dpBoyNew(), startCr: run.credits };
  if (stage === 'maze') g0dpMazeStart(p);
  if (stage === 'fight') g0dpFightStart(p);
  if (stage === 'stand') g0dpStandStart(p);
  showBoard('g0dp');
  Sound.bossDrop(); shake(6, 0.4);
}
function g0dpStop() { st.g0dp = null; if (st.mode === 'g0dp') toMap(); }
// A card between stages (or after a fail): lines, then a tap goes on.
function g0dpCard(p, lines, next, col = C.text) { p.card = { lines, next, col, at: performance.now() }; }
// INT: lose some (0: the stage starts over), get some back
function g0dpHurt(p, n, why) {
  const run = st.run;
  run.integrity = Math.max(0, run.integrity - n);
  Sound.trap(); flash(C.danger, 0.25, 0.5); shake(7, 0.35);
  if (why) setMsg('> ' + why, C.danger);
  if (run.integrity <= 0 && !p.card) {
    g0dSay('you are just meat.');
    const stage = p.stage;
    g0dpCard(p, [stage === 'stand' ? 'HE GOT AWAY' : 'FLATLINED', '', stage === 'maze' ? 'the maze starts over.' : stage === 'fight' ? 'the fight starts over.' : 'the final stand starts over.', '', 'tap to go again'], () => {
      st.run.credits = p.startCr;
      g0dpStart(stage);
    }, C.danger);
  }
}
const g0dpHeal = n => { const run = st.run; run.integrity = Math.min(run.maxInt, run.integrity + n); };

// ---------------- b0y: 3 cursors. They wander to 3 nodes (one is right), then come together on the right one. ----------------
function g0dpBoyNew() { return { curs: [0, 1, 2].map(i => ({ x: 6 + i * 4, y: 1, tx: 6 + i * 4, ty: 1 })), phase: 'rest', until: performance.now() + 1500 }; }
// targets: { right: {x, y} | null, others: [{x, y}...] } (board cells, the spot to hover over)
function g0dpBoyTick(p, now, dt, targets) {
  const b = p.boy;
  if (!G0DP.boy || !b) return;
  if (now > b.until) {
    if (b.phase === 'rest' || b.phase === 'hold') {   // scatter: each to a different node, the right one among them
      const opts = targets.right ? [targets.right, ...shuffle(targets.others, Math.random).slice(0, 2)] : shuffle(targets.others, Math.random).slice(0, 3);
      const spots = shuffle(opts, Math.random);
      b.curs.forEach((c, i) => { const s = spots[i % Math.max(1, spots.length)] || { x: c.x, y: c.y }; c.tx = s.x; c.ty = s.y; });
      b.phase = 'scatter'; b.until = now + 2300; b.right = targets.right;
    } else if (b.phase === 'scatter') {   // converge, one at a time
      b.phase = 'converge'; b.until = now + 1700; b.k = 0; b.kAt = now;
    } else if (b.phase === 'converge') { b.phase = 'hold'; b.until = now + 2600; }
  }
  if (b.phase === 'converge' && b.right) {
    while (b.k < 3 && now - b.kAt > b.k * 380) { b.curs[b.k].tx = b.right.x; b.curs[b.k].ty = b.right.y; b.k++; }
  }
  if (b.phase === 'hold' && now > b.until - 900) b.curs.forEach((c, i) => { c.tx = 4 + i * 3; c.ty = 0; });   // drift off to rest
  if (b.phase === 'hold' && targets.right) b.right = targets.right;
  for (const c of b.curs) {   // glide (a bit of jitter while hovering)
    const jx = b.phase === 'scatter' ? Math.sin(now / 160 + c.tx) * 0.6 : 0;
    c.x += (c.tx + jx - c.x) * Math.min(1, dt * 6); c.y += (c.ty - c.y) * Math.min(1, dt * 6);
  }
}
// The fight's b0y (round 1: three cursors got in the way): one cursor, and it takes him a while. He hops to a node or
// two, then finds the right one and sits by it; then he goes off to look again.
function g0dpBoyTick1(p, now, dt, targets) {
  const b = p.boy;
  if (!G0DP.boy || !b) return;
  b.single = true;
  const c = b.curs[0], others = targets.others;
  if (now > b.until) {
    const next = { rest: 'look1', look1: 'look2', look2: 'found', found: 'rest' }[b.phase] || 'look1';
    b.phase = next;
    if (next === 'look1' || next === 'look2') { const o = pickR(others, Math.random) || targets.right; if (o) { c.tx = o.x; c.ty = o.y; } b.until = now + 1700; }
    if (next === 'found') b.until = now + 3000;
    if (next === 'rest') { c.tx = 2; c.ty = 0; b.until = now + 3000; }
  }
  if (b.phase === 'found' && targets.right) { c.tx = targets.right.x; c.ty = targets.right.y; }
  const jx = b.phase.startsWith('look') ? Math.sin(now / 200) * 0.8 : 0;
  c.x += (c.tx + jx - c.x) * Math.min(1, dt * 3.5); c.y += (c.ty - c.y) * Math.min(1, dt * 3.5);
}
function g0dpBoyDraw(p, put, bg, now) {
  const b = p.boy;
  if (!G0DP.boy || !b) return;
  b.curs.forEach((c, i) => {
    if (b.single && i > 0) return;
    const maze = p.stage === 'maze', bob = maze && i < 2 && Math.abs(c.x - c.tx) < 0.5 && Math.floor((now + i * 170) / 260) % 2 ? 1 : 0;   // the maze: they bob on a node's corner
    const x = Math.round(c.x), y = BOARD_Y + Math.round(c.y) - bob;
    if (y < BOARD_Y || y >= BOARD_Y + L.gh) return;
    bg(x, y, 1, G0DP_BLUE, b.phase === 'hold' && now > b.until - 900 && !(maze && i === 2) ? 0.35 : 1);
    put(x, y, 'v', C.bg, 'fx', true);
    if (i === 0 && !maze) put(x + 1, y, 'b0y', G0DP_BLUE, 'fx');
  });
}

// ---------------- G0D MAZE ----------------
// The right path is the codex order: PROMPT, DIAMOND, THE CROSS, STORAGE UNIT, UPLINK, THE WATCHER. Every node you tap
// is a perfect (+1 INT). Off the path, everything below is wrong; 6 wrong layers deep, the next tap costs 1 INT and
// sends you back to the start. Every layer has a clock: out, -1 INT, and it starts again.
const G0DP_SEQ = () => {
  const by = n => MOTIFS[ART_GLYPHS.findIndex(g => g.name === n)];
  return [JACK_GLYPH, by('DIAMOND'), by('THE CROSS'), by('STORAGE UNIT'), by('UPLINK'), by('THE WATCHER')];
};
function g0dpMazeStart(p) {
  p.maze = { depth: 1, path: 0, lost: 0, label: '1A', seq: G0DP_SEQ() };
  g0dpMazeLayer(p);
  boySay(G0DP_LINES.boyMaze);
}
// slow: back at the start (after a hurt): a beat, then the nodes come in one at a time, slower (round 1)
function g0dpMazeLayer(p, slow = false) {
  const m = p.maze, n = G0DP.mazeNodes[Math.min(m.depth - 1, G0DP.mazeNodes.length - 1)];
  const cols = Math.max(1, Math.floor((L.wc + 1) / 8)), rows = Math.max(1, Math.floor((L.gh - 2) / 6));
  const slots = shuffle([...Array(cols * rows).keys()], Math.random).slice(0, Math.min(n, cols * rows));
  const ox = Math.floor((L.wc - (cols * 8 - 1)) / 2), oy = 2;
  const seqSet = new Set(m.seq.map(g => g.join('|')));
  const pool = shuffle(MOTIFS.filter(g => !seqSet.has(g.join('|'))), Math.random);
  const right = m.lost ? -1 : Math.floor(Math.random() * slots.length);
  m.nodes = slots.map((s, i) => {
    let glyph = pool[i % pool.length];
    if (i === right) glyph = m.seq[m.path];
    else if (Math.random() < 0.3) { const others = m.seq.filter((_, k) => k !== m.path); glyph = others[Math.floor(Math.random() * others.length)]; }   // other path glyphs, out of order: a memory test
    return { x: ox + (s % cols) * 8, y: oy + Math.floor(s / cols) * 6, glyph, right: i === right };
  });
  const now = performance.now();
  shuffle(m.nodes.slice(), Math.random).forEach((n, k) => { n.showAt = now + (slow ? 700 + k * 140 : k * 45); n.on = false; });
  m.reset = slow ? now : 0;
  m.left = G0DP.mazeTimer;
}
function g0dpMazeTick(p, now, dt) {
  const m = p.maze;
  for (const n of m.nodes) if (!n.on && now >= n.showAt) { n.on = true; Sound.nodeOn(); }
  if (m.nodes.some(n => now < n.showAt)) return;   // the clock waits for the nodes
  m.left -= dt;
  if (m.left <= 0) { m.left = G0DP.mazeTimer; g0dpHurt(p, 1, 'the clock ran out. -1 INT.'); }
  const r = m.nodes.find(n => n.right);
  const spot = n => ({ x: n.x + 6, y: n.y });   // the node's top right corner, off the glyph (round 3)
  g0dpBoyTick(p, now, dt, { right: r ? spot(r) : null, others: m.nodes.filter(n => !n.right).map(spot) });
  const w = G0DP_CLUE_AT[Math.min(m.path, G0DP_CLUE_AT.length - 1)], c2 = p.boy.curs[2];   // the third cursor: the word we're after
  c2.tx = c2.x = 1 + w[1] + w[2]; c2.ty = c2.y = L.gh - 3 + w[0];   // (on the . right after the word)
}
function g0dpMazeTap(p, x, y) {
  const now = performance.now(), m = p.maze, i = m.nodes.findIndex(n => now >= n.showAt && x >= n.x && x < n.x + 7 && y >= n.y && y < n.y + 5);
  if (i < 0) return;
  const n = m.nodes[i], letter = String.fromCharCode(65 + i);
  g0dpHeal(1);   // every node is a perfect
  Sound.safe(); flash(C.accent, 0.08, 0.2);
  if (m.lost >= G0DP.mazeLost) {   // too deep: back to the start
    g0dpHurt(p, 1, 'dead end. back to the start. -1 INT.');
    if (p.card) return;
    Object.assign(m, { depth: 1, path: 0, lost: 0, label: '1A' });
    flash(C.danger, 0.35, 0.8); shake(10, 0.5);
    boySay('...we are back at the start.');
    return g0dpMazeLayer(p, true);
  }
  if (n.right) {
    m.path++;
    if (m.path >= m.seq.length) {   // out
      Sound.bossWin();
      g0dSay('so. you can read.');
      return g0dpCard(p, ['OUT OF THE MAZE', '', 'the eye is right above you.', '', 'tap: G0D FIGHT'], () => g0dpStart('fight'), G0DP_BLUE);
    }
    if (m.path === m.seq.length - 1) boySay('one more. the watcher.');
  } else {
    m.lost++;
    boySay(G0DP_LINES.boyLost[Math.min(m.lost - 1, G0DP_LINES.boyLost.length - 1)]);
  }
  m.depth++; m.label = `${m.depth}${letter}`;
  g0dpMazeLayer(p);
}
function g0dpMazeDraw(p, put, bg, now) {
  const m = p.maze, Y = BOARD_Y;
  put(0, Y, `G0D MAZE   layer ${m.label}`, C.text);
  const f = Math.max(0, m.left / G0DP.mazeTimer), bw = 10, n = Math.round(f * bw);
  put(L.wc - bw - 4, Y, '#'.repeat(n) + '.'.repeat(bw - n), f < 0.35 ? C.danger : C.accent);
  put(L.wc - 3, Y, Math.ceil(m.left) + 's', C.mid);
  if (m.reset && now - m.reset < 900) { const t = 'BACK TO THE START'; put(Math.floor((L.wc - t.length) / 2), Y + Math.floor(L.gh / 2), t, C.danger, 'fx', true); }
  for (const n2 of m.nodes) {
    if (now < n2.showAt) continue;
    const fc = C.mid, gc = C.text;
    put(n2.x, Y + n2.y, '+- - -+', fc);
    n2.glyph.forEach((l, k) => { put(n2.x, Y + n2.y + 1 + k, ':', fc); put(n2.x + 1, Y + n2.y + 1 + k, l, gc); put(n2.x + 6, Y + n2.y + 1 + k, ':', fc); });
    put(n2.x, Y + n2.y + 4, '+- - -+', fc);
  }
  if (G0DP.boy) {
    G0DP_CLUE.forEach((l, k) => put(1, Y + L.gh - 3 + k, l, G0DP_BLUE));
    const w = G0DP_CLUE_AT[Math.min(m.path, G0DP_CLUE_AT.length - 1)];   // the word we're after now: lit
    bg(1 + w[1], Y + L.gh - 3 + w[0], w[2], G0DP_BLUE, 0.35);
    put(1 + w[1], Y + L.gh - 3 + w[0], G0DP_CLUE[w[0]].slice(w[1], w[1] + w[2]), C.bright, 'fx', true);
  }
  // the edges of the maze: a little mold
  const { hs, moldCh } = G0D_LOOKS, t = Math.floor(now / 160);
  for (let x = 0; x < L.wc; x++) for (const y of [1]) if (hs(x * 3.3 + y) > 0.55) { const [c, k] = moldCh(x, y, t); if (c !== ' ') put(x, Y + y, c, g0dCol(k)); }
}

// ---------------- G0D FIGHT ----------------
// The board is G0D's network under the M0LD. Corp nodes drift under it and spew mold as they go (fresh mold is
// brighter: that's how you track them). Tap mold to scrape it (a few taps where it's thick); scraping over a node pins it
// for a moment. Dig out the eye node (it looks like THE WATCHER) and tap it: G0D's eye opens, blue, for a few seconds:
// tap it to hurt G0D. A corp node tapped is the wrong one: -1 INT. The mold creeps up toward your INT and credits (the
// top right): sit there too long and it steals them, into [#] and [$] nodes in the network (tap them to get it back).
// HANDS OFF: eyes appear, everything fades red (the charge: no damage; tap the eye node to counter it, and one of the
// eyes opens blue), then the burn: every tap costs 1 INT. Hurt G0D and the mold grows back in.
function g0dpFightStart(p) {
  const W = L.wc, H = L.gh;
  const f = p.fight = { W, H, m: new Float32Array(W * H), fresh: new Float32Array(W * H), nodes: [], hp: G0DP.hp, eye: null,
    hands: null, nextHands: performance.now() + G0DP.handsEvery * 1000, steal: 0, steals: 0, nextLine: performance.now() + 6000, hitAt: 0, creepAt: 0 };
  for (let i = 0; i < f.m.length; i++) f.m[i] = 0.9 + Math.random() * 1.4;   // the mold has already filled in (thinner on the top right: it creeps up there)
  for (let y = 0; y < 4; y++) for (let x = W - 14; x < W; x++) f.m[y * W + x] *= 0.4;
  const corps = shuffle(Object.keys(CORPS), Math.random);
  for (let i = 0; i < G0DP.decoys; i++) f.nodes.push(g0dpNode(f, 'corp', corpCode(corpDef(corps[i]))));
  f.nodes.push(g0dpNode(f, 'eye', '(o)'));
  boySay(G0DP_LINES.boyFight[0]);
  setTimeout(() => { if (st.g0dp === p) g0dSay(G0DP_LINES.g0d[0]); }, 2200);
}
function g0dpNode(f, kind, label, at) {
  const sp = kind === 'corp' || kind === 'eye' ? 1 : 0;
  const a = Math.random() * Math.PI * 2, v = (2 + Math.random() * 2) * sp;
  return { kind, label, x: at ? at.x : 3 + Math.random() * (f.W - 9), y: at ? at.y : 3 + Math.random() * (f.H - 6), vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.45, pin: 0, turnAt: 0, amount: 0 };
}
const g0dpIdx = (f, x, y) => (x < 0 || y < 0 || x >= f.W || y >= f.H) ? -1 : y * f.W + x;
// Mold in a feathered blob around (cx, cy): r is the radius in rows (twice that across: cells are tall)
function g0dpMold(f, cx, cy, r, amt, fresh) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r * 2.2); x <= Math.ceil(cx + r * 2.2); x++) {
    const i = g0dpIdx(f, x, y); if (i < 0) continue;
    const d = Math.hypot((x - cx) / 2.2, y - cy) / r; if (d >= 1) continue;
    const k = 1 - d * d;
    f.m[i] = clamp(f.m[i] + amt * k, 0, 5);
    if (fresh && amt > 0) f.fresh[i] = Math.max(f.fresh[i], k);
  }
}
// Is a node showing (the mold over its label thin)?
function g0dpShows(f, n) {
  for (let k = 0; k < 3; k++) { const i = g0dpIdx(f, Math.round(n.x) + k, Math.round(n.y)); if (i >= 0 && f.m[i] >= 0.6) return false; }
  return true;   // all of it dug out (round 1: a half-dug node doesn't count; a tap on one scrapes)
}
function g0dpFightTick(p, now, dt) {
  const f = p.fight;
  // the nodes drift and spew
  for (const n of f.nodes) {
    const pinned = now < n.pin;
    if (n.vx || n.vy) {
      if (now > n.turnAt) { const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 2; n.vx = Math.cos(a) * v; n.vy = Math.sin(a) * v * 0.45; n.turnAt = now + 1800 + Math.random() * 2500; }
      const s = pinned ? 0.15 : 1;
      n.x += n.vx * dt * s; n.y += n.vy * dt * s;
      if (n.x < 2 || n.x > f.W - 5) { n.vx *= -1; n.x = clamp(n.x, 2, f.W - 5); }
      if (n.y < 2 || n.y > f.H - 2) { n.vy *= -1; n.y = clamp(n.y, 2, f.H - 2); }
    }
    if (!pinned && !(f.eye && n.kind === 'eye')) g0dpMold(f, n.x + 1, n.y, n.kind === 'corp' || n.kind === 'eye' ? 2 : 2.4, G0DP.spew * dt, true);
  }
  // it creeps on its own, toward the top right (your INT and credits) more than anywhere
  if (now > f.creepAt) {
    f.creepAt = now + 100;
    for (let k = 0; k < 30; k++) {
      const x = Math.floor(Math.random() * f.W), y = Math.floor(Math.random() * f.H), i = g0dpIdx(f, x, y);
      const nb = [g0dpIdx(f, x - 1, y), g0dpIdx(f, x + 1, y), g0dpIdx(f, x, y + 1), g0dpIdx(f, x, y - 1)].filter(j => j >= 0 && f.m[j] > 1);
      const pull = 1 + (x > f.W * 0.6 ? 1 : 0) + (y < f.H * 0.35 ? 1 : 0);
      const cap = pull >= 3 ? 4.2 : 2.8;   // creep alone doesn't build thick mold (the nodes do), except where it reaches for you
      if (nb.length && f.m[i] < cap) f.m[i] = Math.min(cap, f.m[i] + G0DP.creep * pull * 0.5);
    }
  }
  for (let i = 0; i < f.fresh.length; i++) if (f.fresh[i] > 0) f.fresh[i] = Math.max(0, f.fresh[i] - dt * 0.45);
  // the eye
  if (f.eye && now > f.eye.until) g0dpEyeClose(p, now, 'it closes.');
  if (f.eye) g0dpMold(f, f.eye.x, f.eye.y, 3, -8 * dt, false);   // the open eye keeps itself clear
  // HANDS OFF
  if (!f.hands && !f.eye && now > f.nextHands) {
    f.hands = { at: now, eyes: [] };
    g0dSay('hands off.');
    if (G0DP.boy) setTimeout(() => { if (st.g0dp === p) boySay(G0DP_LINES.boyHands); }, 900);
    Sound.alarm();
  }
  if (f.hands) {
    const h = f.hands, e = (now - h.at) / 1000;
    while (e < G0DP.charge && h.eyes.length < 1 + Math.floor(e / (G0DP.charge / 4))) { h.eyes.push({ x: 4 + Math.random() * (f.W - 10), y: 3 + Math.random() * (f.H - 6) }); Sound.nodeOn(); }
    h.red = e < G0DP.charge ? 0.15 + 0.6 * e / G0DP.charge : 1;
    if (e >= G0DP.charge && !h.burning) { h.burning = true; Sound.bossDrop(); shake(8, 0.5); flash(G0DP_RED, 0.3, 0.6); }
    if (e >= G0DP.charge + G0DP.burn) { f.hands = null; f.nextHands = now + G0DP.handsEvery * 1000; }
  }
  // the steal: thick mold on the top right corner, long enough, takes your credits (first) and then INT
  let s = 0, c = 0;
  for (let y = 0; y < 3; y++) for (let x = f.W - 12; x < f.W; x++) { s += f.m[g0dpIdx(f, x, y)]; c++; }
  f.press = s / c / 5;
  if (f.press > 0.66) f.steal += dt; else f.steal = Math.max(0, f.steal - dt * 2);
  if (f.steal >= G0DP.stealEvery) {
    f.steal = 0; f.steals++;
    const run = st.run;
    if (f.steals <= 2 && run.credits > 0) {
      const cr = Math.min(run.credits, 15); run.credits -= cr;
      f.nodes.push(Object.assign(g0dpNode(f, 'cr', '[$]'), { amount: cr }));
      setMsg(`> the M0LD took ${cr}cr. it's in there somewhere.`, C.money); Sound.trash();
    } else {
      f.nodes.push(Object.assign(g0dpNode(f, 'int', '[#]'), { amount: 1 }));
      g0dpHurt(p, 1, 'the M0LD took 1 INT. it wants more.');
    }
  }
  // G0D talks
  if (now > f.nextLine && !f.hands) {
    f.nextLine = now + 9000 + Math.random() * 6000;
    const low = f.hp / G0DP.hp < 0.4;
    if (G0DP.boy && Math.random() < 0.35) boySay(pickR(G0DP_LINES.boyFight, Math.random));
    else g0dSay(pickR(low && Math.random() < 0.7 ? G0DP_LINES.g0dLow : G0DP_LINES.g0d, Math.random));
  }
  // b0y: the eye node (or the open eye)
  const eyeN = f.nodes.find(n => n.kind === 'eye');
  const spot = n => ({ x: n.x + 1, y: n.y - 1 });
  g0dpBoyTick1(p, now, dt, { right: f.eye ? { x: f.eye.x, y: f.eye.y - 2 } : eyeN ? spot(eyeN) : null, others: f.nodes.filter(n => n.kind === 'corp').map(spot) });
}
function g0dpEyeOpen(p, x, y, now) {
  const f = p.fight;
  f.eye = { x: clamp(x, 6, f.W - 7), y: clamp(y, 3, f.H - 3), until: now + G0DP.eyeOpen * 1000, hits: 0, at: now };
  g0dpMold(f, f.eye.x, f.eye.y, 3.5, -10, false);
  Sound.bossBuild(); flash(G0DP_BLUE, 0.2, 0.4);
  setMsg('> the eye is open. hit it!', G0DP_BLUE);
}
function g0dpEyeClose(p, now, why) {
  const f = p.fight;
  f.eye = null;
  for (let i = 0; i < f.m.length; i++) f.m[i] = Math.max(f.m[i], Math.min(3.2, f.m[i] + 1.4 + Math.random()));   // the mold grows back in
  const eyeN = f.nodes.find(n => n.kind === 'eye');
  if (eyeN) { eyeN.x = 3 + Math.random() * (f.W - 9); eyeN.y = 3 + Math.random() * (f.H - 6); }   // its node goes somewhere else
  if (why) setMsg('> ' + why + ' the M0LD grows back.', C.mid);
}
function g0dpFightTap(p, x, y, now) {
  const f = p.fight, run = st.run;
  // the open eye
  if (f.eye && Math.abs(x - f.eye.x) <= 4 && Math.abs(y - f.eye.y) <= 1) {
    f.hp--; f.eye.hits++; f.hitAt = now;
    Sound.hkBoom(); shake(10, 0.45); flash(G0DP_BLUE, 0.3, 0.5);
    if (!reduced()) { const cells = []; for (let k = 0; k < 18; k++) cells.push({ ch: pickR(['@', 'o', '*', '%', '#'], Math.random), x: pxX(f.eye.x + rand(-3, 3)), y: pxY(BOARD_Y + f.eye.y), col: pickR([G0DP_BLUE, C.bright, G0D_COLS.mold], Math.random) }); explode(cells, pxX(f.eye.x), pxY(BOARD_Y + f.eye.y), { power: 0.9 }); }
    g0dSay(pickR(f.hp / G0DP.hp < 0.4 ? G0DP_LINES.g0dLow : G0DP_LINES.hit, Math.random));
    if (f.hp <= 0) {
      Sound.bossWin();
      return g0dpCard(p, ['G0D BREACHED', '', 'it\'s... no.', 'the M0LD is coming back.', '', 'G0D: "you are just meat."', '', 'tap: G0D FINAL STAND'], () => g0dpStart('stand'), G0DP_RED);
    }
    if (f.eye.hits >= G0DP.hitsPerEye) g0dpEyeClose(p, now, 'it shuts.');
    return;
  }
  // the burn: hands off
  if (f.hands && f.hands.burning) return g0dpHurt(p, 1, 'HANDS OFF. -1 INT.');
  // a node that shows
  const n = f.nodes.find(o => g0dpShows(f, o) && x >= Math.round(o.x) - 1 && x <= Math.round(o.x) + 3 && y === Math.round(o.y));
  if (n) {
    if (n.kind === 'eye') {
      if (f.hands) {   // the counter: the attack stops, and one of its eyes is the real one
        const e = pickR(f.hands.eyes, Math.random) || { x: n.x, y: n.y };
        f.hands = null; f.nextHands = now + G0DP.handsEvery * 1000;
        setMsg('> countered! one of them is real.', G0DP_BLUE);
        return g0dpEyeOpen(p, e.x, e.y, now);
      }
      return g0dpEyeOpen(p, f.W / 2, f.H / 2, now);
    }
    if (n.kind === 'corp') { n.pin = now + 1200; return g0dpHurt(p, 1, `wrong node: ${n.label}. -1 INT.`); }
    if (n.kind === 'int') { g0dpHeal(n.amount); Sound.buy(); setMsg(`> got it back: +${n.amount} INT.`, C.accent); }
    if (n.kind === 'cr') { run.credits += n.amount; Sound.buy(); setMsg(`> got it back: +${n.amount}cr.`, C.money); }
    f.nodes.splice(f.nodes.indexOf(n), 1);
    return;
  }
  // the mold (round 1: a bigger scrape; the charge doesn't lock it, only the burn hurts)
  g0dpMold(f, x, y, 2.3, -2.0, false);
  for (const o of f.nodes) if (Math.abs(o.x + 1 - x) < 4 && Math.abs(o.y - y) < 2) o.pin = now + 1200;   // scraped over a node: it holds still a moment
  Sound.tick();
  if (!reduced()) explode([{ ch: pickR(['%', ';', '.', ','], Math.random), x: pxX(x), y: pxY(BOARD_Y + y), col: G0D_COLS.mold }], pxX(x), pxY(BOARD_Y + y) + 4, { power: 0.3, grav: 1.2, life: [0.2, 0.4] });
}
// A tap on the mold over INT / CR: it scrapes the board's top right corner (where it climbs from), a wide swipe.
function g0dpScrapeHud(p, x, now) {
  const f = p.fight;
  if (f.hands && f.hands.burning) return g0dpHurt(p, 1, 'HANDS OFF. -1 INT.');
  g0dpMold(f, x, 0, 1.8, -2.4, false); g0dpMold(f, x, 2, 1.4, -1.6, false);
  f.steal = Math.max(0, f.steal - 0.6);
  Sound.tick();
  if (!reduced()) explode([{ ch: pickR(['%', ';', '&'], Math.random), x: pxX(x), y: pxY(3), col: G0D_COLS.mold }], pxX(x), pxY(3) + 4, { power: 0.4, grav: 1.2, life: [0.2, 0.4] });
}
const G0DP_MOLD_CH = ' .:;%&#';
const G0DP_SEE = 1.6;   // mold under this thickness (a . or ,) lets a node's letters show through (the user, round 2)
function g0dpFightDraw(p, put, bg, now) {
  const f = p.fight, Y = BOARD_Y, { hs } = G0D_LOOKS, t = Math.floor(now / 140);
  const red = f.hands ? f.hands.red : 0, clear = (x, y) => { const i = g0dpIdx(f, x, y); return i < 0 || f.m[i] < 0.6; };
  const taken = new Set(), take = (x, y, w) => { for (let k = 0; k < w; k++) taken.add((x + k) + ',' + y); };
  // on top of the mold: HANDS OFF's eyes, the open eye, the status line
  if (f.hands) for (const e of f.hands.eyes) { const x = Math.round(e.x), y = Math.round(e.y); take(x - 1, y, 5); put(x - 1, Y + y, f.hands.burning ? '(@@)' : ' (@) ', G0DP_RED, 'fx', true); }
  if (f.eye) {
    const x = Math.round(f.eye.x), y = Math.round(f.eye.y), left = (f.eye.until - now) / 1000;
    const pupil = now - f.hitAt < 250 ? 'X' : Math.floor(now / 400) % 4 === 3 ? 'o' : '@';
    const art = ['  .---.  ', ` ( (${pupil}) ) `, "  '---'  ", `  ${Math.ceil(left)}s ${'*'.repeat(Math.max(0, G0DP.hitsPerEye - f.eye.hits))}`.padEnd(9)];
    art.forEach((l, k) => { take(x - 4, y - 1 + k, 9); put(x - 4, Y + y - 1 + k, l, G0DP_BLUE, 'fx', k < 3); });
    bg(x - 4, Y + y - 1, 9, G0DP_BLUE, 0.12 + 0.08 * Math.sin(now / 90));
  }
  take(0, 0, L.wc);
  if (g0dpBoyLineOn(p, now)) take(0, f.H - 1, L.wc);
  const underThin = new Set();   // node letters under thin mold
  // the network under it, where the mold is thin: faint dots, then the nodes (a letter at a time as you dig)
  for (let y = 2; y < f.H; y += 2) for (let x = (y / 2) % 2 ? 1 : 3; x < f.W; x += 4) if (clear(x, y) && !taken.has(x + ',' + y)) put(x, Y + y, '·', C.dim);
  for (const n of f.nodes) {
    const x = Math.round(n.x), y = Math.round(n.y);
    const lab = n.kind === 'eye' ? (f.hands ? '(@)' : Math.floor(now / 700) % 3 === 2 ? '(.)' : '(o)') : n.label;
    const col = n.kind === 'eye' ? (f.hands ? G0DP_RED : G0DP_BLUE) : n.kind === 'int' ? C.accent : n.kind === 'cr' ? C.money : C.text;   // the eye node: blue (round 1)
    if (g0dpShows(f, n)) { const fc = col === C.text ? C.mid : col; if (!taken.has((x - 1) + ',' + y)) { put(x - 1, Y + y, '[', fc, 'fx'); take(x - 1, y, 1); } if (!taken.has((x + 3) + ',' + y)) { put(x + 3, Y + y, ']', fc, 'fx'); take(x + 3, y, 1); } }   // dug out: framed, now it counts
    for (let k = 0; k < lab.length; k++) {   // under thin mold (a . or ,) the letter shows through, dimmed; thick mold hides it
      const i = g0dpIdx(f, x + k, y), th = i < 0 ? 0 : f.m[i];
      if (th >= G0DP_SEE || taken.has((x + k) + ',' + y)) continue;
      const thin = th >= 0.6;
      if (thin) underThin.add((x + k) + ',' + y);
      if (n.kind === 'corp') bg(x + k, Y + y, 1, C.dim, thin ? 0.4 : 0.8);
      put(x + k, Y + y, lab[k], thin ? (n.kind === 'corp' ? C.mid : col) : col, 'fx', !thin && n.kind !== 'corp');
    }
  }
  // the M0LD
  for (let y = 0; y < f.H; y++) for (let x = 0; x < f.W; x++) {
    const i = y * f.W + x, th = f.m[i];
    if (th < 0.6 || taken.has(x + ',' + y)) continue;
    if (underThin.has(x + ',' + y)) { put(x, Y + y, th < 1.1 ? '.' : ',', G0D_COLS.mold, 'fx', true); continue; }   // thin mold over a node: a speck over its letter
    const ch = G0DP_MOLD_CH[Math.min(6, Math.floor(th) + 1 + (hs(x * 7.1 + y * 3.3 + Math.floor(t / 6 + hs(x + y * 9) * 6)) > 0.85 ? 1 : 0))] || '#';
    let col = th > 2.5 ? G0D_COLS.mold : G0D_COLS.moldDim;
    if (f.fresh[i] > 0.45) col = G0DP_FRESH;
    if (red && hs(x * 3.7 + y * 11.3) < red) col = th > 2.5 ? G0DP_RED : C.dangerDim;
    put(x, Y + y, ch, col);
  }
  // the status line
  const status = f.eye ? 'THE EYE IS OPEN' : f.hands ? (f.hands.burning ? '!! HANDS OFF !!' : 'it is charging...') : 'dig. find the eye.';
  put(0, Y, status, f.eye ? G0DP_BLUE : f.hands ? G0DP_RED : C.mid, 'fx', !!(f.eye || f.hands));
  if (f.press > 0.4) put(L.wc - 11, Y, f.press > 0.66 ? 'IT STEALS^' : 'creeping ^', f.press > 0.66 ? C.danger : C.mid, 'fx');
}

// ---------------- G0D FINAL STAND ----------------
// All his eyes, in order. Each cycles red, then blue: tap it while it's blue. Red taps cost 2s. A clock: he's getting
// away. Not all his eyes in time = it starts over.
function g0dpStandStart(p) {
  const W = L.wc, H = L.gh, n = G0DP.standEyes, eyes = [];
  for (let i = 0; i < n; i++) {   // a loose ring
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.3, rx = W / 2 - 7, ry = H / 2 - 4;
    eyes.push({ x: Math.round(W / 2 + Math.cos(a) * rx * (0.6 + Math.random() * 0.4)), y: Math.round(H / 2 + Math.sin(a) * ry * (0.6 + Math.random() * 0.4)), alive: true });
  }
  p.stand = { eyes: shuffle(eyes, Math.random), cur: 0, cycleAt: performance.now() + 900, left: G0DP.standTime };
  boySay(G0DP_LINES.boyStand);
}
const g0dpStandRed = s => G0DP.red * Math.pow(0.9, s.cur);
function g0dpStandBlue(s, now) { const e = (now - s.cycleAt) / 1000, red = g0dpStandRed(s); return e >= 0 && (e % (red + G0DP.blue)) >= red; }
function g0dpStandTick(p, now, dt) {
  const s = p.stand;
  s.left -= dt;
  if (s.left <= 0 && !p.card) { st.run.integrity = 0; return g0dpHurt(p, 0, 'he got away.'); }
  const cur = s.eyes[s.cur], spot = e => ({ x: e.x, y: e.y - 2 });
  g0dpBoyTick(p, now, dt, { right: cur ? spot(cur) : null, others: s.eyes.filter((e, i) => e.alive && i !== s.cur).map(spot) });
}
function g0dpStandTap(p, x, y, now) {
  const s = p.stand, i = s.eyes.findIndex(e => e.alive && Math.abs(x - e.x) <= 3 && Math.abs(y - e.y) <= 1);
  if (i < 0) return;
  if (i !== s.cur) { Sound.deny(); return setMsg('> not that one. in order.', C.mid); }
  if (!g0dpStandBlue(s, now)) { s.left -= 2; Sound.deny(); flash(G0DP_RED, 0.15, 0.3); return setMsg('> red! not yet. -2s', G0DP_RED); }
  const e = s.eyes[i];
  e.alive = false; s.cur++; s.cycleAt = now + 250;
  Sound.shatter(); shake(6, 0.3);
  if (!reduced()) { const cells = []; for (let k = 0; k < 14; k++) cells.push({ ch: pickR(['@', '(', ')', '*', '.'], Math.random), x: pxX(e.x + rand(-2, 2)), y: pxY(BOARD_Y + e.y), col: pickR([G0DP_BLUE, C.bright], Math.random) }); explode(cells, pxX(e.x), pxY(BOARD_Y + e.y), { power: 0.8 }); }
  if (s.cur >= s.eyes.length) {
    Sound.victory ? Sound.victory() : Sound.bossWin();
    g0dSay('there will be others.');
    return g0dpCard(p, ['G0D IS DOWN', '', 'there will be others.', '', '(the end: the prototype)', '', 'tap: back to the maze'], () => g0dpStart('maze'), G0DP_BLUE);
  }
  if (s.cur === s.eyes.length - 1) boySay('last one!');
}
function g0dpStandDraw(p, put, bg, now) {
  const s = p.stand, Y = BOARD_Y, { hs, moldCh } = G0D_LOOKS, t = Math.floor(now / 120);
  // sparse mold drifting through
  const lastRow = g0dpBoyLineOn(p, now) ? L.gh - 1 : L.gh;
  for (let y = 1; y < lastRow; y++) for (let x = 0; x < L.wc; x++) {
    const v = hs(Math.floor(x / 3 + now / 900) * 1.7 + Math.floor(y / 2 - now / 1300) * 5.3);
    if (v > 0.86 && !s.eyes.some(e => e.alive && Math.abs(x - e.x) <= 2 && Math.abs(y - e.y) <= 1)) { const [c, k] = moldCh(x, y, t); if (c !== ' ') put(x, Y + y, c, g0dCol(k)); }
  }
  s.eyes.forEach((e, i) => {
    if (!e.alive) return;
    const on = i === s.cur, blue = on && g0dpStandBlue(s, now), col = blue ? G0DP_BLUE : on ? G0DP_RED : C.dangerDim;
    const pupil = on ? '@' : 'o';
    const art = [' .-. ', `( ${pupil} )`, " '-' "];
    art.forEach((l, k) => { bg(e.x - 2, Y + e.y - 1 + k, 5, blue ? G0DP_BLUE : C.bg, blue ? 0.35 : 1); put(e.x - 2, Y + e.y - 1 + k, l, col, 'fx', on); });
  });
  bg(0, Y, L.wc, C.bg, 1);
  put(0, Y, `FINAL STAND   eyes ${s.eyes.length - s.cur}`, C.text, 'fx');
  const urgent = s.left < 8 && Math.floor(now / 250) % 2;
  put(L.wc - 6, Y, `${Math.max(0, s.left).toFixed(1)}s`, urgent ? C.bright : C.danger, 'fx', true);
}

// ---------------- The loop, the board, taps (engine/render.js, engine/scene.js, engine/input.js) ----------------
function g0dpTick(now, dt) {
  const p = st.g0dp;
  if (!p || st.mode !== 'g0dp' || st.pause || st.dev || st.wipe || p.card) return;
  if (p.stage === 'maze') g0dpMazeTick(p, now, dt);
  if (p.stage === 'fight') g0dpFightTick(p, now, dt);
  if (p.stage === 'stand') g0dpStandTick(p, now, dt);
}
function buildG0dp(ctx) {
  const p = st.g0dp, { put, bg, now } = ctx;
  if (!p) return;
  if (p.card) {   // a card between stages
    const c = p.card, y0 = BOARD_Y + Math.floor((L.gh - c.lines.length) / 2);
    c.lines.forEach((l, k) => put(Math.floor((L.wc - l.length) / 2), y0 + k, l, k === 0 ? c.col : l.startsWith('tap') ? (Math.floor(now / 500) % 2 ? C.bright : C.mid) : C.text, 'ui', k === 0));
    return;
  }
  if (p.stage === 'maze') g0dpMazeDraw(p, put, bg, now);
  if (p.stage === 'fight') g0dpFightDraw(p, put, bg, now);
  if (p.stage === 'stand') g0dpStandDraw(p, put, bg, now);
  g0dpBoyDraw(p, put, bg, now);
  g0dpBoyLineDraw(p, put, bg, now);
}
// A tap at (cx, cy) in cells (the whole screen). Returns true when the prototype took it.
function g0dpTap(cx, cy) {
  const p = st.g0dp;
  if (!p || st.mode !== 'g0dp') return false;
  const x = Math.floor(cx), y = Math.floor(cy) - BOARD_Y, now = performance.now();
  // the fight: the mold climbing onto INT / CR (the header's right side, down to the board) can be scraped right there
  if (p.stage === 'fight' && !p.card && y < 0 && y >= 2 - BOARD_Y && x >= L.wc - 14) { g0dpScrapeHud(p, x, now); return true; }
  if (y < 0 || y >= L.gh) return false;
  if (p.card) { if (now - p.card.at > 500) { const go = p.card.next; p.card = null; go(); } return true; }
  if (p.stage === 'maze') g0dpMazeTap(p, x, y);
  if (p.stage === 'fight') g0dpFightTap(p, x, y, now);
  if (p.stage === 'stand') g0dpStandTap(p, x, y, now);
  return true;
}
// Over the finished screen: G0D's bar in the header (the fight, the final stand), the mold reaching for your INT.
function g0dpOverlay(cells, now) {
  const p = st.g0dp;
  if (!p || p.card) return cells;
  let out = cells;
  if (p.stage === 'fight') {
    const f = p.fight;
    out = g0dHeader(out, { f: f.hp / G0DP.hp, was: (f.hp + 1) / G0DP.hp, hit: now - f.hitAt < 260 }, G0D_HP.thin);
    if (f.press > 0.4) {   // the mold climbs up to the readouts
      const { hs } = G0D_LOOKS, reach = Math.min(1, (f.press - 0.4) / 0.3);
      out = out.map(c => (c.cy === 2 || c.cy === 3 || c.cy === 4) && c.cx >= L.wc - 12 && hs(c.cx * 5.3 + c.cy * 7.7 + Math.floor(now / 300)) < reach * (c.cy === 4 ? 1 : 0.5)
        ? Object.assign({}, c, { ch: '%;:&'[(c.cx + c.cy) & 3], col: G0D_COLS.mold }) : c);
    }
  }
  if (p.stage === 'stand') { const s = p.stand; out = g0dHeader(out, { f: (s.eyes.length - s.cur) / s.eyes.length }, G0D_HP.thin); }
  return out;
}
