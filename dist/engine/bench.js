// NeoN+1 engine/bench.js: THE WORKBENCH (the user, 2026-11-03; the mockups: docs/mockups/workshop_v3.html).
// A THE BOARD post (WORKBENCH) puts one in every safehouse: after the safehouse's pick you go straight to the bench
// (and going back in there brings you back to it). SHRED gear, mods and loot into components (the letters of their
// 3-letter short codes, sometimes a bonus letter, a * wildcard or a digit), then spell a code on the keyboard to BUILD
// it. What you build goes up to the safehouse LOCKER (5 slots, kept between runs); when that's full you equip it.
// Components are banked between runs too (no limit for now). save.bench = { letters, locker, pins, popsSeen }.
// The screen is a full panel on the grid (tabs BUILD / SHRED / BOOK / LOCKER). The keyboard is its own layer, drawn
// in pixels over the bottom of the screen (render.js calls benchKeys); it slides up on BUILD and drops away elsewhere.
// A digit after a code (the x slot) is a chance to build that many (gear).
'use strict';
NEON_FILES.push(['engine/bench.js', 'v15.41']);

const BENCH = {
  bonus: 0.25,   // a shred: the chance of one random bonus letter (weighted by how often recipes use it)
  wild: { scrap: 0, common: 0.02, rare: 0.05, epic: 0.08, legendary: 0.12, exotic: 0.2 },    // ...of a * (by its rarity)
  digit: { scrap: 0, common: 0, rare: 0.04, epic: 0.08, legendary: 0.15, exotic: 0.25 },   // ...of a digit 2-9
  digits: [[1, 45], [2, 40], [3, 25], [4, 12], [5, 8], [6, 6], [7, 4], [8, 3], [9, 2]],     // which digit (weights; 1: chip codes, never the x: Greg, 2026-11-21)
  multi: 0.5,    // a digit in the x slot: the chance you get that many
  blank: { chip: 0.4, corrupt: 0.1 },   // a shred's chance of a BLANK (an empty chip): a chip, corrupted software
  near: 0.5,     // RUN ANYWAY on a word one letter off a recipe
  unknown: 0.1,  // ...on a word that's nothing (a common / rare recipe, or loot)
  arrive: 3,     // components the safehouse leaves you when you get there
  locker: 5, pins: 2,
  slideMs: 420,
  build: { charge: 950, split: 260, form: 420, hold: 520, fly: 560 },   // the build, in steps (ms)
  shred: { jumble: 950, suck: 320, drop: 170, fly: 520 },                // the shred
};
const BENCH_MISS = { fg: '#ff4fd8', bg: '#4a1240' };   // a letter you're missing (magenta: red is for the DIVINE letters)
// ROOT's letters (its quest, PAPERWORK: engine/quests.js): lowercase r / o / t, on the quest color. They sit in the special
// row, no recipe uses them, and they never burn: a wrong spell gives them back. In the slots they open a 4th letter slot.
const isRootCh = ch => /^[a-z]$/.test(ch);
const letterChip = ch => isRootCh(ch) ? { fg: C.bg, bg: C.rep } : chipOf(letterTier(ch));
const BENCH_KB = ['1234567890', 'QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
// A BLANK (Greg, 2026-11-21): an empty chip. It goes in the extra slot (the small 2x2 after the letters; inside, slot 4), and then
// the three slots spell a chip's code (digits too: CD2, LW1). One BLANK, one chip. From shredding chips, now and then.
const BENCH_BLANK = '#', isBlank = ch => ch === BENCH_BLANK, BENCH_BLANK_X = 23;   // (its x on the BUILD screen: benchBuildLines)
const BENCH_SPECIAL = ['*', BENCH_BLANK];   // the special row over the keyboard (the DIVINE letters go here later)
const isMult = ch => /^[2-9]$/.test(ch);   // a multiplier digit (0 is a letter: 0DAY)
const isDigit = ch => /^[1-9]$/.test(ch);

// ---- recipes: every short code you can spell. Shop gear (no loot, quest gear or CALLs) and general / minor / exotic
// mods (no corp mods), and your deck's chips (their code: a BLANK makes them). Blueprints (save.bench.blueprints, by
// code; from shredding one: benchShred): every exotic. First come wins a shared code.
let BENCH_RECIPES = null, BENCH_USE = null;
function benchRecipes() {
  if (BENCH_RECIPES) return BENCH_RECIPES;
  const r = {};
  for (const [key, it] of Object.entries(ITEMS)) {
    if (it.value || it.quest || it.bag || it.fish || it.hunt || it.chip || it.only || it.noBench || key.startsWith('call')) continue;   // (only: G0D.exe, dev only)   // (chip: your deck's, engine/deck.js)   // (hunt: HAD3S gear, not built at the bench yet)
    const code = itemShort(key);
    if (code.length === 3 && !r[code]) r[code] = { kind: 'gear', key, code };
  }
  for (const [key, m] of Object.entries(MODS)) {
    if (!['gen', 'minor', 'exotic'].includes(m.kind) || m.hidden || m.quest || !m.short || m.short.length !== 3) continue;
    if (!r[m.short]) r[m.short] = { kind: 'mod', key, code: m.short };
  }
  // chips (engine/deck.js DECK_CHIPS): a 3-character code with a digit. Not RIPPED ones (stolen only), not the ones the
  // deck or a quest gives (DECK_NO_DROP), not BOSS chips, not BETA.
  for (const [k, c] of Object.entries(DECK_CHIPS)) {
    if (!/^[A-Z0-9]{3}$/.test(k) || !/[0-9]/.test(k) || r[k] || deckIsRipped(k) || DECK_NO_DROP.includes(k) || c[1] === 'boss' || deckBeta(k)) continue;
    r[k] = { kind: 'chip', key: deckChipItem(k), code: k, chip: k };
  }
  return (BENCH_RECIPES = r);
}
// A chip recipe shows (in the BOOK, the matches) once you've seen that chip (Greg, 2026-11-21): on your belt, in your
// deck, for sale at a market, or offered by a corp boss (markSeen: engine/deck.js deckShopChip, deckBossChip).
const recipeKnown = rc => rc.kind !== 'chip' || !!save.seen[rc.key] || deckHave(rc.chip) > 0;
// What needs a blueprint: exotics. (Chips above rare did too till Greg, 2026-11-21, v15.22: any chip you've seen builds
// if you have the parts. recipeKnown is their gate.)
const recipeNeedsBp = rc => recipeDef(rc).rarity === 'exotic';
// How many recipes use each letter: its rarity (and how often it drops as a bonus).
function benchUse() {
  if (BENCH_USE) return BENCH_USE;
  const u = {};
  for (const [code, rc] of Object.entries(benchRecipes())) if (rc.kind !== 'chip') for (const ch of code) u[ch] = (u[ch] || 0) + 1;   // (not the chips: a letter's rarity stays what it was)
  return (BENCH_USE = u);
}
// A component's rarity (its chip): used by 10+ recipes common, 5+ rare, 2+ epic, else legendary; digits legendary; * exotic.
function letterTier(ch) {
  if (ch === '*') return 'exotic';
  if (isBlank(ch)) return 'epic';
  if (ch === '1') return 'legendary';
  if (isMult(ch)) return 'legendary';
  const n = benchUse()[ch] || 0;
  return n >= 10 ? 'common' : n >= 5 ? 'rare' : n >= 2 ? 'epic' : 'legendary';
}
const benchBonusLetter = () => { const u = benchUse(), keys = Object.keys(u).filter(ch => /[A-Z0]/.test(ch)); return pickWeighted(keys, ch => u[ch], Math.random); };
const benchDigit = () => String(pickWeighted(BENCH.digits, d => d[1], Math.random)[0]);
const recipeDef = rc => rc.kind === 'mod' ? MODS[rc.key] : ITEMS[rc.key];
const recipeView = rc => rc.kind === 'mod' ? modView(rc.key, 0) : itemView(rc.key, 0);
const benchBp = code => !!(benchSave().blueprints || {})[code];
const recipeLocked = rc => recipeNeedsBp(rc) && !benchBp(rc.code);
// The BOOK's order: gear, then mods, each by rarity.
const BOOK_KIND = { gear: 0, mod: 1, chip: 2 };
// The BOOK's sub-tabs (Greg, 2026-11-21): GEAR, MODS, CHIPS, each its own list and its own found count.
const BOOK_TABS = [['gear', 'GEAR'], ['mod', 'MODS'], ['chip', 'CHIPS']];
const bookKind = () => (st.bench && st.bench.bkKind) || 'gear';
const bookList = () => bookCodes().filter(c => benchRecipes()[c].kind === bookKind());
function bookPickKind(k) {
  const b = st.bench; if (!b || b.bkKind === k) return;
  b.bkKind = k; b.bkSel = 0; b.bkArea = { top: 0 }; b.bkT = performance.now(); Sound.tick();
  const codes = bookList(), R = benchRecipes(), i = codes.findIndex(c => save.seen[R[c].key] && recipeKnown(R[c]));
  if (i > 0) b.bkSel = i;
}
const bookCodes = () => Object.values(benchRecipes()).sort((a, b) => BOOK_KIND[a.kind] - BOOK_KIND[b.kind]
  || RARITY_ORDER.indexOf(recipeDef(a).rarity) - RARITY_ORDER.indexOf(recipeDef(b).rarity)).map(rc => rc.code);

function benchSave() {
  if (!save.bench) save.bench = { letters: {}, locker: [], pins: [] };
  const b = save.bench;
  b.letters = b.letters || {}; b.pins = b.pins || [];
  b.locker = b.locker || [];
  while (b.locker.length > benchLockerMax() && !b.locker[b.locker.length - 1]) b.locker.pop();   // (slots past the max go once they're empty)
  while (b.locker.length < benchLockerMax()) b.locker.push(null);
  return b;
}
// The LOCKER's slots: 5, 10 with THE BOARD's BIG LOCKER (engine/save.js LEGACY). Lose the post (a progression wipe) and
// the slots past 5 stay till you take out what's in them.
const benchLockerMax = () => BENCH.locker + (legacyLv('biglocker') > 0 ? 5 : 0);
const benchOpen = () => legacyLv('bench') > 0;
const benchAdd = list => { const l = benchSave().letters; for (const ch of list) l[ch] = (l[ch] || 0) + 1; };
// The safehouse leaves you a few components when you get there (the user, 2026-11-04).
function benchArrive() { const got = []; for (let i = 0; i < BENCH.arrive; i++) got.push(benchBonusLetter()); benchAdd(got); persist(); return got; }

// ---- the components: the bank (save) minus what's sitting in the slots (slots 0-2: letters, 3: the x digit)
const benchUsed = ch => st.bench ? st.bench.slots.filter(s => s === ch).length : 0;
const benchHave = ch => (benchSave().letters[ch] || 0) - benchUsed(ch);
const benchCount = () => Object.values(benchSave().letters).reduce((a, n) => a + n, 0);
// The letters a code still needs (counting what's in the slots as yours).
function benchMissing(code) {
  const rc = benchRecipes()[code]; if (rc && rc.kind === 'chip') code += BENCH_BLANK;   // (a chip takes a BLANK too)
  const left = Object.assign({}, benchSave().letters);
  return code.split('').filter(ch => (left[ch] > 0 ? (left[ch]--, false) : true)).join('');
}
const missText = m => m.replace(BENCH_BLANK, '') + (m.includes(BENCH_BLANK) ? (m.length > 1 ? ' ' : '') + '+BLANK' : '');
const benchWord = () => st.bench.slots.slice(0, 3).map(s => s || '').join('');
// What the three slots spell: partial / ok (a recipe) / pick (a * fits several) / near (one letter off) / bad / lock.
// ROOT's letters in the slots: the x slot is a 4th letter slot, and the word is ROOT's (engine/quests.js ROOT_WORD; a *
// fills in for one). rpartial / root (it's right) / rbad.
const benchRootMode = () => !!st.bench && st.bench.slots.some(isRootCh);
// A BLANK in its slot: the three slots spell a chip (the chip recipes only; digits go in the letter slots).
const benchChipMode = () => !!st.bench && isBlank(st.bench.slots[4]);
// The recipes the slots can spell now: chips with a BLANK in, everything else without (and only chips you've had).
const benchPool = () => { const chip = benchChipMode(); return Object.values(benchRecipes()).filter(rc => (rc.kind === 'chip') === chip && recipeKnown(rc)); };
function benchJudge() {
  if (benchRootMode()) {
    const s4 = st.bench.slots.slice(0, 4);
    if (s4.some(x => !x)) return { kind: 'rpartial' };
    return s4.every((x, i) => x === ROOT_WORD[i] || x === '*') ? { kind: 'root' } : { kind: 'rbad', w: s4.join('') };
  }
  const s = st.bench.slots.slice(0, 3);
  if (s.some(x => !x)) return { kind: 'partial' };
  const w = s.join(''), R = benchRecipes(), pool = benchPool();
  if (w.includes('*')) {
    const fit = pool.filter(rc => !recipeLocked(rc) && [0, 1, 2].every(i => w[i] === '*' || rc.code[i] === w[i])).map(rc => rc.code);
    return fit.length === 1 ? { kind: 'ok', code: fit[0], wild: true } : fit.length ? { kind: 'pick', fit, w } : { kind: 'bad', w };
  }
  if (R[w] && pool.includes(R[w])) return recipeLocked(R[w]) ? { kind: 'lock', w, chip: R[w].kind === 'chip' } : { kind: 'ok', code: w };
  if (R[w] && R[w].kind === 'chip' && recipeKnown(R[w])) return { kind: 'blank', w };   // a chip's code, no BLANK in
  if (benchChipMode() && R[w] && R[w].kind !== 'chip') return { kind: 'notchip', w };
  const near = pool.find(rc => !recipeLocked(rc) && [0, 1, 2].filter(i => rc.code[i] === w[i]).length === 2);
  return near ? { kind: 'near', code: near.code, w } : { kind: 'bad', w };
}
// The codes that fit what's typed so far (a * fits anything).
function benchMatches() {
  const s = st.bench.slots;
  if (!s.slice(0, 3).some(Boolean) || benchRootMode()) return [];
  const pool = benchChipMode() ? benchPool() : benchPool().concat(Object.values(benchRecipes()).filter(rc => rc.kind === 'chip' && recipeKnown(rc)));   // (no BLANK in: chips you've had come after, and tap: fill puts a BLANK in)
  return pool.filter(rc => [0, 1, 2].every(i => !s[i] || s[i] === '*' || rc.code[i] === s[i]))
    .sort((a, b) => !benchMissing(b.code) - !benchMissing(a.code)).slice(0, 3).map(rc => rc.code);
}
const benchBusy = () => { const b = st.bench; return !b || !!b.anim || !!b.shredAnim || st.transitioning || !!st.wipe; };

// ---- open / leave
function openBench(node) {
  benchSave();
  rootLettersGone();   // (ROOT moved in: its spare r / o / t leave the bench. engine/quests.js)
  node.bench = true;   // going back in here brings you back to the bench (engine/run.js canGoBack)
  st.bench = { node, tab: 'build', slots: [null, null, null, null, null], slotT: [0, 0, 0, 0, 0], slotX: [10, 14, 18], slotY: 15, fx: [], kb: { up: true, t0: performance.now() + 380 },
    log: ['> workbench online.'], shSel: 0, shArea: { top: 0 }, bkSel: 0, bkT: 0, bkArea: { top: 0 }, lkView: 'take', lkSel: 0, stSel: 0, press: null,
    anim: null, shredAnim: null, flash: null };
  benchPanel();
  const bs = benchSave();
  rootStart();   // ROOT's quest starts here, or in your deck (engine/quests.js)
  if (!bs.popsSeen) {   // the first time: POPS explains it
    bs.popsSeen = true; persist();
    queueCall('pops', (benchCount() ? ["kid. a workbench. nice.", "shred what you carry: it comes apart into components.", "spell a code with them and it builds. what you build waits in the locker, run after run."]
      : ["kid. a workbench. nice.", "you've got no components yet. shred something: gear, a mod, loot.", "then spell a code and it builds. it waits in the locker, run after run."]).concat(benchShellLines()));
  }
}
// POPS's last line on your first bench (Greg, 2026-11-20): shredding epic and up unlocks it for THE SHELL's give.mod /
// give.gear (engine/deck.js deckGiveTiers). Before ROOT, he keeps the shell a mystery.
function benchShellLines() {
  return typeof rootOn === 'function' && rootOn() ? ["shred epic and better and THE SHELL can give it back to you later: give.mod, give.gear."]
    : ["shredding epic and better gear and mods can get you other bonuses, like for shell commands.", "don't know what a shell is? just keep playing. you'll find out."];
}
function benchPanel() {
  openPanel('WORKBENCH', benchLines, null, { full: true });
  const h = k => benchKey(k);
  h.typing = true;   // letters go to the bench first (not M / N: mute, music)
  st.keyHandler = h;
}
function benchLeave() {
  const b = st.bench;
  if (!b || benchBusy()) return;
  b.kb = { up: false, t0: performance.now() };
  persist();
  swapTo(() => { st.bench = null; toMap(); });
}
function benchTab(t) {
  const b = st.bench;
  if (!b || b.tab === t || benchBusy()) return;
  if (b.tab === 'build') b.kb = { up: false, t0: performance.now() };
  swapTo(() => {
    b.tab = t;
    benchPanel();
    if (t === 'build') b.kb = { up: true, t0: performance.now() + 120 };
    if (t === 'build' && b.pending) { benchFill(b.pending); b.pending = null; }   // the BOOK's [ BUILD ]: its letters go in
    if (t === 'book') {   // open on something you've found
      b.bkT = performance.now();
      const codes = bookCodes(), R = benchRecipes();
      if (!b.bkKind) b.bkKind = 'gear';
      const bc = bookList(); b.bkSel = clamp(b.bkSel, 0, bc.length - 1);
      if (!save.seen[R[bc[b.bkSel]].key]) b.bkSel = Math.max(0, bc.findIndex(c => save.seen[R[c].key] && recipeKnown(R[c])));
    }
  });
}
const benchSay = line => { const b = st.bench; if (b) { b.log.push(line); b.log = b.log.slice(-12); } };

// ---- the slots
function benchPlace(ch, i) {
  const b = st.bench;
  if (!b || b.tab !== 'build' || benchBusy()) return;
  if (benchHave(ch) <= 0) return Sound.deny();
  if (isRootCh(ch) || benchRootMode()) {   // ROOT's letters: four letter slots, no digits, no BLANK
    if (isMult(ch) || ch === '1' || isBlank(ch) || b.slots[4]) return Sound.deny();
    if (b.slots[3] && isMult(b.slots[3])) benchUnplace(3, true);
    if (i == null || i > 3 || b.slots[i]) i = b.slots.slice(0, 4).findIndex(s => !s);
    if (i < 0) return Sound.deny();
    b.slots[i] = ch; b.slotT[i] = performance.now();
    return Sound.lamp();
  }
  if (isBlank(ch)) {   // the BLANK slot: a chip. A digit waiting in the x slot can't stay (chips don't stack)
    if (b.slots[4]) return Sound.deny();
    if (b.slots[3]) benchUnplace(3);
    b.slots[4] = ch; b.slotT[4] = performance.now();
    return Sound.lamp();
  }
  if (benchChipMode()) {   // spelling a chip: digits are letters now (CD2, LW1); no x slot
    if (i == null || i > 2 || b.slots[i]) i = b.slots.slice(0, 3).findIndex(s => !s);
    if (i < 0) return Sound.deny();
    b.slots[i] = ch; b.slotT[i] = performance.now();
    return Sound.lamp();
  }
  if (i === 4) i = 3;   // (the extra slot: a digit dropped on it)
  if (isMult(ch)) i = 3;   // digits 2-9 go in the x slot
  else if (ch === '1') return Sound.deny();
  if (i == null) i = b.slots.slice(0, 3).findIndex(s => !s);
  if (i < 0 || (i === 3 && !isMult(ch)) || (i < 3 && isMult(ch))) return Sound.deny();
  b.slots[i] = ch; b.slotT[i] = performance.now();
  Sound.lamp();
}
function benchUnplace(i, quiet = false) {
  const b = st.bench, ch = b.slots[i];
  if (!ch) return;
  b.slots[i] = null;
  if (!quiet && (i < 3 || !isMult(ch))) { b.fx.push({ ch, x: i < 3 ? b.slotX[i] : BENCH_BLANK_X, y: b.slotY, t0: performance.now() }); Sound.tick(); }
  if (!benchRootMode() && b.slots[3] && !isMult(b.slots[3])) benchUnplace(3, quiet);   // the last of ROOT's letters out: the 4th slot is the x slot again
  if (i === 4) for (const j of [0, 1, 2]) if (isDigit(b.slots[j])) benchUnplace(j, quiet);   // the BLANK out: no more digits in the letter slots
}
function benchFill(code) {
  const b = st.bench, chip = benchRecipes()[code] && benchRecipes()[code].kind === 'chip';
  [0, 1, 2, 3, 4].forEach(i => benchUnplace(i, true));
  const miss = benchMissing(code);
  if (miss) { benchSay(`> ${code}: need ${miss.split('').map(ch => isBlank(ch) ? 'a BLANK' : ch).join(' ')}.`); return Sound.deny(); }
  if (chip) { b.slots[4] = BENCH_BLANK; b.slotT[4] = performance.now(); }
  code.split('').forEach((ch, i) => { b.slots[i] = ch; b.slotT[i] = performance.now() + i * 90; });
  Sound.lamp();
}
// Put what you built away: loot to the LOOT bag; the locker (gear stacks); else straight onto you. null: no room.
function benchGive(rc, n = 1) {
  if (rc.kind === 'loot') { for (let k = 0; k < n; k++) addLoot(rc.key, 0); return 'loot'; }
  if (rc.kind === 'chip') { const sd = save.deck || (save.deck = deckFreshSave()); sd.chips[rc.chip] = 1; return 'deck'; }   // (built at a safehouse: it's home)
  const lk = benchSave().locker;
  if (rc.kind === 'gear') {
    const s = lk.find(x => x && x.kind === 'gear' && x.key === rc.key && (x.tier || 0) === 0 && x.n + n <= STACK_MAX);
    if (s) { s.n += n; return 'locker'; }
  }
  const e = lk.findIndex(x => !x);
  if (e >= 0) { lk[e] = { kind: rc.kind, key: rc.key, tier: 0, n: rc.kind === 'gear' ? n : 1 }; return 'locker'; }
  if (rc.kind === 'gear') { let k = 0; while (k < n && itemRoom(rc.key, 0) && addItem(rc.key, 0)) k++; return k ? 'belt' : null; }
  if (clashWith(rc.key) || !modRoom(rc.key)) return null;
  addMod(rc.key, 0);
  return 'tray';
}
// BUILD: the components are spent now; the show (b.anim) plays out over a couple of seconds.
function benchBuild(code = null, force = false) {
  const b = st.bench;
  if (!b || benchBusy()) return;
  const j = benchJudge();
  if (j.kind === 'root') {   // ROOT's word: the letters (and a *) are spent, the build charges, then it's hijacked (rootSigned)
    const letters = benchSave().letters;
    for (const ch of b.slots) { letters[ch]--; if (letters[ch] <= 0) delete letters[ch]; }
    b.anim = { t0: performance.now(), root: true, word: b.slots.join(''), slots: b.slots.slice(0, 4), x: b.slotX.concat(BENCH_BLANK_X), y: b.slotY };
    b.slots = [null, null, null, null, null];
    persist();
    return Sound.charge(BENCH.build.charge / 1000);
  }
  if (benchRootMode()) return Sound.deny();   // (ROOT's letters never go into anything else)
  if (!code) {
    if (j.kind === 'ok') code = j.code;
    else if ((j.kind === 'near' || j.kind === 'bad') && force) code = '?';
    else return Sound.deny();
  }
  const word = benchWord(), letters = benchSave().letters, mult = b.slots[3];
  let rc = code === '?' ? null : benchRecipes()[code];
  if (code === '?') {   // RUN ANYWAY: a near miss might come out as its recipe; nonsense, rarely, as something (or loot)
    const luck = Math.random() < (j.kind === 'near' ? BENCH.near : BENCH.unknown);
    if (luck && j.kind === 'near') rc = benchRecipes()[j.code];
    else if (luck) {
      const pool = Object.values(benchRecipes()).filter(x => x.kind !== 'chip' && !recipeLocked(x) && ['common', 'rare'].includes(recipeDef(x).rarity))
        .concat(Object.keys(ITEMS).filter(k => ITEMS[k].value && !ITEMS[k].fish && !ITEMS[k].bag).map(key => ({ kind: 'loot', key, code: itemShort(key) })));
      rc = pickR(pool, Math.random);
    }
  }
  let n = 1;
  if (rc && mult && rc.kind === 'gear' && Math.random() < BENCH.multi) n = +mult;
  let where = null;
  if (rc) {
    where = benchGive(rc, n);
    if (!where) { benchSay('> no room: the locker and your tray are full.'); return Sound.deny(); }
    markSeen(rc.key);
  }
  const view = rc ? (rc.kind === 'mod' ? modView(rc.key, 0) : itemView(rc.key, 0)) : null;
  const spent = b.slots.slice(0, 3).concat(rc && rc.kind === 'mod' ? [] : [mult], [b.slots[4]]).filter(Boolean);   // (slot 4: the BLANK, spent on a chip)
  const free = !!(st.run && st.run.freeBuild); if (free) st.run.freeBuild = false;   // FREE PRESS (a chip: engine/deck.js): the first build uses no letters
  if (!free) for (const ch of spent) { letters[ch]--; if (letters[ch] <= 0) delete letters[ch]; }
  b.anim = { t0: performance.now(), word, slots: b.slots.slice(0, 3), x: b.slotX.slice(), y: b.slotY, rc, view, n, where, lucky: code === '?', mult };
  b.slots = [null, null, null, null, null];
  persist();
  Sound.charge(BENCH.build.charge / 1000);
}
// The build's end: the log line, the landing (a flash on the LOCKER tab or the [£]).
function benchBuildDone(a) {
  const b = st.bench;
  b.anim = null;
  if (!a.rc) { benchSay(`> build ${a.word}: nothing. the components burned.`); return; }   // (the fizzle played as it crumbled)
  const nm = a.view.name + (a.n > 1 ? ` x${a.n}` : '');
  benchSay(`> build ${a.word}${a.lucky ? ' --force' : ''}: ${nm} -> ${a.where === 'loot' ? 'the loot bag' : a.where === 'locker' ? 'the locker' : 'your ' + a.where}.`);
  if (a.mult && a.rc.kind === 'gear') benchSay(a.n > 1 ? `  x${a.mult}: it took. ${a.n} of them.` : `  x${a.mult}: it didn't take.`);
  b.flash = { to: a.where === 'loot' ? 'loot' : 'locker', t0: performance.now() };
}

// ---- shred: what you're carrying (mods, the belt, the LOOT bag) back into components
function benchShredList() {
  const run = st.run, out = [];
  run.mods.forEach(key => out.push({ kind: 'mod', key, tier: modTier(key), n: 1 }));
  run.items.forEach(s => out.push({ kind: 'gear', key: s.key, tier: s.tier || 0, n: s.n, stack: s, list: run.items }));
  (run.loot || []).forEach(s => { if (!ITEMS[s.key].quest) out.push({ kind: 'loot', key: s.key, tier: s.tier || 0, n: s.n, stack: s, list: run.loot }); });
  return out;
}
// SHRED's sub-tabs (Greg, 2026-11-21): GEAR MODS LOOT, like the BOOK's; each one's count on its tab. It opens on the
// first one with something in it.
const SHRED_TABS = [['gear', 'GEAR'], ['mod', 'MODS'], ['loot', 'LOOT']];
function shredKind() {
  const b = st.bench, all = benchShredList();
  if (!b.shKind || !all.some(e => e.kind === b.shKind) && all.length) b.shKind = (SHRED_TABS.find(([k]) => all.some(e => e.kind === k)) || SHRED_TABS[0])[0];
  return b.shKind;
}
const benchShredShown = () => { const k = shredKind(); return benchShredList().filter(e => e.kind === k); };
function shredPickKind(k) { const b = st.bench; if (!b || b.shKind === k || benchBusy()) return; b.shKind = k; b.shSel = 0; b.shArea = { top: 0 }; Sound.tick(); }
const shredCode = e => e.kind === 'mod' ? MODS[e.key].short : ITEMS[e.key].corrupt ? '???' : ITEMS[e.key].chip ? (ITEMS[e.key].chip.replace(/[^A-Z0-9]/g, '') || 'CHP') : itemShort(e.key);   // (a chip: its code's letters, not its face)
// Corrupted software: random components (any letter, I likelier: no recipe uses it), maybe a digit, maybe a *.
const BENCH_RANDOM = 'ABCDEFGHIIIJKLMNOPQRSTUVWXYZ0';
function corruptShred(c) {
  const got = [], n = c.n[0] + Math.floor(Math.random() * (c.n[1] - c.n[0] + 1));
  for (let i = 0; i < n; i++) got.push(BENCH_RANDOM[Math.floor(Math.random() * BENCH_RANDOM.length)]);
  if (Math.random() < c.digit) got.push(benchDigit());
  if (Math.random() < c.wild) got.push('*');
  return got;
}
const shredView = e => e.kind === 'mod' ? modView(e.key, e.tier) : itemView(e.key, e.tier);
// A blueprint (Greg, 2026-11-21): shredding an exotic teaches you to build it (by its code). A mod
// that binds to you (ZOMBIE, RAM DOUBLER: modLocked) can't come apart: the shred still counts (the blueprint, give's
// record), but you keep it and get no components. Returns the code learned, or null.
const benchShredBpCode = e => { const rc = benchRecipes()[shredRecipeCode(e)]; return rc && rc.key === e.key && recipeNeedsBp(rc) ? rc.code : null; };
const shredRecipeCode = e => e.kind === 'mod' ? MODS[e.key].short : ITEMS[e.key].chip || itemShort(e.key);
function benchLearn(code) {
  const bs = benchSave(); if (!code || (bs.blueprints || {})[code]) return null;
  (bs.blueprints = bs.blueprints || {})[code] = true;
  return code;
}
const benchBound = e => e.kind === 'mod' && modLocked(e.key);
// Cashing out with a chip you already have (Greg, 2026-11-21: once it's home it's unlocked, no extras): it shreds on
// its own, into its code (digit too) and maybe a BLANK. Returns what came out.
function benchAutoShred(key, n = 1) {
  const got = [];
  for (let i = 0; i < n; i++) {
    for (const ch of key) if (/[A-Z0-9]/.test(ch)) got.push(ch);
    if (Math.random() < BENCH.blank.chip) got.push(BENCH_BLANK);
  }
  benchAdd(got);
  const sh = save.shredded || (save.shredded = {}); sh[deckChipItem(key)] = 0;
  benchTeach(got);
  return got;
}
// POPS, the first time a BLANK comes out of a shred and the first time you learn a blueprint (save.bench.blankSeen,
// bpSeen). Rough: Greg will look at where they land (docs/REVIEW.md).
function benchTeach(got, learned) {
  const bs = benchSave();
  if (got && got.some(isBlank) && !bs.blankSeen) { bs.blankSeen = true; persist(); queueCall('pops', ["that's a BLANK. an empty chip.",
    "at a workbench it goes in the little slot after the letters. then spell a chip's code: two letters and a digit, like CD2.",
    "it builds that chip, straight into your deck. you can make any chip you've seen."]); }
  if (learned && !bs.bpSeen) { bs.bpSeen = true; persist(); queueCall('pops', ['you took it apart, so now you know how it goes together. a blueprint.',
    'exotics need one to build. shred one and you learn it. look it up in the BOOK.']); }
}
function benchShred(e) {
  const b = st.bench;
  if (!e || !b || benchBusy()) return;
  if (benchBound(e)) {   // it binds to you: learn it, keep it
    const code = benchShredBpCode(e), learned = benchLearn(code), v = shredView(e);
    const sh = save.shredded || (save.shredded = {}); sh[e.key] = Math.max(sh[e.key] == null ? -1 : sh[e.key], e.tier || 0);
    persist();
    if (!learned) { benchSay(`> ${v.name.toLowerCase()} is bound to you. it won't come apart.`); return Sound.deny(); }
    benchSay(`> ${v.name.toLowerCase()} is bound to you: it stays.`); benchSay(`> blueprint: ${code} (${v.name}) is in the BOOK.`); benchTeach(null, learned);
    flash(rarityCol(v.rarity), 0.25, 0.5); return Sound.jingle();
  }
  const cor = e.kind !== 'mod' && ITEMS[e.key].corrupt, v = shredView(e);
  const letters = cor ? ['?', '?', '?'] : shredCode(e).split('').filter(ch => /[A-Z0-9]/.test(ch)), got = cor ? corruptShred(cor) : letters.slice();
  if (!cor && Math.random() < BENCH.bonus) got.push(benchBonusLetter());
  if (!cor && Math.random() < (BENCH.wild[v.rarity] || 0)) got.push('*');
  if (!cor && Math.random() < (BENCH.digit[v.rarity] || 0)) got.push(benchDigit());
  if (Math.random() < (cor ? BENCH.blank.corrupt : ITEMS[e.key] && ITEMS[e.key].chip ? BENCH.blank.chip : 0)) got.push(BENCH_BLANK);   // a BLANK: mostly from chips
  const learned = cor ? null : benchLearn(benchShredBpCode(e));   // a blueprint: exotics
  if (!cor) { const sh = save.shredded || (save.shredded = {}); sh[e.key] = Math.max(sh[e.key] == null ? -1 : sh[e.key], e.tier || 0); }   // its top tier: give.mod / give.gear's epic+ (engine/deck.js deckGiveTiers)
  if (e.kind === 'mod') removeMod(e.key);
  else if (--e.stack.n <= 0) e.list.splice(e.list.indexOf(e.stack), 1);
  benchAdd(got);
  const quest = rootShredLetter(!!cor);   // ROOT's quest: one of its letters (engine/quests.js); banked now, gone if PH1SH eats it
  if (quest) benchAdd([quest]);
  persist();
  b.shredAnim = { t0: performance.now(), letters, got, name: v.name, rarity: v.rarity, quest };
  if (learned) benchSay(`> blueprint: ${learned} (${v.name}) is in the BOOK.`);
  benchTeach(got, learned);
  Sound.grind(BENCH.shred.jumble / 1000);
}

// ---- the locker
// Slotting something from the locker: a little fanfare, bigger the rarer it is (Greg, 2026-11-12). up: a mod upgraded.
function benchFanfare(rarity, up) {
  const lvl = (RARITY[rarity] || RARITY.common).lvl, col = rarityCol(rarity);
  if (lvl >= 4) { flash(col, 0.3, 0.7); shake(4, 0.3); Sound.bossWin(); fireworkShow(4, 220, 'panel'); }
  else if (lvl === 3) { flash(col, 0.25, 0.5); Sound.jingle(); fireworkShow(2, 200, 'panel'); }
  else if (lvl === 2 || up) { flash(col, 0.18, 0.4); Sound.loot(); }
  else Sound.buy();
}
// A mod in the locker that you already have: taking it upgrades yours (addMod). 'maxed': yours can't go higher.
const benchUpNote = e => e.kind !== 'mod' || !has(e.key) ? null : modMaxed(e.key) ? 'maxed' : 'upgrade';
function benchTake(i) {
  const lk = benchSave().locker, e = lk[i];
  if (!e || benchBusy()) return;
  const name = (e.kind === 'mod' ? modView(e.key, e.tier) : itemView(e.key, e.tier)).name;
  if (e.kind === 'mod') {
    if (clashWith(e.key)) { benchSay(`> ${name}: it clashes with a mod you have.`); return Sound.deny(); }
    if (!modRoom(e.key)) { benchSay('> no free mod slot.'); return Sound.deny(); }
    if (benchUpNote(e) === 'maxed') { benchSay(`> your ${name} is maxed already.`); return Sound.deny(); }
    const up = has(e.key);
    addMod(e.key, e.tier || 0); lk[i] = null;
    const v = modView(e.key);
    persist();
    benchSay(up ? `> ${name} upgraded: ${v.name}, ${tierLabel(v)}.` : `> took ${name} out of the locker.`);
    return benchFanfare(v.rarity, up);
  } else {
    let n = 0;
    while (n < e.n && itemRoom(e.key, e.tier || 0) && addItem(e.key, e.tier || 0)) n++;
    if (!n) { benchSay('> your belt is full.'); return Sound.deny(); }
    e.n -= n; if (e.n <= 0) lk[i] = null;
  }
  persist();
  benchSay(`> took ${name} out of the locker.`);
  benchFanfare(itemView(e.key, e.tier).rarity, false);
}
function benchStoreList() {
  const run = st.run;
  return run.mods.map(key => ({ kind: 'mod', key, tier: modTier(key), n: 1 })).concat(run.items.map(s => ({ kind: 'gear', key: s.key, tier: s.tier || 0, n: s.n, stack: s })));
}
function benchStore(e) {
  if (!e || benchBusy()) return;
  const lk = benchSave().locker, name = shredView(e).name;
  const same = e.kind === 'gear' && lk.find(x => x && x.kind === 'gear' && x.key === e.key && (x.tier || 0) === e.tier && x.n + e.n <= STACK_MAX);
  const free = lk.findIndex(x => !x);
  if (!same && free < 0) { benchSay('> the locker is full.'); return Sound.deny(); }
  if (same) same.n += e.n; else lk[free] = { kind: e.kind, key: e.key, tier: e.tier, n: e.n };
  if (e.kind === 'mod') removeMod(e.key); else st.run.items.splice(st.run.items.indexOf(e.stack), 1);
  persist();
  benchSay(`> ${name} -> the locker${e.kind === 'mod' ? ' (unequipped)' : ''}.`);
  Sound.buy();
}

// ---- keys (a real keyboard): letters, digits, * type; backspace, enter; esc leaves
function benchKey(k) {
  const b = st.bench;
  if (!b || st.callBox || st.phish) return false;
  if (benchBusy()) return k.length === 1;   // (swallow typing during a build / shred)
  if (k === 'escape') { benchLeave(); return true; }
  if (b.tab !== 'build') return false;
  if (k.length === 1 && /[a-z0-9*#]/.test(k)) {   // a letter types uppercase; ROOT's lowercase ones when you're spelling it, or have no uppercase one
    const up = k.toUpperCase(), lo = /[a-z]/.test(k) && benchHave(k) > 0 && (benchRootMode() || benchHave(up) <= 0);
    Sound.keyclick(); benchPlace(lo ? k : up); return true;
  }
  if (k === 'backspace') { Sound.keyclick(); const i = [4, 3, 2, 1, 0].find(i => b.slots[i]); if (i != null) benchUnplace(i); return true; }
  if (k === 'enter') { Sound.keyclick(); benchBuild(); return true; }
  return false;
}

// ---------------- the screen (panel lines; the grid) ----------------
const ease3 = t => 1 - Math.pow(1 - t, 3);
const hh = (a, b = 0) => ((((a * 2 + 1) * 374761393) ^ ((b * 2 + 1) * 668265263)) >>> 0) % 1000 / 1000;   // a steady 0-1 for (a, b)
// A letter at 3x size in a 3x3 block of cells: 9 cells, each with its piece of the letter (render.js drawPiece).
// t0: when it went in: the pieces blink on like old bulbs (one lags, flickering; a cell's colors glitch).
// miss: a letter you don't have (BOOK). ox, oy, a: an offset / fade for the whole block (the build).
// chip: its colors ({ fg, bg }), when it isn't a component (the leaderboard's initials: engine/leaders.js).
// size: 3 (a letter slot, 3x3) or 2 (the extra slot after the letters, 2x2: Greg, 2026-11-21)
function benchBlock(ctx, x, y, ch, { t0 = 0, miss = false, ox = 0, oy = 0, a = 1, seed = 0, chip: chipIn = null, size = 3 } = {}) {
  const now = ctx.now, chip = chipIn || (miss ? BENCH_MISS : letterChip(ch));
  const age = t0 ? now - t0 : 1e9, lag = Math.floor(hh(seed + 3, Math.floor(t0) % 97) * 9);
  for (let p = 0; p < size * size; p++) {
    const px = p % size, py = Math.floor(p / size);
    let on = age > hh(p, seed) * 110, inv = false;
    if (p === lag && age < 420) on = age > 60 && (Math.floor(age / 55) % 3 !== 1) && !(age > 200 && age < 250);   // the lagging bulb
    if (age < 260 && hh(p + 11, Math.floor(age / 40)) < 0.12) inv = true;   // a cell's colors glitch
    if (!on) continue;
    const pa = (miss ? 0.5 : 1) * a;
    ctx.cells.push({ ch, cx: x + px + ox, cy: y + py + oy, col: inv ? chip.bg : chip.fg, own: 'board', bold: true, piece: { ch, px, py, n: size, bg: inv ? chip.fg : chip.bg, a: pa } });
  }
}
// A letter taken out: it blinks off (a quick flicker, no falling).
function benchFx(ctx) {
  const b = st.bench, now = ctx.now;
  b.fx = b.fx.filter(f => {
    const age = now - f.t0;
    if (age > 240) return false;
    if (Math.floor(age / 45) % 2) return true;
    const chip = letterChip(f.ch);
    for (let p = 0; p < 9; p++) if (hh(p, Math.floor(age / 45)) > age / 260) ctx.cells.push({ ch: f.ch, cx: f.x + p % 3, cy: f.y + Math.floor(p / 3), col: chip.fg, own: 'fx', bold: true, piece: { ch: f.ch, px: p % 3, py: Math.floor(p / 3), bg: chip.bg, a: 0.8 } });
    return true;
  });
}
// A small burst of characters (confetti) at a cell.
function benchConfetti(cx, cy, n = 14) {
  const cs = [C.accent, C.money, C.bright, chipOf('epic').bg, chipOf('rare').bg];
  const cells = [];
  for (let i = 0; i < n; i++) cells.push({ ch: pickR(['+', '*', '.', "'", ':', 'x', '#'], Math.random), x: pxX(cx) + rand(-L.cw, L.cw), y: pxY(cy), col: pickR(cs, Math.random) });
  explode(cells, pxX(cx), pxY(cy), { power: 0.45, grav: 0.8, life: [0.5, 0.9] });
}
// A tappable bit of text on the grid (hover: the usual background).
function benchBtn(ctx, x, y, text, col, id, onTap) {
  if (ctx.hl) ctx.hl(x, y, text.length, 1, id);
  ctx.put(x, y, text, col, 'ui');
  ctx.addHit(x, y, text.length, 1, { kind: 'btn', id, onTap });
}
// A list row like the game's (32 wide, centered): code chip, name, right text.
function benchRow(ctx, y, code, rarity, name, right, rightCol, id, onTap, faded = false) {
  const LW = 32, x = Math.floor((L.wc - LW) / 2);
  if (st.hoverBtn === id) ctx.bg(x, y, LW, C.accent, 0.2);
  const ch = chipOf(rarity);
  ctx.bg(x + 1, y, code.length, ch.bg, 1); ctx.put(x + 1, y, code, ch.fg, 'ui', true);
  ctx.put(x + 5, y, name.slice(0, 17), faded ? C.mid : C.bright, 'ui');
  if (right) ctx.put(x + LW - right.length, y, right, rightCol || C.mid, 'ui');
  if (onTap) ctx.addHit(x, y, LW, 1, { kind: 'btn', id, onTap });
}
// Where things land: the LOCKER tab (its middle, row 4) and the [£] over the keyboard.
const BENCH_TABS = ['build', 'shred', 'book', 'locker'];
function benchTabX(t) { const labs = BENCH_TABS.map(x => `[${x.toUpperCase()}]`), w = labs.join(' ').length; let x = Math.floor((L.wc - w) / 2); for (let i = 0; i < BENCH_TABS.indexOf(t); i++) x += labs[i].length + 1; return x; }
const benchLockerSpot = () => ({ x: benchTabX('locker') + 4, y: 4 });
const benchLootRow = () => Math.max(20, Math.floor((benchKbGeom().top - L.oy) / L.chh) - 1);
const benchLootSpot = () => ({ x: L.wc - 2, y: benchLootRow() });

function benchLines(T, B, X, lines) {
  const b = st.bench;
  if (!b) return;
  // header: NeoN+1, the rule, where you are and [LEAVE]; the tabs (a flash on LOCKER when something lands)
  X({ h: 5, draw: (ctx, y) => {
    ctx.put(0, y, 'NeoN+1', C.accent, 'hud');
    ctx.put(0, y + 1, rule(L.wc), C.dim, 'hud');
    const at = b.node && b.node.type !== 'rest' ? 'REMOTE // ' : 'SAFEHOUSE // ';   // (REMOTE ACCESS: from the public node)
    ctx.put(0, y + 2, at, C.mid, 'hud'); ctx.put(at.length, y + 2, 'WORKBENCH', C.bright, 'hud');
    wayOutBtn(ctx, L.wc - 9, y, '[LEAVE >]', 'bkleave', benchLeave, ctx.now || performance.now());   // (engine/scene.js)   // (top right, NeoN+1's line, like every LEAVE: Greg, 2026-11-21)
    const fl = b.flash && b.flash.to === 'locker' ? (ctx.now - b.flash.t0) / 700 : 1;
    BENCH_TABS.forEach(t => {
      const s = `[${t.toUpperCase()}]`, x = benchTabX(t), on = b.tab === t;
      if (t === 'locker' && fl < 1) ctx.bg(x, y + 4, s.length, C.money, 0.7 * (1 - fl));
      if (on) ctx.bg(x, y + 4, s.length, C.accent, 0.22); else if (ctx.hl) ctx.hl(x, y + 4, s.length, 1, 'bt_' + t, false);
      ctx.put(x, y + 4, s, on ? C.accent : t === 'locker' && fl < 1 ? C.money : C.bright, 'ui', on);
      ctx.addHit(x, y + 4, s.length, 1, { kind: 'btn', id: 'bt_' + t, onTap: () => benchTab(t) });
    });
  } });
  // sub-tabs (engine/textboard.js drawSubTabs): the BOOK's GEAR MODS CHIPS, the LOCKER's TAKE STORE, SHRED's GEAR MODS LOOT (Greg, 2026-11-21)
  if (b.tab === 'locker') X({ h: 1, draw: (ctx, y) => drawSubTabs(ctx, y, [['take', 'TAKE'], ['store', 'STORE'], ['comps', 'COMPS']].map(([v, t]) => ({ id: 'lv' + v, text: t, on: b.lkView === v, onTap: () => { if (b.lkView !== v) { b.lkView = v; b.lkT = performance.now(); Sound.tick(); } } }))) });
  else if (b.tab === 'book') X({ h: 1, draw: (ctx, y) => drawSubTabs(ctx, y, BOOK_TABS.map(([k, t]) => ({ id: 'bks_' + k, text: t, on: bookKind() === k, onTap: () => bookPickKind(k) }))) });
  else if (b.tab === 'shred') { const all = benchShredList(), on = shredKind(); X({ h: 1, draw: (ctx, y) => drawSubTabs(ctx, y, SHRED_TABS.map(([k, t]) => { const n = all.filter(e => e.kind === k).length; return { id: 'shs_' + k, text: n ? `${t} ${n}` : t, on: on === k, onTap: () => shredPickKind(k) }; })) }); }
  else T('');
  if (b.tab === 'build') benchBuildLines(T, B, X);
  else if (b.tab === 'shred') benchShredLines(T, B, X);
  else if (b.tab === 'book') benchBookLines(T, B, X);
  else benchLockerLines(T, B, X);
  // fill to the bottom, so the screen sits at the top (the footer has the last row)
  const hOf = ln => ln.box ? (ln.sub ? 4 : 3) : ln.draw ? ln.h || 1 : 1;
  let used = lines.reduce((a, ln) => a + hOf(ln), 0);
  while (used++ < L.hc - 1) T('');
}

function benchBuildLines(T, B, X) {
  const b = st.bench;
  X({ h: 16, draw: (ctx, y0) => {
    const { put } = ctx, now = ctx.now, a = b.anim;
    // the terminal: the last 3 lines
    b.log.slice(-3).forEach((l, i, arr) => put(1, y0 + i, l.slice(0, L.wc - 1), i === arr.length - 1 ? C.text : C.mid, 'board'));
    // pinned recipes: each letter you have in its color, missing in magenta
    const pins = benchSave().pins.filter(c => benchRecipes()[c]).slice(0, BENCH.pins);
    put(1, y0 + 4, 'PINNED', C.mid, 'board');
    if (!pins.length) put(8, y0 + 4, 'pin recipes in the BOOK.', C.dim, 'board');
    pins.forEach((code, i) => {
      const y = y0 + 5 + i, rc = benchRecipes()[code], v = recipeView(rc), miss = benchMissing(code).split('');
      if (st.hoverBtn === 'pin' + code) ctx.bg(1, y, L.wc - 2, C.accent, 0.2);
      put(1, y, '*', C.money, 'board');
      const cc = chipOf(v.rarity); ctx.bg(3, y, 3, cc.bg, 1); put(3, y, code, cc.fg, 'board', true);
      put(7, y, v.name.slice(0, 9), C.bright, 'board');
      const left = miss.slice();
      code.split('').forEach((ch, k) => {
        const x = 17 + k * 2, m = left.indexOf(ch);
        const lc = m >= 0 ? (left.splice(m, 1), BENCH_MISS) : letterChip(ch);
        ctx.bg(x, y, 1, lc.bg, 1); put(x, y, ch, lc.fg, 'board', true);
      });
      put(24, y, miss.length ? 'need ' + missText(miss.join('')) : 'ready', miss.length ? BENCH_MISS.fg : C.accent, 'board');
      ctx.addHit(1, y, L.wc - 2, 1, { kind: 'btn', id: 'pin' + code, onTap: () => benchFill(code) });
    });
    // the prompt: $ build, a frame round three plain 3x3 slots, the x slot for a digit
    const sy = y0 + 9; b.slotY = sy; b.slotX = [10, 14, 18];
    put(1, sy + 1, '$', C.accent, 'board', true); put(3, sy + 1, 'build', C.accent, 'board', true);
    const fw = 11, fc = !a && benchRootMode() ? C.rep : C.dim;   // (ROOT's letters: the frame goes the quest color)
    put(9, sy - 1, '+' + '-'.repeat(fw) + '+', fc, 'board'); put(9, sy + 3, '+' + '-'.repeat(fw) + '+', fc, 'board');
    for (let r = 0; r < 3; r++) { put(9, sy + r, '|', fc, 'board'); put(10 + fw, sy + r, '|', fc, 'board'); }
    const cur = a ? -1 : b.slots.slice(0, 3).findIndex(s => !s), blink = Math.floor(now / 500) % 2;
    if (!a) b.slots.slice(0, 3).forEach((ch, i) => {
      const x = b.slotX[i];
      if (ch) benchBlock(ctx, x, sy, ch, { t0: b.slotT[i], seed: i });
      else {
        for (let r = 0; r < 3; r++) ctx.bg(x, sy + r, 3, C.dim, 0.45);
        if (i === cur && blink) put(x, sy + 2, '___', C.accent, 'board', true);   // the cursor, across the slot's bottom
      }
      ctx.addHit(x, sy, 3, 3, { kind: 'benchslot', slot: i });
    });
    // the extra slot: a digit 2-9 (x: a chance of that many) or a BLANK. With ROOT's letters in, it's their 4th letter.
    const d = b.slots[3], rm = !a && benchRootMode();
    if (rm) {
      // ROOT's word: its 4th letter goes in the extra slot (Greg, 2026-11-21: "just make it work for the t")
      const bx = BENCH_BLANK_X;
      if (d) benchBlock(ctx, bx, sy + 1, d, { t0: b.slotT[3], seed: 3, size: 2 });
      else { put(bx, sy + 1, '::', C.rep, 'board'); put(bx, sy + 2, cur < 0 && blink ? '__' : '::', C.rep, 'board', cur < 0 && blink); }
      put(bx, sy + 3, 'ROOT', C.rep, 'board');
      ctx.addHit(bx, sy + 1, 2, 2, { kind: 'benchslot', slot: 3 });
    } else {
      // the extra slot (Greg, 2026-11-21: one slot for both): smaller (2x2) and dotted, so it reads as optional. It
      // takes a digit 2-9 (x: a chance of that many, gear) or a BLANK (the slots spell a chip). Inside, the digit is
      // slot 3 and the BLANK slot 4: the two never sit in it together (benchPlace).
      const bx = BENCH_BLANK_X, cm = !a && isBlank(b.slots[4]), bc = chipOf(letterTier(BENCH_BLANK)), dc = chipOf('legendary');
      if (!a && cm) benchBlock(ctx, bx, sy + 1, BENCH_BLANK, { t0: b.slotT[4], seed: 4, size: 2 });
      else if (!a && d) benchBlock(ctx, bx, sy + 1, d, { t0: b.slotT[3], seed: 3, size: 2 });   // (just the digit: the label under it says x3)
      else if (!a) { put(bx, sy + 1, '::', C.dim, 'board'); put(bx, sy + 2, '::', C.dim, 'board'); }
      if (!a) { const lab = cm ? 'BLANK' : d ? `x${d} ${Math.round(BENCH.multi * 100)}%` : 'x2-9 BLANK'; put(bx, sy + 3, lab, cm ? bc.bg : d ? dc.bg : C.dim, 'board', cm || !!d); }
      ctx.addHit(bx, sy + 1, 2, 2, { kind: 'benchslot', slot: cm ? 4 : 3 });
    }
    if (a) { benchBuildAnim(ctx, a); benchFx(ctx); benchLoot(ctx); return; }
    const j = benchJudge();
    if (j.kind === 'root' || j.kind === 'rpartial' || j.kind === 'rbad') {   // ROOT's word (engine/quests.js PAPERWORK)
      if (j.kind === 'root') { const x0 = Math.floor((L.wc - 24) / 2), ry = sy + 4; ctx.bg(x0, ry, 4, C.rep, 1); put(x0, ry, 'r??t', C.bg, 'board', true); put(x0 + 5, ry, 'sign it', C.bright, 'board', true); benchBtn(ctx, x0 + 14, ry, '[ SIGN ]', C.rep, 'bkbuild', () => benchBuild()); }   // (under the letters, like a build)
      const y = sy + 5, l1 = j.kind === 'rbad' ? `${j.w}: that's not it.` : j.kind === 'root' ? 'the paperwork, filled in.' : "r o o t: ROOT's paperwork.", l2 = j.kind === 'root' ? '' : 'a * fills in for one letter.';
      put(Math.floor((L.wc - l1.length) / 2), y, l1, j.kind === 'rbad' ? C.danger : C.rep, 'board');
      if (l2) put(Math.floor((L.wc - l2.length) / 2), y + 1, l2, C.mid, 'board');
      if (j.kind === 'rbad') { const r2 = '[ CLEAR ]'; benchBtn(ctx, Math.floor((L.wc - r2.length) / 2), y + 2, r2, C.bright, 'bkcancel', () => [3, 2, 1, 0].forEach(i => benchUnplace(i))); }
      benchFx(ctx); benchLoot(ctx); return;
    }
    if (j.kind === 'ok') {   // under the letters (Greg, 2026-11-21: the right side has the BLANK now): code, name, [ BUILD ]
      const v = recipeView(benchRecipes()[j.code]), cc = chipOf(v.rarity), btn = j.wild ? '[ via * ]' : '[ BUILD ]';
      const nm = v.name.slice(0, L.wc - 8 - btn.length), x0 = Math.floor((L.wc - (3 + 1 + nm.length + 2 + btn.length)) / 2), ry = sy + 4;
      ctx.bg(x0, ry, 3, cc.bg, 1); put(x0, ry, j.code, cc.fg, 'board', true);
      put(x0 + 4, ry, nm, C.bright, 'board', true);
      benchBtn(ctx, x0 + 4 + nm.length + 2, ry, btn, j.wild ? C.money : C.accent, 'bkbuild', () => benchBuild());
    }
    // under the prompt: what fits / what went wrong
    const y = sy + 5;
    if (j.kind === 'partial') {
      const m = benchMatches();
      if (m.length) {
        put(1, y - 1, 'MATCHES', C.mid, 'board');
        m.forEach((code, i) => { const rc = benchRecipes()[code], v = recipeView(rc), miss = benchMissing(code), lock = recipeLocked(rc);
          benchRow(ctx, y + i, code, v.rarity, v.name, lock ? 'blueprint' : miss ? 'need ' + missText(miss) : 'tap: fill', lock ? C.dangerDim : miss ? BENCH_MISS.fg : C.accent, 'm' + code, () => benchFill(code), !!miss || lock); });
      } else {
        const msg = !benchCount() ? '> no components. shred something.' : b.slots.some(Boolean) ? '> no code fits. a secret?' : '> select components';
        put(1, y, msg, C.mid, 'board');
      }
    } else if (j.kind === 'ok') {
      const rc = benchRecipes()[j.code], v = recipeView(rc), tip = (rc.kind === 'chip' ? DECK_CHIPS[rc.chip][6] : v.tip || '').slice(0, L.wc);   // (a chip: its short text; the belt tip is long)
      put(Math.floor((L.wc - tip.length) / 2), y, tip, C.text, 'board');
      const note = rc.kind === 'chip' ? 'a chip: it goes into your deck.' : d && rc.kind === 'mod' ? `x${d}: mods don't stack.` : d ? `x${d}: ${Math.round(BENCH.multi * 100)}% you get ${d}.` : 'it goes up to the locker.';
      put(Math.floor((L.wc - note.length) / 2), y + 1, note, d ? C.money : C.dim, 'board');
      { const r2 = '[ CLEAR ]'; benchBtn(ctx, Math.floor((L.wc - r2.length) / 2), y + 2, r2, C.mid, 'bkclear', () => [4, 3, 2, 1, 0].forEach(i => benchUnplace(i))); }   // a way out of a good recipe too (Greg, 2026-11-21)
    } else if (j.kind === 'pick') {
      put(1, y - 1, `* FITS ${j.fit.length}: PICK ONE`, C.money, 'board');
      j.fit.slice(0, 3).forEach((code, i) => { const v = recipeView(benchRecipes()[code]); benchRow(ctx, y + i, code, v.rarity, v.name, 'build', C.accent, 'pk' + code, () => benchBuild(code)); });
    } else if (j.kind === 'near' || j.kind === 'bad') {
      const l1 = `${j.w}: command not found.`, l2 = j.kind === 'near' ? `close to ${j.code}. ${Math.round(BENCH.near * 100)}% it works.` : `a secret? ${Math.round(BENCH.unknown * 100)}% it's something.`;
      put(Math.floor((L.wc - l1.length) / 2), y, l1, j.kind === 'near' ? C.money : C.danger, 'board');
      put(Math.floor((L.wc - l2.length) / 2), y + 1, l2, C.mid, 'board');
      const r1 = '[ RUN ANYWAY ]', r2 = '[ CANCEL ]', x = Math.floor((L.wc - r1.length - r2.length - 2) / 2);
      benchBtn(ctx, x, y + 2, r1, C.money, 'bkforce', () => benchBuild(null, true));
      benchBtn(ctx, x + r1.length + 2, y + 2, r2, C.bright, 'bkcancel', () => [0, 1, 2, 3].forEach(i => benchUnplace(i)));
    } else {
      const l = j.kind === 'lock' ? `${j.w}: needs a blueprint.` : j.kind === 'blank' ? `${j.w}: a chip. it needs a BLANK.` : j.kind === 'notchip' ? `${j.w}: a BLANK only makes chips.` : '';
      const l2 = j.kind === 'lock' ? 'shred one and you learn it.' : j.kind === 'blank' ? 'shred chips for BLANKs.' : j.kind === 'notchip' ? 'take the BLANK out to build it.' : '';
      put(Math.floor((L.wc - l.length) / 2), y, l, j.kind === 'lock' ? C.danger : C.money, 'board');
      if (l2) put(Math.floor((L.wc - l2.length) / 2), y + 1, l2, C.mid, 'board');
    }
    benchFx(ctx);
    benchLoot(ctx);
  } });
}
// The LOOT bag's button over the keyboard: - - - [£] (crafted loot drops into it).
function benchLoot(ctx) {
  const b = st.bench, y = benchLootRow(), n = (st.run.loot || []).reduce((a, s) => a + s.n, 0);
  const fl = b.flash && b.flash.to === 'loot' ? (ctx.now - b.flash.t0) / 700 : 1;
  ctx.put(0, y, rule(L.wc - 4), C.dim, 'board');
  if (fl < 1) ctx.bg(L.wc - 3, y, 3, C.money, 0.8 * (1 - fl));
  ctx.put(L.wc - 3, y, '[£]', n ? C.money : C.dim, 'ui', !!n);
}
// The build, step by step: CHARGE (the letters shake and glitch), SPLIT (the pieces slip apart), FORM (they pull into
// what you built: its code chip and name), HOLD, then FLY up to the LOCKER tab (or down to the [£]). Nothing built:
// the pieces crumble.
function benchBuildAnim(ctx, a) {
  const T = BENCH.build, t = ctx.now - a.t0, put = ctx.put;
  const e1 = T.charge, e2 = e1 + T.split, e3 = e2 + T.form, e4 = e3 + T.hold, e5 = e4 + T.fly;
  const cx = 15, cy = a.y + 1;   // where it forms (over the middle slot)
  if (a.root && t >= e1 + 500) {   // ROOT's word: it charges, the screen fills with fine print, then the scene takes over
    st.bench.anim = null; benchSay('> build root: ...the paperwork went through.');
    return rootSigned();
  }
  if (a.root && t >= e1) {
    for (let r = 0; r < 14; r++) put(0, a.y - 8 + r, Array.from({ length: L.wc }, (_, i) => hh(i, r + Math.floor(t / 50)) < (t - e1) / 500 ? '.,:;§#abcdefghijklmnopqrstuvwxyz'[Math.floor(hh(i + 3, r + Math.floor(t / 70)) * 32)] : ' ').join(''), C.rep, 'fx');
    return;
  }
  if (t < e1) {   // CHARGE
    const k = t / e1, amp = 0.04 + 0.22 * k * k;
    a.slots.forEach((ch, i) => benchBlock(ctx, a.x[i], a.y, ch, { ox: (hh(i, Math.floor(t / 33)) - 0.5) * amp * 2, oy: (hh(i + 5, Math.floor(t / 33)) - 0.5) * amp * 2, seed: i }));
    for (let i = 0; i < 3; i++) if (hh(i + 20, Math.floor(t / 70)) < k * 0.6) ctx.bg(a.x[i] + Math.floor(hh(i, Math.floor(t / 70)) * 3), a.y + Math.floor(hh(i + 9, Math.floor(t / 70)) * 3), 1, C.bright, 0.5);
    return;
  }
  if (!a.formed && t >= e2) { a.formed = true; if (a.rc) Sound.form(); else Sound.fizzle(); }
  if (t < e3 || !a.rc) {   // SPLIT, then FORM (or crumble)
    a.slots.forEach((ch, i) => {
      const chip = letterChip(ch);
      for (let p = 0; p < 9; p++) {
        const px = p % 3, py = Math.floor(p / 3), ang = hh(p, i) * Math.PI * 2, dist = 1.5 + hh(p + 3, i) * 2.5;
        const sx = a.x[i] + px, sy0 = a.y + py;
        let x = sx, y = sy0, al = 1;
        if (t < e2) { const k = ease3((t - e1) / T.split); x += Math.cos(ang) * dist * k; y += Math.sin(ang) * dist * k * 0.6; }
        else if (a.rc) { const k = ease3((t - e2) / T.form); const ex = sx + Math.cos(ang) * dist, ey = sy0 + Math.sin(ang) * dist * 0.6; x = ex + (cx - ex) * k; y = ey + (cy - ey) * k; al = 1 - k * 0.9; }
        else { const k = (t - e2) / 600; if (k > 1) continue; x += Math.cos(ang) * dist; y += Math.sin(ang) * dist * 0.6 + k * k * 9; al = 1 - k; }
        ctx.cells.push({ ch, cx: x, cy: y, col: chip.fg, own: 'fx', bold: true, piece: { ch, px, py, bg: chip.bg, a: al } });
      }
    });
    if (!a.rc && t > e2 + 650) benchBuildDone(a);
    return;
  }
  // HOLD, then FLY: what you built, as just its code (3 letters, x2 if more). It arcs: out to the right first, then up
  // to the LOCKER tab (or down to the [£]).
  const v = a.view, label = a.rc.code + (a.n > 1 ? ` x${a.n}` : ''), w = label.length;
  const to = a.where === 'loot' ? benchLootSpot() : benchLockerSpot();
  const x0 = cx - Math.floor(w / 2), y0 = cy;
  let x = x0, y = y0, al = 1;
  if (t >= e4) { const k = Math.min(1, (t - e4) / T.fly); x = x0 + (to.x - w / 2 - x0) * (1 - Math.pow(1 - k, 2.4)); y = y0 + (to.y - y0) * Math.pow(k, 2.2); al = 1 - k * 0.3; }
  const ch = chipOf(v.rarity), glitch = t < e3 + 140 && Math.floor(t / 35) % 2;
  if (!glitch) { ctx.bg(x, y, a.rc.code.length, ch.bg, al); put(x, y, a.rc.code, ch.fg, 'fx', true); if (a.n > 1) put(x + 3, y, ` x${a.n}`, C.money, 'fx', true); }
  if (t < e3 + 200) for (let i = 0; i < 6; i++) put(cx - 4 + Math.floor(hh(i, Math.floor(t / 40)) * 9), cy - 1 + Math.floor(hh(i + 7, Math.floor(t / 40)) * 3), noiseCh(), C.bright, 'fx');
  if (t >= e5) { benchConfetti(to.x, to.y, 24); Sound.fanfare(); benchBuildDone(a); }
}

function benchShredLines(T, B, X) {
  const b = st.bench, list = benchShredShown();
  T('S H R E D', C.danger);
  T('it comes apart into components.', C.text);
  T('');
  b.shSel = clamp(b.shSel, 0, Math.max(0, list.length - 1));
  const rows = 8;
  if (!list.length) { T('nothing to shred.', C.dim); for (let i = 1; i < rows; i++) T(''); }
  else {
    const items = list.map((e, i) => {
      const v = shredView(e);
      const row = { list: true, id: 'sh' + i, onTap: () => { if (!benchBusy()) { b.shSel = i; Sound.tick(); } }, sel: i === b.shSel, name: v.name + (e.n > 1 ? 'x' + e.n : ''), right: e.kind, rightCol: rarityCol(v.rarity) };   // (one rule: the kind in its rarity's color. Greg, 2026-11-21: mods were yellow, gear and loot grey)
      if (e.kind === 'mod') Object.assign(row, { badge: e.key, badgeTier: e.tier }); else Object.assign(row, { gear: e.key, gearTier: e.tier });
      return row;
    });
    scrollFollow(b.shArea, b.shSel, items.length, rows);
    scrollArea(X, T, b.shArea, items, rows, 'sha');
  }
  T(SEP, C.dim);
  const e = list[b.shSel], sa = b.shredAnim;
  if (sa) X({ h: 8, draw: (ctx, y) => benchShredAnim(ctx, y, sa) });
  else if (e) {
    const v = shredView(e), code = shredCode(e);
    X(e.kind === 'mod' ? { badge: e.key, badgeTier: e.tier } : { gearHead: e.key, gearTier: e.tier, text: v.name });
    T(v.tip || v.desc || '', C.text);
    T(benchBound(e) ? (benchBp(shredRecipeCode(e)) ? 'bound to you. it won\'t come apart.' : 'bound to you: a shred learns its blueprint. it stays.') : e.kind === 'mod' ? 'an equipped mod. it goes for good.' : e.kind === 'loot' ? `loot. it sells for ${gearValue(e.key, e.tier)}cr.` : `gear${e.n > 1 ? `, you have ${e.n}` : ''}.`, e.kind === 'mod' ? C.dangerDim : C.mid);
    X({ box: true, text: 'S H R E D', sub: ITEMS[e.key] && ITEMS[e.key].corrupt ? '- ? ? ? -' : `- ${code.split('').join(' ')} + ? -`, id: 'bkshred', onTap: () => benchShred(benchShredShown()[b.shSel]), minW: 22, col: C.danger });
    T('');
  } else for (let i = 0; i < 8; i++) T('');
  T(SEP, C.dim);
  T(b.log[b.log.length - 1].replace(/^> /, ''), C.accent);
  T(`${benchCount()} components banked`, C.mid);
}
// The shred: its letters jumble in the grinder (the box shakes), get sucked down, then the components drop out one by
// one and fly up to the LOCKER tab.
function benchShredAnim(ctx, y0, sa) {
  const T = BENCH.shred, t = ctx.now - sa.t0, put = ctx.put, now = ctx.now;
  const bw = 22, bx = Math.floor((L.wc - bw) / 2), by = y0 + 3, shake = t < T.jumble + T.suck ? (hh(1, Math.floor(t / 30)) - 0.5) * 0.5 : 0;
  // the grinder: the box, its teeth
  const edge = '+' + '='.repeat(bw - 2) + '+';
  put(bx + shake, by, edge, C.danger, 'ui', true); put(bx + shake, by + 3, edge, C.danger, 'ui', true);
  put(bx + shake, by + 1, '|', C.danger, 'ui', true); put(bx + bw - 1 + shake, by + 1, '|', C.danger, 'ui', true);
  put(bx + shake, by + 2, '|', C.danger, 'ui', true); put(bx + bw - 1 + shake, by + 2, '|', C.danger, 'ui', true);
  const teeth = Array.from({ length: bw - 4 }, (_, i) => '\\|/'[(i + Math.floor(now / 60)) % 3]).join('');
  put(bx + 2 + shake, by + 2, teeth, t < T.jumble + T.suck ? C.danger : C.dangerDim, 'ui');
  put(Math.floor((L.wc - sa.name.length) / 2), by + 1, sa.name, C.mid, 'ui');
  if (t < T.jumble) {   // JUMBLE: its letters bounce around over the box
    sa.letters.forEach((ch, i) => {
      const x = bx + 3 + hh(i, Math.floor(t / 70)) * (bw - 7), y = y0 + hh(i + 4, Math.floor(t / 70)) * 2.4;
      const c = letterChip(ch), shown = Math.floor(t / 90 + i) % 4 ? ch : noiseCh();
      ctx.bg(x, y, 1, c.bg, 1); put(x, y, shown, c.fg, 'fx', true);
    });
    return;
  }
  if (t < T.jumble + T.suck) {   // SUCK: down into the teeth
    const k = (t - T.jumble) / T.suck;
    sa.letters.forEach((ch, i) => { const sx = bx + 6 + i * 4, x = sx + (L.wc / 2 - sx) * k, y = y0 + 1 + (by + 2 - y0 - 1) * k * k; const c = letterChip(ch); ctx.bg(x, y, 1, c.bg, 1 - k * 0.6); put(x, y, ch, c.fg, 'fx', true); });
    return;
  }
  // DROP: the components fall out under the box, one by one, then fly up to the LOCKER tab
  const t2 = t - T.jumble - T.suck, to = benchLockerSpot();
  sa.landed = sa.landed || 0;
  sa.got.forEach((ch, i) => {
    const ti = t2 - i * T.drop;
    if (ti < 0) return;
    const c = letterChip(ch), sx = Math.floor(L.wc / 2) - sa.got.length + i * 2;
    let x = sx, y = ti < 140 ? by + 2 + (ti / 140) * 3 : by + 5;
    const tf = ti - 260;
    if (tf > 0) { const k = ease3(Math.min(1, tf / T.fly)); x += (to.x - x) * k; y += (to.y - y) * k; }
    if (tf >= T.fly) { if (sa.landed <= i) { sa.landed = i + 1; Sound.comp(); st.bench.flash = { to: 'locker', t0: now }; } return; }
    ctx.bg(x, y, 1, c.bg, 1); put(x, y, ch, c.fg, 'fx', true);
  });
  // ROOT's letter (its quest: engine/quests.js): it drops out after the rest and stays under the shredder, sparkling, with a
  // little fanfare; then the QUEST card (the first one) and PH1SH's ad (engine/ads.js phishShow) show it; then it flies up
  // to the LOCKER too, or it's gone (PH1SH ate it).
  const qx = Math.floor(L.wc / 2), qy = by + 5;
  if (sa.quest) {
    const tq = t2 - sa.got.length * T.drop;
    if (tq >= 0 && sa.qPhase !== 'gone' && sa.qPhase !== 'home') {
      let x = qx, y = tq < 140 ? by + 2 + (tq / 140) * 3 : qy;
      if (sa.qPhase === 'fly') {
        const k = ease3(Math.min(1, (now - sa.qT) / T.fly)); x += (to.x - x) * k; y += (to.y - y) * k;
        if (k >= 1) { sa.qPhase = 'home'; Sound.comp(); st.bench.flash = { to: 'locker', t0: now }; benchConfetti(to.x, to.y, 16); }
      } else if (tq >= 140) for (let i = 0; i < 6; i++) {   // the sparkle round it
        const a = now / 300 + i * Math.PI / 3; put(x + Math.round(Math.cos(a) * 2), y + Math.round(Math.sin(a)), Math.floor(now / 160 + i) % 2 ? '*' : '+', C.rep, 'fx');
      }
      const c = letterChip(sa.quest); ctx.bg(x, y, 1, c.bg, 1); put(x, y, sa.quest, c.fg, 'fx', true);
    }
    if (tq >= 140 && !sa.qLand) { sa.qLand = true; Sound.jingle(); benchConfetti(qx, qy, 18); }   // it lands: the fanfare
    if (tq >= 1100 && !sa.qPhase) { sa.qPhase = 'wait'; benchRootFound(sa); }   // then, after a beat to see it, the popups
  }
  if (t2 > (sa.got.length - 1) * T.drop + 260 + T.fly + 60 && (!sa.quest || sa.qPhase === 'home' || sa.qPhase === 'gone')) {
    st.bench.shredAnim = null;
    benchConfetti(to.x, to.y, 12);
    benchSay(`> shred ${sa.name}: +${sa.got.concat(sa.qPhase === 'home' ? [sa.quest] : []).join(' +')}`);
    if (sa.quest) rootCheck();
  }
}
// ROOT's letter is out: the first one gets a QUEST card (the letter big in it), then PH1SH's spam ad (always the first
// time, then ROOT_ODDS.phish of the time). Close it and the letter flies home; take the bait and he eats it (and some of
// your credits). POPS has a word either way, the first times.
function benchRootFound(sa) {
  const q = questOf('root'), first = !q.letters1, ch = sa.quest;
  const fly = () => { sa.qPhase = 'fly'; sa.qT = performance.now(); };
  const after = eaten => {
    if (eaten) {
      const l = benchSave().letters; l[ch]--; if (l[ch] <= 0) delete l[ch];
      sa.qPhase = 'gone'; queueCall('pops', q.bit ? QUEST_LINES.rootBitAgain : QUEST_LINES.rootBit); q.bit = (q.bit || 0) + 1;
    } else { fly(); if (!q.closed) queueCall('pops', QUEST_LINES.rootClosed); q.closed = (q.closed || 0) + 1; }
    persist();
  };
  const ad = () => first || Math.random() < ROOT_ODDS.phish ? phishShow(ch, after) : fly();
  if (!first) return ad();
  q.letters1 = true; q.news = true; persist();
  const v = questView('root');
  CALL_QUEUE.push({ who: 'root', quest: { name: QUEST_INFO.root.name, step: `STEP ${v.at + 1}: ${v.name}` }, lines: QUEST_LINES.rootFirst, letter: ch, onClose: ad });
}

function benchBookLines(T, B, X) {
  const b = st.bench, codes = bookList(), R = benchRecipes();
  const found = codes.filter(c => save.seen[R[c].key] && recipeKnown(R[c])).length;   // (this tab's: GEAR, MODS or CHIPS)
  X({ h: 1, draw: (ctx, y) => { const x = Math.floor((L.wc - 32) / 2), n = `${benchCount()} comps`; ctx.put(x, y, `${found}/${codes.length} found`, C.mid, 'ui');   /* (no BOOK: the sub-tab over it says which list, Greg) */ ctx.put(x + 32 - n.length, y, n, C.mid, 'ui'); } });
  const rq = ['letters', 'spell'].includes(rootStep());   // ROOT's paperwork: its letters, over the recipes (engine/quests.js)
  if (rq) X({ h: 1, draw: (ctx, y) => rootLettersRow(ctx, Math.floor((L.wc - 32) / 2), y) });
  T(SEP, C.dim);
  b.bkSel = clamp(b.bkSel, 0, codes.length - 1);
  const pick = i => { if (i !== b.bkSel) { b.bkSel = i; b.bkT = performance.now(); Sound.tick(); } };
  const code = codes[b.bkSel], rc = R[code], v = recipeView(rc), seen = !!save.seen[rc.key] && recipeKnown(rc), lock = recipeLocked(rc), miss = benchMissing(code);
  if (seen) {
    X(rc.kind === 'mod' ? { badge: rc.key, badgeTier: 0 } : { gearHead: rc.key, gearTier: 0, text: v.name });
    T(`${RARITY[v.rarity].label.toLowerCase()} ${rc.kind}`, C.mid);
    T((rc.kind === 'chip' ? DECK_CHIPS[rc.chip][6] : v.tip || '').slice(0, L.wc), C.text);   // (a chip: its short text; the belt tip is long)
  } else { T('???', C.dim); T('not found yet.', C.mid); T(rc.kind === 'chip' ? 'see one to log it.' : 'own one to log it. or spell it.', C.dim); }
  X({ h: 3, draw: (ctx, y) => {
    const left = miss.split('');
    code.split('').forEach((ch, i) => { const m = left.indexOf(ch); if (m >= 0) left.splice(m, 1);
      if (seen) benchBlock(ctx, 12 + i * 4, y, ch, { miss: m >= 0, t0: b.bkT + i * 60, seed: i + b.bkSel });
      else { for (let r = 0; r < 3; r++) ctx.bg(12 + i * 4, y + r, 3, C.dim, 0.3); ctx.put(13 + i * 4, y + 1, '?', C.dim, 'ui'); } });
  } });
  T(!seen ? '' : lock ? 'needs a blueprint: shred one.' : miss ? 'missing: ' + (miss.replace(BENCH_BLANK, '').split('').join(' ') + (miss.includes(BENCH_BLANK) ? ' +BLANK' : '')).trim() : rc.kind === 'chip' ? 'you have the components and a BLANK.' : 'you have the components.', lock ? C.danger : miss ? BENCH_MISS.fg : C.accent);
  const pins = benchSave().pins, pinned = pins.includes(code), canBuild = seen && !lock && !miss;
  X({ gap: 2, row: [
    { text: pinned ? '[ UNPIN ]' : '[ PIN ]', id: 'bkpin', disabled: !seen, onTap: () => { const p = benchSave(); p.pins = pinned ? p.pins.filter(x => x !== code) : [code].concat(p.pins.filter(x => x !== code)).slice(0, BENCH.pins); persist(); Sound.tick(); } },
    { text: '[ BUILD ]', id: 'bkbook', disabled: !canBuild, onTap: () => { if (!canBuild) return; b.pending = code; benchTab('build'); } },
  ] });
  T(SEP, C.dim);
  const rows = Math.max(6, L.hc - 1 - 6 - 11 - 1 - (rq ? 1 : 0));
  const items = codes.map((c, i) => {
    const r = R[c], s = !!save.seen[r.key] && recipeKnown(r), vv = recipeView(r), mm = benchMissing(c), lk = recipeLocked(r);
    return s ? { list: true, id: 'bk' + i, sel: i === b.bkSel, onTap: () => pick(i), name: vv.name, faded: !!mm || lk,
      right: (pins.includes(c) ? '* ' : '') + (lk ? 'blueprint' : mm ? 'need ' + missText(mm) : 'ready'), rightCol: lk ? C.dangerDim : mm ? BENCH_MISS.fg : C.accent,
      ...(r.kind === 'mod' ? { badge: r.key, badgeTier: 0 } : { gear: r.key, gearTier: 0 }) }
      : { list: true, id: 'bk' + i, sel: i === b.bkSel, onTap: () => pick(i), name: '???', faded: true, right: 'not found', rightCol: C.dim };
  });
  scrollFollow(b.bkArea, b.bkSel, items.length, rows);
  scrollArea(X, T, b.bkArea, items, rows, 'bka');
}

function benchLockerLines(T, B, X) {
  const b = st.bench, lk = benchSave().locker;
  // (TAKE / STORE / COMPS: the sub-tab strip under the main tabs, benchLines. No rule under it: the TAKE page needs the
  // rows for BIG LOCKER's 10 slots, Greg 2026-11-22.)
  T('');
  if (b.lkView === 'comps') return benchCompsLines(T, X);
  const rowOf = (e, i, sel, onTap, right, rightCol) => {
    const v = e.kind === 'mod' ? modView(e.key, e.tier) : itemView(e.key, e.tier);
    const row = { list: true, id: 'lk' + b.lkView + i, sel, onTap, name: v.name + (e.n > 1 ? 'x' + e.n : ''), right, rightCol };
    return Object.assign(row, e.kind === 'mod' ? { badge: e.key, badgeTier: e.tier } : { gear: e.key, gearTier: e.tier });
  };
  let e = null, box = null;
  if (b.lkView === 'take') {
    T(`in the locker  ${lk.filter(Boolean).length}/${lk.length}`, C.rep);
    T('');
    b.lkSel = clamp(b.lkSel, 0, lk.length - 1);
    lk.forEach((x, i) => x ? X(rowOf(x, i, i === b.lkSel, () => { b.lkSel = i; Sound.tick(); }, benchUpNote(x) || x.kind, benchUpNote(x) === 'upgrade' ? C.money : benchUpNote(x) ? C.dim : undefined))
      : X({ list: true, id: 'lkempty' + i, sel: i === b.lkSel, onTap: () => { b.lkSel = i; Sound.tick(); }, name: ':  .  :  empty', faded: true }));
    e = lk[b.lkSel];
    const up = e && benchUpNote(e);
    if (e) box = { box: true, text: up === 'upgrade' ? 'U P G R A D E' : 'T A K E', sub: up === 'upgrade' ? `- yours goes up to ${tierLabel(modView(e.key, upgradeTo(e.key, e.tier || 0)))} -` : up ? '- yours is maxed -' : e.kind === 'mod' ? '- into a mod slot -' : '- onto your belt -',
      id: 'bktake', onTap: () => benchTake(b.lkSel), minW: 22, col: up === 'upgrade' ? C.money : undefined, disabled: up === 'maxed' };
  } else {
    const list = benchStoreList();
    T('from your tray', C.rep);
    T('');
    b.stSel = clamp(b.stSel, 0, Math.max(0, list.length - 1));
    for (let i = 0; i < Math.max(5, list.length); i++) { const x = list[i];
      if (x) X(rowOf(x, i, i === b.stSel, () => { b.stSel = i; Sound.tick(); }, x.kind === 'mod' ? 'mod: equipped' : 'gear', x.kind === 'mod' ? C.money : C.mid));
      else T(''); }
    e = list[b.stSel];
    const full = !lk.some(x => !x);
    if (e) box = { box: true, text: 'S T O R E', sub: full ? '- the locker is full -' : e.kind === 'mod' ? '- unequip it -' : '- into the locker -', id: 'bkstore', onTap: () => benchStore(benchStoreList()[b.stSel]), minW: 22, col: C.rep, disabled: full && !(e.kind === 'gear' && lk.some(x => x && x.key === e.key)) };
  }
  if (lk.length <= BENCH.locker || b.lkView !== 'take') T('');   // (10 slots: no room for the gap)
  T(SEP, C.dim);
  if (e) { const v = e.kind === 'mod' ? modView(e.key, e.tier) : itemView(e.key, e.tier);
    X(e.kind === 'mod' ? { badge: e.key, badgeTier: e.tier } : { gearHead: e.key, gearTier: e.tier, text: v.name });
    T(v.tip || '', C.text); X(box); }
  else { T(b.lkView === 'take' ? 'an empty slot.' : 'nothing on you.', C.mid); T('what you build lands here.', C.dim); T(''); T(''); T(''); T(''); }
  T(SEP, C.dim);
  T(b.log[b.log.length - 1].replace(/^> /, ''), C.accent);
}

// The LOCKER's COMPS: the components you've banked (they live here too, between runs), each a 2x2 chip with its count
// (Greg, 2026-11-22: their own sub-tab, bigger). A row of air between rows of chips when it fits over the keyboard.
function benchCompsLines(T, X) {
  const b = st.bench, letters = benchSave().letters, keys = Object.keys(letters).filter(ch => letters[ch] > 0)
    .sort((p, q) => (p === '*') - (q === '*') || /[0-9]/.test(p) - /[0-9]/.test(q) || p.localeCompare(q));
  T(`components  ${benchCount()}`, C.rep);
  T('');
  if (!keys.length) { T('none yet. shred things.', C.dim); return; }
  const per = clamp(Math.floor((L.wc + 1) / 5), 5, 8), lines = Math.ceil(keys.length / per);
  const room = Math.max(20, Math.floor((benchKbGeom().top - L.oy) / L.chh)) - 9;   // (the header, sub-tabs and the two lines above)
  const pitch = lines * 3 - 1 <= room ? 3 : 2;
  X({ h: lines * pitch - (pitch - 2), draw: (ctx, y) => {
    const x0 = Math.floor((L.wc - (per * 5 - 1)) / 2);
    keys.forEach((ch, i) => { const x = x0 + (i % per) * 5, yy = y + Math.floor(i / per) * pitch;
      benchBlock(ctx, x, yy, ch, { size: 2, t0: b.lkT || 0, seed: i });
      ctx.put(x + 2, yy + 1, String(letters[ch]), C.mid, 'ui'); });
  } });
}

// ---------------- the keyboard layer (pixels; render.js calls this after the grid) ----------------
function benchKbGeom() {
  const gw = L.wc * L.cw, gap = Math.max(3, Math.round(L.cw * 0.35));
  const kw = (gw - 9 * gap) / 10, kh = Math.min(kw * 1.3, L.chh * 2.2), pad = gap * 2;
  const h = 5 * kh + 5 * gap + pad * 2;
  return { x0: L.ox, gw, gap, kw, kh, pad, h, top: H - SAFE.b - h };
}
function benchKeys(now) {
  const b = st.bench;
  if (!b || st.mode !== 'panel' || st.panelFn !== benchLines || st.dev || st.pause) return;
  if (st.callBox || st.phish || st.qScene || st.featBox || st.ad) return;   // (a CALL, PH1SH's ad, a quest scene (ROOT's, over BUILD: Greg 2026-11-21), a FEAT box or an ad is up: the keyboard steps aside)
  const G = benchKbGeom(), k = clamp((now - b.kb.t0) / BENCH.slideMs, 0, 1);
  const off = b.kb.up ? (1 - ease3(k)) * (G.h + SAFE.b + 8) : ease3(k) * (G.h + SAFE.b + 8);
  if (!b.kb.up && k >= 1) return;
  if (b.kb.up && k <= 0) return;
  const top = G.top + off;
  g.fillStyle = C.bg; g.fillRect(0, top, W, H - top + 2);
  g.globalAlpha = 0.22; g.fillStyle = C.dim; g.fillRect(0, top, W, H - top + 2); g.globalAlpha = 1;
  g.fillStyle = C.accent; g.fillRect(0, top, W, 1);
  const live = b.kb.up && k >= 1 && !benchBusy();
  const font = (w, px) => `${w} ${px}px ${DRAW_FONT.family}`;
  const press = b.press;
  const key = (x, y, w, ch, n, onTap = null, label = null, look = null) => {
    const hov = st.ptr && st.ptr.x >= x && st.ptr.x <= x + w && st.ptr.y >= y && st.ptr.y <= y + G.kh && live;
    if (n <= 0 && !onTap) {
      g.strokeStyle = C.dim; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, G.kh - 1);
      g.fillStyle = C.dim; g.font = font(DRAW_FONT.bold, Math.round(G.kh * 0.42)); g.fillText(ch, x + w / 2, y + G.kh / 2);
      return;
    }
    const chip = look || letterChip(ch);
    g.fillStyle = chip.bg; g.globalAlpha = hov ? 0.8 : 1; g.fillRect(x, y, w, G.kh); g.globalAlpha = 1;
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x, y + G.kh - 3, w, 3);
    g.fillStyle = chip.fg; g.font = font(DRAW_FONT.bold, Math.round(label ? G.kh * 0.28 : G.kh * 0.46));
    g.fillText(label || ch, x + w / 2, y + G.kh / 2 - 1);
    if (!label && n > 0) { g.font = font(DRAW_FONT.bold, Math.round(G.kh * 0.24)); g.textAlign = 'right'; g.fillText(n > 15 ? '+' : n.toString(16).toUpperCase(), x + w - 2, y + G.kh - 8); g.textAlign = 'center'; }
    if (live) hits.push(onTap ? { x, y, w, h: G.kh, kind: 'btn', id: 'bk_' + (label || ch), onTap } : { x, y, w, h: G.kh, kind: 'benchkey', key: ch });
  };
  g.textAlign = 'center'; g.textBaseline = 'middle';
  let y = top + G.pad;
  // the special row: wildcards (and later, the DIVINE letters)
  g.fillStyle = C.mid; g.font = font(DRAW_FONT.weight, Math.round(G.kh * 0.24)); g.textAlign = 'left';
  g.fillText('SPECIAL', G.x0, y + G.kh / 2); g.textAlign = 'center';
  let x = G.x0 + G.kw * 1.6 + G.gap;
  const sp = BENCH_SPECIAL.concat(ROOT_WORD.split('').filter((c, i, a) => a.indexOf(c) === i)).filter(ch => benchHave(ch) > 0);   // (ROOT's letters: engine/quests.js)
  for (let i = 0; i < 6; i++) {
    const ch = sp[i];
    if (ch) key(x, y, G.kw, ch, benchHave(ch));
    else { g.setLineDash([3, 3]); g.strokeStyle = C.dim; g.strokeRect(x + 0.5, y + 0.5, G.kw - 1, G.kh - 1); g.setLineDash([]); }
    x += G.kw + G.gap;
  }
  y += G.kh + G.gap;
  g.fillStyle = C.dim; g.fillRect(G.x0, y - G.gap / 2, G.gw, 1);
  BENCH_KB.forEach((row, r) => {
    const extra = r === 3 ? 2 * (G.kw * 1.5) + 2 * G.gap : 0;
    let x = G.x0 + (G.gw - (row.length * G.kw + (row.length - 1) * G.gap + extra)) / 2;
    if (r === 3) { key(x, y, G.kw * 1.5, 'DEL', 1, () => { Sound.keyclick(); const i = [4, 3, 2, 1, 0].find(i => b.slots[i]); if (i != null) benchUnplace(i); }, 'DEL', chipOf('scrap')); x += G.kw * 1.5 + G.gap; }
    for (const ch of row) { key(x, y, G.kw, ch, benchHave(ch)); x += G.kw + G.gap; }
    if (r === 3) key(x, y, G.kw * 1.5, 'ENTER', 1, () => { Sound.keyclick(); benchBuild(); }, 'ENTER', { bg: C.accent, fg: C.bg });
    y += G.kh + G.gap;
  });
  // a key (or a slot's letter) riding your finger
  if (press && press.moved && press.px != null) {
    const ch = press.kind === 'benchkey' ? press.key : b.slots[press.slot];
    if (ch) { const c = letterChip(ch), w = G.kw * 1.2, h = G.kh * 1.2;
      g.globalAlpha = 0.9; g.fillStyle = c.bg; g.fillRect(press.px - w / 2, press.py - h * 0.8, w, h);
      g.fillStyle = c.fg; g.font = font(DRAW_FONT.bold, Math.round(h * 0.5)); g.fillText(ch, press.px, press.py - h * 0.3); g.globalAlpha = 1; }
  }
}
// One piece of a big letter (a cell with its part of a 3x size letter; render.js).
function drawPiece(c) {
  const p = c.piece, x = L.ox + c.cx * L.cw, y = L.oy + c.cy * L.chh;
  g.save();
  g.globalAlpha = p.a == null ? 1 : p.a;
  g.beginPath(); g.rect(x, y, L.cw + 0.6, L.chh + 0.6); g.clip();
  g.fillStyle = p.bg; g.fillRect(x, y, L.cw + 0.6, L.chh + 0.6);
  const n = p.n || 3;   // (a 3x3 letter, or the extra slot's 2x2)
  g.fillStyle = c.col; g.font = `${DRAW_FONT.bold} ${L.fs * 2.7 * n / 3}px ${DRAW_FONT.family}`;
  g.fillText(p.ch, x + (n / 2 - p.px) * L.cw, y + (n / 2 + 0.05 - p.py) * L.chh);
  g.restore();
}

