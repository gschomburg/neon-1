# ASCII editor

A standalone tool for making ASCII art: draw or import shapes and get fitting characters, build 3D blocks
and get 3D block lettering, then touch up by hand. Made for NeoN+1's art, but it isn't part of the game and
shares no game code, so it can move to its own repo later.

**Working name:** asXii (needs a real name).

**Status:** v0 (bare bones, 2026-10-23): the layout, typing, box select / move / copy / paste, flip, brush and
eraser, layers, canvas size, zoom, save / open / import / export. See "v0" in `PLAN.md`.

**Run it:** open `dist/index.html` in Chrome. No setup. Your work autosaves in the browser; `dist/index.html?fresh` starts
clean (the welcome art).

**Version:** shown in the header (`v0.09`). Every batch of changes ticks it +0.01: `node ascii-editor/bump.js minor`
(changes `VERSION` in `dist/app.js`, the header, the `?v=` tags that make a normal reload pick up new files, and
`dist/version.json`). Add a short note to show with the update notice: `node ascii-editor/bump.js minor "Shape tool"`.

**Update notice:** a hosted copy checks `version.json` (a few seconds after load, when you come back to the tab, and every
10 minutes); if a newer version has been uploaded it shows "asXii v0.26 is out · Refresh" (bottom right). Upload
`version.json` with the rest of `dist/`. It does nothing when opened as a local file.

## What's here

- `dist/`: the app itself (`index.html`, `style.css`, `app.js`, `cursors.js`); the only folder that ships.
  - `dist/cursors.html`: every cursor the editor draws, numbered, big and at real size, for feedback on the drawings.
- `CURSORS.md`: the cursor plan and checklist (what each mode's cursor is, and modes other editors have).
- `PLAN.md`: the plan (layers, tools, the character converter, block mode, canvas, layout, animation,
  reference apps, output, version 1).
- `reference/`: art and links to look at.
  - `selections.txt`: the user's picks from the ascii-art.de collection, a starting point for the tool's
    built-in art (credit the artists).
  - `ascii-art-de/`: the full ascii-art.de catalog (~10MB). **Local only**: git-ignored, not in the repo.
  - A few images and links about ASCII art styles.

## Where the game's docs mention it

`docs/SPEC.md` §14 (project layout) and §16f ("An ASCII art tool"), and `readme.md` (Folders).
