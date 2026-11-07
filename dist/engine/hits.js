// NeoN+1 engine/hits.js: an ICE hit: does it hurt (blockHit, the BLOCK stage), then what your mods do after it
// (HIT_FX, BOARD_FX; corps add their boss mods' with defineModFx). Moved out of engine/run.js (2026-11-05).
// Needs engine/run.js first (START_NOTE, END_FX: the last line here fills all four tables).
'use strict';
NEON_FILES.push(['engine/hits.js', 'v14.58']);

// Queue a line for after the hit (see onTrap): a mod saying what it just showed you.
// fn(now) runs as the line shows (that's when the change appears on the node).
const callout = (key, text, fn) => (st.lv.callouts = st.lv.callouts || []).push({ key, text, fn });

// BLOCK stage. Not by the bar: one fixed order, so nothing is spent when something free
// would have blocked it. Free blocks first (FORGERY, BULWARK, a corp-long firewall,
// SHATTER's chance), then FWALL charges, then the hit, and FAILSAFE last since it only
// catches a killing hit. The first block that applies stops the hit. Returns the message.
function blockHit(t, i) {
  const run = st.run, lv = st.lv;
  let msg;
  if (zombie() && !st.god) {
    addRot(ROT.ice * (t.black ? 2 : 1));   // (BLACK ICE: twice the rot)
    Sound.shatter(); shake(4);
    msg = run.integrity > 0 ? `> ICE broken. rot +${ROT.ice}.` : '> ICE broken. you fall apart.';
  } else if (st.god) {
    Sound.shield();
    msg = '> ICE. god mode: no damage.';
  } else if (hkUp('brick')) {   // BRICK (crew) takes it
    msg = hkTakeHit();
  } else if (has('forgery') && (t.loaded || (t.forged && !lv.forgeUsed))) {
    Sound.shield();
    if (!t.loaded) lv.forgeUsed = true;   // a counterfeit (HAUTE//COUTURE): one free per layer
    modFired('forgery');
    msg = t.loaded ? '> $ node. forgery: no damage.' : '> knockoff. forgery: no damage.';
  } else if (has('bulwark') && !st.corp.bulwarkUsed) {
    st.corp.bulwarkUsed = true;
    Sound.shield();
    flash(C.accent, 0.12, 0.3);
    shake(4);
    modFired('bulwark');
    msg = '> ICE. bulwark blocked it.';
  } else if (has('horoscope') && st.corp.luckyIdx === st.corp.idx && !lv.luckUsed) {
    lv.luckUsed = true;
    Sound.shield(); flash(C.accent, 0.12, 0.3);
    modFired('horoscope');
    msg = '> ICE. lucky layer: no damage.';
  } else if (has('ambush') && st.corp.hasBoss && !lv.ambushUsed && lv.shownAt != null && (lv.pickAt || 0) - lv.shownAt < 2000) {
    lv.ambushUsed = true;
    Sound.shield(); flash(C.accent, 0.12, 0.3);
    modFired('ambush');
    msg = '> ICE. ambush: too fast to hit.';
  } else if (st.corp && st.corp.wallAll) {
    Sound.shield(); flash(C.accent, 0.12, 0.3); shake(4);
    msg = '> ICE. the firewall holds.';
  } else if (has('shatter') && rngFor(run.seed, 'shatter', st.corp.node.id, st.corp.idx, lv.misses)() < 1 / 3) {
    const { x, y } = tileCenter(t);
    explode(snapshot(cl => cl.own === 't' + i), x, y, { col: C.bright, power: 0.9 });
    Sound.shatter(); flash(C.bright, 0.14, 0.3); shake(5);
    t.shattered = true;   // drawn as cracked glass, not a red hit
    modFired('shatter');
    msg = '> ICE shattered. no damage.';
  } else if (leverage() && run.credits < 0 && rngFor(run.seed, 'debt', st.corp.node.id, st.corp.idx, lv.misses)() < debtShield()) {
    // LEVERAGE: too big to fail. The deeper in debt, the more often a hit does nothing.
    Sound.shield(); flash(C.money, 0.14, 0.3); shake(4);
    modFired('leverage');
    msg = '> ICE. too big to fail.';
  } else if (has('snooze') && !modOffHere('snooze') && rngFor(run.seed, 'snooze', st.corp.node.id, st.corp.idx, lv.misses)() < 0.5) {
    // SNOOZE: no damage now; this ICE follows you into the next layer (with a z in its glyph)
    (run.snoozed = run.snoozed || []).push({ col: t.col, row: t.row });
    Sound.shield(); flash(C.accent, 0.1, 0.3);
    modFired('snooze');
    msg = '> ICE. snoozed: later.';
  } else if (lv.rolled) {   // ROLLUP (gear): every hit, the rest of the layer
    lv.payCut = 1;
    Sound.shield(); flash(C.accent, 0.14, 0.3); shake(4);
    msg = '> ICE. rolled up: no damage.';
  } else if (has('icebox') && st.corp.hasBoss && st.corp.idx === 0 && !lv.iceboxUsed) {
    lv.iceboxUsed = true;
    Sound.shield(); flash(C.accent, 0.12, 0.3);
    modFired('icebox');
    msg = '> ICE. icebox: no damage.';
  } else if (has('leadlining') && lv.boss && !lv.leadUsed) {
    lv.leadUsed = true;
    Sound.shield(); flash(C.accent, 0.12, 0.3);
    modFired('leadlining');
    msg = '> ICE. lead lining: no damage.';
  } else if (has('greenwave') && st.timer && Math.ceil(st.timer.left) % 2 === 0) {
    Sound.shield(); flash(C.accent, 0.12, 0.3);
    modFired('greenwave');
    msg = '> ICE. green wave: no damage.';
  } else if (has('omerta') && canSpend(omertaCost())) {
    const cost = omertaCost();
    run.credits -= cost;
    Sound.shield(); flash(C.money, 0.1, 0.3);
    modFired('omerta');
    msg = `> ICE. omerta: -${cost}cr. say nothing.`;
  } else if ((msg = corpHook('block', t, lv))) {
    // a corp's own rule took the hit (the message is set)
  } else if (has('friendship') && !st.corp.friendUsed && canSpend(costInt(ECON.friendship))) {
    st.corp.friendUsed = true; run.credits -= costInt(ECON.friendship);
    Sound.shield(); flash(C.accent, 0.1, 0.3);
    modFired('friendship');
    msg = `> ICE. friendship: -${costInt(ECON.friendship)}cr instead.`;
  } else if (has('inversion') && st.corp.hasBoss && !st.corp.invUsed) {
    st.corp.invUsed = true;
    heal(1);
    Sound.shield(); flash(C.accent, 0.16, 0.35);
    modFired('inversion');
    msg = '> ICE. inversion: +1 int.';
  } else if (run.shield > 0) {
    run.shield--;
    Sound.shield();
    flash(C.accent, 0.12, 0.3);
    shake(4);
    msg = '> ICE. firewall absorbed it.';
  } else {
    let raw = corpHas('hitDmg') ? Math.max(lv.dmg, corpHook('hitDmg', t, lv)) : lv.dmg;   // GRIDLOCK: red hits for 2
    if (t.black) raw = Math.max(0, run.integrity - 1);   // BLACK ICE: down to 1 INT, never below (BLOOD MONEY: that many hits)
    const dmg = has('grounded') && raw >= 2 ? raw - 1 : raw;   // GROUNDED
    if (dmg < raw) modFired('grounded');
    if (t.black) blackIceFx(t, i);
    if (bloodMoney()) {   // BLOOD MONEY: the hit costs credits
      if (!dmg) return '> BLACK ICE. nothing left to take.';
      const cost = payBlood(dmg);
      Sound.trap(); shake(9); flash(C.money, 0.18, 0.35);
      msg = run.integrity > 0 ? `> ICE. -${cost}cr. blood money.` : '> ICE. you can\x27t pay.';
      return msg;
    }
    run.integrity -= dmg;
    Sound.trap();
    shake(9);
    flash(C.danger, 0.18, 0.35);
    msg = t.black ? (dmg ? `> BLACK ICE. down to ${run.integrity}.` : '> BLACK ICE. nothing left to take.')
      : run.integrity > 0 ? `> ICE. integrity -${dmg}.` : '> ICE. integrity gone.';
    // FAILSAFE: a killing hit (once, then it recharges each stage / legendary each corp) leaves you at 1 (failsafeBeat plays it out: the HUD
    // shows 0 until st.fsAt + FAILSAFE_BEAT, then the save)
    if (run.integrity <= 0 && has('failsafe') && !run.failsafeUsed) {
      run.failsafeUsed = true; run.integrity = 1;
      st.fsAt = performance.now(); lv.failsafeNow = true;
    }
  }
  return msg;
}

