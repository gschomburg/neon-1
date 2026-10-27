# NeoN+1 credits: where they come from, where they go (2026-10-26, v13.36)

A first pass at the credit balance (the user: "money feels easy to get and not very powerful").
Numbers are from the code (engine/run.js `payFor`, engine/panels.js, data/mods.js). The per-sector
totals are a model, not play data: they leave out loot nodes, skip rewards and money mods.

## The short version

- **Income grows with depth and, much more, with skill.** A layer pays `4 + 2 x nodes` (the boss x3),
  and a **perfect** multiplies it by `1 + 0.5 x (nodes - 1)`: x2 on a 3-node layer, x4.5 on 8 nodes,
  **x6.5 on 12**. Tells are learnable, so a good player perfects most layers, and their income runs
  3-6x what a struggling player makes.
- **Prices are flat.** A mod costs 30-160cr in sector 1 and the same in sector 3. Items 22-60cr. Repair 20cr.
- **There's little to spend on.** About one market a sector (row 3, if your path goes there): 3 items,
  2-3 mods, sometimes an exotic, and repair. Buying *everything* there is roughly 350-500cr, and your
  belt and mod slots cap what you can hold anyway.
- So past sector 1, a decent player earns ~1,200-2,700cr a sector against a few hundred they can spend.
  **Money piles up and stops mattering.** That's the feel the user described.

## Sources

| Source | Amount | Notes |
|---|---|---|
| **Layer pay** | `4 + 2n` (n = nodes), boss x3 | the main income; 1-node layers (public net) pay 0 |
| **Perfect multiplier** | x `1 + 0.5(n - 1)` | x2 at 3 nodes, x3.5 at 6, x4.5 at 8, x6.5 at 12 (the biggest lever by far) |
| Corp pay | x1 for most corps; 0.7-1.6 for 7 corps; OMNI x2 | `def.pay`; CHRONOS +0.2 at LV2+ |
| Sector boss (a corp) | x1.5 | `stageBoss` |
| Loot node ($ ICE) | 12 + 8 x tier + 0-12cr, or an item (40%) | costs 1 integrity; ~30% of layers with 4+ nodes |
| Data cache | one loot roll at tier 2 (~28-40cr or an item), more with CACHEKEY | a map stop |
| Skip a reward | starter +15, boss +20, sector boss +40 | the "take credits instead" option |
| RIVAL beaten | bonus | corp modifier |
| Money mods | see below | |

### Corp pay by level (all 5 layers, pay x1)

| Level | Nodes per layer | No perfects | All perfects | Boss alone (none / perfect) |
|---|---|---|---|---|
| 1 | 2,3,4,5,6 | 92 | 272 | 48 / 168 |
| 2 | 3,4,5,6,7 | 106 | 364 | 54 / 216 |
| 3 | 4,5,6,7,8 | 120 | 470 | 60 / 270 |
| 4 | 5,6,7,8,9 | 134 | 590 | 66 / 330 |
| 5 | 6,7,8,9,10 | 148 | 724 | 72 / 396 |
| 6 | 7,8,9,10,11 | 162 | 872 | 78 / 468 |
| OMNI (x2), LV3 | 4..8 | 240 | 940 | |

Without perfects, a corp's pay barely grows with depth (+14 a level). With perfects it grows ~+100 a level.

### A sector (3 corps + OMNI, by how often you perfect)

| Sector | 0% perfect | 50% | 90% |
|---|---|---|---|
| 1 | 530 | 1,189 | 1,716 |
| 2 | 600 | 1,489 | 2,200 |
| 3 | 670 | 1,824 | 2,747 |

## Sinks

