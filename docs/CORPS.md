# NeoN+1 (Beta Runner): corp ideas

Since v12, each built corp lives in its own file, `dist/corps/<key>.js`. How to add one, and what a corp file can use: the top of `dist/engine/corpkit.js`.

A brainstorm, kept out of SPEC.md. Two parts:
- **Part A:** the user's own corp ideas (first logged in SPEC §17), written up in the same format.
- **Part B:** Claude's 50, revised 2026-10-20 after the user's review.

Each corp has:
- **Special**: what makes it different to play.
- **Tell**: how you find the real node.
- **Mod**: a boss mod it could give, with its trigger stage (see SPEC §16l, trigger order).
- **Works with**: which mods we already have can reach into this corp. Rule: a mod built for one
  corp (SIGSCAN for Sigil, the clock mods for Chronos) should also matter in some other corps, so
  mods and corps cross over.

`*` after a name marks something the user changed or asked for in the review. Names are parodies or
made up, not real brands.

## Mods we have, and what they could reach

| Mod | Today | Could also matter in |
|---|---|---|
| CORNERS | locks a corner ICE | board-game corners (PAWN BROS), DROP-4's bottom row, any corp that likes corners |
| SIGSCAN | locks an ICE wearing the Sigil signature | anything with a mark: HAUTE//COUTURE labels, THE CHOIR's holy marks, VERDANT's leaves, SAFEHARBOR's fine print |
| FORGERY | $ nodes do no damage | counterfeits: HAUTE//COUTURE knockoffs, LEDGER TRUST's fake balances |
| OVERCLOCK, FASTPAY, COOLANT | clock mods | any corp with a clock: COLDBREW, RYDR, GLACIER (the frost is a clock), TEMPO, HALFLIFE |
| AFTERIMAGE | marks the last real spot | corps that use the last layer: GROUNDHOG, GENCORP, LEXICON |
| KEYLOGGER | ICE shows lines of the real glyph | glyph corps: SEEKR, CLONEWORKS, HAUTE//COUTURE, GENCORP |
| TRACER | arrows to the real node | goes stale in moving corps (PREDATOR, ENTROPY, MONTE); there it could point at where the node *was* |
| X-AXIS, Y-AXIS | row / column scans | DROP-4 (columns), NUMBERWONG (rows and columns), LIFTCO (rows) |
| VIRUS | locks a neighbor ICE | SQUALOR ("goes viral"), VERDANT, APIARY |
| SHATTER, BULWARK | blocks | CARAPACE: SHATTER cracks armor too |

---

# Part A: the user's corps

### A1. BASIC (working name; could stay BASIC, or ACME, GENERICORP)
- **Special:** nothing. 3-4 nodes, low pay, plain grey, a simple chiptune. A breather or filler slot
  anywhere.
- **Tell:** strong and simple: the real node is the only one with a plain frame.
- **Mod:** BASIC TRAINING (LAYER START): the first layer of every corp starts with 1 ICE locked.
- **Works with:** everything. Also a good test corp for new mods.

### A2. MEDIX (medical; or VITALIS, ST. CYBER)
- **Special:** hits bruise first. The first ICE hit in a layer does no damage but marks you; the next
  one hurts.
- **Tell:** the real node has a heartbeat: its glyph pulses on a steady rhythm, while the decoys
  flicker unevenly.
- **Mod:** TRIAGE (LAYER END, at the end of a corp), the user's idea: every corp you beat heals 1; if
  you're full, +1 max integrity.
- **Works with:** BUFFER, FAILSAFE, the perfect heal; TEMPO (the heartbeat is a beat).

### A3. SYNAPSE (AI; or NEURALINE)
- **Special:** it learns you. It tracks where you pick this run (corners, center, a favorite column)
  and puts the real node away from your habits. A "model confidence" meter in the HUD fills as it
  learns.
- **Tell:** read yourself: pick where you never would.
- **Mod:** TURING (ON HIT): after a miss, one node says `NOT ME`. It's true 75% of the time.
- **Works with:** NOIR (talking nodes), FOURTH WALL; X-AXIS / Y-AXIS (it learns your rows too).

### A4. GENCORP (genetics)
- **Special:** glyphs mutate between layers. The real node's glyph changes by one line each layer, so
  the real nodes form a family line.
- **Tell:** the real node is the next mutation of the last layer's real glyph (one line changed).
- **Mod:** MUTATE (ALWAYS ON), the user's idea: it counts as a random other mod and changes into a
  new one every corp (or on every ICE hit). The tray shows what it is right now.
- **Works with:** KEYLOGGER, AFTERIMAGE, CLONEWORKS.

### A5. AEGIS (military that hunts you; or IRONCLAD, BLACKWATCH)
- **Special:** the nodes advance toward the bottom edge one row every few seconds. One reaching the
  bottom is a hit. The boss adds a search beam.
- **Tell:** the real node holds back: it's last in the formation.
- **Mod:** AMBUSH (BLOCK): if you pick within 2 seconds of a layer opening and hit ICE, it's free.
- **Works with:** the clock mods (the advance is a clock); CORNERS, X-AXIS / Y-AXIS; PREDATOR (both
  hunters).

### A6. CARAPACE (armadillo armor; or SHELLCO, ARMATEK)
- **Special:** the nodes have armor (a thick `#=====#` frame) that you break first. Breaking it hurts
  like ICE, but every time you take damage you get a hint about the real node.
- **Tell:** the real node's armor is thinner: it cracks in 1 hit, not 2.
- **Mod:** ROLL UP (TAP TO USE): once per corp, curl up: the next hit is blocked, but that layer pays
  nothing.
- **Works with:** SHATTER (cracks armor in one hit), BULWARK, TRACER (as the hint).

### A7. MONTE (shell game; or THREE CARD)
- **Special:** the real node moves. The nodes shuffle like cups sliding, and you can follow it if
  you're sharp. The boss shuffles more and faster.
- **Tell:** follow it with your eyes.
- **Mod:** QUICK EYE (ALWAYS ON): every animation runs 30% slower: shuffles, moving corps, wipes. It
  helps in every moving corp.
- **Works with:** ENTROPY, PREDATOR, GRAVITAS, LAGRANGE; it breaks TRACER (the arrows go stale).

### A8. LUCKEEZ * (gambling; the user's name)
- **Special:** double down, the user's idea. Before you tap, you can bet: double pay if it's real,
  double damage if it's ICE.
- **Tell:** slot glyphs: the real node shows three matching symbols. Deeper, the decoys show two
  matching, so read carefully.
- **Mod:** LET IT RIDE (LAYER END): after a perfect, bet that layer's pay on the next one: x2 or
  nothing.
- **Works with:** SKIMMER, FASTPAY, SKIPJACK (luck stacks); a cousin of the roulette multiplayer mode.

### A9. THE CHOIR (church / cult; or ASCENSION, SAINT.EXE)
- **Special:** tithing. Pay credits before a layer for a revelation (a hint), or go on faith (no
  tell, x2 pay). The boss is the prophet.
- **Tell:** the followers: decoy glyphs face or lean toward the real node. They all wear a holy mark.
- **Mod:** SACRIFICE (TAP TO USE): once per corp, pay 1 integrity to lock half the ICE.
- **Works with:** **SIGSCAN** (the holy marks count as the signature, so it locks a follower);
  FAILSAFE (a miracle).

### A10. ENTROPY (chaos; or FLUX, SCRAMBLE.NET)
- **Special:** the nodes reshuffle, either on an ICE break or on a timer (still to decide; the boss
  does both).
- **Tell:** the real node keeps its tell through every shuffle, so you track it.
- **Mod:** ANCHOR (TAP TO USE): once per corp, nothing moves for one layer (no shuffles, no frost, no
  advance). In a still corp, it pauses the clock for 3s instead.
- **Works with:** QUICK EYE, AFTERIMAGE (marks the spot before the shuffle); close to MONTE (which only
  moves the real node).

### A11. NUMBERWONG * (numbers only; the user's name)
- **Special:** every node is a number. The intel line plays along: `> that's numberwong!` when you
  hit ICE.
