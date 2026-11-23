# Greg's review list

Things Claude built or decided that need your eyes. Tick one off (`[x]`) when you've looked, or
leave a note under it for Claude. Newest at the top. (Claude adds to this list; the backlog of things
to build is `docs/BACKLOG.md`.)

## Live testing (the user's; logged here, not repeated in answers)

- [ ] Push / upload: `dist/` to the site; greglytics 1.4 (`api/name.php`, `api/scores.php`, `api/version.php`).
- [ ] Money (v13.49-v13.50): the retuned money mods (SKIMMER, SUPERSIZE, FASTPAY, EZPASS, POLICY, INTEREST, CHANCE CARD),
  BLOOD MONEY hits x2, QUANTUM x0.75; LEVERAGE, HAGGLE, STASH, CACHE KEY as they are. Sim numbers: docs/ECONOMY.md.
- [ ] The market: REROLL / SELL / LEAVE row fits on the phone; RESTOCK on THE BOARD; SHARD and BOND (loot only).
- [ ] **Play through everything** (the user, 2026-10-26: "i basically need to go through and test everything"): the mods (incl. SNOOZE, ALL-IN, COIN FLIP, ICE EATER, ZOMBIE, the v13.23 changes), the rarity ladder, the corps, mods flashing when they fire, X / Y-AXIS, map codes, the boss intro, the v13.26 batch.

## Open

- [ ] **TAUNT, POSSESS, MEAT SHIELD, FRAG at the PIER** (v16.01). Things I picked: TAUNT is common gear (20cr), only when no rival is in the corp, not in H3AV3N; POSSESS is rare (45cr) and rides the rival with the most bars, who stops playing; MEAT SHIELD is a BIOS chip (rare, power 2: you asked chip or mod), the crew with the most bars takes the hit first, and it comes after BRICK (BRICK still takes them first); FRAG at the PIER: a PHISH a rarity lower half the time, gear as corrupted software 60%, the DISC can't be fragged, no cast spent. The numbers are in engine/fishing.js FISH_FRAG.

- [ ] **LOST LOOT** (v15.57): THE BOARD > REP > USER, 200 REP. Things I picked: a chip you swap OUT of your belt goes to LOST too (it's lost for lack of room, like the one you don't take); a chip pushed out of a full pool is shredded (components), not just gone, and the message line says which; the LOST sub-tab shows its count (LOST 2). The switch is on the deck's CPU (SETTINGS), not on the post's card.

- [ ] **DANGEROUS CATCH** (v15.56): an OVERVOLT chip, rare, 1 power. 1 PHISH in 5 bites when you land it (-1 INT; gear, chips and shoes don't bite); rarer catches like DEEP WATER; PHISH sells for x1.5 (both numbers in ECON: the editor's ECONOMY tab). The rescues (CONTINUE, 1UP, ROOTKIT) don't work at the pier: they put you back in a corp. **Decided (Greg, 2026-11-23):** CHECKPOINT does (v15.59): back on the map with nothing, full INT.
- [ ] **Your training notes** (v15.56): the pulse on the deck's sockets and the bench's tabs (a bit stronger than a node's, since they're small); the new power beat with the arrow on PWR; the reworded lines (components, where chips come from, sockets, the send-off). The flicker between popups: I couldn't catch it, see BACKLOG.

- [ ] **The deck training** (v15.55): HOW TO PLAY > TRAINING > YOUR DECK, or a fresh deck's first open. Things I picked: FIRST AID starts slotted with no cell, you slot the STOCK CELL, then TRUST FUND in BT2; the feat is DECKHAND, no chip or title (your outline said "maybe a chip, a feat or a title"). The "too little power" example is a line from POPS, not something you do. In the real deck: no cell now says "NO POWER: slot a cell in PSU" and the PSU pulses red.

