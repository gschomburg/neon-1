# Architecture audit (2026-11-05)

A read-only pass over the whole codebase (about 27,000 lines in 150-odd files), done by five reviewers in parallel,
one per area, then merged here. Nothing was changed. The counts are greps over `dist/` at v14.44.

**Overall:** the corp system is already modular (74 of 78 corps live entirely in their own file through about 27
hooks). The friction is in four places: mod and gear effects inlined in the engine, the special screens and
cinematics wired by hand into three files, run state that has to be listed by hand to survive a reload, and the
tools (no shared file core, checks that no longer catch anything).

Status: **not decided.** Greg picks what to do; tick items off here as they're done.

## Bugs found (verified)

- [ ] **The economy tab drops 6 numbers on save.** `data/economy.js` has `loot.valueShare`, `loot.boss`,
  `loot.sector`, `loot.cache`, `modx.pickpocket`, `modx.pickpocketRare`; `tools/economy_file.js` doesn't know them
  and the editor's Ctrl S writes the file without them. Fix: add them to its INFO; refuse to save while any are unknown.
- [ ] **A reload mid-corp loses some corp state.** `runSnapshot` (engine/save.js) lists ~30 corp fields by hand;
  missing: `leash`, `muzzleTo`, `honeyTo` (engine/hackers.js: LEASH is a paid item), `express`, `invUsed` (run.js).
- [ ] **Abandoning a run with the DISC doesn't mark it lost.** `abandonRun` (engine/input.js) writes its own history
  entry and skips `questRunEnd` (also no `sector` / `seeded` in that entry).
- [ ] **An ad takes taps while the dev menu hides it.** input.js: `if (st.ad) return adTap(...)` has no dev check; the
  draw side skips the ad under the dev menu. (Same shape for the corp intro's tap.)
- [ ] Small: the G0D DIE skip checks `G0D_END.beat` (heaven.js), not its own timing.

## 1. Content: mods, gear, corps (makes MONTY / FOSSIL / new mods cheap)

- **Mod effects are inlined in the engine.** `has('...')` for 63 mods across 13 engine files (56 calls in run.js);
  a corp's boss mod effect goes in run.js or active.js (corpkit.js says so). Partial tables exist (`START_NOTE`,
  `END_FX`, `HIT_FX`, `BOARD_FX`, `MOD_STAGE`). **Change:** one `MOD_FX[key] = { stage, start, note, pick, block,
  hit, board, end, pay }` registry; corp files register their boss mod's effects. `payFor`'s 10 inline multipliers
  become a `pay` entry. Medium, low risk (one table at a time).
- **Gear is two parallel if-chains.** `canUse` and `gearFx` (active.js) each branch on ~35 keys (82 `key === `
  checks); `BOSS_GEAR` already uses `{ ok, why, use }`. **Change:** all gear in one `GEAR_FX` table of that shape.
  Medium, mechanical.
- **Corp hooks are called ad hoc.** 21 sites spell `st.corp && st.corp.hasBoss && st.corp.def.X`, with guards that
  disagree. **Change:** `corpHook(name, ...args)` / `corpFlag(name)`. Small.
- **Corp hooks manage engine internals.** `tap` hooks reset `st.busy` / `lv.readyAt` themselves; the seed RNG line is
  copied 22 times. **Change:** `tap` returns "handled", the engine resets; `corpRng(label, ...)`. Small.
- **Ten flags used by exactly one corp** (`flip`, `cipher`, `dark`, `faith`, `surge`, `shot`, `tickets`,
  `bossFlash`, `bossShrink`, `maskMs`) and corp keys named in engine code (chronos, apiary, old tells). A few general
  hooks (`payMult`, `clockMax`, `layerStart`) absorb most. UPSIDE and CIPHER are screen-wide and fine in the engine.
  Medium, not urgent.
- **Gear knows corps** (TILT / SHAKE check GRAVITAS / ENTROPY). **Change:** a corp `onGear(key, lv)` hook; MONTY and
  FOSSIL will need it too. Small.
