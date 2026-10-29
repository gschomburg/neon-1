// NeoN+1 data/hackers.js: the hacker cast (the user, 2026-10-28): who they are, how each one plays (built in
// engine/hackers.js, v13.67), their colors and their lines. The old RIVAL bot is gone: the RIVAL anomaly brings in one
// of the rivals (D0PPEL wears your name, glitched).
//
// Their art: the face (5 x 3, like POPS's) is in data/art/faces.js and the logo in data/art/logos.js (kind hacker),
// both under the hacker's id, both edited in the neon editor's ART tab. The neon editor's HACKERS tab shows them all.
//
// Each hacker:
//   name    as shown (the HUD's "vs NAME" fits 9 characters)
//   side    bad: shows up against you (an anomaly, a sector event, an ICE hit). good: comes only when you call them
//           with CALL gear. Good hackers never take your pay; their LVL 2 (THE BOARD) is a fixed upgrade.
//   hp      their health (bars). A hacker at 0 is out for the rest of the corp.
//   shtick  the one line the player reads (codex, the card when they show up)
//   lore    a little backstory, for the codex
//   ai      how it plays: what the bot does, step by step (for building it)
//   beat    bad: how you get rid of them (and what beating them gets you: their logo, always)
//   counter bad: the good hacker made for them. good: the bad hacker they're made for, and what happens.
//   style   their colors (a text color on a background, like a player's): their cursor, logo card and terminal lines
//   enter   what they say coming in (their card, the terminal)
//   taunt   rivals: what they say now and then. clue: crew, the same
//   out     beaten (rivals) / out of bars (crew: a goodbye)
//   kill    rivals: their taunt when you die with them there. snake: crew, calling your name ({name}) when you die
//   lvl2    crew: their LVL 2 upgrade (THE BOARD), fixed
// How each one plays is engine/hackers.js (HK_AI); they come in through the RIVAL anomaly (rivals) and CALL gear (crew).
'use strict';
NEON_FILES.push(['data/hackers.js', 'v13.80']);

