// tools/checks/tests/favorcorps.js: corps that come up more (Greg, 2026-11-22, v15.51): FRESH, CASINO, CLOCK, DARK
// (chips) and NEMESIS (THE BOARD). The map picks its corps as always; then each slot may swap to one of them on its own
// stream, so a seed's map changes only at the swapped slots, and not at all without them. Run by tools/test.js.
module.exports = { name: 'favorcorps', body: `
  check(['FR5', 'CS7', 'CK9', 'DK6'].every(k => !deckBeta(k)), 'none of them is BETA now');
  const strip = m => JSON.stringify(Object.values(m).sort((a, b) => a.id < b.id ? -1 : 1).map(n => [n.id, n.type, n.next.slice().sort(), n.ev || '', n.tier || 0]));
  const corpsOf = m => Object.values(m).filter(n => n.type === 'corp').map(n => n.corp);
  const casino = DECK_FAVOR.CS7;
  let same = 0, swapped = 0, slots = 0, casinoIn = 0, casinoBase = 0, other = 0;
  for (let i = 0; i < 40; i++) {
    const seed = 'FAV' + i, base = genMap(seed), none = genMap(seed, null, []), fav = genMap(seed, null, [{ keys: casino, p: 0.2 }]);
    if (strip(base) === strip(none) && JSON.stringify(corpsOf(base)) === JSON.stringify(corpsOf(none))) same++;
    if (strip(base) !== strip(fav)) other++;   // (anything but the corps changed: it shouldn't)
    Object.values(base).filter(n => n.type === 'corp').forEach(n => { slots++; const f = fav[n.id].corp; if (f !== n.corp) { swapped++; if (!casino.includes(f)) other++; } if (casino.includes(f)) casinoIn++; if (casino.includes(n.corp)) casinoBase++; });
  }
  check(same === 40, 'no chip or post: the seed own map, the same every time');
  check(other === 0, 'with CASINO: only corps change, and only to casino corps');
  check(swapped > slots * 0.08 && swapped < slots * 0.3 && casinoIn > casinoBase * 2, 'about 1 slot in 5 swaps; casino corps come up a lot more: ' + swapped + '/' + slots + ', ' + casinoBase + ' -> ' + casinoIn);
  // NEMESIS is a swap now too: the plain map ignores it
  save.legacy = save.legacy || {}; const lg = save.legacy.nemesis, nm = save.nemesis;
  save.legacy.nemesis = 1; save.nemesis = 'luckeez';
  check(strip(genMap('FAV1')) === strip(genMap('FAV1', null, [])) && JSON.stringify(corpsOf(genMap('FAV1'))) === JSON.stringify(corpsOf(genMap('FAV1', null, []))), 'NEMESIS no longer weights the plain map');
  B.startRun('FAVRUN', false); await settle('start');
  const f = deckFavor(st.run);
  check(f.some(x => x.keys.length === 1 && x.keys[0] === 'luckeez'), 'NEMESIS: a swap of its own in a run');
  st.run.chips = ['FR5']; check(deckFavor(st.run).some(x => x.keys.length > 10), 'FRESH: the corps you have not beaten');
  save.legacy.nemesis = lg; save.nemesis = nm;
`};
