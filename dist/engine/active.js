// NeoN+1 engine/active.js: Mods you tap, and items.
'use strict';
NEON_FILES.push(['engine/active.js', 'v13.73']);

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
  }
  return false;
}
// BURNER's uses left in this corp: 1 / 2 / 3 by tier (burnerUsed counts them; old saves have true = 1)
const burnerLeft = () => tv('burner', [1, 2, 3]) - Number((st.corp && st.corp.burnerUsed) || 0);
// Used up for now: BURNER after its uses in this corp, FAILSAFE after it saved you (until it recharges).
function modSpent(key) {
  if (key === 'burner') return !!(st.mode === 'play' && st.corp && st.corp.hasBoss && burnerLeft() <= 0);
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
}
// ---------------- Boss gear (the user, 2026-10-27) ----------------
// The tap-to-use corp mods became gear: stacks you win from that corp's boss (data/mods.js: ITEMS with corp:,
// the corp's def: gear { key, n }). ok: can it be used in this layer; why: what it says when it can't; use: do it.
const iceOpen = lv => lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
const gearRng = (key, lv) => rngFor(st.run.seed, key, st.corp.node.id, st.corp.idx, lv.gearUses = (lv.gearUses || 0) + 1);
const BOSS_GEAR = {
  slomo: {
    ok: () => !!st.timer && !st.corp.slomo,
    why: () => st.timer ? 'already in slomo.' : 'no clock running.',
    use(lv) { st.corp.slomo = true; lv.clockRate = 0.5; Sound.shield(); setMsg('> slomo: half-speed clock, this whole corp.', C.accent); },
  },
  anchor: {
    ok: lv => st.corp.def.moves ? !st.corp.anchored : !!st.timer && !(lv.holdUntil > performance.now()),
    why: () => st.corp.def.moves ? 'already anchored.' : 'nothing moves, no clock.',
    use(lv, now) {
      if (st.corp.def.moves) { st.corp.anchored = true; lv.anchor = true; setMsg('> anchor: nothing moves, this whole corp.', C.accent); }
      else { lv.holdUntil = now + 5000; setMsg('> anchor: nothing moves here. clock stopped 5s.', C.accent); }
      Sound.shield();
    },
  },
  freeze: {
    ok: lv => !(lv.holdUntil > performance.now()),
    why: () => 'already frozen.',
    use(lv, now) { lv.holdUntil = now + 2000; lv.freeze = { from: now, until: now + 2000 }; Sound.shield(); setMsg('> freeze frame. what still moves?', C.accent); },
  },
  tithe: {
    ok: lv => gearMayClear() && (zombie() || st.run.integrity > 1) && lv.tiles[lv.safe].state === 'closed',
    why: () => !gearMayClear() ? 'off in this corp.' : 'not with your last integrity.',
    use(lv) {
      hurt(1);   // ZOMBIE: rot instead
      lv.tithe = true;   // the layer counts as a perfect (onSafe)
      flash(C.money, 0.25, 0.6); shake(5); Sound.shield();
      setMsg('> tithe: -1 int. the layer is given to you.', C.money);
      st.busy = true;
      onSafe(lv.tiles[lv.safe]);
    },
  },
  rollup: {
    ok: lv => !lv.rolled,
    why: () => 'already curled up.',
    use(lv) { lv.rolled = true; lv.payCut = 1; Sound.shield(); setMsg('> curled up: no hits this layer. no pay.', C.accent); },
  },
  // FLARE: the board is cut in half both ways; the 3 quarters without the real node light up and their ICE is
  // ruled out (a board one row or column wide: halves).
  flare: {
    ok: lv => iceOpen(lv).some(t => !t.ruledOut) && (lv.cols > 1 || lv.rows > 1),
    why: () => 'nothing left to light.',
    use(lv) {
      const real = lv.tiles[lv.safe];
      const away = (n, at, v) => { if (n < 2) return false; const mid = n / 2; return at < mid ? v >= Math.ceil(mid) : v < Math.floor(mid); };
      const out = iceOpen(lv).filter(t => !t.ruledOut && (away(lv.cols, real.col, t.col) || away(lv.rows, real.row, t.row)));
      for (const t of out) t.ruledOut = true;
      flash(C.money, 0.3, 0.6); Sound.shield();
      setMsg(`> flare: ${out.length} ICE in the light.`, C.money);
    },
  },
  // SNITCH: one ICE says NOT ME, with an arrow toward the real node (from where it sits now).
  snitch: {
    ok: lv => iceOpen(lv).some(t => !t.say),
    why: () => 'nobody left to talk.',
    use(lv) {
      const real = lv.tiles[lv.safe], t = pickR(iceOpen(lv).filter(o => !o.say), gearRng('snitch', lv));
      const dr = Math.sign(real.row - t.row), dc = Math.sign(real.col - t.col);
      t.say = ['NOT', 'ME', (dr < 0 ? '^' : dr > 0 ? 'v' : '') + (dc < 0 ? '<' : dc > 0 ? '>' : '')];
      t.ruledOut = true;
      Sound.ui(); setMsg('> snitch: one of them talked. it points.', C.accent);
    },
  },
  // BLAST: arm it; the next tap on a node picks where it goes off (blastAt).
  blast: {
    ok: lv => lv.cols > 1 && lv.rows > 1 && !lv.blastAim && lv.tiles.some(t => t.state === 'closed' && !isReal(t)),
    why: lv => lv.blastAim ? 'armed: tap a node.' : 'no room for a 2x2.',
    use(lv) { lv.blastAim = true; Sound.tick(); setMsg('> blast armed: tap a node. its 2x2 goes up.', C.money); },
  },
  remote: {
    ok: lv => iceOpen(lv).length > 0,
    why: () => 'nothing to re-roll.',
    use(lv) {
      const used = new Set(lv.tiles.map(t => t.glyph)), deck = shuffle(MOTIFS.filter(m => !used.has(m)), gearRng('remote', lv));
      iceOpen(lv).forEach((t, i) => { if (deck.length) t.glyph = deck[i % deck.length]; });
      Sound.ui(); flash(C.accent, 0.1, 0.25);
      setMsg('> remote: new channel. new decoys.', C.accent);
    },
  },
  bees: {
    ok: lv => iceOpen(lv).length > 0,
    why: () => 'no ICE for the bees.',
    use(lv) { st.corp.bees = true; beeSwarm(lv, 3); },
  },
};
// BLAST, aimed: of the 2x2 blocks with the tapped node in them, the busiest goes up. Its ICE breaks; the real node
// in it clears the layer, no pay (not in corps with their own tap rules: there it's spared).
function blastAt(lv, t) {
  lv.blastAim = false;
  const inBlock = (c0, r0) => lv.tiles.filter(o => o.state === 'closed' && o.col >= c0 && o.col <= c0 + 1 && o.row >= r0 && o.row <= r0 + 1);
  let best = null;
  for (const c0 of [t.col - 1, t.col]) for (const r0 of [t.row - 1, t.row]) {
    if (c0 < 0 || r0 < 0 || c0 > lv.cols - 2 || r0 > lv.rows - 2) continue;
    const b = inBlock(c0, r0);
    if (!best || b.length > best.length) best = b;
  }
  best = best || [t];
  shake(8); flash(C.money, 0.2, 0.4); Sound.trap();
  const ice = best.filter(o => !isReal(o));
  for (const o of ice) lockTile(o, C.money, 'blast');
  const real = best.find(o => isReal(o));
  if (real && gearMayClear()) return gearClear(lv, real, '> BLAST! got the real one. layer clear, no pay.');
  setMsg(`> BLAST! ${ice.length} ICE gone.`, C.money);
}
// BEES: the swarm climbs the board from the bottom and eats ICE, one at a time (never the real node).
// quiet: a later layer of the same corp (1 ICE).
async function beeSwarm(lv, n, quiet = false) {
  const ice = shuffle(iceOpen(lv), rngFor(st.run.seed, 'bees', st.corp.node.id, st.corp.idx, lv.beeRuns = (lv.beeRuns || 0) + 1)).slice(0, n).sort((a, b) => b.row - a.row);
  if (!ice.length) return;
  st.busy = true;
  setMsg(quiet ? '> the bees are still here. bzz.' : '> BEES. (the bees are not real.)', C.money);
  for (const t of ice) {
    await wait(quiet ? 160 : 260);
    if (st.lv !== lv) return;
    if (t.state !== 'closed') continue;
    Sound.tick(); lockTile(t, C.money, 'bees');
  }
  await wait(120);
  if (st.lv !== lv) return;
  st.busy = false;
  if (!quiet) setMsg(`> the swarm ate ${ice.length} ICE. bzzz.`, C.money);
}

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
// REWIND epic: every clock in this layer stops: yours and the corp's own (a hold, forever). What moves still moves (ANCHOR).
function freezeLayer(lv) { lv.holdUntil = Infinity; }
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
  if (BOSS_GEAR[key] && st.lv && st.lv.n > 1) return BOSS_GEAR[key].why(st.lv);
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
  if (BOSS_GEAR[key]) return layerGear && BOSS_GEAR[key].ok(st.lv);
  return false;
}

