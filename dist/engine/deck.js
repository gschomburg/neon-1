// NeoN+1 engine/deck.js: YOUR DECK (docs/DECK.md): the chips as loot and in a run, testing, the deck's state. Its chips are
// data/chips.js; THE SHELL's chip commands engine/deck_shell.js; the screen engine/deck_screen.js. Two ways in:
// - The real deck: THE BOARD > YOU > [ YOUR DECK ]. You get it at USER (POPS calls). What you own and where it sits is
//   save.deck; your mk comes from THE BOARD's posts (DECK mk III, THE FUSE: engine/save.js LEGACY), your REP is save.rep.
// - The dev screen: the editor's "the deck (dev)" (engine/editor.js SCENES.deck). Every chip, its own REP, nothing saved.
// The board art: SCENE_ART.deck (asxii_art/deck_board_v06, copied in by tools/data/scene_art.js). The socket and part
// spots below are read off that art: move them when the art moves.
'use strict';
NEON_FILES.push(['engine/deck.js', 'v16.00']);

// ---------- data: the chips are in data/chips.js (DECK_GROUPS, DECK_CHIPS, and the tables built from them) ----------
// Every socket's color is your deck's: it levels up with your mk (mk II rare, III epic, IV gold: the same as the
// traces, deckTraceCol). GLYPH keeps its own (Greg, 2026-11-16). Red still means no power. Used for a slotted socket's
// outline, the picker's frame and the CHIPS tab's headers.
const deckGroupCol = g => g === 'glyph' ? C[DECK_GROUPS[g][1]] || C.text : deckTraceCol();
// RIPPED chips (ripped in their entries: data/chips.js): their texts say so (their one-line tip starts RIPPED), and they look it (deckRipGlow)
const deckIsRipped = k => DECK_RIPPED.includes(k);
for (const k of DECK_RIPPED) { DECK_CHIPS[k][4] = 'RIPPED: from a rival. ' + DECK_CHIPS[k][4]; DECK_CHIPS[k][6] = 'RIPPED. ' + DECK_CHIPS[k][6]; }
const deckBeta = k => !!DECK_BETA[k];
// Power (docs/DECK.md "Power", first pass for playtesting): the cell powers mk II and mk III, one cell per stage of the
// ladder (6 / 9 / 11 / 14); the FUSE powers mk IV on its own (DECK_FUSE_PWR). Every number fits one hex character:
// the borders show them that way (+-2-+, the PSU +5/E+). OVERCLOCK (a BYTE code) runs the cell at F.
// a cell's power. WIND-UP: 2, +2 a sector you cleared in your last cash-out (save.deck.windup, engine/runend.js endRun), 14 at most
const deckCellPower = key => key === 'WU3' ? Math.min(14, 2 + 2 * ((save.deck && save.deck.windup) || 0)) : DECK_CELL[key] || 0;
const DECK_FUSE_PWR = 8;
const deckHex = n => n.toString(36).toUpperCase();   // (past F: G H I..., so HCF'S CORE's 18 and a big budget still fit the PSU's 3 cells: audit 2026-11-23)
const DECK_SPOILS = [['REWARDS', 'RWD', 'take the REWARDS.'], ['HEAL', 'HP+', 'skip them: HEAL 2 INT.'], ['CASH', '$$$', 'skip them: take CASH.']];
// GLYPH (mk III; Greg, 2026-11-22): no chips. Pick your favourite from the real glyphs you've seen (the codex's), then
// its bonus. Only where it shows: corps that draw their own symbols replace the glyph, so it's never there (a tile's glyph
// is the very MOTIFS entry: deckFavIs). LOOT is free; the others are THE BOARD's posts. save.deck.fav (an ART_GLYPHS
// index), .favB (a bonus key), .favTaps (COLLECTOR's count, across runs). run.fav, run.favB for the run.
// Hooks: deckFavTap (engine/run.js onSafe, onTrap: LOOT, COLLECTOR), engine/hits.js blockHit (SIGNED), engine/run.js
// payFor (GOLDEN), engine/board.js (your glyph's tint).
const DECK_FAV_B = {
  loot: ['LOOT', null, 'tap it and it pays out like a $ node, ICE or real'],
  signed: ['SIGNED', 'gsigned', 'as ICE it hits you for 0'],
  golden: ['GOLDEN', 'ggolden', "when it's the real node, the layer pays double"],
  collector: ['COLLECTOR', 'gcollect', 'every tap on it counts: at 10, a free mod'],
};
const deckFavBOpen = k => !DECK_FAV_B[k][1] || !DECK.real || legacyLv(DECK_FAV_B[k][1]) > 0;
const deckFavPool = () => ART_GLYPHS.map((g, i) => i).filter(i => !DECK.real || (save.seen || {})['g' + i]);
const deckFavArt = i => i == null || !MOTIFS[i] ? [' ? ? ', '? ? ?', ' ? ? '] : MOTIFS[i];
const deckFavName = i => i == null || !ART_GLYPHS[i] ? 'NONE YET' : ART_GLYPHS[i].name;
function deckFavStep(dd = 1) {
  const d = DECK, ks = Object.keys(DECK_FAV_B).filter(deckFavBOpen), i = ks.indexOf(d.favB);
  d.favB = ks[((i < 0 ? 0 : i + dd) % ks.length + ks.length) % ks.length]; Sound.tick();
}
const deckFavIs = (t, run = st.run) => !!(run && run.fav != null && t && t.glyph && MOTIFS.indexOf(t.glyph) === run.fav);
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
// LOST LOOT's is KEEP / SHRED, not on / off (DECK_SWITCH_TEXT).
const DECK_SWITCHES = ['starter', 'stray', 'nemesis', 'lostloot'];
const DECK_SWITCH_TEXT = { lostloot: ['[keep]', '[shred]'] };
const DECK_PICKERS = ['nemesis'];
// THE ARCHIVE's mods (its chip, AR1): any you've found (seen), but no exotics, quest mods or hidden ones (deckRunStart)
const archivePool = () => modsFound('minor', 'gen', 'corp').filter(k => save.seen[k] && !MODS[k].quest && !MODS[k].hidden)
  .sort((a, b) => MODS[a].name.localeCompare(MODS[b].name));
