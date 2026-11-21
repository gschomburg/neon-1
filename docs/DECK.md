# THE DECK: the sockets, the chips, and how it opens

**In the game (dev only):** `dist/engine/deck.js`, opened from the editor's screen picker ("the deck (dev)"). Its state
lives in memory, never in the save. The art is `asxii_art/deck_board_v06` (copied in by `node tools/data/scene_art.js`).
The HTML mockups: `docs/mockups/deck_v4.html` (round 4), `deck_v3.html` (round 3), `deck.html` and `deck_v2.html`
(the first boards). Started 2026-11-15 from Greg's board v2 (`asxii_art/deck_board_v02.asxii.json`). Only the dev
screen is built. BACKLOG section 11 has where the idea came from.

Everything here is Claude's unless it says Greg. The socket count gets tuned once each group's chip list settles
(**Decided (Greg, 2026-11-15):** decide what to cut after we've gone deeper on the options).

## Decided so far (Greg, 2026-11-15)
- **Outside a run.** You set the deck up between runs. It doesn't come up while you play.
- **Chips have a rarity, one each.** No chip comes in more than one rarity.
- **One of each chip.** Once you have one there's no reason to get it again, except to scrap it: a chip you
  already own, found again, scraps into its letters. (Claude: the drop tables could skip chips you own, so finds
  stay new.)
- **You keep a chip only if you cash out with it.** Die and it's gone.
- **Chips come from many places:** loot drops, bosses, quests, crafting (maybe by accident), and the fence (a chip of
  its own, or a selection of them).
- **DEADMAN goes in the CRASH socket.** CHUCK E. CACHE's 1UP stays a mod idea (BACKLOG section 7).
- **Beat G0D and you can slot the 1UP right away.** So the deck has to open before that, or CRASH needs something
  to hold earlier (see "How it opens").
- **THE BYTE is for secret codes.** The shell has its own sockets. One row of bits, not two. Under it, a readout:
  a scrolling ticker (like `FX.ticker`) that says when a code does something, and can show anything else too.
- **The CRASH socket is a normal 3x2 socket.** The tall stick becomes its readout, like the byte's: with a chip in,
  the stick spells out what it is (DEADMAN, 1UP).
- **Each shell socket holds one command.** No command + argument pairs: each command takes different arguments.
- **The FUSE is the extra power** that turns the bottom of the board on once you have the REP for it.
- **Keep the PSU and the FUSE** even though you can't see them in a run. Make them fit, maybe through a boss you fight
  on your own deck.
- **The ports are a keeper.**
- **Backlog ideas can move here** (done: BACKLOG points here for each one).
- **A short training** once the board opens, to point things out.
- **The CPU shows your hacker name** (Greg, 2026-11-15), not NEURAL DECK, with the mk under it. Names are
  `WORD_WORD` (data/personas.js), up to 13 characters (STATIC_GOBLIN); the CPU is 12 wide inside. A name that
  doesn't fit goes on 2 lines, split at the `_` (each word is 6 at most). Maybe small silkscreen under it
  (`MEDIX NC-1`). Names with MK2 in them (`POTATO_MK2` over `mk II`) are a free joke.

## Decided from the first in-game round (Greg, 2026-11-15)
- **Where the deck lives:** probably a part of THE BOARD screen (the main menu), not the safehouse: a chip you carry
  but haven't cashed out can't be slotted, and that would be odd in a safehouse mid-run. An idea: unlock the
  workbench / safehouse as a main-menu thing too, for crafting, the deck and the LOCKER. (Claude: SHRED is the one
  bench tab about the run you're in, so it could stay in the run's safehouse.) Not decided.
- **Colors (ideas):** THE BOARD is REP's, so the deck could lean on the REP purple. Or each mk is a rarity color for
  the traces: mk II epic (close to the REP purple), mk III legendary, mk IV exotic. Chips keep their rarity colors.
  **Decided (Greg, 2026-11-16):** the traces and every socket level up with your mk: mk II rare (blue), mk III epic
  (purple), mk IV legendary, but in the exotic gold (Greg likes it better than the orange). GLYPH keeps its white; red
  is no power. (Built.)
- **The card's order:** the group and power first, dim (`SHELL · PWR 2`); then the name on its rarity chip; then
  the short text, a ticker. (Done.)
- **The picker is a set height, like a store:** a list that scrolls, then the picked one's info under it: name,
  rarity and power, the long text (4 rows at most), and SLOT. A tap picks, SLOT puts it in. (Done.)
  A double tap (or click) on a row slots it too (Greg).
- **The picker's status line** (the row under its title) stays: the group's text for now. The power reading is gone
  from it (the header shows your power right above). Whatever goes there later has to fit the box (32 wide). (Done.)
- **No NAME button on the CPU:** it shows your PROFILE's hacker name. (Done.)
- **The CPU opens a popup** (Greg): the ROM goes in it (the ROM pins open it too, and the ROM card is gone). In it
  (Claude's take): your mk and access, chips in (6/11: no list, you can see them) and power, the mk ladder with the
  upgrade, the ROM's posts and switches, and a line of lore at the bottom (`MEDIX NC-1 · rev 2`). (Done.)
  **Then (Greg):** no list of the ROM's posts (the pins show them). The room goes to the switches, one per row with
  its text under it and `[on]` / `[off]` on the right (Greg). NEMESIS isn't on/off: `NEMESIS [BURGERTRON]`, and a tap cycles
  to the next corp or none. (Done. In the game it would cycle only the corps you've breached.)
  **Then (Greg):** only posts with a real choice get a setting. Claude's cut: STARTER POOL (it changes what the
  starter perk offers), STRAY (a pet you might not want along), NEMESIS (a corp, or none). TELL LIGHT and LUCKY START
  only help, so they're just on. (Done.)
  More settings may come with the ELITE and SYSOP posts (not written yet). The popup has room for about 2 more;
  past that, its settings become a scroll area like the picker's list.
- **A short and a long text per chip,** like mods and gear: the short one is the card's ticker and the list's second
  row, the long one is the picker's info. The long one has a limit, but more room than a ticker.
- **Each socket shows its chip's power on the board** (Greg; done, in hex): a small number centered on the socket's bottom
  border, `+-2-+` (`+-+2+-+` on a wide one). Red when the chip has no power; no number in an empty socket, and
  none for 0-power chips. **The PSU shows the usage** (Greg): `+5/6+`. A budget over 9 (REACTOR, 14) doesn't fit 3
  wide. Greg's option, and Claude's pick: **hex**, one character up to 15, so REACTOR reads `+5/E+` (the BYTE already
  shows hex, and it fits a hacker's deck). The other ways: the number takes the right corner (`+5/14`), or only
  what's left (`+-9-+`).
- **SLOT from the CHIPS tab scrolls the board** to the sockets that chip fits: all of them when they fit in the
  view together, else from the first one. No open socket for it (mk III / IV): it says so and stays on the list. (Done.)
- **A dim dashed line between items** in the lists, not a blank row. (Done.)
- **The wheel and a drag scroll one row at a time;** the arrows and the "more" rows step to the next whole item.
  (Done. In the picker the arrow keys move the pick and Enter slots it.)
- 8 more SHELL chips, to see a long list (stand-ins, like the rest).
- **Socketing gets a show** (Greg, 2026-11-16; to do): bigger the rarer the chip. Confetti and fanfare, tech blobs,
  and the traces light up: electricity flows out of the chip and across the board. **Not enough power** does the
  opposite: the light drains out of the board and it dims, with an error fanfare and static sparks around the chip.
  (Claude: the flow can follow the trace characters out from the socket, a few cells a frame, in the mk's trace color;
  the drain the same way back in. The red NO POWER bar stays as the readable part.)
  **Sounds too** (Greg): new ones, like something powering up or off, or a fan spinning up.

## Decided from the round 4 mockup (Greg, 2026-11-15)
- **Every socket takes two taps:** the first shows its card, the second opens the picker. Empty ones too.
- **The card is 4 rows**, beside the socket's frame: the name; the group and its power on one line (no rarity: the
  face's color says it); what it does as one indented ticker line (`FX.ticker`), so its length doesn't matter; and
  the buttons (CHANGE). The scroll area gets the rows that frees.
- **NO POWER goes on the rule** over the card: the rule turns red with dark text, "NO POWER: market in SH3", cycling
  when more than one chip has none (`FX.swapLines`). No line at the very bottom. (Claude: tapping it goes to that
  socket.) The game's footer row is counted.
- **It moves into the engine** as a screen only the editor opens, to keep tuning on the real grid.
- (Claude) The picker is as tall as what's in it, over the board, with the board dim under it.

## Decided from the round 3 mockup (Greg, 2026-11-15)
- **Scrolling uses the game's scroll area:** the "more" rows top and bottom (engine/codex.js `scrollArea`), for the
  board, the chip list and the picker. No scrollbar column, so the art's 36 columns fit. (Claude: a list of chips
  steps a whole chip, so you never see half of one. The board steps 5 rows a tap.)
- **A socket's chip is picked in a popup:** a picker with a scroll area of the chips that fit, plus NONE. Tap one
  and it's in, and the picker closes. No PULL / SWAP buttons, no list in the info area. An empty socket opens the
  picker on the first tap; a full one shows its card first, and a second tap (or CHANGE) opens the picker.
- **The chip card is short:** face, name, group and rarity, power, what it does. No "from:" or "found again" lines.
  (Claude: those could go in the codex if chips get a page there.)
- **Power runs out instead of refusing.** You can always slot a chip. The cell's power goes to the chips in the order
  they went in, oldest first. A chip that doesn't get power goes grey and its socket border goes red, so the one you
  just slotted is the one that goes dark, not one off screen. (Claude: a chip that doesn't fit what's left is
  skipped, and newer, cheaper chips still try.)
- **A power warning:** (Claude's take) the PWR count in the header turns red with the number off, the `]8[` readout
  blinks `!`, the bottom row says which chips have none, and leaving the deck with a chip off asks once.
- **Chip faces use both rows:** letters and symbols, e.g. DEADMAN is `DED` over `MAN`. The 3-letter code stays in
  the data. (Claude: a chip with a setting can show it, like SPOILS' `RWD` / `HP+` / `$$$`.)

## The name
Greg likes "board" better than "deck", but THE BOARD is already the REP screen. Options:
- **THE BOARD morphs into it (Claude's pick).** The bulletin board you post REP on turns into a circuit board, and the
  posts you've bought become little parts on it (the ROM). One screen, one name.
- **THE DECK:** the cyberpunk word for a hacker's computer. Fine, a little generic.
- **THE RIG:** short, fits on a phone.
- Others: WETWARE, MOBO, THE STACK. (CHROME is taken: it's a gear.)

## How it opens
Claude's ladder, so the 1UP always has somewhere to go:

| Access level | What opens | How |
|---|---|---|
| GUEST | nothing yet | THE BOARD is the bulletin board, as today |
| USER | **mk II**, the top band (CRASH, SHELL, BOOT, BIOS, SPOILS, THE BYTE) | comes with reaching USER |
| ELITE | **mk III**, the middle band | the CPU upgrade: an ELITE post, bought with REP |
| SYSOP | **mk IV**, the bottom band | the FUSE: a SYSOP post, bought with REP |

- That's earlier than Greg's "leet" first idea. It's what lets the 1UP slot in right after G0D.
- **The deck upgrades are the ELITE and SYSOP posts.** Those levels have nothing posted yet (engine/save.js:
  "3 ELITE, 4 SYSOP: nothing posted yet").
- **Posts you'd bought come pre-slotted.** When the deck opens, DEADMAN is already in CRASH. Nothing you had stops
  working.
- **Beat G0D before you have the deck?** Then the deck opens right there: b0y hands over his crash unit and the deck
  to put it in.
- Greg's other ideas, if this ladder doesn't feel right: ELITE needs the deck's mk IV; or the full board is the G0D
  reward (the bottom band opens on beating G0D, with the 1UP moved down there and DEADMAN up top).

## Power
- **The FUSE** (Greg): the extra power that lights the bottom band, once you've bought it.
- **The PSU** holds a cell, and **the cell sets your power budget.** Each chip costs 1-3 power, so the cell decides
  how much you can run at once. Stronger chips cost more, so a strong deck is a choice, not just a collection.
  (This brings back the "every chip draws power" idea. It's the simplest way to keep the strong chips in check.)
- **Where you'd see it in a run:** a boss that breaches your deck (below, PSU).

**First pass, to playtest (Greg, 2026-11-15: "solid enough for a first pass").** In the dev screen.
- **What needs power** (board v06): mk II has 10 chip sockets (SPOILS is a 0-power switch, so 9 that cost), mk III
  has 3 (OVERVOLT; the GLYPH is free), mk IV has 5 (SUDO, BOSS; the HEAT sockets are free).
- **Costs:** 0 for switches, handicaps and looks (SPOILS, HEAT, PET, the cells). 1 for most chips (commons, small
  tools: ls, EJECT, DEADMAN). 2 for strong ones (market, undo, GAMBLE, GREED). 3 for run-changers (1UP, mode.god,
  ssh, the BOSS chips).
- **The cell powers mk II and mk III**, one cell per stage of the ladder: STOCK 6 (comes with the deck: half the top
  board, so you choose from day one), LI-ION 9 (a mid boss), NANO CELL 11 (about ELITE: 12 paid sockets, always 1
  short), REACTOR 14 (endgame, -1 INT: every socket with a 1, and 2 to spare).
- **The FUSE powers mk IV on its own:** 8, against SUDO and BOSS chips at 2-3 each (15 to run them all). Two BOSS
  chips and a light SUDO, or 3 SUDO and a BOSS, never all of it.
- **Every number is one hex character** on the board: a socket's bottom border shows its chip's cost (`+-2-+`), the
  PSU shows used / budget (`+5/E+`), the `]8[` readout the cell's power left, and a digit beside the FUSE its power
  left. The header: `PWR 5/6 F2/8`.
- **F is a secret:** OVERCLOCK, a BYTE code (00001111), runs the cell at 15. **Greg (2026-11-16):** it stays a BYTE code, but once
  you've entered it, it stays on (saved), so you don't enter it every run. (Claude: enter it again to switch it off.)
- **A rule for judging a cell:** spare = power - paid sockets. Negative early, about 0 mid-game, +2 at the max.
- **The NO POWER bar is a button** (Greg, 2026-11-16; to do): tap it and the board scrolls to a chip with no power,
  the next one on each tap.

## Seeds: what a chip does to a run
**Decided (Greg, 2026-11-15):**
- **Seeded runs keep everything on**, world chips too, like REP posts (HARDENED's extra INT stays). A seed only has to
  stay *about* the same: the same corps, sector events and paths. A chip gets special treatment only if it really
  scrambles a run.
- **HAD3S and H3AV3N are curated:** lock every sector of both, so no chip or post (NEMESIS today) changes their corps.
  (Greg: they played fine last time; he hasn't played them in a while.) BACKLOG has it.

**Weighting a corp without scrambling the map** (Greg's idea, Claude's details). `pickCorps` (engine/map.js) picks a
row's 3 corps by weight, one random number each. NEMESIS's 3x changes the total weight, which moves every boundary, so
nearly every pick changes. Instead:
- Every row's pool always has 2 placeholder corps, for every player, at a weight that doesn't depend on the player (the
  row's average corp weight). The totals match for everyone, so every other pick lands the same.
- After the row's 3 picks, a placeholder becomes your NEMESIS (or a chip's corp) if it isn't in the row already and its
  level fits the row. Otherwise it's a fallback pick from its own stream (`rngFor(seed, 'nemfill', s, row, lane)`),
  never from the map's stream, so the map's stream still uses 3 numbers a row.
- Two players on one seed then differ only at the placeholder slots (about 1 corp slot in 10). Tile layouts are
  keyed by node (`'layer', nodeId, idx`), so only those nodes' layers differ.
- Adding the placeholders changes every existing seed once (the seed boards' old scores). Do it at a version bump, or
  give map generation a version so old seeds keep their maps.
- More "this corp shows up more" effects (the SIMON CHIP, TIME IS MONEY) fill the same placeholders, in a fixed order.
- **+1 LAYER** the same way: the extra layer gets its own stream (`'layer+', nodeId`) and goes just before the boss;
  the boss keeps its stream, and the lucky / jackpot / pet picks keep the old layer count.

**What each chip touches** (a note for us, not shown in the game). Tag each chip when it's kept, so it's easy to see
what changes what:
- **map:** what a run generates: corps, sector events, paths, layers, rivals turning up. SIMON CHIP and the other
  corp chips, FRESH, +1 LAYER, EVENTS, QUIET, HUNTED, HEADSTART, ADWARE.
- **rules:** what a run pays or drops, once the map exists: SPOILS, GAMBLE, GREED, LUCK, the HEAT chips' REP.
- **you:** your start, your tools and your deaths: BOOT's STARTER and PET, the CRASH chips, the SHELL and SUDO
  commands, the PSU cells, OVERVOLT's INT cost, the GLYPH.
- A chip can have two tags (HUNTED: map, for the rivals; rules, for its REP). The dev screen's stand-ins carry them
  in `DECK_CHIP_TAGS` (engine/deck.js).

## Chips: getting them, carrying them, keeping them
- **Carrying one home** (**Decided (Greg, 2026-11-16):** in a gear slot, so it's clear you have it). A chip you
  find rides in your belt like a gear. You can't use it in the run; it just takes the slot. Cash out and it's yours.
  Die and it's gone.
  - **A full belt:** you get the choice to swap a gear out. If the chip is an automatic drop, a prompt says it's
    swapping and lets you pick the gear that goes (or leave the chip).
  - **On the tray** a gear slot is one row, so the chip's two rows take turns (its face scrolls up or down a row).
  - **Tap it** for its short text, as a ticker. You see what it is right away, so you know a dupe when you get one
    and can shred it or drop it.
  - Dropped: its own one-chip case, because the gear slot shows you have it. Dropped: chips you identify by cashing
    out, because knowing a dupe matters more (Greg).
- **The fence** sells two or three chips, different each time. Some only turn up there, and those are **ripped**:
  stolen, so a rival hunts you. **Greg (2026-11-16):** "until you cash out" is too easy, since the fence sits right before the
  sector boss. Dropped: Claude's "a ripped chip has to cool for a sector first" (Greg wasn't sure).
  **Then (Greg, 2026-11-16):** ripped chips also drop from rivals. Beat a rival and it may drop a chip; then rivals chase
  you through the nodes. You can still just cash out. The fence sells ripped chips too, at a high price.
- **The workbench:** a chip's code has a digit in it (`1UP`, `DM5`). The bench has no use for digits yet (BACKLOG
  section 1: "digits 1-9 none"), so spelling a code with a digit makes a chip. **Greg (2026-11-16):** good. A chip's code can be 6
  characters (both rows of its face). **Then (Greg, 2026-11-16):** making a chip takes a one-use item that opens the
  bench's extra row (6 slots). It stacks, and it's a component, so it stays between runs once you find one. Where it
  comes from: open.
  **Built v15.10 (Greg, 2026-11-21):**
  - **The BLANK** (an empty chip) is the one-use item. It goes in the extra slot, a permanent 4th spot on BUILD, smaller
    (2x2) and dotted so it reads as optional. **v15.11 (Greg):** it's the x slot too: one slot takes a digit 2-9 (a 50%
    chance of that many gear) or a BLANK, never both. With a BLANK in, the three slots spell a chip's code, digits too (CD2,
    LW1); the x slot (build several) is off. No 6-slot row: the faces use symbols the keyboard doesn't have.
  - **BLANKs come from shredding chips** (40%) and now and then corrupted software (10%). A shredded chip gives its
    whole code back, digit too.
  - **Which chips:** ones you've had (on your belt or in your deck). Not RIPPED (stolen only), not the deck's or a
    quest's (DECK_NO_DROP), not BOSS chips, not BETA. A built chip goes straight into your deck.
  - **Blueprints (Greg: "chips should require you have a blueprint for anything above rare, blueprints require
    shredding"):** epic and better chips, and every exotic (mods and gear), need one. Shred one and you learn it
    (save.bench.blueprints). A mod that binds to you (ZOMBIE, RAM DOUBLER) doesn't come apart: the shred teaches its
    blueprint and counts for give, but you keep it and get no components.
  - **No `*` for exotics** (Greg: the * means "anything", it's not a cost).
  - **The BUILD screen:** what you've spelled (its code, name and [ BUILD ]) sits under the letters now, not on the right.
    Typing a chip's code with no BLANK in: the matches offer it, and tap: fill puts a BLANK in.
  - The BLUEPRINT chip is **FREE PRESS** now (Greg: a blueprint is knowing how to craft something).
  **v15.13 (Greg, 2026-11-21):**
  - **No extras:** a chip home is unlocked, so your deck keeps no counts (no x2). Cash out with a chip you already have
    and it shreds on its own into its code (digit too) and maybe a BLANK; an epic+ one teaches its blueprint. A new chip
    carried twice: one home, the other shreds. The cash-out note lists both. Maybe later a REP buy does more here.
  - **More 1s:** shreds' random digits include 1 now (the digit chip codes use most); a 1 never goes in the x.
  - **POPS** explains the first BLANK, and the first blueprint (rough: Greg to look).
  - **The BOOK** has sub-tabs, GEAR MODS CHIPS, each with its own found count. Sub-tabs sit in a strip of background
    (textboard.js drawSubTabs: use it for any tabs inside tabs).
  - G0D.exe was a recipe for everyone (G 0 D built it): items marked only (dev, deck) aren't recipes now.
  - **Decided (Greg, 2026-11-21), v15.14:** you can craft any chip you've **seen**: on your belt, for sale at a market,
    or offered by a corp boss. Certain chips still only come from quests and bosses (they aren't recipes). Dropped:
    crafting chips to sell ("probably not worth it").
  - The BOOK's count line has no "BOOK" now: the sub-tab over it says which list (Greg).
- **Mashing 2 mods together** (Greg, 2026-11-15: "maybe you make a chip by mashing 2 mods together"). Claude's take:
  - It fits the 3x2 look: a mod's code is 3 letters (TRC, SKM), so a fused chip shows both, one on each row:
    ```
    TRC
    SKM
    ```
  - Both mods are used up. The chip is yours once you cash out with it.
  - **Greg (2026-11-16):** maybe fusing is only for a special chip, at a special node: the bench has no good place for it. Equip 2
    exotic mods, go to that node, fuse them, and get an exotic chip.
  - **What it does:**
    - A BOOT chip: every run starts with the pair, a step weaker (common). Simple, and you build your own opening.
    - Or **recipes:** some pairs make a real chip (TRACER + SNIFFER = the `ps` shell chip). Any other pair fuses into
      SLAG (the accident, below). You find the recipes by trying, like the bench's codes.
    - Or both: a known recipe makes its chip, and any other pair makes a plain BOOT chip of the two.
  - Its rarity is the lower of the two mods'.
  - Open: is fusing a WORKBENCH thing or a deck thing? (Greg's answer above: neither, a special node.) **Then (Greg,
    2026-11-21):** the node is **THE CHROME FORGE**, parked for a pass on more map nodes (BACKLOG section 5).
- **By accident** (Greg): a failed craft now and then fuses its burnt components into a **SLAG** chip: junk with a
  small random effect, and once in a while something good. Some chips might only be found that way.
- **Drops** (**Decided (Greg, 2026-11-16):** no chip for every corp; that's a lot, and it pollutes the pool).
  Chips can still be corp-themed. They come from **the data cache** (the main place), PHISHING, maybe markets,
  boss rewards (chips show up there more, or rarer), rivals (ripped ones, above) and quests. The corp beside each chip below is its theme now, not
  where it drops.
- **Rarity:** the box's outline is in its rarity colour, not a filled tile, so chips don't look like letter tiles.
  Rarer chips are stronger and cost more power.

## What a chip looks like
**Decided (Greg, 2026-11-15):** chips are 3 wide and 2 tall, so they look different from everything else (letter
tiles, mod badges and gear chips are all one row). The sockets get a row taller to fit.

Some ways to fill the two rows (Claude's; to try in asXii):
```
 1UP      1UP      1UP      1UP
 '''      =o=      [*]      .--
code     code     code     code
+ legs   + a bus  + a mark  + a notch
```
- With two rows, a chip can have a filled background in its rarity colour and still never pass for a letter tile.
  That beats the outline-only rule from before (BACKLOG section 11).
- **A socket, 5 x 4:**
  ```
  +---+    + - +    +...+
  |1UP|    :   :    :mk3:
  |'''|    :   :    :   :
  +-+-+    + - +    +...+
  filled   empty    locked
  ```
  Greg's v2 sockets are 5 x 3, so the board art gets a row taller wherever a socket is (done: board v03) (the CRASH stick and the BYTE
  already have their own shapes).

### Everywhere else a chip shows up
Every place gives a chip two rows, and any list it's in has to scroll by row:
- **The deck's info area** (the market-style panel): the chip, then its name and text beside it. Two rows of chip
  leave the text two rows, side by side, like a tile does in HOW TO PLAY.
- **Lists that scroll:** the fence, the deck's own chip list (the chips you own), a codex page for chips, maybe the
  market. The game already scrolls a 3-row thing by row: HOW TO PLAY splits each tile into one line per row
  (`tileRow`, engine/help.js `flatRows`; engine/textboard.js draws them), so a scroll can stop halfway through a
  tile. **Update (Greg, 2026-11-15):** chip lists use the "more" scroll area instead, stepping a whole chip. Also add them to `lineRows` (engine/textboard.js) so the screens that
  count rows count them right.
- **Boss rewards and loot popups:** a chip dropped as a reward takes 2 rows on that screen. Count the rewards
  screen's rows (it's tight on a phone: 23 rows).
- **The belt, mid-run** (if chips ride in the belt): the tray's gear slots are one row (`[PURGE]`). A 2-row chip
  won't fit, so the belt shows a one-row stand-in, e.g. `[#1UP]` in the chip's colour. Tapping it shows the
  real 2-row chip in the detail box. (The chip case, if we go that way instead, has the same problem.)
- **Cashing out and the death screen:** "chips kept" / "chips lost" lines: 2 rows each, or the stand-ins in one
  row when there are several.
- **The workbench:** if a code with a digit builds a chip, the result slot shows it at full size. The bench draws
  itself (`draw`, with its own height), so it has room.

## The map
Board v06 (`asxii_art/deck_board_v06.asxii.json`). The history: v03 made every chip socket 5 x 4 for the 3x2 chips
and moved GLYPH down into mk III; Greg's v04 put your hacker name on the CPU and tweaked a few things; v05 added a
`socket labels` layer (each code on its socket's top border, so it reads with a chip in); v06 added the CRASH socket
right of the stick, and a `readouts` layer (the stick showing the slotted crash chip; in the game it scrolls).

The codes: BT1-2, BI1-2, CRS, SPL, SH1-4, PSU, BYT, PRT (the `[X` ports), GLY, OV1-3, CRW (the crew jacks), SU1-3,
BS1-2 (the wide BOSS sockets), HT1-3, UPL (the uplink jacks).

```
     0. [^]  ..
     ][ |%|  ][     +BT1+ +BT2+ {
     \/  v   \/     ]   [ |   |  }--
     /\  |   /\     ]   [ |   |  |
   +-oo--o---oo-+   +-+-+ +-+-+  |-
[}-o            o=--+BI1+ +BI2+  |-
[} |  POTATO    |...]   [ :   :  |
[} |  SAUCE     |   ]   [ :   :  }--
[}-o  mk II     o=--+-+-+ + - + {
   |            |     +-+
   +-o--o--o--o-+     |.|
   [_ ::::'::: _]     |1|  +CRS+
     |        /       |U[==]   [
     |+   .__/        |P[==]   [
     |_   ||          |.|  +-+-+
      |   ||          +-+
      |   ||                 ]8[
+SH1+ {   ||   +SPL++SH3+   +SH4+
]   [-+   ++>:<]   [:   :   ]   [
]   [ |   ||   ]   [:   :   ]   [
+-+-+ {   vV   +-+-++ - +   +-+-+
      |    \          [___.___]
      |     \______      +---BYT--+
+PSU+ {     +SH2+  }     ]01010101[
]   [-+     ]   [  }-::::+-+-qp-+-+
]   [ |     ]   [  |     (........)
+-=-+ {     ++--+  |
      |     ||     |    __
      +::+::db::+::+   [  ]=----+-[X
       '  ' oo '  '     ||      |PRT
       ,  ,    ,  ,     )(      +-[X
      +::+::vv::+::+    ||
X]CRW |            |___<++>_______
X]====] +=GLY=+                   [
X]    | ].....[ +OV1+ +OV2+ +OV3+ }
X]====] ]..X..[ :   : :   : :   : }
X]    | ].....[ :   : :   : :   : }
X]    ' +=-=-=+ +...+ +...+ +...+ }
       \   ^      ^     ^     ^   [
        \                         [
         \_______----------_______[
          |||||             |||||
          ^   ^             ^   ^
          +SU1+   +.BS1.+   +HT1+
}-        :   :   :     :   :   :
          :   :   :     :   :   :
 UPL      +...+   +.o.o.+   +...+
          +SU2+   +.BS2.+   +HT2+
}-        :   :   :     :   :   :
          :   :   :     :   :   :
          +...+   +.o.o.+   +...+
          +SU3+             +HT3+
          :   :             :   :
          :   :             :   :
          +...+             +...+
```

## The groups

| Group | Where | mk | Slots | What it's for |
|---|---|---|---|---|
| CPU | the big square | II | - | the deck's level; tap it to upgrade |
| ROM | the pin row under the CPU, the parts over it | II | (display) | the BOARD posts you've bought, lit |
| BOOT | BT1, BT2 | II | 2 | what a run starts with |
| BIOS | BI1, BI2 | II | 2 | the run's rules |
| CRASH | the tall stick | II | 1 | what happens when you die |
| SPOILS | SPL, fed straight from the CPU (`>:<`) | II | 1 | what corp bosses give |
| SHELL | SH1-SH4 | II | 4 | one command each, for THE SHELL |
| PSU | the `+=-=+` socket, left edge | II | 1 | the cell: your power budget |
| THE BYTE | the 8-bit socket | II | 1 | secret codes |
| READOUT | the `]8[` | II | (display) | power used, or the mk |
| PORTS | the `[X` jacks, right edge | II | 2 | things outside the page |
| FUSE | the `)(` part over the mk III board | IV | (display) | the bottom band's power |
| GLYPH | GLY (moved down in v03) | III | 1 | your favourite glyph |
| OVERVOLT | OV1-OV3 | III | 3 | pay with integrity |
| CREW | the `X]` jacks, left edge | III | 2-3 | crew links |
| SUDO | SU1-SU3 | IV | 3 | the strong shell commands |
| BOSS | the two wide `o.o` sockets | IV | 2 | big chips from the big bosses |
| HEAT | HT1-HT3 | IV | 3 | harder runs, more REP |
| UPLINK | the `}-` jacks, left edge | IV | 2 | things that play for you |

(OVERVOLT was OVERCLOCK and SUDO was ROOT: OVERCLOCK is a mod and ROOT is a crew member. The chip names are
checked against the game's mods, gear, glyphs and hackers: no clashes.)

## What goes in each

Each chip: what it does, then where it comes from. The first ideas are listed first and the new ones follow
("more"). Power and rarity come later.

### ROM (not sockets: a display, and switches)
- Every BOARD post you've bought lights a pin. **Greg: HARDENED shows here, so you see it's on.** Always on, just lit:
  HARDENED, SEED MONEY, FIELD KIT, GEAR SLOT, RESTOCK, SHORTLIST, SECOND WIND, BETTER DROPS, LOCKER, WORKBENCH,
  STEADY HANDS.
- The ones you might want off are switches: tap the pin. TELL LIGHT, STRAY, LUCKY START, STARTER POOL, BOSS LOOT.
- DEADMAN moved to CRASH (Greg).

### BOOT (2): what a run starts with
- **STARTER:** pick a mod you've found; it can show up in the starter perk. Or a stronger one: you always start with
  it.
- **ARCHIVE:** start with any mod you've found (THE ARCHIVE, the codex reward idea).
- **PET:** pick which pet comes along: the chick, STRAY's bug, CATPHISH's fish. **Greg (2026-11-16):** COMPANION is a mod that
  does something, so it isn't a PET pick: either COMPANION's pet always comes when the mod is on, or it comes along
  with your REP pet. Setting your earned pet is the good part.
- **KIT:** start with a given gear.
- More:
  - **HEADSTART:** start on the second row of sector 1. RYDR. (Greg: no REP penalty.)
  - **PRELOAD:** start with 3 random gear. PARCELNET ("it's out for delivery").
  - **TRUST FUND:** start with +60cr. LEDGER TRUST. (Greg: no penalty. It was "the first market's prices are up
    25%".)
  - **FRESH INSTALL:** no starter mod, +2 INT and 100cr. MEGAMART. (Greg likes it. Claude: a run starts with no
    mods, and the starter perk offers one; this skips the perk.)
  - **LOADOUT** (Greg, 2026-11-16; name to pick): start with about 3 firewall shields and some frags. A battle chip.
  - **FREE PRESS** (was BLUEPRINT, renamed v15.10: Greg, 2026-11-21, a blueprint is knowing how to craft something; also up: SPARE PARTS, ALPHABET SOUP) (Greg's version): your first workbench build in a run costs nothing. PURLWISE. Dropped: starting
    with a recipe's letters, because components only go when you use them, so the letters could be farmed.
  - **BOX OF WIRES** (Greg, 2026-11-16): start with every mod slot full of low mods, a set list. Dropped: CLONE
    (your best mod a step lower), because not every mod has a step lower.
  - Dropped: MIXTAPE (pick the run's music), because the same music every run gets old (Greg). Instead, maybe not
    a chip: the `----` rule above the mods becomes an EQ that moves with the real music, like DECIBEL's waveform.
    (Claude: doable if the music plays through Web Audio; check engine/music.js.)
  - Dropped: SEED VAULT (start on your best run's seed), because you can type the seed in.
  - **Class chips** (Greg, 2026-11-16): start with a set: one mod and some gear. Paladin, cleric, knight, rogue (D&D
    or cyberpunk classes); one or two stronger and rarer. A BEAST MASTER starts with a pile of crew calls (TEAM
    EFFORT).

### BIOS (2): the run's rules
- **NEMESIS** (**Decided (Greg, 2026-11-16):** one chip, not one per corp). It unlocks after you've beaten
  corps (any corp 5 times, say); buy it and you get the chip. Pick the corp from the ones you've beaten (the CPU's
  NEMESIS setting does this now). Flip it to AVOID and that corp shows up less.
- **FRESH:** corps you haven't beaten come up more.
- **+1 LAYER:** every corp gets one more layer, for more REP.
- **EVENTS:** sector events from sector 1.
- **ADWARE:** more ads, and tapping one heals 1 INT.
- More:
  - **Theme chips:** a family of corps comes up more: CASINO (LUCKEEZ, MONTY, BIDBLITZ, DROP-4), CLOCK (CHANNEL 9,
    COLDBREW, WATCHPOINT, RYDR), DARK (BLACKOUT, NOIR, PREDATOR). From a boss of that family.
  - **QUIET:** no rival hackers. TELEPHONIX ("please hold"). Its flip side, **LOUD:** more rivals, and each pays more.
  - **SAFE ROUTE:** a safehouse on every sector's map (BACKLOG section 5: "a guaranteed heal each sector").
    SAFEHARBOR.
  - **PIER PASS:** a PIER on every sector's map. A rare PIER catch.
  - **ALMANAC:** the next sector's event is shown a sector early. NIMBUS WEATHER.
  - **SHORTCUT:** one fewer row each sector, and less REP. LIFTCO.
  - **SPRAWL:** one more row each sector: more markets, more corps. GENCORP.
  - **CORP STORE:** one market a sector sells only corp mods and gear, dearer (BACKLOG section 5). MEGAMART or SOLD!
    (BIDBLITZ).
  - **Greg (2026-11-16):** most of these are good, if they don't bend a seed too far ("Seeds" above). SPRAWL: the map scrolls, so
    the screen has room, but a sector's length is fixed in the code (`SECTOR_STEPS`, engine/map.js), and the extra
    row needs its own random stream (like +1 LAYER). Real work, so later.

### CRASH (1): when you die
- **ROOTKIT** (Greg, 2026-11-20; built v15.02, RK1): die with THE SHELL's charges left: they all burn, back with 1 INT.
  Charges back, it saves you again. (And SHELL got **CAPACITOR**, CA4: just charges.)
- **The socket** (Greg, 2026-11-15): a normal 3x2 socket, next to the stick. The stick is its readout and shows
  the slotted chip's name, top to bottom. It's 5 tall inside; a longer name
  (DEADMAN) scrolls through it (**Decided (Greg, 2026-11-15)**). **Then (Greg, 2026-11-16; to do):** it swaps to the
  next part instead, with a little character-swap effect. The socket goes right of the stick, where the glyph
  was (Greg: there's room for a normal chip there), wired to it by the stick's tabs.
- **1UP:** b0y's crash unit, from beating G0D. Back to the start of the corp.
- **DEADMAN** (Greg: it goes here): dying keeps 25% / 50% of the REP. Bought on THE BOARD, as now.
- **CHECKPOINT** (**Decided (Greg, 2026-11-16):** the one respawn chip): once a run, die and you respawn with
  nothing (no mods, no gear) but full INT.
  Dropped: REBOOT, CRYO and CLONE BODY, because several die-and-restart chips take the fun out of finally getting the
  1UP (Greg). CRYO was also too much to keep track of; Greg likes the name for something else.
- **BLACK BOX:** when you die, one mod goes to the LOCKER: you choose which, if the LOCKER has room (Greg).
  - Or (Greg): when you cash out or die, all your mods and gear get shredded into components. **Greg (2026-11-21):** a
    decent idea to keep, maybe as its own CRASH chip (not a REP buy). Not built.
- **EJECT:** cash out from anywhere, once a run.
- **A mod saves you** (Greg): a killing blow takes a mod instead, if you have one. It's a shield, not a death, so it
  goes somewhere else (OVERVOLT, or a gear).
- More:
  - **INSURANCE:** die and your next run starts with half the credits you had. SAFEHARBOR ("read the fine print":
    the premium comes off every payout).
  - **CODEX** (Greg; name to pick): when you die, something in the codex unscrambles.
  - **DEAD DROP:** when you die, your gear is waiting in the first cache of your next run. BONEYARD. (Greg likes it.)
  - **MEMORY** (Greg's version, 2026-11-16): on any seed you've played, the map marks your last path (the network
    lines), whether you cashed out or died. Only the last 5 seeds or so, kept on this device, not in the save.
    (Claude: a path is a short list of node ids, so it's tiny. It's close to the BOSS list's GHOST.) FORGET-ME-NOT
    ("you were here before. remember?").
  - **OBITUARY:** a death past layer 30 pays REP as if you'd cashed out at the last UPLINK. HEADLINE NEWS ("if it
    bleeds, it leads"). (Greg likes it.)

### SPOILS (1): what corp bosses give
- **The switch** (Greg): REWARDS / HEAL / CASH. Skip a corp boss's rewards for a heal or for money.
- **GEAR:** skip the mods, take a gear. And one that skips them for loot (Greg).
- More:
  - Dropped: CHIP HUNT, because there's no chip per corp now. Instead (Greg): chips show up in boss rewards more, or
    rarer.
  - **GAMBLE** (Greg's version): one mystery item in the rewards, good or lame. Pick it and it's yours: if your
    slots are full, you take it (swapping something out) or it's gone. No backing out to pick another. LUCKEEZ.
  - **OFFERING:** skip the rewards and bank REP instead. THE CHOIR ("have faith. or pay.").
  - **AUCTION:** pay credits to reroll the choices, like a market's reroll (Greg). BIDBLITZ LIVE.
  - **SALVAGE:** pick a reward, then SALVAGE instead of TAKE, and you get its letters for the workbench (Greg). Or
    just a bunch of components. DEMOLITION CO.
  - **HEIRLOOM:** the mod you pick goes straight to the LOCKER, not your run. DEWEY SYSTEMS. The LOCKER has limited
    room: when it's full, the choose-what-to-replace dialog opens (Greg).
  - Dropped: PAWN (your pick sells for double), because you can't sell mods at a market. Selling mods could be its
    own thing, maybe a REP buy (Greg).
  - **PROTECTION** (Greg's version, maybe): skip the rewards for a firewall or two. LA FAMIGLIA ("nice node you
    got"). Dropped: an extra choice at the next boss, because late in a run your slots are full and you skip rewards
    anyway; more choices don't help (Greg).

### SHELL (4): one command each
**Built v15.03** (Greg, 2026-11-20: "all of them"): `cd ..` CD2, `scan` SN5, `rm` RM1, `kill -9` KL9, `cat` CT1, `sleep`
ZZ3, `whois` WI5, `undo` UD2. Charges / cost: cd 2/2, scan 3/1, rm 2/2, kill 2/1, cat 3/1, sleep 2/1, whois 1/2,
undo 1/3. Each is "hacked", not practice. `scan` here: the map already shows corps and anomalies, so it lists the
corps ahead by row and lifts BLINDERS and FOG for the sector (the next sector's event, ALMANAC's idea, doesn't exist
yet when you'd scan). `kill` takes `-9` so it can't go off by accident.
- Commands work in THE SHELL while the chip is slotted. A run that used one is marked hacked on the leaderboard.
- **`cd ..`:** go back a row on the map (BACKLOG section 1 had this as an exotic mod).
- **`market`:** a small black market right where you are (section 1's "call a market").
- **`scan`:** see the corps and anomalies ahead (section 1's SCOUT).
- **`decode`:** read CIPHER for a layer (section 1's DECODER).
- **`kill`:** end the run now.
- More (each once a sector unless it says):
  - Dropped: `ls` (how many ICE and $ nodes on a layer), because you can see the ICE, and there's always one real
    node (Greg).
  - **`ps`:** which rival hacker is which (the map already shows a hacker is on a node). WATCHPOINT.
  - **`man`:** opens this corp's codex entry right then, in a popup, mid-layer. DEWEY SYSTEMS.
  - **`undo`:** take back your last ICE hit (the PARADOX gear idea, section 1). CHRONOS.
  - **`cat`:** see what a cache or $ node holds before you open it. PARCELNET.
  - **`sleep`:** the layer clock stops for 5 seconds, once a layer. COLDBREW (the opposite of espresso).
  - **`echo`:** use your last gear again. ECHO LABS ("we hear everything. ping.").
  - **`rm`:** delete one ICE on this layer. DEMOLITION CO.
  - **`whois`:** prints this corp's tell. Strong, so a rare drop. NOIR & ASSOCIATES ("everybody lies. except one.").
- **Open (Greg, 2026-11-16):** come back to the SHELL chips once THE SHELL's intro and place are worked out.
  Greg's lean: THE SHELL is all-powerful but has limited uses, and chips give it more charges, or work with its
  commands (`give` at a higher rarity, say; `give` may already be too strong). These small commands are weaker than
  god mode, which is probably good.

### PSU (1): the cell
- **STOCK CELL:** comes with the deck. A small budget.
- More:
  - **LI-ION:** a bigger budget. BRIGHTLINE POWER.
  - **BROWNOUT:** a big budget, but one random chip is off each run. A notice says which chip went offline and
    what it does (Greg). BLACKOUT.
  - **REACTOR:** a huge budget, -1 starting INT. HALFLIFE NUCLEAR ("perfectly safe. mostly.").
  - **WIND-UP:** the budget is how many sectors you cleared in your last cash-out. PLAYTIME ("wind it up and watch
    it go!").
  - **POTATO:** a tiny budget, but 1-power chips cost nothing (or half) (Greg). Common. BURGERTRON.
  - **SPORE CELL:** the biggest budget, and the mold creeps over the board, spreading a little along the traces
    (Greg). Looks only; maybe it never does anything. From H3AV3N.
- **A boss on your deck** (Greg: "fight him on your deck"): a rival breaches your deck mid-run. The layer turns into
  your own board: the sockets are the nodes and your chips are the ICE. It goes for your PSU, and you tap to defend.
  If it lands, the FUSE blows and the bottom band is dark for the rest of the corp. KONAMI, or a rival like SYSOP.
  That's where the PSU and the FUSE show up in a run.
  **Greg (2026-11-16):** still likes it; it goes in a boss or a quest. Maybe whack-a-mole: the rival hides in your chips and you
  find it, so the more chips you run, the harder it is.

### THE BYTE: secret codes
- **The look** (Greg, 2026-11-15): the bits are one row. The `(........)` under them is a readout: a scrolling
  ticker that says when a code does something ("0xFF: OVERFLOW wakes up"), or anything else we want there.
- Eight switches, so 256 codes, hidden around the game in binary or hex. Most codes do nothing. Ideas:
  - `11111111` (0xFF): **OVERFLOW**'s boss seed. Add one more and it wraps; that's his whole joke.
    **Greg (2026-11-16):** yes, but teaching it is awkward. Open. (Claude: you'd enter 11111111 and the next run is OVERFLOW's
    seed; the readout's "add one more and it wraps to 00000000" is just the joke, not a second code to enter.)
  - The other boss seeds (TWIN, PHISHER, SLEEPER...), one code each, hidden where BACKLOG section 4 says the
    seeds turn up.
  - `00101010` (42): a joke line, and nothing else.
  - `10110000` (0xB0): b0y's code. His palette, or a line from him.
  - `10000000` (0x80): DOUBLE TIME. Everything runs 2x for a run.
  - `00000001`: MONO. The palette goes greyscale.
  - `01111111` (0x7F, DEL): "access denied", and the switches flip themselves back. A troll.
  - **Greg (2026-11-16):** don't worry much about these yet. MONO is the one to turn on for now. More like it would be good:
    codes that put an effect over the whole game (a constant glitch, chromatic aberration).
  - A HARD mode code: every corp a tier higher, REP x2.

### PORTS (2): things outside the page
- The second window (THE SHELL in its own tab), and TWIN's tab or your phone as a second screen.
- More (each one turns a browser feature on, so it waits until it's built):
  - **MIC:** the mic tricks: PHREAK's whistle, blow on the mold, clap a rhythm (BACKLOG section 4, "the mic").
  - **GAMEPAD:** controller support (the browser's Gamepad API).
  - **MIDI:** plug in a MIDI keyboard to play SIMON's notes back.
  - **MODEM:** multiplayer, when it comes back (shelved now).
  - **PRINTER:** print your run card, or save it as an image to share.
  - **CLOCK:** the real time, for CRON ("come back at 3:33") and the daily seed.
- **Greg (2026-11-16):** nothing to build yet; these are for later. PRINTER could really print (secret codes on paper!).
  Claude: the game builds a hidden page (the run card, a code) and opens the browser's print dialog; no PDF needed.
  Phones print unevenly, so it's a desktop treat.

### GLYPH (1, mk III): your favourite glyph
- **Greg:** a REP unlock to pick a favourite glyph. Tap it when you see it on a layer and it acts like a loot node,
  ICE or real. Or you pick the mod it gives.
- More (glyph chips that change what your glyph does):
  - **SIGNED:** your glyph never hurts you; as ICE it hits for 0. SIGIL DYNAMICS ("we sign everything we make").
  - **GOLDEN:** when your glyph is the real node, it pays double. ZODIAC HOUSE, if you take a new glyph each run.
  - Dropped: WORD (a letter glyph), because letters only come up in LEXICON (Greg).
  - **SPOTLIGHT:** your glyph always glows a little, so you see where it is. An add-on: it still pays as before.
    KERNING. (Claude: weak; cut it, or fold it into COLLECTOR.)
  - Dropped: MIRROR (Greg).
  - **FORGERY's partner:** your glyph turns $ nodes into exotic mod nodes (BACKLOG Medium and small). FORGERY is
    SIGIL's legendary mod ($ nodes do no damage). Greg: sure.
  - **COLLECTOR:** each time you tap your glyph, +1 to a counter; at 10, a free mod. HAUTE//COUTURE. (Greg likes
    it.)

### OVERVOLT (3, mk III): pay with integrity
- **Greg likes it.** Each one costs starting INT for something else:
  - **GREED:** +25% credits.
  - **LUCK:** 1 in 5 drops roll a step rarer. (Greg asked for rarity.)
  - **FAME:** +20% REP banked.
  - **SPIKE:** +2 power for the deck.
- More:
  - **DONOR:** -1 INT, one more mod to pick from at the start. MEDIX ("this might sting a little").
  - **GLASS:** -2 INT; every ICE hit pays credits. AEGIS DEFENSE. ("Derezzed ICE" was a made-up word. Greg: OK if
    it comes up often enough.)
  - **CHEAPSKATE:** -1 INT; markets are 20% cheaper. MEGAMART.
  - **TOLL PASS:** -1 INT; UPLINKs cost 25% less. TOLLGATE ("exact change only").
  - **RED EYE:** -1 INT; one decoy each layer is marked. COLDBREW ("another shot?").
  - **LAG:** -1 INT; layer clocks +2 seconds. BULLET TIME INC.
  - The other way: **UNDERVOLT** (+1 INT, -25% credits) and **PADDING** (+2 INT, perfects pay no REP). CARAPACE
    ARMOR.
    (Perfects do pay REP when you cash out, with depth, breaches, credits and sectors.)

### CREW (2-3 jacks, mk III): crew links
- Plug in a crew member you've hired: their calls come more often, or one free call a run. Their LVL 2 perk might
  need the link.
- More (one per crew member):
  - **POPS:** one tell hint a sector, in his voice.
  - **NANA:** a care package (a PATCH) every sector.
  - **BRICK:** the first ICE hit in each corp is blocked.
  - **KLUDGE:** a failed craft at the workbench gives the letters back.
  - **HYPE:** perfect layers pay +5cr.
  - **NULL:** one rival a sector doesn't turn up.
  - **DIALUP:** the map shows one more row ahead.
  - **b0y** (the quest crew): his split cursor marks the maybes once a corp.
  - Two crew who know each other, both plugged in: a bonus for the pair.
  - **Greg (2026-11-16):** or simpler: once someone's on your crew, you have their chip. Or their calls could be cheaper at the
    market.

### SUDO (3, mk IV): the strong commands
**Built v15.03:** `mode.god` GD1, `mode.hold` HD4, `show.real` RL2, `breach` BR3, `give.mod` GM1 (player versions;
dev mode keeps the dev ones: docs/SHELL.md). **Built v15.06:** `mode.free` FT3 (epic, 3), `corp.jump` JM4 (legendary,
4), `rm -rf` RF4 (legendary, 4), `chmod` CM3 (epic, 3); they drop like the other chips (by rarity: no corp drops yet).
**Built v15.07:** `fork` FK2 (legendary, 4). A SUDO chip gives exactly one use of its own command in charges (Greg:
"a powerful command but it only provides one use"): god 4, hold 3, real 2, breach 4, give 4 (v15.04); flatline went 1 -> 3.
- **`mode.god`:** no damage for a sector, then it wears off.
- **`run.seed`:** pick the seed of your next run.
- **`flatline`:** a rival in this corp drops dead.
- **`give.mod <mod> [tier]` GM1, `give.gear <gear> [tier]` GG1** (v15.04; **Decided (Greg, 2026-11-20):** you name it, no
  1-of-3). Common and rare: anything you've found (the codex). Epic and up: only what you've shredded at a workbench at
  that rarity or higher (save.shredded keeps the top tier of each). Charges by rarity: common 1, rare 2, epic 3, legend
  4, exotic 5, as often as your charges last (Greg: "let them use up their charges"). The tier is a number (`tracer 2`), `lv2`, or a rarity (`tracer epic`); none: the
  lowest you may summon. The chips give 4 charges (a legendary; an exotic needs a CAPACITOR). Alone it lists yours, free.
  Dropped: pick 1 of 3, once a run (v15.03), because Greg wanted to name it.
- More (the dev commands, earned for real; Greg: the strong ones he was after):
  - **`mode.free`** (built v15.06): free travel on the map for a sector: every node in it, the boss too.
  - **`mode.hold`:** the layer clocks stop for a corp.
  - **`show.real`:** the real node shows for one layer, once a corp.
  - **`breach`:** win this layer outright, once a run.
  - **`corp.jump`** (built v15.06): skip to this corp's boss, from one of its layers.
  - **`rm -rf`** (built v15.06): every ICE on this layer is gone, one after another. Not on a sector boss (like NUKE). HALFLIFE NUCLEAR.
  - **`fork`** (built v15.07; **Decided (Greg, 2026-11-21):** "build the fork like quantum"): the real node forks. Every
    layer of this corp (3+ nodes) has a second real node, wearing the real one's glyph so the tell finds it too, and the
    pay stays whole. With QUANTUM it's QUANTUM's node, and QUANTUM's pay cut is off for the corp. Not in tap corps.
    CLONEWORKS. Dropped: copying a mod (a run holds one of each), doubling a mod, a free slot (Greg: temporary slots
    are weird). Later, maybe: a duplicate cursor (your tap opens two nodes; b0y's split cursor).
  - **`chmod <mod>`** (built v15.06): a mod goes up a rarity till the sector ends, once a sector. Not BUFFER, BOX OF
    WIRES or MUTATE (their step changes more than numbers). (CHMOD was a gear name with no effect yet, section 1.)


### BOSS (2 wide, mk IV): the big bosses
- OMNI's, H3AV3N's, KONAMI's. **G0D.exe** could be one, so it comes along every run.
- **CRON** (Greg, 2026-11-20; not built): THE SHELL's charges refill every sector. Goes with making run-long charges
  the default (docs/SHELL.md "Charges"). **Greg (2026-11-21):** later, once there's a boss for it (maybe the real-time one,
  BACKLOG "CRON: only there at a real time"); till then charges refill every sector.
- More:
  - **OMNI'S EYE:** every corp's card on the map shows its tell.
  - **THE MOLD** (G0D): ICE you've hit once rots, and can't hit you again.
  - **HAD3S'S COIN:** every third ICE hit is free.
  - **CERBERUS:** three more gear slots. (Greg: the tray has no room. Needs another effect.)
  - **MYCONET:** beating a corp takes a layer off the corps next to it.
  - **MANTIS** (when it exists): one wrong tap a corp is forgiven ("it reads your mind").
  - **PHISHER** (when it exists): one ICE node a layer is a fake that pays.
  - **GHOST** (when it exists): on a seed you've played, the node you tapped last time is marked.
- **Greg (2026-11-16):** these wait on bosses that don't exist yet. One for now: **G0D'S EYE**, so the divine components show up in
  a run. You get it by beating G0D about 10 times.

### HEAT (3, mk IV): harder runs, more REP
- TAXED (a cut of every payout), AUDITED, RANSOM. Each one adds to the REP a run banks.
- More:
  - **HARDCORE:** no CRASH chip works. +50% REP.
  - **HUNTED:** twice as many rivals. PREDATOR ("we see your heat").
  - **SHORT FUSE:** layer clocks -2 seconds. CHANNEL 9.
  - **NO MEDS:** no PATCH drops, no heals at markets. MEDIX.
  - **INFLATION:** prices +10% every sector. LEDGER TRUST.
  - **DECAY:** your mods drop a rarity every sector. BITROT.
  - **FOG:** the map shows only the next row. NIMBUS WEATHER.
  - **GLITCH:** every ICE hit adds glitch to the screen (section 6's "glitching up"). UPSIDE.
  - (Greg likes all of these.)

### UPLINK (2 jacks, mk IV): things that play for you
- **G0D.exe**, if it isn't a BOSS chip. Or the AI crew member (Low priority), which may be the same thing.
- More:
  - **More clicks:** a second jack doubles G0D.exe's click limit.
  - **SHOPPER:** G0D.exe's market logic shops for you, and you play the corps.
  - **TUTOR:** G0D.exe says why it would tap a node, so you learn the tells.
  - **RIVAL'S REPLAY:** race a leaderboard run's REPLAY on the same seed.
  - (UPLINK and PORTS could be one group, if we cut.)
  - (Greg likes these; a way to set up G0D.exe is the good part.)

## Moves to the layout
Greg: sockets that open earlier should sit higher on the board.
- **GLYPH moved down** into the mk III board (done in v03). Its old spot up top, right of the CRASH stick, is free.
- **CRASH stays up top:** DEADMAN fills it from the start, and the 1UP joins it later.
- **THE BYTE stays up top:** visible from the start, doing nothing until you find a code.
- **The `[X` PORTS** wait on features that aren't built. Leave them dark where they are, or move them down.

## Open
- **The ladder:** the deck at USER, mk III at ELITE, the FUSE at SYSOP. **Decided (Greg, 2026-11-16):** yes (below).
- **The power budget:** chips cost 0-3 power and the cell sets the budget. **Decided:** yes, first pass (Power).
- **Carrying a chip home:** **Decided (Greg, 2026-11-16):** a gear slot, for now (Chips, above).
- **Chips in your profile color?** **Decided (Greg, 2026-11-16):** no. The deck's own color (traces, effects)
  comes from its mk's rarity, and chips keep their rarity colors. Dropped: the profile-color toggle in the mockup.
- **The training** (**Decided (Greg, 2026-11-16)**): POPS, since you may not have the 1UP yet. When you reach USER
  (past the first set of REP buys), a popup introduces the deck.
- **Pump it** (Greg's meat notes, 2026-11-16: "more effects going on when stuff happens"). Done:
  - **Snakes along the wires** ("the pulse should follow the traces", like the trailer's end card): a chip going in sends
    3-11 lit snakes out along the board's wires (more and longer the rarer), and short dim ones run on their own.
  - **A ripple** (two rings, not one burst) that **shows hidden tech blobs** as it passes.
  - **The deck comes alive as it fills:** hidden blobs glow (dim) and twinkle, and snakes run more often, the more
    chips are in and powered, the more power is used, and the higher your mk (engine/deck.js deckEnergy).
  - **Smooth scrolls** (about half a second): the NO POWER bar, SLOT from the CHIPS tab.
  - **The mk upgrade fanfare:** the new board boots, a sweep runs down it row by row with a burst at each socket,
    then snakes and a ripple out of the CPU, a fanfare (Sound.deckUp) and "mk III ONLINE." Bought in the deck, it plays
    right away; bought on THE BOARD, the first time you open your deck after (save.deck.seenMk).
  - **THE BYTE's 0s** in the card are text white, so they read as switches.
  - Greg likes: the CRASH stick's text and swap, and the glitch around a chip with no power. (Kept.)
  - **The 1UP is a chip** (**Decided (Greg, 2026-11-16):** yes, and say so in the ending). Beat G0D and b0y gives you
    his 1UP chip (exotic, CRASH, power 3), once (save.deck.got1up); it goes in CRASH if that's empty. A run only gets
    its 1UP while the chip is slotted and powered (HARDCORE turns it off with the other CRASH chips). A save that beat
    G0D before this gets the chip the same way. No deck yet: it comes with the deck. The ending says so: b0y's line
    in the scene, "1UP chip" on H3AV3N CLEARED, and POPS's call the first time. It never drops.
- **A DECK tab on THE BOARD** (built v15.05: two tab rows, YOU REP DECK over FEATS CREW QUESTS; DECK opens your deck. Greg, 2026-11-16: noted then): today the deck is THE BOARD > YOU > [ YOUR DECK ].
  It deserves its own tab up top. Space: the tab row is 35 of 36 wide now ([YOU] [REP] [FEATS] [CREW] [QUESTS]), so a
  [DECK] tab needs room: shorter labels, or a second row, or one tab folds in.
- **The deck's training** (roughed in v15.05: POPS's 6 lines on the first open, engine/deck.js deckTrainLines; `deck.pops` replays them. Greg, 2026-11-16: noted then): so far only POPS's call at USER (3 lines and
  [ SEE YOUR DECK ]). Claude's idea, like the bench's first-time POPS lines (engine/bench.js popsSeen): the first time
  you open your deck, a few POPS lines pointing at each part (sockets: tap, tap again to slot; the PSU and power; the
  CPU and its mk; chips ride home in your belt), and one line on your first chip drop in a run. Seen once, saved; an
  editor button to replay them.
- **Where it lives and its name** (**Decided (Greg, 2026-11-16)**): it's **your deck**. It lives in THE BOARD screen
  and opens nearly full screen, with just a back button. From then on the CPU upgrades are REP buys, on the REP page
  or in the CPU's popup: ELITE has the mk III one, SYSOP the mk IV one. ELITE and SYSOP still need their other buys: **for now, placeholder buys that do nothing** (Greg, 2026-11-16), to swap
  for real ones later.
  (Claude: it fits. One snag: "the board" means the REP screen and also this doc's circuit art; say "your deck" for
  the whole thing.)
- **The first chip set** (Greg, 2026-11-16): chips for most of the groups, from things the game already has. SHELL
  and SUDO get only a couple each until THE SHELL is sorted out, so we can see them work.
- **The build, in batches** (Greg, 2026-11-16): 1, the real deck (THE BOARD, the save, POPS at USER, the mk buys; done: THE BOARD > YOU >
  [ YOUR DECK ], save.deck, the DECK mk III and THE FUSE posts, 3 placeholder posts each on ELITE and SYSOP, the CPU's
  switches turn posts off for runs (engine/save.js postOn), OVERCLOCK saved);
  2, chips as loot (drops, a gear slot, cashing out; done: DATA CACHEs 20%, a PIER gear catch 25%, weighted by rarity,
  on their own seeded streams; the 1UP and the starter chips never drop. A chip is gear (`chip_` + its key) that can't be
  used, its belt code is its face (the two rows take turns), its tip says NEW or how many you have; a full belt gets
  the swap; cash out and it goes home (a YOUR DECK note), die and it's gone; the bench shreds it into its code's letters); 3, the first chip set (done, 22 chips: BOOT TRUST FUND, LOADOUT, BEAST MASTER, FRESH INSTALL; BIOS QUIET;
  CRASH DEADMAN, BLACK BOX; SPOILS the switch; PSU the 4 cells; OVERVOLT GREED, LUCK, FAME, SPIKE; SHELL whoami, ps;
  SUDO flatline; BOSS OMNI'S EYE; HEAT HARDCORE, TAXED. The chips slotted, open and powered as a run starts are on
  for that run (run.chips; HARDCORE turns CRASH off). SHELL and SUDO chips teach a command in THE SHELL (`): safe, but
  the run is marked hacked. GLYPH and the CREW jacks have no chips yet); 4, the show (done: a chip with power sends a burst of confetti and tech blobs, more the
  rarer, and a ring of light out across the board; no power drains the light into the socket, dims the board, fills it
  back, with red static; sounds chipIn (a chime by rarity), chipDead, fanUp (a cell), powerDown; the traces lean to the
  mk's color; toned-back silkscreen, vias and data packets; the NO POWER bar steps through the chips; the CRASH stick
  swaps words with a scramble); 5, later (SHELL, SUDO, ripped chips, fusing, BOSS, UPLINK, PORTS).
- **The cuts:** once the lists settle. BOOT and BIOS could share 4 sockets; UPLINK could fold into PORTS.

## The second chip set (Greg, 2026-11-16)
**Decided (Greg, 2026-11-16):** "just make up most of those other chips", even without a good source or purpose yet.
Mark the far-off ones BETA so we know they need more work. Leave out the chips waiting on something else (SHELL,
SUDO, the BOSS chips but OMNI'S EYE, GLYPH, CREW, UPLINK, PORTS, SPRAWL / SHORTCUT, +1 LAYER). Add the sources too.
Fusing, SLAG and the WORKBENCH's chip item stay ideas for now.

50 new chips (73 in all). Their numbers are a first pass, to playtest. Each one's hook is marked "(a chip:
engine/deck.js)" where it lives. tools/checks/tests/chips.js checks them.
- **BOOT:** PRELOAD (3 random gear), FREE PRESS (the first WORKBENCH build uses no letters), JUNK DRAWER (6 low mods;
  it was "BOX OF WIRES" here, but that's a mod's name), PALADIN, ROGUE, KNIGHT, CLERIC (classes: a mod and some gear).
- **BIOS:** LOUD (a rival in 1 corp in 4 that had none; rivals pay double).
- **CRASH:** CHECKPOINT (once a run, back with nothing but full INT), EJECT (THE SHELL's `eject`: cash out from the
  map, once a run; not marked hacked), INSURANCE (half your credits, next run), DEAD DROP (your gear, in next run's first
  DATA CACHE), OBITUARY (die past layer 30: all your REP).
- **SPOILS** (in place of the switch): GEAR (3 gear, not mods), OFFERING (no rewards, +6 REP), PROTECTION (no rewards,
  2 FWALLs).
- **PSU:** BROWNOUT (12; one chip off each run, from the seed, and a line says which), POTATO (4; the 1s are free),
  WIND-UP (2, +2 a sector of your last cash-out, 14 at most).
- **OVERVOLT:** DONOR (a bigger starter pick), GLASS (-2 INT; ICE pays 8cr), CHEAPSKATE (markets -20%), TOLL PASS
  (UPLINK fees -25%; what a mod sells for there stays), RED EYE (one ICE a layer ruled out), LAG (clocks +2s), UNDERVOLT
  (+1 INT, -25% credits), PADDING (+2 INT, perfects pay no REP).
- **HEAT** (REP: they multiply): HUNTED (a rival in half the corps that had none, +25%), SHORT FUSE (clocks -2s, +20%),
  NO MEDS (no PATCH anywhere, no market repair, +20%), INFLATION (prices +10% a sector, +15%), DECAY (mods drop a step
  every sector, BUFFER keeps its step, +30%), FOG (the map shows the next row only, +15%), GLITCH (each ICE hit
  glitches the screen, worse every time, +10%).
- **BETA** (`DECK_BETA`: what each one is missing). They show BETA in your deck and never drop; the editor's "unlock
  all chips" and THE SHELL give them. HEADSTART, FRESH and the theme chips (CASINO, CLOCK, DARK), EVENTS, ADWARE, SAFE
  ROUTE, PIER PASS, ALMANAC, FORGET-ME-NOT, GAMBLE, AUCTION, SALVAGE, HEIRLOOM, SPORE CELL (its power works; the mold
  isn't drawn yet). Most are map work, or need the placeholder corps so seeds hold still (Seeds, above).

**The sources** (each on its own seeded stream, so a seed's other rolls stay put; BETA chips never come from any):
- DATA CACHEs (20%) and PIER gear catches (25%), as before.
- **Markets:** 15% of the time, a chip for sale (40cr common ... 240cr exotic; CHEAPSKATE and INFLATION count).
- **Corp boss rewards:** 12% of the time, a chip is one of the picks.
- **Rivals:** beat one (or flatline it) and 30% of the time it drops a chip (PH1SH'S HOOK: 60%). It's **RIPPED**: from
  the ripped set only.
- **THE FENCE** (when THIEF made one): a RIPPED chip, at twice a market's price: a row in its list, under your stolen
  mods, on its code chip like gear at a market (v15.09; Greg: "it should fit there the same way").
- **RIPPED** (built v15.08): while one is on your belt, a rival comes to every corp with no other anomaly (QUIET still
  stops them). Sell it, trash it or lose it to a rival and that's off; cash out and it's yours, a chip like any other.
  A rival that gets away (stole a layer, not flatlined, not thrown out) takes one back. POPS calls the first time you
  get one, and the first time one is taken (save.deck.ripSeen, ripLost). Magenta runs through the chip on the belt and
  in your deck (deckRipGlow). They sell (their share of a market chip's price); other chips don't.
- **The ripped set** (v15.08, Claude's; Greg to look): LIFTED WALLET (common BOOT, +50cr to start), TURBO'S NITRO (rare
  BOOT, 2 WARP to start), VULTURE'S CUT (rare BIOS, rivals pay +50%), D0PPEL'S MASK (epic BOOT, +2 max INT), PH1SH'S HOOK
  (epic BIOS, rivals drop chips twice as often), SYSOP'S KEY (legendary BOOT, a corp's first layer: the real node
  marked). Named for the rivals they came off. No exotic yet.
- **Decided (Greg, 2026-11-21), ripped chips (built v15.08):**
  - **The name:** RIPPED (you ripped it out: "w00f is gonna want that back"), was HOT, because HOT read like the HEAT
    group. Renamed in the code v15.06 (the drop, fence lines and button; v15.08 drops the run.ripped flag: the belt says). Dropped: SWIPED, FLAGGED,
    BOUNTY, CONTRABAND, PINCHED, RIP; BOOTLEG kept for later (BACKLOG, Parked).
  - **The chase:** while you carry a ripped chip, every corp node has a rival. A node that already has another anomaly
    keeps that anomaly, and no rival comes there. **Then (Greg, 2026-11-21):** rivals don't need to move between nodes:
    every node that can have one has one.
  - **The chase lasts while you have the chip.** Sell it or trash it and the chase is gone.
  - **Two ripped chips are no worse than one.**
  - **A rival you don't beat takes the ripped chip back.** POPS calls when you pick up your first ripped chip, and again
    when a rival takes one back.
  - **Ripped chips are a set of their own,** in a few rarities: the rarer, the stronger. They slot into the usual
    sockets.
  - **The look:** a ripped chip shows its own rarity color with magenta (the workbench's) cycling through it, animated.
    Not red: red is DIVINE's. Its one-line text says RIPPED.
- **Quests** (beta): the OMNI RAID gives OMNI'S EYE, once. There's only the one quest so far.
- **Decided (Greg, 2026-11-17):** exotics stay in the random drops (weight 1, about 1 chip drop in 1,700). They're rare, and the quest still guarantees its one. Get it early, fine; get a dupe, sell or shred it.