# EXOTIC mods: concepts

The EXOTIC rarity exists but has **no mods** yet (the only exotic thing is the WARP item). Exotics should
bend the rules of the game, not just give bigger numbers. Several change how a layer works, so each needs
thinking through before it's built. Nothing here is built. *(Claude)* marks my drafts; the rest is the
user's.

Mods for corps that don't exist yet stay with those corp ideas (SPEC §17). Mods that need the fake ads
(free trials, AD BLOCKER, secret ads) stay in [ADS.md](ADS.md) until the ads exist; the user likes AD BLOCKER.

---

## Questions for all exotics

**Decided (the user, 2026-10-22):**
- **Where they come from:** the **sector boss** reward pool (the end of each sector), and mixed into
  **markets and caches**. **CACHEKEY** at its higher tiers also makes exotics drop more often in caches.
- **Always on** once you have one (no on/off toggle).
- **Some mods can't be had together.** Taking one that clashes with a mod you own **warns you that it will
  replace** that mod (like the swap when the bar is full).

*(Claude)* **How to track clashes without comparing every pair: "rule slots".** Each exotic (and any other
mod that changes a rule) names the **rule it rewrites**. Two mods that rewrite the same rule can't be had
together; mods on different rules are fine. So each new mod only needs one tag, not a check against every
other mod. A first set of slots:

| Slot | What it rewrites | Mods |
|---|---|---|
| `goal` | what clears a layer (find the real node vs eat the ICE) | ICE EATER |
| `real` | how many real nodes there are | QUANTUM |
| `tap` | what a tap does (a pick vs a 50/50 call) | COIN FLIP |
| `carry` | what carries between layers | ICE THAT COMES WITH YOU (maybe WORM) |
| `slots` | the tray itself (items vs mods) | the slot trade |
| `health` | what a hit costs you (integrity vs credits / something else) | money for health, ZOMBIE |

(Clash warning text from the slot: "ICE EATER changes how layers are won. it will replace QUANTUM.")

The other half is mods that **still work but act differently** under a rule (X-AXIS under ICE EATER marks
instead of picks). Those don't clash; each such mod gets a line for the rule ("under `goal: eat`: mark the
row"), found by looking at the mods that touch that rule (the finders, the ICE lockers), not at every mod.

Still open:
1. **Levels.** Most mods level up (COMMON to EPIC). Exotics probably don't: one strength, its own thing.
2. **Corp clashes.** A lot of corps have their own tap rules (DEMOLITION, FORM 27B, HYDRA, TELEPHONIX...).
   Each exotic needs a rule for those: it wins, the corp wins, or it switches off inside that corp. (The same
   slots can help: a corp that rewrites `goal`, like DEMOLITION, already matches ICE EATER.)
3. **Multiplayer:** mods aren't in multiplayer yet, so not a worry for now.

---

## ICE EATER (the user's; the favorite)

**Flips the game around: you eat the ICE.** ICE doesn't hurt you anymore. You clear a layer by destroying
every ICE node, and the real node becomes the danger: tap it and it **instantly kills you** (or something
close).

This is DEMOLITION's rule (break all the ICE, not the real one; tapping the real node hurts) turned into a
mod that works in every corp. DEMOLITION's code already does most of it (`corps/demolition.js` `tap`).

*(Claude)* how it plays:
- **Knowing a tell becomes about avoiding the real node** instead of finding it. Same skill, opposite tap.
  Corps you know well become safe; corps you don't become a minefield.
- With 2 nodes it's a coin flip with your life. With 8+ it's a long, tense clear. The **odds get worse as
  you go** (the last tap is always a 1-in-2 if you're guessing), unlike normal play, where they get better.
- Layers take more taps (n-1 instead of ~half), so clock corps (CHRONOS, the clock mods) get much harder.

**Decided (the user, 2026-10-22):**
- **The real node is instant death.** (FAILSAFE can still catch it once: that's what it's for.)
- **Pay per ICE eaten:** what the layer would pay for finding the real node, divided by its ICE count, paid
  bite by bite. Eat all the ICE, get the full layer's pay.
- **Mods that find the real node don't tap it for you.** X-AXIS / Y-AXIS mark the line instead: "it's in this
  row" (and / or column with both), as a warning. The same idea for the other finders (TRACER, KEYLOGGER,
  CORNERS...): they point, they never pick.
