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
- **Hidden entrances:** a nuked / removed corp's node stays on the map and leads somewhere strange; a secret ad (or an
  ad + a mod you own) starts something (ADS.md "Secret ads"); ads you can buy from (a puppy for a quest); an emoji
  with a quest purpose.
- **The feel: FTL's quests and interactions.** Brainstorm together.

### 3. Corp events (needs a name: "mods" is taken; Claude's pick ANOMALY, also ALERT, PROTOCOL, INCIDENT)
- **Built (v09-v12), as tags on map nodes:** RIVAL, THIEF, ARMORED, CURSED, RUSH, LOADED, BRANDED (`CORP_MODS`,
  engine/map.js; HOW TO PLAY's MORE tab lists them).
- **Ideas:** FLUSH (lots of loot nodes); BLACK ICE (a hit can take all your integrity but 1; or its own node type);
  an extra layer; every corp a boss, or 2 bosses; the stage flipped (boss first); TIME IS MONEY (the clock drains
  credits); money / mod drains (TAXED, AUDITED, RANSOM); BACKWARDS (the corp mirrored, taps too); two events stacked
  on a sector boss; trap types and a trace meter (misses raise an alarm; at max the boss comes early).
- **Stage-wide events**, not just one corp (e.g. "this sector has more rival hackers").
- Details: CORPS.md "Corp modifiers".

### 4. Enemy and ally hackers (about 10% there: RIVAL)
- RIVAL is a bot second player (health, burns ICE, steals pay). Not built: the named cast, each with a logo (beat
  them to unlock it), ICE MAN (the hacker who comes out of the ICE), an ICE hit calling a hacker in.
- **Allies:** an item that calls a hacker (POPS?) with health who clears nodes for you, or stands and takes hits;
  upgrade them, give them mods (POPS with TRACER), tie them to REP or to your history with that hacker.
- Details: CORPS.md "Corp modifiers" > RIVAL; the hacker / NPC name pool in CORPS.md.

### 5. Scrap mods and new gear
- **Scrap mods:** one that is just scrap (BOX OF WIRES: "i'm not going to sort these"), maybe 2 worthless ones, and
  one joke scrap mod that climbs all the way to legendary and is then great (pairs with the carry-a-scrap-mod quest).
- **Gear to concept:** more gear with bonuses, even if it's only worth selling (SHARD and BOND are the first, v13.49).
  Logged: PARADOX (undo your last ICE hit), ENTANGLE (link two nodes), NUKE (wipe a corp off the map), DECODER
  (read CIPHER for a layer), the call as an item, exotic tiers of today's gear. EXOTICS.md has more.

### 6. The map and run structure
- More varied layouts: missing nodes, skip-lane links, sideways links, dead ends, other shapes per sector.
- Moving backwards / the frontier (pick any node linked to one you've visited), or allow clearing the whole map.
  An "open map" mod or a WARP you aim.
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
- A second boss mod for the corps that have one (74 of 78).
- CORPS.md marks every built corp `(built)` on its heading.

### 10. Lean more cyberpunk
- Cyberware in names and flavor (implants as gear, MEDIX as a chrome clinic, chrome on the runner card), the ads.

### 11. Make it more of a hacking game
- Something in the game itself you can hack, like the seed.

## Medium and small
- **Boss rewards by difficulty:** a corp's boss mod should match how hard it is (a pass over all 78 corps; settles
  weak ones like EZPASS). With it: show corp difficulty in game (`DIFF ###--`), the tell balance pass
  (`tools/tell_odds.js`).
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
  between the face and the lettering). Your profile shuffling as you log in.
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
- CORPS.md "Notes": open map, THROTTLE (cheaper uplink), DIGIPET's pet on screen.
- ECONOMY.md: chained perfects, TIME IS MONEY, items as a store of value.
- EXOTICS.md: "New exotic ideas, 2026-10-25".
- The archive (`docs/archive/SPEC_backlog_2026-10.md`): random gear on perfects, better drops (10-20% one step up),
  a bigger VIRUS / CHAINLOCK, a glyph mod, TRUTH METER, dummy ICE, scans as patterns, OVERCLOCK's row-flash
  variant, HYDRA counters, recon stops, puzzle on ICE.
