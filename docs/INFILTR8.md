# INFILTR8: the subnet, a net inside the net

**Status:** a brainstorm. Nothing is built. Started 2026-11-17 from the meat notes ("net hack inspiration", BACKLOG
section 12). The mockups: `docs/mockups/infiltr8.html` (round 1: 5 takes) and `docs/mockups/infiltr8_v2.html`
(round 2: 5 VAULT FLOOR maps).

**A playable demo** (Greg, 2026-11-23): `dist/lab/infiltr8.html` (moved from docs/mockups/ 2026-11-23), outside the game: it loads only the game's palettes (a [PAL] button in the footer) and its effects (FX.decrypt on floor names and the end screen). The real
screen (36 x 38, the 23 board rows are the floor, the tray rows hold the d-pad). F1 is THE RING by hand (the turning SCANNER,
a CAM, a patrol on the middle ring); F2 and F3 come from the seed (rooms, pillars, halls, CAMs with their cones,
patrols, the trash chute). Turn based with fog of war; stairs; the payload on F3 sets off
the alarm and shows your trail; out by your door (a clean job), the fire exit or the chute. Gear: FLARE, FRAG, UNIFORM. Patrols show their view (a faint orange cone, the way they last stepped).
`?seed=ABC` for a set seed.
Glyphs (Greg, 2026-11-23): a room's floor `·`, a hall `:`, where halls meet `o` (all the floor's color), a CAM `¢`.
**Ducts** (Greg, 2026-11-23): a layer under the floor. A vent is a hatch anywhere in a room's floor; the duct runs
under rooms, halls and walls to a vent in another room (2 on F2, 1 on F3). Once you've seen a vent, its duct's route
shows as a faint tint. USE on a vent: down in. Inside, the floor above dims, the ducts show as pipes (`═║╔`), your
chip is the duct color, nothing sees you, and a step costs 2 turns. USE at a vent: out. Where two ducts cross you can
switch.
Maybe later: **branching ducts.** For now a duct is one line with two vents, so it reads at a glance and stays a
scarce safe route. A branch would be cheap: a second duct that starts mid-pipe works like a crossing does now. It
could be the point of a special floor, like a MAINTENANCE LEVEL with a duct network.
Phone controls to try (Greg, 2026-11-23): the header's [UI] button steps through CLASSIC PAD, SWIPE (swipe anywhere),
TRACKPAD (drag on a box: a step a notch), ZONE PAD (four wedges, hold to walk) and STICK (a floating thumbstick).
All but CLASSIC hold USE and the gear together on the right, with no swap. `?ui=3` picks one.

Everything here is Claude's unless it says Greg. Greg's starting points:
- A NetHack-style dungeon: sewers, tunnels, data mines. Turn based, fog of war or a light. Get in and out in a number
  of turns. An oracle, a Sokoban pushing game, a mimic. Arrows, clicks, or a mini d-pad on a phone. (2026-11-15)
- An infiltrate mission: a stealth game. Sneak past cameras and security. Maybe you pick it instead of breaching a
  corp. (2026-11-17)
- A net inside the net, so it's all virtual. The game has goofy physical things in it already (the SHOE). (2026-11-17)
- It takes the same area as the tiles: the header (INT, CR) stays, and your gear still works (a FRAG). (2026-11-17)

## Decided so far (Greg, 2026-11-17)
- **The d-pad is needed.** A button swaps the whole tray for the controls (d-pad, USE, wait) and back:
  `[⇄ PAD]` / `[⇄ GEAR]`. The tray's rows hold the pad, so the map keeps its rows. (Round 2 has it.)
- **The sweep goes to THE VAULT FLOOR** (Greg liked it in PACKET PUSH). Round 2 has the turning arm (THE RING)
  and the beams that racks block (THE SERVER FARM).
- **Stairs** for going up and down floors.
- **More unique halls and room shapes.**
- **Tap a thing to get its info**, so the info lives on screen. Round 2: a 2-row info card above the controls; with
  nothing tapped it's the message line.
- **Get in, then get out.** You come in a door and usually leave by the same one. Alt doors are the other ways out.
- **The mode is first explained in a short crew quest: DIALUP's.** Once he's on your crew (5 calls, then his crew
  post on THE BOARD, 120 REP), the quest comes up. It takes you into a quest seed with an infiltrate node and a short
  training; after it, infiltrate nodes start showing up in your runs. (The plan: "The intro quest" below.)

## The intro quest: DIALUP, FORTY DOLLARS (Claude's take, 2026-11-17)
Mashed with DIALUP's quest in docs/CREW_QUESTS.md. Why him: "slow to get going, deadly once he's in", "bad in clock
corps, great in big boards": a turn-based mode is his game. His rival SYSOP is already the subnet's floor boss, and
FORTY DOLLARS already had THE BBS with a RULES page to read.
- **A heist in reverse.** You break in to pay SYSOP back the forty dollars (with interest), without him knowing.
- **Start:** DIALUP calls once he's crew: "i owe a guy. i can't knock on the front door. he'd ban me." He gives you the
  board's old phone number.
- **The quest seed:** one small sector, one node: THE BBS. Its only button is INFILTR8.
- **The training is the board's RULES:** a floor per rule. Rule 1: moving, and tapping things for info. Rule 2: a CAM.
  Rule 3: a sweep. Rule 4: SYSOP on his rounds. DIALUP types his tips between them, slowly.
- **The payload goes in:** leave the money in SYSOP's desk, then out by the door you came in (get in, get out).
- **The end:** SYSOP posts on THE BOARD: "who left this." DIALUP: "...good." **Reward:** infiltrate nodes from now on
  (maybe DIALUP LVL 2 too).
- **Seeds:** the quest seed is its own (like HAD3S). In normal runs every seed makes the same map for everyone; the
  INFILTR8 button (or node) just stays hidden until it's unlocked, and before that the node plays as a normal corp.
- **Later subnet quests:** KLUDGE's SPARE PARTS (the MUG off a sysadmin's desk; the SOCK), BRICK's THAW (a jailbreak
  floor), MOTHER's THE FILE (LEECH's office).
- **Decided (Greg, 2026-11-17):** FORTY DOLLARS is where you're introduced to INFILTR8. How the rest of the quest goes,
  Greg will look over again.

## Round 2: five VAULT FLOOR maps (`docs/mockups/infiltr8_v2.html`)
1. **THE RING:** a core in a ring in a ring, the doors on different sides. The core's sweep is an arm that turns
   like a lighthouse, an eighth a turn. The alt exit is a vent: too tight for your pack slot.
2. **STAIRS:** B1 of 3, with the floor stack on the right. An L room with a CAM in its corner, a pillared hall
   (pillars to hide behind), a zigzag hall. Going down is safe; the floors above get a step worse while you're
   below.
3. **THE DUCTS:** ducts run through the walls between vents. Nothing sees you in one, but a step takes 2 turns and
   no gear fits. A round room, a cross room, a duct under everything to the alt exit.
4. **THE SERVER FARM:** beams from the walls move a row each turn; racks block them, and the cells behind a rack
   are safe. Maybe racks can be pushed, so you make your own shadow (PACKET PUSH meets the vault).
5. **GET OUT:** you have the payload and the alarm is on. Your trail shows the way back to your door. Alt exits,
   each with a catch: the FIRE EXIT (loud, less pay), the TRASH CHUTE (your pack gets shuffled), the WINDOW (needs a
   FLARE or a crew member). Your own door is a clean job. Idea: the alarm starts when you take the payload, so
   every run has a way-out half.
   **Decided (Greg, 2026-11-23):** getting out is getting out. No exit costs you anything by default (the chute's
   "pack gets shuffled" never meant anything). A job's own mod can change that: on an "unseen" job, say, the loud
   FIRE EXIT cuts your pay.

## Names
- **INFILTR8** for the action (the button next to BREACH), and **the SUBNET** for the place. That's what the doc and
  the mockups use.
