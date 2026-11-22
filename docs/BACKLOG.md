# NeoN+1 backlog

The one list of open work: features to build, and ideas waiting their turn. Nothing here is built.
When something gets built, take it off this list and log it in SPEC.md's version log (§16n).
New ideas and "n:" notes go here. Details live in the docs each item points to.

- Things for the user to look at or test: `docs/REVIEW.md`.
- This list before the 2026-11-07 cleanup, with the built items and their design history:
  `docs/archive/BACKLOG_2026-11-07.md`. The older planning lists: `docs/archive/SPEC_backlog_2026-10.md`.

Cleaned up 2026-11-07: built items taken out (the SPEC version log has them), open leftovers kept.
Checked against the code 2026-11-08: items built already that were still listed are out (RELOAD, the achievement
feats, more pets, the DISC on the line, corrupted software at the PIER, the quests tab hint, BIG DATA, the cutscene
track, Justin's music viewer, KERNEL, NEMESIS, STARTER POOL, TIME IS MONEY); partly built ones say what's left.

## Next up: THE SHELL and the deck (Greg, 2026-11-20: "a list of stuff i can have you work on tomorrow")
Details: docs/DECK.md (SUDO, BOSS, Chips) and docs/SHELL.md.
- **CRON** and more BOSS chips: CRON brings back the refill every sector, and with it charges that last the whole run
  become the default. More big bosses to drop BOSS chips (Greg: "we will need to figure out more bosses").
  **Decided (Greg, 2026-11-21):** not yet. There's no boss for it, so charges keep refilling every sector for now.
- **`compile`:** THE SHELL makes a chip. **Decided (Greg, 2026-11-21):** a special, one-time thing inside a quest: you
  find something during a run, compile it in THE SHELL, then cash out with the chip. A special chip. Where it fits: later.
- **Chips in `give`'s list** (Greg, 2026-11-21, a note): `give` could take chips too, but only ones you've seen or
  shredded, so it's harder. Different from `compile`.
- **More SUDO commands:** built v15.06: `mode.free`, `corp.jump`, `rm -rf`, `chmod`. `fork` v15.07 (QUANTUM's second real
  node for a corp, same glyph, full pay).
- **Ripped chips:** built v15.08, the fence list v15.09 (docs/DECK.md "The sources"). Left: an exotic ripped chip.
- **The fuse node:** now **THE CHROME FORGE**, parked with the map nodes (section 5).
- **Making chips at the workbench:** built v15.10 (a BLANK; docs/DECK.md "The workbench").
  **Decided (Greg, 2026-11-21), v15.14:** a chip you've seen is craftable (a market's, a corp boss's pick, your belt).
  **Decided (Greg, 2026-11-21), v15.22:** chips need no blueprint at all now, epic+ too: seen and the parts is enough.
- **A CRASH chip that shreds everything** (Greg, 2026-11-21: keep it): cash out or die, and all your mods and gear shred
  into components (docs/DECK.md CRASH, under BLACK BOX).
- **Chips for the empty groups:** UPLINK, PORTS (later; its card is cryptic for now). The CREW jacks (v15.47) and GLYPH
  (v15.48) take no chips: crew plug in, and the glyph has its bonus (Greg, 2026-11-22).

## Playtest notes (Greg, meat notes 2026-11-21: "play review notes")
Filed from the meat notes as written; nothing here is checked or built yet unless it says so.

### Bugs to look into
Looked at 2026-11-21 (v15.30). Fixed: SIMON's boss intro wraps (and MONTY's and FOSSIL's: engine/run.js
buildBossIntro); ROOT's cutscene hides the bench keyboard (engine/bench.js benchKeys); THE SHELL's list keeps its rows
(the log gives up the room) and its scroll bars are dark.
- **SIMON's boss skip:** tapping the real node (the pattern's last step) early clears the layer with no pay, the boss
  too. **Decided (Greg, 2026-11-21):** keep it ("the simon one is still pretty hard").
- **WARP in EENY MEENY:** working as built. WARP never targets a boss (any sector), and you can't get stuck: when every
  way on is explored, the next row with somewhere new opens (engine/render.js availableNodes, the "pocket").
- **HAD3S, CERBERUS and a ripped chip:** it was the rule: any layer a rival stole meant it took a ripped chip back.
  **Decided (Greg, 2026-11-21), built v15.31:** only the boss layer. Beat the boss and you keep them.
- **TELEPHONIX's TELL LIGHT:** the corp side looks right: when a layer doesn't follow its tell, the dial points at a
  random node, and TELL LIGHT says TELL OFF. The quirk: that random node can be the real one, so TELL OFF shows while
  the dial is right (for every corp that dresses its nodes; engine/layers.js lv.tellOn). Open for Greg: what did you
  see? (TELL ON with a wrong dial would be a real bug.) Maybe say TELL ON whenever the tell happens to point true.

### Training: the deck and the workbench
- **The deck's first time:** (built v15.32: POPS's call comes before the PAPERWORK card.) POPS's 6-line deck talk is too big for a first look: split it into its own training. POPS calls and offers it
  ("there's a lot to go over here. need me to hold your hand?" / skip). Greg's outline:
  - your deck lasts, like your REP buys
  - start by slotting the PSU chip. A board with no PSU: that socket gets the power effects, and the no-power bar says
    "slot a PSU" (tap it: scrolls to the PSU)
  - chips go in sockets; you find them on runs and have to cash out with them; maybe craft them at a workbench, or take
    them off other hackers
  - chips need power; upgrade your PSU here; maybe an example of slotting one with too little power
  - a quick "slot a chip" for the player to do
  - the deck upgrades for REP, which opens more slots (REP, and you have to be ELITE or SYSOP)
  - point out the SLOTS sub-tab
  - at the end maybe a chip, a feat or a title
  - then the PAPERWORK quest card
- **The workbench training** (was in Medium and small, Greg 2026-11-20): same shape as the deck's, a quick intro then the
  offer. Its own world, apart from your run: your gear swaps for a set kit, ROOT's quest popups stay out, and at the end
  you're back in your run as you were. Greg's outline:
  - SHRED: shred the set gear / mods for letters. You can shred mods, gear or loot, unless it's important. Letters come
    from the item; some corrupted items give weirder stuff. Shred till you have PURGE's letters.
  - the BOOK (auto, or POPS has you tap it): pin a recipe (PATCH).
  - BUILD: go to the build page and type the letters (Greg leans to typing them), build.
  - the LOCKER: what you build goes there; put it on your belt; the locker keeps 5 things for your next run.
  - also explain the `*` (from the old item: it means "anything").
- **Replay them** from HOW TO PLAY (both trainings).

### The workbench
- Built v15.33: SHRED's GEAR / MODS / LOOT sub-tabs, [ CLEAR ] under a good recipe, its music (AUGMENT, low; Greg).
- **Decided (Greg, 2026-11-22), built v15.34:** the components move to their own LOCKER sub-tab (COMPS, letters 2x2), and
  BIG LOCKER (+5 slots) is an ELITE post (v15.35, in
  ELITE POST 1's place: ELITE needs real posts).

### REP and chip ideas (Greg, meat notes 2026-11-22)
**Decided (Greg, 2026-11-22):** fill ELITE and SYSOP. The batches:
1. [x] (v15.40) Ladders: a post's next level is its own post a level up (HARDENED, SEED MONEY, RESTOCK, DEADMAN to 75%,
   BETTER DROPS, LOYALTY CARD), and REP's sub-tabs (MSGS GUEST USER ELITE SYSOP).
