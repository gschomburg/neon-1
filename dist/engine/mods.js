// NeoN+1 engine/mods.js: Mod trigger stages and tiers.
'use strict';
NEON_FILES.push(['engine/mods.js', 'v12.08']);

const rarityCol = r => C[r] || C.text;   // a rarity's key color (its chip's background)
// Rarity chips (CHIPS in core.js): chipOf(r) = { fg, bg }. rarityChips(text) finds the rarity words
// (COMMON RARE EPIC EXOTIC BOSS) in a line, so only those words get chipped.
const chipOf = r => CHIPS[r] || CHIPS.common;
const rarityChips = text => [...String(text).matchAll(/\b(COMMON|RARE|EPIC|EXOTIC|BOSS)\b/g)].map(m => ({ from: m.index, len: m[0].length, r: m[0].toLowerCase() }));
const TIERED_ITEMS = Object.keys(ITEMS).filter(k => ITEMS[k].tiers);
for (const k of Object.keys(MODS)) MODS[k].key = k;

// ---- Trigger order. Every mod fires in one stage, and a pick runs the stages in this
// order, each one to the end before the next:
//   START  a layer opens           PICK  you tap, before the reveal
//   BLOCK  ICE: does it hurt?      HIT   after the hit (info, loot)
//   BOARD  changes to the grid     END   the layer is done
// Inside a stage, mods fire left to right on the mod bar, and corp twists go after your
// mods (the corp moves last, so your info is about the board you'll actually see).
// BLOCK is the exception: a fixed order (see blockHit) so nothing gets wasted.
// TAP, CLOCK and ALWAYS aren't part of a pick: you fire them, the clock does, or they
// just change numbers and rules.
const STAGES = {
  start:  { label: 'LAYER START', order: 1, desc: 'a layer opens' },
  pick:   { label: 'ON PICK',     order: 2, desc: 'tap, before reveal' },
  block:  { label: 'BLOCK',       order: 3, desc: 'does the ICE hurt?' },
  hit:    { label: 'ON HIT',      order: 4, desc: 'info and loot' },
  board:  { label: 'BOARD',       order: 5, desc: 'the grid changes' },
  end:    { label: 'LAYER END',   order: 6, desc: 'the layer is done' },
  tap:    { label: 'TAP TO USE' },
  clock:  { label: 'ON THE CLOCK' },
  always: { label: 'ALWAYS ON' },
};
const MOD_STAGE = {
  sniffer: 'start', corners: 'start', sigscan: 'start', afterimage: 'start', basictraining: 'start', runway: 'start',
  forecast: 'start', spellbound: 'start', seedreader: 'start', photographic: 'start',
  prism: 'hit', fourinarow: 'end',
  queuenumber: 'hit', rollup: 'tap', blast: 'tap', interrogate: 'tap', turing: 'hit',
  handshake: 'start', callerid: 'hit', snipe: 'start', omerta: 'block', sacrifice: 'tap', letitride: 'end', remote: 'tap', chancecard: 'start',
  icebox: 'block', greenwave: 'block', leadlining: 'block', express: 'end', scoop: 'start', cctv: 'start', compost: 'hit', foghorn: 'hit',
  grounded: 'block', friendship: 'block', jackbox: 'start', triage: 'end', honeycomb: 'end', pixelpeep: 'hit', espresso: 'tap', freezeframe: 'tap',
  horoscope: 'block', index: 'hit', policy: 'hit', pickset: 'hit', pencil: 'hit', unravel: 'board', ezpass: 'end',
  xaxis: 'pick', yaxis: 'pick',
  bulwark: 'block', forgery: 'block', shatter: 'block', failsafe: 'block',
  tracer: 'hit', keylogger: 'hit',
  virus: 'board', autocomplete: 'board', twinlock: 'board',
  skipjack: 'end', interest: 'end', graverobber: 'end',
  parity: 'hit', headcount: 'start', flare: 'tap',
  burner: 'tap', overclock: 'clock',
  anchor: 'tap', infrared: 'start', ambush: 'block', antigrav: 'board',
  timewarp: 'tap', inversion: 'block', lastbyte: 'hit', precog: 'start',
  dejavu: 'start', spoiler: 'start', linkup: 'board',
};
for (const k of Object.keys(MODS)) MODS[k].stage = MOD_STAGE[k] || 'always';
// Your mods that fire in a stage, left to right on the bar.
const modsAt = stage => st.run ? st.run.mods.map(k => k === 'mutate' ? st.run.mutateAs : k).filter(k => k && MODS[k] && MODS[k].stage === stage) : [];
const modsOfKind = (...kinds) => Object.keys(MODS).filter(k => kinds.includes(MODS[k].kind));
function modWhere(m) {
  if (m.kind === 'corp') return `from: ${corpDef(m.corp).name} boss.`;
  if (m.kind === 'minor') return 'from: start, safehouse, cache, shop.';
  return 'from: bosses, caches, market.';
}

// ---- Tiers. Mods and items with `tiers` come in up to 3 steps (COMMON, RARE, EPIC, or
// levels). Finds roll a tier; finding a mod you have upgrades it (see addMod).
const MOD_SLOTS = 6;                 // mods you can hold; more means swapping one out
const TIER_ODDS = [0.70, 0.95];      // a find is COMMON under 0.70, RARE under 0.95, else EPIC
const TIER_PRICE = [1, 1.6, 2.5];    // market price by tier
const STACK_MAX = 15;                // items stack up to F (counts are hex)
const tierCount = def => def.tiers ? def.tiers.length : 1;
// A mod / item as it is at a tier (its rarity, tip and text for that step).
const tierView = (def, tier = 0) => def.tiers ? Object.assign({}, def, def.tiers[clamp(tier, 0, def.tiers.length - 1)], { tier: clamp(tier, 0, def.tiers.length - 1) }) : Object.assign({}, def, { tier: 0 });
const modView = (key, tier) => tierView(MODS[key], tier == null ? modTier(key) : tier);
const itemView = (key, tier = 0) => tierView(ITEMS[key], tier);
const modTier = key => (st.run && st.run.modTier && st.run.modTier[key]) || 0;
const tv = (key, values) => values[clamp(modTier(key), 0, values.length - 1)]; // a value by your tier
const tierLabel = v => v.lvlTag ? `LV${v.tier + 1}` : RARITY[v.rarity].label;
function rollTier(r, def) {
  if (!def.tiers) return 0;
  const u = r();
  return Math.min(def.tiers.length - 1, u < TIER_ODDS[0] ? 0 : u < TIER_ODDS[1] ? 1 : 2);
}
// What owning `key` becomes if you take it at `tier`: at or below yours = up one step,
// above yours = jump to it. Never past the top.
function upgradeTo(key, tier) {
  if (!has(key)) return tier;
  const cur = modTier(key), max = tierCount(MODS[key]) - 1;
  return tier <= cur ? Math.min(cur + 1, max) : tier;
}
const modMaxed = key => has(key) && modTier(key) >= tierCount(MODS[key]) - 1;
