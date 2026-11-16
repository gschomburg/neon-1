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
- **F is a secret:** OVERCLOCK, a BYTE code (00001111), runs the cell at 15 for a run.
>>> seems like the overclock would just be a thing you can unlock and set i'm not sure why or how we limit it to a single run
- **A rule for judging a cell:** spare = power - paid sockets. Negative early, about 0 mid-game, +2 at the max.

>>> as a side note we should make the no power notification bar into a thing that scrolls the deck to a chip that needs power if you click it

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
- **Carrying one home:** a chip you find rides in your belt like a gear. You can't use it in the run; it just takes
  the slot. Do you keep a WARP, or the chip? Cash out and it's yours. Die and it's gone. (The other way: its own
  one-chip case, so it never costs a gear.)
  >>> i think we store them in the gear so it's clear you have it. that means we need to be able to replace your gear if you get one, or at least give you the option. incase they're an auto drop we need the prompt to comeup and say it's swapping. since it's in the gear and it's a 3x2 we maybe have it 'cycle from one line to the other 'scrolling up or down. also for it's description if you click on it.. maybe you don't know what a chip is until you cash out with it? it shows the rarity but you need to identify it.. maybe? i could also see just having its description be a ticker and we use the short text.
- **The fence** sells two or three chips, different each time. Some only turn up there, and those are **hot**:
  stolen, so a rival hunts you until you cash out.
  >>> this is good, but the fence is also always right there by the boss so you can just cash out the next node.
- **The workbench:** a chip's code has a digit in it (`1UP`, `DM5`). The bench has no use for digits yet (BACKLOG
  section 1: "digits 1-9 none"), so spelling a code with a digit makes a chip.
  >>> this is good, also the chips can have 6 characters
  >>> also for the workbench i think there's probably and upgrade you need to get to try and make chips.. maybe it's something you can find that is a 1 time use like some sort of e paste you need to try and craft with 6 slots.. or just a single ues recipe that allows 6 slots?
- **Mashing 2 mods together** (Greg, 2026-11-15: "maybe you make a chip by mashing 2 mods together"). Claude's take:
  - It fits the 3x2 look: a mod's code is 3 letters (TRC, SKM), so a fused chip shows both, one on each row:
    ```
    TRC
    SKM
    ```
  - Both mods are used up. The chip is yours once you cash out with it.
  >>> this (merging 2 mods instead of just using components) is maybe to make a certain special chip or something. maybe a special node you can go to. the workbench doesn't actually have a great place for this.. this would i can see this being some sort of thing where you equip 2 exotiv mods and then go to this place and fuse them and then get a exotic chip
  - **What it does:**
    - A BOOT chip: every run starts with the pair, a step weaker (common). Simple, and you build your own opening.
    - Or **recipes:** some pairs make a real chip (TRACER + SNIFFER = the `ps` shell chip). Any other pair fuses into
      SLAG (the accident, below). You find the recipes by trying, like the bench's codes.
    - Or both: a known recipe makes its chip, and any other pair makes a plain BOOT chip of the two.
  - Its rarity is the lower of the two mods'.
  - Open: is fusing a WORKBENCH thing (any safehouse) or a deck thing (only between runs)? The bench is in a run, so
    the chip still has to get home.
- **By accident** (Greg): a failed craft now and then fuses its burnt components into a **SLAG** chip: junk with a
  small random effect, and once in a while something good. Some chips might only be found that way.
