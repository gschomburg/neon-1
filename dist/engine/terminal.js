// NeoN+1 engine/terminal.js: THE TERMINAL, a dev console you type into (docs/TERMINAL.md).
// Needs everything before it in index.html (it calls the game's functions); loads after engine/dev.js.
// ~ (Shift + `) or Ctrl + ` opens and closes it; on a phone, the dev menu's [ terminal ] button.
// It's plain HTML over the canvas (a black field, white text, its own colours: the palettes don't touch it), so a
// phone's keyboard, autocorrect and the browser's own text box all just work.
'use strict';
NEON_FILES.push(['engine/terminal.js', 'v14.83']);

// ---------- helpers the commands share ----------
// The editor's TESTING tab calls these too (engine/editor.js TEST), so the two can't drift. The ones that end a run
// take `end`: the editor passes its own (it also puts back a logo it borrowed for the profile scene).
const termNeedRun = () => { if (!st.run || st.run.ended) throw new Error('no run: start one first'); return st.run; };
const termIdle = () => !st.busy && !st.transitioning && !st.wipe;
const TERM_INTRO_HOLD = CONFIG.introHold;   // (corp.intro holds the intro up, then puts this back)
// Wait for wipes, intros and animations to finish (skipping intros).
async function termSettle(ms = 25000) {
  const t0 = performance.now();
  while (st.busy || st.transitioning || st.wipe || st.intro || st.bossIntro) {
    if (st.intro) st.intro.skip = true;
    if (st.bossIntro) st.bossIntro.skip = true;
    if (performance.now() - t0 > ms) throw new Error('the game took too long');
    await wait(40);
  }
}
// To the title, the run thrown away.
function termEndRun() {
  if (st.run) { st.run.ended = true; clearRun(); }
  st.pause = false; st.dev = false; showTitle();
}
// A practice run, on the map after the public net.
async function termFreshRun(end = termEndRun) {
  end();
  startRun('TEST' + Math.floor(Math.random() * 90000 + 10000), true);
  await termSettle();
  if (st.mode === 'play' && st.lv) { await pick(st.lv.safe); await termSettle(); }
  if (st.mode !== 'map') { toMap(); await termSettle(); }
}
async function termOnMap(end = termEndRun) { if (!st.run || st.run.ended) await termFreshRun(end); if (st.panel || st.mode !== 'map') { toMap(); await termSettle(); } }
// Climb to sector `to` (1-based), with `ev` as that sector's event.
async function termToSector(to, ev, end = termEndRun) {
  if (ev || !st.run || st.run.ended || st.run.sector >= to - 1) await termFreshRun(end); else await termOnMap(end);
  const run = st.run;
  run.practice = true;
  while (run.sector < to - 1) {
    const old = run.sector, boss = bossIdOf(old);
    run.at = boss; if (!run.visited.includes(boss)) run.visited.push(boss);
    run.sector++; run.sectorsCleared = (run.sectorsCleared || 0) + 1;
    addSector(run.map, run.seed, run.sector, run.sector === to - 1 ? ev || null : null);
    run.fence = [];
    if (run.sector < to - 1) (run.evSeen = run.evSeen || []).push(run.sector);
    if (run.sector === to - 1) { await swapTo(() => toMap(old)); await termSettle(); }
  }
}
// HAD3S: straight into a sector's boss (0: MYCONET, 1: CERBERUS).
async function termHad3sBoss(s, end = termEndRun) {
  end(); startRun('HAD3S', false); await termSettle();
  if (st.lv && st.lv.safe != null) { await pick(st.lv.safe); await termSettle(); }
  if (st.mode !== 'map') { toMap(); await termSettle(); }
  if (st.evCard) closeEventCard();
  const run = st.run;
  if (s >= 1) { run.sector = 1; addSector(run.map, run.seed, 1); }
  await enterNode(run.map[bossIdOf(s)], true); await termSettle();
}
// H3AV3N in the real game: its map, or straight to a part of it.
async function termHeaven(where, end = termEndRun) {
  g0dfStop(); st.g0d = null; st.g0dBar = null;
  await termFreshRun(end); heavenSetup(); toMap(); await termSettle();
  if (where && where !== 'map' && st.evCard) closeEventCard();
  const node = k => Object.values(st.run.map).find(o => o.heaven === k);
  const real = () => ({ real: true, node: node('g0d'), startInt: st.run.integrity, startCr: st.run.credits });
  if (where === 'maze') { await enterNode(node('maze'), true); await termSettle(); }
  if (where === 'fight') await enterNode(node('g0d'), true);
  if (where === 'fake') heavenFakeWin(real());
  if (where === 'die') { g0dfStart('fight', real()); heavenDie(st.g0df); }
  if (where === 'stand') g0dfStart('stand', real());
  if (where === 'end') heavenCollapse({ node: node('g0d') });
}
// OMNI RAID: a real run, straight to the OMNI boss, b0y called in.
async function termB0yOmni(end = termEndRun) {
  Object.assign(questOf('pops'), { step: 'raid', seen: true }); save.legacy = save.legacy || {}; save.legacy.crew_b0y = 1; persist();
  end(); startRun(newSeed(), false); await termSettle();
  st.run.practice = true;
  if (st.lv && st.lv.safe != null) { await pick(st.lv.safe); await termSettle(); }
  if (st.mode !== 'map') { toMap(); await termSettle(); }
  if (st.evCard) closeEventCard();
  await enterNode(st.run.map[bossIdOf(0)], true); await termSettle();
  await wait(1200); if (st.corp) hkSpawn('b0y', 'call');
}
// A SAFEHOUSE with the WORKBENCH (engine/bench.js): the post unlocked, and letters if you have none.
async function termBench(end = termEndRun) {
  await termOnMap(end); st.run.practice = true;
  save.legacy = save.legacy || {}; save.legacy.bench = Math.max(1, save.legacy.bench || 0);
  const b = benchSave();
  if (!benchCount()) Object.assign(b.letters, { E: 3, A: 2, R: 3, S: 2, T: 2, I: 1, O: 2, N: 1, L: 1, P: 3, K: 2, M: 1, W: 2, G: 2, H: 1, C: 1, U: 1, F: 1, Z: 1, '0': 1, '*': 1 });
  persist();
  await swapTo(() => openRepair({ id: 'dev-rest' + Math.floor(Math.random() * 1e6), type: 'rest', sector: st.run.sector }));
  await termSettle();
}
// WORKBENCH letters, one of each (kept in the save). Letters only: A-Z, 0 and the * blank.
function termLetters(which = 'EEAARRSSTTPPKWMNGOZX0*') {
  const b = benchSave(), got = String(which).toUpperCase().replace(/[^A-Z0*]/g, '');
  for (const ch of got) b.letters[ch] = (b.letters[ch] || 0) + 1;
  persist();
  return got;
}
// The first corp you can go to next on the map becomes `key`. (dev.js devBreach finds it the same way)
function termCorpNode(key, tier = 1) {
  const run = termNeedRun();
  if (st.mode !== 'map' || !termIdle()) throw new Error('be on the map first');
  const id = availableNodes().find(x => run.map[x].type === 'corp');
  if (!id) throw new Error('no corp to go to from here');
  Object.assign(run.map[id], { corp: key, tier });
  delete run.map[id].mod;
  return run.map[id];
}
// A kit: only adds (a mod you have only goes up, no free slot is skipped). Says what you got.
function termKit(key) {
  const run = termNeedRun(), got = [], skipped = [];
  const mod = (k, tier) => {
    if (has(k)) {
      const was = modTier(k);
      if (tier <= was) return skipped.push(MODS[k].name + ' (have it)');
      run.modTier[k] = tier;
      if (k === 'buffer') { run.maxInt += tier - was; run.integrity += tier - was; }
      return got.push(MODS[k].name + ' up');
    }
    if (!modRoom(k)) return skipped.push(MODS[k].name + ' (no slot)');
    addMod(k, tier); got.push(MODS[k].name);
  };
  const gear = (k, tier, n) => { let i = 0; while (i < n && addItem(k, tier)) i++; if (i) got.push(ITEMS[k].name + (i > 1 ? ' x' + i : '')); if (i < n) skipped.push(ITEMS[k].name + ' (belt full)'); };
  if (key === 'tank') { mod('buffer', 3); gear('patch', 2, 10); run.integrity = Math.max(run.integrity, run.maxInt); }
  if (key === 'tracker') { mod('tracer', tierCount(MODS.tracer) - 1); mod('keylogger', tierCount(MODS.keylogger) - 1); }
  if (key === 'crew') { gear('call', 0, 5); for (const id of HK_CREW) if (ITEMS['call_' + id]) gear('call_' + id, 0, 2); }
  if (key === 'shop') { run.credits += 500; got.push('+500cr'); }
  return `${key} kit: ${got.join(', ') || 'nothing new'}${skipped.length ? '. skipped: ' + skipped.join(', ') : ''}`;
}
const onOff = v => v ? 'ON' : 'OFF';
// on / off / nothing (flip)
const termFlip = (was, a) => a === 'on' ? true : a === 'off' ? false : !was;
// a 0-1 level, or off (null)
const termLevel = a => a == null || a === 'off' ? null : clamp(+a, 0, 1);

