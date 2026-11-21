// tools/checks/tests/teach.js: teaching THE SHELL and the deck (v15.05): the codex's SHELL mark (engine/codex.js
// cxShellTop), shell chips before ROOT point at it (engine/deck.js deckNoShell), POPS's bench and deck lines, THE
// BOARD's two tab rows with DECK, and a run's history saying rooted. Run by tools/test.js (tools/checks/harness.js).
module.exports = { name: 'teach', body: `
  save.legacy = save.legacy || {};
  const rootWas = save.legacy.crew_root;
  const tiered = Object.keys(ITEMS).find(k => deckGiveable('gear', k) && ITEMS[k].tiers && ITEMS[k].tiers.some(t => t.rarity === 'epic'));
  const epicAt = ITEMS[tiered].tiers.findIndex(t => t.rarity === 'epic');
  save.seen[tiered] = true; save.shredded = {};

  // the codex's mark: nothing before ROOT; rare when only found; the top rarity you've shredded after
  save.legacy.crew_root = 0;
  check(cxShellTop('gear', tiered) === null, 'no ROOT: no SHELL mark');
  save.legacy.crew_root = 1;
  const found = cxShellTop('gear', tiered);
  check(found === 'rare' || found === 'common', 'found, not shredded: rare at most: ' + found);
  save.shredded[tiered] = epicAt;
  check(cxShellTop('gear', tiered) === 'epic', 'an epic shredded: epic');
  { const rows = []; const T = (s) => rows.push({ s }), X = o => rows.push(o);
    cxWhere(X, T, 'from: anywhere.', 'epic');
    check(rows.length === 1 && rows[0].moreChips && rows[0].moreChips[0].r === 'epic' && rows[0].text.startsWith('SHELL '), 'a short from line: SHELL in front of it, an epic chip');
    rows.length = 0; cxWhere(X, T, 'from: ' + 'x'.repeat(30), 'rare');
    check(rows.length === 2 && rows[0].chip === 'rare', 'a long one: SHELL on its own row'); }
  // the codex opens on gear with it
  openCodex && openCodex('gear'); await sleep(300);
  check(st.mode === 'panel', 'the codex opens with the mark in');

  // a SHELL chip before ROOT: its tip says so
  const sk = Object.keys(DECK_CHIPS).find(k => DECK_CHIPS[k][1] === 'shell');
  save.legacy.crew_root = 0;
  check(deckNoShell(sk) && /ROOT/.test(ITEMS[deckChipItem(sk)].tip), 'a shell chip without ROOT: its tip points at ROOT: ' + ITEMS[deckChipItem(sk)].tip);
  save.legacy.crew_root = 1;
  check(!deckNoShell(sk) && !/ROOT/.test(ITEMS[deckChipItem(sk)].tip), 'with ROOT: no note');
  save.legacy.crew_root = 0;

  // POPS: the bench's shell lines, the deck's training
  check(benchShellLines().join(' ').includes("don't know what a shell is"), 'the bench, before ROOT: the mystery line');
  save.legacy.crew_root = 1;
  check(/give.mod/.test(benchShellLines().join(' ')), 'with ROOT: give.mod, give.gear');
  save.deck = save.deck || deckFreshSave(); save.deck.popsSeen = false;
  CALL_QUEUE.length = 0; st.callBox = null;
  const calls = () => CALL_QUEUE.concat(st.callBox ? [st.callBox] : []).filter(c => c.who === 'pops' && c.lines.some(l => /socket/.test(l)));
  openDeck();
  check(save.deck.popsSeen && calls().length === 1, 'your deck, the first time: POPS trains you');
  openDeck();
  check(calls().length === 1, 'the second time: no call');
  CALL_QUEUE.length = 0; st.callBox = null;

  // THE BOARD: YOU REP DECK over FEATS CREW QUESTS
  openBoard('rep'); await sleep(600);
  const tb = id => hits.find(h => h.id === id);
  check(tb('back') && hits.every(h => h.y >= tb('back').y), 'THE BOARD: [< TITLE] top left, the first row');
  check(['tby', 'tbr', 'tbd', 'tbf', 'tbc', 'tbq'].every(tb), 'all six tabs');
  check(tb('tby').y === tb('tbd').y && tb('tbf').y > tb('tby').y, 'two rows: DECK up top, FEATS under: ' + ['tby', 'tbd', 'tbf'].map(i => tb(i).y).join(' '));
  tb('tbd').onTap(); await sleep(600);
  check(st.panelTitle === 'THE DECK', 'DECK opens your deck: ' + st.panelTitle);
  check(['dkb_you', 'dkb_rep', 'dkb_feats', 'dktb', 'dktc'].every(tb) && !tb('dkleave'), 'the deck: THE BOARD tabs on top, SLOTS and CHIPS under, no [LEAVE]');
  save.deck.slots = {}; tb('dkb_rep').onTap(); await sleep(900);
  check(st.panelTitle === 'THE BOARD', 'its REP tab goes back to THE BOARD: ' + st.panelTitle);

  // a run that used THE SHELL's chip commands: rooted in its history
  B.startRun('TEACHTEST', false); await settle('start');
  st.run.hacked = true; noteHistory(st.run);
  check(save.history[0].rooted === true && !save.history[0].practice, 'history: rooted');
  // QUESTS: one at a time, < NAME > to step; one with news first (Greg, 2026-11-21)
  { const ids = Object.keys(QUEST_INFO).slice(0, 2); save.quests = save.quests || {};
    for (const i of ids) save.quests[i] = Object.assign(save.quests[i] || {}, { step: QUEST_INFO[i].steps[0].key, seen: true, news: false });
    save.quests[ids[1]].news = true; st.questTab = null;
    openBoard('quests'); await sleep(700);
    check(st.questTab === ids[1] && tb('qnext') && tb('qprev') && !hits.some(h => /^qtab_/.test(h.id || '')), 'QUESTS: the one with news first, arrows, no quest tabs');
    tb('qnext').onTap(); await sleep(200);
    check(st.questTab === ids[0], 'the arrow steps to the next'); }
  save.legacy.crew_root = rootWas;
` };