- **Drops:** each corp boss can drop its own chip (the list below says which). Caches, quests and the final bosses
  give others.
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
- **PET:** pick which pet comes along: COMPANION, the chick, STRAY's bug, CATPHISH's fish.
>>> companion actually does something with the mod. so maybe we always have companion be the pet that's there if you have it equiped? either that or the companion pet is there with your other rep pet at the same time. i do like being able to maybe change/set your earned pet
- **KIT:** start with a given gear.
- More:
  - **HEADSTART:** start on the second row of sector 1. Pays a little less REP. From RYDR's boss.
  >>> i don't know if this needs a rep penalty
  - **PRELOAD:** start with 3 random gear. PARCELNET ("it's out for delivery").
  - **TRUST FUND:** start with +60cr; the first market's prices are up 25%. LEDGER TRUST.
  >>> also not sure we need the penalty
  - **FRESH INSTALL:** start with no mods, +2 INT and 100cr. MEGAMART.
  >>> i like it, you normally start with no mods 'i think' so i'm not sure how that affects things
  >>> i would also like a version that starts you with maybe ~3 firewall shields? maybe some other things. some frags? it's like a battle chip
  - **BLUEPRINT:** start with the letters for one workbench recipe you've built before. PURLWISE (knitting patterns).
  >>> interesting. since components only go away when you use them though this could be exploited, maybe it's just your first workbench build doesn't cost anything? 
  - **CLONE:** start with the best mod from your last cash-out, a step lower. CLONEWORKS ("two of everything.
    almost.").
    >>> kind of interesting but not everything has a step lower version.
    >>> i could see a chip where you start with full mod slots of low level mods, maybe it's a good wayt o start with box of wires.. i think it would be a predefined set. 
  - **MIXTAPE:** pick the run's music. Just for fun. TEMPO RECORDS.
  >>> this might make it a little too repetitive, what might be more fun is turning the ---- bar above the mods into a EQ, you use one for one of the corps i think decible in the terminal (it's faked but i like the look) if that was actually based on the music that would be neat 
  - **SEED VAULT:** start on the seed of your best run. KERNEL ("the seed knows").
  >>> this one is less interesting cause you can always just go type in the seed
  >>> i think having a few chips that start you off with different gear sets like a paladin, cleric or a knight or a rogue would be good, each one just a single mod, and some gear. maybe one or 2 are higher power/rarity we could use dnd classes or cyber punk classes. maybe a 'beast master' where you start with a bunch of crew calls (team effort)

  >>> maybe we also go away from particular corps dropping certain chips. the chips can still be corp themed, but we already have the mods that drop limited places.. we should probably make a spot like the data cache which is limited use have chips or something.

### BIOS (2): the run's rules
- **Corp chips:** each corp boss can drop its own. Slot one and that corp shows up 3x as often (NEMESIS). Flip it
  and it shows up less (AVOID).
  >>> this makes sense to drop from each corp, but maybe we just have it work the way nemesis works. once you beat a corp you can put it on the list.. maybe it's a thing where you beat any corp x5 and then nemesis unlocks and maybe then you buy it and it comes with the nemesis chip. it also has the toggle to switch to avoid. one chip for every corp is a lot
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
    >>> i'm not sure how these would work in with the distorting the seed, but as long as they don't mess it up too much i like most of these. i like sprawl but is there room on the map for that?

### CRASH (1): when you die
- **The socket** (Greg, 2026-11-15): a normal 3x2 socket, next to the stick. The stick is its readout and shows
  the slotted chip's name, top to bottom. It's 5 tall inside; a longer name
  >>> right now that text scrolls.. i think it might be neater if it just swapped to the next line, maybe with a little character swapping effect 
  (DEADMAN) scrolls through it (**Decided (Greg, 2026-11-15)**). The socket goes right of the stick, where the glyph
  was (Greg: there's room for a normal chip there), wired to it by the stick's tabs.
- **1UP:** b0y's crash unit, from beating G0D. Back to the start of the corp.
- **DEADMAN** (Greg: it goes here): dying keeps 25% / 50% of the REP. Bought on THE BOARD, as now.
- **CHECKPOINT:** die in a corp and you start over at its first layer, with a cost.
>>> this could be a respawn with nothing, but full int and you can only do it once a run.
- **BLACK BOX:** when you die, one mod goes to the LOCKER.
>>> would have to note, if there's space or maybe you choose
>>> could also be a chip that when you cash out or die it shreds all your mods and gear so you get those components.
- **EJECT:** cash out from anywhere, once a run.
- More:
  - **INSURANCE:** die and your next run starts with half the credits you had. SAFEHARBOR ("read the fine print":
    the premium comes off every payout).
  - **REBOOT:** die on a boss layer and retry it once, at 1 INT. GROUNDHOG ("same time tomorrow?").
  - **CRYO:** die and the run is frozen. Next time, carry on from the sector's start, but it banks only half its REP.
    GLACIER STORAGE.
    >>> interesting but seems kinda complex to keep track of i think we cut cryo or come up with a better effect, i like the name as a general idea. 
  - **CLONE BODY:** die and you're back on the same layer at 1 INT, every mod a step lower. GENCORP.
  >>> this is kinda like the checkpoint one above.. i'm a little worried that we have a few of these die and restart somewhere chips, reboot as well. it might take the fun out of the 1up when you actually get it. i think we consolidate these into one chip and think about some of the other effects like the ones that give you things.. like maybe instead of restarting when you die, your mods can actually save you. lets say if you take a finishing int blow it actually just removes a mod if you have one. maybe this doesn't fit with the die, because it's more acting like a shield. (maybe it goes somewhere else) anyway i say we consolidtate the death/restarts.
  >>> maybe a chip that will randomly unscramble something in the codex when you die
  - **DEAD DROP:** when you die, your gear is waiting in the first cache of your next run. BONEYARD.
  >>> cool
  - **MEMORY:** die and the next run is the same seed, with the corps you breached marked. FORGET-ME-NOT ("you were
    here before. remember?").
    >>> hmm, interesting. could it be that any seed you run it shows your last path? like the network lines are marked somehow? so even if you cash out you see the path? is that a lot to keep track of? maybe it's only stores like the last 5 seeds you played or something? and they're just local memeory so we don't need to save them?
  - **OBITUARY:** a death past layer 30 pays REP as if you'd cashed out at the last UPLINK. HEADLINE NEWS ("if it
    bleeds, it leads").
    >>> i like it

### SPOILS (1): what corp bosses give
- **The switch** (Greg): REWARDS / HEAL / CASH. Skip a corp boss's rewards for a heal or for money.
- **GEAR:** skip the mods, take a gear.
>>> also a version that skips for loot
- More:
  - **CHIP HUNT:** skip the rewards for a chance at that corp's own chip. The way to farm a corp's chip.
  >>> maybe it's just chips show up more in boss rewards or they're more rare
  - **GAMBLE:** the rewards are face down, and one of them is a jackpot (two mods). LUCKEEZ CASINO.
  >>> interesting.. maybe there is just a mystery item in the list and that can be good or lame. we would also need to make it so if they choose it and their slots for the mods or whatever it is are full they either need to take it or it goes away. they can't back out and choose somethign else.
  - **OFFERING:** skip the rewards and bank REP instead. THE CHOIR ("have faith. or pay.").
  - **AUCTION:** pay credits to add a fourth choice. BIDBLITZ LIVE.
    >>> function like a market reroll maybe?
  - **SALVAGE:** skip the rewards, take their letters for the workbench. DEMOLITION CO.
  >>>good, or maybe it's just a bunch of components, i guess it could be you choose the item then choose salvage instead of 'take' and you get the letters.
  - **HEIRLOOM:** the mod you pick goes straight to the LOCKER, not your run. DEWEY SYSTEMS.
  >>> good, but the locker does have limited space, so we would need some way to maybe manage that? if it's full it opens up the choose what to replace dialog?
  - **PAWN:** your pick sells for double at the next market. PAWN BROS.
  >>> probably scrap this one, since you can't sell mods at the market.. but i could see a chip that maybe allows that, maybe just a rep buy?
  - **PROTECTION:** skip the rewards; the next boss gives an extra choice. LA FAMIGLIA ("nice node you got").
  >>> interesting. i think the problem i usually run into with rewards as you get higher up you usually have everything full and so you always want to skip rewards. i'm not sure having more options helps that. so maybe cut this one.. unless this instead just gives you a firewall or 2... that's protection?

### SHELL (4): one command each
- Commands work in THE SHELL while the chip is slotted. A run that used one is marked hacked on the leaderboard.
- **`cd ..`:** go back a row on the map (BACKLOG section 1 had this as an exotic mod).
- **`market`:** a small black market right where you are (section 1's "call a market").
- **`scan`:** see the corps and anomalies ahead (section 1's SCOUT).
- **`decode`:** read CIPHER for a layer (section 1's DECODER).
- **`kill`:** end the run now.
- More (each once a sector unless it says):
  ~~ - **`ls`:** how many ICE and $ nodes are on this layer. SEEKR ("did you mean: give up?"). ~~
  >>> i'm not sure this is useful since you can just see the ice and there's always one real node right?
  - **`ps`:** where the rival hackers are on the map. WATCHPOINT.
  >>> i think you can already see there's hackers on nodes, but this would maybe show you which hacker
  - **`man`:** this corp's codex entry, mid-layer. DEWEY SYSTEMS.
  >>> so this opens the entry and shows you right then right? like in a popup of some sort
  - **`undo`:** take back your last ICE hit (the PARADOX gear idea, section 1). CHRONOS.
  - **`cat`:** see what a cache or $ node holds before you open it. PARCELNET.
  - **`sleep`:** the layer clock stops for 5 seconds, once a layer. COLDBREW (the opposite of espresso).
  - **`echo`:** use your last gear again. ECHO LABS ("we hear everything. ping.").
  - **`rm`:** delete one ICE on this layer. DEMOLITION CO.
  - **`whois`:** prints this corp's tell. Strong, so a rare drop. NOIR & ASSOCIATES ("everybody lies. except one.").
  >>> these are all interesting. what about makign them work with some of the existing terminal commands like give or whatever.. like a chip that enables the gives to be a higher rarity or something? the gives are already probably super overpowered so i'm not sure how that feeds into stuff. i guess these don't seem as powerful as just give me god mode, which is probably good. i'm still not sure how to integrate the shell and make it either all powerful or somewhat limited. i think we go for all powerful.. but maybe it's got limited uses and some of these chips give it more charges? we will need to come back to these ones once we figure out the shells intro and how it fits 

### PSU (1): the cell
- **STOCK CELL:** comes with the deck. A small budget.
- More:
  - **LI-ION:** a bigger budget. BRIGHTLINE POWER.
  - **BROWNOUT:** a big budget, but one random chip is off each run. BLACKOUT.
  >>> interesting, we would need a notification of what chip went offline and what it did.
  - **REACTOR:** a huge budget, -1 starting INT. HALFLIFE NUCLEAR ("perfectly safe. mostly.").
  - **WIND-UP:** the budget is how many sectors you cleared in your last cash-out. PLAYTIME ("wind it up and watch
    it go!").
    >>> 
  - **POTATO:** a tiny budget. Common. A joke; maybe it does something odd. BURGERTRON.
  >>> i was thinking of a low budget one that also made 1PWR chips cost nothing or maybe they cost half?
  - **SPORE CELL:** the biggest budget, and the mold creeps over the board (looks only, at first). From H3AV3N.
  >>> neat, i was going to suggest having a moldy chip that has mold effects, i like the idea of it sort of spreading on the traces a little. maybe it doens't actually do anything
- **A boss on your deck** (Greg: "fight him on your deck"): a rival breaches your deck mid-run. The layer turns into
  your own board: the sockets are the nodes and your chips are the ICE. It goes for your PSU, and you tap to defend.
  If it lands, the FUSE blows and the bottom band is dark for the rest of the corp. KONAMI, or a rival like SYSOP.
  That's where the PSU and the FUSE show up in a run.
  >>> i still like this idea. well work it into a boss or a quest.. it could be like a whack a mole kinda thing where they hide in your chips and you gotta find em, the more chips you have the harder it is.

### THE BYTE: secret codes
- **The look** (Greg, 2026-11-15): the bits are one row. The `(........)` under them is a readout: a scrolling
  ticker that says when a code does something ("0xFF: OVERFLOW wakes up"), or anything else we want there.
- Eight switches, so 256 codes, hidden around the game in binary or hex. Most codes do nothing. Ideas:
  - `11111111` (0xFF): **OVERFLOW**'s boss seed. Add one more and it wraps; that's his whole joke.
  >>> yeah i like the idea of using this spot for that.. somehow, teaching it might be kinda weird tho. would that mean you want to go into the seed with just 00000001 ?
  - The other boss seeds (TWIN, PHISHER, SLEEPER...), one code each, hidden where BACKLOG section 4 says the
    seeds turn up.
  - `00101010` (42): a joke line, and nothing else.
  - `10110000` (0xB0): b0y's code. His palette, or a line from him.
  - `10000000` (0x80): DOUBLE TIME. Everything runs 2x for a run.
  - `00000001`: MONO. The palette goes greyscale.
  - `01111111` (0x7F, DEL): "access denied", and the switches flip themselves back. A troll.
  >>> these are all interesting we maybe don't need to worry too much about these.. maybe we just have the mono one enabled for now. maybe there's some other ones like that that just apply effects to the whole game like a constant glitch effect over the full game or some sort of chromatic aberation?
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
  >>> could we make it print something? what would that involve? it makes a custom pdf or something and then sends it to the print dialog? that's actually kinda wild cause we could print out secret codes.
  >>> these are all pretty interesting but we don't have a use for them just now so there's nothing to really implement but good to have in our pocket thinking about em.

### GLYPH (1, mk III): your favourite glyph
- **Greg:** a REP unlock to pick a favourite glyph. Tap it when you see it on a layer and it acts like a loot node,
  ICE or real. Or you pick the mod it gives.
- More (glyph chips that change what your glyph does):
  - **SIGNED:** your glyph never hurts you; as ICE it hits for 0. SIGIL DYNAMICS ("we sign everything we make").
  - **GOLDEN:** when your glyph is the real node, it pays double. ZODIAC HOUSE, if you take a new glyph each run.
  - **WORD:** pick a letter glyph instead; any layer that has it pays a bonus. LEXICON.
  >>> letter glyphs are only in lexicon right? we can cut this one prolly
  - **SPOTLIGHT:** your glyph always glows a little, so you see where it is. KERNING.
  >>> is there a reson to have it glow? is this an add on so our glyph still just gives us bonus loot if we click it and this also highlights it?
  ~~ - **MIRROR:** your glyph and its mirror image both count. MIRRORLINE. ~~
  - **FORGERY's partner:** your glyph turns $ nodes into exotic mod nodes (BACKLOG Medium and small).
  >>> sure i'm not sure i know where this one came from
  - **COLLECTOR:** each time you tap your glyph, +1 to a counter; at 10, a free mod. HAUTE//COUTURE.
  >>> kinda neat

### OVERVOLT (3, mk III): pay with integrity
- **Greg likes it.** Each one costs starting INT for something else:
  - **GREED:** +25% credits.
  - **LUCK:** 1 in 5 drops roll a step rarer. (Greg asked for rarity.)
  - **FAME:** +20% REP banked.
  - **SPIKE:** +2 power for the deck.
- More:
  - **DONOR:** -1 INT, one more mod to pick from at the start. MEDIX ("this might sting a little").
  - **GLASS:** -2 INT; derezzed ICE pays credits. AEGIS DEFENSE.
  >>> i don't know what derezzed ice is, but if it's common enough maybe
  - **CHEAPSKATE:** -1 INT; markets are 20% cheaper. MEGAMART.
  - **TOLL PASS:** -1 INT; UPLINKs cost 25% less. TOLLGATE ("exact change only").
  - **RED EYE:** -1 INT; one decoy each layer is marked. COLDBREW ("another shot?").
  - **LAG:** -1 INT; layer clocks +2 seconds. BULLET TIME INC.
  - The other way: **UNDERVOLT** (+1 INT, -25% credits) and **PADDING** (+2 INT, perfects pay no REP). CARAPACE
    ARMOR.
    >>> do perfects add to your rep? i didn't know interesting

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
  >>> this could just be once they're on your crew you have their 'chip'
  >>> could also make them cheaper in the market

### SUDO (3, mk IV): the strong commands
- **`mode.god`:** no damage for a sector, then it wears off.
- **`run.seed`:** pick the seed of your next run.
- **`flatline`:** a rival in this corp drops dead.
- **`give.mod`:** pick one of 3 mods, once a run.
- More (the dev commands, earned for real):
  - **`mode.free`:** free travel on the map for a sector.
  - **`mode.hold`:** the layer clocks stop for a corp.
  - **`show.real`:** the real node shows for one layer, once a corp.
  - **`breach`:** win this layer outright, once a run.
  - **`corp.jump`:** skip to this corp's boss.
  - **`rm -rf`:** every ICE on this layer is gone. HALFLIFE NUCLEAR.
  - **`fork`:** copy a mod you own for the rest of the corp. CLONEWORKS.
  - **`chmod`:** a mod goes up a rarity for a sector (CHMOD was a gear name with no effect yet, section 1).
  >>> ah these are the more powerful ones i was looking for i see.

### BOSS (2 wide, mk IV): the big bosses
- OMNI's, H3AV3N's, KONAMI's. **G0D.exe** could be one, so it comes along every run.
- More:
  - **OMNI'S EYE:** every corp's card on the map shows its tell.
  - **THE MOLD** (G0D): ICE you've hit once rots, and can't hit you again.
  - **HAD3S'S COIN:** every third ICE hit is free.
  - **CERBERUS:** three more gear slots.
  >>> i'm not sure we have space for that?
  - **MYCONET:** beating a corp takes a layer off the corps next to it.
  - **MANTIS** (when it exists): one wrong tap a corp is forgiven ("it reads your mind").
  - **PHISHER** (when it exists): one ICE node a layer is a fake that pays.
  - **GHOST** (when it exists): on a seed you've played, the node you tapped last time is marked.
  >>> these are interesting but again we don't have the bosses. so maybe this it just where we have a god eye chip that allows the divine components to show up in game? you get the chip by beating god.. maybe ~10 times? or something

### HEAT (3, mk IV): harder runs, more REP
- TAXED (a cut of every payout), AUDITED, RANSOM. Each one adds to the REP a run banks.
- More:
  - **HARDCORE:** no CRASH chip works. +50% REP.
  - **HUNTED:** twice as many rivals. PREDATOR ("we see your heat").
  - **SHORT FUSE:** layer clocks -2 seconds. CHANNEL 9.
  - **NO MEDS:** no PATCH drops, no heals at markets. MEDIX.
  - **INFLATION:** prices +10% every sector. LEDGER TRUST.
  - **DECAY:** your mods drop a rarity every sector. BITROT.
  >>> neat
  - **FOG:** the map shows only the next row. NIMBUS WEATHER.
  - **GLITCH:** every ICE hit adds glitch to the screen (section 6's "glitching up"). UPSIDE.
  >>> those are all pretty good

### UPLINK (2 jacks, mk IV): things that play for you
- **G0D.exe**, if it isn't a BOSS chip. Or the AI crew member (Low priority), which may be the same thing.
- More:
  - **More clicks:** a second jack doubles G0D.exe's click limit.
  - **SHOPPER:** G0D.exe's market logic shops for you, and you play the corps.
  - **TUTOR:** G0D.exe says why it would tap a node, so you learn the tells.
  - **RIVAL'S REPLAY:** race a leaderboard run's REPLAY on the same seed.
  - (UPLINK and PORTS could be one group, if we cut.)
  >>> those are all good i think. i like having a way to config the god.exe

## Moves to the layout
Greg: sockets that open earlier should sit higher on the board.
- **GLYPH moved down** into the mk III board (done in v03). Its old spot up top, right of the CRASH stick, is free.
- **CRASH stays up top:** DEADMAN fills it from the start, and the 1UP joins it later.
- **THE BYTE stays up top:** visible from the start, doing nothing until you find a code.
- **The `[X` PORTS** wait on features that aren't built. Leave them dark where they are, or move them down.

## Open
- **The ladder:** the deck at USER, mk III at ELITE, the FUSE at SYSOP. Or one of Greg's other ways.
- **The power budget:** chips cost 1-3 power and the cell sets the budget. Yes?
- **Carrying a chip home:** in the belt, taking a gear slot, or its own one-chip case?
>>> i think we try gear slots for now.
- **Chips in your profile color?** (Greg, maybe.) The mockup has a toggle: the face in your color style
  (PROFILE > COLOR, data/palettes.js `styles`) and the rarity moved to the socket's `]` `[` sides. Rarity colors are
  easier to read at a glance; your color makes the deck yours.
  >>> i think the the deck colors we sorted a bit, the deck main color (traces/effects) is based on the mk version rarity then the chips are their rarity color
- **The training:** who points the board out (POPS? b0y, since it's his crash unit?).
- **The cuts:** once the lists settle. BOOT and BIOS could share 4 sockets; UPLINK could fold into PORTS.
>>> i think training is pops again, since you might not have the 1up when you get introduced to the board.. i'm thinking once you get past the first set of rep buys, so once you get to user there is a popup and you get introduced to the deck. i think it lives somewhere in this board page, we should work out these names maybe we do just call this thing your deck. when the deck is open it's pretty fullscreen with just a back/leave button. from then on the cpu upgrades are rep buys you can buy them on the rep page or in the deck cpu page. elite has one for mk 3 and sysop for mk 4 or whatever the steps are.. we also need to fill out those groups with some buys. does that all work/fit?