// tools/tests/simon.js: the SIMON corp (v14.55, docs/CORPS.md A33; Greg 2026-11-07): the pattern ends on the real node,
// a wrong step hurts and SIMON's ICE doesn't break, gear that takes ICE out takes its steps out, the real node early
// clears with no pay, ICE EATER is off here, REPEAT (its boss gear). Run by tools/test.js (a headless page).
module.exports = { name: 'simon', body: `
  await settle();
  B.startRun('SIMON1455', false); await settle('start');
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  const node = Object.values(st.run.map).find(n => n.type === 'corp'); node.corp = 'simon'; node.tier = 2;
  const layer = async idx => { startCorp(node, idx); for (let i = 0; i < 100 && !(st.lv && st.lv.simon && st.lv.simon.seq && !st.busy); i++) await sleep(100); return st.lv; };
  let lv = await layer(1), S = lv.simon;
  check(S.seq[S.seq.length - 1].t.safe && S.seq.length === 5, 'the pattern: 5 steps at tier 2, the last one real');
  check(lv.tiles.every(t => t.glyph[1].trim() === '[' + t.simonCh + ']' && !t.loaded), 'one character a node, no $ nodes');
  // a wrong step
  const nx = simonNext(lv), wrong = lv.tiles.find(t => t !== nx.t && !t.safe && t.state === 'closed');
  const hp = st.run.integrity; pick(lv.tiles.indexOf(wrong));
  for (let i = 0; i < 100 && (st.busy || st.run.integrity === hp); i++) await sleep(100);
  check(st.run.integrity === hp - 1 && wrong.state === 'closed', 'a wrong step hurts, the ICE stays');
  // play it back: the layer clears and pays
  const cr = st.run.credits;
  for (let k = 0; k < 10 && st.lv === lv; k++) { while (st.busy) await sleep(50); const n2 = simonNext(lv); pick(lv.tiles.indexOf(n2.t)); await sleep(n2.t.safe ? 1500 : 200); }
  check(st.lv !== lv && st.run.credits > cr, 'played back: the layer clears and pays');
  // gear takes ICE out: their steps go
  lv = await layer(1); S = lv.simon;
  for (const t of lv.tiles) if (!t.safe) t.ruledOut = true;
  check(simonNext(lv).t.safe, 'every ICE ruled out: the next step is the real node');
  // the real node early: clears, no pay
  lv = await layer(2); const cr2 = st.run.credits;
  pick(lv.safe); for (let i = 0; i < 40 && st.lv === lv; i++) await sleep(100);
  check(st.lv !== lv && st.run.credits === cr2, 'the real node early: it clears, no pay');
  check(modOffIn('iceeater', CORPS.simon) && modOffIn('quantum', CORPS.simon), 'ICE EATER and QUANTUM are off here');
  // REPEAT: 4 flashes, the last is the real node
  lv = await layer(2);
  BOSS_GEAR.repeat.use(lv);
  check(lv.flashSeq && lv.flashSeq.seq.length === Math.min(4, lv.n) && lv.flashSeq.seq[lv.flashSeq.seq.length - 1].safe, 'REPEAT: the last flash is the real node');
` };
