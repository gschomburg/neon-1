// NeoN+1 engine/active.js: Mods you tap, and items.
'use strict';
NEON_FILES.push(['engine/active.js', 'v13.61']);

// ---------------- Active mods ----------------
function nodesAhead() {
  const run = st.run, cur = run.map[run.at];
  const top = SECTOR_STEPS * (run.sector + 1);   // this sector's OMNI
  return Object.values(run.map).filter(n => n.step > cur.step && n.step < top && !run.visited.includes(n.id));
}

function modUsable(key) {
  const m = MODS[key], run = st.run;
  if (!m || !m.active || !run || st.transitioning || st.dev || st.wipe) return false;
  if (m.active === 'layer') {
    if (st.mode !== 'play' || st.busy || !st.lv || !st.corp || !st.corp.hasBoss) return false;
    if (key === 'burner') return burnerLeft() > 0 && st.lv.tiles.some(t => t.state === 'closed' && !t.safe);
    if (TAP_FX[key]) return !(st.corp.tapUsed && st.corp.tapUsed[key]) && TAP_FX[key].ok(st.lv);
  }
  return false;
}
// BURNER's uses left in this corp: 1 / 2 / 3 by tier (burnerUsed counts them; old saves have true = 1)
const burnerLeft = () => tv('burner', [1, 2, 3]) - Number((st.corp && st.corp.burnerUsed) || 0);
// Used up for now: BURNER after its uses in this corp, FAILSAFE after it saved you (until it recharges).
function modSpent(key) {
  if (key === 'burner') return !!(st.mode === 'play' && st.corp && st.corp.hasBoss && burnerLeft() <= 0);
  if (TAP_FX[key]) return !!(st.mode === 'play' && st.corp && st.corp.hasBoss && st.corp.tapUsed && st.corp.tapUsed[key]);
  if (key === 'failsafe') return !!(st.run && st.run.failsafeUsed);
  return false;
}

