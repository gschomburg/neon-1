// NeoN+1 engine/deck.js: YOUR DECK (docs/DECK.md). Two ways in:
// - The real deck: THE BOARD > YOU > [ YOUR DECK ]. You get it at USER (POPS calls). What you own and where it sits is
//   save.deck; your mk comes from THE BOARD's posts (DECK mk III, THE FUSE: engine/save.js LEGACY), your REP is save.rep.
// - The dev screen: the editor's "the deck (dev)" (engine/editor.js SCENES.deck). Every chip, its own REP, nothing saved.
// The board art: SCENE_ART.deck (asxii_art/deck_board_v06, copied in by tools/data/scene_art.js). The socket and part
// spots below are read off that art: move them when the art moves.
'use strict';
NEON_FILES.push(['engine/deck.js', 'v15.39']);

// ---------- data: the first chip set (docs/DECK.md "The first chip set", Greg 2026-11-16) ----------
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
// Every socket's color is your deck's: it levels up with your mk (mk II rare, III epic, IV gold: the same as the
// traces, deckTraceCol). GLYPH keeps its own (Greg, 2026-11-16). Red still means no power. Used for a slotted socket's
// outline, the picker's frame and the CHIPS tab's headers.
const deckGroupCol = g => g === 'glyph' ? C[DECK_GROUPS[g][1]] || C.text : deckTraceCol();
// chips: key: [name, group, rarity, power, what it does (the long text: the picker, 4 rows at most), face (top row,
// bottom row: 3 wide, 5 for BOSS), tip (the short text: the card's ticker)]. What each one does in a run: the hooks
// below (chipOn), one per chip, each marked "(a chip: engine/deck.js)" where it lives. Power: 0 for switches, handicaps
// and looks; 1 most; 2 strong; 3 run-changers.
const DECK_CHIPS = {
  // BOOT: what a run starts with (engine/deck.js deckRunStart)
  PG0: ['PURGE', 'boot', 'common', 0, 'start every run with a PURGE. it comes with your deck. swap it out for something better.', ['PRG', '<x>'], 'start with a PURGE.'],   // (before the deck everyone starts with one: CONFIG.startItems)
  AR1: ['THE ARCHIVE', 'boot', 'legendary', 2, "start every run with a mod you've found: pick it on this chip's card. no exotics. (THE BOARD: THE ARCHIVE)", ['[A]', 'ARC'], 'start with the mod you picked.'],
  FA1: ['FIRST AID', 'boot', 'common', 1, 'start every run with a PATCH. (THE BOARD: FIRST AID)', ['[+]', 'AID'], 'start with a PATCH.'],
  LS1: ['LUCKY START', 'boot', 'common', 1, 'start every run with a random common gear. (THE BOARD: LUCKY START)', ['7?7', 'LCK'], 'start with a common gear.'],
  TF1: ['TRUST FUND', 'boot', 'common', 1, 'start every run with +60cr.', ['$$$', '+60'], 'start with +60cr.'],
  LD3: ['CARE PACKAGE', 'boot', 'rare', 2, 'a KIT: start every run with 3 FWALLs and 2 FRAGs. (lob them at spawn.)', ['[#]', '*!*'], 'start with 3 FWALLs and 2 FRAGs.'],   // (was LOADOUT: Greg, 2026-11-22)
  BM4: ['BEAST MASTER', 'boot', 'epic', 2, 'start every run with 3 CALLs: your crew on speed dial.', ['@@@', 'BMS'], 'start with 3 CALLs.'],
  FI2: ['FRESH INSTALL', 'boot', 'rare', 1, 'no starter perk. you start with +2 INT and +100cr instead.', ['NEW', '+2^'], 'no starter perk: +2 INT, +100cr.'],
  // BIOS: the run's rules
  QT0: ['QUIET', 'bios', 'rare', 1, 'no rival hackers turn up. (a corp with the RIVAL anomaly has nobody.)', ['shh', '...'], 'no rival hackers.'],
  // CRASH: when you die
  DM5: ['DEADMAN', 'crash', 'epic', 1, 'dying keeps 50% of the REP you would have banked.', ['DED', 'MAN'], 'die and keep half your REP.'],
  '1UP': ['1UP', 'crash', 'exotic', 3, "b0y's crash unit, from beating G0D: die in a corp and CONTINUE? from its start, the way you went in. it charges again every sector.", ['1UP', 'b0y'], "die: back to the corp's start."],   // (engine/oneup.js oneUpOpen; never drops: deckGift)
  BB7: ['BLACK BOX', 'crash', 'rare', 2, "when you die, your best mod goes into your WORKBENCH's LOCKER, a step lower (if there's room).", ['[#]', 'BOX'], 'a mod survives your death.'],
  // SPOILS: what corp bosses give
  SP3: ['SPOILS', 'spoils', 'common', 0, 'a switch for corp bosses: take the REWARDS, or skip them for a HEAL (2 INT) or for CASH (60cr).', ['SPL', null], 'take boss rewards, a heal, or cash.'],
  // PSU: the cell
  SC1: ['STOCK CELL', 'psu', 'common', 0, 'comes with the deck. power 6.', ['[+]', 'C:6'], 'power 6.'],
  LI2: ['LI-ION', 'psu', 'rare', 0, 'a better cell. power 9.', ['[+]', 'Li9'], 'power 9.'],
  NC3: ['NANO CELL', 'psu', 'epic', 0, 'a mk III era cell. power 11.', ['[+]', 'Nb'], 'power 11.'],
  RX9: ['REACTOR', 'psu', 'legendary', 0, 'power 14 (E), but -1 starting INT.', ['(*)', 'RxE'], 'power 14, -1 INT.'],
  // OVERVOLT (mk III): pay with integrity
  GR8: ['GREED', 'ov', 'rare', 2, '-1 starting INT. +25% credits.', ['GRD', '$-1'], '-1 INT, +25% credits.'],
  LK7: ['LUCK', 'ov', 'epic', 2, '-1 starting INT. 1 in 5 mods and gear roll a step rarer.', ['777', 'LCK'], '-1 INT, rarer drops.'],
  FM2: ['FAME', 'ov', 'rare', 2, '-1 starting INT. +20% REP.', ['FME', '*-1'], '-1 INT, +20% REP.'],
  SK1: ['SPIKE', 'ov', 'common', 0, '-1 starting INT. +2 power for your deck.', ['/\\/', '+2P'], '-1 INT, +2 power.'],
  // SHELL: one command each, in THE SHELL (` opens it). a stand-in pair until THE SHELL is sorted out (Greg)
  WH0: ['whoami', 'shell', 'common', 1, "THE SHELL learns whoami: your run so far, and the REP you'd bank if you cashed out now. (` opens THE SHELL.)", ['who', '?_?'], 'whoami: your run so far.'],
  CA4: ['CAPACITOR', 'shell', 'common', 1, 'no command: just charges for THE SHELL. pair it with a strong one.', ['|||', '+4 '], 'just charges.'],
  MN1: ['man', 'shell', 'rare', 1, "ROOT's chip, from its quest: THE SHELL learns man: this corp's codex entry, mid-layer (its tell once you've beaten it). (` opens THE SHELL.)", ['man', '[?]'], "man: this corp's codex entry."],
  PS4: ['ps', 'shell', 'rare', 1, 'THE SHELL learns ps: the rival hackers in this corp, by name, and how hurt they are. (` opens THE SHELL.)', ['ps ', '@ @'], 'ps: name the rivals.'],
  // (v15.03, docs/DECK.md SHELL: the rest of the list)
  CD2: ['cd ..', 'shell', 'rare', 1, 'THE SHELL learns cd ..: on the map, your next move can go back a row (somewhere you skipped). (` opens THE SHELL.)', ['cd ', '..^'], 'cd ..: go back a row.'],
  SN5: ['scan', 'shell', 'common', 1, "THE SHELL learns scan: the corps ahead in this sector, with their tiers and anomalies, and BLINDERS and FOG lifted for the sector. (` opens THE SHELL.)", ['(((', 'SCN'], 'scan: the corps ahead.'],
  RM1: ['rm', 'shell', 'rare', 1, 'THE SHELL learns rm: one ICE on this layer is deleted. (` opens THE SHELL.)', ['rm ', '[x]'], 'rm: delete one ICE.'],
  KL9: ['kill', 'shell', 'common', 1, 'THE SHELL learns kill -9: you flatline yourself. the run ends now, as a death. (` opens THE SHELL.)', ['-9 ', 'x_x'], 'kill -9: end the run.'],
  CT1: ['cat', 'shell', 'common', 1, "THE SHELL learns cat: what a DATA CACHE holds (its loot and its picks) before you open it. (` opens THE SHELL.)", ['cat', '=^.'], 'cat: see inside a cache.'],
  ZZ3: ['sleep', 'shell', 'rare', 1, 'THE SHELL learns sleep: the layer clock stops for 5 seconds once you close THE SHELL. once a layer. (` opens THE SHELL.)', ['zzz', '5s '], 'sleep: the clock stops 5s.'],
  WI5: ['whois', 'shell', 'epic', 1, "THE SHELL learns whois: this corp's tell, beaten or not. (` opens THE SHELL.)", ['who', 'is?'], "whois: this corp's tell."],
  UD2: ['undo', 'shell', 'epic', 2, 'THE SHELL learns undo: take back your last ICE hit on this layer. (` opens THE SHELL.)', ['<-z', 'UND'], 'undo: take back an ICE hit.'],
  // SUDO (mk IV): the strong commands
  FL3: ['flatline', 'sudo', 'legendary', 3, 'THE SHELL learns flatline: a rival hacker in this corp drops dead. once a corp. (` opens THE SHELL.)', ['FLT', '_/\\'], 'flatline: a rival drops dead.'],
  // (v15.03: the player versions of dev commands. In dev mode the same name is the free dev version: engine/shell.js)
  GD1: ['mode.god', 'sudo', 'legendary', 3, 'THE SHELL learns mode.god: ICE does no damage for the rest of this sector. (` opens THE SHELL.)', ['GOD', '(+)'], 'mode.god: no damage, a sector.'],
  HD4: ['mode.hold', 'sudo', 'epic', 2, "THE SHELL learns mode.hold: the layer clocks stop for the rest of this corp. (` opens THE SHELL.)", ['|| ', 'HLD'], 'mode.hold: no clocks, a corp.'],
  RL2: ['show.real', 'sudo', 'epic', 2, 'THE SHELL learns show.real: the real node is marked on this layer. once a corp. (` opens THE SHELL.)', ['[*]', 'RL!'], 'show.real: mark the real node.'],
  BR3: ['breach', 'sudo', 'legendary', 3, 'THE SHELL learns breach: you win this layer outright, full pay. once a run. (` opens THE SHELL.)', ['>>>', 'BRC'], 'breach: win a layer.'],
  GM1: ['give.mod', 'sudo', 'epic', 2, 'THE SHELL learns give.mod: name a mod you have found and it is yours. epic and up: only ones you have shredded. it costs more the rarer it is. (` opens THE SHELL.)', ['+M ', 'GVE'], 'give.mod: name a mod.'],
  GG1: ['give.gear', 'sudo', 'epic', 2, 'THE SHELL learns give.gear: name gear you have found and it is on your belt. epic and up: only what you have shredded. it costs more the rarer it is. (` opens THE SHELL.)', ['+G ', 'GVE'], 'give.gear: name your gear.'],
  // (v15.06: the rest of the SUDO list, docs/DECK.md)
  FK2: ['fork', 'sudo', 'legendary', 3, 'THE SHELL learns fork: the real node forks. every layer of this corp has two, with the same glyph, and the pay stays whole. (` opens THE SHELL.)', ['fk<', '(*)'], 'fork: two real nodes, a corp.'],
  FT3: ['mode.free', 'sudo', 'epic', 2, 'THE SHELL learns mode.free: any node in this sector is open to you, the boss too, till the sector ends. (` opens THE SHELL.)', ['<->', 'FRE'], 'mode.free: go anywhere, a sector.'],
  JM4: ['corp.jump', 'sudo', 'legendary', 3, "THE SHELL learns corp.jump: skip the rest of this corp's layers, straight to its boss. (` opens THE SHELL.)", ['>>|', 'JMP'], "corp.jump: straight to the boss."],
  RF4: ['rm -rf', 'sudo', 'legendary', 3, 'THE SHELL learns rm -rf: every ICE on this layer is deleted. not on a sector boss. (` opens THE SHELL.)', ['rm*', '-rf'], 'rm -rf: delete all the ICE.'],
  CM3: ['chmod', 'sudo', 'epic', 2, 'THE SHELL learns chmod: one of your mods goes up a rarity till the sector ends. (` opens THE SHELL.)', ['+x ', 'CHM'], 'chmod: a mod up a rarity.'],
  // BOSS (mk IV): big chips from the big bosses
  OMNI: ["OMNI'S EYE", 'boss', 'exotic', 3, "every corp's card on the map shows its tell.", ['<(@)>', 'OMNI '], 'every corp shows its tell.'],
  // HEAT (mk IV): harder runs, more REP
  HC1: ['HARDCORE', 'heat', 'epic', 0, 'no CRASH chip works. +50% REP.', ['HRD', 'x_x'], 'no CRASH chip, +50% REP.'],
  TX2: ['TAXED', 'heat', 'rare', 0, 'a cut of every payout: -20% credits. +25% REP.', ['TAX', '-$%'], '-20% credits, +25% REP.'],
  // ---- the second set (Greg, 2026-11-16: "just make up most of those other chips"). DECK_BETA: the ones that don't do
  // their whole job yet (they never drop: the editor and THE SHELL give them)
  // BOOT
  PL3: ['PRELOAD', 'boot', 'common', 1, 'a KIT: start every run with 2 random gear.', ['[?]', 'x2 '], 'start with 2 random gear.'],
  BP1: ['FREE PRESS', 'boot', 'rare', 1, 'your first WORKBENCH build each run uses up no letters.', ['[=]', 'PRS'], 'first bench build: free.'],   // (was BLUEPRINT: Greg, 2026-11-21, blueprints are the bench's now)
  JD6: ['JUNK DRAWER', 'boot', 'rare', 2, 'a KIT: start with 3 low mods, a different 3 each run: BOX OF WIRES, COOLANT, SKIMMER, BUFFER, BURNER, STASH.', ['%#~', 'JNK'], 'start with 3 random low mods.'],
  PD7: ['PALADIN', 'boot', 'epic', 2, 'a KIT (a class): start with BUFFER, 2 FWALLs and a PATCH.', ['+|+', 'PAL'], 'BUFFER, 2 FWALLs, a PATCH.'],
  RG6: ['ROGUE', 'boot', 'epic', 2, 'a KIT (a class): start with PICKPOCKET, a SPLIT and a SHAKE.', ['-/-', 'RGE'], 'PICKPOCKET, SPLIT, SHAKE.'],
  KN8: ['KNIGHT', 'boot', 'rare', 2, 'a KIT (a class): start with BURNER, 2 FWALLs and a FRAG.', ['[#]', 'KNT'], 'BURNER, 2 FWALLs, a FRAG.'],
  CL3: ['CLERIC', 'boot', 'legendary', 3, 'a KIT (a class): start with FAILSAFE and 2 PATCHes.', ['(+)', 'CLR'], 'FAILSAFE, 2 PATCHes.'],
  HS1: ['HEADSTART', 'boot', 'rare', 2, 'start on the second row of sector 1.', ['>>|', 'HS1'], 'start a row in.'],
  // BIOS
  LU6: ['LOUD', 'bios', 'rare', 1, 'rival hackers turn up more (1 corp in 4 that had none), and each one you beat pays double.', ['!!!', 'LUD'], 'more rivals, double pay.'],
  FR5: ['FRESH', 'bios', 'rare', 1, "corps you haven't beaten come up more.", ['NEW', 'FR5'], 'unbeaten corps come up more.'],
  EV2: ['EVENTS', 'bios', 'rare', 1, 'sector events from sector 1.', ['EVT', '!!1'], 'events from sector 1.'],
  AD0: ['ADWARE', 'bios', 'common', 1, 'more ads, and tapping one heals 1 INT.', ['AD!', '+1^'], 'ads heal you.'],
  SR4: ['SAFE ROUTE', 'bios', 'epic', 2, 'a safehouse on every sector map.', ['[+]', 'SRT'], 'a safehouse every sector.'],
  PP2: ['PIER PASS', 'bios', 'rare', 1, 'a PIER on every sector map, and a rare catch now and then.', ['~~~', 'PIR'], 'a PIER every sector.'],
  AL4: ['ALMANAC', 'bios', 'common', 1, "the next sector's event shows a sector early.", ['(*)', 'ALM'], 'see the next event early.'],
  CS7: ['CASINO', 'bios', 'rare', 1, 'the casino corps come up more: LUCKEEZ, MONTY, BIDBLITZ, DROP-4.', ['$7$', 'CAS'], 'casino corps come up more.'],
  CK9: ['CLOCK', 'bios', 'rare', 1, 'the clock corps come up more: CHANNEL 9, COLDBREW, WATCHPOINT, RYDR.', ['(L)', 'CLK'], 'clock corps come up more.'],
  DK6: ['DARK', 'bios', 'rare', 1, 'the dark corps come up more: BLACKOUT, NOIR, PREDATOR.', ['###', 'DRK'], 'dark corps come up more.'],
  // CRASH
  CP0: ['CHECKPOINT', 'crash', 'epic', 2, 'once a run, die and you come back with nothing (no mods, no gear, no credits) but full INT.', ['[>]', 'CKP'], 'once a run: back, with nothing.'],
  RK1: ['ROOTKIT', 'crash', 'epic', 2, "die with THE SHELL's charges left: they all burn, and you're back with 1 INT. charges back, and it can save you again.", ['RKT', '>_<'], 'die: burn your charges, live.'],
  EJ1: ['EJECT', 'crash', 'rare', 1, 'THE SHELL learns eject: cash out from the map, anywhere, once a run. (` opens THE SHELL.)', ['^^^', 'EJT'], 'eject: cash out from the map.'],
  IN5: ['INSURANCE', 'crash', 'common', 1, 'die and your next run starts with half the credits you had. (read the fine print.)', ['$/2', 'INS'], 'die: half your credits next run.'],
  DD3: ['DEAD DROP', 'crash', 'rare', 1, "when you die, your gear is waiting in your next run's first DATA CACHE.", ['[v]', 'DRP'], 'die: your gear waits for you.'],
  CX5: ['CODEX', 'crash', 'rare', 1, "die in a corp you haven't beaten: a third of its tell decodes in the codex.", ['[?]', 'CDX'], 'die: a piece of its tell.'],   // (THE BOARD's CODEX post gives it: deckCodexDeath)
  OB1: ['OBITUARY', 'crash', 'rare', 1, 'die past layer 30 and you keep all your REP, as if you cashed out. (if it bleeds, it leads.)', ['RIP', '30+'], 'die past 30: keep your REP.'],
  MM4: ['FORGET-ME-NOT', 'crash', 'common', 1, 'on a seed you played, the map marks your last path. (you were here before.)', ['*.*', 'MEM'], 'see your last path.'],
  // SPOILS (in place of the switch)
  GE1: ['GEAR', 'spoils', 'common', 1, 'corp bosses give 3 gear to pick from, not mods.', ['[%]', 'GER'], 'bosses give gear, not mods.'],
  OF1: ['OFFERING', 'spoils', 'rare', 1, 'skip every corp boss reward and bank 6 REP instead. (have faith. or pay.)', ['_|_', '+6R'], 'skip rewards: +6 REP.'],
  PT1: ['PROTECTION', 'spoils', 'rare', 1, 'skip every corp boss reward for 2 FWALLs. (nice node you got.)', ['[#]', 'x2 '], 'skip rewards: 2 FWALLs.'],
  GB2: ['GAMBLE', 'spoils', 'epic', 2, 'one mystery pick in the rewards, good or lame. pick it and it is yours.', ['???', 'GMB'], 'a mystery reward.'],
  AU2: ['AUCTION', 'spoils', 'rare', 2, 'pay credits to reroll a boss reward.', ['$>$', 'AUC'], 'reroll rewards for cr.'],
  SV1: ['SALVAGE', 'spoils', 'common', 1, 'salvage a reward: its letters, for the WORKBENCH.', ['abc', 'SLV'], 'rewards into letters.'],
  RC1: ['RELIC', 'spoils', 'legendary', 2, 'now and then a corp boss adds an exotic mod to its rewards: one more pick.', ['<X>', 'RLC'], 'an exotic, now and then.'],   // (THE BOARD's RELIC post gives it: deckRelicPick)
  HL2: ['HEIRLOOM', 'spoils', 'epic', 2, "the mod you pick at a corp boss goes into your WORKBENCH's LOCKER, for a later run (on you if it's full).", ['{L}', 'HLM'], 'your pick: to the LOCKER.'],
  // PSU (cells: their power is deckCellPower)
  BO1: ['BROWNOUT', 'psu', 'epic', 0, 'power 12, but one random chip is off each run (a note says which).', ['[~]', 'Bo~'], 'power 12, one chip off.'],
  PO1: ['POTATO', 'psu', 'common', 0, 'power 4, but chips that cost 1 cost nothing.', ['(o)', 'Po4'], 'power 4, 1s are free.'],
  WU3: ['WIND-UP', 'psu', 'rare', 0, 'power: 2, +2 for every sector you cleared in your last cash-out (14 at most). (wind it up!)', ['@>-', 'WUP'], 'power from your last cash-out.'],
  SPC: ['SPORE CELL', 'psu', 'exotic', 0, 'power 15, and the mold creeps over your board.', ['{*}', 'SpF'], 'power 15. the mold creeps.'],
  // OVERVOLT
  DN1: ['DONOR', 'ov', 'rare', 2, '-1 starting INT. one more mod to pick from at the start. (this might sting.)', ['+1M', 'v-1'], '-1 INT, a bigger starter pick.'],
  GL2: ['GLASS', 'ov', 'epic', 2, '-2 starting INT. every ICE hit pays 8cr.', ['/ /', '$-2'], '-2 INT, ICE pays 8cr.'],
  CH1: ['CHEAPSKATE', 'ov', 'rare', 2, '-1 starting INT. markets are 20% cheaper.', ['%-%', 'v-1'], '-1 INT, markets -20%.'],
  TP1: ['TOLL PASS', 'ov', 'rare', 2, '-1 starting INT. UPLINKs cost 25% less. (exact change only.)', ['=|=', 'v-1'], '-1 INT, UPLINKs -25%.'],
  RE1: ['RED EYE', 'ov', 'epic', 2, '-1 starting INT. one ICE node on every layer is marked. (another shot?)', ['(x)', 'v-1'], '-1 INT, one ICE marked.'],
  LG2: ['LAG', 'ov', 'rare', 2, '-1 starting INT. layer clocks get 2 more seconds.', ['~~>', 'v-1'], '-1 INT, clocks +2s.'],
  UV1: ['UNDERVOLT', 'ov', 'common', 1, '+1 starting INT. -25% credits.', ['^+1', '$-%'], '+1 INT, -25% credits.'],
  PD2: ['PADDING', 'ov', 'rare', 1, '+2 starting INT. perfect layers pay no REP.', ['[=]', '^+2'], '+2 INT, perfects: no REP.'],
  // HEAT (free: they cost you, and pay REP)
  HN1: ['HUNTED', 'heat', 'rare', 0, 'rivals turn up in half the corps that had none. +25% REP.', ['>@<', 'HNT'], 'more rivals, +25% REP.'],
  SF2: ['SHORT FUSE', 'heat', 'common', 0, 'layer clocks lose 2 seconds. +20% REP.', ['-2s', 'SFZ'], 'clocks -2s, +20% REP.'],
  NM0: ['NO MEDS', 'heat', 'rare', 0, 'no PATCHes drop or sell, and markets have no repair. +20% REP.', ['x+x', 'NMD'], 'no PATCH, no repair, +20% REP.'],
  IF1: ['INFLATION', 'heat', 'common', 0, 'market prices go up 10% every sector. +15% REP.', ['$^$', 'INF'], 'prices +10% a sector, +15% REP.'],
  DC4: ['DECAY', 'heat', 'epic', 0, 'your mods drop a step every sector. +30% REP.', ['v.v', 'DCY'], 'mods decay, +30% REP.'],
  FG0: ['FOG', 'heat', 'rare', 0, 'the map shows only the next row. +15% REP.', ['...', 'FOG'], 'see one row ahead, +15% REP.'],
  GT1: ['GLITCH', 'heat', 'common', 0, 'every ICE hit glitches the screen, worse every time. +10% REP.', ['#!#', 'GLT'], 'ICE glitches you, +10% REP.'],
  // ---- RIPPED (Greg, 2026-11-21; docs/DECK.md "The sources"): a set of their own, only from rivals and THE FENCE, the
  // rarer the stronger. They slot into the usual sockets. Carry one and rivals come for it (deckRippedOn).
  LW1: ['LIFTED WALLET', 'boot', 'common', 1, 'start each run with +50cr. somebody is missing it.', ['$<-', 'LFT'], '+50cr to start.'],
  TN2: ["TURBO'S NITRO", 'boot', 'rare', 1, 'start each run with 2 WARP.', ['>>~', 'NTR'], 'start with 2 WARP.'],
  VE2: ["VULTURE'S CUT", 'bios', 'rare', 1, 'beating a rival pays +50%.', ['\\v/', 'CUT'], 'rivals pay +50%.'],
  DM3: ["D0PPEL'S MASK", 'boot', 'epic', 2, '+2 max INTEGRITY.', ['(=)', 'DPL'], '+2 max INT.'],
  PH3: ["PH1SH'S HOOK", 'bios', 'epic', 2, 'rivals you beat drop a chip twice as often (60%).', ['_J ', 'HK!'], 'rivals drop more chips.'],
  SY4: ["SYSOP'S KEY", 'boot', 'legendary', 3, "the first layer of every corp: the real node is marked.", ['#*#', 'SYS'], 'first layers: real node marked.'],
};
// RIPPED chips: their texts say so (their one-line tip starts RIPPED), and they look it (deckRipGlow)
const DECK_RIPPED = ['LW1', 'TN2', 'VE2', 'DM3', 'PH3', 'SY4'];
const deckIsRipped = k => DECK_RIPPED.includes(k);
for (const k of DECK_RIPPED) { DECK_CHIPS[k][4] = 'RIPPED: from a rival. ' + DECK_CHIPS[k][4]; DECK_CHIPS[k][6] = 'RIPPED. ' + DECK_CHIPS[k][6]; }
// What each chip touches (docs/DECK.md "Seeds"; not shown in the game): map (what a run generates), rules (what it pays
// or drops), you (your start, tools, deaths). Keep it next to DECK_CHIPS: a new chip gets its tags here.
const DECK_CHIP_TAGS = {
  PG0: ['you'], AR1: ['you'], FA1: ['you'], LS1: ['you'], TF1: ['you'], LD3: ['you'], BM4: ['you'], FI2: ['you'], QT0: ['map'], DM5: ['you'], BB7: ['you'], SP3: ['rules'],
  SC1: ['you'], LI2: ['you'], NC3: ['you'], RX9: ['you'], GR8: ['you', 'rules'], LK7: ['you', 'rules'], FM2: ['you', 'rules'], SK1: ['you'],
  WH0: ['you'], MN1: ['you'], CA4: ['you'], RK1: ['you'], PS4: ['you'], FL3: ['you'], CD2: ['you'], SN5: ['you'], RM1: ['you'], KL9: ['you'], CT1: ['you'], ZZ3: ['you'], WI5: ['you'], UD2: ['you'],
  GD1: ['you'], HD4: ['you'], RL2: ['you'], BR3: ['you'], GM1: ['you'], GG1: ['you'], FT3: ['you'], JM4: ['you'], FK2: ['you'], RF4: ['you'], CM3: ['you'], OMNI: ['you'], HC1: ['rules', 'you'], TX2: ['rules'], '1UP': ['you'],
  PL3: ['you'], BP1: ['you'], JD6: ['you'], PD7: ['you'], RG6: ['you'], KN8: ['you'], CL3: ['you'], HS1: ['map'],
  LU6: ['map', 'rules'], FR5: ['map'], EV2: ['map'], AD0: ['map'], SR4: ['map'], PP2: ['map'], AL4: ['you'], CS7: ['map'], CK9: ['map'], DK6: ['map'],
  CP0: ['you'], EJ1: ['you'], IN5: ['you'], DD3: ['you'], OB1: ['you'], MM4: ['you'], CX5: ['you'], RC1: ['rules'],
  GE1: ['rules'], OF1: ['rules'], PT1: ['rules'], GB2: ['rules'], AU2: ['rules'], SV1: ['rules'], HL2: ['rules'],
  BO1: ['you'], PO1: ['you'], WU3: ['you'], SPC: ['you'],
  DN1: ['you'], GL2: ['you', 'rules'], CH1: ['you', 'rules'], TP1: ['you', 'rules'], RE1: ['you'], LG2: ['you'], UV1: ['you', 'rules'], PD2: ['you', 'rules'],
  LW1: ['you'], TN2: ['you'], VE2: ['rules'], DM3: ['you'], PH3: ['rules'], SY4: ['you'],
  HN1: ['map', 'rules'], SF2: ['rules'], NM0: ['rules'], IF1: ['rules'], DC4: ['rules'], FG0: ['rules'], GT1: ['rules'],
};
// The chips that don't do their whole job yet (Greg, 2026-11-16: mark them BETA, so we know they need more work). What's
// missing, for us. They show BETA in your deck, and never drop (deckRollChip): the editor and THE SHELL give them.
const DECK_BETA = {
  HS1: 'starting a row in needs map work (the start node and its links)',
  FR5: 'corp weights scramble seeds: needs the placeholder corps (Seeds)', CS7: 'the same: placeholder corps', CK9: 'the same', DK6: 'the same',
  EV2: "an event in sector 1 needs its own stream (rollEvent skips sector 1)", AD0: 'there are no ads to tap yet',
  SR4: 'a safehouse on every map needs map work', PP2: 'a PIER on every map needs map work',
  AL4: "the next sector's event is only made when you push on", MM4: 'needs the last path saved per seed, and drawn on the map',
  GB2: 'the mystery pick needs its own reward card', AU2: 'the reroll needs a button on the rewards screen',
  SV1: "salvage needs a third button on a reward (and the bench's letters)", HL2: 'needs a hook after you pick a reward',
  SPC: 'the power works; the mold creeping over your board is still to draw',
};
const deckBeta = k => !!DECK_BETA[k];
// Power (docs/DECK.md "Power", first pass for playtesting): the cell powers mk II and mk III, one cell per stage of the
// ladder (6 / 9 / 11 / 14); the FUSE powers mk IV on its own (DECK_FUSE_PWR). Every number fits one hex character:
// the borders show them that way (+-2-+, the PSU +5/E+). OVERCLOCK (a BYTE code) runs the cell at F.
const DECK_CELL = { SC1: 6, LI2: 9, NC3: 11, RX9: 14, BO1: 12, PO1: 4, SPC: 15 };
// a cell's power. WIND-UP: 2, +2 a sector you cleared in your last cash-out (save.deck.windup, engine/runend.js endRun), 14 at most
const deckCellPower = key => key === 'WU3' ? Math.min(14, 2 + 2 * ((save.deck && save.deck.windup) || 0)) : DECK_CELL[key] || 0;
const DECK_FUSE_PWR = 8;
const deckHex = n => n.toString(16).toUpperCase();
const DECK_SPOILS = [['REWARDS', 'RWD', 'take the REWARDS.'], ['HEAL', 'HP+', 'skip them: HEAL 2 INT.'], ['CASH', '$$$', 'skip them: take CASH.']];
const DECK_GLYPHS = [
  ['THE WATCHER', [' .-. ', '( o )', " '-' "]], ['COOKIE', [' .-. ', '(::.)', " '-' "]],
  ['GHOST USER', [' .-. ', '(o o)', ' vvv ']], ['DIAMOND', [' / \\ ', '<   >', ' \\ / ']],
];
// the sockets (where the socket labels layer puts them): id, x, y, group, the mk that opens it, size
const deckS = (id, x, y, g, mk, w = 5, h = 4) => ({ id, x, y, g, mk, w, h });
const DECK_SOCKETS = [
  deckS('BT1', 20, 1, 'boot', 2), deckS('BT2', 26, 1, 'boot', 2), deckS('BI1', 20, 5, 'bios', 2), deckS('BI2', 26, 5, 'bios', 2),
  deckS('CRS', 27, 11, 'crash', 2), deckS('SH1', 0, 17, 'shell', 2), deckS('SPL', 15, 17, 'spoils', 2), deckS('SH3', 20, 17, 'shell', 2),
  deckS('SH4', 28, 17, 'shell', 2), deckS('PSU', 0, 23, 'psu', 2), deckS('SH2', 12, 23, 'shell', 2),
  deckS('GLY', 8, 33, 'glyph', 3, 7, 5), deckS('OV1', 16, 34, 'ov', 3), deckS('OV2', 22, 34, 'ov', 3), deckS('OV3', 28, 34, 'ov', 3),
  deckS('SU1', 10, 43, 'sudo', 4), deckS('SU2', 10, 47, 'sudo', 4), deckS('SU3', 10, 51, 'sudo', 4),
  deckS('BS1', 18, 43, 'boss', 4, 7), deckS('BS2', 18, 47, 'boss', 4, 7),
  deckS('HT1', 28, 43, 'heat', 4), deckS('HT2', 28, 47, 'heat', 4), deckS('HT3', 28, 51, 'heat', 4),
];
// the parts that aren't sockets: id, x, y, w, h
const DECK_PARTS = [['cpu', 3, 4, 14, 7], ['rom', 3, 11, 14, 1], ['stick', 22, 9, 3, 7], ['readout', 29, 16, 3, 1],
  ['byte', 25, 22, 10, 4], ['hdr3', 6, 28, 14, 4], ['fuse', 23, 27, 4, 6], ['ports', 33, 28, 3, 3],
  ['crew', 0, 32, 5, 6], ['hdr4', 10, 41, 23, 2], ['uplink', 0, 44, 4, 5]].map(([id, x, y, w, h]) => ({ id, x, y, w, h }));