- [ ] **The new feats** (v15.54): THE BOARD > FEATS has a TECH group now, and 8 more elsewhere (SPEC v15.54). Things to look at: POPS's lines on each; whether CRAFTY / TINKERER at 10 and SHREDDER at 100 feel right; FISH FOOD can't be earned yet (there's no player command to kill yourself; THE SHELL's run.die is dev only, and dev runs don't count). On an older save, opening THE BOARD hands out SYSOP / MK IV / COLLECTOR / MOVED IN at once if you've earned them: a few FEAT boxes in a row.

- [ ] **HOW TO PLAY's tabs** (v15.53): BASICS (INTRO NET TRAY TRAINING) and ADVANCED (RUNS BOARD DECK BENCH PIER). The DECK, BENCH and PIER pages are new: read them for anything wrong or missing. ADVANCED's strip fills the screen's width exactly, so a sixth sub-tab won't fit. HACKERS got split: RIVALS went on RUNS, CREW on BOARD.

- [ ] **The WORKBENCH training** (v15.53): play it from HOW TO PLAY > TRAINING, and get the offer on a fresh save's first WORKBENCH. Things I picked: PURGE all the way through (your outline said pin PATCH, but you shred for PURGE's letters, so I kept it to one item). The kit is PING, ROUTE, TRACER, a SIM and a JUNK.DAT. The feat is APPRENTICE, plus 5 random components. POPS's lines are in the editor's TRAINING tab (the b_ lines). Also: the "do this" pill sometimes sits over the bench's log line; is that OK?

- [ ] **OWNED on chips** (v15.52): a chip your deck already has says OWNED on the belt, at the CHIP DEALER, on market and boss cards and in drop lines. Clear enough?

- [ ] **How easy chips are to find, and BIOS choices** (Greg, 2026-11-22: last time chips felt hard to come by, and picking 2 BIOS chips was easy; that was before the new chips). Where chips come from: a DATA CACHE 20%, a PIER gear catch 25%, a corp boss's rewards 12%, a market 15%, a beaten rival 30% (ripped), the CHIP DEALER (a post). BIOS now has 13 chips for 2 sockets (FRESH, CASINO, CLOCK, DARK, INTO THE FIRE, ALMANAC, PIER PASS, QUIET, LOUD, +1 LAYER, BENCH LINK...). If drops feel stingy, the numbers are DECK_DROP, DECK_BOSS_CHIP, DECK_SHOP_CHIP, DECK_RIVAL_DROP (engine/deck.js). A 3rd BIOS socket (a REP post, like PARTY LINE) only if picking 2 feels too tight.

