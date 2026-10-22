// NeoN+1 engine/effects.js: Particles, flashes, shakes, and the scroll-fill wipe.
'use strict';
NEON_FILES.push(['engine/effects.js', 'v12.19']);

// ---------------- Effects ----------------
const parts = [];
const shakeFx = { amp: 0, t0: 0, dur: 1 };
const flashFx = { col: '#fff', a: 0, t0: 0, dur: 1 };
const rand = (a, b) => a + Math.random() * (b - a);

function shake(amp, dur = 0.35) { if (reduced()) return; Object.assign(shakeFx, { amp: amp * L.fs / 16, t0: performance.now(), dur }); }
function flash(col, a, dur = 0.3) { if (reduced()) return; Object.assign(flashFx, { col, a, t0: performance.now(), dur }); }

// Current on-screen characters (without transitions), as pixel positions.
function snapshot(filter) {
  return buildScene(performance.now(), false, true)
    .filter(filter)
    .map(c => ({ ch: c.ch, x: pxX(c.cx), y: pxY(c.cy), col: c.col }));
}

function explode(cells, ox, oy, { col = null, power = 1, grav = 1, life = [0.7, 1.3] } = {}) {
  const k = L.fs / 16;
  for (const c of cells) {
    const dx = c.x - ox, dy = c.y - oy, d = Math.hypot(dx, dy) || 1;
    const sp = rand(220, 600) * power * k;
    parts.push({
      mode: 'explode', ch: c.ch, x: c.x, y: c.y, col: col || c.col,
      vx: dx / d * sp + rand(-60, 60) * k,
      vy: dy / d * sp - rand(80, 320) * power * k,
      rot: 0, vr: rand(-9, 9), g: grav,
      t: 0, life: rand(life[0], life[1]), alpha: 1, scr: 5,
    });
  }
}

// Fireworks made of type: a word and some noise characters blasting out from a point.
const FIREWORK_WORDS = ['ROOT', 'ACCESS', 'GRANTED', 'OWNED', '0xFF', '1337', 'WIN', 'R00T'];
function typeFirework(x, y, col) {
  const word = FIREWORK_WORDS[Math.floor(Math.random() * FIREWORK_WORDS.length)];
  const cells = [];
  for (let i = 0; i < 22; i++) cells.push({ ch: i < word.length * 2 ? word[i % word.length] : noiseCh(), x, y, col });
  // Spread the start points a little so the burst has a shape.
  for (const c of cells) { const a = Math.random() * Math.PI * 2; c.x += Math.cos(a) * L.cw; c.y += Math.sin(a) * L.chh; }
  explode(cells, x, y, { power: 0.75, grav: 0.45, life: [0.8, 1.5] });
  Sound.burst();
}
function fireworkShow(n = 9, every = 280, mode = 'over') {
  const cols = () => [C.accent, C.money, C.exotic, C.epic, C.rare, C.bright];
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      if (st.mode !== mode) return;
      const x = pxX(rand(L.wc * 0.15, L.wc * 0.85)), y = pxY(rand(BOARD_Y + 1, BOARD_Y + L.gh * 0.6));
      typeFirework(x, y, pickR(cols(), Math.random));
    }, 350 + i * every + Math.random() * 120);
  }
}

// Losing: the screen collapses from the top down, like falling back down the net.
// Characters glitch in place, then let go row by row from the top, dropping
// (accelerating), scrambling, going red and fading. Returns the total time (ms).
const FALL = { wave: 1.7, jitter: 0.3, fall: 0.95 };
function fallOut(cells) {
  const top = L.oy, h = L.hc * L.chh;
  for (const c of cells) {
    const f = clamp((c.y - top) / h, 0, 1);
    parts.push({
      mode: 'fall', ch: c.ch, x: c.x, y: c.y, x0: c.x, y0: c.y, col: c.col, base: c.col,
      drop: f * FALL.wave + Math.random() * FALL.jitter,   // when it lets go
      vy: 0, t: 0, life: 0, rot: 0, alpha: 1, scr: 0,
    });
  }
  return (FALL.wave + FALL.jitter + FALL.fall) * 1000;
}

