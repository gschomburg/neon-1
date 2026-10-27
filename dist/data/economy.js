// NeoN+1 data/economy.js: every money number in the game, in one place (the user's credit scale, 2026-10-26).
// The neon editor's ECONOMY tab edits this file (tools/economy_file.js writes it; the notes come from there).
//
// Two units: EARN (everything that pays you) and SPEND (everything that costs you). A number marked earn / spend is a
// count of that side's units: repair 2 = 2 x the spend unit = 20cr. Change a unit and that whole side moves; change
// one number and only that thing moves. Each side can grow every sector (0.35 = +35% a sector). Numbers marked x are
// multipliers, % are shares (0.05 = 5%), cr are credits. Mod and item prices stay with the mods (data/mods.js), at a
// unit of 10, scaled by the spend unit.
'use strict';
NEON_FILES.push(['data/economy.js', 'v13.42']);

const ECON = {
  // ---- Units
  earn: {
    unit: 10,   // cr: earn unit (credits per earn unit)
    grow: 0,   // grow: earn growth (everything you earn grows this much a sector (0.35 = +35%))
  },
  spend: {
    unit: 10,   // cr: spend unit (credits per spend unit)
    grow: 0,   // grow: spend growth (everything you spend grows this much a sector)
  },
  // ---- Earning: layer pay
  pay: {
    base: 0.4,   // earn: base (every layer)
    perNode: 0.2,   // earn: per node (x the nodes on the layer)
    boss: 3,   // x: boss layer (the boss pays this many times more)
    stageBoss: 1.5,   // x: sector boss corp (a corp that is the sector boss)
    perfect: 2,   // x: perfect (a perfect pays x(this + per node x (nodes - 1)))
    perfectPerNode: 0,   // x: perfect, per node (the old curve was perfect 1, per node 0.5 (x2 on 3 nodes up to x6.5 on 12); flat x2 since v13.41)
  },
  // ---- Earning: loot, rewards
  loot: {
    base: 1.2,   // earn: loot: base (a loot node, or a data cache roll)
    perTier: 0.8,   // earn: loot: per level (x the corp level (caches roll at 2))
    roll: 1.2,   // earn: loot: random (plus up to this)
    itemChance: 0.4,   // %: loot: an item instead (the chance a loot roll is an item (STASH raises it))
  },
  skip: {
    starter: 1.5,   // earn: skip: starter perk ("take credits instead")
    boss: 2,   // earn: skip: boss reward
    sector: 4,   // earn: skip: sector boss reward
  },
  rival: {
    flatlined: 3,   // earn: RIVAL: flatlined (you knocked the rival out)
    beat: 1.5,   // earn: RIVAL: beat clean (it stole nothing)
  },
  // ---- Earning: mods
  mods: {
    ezpass: 0.2,   // earn: EZPASS (every layer)
    policy: 0.8,   // earn: POLICY (every ICE hit)
    graverobber: 0.2,   // earn: GRAVE ROBBER (per untouched ICE)
    honeycomb: 1,   // earn: HONEYCOMB (a drop at full integrity)
    interestPct: 0.05,   // %: INTEREST (of your credits, per corp...)
    interestMax: 2,   // earn: INTEREST: cap (...up to this)
    chancecard: 1,   // earn: CHANCE CARD (the credits card)
    coinCr: 1,   // earn: COIN FLIP: $ face (x the streak multiplier)
    coinBigCr: 2.5,   // earn: COIN FLIP: big $ face
    ramDoublerSell: 0.5,   // %: RAM DOUBLER: sells items for (of their price)
  },
  blood: {
    bonus: 10,   // earn: BLOOD MONEY: when you take it
    heal: 1.5,   // earn: BLOOD MONEY: per heal (healing pays this instead)
  },
  corps: {
    safeharborClaim: 0.5,   // earn: SAFEHARBOR: claim (an ICE hit pays this)
    chuckecacheTicket: 1.5,   // x: CHUCK E. CACHE: per ticket (credits per ticket at the prize counter)
  },
  // ---- Spending: markets
  tierPrice: [1, 1.6, 2.5],   // x: price by rarity step (x a mod / item price at each rarity step)
  repair: 2,   // spend: repair (per integrity, at a market)
  // ---- Spending: mods
  continue: 10,   // spend: CONTINUE? (the first time; this again more each time after)
  bloodHit: {
    base: 2,   // spend: BLOOD MONEY: a hit (per point of damage...)
    perSector: 1,   // spend: BLOOD MONEY: per sector (...plus this x the sector)
  },
  debt: {
    limit: 15,   // spend: LEVERAGE: debt limit (how far below 0...)
    limitPerSector: 10,   // spend: LEVERAGE: limit per sector (...plus this x the sector)
    payment: 0.5,   // spend: LEVERAGE: loan payment (every corp layer...)
    paymentPerSector: 0.5,   // spend: LEVERAGE: payment per sector (...plus this x the sector)
    interestPct: 0.1,   // %: LEVERAGE: interest (debt grows this much a layer...)
    interestMin: 0.2,   // spend: LEVERAGE: least interest (...at least this)
    shieldPer: 25,   // spend: LEVERAGE: shield per (ICE does nothing with odds debt / this...)
    shieldMax: 0.6,   // %: LEVERAGE: shield max (...up to this)
  },
  omerta: {
    pct: 0.1,   // %: OMERTA: a hit costs (of your credits...)
    min: 1.5,   // spend: OMERTA: at least
  },
  friendship: 1,   // spend: FRIENDSHIP (the hit it takes instead)
  companion: 0.1,   // spend: COMPANION (the treat)
  // ---- Spending: the uplink
  uplink: {
    min: 5,   // spend: minimum (everyone pays this)
    scrap: 2,   // spend: a scrap mod
    common: 3,   // spend: a common mod
    rare: 5,   // spend: a rare mod
    epic: 8,   // spend: an epic mod
    legendary: 12,   // spend: a legendary mod (corp mods, and fully upgraded ones)
    exotic: 10,   // spend: an exotic mod
    sellPct: 0.33,   // %: selling pays back (of that mod's fee)
  },
  // ---- Spending: corps
  corpCosts: {
    tollgatePick: 0.2,   // spend: TOLLGATE: a pick
    safeharborPremium: 1,   // spend: SAFEHARBOR: premium (when you enter (up to))
    famiglia: 1.5,   // spend: LA FAMIGLIA: protection
    famigliaBoss: 2.5,   // spend: LA FAMIGLIA: boss protection
    choirTithe: 1,   // spend: THE CHOIR: tithe
    choirTitheBoss: 2,   // spend: THE CHOIR: boss tithe
    bidblitz: 1,   // spend: BIDBLITZ: a bid
    bidblitzBoss: 1.5,   // spend: BIDBLITZ: a boss bid
    bidblitzStep: 0.5,   // spend: BIDBLITZ: each bid raises it
    mochi: 1,   // spend: MOCHI: an ICE hit
    mochiBoss: 2,   // spend: MOCHI: a boss ICE hit
    bytepetsCall: 0.1,   // spend: BYTEPETS: a call
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