- [ ] **The deck's loose ends** (v15.52): HCF'S CORE (exotic RIPPED cell, power 18: rare from rivals and THE FENCE), FUSE II (SYSOP 600: mk IV 8 to 12 power), SELF DESTRUCT (CRASH: die, everything into WORKBENCH letters), give.chip (SUDO: a chip you've shredded). A jack with no power: red on the board and on the NO POWER bar.

- [ ] **FRESH, CASINO, CLOCK, DARK and NEMESIS** (v15.51): each corp slot has a 20% chance (12% for NEMESIS) to swap to one of theirs. Enough? Too much? NEMESIS used to be 3x weight; it should feel about the same.

- [ ] **The UPLINK's buttons** (Greg, 2026-11-22: test it and see how it looks). PAY and EARN REP are big boxes, stacked; [ WORKBENCH ] (BENCH LINK) and [ SACRIFICE ] (a chip) are small buttons between them. Should SACRIFICE be a big box beside PAY, like ENTER | PIER and TAKE | SALVAGE? The UPLINK is the tightest screen on a phone (its rows are counted: engine/runend.js openUplink).
- [ ] **TAKE and the SPOILS chip's box side by side** (rewards screen) and **ENTER | PIER** (PIER PASS): how do they look and feel?

- [ ] **The map chips** (v15.49, out of BETA): HEADSTART (first move: any node in rows 1-2), INTO THE FIRE (an event in sector 1; not HEAD FIRST or EENY MEENY), PIER PASS (once a sector, a PIER box next to a rest stop's ENTER; rarer catches), ALMANAC (next sector's card after this one's, NEXT UP), FORGET-ME-NOT (last time's path in purple on the map; every run's path is saved, last 20 seeds). They drop now, like the other chips.

- [ ] **Your GLYPH** (v15.48): the GLY socket lists the glyphs you've seen; pick one and its bonus (LOOT free; SIGNED, GOLDEN on ELITE; COLLECTOR on SYSOP). It's tinted on the board, and counts only where a corp shows the codex glyphs. How often does it turn up for you (about 1 layer in 5 in plain corps)? Prices: 300 / 300 / 500.

- [ ] **CREW JACKS** (v15.47): tap the jacks twice on the mk III board. Your hired crew plug in, 1 power each (2 at LVL 2), and their boons are on every run. Worth a look: are the numbers right (b0y every layer at LVL 2 is strong; it skips layers under 5 nodes and bosses), and is PARTY LINE (a 3rd jack, SYSOP 600) worth it? PORTS' card is cryptic now.

- [ ] **ADWARE and SPORE CELL** (v15.46, still BETA: try them on the dev deck): ADWARE doubles the ads, and a button in one heals 1 INT. SPORE CELL's mold creeps over your deck from the PSU, a little more each run.

- [ ] **The rewards-screen chips and BENCH LINK** (v15.45, out of BETA): GAMBLE (a ? ? ? pick), HEIRLOOM ([ TO LOCKER ]), SALVAGE ([ SALVAGE: SNP ]: the pick as letters), AUCTION ([ REROLL 30cr ], more each time). BENCH LINK: [ WORKBENCH ] at the UPLINK. They're SPOILS chips, so one at a time.

- [ ] **SACRIFICE and +1 LAYER** (v15.44): SACRIFICE (ELITE, 300) gives an OVERVOLT chip: at the UPLINK, [ SACRIFICE: -N INT, no fee ] takes you to 1 INT and on (a ZOMBIE pays in rot). +1 LAYER (SYSOP, 500) gives a BIOS chip: one more layer in every corp.

- [ ] **CHIP DEALER** (v15.43): ELITE (300) / II on SYSOP (600). After a DATA CACHE, a catalog of 3 chips (5 with II, one rare or better) at market chip prices. Buys go on your belt; every chip in it counts as seen, so the WORKBENCH can build it.

- [ ] **ELITE / SYSOP posts, batch 2** (v15.41): POWER TAP (+1 / +2 deck power), SURGE (+1 / +2 SHELL charges), BAIT SHOP (half-price casts), CLOUT (+25% REP), DEEP WATER (rarer catches, more corrupted software), BACKDOOR (dev.start). BACKDOOR (v15.42): dev.start / dev.stop always work; with it they autocomplete. Prices are guesses: 300/600, 250/500, 150, 1000, 400, 1500.

- [ ] **Ladders and REP tabs** (v15.40): REP has tabs (MSGS GUEST USER ELITE SYSOP). A post's later levels sit a level up as their own posts (HARDENED II on USER, III on ELITE...; DEADMAN III is new, 75%). Saves aren't carried over: an old 2-level HARDENED still counts as 2.

- [ ] **Start-of-run chips, REMOTE ACCESS, KITs** (v15.38): your deck now holds PURGE (power 0), FIRST AID and LUCKY START (if you bought them), slotted in BOOT. Pull PURGE and you start without one. BT1 is the KIT socket (it says KIT when empty). THE ARCHIVE is a BOOT chip: pick its mod on its card. REMOTE ACCESS (USER): the workbench opens after the public node. BLACK BOX saves to the WORKBENCH's LOCKER. If you'd bought the old LOCKER post, its 200 REP came back.

- [ ] **CODEX and RELIC** (v15.37): ELITE's CODEX (250 REP) and SYSOP's RELIC (800 REP) each give a chip. CODEX goes in CRASH: die in a corp you haven't beaten and a third of its tell decodes (look at the codex after: the decoded words read clear, `decoded 1/3`). RELIC goes in SPOILS: 1 corp boss in 5 has an exotic as an extra pick. THE BOARD has no placeholders now.

- [ ] **ELITE and SYSOP posts** (v15.36): LOYALTY CARD (ELITE: markets 5% then 10% cheaper), THE ARCHIVE (SYSOP: pick the mod on your deck's CPU, under NEMESIS), CHROMATOPHORE (SYSOP: every palette, and 7 locked card colors on YOU > color). Prices are guesses: 200/400, 800, 500. If you'd bought ELITE POST 2 or SYSOP POST 1/2, the REP came back.

- [ ] **The LOCKER** (v15.34): COMPS is its own sub-tab, the letters 2x2 (the cells are tall, so they read tall and thin: 3 wide x 2 is an option). BIG LOCKER on THE BOARD's ELITE level (v15.35, in ELITE POST 1's place), 200 REP: 10 slots. Check TAKE with 10 on your phone: on the test page it just fits over the keyboard.

- [ ] **The workbench extras** (v15.33): AUGMENT plays at the bench, low; its stage changes every 20s (A A B A B B A A C C A B, C a bit louder: engine/boot.js BENCH_MUSIC). SHRED: GEAR / MODS / LOOT sub-tabs with counts. BUILD: [ CLEAR ] under a good recipe.

- [ ] **The small batch** (v15.32):
  - **[< TITLE] and [LEAVE >]:** brighter; every ~2.6s the arrow gives two nudges its way, and every ~4.3s a shimmer slides across. Too much, too little? (engine/scene.js WAYOUT has the timings.)
  - **The market:** [BUY] [SELL] as regular tabs. Chips say chip in the list and the detail line.
  - **YOUR DECK boxes:** chips home and a quest's chip show the chip's face. **ROOT moving in:** its call, then the chip, then the QUEST card (COMPLETE). The call no longer repeats how to open THE SHELL; the card says it.
  - **The deck:** [DECK*] till you first open it. CHIPS: a slotted chip's "in SH1" is white on black (red with no power); select it for [ VIEW ]. mk III / THE FUSE say "reach ELITE first" when you can't buy them yet.
  - **SYSTEM FAILURE step 2's card:** MEDIX TECH, "POPS wants MEDIX tech..." (my words). The QUESTS page still says THE DISC.
  - Smaller: SHRED's kind labels in rarity color, RELOAD skips chips, the PIER card's buttons wake at 0.5s, the crew x5 feat for crew you have.

- [ ] **The playtest bugs** (v15.30):
  - **Boss intros:** SIMON's, MONTY's and FOSSIL's boss line wraps onto a second row now. Look on a phone.
  - **ROOT's cutscene** at the bench: the keyboard is gone while it plays and comes back after.
  - **THE SHELL:** type `god`: `mode.god` shows whole, no scroll bar. Scroll bars are dark. One to watch: in a headless screenshot the shell ran past the right edge of a 400px window. Check it on your phone.
  - **Two questions** (BACKLOG Playtest notes, Bugs): should beating a boss keep your ripped chips safe? And TELEPHONIX's TELL LIGHT: what did you see?

- [ ] **A finished quest** (v15.29): THE BOARD > QUESTS shows COMPLETE: MOVED IN (ROOT) or COMPLETE: SYSTEM RESTORED (POPS) in the accent color, in place of STEP 4 / STEP 8.

- [ ] **b0y on the OMNI RAID** (v15.28): on OMNI's boss layer, if you haven't tapped [b] in that OMNI, he comes in by himself about a second in ("OMNI's boss. i'm not missing this one."). Call him earlier and nothing changes.

- [ ] **The codex's tabs** (v15.23): `[TECH] [NET] [HACKERS]`, with a sub-tab strip under them: GEAR MODS CHIPS /
  CORPS GLYPHS SECTORS / CREW RIVALS. Left / right walks every sub-tab in order. It opens where you left it (till you
  reload). **CHIPS** shows once you've got a chip of your own (the deck's STOCK CELL and SPOILS don't count). A chip is
  found once you've seen it or it's in your deck; its page has rarity // group // power, its text, where it comes from,
  and whether it's yours. My calls: chips listed by group then rarity, BETA chips left out, the code on the right.

- [ ] **Epic and legendary chips build without a blueprint** (v15.22): see one (a market, a boss's pick, your belt) and
  it's in the BOOK, buildable with the parts and a BLANK. Blueprints are exotics only. POPS's blueprint call says so.

- [ ] **LEAVE top right** (v15.21): the market (HEAD FIRST: JACK OUT), THE FENCE, the PIER and the bench all have [LEAVE] on NeoN+1's line, right side.
- [ ] **The market** (v15.21): BUY / SELL are a sub-tab strip under the message line; the panel's own BLACK MARKET and credits lines are gone (the header has both). LEVERAGE's limit and HAGGLE's cut show on a line under the tabs, only when you have them.
- [ ] **Top left is the way out** (v15.19): `[< TITLE]` top left on THE BOARD, your deck, the codex, help, settings, history, the leaderboard (`[< ALL SEEDS]` inside a seed) and the race screens. The bottom TITLE buttons are gone; the end screen keeps its own. See how it feels before step 2 (LEAVE up top in markets, THE FENCE, the PIER).
- [ ] **REP on the deck** (v15.19): gone from the top line, now in the upgrade buttons as have/cost (`420/600 REP`), dimmed while you're short.
- [ ] **THE SHELL's help wrapping** (v15.18): wrapped lines step in under the command now. On the game's column (about 40 wide) the description column is too far right, so a wrap steps in 2; on a wide shell it lines up under the description.
- [ ] **QUESTS, one at a time** (v15.17): `[ < ]  SYSTEM FAILURE  [ > ]`, and "from POPS · 1 of 2" under it. It opens on a quest with a new step; otherwise the one you looked at last. An arrow reads `[*< ]` / `[ >*]` while another quest has news. Pinning: not done (you floated it); say if you want it.
- [ ] **[ TITLE ]** (v15.17): every [ BACK ] that went to the title screen says so now (codex, help, leaderboard, settings, history, THE BOARD, the race screens, the end screen).
- [ ] **YOUR DECK's header** (v15.16): THE BOARD's two tab rows with [DECK] lit, then a strip with SLOTS / CHIPS and the power. No [LEAVE] and no "THE BOARD // YOUR DECK": tap YOU or REP (any tab) to go back. Does it feel like part of THE BOARD now?
- [ ] **The bugs in your meat notes** (v15.15).
  - **MONTY:** 2 more doors a layer. Its tell is shorter (it pushed the button off the first breach screen). The first breach screen now folds the logo away whenever the tell wouldn't fit with it (FOSSIL's would have too).
  - **The PIER:** the LANDED card's buttons wake up 1 second after it lands (grey till then).
  - **The bench's small slot:** the digit, a BLANK or ROOT's t show 2x2 big now, just the 3 (the label says x3 50%).
  - **The little "."** is SAFE HARBOR's tell (a dot in the real node's bottom right corner), not SIGIL's. It still draws (checked on a screenshot).
  - **BACK / LEAVE:** a survey and a proposal are in BACKLOG Polish. JACK IN THE BOX's length is noted there too.
- [ ] **The workbench, round 2** (v15.13).
  - **Cash out with a chip you already have:** it shreds into letters (and maybe a BLANK). The YOUR DECK card lists "had already, shredded:" and what came out. No more x2 in your deck.
  - **POPS's two new calls** (rough, see where they land): the first BLANK you get, and the first blueprint you learn.
  - **The LOCKER** (v15.20): TAKE / STORE use the same sub-tab strip.
  - **The BOOK's sub-tabs:** GEAR MODS CHIPS in a dim strip under the main tabs, the one you're on filled in. The found count is that tab's. Is the strip the look you want for tabs inside tabs?
  - **Seen chips** (v15.14, your call): a chip you've seen for sale at a market or as a corp boss's pick is craftable now. The BOOK's count line lost its "BOOK".
  - G0D.exe: it showed in the BOOK for everyone, and G 0 D actually built it. Fixed: it's no recipe now.
- [ ] **Chips and blueprints at the workbench** (v15.10; docs/DECK.md "The workbench").
  - **BUILD:** one small dotted 2x2 slot after the letters ("x2-9 BLANK"; v15.11 merged the x slot into it): a digit there is the x (a 50% chance of that many gear), a BLANK makes a chip. Put a BLANK (`#`, in the SPECIAL row) in and the three slots spell a chip's code, digits too (`CD2`). What you've spelled (code, name, [ BUILD ]) is under the letters now.
  - **Blueprints:** epic+ chips and every exotic show "blueprint" in the BOOK till you shred one. ZOMBIE and RAM DOUBLER bind to you: shredding one teaches the blueprint and you keep it.
  - **My calls:** BLANKs come from shredding chips (40%) and corrupted software (10%). Shredding a chip gives its digit back too. You can only craft chips you've had (not RIPPED, BOSS, or the deck's / quests' own). A built chip goes straight into your deck. The chips show in the BOOK after the mods.
  - **FREE PRESS** is the old BLUEPRINT chip (your first build each run is free). Say if you'd rather ALPHABET SOUP.
- [ ] **RIPPED chips** (v15.08; docs/DECK.md "The sources"). `give.chip LW1` in dev mode puts one on your belt.
  - **The chase:** with one on your belt, every corp without another anomaly has a rival. Sell it, trash it, or let a rival take it, and that stops.
  - **Taking it back:** a rival that takes the corp's boss layer (and isn't flatlined or thrown out) takes one off your belt (v15.31: was any layer). POPS calls the first time, and the first time you get one.
  - **The look:** magenta runs across the chip, on the belt and in your deck. Its texts start RIPPED. Worth a look on a phone.
  - **The set (my picks, rarer = stronger):** LIFTED WALLET (common, +50cr), TURBO'S NITRO (rare, 2 WARP), VULTURE'S CUT (rare, rivals pay +50%), D0PPEL'S MASK (epic, +2 INT), PH1SH'S HOOK (epic, rivals drop chips twice as often), SYSOP'S KEY (legendary, every corp's first layer: real node marked). Names, numbers and effects are all up for change.
  - **THE FENCE** (v15.09): the chip is a row in its list under your stolen mods, with its code chip and price; pick it for its text and a B U Y   I T box.
  - **My calls:** ripped chips sell at a market (other chips don't), since you said selling it ends the heat. Only rivals and THE FENCE give them; caches, markets and bosses never do.
- [ ] **Four more SUDO commands** (v15.06; docs/DECK.md SUDO). `give.chip FT3` (and JM4, RF4, CM3) in dev mode puts one on your belt.
  - **`mode.free`** (FT3, epic, 3 charges): any node in this sector is open, the boss too, till the sector ends.
  - **`corp.jump`** (JM4, legendary, 4): from a corp layer, straight to its boss.
  - **`rm -rf`** (RF4, legendary, 4): every ICE on the layer goes, one after another. My call: not on a sector boss, like NUKE.
  - **`chmod <mod>`** (CM3, epic, 3): a mod up a rarity till the sector ends, once a sector. My call: not BUFFER, BOX OF WIRES or MUTATE, since their step changes more than numbers.
  - Rarities and charges are my picks; each chip gives one use. They drop by rarity like the others (no corp drops: HALFLIFE and CLONEWORKS are only their themes).
  - **`fork`** (FK2, legendary, 4; v15.07): every layer of the corp gets a second real node wearing the real one's glyph, full pay. Shows "fork: 2 real" on the layer. With QUANTUM, QUANTUM's node is the fork and its pay cut is off. My calls: only layers of 3+ nodes (like QUANTUM), not in tap corps, and the glyph copy may look odd on corps whose tell isn't a glyph (it's still a second real node there).
  - **One use:** each SUDO chip gives the charges of one use, but only some commands have their own limit (breach once a run; flatline, show.real, mode.hold, fork once a corp; mode.god, mode.free, chmod once a sector). rm -rf, corp.jump and give have none: more charges (CAPACITOR, the CHARGE pick, other chips) means more uses.
