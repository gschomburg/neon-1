// NeoN+1 engine/run.js: The run: corps, layers, picks, hits, mod effects by stage, sector clear.
'use strict';
NEON_FILES.push(['engine/run.js', 'v13.15']);

// ---------------- Run flow ----------------
function showTitle() {
  st.run = null; st.corp = null; st.lv = null; st.timer = null; st.dying = false;
  st.savedRun = savedRun(); st.newArmed = false;
  st.panelFn = null;
  scenePalette(null);
  showBoard('title');
  st.busy = false;
  setMsg('> link ready_');
}

function rerollSeed() {
  st.seed = newSeed();
  st.practice = false;
  Sound.ui();
  setMsg('> new seed rolled.');
}

async function startRun(seed, practice) {
  if (st.transitioning) return;
  st.transitioning = true;
  Sound.ui();
  await wipeOut(0);
  st.seed = seed; st.practice = practice;
  st.run = {
    seed, practice,
    map: genMap(seed),
    finalTell: pickR(['corner', 'mark', 'mirror'], rngFor(seed, 'final')),
    at: '0:1', visited: ['0:1'],
    integrity: CONFIG.startIntegrity + legacyLv('hard'), maxInt: CONFIG.startIntegrity + legacyLv('hard'), shield: 0,
    credits: 25 * legacyLv('cash'), earned: 0, items: CONFIG.startItems.map(key => ({ key, tier: 0, n: 1 })), mods: [], modTier: {},
    beltSlots: CONFIG.beltSlots + legacyLv('belt'), reroutes: 0,
    depth: 0, corps: 0, sector: 0, sectorsCleared: 0, resumes: 0, pending: null,
  };
  if (legacyLv('kit')) st.run.items.push({ key: 'patch', tier: 0, n: 1 });
  for (const x of st.run.items) markSeen(x.key);
  clearRun();
  st.result = null;
  st.transitioning = false;
  // Straight into the public net; the map comes after.
  startCorp(st.run.map['0:1']);
}

function toMap(fromSector) {
  st.corp = null; st.lv = null; st.timer = null;
  scenePalette(null);
  st.mapSel = null; st.hoverNode = null;
  st.run.pending = null;
  showBoard('map');
  // The map shows one sector at a time; scrolling moves a whole sector, line by line.
  const target = sectorViewRow(st.run.sector);
  st.mapView = { sector: st.run.sector, row: fromSector != null ? sectorViewRow(fromSector) : target, target, t: 0 };
  st.scroll = d => scrollMapSector(d > 0 ? -1 : 1);   // wheel / swipe down = older sectors
  st.busy = false;
  setMsg(st.run.sector ? `> sector ${st.run.sector + 1}. choose your next target.` : '> choose your next target.');
  saveRun();
  adBreak('map');   // maybe an ad, over the map
}

// Map rows count down from the top of the whole map; a sector view starts at its OMNI.
const sectorViewRow = v => (mapTop(st.run.map) - SECTOR_STEPS * (v + 1)) * 3;
function scrollMapSector(d) {
  const mv = st.mapView, run = st.run;
  if (!mv || st.mode !== 'map') return;
  if (mv.row !== mv.target) return;   // let the last scroll finish
  const v = clamp(mv.sector + d, 0, run.sector);
  if (v === mv.sector) { Sound.deny(); return; }
  mv.sector = v; mv.target = sectorViewRow(v);
  if (v !== run.sector) st.mapSel = null;
}
// Called every frame: move the view one map row at a time toward its target.
function stepMapView(now) {
  const mv = st.mapView;
  if (!mv || mv.row === mv.target) return;
  if (now - mv.t < 22) return;
  mv.t = now;
  mv.row += Math.sign(mv.target - mv.row);
  if (mv.row % 3 === 0) Sound.tick();
}

function selectNode(id) {
  if (st.transitioning || !availableNodes().includes(id)) return;
  if (st.mapSel === id) return enterNode(st.run.map[id]);
  st.mapSel = id;
  Sound.ui();
}

async function enterNode(node, warp = false) {
  if (st.transitioning || !node || (!warp && !availableNodes().includes(node.id))) return;
  st.transitioning = true;
  const run = st.run;
  await wipeOut(0);
  run.at = node.id;
  run.visited.push(node.id);
  st.transitioning = false;
  if (node.type === 'shop') return openShop(node);
  if (node.type === 'cache') return openCache(node);
  if (node.type === 'repair') return openRepair(node);
  startCorp(node);
}

async function startCorp(node, startIdx = 0, restore = null) {
  let def = corpDef(node.corp);
  if (node.type === 'final' && node.corp === 'omni') {   // OMNI copies one corp you beat in this sector
    const pool = ((st.run.beat || {})[node.sector || 0] || []).filter(k => CORPS[k]);
    if (pool.length) def = omniCopy(pickR(pool, rngFor(st.run.seed, 'omnicopy', node.sector || 0)), pool);
  }
  const t = node.tier;
  const counts = node.type === 'start' ? [1] : Array.from({ length: CONFIG.corpLayers }, (_, i) => clamp(t + 1 + i + (def.nodes || 0), 2, CONFIG.maxNodes));
  const sector = node.sector || 0;
  // OMNI borrows a tell, a new one each sector
  let tell = node.type === 'final' && node.corp === 'omni' && !def.copied ? ((node.sector || 0) === 0 ? st.run.finalTell : pickR(['corner', 'mark', 'mirror'], rngFor(st.run.seed, 'final', node.sector))) : def.tell;
  if (tell === 'mirror' && t >= 2) tell = 'vmirror';   // deeper Mirrorlines mirror top-bottom
  if (tell === 'corner' && t >= 2 && node.type !== 'final') tell = 'edge';   // deeper Perimeters: anywhere on the edge (OMNI keeps corners)
  let mark = null;
  if (tell === 'mark') {
    const level = clamp(t, 1, 3);
    mark = { level, glyph: level === 1 ? pickR(MOTIFS, rngFor(st.run.seed, 'sigil', node.id)) : null };
  }
  st.corp = {
    def, node, tier: t, idx: Math.min(startIdx, counts.length - 1), counts,
    hasBoss: node.type !== 'start',
    tell, mark, mod: (node.type === 'corp' || node.type === 'final') && CORP_MODS[node.mod] ? node.mod : null,
    stageBoss: node.type === 'final' && node.corp !== 'omni',
    timer: def.timer ? Math.max(6, corpTimer(def, t) - sector) : 0, pay: corpPay(def, t),
    sector, tellStr: Math.max(0.55, CONFIG.tellStrength - CONFIG.sectorHeat * sector),
    prevSafe: null,
  };
  if (restore) {   // a resumed save: what this corp had used up so far
    for (const k of ['prevSafe', 'bulwarkUsed', 'burnerUsed', 'wallAll', 'ice', 'perfects', 'scored', 'carry', 'pins', 'friendUsed', 'tapUsed', 'rad', 'ride', 'tickets', 'stolen', 'rival']) if (restore[k] != null) st.corp[k] = restore[k];
  }
  if (st.corp.hasBoss) {
    // MUTATE: this corp, it counts as a random other mod.
    if (st.run.mods.includes('mutate')) {
      const pool = modsOfKind('gen', 'minor').filter(k => !st.run.mods.includes(k) && !['buffer', 'stash', 'burner'].includes(k));
      st.run.mutateAs = pickR(pool, rngFor(st.run.seed, 'mutate', node.id));
    }
    // HOROSCOPE: one lucky layer per corp
    st.corp.luckyIdx = Math.floor(rngFor(st.run.seed, 'lucky', node.id)() * counts.length);
    st.corp.jackIdx = Math.floor(rngFor(st.run.seed, 'jack', node.id)() * counts.length);
    st.corp.petIdx = Math.floor(rngFor(st.run.seed, 'pet', node.id)() * counts.length);
    if (!restore && def.onEnter) def.onEnter(st.corp);
  }
  // Corps use their own colors; the public net uses the player's.
  scenePalette(node.type === 'start' ? null : def.key);
  // A short boot-up screen first (skipped for dev boss jumps).
  if (st.corp.hasBoss) markSeen('corp_' + def.key);   // codex: corp found
  if (st.corp.hasBoss && startIdx === 0) await corpIntro();
  enterLayer();
}

// Boss entrance (~2.5s, tap / any key skips): the calm (empty screen, music muffled),
// the warning (red text types in, alarms, red pulses, the shake grows), the build
// (riser + roll), then the caller slams the board in.
async function bossEntrance(c, n) {
  st.wipe = null;
  st.bossIntro = { t0: performance.now(), name: c.def.name, line: (c.def.bossDesc || '').replace(/^boss: /, ''), n, skip: false };
  Music.muffle(true);
  const bi = st.bossIntro;
  const hold = async ms => { const end = performance.now() + ms; while (performance.now() < end && !bi.skip) await wait(30); };
  await hold(450);                                                     // the calm
  for (let i = 0; i < 3 && !bi.skip; i++) {                            // the warning
    Sound.alarm(); shake(2 + i * 2, 0.35); flash(C.danger, 0.1 + i * 0.04, 0.3);
    await hold(480);
  }
  if (!bi.skip) { bi.buildAt = performance.now(); Sound.bossBuild(); shake(7, 0.6); await hold(560); }   // the build
  st.bossIntro = null;
  Music.muffle(false);
}

