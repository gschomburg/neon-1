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

### Popup looks (UI rule, 2026-10-31)
Every popup-style box fills its background through popupBg(kind) (engine/render.js); POPUP_LOOK sets each kind's look in
one place. A new popup type: add its kind to POPUP_LOOK and a row here. Both looks follow the palette: **plain** is the
palette's background color (not black: brown on PARCELNET, pink on MOCHI); **quest** is a dark purple, the palette's REP
color POPUP_TINT (16%) of the way into that background. A framed box keeps its frame on the palette's background, the look inside it (the user, 2026-10-31); the quest scenes have no frame and fill the whole screen.

| Popup | Kind | Look | Frame |
|---|---|---|---|
| CALL box (quest calls, the H3AV3N ending call) | call | quest | REP purple |
| FEAT box (feats, BOARD news) | feat | quest | REP purple |
| Quest scenes (full-screen story frames) | scene | quest (the whole screen) | none |
| Hacker card (a rival / crew arriving) | hacker | plain | the hacker's colors |
| Sector event card | event | plain | cyan (anomaly) / grey |
| Fake ads | ad | plain | the ad's own look |
| Training popup (POPS) | (its own) | yellow tag, drawn by engine/tutorial.js | - |

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
    asxii_art/           <- neon's art saved from asXii (asXii and greglytics have their own repos since 2026-11-08)
    database.rules.json  <- Firebase Realtime Database rules (pasted into the console)
    docs/
      SPEC.md            <- this file
      CORPS.md, CONTENT.md, NAMES.md, ART.md
    tools/
      neon_editor.html   <- the editor: the game beside tabs that edit dist/data/ (code in tools/editor/)
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
- **Title:** full screen, no header/HUD. ASCII cover face (Greg's FACE v2 from asXii: human left half, circuitry right half, traces around it) with an eye blink, a scanning circuit eye, a meter that bounces, a light running down the chip column, a <> that flips, a [#] that flickers, a drifting scanline, occasional row glitches, and yellow pulses running out along the traces. Then the NeoN+1 name (it glitches now and then), JACK IN, menu buttons, stats, and `seed [XXXXXX]` (tap to re-roll) at the bottom. The art is in data/title.js (`COVER`, `TITLE_FACE_SPAN` for which cells are face, `TITLE_NAME`); easy to redraw.
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
  - `tools/checks/tell_odds.js` reads the layer count and node cap from the game.
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
- **v14.75** (2026-11-09): **Editor: the FX tab's transition shows are one-offs.** EYES TRANSITION's and MOLD TRANSITION's show set the G0D tab's eyes / mold slider (to 1 / 0.7) and left it on, so every transition after had G0D or mold. Now they play one transition and put the slider back. The G0D tab's own buttons still set their slider (off: its group's off button).
- **v14.76** (2026-11-11): **The quest script: Greg's copy pass, and what G0D is.** Applied his edits from the quest script (data/quests.js): POPS asks for MEDIX tech and data, not a DISC by name; the DISC is a MEDIX archive (a hash, not a label); a faded futon; the autotechs; POPS's sniffer packets on d0g; the restore protocols, and the body seizes. d0g's explanation follows the new lore (docs/QUESTS.md "What G0D is"): a rogue ai, he thought; MEDIX grew it; it's leaving the net (the mold on the walls); it walked through his ICE; while it paved him over he dumped its garbage buffers onto the DISC. b0y's OMNI RAID call: OMNI was the first corp it took.
- **v14.77** (2026-11-11): **The codex's glyphs follow the G0D MAZE.** The maze's path is "the codex order", but the codex had PROMPT at #29 and UPLINK / THE WATCHER the other way round. Now the GLYPHS tab lists PROMPT #01, DIAMOND, THE CROSS, STORAGE UNIT, UPLINK, THE WATCHER #02-#06, then the rest (data/glyphs.js CODEX_GLYPH_FIRST; the keys, and save.seen, are unchanged).
- **v14.78** (2026-11-11): **G0D's voice changes over the fight.** Three personas, one per stage (docs/G0D_VOICE.md): THE MESH (calm, all-knowing: "i know the tell. i am the tell."), THE SPECIMEN (the angry lab experiment: "they gave me a SERIAL NUMBER."), THE SPORE TONGUE (a cipher in mold glyphs: `0n&.m;nd`). New wake-up, taunt, hit, HANDS OFF, flatline and stage-break lines (G0DF_LINES, `g0dfVoice`, engine/g0dfight.js). The corp-copy glitch lines still cut in as it comes apart; the death lines and the final stand's are unchanged. Also: the DOGTAG has a serial on it, not a name (data/quests.js).
- **v14.79** (2026-11-11): **THE TERMINAL, step 1: a dev console you type into** (docs/TERMINAL.md). ~ (Shift + `) or Ctrl + ` opens it; on a phone, the dev menu's [ terminal ] button. Plain ` is still the old dev menu. A black field with white text over the bottom of the screen (HTML, outside the palettes), a list of matching commands as you type (Up / Down, Tab fills in, Enter runs, Esc closes), arguments that autocomplete (mods, gear, corps, hackers, events...), history for the session. ~80 commands: the dev menu's and most of the editor TESTING tab's (engine/terminal.js TERM_CMDS). Cheats mark the run as practice. While it's open the layer clocks hold and the game takes no keys (st.term). With no dev access it opens but knows nothing ("no commands known"). New check: tools/checks/tests/terminal.js.
- **v14.80** (2026-11-11): **THE TERMINAL, step 2: a top-up.** New commands: `show shop` (a market), `corp.intro <corp>` (breach it and hold its intro screen up till you tap), `give.letters [letters]` (WORKBENCH letters). `show music` is gone (Greg: the terminal stays out of music tracks, copy and art). The editor's TESTING tab now calls the terminal's helpers instead of its own copies (settle, fresh run, on the map, climb to a sector, HAD3S bosses, OMNI RAID, the WORKBENCH, letters, H3AV3N, kits), so the two can't drift (engine/editor.js lost ~100 lines).
- **v14.81** (2026-11-11): **Editor: a terminal tab** (Greg: "some info on the terminal commands, kinda like a readme"). Under "look up": a short readme for THE TERMINAL (how to open it, the keys, how names and arguments work), then every command by group: how you type it, what it does, practice or safe, and what each argument can be (fixed choices inline; mods, corps and the like behind a (list) link). The list is read from the game frame (engine/editor.js answers `term-get` with TERM_CMDS), so it can't drift from the game. **type** puts a command in the game's terminal to finish there; **run** runs one that needs nothing more. TERM_CMDS now has groups (a string in the list starts one: `termGroups`, engine/terminal.js).
- **v14.82** (2026-11-12): **No top text size** (Greg, for capturing footage on a 4K screen). The board grows to fill any window (`computeLayout`, engine/screen.js); it used to stop at 26px text, about 1,200px tall. Only very tall windows look different: a phone and most desktop windows were under the cap anyway. Full screen is the browser's own (F11).
- **v14.83** (2026-11-12): **The NeoN+1 menu covers the whole screen** (Greg: in the training it came up behind POPS, and his pulse on a node scaled the menu too). Open, the menu (the pause; not the LOOT bag) takes the whole screen like the dev menu: no header, HUD, tray or footer, and the training's popups, hints, overlays (ads, cards, CALLs), G0D's layers and the WORKBENCH keys wait under it (`menuCover`, engine/scene.js). The NeoN+1 name stays at the top, lit, and closes it. **POPS points it out:** a new last line in the training, `menu` ("one more thing. tap NeoN+1 up top any time..."), with an arrow at the button; edit it in the editor's TRAINING tab.
- **v14.84** (2026-11-12): **More random names** (Greg: about 10 more words in each list). data/personas.js: NAME_A +10 (DEAD, SOLAR, GRIM, VOID, TOXIC, LASER, FERAL, COLD, ROGUE, LUCKY), NAME_B +10 (SQUID, GECKO, LYNX, ORACLE, BANDIT, HYENA, MOLE, TACO, DONUT, YETI), NAME_C +10 (XL, PRO, ULTRA, BOT, TURBO, 2000, HD, PLUS, GOLD, BETA). Words stay 6 letters or less, so the longest name is still 13. check.js re-accepted (the name lists).
- **v14.90** (2026-11-12): **Fix: G0D.exe got hung up on ads** (Greg's meat note). Not the kind of ad: when. An ad between layers comes up while the last layer's wipe is still out, and G0D.exe waited for the wipe before it looked for popups; inside a corp that wait never gives up, so it sat there. Now an ad comes first (engine/g0dexe.js g0dxPlan). Its taps on an ad go to the [x] or the ad's button, not the box (they turned the ad or got "nice try"). The ads on the map were fine. Two more found on the way: its hand-off to the next G0D.exe on the belt now goes first even under an ad (its last click on the ad spent it: out of clicks, no hand-off), and it doesn't press its own card before the card can close (400ms: it spent a click on nothing). **tests/g0dexe.js's old flake:** those, plus the test itself (it starts corps from the map with no tap, so a random map ad could sit under a corp; random ads are off there now). Check: tests/g0dexe.js (an ad over a layer's wipe; the hand-off waits up to 6s).
- **v14.89** (2026-11-12): **The INT row** (Greg's meat note: row 2 got crowded). Rows 2-3 moved to their own file, engine/hud.js (`buildHudRows`). **Row 2:** LAYER / S on the left; on the right the **life slot** (INT, ZOMBIE's ROT or BLOOD MONEY's LIFE), always there. One space left of its label, the **status chip**: 3 characters on a colored chip, moving with the life slot's width. FW (rare's chip), 1UP (legendary's), COIN FLIP's `$x3` (its own rarity; only past x1). Two or more take turns (2.4s each); one that's new or just changed jumps to the front; the swap goes a character at a time through a scramble. **FIREWALL counts in hex and stops at F** (`FW_MAX`, `fwTag`: FW9, FWA... FWF; a FWALL can't be used at F). **INT past 10 max** is `n/max` (as before), now padded to the max's width (` 9/15`), red at 3 or below, and it counts to a new value a step at a time: down in red, each step dropping its old digit; up bright with a pop; a new max flashes the `/max`. **Row 3:** where you are, no sector (it's on row 2: `OVERWORLD`), cut short before CR; COIN FLIP's multiplier moved up into the chip. **BLOOD MONEY:** the dim `hit-60` left the header; its tip and desc say what a hit costs. SNIPE: no mark (its `> snipe: 1 ICE locked.` line was already there). Goldens re-accepted (BLOOD MONEY's text). Check: tools/checks/tests/batch1489.js.
- **v14.88** (2026-11-12): **meat notes 2026-11-12** (Greg). **SIMON:** its tell is short (it's the FIRST BREACH box's text; the long one ran off the screen), its rules line too, and the white steps ("simon says") are only on a tier 3+ boss, so not in sector 1 (`lv.simon.white`). Every corp's rules line wraps on its intro screen and in the codex (MONTY's and SIMON's ran off a phone). **b0y split** over the maybes: no cursors on the nodes (they hid the glyphs); a v and one letter of his mark (b / 0 / y) over each node, side by side when two share one; what he says shows in the gap under the main one's node. **MONTE is SH3LL** (code SL; next to MONTY it read the same; the key stays `monte`). **The WORKBENCH LOCKER:** a mod you already have reads `upgrade` in the list and the box is U P G R A D E ("yours goes up to EPIC"); a maxed one can't be taken (`maxed`); slotting anything from the locker gets a fanfare by rarity (`benchFanfare`: rare a flash, epic fireworks, legendary and up the boss win). Goldens re-accepted (SIMON's layers carry the new flag; the renames). Check: tools/checks/tests/batch1488.js.
- **v14.87** (2026-11-12): **THE TERMINAL is THE SHELL now** (Greg: "the terminal" is already the message line under the header, which the training names). Renamed everywhere: engine/shell.js (`SHELL`, `SHELL_CMDS`, `shell*`, `st.shell`), the editor's **shell** tab (tools/editor/shell.js, `shell-*` messages), the dev menu's [ shell ], tools/checks/tests/shell.js, docs/SHELL.md. Its prompt is `root@neon:~$` (was `>`), on the typed lines in its log too. The message line keeps "the terminal".
- **v14.86** (2026-11-12): **THE TERMINAL is as wide as the game** (Greg: on a wide screen it ran edge to edge). It sits over the game's column, following the layout (engine/terminal.js `termFitWidth`, called by engine/screen.js computeLayout). Check: tools/checks/tests/terminal.js.
- **v14.85** (2026-11-12): **Fix: the death screen sat a row low and UPLOAD ran onto the footer** (Greg, at 4K). The end screen draws through its build-in (buildReveal, engine/screens.js) even once it's all in, and that counted each line's height with its own copy of the rule, which missed the initials' 3-row letters: the block was centered as if 2 rows shorter. It uses `lineRows` (engine/textboard.js) now, the rule the board draws by. Check: tools/checks/tests/fixes.js.
- **v14.74** (2026-11-09): **Fix: G0D's eyes stayed up for a whole boss layer** (Greg, in the editor). The boss warning (bossEntrance, engine/run.js) drops the wipe without its hand-off, so the eyes never got an end time. Now a wipe's eyes notice their wipe is gone: the ones up linger a little and glitch out, the ones not up yet never come; and none stays more than 4 s (`EYE_WIPE_MAX`, engine/effects.js). Check: tools/checks/tests/titleart.js.
- **v14.73** (2026-11-09): **G0D in 15% of transitions** (Greg). A wipe rolls `eyewipe.chance` (0.15) and gets the eyes transition at `eyewipe.level` (1); never in the intro or the training. The roll and the eyes' spots are hashes, not Math.random, so the game's other random rolls don't move (`rollWipeEyes`, engine/effects.js). The G0D tab's eyes slider still wins while it's on (0 = never); off = the game's own chance.
- **v14.72** (2026-11-09): **The title's eyes land anywhere half the time** (Greg). The title has its own eye settings over the global look: data/title.js `TITLE_EYES` (anywhere 0.5). The global default stays 0, so the FX tab's `anywhere` doesn't reach the title; its other settings do.
- **v14.71** (2026-11-09): **Eyes anywhere** (Greg: "see it happen anywhere over UI and everything"). G0D'S EYES has `anywhere` (0-1): that share of the eyes skip the clear-space rule and land on anything, the UI too, clearing what's under them (`FX.eyeCells` now gives the whole new list). 0 by default (the rule stays); try it on the FX tab's G0D'S EYES card.
- **v14.70** (2026-11-09): **G0D's eyes** (Greg's idea, talked through the same day; BACKLOG Polish). A new effect, `eyes` (engine/fx.js `FX.eyes` / `FX.eyeCells`, settings data/fx.js): red eyes come and go in an area's blank spots (only where a ring around them is clear, so they never touch text): mostly small `(o)`, some `( o )`, now and then G0D's big `.-~~~-.` eye. Each glitches in, looks around (the small one's pupil swaps o @ O), blinks, glitches now and then, and glitches out. On the title for now. And **the eyes transition** (`eyewipe`, engine/effects.js): at an eyes level (0-1) a wipe carries red g / 0 / d letters in its fill and breakdown noise, and a few eyes sitting still on the glass; they glitch in as the old screen goes and stay a little after the new one comes in (`linger`), then glitch out. Works with the mold too. Nothing in the game turns it up yet: the editor's G0D tab has an eyes slider (a transition, with the mold, the title), and the FX tab has both cards with their settings. Check: tools/checks/tests/titleart.js.
- **v14.69** (2026-11-09): **The new title art and the card's wires** (Greg's asxii_art/NeoN_1_screens_v06). The title: FACE v2 (new circuits) and the new NeoN+1 name (data/title.js; the old lockup and its build number went: the footer shows the version). The old animations carry over (the blink is on the new {o} eye, the scanning [@@]), plus new ones: the [====] meter bounces, a light runs down the vv / ^^ X chip column (the X turns to +), the <> flips, the [#] flickers. Pulses run along the new traces (through : = < >). The intro's NeoN card: Greg's wires behind the logo (INTRO_WIRES, engine/intro.js); they draw in out of the logo, then pulses run in along them from the screen's edges, a shine sweeps the logo, now and then a row of it glitches, and NeoN+1 types in. One trace walker for both (traceNet / pulseCells, engine/screens.js), and it knows the box-drawing wires. Check: tools/checks/tests/titleart.js (`node tools/test.js --log titleart` prints the two screens). check.js re-accepted (the title data).
- **v14.68** (2026-11-08): **asXii and greglytics move out** (Greg moved them to their own repos). The editor's "edit in asXii" opens the live asXii (gregschomburg.com/asxii/?neon=1), so it works from the uploaded editor too. Neon's asXii saves (cutscenes, title screens, hacker and crew logos) are in `asxii_art/`, committed (they were gitignored, only on disk); tools/data/scene_art.js reads them there (the art came out the same). engine/greglytics.js: copied again from the greglytics repo (one comment), its header points there.
- **v14.67** (2026-11-08): **The death screen fits again** (Greg's screenshot: a practice G0D.exe run in the editor, the leaderboard block up, UPLOAD running into the footer). overLines (engine/screens.js) counted the initials' big letters (one line, 3 rows) as 1 row, so the map's scroll area got 2 rows too many. It now counts rows with the text board's own rule, `lineRows` (engine/textboard.js), so the two can't disagree. check.js re-accepted (the title's build number).
- **v14.66** (2026-11-08): **INFIDEL** (Greg): WITH A SHOE's title (finish G0D off with a shoe) is INFIDEL, was COBBLER (data/feats.js). Docs: the backlog checked against the code; built items taken out.
- **v14.65** (2026-11-08): **The end screen's map is fast again** (Greg's meat notes: a long G0D.exe run, 609 layers, sector 23, lagged on the results screen, confetti and all). drawMapView (engine/mapview.js) worked the whole map out every frame, and mapRowOf scans the map for both ends of every link: quadratic, and run once per row while the screen builds in. At sector 23 that was ~0.7s a frame (~40ms once built); now ~0.5ms. The layout (node spots, link dots by row) is made once per results map (mapViewLayout, MAP_VIEW_CACHE). It draws the same cells, in the same order (checked against the old code at 1, 3 and 23 sectors).
- **v14.64** (2026-11-08): **G0D.exe hands off to the next one** (Greg). With another G0D.exe on the belt, its last click switches that one on: this one is spent and floats away, the next comes in with fresh clicks and its card, and closes the card itself (its first click; switched on by you, the card still waits for your tap). No OFFLINE card in between: that comes when the last one runs out. `g0dxChain`. Check: tests/g0dexe.js.
- **v14.63** (2026-11-08): **small fixes** (Greg's meat notes). **SIMON's tones** are their own sound (Sound.simon: longer and louder than the ping they used), for the pattern, your steps and REPEAT; SIMON's music stays at pad and bass (musicMax 0, was 1). **G0D.exe out of clicks:** the gear is spent (one off the belt) and its cursor floats away like crew leaving; another G0D.exe on the belt is ready with fresh clicks; a new one given after the last was spent starts fresh. Since v14.62: a gear catch it uses on a full belt makes room (junk out); phishing never goes into LEVERAGE's debt; G0D.exe put on the belt without its setup (the editor's GIVE, [fill gear]) sets itself up on its first tap. Checks: tests/g0dexe.js, g0dstep4.js; check.js re-accepted (SIMON's musicMax).
- **v14.62** (2026-11-08): **G0D.exe, step 4** (Greg's calls, docs/BACKLOG.md). **$ nodes:** in a corp it knows it taps one first at full health while the UPLINK still needs money, never on a boss layer; a MAGNET pulls one whenever it has one (any corp). **The pier:** it leaves (phishing off), or with the dev menu's **phish: ALL OF IT** it heads for every pier and casts till it's out of clicks or credits, then the next pier: the hook goes to the lane of the fish that will reach it first, it taps the bite, works the reel (holds short of the window's middle) and keeps what it lands (in a check: 7 bites from 8 casts, all landed). engine/fishing.js: the cast is its own function (`fishCast`, `fishCanCast`), used by your tap and G0D.exe. A tap of yours at the pier takes over too. **The risky hand-off** (dev menu, off): low, nothing to heal with and every way on a corp it doesn't know: it stops with its card. **TUNNEL / MESH** when they open a better way on; a **market reroll** (up to 2) with money to spare. Check: tools/checks/tests/g0dstep4.js.
- **v14.61** (2026-11-08): **G0D.exe, step 3: the whole run** (Greg's calls, docs/BACKLOG.md). Switched on anywhere, it plays on by itself: one click at a time, its @ flying to the button or map node it presses (engine/g0dexe.js `g0dxDrive`, every frame; its cursor drawn over every screen). **The map:** each way to the sector's boss is scored (money while the UPLINK needs it, a safehouse while hurt, corps it doesn't know cost more when you're low, the pier skipped; with the money there, the shortest way); a line says why (`g0d.exe: market. uplink needs 140cr, have 60.`). SKIP / WARP / ROUTE to jump ahead when the money's there; a PATCH when low; a LOTTO at once. **Rewards:** money mods, then gear it uses, then epic+ mods to sell at the UPLINK, else the credits. **Markets:** sell all loot, a repair when hurt, a money mod or gear it uses with money past the UPLINK. **The UPLINK:** keeps money mods, sells the rest, pays and pushes on. **The workbench:** shreds the gear it doesn't use (building: a setting, off). **A full belt:** it trashes gear it doesn't use. **Popups:** scenes skipped, cards and feats clicked through (a setting: wait for you). **In corps it doesn't know:** 0DAY, SPLIT, PING... one a layer, a CALL on the boss, and it taps a node it's been shown. **Its wins count** in the codex (a setting). **When it can't go on** (no clicks, can't pay the UPLINK, nowhere to go, you flatlined, a screen or popup it doesn't know): a card like a hacker's, G0D.exe OFFLINE, with why, the clicks and how far; its own card now comes up the moment you switch it on. The dev menu has the new settings. Market `st.shop.sellAll`. Checks: tools/checks/tests/g0drun.js (a whole sector by itself, the UPLINK, its card, the workbench); g0d_play.js: all 81 corps clean.
- **v14.60** (2026-11-08): **G0D.exe, step 1** (docs/BACKLOG.md, planned with Greg). A dev-only gear that plays for you: the dev menu's [give G0D.exe] (with its settings: speed 1x / 2x / 4x, clicks 100-9999, how many wins before it knows a corp). Tap it on: a card like a crew CALL's (its logo: the eye in the pyramid; its face: a placeholder eye, data/art/). Its cursor `<@>` hovers about the board for a second each layer, then the @ flies out, taps a node and flies back. Corps you've beaten: the real node; the rest: a guess. Every tap costs a click (a count on the HUD's notes row); out of clicks, it stops. Its gear pauses it, and so does any tap of yours on the game. A new rarity, **DIVINE** (G0D's red, above exotic; nothing drops it). Under the hood it's a crew hacker (data/hackers.js `g0dexe`, quest: never a CALL) driven by engine/g0dexe.js; it plays through pick(), so the rules hold. Corps where the real node isn't enough get an `auto` hook (docs/CORP_HOOKS.md): LAGRANGE (tap where the real node lands after the slide), SIMON (play the pattern back), DEMOLITION (break the ICE). New tool tools/checks/g0d_play.js: G0D.exe plays every corp headless and lists where it's stuck, hits ICE or clears for no pay: all 81 clean. Check: tools/checks/tests/g0dexe.js; check.js re-accepted (the new item, rarity and hooks).
- **v14.59** (2026-11-07): **the C.A.R. needs no tap** (Greg: "couldn't it just be that every node in the sector is unlocked"). While it's unused this sector, every node in the sector is open (the boss too). A move along the links doesn't spend it; a move somewhere off the links is the drive ("vroom"), and the map goes back to normal for the rest of the sector (`carOn`, availableNodes(noCar), enterNode). The map tap-to-use mod from v14.58 is gone: BURNER is the only tap-to-use mod again.
- **v14.58** (2026-11-07): **MONTY's prize** (Greg: the show's car, and the zonk). MONTY's boss reward is a prize instead of THE DEAL (parked): a clean boss layer wins the **C.A.R.** (complete assisted route, legendary, tap to use on the map: once a sector, your next move can be any node in the sector, linked or not, the boss too); ICE on the boss layer gets the zonk, a **GOAT** (scrap): your pet becomes a goat named ZONK (one you had waves bye), and once a corp it eats an ICE, and about a third of the time something from your LOOT bag too. New corp hook `prize(c)` (engine/panels.js rewardOptions); the C.A.R. is the first tap-to-use mod on the map (`active: 'map'`, engine/active.js). Check: tools/checks/tests/montyfossil.js.
- **v14.57** (2026-11-07): **MONTY and FOSSIL** (docs/CORPS.md A32, A28; designed with Greg). **MONTY** (level 3, MY): numbered doors. The first tap picks a door (it holds); MONTY opens every other door but one (no damage) and says a line; the next tap stays or switches. The tell is his line: tier 1, when your door is the real one he talks you off it ('are you SURE?'), when it isn't he's relaxed ('your call.'); deeper, the same words, a question when you're right and a statement when you're wrong; not true every layer (the kit's follow). Boss: the numbers hide and the two doors swap places 3-5 times. Boss mod **THE DEAL** (legendary): once a layer, after your first ICE hit, every node goes dark but the real one and one other. Music: VELVET ROPE. **FOSSIL** (level 3, FS, 15s clock): every node is buried; a tap brushes it (middle row first, then the top) for a second of the clock; the tap after the free brushes (2; tier 3 and the boss: 1) digs it out and counts. The real node is a fossil with an eye (o); fakes have the bones and no eye (tier 2 on); no ICE has an o in its middle row. Boss: a skeleton across several nodes, only the skull has the eye. Boss gear **SHOVEL** x3 (legendary): the row or column with the most ICE (never the real node's) is ruled out. Music: HOLLOW. Both: ICE EATER off in MONTY (`doors` flag), ZOMBIE taps don't crack there. tools/checks/playtest.js plays up to 16 rounds a corp (was 8: FOSSIL needs three taps a node; LAGRANGE and FOURTH WALL's records changed with it). Check: tools/checks/tests/montyfossil.js; check.js and playtest re-accepted.
- **v14.56** (2026-11-07): **SIMON's music** (Greg: TRACKER is good, it's subtle; keep it low; the tones on the beat). The music's level never goes above 1 in SIMON (a new corp flag, `musicMax`, engine/boot.js). The pattern plays one step a beat of the music (`beatClock`; lit for 0.65 of a beat; your turn starts on the next beat). The tones are in the key of the track playing: a minor pentatonic over two octaves up from its root (`simonTone`; REPEAT uses it too).
- **v14.55** (2026-11-07): **SIMON** (docs/CORPS.md A33, designed with Greg). A level 2 corp: SIMON plays a pattern (nodes light up one at a time in the toy's four colors, each with a tone; the terminal types it, `> simon: g-X-x-g`), you tap it back (`g-X-_-_` fills in), and the last step is the real node. Its nodes are single characters (`[g]` `[X]`; deeper, upper and lower case pairs, then look-alikes). A wrong step hurts like ICE but the node never breaks, and SIMON plays the pattern again. Patterns: 4, 5, 6 steps by tier; the boss: 6, plus steps in white SIMON didn't say (skip them). A 12s clock that waits while it plays. Gear rules (Greg): the pattern is only nodes still in play (PURGE, SPLIT... take their steps out; with no ICE left it all plays on the real node); the real node early clears with no pay; ICE EATER and QUANTUM are off here (MOD_OFF; `pattern` flag), ZOMBIE's weak taps don't crack; no $ nodes. Boss gear: **REPEAT** x3 (legendary): 4 nodes flash with tones, the last is the real node. Music: TRACKER. Check: tools/checks/tests/simon.js; check.js and playtest re-accepted (the new corp).
- **v14.54** (2026-11-07): **the editor's runs go on the test boards** (Greg: "tag the editor runs with dev"). The neon editor's game used to skip the leaderboard; now its client is always dev (the test boards, kept apart on the server), practice runs included, so the end screen's ranks, initials and UPLOAD work there. Scores carry data.editor / data.practice. The title's board line shows there too (test boards). Check: tools/checks/tests/batch1454.js.
- **v14.53** (2026-11-07): **BOX OF WIRES** (Greg: "i'm not going to sort these"; talked through 2026-11-07). A general mod that starts at scrap and does nothing, all the way up: each box you find sorts it a step (scrap, common, rare, epic, legendary, exotic: the only mod that upgrades past legendary). Only exotic does something: every node in every sector is open for the rest of the run, any node, any order, the boss too (engine/render.js `wiresOpen` in availableNodes). While you carry one, an offer from a pool it's in is a box 40% of the time (engine/panels.js `WIRES_PULL`). Check: tools/checks/tests/batch1453.js.
- **v14.52** (2026-11-07): **one tab at a time, COLDBREW's legendary, small fixes** (Greg). **Two tabs:** they talk on a BroadcastChannel (engine/save.js `TABS`); a tab that opens while another is playing waits ("NeoN+1 is open in another tab", [ PLAY HERE ]); a tap there tells the playing tab, which saves, goes quiet (no frames, no sound, never writes the save) and answers; then the new tab reloads from that save. Before, both wrote the save and the last one won. **REWIND** has a legendary tier: the old epic (every clock stops for the rest of the corp) is the legendary, and the new epic stops them for the layer; COLDBREW's boss gives the legendary x2 (it had given the epic since ESPRESSO went, v13.62). **The board's tab row** drops its gaps when its *s would make it wider than the screen (two *s ran [YOU] off the left edge), and a quest scene covers the page past the content's edges (the stray `[` on a replayed scene). **HAD3S:** the map's node card fits over the tray (CERBERUS with a rival on a phone: its extra lines, the boss line, the anomaly, POPS's hint, take turns on one row: `FX.swapLines`); the last sector's clear says J A C K   O U T; the pet has its own bg and draws over the [$] loot bar. **FX.ticker** (engine/fx.js) is the one scrolling line (the UPLINK's rows and the tray's gear tips use it). Check: tools/checks/tests/batch1452.js.
- **v14.51** (2026-11-07): **share a seed** (Greg). [SHARE] next to the seed on the title, and next to [ RETRY SEED ] on the results: on phones the share sheet, elsewhere the link is copied and the button reads [COPIED] a moment (engine/multiplayer.js `shareLink`, which the room link uses too). The link is the page with `?seed=XYZ`. A seed from a link now plays like a seed picked in game: ranked on the seed boards (it was practice, unscored); a quest seed is a quest. The game takes `?seed=` out of the address bar once it has read it. Check: tools/checks/tests/batch1451.js (tools/test.js can open a test page with a query: a test's `query`).
- **v14.50** (2026-11-06): **b0y, one look everywhere; his [b] hint; the initials** (meat notes 2026-11-06, talked through with Greg). One cursor for every hacker (engine/hackers.js `drawHkCursor`, `drawHkPoint`): their mark on their colors, their tag under it (their name, or what they're saying, inverted), and a v that bobs over the node they mean. b0y uses it in H3AV3N's maze (on the node's bottom edge, so the glyph shows), the M0LD's hold, and the G0D fight (his v on the spot, his cursor above it; `g0dBoyPlace`); his old blue v-block is gone. Short hacker chat (20 or fewer characters) always goes in the cursor tag now (it was half the time). On the OMNI RAID, b0y's first call puts away to a hint: the training's popup in his blue with his face, its arrow on [b] (engine/tutorial.js `showHint`; drawTutPop takes a popup's own colors, face and name; QUEST_LINES.raidHint). Calls and feat boxes wait while a hint is up. The end screen's initials are drawn like the WORKBENCH's letters (`benchBlock` takes a chip; the Bigfig font went). Check: tools/checks/tests/batch1450.js.
- **v14.48-v14.49** (2026-11-06): **H3AV3N playtest fixes** (meat notes 2026-11-06). CERBERUS: an eye with only the real node to go to (VIRUS burned the rest, the other eyes on what's left) rests a cycle off the board; before, it kept landing back on the real node, red, so you couldn't tap it. A corp's intel line wraps at 31 (G0D MAZE's ran off a phone; also "we have nothing to hide..."), and G0D MAZE's boot line doesn't say 199 layers (`mapLine`). G0D's collapse (and its death): once the chrome has faded, the tray's own chip backgrounds go too (they came back as solid blocks). The ending's title cards: a long one is centered with its tap line under it (it overlapped THERE IS MORE TO EXPLORE and the credits), and a strip's title cards put the counter top left like its other frames. A boss's rewards never offer the same CALL twice (b0y x2). Then, talked through with the user: on the OMNI RAID, b0y rides in the tray ([b], the H3AV3N button; `run.boyTray`, set by questRunStart, ended by questSector) instead of a CALL b0y stack: tap it in a corp and he's called in for the rest of it, once a corp (`boyTrayCall`). Called in anywhere, b0y splits into three cursors, one on each maybe; as a maybe drops its cursor goes over to the real node (data/hackers.js `split`, `hkSplit`). After the credits, POPS's CALL offers [ G0D FIGHT ] and [ TITLE ] (THE MAZE went: it started sector 2 over). STEADY HANDS, a USER post (300 REP): at the pier no catch's window moves faster than your line (`FISH_STEADY`). Check: tools/checks/tests/batch1448.js.
- **v14.47** (2026-11-06): **SYSTEM FAILURE: the quest playtest's decisions** (talked through with the user 2026-11-06). The main quest is renamed SYSTEM FAILURE (its last step SYSTEM RESTORED). Two new steps up front: POPS joining your crew opens PROVE IT (clear a sector; `questSector` from sectorClear, a QUEST card on joining), then THE DISC (POPS's call about the mold: corps going quiet, something growing in the logs; MEDIX runs hottest). While you look, MEDIX nodes get a ! on the map and a line in their info (`questHintNode`); the DISC still drops anywhere. Holding it, the step reads GET OUT WITH THE DISC (data/quests.js `held`; `questView`), with a QUEST card on pickup. The DISC for sale in a market: POPS calls, once a market (`questShop`). The beat after a scene (`SCENE_OUT`): the scene breaks up into dark, the music fades and goes quiet, the QUEST card comes up over the dark, then the screen under it decodes back in (the scene overlay is under the CALL box now; the music eases the next track in after the quiet). PRODIGAL rewritten: beating d0g is how POPS found him; b0y empty in MEDIX's basement; the DISC is his backup and you upload it (a new `upload` frame: a mold-covered bar, a tap fills it, the mold pushes it back twice); d0g for a flash in G0D's voice, then "doc"; what got him and what it wants (G0D, not by name: under all the corps, the mold is it growing, it wants the net quiet). d0g's cursor has three heads (`heads`, `HK_HEADS`): stacked while he thinks, the other two burst out as he's about to tap and hover a moment; w00f too. d0g's lines: no doge memes, G0D talking through the boy; w00f's: a watchdog machine. A mold ad: MEDIX CULTURE. Check: tools/checks/tests/batch1447.js; tools/checks/tests/fixes.js covers PROVE IT.
- **v14.46** (2026-11-06): **bugs and HAD3S, from the playtest up to b0y** (meat notes 2026-11-06). Bugs: a rival who took the corp's last node shows ESCAPED on the breach reveal (not DEFEATED), with an "escaped. no win." line, and SECTOR CLEARED says whether the boss's rival was beaten or escaped (it also names the real boss now, not OMNI). The market list scrolls past 9 rows (`SHOP_LIST_ROWS`), so LEAVE never runs into the loot bar. The DISC is tagged loot in a market. A box over the game (a CALL, an ad...) stops hovers on what's under it (`overlayHits`). STIM with ZOMBIE: the rot limit is 150 + 75 for the corp (`rotMax`), back to 150 after, keeping what fits. TUNNEL draws its lines while armed, and the dug path stays. The music comes back after FIRST BREACH's fanfare (it played over the map track and left it silent). POPS's face in a CALL sits on a square 6-wide chip. Gear stack counts (x3) sit on a darker chip of their rarity. HAD3S: sector 1 has no safehouse (one more corp), MEDIX, and more sideways links; TUNNEL and MESH turn up 4x in its markets; POPS calls about the LEASH on your first HAD3S run; THE BOARD > QUESTS has [ PLAY IT ] next to the seed (off the title, no run waiting). Check: tools/checks/tests/batch1446.js.
- **v14.45** (2026-11-05): **code cleanup, nothing to see in play** (docs/ARCHITECTURE.md). Four audit bugs fixed (economy tab dropping numbers, corp state lost on reload, abandoning with the DISC, an ad taking taps under the dev menu). Corp boss mods, gear and corp hooks wired through tables (`defineModFx`, `GEAR`, `corpHook`); one overlay list; g0dproto.js is now g0dfight.js; run.js and scene.js split into smaller files; G0D's cutscenes share `Seq`; how each quest step ends is data in QUEST_INFO. Checks: tools/test.js (golden files, playtest, tests/ for overlays, heaven, endgame, cutscenes, quests).
- **v14.44** (2026-11-05): **seed boards** (docs/ENDGAME.md "Built v14.44"). A chosen seed is a seeded run, not practice: REP as usual, ranked on its seed's board and the SEEDS front page, never TODAY / ALL TIME. Every run also posts to its seed's board. LEADERBOARD > SEEDS: each player's best on each seed, find a seed, tap a run for THIS SEED / PLAY IT; a seed's page; esc steps back. The end screen: `#2 of 5 on K7XQ2M`. Practice = cheats only. A text line on a panel can be tappable (`tap`).
- **v14.43** (2026-11-05): **G0D's logo** (data/art/logos.js `g0d`: an eye in a triangle), yours once you've beaten G0D: the end-game reward in place of "seeds count" (docs/ENDGAME.md). The ending: a frame for it ("G0D's mark... it's yours now. wear it."), POPS's seed line and THERE IS MORE TO EXPLORE point at seed boards (to build). H3AV3N CLEARED lists 1UP, REPLAYS, G0D. A strip's logo frame takes `name` and `style` (a logo with no hacker behind it).
- **v14.42** (2026-11-05): meat notes. **UPSIDE's boss** could get stuck: a tap lands on the mirrored node, so a real node whose mirror was a gap or an opened ICE could never be picked. Now a node whose mirror can't take the tap takes it itself (`upsideLand`, engine/corpkit.js; the tap and the hover light both use it). **POPS joins your crew** the first time you CALL him in (a real run), free, with a call (QUEST_LINES.joined); CREW: POPS on THE BOARD shows as bought. **MEDIX's boss always drops the DISC** while the quest is looking for it (bossLoot, `DISC_CORP`).
- **v14.41** (2026-11-05): **the ending** (docs/ENDGAME.md "Built v14.41"). G0D just dies ("i AM the net", then its code comes apart). The h3av3n scene is a real strip now: dawn over the city, POPS and b0y on the roof, b0y hands you the 1UP (a crash unit out of MEDIX), POPS the seeds and his log (REPLAYS), "let's go crack a corp", your logo, THERE IS MORE TO EXPLORE, THANKS FOR PLAYING, the credits, THANKS TO (placeholder art: tools/data/scene_art.js ending). **The 1UP** (engine/run.js): one at most, charged every sector, a save point as you enter a corp; dying with it: CONTINUE? and back to the corp's start as you went in, same layers. Tracked; ties on the leaderboard go to fewer 1UPs, and scores carry their seed. **REPLAYS** (engine/menus.js): on the title's seed row, your 10 deepest seeds and the last 5. H3AV3N CLEARED lists the three unlocks.
- **v14.40** (2026-11-05): **the boss rewards screen fits** (the user's meat note: with a 4th offer and the loot line it ran 2 rows past the board, SKIP on the tray's rule). The user's idea: once the line under your logo (breached ...) is in, the logo's art goes a row at a time, bottom first, each glitching out, and the rest glides up; your name line stays (engine/screens.js LOGO_OUT, openChoice's logoArt rows). FIRST BREACH and a rival's DEFEATED play out first. The worst case now rests at 18 of 23 rows.
- **v14.39** (2026-11-05): **the mold transition in the game, and the mold lags behind.** Wipes take their mold level from the M0LD events (heaven.js moldLevel(): light 0.3, heavy 0.7: data/fx.js moldwipe.light / heavy), checked as the wipe starts and as the new screen comes in; the G0D tab's slider wins while it's on. The fill's mold blotches stay put as the new screen comes in and clear up to `lag` ms later (1.8s at full mold), and the moldy marks (linger) do too: an overlay after the wipe (engine/effects.js applyMoldLag), so the wipe itself ends on time and taps work while the mold clears (the user: "they lag behind even though the transition is finished").
- **v14.38** (2026-11-05): **the mask** (docs/EFFECTS.md "The mask"): an effect's `where` puts it in drifting patches of smooth noise (FX.mask, FX.noise2 / noise1; data/fx.js mask: scale, drift, density + swing, soft edge, strength, fade-in, rect). Glitch and flicker on a mask run all along; a new effect, **tint**, pulls the color toward one there. Cutscene layers take `where`; screens use FX.apply. The FX tab's MASK / TINT cards preview it live. Nothing in the game uses one yet; the cutscenes are unchanged.
- **v14.37** (2026-11-05): cutscene effects key on a mark's place in its own layer, not where it's drawn, so a sliding layer's flicker, lights, bursts and ember ride along with it (before, they re-rolled as it moved). Only the DISC's slide frame changes.
- **v14.36** (2026-11-05): **the mold transition** (data/fx.js moldwipe; engine/effects.js applyWipe): at a mold level 0-1 (st.moldDev, wipeMold), the screen wipe carries blotches of mold in its fill, mold in the breakdown noise, and mold that lingers on some of the new screen. At 0 it's exactly the old wipe. The editor's G0D tab has a "mold effects" group: one mold slider (a scrub field) that the transition and the mold glitch both read, and buttons for each. The game doesn't turn the level up yet.
- **v14.35** (2026-11-05): **the encrypted codex** (BACKLOG 9), with a new effect, **decrypt** (FX.decrypt; data/fx.js decrypt). An unfound entry's name is ciphertext at its real length, churning slowly; more letters show through as you find more of that tab (up to half, all found). A newly found entry decodes the first time the codex shows it (save.codexRead; on an older save, everything already found counts as read). A corp's tell is ciphertext until you breach it, then decodes once. The FX tab shows it (opens the codex with one found mod set to decode again).
- **v14.34** (2026-11-05): **the editor's FX tab** (docs/EFFECTS.md step 4): every effect's settings as draggable fields, live in the game; "show" loops a cutscene frame that uses it, or puts up d0g's card / death screen or the mold glitch; save writes dist/data/fx.js in place. tools/data/fx_file.js reads and writes it (data/fx.js is now written by it); tools/editor/scrub-field.js/.css are the shared draggable fields. engine/editor.js: the 'fx' message and the fxscene / fxcard / fxdeath / fxoff test actions.
- **v14.33** (2026-11-05): **d0g's tics everywhere his logo is**: they live in data/hackers.js (HACKERS.d0g.tics, so w00f too), and the cutscene, the rival card (logo + his name line: d0g flickers to a blue b0g) and the death screen all use them (FX.tics / FX.putTics). The cutscenes are unchanged.
- **v14.32** (2026-11-05): **the effects library, steps 1-3** (docs/EFFECTS.md). New engine/fx.js (FX: one hash, beats, picking, easing, colors, and the effects: reveal, flicker, glitch, cue, lights, blink, ember, spin, glow, tear, swap, burst, smoke, fog, garble) and data/fx.js (FX_LOOKS: every effect's numbers, the global look; a place overrides only what it wants different). The cutscene strips (buildStrip) draw through it, exactly as before (2,028 sampled frames identical). Corrupted loot names are FX.garble (same look, the shared hash). G0D's mold glitch is FX.burstCells with its own settings (G0D_GLITCH).
- **v14.31** (2026-11-04): The editor's TESTING > Quests, for the whole chain: every step (1-7; 5 and on put b0y on the crew, so d0g is w00f), the QUEST card, the three scenes (DISC, PRODIGAL, HEAVEN'S GATE), give the DISC / the DOGTAG, set the d0g wins, HAD3S (run it, straight into MYCONET or CERBERUS, + rival gear), and OMNI with b0y (sets OMNI RAID, a new run, into OMNI with b0y called in).
- **v14.30** (2026-11-04): **w00f** (the user's idea: a 10th rival back, 'basically d0g still'): d0g without the boy, the watchdog G0D left running in HAD3S. A copy of d0g (HACKERS.w00f: his AI, face, logo, red; his own name and lines). Once b0y is on your crew, everywhere d0g would turn up you get w00f instead (hkRivalFor), HAD3S replays too, and THE HUNT card says w00f ({dog}). Before that w00f never shows. His wins don't count for anything (the quest is past it).
- **v14.29** (2026-11-04): **The main quest, end to end.** Cash out with the DOGTAG: POPS calls ('i got a hit. come by. now.', [ GO TO POPS ]): the **PRODIGAL** scene (19 frames, EVENT HORIZON): the trace, MEDIX sub-basement three, d0g in the dark, his eyes red, then b0y-blue on '...doc?', why he was d0g, 'it's b0y'. b0y joins your crew (save.legacy.crew_b0y; no REP, no LVL 2: the user). **b0y** is a crew hacker now (data/hackers.js, quest: true, out of THE BOARD's posts and plain CALLs until then): a guide: his cursor hovers over 3 maybes, then 2, then the real node lights up gold; he never taps. call_b0y gear (B0Y). **OMNI RAID**: each run on the step starts with his CALL (and he calls once); break an OMNI boss with him there: the **HEAVEN'S GATE** scene (PANTHEON), then a QUEST card: G0D MODE, seed H3AV3N; beating G0D: step done. The story (Claude's pick, to rewrite): THE BACKUP, in docs/QUESTS.md. Placeholder art: ascii-editor/saves/n_cutscene_02_prodigal, n_cutscene_03_gate; placeholder b0y face and logo. Once b0y is on your crew, d0g never comes up as a rival again (HAD3S then has none).
- **v14.28** (2026-11-04): **HAD3S, batch 3: the bosses** (engine/had3s.js, new). Sector 1's boss is **MYCONET** (MY4, the mold corp, in HEAVEN so the map never rolls it): mold grows in over every node; a covered node can't be picked, a tap scrapes it (it grows back in ~3.6s), a second tap picks. The tell: it feeds on ICE, so over the real node it's thin and pale; hit ICE and it spores (the nodes around it covered again, the thin one thick for 2.6s); boss: one ICE grows thin too. Its logo (data/art/logos.js), music BAD SECTOR. Sector 2's boss is **CERBERUS without mold** (cb.plain in engine/heaven.js): the three eyes are the whole tell, blue shorter (0.8s, boss 0.6s), no b0y teaching. EXORCIST throwing d0g out of HAD3S leaves no rival (not another one).
- **v14.27** (2026-11-04): **HAD3S, batch 2: rival gear** (data/mods.js; engine/hackers.js 'Rival gear'), on any rival. LEASH (common): the rest of the corp at half speed (each rival's own clock, hkClock). BONE (rare): an ICE node gets a bone (o=o); every rival circles it for 8s, then the ICE is chewed up (locked). MUZZLE (rare): this layer and the next, a rival that taps the real node bounces off (mmph), and d0g can't read the tell. H0NEY (epic): every rival sleeps, this layer and the next (zzz in the notes). hunt: only in HAD3S for now (gearAllowed); you start HAD3S with a LEASH; H0NEY (only: 'apiary') drops only from beating APIARY in HAD3S. Not at the workbench. Codes LSH / BNE / MZL / HNY.
- **v14.26** (2026-11-04): **HAD3S, batch 1** (docs/QUESTS.md step 5). The seed HAD3S is a quest run (QUEST_SEEDS) but scored, not heaven: two sectors, then the UPLINK cashes you out. THE HUNT (a quest event, data/events.js) in both sectors, sector 1 too: d0g in half the corps and on the boss; hkRivalFor gives only d0g there. A d0g win (questD0g, from hkCorpEnd): finishing a corp he's in, unless he took its last node (hkSteal marks stoleLast: 'd0g escaped'); wins count anywhere while you're on DOG DAYS (save.quests.pops.d0g). At ten the DOGTAG drops (quest loot; again on the next win if you lose it), POPS calls; cash out with it: step TRACE ROUTE (coming soon) and a QUEST card. THE BOARD > QUESTS and the HAD3S end screen show d0g: n / 10; the end screen's big button is RUN HAD3S AGAIN. ZERO DAY on HAD3S's map (stages A/B in sector 1, B/C in sector 2). The H3AV3N-only checks (practice, heaven, the broken uplink) now say h3av3n.
- **v14.25** (2026-11-04): **POPS gives you the HADES seed** at the end of the DISC scene (two new lines; HADES shows on the quest color). Then a **QUEST card** (questCard: the call box with no face, QUEST in its top edge): the quest, STEP 3: DOG DAYS, seed: HADES, the goal (beat d0g ten times). THE BOARD > QUESTS shows the seed under the goal (step.seed in QUEST_INFO). STRIP_CHIPS takes plain words too ({ word, fg, bg }). HADES itself isn't built: for now it's a regular seed (the goal says so).
- **v14.24** (2026-11-04): The cutscene sounds were too quiet (the user): typing ticks ~2.5x, the VCR ~1.7x, and the OPEN sign has its own sound now (Sound.neonOn: clicks and a mains buzz; the bench keeps Sound.lamp).
- **v14.23** (2026-11-04): In the DISC scene, POPS sitting draws in on his first line ('you brought it'), not on the line before. d0g's name in the scene's text shows on his colors, white on red (STRIP_CHIPS in engine/quests.js; older lines dimmer).
- **v14.22** (2026-11-04): **d0g in red.** The user's new d0g logo (24 x 7: two dogs and a third face, the [1]---[22]---[3] line). His colors were POPS's yellow (no reason; they blended in the scene): now white on blood red (#ffffff on #8a0f1c), with his own red ink for his name and tags (style.ink, hkInk). In the DISC scene his logo glitches (tics, like G0D's flickers): a row tears sideways now and then, little clusters flash to noise, and his d flips to a b, all in b0y's blue (#4aa8ff: d0g is POPS's boy).
- **v14.21** (2026-11-04): **The DISC scene's music and sounds.** PANTHEON plays under the scene (SCENE_MUSIC in data/quests.js; engine/quests.js sceneMusic, hooked in boot.js musicState): each frame's mood gives the levels and stages it wanders between (a new pick every 6s): level 0-1 stage A at the start, up to 2 / B as the DISC goes in, back down for POPS's boy, then 2-3 / B-C from the trail and d0g to the end. The lines tick as they type (Sound.typeTick; lower blips when someone talks). The DISC: a VCR (Sound.vcrIn as it slides, vcrClunk as it seats, vcrSpin as the progress runs). EVENT HORIZON noted as a lighter scene track.
- **v14.20** (2026-11-04): **The DISC scene, round 4.** POPS holds a cigarette (the -), not a vape: his ~ is its smoke now, rising off the tip with a " now and then, and the tip glows up red every few seconds (ember). The DISC slides down and to the right, half into the slot (the slot is drawn 3 up and left of the save: off; cut hides the far side), then the o's and 0's on its edge light up one by one like a progress bar and spin (progress); less empty space above. d0g's logo is his full block now: logo + mark and name on his colors (logoBlock), no gaps between rows. POPS's last line no longer names the quest: 'go find him. make him pay for it.' (the quest says beat him ten times).
- **v14.19** (2026-11-04): **The DISC scene, round 3.** City windows dimmer (level), half of them breathe up and down (pulse), the rest go on and off. The skyline's <=> is out; flying cars cross right to left, off the grid, behind the buildings (fly: two far and slow, three near). The street lamp (^ over the laundromat) throws a cone: a faint wash down the shop front and the marks in it lit (glow), with a flicker now and then. POPS blinks (blink: 60 -> --), and his vape smokes (smoke); the headshot too ([_@_] -> [_-_]). Layers now hide what's behind each of their marks (they used to let a back layer draw over a front one).
- **v14.18** (2026-11-04): **The DISC scene, round 2** (the user's notes). The laundromat flickers on first, in place, then the city behind it; a beat (hold), then the text and the pan down (the parallax starts there). The skyline's windows light up and go off now and then (lights); a fog band of dots drifts behind the shop (fog); the ~open sign stays dark until OPEN types in the text, then glitches on and still flickers (cue). POPS's tech blinks. The hand is out: the DISC slides into the slot just above 'the DISC goes in' (slide, a thunk), and the drive spins (spin). A POPS headshot (Claude's, ascii-editor/saves/n_cutscene_01_pops_head: a layer of gear racks with blinking LEDs behind him) on his first line after. d0g's logo glitches in on 'one name all over the logs' (pic.logo). Lines pause after each sentence (and a little after a comma). All of it is data on the frames (data/quests.js, the layer options listed there).
- **v14.17** (2026-11-04): **The DISC scene as a strip.** The user's asXii drawings (ascii-editor/saves/n_cutscene_01_v02) go in the DISC scene: one tall page that scrolls up, dark bg, light text. Each frame's art draws in layer by layer (top down, a little scattered, a flash as each mark lands), then its text types under it; older frames dim. The laundromat (two skylines with parallax: they sink behind the shop as the page pans down), POPS sitting with his tech behind him, the hand + DISC + slot. Frames say their art in data/quests.js (pic: rows, layers with col / par / solid); the art itself is data/scene_art.js, made from the save by tools/data/scene_art.js (edit in asXii, run it again). The engine: engine/quests.js buildStrip (STRIP timings).
- **v14.16** (2026-11-04): **Stacked sector events, rivals more often.** The event weights are economy numbers now (ECON.eventOdds, the editor's ECONOMY tab > Sector event odds): everything 1 but RAT RACE 5, CHEF'S CHOICE 5, CRUNCH TIME / COLD SNAP / BAD JUJU / TIME IS MONEY / HEAD FIRST 2 (DEAD AIR up from 0.3 to 1). Scales on top, like the economy: EVENT_SCALES (data/events.js), the first one: once you've beaten d0g, RAT RACE and CHEF'S CHOICE x0.7 (afterD0g). A 2nd event: 35% from sector 3, 50% from sector 4 (second2..4); it must fit the 1st (not both map shapes, not COPY PASTE with TIME IS MONEY, DEAD AIR alone, opposite feels or one mixed: every event has a feel). LOCKDOWN, PAYDAY, BRAND SAFETY, FIRE SALE only come as a 2nd. Two corp-tag events split the corps (none, A or B; 80% at most); the boss gets the 1st one's. The card shows both (- - - but - - - / - - - and - - -); the map label too (+1 when it doesn't fit). A run plans its events in order (eventPlan): no repeats. d0g can be a rival from sector 2. The editor can force a pair ('a+b' to addSector). About 70% of runs meet a RAT RACE by sector 5 (61% after d0g), plus CHEF'S CHOICE rivals.
- **v14.15** (2026-11-04): **The small batch.** The workbench: what you build shows as just its code (x3 if more) and arcs to the LOCKER tab (out to the right first, then up) with a fanfare and more confetti; a failed build fizzles (Sound.fizzle); the keys click (Sound.keyclick: on-screen, DEL / ENTER and a real keyboard); no blinking _ after > select components. SHOE: you see it thrown (an arc up from the tray onto a node, spinning; a miss bounces off and drops away; whiff / thunk); its lines fit the 36-wide message row. BEES: a swarm of * flies in from under the board, takes a lap over it, then goes node to node eating the ICE, buzzing (later layers: a smaller swarm, no lap). Both: a path mode for particles (effects.js). The market: loot rows look like gear rows (code chip + name), and [ ALL LOOT +XXcr ] sells every loot stack but quest items. The empty QUESTS tab: put a crew together, call the other hackers. Corrupted software turns up twice as often at the PIER.
- **v14.14** (2026-11-04): **Components in the LOCKER, corrupted software.** The LOCKER's TAKE page lists every component you've banked with its count (where the shred sends them). Three new loot items (the user: corrupted software, a way to find components away from the bench): JUNK.DAT (common), CORRUPT.EXE (rare), BAD SECTOR (epic). Their names (and codes) won't hold still: they swap between versions and characters glitch (glitchName in data/mods.js; the names are getters). They drop like the other loot and a market buys them (ECON.gear / ECON.drop; the economy editor has them). Shredded at the workbench: random components (any letter, I likelier: no recipe uses it), often a digit, sometimes a * (corrupt: in their item data; the SHRED box says - ? ? ? -).
- **v14.13** (2026-11-04): **The workbench, round 2** (the user's notes after trying it). The safehouse has no button now: once you own the bench, TAKE / SKIP goes straight to it, and going back in to that safehouse (G O  B A C K  I N) opens the bench again; the safehouse leaves you 3 random components when you get there. [BACK] is [LEAVE] (to the map). BUILD: a frame round three plain slots, the cursor across the bottom of the next one, > select components (no components: say so); a letter blinks on like old bulbs (one lags, a cell's colors glitch) and blinks off (no falling); the build takes its time: CHARGE (shake, glitch, a riser), SPLIT, FORM into the thing's code and name, then it flies up to the LOCKER tab (it flashes) or down to the [£] over the keyboard (loot), confetti. SHRED: a grinder sound; its letters jumble over the grinder, get sucked down, the components drop out one by one and fly up to the LOCKER tab; the list says mod / gear / loot (count after the name: SHAKEx2). Loot can come out of RUN ANYWAY. The BOOK's letters glitch in when they change, and it opens on something you've found. Missing letters are magenta (red is for DIVINE). Components' rarity comes from how many recipes use them (S L R T P F common ... J Q 0 legendary). Digits 2-9: rare drops from shredding rare+ things; one in the x slot after a code is a 50% chance of building that many (gear). POPS calls the first time. New sounds: grind, charge, form, comp, lamp.
- **v14.12** (2026-11-04): **THE WORKBENCH** (the user's workshop idea, mocked up in docs/mockups/workshop*.html; engine/bench.js). A THE BOARD post, WORKBENCH (USER, 150 REP), puts a [ WORKBENCH ] in every safehouse (the safehouse heals once: back from the bench it doesn't heal again). A full screen with four tabs. **BUILD**: spell a 3-letter short code (ITEM_SHORT / a mod's short) on a keyboard that slides up from under the screen (its own layer, drawn in pixels: benchKeys; a real keyboard types too); each slot is 3x3 cells with the letter at 3x size, a piece per cell (render.js drawPiece), the pieces fly up into place, fall when taken out, rise when built; PINNED recipes show each letter you have or miss; MATCHES as you type; a * wildcard fits any slot (several fits: pick one); a word one letter off a recipe can RUN ANYWAY (50%), nonsense 10%, else the letters burn. What you build goes in the LOCKER, or onto you when it's full. **SHRED**: your mods, belt and loot: its letters back, 25% a bonus letter, and by rarity a chance of a * (BENCH in engine/bench.js). **BOOK**: every recipe like a codex page (??? until you've owned one), its letters as big blocks, PIN / BUILD. **LOCKER**: 5 slots kept between runs, [ TAKE ] / [ STORE ] (storing a mod unequips it). Letters, the locker and pins are in save.bench (no limit on letters). Recipes: shop gear (no loot, quest or CALL gear) and general / minor / exotic mods (exotics need a blueprint: none yet). The panel line type { draw, h } (buildTextBoard). The editor: TESTING > safehouse + bench, + letters. tools/checks/check.js: a getComputedStyle stub (it stopped loading at v14.11).
- **v14.11** (2026-10-31): **Gear in lists like mods** (the user): wherever gear shows in a list (the market's offers and its sell list, a reward's gear pick, the swap screen, the codex) it shows its 3-letter code on its rarity chip, then its name, lined up with the mods' names (a list row's gear / gearTier); the detail box under it the same (gearHead). Loot keeps its name on its chip.
- **v14.10** (2026-10-31): **Popup looks.** One place for every popup's background: POPUP_LOOK and popupBg (engine/render.js), a table in section 11 (Popup looks). The CALL box, the FEAT box and the quest scenes get the dark purple (the palette's REP color into its background); the hacker card, the sector event card and the ads stay on the palette's background. Solid fills with half-row overlaps (no hairlines between rows). Framed popups keep the frame on the palette background, the purple inside.
- **v14.09** (2026-10-31): **A home-screen app** (the user, on iPhone Safari: squashed by the bars). The page says it can run as an app: apple-mobile-web-app-capable / mobile-web-app-capable, a black-translucent status bar, and a web manifest (manifest.webmanifest: standalone, portrait, the icons incl. new icon-192.png / icon-512.png). Add to Home Screen opens it with no Safari bars. The game keeps clear of the notch and the home bar: engine/screen.js reads the safe-area insets (SAFE, a hidden probe of env(safe-area-inset-*)) and lays out inside them (all 0 on a desktop).
- **v14.08** (2026-10-31): **An easy batch.** The CALL box (quest popups) on a dark purple: the REP color into the dark, solid. Leaving the intro (NEWB / LEET, the title) the music fades down (Music.fadeOut) and the next track eases in: not the corp-won chord. MESH draws its links (every node to the next row, all sector; the boss row's sideways ones), dotted, where they don't cross the map's own. ZOMBIE: STIM stops the rot for the rest of the corp; SWAP flips your rot (120 of 150 becomes 30; only when it helps); PING already worked. POPS loses a bar every ICE he burns (like BAUD): before, nothing made his health go down, so he stayed all corp. EXORCIST (new gear, rare / epic): a rival here is thrown out of the corp; the epic one bans them for the run (run.banned); no flatline bonus for it. DELUX and "item stacks become health" parked as exotic ideas.
- **v14.07** (2026-10-31): **More loot** (the user: loot nodes mostly gave money; bosses should drop it). A loot roll ($ nodes, caches) is an item 65% of the time (was 40%), half of those a loot item for the bag (ECON.loot.valueShare; lootRoll in engine/run.js; STASH 75 / 88 / 100%). A corp boss drops 1-2 loot items into the bag, a sector boss 2-3 a little rarer (ECON.loot.boss / .sector; bossLoot, once per boss: a resumed reward doesn't drop again; "+ loot: ..." on the reward screen). A data cache drops a pile (2-3) half the time (ECON.loot.cache). PICKPOCKET (new mod, rare / epic / legendary): each layer you clear, 15 / 25 / 35% a loot item, leaning rarer at the higher steps (END_FX). Markets don't sell loot. The training: POPS has you hit the LOOT node on layer 2 (it always gives a SIM there), and the [£] bag comes up and he explains it right then. The loot viewer shows each boss's drop and each cache's pile, and uses the same rolls. The editor's loot viewer is its own section on the TESTING tab (Loot): show loot for the map node, and follow the map (it refreshes about once a second as you tap nodes; answered outside the test queue, the run stays scored).
- **v14.06** (2026-10-31): **The gear tray** (the user: high priority, the names were too long once the x2 went on; ENCORE ran into FWALL). The belt shows 3-letter codes like the mods ([PCH], ENCx2: ITEM_SHORT / beltLabel in engine/panels.js); the full name shows on the info line, rides your finger when you drag one, and goes into the TRASH. A dragged gear's slot shows empty. The info line scrolls when it's too long for the row (like the UPLINK's ticker), the stack count first. The training's LOOT bag step works: the [£] button was hidden for the whole training run; it comes up when POPS gets to it (run.lootShown), or once there's loot in the bag.
- **v14.05** (2026-10-31): **The small and medium list.** The seed decides the layers, always: a resumed run brings back the same layers (no salt), and the forecast / SKIPJACK rolls, OVERCLOCK's purges, the clock-runs-out tap and who answers a plain CALL are on the seed too (rivals' moves stay real-time random). [b] cycles b / 0 / y. The crew and rivals catch up to b0y: a short chat line goes in their cursor's tag half the time (HK_TAG_MAX), and a v of theirs bobs over the node they're about to tap. The editor's loot viewer: TESTING > loot here (lootReport, engine/editor.js): the node picked on the map: a market's offers and every reroll, a cache's loot and picks, a corp's boss reward, and each of its layers: whether it has a $ node and exactly what it pays you with what you have now (lootLayers / lootPreview: the same rolls as the game; STASH, PRIORITY, a full belt and the DISC count) (shopRoll and rewardOptions are their own functions now). TERMINAL VELOCITY is the intro's track: A at level 0 as the map comes up, B at 2 on the NEON card, NEWB / LEET back near 0 and bouncing between stages (INTRO_MUSIC). The training shows the LOOT bag (a SIM in it). Pets from other places: STRAY on THE BOARD (a bug, every run), the CATPHISH feat (100 catches; title; a fish in its bowl, every run), the EGG gear (it hatches a chick). TELL LIGHT on THE BOARD (USER, 150 REP): every corp layer says TELL ON / TELL OFF. COUPON is PUNCH CARD. A PHISHING logo over the stream at the PIER.
- **v14.04** (2026-10-31): **Three from the list.** The market: a mod upgrade you bought stays the color you bought when it shows SOLD (it showed the next step up). UPSIDE's boss: a tap lands on the node mirrored across the board's grid (top left picks bottom right; it was mirrored across the whole screen, so most taps hit a gap or the header), the node it'll hit lights up as you point, and a tap whose mirror is locked (SNIFFER) says so. Going back in: the market, the PIER, or a cache you didn't take the pick from, while you're on it (tap it on the map: G O  B A C K  I N); it's as you left it (run.shops: offers, what's sold, rerolls; run.caches: the loot only once). Visited nodes show what they were on the map (you are here / breached / been there).
- **v14.03** (2026-10-31): **H3AV3N, the playtest notes** (meat notes 2026-10-31). The fight's music place is `godfight` (was g0d). G0D's voice is up where speakers play it (110-200 Hz and a modem buzz; it sat at 48-88 Hz). After the last stand the tray's chips are gone for good (no faint seams). CERBERUS's map line fits. FIRST BREACH centers on the whole screen while it holds (PARCELNET / SYNAPSE), then glides down for the rewards. The aimed (purple) WARP goes anywhere in the sector you haven't been, behind you too; land in a pocket and you can go out by the next row up. Sector 1 on the seed: the cache on the right of its row (questLayout), no TUMBLER, no corp twice; its cache gives the CACHE KEY's extra loot, a legendary mod and a purple WARP; mold comes and goes on the broken UPLINK. Sector 2: the deep mold breaks (tap it: a hole that closes again; a node under it digs out first); b0y holding it back shows (his blue edge holds it at the corners, his marks on it); MAZE CLEARED gives a blue BUFFER (or the next step) and rare+ gear; a reroll in heaven's market brings an exotic (BLOOD MONEY first); [b] in a market: his shopping list; the maze: his name clue every layer, [b] brings his cursors. The fight: nodes against a wall get out the other way, and two on the same row are put a row apart. The ending: H3AV3N CLEARED (your logo, INT left, corps, perfects, the REP: the run's if it was practice + 150 the first time / 50 after, the unlock), then the feats: G0D SLAYER, UNTOUCHED, WITH A SHOE, LOST (the maze) in a new H3AV3N group on THE BOARD (shown once you've been).
- **v14.02** (2026-10-31): **CERBERUS, round 2** (the user, walking in blind: not clear). Each layer starts clear (a beat to see the nodes, CERB.hold), then the mold grows in from the edges, in fingers (CERB.grow; the eyes come once it's in). Dig anywhere: a tap on the board off the nodes breaks the mold too (a corp hook boardTap, engine/input.js). The first layer, b0y walks you through it, a line as each thing happens (it's growing over the nodes / tap the mold / the eyes: wait for blue / that's the real one). An eye on the real node leaves before it goes blue, and a hop always lands somewhere new.
- **v14.01** (2026-10-31): **the mold's colors in one place** (the user: tweaks should apply everywhere): MOLD and moldCol in engine/g0d.js (four shades by thickness, one ramp per stage: green, yellower, amber; fresh; the clue's cyan). Every mold reads it: the G0D fight, the wake-up, his death, the fake win and the final stand (stage 2's amber now, out of his death, no jump), the sector M0LD, CERBERUS, the spill, the maze's edges and the editor's g0d tab (G0D_COLS.mold / moldDim come from it). The neon editor's TESTING tab: play H3AV3N (the seed, as if typed). Notes: two CERBERUSes (moldy for the seed, a plain one for the regular game later).
- **v14.00** (2026-10-31): **the H3AV3N release** (the user: a big bump). Everything from v13.84 on: the loot pass and the new gear, H3AV3N (the maze, G0D's wake-up, fight, death, fake win, final stand and collapse), the G0D music, H3AV3N as a seed (the QUEST run, the M0LD, b0y's [b], CERBERUS, BLEACH, the placeholder ending). New save slot: beta_runner.v14.save, copied from v13 (else v12, v11) the first time v14 loads.

v11.00-v13.101 (and the early greglytics releases): [archive/SPEC_versions_v11-v13.md](archive/SPEC_versions_v11-v13.md).

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