- Others: BACKDOOR, the UNDERNET, CRAWLSPACE, SUBLEVEL, the INTRANET (a corp's own net, where the staff live),
  LATERAL (as in lateral movement), DEEPNET, `/dev/null`, ROOTKIT.
- Floors could have their own names: FLOOR, SUBNET 2/4, `../`, the depth in hex.

## The fiction: why a net has rooms
- A corp's network has a public face (the layers you breach) and an inside: the intranet the staff use. INFILTR8 is
  getting into that inside without setting anything off.
- The inside is drawn the way the corp's sysadmins pictured it. Lazy admins made it look like an office, with doors
  and halls. Weird corps made weird ones. That's why there are rooms, cameras and a shoe: the metaphors leaked.
- So every corp's subnet can look like the corp. BLACKOUT's is dark. CIPHER's is in symbols. APIARY's is a hive.
  STREAMFLIX's is a set of TV channels you walk between.
- The corp's tell leaks too. Whatever hides the real node in a layer hides something in the subnet: the safe room,
  the watched room, the way out. Players who know the tells sneak better. This is the hook that ties it to the
  main game.

## Where it shows up (pick one or more)
1. **INFILTR8 instead of BREACH** (Greg's note). On a corp node you get both buttons. Breach is the guessing game
   you know. Infiltrate is the sneak. Either way the corp counts as beaten.
2. **The sub-basement of a corp you nuked** (the 11-15 note). NUKE wipes the corp, and the ruins open a way down.
3. **A map node of its own** (`[▼]`?): a SUBNET node, like a data cache or a pier. Optional, and a little rich.
4. **Quest places.** A quest sends you in for something: the DISC, a crew member's file, G0D's source.
5. **Secret ones.** The SHOE's (mockup 5). A cheat code from THE BYTE. A crack in a boss's layer.

My pick: start with 1, since the choice on the corp node is the strongest idea. Add 4 and 5 once the mode exists.

```
 +=======================+
 |    B R E A C H        |
 |   - 5 layers, ICE -   |
 +=======================+
 +=======================+
 |  I N F I L T R 8      |
 |  - 3 floors, quiet -  |
 +=======================+
```

## How a run inside plays
- **Turn based.** Nothing moves until you do. Phone friendly, and it gives you time to think, like the layers do.
- **The trace clock is turns.** `TURN 12/40`. At 40 you're found: the alarm goes and you have a few turns to get out
  before you take damage each turn. This is Greg's "get in and out in a number of turns".
- **The goal:** reach the payload ($), then the exit (>). Or skip the payload and just pass through (less pay).
- **Fog of war.** You see your room. Rooms you've seen stay dim. A light (FLARE) or a PING shows more.
- **NOISE.** A meter. Running (moving 2 cells a turn), fighting, and loud gear fill it. Noise pulls daemons to you.
  Waiting a turn lets it drain.
- **Getting seen.** A camera that sees you starts a short count (`!`, then `!!`). Break its line of sight before it
  ends, or the floor goes on alert. Seen at alert: -1 INT.
- **INT is your life here too.** 0 INT is the same death as in a corp. No new health system.
- **Floors.** 2 to 4, a few minutes each. The same seed always makes the same floors (seed boards still work).

## Sneaking or fighting?
My recommendation: **mostly sneaking, with fighting as the loud way out.**
- You can always fight. Bump a daemon to hit it. It works, but it's noisy, and noise brings the rest.
- Gear is your real weapon. A FRAG kills what's in a 3x3, opens walls, and is very loud.
- A GHOST run (never seen, nothing fought) is the PERFECT of this mode: better pay, maybe a feat.
- So there are three ways through every floor: sneak, fight, or blow it up. That's what keeps it from being only a
  puzzle.

Dropped (for now): a full roguelike fight system with stats, levels and weapons. It's a lot of new rules, and the
game's strength is short, readable choices.

## What's in there
### Security (the stealth side)
- **CAM** (`◉`): a cone that turns a step each turn. Stops for a turn when it sees something.
- **SWEEP** (`═`): a line that crosses a room one row each turn. Packets and walls block it.
- **SCANNER** (`S`; Greg, 2026-11-23, was THE ARM): a narrow beam. Caught in it, you're spotted at once: an alert
  (-1 INT, no clean job, the patrols come), with no grace turn like a CAM's. Not a searchlight: that's just another
  CAM. In the demo it spins on a pivot in THE RING's core. It could also be mounted on a wall and slide back and
  forth along it, sweeping the room the other way (not built yet).
- **TRIPWIRE** (`┄`): a line you can't step on. You can see it only from close up, or with a light.
- **PRESSURE TILE**: one in a hall. It tells the nearest daemon where you are.
- **LOCKED DOOR**: a password (found on a sticky note in a room), a key card, a pushing puzzle, or a FRAG.
- **CAPTCHA DOOR**: pick the right glyph out of 4 (the corp's tell!). Wrong: noise.
- **HONEYPOT**: a `$` that's an alarm. The mimic Greg wanted.

### Daemons (the things that move)
- **WATCHDOG** (`&`): follows your trail, a step behind where you were. A BONE sends it off.
- **SPIDER** (`¤`): sits still and webs the cells around it. Walk through a web and you lose a turn.
- **PATROL** (`P`): walks a fixed loop. Learn the loop and slip by.
- **TRACER** (`T`): goes to wherever the last noise was. Throw something and it goes there.
- **MIMIC**: a `$`, a door, a SOCK. Wakes up when you touch it.
- **SYSOP** (`@` in red): a person, the floor's boss. Walks between rooms, reads your noise, opens any door. Seen by
  a SYSOP: you're out.
- **PAPERCLIP**: an old office helper. It follows you, offering help. Its help is loud. You can't hit it.
- **RIVALS**: the game's rival hackers, in the subnet too, racing you for the payload. LEASH, MUZZLE and EXORCIST work.
- **Corp twists:** HYDRA's daemons split when hit. BLACKOUT's are invisible past 2 cells. SIMON's patrol loops play a
  tune. APIARY's are bees that swarm toward noise.

### Rooms and set pieces
- **THE ORACLE** (Greg's): a terminal or an old chatbot. Ask it one question per floor ("where is the payload?",
  "what does the TOE want?"). It answers in riddles, or in the corp's tell.
- **THE PUSH ROOM** (Greg's Sokoban): push packets onto ports to open the firewall (mockup 3).
- **THE SERVER FARM:** rows of racks to hide between, with a sweep crossing.
- **THE BREAK ROOM:** a vending machine (spend CR on gear), a coffee machine (+1 INT, but it's loud).
- **THE CUBICLES** (Greg, 2026-11-23): a room of desks and cubicle walls: **low cover**. You see over it, but
  crouched right behind it, CAMs and patrols can't see you. (The rule: low cover blocks a view of you only if you're
  next to it, on the far side. It never blocks your own view.)
- **Terminals in rooms** (Greg, 2026-11-23): a terminal can be just part of a room, like a LIGHT SWITCH on a wall.
  It doesn't need a room of its own. See the terminals in Kit.
- **THE CEO'S OFFICE:** the best payload, the most security.
- **THE TRASH:** deleted files. Junk, and once in a while something good (the recycle bin, of course).
- **A DATA MINE** (from the 11-15 note): you dig in the dark, with a light that runs down.
- **A STAIRCASE MADE OF CABLES** between floors.
- **THE WAREHOUSE** (Greg, meat notes 2026-11-22 and 2026-11-23; BACKLOG §12): a factory with a conveyor. PARCELNET or
  MEGAMART.
  - Every turn the belt moves its boxes one cell along. Boxes block sight, like a pillar, so your cover moves. Stay in
    a box's shadow while a CAM watches the room. When a box reaches the end, you're out in the open.
  - **Ride it:** step onto the belt and it carries you a cell each turn, as well as your own step. It can be a way into
    another room, through a hatch in the wall, or down a chute to the next floor.
  - **The smasher** (the point of it: the ride has to end, so you have to get off): at the end of the belt a press comes down every few turns. Get off before you reach it, or time it.
    It costs INT, or it's the end of the run.
  - With a CARDBOARD BOX (kit) on, you ride the belt as a box. CAMs don't look twice.

### Your gear in there
Most gear already has a meaning that carries over. The tray stays on screen, and you use it the same way.
- **FRAG:** a 3x3 blast. Kills daemons, opens walls, very loud.
- **SHOE:** finally does something. Throw it: it makes noise where it lands, and TRACERs and WATCHDOGs go look.
  (And in mockup 5 it turns out to have a subnet of its own.)
- **PING:** shows what's in a room you're not in.
- **SPLIT:** shows half the floor's map.
- **0DAY:** marks the payload.
- **FWALL:** blocks the next hit or the next time you're seen.
- **SHAKE:** every daemon takes a random step.
- **TILT:** every daemon slides to one side of its room.
- **FREEZE / SLOMO:** daemons skip turns.
- **FLARE:** lights the floor for a few turns.
- **TUNNEL:** step through one wall.
- **WARP:** a random spot on the floor (good luck).
- **REWIND:** +5 turns on the trace clock (it gives seconds in a layer; here it gives turns).
- **BONE / LEASH / MUZZLE:** WATCHDOGs and rivals, as in a corp.
- **CALL:** a crew member comes along. BRICK takes a hit. b0y shows the payload. NANA heals. KLUDGE tapes a door shut
  behind you.
- **New ones (maybe):** DISGUISE (one camera ignores you), SPOOF (a daemon thinks you're a daemon), CRATE (you hide
  in it, and it moves when you do).

## Kit: what you bring in (Greg, 2026-11-23)
The game's gear won't all port over: ZOMBIE, TRACER and lots of others mean nothing on a floor. So INFILTR8 gets
its own kit, picked before you go in. Ways to do that (pick one or mix):
- **Set loadouts:** choose one of 3 or 4 bags, each with a style. GHOST (DART GUN, LOOP TAPE, CLOAK, FLARE), BRUTE
  (CHARGE x3, TASER, MED KIT), TRICKSTER (NOISEMAKER x2, SMOKE, HOLO DECOY, GRAPPLE).
- **A counter at the door:** buy kit with CR before going in, a few slots to fill.
- **Both:** a set loadout, plus one slot you buy.
- A short list of game gear that does mean something here could still come in (FRAG, FLARE, SHOE, PING, FREEZE);
  see "Your gear in there" above.

**Leaning (Greg, 2026-11-23): a mini game, easy in and out.** Low difficulty, little to learn, little prep.
- **Preset loadouts:** pick one and it just gives you the kit. No shop and no slots to fill.
- **Pickups:** you find more kit lying about on the floor during a run.
- **Terminals:** many of the ideas below aren't things you carry. They're things a terminal does. Find a terminal,
  hack it, and pick one thing (each terminal is used once). For example:
  - **LIGHTS OUT:** this floor goes dark (FUSE PULL). It needs lit and dark rooms.
  - **CAMS OFF:** every CAM on this floor goes dead for a while (JAMMER / EMP / LOOP TAPE).
  - **MAP:** shows the floor's walls and doors (BLUEPRINT), or every way out (EXIT MAP).
  - **WHERE'S THE PAYLOAD:** marks it on the floor.
  - **FIRE DRILL**, **PHONE RING:** the patrols go where you send them.
  - **UNLOCK:** opens the locked doors on the floor (once doors are in).
- So the ideas below split three ways: kit you carry (DART GUN, SMOKE, NOISEMAKER, UNIFORM...), things you pick up
  on the floor, and terminal actions.
- The demo is harder than this. Things to tune down: patrols move 2 steps a turn after the payload, so you can't
  outrun them (make it 1); one CAM alert sends every patrol after you (make it the nearest); 4 INT (6?); CAMs see 14
  cells (10?); once the alarm runs out, -1 INT every turn (every 3 turns?).

FLARE stays. FRAG needs a new name in here, since FRAG is already the game's gear: **CHARGE**, BREACH, PIPE BOMB, C4.
FLARE is game gear too, so it may want its own name as well (GLOWSTICK?).

### 50 ideas, to cut down
Names are 15 characters or less. Greg's are marked.

**Seeing**
1. **FLARE:** the whole floor, for 6 turns. (in the demo)
2. **GLOWSTICK:** drop it. It lights 5 cells round where it lies, for the rest of the floor.
3. **NIGHT VISION:** you see twice as far, for 10 turns.
4. **SONAR:** shows everything that moves, through walls, for 1 turn. A little noise.
5. **BLUEPRINT:** the floor's walls and doors, not what's in the rooms.
6. **KEYHOLE:** stand at a door and see the room behind it.
7. **PERISCOPE:** see round a corner, from a cell next to you.
8. **BUG:** stick it on a wall. You see its room from anywhere on the floor.
9. **CAM TAP:** put it on a CAM: you see what the CAM sees.
10. **HEARTBEAT:** before you take the stairs, see where the next floor's patrols are.

**Not being seen** (Greg: something to stop cameras, and more stealth)
11. **DART GUN** (Greg's): puts a patrol to sleep for 8 turns. 3 darts, range 6.
12. **JAMMER** (Greg's): a CAM goes dead for 10 turns.
13. **SPRAY CAN:** blinds a CAM for good, but a patrol that walks by sees the paint and comes looking.
14. **LOOP TAPE:** a CAM plays an old loop and doesn't see you for 12 turns.
15. **CLOAK:** unseen for 4 turns. You can't use anything while it's on.
16. **CARDBOARD BOX:** hide in it. Standing still, you're a box. Moving while seen: caught.
17. **SOFT SHOES:** your steps make no noise (once noise is in).
18. **UNIFORM:** patrols ignore you unless they're right next to you, for 15 turns. (Greg likes it; in the demo, x2.)
19. **SPOOF BADGE:** a CAM reads you as staff, once per CAM.
20. **HOLO DECOY:** a copy of you appears; the CAMs and patrols go after it.
21. **SHADOW SUIT:** in a cell no light falls on, CAMs past 4 cells don't see you.

**Distractions** (Greg: a smoke grenade, and something you send off)
22. **SMOKE** (Greg's): a 3x3 cloud for 6 turns. Nothing sees through it, you included.
23. **NOISEMAKER** (Greg's): throw it up to 6 cells. Patrols go look.
24. **RC CAR** (Greg's "send off"): you drive it for a few turns instead of yourself. Patrols chase it.
25. **DRONE:** fly it over walls; it sees for you, and it's loud if it crashes.
26. **PHONE RING:** a phone rings in a room you pick. The nearest patrol goes to answer it.
27. **FIRE DRILL:** every patrol heads for the fire exit for 10 turns. The fire exit is then a loud way out.
28. **GLITTER:** CAM cones in the room jump about at random for 6 turns.
29. **FUSE PULL:** the lights go out. Everyone sees 3 cells, you too.
30. **COIN:** flick it 3 cells. A small noise, but free: you have 5.

**Moving**
31. **GRAPPLE:** zip to any cell in a straight line, up to 6 away.
32. **VENT KEY:** make a vent in the wall next to you. If there's a duct behind it, you're in.
33. **LOCKPICK:** opens a locked door. Takes 3 turns.
34. **ADRENALINE:** 2 steps a turn, for 5 turns.
35. **ROPE:** go down a floor from where you stand. No stairs needed.
36. **BLINK:** swap places with a thing you can see.
37. **KNEE PADS:** duct steps cost 1 turn, not 2.

**Breaking things**
38. **CHARGE** (FRAG, renamed): blows the 3x3 round you. Loud. (in the demo)
39. **THERMITE:** burns through one wall cell, quietly, over 3 turns.
40. **BREACH:** a line of 5 through walls, in the way you face.
41. **EMP:** every CAM and SCANNER within 6 cells goes dead for 12 turns. Patrols are stunned for 2.
42. **TASER:** a patrol next to you is out for 6 turns.
43. **SNARE:** lay it down. A patrol that steps in it is stuck for 8 turns.
44. **CALTROPS:** a 3x3 patrols cross at half speed.

**Time and the trace**
45. **COFFEE:** +20 turns on the trace clock.
46. **SCRAMBLER:** +15 turns on the alarm countdown.
47. **MED KIT:** +1 INT.

**The job**
48. **FAKE PAYLOAD:** leave it where the real one was. The alarm waits 10 turns.
49. **SECOND BAG:** carry a second payload out (if bonus loot rooms come in).
50. **LOOKOUT:** a crew member at your door. On the way out, they call out patrols near the exit.
51. **GETAWAY VAN:** one way out (the fire exit or the chute) counts as a clean job, once.
52. **EXIT MAP:** shows every way out on this floor.

### Halls in the demo (Greg, 2026-11-23)
Two generated halls sometimes ran side by side, and you couldn't tell where they crossed. Now a hall avoids running
beside another one: side-by-side stretches dropped from about 2.2 to 0.2 per floor over 2,000 floors. Where halls
meet or split there's a ◇ junction mark. Inside a doubled stretch, where it still happens, no mark is drawn.

### From playing the demo: not built yet (Greg, 2026-11-23)
- **Real doors.** Right now a `+` is only a gap: you, patrols and every view go straight through. The idea:
  - Doors start closed, and a closed door blocks sight, so you can't see into a room until you open it.
  - Step into a closed door to open it (that's your turn). Taking a turn to close it behind you breaks a chasing
    patrol's line of sight.
  - Patrols open doors on their rounds. An open door you didn't open tells you something went through.
  - Later: locked doors, opened with a LOCKPICK, a key card, or a CHARGE.
- **Patrol line of sight.** Done in the demo: the cone shows, 90 degrees wide, the way the patrol last stepped.
  **The turn warning** (built 2026-11-24): a `?` over a patrol the turn before it turns round at the end of its round,
  so trailing one is a skill. Still open (with the tuning): the cone's angle ignores the cells being twice as tall,
  though its range doesn't, so it's a little off up and down (CAMs share the code).
  **Pace** (Greg, 2026-11-24): on its round a patrol steps every other turn (`PAT_PACE = 2`), so you can catch one up
  from behind. It still looks every turn. Chasing you, or with the alarm up or the payload in your bag, it moves every
  turn (two steps with the alarm or payload, as before). Patrols are staggered so they don't all rest on the same turn.
- **Takedown** (built 2026-11-24): step into a patrol from behind or the side (by the way it's facing) and it's out,
  quietly, for 30 turns (it's your turn; no alert). A dim `P`: it doesn't move or see, you can step over it, and when it
  comes to it picks its round up again. From the front, it catches you (-1 INT), as ever; a stunned one goes down from
  any side. The DART GUN and the TASER are then for patrols you can't get behind.
- **Lit and dark rooms.** In the demo you just see a set distance: a circle 15 cells across and about 7 rows up and
  down, blocked by walls. Light plays no part. The idea is to make light the rule:
  - **A lit room:** once you're at its door, or can see in, you see all of it. But the CAMs and patrols in it see you at
    full range.
  - **A dark room or hall:** you see 3 or 4 cells, and so do they. Dark hides you, but you're half blind, and a patrol
    can be right on you.
  - So crossing a lit room is the tense part, and the dark halls are where you slip around.
  - Kit that gets a job from this: FUSE PULL (lights out), GLOWSTICK (a light of your own), SHADOW SUIT, SPRAY CAN,
    NIGHT VISION.
  - A room's light could come with its type: THE SERVER FARM is bright, THE BREAK ROOM has a switch, THE CEO'S OFFICE
    is lit. The fiction: a lit room is part of the net in use, a dark one is idle memory.
  - **The power** (Greg, 2026-11-24): killing the power (a terminal's LIGHTS OUT, a FUSE PULL) also **stops the
    belts**. So it's a trade: the floor goes dark, but the crates stop moving (still cover, but now cover that stays
    put) and the belt won't carry you anywhere. And the other side of it: with the belt stopped you can walk back
    along it, upstream, the way it wouldn't let you before (a belt as a route either way). Open: does the power run anything else (the SCANNER, a factory's
    tanks humming, CAMs on their own batteries or not)?
- **Effects** (Greg, 2026-11-23, after Cogmind's ASCII particle effects: its lasers and blasts are animated characters
  on the grid). INFILTR8 can use the game's effects library (engine/fx.js; the lab page loads it):
  - THE SCANNER: a bright beam that leaves a short fading trail as it turns, not a jump an eighth a turn.
  - DART GUN, TASER: a quick streak from you to the target (`-` `=` `─`), a spark where it hits.
  - CHARGE (FRAG): a ring of characters that grows and breaks into glitch marks; walls crumble to rubble.
  - EMP: a wave of noise rolling out, the CAMs flickering out one after another.
  - A CAM's alert: its cone flashes, a `!` pops and fades.
  - Down a vent: the floor above dissolves into noise as the pipes come in (the game's decrypt).
  - THE BELT (Greg, 2026-11-24): animate it a bit, so it reads as moving (the marks were made plain and still: `>`
    `<` `v` `^`). Crates sliding a cell over the turn, not jumping; the press `X` thumping down as a crate's crushed.

### The floor generator: procedural, with checks (Claude's take, 2026-11-23)
- Hand-picking seeds doesn't last: a seed only means something to the generator that made it. Change the generator
  and every seed makes a different floor.
- So: the game stays procedural. The **floor viewer** (the demo's dev panel) shows a dozen floors at once, to find
  what goes wrong. Each problem becomes a **check** the generator runs, and a floor that fails is thrown out and
  made again ("every room reachable", "no CAM sees the stairs", "the payload room has cover").
- Fixed layouts are for special floors only (a story floor, a boss floor), saved as data, like THE RING.
- **Rooms by BSP** (binary space partitioning, built 2026-11-23): the floor cut in two, each half again, a room in each
  piece. Rooms spread over the whole floor; halls join neighbours.
- **Order** (Greg, 2026-11-23): these are office buildings, so floors want some structure, but not every floor, or
  they get dull and lose their corners. Each floor gets an order from its seed (about 3 in 10 orderly, half mixed, 1 in
  5 messy). Order is the chance that rooms side by side line up (same top and bottom walls), that rows of cuts line
  up across the floor, and that two neighbours' doors face each other with a straight hall between.
- **Room shapes** (built 2026-11-23): a room is a set of floor cells, with walls drawn round whatever shape they make.
  Box, cut corners (reads rounder), L (the inside corner is a blind spot), split (a wall across with a gap: two
  chambers), and big halls (BSP keeps two pieces' room as one, with pillar rows). Doors, CAMs (in inside corners),
  vents and spots all work from the cells. Still to come: cross, ring (a room in a room), gallery (long and thin).
- **Roles and placement** (built 2026-11-23): each room gets a role from where it sits: start (stairs up), goal (stairs
  down, or the payload), hub (3+ doors), side (1 door), way. CAMs go in the goal, hubs and rooms on the way through,
  in an inside corner, aimed at a door or the payload; never in the start room, never sweeping the arrival stairs.
  Patrols walk between the goal and hubs, not through the start room. The floor is placed again (up to 12 goes)
  till the shortest way through crosses a CAM's sweep or a patrol's walk.
- **Room types** (built 2026-11-23): **THE VAULT** is F3's goal: one way in (its other doors walled up, if every room
  can still be reached), the payload at the back, a CAM on it. **THE SERVER FARM**: a big room on the way, rows of
  racks (`▒`: nothing sees or walks through) with an aisle round the edge; about 1 floor in 4. Halls left leading
  nowhere are pruned.
- **Closets, nooks, and things in rooms** (Greg, 2026-11-23; built the same day):
  - **Closets:** a tiny room (1 x 2, 2 x 1 or 2 x 2 inside), one door, built out from a room's wall or off a hall.
    The chute goes in one half the time; a duct can come up in one. Later: loot, a terminal.
  - **Nooks:** the same off a hall, open (no door): 1 or 2 cells, out of the way of a patrol looking down the hall.
  - **THE RESTROOM:** stalls along one wall (thin walls, open at the front): duck into one.
  - **THE FACTORY:** a big room with a tank in the middle (two side by side in a wide one): a rounded box, `░`
    inside. The big rooms take turns: server farm, cubicles, factory. Later: THE WAREHOUSE's belt.
  - **Plants** (`Y`; you step into one and hide, as in the atrium's beds: Greg, 2026-11-24) in the corners of some plain rooms; a **statue** (`&`) in the middle of some hubs.
    **Decided (Greg, 2026-11-23):** plain characters for things where we can (`Y`, `&`, like `P` and `S`). Greg likes
    `§`: keep it for something. (`&` was the WATCHDOG's in the daemon ideas above: that one needs another mark.)
  - Nothing put in a room may shut part of it off (each one checked; a plant and a pillar once did together).
  - Dropped for now: chairs (clutter you can walk through, nothing to play with).
- **Building types** (Greg, 2026-11-23; built the same day): the seed lays a floor out; the building type sets the odds
  of what's in it, how big its rooms run, and how orderly it is. **OFFICE** (cubicles, restrooms, plants, a lobby
  statue; tidy), **INDUSTRIAL** (big halls, factories; messy), **DATA CENTER** (server farms, sometimes two; tidy). In
  the demo the seed picks one (AUTO) or the dev panel and the floor viewer force one. **In the game the corp you're in
  picks it** (PARCELNET or MEGAMART industrial, SEEKR or LEDGER an office...), so a corp's floors feel like that corp.
- **More rooms and shapes** (Greg's ideas 2026-11-23, built 2026-11-24):
  - **THE LAB:** islands of benches (`=`, low cover). A **LAB** building type (MEDIX's): labs on half its floors.
    Later: cabinets, a clean room you need gear for.
  - **THE ATRIUM:** a plant bed (`"`) in each corner and a statue in the middle. You **step into** a bed and hide in
    it: a CAM or a patrol sees you there only from right next to you (the potted plants you hide behind). An
    office's room, mostly: on a third of office floors.
  - **THE WAREHOUSE** (built 2026-11-24): a belt (`>` `<` `v` `^`, the way it goes). Each turn it moves everything on
    it a cell: crates (chips: a lowercase letter on the crate color, for what's in them, meaning for later; moving
    cover, nothing sees or walks through one) and you. Stepping with it is 2 cells a turn. Its last cell is THE PRESS
    (a red `X`; **Decided, Greg 2026-11-24:** plain marks, chips for the crates): crates are crushed there,
    and you're **shoved off to the side, unhurt** (**Decided, Greg 2026-11-24:** it doesn't hurt you; anything behind
    you has to move on). Patrols wait for a crate to pass. Industrial floors, mostly.
    **Room to room** (Greg, 2026-11-24): a belt works a little like a duct you can see. It starts in the warehouse and
    ends in another room, at cells anywhere in them, turns corners in rooms, and goes straight through a wall (a hatch)
    or the gap between two rooms (open: no walls either side; Greg didn't like the walled tunnels). It never crosses a hall or a
    door, nor runs beside one, and never goes into the vault or a closet. Ducts still run under it. Half the industrial
    floors get one. Later: a belt down a chute to the next floor.
  - **Shapes:** cross (a plus), ring (a corridor round a core, one way in: THE RING's idea, in big rooms), gallery (a
    long room 3 across). A room rolls only among the shapes that fit it (rolling among all and falling back to a box
    made boxes 55% and the new ones all but never). Now: box 37%, L 27%, cut 18%, split 11%, cross 5%, ring and
    gallery 1% each (they need a big room).
  **The vault's duct** (Greg, 2026-11-23): half the F3 floors, the one duct runs into the vault, a second way in over
  the guarded door. Never from the start room or one close to it, so the vent has to be found. Otherwise no duct
  reaches the vault.
- **THE CUBICLES** (built 2026-11-23): L-shaped desks (`▄`), 4 x 3 a cubicle, an aisle round the edge. **Low cover:**
  you see over a desk; a CAM or a patrol does too, unless you're right next to it on the far side. CAM cones show the
  shadow behind each desk. A floor's biggest room takes turns being the server farm or the cubicles; cubicles on
  about 1 floor in 6 (they need a 10 x 7 room). Room labels in the viewer sit on a plain run of wall.
- The plan: the viewer; even room placement (BSP); things placed with purpose (CAMs on doors and the payload,
  patrols between the rooms that matter); then room types (terminals, THE CUBICLES, THE SERVER FARM, THE WAREHOUSE).

### Stations, light and doors (Greg, 2026-11-24; built the same day)
- **Stations:** solid things you USE from beside them: a popup of choices, pick one (or a number key), and it's
  spent; CLOSE spends nothing. (The demo's popup is a stand-in: **in the game, use the game's own popups**, their
  style and how they work; Greg, 2026-11-24.) A USE on the tile you stand on (stairs, a vent, a way out) comes first, then a station
  beside you, then an open door beside you.
  - **`T` TERMINAL:** CAMS OFF (every CAM on the floor, 25 turns), MAP (the floor's layout and its ducts), or LIGHTS
    OUT (the power, 25 turns). **Set in a wall** (Greg, 2026-11-24: not free standing): a cell of a room's wall in a
    straight run, used from the room's floor in front of it, with nothing to stand on behind it; it blocks sight as a
    wall does, and the wall joins up to it.
  - **`L` LOOT CACHE:** one of two finds to carry out (CR); the end screen counts your haul.
  - **`R` RE-UP:** +1 INT, or +1 of a piece of gear.
  - **`B` BAG SWAP:** your gear for a bag: GHOST (UNIFORMs, FLAREs), BRUTE (FRAGs), SCOUT (FLAREs). The start of the
    preset loadouts.
  - Placing: every floor a terminal at least. Tech buildings more terminals (a data center 2.5 a floor, a lab 2),
    industrial ones more caches (1.3) and bags; an office a mix. A closet of 2 cells or more if there is one, else a
    room's floor against its wall: never by a door, never shutting part of a room off.
- **Light:** a room is lit or dark. Lit: a server farm, the vault, a lab, the cubicles, a factory, a warehouse, an
  atrium; a restroom half the time; a plain room by the building's odds (an office 60%, industrial 35%); the room you
  come in by, always. Halls and closets are dark. In the light, all see far; in the dark, CAMs and patrols see 5,
  you 7 (the dark's on the sneaker's side). A lit room you can see has a faint warm wash.
- **The power:** LIGHTS OUT (a terminal) cuts it for 25 turns: every room dark, the belts stopped (walk back along one).
  CAMs run on, on batteries, but in the dark they see only close up.
- **Real doors:** closed till opened; a closed door blocks sight, so a room's unknown till you open it. Step into one to
  open it (that's your turn); USE beside an open one shuts it (a chasing patrol loses sight of you). Patrols open doors
  on their rounds and leave them open (`/`): a door you didn't open, someone's been through.

### Special floors and set pieces (for when we get to the custom ones)
- **THE ROOF** (Greg, 2026-11-24): a special exit **floor**, not a room. Stairs up from the top floor come out on the
  roof, and somewhere on it is a **hoverpad** (`H`): call the hover and hold out the few turns till it lands. Being
  outside: no rooms, no walls, just a low edge round it and rooftop things to hide behind (AC units, a water tank, the
  stairwell hut, antennas); long sight lines, so cover counts most here. Its watchers: a drone or a searchlight
  sweeping (as the SCANNER does), not CAMs. Its look: a different edge mark (a parapet), gravel for the floor, the sky
  past the edge. The run's shape: down to the vault, then up and out by your door, or all the way up to the roof:
  farther, but the cleaner way out. Its own generator: open space, an edge, scattered blocks, a stairwell, a pad.
- **Dropped: windows** (Greg, 2026-11-24). Ideas were: outside windows that light a room, a window exit needing a
  ROPE, a drone looking in from outside; inside glass walls you see through but can't walk through. Dropped because
  they add fiddly rules for little play. (The roof took the "outside" part of the idea.)

### Playtest notes, round 2 (Greg, 2026-11-24; not built yet)
- **The way-in clock is far too short.** 150 turns barely gets you to the payload if you rush straight there, with no
  waiting. Being urged on is good, but not being seen needs time to plan. Ideas: more turns; a clock per floor, set
  from how long the quickest route takes; no clock on the way in at all; or the clock as a mode for the map.
- **The way-out alarm stays** (it makes sense), but 45 turns is too short to get back out. It should always give you
  enough to reach at least the nearest way out (the fire exit), so work it out from the route. A **decoy loot item**
  could delay it.
- **Being spotted:** could bring a new patrol in from a door, or at least send the guards to where you were seen. A
  terminal command could shut the alarm off.
- **Crates:** parts you can steal; or the letters of the corp you're in; or a **box you hide in and walk about in**
  (Metal Gear style), which gets into moving crates around.
- **Cones:** they feel odd and very hard to sneak past. Try them narrower; maybe a patrol sees in a straight line,
  not a cone. Fix the cell-shape skew too.
- **Effects:** later.
- **Special floors:** soon.
- **Difficulty:** patrols are about right now (with every-other-turn pace). The 8-turn chase is fine. Starting INT is
  fine. **CAMs are the hard part.** Ways round them: a loadout that keeps CAMs from seeing you for your first 2
  rounds, or ways to disable them. Leaning towards terminal commands knocking things out **for good**.
- **Built from this (2026-11-24):**
  - **No clock on the way in.** **TIMED** is a mode (dev panel, or T; remembered): each floor gets its own clock,
    3x its quickest route (about 150-170 turns a floor). Out: -1 INT every 3 turns.
  - **The way-out ALARM** is 1.5x the quickest way out from the payload (the nearest exit, up the stairs if need be)
    plus 10. Over 200 seeds: 18 to 154 turns, median 79 (was 45 flat).
  - **Tripping an alarm** (a CAM's good look, the SCANNER) on the way in: the patrols head for where you were, and an
    **ALERT** clock starts (20 turns). Run out, and a **backup patrol** comes in by the stairs and walks out to that
    spot and back (2 a floor at most).
  - **TERMINAL:** CAMS OFF is now **for good** (that floor). New: **ALARM OFF** (stops an ALERT, patrols stand
    down); on the way out it's **ALARM DELAY** (+20 turns). LIGHTS OUT stays 25 turns.
  - **Cones:** a patrol's is 50 degrees (was 90). Angles are measured on screen now (cells are tall), so cones look
    right up and down; CAMs too.
- **PEEK** (Greg, 2026-11-24; built the same day): lean round a corner or into a doorway without stepping out.
  PEEK (a button, or Q), then a way: you see from that cell as well as yours, till you step. A closed door: you crack
  it and look through; it stays shut. It's a turn; WAIT keeps looking. Watchers still see you only where you stand
  (later, maybe: one right by the peek cell spots you). A dashed box marks the cell.
- **Loadouts, first four** (Greg, 2026-11-24; built the same day). A passive plus two kinds of gear, picked in a popup
  at the start of a run (the last pick comes first; CLOSE keeps it). The BAG SWAP station changes your whole loadout.
  - **GHOST:** LOOP (a CAM needs 3 turns on you, not 2). UNIFORM x2, SMOKE x2 (a 3x3 cloud for 6 turns that nothing
    sees through).
  - **HACKER:** ROOT (2 picks per terminal). JAMMER x3 (the nearest CAM you can see is dead for 10 turns), FLARE x2.
  - **BRUTE:** HEAVY HANDS (takedowns last 60 turns, and work from the front if the patrol hasn't seen you).
    DARTS x3 (the nearest patrol you can see, within 10, is out for 15 turns), MED KIT x1.
  - **RUNNER:** SPRINTER (the way-out ALARM is 50% longer). NOISE x3 (throw it up to 6 cells, then the patrols near
    where it lands go to look), FLARE x2.
  - **Dropped for now: CHARGE / FRAG** (Greg): explosions don't break objects yet, so DARTS took its place. The FRAG
    code is still there; no loadout carries it.
- **The ALERT meter** (Greg, 2026-11-24; built the same day). Being seen doesn't hurt. It fills a meter in the header
  (`ALERT ■■□`), one meter for the whole run.
  - +1 when a CAM gets a good look, or when a patrol first spots you (it still chases).
  - **Full (3): the alarm trips.** The patrols head for you, the backup timer starts (20 turns, then a patrol comes
    in by the stairs), and the meter empties.
  - **It fades:** -1 after 30 turns of nobody seeing you.
  - **A takedown by hand clears it.** So does the terminal's ALARM OFF. (DARTS don't clear it.)
  - **INT goes only to contact:** a patrol catching you, the SCANNER's beam, a clock running out.
  - **The SCANNER is a hazard now:** its beam burns you (-1 INT) and doesn't raise the meter.
  - Ideas: passives that make the meter longer (`S.heatMax`).
- **Built in the game's shapes, to port over** (Greg, 2026-11-24: "not reinventing the wheel"). Still one file, but:
  - **Gear:** `INF_ITEMS`, the shape of `data/mods.js` `ITEMS` (`key`, `name`, `rarity`, `desc`, `tip`), with its
    numbers on the entry. What each does: `GEAR_USE[key]` (as the game's effects live in engine/, by key).
  - **Passives and loadouts:** `INF_CHIPS`, chip lines in `data/chips.js`'s shape (`[name, group, rarity, power,
    desc, face, tip, numbers]`). Passives are group `infp` (IP1-IP4); loadouts are KITs, group `infk` (IK1-IK4),
    like the game's KNIGHT and CARE PACKAGE (`kit: 1`), with their passive and gear on the line. Code checks a passive
    with `pass('IP3')` and reads its numbers from there. Power, faces and rarities are first guesses.
  - Porting: the items go to `mods.js` (names can grow to 15 characters there), the chips to `chips.js` (a group or
    two for INFILTR8), and `GEAR_USE` / the `pass()` spots become engine hooks.
- **Dev-styled UI for what will change** (Greg, 2026-11-24): screens the game will redo get plain HTML dev forms, not
  the grid. First one: the LOADOUT pick at the start of a run (scrolls, full text for each passive and item).
- **CUSTOM loadout** (Greg, 2026-11-24; built the same day): the form has two tabs, PREDEFINED and CUSTOM. CUSTOM is
  2 passive dropdowns (not the same one twice) and 2 gear dropdowns, each showing its text once picked. A gear slot
  gives the item's `stack` (what a preset gives: DARTS 3, FLARE 2, MED KIT 1...); the same item in both slots, twice as
  many. No FRAG. Custom gets 2 passives to the presets' 1, so it's the stronger pick for now. Your picks and the tab
  are remembered.
- **ACTIONS: the tray's one contextual button** (Greg, 2026-11-24; built the same day). It replaced USE and PEEK.
  It lists everything you can do right there: what you stand on (stairs, a way out, a vent), a station or an open
  door beside you, a PEEK each way there's an edge to lean round, a CAM or SCANNER to wreck (SABOTEUR). With one, the
  button is that thing (`[ PEEK ► ]`, `[ DOWN ]`); with more, `[ ACTIONS 3 ]` opens a menu. Enter does the same.
  **PEEK is contextual now:** only by a door, or where a wall beside you ends, and only if leaning shows 3+ new cells.
- **The STICK is the default control** (Greg, 2026-11-24): the neatest, but the most hidden. To do: make sure people
  know about it (not now).
  **Decided (Greg, 2026-11-24):** the default stick is drawn as STICK 12 (kites + arrows, `dist/lab/stick_mockups.html`).
  On a touch screen, STICK 3-13 are drawn half again as big (they were small on a phone); the walk distance is the same.
- **Phone pass, built 2026-11-24** (Greg's playtest on a phone):
  - **Tap snap:** one cell is hard to hit with a finger. On a touch screen, a tap that isn't right on something takes
    the nearest thing worth tapping (anything but floor and walls) within `TAP_SNAP` (1.5 rows: about 3 cells across).
    A step drops what you'd tapped.
  - **Lockdown, a light pass:** no text selection, no long-press callout, no tap flash, no pinch zoom on the board.
    The game will need its own; redo it there.
  - **The tray is four across** (SWIPE and the sticks): `[WAIT] [ACTIONS] [GEAR 1] [GEAR 2]`, boxes 9 wide. On a touch
    screen, ACTIONS (when it would do its one thing) and the gear take two taps, as the game's buttons: the first
    picks it (lit, AGAIN, and the message says what it does), the second does it. WAIT is one tap. A mouse or a key:
    at once. CLASSIC, TRACKPAD and ZONE PAD keep the old tray.
  - Not done, left as is for now: the terminal's popup nearer the buttons; the [?] legend down in the tray; the
    actions that show on the info card (LONG ARM's GRAB).
  - **The backup clock** (a tripped ALERT) is now enough to get out from where you are, and half again (`tripTurns`:
    `OUT_PACE`), never under 20. The way-out ALARM already was (1.5 times the way out, plus 10).
  - **2 kinds of gear, at most** (`GEAR_SLOTS`). RE-UP and VENDING only ever topped up what you carry; TURNCOAT's
    UNIFORM now only comes if you have room.
  - **CHIP RACKS** (◊, a station): you find more passives on the floors. About 1 floor in 2 (`CHIP_CHANCE`). It offers
    2 you don't have; take one and it's yours for the run. No cap on how many you hold.
  - **YOUR KIT:** tap your kit's name in the HUD: your passives and gear, to read.
- **Decided (Greg, 2026-11-24):** you walk over a LOOT CACHE, a RE-UP, a BAG SWAP and a CHIP RACK, and USE them on
  them or beside them. The machines (VENDING, COFFEE) and the TERMINAL in its wall still stop you.
- **Ten more passives, built 2026-11-24** (IP5-IPE; see `INF_CHIPS`): LOW PROFILE (seen at 60% range), NIGHT EYES
  (dark sight 7 → 9 → 11 the longer you're in the dark), TURNCOAT (a takedown gives +1 UNIFORM), KNEE PADS (duct steps
  1 turn), EARS (patrols within 6 show through walls), DODGE (50%: a grab or the SCANNER misses), COOL HEAD (ALERT
  meter 5), TAGGED (watchers you've seen stay marked, dimmed, a patrol with the way it faced), BACKDOOR (tap any
  TERMINAL you've seen, anywhere on the floor: HACK), SABOTEUR (wreck a CAM or the SCANNER: step into it, or WRECK from
  beside it). And SPRINTER now also makes every second step in a row free (nothing else moves); anything else costs a
  full turn and starts the count again, so moving never locks you out of an action.
- **Every popup is a dev popup now** (Greg, 2026-11-24): the stations (TERMINAL, LOOT CACHE, RE-UP, BAG SWAP), the
  ACTIONS menu and the help are plain HTML over the game, like the LOADOUT form: any length of text, scrolling. Once the
  options and their limits settle, they come into the game in its own UI.
- **The terminal's pool** (Greg, 2026-11-24; built the same day). Each terminal offers 4 commands from a pool (its own
  draw from the seed: the same terminal, the same list): CAMS OFF, ALARM OFF / DELAY, MAP, LIGHTS OUT, LOCKDOWN (every
  patrol and guard frozen 15 turns), FIRE DRILL (patrols head for the nearest way out, 10 turns), RECALL (the patrol
  nearest you walks off the floor), REVERSE BELTS (warehouse floors), FRIENDLY CAMS. A command only shows where it means
  something. **ROOTKIT** (a passive): every terminal offers all of them. (ROOT is still the 2-picks one.)
  - **PHONE RING** (Greg, 2026-11-24; built the same day): pick it, and every room you've seen shows a phone (`#`).
    Tap one (anywhere in that room) and the nearest patrol or guard, by walking distance, goes to answer it, then back
    to its round. Esc: no call.
- **FRIENDLY CAMS** (Greg): the floor's CAMs don't raise the ALERT, and you see what they see, live (their view is
  green). What you see through them counts as seen: BLINDER, JAMMER and LONG ARM work through them. (DARTS don't: a
  dart needs a line from you.)
- **BLINDER** (gear, Greg): blind the nearest patrol or guard you can see, 10 turns. Blind, it sees nothing, stumbles
  a step now and then, and you can take it down from any side. Not CAMs or the SCANNER. (Shown in the rare color.)
- **GUARD** (`G`, a new unit, Greg): stands its post a few cells off the way through, looking at it, and looks about
  (ahead, left, ahead, right). Seeing you, it gives chase, then goes back to its post. One per generated floor.
- **LONG ARM** (a passive, Greg): take loot you can see from any distance (through a friendly CAM too): a LOOT CACHE,
  or the payload itself (the ALARM's length then counts from where you are). Tap it, then GRAB.
- **Fixed:** since SPRINTER went in, taking the payload left it on the map and didn't clear the backup timer (a
  comment had swallowed the line). Now one function, `takePayload`.
- **Notes, 2026-11-24 (Greg):**
  - **Decoy loot is a passive,** not gear: taking the payload, the ALARM waits a few turns before it starts (more
    time to get going). Not built.
  - **PEEK and plants:** plants don't block sight (yours or theirs: `see: 1`), so there's nothing to lean round; no
    peek from inside or beside one is needed.
  - **Noise:** your footsteps make no noise; no crouch or sneak mechanic, and it may not need one. Bombs and the like
    could make noise, later.
  - **Set pieces and room types come next** (Greg will have Claude work on them soon): THE ROOF and its hoverpad, the
    wall-mounted SCANNER room, and the set-piece ideas above (THE ORACLE, THE PUSH ROOM, THE BREAK ROOM, THE CEO'S
    OFFICE, THE TRASH, A DATA MINE, A STAIRCASE MADE OF CABLES; security pieces like the SWEEP, TRIPWIRE, PRESSURE
    TILE, CAPTCHA DOOR, HONEYPOT).
- **Set pieces and rooms: the batches** (Greg asked, 2026-11-24; Claude builds them in order, one commit each.
  "Claude's take" marks a call made without Greg, to check):
  1. **Rooms:** THE BREAK ROOM (a vending machine: trade loot CR for gear; a coffee machine: +1 INT, but loud, +1
     ALERT), THE CEO'S OFFICE (a big desk, the best loot cache, a CAM inside).
  2. **Floor security:** PRESSURE TILE (in halls, seen only close up; step on one: +1 ALERT and the nearest unit comes
     to it), CAPTCHA DOOR (a locked door; ACTIONS: pick its glyph out of 4; the right one is on a STICKY NOTE in another
     room; wrong: +1 ALERT and they shuffle).
  3. **Things that move:** HONEYPOT (now and then a loot cache is a mimic: it wakes into a slow `M` that chases you and
     hits for 2 INT), FLEA (gear: a scout bot; see the meat notes below).
  4. **The chutes:** not ways out any more. Every chute drops you into THE TRASH, a room on the floor below; you can't
     go back up it. Junk to hide behind, a cache of mostly junk.
  5. **Floors:** THE DATA MINE (a building: dark, lots of halls and ducts, lots of loot), THE LAYER (a vault floor like
     a game layer: one big room, little rooms inside it like nodes; one holds the payload).
  6. **THE ROOF** (above F1; see Special floors).
- **All 6 batches built 2026-11-24.** What came out, and Claude's takes to check:
  1. **THE BREAK ROOM** (about 1 floor in 6): a vending machine `V` (30 CR of loot a go, for +1 of a gear you carry;
     use it as often as you can pay; the end screen's loot is what's left) and a coffee machine `c` (+1 INT, +1 ALERT),
     a table. **THE CEO'S OFFICE** (about 1 in 9): a mid-size room, a desk, a plant, a cache of rich finds (95-160 CR),
     a CAM on the far wall. ACTIONS now lists every station beside you.
  2. **PRESSURE TILES** (`¤`, about 1.4 a floor): on the halls of the way through; you spot one within 3 cells (or by
     FLARE). **CAPTCHA DOORS** (`?`, about 1 floor in 5): a CEO's office if it has one door, else a side room; the
     sticky note `n` is in another room (tap it in sight to read it). Claude's take: a patrol passing through opens it,
     and an open door stays open, so you can slip in behind one.
  3. **HONEYPOT** (about 1 floor in 14): a loot cache that's an `M`; it comes for you anywhere on the floor, a step
     every other turn; takedowns, DARTS and BLINDER work on it. **FLEA**: in the custom loadout's gear list; drawn `f`.
  4. **THE TRASH**: on the vault floor (390 in 400); F2's chute lands you in it (no trash room: at the stairs). Claude's
     take: F1 has no chute; the chute is a shortcut down now, not a way out.
  5. **THE DATA MINE** (1 building in 10): about 66 hall cells a floor (an office: 46), 4 ducts, 3 or so caches, about
     1 room in 5 lit. **THE LAYER** (about 1 vault floor in 5; the dev panel's building list has it): **laid out as a
     game layer, to the cell** (Greg, 2026-11-24: match the layers; the first try's nodes were Claude's guess, a 4 x 3
     grid nudged off true). 4 x 4 nodes, each a 7 x 5 tile, gaps of 2 across and 1 down (TILE_W, TILE_H, GAP_X, GAP_Y;
     x 1 + col * 9, y row * 6): 34 x 23, the whole board, so no room is left over (the 2 spare columns are a hall down
     each side). A tile's border is the node's walls; its 5 x 3 inside, where a layer draws the glyph, is the floor.
     8 to 12 nodes on cells drawn at random, the rest empty open floor, as a layer (Greg: not every cell has one;
     the game: n at most 12, CONFIG.maxNodes). The payload's node is the farthest from the stairs. **The empty cells**
     (Greg, 2026-11-24) get set pieces: a layer floor is OFFICE (plants to hide in, a pair of cubicles, pillars,
     benches, or bare) or INDUSTRIAL (about 1 in 3: a whole cell a 7 x 5 block of machinery, about 2.5 a floor; else
     pillars or benches).
  6. **THE ROOF**: up the stairs `▲` in THE RING's bottom right. A parapet `▓`, AC units, roof vents (low cover), a
     water tank, antennas; the stairwell hut; the hoverpad `H`. CALL HOVER on the pad (+1 ALERT, and everything up
     there heads for the pad), 6 turns, then BOARD: out (a clean job if nobody saw you). Two searchlights (CAMs on the
     parapet) and a DRONE `D` looping the roof. Claude's take: it's lit (night, but open sky). In the dev panel's floor
     list and the floor viewer (THE ROOF) since 2026-11-24.
     **Round 2** (Greg, 2026-11-24: "is the roof randomized at all?" It was only its cover): now from the seed,
     - **its shape:** the board less 0 to 2 corner notches (an L, a step: 2 roofs in 3);
     - **its edge:** parapet with 2 to 4 gaps of **open edge** (`▁`, red). Step off one and you **fall**: the run's over
       (Greg's). Patrols and drones never go there;
     - **its kind:** PLANT (AC units, a cooling tower, the tank), GARDEN (planters to hide in, benches, statues), SOLAR
       (rows of panels `≡`: low cover, lanes between), MIXED;
     - **the hut** near any corner, **the pad** well away from it, **1 or 2 sheds** (little rooms with a door: a cache,
       a terminal or a re-up inside);
     - **watchers by size:** a full roof 2 drones (an outer and an inner loop) and 3 searchlights; a notched one 1 and 2.
- **From the meat notes** (Greg, filed 2026-11-24):
  - **Already built:** watchers you've seen stay marked, even from another room (the TAGGED passive; the note
    suggests it for everyone, so maybe it's not a passive); PEEK into a door you walk up to, as an action (ACTIONS).
  - **The way in as a map:** a map like a normal layer, with glyphs you walk round; the glyphs are rooms you go into.
    Maybe it even is a layer you were just in: ICE you broke isn't there, or you know which room is the "real" node,
    and that's where the loot is. Also: a map that looks like a deck, somehow.
  - **Pause a CAM's turning** (gear or a terminal command).
  - **Ducts toned down** when you're not in them (you see through them, over the rooms).
  - **Effects:** tech blobs, or wires.
  - **Wires you can cut:** a simpler way to kill the power than a terminal's LIGHTS OUT, maybe from range with a weapon.
  - **The STICK, more squared off.** Taps: tap yourself to USE (not wait); tap anything that's not something to wait.
  - **MIMICS,** more hacker themed: a loot node that turns into a slow enemy that chases you and hits hard. Rare.
  - **Training:** it's going to need one (with teaching the stick).
  - **FLEA** (gear): a tiny CAM bot you let go. It moves 3 cells a turn and scouts ahead for you; nothing sees it. It
    stops to watch a patrol or a CAM when it finds one. Let go, it heads the way you were going; it goes under doors,
    keeps out of ducts, and otherwise wanders a little at random.
- (The passive ideas from round 2 are all built: TAGGED, BACKDOOR, LOW PROFILE, NIGHT EYES, SPRINTER's free step,
  TURNCOAT, KNEE PADS, EARS, DODGE, SABOTEUR. So are both terminal ideas, REVERSE BELTS and FRIENDLY CAMS, and the
  contextual PEEK. Still open from them: PEEK from inside a plant.)
- **Loadouts (later, just ideas):** a mix of passives plus 1 or 2 gear items. Unlocked by playing INFILTR8, or in the
  main game. Could need its own deck-style screen, or sit at the bottom of the deck as chips.

## Rewards
- **The corp counts as beaten**, as if you'd breached it: the map, the codex and the sector all treat it the same.
- **No boss mod.** Instead, you get the payload, and the payload is the point:
  - **Chips for THE DECK** (docs/DECK.md). The subnet is a natural chip source: you're stealing hardware secrets.
  - **The corp's tell, written in the codex**, even if you've never breached it. Sneaking in teaches you how it
    thinks.
  - **CR**, more for a GHOST run.
  - **Files for quests:** a crew member's record, a piece of G0D's story, a password for something later.
  - **Blackmail:** a file that makes the next corp in that sector weaker (it fires its ICE).
- **The trade:** breaching gives a boss mod and the fight. Infiltrating gives a chip, the tell and info. Each run you
  choose what you need.

## The screen
- The subnet takes the board's rows. The header (INT, CR, the trace clock in place of LAYER) and the tray stay.
- The play area on a phone is about 14 rows by 36. A floor bigger than that scrolls with you.
- **Controls:** tap a cell next to you to step; tap farther and you walk there one turn per step (you stop if
  something new comes into view). Swipe for a step. Keyboard: arrows, or hjkl. Space waits a turn.
- **The d-pad** (Greg's idea): an option, since it takes 3 rows (mockup 4). Tap-to-step may be enough.
- **A message line:** one row for what just happened (`the WATCHDOG heard it.`), as a ticker when it's long.

## The 5 mockups (round 1)
1. **THE VAULT FLOOR:** rooms and halls, a CAM's cone, a patrol, the payload, the exit. The full roguelike version.
2. **NODE ROOMS:** the corp's tile grid, but each node is a room you walk into. Closed rooms are fogged. The tell
   hides the watched room. The cheapest to build: it reuses the tiles.
3. **PACKET PUSH:** Greg's Sokoban: packets onto ports, with a sweep crossing the room.
4. **DAEMONS:** a fight. Bump to hit, a FRAG blast, a 3-line log, and the d-pad.
5. **SOLE.NET (the weird one):** you threw the SHOE and it landed on a port. The level is the shoe: the laces are
   walls, the eyelet is the camera, LINT drifts at you, the SOCK is a mimic, THE TOE is the boss, and you leave by
   the tongue.

## How to build it small first
1. NODE ROOMS (mockup 2) as INFILTR8 on a corp node: the tile grid, turns, one CAM type, one patrol type, the payload,
   the exit. Gear that already works on nodes (PING, SPLIT, FRAG) mostly works here as is.
2. Then real rooms and halls (mockup 1) with a small generator, and fog.
3. Then puzzles (mockup 3) and the daemons list, corp by corp.
4. Then the secret ones (mockup 5).

## Questions for Greg
- Is INFILTR8 a choice on every corp, or only some corps (or only once you've unlocked it)?
- Does the boss layer count? Infiltrating could skip the boss, or end at the boss's door (a breach of one layer).
- Which mockup is closest to what you pictured?
- How long should one take? My guess is 2 to 4 minutes, about the same as a corp.
- Sneaking only, a little fighting, or real fighting?
- Multiplayer: skip it here, or everyone in the subnet at once, taking turns?