// ---------- what an argument can be ----------
// Each gives [{ v, hint }]: v is what you type, hint is shown beside it.
const TERM_OF = {
  mods: () => Object.keys(MODS).map(k => ({ v: k, hint: MODS[k].name })),
  gear: () => Object.keys(ITEMS).map(k => ({ v: k, hint: ITEMS[k].name })),
  corps: () => corpsByLevel().map(k => ({ v: k, hint: `${CORPS[k].name}  LV${CORPS[k].level || 1}` })),
  hackers: () => Object.keys(HACKERS).map(k => ({ v: k, hint: HACKERS[k].name || '' })),
  events: () => Object.keys(SECTOR_EVENTS).map(k => ({ v: k, hint: SECTOR_EVENTS[k].name })),
  anomalies: () => [{ v: 'none', hint: 'take them off' }, ...Object.keys(ANOMALIES).map(k => ({ v: k, hint: ANOMALIES[k].name }))],
  ads: () => Object.keys(ADS).map(k => ({ v: k, hint: '' })),
  scenes: () => Object.keys(QUEST_SCENES).map(k => ({ v: k, hint: '' })),
  feats: () => Object.keys(FEAT_BY_ID).map(k => ({ v: k, hint: FEAT_BY_ID[k].name || '' })),
  steps: () => [{ v: 'none', hint: 'no quest' }, ...QUEST_INFO.pops.steps.map(s => ({ v: s.key, hint: s.name }))],
  palettes: () => Object.keys(PALETTES).map(k => ({ v: k, hint: PALETTES[k].name })),
  commands: () => TERM_CMDS.filter(termKnows).map(c => ({ v: c.name, hint: '' })),
};
const fixed = (...vs) => () => vs.map(v => Array.isArray(v) ? { v: v[0], hint: v[1] } : { v, hint: '' });

