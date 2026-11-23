// NeoN+1 engine/deck_shell.js: THE SHELL's charges and the commands the deck's SHELL and SUDO chips give (docs/SHELL.md).
// Moved out of engine/deck.js (the second audit, 2026-11-23). Loads after engine/deck.js.
'use strict';
NEON_FILES.push(['engine/deck_shell.js', 'v16.02']);

// ---------- THE SHELL's charges (docs/SHELL.md "Charges", Greg 2026-11-20) ----------
// SHELL chips give charges (DECK_CHARGES) and their commands cost them (each command's cost: DECK_SHELL_CMDS). One pool:
// run.charges, up to run.chargeMax (what the run's chips give). It starts full. SHELL_REFILL: 'sector' tops it up every
// new sector (for now); 'run' makes it last the whole run (Greg: later, with a BOSS chip, CRON, that brings the sector
// refill back). More from a corp boss's CHARGE pick (gear: +2), and ROOTKIT (CRASH) burns them all to save you.
const SHELL_REFILL = 'sector';
const SHELL_CHARGE = { pack: 2, boss: 0.35 };   // a CHARGE gives 2; a corp boss offers one 35% of the time (with charges to fill)
for (const [k, n] of Object.entries(DECK_CHARGES)) if (DECK_CHIPS[k]) { DECK_CHIPS[k][4] += ` +${n} shell charges.`; DECK_CHIPS[k][6] += ` +${n} charges.`; }
function deckCharges(run) {
  run.chargeMax = (run.chips || []).reduce((a, k) => a + (DECK_CHARGES[k] || 0), 0);
  if (run.chargeMax) run.chargeMax += legacyLv('surge') + jackLv('root', run);   // SURGE (THE BOARD: +1, II +2) and ROOT (a CREW JACK), with a SHELL chip
  run.charges = run.chargeMax;
}
function deckRefill(run) {
  if (SHELL_REFILL !== 'sector' || !run.chargeMax || run.charges >= run.chargeMax) return;
  run.charges = run.chargeMax;
  if (rootOn()) setTimeout(() => { if (st.run === run) setMsg(`> THE SHELL: charges back to ${run.chargeMax}.`, C.accent); }, 1800);
}
// CHARGE: gear from corp boss rewards (engine/panels.js rewardOptions), never in markets or at the bench
ITEMS.charge = { key: 'charge', name: 'CHARGE', price: 0, rarity: 'rare', find: true, noBench: true, nosell: true, desc: `+${SHELL_CHARGE.pack} charges for THE SHELL (up to your max).`,
  tip: `+${SHELL_CHARGE.pack} shell charges.`, where: 'corp boss rewards, while you have SHELL chips.', codex: "a charge pack for THE SHELL. it tops your charges up by 2, never past what your SHELL chips give." };
