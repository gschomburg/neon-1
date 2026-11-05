# NeoN+1 backlog

The one list of open work: features to build, and ideas waiting their turn. Nothing here is built.
When something gets built, take it off this list and log it in SPEC.md's version log (§16n).
New ideas and "n:" notes go here. Details live in the docs each item points to.

- Things for the user to look at or test: `docs/REVIEW.md`.
- The old planning lists (SPEC §16f, §16i, §16k, §17, mixed done and open): `docs/archive/SPEC_backlog_2026-10.md`.

Checked against the code 2026-10-26.

## Big features: the next layer of the game

The user, 2026-10-26: these are the features still to flesh out. REP and quests tie together: some quests are
unlocked by REP, and some quests unlock REP.

### 1. Gear and scrap mods (HIGH PRIORITY: the user 2026-10-29, "it's better, but we could still use some more powerful items")
- **Built v13.84: the LOOT bag** (SPEC version log): loot (value gear, PHISH) and quest items go in an unlimited bag, not
  the belt; [$] on the rule over the mods opens the LOOT screen; no more cash-in for half; LOTTO; FRAG's explosions;
  the editor's LOOT dropdown. (Decided 2026-10-30: gear stacks per rarity on the belt, not any tier in one slot;
  the bag has a line per rarity with its count.)
