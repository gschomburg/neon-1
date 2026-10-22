# EXOTIC mods: concepts

The EXOTIC rarity exists but has **no mods** yet (the only exotic thing is the WARP item). Exotics should
bend the rules of the game, not just give bigger numbers. Several change how a layer works, so each needs
thinking through before it's built. Nothing here is built. *(Claude)* marks my drafts; the rest is the
user's.

Mods for corps that don't exist yet stay with those corp ideas (SPEC §17). Mods that need the fake ads
(free trials, AD BLOCKER, secret ads) stay in [ADS.md](ADS.md) until the ads exist; the user likes AD BLOCKER.

---

## Questions for all exotics

*(Claude)* to settle once, for the whole tier:
1. **How you get them.** Today EXOTIC shows up as a rarity on items (WARP). Options: a rare roll on boss
   rewards / caches / the market; only from sector bosses; or a special event (a secret ad, the nuke quest).
2. **How many at once.** One exotic at a time (taking another swaps it) keeps them from stacking into chaos.
3. **On / off?** The game-changing ones (ICE EATER, COIN FLIP) could be a **toggle** on the tray (tap the badge:
   on for the next corp / off), so you choose when to bend the rules. Or always on, and that's the risk.
4. **Levels.** Most mods level up (COMMON to EPIC). Exotics probably don't: one strength, its own thing.
5. **Corp clashes.** A lot of corps have their own tap rules (DEMOLITION, FORM 27B, HYDRA, TELEPHONIX...).
   Each exotic needs a rule for those: it wins, the corp wins, or it switches off inside that corp.
6. **Multiplayer:** mods aren't in multiplayer yet, so not a worry for now.

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

*(Claude)* questions:
- **How deadly is the real node?** Instant death (pure, scary) vs "lose 2 integrity and the layer passes
  with no pay" (DEMOLITION's rule) vs "lose all but 1". FAILSAFE could catch it once.
- **Pay:** per ICE eaten (+cr each bite, so it feels like eating), plus a bonus for a clean clear? A
  "perfect" = a clear without touching the real node, which is every clear you survive.
- **Mods that lock ICE** (SNIFFER, VIRUS, PURGE, OVERCLOCK...) now **help** (they eat for you). **Mods that
  find the real node** (X-AXIS, TRACER, KEYLOGGER) become warnings instead of finds: X-AXIS would say "it's in
  this row" and *not* tap it for you. Each one needs a rule.
- **Corps:** HYDRA spawns new heads when you hit ICE, so eating could never end (cap the spawns, or HYDRA's
  heads don't respawn under ICE EATER). DEMOLITION: already the same rule, so ICE EATER does nothing extra (or
  shows the numbers louder). OMNI / bosses: bigger grids, a long clear.
- **Feel:** eating should feel good: a crunch sound, the node crumbling, a little `nom` / chomp glyph.
- **Toggle?** This is the strongest case for an on/off toggle, since it changes the whole game.

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