- **HYDRA gets a head limit** under ICE EATER, so eating ends.
- **Always on** once you have it (no toggle).

- **The pay split includes the perfect bonus** (every clear you survive counts as perfect), and so does the
  perfect heal (the user: "yes i think").
- **SNIFFER and VIRUS pay** when they eat ICE for you (each bite pays like your own).

**Does integrity still matter?** (the user wondered, if the real node kills you.) *(Claude)*: yes, a bit. Things
that hurt besides tapping ICE: GLACIER's frostbite, AEGIS's breach, HALFLIFE's radiation dose, PLAYBALL's boss
(ball out), CHANCE CARD's -1, and SACRIFICE spends it. So integrity becomes the buffer for **corp hazards**,
and the perfect heal tops it up.
- **The clock (decided, the user, 2026-10-22):** when a layer's clock runs out, the game normally taps a random
  node for you (engine/run.js, "clock ran out"), which under ICE EATER could be the real node. Instead, **a
  timeout costs 1 integrity** (no tap). That gives integrity a job under ICE EATER too.

*(Claude)* still open (small):
- How the warning looks: X-AXIS could tint the row's frames (the scan's `-` line on the empty cells, from
  v12.11) and leave it lit for the layer.
- The other lockers (PURGE, OVERCLOCK, CORNERS, BURNER...): pay like SNIFFER / VIRUS too, probably.
- DEMOLITION already has this rule: ICE EATER does nothing extra there (or its numbers stay on for the boss).
- **Feel:** eating should feel good: a crunch sound, the node crumbling, a little `nom` / chomp glyph.

## Money for health (the user, 2026-10-22; no name yet)

