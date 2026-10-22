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

*(Claude)* still open (small):
- The pay split: is it the plain layer pay, or with the perfect bonus (every survived clear is "perfect" now)?
  And the perfect heal (+1 int): every layer, never, or only boss layers? Every layer would heal a lot.
- How the warning looks: X-AXIS could tint the row's frames (the scan's `-` line on the empty cells, from
  v12.11) and leave it lit for the layer.
- Mods that lock ICE (SNIFFER, VIRUS, PURGE, OVERCLOCK...) eat for you: does that pay? (probably yes, half.)
- DEMOLITION already has this rule: ICE EATER does nothing extra there (or its numbers stay on for the boss).
- **Feel:** eating should feel good: a crunch sound, the node crumbling, a little `nom` / chomp glyph.

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
