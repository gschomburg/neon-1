# NeoN+1 crew quests (ideas)

Claude's first pass, 2026-11-04, from the user's ask: a quest for each crew member, some more hidden or random than
others, showing up once they're on your crew (like POPS's). Maybe one that unlocks a crew member. Each about its crew
member. Built from how the main quest went (docs/QUESTS.md) and the ideas floating around (BACKLOG item 3, ADS.md
"Secret ads", the meat notes). **Nothing here is decided.** Pick, cut, rewrite.

## The spine: every crew member already has a rival

The cast was written in pairs (data/hackers.js `counter`). Each crew quest is about that rival, so the quests come with
their villains built in, and the counter you already see in play becomes the story:

| Crew | Their rival | The counter today | The quest (below) |
|---|---|---|---|
| POPS | VULTURE | guards the last three | SYSTEM FAILURE (built) + HOUSE CALL |
| b0y | w00f | (he was d0g) | PUT HIM DOWN (after the main quest) |
| BRICK | ICE MAN | re-frozen ICE costs ICE MAN a bar | THAW: it **unlocks RTFM** |
| NULL | DOPPEL (via d0g) | the one AI d0g can't read | THE LIST |
| NANA | GG_EZ | "LANGUAGE." he logs off | SUNDAY DINNER |
| DIALUP | SYSOP | old BBS friends | FORTY DOLLARS |
| BAUD | TURBO | races him: TURBO pays 2 bars | REMATCH |
| MOTHER | LEECH | pulls it off you | THE FILE |
| ROOT | PH1SH | his fakes don't show | PAPERWORK: it **unlocks ROOT** |
| KLUDGE | HCF | puts the fires out | SPARE PARTS |
| HYPE | DOPPEL | it copies her | GOING LIVE |

Two quests unlock a crew member: ROOT's own (you find it living in your deck) and BRICK's (you break RTFM, a new
hacker, out of the ICE). The rest open once the crew member is on your crew.

## What we have to build them with

Everything from the main quest carries over: **calls** (a face, lines, a button), **QUEST cards**, **strip
cutscenes** (asXii art, layer effects, music moods), **quest items** in the loot bag (cash out with them), **quest
seeds** (HAD3S, H3AV3N: their own sectors, bosses, events), **quest events** (THE HUNT), **step counters** (d0g: n / 10),
and the editor's TESTING buttons. And from the rest of the game:

- **The PIER** (PHISHING): catches, junk, corrupted software. A place for a quest item to turn up, and a pun waiting
  for PH1SH.
- **The WORKBENCH**: letters, spelling codes, the BOOK, blueprints (planned), DIVINE letters (planned). A quest can
  hand you a recipe, or end in spelling something.
- **Ads**: 17 fake ads, a few of them for real corps (MEDIX CHROME CLINIC, OMNINET ONLINE, NeoN+2). The secret-ads idea
  (ADS.md): tap the right ad at the right time.
- **The map**: corps, safehouses, markets, caches, THE FENCE, the PIER. A quest can mark a node, or put a special one
  in.
- **Rivals and their gear**: LEASH / BONE / MUZZLE / H0NEY, EXORCIST; counters; "escaped" vs beaten.
- **Stats already counted**: rivals beaten (each), crew called (each), credits LEECH took, hits BRICK took, perfect
  streaks, and so on. A quest can wake up when a number gets big, so it feels found, not handed out.
- **Pets** (STRAY, CATPHISH, the EGG), **loot** (WALLET, corrupted software), **THE BOARD** (posts, PMs, the QUESTS tab).

## How a crew quest shows up

Three kinds of start, from loud to hidden:

1. **They call** (like POPS): on your crew, a first call opens it. For the ones that should feel like a story.
2. **A number wakes it up**: it starts when a stat crosses a line, the crew member says something new, and only then
   does the QUESTS tab show it. For the ones that should feel found ("BRICK has taken 50 hits for you. he says his first
   word.").
3. **Something odd in the world**: a weird file, an ad that's off, a catch at the PIER. No call. You notice, or you
   don't. For the secret ones.

Rewards to pick from per quest: the crew member's **LVL 2 for free** (it's 200 REP on THE BOARD today: a quest could
be the other way there), a **new mod or gear** (a blueprint at the workbench, or a drop), a **cosmetic** (a logo, a
title, an ad), **REP**, a **new crew member**, or the rival **changing sides / leaving for good**.

---

