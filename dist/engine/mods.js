// NeoN+1 engine/mods.js: Mod trigger stages and tiers.
'use strict';
NEON_FILES.push(['engine/mods.js', 'v13.46']);

const rarityCol = r => C[r] || C.text;   // a rarity's key color (its chip's background)
// Rarity chips (CHIPS in core.js): chipOf(r) = { fg, bg }. rarityChips(text) finds the rarity words
// (SCRAP COMMON RARE EPIC LEGEND EXOTIC) in a line, so only those words get chipped.
const chipOf = r => CHIPS[r] || CHIPS.common;
const RARITY_OF_LABEL = Object.fromEntries(Object.entries(RARITY).map(([k, v]) => [v.label, k]));
const RARITY_WORDS = new RegExp('\\b(' + Object.keys(RARITY_OF_LABEL).join('|') + ')\\b', 'g');
const rarityChips = text => [...String(text).matchAll(RARITY_WORDS)].map(m => ({ from: m.index, len: m[0].length, r: RARITY_OF_LABEL[m[0]] }));
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
// ---- MOD FIRED: one animation for every mod. When a mod goes off, its tray badge plays this,
// so you can tell which mod did what. Tune the look here; it's the same for all mods.
// The game calls modFired(key) wherever a mod takes effect (the stage loops in engine/run.js,
// lockTile, blockHit, the tap-to-use mods...). A mod already playing it doesn't restart.
const MOD_FIRE = {
  ms: 900,        // how long it plays
  blinkMs: 110,   // the badge flips inverted / normal this often
  hop: 0.3,       // the letters hop (in rows) as a wave runs across them; 0 = no hop
  hopMs: 360,     // how long the wave takes to cross the badge
};
// How cell k of a firing badge looks right now (k: 0 = the icon, 1.. = the letters):
// { inv, dy }, or null when the mod isn't firing. drawBadge (engine/scene.js) draws it.
function modFireLook(key, now, k) {
  const a = st.firedAt && st.firedAt[key], age = a == null ? -1 : now - a;
  if (age < 0 || age >= MOD_FIRE.ms) return null;
  const inv = Math.floor(age / MOD_FIRE.blinkMs) % 2 === 0;
  const w = age / MOD_FIRE.hopMs - k * 0.12;
  return { inv, dy: MOD_FIRE.hop && w > 0 && w < 1 ? -Math.sin(w * Math.PI) * MOD_FIRE.hop : 0 };
}
// (on st, not the run: times don't survive a reload)
const modFiring = (key, now) => !!modFireLook(key, now, 0);
const modFired = key => {
  if (modFiring(key, performance.now())) return;
  (st.firedAt = st.firedAt || {})[key] = performance.now();
};
// For mods the screen shows on its own (drawn every frame): fire once per `holder` (the layer).
const modFiredOnce = (key, holder) => { if (!holder || (holder.fired && holder.fired[key])) return; (holder.fired = holder.fired || {})[key] = true; modFired(key); };
const modsOfKind = (...kinds) => Object.keys(MODS).filter(k => kinds.includes(MODS[k].kind));
function modWhere(m) {
  if (m.kind === 'corp') return `from: ${corpDef(m.corp).name} boss.`;
  if (m.kind === 'minor') return 'from: start, safehouse, cache, shop.';
  if (m.kind === 'exotic') return 'from: sector bosses, rare in markets, caches.';
  return 'from: bosses, caches, market.';
}

// ---- EXOTIC mods (docs/EXOTICS.md). Where they show up, how often:
const EXOTIC = {
  shopChance: 0.12,                  // a market has an exotic mod for sale
  cacheChance: 0.05,                 // a cache offers one (CACHEKEY raises it, by tier:)
  cacheKeyChance: [0.10, 0.20, 0.35],
};
// Rule slots: what a mod rewrites. Two mods on the same slot can't be held together.
const SLOT_TEXT = {
  goal: 'changes how layers are won',
  health: 'changes what a hit costs you',
  real: 'changes how many nodes are real',
  tap: 'changes what a tap does',
  carry: 'changes what carries between layers',
  slots: 'changes your tray',
};
// The mod you own that `key` clashes with (same slot), or null.
const clashWith = key => {
  const s = MODS[key] && MODS[key].slot;
  return s && st.run ? st.run.mods.find(k => k !== key && MODS[k] && MODS[k].slot === s) || null : null;
};
const modLocked = key => !!(MODS[key] && MODS[key].locked);
// An exotic mod offer ({ key, tier }) with odds `chance`, from its own random stream (so the
// normal offers roll the same as before). [] when it doesn't come up or you have them all.
function exoticOffer(seed, where, id, chance) {
  const r = rngFor(seed, 'exotic', where, id);
  if (r() >= chance) return [];
  const got = pickMods(r, modsOfKind('exotic').filter(k => !clashLockedOut(k)), 1);
  if (got.length) statExotic(where, id, got[0].key);   // play stats: does anyone find one
  return got;
}
// Can't be offered: it would replace a locked mod (ZOMBIE's slot).
const clashLockedOut = key => { const c = clashWith(key); return !!(c && modLocked(c)); };