// the CPU shows your hacker name (PROFILE): WORD_WORD, 13 at most; 2 lines when it's over 10
const deckName = () => { try { return profile().name || 'POTATO_SAUCE'; } catch (e) { return 'POTATO_SAUCE'; } };
const DECK_POSTS = ['HARDENED', 'SEED MONEY', 'GEAR SLOT', 'RESTOCK', 'SECOND WIND', 'REMOTE ACCESS', 'WORKBENCH', 'TELL LIGHT'];
// BOARD posts you can set for a run (THE BOARD's LEGACY keys, engine/save.js: their names and text come from there).
// Only the ones with a real choice (Greg, 2026-11-15): STARTER POOL changes what the starter perk offers, STRAY is a pet
// you might not want along, NEMESIS picks a corp (it cycles, or none). Posts that only help (TELL LIGHT, LUCKY START)
// are just on. NEMESIS picks a corp ([<] CORP [>]: the PICKERS). (THE ARCHIVE was one too, v15.36-v15.37: it's a chip now.)
const DECK_SWITCHES = ['starter', 'stray', 'nemesis'];
const DECK_PICKERS = ['nemesis'];
// THE ARCHIVE's mods (its chip, AR1): any you've found (seen), but no exotics, quest mods or hidden ones (deckRunStart)
const archivePool = () => modsFound('minor', 'gen', 'corp').filter(k => save.seen[k] && !MODS[k].quest && !MODS[k].hidden)
  .sort((a, b) => MODS[a].name.localeCompare(MODS[b].name));
const deckPost = k => (typeof LEGACY !== 'undefined' && LEGACY.find(u => u.key === k)) || { name: k.toUpperCase(), desc: '' };
const deckCorps = () => [null].concat(Object.keys(CORPS).sort((a, b) => CORPS[a].name.localeCompare(CORPS[b].name)));
const DECK_CREW = [['POPS', 'one tell hint a sector'], ['NANA', 'a PATCH every sector'], ['BRICK', 'first ICE hit blocked'], ['KLUDGE', 'failed crafts refund']];
const DECK_CODES = {
  '00001111': '0x0F: OVERCLOCK. your cell runs at F (15). enter it again to stop.',
  '11111111': '0xFF: OVERFLOW wakes up. his seed is armed for your next run.',
  '00101010': '42. but what was the question?',
  '10110000': 'b0y: hey. quit poking my switches.',
  '01111111': 'DEL: access denied.',
  '10000000': '0x80: DOUBLE TIME armed for your next run.',
};
const DECK_ART_SKIP = ['cpu label', 'readouts'];   // drawn live (the hacker name, the stick)
const DECK_ART_W = 36;
const DECK_BOARD_STEP = 5;   // rows a "more" tap moves the board (it's 56 rows)
const DECK_CARD_H = 5;       // the bar (rule / messages / NO POWER) and the 4-row card
const DECK_MORE_UP = '[ ^ ^ ^  more  ^ ^ ^ ]', DECK_MORE_DN = '[ v v v  more  v v v ]';   // engine/codex.js scrollArea's rows
const DECK_OFF = { fg: '#5f7470', bg: '#141b1a' };   // an unpowered chip: grey
const deckBand = by => by >= 41 ? 4 : by >= 32 ? 3 : 2;

// ---------- chips as loot (docs/DECK.md "Chips: getting them, carrying them, keeping them") ----------
// A chip you find rides in your belt as gear ('chip_' + its key, made here from DECK_CHIPS). It does nothing in a run
// (engine/active.js: canUse has no entry for it, whyNotItem says why). Its info line says NEW or how many you have, so you
// know a dupe (shred it at a workbench, or drag it to the trash). Cash out and it goes home to save.deck.chips
// (engine/runend.js endRun: deckHome); die and it's gone. only: 'deck' keeps chips out of every random gear pool
// (engine/hackers.js gearAllowed), so markets, loot and the pier's gear are the same as before; chips roll on their
// own seeded streams ('cachechip', 'pierchip'), so a seed's other drops don't move.
const DECK_DROP = { cache: 0.2, fish: 0.25 };   // a cracked DATA CACHE; a pier catch that would have been gear
const DECK_DROP_WEIGHT = { common: 50, rare: 30, epic: 14, legendary: 5, exotic: 1 };
const DECK_NO_DROP = ['SC1', 'SP3', '1UP', 'MN1', 'CX5', 'RC1', 'PG0', 'FA1', 'LS1', 'AR1'];   // (CX5, RC1, FA1, LS1: THE BOARD's posts give them; PG0 comes with the deck: deckGiveOwed)   // (MN1: ROOT's, from its quest)   // the deck comes with these; the 1UP is b0y's, from beating G0D (deckGift)
const deckChipItem = key => 'chip_' + key;
const deckItemChip = k => (ITEMS[k] && ITEMS[k].chip) || null;
// A SHELL or SUDO chip before THE SHELL is yours (Greg, 2026-11-20: they still drop; they point you at ROOT's quest)
const deckNoShell = key => ['shell', 'sudo'].includes(DECK_CHIPS[key][1]) && !(typeof rootOn === 'function' && rootOn());
const deckHave = key => (save.deck && save.deck.chips && save.deck.chips[key]) || 0;
for (const [key, c] of Object.entries(DECK_CHIPS)) {
  ITEMS[deckChipItem(key)] = { key: deckChipItem(key), name: c[0], price: 0, rarity: c[2], chip: key, only: 'deck', nosell: !deckIsRipped(key), ripped: deckIsRipped(key), desc: c[4],   // (a RIPPED one sells: Greg, sell it and the heat's off. Its price: below)
    get tip() { const n = deckHave(key); return `${n ? 'you have it.' : 'NEW.'} ${c[6]} ${n ? 'cash out and it shreds into letters.' : 'cash out to keep it.'}${deckIsRipped(key) ? ' rivals want it back.' : ''}${deckNoShell(key) ? ' it needs THE SHELL: get ROOT on your crew.' : ''}`; } };
  // on the belt its face's two rows take turns (Greg, 2026-11-16), 3 wide (engine/panels.js ITEM_SHORT)
  Object.defineProperty(ITEM_SHORT, deckChipItem(key), { get: () => { const f = c[5], b = f[1] && Math.floor(performance.now() / 1100) % 2; return (b ? f[1] : f[0]).slice(0, 3).padEnd(3); } });
}
// chips drop once you have a deck, in real runs (not the training, not a race)
const deckDrops = () => !!save.deck && !!st.run && !st.run.tutorial && !st.mp;
function deckRollChip(r) {
  const pool = Object.keys(DECK_CHIPS).filter(k => !DECK_NO_DROP.includes(k) && !deckBeta(k) && !deckIsRipped(k));
  return pickWeighted(pool, k => DECK_DROP_WEIGHT[DECK_CHIPS[k][2]] || 0, r);
}
// a RIPPED one (rivals, THE FENCE): by rarity, the same weights
const deckRollRipped = r => pickWeighted(DECK_RIPPED, k => DECK_DROP_WEIGHT[DECK_CHIPS[k][2]] || 0, r);
// a DATA CACHE (engine/panels.js openCache): now and then a chip. Returns its line for the cache's head, or null.
// A full belt: the swap comes up over the cache (pick the gear that goes, or keep what you have).
function deckCacheChip(node) {
  if (!deckDrops()) return null;
  const r = rngFor(st.run.seed, 'cachechip', node.id);
  if (r() >= DECK_DROP.cache && !DECK_ALWAYS) return null;   // (DECK_ALWAYS: testing)
  const key = deckRollChip(r), ik = deckChipItem(key);
  if (itemRoom(ik, 0)) { addItem(ik, 0); return `+ chip: ${DECK_CHIPS[key][0]}${deckHave(key) ? ' (dupe)' : ''}`; }
  setTimeout(() => openSwap('item', ik, 0, null), 0);   // (after the cache's panel is up)
  return `+ chip: ${DECK_CHIPS[key][0]}. belt full.`;
}
// the PIER (engine/fishing.js): a catch that would have been gear is sometimes a chip
function deckFishChip(out, f) {
  if (out.kind !== 'gear' || out.key === 'disc' || !deckDrops()) return out;
  if (!f.cr) f.cr = rngFor(st.run.seed, 'pierchip', f.node.id);
  if (f.cr() >= DECK_DROP.fish && !DECK_ALWAYS) return out;
  const key = deckRollChip(f.cr);
  return { kind: 'gear', key: deckChipItem(key), tier: 0, rarity: DECK_CHIPS[key][2], chip: true };
}
// Cashing out (engine/runend.js endRun): the chips in your belt go home. Dying: they're gone.
function deckHome(run, win) {
  const chips = run.items.filter(s => deckItemChip(s.key));
  if (!win || !chips.length || !save.deck || (run.practice && !EDITOR) || run.tutorial || st.mp) return;   // (the editor: its runs are practice, and its save is its own)
  save.deck.chips = save.deck.chips || {};
  // A chip home is unlocked: no extras (Greg, 2026-11-21). One you had already shreds into components on its own
  // (engine/bench.js benchAutoShred); a new one carried twice: one home, the other shreds.
  const home = [], shred = [], got = [];
  for (const s of chips) {
    const k = deckItemChip(s.key), had = deckHave(k) > 0, n = had ? s.n : s.n - 1;
    if (!had) { save.deck.chips[k] = 1; home.push(k); }
    if (n > 0) { shred.push(ITEMS[s.key].name + (n > 1 ? ' x' + n : '')); got.push(...benchAutoShred(k, n)); }
  }
  const noShell = chips.some(s => deckNoShell(deckItemChip(s.key)));   // (a shell chip before ROOT: where to go)
  // each chip home as its face and name (engine/feats.js featPage); past 4, names only, so the box fits a phone
  const lines = home.length ? ['chips home:', '', ...home.slice(0, 4).map(k => ({ chip: k })), ...home.slice(4).map(k => '  ' + DECK_CHIPS[k][0]), '', 'slot them: THE BOARD > DECK.'] : [];
  if (shred.length) lines.push(...(lines.length ? [''] : []), 'had already, shredded:', ...shred.map(n => '  ' + n), '  > ' + got.map(ch => isBlank(ch) ? 'BLANK' : ch).join(' '));
  FEAT_QUEUE.push({ head: 'YOUR DECK', lines: lines.concat(noShell && home.length ? ['', 'shell chips need THE SHELL.', rootStep() ? 'get ROOT: THE BOARD > QUESTS.' : 'open your deck. something lives in it.'] : []) });
}

// ---------- the chips in a run ----------
// As a run starts (engine/run.js startRun: deckRunStart), the chips in your deck that are slotted, open and powered are
// written on the run (run.chips: so a resumed run has the same ones, and changing your deck mid-run changes nothing).
// HARDCORE turns the CRASH chips off. Not in the training or a race. chipOn(key) is what the game asks.
const chipOn = (key, run = st.run) => !!(run && run.chips && run.chips.includes(key));
function deckRunChips(run) {
  deckGift();
  if (!save.deck) return [];
  const was = DECK; DECK = deckReal();
  const pw = deckPower(), d = DECK;
  let keys = [...pw.on].map(id => d.slots[id]).filter(k => DECK_CHIPS[k]);
  if (keys.includes('HC1')) keys = keys.filter(k => DECK_CHIPS[k][1] !== 'crash');   // HARDCORE: no CRASH chip works
  let brown = null;   // BROWNOUT (a cell): one of the others is off this run (the run's seed picks it)
  if (keys.includes('BO1') && run) { const pool = keys.filter(k => DECK_CHIPS[k][1] !== 'psu'); if (pool.length) { brown = pickR(pool, rngFor(run.seed, 'brownout')); keys = keys.filter(k => k !== brown); } }
  const spoils = d.spoils;
  DECK = was;
  return { keys, spoils, brown };
}
// INT a chip costs (or gives) as a run starts
const DECK_INT = { DM3: 2, RX9: -1, GR8: -1, LK7: -1, FM2: -1, SK1: -1, FI2: 2, DN1: -1, GL2: -2, CH1: -1, TP1: -1, RE1: -1, LG2: -1, UV1: 1, PD2: 2 };
function deckRunStart(run, opts = {}) {
  if (opts.tutorial || st.mp) return;
  const { keys, spoils, brown } = deckRunChips(run);
  deckRunCarry(run);   // INSURANCE and DEAD DROP from your last death (they come whatever's slotted now)
  // PURGE is a chip once you have the deck (Greg, 2026-11-22): no PURGE chip on, no PURGE at the start
  if (save.deck && !(keys || []).includes('PG0')) { const i = run.items.findIndex(x => x.key === 'purge'); if (i >= 0) run.items.splice(i, 1); }
  if (!keys || !keys.length) return;
  run.chips = keys; run.spoils = spoils || 0;
  deckCharges(run);   // THE SHELL's charges, full
  if (brown) { run.brownout = brown; setTimeout(() => { if (st.run === run) setMsg(`> BROWNOUT: ${DECK_CHIPS[brown][0]} is offline this run.`, C.danger); }, 1600); }
  const di = keys.reduce((a, k) => a + (DECK_INT[k] || 0), 0);
  if (di) { run.maxInt = Math.max(1, run.maxInt + di); run.integrity = Math.max(1, Math.min(run.maxInt, run.integrity + di)); }
  if (chipOn('TF1', run)) run.credits += 60;   // TRUST FUND
  if (chipOn('FI2', run)) run.credits += 100;   // FRESH INSTALL (and no starter perk: engine/panels.js openStartReward)
  if (chipOn('LW1', run)) run.credits += 50;   // LIFTED WALLET (RIPPED)
  const give = (key, n) => { for (let i = 0; i < n; i++) if (!addItem(key, 0)) break; };
  if (chipOn('FA1', run)) give('patch', 1);   // FIRST AID (THE BOARD's post, as a chip)
  if (chipOn('LS1', run)) { const pool = shopGear().filter(k => ITEMS[k].rarity === 'common'); if (pool.length) give(pickR(pool, rngFor(run.seed, 'lucky')), 1); }   // LUCKY START (the same)
  if (chipOn('TN2', run)) give('warp', 2);   // TURBO'S NITRO (RIPPED)
  if (chipOn('LD3', run)) { give('wall', 3); give('frag', 2); }   // LOADOUT
  if (chipOn('BM4', run)) give('call', 3);   // BEAST MASTER
  // the second set
  if (chipOn('PL3', run)) { const r = rngFor(run.seed, 'preload'), pool = shopGear(); for (let i = 0; i < 2 && pool.length; i++) give(pickWeighted(pool, gearWeight, r), 1); }   // PRELOAD (a KIT: 2 at most)
  const mods = ks => { for (const k of ks) if (MODS[k] && !run.mods.includes(k) && run.mods.length < modSlots()) addMod(k, 0); };
  if (chipOn('JD6', run)) { const r = rngFor(run.seed, 'junkdrawer'), pool = ['wires', 'coolant', 'skimmer', 'buffer', 'burner', 'stash']; mods(shuffle(pool, r).slice(0, 3)); }   // JUNK DRAWER (a KIT: 3 of them, by the seed)
  if (chipOn('PD7', run)) { mods(['buffer']); give('wall', 2); give('patch', 1); }   // PALADIN
  if (chipOn('RG6', run)) { mods(['pickpocket']); give('split', 1); give('shake', 1); }   // ROGUE
  if (chipOn('KN8', run)) { mods(['burner']); give('wall', 2); give('frag', 1); }   // KNIGHT
  if (chipOn('CL3', run)) { mods(['failsafe']); give('patch', 2); }   // CLERIC
  if (chipOn('AR1', run) && archivePool().includes(save.archive)) mods([save.archive]);   // THE ARCHIVE (THE BOARD's chip): the mod you picked on its card
  if (chipOn('BP1', run)) run.freeBuild = true;   // FREE PRESS (engine/bench.js benchBuild)
}
// INSURANCE and DEAD DROP: what your last death left you (save.deck.insured, .deadDrop: deckDeath)
function deckRunCarry(run) {
  const sd = save.deck; if (!sd || run.practice) return;
  if (sd.insured) { run.credits += sd.insured; const n = sd.insured; setTimeout(() => { if (st.run === run) setMsg(`> INSURANCE paid out: +${n}cr.`, C.money); }, 900); sd.insured = 0; }
  if (sd.deadDrop && sd.deadDrop.length) { run.deadDrop = sd.deadDrop; sd.deadDrop = null; }
  persist();
}
// dying (engine/runend.js endRun): INSURANCE banks half your credits for next run; DEAD DROP keeps your gear (not chips,
// not quest gear) for next run's first DATA CACHE
function deckDeath(run) {
  if (!save.deck || run.practice || run.tutorial || st.mp) return;
  if (chipOn('IN5', run) && run.credits > 0) save.deck.insured = Math.floor(run.credits / 2);
  if (chipOn('DD3', run)) { const keep = run.items.filter(o => ITEMS[o.key] && !deckItemChip(o.key) && !ITEMS[o.key].quest).map(o => ({ key: o.key, tier: o.tier || 0, n: o.n || 1 })); if (keep.length) save.deck.deadDrop = keep; }
}
// DEAD DROP: the first DATA CACHE of the run (engine/panels.js openCache). Returns its line, or null.
function deckDeadDrop(run) {
  if (!run.deadDrop) return null;
  const got = [];
  for (const o of run.deadDrop) for (let i = 0; i < o.n; i++) if (addItem(o.key, o.tier)) got.push(ITEMS[o.key].name);
  run.deadDrop = null;
  return got.length ? '+ DEAD DROP: ' + got.join(', ') : null;
}
// WIND-UP's power: the sectors you cleared in your last cash-out (engine/runend.js endRun)
function deckCashedOut(run) { if (save.deck && !run.practice) save.deck.windup = run.sectorsCleared || 0; }
// market prices (engine/panels.js priceOf): CHEAPSKATE -20%, INFLATION +10% a sector
// Every market's buy price goes through shopMult (Greg, 2026-11-22: LOYALTY CARD is every market, the fence too, and any new
// one): the market (engine/panels.js priceOf), THE FENCE's mods and its ripped chip (engine/events.js fencePrice, deckFenceChip).
const shopMult = (run = st.run) => deckPriceMult(run) * (1 - 0.05 * legacyLv('market'));   // (LOYALTY CARD: THE BOARD, 5% a level)
const deckPriceMult = (run = st.run) => !run || !run.chips ? 1 : (chipOn('CH1', run) ? 0.8 : 1) * (chipOn('IF1', run) ? 1 + 0.1 * (run.sector || 0) : 1);
// the UPLINK's fees (engine/runend.js uplinkMin, uplinkFee): TOLL PASS -25%
const deckUplinkMult = (run = st.run) => chipOn('TP1', run) ? 0.75 : 1;
// layer clocks (engine/run.js makeTimer): LAG +2s, SHORT FUSE -2s
const deckClock = () => (chipOn('LG2') ? 2 : 0) - (chipOn('SF2') ? 2 : 0);
// an ICE hit (engine/run.js onTrap): GLASS pays, GLITCH glitches (worse every hit). Returns a line to add.
function deckIceHit(t) {
  const run = st.run; let msg = '';
  if (chipOn('GL2')) { msg += ` +${deckCredits(8, run)}cr (GLASS)`; earn(8, run); }
  if (chipOn('GT1') && !reduced()) {
    run.glitches = (run.glitches || 0) + 1;
    const n = Math.min(60, 8 + 4 * run.glitches), cells = [];
    for (let k = 0; k < n; k++) cells.push({ ch: noiseCh(), x: pxX(Math.floor(Math.random() * L.wc)), y: pxY(Math.floor(Math.random() * L.hc)), col: pickR([C.danger, C.accent, C.bright], Math.random) });
    explode(cells, pxX(L.wc / 2), pxY(L.hc / 2), { power: 0.15, grav: 0.2, life: [0.3, 0.8] });
    flash(pickR([C.danger, C.accent], Math.random), Math.min(0.35, 0.08 + 0.02 * run.glitches), 0.25); shake(Math.min(10, 3 + run.glitches));
  }
  return msg;
}
// a new layer (engine/run.js enterLayer): RED EYE marks one ICE (not a $ node), from the run's seed
// SYSOP'S KEY (RIPPED) marks the real node on a corp's first layer, the way 0DAY does (t.zd)
function deckLayer(lv, c) {
  if (chipOn('SY4') && c.idx === 0 && c.hasBoss && lv.n > 1) lv.tiles[lv.safe].zd = true;
  if (!chipOn('RE1') || lv.n < 3) return;
  const ice = lv.tiles.filter(t => !t.safe && !t.loaded && !t.quantum);
  if (ice.length) pickR(ice, rngFor(st.run.seed, 'redeye', c.node.id, c.idx)).ruledOut = true;
}
// a new sector (engine/runend.js pushOn): DECAY drops each mod a step (BUFFER keeps its step: it changes your INT)
function deckSector(run) {
  deckRefill(run);   // THE SHELL's charges, topped up (SHELL_REFILL)
  deckChmodOff(run);   // chmod's rarity wears off (before DECAY)
  if (!chipOn('DC4', run)) return;
  const hit = run.mods.filter(k => k !== 'buffer' && (run.modTier[k] || 0) > 0);
  for (const k of hit) run.modTier[k]--;
  if (hit.length) setTimeout(() => setMsg(`> DECAY: ${hit.length} mod${hit.length > 1 ? 's' : ''} dropped a step.`, C.danger), 1200);
}
// rivals (engine/run.js startCorp): LOUD and HUNTED bring one to a corp that had none. A RIPPED chip on your belt brings
// one to every corp, unless the corp has another anomaly: that one's on, and nobody comes (Greg, 2026-11-21). Their own
// stream: the map stays the same.
const deckRippedOn = (run = st.run) => !!run && (run.items || []).some(s => ITEMS[s.key] && ITEMS[s.key].ripped);   // (sold, trashed, taken back: the heat's off. Two are no worse than one)
function deckRivalComes(node) {
  const run = st.run; if (!run || !node || (node.type !== 'corp' && node.type !== 'final')) return false;
  if (deckRippedOn(run) && (!node.mod || node.mod === 'rival')) return true;
  const p = Math.max(chipOn('LU6') ? 0.25 : 0, chipOn('HN1') ? 0.5 : 0);
  return p > 0 && rngFor(run.seed, 'deckrival', node.id)() < p;
}
// beating a rival (engine/hackers.js hkCorpEnd): LOUD pays double, VULTURE'S CUT +50%; now and then they drop a chip,
// and it's RIPPED (PH1SH'S HOOK: twice as often)
const DECK_RIVAL_DROP = 0.3;
const deckRivalPay = () => (chipOn('LU6') ? 2 : 1) * (chipOn('VE2') ? 1.5 : 1);
function deckRivalChip(h) {
  const run = st.run; if (!deckDrops() || !st.corp) return null;
  const r = rngFor(run.seed, 'rivalchip', st.corp.node.id, h.id);
  if (r() >= DECK_RIVAL_DROP * (chipOn('PH3') ? 2 : 1) && !DECK_ALWAYS) return null;
  const key = deckRollRipped(r), ik = deckChipItem(key);
  if (!itemRoom(ik, 0)) return null;
  addItem(ik, 0); deckRipFirst();
  return `> ${hkName(h.id).toLowerCase()} dropped a chip: ${DECK_CHIPS[key][0]}. it's RIPPED. ${hkName(h.id).toLowerCase()} is gonna want that back.`;
}
// A rival that took the corp's boss layer (h.stoleLast; not flatlined, not thrown out) takes a RIPPED chip back off
// your belt (engine/hackers.js hkCorpEnd). Beat the boss yourself and you keep them (Greg, 2026-11-21: it was any layer).
// Returns the line, or null.
function deckRivalTakes(h) {
  const run = st.run, s = run && run.items.find(x => ITEMS[x.key] && ITEMS[x.key].ripped);
  if (!s) return null;
  const name = ITEMS[s.key].name, who = hkName(h.id).toLowerCase();
  takeItem(s.key); Sound.deny();
  const sd = save.deck;
  if (sd && !sd.ripLost) { sd.ripLost = true; persist(); queueCall('pops', deckRipLostLines(who, name)); }
  return `> ${who} beat you to the boss. took ${name} back.`;
}
// POPS: the first RIPPED chip you get, and the first one a rival takes back (save.deck.ripSeen, .ripLost)
function deckRipFirst() {
  const sd = save.deck; if (!sd || sd.ripSeen) return;
  sd.ripSeen = true; persist(); queueCall('pops', deckRipLines());
}
const deckRipLines = () => ["that chip you just got? it's RIPPED. ripped right out of a rival's deck.",
  "they know you've got it. while it's on your belt, a rival turns up in every corp you hit. one with an anomaly keeps the anomaly.",
  "beat the boss before they do and you keep it. let one take the boss layer and they take it back.",
  "sell it or trash it and the heat's off. get it home and it's yours: ripped chips are good ones."];
