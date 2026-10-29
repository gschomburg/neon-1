// NeoN+1 engine/fishing.js: the PIER (the user's design, 2026-10-28; mockups: the "NeoN+1 Fishing" page, idea D).
// The board area is a data stream: lanes of traffic sliding left. Hold on it and the hook sinks from the top toward
// your finger (only up and down: it drifts left and right by itself). Shapes drift by; one in the hook's lane noses it,
// and sometimes bites: it turns red, and a tap on the stream starts the reel. The reel: keep it inside a moving window
// (hold to pull, let go to slack) until the catch bar fills. What bites is a mystery until it's in: PHISH (stolen data:
// passwords, logins, blackmail; v13.71), gear, or a SHOE. A cast costs credits every time the hook goes in (ECON.fish).
'use strict';
NEON_FILES.push(['engine/fishing.js', 'v13.75']);

const FISH_LANES = 7;
const FISH_KEYS = Object.keys(ITEMS).filter(k => ITEMS[k].fish && !ITEMS[k].bag);   // the catches (not the PHISH you keep)
// What KEEP puts in your gear: a catch becomes the PHISH of its rarity (so they stack); gear and shoes stay themselves
const fishKeepKey = out => out.kind === 'fish' && ITEMS['phish_' + out.rarity] ? 'phish_' + out.rarity : out.key;
const FISH_RARITY = ['scrap', 'common', 'rare', 'epic', 'legendary'];
// Shapes: most are little <>< ones. A few are bigger, and only FISH_BIG_MAX big ones swim at once (the user, v13.70).
// The big ones lean rare: every epic or legendary fish is big (a hint, not a promise: some big ones are junk).
// They swim left: the head is the left end. Everything in a lane moves at that lane's speed (some lanes run faster).
const FISH_LOOKS = { small: ['<><', '<><', "<'><"], mid: ["<')><", "<'))><"], big: ["<')))><", "<'))))><"] };
const FISH_BIG_MAX = 3;
// Lanes run both ways (random each visit). A fish going right is drawn mirrored (<')>< becomes ><('>), head first.
const fishMirror = t => [...t].reverse().map(c => ({ '<': '>', '>': '<', '(': ')', ')': '(' })[c] || c).join('');
const fishHead = s => s.dir > 0 ? s.x + s.look.length - 1 : s.x;   // the head's column (it noses the hook)
// The PIER's music: one of these at random each visit, level 3 while you reel (engine/boot.js)
const FISH_TRACKS = ['lowpressure', 'plusone', 'sealegs'];
const fishCost = () => costInt(ECON.fish.cast);
const fishWorth = key => earnInt(ECON.fish[ITEMS[key].rarity] != null ? ECON.fish[ITEMS[key].rarity] : ECON.fish.common);
// A catch's (made-up) size in KB: ITEMS[key].kb is its range (spread on a log scale; most land near the low end)
const fishKB = (key, r) => { const [a, b] = ITEMS[key].kb || [1, 100]; return a * Math.pow(b / a, Math.pow(r(), 1.6)); };
const fmtKB = kb => kb < 1 ? Math.max(1, Math.round(kb * 1024)) + ' B' : kb < 1024 ? (kb < 10 ? kb.toFixed(1) : Math.round(kb)) + ' KB'
  : kb < 1048576 ? (kb < 10240 ? (kb / 1024).toFixed(1) : Math.round(kb / 1024)) + ' MB' : (kb / 1048576).toFixed(1) + ' GB';
const fmtLb = v => v.toFixed(1) + ' lb';   // (a shoe still weighs something)
const pierOn = () => true;   // later: a feat unlocks the pier (so it isn't the first thing a new player meets)

