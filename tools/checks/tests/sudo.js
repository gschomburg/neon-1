// tools/checks/tests/sudo.js: THE SHELL's v15.03 commands (engine/deck.js DECK_SHELL_CMDS, DECK_SHELL_PLAY): the SHELL
// chips' cd .., scan, rm, kill, cat, sleep, whois and undo; the SUDO chips' player versions of mode.god, mode.hold,
// show.real, breach and give.mod (dev mode keeps the dev versions); and the keys: ` is THE SHELL, ~ the old dev menu
// (dev mode only). Run by tools/test.js (a headless page, tools/checks/harness.js).
module.exports = { name: 'sudo', body: `
  const out = () => (SHELL.log[SHELL.log.length - 1] || {}).s || '';
  const all = () => SHELL.log.slice(-12).map(l => l.s).join('\\n');
  const key = (k, o = {}) => window.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, o)));
  st.devAccess = false;
  B.startRun('SUDOTEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  if (st.evCard) closeEventCard();
  const run = st.run;
  save.legacy = save.legacy || {}; save.legacy.crew_root = 1; save.shellHi = true;
  const CHIPS = ['CD2', 'SN5', 'RM1', 'KL9', 'CT1', 'ZZ3', 'WI5', 'UD2', 'GD1', 'HD4', 'RL2', 'BR3', 'GM1'];
  run.chips = CHIPS.slice(); deckCharges(run);
  check(run.chargeMax === 2 + 3 + 2 + 2 + 3 + 2 + 1 + 1 + 4 + 3 + 2 + 4 + 3, 'the new chips give their charges: ' + run.chargeMax);
  run.chargeMax = run.charges = 99;
  shellOpen();

  // ---- a player version and a dev version of one command
  const god = SHELL_BY['mode.god'];
  check(shellKnows(shellVer(god)) && shellCost(shellVer(god)) === 4 && /sector/.test(shellVer(god).help), 'mode.god with GD1: the player version, 4 charges, a sector');
  run.chips = []; check(!shellKnows(shellVer(god)), 'no GD1: mode.god is unknown'); run.chips = CHIPS.slice();
  st.devAccess = true;
  check(shellVer(god) === god && shellCost(god) === 0 && god.args.length === 1, 'dev mode: the dev version (on|off, free)');
  st.devAccess = false;

  // ---- on the map
  await shellRun('mode.god');
  check(run.godSector === run.sector && godOn() && !st.god && run.charges === 95, 'mode.god: on for this sector, 4 spent: ' + run.charges);
  await shellRun('mode.god');
  check(/already/.test(out()) && run.charges === 95, 'again this sector: it says so, nothing spent');
  run.sector++; check(!godOn(), 'the next sector: it wore off'); run.sector--; run.godSector = null;

  await shellRun('scan');
  check(run.scanned === run.sector && /row \\d/.test(all()), 'scan: the corps ahead, by row: ' + out());
  const bl = Object.values(run.map).find(n => n.type === 'corp' && !run.visited.includes(n.id));
  if (bl) { const m = bl.mod; bl.mod = 'blinders'; check(!blinded(bl), 'scan: BLINDERS lifted this sector'); bl.mod = m; }

  // cat: what the cache will give, rolled the way openCache rolls it
  const cache = Object.values(run.map).find(n => n.type === 'cache' && !run.visited.includes(n.id));
  if (cache) {
    st.mapSel = cache.id;
    await shellRun('cat');
    const said = all();
    check(/DATA CACHE/.test(said) && /pick: /.test(said), 'cat: the loot and the picks: ' + said.split('\\n').slice(-3).join(' | '));
    const oc = openChoice; let got = null; openChoice = o => { got = o; };
    try { openCache(cache); } finally { openChoice = oc; }
    const names = got.options.map(o => o.kind === 'gear' ? ITEMS[o.key].name : MODS[o.key].name);
    check(names.every(n => said.includes(n)), 'cat matches the real cache: ' + names.join(', '));
    delete run.caches[cache.id]; st.mapSel = null;
  } else check(true, '(no cache on this map)');

  // cd ..: put yourself two rows in, with a node a row back you skipped
  const at0 = run.at, two = Object.values(run.map).find(n => (n.sector || 0) === 0 && n.step === 2);
  run.at = two.id;
  await shellRun('cd ..');
  check(run.backAim && backTargets().length && backTargets().every(n => availableNodes().includes(n.id)), 'cd ..: the row back is open: ' + out());
  run.backAim = false; run.at = at0;

  // give.mod: the list is free, the pick costs 3, once a run
  const c0 = run.charges;
  await shellRun('give.mod');
  const offer = deckGiveOffer();
  check(offer.length === 3 && run.charges === c0 && offer.every(o => all().includes(o.key)), 'give.mod: 3 mods, nothing spent: ' + offer.map(o => o.key).join(' '));
  await shellRun('give.mod ' + offer[0].key);
  check(has(offer[0].key) && run.giveUsed && run.charges === c0 - 3, 'give.mod <mod>: it is yours, 3 spent');
  await shellRun('give.mod');
  check(/once a run/.test(out()) && run.charges === c0 - 3, 'give.mod again: once a run');
  check(!run.practice, 'none of it made the run practice');

  // ---- in a corp
  const corp = availableNodes().map(id => run.map[id]).find(n => n.type === 'corp');
  await enterNode(corp); await settle('corp');
  check(st.mode === 'play' && st.corp && st.corp.hasBoss, 'in a corp');
  const lv = st.lv;
  await shellRun('show.real');
  check(lv.realShown && st.corp.realShown, 'show.real: the real node is marked');
  const c1 = run.charges; await shellRun('show.real');
  check(/once a corp/.test(out()) && run.charges === c1, 'show.real again: once a corp, nothing spent');
  const locked = () => lv.tiles.filter(t => t.state === 'locked').length, l0 = locked();
  if (candidates().length > 2) { await shellRun('rm'); check(locked() === l0 + 1, 'rm: one ICE deleted'); }
  await shellRun('sleep');
  check(lv.sleepArm, 'sleep: armed');
  await shellRun('sleep'); check(/once a layer/.test(out()), 'sleep again: once a layer');
  st.lastHit = { lv, dmg: 1 }; run.integrity -= 1; const i0 = run.integrity;
  await shellRun('undo');
  check(run.integrity === i0 + 1, 'undo: the hit is taken back');
  await shellRun('undo'); check(/no ICE hit/.test(out()), 'undo again: nothing to undo');
  await shellRun('whois');
  check(CORP_TELL[st.corp.def.key] ? out().includes(CORP_TELL[st.corp.def.key]) : /no tell/.test(out()), 'whois: the tell: ' + out());
  await shellRun('mode.hold');
  check(st.corp.held, 'mode.hold: held');
  shellClose();
  check(lv.holdUntil > performance.now() + 4000, 'closing THE SHELL starts the sleep');
  const left = st.timer && st.timer.left; lv.holdUntil = 0; updateTimer(1);
  check(!st.timer || st.timer.left === left, 'held: the clock does not move');
  st.corp.held = false;
  const idx0 = st.corp.idx;
  await shellRun('breach'); await sleep(400); await settle('breach');
  check(run.sudoBreach && (!st.corp || st.corp.idx !== idx0 || st.lv !== lv), 'breach: the layer is won');
  check(!run.practice, 'still not practice');

  // ---- the keys: \` is THE SHELL; ~ the old dev menu, only in dev mode
  if (st.shell) shellClose();
  key('\`'); check(st.shell, '\` opens THE SHELL');
  key('\`'); check(!st.shell, '\` closes it');
  key('~'); check(!st.dev && !st.shell, '~ out of dev mode: nothing');
  st.devAccess = true; key('~'); check(st.dev, '~ in dev mode: the old dev menu');
  key('~'); check(!st.dev, '~ again: closed'); st.devAccess = false;
  { const had = save.deck; save.deck = had || { chips: {} }; check(pauseLines().some(l => l.id === 'pshell'), 'the pause menu has [ SHELL ] (with a deck)'); save.deck = had; }

  // kill -9: the run ends as a death
  if (st.mode !== 'play' && st.mode !== 'map') { B.toMap(); await settle('map'); }
  await shellRun('kill -9'); await sleep(500); await settle('kill');
  check(run.ended, 'kill -9: the run is over');
` };
