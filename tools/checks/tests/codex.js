// tools/checks/tests/codex.js: THE CODEX's tabs (engine/codex.js, Greg 2026-11-21): TECH / NET / HACKERS with a sub-tab
// strip under them; CHIPS only once you've got a chip of your own; CREW and RIVALS apart; the arrows walk every sub-tab;
// it opens where you left it. Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'codex', body: `
  save.deck = save.deck || deckFreshSave();
  const chips0 = JSON.stringify(save.deck.chips);
  const subs = () => cxTabs().flatMap(t => t[2]);
  save.deck.chips = { SC1: 1, SP3: 1 };
  check(!subs().includes('chips'), "only the deck's own chips: no CHIPS tab");
  save.deck.chips.CD2 = 1;
  check(subs().join(' ') === 'items mods chips corps glyphs sectors crew rivals', 'a chip of your own: CHIPS under TECH: ' + subs().join(' '));
  check(cxChips().every(k => !deckBeta(k)) && cxChips().length > 50, 'the chips list: ' + cxChips().length + ', no BETA ones');
  check(/deck/.test(cxChipWhere('SC1')) && /FENCE/.test(cxChipWhere('LW1')) && /WORKBENCH/.test(cxChipWhere('CD2')), 'where a chip comes from');

  CX_LAST.tab = null; openCodex(); await sleep(300);
  check(st.mode === 'panel' && hits.some(h => h.id === 'tab_tech') && hits.some(h => h.id === 'tab_net') && hits.some(h => h.id === 'tab_hk'), 'three main tabs');
  check(hits.some(h => h.id === 'cxs_items') && hits.some(h => h.id === 'cxs_chips') && !hits.some(h => h.id === 'cxs_corps'), 'TECH open: its sub-tabs');
  const right = async () => { st.keyHandler('arrowright'); await sleep(120); };
  await right(); await right(); check(CX_LAST.tab === 'chips', 'right, right: chips: ' + CX_LAST.tab);
  await right(); check(CX_LAST.tab === 'corps' && hits.some(h => h.id === 'cxs_corps'), 'right again: into NET, on corps');
  await right(); await right(); await right(); check(CX_LAST.tab === 'crew', 'into HACKERS, on crew');
  check(hits.filter(h => /^cx\\d/.test(h.id)).length === HK_CREW.length, 'crew only in the list: ' + hits.filter(h => /^cx\\d/.test(h.id)).length + ' of ' + HK_CREW.length + ' ' + HK_RIVALS.length);
  await right(); await right(); check(CX_LAST.tab === 'items', 'round to the start');
  hits.find(h => h.id === 'cxs_chips').onTap(); await sleep(150);
  check(CX_LAST.tab === 'chips', 'tap a sub-tab: chips');
  swapTo(showTitle); await sleep(300); openCodex(); await sleep(300);
  check(CX_LAST.tab === 'chips' && hits.some(h => h.id === 'cxs_chips'), 'it opens where you left it');
  save.deck.chips = JSON.parse(chips0); CX_LAST.tab = null;
` };