function buildBossIntro(ctx, now) {
  const bi = st.bossIntro, e = now - bi.t0;
  const typed = (text, at, speed = 28) => text.slice(0, clamp(Math.floor((e - at) / speed), 0, text.length)).padEnd(text.length);
  const lines = [];
  if (e > 450) lines.push({ text: typed('!! WARNING !!', 450), col: Math.floor(now / 200) % 2 ? C.danger : C.bright, bold: true });
  if (e > 450) lines.push({ text: '' });
  if (e > 900) lines.push({ text: typed(`${bi.name} // BOSS`, 900), col: C.danger, bold: true });
  if (e > 1300) lines.push({ text: typed(bi.line, 1300, 18), col: C.text });
  if (e > 1300) lines.push({ text: '' });
  if (e > 1750) lines.push({ text: typed(`${bi.n} nodes. one is real.`, 1750, 18), col: C.mid });
  // red pulses behind it, growing through the build
  const pulse = e < 450 ? 0 : bi.buildAt ? 0.12 + 0.3 * Math.min(1, (now - bi.buildAt) / 560) : 0.1 * (0.5 + 0.5 * Math.sin(e / 90));
  if (pulse > 0) for (let r = 0; r < L.hc; r++) ctx.bg(0, r, L.wc, C.danger, pulse * (r % 2 ? 0.8 : 1));
  if (lines.length) buildTextBoard(ctx, lines, { top: 0, h: L.hc });
}

// Corp intro: art, name, quote, a few boot lines. Tap or any key skips.
async function corpIntro() {
  const c = st.corp, def = c.def;
  const art = CORP_ART[def.key] || [];
  const artW = Math.max(0, ...art.map(l => l.length));
  const rules = corpRules(def, c.tier);
  const boot = [
    [`> connecting to ${def.name.toLowerCase().replace(/[^a-z/]+/g, '.')}`, C.mid],
    ['> handshake ............... ok', C.mid],
    [`> mapping ${c.counts.length - 1} layers + boss .... ok`, C.mid],
    ['> ICE detected ............ yes', C.danger],
  ];
  const spoil = has('spoiler') && st.run && c.hasBoss && !(st.run.spoiled || {})[def.key] && CORP_TELL[def.key];
  if (spoil) { st.run.spoiled = Object.assign({}, st.run.spoiled, { [def.key]: true }); modFired('spoiler'); }
  const spoilLines = spoil ? wrapText('spoiler: ' + CORP_TELL[def.key], 31) : [];
  st.intro = { skip: false };
  openPanel(def.name, (T, B, X) => {
    for (const l of art) T(l.padEnd(artW), C.accent);
    T('');
    X({ text: def.name, col: C.bright, bold: true });
    if (c.stageBoss) T('// SECTOR BOSS //', C.danger);
    T(c.tier ? `TIER ${c.tier}${def.level ? '   LV ' + def.level : ''}` : '', C.mid);
    T(def.intel, C.text);
    T(rules, C.mid);
    if (c.mod) T(`+ ${CORP_MODS[c.mod].name}: ${CORP_MODS[c.mod].desc}`, C.money);
    spoilLines.slice(0, 3).forEach((l, j) => T(j === 2 && spoilLines.length > 3 ? l.slice(0, 28) + '...' : l, C.money));
    T('');
    boot.forEach(([text, col], i) => X({ text: text.padEnd(31), col, reveal: i, revealId: 'boot' + i }));
    T('');
    T(Math.floor(performance.now() / 500) % 2 ? 'tap to skip' : '', C.dim);
  }, `> breaching ${def.name.toLowerCase()}...`);
  st.busy = true;
  const t0 = performance.now();
  const hold = CONFIG.introHold + (st.wipe ? st.wipe.dur : 0);
  while (performance.now() - t0 < hold && !st.intro.skip) await wait(40);
  st.intro = null;
  await wipeOut(0);
}

async function enterLayer() {
  const c = st.corp, run = st.run;
  const n = c.counts[c.idx];
  const boss = c.hasBoss && c.idx === c.counts.length - 1;
  let tell = c.tell;
  if (boss && c.def.bossTell) tell = c.def.bossTell;
  const lv = genLayer({ seed: run.seed, nodeId: c.node.id, idx: c.idx, n, tell, prevSafe: c.prevSafe, loot: !boss && c.hasBoss, mark: c.mark,
    tellStr: c.tellStr, salt: run.resumes || 0, dress: c.hasBoss ? c.def.dress : null, tier: c.tier, boss,
    alwaysFollow: !!c.def.alwaysFollow, carry: c.carry || null, lootMore: c.mod === 'loaded' });
  lv.after = c.prevSafe;       // last layer's real node, for AFTERIMAGE
  if (c.mod === 'branded' && n > 2) {   // BRANDED: about a third of the ICE wear the sigil
    const ice = shuffle(lv.tiles.filter(t => !t.safe && !t.loaded), rngFor(run.seed, 'brand', c.node.id, c.idx));
    for (const t of ice.slice(0, Math.max(1, Math.round(ice.length / 3)))) { t.marked = true; t.brand = true; }
  }
  if (has('dejavu') && c.hasBoss && c.idx === 0 && n > 1 && run.lastReal && run.lastReal.col < lv.cols && run.lastReal.row < lv.rows) {
    const real = lv.tiles[lv.safe], cell = run.lastReal.row * lv.cols + run.lastReal.col, other = lv.tiles.find(t => t.cell === cell);
    if (other !== real) {
      if (other) setCellOf(lv, other, real.cell);
      setCellOf(lv, real, cell);
      lv.tiles.sort((a, b) => a.cell - b.cell);
      lv.safe = lv.tiles.indexOf(real); lv.safeCell = { col: real.col, row: real.row };
    }
    lv.dejavu = true;
  }
  c.prevSafe = lv.safeCell;
  lv.payCut = 0; lv.ocCount = 0;
  lv.boss = boss;
  lv.misses = 0;
  lv.split = false;
  if (has('quantum') && n >= 3 && c.hasBoss && !c.def.tap && !st.mp) {   // QUANTUM: a second real node, random
    const opts = lv.tiles.filter(t => !t.safe && !t.loaded);
    if (opts.length) pickR(opts, rngFor(run.seed, 'quantum', c.node.id, c.idx)).quantum = true;
  }
  if (run.snoozed && run.snoozed.length && n > 1 && c.hasBoss && !st.mp && !modOffIn('snooze', c.def)) snoozeIn(lv, rngFor(run.seed, 'snoozein', c.node.id, c.idx));
  lv.eater = has('iceeater') && n > 1 && !st.mp;   // ICE EATER: eat the ICE (a 1-node layer is just the real one)
  lv.iceTotal = lv.tiles.filter(t => !isReal(t)).length; lv.eatPaid = 0;
  lv.dmg = boss && (c.def.bossDmg || c.stageBoss) ? (c.def.bossDmg || 2) : 1;   // sector bosses hit for 2
  st.lv = lv;
  st.coin = null; st.coinPress = null;   // COIN FLIP: nothing left open from the last layer
  if (c.hasBoss && c.def.dark) refreshPalette();   // BLACKOUT: the lights dim every layer
  st.hover = -1; st.sel = -1;
  c.depthAt = run.depth;
  run.depth++;
  // Codex: every glyph that shows up on a board counts as found.
  for (const t of lv.tiles) {
    const gi = MOTIFS.indexOf(t.glyph);
    if (gi >= 0) markSeen('g' + gi);
    if (t.loaded) markSeen('gloot');
    if (t.marked) markSeen('gsig');
  }
  if (n === 1) markSeen('gjack');
  if (boss && c.def.bossFlash) markSeen('gmask');
  st.timer = makeTimer();
  st.busy = true;
  if (boss) {
    await bossEntrance(c, n);
    for (const t of lv.tiles) t.hidden = true;     // nodes power on one by one
    showBoard('play');
    st.busy = true;
    Sound.bossDrop(); shake(10, 0.6); flash(C.danger, 0.22, 0.45);
    setMsg(`> BOSS LAYER. ${lv.n} nodes.`, C.danger);
    if (has('precog')) modFired('precog');
    for (const t of has('precog') ? [lv.tiles[lv.safe], ...lv.tiles.filter(o => !o.safe)] : lv.tiles) { await wait(70); t.hidden = false; Sound.nodeOn(); }
    if (c.def.bossFlash) lv.maskAt = performance.now() + 450 + CONFIG.maskDelayMs;   // SIGIL: the clock starts once you can see them
    await wait(200);
  } else if (c.idx === 0 && n > 1 && modsAt('start').includes('runway')) {
    // RUNWAY (START): the first layer walks in one node at a time; the real node last.
    const order = shuffle(lv.tiles.filter(t => !t.safe), rngFor(run.seed, 'runway', c.node.id)).concat([lv.tiles[lv.safe]]);
    for (const t of lv.tiles) t.hidden = true;
    showBoard('play');
    st.busy = true;
    Sound.layer(run.depth); setMsg('> runway: the collection walks in.', C.accent); modFired('runway');
    for (const t of order) { await wait(140); t.hidden = false; Sound.nodeOn(); }
    await wait(250);
  } else {
    showBoard('play');
    st.busy = true;
    Sound.layer(run.depth); setMsg(n === 1 ? '> one node. it is real. jack in.' : `> ${lv.n} nodes. ${lv.tiles.some(t => t.quantum) ? 'two are' : 'one is'} real.`);
    if (has('precog') && c.hasBoss && n > 1) {   // PRECOG: the real node shows up a beat early
      modFired('precog');
      for (const t of lv.tiles) if (!t.safe) t.hidden = true;
      Sound.ping(1568); await wait(260);
      for (const t of lv.tiles) t.hidden = false;
      await wait(220);
    } else await wait(480);
  }
  // START stage: layer-start mods, left to right on the bar. Each locks at most one ICE.
  const iceWhere = f => lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed' && f(t));
  const starts = {
    sniffer: () => true,
    corners: t => (t.col === 0 || t.col === lv.cols - 1) && (t.row === 0 || t.row === lv.rows - 1),
    sigscan: t => t.marked,
    basictraining: c.idx === 0 ? () => true : null,
    snipe: run.credits >= 100 ? () => true : null,
  };
  for (const key of modsAt('start')) {
    const f = starts[key];
    if (!f || n < 2) continue;   // AFTERIMAGE is START too, but it only draws a mark
    const opts = iceWhere(f);
    if (!opts.length) continue;
    lockTile(pickR(opts, rngFor(run.seed, key, c.node.id, c.idx)), C.mid, key);
    setMsg(`> ${MODS[key].name.toLowerCase()}: 1 ICE locked.`, C.mid);
    await wait(250);
  }
  // FOUR IN A ROW: an armed boss starts with 2 ICE locked
  if (lv.boss && st.run.p4Ready && has('fourinarow')) {
    st.run.p4Ready = false;
    for (const t of shuffle(iceWhere(() => true), rngFor(run.seed, 'p4', c.node.id)).slice(0, 2)) lockTile(t, C.money, 'fourinarow');
    setMsg('> four in a row: 2 ICE down.', C.money);
    await wait(250);
  }
  // START stage notes: hint mods put a short note on row 7 (left to right on the bar).
  lv.notes = [];
  if (n > 1 && c.hasBoss) {
    for (const key of modsAt('start')) if (START_NOTE[key]) { const note = START_NOTE[key](lv, c, run); if (note) { lv.notes.push(note); modFired(key); } }
    if (lv.tiles.some(t => t.quantum)) { lv.notes.push({ text: 'quantum: 2 real' }); modFired('quantum'); }
    if (has('horoscope') && c.luckyIdx === c.idx) { lv.notes.push({ text: 'lucky layer!' }); modFired('horoscope'); }
    if (has('handshake')) { modFired('handshake'); const row = lv.tiles[lv.safe].row; lv.notes.push({ text: `hs: ${'o'.repeat(row + 1)}` }); Sound.beeps(row + 1); }
    if (has('chancecard') && c.idx === 0) { lv.notes.push({ text: chanceCard(lv, c, run) }); modFired('chancecard'); }
    if (c.stolen && c.stolen.length) lv.notes.push({ text: `stolen: ${c.stolen.map(k => MODS[k].short).join(' ')}` });
    if (lv.dejavu) { lv.notes.push({ text: 'deja vu' }); modFired('dejavu'); }
    if (has('scoop') && c.idx === 0) modFired('scoop');
    if (has('scoop') && c.idx === 0) lv.notes.push({ text: `scoop: ${ROW_NAMES(lv.rows, lv.tiles[lv.safe].row)}` });
    if (has('cctv')) {
      const ice = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
      if (ice.length) lv.cctv = { t: pickR(ice, rngFor(run.seed, 'cctv', c.node.id, c.idx)), at: 1000 };   // fires when it flashes (scene)
    }
    if (c.express && !lv.lift) modFired('express');
    if (c.express && !lv.lift) lv.lift = makeLift(lv.tiles[lv.safe].row, rngFor(run.seed, 'express', c.node.id, c.idx), 1150);
    if (has('pickset') && (c.pins || 0) >= 3) { modFired('pickset'); c.pins = 0; lv.litRow = lv.tiles[lv.safe].row; lv.notes.push({ text: `pins set: ${ROW_NAMES(lv.rows, lv.litRow)}` }); }
  }
  if (c.hasBoss && c.def.intro && n > 1) { await c.def.intro(lv, c); if (st.lv !== lv) return; }   // corp kit: MONTE's shuffle
  if (lv.maskMs) lv.maskAt = performance.now() + lv.maskMs;   // corp kit: FORGET-ME-NOT
  // JACK-IN-THE-BOX: in one layer per corp, an ICE pops out 1-3s in (layerTick does it)
  if (has('companion') && c.hasBoss && n > 2 && c.petIdx === c.idx) lv.petAt = performance.now() + 1500 + rngFor(run.seed, 'pett', c.node.id)() * 3000;
  if (has('jackbox') && c.hasBoss && n > 2 && c.jackIdx === c.idx) lv.jackAt = performance.now() + 1000 + rngFor(run.seed, 'jackt', c.node.id)() * 2000;
  st.busy = false;
  lv.readyAt = performance.now();
  lv.shownAt = lv.readyAt;   // unlike readyAt, this one doesn't reset after a miss
  c.express = false;
  // LEVERAGE: debt grows every layer; past the limit the collectors take 1 integrity
  if (leverage() && run.credits < 0 && n > 1 && c.hasBoss) {
    run.credits -= Math.max(2, Math.round(-run.credits * DEBT.interest));
    modFired('leverage');
    if (run.credits < creditFloor()) { hurt(1); Sound.trap(); flash(C.danger, 0.15, 0.3); setMsg('> the collectors came. -1.', C.danger); if (run.integrity <= 0) return die(); }
  }
  // ZOMBIE: every layer adds rot
  if (zombie() && n > 1 && c.hasBoss) { addRot(ROT.layer); if (run.integrity <= 0) return die(); }
}

