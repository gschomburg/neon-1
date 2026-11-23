// NeoN+1 data/chips.js: YOUR DECK's chips (docs/DECK.md). The deck itself is engine/deck.js (and deck_shell.js,
// deck_screen.js). One entry per chip: everything about a chip is on its line (the second audit, 2026-11-23: its
// numbers were in about ten tables). The old tables (DECK_INT, DECK_CHARGES...) are built from the entries, below.
// Nothing here changes at load: engine/deck.js adds the RIPPED and "+n shell charges" words to the texts.
'use strict';
NEON_FILES.push(['data/chips.js', 'v15.61']);

// groups: [name, palette color key (only GLYPH's is used now: deckGroupCol), what it's for]. Not danger: red is a chip
// with no power.
const DECK_GROUPS = {
  boot: ['BOOT', 'rep', 'what a run starts with'], bios: ['BIOS', 'rep', "the run's rules"],
  crash: ['CRASH', 'bright', 'what happens when you die'], spoils: ['SPOILS', 'money', 'what corp bosses give'],
  shell: ['SHELL', 'accent', 'one command for THE SHELL'], psu: ['PSU', 'money', 'the cell: your power budget'],
  glyph: ['GLYPH', 'bright', 'your favourite glyph'], ov: ['OVERVOLT', 'money', 'pay with integrity'],
  sudo: ['SUDO', 'accent', 'the strong commands'], boss: ['BOSS', 'money', 'wide chips from the big bosses'],
  heat: ['HEAT', 'legendary', 'harder runs, more REP'],
};