// ---- Gear: a tap, or dragged to the TRASH (the user, 2026-10-28). A drag on a gear item brings up [ TRASH ] centered
// on the line above the mod row; drop it there and one of it is gone (one at a time from a stack). No money, no undo:
// the terminal says it's trashed. Anywhere in a run (layers too: the clock keeps going); not in the training.
const gearDragOk = () => !!(st.run && !st.tut && !st.mp && !st.transitioning && !st.pause && !st.dev);
function gearRelease(gp) {
  if (!gp.moved) {   // a tap: two-tap mode shows its info first, then uses it
    st.selMod = -1;
    if (save.tapMode === 'one' || st.selItem === gp.i) useItem(gp.i);
    else { st.selItem = gp.i; Sound.tick(); }
    return;
  }
  st.selItem = -1;
  if (gearOverTrash()) trashItem(gp.i);
}
// The TRASH: its spot (cells), and whether the pointer is over it (a generous target: a row above and below too)
function trashSpot() { const w = 11; return { x: Math.floor((L.wc - w) / 2), y: BOARD_Y + L.gh + 1, w }; }   // (the rule line above the mod row)
function gearOverTrash() {
  if (!st.ptr) return false;
  const t = trashSpot(), cx = (st.ptr.x - L.ox) / L.cw, cy = (st.ptr.y - L.oy) / L.chh;
  return cx >= t.x - 3 && cx <= t.x + t.w + 3 && cy >= t.y - 1.5 && cy <= t.y + 2;
}
function trashItem(slot) {
  const run = st.run, stack = run && run.items[slot];
  if (!stack || !gearDragOk()) return;
  const name = ITEMS[stack.key].name;
  if (--stack.n <= 0) run.items.splice(slot, 1);
  st.selItem = -1; st.hoverItem = -1;
  Sound.trash();
  setMsg(`> trashed ${name.toLowerCase()}.`, C.mid);
  if (!reduced()) {   // it crumbles into the bin
    const t = trashSpot(), col = rarityCol(ITEMS[stack.key].rarity);
    const cells = [...('[' + name + ']')].map((ch, i) => ({ ch, x: pxX(t.x + t.w / 2 - name.length / 2 + i), y: pxY(t.y), col }));
    explode(cells, pxX(t.x + t.w / 2), pxY(t.y + 0.5), { power: 0.35, grav: 1.2, life: [0.3, 0.6] });
  }
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
  tally('gear');   // THE RECORD (engine/feats.js)
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
  if (BOSS_GEAR[key]) BOSS_GEAR[key].use(lv, performance.now());
  if (key === 'rewind') {
    const tm = st.timer;
    if (tier >= 2) { st.corp.frozen = true; freezeLayer(lv); setMsg('> rewind: every clock stops. for this whole corp.', C.accent); }
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
