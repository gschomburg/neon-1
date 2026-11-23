// tools/checks/tests/chips.js: the deck's second chip set (engine/deck.js, docs/DECK.md "The second chip set"). Their data
// holds together, BETA chips never drop, the cells' power, and each chip's hook does its job in a run.
module.exports = { name: 'chips', body: `
  const keys = Object.keys(DECK_CHIPS), RAR = ['scrap', 'common', 'rare', 'epic', 'legendary', 'exotic'];
  const bad = keys.filter(k => { const c = DECK_CHIPS[k]; return (c.length !== 7 && c.length !== 8) || !DECK_GROUPS[c[1]] || !RAR.includes(c[2]) || !(c[3] >= 0 && c[3] <= 3) || c[5][0].length !== (c[1] === 'boss' ? 5 : 3) || !DECK_CHIP_TAGS[k]; });
  check(!bad.length, 'every chip: 7 fields, a group, a rarity, power 0-3, a face of the right width, tags: ' + bad.join(' '));
  check(new Set(keys.map(k => DECK_CHIPS[k][0])).size === keys.length, 'no two chips share a name');
  check(keys.length >= 70, 'the second set is in: ' + keys.length + ' chips');
  check(Object.keys(DECK_BETA).every(k => DECK_CHIPS[k]), 'every BETA chip exists');
  { const r = rngFor('BETA', 'x'), got = new Set(); for (let i = 0; i < 3000; i++) got.add(deckRollChip(r));
    check(![...got].some(deckBeta) && !got.has('1UP') && !got.has('SC1'), 'BETA chips (and the 1UP, the starter chips) never drop'); }

  // the cells
  openDeck({ dev: true }); await sleep(300);
  deckSlot('PO1', 'PSU'); let p = deckPower();
  check(p.budget === 4 && deckChipCost('TF1') === 0 && deckChipCost('LD3') === 2, 'POTATO: power 4, the 1s are free');
  save.deck = save.deck || deckFreshSave(); save.deck.windup = 3;
  check(deckCellPower('WU3') === 8, 'WIND-UP: 2, +2 a sector of your last cash-out: ' + deckCellPower('WU3'));
  save.deck.windup = 9; check(deckCellPower('WU3') === 14, '...14 at most');
  check(deckCellPower('BO1') === 12 && deckCellPower('SPC') === 15, 'BROWNOUT 12, SPORE CELL 15');
  DECK = null;

  // a real deck, and a run with chips
  const deckWith = slots => { save.deck = Object.assign(deckFreshSave(), { slots: Object.assign({ PSU: 'RX9' }, slots), order: ['PSU'].concat(Object.keys(slots)) }); for (const k of Object.values(save.deck.slots)) save.deck.chips[k] = 1; };
  save.legacy = save.legacy || {};
  // KITs (v15.38): JUNK DRAWER 3 of its 6, PRELOAD 2 gear; PURGE is a chip with the deck
  deckWith({ BT1: 'JD6', BT2: 'PG0' });
  B.startRun('CHIPTEST0', false); await settle('start');
  const jd = st.run.mods.filter(k => ['wires', 'coolant', 'skimmer', 'buffer', 'burner', 'stash'].includes(k));
  check(chipOn('JD6') && jd.length === 3, 'JUNK DRAWER: 3 of its low mods: ' + jd.join(' '));
  check(st.run.items.some(o => o.key === 'purge'), 'the PURGE chip: a PURGE');
  deckWith({ BT1: 'PL3', BT2: 'TF1' });
  B.startRun('CHIPTEST', false); await settle('start');
  let run = st.run;
  check(!run.items.some(o => o.key === 'purge'), 'a deck without the PURGE chip: no PURGE');
  check(run.items.filter(o => !ITEMS[o.key].quest).reduce((a, o) => a + o.n, 0) === 2, 'PRELOAD: 2 gear: ' + run.items.map(o => o.key).join(' '));
  if (st.lv) { await B.pick(st.lv.safe); await settle('public'); }
  if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  run = st.run;
  const on = ks => { run.chips = ks; };
  on(['CH1']); check(Math.abs(deckPriceMult() - 0.8) < 1e-9, 'CHEAPSKATE: markets -20%');
  on(['IF1']); run.sector = 2; check(Math.abs(deckPriceMult() - 1.2) < 1e-9, 'INFLATION: +10% a sector'); run.sector = 0;
  on(['TP1']); const fee0 = (run.chips = [], uplinkMin()); on(['TP1']); check(uplinkMin() < fee0, 'TOLL PASS: the UPLINK costs less: ' + fee0 + ' > ' + uplinkMin());
  on(['LG2']); check(deckClock() === 2, 'LAG: +2s'); on(['SF2']); check(deckClock() === -2, 'SHORT FUSE: -2s');
  on([]); const rep0 = repFor(run); on(['HN1']); check(repFor(run) >= Math.floor(rep0 * 1.25) && deckRepMult(run) === 1.25, 'a HEAT chip pays REP: x' + deckRepMult(run));
  run.perfects = 10; on([]); const rp = repFor(run); on(['PD2']); check(repFor(run) === rp - 10, 'PADDING: perfects pay no REP'); run.perfects = 0;
  on(['OF1']); check(deckSpoils(run) === 3, 'OFFERING is a SPOILS'); run.repBonus = 6; on([]); check(repFor(run) === rep0 + 6, 'OFFERING: its REP counts'); run.repBonus = 0;
  on(['PT1']); check(deckSpoils(run) === 4, 'PROTECTION is a SPOILS');
  on(['OB1']); run.depth = 31; check(deckDeadman(run) === 1, 'OBITUARY: past 30, all your REP'); run.depth = 5; check(deckDeadman(run) === 0, '...not before');
  on(['UV1']); check(deckCredits(100, run) === 75, 'UNDERVOLT: -25% credits');
  on(['GL2']); const cr0 = run.credits; deckIceHit({}); check(run.credits === cr0 + 8, 'GLASS: an ICE hit pays 8cr');
  on(['HN1']); const n0 = Object.values(run.map).filter(n => n.type === 'corp' && deckRivalComes(n)).length; check(n0 > 0, 'HUNTED: rivals turn up: ' + n0);
  on([]); addItem(deckChipItem('LW1'), 0); check(Object.values(run.map).filter(n => n.type === 'corp' && (!n.mod || n.mod === 'rival')).every(deckRivalComes), 'a RIPPED chip: a rival in every corp without another anomaly (more: tests/ripped.js)'); takeItem(deckChipItem('LW1'));
  on(['DC4']); run.mods = run.mods.filter(k => k !== 'tracer'); addMod('tracer', 1); deckSector(run); check(run.modTier.tracer === 0, 'DECAY: a mod drops a step');
  on(['IN5', 'DD3']); run.credits = 90; deckDeath(run); check(save.deck.insured === 45 && save.deck.deadDrop && save.deck.deadDrop.length > 0, 'INSURANCE and DEAD DROP: saved on a death');
  const run2 = { credits: 0, practice: false }; deckRunCarry(run2); check(run2.credits === 45 && run2.deadDrop && !save.deck.insured && !save.deck.deadDrop, '...and paid out next run');
  on(['CP0']); { const lv0 = st.lv; st.lv = lv0 || { tiles: [] }; check(deckCheckpoint(run) && run.mods.length === 0 && run.items.length === 0 && run.integrity === run.maxInt, 'CHECKPOINT: back with nothing, full INT');
  check(!deckCheckpoint(run), '...once a run'); st.lv = lv0; }
  on(['RE1']); { const lv = { n: 5, tiles: [0, 1, 2, 3, 4].map(i => ({ safe: i === 2, loaded: false })) }; deckLayer(lv, { node: { id: 'x' }, idx: 0 }); check(lv.tiles.filter(t => t.ruledOut).length === 1 && !lv.tiles[2].ruledOut, 'RED EYE: one ICE marked'); }
  on([]); DECK_ALWAYS = true;
  check(!!deckShopChip({ id: 'n1' }, 0) && deckShopChip({ id: 'n1' }, 0).price > 0, 'a market can sell a chip');
  check(!!deckBossChip({ id: 'n1' }), 'a boss reward can be a chip');
  check(!!deckFenceChip({ id: 'n1' }) && deckFenceChip({ id: 'n1' }).price > 0, 'THE FENCE sells a ripped chip');
  DECK_ALWAYS = false;
  on(['GE1']); check(deckGearRewards({ id: 'n1' }).length === 3 && deckGearRewards({ id: 'n1' }).every(o => o.kind === 'gear'), 'GEAR: 3 gear for the boss rewards');
  check(DECK_SHELL_CMDS.some(c => c.name === 'eject' && c.chip === 'EJ1'), 'EJECT teaches eject');
  save.deck.windup = 0; deckCashedOut(Object.assign({}, run, { sectorsCleared: 2 })); check(save.deck.windup === 2, 'a cash-out winds up WIND-UP');
`};
