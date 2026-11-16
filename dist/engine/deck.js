// NeoN+1 engine/deck.js: YOUR DECK (docs/DECK.md). Two ways in:
// - The real deck: THE BOARD > YOU > [ YOUR DECK ]. You get it at USER (POPS calls). What you own and where it sits is
//   save.deck; your mk comes from THE BOARD's posts (DECK mk III, THE FUSE: engine/save.js LEGACY), your REP is save.rep.
// - The dev screen: the editor's "the deck (dev)" (engine/editor.js SCENES.deck). Every chip, its own REP, nothing saved.
// The board art: SCENE_ART.deck (asxii_art/deck_board_v06, copied in by tools/data/scene_art.js). The socket and part
// spots below are read off that art: move them when the art moves.
'use strict';
NEON_FILES.push(['engine/deck.js', 'v15.00']);

// ---------- data: the first chip set (docs/DECK.md "The first chip set", Greg 2026-11-16) ----------
// groups: [name, palette color key, what it's for]
const DECK_GROUPS = {
  boot: ['BOOT', 'rep', 'what a run starts with'], bios: ['BIOS', 'rep', "the run's rules"],
  crash: ['CRASH', 'bright', 'what happens when you die'], spoils: ['SPOILS', 'money', 'what corp bosses give'],
  shell: ['SHELL', 'accent', 'one command for THE SHELL'], psu: ['PSU', 'money', 'the cell: your power budget'],
  glyph: ['GLYPH', 'bright', 'your favourite glyph'], ov: ['OVERVOLT', 'danger', 'pay with integrity'],
  sudo: ['SUDO', 'accent', 'the strong commands'], boss: ['BOSS', 'money', 'wide chips from the big bosses'],
  heat: ['HEAT', 'danger', 'harder runs, more REP'],
};
const deckGroupCol = g => C[DECK_GROUPS[g][1]] || C.text;
// chips: key: [name, group, rarity, power, what it does (the long text: the picker, 4 rows at most), face (top row,
// bottom row: 3 wide, 5 for BOSS), tip (the short text: the card's ticker)]. What each one does in a run: the hooks
// below (chipOn), one per chip, each marked "(a chip: engine/deck.js)" where it lives. Power: 0 for switches, handicaps
// and looks; 1 most; 2 strong; 3 run-changers.
const DECK_CHIPS = {
  // BOOT: what a run starts with (engine/deck.js deckRunStart)
  TF1: ['TRUST FUND', 'boot', 'common', 1, 'start every run with +60cr.', ['$$$', '+60'], 'start with +60cr.'],
  LD3: ['LOADOUT', 'boot', 'rare', 2, 'a battle chip: start every run with 3 FWALLs and 2 FRAGs.', ['[#]', '*!*'], 'start with 3 FWALLs and 2 FRAGs.'],
  BM4: ['BEAST MASTER', 'boot', 'epic', 2, 'start every run with 3 CALLs: your crew on speed dial.', ['@@@', 'BMS'], 'start with 3 CALLs.'],
  FI2: ['FRESH INSTALL', 'boot', 'rare', 1, 'no starter perk. you start with +2 INT and +100cr instead.', ['NEW', '+2^'], 'no starter perk: +2 INT, +100cr.'],
  // BIOS: the run's rules
  QT0: ['QUIET', 'bios', 'rare', 1, 'no rival hackers turn up. (a corp with the RIVAL anomaly has nobody.)', ['shh', '...'], 'no rival hackers.'],
  // CRASH: when you die
  DM5: ['DEADMAN', 'crash', 'epic', 1, 'dying keeps 50% of the REP you would have banked.', ['DED', 'MAN'], 'die and keep half your REP.'],
  BB7: ['BLACK BOX', 'crash', 'rare', 2, "when you die, your best mod goes to the LOCKER, a step lower (if the LOCKER's empty). your next run starts with it.", ['[#]', 'BOX'], 'a mod survives your death.'],
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
  // SHELL: one command each, in THE SHELL (~ opens it). a stand-in pair until THE SHELL is sorted out (Greg)
  WH0: ['whoami', 'shell', 'common', 1, "THE SHELL learns whoami: your run so far, and the REP you'd bank if you cashed out now. (~ opens THE SHELL.)", ['who', '?_?'], 'whoami: your run so far.'],
  PS4: ['ps', 'shell', 'rare', 1, 'THE SHELL learns ps: the rival hackers in this corp, by name, and how hurt they are. (~ opens THE SHELL.)', ['ps ', '@ @'], 'ps: name the rivals.'],
  // SUDO (mk IV): the strong commands
  FL3: ['flatline', 'sudo', 'legendary', 3, 'THE SHELL learns flatline: a rival hacker in this corp drops dead. once a corp. (~ opens THE SHELL.)', ['FLT', '_/\\'], 'flatline: a rival drops dead.'],
  // BOSS (mk IV): big chips from the big bosses
  OMNI: ["OMNI'S EYE", 'boss', 'exotic', 3, "every corp's card on the map shows its tell.", ['<(@)>', 'OMNI '], 'every corp shows its tell.'],
  // HEAT (mk IV): harder runs, more REP
  HC1: ['HARDCORE', 'heat', 'epic', 0, 'no CRASH chip works. +50% REP.', ['HRD', 'x_x'], 'no CRASH chip, +50% REP.'],
  TX2: ['TAXED', 'heat', 'rare', 0, 'a cut of every payout: -20% credits. +25% REP.', ['TAX', '-$%'], '-20% credits, +25% REP.'],
};
// What each chip touches (docs/DECK.md "Seeds"; not shown in the game): map (what a run generates), rules (what it pays
// or drops), you (your start, tools, deaths). Keep it next to DECK_CHIPS: a new chip gets its tags here.
const DECK_CHIP_TAGS = {
  TF1: ['you'], LD3: ['you'], BM4: ['you'], FI2: ['you'], QT0: ['map'], DM5: ['you'], BB7: ['you'], SP3: ['rules'],
  SC1: ['you'], LI2: ['you'], NC3: ['you'], RX9: ['you'], GR8: ['you', 'rules'], LK7: ['you', 'rules'], FM2: ['you', 'rules'], SK1: ['you'],
  WH0: ['you'], PS4: ['you'], FL3: ['you'], OMNI: ['you'], HC1: ['rules', 'you'], TX2: ['rules'],
};
// Power (docs/DECK.md "Power", first pass for playtesting): the cell powers mk II and mk III, one cell per stage of the
// ladder (6 / 9 / 11 / 14); the FUSE powers mk IV on its own (DECK_FUSE_PWR). Every number fits one hex character:
// the borders show them that way (+-2-+, the PSU +5/E+). OVERCLOCK (a BYTE code) runs the cell at F.
const DECK_CELL = { SC1: 6, LI2: 9, NC3: 11, RX9: 14 };
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
const DECK_POSTS = ['HARDENED', 'SEED MONEY', 'FIELD KIT', 'GEAR SLOT', 'RESTOCK', 'SECOND WIND', 'LOCKER', 'WORKBENCH', 'TELL LIGHT', 'LUCKY START'];
// BOARD posts you can set for a run (THE BOARD's LEGACY keys, engine/save.js: their names and text come from there).
// Only the ones with a real choice (Greg, 2026-11-15): STARTER POOL changes what the starter perk offers, STRAY is a pet
// you might not want along, NEMESIS picks a corp (it cycles, or none). Posts that only help (TELL LIGHT, LUCKY START)
// are just on.
const DECK_SWITCHES = ['starter', 'stray', 'nemesis'];
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
const DECK_NO_DROP = ['SC1', 'SP3'];   // the deck comes with these (the 1UP is b0y's, from beating G0D: not a chip yet)
const deckChipItem = key => 'chip_' + key;
const deckItemChip = k => (ITEMS[k] && ITEMS[k].chip) || null;
const deckHave = key => (save.deck && save.deck.chips && save.deck.chips[key]) || 0;
for (const [key, c] of Object.entries(DECK_CHIPS)) {
  ITEMS[deckChipItem(key)] = { key: deckChipItem(key), name: c[0], price: 0, rarity: c[2], chip: key, only: 'deck', nosell: true, desc: c[4],
    get tip() { const n = deckHave(key); return `${n ? `dupe: you have ${n}.` : 'NEW.'} ${c[6]} cash out to keep it.`; } };
  // on the belt its face's two rows take turns (Greg, 2026-11-16), 3 wide (engine/panels.js ITEM_SHORT)
  Object.defineProperty(ITEM_SHORT, deckChipItem(key), { get: () => { const f = c[5], b = f[1] && Math.floor(performance.now() / 1100) % 2; return (b ? f[1] : f[0]).slice(0, 3).padEnd(3); } });
}
// chips drop once you have a deck, in real runs (not the training, not a race)
const deckDrops = () => !!save.deck && !!st.run && !st.run.tutorial && !st.mp;
function deckRollChip(r) {
  const pool = Object.keys(DECK_CHIPS).filter(k => !DECK_NO_DROP.includes(k));
  return pickWeighted(pool, k => DECK_DROP_WEIGHT[DECK_CHIPS[k][2]] || 0, r);
}
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
  for (const s of chips) { const k = deckItemChip(s.key); save.deck.chips[k] = (save.deck.chips[k] || 0) + s.n; }
  FEAT_QUEUE.push({ head: 'YOUR DECK', lines: ['chips home:', '', ...chips.map(s => '  ' + ITEMS[s.key].name + (s.n > 1 ? ' x' + s.n : '')), '', 'slot them: THE BOARD > YOU.'] });
}

