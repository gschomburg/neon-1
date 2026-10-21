# Beta Runner: content reference (v08)

All corps, tells, mods and items, with their in-game text and the rules and numbers behind them.
Written from the v08 code (`v08/beta_runner_v08.html`). The code is the source of truth; if this
drifts, regenerate it from the `CONFIG`, `CORPS`, `CORP_TELL`, `MODS` and `ITEMS` tables and
`genLayer` / `startCorp` / `enterLayer`.

Contents: [Run shape](#run-shape) · [Corps](#corps) · [How tells work](#how-tells-work) · [Difficulty ranking](#difficulty-ranking-tell-odds) ·
[Mods](#mods) · [Items](#items) · [Where things come from](#where-things-come-from) · [Tiers](#tiers-and-upgrades) ·
[Payouts](#payouts) · [Numbers](#numbers-config)

---

## Run shape

- **The map is endless, in sectors.** Each sector has 6 steps, bottom to top: its start, steps 1 to
  4 with 3 nodes each, and its own OMNI//CORE at the top. Sector 1 starts at the PUBLIC NET; every
  later sector starts at the OMNI you just beat. Beating OMNI = **sector clear**: cash out (bank REP,
  the run ends) or push on.
  - Step 1: three corps (later sectors: two corps + a market or safehouse, 50/50)
  - Step 2: two corps + a cache or safehouse (50/50)
  - Step 3: two corps + the black market
  - Step 4: two corps + a cache or safehouse (50/50)
  - Corps are shuffled per step, so each step's corps are different from each other.
  - Links: each node always links straight up; each diagonal-up link has a 45% chance. **Sideways
    links** (25% per neighbor pair, both ways) let you take a second stop in a step. Visited stops
    can't be entered again.
- **Tiers:** in sector *s* (1 = first), corps on steps 1-2 are **tier s**, steps 3-4 **tier s+1**,
  OMNI **tier s+2**.
- **A corp visit = 4 layers + a boss.** Layer *i* (1-5) has `tier + i` nodes, capped at 12:

  | Tier | L1 | L2 | L3 | L4 | Boss |
  |---|---|---|---|---|---|
  | 1 | 2 | 3 | 4 | 5 | 6 |
  | 2 | 3 | 4 | 5 | 6 | 7 |
  | 3 (OMNI, sector 1) | 4 | 5 | 6 | 7 | 8 |
  | 4+ | ... up to 12 | | | | |
  | PUBLIC NET | 1 (always real) | | | | |

- **Sector heat:** each sector after the first, tells are followed 4% less often (75% → 55% floor)
  and corp clocks are 1s shorter (6s floor). OMNI borrows a new random tell each sector.
- **Grid:** 4x4 (12 nodes fits by design). Nodes are placed in random cells.
- **Integrity:** start with 4 (+ HARDENED). An ICE hit costs 1 (2 on the OMNI boss). A **perfect**
  (first try, layers with 2+ nodes) heals 1 and pays more.

---

## Corps

Each corp has a **tell**, a hint about where the real node is. Most tells are followed **75% of
the time** (`tellStrength`); SIGIL's is always followed. The boss usually changes the tell.
The codex only shows a corp's tell after you've beaten it.

### [P] PERIMETER SYS
- **Map quote:** "our corners never fall."
- **Boss line:** boss: the core hides inward.
- **Codex tell:** the real node is usually in a corner. deeper: on any edge. boss: the center.
- **What it does:**
  - **Tier 1 layers:** 75% of the time the real node is on a **corner cell** of the grid. If no node
    happens to sit on a corner, one node is moved to a free corner first.
  - **Tier 2 layers:** 75% of the time it's on **any edge cell** (12 of 16 on a 4x4), a much weaker hint.
  - **Boss:** 75% of the time the real node is in the **center** (any cell not on the grid's edge;
    on a 4x4 that's the middle 2x2).
- **Boss mods:** CORNERS, BULWARK
- **Odds feel:** on a 4x4, corners are 4 of 16 cells, so "pick a corner" is a strong play,
  but 1 time in 4 it's anywhere.

### [S] SIGIL DYNAMICS
- **Map quote:** "we sign everything we make."
- **Boss line:** boss: the signature fades fast.
- **Codex tell:** the real node always wears the signature, and so do some decoys. the boss signature fades.
- **What it does:**
  - **Always (100%):** the real node wears the **Sigil signature** glyph. **Decoys** wear it too:
    about 40% of the other nodes (rounded, at least 1). So the tell narrows it down; it doesn't solve it.
  - **The signature changes by tier:**
    - Tier 1: one specific glyph (picked per visit) is the signature. Other nodes never get that glyph.
    - Tier 2: always an **X shape**, drawn with **one repeated character** per node (`# # / # / # #` on one, `% % / % / % %` on another). Other glyphs are never X-shaped.
    - Tier 3 (when OMNI borrows it): random **x / X** characters in a random arrangement. Other glyphs never contain x.
  - **Boss:** same rule, but the glyphs are only visible for about 2.25s (0.45s + `maskDelayMs` 1.8s),
    then they turn into `???`. Memorize fast.
- **Boss mods:** SIGSCAN, FORGERY
- **Loaded ($) nodes** are never picked from signed nodes.

### [C] CHRONOS
- **Map quote:** "time is money. yours is short."
- **Rules line (map):** `10s clock per pick. pays x1.6` (tier 2: `8s`, `x1.8`)
- **Boss line:** boss: clock shrinks every miss.
- **Codex tell:** no tell. just the clock. it pays more for the pressure.
- **What it does:**
  - **No position tell.** The real node is uniformly random.
  - **Clock on every pick:** 10s at tier 1, 8s at tier 2. It resets after each pick. If it runs out,
    a random still-possible node is picked for you.
  - **Pays more:** x1.6 at tier 1, x1.8 at tier 2.
  - **Boss:** the clock gets **3s shorter for every miss** in the boss layer (minimum 3s).
- **Boss mods:** OVERCLOCK, FASTPAY
- **Music:** OVERDRIVE speeds up as the clock runs down.

### [M] MIRRORLINE
- **Map quote:** "every step echoes the last."
- **Boss line:** boss: the echo turns over.
- **Codex tell:** the real node mirrors the last one. deeper: top-bottom. the boss: through the center.
- **What it does** (based on where the real node was in the **previous layer of the same corp**):
  - **Layer 1 of a visit:** no previous layer, so no tell (random).
  - **Tier 1:** 75% of the time the real node is at the **left-right mirror** of the last one (same row, column flipped).
  - **Tier 2:** **top-bottom mirror** (same column, row flipped).
  - **Boss:** **point mirror through the center** (both flipped).
  - If the mirror cell is empty, a node is moved there first.
  - If the grid size changed and the mirror cell is off the grid, there's no tell for that layer.
- **Boss mods:** SHATTER, AFTERIMAGE

### [!] OMNI//CORE (the final)
- **Map quote:** "you shouldn't be here."
- **Rules line:** `12s clock. tell unknown. pays x2`
- **Boss line:** boss: ICE hits for 2.
- **Codex tell:** borrows one tell from the other corps. which one changes every run.
- **What it does:**
  - **Borrowed tell:** each run, OMNI picks one of **corner** (PERIMETER), **mark** (SIGIL, at its
    tier 3 x-signature) or **mirror** (MIRRORLINE, at its tier 2+ top-bottom version), set by the seed.
    Its corner tell stays corners (it doesn't get PERIMETER's tier-2 edge rule).
    It keeps the same tell for its boss: no center, fade or point twist.
  - **Clock:** 12s per pick (not tier-adjusted).
  - **Pays x2.**
  - **Boss:** ICE hits cost **2 integrity**.
- **No boss mods** (beating it ends the run).

### [>] PUBLIC NET (start)
- **Quote:** "one node. it is real."
- One layer with one node: always real. Then a **starter perk**: pick 1 of 3 minor mods, each at a rolled tier (or skip for +15cr).

---

## How tells work

The engine, in `genLayer`:

1. **Place the nodes:** n nodes go into random grid cells.
2. **Pick the real node:**
   - **Position tells** (corner, edge, center, mirror, vmirror, point): roll against `tellStrength` (75%).
     On a hit, the real node is one of the nodes on a target cell (moving a node onto a free target
     cell if none is there). On a miss, the real node is any node, uniformly.
   - **No tell** (CHRONOS, MIRRORLINE layer 1): any node, uniformly.
3. **Glyphs:**
   - Every node gets a glyph from the 18 motifs, **never two the same in one layer**.
   - With the SIGIL **mark** tell: the real node plus about 40% of the others (at least 1) get the
     signature; the rest get glyphs that can't be mistaken for it.
   - Without the mark tell, **glyphs are pure decoration** (no meaning outside SIGIL).
4. **Loaded ($) nodes:** on non-boss corp layers with **4+ nodes**, 30% of the time one ICE node
   (never real, never signed) becomes a **$ node**. It's always ICE: hitting it costs integrity but
   drops loot (an item 40% of the time, at a rolled tier, if your belt has room; otherwise 20-44cr scaled by tier).

**Weights summary**

| Corp | Tell | Followed | Boss twist |
|---|---|---|---|
| PERIMETER | corner (tier 2: any edge) | 75% | center, 75% |
| SIGIL | signature on real + ~40% of decoys | 100% | signature hides after ~2.25s |
| CHRONOS | none | n/a | clock -3s per miss |
| MIRRORLINE | mirror of last real (L-R, deeper T-B) | 75% | point mirror, 75% |
| OMNI | one of corner / mark / mirror (per run) | as borrowed | ICE hits for 2 |

---

## Difficulty ranking (tell odds)

How much each corp's tell helps **once you know it**: the chance your **first pick** on a layer is
the real node, picking at random among the nodes the tell points to ("knowing"), vs. picking any
node ("blind"). 3000 simulated visits per row, using the game's own layer generator, sector 1
(later sectors follow tells less often). Snapshot: v08, 5-layer corps.

| Rank | Corp | Knowing: L1 / L2 / L3 / L4 / Boss | Avg | Blind avg | Tell advantage |
|---|---|---|---|---|---|
| 1 | CHRONOS t2 | 33% / 25% / 20% / 17% / 14% | 22% | 22% | x1.0 |
| 2 | CHRONOS t1 | 50% / 33% / 25% / 20% / 17% | 29% | 29% | x1.0 |
| 3 | OMNI//CORE (mark) | 50% / 33% / 33% / 33% / 25% | 35% | 18% | x2.0 |
| 4 | PERIMETER SYS t2 | 46% / 34% / 27% / 22% / 54% | 36% | 22% | x1.7 |
| 5 | SIGIL DYNAMICS t2 | 50% / 50% / 33% / 33% / 33% | 40% | 22% | x1.8 |
| 6 | SIGIL DYNAMICS t1 | 50% / 50% / 50% / 33% / 33% | 43% | 29% | x1.5 |
| 7 | OMNI//CORE (corner) | 71% / 65% / 59% / 54% / 47% | 59% | 18% | x3.4 |
| 8 | OMNI//CORE (mirror) | 25% / 81% / 79% / 79% / 79% | 69% | 18% | x3.9 |
| 9 | MIRRORLINE t2 | 33% / 82% / 80% / 79% / 79% | 71% | 22% | x3.2 |
| 10 | PERIMETER SYS t1 | 86% / 77% / 72% / 65% / 59% | 72% | 29% | x2.5 |
| 11 | MIRRORLINE t1 | 50% / 83% / 81% / 80% / 81% | 75% | 29% | x2.6 |

Rank 1 = hardest once you know the tell. Tell advantage = knowing avg / blind avg.

**Reading it**
- **CHRONOS** has no tell, so knowing it doesn't help (x1.0). Its difficulty is the clock, which
  this test doesn't model, and it pays more to make up for it.
- **SIGIL** helps about x1.4-2 because the signature is shared with decoys. It narrows the choice
  without naming the node.
- **PERIMETER tier 1** and **MIRRORLINE** help the most (about x2.3-3.5). With few nodes, the tell often
  points at a single node, and the boss twists don't make it harder (MIRRORLINE's boss is ~80%).
  These are the balance candidates (see the spec backlog). **PERIMETER tier 2** (any edge) dropped to
  about x1.7 in v08, though its center boss is still ~58%.
- **OMNI** depends on which tell it borrowed that run: mark is hard, corner and mirror are easy.

**Regenerate:** `node tools/tell_odds.js` (optional: a game file path, and the number of runs).
It loads the newest `vNN/beta_runner_vNN.html` by default and prints this table as markdown.

---

## Mods

Mods last the whole run. You can hold **6** (taking a new one when full opens a swap: pick one of
yours to replace, nothing back). `tip` is the short tray line, `desc` is the offer text, and some
mods have a longer `codex` text. **BURNER** is tap-to-use and shows as a button in the tray
(`[*BRN]`: bright when usable, red brackets when spent, dim when not now).

Rarity: **COMMON → RARE → EPIC → EXOTIC → BOSS** sets the color, badge animation and how big the
offer pop is. It does not affect how often a mod is offered (offers pick uniformly from the pool),
but **tiered mods roll a tier** when found (see [Tiers](#tiers-and-upgrades)).

### General pool (`gen`): bosses, caches, market

| Mod | Code | Rarity | Price | Tray tip | Description |
|---|---|---|---|---|---|
| TRACER | TRC | EPIC, 2 levels | 70 | hit ICE points to real. (L2: hit ICE: 2 directions.) | ICE you hit points toward the real node: `<` `>` on its sides, `^^^^^` / `vvvvv` top / bottom. L1 the bigger direction (coin flip when even), L2 both. |
| KEYLOGGER | KLG | EPIC, 3 levels | 85 | miss logs a key line. | each ICE you hit turns into lines of the real node's glyph (cyan): L1 one line per miss (top, middle, bottom), L2 two, L3 the whole glyph on the first miss. |
| SNIFFER | SNF | EPIC | 90 | lock 1 ICE each layer. | every layer starts with 1 ICE locked. |
| FAILSAFE | FSF | EPIC | 90 | survive 1 killing hit. | once per run, a hit that would end you leaves you at 1 integrity. Goes dim once used. |
| VIRUS | VRS | EPIC | 80 | hit ICE infects 1 more. | hit ICE: locks one ICE node right next to it (up / down / left / right), shown `INFCT`. |
| SKIMMER | SKM | RARE | 60 | +50% credits. | +50% credits from every payout. |
| BUFFER | BUF | RARE | 65 | +1 max integrity. | +1 max integrity, and heal 1. |
| BURNER | BRN | RARE | 55 | lock 1 ICE, 1x/corp | tap in a layer: lock 1 ICE. once per corp. |
| X-AXIS | XAX | RARE | 60 | row scan finds real. | tap ICE in the real node's **row**: the scan catches it (no damage, layer found, not a perfect). The ICE shows `SCAN`. |
| Y-AXIS | YAX | RARE | 60 | column scan finds real. | the same, for the real node's **column**. |

### Minor pool (`minor`): start perk, safehouse, cache, market. Tiered COMMON / RARE / EPIC

| Mod | Code | Price | COMMON | RARE | EPIC |
|---|---|---|---|---|---|
| STASH | STS | 35 | +1 item slot | +1 slot, loot is an item 60% | +1 slot, loot is always an item (if room) |
| HAGGLE | HGL | 30 | market -25% | -35% | -50% |
| CACHEKEY | KEY | 30 | caches drop loot x2 | x3 | x4 |
| COOLANT | CLT | 30 | +3s on every clock | +5s | +8s |
| SKIPJACK | SKJ | 35 | a perfect: 15% chance to skip the next layer | 25% | 40% |

**SKIPJACK:** when it triggers you choose SKIP (+1 layer of depth, no pay) or PLAY IT. It can skip a
boss (warned: `SKIP BOSS: NO REWARD`); a skipped boss gives no reward (the offers show greyed out),
but the corp counts as breached, and a skipped OMNI still clears the sector. `SKIP_BOSS` in the code
turns boss skips off.

### Corp mods (`corp`, BOSS rarity): only from that corp's boss

| Mod | Code | Corp | Tray tip | Description | Notes |
|---|---|---|---|---|---|
| CORNERS | CNR | PERIMETER | lock 1 corner ICE. | layer start: lock 1 ICE node in a corner. | |
| BULWARK | BLW | PERIMETER | block 1st hit/corp. | the first ICE hit in each corp is blocked. | |
| SIGSCAN | SIG | SIGIL | lock 1 signed ICE. | layer start: lock 1 ICE node wearing the Sigil signature. | only does something where the mark tell is active |
| FORGERY | FRG | SIGIL | $ nodes do no damage. | $ nodes no longer cost integrity. | you still get the $ loot |
| OVERCLOCK | OVC | CHRONOS | late clock purges ICE | adds a 15s clock to every corp layer (corps with a clock keep theirs); at 6s, 4s and 2s left it purges one ICE (max 3 a layer); each purge cuts that layer's pay 20%. | |
| FASTPAY | FST | CHRONOS | speedy picks pay more | find the real node within 3 seconds: that layer pays x1.5. The 3s start when the layer opens and start over after each ICE you hit. | |
| SHATTER | SHT | MIRRORLINE | 1 in 3 ICE: no damage. | every ICE hit has a 1 in 3 chance to shatter: no damage. | checked after BULWARK, before FWALL |
| AFTERIMAGE | AFT | MIRRORLINE | marks last real spot. | marks where the last layer's real node was. | pairs with MIRRORLINE-style thinking anywhere |

Removed in v08: **ECHO** (replaced by SHATTER), **REROUTE** and **WORMHOLE** (now the items ROUTE and WARP).

---

## Items

Single use, on the item belt (4 slots; STASH adds 1). You start with one **PURGE**. The same item at
the same tier **stacks** in one slot with a hex count (`PURGEx3`, up to `xF` = 15). When the belt
has no room or matching stack, buying opens a swap. Tiers show as the rarity color.

| Item | Price | COMMON | RARE | EPIC |
|---|---|---|---|---|
| PATCH | 25 | +1 integrity | +2 | +3 |
| PURGE | 22 | lock out 1 ICE | lock out 2 | lock out 3 |
| FWALL | 30 | block the next ICE hit (use any time, even on the map; shows `FW1`, stacks) | block the next 2 | no hits for the rest of this corp (`FW*`; use in a corp) |
| SPLIT | 34 | rule out the half without the real node | rule out 2/3 of the ICE | leave the real node + 1 ICE |
| ROUTE | 45 | (RARE, one tier) on the map: reshuffle every node ahead | | |
| WARP | 50 | (EXOTIC, one tier) on the map: jump to a random node ahead | | |

Prices are base x the tier (x1 / x1.6 / x2.5); HAGGLE takes its % off (not the market repair).

---

## Where things come from

Offers are picked **uniformly** among what's eligible. Mods you have come back only as **upgrades**
(tiered mods that aren't maxed); other owned mods are never offered.

| Source | What you get |
|---|---|
| PUBLIC NET (start) | pick 1 of **3 minor** mods, or skip +15cr |
| Corp boss (CORP BREACHED) | pick 1 of **3**: one of that corp's 2 boss mods, one **general** mod, and a random third (general or minor), order shuffled; or skip +20cr |
| DATA CACHE `[?]` | loot (item or credits), x2 / x3 / x4 with CACHEKEY; then pick 1 of **2 general/minor** mods, or skip |
| SAFEHOUSE `[+]` | heal 2; then pick 1 of **2 minor** mods |
| BLACK MARKET `[$]` | 3 of the 6 items + 2 general/minor mods (shuffled, each at a rolled tier), plus a repair (+1 integrity, 20cr) |
| $ node (hit it) | loot: an item 40% of the time (60% / always with STASH rare / epic) if there's room, else credits |
| OMNI boss | ends the run (no reward screen) |

### Tiers and upgrades

- **Tier roll** for tiered mods and items when found: COMMON 70%, RARE 25%, EPIC 5% (capped at the
  thing's top tier; TRACER has 2 levels, so L1 70%, L2 30%).
- **Finding a mod you have:** found tier at or below yours = **up one step**; above yours = **jump**
  to it. Never past the top. An upgrade never takes a slot.

| You have | You find | Result |
|---|---|---|
| nothing | any tier | that tier |
| COMMON | COMMON | RARE |
| RARE | COMMON or RARE | EPIC |
| COMMON | EPIC | EPIC |
| top tier | anything | not offered |

Everything is seeded: the same seed gives the same map, layers and offers.

---

## REP and THE BOARD

- **REP earned** = layers + 3 x corps breached + perfects + credits earned / 40 + 10 x sectors cleared.
- **Cash out** (after a sector clear) banks all of it. **Dying banks none** (DEADMAN keeps 25% / 50%).
  Practice runs earn none.
- **THE BOARD** (from the title):

| Unlock | Effect | Cost per level |
|---|---|---|
| HARDENED | +1 starting integrity | 40, 100 |
| SEED MONEY | +25cr at the start per level | 20, 40, 80 |
| FIELD KIT | start with a PATCH | 50 |
| WIDE BELT | +1 item slot | 120 |
| SHORTLIST | the starter perk offers 4 mods | 60 |
| DEADMAN | dying keeps 25% / 50% of the REP | 80, 200 |

---

## Payouts

For a layer with **n** nodes (single-node layers pay 0):

```
base   = 4 + 2n            (x3 on a boss)
mult   = corp pay           (CHRONOS x1.6 / x1.8, OMNI x2, others x1)
       x (1 + 0.5 x (n-1))  if perfect (first try; not when an X-/Y-AXIS scan found it)
       x 1.5                with SKIMMER
       x 1.5                with FASTPAY, if picked within 3s
       x (1 - payCut)       OVERCLOCK purges, -20% each
pay    = round(base x mult)
```

---

## Numbers (CONFIG)

| Setting | Value | Meaning |
|---|---|---|
| startIntegrity | 4 | starting integrity |
| perfectHeal | 1 | integrity a perfect heals |
| tellStrength | 0.75 | how often a position tell is followed |
| markDecoyFrac | 0.4 | share of other nodes that also wear the Sigil signature |
| lootChance | 0.3 | chance a 4+ node, non-boss layer has a $ node |
| beltSlots | 4 | item slots |
| startItems | PURGE | what you start with |
| repairAmount | 2 | safehouse heal |
| maskDelayMs | 1800 | how long the Sigil boss signature stays visible (plus 450ms) |
| overclockClock | 15 | clock OVERCLOCK adds to clockless corps |
| overclockStart / Cut | 6s / 20% | when OVERCLOCK starts purging / pay lost per purge |
| fastpayMs | 3000 | FASTPAY window |
| MOD_SLOTS | 6 | mods you can hold |
| TIER_ODDS | 0.70 / 0.95 | a find is COMMON below 0.70, RARE below 0.95, else EPIC |
| TIER_PRICE | 1 / 1.6 / 2.5 | market price by tier |
| STACK_MAX | 15 (F) | items per stack |
| corpLayers | 5 | layers per corp, boss included |
| maxNodes | 12 | node cap per layer |
| sectorHeat | 0.04 | tell strength lost per sector (floor 0.55) |
| SIDE_LINK | 0.25 | sideways link chance per neighbor pair |
