// tools/checks/tests/terminal.js: THE TERMINAL (engine/terminal.js): reading a line, the list, what you know, and a few
// commands run on a real run.
module.exports = { name: 'terminal', body: `
  const key = (k, o = {}) => TERM.input.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, o)));
  const type = s => { TERM.input.value = s; TERM.input.setSelectionRange(s.length, s.length); TERM.input.dispatchEvent(new Event('input')); };
  const last = () => TERM.log[TERM.log.length - 1];

  // reading a line: with the dot, without it, split by a space
  for (const [line, name, args] of [['give.mod tracer 2', 'give.mod', 2], ['givemod tracer', 'give.mod', 1], ['give mod tracer', 'give.mod', 1], ['show ad', 'show.ad', 0], ['cr 50', 'credits', 1]]) {
    const p = termParse(line);
    check(p && p.cmd && p.cmd.name === name && p.args.length === args, line + ' reads as ' + name + ' with ' + args + ' args: ' + (p && p.cmd && p.cmd.name) + ' ' + (p && p.args.length));
  }

  // knowing nothing: no autocompletes, a message instead; help says so too
  st.devAccess = false;
  termOpen();
  check(st.term && !TERM.el.hidden, 'it opens');
  type('give');
  check(TERM.list.length === 1 && TERM.list[0].none === 'no commands known', 'nothing known: a message, no list: ' + JSON.stringify(TERM.list[0]));
  check(termHelp() === 'no commands known.', 'help: no commands known');
  await termRun('heal');
  check(last().cls === 'err', 'an unknown command is an error');

  // dev mode: everything
  st.devAccess = true;
  type('give.m');
  check(TERM.list[0] && TERM.list[0].v === 'give.mod', 'give.m lists give.mod first: ' + (TERM.list[0] && TERM.list[0].v));
  type('give mod');
  check(TERM.list[0] && TERM.list[0].v === 'give.mod', 'give mod lists give.mod too');
  type('give.mod trac');
  check(TERM.list[0] && TERM.list[0].arg && TERM.list[0].v === 'tracer', 'the mod argument lists tracer: ' + (TERM.list[0] && TERM.list[0].v));
  key('Tab');
  check(TERM.input.value === 'give.mod tracer ', 'Tab fills it in: ' + JSON.stringify(TERM.input.value));

  // the game takes no keys while it's open
  const muted = !!save.muted;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
  check(!!save.muted === muted, 'm does not mute while the terminal is open');

  // commands on a run
  B.startRun('TERMTEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
  check(!st.run.practice, 'a fresh run counts');
  type('hea'); key('Enter'); await sleep(50);
  check(st.run.integrity === st.run.maxInt && TERM.log.some(l => l.cls === 'cmd' && l.s === 'heal'), 'hea + Enter runs heal');
  check(st.run.practice, 'a cheat makes the run practice');
  await termRun('int 2');
  check(st.run.integrity === 2, 'int 2: ' + st.run.integrity);
  await termRun('give.mod tracer 2');
  check(st.run.mods.includes('tracer') && st.run.modTier.tracer === 1, 'give.mod tracer 2: tier 2 (index 1): ' + st.run.modTier.tracer);
  await termRun('credits 999');
  check(st.run.credits === 999, 'credits 999');
  const god = !!st.god;
  await termRun('mode god');
  check(!!st.god === !god, 'mode god flips god');
  await termRun('give.mod nosuchmod');
  check(last().cls === 'err', 'a bad argument is an error: ' + last().s);
  await termRun('give.mod');
  check(last().cls === 'err' && /usage/.test(last().s), 'a missing argument shows the usage');
  check(TERM.hist.includes('credits 999'), 'history keeps what you ran');

  // ~ closes it, and the clocks run again
  window.dispatchEvent(new KeyboardEvent('keydown', { key: '~', bubbles: true }));
  check(!st.term && TERM.el.hidden, '~ closes it');
` };
