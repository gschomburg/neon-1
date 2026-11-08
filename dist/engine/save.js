// NeoN+1 engine/save.js: Save data, REP (legacy), and the run save for resuming.
'use strict';
NEON_FILES.push(['engine/save.js', 'v14.64']);

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
const persist = () => { if (TABS.away) return; try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } };

// ---------- One tab at a time (2026-11-07) ----------
// Two tabs of the game both wrote the save, and the last one won: progress could go missing. Now the tabs talk
// (BroadcastChannel: same browser, same site) and only one plays. A tab that opens while another is playing waits:
// "open in another tab", tap to play here. The tap tells the playing tab, which saves and goes quiet; then this tab
// reloads, so it starts from that save. A quiet tab never writes the save (persist, saveRun, clearRun).
// The editor's game has its own save (STORE_KEY) and its own channel. No BroadcastChannel (some file:// pages): no guard.
const TABS = { away: false, id: Math.random().toString(36).slice(2), ch: null, taking: false };
function tabsStart() {
  if (typeof BroadcastChannel !== 'function') return;
  try { TABS.ch = new BroadcastChannel('neon.tabs.' + STORE_KEY); } catch (e) { return; }
  const t0 = performance.now();
  TABS.ch.onmessage = e => {
    const m = e.data || {};
    if (m.t === 'hello' && !TABS.away) TABS.ch.postMessage({ t: 'here', id: TABS.id });   // a new tab: I'm playing
    else if (m.t === 'here' && performance.now() - t0 < 1500 && !TABS.taking) tabsAway();   // one was already playing: wait
    else if (m.t === 'take' && m.id !== TABS.id && !TABS.away) {   // another tab wants it: save, go quiet, say so
      if (st.run) saveRun();
      persist();
      tabsAway();
      TABS.ch.postMessage({ t: 'released', id: TABS.id });
    } else if (m.t === 'released' && TABS.taking) location.reload();
  };
  TABS.ch.postMessage({ t: 'hello', id: TABS.id });
}
function tabsAway() {
  TABS.away = true;
  Field.blur && Field.blur();
  Sound.hush();
}
function tabsTake() {   // PLAY HERE (a tap or a key on the quiet tab)
  if (TABS.taking) return;
  TABS.taking = true;
  TABS.ch.postMessage({ t: 'take', id: TABS.id });
  setTimeout(() => location.reload(), 1200);   // (nobody answered: the other tab is gone)
}
// The quiet tab's screen: the game stops (render.js frame skips it) and this is all it draws.
function drawTabsAway() {
  const w = cv.width, h = cv.height, fs = Math.max(12, Math.min(26, w / 26)) * 1;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = C.bg; g.fillRect(0, 0, w, h);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = [['NeoN+1 is open in another tab.', C.text, 700], ['one tab plays at a time,', C.mid, 400], ['so your save stays whole.', C.mid, 400], ['', C.mid, 400],
    [TABS.taking ? 'switching...' : '[ PLAY HERE ]', C.accent, 700]];
  lines.forEach(([s, col, wt], k) => { g.font = `${wt} ${fs}px ${FONT}`; g.fillStyle = col; g.fillText(s, w / 2, h / 2 + (k - 2) * fs * 1.6); });
}
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
  { key: 'stray', tier: 1, name: 'STRAY',      desc: 'a stray bug follows you: every run starts with a pet.', costs: [60] },
  // ---- 2 USER
  { key: 'drops', tier: 2, name: 'BETTER DROPS', desc: '1 in 10 mods and gear roll a step rarer.', costs: [150, 300],
    levels: ['1 in 10 mods and gear roll a step rarer.', '1 in 5 mods and gear roll a step rarer.'] },
  { key: 'locker', tier: 2, name: 'LOCKER', desc: 'cash out and put one mod away (a step lower): your next run starts with it.', costs: [200] },
  { key: 'bench', tier: 2, name: 'WORKBENCH', desc: 'every safehouse gets a workbench: shred gear and mods into letters, spell a code to build one.', costs: [150] },   // (engine/bench.js)
  { key: 'nemesis', tier: 2, name: 'NEMESIS', desc: 'pick a corp you have breached: it shows up 3x as often.', costs: [120] },
  { key: 'starter', tier: 2, name: 'STARTER POOL', desc: 'the starter perk can offer general mods too.', costs: [150] },
  { key: 'steady', tier: 2, name: 'STEADY HANDS', desc: "at the pier, no catch moves faster than your line can follow.", costs: [300] },   // (Greg, 2026-11-06: a fast legendary PHISH outran LURE; engine/fishing.js FISH_STEADY)
  { key: 'tellscope', tier: 2, name: 'TELL LIGHT', desc: 'every corp layer says if its tell is on: TELL ON / TELL OFF.', costs: [150] },   // (the user: know if a tell is active)
  // ---- 3 ELITE, 4 SYSOP: nothing posted yet (HEAT, the quests, THE ARCHIVE: docs/PROGRESSION.md)
  // ---- PRIVATE MESSAGES (a feat opens them)
  { key: 'bossloot', pm: 'bosshunter', name: 'BOSS LOOT', desc: 'boss gear (FLARE, BEES...) can turn up in black markets.', costs: [180] },
];
// The crew's posts (PRIVATE MESSAGES): CREW: NAME opens at 5 calls (their own call gear then turns up), NAME LVL 2 at 10
// (once they're crew). needs: shown only once that post is bought.
for (const [id, h] of Object.entries(HACKERS)) if (h.side === 'good' && !h.quest) LEGACY.push(   // (quest crew, b0y: the quest puts him on the crew)
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
// ---------------- Run kinds ----------------
// What a run is, on st.run: tutorial (the training), practice (cheats: the dev menu, the editor's jumps), seeded (a seed
// you chose: ranked on the seed boards only), quest ('had3s' / 'h3av3n': a quest seed), heaven (H3AV3N's sector).
// st.mp: a multiplayer race (not a run flag). Who counts what, and where it's decided (keep them in step):
//   counting()   engine/feats.js     feats, the record                       not practice, not training, not mp
//   questRun()   engine/quests.js    quests move                             not training, not mp; practice only in the editor
//   statOn()     engine/stats.js     analytics events                        not training, not mp, not the editor or a test page
//   oneUpOpen()  engine/oneup.js     the 1UP                                  beaten G0D; not training, not mp
//   lbSubmit     engine/leaders.js   the leaderboard                         not practice, not mp, not the editor; depth > 0
// Credits you earned: what you have and what counts as earned (REP, the end screen) go up together. Credits that
// aren't earnings (a refund, a cheat) add to run.credits alone.
function earn(cr, run = st.run) { run.credits += cr; run.earned += cr; }
function repFor(run) {
  return run.depth + 3 * run.corps + (run.perfects || 0) + Math.floor(run.earned / 40) + 10 * (run.sectorsCleared || 0);
}

// ---------------- Run save (resume) ----------------
// The run is saved as you go (map, every layer, every hit), so a reload or a closed
// tab picks it up again. A layer you were in comes back as a fresh layer.
const RUN_KEY = STORE_KEY + '.run';
// What a corp has used up or set so far, saved with the run so a reload brings it back (engine/run.js startCorp
// restores the same list). A new corp mechanic that keeps state on st.corp across layers adds its key here.
const CORP_SAVE = ['prevSafe', 'bulwarkUsed', 'burnerUsed', 'contUsed', 'wallAll', 'ice', 'perfects', 'scored', 'carry', 'pins',
  'friendUsed', 'tapUsed', 'rad', 'ride', 'tickets', 'stolen', 'rival', 'frozen', 'slomo', 'anchored', 'bees', 'hk', 'hkRival',
  'hypeRow', 'kludgeHealed', 'zd', 'magnet',
  'leash', 'muzzleTo', 'honeyTo', 'express', 'invUsed'];   // (these five were lost on a reload before v14.45)
// A run's line in save.history (the last 20 runs): every way a run ends writes the same shape.
function noteHistory(run, extra) {
  if (run.tutorial) return;   // (the training run leaves no history)
  save.history.unshift(Object.assign({ seed: run.seed, depth: run.depth, corps: run.corps, sector: (run.sector || 0) + 1,
    practice: run.practice, seeded: !!run.seeded, at: Date.now() }, extra));
  save.history = save.history.slice(0, 20);
}
function runSnapshot() {
  const run = st.run;
  if (!run || run.ended || run.tutorial || st.mp || st.dying || run.integrity <= 0) return null;
  const c = st.corp;
  const corp = c && c.node ? { node: c.node.id, idx: c.idx } : null;
  if (corp) for (const k of CORP_SAVE) if (c[k] != null) corp[k] = c[k];
  // inside a layer, depth is saved as it was when the layer started (it comes back fresh)
  const r = c && st.lv && c.depthAt != null ? Object.assign({}, run, { depth: c.depthAt }) : run;
  return { v: VERSION, run: r, corp: corp && corp.idx < (c.counts ? c.counts.length : 99) ? corp : null, pending: run.pending || null };
}
function saveRun() {
  if (TABS.away) return;
  const snap = runSnapshot();
  if (!snap) return;
  try { localStorage.setItem(RUN_KEY, JSON.stringify(snap)); } catch (e) { /* storage unavailable */ }
}
function clearRun() { if (TABS.away) return; try { localStorage.removeItem(RUN_KEY); } catch (e) { /* ignore */ } }
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
