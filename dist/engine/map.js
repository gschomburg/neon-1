// NeoN+1 engine/map.js: The overworld map, corp picking by level, corp modifiers.
'use strict';
NEON_FILES.push(['engine/map.js', 'v14.38']);

// ---------------- Overworld map ----------------
// The map is made of sectors stacked upward. Each sector has 6 steps: its start (the
// public net, or the last sector's beaten OMNI), 4 steps of 3 lanes, and its own OMNI
// at the top. Steps are counted across the whole run, so node ids (`step:lane`) stay
// unique: sector s runs from step 5s to 5s + 5.
const MAP_STEPS = 6;
const SECTOR_STEPS = MAP_STEPS - 1;
const SIDE_LINK = 0.25;    // chance of a sideways link between two neighbors in a step
const REST_STOPS = 2;     // rest stops (market, data cache, safehouse) a stage at most; the market always one
const sectorOf = step => Math.max(0, Math.ceil(step / SECTOR_STEPS) - 1); // a sector's top (its OMNI) belongs to it
const localStep = n => n.step - SECTOR_STEPS * (n.sector || 0);
// Corp tier by sector and step: +1 tier each sector.
const tierAt = (sector, ls) => (ls <= 2 ? 1 : 2) + sector;
// Anomalies and sector events: data/events.js (ANOMALIES, SECTOR_EVENTS). Sector 1 is clean; every sector after
// rolls one event, which decides the anomalies on its corps (and on its boss).
// The order a run's events come in: a weighted shuffle of them all from the seed (no repeats until all are used).
// An event's weight: ECON.eventOdds, times every EVENT_SCALES that holds (data/events.js).
const eventScales = () => EVENT_SCALES.filter(sc => sc.when());
function eventWeight(k, scales = eventScales()) {
  let w = ECON.eventOdds[k] != null ? ECON.eventOdds[k] : 1;
  for (const sc of scales) if (sc.events.includes(k)) w *= sc.x();
  return w;
}
const pickEventW = (pool, r, scales) => {
  const ws = pool.map(k => eventWeight(k, scales));
  let x = r() * ws.reduce((a, b) => a + b, 0), i = 0;
  while ((x -= ws[i]) >= 0 && i < pool.length - 1) i++;
  return i;
};
const evOrderMemo = {};
function eventOrder(seed) {
  const scales = eventScales(), mk = seed + '|' + scales.map(sc => sc.key).join() + '|' + JSON.stringify(ECON.eventOdds);
  if (!evOrderMemo[mk]) evOrderMemo[mk] = eventOrderNow(seed, scales);
  return evOrderMemo[mk].slice();
}
function eventOrderNow(seed, scales) {
  const r = rngFor(seed, 'events'), out = [];
  let pool = Object.keys(SECTOR_EVENTS).filter(k => !SECTOR_EVENTS[k].quest && !EVENT_SIDE.includes(k) && eventWeight(k, scales) > 0);   // (quest events: H3AV3N's, never rolled; side ones only come 2nd; weight 0: never)
  while (pool.length) { const i = pickEventW(pool, r, scales); out.push(pool[i]); pool.splice(i, 1); }
  return out;
}
// Can b come as a 2nd event with a? (data/events.js, Stacking)
function eventsFit(a, b) {
  const A = SECTOR_EVENTS[a], B = SECTOR_EVENTS[b];
  if (a === b || A.alone || B.alone || (A.map && B.map)) return false;
  if ([a, b].includes('copypaste') && [a, b].includes('timeismoney')) return false;
  return A.feel === 'mixed' || B.feel === 'mixed' || A.feel !== B.feel;
}
// A run's events, sector by sector: [1st, 2nd or null]. The 1st events go in eventOrder's order, skipping any that
// already came as a 2nd; no event repeats until they've all been used (then the order starts over).
const evPlanMemo = {};
function eventPlan(seed, upTo) {
  const scales = eventScales(), mk = seed + '|' + scales.map(sc => sc.key).join() + '|' + JSON.stringify(ECON.eventOdds);
  const p = evPlanMemo[mk] = evPlanMemo[mk] || { plan: [[null, null]], used: new Set(), at: 0 };
  const order = eventOrder(seed);
  if (order[0] === 'headfirst') [order[0], order[1]] = [order[1], order[0]];   // HEAD FIRST never in sector 2
  while (p.plan.length <= upTo) {
    const s = p.plan.length;
    if (order.every(k => p.used.has(k))) { p.used.clear(); p.at = 0; }   // all used: start over
    while (p.used.has(order[p.at % order.length])) p.at++;
    const main = order[p.at % order.length]; p.at++; p.used.add(main);
    const O = ECON.eventOdds, r = rngFor(seed, 'event2', s), chance = s === 1 ? O.second2 : s === 2 ? O.second3 : O.second4;
    let second = null;
    if (r() < chance) {
      const pool = Object.keys(SECTOR_EVENTS).filter(e => !SECTOR_EVENTS[e].quest && !p.used.has(e) && eventWeight(e, scales) > 0 && eventsFit(main, e)).sort();
      if (pool.length) { second = pool[pickEventW(pool, r, scales)]; p.used.add(second); }
    }
    p.plan.push([main, second]);
  }
  return p.plan[upTo];
}
const rollEvent = (seed, s) => s ? eventPlan(seed, s)[0] : null;
const rollEvent2 = (seed, s) => s ? eventPlan(seed, s)[1] : null;   // (a 2nd event, or null: most of the time)
// Its share of the sector's corps: grows 10% a sector after the 2nd, up to 80%.
const eventShare = (ev, s) => Math.min(0.8, (SECTOR_EVENTS[ev].share || 0) + 0.1 * Math.max(0, s - 1));
// The event of sector s (kept on that sector's boss node), or null.
const bossIdOf = s => `${SECTOR_STEPS * (s + 1)}:1`;
const sectorEvent = (s = st.run ? st.run.sector : 0, map = st.run && st.run.map) => { const n = map && map[bossIdOf(s)]; return (n && n.ev) || null; };
// Both of sector s's events ([1st] or [1st, 2nd]), and whether event k is one of them.
const sectorEvents = (s = st.run ? st.run.sector : 0, map = st.run && st.run.map) => { const n = map && map[bossIdOf(s)]; return n && n.ev ? [n.ev].concat(n.ev2 ? [n.ev2] : []) : []; };
const sectorHas = (k, s, map) => sectorEvents(s, map).includes(k);
// The corps that come up more with TIME IS MONEY: their own clock, or a timed board.
const timedCorp = key => !!(CORPS[key] && (CORPS[key].timer || CORPS[key].tick));
// THE FENCE: a stop next to the sector boss, where THIEF's stolen mods are sold back. One on each side of the boss
// (the user, 2026-10-28: no long link drawn across the map), each reached from the two nodes under it; both sell the
// same stolen mods (run.fence). If only one side is free, it takes links from the whole row.
function addFence(nodes, seed, s) {
  const base = SECTOR_STEPS * s, boss = nodes[bossIdOf(s)];
  if (!boss || Object.values(nodes).some(n => n.type === 'fence' && n.sector === s)) return;
  const ids = [0, 2].map(l => `${base + 5}:${l}`).filter(x => !nodes[x]);
  if (!ids.length) return;   // (both sides taken: EENY MEENY's bosses)
  for (const id of ids) {
    const lane = +id.split(':')[1];
    nodes[id] = { id, step: base + 5, lane, sector: s, type: 'fence', next: [boss.id] };
    for (const l of ids.length > 1 ? [lane, 1] : [0, 1, 2]) { const n = nodes[`${base + 4}:${l}`]; if (n && !n.next.includes(id)) n.next.push(id); }
  }
}
// Corp levels: each step has a target level (sector + 1 early in a sector, + 2 late,
// up to 5). Corps at the target come up most, easier ones now and then (breathers),
// one level above rarely, higher never.
const targetLevel = (sector, ls) => Math.min(5, sector + (ls <= 2 ? 1 : 2));
function levelWeight(level, target) {
  const d = (level || 1) - target;
  return d === 0 ? 3 : d === -1 ? 2 : d < -1 ? 1 : d === 1 ? 0.25 : 0;
}
// Test seeds (for trying corps): a corp's name (SEEKR, HAUTECOUTURE, LEDGERTRUST2...) makes
// every node on the map that corp; DEV1 lays out every corp in level order, 3 per step.
const corpsByLevel = () => Object.keys(CORPS).sort((a, b) => (CORPS[a].level || 1) - (CORPS[b].level || 1) || a.localeCompare(b));
function testSeed(seed) {
  const s = cleanSeed(seed);
  if (/^DEV1/.test(s)) return 'all';
  const base = s.replace(/\d+$/, '');
  return Object.keys(CORPS).find(k => k.toUpperCase() === base || cleanSeed(CORPS[k].name) === base) || null;
}
// k different corps for one step, weighted by level.
function pickCorps(r, target, k, boost = null) {
  let pool = Object.keys(CORPS).map(key => ({ key, w: levelWeight(CORPS[key].level, target) * (boost ? boost(key) : 1) })).filter(o => o.w > 0);
  const out = [];
  while (out.length < k) {
    if (!pool.length) pool = Object.keys(CORPS).filter(key => !out.includes(key)).map(key => ({ key, w: 1 }));   // too few: widen
    if (!pool.length) { out.push(pickR(Object.keys(CORPS), r)); continue; }
    let u = r() * pool.reduce((t, o) => t + o.w, 0), i = 0;
    while (u >= pool[i].w && i < pool.length - 1) { u -= pool[i].w; i++; }
    out.push(pool[i].key); pool.splice(i, 1);
  }
  return out;
}

