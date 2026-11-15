# THE DECK: the sockets, what goes in them, and when they open

Started 2026-11-15 from Greg's board v2 (`asxii_art/deck_board_v02.asxii.json`). A plan to look over; nothing is
built. BACKLOG section 11 has the idea and its history; the mockups are `docs/mockups/deck.html` and `deck_v2.html`.

Everything here is Claude's first pass unless it says Greg. The socket count gets tuned once the chip list settles
(Greg: "it's just really illustration now").

## The name

"Deck" works, but Greg likes "board" better, and THE BOARD is already the REP screen. Options:
- **THE BOARD morphs into it (Claude's pick).** THE BOARD today is a bulletin board you post REP on. At ELITE it
  turns into a circuit board: the posts you've bought become the little parts on it (the ROM, below), and the sockets
  open up around them. One screen, one name, and the pun does the work: a BBS board, then a motherboard. The access
  levels (GUEST, USER, ELITE, SYSOP) line up with the CPU's mk.
- **THE DECK:** what cyberpunk calls a hacker's computer. Fine, a little generic.
- **THE RIG:** short, fits anywhere on a phone. "Rig chips" was already a kind of chip, though.
- Others: CHROME (the implant look), WETWARE, MOBO, THE STACK.

The rest of this doc says "the deck" until that's picked.

## Power and the mk levels

Greg: "you're opening new sections of the deck by also getting more power for the deck."

- The board has three **bands**, top to bottom, split by the lines Greg drew. The lower two read as daughterboards,
  plugged in through the headers (the `db / oo / vv` box, then the `|||||` pins).
- A band opens when you have **both** halves:
  - **The mk** (the CPU): bought with REP on THE BOARD, at an access level.
  - **The power**: the cell in the PSU socket. Each band needs more power, so the wide power traces really are
    carrying it down the board. A band with its mk but too little power sits dark until you find a better cell.

| Band | mk | Needs | Power | Slots |
|---|---|---|---|---|
| Top | mk II | ELITE (the deck arrives) | 1 (the stock cell) | 13 sockets |
| Middle | mk III | SYSOP, then REP | 2 | 4 sockets, plus the crew jacks |
| Bottom | mk IV | G0D beaten, then REP | 3 | 8 sockets |

- **Cells** (PSU): STOCK CELL (power 1, comes with the deck); a better cell (power 2) from a deep corp boss; a FUSION
  cell (power 3) from G0D or OMNI. Maybe sold at a pricey market too.
- **Maybe later:** every chip draws power, so a lit band still can't run everything at once. Leave this out at first;
  add it if loadouts turn out too easy.
- **Simpler, if both halves feel like too much:** drop the mk purchase, so the cell is the only upgrade.

## The map

Greg's v2 art, with each socket named (`^3` marks one to move down to mk III):

```
    0. 0.0  ..
    ][ |%|  ][      +---+ +---+ {
   +-o--o--o--o-+   ] BT1 | BT2  }--
   |            |   +-+-+ +-+-+  |-
[}-o  NEURAL    o=--+---+ + - +  |-
[} |   DECK     |...] BI1 : BI2  }--
[}-o    mk II   o=--+-+-+ + - + {
   |            |     +-+
   +-o--o--o--o-+     |.C
   [_ ::::'::: _]     |.R  +=-=-=+
     |        /       |.A==].....[
     |+   .__/        |.S==]GLY^3[
     |_   ||          |.H  ].....[
      |   ||          +-+  +=-=-=+
      |   ||                 ]8[
+---+ {   ||   +---++ - +   +---+
]SH1[-+   ++>:<]SPL[:SH3:   ]SH4[
+-+-+ {   vV   +-+-++ - +   +-+-+
      |    \          [___.___]
      |     \______
+=-=+ {     +---+  }     +--------+
]PSU[-+     ]SH2[  }-::::]01010101[
+-=-+ {     ++--+  |     +-+-qp-+-+
      |     ||     |    __
      +::+::db::+::+   [  ]=----+-[X
       '  ' oo '  '     ||      |
       '  '    '  '     )(      +-[X
      +::+::vv::+::+    ||
X]    |            |___<++>_______
X]====]                           [
X]    |  +...+ +...+ +...+ +...+  }
X]====]  :GLY: :OC1: :OC2: :OC3:  }
X]    '  +...+ +...+ +...+ +...+  }
       \   ^     ^     ^     ^    [
        \                         [
         \_______----------_______[
          |||||             |||||
          ^   ^             ^   ^
          +...+   +.o.o.+   +...+
}-        :RT1:   : BOSS:   :HT1:
          +...+   +.o.o.+   +...+
          +...+   +.o.o.+   +...+
}-        :RT2:   : BOSS:   :HT2:
          +...+   +.o.o.+   +...+
          +...+             +...+
          :RT3:             :HT3:
          +...+             +...+
```

## The groups

| Group | Where | mk | Slots | What it's for |
|---|---|---|---|---|
| CPU | the big square | II | - | the deck's level; tap it to upgrade |
| ROM | the pin row under the CPU, the parts over it | II | (display) | every BOARD post you've bought, lit |
| BOOT | BT1, BT2 (top right, top row) | II | 2 | what a run starts with |
| BIOS | BI1, BI2 (top right, under BOOT) | II | 2 | the run's rules |
| CRASH | the tall stick | II | 1 | what happens when you die |
| SPOILS | SPL, fed straight from the CPU (`>:<`) | II | 1 | a switch: what corp bosses give |
| SHELL | SH1-SH4 (SH3 + SH4 share the `[___.___]` bar) | II | 4 | commands for THE SHELL |
| PSU | the `+=-=+` socket, left edge | II | 1 | power: which bands are lit |
| THE BYTE | the 8-bit socket | II | 1 | DIP switches: secret codes |
| READOUT | the `]8[` | II | (display) | the deck's mk, or the power |
| PORTS | the `[X` jacks, right edge | II | 2 | other windows (later features) |
| FUSE | the `)(` part over the mk III board | II | (display) | blows when something breaches the deck |
| GLYPH | GLY (moved down; see "Moves") | III | 1 | your favourite glyph |
| OVERCLOCK | OC1-OC3 | III | 3 | trade integrity for something |
| CREW | the `X]` jacks, left edge | III | 2-3 | crew links |
| ROOT | RT1-RT3 (bottom left) | IV | 3 | the strong shell commands |
| BOSS | the two wide `o.o` sockets | IV | 2 | big chips |
| HEAT | HT1-HT3 (bottom right) | IV | 3 | harder runs for more REP |
| UPLINK | the `}-` jacks, left edge | IV | 2 | G0D.exe |

## What goes in each

### ROM (not sockets: a display, and switches)
- Every BOARD post you buy lights a pin. **Greg: HARDENED shows up here, so you can see it's on.** The always-on posts
  just light: HARDENED, SEED MONEY, FIELD KIT, GEAR SLOT, RESTOCK, SHORTLIST, DEADMAN, SECOND WIND, BETTER DROPS,
  LOCKER, WORKBENCH, STEADY HANDS.
- The ones you might want off are switches: tap the pin to flip it. TELL LIGHT, STRAY, LUCKY START, STARTER POOL,
  BOSS LOOT. (BACKLOG section 2: "REP unlocks you can switch on and off".)
- So nothing you've already bought costs you a socket. Sockets are for chips you find, and for posts with a choice.

### BOOT (2): what a run starts with
- **STARTER:** pick a mod you've found; it can show up in the starter perk (BACKLOG section 2: "choose 3, one may
  show up at the start"). A stronger one: you always start with it (section 4: "a mod you always start with").
- **ARCHIVE:** start with any mod you've found (section 2's THE ARCHIVE, the codex reward).
- **PET:** pick which pet comes along: COMPANION, the chick, STRAY's bug, CATPHISH's fish (Medium and small: "pets
  you can toggle").
- **KIT** chips: start with a given gear (a WARP, a PATCH).

### BIOS (2): the run's rules
- **Corp chips:** each corp boss can drop its own chip. Slot one and that corp shows up 3x as often (NEMESIS, as a
  chip). Flip it over and it shows up less (AVOID).
- **FRESH:** corps you haven't beaten come up more (section 2: "a booster that picks corps you haven't beaten").
- **+1 LAYER:** every corp has one more layer, for more REP (section 2's toggle idea).
- **EVENTS:** sector events from sector 1 (section 6: "a REP option to turn events on in sector 1"). One chip per
  event, to make it come up more?
- **ADWARE:** more ads, and tapping one heals 1 INT (section 6, meat notes 2026-11-15).

### CRASH (1): when you die
- **1UP:** b0y's crash unit, the reward for beating G0D. **Greg: it lives on the deck, and you can swap it for other
  things you find.**
- **CHECKPOINT:** die in a corp and you start over at its first layer. BACKLOG section 1 has this as exotic gear;
  it's a weaker 1UP, so it fits here better.
- **BLACK BOX:** when you die, one mod goes to the LOCKER (section 3: "safehouses keep some mods from a run you died
  in").
- **EJECT:** cash out from anywhere, once a run.
- **CHUCK E. CACHE's 1UP** (section 7: it has a 1UP in its logo): its boss could drop a 1UP that works once, before
  you've beaten G0D.

### SPOILS (1): a switch for corp bosses
- **Greg: the toggle for health or money that skips a corp boss's rewards.** It's a switch with three positions:
  REWARDS (normal), HEAL, CASH (section 2: "skip a corp's rewards for a heal").
- Other chips that could go in this socket: GEAR (skip the mods, take a gear), or a corp's own spoils.

### SHELL (4): commands
- Each shell chip teaches THE SHELL a command while it's slotted (SHELL.md step 3, "The game part"). You find them
  in runs. A run that used one is marked on the leaderboard (hacked / rooted).
- Commands that fit the early sockets:
  - **`cd ..`**: go back a row on the map. Section 1 has "going back a row" as "save it for an exotic mod", and a
    command fits it better.
  - **`market`**: a small black market right where you are (section 1's gear idea "call a market").
  - **`scan`**: see the corps and anomalies ahead (section 1's SCOUT gear idea).
  - **`decode`**: read CIPHER for a layer (section 1's DECODER gear idea).
  - **`kill`**: end the run now (section 10).
- **SH3 + SH4 share a bar:** maybe a command and its argument. `give.mod` in SH3 and a mod code in SH4, which makes
  that one mod, once a sector.

### PSU (1): power
- A cell (see "Power and the mk levels"). The FUSE sits between the PSU and the lower boards: if a late boss (KONAMI)
  breaches your deck, the fuse blows and the lower bands go dark for that corp.

### THE BYTE (1): DIP switches
- Eight switches, so 256 codes. Most do nothing; a few do something:
  - **The boss seeds** (section 4: TWIN, OVERFLOW, PHISHER...): a code starts that seed's run, instead of typing a
    seed.
  - A challenge mode, a hidden corp, a palette.
- The codes are hidden in the game, in binary or hex: a corp's logo, a post, G0D's lines, the ending's log
  (KITCHEN, ZER0), the codex's ciphertext.
- **Greg's other idea:** the bits show how much of the shell you've unlocked. Both could work: the lit bits show your
  progress, and flipping them enters a code. Open.

### PORTS (2), later: other windows
- The second window (section 10: THE SHELL popped out to its own tab), and TWIN's tab or your phone as the second
  screen (section 4). They stay dark until those features exist.

### GLYPH (1, mk III)
- **Greg: a REP unlock that lets you pick a favourite glyph.** When you see it on a layer and tap it, it acts like a
  loot node, ICE or real. Or you pick the mod it gives.
- The parked "a glyph mod" (Parked mod ideas, the archive) and FORGERY's partner ($ nodes into exotic mod nodes) go
  here too: glyph chips that change what the glyph gives.

### OVERCLOCK (3, mk III): pay with integrity
- **Greg likes the idea:** each one costs 1 starting INT for something else:
  - **GREED:** +25% credits.
  - **LUCK:** 1 in 5 drops roll a step rarer (stacks with BETTER DROPS). Greg asked for rarity.
  - **FAME:** +20% REP banked.
  - **SURGE:** +1 power, so a band lights before you have the cell.
- Maybe the other way round too: **UNDERVOLT** (+1 INT, less money).

### CREW (2-3 jacks, mk III)
- Plug in a crew member you've hired (the CREW posts): their calls come up more often, or you get one free call a
  run. Their LVL 2 perk (POPS's is TRACER) could need the link. Grows "Allies, more" (Enemy and ally hackers) and
  "the call as an item" (section 3).

### ROOT (3, mk IV): the strong commands
- **`mode.god`**: no damage for a sector, then it wears off (section 10).
- **`run.seed`**: start your next run on any seed.
- **`flatline`**: a rival in this corp drops dead (section 10).
- **`give.mod`**: as a full command, not limited to one argument.

### BOSS (2 wide, mk IV): big chips
- A beaten final boss's power: OMNI's, H3AV3N's, KONAMI's (the dev menu turned around). Each one is a strong
  run-wide rule.
- **G0D.exe** could be a wide chip instead of gear, so it comes along every run (section 3).

### HEAT (3, mk IV): harder runs, more REP
- Section 2's "difficulty levels that add drains and pay more REP": TAXED (a cut of every payout), AUDITED,
  RANSOM (section 6's names). Each chip adds REP to what the run banks.

### UPLINK (2 jacks, mk IV)
- G0D.exe's line, if it isn't a BOSS chip. Or the AI crew member (Low priority), which may be the same thing.

## Moves to the layout

Greg: sockets that open earlier should sit higher on the board.
- **GLYPH moves down.** It's a mk III unlock, but it sits at the top, next to the CRASH stick. Move it into the
  mk III board (GLY there; the board needs a 5x5 space). Its old spot at the top is free for silkscreen, or for the
  READOUT to grow.
- **CRASH stays up top.** The 1UP comes late (G0D), but the other crash units come earlier, so the slot is useful
  from mk II.
- **THE BYTE stays up top:** visible from the start, doing nothing until you find a code. A mystery early on is good.
- **BOSS and HEAT stay at the bottom:** both are late game.
- **The `[X` PORTS** are in the top band but open last (they wait on other features). Move them into the bottom band,
  or leave them dark where they are.

## Backlog ideas that fit better on the deck

| Idea | Where it is now | On the deck |
|---|---|---|
| CHECKPOINT (start a corp over when you die) | section 1, exotic gear | CRASH |
| Going back a row on the map | section 1, "save it for an exotic mod" | SHELL `cd ..` |
| Call a market | section 1, gear | SHELL `market` |
| SCOUT, DECODER | section 1, gear ideas | SHELL `scan`, `decode` |
| REP unlocks you switch on and off | section 2 | ROM switches |
| +1 corp layer | section 2 | BIOS |
| A booster for corps you haven't beaten | section 2 | BIOS (FRESH) |
| The starter pool: choose 3 | section 2 | BOOT (STARTER) |
| THE ARCHIVE (start with any mod you've found) | section 2 | BOOT |
| Difficulty levels that pay more REP | section 2 | HEAT |
| Skip a corp's rewards for a heal | section 2 | SPOILS |
| Safehouses keep mods from a run you died in | section 3 | CRASH (BLACK BOX) |
| The call as an item | section 3 | CREW |
| G0D.exe | section 3 | BOSS or UPLINK |
| The boss seeds, and where they turn up | section 4 | THE BYTE |
| A mod you always start with | section 4 | BOOT (STARTER) |
| Events on in sector 1 | section 6 | BIOS (EVENTS) |
| Ads that heal you | section 6 | BIOS (ADWARE) |
| CHUCK E. CACHE's 1UP logo | section 7 | CRASH |
| mode.god that wears off, the kill commands | section 10 | ROOT, SHELL |
| Pets you can toggle | Medium and small | BOOT (PET) |
| A glyph mod, FORGERY's partner | Parked mod ideas, Medium and small | GLYPH |
| Using a crew member's logo makes their calls less rare | Enemy and ally hackers | CREW |
| The AI crew member | Low priority | UPLINK |

Left where they are: gear and mods that do something in a layer (SHORT, PARADOX, ENTANGLE). A chip is for a whole
run, not for one tap.

## Open
- The name (above).
- Power: both halves (the mk and the cell), or the cell alone?
- THE BYTE: secret codes, shell progress, or both?
- The SH3 + SH4 pair: a command and its argument, or two plain sockets?
- 25 sockets plus the jacks is a lot. Cut once each group has its chips: BOOT and BIOS could share 4 sockets, and
  OVERCLOCK might only need 2.
- Where chips come from, per group: boss drops (corp chips, cells, BOSS chips), caches, the fence, crew quests,
  the BOARD (REP), hacking a command out in the shell. Claude's idea from section 11: a chip found in a run is yours
  only if you cash out.
- Whether moving these ideas here takes them off their old backlog lines (say so and Claude moves them).
