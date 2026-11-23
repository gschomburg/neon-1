# Layout and UI guide

How the screen is laid out, what draws over what, the popups and UI parts there are, and how much room each kind of art
gets. Read it before you make a new screen, popup, feature or mockup. It describes the code as it is (v15.55); when the
code changes, change this too. File references are to `dist/engine/` unless they say otherwise.

Older, narrower notes this replaces: `docs/ART.md` (the early "Beta Runner" art drop-off; its sizes are out of date).
CLAUDE.md "Screen space" keeps the short rules; this is the long version.

## 1. The screen

- **One character grid, 36 columns x 38 rows**, the same on a phone and a desktop. The whole grid is scaled to fit the
  window (`computeLayout`, screen.js), inside the phone's safe area (the notch, the home bar: `SAFE`). There's no
  minimum or maximum size: a 4K window just gets bigger characters.
- Where those numbers come from (core.js): a corp layer is a 4 x 4 grid of nodes, each node `TILE_W` 7 x `TILE_H` 5, with
  gaps of 2 across and 1 down. That's 34 x 23. The width is `max(board width, MIN_CONTENT_W 36)`, so 36. The height is
  `BOARD_Y 8 + 23 + TRAY_ROWS 5 + 2` = 38.
- **Every layer is 4 x 4 today** (layers.js). The layout code can take other grids: a wider one would widen the whole
  screen, so don't, without a plan for every other screen.
- A row is 1.22 times the font size (`LINE_H`); a character is about 0.6 of it wide. So a cell is about **1 wide by
  2 tall**: art drawn on a square grid looks squashed sideways here. The font is JetBrains Mono (Consolas, Courier New).
- **Mockups:** draw them at the real 36 x 38, in that font and line height (`docs/mockups/cultfight.html` does).

## 2. The rows

### In a run (the map, a corp, a market or other panel that isn't full screen, the PIER)

| Row | What's there | Code |
|---|---|---|
| 0 | `NeoN+1` (the menu button in a run), right side: `[LEAVE >]` when you're in a place | scene.js header |
| 1 | a rule (`- - -`) | scene.js |
| 2 | `LAYER nn` / sector on the left; INT on the right | hud.js |
| 3 | where you are on the left; credits (`CR`) on the right | hud.js |
| 4 | a rule (glows on your turn in multiplayer) | scene.js |
| 5 | in a layer: `OPEN nn/nn` and `ODDS` | scene.js |
| 6 | **the message line** (the terminal): `setMsg(text, col)`, an inverted band that types in | scene.js |
| 7 | in a layer: `CLOCK`, mod notes on the right, or a corp's button (`[CALL]`, `[BID]`...) on the right | scene.js |
| 8-30 | **the board: 23 rows.** A corp's layer, the map, a panel, the PIER | `BOARD_Y`, `L.gh` |
| 31 | empty (a gap) | |
| 32 | the tray's rule: `[b]` (b0y) at its left end, `[£]` (the LOOT bag) at its right, the pet sitting on it | loot.js, heaven.js, pet.js |
| 33-36 | the tray: mods, mod info, gear, gear info | tray.js |
| 37 | the footer: the seed on the left, `neon+1 vNN.NN [?]` on the right (`[DEV]` before it) | scene.js `footerRight` |

So a panel that isn't full screen has **23 rows** to work with. `buildTextBoard` centers its lines in that space, top to
bottom; it doesn't squeeze, so a panel that runs over spills onto the tray. Count your rows.

### Full screen (the title, the end screen, `openPanel(..., { full: true })`)

- The text board gets **rows 0-37**, all of it: no header, HUD or tray. Row 37 is still the footer (the version on the
  right), so lay out rows 0-36.
- **Row 0, left: the way out**, `[< TITLE]` (openPanel's `opts.top`, `TO_TITLE` in panels.js). The workbench draws its own
  top line: `NeoN+1` on the left, `[LEAVE >]` on the right.
- A full-screen panel usually fills to the bottom with blank lines so it sits at the top (bench.js `benchLines` does).
- Full-screen screens today: the title, the end screen, HOW TO PLAY, THE CODEX, THE BOARD and its tabs, YOUR DECK,
  SETTINGS, INFO, POPS's log, the LEADERBOARD, MULTIPLAYER, the WORKBENCH and the UPLINK (no [< TITLE] on the last two:
  they have their own ways on).