// Clock for this layer: the corp's own, or one added by OVERCLOCK.
function makeTimer() {
  const c = st.corp, lv = st.lv;
  let max = c.timer || (has('overclock') && c.hasBoss ? CONFIG.overclockClock : 0) || (c.mod === 'rush' ? 10 : 0);
  if (!max) return null;
  if (lv && lv.boss && c.def.bossShrink) max = Math.max(3, max - 3 * lv.misses);
  if (c.def.shot) max = Math.max(5, max - c.idx);   // COLDBREW: another shot
  if (has('coolant')) max += tv('coolant', [3, 5, 8]);
  if (has('overtime') && lv && lv.boss) max += 5;   // OVERTIME
  return { max, left: max, lastSec: max, ocNext: CONFIG.overclockStart };
}

// Lock a trap tile without damage (sniffer, purge).
// source: what locked it (purge, burner, sniffer, corners, sigscan, echo, overclock).
function lockTile(t, col, source = 'purge') {
  const i = st.lv.tiles.indexOf(t);
  const { x, y } = tileCenter(t);
  explode(snapshot(c => c.own === 't' + i), x, y, { col, power: 0.6 });
  const wasIce = t.state === 'closed' && !isReal(t);
  t.state = 'locked';
  t.lockedBy = source;
  Sound.shield();
  if (MODS[source]) modFired(source);
  if (wasIce && eaterOn() && source !== 'rival') eatPay();   // ICE EATER: locked ICE counts as eaten (and pays)   // a mod locked it (SNIFFER, VIRUS, OVERCLOCK...)
}

function updateTimer(dt) {
  const tm = st.timer;
  if (!tm || st.mode !== 'play' || st.busy || st.transitioning || st.dev || st.pause || EDITOR) return;   // the editor's scenes hold still
  if (st.lv && st.lv.holdUntil && performance.now() < st.lv.holdUntil) return;   // ESPRESSO, FREEZE FRAME
  tm.left -= dt * ((st.lv && st.lv.clockRate) || 1);   // TIMEWARP
  const sec = Math.ceil(tm.left);
  if (sec < tm.lastSec) { tm.lastSec = sec; if (sec <= 3 && sec > 0) Sound.clock(); }
  // OVERCLOCK: near the end, purge ICE one by one; each purge cuts the payout.
  const lv = st.lv;
  if (has('overclock') && tm.left <= tm.ocNext && tm.left > 0.5 && lv.ocCount < 3) {
    tm.ocNext -= 2;
    const opts = lv.tiles.filter(t => !t.safe && t.state === 'closed');
    if (opts.length > 0 && candidates().length > 1) {
      lockTile(opts[Math.floor(Math.random() * opts.length)], C.mid, 'overclock');
      lv.ocCount++;
      lv.payCut = Math.min(0.9, lv.payCut + CONFIG.overclockCut);
      setMsg(`> overclock: purged 1. pay -${Math.round(lv.payCut * 100)}%`, C.mid);
    }
  }
  if (tm.left <= 0 && has('overtime') && st.lv && !st.lv.otUsed) {   // OVERTIME: once a layer, 5 more seconds
    st.lv.otUsed = true; tm.left = 5; tm.lastSec = 5;
    Sound.shield(); setMsg('> overtime! +5s.', C.accent); modFired('overtime');
    return;
  }
  if (tm.left <= 0 && (eaterOn() || zombie())) return clockHurts();   // no random tap: it costs you instead
  if (tm.left <= 0) {
    tm.left = 0;
    const opts = candidates().length ? candidates() : st.lv.tiles.filter(t => t.state === 'closed');
    const t = opts[Math.floor(Math.random() * opts.length)];
    setMsg('> clock ran out.', C.danger);
    if (t) pick(st.lv.tiles.indexOf(t));
  }
}

