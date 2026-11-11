# NeoN+1 quest dialog

Every quest's calls and scenes, as a script. **This file is generated:** the words live in `dist/data/quests.js`.
Edit them there, then run `node tools/data/quest_dialog.js` to rewrite this file.

## SYSTEM FAILURE

From POPS.

### Steps

1. **PROVE IT**: POPS is on your crew now. beat a sector boss and show him what you've got.
2. **THE DISC**: POPS wants an old DISC found. try MEDIX: its corp boss always has one. it can turn up anywhere loot drops, markets too.
   - Holding the item, **GET OUT WITH THE DISC**: you have the DISC. beat the sector boss, then CASH OUT at the UPLINK with it.
   - After losing the item: you lost the DISC. another copy is out there. try MEDIX again, or any loot node, market or the PIER.
3. **SAFEHOUSE**: you cashed out with the DISC. take it to POPS.
4. **DOG DAYS**: start a run with the seed POPS gave you, HAD3S, and beat d0g ten times: finish a corp he's in before he takes its last node. he counts anywhere you find him.
5. **TRACE ROUTE**: POPS got a hit on the serial on the DOGTAG. go see him.
6. **OMNI RAID**: b0y rides with you ([b]) till the sector's done. call him in on the OMNI boss and break it with him there.
7. **G0D MODE**: start a run with the seed H3AV3N and beat G0D. b0y goes with you.
8. **SYSTEM RESTORED**: you beat G0D. POPS has his boy back.

### Calls

**joined**

> **POPS:** you called. i came. that's how a crew works, kid.  
> **POPS:** i'm on yours now. no charge.  
> **POPS:** my own calls'll turn up in markets and loot.  
> **POPS:** clear a sector and we'll talk. something's off in the net lately. i want to know you can handle it.  

**sector**

> **POPS:** that's a sector. not bad, kid.  
> **POPS:** i've been watching the net. corps going quiet. something growing in the logs, like mold.  
> **POPS:** MEDIX runs hottest. break MEDIX if you see it.  
> **POPS:** and keep an eye out for any MEDIX tech. there might be some data we can scrape.  

**shop**

> **POPS:** kid. that DISC in the market. it's a MEDIX archive.  
> **POPS:** buy it. i'm good for it. mostly.  

**found**: You pick up the DISC for the first time.

> **POPS:** kid. that disc you just picked up.  
> **POPS:** i recognize that hash. don't lose it.  
> **POPS:** take it through the next checkpoint: beat the sector boss and CASH OUT at the UPLINK with it.  
> **POPS:** then bring it to me.  

**foundOld**: You pick up the DISC again (you had one before).

> **POPS:** the disc. you've got it again.  
> **POPS:** beat the sector boss, CASH OUT at the UPLINK with it.  

**foundAgain**: You pick up the DISC after dying with one.

> **POPS:** you lost it last time. there was another copy out there.  
> **POPS:** this time: sector boss, then CASH OUT with it.  

**uplink**: You reach the UPLINK with the DISC.

> **POPS:** you made the checkpoint with the disc.  
> **POPS:** CASH OUT here and bring it to me.  

**deliver**: The results, after cashing out with the DISC. Buttons: [ TAKE IT TO POPS ] / [ LATER ].

> **POPS:** you made it out with the disc.  
> **POPS:** come by the safehouse. let's see what's on it.  

**dogtag**

> **POPS:** that's ten.  
> **POPS:** he dropped something. an old tag, with a serial scratched into it.  
> **POPS:** CASH OUT with it. i'll run a trace.  

**leash**

> **POPS:** one more thing. you're going in with a LEASH.  
> **POPS:** when d0g shows up in a corp, use it. he moves at half speed for the rest of that corp.  
> **POPS:** there's more gear like it down there. pick it up.  

**tagUplink**

> **POPS:** you've got his tag.  
> **POPS:** CASH OUT here and bring it to me.  

**traced**

> **POPS:** you got it out. good.  
> **POPS:** i ran the serial. i got a hit.  
> **POPS:** come by. now.  

**raid**

> **B0Y:** it's me. b0y.  
> **B0Y:** OMNI was the first corp it took. from there it was only a matter of time before it spread through the rest.  
> **B0Y:** i'm riding with you till we get there: tap [b] in a corp and i'm in.  

**raidHint**

> **B0Y:** that's me, down there. in a corp, tap [b] and i'm in. once a corp.  

### Scenes

#### G0D IS DOWN: H3AV3N (`h3av3n`)

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

#### SYSTEM FAILURE: step 3: SAFEHOUSE (`disc`)

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

#### SYSTEM FAILURE: step 5: TRACE ROUTE (`prodigal`)

*POPS runs the serial off the DOGTAG. the trace bounces through five relays, then dives.*

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

#### SYSTEM FAILURE: HEAVEN'S GATE (`gate`)

*OMNI's core comes apart. b0y is already in it, faster than you've ever seen anybody move.*

**B0Y:** it was here. for years. the corps were just its body.

**B0Y:** it moved. somewhere the corps can't touch. it calls it heaven.

*on the screen: a gate, up past the clouds. mold all over it.*

**B0Y:** the way in is a seed. H3AV3N.

**B0Y:** i'll be with you the whole way. i know its tricks. i built some of them.
