// NeoN+1 engine/save.js: Save data, REP (legacy), and the run save for resuming.
'use strict';
NEON_FILES.push(['engine/save.js', 'v13.86']);

// ---------------- Save data ----------------
const freshSave = () => ({
  format: SAVE_FORMAT, best: 0, runs: 0, wins: 0, history: [], seen: {},
  muted: false, palette: DEFAULT_PALETTE, effects: 'full', tapMode: 'two', corpColors: true,
  musicOn: true, musicVol: 0.6, sfxVol: 0.8,
  corpStats: {},          // per corp: { breached, lost }
  rep: 0, repTotal: 0, legacy: {}, cashouts: 0, bestSector: 0,   // legacy (THE BOARD)
});
const save = (() => {
  const d = freshSave();
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (raw && raw.format === SAVE_FORMAT) Object.assign(d, raw);
  } catch (e) { /* storage unavailable */ }
  d.palette = OLD_PALETTES[d.palette] || d.palette;
  if (!PALETTES[d.palette]) d.palette = DEFAULT_PALETTE;   // a palette that's gone (or palettes.js didn't load)
  return d;
})();
const persist = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } };
// Per-corp record for the codex.
function corpStat(key) {
  if (!save.corpStats[key]) save.corpStats[key] = { breached: 0, lost: 0 };
  return save.corpStats[key];
}
function markSeen(key) {
  if (!key || save.seen[key]) return;
  save.seen[key] = true;
  persist();
}

// ---------------- Legacy (REP) ----------------
// REP is banked by cashing out after a sector clear. Dying gives none (unless DEAD
// MAN'S SWITCH). It's spent on THE BOARD (from the title: its REP tab) on posts that last.
// THE BOARD's levels (docs/PROGRESSION.md): GUEST is open; buy `need` posts on the level below to open the next.
// Your access level (the highest open one) shows on your card. A post with steps counts once.
// tier: the level it's on. pm: a PRIVATE MESSAGE, opened by that feat (data/feats.js) instead of a level.
const BOARD_LEVELS = [{ name: 'GUEST' }, { name: 'USER', need: 4 }, { name: 'ELITE', need: 3 }, { name: 'SYSOP', need: 2 }];
const LEGACY = [
  // ---- 1 GUEST
  { key: 'hard',  tier: 1, name: 'HARDENED',   desc: '+1 starting integrity.',          costs: [40, 100] },
  { key: 'cash',  tier: 1, name: 'SEED MONEY', desc: 'start with +25cr.',               costs: [20, 40, 80] },
  { key: 'kit',   tier: 1, name: 'FIELD KIT',  desc: 'start with a PATCH.',             costs: [50] },
  { key: 'belt',  tier: 1, name: 'GEAR SLOT',  desc: '+1 gear slot.',                   costs: [120] },
  { key: 'restock', tier: 1, name: 'RESTOCK',  desc: '+1 reroll at every market.',      costs: [30, 60],
    levels: ['2 rerolls at every market (was 1).', '3 rerolls at every market.'] },
  { key: 'picky', tier: 1, name: 'SHORTLIST',  desc: 'the starter perk offers 4 mods.', costs: [60] },
  { key: 'dms',   tier: 1, name: 'DEADMAN',    desc: 'dying keeps 25% of the REP you would have banked.', costs: [80, 200],
    levels: ['dying keeps 25% of the REP you would have banked.', 'dying keeps 50% of the REP you would have banked.'] },
  { key: 'wind',  tier: 1, name: 'SECOND WIND', desc: 'heal 1 integrity at the start of every new sector.', costs: [50] },
  { key: 'lucky', tier: 1, name: 'LUCKY START', desc: 'start every run with a random common gear.', costs: [40] },
  // ---- 2 USER
  { key: 'drops', tier: 2, name: 'BETTER DROPS', desc: '1 in 10 mods and gear roll a step rarer.', costs: [150, 300],
    levels: ['1 in 10 mods and gear roll a step rarer.', '1 in 5 mods and gear roll a step rarer.'] },
  { key: 'locker', tier: 2, name: 'LOCKER', desc: 'cash out and put one mod away (a step lower): your next run starts with it.', costs: [200] },
  { key: 'nemesis', tier: 2, name: 'NEMESIS', desc: 'pick a corp you have breached: it shows up 3x as often.', costs: [120] },
  { key: 'starter', tier: 2, name: 'STARTER POOL', desc: 'the starter perk can offer general mods too.', costs: [150] },
  // ---- 3 ELITE, 4 SYSOP: nothing posted yet (HEAT, the quests, THE ARCHIVE: docs/PROGRESSION.md)
  // ---- PRIVATE MESSAGES (a feat opens them)
  { key: 'bossloot', pm: 'bosshunter', name: 'BOSS LOOT', desc: 'boss gear (FLARE, BEES...) can turn up in black markets.', costs: [180] },
];
// The crew's posts (PRIVATE MESSAGES): CREW: NAME opens at 5 calls (their own call gear then turns up), NAME LVL 2 at 10
// (once they're crew). needs: shown only once that post is bought.
for (const [id, h] of Object.entries(HACKERS)) if (h.side === 'good') LEGACY.push(
  { key: 'crew_' + id, pm: 'call_' + id, crew: id, name: 'CREW: ' + h.name, desc: h.name + ' joins your crew: their own call gear turns up in markets and loot.', costs: [120] },
  { key: 'crew2_' + id, pm: 'call10_' + id, needs: 'crew_' + id, crew: id, name: 'CREW: ' + h.name + ' LVL 2', desc: h.lvl2 || '', costs: [200] });
