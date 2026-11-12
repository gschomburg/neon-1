// NeoN+1 engine/run.js: The run: corps, layers, picks, hits, mod effects by stage, sector clear.
'use strict';
NEON_FILES.push(['engine/run.js', 'v14.85']);

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
  st.practice = false; st.seeded = false;
  Sound.ui();
  setMsg('> new seed rolled.');
}

async function startRun(seed, practice, opts = {}) {
  if (st.transitioning) return;
  st.transitioning = true;
  Sound.ui();
  await wipeOut(0);
  const quest = opts.tutorial ? null : opts.quest || questSeed(seed);   // H3AV3N (engine/heaven.js): a QUEST run
  if (quest === 'h3av3n') practice = !save.beatG0D;   // (not scored until you've beaten G0D once)
  else if (quest === 'had3s') practice = false;   // HAD3S: a real run (engine/quests.js)
  // seeded: a seed you chose (typed, REPLAYS, retry): a normal run, but it's ranked on the seed boards, not TODAY /
  // ALL TIME (engine/leaders.js; docs/ENDGAME.md, decided 2026-11-05). Not a quest seed, not the training.
  const seeded = !!opts.seeded && !quest && !opts.tutorial;
  st.seed = seed; st.practice = practice; st.seeded = seeded;
  st.run = {
    seed, practice, quest, seeded,
    map: genMap(seed),
    finalTell: pickR(['corner', 'mark', 'mirror'], rngFor(seed, 'final')),
    at: '0:1', visited: ['0:1'],
    integrity: CONFIG.startIntegrity + legacyLv('hard'), maxInt: CONFIG.startIntegrity + legacyLv('hard'), shield: 0,
    credits: 25 * legacyLv('cash'), earned: 0, items: CONFIG.startItems.map(key => ({ key, tier: 0, n: 1 })), loot: [], mods: [], modTier: {},
    beltSlots: CONFIG.beltSlots + legacyLv('belt'), reroutes: 0,
    depth: 0, corps: 0, sector: 0, sectorsCleared: 0, resumes: 0, pending: null,
  };
  if (oneUpOpen(st.run, opts)) st.run.oneUp = 1;   // the 1UP (beat G0D): you start with one
  if (legacyLv('kit')) st.run.items.push({ key: 'patch', tier: 0, n: 1 });
  if (quest === 'had3s') st.run.items.push({ key: 'leash', tier: 0, n: 1 });   // HAD3S: you go in with a LEASH
  if (!opts.tutorial) questRunStart(st.run);   // the OMNI RAID: b0y's CALL (engine/quests.js)
  if (quest === 'h3av3n') { st.run.heaven = true; questMold(st.run); }   // (a heaven run from the start: its death screen retries it; sector 1's M0LD)
  if (opts.heaven) heavenSetup();   // H3AV3N (engine/heaven.js): its sector map in place of the first sector (the editor's jump, the ending's THE MAZE)
  if (legacyLv('lucky') && !opts.tutorial) {   // LUCKY START (THE BOARD): a random common gear
    const pool = shopGear().filter(k => ITEMS[k].rarity === 'common');
    if (pool.length) st.run.items.push({ key: pickR(pool, rngFor(seed, 'lucky')), tier: 0, n: 1 });
  }
  if (opts.tutorial) tutorialRun(st.run);   // the training run (engine/tutorial.js)
  st.petS = null;   // (a new run: the pet starts fresh)
  if (!opts.tutorial) startPet(st.run);   // STRAY / CATPHISH: a pet from the start (engine/pet.js)
  featRunStart(st.run);   // engine/feats.js: the run's starting credits; NEWB if you skipped the training
  // LOCKER (THE BOARD): the mod you put away when you last cashed out (not into practice runs or the training)
  if (save.locker && !practice && !opts.tutorial) {
    const lk = save.locker;
    save.locker = null; persist();
    if (MODS[lk.key]) { addMod(lk.key, lk.tier || 0); FEAT_QUEUE.push({ head: 'LOCKER', lines: [`${MODS[lk.key].name} came out of the locker.`, "it's on your bar."] }); }
  }
  for (const x of st.run.items) markSeen(x.key);
  statRunStart(); statNodeStart(st.run.map['0:1']);   // play stats (engine/stats.js)
  clearRun();
  st.result = null;
  st.transitioning = false;
  // Straight into the public net; the map comes after.
  startCorp(st.run.map['0:1']);
}