function genMap(seed) {
  const nodes = {};
  nodes['0:1'] = { id: '0:1', step: 0, lane: 1, sector: 0, type: 'start', corp: 'public', tier: 0, next: [] };
  addSector(nodes, seed, 0);
  return nodes;
}

// Add sector s on top of the map (its start node must already be there).
// force: the sector event to use (the editor's TESTING tab); otherwise it's rolled from the seed (none on test seeds).
function addSector(nodes, seed, s, force = null) {
  const r = s === 0 ? rngFor(seed, 'map') : rngFor(seed, 'map', s);
  const side = rngFor(seed, 'side', s);
  const base = SECTOR_STEPS * s;
  const add = (step, lane, type, extra = {}) => {
    const id = `${step}:${lane}`;
    nodes[id] = Object.assign({ id, step, lane, sector: s, type, next: [] }, extra);
  };
  const specs = [
    null,
    // a new sector opens with something good
    s === 0 ? ['corp', 'corp', 'corp'] : ['corp', 'corp', r() < 0.5 ? 'shop' : 'repair'],
    ['corp', 'corp', r() < 0.5 ? 'cache' : 'repair'],
    ['corp', 'corp', 'shop'],
    ['corp', 'corp', r() < 0.5 ? 'cache' : 'repair'],
  ];
  // Rest stops: at most REST_STOPS a stage. The market (row 3) always stays; the other stop is
  // one of the remaining rows' stops; the rest of those rows are all corps.
  const rr = rngFor(seed, 'rest', s), stopRows = [1, 2, 4].filter(ls => specs[ls].some(t => t !== 'corp'));
  const keep = new Set([3, ...shuffle(stopRows, rr).slice(0, REST_STOPS - 1)]);
  const test = testSeed(seed), order = corpsByLevel();
  const [fa, fb] = (force || '').split('+');   // (a forced pair: 'a+b', the editor)
  const qev = typeof questSeed === 'function' && questSeed(seed) === 'had3s' ? 'hunt' : null;   // HAD3S: THE HUNT in every sector (sector 1 too), nothing else
  const ev = qev || (s === 0 ? null : fa && SECTOR_EVENTS[fa] ? fa : test ? null : rollEvent(seed, s));
  const ev2 = qev || s === 0 || test ? null : force ? (fb && SECTOR_EVENTS[fb] ? fb : null) : rollEvent2(seed, s);   // a 2nd event, now and then
  const has = k => ev === k || ev2 === k;
  const same = has('copypaste') ? pickCorps(rngFor(seed, 'copy', s), targetLevel(s, 3), 1)[0] : null;   // COPY PASTE: one corp everywhere
  const evBoost = has('timeismoney') ? k => timedCorp(k) ? 3 : 1 : null;   // TIME IS MONEY: timed corps come up more
  const nem = typeof save !== 'undefined' && legacyLv('nemesis') && save.nemesis && CORPS[save.nemesis] ? save.nemesis : null;   // NEMESIS (THE BOARD): 3x
  const boost = evBoost || nem ? k => (evBoost ? evBoost(k) : 1) * (k === nem ? 3 : 1) : null;
  const lanes = has('gauntlet') ? [1] : [0, 1, 2];   // GAUNTLET: one line, no choices (a market in row 3)
  for (let ls = 1; ls <= 4; ls++) {
    if (!keep.has(ls) && !has('flush')) specs[ls] = specs[ls].map(() => 'corp');   // FLUSH keeps every rest stop...
    let types = test ? ['corp', 'corp', 'corp'] : shuffle(specs[ls].slice(), r);
    if (has('flush')) types = types.map(t => t === 'repair' ? 'cache' : t);   // ...as caches (the market stays)
    else if (typeof pierOn === 'function' && pierOn()) { const pr = rngFor(seed, 'pier', s, ls); types = types.map(t => t === 'cache' && pr() < 0.5 ? 'pier' : t); }   // PIER: as common as a cache (engine/fishing.js)
    let corps = test === 'all' ? [0, 1, 2].map(j => order[(s * 12 + (ls - 1) * 3 + j) % order.length])
      : test ? [test, test, test] : pickCorps(r, targetLevel(s, ls), 3, boost);
    if (same) corps = [same, same, same];
    if (has('gauntlet')) types[1] = ls === 3 ? 'shop' : 'corp';
    if (has('headfirst') && ls === 1) continue;   // HEAD FIRST: row 1 is the boss (below)
    types.forEach((type, lane) => lanes.includes(lane) && add(base + ls, lane, type, type === 'corp' ? { corp: corps[lane], tier: tierAt(s, ls) } : {}));
  }
  // The event's anomaly on its share of the sector's corps (an exact count, at least 1). CHEF'S CHOICE: any one.
  const E = ev && SECTOR_EVENTS[ev], er = rngFor(seed, 'evtag', s);
  const anyAnomaly = () => pickR(Object.keys(ANOMALIES).filter(k => !ANOMALIES[k].quest).sort(), er);
  // Two corp-tag events split the corps: a corp gets one or the other, never both (80% of the corps at most).
  const tagEvs = [ev, ev2].filter(k => k && SECTOR_EVENTS[k].kind === 'anomaly');
  if (tagEvs.length) {
    const pool = shuffle(Object.values(nodes).filter(n => n.sector === s && n.type === 'corp').sort((a, b) => a.step - b.step || a.lane - b.lane), er);
    let counts = tagEvs.map(k => Math.max(1, Math.round(eventShare(k, s) * pool.length)));
    const cap = Math.max(tagEvs.length, Math.round(0.8 * pool.length)), sum = counts.reduce((a, b) => a + b, 0);
    if (tagEvs.length > 1 && sum > cap) counts = counts.map(c => Math.max(1, Math.round(c * cap / sum)));
    let at = 0;
    tagEvs.forEach((k, i) => { const an = SECTOR_EVENTS[k].anomaly; for (const n of pool.slice(at, at + counts[i])) n.mod = an === 'any' ? anyAnomaly() : an; at += counts[i]; });
  }
  // The sector boss: OMNI in sector 1. After that, a third of the time OMNI, otherwise a LV4-5 corp. It carries the
  // event's anomaly (a sector-wide event: none). The event is kept on it (sectorEvent).
  const fr = rngFor(seed, 'stageboss', s);
  const bossAt = has('headfirst') ? [base + 1, { head: true }] : [base + 5, {}];   // HEAD FIRST: the boss is the first node
  const bossE = tagEvs.length ? SECTOR_EVENTS[tagEvs[0]] : null;   // (the boss: the 1st tag event's anomaly)
  const bossMod = bossE && !bossE.noBoss ? { mod: bossE.anomaly === 'any' ? anyAnomaly() : bossE.anomaly } : {};
  if (qev) add(bossAt[0], 1, 'final', Object.assign({ corp: s === 0 ? 'myconet' : 'cerberus', tier: 3 + s }, bossMod, bossAt[1]));   // HAD3S: MYCONET, then CERBERUS (engine/had3s.js)
  else if (s === 0 || test || fr() < 1 / 3) add(bossAt[0], 1, 'final', Object.assign({ corp: 'omni', tier: 3 + s }, bossMod, bossAt[1]));
  else {
    const hard = Object.keys(CORPS).filter(k => (CORPS[k].level || 1) >= 4).sort();
    add(bossAt[0], 1, 'final', Object.assign({ corp: pickR(hard, fr), tier: 3 + s }, bossMod, bossAt[1]));
  }
  if (has('headfirst')) {   // ...and the way out is a black market at the top (leaving it clears the sector)
    add(base + 5, 1, 'shop', { exit: true });
  }
  // EENY MEENY: two more bosses, left and right of the first (LV4-5 corps, all different)
  if (has('eenymeeny')) {
    const er2 = rngFor(seed, 'eeny', s), used = [nodes[bossIdOf(s)].corp];
    for (const lane of [0, 2]) {
      const pool = Object.keys(CORPS).filter(k => (CORPS[k].level || 1) >= 4 && !used.includes(k)).sort(), k = pickR(pool, er2);
      used.push(k); add(base + 5, lane, 'final', { corp: k, tier: 3 + s });
    }
  }
  if (ev) nodes[bossIdOf(s)].ev = ev;   // (the middle boss keeps the event)
  if (ev2) nodes[bossIdOf(s)].ev2 = ev2;
  const starts = Object.values(nodes).filter(n => n.step === base && (n.type === 'start' || n.type === 'final' || n.exit));   // (EENY MEENY: up to 3; HEAD FIRST: its exit market)
  const firstRow = lanes.filter(lane => nodes[`${base + 1}:${lane}`]);   // (HEAD FIRST: the boss only)
  for (const start of starts) for (const lane of firstRow) start.next.push(`${base + 1}:${lane}`);
  for (let ls = 1; ls <= 3; ls++) {
    for (const lane of lanes) {
      const n = nodes[`${base + ls}:${lane}`];
      if (!n) continue;
      if (n.head) { for (const l2 of lanes) n.next.push(`${base + 2}:${l2}`); continue; }   // HEAD FIRST: the boss opens onto all of row 2
      n.next.push(`${base + ls + 1}:${lane}`);
      for (const d of [-1, 1]) if (lane + d >= 0 && lane + d < 3 && r() < 0.45 && !has('rightangles') && !has('gauntlet')) n.next.push(`${base + ls + 1}:${lane + d}`);   // (RIGHT ANGLES: no diagonals)
    }
  }
  if (has('eenymeeny')) {   // each lane to its boss, and now and then a diagonal to a neighbor's
    for (const lane of lanes) { const n = nodes[`${base + 4}:${lane}`]; n.next.push(`${base + 5}:${lane}`); for (const d of [-1, 1]) if (lane + d >= 0 && lane + d < 3 && r() < 0.45) n.next.push(`${base + 5}:${lane + d}`); }
  } else for (const lane of lanes) nodes[`${base + 4}:${lane}`].next.push(`${base + 5}:1`);
  // Sideways links (both ways) between neighbors in a step. Visited nodes can't be
  // entered again, so a sideways link just lets you take one more stop in that step.
  for (let ls = 1; ls <= 4; ls++) {
    for (const lane of [0, 1]) {
      if (side() >= (has('rightangles') ? 0.6 : SIDE_LINK) || has('gauntlet') || (has('headfirst') && ls === 1)) continue;   // RIGHT ANGLES: more sideways links, so rows still give a choice
      const a = nodes[`${base + ls}:${lane}`], b = nodes[`${base + ls}:${lane + 1}`];
      a.next.push(b.id); b.next.push(a.id);
    }
  }
  // THE FENCE, when a corp here has a THIEF (STICKY FINGERS, or CHEF'S CHOICE rolling one).
  if (Object.values(nodes).some(n => n.sector === s && n.type === 'corp' && n.mod === 'thief')) addFence(nodes, seed, s);
  return nodes;
}
const mapTop = map => Math.max(...Object.values(map).map(n => n.step));
// What a node shows on the map, 3 cells: [$] [?] [+] for stops, a corp's code (SK1) for corps.
// BLINDERS: the corp is hidden (its level shows) until you've been in.
const blinded = n => n.mod === 'blinders' && !(st.run && st.run.visited.includes(n.id));
const nodeLabel = n => n.type === 'shop' ? '[$]' : n.type === 'cache' ? '[?]' : n.type === 'repair' ? '[+]' : n.type === 'pier' ? '[~]' : n.type === 'fence' ? '[&]'
  : blinded(n) ? (n.type === 'final' ? '???' : '??' + (corpDef(n.corp).level || 1)) : corpCode(corpDef(n.corp));