// Things that happen on their own during a layer.
function layerTick(now) {
  const lv = st.lv;
  if (!lv) return;
  const dt = lv.lastNow ? Math.min(100, now - lv.lastNow) : 0;
  lv.lastNow = now;
  if (st.mode !== 'play' || st.busy || st.transitioning || st.dev || st.pause || st.mp || st.wipe || lv.shownAt == null) return;
  // JACK-IN-THE-BOX: pop!
  if (lv.jackAt && now > lv.jackAt) {
    lv.jackAt = null;
    const opts = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
    if (opts.length && candidates().length > 1) {
      lockTile(pickR(opts, rngFor(st.run.seed, 'jackbox', st.corp.node.id, st.corp.idx)), C.money, 'jackbox');
      Sound.jingle();
      setMsg('> jack-in-the-box: pop! 1 ICE out.', C.money);
    }
  }
  // COMPANION: sniff sniff (for a 1cr treat)
  if (lv.petAt && now > lv.petAt) {
    lv.petAt = null;
    const opts = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
    if (!canSpend(1)) setMsg('> no treats, no sniffing. (0cr)', C.mid);
    else if (opts.length && candidates().length > 1) {
      st.run.credits -= 1;
      lockTile(pickR(opts, rngFor(st.run.seed, 'pet', st.corp.node.id, st.corp.idx)), C.accent, 'companion');
      Sound.jingle();
      setMsg('> sniff sniff. 1 ICE found. -1cr', C.accent);
    }
  }
  if (lv.holdUntil && now < lv.holdUntil) return;   // ESPRESSO / FREEZE FRAME stop the layer's clock too
  lv.lt = (lv.lt || 0) + dt;
  const def = st.corp && st.corp.hasBoss ? st.corp.def : null;
  if (def && has('stethoscope') && !def.drag) { const c = nearness(lv, lv.tiles[lv.safe], 2); lv.focus = c == null ? null : 0.5 + 0.5 * c; }   // STETHOSCOPE
  if (def && has('influencer')) {   // INFLUENCER: pointless numbers and emoji
    const run = st.run;
    run.fol = Math.max(10, (run.fol || 120) + (Math.random() - 0.48) * 6);
    if (!lv.inflNext || now > lv.inflNext) {
      lv.inflNext = now + 1200 + Math.random() * 1800;
      floatText(pickR([...SQ_GOOD, ...SQ_BAD], Math.random), pxX(rand(4, L.wc - 4)), pxY(BOARD_Y + rand(2, L.gh - 2)), Math.random() < 0.5 ? C.accent : C.danger, 1.4);
    }
    const nt = (lv.notes = lv.notes || []).find(n2 => n2.tag === 'infl');
    if (nt) nt.text = `@you ${kfmt(run.fol)}`; else lv.notes.push({ text: `@you ${kfmt(run.fol)}`, tag: 'infl' });
  }
  if (def && st.corp.mod === 'rival') { rivalTick(lv, now); if (st.busy) return; }   // RIVAL
  if (def && def.tick) def.tick(lv, lv.lt, dt, now);
}

// CHANCE CARD: the card for this corp (applied right away). Returns the note.
function chanceCard(lv, c, run) {
  const u = rngFor(run.seed, 'chance', c.node.id)();
  if (u < 0.3) {
    const ice = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
    if (ice.length > 1) { lockTile(pickR(ice, rngFor(run.seed, 'chancelock', c.node.id)), C.money, 'chancecard'); return 'chance: 1 ICE locked'; }
  }
  if (u < 0.55 || (u < 0.7 && !st.timer)) { run.credits += 10; run.earned += 10; return 'chance: +10cr'; }
  if (u < 0.7) { st.timer.max += 3; st.timer.left += 3; return 'chance: +3s'; }
  if (u < 0.92) return 'chance: nothing';
  if (zombie()) { addRot(ROT.ice); return 'chance: rot!'; }
  if (bloodMoney()) { const cost = payBlood(1); return run.integrity > 0 ? `chance: -${cost}cr!` : 'chance: broke!'; }
  run.integrity = Math.max(1, run.integrity - 1);
  return 'chance: -1 int!';
}

// GLACIER: the frost reached the real node. A hit, but the layer counts (no perfect).
async function frostbite(t) {
  const run = st.run, lv = st.lv;
  st.busy = true;
  lv.scanned = true;
  hurt(1);
  Sound.trap(); shake(9); flash(C.accent, 0.2, 0.4);
  setMsg(zombie() ? '> frostbite. rot.' : '> frostbite. integrity -1.', C.danger);
  await wait(500);
  if (run.integrity <= 0) return die();
  await onSafe(t);
}

function resetTimer() {
  if (!st.timer) return;
  st.timer = makeTimer();
}

async function pick(i) {
  if (st.mp) return mpTap(i);
  { const byp = st.lagBypass; st.lagBypass = false;   // corp kit: LAGRANGE holds taps back
    if (!byp && st.mode === 'play' && !st.busy && st.corp && st.corp.hasBoss && st.corp.def.intercept && st.lv && st.lv.tiles[i] && st.corp.def.intercept(i)) return; }
  if (st.mode !== 'play' || st.busy) return;
  const t = st.lv.tiles[i];
  if (!t || t.state !== 'closed') return;
  // ZOMBIE: weak taps. A node takes tapsToBreak() taps; the ones before the last only crack it
  // (the same for ICE and the real node: a crack never tells you which it is).
  if (zombie() && st.corp && st.corp.hasBoss) {
    const need = tapsToBreak();
    if ((t.cracks || 0) + 1 < need) {
      t.cracks = (t.cracks || 0) + 1; t.crackAt = performance.now();
      Sound.tick(); shake(1.5, 0.12);
      setMsg(`> crack. ${t.cracks}/${need}`, C.mid);
      return;
    }
    t.cracks = 0;
  }
  st.busy = true;
  st.sel = -1;
  st.selItem = -1; st.selMod = -1;
  st.lv.fast = st.lv.readyAt != null && performance.now() - st.lv.readyAt < CONFIG.fastpayMs;
  st.lv.late = !!(st.timer && st.timer.left <= 3);   // SURGE
  st.lv.surgeF = st.timer ? 1 - st.timer.left / st.timer.max : 0;
  st.lv.pickAt = performance.now();   // AMBUSH
  { const ph = beatClock(performance.now()).phase; st.lv.onBeat = ph < 0.15 || ph > 0.9; }   // ON BEAT
  if (st.corp && st.corp.hasBoss && st.corp.def.onPick) st.corp.def.onPick(t);   // corp kit (TOLLGATE)
  t.probing = true;
  Sound.probe();
  setMsg('> probing...', C.mid);
  await wait(300);
  t.probing = false;
  // SYNAPSE learns where you pick (every pick, every corp)
  if (st.run && st.corp && st.corp.hasBoss) {
    const hb = st.run.habits = st.run.habits || { total: 0, corner: 0, edge: 0, middle: 0 };
    hb.total++; hb[cellZone(t, st.lv)]++; hb['c' + t.col] = (hb['c' + t.col] || 0) + 1;
    const sh = save.habits = save.habits || { total: 0, corner: 0, edge: 0, middle: 0 };   // FOURTH WALL: all your picks, ever
    sh.total++; sh[cellZone(t, st.lv)]++; sh['c' + t.col] = (sh['c' + t.col] || 0) + 1;
    if (sh.total % 5 === 0) persist();
  }
  if (eaterOn() && isReal(t)) return eaterBit(t);   // ICE EATER: the real node kills
  // A corp's own pick rule (FORM 27B, DEMOLITION) can take the tap.
  if (st.corp && st.corp.hasBoss && st.corp.def.tap && st.corp.def.tap(t, i)) return;
  if (t.safe) return onSafe(t);
  if (t.quantum) { modFired('quantum'); return onSafe(t); }   // QUANTUM: the other real node
  if (eaterOn()) { eaterScan(t); return onTrap(t, i); }   // ICE EATER: eat it (scans only warn)
  // PICK stage. X-AXIS / Y-AXIS: the tap scans its row / column. If the real node is on
  // it, the scan catches it: no damage, the layer is passed (but it's not a perfect).
  // The first one on the bar that catches it wins.
  const real = st.lv.tiles[st.lv.safe];
  const scans = { xaxis: () => real.row === t.row, yaxis: () => real.col === t.col };
  const axis = real.state === 'closed' ? modsAt('pick').find(k => scans[k] && scans[k]()) || null : null;
  if (axis) return onScan(t, real, axis);
  // A scan that misses still lights its line (dim, quick), so you see what it checked.
  const axes = modsAt('pick').filter(k => scans[k]);
  if (axes.length && real.state === 'closed') st.lv.scan = { t0: performance.now(), from: t, axes, real: null };
  await onTrap(t, i);
}

// X-AXIS / Y-AXIS: the scan runs out from the tap along the row / column, one node a step
// (drawn in engine/scene.js from lv.scan). When it reaches the real node, that node lights up,
// a beat, then the reveal.
const SCAN_STEP = 90;
const scanDist = (a, b) => Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
async function onScan(t, real, axis) {
  const lv = st.lv;
  lv.scanned = true;
  lockTile(t, C.accent, axis);
  lv.scan = { t0: performance.now(), from: t, axes: [axis], real };
  setMsg(`> ${MODS[axis].name.toLowerCase()} scan...`, C.mid);
  const d = scanDist(t, real);
  for (let k = 1; k <= d; k++) { await wait(SCAN_STEP); if (k < d) Sound.tick(); }
  Sound.ping(1568);
  modFired(axis);
  flash(C.accent, 0.12, 0.3);
  setMsg(`> ${MODS[axis].name.toLowerCase()} scan: found it in this ${axis === 'xaxis' ? 'row' : 'column'}.`, C.accent);
  await wait(650);
  lv.scan = null;
  await onSafe(real);
}

function payFor(lv) {
  const c = st.corp;
  let base = 4 + 2 * lv.n;
  if (lv.boss) base *= 3;
  let mult = c.pay || 1;
  if (c.stageBoss) mult *= 1.5;   // a corp as the sector boss pays more
  if ((lv.misses === 0 || lv.eater) && lv.n > 1 && !lv.scanned) mult *= 1 + 0.5 * (lv.n - 1);   // ICE EATER: every clear is clean
  if (has('skimmer')) mult *= 1.5;
  mult *= coinMult();   // COIN FLIP: the streak multiplier
  if (has('quantum') && lv.tiles.some(t => t.quantum)) mult *= 0.5;   // QUANTUM: 2 real, half pay
  if (has('fastpay') && lv.fast) mult *= 1.5;
  if (has('surge') && lv.late) mult *= 1.5;
  if (has('supersize') && lv.boss) mult *= 1.5;
  if (c.def.surge) mult *= 1 + 0.8 * (lv.surgeF || 0);   // RYDR: pays more the later you pick
  if (has('onbeat') && lv.onBeat) mult *= 1.5;
  if (c.mod === 'loaded') mult *= 1.2;
  if (c.hasBoss && c.def.faith && !lv.tithed) mult *= 2;   // THE CHOIR: on faith
  if (lv.dd) mult *= 2;                                    // LUCKEEZ: double down
  mult *= 1 - (lv.payCut || 0);
  return lv.n === 1 ? 0 : Math.round(base * mult);
}

