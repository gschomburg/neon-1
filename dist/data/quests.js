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
NEON_FILES.push(['data/quests.js', 'v14.24']);

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

// A scene's music (the user, 2026-11-04): its song, and a new pick of level and stage every step ms from the frame's mood
// (engine/quests.js sceneMusic). Another one to try for a lighter scene: EVENT HORIZON (eventhorizon).
const SCENE_MUSIC = {
  disc: { song: 'pantheon', step: 6000, mood: { levels: [0, 1], stages: 'A' } },
};
const QUEST_SCENES = {
  // H3AV3N: G0D is down (a placeholder: docs/ENDGAME.md has the real ending to write)
  h3av3n: [
    { title: ['G0D IS DOWN', 'H3AV3N'] },
    { text: 'the network goes quiet. for the first time in years, nothing is watching.' },
    { who: 'pops', text: 'kid. you did it.' },
    { text: 'b0y logs off. across town, a light comes back on in a back room behind a laundromat.' },
    { text: '(the real cutscene goes here: docs/ENDGAME.md)' },
    { title: ['THANKS FOR PLAYING', 'NeoN+1'] },
    { title: ['CREDITS', '(the credits go here)'] },
    { title: ['THERE IS MORE TO EXPLORE', 'the net is still out there.'] },
    { title: ['UNLOCKED: SEEDS FOR REAL', 'replayed seeds count now. already paid.'] },
  ],
  // SAFEHOUSE: you bring POPS the DISC
  // A strip scene (the user, 2026-11-04): one tall page that scrolls up (engine/quests.js buildStrip).
  // pic: { art: a data/scene_art.js canvas (drawn in asXii, copied by tools/scene_art.js), rows: the canvas rows it
  //   takes, hold: ms the page waits on it once it's in, before the text and the scroll, layers }; or { logo: a
  //   hacker's id } for their logo (data/art/logos.js), glitching in.
  // A layer, back to front: n = its name in the save; col = a palette color (C.*, or 'ink:pops' for a hacker's);
  //   at / dur = ms it starts / takes to draw in (default: one after another); from: 'bottom' or 'top' (default);
  //   flicker = marks flicker as they come; par = parallax (0.5 = scrolls half as fast: it sinks behind what's in
  //   front, never past its own bottom row); solid = hides the layers behind it (between its first and last mark
  //   on each row); lights = { ch: the marks that are lights, col, rate: ms, off: share off at a time, offCh };
  //   cue = { match: the marks that stay dark, word: the word in the text that turns them on (they glitch on),
  //   col }; slide = { from: [dx, dy], at, ms, sound }: it slides in from there once drawn; spin = { ch, after }:
  //   those marks spin (cycle) once it's in; fog = { rows, density, drift } in place of n: a band of dots;
//   fly = [{ art, y, speed: columns a second, every: ms, delay }] in place of n: things crossing right to left, off
//   the grid; hide = strings of the layer not to draw; glow = { x, y, rows, spread, col, alpha }: a lamp's cone down;
//   blink = { match, to, every, ms }: those marks swap now and then (eyes); smoke = { x, y, dx, dy, every, life }:
//   puffs drifting off a point; lights also take pulse (share that breathe instead), period, level (how bright);
//   ember = { x, y, col, every, ms }: one mark glows up now and then (a cigarette's tip); slide.to = where it ends
//   (default: where it's drawn); cut = { a, b, c, rows }: hides what's behind where a*x + b*y >= c on those rows (the
//   slot's far side); progress = { after, ch, at, ms, col }: the mark after `after` on each row (if it's one of ch)
//   lights up top to bottom, then they spin; off = [dx, dy]: drawn that far from where it sits in the save.
//   Sounds: slide.startSound / slide.sound (as it starts / lands), progress.sound (as it starts): Sound.* names.
//   tics = { swap: [[from, to]], col }: a glitchy logo (rows tear, marks swap, clusters flash to noise);
//   pic.look = layer options for a logo.
//   mood (on any frame) = { levels, stages }: what the scene's music wanders between from that frame on (SCENE_MUSIC).
  disc: [
    { title: ['WHAT IS ALL THIS FOR?', 'step 2: SAFEHOUSE'], mood: { levels: [0], stages: 'A' } },
    // the laundromat first, then the city behind it, all flickering on in place; a beat; then the page pans down
    { pic: { art: 'disc', rows: [6, 39], hold: 900, layers: [
      { n: 'a skyline 2 way back', col: 'dim', par: 0.6, at: 1500, dur: 1000, from: 'bottom', flicker: true },
      { fly: [{ art: '-=', y: 15, speed: 2.2, every: 17000, delay: 5000 }, { art: '=-', y: 21, speed: 1.5, every: 23000, delay: 14000 }],
        col: 'dim', par: 0.6, at: 1500 },
      { fog: { rows: [18, 27], density: 0.14, drift: 0.3 }, col: 'dim', par: 0.45, at: 1800, dur: 1000, from: 'bottom' },
      { fly: [{ art: '<=>', y: 17, speed: 4.5, every: 12000, delay: 9500 }, { art: '<o>', y: 11, speed: 6.5, every: 15000, delay: 3000 },
        { art: '<=>', y: 20, speed: 3.5, every: 19000, delay: 16000 }], col: 'mid', par: 0.3, at: 1000 },
      { n: 'a_skyline', col: 'mid', par: 0.3, at: 1000, dur: 1000, from: 'bottom', flicker: true, hide: ['<=>', '` \''],
        lights: { ch: 'o$*OM', col: 'money', rate: 2600, off: 0.45, pulse: 0.45, period: 2400, level: 0.55 } },
      { n: 'a_laundromat', col: 'text', solid: true, at: 0, dur: 1000, from: 'bottom', flicker: true,
        glow: { x: 21, y: 29, rows: 9, spread: 0.85, col: 'money', alpha: 0.12 },
        cue: { match: '~open', word: 'OPEN', col: 'accent' } }] },
      text: "POPS's safehouse is a back room behind a laundromat that closed years ago. the sign still flickers OPEN.", mood: { levels: [0, 1], stages: 'A' } },
    { text: 'inside it smells like solder and burnt coffee. three monitors, two of them dead. a cot nobody makes. cables everywhere, taped down where people trip.' },
    { pic: { art: 'disc', rows: [49, 64], layers: [
      { n: 'a pops bg', col: 'mid', lights: { ch: '01x+', col: 'accent', rate: 700, off: 0.35 } },
      { n: 'a_pops sit', col: 'bright', blink: { match: '60', to: '--' }, hide: ['~'],   // (his cigarette: - ; the ~ off it is the smoke, animated)
        smoke: { x: 12, y: 56, dx: -2, dy: -5, every: 750 }, ember: { x: 13, y: 56, col: 'danger', every: 4800, ms: 1300 } }] },
      who: 'pops', text: "you brought it. let's see it.", mood: { levels: [1], stages: 'AB' } },
    { text: "you hand him the DISC. his hands shake, just a little. you've never seen them do that.", mood: { levels: [1, 2], stages: 'AB' } },
    // the DISC slides into the slot, the drive spins up
    // (it slides down and to the right, half into the slot; the o's and 0's on its edge light up like a progress bar)
    { pic: { art: 'disc', rows: [76, 88], layers: [
      { n: 'hand disc', col: 'text', dur: 500, slide: { from: [-3, -3], at: 200, ms: 1300, startSound: 'vcrIn', sound: 'vcrClunk' },
        progress: { after: '//', ch: 'o0', at: 2200, ms: 1800, col: 'accent', sound: 'vcrSpin' } },
      { n: 'slot', col: 'mid', at: 0, dur: 400, off: [-3, -3], cut: { a: 1, b: 1, c: 101, rows: [80, 88] } }] },
      text: 'the DISC goes in. an old drive coughs, then spins up.', mood: { levels: [2], stages: 'B' } },
    // POPS, close (Claude's headshot: ascii-editor/saves/n_cutscene_01_pops_head), his gear blinking behind him
    { pic: { art: 'popshead', rows: [0, 14], layers: [
      { n: 'head lights', col: 'mid', lights: { ch: 'o', col: 'accent', rate: 520, off: 0.45, offCh: '.' } },
      { n: 'head', col: 'bright', at: 300, dur: 900, blink: { match: '[_@_]-[_@_]', to: '[_-_]-[_-_]' }, smoke: { x: 9, y: 8, dx: -4, dy: -6 } }] },
      who: 'pops', text: "...this was my boy's. he carried it everywhere.", mood: { levels: [0, 1], stages: 'A' } },
    { who: 'pops', text: 'he went into the net years back. never came out.' },
    { text: "he doesn't look at you while he says it. he's looking at the label." },
    { who: 'pops', text: "it's encrypted. but there's a trail on it: an old terminal, somewhere deep.", mood: { levels: [1, 2], stages: 'B' } },
    // d0g's logo glitches: his d flips to a b now and then, flashes in b0y's blue (he's POPS's boy: docs/QUESTS.md)
    { pic: { logo: 'd0g', look: { tics: { swap: [['d', 'b']], col: '#4aa8ff' } } }, who: 'pops', text: 'and one name all over the logs. d0g.', mood: { levels: [2, 3], stages: 'B' } },
    { text: 'his jaw sets. the shake is gone.', mood: { levels: [2, 3], stages: 'BC' } },
    { who: 'pops', text: 'if d0g did something to my boy, i want him to feel it.', mood: { levels: [3], stages: 'C' } },
    { who: 'pops', text: 'go find him. make him pay for it.' },
  ],
};