function toMap(fromSector) {
  if (st.run && st.run.stat && st.run.stat.node) statNodeEnd('done');   // a market / cache / safehouse left
  st.corp = null; st.lv = null; st.timer = null;
  scenePalette(null);
  st.mapSel = null; st.hoverNode = null; st.mapPeek = null;
  st.run.pending = null;
  showBoard('map');
  // The map shows one sector at a time; scrolling moves a whole sector, line by line.
  const target = sectorViewRow(st.run.sector);
  st.mapView = { sector: st.run.sector, row: fromSector != null ? sectorViewRow(fromSector) : target, target, t: 0 };
  st.scroll = d => scrollMapSector(d > 0 ? -1 : 1);   // wheel / swipe down = older sectors
  st.busy = false;
  setMsg(st.run.sector ? `> sector ${st.run.sector + 1}. choose your next target.` : '> choose your next target.');
  saveRun();
  // A new sector's event: its card, once (after the map's climb settles); otherwise maybe an ad
  const ev = sectorEvent();
  if (ev && !(st.run.evSeen || []).includes(st.run.sector)) showEventCard(st.run.sector);
  else adBreak('map');   // maybe an ad, over the map
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

// Going back in (the user, 2026-10-31): the node you're standing on, if it's a market, the PIER, or a cache you haven't
// taken the pick from. It opens as you left it (engine/panels.js run.shops / run.caches).
function canGoBack(n) {
  const run = st.run;
  if (!run || !n || run.at !== n.id || n.exit) return false;
  return n.type === 'shop' || n.type === 'pier' || (n.type === 'cache' && run.caches && run.caches[n.id] === 'open') || (n.type === 'repair' && n.bench && benchOpen());   // (a safehouse: back to its WORKBENCH)
}
async function goBackIn(n) {
  if (st.transitioning || !canGoBack(n)) return;
  st.transitioning = true; st.mapSel = st.mapPeek = null;
  await wipeOut(0);
  st.transitioning = false;
  if (n.type === 'shop') return openShop(n);
  if (n.type === 'cache') return openCache(n);
  if (n.type === 'pier') return openPier(n);
  if (n.type === 'repair') return openBench(n);
}
function selectNode(id) {
  if (st.transitioning || !availableNodes().includes(id)) return;
  if (!tutAllows('node', id)) return tutNo();
  if (st.mapSel === id) return enterNode(st.run.map[id]);
  st.mapSel = id;
  Sound.ui();
}

async function enterNode(node, warp = false) {
  if (st.transitioning || !node || (!warp && !availableNodes().includes(node.id))) return;
  if (node.heaven === 'g0d') return g0dWakeStart(node);   // G0D: the wake-up on the map, then the fight (engine/heaven.js)
  st.transitioning = true;
  const run = st.run;
  if (!warp && carOn() && !availableNodes(true).includes(node.id)) { run.carUsed = run.sector; modFired('car'); Sound.whoosh(); setMsg('> C.A.R.: complete assisted route. vroom.', C.accent); }   // off the links: that's the drive for this sector
  { const cur = run.at && run.map[run.at]; if (run.tunnel && cur && cur.step === node.step) (run.dug = run.dug || []).push([cur.id, node.id]); }   // TUNNEL: the dug path stays on the map (engine/mapview.js)
  run.tunnel = false; run.warpAim = false; run.skipAim = false; run.wormAim = false;   // TUNNEL, aimed WARP, SKIP: this was the move (an armed WORM just turns off: it isn't spent)
  stimDown();   // STIM wears off once you leave its corp
  await wipeOut(0);
  run.at = node.id;
  run.visited.push(node.id);
  statNodeStart(node);
  st.transitioning = false;
  if (node.type === 'shop') return openShop(node);
  if (node.type === 'cache') return openCache(node);
  if (node.type === 'pier') return openPier(node);   // fishing (engine/fishing.js)
  if (node.type === 'repair') return openRepair(node);
  if (node.type === 'fence') return openFence(node);
  startCorp(node);
}

// ---------- Layer plans (shared: the game, the editor's loot viewer, tools/checks/check.js) ----------
// A corp's plan for one visit: how many nodes each layer has, the tell (OMNI borrows one; deeper MIRRORLINE and
// PERIMETER change theirs), the SIGIL mark, how strong the tell is this deep. run: { seed, tutorial, finalTell }.
function corpPlan(node, def, run) {
  const t = node.tier, sector = node.sector || 0;
  const counts = def.counts ? def.counts(t) : node.type === 'start' ? [1] : run.tutorial && node.id === TUT.corpNode ? TUT.counts.slice()
    : Array.from({ length: CONFIG.corpLayers + (sectorHas('grind', sector) ? 1 : 0) }, (_, i) => clamp(t + 1 + i + (def.nodes || 0), 2, CONFIG.maxNodes));
  // OMNI borrows a tell, a new one each sector
  let tell = node.type === 'final' && node.corp === 'omni' && !def.copied ? (sector === 0 ? run.finalTell : pickR(['corner', 'mark', 'mirror'], rngFor(run.seed, 'final', node.sector))) : def.tell;
  if (tell === 'mirror' && t >= 2) tell = 'vmirror';   // deeper Mirrorlines mirror top-bottom
  if (tell === 'corner' && t >= 2 && node.type !== 'final') tell = 'edge';   // deeper Perimeters: anywhere on the edge (OMNI keeps corners)
  let mark = null;
  if (tell === 'mark') {
    const level = clamp(t, 1, 3);
    mark = { level, glyph: level === 1 ? pickR(MOTIFS, rngFor(run.seed, 'sigil', node.id)) : null };
  }
  return { counts, sector, tell, mark, tellStr: Math.max(0.55, CONFIG.tellStrength - CONFIG.sectorHeat * sector) };
}
// What genLayer gets for layer idx of a corp visit. c: st.corp (or the same fields: def, node, tier, counts, tell, mark,
// tellStr, hasBoss, mod, sector, carry).
function layerSpec(c, run, idx, prevSafe) {
  const n = c.counts[idx], boss = c.hasBoss && idx === c.counts.length - 1;
  return { seed: run.seed, nodeId: c.node.id, idx, n, tell: boss && c.def.bossTell ? c.def.bossTell : c.tell, prevSafe,
    loot: !boss && c.hasBoss && !c.def.noLoot && (!run.tutorial || idx === 1), lootSure: !!run.tutorial && idx === 1, mark: c.mark,
    tellStr: c.tellStr, salt: 0,   // (the seed decides the layers, always: a resume brings back the same ones; the user, 2026-10-30)
    dress: c.hasBoss ? c.def.dress : null, tier: c.tier, boss,
    alwaysFollow: !!c.def.alwaysFollow || !!run.tutorial, carry: c.carry || null, lootMore: c.mod === 'loaded' || sectorHas('flush', c.sector) };   // FLUSH: more $ nodes
}

async function startCorp(node, startIdx = 0, restore = null) {
  if (!restore && startIdx === 0) oneUpSavePoint(node);   // the 1UP's save point: the run as you go in (before anything below)
  let def = corpDef(node.corp);
  if (node.type === 'final' && node.corp === 'omni') {   // OMNI copies one corp you beat in this sector
    const pool = ((st.run.beat || {})[node.sector || 0] || []).filter(k => CORPS[k]);
    if (pool.length) def = omniCopy(pickR(pool, rngFor(st.run.seed, 'omnicopy', node.sector || 0)), pool);
  }
  const t = node.tier, { counts, sector, tell, mark, tellStr } = corpPlan(node, def, st.run);
  st.corp = {
    def, node, tier: t, idx: Math.min(startIdx, counts.length - 1), counts,
    hasBoss: node.type !== 'start',
    tell, mark, mod: (node.type === 'corp' || node.type === 'final') && ANOMALIES[node.mod] ? node.mod : null,
    stageBoss: node.type === 'final' && node.corp !== 'omni',
    timer: def.timer ? Math.max(6, corpTimer(def, t) - sector) : 0, pay: corpPay(def, t),
    sector, tellStr,
    prevSafe: null,
  };
  // FAILSAFE legendary recharges each corp you go into (not on a resume: that would refill it for free)
  if (!restore && st.corp.hasBoss && has('failsafe') && modTier('failsafe') >= 1 && !has('zombie')) st.run.failsafeUsed = false;
  if (restore) {   // a resumed save: what this corp had used up so far
    for (const k of CORP_SAVE) if (restore[k] != null) st.corp[k] = restore[k];   // (engine/save.js)
  }
  if (!restore && st.corp.mod === 'rival') st.corp.hkRival = hkRivalFor(node);
  if (!restore && st.corp.hasBoss && has('reload')) reloadGear();   // RELOAD: singles get a second (engine/active.js)   // RIVAL: one of the cast (engine/hackers.js)
  if (st.corp.hasBoss) {
    // MUTATE: this corp, it counts as a random other mod.
    if (st.run.mods.includes('mutate')) {
      const pool = modsFound('gen', 'minor').filter(k => !st.run.mods.includes(k) && !['buffer', 'stash', 'burner'].includes(k));
      st.run.mutateAs = pickR(pool, rngFor(st.run.seed, 'mutate', node.id));
      // at rare or better (any step of it that is; a mod with none comes at its top step)
      const md = MODS[st.run.mutateAs], steps = (md.tiers || [{}]).map((s, i) => ({ i, lvl: RARITY[s.rarity || md.rarity].lvl }));
      const good = steps.filter(s => s.lvl >= RARITY.rare.lvl);
      st.run.mutateTier = good.length ? pickR(good, rngFor(st.run.seed, 'mutatet', node.id)).i : steps.length - 1;
      if (!restore) st.corp.mutateNew = true;   // the tray flashes what it became
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
    [def.mapLine || `> mapping ${c.counts.length - 1} layers + boss .... ok`, C.mid],   // (mapLine: a corp with no real count, G0D MAZE)
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
    wrapText(def.intel || '', 31).forEach(l => T(l, C.text));   // (a long one wraps: G0D MAZE's ran off a phone's screen)
    T(rules, C.mid);
    if (c.mod) T(`+ ${ANOMALIES[c.mod].name}: ${ANOMALIES[c.mod].desc}`, C.money);
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
  const spec = layerSpec(c, run, c.idx, c.prevSafe), n = spec.n, boss = spec.boss;
  const lv = genLayer(spec);
  lv.after = c.prevSafe;       // last layer's real node, for AFTERIMAGE
  if (c.mod === 'branded' && n > 2) {   // BRANDED: about a third of the ICE wear the sigil
    const ice = shuffle(lv.tiles.filter(t => !t.safe && !t.loaded), rngFor(run.seed, 'brand', c.node.id, c.idx));
    for (const t of ice.slice(0, Math.max(1, Math.round(ice.length / 3)))) { t.marked = true; t.brand = true; }
  }
  if (c.mod === 'blackice' && n > 1) {   // BLACK ICE: about a quarter of the ICE (at least 1); no tell
    const ice = shuffle(lv.tiles.filter(t => !t.safe && !t.loaded), rngFor(run.seed, 'blackice', c.node.id, c.idx));
    for (const t of ice.slice(0, Math.max(1, Math.round(ice.length / 4)))) t.black = true;
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
  if (c.zd > 0 && n > 1 && c.hasBoss) { lv.tiles[lv.safe].zd = true; c.zd--; }   // 0DAY (gear): the real node, marked
  if (has('quantum') && n >= 3 && c.hasBoss && !c.def.tap && !st.mp) {   // QUANTUM: a second real node, random
    const opts = lv.tiles.filter(t => !t.safe && !t.loaded);
    if (opts.length) pickR(opts, rngFor(run.seed, 'quantum', c.node.id, c.idx)).quantum = true;
  }
  if (run.snoozed && run.snoozed.length && n > 1 && c.hasBoss && !st.mp && !modOffIn('snooze', c.def)) snoozeIn(lv, rngFor(run.seed, 'snoozein', c.node.id, c.idx));
  lv.eater = has('iceeater') && n > 1 && !st.mp && !modOffIn('iceeater', c.def);   // ICE EATER: eat the ICE (a 1-node layer is just the real one)
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
    { const lm = n > 1 && c.def.layerMsg ? c.def.layerMsg(lv, c) : null;   // (a corp's own line: a string or { text, col })
      Sound.layer(run.depth); setMsg(n === 1 ? '> one node. it is real. jack in.' : lm ? (lm.text || lm) : `> ${lv.n} nodes. ${lv.tiles.some(t => t.quantum) ? 'two are' : 'one is'} real.`, lm && lm.col ? lm.col : C.text); }
    if (has('precog') && c.hasBoss && n > 1) {   // PRECOG: the real node shows up a beat early
      modFired('precog');
      for (const t of lv.tiles) if (!t.safe) t.hidden = true;
      Sound.ping(1568); await wait(260);
      for (const t of lv.tiles) t.hidden = false;
      await wait(220);
    } else await wait(480);
  }
  // START stage: layer-start mods, left to right on the bar. Each locks one ICE (a legendary SNIFFER: two, when
  // there are 3 or more ICE).
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
    if (key === 'corners') {   // FENCELINE: every ICE on one random edge (never all of the ICE)
      const edges = [t => t.row === 0, t => t.row === lv.rows - 1, t => t.col === 0, t => t.col === lv.cols - 1].map(iceWhere).filter(e => e.length);
      if (!edges.length) continue;
      const left = iceWhere(() => true).length;
      const edge = pickR(edges, rngFor(run.seed, key, c.node.id, c.idx)).slice(0, left - 1);
      if (!edge.length) continue;
      for (const t of edge) lockTile(t, C.mid, key);
      setMsg(`> fenceline: ${edge.length} ICE locked.`, C.mid);
      await wait(250);
      continue;
    }
    const opts = iceWhere(f);
    if (!opts.length) continue;
    const first = pickR(opts, rngFor(run.seed, key, c.node.id, c.idx));
    lockTile(first, C.mid, key);
    const more = key === 'sniffer' && tv('sniffer', [1, 2]) > 1 && opts.length >= 3 ? opts.filter(t => t !== first) : [];
    if (more.length) lockTile(pickR(more, rngFor(run.seed, key, c.node.id, c.idx, 2)), C.mid, key);
    setMsg(`> ${MODS[key].name.toLowerCase()}: ${more.length ? 2 : 1} ICE locked.`, C.mid);
    await wait(250);
  }
  // FOUR IN A ROW: an armed boss starts with 2 ICE locked
  if (lv.boss && st.run.p4Ready && has('fourinarow')) {
    st.run.p4Ready = false;
    for (const t of shuffle(iceWhere(() => true), rngFor(run.seed, 'p4', c.node.id)).slice(0, 2)) lockTile(t, C.money, 'fourinarow');
    setMsg('> four in a row: 2 ICE down.', C.money);
    await wait(250);
  }
  if (c.magnet && c.hasBoss && lv.tiles.some(t => t.state === 'closed' && t.loaded)) { magnetPull(lv, false); await wait(250); }   // MAGNET (rare): on all corp
  if (c.node.worm && c.hasBoss && n > 2) { if (wormBite(lv, c, run)) await wait(250); }   // WORM: it got here first
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
  if (c.anchored) lv.anchor = true;   // ANCHOR (gear): nothing moves, the whole corp
  if (c.hasBoss && c.def.intro && n > 1) { await c.def.intro(lv, c); if (st.lv !== lv) return; }   // corp kit: MONTE's shuffle
  if (lv.maskMs) lv.maskAt = performance.now() + lv.maskMs;   // corp kit: FORGET-ME-NOT
  // JACK-IN-THE-BOX: in one layer per corp, an ICE pops out 1-3s in (layerTick does it)
  if (has('companion') && c.hasBoss && n > 2 && c.petIdx === c.idx) lv.petAt = performance.now() + 1500 + rngFor(run.seed, 'pett', c.node.id)() * 3000;
  if (has('goat') && c.hasBoss && n > 2 && c.petIdx === c.idx) lv.goatAt = performance.now() + 1800 + rngFor(run.seed, 'goatt', c.node.id)() * 2500;   // GOAT: once a corp, lunch
  if (has('jackbox') && c.hasBoss && n > 2 && c.jackIdx === c.idx) lv.jackAt = performance.now() + 1000 + rngFor(run.seed, 'jackt', c.node.id)() * 2000;
  st.busy = false;
  lv.readyAt = performance.now();
  lv.shownAt = lv.readyAt;
  if (c.slomo) lv.clockRate = 0.5;   // SLOMO (gear): the whole corp
  if (c.bees && n > 1) beeSwarm(lv, 1, true);   // BEES (gear): the swarm stays for the corp
  if (c.frozen) freezeLayer(lv);   // REWIND legendary: every timer stays stopped, the whole corp   // unlike readyAt, this one doesn't reset after a miss
  c.express = false;
  // MUTATE: say what it became (the tray flashes it too)
  if (c.mutateNew && run.mutateAs && MODS[run.mutateAs]) {
    c.mutateNew = false; st.mutateAt = performance.now(); modFired('mutate'); Sound.probe();
    const mv = modView(run.mutateAs, run.mutateTier || 0);
    setMsg(`> mutate: now ${mv.name.toLowerCase()} (${RARITY[mv.rarity].label.toLowerCase()}).`, C.accent);
  } else if (c.hasBoss && n > 1) {
    // tap-to-use mods: the first time each one is ready in a run, say so
    const k = run.mods.find(k => MODS[k].active && modUsable(k) && !(run.tapHinted || []).includes(k));
    if (k) { run.tapHinted = (run.tapHinted || []).concat(k); setMsg(`> [${MODS[k].short}] is ready: tap it in your mods.`, C.accent); }
  }
  // LEVERAGE: every corp layer takes a loan payment, in debt or not (never past the limit)
  if (leverage() && n > 1 && c.hasBoss) {
    const cut = Math.min(DEBT.payment + DEBT.paymentSector * (run.sector || 0), Math.max(0, run.credits - creditFloor()));
    if (cut > 0) { run.credits -= cut; modFired('leverage'); }
  }
  // LEVERAGE: debt grows every layer; past the limit the collectors take 1 integrity
  if (leverage() && run.credits < 0 && n > 1 && c.hasBoss) {
    run.credits -= Math.max(DEBT.interestMin, Math.round(-run.credits * DEBT.interest));
    modFired('leverage');
    if (run.credits < creditFloor()) { hurt(1); Sound.trap(); flash(C.danger, 0.15, 0.3); setMsg('> the collectors came. -1.', C.danger); if (run.integrity <= 0) return die(); }
  }
  // ZOMBIE: every layer adds rot
  if (zombie() && n > 1 && c.hasBoss) { addRot(ROT.layer); if (run.integrity <= 0) return die(); }
}

// Clock for this layer: the corp's own, or one added by OVERCLOCK.
function makeTimer() {
  const c = st.corp, lv = st.lv;
  let max = c.timer || ((has('overclock') || has('surge')) && c.hasBoss ? CONFIG.overclockClock : 0) || (c.mod === 'rush' ? 10 : 0);
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
  if (!tm || st.mode !== 'play' || st.busy || st.transitioning || st.dev || st.term || st.pause || st.editorHold) return;   // the terminal is open; mode.hold / the editor's TESTING tab (stop clocks) holds them still
  if (st.lv && st.lv.holdUntil && performance.now() < st.lv.holdUntil) return;   // ESPRESSO, FREEZE FRAME
  tm.left -= dt * ((st.lv && st.lv.clockRate) || 1);   // TIMEWARP
  const sec = Math.ceil(tm.left);
  if (sec < tm.lastSec) {
    tm.lastSec = sec; if (sec <= 3 && sec > 0) Sound.clock();
    if (st.corp && sectorHas('timeismoney', st.corp.sector) && st.run.credits > 0) st.run.credits = Math.max(0, st.run.credits - costInt(ECON.events.timeCr));   // TIME IS MONEY
  }
  // OVERCLOCK: near the end, purge ICE one by one; each purge cuts the payout.
  const lv = st.lv;
  if (has('overclock') && tm.left <= tm.ocNext && tm.left > 0.5 && lv.ocCount < 3) {
    tm.ocNext -= 2;
    const opts = lv.tiles.filter(t => !t.safe && t.state === 'closed');
    if (opts.length > 0 && candidates().length > 1) {
      lockTile(opts[Math.floor(rngFor(st.run.seed, 'overclock', st.corp ? st.corp.node.id : '', st.corp ? st.corp.idx : 0, lv.ocCount)() * opts.length)], C.mid, 'overclock');   // (on the seed)
      lv.ocCount++;
      lv.payCut = Math.min(0.9, lv.payCut + ECON.modx.overclockCut);
      setMsg(`> overclock: purged 1. pay -${Math.round(lv.payCut * 100)}%`, C.mid);
    }
  }
  if (tm.left <= 0 && has('overtime') && st.lv && !st.lv.otUsed) {   // OVERTIME: once a layer, 5 more seconds
    st.lv.otUsed = true; tm.left = 5; tm.lastSec = 5;
    Sound.shield(); setMsg('> overtime! +5s.', C.accent); modFired('overtime');
    return;
  }
  if (tm.left <= 0 && corpHas('clockOut')) { tm.left = 0; return corpHook('clockOut'); }   // a corp's own clock-out (G0D MAZE)
  if (tm.left <= 0 && (eaterOn() || zombie())) return clockHurts();   // no random tap: it costs you instead
  if (tm.left <= 0) {
    tm.left = 0;
    const opts = candidates().length ? candidates() : st.lv.tiles.filter(t => t.state === 'closed');
    const t = opts[Math.floor(rngFor(st.run.seed, 'clockout', st.corp ? st.corp.node.id : '', st.corp ? st.corp.idx : 0, (st.lv.clockOuts = (st.lv.clockOuts || 0) + 1))() * opts.length)];   // (on the seed)
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
  if (st.mode !== 'play' || st.busy || st.transitioning || st.dev || st.term || st.pause || st.mp || st.wipe || lv.shownAt == null) return;
  // JACK-IN-THE-BOX: pop!
  if (lv.jackAt && now > lv.jackAt) {
    lv.jackAt = null;
    const opts = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
    if (opts.length && candidates().length > 1) {
      lockTile(pickR(opts, layerRng('jackbox')), C.money, 'jackbox');
      Sound.jingle();
      setMsg('> jack-in-the-box: pop! 1 ICE out.', C.money);
    }
  }
  // COMPANION: sniff sniff (for a 1cr treat)
  if (lv.petAt && now > lv.petAt) {
    lv.petAt = null;
    const opts = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
    const treat = costInt(ECON.companion);
    if (!canSpend(treat)) setMsg('> no treats, no sniffing. (0cr)', C.mid);
    else if (opts.length && candidates().length > 1) {
      st.run.credits -= treat;
      const sniffed = pickR(opts, layerRng('pet'));
      lockTile(sniffed, C.accent, 'companion');
      petSniff(sniffed);   // the pet runs over to it
      Sound.jingle();
      setMsg(`> sniff sniff. 1 ICE found. -${treat}cr`, C.accent);
    }
  }
  if (lv.goatAt && now > lv.goatAt) { lv.goatAt = null; goatEats(lv); }   // GOAT (MONTY's zonk)
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
  if (def) {   // hackers (engine/hackers.js): a RIVAL corp's rival comes in on its first layer; then everyone plays
    if (st.corp.hkRival && !hkList().some(h => h.id === st.corp.hkRival) && (st.corp.hkRival !== 'iceman' || st.corp.ice > 0)) hkSpawn(st.corp.hkRival, 'rival');   // (ICE MAN waits for your first ICE hit)
    hkTick(lv, now);
    if (st.busy) return;
  }
  if (def && def.tick) def.tick(lv, lv.lt, dt, now);
}

// CHANCE CARD: the card for this corp (applied right away). Returns the note.
function chanceCard(lv, c, run) {
  const u = rngFor(run.seed, 'chance', c.node.id)();
  if (u < 0.3) {
    const ice = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
    if (ice.length > 1) { lockTile(pickR(ice, rngFor(run.seed, 'chancelock', c.node.id)), C.money, 'chancecard'); return 'chance: 1 ICE locked'; }
  }
  if (u < 0.55 || (u < 0.7 && !st.timer)) { const cr = earnInt(ECON.mods.chancecard); earn(cr, run); return `chance: +${cr}cr`; }
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
  if (st.mode === 'play' && !st.busy && st.lv && st.lv.pingAim && holds('ping') && st.lv.tiles[i] && st.lv.tiles[i].state === 'closed') return pingAt(st.lv, st.lv.tiles[i]);   // PING (gear): this tap asks
  if (st.mode === 'play' && !st.busy && st.lv && st.lv.blastAim && st.lv.tiles[i] && st.lv.tiles[i].state === 'closed') return blastAt(st.lv, st.lv.tiles[i]);   // BLAST (gear): this tap aims it
  { const byp = st.lagBypass; st.lagBypass = false;   // corp kit: LAGRANGE holds taps back
    if (!byp && st.mode === 'play' && !st.busy && corpHas('intercept') && st.lv && st.lv.tiles[i] && corpHook('intercept', i)) return; }
  if (st.mode === 'play' && !st.busy && st.lv && st.lv.tiles[i] && st.lv.tiles[i].state === 'closed' && moldDigTile(st.lv.tiles[i])) return;   // the deep M0LD over it: dig first (engine/heaven.js)
  if (st.mode !== 'play' || st.busy) return;
  if (!tutAllows('pick', i)) return tutNo();
  const t = st.lv.tiles[i];
  if (!t || t.state !== 'closed') return;
  if (hkDenied(t)) return;   // SYSOP: ACCESS DENIED
  // ZOMBIE: weak taps. A node takes tapsToBreak() taps; the ones before the last only crack it
  // (the same for ICE and the real node: a crack never tells you which it is).
  if (zombie() && st.corp && st.corp.hasBoss && !st.corp.def.pattern && !st.corp.def.doors) {   // (SIMON, MONTY: a tap is a step or a pick, not a crack)
    const need = tapsToBreak();
    if ((t.cracks || 0) + 1 < need) {
      t.cracks = (t.cracks || 0) + 1; t.crackAt = performance.now();
      Sound.tick(); shake(1.5, 0.12);
      setMsg(`> crack. ${t.cracks}/${need}`, C.mid);
      return;
    }
    t.cracks = 0;
  }
  hkYouTap(t);   // D0PPEL copies it
  st.busy = true;
  st.sel = -1;
  st.selItem = -1; st.selMod = -1;
  st.lv.fast = st.lv.readyAt != null && performance.now() - st.lv.readyAt < CONFIG.fastpayMs;
  st.lv.late = !!(st.timer && st.timer.left <= 3);   // SURGE
  st.lv.surgeF = st.timer ? 1 - st.timer.left / st.timer.max : 0;
  st.lv.pickAt = performance.now();   // AMBUSH
  { const ph = beatClock(performance.now()).phase; st.lv.onBeat = ph < 0.15 || ph > 0.9; }   // ON BEAT
  corpHook('onPick', t);   // corp kit (TOLLGATE)
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
  if (corpHook('tap', t, i)) return;
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
  if (hkStopTap(t)) { st.busy = false; return; }   // MOTHER: not at your last integrity
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
  let base = earnCr(ECON.pay.base) + earnCr(ECON.pay.perNode) * lv.n;   // (data/economy.js)
  if (lv.boss) base *= ECON.pay.boss;
  let mult = c.pay || 1;
  if (c.stageBoss) mult *= ECON.pay.stageBoss;   // a corp as the sector boss pays more
  if ((lv.misses === 0 || lv.eater) && lv.n > 1 && !lv.scanned) mult *= ECON.pay.perfect + ECON.pay.perfectPerNode * (lv.n - 1);   // ICE EATER: every clear is clean
  if (has('skimmer')) mult *= tv('skimmer', ECON.modx.skimmer);   // (the mod numbers: data/economy.js ECON.modx)
  mult *= coinMult();   // COIN FLIP: the streak multiplier
  if (has('quantum') && lv.tiles.some(t => t.quantum)) mult *= ECON.modx.quantum;   // QUANTUM: 2 real, half pay
  if (has('fastpay') && lv.fast) mult *= ECON.modx.fastpay;
  if (has('supersize')) mult *= ECON.modx.supersize;
  if (c.def.surge) mult *= 1 + 0.8 * (lv.surgeF || 0);   // RYDR: pays more the later you pick
  if (has('onbeat') && lv.onBeat) mult *= ECON.modx.onbeat;
  if (c.mod === 'loaded') mult *= 1.2;
  if (c.hasBoss && c.def.faith && !lv.tithed) mult *= 2;   // THE CHOIR: on faith
  if (lv.dd) mult *= 2;                                    // LUCKEEZ: double down
  mult *= hkPayMult(lv);   // LEECH takes a cut, HYPE cheers streaks (engine/hackers.js)
  mult *= 1 - (lv.payCut || 0);
  return lv.n === 1 ? 0 : Math.round(base * mult);
}

async function onSafe(t) {
  const run = st.run, lv = st.lv, c = st.corp;
  t.state = 'safe';
  const perfect = (lv.misses === 0 || lv.eater || lv.tithe) && lv.n > 1 && !lv.scanned;   // TITHE (gear): a perfect, whatever came before
  if (c.hasBoss && lv.n > 1) run.lastReal = { col: t.col, row: t.row };   // DEJA VU
  if (lv.n > 1) { c.scored = (c.scored || 0) + 1; if (perfect) { c.perfects = (c.perfects || 0) + 1; run.perfects = (run.perfects || 0) + 1; } }
  const pay = lv.eater ? Math.max(0, payFor(lv) - (lv.eatPaid || 0)) : payFor(lv);   // ICE EATER: the rest of the layer's pay
  if (pay) for (const [k, on] of [['skimmer', true], ['fastpay', lv.fast], ['supersize', true], ['onbeat', lv.onBeat]]) if (on && has(k)) modFired(k);   // pay boosts
  const tix = c.hasBoss && c.def.tickets;   // CHUCK E. CACHE'S pays in tickets
  if (tix) c.tickets = (c.tickets || 0) + pay;
  else { earn(pay, run); }
  lv.paid = tix ? 0 : pay;
  tallyLayer(run, lv, perfect);   // THE RECORD (engine/feats.js)
  hkOnClear(lv, perfect); hkAfterPay(pay);   // hackers: bars off rivals, NANA heals, LEECH feeds
  let healed = false;
  if (perfect && canHeal() && c.mod !== 'cursed') { heal(CONFIG.perfectHeal); healed = true; }
  const surged = has('surge') && lv.late && canHeal() && c.hasBoss;   // SURGE: a real pick in the last 3s heals 1
  if (surged) { heal(1); modFired('surge'); }
  const rewall = perfect && c.hasBoss && c.bulwarkUsed && has('bulwark');   // BULWARK: a perfect charges it back up
  if (rewall) { c.bulwarkUsed = false; modFired('bulwark'); }
  if (!lv.boss) Sound.safe();
  if (c.hasBoss && c.def.onSafe) c.def.onSafe(t, lv);   // corp kit: SQUALOR's likes
  flash(C.accent, 0.12, 0.3);
  let msg = perfect ? '> perfect.' : '> access granted.';
  if (pay) msg += tix ? ` +${pay} tix` : ` +${pay}cr`;
  if (healed) msg += ' +1 int';
  if (rewall) msg += ' bulwark up';
  if (surged) msg += ' surge +1 int';
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
    const foe = (c.hk || []).find(h => h.side === 'bad');
    st.breachRival = foe ? foe.id : null;   // a rival here: the reveal shows them DEFEATED...
    st.breachEscaped = !!(foe && foe.stoleLast);   // ...or ESCAPED, when they took the corp's last node (no win: engine/hackers.js hkSteal)
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
  return finishCorp();
}

// Corp finished: its last layer is passed (or a NUKE took it).
function finishCorp() {
  const run = st.run, c = st.corp;
  stimDown();   // STIM wears off
  hkCorpEnd(c);   // hackers: the rivals you beat (the record, the bonus)
  questOmni(c);   // the OMNI RAID: OMNI broken with b0y there (engine/quests.js)
  if (run.quest === 'had3s' && c.def.key === 'apiary') { addItem('honey'); setMsg('> APIARY left something sweet behind. H0NEY.', C.money); }   // HAD3S: H0NEY only comes from APIARY
  lightsOn();
  statNodeEnd(c.bossSkipped ? 'skipped' : 'cleared');
  if (c.hasBoss && c.def.onClear) {
    const m = c.def.onClear(c);
    if (m) { const o = typeof m === 'string' ? { text: m, col: C.danger, bad: true } : m; setMsg(o.text, o.col); if (o.bad) Sound.trap(); else Sound.loot(); }
  }
  if (c.node.type === 'start') { run.pending = { kind: 'start', id: c.node.id }; saveRun(); return openStartReward(c.node); }
  run.corps++;
  if (c.node.type === 'corp') { run.beat = run.beat || {}; (run.beat[c.sector] = run.beat[c.sector] || []).push(c.def.key); }
  if (!g0dxNoCount(c)) corpStat(c.def.key).breached++;   // codex record (G0D.exe's wins: a setting, engine/g0dexe.js)
  persist();
  g0dxCorpDone(c);
  tallyCorp(c.def.key);   // THE RECORD
  // THIEF: what it took goes to THE FENCE (bought back there); a sector boss's thief gives them back when you win
  if (c.stolen && c.stolen.length) {
    const fence = c.node.type === 'corp' && Object.values(run.map).some(n => n.type === 'fence' && n.sector === c.sector);
    if (fence) run.fence = (run.fence || []).concat(c.stolen.map(key => ({ key, tier: (run.modTier || {})[key] || 0 })));
    else if (!c.bossSkipped) run.mods.push(...c.stolen.reverse());
    c.stolen = [];
  }
  if (c.node.type === 'final' && c.node.head) {   // HEAD FIRST: its spoils now, then the rest of the sector
    if (c.bossSkipped) { saveRun(); return swapTo(() => toMap()); }
    run.pending = { kind: 'omni', from: c.sector }; saveRun();
    return openOmniReward(c.sector);
  }
  if (c.node.type === 'final') return sectorClear(!!c.bossSkipped);
  if (c.def.noReward) { saveRun(); return swapTo(() => toMap()); }   // (a corp with no reward screen)
  if (c.def.reward) { saveRun(); return c.def.reward(c); }   // (its own: G0D MAZE's MAZE CLEARED)
  run.pending = { kind: 'reward', id: c.node.id, skipped: !!c.bossSkipped };
  saveRun();
  openReward(c.node, !!c.bossSkipped);
}

// START stage notes: short hints shown on row 7. ms: shown only that long after the layer opens.
const START_NOTE = {
};

// LAYER END stage: what each mod does once a layer is passed.
const END_FX = {
  // PICKPOCKET (the user, 2026-10-31): each layer you clear, a chance of a loot item (rarer at the higher steps)
  pickpocket() {
    const run = st.run, c = st.corp;
    if (!c || !c.hasBoss || !st.lv || st.lv.n < 2) return false;
    const r = rngFor(run.seed, 'pickpocket', c.node.id, c.idx);
    if (r() >= tv('pickpocket', ECON.modx.pickpocket)) return false;
    const got = dropLoot(r, 1, tv('pickpocket', ECON.modx.pickpocketRare));
    setMsg(`> pickpocket: ${got[0]}.`, C.money); Sound.loot();
  },
  // SKIPJACK: a perfect can open a skip past the next layer. The player chooses.
  async skipjack(perfect) {
    const run = st.run, c = st.corp;
    if (!(perfect && c.hasBoss && c.idx < c.counts.length &&
      rngFor(run.seed, 'skip', c.node.id, c.idx)() < tv('skipjack', [0.15, 0.25, 0.4]))) return false;
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
function askContinue(price = 100) {
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
      T(`insert ${price}cr to keep going.`, C.text);
      T('you come back at 1 integrity.', C.mid);
      T('');
      X({ box: true, text: `PAY ${price}cr`, id: 'cont', onTap: () => choose(true), minW: 18 });
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
  tally('ice');   // THE RECORD
  hkOnIce(t);   // hackers: LEECH and ICE MAN feed, NANA locks 2
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
    if (has('priority')) { for (let i = 1; i < ECON.modx.priority; i++) msg += ' ' + grantLoot(lr, st.corp.tier); modFired('priority'); }   // PRIORITY: delivered more than once
  }
  // a HIT mod fires unless it returns false (nothing happened); a callout fires it later
  for (const k of modsAt('hit')) {
    if (!HIT_FX[k]) continue;
    const queued = (lv.callouts || []).length;
    if (HIT_FX[k](t) !== false && (lv.callouts || []).length === queued) modFired(k);
  }
  if (t.rejected) msg = msg.replace('> ICE.', '> REJECTED.');   // FORM 27B
  setMsg(msg, t.loaded ? C.money : lv.eater ? C.accent : C.danger);
  corpHook('onHit', t);   // corp twist, after your mods
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
  if (corpHas('afterHit') && st.lv === lv) await corpHook('afterHit', t, lv);   // corp kit: MONTE, GRAVITAS move on a miss
  resetTimer();
  st.busy = false;
  lv.readyAt = performance.now();
}

