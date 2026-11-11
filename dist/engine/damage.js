// NeoN+1 engine/damage.js: damage and healing (hurt, heal, ZOMBIE rot, BLOOD MONEY), and the exotic pick rules
// that change them: ICE EATER, COIN FLIP, SNOOZE, ALL-IN, FAILSAFE, BLACK ICE. Moved out of engine/run.js (2026-11-05).
'use strict';
NEON_FILES.push(['engine/damage.js', 'v14.76']);

// ---- Damage and healing outside an ICE hit go through these, so ZOMBIE can turn them into rot.
// hurt: n integrity (ZOMBIE: rot instead). heal: up to n integrity (ZOMBIE: less rot).
function hurt(n) {
  const run = st.run;
  if (zombie()) return addRot(n * ROT.ice);
  if (bloodMoney()) return payBlood(n);
  run.integrity -= n;
  if (run.tutorial) run.integrity = Math.max(1, run.integrity);   // the training run can't be lost
}
function heal(n) {
  const run = st.run;
  if (zombie()) { run.rot = Math.max(0, (run.rot || 0) - n * ROT.heal); return; }
  if (bloodMoney()) { run.credits += n * BLOOD.heal; run.earned += n * BLOOD.heal; return; }
  run.integrity = Math.min(run.maxInt, run.integrity + n);
}
// ZOMBIE: add rot. At ROT.max you fall apart: integrity goes to 0, so the usual death checks
// (onTrap, the corps' own) end the run.
function addRot(n) {
  const run = st.run;
  run.rot = (run.rot || 0) + n;
  if (run.rot >= rotMax()) { run.rot = rotMax(); run.integrity = 0; }   // (STIM: a higher limit this corp)
}
// LEVERAGE: the odds an ICE hit does nothing, from how deep in debt you are.
const debtShield = () => Math.min(DEBT.shieldMax, Math.max(0, -st.run.credits) / DEBT.shieldPer);
const canHeal = () => zombie() ? (st.run.rot || 0) > 0 : bloodMoney() ? true : st.run.integrity < st.run.maxInt;
// BLOOD MONEY: a hurt of n costs credits. Can't pay: you're dead (integrity 0), unless FAILSAFE
// catches it (you're left broke). Returns what it cost.
function payBlood(n) {
  const run = st.run, cost = bloodCost(n);
  modFired('bloodmoney');
  if (canSpend(cost)) { run.credits -= cost; return cost; }   // (LEVERAGE: into debt)
  run.credits = Math.min(run.credits, Math.max(creditFloor(), 0));
  if (has('failsafe') && !run.failsafeUsed) { run.failsafeUsed = true; st.fsAt = performance.now(); if (st.lv) st.lv.failsafeNow = true; return cost; }
  run.integrity = 0;
  return cost;
}

