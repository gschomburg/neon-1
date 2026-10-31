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
- **Building the d0g seed** (the user, 2026-10-30): a custom seed, built how we like: **d0g more common, and every
  sector has RIVAL** (sector 1 too). Some **extra gear that slows d0g down**, which maybe unlocks for the regular game
  once you beat the quest. **The seed's name: H3LL**, or something longer that still says hell (UNDERW0RLD?).
  **Name, 2026-10-30: HADES** (what the user was reaching for), or maybe LIMBO. **d0g the only rival** (the custom
  rivals version above) is fine.
  (Claude: seeds can be up to 16 letters and digits; random ones are always 6 long and never use I, L, O, 0 or 1, so
  HADES, LIMBO, H3LL can never come up by chance. H3AV3N (6 long, all allowed letters) could, about 1 in 900 million.
  Gear names: LEASH (slows him), BONE (a decoy he chases instead of the real node), MUZZLE (he can't read the tell for
  a while).)
- **CERBERUS** (the user, 2026-10-30, asked: Hades' three-headed dog, guards the underworld's gate, keeps the dead in).
  (Claude's ideas: on HADES d0g comes as Cerberus, three heads = three d0g cursors, all reading the tell; or CERBERUS the
  corp, HADES's boss, a security firm, "nothing gets out"; POPS: "he's guarding something down there". Honey cakes put
  Cerberus to sleep in the myths: a sleep gear, H0NEY, next to LEASH / BONE / MUZZLE.)
  **Decided: both** (the user, 2026-10-30):
  - **CERBERUS is a corp d0g built**, custom, HADES's **final sector boss**. Once you've beaten HADES it also shows up
    in the regular world as a boss.
  - **d0g's cursor splits into 3, now and then** (the user, 2026-10-30): everywhere he shows up (RIVAL corps too), not
    always 3, and it doesn't change his abilities. Just a subtle thing when you fight him; maybe the player puts it
    together (d0g = Cerberus).
- **Not clearing the sector: an item** (the user, 2026-10-30). The seed is only there to make 10 d0g wins easier. After
  the 10th win **a quest item drops**; like the DISC, you **cash out with it**. That moves the quest on: the cutscene,
  and d0g turns into b0y. (Claude: name, 6 letters max: DOGTAG, his old tag with his real name on it, b0y, which is what
  POPS traces.)