const deckRipLostLines = (who, name) => [`${who} got away with ${name}. told you they'd want it back.`,
  "a rival that beats you to a corp's boss takes a ripped chip with 'em. flatline 'em, or beat 'em to it."];
// The look (Greg, 2026-11-21): magenta (the bench's: engine/bench.js BENCH_MISS) runs through a RIPPED chip, over its
// own rarity color. Not red: red is DIVINE's. B(x, y, w, col, alpha) paints one cell's background.
const DECK_RIP_COL = '#ff4fd8';
function deckRipGlow(B, x, y, w, now = performance.now()) {
  for (let j = 0; j < w; j++) { const a = Math.max(0, Math.sin(now / 220 - j * 0.9)); if (a > 0.05) B(x + j, y, DECK_RIP_COL, 0.6 * a); }
}
// a chip for sale: a market now and then (engine/panels.js shopRoll), THE FENCE always (ripped, dearer: engine/events.js)
const DECK_SHOP_CHIP = 0.15, DECK_CHIP_PRICE = { common: 40, rare: 70, epic: 110, legendary: 160, exotic: 240 };
for (const k of DECK_RIPPED) ITEMS[deckChipItem(k)].price = DECK_CHIP_PRICE[DECK_CHIPS[k][2]];   // (a RIPPED chip sells for its share of this: engine/panels.js gearValue)
function deckShopChip(node, n) {
  const run = st.run; if (!deckDrops()) return null;
  const r = rngFor(run.seed, 'shopchip', node.id, n || 0);
  if (r() >= DECK_SHOP_CHIP && !DECK_ALWAYS) return null;
  const key = deckRollChip(r);
  markSeen(deckChipItem(key));   // (seen: the bench can craft it, engine/bench.js recipeKnown)
  return { kind: 'item', key: deckChipItem(key), tier: 0, price: DECK_CHIP_PRICE[DECK_CHIPS[key][2]] || 60, sold: false, n: 1 };
}
function deckFenceChip(node) {
  const run = st.run; if (!deckDrops()) return null;
  if (!run.fenceChip || run.fenceChip.node !== node.id) { const key = deckRollRipped(rngFor(run.seed, 'fencechip', node.id)); run.fenceChip = { node: node.id, key, sold: false }; }
  const fc = run.fenceChip; return fc.sold ? null : Object.assign({ price: Math.round(2 * (DECK_CHIP_PRICE[DECK_CHIPS[fc.key][2]] || 60) * shopMult()) }, fc);
}
// boss rewards (engine/panels.js rewardOptions): a chip now and then; SPOILS chips (openReward: deckSpoils)
const DECK_BOSS_CHIP = 0.12;
function deckBossChip(node) {
  const run = st.run; if (!deckDrops()) return null;
  const r = rngFor(run.seed, 'bosschip', node.id);
  if (r() >= DECK_BOSS_CHIP && !DECK_ALWAYS) return null;
  const key = deckRollChip(r); markSeen(deckChipItem(key));   // (seen: craftable)
  return { kind: 'gear', key: deckChipItem(key), tier: 0, n: 1 };
}
// RELIC (SPOILS, from THE BOARD's SYSOP post): now and then a corp boss's rewards get an exotic mod as one more pick. Its
// own seeded stream, so the rest of the rewards stay the same for a seed (Greg, 2026-11-22: an extra, not in place of one).
const DECK_RELIC = 0.2;   // the chance at each corp boss
function deckRelicPick(node, options) {
  const run = st.run; if (!chipOn('RC1', run) || node.type !== 'corp') return null;
  const got = exoticOffer(run.seed, 'relic', node.id, DECK_RELIC).filter(o => !has(o.key) && !options.some(p => p.key === o.key));
  return got.length ? { key: got[0].key, tier: 0 } : null;
}
// A corp's tell is known: you've breached it, or CODEX decoded all of it (Greg, 2026-11-22). The codex, G0D.exe
// (engine/g0dexe.js g0dxKnows) and `man` read this.
const tellKnown = key => corpStat(key).breached > 0 || ((save.codexBits || {})[key] || 0) >= 3;
// CODEX (CRASH, from THE BOARD's ELITE post): die in a corp you haven't beaten and a third of its tell decodes in the codex
// (save.codexBits: corp -> 0-3; engine/codex.js cxTellPart shows it). Not in practice runs. Returns the corp's name, or null.
function deckCodexDeath(run, key) {
  if (!chipOn('CX5', run) || run.practice || !CORP_TELL[key] || corpStat(key).breached) return null;
  save.codexBits = save.codexBits || {};
  if ((save.codexBits[key] || 0) >= 3) return null;
  save.codexBits[key] = (save.codexBits[key] || 0) + 1; persist();
  return corpDef(key).name;
}
// GEAR (SPOILS): 3 gear in place of the mods
function deckGearRewards(node) {
  const r = rngFor(st.run.seed, 'gearspoils', node.id), out = [];
  for (let i = 0; i < 12 && out.length < 3; i++) { const g = rewardGear(r); if (!out.some(o => o.key === g.key)) out.push(g); }
  return out;
}
// a quest gives a chip (beta): the OMNI RAID gives OMNI'S EYE, once (engine/quests.js questOmni)
function deckQuestChip(key, why) {
  const sd = save.deck; if (!sd || !DECK_CHIPS[key]) return;
  sd.questChips = sd.questChips || []; if (sd.questChips.includes(key)) return;
  sd.questChips.push(key); sd.chips[key] = (sd.chips[key] || 0) + 1; persist();
  FEAT_QUEUE.push({ head: 'YOUR DECK', lines: [why, '', { chip: key }, '', 'slot it: THE BOARD > DECK.'] });
}
// CHECKPOINT (engine/runend.js die): once a run, back with nothing but full INT. Returns true if it took the death.
function deckCheckpoint(run) {
  if (!chipOn('CP0', run) || run.checkpointUsed || !st.lv || st.mp) return false;
  run.checkpointUsed = true;
  for (const k of run.mods.slice()) removeMod(k);
  run.items = []; run.credits = 0; run.integrity = run.maxInt;
  return true;
}
// credits you earn (engine/save.js earn): GREED +25%, TAXED -20%
function deckCredits(cr, run) {
  if (!(cr > 0) || !run || !run.chips) return cr;
  return Math.round(cr * (chipOn('GR8', run) ? 1.25 : 1) * (chipOn('TX2', run) ? 0.8 : 1) * (chipOn('UV1', run) ? 0.75 : 1));   // (UNDERVOLT -25%)
}
// REP a run is worth (engine/save.js repFor): FAME +20%, TAXED +25%, HARDCORE +50%
const DECK_HEAT_REP = { HC1: 0.5, TX2: 0.25, HN1: 0.25, SF2: 0.2, NM0: 0.2, IF1: 0.15, DC4: 0.3, FG0: 0.15, GT1: 0.1 };   // each HEAT chip's REP (they multiply)
const deckRepMult = run => !run || !run.chips ? 1 : (chipOn('FM2', run) ? 1.2 : 1) * run.chips.reduce((m, k) => m * (1 + (DECK_HEAT_REP[k] || 0)), 1);
// dying (engine/runend.js endRun): DEADMAN keeps half; BLACK BOX puts your best mod in the LOCKER
const deckDeadman = run => chipOn('OB1', run) && run.depth >= 30 ? 1 : chipOn('DM5', run) ? 0.5 : 0;   // (OBITUARY: past 30, all of it)
// BLACK BOX (Greg, 2026-11-22): your best mod, a step lower, into the WORKBENCH's LOCKER (no picking). It says what went,
// or why nothing did (no WORKBENCH, the locker full).
function deckBlackBox(run) {
  if (!chipOn('BB7', run) || run.practice || !run.mods.length) return;
  const rank = k => RARITY_ORDER.indexOf(MODS[k].rarity) * 10 + ((run.modTier || {})[k] || 0);
  const k = run.mods.filter(m => MODS[m] && !UPLINK_LOCKED.includes(m)).sort((a, b) => rank(b) - rank(a))[0];
  if (!k) return;
  const tier = Math.max(0, ((run.modTier || {})[k] || 0) - 1), lk = benchSave().locker, free = lk.findIndex(x => !x);
  if (!benchOpen()) return FEAT_QUEUE.push({ head: 'BLACK BOX', lines: [`${MODS[k].name} had nowhere to go.`, 'no WORKBENCH: it needs its LOCKER.'] });
  if (free < 0) return FEAT_QUEUE.push({ head: 'BLACK BOX', lines: [`${MODS[k].name} had nowhere to go.`, 'your LOCKER was full. nothing saved.'] });
  lk[free] = { kind: 'mod', key: k, tier, n: 1 }; persist();
  FEAT_QUEUE.push({ head: 'BLACK BOX', lines: [`${MODS[k].name} made it out, ${tierLabel(modView(k, tier))}.`, "it's in your WORKBENCH's LOCKER."] });
}
// SPOILS (engine/panels.js openReward): 0 the rewards, 1 a heal, 2 cash
const deckSpoils = run => chipOn('OF1', run) ? 3 : chipOn('PT1', run) ? 4 : chipOn('SP3', run) ? run.spoils || 0 : 0;   // (3 OFFERING, 4 PROTECTION: chips)
// ---------- THE SHELL's charges (docs/SHELL.md "Charges", Greg 2026-11-20) ----------
// SHELL chips give charges (DECK_CHARGES) and their commands cost them (each command's cost: DECK_SHELL_CMDS). One pool:
// run.charges, up to run.chargeMax (what the run's chips give). It starts full. SHELL_REFILL: 'sector' tops it up every
// new sector (for now); 'run' makes it last the whole run (Greg: later, with a BOSS chip, CRON, that brings the sector
// refill back). More from a corp boss's CHARGE pick (gear: +2), and ROOTKIT (CRASH) burns them all to save you.
const SHELL_REFILL = 'sector';
const DECK_CHARGES = { WH0: 3, PS4: 2, MN1: 2, CA4: 4, FL3: 3,   // (FL3 was 1: v15.03, a SUDO chip gives one use of its own command)
  CD2: 2, SN5: 3, RM1: 2, KL9: 2, CT1: 3, ZZ3: 2, WI5: 1, UD2: 1, GD1: 4, HD4: 3, RL2: 2, BR3: 4, GM1: 4, GG1: 4, FT3: 3, JM4: 4, RF4: 4, CM3: 3, FK2: 4 };   // (GM1, GG1: they cost by rarity, DECK_GIVE_COST: 4 reaches a legendary)
const SHELL_CHARGE = { pack: 2, boss: 0.35 };   // a CHARGE gives 2; a corp boss offers one 35% of the time (with charges to fill)
for (const [k, n] of Object.entries(DECK_CHARGES)) if (DECK_CHIPS[k]) { DECK_CHIPS[k][4] += ` +${n} shell charges.`; DECK_CHIPS[k][6] += ` +${n} charges.`; }
function deckCharges(run) { run.chargeMax = (run.chips || []).reduce((a, k) => a + (DECK_CHARGES[k] || 0), 0); run.charges = run.chargeMax; }
function deckRefill(run) {
  if (SHELL_REFILL !== 'sector' || !run.chargeMax || run.charges >= run.chargeMax) return;
  run.charges = run.chargeMax;
  if (rootOn()) setTimeout(() => { if (st.run === run) setMsg(`> THE SHELL: charges back to ${run.chargeMax}.`, C.accent); }, 1800);
}
// CHARGE: gear from corp boss rewards (engine/panels.js rewardOptions), never in markets or at the bench
ITEMS.charge = { key: 'charge', name: 'CHARGE', price: 0, rarity: 'rare', find: true, noBench: true, nosell: true, desc: `+${SHELL_CHARGE.pack} charges for THE SHELL (up to your max).`,
  tip: `+${SHELL_CHARGE.pack} shell charges.`, where: 'corp boss rewards, while you have SHELL chips.', codex: "a charge pack for THE SHELL. it tops your charges up by 2, never past what your SHELL chips give." };
ITEM_SHORT.charge = 'CHG';
GEAR.charge = {
  ok: () => !!st.run && (st.run.chargeMax || 0) > (st.run.charges || 0),
  use(tier, lv, run) { const was = run.charges || 0; run.charges = Math.min(run.chargeMax, was + SHELL_CHARGE.pack); Sound.buy(); setMsg(`> THE SHELL: +${run.charges - was} charges (${run.charges}/${run.chargeMax}).`, C.accent); },
};
function deckChargeReward(node) {
  const run = st.run; if (!run || !run.chargeMax || !rootOn()) return null;
  return rngFor(run.seed, 'chargereward', node.id)() < SHELL_CHARGE.boss ? { kind: 'gear', key: 'charge', tier: 0, n: 1 } : null;
}
// ROOTKIT (engine/runend.js die): THE SHELL's charges burn and you live, with 1 INT. Any charges will do, every time.
function deckRootkit(run) {
  if (!chipOn('RK1', run) || !(run.charges > 0) || !rootOn() || !st.lv || st.mp) return 0;
  const n = run.charges; run.charges = 0; run.integrity = 1;
  return n;
}
// THE SHELL's commands from chips (engine/shell.js: the 'your deck' group). Known while the chip's on in this run (or in
// dev mode); safe (the run still counts), but the run is marked hacked (run.hacked: the leaderboard's mark, later).
const DECK_SHELL_CMDS = [
  { name: 'whoami', chip: 'WH0', cost: 1, safe: true, help: "your run so far, and the REP you'd bank now", run: () => {
    const run = shellNeedRun(); run.hacked = true;
    return `${profile().name} · sector ${run.sector + 1} · depth ${run.depth}\ncorps ${run.corps} · ${run.credits}cr · INT ${run.integrity}/${run.maxInt}\ncash out now: ${repFor(run)} REP`; } },
  { name: 'man', chip: 'MN1', cost: 1, safe: true, help: "this corp's codex entry (its tell, once you've beaten it)", run: () => {   // ROOT's chip
    const run = shellNeedRun();
    if (!st.corp) throw new Error('only in a corp.');
    const key = st.corp.def.key, d = corpDef(key), rec = corpStat(key);
    run.hacked = true;
    return [`${d.name}${d.level ? '  LV' + d.level : ''}`, d.intel, corpRules(d, 1), CORP_TELL[key] ? (tellKnown(key) ? 'tell: ' + CORP_TELL[key] : 'tell: beat this corp to read it.') : ''].filter(Boolean).join('\n'); } },
  { name: 'ps', chip: 'PS4', cost: 1, safe: true, help: 'the rival hackers in this corp', run: () => {
    const run = shellNeedRun(); run.hacked = true;
    const hs = hkRivalsUp();
    return hs.length ? hs.map(h => `${hkName(h.id).padEnd(10)} ${hkBars(h)}`).join('\n') : 'no rivals here.'; } },
  { name: 'flatline', chip: 'FL3', cost: 3, safe: true, help: 'a rival in this corp drops dead (once a corp)', run: () => {
    const run = shellNeedRun();
    if (!st.corp) throw new Error('only in a corp.');
    if (st.corp.flatlined) throw new Error('used: once a corp.');
    const h = hkRivalsUp()[0];
    if (!h) return 'no rivals here.';
    run.hacked = true; st.corp.flatlined = true;
    hkOut(h, 'flatlined.');
    return `${hkName(h.id)}: flatlined.`; } },
  { name: 'eject', chip: 'EJ1', safe: true, help: 'cash out right here (from the map, once a run)', run: () => {   // EJECT (a CRASH chip: not hacked)
    const run = shellNeedRun();
    if (st.mode !== 'map' || st.corp) throw new Error('only from the map.');
    if (run.ejected) throw new Error('used: once a run.');
    run.ejected = true; setTimeout(() => cashOut(), 300);
    return 'ejecting. cashing out.'; } },
  // ---- v15.03 (docs/DECK.md SHELL: the rest of the list). A command that throws costs nothing (engine/shell.js shellRun).
  { name: 'cd', chip: 'CD2', cost: 2, safe: true, args: [{ name: 'dir', of: () => [{ v: '..', hint: 'back a row' }] }], help: 'cd ..: your next move on the map can go back a row', run: () => {
    const run = shellNeedRun();
    if (st.mode !== 'map' || st.corp) throw new Error('only on the map.');
    if (run.backAim) throw new Error('already open: pick a node.');
    const n = backTargets().length;
    if (!n) throw new Error('nothing back there you skipped.');
    run.backAim = true; run.hacked = true; st.mapSel = null;
    return `cd ..: ${n} node${n > 1 ? 's' : ''} a row back. pick one.`; } },
  { name: 'scan', chip: 'SN5', cost: 1, safe: true, help: 'the corps ahead in this sector (BLINDERS and FOG lifted for it)', run: () => {
    const run = shellNeedRun(), cur = run.map[run.at], base = SECTOR_STEPS * run.sector;
    run.scanned = run.sector; run.hacked = true;   // (engine/map.js blinded, engine/mapview.js FOG)
    const ahead = Object.values(run.map).filter(n => (n.sector || 0) === run.sector && (n.type === 'corp' || n.type === 'final') && !run.visited.includes(n.id) && (!cur || n.step > cur.step)).sort((a, b) => a.step - b.step);
    if (!ahead.length) return 'nothing ahead.';
    return ahead.map(n => `row ${n.step - base}  ${n.type === 'final' ? 'BOSS ' : ''}${corpDef(n.corp).name} T${n.tier || 1}${n.mod && ANOMALIES[n.mod] ? '  + ' + ANOMALIES[n.mod].name : ''}`).join('\n'); } },
  { name: 'rm', chip: 'RM1', cost: 2, safe: true, help: 'delete one ICE on this layer', run: () => {
    const run = shellNeedRun(), lv = deckShellLayer();
    const opts = lv.tiles.filter(t => t.state === 'closed' && !isReal(t) && !t.loaded);
    if (!opts.length || candidates().length <= 1) throw new Error('no ICE left to delete.');
    lv.rms = (lv.rms || 0) + 1;
    lockTile(pickR(opts, rngFor(run.seed, 'rm', st.corp.node.id, st.corp.idx, lv.rms)), C.mid, 'rm');
    run.hacked = true;
    return 'rm: 1 ICE deleted.'; } },
  { name: 'kill', chip: 'KL9', cost: 1, safe: true, args: [{ name: 'signal', of: () => [{ v: '-9', hint: 'for real: the run ends' }] }], help: 'kill -9: flatline yourself. the run ends now, as a death', run: () => {
    const run = shellNeedRun();
    if (st.mp) throw new Error('not in a race.');
    if (!shellIdle()) throw new Error('wait for the screen to settle.');
    run.hacked = true; shellClose();
    setTimeout(() => { if (st.run === run && !run.ended) endRun(false); }, 200);
    return 'killed.'; } },
  { name: 'cat', chip: 'CT1', cost: 1, safe: true, help: 'what a DATA CACHE holds: the one picked on the map, or the next in reach', run: () => {
    const run = shellNeedRun();
    if (st.mode !== 'map' || st.corp) throw new Error('only on the map.');
    const sel = st.mapSel && run.map[st.mapSel];
    const node = sel && sel.type === 'cache' ? sel : availableNodes().map(id => run.map[id]).find(n => n.type === 'cache');
    if (!node) throw new Error('no DATA CACHE picked or in reach.');
    if ((run.caches || {})[node.id]) throw new Error('that one is open already.');
    run.hacked = true;
    return deckCatCache(node).join('\n'); } },
  { name: 'sleep', chip: 'ZZ3', cost: 1, safe: true, help: 'the layer clock stops 5 seconds once you close THE SHELL (once a layer)', run: () => {
    const lv = deckShellLayer();
    if (lv.slept) throw new Error('used: once a layer.');
    lv.slept = true; lv.sleepArm = true; st.run.hacked = true;   // (engine/shell.js shellClose starts it)
    return 'sleep 5: the clock stops for 5s when you close THE SHELL.'; } },
  { name: 'whois', chip: 'WI5', cost: 2, safe: true, help: "this corp's tell, beaten or not (or the corp picked on the map)", run: () => {
    const run = shellNeedRun(), sel = st.mode === 'map' && st.mapSel && run.map[st.mapSel];
    const key = st.corp ? st.corp.def.key : sel && (sel.type === 'corp' || sel.type === 'final') ? sel.corp : null;
    if (!key) throw new Error('be in a corp, or pick one on the map.');
    const d = corpDef(key);
    if (!CORP_TELL[key]) throw new Error(`${d.name} has no tell.`);
    run.hacked = true;
    return `${d.name}: ${CORP_TELL[key]}`; } },
  { name: 'undo', chip: 'UD2', cost: 3, safe: true, help: 'take back your last ICE hit on this layer', run: () => {
    const run = shellNeedRun(), lv = deckShellLayer(), h = st.lastHit;   // (engine/hits.js blockHit keeps it)
    if (!h || h.lv !== lv || h.undone) throw new Error('no ICE hit to undo on this layer.');
    h.undone = true; run.integrity = Math.min(run.maxInt, run.integrity + h.dmg); run.hacked = true;
    return `undo: +${h.dmg} INT (${run.integrity}/${run.maxInt}).`; } },
  // ---- v15.06: SUDO (docs/DECK.md SUDO). 'rm -rf' has a space: engine/shell.js shellParse reads "rm -rf" as one name.
  { name: 'rm -rf', chip: 'RF4', cost: 4, safe: true, help: 'every ICE on this layer is deleted (not on a sector boss)', run: () => {
    const run = shellNeedRun(), lv = deckShellLayer();
    if (st.corp.node.type === 'final') throw new Error('too big: not on a sector boss.');
    const ice = deckRfIce(lv);
    if (!ice.length) throw new Error('no ICE left to delete.');
    run.hacked = true; shellClose();
    setTimeout(() => deckRmRf(lv), 250);
    return `rm -rf: ${ice.length} ICE deleted.`; } },
  { name: 'fork', chip: 'FK2', cost: 4, safe: true, help: 'the real node forks: two on every layer of this corp, same glyph, full pay', run: () => {
    const run = shellNeedRun(), lv = deckShellLayer(), c = st.corp;
    if (c.forked) throw new Error('forked already, till you leave this corp.');
    if (c.def.tap) throw new Error("this corp won't fork.");
    c.forked = true; run.hacked = true;
    const t = deckForkLayer(lv, c);
    if (t) { const { x, y } = tileCenter(t); explode(snapshot(cl => cl.own === 't' + lv.tiles.indexOf(t)), x, y, { col: C.accent, power: 0.5 }); Sound.shield(); }
    return t ? 'fork: two real nodes, this layer and every one after it in this corp.' : 'fork: from the next layer on (this one is too small).'; } },
  { name: 'chmod', chip: 'CM3', cost: 3, safe: true, args: [{ name: 'mod', of: () => deckChmodList(), any: 'mods' }], help: 'one of your mods up a rarity till the sector ends', run: a => {
    const run = shellNeedRun(), k = a[0];
    if (run.chmod && run.chmod.sector === run.sector) throw new Error(`used: ${MODS[run.chmod.key].name} is up till this sector ends.`);
    if (!has(k)) throw new Error(`you don't have ${MODS[k] ? MODS[k].name : k}.`);
    if (DECK_CHMOD_NO.includes(k)) throw new Error(`${MODS[k].name} won't take it.`);
    if (modMaxed(k)) throw new Error(`your ${MODS[k].name} is maxed already.`);
    run.modTier[k] = (run.modTier[k] || 0) + 1; run.chmod = { key: k, sector: run.sector }; run.hacked = true; Sound.buy();
    return `chmod: ${MODS[k].name} is ${tierLabel(modView(k)).toLowerCase()} till sector ${run.sector + 1} ends.`; } },
];
// fork: QUANTUM's second real node (engine/run.js enterLayer; isReal), on a layer of 3 or more, wearing the real one's
// glyph so the corp's tell finds it too. With QUANTUM it's that node, and the pay cut is off for the corp (payFor).
// Returns the forked node, or null.
function deckForkLayer(lv, c) {
  if (lv.n < 3 || !c.hasBoss || c.def.tap || st.mp) return null;
  let t = lv.tiles.find(x => x.quantum && x.state === 'closed');
  if (!t) {
    const opts = lv.tiles.filter(x => x.state === 'closed' && !x.safe && !x.loaded && !x.quantum);
    if (!opts.length) return null;
    t = pickR(opts, rngFor(st.run.seed, 'fork', c.node.id, c.idx)); t.quantum = true;
  }
  t.forked = true; t.glyph = lv.tiles[lv.safe].glyph;
  return t;
}
// rm -rf: the ICE on a layer (what rm picks from), deleted one after another so you see it go
const deckRfIce = lv => lv.tiles.filter(t => t.state === 'closed' && !isReal(t) && !t.loaded);
async function deckRmRf(lv) {
  if (st.lv !== lv) return;
  st.busy = true; flash(C.danger, 0.3, 0.6); shake(8, 0.5);
  for (const t of deckRfIce(lv)) { if (st.lv !== lv) break; lockTile(t, C.mid, 'rm'); await wait(reduced() ? 0 : 60); }
  if (st.lv === lv) { st.busy = false; setMsg('> rm -rf: the ICE is gone.', C.accent); }
}
// chmod: not the mods whose step changes more than their numbers (BUFFER your INT, BOX OF WIRES the map, MUTATE what
// it is). It wears off as a new sector starts (deckSector), unless you sold the mod.
const DECK_CHMOD_NO = ['buffer', 'wires', 'mutate'];
const deckChmodList = () => (st.run ? st.run.mods : []).filter(k => MODS[k] && !DECK_CHMOD_NO.includes(k) && !modMaxed(k))
  .map(k => ({ v: k, hint: MODS[k].name.toLowerCase() + ' ' + tierLabel(modView(k)).toLowerCase() }));