// ---- ZOMBIE: rot instead of integrity. Numbers to tune:
const ROT = {
  max: 150,       // fall apart here
  layer: 3,       // every layer you enter
  ice: 5,         // every ICE node you break
  timeout: 6,     // the clock running out (at least an ICE)
  realTap: 40,    // with ICE EATER: biting the real node
  heal: 10,       // each point of healing takes this much rot away
  perTap: 5,      // taps to break a node = 1 + rot / perTap
};
const zombie = () => has('zombie');
// ---- BLOOD MONEY: credits are your health. Numbers to tune:
// (its numbers are in data/economy.js)
const BLOOD = {
  get bonus() { return earnInt(ECON.blood.bonus); },           // credits when you take it
  get hit() { return costInt(ECON.bloodHit.base); },           // what a hit costs (x damage), plus
  get perSector() { return costInt(ECON.bloodHit.perSector); },   // this much more each sector
  get heal() { return earnInt(ECON.blood.heal); },             // each point of healing pays this
};
const bloodMoney = () => has('bloodmoney');
// ---- LEVERAGE: credits can go negative. Numbers to tune:
// (its numbers are in data/economy.js)
const DEBT = {
  get limit() { return costInt(ECON.debt.limit); },                   // how far below 0 you can go, plus
  get perSector() { return costInt(ECON.debt.limitPerSector); },      // this much more each sector
  get interest() { return ECON.debt.interestPct; },                   // debt grows this much every layer, at least
  get interestMin() { return costInt(ECON.debt.interestMin); },
  get shieldPer() { return costInt(ECON.debt.shieldPer); },           // ICE does nothing with odds debt / shieldPer, up to
  get shieldMax() { return ECON.debt.shieldMax; },
  get payment() { return costInt(ECON.debt.payment); },               // every corp layer takes a loan payment, debt or not, plus
  get paymentSector() { return costInt(ECON.debt.paymentPerSector); },   // this much more each sector
};
const leverage = () => has('leverage');
// OMERTA: an ICE hit costs a share of your credits (at least a minimum) instead of integrity
const omertaCost = () => Math.max(costInt(ECON.omerta.min), Math.floor(Math.max(0, st.run.credits) * ECON.omerta.pct));
// The lowest your credits can go: 0, or the debt limit with LEVERAGE.
const creditFloor = () => leverage() ? -(DEBT.limit + DEBT.perSector * ((st.run && st.run.sector) || 0)) : 0;
// Can you spend n credits (into debt, with LEVERAGE)?
const canSpend = n => !!st.run && st.run.credits - n >= creditFloor();
const bloodCost = (n = 1) => n * (BLOOD.hit + BLOOD.perSector * ((st.run && st.run.sector) || 0));
const tapsToBreak = () => 1 + Math.floor((st.run.rot || 0) / ROT.perTap);
// ICE EATER is on for this layer (set when the layer opens).
const eaterOn = () => !!(st.lv && st.lv.eater);
// A real node: the corp's, or QUANTUM's second one (t.quantum).
const isReal = t => !!(t && (t.safe || t.quantum));

