// tools/checks/tests/craft.js: crafting chips and blueprints at the workbench (engine/bench.js, Greg 2026-11-21): a BLANK
// in its slot makes the three slots spell a chip's code (digits too); chips above rare and every exotic need a blueprint,
// learned by shredding one; a bound mod (ZOMBIE) teaches its blueprint and stays; shredding a chip gives its digit; the
// BUILD screen's BLANK slot and the result under the letters. Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'craft', body: `
  const closeCalls = async () => { for (let k = 0; k < 6 && (st.callBox || CALL_QUEUE.length); k++) { if (st.callBox) callClose(); await sleep(120); } };
  save.deck = save.deck || deckFreshSave();
  const R = benchRecipes(), chipRc = Object.values(R).filter(rc => rc.kind === 'chip');
  check(chipRc.length > 50 && chipRc.every(rc => /[0-9]/.test(rc.code) && !deckIsRipped(rc.chip) && DECK_CHIPS[rc.chip][1] !== 'boss' && !DECK_NO_DROP.includes(rc.chip)), 'chip recipes: ' + chipRc.length + ', none ripped, BOSS or from the deck / a quest');
  check(letterTier('A') === letterTier('A') && letterTier('#') === 'epic', 'a BLANK is an epic component');
  check(recipeNeedsBp(R.EAT) && !recipeNeedsBp(R.CD2) && recipeNeedsBp(R.WI5), 'blueprints: exotics and chips above rare (whois: epic), not a rare chip');

  await shellBench(); await swapTo(() => openBench({ id: 'test-rest', type: 'rest', sector: st.run.sector })); await settle('bench');
  await closeCalls(); CALL_QUEUE.length = 0;
  const b = st.bench, L0 = save.bench.letters, bp0 = save.bench.blueprints;
  save.bench.blueprints = {};
  st.bench.tab = 'build'; benchPanel(); await sleep(200);
  const clear = () => [4, 3, 2, 1, 0].forEach(i => benchUnplace(i, true));
  Object.assign(L0, { C: 3, D: 3, '2': 2, '1': 2, '#': 3, W: 2, I: 2, '5': 2 });
  const seen0 = save.seen[deckChipItem('CD2')]; save.seen[deckChipItem('CD2')] = false; const had = save.deck.chips.CD2; save.deck.chips.CD2 = 0;

  // no BLANK: a digit can't go in a letter slot, a '1' can't go anywhere
  benchPlace('C'); benchPlace('D'); benchPlace('2');
  check(b.slots[3] === '2' && !b.slots[2], 'no BLANK: 2 goes in the x slot');
  benchPlace('1'); check(!b.slots.includes('1'), 'no BLANK: 1 has nowhere to go');
  clear();
  // a BLANK: digits are letters, the x slot empties
  benchPlace('2'); benchPlace('#');
  check(b.slots[4] === '#' && !b.slots[3], 'the BLANK goes in its slot; the x digit comes out');
  benchPlace('C'); benchPlace('D'); benchPlace('2');
  check(b.slots.slice(0, 3).join('') === 'CD2', 'with a BLANK: C D 2 spell it');
  check(benchJudge().kind !== 'ok', 'a chip you never had: not a recipe yet: ' + benchJudge().kind);
  save.seen[deckChipItem('CD2')] = true;
  check(benchJudge().kind === 'ok' && benchJudge().code === 'CD2', 'had one: CD2 is ok');
  await sleep(150);
  const bk = hits.find(h => h.id === 'bkbuild'), slot4 = hits.find(h => h.kind === 'benchslot' && h.slot === 4);
  check(bk && slot4 && bk.y > slot4.y + 1, 'the [ BUILD ] sits under the letters, the BLANK slot on the right: ' + (bk && bk.y) + ' ' + (slot4 && slot4.y));
  benchUnplace(4);
  check(!b.slots[4] && b.slots.slice(0, 3).join('') === 'CD', 'the BLANK out: the digit comes out too');
  benchPlace('#'); benchPlace('2');
  check(benchJudge().kind === 'ok', 'back in');
  const n0 = save.deck.chips.CD2 || 0, h0 = L0['#'];
  benchBuild(); for (let k = 0; k < 80 && b.anim; k++) await sleep(50);
  check((save.deck.chips.CD2 || 0) === n0 + 1 && L0['#'] === h0 - 1, 'built: into your deck, the BLANK spent');
  // without the BLANK, a chip code says so
  benchPlace('C'); benchPlace('D'); b.slots[2] = '2';
  check(benchJudge().kind === 'blank', 'C D 2 with no BLANK: it says a chip needs one: ' + benchJudge().kind);
  clear();

  // an epic chip: locked till you shred one
  save.seen[deckChipItem('WI5')] = true;
  benchPlace('#'); benchPlace('W'); benchPlace('I'); benchPlace('5');
  check(benchJudge().kind === 'lock', 'whois (epic): needs a blueprint');
  clear();
  st.run.items = st.run.items.filter(s => s.key !== deckChipItem('WI5')); addItem(deckChipItem('WI5'), 0);
  const d0 = Object.values(L0).reduce((a, n) => a + n, 0);
  b.shredAnim = null; benchShred(benchShredList().find(e => e.key === deckChipItem('WI5')));
  check(benchBp('WI5') && (L0['5'] || 0) >= 2, 'shred one: the blueprint, and its digit back');
  for (let k = 0; k < 160 && b.shredAnim; k++) await sleep(50); b.shredAnim = null;
  benchPlace('#'); benchPlace('W'); benchPlace('I'); benchPlace('5');
  check(benchJudge().kind === 'ok', 'now it builds: ' + benchJudge().kind + ' ' + JSON.stringify(b.slots) + ' busy ' + benchBusy());
  clear();

  // an exotic mod: shred it, learn it
  st.run.mods = st.run.mods.filter(k => k !== 'iceeater'); addMod('iceeater', 0);
  check(recipeLocked(R.EAT), 'ICE EATER: locked');
  b.shredAnim = null; benchShred(benchShredList().find(e => e.key === 'iceeater'));
  check(!recipeLocked(R.EAT) && !has('iceeater'), 'shredded: its blueprint, and it is gone');
  for (let k = 0; k < 160 && b.shredAnim; k++) await sleep(50); b.shredAnim = null;
  // a bound one: ZOMBIE stays
  if (!has('zombie')) { st.run.mods.push('zombie'); st.run.modTier.zombie = 0; }
  const l1 = JSON.stringify(L0);
  b.shredAnim = null; benchShred(benchShredList().find(e => e.key === 'zombie'));
  check(has('zombie') && !recipeLocked(R.ZMB) && JSON.stringify(L0) === l1 && !b.shredAnim, 'ZOMBIE is bound: the blueprint, it stays, no components');
  benchShred(benchShredList().find(e => e.key === 'zombie'));
  check(has('zombie') && /won't come apart/.test(b.log[b.log.length - 1]), 'again: it won\\'t come apart');
  removeMod('zombie');

  save.seen[deckChipItem('CD2')] = seen0; save.deck.chips.CD2 = had; save.bench.blueprints = bp0;
  check(DECK_CHIPS.BP1[0] === 'FREE PRESS', 'the BLUEPRINT chip is FREE PRESS now');
  check(BENCH.digits.some(d => d[0] === 1) && !Object.values(benchRecipes()).some(rc => rc.key === 'g0dexe'), 'shreds can give a 1; G0D.exe is no recipe');
  // POPS: the first BLANK
  CALL_QUEUE.length = 0; st.callBox = null; save.bench.blankSeen = false;
  benchTeach(['#']); benchTeach(['#']);
  check(save.bench.blankSeen && CALL_QUEUE.concat(st.callBox ? [st.callBox] : []).filter(c => c.lines.some(l => /BLANK/.test(l))).length === 1, 'the first BLANK: POPS explains, once');
  CALL_QUEUE.length = 0; st.callBox = null;
  // the BOOK: GEAR MODS CHIPS, each its own list
  benchTab('book'); await sleep(900);
  check(['bks_gear', 'bks_mod', 'bks_chip'].every(id => hits.find(h => h.id === id)), 'the BOOK has GEAR MODS CHIPS');
  hits.find(h => h.id === 'bks_chip').onTap(); await sleep(200);
  check(bookKind() === 'chip' && bookList().every(c => benchRecipes()[c].kind === 'chip'), 'CHIPS: only chips');
` };