// ---------- the chips in a run ----------
// As a run starts (engine/run.js startRun: deckRunStart), the chips in your deck that are slotted, open and powered are
// written on the run (run.chips: so a resumed run has the same ones, and changing your deck mid-run changes nothing).
// HARDCORE turns the CRASH chips off. Not in the training or a race. chipOn(key) is what the game asks.
const chipOn = (key, run = st.run) => !!(run && run.chips && run.chips.includes(key));
function deckRunChips() {
  if (!save.deck) return [];
  const was = DECK; DECK = deckReal();
  const pw = deckPower(), d = DECK;
  let keys = [...pw.on].map(id => d.slots[id]).filter(k => DECK_CHIPS[k]);
  if (keys.includes('HC1')) keys = keys.filter(k => DECK_CHIPS[k][1] !== 'crash');   // HARDCORE: no CRASH chip works
  const spoils = d.spoils;
  DECK = was;
  return { keys, spoils };
}
// INT a chip costs (or gives) as a run starts
const DECK_INT = { RX9: -1, GR8: -1, LK7: -1, FM2: -1, SK1: -1, FI2: 2 };
function deckRunStart(run, opts = {}) {
  if (opts.tutorial || st.mp) return;
  const { keys, spoils } = deckRunChips();
  if (!keys || !keys.length) return;
  run.chips = keys; run.spoils = spoils || 0;
  const di = keys.reduce((a, k) => a + (DECK_INT[k] || 0), 0);
  if (di) { run.maxInt = Math.max(1, run.maxInt + di); run.integrity = Math.max(1, Math.min(run.maxInt, run.integrity + di)); }
  if (chipOn('TF1', run)) run.credits += 60;   // TRUST FUND
  if (chipOn('FI2', run)) run.credits += 100;   // FRESH INSTALL (and no starter perk: engine/panels.js openStartReward)
  const give = (key, n) => { for (let i = 0; i < n; i++) if (!addItem(key, 0)) break; };
  if (chipOn('LD3', run)) { give('wall', 3); give('frag', 2); }   // LOADOUT
  if (chipOn('BM4', run)) give('call', 3);   // BEAST MASTER
}
// credits you earn (engine/save.js earn): GREED +25%, TAXED -20%
function deckCredits(cr, run) {
  if (!(cr > 0) || !run || !run.chips) return cr;
  return Math.round(cr * (chipOn('GR8', run) ? 1.25 : 1) * (chipOn('TX2', run) ? 0.8 : 1));
}
// REP a run is worth (engine/save.js repFor): FAME +20%, TAXED +25%, HARDCORE +50%
const deckRepMult = run => !run || !run.chips ? 1 : (chipOn('FM2', run) ? 1.2 : 1) * (chipOn('TX2', run) ? 1.25 : 1) * (chipOn('HC1', run) ? 1.5 : 1);
// dying (engine/runend.js endRun): DEADMAN keeps half; BLACK BOX puts your best mod in the LOCKER
const deckDeadman = run => chipOn('DM5', run) ? 0.5 : 0;
function deckBlackBox(run) {
  if (!chipOn('BB7', run) || save.locker || run.practice || !run.mods.length) return;
  const rank = k => RARITY_ORDER.indexOf(MODS[k].rarity) * 10 + ((run.modTier || {})[k] || 0);
  const k = run.mods.filter(m => MODS[m] && !UPLINK_LOCKED.includes(m)).sort((a, b) => rank(b) - rank(a))[0];
  if (!k) return;
  save.locker = { key: k, tier: Math.max(0, ((run.modTier || {})[k] || 0) - 1) };
  FEAT_QUEUE.push({ head: 'BLACK BOX', lines: [`${MODS[k].name} made it out.`, "it's in the LOCKER:", 'your next run starts with it.'] });
}
// SPOILS (engine/panels.js openReward): 0 the rewards, 1 a heal, 2 cash
const deckSpoils = run => chipOn('SP3', run) ? run.spoils || 0 : 0;
// THE SHELL's commands from chips (engine/shell.js: the 'your deck' group). Known while the chip's on in this run (or in
// dev mode); safe (the run still counts), but the run is marked hacked (run.hacked: the leaderboard's mark, later).
const DECK_SHELL_CMDS = [
  { name: 'whoami', chip: 'WH0', safe: true, help: "your run so far, and the REP you'd bank now", run: () => {
    const run = shellNeedRun(); run.hacked = true;
    return `${profile().name} · sector ${run.sector + 1} · depth ${run.depth}\ncorps ${run.corps} · ${run.credits}cr · INT ${run.integrity}/${run.maxInt}\ncash out now: ${repFor(run)} REP`; } },
  { name: 'ps', chip: 'PS4', safe: true, help: 'the rival hackers in this corp', run: () => {
    const run = shellNeedRun(); run.hacked = true;
    const hs = hkRivalsUp();
    return hs.length ? hs.map(h => `${hkName(h.id).padEnd(10)} ${hkBars(h)}`).join('\n') : 'no rivals here.'; } },
  { name: 'flatline', chip: 'FL3', safe: true, help: 'a rival in this corp drops dead (once a corp)', run: () => {
    const run = shellNeedRun();
    if (!st.corp) throw new Error('only in a corp.');
    if (st.corp.flatlined) throw new Error('used: once a corp.');
    const h = hkRivalsUp()[0];
    if (!h) return 'no rivals here.';
    run.hacked = true; st.corp.flatlined = true;
    hkOut(h, 'flatlined.');
    return `${hkName(h.id)}: flatlined.`; } },
];

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
    sw: new Set(['starter', 'stray']), nemesis: CORPS.burgertron ? 'burgertron' : null,
  });
  return DECK_DEV;
}
// What you start with (the deck comes with its cell, and the SPOILS switch).
const DECK_START = { chips: { SC1: 1, SP3: 1 }, slots: { PSU: 'SC1', SPL: 'SP3' }, order: ['PSU', 'SPL'] };
// USER and no deck yet: it's yours, and POPS calls about it. From THE BOARD (a level opens: engine/feats.js
// boardLevelNews; or a save from before the deck: engine/menus.js openBoard).
const deckFreshSave = () => Object.assign(JSON.parse(JSON.stringify(DECK_START)), { spoils: 0, glyph: 0, crew: [], off: [], overclock: false, blown: false });
function deckEnsure() {
  if (save.deck || boardLevel() < 2) return;
  save.deck = deckFreshSave();
  persist();
  deckIntroCall();
}
function deckIntroCall() {
  queueCall('pops', ["kid. you made USER. that gets you a deck.", "slot chips in and they run, every run. the cell powers them.",
    "find chips. bring them home. it's on THE BOARD, under YOU."], { text: '[ SEE YOUR DECK ]', onTap: () => openDeck() });
}
// your mk, from THE BOARD's posts (the FUSE needs mk III: engine/save.js LEGACY 'fuse' needs 'deck3')
const deckMkNow = () => legacyLv('fuse') ? 4 : legacyLv('deck3') ? 3 : 2;
function deckReal() {
  const sd = save.deck, owned = DECK_SWITCHES.filter(k => legacyLv(k));
  const nem = owned.includes('nemesis') && !(sd.off || []).includes('nemesis') && CORPS[save.nemesis] ? save.nemesis : null;
  const d = Object.assign(deckView(), {
    real: true, mk: deckMkNow(), fuse: legacyLv('fuse') > 0, blown: !!sd.blown, spoils: sd.spoils || 0, glyph: sd.glyph || 0,
    crew: new Set(sd.crew || []), chips: Object.assign({}, sd.chips), slots: Object.assign({}, sd.slots), order: (sd.order || []).slice(),
    sw: new Set(owned.filter(k => k !== 'nemesis' && !(sd.off || []).includes(k))), nemesis: nem, overclock: !!sd.overclock,
  });
  Object.defineProperty(d, 'rep', { get: () => save.rep || 0 });   // (spend it with deckBuy: THE BOARD's posts)
  d.savedJ = JSON.stringify(deckSnap(d));
  return d;
}
// the part of the real deck that's saved (NEMESIS with no corp breached yet isn't "off": there's nothing to pick)
function deckSnap(d) {
  const owned = DECK_SWITCHES.filter(k => legacyLv(k));
  return { chips: d.chips, slots: d.slots, order: d.order, spoils: d.spoils, glyph: d.glyph, crew: [...d.crew],
    off: owned.filter(k => k === 'nemesis' ? !d.nemesis && (!d.real || nemesisPool().length > 0) : !d.sw.has(k)), overclock: !!d.overclock, blown: !!d.blown };
}
// Each frame on the real deck: anything changed goes into the save (one place, so no change is missed).
function deckPersist() {
  const d = DECK; if (!d || !d.real) return;
  const o = deckSnap(d), j = JSON.stringify(o);
  if (j === d.savedJ) return;
  d.savedJ = j; save.deck = Object.assign(save.deck || {}, JSON.parse(j));
  if (d.nemesis) save.nemesis = d.nemesis;
  persist();
}
// the switches you can set: the posts you own (all of them on the dev deck)
const deckSwitches = () => DECK.real ? DECK_SWITCHES.filter(k => legacyLv(k)) : DECK_SWITCHES;
// NEMESIS cycles through: the corps you've breached and none (every corp on the dev deck)
const deckNemPool = () => DECK.real ? [null].concat(nemesisPool()) : deckCorps();
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
const deckFits = (key, s) => DECK_CHIPS[key][1] === s.g;
const deckMk = m => ['', '', 'II', 'III', 'IV'][m];
const deckSay = (text, col = C.accent) => { DECK.msg = { text, col, t: performance.now() }; };
const deckSelect = sel => { DECK.sel = sel; DECK.selT = performance.now(); };

