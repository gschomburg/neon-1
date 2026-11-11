# SYSTEM FAILURE: all the copy, in order

The G0D quest's words in one place, for a read-through. Pulled 2026-11-11 (v14.76: after Greg's copy pass; lore in docs/QUESTS.md "What G0D is").
**This is a snapshot, not the source.** Each section says where its lines live in the code: edit them there.
`docs/QUEST_DIALOG.md` is the generated script of the calls and scenes only (`node tools/data/quest_dialog.js`).

Some lines are picked at random from a list: those are marked *(one at random)*.

**Reviewing:** edit lines in place, delete or ~~strike~~ ones to cut, and put notes on their own line starting `>>`.
Then ask Claude to "apply the copy doc": it diffs this file against the last commit and carries the changes into the
code, then refreshes this file.

---

## Step 1: PROVE IT

*Quest card:* POPS is on your crew now. beat a sector boss and show him what you've got.

**POPS's call when he joins** (data/quests.js `joined`)
> **POPS:** you called. i came. that's how a crew works, kid.
> **POPS:** i'm on yours now. no charge.
> **POPS:** my own calls'll turn up in markets and loot.
> **POPS:** clear a sector and we'll talk. something's off in the net lately. i want to know you can handle it.

Terminal: `> QUEST: SYSTEM FAILURE`

**After your first sector** (`sector`)
> **POPS:** that's a sector. not bad, kid.
> **POPS:** i've been watching the net. corps going quiet. something growing in the logs, like mold.
> **POPS:** MEDIX runs hottest. break MEDIX if you see it.
> **POPS:** and keep an eye out for any MEDIX tech. there might be some data we can scrape.

---

## Step 2: THE DISC

*Quest card:* POPS wants an old DISC found. try MEDIX: its corp boss always has one. it can turn up anywhere loot drops, markets too.

**The DISC in a market** (`shop`)
> **POPS:** kid. that DISC in the market. it's a MEDIX archive.
> **POPS:** buy it. i'm good for it. mostly.

**You pick it up, first time** (`found`)
> **POPS:** kid. that disc you just picked up.
> **POPS:** i recognize that hash. don't lose it.
> **POPS:** take it through the next checkpoint: beat the sector boss and CASH OUT at the UPLINK with it.
> **POPS:** then bring it to me.

**You pick it up again** (`foundOld`)
> **POPS:** the disc. you've got it again.
> **POPS:** beat the sector boss, CASH OUT at the UPLINK with it.

**You pick it up after dying with one** (`foundAgain`)
> **POPS:** you lost it last time. there was another copy out there.
> **POPS:** this time: sector boss, then CASH OUT with it.

*Quest card, holding it:* **GET OUT WITH THE DISC**: you have the DISC. beat the sector boss, then CASH OUT at the UPLINK with it.
*Quest card, lost it:* you lost the DISC. another copy is out there. try MEDIX again, or any loot node, market or the PIER.

**At the UPLINK with it** (`uplink`)
> **POPS:** you made the checkpoint with the disc.
> **POPS:** CASH OUT here and bring it to me.

**The results after cashing out** (`deliver`; buttons `[ TAKE IT TO POPS ]` / `[ LATER ]`)
> **POPS:** you made it out with the disc.
> **POPS:** come by the safehouse. let's see what's on it.

---

## Step 3: SAFEHOUSE (cutscene `disc`)

*Quest card:* you cashed out with the DISC. take it to POPS.

*POPS's safehouse is a back room behind a laundromat that closed years ago. the sign still flickers OPEN.*

*inside it smells like solder and burnt coffee. three monitors, two of them dead. a faded futon. cables everywhere, taped down where people trip.*

**POPS:** you brought it. let's see it.

*you hand him the DISC. his hands shake, just a little. you've never seen them do that.*

*the DISC goes in. an old drive coughs, then spins up.*

**POPS:** ...this was my boy's. he carried it everywhere.

**POPS:** he went into the net years back. never came out.

*he doesn't look at you while he says it. he's looking at the label.*

**POPS:** it's encrypted. but there's a trail on it: an old terminal, somewhere deep.

**POPS:** and one name all over the logs. d0g.

*his jaw sets. the shake is gone.*

