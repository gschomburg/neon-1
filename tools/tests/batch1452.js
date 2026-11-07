// tools/tests/batch1452.js: the v14.52 batch (Greg 2026-11-07): one tab at a time, REWIND's legendary (COLDBREW's boss
// gear), the board's tab row fits with its *s and a scene covers the page past its edges, the bottom of HAD3S says JACK
// OUT, the map's node card fits over the tray (its extra lines take turns), FX.ticker. Run by tools/test.js.
module.exports = { name: 'batch1452', body: `
  await settle();
  // one tab at a time: another tab (a second channel here) says hello, then takes the game
  {
    const other = new BroadcastChannel('neon.tabs.' + STORE_KEY), got = [];
    other.onmessage = e => got.push(e.data.t);
    other.postMessage({ t: 'hello', id: 'x' }); await sleep(300);
    check(got.includes('here'), 'a new tab hears this one is playing');
    other.postMessage({ t: 'take', id: 'x' }); await sleep(300);
    check(got.includes('released') && TABS.away, 'a take: this tab saves and goes quiet');
    const before = localStorage.getItem(STORE_KEY); save.runs = 9999; persist();
    check(localStorage.getItem(STORE_KEY) === before, 'a quiet tab never writes the save');
    TABS.away = false; save.runs = 0; persist(); other.close();
  }
  // REWIND: epic stops this layer's clocks, legendary the corp's; COLDBREW's boss gives the legendary
  {
    const r = MODS.rewind || ITEMS.rewind;
    check(r.tiers.length === 4 && r.tiers[3].rarity === 'legendary' && r.tiers[2].rarity === 'epic', 'REWIND: four tiers, legendary on top');
    check(CORPS.coldbrew.gear.key === 'rewind' && CORPS.coldbrew.gear.tier === 3, 'COLDBREW gives the legendary');
  }
  // the board's tabs: every * at once still fits the width
  {
    save.newTitle = true; save.unseen = { x: 1 }; openBoard('quests'); await sleep(600);
    const tabs = hits.filter(h => /^tb/.test(h.id || ''));
    check(tabs.length === 5 && tabs.every(h => h.x >= L.ox - 1), 'the tab row stays on the screen with its *s');
    save.newTitle = false; save.unseen = {};
  }
  // FX.ticker / swapLines
  {
    check(FX.ticker('short', 10, 0, 99999) === 'short', 'a short line never scrolls');
    check(FX.ticker('0123456789abc', 10, 0, 0) === '0123456789' && FX.ticker('0123456789abc', 10, 0, 900 + 140 * 3) === '3456789abc', 'a long one: a beat, then it scrolls');
    check(FX.swapLines(['aa', 'bb'], 10, 0, 100).k === 0 && FX.swapLines(['aa', 'bb'], 10, 0, 2700).k === 1, 'swapped lines take turns');
  }
  // HAD3S: CERBERUS's card fits over the tray; the bottom of HAD3S says JACK OUT
  {
    B.startRun('HAD3S', true); await settle('start');
    const run = st.run; run.sector = 1; addSector(run.map, run.seed, 1);
    if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
    if (st.mapView) st.mapView.sector = 1;
    for (let i = 0; i < 5; i++) { if (st.evCard) closeEventCard(); if (st.callBox) { await sleep(900); callClose(); } await sleep(400); }
    const fin = Object.values(run.map).find(n => n.type === 'final' && n.corp === 'cerberus');
    st.mapSel = fin.id; await sleep(700);
    const br = hits.find(h => h.id === 'enter');
    check(br && (br.y + br.h - L.oy) / L.chh <= BOARD_Y + L.gh + 1 + 0.01, 'CERBERUS: BREACH stays over the tray');
    st.result = { sector: true, n: 2, boss: 'CERBERUS', depth: 1, corps: 1, earned: 0, breached: [] }; st.mode = 'over';
    const ls = overLines(); check(ls.some(l => l.box && /J A C K/.test(l.text)), 'the bottom of HAD3S: JACK OUT');
  }
` };
