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

- [ ] **CALL odds** (v13.78): a plain CALL brings POPS much more often until he's on your crew (27% a call, was 11%), and crew you've called under 5 times more often than the ones you have. CALL turns up in markets 41% of the time (was 17%). Numbers in CALL_ODDS (engine/hackers.js): say if POPS feels too common.

- [ ] **The g0d tab** (v13.78): the neon editor has a **g0d** tab. Click a look and the game goes to its screen and draws it: the 20 fight mockups over a corp layer (squeezed to the board, the boss bar on top), THE NETWORK GOES (mold eats the sector map, the bar comes up), NOT DEAD YET (the win screen: the mold creeps back, the bar returns), MOLD GLITCH, G0D ON THE DEATH SCREEN (its logo; "it saw you." is a placeholder). prev / next, hold still, off, and **The health bar**, its own overlay: 4 styles (HASHES, BLOCKS, THIN in the header; or across the board), over any look; it takes hits so you can see it drop. The groups fold up. Previews only: nothing in a run.

- [ ] **THE DISC quest** (v13.77): in the editor, TESTING > Quests: open the quest, start a run, give the DISC (or find one), beat a sector boss, CASH OUT. POPS's calls, the uplink line, TAKE IT TO POPS, the scene, THE BOARD > QUESTS. The words are all placeholders (QUEST_LINES / QUEST_SCENES in engine/quests.js): rewrite them. The odds (25% loot, 20% markets, 8% fishing) are guesses.
- [ ] **Misc UI** (v13.75): the map's one-line hint (tap or hover a node you can't reach: its info); the pet on the rule; the uplink's sold badges dim; REROLL x1; [ SELL WARES ] / [ BUY WARES ]; the end screen's breached list cycling on a long run. Dead hackers should be quiet now: say if you still see one talk.
- [ ] **Rivals going down** (v13.74): beat a rival in a layer (face blows up 3 times, the rest falls; crew float up), then after the boss CORP BREACHED builds in with their logo first: DEFEATED, yours over it, then the rest of the screen (one animation). The sounds and timing are first guesses.
- [ ] **UI pass** (v13.73): the black market's BUY / SELL modes (REROLL row in the list, SELL / BUY over LEAVE), the map's sector line one up, gear colors on list screens, the trash drag (gear on the cursor, drops into the trash).
- [ ] **Trash gear** (v13.72): drag a gear item up and drop it on [ TRASH ] (over the mod row). Try it on a phone: is the drag distance OK, is the target big enough, does a quick tap still feel the same (taps now fire on lift, not press)? Also v13.71 after the commit: kept phish stack by rarity (PHISHx2). And: lanes both ways, the reel starts on the fish, CAST AWAY = 250 casts (my number), BIG DATA = 10 GB+.
- [ ] **Phishing** (v13.71): the catches are stolen data now (names + info lines + sizes are mine: SPAM LIST, REUSED PASSWORD, LOYALTY ACCOUNT, SOC SEC NUMBER, CORPO LOGIN, PAYROLL DUMP, BLACKMAIL, ROOT KEYS), the LANDED card, ANGLER is now PHISHER. Reel UI: @ cursor, red bar / pink target off it. Stream dim behind the card; the drag message.
- [ ] **Fishing round 2** (v13.70): 7 lanes, fewer and mostly little fish (max 3 big), the cast drops to your tap, reel clicks / ratchet sounds, bite + snap + shoe sounds, market pop on a catch (confetti on legendary), weights on the card (BIGGEST YET), the pier tracks (LOW PRESSURE / PLUS ONE / SEA LEGS, level 3 while reeling). Round 2b: menu at the pier, taps only on the stream, louder sounds + cast spin, ripples, the reel replaces the fish's lane. Listen to the sounds; is level 3 enough of a lift (4 is the boss level)?
- [ ] **Fishing** (v13.69, 2026-10-28): the PIER is in (the editor's TESTING tab > go fishing, or find a [~] on the map). Hold to
  sink the hook, tap when one bites (red), hold to reel. Play it and tell me what to change: the bite window (0.7s), the bite chance
  (half), the reel (too easy / hard?), lane speeds, the 30-cast limit, prices (ECONOMY tab > Fishing). The fish names and lines
  are mine. Not gated by a feat yet.

- [ ] **The pet** (v13.68, 2026-10-28): take COMPANION (TESTING > Give) and a cat or dog with a name follows you on the
  tray line: walks, sits, sleeps when you're idle, dances to the music, runs to what it sniffs out; tap to pet it. Its looks
  (2 lines), names and hacker lines are in dist/data/pets.js: redraw freely. ICE MAN now waits for your first ICE hit.

- [ ] **Hackers in play** (v13.67, 2026-10-28): RIVAL corps now bring in one of the 10 rivals, and CALL gear (rare, in markets and
  loot) brings in crew. Every rule, line and color is mine (dist/data/hackers.js for colors and lines; engine/hackers.js HK_AI for
  how they play): tune freely. Try it fast: the editor's TESTING tab > Hackers > bring in, while in a corp layer. Look at: the
  card, the cursors, their terminal lines, the face pop when they talk, dying with one up, THE BOARD > CREW, the codex HACKERS tab.
  Balance is untested by a person: d0g and HCF might steal a lot; LEECH and SYSOP might feel slow.

- [ ] **REP's levels** (v13.66, 2026-10-28): THE BOARD > REP is now GUEST / USER / ELITE / SYSOP (buy 4 on GUEST for USER, 3 on
  USER for ELITE). New posts, all mine: SECOND WIND and LUCKY START (GUEST); BETTER DROPS, LOCKER, NEMESIS, STARTER POOL (USER);
  BOSS LOOT as the first PRIVATE MESSAGE (feat BOSS HUNTER: clear 10 sectors). Prices and the 4 / 3 / 2 counts are guesses.
  ELITE and SYSOP open with nothing on them yet. Also fixed: SHORTLIST never worked. Quick test: the TESTING tab's credits
  don't give REP; use the dev menu's +100 REP.