// Boss beaten: the screen breaks up from the bottom and floats away upward, the real
// node last. Ends empty (the reveal comes next). Returns the total time (ms).
const RISE = { wave: 0.9, jitter: 0.25, rise: 0.8 };
function riseOut(litKeys, speed = 1) {   // speed > 1 = slower (fits it to the fanfare)
  const R = { wave: RISE.wave * speed, jitter: RISE.jitter * speed, rise: RISE.rise * speed };
  const top = L.oy, h = L.hc * L.chh;
  const cells = buildScene(performance.now(), false, true);
  for (const c of cells) {
    const x = pxX(c.cx), y = pxY(c.cy);
    const lit = litKeys.has(c.cx + ',' + c.cy);
    const f = 1 - clamp((y - top) / h, 0, 1);   // bottom rows go first
    parts.push({
      mode: 'rise', ch: c.ch, x, y, x0: x, y0: y, col: lit ? C.accent : c.col, base: lit ? C.accent : c.col, bold: lit,
      drop: lit ? R.wave + R.jitter : f * R.wave + Math.random() * R.jitter, riseT: R.rise,
      vy: 0, t: 0, life: 0, rot: 0, alpha: 1, scr: 0,
    });
  }
  return (R.wave + R.jitter + R.rise) * 1000;
}

function updateParts(dt) {
  const grav = 1500 * L.fs / 16;
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.t += dt;
    if (p.t < 0) continue;
    const k = Math.min(1, p.t / p.life);
    if (p.mode === 'float') {   // emotes: drift up and fade
      p.y -= 26 * (L.fs / 16) * dt;
      p.alpha = k > 0.6 ? Math.max(0, (1 - k) / 0.4) : 1;
      if (p.t >= p.life) parts.splice(i, 1);
      continue;
    }
    if (p.mode === 'rise') {
      const r = Math.random();
      if (p.t < p.drop) {
        const near = 1 - Math.min(1, (p.drop - p.t) / 0.5);
        if (r < 0.1 * near) p.ch = noiseCh();
        p.col = Math.random() < 0.3 * near ? C.bright : p.base;
        continue;
      }
      const k2 = (p.t - p.drop) / p.riseT;
      p.vy -= grav * 0.45 * dt;
      p.y += p.vy * dt;
      if (r < 0.2) p.ch = noiseCh();
      p.col = k2 < 0.25 ? C.bright : k2 < 0.6 ? C.accent : C.money;
      p.alpha = Math.max(0, 1 - k2);
      if (k2 >= 1) parts.splice(i, 1);
      continue;
    }
    if (p.mode === 'fall') {
      const r = Math.random();
      if (p.t < p.drop) {
        // waiting: glitch in place, more as its turn gets close
        const near = 1 - Math.min(1, (p.drop - p.t) / 0.6);
        if (r < 0.02 + 0.12 * near) p.ch = noiseCh();
        p.x = r < 0.03 + 0.08 * near ? p.x0 + rand(-1, 1) * L.cw : p.x0;
        p.col = Math.random() < 0.05 + 0.25 * near ? C.danger : p.base;
        continue;
      }
      const k2 = (p.t - p.drop) / FALL.fall;
      p.vy += grav * 0.55 * dt;
      p.y += p.vy * dt;
      p.x = p.x0 + (r < 0.05 ? rand(-1, 1) * L.cw : 0);
      if (r < 0.25) p.ch = noiseCh();
      p.col = k2 > 0.3 ? C.dangerDim : C.danger;
      p.alpha = Math.max(0, 1 - k2);
      if (k2 >= 1) parts.splice(i, 1);
      continue;
    }
    if (p.mode === 'glitch') {
      const r = Math.random();
      if (r < 0.12) p.ch = noiseCh();
      p.x = r < 0.06 ? p.x0 + rand(-2, 2) * L.cw : p.x0;
      p.col = Math.random() < 0.1 ? C.danger : p.base;
      if (p.t >= p.life) parts.splice(i, 1);
      continue;
    }
    p.vy += grav * p.g * dt;
    p.vx *= 1 - 0.8 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.rot += p.vr * dt;
    p.alpha = k > 0.6 ? Math.max(0, (1 - k) / 0.4) : 1;
    if (Math.random() < p.scr * dt) p.ch = noiseCh();
    if (p.t >= p.life) parts.splice(i, 1);
  }
}

