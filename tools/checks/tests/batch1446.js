// tools/checks/tests/batch1446.js: the v14.46 batch (meat notes 2026-11-06) stays fixed. Run by tools/test.js (a headless page).
module.exports = { name: 'batch1446', body: `
  B.startRun('BATCHTEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }

  // a CALL box up: nothing under it lights up (engine/input.js hitAt from overlayHits)
  queueCall('pops', ['hover test']); for (let i = 0; i < 60 && !st.callBox; i++) await sleep(100);
  await sleep(200);
  const under = hits.slice(0, overlayHits), mine = hits.slice(overlayHits);
  check(st.callBox && mine.some(h => h.id === 'cok'), 'the CALL box has its own hits after overlayHits');
  const n = under.find(h => h.kind === 'node');
  if (n) { const cx = n.x + n.w / 2, cy = n.y + n.h / 2; const h = hitAt(cx, cy, overlayHits); check(!h || h.kind !== 'node', 'a map node under the CALL box takes no hover'); }
  callClose();

  // STIM with ZOMBIE: the rot limit is 150 + 75 this corp, then back to 150 (you keep what fits)
  st.run.mods.push('zombie'); st.run.modTier.zombie = 0; st.run.rot = 140;
  const id = availableNodes().find(i => st.run.map[i].type === 'corp');
  await B.enterNode(st.run.map[id]); await settle('enter');
  stimUp();
  check(rotMax() === ROT.max + 75, 'STIM + ZOMBIE: rot limit ' + rotMax());
  const r0 = st.run.rot; addRot(30);   // (entering the layer added a little rot already)
  check(st.run.rot === r0 + 30 && st.run.rot > ROT.max && st.run.integrity > 0, 'rot past 150 under the stim limit, still standing: ' + st.run.rot);
  stimDown();
  check(rotMax() === ROT.max && st.run.rot === ROT.max - 1, 'after the stim: limit ' + rotMax() + ', rot ' + st.run.rot);

  // a rival who took the last node: the breach screen says ESCAPED, SECTOR CLEARED says so too
  st.breachRival = 'd0g'; st.breachEscaped = true;
  check(escapedLine().length === 1 && /escaped/.test(escapedLine()[0][0]), 'the escaped line: ' + JSON.stringify(escapedLine()));
  st.breachEscaped = false;
  check(escapedLine().length === 0, 'no escaped line when they were beaten');
  st.breachRival = null;

  // HAD3S's map: sector 1 has no safehouse, MEDIX is in it
  const m = genMap('HAD3S'), s1 = Object.values(m).filter(n => (n.sector || 0) === 0);
  check(!s1.some(n => n.type === 'repair'), 'HAD3S sector 1: no safehouse');
  check(s1.some(n => n.corp === 'medix'), 'HAD3S sector 1: MEDIX is there');
  check(s1.some(n => n.next.some(o => m[o] && m[o].step === n.step)), 'HAD3S sector 1: some sideways links');

  // TUNNEL: the dug path is kept for the map to draw
  const run = st.run; endRun && endRun();
  B.startRun('TUNNELTEST', false); await settle('start2'); await B.pick(st.lv.safe); await settle('public2'); if (st.mode !== 'map') { B.toMap(); await settle('map2'); }
  const first = availableNodes().map(i => st.run.map[i]).find(n => n.type === 'corp');
  await B.enterNode(first); await settle('enter2');
  for (let k = 0; k < 12 && st.mode === 'play'; k++) { await B.pick(st.lv.safe); for (let j = 0; j < 100 && (st.busy || st.transitioning || st.wipe); j++) await sleep(50); }
  for (let j = 0; j < 100 && st.mode !== 'map'; j++) { if (st.mode === 'panel' && st.choice && !st.transitioning) { await leavePanel(); } await sleep(100); }
  await settle('back');
  const mates = rowMates();
  if (st.mode === 'map' && mates.length) {
    st.run.tunnel = true;
    const to = mates[0], from = st.run.at;
    await enterNode(to); await settle('dig');
    check((st.run.dug || []).some(([a, b]) => a === from && b === to.id), 'TUNNEL: the dug path is kept: ' + JSON.stringify(st.run.dug));
  } else say('TUNNEL check skipped: mode ' + st.mode + ', mates ' + mates.length);
` };
