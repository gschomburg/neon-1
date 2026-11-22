// tools/checks/tests/repposts.js: THE BOARD's ELITE and SYSOP posts (Greg, 2026-11-22, v15.36): LOYALTY CARD (markets 5%
// a level), CHROMATOPHORE (every palette, the locked card colors), THE ARCHIVE (a mod you've found, picked on the deck's
// CPU, starts every run), and placeholder posts that real ones replaced give their REP back. Run by tools/test.js.
module.exports = { name: 'repposts', body: `
  save.legacy = save.legacy || {};
  // LOYALTY CARD
  const o = { kind: 'item', key: 'patch', tier: 0, price: 100 };
  save.legacy.market = 0; const p0 = priceOf(o);
  save.legacy.market = 2; const p2 = priceOf(o);
  check(p0 > 0 && Math.abs(p2 / p0 - 0.9) < 0.03, 'LOYALTY CARD 2: markets 10% cheaper: ' + p0 + ' -> ' + p2);
  save.legacy.market = 0;
  // CHROMATOPHORE
  save.legacy.chroma = 0;
  const few = playerPalettes().length, locked = PLAYER_STYLES.map((s, i) => i).filter(i => PLAYER_STYLES[i].locked);
  check(locked.length >= 5 && locked.every(i => !styleOpen(i)), 'locked card colors: ' + locked.length);
  let i = 0, seen = new Set(); for (let k = 0; k < 40; k++) { i = stepStyle(i, 1); seen.add(i); }
  check(locked.every(j => !seen.has(j)), 'stepping skips the locked colors');
  save.legacy.chroma = 1;
  check(playerPalettes().length === Object.keys(PALETTES).length && playerPalettes().length > few, 'CHROMATOPHORE: every palette: ' + few + ' -> ' + playerPalettes().length);
  seen = new Set(); for (let k = 0; k < 40; k++) { i = stepStyle(i, 1); seen.add(i); }
  check(locked.every(j => seen.has(j)), 'and every card color');
  save.legacy.chroma = 0;
  // refunds
  const r0 = save.rep || 0; save.legacy.sysop1 = 1; save.legacy.elite2 = 1;
  refundGonePosts();
  check(save.rep === r0 + 300 && !save.legacy.sysop1 && !save.legacy.elite2, 'bought placeholders that are gone: their REP back');
  // THE ARCHIVE
  save.seen.tracer = true;
  check(archivePool().includes('tracer') && !archivePool().some(k => MODS[k].kind === 'exotic'), 'THE ARCHIVE: mods you have found, no exotics');
  save.legacy.archive = 1; save.archive = 'tracer'; if (save.deck) save.deck.off = (save.deck.off || []).filter(k => k !== 'archive');
  B.startRun('ARCHIVE', false); await settle('start');
  check(st.run.mods.includes('tracer'), 'THE ARCHIVE: the run starts with it');
  if (save.deck) { save.deck.off = (save.deck.off || []).concat('archive'); B.startRun('ARCHIVE2', false); await settle('start');
    check(!st.run.mods.includes('tracer'), 'switched off on the CPU (none picked): no mod'); save.deck.off = save.deck.off.filter(k => k !== 'archive'); }
  save.legacy.archive = 0;
` };
