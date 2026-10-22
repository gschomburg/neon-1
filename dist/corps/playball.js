// NeoN+1 corps/playball.js
'use strict';
NEON_FILES.push(['corps/playball.js', 'v12.15']);
// Its boss mod: OVERTIME (overtime), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// PLAYBALL: ball physics in screen cells. The paddles sit on row 7 and just under the board.
function pbServe(lv, b, now) {
  const yB = BOARD_Y + L.gh;
  Object.assign(b, { x: lv.pad, y: yB - 0.6, vx: (Math.random() < 0.5 ? -1 : 1) * rand(6, 10), vy: -7, out: false, at: now });
}
function pbStep(lv, b, h, now) {
  const left = L.gx - 0.5, right = L.gx + L.gw - 0.5, yT = BOARD_Y - 1, yB = BOARD_Y + L.gh;
  const px = b.x, py = b.y;
  b.x += b.vx * h; b.y += b.vy * h;
  if (b.x < left) { b.x = 2 * left - b.x; b.vx = Math.abs(b.vx); }
  if (b.x > right) { b.x = 2 * right - b.x; b.vx = -Math.abs(b.vx); }
  // the paddles (both move together)
  for (const [row, dir] of [[yT, 1], [yB, -1]]) {
    const crossing = dir > 0 ? b.y <= row + 0.5 && py > row + 0.5 : b.y >= row - 0.5 && py < row - 0.5;
    if (!crossing) continue;
    if (Math.abs(b.x - lv.pad) <= 4.6) {
      b.y = row + 0.5 * dir; b.vy = Math.abs(b.vy) * dir;
      b.vx = clamp(b.vx + (b.x - lv.pad) * 1.3, -15, 15);
      Sound.tick();
    }
  }
  if (b.y < yT - 0.6 || b.y > yB + 0.6) { b.out = true; return 'out'; }
  // nodes: bounce off closed ones and bump them
  for (const t of lv.tiles) {
    if (t.state !== 'closed') continue;
    const { tx, ty } = tileOrigin(t), w = t.wide ? TILE_W * 2 + GAP_X : TILE_W;
    if (b.x < tx - 0.5 || b.x > tx + w - 0.5 || b.y < ty - 0.5 || b.y > ty + TILE_H - 0.5) continue;
    const wasIn = px >= tx - 0.5 && px <= tx + w - 0.5;
    if (wasIn) b.vy = -b.vy; else b.vx = -b.vx;
    b.x = px; b.y = py;
    if (t.safe) { t.ringAt = now; Sound.ping(1760); }
    else {
      t.bumps = (t.bumps || 0) + 1; t.bumpAt = now;
      if (t.bumps >= 2) lockTile(t, C.mid, 'crack'); else Sound.tick();
    }
    return 'bump';
  }
  return null;
}

// ---- its music
SONGS.seventhinning = { name: 'SEVENTH INNING', bpm: 132, root: 50, scale: 'major', prog: [0, 3, 4, 3], bass: 'eighths', drums: 'four',  arp: 'updown', pingpong: true };
MUSIC_FOR.playball = 'seventhinning';

// ---- the corp
CORPS.playball = {
  key: 'playball', name: 'PLAYBALL', code: 'PL', level: 5, drag: true,
  intel: '"it\'s not whether you win. it is."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: overtime. two balls.',
  rules: () => 'keep the ball in. it rings on real.',
  mods: ['overtime'],
  // Pong over the grid. A ball bounces around; the paddles (top and bottom, they move
  // together) follow your pointer or finger; a tap still picks a node (and pulls the
  // paddles to it). The ball bumps nodes: ICE cracks after 2 bumps and locks; the real node
  // rings (a chime and a flash). A ball out costs 20% pay (boss: -1 integrity).
  // Boss: two balls.
  dress(lv, k) { lv.pb = { boss: k.boss, balls: [] }; },
  async intro(lv, c) {
    lv.pad = L.gx + L.gw / 2 - 0.5; lv.padTo = lv.pad;
    const now = performance.now();
    for (let j = 0; j < (lv.pb.boss ? 2 : 1); j++) { const b = {}; pbServe(lv, b, now); if (j) b.vx = -b.vx; lv.pb.balls.push(b); }
    setMsg(`> Q${c.idx + 1}. play ball!`, C.accent);
  },
  onPick(t) { const lv = st.lv; if (lv.pb) { lv.padTo = L.gx + t.col * (TILE_W + GAP_X) + 3; lv.padSetAt = performance.now(); } },   // a tap pulls the paddles over
  tick(lv, lt, dt, now) {
    const pb = lv.pb;
    if (!pb || !pb.balls.length) return;
    // paddles: follow the pointer, or the keyboard cursor
    if (st.kbGrid && st.hover >= 0 && lv.tiles[st.hover]) lv.padTo = L.gx + lv.tiles[st.hover].col * (TILE_W + GAP_X) + 3;
    else if (st.ptr && (st.ptrAt || 0) > (lv.padSetAt || 0)) lv.padTo = (st.ptr.x - L.ox) / L.cw - 0.5;
    lv.padTo = clamp(lv.padTo, L.gx + 4, L.gx + L.gw - 5);
    const sp = 48 * dt / 1000;
    lv.pad += clamp(lv.padTo - lv.pad, -sp, sp);
    for (const b of pb.balls) {
      if (b.out) { if (now >= b.at) pbServe(lv, b, now); continue; }
      const steps = 4;
      for (let j = 0; j < steps; j++) {
        const res = pbStep(lv, b, dt / 1000 / steps, now);
        if (res === 'out') {
          b.at = now + 900;
          Sound.deny(); shake(3);
          if (pb.boss) {
            if (!st.god) hurt(1);
            setMsg('> ball out! -1 int.', C.danger);
            if (st.run.integrity <= 0) { st.busy = true; die(); return; }
          } else { lv.payCut = Math.min(0.9, (lv.payCut || 0) + 0.2); setMsg(`> ball out. pay -${Math.round(lv.payCut * 100)}%`, C.danger); }
          break;
        }
        if (res === 'bump') break;
      }
    }
  },
  fx(t, ft) {
    if (t.ringAt && ft - t.ringAt < 380) return { bright: true, fc: C.money, gc: C.money };
    if (t.bumps === 1) return { corner: '/', cornerCol: C.danger };
    return null;
  },
  draw(put, lv, now) {
    if (!lv.pb || lv.pad == null) return;
    const paddle = '=========', x = lv.pad - 4;
    put(x, BOARD_Y - 1, paddle, C.bright, 'fx', true);
    put(x, BOARD_Y + L.gh, paddle, C.bright, 'fx', true);
    for (const b of lv.pb.balls) if (!b.out) put(b.x, b.y, 'o', C.money, 'fx', true);
  },
  hint: () => ({ text: '' }),   // row 7 is the top paddle
};

// the codex, once you've beaten it
CORP_TELL.playball = "pong over the grid. the ball bumps nodes: ICE cracks after 2 bumps, the real node rings (a chime and a flash). keep the ball in.";

// intro art
CORP_ART.playball = [
  "   =========",
  "  |    o     |",
  "  |  [] []   |",
  "  |  [] []   |",
  "   =========",
  "",
  "  P L A Y B A L L",
];