**POPS:** if d0g did something to my boy, i want him to feel it.

**POPS:** his trail runs down deep. somewhere the logs call HAD3S.

**POPS:** here. that's a seed: HAD3S. start a run with it and go hunting.

**POPS:** go find him. make him pay for it.

---

## Step 4: DOG DAYS (the HAD3S seed)

*Quest card:* start a run with the seed POPS gave you, HAD3S, and beat d0g ten times: finish a corp he's in before he takes its last node. he counts anywhere you find him.

**The LEASH** (`leash`)
> **POPS:** one more thing. you're going in with a LEASH.
> **POPS:** when d0g shows up in a corp, use it. he moves at half speed for the rest of that corp.
> **POPS:** there's more gear like it down there. pick it up.

**RAT RACE sector event card** (data/events.js `ratrace`; `{dog}` is d0g, or w00f later)
> {dog} runs {pct} of the / corps here, and the boss. / beat him to a corp's end: / don't let him take the last.

**d0g, the rival** (data/hackers.js `d0g`: G0D talking through the boy; now and then the boy slips through)
- Enters: "you again. it said you'd come."
- Taunts *(one at random)*: "every node here is ours." / "your tell is loud." / "i know where you tap." / "it sees what i see." / "you're standing in it." / "get out while you c- no. stay."
- Beaten: "the grip... slips."
- Kills you: "into the mold with you."
- Tagline: "online now."
- Codex lore: Nobody has seen d0g's face. He came out of nowhere already holding root. The ads say D0G is online now. They are always right.

Terminal after a corp with him:
- `> d0g beaten. 3 / 10 for POPS.`
- `> d0g escaped. he got the corp's last node first.`