- **The powerful gear list** (the user + Claude, 2026-10-30). The worry: big gear that's all exotic is rare, so it barely
  shows. Spread it over the rarities with tiers (finds roll a tier: ~70% the low step, 25% the next, 5% the top).
  - **0DAY: make it.** Marks the real node: rare = this layer, epic = 2 layers, legendary = the whole corp.
  - **ENCORE** (rare): the next gear you use fires twice (named 2026-10-30).
  - **PING** (common): tap a node, it says ICE or not. Liked. (PING is also a song name in ECHO LABS: fine?)
  - **MAGNET**: this layer's $ node is safe to tap and pays (common; rare = the whole corp). Needs a $ node to use.
  - **STIM**: +50% of your INT for one corp, and you keep the health.
  - **SKIP** (epic): jump over the next row on the map. Good.
  - **NUKE** (exotic): the corp you're in is breached on the spot, pays half. Good.
  - **WORM** (epic; VIRUS is a mod): On the map, aimed at a corp ahead: its ICE is part-burned when you get there.
  - **FAKE** ("fake it till you make it", was CLONE): one of your mods counts a tier higher. Tricky; maybe permanent,
    so it's more of an upgrade choice, or a legendary version that makes it permanent.
  - **SWAP** (epic, the user's idea): swaps your health and your missing health. Down to 1 of 4: swap, back to 3 of 4.
    At full health it won't go: a warning, "that will kill you."
  - **Dropped:** JACKPT (not that great), PARADOX (gets complicated). SCOUT: OK but not worth carrying around (it
    would mostly show the next sector's anomaly).
- **Built v13.85 (batch 2):** PING, MAGNET, ENCORE, STIM, 0DAY, WORM, SKIP, SWAP, FAKE, NUKE and the RELOAD mod (SPEC
  version log). What was agreed: PING common 20cr (arm, tap a node: ICE or clean) · MAGNET common->rare
  25cr · ENCORE rare 45cr · STIM rare 40cr (max INT +50% for the corp, healed to it; keep what fits after) · 0DAY
  rare->epic->legendary 50cr · WORM epic 70cr (on the map, aimed at a corp ahead: a third of its ICE burned) · SKIP epic
  70cr (two rows ahead; never onto a sector boss row) · SWAP epic 60cr · FAKE epic 80cr (tap it, then a mod: +1 tier for
  good) · NUKE exotic, finds only (not on the sector boss or the final corp: "too big to nuke") · RELOAD (legendary mod,
  boss reward). PACK RAT waits. 0DAY and WORM work on bosses.
- **A gear top-up mod** (the user, 2026-10-30): at the start of every corp, if you have any gear it gives you one more;
  or, if you only have one of a gear item, another. Top up at the start of a corp. At least legendary: a boss reward,
  or exotic as its own find. Maybe mixed into the exotic that turns your mod bar into gear slots (docs/EXOTICS.md, "All
  items"): that would definitely be exotic. (Claude: **RELOAD**, legendary: singles get a second each corp; **PACK RAT**,
  exotic: mod row = gear slots, rewards = gear, every stack +1 each corp.)
- **Built v13.52:** TUNNEL, MESH, WARP steps, TILT, SHAKE, FRAG, REWIND, SHOE, PASS (SPEC version log).
- **Going back a row** on the map is a can of worms: save it for an exotic mod (the user thinks it could be good).
- More map gear ideas (Claude): SCOUT (see the corps / anomalies ahead), SKIP (jump over the next row).
- Exotic gear is empty now (WARP went to rare / epic): PARADOX / ENTANGLE / NUKE / BITFLIP (below).
- **Codex hints for the gear reactions** (not written yet): GRAVITAS (TILT = a free gravity drop), ENTROPY (SHAKE
  sets off its shuffle). Could go in each corp's codex entry.
- **BOX OF WIRES (the user, 2026-10-26):** a mod, not gear: starts at scrap ("i'm not going to sort these") and does
  something really cool only once you have upgraded it all the way to legendary (pairs with the carry-a-scrap-mod quest).
- **Built v13.62:** the tap-to-use corp mods are boss gear stacks now (FLARE, REMOTE, ROLLUP, FREEZE, BLAST, SNITCH,
  TITHE, ANCHOR, SLOMO, BEES; ESPRESSO folded into REWIND), and a boss reward's third pick can be a gear stack.
- **More corp mods -> gear?** (the user, 2026-10-27, after the v13.62 pass): only the tap-to-use ones moved. Others
  that could: none picked yet.
- **Gear ideas (the user, 2026-10-27):**
  - **SHORT** (short circuit; 6 letters max): fries 2 ICE that sit next to each other. (v13.62: BLAST is now an aimed
    2x2, so SHORT is close to a small BLAST. Keep it only if it gets its own twist.)
  - **Call a market:** gear that opens a black market right where you are (maybe a smaller one). Goes with **ads you
    can buy from**: an ad that is a market, or that sells one thing (see "Hidden entrances" in item 2, More fake ads).
  - **STIM:** INT +50% for one corp, and you gain the health that comes with it. When you leave the corp your max INT
    goes back down, but you keep the health you have (2 left stays 2; only health above the normal max is lost).
  - **CHECKPOINT** (exotic; could be a corp reward if some corp rewards become gear): use it in a corp; if you die in
    that corp, you start over at its first layer. Variations: pay credits to come back; or come back with no mods or
    gear. Close to CONTINUE? (CHUCK E. CACHE's legendary corp mod: pay to keep going at 1 INT, once per corp).
    CHECKPOINT would be a weaker, one-shot cousin that sends you back to the start of the corp.
- **Gear and loot ideas (the user's iPhone notes, meat notes 2026-10-30):**
  - **Gear names to use:** CHMOD, POKE, JUMP (no effects yet).
  - **THE WORKSHOP (crafting)** (the user, 2026-10-31, talking it through):
    - **A node on the map.** It may unlock through a safehouse: the safehouse gets a workshop added to it (or a
      safehouse becomes one).
    - **Shred** what you have (mods, gear, loot): you get components (**COMPS**).
    - **Build** new gear or mods with COMPS.
    - **Upgrade** a mod you have with COMPS.
    - Or just **sell** the COMPS (so they're a run thing, worth credits).
    - Open: how many COMPS each rarity gives; a set menu to build from, a rolled one (like a market), or pick anything;
      whether exotics can be built (Claude: only from a blueprint you find, so they stay rare).
    - **Decided (the user, 2026-10-31):** it lives in the **safehouse** (a THE BOARD buy, WORKBENCH: every safehouse
      gets one; heal, then the bench), not a node of its own. **COMPS are for the run:** a stack in your LOOT bag (sell
      what is left at any market). Claude's numbers to start: shred scrap 1 / common 2 / rare 4 / epic 8 / legendary 16
      (loot by its worth); a mod step up 6 / 12 / 24; build: 3 rolled offers a visit, priced in COMPS.
    - **LETTERS instead of COMPS? (the user, meat notes 2026-11-03: to talk through):** gear and mods shred into
      their short-code letters (sometimes a random one too); you craft new things from letters, Minecraft-style
      recipes; sometimes the shredder gives random letters; crafted things can stay at the safehouse for next time
      (~5 slots), maybe you can bank letters; comp rarity helps you craft the mod you want, but a random letter might
      still get you there; a recipe book in the workshop so people know what they can craft. This is also where you
      reassemble G0D (G0D.exe, item 3). Clashes with "COMPS are for the run": talk first.
    - **Decided (the user, 2026-11-03): LETTERS replace COMPS.** Recipes spell the **short code** (ITEM_SHORT: WARP,
      SKIP...). **No limit on banked letters** for now (maybe later). The safehouse stores **5 slots** of things you
      build (gear stacks: e.g. 3 mods + 2 gear stacks). Wildcards maybe; trying a random letter in a gap is already a
      weak wildcard. Claude's ideas: rare letters (X Q Z, leet 0 3) worth more; unknown words = secret recipes; the
      recipe book fills in like the codex; G0D = spell G0D with the 3 quest letters. **Next: 3 full-screen mockup
      concepts (drag the letters, Minecraft-like; inventory + recipes on screen) before any build.**
      Mockups (2026-11-03): docs/mockups/workshop.html, https://claude.ai/artifact/3FZCzcJtzcuMNXZRhPkhxw (A CRAFTING TABLE,
      B TERMINAL keyboard bank + autocomplete + man pages, C THE BENCH loose tiles + jig + pins + drawer). Short codes are
      3 letters (ITEM_SHORT / MODS short), so a recipe is always 3 slots. Near miss = 2 of 3 letters right, 50%.
      The user likes **B TERMINAL** (the keyboard). Round 2: docs/mockups/workshop_terminal.html,
      https://claude.ai/artifact/QawpRqyeA8peTZ41xgJvpZ : half-way (chunky HTML keys, game text around them) vs all on the
      36x34 cell grid (2x2 keys, hex counts, codex [TAB] row, full-screen panel). Note: a LOCKER already exists (cash
      out: keep 1 mod a step lower, engine/run.js openLocker); the workshop's 5 slots would replace or grow it.
      **Round 3 (the user, 2026-11-03):** the all-cells keyboard is worse; go half-way, fixed: header = NeoN+1 +
      SAFEHOUSE // WORKBENCH only (no LAYER / INT / cr); the keyboard is its own layer that **slides up from off screen**
      on entering (the grid above keeps the normal transitions); tabs spaced; fewer terminal lines (history); the build
      slots are **3x3 cells with the letter at 3x size, cut so each piece sits on a cell** (cell transitions move the
      pieces); every other page (no keyboard) all on the grid: the recipe book like a codex page, SHRED like the market's
      sell page (list + details first); keep recipe pins showing letters you have / are missing; a **special row** over the
      keyboard for wildcards (*) and quest glyphs; **the G0D letters are red, a new rarity** (letters from G0D).
      Mockup: docs/mockups/workshop_v3.html, https://claude.ai/artifact/1BZPZ4Gt7UJ5Tu71Tw6bvU
      **Answers (the user, 2026-11-03):** tune BUILD in the game engine, not more mockups. The red rarity is **DIVINE**
      (the G0D letters: later, once the rest is in). **Wildcards (*)** are random drops: shredding rarer things, maybe
      shredded loot, maybe fishing. The tab is **BOOK**. **Built things go to the safehouse locker**; if it's full, you
      can equip it. Open: how safehouse gear works (install anything? swap?). Leaning: you can't swap out an equipped
      mod; maybe you can only shred it, or unequip it. The ^C button becomes [ CANCEL ]. **LOCKER page (the user, 2026-11-03):** [ TAKE ] / [ STORE ]
      under the tabs (like the market's BUY / SELL), a rule above and below; TAKE lists the locker, STORE lists your tray (no
      tray at the bottom: the user, 2026-11-04). **Built v14.12** (engine/bench.js; SPEC version log): all four tabs in the
      game, the WORKBENCH post (USER, 150 REP), the editor's TESTING > safehouse + bench. Next: the user plays it, then fix
      the list (how you get to the bench and back, the BUILD screen in the engine, DIVINE letters, blueprints, wildcards
      from fishing).
      **Round 2 built v14.13** (the user's notes 2026-11-04): safehouse goes straight to the bench after the pick (and back
      in), 3 components on arrival, LEAVE, plain framed slots + cursor, > select components, bulb blink-in, the dramatic
      build (charge / split / form / fly to LOCKER or [£]), the grinder shred, gear / mod / loot labels, loot from RUN
      ANYWAY, magenta for missing, letter rarity from use, digits (x slot: a chance of that many), POPS first time.
      **Still open:** keyboard design tweaks and the line over it (the user: not sure yet); DIVINE red letters; blueprints;
      wildcards from fishing; a use for digits in mods. Letter counts: no recipe uses I; digits 1-9 none; J, Q once.
      **Components in the LOCKER** (the user, 2026-11-04): the LOCKER's TAKE page lists every component and its count (they fly
      there on a shred). **Next idea (the user): JUMBLE loot**: new loot that is a jumble of letters; sell it for cash, or shred
      it at the bench for its letters. A way to find components away from the bench (fishing, $ nodes, caches). **Built v14.14** as corrupted software: JUNK.DAT, CORRUPT.EXE, BAD SECTOR (glitchy names, loot drops; shred = random letters + digits + *). **Decided (Greg, 2026-11-05):** it drops before you own the WORKBENCH too: it sells at any market, and it teaches players the workbench exists. Open: fishing them up at the PIER. **Sounds** (the user, 2026-11-04): a sound for a failed craft (the components burning) and a sound pass on the whole bench (keys, slots, tabs, the locker, take / store). Better key-press sounds on the keyboard. **Keyboard look** (the user: leaning, just a note): the off-white / beige Commodore colors. **The build landing:** what you built shows as just its 3 letters (no name), with a little fanfare as it reaches the locker; its path arcs: it eases out to the right first, then curves up to the LOCKER tab (now it's a straight diagonal). The > select components line: no blinking _ (it fights the slot cursor).
- **Scrap mods:** maybe 2 other worthless ones.
- **Gear to concept:** more gear with bonuses, even if it's only worth selling (SHARD and BOND are the first, v13.49).
  Logged: PARADOX (undo your last ICE hit), ENTANGLE (link two nodes), NUKE (wipe a corp off the map), DECODER
  (read CIPHER for a layer), the call as an item, exotic tiers of today's gear. EXOTICS.md has more.

### 2. REP and THE BOARD (a talk first: what REP is for, how it feels over many runs)
- **The plan (2026-10-28, round 2 with the user's notes): `docs/PROGRESSION.md`** (screen mockups on a page): one hub
  (PROFILE / STORE / FEATS / CREW / STATS; title buttons REP STORE + your name), THE RECORD, FEATS (no REP; bad
  hackers' beat counts), the REP store in tiers with PRIVATE MESSAGES on top, the CREW (random CALL gear -> 5 calls ->
  buy CREW: X -> their own call gear; LVL 2 = a set mod), * for new things, the terminal line in play + the training
  popup when calm, a PROGRESS_EPOCH wipe (REP refunded). Covers items 1, 2, 4 and 7. 4 small questions left.
- **Today:** a run's REP = depth + 3 per corp + 1 per perfect + 1 per 40cr earned + 10 per sector cleared (`repFor`,
  engine/save.js). Cashing out banks it; dying banks nothing (DEADMAN keeps 25% / 50%). THE BOARD (`LEGACY`): HARDENED,
  SEED MONEY, FIELD KIT, GEAR SLOT, SHORTLIST, DEADMAN, RESTOCK.
- **Ideas logged:**
  - Levels of unlocks; finishing the codex (or beating every corp) opens new options. For the codex one: THE
    ARCHIVE (start with any mod you've found), ARCHIVIST (every corp's tell printed), an exotic pick, a cosmetic.
  - Mod storage between runs (names: LOCKER, COLD STORAGE, DEAD DROP; STASH is taken): rent per run, store only at a
    sector boss or a ripper doc stop, 1-2 mods, maybe a tier lower.
  - A booster that picks corps you haven't beaten more often. A **nemesis**: mark a corp and it shows up more.
  - Unlock mods into the starter pool (choose 3; one may show up at the start).
  - **Palettes unlock** by beating their corp (not built: SETTINGS offers every palette today). Big logos as unlocks.
  - Difficulty levels unlocked with REP that add drains (money or mods taken away) and pay more REP.
  - **Boss loot in markets** (the user, 2026-10-27): a chance for a boss's own mods and gear (FLARE, BEES...) to show
    up in black markets (tie it to REP).
  - **Feat ideas** (the user, meat notes 2026-10-28): replay a seed and get further than before; call 2 hackers in the same
    layer. And the FEAT box over the win page: a solid background that isn't the screen's (the REP color?). (The FEAT box's
    cut-off text is fixed, v13.74.)
  - **Better drops** (the user, 2026-10-26): a BOARD unlock that raises the rarity of drops (gear steps, e.g. FRAG's
    legendary) and mods: both in one unlock, or two separate unlocks (gear / mods). Same idea as the parked "better drops" mod (10-20% one step up).
  - **More feats** (the user, meat notes 2026-10-29): sell 30 PHISH; catch a biiiig PHISH; buy a mod back from the fence
    (and maybe a REP unlock: fence prices -10%).
  - **REP unlocks you can switch on and off** (the user, meat notes 2026-10-29), e.g. +1 to the default corp layer count
    (makes higher layer counts easier in the early sectors).

### 3. Quests and RPG elements
- **Crew quests** (the user, 2026-11-04: a quest per crew member, some hidden): ideas in `docs/CREW_QUESTS.md` (each built on the crew member's counter-rival; ROOT and BRICK's unlock a crew member). To pick from.
- **The quest doc: `docs/QUESTS.md`** (2026-10-28). The first quest to build out: POPS's son (the quest item, POPS's calls, the
  UPLINK hand-in, defeat d0g 10 times on a quest seed, the trace, d0g is POPS's son and joins the crew).
- **The first one to make: defeat d0g.** The quest gives you a seed; entering it unlocks god (H3AV3N).
- **Break a fellow hacker out of a corp:** one spot on the map is that corp; maybe offered after a stage, with the next
  stage built around it; you can turn it down; beating it unlocks the meta thing.
- **The call:** someone (sometimes an AI) calls and you choose to answer: a quest (raid this corp), or an offer. A
  quest line that continues across runs. The call as an item (expensive or random): more than a heal, e.g. a
  different level, or softening / cancelling the corp events.
- Challenge quests: the first OMNI stage with few mods (none, or nothing above epic); carry a worthless scrap mod
  through 3 stages.
- "You thought this was a game": a REP unlock that changes the game (unlocks quests).
- **Quest items (the user, 2026-10-26):** MOUSE (an old ball mouse) and MUG (a cold coffee mug off a sysadmin's desk).
- **Hidden entrances:** a nuked / removed corp's node stays on the map and leads somewhere strange; a secret ad (or an
  ad + a mod you own) starts something (ADS.md "Secret ads"); ads you can buy from (a puppy for a quest); an emoji
  with a quest purpose.
- **The feel: FTL's quests and interactions.** Brainstorm together.
- **Cutscene art (the user, 2026-11-04):** the DISC scene is a strip of the user's asXii drawings (built v14.17-v14.18: draw-in, parallax, lights, fog, the OPEN cue, the DISC sliding in, a POPS headshot, d0g's logo). Next: random traces running up that aren't in the drawings; more color work; the hand is out for now (the user: the pose isn't how you'd do it in ASCII). More art for the later frames maybe.
- **Cutscene music:** EVENT HORIZON as a possible lighter cutscene track (the user, 2026-11-04); the DISC scene plays PANTHEON (SCENE_MUSIC).
- **A hint on the quests tab** (the user, meat notes 2026-11-03): when it's empty, something like "no quests yet. put a
  crew together and maybe you will discover some" / "get to know the other hackers, call them".
- **FLOPPY** (the user, 2026-10-27): a floppy disk gear you insert in a terminal somewhere to start a quest.
- **G0D: how you "beat" the game** (the user, meat notes 2026-10-28):
  - G0D is a corp in heaven. Entering the H3AV3N seed opens a special network that reaches it.
  - You need d0g on your crew to get past heaven's first sector (maybe he has a special ability for it).
  - G0D has several stages: you fight it in the first sector, then again as the final boss of the second; then, after the
    success screen, one more stage opens: you think you've beaten the game, but there's one more set of layers.
  - Then G0D unlocks some cool hacking things?
  - **The fights, after two pages of mockups** (2026-10-29): docs/QUESTS.md, "The mockups and where it's heading". All 20
    ideas, and the mold effects for the map and the win screen, show in the game from the neon editor's **g0d** tab.
  - **The g0d tab grows** (the user, 2026-10-29, thinking it through, not to build yet): more sections over time. One is
    **the mold effects**, for iterating on them: the mold glitch, and **mold transitions** (the regular screen
    transition, with mold in it to varying degrees). That section gets a **mold slider** that every effect in it reads:
    the same button triggers the effect, and the slider sets how much mold, so each one can be seen at any intensity.
    (Claude: the same 0-1 number could later be what the game itself turns up as the quest goes on and in heaven.)
    **Built v14.36:** the g0d tab's "mold effects" group: the mold slider, a transition, the mold glitch. Open: where
    the game turns it up. **Hooked v14.39** to the M0LD events (light 0.3 / heavy 0.7), and the mold lags behind the wipe. Later maybe: rising as the quest goes on.
  - (more, meat notes 2026-10-28) **Who G0D is:** a rogue AI trying to destroy the net. The corps built it by accident in
    their race for AI superiority: all the corps' AIs somehow fused into G0D. Its abilities: any corp at any time? No tells?
    Maybe you only beat it by replaying the seed (learning it).
- **A gear quest** (meat notes 2026-10-28): go find a particular gear and cash out with it; that unlocks the next step.
- **More quests** (the user, meat notes 2026-10-28):
  - **The symbol path:** you find a symbol that is a path through a network (a very simple treasure map). Go through a
    sector that way and you get a bonus, or the final node turns into a special boss. Needs a special sector map, e.g.:
    `.-.-X` / ` \.-.` / `   /` / `  .`
  - **POPS's old corp:** a quest that unlocks when you call POPS in the corp he used to work for.
  - **Flip a rival:** turn one particular rival to your side. Maybe part of the d0g quest: once you beat d0g, it turns
    out he's POPS's son or protégé; then he's on your side and helps you beat G0D.
    - **d0g is b0y on your crew** (decided 2026-10-30): the d0g codex entry stays; b0y mentions he used to be d0g.
      docs/QUESTS.md, step 8.
  - **Safehouses need something cooler** (the user, meat notes 2026-10-29): they keep some mods from a run you died in,
    or offer crew CALL gear. Probably a REP unlock. Or simpler: a boosted safehouse, 2 INT and an item or two.
  - **The quest object sparkles** (the user, meat notes 2026-10-29): a twinkle / glitter effect on it.
- **G0D (everything G0D lives here for now, the user 2026-10-29):**
  - **Unlock G0D** through REP, then a quest to beat it (the top achievement).
  - **After G0D: see "4. The end game" below.**
  - **G0D flashing in on SECTOR CLEARED** now and then (the user, meat notes 2026-10-29; the rest of that note is built, v13.80).
  - **G0D's tracks** (the user, 2026-10-29): the G0D fights need their own music, and it has to kick ass: the maze, the
    mold-armor fight, the part 2 on the map / the win screen, the last stand. (docs/QUESTS.md, G0D's fights.)
  - **G0D.exe** (the user, meat notes 2026-11-03): a personal AI hacker assistant, exotic gear. After you beat G0D, a
    quest to reassemble it: find the G, the 0 and the D, then put G0D together at a workshop. It knows the tells of
    every corp you've beaten more than ~5 times (feat unlocks). Activated, it plays perfectly: it knows the real nodes
    (not just tells) and clicks them for you. It stays with you from corp to corp, uses gear, goes to stores and buys,
    moves through the network, and goes for depth; it won't buy many mods unless they boost credits (for the UPLINKs).
    Maybe a limit of 256 clicks; if so it tries to get another of itself to activate; it can call crew too. (Same idea
    as "An AI crew member that plays the game" in Low priority: G0D.exe may be that one.)

### 4. The end game (its own section, the user 2026-10-30; details: docs/ENDGAME.md)
- **Built v14.41:** the ending (cutscene, credits, "there is more to explore"), the 1UP and REPLAYS (SPEC version log;
  docs/ENDGAME.md). Open: the art (placeholders to redraw), the three unlocks as already-paid posts on THE BOARD.
- **Seeds for real:** built (replays count once you've beaten G0D). Open: its own leaderboard (scores carry the seed now).
- **Replay H3AV3N** after winning (maybe its own leaderboard).
- **A gauntlet seed:** one of each corp, in order, in a single line (stores / fishing off the sides, no skipping corps).
- **More rewards?** A mod you always start with (meat notes 2026-10-29).

- **CODEX** (the track) might be good for the credits or the cutscenes (meat notes 2026-10-31).

### 5. The map and run structure
- **Fishing: built v13.69** (engine/fishing.js; open: unlock the PIER with a feat, a quest item on the line, more UI after play). (the user, meat notes 2026-10-28): a PIER node on the map where you fish for loot.
  - Fishing costs credits.
  - You find gear and things (maybe a particular quest item), and you catch fish to sell: little fish to big fish, by
    rarity up to legendary; black markets buy them. Fish can be thrown like SHOE? You can definitely catch shoes.
  - The tap game: tap to cast, wait for a bite; when the bobber goes, tap again (then maybe reel in).
  - Fishing feats, of course. No fishing upgrades.
  - Its own view, different from the board (the note trails off: "i'm thinking different than...").
  - **The view: PHISHING** (the user picked it, 2026-10-28; mockups on the "NeoN+1 Fishing" page, idea D): the board area is
    a data stream, lanes sliding left. Hold and the hook sinks from the top toward your finger. Shapes drift by and nose the
    hook; when one bites it turns red: tap anywhere to start the reel. Miss it and it swims off. The reel: keep it inside a
    moving window (hold to pull, let go to slack) until the catch bar fills; try it, pull it out if it isn't fun. A mystery:
    every shape looks like a fish, but some are fish, some gear, sometimes a shoe; you only see what it is on the CAUGHT card.
    The user, after: holding / dragging only moves the hook up and down (which lane); it drifts left and right on its
    own. A [ REEL IN ] button pulls an empty hook back (to recast, or to leave for the next node). More UI to work out after
    playing it.
  - **Round 2 built v13.70** (7 lanes, small fish mostly, sounds, weights, pier music, menu at the pier, taps on the stream only, ripples, the reel in the fish's lane).
  - **Fishing meat notes (the user, 2026-10-28, after playing v13.70), open:**
    - (built v13.71) **Reel UI pass:** off the target, the whole bar goes red (but keep the target visible: it could tint a little pink when
      you're off it). The cursor: a bigger shape (# or @) that REPLACES the - under it (it overlaps now, which makes it less clear),
      white, or matching the target's cyan; when it's on the target it changes (white or something else). The target design is good.
    - (built v13.71) After a catch, keep the stream dimmed behind the CAUGHT card until you KEEP or THROW BACK.
    - (built v13.71) Terminal: the cast message, then once you drag it changes to "drag up and down to move the hook" (it only moves up and down).
    - (dropped, the user 2026-10-28) INT back from fishing: a PATCH can already come up on the line, which does the same.
    - (built v13.72) CAST AWAY: a title for casting 250 times (not 60 minutes); BIG DATA for a 10 GB+ catch; the biggest catch is a stat.
    - Mods or gear that affect fishing? (a note for now, the user 2026-10-28; the first notes said no fishing upgrades)
    - (built v13.71) **PHISHING retheme:** what you catch is corp data, not fish: corp passwords, elderly social security numbers, corpo
      credentials, blackmail material. Gear still comes up, but the catches get a little description of what info you got.
      Keep the random weights (maybe not pounds) and the BIGGEST YET stuff.
- **Different markets** (the user, meat notes 2026-10-28): black market / grey market / open market.
- **MESH at the last row (built v13.75)**: it links the nodes on either side of you there; they still go to the boss.
- More varied layouts: missing nodes, skip-lane links, sideways links, dead ends, other shapes per sector.
- Moving backwards / the frontier (pick any node linked to one you've visited), or allow clearing the whole map.
  An "open map" mod (the aimed WARP is built: epic WARP, v13.52).
- Node count that keeps climbing; past the 4x4 grid (phones fit ~6 columns).
- More final bosses, each its own mechanic (OMNI is the only one).
- Long-run issues: power creep, a guaranteed heal each sector.

### 6. Anomalies and sector events (named 2026-10-26)
- **Built v13.54** (design: `docs/SECTOR_EVENTS.md`): 14 sector events, the SECTOR EVENT card, BLINDERS, THE FENCE,
  the editor's TESTING tab (SPEC version log).
- **Built v13.55:** the codex SECTORS tab.
- **Still open:** a THREAT level later; a REP option to turn events on in sector 1; tying the sector boss to the
  event (parked).
- **Next batch (the user, 2026-10-27)** (docs/SECTOR_EVENTS.md "The next batch"): built v13.58: GRIND, BLACK ICE + COLD SNAP,
  RIGHT ANGLES, GAUNTLET; v13.59: EENY MEENY (3 bosses); v13.60: HEAD FIRST. Idea: ICE STORM.
- **Other ideas (Claude's):** TAXED, AUDITED, RANSOM, BACKWARDS, a trace meter, two events stacked.
- **Overlapping events: built v14.16** (stacking, weights as economy numbers, scales). Still open: more scales (quests, REP level: the user, 2026-11-04, 'quests or other things can start to scale those values'); the editor's TESTING picking a pair; turn RAT RACE / CHEF'S CHOICE down to 3-4 after the d0g quest is real (today the scale keys off beating d0g as a rival).
- **MOLD, a sector event** (the user, 2026-10-30): explains the mold in heaven (docs/QUESTS.md, step 11); once
  unlocked, it can come up as a random event in regular runs too.
- **Event tiers, later** (the user, 2026-10-30: not now): harder events only deeper. For now the rule stands: sector 1
  is clean, and from sector 2 any event can show up.


### 7. New corps
- From CORPS.md, not built: FOSSIL (a dig site), UNICORN (very rare), MAGIC (stage magic), ALARMS, the chain corp,
  the case corp (upper / lower case), the stock market corp.
- From the old ideas list, not built: bad security (passwords that rotate: BUDGETWALL / PASSWORD123), the dating app (SPARKD, a catfish
  boss), an arms dealer (GUNMETAL), the punk corp (details to come from the user), sudoku / crossword, the seed corp
  (uses or changes the run seed). THE CHOIR as a "ministry" (a per-corp word instead of "corp").
- A second boss mod for the corps that have one (71 corp mods left; 11 corps give boss gear instead, v13.62).
- **A drug dealer corp** (the user, 2026-10-27).
- CORPS.md marks every built corp `(built)` on its heading.

- **MONTY** (the user, meat notes 2026-10-30): a corp of 16 doors (the Monty Hall problem): you choose one, it takes away every
  door but yours and one other, and you choose again.
- **RED TAPE:** a mod or gear (just the name so far).
- **B1BL3** (the user, meat notes 2026-10-31): a portable codex (gear).
- **BEES** (the user, meat notes 2026-10-31) needs a better animation: a swarm of little bees flying over the whole map, then destroying the ICE. **Built v14.15.**

### 8. Achievements and cosmetics
- First win, a naked (0 mod) win, beat each corp, perfect streaks, reach layer X; easy ones too (die on the first
  corp, spend 1000cr, earn 1000cr then get back to 0); beat G0D at the top.
- Unlock cosmetics: logos, hats / accessories, card frames, titles ("SIGIL BREAKER"). Some bought with REP.

- **INFIDEL** (the user, meat notes 2026-10-30): a feat (a title) for beating G0D with a SHOE. (So SHOE has to work in the
  G0D fight.)

### 9. The encrypted codex
- **Built v14.35** (SPEC version log): unfound entries are ciphertext that shows more as you find more of a tab; a new
  find decodes once; a corp's tell decodes once you breach it.

### 10. Lean more cyberpunk
- Cyberware in names and flavor (implants as gear, MEDIX as a chrome clinic, chrome on the runner card), the ads.

### 11. Make it more of a hacking game
- Something in the game itself you can hack, like the seed.

## Low priority

- **An AI crew member that plays the game** (the user, meat notes 2026-10-31): it learns as you beat corps: beat a corp
  10 times and the AI knows its tell (it gets it right); beat all of them 10 times and you can let it run. It doesn't
  use markets, but takes what lets it go deeper faster: SKIP, WARP, money boosters to get through the UPLINKs. You
  bring it in with an exotic CALL item. Names: ZEUS? APOLLO?
  (2026-11-03: see G0D.exe in item 3; maybe the same thing.)

### Enemy and ally hackers (low: the user 2026-10-29, "we don't need any more"; the lore was great) (built v13.67: rivals, crew, CALL gear; see docs/PROGRESSION.md step 3)
- **Still open:** special per-hacker emotes; multiplayer on the new cursor; more hackers (RTFM);
  COMPANION's pet; balance from play.
- **From the user's iPhone notes (meat notes 2026-10-30):** hacker names: **s3iz**, **alpha haxor**, **kupreg**,
  **circo 77**, **Doctor kitten face**. Using a crew member's logo (as yours) makes their calls less rare.
- **Rival notes (built v13.74)** (the user, meat notes 2026-10-28):
  - **A bigger rival death:** more effect when a rival dies, almost like when you fail.
  - **A rival-defeated beat after a corp:** at the end of the corp, a note that you beat them and who they were. Maybe in the
    CORP BREACHED screen: CORP BREACHED, then the rival's logo (you defeated them), then the logo goes away (or is replaced by
    your own), then the screen / animation as it is now.
  - **Breaching a corp while its rival is still alive counts as beating them** (the beat tally, the feats).
- **Dying to a rival** (the user, meat notes 2026-10-28): better sounds on that screen (their logo over your death): a wah-wah,
  but more jingly, bad-news sounding.
- RIVAL is a bot second player (health, burns ICE, steals pay).
- **The cast, written v13.63** (the user, 2026-10-28): 10 bad and 10 good hackers in `dist/data/hackers.js`, each with
  a face (5 x 3, like POPS's: `data/art/faces.js`, new), a logo (`logos.js`, kind hacker), lore, a shtick, how its AI
  plays, and a counter (each good hacker is made for one bad one). Browse them in the neon editor's HACKERS tab.
  Bad: ICE MAN, GG_EZ (only emotes), TURBO (taps everything fast), D0PPEL (today's RIVAL, mirrors you), SYSOP, VULTURE,
  PH1SH, d0g, HCF, LEECH. Good: POPS, BRICK (taps nothing, takes your hits), NULL (hunts the bad hacker), NANA, DIALUP,
  BAUD, MOTHER, ROOT, KLUDGE, HYPE. None play yet.
- **Next for the hackers:** the user's pass on the cast (art, names, AI); then build the hacker bot (one engine, each
  AI a small set of rules, RIVAL folded in as D0PPEL); how bad ones show up (an anomaly / sector event, an ICE hit
  calling one in); the CALL gear for good ones; their card when they arrive (face + name + shtick); a codex HACKERS
  tab; beating a bad one unlocks its logo (`save.hackersBeaten` is already read by the logo picker). Later: mods
  on good hackers.
- **Allies:** an item that calls a hacker (POPS?) with health who clears nodes for you, or stands and takes hits;
  upgrade them, give them mods (POPS with TRACER), tie them to REP or to your history with that hacker.
- Details: CORPS.md "Corp modifiers" > RIVAL; the hacker / NPC name pool in CORPS.md.
- **COMPANION's pet on screen: built v13.68** (engine/pet.js; open: other ways to get a pet). (the user, 2026-10-27): BYTEPETS' mod gets a little animated pet that is on screen
  much of the time, and you can pet it. No change to what it does. Look at it with the hackers (they're almost pets).
  More (meat notes 2026-10-28): it's a cat or a dog; it sits on the tray or dances to the music; it also sleeps and walks
  back and forth. Does it interact with hackers at all? Would MOTHER point it out?
- **RTFM** (the user, meat notes 2026-10-28): a hacker. Its line: not "real time fun machine".
- **How a hacker shows up and plays out** (the user, meat notes 2026-10-28; for step 3 of docs/PROGRESSION.md):
  - **The intro:** a short card when a rival invades, and the same when you call in crew: it shows the logo. Either it
    goes on by itself or you tap to close; the clocks stop while it's up.
  - **Their colors:** each hacker gets colors (this replaces "no colors of their own"). Their **cursor** moves around
    the board in their colors, and the **terminal** takes on their colors for their lines.
  - **Emotes:** hackers emote, maybe with special emotes of their own.
  - **The terminal:** rivals taunt there; crew give clues; whatever a hacker does shows up there.
  - **Their INT** is on screen.
  - **Their face** pops up and bounces like POPS's in the training, maybe in the terminal when they're talking.
  - **Defeated:** a little animation (their face icon going away) and a line in the terminal. It matters most for
    rivals, but crew get one too, a goodbye like "that's all i got left" or "they got me".
  - **You die with a rival in the layer** (or to one): their logo comes up as the screen falls apart, with a taunt.
  - **You die with crew still going:** their face comes up as the screen falls apart, calling your name, like the
    Metal Gear Solid game over ("snaaake! snake!"). Each crew member has their own line.

## Polish (the user, 2026-10-29: the finishing passes)
- **Boss intro pass** (the user, 2026-10-29: "it's all working for now", but the whole boss intro could use a little more): the corp's logo on it, and more.
- **INTRO PASS:** after the user has lived with it. The intro keeps playing every time; the NEWB / LEET screen only on
  a truly fresh start (maybe a URL switch keeps it all, for testing; `INTRO_ALWAYS` in engine/intro.js). Glitch /
  animation effects on the title card (noise in the log, the map drawing in with static, a burst on handshake, the
  logo decoding in). The title card art round (the user is trying things in asXii first; the old lettering samples:
  `docs/art/logotype_round4.png`, `logotype_n1.png`, `logotype_round5.png`, text in NAMES.md; the title switching
  between the face and the lettering). Your profile shuffling as you log in. The maps more animated (the user,
  2026-10-27): the white path lines light up, or each continent lights up with brighter white borders.
- **Sector event cards:** the user's art for the 14 card pictures (5 x 3 placeholders in data/events.js).
- **COPY PASS (text):** a terminology pass on the whole game, to lock the terms down. Settled so far (the user, 2026-10-29):
  **going deeper** = moving on through the sectors (the UPLINK says it; push on, next sector... say it this way). The INFO page, the training (POPS's lines), the mod and gear descriptions, and the ~180
  "integrity" mentions (the header says INT; INT everywhere, or only where space is tight).
- **Codex and menus pass** (with HOW TO PLAY):
  - **HOW TO PLAY pass:** touch it up (corps and tells on THE BASICS; gestures, exotics, ads, run resume).
  - **Keyword highlighting in text** (started v13.75 on HOW TO PLAY > THE BASICS: ICE, INT, credits; next the other HOW TO PLAY pages and the codex, the user's aim: neater): ICE in red, credits in money, mod names in their rarity...
- **PHONE PASS:** (the user, 2026-10-31, as a home-screen app on an older, smaller iPhone: it works, but everything feels small; the text size is set by the widest screens fitting the width) bigger, roomier buttons (the tray, lists; ~44px); more room for long text (codex, mod
  descriptions, detail boxes, the clash screen); the swap screen's row spacing; the spacing / copy on the pick
  screens; the header menu button right-aligned?; the palette warnings (40 palettes; MOCHI MOCHI is hard to read,
  the user will probably change it).
- **A juice / graphics pass:** Unicode shading and shapes, kaomoji, bigger mini-art for mods in detail boxes.

## Medium and small
- **Hacker logo pass** (the user, 2026-11-04, looking at them now): the game always adds the name under a logo (logoBlock: mark + name; the hacker card's NAME // RIVAL line), so logos don't need the name in their art: 24 x 7 is all picture. 17 hacker logos spell their name in the art and show it twice: pops, iceman, turbo, sysop, vulture, phish, hcf, leech, brick, null, nana, dialup, baud, mother, root, kludge, hype (not ggez, doppel, d0g). Redraw them (art only, no code).
- [ ] **Effects library** (the user, 2026-11-04): talked through; decided to pull the effects into one shared library (named effects with global settings and local overrides, one way to apply them, an editor FX page). Plan and steps in docs/EFFECTS.md. Not built.
- **asXii size presets** (the user, 2026-11-04): update asXii's Presets list (ascii-editor/dist/index.html #sizePreset) to the game's real art sizes, and check the ones there. Today it has: node glyph 5 x 3 (right), corp art 24 x 12 (wrong: corp intro art is the logo, 24 x 7), ad box 30 x 18 (right: ADS_W / ADS_H), intro map 34 x 9 (the map is 34 x 12 now), title art 32 x 20 (check: TITLE_W is 31), terminal 80 x 24. Add: logo 24 x 7 (the name goes on row 8, LOGO_W / LOGO_H), hacker face 5 x 3, SECTOR CLEARED 30 x 13, sector event card 5 x 3, cutscene 36 wide (any height; the game's grid). asXii is Justin's too: check his recent commits first.
- [ ] **Pull asXii out into its own repo** (the user, 2026-11-04). It's already separate in most ways: its own version,
  bump script, README and docs, and no game code. What moving it would touch:
  - **Keep its history:** split `ascii-editor/` out with `git subtree split` (or `git filter-repo`), so Justin's and
    Greg's commits come with it. Then remove the folder here.
  - **The neon editor's ART tab** opens asXii at `../ascii-editor/dist/index.html?neon=1`
    (`tools/neon_editor.html`, `editInAsxii`) and talks to it with `postMessage`. After the move, that path has to
    point somewhere else: a hosted copy (simplest, works from anywhere), or a sibling folder on disk
    (`../../asxii/dist/`). The messages already check `from: 'asxii'`, so they work across sites;
    `dist/neon-link.js` goes with asXii.
  - **Cutscene art:** `tools/scene_art.js` reads the asXii saves in `ascii-editor/saves/` (gitignored, so they're
    only on Greg's disk). Give it a path setting, or keep the cutscene saves in this repo (e.g. `art/scenes/`), since
    they're the game's art more than asXii's.
  - **Docs and settings to update:** CLAUDE.md (the asXii line), readme.md (the layout tree), SPEC §14 and §16f,
    `.gitignore` (the ascii-art.de catalog line moves to asXii's), and the new repo's own CLAUDE.md, `.gitattributes`
    and `.gitignore`. Comments in `dist/data/art/*.js` and `scene_art.js` that say "asXii" can stay.
  - **Justin** needs access to the new repo, and his open branches (if any) need rebasing onto it.
  - **Hosting:** asXii gets its own deploy (and its link-preview tags once it has an address). Its update notice
    already works on its own (`version.json`).
  - **Gains:** asXii can be public or shared on its own, and its commits stop mixing with the game's.
    **Costs:** two repos to keep in step for the art round trip, and the neon editor depends on where asXii lives.
- **Sell page gear**: built v14.15 (loot rows like gear rows).
- **SELL ALL LOOT**: built v14.15 ([ ALL LOOT +XXcr ] on the sell page).
- **SHOE attack**: built v14.15 (the throw, shorter lines).
- (fine as is, the user 2026-10-29) A REROLL in a market with COUPON adds another free option. Cold Brew's boss reward
  is the REWIND x2 epic stack, not boss loot (checked). Epic FIREWALL with FAILSAFE: "no hits this corp", working. BLOOD MONEY's repair glitch (a repair pays a little in the early sectors) stays: "if someone wants to they should be able to". BLOOD MONEY scaling: fine as is (the user 2026-10-29: "i still ran out of cash and couldn't get past the uplink"); it already scales by sector and BLACK ICE costs that many hits.
- (dropped, the user 2026-10-28: fine for now) Boss rewards by difficulty; showing corp difficulty in game; the tell balance pass.
- **Effects on the beat** (the user, 2026-10-27): effects that land on the music's beat; subtle.
- **FORGERY's partner:** a rare mod that turns $ nodes into exotic mod nodes (open: what one costs to open).
- **Ads that do things** (later, the user 2026-10-28; the fake ads are done and great): an ad that sells you gear or a mod; a free trial of a corp's mod; AD BLOCKER.
- **A daily seed** and a daily leaderboard (none today).

## Deploy and release (later: a browser-testing pass opens these)
- **Browser back = BACK** on menu pages (the user, 2026-10-29: it only came up once; a can of worms for that pass) (and ask before leaving a run or a room).
- **Going public:** drop the page's `noindex`; maybe the game's own domain.

## Parked (later, when the user says)
- **Not sure yet** (the user, 2026-10-29): **A general popup over a node:** pull COIN FLIP's hold / drag box into one shared piece (`nodePopup`). **Flipped characters:** MIRRORLINE's glyphs flip with its mirror; a backwards mod.
- **MULTIPLAYER: shelved** (it works and stays in; finish the core game first). Later: maybe p5.party instead of
  Firebase; co-op (NeoN+m, Keep Talking style); a roulette mode.
- **Music:** the engine pass and fewer, better tracks: docs/MUSIC.md.
- **Analytics:** the play stats are collected (greglytics); reading them (which corps beat people, what gets bought).

## Parked mod ideas (the user, 2026-10-26: "we have enough mods for now")
- **DELUX** (probably exotic; the user, 2026-10-31: parked): gives you a random set of mods.
- **Item stacks become health** (probably an exotic mod; parked 2026-10-31): your gear stacks count as integrity.
- **Name ideas** (the user's notes, 2026-10-31: "brain dumps of words that might be good mods or gear"): MIMIC, NEON, SCAM, MERCH.
Where they are, for when mods open up again:
- **CLUSTER** (the user, 2026-10-26): a mod name to build something around; no idea for it yet.
- **A random gear every corp** (the user, 2026-10-27): a mod that gives you a new random loot gear at each corp's start.
- CORPS.md "Notes": open map, THROTTLE (cheaper uplink), DIGIPET's pet on screen.
- ECONOMY.md: chained perfects, TIME IS MONEY, items as a store of value.
- EXOTICS.md: "New exotic ideas, 2026-10-25".
- The archive (`docs/archive/SPEC_backlog_2026-10.md`): random gear on perfects, better drops (10-20% one step up),
  a bigger VIRUS / CHAINLOCK, a glyph mod, TRUTH METER, dummy ICE, scans as patterns, OVERCLOCK's row-flash
  variant, HYDRA counters, recon stops, puzzle on ICE.