function activateMod(key) {
  if (!tutAllows('mod', key)) return tutNo();
  const run = st.run;
  if (!modUsable(key)) { Sound.deny(); return; }
  st.selMod = -1;
  modFired(key);   // tap-to-use: plays as you use it
  if (key === 'burner') {
    const lv = st.lv;
    let opts = lv.tiles.filter(t => t.state === 'closed' && !t.safe && !t.loaded);
    if (!opts.length) opts = lv.tiles.filter(t => t.state === 'closed' && !t.safe);
    const used = Number(st.corp.burnerUsed || 0);
    lockTile(pickR(opts, used ? rngFor(run.seed, 'burner', st.corp.node.id, st.corp.idx, used) : rngFor(run.seed, 'burner', st.corp.node.id, st.corp.idx)), C.accent, 'burner');
    st.corp.burnerUsed = used + 1;
    const left = burnerLeft();
    setMsg(left > 0 ? `> burner: 1 ICE locked (${left} left this corp).` : '> burner: 1 ICE locked.', C.accent);
  }
  if (TAP_FX[key]) {
    const c = st.corp;
    c.tapUsed = Object.assign({}, c.tapUsed, { [key]: true });
    TAP_FX[key].use(st.lv, performance.now());
  }
}
// Tap-to-use corp mods: once per corp each. ok: can it be used right now.
const iceOpen = lv => lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
const TAP_FX = {
  timewarp: {
    ok: lv => !!st.timer && !lv.clockRate,
    use(lv) { lv.clockRate = 0.5; Sound.shield(); setMsg('> timewarp: half-speed clock.', C.accent); },
  },
  anchor: {
    ok: lv => !lv.anchor && (!!st.corp.def.moves || !!st.timer),
    use(lv, now) {
      lv.anchor = true;
      if (!st.corp.def.moves) lv.holdUntil = now + 3000;
      Sound.shield(); setMsg(st.corp.def.moves ? '> anchor: nothing moves this layer.' : '> anchor: clock stopped 3s.', C.accent);
    },
  },
  espresso: {
    ok: lv => !!st.timer && !(lv.holdUntil > performance.now()),
    use(lv, now) { lv.holdUntil = now + 5000; Sound.shield(); setMsg('> espresso: clock stopped 5s.', C.accent); },
  },
  freezeframe: {
    ok: lv => !(lv.holdUntil > performance.now()),
    use(lv, now) { lv.holdUntil = now + 1000; lv.freeze = { from: now, until: now + 1000 }; Sound.shield(); setMsg('> freeze frame.', C.accent); },
  },
  sacrifice: {
    ok: lv => (zombie() || st.run.integrity > 1) && iceOpen(lv).length >= 2,
    use(lv) {
      const ice = shuffle(iceOpen(lv), rngFor(st.run.seed, 'sac', st.corp.node.id, st.corp.idx));
      hurt(1);   // ZOMBIE: rot instead
      ice.slice(0, Math.floor(ice.length / 2)).forEach(t => lockTile(t, C.money, 'sacrifice'));
      flash(C.money, 0.2, 0.5); shake(5);
      setMsg('> sacrifice: -1 int. the ICE parts.', C.money);
    },
  },
  rollup: {
    ok: lv => !lv.rolled,
    use(lv) { lv.rolled = true; Sound.shield(); setMsg('> curled up: 1 hit blocked, no pay.', C.accent); },
  },
  // FLARE: split the board down the middle (columns or rows); the half without the real
  // node lights up and its ICE is ruled out.
  flare: {
    ok: lv => iceOpen(lv).some(t => !t.ruledOut) && (lv.cols > 1 || lv.rows > 1),
    use(lv) {
      const real = lv.tiles[lv.safe], r = rngFor(st.run.seed, 'flare', st.corp.node.id, st.corp.idx);
      const byCol = lv.rows < 2 || (lv.cols > 1 && r() < 0.5), n = byCol ? lv.cols : lv.rows, at = byCol ? real.col : real.row;
      const mid = n / 2, realLow = at < mid;
      const out = iceOpen(lv).filter(t => { const v = byCol ? t.col : t.row; return realLow ? v >= Math.ceil(mid) : v < Math.floor(mid); });
      for (const t of out) t.ruledOut = true;
      flash(C.money, 0.25, 0.5); Sound.shield();
      setMsg(`> flare: ${out.length} ICE in the light.`, C.money);
    },
  },
  interrogate: {
    ok: lv => iceOpen(lv).filter(t => !t.say).length > 0,
    use(lv) {
      const t = pickR(iceOpen(lv).filter(o => !o.say), rngFor(st.run.seed, 'interrogate', st.corp.node.id, st.corp.idx));
      t.say = ['NOT', 'ME']; t.ruledOut = true;
      Sound.ui(); setMsg('> interrogate: one of them talked.', C.accent);
    },
  },
  blast: {
    ok: lv => lv.cols > 1 && lv.rows > 1 && lv.tiles.some(t => t.state === 'closed' && !t.safe),
    use(lv) {
      let best = null, bn = -1;
      const r = rngFor(st.run.seed, 'blast', st.corp.node.id, st.corp.idx);
      for (let c0 = 0; c0 < lv.cols - 1; c0++) for (let r0 = 0; r0 < lv.rows - 1; r0++) {
        const n = lv.tiles.filter(t => t.state === 'closed' && t.col >= c0 && t.col <= c0 + 1 && t.row >= r0 && t.row <= r0 + 1).length + r() * 0.5;
        if (n > bn) { bn = n; best = [c0, r0]; }
      }
      const inB = lv.tiles.filter(t => t.state === 'closed' && t.col >= best[0] && t.col <= best[0] + 1 && t.row >= best[1] && t.row <= best[1] + 1);
      shake(8); flash(C.money, 0.2, 0.4);
      for (const t of inB) if (!t.safe) lockTile(t, C.money, 'blast');
      const real = inB.find(t => t.safe);
      if (real) { lv.payCut = 1; lv.scanned = true; setMsg('> BLAST! got the real one. no pay.', C.money); st.busy = true; onSafe(real); }
      else setMsg(`> BLAST! ${inB.length} ICE gone.`, C.money);
    },
  },
  remote: {
    ok: lv => iceOpen(lv).length > 0,
    use(lv) {
      const r = rngFor(st.run.seed, 'remote', st.corp.node.id, st.corp.idx), used = new Set(lv.tiles.map(t => t.glyph));
      const deck = shuffle(MOTIFS.filter(m => !used.has(m)), r);
      iceOpen(lv).forEach((t, i) => { if (deck.length) t.glyph = deck[i % deck.length]; });
      Sound.ui(); flash(C.accent, 0.1, 0.25);
      setMsg('> remote: new channel. new decoys.', C.accent);
    },
  },
};

