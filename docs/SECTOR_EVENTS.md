# Sector events (built v13.54, 2026-10-27)

The user's sector event idea, as built in v13.54 (the code: data/events.js, engine/map.js addSector, engine/events.js). Claude's calls the user hasn't seen yet: the share grows 10% a sector after the 2nd (up to 80%); the card's frame is the accent color for anomaly events, grey for sector-wide ones; DEAD AIR rolls a third as often; TIME IS MONEY makes timed corps 3x as likely; FIRE SALE takes 30% off everything at a market (repairs too); THE FENCE's stock is lost at the uplink.
Names (settled 2026-10-26): a **NETWORK SECTOR** rolls a **SECTOR EVENT**; most events put an **ANOMALY** on
some of its corps. BACKLOG.md item 3 points here.

## The flow (the user, 2026-10-27)

The end of a sector is its own flow (after a normal corp boss you pick a reward and go back to the map). Checked in
the code (engine/run.js sectorClear / pushOn), 2026-10-27:

1. Beat the sector boss (OMNI or a stage boss) -> **SECTOR CLEARED** (the success screen, fireworks).
2. -> **THE UPLINK:** keep / sell mods and pay the fee to PUSH ON, or CASH OUT (the run ends).
3. -> **the boss reward** (pick a mod).
4. -> the map climbs from the old sector to the new one, already laid out by the event's rules.
5. **The SECTOR EVENT card** comes up over it once the climb settles: the event's name, a small glyph-sized picture, one or two lines on
   what it does, and a [ CONTINUE ] button. Close it and play.
6. On the map, a corp with an anomaly shows its tag next to the node (as today), and its info box has a line on
   what the anomaly does (as today: `+ RIVAL: a rival races you for it.`).

Settled (the user, 2026-10-27): the card comes at step 5, at the start of the new sector's map. A skipped sector
boss (no reward screen) goes straight to the map: the card still comes up there. A resumed run whose card was
never closed shows it again.

## The card: clearly not an ad

An ad is a wide box with a `+-|` frame, `[ AD ]` in money color, a "skip in 3" countdown, and it blocks the
screen. The event card should look like the game talking, not a sponsor:

- **Narrower** (about 2/3 the ad's width) and centered, with the map dimmed behind it.
- **Its own frame:** `#` corners and `=` rules, in the accent color (or the danger color for a harsh event).
- **A header like a system message:** `SECTOR 2 // EVENT` (no `[ AD ]` tag).
- **No countdown:** [ CONTINUE ] works right away (Enter / Space / tap). No [x].
- **A sound of its own:** a short alert sting (not the ad's ui blip).
- The lines type in, the way the intel line does.

```
#===============================#
|  SECTOR 2 // EVENT            |
|                               |
|            ()_()              |
|            (o.o)              |
|             ~~~               |
|                               |
|         R A T   R A C E       |
|                               |
|  rival hackers: 50% of the    |
|  corps in this sector.        |
|  they burn ICE for you, and   |
|  they steal the pay.          |
|                               |
|  V = RIVAL                    |
|                               |
|        [ CONTINUE ]           |
#===============================#
```

- **The picture:** glyph-sized (5 x 3, like a node glyph), drawn in asXii, stored with the art catalog
  (data/art/). Claude drafts placeholders; the user draws the real ones.
- **Seeing it again:** the map's `SECTOR 2` label becomes `SECTOR 2: RAT RACE`; tapping it reopens the card.
- **The codex** gets an EVENTS page (seen / not seen), like the corps.

## How a sector rolls

- **Sector 1: no event** (a REP option at THE BOARD could turn events on there, later).
- **Sector 2 and up: one event each,** seeded from the run seed (same seed, same events). No event twice in a run.
- **Today's random anomaly roll goes away** (10% of corps, +5% a sector, any type). The event decides what shows up.
- **How many corps:** each event says how much of the sector it hits: a share (30% / 50% / 70%) or every corp.
  **When it's a percent, the card shows the number** (the user, 2026-10-27: "if it is a percent value we should
  display it though so it's clear"). The user's 50% for RAT RACE was just an example ("greater chance of", or every
  corp, both fine). The share could climb with the sector (later: a THREAT level).
  Claude: exact counts (50% of 9 corps = 4 or 5 tagged), so what the card says is what you see on the map.
- **Only corp nodes** get anomalies (markets, caches and repairs never).
- **The sector boss always has the event's anomaly** (the user, 2026-10-27): RAT RACE's boss has a RIVAL, WHERE AM
  I GOING?'s boss is BLINDERS (you see `??5`), CHEF'S CHOICE's boss gets a random one. OMNI too (today OMNI never
  has one). Sector-wide events (no anomaly of their own): open question 7. Today's rule (a random anomaly on a
  non-OMNI boss) goes away. A bigger boss built around the event stays parked.