async function onSafe(t) {
  const run = st.run, lv = st.lv, c = st.corp;
  t.state = 'safe';
  const perfect = (lv.misses === 0 || lv.eater) && lv.n > 1 && !lv.scanned;
  if (c.hasBoss && lv.n > 1) run.lastReal = { col: t.col, row: t.row };   // DEJA VU
  if (lv.n > 1) { c.scored = (c.scored || 0) + 1; if (perfect) { c.perfects = (c.perfects || 0) + 1; run.perfects = (run.perfects || 0) + 1; } }
  const pay = lv.eater ? Math.max(0, payFor(lv) - (lv.eatPaid || 0)) : payFor(lv);   // ICE EATER: the rest of the layer's pay
  if (pay) for (const [k, on] of [['skimmer', true], ['fastpay', lv.fast], ['surge', lv.late], ['supersize', lv.boss], ['onbeat', lv.onBeat]]) if (on && has(k)) modFired(k);   // pay boosts
  const tix = c.hasBoss && c.def.tickets;   // CHUCK E. CACHE'S pays in tickets
  if (tix) c.tickets = (c.tickets || 0) + pay;
  else { run.credits += pay; run.earned += pay; }
  lv.paid = tix ? 0 : pay;
  let healed = false;
  if (perfect && canHeal() && c.mod !== 'cursed') { heal(CONFIG.perfectHeal); healed = true; }
  if (!lv.boss) Sound.safe();
  if (c.hasBoss && c.def.onSafe) c.def.onSafe(t, lv);   // corp kit: SQUALOR's likes
  flash(C.accent, 0.12, 0.3);
  let msg = perfect ? '> perfect.' : '> access granted.';
  if (pay) msg += tix ? ` +${pay} tix` : ` +${pay}cr`;
  if (healed) msg += ' +1 int';
  setMsg(msg, C.accent);
  const land = lv.boss ? Sound.bossWin() : 0;   // boss: the fanfare replaces the safe sound (s until it lands)
  await wait(380);
  const i = lv.tiles.indexOf(t);
  const lit = buildScene(performance.now(), false, true).filter(cl => cl.own === 't' + i);
  if (lv.boss) {
    // The layer floats away and the screen goes empty as the fanfare lands;
    // then CORP BREACHED types in and the reward screen builds up under it.
    flash(C.accent, 0.2, 0.5); shake(5, 0.4);
    // time it so the screen is empty right as the fanfare lands (CORP BREACHED types on the hit)
    const full = (RISE.wave + RISE.jitter + RISE.rise) * 1000;
    const ms = riseOut(new Set(lit.map(cl => cl.cx + ',' + cl.cy)), clamp((land * 1000 - 380 - 100) / full, 0.5, 1.3));
    st.hideAll = true; st.wipe = null;
    await wait(ms);
    st.breachReveal = true;
  } else {
    // Success wipe: the real node stays lit while the fill rises. Bigger for perfect.
    await wipeOut(perfect ? 2 : 1, lit);
  }
  c.idx++;
  if (lv.carryNext) c.carry = lv.carryNext;   // corp kit: what this layer leaves the next one
  c.depthAt = run.depth;   // this layer is done: a save from here keeps it
  // LAYER END stage, left to right on the bar.
  for (const k of modsAt('end')) if (END_FX[k] && await END_FX[k](perfect) !== false) modFired(k);   // false: nothing happened
  if (c.idx < c.counts.length) { saveRun(); await adBreak('layer'); return enterLayer(); }   // (maybe an ad between layers)
  // Corp finished
  if (c.mod === 'rival' && c.rival) {   // RIVAL: beat it
    const bonus = c.rival.hp <= 0 ? 30 : c.rival.stole === 0 ? 15 : 0;
    if (bonus) { run.credits += bonus; run.earned += bonus; setMsg(c.rival.hp <= 0 ? `> rival flatlined. +${bonus}cr` : `> you beat ${c.rival.name.toLowerCase()}. +${bonus}cr`, C.money); }
  }
  lightsOn();
  if (c.hasBoss && c.def.onClear) {
    const m = c.def.onClear(c);
    if (m) { const o = typeof m === 'string' ? { text: m, col: C.danger, bad: true } : m; setMsg(o.text, o.col); if (o.bad) Sound.trap(); else Sound.loot(); }
  }
  if (c.node.type === 'start') { run.pending = { kind: 'start', id: c.node.id }; saveRun(); return openStartReward(c.node); }
  run.corps++;
  if (c.node.type === 'corp') { run.beat = run.beat || {}; (run.beat[c.sector] = run.beat[c.sector] || []).push(c.def.key); }
  corpStat(c.def.key).breached++; persist();   // codex record
  if (c.stolen && c.stolen.length && !c.bossSkipped) { run.mods.push(...c.stolen.reverse()); c.stolen = []; }   // THIEF: you got them back
  if (c.node.type === 'final') return sectorClear(!!c.bossSkipped);
  run.pending = { kind: 'reward', id: c.node.id, skipped: !!c.bossSkipped };
  saveRun();
  openReward(c.node, !!c.bossSkipped);
}

// START stage notes: short hints shown on row 7. ms: shown only that long after the layer opens.
const START_NOTE = {
  // HEADCOUNT: how many nodes touch the real node (the 8 cells around it)
  headcount(lv) {
    const real = lv.tiles[lv.safe];
    return { text: `heads: ${lv.tiles.filter(t => touching(t, real)).length}` };
  },
  forecast(lv, c, run) {
    const r = rngFor(run.seed, 'fcst', c.node.id, c.idx, run.resumes || 0), real = lv.tiles[lv.safe];
    const byRow = r() < 0.5, n = byRow ? lv.rows : lv.cols, at = byRow ? real.row : real.col;
    const pick = r() < 0.6 ? at : pickR(Array.from({ length: n }, (_, i) => i).filter(i => i !== at), r);
    return { text: `fcst: ${byRow ? ROW_NAMES(lv.rows, pick) : COL_NAMES(lv.cols, pick)}?` };
  },
  spellbound(lv) {
    if (!lv.boss) return null;
    const t = lv.tiles[lv.safe], edgeV = t.row === 0 ? 'T' : t.row === lv.rows - 1 ? 'B' : '', edgeH = t.col === 0 ? 'L' : t.col === lv.cols - 1 ? 'R' : '';
    return { text: `spell: ${edgeV || edgeH || 'C'}` };
  },
  seedreader(lv) { return lv.boss ? { text: `seed: col ${lv.tiles[lv.safe].col + 1}` } : null; },
  photographic(lv) { return { text: 'photo>' + glyphLine(lv.tiles[lv.safe].glyph), ms: 450 }; },
};

// LAYER END stage: what each mod does once a layer is passed.
const END_FX = {
  ezpass() { st.run.credits += 2; st.run.earned += 2; },
  // GRAVE ROBBER: every ICE you never touched is a grave to rob
  graverobber() {
    const lv = st.lv, n = lv ? lv.tiles.filter(t => !t.safe && !(t.state === 'locked' && t.lockedBy === 'hit')).length : 0;
    if (!n) return false;
    st.run.credits += 2 * n; st.run.earned += 2 * n;
    setMsg(`> grave robber: ${n} graves. +${2 * n}cr`, C.money); Sound.loot();
  },
  // LET IT RIDE: a perfect bets its pay on the next layer: another perfect pays it back
  // double, anything else loses it.
  letitride(perfect) {
    const run = st.run, c = st.corp, lv = st.lv;
    if (!c.hasBoss) return false;
    if (c.ride) {
      if (perfect) { run.credits += 2 * c.ride; run.earned += c.ride; Sound.loot(); setMsg(`> let it ride: +${2 * c.ride}cr!`, C.money); }
      else setMsg(`> let it ride: lost ${c.ride}cr.`, C.danger);
      c.ride = 0;
    } else if (perfect && c.idx < c.counts.length && lv.paid > 0) {
      c.ride = Math.min(lv.paid, Math.max(0, run.credits));   // (in debt: nothing to bet)
      if (!c.ride) return false;
      run.credits -= c.ride;
      setMsg(`> let it ride: ${c.ride}cr riding.`, C.money);
    } else return false;
  },
  // FOUR IN A ROW: 4 perfects in a row arm the next boss (2 ICE locked)
  fourinarow(perfect) {
    const run = st.run;
    run.p4 = perfect ? (run.p4 || 0) + 1 : 0;
    if (run.p4 >= 4) { run.p4 = 0; run.p4Ready = true; setMsg('> 4 in a row! next boss -2 ICE.', C.money); }
    else return false;   // counting
  },
  // EXPRESS: a perfect gives the next layer a lift
  express(perfect) { const c = st.corp; if (perfect && c.hasBoss && c.idx < c.counts.length) c.express = true; else return false; },
  // TRIAGE: a corp you beat heals 1; at full, +1 max integrity
  triage() {
    const run = st.run, c = st.corp;
    if (!c.hasBoss || c.idx < c.counts.length) return false;
    if (zombie()) heal(1);
    else if (run.integrity < run.maxInt) run.integrity++;
    else { run.maxInt++; run.integrity++; }
    Sound.shield();
  },
  // HONEYCOMB: perfects store honey; 3 drops heal 1. At full, a drop is +10cr.
  honeycomb(perfect) {
    const run = st.run;
    if (!perfect) return false;
    if (!canHeal()) { run.credits += 10; run.earned += 10; return; }
    run.honey = (run.honey || 0) + 1;
    if (run.honey >= 3) { run.honey = 0; heal(1); Sound.shield(); }
    else return false;   // storing honey
  },
  // INTEREST: a corp you finish pays 5% of your credits (up to 20).
  async interest() {
    const run = st.run, c = st.corp;
    if (!c.hasBoss || c.idx < c.counts.length) return false;
    const cr = Math.min(20, Math.floor(run.credits * 0.05));
    if (cr > 0) { run.credits += cr; run.earned += cr; Sound.loot(); }
    else return false;
  },
  // SKIPJACK: a perfect can open a skip past the next layer. The player chooses.
  async skipjack(perfect) {
    const run = st.run, c = st.corp;
    if (!(perfect && c.hasBoss && c.idx < c.counts.length &&
      rngFor(run.seed, 'skip', c.node.id, c.idx, run.resumes || 0)() < tv('skipjack', [0.15, 0.25, 0.4]))) return false;
    const boss = c.idx === c.counts.length - 1;
    if (boss && !SKIP_BOSS) return false;
    modFired('skipjack');   // as the offer opens
    const go = await askSkip(boss);
    await wipeOut(0);
    if (!go) return;
    run.depth++; c.idx++;
    if (boss) c.bossSkipped = true;
    setMsg(boss ? '> skipjack: boss skipped. no reward.' : '> skipjack: layer skipped.', C.accent);
  },
};