// ---------- the commands ----------
// { name, args: [{ name, of, opt }], help, run(a), safe }. of: a TERM_OF key, a fixed() list, or 'n' (a number).
// run gets the arguments, checked; it returns a line to print (or nothing: "ok") and can throw an Error, which
// prints in red. Commands mark the run as practice unless safe: true. learn (docs/TERMINAL.md "The game part"):
// none yet; for now every command is known in dev mode (?dev=1, the backtick menu, or the editor).
// A string in the list starts a group (the editor's terminal tab, tools/editor/terminal.js, lists them by group).
const termGroups = list => { let g = ''; return list.filter(c => typeof c === 'string' ? (g = c, false) : (c.group = g, true)); };
const TERM_CMDS = termGroups([
  // ----- the run -----
  'the run',
  { name: 'int', args: [{ name: 'n', of: 'n' }], help: 'set INTEGRITY (max goes up to fit)', run: a => { const run = termNeedRun(), n = Math.max(1, Math.round(a[0])); run.maxInt = Math.max(run.maxInt, n); run.integrity = n; return `INTEGRITY ${n}/${run.maxInt}`; } },
  { name: 'heal', help: 'INTEGRITY back to full', run: () => { const run = termNeedRun(); run.integrity = run.maxInt; return `INTEGRITY ${run.integrity}`; } },
  { name: 'credits', alias: ['cr'], args: [{ name: 'n', of: 'n' }], help: 'set your credits', run: a => { termNeedRun().credits = Math.max(0, Math.round(a[0])); return `${st.run.credits}cr`; } },
  { name: 'rep', args: [{ name: 'n', of: 'n' }], help: 'set REP (kept in the save)', run: a => { save.rep = Math.max(0, Math.round(a[0])); persist(); return `${save.rep} REP`; } },
  { name: 'mode.god', args: [{ name: 'on|off', of: fixed('on', 'off'), opt: true }], help: 'ICE does no damage', run: a => { st.god = termFlip(st.god, a[0]); return 'god: ' + onOff(st.god); } },
  { name: 'mode.free', args: [{ name: 'on|off', of: fixed('on', 'off'), opt: true }], help: 'travel to any node on the map', run: a => { st.freeTravel = termFlip(st.freeTravel, a[0]); st.mapSel = null; return 'free travel: ' + onOff(st.freeTravel); } },
  { name: 'mode.hold', args: [{ name: 'on|off', of: fixed('on', 'off'), opt: true }], help: 'the layer clocks stop', run: a => { st.editorHold = termFlip(st.editorHold, a[0]); return 'clocks held: ' + onOff(st.editorHold); } },
  { name: 'show.real', args: [{ name: 'on|off', of: fixed('on', 'off'), opt: true }], help: 'show the real node', run: a => { st.debug = termFlip(st.debug, a[0]); return 'show real node: ' + onOff(st.debug); } },
  { name: 'run.seed', args: [{ name: 'seed', of: 's' }], help: 'a practice run on a seed', run: a => { if (st.dev) toggleDev(); startRun(String(a[0]).toUpperCase(), true); } },
  { name: 'run.dev1', help: 'a practice run: every corp in level order', run: () => devTestRun('DEV1') },
  { name: 'run.all', args: [{ name: 'corp', of: 'corps' }], help: 'a practice run where every corp is this one', run: a => devTestRun(a[0].toUpperCase()) },
  { name: 'run.new', help: 'a fresh practice run, on the map', run: () => termFreshRun() },
  { name: 'run.end', help: 'throw the run away, back to the title', safe: true, run: () => termEndRun() },
  { name: 'run.die', help: 'flatline: the run ends as a death', run: () => { termNeedRun(); return endRun(false); } },
  // ----- corps and sectors -----
  'corps and sectors',
  { name: 'breach', args: [{ name: 'corp', of: 'corps' }, { name: 'tier', of: fixed('1', '2', '3'), opt: true }], help: 'breach a corp now (from the map)', run: a => { const n = termCorpNode(a[0], +a[1] || 1); enterNode(n, true); } },
  { name: 'corp.jump', args: [{ name: 'corp', of: 'corps', opt: true }], help: "to a corp's boss: this corp's, the one picked on the map, or one you name", run: a => {
    const run = termNeedRun();
    if (!termIdle()) throw new Error('wait for the screen to settle');
    if (a[0]) { const n = termCorpNode(a[0]); run.at = n.id; if (!run.visited.includes(n.id)) run.visited.push(n.id); startCorp(n, 99); return; }
    const inCorp = st.mode === 'play' && st.corp && st.corp.hasBoss && st.lv && !st.lv.boss;
    const sel = st.mode === 'map' && st.mapSel && run.map[st.mapSel];
    if (!inCorp && !(sel && (sel.type === 'corp' || sel.type === 'final'))) throw new Error('be in a corp, pick one on the map, or name one');
    jumpToBoss(inCorp ? null : sel);
  } },
  // A corp's intro screen, held up till you tap it (CONFIG.introHold; editor.js's corpintro scene holds it the same way).
  { name: 'corp.intro', args: [{ name: 'corp', of: 'corps' }], help: "breach a corp and hold its intro screen up (tap to go on)", run: async a => {
    await termOnMap();
    const n = termCorpNode(a[0]);
    CONFIG.introHold = 1e9;
    enterNode(n, true);
    for (let i = 0; i < 100 && !st.intro; i++) await wait(40);
    (async () => { while (st.intro) await wait(100); CONFIG.introHold = TERM_INTRO_HOLD; })();
    return 'held. tap it to go on.';
  } },
  { name: 'corp.anomaly', args: [{ name: 'anomaly', of: 'anomalies' }], help: 'put an anomaly on the corps you can go to next', run: async a => {
    await termOnMap();
    const run = st.run, key = a[0] === 'none' ? null : a[0];
    for (const id of availableNodes()) { const n = run.map[id]; if (n.type === 'corp' || n.type === 'final') { if (key) n.mod = key; else delete n.mod; } }
    if (key === 'thief') addFence(run.map, run.seed, run.sector);
  } },
  { name: 'sector', args: [{ name: 'n', of: 'n' }], help: 'climb to sector n (a fresh run if you are past it)', run: a => termToSector(clamp(Math.round(a[0]), 1, 9), null) },
  { name: 'sector.event', args: [{ name: 'event', of: 'events' }], help: 'a fresh run, sector 2 with this event', run: a => termToSector(2, a[0]) },
  { name: 'sector.boss', help: "into this sector's boss", run: async () => { await termOnMap(); const run = st.run, n = Object.values(run.map).find(x => x.type === 'final' && x.sector === run.sector) || run.map[bossIdOf(run.sector)]; await enterNode(n, true); } },
  { name: 'sector.clear', help: 'clear this sector now', run: async () => { await termOnMap(); const run = st.run, b = bossIdOf(run.sector); run.at = b; if (!run.visited.includes(b)) run.visited.push(b); await sectorClear(false); } },

  // ----- giving -----
  'giving',
  { name: 'give.mod', args: [{ name: 'mod', of: 'mods' }, { name: 'tier', of: 'n', opt: true }], help: 'put a mod in your row (or set its tier)', run: a => {
    const run = termNeedRun(), k = a[0], top = tierCount(MODS[k]) - 1, t = clamp(a[1] == null ? 0 : Math.round(a[1]) - 1, 0, top);
    if (run.mods.includes(k)) { const was = run.modTier[k] || 0; run.modTier[k] = t; if (k === 'buffer') { run.maxInt += t - was; run.integrity = clamp(run.integrity + t - was, 1, run.maxInt); } }
    else if (!modRoom(k)) throw new Error('no free slot for it');
    else addMod(k, t);
    Sound.buy(); return `${MODS[k].name} tier ${t + 1}`;
  } },
  { name: 'take.mod', args: [{ name: 'mod', of: 'mods' }], help: 'take a mod away', run: a => { termNeedRun(); if (!has(a[0])) throw new Error("you don't have it"); removeMod(a[0]); } },
  { name: 'give.gear', args: [{ name: 'gear', of: 'gear' }, { name: 'n', of: 'n', opt: true }], help: 'put gear on your belt', run: a => {
    termNeedRun();
    const k = ITEMS[a[0]].fish ? fishKeepKey({ kind: 'fish', key: a[0], rarity: ITEMS[a[0]].rarity }) : a[0];
    let i = 0; const n = Math.max(1, Math.round(a[1] || 1));
    while (i < n && addItem(k, 0)) i++;
    if (!i) throw new Error('no room on the belt');
    Sound.buy(); return `${ITEMS[k].name} x${i}`;
  } },
  { name: 'gear.fill', help: 'one of every gear', run: () => { termNeedRun(); for (const k of Object.keys(ITEMS)) if (!ITEMS[k].fish || ITEMS[k].bag) addItem(k, 0); Sound.buy(); } },
  { name: 'give.letters', args: [{ name: 'letters', of: 's', opt: true }], help: 'WORKBENCH letters (a mix if none)', safe: true, run: a => { const got = termLetters(a[0] || undefined); if (!got) throw new Error('letters only: A-Z, 0, *'); Sound.buy(); return 'letters: ' + got; } },
  { name: 'kit', args: [{ name: 'kit', of: fixed(['tank', 'BUFFER + patches'], ['tracker', 'TRACER + KEYLOGGER'], ['crew', 'CALLs'], ['shop', '+500cr']) }], help: 'a kit: only adds', run: a => { const s = termKit(a[0]); Sound.buy(); return s; } },
  { name: 'steal', help: 'your last mod goes to THE FENCE', run: () => {
    const run = termNeedRun();
    if (!run.mods.length) throw new Error('no mods');
    const key = run.mods.pop();
    (run.fence = run.fence || []).push({ key, tier: (run.modTier || {})[key] || 0 });
    addFence(run.map, run.seed, run.sector);
    return `${MODS[key].name} is at THE FENCE`;
  } },

  // ----- progress and the save -----
  'progress and the save',
  { name: 'codex.all', help: 'everything seen, every corp breached once', safe: true, run: () => {
    for (const k of [...Object.keys(MODS), ...Object.keys(ITEMS), ...GLYPHS.map(gl => gl.key), ...CODEX_CORPS.map(c => 'corp_' + c), ...Object.keys(SECTOR_EVENTS).map(e => 'ev_' + e)]) save.seen[k] = true;
    for (const c of CODEX_CORPS) if (!corpStat(c).breached) corpStat(c).breached = 1;
    persist();
  } },
  { name: 'codex.forget', help: 'every corp back to 0 breaches', safe: true, run: () => { for (const c of CODEX_CORPS) corpStat(c).breached = 0; persist(); } },
  { name: 'legacy.reset', help: "THE BOARD's unlocks and REP back to 0", safe: true, run: () => { save.legacy = {}; save.rep = 0; persist(); } },
  { name: 'progress.wipe', args: [{ name: 'yes', of: fixed('yes') }], help: 'wipe all progression (type yes)', safe: true, run: a => { if (a[0] !== 'yes') throw new Error('type: progress.wipe yes'); const w = wipeProgress(); return `progression wiped. refunded ${w.refund} REP.`; } },
  { name: 'feat', args: [{ name: 'feat', of: 'feats' }], help: 'grant a feat', safe: true, run: a => { grantFeat(a[0]); } },
  { name: 'feat.reset', args: [{ name: 'feat', of: 'feats' }], help: 'take a feat back', safe: true, run: a => { ungrantFeat(a[0]); } },
  { name: 'feat.box', args: [{ name: 'feat', of: 'feats' }], help: "show a feat's box", safe: true, run: a => { FEAT_QUEUE.push({ feat: a[0] }); } },

  // ----- quests (engine/quests.js) -----
  'quests',
  { name: 'quest.open', help: 'open the DISC quest (a sector cleared, POPS on the crew)', safe: true, run: () => { save.stats = save.stats || {}; save.stats.sectors = Math.max(1, save.stats.sectors || 0); save.legacy = save.legacy || {}; save.legacy.crew_pops = Math.max(1, save.legacy.crew_pops || 0); persist(); } },
  { name: 'quest.step', args: [{ name: 'step', of: 'steps' }], help: "set SYSTEM FAILURE's step", safe: true, run: a => {
    save.quests = save.quests || {}; save.legacy = save.legacy || {};
    if (a[0] === 'none') delete save.quests.pops; else Object.assign(questOf('pops'), { step: a[0], seen: true, news: true });
    if (['raid', 'g0d', 'done'].includes(a[0])) save.legacy.crew_b0y = 1; else delete save.legacy.crew_b0y;   // (editor.js TEST.qstep)
    persist();
  } },
  { name: 'quest.disc', help: 'the DISC on your belt', run: () => { termNeedRun(); if (!holdingDisc()) addItem('disc', 0); } },
  { name: 'quest.tag', help: 'the DOGTAG in your loot', run: () => { termNeedRun(); if (!hasLoot('dogtag')) addItem('dogtag', 0); } },
  { name: 'quest.wins', args: [{ name: 'n', of: 'n' }], help: "d0g's count (0-10)", safe: true, run: a => { questOf('pops').d0g = clamp(Math.round(a[0]), 0, 10); persist(); } },
  { name: 'quest.scene', args: [{ name: 'scene', of: 'scenes' }], help: 'play a quest scene', safe: true, run: a => playScene(a[0]) },
  { name: 'quest.card', help: "the quest's card", safe: true, run: () => questCard('pops') },
  { name: 'quest.call', help: "POPS's CALL", safe: true, run: () => queueCall('pops', QUEST_LINES.found) },
  { name: 'seed.had3s', help: 'the HAD3S seed, as if you typed it', safe: true, run: async () => { termEndRun(); st.seed = 'HAD3S'; startRun('HAD3S', false); await termSettle(); } },
  { name: 'seed.h3av3n', help: 'the H3AV3N seed, as if you typed it', safe: true, run: async () => { g0dfStop(); st.g0d = null; st.g0dBar = null; termEndRun(); st.seed = 'H3AV3N'; st.practice = !save.beatG0D; startRun('H3AV3N', st.practice); await termSettle(); } },
  { name: 'corp.myconet', help: "HAD3S, straight to MYCONET's boss", run: () => termHad3sBoss(0) },
  { name: 'corp.cerberus', help: "HAD3S, straight to CERBERUS's boss", run: () => termHad3sBoss(1) },
  { name: 'b0y.omni', help: 'OMNI RAID: the OMNI boss, b0y called in', run: () => termB0yOmni() },
  { name: 'rival.gear', help: "the rivals' gear on your belt", run: () => { const run = termNeedRun(); for (const k of ['leash', 'bone', 'muzzle', 'honey']) run.items.push({ key: k, tier: 0, n: 1 }); } },
  { name: 'hacker', args: [{ name: 'hacker', of: 'hackers' }], help: 'bring a hacker into this layer', run: a => { if (!st.corp || !st.corp.hasBoss || !st.lv) throw new Error('get into a corp layer first'); hkSpawn(a[0], HACKERS[a[0]].side === 'bad' ? 'rival' : 'call'); } },
  { name: 'heaven', args: [{ name: 'where', of: fixed(['map', 'its sector map'], ['maze', 'the maze'], ['fight', 'G0D'], ['die', 'G0D dies'], ['fake', 'the fake win'], ['stand', 'the stand'], ['end', 'the collapse']), opt: true }], help: 'H3AV3N in a practice run', run: a => termHeaven(a[0] || 'map') },

  // ----- G0D.exe (engine/g0dexe.js; its settings are kept in the save) -----
  'G0D.exe',
  { name: 'g0dexe', help: 'G0D.exe on your belt', run: () => { termNeedRun(); if (!g0dxGive()) throw new Error('no room on the belt'); } },
  { name: 'g0dexe.speed', args: [{ name: 'x', of: () => G0DX_SPEEDS.map(v => ({ v: String(v), hint: '' })) }], help: 'how fast it plays', safe: true, run: a => { g0dxCfg().speed = +a[0]; persist(); } },
  { name: 'g0dexe.clicks', args: [{ name: 'n', of: () => G0DX_CLICKS.map(v => ({ v: String(v), hint: '' })) }], help: 'how many clicks it gets', safe: true, run: a => { g0dxCfg().clicks = +a[0]; persist(); } },
  { name: 'g0dexe.knows', args: [{ name: 'beaten', of: fixed('1', '2', '3', '4', '5') }], help: 'how well it knows the corps (times beaten)', safe: true, run: a => { g0dxCfg().beaten = +a[0]; persist(); } },
  { name: 'g0dexe.popups', help: 'popups: it clicks them / waits (flips)', safe: true, run: () => { const g = g0dxCfg(); g.popups = !g.popups; persist(); return 'popups: ' + (g.popups ? 'click' : 'wait'); } },
  { name: 'g0dexe.wins', help: 'its wins count / not (flips)', safe: true, run: () => { const g = g0dxCfg(); g.countWins = !g.countWins; persist(); return 'its wins: ' + (g.countWins ? 'count' : 'not'); } },
  { name: 'g0dexe.phish', help: 'phish: all of it / skip (flips)', safe: true, run: () => { const g = g0dxCfg(); g.phish = !g.phish; persist(); return 'phish: ' + (g.phish ? 'ALL OF IT' : 'skip'); } },
  { name: 'g0dexe.risky', help: 'risky: hand back / go on (flips)', safe: true, run: () => { const g = g0dxCfg(); g.handoff = !g.handoff; persist(); return 'risky: ' + (g.handoff ? 'hand back' : 'go on'); } },
  { name: 'g0dexe.build', help: 'workbench: shred + build / shred only (flips)', safe: true, run: () => { const g = g0dxCfg(); g.build = !g.build; persist(); return 'workbench: ' + (g.build ? 'shred + build' : 'shred only'); } },
  { name: 'g0dexe.log', help: "its decision log, this run", safe: true, run: () => { const g = st.run && st.run.g0dx; if (!g || !g.log || !g.log.length) return 'nothing in the log'; return g.log.slice(-20).join('\n'); } },

  // ----- screens and effects -----
  'screens and effects',
  { name: 'show', args: [{ name: 'screen', of: fixed(['title', 'ends the run'], ['help', 'ends the run'], ['codex', 'ends the run'], ['settings', 'ends the run'], ['board', 'ends the run'], ['profile', 'ends the run'], ['pier', 'on the map'], ['bench', 'on the map'], ['shop', 'a market, on the map'], ['uplink', 'clears the sector']) }], help: 'go to a screen', safe: true, run: async a => {
    const s = a[0];
    if (s === 'pier') { await termOnMap(); st.run.practice = true; st.run.credits = Math.max(st.run.credits, 100); return swapTo(() => openPier({ id: 'dev-pier', sector: st.run.sector, type: 'pier' })); }
    if (s === 'bench') return termBench();
    if (s === 'shop') { await termOnMap(); st.run.practice = true; const id = Object.keys(st.run.map).find(k => st.run.map[k].type === 'shop'); return swapTo(() => openShop(id ? st.run.map[id] : { id: 'dev-shop' })); }
    if (s === 'uplink') { await termOnMap(); st.run.practice = true; const run = st.run, b = bossIdOf(run.sector); run.at = b; if (!run.visited.includes(b)) run.visited.push(b); await sectorClear(false); await termSettle(); return swapTo(openUplink); }
    termEndRun();
    ({ title: () => {}, help: openHelp, codex: openCodex, settings: openSettings, board: () => openBoard(), profile: openProfile })[s]();
  } },
  { name: 'show.ad', args: [{ name: 'ad', of: 'ads', opt: true }], help: 'put an ad up (a random one if none)', safe: true, run: a => { if (st.ad) closeAd(); showAd(a[0] || pickR(Object.keys(ADS), Math.random)); } },
  { name: 'show.intro', args: [{ name: 'which', of: fixed(['first', 'the first boot'], ['short', 'the short one']) }], help: 'the boot / login intro', safe: true, run: a => { save.bootSeen = a[0] !== 'first'; persist(); if (st.dev) toggleDev(); startIntro(); } },
  { name: 'fx.mold', args: [{ name: 'level', of: fixed(['off', ''], ['0.3', ''], ['0.7', ''], ['1', '']) }], help: 'how much mold the transitions carry (0-1, off)', safe: true, run: a => { st.moldDev = termLevel(a[0]); } },
  { name: 'fx.eyes', args: [{ name: 'level', of: fixed(['off', ''], ['0.3', ''], ['0.7', ''], ['1', '']) }], help: "how much of G0D's eyes the transitions carry (0-1, off)", safe: true, run: a => { st.eyesDev = termLevel(a[0]); } },
  { name: 'fx.eyewipe', help: "a transition with G0D's eyes", safe: true, run: async () => { const was = st.eyesDev; st.eyesDev = was != null ? was : 1; await wipeOut(0); wipeIn(); st.eyesDev = was; } },
  { name: 'fx.moldwipe', help: 'a transition with the mold', safe: true, run: async () => { const was = st.moldDev; st.moldDev = was != null ? was : 0.7; await wipeOut(0); wipeIn(); st.moldDev = was; } },
  { name: 'fx.card', args: [{ name: 'hacker', of: 'hackers' }], help: "a hacker's card", safe: true, run: a => { st.hkCard = { id: a[0], side: HACKERS[a[0]].side, t0: performance.now() - 500 }; } },
  { name: 'fx.death', args: [{ name: 'hacker', of: 'hackers' }], help: "a hacker's death screen (8 seconds)", safe: true, run: a => {
    st.hideAll = true; st.hkDeath = { id: a[0], side: HACKERS[a[0]].side, text: hkLine({ id: a[0] }, 'kill'), t0: performance.now() };
    setTimeout(() => { if (st.hkDeath) { st.hkDeath = null; st.hideAll = false; } }, 8000);
  } },
  { name: 'palette', args: [{ name: 'palette', of: 'palettes', opt: true }], help: 'your palette (the next one if none)', safe: true, run: a => { if (a[0]) { save.palette = a[0]; refreshPalette(); persist(); } else cyclePalette(); return PALETTES[save.palette].name; } },
  { name: 'music', args: [{ name: 'on|off', of: fixed('on', 'off'), opt: true }], help: 'music on / off', safe: true, run: a => { save.musicOn = termFlip(save.musicOn, a[0]); persist(); Sound.init(); Sound.levels(); return 'music: ' + onOff(save.musicOn); } },
  { name: 'sfx', args: [{ name: 'on|off', of: fixed('on', 'off'), opt: true }], help: 'sound effects on / off', safe: true, run: a => { save.muted = !termFlip(!save.muted, a[0]); persist(); Sound.init(); Sound.levels(); return 'sfx: ' + onOff(!save.muted); } },
  { name: 'stats.tester', help: 'stats: real / dev data (flips)', safe: true, run: () => lbToggleTester() },
  { name: 'title.pulse', help: "the title's pulse style (next one)", safe: true, run: () => { st.pulseStyle = PULSE_STYLES[(PULSE_STYLES.indexOf(st.pulseStyle || 'color') + 1) % PULSE_STYLES.length]; return st.pulseStyle; } },

  // ----- the terminal itself (always known) -----
  'the terminal itself',
  { name: 'help', args: [{ name: 'command', of: 'commands', opt: true }], help: 'what you know, or one command', always: true, safe: true, run: a => termHelp(a[0]) },
  { name: 'clear', help: 'clear the terminal', always: true, safe: true, run: () => { TERM.log = []; } },
  { name: 'history', help: 'what you ran this session', always: true, safe: true, run: () => TERM.hist.length ? TERM.hist.slice(-20).join('\n') : 'nothing yet' },
  { name: 'exit', help: 'close the terminal', always: true, safe: true, run: () => { termClose(); } },
  { name: 'menu', help: 'the old dev menu', safe: true, run: () => { termClose(); if (!st.dev) toggleDev(); } },
]);
const TERM_BY = Object.fromEntries(TERM_CMDS.map(c => [c.name, c]));
for (const c of TERM_CMDS) for (const al of c.alias || []) TERM_BY[al] = c;