// ---- ICE EATER (docs/EXOTICS.md). Tapping ICE eats it, eating all the ICE clears the layer,
// the real node bites back (-3). Each bite pays the layer's pay / its ICE count; onSafe pays the rest.
function eatPay() {
  const run = st.run, lv = st.lv;
  const share = Math.max(1, Math.round(payFor(lv) / Math.max(1, lv.iceTotal)));
  earn(share, run); lv.eatPaid = (lv.eatPaid || 0) + share;
  return share;
}
// An ICE node you tapped (from onTrap, in place of blockHit). Returns the message.
function eatBite(t) {
  const pay = eatPay();
  Sound.shatter(); shake(3);
  modFired('iceeater');
  if (zombie()) addRot(ROT.ice);   // you still broke it
  return `> ICE eaten. +${pay}cr${zombie() ? ` rot +${ROT.ice}` : ''}`;
}
// You bit the real node. It bites back for 3 and the layer passes with no pay; FAILSAFE catches
// it if that would kill you. ZOMBIE can't die from it, it rots a lot instead.
const EATER_BITE = 3;   // was instant death (2026-10-25: too harsh)
async function eaterBit(t) {
  const run = st.run, lv = st.lv;
  t.state = 'reveal';
  Sound.trap(); shake(14, 0.6); flash(C.danger, 0.3, 0.5);
  modFired('iceeater');
  setMsg(`> that was the real one. -${EATER_BITE}.`, C.danger);
  if (st.god) { /* dev: no death */ }
  else if (zombie()) addRot(ROT.realTap);
  else if (has('failsafe') && !run.failsafeUsed && !bloodMoney() && run.integrity <= EATER_BITE) { run.failsafeUsed = true; run.integrity = 1; st.fsAt = performance.now(); lv.failsafeNow = true; }
  else hurt(EATER_BITE);
  await failsafeBeat(lv);
  await wait(600);
  if (run.integrity <= 0) return die();
  lv.payCut = 1; lv.scanned = true;   // you live: the layer passes, no pay
  return onSafe(t);
}
// X-AXIS / Y-AXIS under ICE EATER: they never pick the real node. A scan whose line holds it
// marks the line as a warning for the layer (lv.warn: row / col); every scan sweeps dim.
function eaterScan(t) {
  const lv = st.lv, real = lv.tiles[lv.safe];
  if (real.state !== 'closed') return;
  const axes = modsAt('pick').filter(k => k === 'xaxis' || k === 'yaxis');
  if (!axes.length) return;
  const hit = axes.filter(k => k === 'xaxis' ? real.row === t.row : real.col === t.col);
  lv.scan = { t0: performance.now(), from: t, axes, real: null };   // the sweep (dim, fades)
  lv.warn = lv.warn || {};   // the warning lines stay lit for the layer
  for (const k of hit) { if (k === 'xaxis') lv.warn.row = t.row; else lv.warn.col = t.col; }
  for (const k of hit) callout(k, `> ${MODS[k].name.toLowerCase()}: the real one is in this ${k === 'xaxis' ? 'row' : 'column'}.`);
}
// The clock ran out under ICE EATER or ZOMBIE: no random tap. It costs 1 integrity (ZOMBIE: rot)
// and the clock starts over.
function clockHurts() {
  const run = st.run, tm = st.timer;
  tm.left = tm.max; tm.lastSec = Math.ceil(tm.max);
  Sound.trap(); shake(6); flash(C.danger, 0.15, 0.3);
  if (zombie()) { addRot(ROT.timeout); setMsg(`> clock ran out. rot +${ROT.timeout}.`, C.danger); }
  else if (bloodMoney()) { const cost = payBlood(1); setMsg(`> clock ran out. -${cost}cr.`, C.danger); }
  else { run.integrity -= 1; setMsg('> clock ran out. integrity -1.', C.danger); }
  if (run.integrity <= 0) { st.busy = true; die(); }
}
// ---- COIN FLIP (docs/EXOTICS.md). Hold a node: st.coin opens over it (two faces); drag to a side
// and let go to call it. The coin lands, you win or lose that face's prize, the multiplier moves,
// then the node opens as a normal pick. Input in engine/input.js, drawing in engine/scene.js.
function coinOpen(i) {
  const t = st.lv && st.lv.tiles[i];
  if (!coinOn() || st.busy || !t || t.state !== 'closed') return;
  st.coin = { i, faces: rollCoin(i), side: null, at: performance.now(), below: false };   // always above (on the top row it covers the header for a moment)
  Sound.tick();
}
function coinCancel() { if (st.coin && !st.coin.flipAt) { st.coin = null; Sound.ui(); } }
// Every frame: a press held long enough brings the coin up.
function coinTick(now) {
  const p = st.coinPress;
  if (p && !st.coin && now - p.t0 >= COIN.holdMs) coinOpen(p.i);
}
async function coinFlip() {
  const cn = st.coin, run = st.run;
  if (!cn || cn.side == null || cn.flipAt || st.busy) return;
  st.busy = true;
  cn.flipAt = performance.now();
  cn.vals = cn.faces.map(coinValue);   // the prizes as called (the multiplier moves after)
  Sound.probe();
  const landed = rngFor(run.seed, 'coin', st.corp.node.id, st.corp.idx, (run.flips = (run.flips || 0) + 1))() < 0.5 ? 0 : 1;
  await wait(COIN.spinMs);
  cn.landed = landed;
  const f = cn.faces[cn.side], win = landed === cn.side, v = cn.vals[cn.side];
  const what = f.kind === 'hp' ? `${v} ♥` : `${v}cr`;
  modFired('coinflip');
  if (win) {
    if (f.kind === 'hp') heal(v); else { earn(v, run); }
    Sound.loot(); setMsg(`> heads up: won ${what}.`, C.money);
  } else {
    if (f.kind === 'hp') hurt(v);
    else run.credits -= Math.max(0, Math.min(v, run.credits - creditFloor()));
    Sound.deny(); shake(4); setMsg(`> tails down: lost ${what}.`, C.danger);
  }
  const old = run.coinMult || 1;
  run.coinMult = clamp(old + (win ? 1 : -1), 1, COIN.max);
  if (run.coinMult > old) coinPop(run.coinMult);
  await wait(750);
  st.coin = null;
  if (run.integrity <= 0) return die();
  st.busy = false;
  return pick(cn.i);   // then the node opens, as a normal pick
}
// The multiplier went up: a big xN drops onto the board, with confetti and a fanfare.
function coinPop(m) {
  const cn = st.coin, ct = cn && st.lv && st.lv.tiles[cn.i];
  const coinTop = ct ? tileOrigin(ct).ty < BOARD_Y + L.gh / 2 : true;
  const py = coinTop ? BOARD_Y + Math.floor(L.gh * 0.7) : BOARD_Y + 2;   // the other half of the board
  st.coinPop = { m, at: performance.now(), y: py };
  Sound.jingle(); setTimeout(() => Sound.burst(), 260);
  flash(C.money, 0.12, 0.35);
  if (reduced()) return;
  const x = pxX(L.wc / 2), y = pxY(py + 1), cols = [C.money, C.accent, C.bright, C.exotic, C.epic, C.rare];
  const cells = [];
  for (let k = 0; k < 34; k++) cells.push({ ch: pickR(['*', '+', '$', 'x', '.', 'o', String(m)], Math.random), x: x + rand(-2, 2) * L.cw, y: y + rand(-1, 1) * L.chh, col: pickR(cols, Math.random) });
  setTimeout(() => explode(cells, x, y + L.chh, { power: 0.9, grav: 0.7, life: [0.9, 1.6] }), 280);
}

