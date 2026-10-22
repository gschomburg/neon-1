# NeoN+1

A minimalist cyberpunk push-your-luck game: hack a corp's network one layer at a time. Each
layer is a grid of nodes. One is real, the rest are ICE. Every corp hides its real node in its
own way (its "tell"), and learning the tells is how you get deeper.

All ASCII, mobile first, plain HTML/JS, no build step.

(Working title in the code: Beta Runner.)

## Play

Open `dist/index.html` in a browser (or upload the `dist/` folder to a web host). That's it, no build step.

- `?seed=WORD` plays a fixed seed. A corp's name as the seed (`?seed=NOIR`) makes every node that corp.
- `?dev=1` (or the backtick key) opens the dev menu.
- Multiplayer (2-6 players, over Firebase): `[ MULTIPLAYER ]` on the title screen.

## Folders

- `dist/`: the game: `index.html` plus its data files (`palettes.js`). The master copy, tracked in git;
  the build number is `VERSION` in the code.
- `prototypes/`: the old versions, frozen, each a standalone snapshot (v01-v11; v08 is the online
  test build, v09 the 74-corp build, v10 adds BONEYARD, v11 is where `dist/` started).
- `docs/SPEC.md`: the living design doc: what's built, version by version, plus the backlog.
- `docs/CORPS.md`: every corp, its tell, its mod, and the build plan by tier.
- `docs/CONTENT.md`, `docs/NAMES.md`, `docs/ART.md`: content reference, naming, art drop-off.
- `tools/tell_odds.js`: `node tools/tell_odds.js` measures how much each corp's tell helps.
- `reference/1TD.html`: One True Door, the game that inspired this one.
- `database.rules.json`: the Firebase Realtime Database rules (pasted into the Firebase console).

## How it was made

NeoN+1 was built in conversation with Claude, Anthropic's AI model, running in Claude Code.

- **The design is mine:** the game, the corps and their tells, what to build and when, and the
  playtesting and feedback after every round.
- **Claude wrote the code:** every version's HTML/JS, plus the generated music, the ASCII art
  placeholders, and the headless tests and bots that check each corp's tell before a build ships.
- **The docs are shared:** Claude keeps `docs/SPEC.md` and `docs/CORPS.md` up to date as the
  living record of what was asked for, what got built and what changed along the way. My ideas go
  into the backlog there until I say to build them.
- **The versions folder is the history:** each round of work started as a fresh copy of the last
  version, and a version gets locked when it's handed off for testing.

## Related games

Three games, each built with Claude, each using the one before it as a reference:

1. **One True Door** (`reference/1TD.html`): made first. Its run structure, items and
   keep-between-runs progression were the starting point for NeoN+1.
2. **NeoN+1** (this repo): built with One True Door as the reference.
3. **HackJack**: a card game built with NeoN+1 as the reference. Rules:
   [github.com/jbakse/hackjack](https://github.com/jbakse/hackjack).
