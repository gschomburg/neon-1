# THE DECK: the sockets, the chips, and how it opens

Started 2026-11-15 from Greg's board v2 (`asxii_art/deck_board_v02.asxii.json`). A plan to look over; nothing is
built. BACKLOG section 11 has where the idea came from; the mockups are `docs/mockups/deck.html` and `deck_v2.html`.

Everything here is Claude's unless it says Greg. The socket count gets tuned once each group's chip list settles
(**Decided (Greg, 2026-11-15):** decide what to cut after we've gone deeper on the options).

## Decided so far (Greg, 2026-11-15)
- **Outside a run.** You set the deck up between runs. It doesn't come up while you play.
- **Chips have a rarity, one each.** No chip comes in more than one rarity.
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

## Chips: getting them, carrying them, keeping them
- **Carrying one home:** a chip you find rides in your belt like a gear. You can't use it in the run; it just takes
  the slot. Do you keep a WARP, or the chip? Cash out and it's yours. Die and it's gone. (The other way: its own
  one-chip case, so it never costs a gear.)
- **The fence** sells two or three chips, different each time. Some only turn up there, and those are **hot**:
  stolen, so a rival hunts you until you cash out.
- **The workbench:** a chip's code has a digit in it (`1UP`, `DM5`). The bench has no use for digits yet (BACKLOG
  section 1: "digits 1-9 none"), so spelling a code with a digit makes a chip.
- **Mashing 2 mods together** (Greg, 2026-11-15: "maybe you make a chip by mashing 2 mods together"). Claude's take:
  - It fits the 3x2 look: a mod's code is 3 letters (TRC, SKM), so a fused chip shows both, one on each row:
    ```
    TRC
    SKM
    ```
  - Both mods are used up. The chip is yours once you cash out with it.
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
  tile. Chips do the same thing with 2 rows. Also add them to `lineRows` (engine/textboard.js) so the screens that
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
Board v03 (`asxii_art/deck_board_v03.asxii.json`, Claude's pass on Greg's v02): every chip socket is 5 x 4 for the 3x2
chips, and GLYPH moved down into mk III. The labels sit on each socket's top row.

Later: Greg's v04 (the CPU with your name, a few tweaks), then v05 = v04 + a `socket labels` layer: each socket's
code on its top border (`+BT1+`), so the name stays readable with a chip in it. The codes: BT1-2, BI1-2, CRS (the
stick), SPL, SH1-4, PSU, BYT, PRT (the `[X` ports), GLY, OV1-3, CRW (the crew jacks), SU1-3, BS1-2 (the wide
BOSS sockets), HT1-3, UPL (the uplink jacks).