// ---- SNOOZE (EXOTIC): the ICE you snoozed comes back into this layer, one more ICE node each: in
// the same spot if it's free, dressed like this layer's decoys, but one character of its glyph is a z.
// What doesn't fit waits for the next layer.
function snoozeIn(lv, r) {
  const run = st.run, real = lv.tiles[lv.safe];
  const decoys = lv.tiles.filter(t => !isReal(t) && !t.loaded);
  const src = decoys.length ? decoys : lv.tiles.filter(t => !isReal(t));
  const left = [];
  for (const s of run.snoozed) {
    const free = freeCells(lv);
    if (!free.length || !src.length) { left.push(s); continue; }
    const same = s.col < lv.cols && s.row < lv.rows ? s.row * lv.cols + s.col : -1;
    const cell = free.includes(same) ? same : pickR(free, r);
    const from = pickR(src, r);
    const glyph = from.glyph.map(l => l);
    const spots = [];
    glyph.forEach((l, y) => [...l].forEach((ch, x) => { if (ch !== ' ') spots.push([y, x]); }));
    if (spots.length) { const [y, x] = pickR(spots, r); glyph[y] = glyph[y].slice(0, x) + 'z' + glyph[y].slice(x + 1); }
    const nt = Object.assign({}, from, { cell, glyph, safe: false, quantum: false, loaded: false, state: 'closed', hidden: false, probing: false, ruledOut: false, snoozed: true });
    for (const k of ['dir', 'dirPending', 'dirAt', 'klog', 'klogAt', 'eaten', 'shattered', 'cracks', 'crackAt', 'hitAt', 'lockedBy', 'slide', 'tell', 'infectAt']) delete nt[k];
    moveTile(lv, nt, cell);
    lv.tiles.push(nt);
  }
  const added = run.snoozed.length - left.length;
  run.snoozed = left;
  if (!added) return;
  lv.tiles.sort((a, b) => a.cell - b.cell);
  lv.safe = lv.tiles.indexOf(real);
  lv.n += added;
  modFired('snooze');
}