| Sink | Price | Notes |
|---|---|---|
| Market: items (3 offered) | PATCH 25, PURGE 22, FWALL 30, SPLIT 34, ROUTE 45, WARP 50, ALL-IN 60 | x1 / x1.6 / x2.5 by rarity step (`TIER_PRICE`) |
| Market: mods (2-3 offered) | minor 30-35, general 55-90 | same rarity step; HAGGLE -25/35/50% |
| Market: exotic (sometimes) | 90-160 | LEVERAGE 90 ... ICE EATER 160 |
| Market: repair | 20 per integrity | the only repeatable buy |
| CONTINUE? | 100, +100 each use | corp mod |
| LEVERAGE loan payment | 5 per layer, +5 a sector, plus 10% interest on debt | exotic |
| BLOOD MONEY hits | 20 per hit, +10 a sector | exotic (hits cost credits instead of integrity) |
| Corp costs | TOLLGATE -2 per pick, SAFEHARBOR premium (up to 10), FAMIGLIA protection, CHOIR tithe, BIDBLITZ bids, MOCHI shields, BYTEPETS calls, HALFLIFE dose, OMERTA 10% per hit | each a corp's own twist |
| Safehouse | free (+2 integrity and a minor mod pick) | a stop, no cost |

**Spending room:** about one market a sector, ~350-500cr if you bought everything. Belt and mod slots
cap it further. Nothing gets more expensive as you go.

## Money mods (income)

| Mod | Effect | Size |
|---|---|---|
| SUPERSIZE (corp) | every layer x2 | huge, stacks with perfects |
| COIN FLIP (exotic) | streak multiplier up to x5 | huge with skill |
| SKIMMER (general) | +25 / 50 / 75% on every payout | big, and cheap (60cr) |
| FASTPAY, ON BEAT (corp) | x1.5 on a layer when you're quick / on the beat | big |
| LET IT RIDE (corp) | a perfect's pay rides to the next: double or lose | swingy |
| POLICY (corp) | +8 per ICE hit | flat |
| INTEREST (corp) | 5% of your credits per corp (max 20) | small |
| EZPASS (corp) | +2 per layer | small |
| CHANCE CARD, HONEYCOMB, GRAVE ROBBER, PRIORITY | small extras | |
| BLOOD MONEY (exotic) | +100 now, heals pay 15 | |
| QUANTUM (exotic) | layers pay half | a cost |
| OVERCLOCK (corp) | purges cut pay 20% each | a cost |

(The user's earlier note: POLICY, SUPERSIZE, EZPASS, LEVERAGE's payment and BLOOD MONEY feel too strong.)

## How we could approach it

1. **Decide what money should feel like.** My suggestion: "always a little short". At a market you
   can afford about one good thing and have to choose. Maybe a target like "a solid player arrives at
   each market with ~60-80% of what the stuff there costs".
2. **Get the real numbers.** The play stats (v13.16) already log `run_end` (credits left, earned) and
   `buy` events. **Credits left unspent when a run ends** is the clearest sign of the problem. We could
   pull those from greglytics and look at earned and left over per sector.
3. **Build a sim.** A headless bot that plays whole runs at a few skill levels (perfect rates) with a simple
   shopping policy, and prints credits per sector. It's the playtest harness plus a market policy. Then
   every change gets checked against the same seeds.
4. **Pick levers.** Some options, roughly from most to least effect:
   - **Tame the perfect multiplier.** Make it flat (x1.5 or x2) or grow slower (+0.25 a node), or cap it.
     It's the main reason good players drown in money. Perfects still heal, which keeps them worth it.
   - **Prices that grow by sector** (inflation: +25-50% a sector), so deeper markets keep pace.
   - **More to spend on**, especially things you buy more than once:
     - reroll a market's stock
     - upgrade a mod you own to its next rarity step
     - buy a corp mod you've seen
     - buy an extra belt or mod slot
     - pay to scout a corp's tell, or to peek at a layer
   - **Money that counts at the end.** Credits left could turn into REP or score when you cash out (today
     REP gets `earned / 40`), so saving is a real choice rather than waste.
   - **Trim the money mods** that stack multipliers (SUPERSIZE, COIN FLIP, SKIMMER at legendary) once the
     base is settled.
5. **Order:** settle the target feel (1), then base pay and prices (the multiplier, inflation), then
   sinks, then the mods last, since they multiply whatever the base is.

## The user's directions (2026-10-26)

- **Yes: pay to reroll a market.** Limited (a few a market, or a run), with a REP unlock at THE BOARD for more.
- **Yes: prices rise with depth** (by sector).
- **Yes: more things to pay for,** like a toll to go to some corps.
- **Watch BLOOD MONEY:** with this much income, a hit costing 20cr (+10 a sector) makes it near immortal.
- **Not now: paying to upgrade a mod** (less interesting).
- **Open:** the perfect multiplier, the target feel, the sim.

