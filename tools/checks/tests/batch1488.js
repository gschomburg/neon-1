// tools/checks/tests/batch1488.js: meat notes 2026-11-12 (v14.88). SIMON's shorter text and its white steps only
// deep; b0y's split as a v and one letter over each node; the WORKBENCH LOCKER's upgrade; MONTE is SH3LL.
// Run by tools/test.js (a headless page, tools/checks/harness.js).
module.exports = { name: 'batch1488', body: `
  // SIMON: the tell fits the FIRST BREACH box, the rules fit a phone, the white steps start at tier 3
  check(CORP_TELL.simon.length < 220, 'SIMON tell is short: ' + CORP_TELL.simon.length);
  check(CORPS.simon.rules().length <= 36, 'SIMON rules fit: ' + CORPS.simon.rules());
  const fakeLv = () => ({ tiles: [0, 1, 2, 3].map(i => ({ cell: i, state: 'closed' })), safe: 0 });
  const whiteAt = (boss, tier) => { const lv = fakeLv(); CORPS.simon.dress(lv, { boss, tier, r: Math.random }); return lv.simon.white; };
  check(!whiteAt(true, 1) && !whiteAt(true, 2), 'no white steps at tier 1-2');
  check(whiteAt(true, 3) && whiteAt(true, 4), 'white steps on a tier 3+ boss');
  check(!whiteAt(false, 4), 'no white steps off the boss layer');

  // MONTE is SH3LL (the key stays monte)
  check(CORPS.monte.name === 'SH3LL' && CORPS.monte.code === 'SL', 'SH3LL: ' + CORPS.monte.name + ' ' + CORPS.monte.code);
  check(logoOf('monte').name === 'SH3LL' && logoOf('monte').art.some(l => /S {2}H {2}3 {2}L {2}L/.test(l)), 'its logo says SH3LL');

  // the LOCKER: a mod you have comes out as an upgrade; a maxed one stays put
  await shellBench(); await swapTo(() => openBench({ id: 'test-rest', type: 'rest', sector: st.run.sector })); await settle('bench');
  check(st.bench && st.mode === 'panel', 'the workbench is open: ' + st.mode);
  const lk = () => benchSave().locker;   // (benchSave hands back a fresh array each time)
  lk().fill(null);
  const key = Object.keys(MODS).find(k => !MODS[k].slot && !MODS[k].locked && MODS[k].tiers && MODS[k].tiers.length >= 3 && !st.run.mods.includes(k));
  addMod(key, 0);
  lk()[0] = { kind: 'mod', key, tier: 0, n: 1 };
  check(benchUpNote(lk()[0]) === 'upgrade', key + ' in the locker reads as an upgrade');
  st.bench.lkView = 'take'; st.bench.lkSel = 0;
  st.bench.tab = 'locker'; for (let k = 0; k < 4 && st.callBox; k++) { callClose(); await sleep(200); }
  const txt = buildScene(performance.now(), false).filter(c => c.cy > 4).sort((p, q) => p.cy - q.cy || p.cx - q.cx).map(c => c.ch).join('');
  check(txt.includes('UPGRADE') && txt.includes('upgrade'), 'the locker tab shows UPGRADE and the row says upgrade');
  benchTake(0);
  check(modTier(key) === 1 && !lk()[0], key + ' went up a step: tier ' + modTier(key));
  check(/upgraded/.test(st.bench.log[st.bench.log.length - 1]), 'the log says upgraded: ' + st.bench.log[st.bench.log.length - 1]);
  st.run.modTier[key] = MODS[key].tiers.length - 1;
  lk()[1] = { kind: 'mod', key, tier: 0, n: 1 };
  benchTake(1);
  check(!!lk()[1] && benchUpNote(lk()[1]) === 'maxed', 'a maxed one stays in the locker');
  lk().fill(null);
  shellEndRun(); await settle('end');

  // b0y split (OMNI RAID): a v and one letter of his mark over each node, nothing on the node's glyph rows
  await shellB0yOmni(); await sleep(1200);
  for (let k = 0; k < 8; k++) { if (st.callBox) callClose(); st.hint = null; st.hkCard = null; await sleep(300); }
  const s = st.lv.hks && st.lv.hks.b0y;
  check(s && s.split && s.split.length > 1 && s.sp, 'b0y is split: ' + (s && s.split ? s.split.length : 'no'));
  if (s && s.sp) {
    for (let k = 0; k < 4; k++) { Object.assign(s.cur, hkCell(s.split[0])); s.sp.forEach((p, i) => Object.assign(p, hkCell(s.split[i + 1]))); await sleep(30); }
    const cells = buildScene(performance.now(), false), mark = logoMark('b0y');
    const near = t => { const o = tileOrigin(t); return cells.filter(c => c.cx >= o.tx && c.cx < o.tx + TILE_W && Math.round(c.cy) === o.ty - 1 && mark.includes(c.ch)); };
    check(s.split.every((t, i) => near(t).some(c => c.ch === mark[i])), 'each node has its letter over it');
    const onGlyph = s.split.some(t => { const o = tileOrigin(t); return cells.some(c => c.own === 'fx' && c.cy >= o.ty + 1 && c.cy <= o.ty + 3 && c.cx >= o.tx && c.cx < o.tx + TILE_W && mark.includes(c.ch)); });
    check(!onGlyph, 'nothing of b0y on the nodes\\' glyphs');
  }
` };