- **Tell:** a number rule that changes as you go deeper:
  - sudoku: the real node is the digit that completes its row or column with no repeats;
  - then a sequence: the next number in a row (`2 4 6 _`);
  - then the odd one out (the only prime, or the only one that isn't a multiple of 3).
  - The boss mixes two rules.
- **Mod:** PENCIL MARKS (ON HIT): a miss pencils a dot on one other ICE in the same row.
- **Works with:** X-AXIS / Y-AXIS, VIRUS.

### A12. PAWN BROS (board game, a Parker Bros parody; or BOARDWALK INC, MONOPOLE)
- **Special:** a die roll each layer. The grid is a board loop with a GO square.
- **Tell:** the real node is the die roll's number of spaces from GO. The boss adds Chance cards.
- **Mod:** CHANCE CARD (LAYER START): every corp, you draw a card: lock 1 ICE, +10cr, +3s, nothing, or
  (rarely) -1 integrity.
- **Works with:** CORNERS (board corners are GO / Jail), LUCKEEZ.

### A13. SQUALOR * (social media, amped up)
- **Special:** the whole screen turns into a feed.
  - Every node shows like and follower counts.
  - **Emotes fly around**, reusing the multiplayer emotes (they float up and fade), plus social
    ones: `<3`, `:)`, `+1`, `:(`, `-1`.
  - A pointless **profile bar** sits on top of the HUD: your persona's followers and engagement go
    up and down for no reason.
  - Finding the real node sets off a burst of likes and hearts (`<3 <3 +1.2k`), and your
    followers jump.
  - ICE hits go viral: a "trending" mark spreads, and the next hit does +1.
- **Tell:** hot and cold with reactions. Hover with the mouse, or touch and drag, and the nodes near
  your pointer react: more likes and happy emoji the closer you get to the real node. The boss turns
  on you: **negative emoji** (thumbs down, angry) get stronger the closer you get, so you follow
  the hate. Uses the drag-to-select tech (no accidental picks).
- **Mod:** INFLUENCER (ALWAYS ON), on purpose **100% cosmetic and pointless**: while you have it, the
  profile bar stays on in every corp, followers and likes go up and down at random, and emoji get
  thrown at you while you play. No benefit at all. It's a joke, and it takes a slot.
  - A second mod for the boss pool: CLOUT (ALWAYS ON): every perfect in a row adds 10% pay; a miss
    resets it.
- **Works with:** VIRUS (viral), SKIMMER, FASTPAY; the multiplayer emotes; DECIBEL and PEEPHOLE (the
  same hover / drag).

### A14. DROP-4 (Connect 4)
- **Special:** the nodes drop in from the top like chips, in two colors.
- **Tell:** the real node is the chip that would make 4 in a row.
- **Mod:** FOUR IN A ROW (LAYER END): 4 perfects in a row, and the next boss starts with 2 ICE locked.
- **Works with:** Y-AXIS (columns), CORNERS (the bottom row), GRAVITAS (falling), SPECTRA (color).

### A15. LEXICON (word corp; or SPELLCORP)
- **Special:** each real node carries a letter, and over 5 layers they spell a 5-letter word.
- **Tell:** by layer 3-4 you can guess the word (`C R A _ _`) and look for the next letter. The boss
  is the last letter, with decoys that also make real words.
- **Mod:** SPELLBOUND (LAYER START): in every corp, the boss layer gets a one-letter clue (T, B, L, R
  or C: top, bottom, left, right, center).
- **Works with:** KEYLOGGER (letters as glyph lines), AFTERIMAGE, SEEKR.

### A16. SPECTRA (chroma)
- **Special:** color is the whole game; the glyphs are all the same.
- **Tell:** the real node is the odd hue out, or the next color in a sequence across layers (R, G,
  B...). Each color also gets a shape, for color-blind players.
- **Mod:** PRISM (ON HIT): a miss tints the nodes in the real node's row one shade.
- **Works with:** X-AXIS, DROP-4; the corp-colored map icons.

### A17. PURLWISE (yarn, knit and purl; or SKEIN)
- **Special:** a stitch pattern: knit `v` and purl `-` glyphs across the grid.
- **Tell:** the real node is the dropped stitch, the one that breaks the pattern.
- **Mod:** UNRAVEL (BOARD): an ICE hit unravels its row, which locks one more ICE in that row.
- **Works with:** X-AXIS, CLONEWORKS (both pattern corps).

### A18. MOCHI MOCHI (pink anime, Sanrio-ish; or KAWAII.SYS, PIKOPIKO)
- **Special:** it wants you to find the node. Cute glyphs, and hits cost 10cr instead of integrity
  ("sorry!!").
- **Tell:** the real node waves at you (a little bounce). Easy on purpose.
- **Mod:** FRIENDSHIP (BLOCK): once per corp, an ICE hit costs 10cr instead of integrity.
- **Works with:** fills a BASIC slot; shares a look with PLAYTIME.

### A19. KERNEL (seed corp; or SEEDLING)
- **Special:** the run seed is the clue. The boss can **reseed**: the map ahead is rebuilt from a new
  seed (needs care with saves and multiplayer).
- **Tell:** the seed's characters map to positions (e.g. the 3rd character is the column). The HUD
  lights up the character that matters.
- **Mod:** SEED READER (LAYER START): in any corp, one seed character lights up in the HUD and names
  the boss's real column.
- **Works with:** the daily seed idea, the ROUTE and WARP items.

### A20. DEMOLITION (destroy the ICE, not the node)
- **Special:** reverse rules. Clear all the ICE without touching the real node. Tapping the real
  node is what hurts. Like minesweeper.
- **Tell:** each broken ICE shows a number: how many ICE are next to it.
- **Mod:** CONTROLLED BLAST (TAP TO USE): once per corp, blow up a 2x2 block. ICE in it locks; if the
  real node was in it, it shows, but the layer pays nothing.
- **Works with:** VIRUS, SHATTER, the minesweeper mod ideas.

### A21. HALFLIFE (radiation)
- **Special:** radiation builds each layer, and at the end of the corp it costs integrity unless you
  were fast.
- **Tell:** a Geiger counter: the clicks speed up near the real node, with a `.:` meter for muted
  players.
- **Mod:** LEAD LINING (BLOCK): the first hit in every boss layer is free. Plus the user's **NUKE**
  idea as an EXOTIC item: wipe a whole corp node off the map (you get past it, no reward).
- **Works with:** the clock mods, FASTPAY; uses the same "closer = louder" tech as DECIBEL.

### A22. BYTEPETS * (digital pets; or DIGIPETZ, TAMAGOTCHU, KIBBLE.EXE)
- **Special:** the nodes are little digital pets, like a keychain pet toy. Tap CALL in the HUD and
  they all turn their heads.
- **Tell:** the real node is the one that comes when called: it moves a step toward the CALL button.
  A CALL costs a treat (1cr).
- **Mod:** COMPANION (ALWAYS ON): a pet follows you in the tray. Once per corp, at a random moment,
  it sniffs out and locks 1 ICE, **if you feed it**: each lock costs a 1cr treat. No credits, no
  sniffing. Let it go hungry for a whole sector and it sulks (it skips its next lock).
- **Works with:** SNIFFER (they stack).

### A23. TWINLINK (linked / double-size nodes)
- **Special:** linked pairs, drawn with a line between them, flip together. That helps or hurts.
  The boss adds 2x nodes that take two cells.
- **Tell:** the real node is never linked, and a 2x node is always ICE.
- **Mod:** LINKUP (BOARD): ICE you hit takes its partner with it. In other corps, the partner is the
  node mirrored across the center.
- **Works with:** MIRRORLINE (mirrors are links), AFTERIMAGE.

### A24. HAUTE//COUTURE * (art / clothing): the corp built for the Sigil mods
- **Special:** every node wears a designer label, which works as the Sigil signature. Most are
  knockoffs.
- **Tell:** the real node is the original: every fake label is one character off. Each layer is a
  new "season" with a new label.
- **Mod:** RUNWAY (LAYER START): the first layer of each corp walks in one node at a time, and the
  real node walks in last.
- **Works with:** **SIGSCAN** (every ICE is signed here, so it always finds one); **FORGERY** (the
  first knockoff you hit each layer is free); KEYLOGGER.

### A25. PLAYTIME (toy corp; or WINDUP)
- **Special:** the nodes are toys: a top, a robot, a jack-in-the-box.
- **Tell:** the real node is wound up: it hops now and then.
- **Mod:** JACK-IN-THE-BOX (LAYER START): in every corp, at a random moment, one ICE pops (locks)
  with a jingle.
- **Works with:** shares a look with MOCHI MOCHI; FREEZE FRAME (it catches the hop).

### A26. KERNING * (misalignment)
- **Copy * (the user wants OCD named in the corp's copy):** keep it playful, about the corp, never
  mocking the player.
  - intel line: `"everything in its place. EVERYTHING."`
  - codex tell: "KERNING's whole board has OCD about pixels. one character is a pixel or two off,
    and once you see it you can't unsee it."
  - boss intro: `"we fixed it. we fixed ALL of it."`
- **Special:** the renderer itself: one character of the real node's glyph is drawn 1-2px off. It
  gets subtler each layer.
- **Tell:** the one that's slightly off. The boss misaligns the decoys too, and the real node is the
  only *aligned* one.
- **Mod:** PIXEL PEEP (ON HIT): after a hit, the real node is nudged 1px for a second.
- **Works with:** any corp, as an extra tell layered on top.

### A27. PLAYBALL * (sport, with a pong / breakout game on top)
- **Special:** you play pong while you pick. A ball bounces around the grid, with walls on the left
  and right and a paddle at the top and the bottom. Both paddles move together with one control.
  Layers are quarters on a scoreboard, and the boss is overtime (two balls).
  - The ball **bumps nodes** as it passes, breakout style. ICE cracks and locks after 2 bumps, so a
    ball kept in play does work for you.
  - Let the ball out past a paddle and it's a hit (1 integrity), and a new ball is served.
- **Tell:** when the ball bumps the real node, it **rings** (a different sound and a flash, not a
  crack). So watch and listen while you keep the ball alive.
- **Controls (the hard part):**
  - **Desktop:** the paddles follow the mouse's x position; clicks pick nodes as usual.
  - **Touch:** the bottom strip of the screen (under the grid, where the tray is) is a **paddle
    strip**. Touch and slide there to move the paddles; taps on the grid still pick nodes. One thumb
    for each, or just quick switching.
  - Fallback if it's too hard on phones: the paddles move toward the column of your last tap, so
    every pick is also a paddle move.
- **Tier:** 3 (real-time ball physics and a new touch zone). **Level:** 5.
- **Mod:** OVERTIME (ALWAYS ON): boss clocks get +5s, and when a clock runs out you get one free extra
  pick.
- **Works with:** the clock mods.

### A28. FOSSIL (dig site; "we've been around a long time") (the user, 2026-10-23; not designed)
- **Special:** digging for fossils. You brush the nodes off: a tap doesn't just break the node, it slowly
  reveals its glyph, a bit more each tap.
- **Tell:** some glyphs are the usual glyphs and some are fossils. Uncover a regular glyph and it's ICE: it
  hurts you. *(Claude)*: open question is whether brushing costs anything (a tap, time) so you can't just
  half-brush every node for free.

### A29. UNICORN (very rare) (the user, 2026-10-23; not designed)
- A very rare corp. Maybe all its mod offers are EXOTIC, or its reward raises your odds of exotics and
  legendaries. Or it's not a corp you find but a REP unlock.

### A30. MAGIC (stage magic) (the user, 2026-10-23; not designed)
- Nodes get sawed in half or vanish; or you're looking for the rabbit. The user notes MONTE (A7, the shell
  game) may already cover this idea.

### A31. ALARMS (working name) (the user, 2026-10-24; not designed)
- A corp with **alarms that go off when you hit ICE**. The user wasn't sure it was noted already: the closest
  is SPEC §17's trap ideas ("alarm (raises a corp-wide trace meter)", "trace meter: misses raise alarm across a
  corp; at max, the boss arrives early or ICE hunts you"). *(Claude)*: so the alarm could be that meter, made
  into a corp: each ICE hit raises it, and at full the corp does something nasty (the boss comes early, a clock
  starts, ICE starts moving).

(The user's mod thief idea is under corp modifiers below.)

---

# Part B: Claude's 50 (revised)

## Simple (1-10)

### 1. SEEKR (web search)
- **Special:** the intel line types a search as you enter: `> seekr: +-+ | | ...` with autocomplete.
- **Tell:** the top autocomplete suggestion is the real node's glyph. Deeper layers only show part
  of it, and the boss shows "did you mean...?" with a near-miss glyph.
- **Mod:** AUTOCOMPLETE (ON HIT): your first miss each layer strikes out one ICE node.
- **Works with:** KEYLOGGER; could merge with SYNAPSE.

### 2. BRIGHTLINE POWER (utility company)
- **Special:** the grid flickers like a brownout; every few seconds the screen dims for a moment.
- **Tell:** decoys flicker with the power, and the real node stays steady (it has a backup).
- **Mod:** GROUNDED (BLOCK): ICE that would hit for 2 hits for 1.
- **Works with:** OMNI's and boss damage; FREEZE FRAME.

### 3. MEGAMART (big box retail)
- **Special:** every node wears a price tag (`$4.99`).
- **Tell:** the real node is the one on sale, the lowest price. Deeper, the cheapest is a trap and
  the real one is the price that ends in .00.
- **Mod:** COUPON (ALWAYS ON): markets show one extra offer.
- **Works with:** HAGGLE; FORGERY (fake price tags).

### 4. PARCELNET (shipping)
- **Special:** nodes are boxes with tracking numbers.
- **Tell:** the real node's tracking number ends in the layer number.
- **Mod:** PRIORITY (ALWAYS ON): the map shows how many layers each corp node has.
- **Works with:** the map, ROUTE.

### 5. COLDBREW (coffee chain)
- **Special:** each layer's clock is 1s shorter than the last ("another shot").
- **Tell:** the real node steams: a `~` drifts up above it now and then.
- **Mod:** ESPRESSO (TAP TO USE): pause the clock for 5 seconds, once per corp.
- **Works with:** OVERCLOCK, FASTPAY, COOLANT.

### 6. TOLLGATE (highway tolls)
- **Special:** every pick costs 2cr, but layers pay a bit more.
- **Tell:** a toll booth `|=|` sits above one column, and the real node is in that column (or next
  to it, deeper).
- **Mod:** EZPASS (ALWAYS ON): +2cr for every layer you pass.
- **Works with:** Y-AXIS (the toll column).

### 7. NIMBUS (weather service)
- **Special:** the intel line gives a forecast: `> 70% chance: top row`.
- **Tell:** the forecast is right as often as it says, so 70% means 70%.
- **Mod:** FORECAST (LAYER START): every corp gets a forecast line (a row or column, 60% right).
- **Works with:** X-AXIS / Y-AXIS (a forecast row plus a scan).

### 8. LEDGER TRUST (bank)
- **Special:** nodes show account balances.
- **Tell:** the real node's balance is the only one whose digits add up to 10.
- **Mod:** INTEREST (LAYER END): when a corp ends, +5% of your credits (up to 20cr).
- **Works with:** FORGERY (fake balances count as $ nodes: free to hit), SKIMMER.

### 9. BURGERTRON (fast food)
- **Special:** nodes are combo numbers (#1 to #9).
- **Tell:** the intel line names the combo of the day. On the boss, the menu changes halfway.
- **Mod:** SUPERSIZE (ALWAYS ON): every layer pays x2 (was boss layers x1.5 until v13.23).
- **Works with:** FASTPAY (fast food).

### 10. DIALTONE ONLINE (old dial-up ISP)
- **Special:** a modem screech plays as each layer connects.
- **Tell:** the screech has a few clear beeps; their count is the real node's place in reading order.
  It also shows as dots in the HUD, so it works muted.
- **Mod:** HANDSHAKE (LAYER START): in every corp, the connect sound beeps the real node's row.
- **Works with:** TELEPHONIX (sound tells).

## Medium (11-40)

### 11. DEWEY SYSTEMS (library)
- **Special:** nodes show call numbers (`613.7`) that should be in order across the grid.
- **Tell:** the real node is the one shelved out of order.
- **Mod:** INDEX (ON HIT): ICE you hit shows HI or LO: is the real node's number higher or lower?
- **Works with:** NUMBERWONG.

### 12. STREAMFLIX (streaming)
- **Special:** the screen buffers. Every few seconds everything freezes for half a second, with a
  spinner.
- **Tell:** during the freeze, the real node keeps animating, because it's the one that's live.
- **Mod (new) *:** FREEZE FRAME (TAP TO USE): once per corp, freeze the screen for a second. Anything
  with a moving tell keeps moving (steam, a pulse, a hop, a drift). In corps without one, the real
  node twitches once.
- **Works with:** every animation corp: COLDBREW, TEMPO, APIARY, PLAYTIME, BULLET TIME.

### 13. RYDR (rideshare)
- **Special:** surge pricing. A layer pays more the less time is left on its clock.
- **Tell:** nodes have star ratings, and the real one is the odd 4.9 among 5.0s (fakes rate
  perfectly).
- **Mod:** SURGE (ALWAYS ON): every corp layer has a clock (15s if the corp has none); a real pick in its last 3 seconds heals 1 (was x1.5 pay until v13.24).
- **Works with:** OVERCLOCK (its late purges are worth even more), FASTPAY (the opposite bet).

### 14. APIARY * (bees, agriculture; or BEZ, BZZ)
- **Special:** the nodes are a hive; worker nodes slowly drift a pixel at a time toward the queen.
- **Tell:** the real node is the queen. Watch where the others lean.
- **Mod (new) *:** HONEYCOMB (LAYER END): every perfect stores a drop of honey (in the HUD). At 3
  drops, you heal 1. If you're full, each drop is +10cr.
- **Works with:** VIRUS (a swarm), FREEZE FRAME.

### 16. TEMPO RECORDS (music label)
- **Special:** the corp's music has a strong beat, and the boss changes tempo.
- **Tell:** the real node pulses on the beat; decoys pulse just off it. A sound and animation tell.
- **Mod:** ON BEAT (ON PICK): a pick made on the beat pays x1.5 (the beat shows in the HUD).
- **Works with:** MEDIX (heartbeat), FREEZE FRAME.

### 17. ECHO LABS * (sonar; BEACON merged in)
- **Special:** every few seconds, all the nodes ping, with small rings and a soft blip. It's minimal:
  no beam.
- **Tell:** the real node pings differently: a different pitch, and its ring goes the other way
  (in, not out). Muted players watch the rings.
- **Mod (new; BEACON's) *:** FOGHORN (ON HIT): a horn sounds, louder the closer your miss was. Also
  shows as bars.
- **Works with:** DECIBEL, HALFLIFE (closer = louder).

### 18. HEADLINE (24-hour news)
- **Special:** a news ticker scrolls along the top of the grid.
- **Tell:** one headline names where the real node is (`...MARKETS FALL IN THE TOP LEFT...`).
  Deeper, some headlines are fake news; the boss ticker is all lies except one.
- **Mod:** SCOOP (LAYER START): every corp gets a ticker with one true row hint.
- **Works with:** X-AXIS (a row hint plus a row scan).

### 19. GLACIER (cold storage)
- **Special:** frost spreads in from the edges, one node every few seconds. A frozen node can't
  be picked.
- **Tell:** the real node freezes last, but if the frost reaches it you take a hit. Waiting narrows
  it down but costs you.
- **Mod:** ICEBOX (BLOCK): the first hit in each corp's first layer is free.
- **Works with:** COOLANT (slower frost), ANCHOR (stops the frost), CORNERS (the frost starts there).

### 20. TUMBLER (locksmiths)
- **Special:** nodes are lock pins sitting at different heights in their frames.
- **Tell:** the real node's pin sits at the shear line, the one height that differs.
- **Mod (new) *:** PICKSET (ON HIT): every ICE hit sets a pin, shown in the HUD. At 3 pins in one
  corp, the next layer opens with the real node's row lit.
- **Works with:** X-AXIS (the lit row plus a scan).

### 22. WATCHPOINT * (security cameras)
- **Special:** a camera sweeps the grid row by row.
- **Tell:** nodes under the camera show their real faces for a moment: ICE flashes as `###`.
- **Mod (new) *:** PEEPHOLE (ALWAYS ON): hover with the mouse, or touch and drag, and a small camera
  view follows you. ICE under it flashes `###` for a moment, a few times per layer. Needs the same
  drag tech as DECIBEL, with the same guard against accidental picks.
- **Works with:** DECIBEL (drag), PREDATOR (a view of a moving target).

### 23. TELEPHONIX (phone company)
- **Special:** nodes are a keypad (1-9, *, 0, #).
- **Tell:** the intel plays dial tones: the real node's number. Muted players see the digits flash
  once.
- **Mod:** CALLER ID (ON HIT): a hit plays the tone for the real node's row.
- **Works with:** DIALTONE.

### 25. CLONEWORKS (cloning lab)
- **Special:** every glyph shows up exactly twice, except one.
- **Tell:** the real node is the only glyph without a twin. Deeper, twins differ by one character.
- **Mod (new) *:** TWIN LOCK (BOARD): ICE you hit also locks every other closed node with the exact
  same glyph. Strong here; in normal corps, decoy glyphs repeat often enough that it still helps.
- **Works with:** KEYLOGGER, GENCORP, PURLWISE.

### 26. LA FAMIGLIA * (organized crime)
- **Special:** protection money. Each layer offers a lock on 1 ICE for 15cr.
- **Tell:** after each miss, a decoy snitches: it points at another decoy.
- **Mod (changed) *:** OMERTA (BLOCK): an ICE hit costs 10% of your credits (at least 15cr)
  instead of integrity, while you can pay. The richer you are, the more it costs.
- **Works with:** SKIMMER, INTEREST (more credits, pricier protection).

### 28. SAFEHARBOR INSURANCE (insurance)
- **Special:** pay a premium as you enter (10cr) and every hit in the corp pays a claim.
- **Tell:** the fine print: a tiny dot in one corner of the real node's frame.
- **Mod:** POLICY (ON HIT): every ICE hit pays 8cr.
- **Works with:** **SIGSCAN** (the fine-print dot counts as a mark, but here it's on the *real* node
  and the decoys get a fake dot, so it locks a fake).

### 29. CHUCK E. CACHE'S * (arcade, pizza and games; or CHEDDAR CHIP'S)
- **Special:** layers are levels with a score on screen; the boss's nodes have health bars and take
  2 taps. Tickets instead of credits for this corp, cashed in at the end.
- **Tell:** the real node is the 1UP; it blinks in time with the score counter.
- **Mod:** CONTINUE? (ALWAYS ON): once per run, dying gives a 10-second countdown to pay 100cr and
  keep going.
- **Works with:** FAILSAFE (they're similar; maybe CONTINUE? only works after FAILSAFE is spent).

### 30. ZODIAC HOUSE * (astrology; was STARFALL)
- **Special:** the nodes are the twelve signs, drawn as small constellations. The intel line gives
  today's horoscope. The boss is MERCURY RETROGRADE: the tell runs backward.
- **Tell:** the horoscope names your lucky sign, and the real node is in that sign's constellation
  (a faint line joins it).
- **Mod:** HOROSCOPE (LAYER START): every corp gets a one-line horoscope with a lucky row (right
  most days).
- **Works with:** X-AXIS (the lucky row), MIRRORLINE (retrograde = mirrored).

### 31. NOIR & ASSOCIATES (detective agency)
- **Special:** every node makes a short statement (`NOT 3`, `2 LIES`, `I'M REAL`).
- **Tell:** a logic puzzle: exactly one node tells the truth, and that's the real one.
- **Mod:** INTERROGATE (TAP TO USE): once per corp, one node is forced to tell the truth.
- **Works with:** SYNAPSE (`NOT ME` hints).

### 32. PREDATOR * (heat vision hunter; was THERMAL)
- **Special:** the nodes move around slowly, wandering the grid. A Predator-style heat-vision look:
  the ramp (` .:-=+*#%@`) as a thermal background, with that targeting clicking sound.
- **Tell:** the real node is the warmest, but the heat blurs and fades every second, and it moves.
- **Mod:** INFRARED (LAYER START): every corp gets a 1-second heat flash at the start.
- **Works with:** AEGIS (hunters), QUICK EYE, PEEPHOLE; TRACER goes stale here.

### 33. FORGET-ME-NOT * (memory clinic)
- **Special:** the glyphs show for 2 seconds, then every node flips face down (a memory game).
- **Tell:** the intel line shows the real node's glyph after they flip, so you remember where it was.
- **Mod (new) *:** PHOTOGRAPHIC (LAYER START): in every corp, the real node's glyph flashes in the
  intel line for a split second (0.3s; 0.5s rare; 0.8s epic). Useful anywhere, if you're quick.
- **Works with:** KEYLOGGER (the same idea, on a timer instead of a miss).

### 34. GRIDLOCK (traffic control)
- **Special:** nodes are traffic lights cycling red, amber and green. ICE hits for 2 on red and 0 on
  green.
- **Tell:** the real node's light runs out of sync with the others.
- **Mod:** GREEN WAVE (BLOCK): an ICE hit while the clock's seconds are even is free.
- **Works with:** the clock mods, TEMPO (timing).

### 35. VERDANT * (recycling, eco)
- **Special:** after the first ICE hit in a layer, locked ICE starts growing back as new nodes (one
  every 3 picks). Before that hit, nothing regrows, so the tell isn't given away right away.
- **Tell:** the real node has a leaf in its frame corner, and so do the regrown ones.
- **Mod:** COMPOST (ON HIT): every 3rd ICE hit heals 1.
- **Works with:** **SIGSCAN** (leaves count as marks: it locks a regrown one), VIRUS.

### 36. BIDBLITZ * (penny auction / live-stream shopping; was GAVEL & CO)
- **Special:** the same mechanic in the theme the user suggested: a live penny auction. Before each
  layer, you bid credits; every 10cr locks one ICE, but every bid also adds 2s to the "auction
  clock" and cuts the pay. Hosts shout in the intel line.
- **Tell:** none. You buy information. The boss's prices go up.
- **Mod:** SNIPE (LAYER START): if you hold 100cr or more, 1 ICE is locked for free.
- **Works with:** SKIMMER, INTEREST (money corps); the clock mods.

### 37. LIFTCO (elevators)
- **Special:** a floor indicator above the grid counts 1, 2, 3... through the rows and loops.
- **Tell:** it stops a beat longer on the real node's row.
- **Mod:** EXPRESS (LAYER END): after a perfect, the next layer's indicator shows in every corp.
- **Works with:** X-AXIS.

### 38. FORM 27B * (bureaucracy)
- **Special:** paperwork. The intel line gives a rule (`corners first`), and you have to follow it
  before the real node can be picked.
- **Tell:** the real node only opens once the form is filled in. Breaking the rule gets you a
  REJECTED stamp, which counts as a hit.
- **Codex note *:** confusing at first, so spell it out step by step: "1. read the form in the intel
  line. 2. tap nodes the way it says (e.g. corners first). 3. then the real node can open. a tap
  that breaks the form is REJECTED and hits you."
- **Mod:** QUEUE NUMBER (ON HIT): a miss shows how many nodes stand between it and the real node,
  in reading order.
- **Works with:** CORNERS (the corners-first form).

### 40. CHANNEL 9 (broadcast TV)
- **Special:** static over the grid. Tapping the channel number in the HUD flips the channel, which
  re-rolls the decoys' glyphs.
- **Tell:** on one channel, the real node's glyph comes in clear. Each flip costs 1 second.
- **Mod:** REMOTE (TAP TO USE): once per corp, re-roll the decoys' glyphs.
- **Works with:** KEYLOGGER, CLONEWORKS (re-rolls break or make twins).

## Bonkers (41-50)

### 41. GRAVITAS (gravity research)
- **Special:** every miss, gravity pulls the grid down like a falling-block game. Locked ICE piles up
  and the nodes above slide down.
- **Tell:** the real node is lighter than air: it slides up a row when the rest fall.
- **Mod:** ANTIGRAV (BOARD): after a hit, one locked ICE drops off the grid and opens space.
- **Works with:** DROP-4, QUICK EYE.

### 42. UPSIDE (mirror universe)
- **Special:** the whole screen turns upside down, HUD and tray too, and a tap picks the node mirrored
  across the center.
- **Tell:** the real node's glyph is the only one that reads right side up.
- **Mod:** INVERSION (BLOCK, EXOTIC): once per corp, an ICE hit heals 1 instead of hurting.
- **Works with:** MIRRORLINE, LINKUP.

### 43. LAGRANGE NET (high latency)
- **Special:** your taps land 1.5 seconds late, and the grid slides one step in between. You pick
  where a node will be.
- **Tell:** the sounds come early. The real node's chime plays before it slides into place.
- **Mod:** PRECOG (LAYER START): in every corp, the real node's chime plays a moment before the
  layer appears.
- **Works with:** QUICK EYE, ANCHOR.

### 44. FOURTH WALL * (a corp that knows it's a game)
- **Special:** it talks to you, not your runner. It reads your save
  (`> 14 deaths to CHRONOS. again?`) and comments on your mods.
- **Tell:** it hides the real node where it knows you won't look: away from your most-picked spots
  (from your history). The boss shows a fake crash screen, and the real node is the `[x]` on the
  fake error box.
- **Mod (new; mods only work inside a run) *:** SPOILER (LAYER START): the first time you enter each
  corp in a run, its tell is printed in the intel line. Great against OMNI's borrowed tell and
  corps you haven't met.
- **Works with:** SYNAPSE (also reads you).

### 45. GROUNDHOG (time loop)
- **Special:** the corp repeats the same layer until you get a perfect. Every loop costs 1 integrity,
  but ICE you hit stays marked across loops.
- **Tell:** your notes from the last loop. Each loop moves one node.
- **Mod:** DEJA VU (LAYER START): the first layer of each corp has the same real spot as the last
  corp's last layer.
- **Works with:** AFTERIMAGE (made for it).

### 46. DECIBEL * (sound lab)
- **Special:** hot and cold by ear. On mobile you drag your finger around the grid; on desktop you
  hover.
- **Tell:** the music gets louder and clearer as you near the real node, and muffled far away. A
  waveform in the HUD shows it for muted players.
- **No accidental picks while dragging *:** dragging never picks. Lifting your finger only
  *selects* a node (a bracket around it), and a second tap on it confirms. A tap with no drag still
  picks right away, so normal play doesn't change.
- **Mod:** STETHOSCOPE (ALWAYS ON): in every corp, the music swells slightly near the real node.
- **Works with:** PEEPHOLE (the same drag), ECHO LABS, HALFLIFE.

### 47. BITROT * (data corruption)
- **Special:** the screen decays. Characters from the HUD and tray drift into the grid and nodes
  lose pieces; the corruption grows the longer you take.
- **Tell:** the real node's glyph is built out of HUD characters (your credit digits, your
  integrity `#`s).
- **Mod (new) *:** LAST BYTE (ON HIT): when a hit leaves you at 1 integrity, the HUD glitches, and the
  glitch spells out the real node's column.
- **Item (moved from the mod) *:** BITFLIP (EXOTIC item, single use): swap the tens digit of your
  credits with your integrity. The user's rule: a one-use effect should be an item, unless the mod
  survives (e.g. it could go into REP mod storage).
- **Works with:** FAILSAFE (both are about the edge).

### 48. BULLET TIME INC (slow motion)
- **Special:** everything runs at 20% speed: animations, wipes, sound (pitched down). The clock
  still runs in real time.
- **Tell:** the real node animates at normal speed, the one thing not slowed.
- **Mod:** TIMEWARP (TAP TO USE): once per corp, the clock runs at half speed for one layer.
- **Works with:** QUICK EYE, FREEZE FRAME, the clock mods.

### 49. (name open) the chain corp: each layer picks up where the last one left off (the user, 2026-10-25)
- **Name ideas** *(Claude)*: TICKERTAPE (a stock exchange: the glyphs are a ticker scrolling left), DOMINO (logistics),
  FREIGHTLINE (shipping), FILMSTRIP (a film lab), CONVEYOR.
- **Tell (the user):** like dominoes. The real node's **left side is the last layer's real node's right side**, as if
  the picture scrolled left. With numbers: 4-digit codes, and the real one's first 2 digits are the last real one's last
  2 (`4723` > `23xx`). With glyphs: the 3-line glyph is a window on a long strip moving left, so the real node's left
  columns are the last real node's right columns. Like KEYLOGGER, but sideways and across layers.
- **Layer 1** has no last node: the corp's intro or the hint hands you the start (an order number, the first frame).
- **Deeper decoys** *(Claude)*: some carry the right piece on the wrong side (the last real one's *first* columns /
  digits), some carry it reversed (`32` for `23`), and some chain off a **decoy** of the last layer, so you need to have
  followed the real one, not just any. Boss: the strip wraps, so its right side is layer 1's left side.
- **Memory:** maybe the hint shows the last real node (like GENCORP shows the parent) at low tiers, and stops at deeper
  ones, so you have to remember it.
- **Related:** GENCORP (child of the last real node, one line changed), SPECTRA (the color after the last), MIRRORLINE
  (mirrors the last position), PARCELNET (number tells).

### 50. (name open) the case corp: upper and lower case (the user, meat notes 2026-10-25)

- A corp (or a mod) that plays with **upper and lower case** glyphs, or changes the glyph characters.
- *(Claude)* tell ideas: the real node is the only one in a different case (subtle with a mixed-case board); or every
  node shouts in CAPS and the real one whispers; boss: the case flips every layer. Names: CAPSLOCK, SHIFT KEY,
  LOWERCASE, sHIFT. A mod version: re-case every decoy so only the real node keeps its case (one layer per corp).

### 51. (name open) the stock market corp (the user, meat notes 2026-10-25)

- A corp based on the **stock market**. Not designed. *(Claude)*: it pairs with #49: TICKERTAPE's scrolling strip
  is a stock ticker. Ideas: nodes as tickers with prices that move each layer, the real one "trending"; buy low / sell
  high with your credits; a crash event in the boss. Names: BULL & BEAR, WALLST.EXE, TICKER, BLUE CHIP.

---

# Corp modifiers (new idea)

From the user's notes on YOU INC and the mod thief: **modifiers that get rolled onto any corp node**,
shown on the map as a small tag on the node. They give variety without new corps, and they get more
common the deeper you go (e.g. 0% in sector 1, then 10% and +5% per sector).

**The user, 2026-10-24 (meat notes):**
- **They need a better name than "corp mods"**, since mods are already the player's thing. Something like
  modifiers, events, effects? *(Claude)* more to pick from: CONDITIONS, TWISTS, HAZARDS, FLAGS, STATUS,
  PROTOCOLS, or in-world: the corp's **SECURITY** (`SECURITY: RIVAL`) or **ALERTS**.
- **Effects could be stage-wide**, not just on one corp: e.g. "this stage has a greater chance of rival
  hackers".
- **We need more of them.**

### RIVAL * (from YOU INC)
- A rival hacker (your persona's name, glitched) runs the same corp alongside you, picking every
  few seconds.
- **They have health** (3 bars). Every ICE they hit costs them health and **burns that ICE for you**
  (it's locked). They can die before the boss.
- If they find the real node first, **they take that layer's credits**.
- So you choose: let them burn ICE for you, or race them for the pay.
- Beat them to the boss, or outlast them: a bonus (credits, or a better boss reward).
- Could reuse the multiplayer code with a bot driving the second player.
- Mod they could drop: DRAFTING (ALWAYS ON): after your 2nd miss in a layer, one ICE locks itself.
- **The user, 2026-10-24:** the rival should **wait for you to tap a node before it starts** tapping. Maybe
  it waits and goes **every other turn** (you, then it); you can still outrace it.
- **Named adversary hackers** (the user, 2026-10-25): RIVAL is one of a cast of enemy hackers you go up against.
  **ICE MAN** is one of them (the user's note "hacker ICE man"). *(Claude)*: each one could have its own name, logo,
  style and dropped mod, like the corps do.
- **Hitting ICE can call a hacker in** (the user, 2026-10-25: "i also like the idea of hitting ICE actually triggering a
  hacker into your game"). The ICE isn't just a wall: tripping it alerts an enemy hacker, who jumps into the corp
  (a RIVAL-style bot shows up mid-corp). Maybe this is how the enemy hacker stage / corp event works: in that
  stage, ICE hits can bring a hacker in (ICE MAN would fit: the hacker who comes out of the ICE).
- **Hacker / NPC name pool** (2026-10-26, from naming the tutorial's handler; the user picked **POPS**, keep the rest for
  adversaries or other NPCs): **DOC** (the handler's first name), **SYSOP** (an old BBS admin, online since 300 baud),
  **NANA** (a retired hacker grandma, sweet and ruthless), **DIALUP** (an old-timer who still hears the modem in his
  dreams), **KLUDGE** (a duct-tape veteran), **ROOT** (an AI that lives in your deck), **MOTHER** (a calm AI, a little
  too caring), **NULL** (a dry, deadpan AI), **HCF** ("halt and catch fire": a burnt-out ICE-breaker AI), **BAUD** (slow
  talking, fast hands). None clash with a corp, mod or item.

### THIEF (the user's mod thief idea)
- Hitting ICE steals one of your mods (the rightmost, or a random one), and it shows up in the
  corp's HUD.
- Beat the boss to win them back (or they're gone if you leave).
- Could also be a boss-only ability, or a whole map stage modifier.
- Ties into REP mod storage and the ripper doc (store a mod to keep it safe).

### More modifier seeds (Claude)
- **ARMORED:** the nodes have CARAPACE's armor.
- **CURSED:** no perfect heals in this corp.
- **RUSH:** every layer gets a clock (the clock mods matter more).
- **LOADED:** more $ nodes, more pay (FORGERY matters more).
- **BRANDED:** some ICE wear the Sigil signature, so **SIGSCAN works in this corp** (a way to make
  the Sigil mods useful anywhere).

---

# Mods pool (orphans to keep)
- **EVENT HORIZON** (BOARD): an ICE you hit pulls in and locks the nearest closed ICE. (Its corp,
  SINGULARITY, was cut.)

# Cut
Removed by the user in review (2026-10-20). Mods worth keeping went to the pool or were merged.
- 15 DEEPWELL (oil)
- 21 CARTOGRAPH (maps, GPS)
- 24 PAPERFOLD (origami)
- 27 HARBOR & TIDE (shipping, ports)
- 39 BEACON (lighthouse): merged into 17 ECHO LABS, which kept its FOGHORN mod
- 49 SINGULARITY (black hole): its EVENT HORIZON mod moved to the mods pool
- 50 YOU INC (rival runner): now the RIVAL corp modifier

---

# Build plan: grouped by how hard they are (2026-10-20)

Based on how v09 works today. A corp is a `CORPS` entry (name, intel, tell, boss twist, 2 mods).
The tell is either a **position rule** (`tellCells`: corners, edge, mirror) or **glyphs**
(`genLayer`: Sigil's signatures). Nodes are 5x3 glyphs, so anything that is "text on the node"
(prices, numbers, letters, ratings) is just a new kind of glyph, which is cheap.

**Every new corp also costs the same set of small things,** whatever its tier:
- a palette
- intro art (24 x 12, in ART.md; placeholder until the user draws it)
- a music style
- codex tell text
- two boss mods
- the multiplayer layer setup, which repeats the corp logic today; it should share it first

## Step 0: corp kit (do first)
Make corps plug-ins instead of special cases. A corp can supply hooks:
- `glyphs(tiles, r)`: dress the nodes
- `intel(lv)`: a hint line
- `onPick` and `onHit` (in the trigger order)
- `tick(dt)`: timed effects
- `blockHit`: a corp rule for damage

The multiplayer layer setup uses the same code. After that, a tier 1 corp is mostly data plus one
glyph function.

## Tier 1: quick (glyphs, intel line, position rules, small number tweaks)
No new systems. A few hours each, after the kit.
- **Glyph-text tells:**
  - MEGAMART (prices)
  - PARCELNET (tracking numbers)
  - LEDGER TRUST (digit sums)
  - BURGERTRON (combo numbers)
  - DEWEY (call numbers)
  - RYDR (ratings, plus a surge pay tweak)
  - SAFEHARBOR (fine-print dot)
  - TUMBLER (pin height inside the glyph)
- **Pattern glyphs:**
  - CLONEWORKS (twins)
  - PURLWISE (dropped stitch)
  - NUMBERWONG (sudoku digits)
  - GENCORP (glyph family line)
  - ZODIAC HOUSE (constellation glyphs)
- **Reuses the Sigil marks:** HAUTE//COUTURE (signatures with a one-character flaw). SIGSCAN and
  FORGERY work there on day one.
- **Intel-line tells:**
  - SEEKR (the glyph as a search)
  - NIMBUS (a forecast row)
  - LEXICON (letters building a word)
  - KERNEL (a seed character)
- **BASIC** (plain frame), and **FORGET-ME-NOT** (glyphs hide after 2s; nodes can already be hidden).
- Most mods in this tier are small too: number tweaks and lockTile (INTEREST, SUPERSIZE, COUPON,
  EZPASS, SPELLBOUND, HOROSCOPE, PHOTOGRAPHIC, TWIN LOCK).

## Tier 2: medium (one small new system each, reused by several corps)
Grouped by the system they need. Build the system once and the corps in its group get cheaper.
- **Per-node animation**, a node can pulse, flicker, hop, steam or drift a pixel:
  - BRIGHTLINE (flicker)
  - COLDBREW (steam)
  - MOCHI MOCHI (wave)
  - PLAYTIME (hop)
  - MEDIX (heartbeat)
  - APIARY (drift)
  - KERNING (a character 1-2px off)
  - STREAMFLIX (everything freezes but the real node)
  - plus the FREEZE FRAME mod
- **Timed board effects** (`tick`):
  - GLACIER (frost spreads)
  - GRIDLOCK (lights cycle)
  - LIFTCO (floor indicator)
  - HEADLINE (scrolling ticker)
  - WATCHPOINT (camera sweep)
  - VERDANT (regrowth)
  - HALFLIFE (radiation meter)
  - ECHO LABS (pings, ring animation)
- **Sound tells, each with a visual for muted players:**
  - DIALTONE (beeps)
  - TELEPHONIX (dial tones)
  - TEMPO (on the beat)
  - HALFLIFE (Geiger clicks)
  - ECHO LABS (a different ping)
  - FOGHORN
  - Needs a small tone or sequence player in the sound module.
- **A prompt before or during a layer** (a small panel or a HUD button):
  - BIDBLITZ (bids)
  - LA FAMIGLIA (protection)
  - THE CHOIR (tithe or faith)
  - LUCKEEZ (double down)
  - CHANNEL 9 (flip the channel)
  - BYTEPETS (CALL)
  - PAWN BROS (a die roll)
- **New pick rules:**
  - FORM 27B (follow the form)
  - CARAPACE (2-hit armor)
  - CHUCK E. CACHE'S (2-tap boss nodes, tickets)
  - DEMOLITION (reverse win rule, minesweeper numbers)
  - NOIR (a logic puzzle generator)
  - SYNAPSE (tracks your picks)
- **Node colors:** SPECTRA, DROP-4 (each node gets its own color, plus shapes for color-blind
  players).
- **Corp modifiers, the system:** tags on map nodes plus effects (THIEF, CURSED, RUSH, LOADED,
  BRANDED, ARMORED). Medium, and it multiplies every corp we already have, so it's a good one to
  build early.

## Tier 3: big (new game features)
Each needs real new tech. Several corps share each feature.
- **Moving nodes:** nodes change cells with an animation (the grid and the taps follow).
  - Unlocks MONTE, ENTROPY, PREDATOR, AEGIS (advance), GRAVITAS, and DROP-4's drop animation.
  - The QUICK EYE and ANCHOR mods come with it.
  - Also needs a decision on TRACER in moving corps.
- **Drag to select:** a pick by drag, select and confirm, with no accidental picks.
  - DECIBEL, PEEPHOLE, SQUALOR (hot and cold by emotes).
- **Time scale:** slow the animations, wipes and sound, but not the clock.
  - BULLET TIME, QUICK EYE, TIMEWARP.
- **Screen tricks:**
  - UPSIDE (the whole screen flips, taps mirrored)
  - BITROT (the HUD leaks into the grid)
  - LAGRANGE (taps land late)
- **Run structure:**
  - GROUNDHOG (repeat a layer, keep marks)
  - KERNEL's reseed (rebuild the map ahead; saves and multiplayer)
  - FOURTH WALL (reads the save; fake crash screen)
- **Real-time ball game:** PLAYBALL's pong / breakout (ball physics, a paddle strip for touch).
- **Big nodes:** TWINLINK's 2x nodes (a node over two cells changes the layout). Linked pairs alone
  are tier 2.
- **RIVAL modifier:** a bot second player using the multiplayer plumbing, with its own health and
  picks.

# Corp levels (difficulty ranking)

**What exists today:** every map node has a **tier** (sector + how far up the sector it is), and
the tier makes any corp harder: weaker tells, more nodes, shorter clocks. But the map picks
**which** corp evenly from all of them. Corps have no difficulty of their own.

**New:** every corp gets a **level, 1 to 5**: how hard it is to read and play, before tier scaling.
The two stack:
- the **level** decides when a corp starts showing up;
- the **tier** decides how hard it plays once it's there.

**How the map picks (proposal):**
- Each step has a **target level**: `sector + 1` in a sector's first two steps, `sector + 2` in the
  last two, capped at 5. So sector 1 is mostly levels 1-2, sector 2 is 2-3, and so on.
- Weights by level:
  - target level: 3
  - one under: 2
  - two or more under: 1 (easy corps still turn up now and then as breathers)
  - one over: 0.25 (a rare "out of its depth" surprise)
  - more than one over: never
- No corp twice in the same step (as today). If a level has too few corps, widen to the next level.
- Show it: level pips on the map node info and in the codex (`LV 3`).

**Levels (first pass; tune by playing):**
- **LV1, breathers, one obvious tell:**
  - PERIMETER, BASIC, MOCHI MOCHI
  - MEGAMART, PARCELNET, BURGERTRON
  - SEEKR, NIMBUS, PLAYTIME
- **LV2, one clear rule to learn:**
  - SIGIL, MIRRORLINE, LEDGER TRUST
  - DEWEY, RYDR, SAFEHARBOR
  - TUMBLER, CLONEWORKS, HAUTE//COUTURE
  - COLDBREW, BRIGHTLINE, TOLLGATE
  - ZODIAC HOUSE, PURLWISE
  - MEDIX, DIALTONE, BYTEPETS
- **LV3, a twist or a timing tell:**
  - CHRONOS, LEXICON, GENCORP
  - SPECTRA, DROP-4, TELEPHONIX
  - TEMPO, HEADLINE, LIFTCO
  - KERNING, STREAMFLIX, APIARY
  - ECHO LABS, WATCHPOINT, VERDANT
  - PAWN BROS, LUCKEEZ, THE CHOIR, SQUALOR
  - LA FAMIGLIA, BIDBLITZ, CHANNEL 9
  - CHUCK E. CACHE'S, FORGET-ME-NOT, CARAPACE
- **LV4, puzzles, pressure or moving parts:**
  - NUMBERWONG, NOIR, FORM 27B
  - GLACIER, GRIDLOCK, HALFLIFE
  - SYNAPSE, KERNEL, DEMOLITION
  - MONTE, ENTROPY, PREDATOR
  - AEGIS, TWINLINK
- **LV5, bonkers:**
  - GRAVITAS, UPSIDE, LAGRANGE NET
  - FOURTH WALL, GROUNDHOG, DECIBEL
  - BITROT, BULLET TIME INC, PLAYBALL
- OMNI//CORE stays outside the levels. It's sector 1's boss; later sectors mix in LV4-5 corps
  (plus a modifier) as bosses.

**Corp modifiers** could add to a corp's effective level (a CURSED LV2 plays like a LV3), so the
map can treat a modifier as part of the same budget.

**Today's four corps:** with only PERIMETER (1), SIGIL (2), MIRRORLINE (2) and CHRONOS (3), the
weighting barely matters yet. It matters once tier 1 corps land, so build it into the corp kit.

## Status
- **Built in v09 (2026-10-20):** step 0 corp kit, corp levels with the weighted map pick, and BASIC,
  SEEKR, MEGAMART, CLONEWORKS, HAUTE//COUTURE and LEDGER TRUST (with BASIC TRAINING, AUTOCOMPLETE,
  COUPON, TWIN LOCK, RUNWAY, INTEREST). FORGERY and SIGSCAN now work in HAUTE//COUTURE.
  Details: SPEC §16l.
- **Built in v09, batch 2 (2026-10-20):** PARCELNET, BURGERTRON, NIMBUS, DEWEY, RYDR, SAFEHARBOR,
  TUMBLER, PURLWISE, NUMBERWONG, GENCORP, ZODIAC HOUSE, LEXICON, KERNEL, FORGET-ME-NOT, TOLLGATE.
  **25 corps total** (+ OMNI). That is all of tier 1 except SQUALOR (moved to tier 3).
  - Mods: PRIORITY, SUPERSIZE, FORECAST, INDEX, SURGE, POLICY, PICKSET, UNRAVEL, PENCIL MARKS,
    MUTATE, HOROSCOPE, SPELLBOUND, SEED READER, PHOTOGRAPHIC, EZPASS.
  - **Changes from this doc:**
    - DEWEY's tell is "misfiled" (from another section), not "out of order": out of order can't
      always point at one node.
    - PARCELNET's PRIORITY is "$ nodes drop loot twice" (every corp has the same layer count, so a
      layer count on the map told you nothing).
    - FORGET-ME-NOT's PHOTOGRAPHIC uses one fixed 0.45s flash (corp mods have no tiers).
    - SEED READER and SPELLBOUND only work on boss layers.
    - NUMBERWONG uses prime / multiple-of-3 rules.
    - ZODIAC shows each sign's element on the node.
- **Corp tester (dev):** seeds named after a corp (SEEKR...) make every node that corp; DEV1 runs
  every corp in level order; the dev menu has a corp list with tier and breach now.
- **Built in v09, tier 2 (2026-10-20):** all of tier 2, 34 corps, so **59 corps total** (+ OMNI),
  plus the corp modifiers system (CURSED, RUSH, LOADED, BRANDED, THIEF, ARMORED; RIVAL is still to
  come). Details and the list: SPEC §16l "Tier 2".
  - Animation: BRIGHTLINE, COLDBREW, MOCHI MOCHI, PLAYTIME, MEDIX, APIARY, KERNING, STREAMFLIX.
  - Timed: GLACIER, GRIDLOCK, LIFTCO, HEADLINE, WATCHPOINT, VERDANT, HALFLIFE, ECHO LABS.
  - Sound: DIALTONE, TELEPHONIX, TEMPO.
  - Buttons / choices: BIDBLITZ, LA FAMIGLIA, THE CHOIR, LUCKEEZ, CHANNEL 9, BYTEPETS, PAWN BROS.
  - Pick rules: FORM 27B, CARAPACE, CHUCK E. CACHE'S, DEMOLITION, NOIR, SYNAPSE.
  - Colors: SPECTRA, DROP-4.
  - Changes from this doc: WATCHPOINT's mod is CCTV (PEEPHOLE needs drag, tier 3); THE CHOIR faces
    4 ways; DEMOLITION's numbers are 1 / 0 (is the real node next to it); CARAPACE's armor doesn't
    take 2 hits (a thin-spot tell plus a built-in pointer); CHUCK E. CACHE'S boss doesn't take 2
    taps yet. Full list in SPEC §16l.
  - Left for tier 3: SQUALOR, MONTE, ENTROPY, PREDATOR, AEGIS, GRAVITAS, DECIBEL, BULLET TIME,
    UPSIDE, BITROT, LAGRANGE, GROUNDHOG, FOURTH WALL, PLAYBALL, TWINLINK, RIVAL, and the stage boss
    rethink (SPEC §17).
- **Built in v09, tier 3 (2026-10-21):** all 15, so **74 corps** (+ OMNI): every corp in this doc.
  Also the RIVAL modifier and the new sector bosses. Details: SPEC §16l "Tier 3".
  - Moving nodes: MONTE (QUICK EYE), ENTROPY (ANCHOR), PREDATOR (INFRARED), AEGIS (AMBUSH),
    GRAVITAS (ANTIGRAV).
  - Drag / hover: DECIBEL (STETHOSCOPE), SQUALOR (INFLUENCER).
  - Time and screen: BULLET TIME (TIMEWARP), UPSIDE (INVERSION), BITROT (LAST BYTE), LAGRANGE
    (PRECOG).
  - Loops, meta, games: GROUNDHOG (DEJA VU), FOURTH WALL (SPOILER), PLAYBALL (OVERTIME), TWINLINK
    (LINKUP).
  - Sector bosses: OMNI in sector 1, then a third OMNI and otherwise a LV4-5 corp plus a modifier.
    OMNI copies one corp you beat in that sector.
  - Changes from this doc:
    - PLAYBALL: a ball out costs 20% pay (boss: -1 int).
    - AEGIS's boss: a decoy holds back once, instead of a search beam.
    - SQUALOR has one mod (INFLUENCER); CLOUT is unused.
    - ENTROPY shuffles on a timer (its boss on hits too).
    - LAGRANGE's early sound also shows as a `* *` mark.
  - Still open: PEEPHOLE, DRAFTING, BITFLIP, KERNEL's reseed, second boss mods, real art.
- Changes from this doc made while building:
  - AUTOCOMPLETE and TWIN LOCK are BOARD stage (they lock nodes).
  - TWIN LOCK locks the *most alike* ICE: normal corps never repeat a glyph, so an exact twin only
    exists in CLONEWORKS.
  - CLONEWORKS gets +1 node so every layer has at least a pair.
  - SEEKR's boss "did you mean" swaps one line for a decoy's.

## Suggested order
1. Corp kit (step 0), shared with multiplayer, including corp levels and the weighted map pick.
2. 3-4 tier 1 corps to prove the kit. Say HAUTE//COUTURE (crosses over with Sigil), CLONEWORKS,
   MEGAMART and BASIC, with placeholder art.
3. The corp modifiers system (BRANDED, CURSED, RUSH first).
4. Per-node animation, then the tier 2 corps that use it.
5. Pick one tier 3 feature at a time. Moving nodes unlocks the most.

## Notes
- **Good first builds:** they only need code that's already there (glyph / frame changes, the intel
  line, lockTile): BASIC, SEEKR, MEGAMART, PARCELNET, LEDGER TRUST, CLONEWORKS, DEWEY, HAUTE//COUTURE
  (reuses the Sigil signature).
- **New tech needed:**
  - sound tells (DIALTONE, TEMPO, TELEPHONIX, ECHO LABS, DECIBEL, HALFLIFE); each needs a visual
    for players who play muted
  - drag-to-select (DECIBEL, PEEPHOLE)
  - global time speed (BULLET TIME, QUICK EYE)
  - moving nodes (MONTE, ENTROPY, PREDATOR, AEGIS, GRAVITAS)
  - screen flip (UPSIDE)
  - a bot player (RIVAL)
