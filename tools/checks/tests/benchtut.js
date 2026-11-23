// tools/checks/tests/benchtut.js: HOW TO PLAY's tabs (BASICS / ADVANCED and their sub-tabs, v15.53) and the WORKBENCH
// training (engine/tutorial.js startBenchTraining): locked without the WORKBENCH, played through from HOW TO PLAY and
// from a run's first bench, only what POPS asks for works, your own bench and belt come back, the feat and the
// components at the end. Run by tools/test.js (tools/checks/harness.js). With the page's #shots it also says a
// screenshot (a data URL) at each step, for a person to look at.
module.exports = { name: 'benchtut', body: `
  const tb = id => hits.find(h => h.id === id);
  const shot = n => { if (location.hash === '#shots') say('SHOT ' + n + ' ' + document.querySelector('canvas').toDataURL('image/png')); };
  const until = async (f, what, ms = 20000) => { for (let t = 0; t < ms; t += 40) { if (f()) return; await sleep(40); } throw new Error('stuck: ' + what + ' (pop ' + (st.tut && st.tut.pop ? st.tut.pop.id + (st.tut.pop.ok ? ' ok' : ' act') : '-') + ', tab ' + (st.bench && st.bench.tab) + ')'); };
  const popIs = (id, ok) => () => st.tut && st.tut.pop && st.tut.pop.id === id && !!st.tut.pop.ok === ok && st.tut.pop.lay;
  // an "ok" popup: wait for it, a picture, tap it away (one tap finishes the entrance, the next puts it away)
  const ok = async id => { await until(popIs(id, true), id); await sleep(700); shot(id); tutDismiss(); await sleep(400); tutDismiss(); await until(() => !popIs(id, true)(), id + ' gone'); };
  // a "do this" popup (after its text, an ok popup, when it has some)
  const act = async id => { await until(() => popIs(id, true)() || popIs(id, false)(), id); if (popIs(id, true)()) await ok(id); await until(popIs(id, false), id + ' (act)'); await sleep(500); shot(id + '_act'); };
  const tap = async id => { await until(() => tb(id), 'button ' + id); tb(id).onTap(); await sleep(250); };

  // ---- HOW TO PLAY: two tabs, sub-tabs under them
  openHelp(); await sleep(700);
  check(['htab0', 'htab1', 'hsub_intro', 'hsub_net', 'hsub_tray', 'hsub_training'].every(tb), 'BASICS: its tabs and sub-tabs');
  check(!tb('hsub_runs'), 'BASICS: no ADVANCED sub-tabs');
  shot('help_intro');
  await tap('htab1');
  check(['hsub_runs', 'hsub_board', 'hsub_deck', 'hsub_bench', 'hsub_pier'].every(tb), 'ADVANCED: five sub-tabs');
  check(['hsub_runs', 'hsub_pier'].every(id => { const h = tb(id); return h.x >= 0 && h.x + h.w <= innerWidth + 1; }), 'ADVANCED: the strip fits the screen');
  for (const p of ['runs', 'board', 'deck', 'bench', 'pier']) { await tap('hsub_' + p); shot('help_' + p); }
  check(HELP_PAGES[HELP_LAST.page].id === 'pier', 'the last sub-tab is remembered');
  st.keyHandler('arrowright'); await sleep(200);
  check(HELP_PAGES[HELP_LAST.page].id === 'intro', 'right from the last sub-tab wraps to BASICS > INTRO');

  // ---- TRAINING: the WORKBENCH one is locked without the post
  save.legacy = save.legacy || {}; save.legacy.bench = 0;
  openHelp('training'); await sleep(600);
  check(tb('tutorial') && !tb('benchtut'), 'TRAINING: the corp one; the WORKBENCH one is locked (no button)');
  shot('training_locked');

  // ---- from HOW TO PLAY: a stand-in run, your bench untouched
  save.legacy.bench = 1;
  save.bench = { letters: { Z: 2 }, locker: [null, null, null, null, null], pins: ['PCH'], popsSeen: true };
  const realJ = JSON.stringify(save.bench), feats0 = !!(save.feats && save.feats.apprentice);
  openHelp('training'); await sleep(600);
  shot('training_open');
  tb('benchtut').onTap();
  await until(() => st.tut && st.tut.bench && st.bench, 'the training starts');
  check(st.run && st.run.benchTut, 'a stand-in run');
  await ok('b_hello');
  check(JSON.stringify(save.bench) === realJ, 'your own bench is set aside');
  await act('b_shredtab');
  tb('bt_book').onTap(); await sleep(250);
  check(st.bench.tab === 'build', 'a tab POPS isn\\'t asking for does nothing');
  await tap('bt_shred');
  await ok('b_shred');
  await act('b_shredit');
  while (!['P', 'R', 'G'].every(ch => benchHave(ch) > 0)) { await until(() => !benchBusy() && tb('bkshred'), 'shred box'); tb('bkshred').onTap(); await sleep(200); }
  await ok('b_comps');
  await act('b_booktab'); await tap('bt_book');
  await act('b_pin');
  check(bookList()[st.bench.bkSel] === 'PRG', 'the BOOK opens on PURGE');
  await tap('bkpin');
  await act('b_buildtab'); await tap('bt_build');
  await ok('b_pinned'); await ok('b_wild');
  await act('b_type');
  benchKey('q'); await sleep(100);
  check(!st.bench.slots[0], 'a letter POPS isn\\'t asking for: no');
  for (const k of ['p', 'r', 'g']) { benchKey(k); await sleep(120); }
  check(st.bench.slots.slice(0, 3).join('') === 'PRG', 'P R G typed: ' + st.bench.slots.join(','));
  await act('b_build');
  shot('b_build_typed');
  benchKey('enter');
  await ok('b_locker');
  await act('b_lockertab'); await tap('bt_locker');
  await act('b_take'); await tap('bktake');
  check(st.run.items.some(x => x.key === 'purge'), 'TAKE: PURGE on the belt');
  await ok('b_store');
  await ok('b_bye');
  await until(() => !st.tut && st.panelTitle === 'HOW TO PLAY' && !st.swap, 'back to HOW TO PLAY');
  await sleep(1500);
  shot('after');
  check(st.run === null || !st.run.benchTut, 'the stand-in run is gone');
  check(save.feats && save.feats.apprentice && !feats0, 'APPRENTICE');
  const left = Object.assign({}, save.bench.letters); left.Z -= 2; if (!left.Z) delete left.Z;
  check(save.bench.pins.join() === 'PCH' && save.bench.locker.every(x => !x) && Object.values(left).reduce((a, n) => a + n, 0) === 5, 'your bench back, +5 components: ' + JSON.stringify(save.bench));

  // ---- in a run: your first bench offers it; END TRAINING puts your things back
  B.startRun('BENCHTUT', true); await settle('start');
  st.run.items = [{ key: 'patch', tier: 0, n: 2 }]; st.run.mods = []; st.run.loot = [];
  save.bench.popsSeen = false; CALL_QUEUE.length = 0; st.callBox = null; FEAT_QUEUE.length = 0; st.featBox = null;   // (APPRENTICE's box would come first)
  const node = { id: 'x', type: 'repair' };
  openBench(node); await sleep(600);
  await until(() => st.callBox && st.callBox.btns, 'POPS offers the training');
  shot('offer');
  check(st.callBox.btns.map(b => b.text).join() === '[ SHOW ME ],[ SKIP ]', 'SHOW ME / SKIP');
  st.callBox.btns[0].onTap(); st.callBox = null;
  await until(() => st.tut && st.tut.bench && st.tut.pop, 'the training, in a run');
  check(st.run.items.map(x => x.key).join() === 'ping,route', 'the kit on your belt');
  benchTutQuit();
  await until(() => !st.tut && st.bench && !st.swap, 'END TRAINING');
  check(st.run.items.length === 1 && st.run.items[0].key === 'patch' && st.run.items[0].n === 2, 'your belt is back');
  check(!save.stats.benchTrained || save.stats.benchTrained === 1, 'quitting gives nothing new');
` };
