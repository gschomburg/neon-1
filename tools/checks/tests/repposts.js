// tools/checks/tests/repposts.js: THE BOARD's ELITE and SYSOP posts (Greg, 2026-11-22, v15.36): LOYALTY CARD (markets 5%
// a level), CHROMATOPHORE (every palette, the locked card colors), THE ARCHIVE (a mod you've found, picked on the deck's
// CPU, starts every run), and placeholder posts that real ones replaced give their REP back. Run by tools/test.js.
module.exports = { name: 'repposts', body: `
  save.legacy = save.legacy || {};
  // LOYALTY CARD (I on ELITE, II on SYSOP: a ladder, v15.40)
  const o = { kind: 'item', key: 'patch', tier: 0, price: 100 };
  save.legacy.market = 0; save.legacy.market2 = 0; const p0 = priceOf(o);
  save.legacy.market = 1; save.legacy.market2 = 1; const p2 = priceOf(o);
  check(p0 > 0 && Math.abs(p2 / p0 - 0.9) < 0.03, 'LOYALTY CARD I and II: markets 10% cheaper: ' + p0 + ' -> ' + p2);
  save.legacy.market = 0; save.legacy.market2 = 0;
  // the ladders: each step its own post a level up, needing the one before; legacyLv counts the ladder
  const lad = { hard: ['hard2', 'hard3'], cash: ['cash2', 'cash3'], restock: ['restock2'], dms: ['dms2', 'dms3'], drops: ['drops2'], market: ['market2'] };
  check(Object.entries(lad).every(([b, ks]) => ks.every((k, i) => { const u = LEGACY.find(p => p.key === k), up = LEGACY.find(p => p.key === (i ? ks[i - 1] : b)); return u && u.ladder === b && u.needs === up.key && u.tier === up.tier + 1; })), 'the ladders: a level up each, each needs the one before');
  const lg0 = Object.assign({}, save.legacy);
  Object.assign(save.legacy, { dms: 1, dms2: 1, dms3: 1, hard: 1, hard2: 1 });
  check(legacyLv('dms') === 3 && legacyLv('hard') === 2 && postLv('hard') === 1, 'legacyLv counts the ladder: DEADMAN III is 3, HARDENED II is 2');
  save.legacy = lg0;
  check(REP_SUBS.map(s => s[1]).join(' ') === 'MSGS GUEST USER ELITE SYSOP', 'REP has its sub-tabs: ' + REP_SUBS.map(s => s[1]).join(' '));
  // batch 2 (v15.41): CLOUT, BAIT SHOP, SURGE, POWER TAP, DEEP WATER, BACKDOOR
  { const lg1 = Object.assign({}, save.legacy), rr = { depth: 40, corps: 8, perfects: 5, earned: 400, sectorsCleared: 2, repBonus: 0, chips: [] };
    save.legacy.clout = 0; const r0 = repFor(rr); save.legacy.clout = 1;
    check(repFor(rr) === Math.round(r0 * 1.25), 'CLOUT: +25% REP: ' + r0 + ' -> ' + repFor(rr));
    save.legacy.bait = 0; const c0 = fishCost(); save.legacy.bait = 1;
    check(fishCost() === Math.max(1, Math.round(c0 * 0.5)), 'BAIT SHOP: casts cost half: ' + c0 + ' -> ' + fishCost());
    const sr = { chips: ['WH0'] }; save.legacy.surge = 1; save.legacy.surge2 = 1; deckCharges(sr); const withS = sr.chargeMax;
    save.legacy.surge = 0; save.legacy.surge2 = 0; deckCharges(sr);
    check(withS === sr.chargeMax + 2, 'SURGE I and II: +2 charges: ' + sr.chargeMax + ' -> ' + withS);
    const nr = { chips: [] }; save.legacy.surge = 1; deckCharges(nr); check(nr.chargeMax === 0, 'SURGE: nothing without a SHELL chip');
    save.legacy.power = 0; save.deck = save.deck || deckFreshSave(); DECK = deckReal(); const b0 = deckPower().budget;
    save.legacy.power = 1; save.legacy.power2 = 1; DECK = deckReal(); check(deckPower().budget === b0 + 2, 'POWER TAP I and II: +2 power: ' + b0 + ' -> ' + deckPower().budget); DECK = null;
    let sum = (deep) => { save.legacy.deep = deep ? 1 : 0; let n = 0, rr2 = 0; const r = rngFor('DEEP', 'x'); for (let i = 0; i < 400; i++) { const o = fishOutcome(r); if (o.kind === 'fish') { n++; rr2 += RARITY_ORDER.indexOf(o.rarity); } } return rr2 / Math.max(1, n); };
    const a0 = sum(false), a1 = sum(true); check(a1 > a0, 'DEEP WATER: rarer fish on average: ' + a0.toFixed(2) + ' -> ' + a1.toFixed(2));
    // BACKDOOR (v15.42): dev.start / dev.stop autocomplete with it, not without (they run either way: tests/devstop)
    shellOpen(); await sleep(100); SHELL.input.value = 'dev.st'; SHELL.input.setSelectionRange(6, 6);
    save.legacy.backdoor = 0; const no = shellSuggest().filter(x => x.v && /^dev\./.test(x.v)).length;
    save.legacy.backdoor = 1; const yes = shellSuggest().filter(x => x.v && /^dev\./.test(x.v)).map(x => x.v);
    check(!no && yes.includes('dev.start') && yes.includes('dev.stop'), 'BACKDOOR: dev.start and dev.stop autocomplete: ' + yes.join(' '));
    SHELL.input.value = ''; shellClose();
    save.legacy = lg1; }
  // CHIP DEALER (v15.43): 3 chips (5 with II, one rare or better), seen, by the seed; a buy goes on the belt
  { const lg2 = Object.assign({}, save.legacy); save.deck = save.deck || deckFreshSave();
    B.startRun('DEALER', false); await settle('start');
    const nodes = Object.values(st.run.map), n1 = nodes[1], n2 = nodes[2];
    save.legacy.dealer = 1; save.legacy.dealer2 = 0; const s1 = deckDealerStock(n1);
    check(s1.length === 3 && new Set(s1.map(o => o.key)).size === 3 && s1.every(o => save.seen[deckChipItem(o.key)] && !deckBeta(o.key) && !deckIsRipped(o.key) && DECK_CHIPS[o.key][1] !== 'boss'), 'CHIP DEALER: 3 chips, all seen, none BETA, RIPPED or BOSS: ' + s1.map(o => o.key));
    check(deckDealerStock(n1) === s1, 'going back in: the same stock');
    save.legacy.dealer2 = 1; const s2 = deckDealerStock(n2);
    check(s2.length === 5 && s2.some(o => RARITY_ORDER.indexOf(DECK_CHIPS[o.key][2]) >= RARITY_ORDER.indexOf('rare')), 'CHIP DEALER II: 5, one rare or better');
    st.run.credits = 999; openChipDealer(n2); await sleep(300);
    const k0 = s2[0].key; hits.find(h => h.id === 'dbuy').onTap();
    check(s2[0].sold && st.run.items.some(x => x.key === deckChipItem(k0)), 'a buy: on your belt');
    save.legacy = lg2; }
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
  // (v15.38: a BOOT chip, AR1; its card picks the mod. Not a KIT: either BOOT socket)
  const deck0 = save.deck;
  save.deck = Object.assign(deckFreshSave(), { owed: { PG0: 1 }, slots: { PSU: 'RX9', BT2: 'AR1' }, order: ['PSU', 'BT2'] }); save.deck.chips.AR1 = 1; save.deck.chips.RX9 = 1;
  save.archive = 'tracer';
  B.startRun('ARCHIVE', false); await settle('start');
  check(st.run.mods.includes('tracer'), 'THE ARCHIVE (its chip): the run starts with it');
  check(deckFits('AR1', deckSock('BT2')) && !deckFits('PD7', deckSock('BT2')) && deckFits('PD7', deckSock('BT1')), 'KITs only in BT1; THE ARCHIVE in either');
  save.archive = null; B.startRun('ARCHIVE2', false); await settle('start');
  check(!st.run.mods.includes('tracer'), 'none picked: no mod');
  save.deck = deck0;
  // the chip posts: buying one puts its chip in your deck
  save.deck = save.deck || deckFreshSave(); save.rep = 5000;
  save.legacy.deck3 = 1; save.legacy.fuse = 1; save.legacy.market = 1; ['hard', 'cash', 'kit', 'belt', 'drops', 'bench', 'nemesis', 'starter'].forEach(k => save.legacy[k] = 1);
  const cxPost = LEGACY.find(u => u.key === 'codex'), rcPost = LEGACY.find(u => u.key === 'relic');
  check(buyPost(cxPost) === null && save.deck.chips.CX5 === 1, 'CODEX: the post gives the CX5 chip');
  check(buyPost(rcPost) === null && save.deck.chips.RC1 === 1, 'RELIC: the post gives the RC1 chip');
  check(DECK_NO_DROP.includes('CX5') && DECK_NO_DROP.includes('RC1') && /THE BOARD/.test(cxChipWhere('CX5')), 'they never drop; the codex says THE BOARD');
  // CODEX: dying in a corp you haven't beaten decodes a third of its tell, 3 at most; a beaten one, nothing
  const ck = Object.keys(CORP_TELL).find(k => CORPS[k] && !corpStat(k).breached), run = st.run;
  run.chips = ['CX5']; save.codexBits = {};
  check(deckCodexDeath(run, ck) && save.codexBits[ck] === 1, 'CODEX: a death in ' + ck + ' decodes 1/3');
  deckCodexDeath(run, ck); deckCodexDeath(run, ck); check(!deckCodexDeath(run, ck) && save.codexBits[ck] === 3, '3/3 at most');
  const bk = Object.keys(CORP_TELL).find(k => CORPS[k] && k !== ck); const br0 = corpStat(bk).breached; corpStat(bk).breached = 1;
  check(!deckCodexDeath(run, bk), 'a corp you have beaten: nothing'); corpStat(bk).breached = br0;
  const line = 'tell: ' + CORP_TELL[ck];
  check(cxTellPart(line, 3, 5, 0) === line, 'all three thirds: the tell reads clear');
  const part = cxTellPart(line, 1, 5, 0).split(' '), words = line.split(' ');
  check(part[0] === 'tell:' && part.some((w, i) => w === words[i] && i > 0) || words.length < 4, 'one third: some words clear');
  // RELIC: one more pick, an exotic; the rest of the rewards stay the same
  // (try seeds till one of the map's corps rolls its exotic)
  let node = null;
  for (let s = 0; s < 40 && !node; s++) { run.seed = 'RELIC' + s; node = Object.values(run.map).find(n => n.type === 'corp' && exoticOffer(run.seed, 'relic', n.id, DECK_RELIC).length); }
  check(DECK_RELIC > 0 && DECK_RELIC < 1 && node, 'RELIC: now and then (' + DECK_RELIC + ')');
  run.chips = []; const plain = rewardOptions(node).map(o => o.key);
  run.chips = ['RC1']; const withR = rewardOptions(node).map(o => o.key);
  check(withR.length === plain.length + 1 && MODS[withR[withR.length - 1]].kind === 'exotic', 'RELIC: one more pick, an exotic: ' + withR[withR.length - 1]);
  check(withR.slice(0, plain.length).join() === plain.join(), 'the usual picks stay the same');
  run.chips = [];
` };
