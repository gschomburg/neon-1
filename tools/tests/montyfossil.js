// tools/tests/montyfossil.js: MONTY and FOSSIL (v14.57, docs/CORPS.md A32 / A28; Greg 2026-11-07). MONTY: a pick holds,
// he opens all but one, the other is the real node when you picked ICE, switching clears; the boss swaps. FOSSIL: free
// brushes cost the clock and show rows, the next tap resolves, the fossil with the eye; SHOVEL; THE DEAL.
module.exports = { name: 'montyfossil', body: `
  await settle();
  B.startRun('MF1457', false); await settle('start');
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  const node = Object.values(st.run.map).find(n => n.type === 'corp');
  const ready = async () => { for (let i = 0; i < 100 && (!st.lv || st.busy); i++) await sleep(100); await sleep(200); };
  // MONTY
  node.corp = 'monty'; node.tier = 2; startCorp(node, 2); await ready();
  let lv = st.lv; const hp = st.run.integrity;
  pick(lv.tiles.indexOf(lv.tiles.find(t => !t.safe))); await ready();
  const M = lv.monty;
  check(M.stage === 'decide' && lv.tiles.filter(t => t.state === 'closed').length === 2 && M.other.safe && st.run.integrity === hp, 'MONTY: picked ICE, he opens all but the real one, no damage');
  check(/[?.]$/.test(M.line), 'his line: ' + M.line);
  pick(lv.tiles.indexOf(M.other)); for (let i = 0; i < 30 && st.lv === lv; i++) await sleep(100);
  check(st.lv !== lv, 'switching to the real door clears');
  startCorp(node, 4); await ready(); lv = st.lv;
  pick(lv.tiles.indexOf(lv.tiles.find(t => t.safe))); await ready();
  check(lv.boss && lv.monty.hide && !lv.monty.other.safe, 'the boss: the numbers hide, the doors swapped');
  check(modOffIn('iceeater', CORPS.monty), 'ICE EATER is off in MONTY');
  // FOSSIL
  node.corp = 'fossil'; node.tier = 1; startCorp(node, 1); await ready(); lv = st.lv;
  const real = lv.tiles[lv.safe], left = st.timer.left;
  check(real.bones[1].includes('o') && lv.tiles.filter(t => !t.safe).every(t => !t.bones[1].includes('o')) || !lv.fossil, 'FOSSIL: the real node has the eye, no ICE does (tier 1)');
  const ice = lv.tiles.find(t => !t.safe);
  pick(lv.tiles.indexOf(ice)); await sleep(80);
  check(ice.dug === 1 && ice.glyph[1] === ice.bones[1] && ice.glyph[2] !== ice.bones[2] && st.timer.left <= left - 0.9, 'a brush: the middle row shows, a second off the clock');
  pick(lv.tiles.indexOf(ice)); await sleep(80);
  check(ice.dug === 2 && ice.state === 'closed', 'two free brushes at tier 1');
  const hp2 = st.run.integrity; pick(lv.tiles.indexOf(ice)); for (let i = 0; i < 30 && st.run.integrity === hp2; i++) await sleep(100);
  check(st.run.integrity === hp2 - 1 && ice.state === 'locked', 'the third tap digs it out: ICE hurts');
  // SHOVEL
  startCorp(node, 3); await ready(); lv = st.lv;
  const ts = trench(lv); if (ts) BOSS_GEAR.shovel.use(lv);
  check(!ts || (ts.every(t => t.ruledOut && !t.safe) && (ts.every(t => t.row === ts[0].row) || ts.every(t => t.col === ts[0].col))), 'SHOVEL: a row or column of ICE ruled out, never the real');
  // THE DEAL
  st.run.mods.push('deal'); st.run.modTier.deal = 0;
  node.corp = 'basic'; startCorp(node, 3); await ready(); lv = st.lv;
  pick(lv.tiles.indexOf(lv.tiles.find(t => !t.safe && t.state === 'closed'))); for (let i = 0; i < 40 && (st.busy || !lv.dealt); i++) await sleep(100); await sleep(300);
  check(lv.dealt && lv.tiles.filter(t => t.state === 'closed' && !t.ruledOut).length === 2, 'THE DEAL: after the first hit, two nodes left');
` };