2. [x] (v15.41) Plain posts: POWER TAP (deck power +1 ELITE, +2 SYSOP), SURGE (SHELL charges, the same), CLOUT (+25% REP, SYSOP),
   BAIT SHOP (cheaper casts, ELITE), DEEP WATER (rarer and more corrupted catches, SYSOP), BACKDOOR (dev.start /
   dev.stop; SYSOP, hidden till you're SYSOP).
3. [x] (v15.43) CHIP DEALER (ELITE; II on SYSOP): a catalog of chips after a DATA CACHE. You still have to get out with what you
   buy; every chip in it counts as seen (craftable).
4. [x] (v15.44) Posts that give chips: SACRIFICE (ELITE, OVERVOLT: pay the UPLINK with all but 1 INT, an option there;
   was BLOOD TOLL, Greg: it didn't fit BLOOD MONEY) and +1 LAYER (SYSOP, BIOS). **Kept for later (Greg):** the name
   BRUTE FORCE, for a feat, a post or a chip.
5. [x] (v15.45) The rewards-screen chips (HEIRLOOM's [ TO LOCKER ], SALVAGE, GAMBLE, AUCTION) and BENCH LINK.

The ideas as they came:
- **Full shell access:** the secret to `dev.start` / `dev.stop`. Expensive, and hidden. (Today dev mode makes a run
  practice, so it can't farm anything.) Maybe a private message from a feat, or a SYSOP post that doesn't show until
  you're SYSOP.
- **Another level for DEADMAN** (75%) **and / or HARDENED** (+3 INT).
- **More deck power:** +1, then +2 (a post with 2 levels; adds to your cell's budget).
- **More SHELL charges:** +1, then +2, baked in (a post), or a chip if that fits better.
- **More REP:** about x1.5. (FAME, an OVERVOLT chip, is +20% for -1 INT.) A post would be a plain multiplier, so keep
  it small (+10% / +25%) or SYSOP-priced.
- **A fishing post:** bigger catches, a better rarity, half-price casts, or free casts. (STEADY HANDS is the one now.)
- **The UPLINK:** cheaper (TOLL PASS, a chip, is -25%), or a full heal, or pay with INT (all but 1) to pass.
- **REP sub-tabs:** MSGS GUEST USER ELITE SYSOP (27 wide: fits). The list is long now (about 30).
- **Press F to pay respects** (misc, later: Greg, 2026-11-22): when a boss goes down, an `F` flashes for a moment; tap it
  (or press F) and it counts toward a feat (PAID RESPECTS, 50), maybe a line from POPS the first time. Nothing in the run.
- **Chips are hard to come by in normal play.** Today: a cracked DATA CACHE 20%, a pier catch 25% (in place of gear),
  a market 15%, a corp boss 12%, out of about 120 chips. Ideas: a REP post that adds a chip store to DATA CACHES, or a
  chip dealer (a node, or a stall like THE FENCE).
- **Decided (Greg, 2026-11-22):** SAFE ROUTE becomes **BENCH LINK**: your WORKBENCH at the UPLINK, once a sector (not a
  safehouse in place of a node). SPORE CELL (the M0LD) and ADWARE (an ad corp's boss) wait for a way to get them: both
  are built (v15.46) and stay BETA (they never drop) till they have one. HEIRLOOM: a `[ TO LOCKER ]` button by TAKE, not automatic; the rewards-screen chips (HEIRLOOM, SALVAGE,
  GAMBLE, AUCTION) are a batch.

### The deck and chips
- (Greg asked: is SPOILS a chip you start with? Yes: the deck comes with STOCK CELL and SPOILS, engine/deck.js DECK_START.)

### UI
- **Decided (Greg, 2026-11-21), built v15.32:** keep `[< TITLE]`; LEAVE is `[LEAVE >]`. Both brighter, the arrow nudges
  its way now and then and a shimmer slides across (engine/scene.js wayOutBtn). The market's BUY / SELL are regular tabs.
- **Lists with an info box:** standardize above or below. FEATS shows it above, REP below (REP also has its buy area;
  maybe those just sit closer). The codex is above. Look at them all together.
- **THE BOARD's name:** "BBS board"? Or a better name for the whole section (it was up for a rename once). BBS = bulletin
  board system.
- **HOW TO PLAY** gets the tabs and sub-tabs: BASICS (INTRO: today's basics, NET, TRAY; TRAINING: the corp, workbench
  and deck trainings) and ADVANCED (the deck, the workbench, phishing, crews and REP...). Sub-tabs to work out.
- **The training's text:** make the capitals match (MOD is capitalized, mods isn't: maybe that's fine).
- The LOOT bag's CLOSE is fine as it is (Greg).

### Quests and story
- **The H3AV3N maze:** make the pattern more of a thing: a better intro, or a little popup from b0y.
- **The MEDIX basement scene** should foreshadow the NetHack / INFILTR8 stuff: maybe a second panel of sneaking through
  the basement past a camera, in rooms, looking like what that mode ends up as.

### Balance
- **LEVERAGE** isn't a great exotic yet. Ideas: real debt without buying anything (take a loan, give your money away);
  let it go below -250 at the UPLINK.
- **FRAG:** does it show explosions? A plop where each will land, then staggered radial booms.
- **The ELITE level** needs things to buy: its three posts are placeholders (engine/save.js elite1-3).

## Big features: the next layer of the game

The user, 2026-10-26: these are the features still to flesh out. REP and quests tie together: some quests are
unlocked by REP, and some quests unlock REP.

### 1. Gear and scrap mods
**Greg, 2026-11-07:** "we are pretty good on gear for now."
- **PACK RAT** (exotic; the gear top-up's big cousin, RELOAD is the built one): mod row = gear slots, rewards = gear,
  every stack +1 each corp (docs/EXOTICS.md, "All items").
- **Going back a row** on the map: moved to docs/DECK.md (the shell chip `cd ..`), 2026-11-15.
- SCOUT (see the corps / anomalies ahead): moved to docs/DECK.md (the shell chip `scan`), 2026-11-15.
- Exotic gear: only NUKE. Ideas: PARADOX / ENTANGLE / BITFLIP (below).
- **Codex hints for the gear reactions** (not written yet): GRAVITAS (TILT = a free gravity drop), ENTROPY (SHAKE
  sets off its shuffle). Could go in each corp's codex entry.
- **More corp mods -> gear?** (the user, 2026-10-27): only the tap-to-use ones moved (v13.62). Others that could: none
  picked yet.
- **Gear ideas (the user, 2026-10-27):**
  - **SHORT** (short circuit): fries 2 ICE that sit next to each other. (BLAST is an aimed 2x2, so SHORT is close to a
    small BLAST. Keep it only if it gets its own twist.)
  - **Call a market:** moved to docs/DECK.md (the shell chip `market`), 2026-11-15. It still goes with **ads you can buy
    from**.
  - **CHECKPOINT:** moved to docs/DECK.md (a CRASH chip), 2026-11-15. Its variations: pay credits to come back, or come
    back with no mods or gear.
  - **Gear names to use:** CHMOD, POKE, JUMP (no effects yet).
- **THE WORKBENCH, what's still open** (built v14.12-v14.15; the whole design talk is in the archive):
  - Keyboard design tweaks and the line over it (the user: not sure yet). The look: off-white / beige Commodore
    colors (the user: leaning, just a note).
  - **DIVINE** red letters (from G0D; the bench's SPECIAL row waits for them); wildcards (*) from fishing
    (today only by shredding the corrupted software it brings up); a use for digits in mods (docs/DECK.md: a code with a digit makes a chip). Letter
    counts: no recipe uses I; digits 1-9 none; J, Q once.
  - **`* * *`: three wildcards** (Greg, 2026-11-21, an idea; not built). Today it lists the first three recipes that fit
    ("* FITS N: PICK ONE"), always the same three. Idea: three wildcards build something super good, and always the
    same thing, like an exotic mod or an exotic / BOSS chip. Maybe work it into a quest. Dropped for now: a random roll.
  - What a letter's rarity means once you craft with it (Greg, 2026-11-05: keep each letter's rarity, so the keyboard
    can show the colours).
  - How safehouse gear works (install anything? swap?). Leaning: you can't swap out an equipped mod; maybe you can
    only shred it, or unequip it.
  - **Sounds:** a failed craft (the components burning), a sound pass on the whole bench (keys, slots, tabs, the
    locker, take / store), better key-press sounds.
- **Scrap mods:** maybe 2 other worthless ones.
- **Fishing mods** (Greg, 2026-11-11: could be fun): mods or gear that change fishing. **Dropped:** unlocking the PIER
  with a feat (Greg, 2026-11-11: not needed).
- **Gear to concept:** more gear with bonuses, even if it's only worth selling (SHARD and BOND are the first).
  Logged: ENTANGLE (link two nodes), exotic tiers of today's gear. EXOTICS.md has more. (PARADOX and DECODER moved
  to docs/DECK.md as the shell chips `undo` and `decode`.)

### 2. REP and THE BOARD
- **The plan: `docs/PROGRESSION.md`** (2026-10-28, screen mockups on a page). Much of it is built (THE BOARD, feats,
  crew, CALL gear). **Decided (Greg, 2026-11-11):** CALL rarity is fine (POPS joins on the first
  call; the other crew at 5). No questions left.
- **Today:** a run's REP = depth + 3 per corp + 1 per perfect + 1 per 40cr earned + 10 per sector cleared (`repFor`,
  engine/save.js). Cashing out banks it; dying banks nothing (DEADMAN keeps 25% / 50%).
- **Ideas logged:**
  - Levels of unlocks; finishing the codex (or beating every corp) opens new options. For the codex one: THE
    ARCHIVE (start with any mod you've found), ARCHIVIST (every corp's tell printed), an exotic pick, a cosmetic.
    **Decided (Greg, 2026-11-22):** THE ARCHIVE, LOYALTY CARD and CHROMATOPHORE built v15.36. Dropped: ARCHIVIST, because there's
    plenty that shows tells already and by ELITE you've beaten most corps. CODEX and RELIC built v15.37 (Greg: CODEX
    still helps, the corps you die on are the hard, rare ones you haven't beaten; RELIC's exotic is an extra pick, so
    it doesn't change a seed's rewards).
  - Mod storage between runs (LOCKER exists: cash out, keep 1 mod a step lower): rent per run, 1-2 mods.
  - A booster for corps you haven't beaten: moved to docs/DECK.md (the BIOS chip FRESH).
  - The starter pool, more (choose 3, one may show up at the start): moved to docs/DECK.md (the BOOT chip STARTER).
  - **Palettes unlock** by beating their corp (not built: SETTINGS offers every palette today). Big logos as unlocks.
  - Difficulty levels that add drains and pay more REP: moved to docs/DECK.md (HEAT).
  - **Feat ideas:** replay a seed and get further than before; call 2 hackers in the same layer; sell 30 PHISH; buy a
    mod back from the fence (and maybe a REP unlock: fence prices -10%). The FEAT box over the
    win page: a solid background that isn't the screen's (the REP color?).
  - **REP unlocks you can switch on and off**, and +1 corp layer: moved to docs/DECK.md (the ROM's switches, the BIOS
    chip +1 LAYER).
  - **Skip a corp's rewards for a heal:** moved to docs/DECK.md (SPOILS).

### 3. Quests and RPG elements
- **More than one quest at a time** (a quest log: a list that scrolls, the active quests, then the completed ones).
  **Decided (Greg, 2026-11-06):** wait until there's a second quest (probably the first crew quest). Until then,
  anything added to SYSTEM FAILURE shouldn't assume it's the only one.
- **The mold, more of it:** a short side quest that touches on it (the user's idea; held for now). Also: **MOLD as a
  sector event** (2026-10-30): once unlocked, it can come up as a random event in regular runs too.
- **Crew quests** (the user, 2026-11-04: a quest per crew member, some hidden): ideas in `docs/CREW_QUESTS.md` (each
  built on the crew member's counter-rival; ROOT and BRICK's unlock a crew member). To pick from.
- **Break a fellow hacker out of a corp:** one spot on the map is that corp; maybe offered after a stage, with the next
  stage built around it; you can turn it down; beating it unlocks the meta thing.
- **The call as an item** (expensive or random): more than a heal, e.g. a different level, or softening / cancelling
  the corp events. (Also: the deck's CREW jacks, docs/DECK.md.)
- **Challenge quests:** the first OMNI stage with few mods (none, or nothing above epic); carry a worthless scrap mod
  through 3 stages (BOX OF WIRES fits).
- "You thought this was a game": a REP unlock that changes the game (unlocks quests).
- **Quest items (the user, 2026-10-26):** MOUSE (an old ball mouse) and MUG (a cold coffee mug off a sysadmin's desk).
  **FLOPPY** (2026-10-27): a floppy disk gear you insert in a terminal somewhere to start a quest.
- **Hidden entrances:** a nuked / removed corp's node stays on the map and leads somewhere strange; a secret ad (or an
  ad + a mod you own) starts something (ADS.md "Secret ads"); ads you can buy from (a puppy for a quest); an emoji
  with a quest purpose.
- **The feel: FTL's quests and interactions.** Brainstorm together. **Random encounters, FTL style** (meat notes
  2026-11-06): you choose from 2 or 3 options, and you might get a reward.
- **Cutscene art:** random traces running up that aren't in the drawings; more color work; more art for the later
  frames maybe.
- **More quests** (the user, meat notes 2026-10-28):
  - **The symbol path:** you find a symbol that is a path through a network (a very simple treasure map). Go through a
    sector that way and you get a bonus, or the final node turns into a special boss. Needs a special sector map, e.g.:
    `.-.-X` / ` \.-.` / `   /` / `  .`
  - **POPS's old corp:** a quest that unlocks when you call POPS in the corp he used to work for.
  - **Safehouses need something cooler** (meat notes 2026-10-29): they keep some mods from a run you died in (that part: DECK.md's BLACK BOX), or offer
    crew CALL gear. Probably a REP unlock. Or simpler: a boosted safehouse, 2 INT and an item or two.
  - **The quest object sparkles** (meat notes 2026-10-29): a twinkle / glitter effect on it.
- **G0D:**
  - **G0D as an acronym:** **Decided (Greg, 2026-11-11):** a MEDIX lab label, batch G, generation 0 (QUESTS.md "What
    G0D is"). Still open: where the game lets that slip (a crash unit's label, a codex line, the ending's art).
  - **THE SPORE TONGUE's voice** (2026-11-11): G0D's lines growl as they type (a deep modem, engine/heaven.js). In stage
    3, when it stops speaking English, should it sound wetter and hissier? (docs/G0D_VOICE.md)
  - **The mold turned up as the quest goes on** (today: the M0LD events set it, v14.39).
  - **G0D flashing in on SECTOR CLEARED** now and then (meat notes 2026-10-29).
  - **G0D.exe** (the user, meat notes 2026-11-03): a personal AI hacker assistant, exotic gear (or a deck chip: docs/DECK.md). After you beat G0D, a
    quest to reassemble it: find the G, the 0 and the D, then put G0D together at a workshop. It knows the tells of
    every corp you've beaten more than ~5 times (feat unlocks). Activated, it plays perfectly: it knows the real nodes
    (not just tells) and clicks them for you. It stays with you from corp to corp, uses gear, goes to stores and buys,
    moves through the network, and goes for depth; it won't buy many mods unless they boost credits (for the UPLINKs).
    Maybe a limit of 256 clicks; if so it tries to get another of itself to activate; it can call crew too. (Same idea
    as "An AI crew member that plays the game" in Low priority: G0D.exe may be that one.)
    - **The dev version first** (Greg, 2026-11-08): build G0D.exe itself, given from the dev menu, to see how it plays.
      The quest to get it comes later. **Decided (Greg, 2026-11-08):** the name is G0D.exe; "beaten" means beaten
      once (the codex page is open; a setting, so it can go to ~5 later); in a corp you haven't beaten it guesses at
      random, and on the map it goes around those corps when it can.
    - **Not a cheat (Greg, 2026-11-21):** G0D.exe will be a real thing, so turning it on doesn't make a run practice.
      Today getting it (`g0dexe` in dev mode) still does; when the real way in is built, drop that too (engine/g0dexe.js g0dxSetup).
      - **The gear:** a new rarity above exotic, **DIVINE**, in G0D's red (its own chip; the gear and the cursor both
        use it). Tap it on: a card like a crew CALL's, with a portrait like the crew's (a little eye). Tap it again,
        or tap anything yourself, and it pauses.
      - **The cursor:** splits up like d0g's and b0y's. At the start of each layer G0D's cursor hovers about the board
        for about a second ("thinking"), then one of its characters flies off, hits a node and flies back. Quick.
      - **Clicks:** every tap counts (nodes, gear, the map, buy, sell). 500 to start, a dev setting; a counter on the
        gear. Speed 1x / 2x / 4x (dev setting). It uses the same functions your own taps use, so the rules hold.
      - **In a corp:** beaten: it taps the real node. Gimmick corps (SIMON, MONTY, FOSSIL, FORM 27B, DEMOLITION...)
        get an `auto` hook in their corp file (next to `dress` / `hint`): what to tap next. Find which ones need it by
        letting G0D.exe play every corp headless and listing where it gets stuck; that run becomes a check.
      - **On the map:** depth first. WARP / ROUTE / TUNNEL / SKIP to jump ahead. It works out the next UPLINK's price
        and, when short, detours to markets, caches and good-paying corps. At markets it sells loot and buys only
        things that bring in credits (and health when low). A safehouse when your health is low: ICE and damage
        still come off your health.
      - **It stops and waits for you** at cutscenes, quest cards, the run's end, no clicks left, or anything it doesn't
        know, with a line saying why. A short log line per decision (`g0d: market. uplink needs 140cr, have 60.`).
      - **Order:** 1. the gear, the card, the cursor, clicks, pause, playing corps (+ the all-corps run); 2. `auto`
        hooks for the corps that got stuck; 3. the map and money; 4. gear in corps (reveal gear in unbeaten ones);
        5. phishing, maybe.
      - [x] Steps 1 and 2 (2026-11-08, v14.60): see SPEC v14.60. The all-corps run (tools/checks/g0d_play.js) found
        LAGRANGE stuck and DEMOLITION clearing for no pay; SIMON cleared by skipping its pattern. All three have `auto`
        hooks now; all 81 corps play clean. MONTY (2 taps a layer) and FOSSIL (brushes) play right without one.
      - [x] Step 3: the map and money (2026-11-08, v14.61; SPEC v14.61). **Decided (Greg, 2026-11-08):**
        - **The map:** its cursor hovers there too, and the @ flies to the node it picks. A short line says why first
          (`g0d: market. uplink needs 140cr, have 60.`).
        - **The UPLINK:** it keeps money mods, sells the rest, and pushes on when it can pay. When it can't go any
          further, it stops with a card like the hacker card, but with why it stopped, the clicks it used and how far it
          got (sectors, corps). You close it and cash out yourself.
        - **Rewards:** money mods first, then map gear (WARP / ROUTE / TUNNEL / SKIP). Other mods: it takes epic and
          legendary ones anyway, to sell at the UPLINK (Claude's numbers: in sector 1 a legendary sells for ~40cr, an epic
          ~26cr, x the sector; credits instead pay 20cr. Rare and common: take the credits).
        - **Popups:** it skips scenes and clicks through quest and feat popups (and ads, event cards, CALL boxes), a click
          each. A setting in the code to turn that off.
        - **A corp it doesn't know in the way:** it goes in. It heals first when it's low (safehouse, PATCH), and helps
          itself in there with gear: PING, FRAG, CALLs.
        - **Its wins count** (the codex's breaches: the corps it then knows), with a setting so they don't. It's still
          your INT on the line.
        - **Safehouses and the workbench:** a safehouse when it needs healing. At a workbench it always SHREDS what it
          doesn't need; building is a setting, off to start (it would spend all your components).
        - **A full belt:** it trashes gear it can't use to make room.
      - [ ] Its face is a placeholder eye (data/art/faces.js `g0dexe`): redraw in the ART tab.
      - [ ] Still open: building at the workbench is in but barely tried. How smart its map and shopping are: tune once
        you've watched it. The real G0D.exe (the quest, not the dev menu) is the entry above.
      - [ ] **After Greg watches it** (2026-11-08: batch these with his feedback):
        - Keys don't take over: a tap of yours pauses it, but picking a node with the arrows + Enter doesn't (it would
          keep clicking under you). Make a game key pause it too.
        - Belt priorities: with the belt full of gear it uses, it throws back new catches and rewards (a WARP) instead
          of dropping a spare (the 7th CALL).
        - Quest runs untested: H3AV3N (the maze, the fight, the broken UPLINK), HAD3S, CERBERUS's digging. It should
          stop with "it doesn't know this screen"; check it does.
        - Workbench building: barely tried. Its face: a placeholder eye.
        - Tuning: the map scores, what it buys and rerolls, when it taps $ nodes, the 1s think at 1x.
      - [x] Step 4 and the rest (2026-11-08, v14.62; SPEC v14.62). **Decided (Greg, 2026-11-08):**
        - **$ nodes in corps it knows:** MAGNET whenever it has one. It taps a $ node itself only at full health, while
          the UPLINK still needs money, and never on a boss layer.
        - **Phishing:** off by default (it skips the pier). A flag turns on a "phish it all away" mode, for laughs: it
          heads for every pier and casts until it's out of clicks or credits (each pier has a cast limit, ECON.fish.casts:
          then on to the next pier).
        - **Handing back when it's risky:** a flag, off by default. On: at low INT with nothing to heal, when every way on
          the map is a corp it doesn't know, it stops with its OFFLINE card. (It reads the map's corps; the UPLINK screen
          doesn't show what's ahead, so the check is on the map.)
        - Also: TUNNEL / MESH on the map, a market reroll when it's rich.

### 4. The end game (details: docs/ENDGAME.md)
- **The ending's leftovers:** the art (placeholders to redraw); the three unlocks as already-paid posts on THE BOARD.
- **KITCHEN and ZER0** (the terminal's log in the ending) are only art today. Hide a seed or two in there that are
  real special seeds (the gauntlet, below, or fun made-up ones). **Decided (Greg, 2026-11-06):** not now; later.
- **An end game quest: from a hacking game to a hacker game** (Greg, 2026-11-06: "this and rebuilding god as a ai
  assistant i think would be interesting and take it up a notch"). After G0D, a quest that reaches outside the game:
  the PSYCHO MANTIS boss (section 7: go offline, a hidden word in the URL / tab title / console) and rebuilding G0D as
  your AI assistant (G0D.exe, section 3). Claude's thoughts, to talk through: the G, the 0 and the D (G0D.exe's pieces)
  could each be hidden that way (one in the page's URL, one in the console, one only while you're offline), and MANTIS
  guards the last one. Section 10 ("make it more of a hacking game") fits here too.
- **More boss seeds** (Greg, 2026-11-06: "i really like how the god boss turned out"; "all worth keeping around", he's
  thinking on them). Not a long quest like SYSTEM FAILURE: find a seed somewhere, two sectors of buildup, then a boss
  (like H3AV3N). Do the "per-seed definitions" cleanup (Medium and small) with the first one. Claude's ideas:
  - **TWIN:** it can only watch one window. Open the game in a second tab and hit it from behind. Hint: "i can only
    watch one of you." (The two-tab save guard it needed is built, v14.52.)
    - **How tabs talk (2026-11-07):** neither tab launches the other. Any tabs of the game in the same browser hear
      each other on a `BroadcastChannel` (engine/save.js TABS uses one). Not across browsers or a normal and a private
      window; across devices it's Firebase (multiplayer has it): a TWIN where your phone is the second window. A
      hidden tab barely runs (desktop timers ~1/s, no drawing; iOS freezes it), so each tab acts while you look at it
      and the shared state lives in the save. `window.open` isn't needed (phones block pop-ups without a tap).
      file://: Chrome lets local tabs talk, Firefox doesn't; test it.
    - **The fight:** desktop: two windows side by side, it faces the focused one, you strike from the other. Phone:
      switch tabs; the page knows you left (page visibility, SLEEPER's signal), it turns to the tab you're in, and the
      other one gets a few seconds' opening.
  - **PHREAK:** a phone phreak. It talks in keypad tones; you play them back (the Simon corp's idea). Weird-hard: it
    wants 2600 Hz, whistled or played into the mic (asks for the mic; phones too). Seed: a PIER catch, or a payphone node.
    - **The mic (Greg, 2026-11-06: analyze the frequency):** getUserMedia + an AnalyserNode (FFT ~8192 at 48 kHz: ~6 Hz a
      bin). It counts within ~±40 Hz of 2600, held ~1s, with a meter showing how close you are. 2600 is a high whistle:
      a tone app or another device counts too (that's phreaking). A way through without the mic (denied, or none): a
      keypad of the tones, harder but possible. Say on the prompt that it only measures pitch, nothing is recorded or
      sent. The mic needs a secure page (https is fine; test file://).
    - **The hint (Greg likes it):** the real 2600 trick came from a cereal box toy whistle. A made-up cereal ad: "free
      toy whistle inside!" The ad is where you find the seed.
    - More with the same pitch check: match the boss's tone to break a shield; hum its keypad tones back.
  - **The mic, more broadly** (Greg, 2026-11-06): pitch, loudness, silence and claps work offline in every browser
    (shout to break a shield, blow on the mic to clear mold, ICE that wakes at a noise, clap a rhythm). Speech to text:
    the browser's own (Web Speech API: Chrome / Edge send audio to Google / Microsoft, Safari to Apple or on device;
    needs the net; not Firefox, so a typed fallback). Fully offline: a small model in the browser (a 40-75 MB download).
    A paid service would need a server for the key (a PHP proxy on DreamHost): overkill for now. Speech to text is for
    the special moments: saying a password, talking back to G0D.exe or MANTIS.
  - **SLEEPER:** it can't see you when you close your eyes. Turn the screen off or switch apps and its guard drops
    (page visibility).
  - **CRON:** only there at a real time ("come back at 3:33"). Ties to the daily seed.
  - **OVERFLOW:** a buffer overflow. Its health counter wraps: heal it past its max and it rolls to zero. Or a long
    string typed into the seed field. (Section 10: something in the game you can hack.)
    - **The long seed (Greg, 2026-11-07):** seeds stay capped at 16 (`cleanSeed` cuts the rest), so normal seeds never
      break. OVERFLOW looks at the raw text before the cut: a `?seed=` link over 16 characters (or full of junk
      symbols) wakes him instead of being trimmed. In settings the seed box could let you type past its edge, the text
      glitching and spilling over the screen, and that wakes him too.
  - **SOURCE:** the word is in the page source / a code comment (desktop). Phones need the URL fallback (MANTIS): a
    stage of a fight, not a whole one.
  - **KONAMI:** too strong to beat, until you enter a cheat code mid-fight and the game's own dev menu opens against it.
    (Greg likes it, 2026-11-07; the dev menu as a terminal: section 10.)
  - **PHISHER:** a social engineer. It phishes you with fake prompts (session expired, enter your seed; a fake update;
    a fake CONTINUE), each with a tell (a typo, the wrong font); a fake costs you. The PHISH theme turned around.
  - **GHOST:** your own best run (REPLAYS) as a boss: it taps what you tapped; race yourself. Close to DOPPEL, at boss size.
  - **Where the seeds turn up:** the ending's log (KITCHEN, ZER0), a hidden ad, a PHISH catch, a crew call, the codex's
    ciphertext, the console. A seed could also be a code on the deck's BYTE (docs/DECK.md).
  - Claude's picks: TWIN (works everywhere, nobody expects it), OVERFLOW (pure hacker logic), PHISHER (fits the story).
    PHREAK's whistle is the weird-hard one, like going offline.
- **An H3AV3N leaderboard** (replaying it after a win works already).
- **A gauntlet seed:** one of each corp, in order, in a single line (stores / fishing off the sides, no skipping corps).
  (GAUNTLET the sector event is built: one line, no choices, one market.)
- **A daily seed** and a daily leaderboard (none today): a pinned row on LEADERBOARD > SEEDS.
- **A mod you always start with:** moved to docs/DECK.md (the BOOT chip STARTER).
- **CODEX** (the track) might be good for the credits or the cutscenes (meat notes 2026-10-31).

### 5. The map and run structure
- **Different markets** (the user, meat notes 2026-10-28): black market / grey market / open market.
  Another shop that sells only corp mods and gear, maybe dearer (meat notes 2026-11-15).
- More varied layouts: missing nodes, skip-lane links, sideways links, dead ends, other shapes per sector.
- Moving backwards / the frontier (pick any node linked to one you've visited), or allow clearing the whole map.
- Node count that keeps climbing; past the 4x4 grid (phones fit ~6 columns).
- More final bosses, each its own mechanic (OMNI is the only one).
- Long-run issues: power creep, a guaranteed heal each sector.
- **A portal node** (Greg, meat notes 2026-11-08): a sector node that takes you to a quest seed, or a portal to
  another random place or seed.
- **A pass on more store types and other non-corp map nodes** (Greg, 2026-11-21). In it:
  - **THE CHROME FORGE** (was "the fuse node"; Greg: "the forge or maybe something more hackery"): bring 2 exotic mods,
    fuse them into an exotic chip (docs/DECK.md "Mashing 2 mods together"). Maybe tied to a quest, or a custom seed.

### 6. Anomalies and sector events (design: `docs/SECTOR_EVENTS.md`)
- **Still open:** a THREAT level later; events on in sector 1 (moved to docs/DECK.md: the BIOS chip EVENTS); tying the sector boss to the
  event further (parked; it already carries the event's anomaly). Idea: ICE STORM.
- **Other ideas (Claude's):** TAXED, AUDITED, RANSOM, BACKWARDS, a trace meter.
- **Overlapping events, still open:** more scales (quests, REP level: the user, 2026-11-04, 'quests or other things can
  start to scale those values'); the editor's TESTING picking a pair; turn RAT RACE / CHEF'S CHOICE down to 3-4 after
  the d0g quest is real (today the scale keys off beating d0g as a rival).
- **Decided (Greg, 2026-11-05):** don't worry about sector event balance or tiers for now; the recent updates (stacking,
  weights, scales) should even them out.
- **New event ideas** (meat notes 2026-11-06, later):
  - **Glitching up:** each ICE hit and derez adds more glitch filter over the screen, like chroma separation.
  - **Dying moves you:** a death restarts you somewhere else.
  - **More ads** (meat notes 2026-11-15): an event that brings up more ads, for when you want them: ads that heal
    you (moved to docs/DECK.md: the BIOS chip ADWARE), or hacking ads for loot.
- **Event tiers, later** (the user, 2026-10-30: not now): harder events only deeper. For now the rule stands: sector 1
  is clean, and from sector 2 any event can show up.

### 7. New corps
- **A PSYCHO MANTIS boss** (the user, meat notes 2026-11-06; **Decided (Greg, 2026-11-06):** part of an end game quest,
  section 4): a boss that reaches outside the game: "unplug your internet", "open the inspector"? Talked through
  2026-11-06 (Greg: "i like the weird hard ones"):
  - **It reads your mind:** it knows where you'll tap (your cursor on desktop, your habits from the save), so playing
    normally can't beat it. FOURTH WALL already reads your save; this is the step past that (Mantis's port 2).
  - **Go offline:** "unplug your internet" (airplane mode on a phone). The browser sees it go offline; it loses you and
    can be beaten. Greg likes this one.
  - **A hidden word you type in** (Greg's idea for "the inspector"): the console alone won't do (phones have none, and
    browsers differ). Claude: put the word in several places at once, so every device has one: the address bar (the
    URL's #word: "look up"), the tab's title (a phone's tab switcher), and the console (a bonus for the curious on
    desktop). You type it in the seed's text field. (Copying it to the clipboard works too, but it overwrites what you
    had: probably not.)
  - Other outside tricks the browser can see: switching tabs, turning the phone, resizing, keyboard instead of a
    cursor. Fake-outs between phases: a fake crash, a fake update prompt, black with its name.
  - The trick has to be findable: after a couple of fails, a hint (b0y or POPS).
  - Open: how many phases.
- **A drug dealer corp** (the user, 2026-10-27).
- From CORPS.md, not built: UNICORN (very rare), MAGIC (stage magic), ALARMS, the chain corp, the case corp
  (upper / lower case), the stock market corp. CORPS.md marks every built corp `(built)` on its heading.
- From the old ideas list, not built: bad security (passwords that rotate: BUDGETWALL / PASSWORD123), the dating app
  (SPARKD, a catfish boss), an arms dealer (GUNMETAL), the punk corp (details to come from the user), sudoku /
  crossword. KERNEL (the seed corp) reseeding the map from its boss. THE CHOIR as a "ministry" (a per-corp word instead of "corp").
- A second boss mod for the corps that have one (71 corp mods left; 11 corps give boss gear instead, v13.62).
- **CHUCK E. CACHE has a 1UP in its logo** (meat notes 2026-11-06): do something with that once 1UPs are unlocked? **Decided (Greg, 2026-11-15):** a mod, not a deck chip.
- **RED TAPE:** a mod or gear (just the name so far). **B1BL3** (meat notes 2026-10-31): a portable codex (gear).

### 8. Achievements and cosmetics
- The feats cover the achievement list (first win, NAKED, OMNIVORE, layer 50 / 100, perfect streaks, SPEEDRUN, BIG
  SPENDER, EASY COME, G0D SLAYER, WITH A SHOE / INFIDEL), and titles and logos unlock from them. Still open:
  hats / accessories, card frames, more titles ("SIGIL BREAKER"), cosmetics bought with REP.

### 9. Lean more cyberpunk
- Cyberware in names and flavor: implants as gear, chrome on the runner card. (MEDIX CHROME CLINIC is an ad already.)
- **The city's name** (meat notes 2026-11-21, lore): base it on a Midwestern region, not the east or west coast or
  Tokyo. The rust belt. Ideas: Nokomis, P City, Grand Forks, Sioux City.

### 10. Make it more of a hacking game
- Something in the game itself you can hack, like the seed (OVERFLOW, section 4).
- **THE SHELL (was THE TERMINAL): the plan is docs/SHELL.md** (2026-11-11: the next big feature, Greg). The notes below fed it.
- **The dev menu as a one-line terminal** (Greg, meat notes 2026-11-07: "i like that hack boss idea where you open up
  the dev menu. i kinda think we might want to update the dev menu to be more like just a one line terminal that shows
  with ` and you can type in it and maybe it has auto complete"). Today ` opens the dev menu's button page
  (engine/dev.js). Instead: a one-line prompt, commands typed in, with autocomplete. It's the same terminal KONAMI
  turns against its boss, and the one the second window could hold.
  - **More on the terminal** (Greg, meat notes 2026-11-08):
    - Commands unlock as you find them, like recipes: once found, autocomplete starts offering them. Maybe tied to
      feats (ELITE), or crew quests unlock the terminal and its parts (or just reveal things about it).
    - Commands like `give mod pch` (maybe `give.mod pch`): a PATCH. `run.seed 348349`: jump to that seed.
    - `mode.god`: not god mode for good; it wears off after a sector and you run it again.
    - Hacker tokens that commands cost to run, bought with REP? An API key you can enter that does something.
    - Runs that used the terminal are marked on the leaderboard: another level, or just a flag (hacked).
    - A command to kill yourself (end the run on the spot), and maybe one to kill other hackers (a rival in the corp
      flatlines) (Greg, 2026-11-08).
- **A hacker boss whose weakness is your sound muted** (Greg, meat notes 2026-11-08). Like PSYCHO MANTIS (section 4):
  the fix is outside the game.
- **Mini-games** (Greg, meat notes 2026-11-11): like Skyrim's lockpicking, Cyberpunk's breach or BioShock's hacking.
  A short puzzle, slightly skill based. Maybe a rhythm pattern game (DDR, Guitar Hero), or a sliding tile puzzle.
  Open: where they go (a node type, a locked cache, a quest step, gear?).
- **A second window** (Greg, 2026-11-07: "a boss is neat. but we could also just open another browser window and have
  a little terminal there you could type in or all sorts of stuff"). TWIN's trick (tabs talk on a BroadcastChannel)
  for more than a boss: a second window that's a little terminal you type commands into, feeding the game. Other uses
  to think about: a second screen showing the map or a trace, a crew member "on the line" in the other window, a
  rival's window you hack into. Same limits as TWIN (same browser; a hidden tab barely runs). One terminal could do
  both: the dev-menu terminal above, popped out to its own window.

### 11. THE DECK (your own ICE)
Greg, 2026-11-15 (talk, and meat notes "workshops": "some sort of deck that you can upgrade; gems go into different
slots and give you different things; gems are like letter unlocks"). Mockups: `docs/mockups/deck.html` (round 1: bus, motherboard, tree, trace; Greg: too organized, the motherboard most interesting) and `deck_v2.html` (round 2: asymmetric, a big CPU, wide power traces).
- **The idea:** a cyber deck, outside runs (meta progression), unlocked late (around ELITE). It's your own ICE: a
  network of sockets wired together, the same kind of thing you breach in every corp. Flavour: neural cyberware.
- **Chips** (**Decided (Greg, 2026-11-15):** "chips", not gems). You slot them into the deck's sockets. Two kinds:
  - **Shell chips:** found in runs; each one gives you commands in THE SHELL. This could be SHELL step 3's answer
    for learning commands (docs/SHELL.md, "The game part").
  - **Rig chips:** REP unlocks you switch on and off (section 2's "REP unlocks you can switch on and off"): the corp
    picker (corps you haven't beaten come up more), +1 corp layer, TELL LIGHT, skip rewards for a heal, HEAT...
- **Limited sockets** make it a loadout you pick before a run, not a list of everything on. Upgrade the deck (REP) to
  open more; the wires show which socket opens next, like a skill tree. Later the wires could mean something (a chip
  powers its neighbours).
- **Finding chips:** boss rewards (each corp's fits it), caches, the fence, crew quests, hacking commands out in the
  shell. Claude's idea: a chip found in a run is only yours if you cash out (die and it's gone).
- **Extras (Claude's ideas):** a late boss or KONAMI breaches your deck and knocks a socket out for the corp. The
  "rooted" leaderboard mark only for runs that used a shell chip.
- **The screen:** full screen like the workbench. A circuit board that scrolls (**Decided (Greg, 2026-11-15)**), with
  an info area like the market's: pick a socket or chip and see what it does.
- **Naming trap:** the code already says "chip" for a letter or code's rarity colors (`chipOf`, engine/bench.js), the
  belt's gear chips and the INT row's status chips. Give the deck's its own name in code (`deckChip`?), and draw them
  so they don't look like letter tiles.
- **Meat notes (workshops), also:** "enchanting, slotting gems? adding an extra letter to mods or something?": slotting
  into mods themselves, maybe a workbench thing.
- **Open:**
  - When it unlocks: ELITE (REP level 3)? Greg said "leet".
  - Which BOARD posts become chips (NEMESIS, STARTER POOL, LOCKER, TELL LIGHT), or only new things.
  - Whether a progression wipe (`PROGRESS_EPOCH`) wipes the deck, or it stays like the codex.
  - What a chip looks like, and how the info area fits on a phone (23 rows).
- **Board v2 and the socket plan: `docs/DECK.md`** (2026-11-15): Greg's layout (`asxii_art/deck_board_v02.asxii.json`),
  every socket group named, what goes in each (5-8 more chip ideas a group, with the corps that drop them), how it
  opens, power, and Greg's decisions. The backlog ideas that fit there moved there (each old line says so).

### 12. A NetHack-style dungeon (meat notes 2026-11-15, "net hack inspiration")
- A place on the map takes you into a dungeon: sewers, tunnels, data mines ("maybe make hackery?"). Maybe it's where
  you go after you nuke a corp: its sub-basement.
- Turn based. Fog of war, or you need a light. Some sort of hacking cyber run: get in and out in a number of turns.
- A reason to go in: a quest or a boss fight.
- Controls: arrows or clicks? A mini d-pad on a phone.
- Things in it: an oracle; a Sokoban pushing game; a mimic (in the store? in the data cache?).
- **An infiltrate mission** (meat notes 2026-11-17): a stealth game: sneak past cameras and security systems. Maybe you
  can pick it instead of breaching a corp.
- **The brainstorm and 5 mockups: `docs/INFILTR8.md`** (2026-11-17), `docs/mockups/infiltr8.html`.

### 13. Other game modes (meat notes 2026-11-21)
- Other games or mini-game modes to try: a **farm sim** (farming mold for chips and loot), **tower defense**, a
  **Candy Crush** style match game, **horde mode** waves, **missile defense**. Ideas only; none picked yet.

## Low priority

- **An AI crew member that plays the game** (the user, meat notes 2026-10-31): it learns as you beat corps: beat a corp
  10 times and the AI knows its tell (it gets it right); beat all of them 10 times and you can let it run. It doesn't
  use markets, but takes what lets it go deeper faster: SKIP, WARP, money boosters to get through the UPLINKs. You
  bring it in with an exotic CALL item. Names: ZEUS? APOLLO? (Maybe the same thing as G0D.exe, section 3.)

### Enemy and ally hackers (low: the user 2026-10-29, "we don't need any more"; the lore was great)
- **Still open:** per-hacker emotes (only GG_EZ and HYPE have them); multiplayer on the new cursor; more hackers (RTFM: its line is not "real
  time fun machine"; names from the user's notes: **s3iz**, **alpha haxor**, **kupreg**, **circo 77**, **Doctor kitten
  face**); balance from play. Using a crew member's logo (as yours) makes their calls less rare.
- **Dying to a rival** (meat notes 2026-10-28): better sounds on that screen (their logo over your death): a wah-wah,
  but more jingly, bad-news sounding.
- **Allies, more:** give crew mods, tie them to your history with that hacker. Mods on good hackers. (Crew LVL 2 posts
  are built: POPS's is TRACER.)

## Polish (the user, 2026-10-29: the finishing passes)
- **Playtest clock (later, if the `TIMING` list gets in the way):** tools/checks/playtest.js ignores hint changes for
  the corps in `TIMING` (LIFTCO, SQUALOR, STREAMFLIX...), because their hints run on the real clock. To check those
  too, fake the page's whole clock (`performance.now`, `Date`, `Math.random`, animation frames). A fixed `now` alone
  isn't enough: they compare it to timestamps saved when the layer appeared (`lv.shownAt`). The playtest's own waits
  run on that clock too, so it's a real job.
  - [x] FOURTH WALL's flake (2026-11-21): it wasn't `save.habits` (a fresh save picks the zone by seed). Its hint
    switches between its tell and chat lines on the clock, and the chat has a random mod and the real time. The
    playtest gives it a fixed time now (`FIXED_NOW`), so it always records its tell.
- **BACK / LEAVE / CLOSE, made consistent** (meat notes 2026-11-21: "we're kind of inconsistent with back and leave
  buttons. both in the titles and their positioning"). Today:
  - **[LEAVE] top right, in the header:** the WORKBENCH, YOUR DECK, a race (MP).
  - **[ LEAVE ] at the bottom:** a market, THE FENCE, the PIER (bottom right), the MP lobby and results.
  - **[ BACK ] at the bottom:** the codex, the help, the leaderboard, settings, run history, THE BOARD, the MP join
    screen, the end screen (HAD3S).
  - **[ CLOSE ]:** the FEAT box, the LOOT bag. **[ JACK OUT ]:** a market that's HEAD FIRST's exit.
  - Claude's proposal: LEAVE = leave a place in a run (back to the map); BACK = up a menu (to the title, or the screen
    before); CLOSE = an overlay over what you were doing. And one spot for each: full screens with a header (the bench,
    the deck) put it top right; everything else at the bottom. Greg's call.
  - **Greg (2026-11-21):** name it for where it goes: every [ BACK ] that went to the title is **[ TITLE ]** now (v15.17;
    the leaderboard's still says [ ALL SEEDS ] in a seed). YOUR DECK: done v15.16 (THE BOARD's tabs on it, no [LEAVE]).
    **Decided (Greg, 2026-11-21):** LEAVE and CLOSE are different things and stay that way. LEAVE takes you out of a place
    in a run (back to the map); CLOSE shuts a popup over what you were doing.
  - **Decided (Greg, 2026-11-21): top left is the way out.** Step 1 built v15.19: every full-screen menu out of a run
    (THE BOARD and its deck, codex, help, settings, history, leaderboard, the race join and info screens) has
    `[< TITLE]` top left (openPanel opts.top; the leaderboard's says `[< ALL SEEDS]` in a seed), and the bottom one is
    gone. The end screen keeps its button with the others (Greg). In a run, top left stays NeoN+1, the menu.
  - **Step 2 built v15.21:** LEAVE top right on NeoN+1's line: the market (or HEAD FIRST's JACK OUT), THE FENCE, the PIER,
    the bench (openPanel opts.leave; engine/scene.js). CLOSE stays with its popup; cutscenes' SKIP is top right already.
    Multiplayer: later, with its overhaul.
- **Phone battery** (meat notes 2026-11-15): the game drains Greg's older phone fast. Look for savings: draw only
  when something changed, a lower frame rate when the screen is still, pause it all in a hidden tab, lighter effects.
- **Boss intro pass** (the user, 2026-10-29: "it's all working for now", but the whole boss intro could use a little more): the corp's logo on it, and more.
- **INTRO PASS:** after the user has lived with it. The intro keeps playing every time; the NEWB / LEET screen only on
  a truly fresh start (maybe a URL switch keeps it all, for testing; `INTRO_ALWAYS` in engine/intro.js). Glitch /
  animation effects on the title card (noise in the log, the map drawing in with static, a burst on handshake, the
  logo decoding in). The title card art round (the user is trying things in asXii first; the old lettering samples:
  `docs/art/logotype_round4.png`, `logotype_n1.png`, `logotype_round5.png`, text in NAMES.md; the title switching
  between the face and the lettering). Your profile shuffling as you log in. The maps more animated (the user,
  2026-10-27): the white path lines light up, or each continent lights up with brighter white borders.
- **Mold on the title** (Greg, 2026-11-09, someday, a nice detail): G0D's mold as an extra faint background layer behind the
  face, or a subtle noise effect over the top. (The mold's looks: engine/fx.js; the mold wipe: engine/effects.js `wipeMold`.)
- **G0D's eyes, here and there** (Greg, 2026-11-09; grows QUESTS.md's "the mold creeps over things now and then, a hint
  before anyone names it"). **Built v14.70:** the effect (`eyes`, engine/fx.js; on the title for now, only on blank cells)
  and the eyes transition (`eyewipe`, engine/effects.js; the editor's G0D tab triggers it). Still open:
  - **Decided (Greg, 2026-11-09):** 15% of transitions get G0D (v14.73: `eyewipe.chance`; not in the intro or the training).
  - Where else the eyes go (the map, menus, the death screen). Maybe more of them, or a bigger chance, as the quest goes on.
  - Tune by eye (the FX tab): how often, how many big ones, how heavy the letters are at full.
- **Sector event cards:** the user's art for the 14 card pictures (5 x 3 placeholders in data/events.js). (Still wanted: "update art for sector events", meat notes 2026-11-06.)
- **COPY PASS (text):** a terminology pass on the whole game, to lock the terms down. Settled so far (the user, 2026-10-29):
  **going deeper** = moving on through the sectors (the UPLINK says it; push on, next sector... say it this way). The INFO page, the training (POPS's lines), the mod and gear descriptions, and the ~180
  "integrity" mentions (the header says INT; INT everywhere, or only where space is tight). **Ad copy** (meat notes
  2026-11-06): "you are the product!"
- **Codex and menus pass** (with HOW TO PLAY):
  - **Corp tells get cut off in the codex** (found 2026-11-21; talk about it later): a corp's page shows 3 lines of its tell
    (engine/codex.js, pad(..., 3)) and 73 of the 81 tells wrap longer (4-6 most; FOSSIL 12, UPSIDE 10, BLACKOUT 9).
    Ways: the details box grows to fit and the list takes what's left (Claude's pick, like the end screen's map); the
    lines take turns in 3-line pages (FX.swapLines); tap the tell to read it whole; or shorter tells (a copy pass).
  - **HOW TO PLAY pass:** touch it up (corps and tells on THE BASICS; gestures, exotics, ads, run resume).
  - **Keyword highlighting in text** (started v13.75 on HOW TO PLAY > THE BASICS: ICE, INT, credits; next the other HOW TO PLAY pages and the codex, the user's aim: neater): ICE in red, credits in money, mod names in their rarity...
- **The training sim** may need a little redesign (meat notes 2026-11-06).
- **PHONE PASS:** (the user, 2026-10-31, as a home-screen app on an older, smaller iPhone: it works, but everything feels small; the text size is set by the widest screens fitting the width) bigger, roomier buttons (the tray, lists; ~44px); more room for long text (codex, mod
  descriptions, detail boxes, the clash screen); the swap screen's row spacing; the spacing / copy on the pick
  screens; the header menu button right-aligned?; the palette warnings (40 palettes; MOCHI MOCHI is hard to read,
  the user will probably change it).
- **A juice / graphics pass:** Unicode shading and shapes, kaomoji, bigger mini-art for mods in detail boxes.
- **Effects on the beat** (the user, 2026-10-27): effects that land on the music's beat; subtle. (The beat clock is
  there: `Music.beat`; the pet dances to it and SIMON plays on it.)

## Medium and small
- **Talk about the test run's speed** (Greg, 2026-11-22: "no need to change it yet, talk about it later"). How
  `node tools/test.js` runs now: data round-trips, then check.js, then the 39 test pages (all at once, a Chrome each),
  then the playtest (split over several Chromes). Ideas: time each stage; start check.js, the pages and the playtest
  together (they don't depend on each other); a pool of 16-24 pages instead of all 39 at once (32 threads here).
- **Pets you can toggle** (meat notes 2026-11-07): a small button in the loot bar, like b0y's on the left (if b0y's
  is there, shift it right so they don't overlap), that turns a pet on or off. Today it's one pet a run: COMPANION, the
  EGG's chick, STRAY's bug and CATPHISH's fish don't stack (with STRAY and CATPHISH, the seed picks one). Maybe they
  can all be out at once, each with its own toggle ([p] [f]... by name). Open: how several pets behave together.
- **If the C.A.R. confuses** (Greg, 2026-11-07: "i think it'll be fine", keep it as a potential fix): with the C.A.R.
  every node in the sector looks reachable, so the map doesn't show which moves are a drive. Fix if it comes up: draw the
  drive-only nodes differently (dimmer, or a little car mark).
- **Bugs** (Greg, meat notes 2026-11-08):
  - [ ] **tests/g0dexe.js is flaky** (Claude, 2026-11-08): about 1 run in 3 of the full `node tools/test.js --quick`
    it fails at a different step ("stuck: leave mode=play", the hand-off card); alone it passes. Its waits are probably
    too tight when the suite's Chromes run side by side.
- **The neon editor** (meat notes 2026-11-06): clean up the UI; terminal-style commands with autocomplete? (Justin's
  music viewer is in: the music tab's piano roll.)
  - **Dev menu buttons the editor's TESTING doesn't have yet** (Greg, 2026-11-08: "add that and maybe anything else
    useful to the editor as buttons as well"). The editor has god, show real, free travel, credits, INT, heal, REP and
    the screen jumps already. Each one below is in the game's dev menu (engine/dev.js) already, so it's wiring it to
    the editor (engine/editor.js TEST + tools/editor/testing.js). Missing:
    - **UNLOCK CODEX:** every corp breached once, everything seen (dev.js `seenall`). With it, a **FORGET CORPS** button
      (every corp back to 0 breaches; not in the dev menu either), and maybe a breaches number, to test G0D.exe knowing and guessing.
    - **G0D.exe:** its settings (speed, clicks, wins before it knows a corp, popups, its wins count, workbench build,
      phish, risky hand-off), on/off, and its decision log (run.g0dx.log) shown in the editor while it plays.
    - **RESET LEGACY** (THE BOARD's unlocks only: the editor's "wipe progression" resets everything) and **FILL GEAR**
      (one of every gear).
    - The corp tester's **RUN: ALL <corp>** and **RUN: DEV1** seeds, if the editor's own breach doesn't cover them.
    - **Intro replays** (first boot / short) and the stats **TESTER** toggle, if they're worth a button there.
- **Meat notes 2026-11-12** (Greg):
  - [x] **SIMON: the first-win text is too long, and the intro text is too wide for the screen.** (Done 2026-11-12, v14.88.) The first win shows
    `CORP_TELL.simon` (corps/simon.js; the FIRST BREACH box, engine/panels.js): 450 characters, second only to MONTY's (475). The wide
    intro text is probably its pattern line on the terminal (`> simon: g-X-(x)-g...`): the boss plays 6 steps plus
    the white ones in brackets. Check both on a phone.
  - [x] **SIMON's boss is hard: save the white blinks for deeper.** (Done v14.88: tier 3+ bosses.) "i like it but maybe we save the white blinks for
    deeper areas." Today every SIMON boss gets them (corps/simon.js `simonSeq`, "a few extra steps SIMON didn't say").
    Maybe: none in sector 1, from sector 2 or 3 on. `bossDesc` ("the white ones don't count") and the tell change with it.
  - [x] **b0y's cursors cover the glyphs.** (Done v14.88.) When he splits over the maybes, his cursor and its "b0y" tag sit on the
    nodes and hide their glyphs. Greg: keep just one letter each (b, 0, y) next to its v arrow. (engine/hackers.js:
    the split cursors in buildHackers, drawHkCursor / drawHkPoint.)
  - [x] **MONTE and MONTY sound alike.** (Done v14.88: MONTE is SH3LL for now, Greg: "maybe we change it later".) MONTE (MT4, the cups) and MONTY (MY3, the doors). Rename MONTE: "shell" fits
    (the shell game) but THE SHELL is the dev console now. Ideas wanted. (A rename touches corps/monte.js, its logo,
    palette `c_monte`, its codex and save stats keys: keep the key `monte`, change only the name.)
  - [x] **The WORKBENCH LOCKER: equipping a mod you already have.** (Done v14.88.) Say it's an upgrade ("SNIPE -> rare"), and a little
    fanfare when you slot something from the locker, more for a higher rarity. (engine/bench.js `benchTake`: today it
    says "took X out of the locker" and plays the buy sound.)
  - [x] **Done v14.89 (2026-11-12).** **Decided (Greg, 2026-11-12):** the life slot (INT / ROT / LIFE) always shows on row 2's right; past 10 max INT it's `n/max` (Dropped: `#` for 1 and a block for 5, because missing health in chunks of 5 was hard to read), red at 3; FW, 1UP and COIN FLIP's `$xN` are 3-character chips one space left of it, taking turns, swapping a character at a time; FW in hex, stops at F; SNIPE gets no mark; BLOOD MONEY's `hit-n` goes into its tip; the sector leaves row 3. Not done: a fold animation when the bar turns into n/max (offered as optional). Spec: SPEC v14.89. The notes it started from:
  - **The INT row gets crowded.** First make the list of everything that shows on header rows 2-3, then decide how
    to manage it. Greg: keep INT where it is and let the other things take turns or scroll in one area (FX.swapLines /
    FX.ticker). What's there today (engine/scene.js buildScene's header):
    - Row 2, left: LAYER nn, S n. Right: the INT bar (`#`s up to 10 max, `n/max` past it), FW n / FW* (FIREWALL, a
      corp's WALL), 1UP (charged). In place of INT: ZOMBIE's ROT nnn/max, or BLOOD MONEY's LIFE nnncr with hit-n.
    - Row 3: where you are (the corp and its progress, BOSS, the screen's title), CR n (LEVERAGE: n/limit in red), COIN
      FLIP's xN.
    - Greg also named SNIPE; it isn't drawn on these rows in the code. Check where it shows when it's live.
- **Code cleanups left from the arch pass** (the user, 2026-11-05: "keep those all around so we can hit them when it makes sense"). Do each one with the feature that needs it, not on its own. Details: docs/ARCHITECTURE.md.
  - **One popup card (`drawCard`):** with the next new kind of popup.
  - **Per-seed definitions:** when a new seed comes in (crew quests), so HAD3S / H3AV3N / the next one are mostly data.
- **Lock HAD3S and H3AV3N down** (Greg, 2026-11-15: "those should be curated"): no weighting in any of their sectors.
  Today NEMESIS changes their corps: HAD3S's corps (all but MYCONET, CERBERUS, MEDIX) and H3AV3N's sector 1 go through
  the weighted `pickCorps` in `addSector` (engine/map.js); heaven's own sector doesn't. Fix: no boost when
  `questSeed(seed)` is set. Play both through after. (docs/DECK.md "Seeds")
  - **`say()`, one way for characters to talk:** when crew quests add more voices.
  - **The `MODES` registry:** with the next new screen mode, or if input bugs keep coming from pointerdown's early returns.
  - **Hover / keyboard focus in popups:** with a desktop or accessibility pass.
- **Hacker logo pass** (the user, 2026-11-04, looking at them now): the game always adds the name under a logo (logoBlock: mark + name; the hacker card's NAME // RIVAL line), so logos don't need the name in their art: 24 x 7 is all picture. 11 hacker logos still spell their name in the art and show it twice: pops, hcf, brick, null, nana, dialup, baud, mother, root, kludge, hype (iceman, turbo, sysop, vulture, phish and leech are redrawn). Redraw them (art only, no code).
- **asXii size presets** (the user, 2026-11-04; asXii's own repo now: move this to its list): update asXii's Presets list (public/index.html #sizePreset) to the game's real art sizes, and check the ones there. Today it has: node glyph 5 x 3 (right), corp art 24 x 12 (wrong: corp intro art is the logo, 24 x 7), ad box 30 x 18 (right: ADS_W / ADS_H), intro map 34 x 9 (the map is 34 x 12 now), title art 32 x 20 (check: TITLE_W is 31), terminal 80 x 24. Add: logo 24 x 7 (the name goes on row 8, LOGO_W / LOGO_H), hacker face 5 x 3, SECTOR CLEARED 30 x 13, sector event card 5 x 3, cutscene 36 wide (any height; the game's grid). asXii is Justin's too: check his recent commits first.
- **FORGERY's partner:** a rare mod that turns $ nodes into exotic mod nodes (open: what one costs to open). Or a GLYPH chip (docs/DECK.md).
- **Ads that do things** (later, the user 2026-10-28; the fake ads are done and great): an ad that sells you gear or a mod; a free trial of a corp's mod; AD BLOCKER.
- (fine as is, the user 2026-10-29) A REROLL in a market with COUPON adds another free option. Epic FIREWALL with FAILSAFE: "no hits this corp", working. BLOOD MONEY's repair glitch (a repair pays a little in the early sectors) stays: "if someone wants to they should be able to". BLOOD MONEY scaling: fine as is.
- (dropped, the user 2026-10-28: fine for now) Boss rewards by difficulty; showing corp difficulty in game; the tell balance pass.

## Deploy and release (later: a browser-testing pass opens these)
- **Browser back = BACK** on menu pages (the user, 2026-10-29: it only came up once; a can of worms for that pass) (and ask before leaving a run or a room).
- **Going public:** drop the page's `noindex`; maybe the game's own domain.

## Parked (later, when the user says)
- **THE DEAL** (a mod, parked 2026-11-07 when MONTY's prize became the C.A.R. / GOAT): once a layer, after your first ICE hit,
  every node goes dark but the real one and one other. A good fit for another game-show corp.
- **G0D comes out of its own logo** (parked, Greg 2026-11-07: "it's pretty nice as it is right now"; Greg, 2026-11-05:
  "god could have popped out of his own logo for the final stand"): its logo (v14.43) up first in the final stand,
  then the eye tears out of the triangle.
- **Not sure yet** (the user, 2026-10-29): **A general popup over a node:** pull COIN FLIP's hold / drag box into one shared piece (`nodePopup`). **Flipped characters:** MIRRORLINE's glyphs flip with its mirror; a backwards mod.
- **MULTIPLAYER: shelved** (it works and stays in; finish the core game first). Later: maybe p5.party instead of
  Firebase; co-op (NeoN+m, Keep Talking style); a roulette mode.
- **Music:** the engine pass and fewer, better tracks: docs/MUSIC.md.
- **BOOTLEG** (Greg, 2026-11-21: "good for something later"): a name to use. It was up for the ripped chips (a
  pirated copy fits the fence), but RIPPED won.
- **Analytics:** the play stats are collected (greglytics); reading them (which corps beat people, what gets bought).

## Parked mod ideas (the user, 2026-10-26: "we have enough mods for now")
- **DELUX** (probably exotic; the user, 2026-10-31: parked): gives you a random set of mods.
- **Item stacks become health** (probably an exotic mod; parked 2026-10-31): your gear stacks count as integrity.
- **Name ideas** (the user's notes, 2026-10-31: "brain dumps of words that might be good mods or gear"): MIMIC, NEON, SCAM, MERCH.
Where they are, for when mods open up again:
- **CLUSTER** (the user, 2026-10-26): a mod name to build something around; no idea for it yet.
- **A random gear every corp** (the user, 2026-10-27): a mod that gives you a new random loot gear at each corp's start.
- CORPS.md "Notes": open map, THROTTLE (cheaper uplink), DIGIPET's pet on screen.
- ECONOMY.md: chained perfects, items as a store of value. (TIME IS MONEY is a sector event now.)
- EXOTICS.md: "New exotic ideas, 2026-10-25".
- The archive (`docs/archive/SPEC_backlog_2026-10.md`): random gear on perfects, better drops (10-20% one step up),
  a bigger VIRUS / CHAINLOCK, a glyph mod, TRUTH METER, dummy ICE, scans as patterns, OVERCLOCK's row-flash
  variant, HYDRA counters, recon stops, puzzle on ICE.