// What you know. Step 1: everything in dev mode, nothing otherwise (the terminal's own commands always work,
// but they don't autocomplete till you know something).
const termDev = () => !!(st.devAccess || EDITOR);
const termKnows = c => termDev() && !!c;
const termUsage = c => [c.name, ...(c.args || []).map(x => x.opt ? `[${x.name}]` : `<${x.name}>`)].join(' ');
function termHelp(name) {
  if (name) { const c = TERM_BY[name]; if (!c || !(termKnows(c) || c.always)) throw new Error(`not a command: ${name}`); return `${termUsage(c)}\n  ${c.help}`; }
  const known = TERM_CMDS.filter(termKnows);
  if (!known.length) return 'no commands known.';
  return known.map(c => termUsage(c).padEnd(28) + ' ' + c.help).join('\n');
}

// ---------- reading what you typed ----------
const norm = s => String(s).toLowerCase().replace(/[\s._-]/g, '');
// The command a line starts with: its name, or without the dot (givemod), or split by a space (give mod).
function termParse(line) {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const find = w => TERM_BY[w.toLowerCase()] || TERM_CMDS.find(c => norm(c.name) === norm(w));
  let cmd = find(words[0]), used = 1;
  if (words.length > 1) { const two = find(words[0] + words[1]); if (two) { cmd = two; used = 2; } }   // (show ad = show.ad, not show <ad>)
  return { cmd, word: words[0], args: words.slice(used) };
}
const termItems = of => typeof of === 'function' ? of() : TERM_OF[of] ? TERM_OF[of]() : null;
// An argument as typed: a number, a free word, or one from its list (by its code or its name).
function termArg(spec, raw) {
  if (spec.of === 'n') { const n = Number(raw); if (!isFinite(n)) throw new Error(`${spec.name}: a number`); return n; }
  const items = termItems(spec.of);
  if (!items) return raw;
  const lo = raw.toLowerCase(), hit = items.find(x => x.v.toLowerCase() === lo) || items.find(x => x.hint && norm(x.hint) === norm(raw));
  if (!hit) throw new Error(`no ${spec.name} called ${raw}`);
  return hit.v;
}