// Re-roll the type and corp of every node ahead (links stay the same).
function rerouteMap() {
  const run = st.run;
  const r = rngFor(run.seed, 'reroute', run.reroutes++);
  const corps = Object.keys(CORPS);
  for (const n of nodesAhead()) {
    const roll = r();
    n.type = roll < 0.6 ? 'corp' : roll < 0.75 ? 'cache' : roll < 0.88 ? 'repair' : 'shop';
    delete n.mod;
    if (n.type === 'corp') { n.corp = pickR(corps, r); n.tier = tierAt(n.sector || 0, localStep(n)); }
    else { delete n.corp; delete n.tier; }
  }
}

// TUNNEL: the nodes in your row you haven't been to (any lane, linked or not).
function rowMates() {
  const run = st.run, cur = run.map[run.at];
  return Object.values(run.map).filter(n => n.step === cur.step && n.id !== cur.id && !run.visited.includes(n.id));
}

// ---------------- Layer gear (the user, 2026-10-26) ----------------
// REWIND epic: every timer in this layer stops: the clock and the corp's own clock (ESPRESSO's hold, forever),
// and ANCHOR (what moves stays put; LAGRANGE's taps land at once).
function freezeLayer(lv) { lv.holdUntil = Infinity; lv.anchor = true; }
// Corps with their own tap rules (FORM 27B, DEMOLITION...): gear never clears the layer for you there.
const gearMayClear = () => !(st.corp && st.corp.def.tap);
// FRAG / SHOE hit the real node: the layer clears, no pay (like BLAST).
function gearClear(lv, t, msg) {
  lv.payCut = 1; lv.scanned = true;
  setMsg(msg, C.money);
  st.busy = true;
  onSafe(t);
}
// TILT: every closed node slides as far as it can, up or down (a coin flip). Nodes that are open or locked stay.
async function tiltBoard(lv) {
  const r = rngFor(st.run.seed, 'tilt', st.corp.node.id, st.corp.idx, lv.tilts = (lv.tilts || 0) + 1);
  if (lv.grav) { setMsg('> tilt: gravity takes over.', C.accent); return gravDrop(lv); }   // GRAVITAS: a free drop (the real node rises)
  const up = r() < 0.5;
  st.busy = true;
  let moved = false;
  for (let col = 0; col < lv.cols; col++) {
    const here = lv.tiles.filter(t => t.col === col);
    const fixed = new Set(here.filter(t => t.state !== 'closed').map(t => t.row));
    const movers = here.filter(t => t.state === 'closed').sort((a, b) => up ? a.row - b.row : b.row - a.row);
    const free = [...Array(lv.rows).keys()].filter(rw => !fixed.has(rw));
    if (!up) free.reverse();
    movers.forEach((t, i) => { const cell = free[i] * lv.cols + col; if (cell !== t.cell) { slideTo(lv, t, cell, 420); moved = true; } });
  }
  setMsg(`> tilt: everything slides ${up ? 'up' : 'down'}.`, C.accent);
  if (moved) { Sound.whoosh(); await wait(slideMs(420) + 40); shake(2); }
  if (st.lv === lv) st.busy = false;
}
// SHAKE: every closed node slides a step or two, to a free spot nearby (or swaps with a neighbor when packed).
async function shakeBoard(lv) {
  const r = rngFor(st.run.seed, 'shake', st.corp.node.id, st.corp.idx, lv.shakes = (lv.shakes || 0) + 1);
  st.busy = true;
  shake(4);
  if (lv.ent) { entropyShuffle(lv); setMsg('> shake: the board scrambles itself.', C.accent); }   // ENTROPY: its own shuffle, early
  else {
    const at = new Map(lv.tiles.map(t => [t.cell, t])), done = new Set();
    const near = (t, d) => {
      const out = [];
      for (let dr = -d; dr <= d; dr++) for (let dc = -d; dc <= d; dc++) {
        const c = t.col + dc, rw = t.row + dr;
        if ((dc || dr) && c >= 0 && c < lv.cols && rw >= 0 && rw < lv.rows) out.push(rw * lv.cols + c);
      }
      return out;
    };
    for (const t of shuffle(lv.tiles.filter(o => o.state === 'closed'), r)) {
      if (done.has(t)) continue;
      const free = near(t, 2).filter(c => !at.has(c));
      if (free.length) {
        const c = pickR(free, r);
        at.delete(t.cell); at.set(c, t); slideTo(lv, t, c, 380, r() < 0.5 ? 0.3 : -0.3); done.add(t);
        continue;
      }
      const mates = near(t, 1).map(c => at.get(c)).filter(o => o && o.state === 'closed' && !done.has(o));
      if (!mates.length) continue;
      const o = pickR(mates, r), a = t.cell, b = o.cell;
      at.set(a, o); at.set(b, t); slideTo(lv, t, b, 380, 0.4); slideTo(lv, o, a, 380, -0.4); done.add(t); done.add(o);
    }
    setMsg('> shake: the nodes jostle.', C.accent);
  }
  Sound.whoosh();
  await wait(slideMs(460) + 40);
  if (st.lv === lv) st.busy = false;
}
// FRAG: hits random closed nodes (3 / 4 / 5 / 5 by step). ICE breaks; the real node clears the layer, no pay
// (never at the legendary step, and never in corps with their own tap rules).
async function fragBoard(lv, tier) {
  const r = rngFor(st.run.seed, 'frag', st.corp.node.id, st.corp.idx, lv.frags = (lv.frags || 0) + 1);
  const spare = tier >= 3 || !gearMayClear();
  const pool = lv.tiles.filter(t => t.state === 'closed' && !(spare && isReal(t)));
  const hits = shuffle(pool, r).slice(0, [3, 4, 5, 5][tier] || 3);
  st.busy = true;
  Sound.trap(); shake(6); flash(C.danger, 0.15, 0.3);
  let broke = 0;
  for (const t of hits) {
    await wait(150);
    if (st.lv !== lv) return;
    shake(4);
    if (isReal(t)) return gearClear(lv, t, '> FRAG hit the real node. layer clear, no pay.');
    lockTile(t, C.danger, 'frag'); broke++;
  }
  setMsg(broke ? `> frag: ${broke} ICE down.` : '> frag: nothing to hit.', C.danger);
  await wait(120);
  if (st.lv === lv) st.busy = false;
}
// SHOE: throw it. 1%: it hits the real node (the layer clears, no pay); 10%: it breaks an ICE; else, a joke.
const SHOE_MISS = ['> you throw a shoe. the firewall is unimpressed.', '> it bounces off. a sysadmin somewhere laughs.', '> clonk.',
  '> the shoe is in the server room now. it lives there.', '> it hits nothing. you are down a shoe.', '> thunk. the ICE does not care.'];