// ---- COIN FLIP: hold a node to flip a coin on it first. Numbers to tune:
const COIN = {
  holdMs: 260,       // hold a node this long (or drag up from it) to bring the coin up
  spinMs: 650,       // the flip
  faces: [['hp', 'cr', 50], ['hp', 'hp', 25], ['cr', 'cr', 25]],   // face pairs, % odds
  bigChance: 0.2,    // each face can be a big one
  hp: 1, bigHp: 2,   // a ♥ face: integrity won / lost
  get cr() { return earnInt(ECON.mods.coinCr); }, get bigCr() { return earnInt(ECON.mods.coinBigCr); },   // a $ face: credits won / lost, x the multiplier (data/economy.js)
  get max() { return ECON.modx.coinMax; },   // the multiplier tops out here (data/economy.js)
};
// Mods some corps switch off: COIN FLIP in the drag corps (DECIBEL, SQUALOR, PLAYBALL: holding and
// dragging already mean something there), QUANTUM in corps with their own tap rules (DEMOLITION,
// FORM 27B...). Shown on the map's corp info, the tray tip, and a dimmed badge inside.
const MOD_OFF = { coinflip: def => !!def.drag, quantum: def => !!def.tap, snooze: def => !!def.tap };
const modOffIn = (key, def) => !!(def && MOD_OFF[key] && MOD_OFF[key](def));
const modsOffIn = def => st.run ? st.run.mods.filter(k => modOffIn(k, def)) : [];
const modOffHere = key => !!(st.mode === 'play' && st.corp && st.corp.hasBoss && modOffIn(key, st.corp.def));
const coinOn = () => has('coinflip') && st.mode === 'play' && !!st.corp && st.corp.hasBoss && !st.mp && !modOffHere('coinflip');
const coinMult = () => has('coinflip') && st.run ? (st.run.coinMult || 1) : 1;
const coinValue = f => f.kind === 'hp' ? (f.big ? COIN.bigHp : COIN.hp) : (f.big ? COIN.bigCr : COIN.cr) * coinMult();
// The two faces for a coin on node i: [{ kind, big }, { kind, big }], from its own random stream.
function rollCoin(i) {
  const run = st.run, r = rngFor(run.seed, 'coinface', st.corp.node.id, st.corp.idx, i, (run.coinRolls = (run.coinRolls || 0) + 1));
  let u = r() * 100, pair = COIN.faces[0];
  for (const p of COIN.faces) { if (u < p[2]) { pair = p; break; } u -= p[2]; }
  const faces = [pair[0], pair[1]].map(kind => ({ kind, big: r() < COIN.bigChance }));
  return r() < 0.5 ? faces : faces.reverse();
}

// ---- Tiers. Mods and items with `tiers` come in up to 3 steps (COMMON, RARE, EPIC, or
// levels). Finds roll a tier; finding a mod you have upgrades it (see addMod).
const MOD_SLOTS = 6;                 // mods you can hold; more means swapping one out
const modSlots = () => MOD_SLOTS * (has('ramdoubler') ? 2 : 1);   // RAM DOUBLER: twice as many (a second full row)
const TIER_ODDS = [0.70, 0.95];      // a find is its first step under 0.70, the second under 0.95, else the third
const TIER_PRICE = ECON.tierPrice;    // market price by tier
const STACK_MAX = 15;                // items stack up to F (counts are hex)
const tierCount = def => def.tiers ? def.tiers.length : 1;
// A mod / item as it is at a tier (its rarity, tip and text for that step).
const tierView = (def, tier = 0) => def.tiers ? Object.assign({}, def, def.tiers[clamp(tier, 0, def.tiers.length - 1)], { tier: clamp(tier, 0, def.tiers.length - 1) }) : Object.assign({}, def, { tier: 0 });
const modView = (key, tier) => tierView(MODS[key], tier == null ? modTier(key) : tier);
const itemView = (key, tier = 0) => tierView(ITEMS[key], tier);
const modTier = key => (st.run && st.run.modTier && st.run.modTier[key]) || (st.run && key && key === st.run.mutateAs && st.run.mods.includes('mutate') && st.run.mutateTier) || 0;   // MUTATE: what it became, at its rolled tier
const tv = (key, values) => values[clamp(modTier(key), 0, values.length - 1)]; // a value by your tier
const tierLabel = v => v.lvlTag ? `LV${v.tier + 1}` : RARITY[v.rarity].label;
function rollTier(r, def) {
  if (!def.tiers) return 0;
  const u = r();
  let t = Math.min(def.tiers.length - 1, u < TIER_ODDS[0] ? 0 : u < TIER_ODDS[1] ? 1 : 2);
  while (t > 0 && tierView(def, t).rarity === 'legendary' && u < TIER_ODDS[1]) t--;   // a legendary step: only the top 5% (or take it twice)
  return t;
}
// What owning `key` becomes if you take it at `tier`: at or below yours = up one step,
// above yours = jump to it. Never past the top.
function upgradeTo(key, tier) {
  if (!has(key)) return tier;
  const cur = modTier(key), max = tierCount(MODS[key]) - 1;
  return tier <= cur ? Math.min(cur + 1, max) : tier;
}
const modMaxed = key => has(key) && modTier(key) >= tierCount(MODS[key]) - 1;