## The first events

Most reuse today's anomalies, so they're cheap to build. Each one needs a name, a picture, and its card text.
Mix of bad and good, so the card isn't always bad news.

**Anomaly events** (put one anomaly on some corps):

| event | anomaly | what the card says | |
|---|---|---|---|
| **RAT RACE** (the user's) | RIVAL `V` | rival hackers: 50% of the corps in this sector. | bad / mixed (they burn ICE) |
| **WHERE AM I GOING?** (the user's) | **BLINDERS** (new) | some corps hide who they are until you breach. | bad |
| **CRUNCH TIME** | RUSH `>` | deadlines everywhere. some corps put every layer on a clock. | bad |
| **STICKY FINGERS** | THIEF `&` | someone is lifting mods. buy them back at the pawn shop by the boss. | bad |
| **LOCKDOWN** | ARMORED `#` | some corps harden up: hits point you at the real node. | mixed |
| **BAD JUJU** | CURSED `!` | no perfect heals in some corps here. | bad |
| **PAYDAY** | LOADED `$` | some corps are flush: more $ nodes, pay x1.2. | good |
| **BRAND SAFETY** | BRANDED `s` | sigils on the ICE: SIGSCAN works here. | good with the Sigil mods |
| **CHEF'S CHOICE** (the user's, 2026-10-27; was "messy") | any: each tagged corp gets a random anomaly | a little of everything. | mixed (closest to how anomalies roll today) |

**BLINDERS** (the new anomaly, for WHERE AM I GOING?):
- The node shows `??3` (the user, 2026-10-27: yes): the corp code is hidden but its level stays (fully blind would make the level-picked map
  a coin flip; showing the level keeps a little choice). Grey, not the corp's colors.
- The info box: `UNKNOWN CORP // TIER 4 LV3` and `+ BLINDERS: you find out when you get in.`
- On breach, the corp's intro plays as usual: that's the reveal.
- **No pay bonus** (the user, 2026-10-27: "the main reason to go to blinders is cause you have to, anomalies are
  primarily to add challenge or fun").

**THIEF -> the pawn shop** (the user, 2026-10-27; replaces "beat the boss to get them back", so a boss win never
has to sort your mods back in on the same screen):
- A THIEF hit steals a mod (as today). It doesn't come back when you beat that corp: it goes to the **pawn shop**.
- **The pawn shop is a map node in the boss row**, on one side of the sector boss (left or right), linked to it.
  The last row's nodes link to it, so you can get there from anywhere in the sector, buy your mods back, then go on
  to the boss.
- It shows up whenever a corp in the sector has THIEF (STICKY FINGERS, or CHEF'S CHOICE rolling it); the map shows
  it from the start (empty until something is stolen).
- What you don't buy back is gone once you leave the sector.
- Gear and mods that see ahead could peek: PRIORITY still shows the layer count; the logged SCOUT gear would
  reveal it.

**Sector-wide events** (change the sector itself, no anomaly tags):

| event | what it does | |
|---|---|---|
| **COPY PASTE** (the user's "every corp is the same corp") | every corp node in the sector is the same corp (the level rule bends; its level is the sector's). | odd: master one corp |
| **FIRE SALE** | markets are 30% off this sector. | good |
| **FLUSH** | more loot: rest stops come up as caches, more $ nodes. | good |
| **TIME IS MONEY** | every clock in the sector also drains credits as it runs, and timed corps (CHRONOS, COLDBREW, AEGIS, GLACIER...) come up more (the user, 2026-10-27). | bad |
| **DEAD AIR** (a breather) | nothing. "quiet sector. enjoy it." | neutral; rare |

Later (bigger builds, logged in BACKLOG.md item 3): BLACK ICE, an extra layer in every corp, 2 bosses, the sector
flipped (boss first), a trace meter, two events stacked.

## What was built

1. **Data:** `SECTOR_EVENTS` in a new data/events.js: name, picture, card lines, kind (`anomaly` or `sector`),
   the anomaly key, and how strong each threat level is. The anomaly list moves there too.
2. **The roll:** in addSector (engine/map.js): pick the sector's event + threat, place the anomalies; saved with
   the run (`run.events[sector]`).
3. **The card:** an overlay drawn like the ad box but its own look (above); shown once when the sector's map first
   comes up; reopened from the map's sector label.
4. **BLINDERS:** the node label, colors and info box hidden; the reveal on breach.
5. **The sector-wide events:** COPY PASTE in the corp pick, FIRE SALE in priceOf, FLUSH in the map specs, TIME IS
   MONEY in the clock tick.
6. **Rename in code and text:** CORP_MODS -> ANOMALIES; HOW TO PLAY's "CORP EVENTS" -> ANOMALIES + a SECTOR EVENTS
   list; the dev panel's "modifier" -> anomaly, and a dev button to force any event.
7. **Codex:** a SECTORS tab (v13.55). **Neon editor:** a scene that shows the card for any event.
8. **Tests:** every event on a seeded run through sector 2-4 (the playtest harness), nothing stuck.
9. **A TESTING page in the neon editor** (the user, 2026-10-27), for meat testing:
   - every sector event as a button: click one and the game jumps to sector 2 with that event in place (card first);
   - god mode, show the real node, free travel (from the dev panel);
   - give mods and gear (the same pickers as the gear & mods page);
   - Claude's adds: set credits and INT, jump to any sector, the sector boss now, clear this sector, start the
     UPLINK, force an anomaly on the next corp, steal a mod (to test the pawn shop).
   - Then the mod pickers come out of the in-game dev panel.

## Open questions for the user

1. ~~When does the card come up~~: settled: at the start of the new sector's map (the flow above).
2. ~~How strong is RAT RACE~~: settled: any share works; a percent is shown on the card.
3. ~~BLINDERS~~: settled: shows the level, no pay bonus.
4. ~~Good events~~: settled: keep them (the user likes them all).
5. ~~The names~~: settled: the user likes them all.
6. ~~THREAT on the card~~: settled: the card shows the percent itself.
7. **The sector boss in a sector-wide event** (COPY PASTE, FIRE SALE, FLUSH, TIME IS MONEY, DEAD AIR): a random
   anomaly, or none? Claude's pick: a random one (so "the sector boss always has one" stays true); DEAD AIR none.
8. **Pawn shop prices:** what a stolen mod costs to buy back. Claude's pick: its uplink fee (rarity-based, so a
   legendary is dear), with HAGGLE working there.
9. **Its name:** PAWNBROS is a corp already. Claude's pick: **THE FENCE** (where thieves sell stolen goods), or
   PAWN if the user prefers.
10. **THIEF on the sector boss** (STICKY FINGERS' boss): after the boss there's no pawn shop to go to. Claude's
    pick: the boss's thief works like today: beat it and you get those mods back.
