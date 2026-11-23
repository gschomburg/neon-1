// NeoN+1 data/feats.js: the feats (achievements, docs/PROGRESSION.md). Each one reads a number from THE RECORD
// (save.stats, counted by engine/feats.js) and is done when that number reaches n. Done is done: feats are never lost
// (only a progression wipe clears them).
//
// Each feat:
//   name    as listed (keep it under 16 characters)
//   group   runs / corps / odd / tech (the WORKBENCH, the deck, THE SHELL) (rivals come with the hackers)
//   text    what to do, one line, for the FEATS detail
//   stat    the record's number it reads; n: how many ('all': every corp there is)
//   title   (optional) the title it gives you for your card (YOU > title)
//   logo    (optional) the hacker logo it unlocks (rivals and crew, below)
//   post    (optional) the REP post it opens (a PRIVATE MESSAGE: engine/save.js LEGACY, pm: this feat's id)
//   say     POPS's line in the FEAT box when you get it (the box adds "unlocked title: ..." itself)
//
// The record's numbers (engine/feats.js counts them; practice runs don't count):
//   runs  deaths  cashouts  corps  corpKinds (different corps breached)  layers  perfects  ice (ICE hits)  sectors
//   ads (closed)  gear (used)  newb (finished the training)  benchTrained (finished the WORKBENCH training)  deckTrained
//   seedBetter (a seed played again, deeper than before)  doubleCall (2 crew called into one layer)  phishSold
//   fenceBuys  diedFishing (died at the pier)  bruteForce (a corp breached after losing 8+ INT in it)
//   built builtGear builtMods builtChips builtExotic luckyBuild (a RUN ANYWAY that came out as something)  shreds
//   chipsSlotted  fullDeck (every open socket filled)  underpowered (a run started with a chip that had no power)
//   chipsSmuggled (chips cashed out home)  chipKinds (different chips owned)  deckMk4  boardLevel (THE BOARD's level)
//   movedIn (ROOT's quest done)  sudoRuns (SUDO commands run in THE SHELL)
// Some count outside runs too (the deck, THE BOARD: engine/feats.js, tally's home).
//   best*: the best a single run got:  bestDepth  bestStreak (perfects in a row)  bestSectors  bestHeld (credits at
//   once)  bestSpent (credits spent in one run)
//   once-offs (counted when they happen):  diedFirst (died in your first corp)  nakedSector (cleared a sector with no
//   mods)  bossAt1 (beat a boss layer at 1 INT)  easyCome (earned 1000cr in a run and ended it with under 10)
'use strict';
NEON_FILES.push(['data/feats.js', 'v15.58']);