// Power: the cell's budget goes to the chips in the order they went in. A chip that doesn't fit what's left gets none,
// and newer ones still try, so the chip you just slotted is the one that goes dark, not one off screen.
// Two pools: the cell's for mk II and III, the FUSE's for mk IV (Greg, 2026-11-15: the fuse is the bottom board's power).
// Returns the cell's numbers at the top level (budget, left, used) and the fuse's as .fuse (null when it's dark).
const deckPool = s => s.mk === 4 ? 'fuse' : 'cell';
function deckPower() {
  const d = DECK, on = new Set(), off = [];
  const spike = Object.keys(d.slots).some(id => d.slots[id] === 'SK1' && deckOpen(deckSock(id).mk)) ? 2 : 0;   // SPIKE (OVERVOLT)
  const cellB = d.slots.PSU ? (d.overclock ? 15 : DECK_CELL[d.slots.PSU] || 0) + spike : 0, fuseB = deckOpen(4) ? DECK_FUSE_PWR : 0;
  const left = { cell: cellB, fuse: fuseB };
  for (const id of d.order) {
    const key = d.slots[id], s = deckSock(id); if (!key || !deckOpen(s.mk)) continue;   // a dark band's chips cost nothing
    const c = DECK_CHIPS[key][3], p = deckPool(s);
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
  d.scroll = clamp(bot - top <= rows ? Math.round((top + bot - rows) / 2) : top - 1, 0, max);
  d.carry = key; d.view = 'board'; Sound.ui();
}
function deckShow(by, h, rows) { const d = DECK; if (by < d.scroll) d.scroll = Math.max(0, by - 1); else if (by + h > d.scroll + rows) d.scroll = by + h - rows + 1; }

function openDeck(o = {}) {
  if (!o.dev && !save.deck) deckEnsure();
  DECK = o.dev || !save.deck ? deckDev() : deckReal();
  const d = DECK;
  d.pick = null; d.cpu = null; d.carry = null; d.msg = null; d.selT = performance.now();
  openPanel('THE DECK', deckLines, null, { full: true });
  st.keyHandler = deckKey;
}
function deckLeave() {
  const off = deckPower().off.length, now = performance.now();
  if (off && now - DECK.leave > 3000) { DECK.leave = now; Sound.deny(); return deckSay(`${off} chip${off > 1 ? 's have' : ' has'} no power. LEAVE again to go.`, C.danger); }
  DECK.leave = 0;
  if (DECK.real) swapTo(() => openBoard('you')); else swapTo(showTitle);
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
// The board's own look, toned back so it isn't noisy: the traces lean to the mk's color (mk II epic, III legendary, IV
// exotic: Greg), silkscreen part numbers in the empty spots, vias, and now and then a data packet running a trace.
const DECK_MK_RARITY = { 2: 'epic', 3: 'legendary', 4: 'exotic' };
const deckTraceCol = () => rarityCol(DECK_MK_RARITY[DECK.mk] || 'epic');
const DECK_LVL = { scrap: 0, common: 0, rare: 1, epic: 2, legendary: 3, exotic: 4 };
const DECK_TRACE = '-|=:.+o_/\\';   // the characters light runs along
const DECK_WAVE_MS = 13, DECK_DRAIN_MS = 7;   // ms a cell: the wave out, the drain in (and the fill back)
function deckFx(kind, sid, key) {
  const d = DECK; d.fx = { kind, sid, t0: performance.now(), lvl: key ? DECK_LVL[DECK_CHIPS[key][2]] || 0 : 0, burst: false };
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
  return (deckSilkCells = { silk, vias });
}
// a data packet: a short run along the traces from a random spot, every few seconds (open bands only)
function deckPacket(now) {
  const d = DECK, ART = deckArt();
  if (d.pk && now - d.pk.t0 < d.pk.path.length * 70 + 400) return d.pk;
  if (d.pkNext && now < d.pkNext) return null;
  d.pkNext = now + 2200 + Math.random() * 2600;
  for (let tries = 0; tries < 30; tries++) {
    const y = Math.floor(Math.random() * ART.length), x = Math.floor(Math.random() * DECK_ART_W);
    if (!DECK_TRACE.includes(ART[y][x] || ' ') || !deckOpen(deckBand(y))) continue;
    const path = [[x, y]], seen = new Set([y * 64 + x]);
    for (let i = 0; i < 26; i++) {
      const [px, py] = path[path.length - 1];
      const nx = [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]].filter(([a, b]) => !seen.has(b * 64 + a) && DECK_TRACE.includes((ART[b] || '')[a] || ' ') && deckOpen(deckBand(b)));
      if (!nx.length) break;
      const n = nx[Math.floor(Math.random() * nx.length)]; seen.add(n[1] * 64 + n[0]); path.push(n);
    }
    if (path.length >= 8) return (d.pk = { path, t0: now });
  }
  return null;
}
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
  g.put(0, y, 'NeoN+1', C.accent); const rep = `${d.rep} REP`; g.put(W - rep.length, y, rep, C.rep);
  g.put(0, y + 1, rule(W), C.dim);
  g.put(0, y + 2, 'THE BOARD // ', C.mid); g.put(13, y + 2, d.real ? 'YOUR DECK' : 'DECK · DEV', d.real ? C.bright : C.danger, true);
  deckBtn(ctx, g, W - 7, y + 2, '[LEAVE]', C.mid, 'dkleave', deckLeave);
  const tab = (v, label, id, x) => deckBtn(ctx, g, x, y + 3, d.view === v ? `[${label}]` : ` ${label} `, d.view === v ? C.accent : C.mid, id, () => { if (d.view === v) return; d.view = v; d.pick = null; d.cpu = null; d.carry = null; Sound.tick(); });
  const x2 = tab('board', 'BOARD', 'dktb', 0); tab('chips', `CHIPS ${deckOwned().length}`, 'dktc', x2);
  const pwt = `PWR ${pw.used}/${pw.budget}` + (pw.fuse ? ` F${pw.fuse.used}/${pw.fuse.budget}` : '') + (pw.off.length ? ` !${pw.off.length}` : ''), mkt = `mk ${deckMk(d.mk)} `;
  g.put(W - pwt.length, y + 3, pwt, pw.off.length ? C.danger : C.money, !!pw.off.length);
  if (W - pwt.length - mkt.length >= x2 + 13) g.put(W - pwt.length - mkt.length, y + 3, mkt, C.money);   // (the mk gives way when it's tight)
  g.put(0, y + 4, rule(W), C.dim);
  g.flush();
}

