// NeoN+1 data/quests.js: everything the quests say. Edit the words here; engine/quests.js runs the quest.
// The design: docs/QUESTS.md.
//
// QUEST_INFO: each quest's name, who it's from, and its steps in order. A step:
//   key:  what engine/quests.js calls it (don't rename)
//   name: the step's name (THE BOARD > QUESTS shows "STEP 2: SAFEHOUSE")
//   goal: the objective, plainly (THE BOARD > QUESTS)
//   lost: (optional) the objective after you die holding the quest item
//   held: (optional) { name, goal } while you hold the step's carry item (THE DISC: "get out with the disc")
// How a step ends (engine/quests.js reads these; the next step is the next one in the list):
//   carry: cash out holding this loot (its key) and the step is done. While you hold it, the UPLINK says so.
//   uplinkLine: what POPS says at the UPLINK while you carry it (a QUEST_LINES key)
//   doneLine: what POPS says when you cash out with it (a QUEST_LINES key); its button is the next step's goTo
//   scene: the cutscene that ends this step (a QUEST_SCENES id). Then a QUEST card shows the next step.
//   goTo: the words on the button that plays the scene (THE BOARD > QUESTS, and the call before it)
//   crew: a hacker who joins your crew when this step ends
// What happens during a step (the DISC dropping, d0g's wins, the OMNI raid) is code in engine/quests.js.
// QUEST_LINES: what POPS says on his CALLS. Each is a list of lines; each line wraps in the box.
// QUEST_SCENES: the cutscenes, a frame per tap:
//   who:  a hacker id (pops, d0g...): their face and name show, and the line is them talking
//         (no who: the narrator, in plain grey)
//   text: the line (it wraps; keep it under ~4 lines)
//   art:  (optional) a few lines of ASCII over the text
//   title: (optional) a title card: big text, no face
'use strict';
NEON_FILES.push(['data/quests.js', 'v14.74']);

const QUEST_INFO = {
  pops: {
    // (the user, 2026-11-06: was WHAT IS ALL THIS FOR?; the quest runs on past b0y to G0D and the end of the game)
    name: 'SYSTEM FAILURE', from: 'POPS',
    steps: [
      // (the user, 2026-11-06) POPS joins your crew: this step opens. Clear a sector and the DISC step starts.
      { key: 'sector', name: 'PROVE IT', goal: "POPS is on your crew now. beat a sector boss and show him what you've got." },
      // MEDIX is a hint, not the only place: the DISC drops anywhere loot does (MEDIX's corp boss always has one)
      { key: 'find', name: 'THE DISC', carry: 'disc', uplinkLine: 'uplink', doneLine: 'deliver',
        goal: 'POPS wants an old DISC found. try MEDIX: its corp boss always has one. it can turn up anywhere loot drops, markets too.',
        held: { name: 'GET OUT WITH THE DISC', goal: 'you have the DISC. beat the sector boss, then CASH OUT at the UPLINK with it.' },
        lost: 'you lost the DISC. another copy is out there. try MEDIX again, or any loot node, market or the PIER.' },
      { key: 'deliver', name: 'SAFEHOUSE', scene: 'disc', goTo: 'TAKE IT TO POPS', goal: 'you cashed out with the DISC. take it to POPS.' },
      { key: 'd0g', name: 'DOG DAYS', carry: 'dogtag', uplinkLine: 'tagUplink', doneLine: 'traced', goal: "start a run with the seed POPS gave you, HAD3S, and beat d0g ten times: finish a corp he's in before he takes its last node. he counts anywhere you find him.", seed: 'HAD3S', wins: 10 },
      { key: 'trace', name: 'TRACE ROUTE', scene: 'prodigal', goTo: 'GO TO POPS', crew: 'b0y', goal: 'POPS got a hit on the name on the DOGTAG. go see him.' },
      { key: 'raid', name: 'OMNI RAID', scene: 'gate', goal: "b0y rides with you ([b]) till the sector's done. call him in on the OMNI boss and break it with him there." },
      { key: 'g0d', name: 'G0D MODE', goal: 'start a run with the seed H3AV3N and beat G0D. b0y goes with you.', seed: 'H3AV3N' },
      { key: 'done', name: 'SYSTEM RESTORED', goal: 'you beat G0D. POPS has his boy back.' },
    ],
  },
};

