// NeoN+1 data/tutorial.js: everything POPS says in the training run, in the order he says it.
// The neon editor's TRAINING tab edits this file (tools/tutorial_file.js writes it). Each line:
//   id:    what engine/tutorial.js asks for (don't rename)
//   part:  a heading for the lines from here on (the editor groups by it)
//   text:  what he says. \n\n is a blank line. {name} is your hacker name.
//   act:   the "do this" line: POPS shrinks to it while you play (after the text, if there is any). Keep it short.
//   arrow: false: no arrow, on a popup that points at something (it still sits by it).
//   timer: banter: ms before it moves on by itself (a tap skips it).
//   of:    said in place of that popup's do-this line (a wrong tap, the boss beaten): one way to say it per line,
//          picked at random.
'use strict';
NEON_FILES.push(['data/tutorial.js', 'v13.42']);

const TUT_COPY = [
  // the public net
  { id: "hello", part: "the public net", text: "hey, {name}. welcome to the training sim.\n\nthe name's POPS. i ran these nets for thirty years. now i keep newbs like you from getting flatlined." },
  { id: "runner", text: "you're a runner. you break into corps one layer at a time, and get out with the goods." },
  { id: "nodes", text: "every layer is a set of NODES. find the real one and you're through to the next layer.", arrow: false },
  { id: "public", text: "this is the public net, the way in. one node, and it's real.", act: "tap the node" },
  // the reward
  { id: "reward", part: "the reward", text: "after a corp you get a reward. MODS stay with you the whole run and bend the rules a little." },
  { id: "tracer", text: "this one's TRACER: when you hit ICE, it points toward the real node." },
  { id: "take", text: "", act: "tap TAKE" },
  // the map
  { id: "tray", part: "the map", text: "TRACER's in your tray now. your mods live down here." },
  { id: "net", text: "this is the NET. you start at the bottom and climb, one step at a time." },
  { id: "corps", text: "each code is a corp. BC1 is BASIC CORP, level 1. the higher the level, the harder the corp." },
  { id: "stops", text: "and the stops: [$] market, [?] data cache, [+] safehouse. a place to catch your breath." },
  { id: "jackin", text: "tap BC1 to look it over, then tap it again (or BREACH) to jack in.", act: "breach BC1" },
  // BASIC CORP, layer 1
  { id: "corp", part: "BASIC CORP, layer 1", text: "you're in BASIC CORP. a corp is a few layers, then a BOSS." },
  { id: "integrity", text: "this is your INTEGRITY: your health. ICE costs 1. hit zero and you're traced. run over." },
  { id: "credits", text: "CREDITS: every layer you pass pays. spend them at markets." },
  { id: "ice", text: "see all those nodes? one is real. the rest are ICE: corp security. touch ICE and it bites." },
  { id: "hitice", text: "now let's hit some ICE on purpose. trust me.", act: "tap the ICE" },
  { id: "hurt", text: "-1 INTEGRITY. you're down to {int}. hit zero and the run's over.", arrow: false },
  { id: "traced", text: "but TRACER went off: that ICE now has arrows pointing toward the real node.", arrow: false },
  { id: "terminal", text: "and keep an eye on this line up top: the terminal. it tells you what just happened, and sometimes it drops a clue." },
  { id: "ouch", text: "stings, don't it? ICE always does. let's patch you up.", timer: 4000 },
  { id: "items", text: "ITEMS are one use each, on your belt. you find them at markets, data caches and loot nodes.\n\nPATCH heals 1 INTEGRITY: tap it to see it, tap again to use it.", act: "patch up" },
  { id: "items2", of: "items", text: "tap again to use it" },
  { id: "real", text: "now follow the arrows on that ICE. they point at the real node.", act: "tap the real node" },
  // layer 2: the tell
  { id: "layerdone", part: "layer 2: the tell", text: "one layer down. not bad, {name}.", timer: 3000 },
  { id: "tell", text: "every corp hides its real node its own way. that's its TELL." },
  { id: "basictell", text: "BASIC CORP's tell: the real node is the plain one, [ ].\n\nlearn a corp's tell and you can read it every time." },
  { id: "loot", text: "see that one? a LOOT node. it's ICE, so it still bites, but it pays out: credits or an item. your call.\n\nand keep your eyes open. there's weirder stuff than loot floating around out there." },
  { id: "findit", text: "", act: "find the [ ]" },
  { id: "oops", of: "findit", text: "ouch. not that one.\ntry again.\nnope. that's ICE.\nshake it off." },
  // the boss
  { id: "perfect", part: "the boss", text: "PERFECT: the real node on the first try. that pays more, and heals 1 INTEGRITY." },
  { id: "boss", text: "last layer's the BOSS: more nodes, and in some corps the ICE hits harder. same tell.\n\nbeat it and the corp is breached." },
  { id: "breachit", text: "", act: "breach it" },
  { id: "bosswin", of: "breachit", text: "nailed it.\nthat's how it's done.\nboom. breached." },
  // the breach
  { id: "breached", part: "the breach", text: "ha! look at that. corp breached, {name}.", timer: 3500 },
  { id: "bossmods", text: "a beaten boss gives you a pick of mods. one of them is the corp's own." },
  { id: "pick", text: "", act: "pick one, or skip" },
  // out
  { id: "loop", part: "out", text: "that's the loop: pick a path, breach corps, grab rewards, shop at markets." },
  { id: "sector", text: "a SECTOR BOSS waits at the top of every sector. and the CODEX keeps every tell you learn." },
  { id: "bye", text: "that's all i got, {name}. keep your integrity up and your head down.\n\ngood luck out there." },
  { id: "out", text: "jacking you out.", timer: 2000 },
];