- **Small duplicates:** `setCellOf` = `moveTile`; the free-cells loop copied 9 times; the decoy pick in 10 corps;
  single-corp helpers living in corpkit.js. **Change:** `freeCells(lv)`, `decoys(k, n)`, move the rest home. Small.
- **No list of all hooks;** a misspelled hook does nothing. **Change:** one hook reference, and a check that flags
  unknown keys on a corp def. Small.

**Adding a corp today:** its file, its logo, the script tag, its boss mod in data/mods.js, plus MOD_STAGE and an
effect in run.js / active.js. With `MOD_FX`, the engine edits go away. MONTY and FOSSIL both fit the hooks as they are
(`dress`, `tap` / `cellTap`, `fx`, `hint`); open points: the first MONTY pick vs the X-AXIS / Y-AXIS scans and ICE
EATER, gear between picks, what counts as a FOSSIL pick. KEYLOGGER's line-by-line reveal could become a helper FOSSIL
shares.

## 2. Screens, input and cinematics

- **Overlays are wired by hand in three places, in three orders.** Seven modal overlays (ad, event card, hacker card,
  feat box, call box, cutscene, tutorial popup) plus boot, intros and the G0D sequences, each wired into
  `buildScene`, pointerdown and keydown separately; draw order and input order already disagree (the ad bug above).
  **Change:** one ordered `OVERLAYS` list `{ on, build, tap, key }` that all three loop over; hits tagged by layer.
  Medium.
- **The cell-writer loop is copied 7 times in `buildScene`,** and 35 more times in g0dproto / heaven. **Change:** a
  `layerCtx()` factory. Small; do it first.
- **Popup cards are copy-pasted** in 6 files (frame, title bar, catch-all hit, typewriter budget in 3). **Change:**
  `drawCard(ctx, {...})`. Medium.
- **Modes are if/else chains:** 10 `st.mode`s, about 20 flags, `st.mode ===` 30 times in scene.js and 18 in input.js,
  ~22 early returns in pointerdown with uneven guards, `st` has 137 properties. **Change:** a `MODES` registry
  `{ build, tick, pointer, key }`, one mode at a time (fish and the four G0D modes first). Large; worth it only with
  the overlay list.
- **Every G0D cinematic is a hand-rolled timeline:** five timing tables, five state slots, four copied skip
  functions. **Change:** a small `Seq` helper and one `st.cine` slot. Medium; timing is tuned by eye, port one at a
  time.
- **Hover:** `hl()` exists but 21 places tint by hand; modals get no keyboard focus (a CALL's second button can't be
  reached by keys). Small.
- **scene.js holds six subsystems** (1383 lines). Split into board / map view / text board files (only the script
  order changes). Medium, low risk. **Done (2026-11-05):** scene.js is 371 lines (buildScene, overlays, layerCtx);
  board.js, tray.js, mapview.js and textboard.js hold the rest.

## 3. Run and state

- **"Does this run count?" is five slightly different predicates** (`counting`, `questRun`, `statOn`, `oneUpOpen`,
  the leaderboard guard); `st.mp` checked 115 times, `.practice` 50, `.tutorial` 36, literal quest names 18; `run.mp`
  is never set (4 dead checks). **Change:** `engine/runkind.js` with named predicates (`runScored`, `runRanked`,
  `runSaves`, `isQuest(id)`). Small to medium.
- **Run state for resume is a hand list** (the bug above). **Change:** corp state in one bag saved whole, or save
  everything but a short runtime list. Medium; test resume.
- **Credit math copied 25 times** (`credits += x; earned += x`), 5 adds skip `earned` with no note; REP banking
  copied twice. **Change:** `earn / spend / refund / bankRep`. Small.
- **Four ways a run ends,** each recording differently. **Change:** one `finishRun(run, outcome)` and one history
  entry builder. Medium.
- **run.js is several systems in one file** (2030 lines): damage, the 1UP, the uplink, loot rolls, run end. Split by
  its section headers; loot is spread over three files. Large total, each move low risk. **Done (2026-11-05):** run.js is 994 lines; damage.js, hits.js,
  oneup.js, runend.js hold the rest, and the loot rolls moved to loot.js.
