// tools/checks/tests/lostloot.js: LOST LOOT (a REP post, engine/deck.js lostLoot, v15.57): a chip that drops with your belt
// full goes to a pool of 4 (the swap's KEEP WHAT I HAVE, a chip swapped out, the PIER's KEEP); full, the least worth
// keeping is shredded (owned first, then the lowest rarity, then the oldest: it can be the new one); the deck's switch
// set to SHRED shreds them all at once; the WORKBENCH's LOCKER > LOST takes one onto your belt; cashing out brings the
// rest home. Without the post: lost, as before. Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'lostloot', body: `
  const tb = id => hits.find(h => h.id === id);
  await settle();
  save.ads = false;
  Object.assign(CONFIG, { wipeSpeed: 8, wipeStagger: 0, revealDelay: 0, revealGap: 0, introHold: 0 });
  save.legacy = save.legacy || {}; save.legacy.bench = 1; save.legacy.lostloot = 0;
  save.bench = { letters: {}, locker: [null, null, null, null, null], pins: [], popsSeen: true, blankSeen: true, bpSeen: true };
  save.deck = deckFreshSave(); save.deck.popsSeen = true; save.deck.off = [];
  B.startRun('LOSTLOOT', false); await settle('start');
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  const run = st.run; run.practice = false;
  const plain = r => Object.keys(DECK_CHIPS).filter(k => DECK_CHIPS[k][2] === r && !deckHave(k) && !DECK_RIPPED.includes(k) && DECK_CHIPS[k][1] !== 'boss' && ITEMS[deckChipItem(k)]);
  const com = plain('common'), epic = plain('epic');
  const ik = k => deckChipItem(k), pool = () => (run.lost || []).map(x => deckItemChip(x.key));
  const fill = () => { run.items = []; while (run.items.length < run.beltSlots) run.items.push({ key: ['patch', 'purge', 'ping', 'route', 'warp', 'flare'][run.items.length], tier: 0, n: 1 }); };
  fill();

  // no post: nothing
  check(lostLoot(ik(com[0])) === null && !pool().length, 'no post: lost, as before');
  save.legacy.lostloot = 1;

  // the swap: KEEP WHAT I HAVE
  openHelp(); await sleep(300);   // (the swap comes up over a panel)
  openSwap('item', ik(com[0]), 0, null); await sleep(400);
  check(tb('swkeep'), 'the swap is up');
  tb('swkeep').onTap(); await sleep(100);
  check(pool().join() === com[0] && /LOST LOOT \\(1\\/4\\)/.test(st.msg || ''), 'KEEP WHAT I HAVE: into LOST LOOT (' + st.msg + ')');

  // three more commons: full
  for (const k of com.slice(1, 4)) lostLoot(ik(k));
  check(pool().length === 4, 'four in the pool');
  // an epic in: the oldest common goes, shredded
  const letters0 = benchCount();
  const m1 = lostLoot(ik(epic[0]));
  check(pool().length === 4 && pool().includes(epic[0]) && !pool().includes(com[0]) && benchCount() > letters0, 'full: an epic pushes out the oldest common (' + m1 + ')');
  // a common in, with commons left: the oldest common goes, not the epic
  lostLoot(ik(com[4]));
  check(pool().includes(epic[0]) && !pool().includes(com[1]) && pool().includes(com[4]), 'a common pushes out a common, never the epic');
  // all epics, then a common: the new common is the one shredded
  for (const k of epic.slice(1, 4)) lostLoot(ik(k));
  check(pool().every(k => DECK_CHIPS[k][2] === 'epic'), 'four epics now: ' + pool().join());
  const m2 = lostLoot(ik(com[5]));
  check(!pool().includes(com[5]) && /full: .* shredded/.test(m2), 'a common never pushes out an epic: it goes (' + m2 + ')');
  // an epic you own goes before a common you don't
  save.deck.chips[epic[0]] = 1;
  lostLoot(ik(com[6]));
  check(!pool().includes(epic[0]) && pool().includes(com[6]), 'an owned epic goes before an unowned common');
  delete save.deck.chips[epic[0]];

  // the switch: SHRED
  save.deck.off = ['lostloot'];
  const was = pool().join(), l1 = benchCount();
  const m3 = lostLoot(ik(com[7]));
  check(pool().join() === was && benchCount() > l1 && /shredded/.test(m3), 'SHRED: straight into components (' + m3 + ')');
  save.deck.off = [];

  // a chip swapped out of the belt
  run.items[0] = { key: ik(com[8]), tier: 0, n: 1 };
  run.lost.pop();
  openHelp(); await sleep(300);
  openSwap('item', 'warp', 0, null); await sleep(300);
  hits.find(h => h.id === 'sw0').onTap(); await sleep(100);
  tb('swgo').onTap(); await sleep(100);
  check(pool().includes(com[8]), 'a chip swapped out: LOST LOOT');

  // the WORKBENCH: LOCKER > LOST, TAKE
  fill(); run.items.pop();
  openBench({ id: 'll', type: 'repair' }); await sleep(800);
  FEAT_QUEUE.length = 0; st.featBox = null; CALL_QUEUE.length = 0; st.callBox = null;
  benchTab('locker'); await sleep(300);
  check(tb('lvlost'), 'LOCKER: a LOST sub-tab');
  tb('lvlost').onTap(); await sleep(300);
  const first = pool()[0];
  check(tb('bklost'), 'TAKE');
  tb('bklost').onTap(); await sleep(200);
  check(run.items.some(s => s.key === ik(first)) && !pool().includes(first), 'TAKE: onto your belt');

  // cash out: the rest come home
  const rest = pool();
  deckHome(run, true);
  check(rest.length && rest.every(k => deckHave(k) > 0), 'cash out: LOST LOOT comes home (' + rest.join() + ')');
` };
