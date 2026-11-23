// tools/checks/tests/gear4.js: four ideas from the meat notes (2026-11-22), built v16.01: TAUNT (gear: a rival comes
// in), POSSESS (gear: the rival you ride takes your ICE hits, and stops playing), MEAT SHIELD (a chip: the crew you
// called take your ICE hits; never b0y, off in H3AV3N), FRAG at the PIER (every fish on screen; PHISH a rarity lower
// now and then, gear as corrupted software). Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'gear4', body: `
  await settle();
  save.ads = false;
  Object.assign(CONFIG, { wipeSpeed: 8, wipeStagger: 0, revealDelay: 0, revealGap: 0, introHold: 0 });
  const ready = async () => { for (let i = 0; i < 100 && !(st.lv && st.lv.readyAt != null && !st.busy && !st.transitioning && !st.wipe); i++) { if (st.intro) st.intro.skip = true; if (st.hkCard) hkCardClose(); await sleep(100); } };
  const slotOf = k => st.run.items.findIndex(s => s.key === k);
  const iceHit = async () => { const lv = st.lv, i = lv.tiles.findIndex(t => !t.safe && t.state === 'closed' && !t.loaded); pick(i); for (let k = 0; k < 40 && st.busy; k++) await sleep(100); await sleep(300); };
  B.startRun('GEAR4', false); await settle('start');
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  const run = st.run; run.practice = false;
  const node = Object.values(run.map).find(n => n.type === 'corp');
  node.corp = 'basic'; node.tier = 2; delete node.mod;
  startCorp(node, 1); await ready();
  // (past the public node: layer gear needs a layer of the corp)
  for (let i = 0; i < 30 && st.lv.n < 2; i++) { pick(st.lv.safe); await sleep(400); await ready(); }
  check(st.lv && st.lv.n >= 2, 'in a corp layer');

  // TAUNT: a rival comes in
  addItem('taunt', 0);
  check(canUse(run.items[slotOf('taunt')]), 'TAUNT: usable with no rival here');
  useItem(slotOf('taunt')); await sleep(300); if (st.hkCard) hkCardClose(); await sleep(200);
  check(hkRivals().length === 1, 'TAUNT: a rival came in (' + hkRivals().map(h => h.id).join() + ')');
  addItem('taunt', 0);
  check(!canUse(run.items[slotOf('taunt')]) && /already here/.test(whyNotItem(run.items[slotOf('taunt')])), 'TAUNT: not with one here already');

  // POSSESS: the rival takes your ICE hit, and stops playing
  const h = hkRivals()[0]; h.hp = h.max = 3;
  addItem('possess', 0);
  useItem(slotOf('possess')); await sleep(200);
  check(hkPossessed() === h, 'POSSESS: riding ' + h.id);
  run.integrity = run.maxInt; const int0 = run.integrity;
  await iceHit();
  check(run.integrity === int0 && h.hp === 2, 'POSSESS: the ICE hit cost their bar, not your INT (' + run.integrity + '/' + int0 + ', ' + h.hp + ')');
  hkOut(h);
  check(!hkPossessed(), 'POSSESS: out of bars, it ends');

  // MEAT SHIELD: the crew you called take it; never b0y; off in H3AV3N
  run.chips = (run.chips || []).concat('MS7');
  const crew = hkSpawn('nana', 'call'); await sleep(200); if (st.hkCard) hkCardClose();
  crew.hp = crew.max = 3; run.integrity = run.maxInt;
  await ready(); await iceHit();
  check(run.integrity === run.maxInt && crew.hp === 2, 'MEAT SHIELD: NANA took it (' + crew.hp + ')');
  run.heaven = true; crew.hp = 3;
  check(hkMeatHit() === null && crew.hp === 3, 'MEAT SHIELD: off in H3AV3N');
  run.heaven = false; crew.out = true;
  const boy = { id: 'b0y', side: 'good', hp: 3, max: 3, out: false }; st.corp.hk.push(boy);
  check(hkMeatHit() === null && boy.hp === 3, 'MEAT SHIELD: never b0y');

  // FRAG at the PIER
  st.corp = null; st.lv = null; B.toMap(); await sleep(1500);
  await swapTo(() => openPier(Object.assign({}, node, { id: 'g4-pier', type: 'pier' })));
  await sleep(300);
  const f = st.fish, key = Object.keys(ITEMS).find(k => ITEMS[k].fish && !ITEMS[k].bag && ITEMS[k].rarity === 'rare');
  f.shapes = [{ lane: 1, x: 8, dir: -1, out: { kind: 'fish', key, tier: 0, rarity: 'rare' }, look: '<><', size: 'small', spd: 0 },
    { lane: 3, x: 14, dir: -1, out: { kind: 'gear', key: 'purge', tier: 0, rarity: 'common' }, look: "<')><", size: 'mid', spd: 0 },
    { lane: 5, x: 20, dir: -1, out: { kind: 'gear', key: 'disc', tier: 0, rarity: 'quest' }, look: '<><', size: 'small', spd: 0 }];
  const was = Object.assign({}, FISH_FRAG); Object.assign(FISH_FRAG, { phish: 1, corrupt: 1 });
  const loot0 = (run.loot || []).map(s => s.key + 'x' + s.n).join();
  addItem('frag', 0);
  check(canUse(run.items[slotOf('frag')]), 'FRAG: usable at the PIER');
  const casts0 = fishCasts();
  useItem(slotOf('frag')); await sleep(300);
  Object.assign(FISH_FRAG, was);
  check(f.shapes.length === 1 && f.shapes[0].out.key === 'disc', 'FRAG: every fish gone but the DISC');
  check((run.loot || []).some(s => s.key === 'phish_common') && (run.loot || []).some(s => ITEMS[s.key].corrupt), 'FRAG: a PHISH a rarity lower, and corrupted software (' + (run.loot || []).map(s => s.key).join() + ')');
  check(fishCasts() === casts0, 'FRAG: no cast spent');
` };
