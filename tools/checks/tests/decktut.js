// tools/checks/tests/decktut.js: the deck training (engine/tutorial.js startDeckTraining, v15.55): locked in HOW TO PLAY
// without a deck, played through from there, offered the first time you open your deck (then ROOT's card after it), only
// what POPS asks for works, your deck untouched, DECKHAND at the end. Also the NO POWER bar with no cell ("slot a cell
// in PSU"). Run by tools/test.js (tools/checks/harness.js). With the page's #shots it says a screenshot at each step.
module.exports = { name: 'decktut', body: `
  const tb = id => hits.find(h => h.id === id);
  const shot = n => { if (location.hash === '#shots') say('SHOT ' + n + ' ' + document.querySelector('canvas').toDataURL('image/png')); };
  const until = async (f, what, ms = 20000) => { for (let t = 0; t < ms; t += 40) { if (f()) return; await sleep(40); } throw new Error('stuck: ' + what + ' (pop ' + (st.tut && st.tut.pop ? st.tut.pop.id + (st.tut.pop.ok ? ' ok' : ' act') : '-') + ')'); };
  const popIs = (id, ok) => () => st.tut && st.tut.pop && st.tut.pop.id === id && !!st.tut.pop.ok === ok && st.tut.pop.lay;
  const ok = async id => { await until(popIs(id, true), id); await sleep(700); shot(id); tutDismiss(); await sleep(400); tutDismiss(); await until(() => !popIs(id, true)(), id + ' gone'); };
  const act = async id => { await until(() => popIs(id, true)() || popIs(id, false)(), id); if (popIs(id, true)()) await ok(id); await until(popIs(id, false), id + ' (act)'); await sleep(500); shot(id + '_act'); };
  const tap = async id => { await until(() => tb(id), 'button ' + id); tb(id).onTap(); await sleep(300); };

  // no deck: locked
  save.deck = null;
  openHelp('training'); await sleep(600);
  check(!tb('decktut'), 'no deck: the deck training is locked');

  // a deck of your own (it must come through untouched)
  save.deck = deckFreshSave(); save.deck.popsSeen = true; save.legacy = save.legacy || {};
  const realJ = JSON.stringify(save.deck);
  openHelp('training'); await sleep(600);
  shot('training');
  tb('decktut').onTap();
  await until(() => st.tut && st.tut.deck && DECK && DECK.train, 'the training starts');
  await ok('d_hello');
  check(deckPower().off.includes('BT1') && !DECK.slots.PSU, 'FIRST AID in, no cell: no power');
  await ok('d_nopower');
  await act('d_bar');
  tb('dktc').onTap(); await sleep(200);
  check(DECK.view === 'board', 'a tab POPS isn\\'t asking for does nothing');
  await tap('dkbar');
  check(DECK.sel.id === 'PSU', 'the bar goes to the PSU');
  await act('d_psu');
  await tap('dkchg');
  check(DECK.pick && DECK.pick.id === 'PSU', 'CHOOSE: the picker');
  await tap('dkk_SC1'); await tap('dkgo');
  check(DECK.slots.PSU === 'SC1' && deckPower().on.has('BT1'), 'the cell in: FIRST AID has power');
  await ok('d_power'); await ok('d_pwr'); await ok('d_find');
  await act('d_slot');
  check(DECK.sel.id === 'BT2', 'BT2 picked for you');
  await tap('dkchg'); await tap('dkk_TF1'); await tap('dkgo');
  check(DECK.slots.BT2 === 'TF1', 'TRUST FUND in BT2');
  await ok('d_red'); await ok('d_slots'); await ok('d_chips'); await ok('d_mk'); await ok('d_bye');
  await until(() => !st.tut && st.panelTitle === 'HOW TO PLAY' && !st.swap, 'back to HOW TO PLAY');
  check(JSON.stringify(save.deck) === realJ, 'your deck untouched');
  check(save.feats && save.feats.deckhand, 'DECKHAND');

  // your deck, the first time: the offer; SHOW ME, Esc out, back on your deck with ROOT's card next
  FEAT_QUEUE.length = 0; st.featBox = null; CALL_QUEUE.length = 0; st.callBox = null;
  save.deck.popsSeen = false;
  openDeck(); await sleep(500);
  await until(() => st.callBox && st.callBox.btns, 'POPS offers it');
  shot('offer');
  check(st.callBox.btns.map(b => b.text).join() === '[ SHOW ME ],[ SKIP ]', 'SHOW ME / SKIP');
  st.callBox.btns[0].onTap(); st.callBox = null;
  await until(() => st.tut && st.tut.deck && st.tut.pop, 'the training, from your deck');
  deckKey('escape');
  await until(() => !st.tut && DECK && DECK.real && !st.swap, 'Esc: back to your deck');
  check(JSON.stringify(save.deck.slots) === JSON.stringify(deckFreshSave().slots), 'your deck as it was');

  // the real NO POWER bar with no cell
  showTitle(); DECK = null; await sleep(200);
  delete save.deck.slots.PSU; save.deck.order = save.deck.order.filter(i => i !== 'PSU');
  save.deck.chips.FA1 = 1; save.deck.slots.BT1 = 'FA1'; save.deck.order.push('BT1');
  CALL_QUEUE.length = 0; st.callBox = null;
  openDeck(); await sleep(800);
  shot('nocell');
  check(tb('dkbar'), 'no cell: the bar is up');
  tb('dkbar').onTap(); await sleep(200);
  check(DECK.sel.kind === 'socket' && DECK.sel.id === 'PSU', 'and it goes to the PSU');
` };
