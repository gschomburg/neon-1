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

**Setting: the game takes place in 2018. That's canon** (the user, 2026-10-25). Ads and lore should fit it (e.g. the NeoN+2 ad says "coming in 2020").

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
    ascii-editor/        <- the standalone ASCII art tool (not the game; may get its own repo):
                            README.md, PLAN.md, dist/ (the app), reference/ (art picks; the ascii-art.de catalog is local only)
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

## 16f. Pending revisions: moved

Open work is in [BACKLOG.md](BACKLOG.md) now (2026-10-26). This section, as it was, is in
[archive/SPEC_backlog_2026-10.md](archive/SPEC_backlog_2026-10.md).

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

## 16i. Up next: mods & corps: moved

Open work is in [BACKLOG.md](BACKLOG.md) now (2026-10-26). This section, as it was, is in
[archive/SPEC_backlog_2026-10.md](archive/SPEC_backlog_2026-10.md).

## 16k. Next update: endless map: moved

Open work is in [BACKLOG.md](BACKLOG.md) now (2026-10-26). This section, as it was, is in
[archive/SPEC_backlog_2026-10.md](archive/SPEC_backlog_2026-10.md).

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
- **v13.13** (2026-10-24): **music: written parts and 10 new tracks** (the user: more variety, one track per inspiration). The engine (phase 3) lets a track carry its own melody, bass riff, arp line, drum beat, chord stabs, gated pad and breakdowns, plus keys / vox / saw voices (tracks without them play as before). 10 new tracks in data/music.js (LIGHT CYCLE, MACHINE HEART, NIGHT DRIVE, RED DEEP, ANTHEM, DROP ZONE, DEADPAN, SLOW TIDE, DANCE ALONE, TRACKER; docs/MUSIC.md), not assigned anywhere yet. The user's mixes for CAST ON (6/8) and VITALS (break groove, industrial kit, sub bass, bell arp) are in. The music tool remembers tweaks and has copy all changes.
- **v13.14** (2026-10-24): **music: HOLLOW, families, the corps view.** A new track, HOLLOW (Evanescence: light and haunting, then a build; not assigned yet). The music tool shows how each track is made (written / recipe), its family and closest track, and has a corps view: every place a track plays, which need a new track (cut or 1 star), and a picker to change it, with copy assignments. Tracks can carry from: 'key' to say which track they came from. **The cut:** the user cut 64 tracks (docs/MUSIC.md); corps without a track of their own play the map track (trackFor), OMNI//CORE plays DROP ZONE. greglytics: api/version.php and greglytics/check-version.js check what's deployed.
- **v13.15** (2026-10-24): **music: every corp has a track again.** The new tracks went to their best corps (HOLLOW: DEWEY, DANCE ALONE: MOCHI MOCHI, SLOW TIDE: NIMBUS, TRACKER: SEEKR, DEADPAN: HAUTE, ANTHEM: PLAYBALL, RED DEEP: BONEYARD, NIGHT DRIVE: RYDR, MACHINE HEART: AEGIS, LIGHT CYCLE: KERNEL), and 55 variations (from: one of them, or CAST ON) filled the rest, spread across the levels (docs/MUSIC.md has the list). PIKO PIKO moved to BYTEPETS.
- **v13.12** (2026-10-24): **swapping is 2 steps** (the user: on a phone it was too easy to replace the wrong mod). MOD SLOTS FULL / ITEM BELT FULL: tapping one of yours only picks it (the `>` cursor), and its badge + what it does show under the list; a big **S W A P** box (`- sniffer is gone -`; greyed out until you pick) does it. KEEP WHAT I HAVE as before. Also in this build: the music engine's phases 1 and 2 (docs/MUSIC.md: voices, kits, grooves, 3/4 and 6/8, swing, pump; no game track uses them yet, so the game sounds the same), and the music tool's demos, try-another-band panel and star ratings (tools/music.html).
- **v13.16** (2026-10-25): **the header says NeoN+1** (was BETA_RUNNER), and during a run the name is the menu button (no `[MENU]`). **Play stats** (engine/stats.js, sent through greglytics like the leaderboard): `run_start`, `node` (each map stop: corp, time, cleared / skipped / died, ICE hit, integrity in > out), `mod_pick` (offered + taken), `buy`, `exotic` (one offered), `run_end`, `run_quit`; every event carries a run id kept in the run save. **Tester mode:** open the game once with `?dev=1` and that device's stats and scores go to the dev data (remembered; `?dev=0` or the dev menu's `[ stats: ... ]` turns it off). greglytics 1.2: the dashboard's **clear dev data** button, number fields show average / median / min / max, list fields count each thing in them, and a `where` filter (e.g. `corp=seekr`). **Three new tracks**: LOOK BEHIND YOU (Monkey Island) on PLAYTIME and LUCKEEZ, VELVET ROPE (Pixel Grip) on CHANNEL 9 and TWINLINK, DOWNWARD (Nine Inch Nails, the Closer side) on CLONEWORKS and BLACKOUT.
- **v13.17** (2026-10-25): **music engine: sections and fills** (docs/MUSIC.md). Every track with drums now plays a fill (snare roll, tom run or kick-snare pickup) at the end of every second pass and before a new section, landing on a crash (`fills: false` turns it off, `fill` writes your own). A track can carry a `B` section (its own chords, melody, beat, voices...) played in a `form` (default AABA): written for HOLLOW, DANCE ALONE, LIGHT CYCLE and NIGHT DRIVE (AAB). No other track changed. **The editor** (`tools/neon_editor.html`): the music tool and the palette editor in one page, the game on the left, MUSIC / PALETTE modes up top; the music list starts on the corps, and picking one shows it in the game and has the game play its track (engine/editor.js: `music-data`, `music-ctl`, `music-test`; boot.js lets the editor pick the track and level). The old two tools stay for now.
- **v13.18** (2026-10-25): a batch of small ones. **BLACKOUT's grue:** on the nearly black boss layer the power line sometimes reads `it is pitch black. a grue is near.`, and its codex entry ends with a Zork nod. **Mod tags on the pick screens:** every offer on the starter perk, cache, safehouse and boss reward screens says `mod` (or `mod+` for an upgrade) after its rarity, like the market; a cache's item loot says `got item: NAME`. **Game over:** the mods and items scroll together with the map (it starts as high as it can with where the run ended in view; arrows show more above / below). **Title:** a `board: #5 all time · #2 today` line under your stats (fetched quietly, once a minute at most). **Updates:** `tools/bump.js` writes `dist/version.json`; the hosted game checks it (a few seconds after loading, coming back to the tab, every 10 minutes) and the title shows `[ v13.19 is out: UPDATE ]`, which reloads past the cache.
- **v13.19** (2026-10-25): **the rarity ladder** (the user): SCRAP (white) > COMMON (green) > RARE (blue) > EPIC (purple) > LEGENDARY (orange, `LEGEND` on screen to fit the 6-letter slot) > EXOTIC (gold). BOSS is gone: the 82 corp mods are legendary and never upgrade; legendary is as high as any upgrade goes; exotics sit above it. No more LV2 / LV3 labels: those mods climb rarities. Rebalance (Claude's calls): PATCH, PURGE and COOLANT start at scrap (scrap > common > rare); BURNER is common; TRACER rare > epic; KEYLOGGER rare > epic > legendary (the whole glyph); SNIFFER and VIRUS get a legendary step (2 ICE locked each layer when there are 3+ ICE; the infection spreads twice, never into the last ICE). A legendary step only rolls in the top 5% of finds (or take the mod twice). Chip colors: palettes.js `chips` (and the editor's rarity chips tab).
- **v13.20** (2026-10-25): **leaderboard initials take digits and symbols** (the user): 0-9 (0 slashed, so it isn't O) and `* # $ ! ? +` after Z on the up / down cycle, and you can type them. `#` is a solid 3x3 block of #, `*` a burst. greglytics name.php keeps those symbols (needs uploading; until then the server drops them from the name). Also: the editor's ITEMS & MODS tab (tools/neon_editor.html).
- **v13.21** (2026-10-25): **mod rarity notes** (meat notes): FAILSAFE recharges (epic each stage, legendary each corp), VIRUS legendary spreads up to 4, SKIMMER 25/50/75%, BUFFER +1..+4 (common to legendary), BURNER 1x/2x/3x per corp, X-AXIS / Y-AXIS epic. BURNER's per-corp use is a count in the save now (old saves read true as 1).
- **v13.22** (2026-10-25): **integrity animations** (meat notes): the HUD bar is drawn a char at a time. A gain pops each new # up past the grid and back (bright, staggered when it's several); a loss breaks each lost # into red bits that hop and fall (explode()); at 1 left the # beats like a heart (two quick bright blinks every 1.4s). Cells can carry a scale (`sc`, engine/render.js). Reduced motion: no pops or bits. FAILSAFE's save reads as a loss then a gain. Filed the rest of the misc notes (2018 setting in §1; rest-stop cap and dev-menu mod picker in the pending list).
- **v13.29** (2026-10-26): **the tutorial** (the user's idea; `engine/tutorial.js`). A guided practice run in its own palette (SAFEHARBOR, navy + teal, `TUT.palette`): the public net (tap the one node), the reward (TRACER only), the map (BASIC CORP put on the first step, `TUT.corpNode`; only it can be picked), then BASIC CORP in 3 layers (2 / 3 / 4 nodes, `TUT.counts`): the HUD (integrity, credits), an ICE hit on purpose, TRACER's arrows, a PATCH (the run starts with one), the real node; then the tell ([ ], always followed here) and "perfect"; then the boss; the breach reward; and out to the title. 22 popups: a box with the text and a "do this" line in the accent color, a pulsing glow and > < on what it points at; "ok" popups go away on a tap / Enter / Space (after 350ms), "your move" popups wait for the one thing they ask for: every other pick, item, map node, mod or button is refused (a deny sound, the box shakes). Gates: `tutAllows` in pick / useItem / selectNode / activateMod and every button (scene.js addHit); hits now keep their cell rect (`cr`). The training run can't be lost (integrity never below 1), has no loot nodes, no ads, no stats, no run save, no history if you quit, and puts your seed back. Where: **[ TUTORIAL ]** under JACK IN on the title until you've done it once (`save.tutorialDone`; it takes a blank row, so nothing moves), and always in HOW TO PLAY next to BACK.
- **v13.30** (2026-10-26): **DOC, the tutorial's handler** (the user's design, picked from mockups). The training popups are no longer boxes on the grid: a yellow tag (`TUT.col`) with dark text, centered on the screen and drawn in pixels over the whole frame (`drawTutorial`, called last in render.js), with DOC's ASCII face (`TUT.face`, name `TUT.name`) on a dark chip half off its top-left corner (a 1px yellow line, a 2px dark gap outside it). The "do this" line is yellow on black; YOUR MOVE / TAP TO GO ON in bold dark text. A plain 2px yellow arrow, about 45 degrees, runs from the tag's edge to the target's nearest corner (the middle of the edge for a wide target like an option row) with an open head (two strokes at a square corner); nodes and the HUD pulse (scale up and down) instead of the old glow and > <. Animation (`TUT.anim`): DOC pops in, the tag fills in a row at a time while DOC bobs and blips (`Sound.talk`), the arrow draws out, the target pulses; a tap folds the tag back up and DOC pops out, and the next popup comes in after it. A tap during the entrance skips to the whole popup (on a "your move" popup: a tap on the tag). Placement: above or below the target (the side with room; `at` still steers), untargeted ones centered; the reward step's tag now goes above the option so the TRACER details stay in view, and PATCH's sits just above the belt.
- **v13.31** (2026-10-26): **TRAINING, round 2** (the user's notes from playing v13.30). **POPS** is the handler (`TUT.name`; an old runner, the user's pick from a list of names; the rest went to CORPS.md's name pool). The button is **[ TRAINING ]**. **Everything he says is in `data/tutorial.js`** (`TUT_COPY`: id, part, text, act, timer; `{name}` is your hacker profile name), written by **`tools/tutorial_file.js`**. **The neon editor's TRAINING tab**: every line by part, edits go to the game live (the popup that's up changes as you type), **show** plays the training in the game to that line (`tutJump`: further on, it plays forward; earlier, it starts over; the lines before are skipped and what they ask for is done for you, `tutAuto`), **< back / next >**, **save** writes the file (the dist/data folder, picked once), notes on lines that read badly (a long do-this line, an odd timer). **The script** (34 lines, was 22): POPS introduces himself by your name; ICE explained the first time (corp security); the NET in three (the NET, a corp, a stop: it points at the nearest market / cache / safehouse, any map spot via `T.spots`); BASIC CORP in two (the corp, then integrity); **banter** that moves on by itself (`timer`, a draining line along the tag's bottom, a tap skips): after the ICE hit, when a layer is done, after the breach; a send-off with a good luck. **Calls to action:** a tap-anywhere popup says TAP >; a do-this popup has only its short inverted line (all about 3 words now: tap it, tap TAKE, jack in, tap the ICE, heal up, find the [ ], breach it, pick one, or skip); no YOUR MOVE. **POPS minimized** (`mini`): just his face chip and the do-this line, on the message line between the HUD and the board, on a clean patch of background: for find the [ ], breach it (the boss) and the boss reward pick. **Placement:** the jack-in popup up top pointing down (the corp's info and JACK IN stay in view); a tag pinned to the top or bottom still leaves its arrow room. **Style:** `TUT.style` **'stroke'** (the user's pick, S2 in the mockups: a yellow line along the tag's right and bottom instead of the dark drop shadow, and an arrow leaving the tag's bottom starts at that line) or 'shadow'.
- **v13.32** (2026-10-26): **TRAINING, round 3** (the user's notes from playing v13.31). 40 lines now. **ICE** is explained on BASIC CORP's first layer (where there is some), not on the public net. **The tray:** right after TAKE, POPS points at TRACER in the tray (target `{ mod: i }`). **Jack in:** the map's BREACH button works too (`enter`), not only a second tap. **The terminal line** (row 6): pointed out right after TRACER talks on it (target `{ msg: true }`). **Items:** where they come from (markets, data caches, loot nodes). **A real loot node** on the training's layer 2 (`lootSure` in genLayer), and POPS points at it: it's ICE, it bites, it pays; there's weirder stuff out there. **Wrong taps** while POPS is small (find the [ ], the boss): his line swaps to a quip for ~2s (`oops`); **the boss beaten:** it swaps to `bosswin` and stays up through the win (the small POPS is drawn during the wipe). Those two lines have `of` (the popup they swap into) and hold one quip per line, picked at random. **The banter timer** is four little spinners in the tag's top-right corner (`TUT.timerChars` '@Oo.'), each stepping down and gone, left to right; the bar is gone. **Hover:** in the training, what you can't tap doesn't light up (`tutHoverOk`). **The glitch** (the user saw a popup flash whole, or not go all the way away): a popup's clock now stops while it's hidden (a wipe, an ad, the dev panel), so it never shows up halfway in; a popup closed while still coming in folds up from where it got to, not from the whole tag. **The editor:** every tap-to-go-on line has a **timed** checkbox (and its ms); the swap-in lines show which popup they belong to (show jumps there; back / next skip them).
- **v13.33** (2026-10-26): **TRAINING, round 4** (the user's notes from playing v13.32). **The opening:** POPS's first two lines (`TUT.curtain`: hello, runner) are said over the wipe's lines, held, the way an ad holds them (wipeIn waits while `st.tut.curtain`; the wipe can have a region of its own, `top` / `bot`: here row 1 to the footer, so NeoN+1 and the menu button and the footer show), then the game resolves in. **Playing is always POPS small:** every popup that wants you to do something is now his face chip plus the do-this line by the message line (it blanks the rest of that line), with no arrow; if the line has text, that's said first as a popup you tap away (with its arrow), then he shrinks. The target keeps pulsing while he's small. Do-this lines: tap the node, tap TAKE, breach BC1, tap the ICE, heal up, tap the real node, find the [ ], breach it, pick one, or skip. **Arrows:** a line can have `arrow: false` (it still sits by its target); off for NODES, -1 INTEGRITY and TRACER went off. **The editor:** an **arrow** checkbox on every popup line.
- **v13.34** (2026-10-26): **POPS has his face** (the user's, made in asXii; `TUT.face`, 5 x 3 with box-drawing characters).
- **v13.35** (2026-10-26): **TRAINING, round 5** (the user's notes from playing). The small POPS can sit **by its target** (`near`): PATCH UP sits beside the PATCH on the belt (`right`), TAP TAKE under the buttons (`below`: the first rows under it that are clear). **Heal:** the do-this line is "patch up", and once you've tapped the PATCH once it says "tap again to use it" (`items2`, an `of` line; the ask's `then`). **Follow the arrows** points at the arrows on the ICE you hit. **TRACER's arrow** points at its 3-letter code on the reward (a target can be some text on a button's row, found once). **-1 INTEGRITY** says how much you have left (`{int}` in a line). **The send-off** goes out to the wipe's lines like the opening (`TUT.curtainEnd`: bye, out), and the title comes in from them.
- **v13.36** (2026-10-26): **the new intro** (the user's design: asXii project NeoN_1_screens_v04, layers "map intro GS" and "NeoN_fullscreen"). Four steps, each changing with the game's wipe: (1) **LOGIN**: a prompt and a [ LOGIN ] button; nothing moves or sounds until you tap it (browsers hold audio until a tap). (2) **The login screen**, with a 1-cell margin: your name and password type in (key clicks), the modem dials, a `[@@@...]` bar fills to 100%, `>` lines flicker through jargon (a blip each) and settle (a beep): searching open ports, your port, the **new world map** in a box (data/art/worldmap.js, now 34 x 12; its 0 o x [] blink, your spot `@` is picked inside the land), then the readout: the trace (hops), the jargon, and your own records (best score or no previous scores, today's net activity from the day leaderboard or a made-up number, runs, REP, status newb / runner / leet). (3) **The title card** (the NeoN art) with the music starting (quiet before it; ON CAMERA at level 2, `INTRO_MUSIC`, through the pick); ~5s (was 3s) or a tap. (4) **NEWB or LEET** (a first run; for now every launch, `INTRO_ALWAYS`): your logo and name (tap to shuffle: name, logo, color), NEWB ("if you have to ask, start here.") starts the training, whose opening comes out of this screen's wipe; LEET ("you know the drill. jack in.") goes to the title (`save.leet`). Without the pick (later: not a first run) the card goes to the title. A tap skips ahead (the readout finishes, then moves on); Enter / Space too, N / L on the pick. **The title has no TRAINING button now** (HOW TO PLAY keeps it). The art tab's map size is 34 x 12.
- **v13.37** (2026-10-26): **the economy sim** (`tools/econsim.js`, for the money balancing; docs/ECONOMY.md has the baseline). Whole runs in headless Chrome: seeds x skill levels (the chance it finds the real node first try), N sectors, god mode, no ads; it visits every market it can, buys repair then the priciest things it has room for, takes reward mods it has room for; it answers SKIPJACK / CONTINUE? and lets LAGRANGE's taps land now. Reports per sector: earned, layer pay, perfect %, credits at each market vs the market's whole stock vs spent, reward mods vs skip credits, credits at the end; `save` / `diff`. Read-only hooks for it: the market (`st.shop`) and reward screens (`st.choice`) publish their offers. Also in this build: the intro's music is ON CAMERA at level 2 (`INTRO_MUSIC`), the title card holds ~5s.
- **v13.38** (2026-10-26): **the economy file** (the user's credit scale). **`data/economy.js`** (`ECON`) holds every money number in the game, by name, as a count of units: two units, **earn** (what pays you) and **spend** (what costs you), 10cr each, and each can **grow a sector** (0 now). Layer pay (base 0.4 + 0.2 a node, boss x3, sector boss x1.5, the perfect multiplier), loot and caches, skip rewards, RIVAL, the money mods (EZPASS, POLICY, GRAVE ROBBER, HONEYCOMB, INTEREST, CHANCE CARD, COIN FLIP, RAM DOUBLER), BLOOD MONEY, LEVERAGE (BLOOD / DEBT / COIN read it through getters), OMERTA, FRIENDSHIP, COMPANION, CONTINUE?, repair, the rarity price steps, and the corps' own costs (TOLLGATE, SAFEHARBOR, LA FAMIGLIA, THE CHOIR, BIDBLITZ, MOCHI, BYTEPETS, CHUCK E. CACHE). Mod and item prices stay in data/mods.js, scaled by the spend unit (`priceScale`). Helpers: `earnCr` / `costCr` (units to credits at this sector), `earnInt` / `costInt` (rounded). **Same values as before:** the playtest is unchanged and the economy sim matches its baseline. The sim's what-ifs now set ECON values (`econ.a.b=v`, any number; inflateNN = the spend side's growth). Not yet: the corps' rules / tell text and the mods' descriptions still name the old numbers in words (e.g. "every pick costs 2cr").
- **v13.39** (2026-10-26): **the neon editor's ECONOMY tab** (the user: to read the money numbers better). Every number in data/economy.js, grouped (units; earning: layer pay, loot and rewards, mods; spending: markets, mods, corps), each with its kind (earn / spend units, x, %, cr) and what it is in credits (pick the sector: 1 / 2 / 3, for the growth); changed rows marked, revert per row. On the right: a layer's pay by nodes (normal / perfect / boss / boss perfect), a corp's pay by level, and every market price at each rarity step. Edits go to the game live ('econ' message, changed in place); **save** writes the file (the same dist/data folder as the TRAINING tab). **`tools/economy_file.js`** writes / reads data/economy.js and holds each number's label, kind and note (INFO); the file's comments come from it. The money text now reads the file too: the mods' tips / descriptions (POLICY, EZPASS, FRIENDSHIP, HONEYCOMB, GRAVE ROBBER, OMERTA, COMPANION, CHANCE CARD, CONTINUE?, INTEREST, BLOOD MONEY) and the corps' rules / boss lines / tells (TOLLGATE, SAFEHARBOR, LA FAMIGLIA, THE CHOIR, MOCHI, BYTEPETS, CHUCK E. CACHE). The music tool, Music View and the editor load data/economy.js first.
- **v13.40** (2026-10-26, sim results in docs/ECONOMY.md): **THE UPLINK** (the user's checkpoint idea). Beating a sector boss: the sector clear screen (as before) now ends on one button, **[ SECTOR CLEARED ]**, which opens **UPLINK** (full screen): your mods listed, tap one to keep or sell it; each kept mod costs bandwidth by its rarity, plus a minimum everyone pays, all x the sector you leave; sold mods pay back a share of their fee (sold on PUSH ON). Two big buttons: **PUSH ON** (pay the net bill, then the sector boss's free reward, then the map; greyed when you can't pay: sell mods) and **CASH OUT** (end the run, banks REP). BLOOD MONEY and ZOMBIE can't be sold; LEVERAGE can cover the bill (into debt); items are free. Numbers in data/economy.js `ECON.uplink` (spend units: min 5, scrap 2, common 3, rare 5, epic 8, legendary 12, exotic 10; sells back 33%) and the ECONOMY tab. The sim plays it (keeps everything it can pay for, sells its cheapest mods when short, cashes out if still short). Not yet: showing the coming bill on the map.
- **v13.41** (2026-10-26): **perfects pay a flat x2** (the user, from the sim: the old x(1 + 0.5 x (nodes - 1)) paid up to x6.5 on deep layers and was most of the money flood). ECON.pay now has **perfect** (x, 2) and **perfectPerNode** (0): a perfect pays x(perfect + perfectPerNode x (nodes - 1)), so the old curve is perfect 1, per node 0.5. The ECONOMY tab and the sim follow (the sim's what-if `oldperfect` brings the old curve back). With the uplink, the sim has everyone carrying ~200-800cr into each sector (docs/ECONOMY.md).
- **v13.42** (2026-10-26): **the neon editor: the end of a sector** (the user: an easy way to get to the stage-end corp). Three new scene buttons: **sector boss** (straight into sector 1's boss layer: OMNI), **sector clear** (the sector cleared screen, one tap from the uplink) and **uplink** (the UPLINK screen). The test run has a mod of every rarity and 600cr, so the uplink has a real bill.
- **v13.43** (2026-10-26): **the mod multipliers in the economy file** (the user): a new group, ECON.modx: SUPERSIZE x2, SKIMMER x1.25 / 1.5 / 1.75 (by rarity step), FASTPAY x1.5, ON BEAT x1.5, LET IT RIDE x2, COIN FLIP's top streak 5, QUANTUM x0.5, OVERCLOCK -20% a purge, PRIORITY 2 deliveries, STASH item chance 40 / 60 / 100%, CACHEKEY +1 / 2 / 3 rolls; and HAGGLE -25 / 35 / 50% under markets. Same values as before. Their tips / descriptions quote the numbers. **The ECONOMY tab, clearer:** every note rewritten to say what the number does in play (EZPASS: every layer you beat pays this bonus...); new kinds (lists by rarity step, counts); each kind has its own colored tag and its own look (credits gold = 20cr, multipliers cyan x 1.5, shares purple 25%, growth green, counts plain).
- **v13.44** (2026-10-26, from players' feedback): **the terminal line stands out**: the message line under the HUD (row 6) is now inverted, its text on a band of its own color across the whole row (danger red, money gold, accent...), still typing in. **No timed training popups:** every POPS popup waits for a tap now (the 4 banter lines had timers; the timer stays as a feature, the editor's timed checkbox too). Meat notes filed: SPEC (fixes, intro, header, HOW TO PLAY advanced), quests, CORPS.md (FLUSH, BLACK ICE, an extra layer, 2 bosses, the flipped stage, TIME IS MONEY, ally hackers, open map, THROTTLE, DIGIPET on screen), ECONOMY.md, ADS.md, asXii PLAN.md.
- **v13.45** (2026-10-26, the user's meat-note fixes): **the training no longer leaves you in practice mode** (it put your seed back but not the practice switch). **The PATCH popup** (small POPS) sits a row higher, clear of the item's description. **The header row** (NeoN+1, the menu) draws on top of the training popups, on a solid background. **Leaving the intro:** the music powers up and lands on a chord like beating a boss, the success wipe, then the next track eases in (was a hard cut). **NEWB / LEET click.** **The title card's line:** "network intrusion // prototype" (was corporate/action). Still open from those notes: glitch / animation effects on the title card; the leaderboard keeping old initials (a greglytics server change).
- **v13.46** (2026-10-26) + **greglytics 1.4**: **the leaderboard keeps your old initials** (the user: entering new initials renamed your older scores). Each run's scores carry data.run (its start time); the initials you type name just that run's entries (`gl.setName(name, run)`, name.php updates those rows); older entries (no run) still show the device's latest name. **Upload greglytics api/name.php, api/scores.php, api/version.php.**
- **v13.47** (2026-10-26): **HOW TO PLAY has a MORE tab** (ADVANCED): INT, the seed, reputation, corp events (each modifier's tag, name and line) and the uplink. **The HUD says INT** (was INTEGRITY). Notes: the other ~180 "integrity" mentions; names for the belt / items.
- **v13.48** (2026-10-26): **items are GEAR, the belt is gear slots** (the user). STASH "+1 gear slot", TRIAGE "earns you a PATCH" (no place named), RAM DOUBLER "replace your gear slots with mods", the LEGACY upgrade GEAR SLOT (was WIDE BELT), GEAR SLOTS FULL, the codex tab GEAR, HOW TO PLAY, the market tags, the training line, the editor. Code keys (item, ITEMS, beltSlots) are unchanged.
- **v13.49** (2026-10-26): **money mods retuned** (SKIMMER x1.2/1.3/1.4, SUPERSIZE x1.6, FASTPAY x1.35, EZPASS 6cr a layer, POLICY 20cr a hit, INTEREST cap 50cr, CHANCE CARD 30cr; for live testing). **Market REROLL**: new offers, 1 a market (15cr, more each time), RESTOCK on THE BOARD (30 / 60 REP) makes it 2 / 3. **SELL** at the market: gear sells for half its price. **Value gear**, loot only: SHARD (sells for 30 / 48 / 75cr by rarity) and BOND (40cr x the sector); used anywhere they cash in for half. ECON.reroll, ECON.gear. econsim what-ifs: market, gear:KEY.
- **v13.50** (2026-10-26): **BLOOD MONEY hits cost twice as much** (40cr, +20 a sector; was 20 +10). **QUANTUM pays x0.75** (was x0.5). LEVERAGE, CACHE KEY, HAGGLE, STASH: no change, the user tests them live. **The neon editor has a ? help button** (F1): a drawer on the tab you are on, with how saving works and a section per tab (the content editing guide lives there, the user's idea).
- **v13.51** (2026-10-26): **value gear ladder**: one value gear per rarity, no rarity steps, so each always stacks: DUDS (scrap, 5cr), SIM (common, 15cr), SHARD (now always rare, 40cr; old saves keep theirs) and BOND (rare, x sector), CHROME (epic, 100cr), WALLET (legend, 250cr). Worth in ECON.gear; **which gear a loot roll gives is weighted** (ECON.drop, new "Loot: which gear drops" section in the ECONOMY tab): normal gear 1 each, DUDS 1, SIM 0.7, SHARD 0.5, BOND 0.4, CHROME 0.15, WALLET 0.05 (about 28% of gear drops are value gear, a WALLET 1 in ~200). tools/check.js runs again (fetch stub, HACKER_LOGOS gone); its baseline is old (92 diffs from earlier builds).
- **v13.74** (2026-10-28): **rivals going down** (the user's design). A rival out (hkOut): their face pops up mid-board and blows up in 3 bursts over ~1.2s (each a boom, a little shake and flash; Sound.hkBoom), then what's left of the face and their cursor + name tag falls like your death (fall parts, Sound.hkFall). Crew out: no bursts, it all floats up (rise parts, Sound.hkRise). The music is left alone. **The rival defeated** (reworked the same day, the user: one animation, not two screens): CORP BREACHED's own reveal does it. The title types in, the logo rows come in as the RIVAL's (their logo, colors and name), the reveal holds (RIVAL_REVEAL in engine/screens.js): DEFEATED stamps across in your colors at +0.4s (Sound.hkStamp), your logo replaces theirs a row at a time from +1.0s, the stamp lifts at +2.5s, then the rest (breached [corp], choose one, the offers) builds in as the block glides up, as before. run.js sets st.breachRival; openReward / openChoice give each logo row its rivalRow. Code: engine/hackers.js hkDieFx / buildHkFx (st.hkFx) / hkStamp; reduced effects keep the old glitch-away. Breaching a corp with its rival still in counted as beating them already (hkCorpEnd). Plus since v13.73: the black-screen fix (pet dance), the frame loop survives errors, editor REP set and Give split. Tested headless (the bursts, the fall, crew rising, the defeat screen); playtest 78 the same.
- **v13.73** (2026-10-28): **UI feedback pass** (the user's meat notes). The map's SECTOR line (and its event name, the ^ arrow) moves up one, under the terminal (it overlapped the top row of sectors 2+). The gear bar shows rarity colors on list screens (panels: markets, loot, rewards; the pier) even when the gear can't be used there. **The black market:** BUY and SELL are two modes of one screen: REROLL is the last row of the buy list (price + rerolls left; selected, the box says R E R O L L; the selection stays on it after a reroll; it isn't one of st.shop.offers, so econsim is unchanged, and the reroll count isn't rerolled); the nav is [ SELL ] / [ BUY ] over [ LEAVE ], in the same spots in both modes (the list area pads to one height); the SELL list rows show a gear tag like the buy list; selling your last gear stays in SELL mode. **Trash drag:** the gear sits on the mouse cursor (a finger: one row up); over the trash it drops in (the trash shows its name, solid red). Tested headless (market buy / reroll row / sell, map label, trash drag); playtest 78 the same; econsim runs. After: the FEAT box wraps every line (featPage; the how-it-works page's lines were cut off), and its titles line reads "your titles go on your card:". Neon editor TESTING: REP [n] set (next to credits / INT; sets the editor save's REP, no run needed), and the status line shows REP. **Fix: the black screen** (the user, in the editor with a pet): the pet dancing on the beat read its frame by the beat count, which is -1 just before a beat, so frame was undefined and pet.js threw; an error in a frame stopped the render loop for good (black). Now the count wraps to 0/1, a missing frame falls back to sit, and engine/render.js runs each frame in a try (errors logged as [neon] frame error, the loop goes on). Neon editor TESTING: Give is two rows, a mod (by kind) and gear (normal, value, boss gear, CALL gear, phish), each with its step and button.
- **v13.72** (2026-10-28): **trashing gear** (the user's design). A press on gear waits: lifted in place it's a tap as before (two-tap mode: info, then use); dragged (10px), [ TRASH ] comes up centered on the rule line above the mod row and the gear rides above your finger; drop it on the trash (a generous target) and ONE goes (a stack loses one), no money, no undo: the terminal says "> trashed shoe.", a crunch (Sound.trash) and the name crumbles. Drop anywhere else: nothing. Anywhere in a run, layers too (the clock keeps going); not in the training, multiplayer, the menu. Code: engine/active.js gearDragOk / gearRelease / trashSpot / gearOverTrash / trashItem; input.js st.gearPress; scene.js draws it. The pier's LANDED card says "slots full: drag gear to the trash". HOW TO PLAY gear paragraph. Tested headless with real pointer events (drop on the trash, drop elsewhere, a plain tap); playtest 78 the same. Also: the reel starts where the fish was: the @ on the fish's spot, the target centered on it (fishStartReel). And the pier's lanes run both ways (f.dirs, random each visit): a fish going right is mirrored (fishMirror: <')>< becomes ><('>), it noses the hook head first (fishHead), and the lane's dots flow its way. BIGGEST YET only in runs that count (practice runs, like the editor's go fishing, never saved the record, so every catch said it). Two fishing feats (the user): CAST AWAY (cast 250 times, title CAST AWAY; stat casts, also on THE BOARD STATS) and BIG DATA (land a catch of 10 GB+; stat phishBig). The biggest catch stays one stat on THE BOARD (biggest catch).
- **v13.71** (2026-10-28): **PHISHING** (the user's fishing meat notes). What you land is stolen data, not fish (the shapes in the stream still look like fish; item keys stay `fish_*` for saves): SPAM LIST (scrap), REUSED PASSWORD, LOYALTY ACCOUNT (common), SOC SEC NUMBER, CORPO LOGIN (rare), PAYROLL DUMP, BLACKMAIL (epic), ROOT KEYS (legendary), each with an `info` line (what you got) and a made-up size `kb: [min, max]` (log scale; shown as B/KB/MB/GB; BIGGEST YET kept, THE RECORD `phishKB`); a shoe still gets a weight. The CAUGHT card is now LANDED (12 rows): the shape, the size, the chip, what you got (wrapped), what a black market pays, KEEP / THROW BACK. Feats: GONE PHISHING, PHISHER (title; was ANGLER), THE BIG ONE, OLD BOOT. Help, map info, stats (phish landed, biggest catch) and the ECONOMY tab labels say phish. **Reel UI pass:** each bar cell drawn once (the cursor `@` replaces the - under it); on the target: the bar white, the target cyan, the @ white; off it: the bar red, the target pink, the @ cyan. The stream stays still and dim behind the LANDED card. Terminal: the cast says just the cost; your first drag says "drag up and down to move the hook."; a bite says TAP THE STREAM. (Rebuilt engine/fishing.js's second half after a patch cut it; same code.) After the commit: KEEP turns a catch into the PHISH of its rarity (new ITEMS phish_scrap..phish_legendary, bag: true, name PHISH; fishKeepKey in engine/fishing.js), so two rare phish stack as PHISHx2 (worth by rarity, as before); the catch names and info lines are flavor on the LANDED card and in the codex (the codex skips the bags). Tested headless with screenshots; playtest + econsim.
- **v13.70** (2026-10-28): **fishing, round 2** (the user's first play). 7 lanes (was 5). Fewer fish, mostly small: shapes are `<><`-sized, a few mid, and at most 3 big ones swim at once (FISH_LOOKS, FISH_BIG_MAX); every epic and legendary fish is big, plus a few big decoys (the old rarer-is-smaller hint is gone); spawns every 0.65-1.65s (was 0.3-0.9). The cast: the hook drops fast to the lane you tap (a whoosh, then a plop when it lands); held, it follows your finger with a reel click each row. Sounds (engine/sound.js fish*): bite (bloops), the reel (holding: fast high ratchet; slack: slower low ticks; inside the window louder, plus a note climbing with the catch), snap, reel in, a shoe's wah-wah. The catch plays the market reveal pop by rarity (Sound.pop), a burst from epic up, confetti + flash on a legendary. **Weights**: `lb: [min, max]` on each fish (SPRAT 0.05-0.3 .. KRAKEN 350-2200), most near the low end; the CAUGHT card shows it (and BIGGEST YET), the message too; THE RECORD keeps `fishLb` (THE BOARD STATS: fish caught, biggest fish). **Music**: a random one of LOW PRESSURE, PLUS ONE, SEA LEGS each visit (SEA LEGS copied into data/music.js from the music tool's demo_shanty as `sealegs`), level 1, level 3 while reeling (engine/boot.js). Tested headless (music state, shape sizes, weight, card); playtest 78 the same; econsim runs. Round 2b (same version, the user's second play): the NEON menu works at the pier (and Esc opens it; the pier no longer leaves on Esc), the menu draws over it; taps only count on the stream (and the reel box above it), so the tray and the rest are theirs again; every fish sound twice as loud, the cast adds the reel spinning out (12 clicks slowing down); ( ) ripples spread out where the hook lands; the reel replaces the hooked fish's own lane (the window bar on its row, its < mark is the fish; the CATCH bar on the row above; the window turns gold when the fish is inside), and the other lanes go still and dim while you reel.
- **v13.69** (2026-10-28): **fishing: the PIER** (the user's design, mockups "NeoN+1 Fishing" idea D; engine/fishing.js, new). A new map stop **[~] PIER**, as common as a cache (half the cache rolls on rows 2 and 4 become one; its own rng). The board area is a data stream: 5 lanes sliding left, each at its own speed (random). Hold and the hook sinks from the surface to your finger's lane (up and down only; it drifts left and right by itself). A shape in the hook's lane noses it; half the time it bites: it turns red and you have 0.7s to **tap anywhere**, or it's gone. Then the **reel**: a window wanders along a bar; hold to pull the fish right, let go and it slips left; inside the window the catch bar fills (out: it drains; empty: the line snaps). What bites is a mystery: every shape looks like a fish (rarer fish are smaller), but 30% are gear (the loot pool, each rarity step damped) and 10% a SHOE. The CAUGHT card: KEEP (gear slots) or THROW BACK. **8 fish** (`fish_*` value gear: SPRAT, GUPPY, CARP, EEL, KOI, MARLIN, PUFFER, KRAKEN; black markets buy them, or cash one in anywhere for half; never loot). Every cast costs (`ECON.fish.cast` 0.4 spend = 4cr; REEL IN pulls an empty hook back, spent); 30 casts a pier. Numbers in the ECONOMY tab (Fishing: cast, casts, gear / shoe chances, fish odds by rarity, gear damping, fish worth 0.2-6 earn). 4 feats: GONE FISHING, ANGLER (25, title), THE BIG ONE (legendary, title), OLD BOOT (a shoe). Neon editor TESTING: go fishing. HOW TO PLAY: the pier. The pier isn't gated yet (`pierOn()`; later a feat unlocks it). Tested headless: a cast, a bite, the reel, KEEP, REEL IN, the cast limit, the catch spread (2000 rolls: fish 60 / gear 30 / shoe 10), screenshots; playtest 78 the same; econsim runs.
- **v13.68** (2026-10-28): **the pet** (the user's meat notes; engine/pet.js + data/pets.js, new). A pet is yours for the run (`run.pet`: a cat or a dog and a name, rolled when you take COMPANION; not tied to it, so other things can give one later). It lives on the tray line, 2 lines tall: walks back and forth, sits now and then, sleeps (zzz) after 15s idle, dances on the beat when the music plays, and runs over to the ICE COMPANION sniffs out (with a !). Tap it: a heart and a little sound (new feat GOOD PET: 50 pets, title PET PERSON). When a hacker comes in, about half the time a line about the pet (rivals growl / hiss, crew each their own). Looks only. **ICE MAN** in a RIVAL corp now stays out until your first ICE hit there. Meat notes filed (COMPANION ideas, fishing, the G0D quest, a gear quest). Tested headless: the roll, map + layer, petting, the hacker lines; playtest 78 the same.
- **v13.67** (2026-10-28): **progression step 3: hackers in play** (docs/PROGRESSION.md; engine/hackers.js, new). The old RIVAL bot is gone: a **RIVAL** corp (the anomaly, RAT RACE) brings in one of the 10 rivals (fixed by the seed; d0g from sector 3), each with its own rules (`HK_AI`): ICE MAN refreezes ICE, GG_EZ covers nodes with emotes (2 perfects in a row: rage quit), TURBO taps in order, D0PPEL (your name, glitched) copies your taps mirrored, SYSOP puts ACCESS DENIED on nodes, VULTURE dives at 3 left, PH1SH plants a fake PICK ME and lies, d0g reads the tell, HCF starts fires that spread, LEECH takes 25% of your pay. **CALL** gear (rare) brings a random crew member for the rest of the corp; the 10 crew: POPS burns ICE, BRICK takes your hits, NULL hunts rivals, NANA heals and spite-locks, DIALUP connects then rules out half, BAUD burns ICE fast, MOTHER stops a last-INT ICE tap, ROOT marks ICE, KLUDGE tapes nodes, HYPE makes streaks pay more. Each good one counters one rival. **Presentation** (the user's meat notes): a card when a hacker comes in (logo in their colors, name, shtick, their line; the clock holds; tap closes), each hacker's **colors** (data/hackers.js `style`), a **cursor** (their 3-letter mark on their colors, name under it, gliding to where they'll tap), their lines in the terminal in their color, their face bouncing over the cursor when they talk and glitching away when they're out, bars in the notes row, and **dying with a hacker there**: a rival's logo and taunt (or a crew member calling your name) over the screen falling apart. **Progression**: rivals met / beaten and crew called go in THE RECORD; feats per hacker (beat a rival 5x: its logo; call crew 5x: its logo + PRIVATE MESSAGE CREW: NAME; 10x: NAME LVL 2), listed once you've met them. CREW: NAME puts their own call gear (`call_<id>`) in markets and loot; LVL 2 is a fixed upgrade each (`lvl2`). THE BOARD gets a **CREW** tab (crew cards with faces, then called-not-crew with counts); YOU's logo picker steps through met hackers' locked logos with a LOCKED banner (leaving keeps your last real one). The codex has a **HACKERS** tab (its tabs in two rows). Neon editor TESTING: bring in any hacker. HOW TO PLAY: a HACKERS paragraph. Tested headless: every hacker in a live layer, a RIVAL corp start to end (the beat counted), CALL, death with a rival, the CREW tab, locked logo, codex; screenshots; playtest 78 the same; econsim runs.
- **v13.66** (2026-10-28): **progression step 2: REP's levels** (docs/PROGRESSION.md). THE BOARD's posts sit on levels (engine/save.js `BOARD_LEVELS`, each post's `tier`): **GUEST** (open), **USER** (buy 4 on GUEST), **ELITE** (buy 3 on USER), **SYSOP** (buy 2 on ELITE); a post with steps counts once. Your **access level** shows on the YOU card and the REP tab. REP is one scrolling list: PRIVATE MESSAGES (posts a feat opens, shown once it has progress), then each level (counts on its header; the next locked one says what opens it). A level opening: a THE BOARD box listing its posts, and `*` on them (and on the REP tab / the title) until you look. **New posts**: GUEST: SECOND WIND (heal 1 each new sector), LUCKY START (a random common gear). USER: BETTER DROPS (1 in 10 / 1 in 5 mods and gear roll a step rarer), LOCKER (cash out: put one mod away a step lower; your next real run starts with it), NEMESIS (a corp you've breached shows up 3x: picker on its detail), STARTER POOL (the starter perk offers general mods too). PRIVATE MESSAGE: BOSS LOOT (boss gear in black markets), opened by the new feat BOSS HUNTER (clear 10 sectors). ELITE / SYSOP: nothing posted yet. **Fixed**: SHORTLIST never did anything (the starter perk now offers 4). Tested headless: levels open after 4 / 4 buys with their box, every post's effect (drops stepped up 13% at level 2; nemesis 439 vs 184 on 300 maps; LOCKER at cash out and back next run), screenshots; playtest 78 the same; econsim runs.
- **v13.65** (2026-10-28): **progression step 1: the record, feats, THE BOARD hub** (docs/PROGRESSION.md, the user: "ok yea start on the steps, lets get it"). **THE RECORD** (`save.stats`, engine/feats.js): runs, deaths, cash-outs, corps and different corps, layers, perfects, ICE hits, sectors, credits earned, REP banked, gear used, ads closed, and bests (depth, perfect streak, sectors in a run, credits held, spent in a run); practice runs, the training and multiplayer don't count. **25 feats** (`dist/data/feats.js`: runs / corps / odd), 13 give a title; NEWB from the training (its box on the title) or quietly on your first run. **THE BOARD is the hub**: its BBS header, tabs [YOU] [REP] [FEATS] [STATS], a fixed body so BACK stays put. YOU = the profile (the card in your player color with your title; logo / title / color pickers; NEW NAME, RANDOMIZE ALL). REP = today's posts (tiers are step 2). FEATS = the picked one on top, the grouped list with progress under it. STATS = one column, right-aligned, shaded every other line. Title: [ THE BOARD ] (opens on FEATS when one is new) and your name (opens YOU), each with a * for news. **The news**: a feat in a layer flashes in the terminal line in the rep color (~1.8s); the **FEAT box** (FEAT + 1 of N, POPS's line, "unlocked title: ...", inverted [ CLOSE ] / [ NEXT ], a tap on it = next) comes up once things are calm; the first feat adds a page on where feats live. **One scroll area** (`scrollArea` in engine/codex.js, the codex's "more" rows); the game-over screen's map scroll uses it now (no more margin arrows). **The wipe**: `PROGRESS_EPOCH` = 1, so every save starts fresh on load (REP spent on THE BOARD refunded; posts, feats, titles, the record cleared; NEWB back for anyone who's played). Neon editor: TESTING > Feats (grant / take back, show its box), wipe progression; a **board** scene. HOW TO PLAY: a THE BOARD AND FEATS paragraph. Tested headless: a real run (NEWB, FIRST BLOOD, the box and its pages), every tab drawn (31 lines each), the wipe refund, the in-layer line; playtest 78 corps the same.
- **v13.64** (2026-10-28): **a rep color in every palette** (the user: "would it make sense to just add a rep color to the palettes like we have a credit color?"; leaning blue-violet or lime). New palette role `rep` (REP, feats, unlocks: THE BOARD), for the progression plan (docs/PROGRESSION.md). All 79 palettes got one, generated: blue-violet (hue 242-274) at money's contrast on the background (4.5-6.5:1), lime where violet sat near the palette's accent, money or danger (3 palettes); none ended up close to another color. engine/core.js: C.rep (a palette without one uses its accent). Both palette editors (the neon editor's palette tab, palette_editor.html): the rep row, its contrast need, the "look alike" pairs (rep vs money / accent / danger / bright), smart palettes make one, the samples show it. Their file writer reproduces palettes.js line for line. Nothing in the game uses it yet.
- **v13.63** (2026-10-28): **the hacker cast** (the user: "make up like 10 bad hackers and 10 good hackers. for good hackers you can start with pops"). `dist/data/hackers.js` (new): each hacker's name, side (bad / good), health, shtick, lore, how its AI plays, how you beat it, and its counter. Not in play yet. Faces: `dist/data/art/faces.js` (new, ART_FACES, 5 x 3); POPS's face moved there (the training draws ART_FACES.pops). Logos: 20 more in `logos.js`, kind hacker. tools/art_file.js writes faces.js; the neon editor's ART tab edits faces (group **hacker faces**, asXii too) and the new **HACKERS** tab shows the whole cast (face, logo, text, counters you click through to). Playtest: 78 corps the same.
- **v13.62** (2026-10-27): **the tap-to-use corp mods are boss gear now** (the user: "change all of the tap to activate mods into stacks of gear you can get for defeating the boss"). Legendary gear, never in markets or loot; the corp's boss reward offers the stack (its def: `gear { key, n }`), and a market buys them (SELL). Changed where they overlapped shop gear: **FLARE** x3 (BLACKOUT): rules out 3/4 of the board (SPLIT does half). **REMOTE** x3 (CHANNEL 9): as before. **ROLLUP** x2 (CARAPACE): no hits for the rest of the layer, no pay (was 1 hit: weaker than FWALL). **FREEZE** x3 (STREAMFLIX, was FREEZE FRAME): 2s (was 1s). **BLAST** x2 (DEMOLITION, was CONTROLLED BLAST): aimed: arm it, tap a node, the busiest 2x2 with it goes up (FRAG stays random). **SNITCH** x3 (NOIR, was INTERROGATE): NOT ME plus an arrow toward the real node. **TITHE** x2 (CHOIR, was SACRIFICE): -1 INT, the layer clears as a perfect (was half the ICE: worse than SPLIT). **ANCHOR** x2 (ENTROPY): nothing moves for the rest of the corp (a still corp: clock stops 5s). **SLOMO** x2 (BULLET TIME, was TIMEWARP): half-speed clock for the rest of the corp. **BEES** x3 (APIARY, was the HONEYCOMB mod): eats 3 ICE from the bottom up, then 1 in every later layer of the corp. **ESPRESSO** is gone: COLDBREW gives REWIND (epic) x2, and **REWIND epic** now stops only the clocks (what moves is ANCHOR's). **Gear in the boss reward:** the random third pick is a gear stack 35% of the time (ECONOMY tab, "boss reward"): scrap x6-8, common x3-4, rare x2-3, epic x1-2, weighted toward rare. BURNER stays a mod. The meat notes filed in BACKLOG.md. Tested: every boss gear used on every layer of all 78 corps in headless Chrome; the reward screen (offer, take, swap when full, the third-pick odds).
- **v13.61** (2026-10-27): **15 more fake ads** (the user: "go through the ad ideas and make up like 15 more"), from docs/ADS.md: SPONSORED STORIES 2, GUNMETAL SMARTGUN 9, MEDIX CHROME CLINIC, NORDVEIL VPN, GO AD FREE, QUEENS OF KALDOR, OMNINET ONLINE, LUCKEEZ SPORTSBOOK, NeoN+2, MEGAMART, BURGERTRON, RYDR, STREAMFLIX, SPARKD, OMNI//CORE PREMIUM (17 now); block letters D F S N I W for adBig. **Neon editor ADS tab**: every ad drawn as text the way the game draws it (30 x 18 in the frame; buttons underlined, hover for their line), a filter, **show in the game** (and a random one): the game's new 'ad' test action. Checked: every screen fits 30 x 18.
- **v13.60** (2026-10-27): **HEAD FIRST** (the user's flipped sector; card: "no diving."): the sector boss is the first node (row 1 is just the boss, middle lane; it opens onto all of row 2); beat it and its spoils come right away (the sector boss reward, exotic and all; a skipped boss: none); the top of the sector is a black market whose LEAVE is **[ JACK OUT ]**: leaving it is SECTOR CLEARED, then THE UPLINK, then the next sector with no reward screen. The exit market starts the next sector. Never in sector 2 (if it comes first in a run's order it swaps with the next). The TESTING tab's "sector boss now" finds the boss wherever it is. 20 events. Tested: a sector through (boss, reward, the rest, JACK OUT, cleared, push on, no reward); 3000 seeds: never in sector 2, no repeats in 20 sectors.
- **v13.59** (2026-10-27): **EENY MEENY** (the user's; was "2 bosses" / SWIPE LEFT): three sector bosses at the top, one per lane (the rolled one in the middle, two more LV4-5 corps, all different); each last-row node links to its lane's boss, now and then a neighbor's too. The one you beat starts the next sector (every node at a sector's start step links into its first row now), the other two stay behind. The map draws them in their lanes. THE FENCE never goes where a boss is (it would only come up with the TESTING tab's steal). Tested: a sector played to the left boss, pushed on, the next sector reachable from it. 19 events.
- **v13.58** (2026-10-27): **4 more sector events** (the user's, docs/SECTOR_EVENTS.md "The next batch"). **GRIND**: every corp in the sector has one more layer ("are we there yet?"). **COLD SNAP** puts the new **BLACK ICE** anomaly (tag B) on 40% of the corps + the boss: about a quarter of a layer's ICE is black (no tell); a hit takes you down to 1 INT but never below (at 1 it does nothing), with a big burst, a long red flash and a hard shake; shields and blocks stop it like any ICE, GROUNDED takes 1 off, ZOMBIE gets twice the rot, BLOOD MONEY pays for that many hits. **RIGHT ANGLES**: no diagonal links in the sector, sideways links 60% (from 25%). **GAUNTLET**: the sector is one line (the middle lane: corp, corp, market, corp, boss). 18 events now. Tested: each through a sector in headless Chrome (black ICE 6 -> 1, again at 1 stays 1; GRIND 6 layers; RIGHT ANGLES 0 diagonals; GAUNTLET one lane).
- **v13.57** (2026-10-27): neon editor: the game frame starts at tablet 720; the TESTING tab has **music** and **sfx** toggles (the game's own music; the music tab takes over while it plays a track; sfx is the same switch as the music tab's, which now only changes it when flipped); an **intro** scene button (replays the first-boot intro); the **darkness** slider (BLACKOUT) moved to the palette tab's top bar.
- **v13.56** (2026-10-27): **music in the neon editor** (the user: turning music on in the game's settings did nothing in the editor). The music tab took the music over all the time: stopped, it made the game play nothing, and every control message set the game's music setting to "is the tab playing". Now the tab takes over only while it plays a track; stopped, the game plays its own music by its own setting (off by default in the editor), and the setting comes back when the tab stops.
- **v13.55** (2026-10-27): **the codex SECTORS tab** (the user: "add sectors to the codex"). A 5th tab (the tab row has no gaps now, to fit 36 wide): every sector event, logged the first time its card shows (save.seen ev_<key>); found: its 5x3 picture with the name, "sector event" and its anomaly (or "the whole sector"), what the card says (at sector 2), and the tag line; not found: ???. The dev menu's [unlock codex] covers them. Tested headless (found / not found, row widths).
- **v13.54** (2026-10-27): **sector events** (design: docs/SECTOR_EVENTS.md). New data/events.js: ANOMALIES (was CORP_MODS in engine/map.js; + **BLINDERS**: the node shows `??3`, the info box only the level, no corp colors, the intro is the reveal) and 14 SECTOR_EVENTS. Sector 1 stays clean; every sector after rolls one (a seeded weighted shuffle, no repeats; DEAD AIR a third as often), kept on that sector's boss node (`ev`; `sectorEvent()`). Anomaly events (RAT RACE, WHERE AM I GOING?, CRUNCH TIME, STICKY FINGERS, LOCKDOWN, BAD JUJU, PAYDAY, BRAND SAFETY, CHEF'S CHOICE = any) tag an exact share of the sector's corps (40-50%, +10% a sector after the 2nd, up to 80%) **and the sector boss (OMNI too)**; sector-wide events (COPY PASTE one corp everywhere, FIRE SALE markets -30% (ECON.events.fireSale), FLUSH rest stops kept as caches + more $ nodes, TIME IS MONEY clocks cost ECON.events.timeCr a second + timed corps x3 likely, DEAD AIR nothing) leave the boss plain. Today's random anomaly roll and the non-OMNI boss's random anomaly are gone. **The SECTOR EVENT card** (engine/events.js): over the new sector's map once its climb settles, once per sector (run.evSeen; comes back on a resume), narrower than an ad, `#`/`=` frame, `SECTOR 2 // EVENT`, the 5x3 picture (placeholders), the name, the lines (the share as a %), the tag line, [ CONTINUE ] (no countdown); the map's `SECTOR 2: RAT RACE` label reopens it. **THIEF -> THE FENCE:** a `[&]` stop next to the sector boss (left or right, linked from the whole last row and to the boss) whenever a corp there has THIEF; what a thief takes goes there (run.fence) and is bought back at its uplink fee (HAGGLE works), as it was (its tier, no slot needed); unsold mods are gone at the uplink; a sector boss's thief still gives them back when you win. HOW TO PLAY: SECTOR EVENTS + ANOMALIES (was CORP EVENTS); dev menu: "anomaly", the mod grid moved out. **Neon editor TESTING tab:** god / show real / free travel, credits, INT, heal; every event as a button (a new run straight to sector 2 with it, card first); jump to sector 2-5, the sector boss, clear the sector, the uplink; an anomaly on the next corps; steal my last mod (to THE FENCE); give any mod or gear. Tested: all 14 events through a whole sector in headless Chrome (card, counts, boss, fence buy-back), the TESTING tab's messages.
- **v13.53** (2026-10-27): **markets stock more than one copy** (the user: "they might have 2 patches"). Each gear offer rolls extra copies by its rarity (ECON.stock: each extra copy scrap 50% / common 35% / rare 20% / epic 8%, up to 3; its own rng, so the rest of a market rolls the same). The row shows PATCH x2; buying takes one (same step, so they stack); SOLD after the last. COUPON: only the first copy is free. Tested headless: x2+ for scrap ~50%, common ~35%, rare ~19%, epic ~8%.
- **v13.52** (2026-10-27): **nine new gear** (the user's gear talk, 2026-10-26). Map: **TUNNEL** (rare: your next move can be any node in your row), **MESH** (epic: every node links to every node in the next row, rest of the sector), **WARP** exotic -> rare (random jump ahead, never the sector boss) with an **epic step: aimed** (pick any node ahead); all three widen availableNodes (run.tunnel / run.mesh / run.warpAim). Layer: **TILT** (rare: closed nodes slide all the way up or down, a coin flip; GRAVITAS: a free gravity drop), **SHAKE** (common: closed nodes slide a step or two, or swap when packed; ENTROPY: its own shuffle), **FRAG** (common 3 hits / rare 4 / epic 5 / legendary 5 never the real; a hit on the real node clears the layer, no pay; the first gear with a 4th step: TIER_ODDS top 1%, ECON.tierPrice x4), **REWIND** (common +5s / rare clock full / epic every timer stops for the rest of the corp: holdUntil forever + ANCHOR, corp.frozen, saved), **SHOE** (scrap: 10% breaks an ICE, 1% hits the real node, else a joke line). **PASS** (epic: a row on the UPLINK screen, on by default, cuts the fee by ECON.uplink.pass = 50%). In corps with their own tap rules (def.tap) FRAG / SHOE never hit the real node. **Gear odds by rarity** (ECON.drop scrap 1 / common 1 / rare 0.7 / epic 0.4) for loot and markets (markets pick 3 by weight now, not evenly): an epic gear is in ~10% of markets, PATCH ~25% (was ~43%). Tested: every layer gear used on every layer of all 78 corps (none stuck, no errors), the map gear + PASS in a headless run.
- **v13.28** (2026-10-26): **the art split and logos** (the user). `data/art.js` is now three files in **`data/art/`**: `glyphs.js` (`ART_GLYPHS`: each glyph's name, codex lore and art; `ART_SPECIAL`: PROMPT, LOADED NODE, BONE PILE, REDACTED), `logos.js` (`ART_LOGOS`: **every logo**, by id: the 15 player logos and the 79 corp logos, which are also the corps' intro art; later rival hackers'), `worldmap.js` (`ART_MAP`). Each logo: id, name, 3-character mark (corps: their map code, `KN3`; OMNI `[!]`), kind (player / corp + corp key / hacker + hacker id) and art. **Logo ids:** the profile keeps the id (an old save's number turns into that player logo once). **Unlocks:** corp logos unlock when you beat the corp (`corpStat().breached`), hacker logos when you beat that hacker (`save.hackersBeaten`, nothing sets it yet); the profile's < > and the multiplayer menu's [ LOGO ] step through what you've unlocked. **One logo box:** every logo is drawn centered in 24 x 7 (`LOGO_W` / `LOGO_H`, engine/multiplayer.js `hackerArt`) wherever it shows (profile card, welcome, CORP BREACHED, multiplayer turn card), so screens always know the room; CORP BREACHED after a boss win drops its two blank spacer rows to fit (still 38 rows at phone size). **The ART tab:** groups (glyphs, special, player / corp / hacker logos, map), a glyph's name + lore fields, a logo's id / name / mark / kind / corp fields, **+ glyph** and **+ logo**, reorder logos, remove (new glyphs; any logo, with a warning), "show in game" puts the profile in the chosen logo; **save** writes only the files that changed (pick the `dist/data/art` folder once). The data/glyphs.js and data/personas.js keep only their code / name lists.
- **v13.27** (2026-10-25): **the art catalog** (the user's idea). All the simple art moved into one file the editor owns, **`data/art.js`** (`ART`: `glyphs` (the 18 node glyphs), `extra` (PROMPT, LOADED, BONE PILE, ??? mask), `logos` (the 15 hacker logos, by name), `corps` (79 corp intro pieces, OMNI too), `introMap`). The game reads it: MOTIFS_RAW, the special glyphs, HACKER_LOGOS' art, CORP_ART, INTRO_MAP; the corp files no longer carry their art. **The neon editor's ART tab**: every piece in a list, a preview inside its size limit (glyphs 5x3, logos 21x5, corps 30x7, map 34x9), a text box, copy / paste / revert, "show in game" (a layer, the profile, the corp's intro screen held up, the boot intro), live in the game as you edit, and **save art.js** (writes the file with `tools/art_file.js`, Chrome file access, like palettes.js). **edit in asXii** opens asXii (`?neon=1`) with the piece at its size; asXii's new bar has **send back to NeoN+1** (Ctrl Enter): `ascii-editor/dist/neon-link.js`, which only uses the `window.asxii` hooks (app.js now also exposes changed / zoomFit / toast). Ads stay out (their line options and animations don't fit asXii); the title art too (its face / logo / traces are built in parts).
- **v13.26** (2026-10-25): **the to-do batch** (the user's list). **KERNING**: the tell nudges a whole line of the real node (was one character), by more (4.5 / 3.5 / 2.5 px; deeper corps 3.5 / 2.5 / 2; boss 3, every decoy off), still shrinking layer by layer. **Sounds**: the real node plays a bright climbing C-E-G-C with a held high note and sparkle (`Sound.safe`); every bad hit (`Sound.trap`) adds a falling two-note "uh-oh" over its buzz. **X-AXIS / Y-AXIS**: a color band fills along the scanned row / column at the scan's pace, from the tapped node to the real node, and the real node pulses when it's reached; a miss fills out to both edges, dimmer, and fades (engine/scene.js buildBoard). **Rest stops**: at most 2 a stage (`REST_STOPS`, engine/map.js): the market (row 3) always stays, plus one of the other rows' stops; the rest become corps. **Editor mod picker**: the ITEMS & MODS tab shows what the game's run holds and at what step; every mod step has give / set / remove (cards) or a clickable cell (ladder), through the bridge (`mods` / `mod-set` messages, engine/editor.js). The run turns practice. "start a test run" when there's none.
- **v13.25** (2026-10-25): **GRAVE ROBBER's track** (the user): a new 5/4 track inspired by Halloween (a high piano figure over moving chords, the bass sinking a half step in B), with the first sound effects in a track: a door creaking open and an owl's call. It replaces the map music while you hold GRAVE ROBBER. The music engine learned 5/4 (`meter: 5`) and `creak` / `owl` patterns; the music tool shows 5/4.
- **v13.24** (2026-10-25): **SURGE** reworked (the user): every corp layer has a clock (15s if the corp has none) and a real pick in the last 3 seconds heals 1, instead of paying x1.5. AFTERIMAGE stays as is.
- **v13.23** (2026-10-25): **leg + exotic mod notes** (meat notes): ICE EATER's real node bites for 3 (not death); LEVERAGE takes a loan payment every layer; CORNERS became FENCELINE (locks a whole edge); BULWARK recharges on a perfect; COUPON makes one market offer free; SUPERSIZE pays x2 on every layer; MUTATE is rare or better and flashes what it became; TRIAGE gives a PATCH; CONTINUE? once per corp at a climbing price; ready tap mods pulse and get a first-time hint; COMPOST shows its count. Discussion items are in the mod notes list.
- **greglytics 1.3** (2026-10-25, the user): **every run is its own leaderboard entry**, so one player can be on a board many times (was: each device's best only). The end screen's rank is this run's place among all entries; the title line still shows your best. A device's initials (name.php) still show on all its entries. An app's config can go back to one per device with 'scores' => ['per' => 'device']. Needs uploading: api/scores.php, api/version.php.
- **v13.11** (2026-10-24): **leaderboard initials on the end screen** (the user): a run still posts as it ends (so the rank comes back at once and is never lost); the bottom of the results then shows this run's places (`#11 ALL TIME   #5 TODAY`, gold with `**` for a top 10), 3-letter initials drawn big in **Bigfig** (the user's pick from asXii's fonts) with [^]/[v] to change each (or type them; arrows, backspace, enter), and **U P L O A D** in place of NEW RUN. Uploading sets your name on the server (one per device, shown on all your entries: new `name.php`), saves the initials for next time, then the NEW RUN / RETRY / BACK buttons come back. Fanfare: #1 all time = fireworks + victory; top 10 = fireworks + win; a personal best = a flash. A short rude-word list blocks UPLOAD. LEADERBOARD rows show the initials, with the hacker name dimmed beside them. Server: upload `lib.php`, `scores.php` and the new `name.php` before this build.
- **v13.10** (2026-10-24): **online LEADERBOARD** (the user): a new title-menu screen (next to THE BOARD; NEW RUN moves to its own row under them) with TODAY (the UTC day) and ALL TIME tabs, top 10 plus your own row. A finished run (not practice, not multiplayer) sends its layers, ranked by layers with fewer mods winning ties, each device's best counting. Runs on greglytics (`greglytics/` in the repo, live at s3iz.com/glx): `engine/greglytics.js` is a copy of its browser script, `engine/leaders.js` the screen and the sending (kept in the save until it goes through, so offline runs send later). Pages opened from a file or localhost use separate test boards. The death and REP screens don't show it yet (kept apart for this first pass).
- **v13.09** (2026-10-22): ad bars can be sized, timed and reversed (the user): `{bar:20}` (width inside the brackets, default 10), `{bar:20:6s}` (fill time, default most of the screen's time), `{rbar...}` empties instead of filling. Several per line work.
- **v13.08** (2026-10-22): **CHROMED UP is now RAM DOUBLER** (the user; a nod to Johnny Mnemonic), and it really doubles: 12 mod slots (two full rows of 6), not 9. The text keeps the chrome ("get your memory chromed up"). A saved run with the old CHROMED UP gets RAM DOUBLER on load (`MOD_RENAMED` in engine/save.js, which also drops mods that no longer exist).
- **v13.07** (2026-10-22): CHROMED UP's tray line read `4 more mod slots` (the free slots left, read as the bonus; the user). Now `chromed up: 4 of 9 slots free`.
- **v13.06** (2026-10-22): **fix: an ad between layers was invisible** (the user, in CLONEWORKS: the transition looped and never reached the next layer). Between layers the screen wipe holds the screen while the ad is up, and the wipe was drawn over the ad, so you were stuck behind an ad you couldn't see. The ad is now drawn after the wipe, on top of everything (engine/scene.js). Also a dev menu `[show ad]`.
- **v13.05** (2026-10-22): **the first fake ads** (data/ads.js, engine/ads.js; ideas in docs/ADS.md). An ad comes up over whatever is on screen in a bordered box (34 wide, 20 tall) with `[ AD ]` in the corner and `skip in 3` that turns into `[x]` after 2.5s; it takes every tap and key until closed. Two-screen ads turn on their own (or on a tap): each character spins out (`|/-`) as the next spins in, rippling across the box. **When:** between layers (not before a boss layer) and coming back to the map, 1 in 6, at most one per corp, never in a run's first corp, at least 3 chance points apart (`AD_CFG`). SETTINGS `[ ads: ON / OFF ]`. **The two ads:** SPONSORED STORIES (a chumbox: four thumbnails and bait headlines, "is your dog in danger?"), and VIRUSHIELD PRO (two screens: block-letter ALERT!, a scan bar filling, then an EXPIRED subscription with `[ RENEW 49cr ]` / `[ remind me later ]`, which both just close it).
- **v13.04** (2026-10-22): dev menu `[intro: first boot]` (replays the full first-time intro, as if new) and `[intro: short]`.
- **v13.03** (2026-10-22): **the boot / login intro** (engine/intro.js, the user's sequence). Before the title: a `>_` prompt, `login: <your runner name>` and `password: ********` typing in, the boot log scrolling (the game's real files, `ok` or `FAIL` by version stamp, with fake lines like `routing via proxy 3/7`) and a `[****----]` bar, then a small world map (our own drawing, in the old ASCII-map line style) with your spot blinking and `trace: N hops // located.`, then `handshake complete.`, your logo block and "welcome back, name". The fake IP (`10.x.x.x`) and your spot come from your profile name. Full the first time ever (~6.5s, `save.bootSeen`), a short one after (~1.5s: login, bar, handshake); a tap or key skips. Not on room links or `?nointro`. Sound only once you've tapped (browsers block audio before that).
- **v13.02** (2026-10-22): more old-Safari stand-ins in index.html: `trimStart` / `trimEnd` (missing before Safari 12, used while the corp art loads) and `matchAll` (before Safari 13, used for the rarity words in text). Tested with all of them, `flat` and pointer events removed: loads, taps work. Floor: **iOS 10.3** (Safari 10.1): the game uses async functions, which iOS 10.0-10.2 can't parse.
- **v13.01** (2026-10-22): **older iPads / Safari** (the user: an old iPad loads the game but nothing is tappable). Safari added pointer events in iOS 13; before that the canvas never got taps. engine/input.js now turns touch (and mouse) events into the pointer events the game uses when `window.PointerEvent` is missing. Also stand-ins in index.html for `Object.fromEntries` / `flat` / `flatMap` (missing before iOS 12.2). Checked: every file parses as ES2017 (iOS 11).
- **v13.00** (2026-10-22): **new major: the exotics release.** Everything since v12.10 (corp map codes `SK1`; mod effects you can see and one shared MOD FIRED animation; the EXOTIC system with ICE EATER, ZOMBIE, BLOOD MONEY, LEVERAGE, QUANTUM, COIN FLIP, SNOOZE, CHROMED UP; the ALL-IN item; items and mods that say why they're off). New save slot `beta_runner.v13.save`: the first load copies the v12 save (or v11) and a run in progress. The rest of the exotic ideas are stored in docs/EXOTICS.md for later.
- **v12.24** (2026-10-22): **CHROMED UP** (EXOTIC, `slots` slot, locked; the user's "slot trade", named by the user; spare name MEMORY DOUBLER). The item belt goes (items you hold are sold for half), +3 mod slots (`modSlots()`: 9), mods 7-9 sit on the belt's row; items you'd find become credits (`addItem` refuses, loot falls back to credits) and markets stop selling items.
- **v12.23** (2026-10-22): **SNOOZE** (EXOTIC, `carry` slot; the user's "ICE that comes with you"). Half your ICE hits do no damage ("snoozed: later", a free block after the debt shield); that ICE carries into the next layer (the next corp too) as one more ICE node: in the same spot if it's free, a copy of one of that layer's decoys with one character of its glyph turned into a `z` (no glyph has a z otherwise). It stacks (snoozed ICE can snooze again); what doesn't fit waits. Off in corps with their own tap rules. `snoozeIn` in engine/run.js. Also: the layer line counts added nodes ("5 nodes").
- **v12.22** (2026-10-22): **ALL-IN** (EPIC item, the user's "all or nothing" exotic idea, made an item: 60cr; at the end of `ITEMS`). In a corp layer: 50% the layer clears on the spot (normal pay, no perfect), 50% two new ICE nodes glitch in, copies of a decoy already there (`allIn` in engine/run.js). Off in corps with their own tap rules (`ITEM_OFF`). **Items you can't use say why:** tapping one shakes it and the info line shows the reason in red for ~2s (`whyNotItem`: off in this corp, only on the map, integrity is full...).
- **v12.21** (2026-10-22): **mods a corp switches off are shown.** COIN FLIP is off in the drag corps (DECIBEL, SQUALOR, PLAYBALL), QUANTUM in corps with their own tap rules (DEMOLITION, FORM 27B...): `MOD_OFF` in engine/mods.js. The map's corp info says `off here: coin flip.`; inside the corp the badge is dimmed and its tip reads `off in this corp.`
- **v12.20** (2026-10-22): COIN FLIP's coin box always opens above the node (the user); on the top row it covers the header for a moment. Drag up, always.
- **v12.19** (2026-10-22): **COIN FLIP** (EXOTIC, `tap` slot). Hold a node (260ms) or drag from it: a coin box opens over it (above; v12.20: on the top row too) with two node-sized faces, ♥ (integrity) and/or $ (credits, 10 x the multiplier), sometimes both the same (50% ♥/$, 25% ♥/♥, 25% $/$), sometimes a BIG one (♥2 / $25 x). Drag to a side and let go to call it; the coin spins, lands: win that face's prize or lose it (a side bet: the node then opens as a normal pick, ICE still hurts). Each win raises a pay multiplier (x1 to x5, on all pay; the HUD shows `x3` by the credits), each loss drops it one; going up drops a boxed `x N` onto the board with confetti and a jingle. A quick tap is a normal pick; let go anywhere else (or Esc) to skip. Keys: C on a node, left / right, enter. Not in drag corps (DECIBEL, PLAYBALL). `COIN` in engine/mods.js; coinOpen / coinFlip / coinPop in engine/run.js; the gesture in engine/input.js; drawCoin / drawCoinPop in engine/scene.js (overlays clear the characters under them).
- **v12.18** (2026-10-22): the black market's credits line shows your LEVERAGE limit (`credits -40  (limit -150)`, red in debt).
- **v12.17** (2026-10-22): **QUANTUM** (EXOTIC, `real` slot): every corp layer with 3+ nodes gets a second real node (`t.quantum`, random, no tell; not in corps with their own tap rules like DEMOLITION / FORM 27B); tapping either passes; those layers pay half. The odds show `2 IN n`, the hint row says `quantum: 2 real`, the layer line "two are real". With ICE EATER both real nodes bite. `isReal(t)` in engine/mods.js.
- **v12.16** (2026-10-22): **LEVERAGE** (EXOTIC, the user's debt idea as one mod; `money` slot). Credits can go below 0, down to a limit (-150, -100 more a sector: `DEBT` in engine/mods.js); buying, tithes, bids, OMERTA / FRIENDSHIP, CONTINUE? and BLOOD MONEY can all spend into debt (`canSpend` / `creditFloor`, every credit check now uses them). In debt: an ICE hit does nothing with odds debt / 250, up to 60% ("too big to fail", a free block after SHATTER); debt grows 10% (at least 2cr) every layer; past the limit the collectors take 1 integrity a layer (through `hurt`, so BLOOD MONEY / ZOMBIE pay their way). HUD: `CR -120/-150` in red; the tray tip shows the shield odds. Pairs with BLOOD MONEY (a hit you can't pay goes into debt instead of killing you). The debt idea in §16f is now this.
- **v12.15** (2026-10-22): **BLOOD MONEY** (EXOTIC, the user's money-for-health idea; `health` slot, so it clashes with ZOMBIE: the first real MODS CLASH). +100cr when taken; every ICE hit (and every other hurt) costs credits instead of integrity: 20cr x damage, +10 a sector (`BLOOD` in engine/mods.js, `payBlood` in engine/run.js); can't pay = dead ("> broke."), FAILSAFE catches it once (you're left at 0cr); healing pays 15cr a point; BULWARK, firewalls and the other blocks still come first. HUD: `hit-20  LIFE 160cr` in place of integrity. Not locked (ZOMBIE can replace it; it can't replace ZOMBIE).
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

## 17. Ideas backlog: moved

Open work is in [BACKLOG.md](BACKLOG.md) now (2026-10-26). This section, as it was, is in
[archive/SPEC_backlog_2026-10.md](archive/SPEC_backlog_2026-10.md).

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