// ---------------- Coming and going ----------------
function openPier(node) {
  const run = st.run;
  run.pierCasts = run.pierCasts || {};
  const r = rngFor(run.seed, 'pier', node.id);
  st.fish = {
    node, r, t: performance.now(), hook: null, hold: false, reel: null, card: null, shapes: [], spawnAt: 0,
    lanes: Array.from({ length: FISH_LANES }, () => 0.6 + r() * 1.1),   // some lanes run faster (random, not by depth)
    dirs: Array.from({ length: FISH_LANES }, () => Math.random() < 0.5 ? -1 : 1),   // and some run the other way (-1 left, 1 right)
    track: pickR(FISH_TRACKS.filter(k => SONGS[k]), Math.random) || null,
  };
  showBoard('fish');
  st.keyHandler = k => { if (k === 'r') { fishReelIn(); return true; } return false; };   // (Esc: the NEON menu, as everywhere in a run)
  setMsg(`> the pier. hold on the stream to cast (${fishCost()}cr).`, C.accent);
  markSeen('pier');
}
function leavePier() { if (st.transitioning) return; st.fish = null; swapTo(() => toMap()); }
const fishCasts = () => (st.run.pierCasts || {})[st.fish.node.id] || 0;

// ---------------- The stream's shape on screen ----------------
function fishGeo() {
  const rows = FISH_LANES * 2 + 1, top = BOARD_Y + Math.max(2, Math.floor((L.gh - rows - 4) / 2));
  return { top, rows, laneY: i => top + 1 + i * 2, surface: top - 1, bottom: top + rows };
}
const fishLaneAt = y => { const g = fishGeo(); return clamp(Math.round((y - g.top - 1) / 2), 0, FISH_LANES - 1); };

// ---------------- What bites: a fish, gear or a shoe ----------------
function fishOutcome(r) {
  const u = r();
  if (u < ECON.fish.shoe) return { kind: 'shoe', key: 'shoe', tier: 0, rarity: ITEMS.shoe ? ITEMS.shoe.rarity : 'common' };
  if (u < ECON.fish.shoe + ECON.fish.gear) {   // the loot pool, each rarity step damped
    const pool = Object.keys(ITEMS).filter(k => !ITEMS[k].corp && !ITEMS[k].fish && !ITEMS[k].crew && k !== 'shoe' && gearAllowed(k));
    const step = k => Math.max(0, RARITY_ORDER.indexOf(ITEMS[k].rarity) - RARITY_ORDER.indexOf('common'));
    const key = pickWeighted(pool, k => gearWeight(k) * Math.pow(ECON.fish.damp, step(k)), r);
    return { kind: 'gear', key, tier: 0, rarity: ITEMS[key].rarity };
  }
  const rar = pickWeighted(FISH_RARITY, x => ECON.fish.odds[FISH_RARITY.indexOf(x)] || 0, r);
  const key = pickR(FISH_KEYS.filter(k => ITEMS[k].rarity === rar), r) || pickR(FISH_KEYS, r);
  return { kind: 'fish', key, tier: 0, rarity: ITEMS[key].rarity };
}
// A shape's look: epic and legendary fish are big; the rest are mostly small (a few mid, a few big decoys).
// Only FISH_BIG_MAX big ones at once.
function fishLookFor(out, f) {
  const u = Math.random();
  let size = out.kind === 'fish' && (out.rarity === 'epic' || out.rarity === 'legendary') ? 'big' : u < 0.06 ? 'big' : u < 0.26 ? 'mid' : 'small';
  if (size === 'big' && f.shapes.filter(s => s.size === 'big' && !s.flee).length >= FISH_BIG_MAX) size = 'mid';
  return { size, look: pickR(FISH_LOOKS[size], Math.random) };
}

