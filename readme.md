# NeoN+1

A minimalist cyberpunk push-your-luck game: hack a corp's network one layer at a time. Each
layer is a grid of nodes. One is real, the rest are ICE. Every corp hides its real node in its
own way (its "tell"), and learning the tells is how you get deeper.

All ASCII, mobile first, plain HTML/JS, no build step.

(Working title in the code: Beta Runner.)

## How to play

- **A run** starts on the public net, then climbs an overworld map of corps, black markets, data
  caches and safehouses. Each sector ends at OMNI//CORE, a boss that copies a corp you beat; the map
  keeps going, sector after sector, until you cash out or get traced.
- **A corp** is 5 layers, the last one a boss. Each layer is a grid of nodes: tap the one you think
  is real. Hit ICE and you lose 1 integrity and guess again; at 0 you're out. Find it on the first
  try for a PERFECT: +1 integrity and better pay.
- **Tells:** every corp hides its real node its own way: a corner, a signature, a mirror, a shadow,
  a heartbeat, a cipher... The tells are the game: learn them and the odds turn in your favor. The
  codex writes each tell down once you've beaten that corp.
- **Mods and items:** beating a corp's boss gives a mod (passive rules that stack, upgrade, and fire
  in a set order) and markets sell items you use by hand. Your tray holds both.
- **Between runs:** REP and THE BOARD (permanent unlocks), a codex of everything you've found, and
  a runner profile with your handle, logo and colors.

## What's in it

- 81 corps, each with its own tell, boss twist, boss mod, palette, intro art and generated music
  track, from simple ones (BASIC: the real node is the plain one) to strange ones (CIPHER turns every
  letter on screen into symbols; BLACKOUT gets darker every layer; HYDRA grows a new node every time
  you miss).
- Corp levels and corp modifiers (CURSED, RUSH, LOADED, RIVAL...) that change how any corp plays.
- Gear and loot you can rebuild at THE WORKBENCH, pets, fishing at the PIER, ads, and rival hackers.
- An end game: quests (THE DISC, HAD3S, the main quest) that lead into H3AV3N, its maze and the fight with G0D.
- Leaderboards and seed boards (greglytics): share a seed and race the same run.
- 100+ mods and items with rarity tiers, upgrades and a fixed trigger order, plus EXOTIC mods that change
  the rules (eat the ICE instead of avoiding it, play as a zombie, go into debt, bet on a coin flip...).
- Online multiplayer for 2-6 players: a shared run, elimination by integrity, spectators, shared
  cursors and emotes. Host a room and share the code or the link (`?room=CODE`).
- Everything is text on one canvas, so any character can turn into a particle: glitches, wipes,
  fireworks, decoding screens. Mobile first, keyboard friendly.
- An editor for the game's data (palettes, music, art, economy, effects...), a dev menu and THE SHELL, a dev console
  you type into (see How to run).

## How to run

Open `dist/index.html` in a browser. That's it: no build step, no server. It works straight from disk (file://).

- `?seed=WORD` plays a fixed seed, ranked on the seed boards like a seed typed in game ([SHARE] on the title and the results copies this link). A corp's name as the seed (`?seed=NOIR`) makes every node that corp.
- The backtick key opens THE SHELL, any time: type `help`. In a run, its commands come from your deck's SHELL and SUDO
  chips, once ROOT is on your crew. Typing `dev.start` in it turns on dev mode (every command, free; the run is
  practice). Its commands are in `docs/SHELL.md`. On a phone: `[ SHELL ]` in the pause menu.
- `~` (Shift + backtick) or Ctrl + backtick opens the old dev menu, in dev mode only (`dev.start`, or `?dev=1`, which
  also adds a [DEV] button to the footer). Its TRAILER MODE and the H3AV3N jumps were made for recording the trailer.
- Multiplayer (2-6 players, over Firebase): `[ MULTIPLAYER ]` on the title screen.

The tools in `tools/` are Node scripts or HTML pages. Each script prints its usage with `--help`:

```
node tools/test.js             # every automatic check: data round-trips, check.js, tools/checks/tests/, playtest (needs Chrome)
node tools/test.js --quick     # the same without the playtest (about a minute)
node tools/checks/check.js            # fingerprint the game and compare it to tools/checks/golden.json (--accept after a change on purpose)
node tools/checks/playtest.js         # play every corp in headless Chrome, compare to tools/checks/golden-play.json
node tools/checks/g0d_play.js         # G0D.exe plays every corp headless; lists the ones it gets stuck on
node tools/checks/tell_odds.js        # how much each corp's tell helps
node tools/data/economy_file.js     # rewrite a data file through its writer (a round-trip check): also fx_, tutorial_,
                               # art_ and palette_file.js; each prints "unchanged" when the file and writer agree
node tools/data/scene_art.js          # the cutscene art in asxii_art/ -> dist/data/scene_art.js
node tools/endcard/render.js render   # the trailer's end card as a 4K MP4 (open tools/endcard/endcard.html to tweak it live)
```

The editors (`tools/neon_editor.html`, `tools/music_view.html`) open straight from disk in
Chrome. They save into `dist/` with the File System Access API.

## Version

The game is at **v15.00**. The build number is `VERSION` in `dist/engine/core.js`, and the intro screen shows it
("neon+1 terminal // v15.00").

- Versions are `vMAJOR.MINOR`. The minor goes up by .01 for each round of work; the major only when I say so.
- `node tools/bump.js minor` (or `major`, or `v15.10`) changes it everywhere: `VERSION`, the stamp at the top of
  every game file, the `?v=` on every script link in `index.html`, `dist/version.json`, and the corp lists in
  the tool pages.
- The hosted game reads `version.json` and offers an update on the title screen when the server has a newer build.
- A new major needs a new save slot (`STORE_KEY` in `engine/core.js`, `beta_runner.v15.save` now). The first time a
  new major loads, it copies the newest older save over, so nobody starts over. `bump.js` reminds you.
- Every change, version by version, is in `docs/SPEC.md` (the version log, §16n).

### Version history

| Version | What it added |
|---|---|
| v01 | The core: a grid, one real node, integrity, seeded runs, the ASCII look |
| v02 | The overworld map, the first corps and their tells, bosses, items, mods, markets |
| v03 | The item belt, animated mod badges, a mod reward at every stop, corp boss mods |
| v04 | Title, how to play, codex and settings screens; rarity tiers |
| v05 | Corp intros and palettes, generated music, the title cover art |
| v06 | Online multiplayer (Firebase): lobby, elimination, spectators, cursors, emotes, personas |
| v07 | Polish: full-screen menus, music player, death and boss-win moments |
| v08 | The endless map (sectors), 5-layer corps, REP and THE BOARD, run resume |
| v09 | The corp kit: 74 corps with levels and modifiers, RIVAL |
| v10 | Hacker logos and profiles, database rules, multiplayer for everyone, BONEYARD |
| v11 | The NeoN+1 title, CIPHER, HYDRA and BLACKOUT, palettes in their own file, the palette editor, `dist/` |
| v12 | The game split into files: engine, data, and one file per corp; version stamps; link previews |
| v13 | EXOTIC mods that bend the rules (ICE EATER, ZOMBIE, BLOOD MONEY, LEVERAGE, QUANTUM, COIN FLIP, SNOOZE, RAM DOUBLER), the ALL-IN item, corp map codes with levels, mod effects you can see |
| v14 | The H3AV3N release: the loot pass and new gear, H3AV3N and the G0D fight, quests (THE DISC, HAD3S, the main quest end to end), THE WORKBENCH, the effects library, seed boards, G0D.exe, new corps (SIMON, MONTY, FOSSIL, INFIDEL), the new title art, THE SHELL, the INT row. Ends at v14.92, the build the trailer was recorded on |
| v15 | Everything after the trailer (from 2026-11-13) |

## How to deploy