// HIT stage: what each mod does after an ICE hit (t = the node you hit).
const HIT_FX = {
  tracer(t) {
    // which way the real node is: level 1 the bigger direction (coin flip when even), level 2 both
    const lv = st.lv, s = lv.tiles[lv.safe], dx = Math.sign(s.col - t.col), dy = Math.sign(s.row - t.row);
    const gx = Math.abs(s.col - t.col), gy = Math.abs(s.row - t.row);
    if (modTier('tracer') >= 1) t.dir = { h: dx, v: dy };
    else if (gx > gy || (gx === gy && layerRng('tracer', lv.misses)() < 0.5)) t.dir = { h: dx, v: 0 };
    else t.dir = { h: 0, v: dy };
    // the arrows show up (blinking) with the callout, after the hit
    t.dirPending = true;
    const words = [t.dir.v < 0 ? 'up' : t.dir.v > 0 ? 'down' : '', t.dir.h < 0 ? 'left' : t.dir.h > 0 ? 'right' : ''].filter(Boolean);
    callout('tracer', `> tracer: real node is ${words.join('+')}.`, now => { t.dirAt = now; });
  },
  keylogger(t) {
    if (t.loaded) return false;
    // the real node's glyph, line by line: level 1 one line per miss, 2 two lines, 3 all of it
    const lv = st.lv, g = lv.tiles[lv.safe].glyph, per = [1, 2, 3][modTier('keylogger')], k = lv.klog || 0;
    lv.klog = k + 1;
    const from = k * per;
    t.glyph = g.map((line, r) => from >= 3 || (r >= from && r < from + per) ? line : ' '.repeat(line.length));
    t.klog = true;
    // the key line types in with the callout, after the hit
    const names = ['top', 'middle', 'bottom'], got = from >= 3 || per >= 3 ? null : names.slice(from, from + per);
    callout('keylogger', got ? `> keylogger: real node's ${got.join('+')} line.` : "> keylogger: the real node's glyph.", now => { t.klogAt = now; });
  },
};

