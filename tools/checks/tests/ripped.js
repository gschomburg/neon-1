// tools/checks/tests/ripped.js: RIPPED chips (engine/deck.js, Greg 2026-11-21): their own set, only from rivals and THE
// FENCE; while one is on your belt a rival comes to every corp without another anomaly; sell or lose it and that's off;
// a rival that gets away takes one back; POPS's two calls; their effects. Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'ripped', body: `
  save.deck = save.deck || deckFreshSave();
  B.startRun('RIPTEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  if (st.evCard) closeEventCard();
  const run = st.run;
  const r = rngFor('RIPTEST', 'check');
  { let plain = true, ripped = true;
    for (let i = 0; i < 300; i++) { if (deckIsRipped(deckRollChip(r))) plain = false; if (!deckIsRipped(deckRollRipped(r))) ripped = false; }
    check(plain && ripped, 'the usual drops never roll a ripped chip; rivals and the fence only roll them'); }
  const fence = Object.values(run.map).find(n => n.type === 'corp');
  check(deckIsRipped(deckFenceChip(fence).key), 'THE FENCE sells a ripped one'); run.fenceChip = null;
  const ik = deckChipItem('LW1');
  check(/RIPPED/.test(ITEMS[ik].tip) && /RIPPED/.test(ITEMS[ik].desc) && !ITEMS[ik].nosell && gearValue(ik, 0) > 0, 'it says RIPPED, and it sells: ' + ITEMS[ik].tip);

  // the chase: every corp, unless it has another anomaly
  const node = Object.values(run.map).find(n => n.type === 'corp' && !n.mod);
  const anom = Object.assign({}, node, { mod: 'blinders' });
  check(!deckRippedOn(run) && !deckRivalComes(node), 'no ripped chip: no rival');
  addItem(ik, 0);
  check(deckRippedOn(run) && deckRivalComes(node), 'a ripped chip on the belt: a rival comes');
  check(!deckRivalComes(anom), 'a corp with another anomaly: the anomaly, no rival');
  addItem(deckChipItem('TN2'), 0);
  check(deckRivalComes(node), 'two: no worse than one');
  takeItem(deckChipItem('TN2')); takeItem(ik);
  check(!deckRippedOn(run) && !deckRivalComes(node), 'sold or trashed: the heat is off');

  // POPS: the first one you get
  CALL_QUEUE.length = 0; st.callBox = null; save.deck.ripSeen = false; save.deck.ripLost = false;
  const pops = re => CALL_QUEUE.concat(st.callBox ? [st.callBox] : []).filter(c => c.who === 'pops' && c.lines.some(l => re.test(l)));
  deckRipFirst(); deckRipFirst();
  check(save.deck.ripSeen && pops(/RIPPED/).length === 1, 'the first ripped chip: POPS calls, once');

  // a rival that got away takes one back; one you beat doesn't
  const rid = HK_RIVALS.find(k => k !== 'd0g' && k !== 'w00f');
  addItem(ik, 0);
  hkCorpEnd({ hk: [{ id: rid, side: 'bad', out: true, stole: 0 }] });
  check(run.items.some(s => s.key === ik), 'a rival you flatlined: you keep it');
  hkCorpEnd({ hk: [{ id: rid, side: 'bad', out: false, stole: 1, exorcised: true }] });
  check(run.items.some(s => s.key === ik), 'one you threw out: you keep it');
  hkCorpEnd({ hk: [{ id: rid, side: 'bad', out: false, stole: 1 }] });
  check(!run.items.some(s => s.key === ik) && save.deck.ripLost && pops(/got away/).length === 1, 'one that got away: it takes it back, POPS calls');
  CALL_QUEUE.length = 0; st.callBox = null;

  // a rival you beat drops a ripped one
  DECK_ALWAYS = true; st.corp = st.corp || { node };
  const line = deckRivalChip({ id: rid }); DECK_ALWAYS = false;
  const got = run.items.find(s => ITEMS[s.key].ripped);
  check(/RIPPED/.test(line || '') && got, 'a beaten rival drops a ripped chip: ' + line);
  if (got) takeItem(got.key);

  // the effects
  run.chips = ['VE2']; check(deckRivalPay() === 1.5, "VULTURE'S CUT: rivals pay +50%");
  run.chips = ['SY4'];
  { const lv = { tiles: [{ safe: true }, {}, {}], safe: 0, n: 3 }; deckLayer(lv, { idx: 0, hasBoss: true, node }); check(lv.tiles[0].zd, "SYSOP'S KEY: the first layer's real node is marked");
    const lv2 = { tiles: [{ safe: true }, {}, {}], safe: 0, n: 3 }; deckLayer(lv2, { idx: 1, hasBoss: true, node }); check(!lv2.tiles[0].zd, 'not the second'); }
  run.chips = [];
  check(DECK_INT.DM3 === 2, "D0PPEL'S MASK: +2 INT");

  // THE FENCE: the chip is a row in its list, under your stolen mods (gear's code chip, like a market's)
  { const mk = Object.keys(MODS).find(k => !has(k) && !MODS[k].hidden); run.fence = [{ key: mk, tier: 0 }]; run.fenceChip = null; run.credits = 999;
    openFence(fence); await sleep(500);
    const hit = id => hits.find(h => h.id === id);
    check(st.mode === 'panel' && hit('fence0') && hit('fence1') && !hit('fchip'), 'the fence: a mod row, then the chip row');
    hit('fence1').onTap(); await sleep(200);
    check(!!hit('fchip'), 'pick the chip: its BUY box');
    const before = run.items.length; hit('fchip').onTap(); await sleep(200);
    check(run.items.length === before + 1 && deckRippedOn(run) && run.fenceChip.sold && !hit('fence1'), 'bought: on your belt, ripped, gone from the list');
    run.items = run.items.filter(s => !ITEMS[s.key].ripped); run.fence = []; leavePanel && leavePanel(); await sleep(300); }

  // the look: magenta runs through it
  { let n = 0; deckRipGlow((x, y, col, a) => { if (col === DECK_RIP_COL && a > 0) n++; }, 0, 0, 3, 1000); check(n > 0, 'the glow paints magenta'); }
` };