// ---------------- Input (engine/input.js) ----------------
// down / move / up on the stream. Returns true when it took the press.
function fishPointer(kind, e) {
  const f = st.fish;
  if (!f || st.mode !== 'fish' || st.transitioning) return false;
  const [px, py] = ptXY(e), y = (py - L.oy) / L.chh;
  if (kind === 'down') {
    const h = hitAt(px, py);
    if (h && h.kind === 'btn') return false;   // the buttons
    const g = fishGeo();
    if (y < g.top - 3 || y > g.bottom + 2) return false;   // only the stream (and the reel box above it): the tray etc. stay theirs
    if (f.card) return true;   // the LANDED card: its buttons only
    if (f.reel) { f.hold = true; return true; }   // the reel: hold to pull
    if (f.hook && f.hook.bite) { fishStartReel(); return true; }   // it bit: tap the stream
    if (!f.hook) {   // a new cast
      if (fishCasts() >= ECON.fish.casts) { Sound.deny(); setMsg("> nothing's biting here anymore. move on.", C.mid); return true; }
      const cost = fishCost();
      if (!canSpend(cost)) { Sound.deny(); setMsg(`> a cast is ${cost}cr.`, C.danger); return true; }
      st.run.credits -= cost;
      st.run.pierCasts[f.node.id] = fishCasts() + 1;
      tally('casts');   // THE RECORD (CAST AWAY)
      // the cast: the hook drops straight to the lane you tapped (then hold and drag to move it)
      f.hook = { x: L.wc * 0.42, y: fishGeo().surface, lane: fishLaneAt(y), bite: null, drop: true, row: null };
      Sound.fishCast();
      setMsg(`> cast. -${cost}cr.`, C.accent);
    }
    f.hold = true; f.hook.lane = fishLaneAt(y);
    return true;
  }
  if (kind === 'move' && f.hold && f.hook && !f.reel) { f.hook.lane = fishLaneAt(y); return true; }
  if (kind === 'up') { f.hold = false; return true; }
  return false;
}
function fishReelIn() {
  const f = st.fish;
  if (!f || !f.hook || f.reel || f.card) return Sound.deny();
  f.hook = null; Sound.fishReelIn();
  setMsg('> reeled in. nothing on it.', C.mid);
}
function fishStartReel() {
  const f = st.fish, s = f.hook.bite;
  s.hooked = true;
  // it starts where the fish was: the @ on the fish, the target centered on it (your eyes are already there)
  const w = { scrap: 0.34, common: 0.3, rare: 0.24, epic: 0.2, legendary: 0.16 }[s.out.rarity] || 0.28, bw = L.wc - 6;
  const mark = clamp((fishHead(s) - 4) / (bw - 3), 0, 1);
  f.reel = { s, catch: 0.35, win: clamp(mark - w / 2, 0, 1 - w), winV: 0, mark, w };
  f.hold = false;
  Sound.fishBite(); Sound.fishReelIn();
  setMsg('> HOOKED. hold to pull it in.', C.money);
}