// CONTINUE?: a 10 second countdown.
function askContinue() {
  return new Promise(res => {
    let done = false;
    const t0 = performance.now();
    const choose = v => { if (done) return; done = true; Sound.ui(); res(v); };
    const tick = () => { if (done) return; if (performance.now() - t0 > 10000) return choose(false); setTimeout(tick, 200); };
    tick();
    openPanel('CONTINUE?', (T, B, X) => {
      const left = Math.max(0, Math.ceil(10 - (performance.now() - t0) / 1000));
      X({ text: 'CONTINUE?', col: Math.floor(performance.now() / 300) % 2 ? C.danger : C.bright, bold: true });
      T('');
      X({ text: String(left), col: C.bright, bold: true });
      T('');
      T('insert 100cr to keep going.', C.text);
      T('you come back at 1 integrity.', C.mid);
      T('');
      X({ box: true, text: 'PAY 100cr', id: 'cont', onTap: () => choose(true), minW: 18 });
      T('');
      B('[ GAME OVER ]', 'giveup', () => choose(false));
    }, { text: '> integrity gone. or is it?', col: C.danger });
  });
}

// SKIPJACK's question: skip the next layer (or the boss), or play it.
const SKIP_BOSS = true; // switch: false = bosses can never be skipped
function askSkip(boss) {
  return new Promise(res => {
    let done = false;
    const choose = v => { if (done || st.transitioning) return; done = true; Sound.ui(); res(v); };
    const final = st.corp.node.type === 'final';
    openPanel('SKIPJACK', (T, B, X) => {
      T('SKIPJACK', C.accent);
      T('');
      T('perfect pick. a way past opens.', C.text);
      if (boss) {
        T('');
        X({ text: '!! SKIP THE BOSS? !!', col: Math.floor(performance.now() / 300) % 2 ? C.danger : C.bright, bold: true });
        T(final ? 'no reward. the sector still clears.' : 'no reward: no mod, no credits.', C.dangerDim);
      }
      T('');
      T('skip: +1 layer of depth, no pay.', C.mid);
      T('play: keep its pay and perfect.', C.mid);
      T('');
      X({ box: true, text: boss ? 'SKIP BOSS: NO REWARD' : 'S K I P', id: 'skip', onTap: () => choose(true), minW: boss ? 24 : 18 });
      T('');
      B('[ PLAY IT ]', 'play', () => choose(false));
    }, boss ? { text: '> skipjack: the boss is in reach.', col: C.danger } : { text: '> skipjack: skip ready.', col: C.accent });
  });
}

async function onTrap(t, i) {
  const run = st.run, lv = st.lv;
  lv.misses++;
  run.iceHits = (run.iceHits || 0) + 1;
  if (st.corp) st.corp.ice = (st.corp.ice || 0) + 1;
  t.state = 'locked';
  t.lockedBy = 'hit';
  t.hitAt = performance.now();
  // BLOCK, then HIT (the node's own loot first, then mods left to right), then a death
  // check, then BOARD. Corp twists would go after the mods in HIT and BOARD.
  if (lv.eater) t.eaten = true;
  let msg = lv.eater ? eatBite(t) : blockHit(t, i);
  if (t.loaded) {
    const lr = rngFor(run.seed, 'loot', st.corp.node.id, st.corp.idx);
    msg += ' ' + grantLoot(lr, st.corp.tier);
    if (has('priority')) { msg += ' ' + grantLoot(lr, st.corp.tier); modFired('priority'); }   // PRIORITY: delivered twice
  }
  // a HIT mod fires unless it returns false (nothing happened); a callout fires it later
  for (const k of modsAt('hit')) {
    if (!HIT_FX[k]) continue;
    const queued = (lv.callouts || []).length;
    if (HIT_FX[k](t) !== false && (lv.callouts || []).length === queued) modFired(k);
  }
  if (t.rejected) msg = msg.replace('> ICE.', '> REJECTED.');   // FORM 27B
  setMsg(msg, t.loaded ? C.money : lv.eater ? C.accent : C.danger);
  if (st.corp.hasBoss && st.corp.def.onHit) st.corp.def.onHit(t);   // corp twist, after your mods
  // corp modifiers: ARMORED points at the real node, THIEF takes your last mod
  if (st.corp.mod === 'armored' && !t.dir) { const q = lv.tiles[lv.safe]; t.dir = Math.abs(q.col - t.col) >= Math.abs(q.row - t.row) ? { h: Math.sign(q.col - t.col), v: 0 } : { h: 0, v: Math.sign(q.row - t.row) }; }
  if (st.corp.mod === 'thief' && run.mods.length) {
    const key = run.mods.pop();
    (st.corp.stolen = st.corp.stolen || []).push(key);
    setMsg(`${st.msg} thief took ${MODS[key].name}!`, C.danger);
  }
  await failsafeBeat(lv);
  await wait(450);
  if (run.integrity <= 0) return die();
  // Mods that showed something on the hit node (KEYLOGGER, TRACER) say so, one at a time,
  // after the hit has sunk in. Each one's change shows up on the node as its line comes.
  for (const c of lv.callouts || []) {
    if (c.fn) c.fn(performance.now());
    modFired(c.key);
    Sound.tick();
    setMsg(c.text, C.accent);
    await wait(520);
  }
  lv.callouts = [];
  for (const k of modsAt('board')) if (BOARD_FX[k]) await BOARD_FX[k](t);
  if (st.corp.hasBoss && st.corp.def.afterHit && st.lv === lv) await st.corp.def.afterHit(t, lv);   // corp kit: MONTE, GRAVITAS move on a miss
  resetTimer();
  st.busy = false;
  lv.readyAt = performance.now();
}

