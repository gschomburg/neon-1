// NeoN+1 engine/map.js: The overworld map, corp picking by level, corp modifiers.
'use strict';
NEON_FILES.push(['engine/map.js', 'v12.10']);

// ---------------- Overworld map ----------------
// The map is made of sectors stacked upward. Each sector has 6 steps: its start (the
// public net, or the last sector's beaten OMNI), 4 steps of 3 lanes, and its own OMNI
// at the top. Steps are counted across the whole run, so node ids (`step:lane`) stay
// unique: sector s runs from step 5s to 5s + 5.
const MAP_STEPS = 6;
const SECTOR_STEPS = MAP_STEPS - 1;
const SIDE_LINK = 0.25;    // chance of a sideways link between two neighbors in a step
const sectorOf = step => Math.max(0, Math.ceil(step / SECTOR_STEPS) - 1); // a sector's top (its OMNI) belongs to it
const localStep = n => n.step - SECTOR_STEPS * (n.sector || 0);
// Corp tier by sector and step: +1 tier each sector.
const tierAt = (sector, ls) => (ls <= 2 ? 1 : 2) + sector;
// Corp modifiers: a tag rolled onto a corp node on the map (none in sector 1, then 10% and
// +5% a sector). They change how any corp plays. tag: the mark next to the node on the map.
const CORP_MODS = {
  cursed:  { name: 'CURSED',  tag: '!', desc: 'no perfect heals here.' },
  rush:    { name: 'RUSH',    tag: '>', desc: 'every layer has a 10s clock.' },
  loaded:  { name: 'LOADED',  tag: '$', desc: 'more $ nodes. pays x1.2' },
  branded: { name: 'BRANDED', tag: 's', desc: 'some ICE wear a sigil.' },
  thief:   { name: 'THIEF',   tag: '&', desc: 'hits steal mods. beat boss.' },
  armored: { name: 'ARMORED', tag: '#', desc: 'hits point at the real.' },
  rival:   { name: 'RIVAL',   tag: 'V', desc: 'a rival races you for it.' },
};
const corpModChance = s => s === 0 ? 0 : Math.min(0.4, 0.1 + 0.05 * (s - 1));
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
function pickCorps(r, target, k) {
  let pool = Object.keys(CORPS).map(key => ({ key, w: levelWeight(CORPS[key].level, target) })).filter(o => o.w > 0);
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
function addSector(nodes, seed, s) {
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
  const test = testSeed(seed), order = corpsByLevel();
  for (let ls = 1; ls <= 4; ls++) {
    const types = test ? ['corp', 'corp', 'corp'] : shuffle(specs[ls].slice(), r);
    const corps = test === 'all' ? [0, 1, 2].map(j => order[(s * 12 + (ls - 1) * 3 + j) % order.length])
      : test ? [test, test, test] : pickCorps(r, targetLevel(s, ls), 3);
    const mr = rngFor(seed, 'cmod', s, ls);
    types.forEach((type, lane) => {
      const mod = type === 'corp' && !test && mr() < corpModChance(s) ? pickR(Object.keys(CORP_MODS), mr) : null;
      add(base + ls, lane, type, type === 'corp' ? Object.assign({ corp: corps[lane], tier: tierAt(s, ls) }, mod ? { mod } : {}) : {});
    });
  }
  // The sector boss: OMNI in sector 1. After that, a third of the time OMNI, and otherwise a
  // LV4-5 corp with a modifier stacked on top.
  const fr = rngFor(seed, 'stageboss', s);
  if (s === 0 || test || fr() < 1 / 3) add(base + 5, 1, 'final', { corp: 'omni', tier: 3 + s });
  else {
    const hard = Object.keys(CORPS).filter(k => (CORPS[k].level || 1) >= 4).sort();
    add(base + 5, 1, 'final', { corp: pickR(hard, fr), tier: 3 + s, mod: pickR(Object.keys(CORP_MODS).sort(), fr) });
  }
  const start = nodes[`${base}:1`];
  for (let lane = 0; lane < 3; lane++) start.next.push(`${base + 1}:${lane}`);
  for (let ls = 1; ls <= 3; ls++) {
    for (let lane = 0; lane < 3; lane++) {
      const n = nodes[`${base + ls}:${lane}`];
      n.next.push(`${base + ls + 1}:${lane}`);
      for (const d of [-1, 1]) if (lane + d >= 0 && lane + d < 3 && r() < 0.45) n.next.push(`${base + ls + 1}:${lane + d}`);
    }
  }
  for (let lane = 0; lane < 3; lane++) nodes[`${base + 4}:${lane}`].next.push(`${base + 5}:1`);
  // Sideways links (both ways) between neighbors in a step. Visited nodes can't be
  // entered again, so a sideways link just lets you take one more stop in that step.
  for (let ls = 1; ls <= 4; ls++) {
    for (const lane of [0, 1]) {
      if (side() >= SIDE_LINK) continue;
      const a = nodes[`${base + ls}:${lane}`], b = nodes[`${base + ls}:${lane + 1}`];
      a.next.push(b.id); b.next.push(a.id);
    }
  }
  return nodes;
}
const mapTop = map => Math.max(...Object.values(map).map(n => n.step));
const nodeLetter = n => n.type === 'shop' ? '$' : n.type === 'cache' ? '?' : n.type === 'repair' ? '+' : corpDef(n.corp).letter;