- [ ] **Teaching THE SHELL and the deck** (v15.05). Try a fresh save if you can:
  - **The bench:** POPS's first-visit lines end with your shell line (before ROOT: "don't know what a shell is?..."; with ROOT: "give.mod, give.gear").
  - **Your deck:** the first time you open it, POPS trains you (6 lines: sockets, power, runs, where chips come from, SHELL chips). `deck.pops` replays it. A save that has a deck already gets it the next time it opens the deck.
  - **Shell chips before ROOT:** they still drop. Their tip says "it needs THE SHELL: get ROOT on your crew", and cashing one out says where to go (QUESTS, or "open your deck" if ROOT's quest hasn't started).
  - **The codex:** once ROOT is crew, a SHELL chip in front of the "from" line, in the top rarity you can call up.
  - **THE BOARD:** two rows of tabs: `[YOU] [REP] [DECK]` over `[FEATS] [CREW] [QUESTS]`. DECK opens your deck. My call: the new row took the blank line under the tabs, so the BBS box didn't move up. Say if you'd rather it moved up and kept the blank.
  - **Rooted:** a run that used chip commands is saved in your history as rooted (not shown anywhere yet). Dev runs are practice, a separate mark.
- [ ] **`give.mod` / `give.gear` by name** (v15.04; docs/DECK.md SUDO). `give.mod tracer epic`, `give.gear frag 2`.
  Common and rare: anything you've found. Epic and up: only what you've shredded at that rarity or higher (shredding
  starts counting now: older shreds weren't kept). My calls: charges by rarity (1/2/3/4/5), the chips give 4. Greg: no
  limit past your charges (type it twice, get two). `give.gear` is a new SUDO chip (GG1, epic).
- [ ] **THE SHELL's new commands** (v15.03; docs/DECK.md SHELL / SUDO). ` opens THE SHELL now (~ / Ctrl + ` the old
  dev menu, dev mode only; phones: `[ SHELL ]` in the pause menu). Try the chips (`give.chip CD2` etc. in dev mode, or
  `deck.chips all`): `cd ..`, `scan`, `rm`, `kill -9`, `cat`, `sleep`, `whois`, `undo`; SUDO `mode.god` (a sector),
  `mode.hold` (a corp), `show.real` (a layer), `breach` (once a run), `give.mod` (1 of 3, once a run). My calls:
  `scan` lists the corps ahead and lifts BLINDERS / FOG (the map already shows corps and anomalies); `kill` needs
  `-9`; SUDO chips give exactly one use in charges (flatline went 1 -> 3). All numbers are guesses.