**MYCONET** (engine/had3s.js; HAD3S's mold corp)
- Intel: "we grow the network now."
- Rules: mold covers the nodes. tap: scrape.
- Boss: a decoy grows thin too.
- Layer: `> it grows over everything. scrape it.`
- `> scraped. it will grow back.` / `> spores. the mold surges.`

**CERBERUS** (engine/heaven.js `HEAVEN.cerberus`; HAD3S's gate, and again in H3AV3N)
- Intel: "three heads. none of them sleep."
- Rules (HAD3S): tap blue eyes. red ones bite.
- Boss: thicker mold, faster eyes.
- Layer: `> 6 nodes. three eyes. one is real.` / boss: `> faster eyes. thicker mold.`
- Hint: blue: tap it. red: hands off.
- `> it looks. there.` / `> red. it bites. -1 INT.`
- Codex tell: three eyes sit on the nodes. each goes red, then blue, then moves. tap a blue eye and it looks at the real node, which blinks. tap a red one and it bites. the board is under the mold: tap a node under it to break it, then pick it.

End of the seed: `> the bottom of HAD3S. nowhere deeper to go.`

**The tenth win** (`dogtag`)
> **POPS:** that's ten.
> **POPS:** he dropped something. an old tag, with a name scratched into it.
> **POPS:** CASH OUT with it. i'll run a trace.

**At the UPLINK with the tag** (`tagUplink`)
> **POPS:** you've got his tag.
> **POPS:** CASH OUT here and bring it to me.

---

## Step 5: TRACE ROUTE

*Quest card:* POPS got a hit on the name on the DOGTAG. go see him.

**After cashing out with the tag** (`traced`)
> **POPS:** you got it out. good.
> **POPS:** i ran the name. i got a hit.
> **POPS:** come by. now.

### Cutscene `prodigal`

*POPS runs the name off the DOGTAG. the trace bounces through five relays, then dives.*

**POPS:** every time you beat d0g, i was able to inject some sniffer packets. now i can see where it comes from.

**POPS:** it doesn't end in a corp. it ends under one. MEDIX. sub-basement three.

**POPS:** i worked there, a long time ago. i patched people up.

*you go down together. the lights are out. mold up the walls, and one screen still on in the dark.*

*d0g is there, slumped in front of it. cables run out of his arms and into the wall. thin. barely breathing.*

**POPS:** kid. kid, it's me.

*nothing. POPS checks his pulse, his eyes, the cables. his hands remember what to do, even if he doesn't.*

**POPS:** he's breathing. but there's nobody home. it took all of him.

**POPS:** ...not all of him. the DISC. it was never a trail. it's him. a backup. he got it out before it took the rest.

**POPS:** i'll keep him breathing. i need you to run the restore protocols.

[ DISC >> b0y: the upload bar. A tap starts it; the mold pushes it back twice. ]

*you insert the DISC and begin the restore routines. the limp body seizes. something pushes back.*

**d0g:** no. this one is mine. you can't have hi-

**POPS:** kid. look at me.

*the eyes in the hood flicker. something in there is fighting something else.*

**d0g:** ...doc?

*nobody has called POPS that in years. only one person ever did.*

**d0g:** i found something under the corps. it was... waking up. at first i thought it was a rogue ai, some program that slipped its sandbox. by the time i saw how big it was, it was too late.

**d0g:** it isn't an ai or a corp. i'm not even sure it's digital. it's under all of them. every corp you've ever cracked, it was in there, watching you do it.

**d0g:** MEDIX grew it. right here. living racks for the server rooms. it was never supposed to think.

**d0g:** and it isn't staying in the net. look at the walls. this mold is what it leaves behind.

**d0g:** it doesn't want money. it wants the whole net quiet.

**d0g:** one mind. nothing moving that it didn't move.

**d0g:** it walked through my ICE like it wasn't there. it made me its dog. i built it a gate down here. CERBERUS. so nothing gets in. so nothing gets out.

**d0g:** while it paved me over, i dumped its garbage buffers onto that DISC. a copy of me, hidden where somebody would find it.

*POPS doesn't say anything. he just holds on to him.*

**B0Y:** don't call me d0g. that was its name for me. it's b0y.

**B0Y:** it's still out there, and it knows your face now. here's my number. when you're ready, we go get it.

---

## Step 6: OMNI RAID

*Quest card:* b0y rides with you ([b]) till the sector's done. call him in on the OMNI boss and break it with him there.

**b0y's call** (`raid`)
> **B0Y:** it's me. b0y.
> **B0Y:** OMNI was the first corp it took. from there it was only a matter of time before it spread through the rest.
> **B0Y:** i'm riding with you till we get there: tap [b] in a corp and i'm in.

**The [b] hint popup** (`raidHint`)
> that's me, down there. in a corp, tap [b] and i'm in. once a corp.

**b0y, the crew member** (data/hackers.js `b0y`)
- Enters: "doc said you'd call."
- Clues *(as the maybes drop)*: "not that one." / "closer." / "that one. trust me."
- Leaves: "lost the signal. i'm ok."
- Saving you from a snake: "{name}! hang on!"
- Tagline: "he knows the right node. he won't tap it for you."
- LVL 2: narrows it down faster.
- Codex lore: POPS's son. He went into the net after the thing waking up in the corps, and it got into him: for years he was d0g, its guard dog. He built CERBERUS for it. Every time somebody beat him, he came back a little.
- Counter: cerberus: he built it. he knows which eye is lying.

### Cutscene `gate` (OMNI breaks)

*OMNI's core comes apart. b0y is already in it, faster than you've ever seen anybody move.*

**B0Y:** it was here. for years. the corps were just its body.

**B0Y:** it moved. somewhere the corps can't touch. it calls it heaven.

*on the screen: a gate, up past the clouds. mold all over it.*

**B0Y:** the way in is a seed. H3AV3N.

**B0Y:** i'll be with you the whole way. i know its tricks. i built some of them.

---

## Step 7: G0D MODE (the H3AV3N seed)

*Quest card:* start a run with the seed H3AV3N and beat G0D. b0y goes with you.

### Sector 1

**M0LD sector event card** (data/events.js `mold`)
> something grows in {pct} / of the corps here. it / comes and goes. you can't / scrape it off. tap [b].

Event tag line: mold grows over the board. tap [b].

**b0y's [b] button** (engine/heaven.js)
- Not in a corp: `> b0y: call me in when we hit a corp.`
- Used this corp: `> b0y: lost the signal. next corp.`
- Holding the mold back: `> b0y: i'll hold it back. quick!` / too soon: `> b0y: can't. not again so soon.`
- In a market *(one at random)*: patches. lots of patches. / a BUFFER keeps you up. / reroll here. trust me. / shoes. he hates shoes. / FWALL. the eye bites. / buy now. no refunds later.
- Anywhere else *(one at random)*: the mold comes and goes. / tap [b] when you need me. / keep your INT up. patches. / the corps up here are his.
- In CERBERUS *(one at random)*: blue eye: tap it. it looks. / red eye: hands off. it bites. / the mold breaks here. dig. / i built this. wait for blue.

**CERBERUS, first layer: b0y walks you through it** (`CERB_TEACH`)
- it's growing over the nodes.
- tap the mold. it breaks here.
- the eyes. wait for blue. tap.
- that's the real one. dig it!

Without b0y: `> the mold breaks here. dig it out.` Rules here: tap blue eyes. dig the mold.
Digging: `> it breaks. it grows back. quick.`

**The broken UPLINK** (engine/runend.js `openBrokenUplink`)
> U P L I N K
> the uplink is broken.
> no way out from here.
> and nothing to pay.
>
> your mods come with you.
>
> [ P U S H   O N ]  - into H3AV3N -

Terminal: `> uplink: no signal.` Then: `> b0y: the uplink's dead. we go up.`

### Sector 2: heaven

**THE DEEP M0LD card** (data/events.js `deepmold`)
> it's everywhere up here. / you can barely see the / nodes. tap [b]: b0y holds / it back for a moment.

### G0D MAZE (engine/heaven.js `HEAVEN.maze`, engine/g0dfight.js)

- Intel: "prompt. diamond. cross. st#%age. upl@#k. wa%#..."
- Rules: follow the codex. every node is a perfect.
- b0y: the codex order. watch:
- The clue at the bottom of the board:
  `b0y: prompt. diamond. cross.`
  `     st#%age. upl@#k. wa%#...`
- Each step: `> b0y: prompt next.` (then diamond, the cross, storage unit, uplink) ... `> b0y: one more. the watcher.`
- Off the path *(in order, one per wrong step)*: hm. / not sure this is the right way. / this doesn't look right. / we're lost, man. / everything down here is wrong. / next one sends us back.
- Lost: `> b0y: hm. not sure about this.`
- `> dead end. back to the start. -1 INT.`
- `> the clock ran out. -1 INT.`
- `> out of the maze. the eye is right above you.`

**MAZE CLEARED screen:** G0D MAZE / the eye is right above you. Terminal: `> b0y: we made it. G0D is right up there.`

### G0D wakes up (heaven.js `g0dWake`)

> **G0D:** you can't defeat me.
> **G0D:** every node is mine.
> **G0D:** you are just meat.
> **b0y:** wtf. ok. start digging.

**G0D** (corp card): intel "you are just meat." Rules: the network is me.

### The fight (engine/g0dfight.js `G0DF_LINES`)

b0y's opener *(the first; the others come up during the fight)*: break the m0ld. find the (0). / find the node that looks back. / fresh mold = a node under it.

G0D, taunts *(one at random)*: you are just meat. / you are a rounding error. / every node is mine. / you are standing in me. / i saw you jack in. / your crew will forget you.

G0D, when he's low *(he glitches into corp copy)*: everyday low prices. everyday. / 70% chance of ICE. / your call is important to us. / the forecast is m0ld. / a byte is e1ght. e19ht. bits. / please hold. please hold. ple / n0de n0t f0und / have you tried turning me of

G0D, when you hit him *(one at random)*: AAGH. / you dare. / that eye cost me a sector. / it does not hurt. it does not.

Next stage:
- Stage 2: **G0D:** you made me angry. / **b0y:** he's mad. there's more of them!
- Stage 3: **G0D:** ENOUGH. I AM THE NETWORK. / **b0y:** last stretch. keep digging!

The burn: **G0D:** hands off. / **b0y:** stop digging. he's charging up.
FWALL takes a hit: `> the firewall takes it.`

**b0y's warning at 1 INT, and the FLATLINED card's tip** (`G0DF_CAUSE`)
| What hurt you | b0y warns | The card says |
|---|---|---|
| the clock | keep moving! any node heals. | the clock ate you. any node heals: keep moving. |
| lost in the maze | we're lost. the codex order! | too deep on a wrong path. follow the codex order. |
| the M0LD | it's eating your INT! scrape it! | the M0LD ate your INT. scrape it off your INT and credits before it gets there. |
| the burn | red means hands off! | you touched it in the burn. when it all goes red: hands off. |
| a corp node | only the blue (o)! | that was a corp node: it hurt you and fed him. only the blue (o) nodes open him up. |
| he got away | | he got away. hit each eye while it's blue. |

The card: FLATLINED (or HE GOT AWAY) / the tip / the maze starts over. (the fight, the final stand) / tap to go again

### The fake win (heaven.js)

> **G0D:** n0. N0. N0000.
> **G0D:** this isn't... over...

**G0D BREACHED** screen. Terminal: `> the network is yours.`

Then the crack: **G0D:** you are just meat. / **b0y:** he's not done. he's running!

### The final stand

> **b0y:** i grab his eyes. you hit 'em!

G0D, each eye you hit *(one at random)*: N0. / GRAAAH. / st0p. ST0P. / y0u c4nn0t. / th4t w4s m1ne. / #@%&!! / Y0U ARE MEAT.

Last eye: **b0y:** last one!

### G0D dies

> **G0D:** n0. n0. i AM the net.
> **G0D:** i am th3 n3t. i am th3 n%... i am

Title types in: **G0D DEFEATED** (and `..with a shoe` if you did).
Terminal: `> G0D is down. the network goes quiet.`

---

## Step 8: SYSTEM RESTORED

*Quest card:* you beat G0D. POPS has his boy back.

### Cutscene `h3av3n`: G0D IS DOWN

*G0D comes apart the way a corp does when you breach it: all at once, then nothing. its code breaks into a million pieces and scatters across the net, too small to think.*

*the mold goes with it. sector by sector the corps come back on, in their own colors, like nothing ever happened.*

*the next morning, on POPS's roof. two mugs of burnt coffee. the sun coming up over a net with nobody watching it.*

**B0Y:** doc.

**POPS:** kid.

*neither of them says much. they don't need to.*

**B0Y:** here. i pulled this out of MEDIX on my way out of sub-basement three. the autotechs brought me back with it more times than i can count.

**B0Y:** a 1UP. go down with it and it brings you back to the start of the corp, the way you went in. it charges up again every sector.

**POPS:** and now that the mold's gone, the seeds hold still. type one in and the net comes up the same, every time. send one to a friend. see who gets deeper.

**POPS:** i've kept a log of every run you've made. your best ones are in there. run them again. see how deep you get.

**B0Y:** come on, doc. let's go crack a corp.

**POPS:** one. then breakfast.

*G0D's mark is still burned into a few old terminals, an eye that doesn't see anything anymore. it's yours now. wear it.*

*and you? you've got a seed to type in.*

**Text in the ending's art** (asxii_art, `n_cutscene_04_ending`)
- MEDIX // CRASH UNIT 03, a cable marked SB-3
- The terminal: `> seed: ________` / log: 01 H4D3S depth 12 / 02 KITCHEN depth 9 / 03 ZER0 depth 7 / 04 ...

### H3AV3N CLEARED screen (heaven.js `heavenRewards`)

> G0D
> ..with a shoe *(if you did)*
> G0D never touched you. *(if it didn't)*
> unlocked:
> 1UP       b0y's crash unit
> REPLAYS   POPS's log, on the title
> G0D       its logo, yours
> [ CONTINUE ]

Terminal: `> b0y: we did it. it's quiet now.`

### POPS's call

> **POPS:** kid. you did it. G0D is down.
> **POPS:** b0y's up here with me. he says hi.
> **POPS:** the net is yours. go again?

---

## After the quest: w00f

Once b0y is on your crew, w00f turns up where d0g used to (data/hackers.js `w00f`).
- Enters: WATCHDOG ONLINE.
- Taunts *(one at random)*: INTRUDER. / GATE HOLDS. / NO ONE IN. NO ONE OUT. / w00f. / STILL GUARDING.
- Beaten: WATCHDOG... RESTARTING.
- Kills you: INTRUDER REMOVED.
- Tagline: the dog without the boy.
- Codex lore: When b0y walked out of HAD3S, the dog kept running. It is everything d0g was, with nobody inside it: it guards the gate, reads the tell, and says one word.