- (Earlier the same day, now optional: HADES's sector boss as CIPHER, the crypto corp, or **a new corp with mold
  powers**.) (Claude: a new
  one, the first place you ever see the mold, close up: d0g was down here collecting data on it. Names: MYCONET
  (mycelium is nature's network), SPORE, MILDEW, BLIGHT. BITROT, decay, is the nearest corp today.)

### Step 6: the trace
- When you beat d0g the 10th time (it has to be during the quest seed), another POPS dialog: you run a trace on d0g to
  find his real location, and go there.

### Step 7: the cutscene (d0g)
- POPS confronts the real d0g and finds out d0g is his son, the one he thought was dead. d0g doesn't call him POPS: he
  calls him **doc**.
- After or during the scene, d0g decides to join your crew. He gives you his number.

### Step 8: d0g on the crew
- **On your crew he's b0y** (the user, 2026-10-30): he changes his name back to b0y, to make it clear he's not a rival
  any more. The d0g codex entry stays as it is (no updating it), and b0y mentions he used to be d0g.
- **b0y is a guide** (the user, 2026-10-30): called in, his ability is different from d0g's. He knows the right nodes
  but doesn't hit them for you (it fits the G0D fight). When he points at something it has to be clear what: his 3
  cursors come together on it (they converge).
  **How the cursors move** (the user, 2026-10-30): each at its own pace, doing different things. Each hovers around a
  different node, so you can tell it's probably one of those 3; when they're ready they all go to the same one (maybe one
  at a time). (Claude: so the hint sharpens over time, 3 maybes, then 2, then 1, and the clock or the maze drain is what
  waiting costs.)
- **Out of the rivals pool** (the user, 2026-10-30): once he's on your crew, d0g no longer shows up as a rival.
  (Claude: hkRivalFor in engine/hackers.js picks from HK_RIVALS, d0g from sector 3 on; drop him there once b0y is crew.
  A RIVAL corp that would have rolled d0g then rolls someone else: still fixed by the seed.)
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

**The H3AV3N run, settled** (the user, 2026-10-30):
- **2 sectors** (the user, 2026-10-30, revised the same day: the maze is NOT sector 1's boss):
  - **Sector 1 plays like a normal sector**, with a special boss: **CERBERUS** again. The mold gets worse as you go,
    so by the boss you're basically tapping in the dark, with b0y's help.
  - **After its boss: a different UPLINK.** It's broken: you can't cash out, but you don't have to pay either.
  - **Sector 2:** G0D is the sector boss node at the top; right under it is **the maze**; a **store** off to the left or
    right that you can go to after the maze (patch up, maybe buy something); below the maze, **3 rows of a "regular"
    looking network**, moldy too, before you reach the maze.
    ```
           (G0D)
             |
          [MAZE] --- [$ store]   (after the maze)
           / |           o  o  o      moldy corps / nodes, 3 rows
          o  o  o
          o  o  o
             |
          (start)
    ```
  - **G0D in sector 1: just glimpses** (the user, 2026-10-30), no fight. Maybe CERBERUS gets eyes like G0D's, or the
    red / blue color code shows up there first.
  - **Colors** (the user, 2026-10-30): probably a new palette for the heaven sectors, the map screen too, so the mold
    effects behave the way we want and don't clash with the fights; the palette can swap to G0D's when the fight starts.
    Corps in heaven can keep their own palettes, then: just **add a mold color to every palette**. (Claude: the g0d tab
    already has G0D's own fixed colors, the same in every palette, like the rarity chips: G0D_COLS in engine/g0d.js,
    mold #9fc13a / moldDim #4f6120. Either way works: a fixed mold color reads as something foreign in every palette; a
    per-palette slot can be tuned where it clashes, e.g. a green corp palette. Could be fixed with optional overrides.
   )
    **Red / blue needs no fixed colors** (the user, 2026-10-30): CERBERUS and G0D have palettes we control, and the other
    corps don't use the convention.
  - **CERBERUS's tell** (the user, 2026-10-30): it has eyes, or red things, that sometimes turn blue; tapping a blue one
    shows the real node for a second.
    **Settled** (the user, 2026-10-30): **the eyes are on the nodes.** b0y doesn't help much in the CERBERUS fight: he
    just tells you what to do. The eyes watch his cursors (they follow them around). Tap a blue eye and it **looks at
    the real node**, and that node blinks for a second.
    **The eyes aren't nodes** (the user, 2026-10-30): they sit on the nodes but don't break. **The eyes always show
    through the mold**, and the mold is why b0y can't help as much here: you need CERBERUS's tells.
    **Open: how mods and gear work with all this** (the eyes, the mold). (Claude: a simple rule: the mold only hides
    what you see, it doesn't change what anything does. Mods and gear work as usual underneath; a mod that marks a node
    (ROOT-style) marks it under the mold, and you see the mark only once the mold's off, or the mark shows through like
    the eyes. BLEACH is the one thing made for the mold.)
    **For now** (the user, 2026-10-30): a mod and gear pass, one by one, when we build heaven. First instinct: mods
    behave as they do; the mold just obscures things, so it may cover some, may not. If the mold gets up into the
    terminal, the hints are harder to see.
  - (Claude: the mold climbing through sector 1 is the g0d tab's mold slider, 0 to 1, turned up by the game. b0y vs
    CERBERUS, the corp he built: he knows its tricks, a good place for his lines.)
- **Its corps: roll the dice** (it's a seed) and see what heaven comes up with, then tweak. Maybe one of every corp.
- **Dying before the maze = a restart** of the run. You always start with b0y on your side; he's there every time.
- **A MOLD sector event** explains the mold in heaven; once you've unlocked it, it can also come up as a random event in
  regular runs.
- **The name stays H3AV3N:** if it comes up at random or someone types it in, without b0y they probably won't get through.
- **Replayable** after you win.

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

### Fight 1: the maze (sector 2, right under G0D: revised 2026-10-30, was the end of sector 1)
- No ICE. Every node takes you down a layer, but it's a maze: each node leads to a different set of layers. A memory
  game.
- On the wrong path you go deeper for a while, then take damage (maybe) and land back on the first layer.
- The layers are labeled as you go in: 2A, 2B, 2C, then 3A, 3B... A clue to the right pattern is needed: maybe the
  labels spell something, or you learn the pattern somewhere along the quest line.

- **The answer: the codex order** (the user, 2026-10-30, leaning this way). The right path follows the glyphs in the
  order the codex lists them: DIAMOND, then THE CROSS, then STORAGE UNIT... Each maze layer has exactly one node with the
  next glyph on the right path. No map: **d0g explains it**, maybe just by giving the names, so it makes most sense to
  someone who has looked at the codex.
- **5 right answers** (the user, 2026-10-30). Reorder the glyphs so the 5th is something good, like a key (there's no
  key glyph). **Decided:** the 5th is THE WATCHER (the eye: the last thing you tap
  before G0D is its symbol), with **PROMPT (`>_`, the public node's glyph) as glyph 0**: the maze starts on it, like a
  regular run. So: PROMPT, then DIAMOND, THE CROSS, STORAGE UNIT, UPLINK (Claude: moved up to 4th, up to heaven), THE
  WATCHER. (Claude: Codex order = the list in data/art/glyphs.js; reordering it
  changes which glyph lands on which node for every seed (not where the real node is): do it before seeds matter.)
- **Or a gear key** (the user, same day, not sure it's right): heaven's first corp is the cipher corp, and beating it
  gives a gear item with infinite uses that shows the real node (only useful in the maze). The maze nodes are all moldy;
  using it clears the mold so you can see what's on them.
- (Claude) The two fit: the mold covers the maze's glyphs, so you need to **see** them (clear the mold: the gear, or d0g
  doing it, which would also be his job in heaven) and **know** the order (the codex). And d0g's message could get eaten
  by the mold partway ("diamond. cross. st#%@ge. wa%#..."): the codex fills in the rest.

- **How the maze plays** (the user, 2026-10-30):
  - **Lots of nodes** in every maze layer, even the first, maybe more the deeper you go: it has to be a challenge.
  - **Any node you tap counts as a perfect:** it gives health (INT), maybe some cash. So you can just go and go.
  - **Wrong paths go 6 layers deep.** On the 6th, lost, the node you tap does 1 damage and sends you back to the maze's start.
  - **A timer on every maze layer, about 5 seconds:** when it runs out you lose 1 INT and it starts again. Going through
    any node gets the health back, so it's easy to keep up.
  - **d0g's lines** while you're lost: "i'm not sure this is the right way."...
  - **Mods pay off here:** a timing mod buys you time.
  - (Claude) Once you take a wrong node, everything below is wrong until you're sent back, so d0g's doubt can grow
    with each lost layer ("this doesn't look right" ... "we're lost, man"). Mods that pay per perfect (money, streaks)
    will spike here, since every node is one: fine as a treat, or capped. The right path: PROMPT + 5 layers, then out.

- **Mods in heaven** (the user, 2026-10-30): they probably won't change the G0D fights much, but some particular mods
  would be good there: sneak those into heaven's corps (rewards, markets) through the seed.
- **The mold-clearing gear** (the user, 2026-10-30, liked): not infinite, just clears the mold: you can find a stack of
  them somewhere in heaven. (Replaces "infinite uses, shows the real node".)
- **b0y in heaven** (the user, 2026-10-30): works like a mod, always on in heaven: he comes into every corp with you.
  His ability: helping you find the right node and giving clues. Every once in a while he hovers over the right node;
  maybe he clears some mold.

### Fight 2: (end of heaven's sector 2)
**Settled (the user, 2026-10-30): the face idea evolved into G0D FIGHT** as it stands (the eye in the mold). G0D is the
network more than the layer. The face notes below are history.

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
**Prototype built v13.87** (engine/g0dproto.js; the neon editor's g0d tab, PLAY THE PROTOTYPE): all three stages playable, rough, with b0y on / off. What it does and what to judge: docs/REVIEW.md.
**Prototype feedback, round 1** (the user, meat notes 2026-10-30; done in v13.88 unless marked):
- Maze: interesting. b0y's chat in the terminal got lost (now his own line on the board). The mold isn't a factor there:
  probably fine. Getting hurt and sent back should be clearer: the nodes come back in one at a time. The 5s timer is
  short, maybe fine (kept). b0y's cursors should sit on the nodes themselves, not above.
- Fight: digging, you often don't see a corp node until you tap it and get hurt (now: a node only counts once it's fully
  dug out and framed; a tap on a half-dug one scrapes). The eye nodes should be **blue**. b0y's cursors get in the way:
  one cursor on the board at a time, and he takes a while to find it. The scrape should be bigger. **The charge
  shouldn't lock the mold:** when you see it charging you can still tap the mold off your INT (only the burn hurts).
- Round 2 (the user, 2026-10-30): a node's letters didn't show until all three were dug out. Now thick mold hides them, but
  thin mold (a . or ,) lets them show through, dimmed, with the speck over them (G0DP_SEE). Taps still count only fully dug out.
- Round 3 (the user): the maze feels better. b0y's cursors covered the glyphs: now two bob on the nodes' top right corners, and
  the third traces the clue at the bottom: the word you're after is lit, his cursor right after it.
- Round 4 (the user): the final stand's eyes drift now (a bit faster as you win) and the mold streams off them. In the fight
  an eye had slid under a corp node and made it unclickable: nodes push each other apart, the open eye and the HANDS OFF eyes
  open clear of nodes and push them away. Scraping drops more: the mold you knock off falls as its own characters.
- Round 5 (the user: "these are feeling pretty nice"): tapping the eye node bursts it (its pieces fly, blue) and G0D's eye comes in a
  beat later, opening in steps ((o), the ring, all of it). A scrape ripples: a tight break where you tap, then a wider ring.
- Round 6 (the user): b0y in the final stand only if he does something: **he latches onto the eye to make it vulnerable.**
  With b0y: he chases the eye you're on, grabs it (blue: hit it now), it throws him off (red), he chases again. Without
  him: the eyes cycle on their own. And (the user: for later, with the animation pass) the network glows red as the clock
  runs out: a first go is in (under 10s the board pulses red, the mold trails turn red).
- Round 7 (the user): couldn't hit an eye node b0y was near. The cause: letters showed through thin mold (round 2) but a tap
  needed it fully dug out. Now a node counts (and gets its frame) once every letter shows; b0y's fight cursor sits off to
  the node's top right. The blue bar on the big eye's top row (a glow that only covered one row) is gone. The final stand's
  blue background is on purpose: the eye you can hit now.
- Round 8 (the user): no blue backgrounds for now (the hittable eye is just blue). Later, with more in, maybe a proper invert:
  a blue background with bg-colored letters.
- Round 9 (the user): once you've uncovered what b0y was showing you (the eye node), or the eye is open, he goes back to rest.
- Round 10 (the user: "just the right amount of hectic"; now graphics and animation): **the mold flows**: each thickness has
  its own ramp of 8 characters and a slow 3D noise (x, y, time) picks one per cell, so it warps like liquid without changing
  how thick it is (G0DP_RAMP, G0DP_FLOW). **The charge is red traces** (like the title's circuit lights): they grow out of
  the network nodes in lines with rounded turns, more and faster as it builds; the burn turns the mold red; after, no new
  ones and the rest eat themselves away from the tail (G0DP_TRACE). The final stand uses the traces too, off the eyes in
  the last 12s (in place of the red glow).
- Round 11 (the user: neat, not what they expected, keep some): in the fight half the traces stay red box lines, the other half
  only stain the mold red as they run through it (shades of red, head to tail); both keep the white dot heads. The final
  stand's traces stay as they are ("what's happening when it's in danger mode is pretty great"). **The network under the
  mold is ONION's circuit ring** now, all over the board, turning slowly: what you dig down to (tint traces color it too).
- Round 12 (the user): **the mold spills off the board for real** (its own field, f.sp): up through the terminal band and a
  little into the header (patchy, thinner the higher), down over the tray (it covers your gear and gets in the way of using
  it). Thick spill hides what's under it, thin is a speck over it. A tap on spill smashes it (before your gear gets the
  tap). **It steals when it has crawled onto INT / CR** (no more painted-on effect from a corner of the board). b0y's line
  at the bottom of the board (round 1) is gone: his lines hold the terminal ~2.5s and other lines wait their turn.
- Round 13 (the user: the header mold is super hard to remove): a bug, its growth ran every frame (~15x too fast); now a
  step every 100ms (left alone 20s: a third of the area over the board, INT not reached yet). A smash clears its middle outright
  and reaches further.
- Round 14 (the user): b0y's cursor stays on top of the mold. **G0D's bar is on the row over the terminal, BLOCKS, all the way
  across** (the header is the run's again). The mold never covers the bar or the terminal: the header's low row grows off the
  board's top edge, as if it seeps up behind them.
- Round 15 (the user): the bar is one row, G0D in the middle: health left a solid red block (the text inverted in the
  background color), health gone a dim line (the text red); a hit flashes the chunk it took (g0dpBar).
- Round 16 (the user): when the mold gets onto your INT / CR, b0y's cursor goes up there and points at it ("it's eating your
  INT! scrape it!"). **Warnings about dying:** the FLATLINED card says what got you and how not to (the mold ate your INT;
  you touched it in the burn; a corp node; the maze clock; too deep on a wrong path; he got away), and at 1 INT b0y warns you
  about whatever just hurt you (G0DP_CAUSE).
- Round 17 (the user): G0D's terminal lines are dark red with red text (apart from his bar). The line under the terminal
  gets mold too. The spill reddens with the charge (bit by bit) and goes all red in the burn, and its thin specks flow like
  the rest.
- Round 18 (the user: the regrow after hitting the eye barely shows): every hit sends the mold surging back in, a wave out from
  the eye in 3 quick rings; holes fill the most, thick mold barely, nothing past mid thick; the new growth shows bright. The
  eye shutting sends a bigger wave (g0dpRegrow).
- Round 19 (the user): the fight's status line (dig. find the eye / THE EYE IS OPEN / charging / HANDS OFF, creeping / IT
  STEALS) is gone: the board shows all of it. The maze (layer label, its clock) and the final stand (eyes left, the clock)
  keep theirs for now.
- Round 20 (the user): the final stand is **10 seconds**, and the traces build from the first second to full danger by ~5.5s
  (standBurn): you fight him while it all burns out. To fit: 6 eyes, red / blue 0.7s each, b0y chases faster.
- Round 21 (the user: the red ramp is great; 10s is a little short depending on b0y, keep it tight for now, maybe tune):
  the final stand has ONION's circuit under it all too, going dark red as the burn builds.
- Round 22 (the user): the final stand clock is 15s (the burn still peaks by ~5.5s).
- Round 23 (the user): the fight's corp nodes are shades of red with dark letters, glitching: the red flickers a cell at a
  time, letters swap out for noise now and then, and sometimes the whole label flips to G0D (on white) for a moment. (Also
  asked: the maze in the real game should be real layers, likely a special corp on the corp kit: wipes, node tiles, mods and
  b0y for free; the layer clock already holds through transitions and starts fresh each layer.)
- Round 24 (the user: stages; G0D a little tankier; the two-eyes idea): **G0D has 18 hits; the eye gives 2 hits, open 7s.**
  **Two eye nodes:** the first opens the eye; dig out the second while it's open: +4s and +3 hits (b0y hunts the one still
  buried). **A corp node tapped heals G0D 1** (and still costs you 1 INT). **Three stages** (his health in thirds): at a break the
  eye slams shut, the mold surges back, STAGE 2 / 3 flashes, 2 more corp nodes come up, mold spews faster, HANDS OFF comes
  sooner; G0D gets louder. (b0y still needs work: more helpful, a better resting spot: later.)
- Round 25 (the user: it sucks to lose a good combo to a stage break): with one eye the break slams it shut as before; with a
  combo (the second eye found) the hits go through the stage line and the break comes when the eye shuts (f.pendStage).
- Round 26 (G0D reacts): **the eye is bigger** (13 x 5), looks around (the pupil slides), blinks, flinches when hit (squeezes
  to >---<, jolts), and gets bloodshot (red in the white) as his health drops; a time bar and the hits left under it. **A hit**
  blows the mold right round the eye out (it crumbles), then the regrow rushes back in; **the bar's chunk breaks off and
  falls**. **The combo** (the second eye): a ring pulses round the eye. **A stage break**: the eye screams shut (red), red
  traces fire out of it across the board, the mold slams back in from the edges. (Next: the cinematics.)
- Round 27 (the user: no hit counter under the eye; let the eye's colors say it): **the eye is its own hit counter.** Blue =
  hits left, scattered over it (not like a bar): one eye node found, it opens about half blue; both, all blue. Every hit
  blasts some blue off (it flies) and that part turns red; all red, it shuts. No time / hits line under it: in its last 2s
  the eye flickers. (No bloodshot-by-health any more: the bar says that.) Sfx for all of this: later.
- Round 28 (the user: it still needs a timer): the seconds left sit in the eye's bottom edge ('--7s-'): they count down,
  jump and flash white when the second eye adds time, go red under 2s and flicker with the eye.
- **Into the real game** (the user, 2026-10-30: "would it make sense to work it more into the engine?"): 5 steps. (1) a heaven
  sector you can jump to, (2) the maze as real layers [both built v13.89: engine/heaven.js], (3) the fight as the boss, with
  the wake-up on the real map, (4) the fake win on the real G0D BREACHED screen, then the final stand, (5) the collapse and
  a placeholder ending. Cinematics: a tap skips (after a beat); the editor gets a jump per step and a skip-cinematics toggle.
  Step 3 built v13.90: the wake-up on the real map, then the fight as the boss (the run's INT, restarts with what you walked in with).
  Step 4 built v13.91: the fake win (G0D BREACHED types in, freezes ~20%, the mold takes it, his bar refills), then the final stand.
  Step 4 built v13.91: the fake win (G0D BREACHED types in, freezes ~20%, the mold takes it, his bar refills), then the final stand.
- **b0y, what's wrong (the user, 2026-10-30; not yet, later):** (1) his resting spot: he's still on screen, so it's confusing
  whether he's pointing at something: **he should hide when he isn't actively searching.** (2) it isn't clear when he's doing
  something: elsewhere (the hackers on the board) the cursor switches to a v to point; do the same here, **and put some of his
  dialog on his cursor**: short tags like "here", "watch out", "eye!", "tap" / "dig".

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

**G0D FIGHT: how the mold works** (the user, 2026-10-30): two layers that interact, the mold on top and the network
under it.
- **The network nodes make the mold.** The corp nodes floating around under it spew mold out above them, and it
  spreads as they move. The mold creeps a little on its own too, but the nodes are the main source.
- **You read the nodes through the mold:** not by seeing their [] icons, but because the mold above them changes:
  it gets tougher, or changes color.
- **Thick mold takes more taps:** where the spawners have passed over a spot several times, it takes a few taps to clear.
- **Breaking mold above a node slows it down** and stops it spewing for a second.
- **When G0D takes damage** (or reaches a damage threshold), all the mold grows back in fast: the board resets a little.
- (Claude) Thickness shown by character and color (`.` `%` `#`, dim to bright); a fresh, thick, moving patch = a node
  right under it. Tapping it pins the node for a second, so the chase is: spot the trail, tap to pin it, dig down before
  it moves on. 
- **The stolen `[#]` / `[$]` nodes sit still but still spew** (the user, 2026-10-30, not sure yet). (Claude: so they build
  the thickest mounds: a still, very thick spot = loot; a moving streak = a corp node.)
- **They spew in a radius:** a circle about 3 or 5 wide, not a single spot, and the overlay is feathered at the edges.
- **Its name: M0LD** (the user, 2026-10-30): digital mold, spelled with a zero in the game.

**G0D FIGHT: the mold steals, and HANDS OFF** (the user, 2026-10-30)
- **The mold reaches for your INT and credits:** it grows up toward their readouts. Tap it to make it dissipate. If it
  gets there it **steals** them.
- **What it steals is in the network:** burst the mold open and the nodes floating underneath hold it, `[#]` (INT) and
  `[$]` (credits). Tap them to get it back.
- **HANDS OFF, G0D's eye attack:** the build-up is more eyes: one appears, then another... As it opens, everything
  (the mold, the network nodes) turns shades of **red** for a few seconds: not a time to tap. It plays with the mold:
  while the eye attack is going you can't tap the mold away, so it creeps up on your INT and credits.
- **Colors say when:** the real eye, opened by breaking its network node, is **blue** (safe: hit it). Red = hands off.
- **The counter:** while it's charging, find the eye-reveal node and tap it: the attack is stopped, and one of the eyes
  turns into the right (blue) eye.
- **Two beats** (the user, 2026-10-30): **the charge** (the eyes appearing, the red fading up) does no damage. A warning
  shows in the terminal, if you can see it: if the mold isn't covering the terminal. **The burn** (all red): every tap
  costs INT.
- **Stolen INT / credits don't carry into the last stand:** it doesn't matter if you got them back; you shouldn't need
  them there. (Still open: whether the mold also reaches for your mods, THE GRAB.)

**G0D FIGHT: dying in it** (the user, 2026-10-30): **die and the fight restarts** (not the run). Going back through
heaven's network and the maze again isn't fun, and by then they've likely played it a few times already. (Claude: you
restart with the INT / credits / mods you had walking in; the wake-up scene gets shorter on a retry, tap to skip. So each
stage is its own checkpoint: a wrong maze path sends you back to the maze's first layer, a G0D FIGHT death to the fight's
start, a failed final stand replays the final stand.) No cashing out in the G0D fight (the user: no reason to bank;
they'll have plenty of REP by then). They can still quit from the menu.

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
- **No mixed messages** (the user, 2026-10-30, after HANDS OFF made red eyes the ones not to tap): the last stand is
  tapping his eyes to defeat him, and it has to be clear it's safe to tap them now: the eyes are the safe color (blue,
  like the real eye in G0D FIGHT), never red.
  Ways to do it (the user, 2026-10-30, the blue-is-hit rule carried through): (a) all the eyes blue; (b) red and blue
  eyes, and each blue one you destroy turns another red one blue, one at a time; (c) every eye cycles red to blue and
  you tap it while it's blue. (Claude: b and c mix well: eyes cycle, and destroying one makes the rest stay blue a
  little longer, so it speeds up as you win. Tapping a red eye costs time on the clock, not INT.)
- A timer: POPS or d0g, "he's trying to escape to another sector, we must stop him". Not all his eyes in time = fail;
  a fail replays the final stand.
- Take out all his eyes: a last threat ("there will be others"), more death animations. The screen doesn't go to black:
  it's all messed up from the fight. (More to come.)

### After the final stand
The ending, the rewards for beating the game and the rest of the end game: **docs/ENDGAME.md**.

### Settled 2026-10-30 (the user)
- **The final stand: the cycle.** Every eye cycles red to blue, tap it while it's blue; they go **in order**, so it's
  still one at a time. Not too hard, but stressful: whatever cranks the urgency and makes it feel dangerous.
- **The mold only goes after your health** (no mods: THE GRAB is out). That's the real danger. You see it take your
  money first, then maybe realize it's after your health too.
- **The eye-reveal node looks like THE WATCHER glyph** (Claude's pick, the maze's last answer). It animates and looks
  around; the o turns to @ when it's angry or charging; it can be smaller, just (o), as it animates up or takes damage.
- **G0D's lines:** Claude writes them when we flesh this out. As its health gets low, its data falls apart: random facts,
  and it starts sounding like corps you've fought (MEGAMART: "everyday low prices. everyday."; NIMBUS's forecasts:
  "70% chance of ICE.").
- (Old, from the face fight: G0D's tell, Claude's difficulty levers. Superseded by G0D FIGHT.)

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