function deckBoard(ctx, y0, sa, under = null) {   // under: the picker's grid (the board draws into it, dim, no taps)
  const d = DECK, g = under || deckGrid(ctx), now = ctx.now, pw = deckPower(), ART = deckArt(), BH = ART.length, bv = sa - 2;
  const ax = Math.floor((L.wc - DECK_ART_W) / 2), maxTop = Math.max(0, BH - bv);
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
  const fx = d.fx, fxAge = fx ? now - fx.t0 : 0;
  if (!under && !reduced()) {   // a data packet on a trace
    const pk = deckPacket(now);
    if (pk) { const i = Math.floor((now - pk.t0) / 70);
      for (let j = 0; j < 4; j++) { const c = pk.path[i - j]; if (c) bput(c[0], c[1], j ? ART[c[1]][c[0]] : 'o', j ? mixHex(idle, tc, 0.6 - j * 0.15) : mixHex(tc, C.bright, 0.3), !j); } }
  }
  if (fx && !under) {   // the show
    const dm = deckDist(fx.sid);
    if (fx.kind === 'in') {   // a wave of light out along the traces
      const front = fxAge / DECK_WAVE_MS;
      if (front > dm.max + 8) d.fx = null;
      else for (const [k, dd] of dm.m) { if (dd > front || dd < front - 7) continue; const x = k % 64, y = Math.floor(k / 64); if (deckOpen(deckBand(y))) bput(x, y, ART[y][x], dd > front - 2 ? mixHex(tc, C.bright, 0.5) : mixHex(idle, tc, (dd - front + 7) / 7), dd > front - 2); }
    } else {   // the light drains into the socket, holds dark, then fills back
      const drain = dm.max * DECK_DRAIN_MS, hold = 300, fill = dm.max * DECK_DRAIN_MS * 1.6;
      const front = fxAge < drain ? dm.max - fxAge / DECK_DRAIN_MS : fxAge < drain + hold ? 0 : (fxAge - drain - hold) / (DECK_DRAIN_MS * 1.6);
      if (fxAge > drain + hold + fill) d.fx = null;
      else { for (let by = top; by < top + bv && by < BH; by++) g.put(ax, sy(by), ART[by], C.dim);   // the board goes dim...
        for (const [k, dd] of dm.m) { if (dd > front) continue; const x = k % 64, y = Math.floor(k / 64); if (deckOpen(deckBand(y))) bput(x, y, ART[y][x], idle); } }   // ...but where the light still is
    }
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
  const hh = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
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
  st.scroll = dd => { const t = clamp(d.scroll + dd, 0, maxTop); if (t !== d.scroll) { d.scroll = t; Sound.tick(); } };
  g.flush();
}
function deckTapSocket(s, rows) {
  const d = DECK;
  if (d.carry) {
    if (deckFits(d.carry, s) && deckOpen(s.mk)) deckSlot(d.carry, s.id);
    else { Sound.deny(); deckSay(`${DECK_CHIPS[d.carry][0]} doesn't go in ${s.id}.`, C.danger); }
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
        g.put(9, y, c[0] + (d.real && d.chips[key] > 1 ? ` x${d.chips[key]}` : ''), C.bright, true);   // (a dupe: how many)
        if (where) g.put(W - 1 - where.length - 3, y, 'in ' + where, off ? C.danger : C.accent);
        g.put(9, y + 1, c[1] === 'psu' ? `+${DECK_CELL[key]} PWR` : `PWR ${c[3]}`, C.mid);
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
  deckBox(ctx, g, y0, sa, X0, W, H, gc, `${s.id} · ${DECK_GROUPS[s.g][0]}`, done);
  // a status line (the group's text for now; the header already shows your power). It gets the whole row: whatever
  // goes here later has to fit W - 4 (Greg, 2026-11-15)
  g.put(X0 + 2, y0 + 1, DECK_GROUPS[s.g][2].slice(0, W - 4), C.dim);
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
  const pt = c[1] === 'psu' ? `+${DECK_CELL[k]}` : `PWR ${c[3]}`; g.put(IX + IW - pt.length, y, pt, sh ? C.danger : C.money, sh > 0);
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
  const meta = `${c[2]} · ` + (c[1] === 'psu' ? `power ${DECK_CELL[k]}` : `PWR ${c[3]}`); g.put(x, y + 1, meta, C.mid);
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
    if (m === 3 && !have) deckBtn(ctx, g, bx, y, `[ UPGRADE · ${deckCost('deck3')} REP ]`, d.mk === 2 ? C.rep : C.dim, 'dkmk3', deckUpgrade3, d.mk !== 2);
    else if (m === 4 && !have) { if (d.mk < 3) g.put(bx, y, 'mk III, then the FUSE', C.dim); else deckBtn(ctx, g, bx, y, `[ THE FUSE · ${deckCost('fuse')} REP ]`, C.rep, 'dkmk4', deckFuseIn); }
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
    const p = deckPost(k), nem = k === 'nemesis', on = nem ? !!d.nemesis : d.sw.has(k);
    g.put(x, y, p.name, on ? C.bright : C.mid, on);
    if (nem) {   // [<] CORP [>] (Greg, 2026-11-16: lots of corps; like THE BOARD's NEMESIS picker). The name steps forward too.
      const step = dd => { const cs = deckNemPool(); d.nemesis = cs[((cs.indexOf(d.nemesis) + dd) % cs.length + cs.length) % cs.length]; Sound.tick(); };
      const nw = 13, n = (d.nemesis ? CORPS[d.nemesis].name : 'none').slice(0, nw), l = Math.floor((nw - n.length) / 2);
      const bx = x + w - (nw + 8);
      deckBtn(ctx, g, bx, y, '[<]', C.accent, 'dkswnemesisL', () => step(-1));
      deckBtn(ctx, g, bx + 4, y, (' '.repeat(l) + n).padEnd(nw), on ? C.accent : C.mid, 'dkswnemesis', () => step(1));
      deckBtn(ctx, g, bx + nw + 5, y, '[>]', C.accent, 'dkswnemesisR', () => step(1));
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
    const meta = `${DECK_GROUPS[c[1]][0]} · `; g.put(x, y, meta, C.mid);
    g.put(x + meta.length, y, c[1] === 'psu' ? `power ${DECK_CELL[key]}` : `PWR ${c[3]}`, off ? C.danger : C.mid);
    if (off && Math.floor(now / 500) % 2) g.put(W - 9, y, 'NO POWER', C.danger, true);
    g.bg(x, y + 1, c[0].length + 2, 1, ch.bg, 1); g.put(x + 1, y + 1, c[0], ch.fg, true);
    tick(x + 1, key === 'SP3' ? 'bosses: ' + DECK_SPOILS[d.spoils][2] : c[6]);
    return x;
  };
  if (sel.kind === 'chip') {
    const where = deckSlotOf(sel.key), c = DECK_CHIPS[sel.key];
    frame(where ? deckSock(where) : { id: '---', g: c[1], mk: 2, w: c[1] === 'boss' ? 7 : 5, h: 4 }, sel.key);
    chipRows(sel.key, where);
    btns([['[ SLOT ]', C.accent, 'dkslot', () => deckCarry(sel.key)], ...(where ? [['[ PULL ]', C.bright, 'dkpull', () => deckPull(where)]] : [])], c[1] === 'boss' ? 10 : 8);
  } else if (sel.kind === 'socket') {
    const s = deckSock(sel.id), key = d.slots[s.id], open = deckOpen(s.mk), [gn, , gt] = DECK_GROUPS[s.g], gc = deckGroupCol(s.g);
    if (s.g === 'glyph') {
      if (open) DECK_GLYPHS[d.glyph][1].forEach((l, j) => g.put(1, y + j, l, C.bright, true)); else g.put(1, y + 1, ':mk3:', C.mid);
      g.put(8, y, 'GLYPH · your favourite', C.mid); g.put(9, y + 1, open ? DECK_GLYPHS[d.glyph][0] : 'GLY · LOCKED', open ? C.bright : C.mid, true);
      tick(9, open ? 'tap it when you see it on a layer and it acts like a loot node, ICE or real.' : 'opens with mk III: the CPU upgrade, an ELITE post on THE BOARD.');
      btns(open ? [['[ CHANGE ]', C.accent, 'dkchg', () => deckPick('GLY')]] : d.mk < 3 ? [['[ mk III · ' + deckCost('deck3') + ' REP ]', C.rep, 'dkmk3', deckUpgrade3]] : [], 8);
    } else if (!open) {
      frame(s);
      g.put(8, y, gn, C.mid); g.put(9, y + 1, `${s.id} · LOCKED`, C.mid, true);
      tick(9, s.mk === 3 ? 'opens with mk III: the CPU upgrade, an ELITE post on THE BOARD.' : d.blown ? 'the FUSE is blown. replace it to light mk IV again.' : 'opens with mk IV: the FUSE, a SYSOP post on THE BOARD.');
      btns(s.mk === 3 && d.mk < 3 ? [['[ mk III · ' + deckCost('deck3') + ' REP ]', C.rep, 'dkmk3', deckUpgrade3]] : s.mk === 4 ? [[d.blown ? '[ REPLACE FUSE ]' : '[ SEE THE FUSE ]', C.rep, 'dkfuse', () => deckTapPart('fuse')]] : [], s.w + 3);
    } else if (key) {
      frame(s); chipRows(key, s.id);
      btns([['[ CHANGE ]', C.accent, 'dkchg', () => deckPick(s.id)], ...(key === 'SP3' ? [[`[ ${DECK_SPOILS[d.spoils][0]} > ]`, C.money, 'dkspl', () => { d.spoils = (d.spoils + 1) % 3; Sound.tick(); }]] : [])], s.w + 3);
    } else {
      frame(s);
      const n = deckOwned().filter(k => deckFits(k, s)).length;
      g.put(8, y, `${gn} · ${n} fit`, C.mid); g.put(9, y + 1, `${s.id} · EMPTY`, C.bright, true);
      tick(9, gt + '.');
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
    for (let i = 0; i < 8; i++) { const x = 1 + i * 3, on = d.bits[i]; g.put(x, y + 1, `[${on}]`, on ? C.accent : C.mid, !!on); ctx.hl(x, y + 1, 3, 1, 'dkbit' + i, false); ctx.addHit(x, y + 1, 3, 1, { kind: 'btn', id: 'dkbit' + i, onTap: () => { d.bits[i] ^= 1; Sound.tick(); } }); }
    g.put(26, y + 1, '0x' + parseInt(d.bits.join(''), 2).toString(16).toUpperCase().padStart(2, '0'), C.mid);
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
function deckUpgrade3() { deckBuy('deck3', deckCost('deck3'), () => { const d = DECK; d.mk = Math.max(d.mk, 3); Sound.buy(); deckSay('mk III: the middle board is in.'); }); }
function deckFuseIn() {
  const d = DECK;
  if (d.mk < 3) { Sound.deny(); return deckSay('mk III first.', C.danger); }
  deckBuy('fuse', deckCost('fuse'), () => { d.fuse = true; d.mk = 4; Sound.buy(); deckSay('the fuse is in. mk IV lit.'); });
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
