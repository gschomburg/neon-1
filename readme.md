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

- 78 corps, each with its own tell, boss twist, boss mod, palette, intro art and generated music
  track, from simple ones (BASIC: the real node is the plain one) to strange ones (CIPHER turns every
  letter on screen into symbols; BLACKOUT gets darker every layer; HYDRA grows a new node every time
  you miss).
- Corp levels and corp modifiers (CURSED, RUSH, LOADED, RIVAL...) that change how any corp plays.
- 100+ mods and items with rarity tiers, upgrades and a fixed trigger order, plus EXOTIC mods that change
  the rules (eat the ICE instead of avoiding it, play as a zombie, go into debt, bet on a coin flip...).
- Online multiplayer for 2-6 players: a shared run, elimination by integrity, spectators, shared
  cursors and emotes. Host a room and share the code or the link (`?room=CODE`).
- Everything is text on one canvas, so any character can turn into a particle: glitches, wipes,
  fireworks, decoding screens. Mobile first, keyboard friendly.
- A palette editor and a tell-odds tool for tuning (see Folders).

## Play

Open `dist/index.html` in a browser (or upload the `dist/` folder to a web host). That's it, no build step.

- `?seed=WORD` plays a fixed seed. A corp's name as the seed (`?seed=NOIR`) makes every node that corp.
- `?dev=1` (or the backtick key) opens the dev menu.
- Multiplayer (2-6 players, over Firebase): `[ MULTIPLAYER ]` on the title screen.

## Folders

- `dist/`: the game (upload the whole folder). `index.html` is the page; the code is in `engine/`, the data in
  `data/`, each corp in its own file in `corps/`, every palette in `palettes.js`. The master copy, tracked in
  git; the build number is `VERSION` in `engine/core.js` (`node tools/bump.js minor` ticks it everywhere).
- `prototypes/`: the old versions, frozen, each a standalone snapshot (v01-v11; v08 is the online
  test build, v09 the 74-corp build, v10 adds BONEYARD, v11 is where `dist/` started).
- `docs/REVIEW.md`: my review list: things Claude built or decided that I still need to look at.
- `docs/SPEC.md`: the living design doc: what's built, version by version, plus the backlog.
- `docs/CORPS.md`: every corp, its tell, its mod, and the build plan by tier.
- `docs/CONTENT.md`, `docs/NAMES.md`, `docs/ART.md`: content reference, naming, art drop-off.
- `tools/palette_editor.html`: the palette editor (open it in Chrome): edit `dist/palettes.js` with the game
  running beside it, and save straight to the file.
- `tools/check.js` and `tools/playtest.js`: "did anything change?" A fingerprint of the game (every corp's
  layers, maps, data, code) and a headless playthrough of every corp, compared to a saved baseline.
- `tools/bump.js`: change the build number everywhere.
- `tools/tell_odds.js`: `node tools/tell_odds.js` measures how much each corp's tell helps.
- `reference/1TD.html`: One True Door, the game that inspired this one.
- `database.rules.json`: the Firebase Realtime Database rules (pasted into the Firebase console).

## How it was made

NeoN+1 was built in conversation with Claude, Anthropic's AI model, running in Claude Code.

- **The idea and the design are mine:** the original game idea, the game, the corps and their tells, what to build and when, and the
  playtesting and feedback after every round.
- **Claude wrote the code:** every version's HTML/JS, plus the generated music, the ASCII art
  placeholders, and the headless tests and bots that check each corp's tell before a build ships.
- **The docs are shared:** Claude keeps `docs/SPEC.md` and `docs/CORPS.md` up to date as the
  living record of what was asked for, what got built and what changed along the way. My ideas go
  into the backlog there until I say to build them.
- **The history:** up to v11, each round of work started as a fresh copy of the last version (now in
  `prototypes/`). Since v11 the game lives in `dist/` and git keeps the history; every update
  ticks the build number (v11.00, v11.01...).

## Version history

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

The full record (every change, and the ideas still waiting) is in `docs/SPEC.md`.

## Related games

Three games, each built with Claude, each using the one before it as a reference:

1. **One True Door** (`reference/1TD.html`): made first. Its run structure, items and
   keep-between-runs progression were the starting point for NeoN+1.
2. **NeoN+1** (this repo): built with One True Door as the reference.
3. **HackJack**: a card game built with NeoN+1 as the reference. Rules:
   [github.com/jbakse/hackjack](https://github.com/jbakse/hackjack).