const deckPost = k => (typeof LEGACY !== 'undefined' && LEGACY.find(u => u.key === k)) || { name: k.toUpperCase(), desc: '' };
const deckCorps = () => [null].concat(Object.keys(CORPS).sort((a, b) => CORPS[a].name.localeCompare(CORPS[b].name)));
// CREW JACKS (mk III; Greg, 2026-11-22): no chips. Plug in crew you've hired (THE BOARD's CREW posts) and their boon is
// on for every run, no call needed. Their LVL 2 post makes it stronger: [LVL 1, LVL 2]. A jack costs power, 1 (2 at
// LVL 2), after the chips (deckPower). 2 jacks; PARTY LINE (THE BOARD, SYSOP) is a 3rd. run.jacks: { id: 1 | 2 }.
// The hooks: deckJackSector (NANA, DIALUP, KLUDGE's letter), engine/hits.js blockHit (BRICK), engine/hackers.js hkSpawn
// (NULL), deckClock (BAUD), engine/panels.js priceOf (MOTHER), engine/bench.js benchBuild (KLUDGE), engine/run.js onSafe
// (HYPE), deckLayer (b0y), deckCharges (ROOT), engine/mapview.js nodeInfo (POPS).
const DECK_JACKS = {
  pops: ['one corp a sector shows its tell on the map', 'two corps a sector show their tell on the map'],
  nana: ['a PATCH every sector', 'two PATCHes every sector'],
  brick: ['your first ICE hit each sector is blocked', 'your first ICE hit in each corp is blocked'],
  null: ['once a sector, a rival comes in on 1 bar', "once a sector, a rival's out the moment it comes in"],
  dialup: ['a TUNNEL every sector', 'a TUNNEL and a SKIP every sector'],
  baud: ['layer clocks +1s', 'layer clocks +2s'],
  mother: ['market heals cost half', 'market heals cost half, and the first a sector is free'],
  kludge: ['a failed build gives its letters back, once a WORKBENCH', 'that, and +1 letter every sector'],
  hype: ['perfect layers pay +5cr', 'perfect layers pay +10cr'],
  b0y: ["a corp's first layer: he rules out ICE till 3 are left", 'every layer: he rules out ICE till 3 are left'],
  root: ['+1 charge for THE SHELL', '+2 charges for THE SHELL'],
};
const jackLv = (id, run = st.run) => (run && run.jacks && run.jacks[id]) || 0;
const deckJackMax = () => !deckOpen(3) ? 0 : 2 + (DECK.real ? Math.min(1, legacyLv('jack3')) : 1);
// who can plug in: crew you've hired (every one on the dev deck)
const deckCrewPool = () => Object.keys(DECK_JACKS).filter(id => HACKERS[id] && (!DECK.real || hkCrewOn(id)));
const deckCrewLv = id => hkLvl2(id) ? 2 : 1;
const deckJacked = () => { const pool = deckCrewPool(); return [...DECK.crew].filter(id => pool.includes(id)).slice(0, deckJackMax()); };
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
const deckChipItem = key => 'chip_' + key;
const deckItemChip = k => (ITEMS[k] && ITEMS[k].chip) || null;
// A SHELL or SUDO chip before THE SHELL is yours (Greg, 2026-11-20: they still drop; they point you at ROOT's quest)
const deckNoShell = key => ['shell', 'sudo'].includes(DECK_CHIPS[key][1]) && !(typeof rootOn === 'function' && rootOn());
const deckHave = key => (save.deck && save.deck.chips && save.deck.chips[key]) || 0;
// OWNED (Greg, 2026-11-22): a chip your deck has says so wherever you meet it in a run (the belt's tip, the CHIP DEALER,
// a market's or a boss's card, a DATA CACHE, a PIER catch, a rival's drop). One you don't have says nothing.
// You never hold more than one at home, so no counts. key: a chip key or its gear key (chip_...).
const deckOwned1 = key => !!deckHave(deckItemChip(key) || key);
const deckChipNote = key => deckOwned1(key) ? 'OWNED' : 'cash out to keep it';
for (const [key, c] of Object.entries(DECK_CHIPS)) {
  ITEMS[deckChipItem(key)] = { key: deckChipItem(key), name: c[0], price: 0, rarity: c[2], chip: key, only: 'deck', nosell: !deckIsRipped(key), ripped: deckIsRipped(key), desc: c[4],   // (a RIPPED one sells: Greg, sell it and the heat's off. Its price: below)
    get tip() { const n = deckHave(key); return `${n ? 'OWNED. ' : ''}${c[6]} ${n ? 'cash out and it shreds into letters.' : 'cash out to keep it.'}${deckIsRipped(key) ? ' rivals want it back.' : ''}${deckNoShell(key) ? ' it needs THE SHELL: get ROOT on your crew.' : ''}`; } };
  // on the belt its face's two rows take turns (Greg, 2026-11-16), 3 wide (engine/panels.js ITEM_SHORT)
  Object.defineProperty(ITEM_SHORT, deckChipItem(key), { get: () => { const f = c[5], b = f[1] && Math.floor(performance.now() / 1100) % 2; return (b ? f[1] : f[0]).slice(0, 3).padEnd(3); } });
}
// chips drop once you have a deck, in real runs (not the training, not a race)
const deckDrops = () => !!save.deck && !!st.run && !st.run.tutorial && !st.mp;
// BETTER DROPS and LUCK (engine/mods.js rarityUp; Greg, 2026-11-22: chips too): with their chance, a chip is rolled twice
// and the rarer one kept. (Only then does it take more from the stream, as rollTier does.)
const deckRarer = (a, b) => RARITY_ORDER.indexOf(DECK_CHIPS[b][2]) > RARITY_ORDER.indexOf(DECK_CHIPS[a][2]) ? b : a;
const deckLucky = (r, roll) => { const k = roll(), up = rarityUp(); return up && r() < up ? deckRarer(k, roll()) : k; };
function deckRollChip(r) {
  const pool = Object.keys(DECK_CHIPS).filter(k => !DECK_NO_DROP.includes(k) && !deckBeta(k) && !deckIsRipped(k) && DECK_CHIPS[k][1] !== 'boss');   // (BOSS chips come from their bosses and quests: OMNI'S EYE dropped from caches, audit 2026-11-23)
  return deckLucky(r, () => pickWeighted(pool, k => DECK_DROP_WEIGHT[DECK_CHIPS[k][2]] || 0, r));
}
// a RIPPED one (rivals, THE FENCE): by rarity, the same weights. from: the rival it came off; HCF drops its own CORE
// far more often (Greg, 2026-11-22: beat HCF for it): DECK_HCF_X its weight: about 1 of its drops in 5 (other rivals: 1 in 140).
const DECK_HCF_X = 40;
const deckRollRipped = (r, from = null) => deckLucky(r, () => pickWeighted(DECK_RIPPED, k => (DECK_DROP_WEIGHT[DECK_CHIPS[k][2]] || 0) * (k === 'HF9' && from === 'hcf' ? DECK_HCF_X : 1), r));   // (BETTER DROPS, LUCK: deckLucky)
// ---------- CHIP DEALER (THE BOARD: ELITE, II on SYSOP; Greg, 2026-11-22) ----------
// After a DATA CACHE: a catalog of chips (3; 5 with II, one of them rare or better), at a market's chip price (shopMult:
// LOYALTY CARD, CHEAPSKATE). What drops can be in it (deckRollChip: no BETA, RIPPED or quest chips; no BOSS ones).
// Every one in it counts as seen (the WORKBENCH can build it). What you buy goes on your belt: cash out to keep it.
// Its stock is the run's, by the seed (run.dealer: node id -> [{ key, price, sold }]), so going back in shows what's left.
function deckDealerStock(node) {
  const run = st.run; run.dealer = run.dealer || {};
  if (run.dealer[node.id]) return run.dealer[node.id];
  const r = rngFor(run.seed, 'dealer', node.id), n = legacyLv('dealer') >= 2 ? 5 : 3, keys = [];
  for (let tries = 0; keys.length < n && tries < 60; tries++) {
    const k = deckRollChip(r);
    if (!keys.includes(k) && DECK_CHIPS[k][1] !== 'boss') keys.push(k);
  }
  if (n === 5 && !keys.some(k => RARITY_ORDER.indexOf(DECK_CHIPS[k][2]) >= RARITY_ORDER.indexOf('rare'))) {   // (II: one rare or better)
    for (let tries = 0; tries < 60; tries++) { const k = deckRollChip(r); if (!keys.includes(k) && DECK_CHIPS[k][1] !== 'boss' && RARITY_ORDER.indexOf(DECK_CHIPS[k][2]) >= RARITY_ORDER.indexOf('rare')) { keys[keys.length - 1] = k; break; } }
  }
  for (const k of keys) markSeen(deckChipItem(k));
  return (run.dealer[node.id] = keys.map(key => ({ key, price: Math.round((DECK_CHIP_PRICE[DECK_CHIPS[key][2]] || 60) * shopMult()), sold: false })));
}
function openChipDealer(node) {
  const run = st.run, stock = deckDealerStock(node);
  let sel = Math.max(0, stock.findIndex(o => !o.sold));
  const why = o => o.sold ? 'sold.' : !canSpend(o.price) ? 'not enough credits.' : !itemRoom(deckChipItem(o.key), 0) ? 'no room on your belt.' : null;
  const buy = () => {
    const o = stock[sel]; if (!o || why(o) || st.transitioning) return Sound.deny();
    run.credits -= o.price; addItem(deckChipItem(o.key), 0); o.sold = true;
    Sound.buy(); setMsg(`> bought ${DECK_CHIPS[o.key][0].toLowerCase()}.`, C.money); saveRun();
    const nx = stock.findIndex(x => !x.sold); if (nx >= 0) sel = nx;   // (on to one that's left)
  };
  openPanel('CHIP DEALER', (T, B, X) => {
    T('CHIP DEALER', C.money);
    T(`credits ${run.credits}`, C.money);
    T('to keep a chip, get out with it.', C.dim);
    T('the catalog. chips for your deck:', C.mid);
    stock.forEach((o, k) => X({ list: true, id: 'dealer' + k, onTap: () => { sel = k; Sound.tick(); }, sel: k === sel, faded: !!why(o),
      gear: deckChipItem(o.key), name: DECK_CHIPS[o.key][0], col: C.bright, right: o.sold ? 'SOLD' : (deckHave(o.key) ? 'OWNED ' : '') + `${o.price}cr`.padStart(6), rightCol: o.sold ? C.dim : C.money }));   // (OWNED: your deck has it)
    T('');
    T(SEP, C.dim);
    const o = stock[sel], c = DECK_CHIPS[o.key];
    X({ gearHead: deckChipItem(o.key), gearTier: 0, text: `${c[0]}: ${DECK_GROUPS[c[1]][0]}` });
    T(c[6], C.text);
    if (deckHave(o.key)) T('OWNED: at home it shreds into letters.', C.mid);
    const w = why(o);
    if (w) { T(''); T(w, o.sold ? C.dim : C.dangerDim); T(''); }
    else X({ box: true, text: 'B U Y   I T', sub: `${o.price}cr`, id: 'dbuy', onTap: buy, minW: 18 });
    T(SEP, C.dim);
  }, '> the dealer opens the catalog.', { leave: { text: '[LEAVE >]', onTap: leavePanel } });
}
// a DATA CACHE (engine/panels.js openCache): now and then a chip. Returns its line for the cache's head, or null.
// A full belt: the swap comes up over the cache (pick the gear that goes, or keep what you have).
function deckCacheChip(node) {
  if (!deckDrops()) return null;
  const r = rngFor(st.run.seed, 'cachechip', node.id);
  if (r() >= DECK_DROP.cache && !DECK_ALWAYS) return null;   // (DECK_ALWAYS: testing)
  const key = deckRollChip(r), ik = deckChipItem(key);
  if (itemRoom(ik, 0)) { addItem(ik, 0); return `+ chip: ${DECK_CHIPS[key][0]}${deckHave(key) ? ' (OWNED)' : ''}`; }
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
  const chips = run.items.filter(s => deckItemChip(s.key)).concat((run.lost || []).map(x => ({ key: x.key, n: 1 })));   // (LOST LOOT's come home too)
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
  if (home.length) { tally('chipsSmuggled', home.length); featSweep(); }   // SMUGGLER, COLLECTOR (engine/feats.js)
  const noShell = chips.some(s => deckNoShell(deckItemChip(s.key)));   // (a shell chip before ROOT: where to go)
  // each chip home as its face and name (engine/feats.js featPage); past 4, names only, so the box fits a phone
  const lines = home.length ? ['chips home:', '', ...home.slice(0, 4).map(k => ({ chip: k })), ...home.slice(4).map(k => '  ' + DECK_CHIPS[k][0]), '', 'slot them: THE BOARD > DECK.'] : [];
  if (shred.length) lines.push(...(lines.length ? [''] : []), 'had already, shredded:', ...shred.map(n => '  ' + n), '  > ' + got.map(ch => isBlank(ch) ? 'BLANK' : ch).join(' '));
  FEAT_QUEUE.push({ head: 'YOUR DECK', lines: lines.concat(noShell && home.length ? ['', 'shell chips need THE SHELL.', rootStep() ? 'get ROOT: THE BOARD > QUESTS.' : 'open your deck. something lives in it.'] : []) });
}