// ---------------- Scroll-fill wipe ----------------
// The board fills from the bottom with a scrolling pattern; a scramble band
// rides the front. Then the next screen comes up out of the fill the same way.
// level 0 = quiet page change, 1 = success, 2 = perfect / boss clear.
// Fills scroll upward. Two kinds:
//   - patterns: 4-row repeats (strings), so you can see them move
//   - noise fields: random characters fixed in place, so the whole field scrolls
//     up together (fresh random noise every frame would just flicker)
// Each wipe picks one at random (quiet set for page changes, success set for wins).
const hash2 = (a, b) => {
  let x = (Math.imul(a + 11, 374761393) + Math.imul(b + 7, 668265263)) | 0;
  x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d);
  x = Math.imul(x ^ (x >>> 12), 0x297a2d39);
  return (x ^ (x >>> 15)) >>> 0;
};
const noiseField = (chars, density) => (cx, r) => {
  const h = hash2(cx, r);
  return (h % 1000) < density * 1000 ? chars[(h >>> 10) % chars.length] : null;
};
// Each column cycles through `chain` with its own offset, so columns ripple.
const streams = chain => (cx, r) => {
  const ch = chain[(r + hash2(cx, 3) % chain.length) % chain.length];
  return ch === ' ' ? null : ch;
};
const FILLS = {
  quiet: [
    streams(' .:|'),
    noiseField('...::;+=', 0.5),
    [' ^  ^  ^', '/ \\/ \\/ ', ': :: :: ', '. .. .. '],    // chevrons
    ['-=-=-=-=', ' . . . .', '=-=-=-=-', '. . . . '],      // dashes
    ['.:  .:  ', ':|  :|  ', '  .:  .:', '  :|  :|'],      // checker streams
  ],
  success: [
    streams(' .:|#'),
    noiseField('::;+=*#%', 0.65),
    ['^^  ^^  ', '||  ||  ', '::^^::^^', '  ||  ||'],      // double chevrons
    [' /\\  /\\ ', '/::\\/::\\', ':||::||:', '.::..::.'],  // arrows
  ],
};
// Timing per strength: how long the front takes to cross the board, and how
// long each character takes to break down (or build up) when the front hits it.
const WIPE_TIME = [
  { travel: 280, decay: 240 },   // quiet page change
  { travel: 340, decay: 320 },   // success
  { travel: 360, decay: 360 },   // perfect / boss clear
];
const DECAY_CHARS = '.:,\'`';

function fillChar(cx, cy, now, level, pat) {
  const s = Math.floor(now * CONFIG.wipeSpeed / (level ? 45 : 75));   // one row up per tick
  if (typeof pat === 'function') return pat(cx, cy + s);
  const row = pat[(((cy + s) % pat.length) + pat.length) % pat.length];
  const ch = row[((cx % row.length) + row.length) % row.length];
  return ch === ' ' ? null : ch;
}

// How it works: fronts rise row by row; each board row gets an arrival time.
// The old screen's front starts first. Partway up, the new screen's front starts
// behind it, so the two overlap like a cross-fade:
//   top: old screen still breaking down / middle: scrolling fill / bottom: new screen.
// Old characters break down when hit (flicker -> noise -> decay dots).
// New characters build up the reverse way. Empty cells just fill or clear.
const LIT_HOLD = 220; // wipe-time the real node stays lit after the front passes the top
// Each character gets its own random delay and change speed, so swaps don't happen in a neat line.
const charJitter = (cx, cy, salt) => (hash2(Math.round(cx * 2) + salt, Math.round(cy)) % 1000) / 1000;