function throwShoe(lv) {
  const run = st.run, r = rngFor(run.seed, 'shoe', st.corp.node.id, st.corp.idx, run.shoes = (run.shoes || 0) + 1), u = r();
  shake(2); Sound.tick();
  const real = lv.tiles.find(t => t.state === 'closed' && isReal(t));
  if (u < 0.01 && real && gearMayClear()) { flash(C.money, 0.3, 0.5); return gearClear(lv, real, '> THE SHOE HIT THE REAL NODE. no way. layer clear, no pay.'); }
  const ice = lv.tiles.filter(t => t.state === 'closed' && !isReal(t));
  if (u < 0.11 && ice.length) { lockTile(pickR(ice, r), C.accent, 'shoe'); setMsg('> the shoe breaks an ICE. sabotage.', C.accent); return; }
  setMsg(pickR(SHOE_MISS, r), C.mid);
}
// Take one of a gear (PASS at the uplink).
function takeItem(key) {
  const i = st.run.items.findIndex(s => s.key === key);
  if (i < 0) return false;
  if (--st.run.items[i].n <= 0) st.run.items.splice(i, 1);
  return true;
}

// ---------------- Items ----------------
// Items some corps switch off (like MOD_OFF): ALL-IN in corps with their own tap rules.
const ITEM_OFF = { allin: def => !!def.tap };
const itemOffHere = key => !!(st.mode === 'play' && st.corp && st.corp.hasBoss && ITEM_OFF[key] && ITEM_OFF[key](st.corp.def));
// Why an item can't be used right now (shown when you try): a short line for the info row.
function whyNotItem(stack) {
  const key = stack.key, inCorp = st.mode === 'play' && st.corp && st.corp.hasBoss;
  if (itemOffHere(key)) return 'off in this corp.';
  if (key === 'patch') return zombie() ? 'no rot to fix.' : 'integrity is full.';
  if (key === 'route' || key === 'warp' || key === 'tunnel' || key === 'mesh') return st.mode !== 'map' ? 'only on the map.' : st.run.warpAim || st.run.tunnel || st.run.mesh === st.run.sector ? 'already open: pick a node.' : 'nowhere to go.';
  if (key === 'pass') return 'use it on the UPLINK screen.';
  if (key === 'rewind' && inCorp && st.corp.frozen) return 'time already stopped.';
  if (key === 'rewind' && inCorp && (stack.tier || 0) < 2 && !st.timer) return 'no clock running.';
  if (key === 'wall') return 'only inside a corp.';
  if (!inCorp && key !== 'wall') return 'only inside a corp layer.';
  if (st.busy) return 'wait a moment.';
  if (key === 'split' && st.lv && st.lv.split) return 'already split this layer.';
  return 'nothing to use it on.';
}
function canUse(stack) {
  const run = st.run;
  if (!run || st.wipe || !stack) return false;
  const key = stack.key, tier = stack.tier || 0;
  if (ITEMS[key].value) return !st.transitioning;   // value gear: cash it in anywhere
  if (key === 'patch') return canHeal();
  if (key === 'wall') return tier < 2 ? true : st.mode === 'play' && !!st.corp && st.corp.hasBoss && !st.corp.wallAll;
  const onMap = st.mode === 'map' && !st.busy && !st.transitioning;
  if (key === 'route') return onMap && nodesAhead().length > 0;
  if (key === 'warp') return onMap && nodesAhead().length > 0 && !(tier >= 1 && run.warpAim);
  if (key === 'tunnel') return onMap && !run.tunnel && !!run.at && rowMates().length > 0;
  if (key === 'mesh') return onMap && run.mesh !== run.sector && nodesAhead().length > 0;
  if (key === 'pass') return false;   // on the UPLINK screen
  const inLayer = st.mode === 'play' && !st.busy && st.lv;
  if (key === 'purge') return !!inLayer && st.lv.tiles.some(t => t.state === 'closed' && !t.safe);
  if (key === 'split') return !!inLayer && !st.lv.split && candidates().length > 1;
  if (key === 'allin') return !!inLayer && st.corp.hasBoss && !itemOffHere(key) && st.lv.n > 1 && st.lv.tiles[st.lv.safe].state === 'closed';
  const layerGear = !!inLayer && !!st.corp && st.corp.hasBoss && st.lv.n > 1;
  const closed = layerGear ? st.lv.tiles.filter(t => t.state === 'closed') : [];
  if (key === 'tilt') return layerGear && st.lv.rows > 1 && closed.length > 1;
  if (key === 'shake') return layerGear && closed.length > 1;
  if (key === 'frag' || key === 'shoe') return layerGear && closed.some(t => !isReal(t));
  if (key === 'rewind') return layerGear && !st.corp.frozen && (tier >= 2 ? (!!st.timer || !!st.corp.def.tick) : !!st.timer);
  return false;
}