// ---------- the terminal ----------
const TERM = { el: null, log: [], hist: [], histAt: -1, list: [], sel: -1, moved: false, hideList: false, busy: false };
const termTouch = () => { try { return matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } };

// Output: a line (or several) with a class: out (white), cmd (what you typed), err (red), dim.
function termOut(text, cls = 'out') {
  for (const s of String(text).split('\n')) TERM.log.push({ s, cls });
  if (TERM.log.length > 200) TERM.log.splice(0, TERM.log.length - 200);
  termDraw();
}

async function termRun(line) {
  line = line.trim();
  if (!line) return;
  if (TERM.hist[TERM.hist.length - 1] !== line) TERM.hist.push(line);   // history: this session only (Greg, 2026-11-11)
  TERM.histAt = -1;
  termOut(line, 'cmd');
  const p = termParse(line), c = p && p.cmd;
  if (!c || !(termKnows(c) || c.always)) return termOut(`unknown command: ${p ? p.word : line}`, 'err');
  try {
    const args = c.args || [];
    if (p.args.length > args.length && args.length && args[args.length - 1].of === 's') p.args = [...p.args.slice(0, args.length - 1), p.args.slice(args.length - 1).join(' ')];
    const need = args.filter(x => !x.opt).length;
    if (p.args.length < need) throw new Error('usage: ' + termUsage(c));
    const vals = args.map((spec, i) => p.args[i] == null ? null : termArg(spec, p.args[i]));
    if (!c.safe && st.run && !st.run.ended) st.run.practice = true;   // a cheat: the run doesn't count (dev.js cheat())
    TERM.busy = true; termDraw();
    const r = await c.run(vals);
    if (st.term) termOut(typeof r === 'string' ? r : 'ok', typeof r === 'string' ? 'out' : 'dim');
  } catch (err) {
    termOut(String((err && err.message) || err), 'err');
    Sound.deny();
  } finally { TERM.busy = false; termDraw(); }
}