**Already close in the game: OMERTA** (LA FAMIGLIA's boss mod): an ICE hit costs 10% of your credits (at least
15cr) instead of integrity, while you can pay; broke, hits go back to integrity. **FRIENDSHIP** (MOCHI MOCHI)
is the small one: once per corp, a hit costs 10cr. So the money-for-health idea already lives with
LA FAMIGLIA; the new part is going all the way (integrity locked low so there's no fallback, or debt). It
could be OMERTA's exotic big sibling, or replace / upgrade OMERTA. Not tied to a corp yet.

Sets your integrity to 1 (or even 0), and you **use your money (or something else) as your health**. Or it
gives you a big enough bonus that there are ways to **deflect** ICE hits. Rule slot: a new one, `health`
(what you lose when you get hit).

*(Claude)* takes, to react to:
- **Credits are your health.** Integrity is locked at 1 (the bar shows `$`). An ICE hit costs credits instead
  (a set price, or a % of what you have, growing deeper in the run); at 0 credits the next hit kills you, or
  you go **into debt** (ties to the debt idea, SPEC §16f, and LEDGER TRUST). Pay is your healing: every layer you
  clear "heals" you. Spending at the market is spending your life. Names: BLOOD MONEY, PAY TO LIVE,
  CREDIT LINE, INSURED.
- **The deflect version:** integrity drops to 1, but you get a big credit bonus and every ICE hit can be paid
  off ("deflect for 25cr? [ PAY ] [ TAKE IT ]"), a quick choice under pressure. OMERTA and FRIENDSHIP already
  pay instead of bleed, once; this is the whole-run version.
- **Something else as health:** your mods (a hit destroys your last mod: THIEF in reverse), your items (a hit
  eats an item), or time (a hit takes seconds off a run-wide clock).
- Clashes: anything that heals integrity (PATCH, TRIAGE, HONEYCOMB, perfect heals) needs a meaning: it pays
  credits instead? FAILSAFE: catches the killing hit at 0cr.
- With **ICE EATER** (where ICE doesn't hurt) it does little: different slots (`goal` vs `health`), so they're
  allowed together, but this one would be nearly useless. Could be a soft "doesn't combine well" note in the
  warning.

## Zombie (the user, 2026-10-22; *(Claude)* names: FLATLINE, UNDEAD, POSTMORTEM, NECROSIS)

Takes your integrity away: **you're dead**, like a zombie, but it gives you something pretty powerful. Rule
slot: `health` (it rewrites what a hit costs: there's nothing left to lose), so it clashes with money for health.

**The user's design (2026-10-22): rot makes your taps weak.**
- **Rot** is just a number counting up (it replaces the integrity bar). Every layer adds some rot, and every
  ICE you **break** adds rot.
- Finding the real node still moves you to the next layer. ICE doesn't hurt: you're pretty much invincible.
- **The more rot, the weaker your taps:** a node (ICE *or* the real one) takes more taps to break. Low rot: 2
  taps. At ~100 rot: ~20 taps. The weak taps add no rot; only a node actually breaking does.
- **Healing brings rot down** instead of adding integrity (PATCH, TRIAGE, HONEYCOMB, perfect heals...).

*(Claude)* notes on that design:
- **A formula to start from:** taps to break = 1 + rot / 5 (rot 5: 2 taps, rot 50: 11, rot 100: 21). Rot per
  layer +3, per ICE broken +5? To tune.
- **Half-tapped nodes must not tell you what they are.** If a node showed "ICE" or "real" before it breaks, you
  could tap every node once to probe. So a weak tap only shows damage (cracks, a counter like `3/11`), the
  same for ICE and the real node, and nothing more.
- **What ends the run?** Rot never kills you on its own, it just slows you. The pressure comes from **clocks**:
  20 taps a node on a CHRONOS clock is a real threat, and a timeout costs integrity... which you don't have.
  So: a timeout adds a lot of rot, or a **rot cap** (e.g. 150 = you fall apart for good). Or the run only ends
  when you cash out, and rot is how it slowly becomes not worth going on. Needs a pick.
- Corps with their own tap rules (DEMOLITION, FORM 27B, TELEPHONIX, LUCKEEZ...) need a rule: multi-tap applies
  to the final "break" only.
- **Feel:** each weak tap a dull thud and a crack spreading on the node; the break a wet crunch. The HUD:
  `ROT 047` in a sickly green, and your taps visibly weaker (a smaller flash).

*(Claude)* earlier thoughts (before the user's design):

*(Claude)* the design question is **what ends a dead run**, since hits can't kill you anymore:
- **Rot.** A rot meter (the HUD bar turns into `ROT ####------`) that grows every layer, or every ICE you hit;
  full = you're gone for good. ICE hits speed it up instead of costing integrity, so mistakes still matter.
- **Feeding.** Zombies eat: ICE you hit (or eat, with ICE EATER, a natural pair) slows the rot; the real node
  is "brains" and resets it. Clearing layers keeps you going.
- **A countdown:** you have N more corps / layers of unlife (shown big), then the run ends as a cash-out (you
  keep your score), not a death.

*(Claude)* the power (one, or a pick):
- **You see like the dead:** ICE shows faint (a ghost frame) for the first second of every layer.
- **Hits can't hurt:** the obvious one; with rot as the cost it's still balanced.
- **Big pay:** everything pays double; dead runners don't need integrity, they need credits.
- **The corps fear you:** every layer starts with 1 ICE locked (a SNIFFER for free), or bosses lose a node.

*(Claude)* notes:
- Clashes: heals (PATCH, TRIAGE, perfect heals) have nothing to heal: they could slow the rot instead. FAILSAFE
  is pointless (you're already dead): taking ZOMBIE could spend it. CONTINUE? doesn't apply.
- Look: the runner card / logo goes grey or glitched, the HUD says `FLATLINED` where integrity was, maybe a
  zombie take on your palette (washed-out green). The death screen could say "you died. again."
- Pairs: with ICE EATER it's a feeding game. With money for health: same slot, can't have both.

## QUANTUM

Two nodes are real each layer; either one passes. Layers pay half. (The user's "more real nodes" idea is the
same mod; keep one.)

*(Claude)* questions: does the tell point to both (two corners in PERIMETER)? Corps whose tell is about one
spot (MIRRORLINE's mirror, TWINLINK) need a rule for the second real node (it's random, no tell). Is the
second one marked once you find the first, or does the layer just end?

## GHOST

One ICE node per layer shows as see-through (a faint frame) from the start. Simple and readable. *(Claude)*:
might be too plain for EXOTIC (it's a steady SNIFFER); make it rule-bending: **you can tap through** a ghost
node (it never counts as a pick), or ghosts show where last layer's ICE was.

## ALL OR NOTHING (the user's; *(Claude)*: DOUBLE OR NOTHING, ROULETTE)

A chance to clear the whole layer at once, but also a chance it adds ICE instead.

*(Claude)* questions: is it a tap-to-use button (once a layer: pull the lever) or does it fire on its own?
Odds (50/50? better the more ICE is left?). "Adds ICE": new nodes appear (layer gets bigger) or closed nodes
turn more dangerous (hit for 2)? Pay: a cleared-by-roulette layer pays normal or nothing?

## COIN FLIP (the user's; *(Claude)*: 50/50, HEADS)

Every tap becomes a 50/50: tap a node and a small window opens with 2 options; pick one. Maybe double damage
on a wrong answer.

*(Claude)* questions: what are the 2 options? (a) the tapped node vs one other node, one of them real if
either is: "heads or tails"; (b) "real / ICE": you call it before it opens. Does the window pause the clock?
(the user: maybe not, keep the pressure). Why take it: it should beat your normal odds (with 6 nodes, a 50/50
is a gift), and the cost is double damage when wrong.

## ICE THAT COMES WITH YOU (the user's; time travel / procrastination)

A 50% chance that ICE you hit carries over and adds to the next layer's ICE count, maybe in the same spot,
looking a little different. Name: *(Claude)* LATER, BACKLOG, SNOOZE (not DEJA VU: that's GROUNDHOG's mod).

*(Claude)* the question is **why anyone takes it**: as written it's only a downside. Make it a trade: carried
ICE is marked (you know where it is, it's free information), or the layer pays more per carried ICE, or the
ICE you carry stays *dead* (locked) so the next layer is bigger but partly solved.

## Names only: effects to work out

*(Claude)* first drafts, to react to:
- **WORM:** a node you hit "worms" through: next layer, the node in the same spot is shown as real or ICE
  from the start. Or: your hits tunnel, and every 3rd ICE you hit opens a row.
- **LOGIC BOMB:** set a trap: tap a node to plant the bomb; next layer, if the real node lands on that spot,
  the layer passes at once (a bet on position). Or: a delayed blast, 3 taps later the bomb locks all ICE in
  its row.
- **FORK BOMB:** each ICE you hit forks: it locks 2 more ICE, which can lock 2 more... (a chain reaction;
  capped so it doesn't clear the board), but each fork costs pay.
- **The slot trade** (no name yet; *(Claude)* OVERCLOCKED BUS, NO POCKETS, BACKPACKER): no items while you have
  it (the belt is gone), but +3 mod slots.

## Exotic items (on the list)

- **PARADOX:** undo your last ICE hit (integrity back, the node closes again).
- **ENTANGLE:** link two nodes; if either is real, both open.
- **NUKE** (HALFLIFE's idea): wipe a corp node off the map, get past it with no reward; leads into the
  hidden quest (SPEC §17).
- Exotic versions of existing items (e.g. an EXOTIC SPLIT that leaves only the real node and one ICE).