const HACKERS = {
  // ================= bad hackers =================
  iceman: {
    name: 'ICE MAN', side: 'bad', hp: 4,
    style: { fg: "#bfe6ff", bg: "#0b2a4a" },
    enter: "you broke my ICE. i fix ICE.",
    taunt: ["cold in here, huh.","i put that back for you.","every hit makes me faster."],
    out: "melting...",
    kill: "stay frozen.",
    shtick: "he doesn't break ICE. he puts it back.",
    lore: ['Came out of a corp\'s ICE one night and never went back in. Nobody knows if he was a runner who got stuck,',
      'or the ICE that learned to walk. Either way he hates seeing it broken.'],
    ai: 'Never taps. Every 4s he re-freezes one locked ICE: it closes again (a burned or ruled-out node is live ICE again). ' +
      'In a RIVAL corp he stays out until you hit ICE there (the user: "hitting ICE calls a hacker in"); each ICE you hit after that makes him faster.',
    beat: 'Every perfect layer melts him a bar.',
    counter: 'brick',
  },
  ggez: {
    name: 'GG_EZ', side: 'bad', hp: 2,
    style: { fg: "#ff79c6", bg: "#1a1030" },
    enter: "lol hi",
    taunt: ["xD","ez","lmao","gg no re","u mad?"],
    out: "ur hacking. reported.",
    kill: "GG EZ",
    shtick: 'a kid with a macro. all he does is emote.',
    lore: ['Twelve, maybe. Bought his deck with a parent\'s card and a dream. Banned from fourteen corps\' public forums,',
      'mostly for spelling. He has never broken a single node.'],
    ai: 'Never taps a node. Every 1-2s he shoots an emote (xD, GG, EZ, :P, L, ??, lol, rekt) that sticks on a random node ' +
      'and covers its glyph for 3s. That is all he does. Harmless, except that the glyph you needed to read is under an EZ.',
    beat: 'Two perfect layers in a row: he rage quits ("ur hacking"). Otherwise he leaves when the corp ends.',
    counter: 'nana',
  },
  turbo: {
    name: 'TURBO', side: 'bad', hp: 3,
    style: { fg: "#ffb000", bg: "#2a1a00" },
    enter: "GO GO GO GO",
    taunt: ["faster!","too slow!","clicking intensifies"],
    out: "out of energy drink...",
    kill: "new personal best.",
    shtick: 'clicks everything. fast.',
    lore: ['Holds the speedrun record for the BURGERTRON breach and will tell you about it. Runs on energy drinks and an',
      'overclocked nervous system. Has never once read a tell.'],
    ai: 'Taps a node every 0.6s in reading order (top left onward), skipping locked ones. Never reads the tell. Each ICE he ' +
      'hits costs him a bar and locks that ICE for you. If he gets the real node first, he takes the layer\'s pay. ' +
      'He is usually dead by layer 2, but layer 1 is a race.',
    beat: 'Let him run into the ICE (3 hits and he is out), or beat him to the real node.',
    counter: 'baud',
  },
  doppel: {
    name: 'D0PPEL', side: 'bad', hp: 3,
    style: { fg: "#e6f4ef", bg: "#2c3a38" },
    enter: "i know how you play.",
    taunt: ["i saw that coming.","same move. backwards.","you are so predictable."],
    out: "that wasn't you...",
    kill: "i'm the real one now.",
    shtick: 'your moves. backwards. a beat late.',
    lore: ['A scrape of a runner\'s habits sold as an "AI coach". The runner was you. It wears your handle, glitched,',
      'and it thinks it is the real one.'],
    ai: 'Copies you: one beat after each of your taps it taps the mirror spot (flipped left to right). If the mirror spot ' +
      'is ICE it loses a bar and that ICE locks; if it is the real node, it takes the pay. Taps down the middle column ' +
      'are safe. Its name is yours, glitched (today\'s RIVAL name: A -> 4, E -> 3...). Today\'s RIVAL becomes this.',
    beat: 'It runs out of bars on its own mirror taps, or you finish layers before it finds the real one.',
    counter: 'hype',
  },
  sysop: {
    name: 'SYSOP', side: 'bad', hp: 5,
    style: { fg: "#9dff3c", bg: "#16300a" },
    enter: "NEW USER. read the rules.",
    taunt: ["ACCESS DENIED.","this is not the place for that.","thread locked."],
    out: "*** SYSOP has logged off ***",
    kill: "banned.",
    shtick: 'read the rules. ACCESS DENIED.',
    lore: ['Has run a bulletin board since 300 baud. Thinks the whole net is his board, and you are a user who did not',
      'read the rules. He has typed "this is not the place for that" eleven thousand times.'],
    ai: 'Slow and never after the real node. Every 4s he puts ACCESS DENIED on one closed node for 3s: you can\'t tap it. ' +
      'He does not know which one is real, so sometimes it is. Tough (5 bars) but he does not hurt you; he wastes your time, ' +
      'which hurts in clock corps.',
    beat: 'Each layer you clear without tapping a denied node (you waited him out) costs him a bar.',
    counter: 'dialup',
  },
  vulture: {
    name: 'VULTURE', side: 'bad', hp: 2,
    style: { fg: "#d9a066", bg: "#2a1606" },
    enter: "don't mind me. carry on.",
    taunt: ["i can wait.","almost there...","smells like a payday."],
    out: "no scraps today.",
    kill: "leftovers. my favorite.",
    shtick: 'waits. then takes the last bite.',
    lore: ['Has never broken a corp on his own. Lives off the last ten percent of other people\'s breaches, and is very',
      'good at the last ten percent.'],
    ai: 'Does nothing while the board is busy. When 3 or fewer nodes are left closed he dives: reads the tell right 2 times ' +
      'in 3 and takes the real node and its pay. A miss costs him a bar (and locks that ICE for you).',
    beat: 'Finish layers while there is still a crowd (he never dives), or let him miss twice.',
    counter: 'pops',
  },
  phish: {
    name: 'PH1SH', side: 'bad', hp: 3,
    style: { fg: "#5ce1e6", bg: "#06303a" },
    enter: "hey friend :)",
    taunt: ["psst: trust me :)","i'd pick that one :)","would i lie to you? :)"],
    out: "unsubscribed :(",
    kill: "thanks for the password :)",
    shtick: 'psst. it\'s that one. :)',
    lore: ['The friendliest voice on the net. Every message ends in a smiley. Social engineer, password collector, and the',
      'reason your handler says never trust a hacker who says "trust me".'],
    ai: 'Plants fakes. Each layer one ICE gets a fake tell (it looks ruled in, or a SNITCH-style arrow that points wrong). ' +
      'Now and then a message: "psst, it\'s the one on the left :)" - a lie 3 times in 4. He never taps a node himself.',
    beat: 'A perfect layer (you saw through him) costs him a bar.',
    counter: 'root',
  },
  d0g: {
    name: 'd0g', side: 'bad', hp: 5,
    style: { fg: "#ffd84a", bg: "#3a2c06" },
    enter: "wow. such hacker.",
    taunt: ["much tell. very read.","wow.","so predict."],
    out: "such loss. much respect.",
    kill: "very traced. wow.",
    shtick: 'online now.',
    lore: ['Nobody has seen d0g\'s face. Started as a meme account; the meme got root. The ads say D0G is online now.',
      'They are always right.'],
    ai: 'The best there is. Picks every 1.5s, only nodes the tell allows, and reads every corp\'s tell right. Takes the pay ' +
      'when he wins. Rare, late sectors, and the "defeat d0g" quest (beating him gives the H3AV3N seed, BACKLOG item 2).',
    beat: 'Out-pick him on his own game: every layer you win costs him a bar.',
    counter: 'null',
  },
  hcf: {
    name: 'HCF', side: 'bad', hp: 4,
    style: { fg: "#ff4d5e", bg: "#3a0a10" },
    enter: "HALT AND CATCH FIRE",
    taunt: ["FIRE","overheating overheating","0xDEADBEEF"],
    out: "fans stopped.",
    kill: "everything burns.",
    shtick: 'halt and catch fire. it did both.',
    lore: ['An ICE-breaker AI that burned out in \'51. Its fans died; it kept going. "Halt and catch fire" was supposed to be',
      'a joke instruction. Nobody told it.'],
    ai: 'Random taps, fast (every 0.8s). Every ICE it hits catches fire, and fire spreads to one neighbor each second: ' +
      'burning ICE is locked (it helps you), but if the fire reaches the real node, it burns: the layer clears with no pay. ' +
      'Chaos both ways: you want the fire, just not too much of it.',
    beat: 'It burns itself out: each ICE it hits costs it a bar.',
    counter: 'kludge',
  },
  leech: {
    name: 'LEECH', side: 'bad', hp: 3,
    style: { fg: "#c07bff", bg: "#24103a" },
    enter: "mind if i... attach?",
    taunt: ["mm. credits.","thanks for the pay.","just a little more."],
    out: "fine. here's some of it back.",
    kill: "you were delicious.",
    shtick: 'a tiny worm with a business plan.',
    lore: ['Started as a three-line script that skimmed fractions of a credit. Now it has a logo, a pitch deck and an',
      'office in a corp it skims from. Still three lines long.'],
    ai: 'Never taps. Latches onto you: takes 25% of every layer\'s pay while it is on (it shows on the HUD, fat with your ' +
      'credits). Every ICE you hit feeds it a bar back (up to 3).',
    beat: 'Each perfect layer knocks a bar off. At 0 it drops off and coughs up half of what it took.',
    counter: 'mother',
  },

  // ================= good hackers (you call them with gear) =================
  pops: {
    name: 'POPS', side: 'good', hp: 3,
    style: { fg: "#111111", bg: "#ffd84a" },
    enter: "easy, kid. i got you.",
    clue: ["that one's ICE. trust me.","slow down. read it.","i've seen this corp before."],
    out: "that's all i got left, kid.",
    snake: "{name}! kid! KID!",
    lvl2: "TRACER: he burns an ICE every 2s.",
    shtick: 'thirty years on these nets. careful hands.',
    lore: ['Ran the nets for thirty years. Now he keeps newbs from getting flatlined (he ran your training). His first',
      'name is DOC; nobody calls him that.'],
    ai: 'Careful: every 3s he burns one ICE he is sure of (one the tell rules out), never the real node. If he is not sure ' +
      'of any, he waits. Talks (lines like his training ones). Later, mods: give him TRACER and he reads the tell better.',
    counter: 'vulture: he guards the last three ("not on my watch"); VULTURE can\'t dive while POPS is up.',
  },
  brick: {
    name: 'BRICK', side: 'good', hp: 5,
    style: { fg: "#e8e2d0", bg: "#5a3a2a" },
    enter: "...",
    clue: ["...","*cracks knuckles*","*nods*"],
    out: "*falls over*",
    snake: "... {name}...",
    lvl2: "more bars: he takes 7 hits.",
    shtick: "doesn't click. doesn't talk. takes the hit.",
    lore: ['Six and a half feet of muscle and a deck he has never once used. Nobody knows why he hacks. He shows up, he',
      'stands there, and the ICE hits him instead of you.'],
    ai: 'Taps nothing. Takes your hits: each ICE you hit costs him a bar instead of your INT, until he drops. (The user\'s ' +
      'idea: an assist who takes all your hits.) BLOOD MONEY and BLACK ICE need a rule with him (he takes one bar, not "down to 1").',
    counter: 'iceman: re-frozen ICE you hit costs BRICK a bar and costs ICE MAN one too (BRICK hits back).',
  },
  null: {
    name: 'NULL', side: 'good', hp: 3,
    style: { fg: "#e6f4ef", bg: "#000000" },
    enter: "target acquired.",
    clue: ["irrelevant.","no.","yes."],
    out: "process ended.",
    snake: "{name}. {name}?",
    lvl2: "hunts twice as fast.",
    shtick: 'nothing to say. one job.',
    lore: ['A dry, deadpan AI. Answers "yes", "no" and "irrelevant". It was built to hunt other hackers and it finds',
      'everything else boring.'],
    ai: 'Never touches the board. Hunts the bad hacker: a bar off them every 4s. With no bad hacker around it idles ' +
      '("nothing to do.") and leaves after the layer.',
    counter: 'd0g: the one AI d0g can\'t read. While NULL is up, d0g guesses like everyone else (no tell reading).',
  },
  nana: {
    name: 'NANA', side: 'good', hp: 3,
    style: { fg: "#ffb3d9", bg: "#3a1028" },
    enter: "hello dear. i brought cookies.",
    clue: ["eat something, dear.","nobody does that to my grandkid.","sit up straight."],
    out: "nana needs a nap, dear.",
    snake: "{name}! oh, sweetie, no...",
    lvl2: "heals 2 after each layer.",
    shtick: 'sweet. ruthless. brought cookies.',
    lore: ['A retired hacker grandma. Took down three corps before most of them had logos. She knits between picks and',
      'she has never once lost an argument.'],
    ai: 'Sweet: +1 INT after each layer you clear (up to your max). Ruthless: every time you hit ICE, she locks 2 ICE ' +
      'out of spite ("nobody does that to my grandkid").',
    counter: 'ggez: "LANGUAGE." She wipes his emotes and he logs off after one scolding.',
  },
  dialup: {
    name: 'DIALUP', side: 'good', hp: 2,
    style: { fg: "#9dff3c", bg: "#0a1a0a" },
    enter: "eeeeee-kshhhhh...",
    clue: ["connected. finally.","back in my day...","hold the line."],
    out: "NO CARRIER",
    snake: "{name}... {name}? hello?",
    lvl2: "connects in 4s.",
    shtick: 'give him a minute. he\'s connecting.',
    lore: ['An old-timer who still hears the modem in his dreams. Slow to get going, deadly once he\'s in. Owes SYSOP',
      'about forty dollars from 1994, give or take.'],
    ai: 'Takes 8s to connect (the screech, a progress bar). Then, once a layer, he rules out half of the ICE left at once. ' +
      'Bad in clock corps, great in big boards.',
    counter: 'sysop: old BBS friends. SYSOP stops denying nodes ("for old times").',
  },
  baud: {
    name: 'BAUD', side: 'good', hp: 3,
    style: { fg: "#7fb6ff", bg: "#0b1a33" },
    enter: "h e l l o .",
    clue: ["o k a y .","g o t   o n e .","y o u r   c a l l ."],
    out: "b y e .",
    snake: "{ n a m e } !",
    lvl2: "more bars: 5 ICE before he's out.",
    shtick: 'talks slow. hands fast.',
    lore: ['Takes a full minute to say hello. Has broken four nodes by the time he finishes. Raced TURBO once and won,',
      'and has never mentioned it, which drives TURBO crazy.'],
    ai: 'Fast: burns an ICE every 0.8s (never the real node), a bar each, until he is out; stops when 2 nodes are left so ' +
      'the last call is yours. His lines take forever to type out.',
    counter: 'turbo: he races him. While BAUD is up, every ICE TURBO hits costs TURBO 2 bars.',
  },
  mother: {
    name: 'MOTHER', side: 'good', hp: 4,
    style: { fg: "#f0e6ff", bg: "#3a2a55" },
    enter: "i'm here, dear. you're safe.",
    clue: ["careful.","breathe.","i'm watching."],
    out: "i can't protect you anymore.",
    snake: "{name}... my {name}...",
    lvl2: "more bars: she stops 6 taps.",
    shtick: 'calm. caring. a little too caring.',
    lore: ['A calm AI that adopted you without asking. Speaks softly. Keeps a file on every hacker who has ever been rude',
      'to you. It is a long file.'],
    ai: 'Won\'t let you hurt yourself: at 1 INT, a tap on ICE is stopped ("no, dear.") and costs her a bar instead. ' +
      'Otherwise she watches.',
    counter: 'leech: she pulls it off you at once ("not my baby"); no cut while she is up.',
  },
  root: {
    name: 'ROOT', side: 'good', hp: 3,
    style: { fg: "#33ff66", bg: "#001a08" },
    enter: "root@deck:~# whoami",
    clue: ["# that one: ICE.","# read the source.","# trivial."],
    out: "segmentation fault.",
    snake: "# {name}: process killed",
    lvl2: "marks 2 ICE a layer.",
    shtick: 'lives in your deck. reads the fine print.',
    lore: ['An AI that came with your deck, or moved into it; the paperwork is unclear. It reads every line of code',
      'it touches and it is very smug about it.'],
    ai: 'Once a layer it marks one ICE as ICE (from the tell, never wrong). The first one to try mods on: it can run a ' +
      'tap gear for you, or copy one of your mods.',
    counter: 'phish: PH1SH\'s fakes don\'t show, and his messages come tagged [FALSE].',
  },
  kludge: {
    name: 'KLUDGE', side: 'good', hp: 3,
    style: { fg: "#c0c0c0", bg: "#3a3a3a" },
    enter: "hold on, i got tape.",
    clue: ["taped it.","that'll hold. probably.","needs more tape."],
    out: "out of tape.",
    snake: "{name}! hang on, i got tape!",
    lvl2: "tapes 3 nodes a layer.",
    shtick: 'duct tape fixes everything.',
    lore: ['A duct-tape veteran. Has fixed a mainframe with a paperclip and a corp\'s firewall with a sock. Nothing he',
      'builds works the way it should; all of it works.'],
    ai: 'Each layer he tapes 2 random closed nodes: taped ICE is locked. Tape won\'t stick to the real node (so a tape ' +
      'that falls off tells you something). Once a corp he patches you for 1 INT.',
    counter: 'hcf: he puts out the fires before they reach the real node.',
  },
  hype: {
    name: 'HYPE', side: 'good', hp: 2,
    style: { fg: "#ff4fd8", bg: "#2a0626" },
    enter: "LET'S GOOOO!",
    clue: ["POG","clean!!","<3 <3 <3"],
    out: "stream's over!",
    snake: "{name}!! NOOOO!",
    lvl2: "streaks pay +15% each.",
    shtick: 'only emotes. all of them nice.',
    lore: ['GG_EZ\'s older cousin, who went the other way: the net\'s loudest fan. Streams other people\'s breaches and',
      'cheers for every single node.'],
    ai: 'Never taps; only emotes (GG_EZ\'s opposite: !!, <3, POG, \\o/). Perfect streaks pay +10% more per perfect in a ' +
      'row while she is up.',
    counter: 'doppel: it copies her instead of you (it cheers back; no mirror taps).',
  },
};