function applyWipe(cells, now) {
  const w = st.wipe;
  const top = w.full ? 0 : BOARD_Y, bot = w.full ? L.hc : BOARD_Y + L.gh;
  const inB = c => c.cy >= top && c.cy < bot;
  const out = cells.filter(c => !inB(c));
  const outT = WIPE_TIME[w.level];
  const inLvl = w.levelIn != null ? w.levelIn : Math.min(w.level, 1);
  const inT = WIPE_TIME[inLvl];
  const eOut = (now - w.t0) * CONFIG.wipeSpeed;                                   // wipe-time, scaled by speed
  const eIn = w.tIn != null ? (now - w.tIn) * CONFIG.wipeSpeed : -Infinity;
  const frac = cy => (bot - 1 - cy) / Math.max(1, bot - top - 1);                   // bottom row first
  const hitOut = w.level ? C.accent : C.text, hitIn = inLvl ? C.accent : C.text;
  const fillCol = age => age < 70 ? (w.level ? C.accent : C.mid) : age < 200 && w.level ? C.mid : C.dim;
  const busy = new Set();   // cells with a character mid-change; no fill drawn there
  const key = (cx, cy) => Math.round(cx) + ',' + Math.round(cy);
  const decayCh = () => DECAY_CHARS[Math.floor(Math.random() * DECAY_CHARS.length)];

  // Old screen: breaks down as its front passes.
  for (const c of w.cells) {
    if (!inB(c)) continue;
    const hit = eOut - frac(Math.round(c.cy)) * outT.travel;          // time since the front got here
    const t = hit - charJitter(c.cx, c.cy, 1) * CONFIG.wipeStagger;      // this character starts a bit later
    const dec = outT.decay * (0.7 + 0.6 * charJitter(c.cx, c.cy, 2));
    if (t < 0) { out.push(c); if (hit >= 0) busy.add(key(c.cx, c.cy)); continue; }   // holding on in the fill
    if (t >= dec) continue;
    const q = t / dec;
    let ch, col;
    if (q < 0.3) { ch = Math.random() < 0.5 ? c.ch : noiseCh(); col = Math.random() < 0.5 ? c.col : hitOut; }
    else if (q < 0.7) { ch = noiseCh(); col = hitOut; }
    else { ch = decayCh(); col = C.mid; }
    const dy = -Math.sin(Math.min(1, q * 2) * Math.PI) * (w.level ? 0.35 : 0.2);   // bumped by the front
    out.push({ ch, cx: c.cx, cy: c.cy + dy, col, own: 'wipe', bold: c.bold });
    busy.add(key(c.cx, c.cy));
  }

  // New screen: builds up as its front passes (once it has started).
  if (w.tIn != null) {
    for (const c of cells) {
      if (!inB(c) || busy.has(key(c.cx, c.cy))) continue;
      const hit = eIn - frac(Math.round(c.cy)) * inT.travel;
      if (hit < 0) continue;                                              // still under the fill
      const t = hit - charJitter(c.cx, c.cy, 3) * CONFIG.wipeStagger;
      const dec = inT.decay * (0.7 + 0.6 * charJitter(c.cx, c.cy, 4));
      if (t < 0) {                                                        // waiting its turn: cycling noise
        out.push({ ch: Math.random() < 0.5 ? decayCh() : noiseCh(), cx: c.cx, cy: c.cy, col: C.mid, own: 'wipe' });
        busy.add(key(c.cx, c.cy));
        continue;
      }
      if (t >= dec) { out.push(c); continue; }
      const q = t / dec;
      let ch, col;
      if (q < 0.25) { ch = decayCh(); col = C.mid; }
      else if (q < 0.65) { ch = noiseCh(); col = hitIn; }
      else { ch = Math.random() < 0.6 ? c.ch : noiseCh(); col = Math.random() < 0.6 ? c.col : hitIn; }
      out.push({ ch, cx: c.cx, cy: c.cy, col, own: 'wipe', bold: c.bold });
      busy.add(key(c.cx, c.cy));
    }
  }

  // Fill between the two fronts, with bright leading lines.
  for (let cy = top; cy < bot; cy++) {
    const tO = eOut - frac(cy) * outT.travel;
    const tI = eIn - frac(cy) * inT.travel;
    for (let cx = 0; cx < L.wc; cx++) {
      if (busy.has(cx + ',' + cy)) continue;
      if (tO < 0) {
        // Old screen region. Sparks just ahead of the front on a success.
        if (w.level && tO > -90 && Math.random() < (w.level >= 2 ? 0.08 : 0.04)) out.push({ ch: noiseCh(), cx, cy, col: C.accent, own: 'wipe' });
        continue;
      }
      if (tI >= 0) {
        // New screen region; a bright line marks its front.
        if (tI < 60) { const ch = fillChar(cx, cy, now, inLvl, w.pattern); if (ch) out.push({ ch, cx, cy, col: hitIn, own: 'wipe' }); }
        continue;
      }
      const ch = fillChar(cx, cy, now, w.level, w.pattern);
      if (ch) out.push({ ch, cx, cy, col: fillCol(tO), own: 'wipe' });
    }
  }

  // The real node stays lit and is the last thing swallowed.
  if (w.lit && eOut < outT.travel + LIT_HOLD) {
    const ending = eOut > outT.travel + LIT_HOLD - 160;
    for (const c of w.lit) out.push(Object.assign({}, c, { ch: ending && Math.random() < 0.6 ? noiseCh() : c.ch, col: C.accent, bold: true }));
  }
  return out;
}