// ---- ALL-IN (EPIC item): 50/50. The layer clears on the spot (normal pay, no perfect), or two new ICE
// nodes appear: copies of a decoy already there (same glyph and marks), so the corp's tell still holds.
function allIn() {
  const run = st.run, lv = st.lv, c = st.corp;
  const r = rngFor(run.seed, 'allin', c.node.id, c.idx, (run.allins = (run.allins || 0) + 1));
  if (r() < 0.5) {
    st.busy = true; lv.scanned = true;   // no perfect
    Sound.jingle(); flash(C.money, 0.2, 0.4); shake(5);
    setMsg('> all in: the house folds. layer clear.', C.money);
    (async () => { await wait(550); if (st.lv === lv) await onSafe(lv.tiles[lv.safe]); })();
    return;
  }
  const free = freeCells(lv);
  const decoys = lv.tiles.filter(t => !isReal(t) && !t.loaded);
  const src = decoys.length ? decoys : lv.tiles.filter(t => !isReal(t));
  const real = lv.tiles[lv.safe], now = performance.now();
  let added = 0;
  for (const cell of shuffle(free, r).slice(0, 2)) {
    const from = src.length ? pickR(src, r) : real;
    const nt = Object.assign({}, from, { cell, safe: false, quantum: false, loaded: false, state: 'closed', hidden: false, probing: false, ruledOut: false, infectAt: now });
    for (const k of ['dir', 'dirPending', 'dirAt', 'klog', 'klogAt', 'eaten', 'shattered', 'cracks', 'crackAt', 'hitAt', 'lockedBy', 'slide', 'tell']) delete nt[k];
    moveTile(lv, nt, cell);
    lv.tiles.push(nt);
    setTimeout(() => { nt.infectAt = null; }, 450);   // they glitch in
    added++;
  }
  lv.tiles.sort((a, b) => a.cell - b.cell);
  lv.safe = lv.tiles.indexOf(real);
  lv.n += added; lv.iceTotal = (lv.iceTotal || 0) + added;
  st.hover = -1; st.sel = -1;
  Sound.trap(); shake(6); flash(C.danger, 0.15, 0.3);
  setMsg(added ? `> all in: busted. +${added} ICE.` : '> all in: busted. no room for more ICE.', C.danger);
}

// Every frame: an ICE EATER layer with no ICE left clears (bites, locks, items, mods: whatever ate it).
function eaterWatch() {
  const lv = st.lv;
  if (!lv || !lv.eater || st.mode !== 'play' || st.busy || st.transitioning || st.wipe || st.pause || st.dev || st.lv !== lv) return;
  const real = lv.tiles[lv.safe];
  if (!real || real.state !== 'closed' || lv.tiles.some(t => !isReal(t) && t.state === 'closed')) return;
  st.busy = true;
  onSafe(real);
}

// FAILSAFE (after blockHit caught a killing hit): the hit reads as the end first (the HUD
// shows 0 for FAILSAFE_BEAT), then it catches you.
const FAILSAFE_BEAT = 650;
async function failsafeBeat(lv) {
  if (!lv.failsafeNow) return;
  lv.failsafeNow = false;
  await wait(FAILSAFE_BEAT);
  Sound.shield(); flash(C.accent, 0.25, 0.5);
  modFired('failsafe');
  setMsg(bloodMoney() ? '> FAILSAFE: you live. broke.' : '> FAILSAFE: held at 1 integrity.', C.accent);
}
// BLACK ICE: a hit you feel. A big burst off the node, a long red flash, a hard shake.
function blackIceFx(t, i) {
  const { x, y } = tileCenter(t);
  explode(snapshot(cl => cl.own === 't' + i), x, y, { col: C.danger, power: 1.8 });
  Sound.shatter(); flash(C.danger, 0.55, 1.1); shake(16, 0.8);
}