```
    0. 0.0  ..
    ][ |%|  ][      +---+ +---+ {
   +-o--o--o--o-+   ]BT1[ |BT2|  }--
   |            |   ]   [ |   |  |
   |            |   +-+-+ +-+-+  |-
[}-o  NEURAL    o=--+---+ + - +  |-
[} |   DECK     |...]BI1[ :BI2:  }--
[} |            |   ]   [ :   :
[}-o    mk II   o=--+-+-+ + - + {
   |            |     +-+
   +-o--o--o--o-+     |C|
   [_ ::::'::: _]     |R|
     |        /       |A[=o
     |+   .__/        |S[=o
     |_   ||          |H|
      |   ||          +-+
      |   ||                 ]8[
+---+ {   ||   +---++ - +   +---+
]SH1[-+   ++>:<]SPL[:SH3:   ]SH4[
]   [ |   ||   ]   [:   :   ]   [
+-+-+ {   vV   +-+-++ - +   +-+-+
      |    \          [___.___]
      |     \______
+=-=+ {     +---+  }     +--------+
]PSU[-+     ]SH2[  }-::::]01010101[
]   [ |     ]   [  |     ]v^v^v^v^[
+-=-+ {     ++--+  |     +-+-qp-+-+
      |     ||     |    __
      +::+::db::+::+   [  ]=----+-[X
       '  ' oo '  '     ||      |
       '  '    '  '     )(      +-[X
      +::+::vv::+::+    ||
X]    |            |___<++>_______
X]====] +=-=-=+                   [
X]    | ].....[ +...+ +...+ +...+ }
X]====] ].GLY.[ :OV1: :OV2: :OV3: }
X]    | ].....[ :   : :   : :   : }
X]    ' +=-=-=+ +...+ +...+ +...+ }
       \   ^      ^     ^     ^   [
        \                         [
         \_______----------_______[
          |||||             |||||
          ^   ^             ^   ^
          +...+   +.o.o.+   +...+
}-        :SU1:   :BOSS :   :HT1:
          :   :   :     :   :   :
          +...+   +.o.o.+   +...+
          +...+   +.o.o.+   +...+
}-        :SU2:   :BOSS :   :HT2:
          :   :   :     :   :   :
          +...+   +.o.o.+   +...+
          +...+             +...+
          :SU3:             :HT3:
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
- **KIT:** start with a given gear.
- More:
  - **HEADSTART:** start on the second row of sector 1. Pays a little less REP. From RYDR's boss.
  - **PRELOAD:** start with 3 random gear. PARCELNET ("it's out for delivery").
  - **TRUST FUND:** start with +60cr; the first market's prices are up 25%. LEDGER TRUST.
  - **FRESH INSTALL:** start with no mods, +2 INT and 100cr. MEGAMART.
  - **BLUEPRINT:** start with the letters for one workbench recipe you've built before. PURLWISE (knitting patterns).
  - **CLONE:** start with the best mod from your last cash-out, a step lower. CLONEWORKS ("two of everything.
    almost.").
  - **MIXTAPE:** pick the run's music. Just for fun. TEMPO RECORDS.
  - **SEED VAULT:** start on the seed of your best run. KERNEL ("the seed knows").

### BIOS (2): the run's rules
- **Corp chips:** each corp boss can drop its own. Slot one and that corp shows up 3x as often (NEMESIS). Flip it
  and it shows up less (AVOID).
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

### CRASH (1): when you die
- **The socket** (Greg, 2026-11-15): a normal 3x2 socket, next to the stick. The stick is its readout and shows
  the slotted chip's name, top to bottom. It's 5 tall inside; a longer name
  (DEADMAN) scrolls through it (**Decided (Greg, 2026-11-15)**). The socket goes right of the stick, where the glyph
  was (Greg: there's room for a normal chip there), wired to it by the stick's tabs.
- **1UP:** b0y's crash unit, from beating G0D. Back to the start of the corp.
- **DEADMAN** (Greg: it goes here): dying keeps 25% / 50% of the REP. Bought on THE BOARD, as now.
- **CHECKPOINT:** die in a corp and you start over at its first layer, with a cost.
- **BLACK BOX:** when you die, one mod goes to the LOCKER.
- **EJECT:** cash out from anywhere, once a run.
- More:
  - **INSURANCE:** die and your next run starts with half the credits you had. SAFEHARBOR ("read the fine print":
    the premium comes off every payout).
  - **REBOOT:** die on a boss layer and retry it once, at 1 INT. GROUNDHOG ("same time tomorrow?").
  - **CRYO:** die and the run is frozen. Next time, carry on from the sector's start, but it banks only half its REP.
    GLACIER STORAGE.
  - **CLONE BODY:** die and you're back on the same layer at 1 INT, every mod a step lower. GENCORP.
  - **DEAD DROP:** when you die, your gear is waiting in the first cache of your next run. BONEYARD.
  - **MEMORY:** die and the next run is the same seed, with the corps you breached marked. FORGET-ME-NOT ("you were
    here before. remember?").
  - **OBITUARY:** a death past layer 30 pays REP as if you'd cashed out at the last UPLINK. HEADLINE NEWS ("if it
    bleeds, it leads").

### SPOILS (1): what corp bosses give
- **The switch** (Greg): REWARDS / HEAL / CASH. Skip a corp boss's rewards for a heal or for money.
- **GEAR:** skip the mods, take a gear.
- More:
  - **CHIP HUNT:** skip the rewards for a chance at that corp's own chip. The way to farm a corp's chip.
  - **GAMBLE:** the rewards are face down, and one of them is a jackpot (two mods). LUCKEEZ CASINO.
  - **OFFERING:** skip the rewards and bank REP instead. THE CHOIR ("have faith. or pay.").
  - **AUCTION:** pay credits to add a fourth choice. BIDBLITZ LIVE.
  - **SALVAGE:** skip the rewards, take their letters for the workbench. DEMOLITION CO.
  - **HEIRLOOM:** the mod you pick goes straight to the LOCKER, not your run. DEWEY SYSTEMS.
  - **PAWN:** your pick sells for double at the next market. PAWN BROS.
  - **PROTECTION:** skip the rewards; the next boss gives an extra choice. LA FAMIGLIA ("nice node you got").

### SHELL (4): one command each
- Commands work in THE SHELL while the chip is slotted. A run that used one is marked hacked on the leaderboard.
- **`cd ..`:** go back a row on the map (BACKLOG section 1 had this as an exotic mod).
- **`market`:** a small black market right where you are (section 1's "call a market").
- **`scan`:** see the corps and anomalies ahead (section 1's SCOUT).
- **`decode`:** read CIPHER for a layer (section 1's DECODER).
- **`kill`:** end the run now.
- More (each once a sector unless it says):
  - **`ls`:** how many ICE and $ nodes are on this layer. SEEKR ("did you mean: give up?").
  - **`ps`:** where the rival hackers are on the map. WATCHPOINT.
  - **`man`:** this corp's codex entry, mid-layer. DEWEY SYSTEMS.
  - **`undo`:** take back your last ICE hit (the PARADOX gear idea, section 1). CHRONOS.
  - **`cat`:** see what a cache or $ node holds before you open it. PARCELNET.
  - **`sleep`:** the layer clock stops for 5 seconds, once a layer. COLDBREW (the opposite of espresso).
  - **`echo`:** use your last gear again. ECHO LABS ("we hear everything. ping.").
  - **`rm`:** delete one ICE on this layer. DEMOLITION CO.
  - **`whois`:** prints this corp's tell. Strong, so a rare drop. NOIR & ASSOCIATES ("everybody lies. except one.").

### PSU (1): the cell
- **STOCK CELL:** comes with the deck. A small budget.
- More:
  - **LI-ION:** a bigger budget. BRIGHTLINE POWER.
  - **BROWNOUT:** a big budget, but one random chip is off each run. BLACKOUT.
  - **REACTOR:** a huge budget, -1 starting INT. HALFLIFE NUCLEAR ("perfectly safe. mostly.").
  - **WIND-UP:** the budget is how many sectors you cleared in your last cash-out. PLAYTIME ("wind it up and watch
    it go!").
  - **POTATO:** a tiny budget. Common. A joke; maybe it does something odd. BURGERTRON.
  - **SPORE CELL:** the biggest budget, and the mold creeps over the board (looks only, at first). From H3AV3N.
- **A boss on your deck** (Greg: "fight him on your deck"): a rival breaches your deck mid-run. The layer turns into
  your own board: the sockets are the nodes and your chips are the ICE. It goes for your PSU, and you tap to defend.
  If it lands, the FUSE blows and the bottom band is dark for the rest of the corp. KONAMI, or a rival like SYSOP.
  That's where the PSU and the FUSE show up in a run.

### THE BYTE: secret codes
- **The look** (Greg, 2026-11-15): the bits are one row. The `(........)` under them is a readout: a scrolling
  ticker that says when a code does something ("0xFF: OVERFLOW wakes up"), or anything else we want there.
- Eight switches, so 256 codes, hidden around the game in binary or hex. Most codes do nothing. Ideas:
  - `11111111` (0xFF): **OVERFLOW**'s boss seed. Add one more and it wraps; that's his whole joke.
  - The other boss seeds (TWIN, PHISHER, SLEEPER...), one code each, hidden where BACKLOG section 4 says the
    seeds turn up.
  - `00101010` (42): a joke line, and nothing else.
  - `10110000` (0xB0): b0y's code. His palette, or a line from him.
  - `10000000` (0x80): DOUBLE TIME. Everything runs 2x for a run.
  - `00000001`: MONO. The palette goes greyscale.
  - `01111111` (0x7F, DEL): "access denied", and the switches flip themselves back. A troll.
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

### GLYPH (1, mk III): your favourite glyph
- **Greg:** a REP unlock to pick a favourite glyph. Tap it when you see it on a layer and it acts like a loot node,
  ICE or real. Or you pick the mod it gives.
- More (glyph chips that change what your glyph does):
  - **SIGNED:** your glyph never hurts you; as ICE it hits for 0. SIGIL DYNAMICS ("we sign everything we make").
  - **GOLDEN:** when your glyph is the real node, it pays double. ZODIAC HOUSE, if you take a new glyph each run.
  - **WORD:** pick a letter glyph instead; any layer that has it pays a bonus. LEXICON.
  - **SPOTLIGHT:** your glyph always glows a little, so you see where it is. KERNING.
  - **MIRROR:** your glyph and its mirror image both count. MIRRORLINE.
  - **FORGERY's partner:** your glyph turns $ nodes into exotic mod nodes (BACKLOG Medium and small).
  - **COLLECTOR:** each time you tap your glyph, +1 to a counter; at 10, a free mod. HAUTE//COUTURE.

### OVERVOLT (3, mk III): pay with integrity
- **Greg likes it.** Each one costs starting INT for something else:
  - **GREED:** +25% credits.
  - **LUCK:** 1 in 5 drops roll a step rarer. (Greg asked for rarity.)
  - **FAME:** +20% REP banked.
  - **SPIKE:** +2 power for the deck.
- More:
  - **DONOR:** -1 INT, one more mod to pick from at the start. MEDIX ("this might sting a little").
  - **GLASS:** -2 INT; derezzed ICE pays credits. AEGIS DEFENSE.
  - **CHEAPSKATE:** -1 INT; markets are 20% cheaper. MEGAMART.
  - **TOLL PASS:** -1 INT; UPLINKs cost 25% less. TOLLGATE ("exact change only").
  - **RED EYE:** -1 INT; one decoy each layer is marked. COLDBREW ("another shot?").
  - **LAG:** -1 INT; layer clocks +2 seconds. BULLET TIME INC.
  - The other way: **UNDERVOLT** (+1 INT, -25% credits) and **PADDING** (+2 INT, perfects pay no REP). CARAPACE
    ARMOR.

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

### BOSS (2 wide, mk IV): the big bosses
- OMNI's, H3AV3N's, KONAMI's. **G0D.exe** could be one, so it comes along every run.
- More:
  - **OMNI'S EYE:** every corp's card on the map shows its tell.
  - **THE MOLD** (G0D): ICE you've hit once rots, and can't hit you again.
  - **HAD3S'S COIN:** every third ICE hit is free.
  - **CERBERUS:** three more gear slots.
  - **MYCONET:** beating a corp takes a layer off the corps next to it.
  - **MANTIS** (when it exists): one wrong tap a corp is forgiven ("it reads your mind").
  - **PHISHER** (when it exists): one ICE node a layer is a fake that pays.
  - **GHOST** (when it exists): on a seed you've played, the node you tapped last time is marked.

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

### UPLINK (2 jacks, mk IV): things that play for you
- **G0D.exe**, if it isn't a BOSS chip. Or the AI crew member (Low priority), which may be the same thing.
- More:
  - **More clicks:** a second jack doubles G0D.exe's click limit.
  - **SHOPPER:** G0D.exe's market logic shops for you, and you play the corps.
  - **TUTOR:** G0D.exe says why it would tap a node, so you learn the tells.
  - **RIVAL'S REPLAY:** race a leaderboard run's REPLAY on the same seed.
  - (UPLINK and PORTS could be one group, if we cut.)

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
- **The training:** who points the board out (POPS? b0y, since it's his crash unit?).
- **The cuts:** once the lists settle. BOOT and BIOS could share 4 sockets; UPLINK could fold into PORTS.