const legacyLv = key => (save.legacy && save.legacy[key]) || 0;
const boughtOn = t => LEGACY.filter(u => u.tier === t && legacyLv(u.key) > 0).length;
// Your access level: 1 GUEST ... 4 SYSOP (the highest level that's open).
function boardLevel() {
  let lv = 1;
  while (lv < BOARD_LEVELS.length && boughtOn(lv) >= BOARD_LEVELS[lv].need) lv++;
  return lv;
}
const accessName = () => BOARD_LEVELS[boardLevel() - 1].name;
const postOpen = u => u.pm ? featDone(u.pm) : u.tier <= boardLevel();
// What a run is worth in REP right now.
function repFor(run) {
  return run.depth + 3 * run.corps + (run.perfects || 0) + Math.floor(run.earned / 40) + 10 * (run.sectorsCleared || 0);
}

// ---------------- Run save (resume) ----------------
// The run is saved as you go (map, every layer, every hit), so a reload or a closed
// tab picks it up again. A layer you were in comes back as a fresh layer.
const RUN_KEY = STORE_KEY + '.run';
function runSnapshot() {
  const run = st.run;
  if (!run || run.ended || run.tutorial || st.mp || st.dying || run.integrity <= 0) return null;
  const c = st.corp;
  const corp = c && c.node ? {
    node: c.node.id, idx: c.idx, prevSafe: c.prevSafe, bulwarkUsed: !!c.bulwarkUsed, contUsed: !!c.contUsed, burnerUsed: Number(c.burnerUsed || 0),
    wallAll: !!c.wallAll, ice: c.ice || 0, perfects: c.perfects || 0, scored: c.scored || 0,
    carry: c.carry || null, pins: c.pins || 0, friendUsed: !!c.friendUsed, tapUsed: c.tapUsed || null, rad: c.rad || 0, ride: c.ride || 0, petIdx: c.petIdx, tickets: c.tickets || 0, stolen: c.stolen || null, rival: c.rival || null, hk: c.hk || null, hkRival: c.hkRival || null, hypeRow: c.hypeRow || 0, kludgeHealed: !!c.kludgeHealed, frozen: !!c.frozen, slomo: !!c.slomo, anchored: !!c.anchored, bees: !!c.bees, zd: c.zd || 0, magnet: !!c.magnet,
  } : null;
  // inside a layer, depth is saved as it was when the layer started (it comes back fresh)
  const r = c && st.lv && c.depthAt != null ? Object.assign({}, run, { depth: c.depthAt }) : run;
  return { v: VERSION, run: r, corp: corp && corp.idx < (c.counts ? c.counts.length : 99) ? corp : null, pending: run.pending || null };
}
function saveRun() {
  const snap = runSnapshot();
  if (!snap) return;
  try { localStorage.setItem(RUN_KEY, JSON.stringify(snap)); } catch (e) { /* storage unavailable */ }
}
function clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (e) { /* ignore */ } }
// Mods that changed their key: old saves get the new one (CHROMED UP became RAM DOUBLER in v13.08).
const MOD_RENAMED = { chromed: 'ramdoubler' };
function savedRun() {
  try {
    const d = JSON.parse(localStorage.getItem(RUN_KEY) || 'null');
    if (d && d.run && d.run.mods) {   // mods renamed since the run was saved, and any that are gone
      const run = d.run, tiers = run.modTier || {};
      run.mods = run.mods.map(k => MOD_RENAMED[k] || k).filter(k => MODS[k]);
      for (const [from, to] of Object.entries(MOD_RENAMED)) if (from in tiers) { tiers[to] = tiers[from]; delete tiers[from]; }
    }
    if (d && d.run && d.run.items) lootMigrate(d.run);   // saves from before the LOOT bag held loot on the belt
    return d && d.run && d.run.map && d.run.integrity > 0 ? d : null;
  } catch (e) { return null; }
}