## The quests

### POPS: HOUSE CALL (small, after the main quest)
- The BACKLOG's "POPS's old corp": call POPS in at MEDIX (canon now: he was a medic there, and b0y was found in its
  basement). **Start:** a number: you call POPS in a MEDIX corp (after the main quest).
- He knows the building. **Step:** his AI changes in MEDIX only: he points out the real node on the boss layer.
- **Scene:** short, POPS and b0y at MEDIX's front desk, an old badge photo. **Reward:** POPS LVL 2 free, and a MEDIX
  exotic mod blueprint (a heal that only works on crew: patch a crew member's bars).
- Uses: the MEDIX corp, the MEDIX CHROME CLINIC ad (a doctor in the ad is POPS, years younger, if you look).

### b0y: PUT HIM DOWN (after the main quest)
- w00f is still out there, guarding nothing. **Start:** b0y calls after you beat G0D: "it's still running. it's mine.
  i should be the one."
- **Steps:** beat w00f 3 times with b0y called in (b0y vs w00f: b0y's cursor and w00f's fight over the same node, a
  little show). Then HAD3S one last time: w00f is CERBERUS's boss this run.
- **Reward:** CERBERUS (no mold) joins the regular game as a boss (the TODO from QUESTS.md), and d0g's cursor split
  becomes w00f's (the three heads). b0y LVL 2.

### BRICK: THAW (unlocks RTFM)
- BRICK never talks. **Start:** a number: the 50th ICE hit he takes for you, he says his first word: "help." No call,
  just the line in the terminal. The QUESTS tab gets a new entry: "BRICK said something."
- **Step 1:** BRICK calls next run, one word at a time, slow: a corp on the map is marked (a frozen node: GLACIER or
  DEEP FREEZE, whichever the map has; or a quest event puts one in). "she's in there."
- **Step 2, the breakout** (BACKLOG: "break a fellow hacker out of a corp"): a special corp. You don't find the real
  node: you **burn every ICE** on each layer (the frozen hacker is under it). ICE MAN is there, re-freezing as you go.
  BRICK called in is the counter (re-frozen ICE costs ICE MAN a bar).
- **Scene:** the ICE cracks: **RTFM** (BACKLOG: a hacker name, "not real time fun machine"). BRICK's little sister, or
  his old crew's brain: the one who did the talking. She reads the manual so he doesn't have to.
- **Reward:** RTFM joins your crew (a new crew member). Her AI: reads the corp's codex
  entry to you, live: the rule line, and on the boss layer the boss twist, before it hits.
- Uses: GLACIER / DEEP FREEZE, ICE MAN, a "burn them all" layer rule, a new hacker.

### NULL: THE LIST
- NULL was built to hunt hackers. **Start:** NULL calls (on your crew, 10 calls in): "contract received. targets: 4."
  It shows you a bounty list on the QUESTS tab: four rivals, by name.
- **Steps:** flatline each one (bars to 0, not just beat them: NULL counts kills) with NULL up. A counter per name.
- **The turn:** the fourth name is yours. Your handle. NULL: "irrelevant. contract is contract." Then: "...negative.
  name match is partial." It's DOPPEL (who wears your handle, glitched).
- **Step 4:** flatline DOPPEL with NULL up. **Reward:** DOPPEL is deleted: it never comes back (out of the rival pool
  for good, like EXORCIST epic but for keeps). NULL LVL 2. NULL's line changes: "contract closed. you are not on any
  list. yet."
- Uses: rivals, flatline vs beat, the rival pool, a BOARD-style list on the QUESTS tab.

### NANA: SUNDAY DINNER
- **Start:** NANA calls, sweet: "has my grandson called you? he stopped calling me." No name.
- **Step 1:** her grandson is GG_EZ (twelve, maybe, bought his deck with a parent's card: hers). With NANA up he logs off
  after one scolding (the counter). Make him log off 3 times. Each time NANA gets a line closer: "that language. i know
  that language."
- **Step 2:** a quest item: **COOKIES** (gear, from the PURLWISE knitting corp's boss, or NANA bakes at a safehouse).
  Next time GG_EZ shows up, use the COOKIES on him.
- **Scene:** short and dumb and sweet: GG_EZ's emotes turn into "ty nana". **Reward:** GG_EZ turns: **GG_WP** on your
  crew (an emote hacker who's nice: his emotes cover ICE, not glyphs: they rule ICE out). Or simpler: GG_EZ leaves the
  rival pool, and NANA LVL 2.
- Uses: GG_EZ, a corp boss drop, a gear used on a rival, "flip a rival" (BACKLOG).

### DIALUP: FORTY DOLLARS
- DIALUP owes SYSOP forty dollars from 1994. **Start:** a number: you've called DIALUP in a corp with SYSOP in it 3
  times (they're friends there: SYSOP stops denying nodes). DIALUP: "he still asks about the forty bucks."
- **Step 1, the number** (a secret ad, ADS.md): an old phone number turns up in one ad (OMNINET ONLINE, or a new
  dial-up ISP ad), only while you carry DIALUP's CALL. Tap it. DIALUP: "that's his board. 1994. it's still up."
- **Step 2:** a quest node on the map: **THE BBS**, SYSOP's board, a tiny special corp: ANSI art, a RULES page you have
  to read (a layer that won't open until you've scrolled the rules), SYSOP as its boss: ACCESS DENIED everywhere.
- **Step 3:** pay him: bring a **WALLET** (the loot) to the BBS. It drops on its last node: the forty dollars, with
  interest.
- **Reward:** DIALUP LVL 2; SYSOP posts on THE BOARD (a new post, a REP unlock: "THE OLD BOARD": read the rules of any
  corp before you enter it, its codex entry on the map).
- Uses: secret ads, a special node, WALLET loot, THE BOARD posts, the BBS look (the editor's old-terminal feel).

### BAUD: REMATCH
- BAUD raced TURBO once and won, and never mentions it. **Start:** a number: TURBO beaten 5 times while BAUD was up.
  TURBO taunts: "REMATCH. SECTOR ONE. ME VS THE SLOW GUY."
- **Step:** a **race seed** (a quest seed like HAD3S, small): one sector, a clock running the whole sector, TURBO's
  ghost time on screen (he plays it too: his cursor taps through every board in reading order, fast). Beat his time
  with BAUD's way: perfects, not speed (a perfect takes seconds off the clock).
- **Scene:** BAUD's line, typed at his speed (it takes forever): "good. race." **Reward:** BAUD LVL 2; TURBO's mod as a
  drop (OVERCLOCK or a new one: your taps are faster but you can't read the tell).
- Uses: a quest seed, a clock (TIME IS MONEY, the timed corps), the leaderboard (TURBO's time as a "record").

### MOTHER: THE FILE
- MOTHER keeps a file on every hacker who has been rude to you. **Start:** MOTHER calls: "LEECH has taken 1,240 credits
  from you. i counted." (the real number: the game counts what LEECH took).
- **Step 1:** LEECH has an office in a corp it skims from (LEDGER or BALANCE SHEET: whichever turns up). A quest mark on
  the map when one is in your sector.
- **Step 2:** the office is that corp's boss layer with LEECH in it, fat with your money (its bars = how much it took,
  capped). MOTHER called in pulls it off you (the counter).
- **Reward:** the money back (a big payout, capped), MOTHER LVL 2. Her file, on the QUESTS tab: every rival who ever
  killed you and how many times. (The next MOTHER step could be a revenge list, NULL-style.)
- Uses: a stat the game already keeps, a map mark, a boss layer.

### ROOT: PAPERWORK (unlocks ROOT)
- ROOT "came with your deck, or moved into it; the paperwork is unclear." This is how it moves in.
- **Start (something odd):** shredding corrupted software at the workbench, sometimes a component comes out wrong: an R,
  an O, a T that won't stack with your other letters (they're marked, a different color). No call.
- **Step 1:** the BOOK gets a recipe that wasn't there: **R??T**, four letters (the workbench's three slots plus the
  digit slot, the only four-letter recipe).
- **Step 2:** PH1SH is involved: his fakes get worse, and a phishing line shows in the terminal: "psst: your deck has a
  stowaway :) want me to take care of it?" Tap it and you lose a letter (and some credits). Don't.
- **Step 3:** spell ROOT at the bench. **Scene:** the bench's screen fills with ROOT's fine print, smug. "finally. i
  have been living in your cache for six runs."
- **Reward:** ROOT joins your crew (no REP; not buyable on THE BOARD any more). ROOT's codex entry fills in.
- Uses: the workbench, corrupted software, the BOOK, letters, PH1SH, a phishing line in the terminal.

### KLUDGE: SPARE PARTS
- **Start:** KLUDGE calls: "i'm building something. need parts." A parts list on the QUESTS tab: **a MOUSE** (an old
  ball mouse), **a MUG** (a cold coffee mug off a sysadmin's desk), **a SHOE** (gear you already have), **tape**.
- **Steps:** the parts turn up in odd places: the MOUSE at the PIER (junk on the line), the MUG in a cache, tape from
  HCF's fires (a node HCF burned drops it, KLUDGE up so it doesn't spread to the real node).
- **Step:** bring them to a safehouse workbench: KLUDGE builds it. **Reward:** a blueprint for **THE KLUDGE**, an exotic
  gear: every use does something random and useful (a random common gear's effect). KLUDGE LVL 2.
- Uses: MOUSE and MUG (the BACKLOG's quest items), the PIER, caches, the workbench, HCF.

### HYPE: GOING LIVE
- **Start:** HYPE calls: "can i stream your next run?? pleeease." The next run she's always up (you start with her CALL).
- **Step 1:** a perfect streak of 5 with HYPE up (a viewer count in her notes line; it climbs with the streak).
- **Step 2:** DOPPEL steals the stream: it wears your handle and her viewers follow it. Beat DOPPEL with HYPE up (it
  copies her, the counter: no mirror taps).
- **Reward:** **your ad**: a new ad in the rotation, "WATCH <your name> LIVE", with your logo, sponsored by HYPE. A title
  for your card. HYPE LVL 2.
- Uses: ads (your logo and name in one), perfect streaks, DOPPEL, cosmetics.

---

## Rival quests (or turns inside the crew ones)

- **PH1SH: CAUGHT** (the PIER pun): a phishing message offers a free exotic: "meet me at the pier :)". At the PIER, one
  catch is PH1SH himself (a fish with a smiley). Reel him in: he flips (crew), or he's out of the pool. Could be the
  ending of ROOT's quest.
- **VULTURE**: never breaks a corp himself. A quest where you leave him the last 10% on purpose (let him take a last
  node 3 times with POPS up?) and he starts leaving you tips. Odd one; maybe not.
- **ICE MAN, SYSOP, HCF, GG_EZ, LEECH, TURBO, DOPPEL** all have a place in a crew quest above.

## Other quests that fit what's in the game (not crew)

- **THE AD THAT PAYS** (ADS.md secret ads): one ad, NeoN+2, tapped while you carry a certain mod, gives an exotic. No
  quest tab entry until it happens. The kind people whisper about.
- **THE SYMBOL PATH** (the user's): a corrupted software shred gives a glyph that's a map through a sector (`.-.-X` /
  ` \.-.`...). Walk that path through the next sector: its boss turns special, or you get a bonus. A treasure map.
- **FLOPPY** (the user's): a gear you insert at a terminal to start a quest: the workbench is the terminal. A FLOPPY
  could be how any of the "something odd" quests start.
- **THE CRATER**: a corp you NUKE leaves a crater on the map; next time through that sector the crater leads
  somewhere strange (BACKLOG "hidden entrances"): a one-off sector, the mold, MYCONET's lab.
- **Challenge posts** (THE BOARD): the first OMNI with no mods; carry a scrap mod through 3 sectors; a HAD3S run with no
  rival gear. Each a post, a small reward.

## What it would take (the engine side)

- **More than one quest** on the QUESTS tab (today it shows POPS's only): a list, a quest per page.
- **Quest steps as data** (like QUEST_INFO): start rules (a call, a stat crossing a number, a world event), and step
  checks the engine can run, so a new quest is mostly words and numbers.
- **Map quest marks**: a corp or node marked for a quest (THAW, THE FILE).
- **Quest nodes**: special corps put on the map for one step (THE BBS, LEECH's office, the frozen node).
- **New hackers**: RTFM (from THAW), maybe GG_WP (from SUNDAY DINNER).
- Each crew quest's own scene (strip cutscenes, asXii art), and TESTING buttons per quest.

## Questions for the user

- Which two or three first? Claude's picks: **ROOT: PAPERWORK** (all built pieces: the bench, corrupted software, PH1SH;
  and it unlocks a crew member), **BRICK: THAW** (a new hacker, RTFM, and a breakout corp), **HYPE: GOING LIVE** (small,
  and your own ad is a great reward).
- Should quest rewards replace the REP cost of LVL 2 (finish their quest: they level up), or stack with it?
- RTFM and GG_WP: new hackers, or keep the cast as it is?
