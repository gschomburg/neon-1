# NeoN+1 quest dialog

Every quest's calls and scenes, as a script. **This file is generated:** the words live in `dist/data/quests.js`.
Edit them there, then run `node tools/quest_dialog.js` to rewrite this file.

## WHAT IS ALL THIS FOR?

From POPS.

### Steps

1. **THE DISC**: beat a sector boss with the DISC in your gear, then CASH OUT at the UPLINK.
   - After losing the item: you lost the DISC. another copy is out there: loot nodes, markets, the PIER.
2. **SAFEHOUSE**: you cashed out with the DISC. take it to POPS.
3. **DOG DAYS**: POPS wants d0g beaten. ten times. (this step is coming soon.)

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

### Scenes

#### WHAT IS ALL THIS FOR?: step 2: SAFEHOUSE (`disc`)

*POPS's safehouse is a back room behind a laundromat that closed years ago. the sign still flickers OPEN.*

*inside it smells like solder and burnt coffee. three monitors, two of them dead. a cot nobody makes. cables everywhere, taped down where people trip.*

**POPS:** you brought it. let's see it.

*you hand him the DISC. his hands shake, just a little. you've never seen them do that.*

```
.-------.
|  (o)  |
'-------'
```

*the DISC goes in. an old drive coughs, then spins up.*

**POPS:** ...this was my boy's. he carried it everywhere.

**POPS:** he went into the net years back. never came out.

*he doesn't look at you while he says it. he's looking at the label.*

**POPS:** it's encrypted. but there's a trail on it: an old terminal, somewhere deep.

**POPS:** and one name all over the logs. d0g.

*his jaw sets. the shake is gone.*

**POPS:** if d0g did something to my boy, i want him to feel it.

**POPS:** beat d0g. ten times. then we talk.
