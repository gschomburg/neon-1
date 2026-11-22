// tools/checks/tests/jacks.js: the deck's CREW JACKS (Greg, 2026-11-22, v15.47): no chips; your hired crew plug in
// (a window, like the CPU's), each costs power (1, 2 at LVL 2), and their boon is on for the run. PARTY LINE (SYSOP) is
// a third jack. Run by tools/test.js.
module.exports = { name: 'jacks', body: `
  save.legacy = save.legacy || {};
  const lg0 = Object.assign({}, save.legacy);
  Object.assign(save.legacy, { deck3: 1, crew_nana: 1, crew_brick: 1, crew_mother: 1, crew_baud: 1, crew_root: 1, crew_pops: 1, crew_b0y: 1, crew2_nana: 0, jack3: 0 });
  save.deck = save.deck || deckFreshSave();
  save.deck.crew = ['NANA'];   // (a save from before: the old names)
  // the real deck: who can plug in, the jacks, the power
  DECK = deckReal();
  check(DECK.crew.has('nana') && !DECK.crew.has('NANA'), 'an old save: the names become crew ids');
  check(deckCrewPool().includes('nana') && !deckCrewPool().includes('hype'), 'only crew you hired can plug in');
  check(deckJackMax() === 2, '2 jacks with mk III');
  save.legacy.jack3 = 1; check(deckJackMax() === 3, 'PARTY LINE: a third'); save.legacy.jack3 = 0;
  check(LEGACY.some(u => u.key === 'jack3' && u.tier === 4 && u.needs === 'deck3'), 'PARTY LINE is a SYSOP post (needs mk III)');
  const b0 = deckPower(); check(b0.crewOn.includes('nana'), 'a jacked crew member gets power');
  DECK.crew.add('brick'); DECK.crew.add('baud');
  const p1 = deckPower(); check(deckJacked().length === 2 && !deckJacked().includes('baud'), 'past the jacks: not plugged in');
  save.legacy.crew2_nana = 1; const p2 = deckPower();
  check(p2.used === p1.used + 1, 'LVL 2 costs 2 power: ' + p1.used + ' -> ' + p2.used);
  save.legacy.crew2_nana = 0;
  // the window: it opens from the card, a row a crew member; plug in, unplug
  openDeck(); await sleep(300); DECK.crew = new Set(['nana']); deckTapPart('crew'); deckTapPart('crew'); await sleep(200);
  check(DECK.pick && DECK.pick.id === 'CREW', 'a second tap on the jacks opens their window');
  check(buildScene(performance.now(), false).length > 300, 'it draws');
  DECK.pick.sel = 'brick'; hits.find(h => h.id === 'dkgo').onTap(); await sleep(50);
  check(DECK.crew.has('brick'), '[ PLUG IN ]');
  DECK.pick.sel = 'baud'; buildScene(performance.now(), false); hits.find(h => h.id === 'dkgo').onTap();
  check(!DECK.crew.has('baud'), 'jacks full: no more');
  DECK.pick.sel = 'brick'; buildScene(performance.now(), false); hits.find(h => h.id === 'dkgo').onTap();
  check(!DECK.crew.has('brick'), '[ UNPLUG ]');
  DECK.pick = null; deckPersist();
  // a run: NANA's PATCH, BAUD's clock, MOTHER's heals, BRICK's block, ROOT's charge
  save.deck.crew = ['nana', 'baud'];
  B.startRun('JACKS', false); await settle('start');
  const run = st.run;
  check(jackLv('nana') === 1 && jackLv('baud') === 1, 'the jacks are on for the run: ' + JSON.stringify(run.jacks));
  check(run.items.some(x => x.key === 'patch'), 'NANA: a PATCH');
  run.jacks = {}; const c0 = deckClock(); run.jacks = { baud: 2 }; check(deckClock() === c0 + 2, 'BAUD LVL 2: clocks +2s');
  run.jacks = { mother: 1 }; check(deckRepairPrice(40) === 20, 'MOTHER: heals half');
  run.jacks = { mother: 2 }; run.sector = 0; check(deckRepairPrice(40) === 0, 'MOTHER LVL 2: the first a sector is free');
  deckRepairBought(); check(deckRepairPrice(40) === 20, '...then half');
  run.jacks = { brick: 1 }; st.corp = st.corp || { node: { id: 'x' } }; run.brickSec = null;
  check(deckBrickBlock() && !deckBrickBlock(), 'BRICK: the first ICE hit a sector is blocked, not the next');
  run.jacks = { root: 2 }; run.chips = ['WH0']; deckCharges(run); const ch2 = run.chargeMax; run.jacks = {}; deckCharges(run);
  check(ch2 === run.chargeMax + 2, 'ROOT LVL 2: +2 charges');
  // DIALUP: a TUNNEL (LVL 2 and a SKIP), every sector
  run.items = []; run.jacks = { dialup: 2 }; deckJackSector(run);
  check(run.items.some(x => x.key === 'tunnel') && run.items.some(x => x.key === 'skip'), 'DIALUP LVL 2: a TUNNEL and a SKIP');
  // POPS: a corp a sector you don't know shows its tell
  run.jacks = { pops: 1 }; run.popsTell = null;
  const sec = Object.values(run.map).filter(m => m.sector === 0 && m.type === 'corp' && CORP_TELL[m.corp] && !tellKnown(m.corp));
  const shown = sec.filter(m => deckPopsTell(m));
  check(!sec.length || shown.length === 1, 'POPS: one corp in the sector shows its tell: ' + shown.length + ' of ' + sec.length);
  // b0y: a corp's first layer of 5+ nodes, down to 3 maybes
  run.jacks = { b0y: 1 };
  const tiles = Array.from({ length: 7 }, (_, i) => ({ safe: i === 0 })), lv = { n: 7, tiles, safe: 0 };
  deckB0yJack(lv, { idx: 0, node: { id: 'n' } });
  check(tiles.filter(t => !t.ruledOut).length === 3 && !tiles[0].ruledOut, 'b0y: ICE ruled out till 3 maybes are left, the real node among them');
  const t2 = Array.from({ length: 7 }, (_, i) => ({ safe: i === 0 })); deckB0yJack({ n: 7, tiles: t2, safe: 0 }, { idx: 1, node: { id: 'n' } });
  check(!t2.some(t => t.ruledOut), '...only the first layer at LVL 1');
  save.legacy = lg0; save.deck.crew = [];
`};