### Tight screens (count every row on these)

The UPLINK (runend.js `openUplink` counts its rows), the rewards screen, the market, the end screen (its map flexes:
`overLines` with `lineRows`, so count new lines with `lineRows` too), and anything on the 23-row board. The tricks for
a tight screen are in CLAUDE.md "Screen space": fold art away once it's had its moment, `FX.ticker`, `FX.swapLines`.

## 3. Ways out and the menu

- **`[< TITLE]`, top left, row 0:** the way out of a full-screen menu (Greg, 2026-11-21). `openPanel(title, fn, msg,
  { full: true, top: TO_TITLE })`. Its button id is `back`, so the keys find it.
- **`[LEAVE >]`, top right, row 0:** the way out of a place in a run: the market, THE FENCE, the PIER, the WORKBENCH
  (`openPanel(..., { leave: { text, onTap, id } })`; the PIER and the bench draw their own). Brighter than plain text,
  its arrow nudges its way and a shimmer slides across (`wayOutBtn`, scene.js; `WAYOUT` sets the timing).
- **`NeoN+1`, row 0, left, in a run:** the menu (pause): palette, colors, effects, tap mode, THE SHELL, sound, and
  `[ ABANDON RUN ]` (`pauseLines`, input.js). In the WORKBENCH training it's `[ END TRAINING ]`.
- **Multiplayer:** `[LEAVE]` at column 12 on row 0.
- **THE BOARD's tabs** (YOU REP DECK / FEATS CREW QUESTS) are full-screen tabs; the deck draws the same two rows lit on
  DECK.
- **Esc** goes to the first of these that's up: the top overlay, the dev menu, the pause menu, the screen's own key
  handler (`st.keyHandler`: usually back / close); else, in a run, it opens the pause menu (input.js).

## 4. Layers: what draws over what

Each frame `buildScene` (scene.js) builds the grid's cells in this order, bottom first; `frameBody` (render.js) then
draws a few pixel layers on top.