function useItem(slot) {
  const run = st.run;
  if (!run || st.transitioning) return;
  if (!tutAllows('item', slot)) return tutNo();
  const stack = run.items[slot];
  if (!stack) return;
  if (!canUse(stack)) {   // say why, where the info was, and shake the item
    st.itemDeny = { slot, at: performance.now(), text: whyNotItem(stack) };
    st.selItem = slot;
    Sound.deny();
    return;
  }
  const key = stack.key, tier = stack.tier || 0;
  stack.n--;
  if (stack.n <= 0) run.items.splice(slot, 1);
  st.hoverItem = -1; st.selItem = -1;
  const lv = st.lv;
  if (ITEMS[key].value) {   // value gear: half its worth, here and now (a market pays it all)
    const worth = gearValue(key, tier), cr = Math.floor(worth / 2);
    run.credits += cr; run.earned += cr;
    Sound.buy(); setMsg(`> cashed ${ITEMS[key].name.toLowerCase()}: +${cr}cr. (a market pays ${worth})`, C.money);
  }
  if (key === 'patch') {
    const before = run.integrity;
    heal(tier + 1);
    Sound.buy(); setMsg(`> patched. +${run.integrity - before} int`, C.accent);
  }
  if (key === 'wall') {
    if (tier >= 2) { st.corp.wallAll = true; setMsg('> firewall: no hits for this corp.', C.accent); }
    else { run.shield += tier + 1; setMsg(`> firewall up. FW${run.shield}`, C.accent); }
    Sound.shield();
  }
  if (key === 'purge') {
    let locked = 0;
    for (let k = 0; k <= tier; k++) {
      let opts = lv.tiles.filter(t => t.state === 'closed' && !t.safe && !t.loaded);
      if (!opts.length) opts = lv.tiles.filter(t => t.state === 'closed' && !t.safe);
      if (!opts.length) break;
      const r = rngFor(run.seed, 'purge', st.corp.node.id, st.corp.idx, lv.tiles.filter(t => t.state === 'locked').length);
      lockTile(pickR(opts, r), C.accent, 'purge');
      locked++;
    }
    setMsg(`> purged ${locked} ICE node${locked === 1 ? '' : 's'}.`, C.accent);
  }
  if (key === 'split') {
    const s = lv.tiles[lv.safe];
    if (tier === 0) {
      const vertical = rngFor(run.seed, 'split', st.corp.node.id, st.corp.idx)() < 0.5;
      for (const t of lv.tiles) {
        const sameHalf = vertical ? (t.col < lv.cols / 2) === (s.col < lv.cols / 2) : (t.row < lv.rows / 2) === (s.row < lv.rows / 2);
        if (!sameHalf) t.ruledOut = true;
      }
      setMsg(`> split: it is in the ${vertical ? (s.col < lv.cols / 2 ? 'left' : 'right') : (s.row < lv.rows / 2 ? 'top' : 'bottom')} half.`, C.accent);
    } else {
      // rare: rule out 2/3 of the ICE still in play; epic: all but one
      const ice = shuffle(lv.tiles.filter(t => t.state === 'closed' && !t.safe && !t.ruledOut), rngFor(run.seed, 'split', st.corp.node.id, st.corp.idx));
      const k = tier >= 2 ? Math.max(0, ice.length - 1) : Math.floor(ice.length * 2 / 3);
      ice.slice(0, k).forEach(t => { t.ruledOut = true; });
      setMsg(`> split: ${k} ICE ruled out.`, C.accent);
    }
    lv.split = true;
    Sound.shield();
  }
  if (key === 'allin') allIn();
  if (key === 'route') {
    rerouteMap();
    st.mapSel = null;
    st.boardStart = performance.now();
    Sound.whoosh();
    setMsg('> rerouted. the net shifts.', C.accent);
  }
  if (key === 'warp' && tier >= 1) {   // epic: you aim it
    run.warpAim = true; st.mapSel = null;
    Sound.whoosh(); setMsg('> warp open: pick any node ahead.', C.accent);
  } else if (key === 'warp') {
    const target = pickR(nodesAhead(), rngFor(run.seed, 'warp', run.at, run.depth));
    setMsg('> warp open...', C.accent);
    enterNode(target, true);
  }
  if (key === 'tunnel') { run.tunnel = true; st.mapSel = null; Sound.whoosh(); setMsg('> tunnel dug: go to any node in this row.', C.accent); }
  if (key === 'mesh') { run.mesh = run.sector; st.mapSel = null; Sound.whoosh(); setMsg('> mesh up: every node links to the next row, all sector.', C.accent); }
  if (key === 'tilt') tiltBoard(lv);
  if (key === 'shake') shakeBoard(lv);
  if (key === 'frag') fragBoard(lv, tier);
  if (key === 'shoe') throwShoe(lv);
  if (key === 'rewind') {
    const tm = st.timer;
    if (tier >= 2) { st.corp.frozen = true; freezeLayer(lv); setMsg('> rewind: time stops. for this whole corp.', C.accent); }
    else if (tier === 1) { tm.left = tm.max; tm.lastSec = Math.ceil(tm.left); setMsg('> rewind: the clock is full again.', C.accent); }
    else { tm.max += 5; tm.left += 5; tm.lastSec = Math.ceil(tm.left); setMsg('> rewind: +5 seconds.', C.accent); }
    Sound.shield();
  }
}