function deckChmodOff(run) {
  const c = run.chmod; if (!c || c.sector === run.sector) return;
  if (run.mods.includes(c.key) && (run.modTier[c.key] || 0) > 0) run.modTier[c.key]--;
  run.chmod = null;
}
// A corp layer you can work on (rm, sleep, undo, show.real, breach), or why not.
function deckShellLayer() {
  if (st.mode !== 'play' || !st.lv || !st.corp || !st.corp.hasBoss || st.mp) throw new Error('only on a layer.');
  if (st.busy || st.transitioning) throw new Error('wait for the layer to settle.');
  return st.lv;
}
// cat: a DATA CACHE's loot and picks, rolled the way engine/panels.js openCache rolls them (the same stream, the same
// order: keep the two together).
function deckCatCache(node) {
  const run = st.run, r = rngFor(run.seed, 'cache', node.id), quest = questMarket(node), out = ['DATA CACHE:'];
  const n = 1 + (has('cachekey') ? tv('cachekey', ECON.modx.cachekey) : quest ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const g = lootRoll(r, 2);
    out.push(g.key ? `  ${isLoot(g.key) ? 'loot' : 'gear'}: ${ITEMS[g.key].name}` : `  +${g.cr}cr`);
  }
  const opts = quest ? questCacheOptions(r) : cacheOptions(r, node);
  out.push('  pick: ' + opts.map(o => o.kind === 'gear' ? ITEMS[o.key].name : MODS[o.key].name + (o.tier ? ` (tier ${o.tier + 1})` : '')).join(' or '));
  return out;
}
// give.mod / give.gear (the SUDO chips GM1, GG1; Greg, 2026-11-20): you name it. Common and rare: anything you've found
// (save.seen). Epic and up: only what you've shredded at a workbench at that rarity or higher (save.shredded, its top
// tier: engine/bench.js benchShred). It costs charges by its rarity (DECK_GIVE_COST), as often as your charges last (Greg, 2026-11-20).
const DECK_GIVE_COST = { scrap: 1, common: 1, rare: 2, epic: 3, legendary: 4, exotic: 5 };
const deckGiveDef = (kind, k) => kind === 'mod' ? MODS[k] : ITEMS[k];
const deckGiveable = (kind, k) => { const d = deckGiveDef(kind, k); return !!d && (kind === 'mod' ? !d.hidden : !isLoot(k) && !d.chip && !d.corrupt && !d.fish); };
// The tiers of it you may summon (indexes into its tiers; none: you can't)
function deckGiveTiers(kind, k) {
  if (!deckGiveable(kind, k) || !save.seen[k]) return [];
  const def = deckGiveDef(kind, k), sh = (save.shredded || {})[k], out = [];
  for (let t = 0; t < tierCount(def); t++) {
    const r = RARITY[tierView(def, t).rarity] || RARITY.common;
    if (!r.hidden && (r.lvl <= RARITY.rare.lvl || (sh != null && sh >= t))) out.push(t);
  }
  return out;
}
const deckGiveLabel = (kind, k, t) => tierLabel(tierView(deckGiveDef(kind, k), t)).toLowerCase();
const deckGiveList = kind => Object.keys(kind === 'mod' ? MODS : ITEMS).filter(k => deckGiveTiers(kind, k).length)
  .map(k => ({ v: k, hint: deckGiveTiers(kind, k).map(t => deckGiveLabel(kind, k, t)).join(' ') }));
// The tier as typed: 2 (its step), lv2, or a rarity (epic); none: the lowest you may summon
function deckGiveTier(kind, k, raw) {
  const def = deckGiveDef(kind, k), n = tierCount(def), ok = deckGiveTiers(kind, k);
  if (raw == null || raw === '') return ok[0];
  const s = String(raw).toLowerCase().replace(/^lv/, ''), want = s === 'legend' ? 'legendary' : s;
  const t = /^\d+$/.test(s) ? Number(s) - 1 : [...Array(n).keys()].find(i => tierView(def, i).rarity === want);
  if (t == null || t < 0 || t >= n) throw new Error(`${def.name} has no ${raw} (it comes in: ${[...Array(n).keys()].map(i => deckGiveLabel(kind, k, i)).join(' ')}).`);
  if (!ok.includes(t)) throw new Error(`${def.name} ${deckGiveLabel(kind, k, t)}: shred one at a workbench first.`);
  return t;
}
const DECK_GIVE_TIER_ARG = { name: 'tier', of: () => ['common', 'rare', 'epic', 'legendary', 'legend', 'exotic', 'lv1', 'lv2', 'lv3', '1', '2', '3', '4'].map(v => ({ v, hint: /^[0-9]/.test(v) ? 'tier ' + v : '' })), opt: true };
const deckGiveCost = (kind, k, t) => DECK_GIVE_COST[tierView(deckGiveDef(kind, k), t).rarity] || 1;
// What a give costs, read off the line before it runs (engine/shell.js shellRun asks a command's .costOf)
function deckGiveCostOf(kind, a) { try { if (!a[0]) return 0; const t = deckGiveTier(kind, a[0], a[1]); return t == null ? 0 : deckGiveCost(kind, a[0], t); } catch (e) { return 0; } }
function deckGive(kind, a) {
  const run = shellNeedRun(), tag = kind === 'mod' ? 'give.mod' : 'give.gear';
  if (!a[0]) {
    const list = deckGiveList(kind);
    return { out: list.length ? `${tag} <${kind}> [tier]. yours to name:\n` + list.map(o => `  ${o.v.padEnd(12)} ${o.hint}`).join('\n')
      : `nothing yet: find some ${kind === 'mod' ? 'mods' : 'gear'} first.`, free: true };
  }
  const k = a[0], def = deckGiveDef(kind, k);
  if (!deckGiveable(kind, k)) throw new Error(`${def.name} can't be given.`);
  if (!save.seen[k]) throw new Error(`you haven't found ${def.name} yet.`);
  const t = deckGiveTier(kind, k, a[1]);
  if (kind === 'mod') {
    if (has(k) && modMaxed(k)) throw new Error(`your ${def.name} is maxed already.`);
    if (!has(k) && clashWith(k)) throw new Error(`${def.name} clashes with a mod you have.`);
    if (!has(k) && !modRoom(k)) throw new Error('no free slot for it.');
    addMod(k, t);
  } else if (!itemRoom(k, t) || !addItem(k, t)) throw new Error('no room on the belt.');
  run.hacked = true; Sound.buy();
  return `${tag}: ${def.name}, ${deckGiveLabel(kind, k, t)}.`;
}
// The player versions of dev commands (Greg, 2026-11-20: one command list; dev mode gets the dev version). engine/shell.js
// puts each on its command as .play: without dev mode, THE SHELL runs this (its chip, cost, args, help) in its place.
const DECK_SHELL_PLAY = {
  'mode.god': { chip: 'GD1', safe: true, cost: 4, args: [], help: 'ICE does no damage for the rest of this sector', run: () => {
    const run = shellNeedRun();
    if (run.godSector === run.sector) throw new Error('already on, till this sector ends.');
    run.godSector = run.sector; run.hacked = true;   // (engine/damage.js godOn)
    return `mode.god: no damage till sector ${run.sector + 1} ends.`; } },
  'mode.hold': { chip: 'HD4', safe: true, cost: 3, args: [], help: 'the layer clocks stop for the rest of this corp', run: () => {
    shellNeedRun();
    if (!st.corp || !st.corp.hasBoss) throw new Error('only in a corp.');
    if (st.corp.held) throw new Error('already held.');
    st.corp.held = true; st.run.hacked = true;   // (engine/run.js updateTimer)
    return 'mode.hold: the clocks stop till you leave this corp.'; } },
  'show.real': { chip: 'RL2', safe: true, cost: 2, args: [], help: 'the real node is marked on this layer (once a corp)', run: () => {
    const lv = deckShellLayer();
    if (st.corp.realShown) throw new Error('used: once a corp.');
    st.corp.realShown = true; lv.realShown = true; st.run.hacked = true;   // (engine/board.js draws the *)
    return 'show.real: the real node has a * on it.'; } },
  'breach': { chip: 'BR3', safe: true, cost: 4, args: [], help: 'win this layer outright, full pay (once a run)', run: () => {
    const run = shellNeedRun(), lv = deckShellLayer();
    if (run.sudoBreach) throw new Error('used: once a run.');
    if (!gearMayClear()) throw new Error("this corp won't let you.");
    run.sudoBreach = true; run.hacked = true; shellClose();
    setTimeout(() => { if (st.lv === lv && !st.busy) { setMsg('> breach. you are in.', C.accent); st.busy = true; onSafe(lv.tiles[lv.safe]); } }, 250);
    return 'breach: you are in.'; } },
  'mode.free': { chip: 'FT3', safe: true, cost: 3, args: [], help: 'any node in this sector is open, the boss too, till it ends', run: () => {
    const run = shellNeedRun();
    if (run.freeSector === run.sector) throw new Error('already on, till this sector ends.');
    run.freeSector = run.sector; run.hacked = true; st.mapSel = null;   // (engine/render.js availableNodes)
    return `mode.free: go anywhere in sector ${run.sector + 1}, the boss too.`; } },
  'corp.jump': { chip: 'JM4', safe: true, cost: 4, args: [], help: "skip this corp's layers, straight to its boss", run: () => {
    const run = shellNeedRun(), lv = deckShellLayer();
    if (lv.boss || st.corp.idx >= st.corp.counts.length - 1) throw new Error('you are at the boss already.');
    run.hacked = true; shellClose();
    setTimeout(() => { if (st.lv === lv && !st.busy) { setMsg('> corp.jump: straight to the boss.', C.accent); st.corp.idx = st.corp.counts.length - 1; enterLayer(); } }, 250);   // (the dev version: engine/dev.js jumpToBoss)
    return 'corp.jump: to the boss.'; } },
  'give.mod': { chip: 'GM1', safe: true, cost: 1, costOf: a => deckGiveCostOf('mod', a), args: [{ name: 'mod', of: () => deckGiveList('mod'), any: 'mods', opt: true }, DECK_GIVE_TIER_ARG],
    help: 'name a mod you have found (epic+: shredded). 1-5 charges by rarity', run: a => deckGive('mod', a) },
  'give.gear': { chip: 'GG1', safe: true, cost: 1, costOf: a => deckGiveCostOf('gear', a), args: [{ name: 'gear', of: () => deckGiveList('gear'), any: 'gear', opt: true }, DECK_GIVE_TIER_ARG],
    help: 'name gear you have found (epic+: shredded). 1-5 charges by rarity', run: a => deckGive('gear', a) },
};

// ---------- testing: the editor's TESTING tab (engine/editor.js TEST) and THE SHELL's deck commands (engine/shell.js)
// both call these, so the two can't drift. Each returns a line to show, or throws why not.
let DECK_ALWAYS = false;   // every DATA CACHE and PIER gear catch drops a chip
const DECK_TEST = {
  again() {   // the deck on screen writes itself to the save every frame: rebuild it from the save we just changed
    if (!DECK || !DECK.real) return;
    const v = DECK; DECK = save.deck ? deckReal() : null;
    if (DECK) Object.assign(DECK, { view: v.view, scroll: v.scroll, sel: v.sel, selT: v.selT });
    else swapTo(() => openBoard('you'));
  },
  all() { const sd = save.deck || (save.deck = deckFreshSave()); for (const k of Object.keys(DECK_CHIPS)) sd.chips[k] = Math.max(1, sd.chips[k] || 0); persist(); DECK_TEST.again(); return `every chip in your deck (${Object.keys(DECK_CHIPS).length}).`; },
  reset() { save.deck = Object.assign(deckFreshSave(), { off: (save.deck && save.deck.off) || [] }); persist(); DECK_TEST.again(); return 'your deck: just the STOCK CELL and SPOILS.'; },
  remove() { save.deck = null; persist(); DECK_TEST.again(); return 'no deck: POPS calls again when THE BOARD opens at USER.'; },
  mk(m) {
    m = clamp(Math.round(+m || 2), 2, 4); save.legacy = save.legacy || {};
    if (m >= 3) save.legacy.deck3 = 1; else delete save.legacy.deck3;
    if (m >= 4) save.legacy.fuse = 1; else delete save.legacy.fuse;
    if (save.deck) save.deck.blown = false;
    persist(); if (DECK && DECK.real) Object.assign(DECK, { mk: deckMkNow(), fuse: m >= 4, blown: false });
    return `your deck: mk ${deckMk(m)} (THE BOARD's DECK mk III and THE FUSE posts).`;
  },
  belt(key) {
    if (!st.run || st.run.ended) throw new Error('no run: start one first');
    if (!DECK_CHIPS[key]) throw new Error('not a chip: ' + key);
    if (!addItem(deckChipItem(key), 0)) throw new Error('no room in the gear slots');
    return `${DECK_CHIPS[key][0]} on your belt: cash out to keep it.`;
  },
  add(key) {
    if (!DECK_CHIPS[key]) throw new Error('not a chip: ' + key);
    const sd = save.deck || (save.deck = deckFreshSave()); sd.chips[key] = (sd.chips[key] || 0) + 1; persist(); DECK_TEST.again();
    return `${DECK_CHIPS[key][0]} in your deck (${sd.chips[key]}).`;
  },
  run() {   // the deck's chips onto this run now, without what a run starts with (credits, gear, INT)
    if (!st.run || st.run.ended) throw new Error('no run: start one first');
    const r = deckRunChips(); st.run.chips = (r && r.keys) || []; st.run.spoils = (r && r.spoils) || 0;
    return `this run's chips: ${st.run.chips.join(' ') || 'none'}`;
  },
  drops(on) { DECK_ALWAYS = on == null ? !DECK_ALWAYS : !!on; return 'chips always drop: ' + (DECK_ALWAYS ? 'on' : 'off'); },
  intro() { deckIntroCall(); return "POPS's call about the deck: once the screen is calm."; },
  upshow() { if (!DECK) throw new Error('open your deck first'); deckUpShow(Math.max(3, DECK.mk)); return `the mk ${deckMk(Math.max(3, DECK.mk))} fanfare.`; },
};

// ---------- state ----------
// DECK is the deck on screen: the dev one (DECK_DEV, kept while the page lives) or the real one (made from save.deck
// each time it opens, and written back by deckPersist whenever it changes).
// save.deck: { chips: { key: how many }, slots: { socket: key }, order: [sockets, oldest first], spoils, glyph,
//   crew: [names], off: [posts switched off: engine/save.js postOn], overclock, blown }
let DECK = null, DECK_DEV = null;
const deckView = () => ({ view: 'board', scroll: 0, list: { top: 0 }, sel: { kind: 'socket', id: 'BT1' }, selT: 0, pick: null, carry: null,
  bits: [0, 0, 0, 0, 0, 0, 0, 0], tick: null, msg: null, leave: 0 });
function deckDev() {
  if (!DECK_DEV) DECK_DEV = Object.assign(deckView(), {
    real: false, rep: 2400, mk: 2, fuse: false, blown: false, spoils: 0, glyph: 0, crew: new Set(['POPS']),
    slots: { PSU: 'SC1', BT1: 'LD3', BI1: 'QT0', CRS: 'DM5', SPL: 'SP3', SH1: 'WH0' },
    order: ['PSU', 'BT1', 'BI1', 'CRS', 'SPL', 'SH1'],   // the sockets in the order their chips went in: power goes oldest first
    sw: new Set(['starter', 'stray']), nemesis: CORPS.burgertron ? 'burgertron' : null, archive: null,
  });
  return DECK_DEV;
}
// What you start with (the deck comes with its cell, and the SPOILS switch).
const DECK_START = { chips: { SC1: 1, SP3: 1 }, slots: { PSU: 'SC1', SPL: 'SP3' }, order: ['PSU', 'SPL'] };
// USER and no deck yet: it's yours, and POPS calls about it. From THE BOARD (a level opens: engine/feats.js
// boardLevelNews; or a save from before the deck: engine/menus.js openBoard).
const deckFreshSave = () => Object.assign(JSON.parse(JSON.stringify(DECK_START)), { spoils: 0, glyph: 0, crew: [], off: [], overclock: false, blown: false });
function deckEnsure() {
  if (save.deck || boardLevel() < 2) return deckGift();
  save.deck = Object.assign(deckFreshSave(), { seenMk: deckMkNow() });
  deckGift(); persist();
  deckIntroCall();
}
// The 1UP chip (Greg, 2026-11-16): beat G0D and b0y gives you his crash unit, once (save.deck.got1up). It goes in CRASH
// if that's empty. A save that beat G0D before the 1UP was a chip gets it the same way (the deck, a run, THE BOARD).
// No deck yet: it comes with the deck (deckEnsure).
// Chips your deck gets without finding them: PURGE (every deck), and the chip of each BOARD post that is one (FIRST AID,
// LUCKY START, CODEX, RELIC: LEGACY's `chip`). Bought before the deck, they're there when it opens. A BOOT one goes into a
// free BOOT socket, BT2 first (BT1 is the KIT socket).
function deckGiveOwed() {
  const sd = save.deck; if (!sd) return;
  sd.chips = sd.chips || {}; sd.slots = sd.slots || {}; sd.order = sd.order || []; sd.owed = sd.owed || {};
  let changed = false;
  for (const k of ['PG0'].concat(LEGACY.filter(u => u.chip && legacyLv(u.key) > 0).map(u => u.chip))) {
    if (sd.owed[k]) continue;   // (given once: shred or sell it and it's gone)
    sd.owed[k] = 1; changed = true; if (sd.chips[k] > 0) continue;   // (already yours: bought before this)
    sd.chips[k] = 1;
    if (DECK_CHIPS[k][1] === 'boot' && !Object.values(sd.slots).includes(k)) { const id = ['BT2', 'BT1'].find(i => !sd.slots[i]); if (id) { sd.slots[id] = k; sd.order.push(id); } }
  }
  if (changed) persist();
}
function deckGift() {
  deckGiveOwed();
  const sd = save.deck;
  if (!sd || !save.beatG0D || sd.got1up) return;
  sd.got1up = true; sd.chips = sd.chips || {}; sd.chips['1UP'] = (sd.chips['1UP'] || 0) + 1;
  sd.slots = sd.slots || {}; sd.order = sd.order || [];
  if (!sd.slots.CRS && !Object.values(sd.slots).includes('1UP')) { sd.slots.CRS = '1UP'; sd.order = sd.order.filter(i => i !== 'CRS').concat('CRS'); }
  persist();
}
function deckIntroCall() {
  queueCall('pops', ["kid. you made USER. that gets you a deck.", "slot chips in and they run, every run. the cell powers them.",
    "find chips. bring them home. it's on THE BOARD: DECK."].concat(rootOn() ? [] : [QUEST_LINES.rootPops]), { text: '[ SEE YOUR DECK ]', onTap: () => openDeck() });   // (ROOT's quest: engine/quests.js)
}
// your mk, from THE BOARD's posts (the FUSE needs mk III: engine/save.js LEGACY 'fuse' needs 'deck3')
const deckMkNow = () => legacyLv('fuse') ? 4 : legacyLv('deck3') ? 3 : 2;
function deckReal() {
  const sd = save.deck, owned = DECK_SWITCHES.filter(k => legacyLv(k));
  const nem = owned.includes('nemesis') && !(sd.off || []).includes('nemesis') && CORPS[save.nemesis] ? save.nemesis : null;
  const arc = MODS[save.archive] ? save.archive : null;   // (THE ARCHIVE's mod: its chip's card sets it)
  const d = Object.assign(deckView(), {
    real: true, mk: deckMkNow(), fuse: legacyLv('fuse') > 0, blown: !!sd.blown, spoils: sd.spoils || 0, glyph: sd.glyph || 0,
    crew: new Set(sd.crew || []), chips: Object.assign({}, sd.chips), slots: Object.assign({}, sd.slots), order: (sd.order || []).slice(),
    sw: new Set(owned.filter(k => !DECK_PICKERS.includes(k) && !(sd.off || []).includes(k))), nemesis: nem, archive: arc, overclock: !!sd.overclock, seenMk: sd.seenMk || 2,
  });
  for (const id of Object.keys(d.slots)) if (id !== DECK_KIT_SOCKET && DECK_KITS.includes(d.slots[id])) {   // (a KIT outside the KIT socket: a save from before it)
    const k = d.slots[id]; delete d.slots[id]; d.order = d.order.filter(i => i !== id);
    if (!d.slots[DECK_KIT_SOCKET]) { d.slots[DECK_KIT_SOCKET] = k; d.order.push(DECK_KIT_SOCKET); }
  }
  Object.defineProperty(d, 'rep', { get: () => save.rep || 0 });   // (spend it with deckBuy: THE BOARD's posts)
  d.savedJ = JSON.stringify(deckSnap(d));
  return d;
}
// the part of the real deck that's saved (NEMESIS with no corp breached yet isn't "off": there's nothing to pick)
function deckSnap(d) {
  const owned = DECK_SWITCHES.filter(k => legacyLv(k));
  return { chips: d.chips, slots: d.slots, order: d.order, spoils: d.spoils, glyph: d.glyph, crew: [...d.crew],
    off: owned.filter(k => k === 'nemesis' ? !d.nemesis && (!d.real || nemesisPool().length > 0) : !d.sw.has(k)), overclock: !!d.overclock, blown: !!d.blown, seenMk: d.seenMk || 2 };
}
// Each frame on the real deck: anything changed goes into the save (one place, so no change is missed).
function deckPersist() {
  const d = DECK; if (!d || !d.real) return;
  const o = deckSnap(d), j = JSON.stringify(o);
  if (j === d.savedJ) return;
  d.savedJ = j; save.deck = Object.assign(save.deck || {}, JSON.parse(j));
  if (d.nemesis) save.nemesis = d.nemesis;
  if (d.archive) save.archive = d.archive;
  persist();
}
// the switches you can set: the posts you own (all of them on the dev deck)
const deckSwitches = () => DECK.real ? DECK_SWITCHES.filter(k => legacyLv(k)) : DECK_SWITCHES;
// NEMESIS cycles through: the corps you've breached and none (every corp on the dev deck)
const deckNemPool = () => DECK.real ? [null].concat(nemesisPool()) : deckCorps();
// THE ARCHIVE cycles through: the mods you've found and none (every one on the dev deck). Its chip's card steps it; the
// real deck keeps it in save.archive.
function deckArcStep() { const d = DECK, cs = deckArcPool(); d.archive = cs[(cs.indexOf(d.archive) + 1) % cs.length]; if (d.real) { save.archive = d.archive; persist(); } Sound.tick(); }
const deckArcPool = () => [null].concat(DECK.real ? archivePool() : modsFound('minor', 'gen', 'corp').sort((a, b) => MODS[a].name.localeCompare(MODS[b].name)));
let deckArtRows = null;
function deckArt() {   // the board, flat: every layer in order, but the ones drawn live
  if (deckArtRows) return deckArtRows;
  const a = SCENE_ART.deck, g = Array.from({ length: a.h }, () => Array(a.w).fill(' '));
  for (const [name, l] of Object.entries(a.layers)) {
    if (DECK_ART_SKIP.includes(name)) continue;
    l.rows.forEach((r, j) => [...r].forEach((c, i) => { const y = l.y + j, x = l.x + i; if (c !== ' ' && y < a.h && x < a.w) g[y][x] = c; }));
  }
  return (deckArtRows = g.map(r => r.join('')));
}
const deckOwned = () => DECK.real ? Object.keys(DECK.chips).filter(k => DECK_CHIPS[k] && DECK.chips[k] > 0) : Object.keys(DECK_CHIPS);
const deckSock = id => DECK_SOCKETS.find(s => s.id === id);
const deckSlotOf = key => Object.keys(DECK.slots).find(k => DECK.slots[k] === key);
const deckOpen = mk => mk <= DECK.mk && !(mk === 4 && (!DECK.fuse || DECK.blown));
// KITs (Greg, 2026-11-22): BOOT chips that start you with a bundle, up to 3 mods and 2 kinds of gear, so they never fill
// your mod bar or your belt (PURGE has a slot). Only the KIT socket (BT1) takes one, so you never run two. The rest of
// BOOT (one mod, one gear stack, or no items) goes in either BOOT socket.
const DECK_KITS = ['LD3', 'PL3', 'JD6', 'PD7', 'RG6', 'KN8', 'CL3'], DECK_KIT_SOCKET = 'BT1';
const deckFits = (key, s) => DECK_CHIPS[key][1] === s.g && (!DECK_KITS.includes(key) || s.id === DECK_KIT_SOCKET);
// a SHELL socket on your real deck while ROOT isn't on your crew: chips go in, but THE SHELL is ROOT's (engine/quests.js)
const deckShellPending = s => !!(s && s.g === 'shell' && DECK.real && typeof rootOn === 'function' && !rootOn());
const deckMk = m => ['', '', 'II', 'III', 'IV'][m];
const deckSay = (text, col = C.accent) => { DECK.msg = { text, col, t: performance.now() }; };
const deckSelect = sel => { DECK.sel = sel; DECK.selT = performance.now(); };