| Order | Layer | Notes |
|---|---|---|
| 1 | the screen: header, HUD, message line, the board (a layer, the map, a panel, the PIER), the tray, the footer | or a full-screen text board |
| 2 | a wipe (`st.wipe`) or the decode-in of a fresh screen | transitions, section 8 |
| 3 | H3AV3N's own layers (the mold, the fake win, G0D dying, the collapse) | heaven.js |
| 4 | **the overlays, bottom to top:** ad, sector event card, hacker card, FEAT box, quest scene, PH1SH's ad, CALL box | `OVERLAYS`, scene.js |
| 5 | G0D.exe's cursor off the board | g0dexe.js |
| 6 | the training's popup (POPS), laid out here, drawn later in pixels | tutorial.js |
| 7 | a hint (b0y's `[b]`) | tutorial.js `showHint` |
| pixels | the WORKBENCH keyboard, then the training popup, then a hint, then a flash | render.js `frameBody` |

- **The pause menu and the dev menu cover everything** (`menuCover`): while one is up the header, tray, overlays and
  training popups wait under it, and take no taps.
- **Only the top overlay that's up and shown takes taps and keys** (`overlayTop`). `shown()` lets one wait under
  another: a card waits under an ad; the CALL box waits for an event card, a FEAT box or PH1SH's ad.
- The quest scene sits under the CALL box on purpose: a CALL comes up only once the scene has gone dark.
- The training popup isn't an overlay: it lets the taps it asks for through to the game (`tutAllows`).
- **A new popup:** add it to `OVERLAYS` at the height it belongs (`on`, `shown`, `build`, `tap`, `key`, maybe `tick`),
  give it a `POPUP_LOOK` kind (render.js) and a row in SPEC.md "Popup looks", and fill its box with `popupBg`.

## 5. Popups and messages

| What | Use it for | Size | How |
|---|---|---|---|
| **Message line** (row 6) | what just happened, one line | 36 | `setMsg(text, C.x)`; a hacker's line takes it for a while |
| **CALL box** | a crew member talking to you, quest steps, offers with buttons | 34 wide (`CALL_W` 32 inside) | `queueCall(who, lines, btn)`, or push `{ who, lines, btns: [{ text, onTap }] }` to `CALL_QUEUE` |
| **QUEST card** | a quest's name and step (the CALL box, no face) | 34 | `questCard(id)` |
| **FEAT box** | a feat, THE BOARD's news, chips home | 34 (`FEAT_W` 32 inside) | `FEAT_QUEUE.push({ feat })` or `{ head, lines }` |
| **Hacker card** | a rival coming in, crew you called | 34 | `hkCard` (hackers.js) |
| **Sector event card** | a sector's event | 33 (`EV_W` 31 inside) | events.js |
| **Quest scene** | a story frame, full screen, no frame | 36 x 38 | `playScene(id)` (quests.js) |
| **Ads** | fake ads, PH1SH's spam ad | `ADS_W` + 4 | ads.js |
| **Training popup** | POPS teaching: a yellow tag with an arrow, or a small "do this" line by his face | about 27 wide, in pixels | `tutKit`'s `say` / `ask` (tutorial.js) |
| **Hint** | a training-style popup in a normal run | as the training's | `showHint(pop)` |
| **FEAT band** | a feat earned mid-layer, in the message line | 36 | feats.js |

- The queues wait for a calm moment (`featCalm`: no ad, card, wipe, transition, death...) and show one at a time.
- Boxes are centered on the whole screen.
- **Popup looks:** the CALL box, FEAT box and quest scenes are the dark purple *quest* look (the palette's REP color
  16% into its background); cards and ads are *plain* (the palette's background). A framed box keeps its frame on the
  palette's background (SPEC.md "Popup looks").

## 6. UI parts

All in the text board (`buildTextBoard`, textboard.js) unless it says otherwise. A screen is a function of
`(T, B, X, lines)`: `T(text, col)` a plain line, `B(text, id, onTap)` a button line, `X(spec)` anything else.

- **Big button:** `X({ box: true, text: 'S P A C E D', sub: '- a second line -', id, onTap, minW, col, disabled })`.
  3 rows, 4 with `sub`. The main action on a screen. Spaced capitals for its label.
- **Big buttons side by side:** `X({ boxes: [...] })` (`drawBoxes`): the same size, 16 wide at most, centered as a
  group (TAKE | SALVAGE, ENTER | PIER).
- **A row of small buttons:** `X({ gap, row: [{ text: '[ PIN ]', id, onTap, sel, disabled }] })`.
- **Main tabs:** a row of `[NAME]` buttons, the one you're on lit (`sel`). **Sub-tabs:** `drawSubTabs` (textboard.js), a
  strip across the row, no brackets, the one you're on filled in. Use it for any tabs inside tabs. Budget: each tab is
  its name + 2, plus 1 between tabs, inside 36.
- **Lists:** `scrollArea(X, T, s, items, rows)` (codex.js): exactly `rows` lines, with `[ ^ ^ ^  more  ^ ^ ^ ]` /
  `[ v v v  more  v v v ]` rows when it doesn't fit; the wheel and swipes scroll it (`st.scroll`). `scrollFollow` keeps
  the picked line in view. A list row: `{ list: true, id, sel, onTap, name, right, rightCol, badge | gear }`.
- **An item's head:** `{ badge: modKey }` (a mod's badge), `{ gearHead: key, text }`, `{ tileInfo: glyph, lines }`
  (a node drawn beside 5 lines).
- **Chips:** `putChip` (tray.js): text on its rarity's chip; `chipOf(rarity)` gives the colors.
- **Moving text:** `FX.ticker(text, w, t0, now)`: one line that holds a beat, then scrolls. `FX.swapLines(lines, w,
  t0, now)`: lines that take turns on one row. Use them where it's tight (Decided, Greg 2026-11-05: stacked text
  where it fits).
- **Text field:** `Field` / `drawField` (textboard.js), e.g. the seed and the leaderboard initials.
- **Your own drawing:** `X({ h: rows, draw: (ctx, y) => ... })` with `ctx.put(x, y, text, col, own, bold)`,
  `ctx.bg(x, y, w, col, alpha)`, `ctx.addHit(x, y, w, h, { kind: 'btn', id, onTap })`, `ctx.hl(...)` for the hover look.

## 7. Color

- The palette slots (`C`, core.js): `bg dim mid text bright accent danger dangerDim money rep`, plus the rarity
  colors. Every palette fills the same slots, so use slots, never hex (a message keeps its slot, so it follows a
  palette change).
