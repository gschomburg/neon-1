// NeoN+1 engine/save.js: Save data, REP (legacy), and the run save for resuming.
'use strict';
NEON_FILES.push(['engine/save.js', 'v13.15']);

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
// MAN'S SWITCH). It's spent on THE BOARD (from the title) on unlocks that last.
const LEGACY = [
  { key: 'hard',  name: 'HARDENED',   desc: '+1 starting integrity.',          costs: [40, 100] },
  { key: 'cash',  name: 'SEED MONEY', desc: 'start with +25cr.',               costs: [20, 40, 80] },
  { key: 'kit',   name: 'FIELD KIT',  desc: 'start with a PATCH.',             costs: [50] },
  { key: 'belt',  name: 'WIDE BELT',  desc: '+1 item slot.',                   costs: [120] },
  { key: 'picky', name: 'SHORTLIST',  desc: 'the starter perk offers 4 mods.', costs: [60] },
  { key: 'dms',   name: 'DEADMAN',    desc: 'dying keeps 25% of the REP you would have banked.', costs: [80, 200],
    levels: ['dying keeps 25% of the REP you would have banked.', 'dying keeps 50% of the REP you would have banked.'] },
];
const legacyLv = key => (save.legacy && save.legacy[key]) || 0;
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
  if (!run || run.ended || st.mp || st.dying || run.integrity <= 0) return null;
  const c = st.corp;
  const corp = c && c.node ? {
    node: c.node.id, idx: c.idx, prevSafe: c.prevSafe, bulwarkUsed: !!c.bulwarkUsed, burnerUsed: !!c.burnerUsed,
    wallAll: !!c.wallAll, ice: c.ice || 0, perfects: c.perfects || 0, scored: c.scored || 0,
    carry: c.carry || null, pins: c.pins || 0, friendUsed: !!c.friendUsed, tapUsed: c.tapUsed || null, rad: c.rad || 0, ride: c.ride || 0, petIdx: c.petIdx, tickets: c.tickets || 0, stolen: c.stolen || null, rival: c.rival || null,
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
    return d && d.run && d.run.map && d.run.integrity > 0 ? d : null;
  } catch (e) { return null; }
}