// ---- Damage and healing outside an ICE hit go through these, so ZOMBIE can turn them into rot.
// hurt: n integrity (ZOMBIE: rot instead). heal: up to n integrity (ZOMBIE: less rot).
function hurt(n) {
  const run = st.run;
  if (zombie()) return addRot(n * ROT.ice);
  if (bloodMoney()) return payBlood(n);
  run.integrity -= n;
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
  if (run.rot >= ROT.max) { run.rot = ROT.max; run.integrity = 0; }
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
// the real node kills you. Each bite pays the layer's pay / its ICE count; onSafe pays the rest.
function eatPay() {
  const run = st.run, lv = st.lv;
  const share = Math.max(1, Math.round(payFor(lv) / Math.max(1, lv.iceTotal)));
  run.credits += share; run.earned += share; lv.eatPaid = (lv.eatPaid || 0) + share;
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
// You bit the real node. Instant death; FAILSAFE catches it once (no pay, the layer passes);
// ZOMBIE can't die from it, it rots a lot instead.
async function eaterBit(t) {
  const run = st.run, lv = st.lv;
  t.state = 'reveal';
  Sound.trap(); shake(14, 0.6); flash(C.danger, 0.3, 0.5);
  modFired('iceeater');
  setMsg('> that was the real one.', C.danger);
  if (st.god) { /* dev: no death */ }
  else if (zombie()) addRot(ROT.realTap);
  else if (has('failsafe') && !run.failsafeUsed) { run.failsafeUsed = true; run.integrity = 1; st.fsAt = performance.now(); lv.failsafeNow = true; }
  else run.integrity = 0;
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
    if (f.kind === 'hp') heal(v); else { run.credits += v; run.earned += v; }
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
    const used = new Set(lv.tiles.map(t => t.cell)), free = [];
    for (let k = 0; k < lv.cols * lv.rows; k++) if (!used.has(k)) free.push(k);
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
  const used = new Set(lv.tiles.map(t => t.cell)), free = [];
  for (let k = 0; k < lv.cols * lv.rows; k++) if (!used.has(k)) free.push(k);
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
    addRot(ROT.ice);
    Sound.shatter(); shake(4);
    msg = run.integrity > 0 ? `> ICE broken. rot +${ROT.ice}.` : '> ICE broken. you fall apart.';
  } else if (st.god) {
    Sound.shield();
    msg = '> ICE. god mode: no damage.';
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
  } else if (lv.rolled && !lv.rollUsed) {
    lv.rollUsed = true; lv.payCut = 1;
    Sound.shield(); flash(C.accent, 0.14, 0.3); shake(4);
    msg = '> ICE. rolled up: no damage, no pay.';
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
  } else if (has('omerta') && canSpend(Math.max(15, Math.floor(Math.max(0, run.credits) * 0.1)))) {
    const cost = Math.max(15, Math.floor(Math.max(0, run.credits) * 0.1));
    run.credits -= cost;
    Sound.shield(); flash(C.money, 0.1, 0.3);
    modFired('omerta');
    msg = `> ICE. omerta: -${cost}cr. say nothing.`;
  } else if (st.corp.hasBoss && st.corp.def.block && (msg = st.corp.def.block(t, lv))) {
    // a corp's own rule took the hit (the message is set)
  } else if (has('friendship') && !st.corp.friendUsed && canSpend(10)) {
    st.corp.friendUsed = true; run.credits -= 10;
    Sound.shield(); flash(C.accent, 0.1, 0.3);
    modFired('friendship');
    msg = '> ICE. friendship: -10cr instead.';
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
    const raw = st.corp.hasBoss && st.corp.def.hitDmg ? Math.max(lv.dmg, st.corp.def.hitDmg(t, lv)) : lv.dmg;   // GRIDLOCK: red hits for 2
    const dmg = has('grounded') && raw >= 2 ? raw - 1 : raw;   // GROUNDED
    if (dmg < raw) modFired('grounded');
    if (bloodMoney()) {   // BLOOD MONEY: the hit costs credits
      const cost = payBlood(dmg);
      Sound.trap(); shake(9); flash(C.money, 0.18, 0.35);
      msg = run.integrity > 0 ? `> ICE. -${cost}cr. blood money.` : '> ICE. you can\x27t pay.';
      return msg;
    }
    run.integrity -= dmg;
    Sound.trap();
    shake(9);
    flash(C.danger, 0.18, 0.35);
    msg = run.integrity > 0 ? `> ICE. integrity -${dmg}.` : '> ICE. integrity gone.';
    // FAILSAFE: once per run, a killing hit leaves you at 1 (failsafeBeat plays it out: the HUD
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
  // LAST BYTE: down to 1 integrity, the HUD glitches and spells out the real column
  lastbyte() {
    const lv = st.lv;
    if (st.run.integrity !== 1 || lv.lastByte) return false;
    lv.lastByte = true;
    flash(C.danger, 0.15, 0.3); shake(4);
    lv.notes = (lv.notes || []).concat([{ text: `c0l_${lv.tiles[lv.safe].col + 1}`, tag: 'lastbyte' }]);
  },
  // INDEX: >>> the real node comes later in reading order, <<< earlier
  index(t) { const s = st.lv.tiles[st.lv.safe]; t.glyph = normMotif(['', s.cell > t.cell ? '>>>' : '<<<', '']); },
  policy() { st.run.credits += 8; st.run.earned += 8; },
  pixelpeep() { st.lv.peepAt = performance.now(); },
  prism() { st.lv.prismRow = st.lv.tiles[st.lv.safe].row; },
  queuenumber(t) {
    if (t.loaded) return false;
    const lv = st.lv, order = lv.tiles.slice().sort((a, b) => a.cell - b.cell), d = order.indexOf(lv.tiles[lv.safe]) - order.indexOf(t);
    t.glyph = normMotif(['', `${d > 0 ? '+' : ''}${d}`, '']);
  },
  turing(t) {
    const lv = st.lv, r = rngFor(st.run.seed, 'turing', st.corp.node.id, st.corp.idx, lv.misses);
    const ice = lv.tiles.filter(o => o !== t && !o.safe && o.state === 'closed' && !o.say), real = lv.tiles[lv.safe];
    const who = r() < 0.75 || real.state !== 'closed' ? pickR(ice, r) : real;
    if (who) who.say = ['NOT', 'ME'];
    else return false;
  },
  // PARITY: does the real node share this ICE's row or column?
  parity(t) {
    const lv = st.lv, s = lv.tiles[lv.safe], inLine = s.row === t.row || s.col === t.col;
    lv.notes = (lv.notes || []).filter(nt => nt.tag !== 'par').concat([{ text: `par: ${inLine ? 'in line' : 'off line'}`, tag: 'par' }]);
  },
  callerid() {
    const lv = st.lv, row = lv.tiles[lv.safe].row;
    Sound.beeps(row + 1);
    lv.notes = (lv.notes || []).filter(nt => nt.tag !== 'cid').concat([{ text: `cid: ${ROW_NAMES(lv.rows, row)}`, tag: 'cid' }]);
  },
  compost() {
    const run = st.run;
    run.compost = (run.compost || 0) + 1;
    if (run.compost % 3 === 0 && canHeal()) { heal(1); Sound.shield(); }
    else return false;   // only fires when it heals
  },
  // FOGHORN: louder the closer the real node is (bars on row 7)
  foghorn(t) {
    const lv = st.lv, s2 = lv.tiles[lv.safe], d = Math.max(Math.abs(s2.col - t.col), Math.abs(s2.row - t.row));
    const bars = clamp(5 - d, 1, 4);
    Sound.horn([0, 0.2, 0.35, 0.6, 1][bars]);
    lv.notes = (lv.notes || []).filter(nt => nt.tag !== 'horn').concat([{ text: `horn ${'|'.repeat(bars).padEnd(4, '.')}`, tag: 'horn' }]);
  },
  pickset() { st.corp.pins = (st.corp.pins || 0) + 1; },
  // PENCIL MARKS: rule out one other ICE in the same row
  pencil(t) {
    const lv = st.lv, opts = lv.tiles.filter(o => o !== t && o.row === t.row && o.state === 'closed' && !o.safe && !o.ruledOut);
    if (!opts.length) return false;
    pickR(opts, rngFor(st.run.seed, 'pencil', st.corp.node.id, st.corp.idx, lv.misses)).ruledOut = true;
  },
  tracer(t) {
    // which way the real node is: level 1 the bigger direction (coin flip when even), level 2 both
    const lv = st.lv, s = lv.tiles[lv.safe], dx = Math.sign(s.col - t.col), dy = Math.sign(s.row - t.row);
    const gx = Math.abs(s.col - t.col), gy = Math.abs(s.row - t.row);
    if (modTier('tracer') >= 1) t.dir = { h: dx, v: dy };
    else if (gx > gy || (gx === gy && rngFor(st.run.seed, 'tracer', st.corp.node.id, st.corp.idx, lv.misses)() < 0.5)) t.dir = { h: dx, v: 0 };
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
  // LINKUP: the hit node's partner (TWINLINK's link, or the node mirrored across the center)
  async linkup(t) {
    const lv = st.lv, p = t.partner || lv.tiles.find(o => o.col === lv.cols - 1 - t.col && o.row === lv.rows - 1 - t.row);
    if (!p || p === t || p.safe || p.state !== 'closed') return;
    lockTile(p, C.accent, 'linkup');
    setMsg('> linkup: its partner went too.', C.accent);
    await wait(200);
  },
  // ANTIGRAV: the closest ICE above the hit node (same column) drops on it and locks
  async antigrav(t) {
    const lv = st.lv, above = lv.tiles.filter(o => o.col === t.col && o.row < t.row && o.state === 'closed' && !o.safe).sort((a, b) => b.row - a.row);
    if (!above.length) return;
    lockTile(above[0], C.accent, 'antigrav');
    setMsg('> antigrav: the ICE above came down.', C.accent);
    await wait(200);
  },
  // UNRAVEL: one more ICE in the hit node's row locks
  async unravel(t) {
    const lv = st.lv, opts = lv.tiles.filter(o => o !== t && o.row === t.row && o.state === 'closed' && !o.safe);
    if (!opts.length) return;
    lockTile(pickR(opts, rngFor(st.run.seed, 'unravel', st.corp.node.id, st.corp.idx, lv.misses)), C.mid, 'unravel');
    setMsg('> unravel: the row comes apart.', C.mid);
    await wait(200);
  },
  // AUTOCOMPLETE: your first miss in a layer strikes out one more ICE.
  async autocomplete(t) {
    const lv = st.lv;
    if (lv.misses !== 1) return;
    const opts = lv.tiles.filter(o => o.state === 'closed' && !o.safe);
    if (!opts.length) return;
    lockTile(pickR(opts, rngFor(st.run.seed, 'acp', st.corp.node.id, st.corp.idx)), C.mid, 'autocomplete');
    setMsg('> autocomplete: struck 1 ICE.', C.mid);
    await wait(200);
  },
  // TWIN LOCK: the hit ICE takes the ICE that looks most like it with it.
  async twinlock(t) {
    const lv = st.lv;
    const opts = lv.tiles.filter(o => o !== t && o.state === 'closed' && !o.safe && !o.loaded);
    if (!opts.length) return;
    const best = Math.max(...opts.map(o => glyphLikeness(o.glyph, t.glyph)));
    const top = opts.filter(o => glyphLikeness(o.glyph, t.glyph) === best);
    lockTile(pickR(top, rngFor(st.run.seed, 'twin', st.corp.node.id, st.corp.idx, lv.misses)), C.mid, 'twinlock');
    setMsg('> twin lock: its twin went too.', C.mid);
    await wait(200);
  },
  // VIRUS: the infection spreads to one ICE node right next to the one you hit.
  async virus(t) {
    const lv = st.lv;
    const nb = lv.tiles.filter(o => o.state === 'closed' && !o.safe && Math.abs(o.col - t.col) + Math.abs(o.row - t.row) === 1);
    if (!nb.length) return;
    // the node next to it glitches a moment (infecting), then locks
    const v = pickR(nb, rngFor(st.run.seed, 'virus', st.corp.node.id, st.corp.idx, lv.misses));
    v.infectAt = performance.now();
    modFired('virus');
    Sound.probe();
    setMsg('> virus: spreading...', C.accent);
    await wait(420);
    v.infectAt = null;
    if (v.state !== 'closed') return;
    lockTile(v, C.accent, 'virus');
    setMsg('> virus: infected the next node.', C.accent);
    await wait(450);
  },
};

// Credits or an item. Returns a short text for the message line.
function grantLoot(r, tier) {
  const run = st.run;
  Sound.loot();
  // an item (more often with a higher STASH), at a rolled tier, if there's room
  if (r() < (has('stash') ? tv('stash', [0.4, 0.6, 1]) : 0.4)) {
    const key = pickR(Object.keys(ITEMS), r), tier = rollTier(r, ITEMS[key]);
    if (addItem(key, tier)) return `got ${ITEMS[key].name}${tier ? ' ' + RARITY[itemView(key, tier).rarity].label.toLowerCase() : ''}.`;
  }
  const cr = Math.round(12 + tier * 8 + r() * 12);
  run.credits += cr; run.earned += cr;
  return `+${cr}cr`;
}

async function die() {
  // CONTINUE?: once per run, 10 seconds to pay 100cr and keep going
  const run0 = st.run;
  if (run0 && has('continue') && !zombie() && !run0.continueUsed && canSpend(100) && st.lv && !st.mp) {
    run0.continueUsed = true;
    modFired('continue');
    const go = await askContinue();
    if (go) {
      run0.credits -= 100; run0.integrity = 1;
      await wipeOut(0);
      showBoard('play');
      resetTimer();
      st.busy = false; st.lv.readyAt = performance.now();
      setMsg('> CONTINUE! 1 integrity left.', C.accent);
      return;
    }
    await wipeOut(0);
    showBoard('play');
  }
  if (st.corp && st.corp.hasBoss) { corpStat(st.corp.def.key).lost++; persist(); }   // codex record
  lightsOn();
  st.busy = true;
  st.timer = null;
  const safeTile = st.lv.tiles[st.lv.safe];
  if (safeTile.state === 'closed') safeTile.state = 'reveal';
  setMsg(zombie() ? '> you fell apart.' : bloodMoney() ? '> broke. real node revealed.' : '> traced. real node revealed.', C.danger);
  st.dying = true;      // the music powers down instead of cutting out
  Sound.death();
  await wait(1100);
  await endRun(false);
}

// win = cashed out after a sector clear.
async function endRun(win) {
  const run = st.run;
  st.busy = true;
  st.timer = null;
  run.ended = true;
  clearRun();
  if (!win) {
    // Losing: the whole screen glitches out.
    const cells = snapshot(() => true);
    st.hideAll = true;
    st.wipe = null;
    const ms = fallOut(cells); flash(C.danger, 0.2, 0.4);
    Sound.collapse(ms / 1000);
    await wait(ms + 150);
  }
  // Winning: the final boss's success wipe carries straight into the results screen.

  const newBest = !run.practice && run.depth > save.best;
  if (!run.practice) {
    save.runs++;
    if (win) save.wins++;
    if (newBest) save.best = run.depth;
  }
  // REP: cashing out banks it all; dying banks nothing (DEADMAN keeps a part).
  const repWorth = repFor(run);
  const rep = run.practice ? 0 : win ? repWorth : Math.floor(repWorth * [0, 0.25, 0.5][legacyLv('dms')]);
  if (rep) { save.rep = (save.rep || 0) + rep; save.repTotal = (save.repTotal || 0) + rep; }
  if (win && !run.practice) save.cashouts = (save.cashouts || 0) + 1;
  save.history.unshift({ seed: run.seed, depth: run.depth, corps: run.corps, sector: (run.sector || 0) + 1, win, rep, practice: run.practice, at: Date.now() });
  save.history = save.history.slice(0, 20);
  persist();
  lbSubmit(run, win);   // the online leaderboard (engine/leaders.js)

  // Where you were traced, and the corps you breached (visited corp nodes you finished).
  const c = st.corp;
  const diedAt = !win && c ? `${c.def.name}${c.hasBoss ? (st.lv && st.lv.boss ? ' BOSS' : ` ${c.idx + 1}/${c.counts.length - 1}`) : ''}${run.sector ? `, sector ${run.sector + 1}` : ''}` : '';
  const breached = run.visited.map(id => run.map[id])
    .filter(n => (n.type === 'corp' || n.type === 'final') && (win || n.id !== run.at)).map(n => n.corp);
  st.result = { win, depth: run.depth, corps: run.corps, earned: run.earned, newBest, practice: run.practice, seed: run.seed,
    rep, repWorth, sectors: run.sectorsCleared || 0,
    diedAt, breached, mods: run.mods.slice(), modTier: Object.assign({}, run.modTier), items: run.items.map(x => Object.assign({}, x)),
    map: run.map, visited: run.visited.slice(), at: run.at };
  st.corp = null; st.lv = null;
  st.dying = false;
  scenePalette(null);
  showBoard('over');
  // Losing builds the results up out of the empty screen (no decode-in).
  st.overReveal = win ? null : { t0: performance.now() + 200, shown: 0, typed: 0, y: null, lt: 0 };
  st.overMap = null;
  if (!win) st.boardStart = -1e9;
  {
    const scrollMap = d => {
      const om = st.overMap; if (!om || om.view == null) return;
      const t = clamp(om.top + d, 0, mapRows(st.result.map) - om.view);
      if (t !== om.top) { om.top = t; Sound.tick(); }
    };
    st.scroll = scrollMap;
    st.keyHandler = k => { if (k === 'arrowup' || k === 'arrowdown') { scrollMap(k === 'arrowup' ? -1 : 1); return true; } return false; };
    if (st.lbPost) st.keyHandler = lbOverKeys(st.keyHandler);   // the leaderboard initials (engine/leaders.js)
  }
  st.busy = false;
  setMsg(win ? '> root access_' : '> link severed_', win ? C.accent : C.danger);
  if (win) { flash(C.accent, 0.25, 0.8); Sound.ui(); }
}

// ---------------- Sector clear ----------------
// OMNI beaten: fireworks, then cash out (bank REP, the run ends) or push on into the
// next sector, which starts at the OMNI you just beat.
async function sectorClear(skipped) {
  const run = st.run;
  run.sectorsCleared = (run.sectorsCleared || 0) + 1;
  run.pending = { kind: 'sector', skipped };
  if (!run.practice && run.sectorsCleared > (save.bestSector || 0)) { save.bestSector = run.sectorsCleared; persist(); }
  st.corp = null; st.lv = null; st.timer = null; st.dying = false;
  saveRun();
  showSectorClear(skipped, true);
}
function showSectorClear(skipped, fanfare) {
  const run = st.run;
  st.result = { sector: true, skipped, depth: run.depth, corps: run.corps, earned: run.earned, n: run.sectorsCleared,
    rep: repFor(run), practice: run.practice, seed: run.seed, boss: st.corp ? st.corp.def.name : FINAL.name };
  st.corp = null; st.lv = null; st.timer = null;
  scenePalette(null);
  showBoard('over');
  st.overReveal = null; st.overMap = null;
  st.busy = false;
  setMsg('> root access_', C.accent);
  if (fanfare) {
    if (skipped) Sound.bossWin();   // a skipped boss never played its fanfare
    flash(C.accent, 0.25, 0.8); shake(6, 0.5); fireworkShow();
  }
}
async function pushOn() {
  const run = st.run;
  if (st.transitioning || !run) return;
  const old = run.sector, skipped = !!(run.pending && run.pending.skipped);
  run.sector++;
  addSector(run.map, run.seed, run.sector);
  st.result = null;
  // Beat OMNI (not skipped): its boss reward first, then the map climbs from the old
  // sector to the new one. Cashing out skips it (the run ends anyway).
  if (skipped) { run.pending = null; return swapTo(() => toMap(old)); }
  run.pending = { kind: 'omni', from: old };
  saveRun();
  await swapTo(() => openOmniReward(old));
}
// OMNI is every corp at once: a boss mod from any corp, a general mod, and one more.
function openOmniReward(from) {
  const run = st.run;
  const r = rngFor(run.seed, 'omni', from);
  const corpPick = pickMods(r, modsOfKind('corp'), 1);
  const gen = pickMods(r, modsOfKind('gen'), 1, corpPick);
  const third = pickMods(r, modsOfKind('gen', 'minor'), 1, corpPick.concat(gen));
  const exotic = exoticOffer(run.seed, 'sector', from, 1);   // the sector boss always has one (if any are left)
  openChoice({
    title: 'OMNI//CORE BREACHED', col: C.accent,
    head: [[`sector ${from + 1} spoils. take one.`, C.text]],
    options: shuffle(corpPick.concat(gen, third), r).concat(exotic),
    skipLabel: '[ SKIP  +40cr ]',
    onSkip: () => { run.credits += 40; run.earned += 40; Sound.loot(); },
    msg: '> the core is open.',
    next: () => toMap(from),
  });
}
async function cashOut() {
  if (st.transitioning || !st.run) return;
  st.transitioning = true;
  Sound.ui();
  await wipeOut(0);
  st.transitioning = false;
  endRun(true);
}

const jackIn = () => startRun(st.seed, st.practice);
const retry = () => startRun(st.result ? st.result.seed : st.seed, true);
const newRun = () => startRun(newSeed(), false);