// Power: the cell's budget goes to the chips in the order they went in. A chip that doesn't fit what's left gets none,
// and newer ones still try, so the chip you just slotted is the one that goes dark, not one off screen.
// Two pools: the cell's for mk II and III, the FUSE's for mk IV (Greg, 2026-11-15: the fuse is the bottom board's power).
// Returns the cell's numbers at the top level (budget, left, used) and the fuse's as .fuse (null when it's dark).
const deckPool = s => s.mk === 4 ? 'fuse' : 'cell';
// what a chip costs on your deck: POTATO (a cell) makes the 1s free
const deckChipCost = key => DECK.slots.PSU === 'PO1' && DECK_CHIPS[key][3] === 1 ? 0 : DECK_CHIPS[key][3];
function deckPower() {
  const d = DECK, on = new Set(), off = [];
  const spike = Object.keys(d.slots).some(id => d.slots[id] === 'SK1' && deckOpen(deckSock(id).mk)) ? 2 : 0;   // SPIKE (OVERVOLT)
  const cellB = d.slots.PSU ? (d.overclock ? 15 : deckCellPower(d.slots.PSU)) + spike : 0, fuseB = deckOpen(4) ? DECK_FUSE_PWR : 0;
  const left = { cell: cellB, fuse: fuseB };
  for (const id of d.order) {
    const key = d.slots[id], s = deckSock(id); if (!key || !deckOpen(s.mk)) continue;   // a dark band's chips cost nothing
    const c = deckChipCost(key), p = deckPool(s);
    if (c <= left[p]) { left[p] -= c; on.add(id); } else off.push(id);
  }
  return { budget: cellB, left: left.cell, used: cellB - left.cell, on, off,
    fuse: deckOpen(4) ? { budget: fuseB, left: left.fuse, used: fuseB - left.fuse } : null };
}
const deckLeft = (pw, s) => deckPool(s) === 'fuse' ? (pw.fuse ? pw.fuse.left : 0) : pw.left;
function deckSlot(key, sid) {
  const d = DECK, was = d.slots[sid], other = deckSlotOf(key), [name, grp, , cost] = DECK_CHIPS[key];
  if (other) { delete d.slots[other]; d.order = d.order.filter(i => i !== other); }
  d.slots[sid] = key; d.order = d.order.filter(i => i !== sid).concat(sid);
  d.carry = null; deckSelect({ kind: 'socket', id: sid });
  const p = deckPower();
  if (grp === 'psu') { if (p.off.length) deckFx('dead', sid, key); else { deckFx('in', sid, key); Sound.fanUp(); } return deckSay(p.off.length ? `${name}: ${p.off.length} chip${p.off.length > 1 ? 's' : ''} lost power.` : `${name} in. power ${p.budget}.`, p.off.length ? C.danger : C.money); }
  if (!p.on.has(sid)) { deckFx('dead', sid, key); return deckSay(`no power: ${name} needs ${cost - deckLeft(p, deckSock(sid))} more.`, C.danger); }
  deckFx('in', sid, key);
  deckSay(was && was !== key ? `${name} in. ${DECK_CHIPS[was][0]} back in your chips.` : other && other !== sid ? `${name} moved to ${sid}.` : `${name} in ${sid}.`);
}
function deckPull(sid) {
  const d = DECK, key = d.slots[sid]; if (!key) return;
  delete d.slots[sid]; d.order = d.order.filter(i => i !== sid);
  if (sid === 'PSU') Sound.powerDown(); else Sound.tick();
  const off = deckPower().off.length;
  deckSay(`${DECK_CHIPS[key][0]} back in your chips.` + (sid === 'PSU' && off ? ' no cell: no power.' : ''), sid === 'PSU' && off ? C.danger : C.accent);
}
function deckPick(sid) {
  const s = deckSock(sid);
  if (!deckOpen(s.mk)) return Sound.deny();
  DECK.pick = { id: sid, s: { top: 0 }, t0: performance.now() }; DECK.carry = null;
  Sound.ui();
}
// keep a board row range in view
const deckViewRows = () => L.hc - 1 - 5 - DECK_CARD_H - 2;   // board rows in view (the scroll area less its "more" rows)
// SLOT from the CHIPS tab: back to the board, scrolled so the sockets it fits are in view (all of them when they fit
// in the view together, else from the first one down) (Greg, 2026-11-15). None open for it: say so, stay on the list.
function deckCarry(key) {
  const d = DECK, c = DECK_CHIPS[key], fit = DECK_SOCKETS.filter(s => deckFits(key, s) && deckOpen(s.mk));
  if (!fit.length) {
    const any = DECK_SOCKETS.find(s => deckFits(key, s));
    Sound.deny(); return deckSay(any ? `no open ${DECK_GROUPS[c[1]][0]} socket: it opens with mk ${deckMk(any.mk)}.` : 'no socket for it on this deck.', C.danger);
  }
  const rows = deckViewRows(), top = Math.min(...fit.map(s => s.y)), bot = Math.max(...fit.map(s => s.y + s.h));
  const max = Math.max(0, deckArt().length - rows);
  deckScrollTo(clamp(bot - top <= rows ? Math.round((top + bot - rows) / 2) : top - 1, 0, max));
  d.carry = key; d.view = 'board'; Sound.ui();
}
function deckShow(by, h, rows) { const d = DECK, at = deckScrollGoal(); if (by < at) deckScrollTo(Math.max(0, by - 1)); else if (by + h > at + rows) deckScrollTo(by + h - rows + 1); }   // (smooth: deckScrollTo)

function openDeck(o = {}) {
  if (!o.dev && !save.deck) deckEnsure();
  DECK = o.dev || !save.deck ? deckDev() : deckReal();
  const d = DECK;
  if (d.real && d.mk > (d.seenMk || 2)) deckUpShow(d.mk, 500);   // bought on THE BOARD since you last looked: the fanfare now
  d.pick = null; d.cpu = null; d.carry = null; d.msg = null; d.selT = performance.now();
  openPanel('THE DECK', deckLines, null, { full: true });
  st.keyHandler = deckKey;
  // POPS first, then ROOT's QUEST card (Greg, 2026-11-21: the card came up before POPS had said what a deck is)
  if (d.real && !save.deck.popsSeen) { save.deck.popsSeen = true; persist(); queueCall('pops', deckTrainLines()); }
  if (d.real) rootStart();   // ROOT's quest starts here, or at a bench (engine/quests.js)
}
// The deck's training (Greg, 2026-11-20: "rough something in"): POPS, the first time you open your deck. Seen once
// (save.deck.popsSeen); `deck.pops` in THE SHELL replays it.
function deckTrainLines() {
  return ["your deck, kid. it's a board, like the ones you breach. this one's yours.",
    "tap a socket to see what fits it. tap a chip to slot it.",
    "chips need power. the cell sets how much. no power, no chip.",
    "the chips that are slotted and powered when a run starts run all run.",
    "find chips in DATA CACHEs and at the PIER. they ride home on your belt: cash out to keep them, die and they're gone.",
    ...(rootOn() ? ["SHELL and SUDO chips teach THE SHELL commands. give.mod and give.gear call up what you've found."]
      : ["SHELL and SUDO chips need a shell. you don't have one yet. something in here might."])];
}
// Out of your deck: to a BOARD tab (tab: you, rep, feats... Esc: YOU), or 'title'. Chips with no power: it warns once first.
function deckLeave(tab = 'you') {
  const off = deckPower().off.length, now = performance.now();
  if (off && now - DECK.leave > 3000) { DECK.leave = now; Sound.deny(); return deckSay(`${off} chip${off > 1 ? 's have' : ' has'} no power. tap again to go.`, C.danger); }
  DECK.leave = 0;
  if (DECK.real && tab !== 'title') swapTo(() => openBoard(tab)); else swapTo(showTitle);
}
function deckKey(k) {
  const d = DECK; if (!d) return false;
  if (k === 'escape') { if (d.pick || d.cpu) { d.pick = null; d.cpu = null; Sound.tick(); } else if (d.carry) d.carry = null; else deckLeave(); return true; }
  const dd = k === 'arrowup' ? -1 : k === 'arrowdown' ? 1 : 0;
  if (d.pick && d.pick.keys) { if (dd) { d.pick.keys.move(dd); return true; } if (k === 'enter' || k === ' ') { d.pick.keys.go(); return true; } }
  if (dd) { if (d.keyStep) d.keyStep(dd); else if (st.scroll) st.scroll(dd); return true; }
  return false;
}

// ---------- the show (docs/DECK.md "Socketing gets a show", Greg 2026-11-16) ----------
// A chip goes in with power: a burst of confetti and tech blobs (more the rarer it is), and a wave of light runs out of
// its socket along the traces. No power: the light drains back into the socket, the board goes dim, then fills again,
// with static sparks around the chip. d.fx = { kind: 'in' | 'dead', sid, t0, lvl, burst }.
// The board's own look, toned back so it isn't noisy: the traces lean to the mk's color (mk II rare, III epic, IV
// exotic: Greg), silkscreen part numbers in the empty spots, vias, and now and then a data packet running a trace.
// (Greg, 2026-11-16: rare, epic, then legendary; but mk IV takes the exotic gold, he likes it better than the orange)
const DECK_MK_RARITY = { 2: 'rare', 3: 'epic', 4: 'exotic' };
const deckTraceCol = () => rarityCol(DECK_MK_RARITY[DECK.mk] || 'rare');
const DECK_LVL = { scrap: 0, common: 0, rare: 1, epic: 2, legendary: 3, exotic: 4 };
const DECK_TRACE = '-|=:.+o_/\\';   // the characters light runs along
const DECK_WAVE_MS = 13, DECK_DRAIN_MS = 7;   // ms a cell: the wave out, the drain in (and the fill back)
function deckFx(kind, sid, key) {
  const d = DECK; d.fx = { kind, sid, t0: performance.now(), lvl: key ? DECK_LVL[DECK_CHIPS[key][2]] || 0 : 0, burst: false };
  if (kind === 'in' && !reduced()) {
    (d.snakes = d.snakes || []).push(...deckSnakes(sid, 3 + 2 * d.fx.lvl, 12 + 5 * d.fx.lvl, d.fx.t0));   // (snakes along the wires: Greg)
    if (key) d.snakes.push(...deckRoundSnakes(sid, rarityCol(DECK_CHIPS[key][2]), d.fx.t0 + 100));   // ...and a burst of rounded ones out of the chip
    if (key && DECK_TECH_ON) d.techs = (d.techs || []).concat(deckTechs(sid, d.fx.lvl, rarityCol(DECK_CHIPS[key][2]), d.fx.t0));   // tech blobs around it
  }
  if (kind === 'in') Sound.chipIn(d.fx.lvl); else Sound.chipDead();
}
// how far each of the board's cells is from a socket (cached per socket). The art's traces have gaps (it's ASCII), so
// the light spreads out as a ring across the board's lines, a cell's distance jittered a little so the edge crackles.
// (y counts double: a cell is twice as tall as it is wide.)
const deckDists = {};
function deckDist(sid) {
  if (deckDists[sid]) return deckDists[sid];
  const ART = deckArt(), s = deckSock(sid) || DECK_PARTS.find(p => p.id === sid), m = new Map();
  let max = 0;
  for (let y = 0; y < ART.length; y++) for (let x = 0; x < DECK_ART_W; x++) {
    if ((ART[y][x] || ' ') === ' ') continue;
    const dx = x - clamp(x, s.x, s.x + s.w - 1), dy = y - clamp(y, s.y, s.y + s.h - 1), j = ((x * 37 + y * 91) % 7) / 4;
    const dd = Math.sqrt(dx * dx + 4 * dy * dy) + j; m.set(y * 64 + x, dd); max = Math.max(max, dd);
  }
  return (deckDists[sid] = { m, max });
}
// silkscreen (toned back): part numbers, mounting holes, the board's name. Each one only goes where the art is empty.
const DECK_SILK = [[0, 0, '(o)'], [33, 0, '(o)'], [8, 13, 'U1'], [14, 21, '<XTAL>'], [22, 26, 'R12'], [27, 26, '-/\\/-'],
  [12, 39, 'C7'], [26, 39, '+5V'], [2, 52, 'GND'], [2, 53, 'Q2'], [16, 52, 'NEON+1 DECK'], [19, 53, 'REV E'], [0, 55, '(o)'], [33, 55, '(o)']];
let deckSilkCells = null;
function deckLook() {   // the silkscreen's cells and the vias, worked out once
  if (deckSilkCells) return deckSilkCells;
  const ART = deckArt(), cover = (x, y) => DECK_SOCKETS.concat(DECK_PARTS).some(r => x >= r.x - 1 && x < r.x + r.w + 1 && y >= r.y && y < r.y + r.h);
  const free = (x, y) => ART[y] && x >= 0 && x < DECK_ART_W && (ART[y][x] || ' ') === ' ' && !cover(x, y);
  const silk = DECK_SILK.filter(([x, y, t]) => [...t].every((_, i) => free(x + i, y) && free(x + i - 1, y) && free(x + i + 1, y)));
  const vias = [];
  for (let y = 0; y < ART.length; y++) for (let x = 0; x < DECK_ART_W; x++) {
    if (!free(x, y) || silk.some(([sx, sy, t]) => sy === y && x >= sx - 1 && x <= sx + t.length)) continue;
    const near = [[1, 0], [-1, 0]].some(([dx]) => DECK_TRACE.includes((ART[y] || '')[x + dx] || ' '));
    if (near && ((x * 73 + y * 151) % 41) === 0) vias.push([x, y]);
  }
  // hidden tech blobs: dim (or dark) until your deck is alive enough, or a ripple passes (Greg)
  const blobs = [];
  for (let y = 0; y < ART.length; y++) for (let x = 0; x < DECK_ART_W; x++) {
    if (!free(x, y) || silk.some(([sx, sy, t]) => sy === y && x >= sx - 1 && x <= sx + t.length) || vias.some(([vx, vy]) => vx === x && vy === y)) continue;
    const h = ((x * 2654435761 + y * 40503) >>> 0) % 1000 / 1000;
    if (h < 0.07) blobs.push([x, y, 'o*=#:.+'[Math.floor(h * 1000) % 7], h / 0.07]);
  }
  return (deckSilkCells = { silk, vias, blobs });
}
// The wires as a graph (Greg, 2026-11-16: "the pulse should follow the traces"): a wire char links to the wire chars
// around it (a diagonal only through / or \). Snakes: a lit head with a short tail running a random walk along it, a
// few out of a socket when a chip goes in (more and longer the rarer), and now and then on their own.
const DECK_WIRE = '-|=:+o_/\\<>^v{}';
let deckWireMap = null;
function deckWires() {
  if (deckWireMap) return deckWireMap;
  const ART = deckArt(), is = (x, y) => DECK_WIRE.includes((ART[y] || '')[x] || ' '), m = new Map();
  for (let y = 0; y < ART.length; y++) for (let x = 0; x < DECK_ART_W; x++) {
    if (!is(x, y)) continue;
    const n = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if ((!dx && !dy) || !is(x + dx, y + dy)) continue;
      if (dx && dy && !'/\\'.includes(ART[y][x]) && !'/\\'.includes(ART[y + dy][x + dx])) continue;
      n.push([x + dx, y + dy]);
    }
    m.set(y * 64 + x, n);
  }
  return (deckWireMap = m);
}
// a walk along the wires from [x, y]: it keeps its heading when it can
function deckWalk(x, y, len, avoid) {
  const W = deckWires(), path = [[x, y]], seen = new Set([y * 64 + x]);
  let hx = 0, hy = 0;
  for (let i = 0; i < len; i++) {
    const [px, py] = path[path.length - 1];
    const nx = (W.get(py * 64 + px) || []).filter(([a, b]) => !seen.has(b * 64 + a) && !(avoid && avoid(a, b)));
    if (!nx.length) break;
    const ahead = nx.filter(([a, b]) => a - px === hx && b - py === hy);
    const [a, b] = ahead.length && Math.random() < 0.7 ? ahead[0] : nx[Math.floor(Math.random() * nx.length)];
    hx = a - px; hy = b - py; seen.add(b * 64 + a); path.push([a, b]);
  }
  return path;
}
// snakes out of a socket (or a part): from the wires touching it, outward
function deckSnakes(sid, n, len, now, delay = 40) {
  const s = deckSock(sid) || DECK_PARTS.find(p => p.id === sid), W = deckWires(), inside = (x, y) => x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h;
  const starts = [];
  for (let y = s.y - 1; y <= s.y + s.h; y++) for (let x = s.x - 1; x <= s.x + s.w; x++) if (!inside(x, y) && W.has(y * 64 + x)) starts.push([x, y]);
  if (!starts.length) return [];
  return Array.from({ length: n }, (_, i) => { const [x, y] = starts[Math.floor(Math.random() * starts.length)]; return { path: deckWalk(x, y, len + Math.floor(Math.random() * len / 2), inside), t0: now + i * delay, ms: 26 }; });
}
// The under-traces (Greg, 2026-11-16): every socket has a few paths of its own, box-line style, running out from it under
// the board and around (empty board first, across the art when they must, never through a socket or a part). They're
// hidden: they only show while a snake runs them, lit in the slot's chip's rarity. Fixed per socket (seeded by its id).
// deckUnder() = { sid: [ [[x, y, ch], ...], ... ] }
const DECK_UNDER_N = 3;
const DECK_UNDER_ON = false;   // (Greg, 2026-11-16: off for now, to see the slot burst on its own)
let deckUnderMap = null;
function deckUnder() {
  if (deckUnderMap) return deckUnderMap;
  const ART = deckArt(), H = ART.length, rects = DECK_SOCKETS.concat(DECK_PARTS), m = {};
  const blocked = (x, y) => x < 0 || y < 0 || x >= DECK_ART_W || y >= H || rects.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  const empty = (x, y) => (ART[y][x] || ' ') === ' ';
  for (const s of DECK_SOCKETS) {
    if (s.g === 'glyph') continue;
    let seed = [...s.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const ring = [];   // the cells around the socket, heading away from it
    for (let x = s.x; x < s.x + s.w; x++) ring.push([x, s.y - 1, 0, -1], [x, s.y + s.h, 0, 1]);
    for (let y = s.y; y < s.y + s.h; y++) ring.push([s.x - 1, y, -1, 0], [s.x + s.w, y, 1, 0]);
    const starts = ring.filter(([x, y]) => !blocked(x, y));
    m[s.id] = [];
    for (let i = 0; i < DECK_UNDER_N && starts.length; i++) {
      let [x, y, hx, hy] = starts[Math.floor(rnd() * starts.length)];
      const path = [[x, y]], seen = new Set([y * 64 + x]), len = 10 + Math.floor(rnd() * 16);
      for (let k = 0; k < len; k++) {
        // straight on mostly, a turn now and then; empty board wins
        const opts = [[hx, hy, 3], [hy, hx, 1], [-hy, -hx, 1]].filter(([dx, dy]) => !blocked(x + dx, y + dy) && !seen.has((y + dy) * 64 + x + dx));
        if (!opts.length) break;
        let best = null, bs = -1;
        for (const [dx, dy, w] of opts) { const sc = (empty(x + dx, y + dy) ? 2 : 0.35) * w * (0.4 + rnd()); if (sc > bs) { bs = sc; best = [dx, dy]; } }
        [hx, hy] = best; x += hx; y += hy; seen.add(y * 64 + x); path.push([x, y]);
      }
      if (path.length < 5) continue;
      // box lines: a cell's char from where the path comes in and goes out
      m[s.id].push(path.map(([x, y], j) => {
        const nb = [path[j - 1], path[j + 1]].filter(Boolean).map(([a, b]) => [a - x, b - y]);
        const h = nb.some(([a]) => a), v = nb.some(([, b]) => b);
        if (!h || !v) return [x, y, h ? '─' : '│'];
        const l = nb.some(([a]) => a < 0), u = nb.some(([, b]) => b < 0);
        return [x, y, u ? (l ? '┘' : '└') : (l ? '┐' : '┌')];
      }));
    }
  }
  return (deckUnderMap = m);
}
// snakes on a socket's under-traces, in its chip's rarity (back: run one in toward the socket)
function deckUnderSnake(sid, i, now, ms = 45, back = false) {
  const p = (deckUnder()[sid] || [])[i], key = DECK.slots[sid];
  if (!p || !key || !DECK_CHIPS[key]) return null;
  const path = back ? p.slice().reverse() : p;
  return { path: path.map(([x, y]) => [x, y]), ch: path.map(c => c[2]), t0: now, ms, rc: rarityCol(DECK_CHIPS[key][2]), tail: 7 };
}
// The slot burst (Greg, 2026-11-16): 4 to 7 snakes in rounded box lines, out of the chip in random directions,
// gone in about 2 seconds. Their paths are fresh each time and go anywhere on the board, but they run under the
// sockets and the parts (deckUnderAt: they don't draw there), so they never cover a chip.
const deckUnderAt = (x, y) => DECK_SOCKETS.concat(DECK_PARTS).some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
function deckRoundSnakes(sid, rc, now) {
  const s = deckSock(sid), H = deckArt().length, out = [], n = 4 + Math.floor(Math.random() * 4);   // (Greg: 4 to 7)
  const ring = [];   // the cells around the socket, heading away from it
  for (let x = s.x; x < s.x + s.w; x++) ring.push([x, s.y - 1, 0, -1], [x, s.y + s.h, 0, 1]);
  for (let y = s.y; y < s.y + s.h; y++) ring.push([s.x - 1, y, -1, 0], [s.x + s.w, y, 1, 0]);
  const starts = ring.filter(([x, y]) => x >= 0 && y >= 0 && x < DECK_ART_W && y < H);
  for (let i = 0; i < n && starts.length; i++) {
    let [x, y, hx, hy] = pickR(starts, Math.random);
    const path = [[x, y]], seen = new Set([y * 64 + x]), len = 14 + Math.floor(Math.random() * 7);   // (Greg: a bit further, fewer turns, about 2 seconds)
    for (let k = 0; k < len; k++) {
      const turn = Math.random() < 0.15, dirs = (turn ? [[hy, hx], [-hy, -hx], [hx, hy]] : [[hx, hy], [hy, hx], [-hy, -hx]]).filter(([dx, dy]) => {
        const a = x + dx, b = y + dy; return a >= 0 && b >= 0 && a < DECK_ART_W && b < H && !seen.has(b * 64 + a) && !(a >= s.x && a < s.x + s.w && b >= s.y && b < s.y + s.h); });
      if (!dirs.length) break;
      const [dx, dy] = turn && dirs.length > 1 && Math.random() < 0.5 ? dirs[1] : dirs[0];
      hx = dx; hy = dy; x += dx; y += dy; seen.add(y * 64 + x); path.push([x, y]);
    }
    const ch = path.map(([x, y], j) => {
      const nb = [path[j - 1], path[j + 1]].filter(Boolean).map(([a, b]) => [a - x, b - y]);
      const h = nb.some(([a]) => a), v = nb.some(([, b]) => b);
      if (!h || !v) return h ? '─' : '│';
      const l = nb.some(([a]) => a < 0), u = nb.some(([, b]) => b < 0);
      return u ? (l ? '╯' : '╰') : (l ? '╮' : '╭');
    });
    out.push({ path, ch, t0: now + i * 70, ms: (75 + Math.random() * 20) / 1.2, rc, tail: 5, under: true });
  }
  return out;
}
// tech blobs around a chip that just went in: they pop up around the socket, decode, glow in its rarity, then fade
// (more the rarer). d.techs = [{ x, y, t, t0, life, col }]
const DECK_TECH_ON = false;   // the ring of them around the chip (Greg, 2026-11-16: off; they come at the slot burst's ends now: DECK_TECH_END)
const DECK_TECH = ['o', '#', '=o=', '[]', '0x', '::', '<>', '+', '*', '1o', '=#'];
function deckTechs(sid, lvl, col, now, n = 5 + 3 * lvl) {
  const s = deckSock(sid), ART = deckArt(), rects = DECK_SOCKETS.concat(DECK_PARTS), out = [];
  const blocked = (x, y) => x < 0 || y < 0 || x >= DECK_ART_W || y >= ART.length || rects.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  const have = DECK.techs || [];
  for (let tries = 0; out.length < n && tries < n * 12; tries++) {
    const t = pickR(DECK_TECH, Math.random), x = s.x - 3 + Math.floor(Math.random() * (s.w + 6)), y = s.y - 1 + Math.floor(Math.random() * (s.h + 2));
    if ([...t].some((_, i) => blocked(x + i, y)) || out.concat(have).some(o => o.y === y && x < o.x + o.t.length + 1 && o.x < x + t.length + 1)) continue;
    out.push({ x, y, t, t0: now + Math.random() * (250 + 60 * lvl), life: 650 + Math.random() * (400 + 120 * lvl), col });
  }
  return out;
}
// ...and one where a slot burst's snake ends (Greg, 2026-11-16: the wires go out and run around, then a tech blob where
// each one ends, in the chip's rarity). On the end cell or next to it, never on a socket, a part or another blob.
const DECK_TECH_END = true;
function deckTechAt(x, y, col, now) {
  const d = DECK, H = deckArt().length, t = pickR(DECK_TECH, Math.random), have = d.techs || [];
  for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1], [-2, 0], [-1, -1], [-1, 1]]) {
    const bx = x + dx - Math.floor((t.length - 1) / 2), by = y + dy;
    if ([...t].some((_, i) => bx + i < 0 || bx + i >= DECK_ART_W || by < 0 || by >= H || deckUnderAt(bx + i, by))) continue;
    if (have.some(o => o.y === by && bx < o.x + o.t.length + 1 && o.x < bx + t.length + 1)) continue;
    d.techs = have.concat({ x: bx, y: by, t, t0: now, life: 900 + Math.random() * 500, col });
    return;
  }
}
// How alive your deck is (0-1): more chips in, more power used, a higher mk (Greg: more tech blobs, more active, as you
// slot more and your deck levels up). It sets how many hidden blobs glow and how often snakes run on their own.
function deckEnergy(pw) {
  const d = DECK, open = DECK_SOCKETS.filter(s => deckOpen(s.mk) && s.g !== 'glyph');
  const filled = open.length ? open.filter(s => d.slots[s.id] && pw.on.has(s.id)).length / open.length : 0;
  const pf = pw.budget ? pw.used / pw.budget : 0;
  return clamp(0.12 + 0.45 * filled + 0.25 * pf + 0.18 * (d.mk - 2) / 2, 0, 1);
}
// a smooth scroll of the board (Greg: the NO POWER bar jumped; about half a second)
const DECK_SCROLL_MS = 450;
function deckScrollTo(to) { const d = DECK; d.scrollTo = { from: d.scroll, to, t0: performance.now() }; }
const deckScrollGoal = () => DECK.scrollTo ? DECK.scrollTo.to : DECK.scroll;
// the band an mk opens (its first row on the board), for the upgrade's boot sweep
const DECK_BAND_TOP = { 2: 0, 3: 28, 4: 41 }, DECK_BAND_END = { 2: 28, 3: 41, 4: 56 };

