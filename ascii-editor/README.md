# asXii

## What it is

A standalone tool for making ASCII art: draw or import shapes and get fitting characters, trace a picture, build 3D
blocks and get 3D block lettering, then touch up by hand. Made for NeoN+1's art, but it isn't part of the game and
shares no game code, so it can move to its own repo later.

**Working name:** asXii (needs a real name).

## How to run

Open `dist/index.html` in Chrome. No setup, no server: it works straight from disk (file://).

- Your work autosaves in the browser as you go. That's a convenience, not the real copy: save to a file.
- `dist/index.html?fresh` starts clean (the welcome art) without touching the autosave.
- `dist/index.html?neon=1` is the link to NeoN+1's editor (its ART tab opens asXii this way: `dist/neon-link.js`).
- The theme follows your system (Light or Blue) until you pick one in the top bar.

### Saving

- **Ctrl S** saves the project. In Chrome and Edge it writes straight to the file: the first save asks where, and
  after that Ctrl S writes to the same file, even after a reload. In Firefox and Safari it downloads the file instead.
- **Ctrl Shift S** is Save as: pick a new file.
- **Ctrl O** opens a project.
- Unsaved changes put a `*` before the tab's title and turn the document name italic. New, Open and the Welcome
  screen ask first when there are unsaved changes, and closing the tab warns you. Ctrl Z brings back a replaced
  document either way.
- Projects are `<name>.asxii.json` files, pretty-printed JSON that starts with
  `{ "app": "asXii", "appVersion": ..., "format": 1, "name": ... }`.

## Version

Shown in the header (`v0.149`). Every batch of changes ticks it +0.01:

```
node ascii-editor/bump.js minor "Shape tool"
```

That changes `VERSION` in `dist/app.js`, the header, the `?v=` tags that make a normal reload pick up new files, and
`dist/version.json`. The note is optional; it shows with the update notice. `node ascii-editor/bump.js --help` lists
the options.

**Update notice:** a hosted copy checks `version.json` a few seconds after it loads, when you come back to the tab,
and every 10 minutes. If a newer version has been uploaded, it shows "asXii v0.26 is out · Refresh" (bottom right).
It does nothing when opened as a local file.

## How to deploy

1. Commit first, then bump: `node ascii-editor/bump.js minor "what changed"`.
2. Commit the bump.
3. Upload the contents of `dist/` to the folder it's hosted in, by SFTP. Include `version.json`: hosted copies check
   it to offer the update.

## Project layout

```
ascii-editor/
├── README.md             this file
├── PLAN.md               the plan: layers, tools, the character converter, block mode, canvas, layout, animation, output
├── TOOLBAR.md            the tool settings bar, panels and per-tool settings (Justin's design doc)
├── AUTOTILE.md           Auto characters: cells that pick their character from their neighbors
├── CURSORS.md            the cursor plan and checklist
├── bump.js               change the version everywhere
├── gallery-build.js      keeps dist/gallery/index.json in step with the .txt files, and makes dist/gallery.js
├── start-build.js        bundles dist/start/ into dist/start.js
├── dist/                 the app: the only folder that ships
│   ├── index.html        the page: menus, panels, dialogs
│   ├── style.css         the four themes and all the styles
│   ├── app.js            the editor
│   ├── cursors.js        the cursors the editor draws (cursors.html shows them all, for feedback)
│   ├── fonts.js          FIGlet fonts for the Font tool (generated)
│   ├── neon-link.js      the link to NeoN+1's editor (only with ?neon=1)
│   ├── gallery/          the built-in art, one .txt per piece, listed in index.json
│   ├── gallery.js        the gallery as a bundle, for file:// (made by gallery-build.js)
│   ├── start/            the welcome document and the 3D examples (asXii projects)
│   ├── start.js          start/ as a bundle (made by start-build.js)
│   ├── layers.html       five mockups of a cleaned-up layers panel
│   ├── version.json      the current version, for the update notice
│   └── manifest.webmanifest, icon.svg, icon-*.png   the app icon
├── saves/                your own projects (gitignored)
└── reference/            art and links to look at
    ├── selections.txt    picks from the ascii-art.de collection, a starting point for the built-in art
    └── ascii-art-de/     the full ascii-art.de catalog (~10MB, local only, gitignored)
```

The game's docs mention asXii in `docs/SPEC.md` §14 (project layout) and §16f ("An ASCII art tool"), and in the
NeoN+1 `readme.md`.

## Credits

- Built by Greg Schomburg and Justin Bakse, with Claude (Anthropic) writing much of the code in Claude Code.
- Gallery art: each piece's artist and source are in `dist/gallery/index.json` (the gallery shows the artist). Many pieces
  come from the [ascii-art.de](https://www.ascii-art.de/) collection.
- FIGlet fonts: from the [figlet.js](https://github.com/patorjk/figlet.js) package (MIT). Each font keeps its
  author's notes in its header; the FIGlet format is by Frank Sheeran, Ian Chai and Glenn Chappell.
- Interface font: [JetBrains Mono](https://www.jetbrains.com/lp/mono/), plus IBM Plex Mono, Fira Code, Source Code Pro
  and VT323 to draw with, from Google Fonts.