// Pointer: press a key (or a filled slot); lift in place = a tap, drag onto a slot = put it there.
function benchPointer(type, e) {
  const b = st.bench;
  if (!b || st.mode !== 'panel' || st.panelFn !== benchLines || st.dev || st.pause || st.swap || st.callBox || st.phish) return false;
  const [px, py] = ptXY(e);
  if (type === 'down') {
    if (benchBusy() || b.tab !== 'build') return false;
    const h = hitAt(px, py);
    if (h && h.kind === 'benchkey') { b.press = { kind: 'benchkey', key: h.key, x: px, y: py, moved: false }; Sound.keyclick(); return true; }
    if (h && h.kind === 'benchslot' && b.slots[h.slot]) { b.press = { kind: 'benchslot', slot: h.slot, x: px, y: py, moved: false }; return true; }
    return false;
  }
  const p = b.press;
  if (!p) return false;
  if (type === 'move') { if (!p.moved && Math.hypot(px - p.x, py - p.y) > 8) p.moved = true; p.px = px; p.py = py; return false; }
  if (type === 'cancel') { b.press = null; return true; }
  b.press = null;
  if (!p.moved) { if (p.kind === 'benchkey') benchPlace(p.key); else benchUnplace(p.slot); return true; }
  const s = hits.slice().reverse().find(h => h.kind === 'benchslot' && px >= h.x && px <= h.x + h.w && py >= h.y && py <= h.y + h.h);
  if (p.kind === 'benchkey') { if (s) benchPlace(p.key, s.slot); }
  else if (s && s.slot !== p.slot && s.slot < 3 && p.slot < 3) { const a = b.slots[p.slot]; b.slots[p.slot] = b.slots[s.slot]; b.slots[s.slot] = a; b.slotT[p.slot] = b.slotT[s.slot] = performance.now(); Sound.lamp(); }
  else if (!s) benchUnplace(p.slot);
  return true;
}