## The sim: baseline (2026-10-26, v13.37)

`node tools/econsim.js` plays whole runs in headless Chrome: 5 seeds x 3 skill levels (how often it finds the real
node first try: 0%, 50%, 90%), 3 sectors, god mode (it never dies), no ads. It goes to every market it can reach,
buys repair when hurt then the priciest things it has room for, and takes the first mod it has room for on reward
screens (else the credits). `save <name>` keeps the numbers (tools/check/econ-<name>.json), `diff <a> <b>` compares.
This baseline: `econ-baseline.json`. About 4-5 minutes.

Averages per sector (credits):

| Skill | Sector | Earned | At the market (had / its whole stock / spent) | Holding at the end |
|---|---|---|---|---|
| 0% | 1 | 792 | 267 / 293 / 138 | 647 |
| 0% | 2 | 1,066 | 907 / 256 / 124 | 1,587 |
| 0% | 3 | 1,966 | (no market reached) | 3,553 |
| 50% | 1 | 1,817 | 339 / 264 / 217 | 1,600 |
| 50% | 2 | 2,258 | 2,022 / 261 / 122 | 3,731 |
| 50% | 3 | 3,692 | 5,489 / 283 / 33 | 7,390 |
| 90% | 1 | 2,134 | 596 / 291 / 174 | 1,959 |
| 90% | 2 | 2,152 | 3,004 / 301 / 112 | 3,999 |
| 90% | 3 | 3,570 | 3,253 / 245 / 42 | 7,527 |

**What it says:**

- **Sector 1 is about right.** You reach the first market with roughly what its stock costs (267-596 vs ~290).
- **After that it runs away.** By sector 2 you arrive with 3-10x the stock; by the end of sector 3 you hold
  3,500-7,500cr. Even the bot that never perfects ends rich.
- **Spending is capped by room, not credits.** Spent per market falls from ~140-220 to ~30-120: the mod and item
  slots fill, so there's nothing left to buy. A market's whole stock is ~250-300cr and it doesn't grow.
- **Income is higher than the formula alone** (e.g. 0% skill, sector 3: 1,966 earned vs ~670 from base pay):
  the mods the bot picks up multiply pay (SKIMMER and friends), and more corps per sector than the model assumed.
- **50% and 90% skill end about the same.** Most of the money comes from the big perfect multipliers on deep layers,
  and both reach them.
- About 95% of income is layer pay; loot nodes, caches and skip rewards are small.
- Markets are reached less than once a sector (0.4-1.2); in sector 3 the bot often had none on its path.

So the levers that matter most: what pays per layer deeper in (the perfect multiplier, mod multipliers), and sinks
that aren't limited by slot room (rerolls, tolls, repair, prices that rise).

## The sim: what-ifs (2026-10-26)

`WHATIF=... node tools/econsim.js` changes the game inside the sim's page only. Credits held at the end of sector 3
(and earned in sector 3), averaged over 5 seeds:

| Skill | Today | Perfects a flat x2 (`flat2`) | Prices +35% a sector (`inflate35`) | Both |
|---|---|---|---|---|
| 0% | 3,553 (1,966) | 2,986 (1,612) | 3,514 | 2,939 |
| 50% | 7,390 (3,692) | 4,043 (1,990) | 7,324 | 3,976 |
| 90% | 7,527 (3,570) | 3,695 (1,699) | 7,457 | 3,626 |

- **A flat x2 for perfects cuts holdings about in half** for anyone who perfects (and income ~45%). It's the biggest
  single lever, and it closes most of the gap between 50% and 90% skill and the rest.
- **Inflation alone does almost nothing** (-1%): the bot isn't short of credits at the market, it's out of room. A
  pricier stock it can't fit doesn't drain anything. (Stock went 260 -> 350 -> 480 a market, spending barely moved.)
- **Even with both, a player holds ~3,000-4,000cr by sector 3** against markets that sell ~300-480cr and are reached
  less than once a sector. Income is still 3-5x what there is to spend.