// ---------- LOST LOOT (a REP post, USER; Greg, 2026-11-23: docs/BACKLOG.md) ----------
// A chip that drops with your belt full (a DATA CACHE's or a reward's swap: KEEP WHAT I HAVE, or a chip you swap out; a
// rival's drop; a PIER catch) goes to run.lost, up to LOST_MAX. You get them at a WORKBENCH (engine/bench.js: LOCKER >
// LOST), and they come home when you cash out (deckHome). Full: one goes, shredded into components (it's the new one
// when it's the least worth keeping): chips you own first, then the lowest rarity, then the oldest. The deck's CPU
// switch: KEEP, or SHRED (every lost chip shreds at once). Returns what happened, for the message line, or null (no
// post: lost, as before).
const LOST_MAX = 4;
const lostOn = () => legacyLv('lostloot') > 0 && !!save.bench;
function lostLoot(ik, run = st.run) {
  const k = deckItemChip(ik);
  if (!k || !run || !lostOn()) return null;
  const real = !run.practice && !run.tutorial;   // (practice: a chip that goes is just gone; nothing lands on your real bench: audit 2026-11-23)
  const name = DECK_CHIPS[k][0], shred = kk => real ? benchAutoShred(kk).map(ch => isBlank(ch) ? 'BLANK' : ch).join(' ') : 'practice, nothing kept';
  if (!postOn('lostloot')) return `${name} shredded: ${shred(k)}.`;
  const pool = run.lost || (run.lost = []);
  const add = { key: ik, at: run.lostN = (run.lostN || 0) + 1 };
  if (pool.length < LOST_MAX) { pool.push(add); return `${name} went to LOST LOOT (${pool.length}/${LOST_MAX}).`; }
  const worth = x => { const c = deckItemChip(x.key); return [deckHave(c) > 0 ? 0 : 1, RARITY_ORDER.indexOf(DECK_CHIPS[c][2]), x.at]; };
  const cmp = (a, b) => { const p = worth(a), q = worth(b); return p[0] - q[0] || p[1] - q[1] || p[2] - q[2]; };
  const out = pool.concat(add).sort(cmp)[0];
  const outName = DECK_CHIPS[deckItemChip(out.key)][0], bits = shred(deckItemChip(out.key));
  if (out === add) return `LOST LOOT full: ${name} shredded (${bits}).`;
  pool.splice(pool.indexOf(out), 1, add);
  return `${name} went to LOST LOOT. full: ${outName} shredded (${bits}).`;
}
// TAKE at the WORKBENCH: onto your belt
function lostTake(i, run = st.run) {
  const x = run && run.lost && run.lost[i];
  if (!x || !itemRoom(x.key, 0)) return Sound.deny();
  run.lost.splice(i, 1); addItem(x.key, 0); Sound.buy();
  return ITEMS[x.key].name;
}