// BOARD stage: mods that change the grid after a hit.
const BOARD_FX = {
  // VIRUS: the infection spreads to one ICE node right next to the one you hit. Legendary: it keeps going,
  // one node at a time, into ICE touching any node it took, up to 4 (never the last ICE: you still pick).
  async virus(t, chain = null) {
    const lv = st.lv;
    const from = chain || [t];
    const near = o => from.some(f => Math.abs(o.col - f.col) + Math.abs(o.row - f.row) === 1);
    const nb = lv.tiles.filter(o => o.state === 'closed' && !o.safe && near(o));
    if (!nb.length) return;
    const n = chain ? chain.length - 1 : 0;   // how many it has taken so far
    // the node next to it glitches a moment (infecting), then locks
    const v = pickR(nb, rngFor(st.run.seed, n ? 'virus' + (n + 1) : 'virus', st.corp.node.id, st.corp.idx, lv.misses));
    v.infectAt = performance.now();
    modFired('virus');
    Sound.probe();
    setMsg('> virus: spreading...', C.accent);
    await wait(420);
    v.infectAt = null;
    if (v.state !== 'closed') return;
    lockTile(v, C.accent, 'virus');
    setMsg(n ? `> virus: ${n + 1} nodes infected.` : '> virus: infected the next node.', C.accent);
    await wait(n ? 300 : 450);
    // legendary: on through touching ICE, up to 4 (and never the last ICE)
    if (tv('virus', [1, 4]) > n + 1 && lv.tiles.filter(o => o.state === 'closed' && !o.safe).length > 1) await BOARD_FX.virus(t, from.concat(v));
  },
};
// The corps' own boss mods register their effects in their corp files (defineModFx, engine/corpkit.js).
for (const [k, f] of Object.entries(MOD_FX)) { if (f.note) START_NOTE[k] = f.note; if (f.end) END_FX[k] = f.end; if (f.hit) HIT_FX[k] = f.hit; if (f.board) BOARD_FX[k] = f.board; }
