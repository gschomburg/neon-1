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

## Parts
- Game: `dist/` (classic global scripts, load order set in `dist/index.html`). Runs from file://. Multiplayer uses the Firebase Realtime DB (`database.rules.json` is pasted into the console by hand).
- `tools/neon_editor.html`: edits the game's data files in place (follows web.md's saving pattern). Shared file readers and writers are `tools/*_file.js`.
- `ascii-editor/` (asXii): its own version (`node ascii-editor/bump.js`, `MAJOR.MINOR`, no "v"). Saves are download-only for now, and it has no unsaved-changes warning yet. `saves/` is gitignored.
- `greglytics/`: the shared events/leaderboard service. `dist/engine/greglytics.js` is a copy; change the original, then copy it in.
- Deploy: the user uploads `dist/` to gregschomburg.com/neon/.
