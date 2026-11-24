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
- **Patrol line of sight.** Done in the demo: the cone shows, 90 degrees wide, the way the patrol last stepped. Still
  to do: a patrol turns around at the end of its round with no warning. A `?` over it the turn before would make
  trailing one a skill. (Also, the patrol's angle ignores the cells being twice as tall, though its range doesn't.
  The cone is a little off up and down.)
- **Takedown.** Sneaking up on a patrol gets you nothing yet, and you can even stand on its cell. The idea: step into
  a patrol from behind or the side and it's out, quietly (for good, or for 20 turns). From the front, it catches
  you, the same as now. The DART GUN and the TASER are then for patrols you can't get behind.
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
- The plan: the viewer; even room placement (BSP); things placed with purpose (CAMs on doors and the payload,
  patrols between the rooms that matter); then room types (terminals, THE CUBICLES, THE SERVER FARM, THE WAREHOUSE).

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
