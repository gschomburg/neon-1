# Beta Runner — Game Spec

> Living document. Add to it as decisions are made. Mark anything undecided as **OPEN**.
> **Content reference:** every corp (with what its tell really does and its weights), mod, item and payout rule is listed in [CONTENT.md](CONTENT.md), written from the v08 code.
> **Name ideas:** [NAMES.md](NAMES.md) (Beta Runner is the working title).
> **Corp brainstorm (50 corps):** [CORPS.md](CORPS.md). The user's own corp ideas stay in §17.
> Last updated: 2026-10-20

## 1. Pitch

A minimalist push-your-luck game. You are hacking deeper into corporate networks. Each layer shows tiles on a grid; one is the real path, the rest are traps. Pick right to go deeper. Pick wrong and you take damage, or the run ends.

The hook: **the safe tile isn't purely random.** Each corp picks it with its own hidden logic. Learn how a corp "thinks" and you beat it.

Theme is cyberpunk / network intrusion, but kept **light** for now. Gameplay first.

Inspiration: `reference/1TD.html` (One True Door). Its run structure, items/relics, and keep-between-runs progression are a good base. Its weakness, which we want to fix: every pick is pure chance, so there are few real decisions.

## 2. Core rules (v01)

| Rule | Value |
|---|---|
| Board | 4x4 grid (16 cells) |
| Layer N shows N tiles | Placed in random cells of the grid |
| Exactly one tile per layer is safe | Chosen by the RNG (later: by the corp's ruleset) |
| Layer 1 | A single tile, always safe ("jack in" moment) |
| Pick the safe tile | Advance to the next layer |
| Pick a trap tile | Lose 1 Integrity; that tile is locked out; pick again on the same layer |
| Integrity hits 0 | Run ends |
| Starting Integrity | 3 (**OPEN** — tune) |
| Score | Deepest layer reached |
| Seed | Every run has a seed; shown on screen and on game over |

**OPEN:** Should some trap tiles end the run outright (instant kill), rather than every trap doing 1 damage?

### Grid size

The grid is not fixed at 4x4. It can **grow or shrink** over a run:
- Grows when the tile count needs more room (e.g. a modded run with more than 16 tiles)
- Corps can set their own size or shape (e.g. 3x3, 5x5, a tall 4x6)
- Some upgrades or corp effects might shrink it

Rule of thumb (to tune): the grid should always have some empty cells, so tile placement means something. E.g. use the smallest grid where tiles fill no more than ~75% of cells.

Grids don't have to be square. On a phone held upright, tall grids (4x5, 4x6) use the screen better than wide ones.

**OPEN:** Does tile count reset per corp (see §6), or grow across the whole run?

### Glossary (working names, easy to change)
- **Tile**: an option the player can pick (the "door")
- **Layer**: one step deeper into a network
- **Corp**: a network you hack; has its own rules, tells, and boss
- **Integrity**: player health
- **Tell**: a corp's hidden bias in where it places the safe tile
- **Scan**: an ability that checks several tiles at once
- **ICE**: what's behind a trap tile (flavor)

## 3. Math notes

Pure guessing (v01 rules, retry after a miss), simulated over 200k runs:

| Starting Integrity | Average layer at death | Median | 90th percentile |
|---|---|---|---|
| 1 | 2.7 | 2 | 4 |
| 2 | 3.7 | 4 | 5 |
| 3 | 4.4 | 4 | 6 |
| 4 | 5.0 | 5 | 6 |
| 5 | 5.4 | 5 | 7 |

Takeaway: pure guessing makes runs **very short**, and extra health barely helps because tile count grows every layer. Getting deeper must come from **skill** (reading corp tells) and **tools** (scans, items). That's the design's backbone.

## 4. Seeds

All randomness comes from a seeded RNG, never `Math.random()`. Build this into v01: it's cheap now and painful to add later.

- Each run gets a seed (random by default; can be typed in or passed in the URL, e.g. `?seed=ABC123`, for playtesting)
- Derive separate seeds per thing, e.g. `hash(runSeed, corp, layer)` for the safe tile, so shop purchases or item use don't change where the safe tiles are. Same seed = same answers, always.
- Seed shown on game over, with a "replay this seed" button

**OPEN:** Replaying a seed means you can memorize the answers. Proposal: replays (and typed-in seeds) are "practice": they give no souls / meta rewards. Unlocking seed replay could itself be a meta upgrade, as suggested.

**Idea:** daily seed. Everyone gets the same run that day; compare depth.

## 5. Corps and tells

Each corp has:
1. **A tell**: how it picks the safe tile. Should be a *tendency* (e.g. 70% of the time), not a hard rule, so it's learnable but not solved.
2. **Modifiers**: gameplay changes (strengths)
3. **A weakness**: something the player's tools exploit
4. **A grid layout** (optional): not every corp has to be 4x4
5. **A boss** that twists the corp's own tell or modifier

Example corps (placeholder names):

| Corp | Tell / modifier | Weakness | Boss twist |
|---|---|---|---|
| Perimeter Systems | Safe tile tends to be on the outer edge | Row/column scans along edges | Tell flips: safe tile is now in the center |
| Chronos | 10-second timer to pick, or a random pick is made for you | Pays more gold per layer | Timer shrinks after every miss |
| Flux Dynamics | Tiles shuffle positions after every miss | Shuffle lets you see tiles move; safe tile moves "lazily" | Tiles move continuously |
| Mirrorline | Safe tile mirrors the last layer's safe position | Very readable once spotted | Mirror axis changes each layer |
| Hive | Safe tile sits next to the most other tiles (clusters) | Cross (+) scans | Traps also cluster, and decoy clusters appear |

### Glyph tells

Every tile shows a small piece of ASCII art. The art can be part of a corp's tell.

- Example: this corp's safe tile *always* has an `X` on it, but several trap tiles also have an `X`. The tell doesn't give you the answer. It cuts the choice from N tiles down to a few.
- This is the main way tells become *visible*. Position tells (edge, cluster) are about where tiles sit; glyph tells are about what's on them. A corp can use one or both.

More glyph-tell ideas:
- Safe tile's glyph matches the previous layer's safe glyph
- Safe tile is the "odd one out" (e.g. the only glyph with a mistake or variation in it)
- Glyph density: the safe tile has the most (or fewest) characters
- Glyphs *on trap tiles* hint at nearby traps, a little like Minesweeper numbers
- Scrambled glyphs that a scan or item can decode

In v01, glyphs are random decoration with no meaning, so v02 can give them meaning.

**Idea:** a "recon" step (map node or item) that reveals part of a corp's tell before you hack it.

**Idea:** the game remembers what you've learned. After you beat a corp, its tell shows up in a codex.

### Corp-specific boss loot

Beating a corp's boss could drop loot tied to that corp. Example:

**OVERCLOCK** (from beating the Chronos boss): every layer gets a clock. As it runs down, invalid nodes get eliminated one by one, but the reward for a correct pick shrinks the longer you wait. Waiting is safe but costs money, so it becomes a choice instead of a free win. To keep it from being overpowered:
- limited charges, or only works once per corp, or
- it only starts eliminating in the last few seconds, or
- each elimination costs a % of that layer's payout

Variant: at 1 second left it gives a clue (e.g. flashes the real node's row) instead of eliminating.

## 6. Run structure: the overworld map

- A **branching tree** map (Slay the Spire style). You pick your route.
- Most map nodes are **corps**. Each corp = a few layers + its boss.
- Other node types (ideas): shop, repair (heal), recon (learn a tell), black market (risky deals).

**OPEN:** Does tile count keep growing across the whole run, or does each corp have its own range (e.g. an early corp uses 2–6 tiles, a late one 6–12)? Per-corp ranges solve the 16-tile cap and let corps set their own difficulty.

**Idea: jack out.** At the end of a corp you can cash out (bank your gold/loot safely) or push into the next corp. A push-your-luck decision at the map level, not just per tile.

## 7. Scans (area-check upgrades)

Clicking a tile checks a **pattern** of tiles around it at once. If any checked tile is safe, you pass.

| Pattern | Cells checked (4x4) |
|---|---|
| Single | 1 (default) |
| Cross (+) | up to 5 |
| Diagonal (X) | up to 5 |
| Row | 4 |
| Column | 4 |

Scans are strong on a 16-cell grid, so they need a cost. Options:
- Limited charges per corp/layer
- No "perfect" bonus when you pass via a scan
- **Risky variant:** if the scan misses, *every* trap it touched hits you. Big scans become a gamble, not a free win.

Scans pair with corp tells: an edge-biased corp is weak to edge rows, a cluster corp to cross scans. That's where most of the build decisions come from.

## 8. Bosses

Bosses should feel special (1TD's "Warden's Gate" was just a bigger payout). Each corp boss twists its corp's tell or modifier (see §5 table). Ideas for general boss rules:
- The boss layer reveals *something* about its trick only after your first miss
- Bosses can break your tools (e.g. scans disabled for one layer)
- Beating a boss drops a corp-specific upgrade

## 9. Items, upgrades, and meta progression

Keep the 1TD model:
- **Consumables** (single use): e.g. remove a trap tile, heal, shield, reveal a row
- **Upgrades / relics** (whole run): e.g. new scan patterns, more gold, tell hints
- **Meta progression**: earn a currency on death, spend it on permanent unlocks (starting Integrity, new upgrades in the pool, seed replay)

Specific items: TBD, after the core and corps are proven.

## 10. Multiplayer (out of scope for now)

Not part of the early versions. Kept here so the idea isn't lost.

**Hot-seat, hider vs seeker:** Player 2 secretly picks the safe tile, Player 1 tries to find it. Then swap. Whoever gets deeper wins.
- It's the corp-tell idea with a human mind behind it. The corps are basically bot hiders with personalities.
- Start as pass-the-device on one screen. Online play is a much bigger project.

**OPEN:** Does the hider get anything to play with (e.g. a budget of trap types, or decoys)?

**Less downtime variant:** both players hide for each other at the same time, then swap boards and both seek.

### Mode idea: "Jenga" shared run

The game places the real node as normal (seeded); players take turns on the **same run**: layer 1 is player 1's, layer 2 (one more node) is player 2's, and so on.
- **One pick per turn.** Hit ICE: you take the damage *and* the turn passes to your opponent on the same layer, now with one fewer node. Your mistake improves their odds.
- Find the real node: you clear the layer; the next (bigger) layer starts with the other player.
- Each player has their own integrity; whoever runs out first loses (the "topple").
- Corp tells apply to both, so reading tells is the edge. Each player has their own tray.
- Sabotage items could make it shine: add a node to your opponent's next layer, scramble their glyphs, shorten their clock.

### Tech / hosting

| Option | Needs | Effort |
|---|---|---|
| Same device (hot-seat) | nothing | small |
| Online turn-based (async) | small hosted database + a way to identify players (accounts or a share link); notifications optional | medium |
| Online live | realtime rooms with join codes, relaying moves, handling disconnects (PartyKit / Firebase / Supabase Realtime) | medium-large |

- Cheap to host: a game's state is just the seed + the list of moves; free tiers likely cover a prototype.
- **Cheating:** if both clients know the seed they can compute the answers, so online the **server owns the seed/answers** and only reveals a node when it's picked. Seed + moves also lets any game be replayed to verify it.
- **Suggested path:** prototype the Jenga mode as **hot-seat** first (no server, reuses everything); only go online if it's fun, starting with room codes on a hosted realtime service.

## 11. Presentation: ASCII

Everything is drawn in text characters, in a monospace font.

**Look:** classic ASCII art / BBS / old terminal, not busy.
- Tiles are dashed or box-drawn frames with a small glyph inside, e.g.
  ```
  +- - - -+    ┌┄┄┄┄┄┐
  :  /\   :    ┊ [X] ┊
  :  \/   :    ┊ ░░  ┊
  +- - - -+    └┄┄┄┄┄┘
  ```
- Mostly dark background, one or two accent colors (e.g. cyan for the player/safe, red for traps, dim green or grey for everything else)
- Lots of empty space. Calm by default, so that effects stand out when they happen.
- HUD is text too: corp, layer, Integrity (e.g. `[###-]`), seed, best layer
- **Odds readout** (from 1TD): shows the current chance of a random pick being real, e.g. `ODDS 1 IN 5  20%`, plus open nodes left (`OPEN 04/05`). Updates as ICE gets locked out. Later, tells and items can change what this shows (e.g. "your odds among X-tiles").

**Effects:** characters are the particles.
- Inspired by the Matrix "digital rain" feel, without copying it: no falling green code walls
- Wrong pick: the tile glitches briefly, then **stays on the board, bold and red**. No shatter. (Changed in v02.)
- Safe pick: the whole board **falls apart**, blown outward from the real node. (v01 used a suck-in; v02 moved the fall-apart effect here.)
- Death: real node is revealed, then characters **blink out one by one at random**, with a little glitching (flicker, small horizontal jumps, red flashes). No falling.
- Screen transitions (menu, map, entering a node): characters get sucked into one point
- New layer or screen: characters "decode" in from scrambled noise

### Art sizes (rule)

Stick to these when making or changing art (set 2026-10-20):
- **Title area:** 32 wide x 20 tall, the face + BETA RUNNER logo together (the tagline sits below it).
- **Corp logos:** at most 24 wide x 12 tall, for every corp (new ones too).
- Screen is 36 columns. Even widths center exactly; odd widths sit half a character left (OK for art with one center column).
- Art drop-off: `docs/ART.md` (blank frames at these sizes).

### Buttons (UI rule)

It should always be clear what can be tapped. Where space allows:
- **Primary buttons** (one main action per screen: JACK IN, BREACH, BUY, TAKE): a box 3+ rows tall, `+===+` frame, label in the accent color, slow pulse or occasional glitch. Optional small dim subtitle inside.
  ```
  +=======================+
  |       J A C K  I N    |
  |     - - start run -   |
  +=======================+
  ```
- **Secondary buttons** (LEAVE, SKIP, RETRY, menu items): single line in square brackets, `[ LEAVE ]`.
- **Square brackets mean tappable.** Plain text never uses them. Places to fix:
  - Empty item slots `[  .  ]` aren't tappable, so restyle them, e.g. `:  .  :`
  - Mod badges are tappable but have no brackets; consider a subtle marker (e.g. underline row or brackets on hover/select)
  - Map nodes `[P]` are fine (tappable)
- Tight spaces (tray, map, list rows) can stay compact, but follow the bracket rule.

### Palettes

Different console color schemes, like IDE themes. Options for how they're used (**OPEN**, maybe all three):
- A setting the player picks
- Unlockables
- Each corp has its own palette, so you can tell where you are at a glance

v02 has 5 to try from the dev menu: DEFAULT, AMBER CRT, GREEN CRT, DUSK, PAPER (light mode). All colors come from one table, so adding more is easy.
- Effects stay short and sparse. One strong effect per event, not constant motion.

**Tech note:** draw the whole screen on one canvas as a grid of character cells. Then every character on screen is already an object that can become a particle, which makes the explode/vortex effects easy.

**Audio:** minimal for now (a few beeps). Later, maybe 1TD-style procedural sound.

v01 gets the basic ASCII look and at most one simple effect. Polish comes later.

## 12. Platform: mobile first

The game should be **mobile friendly**: portrait phone screen, touch input.
- Layout is designed for a phone held upright first, then scales up to desktop
- Tap targets stay at least ~44px, even on big grids. That sets a real limit on grid size on phones (roughly 6 columns on a small phone).
- The character-cell renderer scales its font/cell size to fit the screen
- When the grid gets too big for the screen, options: smaller glyphs, simpler tile frames, or zoom/scroll (**OPEN**, deal with it when we hit it)
- Keyboard/mouse also work on desktop

## 13. Tech

- Plain HTML + CSS + JavaScript, one self-contained `beta_runner_vXX.html` per prototype (same approach as the reference)
- No build step, no dependencies; open the file in a browser to play
- Main test browser: desktop Chrome, opening the file directly from disk, plus Chrome's phone emulation for mobile layout
- Seeded RNG (e.g. mulberry32 + a string hash)

### Dev menu

For testing. Open with **`** (backtick), or add `?dev=1` to the URL to get a tappable `[DEV]` button (for phones).
- Switch palette
- Show the real node
- Toggle each mod on/off
- +100 credits, full integrity, fill the belt with items
- Jump to a boss: the current corp's, or the corp selected on the map
- Jump to the final boss
- Any cheat marks the run as practice (not scored)

### Local player data

Saved in `localStorage`: best scores, run history, meta progress, settings.
- Works when opening the HTML file directly from disk in Chrome
- Chrome treats **all** local files as one site, so every version shares one storage space. Each version uses its own key prefix, e.g. `beta_runner.v01.`, so versions don't overwrite each other.
- Save data includes a version number, so later versions can read or migrate older saves if we want
- Wrap all storage reads/writes so the game still works if storage is unavailable

### If this becomes a real app

Not a decision yet, just options:
- **Capacitor**: wraps the same web code as an iOS/Android app. Probably the best fit for a mobile-first game.
- **Electron**: wraps it as a desktop app (Windows/Mac/Linux). Good for a Steam release, not for phones.
- **PWA**: installable from the browser, works offline, no app store needed. Cheapest option.
- A native rewrite (e.g. Godot, Unity) only if web tech hits a wall.

Keeping the game as plain web code keeps all of these options open.

## 14. Project layout

The git repo is `neon-1/`.

```
neon+1/
  neon-1/                <- the repo
    readme.md
    reference/
      1TD.html           <- One True Door, the inspiration
    database.rules.json  <- Firebase Realtime Database rules (pasted into the console)
    docs/
      SPEC.md            <- this file
      CORPS.md, CONTENT.md, NAMES.md, ART.md
    tools/
      palette_editor.html  <- edit dist/palettes.js with the game beside it
      check.js           <- fingerprint the game (data, layers, maps, code) and compare builds
      playtest.js        <- play every corp in headless Chrome and compare builds
      bump.js            <- change the build number everywhere (node tools/bump.js minor)
      tell_odds.js       <- how much each position tell helps
    dist/                <- THE GAME: the master copy, tracked in git (upload this whole folder)
      index.html         <- the page: meta tags, then every script below, in load order
      palettes.js        <- every palette and player style (the palette editor writes it)
      icon.svg, icon-180.png, preview.png   <- tab icon, phone home-screen icon, link preview
      engine/            <- the game's code by job (v12): core, corpkit, corps, mods, layers, map, save,
                            sound, music, screen, effects, scene, screens, render, run, panels, help,
                            codex, menus, active, input, dev, multiplayer, boot, editor
      data/              <- pure data: glyphs, title art, personas, mods + items, music tracks
      corps/             <- one file per corp (78): its definition, its own helpers, codex text, intro art
                            and music (its boss mod is noted at the top; it lives in data/mods.js)
    prototypes/          <- old versions, frozen (was versions/)
      v01_core/beta_runner_v01.html
      v02_overworld/ ... v06_online/
      v07/ v08/ v09/ v10/
      v11/beta_runner_v11.html   <- where dist/ started
```

Since 2026-10-21 (the user's call) there is one master copy, `dist/`, and git keeps the history.
**Build numbers: `vMAJOR.MINOR`** (`VERSION` in the code; shown in the header, the footer and on the title).
The minor ticks +.01 with every update Claude makes to `dist/` (one tick per batch of changes handed over,
logged in the version log in §16n). The major changes only when the user says so (v12.00 ...). The save
slot follows the major only (`beta_runner.v12.save`; v12 copies the v11 save over the first time), so
minor updates keep progress. **`node tools/bump.js minor`** ticks the build everywhere (VERSION, every file's
stamp, the `?v=` links). The user uploads `dist/` by FTP. If a build needs to stay playable for testing while
work goes on (like v09 / v10 were), copy `dist/` into `prototypes/vNN/` and tag the commit.

The prototypes (v01-v11) are standalone snapshots from before: folder `vXX` (early ones `vXX_<topic>`),
file `beta_runner_vXX.html`. v11 also has its own `palettes.js`.

## 15. Versions (proposed roadmap)

Order is by risk: test the most important unproven idea (corp tells) early.

| Version | Folder | Goal | Status |
|---|---|---|---|
| v01 | `prototypes/v01_core/` | 4x4 grid, layer N = N tiles, Integrity, game over, restart, seeded RNG, basic ASCII look | Built, needs playtest |
| v02 | `prototypes/v02_overworld/` | Overworld map, 4 corps + final corp with tells and bosses, merchant, caches, safehouses, items, mods, loot ICE, dev menu, palettes | Built, needs playtest |
| v03 | `prototypes/v03_mods/` | Always-visible item belt + starting item, animated mod badges with info, a mod reward at every location, corp-specific boss mods, active mods (layer and map), market rework, skip straight into PUBLIC NET | Built, needs playtest |
| v04 | `prototypes/v04_polish/` | Title/how-to/codex/settings screens, boxed buttons, rarity tiers + escalating reveals, market colors, tray info layout, scroll-fill wipe, Sigil levels, corp tiers | Built, needs playtest |
| v05 | `prototypes/v05_boot/` | Corp intros + corp palettes, generated music, title round 2 (cover art), consistent hover, sound pass | Built, needs playtest |
| v06 | `prototypes/v06_online/` | Online multiplayer over Firebase: 2-6 players, elimination, spectators, lobby + next game, shared cursors, emotes, profiles, turn clock, kick, persona | **Locked** (for multiplayer testing) |
| v07 | `prototypes/v07/` | Polish on v06: menus full screen, How to Play rework, music player, death / boss-win music + transitions, fail and breach reveals, editable seed, persona names/colors | **Locked** |
| v08 | `prototypes/v08/` | Built on v07: mods & corps round (tiers, swaps, new mods), boss entrance, then the endless map (sectors, 5-layer corps, SKIPJACK, cash out, REP + THE BOARD, run resume) | **Locked** (online test build) |
| v09 | `prototypes/v09/` | Built on v08: corp kit, corp levels + modifiers, all 74 corps (tiers 1-3), RIVAL, sector bosses rethink | **Locked** (2026-10-21, for testing the corps) |
| v10 | `prototypes/v10/` | Built on v09: hacker logos + profile, database rules, multiplayer open to all, BONEYARD (corp 75) | **Locked** (2026-10-21) |
| v11 | `prototypes/v11/` | Built on v10: NeoN+1 title, CIPHER / HYDRA / BLACKOUT, palettes.js + slot rename | Moved to `dist/` (2026-10-21) |
| dist | `dist/` | The master copy from here on: v11.00-v11.06, then **v12** (split into files) | **Current** |
| later | | Scans, balance pass | Idea |
| later | | Hot-seat multiplayer (out of scope for now) | Parked |

## 16. v02 as built

**Run:** title → map → PUBLIC NET (1-node layer) → pick a route up the map → OMNI//CORE (final). Win by clearing the final boss.

**Map:** 6 steps, bottom to top. Steps 1–4 have 3 lanes; each node links straight up and sometimes diagonally. Node types: corp (`P S C M`), market (`$`), cache (`?`), safehouse (`+`), final (`!`). Tap a node to see its info, tap again or press [ BREACH ] to enter. The whole map comes from the seed.

**Corps:** 3 layers + a boss layer. Tier 1 (steps 1–2): 2, 3, 4 nodes, boss 5. Tier 2 (steps 3–4): 3, 4, 5, boss 6. Final: 4, 5, 6, boss 7.

| Corp | Tell | Boss twist |
|---|---|---|
| PERIMETER SYS (P) | real node is in a corner (75%) | real node is in the center cells |
| SIGIL DYNAMICS (S) | real node always shows the X glyph; ~40% of decoys do too | X glyphs vanish after ~2s |
| CHRONOS (C) | none; 10s clock per pick, pays x1.6 | clock shrinks 3s per miss (min 3s) |
| MIRRORLINE (M) | real node mirrors the last layer's real node, left-right (75%) | mirrors through the center instead |
| OMNI//CORE (!) | random one of the above tells, unknown; 12s clock; pays x2 | ICE hits for 2 |

**Health:** start with 4 Integrity. A perfect (first-try) pick restores 1. Safehouse +2, market repair +1. Simulation: a player who reads tells wins ~30% of runs, a pure guesser almost never.

**Credits:** each real node pays `(4 + 2 x nodes)`, x3 on bosses, x corp multiplier. A perfect pick multiplies by `1 + 0.5 x (nodes - 1)`.

**Loot ICE (`$`):** some layers have one node showing `$`. It's always ICE (costs Integrity) but drops credits or an item. The safe node never shows `$`, so hitting it is a deliberate trade.

**Items** (belt of 4, tap or keys 1–4): PATCH (+1 integrity), PURGE (lock out one ICE), FWALL (block the next hit), SPLIT (rules out the half of the grid without the real node).

**Mods** (passive, from bosses, market, caches): TRACER (ICE you hit shows its distance to the real node, the Wordle-ish clue), SKIMMER (+50% credits), BUFFER (+1 max integrity), SNIFFER (each layer starts with one ICE locked).

**Boss reward:** pick 1 of 2 mods, or skip for credits.

All tuning numbers live in `CONFIG` at the top of the script.

## 16b. v03 changes

**Run start:** no map pick first. JACK IN drops you straight into PUBLIC NET's single node, then you pick a starter perk (1 of 3 minor mods, or +15cr), then you see the map.

**Bottom tray** (always on screen during a run, 5 rows reserved):
- Mods row: animated badges. Each badge is an icon character that cycles through frames, plus the 3-letter code. The letters animate too, a different style per mod: wave (letters bob), color cycle, blink, scramble (brief glitch), spin. Colors: general = cyan, minor = gold, corp = white.
- Item belt: every slot is drawn, even empty ones (`[  .  ]`). Everyone starts with 1 PURGE (the 1TD torch).
- Two info lines: tap (or hover) a mod or item to see its name and what it does. Tap again to use it (items, active mods). Number keys still use items right away on desktop.

**Every location gives a mod:**

| Location | Reward |
|---|---|
| PUBLIC NET | pick 1 of 3 minor mods (or +15cr) |
| Corp boss | pick: 1 corp-specific mod or 1 general mod (or +20cr) |
| Data cache | credits/item loot, then pick 1 of 2 mods |
| Safehouse | +2 integrity, then pick 1 of 2 minor mods |
| Black market | buy 3 items, 2 mods, repair |

**Mod list:**

| Mod | Kind | Effect |
|---|---|---|
| TRACER | general | ICE you hit shows its distance to the real node |
| SKIMMER | general | +50% credits |
| BUFFER | general | +1 max integrity |
| SNIFFER | general | each layer starts with 1 ICE locked |
| BURNER | general, active | tap in a layer: lock 1 ICE. Once per corp |
| REROUTE | general, active | tap on the map: reshuffle every node ahead (2 charges) |
| WORMHOLE | general, active | tap on the map: warp to a random node ahead (1 charge) |
| STASH | minor | +1 item slot |
| HAGGLE | minor | market prices -25% |
| CACHEKEY | minor | caches drop double loot |
| COOLANT | minor | +3s on every clock |
| CORNERS | Perimeter | layer start: lock 1 corner ICE |
| BULWARK | Perimeter | first ICE hit in each corp is blocked |
| SIGSCAN | Sigil | lock 1 ICE that shows the real node's glyph |
| FORGERY | Sigil | `$` nodes do no damage |
| OVERCLOCK | Chronos | every layer gets a 15s clock; from 6s left it purges 1 ICE every 2s (max 3), each purge cuts the payout 20% |
| FASTPAY | Chronos | picks made within 3s pay x1.5 |
| ECHO | Mirrorline | hit ICE: its mirror-image ICE node locks too |
| AFTERIMAGE | Mirrorline | marks where the last layer's real node was |

**Black market rework:** a list of offers (one line each: name, type, price). Tap one to select it (`>`). A details box under the list shows its description and a [ BUY ] button, or why you can't buy it.

## 16c. v04 changes (built from the pending list)

All items below were built in `v04_polish/beta_runner_v04.html`. Notes on how they turned out:
- **Mod rarities:** COMMON = the 4 minor mods; RARE = SKIMMER, BUFFER, BURNER, REROUTE; EPIC = TRACER, SNIFFER; EXOTIC = WORMHOLE (the only one so far); BOSS = all corp mods. Badge animation scales with rarity: common = icon only, exotic = rainbow wave, boss = bold.
- **Reward screens** now use the same layout as the market: a list (pops in one by one, random order), a details box, one boxed primary button (TAKE / BUY), and a `[ SKIP ]` / `[ LEAVE ]` secondary.
- **Sigil levels** map to tier: tier 1 corps = level 1 (random signature glyph per visit), tier 2 = level 2 (X shape, random characters per tile), final corp = level 3 (`x` characters, random arrangement per tile). SIGSCAN now locks a "signed" ICE node, so it works at every level.
- **Corp tiers so far:** Mirrorline tier 2 mirrors top-bottom; Chronos tier 2 is an 8s clock paying x1.8. Perimeter is unchanged for now.
- **Wipe (reworked after first look):** the first version just swapped characters for fill as a thin band passed (~40ms per row, so no visible interaction). Now each character reacts when the front reaches it: it flickers, turns to noise, gets bumped up slightly, decays into `. : , '`, then becomes fill (~0.25s per character). Empty cells fill instantly, so text visibly "takes longer to go under". Wiping in is the reverse: fill lights up into noise and resolves into the new characters. Front crosses the board in ~0.3s. Timings live in `WIPE_TIME`.
- **Wipe overlap (cross-fade):** the new screen no longer waits for the old one to finish. Its front starts rising once the old front is ~45% of the way up (~80% for success wipes, so the lit node gets its moment). Mid-transition you see three bands: old screen breaking down at the top, scrolling fill in the middle, new screen building at the bottom. Tunable: `wipeOverlap`, `wipeOverlapWin` in `CONFIG`.
- **Wipe stagger:** each character gets its own random delay (up to `wipeStagger`, 300ms wipe-time) and a slightly different change speed (0.7–1.3x). Going out, a character can hold on as itself in the fill for a moment before breaking down. Coming in, characters keep cycling noise after the front passes, so a few are still resolving after the fill has scrolled off.
- **Wipe fills:** denser now (about 50–80% filled; empty space is fine but the first versions were too sparse). Two kinds, picked at random per wipe:
  - **Patterns:** 4-row repeats so the upward scroll is visible (chevrons, dashes, checker streams; success set: double chevrons, arrows).
  - **Noise:** random characters fixed in place so the whole field scrolls up together (not re-randomized each frame, which would just flicker). Includes "streams", where each column cycles `. : |` with a random offset so columns ripple, and plain noise fields (`.:;+=` quiet, `:;+=*#%` success).
  - All in `FILLS`; easy to add more (later: per-corp fills).
- **Wipe strengths:** quiet version for page changes; success version (real node stays lit, accent-colored fill, sparks, sweep sound) for safe picks; bigger for perfect picks and boss clears. Taps are ignored mid-wipe.
- **Codex GLYPHS tab:** all 22 tile glyphs (18 normal + PROMPT `>_`, LOADED NODE `$`, SIGIL SIGNATURE, REDACTED `???`). Each has a name and silly lore, shown next to the tile art (e.g. THE WATCHER: "it saw you jack in. it says nothing. it judges."). A glyph counts as found the first time it appears on a board. Lore lives in `GLYPH_LORE` / `SPECIAL_GLYPHS`; keep lines under 26 characters.
- **Settings:** palette, sound, effects (FULL / REDUCED = no shake or flash), items (TAP TWICE / TAP ONCE), new seed / enter seed, reset save (tap twice). Palette is still in the dev menu too.
- **Game over** gained a `[ TITLE ]` button so you can reach the codex and settings after a run.
- **Health bar** in the HUD lost its brackets (bracket rule); shows as `####--`.

Original pending list, for reference:
- Map node info: drop the "no special rules." line. Only show the rules line when a corp has something special (e.g. Chronos's clock and pay, OMNI's clock/unknown tell/pay).
- **Title screen cleanup:** move the instructions off the title so it can look cooler (e.g. a big ASCII logo). Buttons: [ JACK IN ], [ HOW TO PLAY ], [ CODEX ], [ SETTINGS ], plus best / runs / wins.
- **How to play screen:** the instructions now on the title, expanded: nodes and ICE, odds, integrity and perfect picks, `$` nodes, map and node types, mods vs items, the tray.
- **Codex screen:** every mod and item in the game. For each: animated badge (mods), name, kind (general / minor / corp + which corp), full description, where to get it. Idea: entries show as `???` until you've found them once (needs saving across runs).
- **Start button:** drop the "tap [ JACK IN ] to start." hint. Make the button obvious instead: a big boxed ASCII button, e.g. large "START" with "jack in" under it (or the other way round), maybe gently pulsing.
- **Sigil signature variations.** Today the mark is always the same X glyph. Change it so each visit varies, getting harder deeper in the network (keep it from getting too hard):
  - Easier: a new random signature glyph each time you enter a Sigil node. You spot the glyph that repeats (it's on the real node plus ~40% of decoys).
  - Harder: the shape is always an X, but drawn with random characters each time. The shape is the signature.
  - Hardest: always made of `x` characters, but in a different arrangement. The character is the signature.
- **Corp variations by depth (general rule).** Every corp gets harder versions of its tell the deeper you go (tier 1 / 2 / 3). Sigil as above. Ideas for the others:
  - Perimeter: corners → any edge cell → "the corner furthest from the last real node"
  - Mirrorline: left-right mirror → top-bottom mirror → mirror axis changes each layer
  - Chronos: 10s → 8s → 6s clock (pay goes up to match)
- **Corps in How to play:** a short blurb per corp (name, letter, intel quote, special rules). Don't spell out the tell; the codex could reveal it once you've beaten that corp.
- **Rarity tiers for mods.** Working tiers: COMMON, RARE, EPIC, EXOTIC (legendary), BOSS (corp-specific). Rough mapping from today: minor → common, general → rare/epic, corp → BOSS. Higher tiers show up less often and cost more.
  - Each tier has its own color (and each palette defines its own rarity colors, so they still fit the palette).
  - Higher tiers get fancier badge animations; EXOTIC gets the full animated treatment (like the tray badges, but more).
- **Black market colors.** Use the palette more: items and mods get different background tints on their rows, and mods also show their rarity color. (Needs a new renderer feature: background-colored cells, not just colored text.)
- **Escalating reveal.** Whenever a list of offers appears (market, cache, boss reward, starter perk), entries pop in one at a time, top to bottom. Each pop's animation and sound scale with rarity: a small tick for common, a bigger flourish for epic, a full glitch-burst plus a sting for EXOTIC/BOSS. Order is **random** for now: any slot could be the good one, so you watch each pop. (Sorting common → rarest is an option to try later.)
- **Tray info clarity.** It's not clear what the info lines belong to. Changes:
  - **Clearer selection:** selected mod/item gets a background color (uses the same background-cell feature as the market).
  - **Info sits under its own row, in fixed positions.** Layout never moves, so mouse hover stays stable:
    ```
    - - - - - - - - - - - - - - - - - -
    .TRC  $SKM  ~CLT                      <- mods row
     \_ TRACER // mod: ICE you hit ...    <- mod info line (empty unless a mod is selected/hovered)
    [PURGE][PATCH] :  .  : :  .  :        <- item belt
     \_ PURGE // item: lock out 1 ICE     <- item info line (empty unless an item is selected/hovered)
    ```
    A small connector (`\_` or `└`) points up at the row it belongs to. Info may need to be one line each (short descriptions) or the tray grows by a row.
  - **Hover shows info on desktop** (already in v03; keep it). Tap-to-select stays for mobile.
- **New board transition: scroll-fill wipe.** Replaces the suck-in (map/panel transitions) and the fall-apart (safe pick → next layer). Board area only; HUD and tray stay put.
  1. Start: the current board's characters as they are.
  2. A fill rises from the bottom, scrolling upward. Fill = periods to start (`.`), or a pattern.
  3. Where the rising fill meets existing characters, there's a short "scramble zone" (2–3 rows): those characters turn into random characters for a moment, then settle into the fill.
  4. Once the board is all fill, the next screen appears out of it the same way: the scramble zone passes through again and leaves the new screen's characters behind.
  - **Two strengths.** Plain page transitions (map, market, panels) use a quiet version: dim fill, no sound beyond a soft sweep. The **success** version (real node found → next layer) has more punch, e.g.:
    - the real node flashes and stays lit, and is the last thing swallowed by the fill
    - fill comes in bright accent color and fades to dim as it settles
    - faster rise with a short burst of noise characters at the wave front, a small screen kick, and a rising sweep sound
    - bigger still for a perfect pick or a boss clear
  - Variations to try: fill as a pattern instead of one character (e.g. rows alternating `. : . :` / `: . : .`, or `-=` stripes) so you can see it scrolling; different fills per corp or per palette; speed tuned so a layer change stays snappy (~0.6–0.9s total).
- **Apply the button rule (§11) everywhere:** boxed primary buttons, `[ ]` secondary buttons, nothing non-tappable in brackets.
- **Tap the seed to re-roll it** (title screen): picks a new random seed. If the seed came from the URL (practice), re-rolling makes it a normal scored run again. Maybe pair with a way to copy or type a seed (settings).
- **Settings screen** (contents not decided). Candidates: palette picker (moves out of the dev menu), sound on/off, effects intensity / reduced motion, text size, one-tap vs two-tap to use items, enter a seed, reset save data.

## 16d. v04 second pass (built from the pending list)

Decisions on the open questions:
- Locked-node labels name the source: `PURGE`, `BURNT`, or `INERT` + the mod's code (`SNF`, `CNR`, `SIG`, `ECH`, `OVC`).
- Abandoned runs are **not scored**; they're logged in history as `abandoned`.
- Codex scrolling uses the clickable "more" rows, mouse wheel, swipe and arrow keys. No separate UP/DOWN buttons (only `[ BACK ]` at the bottom).
- Keyboard: Esc opens/closes the pause menu during a run, and goes back from help/codex/settings.
- **How to play** now uses tabs like the codex instead of `< >` page buttons: `[BASIC] [NET] [TRAY] [CORPS] [TIERS]` (fits exactly in 36 columns). Active tab is highlighted; Left/Right or keys 1–5 switch tabs; every tab has the same height so nothing jumps; `[ BACK ]` at the bottom.

What was on the list:
- **Locked-out node look.** Today a node locked by an item/mod (PURGE, BURNER, SNIFFER, CORNERS, SIGSCAN, ECHO, OVERCLOCK) collapses to a dotted outline with "ICE" in it. Change to:
  - Keep the whole tile visible, but in a **disabled dim red** (frame and glyph), so it reads as "switched off" rather than "missing". Different from a tile you *hit*, which stays bright bold red.
  - Replace "ICE" with a label. Maybe it says **what** locked it, e.g. `PURGE` (PURGE item), `BURNT` (BURNER), `INERT` / `NULL` / `VOID` (generic, for mods). Labels must be 5 characters max (tile interior is 5 wide), or split over two lines.
  - Open: one generic word for everything, or a different word per source?
- **Quit a run / back to title.** There's currently no way out of a run except dying. Proposal: a `[MENU]` button in the header (and Esc on desktop) that opens a pause screen: `[ RESUME ]`, `[ SETTINGS ]`, `[ ABANDON RUN ]` (tap twice to confirm), which goes back to the title. Pauses any clock.
  - Open: does an abandoned run count as a run/loss in the stats, or not at all?
- **Scrolling lists instead of pages** (codex first, then any screen with a long list). Codex layout, top to bottom:
  1. Tabs (`[ MODS ] [ ITEMS ] [ GLYPHS ]`)
  2. **Details of the selected entry** (tile art + lore for glyphs, badge + description for mods)
  3. **The list**, a fixed-height window that scrolls
  4. `[ UP ]  [ DOWN ]` scroll buttons and `[ BACK ]`
  - Also scroll with the mouse wheel and by dragging/swiping on mobile. Arrow keys move the selection and the list follows it.
  - **Codex keys:** Left/Right cycles the tabs MODS → ITEMS → GLYPHS (wrapping around). Up/Down moves the selection through the list (details update, list scrolls to follow). Esc = back.
  - **Same layout for all three tabs** (MODS, ITEMS, GLYPHS): details on top, list under it, buttons at the bottom. Mod details show the badge, rarity, full description and where to find it; items show name, description, where to find it.
  - **"More" rows:** when the list has more entries above or below the window, the first/last row becomes a "more" row, e.g. `[ ^ ^ ^  more  ^ ^ ^ ]` at the top and `[ v v v  more  v v v ]` at the bottom. Tapping it scrolls the list one entry in that direction. (Bracketed, since it's tappable.) Hidden when there's nothing more that way.
  - Maybe also a small position readout (`07-16 of 22`).
- **Keyboard controls.** A visible selection cursor that arrows move, Enter/Space activates. Mouse hover and keyboard share it (whichever you used last wins).
  - **Lists and menus** (market, rewards, codex, settings, title buttons): Up/Down moves through rows and buttons, Enter activates, Left/Right switches codex tabs and pages, Esc = back.
  - **Map:** Left/Right moves between the nodes you can pick next, Enter selects / enters. Cursor shown with the existing `> [P] <` marker.
  - **Layer grid:** arrows move a cursor tile to tile (skipping empty cells and locked tiles, jumping to the nearest tile in that direction), Enter/Space probes it. Cursor = the same highlighted frame as mouse hover, maybe with blinking corners.
  - **Tray:** number keys use items (already works); maybe Tab moves the cursor down into the tray to reach mods.

## 16e. v05 changes (built from the pending list)

All built in `v05_boot/beta_runner_v05.html`. How things turned out / decisions:
- **Corp intros:** every corp (not PUBLIC NET) gets a boot-up screen: its ASCII art, name, tier, quote, special rules, and 4 boot lines that type in (`> connecting to ...`, `> handshake ... ok`, `> mapping N layers + boss ... ok`, `> ICE detected ... yes`). Holds ~1.6s; tap or any key skips. Dev boss jumps skip it. Art lives in `CORP_ART`.
- **Corp palettes:** PERIMETER amber, SIGIL purple/pink, CHRONOS green terminal, MIRRORLINE icy blue, OMNI red-black. Used for a corp's intro, layers and boss reward; everything else uses the player's palette. **Corp colors** toggle in settings and the pause menu (default ON); turning it off also answers the PAPER light-mode question. Corp palettes don't appear in the palette picker.
- **Hover / keyboard cursor:** now a background highlight everywhere (plus a `>` marker for the keyboard cursor). Buttons keep their own colors; the boxed buttons' pulse is gentler.
- **Game over:** `[ RETRY SEED ]` and `[ BACK ]` stacked.
- **Title:** full screen, no header/HUD. ASCII cover face (human left half, circuitry right half) with an eye blink, a scanning circuit eye, a drifting scanline and occasional row glitches. Then logo, JACK IN, menu buttons, stats, and `seed [XXXXXX]` (tap to re-roll) at the bottom. The cover art is in `COVER`; easy to redraw.
- **Header:** `[SND]` removed everywhere. In a run: `BETA_RUNNER [MENU]` (+ `[DEV]`). Seed moved to a dim footer under the tray during runs.
- **Sounds:** BOSS reveal is now a major chord + fanfare + held high note; boss intro is a riser into a deep boom with a power chord and rising fifths; game over is a stutter, a falling run, a low "bwomp" and a glitchy tail. Low sawtooth buzz is reserved for bad events (ICE hits).
- **Music:** generated synthwave (pad, bass, drums with sidechain-style pumping, arp with echo, boss lead). Songs: theme (title/map/panels), perimeter (marching snare), sigil (dark phrygian, half-time), chronos (fast, ticking hats), mirror (ping-pong arp), omni (heavy, harmonic minor). Levels: layer 1 = pad+bass, layer 2 = +drums, layer 3 = +arp, boss = +lead and a bit faster, final boss louder lead. Chronos: urgency follows the clock (faster tempo, open filter, 16th hats), and each boss miss adds more. Low integrity adds a heartbeat. Songs cross-fade. Silence during the game-over glitch.
- **Audio settings:** music on/off + volume bar, effects sound on/off + volume bar, in settings and the pause menu. Keys: N = music, M = effects.

What was on the list:
- **Corp intro screen ("boot up").** Entering a corp: map wipes to a short splash screen, then wipes into the first layer. Like a quick startup screen.
  - Content: an ASCII art "illustration"/logo for the corp, its name, maybe the intel quote and tier.
  - Short hold (~1–1.5s), tap or any key to skip.
  - Needs art for each corp: PERIMETER SYS, SIGIL DYNAMICS, CHRONOS, MIRRORLINE, OMNI//CORE (and PUBLIC NET at run start?).
- **Corp palettes.** Each corp has its own color palette, used while you're inside it (its layers, boss, and probably its intro and boss-reward screen).
  - The palette picked in settings only applies to the "default" screens: title, settings, codex, how to play, overworld map, market, caches, safehouses.
  - The switch happens during the transition into the corp (pairs with the palette-change animation idea in §17).
  - Starting ideas (to tune): Perimeter = amber/military, Sigil = purple/pink, Chronos = green terminal, Mirrorline = icy blue/white, OMNI//CORE = red on black.
  - Open: a setting to turn corp palettes off (accessibility, or for people who love one palette)? What happens in light mode (PAPER)?
- **BOSS reveal sound is wrong.** The pop for BOSS-rarity offers opens with a low sawtooth hit, which sounds like the ICE / fail sound. Make it triumphant instead: a bright major chord stab plus a quick rising fanfare (e.g. C-E-G-C up an octave) ending on a held high note, with a little sparkle on top. No low sawtooth. Check the EXOTIC pop doesn't clash with it.
- **Consistent hover / cursor state.** Today hover is a color swap, and it goes opposite ways: boxed buttons are cyan and turn white on hover, `[ ]` buttons are white and turn cyan. With the box's pulse animation on top, it's hard to tell what's selected (mouse or keyboard).
  - Fix: buttons keep their normal colors (so the primary/secondary hierarchy stays), and hover/keyboard cursor is shown the same way everywhere: a **background highlight** behind the button (like the list rows and tabs already use). Maybe plus a small `>` marker for the keyboard cursor.
  - Applies to: boxed buttons, `[ ]` buttons, rows of buttons, list rows, tabs, map nodes, tray items/mods. Check every screen.
- **Game over screen buttons:** stack `[ RETRY SEED ]` and the title button vertically (one per line) instead of side by side, and rename `[ TITLE ]` to `[ BACK ]` to match settings, codex and how to play.
- **Boss intro sound.** Today it's two low buzzing sawtooth notes, which sounds thin and too much like an error / ICE sound. Make it a proper "boss incoming" moment: dramatic but exciting rather than negative. E.g. a rising sweep into a big deep boom (sine kick drop) plus a bold power-chord stab or rising fifths fanfare, maybe an alarm-like pulse on top. Once music is in, the boss layer's music change (lead comes in, filter opens) should carry most of it; the sting just kicks it off.
- **Game over sound.** Today death is a long descending buzz + noise. Make it a short, recognizable "you died" jingle. The Mario death sound is only a reference for the *feeling* (a little melodic, a bit funny, unmistakable); the actual sound should be clearly different, original and cyber flavored. E.g. a quick chiptune (square wave) phrase: a short pause/stutter, then a falling run of notes ending on a low "bwomp", maybe with a glitchy/bitcrushed tail to fit "connection terminated". Plays as the screen glitches out. Keep it ~1.5s.
- **Title screen, round 2.**
  - **No header or HUD on the title.** Drop the `BETA_RUNNER // v04 ... [SND ON]` header and the LAYER/SEED/BEST rows there; give the whole screen to the title.
  - **Remove the `[SND]` header button everywhere** (sound lives in settings and the pause menu). During a run the header keeps `[MENU]` (and `[DEV]` when enabled).
  - **ASCII cover art**: a big face, like a cyberpunk book/game cover. Mood reference: the Neuromancer cover and System Shock (SHODAN-style face). Original art, not a copy. Ideas: half human / half circuitry, glitch lines through it, eyes that flicker or scan, a subtle idle animation (scanline, blink, glitch).
  - Rough layout (phone, top to bottom): cover art (biggest), BETA RUNNER logo, `JACK IN` box, `[ HOW TO PLAY ] [ CODEX ] [ SETTINGS ]`, a small stats line.
  - **Seed placement:** on the title, the seed sits near the bottom with the other menu buttons (e.g. `seed [K3F9QZ]`, tap to re-roll). During a run it's no longer in the HUD; it moves to a dim **footer line** at the very bottom of the screen, under the tray (e.g. `seed K3F9QZ  practice`). Frees up HUD row 5 on the map and panels.
- **Music.** Simple, retro, 80s synthwave feel (reference: Kavinsky-style, without copying anything). Generated live with Web Audio, like 1TD's music: no audio files.
  - **Doable with Web Audio:** sawtooth/square bass through a low-pass filter (with filter sweeps), arpeggios, detuned "supersaw" pads (several oscillators slightly out of tune), echo/delay, "pumping" volume on every beat (the sidechain feel), drums from synthesized kick/snare/hats (noise bursts + pitch drops), gated-reverb-style snares.
  - **Each corp has its own track:** its own key, tempo, scale and drum pattern. Starting ideas: Perimeter = marching snare, steady and heavy; Sigil = dark minor arps; Chronos = the most urgent track: fast tempo with ticking hats that follow the clock, and it escalates as the clock runs down (tempo creeps up, hats double, filter opens), resetting a bit when the clock resets; the boss, whose clock shrinks every miss, gets more frantic with each miss; Mirrorline = ping-pong echo, mirrored phrases; OMNI//CORE = heaviest, darkest. Plus a theme for the title/map.
  - **Escalation inside a corp:** layers get added as you go deeper, e.g. layer 1 = pad + bass, layer 2 = + drums, layer 3 = + arp, boss = + lead, faster, filter wide open. Could also react to low integrity (heartbeat, filter closing in).
  - **Settings (and pause menu):** music on/off + music volume, sound effects on/off + effects volume, as separate controls. Volume as a small tappable bar, e.g. `MUSIC [####----]` with `[-]` `[+]` (or Left/Right on the keyboard). Keyboard shortcuts: M = effects (as now), N = music (like 1TD). The header `[SND]` button could become a quick mute-all.

## 16f. Pending revisions (next round)

(Things waiting for the user to look at, rather than to build, are in `docs/REVIEW.md`.)

Agreed changes not built yet.
- **NeoN+1 logotype on the title page: first pass BUILT in v11** (2026-10-21). Uses NAMES.md **#15
  EXPONENT** (big N + raised +1) tucked under the jaw, with two tweaks: the build number (`v011`, from
  `VERSION`) beside the +1 one row lower where `N E O N` was, and `N e o N + 1` along the bottom instead
  of `R U N N E R`. "For now"
  (the user may change it more). Background from **#3 CIRCUIT**: circuit traces on the right side and a few
  on the left, static in the top-left corner. **Pulses radiate out from the head:** a yellow spark (gold)
  with a short tail runs from a pad touching the head out along a trace (traces are dim cyan). Dev menu
  `[ title pulse: COLOR / CHAR / BOTH ]` compares recoloring vs. swapping the spark's character for noise.
  Off on REDUCED effects. Code: `TITLE_LOGO`, `TITLE_BG`, `TITLE`, `titleArtLines()`.
  - **To try next:** traces coming *into* the head from the left and out the right (the user's alternative).
- **DONE v11.04: INFO page, opened from the footer** (2026-10-21): a link in the footer (all screens, like the version tag) opens an
  INFO page about the game: what it is, when it was made, who made it (design by the user), and how: built in
  conversation with Claude (Anthropic's AI) in Claude Code, which wrote the code, music and placeholder art.
  Maybe a link to the repo (github.com/gschomburg/neon-1). Could mention One True Door / HackJack.
- **DONE v11.04: Flesh out the repo readme** (2026-10-21): `readme.md` is the GitHub front page; expand it (what the game is,
  how to play, features, multiplayer, version history, how it was made). Not game code: can be done any time.
- **DONE v11.04: Persona names: add THE and PLAGUE** (2026-10-21): `THE` to the before-words (`NAME_A`) and `PLAGUE` to the
  middle words (`NAME_B`), so THE_PLAGUE (Hackers) can roll, along with THE_POTATO, ACID_PLAGUE and so on.
- **Make mod effects easier to see when they trigger** (2026-10-21). *DONE: X-AXIS / Y-AXIS in v12.11, VIRUS, KEYLOGGER, SHATTER, FAILSAFE, TRACER in v12.12 (plus a tray badge flash for mods that fire). Others could use modFired / callout the same way.* Some mods go off too fast to tell what
  happened; give them a beat. Start with **X-AXIS / Y-AXIS**: on the scan, pause a moment and light up the
  whole row / column being checked, especially when the real node is in it, before the reveal (today: the
  tapped tile locks, a quick flash, the message, 420ms, then the real node). Then go through the other
  mods (VIRUS, KEYLOGGER, SHATTER, FAILSAFE, TRACER...) for the same problem.
- **Bigger, roomier buttons on phones** (2026-10-21). On the user's iPhone, some buttons are small and close
  together, mainly the **tray buttons** and **lists**. Think through a mobile pass: bigger tap areas (the
  §12 rule is ~44px), more space between buttons, maybe fewer per row on narrow screens.
- **DONE v11.04: Multiplayer: type the join code on the page** (2026-10-21). JOIN GAME opens a browser popup today; use
  the game's own text field instead, like the other text fields.
- **DONE v11.04: Multiplayer: share link** (2026-10-21). The host gets a `[ SHARE ]` button that copies (or opens the
  phone share sheet for) the page URL with the code in it, e.g. `?room=YUAH`. Opening that link goes
  straight into the room (or the join screen with the code filled in).
- **DONE v11.04: Hacker logo: draw it on your color style's background** (2026-10-21). The big logo is drawn in your
  style's text color straight on the screen background (black for the user), so dark styles hide it. Give
  the logo block the same background as the name on the runner card. Same fix in all 3 places: the
  PROFILE screen, CORP BREACHED, and the multiplayer turn card.
  - **PROFILE layout: logo + name as one lockup** (same day). Today it goes logo, then the logo picker
    (`[ < ] NAME [ > ]`), then the runner card with your name. Put the logo right on top of the card (same
    background) so logo, name and stats read as one block, and move all the controls (logo picker, NEW NAME,
    COLOR, RANDOMIZE ALL) together below it.
- **DONE v12.11: Corp map codes** (2026-10-21; the user's twist 2026-10-22: 2 letters + the corp's level, `SK1`). Many corps
  share a first letter and most single characters are taken (the v11 corps got `{` `(` `5`). Each corp
  gets a static 3-letter code (`SKR`, `BNY`, `CPH`) in the same 3 cells as `[S]`, in its corp colors; the
  special nodes keep their brackets (`[$]` `[?]` `[+]` `[!]`), so they stand out more. Maybe one shared,
  occasional effect (like the mods' scramble glint) on nodes you can travel to; nothing busy. Also used
  in the codex, the results' breached list, the dev corp list and OMNI's intro. Claude drafts all 78
  codes for the user to review before wiring them in.
- **Dev menu palette cycles every palette** (2026-10-21; from §17 "Two palette lists"). The dev menu's
  `[ palette ]` steps through the player palettes plus all 76 corp palettes (75 corps + OMNI), named, to
  preview them. SETTINGS keeps the player list only (`playerPalettes()`). Close pairs are fine as they are
  (PLAYTIME / DIALTONE ONLINE, COLDBREW / CARAPACE ARMOR...). *(Part of the palette pass below; the
  editor's preview may cover it.)*

### Breaking the game into files: DONE in v12.00 (see the version log in §16n)

`dist/index.html` is ~10,500 lines. `palettes.js` was the first file out. Next:
- **Data split pass** (easy, pure data): corp intro art (~630 lines), codex corp text, music tracks +
  where they play (`SONGS`, `MUSIC_FOR`; sets up a music editor later), glyphs / hacker logos / name lists,
  help and info text (pairs with keyword highlighting). Mods and items: their names / tips / descriptions
  move, their effects stay in the code.
- **Version stamps** (the user likes it; do it with the data split): every data file carries the build
  number, and the game warns if they don't match (a file the FTP upload missed, or an old copy cached on
  a phone). The `<script src>` links get the build number too (`palettes.js?v=11.01`) so phones fetch the
  new copy.
- **Corp kit files** (the user likes it; its own project, after the data split): each corp in its own file
  (`corps/cipher.js`), registered with the game through a "corp kit" object of the game functions the corps
  use (~50: messages, sounds, locking nodes, moving tiles...). Adding a corp = adding one file. The biggest
  part of the code (~2,800 lines of corps).

- **Spacing / copy pass on the pick screens** (2026-10-22, the user's ask): the black market, data caches, safehouses,
  boss rewards and the swap screens. The copy feels squeezed to fit (short tips, cut descriptions) when there may
  be room for more, and it's making things less clear (e.g. STASH's upgrade read like +2 slots). Look at layout and
  spacing, show the full description where there's room, and say plainly what an upgrade changes.
- **When the game moves** (2026-10-21, the user: gregschomburg.com/br is not its final home; it may get its own
  URL or another folder). The only absolute address is `og:image` in `dist/index.html` (the link preview,
  now `https://gregschomburg.com/br/preview.png`; the site redirects to www): point it at the new place and
  upload `preview.png` there. Everything else is relative (share links use the page's own address). Fold the
  www fix into the next update.

- **Debt: credits that go negative** (2026-10-22, the user's idea; backlog, not designed yet). Some mods already take
  money instead of integrity (OMERTA, FRIENDSHIP). This goes further: something lets your credits go **below 0**, into
  debt. A second mod gets **stronger the deeper in debt you are**, e.g. a better chance that an ICE hit does no damage.
  The user sees it mixed into existing corps, most likely **LEDGER TRUST** (the bank, LV2: balances whose digits add up
  to 10; boss mod INTEREST). Reworking LEDGER around debt is on the table.
  - Pieces to decide: what opens debt (a mod, an item, LEDGER's boss mod, a corp rule inside LEDGER?); how far down
    (a credit limit?); what debt costs (interest each layer / corp, worse prices, a collector, no CONTINUE?); how the
    debt-power mod scales (per 10cr owed, capped?), and whether it's a block (in `blockHit`, with OMERTA / FRIENDSHIP).
  - Fits / clashes: OMERTA and FRIENDSHIP would charge into debt instead of stopping at what you have; INTEREST pays
    5% of your credits (in debt: it charges you?); the market (can you buy on credit?); CONTINUE? (needs 100cr); the
    credits HUD (`CR -40` in the danger color). Other corps with the money theme: PAWN BROS, LUCKEEZ CASINO, LA FAMIGLIA.
  - Code note: ~25 places check or spend credits assuming they never go below 0; check them all when this is built.
- **Loading / intro screen** (2026-10-22, the user; backlog). The game is 111 script files now (~1MB), so a boot
  moment before the title, mostly for the feel of it (it barely needs to load). *(Claude)* ideas: an old-terminal
  boot log that lists the real files as they load (`engine/run.js ..... ok`, `corps/seekr.js ..... ok`; the version
  stamps in `NEON_FILES` are already there, and a missed or stale file could show as `FAIL` right there instead of the
  red warning on the title), a modem handshake sound, a progress bar out of ASCII, then a cut to the title. Fast and
  skippable (tap / key), shorter after the first visit, off on REDUCED effects. Has to be drawn before the game code
  loads (a small inline script in index.html, or the first file in the list). Could also be where the fake ads show
  first (a "sponsored" line while it "loads": [ADS.md](ADS.md)).
  - **The user's sequence** (2026-10-22): a little text prompt `>_`, the profile name typing in (a login); boot
    text scrolling up; then a **map**: the overworld, or (the user's first thought) an ASCII world / country map with
    a location blinking on it (where you are in the game, not in real life); an **IP address** shown as part of
    start-up; "handshake complete" (or similar), then into the game. The loading bar is worked in as a
    `*****-----` bar that fills during / after the login.
  - *(Claude)* on the IP: the player's **real** IP would need a call to an outside service (the game is static files;
    the page can't see its own IP), and showing it can feel creepy or leak on a stream / screenshot. Suggest a
    **fake IP** made from the profile (same one every time, like `10.0.4.17`), which can also show in the VPN ad
    ([ADS.md](ADS.md)). Real-IP could be an opt-in later if wanted.
  - *(Claude)* the map step could use the ascii-art.de collection in `reference/ascii/` for a world map to start
    from (credit / ask before shipping a piece), and the blinking spot could be the run seed's "city".
- **Multiplayer backend: maybe move off Firebase to p5.party** (2026-10-22, the user; to look into). https://p5party.org/,
  GitHub https://github.com/jbakse/p5.party. Built for p5.js but works with plain JS (`p5party.connect()`,
  `loadShared()`; there's a `hello_party_vanilla` example). Rooms plus shared objects you just change and it
  syncs. *(Claude, from its docs, to check when we get there)*: its own helpers for a host, per-guest shared data
  and messages (`partyIsHost`, guest shareds, `partyEmit`) map closely to our lobby / host / turn model in
  engine/multiplayer.js, which already sits behind a small `Net` layer, so the swap is mostly inside `Net`. Things
  to weigh: the demo server (`wss://demoserver.p5party.org`) is meant for prototypes and teaching, so for real
  players we'd run our own server (a small Node server, i.e. a host to pay for / keep up), vs Firebase (no
  server of ours, but the test-mode rules expire, see §16 multiplayer). No accounts or security rules to speak
  of either way; cheating stays as it is (answers come from the seed).
- **Analytics: see how people play** (2026-10-22, the user; a bigger thing, needs its own plan). Which bosses / corps
  get beaten (and which beat people), and lots more. **Not Google**: build our own, an open-source tool, or a free
  service that isn't gross. *(Claude)* starting points for the plan:
  - **What to track** (game events, not people): run start / end (seed, sector, layers, cause of death or cash
    out, mods and items taken), each corp entered / breached / died in (by layer, misses, time), boss results,
    mod picks vs offers (which get taken, which get skipped), market buys, how long layers take, palette / settings
    picks, device size (phone vs desktop), errors (the red file warning, script errors), multiplayer games.
  - **Options:** (1) **our own**: the game sends small JSON events to a tiny endpoint that appends them to a
    database (Firebase is already in for multiplayer; or a Cloudflare Worker / Supabase free tier), and we read
    them with a script or a small dashboard page; full control, game-shaped data. (2) **open source, self-hosted or
    their free cloud:** Umami, Plausible (self-host free; cloud paid), GoatCounter (free for small / non-commercial,
    mostly page views), PostHog (open source, generous free cloud tier, has custom events and funnels, heavier).
    (3) a mix: a light page-view counter + our own events for the game stuff. Game events ("died to SIGIL on layer
    3") fit (1) best; the web tools are built around page views and clicks.
  - **Not gross:** no personal data, no cookies, an anonymous random id per device (not the profile name), a
    line on the INFO page saying what's sent, and a settings switch to turn it off. Batch events (send at run
    end / when the tab hides) so it doesn't slow play. Ties to leaderboards (§17), which need a backend too, and to
    the multiplayer backend choice above (p5.party / Firebase).
- **Flipped characters: effects that mirror text** (2026-10-22, the user; ideas, not built). The renderer can
  already turn a cell 180° (UPSIDE's `r180`, engine/render.js) and the whole screen (UPSIDE's `flipNow`, with taps
  flipped to match). Adding per-cell `flipX` / `flipY` (mirror around the cell's center) is ~5 lines; a whole-screen
  left-right mirror is the same as UPSIDE's rotate with taps mirrored. Pixel-flipped glyphs read backwards (`b`
  looks like `d`); for art that should still read as ASCII, swap characters instead (`/` `\`, `(` `)`; MIRRORLINE
  has `mirrorGlyph`).
  - **MIRRORLINE flips its characters when the mirror flips.** Its tell: the real node mirrors last layer's spot
    (left-right; deeper top-bottom; boss through the center). *(Claude)*: each layer the glyphs flip on the same axis
    the tell uses (`flipX` for left-right, `flipY` for top-bottom, both = 180° for the boss), maybe with a quick
    "mirror sweep" across the board as the layer opens. Doubles as a hint about which axis is in play.
  - **A corp or mod that flips things backwards.** *(Claude)* where it could fit: **UPSIDE** (screen upside down,
    the real node's word reads right side up): a deeper / boss variant in mirror writing (left-right) instead of
    rotated; **KERNING** (one character of the real node is a pixel off): a variant where one character is mirrored;
    a new **corp modifier** like ARMORED / THIEF (engine/map.js `CORP_MODS`): BACKWARDS / REARVIEW, the whole corp
    is mirrored left-right (taps too); a **mod** (*(Claude)* names: REARVIEW, MIRROR WRITING, DA VINCI): e.g. the
    real node's glyph flips for a blink at layer start, or ICE you hit flips to show it's dead. Also usable in ads
    and art (a backwards ad, a flipped logo).
### Palette pass (2026-10-21): sort these out before / with the palette editor

The user's next big task is a **palette editor and preview system**. Everything that changes what a palette
*is* goes first, so the editor is built on the final shape.
1. **DONE in v11 (2026-10-21), with the move to `palettes.js`** (see §16n). Names picked by the user:
   `bg dim mid text bright accent danger dangerDim money` (was cyan / red / redDim / gold). Original note:
   **Rename the color slots to their roles** (the user agreed the names mislead). Today: `bg dim mid text
   bright cyan red redDim gold` + rarity `common rare epic exotic boss` (14). `cyan` is the accent (orange
   in AMBER, pink in DUSK) and `gold` is the money color (dark amber on PAPER, light blue in TWINLINK, ice
   white in GLACIER). Something like `accent`, `money`, `danger`, `dangerDim`. Mechanical, but touches the
   whole file.
2. **Keyword highlighting in text** (the user's idea: code-editor style). In HOW TO PLAY, and throughout
   info pages and mod descriptions, key words take their game color: ICE = danger (red), credits / cr =
   money, integrity = accent (matches the HUD bar), PERFECT / real node = bright, mod names = their rarity.
   No new colors needed. A short keyword list, colored automatically as text is drawn, with an inline tag
   to override. Watch: headings already use the accent (integrity could use bright instead); keep the
   list short. If a dedicated "keyword" color is wanted later, that's one new slot.
3. **Palette checks / fixes** (audit 2026-10-21 over all 84 palettes: 5 player + 78 corps + OMNI):
   - **Accent = money (exactly the same color) in 14 corp palettes:** SIGIL, MEGAMART, HAUTE, BURGERTRON,
     TUMBLER, ZODIAC, PLAYTIME, APIARY, DIALTONE, BIDBLITZ, FAMIGLIA, LUCKEEZ, TOLLGATE (+ close in
     BRIGHTLINE, COLDBREW). Buttons, credits and gold glows look alike. Matters more once keyword
     highlighting and unlocks land.
   - **Secondary text (`mid`) is hard to read in ~20 corp palettes** (contrast under 3:1 on the background):
     STREAMFLIX, PREDATOR, OMNI, LAGRANGE, TWINLINK, ENTROPY, GRAVITAS, FAMIGLIA, CHUCKE, BIDBLITZ,
     BULLET TIME, GROUNDHOG, BITROT, DROP4, UPSIDE, TEMPO, BURGERTRON, AEGIS, MONTE, NOIR. `mid` is used a
     lot (HUD labels, stats, info lines). `dim` is faint on purpose and is fine.
   - **Same color for two jobs:** boss rarity = danger red (AMBER, PAPER, LEXICON); accent = bright
     (SPECTRA, PLAYBALL); text = bright (FOURTH WALL, probably on purpose: the old blue-screen look).
   - **Palettes that look alike:** PLAYTIME / DIALTONE (known), LIFTCO / GROUNDHOG, RYDR / ENTROPY,
     COLDBREW / CARAPACE, TOLLGATE / BLACKOUT, HEADLINE / PAWNBROS, SPECTRA / PLAYBALL, CLONEWORKS / CIPHER.
   - The editor should show these checks live (contrast numbers, "too close" warnings).
4. **One palette list: DONE in v11.01-02** (player palettes folded into corps; starters = the 9 level-1 corps).
   **Unlocks: still to build** (beating a corp shows its palette in SETTINGS). Original note: **One palette list + unlocks** (§17 "Two palette lists"): player and corp palettes become the same thing;
   the 5 player palettes are the free starters, and beating a corp unlocks its palette in SETTINGS.
   Needs a field tying each palette to its corp, and locked ones hidden or shown as `???`.
5. **Dev menu palette cycles every palette** (item above).
6. **Font per palette:** keep the option (OMNI uses weight 700/800 only); decide if the editor exposes it.
   The typeface/size parts are leftovers from the reverted per-corp fonts.
7. **BLACKOUT** fades every slot but red toward the background (v11): the editor should be able to preview
   that, and the rename has to keep red out of it.
8. **Player color styles** (`PLAYER_STYLES`, the persona name colors): **moved to `palettes.js` in v11.01**
   (`styles`); the editor should cover them too. Related: "Hacker logo: draw it on your color style's background" (above).
9. **The palette editor: BUILT in v11.03** (see §16n). As agreed 2026-10-21:
   - **A dev tool, for the user**, not a player feature.
   - **Separate page** `tools/palette_editor.html`: the game in a frame on the left, a regular web form on the
     right (real color pickers, text fields, dropdowns), with none of the game's screen / UI limits.
   - **Preview without playing:** a scene picker (title, overworld, a corp layer, a boss layer, a hit node,
     HOW TO PLAY, codex, settings, reward...) puts the game on that screen with a canned, frozen sample
     state. The game gets a small listener ("show this scene", "use these colors") that's only on when
     opened by the editor, so normal play isn't touched.
   - **Palettes move to their own file** `palettes.js` (the first step of splitting the game into data
     files); the game and the editor both load it. Do the slot rename (item 1) in the same move.
   - **Saving:** the editor writes `palettes.js` directly (Chrome can save to a file you pick), with an
     EXPORT (copy code) fallback. The user is on Chrome, and the game is served from a web host, so the
     extra file is fine (it has to be uploaded next to the game).
   - Order: move + rename first, then the editor; keyword highlighting and unlocks after.
10. **Rarity colors left the palettes in v12.01** (rarity chips: fixed pairs, the same in every palette; see the
   version log). `C.common`... still exist as the chips' key colors.
11. **Colors that live outside the palettes** (the editor should know about them, maybe edit some):
   - **Map corp icons** use each corp's own background + accent, drawn on whatever palette you're in
     (`corpIconCols`; it swaps in the corp's `dim` when the backgrounds are too close).
   - **Player color styles** (`PLAYER_STYLES`, 10 fg/bg pairs: NEON, TOXIC, BLOOD...) and multiplayer
     cursor colors (your style, or palette slots by join order).
   - **SPECTRA's rainbow** (6 fixed colors, its tell), the screen flash (white by default).
   - **Mixed colors:** palette fades, BLACKOUT's darkening, the title's dim traces (background + accent).
12. **Light palettes** (PAPER, MIRRORLINE, LEXICON): check effects made with dark screens in mind (white
   flash, glows, BLACKOUT fading to the background) in the editor's preview.

Built straight into v05 after release:
- **Version number in the footer:** `beta_runner v05`, right-aligned and dim, on every screen (next to the seed during runs, bottom corner on the title).
- **CORPS tab in the codex** (`[MODS] [ITEMS] [GLYPHS] [CORPS]`, compact tabs). Corps show as `???` until you enter one. A found corp shows its quote, special rules, boss twist, its corp mods and your record (breached / lost); its **tell is written in only after you beat it**. Short list (5) with a taller details box. Selecting a found corp switches the codex to that corp's palette. Records are saved across runs (`corpStats`).
- **More diverse corp palettes:** PERIMETER = concrete grey + hazard orange, SIGIL = deep violet + gold, CHRONOS = green terminal, MIRRORLINE = **light** (icy white + deep blue), OMNI = red on black (unchanged). Also shown in the codex when a corp is selected.
- **Suck-in transition removed entirely** (it was only left on the win). Winning now flows from the final boss's big success wipe straight into the win screen, with a victory fanfare (boom, major chord, fast run up two octaves, held top note + sparkle), a flash and kick, and **type fireworks**: ~9 bursts of words (`ROOT`, `ACCESS`, `OWNED`, `0xFF`...) and noise characters exploding across the screen in accent/gold/rarity colors, each with a crackle. Win screen has an unlocked-padlock ASCII header. (Will change once runs go endless; see §17.)
- **Palette changes fade:** every color (background, text, accents) blends from the old palette to the new one over ~0.7s (`PALETTE_FADE_MS`), instead of snapping. Quick changes (scrolling corps in the codex) continue from the current colors. Instant when effects are set to REDUCED.
- **Per-corp fonts: tried and reverted.** Different fonts per corp (Share Tech Mono, Space Mono, VT323, IBM Plex Mono) were too much. Everything is back on JetBrains Mono; OMNI keeps a heavier weight of it (700/800). The per-palette `font` option (family, weight, scale) still exists if we want it for one special corp later (e.g. CIPHER).
- **Dev menu cleanup:** removed `[ jump to final corp ]` and `[ jump to final boss ]` (free travel covers both). Added **`[ god: ON/OFF ]`**: ICE does no damage (message says "god mode: no damage"). `[ jump to boss ]` (current corp, or the corp selected on the map) stays.
- **Dev menu: `[ free travel: ON/OFF ]`** lets you pick and enter any node on the map (including the final corp), going through the normal flow (intro screen, layers). Marks the run as practice.
- **How to play:** the CORPS page merged into NET (map, node types, and how corps hide the real node / tells in the codex). Tabs are now `[BASIC] [NET] [TRAY] [TIERS]`.
- **Keyboard `>` marker only where there's room:** buttons on their own line and the first button in a row keep it; tightly packed buttons (volume `[-]`/`[+]`, how-to-play tabs) get just the background highlight, so the `>` no longer covers neighboring text.

## 16g. v06: online multiplayer

Built in `v06_online/beta_runner_v06.html` (copy of v05 + multiplayer).
- **How to play it:** title -> `[ MULTIPLAYER ]` -> HOST shows a 4-letter room code; others tap `[ JOIN GAME ]` and type it. Test on one computer by opening the file in several browser windows.
- **Persona everywhere:** the title shows your persona as a button (`[ <#> NEON_RAT ]`) that opens a **PROFILE** screen: a runner card (logo, name, best/runs/wins, codex count) with NEW NAME / LOGO. The persona also shows on the game-over and win screens in single player.
- **Profile:** a generated handle (e.g. `NEON_RAT`, reroll with `[ NEW NAME ]`) and a logo from a set of 10 (`<#> {@} [*] (o) ...`, `[ LOGO ]` cycles). No typed names, so nothing to moderate. Saved locally.
- **Lobby:** everyone in the room is listed with logo, name and PLAY / WATCH / HOST / GONE. The host sets the player count (2-6) and taps people to choose who plays; newcomers are seated automatically once (if there's room), after that only the host's picks count. START needs 2+ players.
- **Rules (elimination "Jenga"):** shared seeded run, turn order shuffled each game. One pick per turn. Hit ICE: -1 integrity and the next player still in picks on the same layer. Find the real node: layer cleared (perfect = +1 integrity), the next (bigger) layer starts with the next player. At 0 integrity you're knocked out and spectate. Last one standing wins.
- **Spectators:** knocked-out players and anyone not picked (or joining mid-game) watch live, with cursors and emotes.
- **After a game:** results screen with standings (winner, then knock-out order) and layers each cleared. The host's `NEXT GAME` brings everyone back to the lobby to pick the next lineup; a new round gets a new seed.
- **Shared cursors:** everyone's mouse or keyboard cursor shows on the board as their logo character in their color, with a short name tag (~10 updates/sec).
- **Emotes:** fixed list, no free text: `GG GL NICE OOF LOL HURRY \o/ x_x o_O >:)`, as buttons in the tray. They float up from the sender's cursor and show in the message line. 1 per 1.2s.
- **HUD:** up to 6 players (3 per row): logo, short name (3+3 letters, e.g. NEORAT), integrity; current player highlighted, knocked-out players dimmed. Row 7: whose turn + layer and corp. Footer: room code. Header: `[LEAVE]`.
- **Your turn is obvious:** a chime + quick flash when it becomes your turn, a `Y O U R   T U R N` band across the board for ~1s, and the divider lines above/below the board glow in the accent color for as long as it's your turn.
- **Turn clock:** host sets it in the lobby (off / 10 / 15 / 20 / 30s, default 20). Shown as a bar on the bottom tray row (`YOUR CLOCK` on your turn); red + ticks in the last 5s; at 0 a random node is picked for you.
- **Kick:** host's `[ kick: ON/OFF ]` in the lobby; with it on, tapping someone removes them. They're sent to the title with a message and can't rejoin that room (for this page session; a reload gets a new id).
- **Robustness:** if the player whose turn it is goes offline for 5s, the host's game knocks them out so play continues. If the host leaves, host duties pass to the longest-connected player.
- **Layers:** node count keeps climbing (layer n has n + 1 nodes). Corps come in blocks of 4 layers (3 + boss) cycling Perimeter / Sigil / Mirrorline in a seeded order, with tells, boss twists, palettes and music. Chronos left out (its clock doesn't fit turns). No mods/items/map in multiplayer yet.
- **Tech:** Firebase Realtime Database (project `runner-c83ba`, test mode, no sign-in), loaded from Google's CDN so it works from a file on disk. Room = `rooms/{code}/` meta, members, rounds, moves (per round), cursors, emotes. Firebase only relays; every game rebuilds layers from the round seed and replays moves in order, so all screens agree.
- **Not handled yet:** cheating (answers can be computed from the seed), reconnecting after a reload, cleaning up old rooms, mods/items in multiplayer. Firebase **test mode expires 30 days after the database was created**: the rules need updating before then.
- **Tested:** 4 isolated game copies through a fake in-memory Firebase: 3-player games with a spectator, emotes, cursors, results, NEXT GAME with a changed lineup, a mid-game disconnect; all screens compared after every move (0 mismatches over several runs). Real Firebase reads/writes checked. A real multi-window browser test is still needed.

## 16h. v07 (locked)

`v07/beta_runner_v07.html` starts as an exact copy of v06 (with its own save data). v06 is locked so multiplayer can be tested on a stable build; changes from testing notes go into v07.
- Note: v06 and v07 share the same Firebase rooms. If v07 changes how multiplayer data works, players on v06 and v07 shouldn't join each other's rooms (could namespace rooms by version if that becomes a problem).

Changes:
- **Menu music.** New mellow, Blade Runner-inspired track (`menu`) for the title and every menu screen (settings, codex, how to play, profile, multiplayer menu / lobby / results, game over): slow (64 bpm), wide detuned pads that swell in and out, a low brass-like swell every other bar, sparse bell notes into a long echo, no drums. JACK IN / NEW RUN cross-fades into the existing gameplay track (theme on the map and in-run screens, corp songs inside corps), unchanged. Per-song echo time/feedback added so the menu track can have a longer, washier echo.
- **Tracks have their own names**, separate from where they play. A `MUSIC_FOR` table assigns them (one line to move a track):

  | Track | Style | Plays for (now) |
  |---|---|---|
  | NIGHT RAIN | 64 bpm, E minor, ambient (no drums) | title + menus |
  | GRIDLOCK | 96 bpm, A minor, four-on-the-floor | map, market, caches, safehouses |
  | CONCRETE MARCH | 104 bpm, G minor, marching snare | Perimeter |
  | VELVET HEX | 92 bpm, A# phrygian, half-time | Sigil |
  | OVERDRIVE | 124 bpm, D minor, ticking hats (urgency) | Chronos |
  | GLASS ECHO | 100 bpm, E dorian, ping-pong arp | Mirrorline |
  | MELTDOWN | 112 bpm, D harmonic minor, heavy gallop | OMNI//CORE |

- **Player color styles.** A predefined set of text + background combos you cycle through with `[ COLOR ]` (profile and multiplayer menu): NEON, TOXIC, BLOOD, GOLD, ULTRA, VAPOR, GHOST, and inverted ICE, PAPER, HAZARD. Fixed colors (not palette-based) so a player looks the same on everyone's screen. Used for the runner card, and in multiplayer for your name in the HUD (on your background; current turn pulses), the lobby list, your cursor, emotes and results. Names stay readable on any palette because they sit on their own background.
- **How to play / BASICS reworked:** consistent labeled sections (label column in the accent color: GOAL, ICE, PERFECT, ODDS; plain text beside each) instead of one-off colors per line. The loot node is shown as the actual tile (dim red frame, gold `$` glyph, like on the board) with its explanation beside it. TIERS: dropped the "rarer mods pop in louder" line. Sections are separated by blank lines; to fit, BASICS skips its page title (the tab names it). Fixed: tab pages padded by line count instead of row count (a tile is 5 rows), which pushed BACK off screen.
- **BASICS rewritten again:** one plain-instructions paragraph ("guess which node is real and tap it. hit ICE and you lose 1 integrity, then guess again..." incl. PERFECT), then a **NODE** entry whose tile cycles through the glyph designs (~1 per second) with a short explanation (one is real, the rest are ICE, the glyph can be a clue), then the **LOOT NODE**. ODDS section removed. The page is taller than the window, so it scrolls.
- **How to play pages scroll** when their content is taller than the window (30 rows): `[ ^ ^ ^  more  ^ ^ ^ ]` / `[ v v v  more  v v v ]` rows appear (tap to scroll one line), plus mouse wheel, swipe and Up/Down. Tabs and BACK stay fixed. Pages that fit look as before. Fixed: the first scroll down looked like nothing moved (the top line was just replaced by the "more" row); the first step from the top now skips one extra line, and stepping back to line 1 snaps to the top. Applies to how to play, the codex list and the dev music player. Also fixed: how to play scrolled by item, so a 5-row tile only appeared once all of it fit and the "more" row jumped around. Now it scrolls by **row** (tiles are split into their rows) and the up/down "more" rows are locked to the first/last row of the window.
- **Menu screens are full screen:** HOW TO PLAY, CODEX, SETTINGS, PROFILE and MULTIPLAYER drop the game header, HUD, empty tray and footer (like the title), and wipe the whole screen. The How to Play content window grows from 18 to 30 rows; the Codex list from 10 to 24 (19 on CORPS, which has a taller detail area). The lobby and in-run screens keep the header.
- **Codex list:** the selection `>` sits outside the row, left of its background color, so it no longer gets lost in the mod tints (all list rows: codex, lobby, music player). The `01-19 of 19` counter under the list is gone (the header already shows found/total).
- **Seed is typed in place:** SETTINGS shows the next run seed as an editable field `[ 72MSJE.......... ]` next to `[ NEW SEED ]` (the `[ ENTER SEED ]` popup is gone). An invisible real text input sits over the field, so tapping it opens the phone keyboard; the game draws the text and a blinking cursor. Enter (or tapping elsewhere) sets it, Esc cancels, empty keeps the old seed. A typed seed is a practice run. Reusable for other fields (e.g. the room code join, still a popup).
- **Title profile button** `[ {@} NAME ]` is drawn in your player color style (its text color on its background), like the profile card and the multiplayer menu.
- **[DEV] moved to the footer:** with dev access on (`?dev=1`, or after opening the dev menu once with `), `[DEV]` sits in the bottom row next to the build version on every screen (title, menus, in game), instead of the header. The in-game seed text is clipped so it never overlaps it.
- **Dev menu is full screen** (no game header/HUD/tray behind it, like the other menus). Mod toggles are drawn like the tray, `[oTRC]` in their rarity color and animation; mods you have are tinted with bright brackets. `[ music player ]` sits on its own line between rules, apart from the cheats; `[unlock codex]` has its own line.
- **Dev menu scrolls** when it is taller than the screen (same as the other menus): title + subtitle and `[ close ]` / `[ back ]` stay put, the middle scrolls with inverted more rows, wheel, swipe, or arrows (moving past the last visible button scrolls). Applies to the music player page too. Today it fits, so no scrolling shows until more mods/options are added.
- **Results screen is full screen** (win and lose): no header/HUD/tray, so no `R = retry seed  ENTER = new run` hint; the `retry = practice, not scored` line is gone too.
- **Fail results screen, more to it:** your persona in your color style (no "runner" label), `traced in CHRONOS 2/3` (where you died), `layers / corps / cr` with the numbers bright, best + seed, `breached [P] [S]` (corps finished this run), your mods drawn like the tray (6 per row, or "no mods: a naked run"), your items, and **the run's map**: the path you took lit, the rest dim, `X` where you were traced. The map gets whatever room is left; when it doesn't fit it scrolls (wheel, swipe, up/down), starting centered on where you died, with blinking `^` / `v` in the margins. Built so a longer / endless map would just scroll further. In the reveal, the map comes in row by row like the other lines, but faster (45ms a row vs 170ms a line).
- **Persona names use 3 word lists:** a middle word (28: RAT, FOX, ... POTATO, NOODLE, PICKLE, WAFFLE, GLITCH, RONIN, ...) with either a word before it from list 1 (NEON, IRON, ...: `IRON_POTATO`) or a word after it from list 3 (SAUCE, KING, PRIME, EXE, 9000, MK2, DELUXE, 404, JR, MAX, LORD, OS: `POTATO_SAUCE`, `RAT_KING`, `HOUND_9000`), half and half.
- **Boss beaten: the music powers up.** Mirror of the game over: over three beats the corp track pushes faster (x1.05, x1.1, x1.15) and lifts a little in pitch (+2 semitones), while a ding climbs the current chord (root, 3rd, 5th), each a bit louder. Then it lands on a bright major chord (always major, it's a win) with a high bell, a low boom, a quick sparkle arp, and the music cuts to silence. Replaces the safe sound + the success sweep's arp on boss kills. After ~1.4s of silence the next track fades in slowly (4s): the **CORP BREACHED reward screen now plays the overworld track** (GRIDLOCK) instead of the corp song; after OMNI the win screen eases into the menu track (the old `victory` jingle no longer plays there; fireworks keep their pops). Dev music player: `test [ boss win ] [ game over ]`.
- **Boss win fanfare layer** on top of the track's dings: a noise riser and a snare roll that speeds up build into the landing, a pickup into a lead "ta-da" (5th, then the octave held with a shake, harmony a 3rd up), a crash, and a twinkle falling away into the silence.
- **Rare offers pop bigger:** EXOTIC and BOSS offers get their own mini fanfare (exotic: a shimmering lydian run + bell; boss: a brass-like stab, a run up, a held top note with a shake, a boom and a crash), more particles (exotic in rainbow), a stronger flash/shake, their row glows in the rarity color for ~1.2s, and `!! EXOTIC !!` / `** BOSS **` floats up off the row. Several rare pops on one screen climb a whole step each.
- **Boss kill transition + CORP BREACHED reveal:** the scroll-fill wipe is replaced by a *rise out*: the layer breaks up from the bottom and floats away upward (bright, cyan, gold, fading), the real node last, timed so the screen is empty as the fanfare lands. Then `CORP BREACHED` types in at the middle, holds, and the reward screen comes in line by line (each line a blip climbing a pentatonic scale; offers pop with their rarity fanfare as their lines arrive), gliding into its normal spot; then the header, HUD and tray come back. Same reveal code as the fail screen. The old `Sound.win()` on that screen is gone.
- **Boss fanfare: brass.** The landing is now a brass-voiced fanfare (detuned saws + square through an opening filter, vibrato on long notes): a pickup triplet into "TAAA", then "ta-da DAAAA" over a held major chord, with timpani hits and a crash on each big hit. The next track waits ~2.6s after the fanfare before fading in.
- **CORP BREACHED header line = how the corp went:** instead of `> corp breached.`, the header's message line (which types in when the header comes back after the reveal) shows `> perfect 2/3   ice hit 1` for the corp you just breached (perfects out of layers with more than one node), in cyan with `FLAWLESS` when you hit no ICE. The run also now counts `perfects` and `iceHits` (not shown anywhere else yet; could go on the results screens).
- **Game over sound reworked: the music powers down.** On death the current track keeps playing but slows each beat (tempo x0.8, x0.55, x0.4) while its pitch sags (down to -8 semitones), then fades out. On each of those three beats a bell-like ding plays from the track's current chord, stepping down (5th, 3rd, root), each lower, longer and droopier; a low root tone "powers off" under the last one. So it is in key with whatever corp you died in. Multiplayer knockouts play only the dings (the game goes on). Dev music player has `[ test game over ]` to hear it over any track.
- **Losing transition falls down:** instead of characters blinking out at random (1.3s), the screen collapses top to bottom over ~3s: characters glitch in place, then let go row by row from the top (accelerating, scrambling, red, fading), like falling back down the net (the other transitions move up). The screen ends empty; then `CONNECTION TERMINATED` types in at the vertical middle, sits ~1s, and the results come in one line at a time below it, pushing the block up (smooth glide) into the full results screen. New `collapse` sound under it, separate from the music dings: a crackle, a long falling whistle and darkening rush, data blips that get lower as the line sweeps down, and a thud at the bottom. Death to results screen is now ~4s (was ~2.5s).
- **How to play consolidated to 3 tabs: `[BASIC] [NET] [TRAY]`**, one style everywhere (left-aligned block, section headers in the accent color, plain text, game things drawn as they look in game):
  - **NET:** short intro, a mini overworld sample at the top of the page (start `@ [>]`, two layers of 3 nodes with branching dotted links, `[!]` final; links you can take now are brighter), **STOPS** (`[$] BLACK MARKET`, `[?] DATA CACHE`, `[+] SAFEHOUSE` with descriptions), **CORPS** (what a corp is + `[P] PERIMETER SYS` style list + "log tells in the CODEX"). Copy describes the current move rule (linked nodes only); update it if the "frontier" idea is built.
  - **TRAY:** a sample tray (real animated mod badges, info lines, item belt with empty slots), then MODS, ITEMS, USING THEM, and **MOD RARITY** (moved here; the separate rarity tab is gone).
- **Keyboard + scrolling:** on a scrolling how-to-play page, Down scrolls to the end and one more Down puts the cursor on `[ BACK ]` (Enter goes back); Up from BACK resumes scrolling; Up at the very top puts the cursor on the tab. Codex: Down past the last entry moves the cursor to `[ BACK ]`, Up returns to the list.
- **"More" rows are inverted bars** so they stand out from plain text: a solid bar in the palette's text color with the label in the palette's background color (flips automatically on light palettes); hover / keyboard cursor turns the bar the accent color. Same look in how to play, the codex and the music player. Tabs: `[BASIC] [NET] [TRAY] [MODS]` (TIERS renamed to MODS).
- **Dev menu: `[music player]`.** A page in the dev menu with a scrolling track list (tap to play, shows where each is used), and controls to push a track like the game does: level 0-4 (pad + bass, + drums, + arp, + lead, final boss), urgency (Chronos-style speed-up), heartbeat, play/stop. Closing it gives the music back to the game.

## 16j. v08 (locked)

Started as an exact copy of v07 (only the version, title and save slot changed: `beta_runner.v08.save`,
so v08 starts with a fresh save). All new builds go here. Built so far:
- **Pending revisions, all built:**
  - Glyphs: DIAMOND is a real 5-wide diamond (` / \ ` / `<   >` / ` \ / `), STORAGE UNIT is 5 wide (`[===]`).
  - Corp intro logos are centered by their visible art (shared blank columns trimmed).
  - **Boss entrance** (~2.5s, tap / any key skips): the calm (empty screen, music muffled by a lowpass), `!! WARNING !!` / `<CORP> // BOSS` / the boss line / `n nodes. one is real.` typing in with a two-tone alarm + heartbeat thump x3, red pulses and a growing shake, then a riser + roll, then the board slams in (boom, big shake, red flash) and the nodes power on one by one. SIGIL's boss clock starts once the nodes are visible.
  - **Multiplayer turns:** the status row is a full-width bar in the current player's style, the brighter part = turn clock left, flashing red on your last 5s; on your turn the board's edges glow in your color, on others' the board is tinted with theirs; after 5s idle the chime + banner repeat; a short vibration on phones at your turn; the tab title flashes `▶ YOUR TURN` while the tab is in the background.
- **Endless map round (from 16k), built:**
  - **Corps are 5 layers** (4 + boss): node counts `tier + 1 ... tier + 5`, capped at **12** (`CONFIG.maxNodes`, a 4x4 grid). PUBLIC NET stays 1 layer.
  - **Sectors:** beating OMNI clears the sector. The next sector is made from the seed + sector number and starts **at the beaten OMNI** (it fans out to all 3 lanes). Steps are counted across the run, so ids stay `step:lane`. A new sector's first step has a market or safehouse instead of a third corp.
    - Each sector is harder: corp tiers +1 per sector (so node counts climb, PERIMETER edge / MIRRORLINE top-bottom / SIGIL level 3 kick in), clocks 1s shorter per sector (min 6s), and tells are followed 4% less often per sector (75% down to 55%, `CONFIG.sectorHeat`). OMNI borrows a new tell each sector.
  - **Sideways links:** the map stays 3 columns. 25% chance per neighbor pair in a step (`SIDE_LINK`), both ways, drawn as `- - -`. Visited stops can't be entered again, so a sideways link means one more stop in that step.
  - **Map scrolls by sector:** one wheel tick / swipe / PageUp-PageDown moves a whole sector, animated a line at a time (~22ms a row). `SECTOR 2` label top left, `v` / `^` arrows when there's more. Looking at an old sector shows "sector 1: cleared."; the arrow keys snap back to where you are. After PUSH ON the map climbs from the old sector to the new one.
  - **Sector clear screen** (replaces the old win screen): padlock, `SECTOR n CLEARED`, stats, `cash out now: +N REP`, the fireworks, then **PUSH ON** (box) or **[ CASH OUT ]**. Cashing out ends the run as a win: `JACKED OUT CLEAN`, REP banked, and the run's map (scrollable, like the fail screen).
  - **REP:** `layers + 3 x corps + perfects + credits earned / 40 + 10 x sectors cleared`. Cash out banks it all, **dying banks none** (the fail screen shows `REP lost: N`). Practice runs earn none.
  - **THE BOARD** (title screen, BBS style): spend REP on unlocks that last. HARDENED +1 starting integrity (40 / 100), SEED MONEY +25cr per level (20 / 40 / 80), FIELD KIT start with a PATCH (50), WIDE BELT +1 item slot (120), SHORTLIST starter perk offers 4 mods (60), **DEADMAN** dying keeps 25% / 50% of the REP (80 / 200; the user's "a REP unlock that keeps some on death").
  - **SKIPJACK** (minor mod, `SKJ`, COMMON / RARE / EPIC = 15 / 25 / 40%): after a perfect, a prompt: **SKIP** (+1 depth, no pay) or **PLAY IT**. Before a boss it flashes `!! SKIP THE BOSS? !!` and the button reads `SKIP BOSS: NO REWARD`; the reward screen then shows the offers greyed out under "what you could have had:" with no TAKE. On OMNI the sector still clears (cash out works). Switch: `SKIP_BOSS = false` makes bosses unskippable.
  - **Run save / resume:** the run saves to localStorage every 2s, on every map visit, layer clear, and when the tab is hidden or closed. The title shows **C O N T I N U E** (`- sector 2  layer 14 -`) plus `[ NEW RUN ]` (tap twice to drop the save). A layer you were in comes back as a **fresh layer** (different nodes, so no replaying what you saw); integrity, items and mods are as you left them. Pending reward screens (corp breached, starter perk, sector clear) come back too. Death, cash out and abandon delete the save.
  - **HUD / screens:** `LAYER 14 S2` and `OVERWORLD // SECTOR 2`; fail screen `traced in CHRONOS 2/4, sector 2`; title stats show `rep`. History entries keep the sector and REP.
  - **Corp-colored map icons** (from §17): unvisited corp nodes get their corp's background behind the letter and its accent color on the letter (the corp's dim color instead when its background is too close to the map's).
  - How to Play NET page: "4 layers and a boss", sideways links, a SECTORS section. Dev menu: `[ clear this sector ]`, `[+100 REP]`, `[reset legacy]`.
  - `tools/tell_odds.js` reads the layer count and node cap from the game.
- **Mods & corps round (from 16i), built:**
  - **Tiers + upgrades:** minor mods (STASH, HAGGLE, CACHEKEY, COOLANT) go COMMON / RARE / EPIC; TRACER has 2 levels, KEYLOGGER 3 (shown as a digit, `TRC2`). Finds roll a tier (70 / 25 / 5). Owning a mod and finding it again: at or below your tier = up one step, above = jump to it; maxed mods aren't offered. Upgrades never take a slot. Offers show the result (`COOLANT +  > RARE`, `upgrade: COMMON > RARE`).
  - Tier values: STASH +1 slot (loot is an item 40% / 60% / always), HAGGLE -25 / -35 / -50%, CACHEKEY loot x2 / x3 / x4, COOLANT +3 / +5 / +8s; TRACER L1 one direction, L2 both; KEYLOGGER 1 / 2 / 3 lines per miss.
  - **6 mod slots.** Taking a new mod when full opens a **swap** screen ("MOD SLOTS FULL", pick one of yours to replace, nothing back, or KEEP WHAT I HAVE). Same for the item belt when there's no room or matching stack (market buys).
  - **Items stack** in one slot with a hex count (`PURGEx3`, up to `xF`); different tiers stack separately.
  - **Item tiers:** PATCH +1/+2/+3, PURGE lock 1/2/3, FWALL block 1 / 2 hits / epic: no hits for the rest of the corp (`FW*`), SPLIT half / 2/3 of the ICE / all but one. Tier shows as the rarity color (and `rare` / `epic` in the market). Market price x1 / x1.6 / x2.5.
  - **REROUTE and WORMHOLE are items now:** ROUTE (rare, shuffle the map ahead) and WARP (exotic, random jump ahead), used on the map.
  - **New mods:** KEYLOGGER (EPIC, the hit ICE turns into lines of the real node's glyph, in cyan), X-AXIS / Y-AXIS (RARE, a tap on ICE in the real node's row / column scans it: no damage, layer found, no perfect; the ICE shows `SCAN`), FAILSAFE (EPIC, once per run a killing hit leaves you at 1), VIRUS (EPIC, hit ICE locks one neighboring ICE, `INFCT`), SHATTER (MIRRORLINE boss mod, 1 in 3 ICE hits do no damage, glass burst). **ECHO removed.**
  - **TRACER** shows a direction: the hit node's sides facing the real node turn into arrows (`<` `>` on the sides, `^^^^^` / `vvvvv` top / bottom).
  - **BURNER** is drawn as a button in the tray (`[*BRN]`): bright when usable, red brackets when spent this corp, dim when not now. FAILSAFE goes dim once used. The info line says `>tap` / `(not now)` / `(spent)`.
  - **Boss reward: 3 offers:** a corp mod, a general mod, and a random third (general or minor, any tier; upgrades if you have it).
  - **Text:** OVERCLOCK tip `late clock purges ICE`, FASTPAY tip `speedy picks pay more` (+ the reset-after-a-miss detail), FWALL explained. Mods and items have an optional longer `codex` text; the codex details box is 12 rows and shows **all** the text (no more 2-line cut), plus each tier's line.
  - **Small corp fixes:** SIGIL tier 2 draws its X with **one repeated character** per node (`# # / # / # #`); glyphs **never repeat within a layer** (no fake signatures, KEYLOGGER clues are exact); **PERIMETER tier 2 = any edge cell** (OMNI keeps corners). Tell odds re-run (CONTENT.md).
  - How to Play TRAY copy: 6 mod slots, upgrades, [buttons], stacking.
- **Copy room code:** the lobby shows `ROOM  3 9 A V  [ COPY ]`. Tapping it copies the code to the clipboard (Clipboard API on https/localhost, hidden-textarea fallback for file:// pages); the button reads `[ COPIED ]` for 1.5s and the header says `> room code 39AV copied.` If copying fails, the message shows the code instead. (The canvas text itself can't be selected.)

Note: v06, v07 and v08 all use the same Firebase rooms; don't mix versions in one multiplayer room.

## 16i. Up next: mods & corps (working list)

Brainstorm notes for the next round of work on mods and corps; append here as ideas come up, then
pick from it when building. **Most of this list was built in v08 (see 16j).** Still open: more minor
mods, the full tell balance pass, filler corps / final bosses / new corps, the OVERCLOCK row-flash
variant, scans as patterns, DECODER / HYDRA mods, recon stops, REP.

**Unbuilt mods & items: running list** (one place to check; details in the notes below or the § noted)

| Idea | Type | Status / where |
|---|---|---|
| SHATTER `SHT`: ICE hits have a 1 in 3 chance to do no damage | MIRRORLINE boss mod | **built v08** |
| FAILSAFE `FSF`: once per run, survive a killing hit at 1 | EPIC mod (general pool for now) | **built v08** |
| VIRUS `VRS`: hit ICE, lock one neighboring ICE | EPIC mod (general pool for now) | **built v08** |
| TRACER direction rework (L2 = two directions) | mod change | **built v08** |
| Mod upgrades / levels; minor mods tier COMMON to RARE to EPIC, higher tiers found in the wild | system | **built v08** |
| More minor mods | mods | below (Pool review) |
| Tiered items: PATCH / PURGE / FWALL / SPLIT in rare + epic | items | **built v08** |
| REROUTE + WORMHOLE become items | mod to item | **built v08** (ROUTE, WARP) |
| Scans: tap checks a pattern at once (cross, X, row, column); cost options | upgrade | §7 (first brainstorm, "area click") |
| KEYLOGGER `KLG`: each ICE you hit turns into one line of the real node's glyph (Wordle-ish) | EPIC mod, general pool for now (a corp later) | **built v08** |
| X-AXIS / Y-AXIS (or BINGO / BANGO): tapping ICE in the real node's row / column finds it | RARE mods (two) | **built v08** |
| Tell-hint upgrade | mod | §9 |
| OVERCLOCK alt: at 1s left, flash the real node's row instead of purging | mod variant | §5 boss loot |
| DECODER (translate CIPHER for a layer); mod that keeps the HUD readable | item / mod | §17 CIPHER |
| Mark HYDRA's spawned nodes; stop the first spawn per layer | mods | §17 HYDRA |
| Recon stop (learn a tell); REP unlocks add mods to the pool | map / meta | §6, §17 |
| Boss reward gets a 3rd random option (upgrades a mod if you own it) + tier find/upgrade rules | reward change / system | **built v08** |
| Exotic batch: ICE EATER, QUANTUM, GHOST, all-or-nothing, coin flip, carried-over ICE, WORM / LOGIC BOMB / FORK BOMB, the slot trade, exotic items | EXOTIC mods / items | **[EXOTICS.md](EXOTICS.md)** (concepts, 2026-10-22) |
| NUKE: wipe a corp node off the map, no reward (HALFLIFE) | EXOTIC item | CORPS.md A21; §17 (hidden quest) |
| Debt: something that lets credits go negative + a mod stronger the deeper in debt (2026-10-22) | mods / LEDGER rework | §16f "Debt" |
| A backwards / flip mod (REARVIEW, MIRROR WRITING) and a BACKWARDS corp modifier (2026-10-22) | mod / corp modifier | §16f "Flipped characters" |
| Ad mods: free trial of a corp's mod from its ad; AD BLOCKER (the user likes it); secret ad + mod combos (2026-10-22) | mods, wait for the ads | ADS.md |
| Second boss mod for the corps that have one (74 of 78) | boss mods | (no list yet) |

**KEYLOGGER: a Wordle-style clue mod** (noted v07)
- The real node's glyph is the "word". **Each ICE you hit changes its glyph into one line of the
  real node's glyph**: top line on the first miss, middle on the second, bottom on the third. Rule
  out every node whose line doesn't match. Readable at a glance; builds up like Wordle.
- Working name **KEYLOGGER** `KLG` "each miss logs a line of the key."
- **Decided:** option A (line by line). **EPIC**, in the general pool for now; can move to a corp's boss later.
- Upgrades: L2 reveals two lines per miss, L3 the whole glyph on the first miss.
- Alt / L3 / separate EPIC: **Wordle colors**: the hit ICE keeps its glyph, each character colored
  green (same char, same spot in the real glyph), yellow (in the real glyph elsewhere), dim (not
  in it). Closer to Wordle, but a lot to read on tiny glyphs mid-run.
- Needs **glyphs unique within a layer** when active (today two nodes can share one).
- **SIGIL counters it** (on purpose?): its real node shares the signature with decoys, so the lines
  point at all of them. Weak in SIGIL, strong elsewhere.

**X-AXIS / Y-AXIS: row and column scans** (noted v07; replaces the reveal-a-row item idea)
- A grid row as an item isn't very useful with so many empty cells. Instead, two **RARE** mods:
  - **X-AXIS** (row) and **Y-AXIS** (column). Alt names: **BINGO / BANGO**.
- Behavior (as understood; confirm when building): when you tap an ICE node and the real node is in
  the **same row** (X-AXIS) or **same column** (Y-AXIS), the scan catches it: **no damage**, the
  layer counts as found. If it's not lined up, you take the normal hit from the node you tapped
  only, **never from the other ICE in that row/column** (no risky-scan penalty).
- Suggested cost: a scan pass is **not a perfect** (no perfect pay or heal), so it's a safety net,
  not free money. Open: anything else (once per layer? charges?).
- Draft text: X-AXIS tip `row scan finds real.`, desc "tap ICE in the real node's row: the scan
  catches it. no perfect." (Y-AXIS the same with column.) The scanned ICE node shows `SCAN` / the code.

**TRACER: direction instead of distance** (noted v07)
- Today a hit ICE node shows `<3>`: the distance to the real node in grid steps (columns + rows,
  diagonals count 2). Problem: there's no time to read and work out a number right after a miss.
- Instead: show **one direction**. If the real node is to the left, the ICE node's **whole left side**
  turns into `<` marks (right side `>`, top `^`, bottom `v`). Readable at a glance.
- Open: which side when the real node is diagonal (e.g. up-left): the bigger of the two gaps,
  or pick one at random? Tie at equal gaps?
- **Level 2 TRACER** (or two TRACERs) shows **both** directions, e.g. left side `<` and top `^` for
  up-and-left. Possibly level 3 adds the distance back, or marks the exact row/column.

**Mods that level up / stack** (noted v07)
- What happens when you get the same mod twice? Today a mod you own is never offered again.
- Idea: owning a mod and getting it again **levels it up** (L1 to L2 to L3), each level a bit stronger.
  The badge shows the level (e.g. `oTRC2`, or a pip). Offers could show `TRACER +1`.
- Each mod needs a level plan. Examples: TRACER 1 side to 2 sides; SKIMMER +50% to +75%;
  SNIFFER 1 to 2 ICE locked; BURNER 1 to 2 uses per corp; BUFFER +1 again; COOLANT +3s to +5s.
- Some mods may not level (one-off effects); those stay "never offered twice".

**Tap-to-use mods need their own look + a spent state** (noted v07)
- Keep as is: SNIFFER, SKIMMER, BUFFER (passives, fine).
- Today: tap-to-use mods (BURNER, REROUTE, WORMHOLE) look exactly like passive mods while usable;
  they only go **dim** when they can't be used. Uses left are a bare digit on the label (`BRN1`,
  `RRT2`, `WRM1`), easy to miss. The info line says `>tap` / `(not now)` only after you select one.
  "Not usable *here*" (BURNER on the map) and "used up" (BURNER after its once-per-corp use)
  look the same.
- Want:
  - an **"activate" look** that marks a mod as tappable at a glance, distinct from passives
    (e.g. brackets or a highlight around the badge, a pulse when usable right now).
  - **charges shown clearly**, e.g. `BRN[1]` / `RRT[2]`, or pips `BRN ■` / `RRT ■■`.
  - a **spent / disabled state** distinct from "not now": e.g. `BRN[0]` dim with the brackets
    in red or crossed out, until it refills (BURNER refills each corp; REROUTE / WORMHOLE never).
  - "not now" (wrong screen) stays plain dim.
- Idea: **once-per-corp mods become an item** each corp (e.g. a `[BURN]` appears in the item belt
  when you enter a corp). Space: the belt is 4 slots (5 with STASH), 7 chars each, and 5 already uses
  35 of the 36 columns, so a 6th thing needs a second tray line (which shrinks the text a bit on
  phones). Options:
  1. it takes a belt slot (reads like an item; competes with real items; full-belt edge cases).
  2. its own slot outside the belt (`[PURGE] ... | {BRN}`), probably needs a second item line.
  3. (recommended) keep it in the mods row but draw tap-to-use mods **as buttons**: `[BRN]` bright
     when usable, red / crossed out when spent, plain dim when not now; charges inside (`[RRT 2]`).
     No belt or layout cost.

**Boss reward: a third option** (noted v08)
- Today CORP BREACHED offers 2: one of the corp's boss mods + one general mod (or skip +20cr).
- Add a **third slot, still random** (any general mod at any tier). If it rolls a mod you already
  own, taking it **upgrades** yours (see the upgrade rules below), shown as e.g. `TRACER +1`.

**Mod tiers: how finds and upgrades combine** (noted v08)
- Mods that have tiers (COMMON / RARE / EPIC, e.g. the minor mods) can be **found at any tier** in
  the wild: an EPIC COOLANT can drop even if you've never had COOLANT.
- If you **don't own it:** you get it at the tier you found.
- If you **own it** and find it again:
  - found tier **at or below** yours: it goes **up one step** (COMMON + COMMON = RARE, RARE + COMMON = EPIC).
  - found tier **above** yours: it **jumps to the found tier** (it replaces yours; COMMON + EPIC = EPIC).
- Each mod has a **max tier** (its limit). A maxed mod isn't offered again (or shows as maxed and
  can't be picked).
- Upgrading never takes a new mod slot (it's the same mod).

**New mod names / ideas from the user** (noted v10, 2026-10-21). Only the names so far; effects to work out.
- **WORM**: WORMHOLE is now the item WARP, so the WRM clash noted under VIRUS is gone.
- **LOGIC BOMB**
- **FORK BOMB**
- **ICE EATER**
- **A mod that swaps your item list for more mod slots**: no items while you have it, but more mods.
  Name to come.

**Tray limits, stacking and hot swap** (noted v07)
- **Mods get a limit.** A fixed number of mod slots (how many fits the mods row; badges are ~4-6
  chars, so roughly 5-6 on a 36-col line). Getting a mod you already own **upgrades it** (see
  "Mods that level up") instead of adding a second copy, so it never takes another slot.
- **Items stack.** Same items share **one belt slot** with a count: `[PURGE x3]` (or `PURGEx3`).
  Wanted regardless of the rest. **Counts are in hex, max `F` (15) per stack**, so it's always one
  digit: `x9`, then `xA` ... `xF`.
- **Hot swap when full.** If the mod slots (or the belt) are full and you take a new mod / item,
  you choose one to **swap out**: a small "replace which?" step on the offer / market screen
  showing your current ones; skipping keeps what you have. **Swapping gives nothing back.**
- Ties into the tap-to-use look above and option 3 (tap-to-use mods drawn as buttons in the mods row).

**Pool review** (noted v07)
- **REROUTE and WORMHOLE become items**, not mods. They're limited-use anyway (2 uses / 1 use),
  so they're really temporary mods. As items they'd sit in the belt (and stack, hex counts).
  Neither feels very useful yet; WORMHOLE may get better once the map has more variety (see §17
  map layouts / backtracking). Their tap-to-use mod handling then only matters for BURNER.
- **Minor pool (STASH, HAGGLE, CACHEKEY, COOLANT) is good but samey.** You see these a lot because
  they're the start perks, and they're a bit boring (COOLANT is the most useful). Want:
  - **More minor mods** in the pool.
  - **Minor mods with tiers that upgrade:** each one climbs COMMON to RARE to EPIC as you get it
    again (ties into "Mods that level up"), getting stronger each step, e.g. COOLANT +3s to +5s to
    +8s; HAGGLE -25% to -35% to -50%; STASH +1 to +2 slots; CACHEKEY double to triple loot.
  - **Higher-tier versions can also be found directly "in the wild"** (an EPIC COOLANT from a
    cache or the market), skipping the lower steps.
  - The rarity color/animation then shows how far a mod has been upgraded.

**Boss mod review + clearer mod text** (noted v07)
- Fine as is: CORNERS, BULWARK, FORGERY. **SIGSCAN is weak** (only pays off on SIGIL-heavy paths).
- **Bug: the codex shows only the first 2 lines of a mod's description** (wrapped at 34), so
  longer ones get cut off. OVERCLOCK loses "...cuts the pay 20%." Show all lines (the codex is
  full screen now, there's room).
- **Each mod gets an optional longer codex text** (`codex` field) next to the short tray `tip`
  and the offer `desc`, for the full details. Drafts:
  - **OVERCLOCK** tip `late clock purges ICE` (was `clock purges ICE.`). Codex: "adds a 15s clock
    to every corp layer (corps with a clock keep their own). at 6s, 4s and 2s left it purges one
    ICE node for you, up to 3 a layer. each purge cuts that layer's pay by 20%."
  - **FASTPAY** tip `speedy picks pay more` (was `fast picks pay x1.5`). Codex: "find the real node
    within 3 seconds and that layer pays x1.5. the 3 seconds start when the layer opens, and start
    over after each ICE you hit." (the reset after a miss is how it already works; not in today's text)

**MIRRORLINE boss mods** (noted v07)
- **AFTERIMAGE:** good, keep.
- **ECHO is weak and hard to describe.** Today: hit ICE, and the node in the same row, opposite
  column locks, but only if a node sits in that exact cell and it's ICE. With 2-6 nodes on 16
  cells that's rare (~1 in 5). Clearer text: "hit ICE: the node straight across the row locks too."
  Fix ideas: lock the nearest ICE on the opposite side, or replace it with FRACTURE (below).
- **Decided:** MIRRORLINE's boss mods become **AFTERIMAGE + SHATTER** (SHATTER replaces ECHO).
  - **SHATTER** `SHT` "ICE might shatter.": every ICE hit has a 1 in 3 chance to shatter harmlessly
    (no integrity lost; the node bursts into glass shards). Differs from BULWARK (first hit per
    corp, always) and FWALL (one-shot item). Upgrades: 25% to 33% to 50%.
- **In our pocket** (for a new corp's boss, or the general EPIC pool). Names don't need the glass
  theme; working names:
  - **FAILSAFE** `FSF` (was SAFETY GLASS; alts: ROLLBACK, DEADMAN, SAFEMODE): once per run, the hit
    that would kill you leaves you at 1 integrity instead; then the badge shows spent.
  - **VIRUS** `VRS` (was FRACTURE; alts: CASCADE, BOTNET, CONTAGION): hit ICE, and the infection
    spreads to one neighboring ICE node (up/down/left/right) and locks it. Avoid WORM (WRM is taken
    by WORMHOLE).

**Items: more of them, with rarity tiers** (noted v07)
- Current items (PATCH, PURGE, FWALL, SPLIT) are all good. Move **REROUTE** and **WORMHOLE** in from
  the mods (see Pool review).
- **Tiered items:** stronger versions at higher rarity, shown by the rarity color/animation like
  mods (label stays 7 chars, `[PATCH]`). Different tiers stack separately. Drafts:

  | Item | Common | Rare | Epic |
  |---|---|---|---|
  | PATCH | +1 integrity | +2 | +3 |
  | PURGE | lock 1 ICE | lock 2 | lock 3 |
  | FWALL | block next hit | block next 2 | block the rest of this corp |
  | SPLIT | rule out half | rule out 2/3 | leave just 2 nodes |

- **FWALL needs explaining.** How it works today: you use it like any item (works anywhere, even
  on the map); it raises a firewall shown as `FW1` in the HUD by INTEGRITY; the firewall absorbs
  the next ICE hit, whenever that is (it carries across layers and corps); using two stacks it
  (`FW2`). Nothing on screen says this; the tip is just "block next ICE hit." Better tip / codex
  text, e.g. "use any time: blocks the next ICE hit, whenever it comes."

**Already noted elsewhere that belong to this round** (see §17)
- Tell balance pass with `tools/tell_odds.js` (PERIMETER and MIRRORLINE too easy once learned; target ~x2).
- PERIMETER has no tier-2 twist; SIGIL tier 2 (X shape with random characters) is hard to read
  (try one repeated character per signed node); SIGIL tier 1 can show a "fake signature" when two
  unsigned nodes share a glyph by chance.
- Rarity doesn't affect offer odds today (all uniform); decide if it should.
- Filler corps vs signature corps; more unique final bosses; new corp ideas (CIPHER, HYDRA, BLACKOUT).

## 16k. Next update: endless map (planning list)

Collected for the next build: the map goes on forever. Pulled together from the user's notes
(2026-10-20) plus the related backlog items in §6, §9 and §17 (those stay where they are; this is
the working list). **Built in v08** (see 16j "Endless map round" for what was built and the
choices made while building). Kept as the record of the plan; open questions were marked **Q**.

**Today (v08), for reference:** the map has 6 steps: start `@`, 4 steps of 3 lanes (corps, `[$]`
`[?]` `[+]`), then OMNI//CORE at the top. You can go to any unlocked node. A corp is 4 layers
(3 + boss) with `tier + 1 ... tier + 4` nodes; tier 1 corps on steps 1-2, tier 2 on steps 3-4,
OMNI tier 3 (4-7 nodes). Beating OMNI ends the run with the win screen.

### The user's notes

- **Sectors.** The first map stays as it is today. Beating OMNI opens **another set** (sector 2),
  then another, with no end. One seed for the whole run; each sector is made from the seed + the
  sector number (§17 "Endless runs: sectors").
- **The overworld map scrolls, one sector at a time.** All sectors stay on one map you can look
  through, but scrolling snaps by sector so it isn't fiddly: one tick / click / key press (or a
  swipe) moves to the next or previous sector. The move is **animated line by line** (fast, but you
  can see it travel), not a jump cut, so it's clear which way the map went.
  - The current sector is the default view; coming back from a corp shows it again.
  - Probably a small `SECTOR 2 / 3` label and up/down hints (`^` `v`) when there's more map.
- **The fail screen (and maybe the win screen) shows the map, scrollable.** The fail screen already
  has a scrollable map of the current run (v07); it needs to cope with several sectors.
- **A "win" screen after each big section, where you can cash out your credits.** The push-your-luck
  at map level from §6 "jack out": bank and end the run, or push into the next sector.
  - **Decided:** cashing out gives **REP**. **Dying gives no REP.**
  - Good idea for later: a **REP unlock that lets a death keep some REP** (e.g. 25% of what you'd
    have banked), as one of THE BOARD's upgrades.
  - **Decided (try it):** the current OMNI win screen becomes the **sector clear** screen, with the
    fireworks kept for every sector clear, plus `[ CASH OUT ]` / `[ PUSH ON ]`.
- **Legacy abilities (keep-between-runs progression).** Needed now so cashing out means something.
  From §17 "Keep-between-runs progression":
  - Currency, leaning **REP** (others: ROOT, SALVAGE, SHARDS, LEGACY CODE, GHOST DATA).
  - **Now: earned only by cashing out** (dying gives none, unless the unlock above). From layers,
    corps breached, perfects, credits. Not from practice or abandoned runs. (The old §17 note said
    win or lose; this replaces it.)
  - Spent at a meta shop from the title, styled as an old hacker BBS ("THE BOARD").
  - Unlock ideas: +1 starting integrity, +1 item slot, an extra starting item, starting credits,
    mods added to the pool (locked until bought), palettes, seed replay, new corps, codex lore.
  - Related: §4 seeds (replays and typed seeds are practice and earn no REP); §17 "Clues as
    unlocks"; achievements / persona unlocks; corp palettes unlocking into settings.
- **Corps get one more layer:** 5 layers (4 + boss) instead of 4, so counts become
  `tier + 1 ... tier + 5`. OMNI goes up to 8 nodes, still inside the current grid.
  - **Decided:** PUBLIC NET is always the first stop of a run, 1 layer.
  - Re-run `tools/tell_odds.js` afterwards; payouts per corp go up about 25%, so check the market prices.
- **New mod: skip a layer on a perfect.** A chance that a perfect pick (first try) jumps you past
  the next layer. Working names: **SKIPJACK**, LEAPFROG, FASTTRACK, HOPPER.
  - Fits the tiered minor/general mods, e.g. 15% / 25% / 40% (COMMON / RARE / EPIC).
  - **Decided: it can skip the boss too.** If it triggers on the layer before the boss, the prompt
    gets an extra warning that you're skipping the final layer (e.g. `!! SKIP THE BOSS? !!`).
  - **Decided: skipping the boss gives no boss rewards**, but the corp still counts as breached. On
    OMNI you still get the sector clear and can **cash out**.
    - The reward screen still shows what you could have had, **greyed out**, with a line like
      `skipped: no rewards`, so the trade is clear.
    - The **SKIP button itself warns** when it's a boss (e.g. `[ SKIP BOSS: NO REWARD ]`).
    - The mod's **codex text** says so too ("can skip a boss, but you get no boss reward").
  - **Switch:** a constant (e.g. `SKIP_BOSS = true`) so bosses can be made unskippable in one place
    if it plays badly. Then the boss warning / greyed rewards just never show.
  - **Decided:** a skipped layer **adds depth, pays nothing**. A speed / safety mod, not money.
  - **Decided: the player chooses.** When it triggers, a small prompt asks whether to skip, e.g.
    `SKIPJACK READY   [ SKIP ]  [ PLAY ]` (needs a bit of new UI; keyboard + tap). Playing the
    layer keeps its pay and perfect chance, so it's a real choice: safety vs money/healing.
  - Pairs with the longer corps (more layers to skip) and with an endless run (less grind).

### Other things to sort out for an infinite map

- **Difficulty per sector.** What makes sector 3 harder than sector 2? Options from §17:
  - Node count keeps climbing (+1 node per sector, or the full "climbs every layer" idea).
  - Harder tell variants (tier 3+ tells), shorter clocks, ICE hitting harder.
  - New corps and node types appearing in later sectors (HYDRA, CIPHER, BLACKOUT, bad security,
    corrupted corp, filler corps), so each sector brings something new.
  - **Grid cap:** phones fit about 6 columns, so past ~16-20 nodes we need a plan (smaller tiles,
    taller grids that scroll, or a soft cap where difficulty comes from tells/ICE instead).
- **The end of each sector.** OMNI as the end of every sector, a remixed OMNI each time (it already
  borrows a random tell), or a pool of final bosses, one per sector (§17 "More final bosses").
- **Between sectors (the user's idea):** the next sector **starts at the beaten OMNI**. It takes the
  place PUBLIC NET has on the first map, and the new sector branches out from it. It doesn't have to
  go straight up: the new sector can branch off in any direction from the old boss.
  - Or put something valuable at the start of each new sector (a cache or a market), like §17's
    "the first node of a new sector is something good".
  - **Decided:** the map stays **3 columns** and sectors stack upward. "Any direction" means
    **sideways links**: connections from one column to the one beside it (left / right) within a
    step, not only upward (ties into §17 "More varied map layouts: sideways links").
- **Map layouts per sector.** Missing nodes, skip-lane links, sideways links, other shapes (§17
  "More varied map layouts"). Lets sectors look different. Frontier / backwards-travel ideas
  (§17 "Moving backwards") could come in here too, or later.
- **Power creep.** Endless runs hit the 6-mod cap, max-tier mods and full item stacks. Options:
  stronger sector rewards that change what you have (swaps, upgrades), corps that counter specific
  mods, or the cap is the point and the run gets harder until you die or cash out.
- **Healing over a long run.** Integrity only comes back from perfects, safehouses, PATCH and the
  market repair. Each sector probably needs a guaranteed heal spot.
- **Credits.** With endless runs, credits pile up. Options: market prices scale by sector, credits
  convert into REP on cash-out, or a credit sink (bigger items, rerolling offers).
- **Score and leaderboards.** "Layers" stays the main score; add sector reached
  (`S3  41 layers  4 mods`). Cashed-out vs died could show as a tag. Ties into §17 leaderboards
  (local first) and the NAKED tag.
- **Saving mid-run.** Long runs will need **resume**: save the run state to localStorage after each
  map node, with `[ CONTINUE ]` on the title. Today a reload loses the run. Seeds make this easier
  (seed + choices), but the simplest is to store the run object.
- **Music and palettes per sector.** Sector 2+ could shift the music (key/tempo up, an extra layer)
  or the map palette, so you can feel the progress. Ties into the corp-colored map icons (§17).
- **HUD / map info.** Show the sector in the HUD and on the map (`SECTOR 2`), and on the fail screen
  (`traced in SIGIL 3/5, sector 2`).
- **Codex and records.** Best sector, best layers, times cashed out. Per-corp records keep working.
- **Map scroll details.** Auto-scroll to keep `@` in view; the current sector framed; a mini "you
  are here" marker; keyboard up/down scroll like the fail screen; the map transition between
  sectors (e.g. the old map scrolls down and away, the new one rises in).
- **Multiplayer.** Today multiplayer races through layers, not the map. Endless sectors probably stay
  single player; check nothing shared breaks (the v06-v08 rooms share Firebase).
- **Dev menu.** `[ jump to sector N ]`, `[ +REP ]`, `[ reset legacy ]`, so it can be tested quickly.
- **Tools.** `tools/tell_odds.js` and the smoke bots need the 5-layer corps and multi-sector runs.

### Suggested order

1. Corps get 5 layers; the skip mod.
2. Sectors: OMNI opens sector 2; seed + sector map; sector in HUD/fail screen; scrolling map.
3. Sector clear screen with cash out; run save / resume.
4. REP + THE BOARD (a small first set of legacy unlocks).
5. Then difficulty per sector, layouts, new corps.


## 16l. v09 (locked)

Started 2026-10-20 as an exact copy of v08 (only the version, title and save slot changed:
`beta_runner.v09.save`, so v09 starts with a fresh save, and its run save is
`beta_runner.v09.save.run`). v08 is locked as the build put online for phone / multiplayer
testing (MULTIPLAYER hidden unless dev is on). All new builds go here. Note: v06-v09 share the
same Firebase rooms, so don't mix versions in one room.

Built in v09:
- **Mod trigger order** (2026-10-20). The rule for every mod and corp twist from now on:
  - Every mod has one **stage** (`MOD_STAGE` / `STAGES` in code). A pick runs the stages in order,
    each one to the end before the next:
    1. **LAYER START**: a layer opens (SNIFFER, CORNERS, SIGSCAN, AFTERIMAGE)
    2. **ON PICK**: you tap, before the reveal (X-AXIS, Y-AXIS)
    3. **BLOCK**: ICE hit, does it hurt? (FORGERY, BULWARK, SHATTER, FAILSAFE)
    4. **ON HIT**: info and loot after a hit ($ node loot first, then TRACER, KEYLOGGER)
    5. **BOARD**: changes to the grid (VIRUS). The death check runs between ON HIT and BOARD.
    6. **LAYER END**: the layer is done (SKIPJACK)
    - Outside a pick: **TAP TO USE** (BURNER), **ON THE CLOCK** (OVERCLOCK), **ALWAYS ON**
      (numbers and rules: SKIMMER, COOLANT, FASTPAY, the minors...).
  - Inside a stage, mods fire **left to right on the mod bar** (today that's pickup order; no
    reordering yet, add drag-to-reorder only if two mods ever conflict).
  - **Corp twists go after your mods** in each stage: the corp moves last, so your info (TRACER
    arrows...) is about the board you'll see. Matters for the chaos / shell game corps.
  - **BLOCK is the exception:** a fixed order, not the bar, so nothing is spent that something free
    would have covered: god mode, FORGERY ($ nodes), BULWARK, a corp-long firewall, SHATTER's
    chance, then FWALL charges, then the hit, then FAILSAFE (it only catches a killing hit).
  - New mods: pick a stage when you design them. The codex shows each mod's stage
    (`EPIC // mod // 4.ON HIT`), and How to Play > TRAY has a TRIGGER ORDER section.
- **OMNI boss reward** (fix). Beating OMNI//CORE used to give no reward. Now PUSH ON first opens
  **OMNI//CORE BREACHED**: one boss mod from **any** corp, one general mod, one general or minor
  (or SKIP +40cr), then the map climbs into the next sector. Cashing out skips it (the run ends).
  A skipped OMNI (SKIPJACK) still gets nothing. Saved / resumed mid-pick (`pending: omni`).
- **Corp kit + corp levels + first 6 new corps** (2026-10-20; plan in CORPS.md "Build plan").
  - **Kit:** a corp is data plus optional hooks.
    - `dress(lv, k)` puts the tell on the nodes after the real node is picked. `k.tellTile` is the
      real node, or a random node on layers that don't follow the tell (`tellStr`, as for position
      tells). `$` nodes are never dressed.
    - `hint(lv, now)` is a line on row 7 when there's no clock.
    - `nodes` (+/- per layer), `rules(tier)`.
    - Tile flags that other corps' mods read: `t.marked` (SIGSCAN), `t.forged` (FORGERY).
  - **Levels:** every corp has `level` 1-5 (PERIMETER 1, SIGIL 2, MIRRORLINE 2, CHRONOS 3).
    - The map picks corps by level (`pickCorps`): target `sector + 1` early in a sector, `+ 2` late.
      Weights: target 3, one under 2, lower 1, one over 0.25, higher never.
    - Shown on map node info, the corp intro, and the codex.
  - **New corps** (all glyph tells, LV1-2), each with a palette, intro art (placeholder), a song,
    codex tell text, and one boss mod:
    - BASIC CORP (B, LV1): the real node is plain `[ ]`; one node fewer, pays x0.7. Mod: BASIC
      TRAINING (START: the first layer of every corp starts with 1 ICE locked).
    - SEEKR (Q, LV1): the hint line types the real node's glyph as a search. Deeper, one line is
      `?????`; boss: "did you mean", with one line taken from a decoy. Mod: AUTOCOMPLETE (BOARD: your
      first miss each layer locks 1 more ICE).
    - MEGAMART (R, LV1): price tags; the real node is the lowest price. Deeper and the boss: the one
      `.00` price, with a cheaper decoy. Mod: COUPON (markets: +1 mod offer).
    - CLONEWORKS (D, LV2): every glyph has a twin except the real node. Deeper: mirror twins; boss:
      twins one lookalike character off. +1 node. Mod: TWIN LOCK (BOARD: a hit locks the ICE that
      looks most like it).
    - HAUTE//COUTURE (H, LV2): every node wears the label (`marked`, so **SIGSCAN works**). Every
      fake is one character off (boss: lookalikes), and fakes are `forged`, so **FORGERY makes the
      first knockoff each layer free**. Mod: RUNWAY (START: the first layer walks in one node at a
      time, real last).
    - LEDGER TRUST (L, LV2): balances; the real node's digits add up to 10 (3 / 4 / 5 digits).
      Mod: INTEREST (END: a finished corp pays 5% of your credits, up to 20).
  - The codex lists corps by level. Multiplayer still uses only its own 3 corps (`MP_CORPS`).
  - Fix found by the smoke bots: the market showed long item descriptions (FWALL, ROUTE) off the
    screen edge. It shows the short tip now.
  - Each new corp has 1 boss mod for now (the old corps have 2), so its boss reward is 1 corp mod +
    2 general mods.
- **Corp tester (dev)** (2026-10-20).
  - **Test seeds:** a corp's name as the seed (`SEEKR`, `HAUTECOUTURE`, `LEDGERTRUST2`; a number on
    the end is fine) makes every node on the map that corp, with no shops. `DEV1` lays out every
    corp in level order, 3 per step.
  - **Dev menu > corp tester** (top of the menu):
    - `[ corp: ... v ]` opens a scrolling corp list, grouped by level (the "drop-down").
    - `[tier n]` cycles 1-3.
    - `[breach now]` turns the first open corp node into that corp and enters it (on the map).
    - `[run: all X]` and `[run: DEV1]` start a practice run on a test seed.
  - The map legend now says `letters = corps` (it listed only P S C M).
- **Second batch: 15 more corps** (2026-10-20), so **25 corps** plus OMNI. Each has a palette, intro
  art (placeholder), a song, codex text and one boss mod.
  - **Kit additions:**
    - `alwaysFollow` (accumulating tells), `k.carry` / `lv.carryNext` (a layer leaves info for the
      next; saved with the run), and `k.corpR` (one rng per corp).
    - Corp effects: `onEnter`, `onPick`, `onHit` (a corp twist, after your mods).
    - `maskMs` (glyphs turn face down), `surge` (pay grows as the clock runs down).
    - Hints can sit at an x position.
  - **Row 7** now shares the clock, the corp hint and **mod notes** (FORECAST, SPELLBOUND, SEED
    READER, PHOTOGRAPHIC, HOROSCOPE, PICKSET). The clock shrinks when there are notes; a hint and
    notes that don't fit take turns; a brief note (PHOTOGRAPHIC) gets the row to itself.
  - **The 15** (letter, level, tell -> mod):
    - PARCELNET (N, 1): the tracking number ends in the layer number (boss: 0) -> PRIORITY ($ nodes
      drop loot twice).
    - BURGERTRON (U, 1): the hint names the combo of the day; boss: wrong at first, then a menu
      update -> SUPERSIZE (boss layers x1.5).
    - NIMBUS WEATHER (W, 1): a forecast row or column, right exactly as often as it says (always
      true to its %) -> FORECAST (every layer: a 60% row or column note).
    - DEWEY SYSTEMS (Y, 2, +1 node): the misfiled call number (another hundred; deeper another ten;
      boss two digits swapped) -> INDEX (hit ICE shows >>> or <<<: is the real node later or
      earlier in reading order).
    - RYDR (Z, 2, 14s clock, surge pay): the only 4.9 among 5.0s (deeper some 4.8s) -> SURGE (the
      last 3s of a clock pay x1.5).
    - SAFEHARBOR (F, 2): a dot in the real node's bottom right corner (decoys: other corners; boss:
      a comma). 10cr premium on entry, 5cr claim per hit. The dot is `marked` (SIGSCAN) -> POLICY
      (8cr per ICE hit).
    - TUMBLER LOCKS (T, 2, +1 node): the one pin height no decoy has -> PICKSET (3 hits in a corp:
      the next layer lights the real node's row).
    - PURLWISE (K, 2): the dropped stitch `o` (boss `V`) in a knit / purl pattern -> UNRAVEL (a hit
      locks one more ICE in its row).
    - NUMBERWONG (#, 4): the only prime; deeper the only non-multiple of 3; boss the only prime
      among odd decoys. "that's numberwong!" on a hit -> PENCIL MARKS (a miss rules out 1 ICE in
      its row).
    - GENCORP (G, 3): the hint shows the parent glyph (last layer's real node); the real node is
      its child (one line changed) -> MUTATE (counts as a random gen / minor mod, new every corp;
      the tray shows what it is).
    - ZODIAC HOUSE (O, 2): the only sign of the lucky element; the retrograde boss uses the opposite
      element -> HOROSCOPE (one lucky layer per corp: its first hit is free; BLOCK).
    - LEXICON (X, 3): a 5-letter word, one letter per layer, with the category and the letters so
      far -> SPELLBOUND (boss layers: a T / B / L / R / C clue).
    - KERNEL (E, 3): the hint lights a seed character (boss: 2); the real node has it -> SEED READER
      (boss layers: the real column).
    - FORGET-ME-NOT (V, 3): the glyphs turn face down after 2s (1.5 / 1); then the hint shows the
      real glyph -> PHOTOGRAPHIC (the real glyph flashes for 0.45s every layer).
    - TOLLGATE (J, 2, pays x1.3, 2cr per pick): a booth `|=|` over the real column (deeper: or next
      to it) -> EZPASS (+2cr per layer passed).
  - Every tell was checked on 180 generated layers per corp (tiers 1-2 and the boss), and every corp
    was played through to CORP BREACHED.
  - Changed while building:
    - DEWEY's "out of order" can't always point at one node, so it became "misfiled".
    - HAUTE//COUTURE and DEWEY get +1 node: they need 3 nodes to show the odd one.
    - SAFEHARBOR's rules and NUMBERWONG's boss line were shortened to fit the screen.
- **Tier 2: 34 more corps** (2026-10-20), so **59 corps** plus OMNI. Built system by system (CORPS.md
  build plan); each corp has a palette, placeholder art, a song, codex text and one boss mod.
  - **New kit hooks:**
    - `fx(t, ft, lv)`: per-node animation every frame. It can return `dx` / `dy` (fractions of a
      cell, so a pixel or two works), `dim`, `bright`, `fc` / `gc` colors, a `glyph` or one `line`,
      `kern` (one character drawn off), `over` (extra characters, like steam or rings), `corner`,
      `frame` (armor), `clip`.
    - `ft` is the node's own clock: it stops while the node is frozen (FREEZE FRAME freezes all but
      the real node; STREAMFLIX's `bufferAt` freezes all but the live one).
    - `tick(lv, lt, dt, now)`: timed board effects. `lt` is the layer's own clock: it stops while
      you're busy, and for ESPRESSO / FREEZE FRAME.
    - `block(t, lv)`: a corp's own BLOCK rule. `hitDmg(t, lv)`: how hard ICE hits. `tap(t)`: a corp
      can take over a tap (true = handled). `onClear(c)`: when the corp is beaten. `band(lv, now)`:
      a lit row. `cellLabel`: text in an empty cell.
    - `action(lv)`: a button on the right of row 7 (CALL, BID, TITHE, DBL DOWN, CH+, PROTECT).
    - `Music.beat()`: the music's beat clock (TEMPO, ON BEAT); falls back to the song's bpm when muted.
    - Tap-to-use mods share one table, `TAP_FX` (once per corp each, saved with the run).
  - **The 34, by system** (letter, level -> mod):
    - Node animation: BRIGHTLINE (`*`, 2, the one that stays lit in a brownout -> GROUNDED),
      COLDBREW (`~`, 2, steam; the clock loses 1s a layer -> ESPRESSO), MOCHI MOCHI (`^`, 1, waves
      hi hi; ICE costs 10cr -> FRIENDSHIP), PLAYTIME (`&`, 1, hops -> JACK-IN-THE-BOX), MEDIX (`m`, 2,
      a steady heartbeat; the first hit only bruises -> TRIAGE), APIARY (`@`, 3, the queen the
      workers lean toward -> HONEYCOMB), KERNING (`A`, 3, one character a few pixels off -> PIXEL
      PEEP), STREAMFLIX (`=`, 3, the one that keeps playing while it buffers -> FREEZE FRAME).
    - Timed board effects: GLACIER (`i`, 4, frost locks nodes, the real one last; frostbite -1 ->
      ICEBOX), GRIDLOCK (`r`, 4, the light out of sync; red hits 2, green 0 -> GREEN WAVE), LIFTCO
      (`l`, 3, the lift stops longer on the real floor -> EXPRESS), HEADLINE (`n`, 3, the ticker;
      BREAKING vs RUMOR -> SCOOP), WATCHPOINT (`w`, 3, the camera catches an ICE each sweep -> CCTV),
      VERDANT (`v`, 3, the leaf; hit ICE grows back -> COMPOST), HALFLIFE (`h`, 4, the Geiger sweep;
      radiation limit -> LEAD LINING), ECHO LABS (`e`, 3, the low ping, ring going in -> FOGHORN).
    - Sound tells (each also shown on row 7): DIALTONE (`d`, 2, beeps = reading order -> HANDSHAKE),
      TELEPHONIX (`t`, 3, the dialed number's last digit -> CALLER ID), TEMPO (`b`, 3, on the beat ->
      ON BEAT).
    - A button or a choice: BIDBLITZ (`a`, 3, no tell, buy locks -> SNIPE), LA FAMIGLIA (`f`, 3,
      protection money, snitches -> OMERTA), THE CHOIR (`c`, 3, faith x2 or tithe -> SACRIFICE),
      LUCKEEZ (`7`, 2, three of a kind, double down -> LET IT RIDE), CHANNEL 9 (`9`, 3, the clear
      channel -> REMOTE), BYTEPETS (`p`, 2, the pet that comes when called -> COMPANION), PAWN BROS
      (`x`, 3, dice squares from GO -> CHANCE CARD).
    - New pick rules: FORM 27B (`y`, 4, file in order -> QUEUE NUMBER), CARAPACE (`o`, 3, the thin
      spot; hits point at the real -> ROLL UP), CHUCK E. CACHE'S (`u`, 3, the 1UP blinks on every
      score tick; pays in tickets x1.5 -> CONTINUE?), DEMOLITION (`q`, 4, minesweeper: break all the
      ICE -> CONTROLLED BLAST), NOIR (`k`, 4, the one true statement -> INTERROGATE), SYNAPSE (`s`, 4,
      hides where you don't pick -> TURING).
    - Node colors: SPECTRA (`%`, 3, the odd color, then the next in the rainbow -> PRISM), DROP-4
      (`4`, 3, the blocker of a line of four -> FOUR IN A ROW).
  - **Corp modifiers** (map tags, gold, next to the node): none in sector 1, then 10% (+5% a sector,
    up to 40%). CURSED `!` (no perfect heals), RUSH `>` (10s clock), LOADED `$` (more $ nodes, x1.2),
    BRANDED `s` (a third of the ICE wear the sigil, so SIGSCAN works), THIEF `&` (ICE steals your
    last mod; beat the boss to get them back), ARMORED `#` (armor frames; hits point at the real).
    Shown in the node info and the corp intro; the dev corp tester can set one.
  - **Checks:** the tells that are logic (DIALTONE, TELEPHONIX, LUCKEEZ, PAWN BROS, CHOIR, NOIR,
    SPECTRA, DROP-4) were checked on 180+ generated layers each. Every corp was played through to
    CORP BREACHED, every new mod was tested, and the smoke bots ran clean.
  - Changed while building:
    - Map letters ran out, so the new corps use symbols, digits and lowercase letters. MEDIX is `m`
      (`+` is the safehouse).
    - THE CHOIR faces 4 ways (< > ^ v): the diagonals `\` and `/` each read two ways.
    - NOIR builds its puzzle so only one answer fits (side claims rule out the rest).
    - DROP-4 gets +2 nodes (a line of four needs 4 chips) and has no $ nodes.
    - WATCHPOINT's PEEPHOLE needs drag (tier 3), so its mod is CCTV for now.
    - LA FAMIGLIA's snitch rules out a decoy (RAT) instead of pointing.
    - BYTEPETS' COMPANION doesn't sulk yet.
  - Not yet: second boss mods, real art, multiplayer for the new corps, HALFLIFE's NUKE item,
    SQUALOR and the tier 3 corps.
- **Tier 3: the last 15 corps** (2026-10-21), so **74 corps** plus OMNI. That's every corp in
  CORPS.md. Also the RIVAL modifier and the stage boss rethink. Each corp has a palette,
  placeholder art, a song, codex text and one boss mod.
  - **New systems:**
    - **Moving nodes:** `slideTo(lv, t, cell, ms, arc)` moves a node with an animation; the board
      draws it (and its tap box) on the way, so taps follow it. `def.moves` marks a corp that moves.
    - **Drag to select** (`def.drag`): on touch, a drag never picks. Lifting selects a node (> <)
      and a second tap confirms; a plain tap still picks. The page doesn't scroll while you drag.
      `nearness(lv, t)` says how close the pointer (or keyboard cursor) is to a node.
    - **Screen flip** (`def.flip`): the whole screen is drawn upside down and taps are flipped
      back. Single characters can be turned back upright.
    - **Slow motion** (`def.slowmo`): the music slows down and drops in pitch.
    - **Music focus:** `Music.focus(0..1)` muffles the music (DECIBEL, STETHOSCOPE).
  - **New kit hooks:**
    - `intro(lv, c)` runs before a layer opens (MONTE's shuffle).
    - `afterHit(t, lv)` runs after BOARD (moves on a miss).
    - `onSafe(t, lv)` runs when the real node is found.
    - `intercept(i)` takes a tap before it's a pick; `cellTap(cell)` handles taps on any cell
      (LAGRANGE).
    - `marks(lv, now)` draws markers beside cells; `draw(put, lv, now)` draws freely on the board
      (PLAYBALL's ball, TWINLINK's links).
  - **The 15** (letter, level -> mod):
    - Moving nodes:
      - MONTE (`3`, 4): a shell game; follow the ball. A miss shuffles twice more. -> QUICK EYE
        (everything that moves runs 30% slower).
      - ENTROPY (`z`, 4): everything jumps cells every few seconds and the decoys get new glyphs.
        The real one keeps its glyph. -> ANCHOR (tap: nothing moves this layer; in a still corp,
        the clock stops 3s).
      - PREDATOR (`<`, 4): heat vision; the real one runs warmest on average, and they wander. ->
        INFRARED (a second of heat vision at every layer start).
      - AEGIS (`g`, 4): the formation advances; the real one skips every other advance. At the
        bottom: a breach, -1 int. -> AMBUSH (pick within 2s: a hit is free).
      - GRAVITAS (`I`, 5): gravity on every miss; the real one floats up a row. -> ANTIGRAV (a hit
        drops the ICE above onto it).
    - Hot and cold by pointer:
      - DECIBEL (`)`, 5): the music clears near the real one; a waveform on row 7 for muted
        players. -> STETHOSCOPE (sound only: the music clears near the real one, in any corp).
      - SQUALOR (`;`, 3): the crowd's emoji get happier near the real one (boss: angrier). A hit
        trends: +1 on the next for 5s. -> INFLUENCER (does nothing, as designed).
    - Time and screen:
      - BULLET TIME (`}`, 5): slow motion, but a real-time 14s clock. The real one ticks at full
        speed. -> TIMEWARP (tap: a half-speed clock).
      - UPSIDE (`6`, 5): the screen is upside down; the real one's word reads right side up. Boss:
        taps land mirrored. -> INVERSION (once per corp, a hit heals 1).
      - BITROT (`1`, 5): the real one is made only of your HUD characters (credit digits and #);
        everything rots while you look. -> LAST BYTE (at 1 int, the HUD spells the real column).
      - LAGRANGE NET (`2`, 5): the grid slides a column every 1.5s and a tap lands after the slide.
        `* *` marks where the real one will land. -> PRECOG (the real node powers on first).
    - Loops, meta and games:
      - GROUNDHOG (`8`, 5): a miss loops the layer; the spots you hit keep a red x and one node
        moves each loop. -> DEJA VU (a corp's first real node is where the last one was).
      - FOURTH WALL (`]`, 5): reads your save (deaths, mods, the time) and every pick you've ever
        made. It hides the real one away from your favorite zone, and says so. Boss: a fake crash;
        the real one is the `[x]`. -> SPOILER (a corp's tell on its intro, the first time in a run).
      - PLAYBALL (`0`, 5): pong over the grid. ICE cracks after 2 bumps; the real one rings. A
        ball out costs 20% pay (boss: two balls, -1 int). -> OVERTIME (a clock running out gives
        +5s, once a layer).
      - TWINLINK (`:`, 4): linked pairs flip together; the real one is never linked. Boss: double
        nodes, always ICE, hit for 2. -> LINKUP (a hit takes its partner; elsewhere, its mirror).
  - **RIVAL modifier** (`V`): a bot runs the corp too. It aims (red > <) and picks every few
    seconds. ICE it hits is locked for you and costs it 1 of 3 health; if it finds the real one
    first, it takes that layer's pay. Beat the corp with it flatlined: +30cr; with it never
    stealing a layer: +15cr.
  - **Sector bosses (the stage boss rethink):**
    - Sector 1's boss is OMNI. After that, a third of the time OMNI, and otherwise a LV4-5 corp
      with a modifier stacked on top: "SECTOR BOSS", its boss layer hits for 2, pays x1.5, final
      boss music.
    - OMNI now copies one corp you beat in that sector (its tell and twists, with OMNI's 2-damage
      boss and x2 pay). Its rules line lists which corps it could be. If you beat none, it uses
      the old borrowed tells.
  - **Checks:**
    - Moving corps ran hundreds of layers with no two nodes ever in one cell, and every tell
      held: MONTE, ENTROPY, AEGIS, GRAVITAS, PREDATOR (warmest on average over 6s).
    - TWINLINK and FOURTH WALL were checked on 120-180 generated layers each. Tapping LAGRANGE's
      mark found the real node 6 of 6 times.
    - Drag-select, the flipped taps and the mirrored boss taps were tested with pointer events.
    - Every mod was tested, and every corp played through to CORP BREACHED. The older tells,
      OMNI, the multiplayer sync (0 mismatches) and the smoke bots still pass.
  - Changed while building:
    - DECIBEL and SQUALOR read the pointer: hover on desktop, drag on touch, the keyboard cursor
      with arrows.
    - PLAYBALL: a ball out costs pay, not integrity (except on the boss), since it's hard on
      phones. The top paddle sits on row 7, where the hint usually is.
    - AEGIS's boss has a decoy that holds back once, instead of a search beam.
    - BITROT has no $ nodes (loot would change your credits).
    - Messages are now cut at 36 columns, and several old ones that ran off the screen were
      shortened.
  - Not yet: WATCHPOINT's PEEPHOLE (drag exists now), RIVAL's DRAFTING mod, BITROT's BITFLIP item,
    KERNEL's map reseed, CHUCK E. CACHE'S 2-tap boss, second boss mods, real art, multiplayer for
    the new corps. QUICK EYE doesn't slow the screen wipes.

## 16m. v10 (locked)

Started 2026-10-21 as an exact copy of v09 (only the version, title and save slot changed:
`beta_runner.v10.save`, so v10 starts with a fresh save, and its run save is
`beta_runner.v10.save.run`). v09 is locked as the build for testing all 74 corps. All new builds
go here. Note: v06-v10 share the same Firebase rooms; don't mix versions in one multiplayer room.

Built in v10:
- **Hacker logos and profile** (2026-10-21, the user's ask).
  - Every persona has a logo like the corps do: 15 ASCII logos (`HACKER_LOGOS`, up to 22 x 5: SKULL,
    ANON, TROLL, LOLCAT, GLIDER, SUDO, ACID, DOGE, BOT, JOLLY ROGER, 404, ROFLCOPTER, THIS IS FINE, THE
    EYE, HACK THE PLANET). Each comes with its 3-character mark (the old `LOGOS`), used in tight spots:
    the HUD, lists, and the multiplayer cursor (the mark's middle character).
  - PROFILE: the logo is drawn in your colors above the runner card, picked with `[ < ]` / `[ > ]`
    (tapping its name steps too). NEW NAME and COLOR stay. New `[ RANDOMIZE ALL ]` rolls name, logo and
    color (also in the multiplayer menu, which keeps its LOGO button).
  - Where it shows:
    - CORP BREACHED: your logo, your name and `breached <corp>` (the gap under it is dropped so the
      screen still fits).
    - Sector clear: your name, and the boss you beat by name (it isn't always OMNI now).
    - Multiplayer: when the turn goes to another player, a turn card fills the board for about a
      second, with their logo and `NAME'S TURN` in their colors (yours says YOUR TURN).
  - Old saves keep their logo number; the marks changed with the new set.
- **Database rules** (2026-10-21): `database.rules.json` (project root) replaces Firebase test mode.
  - Only `rooms/{code}` (4-6 capital letters / digits) can be read; the room list can't be, and
    nothing outside `rooms/` can be read or written.
  - Each part of a room only takes the fields the game writes, with types and sizes checked:
    meta, members, cursors, emotes, rounds, moves. Moves, emotes and rounds can't be overwritten.
  - Works for v06-v10 (v06's members have no color style).
  - Pasted into the Firebase console by the user (Realtime Database > Rules > Publish). Rooms are
    never deleted (small; clean up by hand if ever needed).
- **Multiplayer is open** (2026-10-21): `[ MULTIPLAYER ]` always shows on the title screen (next to
  SETTINGS), no longer only with dev on.
- **BONEYARD, the spooky corp** (2026-10-21, the user's ask; corp 75). Level 3, map letter `j`. Built from the
  §17 notes; Claude filled in the tell, boss and mod.
  - Intel: "the guy asked for something spooky." Rules line: they pay in bones here.
  - **Tell: the dead cast no shadow.** Every node casts a faint shadow (dim `:` down its right side) except
    the real node and 1 ghost decoy (2 deeper and on the boss). Shadows flicker now and then. Measured
    x1.8 over blind at tier 1, x1.5 at tier 2, x1.8 on the boss (target ~x2).
  - **Boss: the ghosts walk.** After every miss, one ghost (a shadowless decoy) fades and drifts to an empty
    cell ("something moved."). The real node never moves. ANCHOR stops it.
  - **Bones are their money:** the HUD shows `BONES` instead of `CR` inside, $ nodes are bone piles
    (`o=$=o`), and ICE hits rattle (dry clicks).
  - **Boss mod GRAVE ROBBER** `GRV` (LAYER END): clear a layer, +2cr for every ICE you never touched. (The
    seed idea, cash for ICE hits, was already POLICY, so it pays for clean play instead.)
  - Look and sound: grave purple and sickly green palette, bone-white gold; skull intro art; track
    GRAVE SHIFT (76 bpm, harmonic minor, half-time, long echo).
  - Checked headless (layers, shadows, odds); not yet played in a browser.

## 16n. v11, then dist/ (current)

**2026-10-21: the game moved to `dist/`** (`dist/index.html` + `dist/palettes.js`), the one master copy from now
on, tracked in git. `versions/` was renamed `prototypes/` (v01-v11 frozen there; v11 is the same as `dist/` at the
move). Save slot unchanged (`beta_runner.v11.save`), so progress carries over. See §14 for how releases work now.
New builds are listed below as before.

**Version log** (newest first; see §14 for the numbering):
- **v12.14** (2026-10-22): **the first EXOTIC mods: ICE EATER and ZOMBIE**, plus the exotic system (docs/EXOTICS.md). **System:** `kind: 'exotic'` mods (end of `MODS`), offered by the sector boss (always one, if any are left), markets (12%) and caches (5%; CACHEKEY 10/20/35% by tier), each from its own random stream (`exoticOffer`, `EXOTIC` in engine/mods.js) so normal offers roll as before. **Rule slots:** a mod's `slot` (goal, health, ...); taking one that shares a slot with a mod you own opens MODS CLASH (replace it / keep), `openClash` in engine/screens.js. **Locked** mods (`locked: true`) can't be swapped out or replaced (LOCKED in the swap list). **ICE EATER** (`goal`): tapping ICE eats it (no damage, crumbs), each bite pays the layer's pay / its ICE count, a layer with no ICE left clears (`eaterWatch`, every frame; ICE locked by mods / items counts and pays), every clear counts as perfect; biting the real node is death (FAILSAFE: once, the layer passes with no pay); X-AXIS / Y-AXIS never pick, a line holding the real node turns red for the layer (`lv.warn`); a timeout costs 1 integrity instead of a random tap; HYDRA grows at most 3 heads (boss 4). **ZOMBIE** (`health`, locked): rot (`ROT` in engine/mods.js: +3 a layer, +5 an ICE broken, +6 a timeout, 150 = you fall apart) in place of integrity on the HUD (`ROT 047/150`); a node takes 1 + rot/5 taps, weak taps only crack it (a `4/10` counter, same for ICE and the real node); healing takes rot off (10 a point); corp damage (GLACIER, AEGIS, HALFLIFE, PLAYBALL, CHANCE CARD, SACRIFICE) goes through `hurt()` and turns into rot; taking it spends FAILSAFE; no CONTINUE?.
- **v12.13** (2026-10-22): **MOD FIRED, one animation for every mod.** The look lives in one place, `MOD_FIRE` + `modFireLook()` at the top of engine/mods.js (how long, blink rate, a hop wave across the letters); drawBadge just asks it. `modFired(key)` is called where mods take effect, mostly in shared spots so new mods get it free: `lockTile` (any mod that locks a node), the HIT and LAYER END loops (a mod returns `false` when nothing happened), every BLOCK branch, tap-to-use (`activateMod`), the pay boosts when pay lands (SKIMMER, FASTPAY, SURGE, SUPERSIZE, ON BEAT), start notes and the layer-start mods (RUNWAY, PRECOG, HANDSHAKE...), and once per layer for mods the screen shows by itself (`modFiredOnce`: CCTV, INFRARED, AFTERIMAGE). Also SPOILER, OVERTIME, CONTINUE?, PRIORITY, CACHEKEY, COUPON / HAGGLE (market opens). Not hooked (always-on, nothing to see): BUFFER, STASH, COOLANT, QUICK EYE, STETHOSCOPE, INFLUENCER. A mod already playing doesn't restart. MUTATE's badge plays for the mod it's copying.
- **v12.12** (2026-10-22): **mods you can see go off** (the rest of the §16f item). Shared: a mod's tray badge flashes for ~0.9s when it fires (`modFired(key)`, engine/mods.js; X-AXIS / Y-AXIS, the five below). After an ICE hit, mods that changed the hit node say so one at a time (`callout()` in engine/run.js, ~0.5s each, after the hit's 450ms beat): **KEYLOGGER** ("real node's top line."; the line types in), **TRACER** ("real node is down+right."; the arrows appear then, blinking). **VIRUS**: the node next to it glitches in the accent color (0.4s, "spreading..."), then locks (INFCT, accent, not red). **SHATTER**: the node is drawn as cracked glass in grey, not a red hit. **FAILSAFE**: the killing hit reads as the end first ("integrity gone.", the HUD at 0, 0.65s), then the save: shield sound, accent flash, the HUD blinks back to 1 (`failsafeBeat()`, also used by DEMOLITION).
- **v12.11** (2026-10-22): **corp map codes** and **X-AXIS / Y-AXIS scans you can see**. Each corp has a 2-letter `code` in its file (`SK`, `BR`...); the game adds its level as the third character (`SK1`, `BR5`: `corpCode()` in engine/corps.js). The code takes the place of `[S]` on the map (in the corp's colors; nodes you can go to get a glint that sweeps across the code now and then), and in the codex, the help page, the results' breached list, OMNI's "copies one of" line and the dev corp list. Stops and OMNI keep their brackets (`[$]` `[?]` `[+]` `[!]`). The old one-character `letter` is gone from the corps. X-AXIS / Y-AXIS: the scan runs out from the tap along the row / column, a node a step (ticks; the empty cells show `-` / `|`), the real node lights up with a ping, a beat (650ms), then the reveal; the tapped node shows SCAN in the accent color, not red. A scan that misses lights its line dim for a moment (no extra wait before the hit).
- **v12.10** (2026-10-22): the message line ("> BOSS LAYER. 6 nodes.") follows palette changes. It kept the color
  value it was posted with, so a palette switch (a corp's colors fading in, or an edit in the palette editor) left it
  in the old color until the next message; now `setMsg` remembers the color slot and the line looks it up live.
  Found by the user in the palette editor's boss scene.
- **v12.09** (2026-10-22): the palette editor's market scene gives 48 credits (was 999): a mix of offers you can and
  can't afford, so both looks show.
- **v12.08** (2026-10-22): market right column: the tags (mod / mod+ / item / svc) sit in their own 4-wide column, so they
  line up on the left as well as the prices on the right.
- **v12.07** (2026-10-22): STASH's upgrade text says what changes: "same slot. loot: an item more often" (RARE), "same
  slot. loot: always an item" (EPIC). The old "+1 slot, more items" read like a second slot to the user.
- **v12.06** (2026-10-22): market tag for a mod you'd upgrade: `mod+` instead of `up` (the user's pick; matches the
  `+` after its name).
- **v12.05** (2026-10-22): market items always say `item` in the right column (a tiered item used to show its tier,
  e.g. PATCH said RARE, which read like a bug to the user); the rarity shows on the name chip and in the details.
- **v12.04** (2026-10-22): offers you can't take (too expensive, sold, locked) keep their color bit at full strength (a
  mod's badge chip, an item's name chip) and grey out the rest (name, price, label), the user's call: "i like seeing the
  colors of things even if i can't buy them". (Replaces v12.03's key-color-text look.)
- **v12.03** (2026-10-22): market / reward offers you can't take (too expensive, sold, locked) keep their rarity: the
  key color as text, no chip (they used to go plain grey). The palette editor's market scene gives 999 credits, so
  every offer shows its chip.
- **v12.02** (2026-10-22): **self-contained corp files.** Each `corps/KEY.js` now also holds the helpers only that
  corp uses (49 of them moved out of `engine/corpkit.js`: MONTE's cups and shuffle, NOIR's statements, HALFLIFE's
  geiger, MOCHI's faces...) and its music track (`SONGS.<track>` + `MUSIC_FOR.KEY`, all 78). `corpkit.js` keeps only
  what's shared (488 -> 243 lines; the kit list at its top is regenerated: 81 names). Boss mods stay in
  `data/mods.js`, because the order of MODS decides reward rolls (moving a corp's mod would change which mods get
  offered); each corp file starts with a note naming its boss mod. Plays exactly the same (fingerprint and all 78
  corps). The dev music player now lists the menu / map / OMNI tracks first, then the corps' in corp order.
- **v12.01** (2026-10-22): **rarity chips** (the user's idea: "all the items and mods always have a bg color and a text
  color... everywhere in the game so we never need to worry about readability").
  - Each rarity is a fixed pair, a text color on its own background, the same in every palette ("light chips", the
    user's pick: the key color is the background): COMMON dark on light grey, RARE dark blue on light blue, EPIC dark
    purple on light purple, EXOTIC dark brown on yellow, BOSS dark red on orange. In `palettes.js` as `chips`
    (editable in the palette editor's "rarity chips" tab); `CHIPS` + `chipOf()` in the code. A rarity's "key
    color" (`C.rare`...) is its chip's background, the same everywhere (reward bursts, fireworks).
  - Where: tray mod badges and item names, the mod / item info lines, market and reward lists (badge chip + the
    RARE / EPIC label as a chip; item names on their chip), the swap screens, run results, the codex, the HOW TO
    PLAY rarity legend. In running text only the rarity words get a chip (`chips: true` on a line,
    `rarityChips()`); a whole name: `chip: 'rare'`; list rows: `chip` (name) / `rightChips`. The faint
    rarity tints behind list rows are gone.
  - Badges: selected = the chip inverted (key color on dark); blink / spin flash by inverting; cycle inverts letter
    by letter; EXOTIC breaks the rule on purpose (its letters cycle through every rarity's chip, the user: exotics
    and boss can break the rules with animations). Spent / can't-use mods and items: plain grey, no chip.
  - Palettes lost their 5 rarity colors (and the shared corp set): 9 slots each now, and fewer warnings (40 -> 37).
  - `palettes.js` got its version stamp (the editor writes it with the game's build; `bump.js` updates it) and
    the title's file check covers it. `NEON_FILES` now starts before `palettes.js` in index.html.
  - Checked: fingerprint (layers and maps unchanged; palettes / help text changed on purpose), all 78 corps play
    the same, the palette editor test, screenshots of the tray, market, codex and a light palette.
- **v12.00** (2026-10-21): **the game in files** (the user: "lets break this stuff out into components or files that
  make sense... warrants a major version"). Plays exactly like v11.06; nothing new to see except the meta tags.
  - **Layout:** `dist/index.html` is just the page; the game is 108 plain scripts loaded in order (still works
    opened from a local file, no build step): `engine/` (30 files of code by job), `data/` (glyphs, title art,
    personas, mods + items, music) and `corps/` (one file per corp: its definition and hooks, codex text and
    intro art). Each top-level piece of the old script moved verbatim (split with a JS parser, not by hand);
    the old wrapper function is gone, so the files share one global scope. `engine/corpkit.js` starts with
    how to add a corp and the list of the 124 game names the corp files use (the "corp kit").
  - **Version stamps:** every file starts with `NEON_FILES.push(['engine/core.js', 'v12.00'])`, the script
    links carry `?v=12.00` (phones fetch new copies), and the title shows a red warning if a file is missing or
    from another build. `palettes.js` gets the link only for now (the palette editor writes that file; its
    stamp waits until the editor writes it too).
  - **Save:** new slot `beta_runner.v12.save`; the first load copies the v11 save (and a run in progress).
  - **Meta tags:** description, link previews (og / twitter card with `preview.png`, the title art + a
    pitch), theme color, tab icon (`icon.svg`, the big N with a raised +1), phone home-screen icon. The preview
    image needs a full address: it points at one shared copy in the root of the user's game folder,
    `https://gregschomburg.com/br/preview.png` (the version folders live under /br/), so no version has to change
    it; the image has no build number in it.
  - **Tools:** `tools/check.js` (fingerprint: every corp's layers at 3 tiers x 3 seeds, maps, 38 data tables,
    340 function hashes; v12 matched v11.06 exactly), `tools/playtest.js` (plays all 78 corps in headless
    Chrome; 78/78 the same, 7 corps' hints run on the clock), `tools/bump.js`. `tell_odds.js` loads the
    split game. The fingerprints live in `tools/check/` (git-ignored; `node tools/check.js save baseline`).
  - Also: HYDRA's `moveTo` helper renamed `moveTile` (it shadowed the browser's `window.moveTo` once the code
    became global).
- **v11.06** (2026-10-21): **fix: SHARE LINK crashed the Chrome tab** ("Aw, Snap!", the user's first try, on the
  local file). It called the browser share sheet, which on a computer is the Windows share dialog. Now the share
  sheet is only used on phones (coarse pointer) on http(s); everywhere else the link is copied, with a note when
  it's a local file link.
- **v11.05** (2026-10-21): INFO credits: the original idea is the user's ("idea and design"), and One True
  Door is "started from ... as the reference" (the user fed it in with the first prompt). Readme matches. New
  `docs/REVIEW.md`: the user's review list (things to look at), kept by Claude.
- **v11.04** (2026-10-21): **the small batch.**
  - Persona names: THE (before-word) and PLAGUE (middle word), so THE_PLAGUE can roll.
  - Hacker logo on your style's background: CORP BREACHED draws logo + name as one block in your colors
    (`logoBlock`); PROFILE is one card (logo, name, best / runs / wins / codex) with the logo picker, color,
    NEW NAME and RANDOMIZE ALL under it. (The multiplayer turn card already filled the board with your colors.)
  - Multiplayer join: a room-code box on the MULTIPLAYER screen (the game's own text field) + `[ JOIN ]`;
    Enter joins. No more browser popup. Text fields now tell `onCommit` whether Enter was pressed.
  - Share link: `[ SHARE LINK ]` in the lobby (everyone, not just the host): the phone share sheet, or the
    link copied. Opening `?room=CODE` goes to MULTIPLAYER with the code filled in and joins.
  - INFO page: the footer's version tag is now `neon+1 v11.04 [?]` and opens INFO (what the game is, design
    by greg, built with Claude in Claude Code, inspired by One True Door, made in 2026, a GitHub button).
    Tappable everywhere except during a run or a multiplayer game.
  - Readme: how to play, what's in it, a version history table; the history note updated for `dist/`.
- **v11.03** (2026-10-21): **the palette editor** (`tools/palette_editor.html`, palette pass item 9) and its bridge in
  the game (`?editor=1` only). See "Palette editor" below.
- **v11.02** (2026-10-21): **starters are the 9 level-1 corps only** (the user: "for simplicity"): BASIC, PARCELNET,
  MOCHI, PERIMETER, SEEKR, MEGAMART, BURGERTRON, NIMBUS, PLAYTIME. CHRONOS and MIRRORLINE keep the GREEN CRT /
  PAPER colors but are locked again. (Old saves on those two keep them until the player changes palette.)
- **v11.01** (2026-10-21): **one palette list.** The 5 player palettes were folded into corps (the user's call:
  "no difference, special player palettes"), matched by closeness: DEFAULT -> BASIC, AMBER CRT -> PARCELNET,
  DUSK -> MOCHI (all level 1), GREEN CRT -> CHRONOS (its near twin), PAPER -> MIRRORLINE (the other light one).
  Those corps now wear those colors (their old looks are in each palette's `note` and in git). **Starters**
  (shown in SETTINGS from the start): all 9 level-1 corps + CHRONOS + MIRRORLINE; the rest stay `hidden`
  (locked) until unlocks are built. New players start on BASIC (the old DEFAULT colors); old saves are mapped
  (`OLD_PALETTES`), so nobody's colors change. Player color styles (`PLAYER_STYLES`) moved to `palettes.js`
  (`styles`, same order). SETTINGS palette label widened for corp names.
- **v11.00** (2026-10-21): the starting point of `dist/`: everything in the v11 list below (NeoN+1 title,
  CIPHER / HYDRA / BLACKOUT, `palettes.js` + slot rename, the move to `dist/`) and the new build numbers.

Started 2026-10-21 as an exact copy of v10 (only the version, title and save slot changed:
`beta_runner.v11.save`, so v11 starts with a fresh save, and its run save is
`beta_runner.v11.save.run`). v10 is locked (the user is testing the corps on it, BONEYARD included). All new
builds go here. Note: v06-v11 share the same Firebase rooms; don't mix versions in one multiplayer room.

Built in v11:
- **NeoN+1 title logotype** (2026-10-21): see 16f (first item) for the details.
- **Three style corps: CIPHER, HYDRA, BLACKOUT** (2026-10-21, the user's ask: build them before the palette /
  style pass, so the pass covers everything). From the §17 ideas; Claude filled in the tells, bosses and mods.
  Corps 76-78. Each has its own palette, track, intro art, codex tell and boss mod. Checked headless
  (layers, odds, a full visit of each at tiers 1 and 2, screenshots); not yet played in a browser.
  - **CIPHER** (`{`, LV4). Inside the corp every letter on screen turns into a symbol (`CIPHER_SYMS`, 26 shapes
    like `◆ ▲ ● ◐ ◢ ★ ⌘ Ω`), done at draw time (`cipherNow`), so the HUD, messages, tray, board, and floating
    text all go. Digits and punctuation stay readable. Menus, pause, panels and the dev menu read normally.
    New mapping every visit.
    - **Tell: the key line.** Row 7 shows `key: ROW 2` or `key: COL 3`, in cipher (number readable): that line
      holds the real node (75% of the time, like other tells). You have to learn which symbols spell ROW and
      which spell COL; messages you already know ("4 nodes. one is real.") help crack it. Measured x2.2 over
      blind once decoded (x1.7 before), x2.5 at tier 2.
    - **Boss: the cipher shifts.** Every miss reshuffles the alphabet (a scramble and a modem chirp).
    - **Mod PARITY** `PAR` (ON HIT): an ICE hit says whether the real node shares its row or column
      (`par: in line` / `off line`).
    - Palette code-book teal + mint; track ENIGMA (phrygian).
  - **HYDRA** (`(`, LV3). "Cut off one head..."
    - **Tell: heads grow from the body** (the real node). Every layer opens with 2 young heads (always ICE,
      head glyph `<o o>`) next to it; tier 2: one of them grows anywhere. Every ICE hit grows a new head
      next to the body (it glitches in); tier 2+: new heads look like any node, so watch where they appear.
      Row 7: `heads grown: N`. Measured x2.4 (tier 1), x2.2 (tier 2).
    - **Boss: two heads for every one.** No young heads; each hit grows two plain-looking nodes, one next
      to the body, one anywhere.
    - **Mod HEADCOUNT** `HDC` (LAYER START): a note with how many nodes touch the real node.
    - Palette swamp green + venom violet; track MANY HEADS.
  - **BLACKOUT** (`5`, LV3). The palette fades into the background every layer (0%, 20%, 40%, 60%; tier 2
    +10%; boss 74%), every color but red, so the nodes you hit stay bright red landmarks. The lights come
    back on when you beat it or die. Row 7: `power [###.....]`. Works with any palette (it fades toward
    the background color, so PAPER fades to white).
    - **Tell: afterglow.** When the lights flash (the layer opening, every ICE hit), every node lights up
      and fades (0.45s); the real node glows longest (1.4s). Tier 2: one decoy glows long too, and the
      glow is shorter. Different from BRIGHTLINE (whose real node stays lit during timed brownouts).
      Measured x2.5 (tier 1), x1.9 (tier 2).
    - **Boss: nearly black**, two slow-glowing decoys, a short glow.
    - **Mod FLARE** `FLR` (TAP, once per corp): splits the board down the middle; the half without the
      real node lights up and its ICE is ruled out (dimmed).
    - Palette pitch black + emergency yellow; track LIGHTS OUT (ambient).
  - Map letters `{` `(` `5` are placeholders (most letters are taken).
  - Also fixed: BONEYARD's intro skull was missing a backslash on its jaw line.
- **Palette editor** (v11.03): open `tools/palette_editor.html` in Chrome (straight from the repo folder).
  - **Left: the game** in a frame (`dist/index.html?editor=1`), always painted in the palette you're editing.
    Scene buttons set up a screen with a canned run, no playing needed: title, map, layer, a miss (a red hit
    node, a locked node, the cursor on a node), boss, shop, how to play, codex, settings, profile. Layers use
    the palette's own corp (or any corp from the list). The tray gets a mod of every rarity and a few items.
    Frame widths (phone 360 / 390 / 480, tablet 720) and a darkness slider (BLACKOUT's fade).
  - **Right: the form.** Palette tab: pick a palette (starters / locked; warning counts in the list), name,
    starter on/off, note, the 9 color slots (picker + hex + contrast on the background), rarity colors (the
    shared corp set with per-color overrides, or its own), font weight, a quick-look sample, checks (hard to
    read, colors that look alike) and look-alike palettes. All palettes tab: a grid of cards (filter starters /
    locked / with warnings; sort by file order, most like the selected one, lightest first). Shared rarity tab.
    Player styles tab (edit, add at the end; no removing, saves point at them by position).
  - **Randomizer** (the user's ask): "random: smart" builds a palette by rules: a dark or light background
    (choosable; 80% dark), a text ladder in one hue stepping up in contrast (dim ~1.5, mid ~3.8, text ~8,
    bright ~14:1), an accent from a color-wheel scheme against the background, danger reddish and money goldish
    (moved round the wheel when too close to the accent), each color nudged to its contrast target (2,000
    test rolls: no contrast or look-alike warnings). "random: wild" = every color random. Per-color lock
    boxes (smart builds around locked ones, e.g. keep the background). "rarity too" also rolls the 5 rarity
    colors (rare blue, epic purple, exotic yellow, boss orange, common = text) and gives the palette its own
    set. Each roll is one undo step.
  - **Save** writes `dist/palettes.js` directly (first time: pick the file; the link is remembered). Reload
    file, export (clipboard + download), undo / redo (Ctrl+Z, Ctrl+Shift+Z), Ctrl+S. Warns before closing with
    unsaved changes. The writer reproduces the file exactly (checked), starters first, then locked.
  - **Game side:** `?editor=1` uses its own save slot (`beta_runner.editor.save`, sound off), holds clocks still,
    and takes messages: new palette data (live), which palette to show (+ darkness), which scene to set up.
- **Palettes moved to `palettes.js` (now `dist/palettes.js`), slots renamed** (2026-10-21; palette pass items 1 and 9).
  - The game loads `palettes.js` with a `<script src>` before its own script; **upload it next to the game**.
    If it fails to load, the game falls back to DEFAULT only.
  - Format (`window.NEON_PALETTES`): `rarity.corp` holds the shared corp rarity colors once; each palette is
    one line with all 9 base slots, `rarity: 'corp'` plus any rarity colors it changes (or all 5), `hidden`
    for corp palettes, `font` (OMNI), and `note` (the old end-of-line comments). Generated from the old
    block and checked: every palette resolves to exactly the same colors as before.
  - Slots renamed everywhere in the code (461 uses): `cyan` -> `accent`, `red` -> `danger`, `redDim` ->
    `dangerDim`, `gold` -> `money`. Rarity slots unchanged.
  - `tools/tell_odds.js` loads `palettes.js` too. Checked with a full headless visit of CIPHER, HYDRA and
    BLACKOUT, and a screenshot of a PERIMETER layer.

## 17. Ideas backlog

- **Corp logo on the boss intro** (the user, 2026-10-21). The boss entrance (`!! WARNING !!`, the corp name, its line) could show the corp's logo too. Logged, not built.

- **Stage boss rethink** (the user, 2026-10-20). **Built in v09** (2026-10-21, see §16l "Tier 3"):
  sector bosses after sector 1 are a third OMNI and otherwise a LV4-5 corp with a modifier, and
  OMNI copies a corp you beat in that sector. Left over from the idea: two modifiers stacked.

Not yet placed in a version.
- Trap types: damage, instant kill, alarm (raises a corp-wide trace meter), lockout
- Trace meter: misses raise alarm across a corp; at max, the boss arrives early or ICE hunts you
- Daily seed challenge
- Corp codex of learned tells
- Recon nodes / items that hint at a tell

- Hurtful clue nodes: like loot ICE, but they give a clue about the real node instead of loot
- Clues as unlocks: TRACER-style clue tools could also be meta unlocks
- Corp palettes (see §11)

- **Big ASCII art for player logos.** Each player logo keeps its short 3-character form (`<#>`, `{@}`) for tight spots (HUD, cursors, lists), but also gets a bigger ASCII illustration like the in-game corps' intro art (~5-7 rows). Used on the profile / runner card, the multiplayer lobby and results, maybe a short "player intro" when a multiplayer game starts or when it's your turn. More big logos could be achievement / REP unlocks.
- **Achievements + persona unlocks.** Achievements for things like a first win, a naked (0 mod) win, beating each corp, perfect streaks, reaching layer X, winning a multiplayer game. They unlock cosmetics for your persona / runner card: more logos, **hats** and accessories (ASCII bits above or beside the logo), card frames and colors, titles under your name ("SIGIL BREAKER"). Could tie into REP (buy some with REP, earn others only via achievements). Shown on the profile card and to other players in multiplayer.
- **Leaderboards / scores, front and center.** Show how you're doing right on the title screen, e.g. a small panel or line: `TODAY 07   ALL TIME 21`, plus a `[ SCORES ]` screen.
  - **Daily vs all time:** pairs with the daily seed idea; everyone plays the same seed today, so a daily board is fair.
  - **Local first (easy):** your own best today / this week / all time, and a top-10 list of your runs (seed, depth, corps, date) from saved history. Works offline in the browser.
  - **Online later (needs a server):** a real shared leaderboard needs a backend (e.g. a small hosted database, or Game Center / Google Play / Steam leaderboards if this becomes an app). Also needs some cheat-proofing: seeded runs help (a run can be replayed from its seed + moves to verify it).
  - **What's the score?** Layers stay the main score. Mods taken count *against* you as a sign of difficulty: a deep run with few or no mods should rank as impressive.
    - Every board entry shows depth **and** how many mods you took, e.g. `21 layers  3 mods`. Ties break in favor of fewer mods.
    - A **NAKED** tag (and maybe its own board) for runs with 0 mods.
    - Optional later: a combined score, e.g. layers x a bonus that shrinks with each mod, if a single number is needed.
  - Practice / cheated / abandoned runs never count.
- **Endless runs: sectors.** Today a run ends after OMNI//CORE. Instead, beating a map's final corp opens the next map ("sector 2", "sector 3", ...), and the run can go on indefinitely.
  - Each new sector introduces something new: new corps, new corp effects, harder tell variants, new node types.
  - The first node of a new sector is something good (market, safehouse, or a choice).
  - Clearing a sector ties into the legacy system: bank some REP / unlock legacy stuff (see below).
  - Seed: still one seed for the whole run; each sector's map is generated from the seed + sector number, so every sector is different.
- **Node count keeps climbing.** Today each corp resets (tier 1 layers start at 2 nodes, tier 2 at 3, the final corp at 4). Idea: node count keeps stacking across the run instead, +1 every layer (corp to corp, sector to sector), so difficulty grows naturally.
  - The grid already grows past 12 nodes (4x5, 5x5, ...), but phone screens cap out around 6 columns, so this needs a plan for very big grids (bigger rows, scrolling, smaller tiles) or a soft cap.
  - Opens up mods/items that change node count: e.g. remove a node from the next layer, freeze the count for a corp, "+1 node but double pay".
  - Balance: much harder without more healing/tools; tune together with REP unlocks.
- **More varied map layouts.** Today every map is the same grid (6 steps, 3 lanes, all nodes present); only the links change. Ideas:
  - Missing nodes (gaps in the grid).
  - Links that skip a lane (a diagonal two lanes over).
  - Sideways links within the same step (move left/right before going up).
  - Dead ends. Careful: you can only move forward, so a true dead end would end the run. Options: dead ends hold a big reward and then let you "jack out" (end the sector early) or warp back onto the map; or only allow them when a sideways link leads out.
  - Different lane counts or shapes per sector (wider, narrower, diamond).
- **Moving backwards on the map.** Today you can only go up. Allowing any link (back, sideways) would make the map a real network and makes dead ends work naturally (walk back out). Why maps are usually one-way: no farming of safehouses/caches/markets, route choices stay meaningful (taking one path means skipping another), and runs have a set length. Ways to keep that if backtracking is allowed:
  - **Spent nodes:** visited nodes give nothing a second time (beaten corps are cleared, markets close after one visit).
  - **Trace meter:** every move (or every move backwards) raises trace; at max something hunts you (an ICE ambush layer, integrity damage, or the final corp's clock starts).
  - **Move budget:** a set number of moves per sector.
  - Leaning: spent nodes + a trace meter.
  - **Refined idea (frontier):** no walking back step by step. Instead you can pick **any node linked to any node you've already visited** (the open frontier of the map). Visited nodes can't be activated again. Dead ends stop being a problem, since other branches stay open. Still needs a limit so you can't clear the whole map: a trace meter, or a set number of stops per sector (e.g. the final corp opens / forces itself after N stops).
  - **Or: allow clearing the whole map.** Corps are already risky (each costs integrity, you can die in any of them), so a full clear is a push-your-luck choice at map level. Risks to manage: it becoming the obvious move every run, power creep (more mods make the final corp too easy), longer runs (~13 stops vs 5). Balancing options: the final corp scales with what you took (more nodes / shorter clock per extra corp cleared), diminishing rewards later in a sector, or a special bonus for a full clear (extra REP, a rare mod). Leaning: allow it; corp risk + a final corp that scales does the balancing, no trace meter or stop limit needed.
- **Keep-between-runs progression** (like 1TD's souls + Altar of Souls; planned for v05). Nothing carries over between runs yet besides stats and the codex.
  - **Currency name** (not "souls"): ideas: **REP** (street reputation), **ROOT** points, **SALVAGE**, **SHARDS**, **LEGACY CODE**, **GHOST DATA**. Leaning REP: you earn rep by how deep you got.
  - **Earned** at the end of every run (win or lose): from layers cleared, corps breached, perfect picks, credits earned. Not from practice or abandoned runs.
  - **Spent at** a meta shop reached from the title. Fits the look: an old-school hacker **BBS** (bulletin board) screen, e.g. "THE BOARD".
  - **Unlock ideas:** +1 starting integrity, +1 item slot, start with an extra item, starting credits, add mods to the pool (like 1TD's locked relics), unlock palettes (ties into "palettes as unlockables"), seed replay, maybe new corps or the codex lore.
- **Corp idea: CIPHER** (working name; **built v11**, see §16n). Inside this corp everything is shown in a symbol "font", Wingdings-style: messages, HUD labels, node info, maybe even the tile glyphs turn into symbols. You have to play by shape and memory instead of reading.
  - Tech note: real Wingdings isn't available on the web/phones, so do it as our own substitution: each letter/character maps to a symbol (e.g. Unicode shapes like `◆ ▲ ☼ ♠ ⌘ ✦`, or a custom set). Same idea, works everywhere, and we control it.
  - Tell idea: the cipher is consistent, so the real node's glyph is always the same *symbol* even though you can't "read" it; or one line of the HUD stays readable as a hint.
  - Counter items/mods: a DECODER that translates for one layer, or a mod that keeps the HUD readable.
  - Boss twist: the cipher re-shuffles mid-layer, or after every miss.
- **Corp idea: bad security** (noted v07; working names: BUDGETWALL, LOWBID SECURITY, PASSWORD123 INC). A corp with laughably weak security. The nodes show **passwords** instead of glyphs. The real node's password on layer 1 is something like `12345`; each next layer it **changes just a little** (`1234!`, then `1235!`, then `12E5!`...), the way people "rotate" a password. Decoys show other passwords that changed a lot, or aren't related at all.
  - The tell: find the password that's one small edit away from the last real one (you saw it when you found the real node).
  - Fun, readable, a little funny: a good **filler corp** candidate (see "filler vs signature corps"). Pairs with KEYLOGGER-style ideas.
  - Harder versions / boss: decoys that are also near-misses (one edit away, but the wrong edit), or two characters change at once. Passwords fit the 5-wide node face (5 characters).
- **Corp idea: corrupted / rotting corp** (noted v07; working names: BITROT, LEGACY SYS, DEADLINK, ARCHIVE-9). An old corp whose data is busted. Mostly an **aesthetic** corp: nodes look glitchy and falling apart (frames with missing pieces, glyphs flickering to noise, characters dropping out), and they **drift / jitter around a little** (ties to the early "moving tiles" idea). Palette: faded, washed-out colors with bad-pixel accents; music: a detuned, wobbly (tape-warped) track.
  - Tell: open / not required. Light ideas if wanted: the real node is the **least corrupted** one (or the one that stays still), or the real node is the one whose glyph **holds steady** for a moment between glitches. Could also just use no tell (like CHRONOS) and be pure atmosphere, maybe as a filler corp.
  - Boss: corruption spreads each miss (more nodes glitch harder, or nodes swap places).
- **Corp idea: HYDRA** (working name; "cut one head off, another grows"; **built v11**, see §16n). Hitting an ICE node spawns a new node somewhere else on the grid, so your odds never improve just by guessing.
  - The skill part: spawned nodes are always ICE. If you keep track of which nodes appeared mid-layer, you can rule them out. Maybe a tiny tell on new nodes (they glitch in, or a frame detail differs) that gets subtler at higher tiers.
  - Boss twist: each hit spawns two, or spawned nodes look identical to the originals.
  - Could also work as a boss for another corp instead of a full corp.
  - Mod ideas around it: something that marks spawned nodes, or stops the first spawn per layer.
- **Tell balance pass** (noted v07). `tools/tell_odds.js` measures how much each corp's tell helps once known (first-pick odds, knowing vs blind) and ranks the corps; results in CONTENT.md "Difficulty ranking". Today PERIMETER and MIRRORLINE are too easy once learned (x2.3-3.5 over blind; MIRRORLINE's boss ~80% first try), SIGIL is about right (x1.4-2), CHRONOS has no tell (x1.0, the clock is its difficulty). Levers: lower `tellStrength` (0.75) for position tells, add decoys on target cells (PERIMETER: extra ICE on corners; MIRRORLINE: ICE beside the mirror cell), bosses that counter the tell instead of moving it, a tier-2 twist for PERIMETER (e.g. any edge cell). Goal: each corp around x2, re-run the tool to check.
- **Show corp difficulty in game** (noted v07). Use the tell-odds ranking to show how hard each corp is: e.g. a difficulty rating (`DIFF ###--`) on the codex CORPS page and/or the map node info, maybe a "hardest corps" list. Rank by the tool's numbers (rerun when tells change), possibly blended with real stats later (breach/loss rates from the codex records, or leaderboards).
- **More final bosses, each truly unique** (noted v07). OMNI//CORE is interesting because it's different every run (it borrows a tell), but it's the only final. Idea: a pool of big end bosses, one per run/sector (pairs well with endless sectors), each with its own mechanic, art, palette and music rather than a remix of corp tells. Seeds for ideas: a boss that changes the rules between layers, one that fights back (moves nodes, hides glyphs, eats items), one built around the clock, one that uses your own run against you (your mods, your last picks). Use `tools/tell_odds.js` to check each one lands in a "hard but learnable" band.
- **Corp tiers of difficulty: filler vs signature corps** (noted v07). Add a set of **easier filler corps** (simple, readable tells, low stakes) to pad maps and teach the basics, alongside the current corps as the main/signature ones, and the big bosses on top. The difficulty ranking (CONTENT.md) can place each corp: filler corps aim for a big tell advantage (easy once learned), signature corps around x2, bosses lower. Map generation could then place filler corps early (tier 1) and harder ones deeper.
- **Built v08:** **Overworld corp icons in their corp colors** (noted v08). On the map, draw each corp node (`[S]`, `[P]`, ...) in that corp's palette so you can tell them apart at a glance, e.g. the corp's background color behind the `[S]`. Needs a tweak because the map itself can be in any corp's palette: when a node's color is too close to the current map background, fall back (outline, inverted, or a nudged shade) so it still reads.
- **Persona: a randomize button** (noted v08). On the profile screen, one `[ RANDOMIZE ]` that rolls everything at once: name (from the 3 word lists), logo and color style.
- **[DEV] button: settled, no change** (noted v08). It's hidden by default and shows with `?dev=1`; the backtick key opens the menu and turns the button on until a refresh. The user is fine with that.
- **Minesweeper ideas** (noted v08). A mod where tripping an ICE also **deactivates any ICE close to it** (all neighbors, not just one). Note: VIRUS (EPIC) already locks **one** neighboring ICE on a hit, so this could be VIRUS's bigger version (a tier, or its own EXOTIC mod, e.g. CHAINLOCK / DETONATOR), or VIRUS could become tiered (1 / 2 / all neighbors). *(Claude)*: a minesweeper corp where hit ICE shows a **number**: how many steps away the real node is (or how many ICE touch it).
- **Corp idea: shell game** (noted v08; names *(Claude)*: SHELLGAME, THREE CARD, MONTE). The real node **moves** to another node without you seeing the switch. *(Claude)*: nodes shuffle positions in a quick animation (cups sliding) you can follow if you're sharp; or swaps happen unseen but leave a tell (a glyph line flickers on the two nodes that swapped); boss: more swaps, faster.
- **Corp idea: gambling** (noted v08; names *(Claude)*: HOUSE EDGE, LUCKY 7, CASINO.SYS). Ideas: **double down** on a node (bet that your pick is right: double pay if real, double damage if ICE), either as the corp's mechanic or as its boss mod. *(Claude)*: slot-machine glyphs (the real node shows three matching symbols); a "let it ride" choice after each layer.
- **Corp idea: punk** (the user, 2026-10-22; details still to come from the user).
- **THE CHOIR as a "ministry", not a corp** (the user, 2026-10-22). The cult (THE CHOIR, LV3: faith x2 or tithe;
  boss mod SACRIFICE) would be a ministry. *(Claude)*: a name like THE MINISTRY or MINISTRY OF THE CHOIR (map code
  then MN / MC instead of CH), and its own words where the game says "corp" ("MINISTRY BREACHED", the codex line).
  Opens a door: other non-corps could get their own word too (a gang, an agency, a family: LA FAMIGLIA). That
  needs a per-corp label (e.g. `kind: 'ministry'`) the screens read, instead of "CORP" written in.
- **Corp idea: an arms dealer** (the user, 2026-10-22). A corp that sells weapons; it also runs gun ads
  ([ADS.md](ADS.md)). Close to it today: AEGIS DEFENSE, CARAPACE ARMOR, PREDATOR, DEMOLITION CO (none is a dealer;
  one could become one). *(Claude)* names: GUNMETAL, SURPLUS, ARSENAL, BRASS & SONS. Tell sketch: the nodes are
  crates with serial numbers / calibers, the real one matches a manifest on the hint line; boss: a sting (one
  decoy is a federal crate, hit it and it costs more). Mod: a sidearm-style one-shot (tap: lock 1 ICE, once a corp).
- **Lean more cyberpunk: cyberware** (the user, 2026-10-22). The game mentions almost no cyberpunk stuff (the theme
  was kept light on purpose, see the top). Ways to add it without changing play: the ads ([ADS.md](ADS.md), implant
  and chrome ads), mod / item names and flavor (*(Claude)*: some items as implants: an optic, a neural port, reflex
  boosters), corp intel lines, the codex, MEDIX as a chrome clinic, and the runner card (installed chrome as a stat).
- **Corp idea: a dating app** (the user, 2026-10-22; like Bumble or Match). Not designed yet. *(Claude)* sketches to
  react to: names SPARKD, KINDLR, SOULM8, LOVE.EXE. Nodes are profiles (a tiny face + 3 interests); the hint line is
  your profile, and the real node is your match (shares the most interests, or a compatibility %). Swipe-style
  picking (left / right instead of a tap?). Boss: a **catfish**, a decoy that copies the real profile with one thing
  off. Boss mod ideas: SUPERLIKE (one pick a layer can't hurt you), GHOSTED (hit ICE disappears from the board).
  Ad line in [ADS.md](ADS.md).
- **Multiplayer mode idea: roulette** (noted v08). A roulette-style mode for multiplayer (the user's idea was more a multiplayer mode than a corp). *(Claude)*: players place bets on nodes before the reveal; or a spinning cursor lands on a node and whoever's turn it is must take it or pay to respin.
- **Corp ideas batch** (noted v08, 2026-10-20). Suggestions marked *(Claude)* are mine, not the user's.
  - **BASIC** (working name; could literally be called BASIC). An easy, plain corp to sneak in
    anywhere: early sectors, filler slots, a breather between hard corps. Simple, readable tell (or a
    very strong one), low pay. Fits "filler vs signature corps" above. *(Claude)*: plain grey palette,
    a simple chiptune loop, boss = just one extra node.
  - **Medical corp** (names *(Claude)*: MEDIX, VITALIS, ST. CYBER). Its mods are about healing / integrity.
    - User's mod idea: **every corp you beat heals 1 integrity; if you're already full, it adds +1
      max integrity instead.**
    - *(Claude)* more: a mod that heals on perfects twice; a "triage" item; a corp twist where ICE
      only hurts on the 2nd hit (hits "bruise" first).
    - *(Claude)* tell idea: the real node has a heartbeat (its glyph pulses on a steady rhythm,
      decoys flicker irregularly).
  - **AI corp** (names *(Claude)*: SYNAPSE, NEURALINE, HAL-CORP). User isn't sure what it does yet.
    *(Claude)* ideas:
    - It **learns you**: it tracks where you tend to pick (corners, middle, the same column) and hides
      the real node away from your habits. The tell is reading yourself.
    - Or it **predicts**: after each miss it moves the real node away from where you looked last.
    - Or nodes "talk": each shows a short line (`NOT ME`, `TRY 4`), and the AI lies by a rule
      (always / never / every other) that you work out.
  - **GENCORP** (genetics). Mod idea: **MUTATE**: counts as a random other mod and **mutates** into a
    different one every layer, or every time you hit ICE. Shown in the tray as the mod it is right now
    (with a mutate glyph). *(Claude)*: the corp's twist could mutate glyphs between layers (the real
    node's glyph changes one line at a time, like the bad-security passwords).
  - **Military corp that hunts you** (names *(Claude)*: AEGIS, IRONCLAD, BLACKWATCH). Feel: nodes
    closing in. Following the cursor doesn't work on mobile. *(Claude)* ideas without a cursor:
    - The nodes **advance** toward one edge (or the HUD) a step every few seconds or every miss; if
      one "reaches" you, you take a hit. Like CHRONOS but spatial.
    - Nodes **flock** toward where you last tapped, so the grid reshapes after every miss.
    - A **search beam** sweeps the grid row by row; picking a node under the beam costs extra.
  - **Armadillo corp** (armored nodes; names *(Claude)*: SHELLCO, CARAPACE, ARMATEK). Nodes have
    **armor** you break first. Each break hurts you like ICE, but **when you take damage you get a hint
    about which node is the real one**. Trades integrity for information.
    - *(Claude)*: armor shown as a thicker frame (`#=====#`); hints could be the TRACER-style arrows or
      KEYLOGGER-style glyph lines; the real node could have thinner armor (cracks in 1 hit vs 2).
  - **Church / cult corp** (noted v09, 2026-10-20; names *(Claude)*: THE CHOIR, ASCENSION, SAINT.EXE,
    CHURCH OF THE NODE). *(Claude)* ideas:
    - **Faith**: tithe credits before a layer to get a "revelation" (a hint), or play on faith (no tell,
      bigger pay).
    - **Followers**: decoy ICE nodes "worship" the real one: their glyphs face or point toward it.
    - **Sacrifice**: give up integrity (or a mod) for a sure pick.
    - Look: candle / halo glyphs, a slow chant loop, the boss is the prophet.
  - **Random / chaos corp** (noted v09, 2026-10-20; names *(Claude)*: ENTROPY, FLUX, SCRAMBLE.NET).
    The nodes **change position**, either when an ICE breaks or on a timer (user's idea, not decided
    which). *(Claude)*: the real node keeps its tell through the shuffle, so you track it as it moves;
    the timer version could pair with a visible countdown; boss = shuffles on both. Overlaps with the
    shell game corp above (that one moves only the real node); could merge or keep them separate.

- **Corp ideas dump, v09** (noted 2026-10-20). The user says corps may be the **next area of focus**.
  Rough on purpose: some are one word. The user's idea comes first; *(Claude)* marks my additions.
  - **Sudoku / crossword corp.** *(Claude)*: nodes show digits, and the real node is the one that
    completes a row / column with no repeats (sudoku); or a tiny crossword clue in the intel line
    whose answer is on one node.
  - **Board game corp (a Parker Bros parody; names *(Claude)*: PAWN BROS, BOARDWALK INC, MONOPOLE).**
    *(Claude)*: a die roll each layer says how many spaces from a start node the real one is; boss is
    a little board loop you move around.
  - **Social media corp ("SQUALOR").** *(Claude)*: nodes show like / follower counts; the real node is
    the one with the "real" numbers (the bots all have the same count, or round numbers); ICE hits
    could "go viral" and spread like VIRUS but against you.
  - **Connect 4 corp.** *(Claude)*: nodes drop in from the top like chips; the real node is the one
    that would make 4 in a row; or picks fall to the bottom of their column.
  - **Word corp: the real nodes spell a word.** Each correct node carries a letter; across the 5
    layers the letters spell any 5-letter word. *(Claude)*: nodes show letters, so by layer 3-4 you
    can guess the word and read the next letter (`C R A _ _`); a word list sets it per corp; the boss
    is the last letter with decoys that also make real words.
  - **Chroma corp.** The colors of the nodes are the tell / pattern. *(Claude)*: the real node is the
    odd hue out, or follows a color sequence across layers (R, G, B...); needs a check for
    color-blind players (pair colors with a shape or a glyph).
  - **Yarn corp** (knit and purl). *(Claude)*: knit / purl as two glyphs (`v` and `-`) in a stitch
    pattern; the real node is the dropped stitch, the one that breaks the pattern. Names: PURLWISE,
    KNITWORK, SKEIN.
  - **Pink anime corp** (Japanese and fun, Sanrio-ish). Maybe really easy, and they actually **want**
    you to find the node. *(Claude)*: a breather corp with cute glyphs, the real node waves or blinks
    at you; hits do no damage but cost credits ("sorry!"); could fill the BASIC slot. Names:
    KAWAII.SYS, MOCHI MOCHI, PIKOPIKO.
  - **Seed corp.** Uses the current run seed as clues; maybe it also **changes the seed** mid-run.
    *(Claude)*: the seed's characters map to node positions (e.g. the 3rd letter of the seed is the
    column); changing the seed mid-run is doable (the map ahead is rebuilt from a new seed), but it
    needs care with saves / resumes and multiplayer sync.
  - **Destroy-the-ICE corp.** Reverse rules: you're meant to break the ICE, not find the node.
    *(Claude)*: clear all ICE without tapping the real node; tapping the real node is what hurts.
    Like minesweeper.
  - **Radiation corp.** Maybe gives a **nuke** that wipes a whole corp node off the map. *(Claude)*:
    a NUKE item (EXOTIC): skip a whole corp, no reward; the corp's twist could be radiation that
    builds up per layer and costs integrity at the end of the corp unless you're fast.
  - **Pet corp.** A corp with pets. *(Claude)*: a pet follows you as a mod-like companion (sniffs out
    1 ICE per corp); or the corp's nodes are pets and the real one is the one that comes when you
    call it. Overlaps with the "companion" idea, if there's one later.
  - **Linked nodes / double-size nodes corp.** *(Claude)*: linked pairs open together (pick one, both
    flip: helps or hurts); 2x nodes take two cells and are always ICE, or always hide the real one.
  - **Mod thief corp.** Hitting ICE steals one of your mods. Could be:
    - a boss ability, or a modifier for a whole stage of the map (all corps in it);
    - or a **corp modifier** that can be randomly mixed into any corp. We don't have that yet, but
      maybe we should. *(Claude)*: a new layer for corps, "**corp affixes**" (THIEF, ARMORED, FAST,
      CURSED...), rolled per corp node and shown on the map; gives variety without new corps.
      Stolen mods could be won back by beating the boss.
  - **Art / clothing corp.** *(Claude)*: fashion "seasons": the real node wears this season's
    pattern, decoys wear last season's; or art: the real node is the original, the rest are forgeries
    (a pixel off, see the next idea).
  - **Toy corp.** *(Claude)*: nodes are little toys (jack in the box, top, robot); the real one is
    wound up and moves. Could share a bright, playful look with the anime corp.
  - **Misalignment / OCD corp.** The tell is that some characters are **slightly misaligned**, by a
    pixel or two. *(Claude)*: easy to do in the canvas renderer (offset one character of the real
    node's glyph by 1-2px); gets subtler each layer; the boss misaligns the decoys too. Names:
    KERNING, OFFSET, PERFECTIONIST.
  - **Sport corp.** *(Claude)*: a ball moves around the grid and the real node is where it lands; or
    a scoreboard counts down layers like quarters; boss = overtime.

- **REP idea: mod storage / stash** (noted v09, 2026-10-20). Keep mods you have for a later run.
  - A **LEGACY unlock** on THE BOARD (bought with REP) before you can use it.
  - **Rent**: storing costs something per run (REP or credits), so it isn't free power.
  - You can only **store** at the sector boss (after OMNI) or at a **ripper doc** (a new map stop).
  - Getting them back: either **start a run with them**, or a **new map location** shows up where
    you can pick them up.
  - *(Claude)*: cap it at 1-2 stored mods; stored mods could lose a tier (or go back to COMMON) so
    they help without skipping the build; name ideas: LOCKER, COLD STORAGE, DEAD DROP. A ripper doc
    could also be where you remove or reorder mods. Note: the minor mod is already called STASH,
    so this needs another name.
- **Corps: see [CORPS.md](CORPS.md)** (updated 2026-10-20). It holds the user's corps (Part A, the
  ones above written up with a special / tell / mod) and Claude's revised 50 (Part B). New ideas
  from the review, to keep in mind:
  - **Mods cross over:** a mod built for one corp (SIGSCAN, the clock mods, CORNERS, FORGERY)
    should also matter in some other corps. Every corp in CORPS.md has a "works with" line, and
    HAUTE//COUTURE is a corp built around the Sigil mods.
  - **Corp modifiers:** tags rolled onto any corp node, shown on the map, more common deeper:
    RIVAL (a rival hacker with health who burns ICE or steals your pay), THIEF (the mod thief),
    ARMORED, CURSED, RUSH, LOADED, BRANDED (adds Sigil signatures so SIGSCAN works there).
  - **One-use effects are items, not mods** (user's rule), unless the mod survives use. E.g. BITFLIP
    became an EXOTIC item.
  - Mods pool: EVENT HORIZON (BOARD: a hit locks the nearest closed ICE).
  - **Corp levels** (user, 2026-10-20). Every corp gets a level (1-5) on top of the node tier we
    already have. Deeper on the map, higher-level corps get picked more often (weighted around a
    target level of sector + 1 or 2). First-pass levels and the weights are in CORPS.md, under
    "Corp levels". Part of the corp kit build.
  - **Build plan:** CORPS.md "Build plan" groups every corp by how hard it is to build (step 0 corp
    kit, then tiers 1-3).
- **Mod idea: puzzle on ICE** (noted v09, 2026-10-20; probably EXOTIC). Tap an ICE node and instead
  of hurting you it opens a small **mini-game puzzle**. Solve it and you take no damage; fail and
  you take the hit (maybe more). Stage: BLOCK. *(Claude)*:
  - Puzzle seeds: a quick lock-pick (stop a moving bar in a zone), a 3-symbol sequence to repeat
    (Simon), match the glyph (pick the node's glyph from 3), a 4-tile slide, a hex code to type back.
  - Keep each one 5-10 seconds and on the clock (the layer clock pauses while it's up).
  - Tiers: easier puzzles, or a fail only does half damage.
  - Could be its own corp too (every ICE hit is a puzzle).
- **More EXOTIC mods and items** (noted v08). EXOTIC is nearly empty: WORMHOLE is the only exotic, and it's moving to items (see §16i). Exotics should feel strange and rule-bending, not just bigger numbers. Seeds:
  - **QUANTUM** (mod): two nodes are real each layer (either one passes), but layers pay half.
  - **GHOST** (mod): one random ICE node per layer shows as see-through (faint frame) from the start.
  - **PARADOX** (item): undo your last ICE hit (integrity back, node closes again).
  - **ENTANGLE** (item): link two nodes; if either is real, both open.
  - Exotic tiers of existing items (e.g. an EXOTIC SPLIT that leaves only the real node and one ICE).
  - **The user's exotic batch** (2026-10-21; probably all mods). Names marked *(Claude)* are my working names.
    - **All or nothing** *(Claude: DOUBLE OR NOTHING, ROULETTE)*: a chance to clear the whole layer at once,
      but also a chance it adds ICE to the layer instead.
    - **Coin flip** *(Claude: COINFLIP, 50/50)*: every tap becomes a 50/50. Tap a node and a small window opens
      with 2 options; pick one. Maybe double damage on a wrong answer. Open question: does the window pause
      the clock and animations? Maybe not, so the clock keeps pressure on.
    - **More real nodes**: more valid nodes each layer (maybe limited, e.g. one corp only). Close to QUANTUM
      above.
    - **ICE that comes with you** (time travel or procrastination theme; *(Claude: LATER, BACKLOG, DEJA VU)*):
      a 50% chance that ICE you trigger carries over and adds to the next layer's ICE count. It doesn't
      need to land in the same spot, but it would be cool if it did, and if carried ICE looked a little
      different.
    - **OMNI reveal** *(Claude: MIMIC, TELLTALE)*: tells you which corp OMNI is copying. (CORPS.md's SPOILER
      prints a corp's tell on entry, which covers OMNI too; this would be the narrower version.)
    - **Remove a corp from the run** (more an item): take a corp out of the playthrough entirely. Different
      from HALFLIFE's NUKE (CORPS.md A21: wipe a corp node off the map, get past it with no reward).
      - **Hidden quest line:** a nuked or removed corp's node stays on the map, and going there has
        something special: maybe the start of a strange hidden quest line.
      - **Another hidden-quest entrance: a secret ad** (the user, 2026-10-22). Most fake ads do nothing when
        tapped, but one particular ad does something special, or a certain ad + a certain mod you own does
        (e.g. an extra EXOTIC mod). Details in [ADS.md](ADS.md) "Secret ads". Could be how the nuke quest starts.
- **Tutorial mode** (noted v08). A guided first run (or a separate `[ TUTORIAL ]` on the title) that teaches by playing instead of reading How to Play. Ideas:
  - A short scripted run on a fixed seed: the PUBLIC NET (one node, it's real), a tiny corp with an obvious tell, a $ node, a stop (cache / market), using an item, a boss.
  - Short prompts typed into the message line or a small box ("one of these is real. tap one."), pointing at things (the tray, a mod, the clock).
  - Explain a tell by showing it: highlight the corners after a PERIMETER layer, show the mirror line for MIRRORLINE.
  - Can't lose (or ICE does no damage) until the end; skippable; offered once on first launch.
  - Pairs with the "filler corps" idea (easy corps that teach) and could unlock the codex corps entries it covers.
- **More palettes.** Keep the current 5; add more, with more variety.
- **Corp palettes.** Each corp gets its own palette, so you know where you are at a glance.
- **Two palette lists: dev vs settings, corp palettes as unlocks.** (noted v07)
  - **Dev menu palette select stays** (moved to the 16f pending list, 2026-10-21), but it cycles **every** palette: the player ones plus all the corp palettes (PERIMETER, SIGIL, CHRONOS, MIRRORLINE, OMNI, and future corps), for previewing / tuning. *Today both the dev menu and SETTINGS cycle the same list (player palettes only; corp palettes are hidden from both).*
  - **SETTINGS palette list is the player list only:** it does *not* include the corp palettes by default.
  - **Corp palettes unlock into SETTINGS** through corp achievements, e.g. breach a corp (or beat its boss N times / perfect it) to unlock its palette as a player palette. Could also be a REP purchase (see REP meta progression).
  - **Every corp gets its own unique palette**, including future corps (CIPHER, HYDRA, BLACKOUT, ...), and maybe more than one per corp (an alt palette unlocked by a harder achievement).
- **Palette change animation.** When the palette switches (entering a corp with its own palette), animate it. Options:
  - Ripple: a wave spreads out from the tapped node; characters switch to the new colors as it passes, with a little scramble right at the wave's edge
  - Scanline wipe: a line sweeps top to bottom, recoloring as it goes (old-CRT feel)
  - Glitch: characters flip to the new colors at random times over ~0.5s
  - When: maybe a subtle preview on **select** (the info panel or node takes the corp's colors), then the full transition on **enter**. Pairs well with the existing suck-into-the-node effect.
- **Palette as a corp effect.** Example corp, working name **BLACKOUT** (**built v11**, see §16n): the palette gets darker every layer, fading toward black, making the board harder to read. Wrong tiles you hit stay **bright red**, so your mistakes become the only clear landmarks. Ideas around it:
  - Boss twist: starts nearly black, or only the tile under your finger/cursor lights up
  - Counter items/mods: FLARE (resets brightness for one layer), something that makes hit tiles light up their neighbors
  - Tech note: easy to build, since all colors come from one table. Blend every color toward black each layer, except red.
- **Juice / graphics pass** (later): the ASCII look and badge animations work, but the game needs more graphical bits. Options to try:
  - Unicode symbols that still take palette colors: block shading `░▒▓█`, geometric shapes `◆ ◇ ▲ ● ◉`, braille dots for smooth spinners and tiny pictures `⠋⠙⠹⠸⠼⠴⠦⠧`
  - ASCII emoticons / kaomoji for flavor, e.g. `(⌐■_■)` `[o_o]` `x_x`
  - Real emoji: most colorful, but they ignore the palette (can't be recolored) and look different on each device, so they'd clash with the console look. Use sparingly if at all.
  - Bigger mini-art (3–5 lines) for mods in reward/market details boxes, while the tray keeps the small badges
- **A spooky corp** (noted 2026-10-20; **built v10 as BONEYARD**, see §16m). Working names: BONEYARD, OSSUARY, SPOOKY INC. Pulls from the "the bones are their money" sketch, and works in the quote **"the guy asked for something spooky"** (as the intel line, the intro, or a line on the CORP BREACHED screen).
  - **Tell idea:** every node casts a faint shadow (a dim copy one cell off) except the real one: "the dead cast no shadow." Or the reverse, where only the real node has a ghostly afterimage.
  - **Bones are their money:** credits show as bones while you're inside (`12 bones`). $ nodes become bone piles. Hitting ICE could rattle (a skeleton clack sound).
  - **Boss twist:** the ghost moves. One ICE node drifts to a new spot when you aren't looking, either after each tap or on a timer.
  - **Boss mod seed:** something like GRAVE ROBBER, where each ICE hit drops a bone you can cash in at the end.
  - **Look and feel:** a sickly green and purple palette, a minor or harmonic theme with an organ-like pad, and a skull for the intro art.
- **Music engine pass** (noted 2026-10-20). All 64 tracks run on one engine and differ only by settings (tempo, key, scale, chords, pattern picks, echo). The engine has just 4 drum patterns, 5 bass patterns and one lead melody, so similar tracks blur together. Upgrade the engine rather than the tracks:
  - A melody of its own for each corp (a short motif in the song data, in place of the shared `LEAD_DEGREES`).
  - More drum and bass patterns (swing, breakbeat, half-time trap hats, a waltz in 3).
  - A couple of new instrument sounds (organ, pluck, chiptune square, bell).
  - **The user, 2026-10-21:** wants more unique music for some corps; today it all sits on the same beat.
    So start with the beat: different grooves and time feels per corp, not just tempo. Pick a handful of
    corps (the signature ones, the final bosses, BONEYARD) to get fully custom tracks first.

- **Pushing past the 4x4 grid** (the user, 2026-10-21; "at some point"). What does it mean to go bigger,
  even double the grid (e.g. 8x8)? How it scales on screen (tile size, phones, scrolling), in odds and
  pacing, and in tells and mods (row/column scans, PERIMETER, mirror tells). Ties to "Node count keeps
  climbing" above and the tap-size limit in §12.
- **Fake ads** (the user, 2026-10-21). Parody ads in the game. **The idea list is [ADS.md](ADS.md)** (since 2026-10-22). Ideas so far:
  - **Interstitial ads** between parts of a run: after a boss, or on the way into a safehouse or black market.
  - **Ads for the game's own corps.**
  - Maybe a **corp built around ads** (pop-ups, banners over the board).

- **Publishing: link previews and page metadata** (the user, 2026-10-21). For when the game goes public, so
  link previews (Discord, iMessage, Slack, X...) and crawlers pick it up:
  - Meta tags: description, Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) and
    `twitter:card` (`summary_large_image`).
  - A **poster image** for previews (~1200x630 PNG, the ASCII title look), plus a favicon / home-screen icon
    (`apple-touch-icon`) and a `theme-color`.
  - The page has `<meta name="robots" content="noindex, nofollow">` today: drop it for the public build.
  - Previews need absolute URLs, so this goes with picking where it's hosted (§10 Tech / hosting).

- **Browser back button works as BACK** (the user, 2026-10-21; "might be opening a can of worms"). On a
  menu page (settings, codex, how to play, profile, multiplayer...), the browser / phone back button (and
  Android's back gesture) should do what `[ BACK ]` does, instead of leaving the page. Today the game never
  touches browser history, so back leaves the game. The worms:
  - Push a history entry when a menu opens and catch `popstate` to go back; keep it in step with the game's
    own BACK and ESC, or the history fills with stale entries.
  - During a run, back should never quietly drop you out: pause, or ask "abandon run?" (the run save helps).
  - Multiplayer: back in a lobby or game should ask before leaving the room.
  - The title is the bottom: back from there leaves the page as normal. Keep the URL clean (`?seed`,
    `?dev`, a future `?room`) while doing this.
  - iOS Safari's swipe-back is the same event, so it gets covered too.

## 18. Decision log

| Date | Decision |
|---|---|
| 2026-10-19 | Layer 1 has a single, always-safe tile; layer N has N tiles |
| 2026-10-19 | Cyberpunk network-hacking theme, kept light for now |
| 2026-10-19 | Minimal presentation; core gameplay first |
| 2026-10-19 | Each prototype lives in its own versioned folder |
| 2026-10-19 | Grid-based board (4x4 to start), tiles placed randomly in cells |
| 2026-10-19 | All randomness is seeded; seed visible and replayable |
| 2026-10-19 | Keep-between-runs progression, like 1TD |
| 2026-10-19 | Multiplayer out of scope for early versions |
| 2026-10-19 | ASCII art look: dashed boxes, calm and sparse; characters act as particles |
| 2026-10-19 | Tile glyphs can be part of a corp's tell |
| 2026-10-19 | Grid size is flexible: grows/shrinks with tile count and corp layouts |
| 2026-10-19 | Mobile first (portrait, touch); built in plain web tech for now |
| 2026-10-19 | Player data in localStorage, with a key prefix per version |
| 2026-10-19 | v01 playtest: ASCII look works. Added odds readout. Safe-pick effect changed from swirling vortex to straight suck-in |
| 2026-10-19 | v02: start Integrity 4, +1 on a perfect pick (healing rewards reading tells) |
| 2026-10-19 | v02: merchants, caches, safehouses live on the overworld map |
| 2026-10-19 | Wrong pick stays on screen bold red; success = board falls apart; death = glitchy random blink-out |
| 2026-10-19 | Dev menu for testing; cheats mark runs as practice |
| 2026-10-19 | v03: item belt always visible; start with 1 PURGE; tray reserved at the bottom of the screen |
| 2026-10-19 | v03: mods shown as animated text badges; tap for info, tap again to use |
| 2026-10-19 | v03: every overworld location gives a mod; each corp has 2 corp-specific boss mods |
| 2026-10-19 | v03: skip the first map pick; start straight in PUBLIC NET, then a starter perk |
| 2026-10-19 | v03: market is a select-then-buy list with a details box |
| 2026-10-19 | Names: **tray** = whole bottom area; **mods** = run-long upgrades (mods row); **items** = single-use (item belt) |
| 2026-10-19 | v04 built from the full pending list (see §16c) |
| 2026-10-19 | v04 second pass: locked-node labels, pause menu + abandon, keyboard controls, scrolling codex (see §16d) |
| 2026-10-19 | v05 built from the pending list (see §16e): corp intros/palettes, music, title round 2 |