// chips: key: [name, group, rarity, power, what it does (the long text: the picker, 4 rows at most), face (top row,
// bottom row: 3 wide, 5 for BOSS), tip (the short text: the card's ticker), its numbers]. What each one does in a run:
// the hooks in engine/deck.js (chipOn), one per chip, each marked "(a chip: engine/deck.js)" where it lives. Power: 0
// for switches, handicaps and looks; 1 most; 2 strong; 3 run-changers.
// Its numbers (the 8th field, all optional):
//   tags     what it touches (docs/DECK.md "Seeds"; not shown in the game): map (what a run generates), rules (what it
//            pays or drops), you (your start, tools, deaths). Every chip has them.
//   int      max INTEGRITY it adds or takes             cell     a cell's power (PSU; WIND-UP's grows: deckCellPower)
//   charges  THE SHELL's charges it gives (SHELL, SUDO)  rep      a HEAT chip's REP (x, they multiply)
//   favor    corps it makes come up more (deckFavor)     kit      a KIT: only in the KIT socket (BT1)
//   noDrop   never drops (THE BOARD's posts or a quest give it, or it comes with the deck)
//   ripped   RIPPED: only from rivals and THE FENCE; the number is its place in the rivals' roll (keep the order: a
//            seed's drops follow it)
//   beta     it doesn't do its whole job yet: what's missing (Greg, 2026-11-16). It shows BETA and never drops.
const DECK_CHIPS = {
  // BOOT: what a run starts with (engine/deck.js deckRunStart)
  PG0: ['PURGE', 'boot', 'common', 0, 'start every run with a PURGE. it comes with your deck. swap it out for something better.', ['PRG', '<x>'], 'start with a PURGE.', { tags: ['you'], noDrop: 1 }],   // (before the deck everyone starts with one: CONFIG.startItems)
  AR1: ['THE ARCHIVE', 'boot', 'legendary', 2, "start every run with a mod you've found: pick it on this chip's card. no exotics. (THE BOARD: THE ARCHIVE)", ['[A]', 'ARC'], 'start with the mod you picked.', { tags: ['you'], noDrop: 1 }],
  FA1: ['FIRST AID', 'boot', 'common', 1, 'start every run with a PATCH. (THE BOARD: FIRST AID)', ['[+]', 'AID'], 'start with a PATCH.', { tags: ['you'], noDrop: 1 }],
  LS1: ['LUCKY START', 'boot', 'common', 1, 'start every run with a random common gear. (THE BOARD: LUCKY START)', ['7?7', 'LCK'], 'start with a common gear.', { tags: ['you'], noDrop: 1 }],
  TF1: ['TRUST FUND', 'boot', 'common', 1, 'start every run with +60cr.', ['$$$', '+60'], 'start with +60cr.', { tags: ['you'] }],
  LD3: ['CARE PACKAGE', 'boot', 'rare', 2, 'a KIT: start every run with 3 FWALLs and 2 FRAGs. (lob them at spawn.)', ['[#]', '*!*'], 'start with 3 FWALLs and 2 FRAGs.', { tags: ['you'], kit: 1 }],   // (was LOADOUT: Greg, 2026-11-22)
  BM4: ['BEAST MASTER', 'boot', 'epic', 2, 'start every run with 3 CALLs: your crew on speed dial.', ['@@@', 'BMS'], 'start with 3 CALLs.', { tags: ['you'] }],
  FI2: ['FRESH INSTALL', 'boot', 'rare', 1, 'no starter perk. you start with +2 INT and +100cr instead.', ['NEW', '+2^'], 'no starter perk: +2 INT, +100cr.', { tags: ['you'], int: 2 }],
  // BIOS: the run's rules
  QT0: ['QUIET', 'bios', 'rare', 1, 'no rival hackers turn up. (a corp with the RIVAL anomaly has nobody.)', ['shh', '...'], 'no rival hackers.', { tags: ['map'] }],
  // CRASH: when you die
  DM5: ['DEADMAN', 'crash', 'epic', 1, 'dying keeps 50% of the REP you would have banked.', ['DED', 'MAN'], 'die and keep half your REP.', { tags: ['you'] }],
  '1UP': ['1UP', 'crash', 'exotic', 3, "b0y's crash unit, from beating G0D: die in a corp and CONTINUE? from its start, the way you went in. it charges again every sector.", ['1UP', 'b0y'], "die: back to the corp's start.", { tags: ['you'], noDrop: 1 }],   // (engine/oneup.js oneUpOpen; never drops: deckGift)
  SD6: ['SELF DESTRUCT', 'crash', 'rare', 1, 'die and every mod and gear on you goes up: their letters land at your WORKBENCH.', ['*!*', 'SDX'], 'die: it all turns to letters.', { tags: ['you'] }],   // (deckSelfDestruct)
  BB7: ['BLACK BOX', 'crash', 'rare', 2, "when you die, your best mod goes into your WORKBENCH's LOCKER, a step lower (if there's room).", ['[#]', 'BOX'], 'a mod survives your death.', { tags: ['you'] }],
  // SPOILS: what corp bosses give
  SP3: ['SPOILS', 'spoils', 'common', 0, 'a switch for corp bosses: take the REWARDS, or skip them for a HEAL (2 INT) or for CASH (60cr).', ['SPL', null], 'take boss rewards, a heal, or cash.', { tags: ['rules'], noDrop: 1 }],
  // PSU: the cell
  SC1: ['STOCK CELL', 'psu', 'common', 0, 'comes with the deck. power 6.', ['[+]', 'C:6'], 'power 6.', { tags: ['you'], cell: 6, noDrop: 1 }],
  LI2: ['LI-ION', 'psu', 'rare', 0, 'a better cell. power 9.', ['[+]', 'Li9'], 'power 9.', { tags: ['you'], cell: 9 }],
  NC3: ['NANO CELL', 'psu', 'epic', 0, 'a mk III era cell. power 11.', ['[+]', 'Nb'], 'power 11.', { tags: ['you'], cell: 11 }],
  RX9: ['REACTOR', 'psu', 'legendary', 0, 'power 14 (E), but -1 starting INT.', ['(*)', 'RxE'], 'power 14, -1 INT.', { tags: ['you'], int: -1, cell: 14 }],
  // OVERVOLT (mk III): pay with integrity
  GR8: ['GREED', 'ov', 'rare', 2, '-1 starting INT. +25% credits.', ['GRD', '$-1'], '-1 INT, +25% credits.', { tags: ['you', 'rules'], int: -1 }],
  LK7: ['LUCK', 'ov', 'epic', 2, '-1 starting INT. 1 in 5 mods, gear and chips roll rarer.', ['777', 'LCK'], '-1 INT, rarer drops.', { tags: ['you', 'rules'], int: -1 }],
  FM2: ['FAME', 'ov', 'rare', 2, '-1 starting INT. +20% REP.', ['FME', '*-1'], '-1 INT, +20% REP.', { tags: ['you', 'rules'], int: -1 }],
  SK1: ['SPIKE', 'ov', 'common', 0, '-1 starting INT. +2 power for your deck.', ['/\\/', '+2P'], '-1 INT, +2 power.', { tags: ['you'], int: -1 }],
  // SHELL: one command each, in THE SHELL (` opens it). a stand-in pair until THE SHELL is sorted out (Greg)
  WH0: ['whoami', 'shell', 'common', 1, "THE SHELL learns whoami: your run so far, and the REP you'd bank if you cashed out now. (` opens THE SHELL.)", ['who', '?_?'], 'whoami: your run so far.', { tags: ['you'], charges: 3 }],
  CA4: ['CAPACITOR', 'shell', 'common', 1, 'no command: just charges for THE SHELL. pair it with a strong one.', ['|||', '+4 '], 'just charges.', { tags: ['you'], charges: 4 }],
  MN1: ['man', 'shell', 'rare', 1, "ROOT's chip, from its quest: THE SHELL learns man: this corp's codex entry, mid-layer (its tell once you've beaten it). (` opens THE SHELL.)", ['man', '[?]'], "man: this corp's codex entry.", { tags: ['you'], charges: 2, noDrop: 1 }],
  PS4: ['ps', 'shell', 'rare', 1, 'THE SHELL learns ps: the rival hackers in this corp, by name, and how hurt they are. (` opens THE SHELL.)', ['ps ', '@ @'], 'ps: name the rivals.', { tags: ['you'], charges: 2 }],
  // (v15.03, docs/DECK.md SHELL: the rest of the list)
  CD2: ['cd ..', 'shell', 'rare', 1, 'THE SHELL learns cd ..: on the map, your next move can go back a row (somewhere you skipped). (` opens THE SHELL.)', ['cd ', '..^'], 'cd ..: go back a row.', { tags: ['you'], charges: 2 }],
  SN5: ['scan', 'shell', 'common', 1, "THE SHELL learns scan: the corps ahead in this sector, with their tiers and anomalies, and BLINDERS and FOG lifted for the sector. (` opens THE SHELL.)", ['(((', 'SCN'], 'scan: the corps ahead.', { tags: ['you'], charges: 3 }],
  RM1: ['rm', 'shell', 'rare', 1, 'THE SHELL learns rm: one ICE on this layer is deleted. (` opens THE SHELL.)', ['rm ', '[x]'], 'rm: delete one ICE.', { tags: ['you'], charges: 2 }],
  KL9: ['kill', 'shell', 'common', 1, 'THE SHELL learns kill -9: you flatline yourself. the run ends now, as a death. (` opens THE SHELL.)', ['-9 ', 'x_x'], 'kill -9: end the run.', { tags: ['you'], charges: 2 }],
  CT1: ['cat', 'shell', 'common', 1, "THE SHELL learns cat: what a DATA CACHE holds (its loot and its picks) before you open it. (` opens THE SHELL.)", ['cat', '=^.'], 'cat: see inside a cache.', { tags: ['you'], charges: 3 }],
  ZZ3: ['sleep', 'shell', 'rare', 1, 'THE SHELL learns sleep: the layer clock stops for 5 seconds once you close THE SHELL. once a layer. (` opens THE SHELL.)', ['zzz', '5s '], 'sleep: the clock stops 5s.', { tags: ['you'], charges: 2 }],
  WI5: ['whois', 'shell', 'epic', 1, "THE SHELL learns whois: this corp's tell, beaten or not. (` opens THE SHELL.)", ['who', 'is?'], "whois: this corp's tell.", { tags: ['you'], charges: 1 }],
  UD2: ['undo', 'shell', 'epic', 2, 'THE SHELL learns undo: take back your last ICE hit on this layer. (` opens THE SHELL.)', ['<-z', 'UND'], 'undo: take back an ICE hit.', { tags: ['you'], charges: 1 }],
  // SUDO (mk IV): the strong commands
  FL3: ['flatline', 'sudo', 'legendary', 3, 'THE SHELL learns flatline: a rival hacker in this corp drops dead. once a corp. (` opens THE SHELL.)', ['FLT', '_/\\'], 'flatline: a rival drops dead.', { tags: ['you'], charges: 3 }],
  // (v15.03: the player versions of dev commands. In dev mode the same name is the free dev version: engine/shell.js)
  GD1: ['mode.god', 'sudo', 'legendary', 3, 'THE SHELL learns mode.god: ICE does no damage for the rest of this sector. (` opens THE SHELL.)', ['GOD', '(+)'], 'mode.god: no damage, a sector.', { tags: ['you'], charges: 4 }],
  HD4: ['mode.hold', 'sudo', 'epic', 2, "THE SHELL learns mode.hold: the layer clocks stop for the rest of this corp. (` opens THE SHELL.)", ['|| ', 'HLD'], 'mode.hold: no clocks, a corp.', { tags: ['you'], charges: 3 }],
  RL2: ['show.real', 'sudo', 'epic', 2, 'THE SHELL learns show.real: the real node is marked on this layer. once a corp. (` opens THE SHELL.)', ['[*]', 'RL!'], 'show.real: mark the real node.', { tags: ['you'], charges: 2 }],
  BR3: ['breach', 'sudo', 'legendary', 3, 'THE SHELL learns breach: you win this layer outright, full pay. once a run. (` opens THE SHELL.)', ['>>>', 'BRC'], 'breach: win a layer.', { tags: ['you'], charges: 4 }],
  GM1: ['give.mod', 'sudo', 'epic', 2, 'THE SHELL learns give.mod: name a mod you have found and it is yours. epic and up: only ones you have shredded. it costs more the rarer it is. (` opens THE SHELL.)', ['+M ', 'GVE'], 'give.mod: name a mod.', { tags: ['you'], charges: 4 }],
  GC4: ['give.chip', 'sudo', 'legendary', 3, 'THE SHELL learns give.chip: name a chip you have shredded at a WORKBENCH and it is on your belt. it costs more the rarer it is. (` opens THE SHELL.)', ['+C ', 'GVE'], 'give.chip: name a chip.', { tags: ['you'], charges: 4 }],   // (deckGiveChip)
  GG1: ['give.gear', 'sudo', 'epic', 2, 'THE SHELL learns give.gear: name gear you have found and it is on your belt. epic and up: only what you have shredded. it costs more the rarer it is. (` opens THE SHELL.)', ['+G ', 'GVE'], 'give.gear: name your gear.', { tags: ['you'], charges: 4 }],
  // (v15.06: the rest of the SUDO list, docs/DECK.md)
  FK2: ['fork', 'sudo', 'legendary', 3, 'THE SHELL learns fork: the real node forks. every layer of this corp has two, with the same glyph, and the pay stays whole. (` opens THE SHELL.)', ['fk<', '(*)'], 'fork: two real nodes, a corp.', { tags: ['you'], charges: 4 }],
  FT3: ['mode.free', 'sudo', 'epic', 2, 'THE SHELL learns mode.free: any node in this sector is open to you, the boss too, till the sector ends. (` opens THE SHELL.)', ['<->', 'FRE'], 'mode.free: go anywhere, a sector.', { tags: ['you'], charges: 3 }],
  JM4: ['corp.jump', 'sudo', 'legendary', 3, "THE SHELL learns corp.jump: skip the rest of this corp's layers, straight to its boss. (` opens THE SHELL.)", ['>>|', 'JMP'], "corp.jump: straight to the boss.", { tags: ['you'], charges: 4 }],
  RF4: ['rm -rf', 'sudo', 'legendary', 3, 'THE SHELL learns rm -rf: every ICE on this layer is deleted. not on a sector boss. (` opens THE SHELL.)', ['rm*', '-rf'], 'rm -rf: delete all the ICE.', { tags: ['you'], charges: 4 }],
  CM3: ['chmod', 'sudo', 'epic', 2, 'THE SHELL learns chmod: one of your mods goes up a rarity till the sector ends. (` opens THE SHELL.)', ['+x ', 'CHM'], 'chmod: a mod up a rarity.', { tags: ['you'], charges: 3 }],
  // BOSS (mk IV): big chips from the big bosses
  OMNI: ["OMNI'S EYE", 'boss', 'exotic', 3, "every corp's card on the map shows its tell.", ['<(@)>', 'OMNI '], 'every corp shows its tell.', { tags: ['you'] }],
  // HEAT (mk IV): harder runs, more REP
  HC1: ['HARDCORE', 'heat', 'epic', 0, 'no CRASH chip works. +50% REP.', ['HRD', 'x_x'], 'no CRASH chip, +50% REP.', { tags: ['rules', 'you'], rep: 0.5 }],
  TX2: ['TAXED', 'heat', 'rare', 0, 'a cut of every payout: -20% credits. +25% REP.', ['TAX', '-$%'], '-20% credits, +25% REP.', { tags: ['rules'], rep: 0.25 }],
  // ---- the second set (Greg, 2026-11-16: "just make up most of those other chips"). DECK_BETA: the ones that don't do
  // their whole job yet (they never drop: the editor and THE SHELL give them)
  // BOOT
  PL3: ['PRELOAD', 'boot', 'common', 1, 'a KIT: start every run with 2 random gear.', ['[?]', 'x2 '], 'start with 2 random gear.', { tags: ['you'], kit: 1 }],
  BP1: ['FREE PRESS', 'boot', 'rare', 1, 'your first WORKBENCH build each run uses up no letters.', ['[=]', 'PRS'], 'first bench build: free.', { tags: ['you'] }],   // (was BLUEPRINT: Greg, 2026-11-21, blueprints are the bench's now)
  JD6: ['JUNK DRAWER', 'boot', 'rare', 2, 'a KIT: start with 3 low mods, a different 3 each run: BOX OF WIRES, COOLANT, SKIMMER, BUFFER, BURNER, STASH.', ['%#~', 'JNK'], 'start with 3 random low mods.', { tags: ['you'], kit: 1 }],
  PD7: ['PALADIN', 'boot', 'epic', 2, 'a KIT (a class): start with BUFFER, 2 FWALLs and a PATCH.', ['+|+', 'PAL'], 'BUFFER, 2 FWALLs, a PATCH.', { tags: ['you'], kit: 1 }],
  RG6: ['ROGUE', 'boot', 'epic', 2, 'a KIT (a class): start with PICKPOCKET, a SPLIT and a SHAKE.', ['-/-', 'RGE'], 'PICKPOCKET, SPLIT, SHAKE.', { tags: ['you'], kit: 1 }],
  KN8: ['KNIGHT', 'boot', 'rare', 2, 'a KIT (a class): start with BURNER, 2 FWALLs and a FRAG.', ['[#]', 'KNT'], 'BURNER, 2 FWALLs, a FRAG.', { tags: ['you'], kit: 1 }],
  CL3: ['CLERIC', 'boot', 'legendary', 3, 'a KIT (a class): start with FAILSAFE and 2 PATCHes.', ['(+)', 'CLR'], 'FAILSAFE, 2 PATCHes.', { tags: ['you'], kit: 1 }],
  HS1: ['HEADSTART', 'boot', 'rare', 2, 'your first move can be any node in the first 2 rows.', ['>>|', 'HS1'], 'jump in, up to 2 rows.', { tags: ['map'] }],   // (engine/render.js availableNodes)
  // BIOS
  LU6: ['LOUD', 'bios', 'rare', 1, 'rival hackers turn up more (1 corp in 4 that had none), and each one you beat pays double.', ['!!!', 'LUD'], 'more rivals, double pay.', { tags: ['map', 'rules'] }],
  LY1: ['+1 LAYER', 'bios', 'rare', 1, 'every corp has one more layer before its boss. more REP, more risk. (THE BOARD: +1 LAYER)', ['+1 ', '[=]'], 'every corp: one more layer.', { tags: ['map'], noDrop: 1 }],   // (engine/run.js corpPlan)
  FR5: ['FRESH', 'bios', 'rare', 1, "corps you haven't beaten come up more.", ['NEW', 'FR5'], 'unbeaten corps come up more.', { tags: ['map'] }],
  EV2: ['INTO THE FIRE', 'bios', 'rare', 1, 'sector 1 gets a sector event too.', ['^^^', 'FIR'], 'an event in sector 1.', { tags: ['map'] }],   // (was EVENTS: Greg, 2026-11-22. deckFireEvent)
  AD0: ['ADWARE', 'bios', 'common', 1, "ads come up twice as often, and tapping a button in one (not its [x]) heals 1 INT.", ['AD!', '+1^'], 'ads heal you.', { tags: ['map'], beta: 'built; no way to get it yet (an ad corp\'s boss, BACKLOG)' }],
  SR4: ['BENCH LINK', 'bios', 'epic', 2, 'your WORKBENCH at every UPLINK: shred, build, take from its LOCKER before you push on.', ['[+]', 'LNK'], 'the WORKBENCH at the UPLINK.', { tags: ['map'] }],   // (was SAFE ROUTE, a safehouse on every map: Greg, 2026-11-22. engine/runend.js openUplink)
  PP2: ['PIER PASS', 'bios', 'rare', 1, 'once a sector, phish at a market, safehouse or cache in place of going in. rarer catches.', ['~~~', 'PIR'], 'phish at a rest stop.', { tags: ['map'] }],
  AL4: ['ALMANAC', 'bios', 'common', 1, "see the next sector's event early: its card comes after this sector's.", ['(*)', 'ALM'], 'see the next event early.', { tags: ['you'] }],
  CS7: ['CASINO', 'bios', 'rare', 1, 'the casino corps come up more: LUCKEEZ, MONTY, BIDBLITZ, DROP-4.', ['$7$', 'CAS'], 'casino corps come up more.', { tags: ['map'], favor: ['luckeez', 'monty', 'bidblitz', 'drop4'] }],
  CK9: ['CLOCK', 'bios', 'rare', 1, 'the clock corps come up more: CHANNEL 9, COLDBREW, WATCHPOINT, RYDR.', ['(L)', 'CLK'], 'clock corps come up more.', { tags: ['map'], favor: ['channel9', 'coldbrew', 'watchpoint', 'rydr'] }],
  DK6: ['DARK', 'bios', 'rare', 1, 'the dark corps come up more: BLACKOUT, NOIR, PREDATOR.', ['###', 'DRK'], 'dark corps come up more.', { tags: ['map'], favor: ['blackout', 'noir', 'predator'] }],
  // CRASH
  CP0: ['CHECKPOINT', 'crash', 'epic', 2, 'once a run, die and you come back with nothing (no mods, no gear, no credits) but full INT.', ['[>]', 'CKP'], 'once a run: back, with nothing.', { tags: ['you'] }],
  RK1: ['ROOTKIT', 'crash', 'epic', 2, "die with THE SHELL's charges left: they all burn, and you're back with 1 INT. charges back, and it can save you again.", ['RKT', '>_<'], 'die: burn your charges, live.', { tags: ['you'] }],
  EJ1: ['EJECT', 'crash', 'rare', 1, 'THE SHELL learns eject: cash out from the map, anywhere, once a run. (` opens THE SHELL.)', ['^^^', 'EJT'], 'eject: cash out from the map.', { tags: ['you'] }],
  IN5: ['INSURANCE', 'crash', 'common', 1, 'die and your next run starts with half the credits you had. (read the fine print.)', ['$/2', 'INS'], 'die: half your credits next run.', { tags: ['you'] }],
  DD3: ['DEAD DROP', 'crash', 'rare', 1, "when you die, your gear is waiting in your next run's first DATA CACHE.", ['[v]', 'DRP'], 'die: your gear waits for you.', { tags: ['you'] }],
  CX5: ['CODEX', 'crash', 'rare', 1, "die in a corp you haven't beaten: a third of its tell decodes in the codex.", ['[?]', 'CDX'], 'die: a piece of its tell.', { tags: ['you'], noDrop: 1 }],   // (THE BOARD's CODEX post gives it: deckCodexDeath)
  OB1: ['OBITUARY', 'crash', 'rare', 1, 'die past layer 30 and you keep all your REP, as if you cashed out. (if it bleeds, it leads.)', ['RIP', '30+'], 'die past 30: keep your REP.', { tags: ['you'] }],
  MM4: ['FORGET-ME-NOT', 'crash', 'common', 1, 'on a seed you played, the map marks your last path. (you were here before.)', ['*.*', 'MEM'], 'see your last path.', { tags: ['you'] }],
  // SPOILS (in place of the switch)
  GE1: ['GEAR', 'spoils', 'common', 1, 'corp bosses give 3 gear to pick from, not mods.', ['[%]', 'GER'], 'bosses give gear, not mods.', { tags: ['rules'] }],
  OF1: ['OFFERING', 'spoils', 'rare', 1, 'skip every corp boss reward and bank 6 REP instead. (have faith. or pay.)', ['_|_', '+6R'], 'skip rewards: +6 REP.', { tags: ['rules'] }],
  PT1: ['PROTECTION', 'spoils', 'rare', 1, 'skip every corp boss reward for 2 FWALLs. (nice node you got.)', ['[#]', 'x2 '], 'skip rewards: 2 FWALLs.', { tags: ['rules'] }],
  GB2: ['GAMBLE', 'spoils', 'epic', 2, 'one mystery pick in the rewards, good or lame. pick it and it is yours.', ['???', 'GMB'], 'a mystery reward.', { tags: ['rules'] }],
  AU2: ['AUCTION', 'spoils', 'rare', 2, "a corp boss's rewards get a REROLL button: pay credits to swap a pick for another (more each time).", ['$>$', 'AUC'], 'reroll rewards for cr.', { tags: ['rules'] }],
  SV1: ['SALVAGE', 'spoils', 'common', 1, "a corp boss's rewards get a SALVAGE button: take a pick as its letters, for the WORKBENCH.", ['abc', 'SLV'], 'rewards into letters.', { tags: ['rules'] }],
  RC1: ['RELIC', 'spoils', 'legendary', 2, 'now and then a corp boss adds an exotic mod to its rewards: one more pick.', ['<X>', 'RLC'], 'an exotic, now and then.', { tags: ['rules'], noDrop: 1 }],   // (THE BOARD's RELIC post gives it: deckRelicPick)
  HL2: ['HEIRLOOM', 'spoils', 'epic', 2, "a corp boss's rewards get a LOCKER button: your pick goes into your WORKBENCH's LOCKER, for a later run.", ['{L}', 'HLM'], 'your pick: to the LOCKER.', { tags: ['rules'] }],
  // PSU (cells: their power is deckCellPower)
  BO1: ['BROWNOUT', 'psu', 'epic', 0, 'power 12, but one random chip is off each run (a note says which).', ['[~]', 'Bo~'], 'power 12, one chip off.', { tags: ['you'], cell: 12 }],
  PO1: ['POTATO', 'psu', 'common', 0, 'power 4, but chips that cost 1 cost nothing.', ['(o)', 'Po4'], 'power 4, 1s are free.', { tags: ['you'], cell: 4 }],
  WU3: ['WIND-UP', 'psu', 'rare', 0, 'power: 2, +2 for every sector you cleared in your last cash-out (14 at most). (wind it up!)', ['@>-', 'WUP'], 'power from your last cash-out.', { tags: ['you'] }],
  SPC: ['SPORE CELL', 'psu', 'exotic', 0, 'power 15, and the mold creeps over your board.', ['{*}', 'SpF'], 'power 15. the mold creeps.', { tags: ['you'], cell: 15, beta: 'built; no way to get it yet (beating the M0LD, BACKLOG)' }],
  // OVERVOLT
  DN1: ['DONOR', 'ov', 'rare', 2, '-1 starting INT. one more mod to pick from at the start. (this might sting.)', ['+1M', 'v-1'], '-1 INT, a bigger starter pick.', { tags: ['you'], int: -1 }],
  GL2: ['GLASS', 'ov', 'epic', 2, '-2 starting INT. every ICE hit pays 8cr.', ['/ /', '$-2'], '-2 INT, ICE pays 8cr.', { tags: ['you', 'rules'], int: -2 }],
  SX1: ['SACRIFICE', 'ov', 'epic', 1, "the UPLINK takes INT instead: give all but 1 (a ZOMBIE: rot, to one hit from falling apart) and there's no fee. a choice there, not a must. (THE BOARD: SACRIFICE)", ['-^-', 'SAC'], 'pay the UPLINK in INT.', { tags: ['you'], noDrop: 1 }],   // (engine/runend.js openUplink; Greg, 2026-11-22. BRUTE FORCE: a name kept for later)
  CH1: ['CHEAPSKATE', 'ov', 'rare', 2, '-1 starting INT. markets are 20% cheaper.', ['%-%', 'v-1'], '-1 INT, markets -20%.', { tags: ['you', 'rules'], int: -1 }],
  TP1: ['TOLL PASS', 'ov', 'rare', 2, '-1 starting INT. UPLINKs cost 25% less. (exact change only.)', ['=|=', 'v-1'], '-1 INT, UPLINKs -25%.', { tags: ['you', 'rules'], int: -1 }],
  RE1: ['RED EYE', 'ov', 'epic', 2, '-1 starting INT. one ICE node on every layer is marked. (another shot?)', ['(x)', 'v-1'], '-1 INT, one ICE marked.', { tags: ['you'], int: -1 }],
  LG2: ['LAG', 'ov', 'rare', 2, '-1 starting INT. layer clocks get 2 more seconds.', ['~~>', 'v-1'], '-1 INT, clocks +2s.', { tags: ['you'], int: -1 }],
  UV1: ['UNDERVOLT', 'ov', 'common', 1, '+1 starting INT. -25% credits.', ['^+1', '$-%'], '+1 INT, -25% credits.', { tags: ['you', 'rules'], int: 1 }],
  PD2: ['PADDING', 'ov', 'rare', 1, '+2 starting INT. perfect layers pay no REP.', ['[=]', '^+2'], '+2 INT, perfects: no REP.', { tags: ['you', 'rules'], int: 2 }],
  DG3: ['DANGEROUS CATCH', 'ov', 'rare', 1, 'at the PIER, 1 PHISH in 5 bites you when you land it: -1 INT. in return, catches run rarer and PHISH sells for half again as much.', ['<!<', 'BIT'], 'the pier bites. rarer, pricier.', { tags: ['you', 'rules'] }],   // (Greg, meat notes 2026-11-22; engine/fishing.js fishDanger)
  // HEAT (free: they cost you, and pay REP)
  HN1: ['HUNTED', 'heat', 'rare', 0, 'rivals turn up in half the corps that had none. +25% REP.', ['>@<', 'HNT'], 'more rivals, +25% REP.', { tags: ['map', 'rules'], rep: 0.25 }],
  SF2: ['SHORT FUSE', 'heat', 'common', 0, 'layer clocks lose 2 seconds. +20% REP.', ['-2s', 'SFZ'], 'clocks -2s, +20% REP.', { tags: ['rules'], rep: 0.2 }],
  NM0: ['NO MEDS', 'heat', 'rare', 0, 'no PATCHes drop or sell, and markets have no repair. +20% REP.', ['x+x', 'NMD'], 'no PATCH, no repair, +20% REP.', { tags: ['rules'], rep: 0.2 }],
  IF1: ['INFLATION', 'heat', 'common', 0, 'market prices go up 10% every sector. +15% REP.', ['$^$', 'INF'], 'prices +10% a sector, +15% REP.', { tags: ['rules'], rep: 0.15 }],
  DC4: ['DECAY', 'heat', 'epic', 0, 'your mods drop a step every sector. +30% REP.', ['v.v', 'DCY'], 'mods decay, +30% REP.', { tags: ['rules'], rep: 0.3 }],
  FG0: ['FOG', 'heat', 'rare', 0, 'the map shows only the next row. +15% REP.', ['...', 'FOG'], 'see one row ahead, +15% REP.', { tags: ['rules'], rep: 0.15 }],
  GT1: ['GLITCH', 'heat', 'common', 0, 'every ICE hit glitches the screen, worse every time. +10% REP.', ['#!#', 'GLT'], 'ICE glitches you, +10% REP.', { tags: ['rules'], rep: 0.1 }],
  // ---- RIPPED (Greg, 2026-11-21; docs/DECK.md "The sources"): a set of their own, only from rivals and THE FENCE, the
  // rarer the stronger. They slot into the usual sockets. Carry one and rivals come for it (deckRippedOn).
  LW1: ['LIFTED WALLET', 'boot', 'common', 1, 'start each run with +50cr. somebody is missing it.', ['$<-', 'LFT'], '+50cr to start.', { tags: ['you'], ripped: 1 }],
  TN2: ["TURBO'S NITRO", 'boot', 'rare', 1, 'start each run with 2 WARP.', ['>>~', 'NTR'], 'start with 2 WARP.', { tags: ['you'], ripped: 2 }],
  VE2: ["VULTURE'S CUT", 'bios', 'rare', 1, 'beating a rival pays +50%.', ['\\v/', 'CUT'], 'rivals pay +50%.', { tags: ['rules'], ripped: 3 }],
  DM3: ["D0PPEL'S MASK", 'boot', 'epic', 2, '+2 max INTEGRITY.', ['(=)', 'DPL'], '+2 max INT.', { tags: ['you'], int: 2, ripped: 4 }],
  PH3: ["PH1SH'S HOOK", 'bios', 'epic', 2, 'rivals you beat drop a chip twice as often (60%).', ['_J ', 'HK!'], 'rivals drop more chips.', { tags: ['rules'], ripped: 5 }],
  HF9: ["HCF'S CORE", 'psu', 'exotic', 0, 'a cell: power 18. it runs hot. halt and catch fire. (HCF drops it most.)', ['!#!', 'C18'], 'power 18.', { tags: ['you'], cell: 18, ripped: 7 }],   // (Greg, 2026-11-22: the exotic RIPPED chip; any rival or THE FENCE, rarely)
  SY4: ["SYSOP'S KEY", 'boot', 'legendary', 3, "the first layer of every corp: the real node is marked.", ['#*#', 'SYS'], 'first layers: real node marked.', { tags: ['you'], ripped: 6 }],
};

// The tables the engine reads, built from the entries
const chipFx = (f, pick = v => v) => Object.fromEntries(Object.keys(DECK_CHIPS).filter(k => DECK_CHIPS[k][7] && DECK_CHIPS[k][7][f] != null).map(k => [k, pick(DECK_CHIPS[k][7][f])]));
const chipList = f => Object.keys(DECK_CHIPS).filter(k => DECK_CHIPS[k][7] && DECK_CHIPS[k][7][f]);
const DECK_CHIP_TAGS = chipFx('tags'), DECK_INT = chipFx('int'), DECK_CELL = chipFx('cell'), DECK_CHARGES = chipFx('charges');
const DECK_HEAT_REP = chipFx('rep'), DECK_FAVOR = chipFx('favor'), DECK_BETA = chipFx('beta');
const DECK_KITS = chipList('kit'), DECK_NO_DROP = chipList('noDrop');
const DECK_RIPPED = chipList('ripped').sort((a, b) => DECK_CHIPS[a][7].ripped - DECK_CHIPS[b][7].ripped);