// the CRASH stick: a name too long for it shows a word (or 4 letters) at a time, swapping with a scramble (Greg)
function deckStickText(name, now) {
  const parts = name.includes(' ') ? name.split(' ') : name.length <= 5 ? [name] : name.match(/.{1,4}/g);
  if (parts.length < 2) return name.replace(/ /g, '');
  const per = 1500, k = Math.floor(now / per) % parts.length, t = now % per, cur = parts[k], prev = parts[(k + parts.length - 1) % parts.length];
  if (t > 300) return cur;
  return Array.from({ length: Math.max(cur.length, prev.length) }, (_, j) => t > 60 + j * 50 ? (cur[j] || ' ') : noiseCh()).join('');
}

// ---------- drawing ----------
// A cell grid for one block: the game's put adds cells (two puts on a cell draw both), so the deck draws here, where
// a later put replaces, then hands the cells over.
function deckGrid(ctx) {
  const cells = new Map(), bgs = [], K = (x, y) => y * 4096 + x + 512;
  const g = {
    dim: false,
    put: (x, y, s, col, bold = false) => { for (let i = 0; i < s.length; i++) if (s[i] !== ' ') cells.set(K(x + i, y), { x: x + i, y, ch: s[i], col: g.dim ? C.dim : col, bold: g.dim ? false : bold }); },
    clr: (x, y, w, h = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) cells.delete(K(x + i, y + j)); },
    bg: (x, y, w, h, col, a = 1) => { if (g.dim) return; for (let j = 0; j < h; j++) bgs.push([x, y + j, w, col, a]); },
    flush: () => { for (const b of bgs) ctx.bg(...b); for (const c of cells.values()) ctx.put(c.x, c.y, c.ch, c.col, 'board', c.bold); },
  };
  return g;
}
function deckBtn(ctx, g, x, y, label, col, id, fn, off = false) {
  g.put(x, y, label, off ? C.dim : col);
  if (!off && !g.dim) { ctx.hl(x, y, label.length, 1, id, false); ctx.addHit(x, y, label.length, 1, { kind: 'btn', id, onTap: fn }); }
  return x + label.length + 1;
}
// the "more" rows (engine/codex.js scrollArea): an inverted bar, blank when there's nothing more that way
function deckMore(ctx, g, x0, w, y, up, can, fn, id) {
  if (!can || g.dim) return;
  const s = up ? DECK_MORE_UP : DECK_MORE_DN, x = x0 + Math.floor((w - s.length) / 2);
  g.bg(x, y, s.length, 1, st.hoverBtn === id ? C.accent : C.text, 1); g.put(x, y, s, C.bg, true);
  ctx.addHit(x, y, s.length, 1, { kind: 'btn', id, onTap: () => { fn(); Sound.tick(); } });
}
// A scroll area by rows, with the "more" rows (engine/codex.js scrollArea). items: { h, stop, draw(g, ctx, y) }: a chip is
// 2 rows (stop: true), with a dim dashed row between (deckSep). The wheel and a drag move it a row at a time and can
// leave an item cut at the edge; a "more" tap or the keys step to the next whole item (Greg, 2026-11-15). s: { top }
// (a row). Returns { line, step, show(i) }.
function deckRows(ctx, g, x0, w, y, rows, items, s, idp) {
  const start = []; let total = 0;
  for (const it of items) { start.push(total); total += it.h; }
  const fits = total <= rows, inner = fits ? rows : rows - 2, wy = fits ? y : y + 1, max = Math.max(0, total - inner);
  s.top = clamp(s.top || 0, 0, max);
  const top = s.top, inRows = yy => yy >= wy && yy < wy + inner;
  // what an item draws with: everything clipped to the window
  const cg = { get dim() { return g.dim; }, set dim(v) { g.dim = v; },
    put: (x, yy, t, col, bold) => { if (inRows(yy)) g.put(x, yy, t, col, bold); },
    clr: (x, yy, ww, h = 1) => { for (let j = 0; j < h; j++) if (inRows(yy + j)) g.clr(x, yy + j, ww, 1); },
    bg: (x, yy, ww, h, col, a) => { for (let j = 0; j < h; j++) if (inRows(yy + j)) g.bg(x, yy + j, ww, 1, col, a); } };
  const clip = (yy, h) => { const a = Math.max(yy, wy), b = Math.min(yy + h, wy + inner); return b > a ? [a, b - a] : null; };
  const cctx = Object.assign({}, ctx, {
    hl: (x, yy, ww, h, id, m) => { const c = clip(yy, h); if (c) ctx.hl(x, c[0], ww, c[1], id, m); },
    addHit: (x, yy, ww, h, hit) => { const c = clip(yy, h); if (c) ctx.addHit(x, c[0], ww, c[1], hit); } });
  items.forEach((it, i) => { const yy = wy + start[i] - top; if (yy + it.h > wy && yy < wy + inner) it.draw(cg, cctx, yy); });
  const line = dd => { const t = clamp(s.top + dd, 0, max); if (t !== s.top) { s.top = t; Sound.tick(); } };
  const stops = items.map((it, i) => i).filter(i => items[i].stop);
  // a step: to the next item that isn't all in view, all of it (the first item takes the rows above it too)
  const step = dd => {
    let t;
    if (dd > 0) { const i = stops.find(i => start[i] + items[i].h > s.top + inner); t = i != null ? Math.max(s.top + 1, start[i] + items[i].h - inner) : max; }
    else { const i = stops.slice().reverse().find(i => start[i] < s.top); t = i != null ? Math.min(s.top - 1, i === stops[0] ? 0 : start[i]) : 0; }
    s.top = clamp(t, 0, max);
  };
  const show = i => {
    if (i == null || i < 0) return;
    const a = i === stops[0] ? 0 : start[i], b = start[i] + items[i].h;
    if (a < s.top) s.top = a; else if (b > s.top + inner) s.top = b - inner;
    s.top = clamp(s.top, 0, max);
  };
  if (!fits) {
    deckMore(ctx, g, x0, w, y, true, top > 0, () => step(-1), idp + 'up');
    deckMore(ctx, g, x0, w, y + rows - 1, false, top < max, () => step(1), idp + 'dn');
  }
  return { line, step, show };
}
// the row between two items: a light dashed line
const deckSep = (x, w) => ({ h: 1, draw: (g, ctx, y) => g.put(x + 1, y, rule(w - 2), C.dim) });
// a chip's face: 3 x 2 (5 x 2 for BOSS), both rows art, on its rarity chip (grey with no power)
function deckFace(g, x, y, key, off) {
  const c = DECK_CHIPS[key], ch = off ? DECK_OFF : chipOf(c[2]), w = c[1] === 'boss' ? 5 : 3;
  const bot = key === 'SP3' ? DECK_SPOILS[DECK.spoils][1] : c[5][1];
  g.bg(x, y, w, 2, ch.bg, 1); g.put(x, y, c[5][0], ch.fg, true); g.put(x, y + 1, bot, ch.fg, true);
  if (deckIsRipped(key) && !off) for (let r = 0; r < 2; r++) deckRipGlow((cx, cy, col, a) => g.bg(cx, cy, 1, 1, col, a), x, y + r, w, performance.now() - r * 150);   // RIPPED: magenta runs through it
}
// a socket: its code on the top border, the frame by state, the chip inside. P / B / CL: put, bg, clear (the board's
// clip to the rows in view; the card's draw straight)
function deckSocket(s, X, Y, P, B, CL, { sel = false, key, pw, now }) {
  const d = DECK, open = deckOpen(s.mk), gc = deckGroupCol(s.g), w = s.w, inner = w - 2;
  if (key === undefined) key = d.slots[s.id];
  const off = !!(key && open && pw && !pw.on.has(s.id) && DECK_CHIPS[key][1] !== 'psu' && d.slots[s.id] === key);
  CL(X, Y, w, s.h);
  const col = !open ? C.dim : off ? C.danger : key ? gc : C.mid;
  if (s.g === 'glyph') {
    P(X, Y, '+=GLY=+', col); for (let j = 1; j < 4; j++) { P(X, Y + j, ']', col); P(X + 6, Y + j, '[', col); } P(X, Y + 4, '+=-=-=+', col);
    if (!open) P(X + 1, Y + 2, ':mk3:', C.mid);
    else DECK_GLYPHS[d.glyph][1].forEach((l, j) => P(X + 1, Y + 1 + j, l, C.bright, true));
  } else {
    P(X, Y, '+' + (inner > 3 ? '.' : '') + s.id + (inner > 3 ? '.' : '') + '+', col);
    for (let j = 1; j < s.h - 1; j++) { P(X, Y + j, !open || !key ? ':' : ']', col); P(X + w - 1, Y + j, !open || !key ? ':' : '[', col); }
    P(X, Y + s.h - 1, !open ? '+' + '.'.repeat(inner) + '+' : key ? (inner > 3 ? '+-+-+-+' : '+-+-+') : (inner > 3 ? '+ - - +' : '+ - +'), col);
    // the power on the bottom border (Greg, 2026-11-15): the chip's cost, centered (none at 0); the PSU: used / budget
    if (open && key && pw && d.slots[s.id] === key) {
      const c = DECK_CHIPS[key][3], mid = X + Math.floor(w / 2);
      if (s.id === 'PSU') P(X + 1, Y + s.h - 1, deckHex(pw.used) + '/' + deckHex(pw.budget), d.overclock ? C.accent : C.money, true);
      else if (c) P(mid, Y + s.h - 1, deckHex(c), off ? C.danger : C.money, true);
    }
    if (!open) P(X + 1, Y + 1, inner > 3 ? ' mk' + s.mk + ' ' : 'mk' + s.mk, C.mid);
    else if (key) deckFace({ put: P, bg: B }, X + 1, Y + 1, key, off);
    else if (s.id === DECK_KIT_SOCKET) P(X + 1, Y + 1, 'KIT', C.mid);   // (the KIT socket, empty: says so)
    // a SHELL socket before ROOT moves in (its quest: engine/quests.js): something lives in it, glitching in the quest color
    if (open && deckShellPending(s)) for (let j = 1; j < s.h - 1; j++) for (let i = 1; i < w - 1; i++)
      if (hh(i + s.x * 7, j + Math.floor(now / 140) + s.y) < (key ? 0.12 : 0.35)) P(X + i, Y + j, noiseCh(), C.rep);
  }
  if (d.carry && open && deckFits(d.carry, s) && Math.floor(now / 300) % 2) B(X, Y, w, s.h, C.accent, 0.3);
  if (sel) B(X, Y, w, s.h, C.accent, 0.22);
}

function deckLines(T, B, X) {
  const d = DECK; if (!d) return;
  const sa = L.hc - 1 - 5 - DECK_CARD_H;   // the scroll area: what the header, the card and the footer row leave
  st.scroll = null;
  deckPersist();
  X({ h: 5, draw: (ctx, y) => deckHeader(ctx, y) });
  X({ h: sa, draw: (ctx, y) => { if (d.pick) deckPicker(ctx, y, sa); else if (d.cpu) deckCpu(ctx, y, sa); else if (d.view === 'chips') deckChipList(ctx, y, sa); else deckBoard(ctx, y, sa); } });
  X({ h: DECK_CARD_H, draw: (ctx, y) => deckCard(ctx, y) });
}

function deckHeader(ctx, y) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), W = L.wc;
  // top left: the way out (Greg, 2026-11-21: every menu's [< TITLE] sits here). REP isn't up here any more: it's in the
  // buttons that cost it (deckRepBtn)
  if (d.real) deckBtn(ctx, g, 0, y, '[< TITLE]', C.mid, 'back', () => deckLeave('title'));
  else g.put(0, y, 'NeoN+1', C.accent);
  // THE BOARD's tabs, DECK lit (Greg, 2026-11-21: the deck is a BOARD tab; it had its own header and a [LEAVE] that was
  // really a back). The same two rows as THE BOARD (engine/menus.js openBoard), centered. The dev deck: its own row.
  if (d.real) {
    const rows = [['you', 'rep', 'deck'], ['feats', 'crew', 'quests']];
    rows.forEach((ks, ri) => {
      const labels = ks.map(k => `[${k.toUpperCase()}${k !== 'deck' && boardStar(k) ? '*' : ''}]`), w = labels.join(' ').length;
      let x = Math.floor((W - w) / 2);
      ks.forEach((k, i) => {
        if (k === 'deck') { g.bg(x, y + 1 + ri, labels[i].length, 1, C.accent, 0.22); g.put(x, y + 1 + ri, labels[i], C.accent, true); x += labels[i].length + 1; }
        else x = deckBtn(ctx, g, x, y + 1 + ri, labels[i], C.bright, 'dkb_' + k, () => deckLeave(k));
      });
    });
  } else {
    g.put(0, y + 1, 'DECK · DEV', C.danger, true); deckBtn(ctx, g, W - 7, y + 1, '[LEAVE]', C.mid, 'dkleave', () => deckLeave());
  }
  // the sub-tabs: SLOTS and CHIPS, in a strip (the same look as engine/textboard.js drawSubTabs), the power on the right
  g.bg(0, y + 3, W, 1, C.dim, 0.35);
  const tab = (v, label, id, x) => { const s = ` ${label} `, on = d.view === v; if (on) g.bg(x, y + 3, s.length, 1, C.accent, 1);
    deckBtn(ctx, g, x, y + 3, s, on ? C.bg : C.bright, id, () => { if (d.view === v) return; d.view = v; d.pick = null; d.cpu = null; d.carry = null; Sound.tick(); }); return x + s.length + 1; };
  const x2 = tab('board', 'SLOTS', 'dktb', 1); const x3 = tab('chips', `CHIPS ${deckOwned().length}`, 'dktc', x2);
  const pwt = `PWR ${pw.used}/${pw.budget}` + (pw.fuse ? ` F${pw.fuse.used}/${pw.fuse.budget}` : '') + (pw.off.length ? ` !${pw.off.length}` : ''), mkt = `mk ${deckMk(d.mk)} `;
  g.put(W - pwt.length, y + 3, pwt, pw.off.length ? C.danger : C.money, !!pw.off.length);
  if (W - pwt.length - mkt.length >= x3 + 1) g.put(W - pwt.length - mkt.length, y + 3, mkt, C.money);   // (the mk gives way when it's tight)
  g.put(0, y + 4, rule(W), C.dim);
  g.flush();
}