- Lifecycle hooks all fire from run.js (traceable). A small `Hooks.on('runStart' ...)` bus is optional, only with the
  split. Also: a `PENDING` resume table, an `askPanel` helper.

## 4. Story and late game

- **g0dproto.js is the real G0D fight** but named a prototype (`G0DP` 286 times there, 84 elsewhere). **Change:**
  rename to a fight module. Medium, mechanical; the editor's tuning keys move with it.
- **Dead prototype code:** a second maze (the real one is `HEAVEN.maze`), non-`real` branches, empty stubs. About 150
  lines. Small.
- **g0d.js says "nothing here runs in play"** but `MOLD`, `moldCol` and its hash are used in 5+ files; four hashes
  exist though fx.js says "the one hash". **Change:** move them into fx.js unchanged (same output). Small.
- **Quest steps are data, moving between them is code** (17 `.step === ` checks). **Change:** step fields
  (`advanceOn`, `uplinkLine`, `counter`...) before the first crew quest. Medium.
- **Six ways a character talks;** b0y alone four ways, `G0DP_BLUE` hard-coded 36 times. **Change:** one
  `say(who, text)` from the hacker's style. Small.
- **Quest seeds are special-cased in the engine** (run.js, map.js, active.js, input.js). **Change:** a per-seed
  definition like the corp hooks. Medium.

## 5. Tools and checks

- **The checks don't catch anything:** `tools/check.js` compares against a baseline from 2026-10-22 that includes a
  hash of every function, so any edit is a difference (3,672 now); it never fails; it has its own drifted copy of the
  layer setup. **Change:** a small committed golden file (layers, maps, data; no code hashes), exit 1 on a
  difference, `--accept`; one engine `layerSpecs(node)` the checks and editor share. Medium.
- **Every test builds its own harness** (5 of them). **Change:** `tools/harness.js` (vm load, headless Chrome page)
  and one `tools/test.js` that runs the data round-trips, the golden and the playtest. Medium.
- **No shared core for the `*_file.js` writers** (UMD wrapper, parse, stamp, quoting copied 3-4 times). **Change:**
  `tools/data_file_core.js`. Medium. **Done (2026-11-05).**
- **neon_editor.html is 3,407 lines** with `toGame`, `toast`, IndexedDB and save code copied per tab (TRAINING,
  ECONOMY and FX even share one IndexedDB key). **Change:** `tools/editor/common.js` and one file per tab. Medium.
  **Done (2026-11-05):** the page is the HTML only; the three tabs share one dist/data folder handle on purpose.
- **palette_editor.html is a full copy** of the editor's palette tab (two writers for palettes.js). Drop it or share
  a `palette_file.js`. Small. **Done (2026-11-05):** both (palette_file.js has a round-trip check in test.js).
- Small: `data/palettes_v1.js` is dead but still stamped; art_file has no round-trip check; faces.js has a hand
  comment the next save deletes; g0dproto.js ships to every player (could load only with ?editor / ?dev).

**Fine as is:** stats.js, core.js, pet.js, had3s.js, intro.js, the tutorial's gating, `openChoice`, `Field`,
`computeLayout`, the fx.js API, the text board toolkit (mostly), versioning and `bump.js`, sector events wiring,
bench and fishing (data-driven).

## Suggested order (Claude)

1. **The bugs** (small, now).
2. **Checks that work again** (golden file + shared harness): every refactor after this is safer.
3. **Content wiring** (`MOD_FX`, `GEAR_FX`, `corpHook`, `corpRng`, `freeCells`): right before MONTY and FOSSIL, so
   they're the first corps that need no engine edits.
4. **Cheap cleanups:** run-kind predicates, `earn/spend`, `layerCtx`, `say()`, moving MOLD / hashes into fx.js,
   deleting the dead prototype code.
5. **Bigger moves when you next touch the area:** the overlay list and mode registry, splitting run.js and scene.js,
   renaming g0dproto, the cinematic `Seq`, quest step data (before crew quests), the editor split.
