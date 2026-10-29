// NeoN+1 data/economy.js: every money number in the game, in one place (the user's credit scale, 2026-10-26).
// The neon editor's ECONOMY tab edits this file (tools/economy_file.js writes it; the notes come from there).
//
// Two units: EARN (everything that pays you) and SPEND (everything that costs you). A number marked earn / spend is a
// count of that side's units: repair 2 = 2 x the spend unit = 20cr. Change a unit and that whole side moves; change
// one number and only that thing moves. Each side can grow every sector (0.35 = +35% a sector). Numbers marked x are
// multipliers, % are shares (0.05 = 5%), cr are credits. Mod and item prices stay with the mods (data/mods.js), at a
// unit of 10, scaled by the spend unit.
'use strict';
NEON_FILES.push(['data/economy.js', 'v13.83']);

const ECON = {
  // ---- Units
  earn: {
    unit: 10,   // cr: earn unit (how many credits one earn unit is)
    grow: 0,   // grow: earn growth (everything you earn grows this much each sector (0.35 = +35% a sector))
  },
  spend: {
    unit: 10,   // cr: spend unit (how many credits one spend unit is)
    grow: 0,   // grow: spend growth (everything you spend grows this much each sector)
  },
  // ---- Earning: layer pay
  pay: {
    base: 0.4,   // earn: base (what every layer pays before its nodes count)
    perNode: 0.2,   // earn: per node (added for each node on the layer (bigger layers pay more))
    boss: 3,   // x: boss layer (a corp's boss layer pays this many times a normal one)
    stageBoss: 1.5,   // x: sector boss corp (when a corp is the sector boss, all its layers pay this many times more)
    perfect: 2,   // x: perfect (finding the real node on the first try multiplies that layer's pay by this)
    perfectPerNode: 0,   // x: perfect, per node (adds this much more to the perfect multiplier for each node past the first (0 = a flat perfect; the old curve was perfect 1, per node 0.5))
  },
  // ---- Earning: loot and rewards
  loot: {
    base: 1.2,   // earn: loot: base (a loot node you hit (or a data cache roll) pays this...)
    perTier: 0.8,   // earn: loot: per corp level (...plus this for each corp level (caches count as level 2)...)
    roll: 1.2,   // earn: loot: random extra (...plus a random amount up to this)
    itemChance: 0.4,   // %: loot: gear instead (the chance a loot roll gives gear instead of credits (STASH raises it))
  },
  skip: {
    starter: 1.5,   // earn: skip the starter perk (take credits instead of a mod at the start of a run)
    boss: 2,   // earn: skip a boss's reward (take credits instead of a mod after beating a corp)
    sector: 4,   // earn: skip the sector boss's reward (take credits instead of a mod after the uplink)
  },
  reward: {
    gear: 0.35,   // %: boss reward: gear pick (the chance a corp boss reward's random third pick is a stack of gear instead of a mod)
    weight: [0.5, 0.7, 1, 0.8],   // x list: boss reward gear: how likely (which gear it is, by rarity: scrap / common / rare / epic)
    min: [6, 3, 2, 1],   // count list: boss reward gear: fewest (how many come in the stack, by rarity: scrap / common / rare / epic...)
    max: [8, 4, 3, 2],   // count list: boss reward gear: most (...up to this many)
  },
  rival: {
    flatlined: 3,   // earn: RIVAL: knocked out (beat the rival hacker by knocking it out)
    beat: 1.5,   // earn: RIVAL: beat it clean (beat the rival hacker without it stealing anything)
  },
  // ---- Earning: mods that pay credits
  mods: {
    ezpass: 0.6,   // earn: EZPASS (every layer you beat pays this bonus)
    policy: 2,   // earn: POLICY (every time you hit ICE, the insurance pays this)
    graverobber: 0.2,   // earn: GRAVE ROBBER (beating a layer pays this for each ICE you never touched)
    interestPct: 0.05,   // %: INTEREST (beating a corp pays this share of the credits you hold...)
    interestMax: 5,   // earn: INTEREST: cap (...but never more than this)
    chancecard: 3,   // earn: CHANCE CARD (drawing the credits card pays this)
    coinCr: 1,   // earn: COIN FLIP: $ face (a $ side wins (or loses) this, times your streak multiplier)
    coinBigCr: 2.5,   // earn: COIN FLIP: big $ face (a big $ side wins (or loses) this, times your streak multiplier)
    ramDoublerSell: 0.5,   // %: RAM DOUBLER: gear sold for (taking it sells all the gear you hold for this share of its price)
  },
  blood: {
    bonus: 10,   // earn: BLOOD MONEY: when you take it (paid once, the moment you take the mod)
    heal: 1.5,   // earn: BLOOD MONEY: per heal (anything that would heal you pays this per point instead)
  },
  corps: {
    safeharborClaim: 0.5,   // earn: SAFEHARBOR: insurance claim (inside SAFEHARBOR, every ICE hit pays this)
    chuckecacheTicket: 1.5,   // x: CHUCK E. CACHE: ticket value (inside CHUCK E. CACHE layers pay in tickets; beating it cashes each ticket in for this many credits)
  },
  // ---- Earning: mod multipliers
  modx: {
    supersize: 1.6,   // x: SUPERSIZE (every layer pays this many times more)
    skimmer: [1.2, 1.3, 1.4],   // x list: SKIMMER (every payout is multiplied by this, by rarity step)
    fastpay: 1.35,   // x: FASTPAY (a layer you beat within 3 seconds pays this many times more)
    onbeat: 1.5,   // x: ON BEAT (a real pick on the beat of the music pays this many times more)
    letitride: 2,   // x: LET IT RIDE (a perfect's pay bets on the next layer: another perfect pays the bet back this many times)
    coinMax: 5,   // x: COIN FLIP: top streak (each win raises the streak multiplier by 1, up to this)
    quantum: 0.75,   // x: QUANTUM (every layer has two real nodes, but pays only this much)
    overclockCut: 0.2,   // %: OVERCLOCK (each ICE the late clock purges cuts that layer's pay by this)
    priority: 2,   // count: PRIORITY (a loot node delivers its loot this many times)
    stash: [0.4, 0.6, 1],   // % list: STASH (the chance a loot roll is gear, by rarity step (the first is the normal chance))
    cachekey: [1, 2, 3],   // count list: CACHEKEY (extra loot rolls in every data cache, by rarity step)
  },
  // ---- Earning: selling gear
  gear: {
    sellPct: 0.5,   // %: gear resale (normal gear sells at a market for this share of its price)
    duds: 0.5,   // earn: DUDS (scrap) (what one DUDS sells for)
    sim: 1.5,   // earn: SIM (common) (what one SIM sells for)
    shard: 4,   // earn: SHARD (rare) (what one SHARD sells for)
    bond: 4,   // earn: BOND (rare) (what a BOND sells for, times the sector you are in (1, 2, 3...))
    chrome: 10,   // earn: CHROME (epic) (what one CHROME sells for)
    wallet: 25,   // earn: WALLET (legend) (what one WALLET sells for)
  },
  // ---- Gear: how often each shows up
  drop: {
    scrap: 1,   // x: scrap gear (PATCH, PURGE, SHOE)
    common: 1,   // x: common gear (FWALL, SPLIT, SHAKE, FRAG, REWIND)
    rare: 0.7,   // x: rare gear (ROUTE, WARP, TUNNEL, TILT)
    epic: 0.4,   // x: epic gear (ALL-IN, MESH, PASS)
    duds: 1,   // x: DUDS (its weight)
    sim: 0.7,   // x: SIM (its weight)
    shard: 0.5,   // x: SHARD (its weight)
    bond: 0.4,   // x: BOND (its weight)
    chrome: 0.15,   // x: CHROME (its weight)
    wallet: 0.05,   // x: WALLET (its weight)
  },
  // ---- Spending: markets
  tierPrice: [1, 1.6, 2.5, 4],   // x list: price by rarity step (a mod or item at its 1st / 2nd / 3rd / 4th rarity step costs its price times this (only FRAG has a 4th))
  haggle: [0.25, 0.35, 0.5],   // % list: HAGGLE (market prices are this much lower, by rarity step)
  repair: 2,   // spend: repair (a market repair costs this for each integrity point)
  reroll: 1.5,   // spend: market reroll (new offers at a market: costs this, and this much more each time in the same market (1 a market, RESTOCK on THE BOARD adds up to 2))
  stock: {
    scrap: 0.5,   // %: more copies: scrap gear (a market gear offer can come with more than one copy: the chance of each extra copy, by its rarity...)
    common: 0.35,   // %: more copies: common gear
    rare: 0.2,   // %: more copies: rare gear
    epic: 0.08,   // %: more copies: epic gear
    max: 3,   // count: most copies (...up to this many of one gear)
  },
  // ---- Spending: mods that cost credits
  continue: 10,   // spend: CONTINUE? (keep going after you would die: costs this, and this much more each time you use it)
  bloodHit: {
    base: 4,   // spend: BLOOD MONEY: a hit (with BLOOD MONEY, each point of damage costs this...)
    perSector: 2,   // spend: BLOOD MONEY: more per sector (...plus this for each sector you are in past the first)
  },
  debt: {
    limit: 15,   // spend: LEVERAGE: debt limit (with LEVERAGE, your credits can go this far below 0...)
    limitPerSector: 10,   // spend: LEVERAGE: limit per sector (...plus this much deeper for each sector)
    payment: 0.5,   // spend: LEVERAGE: loan payment (every corp layer takes this payment, in debt or not...)
    paymentPerSector: 0.5,   // spend: LEVERAGE: payment per sector (...plus this for each sector)
    interestPct: 0.1,   // %: LEVERAGE: interest (while in debt, the debt grows by this share every layer...)
    interestMin: 0.2,   // spend: LEVERAGE: least interest (...but at least this)
    shieldPer: 25,   // spend: LEVERAGE: shield per debt (the deeper in debt, the more often ICE does nothing: the odds are your debt / this...)
    shieldMax: 0.6,   // %: LEVERAGE: shield max (...up to this)
  },
  omerta: {
    pct: 0.1,   // %: OMERTA: a hit costs (with OMERTA, an ICE hit costs this share of your credits instead of integrity...)
    min: 1.5,   // spend: OMERTA: at least (...but at least this)
  },
  friendship: 1,   // spend: FRIENDSHIP (once per corp, an ICE hit costs this instead of integrity)
  companion: 0.1,   // spend: COMPANION (the treat your pet takes each time it sniffs out an ICE)
  // ---- Fishing: the PIER
  fish: {
    cast: 0.4,   // spend: a cast (paid each time the hook goes in (reel in empty and it's spent))
    casts: 30,   // count: casts per pier (how many casts one pier allows)
    gear: 0.3,   // %: gear on the line (the chance what bites is gear (from the loot pool))
    shoe: 0.1,   // %: a shoe on the line (the chance what bites is a SHOE)
    odds: [3, 5, 2, 0.6, 0.15],   // count list: fish by rarity (how often each fish rarity bites, as weights (scrap, common, rare, epic, legendary))
    damp: 0.5,   // x: gear: less rare (gear from the water: each rarity step up is this much rarer than normal loot)
    scrap: 0.2,   // earn: fish worth: scrap (what a black market pays for a scrap fish)
    common: 0.4,   // earn: fish worth: common (a common fish)
    rare: 1,   // earn: fish worth: rare (a rare fish)
    epic: 2.5,   // earn: fish worth: epic (an epic fish)
    legendary: 6,   // earn: fish worth: legendary (a legendary fish)
  },
  // ---- Spending: the uplink
  uplink: {
    min: 5,   // spend: minimum (everyone pays this to push on, mods or not)
    scrap: 2,   // spend: a scrap mod (to carry one scrap mod)
    common: 3,   // spend: a common mod (to carry one common mod)
    rare: 5,   // spend: a rare mod (to carry one rare mod)
    epic: 8,   // spend: an epic mod (to carry one epic mod)
    legendary: 12,   // spend: a legendary mod (to carry one legendary mod (every corp mod, and fully upgraded ones))
    exotic: 10,   // spend: an exotic mod (to carry one exotic mod)
    pass: 0.5,   // %: PASS (the PASS gear cuts the whole uplink fee by this)
    sellPct: 0.33,   // %: selling pays back (a mod you sell at the uplink pays back this share of what keeping it would cost)
  },
  // ---- Sector events
  events: {
    fireSale: 0.3,   // %: FIRE SALE (market prices are this much lower in that sector)
    timeCr: 0.1,   // spend: TIME IS MONEY (every second a clock runs in that sector costs this)
  },
  // ---- Spending: corps
  corpCosts: {
    tollgatePick: 0.2,   // spend: TOLLGATE: a pick (every node you tap costs this)
    safeharborPremium: 1,   // spend: SAFEHARBOR: premium (entering takes this insurance premium (if you have it))
    famiglia: 1.5,   // spend: LA FAMIGLIA: protection (paying protection locks one ICE on a layer)
    famigliaBoss: 2.5,   // spend: LA FAMIGLIA: boss protection (the same on the boss layer)
    choirTithe: 1,   // spend: THE CHOIR: tithe (paying the tithe gives you a sign (but loses the faith bonus))
    choirTitheBoss: 2,   // spend: THE CHOIR: boss tithe (the same on the boss layer)
    bidblitz: 1,   // spend: BIDBLITZ: a bid (a bid locks one ICE...)
    bidblitzBoss: 1.5,   // spend: BIDBLITZ: a boss bid (...on the boss layer it starts here...)
    bidblitzStep: 0.5,   // spend: BIDBLITZ: each bid raises it (...and every bid costs this much more than the last)
    mochi: 1,   // spend: MOCHI: an ICE hit (ICE costs this instead of integrity)
    mochiBoss: 2,   // spend: MOCHI: a boss ICE hit (the same on the boss layer)
    bytepetsCall: 0.1,   // spend: BYTEPETS: a call (calling the pets costs this treat)
  },
};

// Credits for u units, earned or spent, at this sector (not rounded: round where the amount is final).
const econSector = () => { try { return (st.run && st.run.sector) || 0; } catch (e) { return 0; } };   // (st doesn't exist yet while files load)
const econUnit = side => ECON[side].unit * (1 + ECON[side].grow * econSector());
const earnCr = u => u * econUnit('earn');
const costCr = u => u * econUnit('spend');
const earnInt = u => Math.round(earnCr(u));
const costInt = u => Math.round(costCr(u));
// Mod and item prices are written at a unit of 10: this scales them.
const priceScale = () => econUnit('spend') / 10;