- [ ] **THE SHELL's charges** (v15.02; docs/SHELL.md "Charges"). Slot SHELL chips (with ROOT on your crew), start a run,
  press `~`: the charges show top right; the list shows each command's cost (`whoami ·1`); run out and it says so; a
  new sector fills them; a corp boss now and then offers a CHARGE (+2). ROOTKIT in CRASH: die with charges and you
  live at 1 INT. `dev.start` in the shell: dev mode, no costs, the run is practice. My numbers: whoami +3, ps +2,
  man +2, CAPACITOR +4, flatline +1 (costs 3); a CHARGE in 35% of corp boss rewards.

- [ ] **ROOT's quest, PAPERWORK** (v15.01; docs/CREW_QUESTS.md). To start fresh: THE SHELL (~ with `?dev=1`) >
  `root.reset`, then open your deck at USER. Watch: the glitched SHELL sockets (their fine print), the QUEST card, the
  WORKBENCH step (if you haven't bought it), a shred where a lowercase letter stays under the shredder with a fanfare,
  the QUEST card with the letter big, PH1SH's spam ad (try both buttons: the fish, the confetti, "thanks, chump.", your
  credits going; POPS after), the 4th slot (`r o o t`, a `*` fills one), the hijacked build and the scene, ROOT's call,
  then `~`: ROOT's hello and `man` from ROOT's chip in a corp. Shortcuts: `root.letters`, `root.phish`, `root.step`.
  My calls: 60% a shred gives a letter, 1 in 3 letters after the first get the ad, PH1SH takes 30cr, the 4 spam texts,
  the scene's words (data/quests.js), ROOT's chip is `man`. Saves that bought CREW: ROOT keep it (and the shell).

