@~/.claude/greg_globals/web.md

# NeoN+1

A browser game, plus its tools. readme.md is the overview. docs/SPEC.md is the living spec
(version log in §16n, decisions in §18). docs/BACKLOG.md is open work. docs/meat_notes.md is
Greg's raw notes.

## Differences from web.md (keep these)
- `dist/` is the hand-edited source and the deployed folder (there is no build). Don't rename it to `public/`.
- Versions are `vMAJOR.MINOR` (minor zero-padded, +.01 per handoff; major only when the user says). Use `node tools/bump.js minor|major|vNN.NN`. It also updates the `NEON_FILES` stamps, the `?v=` busters, `version.json` and the corp lists in the tool HTML files. A new major needs a new save slot (`STORE_KEY`).
- Release commits read "Version v14.32: summary" (or "Version v14.25-v14.31: summary" for a batch), with a bulleted body.
- Never reindent files here. ASCII art lives in string and template literals, where leading spaces are part of the art, and `tools/data/*_file.js` writes the data files with spaces in a fixed format.

## Checks
- Run `node tools/test.js` (or `--quick`) before committing engine or data changes. It fails on any difference from
  `tools/checks/golden.json` / `tools/checks/golden-play.json`. When a change is on purpose, re-accept with
  `node tools/checks/check.js --accept` / `node tools/checks/playtest.js --accept` and say so in the commit.
- New behavior worth keeping gets a check in `tools/checks/tests/` (a page script; see tools/checks/harness.js `pageKit`).
- A test page's helpers live inside its function: the game's globals (`st`, `save`...) can't be redeclared.
- `tools/` layout: `bump.js`, `test.js` and the HTML tools at the top; `checks/` (the checks, goldens, tests, `out/` for
  saved fingerprints), `data/` (data file readers and writers, generators), `editor/` (the editor's code). Old
  snapshots and other removed files go to `_trash/` (gitignored).

## Parts
- Game: `dist/` (classic global scripts, load order set in `dist/index.html`). Runs from file://. Multiplayer uses the Firebase Realtime DB (`database.rules.json` is pasted into the console by hand).
- `tools/neon_editor.html`: edits the game's data files in place (follows web.md's saving pattern). Its code is `tools/editor/` (one file per tab; `common.js` holds the shared helpers, `NEON_ED`). Shared file readers and writers are `tools/data/*_file.js`, on `tools/data/data_file_core.js`; `node tools/data/x_file.js` must print "unchanged". The editor talks to the game through `dist/engine/editor.js` (postMessage): change both ends together.
- asXii (the ASCII art editor) has its own repo now (`D:/GS/projects/asxii/asxii`), live at gregschomburg.com/asxii/. The editor's "edit in asXii" opens the live one (`tools/editor/art.js` ASXII_URL). Neon's art saved from asXii goes in `asxii_art/` (committed): the cutscenes there are what `node tools/data/scene_art.js` turns into `dist/data/scene_art.js` (the game only reads that file, never a save).
- greglytics (the events/leaderboard service) has its own repo now (`D:/GS/projects/greglytics/greglytics`, github.com/gschomburg/greglytics). `dist/engine/greglytics.js` is a copy of its `client/greglytics.js`: change the original, then copy it in (keep the game's three header lines and stamp).
- Deploy: the user uploads `dist/` to gregschomburg.com/neon/.

## Screen space
- On a phone the board is 23 rows. A panel that runs over spills onto the mod tray: `buildTextBoard` doesn't squeeze. Count rows when you add lines to a screen.
- Tricks when a screen is tight:
  - Fold away art once it's had its moment (the boss rewards logo: `LOGO_OUT` in engine/screens.js).
  - One scrolling line instead of stacked, wrapped text: `FX.ticker` (engine/fx.js: a beat on the start, then it scrolls). The UPLINK's rows and the tray's gear tips use it.
  - Lines that take turns on one row: `FX.swapLines` (the map's node card when a boss has too many lines: mapview.js `swap` lines).
- **Decided (Greg, 2026-11-05):** stacked text reads best where it fits (the rewards screen keeps it). The ticker is for when space is tight.
- The end screen's map flexes: it scrolls and gets whatever rows are left (engine/screens.js overLines). The rows above and below it are counted with `lineRows` (engine/textboard.js), the same rule that draws them; count any new line there too. **Decided (Greg, 2026-11-08):** no tickers there, and the initials keep their `[^]` / `[v]` arrows.