ITEM_SHORT.charge = 'CHG';
GEAR.charge = {
  ok: () => !!st.run && (st.run.chargeMax || 0) > (st.run.charges || 0),
  use(tier, lv, run) { const was = run.charges || 0; run.charges = Math.min(run.chargeMax, was + SHELL_CHARGE.pack); Sound.buy(); setMsg(`> THE SHELL: +${run.charges - was} charges (${run.charges}/${run.chargeMax}).`, C.accent); },
};
function deckChargeReward(node) {
  const run = st.run; if (!run || !run.chargeMax || !rootOn()) return null;
  return rngFor(run.seed, 'chargereward', node.id)() < SHELL_CHARGE.boss ? { kind: 'gear', key: 'charge', tier: 0, n: 1 } : null;
}
// ROOTKIT (engine/runend.js die): THE SHELL's charges burn and you live, with 1 INT. Any charges will do, every time.
function deckRootkit(run) {
  if (!chipOn('RK1', run) || !(run.charges > 0) || !rootOn() || !st.lv || st.mp) return 0;
  const n = run.charges; run.charges = 0; run.integrity = 1;
  return n;
}
// THE SHELL's commands from chips (engine/shell.js: the 'your deck' group). Known while the chip's on in this run (or in
// dev mode); safe (the run still counts), but the run is marked hacked (run.hacked: the leaderboard's mark, later).
const DECK_SHELL_CMDS = [
  { name: 'whoami', chip: 'WH0', cost: 1, safe: true, help: "your run so far, and the REP you'd bank now", run: () => {
    const run = shellNeedRun(); run.hacked = true;
    return `${profile().name} · sector ${run.sector + 1} · depth ${run.depth}\ncorps ${run.corps} · ${run.credits}cr · INT ${run.integrity}/${run.maxInt}\ncash out now: ${repFor(run)} REP`; } },
  { name: 'man', chip: 'MN1', cost: 1, safe: true, help: "this corp's codex entry (its tell, once you've beaten it)", run: () => {   // ROOT's chip
    const run = shellNeedRun();
    if (!st.corp) throw new Error('only in a corp.');
    const key = st.corp.def.key, d = corpDef(key), rec = corpStat(key);
    run.hacked = true;
    return [`${d.name}${d.level ? '  LV' + d.level : ''}`, d.intel, corpRules(d, 1), CORP_TELL[key] ? (tellKnown(key) ? 'tell: ' + CORP_TELL[key] : 'tell: beat this corp to read it.') : ''].filter(Boolean).join('\n'); } },
  { name: 'ps', chip: 'PS4', cost: 1, safe: true, help: 'the rival hackers in this corp', run: () => {
    const run = shellNeedRun(); run.hacked = true;
    const hs = hkRivalsUp();
    return hs.length ? hs.map(h => `${hkName(h.id).padEnd(10)} ${hkBars(h)}`).join('\n') : 'no rivals here.'; } },
  { name: 'flatline', chip: 'FL3', cost: 3, safe: true, help: 'a rival in this corp drops dead (once a corp)', run: () => {
    const run = shellNeedRun();
    if (!st.corp) throw new Error('only in a corp.');
    if (st.corp.flatlined) throw new Error('used: once a corp.');
    const h = hkRivalsUp()[0];
    if (!h) return 'no rivals here.';
    run.hacked = true; st.corp.flatlined = true;
    hkOut(h, 'flatlined.');
    return `${hkName(h.id)}: flatlined.`; } },
  { name: 'eject', chip: 'EJ1', safe: true, help: 'cash out right here (from the map, once a run)', run: () => {   // EJECT (a CRASH chip: not hacked)
    const run = shellNeedRun();
    if (st.mode !== 'map' || st.corp) throw new Error('only from the map.');
    if (run.ejected) throw new Error('used: once a run.');
    run.ejected = true; setTimeout(() => cashOut(), 300);
    return 'ejecting. cashing out.'; } },
  // ---- v15.03 (docs/DECK.md SHELL: the rest of the list). A command that throws costs nothing (engine/shell.js shellRun).
  { name: 'cd', chip: 'CD2', cost: 2, safe: true, args: [{ name: 'dir', of: () => [{ v: '..', hint: 'back a row' }] }], help: 'cd ..: your next move on the map can go back a row', run: () => {
    const run = shellNeedRun();
    if (st.mode !== 'map' || st.corp) throw new Error('only on the map.');
    if (run.backAim) throw new Error('already open: pick a node.');
    const n = backTargets().length;
    if (!n) throw new Error('nothing back there you skipped.');
    run.backAim = true; run.hacked = true; st.mapSel = null;
    return `cd ..: ${n} node${n > 1 ? 's' : ''} a row back. pick one.`; } },
  { name: 'scan', chip: 'SN5', cost: 1, safe: true, help: 'the corps ahead in this sector (BLINDERS and FOG lifted for it)', run: () => {
    const run = shellNeedRun(), cur = run.map[run.at], base = SECTOR_STEPS * run.sector;
    run.scanned = run.sector; run.hacked = true;   // (engine/map.js blinded, engine/mapview.js FOG)
    const ahead = Object.values(run.map).filter(n => (n.sector || 0) === run.sector && (n.type === 'corp' || n.type === 'final') && !run.visited.includes(n.id) && (!cur || n.step > cur.step)).sort((a, b) => a.step - b.step);
    if (!ahead.length) return 'nothing ahead.';
    return ahead.map(n => `row ${n.step - base}  ${n.type === 'final' ? 'BOSS ' : ''}${corpDef(n.corp).name} T${n.tier || 1}${n.mod && ANOMALIES[n.mod] ? '  + ' + ANOMALIES[n.mod].name : ''}`).join('\n'); } },
  { name: 'rm', chip: 'RM1', cost: 2, safe: true, help: 'delete one ICE on this layer', run: () => {
    const run = shellNeedRun(), lv = deckShellLayer();
    const opts = lv.tiles.filter(t => t.state === 'closed' && !isReal(t) && !t.loaded);
    if (!opts.length || candidates().length <= 1) throw new Error('no ICE left to delete.');
    lv.rms = (lv.rms || 0) + 1;
    lockTile(pickR(opts, rngFor(run.seed, 'rm', st.corp.node.id, st.corp.idx, lv.rms)), C.mid, 'rm');
    run.hacked = true;
    return 'rm: 1 ICE deleted.'; } },
  { name: 'kill', chip: 'KL9', cost: 1, safe: true, args: [{ name: 'signal', of: () => [{ v: '-9', hint: 'for real: the run ends' }] }], help: 'kill -9: flatline yourself. the run ends now, as a death', run: () => {
    const run = shellNeedRun();
    if (st.mp) throw new Error('not in a race.');
    if (!shellIdle()) throw new Error('wait for the screen to settle.');
    run.hacked = true; shellClose();
    setTimeout(() => { if (st.run === run && !run.ended) endRun(false); }, 200);
    return 'killed.'; } },
  { name: 'cat', chip: 'CT1', cost: 1, safe: true, help: 'what a DATA CACHE holds: the one picked on the map, or the next in reach', run: () => {
    const run = shellNeedRun();
    if (st.mode !== 'map' || st.corp) throw new Error('only on the map.');
    const sel = st.mapSel && run.map[st.mapSel];
    const node = sel && sel.type === 'cache' ? sel : availableNodes().map(id => run.map[id]).find(n => n.type === 'cache');
    if (!node) throw new Error('no DATA CACHE picked or in reach.');
    if ((run.caches || {})[node.id]) throw new Error('that one is open already.');
    run.hacked = true;
    return deckCatCache(node).join('\n'); } },
  { name: 'sleep', chip: 'ZZ3', cost: 1, safe: true, help: 'the layer clock stops 5 seconds once you close THE SHELL (once a layer)', run: () => {
    const lv = deckShellLayer();
    if (lv.slept) throw new Error('used: once a layer.');
    lv.slept = true; lv.sleepArm = true; st.run.hacked = true;   // (engine/shell.js shellClose starts it)
    return 'sleep 5: the clock stops for 5s when you close THE SHELL.'; } },
  { name: 'whois', chip: 'WI5', cost: 2, safe: true, help: "this corp's tell, beaten or not (or the corp picked on the map)", run: () => {
    const run = shellNeedRun(), sel = st.mode === 'map' && st.mapSel && run.map[st.mapSel];
    const key = st.corp ? st.corp.def.key : sel && (sel.type === 'corp' || sel.type === 'final') ? sel.corp : null;
    if (!key) throw new Error('be in a corp, or pick one on the map.');
    const d = corpDef(key);
    if (!CORP_TELL[key]) throw new Error(`${d.name} has no tell.`);
    run.hacked = true;
    return `${d.name}: ${CORP_TELL[key]}`; } },
  { name: 'undo', chip: 'UD2', cost: 3, safe: true, help: 'take back your last ICE hit on this layer', run: () => {
    const run = shellNeedRun(), lv = deckShellLayer(), h = st.lastHit;   // (engine/hits.js blockHit keeps it)
    if (!h || h.lv !== lv || h.undone) throw new Error('no ICE hit to undo on this layer.');
    h.undone = true; run.integrity = Math.min(run.maxInt, run.integrity + h.dmg); run.hacked = true;
    return `undo: +${h.dmg} INT (${run.integrity}/${run.maxInt}).`; } },
  // ---- v15.06: SUDO (docs/DECK.md SUDO). 'rm -rf' has a space: engine/shell.js shellParse reads "rm -rf" as one name.
  { name: 'rm -rf', chip: 'RF4', cost: 4, safe: true, help: 'every ICE on this layer is deleted (not on a sector boss)', run: () => {
    const run = shellNeedRun(), lv = deckShellLayer();
    if (st.corp.node.type === 'final') throw new Error('too big: not on a sector boss.');
    const ice = deckRfIce(lv);
    if (!ice.length) throw new Error('no ICE left to delete.');
    run.hacked = true; shellClose();
    setTimeout(() => deckRmRf(lv), 250);
    return `rm -rf: ${ice.length} ICE deleted.`; } },
  { name: 'fork', chip: 'FK2', cost: 4, safe: true, help: 'the real node forks: two on every layer of this corp, same glyph, full pay', run: () => {
    const run = shellNeedRun(), lv = deckShellLayer(), c = st.corp;
    if (c.forked) throw new Error('forked already, till you leave this corp.');
    if (c.def.tap) throw new Error("this corp won't fork.");
    c.forked = true; run.hacked = true;
    const t = deckForkLayer(lv, c);
    if (t) { const { x, y } = tileCenter(t); explode(snapshot(cl => cl.own === 't' + lv.tiles.indexOf(t)), x, y, { col: C.accent, power: 0.5 }); Sound.shield(); }
    return t ? 'fork: two real nodes, this layer and every one after it in this corp.' : 'fork: from the next layer on (this one is too small).'; } },
  { name: 'chmod', chip: 'CM3', cost: 3, safe: true, args: [{ name: 'mod', of: () => deckChmodList(), any: 'mods' }], help: 'one of your mods up a rarity till the sector ends', run: a => {
    const run = shellNeedRun(), k = a[0];
    if (run.chmod && run.chmod.sector === run.sector) throw new Error(`used: ${MODS[run.chmod.key].name} is up till this sector ends.`);
    if (!has(k)) throw new Error(`you don't have ${MODS[k] ? MODS[k].name : k}.`);
    if (DECK_CHMOD_NO.includes(k)) throw new Error(`${MODS[k].name} won't take it.`);
    if (modMaxed(k)) throw new Error(`your ${MODS[k].name} is maxed already.`);
    run.modTier[k] = (run.modTier[k] || 0) + 1; run.chmod = { key: k, sector: run.sector }; run.hacked = true; Sound.buy();
    return `chmod: ${MODS[k].name} is ${tierLabel(modView(k)).toLowerCase()} till sector ${run.sector + 1} ends.`; } },
];
// fork: QUANTUM's second real node (engine/run.js enterLayer; isReal), on a layer of 3 or more, wearing the real one's
// glyph so the corp's tell finds it too. With QUANTUM it's that node, and the pay cut is off for the corp (payFor).
// Returns the forked node, or null.
function deckForkLayer(lv, c) {
  if (lv.n < 3 || !c.hasBoss || c.def.tap || st.mp) return null;
  let t = lv.tiles.find(x => x.quantum && x.state === 'closed');
  if (!t) {
    const opts = lv.tiles.filter(x => x.state === 'closed' && !x.safe && !x.loaded && !x.quantum);
    if (!opts.length) return null;
    t = pickR(opts, rngFor(st.run.seed, 'fork', c.node.id, c.idx)); t.quantum = true;
  }
  t.forked = true; t.glyph = lv.tiles[lv.safe].glyph;
  return t;
}
// rm -rf: the ICE on a layer (what rm picks from), deleted one after another so you see it go
const deckRfIce = lv => lv.tiles.filter(t => t.state === 'closed' && !isReal(t) && !t.loaded);
async function deckRmRf(lv) {
  if (st.lv !== lv) return;
  st.busy = true; flash(C.danger, 0.3, 0.6); shake(8, 0.5);
  for (const t of deckRfIce(lv)) { if (st.lv !== lv) break; lockTile(t, C.mid, 'rm'); await wait(reduced() ? 0 : 60); }
  if (st.lv === lv) { st.busy = false; setMsg('> rm -rf: the ICE is gone.', C.accent); }
}
// chmod: not the mods whose step changes more than their numbers (BUFFER your INT, BOX OF WIRES the map, MUTATE what
// it is). It wears off as a new sector starts (deckSector), unless you sold the mod.
const DECK_CHMOD_NO = ['buffer', 'wires', 'mutate'];
const deckChmodList = () => (st.run ? st.run.mods : []).filter(k => MODS[k] && !DECK_CHMOD_NO.includes(k) && !modMaxed(k))
  .map(k => ({ v: k, hint: MODS[k].name.toLowerCase() + ' ' + tierLabel(modView(k)).toLowerCase() }));