function toggleMute() {
  save.muted = !save.muted;
  persist();
  Sound.levels();
  Sound.ui();
}

function cyclePalette() {
  const keys = playerPalettes();
  save.palette = keys[(keys.indexOf(save.palette) + 1) % keys.length];
  refreshPalette();
  persist();
  Sound.ui();
}

// The palette for what's on screen: inside a corp, that corp's own (if corp colors
// are on); everywhere else, the player's palette from settings.
function scenePalette(corpKey) {
  if (st.run && st.run.tutorial && PALETTES[TUT.palette]) return applyPalette(TUT.palette, true, 0);   // the training run: one palette throughout
  if (EDITOR && st.editorPal && PALETTES[st.editorPal]) return applyPalette(st.editorPal, true, st.editorDark || 0);   // the palette being edited, everywhere
  const ck = corpKey && save.corpColors ? 'c_' + corpKey : null;
  const c = st.corp, dark = corpKey && c && c.def.key === corpKey && c.def.dark && st.lv ? st.lv.dark || 0 : 0;   // BLACKOUT
  applyPalette(ck && PALETTES[ck] ? ck : save.palette, false, dark);
}
const refreshPalette = () => scenePalette(st.corp && st.corp.hasBoss ? st.corp.def.key : null);
// BLACKOUT: the lights come back on (corp beaten, or you're out)
const lightsOn = () => { if (st.corp && st.corp.def.dark && st.lv && st.lv.dark) { st.lv.dark = 0; refreshPalette(); } };
const toggleCorpColors = () => { save.corpColors = !save.corpColors; persist(); refreshPalette(); Sound.ui(); };