const QUEST_LINES = {
  // the first time you CALL him in (a real run): he joins your crew, free (engine/quests.js questCalled)
  joined: ["you called. i came. that's how a crew works, kid.", "i'm on yours now. no charge.", "my own calls'll turn up in markets and loot.",
    "clear a sector and we'll talk. something's off in the net lately. i want to know you can handle it."],
  // PROVE IT: you clear a sector with him on your crew. The mold, before the quest gets there (the user, 2026-11-06).
  sector: ["that's a sector. not bad, kid.", "i've been watching the net. corps going quiet. something growing in the logs, like mold.",
    "MEDIX runs hottest. there's an old DISC in there i want back.", "break MEDIX if you see it. it could turn up anywhere, though."],
  // the DISC for sale in a market (once a market)
  shop: ["kid. that DISC in the market. that's the one.", "buy it. i'm good for it. mostly."],
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
  // DOG DAYS: the DOGTAG drops (ten wins), the UPLINK holding it, cashing out with it
  dogtag: ["that's ten.", "he dropped something. an old tag, with a name scratched into it.", "CASH OUT with it. i'll run a trace."],
  // HAD3S, your first run of it: the LEASH you go in with (engine/quests.js questRunStart)
  leash: ["one more thing. you're going in with a LEASH.", "when d0g shows up in a corp, use it. he moves at half speed for the rest of that corp.", "there's more gear like it down there. pick it up."],
  tagUplink: ["you've got his tag.", "CASH OUT here and bring it to me."],
  traced: ["you got it out. good.", "i ran the name. i got a hit.", "come by. now."],
  // OMNI RAID: b0y, once he's on your crew (each run while the step is on: you start with his CALL)
  raid: ["it's me. b0y.", "it hid inside OMNI for years. i'm riding with you till we get there: tap [b] in a corp and i'm in."],
  // ...and right after that call, a popup like the training's, in his blue, its arrow on his [b] (engine/heaven.js boyTrayHint)
  raidHint: ["that's me, down there. in a corp, tap [b] and i'm in. once a corp."],
};

