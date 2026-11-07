// tools/checks/tests/batch1448.js: the v14.48 fixes (the H3AV3N playtest, 2026-11-06) stay put. Run by tools/test.js (a
// headless page).
module.exports = { name: 'batch1448', body: `
  B.startRun('B1448TEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }

  // CERBERUS: with only the real node free (the rest burned, the other eyes on what's left), an eye rests; it never
  // sits on the real node past its red
  {
    const tiles = [0, 1, 2].map(i => ({ col: i, row: 0, state: 'closed' }));
    const lv = { tiles, safe: 0, shownAt: 0 };
    const cb = { boss: false, plain: true, seed: 1, eyes: [], m: null, look: null, said: false, teach: false, taught: {} };
    lv.cb = cb;
    const ctx = { cells: [], put() {}, bg() {} };
    const t0 = performance.now(); let onReal = 0, seen = 0, worst = 0;
    while (performance.now() - t0 < 9000) {
      HEAVEN.cerberus.overlay(ctx, lv, performance.now());
      const now = performance.now(), e = cb.eyes.find(o => o.tile === tiles[0]);
      if (e && now >= e.at) { onReal = onReal || now; seen = now; worst = Math.max(worst, now - onReal); } else if (now - seen > 200) onReal = 0;   // (a frame off it doesn't count: it looked like one long red)
      await sleep(30);
    }
    check(worst < CERB.red * 1000 + 300, 'an eye leaves the real node: the longest on it ' + Math.round(worst) + 'ms');
  }

  // a boss's rewards never offer the same CALL twice
  {
    const realG = window.rewardGear, realC = window.callReward, g0 = ECON.reward.gear;
    window.rewardGear = () => ({ kind: 'gear', key: 'call_b0y', tier: 0, n: 1 }); window.callReward = () => ({ kind: 'gear', key: 'call_b0y', tier: 0, n: 2 }); ECON.reward.gear = 1;
    const node = Object.values(st.run.map).find(n => n.type === 'corp');
    const opts = rewardOptions(node);
    window.rewardGear = realG; window.callReward = realC; ECON.reward.gear = g0;
    check(opts.filter(o => o.key === 'call_b0y').length === 1, 'one b0y CALL: ' + opts.map(o => o.key).join(' '));
  }

  // G0D DEFEATED: once the screen's chrome has gone, the tray's chip backgrounds go with it
  {
    st.frameBgs = [{ cx: 0, cy: L.hc - 3, w: 4, col: '#ff8800', alpha: 1 }, { cx: 0, cy: BOARD_Y + 1, w: 4, col: '#ff8800', alpha: 1 }];
    g0dChromeFade([], [], 1);
    check(st.frameBgs.length === 1 && st.frameBgs[0].cy === BOARD_Y + 1, 'the chips go: ' + st.frameBgs.length + ' left');
  }

  // a long intro line wraps (G0D MAZE's ran off a phone)
  check(wrapText(HEAVEN.maze.intel, 31).every(l => l.length <= 31) && !!HEAVEN.maze.mapLine, 'the maze intro fits');

  // the ending's long cards: the tap line is under the last line
  {
    playScene('h3av3n', () => {}); await sleep(400);
    const N = QUEST_SCENES.h3av3n.length, i = QUEST_SCENES.h3av3n.findIndex(f => f.title && f.title[0] === 'CREDITS');
    st.qScene.i = i; st.qScene.t0 = performance.now() - 5000;
    let rows = []; for (let k = 0; k < 30 && !rows.length; k++) { await sleep(60); rows = buildScene(performance.now(), false, true).filter(c => c.own === 'hud'); }
    const yOf = word => { const line = {}; for (const c of rows) line[c.cy] = (line[c.cy] || '') + c.ch; return +Object.keys(line).find(y => line[y].includes(word)); };
    let tapY = NaN; for (let k = 0; k < 20 && isNaN(tapY); k++) { await sleep(100); rows = buildScene(performance.now(), false, true).filter(c => c.own === 'hud'); tapY = yOf('tapto'); }
    check(tapY > yOf('andfriends'), 'credits: the tap line (' + tapY + ') is under the last line (' + yOf('andfriends') + ')');
    sceneEnd(); await sleep(300);
  }
  // the OMNI RAID: b0y rides in the tray till the sector's done; [b] calls him in, once a corp
  {
    const q = questOf('pops'), was = Object.assign({}, q), run = st.run; save.legacy = save.legacy || {}; const crew0 = save.legacy.crew_b0y;
    save.legacy.crew_b0y = 1; q.step = 'raid'; q.raidCalled = true;
    const items0 = run.items.length; questRunStart(run);
    check(run.boyTray && run.items.length === items0, 'the raid: b0y in the tray, no CALL stack');
    boyCall(); check(/corp/.test(st.msg || ''), 'on the map: he waits for a corp: ' + st.msg);
    let id = null; for (let k = 0; k < 6 && !id; k++) { id = availableNodes().find(i => st.run.map[i].type === 'corp'); if (!id) { await B.enterNode(st.run.map[availableNodes()[0]]); await settle('x'); if (st.mode !== 'map') { B.toMap(); await settle('m'); } } }
    await B.enterNode(st.run.map[id]); await settle('enter'); await B.pick(st.lv.safe); for (let j = 0; j < 100 && (st.busy || st.transitioning || st.wipe); j++) await sleep(50);
    boyCall(); await sleep(300); st.hkCard = null; st.hkCards = [];
    check(!!hkUp('b0y'), 'in a corp: [b] calls him in');
    const h = hkUp('b0y'); h.out = true; boyCall(); check(!hkUp('b0y') && /next corp/.test(st.msg || ''), 'once a corp: ' + st.msg);
    h.out = false;
    // his three cursors: one on each maybe, then all on the real node
    const lv = st.lv, sh = hkS(lv, h); for (let k = 0; k < 20; k++) { hkTick(lv, performance.now()); await sleep(20); }
    check(sh.split && sh.split.length === Math.min(3, hkCands(lv).length) && new Set(sh.split).size === sh.split.length, 'split: one cursor a maybe: ' + (sh.split || []).length);
    sh.m0 -= 20000; for (let k = 0; k < 5; k++) { hkTick(lv, performance.now()); await sleep(20); }
    check(sh.split.every(t => t === lv.tiles[lv.safe]), 'split: they end up on the real node');
    questSector(); check(!run.boyTray, 'the sector cleared: his ride ends');
    Object.assign(q, was); save.legacy.crew_b0y = crew0;
  }

  // STEADY HANDS: no catch outruns the line
  check(LEGACY.some(u => u.key === 'steady' && u.tier === 2 && u.costs[0] === 300) && FISH_STEADY < 0.65, 'STEADY HANDS: a USER post, 300 REP');
`};