- [ ] **Feats and THE BOARD** (v13.65, 2026-10-28): progression step 1. On the title: [ THE BOARD ] and your name both open the
  new hub (YOU / REP / FEATS / STATS). 25 feats in `dist/data/feats.js` (names, POPS's lines, which give titles: all mine, edit
  freely). Try: the editor's TESTING tab > Feats (grant one, "box" shows its FEAT box), or just play. Your save was wiped on
  load (REP refunded for THE BOARD buys) since this is the fresh start. Check: the FEAT box, the rep-colored terminal line
  in a layer, the YOU card, the * marks, STATS, the game-over screen's new "more" rows.

- [ ] **REP colors** (v13.64, 2026-10-28): every palette has a new **rep** color (blue-violet; lime on 3 where violet was
  near their own colors). Look them over in the neon editor's palette tab (a new rep row, and REP in the samples) or on the
  "NeoN+1 REP Colors" page; change any you don't like. Nothing in the game uses it yet: it's for the feats / THE BOARD screens.

- [ ] **The hacker cast** (v13.63, 2026-10-28): 10 bad + 10 good hackers, all mine but POPS: names, faces (5 x 3), logos,
  lore, shticks, how each AI plays, and who counters whom. Look in the neon editor's new **hackers** tab; redraw the faces
  and logos in the art tab (new **hacker faces** group, asXii works). Placeholder art throughout. Your two AI ideas are
  GG_EZ (only emotes) and TURBO (taps everything fast); the take-your-hits assist is BRICK. Questions for you: is D0PPEL
  the right home for today's RIVAL? do bad hackers' logos unlock by beating them and good ones' by calling them?

- [ ] **Boss gear** (v13.62, 2026-10-27): the 10 tap mods are gear stacks now, with the changes from our overlap talk. New names (gear names fit 6 letters): FREEZE FRAME -> **FREEZE**, CONTROLLED BLAST -> **BLAST**, INTERROGATE -> **SNITCH**, SACRIFICE -> **TITHE**, TIMEWARP -> **SLOMO**, ROLL UP -> **ROLLUP**, HONEYCOMB -> **BEES**. ESPRESSO is cut (COLDBREW gives REWIND epic x2). Stack sizes: 3 for the light ones (FLARE, REMOTE, FREEZE, SNITCH, BEES), 2 for the strong ones. Try them: the TESTING tab's give gear, or beat those corps. BLAST is aimed (use it, then tap a node). The boss reward's third pick is gear 35% of the time (ECONOMY tab, "boss reward"). Old saves: those mods vanish from a run in progress.
- [ ] **15 new fake ads** (v13.61, 2026-10-27): all my copy and ASCII art. Look in the neon editor's new **ads** tab (each one
  drawn as text; "show in the game" puts it up). Cut, rewrite or redraw anything; QUEENS OF KALDOR is kept cheeky, not explicit.

