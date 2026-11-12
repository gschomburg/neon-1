// tools/checks/tests/shell.js: THE SHELL (engine/shell.js): reading a line, the list, what you know, and a few
// commands run on a real run.
module.exports = { name: 'shell', body: `
  const key = (k, o = {}) => SHELL.input.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, o)));
  const type = s => { SHELL.input.value = s; SHELL.input.setSelectionRange(s.length, s.length); SHELL.input.dispatchEvent(new Event('input')); };
  const last = () => SHELL.log[SHELL.log.length - 1];

  // reading a line: with the dot, without it, split by a space
  for (const [line, name, args] of [['give.mod tracer 2', 'give.mod', 2], ['givemod tracer', 'give.mod', 1], ['give mod tracer', 'give.mod', 1], ['show ad', 'show.ad', 0], ['cr 50', 'credits', 1]]) {
    const p = shellParse(line);
    check(p && p.cmd && p.cmd.name === name && p.args.length === args, line + ' reads as ' + name + ' with ' + args + ' args: ' + (p && p.cmd && p.cmd.name) + ' ' + (p && p.args.length));
  }

  // knowing nothing: no autocompletes, a message instead; help says so too
  st.devAccess = false;
  shellOpen();
  check(st.shell && !SHELL.el.hidden, 'it opens');
  type('give');
  check(SHELL.list.length === 1 && SHELL.list[0].none === 'no commands known', 'nothing known: a message, no list: ' + JSON.stringify(SHELL.list[0]));
  check(shellHelp() === 'no commands known.', 'help: no commands known');
  await shellRun('heal');
  check(last().cls === 'err', 'an unknown command is an error');

  // dev mode: everything
  st.devAccess = true;
  type('give.m');
  check(SHELL.list[0] && SHELL.list[0].v === 'give.mod', 'give.m lists give.mod first: ' + (SHELL.list[0] && SHELL.list[0].v));
  type('give mod');
  check(SHELL.list[0] && SHELL.list[0].v === 'give.mod', 'give mod lists give.mod too');
  type('give.mod trac');
  check(SHELL.list[0] && SHELL.list[0].arg && SHELL.list[0].v === 'tracer', 'the mod argument lists tracer: ' + (SHELL.list[0] && SHELL.list[0].v));
  key('Tab');
  check(SHELL.input.value === 'give.mod tracer ', 'Tab fills it in: ' + JSON.stringify(SHELL.input.value));

  // the game takes no keys while it's open
  const muted = !!save.muted;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
  check(!!save.muted === muted, 'm does not mute while the shell is open');

  // commands on a run
  B.startRun('TERMTEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  check(!st.run.practice, 'a fresh run counts');
  type('hea'); key('Enter'); await sleep(50);
  check(st.run.integrity === st.run.maxInt && SHELL.log.some(l => l.cls === 'cmd' && l.s === 'heal'), 'hea + Enter runs heal');
  check(st.run.practice, 'a cheat makes the run practice');
  await shellRun('int 2');
  check(st.run.integrity === 2, 'int 2: ' + st.run.integrity);
  await shellRun('give.mod tracer 2');
  check(st.run.mods.includes('tracer') && st.run.modTier.tracer === 1, 'give.mod tracer 2: tier 2 (index 1): ' + st.run.modTier.tracer);
  await shellRun('credits 999');
  check(st.run.credits === 999, 'credits 999');
  const god = !!st.god;
  await shellRun('mode god');
  check(!!st.god === !god, 'mode god flips god');
  await shellRun('give.mod nosuchmod');
  check(last().cls === 'err', 'a bad argument is an error: ' + last().s);
  await shellRun('give.mod');
  check(last().cls === 'err' && /usage/.test(last().s), 'a missing argument shows the usage');
  check(SHELL.hist.includes('credits 999'), 'history keeps what you ran');
  const lettersWere = benchCount();
  await shellRun('give.letters abc 1');
  check(benchCount() === lettersWere + 3 && last().s === 'letters: ABC', 'give.letters abc: 3 letters, the 1 dropped: ' + last().s);

  // getting around
  await shellRun('show shop'); await settle('shop');
  check(st.mode === 'panel' && SHELL.log[SHELL.log.length - 1].cls !== 'err', 'show shop opens a market: ' + st.mode + ' ' + last().s);
  B.toMap(); await settle('back to the map');
  const hold = CONFIG.introHold;
  await shellRun('corp.intro basic');
  check(st.intro && /held/.test(last().s), 'corp.intro holds the intro up: ' + last().s);
  st.intro.skip = true; await settle('intro'); await sleep(300);
  check(!st.intro && CONFIG.introHold === hold, 'a tap lets it go, and the hold goes back: ' + CONFIG.introHold);

  // v14.86: as wide as the game, over its column
  const tr = SHELL.el.getBoundingClientRect();
  check(Math.abs(tr.left - L.ox) < 2 && Math.abs(tr.width - L.wc * L.cw) < 2, 'the shell sits over the game: ' + tr.left + '+' + tr.width + ' vs ' + L.ox + '+' + (L.wc * L.cw));

  // ~ closes it, and the clocks run again
  window.dispatchEvent(new KeyboardEvent('keydown', { key: '~', bubbles: true }));
  check(!st.shell && SHELL.el.hidden, '~ closes it');
` };
