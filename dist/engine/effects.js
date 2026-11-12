// NeoN+1 engine/effects.js: Particles, flashes, shakes, and the scroll-fill wipe.
'use strict';
NEON_FILES.push(['engine/effects.js', 'v14.83']);

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
      mode: 'explode', ch: c.ch, x: c.x, y: c.y, col: col || c.col, bg: c.bg || null,   // (bg: a whole cell falls, its background with it)
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
    if (p.mode === 'path') {   // it follows p.path(k): { x, y, ch?, col?, alpha?, rot? }; p.onEnd when it's done
      Object.assign(p, p.path(k, p));
      if (p.t >= p.life) { parts.splice(i, 1); if (p.onEnd) p.onEnd(); }
      continue;
    }
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

// MOLD IN THE TRANSITION (data/fx.js moldwipe): how much mold the wipes carry, 0-1. The editor's G0D tab's slider
// (st.moldDev) wins while it's on; in the game it's the M0LD events (engine/heaven.js moldLevel(): light / heavy).
// A wipe takes the most of it at its start and when the new screen comes in (so going into a mold corp counts too).
function wipeMold() {
  if (st.moldDev != null) return st.moldDev;
  const lv = typeof moldLevel === 'function' ? moldLevel() : null, MW = FX_LOOKS.moldwipe;
  return lv === 'heavy' ? MW.heavy : lv === 'light' ? MW.light : 0;
}
const moldInk = (cx, cy) => moldCol(1 + FX.hash(Math.round(cx), Math.round(cy), 11) * 3);   // (moldCol: engine/g0d.js)
const moldCh = (cx, cy, now) => FX.pick(FX_LOOKS.moldwipe.set, FX.hash(Math.round(cx), Math.round(cy), FX.step(now, 140)));
// A blotch of mold in the fill at (cx, cy), scrolling up with it (s = the fill's scroll); ragged at the edges.
function moldBlotch(cx, cy, s, m) {
  const MW = FX_LOOKS.moldwipe, B = Math.max(1, MW.blotch), j = FX.hash(cx, cy + s, 14) * B * 0.6;
  return FX.hash(Math.floor((cx + j) / B), Math.floor((cy + s + j / 2) / (B / 2)), 15) < m * MW.fill;
}

// G0D IN THE TRANSITION (data/fx.js eyewipe): how much of him a wipe carries, 0-1. The editor's G0D tab's slider
// (st.eyesDev) wins while it's on; otherwise eyewipe.chance of the wipes get him at eyewipe.level (Greg, 2026-11-09:
// 15%), but never in the intro or the training. The roll is a hash of the wipe's count and time, not Math.random, so
// the game's other random rolls don't move. Like the mold: the most of it at the start and when the new screen comes in.
let wipeCount = 0;
const wipeEyes = () => st.eyesDev != null ? st.eyesDev : 0;
function rollWipeEyes(now) {
  if (st.eyesDev != null) return st.eyesDev;
  const EW = FX_LOOKS.eyewipe;
  if (st.boot || st.tut || !(EW.chance > 0)) return 0;
  return FX.hash(++wipeCount, Math.floor(now) % 9973, 71) < EW.chance ? EW.level : 0;
}
// A red letter of his name (eyewipe.word) at (cx, cy), now and then a glitch mark (the eyes' glitch).
function eyeLetter(cx, cy, s, now) {
  const EY = FX_LOOKS.eyes, ch = FX.hash(Math.round(cx), Math.round(cy), FX.step(now, EY.ms) + 61) < EY.glitch * 3 ? FX.pick(EY.set, FX.hash(cx, cy, FX.step(now, EY.ms))) : FX.pick(FX_LOOKS.eyewipe.word, FX.hash(cx, cy + s, 18));
  return { ch, col: FX.col(EY.col), bold: true };
}
// The eyes in a wipe: still, on the glass (not scrolling with the fill). Each comes in as the old screen's front
// passes its row, and goes up to eyewipe.linger after the new screen's front does (wipeIn sets that).
const EYE_WIPE_MAX = 4000;   // ms: the longest a wipe's eyes can stay (applyEyeWipe)
function eyeWipeStart(w, now) {
  const e = w.eyes || 0, EW = FX_LOOKS.eyewipe, n = Math.round(EW.count * e);
  if (!n) return null;
  let k = 0; const rnd = () => FX.hash(Math.floor(now) % 9973, k++, 73);   // (its own rolls: see rollWipeEyes)
  const top = w.top != null ? w.top : w.full ? 0 : BOARD_Y, bot = w.bot != null ? w.bot : w.full ? L.hc : BOARD_Y + L.gh;
  const outT = WIPE_TIME[w.level], spots = [];
  for (let i = 0, tries = 0; spots.length < n && tries < n * 8; tries++) {
    const kind = rnd() < EW.big ? 'big' : rnd() < 0.5 ? 'mid' : 'small', [ew, eh] = FX.eyeSize(kind);
    const x = Math.floor(rnd() * (L.wc - ew + 1)), y = top + Math.floor(rnd() * Math.max(1, bot - top - eh + 1));
    if (spots.some(o => x < o.x + o.w + 2 && o.x < x + ew + 2 && y < o.y + o.h + 1 && o.y < y + eh + 1)) continue;
    const row = y + Math.floor(eh / 2), frac = (bot - 1 - row) / Math.max(1, bot - top - 1);
    spots.push({ kind, x, y, w: ew, h: eh, row, frac, t0: now + (frac * outT.travel + 120 + rnd() * 200) / CONFIG.wipeSpeed, life: Infinity, seed: Math.floor(rnd() * 9999) + i++, still: true });
  }
  return { spots, top, bot, w, t0: now };
}
function eyeWipeIn(g, inT, now) {
  const EW = FX_LOOKS.eyewipe; let k = 0; const rnd = () => FX.hash(Math.floor(now) % 9973, k++, 74);
  for (const o of g.spots) o.life = Math.max(400, now + o.frac * inT.travel / CONFIG.wipeSpeed + EW.linger * (0.3 + 0.7 * rnd()) - o.t0);
  g.endsAt = Math.max(0, ...g.spots.map(o => o.t0 + o.life));
}
// Drawn over the screen during the wipe and after it (like the mold that lags behind): the cells under an eye go.
function applyEyeWipe(cells, now) {
  const g = st.eyeWipe;
  // its wipe went without a hand-off (the boss warning drops it; others too): the eyes linger a little, then go.
  // And never more than EYE_WIPE_MAX after it started, whatever happens.
  if (!g.endsAt && (st.wipe !== g.w || now - g.t0 > EYE_WIPE_MAX)) {
    for (const o of g.spots) o.life = now < o.t0 ? -1 : now - o.t0 + FX_LOOKS.eyewipe.linger * (0.3 + 0.7 * FX.hash(o.seed, 3, 75));   // (one not up yet never comes)
    g.endsAt = Math.max(0, ...g.spots.map(o => o.t0 + o.life));
  }
  if (g.endsAt && now > g.endsAt) { st.eyeWipe = null; return cells; }
  const marks = [], under = new Set();
  for (const o of g.spots) {
    const m = FX.eyeMarks(o, FX_LOOKS.eyes, now);
    if (!m.length) continue;
    for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) under.add((o.x + x) + ',' + (o.y + y));
    for (const k of m) marks.push({ ch: k.ch, cx: o.x + k.x, cy: o.y + k.y, col: k.col, own: 'wipe', bold: k.bold });
  }
  if (!marks.length) return cells;
  return cells.filter(c => !under.has(Math.round(c.cx) + ',' + Math.round(c.cy))).concat(marks);
}