function deckChmodOff(run) {
  const c = run.chmod; if (!c || c.sector === run.sector) return;
  if (run.mods.includes(c.key) && (run.modTier[c.key] || 0) > 0) run.modTier[c.key]--;
  run.chmod = null;
}
// A corp layer you can work on (rm, sleep, undo, show.real, breach), or why not.
function deckShellLayer() {
  if (st.mode !== 'play' || !st.lv || !st.corp || !st.corp.hasBoss || st.mp) throw new Error('only on a layer.');
  if (st.busy || st.transitioning) throw new Error('wait for the layer to settle.');
  return st.lv;
}
// cat: a DATA CACHE's loot and picks, rolled the way engine/panels.js openCache rolls them (the same stream, the same
// order: keep the two together).
function deckCatCache(node) {
  const run = st.run, r = rngFor(run.seed, 'cache', node.id), quest = questMarket(node), out = ['DATA CACHE:'];
  const n = 1 + (has('cachekey') ? tv('cachekey', ECON.modx.cachekey) : quest ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const g = lootRoll(r, 2);
    out.push(g.key ? `  ${isLoot(g.key) ? 'loot' : 'gear'}: ${ITEMS[g.key].name}` : `  +${g.cr}cr`);
  }
  const opts = quest ? questCacheOptions(r) : cacheOptions(r, node);
  out.push('  pick: ' + opts.map(o => o.kind === 'gear' ? ITEMS[o.key].name : MODS[o.key].name + (o.tier ? ` (tier ${o.tier + 1})` : '')).join(' or '));
  return out;
}
// give.mod / give.gear (the SUDO chips GM1, GG1; Greg, 2026-11-20): you name it. Common and rare: anything you've found
// (save.seen). Epic and up: only what you've shredded at a workbench at that rarity or higher (save.shredded, its top
// tier: engine/bench.js benchShred). It costs charges by its rarity (DECK_GIVE_COST), as often as your charges last (Greg, 2026-11-20).
const DECK_GIVE_COST = { scrap: 1, common: 1, rare: 2, epic: 3, legendary: 4, exotic: 5 };
const deckGiveDef = (kind, k) => kind === 'mod' ? MODS[k] : ITEMS[k];
const deckGiveable = (kind, k) => { const d = deckGiveDef(kind, k); return !!d && (kind === 'mod' ? !d.hidden : !isLoot(k) && !d.chip && !d.corrupt && !d.fish); };
// The tiers of it you may summon (indexes into its tiers; none: you can't)
function deckGiveTiers(kind, k) {
  if (!deckGiveable(kind, k) || !save.seen[k]) return [];
  const def = deckGiveDef(kind, k), sh = (save.shredded || {})[k], out = [];
  for (let t = 0; t < tierCount(def); t++) {
    const r = RARITY[tierView(def, t).rarity] || RARITY.common;
    if (!r.hidden && (r.lvl <= RARITY.rare.lvl || (sh != null && sh >= t))) out.push(t);
  }
  return out;
}
const deckGiveLabel = (kind, k, t) => tierLabel(tierView(deckGiveDef(kind, k), t)).toLowerCase();
const deckGiveList = kind => Object.keys(kind === 'mod' ? MODS : ITEMS).filter(k => deckGiveTiers(kind, k).length)
  .map(k => ({ v: k, hint: deckGiveTiers(kind, k).map(t => deckGiveLabel(kind, k, t)).join(' ') }));
