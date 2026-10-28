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

### 1. REP and THE BOARD (a talk first: what REP is for, how it feels over many runs)
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
  - **Unlock G0D** through REP, then a quest to beat it (the top achievement).
  - **Boss loot in markets** (the user, 2026-10-27): a chance for a boss's own mods and gear (FLARE, BEES...) to show
    up in black markets (tie it to REP).
  - **Better drops** (the user, 2026-10-26): a BOARD unlock that raises the rarity of drops (gear steps, e.g. FRAG's
    legendary) and mods: both in one unlock, or two separate unlocks (gear / mods). Same idea as the parked "better drops" mod (10-20% one step up).

### 2. Quests and RPG elements
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

### 3. Anomalies and sector events (named 2026-10-26)
- **Built v13.54** (design: `docs/SECTOR_EVENTS.md`): 14 sector events, the SECTOR EVENT card, BLINDERS, THE FENCE,
  the editor's TESTING tab (SPEC version log).
- **Built v13.55:** the codex SECTORS tab.
- **Still open:** the user's art for the 14 card pictures (5 x 3 placeholders
  in data/events.js); a THREAT level later; a REP option to turn events on in sector 1; tying the sector boss to the
  event (parked).
- **Next batch (the user, 2026-10-27)** (docs/SECTOR_EVENTS.md "The next batch"): built v13.58: GRIND, BLACK ICE + COLD SNAP,
  RIGHT ANGLES, GAUNTLET; v13.59: EENY MEENY (3 bosses); v13.60: HEAD FIRST. Idea: ICE STORM.
- **Other ideas (Claude's):** TAXED, AUDITED, RANSOM, BACKWARDS, a trace meter, two events stacked.

### 4. Enemy and ally hackers (about 10% there: RIVAL)
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
- **COMPANION's pet on screen** (the user, 2026-10-27): BYTEPETS' mod gets a little animated pet that is on screen
  much of the time, and you can pet it. No change to what it does. Look at it with the hackers (they're almost pets).

### 5. Scrap mods and new gear
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

### 6. The map and run structure
- More varied layouts: missing nodes, skip-lane links, sideways links, dead ends, other shapes per sector.
- Moving backwards / the frontier (pick any node linked to one you've visited), or allow clearing the whole map.
  An "open map" mod (the aimed WARP is built: epic WARP, v13.52).
- Node count that keeps climbing; past the 4x4 grid (phones fit ~6 columns).
- More final bosses, each its own mechanic (OMNI is the only one).
- Long-run issues: power creep, a guaranteed heal each sector.

### 7. Achievements and cosmetics
- First win, a naked (0 mod) win, beat each corp, perfect streaks, reach layer X; easy ones too (die on the first
  corp, spend 1000cr, earn 1000cr then get back to 0); beat G0D at the top.
- Unlock cosmetics: logos, hats / accessories, card frames, titles ("SIGIL BREAKER"). Some bought with REP.

### 8. The encrypted codex
- Unfound entries show scrambled text that decrypts (as you beat corps, or over time) instead of "???".

### 9. New corps
- From CORPS.md, not built: FOSSIL (a dig site), UNICORN (very rare), MAGIC (stage magic), ALARMS, the chain corp,
  the case corp (upper / lower case), the stock market corp.
- From the old ideas list, not built: bad security (passwords that rotate: BUDGETWALL / PASSWORD123), the dating app (SPARKD, a catfish
  boss), an arms dealer (GUNMETAL), the punk corp (details to come from the user), sudoku / crossword, the seed corp
  (uses or changes the run seed). THE CHOIR as a "ministry" (a per-corp word instead of "corp").
- A second boss mod for the corps that have one (71 corp mods left; 11 corps give boss gear instead, v13.62).
- **A drug dealer corp** (the user, 2026-10-27).
- CORPS.md marks every built corp `(built)` on its heading.

### 10. Lean more cyberpunk
- Cyberware in names and flavor (implants as gear, MEDIX as a chrome clinic, chrome on the runner card), the ads.

### 11. Make it more of a hacking game
- Something in the game itself you can hack, like the seed.

## Medium and small
- **BLOOD MONEY scaling** (the user, 2026-10-27): its hit cost in credits should scale like the rest of the economy (ECONOMY tab), though credits have no cap the way INT does. And new things that rewrite INT need a BLOOD MONEY rule: BLACK ICE (down to 1 INT) would cost the credits for that many hits.
- **Boss rewards by difficulty:** a corp's boss mod should match how hard it is (a pass over all 78 corps; settles
  weak ones like EZPASS). The user's read of the corp mods (2026-10-27): all fine; none too strong low or too weak
  high; a lot of overlap in what they do; the high-level ones are more novel (HEAT VISION, STETHOSCOPE), which is good. With it: show corp difficulty in game (`DIFF ###--`), the tell balance pass
  (`tools/tell_odds.js`).
- **COUPON -> COUPON CUTTER?** (the user, 2026-10-27): maybe rename MEGAMART's mod.
- **Effects on the beat** (the user, 2026-10-27): effects that land on the music's beat; subtle.
- **A general popup over a node:** pull COIN FLIP's hold / drag box into one shared piece (`nodePopup`).
- **FORGERY's partner:** a rare mod that turns $ nodes into exotic mod nodes (open: what one costs to open).
- **10 more glyphs** (22 to 32), with names and lore; re-save the check baseline after.
- **More fake ads** (the user: the two built are good). Ad mods: a free trial of a corp's mod, AD BLOCKER.
- **A daily seed** and a daily leaderboard (none today).
- **The corp's logo on the boss intro.**
- **Keyword highlighting in text:** ICE in red, credits in money, mod names in their rarity...
- **Browser back = BACK** on menu pages (and ask before leaving a run or a room).
- **Flipped characters:** MIRRORLINE's glyphs flip with its mirror; a backwards mod.
- **Faces in the art catalog** (POPS's face and the coming NPCs, with the asXii round trip).
- **A juice / graphics pass:** Unicode shading and shapes, kaomoji, bigger mini-art for mods in detail boxes.
- **Going public:** drop the page's `noindex`; maybe the game's own domain.

## Parked passes (later, when the user says)
- **INTRO PASS:** after the user has lived with it. The intro keeps playing every time; the NEWB / LEET screen only on
  a truly fresh start (maybe a URL switch keeps it all, for testing; `INTRO_ALWAYS` in engine/intro.js). Glitch /
  animation effects on the title card (noise in the log, the map drawing in with static, a burst on handshake, the
  logo decoding in). The title card art round (the user is trying things in asXii first; the old lettering samples:
  `docs/art/logotype_round4.png`, `logotype_n1.png`, `logotype_round5.png`, text in NAMES.md; the title switching
  between the face and the lettering). Your profile shuffling as you log in. The maps more animated (the user,
  2026-10-27): the white path lines light up, or each continent lights up with brighter white borders.
- **PHONE PASS:** bigger, roomier buttons (the tray, lists; ~44px); more room for long text (codex, mod
  descriptions, detail boxes, the clash screen); the swap screen's row spacing; the spacing / copy on the pick
  screens; the header menu button right-aligned?; the palette warnings (40 palettes; MOCHI MOCHI is hard to read,
  the user will probably change it).
- **COPY PASS (text):** the INFO page, the training (POPS's lines), the mod and gear descriptions, and the ~180
  "integrity" mentions (the header says INT; INT everywhere, or only where space is tight).
- **HOW TO PLAY pass:** touch it up (corps and tells on THE BASICS; gestures, exotics, ads, run resume).
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
