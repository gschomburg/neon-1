// tools/checks/tests/deckmore.js: the deck's last loose ends (Greg, 2026-11-22, v15.52): HCF'S CORE (the exotic RIPPED
// cell, from any rival or THE FENCE), FUSE II (+4 for mk IV), SELF DESTRUCT (die: everything into letters), give.chip
// (SUDO: a chip you've shredded), and the CREW JACKS on the NO POWER bar. Run by tools/test.js.
module.exports = { name: 'deckmore', body: `
  save.legacy = save.legacy || {}; const lg0 = Object.assign({}, save.legacy);
  // HCF'S CORE: exotic, RIPPED, power 18, rare among the ripped drops
  check(deckIsRipped('HF9') && DECK_CHIPS.HF9[2] === 'exotic' && deckCellPower('HF9') === 18, "HCF'S CORE: an exotic RIPPED cell, power 18");
  { const r = rngFor('HCF', 'x'); let n = 0; for (let i = 0; i < 3000; i++) if (deckRollRipped(r) === 'HF9') n++;
    check(n > 0 && n < 60, 'it comes from the ripped rolls (rivals, THE FENCE), rarely: ' + n + ' in 3000');
    let h = 0; for (let i = 0; i < 3000; i++) if (deckRollRipped(r, 'hcf') === 'HF9') h++;
    check(h > 450 && h < 900, 'beat HCF: its own CORE, about 1 drop in 5: ' + h + ' in 3000'); }
  // FUSE II: +4 for mk IV
  save.deck = save.deck || deckFreshSave(); Object.assign(save.legacy, { deck3: 1, fuse: 1, fuse2: 0 });
  DECK = deckReal(); const f0 = deckPower().fuse.budget; save.legacy.fuse2 = 1; DECK = deckReal(); const f1 = deckPower().fuse.budget;
  check(f1 === f0 + 4, 'FUSE II: the FUSE +4: ' + f0 + ' -> ' + f1);
  check(LEGACY.some(u => u.key === 'fuse2' && u.tier === 4 && u.needs === 'fuse'), 'FUSE II is a SYSOP post (needs THE FUSE)');
  // the jacks on the NO POWER bar: a tap opens their window on the one with no power
  Object.assign(save.legacy, { crew_nana: 1, crew2_nana: 1, crew_brick: 1, crew2_brick: 1, power: 0, power2: 0 });
  save.deck.crew = ['nana', 'brick'];
  openDeck(); await sleep(300); CALL_QUEUE.length = 0; if (st.callBox) callClose();
  DECK.slots = { PSU: 'SC1', BT2: 'BM4', CRS: 'BB7' }; DECK.order = ['PSU', 'BT2', 'CRS']; DECK.msg = null; DECK.pick = null;   // (power 6, 4 to the chips: the 2nd LVL 2 jack has none)
  const pw = deckPower();
  check(pw.crewOff.includes('brick') && pw.crewOn.includes('nana'), 'a jack with no power: ' + JSON.stringify([pw.crewOn, pw.crewOff]));
  render(performance.now()); const bar = hits.find(h => h.id === 'dkbar');
  check(!!bar, 'the NO POWER bar shows it');
  bar.onTap(); await sleep(100);
  check(DECK.pick && DECK.pick.id === 'CREW' && DECK.pick.sel === 'brick', 'a tap opens the jacks, on BRICK');
  check(buildScene(performance.now(), false).length > 300, 'it draws');
  DECK.pick = null; DECK = null; save.deck.crew = [];
  // a run: SELF DESTRUCT and give.chip
  save.legacy.bench = 1; B.startRun('DECKMORE', false); await settle('start');
  const run = st.run; run.mods = []; addMod('tracer', 0); addMod('buffer', 0); addItem('patch', 0);
  const n0 = Object.values(benchSave().letters).reduce((a, b) => a + b, 0); FEAT_QUEUE.length = 0;
  run.chips = ['SD6']; deckSelfDestruct(run);
  const n1 = Object.values(benchSave().letters).reduce((a, b) => a + b, 0);
  check(n1 > n0 && FEAT_QUEUE.some(f => f.head === 'SELF DESTRUCT'), 'SELF DESTRUCT: your mods and gear, as WORKBENCH letters: +' + (n1 - n0));
  save.shredded = save.shredded || {}; save.shredded.chip_QT0 = 0; delete save.shredded.chip_OMNI;
  check(deckGiveChipList().some(o => o.v === 'QT0') && !deckGiveChipList().some(o => o.v === 'OMNI'), 'give.chip lists the chips you shredded (no BOSS ones)');
  const b0 = run.items.length; deckGiveChip(['qt0']);
  check(run.items.some(x => x.key === deckChipItem('QT0')) && run.hacked, 'give.chip: on your belt (marked hacked)');
  let threw = false; try { deckGiveChip(['LI2']); } catch (e) { threw = /shred/.test(e.message); } check(threw, 'not shredded: it says so');
  check(!!SHELL_BY['give.chip'].play && SHELL_BY['give.chip'].play.chip === 'GC4', 'THE SHELL: the player give.chip comes from its chip');
  // OWNED: a chip your deck has says so; one it doesn't says nothing (no NEW)
  save.deck.chips.QT0 = 1; delete save.deck.chips.LU6;
  check(/^OWNED\\./.test(ITEMS[deckChipItem('QT0')].tip) && !/NEW|OWNED/.test(ITEMS[deckChipItem('LU6')].tip), 'the belt tip: OWNED, or nothing');
  check(deckChipNote(deckChipItem('QT0')) === 'OWNED' && deckChipNote(deckChipItem('LU6')) === 'cash out to keep it', 'the cards: OWNED, or cash out to keep it');
  // BETTER DROPS and LUCK: chips roll rarer too (rolled twice, the rarer kept)
  { const avg = () => { const r = rngFor('LUCKY', 'x'); let t = 0; for (let i = 0; i < 2000; i++) t += RARITY_ORDER.indexOf(DECK_CHIPS[deckRollChip(r)][2]); return t / 2000; };
    run.chips = []; save.legacy.drops = 0; save.legacy.drops2 = 0; const a0 = avg(); run.chips = ['LK7']; const a1 = avg(); run.chips = [];
    check(a1 > a0 + 0.05, 'LUCK: chips roll rarer: ' + a0.toFixed(2) + ' -> ' + a1.toFixed(2)); }
  save.legacy = lg0;
`};