// ---------------- Each frame ----------------
function fishTick(now) {
  const f = st.fish;
  if (!f) return;
  const dt = Math.min(0.05, (now - f.t) / 1000); f.t = now;
  const g = fishGeo();
  // shapes drift left; new ones come in from the right
  // (everything in a lane moves at the lane's speed, so nothing catches up; a new one waits for room)
  if (now > f.spawnAt) {
    f.spawnAt = now + 650 + f.r() * 1000;
    const lane = Math.floor(f.r() * FISH_LANES), out = fishOutcome(f.r), lk = fishLookFor(out, f), dir = f.dirs[lane];
    const look = dir > 0 ? fishMirror(lk.look) : lk.look, x0 = dir > 0 ? -look.length - 1 : L.wc + 1;
    const room = f.shapes.every(s => s.lane !== lane || (dir > 0 ? s.x > x0 + look.length + 4 : s.x + s.look.length + 4 < x0));
    if (room) f.shapes.push({ lane, x: x0, dir, out, look, size: lk.size, spd: 3 * f.lanes[lane], nosed: false });
  }
  for (const s of f.shapes) if (!s.hooked && !(f.hook && f.hook.bite === s)) s.x += s.dir * s.spd * dt * (s.flee ? 2.5 : 1);
  f.shapes = f.shapes.filter(s => s.hooked || (s.dir > 0 ? s.x < L.wc + 12 : s.x > -12));
  // the hook: drifts left and right; held, it sinks (or rises) to the lane under your finger
  const hk = f.hook;
  if (hk && !f.reel) {
    hk.x = L.wc * 0.42 + Math.sin(now / 1600) * 5;
    const ty = g.laneY(hk.lane);
    if (hk.drop) {   // the cast: falling fast to its lane, a plop (and ripples) when it lands
      hk.y += Math.min(Math.abs(ty - hk.y), 30 * dt) * Math.sign(ty - hk.y);
      if (Math.abs(ty - hk.y) < 0.05) { hk.y = ty; hk.drop = false; hk.row = Math.round(hk.y); Sound.fishPlop(); (f.ripples = f.ripples || []).push({ x: Math.round(hk.x), y: hk.row, t0: now }); }
    } else if (f.hold && Math.abs(ty - hk.y) > 0.05) {   // held: it follows your finger, a reel click each row
      hk.y += Math.sign(ty - hk.y) * Math.min(Math.abs(ty - hk.y), 9 * dt);
      const row = Math.round(hk.y);
      if (row !== hk.row) { Sound.fishClick(row < hk.row); hk.row = row; if (!hk.dragSaid && !hk.bite) { hk.dragSaid = true; setMsg('> drag up and down to move the hook.', C.accent); } }
    }
    const inLane = !hk.drop && Math.abs(hk.y - ty) < 0.3;
    if (hk.bite) {   // it bit: ~0.7s to tap, then it's off
      if (now - hk.bite.at > 700) { hk.bite.flee = true; hk.bite.at = null; hk.bite = null; Sound.deny(); setMsg('> it got away.', C.mid); }
    } else if (inLane) {
      for (const s of f.shapes) {
        if (s.lane !== hk.lane || s.nosed || s.flee) continue;
        if (Math.abs(fishHead(s) - hk.x) < 1) {
          s.nosed = true;
          if (f.r() < 0.5) { s.at = now; hk.bite = s; s.x += hk.x - fishHead(s); Sound.fishBite(); setMsg('> BITE! TAP THE STREAM!', C.danger); }
          else setMsg("> something's curious...", C.mid);
          break;
        }
      }
    }
  }
  // the reel: the window wanders; you hold to pull the fish right, let go and it slips left
  const rl = f.reel;
  if (rl) {
    const pace = { scrap: 0.25, common: 0.35, rare: 0.55, epic: 0.75, legendary: 1 }[rl.s.out.rarity] || 0.4;
    rl.winV += (f.r() - 0.5) * pace * 4 * dt; rl.winV = clamp(rl.winV, -pace, pace);
    rl.win += rl.winV * dt;
    if (rl.win < 0) { rl.win = 0; rl.winV = Math.abs(rl.winV); } if (rl.win > 1 - rl.w) { rl.win = 1 - rl.w; rl.winV = -Math.abs(rl.winV); }
    rl.mark = clamp(rl.mark + (f.hold ? 0.65 : -0.55) * dt, 0, 1);
    const inside = rl.mark >= rl.win && rl.mark <= rl.win + rl.w;
    rl.catch = clamp(rl.catch + (inside ? 0.22 : -0.16) * dt, 0, 1);
    // the reel's sound: fast high clicks while you pull, slower low ones on the slack; louder in the window
    if (f.hold !== rl.wasHold) { rl.wasHold = f.hold; rl.tickAt = 0; }
    if (now >= (rl.tickAt || 0)) { rl.tickAt = now + (f.hold ? 55 : 125); Sound.fishReel(f.hold, inside, rl.catch); }
    if (rl.catch >= 1) fishCaught();
    else if (rl.catch <= 0) { f.shapes = f.shapes.filter(s => s !== rl.s); f.reel = null; f.hook = null; Sound.fishSnap(); setMsg('> the line snapped. it got away.', C.danger); }
  }
}
function fishCaught() {
  const f = st.fish, s = f.reel.s, out = s.out;
  f.shapes = f.shapes.filter(x => x !== s);
  f.reel = null; f.hook = null;
  // its size (made up): phish by their kind's range in KB; a shoe gets a weight
  const kb = out.kind === 'fish' ? fishKB(out.key, Math.random) : null, lb = out.kind === 'shoe' ? 0.9 + Math.random() * 1.6 : null;
  const record = out.kind === 'fish' && counting() && kb > statOf('phishKB');   // (practice runs, e.g. the editor's jumps, don't keep records: no BIGGEST YET there)
  f.card = { out, look: s.look, kb, lb, record, t0: performance.now() };
  markSeen(out.key);
  if (out.kind === 'fish') { tally('fish'); if (out.rarity === 'legendary') tally('fishLeg'); best('phishKB', kb); if (kb >= 10 * 1048576) tally('phishBig'); }   // (BIG DATA: 10 GB+)
  if (out.kind === 'shoe') tally('fishShoe');
  fishFanfare(out, fishGeo().top + 3);
  setMsg(out.kind === 'fish' ? `> phished: ${fmtKB(kb)}.` : out.kind === 'shoe' ? "> ...it's a shoe." : '> just gear.', C.money);
}
// The catch's sound: the market's reveal pop by rarity (engine/sound.js pop); a legendary gets confetti, a shoe a wah-wah
function fishFanfare(out, y) {
  if (out.kind === 'shoe') return Sound.fishShoe();
  const lvl = ({ scrap: 0, common: 0, rare: 1, epic: 2, exotic: 3, legendary: 4 })[out.rarity] || 0;
  Sound.loot(); setTimeout(() => Sound.pop(lvl), 140);
  if (lvl < 2 || reduced()) return;
  const col = rarityCol(out.rarity), x = pxX(L.wc / 2), py = pxY(y);
  if (lvl >= 4) {   // legendary: confetti (like the multiplier going up)
    flash(col, 0.18, 0.35); shake(4, 0.3);
    const cols = [C.money, C.accent, C.bright, C.exotic, C.epic, C.rare, col], cells = [];
    for (let k = 0; k < 40; k++) cells.push({ ch: pickR(['*', '+', '~', 'x', '.', 'o', '<><'[k % 3]], Math.random), x: x + rand(-3, 3) * L.cw, y: py + rand(-1, 1) * L.chh, col: pickR(cols, Math.random) });
    setTimeout(() => explode(cells, x, py + L.chh, { power: 0.9, grav: 0.7, life: [0.9, 1.6] }), 200);
    return;
  }
  const cells = [];
  for (let k = 0; k < (lvl >= 3 ? 22 : 10); k++) cells.push({ ch: noiseCh(), x: pxX(rand(L.wc * 0.25, L.wc * 0.75)), y: py, col });
  explode(cells, x, py + L.chh / 2, { power: 0.4, grav: 0.4, life: [0.3, 0.7] });
}
function fishKeep() {
  const f = st.fish, out = f && f.card && f.card.out;
  if (!out) return;
  const key = fishKeepKey(out);
  if (!itemRoom(key, out.tier)) return Sound.deny();
  addItem(key, out.tier);
  Sound.buy(); setMsg(`> ${ITEMS[key].name.toLowerCase()} in your gear.`, C.accent);
  f.card = null;
}
function fishThrowBack() { const f = st.fish; if (!f || !f.card) return; f.card = null; Sound.tick(); setMsg('> back in the stream.', C.mid); }

