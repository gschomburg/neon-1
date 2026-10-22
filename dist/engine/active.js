// NeoN+1 engine/active.js: Mods you tap, and items.
'use strict';
NEON_FILES.push(['engine/active.js', 'v13.02']);

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
    if (key === 'burner') return !st.corp.burnerUsed && st.lv.tiles.some(t => t.state === 'closed' && !t.safe);
    if (TAP_FX[key]) return !(st.corp.tapUsed && st.corp.tapUsed[key]) && TAP_FX[key].ok(st.lv);
  }
  return false;
}
// Used up for now: BURNER after its use in this corp, FAILSAFE after it saved you.
function modSpent(key) {
  if (key === 'burner') return !!(st.mode === 'play' && st.corp && st.corp.hasBoss && st.corp.burnerUsed);
  if (TAP_FX[key]) return !!(st.mode === 'play' && st.corp && st.corp.hasBoss && st.corp.tapUsed && st.corp.tapUsed[key]);
  if (key === 'failsafe') return !!(st.run && st.run.failsafeUsed);
  return false;
}

function activateMod(key) {
  const run = st.run;
  if (!modUsable(key)) { Sound.deny(); return; }
  st.selMod = -1;
  modFired(key);   // tap-to-use: plays as you use it
  if (key === 'burner') {
    const lv = st.lv;
    let opts = lv.tiles.filter(t => t.state === 'closed' && !t.safe && !t.loaded);
    if (!opts.length) opts = lv.tiles.filter(t => t.state === 'closed' && !t.safe);
    lockTile(pickR(opts, rngFor(run.seed, 'burner', st.corp.node.id, st.corp.idx)), C.accent, 'burner');
    st.corp.burnerUsed = true;
    setMsg('> burner: 1 ICE locked.', C.accent);
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

// ---------------- Items ----------------
// Items some corps switch off (like MOD_OFF): ALL-IN in corps with their own tap rules.
const ITEM_OFF = { allin: def => !!def.tap };
const itemOffHere = key => !!(st.mode === 'play' && st.corp && st.corp.hasBoss && ITEM_OFF[key] && ITEM_OFF[key](st.corp.def));
// Why an item can't be used right now (shown when you try): a short line for the info row.
function whyNotItem(stack) {
  const key = stack.key, inCorp = st.mode === 'play' && st.corp && st.corp.hasBoss;
  if (itemOffHere(key)) return 'off in this corp.';
  if (key === 'patch') return zombie() ? 'no rot to fix.' : 'integrity is full.';
  if (key === 'route' || key === 'warp') return st.mode !== 'map' ? 'only on the map.' : 'nowhere to go.';
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
  if (key === 'patch') return canHeal();
  if (key === 'wall') return tier < 2 ? true : st.mode === 'play' && !!st.corp && st.corp.hasBoss && !st.corp.wallAll;
  if (key === 'route' || key === 'warp') return st.mode === 'map' && !st.busy && !st.transitioning && nodesAhead().length > 0;
  const inLayer = st.mode === 'play' && !st.busy && st.lv;
  if (key === 'purge') return !!inLayer && st.lv.tiles.some(t => t.state === 'closed' && !t.safe);
  if (key === 'split') return !!inLayer && !st.lv.split && candidates().length > 1;
  if (key === 'allin') return !!inLayer && st.corp.hasBoss && !itemOffHere(key) && st.lv.n > 1 && st.lv.tiles[st.lv.safe].state === 'closed';
  return false;
}

function useItem(slot) {
  const run = st.run;
  if (!run || st.transitioning) return;
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
  if (key === 'warp') {
    const target = pickR(nodesAhead(), rngFor(run.seed, 'warp', run.at, run.depth));
    setMsg('> warp open...', C.accent);
    enterNode(target, true);
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
  if (EDITOR && st.editorPal && PALETTES[st.editorPal]) return applyPalette(st.editorPal, true, st.editorDark || 0);   // the palette being edited, everywhere
  const ck = corpKey && save.corpColors ? 'c_' + corpKey : null;
  const c = st.corp, dark = corpKey && c && c.def.key === corpKey && c.def.dark && st.lv ? st.lv.dark || 0 : 0;   // BLACKOUT
  applyPalette(ck && PALETTES[ck] ? ck : save.palette, false, dark);
}
const refreshPalette = () => scenePalette(st.corp && st.corp.hasBoss ? st.corp.def.key : null);
// BLACKOUT: the lights come back on (corp beaten, or you're out)
const lightsOn = () => { if (st.corp && st.corp.def.dark && st.lv && st.lv.dark) { st.lv.dark = 0; refreshPalette(); } };
const toggleCorpColors = () => { save.corpColors = !save.corpColors; persist(); refreshPalette(); Sound.ui(); };