- [ ] **G0D.exe** (v14.60-v14.61): dev menu (backtick) > [give G0D.exe], then tap the red [G0D] on your belt. Watch a
  run: its card, the <@> cursor thinking and the @ flying out, the map lines (why it goes where), markets, rewards, the
  UPLINK, and its OFFLINE card when it stops. Settings in the dev menu: speed, clicks, wins before it knows a corp,
  popups (click / wait), its wins (count / not), the workbench (shred only / + build), phish (skip / ALL OF IT: watch it
  phish your money away at a pier), risky (go on / hand back). My calls: the eye art (placeholder), how it scores the map,
  what it buys, when it taps a $ node.

- [x] **Credits instead of a mod may be too low** (Greg, 2026-11-21: on purpose, skipping is meant to pay less; the economy plays fine) (found planning G0D.exe, 2026-11-08). Skipping a boss reward pays
  2 earn units (20cr in sector 1). Taking an epic or legendary mod and selling it at the UPLINK pays 33% of its fee:
  ~26cr (epic) or ~40cr (legendary), times the sector, and you have the mod until then. So from epic up, "take it and
  sell it" always beats the credits. Rare (~16cr) and common (~10cr) don't. Fine as a hidden strategy, or raise
  ECON.skip.boss / lower ECON.uplink.sellPct?

