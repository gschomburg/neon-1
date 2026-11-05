# NeoN+1 quest dialog

Every quest's calls and scenes, as a script. **This file is generated:** the words live in `dist/data/quests.js`.
Edit them there, then run `node tools/quest_dialog.js` to rewrite this file.

## WHAT IS ALL THIS FOR?

From POPS.

### Steps

1. **THE DISC**: beat a sector boss with the DISC in your gear, then CASH OUT at the UPLINK.
   - After losing the item: you lost the DISC. another copy is out there: loot nodes, markets, the PIER.
2. **SAFEHOUSE**: you cashed out with the DISC. take it to POPS.
3. **DOG DAYS**: start a run with the seed POPS gave you, HAD3S, and beat d0g ten times: finish a corp he's in before he takes its last node. he counts anywhere you find him.
4. **TRACE ROUTE**: POPS got a hit on the name on the DOGTAG. go see him.
5. **OMNI RAID**: b0y is on your crew. call him in on an OMNI boss (his CALL, or a plain one) and break it with him there.
6. **G0D MODE**: start a run with the seed H3AV3N and beat G0D. b0y goes with you.
7. **WHAT IT WAS ALL FOR**: you beat G0D. POPS has his boy back.

### Calls

**found**: You pick up the DISC for the first time.

> **POPS:** kid. that disc you just picked up.  
> **POPS:** i know that label. don't lose it.  
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
> **POPS:** he dropped something. an old tag, with a name scratched into it.  
> **POPS:** CASH OUT with it. i'll run a trace.  

**tagUplink**

> **POPS:** you've got his tag.  
> **POPS:** CASH OUT here and bring it to me.  

**traced**

> **POPS:** you got it out. good.  
> **POPS:** i ran the name. i got a hit.  
> **POPS:** come by. now.  

**raid**

> **POPS:** it's me. b0y.  
> **POPS:** it hid inside OMNI for years. call me in on one and i'll find where it went.  

### Scenes

#### G0D IS DOWN: H3AV3N (`h3av3n`)

*the network goes quiet. for the first time in years, nothing is watching.*

**POPS:** kid. you did it.

*b0y logs off. across town, a light comes back on in a back room behind a laundromat.*

*(the real cutscene goes here: docs/ENDGAME.md)*

#### WHAT IS ALL THIS FOR?: step 2: SAFEHOUSE (`disc`)

*POPS's safehouse is a back room behind a laundromat that closed years ago. the sign still flickers OPEN.*

*inside it smells like solder and burnt coffee. three monitors, two of them dead. a cot nobody makes. cables everywhere, taped down where people trip.*

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

#### WHAT IS ALL THIS FOR?: step 4: TRACE ROUTE (`prodigal`)

*POPS runs the name off the DOGTAG. the trace bounces through five relays, then dives.*

**POPS:** it doesn't end in a corp. it ends under one. MEDIX. sub-basement three.

**POPS:** i worked there, a long time ago. i patched people up.

*you go down together. the lights are out. mold up the walls, and one screen still on in the dark.*

*d0g is there, wired into it. he doesn't run.*

**d0g:** you're the one who keeps beating me.

**POPS:** kid. look at me.

*the eyes in the hood flicker. something in there is fighting something else.*

**d0g:** ...doc?

*nobody has called POPS that in years. only one person ever did.*

**d0g:** i went in after it. something in the corps was waking up. i wanted to see it first.

**d0g:** it saw me first. it got in. it made me its dog.

**d0g:** i built it a gate down there. CERBERUS. so nothing gets in. so nothing gets out.

**d0g:** every time you beat me, its grip slipped. a little more of me came back.

**d0g:** the DISC was me. a backup. i got it out where somebody would find it.

*POPS doesn't say anything. he just holds on to him.*

**B0Y:** don't call me d0g. that was its name for me. it's b0y.

**B0Y:** it's still out there. here's my number. when you're ready, we go get it.

#### WHAT IS ALL THIS FOR?: HEAVEN'S GATE (`gate`)

*OMNI's core comes apart. b0y is already in it, faster than you've ever seen anybody move.*

**B0Y:** it was here. for years. the corps were just its body.

**B0Y:** it moved. somewhere the corps can't touch. it calls it heaven.

*on the screen: a gate, up past the clouds. mold all over it.*

**B0Y:** the way in is a seed. H3AV3N.

**B0Y:** i'll be with you the whole way. i know its tricks. i built some of them.
