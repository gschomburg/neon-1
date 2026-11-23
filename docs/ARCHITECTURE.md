# Architecture audit (2026-11-23, v15.57)

A read-only pass over the code, done by five reviewers in parallel (the deck and chips; the WORKBENCH, THE SHELL and
quests; screens, UI and the trainings; the run, saving and feats; tools and checks), then merged here. Nothing was
changed. The first audit (2026-11-05, v14.44) is docs/archive/ARCHITECTURE_2026-11-05.md; most of it is done.

**Overall:** what the last pass built holds up (OVERLAYS, the golden checks, the shared harness, corp hooks, `earn()`).
What grew since is the deck (deck.js is 2,550 lines), three trainings in one file, and ROOT's quest written as code
in bench.js. The friction is in five places: chip numbers spread over ~10 tables, quest steps still moved by hand,
"does this run count" checks that disagree, popup cards and list screens copied per screen, and a golden check that
doesn't look at any of the new data.

Marks: **(checked)** Claude read the code path and confirmed it; the rest were confirmed by the reviewer only.

## Bugs

### The deck and chips
- [x] **OMNI'S EYE drops from ordinary loot** (checked). **Done (v15.58).** `deckRollChip` (deck.js:330) doesn't filter the BOSS group;
  OMNI isn't in `DECK_NO_DROP`. It's the only exotic that can drop, from caches, the PIER, markets, boss rewards; the
  quest then gives a second one. The dealer and give.chip filter boss chips by hand.
- [x] **OVERCLOCK lowers the big cells** (checked). **Done (v15.58).** deck.js:1397 sets the cell to 15, so HCF'S CORE (18) drops to 15.
  Should be `Math.max(15, cell)`.
- [x] **Power over 15 breaks the PSU readout.** **Done (v15.58):** past F the digits go on G H I (base 36), one character. The PSU socket prints hex used/budget in 5 columns (deck.js:1829);
  HCF'S CORE (18) or REACTOR + SPIKE + POWER TAP (>15) runs past the socket. The comment at :195 says it always fits.
- [x] **BROWNOUT can pick HARDCORE** **Done (v15.58).** after HARDCORE has already turned the CRASH chips off (deck.js:469-471): CRASH
  stays off and the +50% REP is lost. Pick the brownout first.
- [x] **BROWNOUT on SPIKE** **Done (v15.58):** BROWNOUT never picks SPIKE. keeps SPIKE's +2 power (counted from the slots) but skips its -1 INT.
- [x] **Practice and dev runs write to your real bench through chip drops.** **Done (v15.58):** in practice a lost chip that goes is just gone. `lostLoot`'s SHRED and a full pool shred
  into save.bench and save.shredded (unlocking give.chip for it); `deckDrops` has no practice check. (From v15.57.)
- [x] **Decided (Greg, 2026-11-23): keep it.** No heat till it's on your belt. **A RIPPED chip in LOST LOOT** carries no heat: rivals don't come for it and can't take it back
  (they only look at your belt), and it comes home on cash out.
- Suspected: CHECKPOINT empties your belt and mods including quest gear (the other death chips skip quest gear).

### The WORKBENCH, THE SHELL, quests
- [x] **ROOT's build writes `letters.null = NaN`** (checked). **Done (v15.58).** bench.js:310 loops over all 5 slots; slot 4 is null in
  ROOT's word. Until a reload the bench says "NaN components" and BUILD says you have none.
- [x] **ROOT's quest can lock for good:** **Done (v15.58):** the build marks it `signing`; the next bench or deck finishes it (rootRecover). the letters are spent and saved when you build, but the step only becomes
  done when the PAPERWORK scene ends (quests.js:212). Close the tab in between and you're on 'spell' with no letters,
  and nothing moves it back (`rootCheck` only runs after a shred gives a letter). Fix: finish the step when you build.
- [x] **A progress wipe breaks ROOT's quest:** **Done (v15.58):** the wipe starts ROOT over and gives back the crew the other quests gave (b0y too). `wipeProgress` clears save.legacy (crew_root goes) but keeps save.quests
  (step 'done'), so ROOT never comes back and THE SHELL says "paperwork pending" for good. Next PROGRESS_EPOCH raise
  would hit everyone. Suspected the same for b0y at POPS's 'raid' step.