- What they mean: **accent** buttons and what's on; **danger** ICE, damage, no power, warnings; **money** credits and
  prices; **rep** REP, feats, quests, unlocks (and the quest popups' purple); **mid / dim** labels and things that are
  off; **bright** names and headings.
- Rarity is always its chip (`chipOf`): the same colors in every palette.
- A corp can bring its own palette for its layers (corp colors in SETTINGS).

## 8. Transitions and timing

- **Changing screens:** `swapTo(openFn)` (render.js): a wipe out, then the next screen, which wipes in. Don't call an
  open function straight from a button unless it's the same screen.
- A screen that appears without a wipe decodes in (its board characters are noise for up to half a second:
  `st.boardStart`).
- `openPanel(..., { reveal: true })`: after a boss, the title types in and the lines come in one by one.
- Things that move on their own use `performance.now()` and the `FX` helpers (fx.js; their settings: data/fx.js), and
  are still when the effects setting is REDUCED (`reduced()`).

## 9. Input

- Every tappable thing is a hit with an `id` (`addHit`). Hits are at least 40 pixels each way (finger-sized), whatever
  the text.
- **Keys:** arrows move the cursor (`st.kbFocus`) over the buttons, top to bottom; Enter / Space press. In a layer:
  arrows move between nodes, 1-9 use gear. M mutes, N toggles the music, ` (backtick) opens THE SHELL. A screen can take
  keys first with `st.keyHandler` (return true when it used one; `.typing = true` to get letters).
- The hover look is the same everywhere: the button keeps its color, a background highlight goes under it, and the
  keyboard cursor adds a `>` to its left.
- Give the way out the id `back` so the keys land on it.

## 10. Art budgets

| Art | Size | Where it lives | Notes |
|---|---|---|---|
| Node glyph | up to 5 x 3 | data/art/glyphs.js | each line centered on the node by itself; lore lines under 26 |
| Face (hackers, POPS) | 5 x 3 | data/art/faces.js | drawn as is |
| Logo (players', corps', rivals') | up to 24 x 7 | data/art/logos.js | centered in a 24 x 7 box; a corp's is also its intro art; `mark` is 3 characters |
| SECTOR CLEARED picture | up to 30 x 13 | data/art/root.js | centered in a 30 x 13 box |
| The boot world map | 34 x 12 | data/art/worldmap.js | in the login box |
| Cutscenes | 36 wide, any height | asxii_art/ to data/scene_art.js | they scroll (the DISC scene is 150 tall) |
| The deck's board | 36 x 56 | asxii_art/deck_board_v06 | scrolls; socket spots are read off the art (deck.js) |
| The title art | the whole title screen | data/title.js | |
| A node on the board | 7 x 5 | | the glyph sits in it |

All 182 glyphs, faces, logos and pictures fit their budgets (checked 2026-11-23).

## 11. Text limits

- **Item names: 15 characters at most** (JACK IN THE BOX): longer doesn't fit on the rewards screen and the market.
- Mod codes 3 characters; gear codes 3 (`ITEM_SHORT`); chip codes 3 (two letters and a digit).
- Feat names and titles: 16 at most. POPS's "do this" line: about 22. A glyph's lore lines: under 26.
- Lines in a CALL or FEAT box: 32 wide (they wrap). Your hacker name on the deck's CPU: 13.
- Lowercase for what people say; CAPITALS for names of things (mods, gear, corps, screens, buttons).

## 12. A new screen or feature: the checklist

1. Full screen, or a panel on the 23-row board? Count its rows on a phone (38 x 36, or the 23-row board).
2. Its way out: `[< TITLE]` top left (a menu), `[LEAVE >]` top right (a place in a run), or a button on it.
3. Open it with `swapTo`. Give its buttons ids; the way out is `back`.
4. A popup: an `OVERLAYS` entry at the right height, a `POPUP_LOOK` kind, and centered, under 36 wide.
5. Colors by slot, rarity by chip. Text in the voice and the limits above.
6. Art within its budget; mockups at 36 x 38.
7. Keys: arrows / Enter work through the buttons; Esc goes back.
8. A check in `tools/checks/tests/` that opens it (screenshots: a test's `#shots` hash, see tests/benchtut.js).