- [ ] **MONTY and FOSSIL** (v14.57): editor > TESTING, breach each. MONTY: is his tell readable but not free (blunt at tier 1, ? vs . deeper)? The boss's swaps: too fast? Its prize (v14.58): clean boss = the C.A.R. (v14.59: no tap; every node in the sector is open until you drive off the links), ICE on the boss = a GOAT named ZONK that eats an ICE a corp and sometimes your loot: does the goat steal too often (1 in 3)? FOSSIL: brushing feel (a second a brush, 15s), the fossil glyphs (4 kinds, the eye is an o), the dirt, the boss skeleton. SHOVEL as its reward. My calls: both level 3, the logos, VELVET ROPE / HOLLOW.

- [ ] **SIMON** (v14.55): editor > TESTING, breach SIMON (or find it on the map, level 2). Watch the pattern, play it back; try a wrong step (it hurts, replays). Since v14.56 a step is one beat of TRACKER (136 BPM: about 440ms): too fast? The tones (in the track's key, by node), the four colors, the look-alike characters deep in (`[l]` `[I]` `[1]` `[|]`: maybe too mean?). The boss's white steps. My calls: level 2, 12s clock, REPEAT as its boss gear, TRACKER music, the logo.

- [ ] **This session** (v14.50-v14.53, 2026-11-07): b0y's one cursor and his [b] hint on the OMNI RAID; the initials in the workbench letters; [SHARE] on the title and the results (open a `?seed=` link: it counts on the seed boards); open the game in two tabs (the second says PLAY HERE; tap it, the first goes quiet); REWIND legendary from COLDBREW's boss; CERBERUS's card on a phone; BOX OF WIRES (editor TESTING > Give it 6 times: every node opens). Is a box turning up 40% of the time while you carry one too often?

- [ ] **H3AV3N fixes** (v14.48): CERBERUS with VIRUS (few nodes left): the eyes keep moving, the real node frees up. G0D MAZE's intro on a phone (the quote wraps). G0D DEFEATED: the mod chips go with their letters. The ending's last cards (THERE IS MORE TO EXPLORE, CREDITS): the tap line under the text, the counter top left. The OMNI RAID: [b] in the tray, tap it in a corp (once a corp; on the map he says wait); his three cursors closing in. After the credits: G0D FIGHT / TITLE. STEADY HANDS on THE BOARD (USER, 300): a legendary PHISH stays catchable.

- [ ] **SYSTEM FAILURE** (v14.47): a fresh save: CALL POPS in, he joins and the QUEST card says PROVE IT; clear a sector: POPS's mold call, THE DISC. The map's ! on MEDIX and its info line. Pick the DISC up: GET OUT WITH THE DISC. A market with the DISC: POPS calls. After a scene (THE BOARD > QUESTS replay, or the editor's buttons): it goes dark, the card, then back (music fades and comes back in). PRODIGAL: read it through; the upload bar (tap, it fights back, tap on). d0g in a corp: three heads as he taps; his new lines; w00f's. The MEDIX CULTURE ad (editor ADS tab). Does SYSTEM FAILURE fit as a name on the board and the card?

- [ ] **The playtest batch** (v14.46): lose a corp to d0g (he takes the last node): the reveal stamps ESCAPED, a line says "escaped. no win."; on a sector boss, SECTOR CLEARED says beaten / escaped. A market with 10+ rows (COUPON CUTTER): the list scrolls, LEAVE stays put. A CALL over the map: nothing under it lights up. POPS's face in a CALL (6-wide chip): square enough now? Gear x3 counts on their darker chips. STIM with ZOMBIE: rot limit 225 for the corp. TUNNEL: its = lines while armed, the dug path after. Music after a FIRST BREACH comes back. HAD3S: no safehouse in sector 1, MEDIX, more sideways links; POPS's LEASH call on the first run (a save that hasn't had it); THE BOARD > QUESTS: [ PLAY IT ].

- [ ] **Seed boards** (v14.44): type a seed on the title (it says `replay`), play it, the end screen shows `#1 of 1 on SEED`. LEADERBOARD > SEEDS: the rows, tap one (THIS SEED / PLAY IT), the find field, a seed's page, esc back. Typed seeds earn REP now. (Off file:// they post to the test boards.)

- [ ] **G0D's logo** (v14.43): the art (an eye in a triangle, mine: redraw if you like, editor > ART), its frame in the ending, the new lines on THERE IS MORE TO EXPLORE, H3AV3N CLEARED's list. With a G0D win it shows in the logo picker.

- [ ] **Meat notes** (v14.42): UPSIDE's boss: tap near a gap or a hit ICE, the real node is always reachable (a node with nothing open across from it takes the tap itself). A fresh save: the first CALL that brings POPS puts him on your crew, with a call. On THE DISC step, MEDIX's boss loot has the DISC.

- [ ] **The ending** (v14.41): editor > g0d > IN THE GAME, or play the H3AV3N seed to the end. Read the whole scene (the copy is a first pass; data/quests.js h3av3n), the placeholder art (redraw any of it in asXii: asxii_art/n_cutscene_04_ending), the credits and THANKS TO handles. Then the 1UP: die in a corp, USE 1UP, the same layers come back. REPLAYS on the title's seed row. (Your save needs a G0D win for both.)

- [ ] **Boss rewards screen** (v14.40): beat a corp boss: after "breached ..." your logo folds away a row at a time and the rewards sit under your name line. Speed: engine/screens.js LOGO_OUT (wait 300, row 110, glitch 90 ms). Also try a first breach and a rival breach.

Older open items (v13.51-v14.39), mostly covered by your playthroughs since: [archive/REVIEW_2026-11-07.md](archive/REVIEW_2026-11-07.md). Pull any back that still matter.