// A scene's music (the user, 2026-11-04): its song, and a new pick of level and stage every step ms from the frame's mood
// (engine/quests.js sceneMusic). Another one to try for a lighter scene: EVENT HORIZON (eventhorizon).
const SCENE_MUSIC = {
  disc: { song: 'pantheon', step: 6000, mood: { levels: [0, 1], stages: 'A' } },
  prodigal: { song: 'eventhorizon', step: 7000, mood: { levels: [0], stages: 'A' } },   // (the user: EVENT HORIZON, a lighter cutscene track)
  gate: { song: 'pantheon', step: 6000, mood: { levels: [2], stages: 'B' } },
  h3av3n: { song: 'eventhorizon', step: 7000, mood: { levels: [0], stages: 'A' } },
};
const QUEST_SCENES = {
  // THE ENDING (docs/ENDGAME.md, the user 2026-11-05): G0D is gone for good (its code broken up across the net: the
  // seed of a G0D.exe quest later). Dawn over the city, POPS and b0y on the roof, the two rewards handed over (b0y: the
  // 1UP, out of MEDIX; POPS: the seeds hold still now, and his log of your runs, REPLAYS), G0D's mark (its logo, yours
  // to wear), your logo, the credits. More to do: every seed has a board (the seed leaderboard, docs/ENDGAME.md).
  // Placeholder art (Claude's): asxii_art/n_cutscene_04_ending, to redraw.
  h3av3n: [
    { title: ['G0D IS DOWN', 'H3AV3N'], mood: { levels: [0], stages: 'A' } },
    { pic: { art: 'ending', rows: [0, 11], hold: 1200, layers: [
      { n: 'sun', col: 'money', at: 700, dur: 900, from: 'bottom', slide: { from: [0, 3], at: 0, ms: 3600 } },
      { n: 'skyline', col: 'mid', solid: true, at: 0, dur: 1100, from: 'bottom', flicker: true,
        lights: { ch: 'o', col: 'money', rate: 900, off: 0.55, level: 0.7 } },
      { n: 'street', col: 'dim', at: 300, dur: 700 }] },
      text: 'G0D comes apart the way a corp does when you breach it: all at once, then nothing. its code breaks into a million pieces and scatters across the net, too small to think.' },
    { text: 'the mold goes with it. sector by sector the corps come back on, in their own colors, like nothing ever happened.', mood: { levels: [0, 1], stages: 'A' } },
    { pic: { art: 'ending', rows: [16, 25], hold: 600, layers: [
      { n: 'roof sky', col: 'dim', lights: { ch: '.', col: 'bright', rate: 1500, off: 0.5 } },
      { n: 'roof', col: 'dim', at: 0, dur: 600 },
      { n: 'people', col: 'text', at: 300, from: 'bottom', flicker: true, blink: { match: 'o o', to: '- -' } },
      { n: 'mugs', col: 'mid', at: 900, smoke: { x: 15, y: 19, dx: -1, dy: -3, every: 900, life: 2400 } }] },
      text: "the next morning, on POPS's roof. two mugs of burnt coffee. the sun coming up over a net with nobody watching it." },
    { who: 'b0y', text: 'doc.' },
    { who: 'pops', text: 'kid.' },
    { text: "neither of them says much. they don't need to." },
    { pic: { art: 'ending', rows: [30, 39], layers: [
      { n: 'cable', col: 'dim' },
      { n: 'unit', col: 'text', glitch: true, dur: 900, lights: { ch: '*', col: 'danger', rate: 600, off: 0.4, pulse: 1, period: 900 },
        cue: { match: '[ 1UP ]', word: 'back', col: 'money' } }] },
      who: 'b0y', text: 'here. i pulled this out of MEDIX on my way out of sub-basement three. they brought me back with it more times than i can count.', mood: { levels: [1], stages: 'A' } },
    { who: 'b0y', text: "a 1UP. go down with it and it brings you back to the start of the corp, the way you went in. it charges up again every sector." },
    { pic: { art: 'ending', rows: [44, 53], layers: [
      { n: 'terminal', col: 'text', flicker: true, dur: 800, cue: { match: ': ________', word: 'seeds', col: 'accent' } }] },
      who: 'pops', text: "and now that the mold's gone, the seeds hold still. type one in and the net comes up the same, every time. send one to a friend. see who gets deeper." },
    { who: 'pops', text: "i've kept a log of every run you've made. your best ones are in there. run them again. see how deep you get." },
    { who: 'b0y', text: "come on, doc. let's go crack a corp.", mood: { levels: [1, 2], stages: 'AB' } },
    { who: 'pops', text: 'one. then breakfast.' },
    { pic: { logo: 'g0d', name: 'the net', style: { fg: '#4aa8ff', bg: '#0a1626' } },
      text: "G0D's mark is still burned into a few old terminals, an eye that doesn't see anything anymore. it's yours now. wear it." },
    { pic: { logo: '@you' }, text: "and you? you've got a seed to type in." },
    { title: ['THERE IS MORE TO EXPLORE', 'the net is still out there.', '', 'every seed has a board.', 'race your friends on one.'] },
    { title: ['THANKS FOR PLAYING', 'NeoN+1'] },
    { title: ['CREDITS', 'made by', 'greg schomburg', 'and claude', '', 'playtesting', 'justin bakse', 'and friends'] },
    { title: ['THANKS TO', 'zer0_c00l    ac1d_burn', 'ph4nt0m      l0rd_n1k0n', 'cr4sh_0verride   r00tk1d', 'n3on_ghost    s1lk_r0ad', 'b1t_r0t      c0ffee_h4x', 'and everyone still out there'] },
  ],
  // SAFEHOUSE: you bring POPS the DISC
  // A strip scene (the user, 2026-11-04): one tall page that scrolls up (engine/quests.js buildStrip).
  // pic: { art: a data/scene_art.js canvas (drawn in asXii, copied by tools/data/scene_art.js), rows: the canvas rows it
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
//   tics = { swap: [[from, to]], col, tear, burst }: a glitchy logo (rows tear, marks swap, clusters flash to noise);
//   pic.look = layer options for a logo (a hacker's tics come from data/hackers.js).
//   The effects' defaults (the global look) are data/fx.js FX_LOOKS: a layer only gives what's its own (where, which
//   marks) and what it wants different. flicker / glitch take true or their own settings ({ glitch: { col: 'danger' } }).
//   A mask (data/fx.js mask): glitch / flicker / tint with `where` show all along, in drifting patches of noise:
//   { glitch: { where: true } } (the default mask), or where: { rect: [x, y, w, h] in the canvas's cells, density: 0.6,
//   strength: 0.8, scale: 4, fade: 2000, ... }. tint = { col, amount, where }: the color pulls toward col there.
//   mood (on any frame) = { levels, stages }: what the scene's music wanders between from that frame on (SCENE_MUSIC).
  disc: [
    { title: ['SYSTEM FAILURE', 'step 3: SAFEHOUSE'], mood: { levels: [0], stages: 'A' } },
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
    // POPS, close (Claude's headshot: asxii_art/n_cutscene_01_pops_head), his gear blinking behind him
    { pic: { art: 'popshead', rows: [0, 14], layers: [
      { n: 'head lights', col: 'mid', lights: { ch: 'o', col: 'accent', rate: 520, off: 0.45, offCh: '.' } },
      { n: 'head', col: 'bright', at: 300, dur: 900, blink: { match: '[_@_]-[_@_]', to: '[_-_]-[_-_]' }, smoke: { x: 9, y: 8, dx: -4, dy: -6 } }] },
      who: 'pops', text: "...this was my boy's. he carried it everywhere.", mood: { levels: [0, 1], stages: 'A' } },
    { who: 'pops', text: 'he went into the net years back. never came out.' },
    { text: "he doesn't look at you while he says it. he's looking at the label." },
    { who: 'pops', text: "it's encrypted. but there's a trail on it: an old terminal, somewhere deep.", mood: { levels: [1, 2], stages: 'B' } },
    // d0g's logo glitches: his d flips to a b now and then, flashes in b0y's blue (he's POPS's boy: docs/QUESTS.md)
    { pic: { logo: 'd0g' }, who: 'pops', text: 'and one name all over the logs. d0g.', mood: { levels: [2, 3], stages: 'B' } },
    { text: 'his jaw sets. the shake is gone.', mood: { levels: [2, 3], stages: 'BC' } },
    { who: 'pops', text: 'if d0g did something to my boy, i want him to feel it.', mood: { levels: [3], stages: 'C' } },
    // POPS gives you the seed (the user, 2026-11-04: here, at the end of this scene; the quest card after says the rest)
    { who: 'pops', text: 'his trail runs down deep. somewhere the logs call HAD3S.' },
    { who: 'pops', text: "here. that's a seed: HAD3S. start a run with it and go hunting." },
    { who: 'pops', text: 'go find him. make him pay for it.' },
  ],
  // PRODIGAL (docs/QUESTS.md steps 6-7; rewritten with the user, 2026-11-06): beating d0g is how POPS finds him. MEDIX's
  // basement: b0y, empty, wired into the wall. The DISC is his backup: you upload it (the upload frame: a tap starts it,
  // the mold pushes back). d0g for a flash, in G0D's voice, then "doc". What got him (G0D, not by name), and he's b0y.
  // Placeholder art: n_cutscene_02_prodigal.
  // upload = { from, to }: a bar the mold has grown over; a tap fills it (engine/quests.js UPLOAD). Tap again to go on.
  prodigal: [
    { title: ['SYSTEM FAILURE', 'step 5: TRACE ROUTE'], mood: { levels: [0], stages: 'A' } },
    { pic: { art: 'prodigal', rows: [0, 5], layers: [{ n: 'trace', col: 'accent', from: 'top', dur: 1600 }] },
      text: 'POPS runs the name off the DOGTAG. the trace bounces through five relays, then dives.' },
    { who: 'pops', text: 'every time you beat d0g, his signal came through a little cleaner. now i can see where it comes from.' },
    { who: 'pops', text: "it doesn't end in a corp. it ends under one. MEDIX. sub-basement three." },
    { who: 'pops', text: 'i worked there, a long time ago. i patched people up.' },
    { pic: { art: 'prodigal', rows: [8, 17], hold: 600, layers: [
      { n: 'basement mold', col: '#9fc13a', from: 'bottom', flicker: true, at: 600 },
      { n: 'basement', col: 'text', from: 'bottom', flicker: true, at: 0, lights: { ch: '>:/', col: 'accent', rate: 900, off: 0.3 } }] },
      text: 'you go down together. the lights are out. mold up the walls, and one screen still on in the dark.', mood: { levels: [0, 1], stages: 'A' } },
    { text: "he's there, slumped in front of it. cables run out of his arms and into the wall. thin. barely breathing." },
    { who: 'pops', text: "kid. kid, it's me." },
    { text: "nothing. POPS checks his pulse, his eyes, the cables. his hands remember what to do, even if he doesn't." },
    { who: 'pops', text: "he's breathing. but there's nobody home. it took all of him." },
    { who: 'pops', text: "...not all of him. the DISC. it was never a trail. it's him. a backup. he got it out before it took the rest.", mood: { levels: [1], stages: 'AB' } },
    { who: 'pops', text: "i'll keep him breathing. you're the hacker. put him back." },
    { upload: { from: 'DISC', to: 'b0y' }, text: 'you jack the DISC into the wall, into him. something in the wall pushes back.', mood: { levels: [2], stages: 'B' } },
    { pic: { art: 'prodigal', rows: [22, 29], layers: [{ n: 'hood', col: 'mid' }, { n: 'eyes', col: 'danger', at: 300, glitch: true }] },
      who: 'd0g', text: "no. this one is mine. you can't have hi-", mood: { levels: [2, 3], stages: 'BC' } },
    { who: 'pops', text: 'kid. look at me.' },
    { text: 'the eyes in the hood flicker. something in there is fighting something else.' },
    { pic: { art: 'prodigal', rows: [22, 29], layers: [{ n: 'hood', col: 'mid' }, { n: 'eyes', col: '#4aa8ff', at: 300, glitch: true, tics: { swap: [['o', '@']], col: 'danger' } }] },
      who: 'd0g', text: '...doc?', mood: { levels: [1, 2], stages: 'B' } },
    { text: 'nobody has called POPS that in years. only one person ever did.', mood: { levels: [0, 1], stages: 'A' } },
    // G0D, set up (the user, 2026-11-06): not by name, what it is and what it wants
    { who: 'd0g', text: 'i went in after it. something under the corps was waking up. i wanted to see it first.' },
    { who: 'd0g', text: "it isn't a corp. it's under all of them. every corp you've ever cracked, it was in there, watching you do it." },
    { who: 'd0g', text: "the mold is what it looks like when it grows. it doesn't want money. it wants the whole net quiet.", mood: { levels: [1, 2], stages: 'B' } },
    { who: 'd0g', text: "one mind. nothing moving that it didn't move." },
    { who: 'd0g', text: 'it got into me. it made me its dog. i built it a gate down here. CERBERUS. so nothing gets in. so nothing gets out.' },
    { who: 'd0g', text: 'every time you beat me, its grip slipped. long enough to hide a copy of me where somebody would find it.' },
    { text: "POPS doesn't say anything. he just holds on to him.", mood: { levels: [0], stages: 'A' } },
    { who: 'b0y', text: "don't call me d0g. that was its name for me. it's b0y." },
    { who: 'b0y', text: "it's still out there, and it knows your face now. here's my number. when you're ready, we go get it.", mood: { levels: [1], stages: 'AB' } },
  ],
  // HEAVEN'S GATE (steps 9-10): breaking OMNI with b0y there; he finds where it went. Placeholder art: n_cutscene_03_gate.
  gate: [
    { title: ['SYSTEM FAILURE', "HEAVEN'S GATE"], mood: { levels: [1], stages: 'A' } },
    { pic: { art: 'gate', rows: [0, 6], layers: [{ n: 'omni core', col: 'danger', glitch: true, dur: 1200 }] },
      text: "OMNI's core comes apart. b0y is already in it, faster than you've ever seen anybody move.", mood: { levels: [2], stages: 'B' } },
    { who: 'b0y', text: 'it was here. for years. the corps were just its body.' },
    { who: 'b0y', text: "it moved. somewhere the corps can't touch. it calls it heaven." },
    { pic: { art: 'gate', rows: [10, 17], hold: 500, layers: [
      { n: 'clouds', col: 'mid', par: 0.3, from: 'bottom', flicker: true },
      { n: 'gate', col: 'bright', at: 700 },
      { n: 'gate mold', col: '#9fc13a', at: 1400, flicker: true }] },
      text: 'on the screen: a gate, up past the clouds. mold all over it.', mood: { levels: [2, 3], stages: 'BC' } },
    { who: 'b0y', text: 'the way in is a seed. H3AV3N.' },
    { who: 'b0y', text: "i'll be with you the whole way. i know its tricks. i built some of them.", mood: { levels: [3], stages: 'C' } },
  ],
};