// The tier as typed: 2 (its step), lv2, or a rarity (epic); none: the lowest you may summon
function deckGiveTier(kind, k, raw) {
  const def = deckGiveDef(kind, k), n = tierCount(def), ok = deckGiveTiers(kind, k);
  if (raw == null || raw === '') return ok[0];
  const s = String(raw).toLowerCase().replace(/^lv/, ''), want = s === 'legend' ? 'legendary' : s;
  const t = /^\d+$/.test(s) ? Number(s) - 1 : [...Array(n).keys()].find(i => tierView(def, i).rarity === want);
  if (t == null || t < 0 || t >= n) throw new Error(`${def.name} has no ${raw} (it comes in: ${[...Array(n).keys()].map(i => deckGiveLabel(kind, k, i)).join(' ')}).`);
  if (!ok.includes(t)) throw new Error(`${def.name} ${deckGiveLabel(kind, k, t)}: shred one at a workbench first.`);
  return t;
}
const DECK_GIVE_TIER_ARG = { name: 'tier', of: () => ['common', 'rare', 'epic', 'legendary', 'legend', 'exotic', 'lv1', 'lv2', 'lv3', '1', '2', '3', '4'].map(v => ({ v, hint: /^[0-9]/.test(v) ? 'tier ' + v : '' })), opt: true };
const deckGiveCost = (kind, k, t) => DECK_GIVE_COST[tierView(deckGiveDef(kind, k), t).rarity] || 1;
// What a give costs, read off the line before it runs (engine/shell.js shellRun asks a command's .costOf)
function deckGiveCostOf(kind, a) { try { if (!a[0]) return 0; const t = deckGiveTier(kind, a[0], a[1]); return t == null ? 0 : deckGiveCost(kind, a[0], t); } catch (e) { return 0; } }
function deckGive(kind, a) {
  const run = shellNeedRun(), tag = kind === 'mod' ? 'give.mod' : 'give.gear';
  if (!a[0]) {
    const list = deckGiveList(kind);
    return { out: list.length ? `${tag} <${kind}> [tier]. yours to name:\n` + list.map(o => `  ${o.v.padEnd(12)} ${o.hint}`).join('\n')
      : `nothing yet: find some ${kind === 'mod' ? 'mods' : 'gear'} first.`, free: true };
  }
  const k = a[0], def = deckGiveDef(kind, k);
  if (!deckGiveable(kind, k)) throw new Error(`${def.name} can't be given.`);
  if (!save.seen[k]) throw new Error(`you haven't found ${def.name} yet.`);
  const t = deckGiveTier(kind, k, a[1]);
  if (kind === 'mod') {
    if (has(k) && modMaxed(k)) throw new Error(`your ${def.name} is maxed already.`);
    if (!has(k) && clashWith(k)) throw new Error(`${def.name} clashes with a mod you have.`);
    if (!has(k) && !modRoom(k)) throw new Error('no free slot for it.');
    addMod(k, t);
  } else if (!itemRoom(k, t) || !addItem(k, t)) throw new Error('no room on the belt.');
  run.hacked = true; Sound.buy();
  return `${tag}: ${def.name}, ${deckGiveLabel(kind, k, t)}.`;
}
// The player versions of dev commands (Greg, 2026-11-20: one command list; dev mode gets the dev version). engine/shell.js
// puts each on its command as .play: without dev mode, THE SHELL runs this (its chip, cost, args, help) in its place.
const DECK_SHELL_PLAY = {
  'mode.god': { chip: 'GD1', safe: true, cost: 4, args: [], help: 'ICE does no damage for the rest of this sector', run: () => {
    const run = shellNeedRun();
    if (run.godSector === run.sector) throw new Error('already on, till this sector ends.');
    run.godSector = run.sector; run.hacked = true;   // (engine/damage.js godOn)
    return `mode.god: no damage till sector ${run.sector + 1} ends.`; } },
  'mode.hold': { chip: 'HD4', safe: true, cost: 3, args: [], help: 'the layer clocks stop for the rest of this corp', run: () => {
    shellNeedRun();
    if (!st.corp || !st.corp.hasBoss) throw new Error('only in a corp.');
    if (st.corp.held) throw new Error('already held.');
    st.corp.held = true; st.run.hacked = true;   // (engine/run.js updateTimer)
    return 'mode.hold: the clocks stop till you leave this corp.'; } },
  'show.real': { chip: 'RL2', safe: true, cost: 2, args: [], help: 'the real node is marked on this layer (once a corp)', run: () => {
    const lv = deckShellLayer();
    if (st.corp.realShown) throw new Error('used: once a corp.');
    st.corp.realShown = true; lv.realShown = true; st.run.hacked = true;   // (engine/board.js draws the *)
    return 'show.real: the real node has a * on it.'; } },
  'breach': { chip: 'BR3', safe: true, cost: 4, args: [], help: 'win this layer outright, full pay (once a run)', run: () => {
    const run = shellNeedRun(), lv = deckShellLayer();
    if (run.sudoBreach) throw new Error('used: once a run.');
    if (!gearMayClear()) throw new Error("this corp won't let you.");
    run.sudoBreach = true; run.hacked = true; shellClose();
    setTimeout(() => { if (st.lv === lv && !st.busy) { setMsg('> breach. you are in.', C.accent); st.busy = true; onSafe(lv.tiles[lv.safe]); } }, 250);
    return 'breach: you are in.'; } },
  'mode.free': { chip: 'FT3', safe: true, cost: 3, args: [], help: 'any node in this sector is open, the boss too, till it ends', run: () => {
    const run = shellNeedRun();
    if (run.freeSector === run.sector) throw new Error('already on, till this sector ends.');
    run.freeSector = run.sector; run.hacked = true; st.mapSel = null;   // (engine/render.js availableNodes)
    return `mode.free: go anywhere in sector ${run.sector + 1}, the boss too.`; } },
  'corp.jump': { chip: 'JM4', safe: true, cost: 4, args: [], help: "skip this corp's layers, straight to its boss", run: () => {
    const run = shellNeedRun(), lv = deckShellLayer();
    if (lv.boss || st.corp.idx >= st.corp.counts.length - 1) throw new Error('you are at the boss already.');
    run.hacked = true; shellClose();
    setTimeout(() => { if (st.lv === lv && !st.busy) { setMsg('> corp.jump: straight to the boss.', C.accent); st.corp.idx = st.corp.counts.length - 1; enterLayer(); } }, 250);   // (the dev version: engine/dev.js jumpToBoss)
    return 'corp.jump: to the boss.'; } },
  'give.mod': { chip: 'GM1', safe: true, cost: 1, costOf: a => deckGiveCostOf('mod', a), args: [{ name: 'mod', of: () => deckGiveList('mod'), any: 'mods', opt: true }, DECK_GIVE_TIER_ARG],
    help: 'name a mod you have found (epic+: shredded). 1-5 charges by rarity', run: a => deckGive('mod', a) },
  'give.gear': { chip: 'GG1', safe: true, cost: 1, costOf: a => deckGiveCostOf('gear', a), args: [{ name: 'gear', of: () => deckGiveList('gear'), any: 'gear', opt: true }, DECK_GIVE_TIER_ARG],
    help: 'name gear you have found (epic+: shredded). 1-5 charges by rarity', run: a => deckGive('gear', a) },
  'give.chip': { chip: 'GC4', safe: true, cost: 1, costOf: a => a[0] && DECK_CHIPS[String(a[0]).toUpperCase()] ? deckGiveChipCost(String(a[0]).toUpperCase()) : 0, args: [{ name: 'chip', of: () => deckGiveChipList(), opt: true }],
    help: 'name a chip you have shredded. 1-5 charges by rarity', run: a => deckGiveChip(a) },
};