// The list under what you're typing: commands, then (once a command is typed) its arguments.
function termSuggest() {
  const inp = TERM.input, text = inp.value.slice(0, inp.selectionStart == null ? inp.value.length : inp.selectionStart);
  const known = TERM_CMDS.filter(termKnows);
  if (!known.length) return text.trim() || termTouch() ? [{ none: 'no commands known' }] : [];
  const parts = text.replace(/^\s+/, '').split(/\s+/), last = parts[parts.length - 1];
  const p = parts.length > 1 ? termParse(parts.slice(0, -1).join(' ')) : null, c = p && p.cmd;
  if (!c) {   // still typing the command (give, give mod, give.m)
    if (!text.trim() && !termTouch()) return [];
    const q = norm(text);
    const start = known.filter(c => norm(c.name).startsWith(q) || (c.alias || []).some(al => al.startsWith(q)));
    const any = known.filter(c => !start.includes(c) && norm(c.name).includes(q));
    return [...start, ...any].map(c => ({ v: c.name, cmd: c, hint: c.help, sig: termUsage(c).slice(c.name.length) }));
  }
  if (!termKnows(c)) return [];
  const spec = (c.args || [])[p.args.length];
  if (!spec) return [];
  const items = termItems(spec.of);
  if (!items) return [{ none: `<${spec.name}>` }];
  const q = last.toLowerCase(), qn = norm(last);
  const start = items.filter(x => x.v.toLowerCase().startsWith(q) || (x.hint && norm(x.hint).startsWith(qn)));
  const any = items.filter(x => !start.includes(x) && (x.v.toLowerCase().includes(q) || (x.hint && norm(x.hint).includes(qn))));
  return [...start, ...any].map(x => Object.assign({ arg: true }, x));
}

