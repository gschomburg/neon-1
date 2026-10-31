// NeoN+1 data/quests.js: everything the quests say. Edit the words here; engine/quests.js runs the quest.
// The design: docs/QUESTS.md.
//
// QUEST_INFO: each quest's name, who it's from, and its steps in order. A step:
//   key:  what engine/quests.js calls it (don't rename)
//   name: the step's name (THE BOARD > QUESTS shows "STEP 2: SAFEHOUSE")
//   goal: the objective, plainly (THE BOARD > QUESTS)
//   lost: (optional) the objective after you die holding the quest item
// QUEST_LINES: what POPS says on his CALLS. Each is a list of lines; each line wraps in the box.
// QUEST_SCENES: the cutscenes, a frame per tap:
//   who:  a hacker id (pops, d0g...): their face and name show, and the line is them talking
//         (no who: the narrator, in plain grey)
//   text: the line (it wraps; keep it under ~4 lines)
//   art:  (optional) a few lines of ASCII over the text
//   title: (optional) a title card: big text, no face
'use strict';
NEON_FILES.push(['data/quests.js', 'v13.92']);

const QUEST_INFO = {
  pops: {
    name: 'WHAT IS ALL THIS FOR?', from: 'POPS',
    steps: [
      { key: 'find', name: 'THE DISC', goal: 'beat a sector boss with the DISC in your gear, then CASH OUT at the UPLINK.',
        lost: 'you lost the DISC. another copy is out there: loot nodes, markets, the PIER.' },
      { key: 'deliver', name: 'SAFEHOUSE', goal: 'you cashed out with the DISC. take it to POPS.' },
      { key: 'd0g', name: 'DOG DAYS', goal: 'POPS wants d0g beaten. ten times. (this step is coming soon.)' },
      // still to build (docs/QUESTS.md): TRACE ROUTE, PRODIGAL, NEW BLOOD, OMNI RAID, HEAVEN'S GATE, G0D MODE
    ],
  },
};

const QUEST_LINES = {
  // you pick up the DISC for the first time
  found: ["kid. that disc you just picked up.", "i know that label. don't lose it.", "take it through the next checkpoint: beat the sector boss and CASH OUT at the UPLINK with it.", "then bring it to me."],
  // you pick it up again (you'd had it before)
  foundOld: ["the disc. you've got it again.", "beat the sector boss, CASH OUT at the UPLINK with it."],
  // you pick it up after dying with one
  foundAgain: ["you lost it last time. there was another copy out there.", "this time: sector boss, then CASH OUT with it."],
  // the UPLINK, holding it
  uplink: ["you made the checkpoint with the disc.", "CASH OUT here and bring it to me."],
  // the results after cashing out with it ([ TAKE IT TO POPS ] / [ LATER ])
  deliver: ["you made it out with the disc.", "come by the safehouse. let's see what's on it."],
};

const QUEST_SCENES = {
  // SAFEHOUSE: you bring POPS the DISC
  disc: [
    { title: ['WHAT IS ALL THIS FOR?', 'step 2: SAFEHOUSE'] },
    { text: "POPS's safehouse is a back room behind a laundromat that closed years ago. the sign still flickers OPEN." },
    { text: 'inside it smells like solder and burnt coffee. three monitors, two of them dead. a cot nobody makes. cables everywhere, taped down where people trip.' },
    { who: 'pops', text: "you brought it. let's see it." },
    { text: "you hand him the DISC. his hands shake, just a little. you've never seen them do that." },
    { text: 'the DISC goes in. an old drive coughs, then spins up.', art: ['.-------.', '|  (o)  |', "'-------'"] },
    { who: 'pops', text: "...this was my boy's. he carried it everywhere." },
    { who: 'pops', text: 'he went into the net years back. never came out.' },
    { text: "he doesn't look at you while he says it. he's looking at the label." },
    { who: 'pops', text: "it's encrypted. but there's a trail on it: an old terminal, somewhere deep." },
    { who: 'pops', text: 'and one name all over the logs. d0g.' },
    { text: 'his jaw sets. the shake is gone.' },
    { who: 'pops', text: 'if d0g did something to my boy, i want him to feel it.' },
    { who: 'pops', text: 'beat d0g. ten times. then we talk.' },
  ],
};