function applyWipe(cells, now) {
  const w = st.wipe;
  const m = w.mold || 0, MW = FX_LOOKS.moldwipe, moldy = () => m > 0 && Math.random() < m * MW.noise;
  const ey = w.eyes || 0, EW = FX_LOOKS.eyewipe, godly = () => ey > 0 && Math.random() < ey * EW.noise;   // (a red g / 0 / d in the noise)
  const top = w.top != null ? w.top : w.full ? 0 : BOARD_Y, bot = w.bot != null ? w.bot : w.full ? L.hc : BOARD_Y + L.gh;
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
    else if (q < 0.7) { if (moldy()) { ch = moldCh(c.cx, c.cy, now); col = moldInk(c.cx, c.cy); } else if (godly()) ({ ch, col } = eyeLetter(c.cx, c.cy, 0, now)); else { ch = noiseCh(); col = hitOut; } }
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
      // (the mold that lingers on the new screen's marks is applyMoldLag's: it doesn't hold the wipe up)
      if (t >= dec) { out.push(c); continue; }
      const q = t / dec;
      let ch, col;
      if (q < 0.25) { ch = decayCh(); col = C.mid; }
      else if (q < 0.65) { if (moldy()) { ch = moldCh(c.cx, c.cy, now); col = moldInk(c.cx, c.cy); } else if (godly()) ({ ch, col } = eyeLetter(c.cx, c.cy, 0, now)); else { ch = noiseCh(); col = hitIn; } }
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
      const scroll = Math.floor(now * CONFIG.wipeSpeed / (w.level ? 45 : 75));
      if (ey > 0 && FX.hash(cx, cy + scroll, 17) < ey * EW.letters) { out.push(Object.assign({ cx, cy, own: 'wipe' }, eyeLetter(cx, cy, scroll, now))); continue; }   // his letters, scrolling with the fill
      if (m > 0 && moldBlotch(cx, cy, scroll, m)) { out.push({ ch: moldCh(cx, cy, now), cx, cy, col: moldInk(cx, cy), own: 'wipe' }); continue; }   // (the same scroll as fillChar)
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

// THE MOLD LAGS BEHIND (data/fx.js moldwipe.lag): drawn over the screen during the wipe and after it. A cell stays mold
// if the fill had a blotch there when the new screen's front passed its row, until a time of its own (up to lag x mold
// ms after the front). It doesn't hold up the wipe: taps work once the wipe is done, with the mold still clearing.
function applyMoldLag(cells, now) {
  const g = st.moldLag, MW = FX_LOOKS.moldwipe;
  const top = g.top != null ? g.top : g.full ? 0 : BOARD_Y, bot = g.bot != null ? g.bot : g.full ? L.hc : BOARD_Y + L.gh;
  const rowMs = g.travel / CONFIG.wipeSpeed, lag = MW.lag * g.m, lin = MW.linger * g.m;
  if (now > g.t0 + rowMs + Math.max(lag, lin)) { st.moldLag = null; return cells; }
  const marks = new Set(cells.map(c => Math.round(c.cx) + ',' + Math.round(c.cy))), stuck = new Map();
  for (let cy = top; cy < bot; cy++) {
    const passAt = g.t0 + (bot - 1 - cy) / Math.max(1, bot - top - 1) * rowMs;   // when the front passed this row (bottom row first)
    if (now < passAt) continue;
    const s = Math.floor(passAt * CONFIG.wipeSpeed / (g.level ? 45 : 75));         // the fill's scroll then (as fillChar)
    for (let cx = 0; cx < L.wc; cx++) {
      let until = 0;
      if (lag > 0 && moldBlotch(cx, cy, s, g.m)) until = passAt + lag * (0.35 + 0.65 * FX.hash(cx, cy, 16));   // a blotch, left behind
      if (lin > 0 && marks.has(cx + ',' + cy) && FX.hash(cx, cy, 12) < g.m * MW.stay) until = Math.max(until, passAt + lin * (0.5 + 0.5 * FX.hash(cx, cy, 13)));   // a mark still moldy
      if (now >= until) continue;
      if (until - now < 160 && FX.hash(cx, cy, FX.step(now, 50)) < 0.5) continue;   // flickering out
      stuck.set(cx + ',' + cy, { ch: moldCh(cx, cy, now), cx, cy, col: moldInk(cx, cy), own: 'wipe' });
    }
  }
  if (!stuck.size) return cells;
  const out = cells.filter(c => !stuck.has(Math.round(c.cx) + ',' + Math.round(c.cy)));
  for (const c of stuck.values()) out.push(c);
  return out;
}

// Start wiping the board out. Resolves at the hand-off point, partway through,
// so the caller can open the next screen while the old one is still going.
async function wipeOut(level = 0, lit = null, quiet = false) {
  const now = performance.now();
  const cells = buildScene(now, false, true);   // whole screen; applyWipe uses the part in its region
  const pattern = pickR(level ? FILLS.success : FILLS.quiet, Math.random);   // new fill each wipe
  st.wipe = { t0: now, level, cells, lit, pattern, tIn: null, full: fullScreen(), mold: wipeMold(), eyes: rollWipeEyes(now) };
  st.moldLag = null;   // (the last wipe's left-behind mold goes)
  st.eyeWipe = eyeWipeStart(st.wipe, now);   // (and its eyes)
  if (level) { if (quiet) Sound.whoosh(); else Sound.sweep(level); shake(level >= 2 ? 7 : 3, 0.3); if (level >= 2) flash(C.accent, 0.15, 0.4); }
  else Sound.whoosh();
  // Success wipes hand off later, so the lit node gets its moment.
  const handoff = WIPE_TIME[level].travel * (level ? CONFIG.wipeOverlapWin : CONFIG.wipeOverlap) / CONFIG.wipeSpeed;
  await wait(handoff);
}

// Start the new screen's front. Without a wipe in progress, just decode in.
function wipeIn() {
  const w = st.wipe;
  if (w && w.tIn == null && st.tut && st.tut.curtain) return;   // the training's opening: the lines hold until POPS is done
  if (w && w.tIn == null) {
    const now = performance.now();
    w.tIn = now;
    if (fullScreen()) w.full = true;   // full-screen screens wipe the whole screen
    w.levelIn = Math.min(w.level, 1);   // the new screen always builds in calmly
    w.mold = Math.max(w.mold || 0, wipeMold());   // (going into a mold corp: its mold counts too)
    if (!st.eyeWipe && wipeEyes() > (w.eyes || 0)) { w.eyes = wipeEyes(); st.eyeWipe = eyeWipeStart(w, now); }
    const outT = WIPE_TIME[w.level], inT = WIPE_TIME[w.levelIn];
    const slack = CONFIG.wipeStagger;   // the last characters can start this much later, and change 1.3x slower
    const outEnd = w.t0 + (outT.travel + Math.max(outT.decay * 1.3 + slack, w.lit ? LIT_HOLD : 0)) / CONFIG.wipeSpeed;
    const inEnd = now + (inT.travel + inT.decay * 1.3 + slack) / CONFIG.wipeSpeed;
    w.dur = inEnd - now;                 // how long until the new screen is fully in
    w.endsAt = Math.max(outEnd, inEnd);
    // the mold lags behind: the fill's blotches stay put as the new screen's front passes them, and clear late
    if (w.mold > 0) st.moldLag = { t0: now, m: w.mold, level: w.level, travel: inT.travel, full: w.full, top: w.top, bot: w.bot };
    if (st.eyeWipe) eyeWipeIn(st.eyeWipe, inT, now);   // the eyes go a little after the new screen's front passes them
  } else {
    st.wipe = null;
    st.boardStart = performance.now();
  }
}