// ---------- the chips in a run ----------
// As a run starts (engine/run.js startRun: deckRunStart), the chips in your deck that are slotted, open and powered are
// written on the run (run.chips: so a resumed run has the same ones, and changing your deck mid-run changes nothing).
// HARDCORE turns the CRASH chips off. Not in the training or a race. chipOn(key) is what the game asks.
const chipOn = (key, run = st.run) => !!(run && run.chips && run.chips.includes(key));
function deckRunChips(run) {
  deckGift();
  if (!save.deck) return {};   // (an object: destructuring keys from an array gets its keys() method)
  const was = DECK; DECK = deckReal();
  const pw = deckPower(), d = DECK;
  let keys = [...pw.on].map(id => d.slots[id]).filter(k => DECK_CHIPS[k]);
  let brown = null;   // BROWNOUT (a cell): one of the others is off this run (the run's seed picks it). Before HARDCORE, so a
  // browned-out HARDCORE takes its rule with it; not SPIKE, whose power is already counted (audit 2026-11-23)
  if (keys.includes('BO1') && run) { const pool = keys.filter(k => DECK_CHIPS[k][1] !== 'psu' && k !== 'SK1'); if (pool.length) { brown = pickR(pool, rngFor(run.seed, 'brownout')); keys = keys.filter(k => k !== brown); } }
  if (keys.includes('HC1')) keys = keys.filter(k => DECK_CHIPS[k][1] !== 'crash');   // HARDCORE: no CRASH chip works
  const spoils = d.spoils, crew = {}, fav = deckOpen(3) && d.glyph != null ? d.glyph : null, favB = deckFavBOpen(d.favB) ? d.favB : 'loot';   // (GLYPH)
  for (const id of pw.crewOn) crew[id] = deckCrewLv(id);   // CREW JACKS
  const under = pw.off.length > 0;   // a slotted chip with no power (UNDERPOWERED, a feat)
  DECK = was;
  return { keys, spoils, brown, crew, fav, favB, under };
}
// INT a chip costs (or gives) as a run starts
function deckRunStart(run, opts = {}) {
  if (opts.tutorial || st.mp) return;
  const { keys, spoils, brown, crew, fav, favB, under } = deckRunChips(run);
  if (under) tally('underpowered');   // UNDERPOWERED (engine/feats.js)
  deckRunCarry(run);   // INSURANCE and DEAD DROP from your last death (they come whatever's slotted now)
  // PURGE is a chip once you have the deck (Greg, 2026-11-22): no PURGE chip on, no PURGE at the start
  if (save.deck && !(keys || []).includes('PG0')) { const i = run.items.findIndex(x => x.key === 'purge'); if (i >= 0) run.items.splice(i, 1); }
  run.fav = fav != null ? fav : null; run.favB = favB || 'loot';   // your GLYPH (DECK_FAV_B)
  run.jacks = crew || {};   // CREW JACKS (DECK_JACKS): on with no chips too
  if (Object.keys(run.jacks).length) deckJackSector(run);   // (the first sector's PATCH, TUNNEL...)
  { const fav = deckFavor(run, keys || []); if (fav.length) run.map = genMap(run.seed, null, fav); }   // NEMESIS, FRESH, CASINO...: sector 1 made again with them (the map comes before the chips)
  if (!keys || !keys.length) return;
  run.chips = keys; run.spoils = spoils || 0;
  deckCharges(run);   // THE SHELL's charges, full
  if (brown) { run.brownout = brown; setTimeout(() => { if (st.run === run) setMsg(`> BROWNOUT: ${DECK_CHIPS[brown][0]} is offline this run.`, C.danger); }, 1600); }
  const di = keys.reduce((a, k) => a + (DECK_INT[k] || 0), 0);
  if (di) { run.maxInt = Math.max(1, run.maxInt + di); run.integrity = Math.max(1, Math.min(run.maxInt, run.integrity + di)); }
  if (chipOn('SPC', run) && save.deck) save.deck.spore = (save.deck.spore || 0) + 1;   // SPORE CELL: the mold on your board grows a run at a time (deckMold)
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
  deckFireEvent(run);   // INTO THE FIRE: sector 1's event (sector 1 made again, with it)
  if (chipOn('MM4', run)) run.lastPath = deckLastPath(run.seed);   // FORGET-ME-NOT
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
const shopMult = (run = st.run) => deckPriceMult(run) * (1 - 0.05 * legacyLv('market'));   // (LOYALTY CARD: THE BOARD, I and II, 5% each)
const deckPriceMult = (run = st.run) => !run || !run.chips ? 1 : (chipOn('CH1', run) ? 0.8 : 1) * (chipOn('IF1', run) ? 1 + 0.1 * (run.sector || 0) : 1);
// the UPLINK's fees (engine/runend.js uplinkMin, uplinkFee): TOLL PASS -25%
const deckUplinkMult = (run = st.run) => chipOn('TP1', run) ? 0.75 : 1;
// layer clocks (engine/run.js makeTimer): LAG +2s, SHORT FUSE -2s
const deckClock = () => (chipOn('LG2') ? 2 : 0) - (chipOn('SF2') ? 2 : 0) + jackLv('baud');   // (BAUD: a CREW JACK)
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
  deckB0yJack(lv, c);   // b0y (a CREW JACK)
  if (chipOn('SY4') && c.idx === 0 && c.hasBoss && lv.n > 1) lv.tiles[lv.safe].zd = true;
  if (!chipOn('RE1') || lv.n < 3) return;
  const ice = lv.tiles.filter(t => !t.safe && !t.loaded && !t.quantum);
  if (ice.length) pickR(ice, rngFor(st.run.seed, 'redeye', c.node.id, c.idx)).ruledOut = true;
}
// ---------- your GLYPH in a run (DECK_FAV_B) ----------
// a tap on your glyph (engine/run.js onSafe, onTrap): LOOT pays out like a $ node; COLLECTOR counts. Returns a line to add.
function deckFavTap(t) {
  const run = st.run, c = st.corp; if (!deckFavIs(t) || !c) return '';
  if (run.favB === 'loot') return ' ' + grantLoot(rngFor(run.seed, 'favloot', c.node.id, c.idx), c.tier || 1);
  if (run.favB === 'collector' && save.deck && !run.practice) {
    const n = save.deck.favTaps = (save.deck.favTaps || 0) + 1;
    if (n < 10) { persist(); return ' glyph ' + n + '/10.'; }
    save.deck.favTaps = 0; persist();
    return ' ' + deckCollectorMod(run);
  }
  return '';
}
// COLLECTOR's 10th tap: a mod you don't have (common gen and minor, by the seed), or credits when there's no room
function deckCollectorMod(run) {
  const m = pickMods(rngFor(run.seed, 'collector', run.depth || 0), modsOfKind('gen', 'minor').filter(k => !has(k)), 1)[0];
  if (m && modRoom(m.key) && !clashWith(m.key)) { addMod(m.key, 0); return 'COLLECTOR 10/10: ' + MODS[m.key].name + '.'; }
  earn(60, run); return 'COLLECTOR 10/10: no room for a mod. +60cr.';
}
// ---------- corps that come up more (Greg, 2026-11-22) ----------
// FRESH, CASINO, CLOCK, DARK (chips) and NEMESIS (THE BOARD) don't weight the map's corp picks any more: that moved every
// pick, so a seed's whole map changed. The map picks its corps as always; then each corp slot may swap to one of these,
// on a stream of its own (engine/map.js corpFavor). No chip or post: the same map as anyone's. With one: only the
// swapped slots differ. Returns [{ keys, p }]: the corps, and the chance a slot swaps to one of them. Not in the quest
// seeds (HAD3S, H3AV3N are curated), races or test seeds.
const DECK_FAVOR_P = 0.2, DECK_NEM_P = 0.12;   // (NEMESIS: one corp, about what its old 3x weight gave)
function deckFavor(run, keys = (run && run.chips) || []) {
  if (!run || run.quest || run.heaven || run.tutorial || st.mp || testSeed(run.seed)) return [];
  const out = [];
  if (postOn('nemesis') && save.nemesis && CORPS[save.nemesis]) out.push({ keys: [save.nemesis], p: DECK_NEM_P });
  for (const k of Object.keys(DECK_FAVOR)) if (keys.includes(k)) out.push({ keys: DECK_FAVOR[k].filter(c => CORPS[c]), p: DECK_FAVOR_P });
  if (keys.includes('FR5')) out.push({ keys: Object.keys(CORPS).filter(c => !corpStat(c).breached), p: DECK_FAVOR_P });   // FRESH: the ones you haven't beaten
  return out.filter(f => f.keys.length);
}
// ---------- the map chips (Greg, 2026-11-22: out of BETA) ----------
// INTO THE FIRE (was EVENTS): sector 1 gets an event too, from its own stream, so the later sectors' events stay the
// same. The map is made before the chips are known (engine/run.js startRun), so sector 1 is made again, with it.
const DECK_FIRE_SKIP = ['headfirst', 'eenymeeny'];   // (a boss on row 1, three bosses: too much for a first sector)
function deckFireEvent(run) {
  if (!chipOn('EV2', run) || run.quest || run.heaven || testSeed(run.seed)) return;
  const scales = eventScales(), next = rollEvent(run.seed, 1);
  const pool = Object.keys(SECTOR_EVENTS).filter(k => !SECTOR_EVENTS[k].quest && !EVENT_SIDE.includes(k) && !DECK_FIRE_SKIP.includes(k) && k !== next && eventWeight(k, scales) > 0).sort();
  if (!pool.length) return;
  run.map = genMap(run.seed, pool[pickEventW(pool, rngFor(run.seed, 'fire'), scales)], deckFavor(run));
}
// PIER PASS (Greg, 2026-11-22: a choice, not a node turned into a PIER, so you never lose your safehouse): once a
// sector, a market, safehouse or cache you can go to also offers [ OR GO PHISHING ] (engine/mapview.js). Take it and
// that stop is your PIER for the visit, not the stop (engine/run.js enterNode; going back in: the PIER again). Its
// catches run rarer, like DEEP WATER (engine/fishing.js fishOutcome). run.pierSec: the sector you phished in.
const deckPhishHere = (n, run = st.run) => !!(run && n && chipOn('PP2', run) && ['shop', 'repair', 'cache'].includes(n.type) && !n.exit && (n.sector || 0) === (run.sector || 0) && run.pierSec !== (run.sector || 0));
const deckPhished = (n, run = st.run) => !!(run && n && (run.phished || []).includes(n.id));
// ALMANAC: the next sector's event, a sector early. Its card comes after this sector's (engine/events.js
// closeEventCard), or when you reach the map if this sector has none (engine/run.js). Worked out from the seed, the way
// the map will make it (rollEvent). Once a sector.
function deckAlmanac(run = st.run) {
  if (!run || !chipOn('AL4', run) || run.quest || run.heaven || testSeed(run.seed)) return false;
  const s = (run.sector || 0) + 1; run.almSeen = run.almSeen || [];
  if (run.almSeen.includes(s)) return false;
  run.almSeen.push(s);
  const ev = rollEvent(run.seed, s), ev2 = rollEvent2(run.seed, s);
  if (!ev || !SECTOR_EVENTS[ev]) return false;
  st.evCard = { ev, ev2: ev2 && SECTOR_EVENTS[ev2] ? ev2 : null, sector: s, again: true, almanac: true, t0: null };
  return true;
}
// FORGET-ME-NOT: the map marks the path you took last time on this seed. Every run's path is kept (save.paths: [[seed,
// [node ids]]], the last DECK_PATHS_MAX seeds), so the chip works on seeds played before you had it.
const DECK_PATHS_MAX = 20;
function deckSavePath(run) {
  if (!run || run.tutorial || st.mp || !run.visited) return;
  const p = (save.paths || []).filter(([sd]) => sd !== run.seed);
  p.push([run.seed, run.visited.slice()]);
  save.paths = p.slice(-DECK_PATHS_MAX); persist();
}
const deckLastPath = seed => { const e = (save.paths || []).find(([sd]) => sd === seed); return e ? e[1].slice() : null; };
// a link on the last path (engine/mapview.js buildMap)
const deckWasPath = (run, a, b) => { const p = run.lastPath; if (!p) return false; const i = p.indexOf(a), j = p.indexOf(b); return (i >= 0 && p[i + 1] === b) || (j >= 0 && p[j + 1] === a); };
// ---------- CREW JACKS' boons in a run (DECK_JACKS) ----------
// every sector, the first one too (deckRunStart, deckSector): NANA's PATCHes, DIALUP's TUNNEL (and SKIP), KLUDGE's letter
function deckJackSector(run) {
  const got = [], give = (key, n, who) => { let k = 0; for (let i = 0; i < n; i++) if (addItem(key, 0)) k++; if (k) got.push(who + ' +' + (k > 1 ? k + ' ' : '') + ITEMS[key].name); };
  if (jackLv('nana', run)) give('patch', jackLv('nana', run), 'NANA');
  if (jackLv('dialup', run)) { give('tunnel', 1, 'DIALUP'); if (jackLv('dialup', run) > 1) give('skip', 1, 'DIALUP'); }
  if (jackLv('kludge', run) > 1 && benchOpen()) { const ch = benchBonusLetter(); if (ch) { benchAdd([ch]); persist(); got.push('KLUDGE +' + ch); } }
  if (got.length) setTimeout(() => { if (st.run === run) setMsg('> crew: ' + got.join(', ') + '.', C.accent); }, 2200);
  return got;
}
// BRICK: your first ICE hit each sector (LVL 2: each corp) is blocked (engine/hits.js blockHit)
function deckBrickBlock() {
  const n = jackLv('brick'), run = st.run, c = st.corp; if (!n || !c) return false;
  if (n > 1) { if (c.brickJack) return false; c.brickJack = true; return true; }
  if (run.brickSec === (run.sector || 0)) return false;
  run.brickSec = run.sector || 0; return true;
}
// NULL: once a sector, a rival comes in on 1 bar (LVL 2: it's out as it comes in) (engine/hackers.js hkSpawn)
function deckNullJack(h) {
  const n = jackLv('null'), run = st.run; if (!n || !run || run.nullSec === (run.sector || 0)) return;
  run.nullSec = run.sector || 0;
  if (n > 1) { setTimeout(() => { if (!h.out && st.run === run) hkOut(h, '*NULL was waiting. disconnected.*'); }, 1400); return; }
  h.hp = 1;
  setTimeout(() => { if (st.run === run && !h.out) setMsg('> null: ' + hkName(h.id).toLowerCase() + ' comes in on 1 bar.', hkInk('null')); }, 1400);
}
// MOTHER: market heals cost half (LVL 2: the first a sector is free) (engine/panels.js priceOf, and its buy)
const deckRepairPrice = (p, run = st.run) => { const n = jackLv('mother', run); return !n ? p : n > 1 && run.motherSec !== (run.sector || 0) ? 0 : Math.round(p / 2); };
const deckRepairBought = (run = st.run) => { if (jackLv('mother', run) > 1) run.motherSec = run.sector || 0; };
// b0y: rules out ICE till 3 maybes are left: a corp's first layer (LVL 2: every layer). Not a boss layer, and only
// layers of 5+ nodes (on smaller ones it would all but solve it). (deckLayer)
function deckB0yJack(lv, c) {
  const n = jackLv('b0y'); if (!n || lv.boss || lv.n < 5 || (n < 2 && c.idx !== 0)) return;
  const ice = lv.tiles.filter(t => !t.safe && !t.loaded && !t.quantum && !t.forked && !t.ruledOut);
  const out = shuffle(ice.slice(), rngFor(st.run.seed, 'b0yjack', c.node.id, c.idx)).slice(0, Math.max(0, ice.length - 2));
  for (const t of out) t.ruledOut = true;
  if (out.length) setTimeout(() => { if (st.lv === lv) setMsg("> b0y: it's one of these 3.", hkInk('b0y')); }, 700);
}
// POPS: one corp a sector (LVL 2: two) shows its tell on the map: ones you don't know yet, picked by the seed
function deckPopsTell(n) {
  const k = jackLv('pops'), run = st.run; if (!k || !run || !run.map || !n) return false;
  const s = n.sector || 0; run.popsTell = run.popsTell || {};
  if (!run.popsTell[s]) {
    const pool = Object.values(run.map).filter(m => m.sector === s && (m.type === 'corp' || m.type === 'final') && CORP_TELL[m.corp] && !tellKnown(m.corp)).sort((a, b) => a.id < b.id ? -1 : 1);
    run.popsTell[s] = shuffle(pool, rngFor(run.seed, 'popstell', s)).slice(0, k).map(m => m.id);
  }
  return run.popsTell[s].includes(n.id);
}
// a new sector (engine/runend.js pushOn): DECAY drops each mod a step (BUFFER keeps its step: it changes your INT)
function deckSector(run) {
  deckJackSector(run);   // CREW JACKS: NANA, DIALUP, KLUDGE
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
  const key = deckRollRipped(r, h.id), ik = deckChipItem(key);   // (HCF: its own CORE, far more often)
  if (!itemRoom(ik, 0)) { const lost = lostLoot(ik); return lost ? `> ${hkName(h.id).toLowerCase()} dropped a chip, your belt's full: ${lost}` : null; }   // (LOST LOOT)
  addItem(ik, 0); deckRipFirst();
  return `> ${hkName(h.id).toLowerCase()} dropped a chip: ${DECK_CHIPS[key][0]}${deckHave(key) ? ' (OWNED)' : ''}. it's RIPPED. ${hkName(h.id).toLowerCase()} is gonna want that back.`;
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
// ---------- the rewards-screen SPOILS chips (Greg, 2026-11-22: batch 5). engine/panels.js openReward hands these to
// openChoice: GAMBLE adds a mystery pick; HEIRLOOM, SALVAGE and AUCTION are buttons under TAKE (openChoice's alts).
// GAMBLE: one more pick, hidden till you take it: half the time a mod a step rarer, half the time one plain common gear.
function deckGambleOption(node, options) {
  const run = st.run; if (!chipOn('GB2', run)) return null;
  const r = rngFor(run.seed, 'gamble', node.id);
  if (r() < 0.5) { const m = pickMods(r, modsOfKind('gen', 'minor'), 1, options)[0]; if (m) return { key: m.key, tier: Math.min(m.tier + 1, tierCount(MODS[m.key]) - 1), mystery: true }; }
  const pool = shopGear().filter(k => ITEMS[k].rarity === 'common');
  return pool.length ? { kind: 'gear', key: pickR(pool, r), tier: 0, n: 1, mystery: true } : null;
}
// the letters a pick salvages into (its shred code: engine/bench.js shredCode)
const deckSalvageLetters = o => shredCode({ kind: o.kind === 'gear' ? 'gear' : 'mod', key: o.key }).split('').filter(ch => /[A-Z0-9]/.test(ch));
function deckRewardAlts(node) {
  const run = st.run, alts = [];
  if (chipOn('HL2', run)) alts.push({ id: 'heirloom', label: () => 'LOCKER', sub: () => 'keep it',
    why: o => o.mystery ? 'mystery' : !benchOpen() ? 'no WORKBENCH' : !benchSave().locker.some(x => !x) ? 'LOCKER full' : o.kind === 'gear' && ITEMS[o.key].chip ? 'a chip' : null,
    run: (o, c) => { const lk = benchSave().locker, i = lk.findIndex(x => !x);
      lk[i] = o.kind === 'gear' ? { kind: 'gear', key: o.key, tier: o.tier || 0, n: o.n || 1 } : { kind: 'mod', key: o.key, tier: o.tier || 0, n: 1 }; persist();
      Sound.buy(); setMsg(`> heirloom: ${(o.kind === 'gear' ? itemView(o.key) : modView(o.key)).name.toLowerCase()} is in your LOCKER.`, C.rep); c.done(); } });
  if (chipOn('SV1', run)) alts.push({ id: 'salvage', label: () => 'SALVAGE', sub: o => deckSalvageLetters(o).join(' '),
    why: o => o.mystery ? 'mystery' : !benchOpen() ? 'no WORKBENCH' : null,
    run: (o, c) => { const got = deckSalvageLetters(o); benchAdd(got); persist();
      Sound.comp(); setMsg(`> salvaged: ${got.join(' ')} for the WORKBENCH.`, C.accent); c.done(); } });
  if (chipOn('AU2', run)) { let n = 0; const price = () => costInt(3) * ((run.sector || 0) + 1) * (n + 1);   // (30cr x the sector, more each time)
    alts.push({ id: 'auction', label: () => 'REROLL', sub: () => price() + 'cr', why: () => !canSpend(price()) ? 'need ' + price() + 'cr' : null,
      run: (o, c) => { const p = price(), r = rngFor(run.seed, 'auction', node.id, n), others = c.options.filter(x => x !== o);
        const nu = r() < ECON.reward.gear ? rewardGear(r) : pickMods(r, modsOfKind('gen', 'minor'), 1, others)[0];
        if (!nu) return Sound.deny();
        run.credits -= p; n++; c.swap(nu); Sound.buy(); setMsg(`> auction: -${p}cr. a new pick.`, C.money); } }); }
  return alts;
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
  if (!chipOn('CP0', run) || run.checkpointUsed || !(st.lv || run.diedPier) || st.mp) return false;   // (a bite at the PIER too: Greg, 2026-11-23)
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
// SELF DESTRUCT (CRASH, Greg 2026-11-22: "keep it", the CRASH chip that shreds everything): die and every mod and gear
// stack on you goes up, its shred letters landing at your WORKBENCH (engine/bench.js shredCode, the same letters the
// bench would give). Chips and quest gear don't. Only on a death: a cash-out keeps your things. (engine/runend.js endRun)
function deckSelfDestruct(run) {
  if (!chipOn('SD6', run) || run.practice) return;
  const things = run.mods.filter(k => MODS[k]).map(k => ({ kind: 'mod', key: k }))
    .concat(run.items.filter(o => ITEMS[o.key] && !deckItemChip(o.key) && !ITEMS[o.key].quest).map(o => ({ kind: 'gear', key: o.key })));
  if (!things.length) return;
  if (!benchOpen()) return FEAT_QUEUE.push({ head: 'SELF DESTRUCT', lines: [`${things.length} things went up.`, 'no WORKBENCH: the letters are lost.'] });
  const got = things.flatMap(o => shredCode(o).split('').filter(ch => /[A-Z0-9]/.test(ch)));
  benchAdd(got); persist();
  FEAT_QUEUE.push({ head: 'SELF DESTRUCT', lines: [`${things.length} things went up: ${got.length} letters.`, 'they landed at your WORKBENCH.'] });
}
// give.chip (SUDO, GC4; Greg 2026-11-22): name a chip you've shredded at a WORKBENCH and it's on your belt (cash out to
// keep it). Not a BOSS chip, not one THE BOARD or the deck gives (DECK_NO_DROP), not BETA. Charges by its rarity, like give.mod.
const deckGiveChipOk = k => !!DECK_CHIPS[k] && DECK_CHIPS[k][1] !== 'boss' && !DECK_NO_DROP.includes(k) && !deckBeta(k) && (save.shredded || {})[deckChipItem(k)] != null;
const deckGiveChipList = () => Object.keys(DECK_CHIPS).filter(deckGiveChipOk).sort().map(k => ({ v: k, hint: DECK_CHIPS[k][0] + ' · ' + DECK_CHIPS[k][2] }));
const deckGiveChipCost = k => DECK_GIVE_COST[DECK_CHIPS[k][2]] || 1;
function deckGiveChip(a) {
  const run = shellNeedRun();
  if (!a[0]) { const l = deckGiveChipList(); return { out: l.length ? 'give.chip <chip>. yours to name (shredded):\n' + l.map(o => `  ${o.v.padEnd(5)} ${o.hint}`).join('\n') : 'nothing yet: shred a chip at a WORKBENCH first.', free: true }; }
  const k = String(a[0]).toUpperCase();
  if (!DECK_CHIPS[k]) throw new Error('not a chip: ' + a[0]);
  if (!deckGiveChipOk(k)) throw new Error(`${DECK_CHIPS[k][0]}: shred one at a WORKBENCH first` + (DECK_CHIPS[k][1] === 'boss' || DECK_NO_DROP.includes(k) ? ' (and it can\'t be given).' : '.'));
  if (!addItem(deckChipItem(k), 0)) throw new Error('no room on the belt.');
  run.hacked = true; Sound.buy();
  return `give.chip: ${DECK_CHIPS[k][0]} on your belt. cash out to keep it.`;
}
// SPOILS (engine/panels.js openReward): 0 the rewards, 1 a heal, 2 cash
const deckSpoils = run => chipOn('OF1', run) ? 3 : chipOn('PT1', run) ? 4 : chipOn('SP3', run) ? run.spoils || 0 : 0;   // (3 OFFERING, 4 PROTECTION: chips)
// (THE SHELL's charges and the chips' commands: engine/deck_shell.js)

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
// save.deck: { chips: { key: how many }, slots: { socket: key }, order: [sockets, oldest first], spoils, fav, favB (GLYPH),
//   crew: [crew ids: the CREW JACKS, in order], off: [posts switched off: engine/save.js postOn], overclock, blown }
let DECK = null, DECK_DEV = null;
const deckView = () => ({ view: 'board', scroll: 0, list: { top: 0 }, sel: { kind: 'socket', id: 'BT1' }, selT: 0, pick: null, carry: null,
  bits: [0, 0, 0, 0, 0, 0, 0, 0], tick: null, msg: null, leave: 0 });
function deckDev() {
  if (!DECK_DEV) DECK_DEV = Object.assign(deckView(), {
    real: false, rep: 2400, mk: 2, fuse: false, blown: false, spoils: 0, glyph: Math.max(0, ART_GLYPHS.findIndex(g => g.name === 'THE WATCHER')), favB: 'loot', crew: new Set(['pops']),
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
const deckFreshSave = () => Object.assign(JSON.parse(JSON.stringify(DECK_START)), { spoils: 0, fav: null, favB: 'loot', crew: [], off: [], overclock: false, blown: false });
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
    real: true, mk: deckMkNow(), fuse: legacyLv('fuse') > 0, blown: !!sd.blown, spoils: sd.spoils || 0, glyph: sd.fav != null && ART_GLYPHS[sd.fav] ? sd.fav : null, favB: DECK_FAV_B[sd.favB] ? sd.favB : 'loot',   // (glyph: an ART_GLYPHS index, saved as fav)
   
    crew: new Set((sd.crew || []).map(c => String(c).toLowerCase()).filter(c => DECK_JACKS[c])), chips: Object.assign({}, sd.chips), slots: Object.assign({}, sd.slots), order: (sd.order || []).slice(),
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
  return { chips: d.chips, slots: d.slots, order: d.order, spoils: d.spoils, fav: d.glyph, favB: d.favB, crew: [...d.crew],
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
  if (deckFull(d)) best('fullDeck', 1, true);   // FULL HOUSE
  featSweep();   // COLLECTOR (engine/feats.js)
}
// Every open socket that takes chips has one (GLYPH takes none).
const deckFull = d => DECK_SOCKETS.filter(s => s.g !== 'glyph' && deckOpen(s.mk)).every(s => d.slots[s.id]);
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
const deckOwned = () => DECK.real || DECK.train ? Object.keys(DECK.chips).filter(k => DECK_CHIPS[k] && DECK.chips[k] > 0) : Object.keys(DECK_CHIPS);
const deckSock = id => DECK_SOCKETS.find(s => s.id === id);
const deckSlotOf = key => Object.keys(DECK.slots).find(k => DECK.slots[k] === key);
const deckOpen = mk => mk <= DECK.mk && !(mk === 4 && (!DECK.fuse || DECK.blown));
// KITs (Greg, 2026-11-22): BOOT chips that start you with a bundle, up to 3 mods and 2 kinds of gear, so they never fill
// your mod bar or your belt (PURGE has a slot). Only the KIT socket (BT1) takes one, so you never run two. The rest of
// BOOT (one mod, one gear stack, or no items) goes in either BOOT socket.
const DECK_KIT_SOCKET = 'BT1';   // (the KITs: kit in their entries, DECK_KITS: data/chips.js)
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
  const tap = d.real ? legacyLv('power') : 0;   // POWER TAP (THE BOARD: +1, II +2)
  const cellB = d.slots.PSU ? (d.overclock ? Math.max(15, deckCellPower(d.slots.PSU)) : deckCellPower(d.slots.PSU)) + spike + tap : 0, fuseB = deckOpen(4) ? DECK_FUSE_PWR + (d.real ? 4 * Math.min(1, legacyLv('fuse2')) : 0) : 0;   // (FUSE II: THE BOARD, +4)
  const left = { cell: cellB, fuse: fuseB };
  for (const id of d.order) {
    const key = d.slots[id], s = deckSock(id); if (!key || !deckOpen(s.mk)) continue;   // a dark band's chips cost nothing
    const c = deckChipCost(key), p = deckPool(s);
    if (c <= left[p]) { left[p] -= c; on.add(id); } else off.push(id);
  }
  const crewOn = [], crewOff = [];   // CREW JACKS: after the chips, in the order they went in (1 power, 2 at LVL 2)
  for (const id of deckJacked()) { const c = deckCrewLv(id); if (c <= left.cell) { left.cell -= c; crewOn.push(id); } else crewOff.push(id); }
  return { budget: cellB, left: left.cell, used: cellB - left.cell, on, off, crewOn, crewOff,
    fuse: deckOpen(4) ? { budget: fuseB, left: left.fuse, used: fuseB - left.fuse } : null };
}
const deckLeft = (pw, s) => deckPool(s) === 'fuse' ? (pw.fuse ? pw.fuse.left : 0) : pw.left;
function deckSlot(key, sid) {
  const d = DECK, was = d.slots[sid], other = deckSlotOf(key), [name, grp, , cost] = DECK_CHIPS[key];
  if (other) { delete d.slots[other]; d.order = d.order.filter(i => i !== other); }
  d.slots[sid] = key; d.order = d.order.filter(i => i !== sid).concat(sid);
  d.carry = null; deckSelect({ kind: 'socket', id: sid });
  if (d.real) tally('chipsSlotted', 1, true);   // PLUGGED IN (engine/feats.js)
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
  if (d.real && !save.deck.popsSeen) {   // the first time: POPS offers the training; ROOT's card waits till after it (Greg, 2026-11-20)
    save.deck.popsSeen = true; persist();
    CALL_QUEUE.push({ who: 'pops', lines: ["your deck, kid. there's a lot to go over here.", 'need me to hold your hand?', '(HOW TO PLAY > TRAINING has it too.)'],
      btns: [{ text: '[ SHOW ME ]', onTap: () => startDeckTraining('deck') }, { text: '[ SKIP ]', onTap: () => { queueCall('pops', deckTrainLines()); rootStart(); } }] });
    return;
  }
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
  if (d.train) { if (k === 'escape') deckTutQuit(); return true; }   // (the deck training: engine/tutorial.js)
  if (k === 'escape') { if (d.pick || d.cpu) { d.pick = null; d.cpu = null; Sound.tick(); } else if (d.carry) d.carry = null; else deckLeave(); return true; }
  const dd = k === 'arrowup' ? -1 : k === 'arrowdown' ? 1 : 0;
  if (d.pick && d.pick.keys) { if (dd) { d.pick.keys.move(dd); return true; } if (k === 'enter' || k === ' ') { d.pick.keys.go(); return true; } }
  if (dd) { if (d.keyStep) d.keyStep(dd); else if (st.scroll) st.scroll(dd); return true; }
  return false;
}

// (the show and the drawing: engine/deck_screen.js)
