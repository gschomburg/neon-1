// tools/checks/tests/favglyph.js: the deck's GLYPH (Greg, 2026-11-22, v15.48): your favourite of the real glyphs you've
// seen, and its bonus: LOOT (free), SIGNED, GOLDEN, COLLECTOR (THE BOARD's posts). Only where a corp shows the codex's
// glyphs: a corp's own symbols never count. Run by tools/test.js.
module.exports = { name: 'favglyph', body: `
  save.legacy = save.legacy || {};
  const lg0 = Object.assign({}, save.legacy);
  Object.assign(save.legacy, { deck3: 1, gsigned: 0, ggolden: 0, gcollect: 0 });
  save.deck = save.deck || deckFreshSave();
  const gi = ART_GLYPHS.findIndex(g => g.name === 'PADLOCK');
  save.seen['g' + gi] = true; save.deck.fav = gi; save.deck.favB = 'golden';
  DECK = deckReal();
  check(DECK.glyph === gi && deckFavPool().includes(gi), 'your glyph: one of the real glyphs you have seen');
  check(DECK.favB === 'golden' && !deckFavBOpen('golden') && deckFavBOpen('loot'), 'LOOT is free; GOLDEN needs its post');
  deckFavStep(1); check(DECK.favB === 'loot', 'the bonus only steps through the ones you have');
  save.legacy.ggolden = 1; deckFavStep(1); check(DECK.favB === 'golden', '...GOLDEN once its post is bought');
  check(['gsigned', 'ggolden', 'gcollect'].every(k => LEGACY.some(u => u.key === k && u.needs === 'deck3')), 'SIGNED, GOLDEN, COLLECTOR: posts on THE BOARD');
  deckPersist(); check(save.deck.fav === gi && save.deck.favB === 'golden', 'it saves');
  // the picker opens with your glyphs and the bonus
  openDeck(); await sleep(300); deckPick('GLY'); await sleep(200);
  check(DECK.pick && buildScene(performance.now(), false).length > 300 && hits.some(h => h.id === 'dkfb'), 'the picker: your glyphs and the bonus');
  DECK.pick = null;
  // a run: it's on; only the very glyph counts (a corp's own symbol that looks the same doesn't)
  B.startRun('FAVGLYPH', false); await settle('start');
  const run = st.run;
  check(run.fav === gi && run.favB === 'golden', 'the run has your glyph and its bonus');
  check(deckFavIs({ glyph: MOTIFS[gi] }) && !deckFavIs({ glyph: MOTIFS[gi].slice() }) && !deckFavIs({ glyph: MOTIFS[(gi + 1) % MOTIFS.length] }), 'only the real glyph counts');
  // COLLECTOR: every tap counts; the 10th gives a mod
  run.favB = 'collector'; save.deck.favTaps = 8; st.corp = st.corp || { node: { id: 'x' }, idx: 0, tier: 1 };
  const m0 = run.mods.length; deckFavTap({ glyph: MOTIFS[gi] }); check(save.deck.favTaps === 9, 'COLLECTOR: 9/10');
  const line = deckFavTap({ glyph: MOTIFS[gi] }); check(save.deck.favTaps === 0 && /COLLECTOR 10\\/10/.test(line) && (run.mods.length === m0 + 1 || /cr/.test(line)), 'the 10th: a mod (or credits): ' + line);
  // LOOT: it pays out
  run.favB = 'loot';
  const l2 = deckFavTap({ glyph: MOTIFS[gi] }); check(/got|cr/.test(l2), 'LOOT: it pays out: ' + l2);
  save.legacy = lg0;
`};
