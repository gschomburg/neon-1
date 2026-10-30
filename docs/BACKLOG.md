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
  the editor's LOOT dropdown. Still open from that talk:
  - (Claude) **Same item, any tier, one slot:** a PATCH stack holds common and rare, the best used first. (Not decided.)
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

### 4. The end game (its own section, the user 2026-10-30; details: docs/ENDGAME.md)
- **The ending:** cutscene, credits + thanks for playing, "there is more to explore", then the reward as a free REP
  unlock.
- **Seeds for real:** replaying a seed counts (not practice), maybe on its own leaderboard (scores need the seed).
- **The 1UP:** hold one, refills each sector, a CONTINUE back to the corp's start (same layers: the seed is the seed),
  fewer used = tie breaker, tracked. Any run.
- **REPLAYS on the title:** your best 10 seeds + the 5 most recent.
- **Replay H3AV3N** after winning (maybe its own leaderboard).
- **A gauntlet seed:** one of each corp, in order, in a single line (stores / fishing off the sides, no skipping corps).
- **More rewards?** A mod you always start with (meat notes 2026-10-29).

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
- **MOLD, a sector event** (the user, 2026-10-30): explains the mold in heaven (docs/QUESTS.md, step 11); once
  unlocked, it can come up as a random event in regular runs too.
- **Event tiers, later** (the user, 2026-10-30: not now): harder events only deeper. For now the rule stands: sector 1
  is clean, and from sector 2 any event can show up.
- **d0g from sector 2** (the user, 2026-10-30): a RIVAL anomaly brings in any of the hackers, d0g too, from the first
  sector that has events (sector 2). Today hkRivalFor (engine/hackers.js) keeps d0g out until sector 3 (`sector >= 2`,
  0-based): drop that. (And once he's b0y on your crew, he's out of the pool: docs/QUESTS.md step 8.)

### 7. New corps
- From CORPS.md, not built: FOSSIL (a dig site), UNICORN (very rare), MAGIC (stage magic), ALARMS, the chain corp,
  the case corp (upper / lower case), the stock market corp.
- From the old ideas list, not built: bad security (passwords that rotate: BUDGETWALL / PASSWORD123), the dating app (SPARKD, a catfish
  boss), an arms dealer (GUNMETAL), the punk corp (details to come from the user), sudoku / crossword, the seed corp
  (uses or changes the run seed). THE CHOIR as a "ministry" (a per-corp word instead of "corp").
- A second boss mod for the corps that have one (71 corp mods left; 11 corps give boss gear instead, v13.62).
- **A drug dealer corp** (the user, 2026-10-27).
- CORPS.md marks every built corp `(built)` on its heading.

### 8. Achievements and cosmetics
- First win, a naked (0 mod) win, beat each corp, perfect streaks, reach layer X; easy ones too (die on the first
  corp, spend 1000cr, earn 1000cr then get back to 0); beat G0D at the top.
- Unlock cosmetics: logos, hats / accessories, card frames, titles ("SIGIL BREAKER"). Some bought with REP.

### 9. The encrypted codex
- Unfound entries show scrambled text that decrypts (as you beat corps, or over time) instead of "???".

### 10. Lean more cyberpunk
- Cyberware in names and flavor (implants as gear, MEDIX as a chrome clinic, chrome on the runner card), the ads.

### 11. Make it more of a hacking game
- Something in the game itself you can hack, like the seed.

## Low priority

### Enemy and ally hackers (low: the user 2026-10-29, "we don't need any more"; the lore was great) (built v13.67: rivals, crew, CALL gear; see docs/PROGRESSION.md step 3)
- **Still open:** special per-hacker emotes; multiplayer on the new cursor; more hackers (RTFM);
  COMPANION's pet; balance from play.
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
  The music going from the NEON screen to the title needs a different transition (the user, meat notes 2026-10-29).
- **Sector event cards:** the user's art for the 14 card pictures (5 x 3 placeholders in data/events.js).
- **COPY PASS (text):** a terminology pass on the whole game, to lock the terms down. Settled so far (the user, 2026-10-29):
  **going deeper** = moving on through the sectors (the UPLINK says it; push on, next sector... say it this way). The INFO page, the training (POPS's lines), the mod and gear descriptions, and the ~180
  "integrity" mentions (the header says INT; INT everywhere, or only where space is tight).
- **Codex and menus pass** (with HOW TO PLAY):
  - **HOW TO PLAY pass:** touch it up (corps and tells on THE BASICS; gestures, exotics, ads, run resume).
  - **Keyword highlighting in text** (started v13.75 on HOW TO PLAY > THE BASICS: ICE, INT, credits; next the other HOW TO PLAY pages and the codex, the user's aim: neater): ICE in red, credits in money, mod names in their rarity...
- **PHONE PASS:** bigger, roomier buttons (the tray, lists; ~44px); more room for long text (codex, mod
  descriptions, detail boxes, the clash screen); the swap screen's row spacing; the spacing / copy on the pick
  screens; the header menu button right-aligned?; the palette warnings (40 palettes; MOCHI MOCHI is hard to read,
  the user will probably change it).
- **A juice / graphics pass:** Unicode shading and shapes, kaomoji, bigger mini-art for mods in detail boxes.

## Medium and small
- **The seed decides the layers, always** (the user, 2026-10-30): resuming a run (closed the browser) stops rerolling the
  layers (drop the run.resumes salt in genLayer and the fcst / skip rolls). Also put on the seed: which crew answers a
  plain CALL, OVERCLOCK's purges, the clock-runs-out tap (Math.random today). Rivals' moves stay random (real-time).
- **Tells, intel** (the user, meat notes 2026-10-29; FIRST BREACH built v13.81 shows the tell the first time): open: some way to know if a tell is right (what that means: ask the user).
- (fine as is, the user 2026-10-29) A REROLL in a market with COUPON adds another free option. Cold Brew's boss reward
  is the REWIND x2 epic stack, not boss loot (checked). Epic FIREWALL with FAILSAFE: "no hits this corp", working. BLOOD MONEY's repair glitch (a repair pays a little in the early sectors) stays: "if someone wants to they should be able to". BLOOD MONEY scaling: fine as is (the user 2026-10-29: "i still ran out of cash and couldn't get past the uplink"); it already scales by sector and BLACK ICE costs that many hits.
- (dropped, the user 2026-10-28: fine for now) Boss rewards by difficulty; showing corp difficulty in game; the tell balance pass.
- **COUPON -> COUPON CUTTER?** (the user, 2026-10-27): maybe rename MEGAMART's mod.
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
Where they are, for when mods open up again:
- **CLUSTER** (the user, 2026-10-26): a mod name to build something around; no idea for it yet.
- **A random gear every corp** (the user, 2026-10-27): a mod that gives you a new random loot gear at each corp's start.
- CORPS.md "Notes": open map, THROTTLE (cheaper uplink), DIGIPET's pet on screen.
- ECONOMY.md: chained perfects, TIME IS MONEY, items as a store of value.
- EXOTICS.md: "New exotic ideas, 2026-10-25".
- The archive (`docs/archive/SPEC_backlog_2026-10.md`): random gear on perfects, better drops (10-20% one step up),
  a bigger VIRUS / CHAINLOCK, a glyph mod, TRUTH METER, dummy ICE, scans as patterns, OVERCLOCK's row-flash
  variant, HYDRA counters, recon stops, puzzle on ICE.