function deckBoard(ctx, y0, sa, under = null) {   // under: the picker's grid (the board draws into it, dim, no taps)
  const d = DECK, g = under || deckGrid(ctx), now = ctx.now, pw = deckPower(), ART = deckArt(), BH = ART.length, bv = sa - 2;
  const ax = Math.floor((L.wc - DECK_ART_W) / 2), maxTop = Math.max(0, BH - bv);
  if (d.scrollTo && !under) { const k = clamp((now - d.scrollTo.t0) / DECK_SCROLL_MS, 0, 1), e = 1 - Math.pow(1 - k, 3);
    d.scroll = Math.round(d.scrollTo.from + (clamp(d.scrollTo.to, 0, maxTop) - d.scrollTo.from) * e); if (k >= 1) d.scrollTo = null; }
  d.scroll = clamp(d.scroll, 0, maxTop);
  const top = d.scroll, inView = by => by >= top && by < top + bv, sy = by => y0 + 1 + by - top;
  const bput = (x, by, s, col, bold) => { if (inView(by)) g.put(ax + x, sy(by), s, col, bold); };
  const bbg = (x, by, w, h, col, a) => { const a0 = Math.max(by, top), a1 = Math.min(by + h, top + bv); if (a1 > a0) g.bg(ax + x, sy(a0), w, a1 - a0, col, a); };
  const bclr = (x, by, w, h) => { for (let r = by; r < by + h; r++) if (inView(r)) g.clr(ax + x, sy(r), w, 1); };
  const bhit = (x, by, w, h, id, fn) => { if (under) return; const a0 = Math.max(by, top), a1 = Math.min(by + h, top + bv); if (a1 > a0) { ctx.hl(ax + x, sy(a0), w, a1 - a0, id, false); ctx.addHit(ax + x, sy(a0), w, a1 - a0, { kind: 'btn', id, onTap: fn }); } };
  if (under) g.dim = true;
  // the art, dim where the band is dark
  const tc = deckTraceCol(), idle = mixHex(C.mid, tc, 0.3), silkCol = mixHex(C.dim, C.mid, 0.45);
  for (let by = top; by < top + bv && by < BH; by++) g.put(ax, sy(by), ART[by], deckOpen(deckBand(by)) ? idle : C.dim);
  { const lk = deckLook();   // silkscreen and vias, toned back
    for (const [x, y, t] of lk.silk) bput(x, y, t, silkCol);
    for (const [x, y] of lk.vias) bput(x, y, 'o', mixHex(C.dim, tc, 0.25)); }
  const fx = d.fx, fxAge = fx ? now - fx.t0 : 0, still = reduced(), en = deckEnergy(pw), lk = deckLook();
  const hh = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
  // the hidden tech blobs: the livelier your deck, the more of them glow (dim), and now and then one twinkles
  if (!under) for (const [x, y, ch, h] of lk.blobs) {
    if (!deckOpen(deckBand(y)) || h > en * 0.75) continue;
    const tw = !still && hh(x * 13 + y, Math.floor(now / 350)) < 0.01 + 0.05 * en;
    bput(x, y, ch, tw ? mixHex(tc, C.bright, 0.4) : mixHex(C.dim, tc, 0.15 + 0.3 * en), tw);
  }
  // snakes on their own, more often the livelier your deck is
  d.snakes = d.snakes || [];
  if (!under && !still && now > (d.ambNext || 0)) {
    d.ambNext = now + (1400 + Math.random() * 4000) * (1.5 - en);   // (Greg, 2026-11-16: a little less often)
    const W = deckWires(), ks = [...W.keys()];
    for (let tries = 0; tries < 12; tries++) { const k = ks[Math.floor(Math.random() * ks.length)], x = k % 64, y = Math.floor(k / 64);
      if (deckOpen(deckBand(y)) && inView(y)) { d.snakes.push({ path: deckWalk(x, y, 10 + Math.floor(Math.random() * 14)), t0: now, ms: 55, dim: true }); break; } }
  }
  // ...and out the under-traces of the socket you have selected, if its chip has power, now and then (mostly out,
  // sometimes back in) (Greg, 2026-11-16: only for the selected socket)
  if (DECK_UNDER_ON && !under && !still && now > (d.undNext || 0)) {
    d.undNext = now + (1200 + Math.random() * 3000) * (1.5 - en);   // (Greg, 2026-11-16: a little less often, 2 at a time at most)
    const live = d.snakes.filter(sn => sn.ch && !sn.under).length >= 2 ? [] : DECK_SOCKETS.filter(s => d.sel.kind === 'socket' && d.sel.id === s.id && deckOpen(s.mk) && d.slots[s.id] && pw.on.has(s.id) && (deckUnder()[s.id] || []).length && inView(s.y + 1));
    if (live.length) { const s = pickR(live, Math.random), sn = deckUnderSnake(s.id, Math.floor(Math.random() * deckUnder()[s.id].length), now, 50 + Math.random() * 30, Math.random() < 0.25); if (sn) d.snakes.push(sn); }
  }
  if (fx && !under) {   // the show
    const dm = deckDist(fx.sid);
    if (fx.kind === 'in') {   // a ripple: two rings out of the socket, lighting the lines and showing the hidden blobs as they pass
      const f1 = fxAge / DECK_WAVE_MS, f2 = f1 - 9;
      if (f2 > dm.max + 4) d.fx = null;
      else {
        for (const [k, dd] of dm.m) { const r1 = f1 - dd, r2 = f2 - dd; const on1 = r1 >= 0 && r1 < 3, on2 = r2 >= 0 && r2 < 2; if (!on1 && !on2) continue;
          const x = k % 64, y = Math.floor(k / 64); if (deckOpen(deckBand(y))) bput(x, y, ART[y][x], on1 && r1 < 1.2 ? mixHex(tc, C.bright, 0.55) : mixHex(idle, tc, 0.8), on1 && r1 < 1.2); }
        const s0 = deckSock(fx.sid) || DECK_PARTS.find(p => p.id === fx.sid);
        for (const [x, y, ch] of lk.blobs) { if (!deckOpen(deckBand(y))) continue;
          const dx = x - clamp(x, s0.x, s0.x + s0.w - 1), dy = y - clamp(y, s0.y, s0.y + s0.h - 1), dd = Math.sqrt(dx * dx + 4 * dy * dy);
          if (dd <= f1 && dd > f1 - 10) bput(x, y, ch, mixHex(tc, C.bright, (10 - (f1 - dd)) / 20), true); }
      }
    } else {   // the light drains into the socket, holds dark, then fills back
      const drain = dm.max * DECK_DRAIN_MS, hold = 300, fill = dm.max * DECK_DRAIN_MS * 1.6;
      const front = fxAge < drain ? dm.max - fxAge / DECK_DRAIN_MS : fxAge < drain + hold ? 0 : (fxAge - drain - hold) / (DECK_DRAIN_MS * 1.6);
      if (fxAge > drain + hold + fill) d.fx = null;
      else { for (let by = top; by < top + bv && by < BH; by++) g.put(ax, sy(by), ART[by], C.dim);   // the board goes dim...
        for (const [k, dd] of dm.m) { if (dd > front) continue; const x = k % 64, y = Math.floor(k / 64); if (deckOpen(deckBand(y))) bput(x, y, ART[y][x], idle); } }   // ...but where the light still is
    }
  }
  // the snakes: a lit head, a short tail, along the wires
  if (!under) for (let i = d.snakes.length - 1; i >= 0; i--) {
    const sn = d.snakes[i], hd = Math.floor((now - sn.t0) / sn.ms);
    if (hd < 0) continue;
    const tl = sn.tail || 5;
    if (sn.under && !sn.ended && hd >= sn.path.length - 1) { sn.ended = true; const e = sn.path[sn.path.length - 1]; if (DECK_TECH_END && deckOpen(deckBand(e[1]))) deckTechAt(e[0], e[1], sn.rc, now); }   // (a tech blob where it ends)
    if (hd - tl >= sn.path.length) { d.snakes.splice(i, 1); continue; }
    if (sn.ch) {   // an under-trace: box lines in the chip's rarity, fading down the tail
      for (let j = 0; j <= tl; j++) { const c = sn.path[hd - j]; if (!c || !deckOpen(deckBand(c[1]))) continue;
        if (sn.under && deckUnderAt(c[0], c[1])) continue;   // (under the chips)
        bput(c[0], c[1], sn.ch[hd - j], j ? mixHex(C.dim, sn.rc, 1 - j / (tl + 2)) : mixHex(sn.rc, C.bright, 0.55), j < 2); }
      continue;
    }
    for (let j = 0; j <= 5; j++) { const c = sn.path[hd - j]; if (!c || !deckOpen(deckBand(c[1]))) continue;
      bput(c[0], c[1], j ? ART[c[1]][c[0]] : (sn.dim ? 'o' : '*'), j ? mixHex(idle, tc, (sn.dim ? 0.55 : 1) - j * 0.12) : mixHex(tc, C.bright, sn.dim ? 0.2 : 0.6), !j); }
  }
  // the socket you have selected: a tech blob around it now and then, in its chip's rarity (the board's trace color
  // when it's empty) (Greg, 2026-11-16)
  if (!under && !still && d.sel.kind === 'socket' && now > (d.selTechNext || 0)) {
    d.selTechNext = now + 500 + Math.random() * 900;
    const s = deckSock(d.sel.id), key = s && d.slots[s.id];
    if (s && deckOpen(s.mk) && inView(s.y + 1)) d.techs = (d.techs || []).concat(deckTechs(s.id, 0, key && DECK_CHIPS[key] ? rarityCol(DECK_CHIPS[key][2]) : tc, now, 1));
  }
  // the tech blobs around a chip that just went in: scrambled, then they settle and glow, then dim out
  if (!under && d.techs) {
    d.techs = d.techs.filter(b => now - b.t0 < b.life);
    for (const b of d.techs) { const a = now - b.t0; if (a < 0 || !deckOpen(deckBand(b.y))) continue;
      const k = a / b.life, txt = a < 140 ? [...b.t].map(() => noiseCh()).join('') : k > 0.8 ? b.t.replace(/./g, '.') : b.t;
      bput(b.x, b.y, txt, a < 140 ? C.bright : mixHex(b.col, C.dim, clamp((k - 0.45) / 0.55, 0, 1)), k < 0.5); }
    if (!d.techs.length) d.techs = null;
  }
  // the mk upgrade (Greg, 2026-11-16: big fanfare): the new board boots, a sweep running down it row by row (dark below
  // it), bursts at its sockets as it passes them, then snakes and a ripple out of the CPU. d.up = { mk, t0, bursts }
  const up = d.up, upAge = up ? now - up.t0 : 0;
  if (up && !under && upAge >= 0) {
    const bt = DECK_BAND_TOP[up.mk], be = DECK_BAND_END[up.mk], sweepMs = 1300, sw = bt + (be - bt) * clamp(upAge / sweepMs, 0, 1);
    if (!up.started) {
      up.started = true; Sound.deckUp(); deckSay(`mk ${deckMk(up.mk)} ONLINE.${up.mk === 4 ? ' the FUSE is lit.' : ' new sockets.'}`, tc);   // (it fits the bar)
      deckScrollTo(Math.max(0, bt - 3)); if (!still) { flash(tc, 0.3, 0.5); shake(5, 0.45); }
    }
    if (upAge < sweepMs) for (let by = Math.max(top, Math.floor(sw) + 1); by < Math.min(be, top + bv); by++) g.put(ax, sy(by), ART[by], C.dim);   // not booted yet
    if (upAge < sweepMs) { const ry = Math.floor(sw); if (ry < be) { bput(0, ry, [...ART[ry]].map(c => c === ' ' ? ' ' : still ? c : Math.random() < 0.3 ? noiseCh() : c).join(''), mixHex(tc, C.bright, 0.6), true); } }
    up.bursts = up.bursts || new Set();
    for (const s of DECK_SOCKETS) { if (s.mk !== up.mk || up.bursts.has(s.id) || sw < s.y + 1) continue;
      up.bursts.add(s.id);
      if (!still && inView(s.y + 1)) { const x = pxX(ax + s.x + s.w / 2 - 0.5), y = pxY(sy(s.y + 1)), cells = [];
        for (let k = 0; k < 16; k++) cells.push({ ch: pickR(['o', '*', '+', '0', '1', '#', '=', '<', '>'], Math.random), x: x + rand(-1, 1) * L.cw, y, col: pickR([tc, C.bright, C.money, tc], Math.random) });
        explode(cells, x, y + L.chh / 2, { power: 0.6, grav: 0.6, life: [0.6, 1.3] }); Sound.lamp(); } }
    if (upAge >= sweepMs && !up.done) {
      up.done = true;
      d.snakes.push(...deckSnakes('cpu', 10, 26, now, 30));
      for (const s of DECK_SOCKETS) if (s.mk === up.mk) d.snakes.push(...deckSnakes(s.id, 2, 16, now, 60));
      d.fx = { kind: 'in', sid: 'cpu', t0: now, lvl: 4, burst: true };
      if (!still) { flash(tc, 0.2, 0.4); const x = pxX(L.wc / 2), y = pxY(y0 + Math.floor(bv / 2)), cells = [];
        for (let k = 0; k < 50; k++) cells.push({ ch: pickR(['*', '+', '~', 'x', '.', 'o', '0', '1'], Math.random), x: x + rand(-6, 6) * L.cw, y: y + rand(-2, 2) * L.chh, col: pickR([tc, C.bright, C.money, C.accent, tc], Math.random) });
        explode(cells, x, y, { power: 1, grav: 0.6, life: [1, 1.8] }); }
    }
    if (upAge > 3500) d.up = null;
  }
  // the CPU: your hacker name (2 lines when it doesn't fit), the mk, the pins blinking in turn
  { const n = deckName(), lines = n.length <= 10 ? [n] : n.split('_');
    bclr(4, 5, 12, 5); lines.forEach((l, i) => bput(6, 6 + i, l, C.money, true)); bput(6, 6 + lines.length, 'mk ' + deckMk(d.mk), C.money);
    const k = Math.floor(now / 170) % 12; let pi = 0;
    for (const by of [4, 10]) for (let x = 3; x <= 16; x++) if (ART[by][x] === 'o') { bput(x, by, 'o', pi % 12 === k ? C.bright : C.money, pi % 12 === k); pi++; }
    for (let by = 4; by <= 10; by++) for (const x of [3, 16]) if ('|+o'.includes(ART[by][x])) bput(x, by, ART[by][x], C.money);
    bput(3, 4, '+-', C.money); bput(15, 4, '-+', C.money); bput(3, 10, '+-', C.money); bput(15, 10, '-+', C.money); }
  // the ROM pins: one per BOARD post you've bought (and switch you've turned on), lit
  { const lit = d.real ? LEGACY.filter(u => legacyLv(u.key) > 0 && !u.placeholder).length : DECK_POSTS.length + d.sw.size + (d.nemesis ? 1 : 0); let n = 0;
    for (let x = 6; x <= 13; x++) if (ART[11][x] !== ' ') { bput(x, 11, ART[11][x], n < lit ? C.rep : C.dim, n < lit); n++; } }
  // the CRASH stick reads out its chip, scrolling when the name is longer than 5 (OFF in red with no power)
  { const key = d.slots.CRS, name = key ? DECK_CHIPS[key][0] : '', on = key && pw.on.has('CRS');
    for (let j = 0; j < 5; j++) {
      let ch = '.';
      if (name && !on) ch = ' OFF '[j];
      else if (name) { const w = deckStickText(DECK_CHIPS[key][0], now), o = Math.floor((5 - w.length) / 2); ch = w[j - o] || '.'; }   // (a word at a time, with a scramble: deckStickText)
      bput(23, 10 + j, ch === ' ' ? '.' : ch, name && !on ? C.danger : name && ch !== '.' && ch !== ' ' ? C.bright : C.dim, !!name);
    } }
  // the ]8[ readout: power left, a blinking ! when a chip has none
  bput(30, 16, pw.off.length ? (Math.floor(now / 400) % 2 ? '!' : ' ') : deckHex(pw.left), pw.off.length ? C.danger : pw.left > 0 ? C.money : C.mid, true);
  // THE BYTE's bits, and the ticker under it
  for (let i = 0; i < 8; i++) bput(26 + i, 23, String(d.bits[i]), d.bits[i] ? C.accent : C.mid, !!d.bits[i]);
  { let s = '........';
    if (d.tick) { const pad = '        ', full = pad + d.tick.text + pad, i = Math.floor((now - d.tick.t) / 140);
      if (i > (full.length - 8) * 2) d.tick = null; else s = full.substr(i % (full.length - 8), 8); }
    bclr(26, 25, 8, 1); bput(26, 25, d.tick ? s : s.replace(/ /g, '.'), d.tick ? C.accent : C.dim, !!d.tick); }
  // the FUSE
  { const fc = d.blown ? C.danger : d.fuse ? C.money : C.dim;
    bput(24, 30, d.blown ? (Math.floor(now / 200) % 2 ? '><' : '  ') : ')(', fc, true); bput(24, 29, '||', fc); bput(24, 31, '||', fc);
    if (pw.fuse) { bclr(26, 30, 1, 1); bput(26, 30, deckHex(pw.fuse.left), pw.fuse.left ? C.money : C.mid, true); } }   // (the fuse's power left)
  if (!deckOpen(3)) bput(21, 33, 'mk III', C.dim);
  if (!deckOpen(4)) bput(25, 42, d.blown ? 'FUSE BLOWN' : 'mk IV', d.blown ? C.danger : C.dim);
  // the parts, then the sockets (on top, so their taps win)
  for (const p of DECK_PARTS) bhit(p.x, p.y, p.w, p.h, 'dkp_' + p.id, () => deckTapPart(p.id));
  for (const s of DECK_SOCKETS) {
    deckSocket(s, s.x, s.y, bput, bbg, bclr, { sel: d.sel.kind === 'socket' && d.sel.id === s.id, pw, now });
    bhit(s.x, s.y, s.w, s.h, 'dks_' + s.id, () => deckTapSocket(s, bv));
  }
  // sparks: static around a chip that has no power (now and then), and a lot of it while one dies
  const ring = s => { const r = []; for (let x = s.x - 1; x <= s.x + s.w; x++) r.push([x, s.y - 1], [x, s.y + s.h]); for (let y = s.y; y < s.y + s.h; y++) r.push([s.x - 1, y], [s.x + s.w, y]); return r; };
  if (!under) {
    for (const id of pw.off) { const s = deckSock(id), r = ring(s), f = Math.floor(now / 110);
      if (hh(id.charCodeAt(2) + f, f) < 0.18) { const c = r[Math.floor(hh(f, id.charCodeAt(1)) * r.length)]; bput(c[0], c[1], pickR(["'", '*', '+', ','], Math.random), C.danger); } }
    if (fx && fx.kind === 'dead' && fxAge < 1400) { const s = deckSock(fx.sid), r = ring(s);
      for (let i = 0; i < 6; i++) { const c = r[Math.floor(Math.random() * r.length)]; bput(c[0], c[1], noiseCh(), Math.random() < 0.6 ? C.danger : C.bright, true); } }
  }
  // the burst, once, when the socket is on screen (confetti and tech blobs, more the rarer: none when effects are reduced)
  if (fx && !fx.burst && !under) {
    const s = deckSock(fx.sid);
    if (s && inView(s.y + 1)) {
      fx.burst = true;
      const x = pxX(ax + s.x + s.w / 2 - 0.5), y = pxY(sy(s.y + 1));
      if (fx.kind === 'in' && !reduced()) {
        const rc = rarityCol(DECK_CHIPS[d.slots[fx.sid]] ? DECK_CHIPS[d.slots[fx.sid]][2] : 'common'), n = [8, 14, 22, 34, 46][fx.lvl];
        const cells = []; for (let k = 0; k < n; k++) cells.push({ ch: pickR(['o', '*', '+', '0', '1', '#', '=', '.', '<', '>'], Math.random), x: x + rand(-1, 1) * L.cw, y, col: pickR([rc, tc, C.bright, rc, C.money], Math.random) });
        explode(cells, x, y + L.chh / 2, { power: 0.35 + 0.12 * fx.lvl, grav: 0.7, life: [0.5, 0.9 + 0.2 * fx.lvl] });
        if (fx.lvl >= 2) flash(rc, 0.06 + 0.03 * fx.lvl, 0.3);
        if (fx.lvl >= 3) shake(2 + fx.lvl, 0.3);
      } else if (fx.kind === 'dead') { flash(C.danger, 0.08, 0.3); shake(2, 0.25); }
    }
  }
  if (d.sel.kind === 'part') { const p = DECK_PARTS.find(q => q.id === d.sel.id); if (p) bbg(p.x, p.y, p.w, p.h, C.accent, 0.18); }
  // the "more" rows; a drag or the wheel moves a row at a time
  g.clr(0, y0, L.wc, 1); g.clr(0, y0 + sa - 1, L.wc, 1);
  deckMore(ctx, g, 0, L.wc, y0, true, top > 0, () => { d.scroll = clamp(d.scroll - DECK_BOARD_STEP, 0, maxTop); }, 'dkup');
  deckMore(ctx, g, 0, L.wc, y0 + sa - 1, false, top < maxTop, () => { d.scroll = clamp(d.scroll + DECK_BOARD_STEP, 0, maxTop); }, 'dkdn');
  if (under) return;
  d.keyStep = null;
  st.scroll = dd => { d.scrollTo = null; const t = clamp(d.scroll + dd, 0, maxTop); if (t !== d.scroll) { d.scroll = t; Sound.tick(); } };
  g.flush();
}
function deckTapSocket(s, rows) {
  const d = DECK;
  if (d.carry) {
    if (deckFits(d.carry, s) && deckOpen(s.mk)) deckSlot(d.carry, s.id);
    else { Sound.deny(); deckSay(DECK_KITS.includes(d.carry) && s.g === 'boot' ? `${DECK_CHIPS[d.carry][0]} is a KIT: KITs go in ${DECK_KIT_SOCKET}.` : `${DECK_CHIPS[d.carry][0]} doesn't go in ${s.id}.`, C.danger); }
    return;
  }
  // the first tap: its card; the second: the picker (Greg, 2026-11-15)
  if (d.sel.kind === 'socket' && d.sel.id === s.id) return deckPick(s.id);
  deckSelect({ kind: 'socket', id: s.id }); Sound.tick();
}
function deckTapPart(id) {
  const d = DECK; d.carry = null;
  if (id === 'rom') id = 'cpu';   // the ROM is the CPU's: its posts and switches are in the CPU's popup
  if (id === 'cpu' && d.sel.kind === 'part' && d.sel.id === 'cpu') return deckCpuOpen();
  deckSelect(id === 'stick' ? { kind: 'socket', id: 'CRS' } : { kind: 'part', id }); Sound.tick();
}
function deckCpuOpen() { DECK.pick = null; DECK.cpu = { t0: performance.now() }; deckSelect({ kind: 'part', id: 'cpu' }); Sound.ui(); }

// the CHIPS tab: every chip you own, grouped (a chip is 2 rows, a dashed row between)
function deckChipList(ctx, y0, sa) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), W = L.wc, items = [];
  for (const gk of Object.keys(DECK_GROUPS)) {
    const ks = deckOwned().filter(k => DECK_CHIPS[k][1] === gk); if (!ks.length) continue;
    if (items.length) items.push({ h: 1, draw: () => {} });
    items.push({ h: 1, draw: (g, ctx, y) => { const n = DECK_GROUPS[gk][0]; g.put(1, y, `-- ${n} `, deckGroupCol(gk)); g.put(5 + n.length, y, rule(W - 7 - n.length), C.dim); } });
    ks.forEach((key, i) => {
      if (i) items.push(deckSep(0, W));
      items.push({ h: 2, stop: true, draw: (g, ctx, y) => {
        const c = DECK_CHIPS[key], where = deckSlotOf(key), off = !!(where && !pw.on.has(where) && c[1] !== 'psu'), id = 'dkc_' + key;
        if (d.sel.kind === 'chip' && d.sel.key === key) g.bg(0, y, W, 2, C.accent, 0.18);
        ctx.hl(0, y, W, 2, id, false);
        deckFace(g, 2, y, key, off);
        g.put(9, y, c[0], C.bright, true);   // (no counts: a chip home is unlocked, Greg 2026-11-21)
        if (deckBeta(key) && !where) g.put(W - 5, y, 'BETA', C.danger);   // (DECK_BETA: not all there yet)
        // slotted: inverted, so it stands out in the list (Greg, 2026-11-21: white with black text; red with no power)
        if (where) { const t = ' in ' + where + ' ', tx = W - 1 - t.length; g.bg(tx, y, t.length, 1, off ? C.danger : C.bright, 1); g.put(tx, y, t, C.bg, true); }
        g.put(9, y + 1, c[1] === 'psu' ? `+${deckCellPower(key)} PWR` : `PWR ${c[3]}`, C.mid);
        g.put(16, y + 1, c[6].slice(0, W - 17), C.text);
        if (off) { g.clr(W - 10, y + 1, 10); g.put(W - 9, y + 1, 'NO POWER', C.danger, true); }
        ctx.addHit(0, y, W, 2, { kind: 'btn', id, onTap: () => { deckSelect({ kind: 'chip', key }); Sound.tick(); } });
      } });
    });
  }
  const sc = deckRows(ctx, g, 0, W, y0, sa, items, d.list, 'dkl');
  st.scroll = sc.line; d.keyStep = sc.step;
  g.flush();
}

// The picker: a popup over the scroll area, a set height, like a store: the list (it scrolls), then the one you
// picked: its name, its power, its long text, and SLOT. A tap picks; SLOT puts it in and closes (Greg, 2026-11-15).
const DECK_PICK_INFO = 8;
const DECK_DOUBLE_MS = 450;   // two taps on a picker row this close: slot it   // the divider and 7 rows: name, power, 4 rows of text, the buttons
function deckPicker(ctx, y0, sa) {
  const d = DECK, p = d.pick, s = deckSock(p.id), g = deckGrid(ctx), pw = deckPower(), now = ctx.now;
  const W = Math.min(L.wc, DECK_ART_W), X0 = Math.floor((L.wc - W) / 2), gc = deckGroupCol(s.g), cur = d.slots[s.id];
  const IX = X0 + 1, IW = W - 2, H = sa, LR = Math.max(5, H - 3 - DECK_PICK_INFO);
  const done = () => { d.pick = null; };
  // the choices: NONE (or the glyphs), then what fits
  const keys = s.g === 'glyph' ? DECK_GLYPHS.map((x, i) => i) : ['NONE'].concat(deckOwned().filter(k => deckFits(k, s)));
  if (p.sel == null) p.sel = s.g === 'glyph' ? d.glyph : cur || keys[1] || 'NONE';
  const items = [], idx = {};
  keys.forEach((k, i) => {
    if (i) items.push(deckSep(IX, IW));
    idx[k] = items.length;
    items.push({ h: s.g === 'glyph' ? 3 : 2, stop: true, draw: (g, ctx, y) => deckPickRow(g, ctx, y, k, { IX, IW, s, cur, pw }) });
  });
  deckBox(ctx, g, y0, sa, X0, W, H, gc, `${s.id} · ${DECK_GROUPS[s.g][0]}${s.id === DECK_KIT_SOCKET ? ' · KIT' : ''}`, done);
  // a status line (the group's text for now; the header already shows your power). It gets the whole row: whatever
  // goes here later has to fit W - 4 (Greg, 2026-11-15)
  g.put(X0 + 2, y0 + 1, (s.g !== 'boot' ? DECK_GROUPS[s.g][2] : s.id === DECK_KIT_SOCKET ? 'KIT: one KIT, or any BOOT chip' : 'what a run starts with. KIT: BT1').slice(0, W - 4), C.dim);
  const sc = deckRows(ctx, g, IX, IW, y0 + 2, LR, items, p.s, 'dkpk');
  if (!p.shown) { sc.show(idx[p.sel]); p.shown = true; }
  st.scroll = sc.line; d.keyStep = null;
  const go = () => deckPickGo(p.sel, s, cur);
  p.keys = { go, move: dd => { const i = keys.indexOf(p.sel), j = clamp(i + dd, 0, keys.length - 1); if (j !== i) { p.sel = keys[j]; sc.show(idx[p.sel]); Sound.tick(); } } };
  // the one you picked
  const iy = y0 + 2 + LR;
  g.put(X0, iy, '|' + '-'.repeat(W - 2) + '|', gc);
  deckPickInfo(ctx, g, IX, IW, iy + 1, p, s, cur, pw, go);
  g.flush();
}
// A popup over the scroll area: the board, dim, around it; a box W wide and H tall at X0, y0 with the title on its
// top border and [X] at the right. Returns nothing; the caller fills rows y0 + 1 to y0 + H - 2.
function deckBox(ctx, g, y0, sa, X0, W, H, col, title, close) {
  deckBoard(ctx, y0, sa, g); g.dim = false;
  g.clr(X0, y0, W, H);
  g.put(X0, y0, '+' + '-'.repeat(W - 2) + '+', col);
  const t = ` ${title} `.slice(0, W - 8); g.clr(X0 + 2, y0, t.length); g.put(X0 + 2, y0, t, col, true);
  for (let j = 1; j < H - 1; j++) { g.put(X0, y0 + j, '|', col); g.put(X0 + W - 1, y0 + j, '|', col); }
  g.put(X0, y0 + H - 1, '+' + '-'.repeat(W - 2) + '+', col);
  deckBtn(ctx, g, X0 + W - 4, y0, '[X]', C.mid, 'dkbx', () => { close(); Sound.tick(); });
}
// a row in the picker's list
function deckPickRow(g, ctx, y, k, { IX, IW, s, cur, pw }) {
  const d = DECK, p = d.pick, h = s.g === 'glyph' ? 3 : 2, id = 'dkk_' + k;
  if (p.sel === k) g.bg(IX, y, IW, h, C.accent, 0.18);
  ctx.hl(IX, y, IW, h, id, false);
  // a tap picks it; a second tap on it soon after (a double tap / click) puts it in, like SLOT (Greg, 2026-11-15)
  ctx.addHit(IX, y, IW, h, { kind: 'btn', id, onTap: () => {
    const t = performance.now(), dbl = p.tap && p.tap.k === k && t - p.tap.t < DECK_DOUBLE_MS;
    p.tap = dbl ? null : { k, t };
    if (dbl) return deckPickGo(k, s, cur);
    if (p.sel !== k) { p.sel = k; Sound.tick(); }
  } });
  if (s.g === 'glyph') {
    const [name, art] = DECK_GLYPHS[k];
    art.forEach((l, j) => g.put(IX + 1, y + j, l, C.bright, true));
    g.put(IX + 8, y, name, C.bright, true); if (k === d.glyph) g.put(IX + IW - 7, y, 'in GLY', C.accent);
    g.put(IX + 8, y + 1, 'seen on ' + (3 + k * 2) + ' layers', C.mid);
    return;
  }
  if (k === 'NONE') {
    g.put(IX + 1, y, '- -', C.mid); g.put(IX + 1, y + 1, ' - ', C.mid);
    g.put(IX + 6, y, 'NONE', cur ? C.bright : C.mid, true); if (!cur) g.put(IX + IW - 6, y, 'empty', C.accent);
    g.put(IX + 6, y + 1, cur ? `pull ${DECK_CHIPS[cur][0]} out` : `leave ${s.id} empty`, C.mid);
    return;
  }
  const c = DECK_CHIPS[k], where = deckSlotOf(k), nx = IX + (c[1] === 'boss' ? 8 : 6), sh = deckPickShort(k, s, cur, pw);
  deckFace(g, IX + 1, y, k, false);
  g.put(nx, y, c[0], C.bright, true);
  if (where) g.put(IX + 19, y, 'in ' + where, where === s.id ? C.accent : C.mid);
  const pt = c[1] === 'psu' ? `+${deckCellPower(k)}` : `PWR ${c[3]}`; g.put(IX + IW - pt.length, y, pt, sh ? C.danger : C.money, sh > 0);
  g.put(nx, y + 1, c[6].slice(0, IX + IW - nx), C.text);
}
// how much power a chip would be short in this socket: what's left, plus what this socket's chip frees, plus its own
// if it's on somewhere else (0: it'd get power)
function deckPickShort(k, s, cur, pw) {
  const c = DECK_CHIPS[k], where = deckSlotOf(k);
  if (c[1] === 'psu' || where === s.id) return 0;
  const room = deckLeft(pw, s) + (cur && pw.on.has(s.id) ? DECK_CHIPS[cur][3] : 0) + (where && pw.on.has(where) ? c[3] : 0);
  return Math.max(0, c[3] - room);
}
function deckPickGo(k, s, cur) {
  const d = DECK; d.pick = null;
  if (s.g === 'glyph') { if (k !== d.glyph) { d.glyph = k; Sound.buy(); deckSay(`${DECK_GLYPHS[k][0]} is your glyph.`); } return; }
  if (k === 'NONE') { if (cur) deckPull(s.id); else Sound.tick(); return; }
  if (deckSlotOf(k) !== s.id) deckSlot(k, s.id); else Sound.tick();
}
// the picked one: its name on its rarity chip, rarity and power, its long text (4 rows at most), the button
function deckPickInfo(ctx, g, IX, IW, y, p, s, cur, pw, go) {
  const d = DECK, k = p.sel, x = IX + 1, w = IW - 2, by = y + 6;
  const btn = (label, col, off) => deckBtn(ctx, g, x, by, label, col, 'dkgo', go, off);
  const text = t => wrapText(t, w).slice(0, 4).forEach((l, j) => g.put(x, y + 2 + j, l, C.text));
  if (s.g === 'glyph') {
    g.put(x, y, DECK_GLYPHS[k][0], C.bright, true); g.put(x, y + 1, 'GLYPH', C.mid);
    text('tap it when you see it on a layer and it acts like a loot node, ICE or real.');
    btn(k === d.glyph ? '[ IN GLY ]' : '[ PICK IT ]', C.accent, k === d.glyph);
    return;
  }
  if (k === 'NONE') {
    g.put(x, y, 'NONE', C.bright, true); g.put(x, y + 1, 'an empty socket', C.mid);
    text(cur ? `pull ${DECK_CHIPS[cur][0]} out of ${s.id}. it goes back in your chips.` : `leave ${s.id} empty.`);
    btn(cur ? `[ EMPTY ${s.id} ]` : '[ EMPTY ]', C.bright, !cur);
    return;
  }
  const c = DECK_CHIPS[k], ch = chipOf(c[2]), where = deckSlotOf(k), sh = deckPickShort(k, s, cur, pw);
  g.bg(x, y, c[0].length + 2, 1, ch.bg, 1); g.put(x + 1, y, c[0], ch.fg, true);
  const meta = `${c[2]} · ` + (c[1] === 'psu' ? `power ${deckCellPower(k)}` : `PWR ${c[3]}`) + (deckBeta(k) ? ' · BETA' : ''); g.put(x, y + 1, meta, C.mid);
  if (sh) g.put(x + meta.length + 1, y + 1, `· needs ${sh} more`, C.danger);
  text(c[4]);
  if (where === s.id) btn(`[ IN ${s.id} ]`, C.accent, true);
  else { const nx = btn(`[ ${where ? 'MOVE' : 'SLOT'} TO ${s.id} ]`, C.accent); if (where) g.put(nx, by, `from ${where}`, C.mid); }
}