const FEATS = [
  // ---- the basics: runs
  { id: 'newb', name: 'NEWB', group: 'runs', text: 'finish the training.', stat: 'newb', n: 1, title: 'NEWB',
    say: "that's the sim done. you're a newb now. officially. it's a step up from nothing." },
  { id: 'apprentice', name: 'APPRENTICE', group: 'runs', text: 'finish the WORKBENCH training.', stat: 'benchTrained', n: 1,
    say: "you can take a thing apart and put it back together. that's half of this job." },
  { id: 'deckhand', name: 'DECKHAND', group: 'runs', text: 'finish the deck training.', stat: 'deckTrained', n: 1,
    say: "now you know your way around a deck. go fill it." },
  { id: 'firstblood', name: 'FIRST BLOOD', group: 'runs', text: 'breach a corp.', stat: 'corps', n: 1,
    say: 'first corp down. the first one always feels like that.' },
  { id: 'sector1', name: 'SECTOR ONE', group: 'runs', text: 'clear a sector.', stat: 'sectors', n: 1,
    say: 'you took out OMNI. a piece of it, anyway. it has a lot of pieces.' },
  { id: 'sector3', name: 'DEEP NET', group: 'runs', text: 'clear 3 sectors in one run.', stat: 'bestSectors', n: 3, title: 'ROOT ACCESS',
    say: "three sectors in one go. people are going to start asking who you are." },
  { id: 'sysop', name: 'SYSOP', group: 'runs', text: "reach SYSOP on THE BOARD.", stat: 'boardLevel', n: 4, title: 'SYSOP',
    say: "SYSOP. you run the board now. try not to let it go to your head." },
  { id: 'seedbetter', name: 'ONE MORE TRY', group: 'runs', text: "play a seed again and get deeper than before.", stat: 'seedBetter', n: 1,
    say: "same seed, further in. that is how you learn a net." },
  { id: 'cashout', name: 'BANKED', group: 'runs', text: 'cash out a run.', stat: 'cashouts', n: 1,
    say: 'you got out with the goods. most people forget that part.' },
  { id: 'depth50', name: 'DEEP DIVE', group: 'runs', text: 'reach layer 50.', stat: 'bestDepth', n: 50, title: 'DEEP DIVER',
    say: "layer fifty. it's cold down there, huh." },
  { id: 'depth100', name: 'THE ABYSS', group: 'runs', text: 'reach layer 100.', stat: 'bestDepth', n: 100, title: 'ABYSSAL',
    say: "a hundred layers. i didn't know it went that deep. nobody did." },
  { id: 'perfect5', name: 'CLEAN RUN', group: 'runs', text: '5 perfect layers in a row.', stat: 'bestStreak', n: 5,
    say: 'five clean in a row. no ICE on you at all.' },
  { id: 'perfect10', name: 'PERFECT 10', group: 'runs', text: '10 perfect layers in a row.', stat: 'bestStreak', n: 10, title: 'CLEAN HANDS',
    say: "ten in a row and not a scratch. show-off." },
  { id: 'runs10', name: 'REGULAR', group: 'runs', text: 'play 10 runs.', stat: 'runs', n: 10,
    say: "ten runs. you keep coming back. that's the job." },
  { id: 'runs100', name: 'LIFER', group: 'runs', text: 'play 100 runs.', stat: 'runs', n: 100, title: 'LIFER',
    say: "a hundred runs. you don't go home anymore, do you." },

  // ---- corps
  { id: 'corps10', name: '10 CORPS', group: 'corps', text: 'breach 10 corps.', stat: 'corps', n: 10,
    say: 'ten corps. their security people have a group chat about you now.' },
  { id: 'corps100', name: '100 CORPS', group: 'corps', text: 'breach 100 corps.', stat: 'corps', n: 100, title: 'CORP KILLER',
    say: "a hundred corps. somewhere a board meeting is about you." },
  { id: 'kinds25', name: 'TOURIST', group: 'corps', text: 'breach 25 different corps.', stat: 'corpKinds', n: 25,
    say: "twenty-five different corps. you've seen the sights." },
  { id: 'kindsAll', name: 'OMNIVORE', group: 'corps', text: 'breach every kind of corp.', stat: 'corpKinds', n: 'all', title: 'OMNIVORE',
    say: "every corp on the net. every single one. go outside." },
  { id: 'bosshunter', name: 'BOSS HUNTER', group: 'corps', text: 'clear 10 sectors.', stat: 'sectors', n: 10, post: 'bossloot',
    say: "ten sector bosses down. word gets around: somebody's selling their gear now." },
  { id: 'layers500', name: 'GRINDER', group: 'corps', text: 'clear 500 layers.', stat: 'layers', n: 500,
    say: "five hundred layers. your fingers must be calluses by now." },
  { id: 'byathread', name: 'BY A THREAD', group: 'corps', text: 'beat a boss layer with 1 INT left.', stat: 'bossAt1', n: 1, title: 'BY A THREAD',
    say: "one integrity left and you took the boss anyway. don't do that to me." },

  // ---- odd
  { id: 'bruteforce', name: 'BRUTE FORCE', group: 'corps', text: "lose 8 INT in one corp and still breach it.", stat: 'bruteForce', n: 1, title: 'BRUTE FORCE',
    say: "no finesse. none. but you're in, so who's counting." },
  { id: 'decoded', name: 'DECODED', group: 'corps', text: "breach every corp: every tell in the CODEX.", stat: 'corpKinds', n: 'all', title: 'ARCHIVIST',
    say: "every corp, every tell. the CODEX is all yours. i never got that far." },
  { id: 'speedrun', name: 'SPEEDRUN', group: 'odd', text: 'die in your first corp.', stat: 'diedFirst', n: 1, title: 'SPEEDRUNNER',
    say: "dead in the first corp. that's a record. the wrong kind." },
  { id: 'naked', name: 'NAKED', group: 'odd', text: 'clear a sector with no mods.', stat: 'nakedSector', n: 1, title: 'NAKED',
    say: "a whole sector with no mods. bare hands. respect." },
  { id: 'whale', name: 'BIG SPENDER', group: 'odd', text: 'spend 1000cr in one run.', stat: 'bestSpent', n: 1000, title: 'WHALE',
    say: "a thousand credits in one run. the markets love you." },
  { id: 'easycome', name: 'EASY COME', group: 'odd', text: 'earn 1000cr in a run, end it with under 10.', stat: 'easyCome', n: 1, title: 'EASY COME',
    say: "a thousand in, nothing out. easy come, easy go." },
  { id: 'loaded', name: 'LOADED', group: 'odd', text: 'hold 500cr at once.', stat: 'bestHeld', n: 500, title: 'HIGH ROLLER',
    say: "five hundred credits on you at once. watch your pockets." },
  { id: 'iceaddict', name: 'FROSTBITE', group: 'odd', text: 'hit 250 ICE.', stat: 'ice', n: 250, title: 'FROSTBITTEN',
    say: "two hundred and fifty ICE hits. you know it hurts, right?" },
  { id: 'adblind', name: 'AD BLIND', group: 'odd', text: 'close 50 ads.', stat: 'ads', n: 50, title: 'AD BLIND',
    say: "fifty ads closed. you don't even see them anymore." },
  { id: 'fish1', name: 'GONE PHISHING', group: 'odd', text: 'phish something out of the stream.', stat: 'fish', n: 1,
    say: 'data, out of a data stream. who knew.' },
  { id: 'fish25', name: 'PHISHER', group: 'odd', text: 'land 25 catches.', stat: 'fish', n: 25, title: 'PHISHER',
    say: "twenty-five catches. you're spending a lot of time at that pier." },
  { id: 'fishleg', name: 'THE BIG ONE', group: 'odd', text: 'land a legendary catch.', stat: 'fishLeg', n: 1, title: 'THE BIG ONE',
    say: "a legendary catch. nobody's going to believe you." },
  { id: 'fishshoe', name: 'OLD BOOT', group: 'odd', text: 'catch a shoe.', stat: 'fishShoe', n: 1,
    say: "you caught a shoe. it's wet. it's a shoe." },
  { id: 'castaway', name: 'CAST AWAY', group: 'odd', text: 'cast 250 times.', stat: 'casts', n: 250, title: 'CAST AWAY',
    say: 'two hundred and fifty casts. do you even remember what a corp looks like?' },
  { id: 'catphish', name: 'CATPHISH', group: 'odd', text: 'land 100 catches. something follows you home.', stat: 'fish', n: 100, title: 'CATPHISH',
    say: 'phush you? no, phush me. a hundred catches, kid. one of them likes you: a fish follows you now, every run.' },
  { id: 'bigdata', name: 'BIG DATA', group: 'odd', text: 'land a catch of 10 GB or more.', stat: 'phishBig', n: 1,
    say: "ten gigs off one hook. somebody's IT department is crying." },
  { id: 'petpet', name: 'GOOD PET', group: 'odd', text: 'pet your pet 50 times.', stat: 'pets', n: 50, title: 'PET PERSON',
    say: "fifty pets. it's the only thing on the net that likes you." },
  { id: 'fishfood', name: 'FISH FOOD', group: 'odd', text: "die at the pier.", stat: 'diedFishing', n: 1,
    say: "you went phishing and the phish won. that really should not happen." },
  { id: 'phishmonger', name: 'PHISH MONGER', group: 'odd', text: "sell 30 PHISH.", stat: 'phishSold', n: 30,
    say: "thirty catches sold. the black markets know your face now." },
  { id: 'buyback', name: 'BUYBACK', group: 'odd', text: "buy a mod back from THE FENCE.", stat: 'fenceBuys', n: 1,
    say: "paying for your own stuff. the fence thanks you." },
  { id: 'confcall', name: 'CONFERENCE CALL', group: 'odd', text: "call 2 crew into the same layer.", stat: 'doubleCall', n: 1,
    say: "two of us on the line at once. now it is a party." },
  { id: 'gearhead', name: 'GEARHEAD', group: 'odd', text: 'use 100 gear.', stat: 'gear', n: 100,
    say: "a hundred bits of gear burned through. you're a menace with a toolbox." },
  // ---- H3AV3N (the user, 2026-10-31: feats for heaven; they show once you've been there: engine/menus.js featShown)
  // ---- tech: the WORKBENCH, the deck, THE SHELL (Greg, 2026-11-23)
  { id: 'handyman', name: 'HANDYMAN', group: 'tech', text: "build something at a WORKBENCH.", stat: 'built', n: 1,
    say: "you made a thing. with your hands. well, with a workbench." },
  { id: 'crafty', name: 'CRAFTY', group: 'tech', text: "build 10 gear.", stat: 'builtGear', n: 10, title: 'CRAFTY',
    say: "ten pieces of gear, made by you. why buy it." },
  { id: 'tinkerer', name: 'TINKERER', group: 'tech', text: "build 10 mods.", stat: 'builtMods', n: 10, title: 'TINKERER',
    say: "ten mods off the bench. you are getting good at this." },
  { id: 'chipmaker', name: 'CHIPMAKER', group: 'tech', text: "build a chip from a BLANK.", stat: 'builtChips', n: 1,
    say: "a chip from a blank. now you make the stuff that runs you." },
  { id: 'decompiler', name: 'DECOMPILER', group: 'tech', text: "build an exotic from its blueprint.", stat: 'builtExotic', n: 1, title: 'DECOMPILER',
    say: "took it apart, put it back. an exotic. not many can say that." },
  { id: 'luckyguess', name: 'LUCKY GUESS', group: 'tech', text: "RUN ANYWAY, and get something.", stat: 'luckyBuild', n: 1,
    say: "that should not have worked. take it and go." },
  { id: 'shredder', name: 'SHREDDER', group: 'tech', text: "shred 100 things.", stat: 'shreds', n: 100, title: 'SHREDDER',
    say: "a hundred things in the grinder. you like that sound, huh." },
  { id: 'pluggedin', name: 'PLUGGED IN', group: 'tech', text: "slot a chip in your deck.", stat: 'chipsSlotted', n: 1,
    say: "first chip in. feel that? no? you will." },
  { id: 'fullhouse', name: 'FULL HOUSE', group: 'tech', text: "fill every open socket on your deck.", stat: 'fullDeck', n: 1, title: 'FULL HOUSE',
    say: "every socket full. that board is humming." },
  { id: 'underpowered', name: 'UNDERPOWERED', group: 'tech', text: "start a run with a chip that has no power.", stat: 'underpowered', n: 1, title: 'UNDERPOWERED',
    say: "a chip with no juice does nothing, kid. but sure. go." },
  { id: 'smuggler', name: 'SMUGGLER', group: 'tech', text: "cash out with a chip you found.", stat: 'chipsSmuggled', n: 1,
    say: "out with a chip in your pocket. that is the job." },
  { id: 'collector', name: 'COLLECTOR', group: 'tech', text: "own 25 different chips.", stat: 'chipKinds', n: 25, title: 'COLLECTOR',
    say: "twenty-five chips. you could open a shop." },
  { id: 'mk4', name: 'MK IV', group: 'tech', text: "take your deck to mk IV.", stat: 'deckMk4', n: 1, title: 'DECK JOCKEY',
    say: "mk IV. the fuse is lit. that is a real deck." },
  { id: 'movedin', name: 'MOVED IN', group: 'tech', text: "finish ROOT's quest, PAPERWORK.", stat: 'movedIn', n: 1, title: 'TENANT',
    say: "ROOT lives in your deck now. pay the rent on time." },
  { id: 'sudo', name: 'SUDO', group: 'tech', text: "run a SUDO command in THE SHELL.", stat: 'sudoRuns', n: 1,
    say: "root access, on demand. careful with that." },
  { id: 'g0dslayer', name: 'G0D SLAYER', group: 'heaven', text: 'beat G0D on the H3AV3N seed.', stat: 'g0dWins', n: 1, title: 'G0D SLAYER',
    say: "you took down G0D. i'm going to need a minute. so is the net." },
  { id: 'g0dclean', name: 'UNTOUCHED', group: 'heaven', text: 'beat G0D without him landing a hit.', stat: 'g0dClean', n: 1, title: 'UNTOUCHED',
    say: "not a scratch. G0D didn't lay a finger on you. show off." },
  { id: 'g0dshoe', name: 'WITH A SHOE', group: 'heaven', text: 'finish G0D off with a shoe.', stat: 'g0dShoe', n: 1, title: 'INFIDEL',
    say: 'a shoe. you killed G0D with a shoe. i love you kid.' },
  { id: 'mazelost', name: 'LOST', group: 'heaven', text: 'get lost in the G0D MAZE.', stat: 'mazeLost', n: 1,
    say: "the maze ate you. happens. follow the codex, kid." },
];

