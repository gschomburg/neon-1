@~/.claude/greg_globals/web.md

# NeoN+1

A browser game, plus its tools. readme.md is the overview. docs/SPEC.md is the living spec
(version log in §16n, decisions in §18). docs/BACKLOG.md is open work. docs/meat_notes.md is
Greg's raw notes.

## Differences from web.md (keep these)
- `dist/` is the hand-edited source and the deployed folder (there is no build). Don't rename it to `public/`.
- Versions are `vMAJOR.MINOR` (minor zero-padded, +.01 per handoff; major only when the user says). Use `node tools/bump.js minor|major|vNN.NN`. It also updates the `NEON_FILES` stamps, the `?v=` busters, `version.json` and the corp lists in the tool HTML files. A new major needs a new save slot (`STORE_KEY`).
- Release commits read "Version v14.32: summary" (or "Version v14.25-v14.31: summary" for a batch), with a bulleted body.
- Never reindent files here. ASCII art lives in string and template literals, where leading spaces are part of the art, and `tools/*_file.js` writes the data files with spaces in a fixed format.

## Checks
- Run `node tools/test.js` (or `--quick`) before committing engine or data changes. It fails on any difference from
  `tools/golden.json` / `tools/golden-play.json`. When a change is on purpose, re-accept with
  `node tools/check.js --accept` / `node tools/playtest.js --accept` and say so in the commit.
- New behavior worth keeping gets a check in `tools/tests/` (a page script; see tools/harness.js `pageKit`).
- A test page's helpers live inside its function: the game's globals (`st`, `save`...) can't be redeclared.

## Parts
- Game: `dist/` (classic global scripts, load order set in `dist/index.html`). Runs from file://. Multiplayer uses the Firebase Realtime DB (`database.rules.json` is pasted into the console by hand).
- `tools/neon_editor.html`: edits the game's data files in place (follows web.md's saving pattern). Its code is `tools/editor/` (one file per tab; `common.js` holds the shared helpers, `NEON_ED`). Shared file readers and writers are `tools/*_file.js`, on `tools/data_file_core.js`; `node tools/x_file.js` must print "unchanged". The editor talks to the game through `dist/engine/editor.js` (postMessage): change both ends together.
- `ascii-editor/` (asXii): its own version (`node ascii-editor/bump.js`, `MAJOR.MINOR`, no "v"). Saves follow web.md's saving pattern (in place in Chrome, a download elsewhere). Justin Bakse works on asXii too: fetch and check his commits before changing it. `saves/` is gitignored.
- `greglytics/`: the shared events/leaderboard service. `dist/engine/greglytics.js` is a copy; change the original, then copy it in.
- Deploy: the user uploads `dist/` to gregschomburg.com/neon/.

## Screen space
- On a phone the board is 23 rows. A panel that runs over spills onto the mod tray: `buildTextBoard` doesn't squeeze. Count rows when you add lines to a screen.
- Tricks when a screen is tight:
  - Fold away art once it's had its moment (the boss rewards logo: `LOGO_OUT` in engine/screens.js).
  - One scrolling line instead of stacked, wrapped text (the UPLINK's `ticker` in engine/run.js: a beat on the name, then the description scrolls).
- **Decided (Greg, 2026-11-05):** stacked text reads best where it fits (the rewards screen keeps it). The ticker is for when space is tight. The first time a second screen needs it, pull it out of run.js into a shared helper (engine/fx.js).