// Start wiping the board out. Resolves at the hand-off point, partway through,
// so the caller can open the next screen while the old one is still going.
async function wipeOut(level = 0, lit = null, quiet = false) {
  const now = performance.now();
  const cells = buildScene(now, false, true);   // whole screen; applyWipe uses the part in its region
  const pattern = pickR(level ? FILLS.success : FILLS.quiet, Math.random);   // new fill each wipe
  st.wipe = { t0: now, level, cells, lit, pattern, tIn: null, full: fullScreen() };
  if (level) { if (quiet) Sound.whoosh(); else Sound.sweep(level); shake(level >= 2 ? 7 : 3, 0.3); if (level >= 2) flash(C.accent, 0.15, 0.4); }
  else Sound.whoosh();
  // Success wipes hand off later, so the lit node gets its moment.
  const handoff = WIPE_TIME[level].travel * (level ? CONFIG.wipeOverlapWin : CONFIG.wipeOverlap) / CONFIG.wipeSpeed;
  await wait(handoff);
}

// Start the new screen's front. Without a wipe in progress, just decode in.
function wipeIn() {
  const w = st.wipe;
  if (w && w.tIn == null) {
    const now = performance.now();
    w.tIn = now;
    if (fullScreen()) w.full = true;   // full-screen screens wipe the whole screen
    w.levelIn = Math.min(w.level, 1);   // the new screen always builds in calmly
    const outT = WIPE_TIME[w.level], inT = WIPE_TIME[w.levelIn];
    const slack = CONFIG.wipeStagger;   // the last characters can start this much later, and change 1.3x slower
    const outEnd = w.t0 + (outT.travel + Math.max(outT.decay * 1.3 + slack, w.lit ? LIT_HOLD : 0)) / CONFIG.wipeSpeed;
    const inEnd = now + (inT.travel + inT.decay * 1.3 + slack) / CONFIG.wipeSpeed;
    w.dur = inEnd - now;                 // how long until the new screen is fully in
    w.endsAt = Math.max(outEnd, inEnd);
  } else {
    st.wipe = null;
    st.boardStart = performance.now();
  }
}