// Put the picked item in place of the word being typed.
function termAccept(item) {
  if (!item || item.none) return false;
  const inp = TERM.input, at = inp.selectionStart == null ? inp.value.length : inp.selectionStart;
  const before = inp.value.slice(0, at), after = inp.value.slice(at);
  const head = item.arg ? before.replace(/\S*$/, '') : before.match(/^\s*/)[0];   // a command replaces all of it
  let fill = item.v;
  // a space after it when there's more to type (a command with arguments, or an argument before others)
  const p = termParse(head + fill), c = p && p.cmd;
  const more = c && (c.args || []).length > (item.arg ? p.args.length : 0);
  if (more) fill += ' ';
  inp.value = head + fill + (item.arg ? after.replace(/^\S*/, '') : '');
  const pos = (head + fill).length;
  try { inp.setSelectionRange(pos, pos); } catch (e) { /* not focused */ }
  TERM.moved = false; TERM.hideList = false;
  termRefresh();
  return true;
}
// Ready to run: a known command with every argument it needs.
function termComplete(line) {
  const p = termParse(line), c = p && p.cmd;
  return !!(c && (termKnows(c) || c.always) && p.args.length >= (c.args || []).filter(x => !x.opt).length);
}

function termRefresh() {
  TERM.list = TERM.hideList ? [] : termSuggest();
  TERM.sel = TERM.list.length && !TERM.list[0].none ? clamp(TERM.sel, 0, TERM.list.length - 1) : -1;
  if (!TERM.moved) TERM.sel = TERM.list.length && !TERM.list[0].none ? 0 : -1;
  termDraw();
}

function termKey(e) {
  const k = e.key;
  e.stopPropagation();   // the game never sees the terminal's keys
  if (k === '~' || (k === '`' && (e.ctrlKey || e.metaKey))) { e.preventDefault(); return termClose(); }
  const listOn = TERM.list.length && TERM.sel >= 0;
  if (k === 'ArrowDown' || k === 'ArrowUp') {
    e.preventDefault();
    const d = k === 'ArrowDown' ? 1 : -1;
    if (listOn && (TERM.input.value.trim() || TERM.moved)) { TERM.sel = (TERM.sel + d + TERM.list.length) % TERM.list.length; TERM.moved = true; return termDraw(); }
    if (!TERM.hist.length) return;   // history, on an empty line (or walking it already)
    TERM.histAt = TERM.histAt < 0 ? (d < 0 ? TERM.hist.length - 1 : -1) : TERM.histAt + d;
    if (TERM.histAt >= TERM.hist.length) TERM.histAt = -1;
    TERM.histAt = Math.max(-1, TERM.histAt);
    TERM.input.value = TERM.histAt < 0 ? '' : TERM.hist[TERM.histAt];
    TERM.hideList = true; TERM.moved = false; termRefresh();
    return;
  }
  if (k === 'Tab') { e.preventDefault(); if (listOn) termAccept(TERM.list[TERM.sel]); return; }
  if (k === 'Enter') {
    e.preventDefault();
    if (TERM.busy) return;
    // A word typed part way fills in from the list first (hea<Enter> = heal, give.mod trac<Enter> = tracer), and so
    // does one you picked with the arrows. Then it runs if that's all it needs; if not, you go on typing.
    if (listOn) {
      const it = TERM.list[TERM.sel], inp = TERM.input, before = inp.value.slice(0, inp.selectionStart == null ? inp.value.length : inp.selectionStart);
      const cur = it.arg ? before.split(/\s+/).pop() : before;
      if ((cur.trim() && norm(cur) !== norm(it.v)) || TERM.moved) { termAccept(it); if (!termComplete(inp.value)) return; }
    }
    const line = TERM.input.value;
    TERM.input.value = ''; TERM.hideList = false; TERM.moved = false; termRefresh();
    termRun(line);
    return;
  }
  if (k === 'Escape') {
    e.preventDefault();
    if (TERM.list.length && !TERM.hideList && TERM.input.value) { TERM.hideList = true; return termRefresh(); }
    return termClose();
  }
}