// Rivals and crew (data/hackers.js), a feat each, listed once you've met them: beat a rival 5 times for its logo; call a
// crew member 5 times for their logo and CREW on THE BOARD, 10 times for their LVL 2 there.
for (const [id, h] of Object.entries(HACKERS)) {
  if (h.side === 'bad') FEATS.push({ id: 'beat_' + id, name: h.name + ' x5', group: 'rivals', hacker: id, text: `beat ${h.name} 5 times.`, stat: 'hack:beat:' + id, n: 5, logo: id,
    say: `five times you put ${h.name} down. ${h.name === 'd0g' ? 'wow.' : 'they want their logo back. tough.'}` });
  else {
    FEATS.push({ id: 'call_' + id, name: h.name + ' x5', group: 'crew', hacker: id, text: `call ${h.name} in 5 times.`, stat: 'hack:call:' + id, n: 5, logo: id,
      // (already on your crew, like POPS from his quest: no offer of a spot. Greg, 2026-11-21)
      get say() { return `${h.name.toLowerCase()} likes working with you.` + (typeof hkCrewOn === 'function' && hkCrewOn(id) ? " good thing they're on your crew already." : " there's a spot on your crew, if you want it."); } });
    FEATS.push({ id: 'call10_' + id, name: h.name + ' x10', group: 'crew', hacker: id, text: `call ${h.name} in 10 times.`, stat: 'hack:call:' + id, n: 10,
      say: `ten calls. ${h.name.toLowerCase()} has a trick to show you.` });
  }
}
