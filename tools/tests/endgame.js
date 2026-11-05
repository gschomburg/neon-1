// tools/tests/endgame.js: the 1UP, REPLAYS and the seed boards (docs/ENDGAME.md). Run by tools/test.js.
module.exports = { name: 'endgame', body: `
  save.beatG0D = true;
  B.startRun('ONEUPTEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  check(st.run.oneUp === 1, 'a run starts with a 1UP after G0D');
  const id = availableNodes().find(i => st.run.map[i].type === 'corp');
  await B.enterNode(st.run.map[id]); await settle('enter'); await sleep(300);
  const layout = () => st.lv.tiles.length + ':' + st.lv.safe, L1 = layout(), cr0 = st.run.credits;
  st.run.credits += 77; st.run.integrity = 0;
  die(); await sleep(1500);
  const btn = panelLines().find(l => l.id === 'oneup');
  check(!!btn, 'dying with a 1UP asks CONTINUE?');
  if (btn) {
    btn.onTap(); await settle('1up'); await sleep(1500); await settle('1up2');
    check(st.corp && st.corp.idx === 0 && layout() === L1, 'the 1UP brings back the same layer');
    check(st.run.credits === cr0 && st.run.oneUp === 0 && st.run.oneUps === 1, '1UP state: credits ' + st.run.credits + ' oneUp ' + st.run.oneUp);
    st.run.integrity = 0; die(); await sleep(2500); await settle('over');
    check(st.mode === 'over', 'the second death is game over: ' + st.mode);
  }

  // seed boards with a fake leaderboard server (engine/leaders.js)
  const boards = {};
  const sortB = l => l.sort((x, y) => y.score - x.score || x.tie - y.tie || x.at - y.at);
  lbGl = { dev: false, flush() {}, setName: () => Promise.resolve({ ok: true }),
    submitScore(board, s) { const l = boards[board] = boards[board] || []; const e = Object.assign({}, s, { me: true }); l.push(e); sortB(l); return Promise.resolve({ ok: true, run: l.indexOf(e) + 1, rank: 1, of: l.length }); },
    scores(board, o) { const l = boards[board] || []; return Promise.resolve({ board, entries: l.slice(0, o.limit).map((e, i) => Object.assign({ rank: i + 1 }, e)), you: null, of: l.length }); } };
  window.LB_TEST = true;
  setSeed('K7XQ2M');
  check(st.seeded && !st.practice, 'a typed seed is seeded, not practice');
  jackIn(); await settle('seeded');
  check(st.run.seeded && !st.run.practice, 'the run is seeded');
  st.run.depth = 26; lbSubmit(st.run, false); await sleep(300);
  const posted = Object.keys(boards).filter(k => boards[k].some(e => e.data.seed === 'K7XQ2M')).sort().join(',');
  check(posted === 'replays,seed-K7XQ2M', 'a seeded run posts to its seed boards only: ' + posted);
  st.seed = 'X'; st.seeded = false; startRun('RNDSEED', false); await settle('random');
  st.run.depth = 9; lbSubmit(st.run, false); await sleep(300);
  const rnd = Object.keys(boards).filter(k => boards[k].some(e => e.data.seed === 'RNDSEED')).sort().join(',');
  check(/^all,day-.*,seed-RNDSEED$/.test(rnd), 'a random run posts to today, all time and its seed: ' + rnd);
  st.lbTab = 'seeds'; st.lbSeed = null; openLeaders(); await sleep(800);
  check(panelLines().some(l => l.tap && /K7XQ2M/.test(l.text)), 'the SEEDS front page lists the seed');
` };