The game lives at [www.gregschomburg.com/neon/](https://www.gregschomburg.com/neon/) (DreamHost, Apache).

1. Commit first, so the bump is its own step.
2. Bump the build: `node tools/bump.js minor`.
3. Check nothing changed by accident: `node tools/test.js` (it fails on any difference; `--accept` on check.js / playtest.js when a change is on purpose).
4. Commit the bump: "Version v15.01: summary".
5. Upload the whole `dist/` folder to `/neon/` by SFTP (FileZilla). Include `dist/.htaccess`: it makes phones
   pick up the new build.
6. If `database.rules.json` changed, paste it into the Firebase console (Realtime Database > Rules).
7. Open the site and check the version on the intro screen.

**The editor online:** uploading `dist/` also puts the editor at `/neon/tools/neon_editor.html`. `bump.js` builds
`dist/tools/` (gitignored) with `tools/deploy_editor.js`: only the editor's files, `../dist/` made `../`, `?v=<build>` on
every script (`/neon/.htaccess` caches scripts for a year), noindex, its own `.htaccess` (no caching). After changing
the editor between bumps, run `node tools/deploy_editor.js` again. **Password-protect `/neon/tools/`** on the server
(DreamHost panel: Htaccess/WebDAV). Saving still writes to your own computer (Chrome asks for your repo's `dist/data`
folder). "edit in asXii" (the ART tab) opens the live asXii (gregschomburg.com/asxii/), online or not.


The leaderboard service (greglytics) has its own repo and deploys on its own: github.com/gschomburg/greglytics.

## Project layout

```
neon-1/
├── readme.md               this file
├── CLAUDE.md               the short working guide for Claude
├── database.rules.json     the Firebase Realtime Database rules (pasted into the console by hand)
├── dist/                   the game: the hand-edited source and the folder you upload
│   ├── index.html          the page; loads every script below in order
│   ├── .htaccess           Apache caching and compression for the hosted copy
│   ├── tools/              the editor's copy for the site (made by tools/deploy_editor.js; gitignored)
│   ├── version.json        the current build, for the update check (written by tools/bump.js)
│   ├── manifest.webmanifest, icon*.png, icon.svg, preview.png   home-screen app and link preview
│   ├── engine/             the code, one file per part (run.js, scene.js, board.js, map.js, music.js, fx.js: the effects library, ...)
│   ├── data/               the game's data: mods, economy, music, quests, palettes, tutorial, fx (the effects' look), ...
│   │   └── art/            the ASCII art: node glyphs, logos, faces, the world map, sector-clear pictures
│   ├── corps/              one file per corp (81)
│   └── lab/                pages that aren't the game, uploaded with it (not linked): infiltr8.html, the INFILTR8 demo
├── tools/                  dev scripts and editors (not deployed)
│   ├── bump.js             change the build number everywhere
│   ├── test.js             every automatic check in one go (exit 1 on a failure)
│   ├── deploy_editor.js    builds dist/tools/ (gitignored): the editor, uploaded with dist/ to /neon/tools/
│   ├── neon_editor.html    the editor: edits the data files in dist/ in place (the page; its code is in editor/)
│   ├── music_view.html     Music View: a piano roll of any track (the MUSIC tab's "piano roll" opens it)
│   ├── endcard/            the trailer's end card: endcard.html (watch it live, with a settings panel), render.js
│   │                       (renders it to MP4), settings.json (the saved look), endcard_art.js (made from asxii_art/)
│   ├── checks/             the automatic checks
│   │   ├── harness.js      runs the game headless: in a Node vm, or as a page in headless Chrome
│   │   ├── tests/          test pages: play a bit, check things (fixes, the end game)
│   │   ├── check.js        fingerprint the game, compare to golden.json (layers, maps, tables)
│   │   ├── playtest.js     play every corp in headless Chrome, compare to golden-play.json
│   │   ├── g0d_play.js     G0D.exe plays every corp headless: where it gets stuck, ICE, no-pay layers
│   │   ├── golden*.json    what the game made last time it was accepted (committed)
│   │   ├── econsim.js      play whole runs headless and report the credits (docs/ECONOMY.md)
│   │   ├── tell_odds.js    how much each corp's tell helps
│   │   ├── music_view_check.js   proves Music View's resolver matches the engine
│   │   └── out/            saved fingerprints and recordings (gitignored)
│   ├── data/               readers and writers for the game's data files
│   │   ├── *_file.js       art, economy, tutorial, fx, palette: the editor saves with them, and
│   │   │                   `node tools/data/x_file.js` checks a file round-trips
│   │   ├── data_file_core.js   what the *_file.js writers share: the stamp line, parsing, quoting, the round-trip main
│   │   ├── quest_dialog.js writes docs/QUEST_DIALOG.md from dist/data/quests.js
│   │   └── scene_art.js    copies cutscene art from asxii_art/ saves into dist/data/scene_art.js
│   └── editor/             the editor's code: one file per tab, and what they share
│       ├── common.js       helpers every tab uses (NEON_ED): the game frame, toasts, IndexedDB, saving a data file
│       ├── editor.css      the editor's styles
│       ├── palette.js      the game frame and its scene buttons, and the PALETTE tab (loads first)
│       ├── music.js        the MUSIC tab
│       ├── demos.js        the music tool's engine demo tracks
│       ├── art.js, training.js, economy.js, fx.js   the tabs that save data files
│       ├── items.js, ads.js, hackers.js             read-only views (ITEMS & MODS, ADS, HACKERS)
│       ├── testing.js, g0d.js, g0d-mold.js          TESTING and G0D: cheats and previews on the running game
│       ├── shell.js        the SHELL tab: every shell command, read from the game
│       ├── help.js         the ? help, per tab
│       ├── nav.js          the tab dropdown, the divider you drag, the game frame's size (loads last)
│       ├── music_view_resolve.js   Music View's resolver (every note a pass plays)
│       └── scrub-field.js/.css     draggable number fields (a copy of gregfont's)
├── docs/                   the design docs
│   ├── SPEC.md             the living spec: what's built, the version log (§16n), decisions (§18)
│   ├── BACKLOG.md          open work: features and ideas waiting their turn
│   ├── REVIEW.md           my review list: things Claude built or decided that I still need to look at
│   ├── meat_notes.md       my raw notes, for Claude to sort
│   ├── CORPS.md, QUESTS.md, SHELL.md, ECONOMY.md, MUSIC.md, ARCHITECTURE.md, ...   topic docs
│   ├── archive/            old planning lists, the v11-v13 version log, old backlog and review items
│   ├── art/                logotype drafts
│   └── mockups/            HTML mockups (the WORKBENCH)
├── asxii_art/              neon's art saved from asXii (its own repo, gregschomburg.com/asxii/); the cutscenes feed
│                           tools/data/scene_art.js, neon_1_4k_v03 feeds the end card
├── _trash/                 files moved aside instead of deleted (gitignored)
├── prototypes/             the old versions, frozen (v01-v11; v11 is where dist/ started)
└── reference/              One True Door (1TD.html), the game that inspired this one, and HackJack
```

The trailer's edit (the FilmCraft project, its build script, music and footage notes) is outside the repo, in
`../video/trailer/`.

## Credits

### How it was made

NeoN+1 was built in conversation with Claude, Anthropic's AI model, running in Claude Code.

- **The idea and the design are mine:** the original game idea, the game, the corps and their tells, what to build and when, and the
  playtesting and feedback after every round.
- **Claude wrote the code:** every version's HTML/JS, plus the generated music, the ASCII art
  placeholders, and the headless tests and bots that check each corp's tell before a build ships.
- **The docs are shared:** Claude keeps `docs/SPEC.md` and `docs/CORPS.md` up to date as the
  living record of what was asked for, what got built and what changed along the way. My ideas go
  into `docs/BACKLOG.md` until I say to build them.
- **The history:** up to v11, each round of work started as a fresh copy of the last version (now in
  `prototypes/`). Since v11 the game lives in `dist/` and git keeps the history; every update
  ticks the build number (v11.00, v11.01...).

### Related games

Three games, each built with Claude, each using the one before it as a reference:

1. **One True Door** (`reference/1TD.html`): made first. Its run structure, items and
   keep-between-runs progression were the starting point for NeoN+1.
2. **NeoN+1** (this repo): built with One True Door as the reference.
3. **HackJack**: a card game built with NeoN+1 as the reference. Rules:
   [github.com/jbakse/hackjack](https://github.com/jbakse/hackjack).