// ---------------- Drawing (engine/scene.js, the board area) ----------------
function buildFish(ctx) {
  const { now, put, bg, addHit } = ctx, f = st.fish;
  if (!f) return;
  if (ctx.collectHits) fishTick(now);
  const g = fishGeo(), W = L.wc;
  // the stream
  for (let i = 0; i <= FISH_LANES; i++) put(0, g.top + i * 2, '='.repeat(W), C.dim, 'board');
  const rl = f.reel, quiet = !!(rl || f.card);
  for (let i = 0; i < FISH_LANES; i++) {
    if (quiet && !(rl && i === rl.s.lane)) continue;   // reeling (or the card is up): the other lanes go still (they fade back)
    const y = g.laneY(i), off = Math.floor(now / (220 / f.lanes[i])) % 4;
    put(0, y, [...Array(W)].map((_, k) => (((k - f.dirs[i] * off) % 4) + 4) % 4 === 0 ? '.' : ' ').join(''), C.dim, 'board');   // (the dots flow the lane's way)
  }
  // the shapes (all the same color: you can't tell what they are; red when one bites)
  // (the one on the hook is drawn alone: the others in its lane slip under it)
  const held = (f.hook && f.hook.bite) || (f.reel && f.reel.s) || null;
  const heldAt = held ? [Math.round(held.x) - 1, Math.round(held.x) + held.look.length] : null;
  for (const s of f.shapes) {
    const y = g.laneY(s.lane), bit = s === held, x = Math.round(s.x);
    for (let k = 0; k < s.look.length; k++) {
      if (x + k < 0 || x + k >= W) continue;
      if (!bit && held && s.lane === held.lane && x + k >= heldAt[0] && x + k <= heldAt[1]) continue;
      put(x + k, y, s.look[k], bit ? C.danger : s.flee || quiet ? C.dim : C.bright, 'board', bit);
    }
  }
  // the cast landing: little ( ) ripples spreading out from the hook
  if (f.ripples && f.ripples.length) {
    f.ripples = f.ripples.filter(p => now - p.t0 < 650);
    for (const p of f.ripples) {
      const k = 1 + Math.floor((now - p.t0) / 130);
      for (const [d, col] of [[k, k > 3 ? C.dim : C.mid], [k - 2, C.dim]]) {
        if (d < 1) continue;
        if (p.x - d >= 0) put(p.x - d, p.y, '(', col, 'fx');
        if (p.x + d < W) put(p.x + d, p.y, ')', col, 'fx');
      }
    }
  }
  // the hook and its line, from the surface down
  const hk = f.hook;
  if (hk) {
    const hx = Math.round(hk.x), hy = Math.round(hk.y);
    for (let y = g.surface; y < hy; y++) put(hx, y, '|', C.mid, 'fx');
    put(hx, hy, 'J', hk.bite ? C.danger : C.bright, 'fx', true);
    if (hk.bite) put(hx + 1, hy - 1, '!', C.danger, 'fx', true);
  }
  // the reel: the catch bar just above, and the window replaces the fish's own lane (its mark is the fish)
  if (rl) {
    const bw = W - 6, x0 = 3, fy = g.laneY(rl.s.lane), y0 = fy - 1;
    clearRect(ctx.cells, x0 - 1, y0, bw + 2, 2);
    for (let r = 0; r < 2; r++) bg(x0 - 1, y0 + r, bw + 2, C.bg, 1);
    const inside = rl.mark >= rl.win && rl.mark <= rl.win + rl.w;
    const ww = Math.max(3, Math.round(rl.w * (bw - 2))), wx = Math.min(x0 + bw - 1 - ww, x0 + 1 + Math.round(rl.win * (bw - 2))), mx = x0 + 1 + Math.round(rl.mark * (bw - 3));
    const k = Math.round(rl.catch * 14);
    const ct = `CATCH [${'#'.repeat(k)}${'-'.repeat(14 - k)}] ${String(Math.round(rl.catch * 100)).padStart(3)}%`;   // (fixed width: it doesn't jiggle)
    put(x0 + Math.floor((bw - ct.length) / 2), y0, ct, C.money, 'hud', true);   // centered over the slider
    // on the target: a white bar, the target cyan, the @ white. Off it: the bar red, the target pink, the @ cyan.
    // (each cell is drawn once: the @ and the target's | replace the - under them)
    const barCol = inside ? C.bright : C.danger, tgtCol = inside ? C.accent : C.danger;
    bg(wx, y0 + 1, ww, tgtCol, inside ? 0.4 : 0.22);
    for (let i = 0; i < bw; i++) {
      const x = x0 + i, inT = x >= wx && x < wx + ww;
      let ch = i === 0 ? '[' : i === bw - 1 ? ']' : '-', col = barCol;
      if (inT) { col = tgtCol; if (x === wx || x === wx + ww - 1) ch = '|'; }
      if (x === mx) { ch = '@'; col = inside ? C.bright : C.accent; }
      put(x, y0 + 1, ch, col, 'hud', inT || x === mx);
    }
    put(1, g.bottom + 1, 'HOLD: pull it in   LET GO: slack', C.mid, 'hud');
  } else {
    const y0 = g.bottom + 1;
    put(1, y0, `CAST ${fishCost()}cr   CASTS ${fishCasts()}/${ECON.fish.casts}`, C.mid, 'hud');
    // the buttons: REEL IN (an empty hook) and LEAVE
    const btn = (x, text, id, onTap, on) => { put(x, y0 + 1, text, on ? C.bright : C.dim, 'ui', false); if (st.hoverBtn === id) bg(x, y0 + 1, text.length, C.accent, 0.2); addHit(x, y0 + 1, text.length, 1, { kind: 'btn', id, onTap }); };
    btn(1, '[ REEL IN ]', 'freel', fishReelIn, !!hk && !hk.bite);
    btn(W - 10, '[ LEAVE ]', 'fleave', leavePier, true);
  }
  // the LANDED card: what it is, its size, what you got, what it's worth
  if (f.card) {
    const out = f.card.out, it = ITEMS[out.key], w = Math.min(W - 2, 34), x0 = Math.floor((W - w) / 2), y0 = g.top, h = 12;
    clearRect(ctx.cells, x0, y0, w, h);   // (the stream doesn't show through)
    for (let r = 0; r < h; r++) bg(x0, y0 + r, w, C.bg, 1);
    put(x0, y0, '+- LANDED ' + '-'.repeat(w - 11) + '+', C.money, 'hud', true);
    put(x0, y0 + h - 1, '+' + '-'.repeat(w - 2) + '+', C.money, 'hud', true);
    for (let r = 1; r < h - 1; r++) { put(x0, y0 + r, '|', C.money, 'hud'); put(x0 + w - 1, y0 + r, '|', C.money, 'hud'); }
    const mid = (y, t, col, bold) => put(x0 + Math.floor((w - t.length) / 2), y, t, col, 'hud', bold);
    if (out.kind === 'fish') mid(y0 + 1, f.card.look, rarityCol(out.rarity), true);
    else mid(y0 + 1, out.kind === 'shoe' ? "it's a shoe." : 'just gear.', C.mid);
    if (f.card.kb != null) mid(y0 + 2, fmtKB(f.card.kb) + (f.card.record ? '  BIGGEST YET' : ''), f.card.record ? C.money : C.mid, !!f.card.record);
    else if (f.card.lb != null) mid(y0 + 2, fmtLb(f.card.lb), C.mid);
    putChip(put, bg, x0 + 2, y0 + 3, it.name, it.rarity, 'hud', true);
    put(x0 + 2 + it.name.length + 2, y0 + 3, RARITY[it.rarity].label, C.mid, 'hud');
    wrapText(it.info || it.desc || '', w - 4).slice(0, 3).forEach((ln, i) => put(x0 + 2, y0 + 5 + i, ln, C.text, 'hud'));
    if (out.kind === 'fish') put(x0 + 2, y0 + 8, `a black market buys it: ${fishWorth(out.key)}cr`, C.money, 'hud');
    const room = itemRoom(fishKeepKey(out), out.tier);
    const kx = x0 + 2, tx = x0 + w - 16;
    if (!room) put(kx, y0 + 9, 'slots full: drag gear to the trash', C.dangerDim, 'hud');
    bg(kx, y0 + 10, 8, room ? C.accent : C.dim, 1); put(kx, y0 + 10, '[ KEEP ]', C.bg, 'hud', true);
    if (room) addHit(kx, y0 + 10, 8, 1, { kind: 'btn', id: 'fkeep', onTap: fishKeep });
    bg(tx, y0 + 10, 14, C.danger, 1); put(tx, y0 + 10, '[ THROW BACK ]', C.bg, 'hud', true);
    addHit(tx, y0 + 10, 14, 1, { kind: 'btn', id: 'fback', onTap: fishThrowBack });
  }
}