- [ ] **Sector events** (v13.54, 2026-10-27): built from `docs/SECTOR_EVENTS.md`. Try it from the neon editor's new
  **TESTING** tab (each event is a button: a new run, straight to sector 2 with it). Look at: the card (its look, and
  the 14 placeholder pictures: yours to draw, in data/events.js); the card text I wrote; BLINDERS on the map; THE FENCE.
  My calls (top of SECTOR_EVENTS.md): the share grows 10% a sector after the 2nd (to 80%); DEAD AIR rolls a third as
  often; TIME IS MONEY makes timed corps 3x as likely and costs 1cr a second; FIRE SALE -30% (repairs too). The codex has a SECTORS
  tab (v13.55): each event logs the first time its card shows.
- [ ] **TESTING tab** (v13.54): the cheats and jumps you asked for; the dev menu's mod grid is gone (the tab's give
  box and the gear & mods tab do that). Tell me what else you want on it.

- [ ] **More than one copy at a market** (v13.53, 2026-10-27): a gear offer can be PATCH x2 or x3. Odds per extra copy (ECONOMY tab, "more copies"): scrap 50% / common 35% / rare 20% / epic 8%, up to 3. So half of scrap offers come as x2 or more, a quarter as x3; an epic x2 is about 1 in 13. Too many? COUPON only makes the first copy free.

- [ ] **Nine new gear** (v13.52, 2026-10-27): TUNNEL, MESH, WARP (rare random / epic aimed), TILT, SHAKE, FRAG, REWIND,
  SHOE, PASS. Dev panel [fill gear] gives one of each (scrap / first step); the neon editor's items page sets the step.
  Look at: the codex text I wrote (CODEX > GEAR) and SHOE's miss lines (engine/active.js SHOE_MISS); prices (TUNNEL 35,
  MESH 80, WARP 45, TILT 30, SHAKE 18, FRAG 28, REWIND 25, SHOE 4, PASS 90). Three calls for you:
  - **FRAG on small layers:** 3 hits on a 2-3 node layer always hit the real node: a sure free clear (no pay). Fine, or
    cap the hits (e.g. never more than half the closed nodes)?
  - **Gear odds by rarity** (ECONOMY tab, "Gear: how often each shows up"): markets now pick by weight, so PATCH is in
    ~25% of markets (was ~43%: 15 gear share the shelf now) and ALL-IN / MESH / PASS ~10%.
  - **WARP** never lands on the sector boss itself (both steps): the rows before it only.

- [ ] **Value gear ladder** (v13.51, 2026-10-26): DUDS / SIM / SHARD / BOND / CHROME / WALLET. Check the codex text (CODEX > GEAR) I wrote for DUDS, SIM, CHROME, WALLET; the worth (5 / 15 / 40 / 100 / 250cr) and drop weights in the ECONOMY tab ("selling gear", "Loot: which gear drops"); a WALLET is about 1 in 500 loot rolls. Dev panel [fill gear] gives one of each.

## Done

- [x] **The art catalog** (v13.27-v13.28, asXii v0.143, 2026-10-26): closed 2026-10-26, in use; the editor has its own ? help now.
- [x] **Items & mods page in the editor** (2026-10-25): closed 2026-10-26, in use; no text editing there for now (the user).
- [x] **The new editor: `tools/neon_editor.html`** (v13.17, 2026-10-25): closed 2026-10-26, in use; the editor has its own ? help now.
- [x] **asXii v0, the ASCII editor** (2026-10-23): closed 2026-10-26, in use, well past v0.
- [x] **Logotype round 4: oldskool / Amiga styles** (2026-10-22): closed 2026-10-26, the user is trying title card art in asXii first; the samples are noted in the INTRO PASS (BACKLOG.md).
- [x] **INFO page wording** (v11.05): closed 2026-10-26, moved to the COPY PASS (BACKLOG.md).
- [x] **Multiplayer join box and share link, on a real room** (v11.04; share fixed in v11.06): closed 2026-10-26, shelved: it works; finish the core game first (BACKLOG.md).
- [x] **PROFILE and CORP BREACHED logo block** (v11.04): closed 2026-10-26, reworked since (one 24 x 7 logo box, v13.27).
- [x] **Palette pass** (palette editor, v11.03): closed 2026-10-26, fine for now; the warnings (and MOCHI MOCHI being hard to read) moved to the PHONE PASS (BACKLOG.md).
- [x] **Title screen** (v11.00): closed 2026-10-26, reworked since; the title card art round comes later (the user, in asXii).