// The CPU's popup (Greg, 2026-11-15): your deck at a glance (chips in, power), the mk ladder with the upgrade, the
// ROM (the BOARD posts you've bought, lit, and the switches), and a line of lore. A set height, like the picker.
function deckCpu(ctx, y0, sa) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), W = Math.min(L.wc, DECK_ART_W), X0 = Math.floor((L.wc - W) / 2);
  const x = X0 + 2, w = W - 4, close = () => { d.cpu = null; };
  deckBox(ctx, g, y0, sa, X0, W, sa, C.money, `CPU · ${deckName()}`, close);
  const gput = g.put; g.put = (px, py, t, col, bold) => gput(px, py, t.slice(0, Math.max(0, x + w - px)), col, bold);   // (clipped to the box)
  let y = y0 + 1;
  const sep = () => { g.put(X0 + 1, y++, rule(W - 2), C.dim); };
  const head = t => { g.put(x, y++, t, C.mid); };
  g.put(x, y++, `mk ${deckMk(d.mk)} · ${['', '', 'USER', 'ELITE', 'SYSOP'][d.mk]} access`, C.money);
  y++;
  // the deck at a glance
  const open = DECK_SOCKETS.filter(q => deckOpen(q.mk) && q.g !== 'glyph'), inn = open.filter(q => d.slots[q.id]).length;
  g.put(x, y, 'chips in', C.mid); g.put(x + 9, y, `${inn}/${open.length}`, C.bright, true);
  g.put(x + 15, y, 'pwr', C.mid); g.put(x + 19, y, `${pw.used}/${pw.budget}`, pw.off.length ? C.danger : C.money, true);
  if (pw.fuse) g.put(x + 25, y, `F${pw.fuse.used}/${pw.fuse.budget}`, C.money, true);
  else if (pw.off.length) g.put(x + 25, y, `!${pw.off.length}`, C.danger, true);
  y++;
  sep();
  // the mk ladder
  head('THE BOARDS');
  const rungs = [[2, 'USER', 'the top board'], [3, 'ELITE', 'GLYPH, OVERVOLT, crew'], [4, 'SYSOP', 'SUDO, BOSS, HEAT']];
  for (const [m, lv, what] of rungs) {
    const have = m <= d.mk, lit = deckOpen(m);
    g.put(x, y, (have ? '* ' : '. ') + 'mk ' + deckMk(m), have ? (lit ? C.money : C.danger) : C.dim, have);
    g.put(x + 10, y, what.slice(0, w - 10), have ? C.text : C.mid);
    y++;
    let bx = x + 10;
    // not at that access level on THE BOARD yet: it says so, loud, in place of the button (Greg, 2026-11-21)
    if (m === 3 && !have) { if (d.real && !deckPostOpen('deck3')) g.put(bx, y, 'reach ELITE first', C.danger, true); else deckBtn(ctx, g, bx, y, deckRepText('INSTALL', 'deck3'), deckRepCol('deck3'), 'dkmk3', deckUpgrade3, d.mk !== 2); }
    else if (m === 4 && !have) { if (d.mk < 3) g.put(bx, y, 'mk III, then the FUSE', C.dim); else if (d.real && !deckPostOpen('fuse')) g.put(bx, y, 'reach SYSOP first', C.danger, true); else deckBtn(ctx, g, bx, y, deckRepText('THE FUSE', 'fuse'), deckRepCol('fuse'), 'dkmk4', deckFuseIn); }
    else if (m === 4 && d.blown) g.put(bx, y, 'the FUSE is blown', C.danger);
    else g.put(bx, y, lv + ' access', C.dim);
    y++;
  }
  sep();
  // the ROM's switches: BOARD posts you can turn off for your next run (Greg, 2026-11-15: no list of the posts, you
  // can see them lit; the room goes to the switches, each with its text). NEMESIS cycles through the corps, or none.
  head('SETTINGS · for your next run');
  const sws = deckSwitches();
  if (!sws.length) { g.put(x, y++, 'none yet: STARTER POOL, STRAY and', C.dim); g.put(x, y++, 'NEMESIS (THE BOARD) can go here.', C.dim); }
  sws.forEach((k, i) => {
    const pk = DECK_PICKERS.includes(k), on = pk ? !!d[k] : d.sw.has(k), p = deckPost(k);
    g.put(x, y, p.name, on ? C.bright : C.mid, on);
    if (pk) {   // [<] CORP [>] / [<] MOD [>] (Greg, 2026-11-16: lots of corps; like THE BOARD's NEMESIS picker). The name steps forward too.
      const pool = k === 'nemesis' ? deckNemPool : deckArcPool, nameOf = v => k === 'nemesis' ? CORPS[v].name : MODS[v].name;
      const step = dd => { const cs = pool(); d[k] = cs[((cs.indexOf(d[k]) + dd) % cs.length + cs.length) % cs.length]; Sound.tick(); };
      const nw = Math.min(13, w - 9 - p.name.length), n = (d[k] ? nameOf(d[k]) : 'none').slice(0, nw), l = Math.floor((nw - n.length) / 2);
      const bx = x + w - (nw + 8);
      deckBtn(ctx, g, bx, y, '[<]', C.accent, 'dksw' + k + 'L', () => step(-1));
      deckBtn(ctx, g, bx + 4, y, (' '.repeat(l) + n).padEnd(nw), on ? C.accent : C.mid, 'dksw' + k, () => step(1));
      deckBtn(ctx, g, bx + nw + 5, y, '[>]', C.accent, 'dksw' + k + 'R', () => step(1));
    } else deckBtn(ctx, g, x + w - (on ? 4 : 5), y, on ? '[on]' : '[off]', on ? C.accent : C.mid, 'dksw' + k, () => {
      if (d.sw.has(k)) d.sw.delete(k); else d.sw.add(k);
      Sound.tick(); });
    g.put(x, y + 1, FX.ticker(p.desc, w, d.cpu.t0 + i * 900, ctx.now, 6), on ? C.text : C.dim);
    y += 2;
  });
  // a line of lore, at the bottom
  const ly = y0 + sa - 2;
  if (ly > y) g.put(x, ly, 'MEDIX NC-1 · rev 2', C.dim);
  g.put = gput;
  g.flush();
}

// the card: the bar (the rule, a message, or NO POWER), then 4 rows about what you picked
function deckCard(ctx, y0) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), now = ctx.now, W = L.wc;
  // the bar
  if (d.msg && now - d.msg.t < 2600) { g.put(0, y0, rule(W), C.dim); const s = ` ${d.msg.text} `.slice(0, W); g.clr(1, y0, s.length); g.put(1, y0, s, d.msg.col); }
  else if (d.carry) { g.put(0, y0, rule(W), C.dim); const s = ` slotting ${DECK_CHIPS[d.carry][0]}: tap a blinking socket `.slice(0, W); g.clr(1, y0, s.length); g.put(1, y0, s, C.accent); }
  else if (pw.off.length) {   // NO POWER: red, cycling through the chips that have none; a tap goes to the one showing
    const names = pw.off.map(id => `NO POWER: ${DECK_CHIPS[d.slots[id]][0]} in ${id}`), sw = FX.swapLines(names, W - 2, 0, now, 1800);
    g.bg(0, y0, W, 1, st.hoverBtn === 'dkbar' ? C.accent : C.danger, 1); g.put(1, y0, sw.text, C.bg, true);
    if (!d.pick && !d.cpu) ctx.addHit(0, y0, W, 1, { kind: 'btn', id: 'dkbar', onTap: () => {   // (each tap: the next one, Greg 2026-11-16)
      d.offI = d.offI == null || d.offI >= pw.off.length - 1 ? 0 : d.offI + 1;
      const id = pw.off[d.offI], s = deckSock(id); d.view = 'board'; deckSelect({ kind: 'socket', id }); deckShow(s.y, s.h, deckViewRows()); Sound.tick(); } });
  } else g.put(0, y0, rule(W), C.dim);
  // the picker is up: the card waits under it (dim), and a tap on it closes the picker
  if (d.pick || d.cpu) { g.dim = true; ctx.addHit(0, y0 + 1, W, 4, { kind: 'btn', id: 'dkcard', onTap: () => { d.pick = null; d.cpu = null; Sound.tick(); } }); }
  const y = y0 + 1, tw = (x) => W - x - 1, tick = (x, text, col = C.text) => g.put(x, y + 2, FX.ticker(text, tw(x), d.selT, now, 6), col);
  const btns = (list, bx = 1) => { for (const [label, col, id, fn, off] of list) bx = deckBtn(ctx, g, bx, y + 3, label, col, id, fn, off); };
  const frame = (s, key) => deckSocket(s, 1, y, g.put, g.bg, g.clr, { key, pw, now });
  const sel = d.sel;
  const chipRows = (key, sid) => {   // the group and power (dim); the name on its rarity chip; the short text (a ticker)
    const c = DECK_CHIPS[key], x = c[1] === 'boss' ? 10 : 8, off = !!(sid && !pw.on.has(sid) && c[1] !== 'psu'), ch = off ? DECK_OFF : chipOf(c[2]);
    const meta = `${DECK_GROUPS[c[1]][0]} · ${deckBeta(key) ? 'BETA · ' : ''}`; g.put(x, y, meta, C.mid);
    g.put(x + meta.length, y, c[1] === 'psu' ? `power ${deckCellPower(key)}` : `PWR ${c[3]}`, off ? C.danger : C.mid);
    if (off && Math.floor(now / 500) % 2) g.put(W - 9, y, 'NO POWER', C.danger, true);
    g.bg(x, y + 1, c[0].length + 2, 1, ch.bg, 1); g.put(x + 1, y + 1, c[0], ch.fg, true);
    tick(x + 1, key === 'SP3' ? 'bosses: ' + DECK_SPOILS[d.spoils][2] : key === 'AR1' ? 'every run starts with: ' + (d.archive ? MODS[d.archive].name : 'nothing yet. pick a mod.') : sid && deckShellPending(deckSock(sid)) ? 'no shell yet: get ROOT on your crew (THE BOARD > QUESTS).' : c[6]);
    return x;
  };
  if (sel.kind === 'chip') {
    const where = deckSlotOf(sel.key), c = DECK_CHIPS[sel.key];
    frame(where ? deckSock(where) : { id: '---', g: c[1], mk: 2, w: c[1] === 'boss' ? 7 : 5, h: 4 }, sel.key);
    chipRows(sel.key, where);
    // VIEW: the board, scrolled to its socket (Greg, 2026-11-21)
    const view = () => { const s = deckSock(where); d.view = 'board'; d.pick = null; d.carry = null; deckSelect({ kind: 'socket', id: where }); deckShow(s.y, s.h, deckViewRows()); Sound.tick(); };
    btns([['[ SLOT ]', C.accent, 'dkslot', () => deckCarry(sel.key)], ...(where ? [['[ PULL ]', C.bright, 'dkpull', () => deckPull(where)], ['[ VIEW ]', C.bright, 'dkview', view]] : [])], c[1] === 'boss' ? 10 : 8);
  } else if (sel.kind === 'socket') {
    const s = deckSock(sel.id), key = d.slots[s.id], open = deckOpen(s.mk), [gn, , gt] = DECK_GROUPS[s.g], gc = deckGroupCol(s.g);
    if (s.g === 'glyph') {
      if (open) DECK_GLYPHS[d.glyph][1].forEach((l, j) => g.put(1, y + j, l, C.bright, true)); else g.put(1, y + 1, ':mk3:', C.mid);
      g.put(8, y, 'GLYPH · your favourite', C.mid); g.put(9, y + 1, open ? DECK_GLYPHS[d.glyph][0] : 'GLY · LOCKED', open ? C.bright : C.mid, true);
      tick(9, open ? 'tap it when you see it on a layer and it acts like a loot node, ICE or real.' : 'opens with mk III: the CPU upgrade, an ELITE post on THE BOARD.');
      btns(open ? [['[ CHANGE ]', C.accent, 'dkchg', () => deckPick('GLY')]] : d.mk < 3 ? [[deckRepText('mk III', 'deck3'), deckRepCol('deck3'), 'dkmk3', deckUpgrade3]] : [], 8);
    } else if (!open) {
      frame(s);
      g.put(8, y, gn, C.mid); g.put(9, y + 1, `${s.id} · LOCKED`, C.mid, true);
      tick(9, s.mk === 3 ? 'opens with mk III: the CPU upgrade, an ELITE post on THE BOARD.' : d.blown ? 'the FUSE is blown. replace it to light mk IV again.' : 'opens with mk IV: the FUSE, a SYSOP post on THE BOARD.');
      if (s.mk === 3 && d.mk < 3 && d.real && !deckPostOpen('deck3')) g.put(1, y + 3, 'reach ELITE on THE BOARD first.', C.danger, true);
      else btns(s.mk === 3 && d.mk < 3 ? [[deckRepText('mk III', 'deck3'), deckRepCol('deck3'), 'dkmk3', deckUpgrade3]] : s.mk === 4 ? [[d.blown ? '[ REPLACE FUSE ]' : '[ SEE THE FUSE ]', C.rep, 'dkfuse', () => deckTapPart('fuse')]] : [], s.w + 3);
    } else if (key) {
      frame(s); chipRows(key, s.id);
      btns([['[ CHANGE ]', C.accent, 'dkchg', () => deckPick(s.id)], ...(key === 'SP3' ? [[`[ ${DECK_SPOILS[d.spoils][0]} > ]`, C.money, 'dkspl', () => { d.spoils = (d.spoils + 1) % 3; Sound.tick(); }]] : []),
        ...(key === 'AR1' ? [[`[ ${(d.archive ? MODS[d.archive].name : 'PICK').slice(0, 11)} > ]`, C.accent, 'dkarc', deckArcStep]] : [])], s.w + 3);
    } else {
      frame(s);
      const n = deckOwned().filter(k => deckFits(k, s)).length;
      const pend = deckShellPending(s);   // (ROOT's: its fine print, a line at a time)
      g.put(8, y, `${gn} · ${n} fit`, C.mid); g.put(9, y + 1, `${s.id} · ${pend ? 'LEASED' : 'EMPTY'}`, pend ? C.rep : C.bright, true);
      tick(9, pend ? QUEST_LINES.rootFine.join('   ') + '   (ROOT: PAPERWORK, THE BOARD > QUESTS)' : s.g !== 'boot' ? gt + '.'
        : s.id === DECK_KIT_SOCKET ? 'the KIT socket: one KIT (a bundle of mods and gear), or any other BOOT chip.' : gt + '. any BOOT chip but a KIT (those go in ' + DECK_KIT_SOCKET + ').');   // (KITs: DECK_KITS)
      btns([['[ CHOOSE ]', C.accent, 'dkchg', () => deckPick(s.id)]], s.w + 3);
    }
  } else if (sel.kind === 'part') deckPartCard(ctx, g, y, sel.id, pw, tick, btns);
  g.flush();
}
function deckPartCard(ctx, g, y, id, pw, tick, btns) {
  const d = DECK, head = (t, sub, subc) => { g.put(1, y, t, C.bright, true); g.put(1, y + 1, sub, subc); };
  if (id === 'cpu') {
    const n = deckName(), open = DECK_SOCKETS.filter(s => deckOpen(s.mk)).length;
    head(`CPU · ${n}`, `mk ${deckMk(d.mk)} · ${['', '', 'USER', 'ELITE', 'SYSOP'][d.mk]}`, C.money);
    tick(1, `your name, printed on your deck. ${open} sockets open, ${Object.keys(d.slots).length} chips in, power ${pw.used} of ${pw.budget}.`);
    btns([['[ OPEN ]', C.accent, 'dkcpu', deckCpuOpen]]);   // (the name comes from your profile: no button here)
  } else if (id === 'byte') {
    g.put(1, y, 'THE BYTE · secret codes', C.bright, true);
    for (let i = 0; i < 8; i++) { const x = 1 + i * 3, on = d.bits[i]; g.put(x, y + 1, `[${on}]`, on ? C.accent : C.text, !!on); ctx.hl(x, y + 1, 3, 1, 'dkbit' + i, false); ctx.addHit(x, y + 1, 3, 1, { kind: 'btn', id: 'dkbit' + i, onTap: () => { d.bits[i] ^= 1; Sound.tick(); } }); }
    g.put(26, y + 1, '0x' + parseInt(d.bits.join(''), 2).toString(16).toUpperCase().padStart(2, '0'), C.mid);
    // (the 0s in text white, not mid: Greg, so they read as switches)
    tick(1, '8 switches. most codes do nothing. the hints are around the game: logos, posts, G0D, the codex.', C.mid);
    btns([['[ ENTER ]', C.accent, 'dkenter', deckEnterByte], ['[ CLEAR ]', C.mid, 'dkclear', () => { d.bits.fill(0); Sound.tick(); }]]);
  } else if (id === 'fuse') {
    head('THE FUSE · mk IV power', d.blown ? 'BLOWN' : d.fuse ? `installed · ${pw.fuse.used} of ${pw.fuse.budget} used` : `not installed · power ${DECK_FUSE_PWR}`, d.blown ? C.danger : d.fuse ? C.money : C.mid);
    tick(1, d.blown ? 'a rival breached your deck and blew it. mk IV is dark until you replace it.' : d.fuse ? 'mk IV is lit. a boss that breaches your deck goes for it (the TEST shows it).' : 'its own power for the bottom board: SUDO and BOSS chips run on it, not the cell. a SYSOP post, after mk III.');
    if (!d.fuse) btns([[`[ INSTALL · ${deckCost('fuse')} REP ]`, C.rep, 'dkinst', deckFuseIn]]);
    else if (!d.blown && !d.real) btns([['[ TEST: BREACH ]', C.danger, 'dkbreach', () => { d.blown = true; Sound.deny(); deckSay('BREACH: a rival blew your fuse.', C.danger); d.tick = { text: 'FUSE BLOWN. mk IV dark.', t: performance.now() }; }]]);
    else if (d.blown) btns([['[ REPLACE · 100 REP ]', C.rep, 'dkrepl', () => deckBuy(null, 100, () => { d.blown = false; Sound.buy(); deckSay('new fuse. mk IV lit again.'); })]]);
  } else if (id === 'readout') {
    head('READOUT', `cell: ${pw.left} left · ${pw.used} of ${pw.budget} used`, C.money);
    tick(1, 'the cell in PSU powers mk II and III; the FUSE powers mk IV. each chip costs 0-3, shown on its socket. the oldest chips get power first.');
  } else if (id === 'ports') {
    head('PORTS · dark', 'things outside the page', C.text);
    tick(1, 'MIC: the whistle, the mold. GAMEPAD: a controller. MIDI: play SIMON on keys. MODEM: multiplayer. each waits until its feature is built.', C.mid);
  } else if (id === 'crew') {
    const open = deckOpen(3);
    head('CREW JACKS' + (open ? '' : ' · LOCKED'), open ? 'plug in up to 2 of your crew' : 'opens with mk III', open ? C.text : C.mid);
    tick(1, open ? DECK_CREW.filter(([c]) => d.crew.has(c)).map(([c, t]) => `${c}: ${t}.`).join(' ') || 'nobody plugged in.' : 'the mk III board has the jacks.');
    if (open) btns(DECK_CREW.map(([c]) => [`[${c}]`, d.crew.has(c) ? C.accent : C.dim, 'dkcrew' + c, () => {
      if (d.crew.has(c)) d.crew.delete(c); else if (d.crew.size < 2) d.crew.add(c); else { Sound.deny(); return deckSay('2 jacks: unplug one first.', C.danger); }
      Sound.tick(); }]));
  } else if (id === 'uplink') {
    head('UPLINK' + (deckOpen(4) ? '' : ' · LOCKED'), deckOpen(4) ? 'empty' : 'opens with mk IV', deckOpen(4) ? C.text : C.mid);
    tick(1, 'G0D.exe plugs in here: it plays for you, with its click limit. a second jack doubles the clicks.');
  } else if (id === 'hdr3' || id === 'hdr4') {
    const m = id === 'hdr3' ? 3 : 4;
    head(`EXPANSION · mk ${deckMk(m)}`, deckOpen(m) ? 'plugged in' : 'empty', deckOpen(m) ? C.money : C.mid);
    tick(1, m === 3 ? 'the mk III board plugs in here. the CPU upgrade: 600 REP (ELITE).' : 'the mk IV board plugs in here. it needs the FUSE for power.');
    if (m === 3 && d.mk < 3) btns([['[ mk III · ' + deckCost('deck3') + ' REP ]', C.rep, 'dkmk3', deckUpgrade3]]);
  }
}
// The upgrades are THE BOARD's posts (engine/save.js LEGACY: DECK mk III, THE FUSE): the real deck buys them there
// (buyPost), at those prices; the dev deck pays its own REP. key null: not a post (replacing a blown fuse: REP only).
const deckCost = key => { const u = typeof LEGACY !== 'undefined' && LEGACY.find(p => p.key === key); return u ? u.costs[0] : '?'; };
// A button that costs REP shows what you have against it, dimmed while you're short (Greg, 2026-11-21: REP left the
// deck's top line). It still takes a tap: deckBuy says what's missing.
// a deck post you can buy at your access level on THE BOARD (engine/save.js postOpen)
const deckPostOpen = key => postOpen(LEGACY.find(p => p.key === key));
const deckRepText = (what, key) => `[ ${what} · ${DECK.rep}/${deckCost(key)} REP ]`;
const deckRepCol = key => DECK.rep >= deckCost(key) ? C.rep : C.mid;
function deckBuy(key, cost, done) {
  const d = DECK;
  if (d.real && key) {
    const why = buyPost(LEGACY.find(p => p.key === key));
    if (why) { Sound.deny(); return deckSay(why, C.danger); }
    d.mk = deckMkNow(); d.fuse = legacyLv('fuse') > 0;
    return done();
  }
  if (d.real) { if ((save.rep || 0) < cost) { Sound.deny(); return deckSay('not enough REP.', C.danger); } save.rep -= cost; persist(); return done(); }
  if (d.rep < cost) { Sound.deny(); return deckSay('not enough REP.', C.danger); }
  d.rep -= cost; done();
}
function deckUpgrade3() { deckBuy('deck3', deckCost('deck3'), () => { const d = DECK; d.mk = Math.max(d.mk, 3); deckUpShow(3); }); }
// the upgrade fanfare (deckBoard: d.up). seenMk: the mk it last played for, so buying one on THE BOARD plays it the first
// time you open your deck after.
function deckUpShow(mk, delay = 0) { const d = DECK; d.cpu = null; d.pick = null; d.view = 'board'; d.up = { mk, t0: performance.now() + delay }; d.seenMk = Math.max(d.seenMk || 2, mk); }
function deckFuseIn() {
  const d = DECK;
  if (d.mk < 3) { Sound.deny(); return deckSay('mk III first.', C.danger); }
  deckBuy('fuse', deckCost('fuse'), () => { d.fuse = true; d.mk = 4; deckUpShow(4); });
}
function deckEnterByte() {
  const d = DECK, code = d.bits.join('');
  d.tick = { text: DECK_CODES[code] || 'NO CARRIER', t: performance.now() };
  Sound.ui();
  deckShow(22, 4, deckViewRows());   // the ticker answers on the board: bring it into view
  if (code === '01111111') setTimeout(() => d.bits.fill(0), 900);
  if (code === '00001111') {   // OVERCLOCK: the cell at F, and it stays on (saved) until you enter it again
    d.overclock = !d.overclock; Sound.buy();
    if (!d.overclock) d.tick = { text: '0x0F: OVERCLOCK off. your cell runs at its own power.', t: performance.now() };
  }
}
