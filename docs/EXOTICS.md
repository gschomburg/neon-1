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
| `health` | what a hit costs you (integrity vs credits / something else) | money for health |

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
- **Catch: the clock.** When a layer's clock runs out, the game taps a random node for you (engine/run.js,
  "clock ran out"). Under ICE EATER that could be the real node: death by timeout. Options: a timeout eats a
  random *ICE* instead (kind), costs 1 integrity instead (integrity matters again), or stays a random tap
  (brutal, and makes CHRONOS / clock mods scary).

*(Claude)* still open (small):
- How the warning looks: X-AXIS could tint the row's frames (the scan's `-` line on the empty cells, from
  v12.11) and leave it lit for the layer.
- The other lockers (PURGE, OVERCLOCK, CORNERS, BURNER...): pay like SNIFFER / VIRUS too, probably.
- DEMOLITION already has this rule: ICE EATER does nothing extra there (or its numbers stay on for the boss).
- **Feel:** eating should feel good: a crunch sound, the node crumbling, a little `nom` / chomp glyph.

## Money for health (the user, 2026-10-22; no name yet)

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