- [x] **The to-do batch** (v13.26, 2026-10-25): closed 2026-10-26, in the play-through ("Live testing").
- [x] **The new rarity ladder** (v13.19, 2026-10-25): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Small batch** (v13.18, 2026-10-25): closed 2026-10-26, in the play-through ("Live testing").
- [x] **The first fake ads** (v13.05): closed 2026-10-26, the user: they are good (more ads later, ADS.md).
- [x] **SNOOZE** (v12.23): closed 2026-10-26, in the play-through ("Live testing").
- [x] **ALL-IN item, and "why not" on items** (v12.22): closed 2026-10-26, in the play-through ("Live testing").
- [x] **COIN FLIP** (v12.19): closed 2026-10-26, in the play-through ("Live testing").
- [x] **ICE EATER and ZOMBIE, the first exotic mods** (v12.14): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Boss intro animation** (2026-10-22, your ask; you'll have notes): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Every mod flashes when it fires** (v12.13): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Corp map codes** (v12.11): closed 2026-10-26, in the play-through ("Live testing").
- [x] **X-AXIS / Y-AXIS scan** (v12.11): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Mods you can see go off** (v12.12): closed 2026-10-26, in the play-through ("Live testing").
- [x] **The new corps: CIPHER, HYDRA, BLACKOUT** (v11.00): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Leg + exotic mod changes** (v13.23): closed 2026-10-26, in the play-through ("Live testing").

- [x] **Open questions** (the Lemonheads track, the ASCII tool default): dropped 2026-10-26, the user: they don't matter.
- [x] **The training** (v13.29, 2026-10-26; the popups v13.30; POPS + round 2 v13.31): closed 2026-10-26, built through round 5 (v13.35) and played; the [TUTORIAL] button it mentions is gone (NEWB starts it now).
- [x] **Header, play stats, tester mode** (v13.16, 2026-10-25): closed 2026-10-26, old upload / setup steps; the header and stats have been live since.
- [x] **Two talks to have: reputation (REP) and money balancing** (2026-10-25): closed 2026-10-26, the money talk happened (v13.37-v13.50: economy file, the sim, THE UPLINK, the retune); the REP talk is still open (on the build list, BACKLOG.md "Talks to have").
- [x] **Meat notes filed, and the music notes compiled** (2026-10-24): closed 2026-10-26, the notes are filed; its open question (the Lemonheads track) moved to "Open questions".
- [x] **asXii: decide what a selection does when you switch tools** (decided: option 2, built v0.11): closed 2026-10-26, decided (option 2, built v0.11).
- [x] **Meat notes filed** (2026-10-23): closed 2026-10-26, the notes are filed; the rarity call was made (v13.19); the ASCII default question moved to "Open questions".
- [x] **The boot / login intro** (v13.03): closed 2026-10-26, replaced by the new intro (v13.36); intro notes go in the INTRO PASS (BACKLOG.md).
- [x] **v13.00 on the web host** (2026-10-22): closed 2026-10-26, old upload step; the game is at gregschomburg.com/neon/ now.
- [x] **RAM DOUBLER** (v12.24 as CHROMED UP; v13.08 renamed, 12 slots): closed 2026-10-26, out of date (it says "item belt"; gear slots since v13.48); its feel is part of live testing.
- [x] **QUANTUM** (v12.17): closed 2026-10-26, retuned to x0.75 (v13.50); in "Live testing".
- [x] **LEVERAGE: debt** (v12.16): closed 2026-10-26, in "Live testing" (as it is, v13.50).
- [x] **BLOOD MONEY and the MODS CLASH screen** (v12.15): closed 2026-10-26, hits now cost twice as much (v13.50); in "Live testing".
- [x] **Rarity chips** (v12.01): closed 2026-10-26, replaced by the rarity ladder (v13.19).
- [x] **Upload `preview.png` to the root of gregschomburg.com/br/** (v12.00): closed 2026-10-26, the site moved to /neon/.
- [x] **v12 on the web host** (v12.00): closed 2026-10-26, old upload step; the site moved to /neon/.
- [x] **Link preview and icons** (v12.00): closed 2026-10-26, from the /br/ days (the preview said v12.00); the og:image is set for /neon/ now.

- [x] **The in-game header still says `BETA_RUNNER`.** Done in v13.16: it says NeoN+1 and is the menu button.