- Suspected: `playScene` drops an open CALL without its onClose (b0y's raid call vs the 'gate' scene); the editor's
  FX preview of a scene moves POPS's quest on; [ CANCEL ] on a near-word leaves a BLANK in slot 5.

### Screens and input
- [x] **Esc on POPS's SHOW ME / SKIP offer loses it** (checked). **Done (v15.58):** Esc presses the last button; left / right pick one, Enter presses it. `callKey` (quests.js:245) sends Esc to `callClose`,
  which only runs onClose; the WORKBENCH offer (and the deck one) have none, and popsSeen is already saved: no
  training, no brief. Enter always presses the first button; SKIP can't be reached by keys.
- [x] **Text past 36 columns, cut on both sides:** **Done (v15.58):** the CODEX corp card's long lines and REP's "opens:" scroll (tickers); a feat's text gets 2 rows. the CODEX corp card's boss line (SIMON 57, MONTY 41, FOSSIL 39) and
  some intel lines; a FEATS card's text ("earn 1000cr in a run, end it with under 10." 44); REP's "opens:" line.
- [x] **The CODEX corp card isn't one height:** **Done (v15.58).** MONTY's rules wrap to 2 rows, so its card is 11 rows, not 10.
- Fixed (v15.58): the deck training can stick if it starts mid-transition (no `st.transitioning` guard, unlike the bench).

### The run, saving, feats
- [x] **A 1UP clears practice and hacked:** **Done (v15.58).** `useOneUp` (oneup.js:41) restores the run from the corp's start and only
  carries oneUp, stats and resumes. Cheat in a corp (practice), die, 1UP: the run counts again.
- [x] **Cheats carry into the next run:** **Done (v15.58):** god / show real / free travel on at the start make it practice. `startRun` doesn't reset or check st.god / debug / freeTravel / devAccess.
  With BACKDOOR: dev.start at the title, mode.god, start a run: it counts.
- [x] **Resume loses per-corp state** **Done (v15.58)** for lost, flatlined, brickJack, boyTrayUsed; G0D MAZE's maze is still open. not in CORP_SAVE (save.js:228): `lost` (BRUTE FORCE), `flatlined` (once a corp),
  `brickJack`, `boyTrayUsed`; G0D MAZE rebuilds its maze from the start on a reload.
- [x] **Dying at the PIER, the input stays live** (checked) **Done (v15.58).** (v15.56): during die()'s 1.1s beat you can still cast or
  tap [LEAVE >] (leavePier and fishPointer don't check st.busy / dying); LEAVE goes to the map under the end screen.
- [x] **`kill -9` / `run.die` skip die()** **FISH FOOD part done (v15.58):** only a bite counts (run.diedPier). The rest (codex loss, CODEX chip) is open. (endRun directly): no codex loss, no CODEX chip; at the PIER it counts as
  FISH FOOD (feats.js `|| st.mode === 'fish'`). (FISH FOOD should be `run.diedPier` only.)
- Fixed (v15.58): die() / endRun() had no re-entry guard (die() runs once per death now: st.dieRun) (a second bite during the fall-out would bank twice); the
  training run can die from a BLOCK or clock hit (only hurt() floors it at 1).

### Tools
- [x] **`node tools/test.js nosuchtest` says "all good."** (checked) **Done (v15.58).**: a typo'd name runs nothing and passes. Fail
  when a name matches no test, and fail a test with 0 passes.
- [x] **The round-trip checks write the file:** **Done (v15.58):** `--check`, used by test.js. economy_file.js always writes, the others when different; a failing
  check fixes the file, so the next run passes. Add a `--check` mode (no write) for test.js.
- [x] **tools/checks/tell_odds.js crashes** **Done (v15.58):** it uses harness.loadGame. (its own vm sandbox drifted from harness.loadGame).

## Structure

### 1. The deck: one file, ten tables
- **Split deck.js along its sections:** data 10-295 (to `dist/data/chips.js`), drops / dealer / LOST LOOT 297-456,
  chip effects 458-910, THE SHELL's commands 911-1210 (next to shell.js), state and power 1254-1495, the screen
  1497-2546 (`engine/deck_screen.js`). First, pass the deck in: deckPower / deckOpen read the global DECK, and
  `deckRunChips` swaps it with no try/finally. Medium.
- **CHIP_FX:** a chip's numbers live in ~10 parallel tables (DECK_INT, DECK_CHARGES, DECK_CELL, DECK_HEAT_REP,
  DECK_FAVOR, DECK_KITS, DECK_NO_DROP, DECK_RIPPED, the tags, inline multipliers). One `CHIP_FX[key] = { int, charges,
  cell, rep, credits, price, give, mods, favor, kit }`, read by `chipSum` / `chipMult`; chips that act (CRASH, SHELL)
  keep their hooks. The chip version of MOD_FX. Medium, low risk.
- Chip effects are well contained otherwise: 49 of 69 `chipOn` calls are in deck.js. The 20 leaks into 12 files (AD0,
  DG3, PP2, NM0, LK7, FI2, DN1, GE1, HS1, QT0, SX1, SR4, PD2, OMNI, FG0) become deck* helpers. Small.
- `DECK_NO_DROP` copies LEGACY's chip list by hand: build it from LEGACY, and filter BOSS there. Small.
- One-socket assumptions (one CRASH, one SPOILS, the KIT in BT1) will fail quietly when a second socket comes.

### 2. Quests: before the next crew quest and the cult quest
- [x] **Done (v15.60):** questsOn, questNext for ROOT, questOf's first step, step counters. **Steps still move two ways.** POPS's steps run on QUEST_INFO data, but five functions hard-code 'pops'
  (sceneEnd, questCarryLine, questUplink, questCashOut), and ROOT sets its crew and step by hand (rootSigned) though
  its step data says `crew: 'root'`. Loop them over every started quest; rootSigned calls `questNext('root')`. Medium.
  Needed before any crew quest with a carry item or a scene (NANA's COOKIES, DIALUP's WALLET, KLUDGE's parts).
- [x] **Done (v15.60)** for d0g (step counter); ROOT's letter row stays its own. **Counters are one-off** (d0g's wins, ROOT's "/ 4" letters). A step `counter: { key, need, label }` drawn the same
  way for all. Medium.
- [x] **Done (v15.60):** BENCH_WORDS. **ROOT lives in bench.js** (~10 places). Fine for one quest; the cult's DIVINE letters would be a second copy. Add
  a bench "special word" hook (the word, its slots, onSign) first. Medium.
- [x] **Done (v15.60):** engine/keyboard.js. **The bench keyboard is wired to the bench;** the cult typing fight wants it with its own keys and ENTER. Pull out
  `kbDraw(geom, { keys, count, onKey, onEnter, special })` before the fight's prototype. Medium.
- [x] **Done (v15.60):** engine/seeds.js SEED_DEFS (H3AV3N's deep story stays in heaven.js; POPS's LEASH call in quests.js). **Quest seeds are special-cased in ~20 places** (`run.quest === 'had3s'`); BAUD's race and the cult seed add more.
  A per-seed definition (old audit). Medium.
- Small: `questOf(id)` defaults any quest to POPS's first step; QUEST_LINES is one flat list (lines per quest
  instead); the quest dev commands are copied between shell.js and editor.js; dead `typeof rootOn` guards (6).
- Still open from last time: one `say(who, text)` (G0DF_BLUE is now in 61 places).

### 3. Run kinds and run ends
- **"Does this count?" disagrees in ~15 places.** `counting()` and `countingHome()` disagree on the deck training;
  `corpStat` breached / lost has no gate at all (practice runs, editor jumps and the training corp feed the codex,
  FRESH, NEMESIS and logo unlocks); `grantFeat` skips counting() (MAZE LOST in practice); the 'Run kinds' table in
  save.js lists 5 of them. Change: `engine/runkind.js` with named predicates and one table (old audit). Small-medium.
- **One finishRun:** runs end through die, cashOut, eject, kill -9, the H3AV3N win (skips cashOut) and abandonRun (its
  own bookkeeping). `finishRun(run, outcome)` for the bookkeeping, the end screen separate. Medium.
- **Resume:** CORP_SAVE is a hand list that keeps slipping. Save st.corp whole minus a short runtime list, or a check
  that diffs st.corp's keys against it. Medium.
- save.js does five jobs (load, the one-tab guard, LEGACY's table, run kinds and REP, resume): LEGACY to
  `dist/data/board.js`, the tab guard to its own file. runend.js mixes bookkeeping, the end screen and the UPLINK.
  feats.js holds the FEAT box. Small each.

### 4. Screens
- **tutorial.js does five jobs** (836 lines): the gates and kit, the corp training, POPS's drawing, hints, the
  WORKBENCH training, the deck training. Move drawing and hints to `engine/pops.js`; one `startTraining({ on, setup,
  script, end })` for the copied start / end code and tutOn's three-way check. The scripts stay code. Medium.
- **Popup cards** still copied (feats.js, quests.js, events, hackers, ads): `drawCard`. Medium (old audit).
- **List screens:** the CODEX and HOW TO PLAY re-implement `scrollArea`; the CODEX, HOW TO PLAY and THE BOARD repeat
  the same tab keys. `scrollArea` with a box-aware option and a `tabKeys` helper. Small-medium.
- **Hover and focus:** 25 hand tints (`hoverBtn ===`); popups get no keyboard focus (the Esc bug). Small.
- **Modes:** `st.mode ===` 31 times in scene.js, 24 in input.js (up from 30 / 18). The MODES registry is still the
  big change, worth it only when a new mode comes (the cult fight is one). Large.

### 5. Tools and checks
- [x] **Done (v15.59):** the golden has 63 tables now. **The golden doesn't see the new data:** none of DECK_CHIPS (and the other DECK_ tables), FEATS, QUEST_INFO,
  HACKERS, SECTOR_EVENTS, ECON, BENCH, TUT_COPY... are in check.js's NAMES. Add them and re-accept. Small.
- **Coverage gaps:** the playtest plays tier 1 in god mode with a fresh save (no deck, anomalies, events). 11 chips
  and 51 of 66 feats are never named in a test. No test for sector events, multiplayer, pets, the market, HAD3S, or
  resume across a reload. scene_art.js, quest_dialog.js and music_view_check.js aren't in test.js (**done v15.59:** both generators take --check, all three run in test.js).
- **The editor can't edit** chips, feats, REP posts, quests, events, mods / items, hackers or pets (hand-edited).
  Chips would need `dist/data/chips.js` first (section 1).
- **Test setup copied:** start-a-run-and-get-to-the-map in ~29 tests; until / popIs / closeCalls / ready copied. Into
  pageKit. All ~50 test pages start at once (Promise.all): likely why full runs are slow and flaky; a pool of ~6 (**done v15.59**).
  Medium.
- Small: check.js loads the game twice; batch1446-1489 test files are named by version, not feature;
  data/palettes_v1.js is dead and still stamped (to _trash/); stale tool comments.

## POPS's popup flicker (fixes 1-3 in after v15.59: Greg to look again)

No path draws a popup early or at full size (a new popup has no layout until its first frame, and its first frames
draw nothing). The likeliest causes, in order:
1. **The header row.** While a popup is up, row 0 is painted solid and redrawn from a copy taken when it came up
   (`T.head`); between popups (the 120ms+ gap) row 0 is live again. So row 0 changes 2-3 times at every handoff. On
   the bench row 0 holds the animated [LEAVE >], and on desktop a hover highlight there blinks off and on. Fix:
   refresh T.head every frame.
2. **A frame with no target** re-lays the tag centered, no arrow: the bench keyboard's keys are added after the scene
   (never found), blinking HUD cells, disabled buttons. Fix: keep the last good rect.
3. `buildTutorial` also runs inside wipe / snapshot builds, laying out from throwaway cells. Fix: only when collecting hits.
4. Two clocks (performance.now vs the frame's time): benign as traced.

## Decided (Greg, 2026-11-23)
- A RIPPED chip in LOST LOOT: no heat till it's on your belt (as built).
- Practice runs feed the codex records (breached / lost) and logo unlocks: fine, as they are.
- CHECKPOINT works at the PIER: a DANGEROUS CATCH bite puts you back on the map with nothing, full INT (v15.59).

## Suggested order (Claude)
1. **The bugs** (all small; the PIER and LOST LOOT ones first, they're today's).
2. **Checks:** test.js fails on no match / 0 passes, `--check` for the round trips, the new tables in the golden.
3. **The flicker fixes** (T.head every frame, keep the last rect): cheap, then you look again.
4. **Before the cult quest:** the keyboard out of the bench, the special-word hook, quest steps for every quest,
   per-seed definitions. **Done (v15.60).**
5. **When next in the area:** split deck.js and CHIP_FX (before more chips); runkind.js and finishRun; tutorial.js into
   pops.js + startTraining; drawCard; test setup into pageKit.

**Fine as is:** OVERLAYS (draw, taps and keys walk one list), addHit's tap sizes and the training gate, drawSubTabs,
tutKit, the shell's command table and charges, CALL_QUEUE / FEAT_QUEUE order, the bench's tabs, chipOn and the run's
chip snapshot, seeded drop streams, deckPersist's one write, harness.js and pageKit, the golden's design, the data
file core, bump.js, the editor bridge (every message has a handler), and the tests for the deck, shell, sudo,
dangercatch and lostloot (they check outcomes, not just drawing).