- So the next lever has to be **spending that doesn't need room**: a toll to enter corps, rerolls, repair, or a
  steady cost (the user's toll idea fits: it hits every corp, not just markets). Or lower base pay.

## The sim: tolls, base pay, and a fee to push on (2026-10-26)

All on top of `flat2` (perfects a flat x2). Credits at the end of sector 3, by skill (0 / 50 / 90%):

| What-if | Sector 3 end | Notes |
|---|---|---|
| flat2 only | 2,986 / 4,043 / 3,695 | |
| + every corp tolls 10 x level (`toll10`) | 2,598 / 3,695 / 3,329 | ~75-180cr a sector (~10% of income); short only in sector 1's first corps |
| + GATED: a third of corps 20 x level, pay x1.5 (`gated`) | 3,194 / 4,302 / 3,995 | the x1.5 outweighs the fee: a choice, not a drain |
| + base pay 2 + 2n (`base2`) | 2,623 / 3,566 / 3,264 | -12% |

**A fee to push on to the next sector** (the user's idea): paid on the "root access" screen. Credits carried into
sector 3 (after the 2nd checkpoint), and how often it's short:

| Fee | Carried into sector 3 | Short |
|---|---|---|
| 500 x the sector you leave (`stagefee500`) | 175 / 780 / 767 | 0% skill: 4 of 5 runs can't pay the 2nd (1,000) |
| half your credits (`stagefee50pct`) | 540 / 825 / 768 | never |
| 50 per mod held x sector (`stagemod50`) | 561 / 1,296 / 1,282 | would drop 0.4-1 mod at the 2nd |
| **100 per mod held x sector (`stagemod100`)** | **230 / 606 / 599** | would drop ~1 mod (2.4 for 0% skill) |

- A checkpoint fee is the first lever that **caps what you carry into the next sector** (~200-800cr: a market or two).
- A fixed fee acts as a skill gate (can't pay: cash out). Half-your-credits never pinches, so it's no decision. **Per mod**
  makes it a decision about your build: short, and you drop a mod (the user's variation). Mods cap at 6 slots, so the fee
  caps too (600 at the 1st, 1,200 at the 2nd).
- Claude's pick so far: **flat2 + 100 per mod x sector at each checkpoint, drop mods if short.**

## The sim: THE UPLINK (v13.40, 2026-10-26)

The checkpoint as built (fee per mod by rarity + a minimum, x the sector you leave; the bot keeps what it can pay for,
sells its cheapest mods when short). Held at each uplink -> its bill, mods sold; credits at the end of sector 3:

| Skill | Today's pay + uplink: uplink 1 / uplink 2 / sector 3 end | Flat x2 perfects + uplink |
|---|---|---|
| 0% | 639 -> 452 / 1,096 -> 992 (sells 1.4) / 1,651 | 611 -> 416 / 900 -> 828 (sells 2.4) / 1,814 |
| 50% | 1,584 -> 444 / 3,287 -> 992 (sells 0.8) / 5,976 | 876 -> 428 / 1,656 -> 952 (sells 1.0) / 2,857 |
| 90% | 1,951 -> 428 / 3,560 -> 896 (sells 1.0) / 6,830 | 1,015 -> 396 / 1,631 -> 896 (sells 1.0) / 2,745 |

- **On today's pay the uplink alone isn't enough:** good players clear the bill easily and still end sector 3 with
  6,000-6,800 (from ~7,500). It bites the weakest bot (sells ~1.4 mods at the 2nd).
- **With flat x2 perfects it does what we wanted:** everyone pays real money at each checkpoint, carries ~200-800cr into
  the next sector, and usually sells about one mod at the 2nd uplink. Nobody was forced to cash out.
- The bill is ~400-450 at the 1st and ~900-1,000 at the 2nd (6 mods). The sector 3 pile (~2,750) is what the 3rd would take.

## More money ideas (the user, meat notes 2026-10-26)

- **THROTTLE:** a mod that makes the uplink bandwidth cheaper (or HAGGLE's legendary step does it).
- **Items as a store of value:** items could be worth more: sell them at black markets, and they cost nothing at the
  uplink (only mods do). Carry value through the checkpoint as items.
- **TIME IS MONEY:** a corp's clock drains your credits as it runs; maybe an event for a whole stage.
