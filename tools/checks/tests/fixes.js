// tools/checks/tests/fixes.js: bugs fixed in v14.42-v14.45 stay fixed. Run by tools/test.js (a headless page, tools/checks/harness.js).
module.exports = { name: 'fixes', body: `
  // UPSIDE's boss: every closed node is reachable by some tap, on boards with gaps and opened nodes (engine/corpkit.js upsideLand)
  let stuck = 0;
  for (let seed = 1; seed < 300; seed++) {
    let x = seed; const rr = () => (x = (x * 16807) % 2147483647) / 2147483647;
    const rows = 3 + Math.floor(rr() * 3), cols = 3 + Math.floor(rr() * 3), tiles = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (rr() > 0.25) tiles.push({ row: r, col: c, state: rr() < 0.3 ? 'open' : 'closed' });
    const lv = { rows, cols, tiles }, reach = new Set(tiles.map((t, i) => upsideLand(lv, i)));
    tiles.forEach((t, i) => { if (t.state === 'closed' && !reach.has(i)) stuck++; });
  }
  check(stuck === 0, 'UPSIDE: ' + stuck + ' closed nodes nobody can reach');

  B.startRun('FIXTEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  // POPS joins on the first CALL; MEDIX's boss drops the DISC on that step
  save.stats = save.stats || {}; save.stats.sectors = 1;
  check(!hkCrewOn('pops'), 'POPS not crew on a fresh save');
  questCalled('pops');
  check(hkCrewOn('pops'), 'POPS joins on the first call');
  check(questOf('pops').step === 'sector', 'his quest opens on PROVE IT: ' + questOf('pops').step);
  questSector();   // (a sector cleared with him on the crew)
  check(questOf('pops').step === 'find', 'a sector cleared: THE DISC: ' + questOf('pops').step);
  const got = bossLoot({ id: 9901, corp: 'medix' });
  check(got.includes('disc') && holdingDisc(), 'MEDIX boss drops the DISC: ' + got.join(','));
  check(!bossLoot({ id: 9902, corp: 'medix' }).includes('disc'), 'no second DISC while holding one');

  // a reload mid-corp keeps the corp's state (engine/save.js CORP_SAVE)
  const id = availableNodes().find(i => st.run.map[i].type === 'corp');
  await B.enterNode(st.run.map[id]); await settle('enter');
  Object.assign(st.corp, { leash: true, muzzleTo: 3, honeyTo: 2, express: true, invUsed: true, ice: 2 });
  const snap = runSnapshot();
  await startCorp(st.run.map[snap.corp.node], snap.corp.idx, snap.corp); await settle('restore');
  check(snap.corp.express === true, 'EXPRESS is in the snapshot');   // (the restored layer uses it up as it starts, as it should)
  check(st.corp.leash === true && st.corp.muzzleTo === 3 && st.corp.honeyTo === 2 && st.corp.invUsed === true && st.corp.ice === 2,
    'corp state after a reload: ' + JSON.stringify({ leash: st.corp.leash, muzzleTo: st.corp.muzzleTo, honeyTo: st.corp.honeyTo, invUsed: st.corp.invUsed, ice: st.corp.ice }));

  // abandoning with the DISC marks it lost; the history line has the sector
  st.abandonArmed = true; abandonRun(); await sleep(800);
  check(questOf('pops').lost === true, 'abandoning with the DISC marks it lost');
  check(save.history[0].abandoned && save.history[0].sector === 1, 'abandon history: ' + JSON.stringify(save.history[0]));

  // an ad doesn't take taps while the dev menu hides it
  st.ad = { fake: true }; st.dev = true; let took = false; const old = window.adTap; window.adTap = () => { took = true; };
  document.querySelector('canvas').dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 10, bubbles: true }));
  window.adTap = old; st.ad = null; st.dev = false;
  check(!took, 'an ad under the dev menu took a tap');

  // v14.85: the death screen (still in its build-in) counts the initials' 3-row letters, so UPLOAD stays off the footer
  B.startRun('M8QN8P', false); await settle('start'); await B.pick(st.lv.safe); await settle('pub'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  st.run.depth = 6; endRun(false); await settle('over'); await sleep(2500);
  st.featBox = null; FEAT_QUEUE.length = 0;
  if (st.lbPost) { st.lbPost.state = 'ok'; st.lbPost.ranks = { all: 15, today: 4 }; st.lbPost.of = {}; }
  await sleep(6000);
  const ov = buildScene(performance.now(), false), want = overLines().reduce((a, ln) => a + lineRows(ln), 0);
  const ovTop = Math.min(...ov.map(c => c.cy)), onFoot = ov.filter(c => Math.round(c.cy) === L.hc - 1 && /[=|]/.test(c.ch));
  check(st.overReveal && st.lbPost && Math.round(ovTop) === Math.floor((L.hc - want) / 2) && !onFoot.length,
    'the death screen sits centered, off the footer: top row ' + ovTop + ', ' + want + ' rows, ' + onFoot.length + ' box cells on the footer');
` };
