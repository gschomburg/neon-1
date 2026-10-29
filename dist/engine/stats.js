// NeoN+1 engine/stats.js: anonymous play stats, sent to greglytics (the same client as the leaderboard,
// engine/leaders.js). No names: a random device id, and a run id made at run start (kept in the run save,
// so a resumed run keeps it). Testers (?dev=1) and file / localhost pages send as dev data.
// Events (each has rid, the run id):
//   run_start  seed, practice, unlocks (LEGACY levels)
//   node       a map stop left: type, corp, sector, tier, layers (on arrival), secs, result
//              (cleared / skipped / died / done), ice (hits), hp (integrity in > out)
//   mod_pick   a mod screen: at (the screen), offered, taken (null = skipped), exotic (if one was offered)
//   buy        at the market: kind, key, tier, price
//   exotic     an exotic offered: key, where (shop / cache / sector)
//   run_end    end (cashout / died), layers, corps, sector, sectors, mods, tiers, items, credits, earned,
//              rep, mins, ice, perfects, reroutes, resumes, at (where you died: corp + layer)
//   run_quit   abandoned from the menu: layers, sector, at
'use strict';
NEON_FILES.push(['engine/stats.js', 'v13.82']);

// Off for multiplayer, the editor and automated test runs (the playtest tools).
function statOn() { return !!(st.run && !st.run.tutorial && !st.mp && !EDITOR && !(navigator.webdriver && !window.LB_TEST) && lbClient()); }
function stat(name, data) {
  try {
    if (!statOn()) return;
    const run = st.run;
    if (!run.rid) run.rid = Math.random().toString(36).slice(2, 10);
    lbClient().track(name, Object.assign({ rid: run.rid }, data));
  } catch (e) { /* stats never get in the way of the game */ }
}
const statS = () => st.run.stat || (st.run.stat = { t0: Date.now(), ice: 0, node: null, exo: [] });
const hpNow = () => zombie() ? -(st.run.rot || 0) : st.run.integrity;

function statRunStart() {
  if (!st.run) return;
  st.run.rid = Math.random().toString(36).slice(2, 10);
  statS();
  const unlocks = {};
  for (const u of LEGACY) if (legacyLv(u.key)) unlocks[u.key] = legacyLv(u.key);
  stat('run_start', { seed: st.run.seed, practice: !!st.run.practice, unlocks });
}

// A map stop: started when you go in, sent when you leave it (or the run ends there).
function statNodeStart(node) {
  if (!st.run || !node) return;
  const s = statS();
  if (s.node) statNodeEnd('done');
  s.node = { id: node.id, type: node.type, corp: node.corp || null, sector: (node.sector || 0) + 1, tier: node.tier || 0,
    mod: node.mod || null, layers: st.run.depth, t: Date.now(), hp: hpNow() };
}
function statNodeEnd(result) {
  if (!st.run) return;
  const s = statS(), n = s.node;
  if (!n) return;
  s.node = null;
  const c = st.corp && st.corp.node && st.corp.node.id === n.id ? st.corp : null;
  const ice = c ? c.ice || 0 : 0;
  s.ice += ice;
  stat('node', { type: n.type, corp: n.corp, sector: n.sector, tier: n.tier, mod: n.mod, layers: n.layers,
    secs: Math.round((Date.now() - n.t) / 1000), result, ice, hp: `${n.hp}>${hpNow()}` });
}

function statPick(at, options, taken) {
  const ex = options.find(o => MODS[o.key] && MODS[o.key].kind === 'exotic');
  stat('mod_pick', { at: String(at).toLowerCase(), offered: options.map(o => o.key), taken: taken ? taken.key : null,
    exotic: ex ? ex.key : null, layers: st.run ? st.run.depth : 0 });
}
function statBuy(o, price) {
  stat('buy', { kind: o.kind, key: o.key, tier: o.tier || 0, price, exotic: !!(MODS[o.key] && MODS[o.key].kind === 'exotic') });
}
// once per offer per run (a resumed run builds the same offer again)
function statExotic(where, id, key) {
  if (!st.run) return;
  const s = statS(), tag = `${where}:${id}`;
  if (s.exo.includes(tag)) return;
  s.exo.push(tag);
  stat('exotic', { key, where, layers: st.run.depth });
}

function statRunEnd(run, win) {
  if (!run) return;
  const s = statS(), c = st.corp;
  if (s.node) statNodeEnd(win ? 'cleared' : 'died');
  stat('run_end', {
    end: win ? 'cashout' : 'died', practice: !!run.practice, layers: run.depth, corps: run.corps, sector: (run.sector || 0) + 1,
    sectors: run.sectorsCleared || 0, mods: run.mods.slice(), tiers: run.mods.map(k => `${k}:${(run.modTier[k] || 0) + 1}`),
    items: run.items.map(x => x.key), credits: run.credits, earned: run.earned, rep: repFor(run),
    mins: Math.round((Date.now() - s.t0) / 6000) / 10, ice: s.ice, perfects: run.perfects || 0, reroutes: run.reroutes || 0,
    resumes: run.resumes || 0, at: !win && c ? `${c.def.key} ${c.hasBoss ? (st.lv && st.lv.boss ? 'boss' : c.idx + 1) : ''}`.trim() : null,
  });
}
function statQuit(run) {
  if (!run) return;
  const c = st.corp, s = statS();
  s.node = null;
  stat('run_quit', { layers: run.depth, sector: (run.sector || 0) + 1, practice: !!run.practice,
    mins: Math.round((Date.now() - s.t0) / 6000) / 10, at: c ? c.def.key : st.mode });
}
