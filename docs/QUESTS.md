# NeoN+1 quests

The quest design doc (started 2026-10-28). The open list is still `docs/BACKLOG.md` item 2; the details live here.
Where quests sit in the progression: `docs/PROGRESSION.md`.

## The main quest: WHAT IS ALL THIS FOR? (POPS's son, d0g, G0D)

**Its words (calls, scenes, step names) are in `dist/data/quests.js`:** read and edit them there. As a script to read: `docs/QUEST_DIALOG.md`
(generated: `node tools/quest_dialog.js` after editing).

**Step names** (the user named the quest 2026-10-28; the step names are Claude's, to change): 1 THE DISC, 2 SAFEHOUSE,
3 DOG DAYS, then (not built) TRACE ROUTE, PRODIGAL, NEW BLOOD, OMNI RAID, HEAVEN'S GATE, G0D MODE.

In short: a quest item -> POPS -> beat d0g 10 times -> d0g is POPS's son, joins you -> raid OMNI with d0g -> he finds
G0D in heaven -> the H3AV3N seed -> beat G0D.

The user's dump, 2026-10-28, put in order. More is coming.

### When it can start
- Only after you've gotten past the first sector (at least once, ever), and maybe only once POPS is on your crew.

### Step 1: the quest item drops (the DISC: see "The story") (steps 1-4 built v13.77: engine/quests.js)
- Once it's unlocked, the quest item can start dropping anywhere loot drops: markets, fishing, loot nodes.
- It has a special look: the REP color (the quest color), maybe tagged QUEST instead of gear, or maybe just legendary.
- It's gear: it goes in your gear slots.
- Only one at a time.

### Step 2: POPS calls
- When it's in your slots, POPS sends a message: take it through the next checkpoint and cash out with it. So you beat
  the sector boss, then cash out at the UPLINK with the item.
- The message is a **call** (calls don't exist yet): POPS's little face in the corner, something like the training's
  popups, in the quest color.

### Step 3: the UPLINK
- At the UPLINK with the item, POPS comes up again: cash out and bring it to him.
- When you cash out: another POPS dialog, with a button to take the item to him. Other actions need to be blocked here,
  or the quest needs a stored step you can come back into. (Not worried about which yet.)

### Step 4: the cutscene (the item)
- You give POPS the item. It's an old lost treasure of his son's; he thinks his son got lost somewhere in the net, or
  died. He thinks d0g did it. He tells you to get revenge on d0g: **defeat him 10 times.** (Already beaten him 10
  times? Then maybe one more time.)

### Step 5: the d0g seed
- Maybe POPS has to be LVL 2 before he gives you the seed.
- POPS gives you a seed. Entering it does not make the run practice; maybe it's a **quest mode** run.
- The seed is a special version of rivals where d0g is the only rival, and it can bring rivals into the first sector.
  You can play it over and over to get your d0g defeats.

### Step 6: the trace
- When you beat d0g the 10th time (it has to be during the quest seed), another POPS dialog: you run a trace on d0g to
  find his real location, and go there.

### Step 7: the cutscene (d0g)
- POPS confronts the real d0g and finds out d0g is his son, the one he thought was dead. d0g doesn't call him POPS: he
  calls him **doc**.
- After or during the scene, d0g decides to join your crew. He gives you his number.

### Step 8: d0g on the crew
- With his number you can buy d0g onto your crew with REP.
- You need to level him to LVL 2 before the next quest step.
- While you're on this step: a bonus to how often d0g's CALL shows up (markets and so on; maybe always at safehouses).

### Step 9: the OMNI raid
- With d0g on your crew he says: we need to raid OMNI (or maybe a corp), him with you.
- This opens on your next runs. d0g's CALL is still more common than normal: get through a sector up to OMNI, then
  call d0g in, maybe during the boss. d0g handles the boss.

### Step 10: the cutscene (G0D found)
- Right as that last layer completes: d0g hacks in and finds where G0D is: **heaven**.

### Step 11: heaven
- You get the H3AV3N quest seed and have to defeat G0D. That's the end of the main quest.
- From BACKLOG item 2 (earlier notes): G0D is a rogue AI, all the corps' AIs fused by accident; you need d0g on your crew
  to get past heaven's first sector; G0D is fought at the end of sector 1, then again as sector 2's final boss, then one
  more set of layers after the success screen; maybe no tells, maybe beaten only by learning the seed.

### Story still to fill in
- The user, 2026-10-28: "some story elements i left out or that could be added". Roughly, the main quest is the above.

## The story (the user, 2026-10-28)
- **The quest item: a DISC** (FLOPPY is too long for a gear slot; gear names fit 6 letters). It holds encrypted data on
  his son's whereabouts: POPS decrypts it and tracks it back to an old d0g terminal or hideout.
- **d0g wasn't bad, exactly.** He was in hiding, or just grabbing corp data before other hackers could: he needed it to
  try to stop G0D, or stay ahead of it. Being a rival was that, not evil.
- **G0D is the big bad.** Set it up over the game, but you don't go up against it directly until the end:
  - **It shows up on death screens** sometimes when you die.
  - **Its logo:** creepy, something that isn't really a logo any more: it used to be one, and it's spilling out, evil
    looking. **It has eyes.**
  - **POPS brings it up early:** something evil lurking in the sectors, worse than the corps. Something the corps tried
    to hide away, and it's been spreading like mold through the sectors. **In the training** (a line of POPS's there).
- **More, picked from Claude's ideas (the user, 2026-10-28):**
  - **G0D on the death screen** when you die with no active crew in the layer (a rival's logo shows today, or no one):
    rare-ish, more often the further into the quest you are. Its spilling logo, eyes, a short line.
  - **The mold:** in later sectors a glitch-out effect creeps over things now and then (map nodes, glyphs), a hint before
    anyone names it.
  - **Heaven's MOLD sector effect:** on the H3AV3N seed the mold covers the corps' nodes so they aren't readable. It's a
    seed, so you have to remember the steps (maybe not the whole thing, but something like that).
  - **d0g explains** what he was collecting: corp data to map where G0D lives. That's the reason for the OMNI raid, and
    why he can trace G0D to heaven.
- **The MOLD is the same on every run of the seed** to start (a memory test; with the same seed it always is, unless
  the mold changes the data). Try a more random mold later.
- **Getting POPS on your crew** (the quest's gate, with a sector cleared): it took ~45 CALLs. v13.78 weights the plain CALL toward POPS until he's crew (~18 CALLs) and toward crew you've called under 5 times, and markets carry CALL more (41% of markets).
- Not picked up (yet): G0D's eyes following your cursor; the boss mods as bits of corp AI (G0D is what they become).

## G0D's fights (the user's rough ideas, 2026-10-28)
Three fights, then the end. d0g on your crew should be very useful in them (in the maze above all).

### Fight 1: the maze (end of heaven's sector 1)
- No ICE. Every node takes you down a layer, but it's a maze: each node leads to a different set of layers. A memory
  game.
- On the wrong path you go deeper for a while, then take damage (maybe) and land back on the first layer.
- The layers are labeled as you go in: 2A, 2B, 2C, then 3A, 3B... A clue to the right pattern is needed: maybe the
  labels spell something, or you learn the pattern somewhere along the quest line.

### Fight 2: (end of heaven's sector 2)
- Different, maybe more straightforward: something like blowing up all the ICE. G0D might be on the layers moving
  around, the way rivals do.

- **Or: G0D's face IS the layer** (the user, 2026-10-28, still forming): the board is G0D's face, with weird nodes on it,
  and it moves the nodes around, so it's still a layer but it looks very different. The face moves and makes
  expressions while you try to hit the right nodes. G0D doesn't so much have a cursor as it *is* the board; maybe
  there's something like a cursor where it's patching itself while you take it apart.

  - Shaped with Claude (the user: "all those ideas caught the vibe"): the nodes sit on its features (eyes, mouth,
    cracks); its expressions are its moves and its tell (a blink shuffles, a grin turns nodes to ICE for a moment, a
    frown speeds up); real nodes you hit break that part of the face, so it falls apart as you win; the patch cursor
    repairs the damage if you're slow (d0g fights the patcher); broken enough, it stops patching and its weak points
    show, straight into the last stand. Needs big face art (near board size, with expressions; asXii).
  - **Open: where the challenge is.** Waiting for its moves and countering them; it can be made hard (see the levers
    under "Still to decide").

### The last stand
- After fight 2: quick-time events. Tap G0D's weak points (or something like that) and it falls apart.

### The mockups and where it's heading (the user, 2026-10-29)
Two pages of mockups (G0D MODE, G0D MODE II: 20 ideas), all of them viewable in the game: the neon editor's **g0d** tab
(engine/g0d.js, previews only). What the user took from them:
- **The mold is G0D's armor.** You break parts of it and see the structures underneath: sometimes nodes, sometimes the
  bigger, scarier parts (an eye, a mouth). THE HUSK (scrape the mold) is the base idea.
- **The mouth: less robot, more jack-o'-lantern, rakish, or Venom's mouth.** THE MAW (long thin teeth, strands, a
  tongue) looks right.
- **Motion like THE CORE's rings:** THE ONION (rings turning against each other: mold, circuits, the eye) is "super
  solid".
- **THE TENDRILS** as a stage of the fight when there's open space: tap the tentacle ends to stop them grabbing INT,
  or tap them while they carry it up.
- **THE HOST is the part 2** (the fight on the sector map), two ways it could go:
  - **The win screen:** it feels like you beat him, the stats come up, then the mold comes back in and his boss bar
    returns. (The g0d tab: NOT DEAD YET.)
  - **The sector map:** fight 1 (the maze) was in layers; you come out of the maze, click the next boss node, and when
    you breach, instead of the map changing, the whole network is eaten by mold and the boss bar comes up. (The g0d
    tab: THE NETWORK GOES.)
- **The giant boss bar:** keep it. Maybe it takes the header: G0D where LAYER nn is, the bar where the corp's name is (the g0d tab: THE HEALTH BAR, its own overlay with a few styles: HASHES and THIN sit better in the header than the blocks).
- **Music:** these fights need their own tracks, and they have to be great (BACKLOG, Music).

### The three stages, written out (the user, 2026-10-29; more coming)
Names: **G0D MAZE** (fight 1, the maze), **G0D FIGHT**, **G0D FINAL STAND**.

**G0D FIGHT: the wake-up (a scene on the sector map)**
- Out of the maze you're on the sector map. The G0D node sits in the sector boss's spot. You pick it, BREACH: the boss
  music starts, scary sounds.
- The G0D node turns into a `(@)` eye and blinks at you. Mold creeps in from the sector's edges. The corp nodes you just
  fought through shift and break free: **G0D is the sector.**
- Somewhere in here G0D's health bar comes up and fills in, and the screen shakes a little as G0D wakes.
- G0D talks: "you can't defeat me, you are just meat", and other dramatic threats.
- The nodes shift around at random (a bit like ONION's second ring). The links between them all turn into the rounded box
  characters ONION's circuit ring uses.
- The mold fills in over everything. The eye moves to the middle of the screen and closes (hides). The mold covers the
  screen and even spills out of the game area a bit.
- POPS or d0g chime in on the terminal: encouragement, "we gotta break through that mold".

**G0D FIGHT: the fight**
- The goal: damage G0D in its eye. First you have to open it.
- Tapping the mold breaks through to what's under it; the mold slowly fills back in.
- Dig down to the right corp node (it has a symbol on it, fairly obvious) and trigger it: tap it, or maybe drag it
  somewhere (into the gear trash?). The eye opens for 5 seconds; tapping the eye damages G0D. After 5s (or a damage
  threshold) it closes and hides, and you find the corp node again.
- Each stage: more corp nodes in the mold, or the mold grows faster. Hitting the wrong node damages you.
- G0D needs an attack you shield yourself from: maybe something meta, like it trying to grab your INT.
- A few threats worked in along the way.

**G0D FIGHT: it dies (and doesn't)**
- The last eye tap: the mold spills out and falls away, and you see the network layer under it clearly; then that
  crumbles. The eye looks around frantically as its sector falls apart. A last threat as the eye fizzles out.
- The layer area fades to dark, then the header and footer: the screen goes black.
- **G0D BREACHED** comes up like the regular success screen and starts to animate in, but about 20% of the way the
  animation glitches and freezes. In the middle a little mold appears and spreads fast over the whole screen; G0D's
  health bar comes back and fills up. The terminal: a new threat ("you are just meat").

**G0D FINAL STAND**
- Pretty easy: a quick-time event. The mold fills and spreads out, and under it is the network again.
- The mold is just a transition here: sparse bits, nicely animated (z-translated noise, maybe).
- Instead of corp nodes, the nodes are all eyes `(@)`. Hitting the right eye destroys it and damages G0D.
- A timer: POPS or d0g, "he's trying to escape to another sector, we must stop him". Not all his eyes in time = fail;
  a fail replays the final stand.
- Take out all his eyes: a last threat ("there will be others"), more death animations. The screen doesn't go to black:
  it's all messed up from the fight. (More to come.)

### Still to decide
- The end reward.
- G0D's tell (the face's expressions, if fight 2 is the face).
- Making the face fight hard (Claude's levers, 2026-10-28): the expressions come faster as it breaks; a tell window
  (a real node is only safe to hit during one expression, ICE the rest of the time); the patch cursor races you, so
  every miss costs ground; it repeats itself (learnable, like the seed) but mixes in a fake tell; your INT carries over
  from the maze.

## Knowing you're on a quest, and getting back on it (Claude's ideas, 2026-10-28, for the user to pick from)
**Knowing:**
- The DISC's drop is its own moment: a quest-color pop (not the usual loot pop), then POPS calls right away. The call
  is the "quest started" beat. Terminal: `QUEST: <name>` in the quest color (like the FEAT line).
- A **QUESTS** tab on THE BOARD: each quest's current step as a plain objective ("beat the sector boss, then cash out
  with the DISC"), and the steps done. A `*` when a step is new.
- In a run: what the step needs is marked: the DISC glows in its slot; the sector boss on the map gets a quest mark
  while you carry it; the UPLINK's CASH OUT button says "+ bring POPS the DISC".

**Getting back on:**
- Steps are saved for good: dying never undoes a step, only the run's part of it (the DISC you were carrying).
- Lose the DISC (died with it, sold it, trashed it): it can drop again, more likely for a while. POPS: "you lost it?
  there's another copy out there." Trashing it could ask first, or it can't be trashed.
- POPS checks in now and then: at the start of a run with a step pending (not every run), or when you're somewhere
  that matters (the UPLINK). The hints get plainer the longer a step sits.
- Quest seeds live on THE BOARD (a "play the d0g seed" button), so nobody has to remember them.

## What it needs that doesn't exist yet
- **Quest items:** a gear kind (quest color, QUEST tag, one at a time), the unlock gate, drop odds everywhere loot drops.
- **Calls:** a hacker's face in the corner with their line (like the training's popups, in the quest color).
- **Quest state:** saved across runs (the step, the d0g count), a way back into a step (the UPLINK hand-in).
- **Cutscenes:** none in the game yet (BACKLOG has a "cut scenes" heading in meat notes, empty).
- **Quest mode runs:** a seed that isn't practice, with its own rules (only d0g as the rival, rivals in sector 1).
- **d0g as crew:** today he's a bad hacker only; he needs a good side (a CALL, an AI, a LVL 2), and a crew move that
  takes a boss for you (the OMNI raid).
- **Heaven and G0D:** the H3AV3N network, G0D's fights (BACKLOG item 2).

## Where quests live
- **A QUESTS tab on THE BOARD** (the user, 2026-10-28): STATS moved under FEATS (v13.76) to make room. Each quest's
  current step as a plain objective, the steps done, the quest seeds as buttons. (POPS's messages as a thread is Claude's
  idea for how a quest reads in it.)

## Questions for later
- Does the quest show up as a post on THE BOARD (PROGRESSION.md's ELITE level) as well, or only through the item?
- Where you see your quest progress (a QUESTS tab on THE BOARD?).
- "Safehouses": the [+] repair stops?