// ---------- drawing (HTML) ----------
// Its own colours (Greg, 2026-11-11: a black field, white text, a generic shell; some colour on commands and objects).
const TERM_CSS = `
#term { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; background: #000; color: #e8e8e8;
  font: 14px/1.35 ${FONT}; border-top: 1px solid #333; display: flex; flex-direction: column;
  padding: 6px 10px calc(6px + env(safe-area-inset-bottom)); box-sizing: border-box; user-select: text; -webkit-user-select: text; }
#term[hidden] { display: none !important; }
#term .t-log { overflow-y: auto; white-space: pre-wrap; word-break: break-word; min-height: 1.35em; flex: 1 1 auto; }
#term .t-list { overflow-y: auto; flex: 0 1 auto; border-top: 1px solid #222; border-bottom: 1px solid #222; margin: 4px 0; }
#term .t-list:empty { display: none; }
#term .t-row { padding: 2px 4px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#term .t-row.sel { background: #1d2a33; }
#term .t-row.none { color: #777; cursor: default; }
#term .t-line { display: flex; align-items: center; gap: 6px; }
#term .t-ps { color: #7fd4ff; }
#term input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; color: #fff; caret-color: #7fd4ff;
  font: 16px ${FONT}; padding: 4px 0; }
#term button { background: #111; color: #ccc; border: 1px solid #333; font: 13px ${FONT}; padding: 4px 8px; border-radius: 3px; cursor: pointer; }
#term button:active { background: #222; }
#term .c { color: #7fd4ff; } #term .a { color: #ffd479; } #term .d { color: #808080; } #term .e { color: #ff6b6b; } #term .o { color: #e8e8e8; }
#term b { color: #fff; font-weight: 700; }
`;
function termBuild() {
  if (TERM.el) return;
  const css = document.createElement('style'); css.textContent = TERM_CSS; document.head.appendChild(css);
  const el = document.createElement('div'); el.id = 'term'; el.hidden = true;
  el.innerHTML = '<div class="t-log"></div><div class="t-list"></div><div class="t-line"><span class="t-ps">&gt;</span>' +
    '<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" aria-label="terminal">' +
    '<button type="button" data-k="run">run</button><button type="button" data-k="x">x</button></div>';
  document.body.appendChild(el);
  TERM.el = el; TERM.logEl = el.querySelector('.t-log'); TERM.listEl = el.querySelector('.t-list'); TERM.input = el.querySelector('input');
  TERM.input.addEventListener('keydown', termKey);
  TERM.input.addEventListener('input', () => { TERM.hideList = false; TERM.moved = false; TERM.histAt = -1; termRefresh(); });
  TERM.input.addEventListener('click', () => termRefresh());
  // taps on the list and buttons don't take the focus away (the phone's keyboard stays as it is)
  el.addEventListener('pointerdown', e => { if (e.target !== TERM.input && e.target.closest('.t-row, button')) e.preventDefault(); });
  TERM.listEl.addEventListener('click', e => { const r = e.target.closest('.t-row'); if (r && !r.classList.contains('none')) termAccept(TERM.list[+r.dataset.i]); });
  el.querySelector('[data-k=run]').addEventListener('click', () => termKey({ key: 'Enter', preventDefault() {}, stopPropagation() {} }));
  el.querySelector('[data-k=x]').addEventListener('click', termClose);
  el.addEventListener('keydown', e => e.stopPropagation());
  el.addEventListener('wheel', e => e.stopPropagation());
  // Sit above a phone's keyboard: the visual viewport is what's left of the screen.
  const vv = window.visualViewport;
  const fit = () => {
    if (!vv) return;
    el.style.bottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + 'px';
    el.style.maxHeight = Math.round(vv.height * 0.7) + 'px';
  };
  if (vv) { vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); }
  else el.style.maxHeight = '70vh';
  fit();
}

const span = (cls, text) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; };
// A typed line, coloured: the command, then its arguments.
function termLineEl(text) {
  const f = document.createDocumentFragment(), p = termParse(text);
  f.appendChild(span('d', '> '));
  if (!p || !p.cmd) { f.appendChild(span('o', text)); return f; }
  const words = text.trim().split(/\s+/), n = words.length - p.args.length;
  f.appendChild(span('c', words.slice(0, n).join(' ')));
  if (p.args.length) f.appendChild(span('a', ' ' + p.args.join(' ')));
  return f;
}
function termDraw() {
  if (!TERM.el || TERM.el.hidden) return;
  const log = TERM.logEl;
  log.textContent = '';
  for (const l of TERM.log.slice(-60)) {
    const d = document.createElement('div');
    if (l.cls === 'cmd') d.appendChild(termLineEl(l.s)); else d.appendChild(span(l.cls === 'err' ? 'e' : l.cls === 'dim' ? 'd' : 'o', l.s));
    log.appendChild(d);
  }
  if (TERM.busy) log.appendChild(span('d', '...'));
  log.scrollTop = log.scrollHeight;
  const list = TERM.listEl;
  list.textContent = '';
  const rows = termTouch() ? 6 : 8;
  list.style.maxHeight = `calc(${rows} * (1.35em + 4px))`;
  TERM.list.slice(0, 120).forEach((it, i) => {
    const r = document.createElement('div');
    r.className = 't-row' + (i === TERM.sel ? ' sel' : '') + (it.none ? ' none' : '');
    r.dataset.i = i;
    if (it.none) r.textContent = it.none;
    else {
      r.appendChild(span(it.arg ? 'a' : 'c', it.v));
      if (it.sig) r.appendChild(span('d', it.sig));
      if (it.hint) r.appendChild(span('d', '  ' + it.hint));
    }
    list.appendChild(r);
  });
  const sel = list.children[TERM.sel];
  if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
}

function termOpen() {
  if (st.term) return;
  termBuild();
  if (st.dev) toggleDev();
  st.term = true;   // the game holds its clocks and takes no keys (engine/input.js, run.js...)
  TERM.el.hidden = false;
  if (!TERM.log.length) termOut(termDev() ? 'THE TERMINAL. help lists what you know. Tab fills in, Enter runs, Esc closes.' : 'THE TERMINAL.', 'dim');
  TERM.input.value = ''; TERM.moved = false; TERM.hideList = false; TERM.histAt = -1;
  termRefresh();
  if (!termTouch()) TERM.input.focus();   // a phone: tap first, the keyboard only when you tap the prompt
  Sound.ui();
}
function termClose() {
  if (!st.term) return;
  st.term = false;
  if (TERM.input) TERM.input.blur();
  if (TERM.el) TERM.el.hidden = true;
  st.boardStart = performance.now();
  Sound.ui();
}
const termToggle = () => st.term ? termClose() : termOpen();

// ~ (Shift + `) or Ctrl + `, before the game's own keys (plain ` stays the old dev menu: engine/input.js).
window.addEventListener('keydown', e => {
  const open = e.key === '~' || (e.key === '`' && (e.ctrlKey || e.metaKey));
  if (open) { e.preventDefault(); e.stopPropagation(); termToggle(); return; }
  if (st.term && TERM.input && document.activeElement !== TERM.input && e.key.length === 1 && !e.ctrlKey && !e.metaKey) TERM.input.focus();   // typing goes to the prompt
}, true);
