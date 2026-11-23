// test.js: every automatic check in one go. Exits 1 if anything fails.
//   1. the data files round-trip through their writers (tools/data/*_file.js)
//   2. tools/checks/check.js: layers, maps and tables match tools/checks/golden.json
//   3. tools/checks/tests/*.js: headless pages that play a bit and check things (tools/checks/harness.js)
//   4. tools/checks/playtest.js: every corp played, compared to tools/checks/golden-play.json (slow: skip with --quick)
// Usage: node tools/test.js [--quick] [--log] [name ...]   (names: only those tests/*.js files; --log prints what they say())
// A name that matches no test fails, and so does a test that passes nothing.
'use strict';
if (['-h', '--help'].includes(process.argv[2])) { console.log('usage: node tools/test.js [--quick] [--log] [test names]   (data round-trips, check.js, tools/checks/tests/*.js, playtest.js)'); process.exit(0); }
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process'), H = require('./checks/harness.js');
const args = process.argv.slice(2), quick = args.includes('--quick'), showLog = args.includes('--log'), only = args.filter(a => !a.startsWith('--'));
let failed = 0;
const ok = (good, line) => { console.log((good ? 'ok    ' : 'FAIL  ') + line); if (!good) failed++; };
const node = (file, extra = []) => {
  try { return { ok: true, out: execFileSync(process.execPath, [path.join(__dirname, file), ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim() }; }
  catch (e) { return { ok: false, out: String((e.stdout || '') + (e.stderr || '')).trim() }; }
};
const last = s => s.split('\n').filter(Boolean).pop() || '';

(async () => {
  if (!only.length) {
    // 1. round-trips: each writer reads its file and writes it again (--check: not to disk); a change means the file and
    // the writer disagree
    for (const f of ['economy_file.js', 'fx_file.js', 'tutorial_file.js', 'art_file.js', 'palette_file.js'].map(f => 'data/' + f)) {
      const r = node(f, ['--check']);
      ok(r.ok && !/rewritten/.test(r.out), `${f}: ${last(r.out)}`);
    }
    // the generators are up to date (their --check writes nothing), and the music view matches the game's music
    for (const f of ['data/scene_art.js', 'data/quest_dialog.js']) { const r = node(f, ['--check']); ok(r.ok, `${f}: ${last(r.out)}`); }
    { const r = node('checks/music_view_check.js'); ok(r.ok && /all match/.test(r.out), 'music_view_check.js: ' + last(r.out)); }
    // 2. the golden fingerprint
    const c = node('checks/check.js');
    ok(c.ok, 'check.js: ' + last(c.out));
    if (!c.ok) console.log(c.out.split('\n').slice(0, 12).map(l => '        ' + l).join('\n'));
  }
  // 3. the test pages
  const dir = path.join(__dirname, 'checks', 'tests');
  const tests = fs.readdirSync(dir).filter(f => f.endsWith('.js')).map(f => require(path.join(dir, f))).filter(t => !only.length || only.includes(t.name));
  for (const n of only) if (!tests.some(t => t.name === n)) ok(false, `tests/${n}: no test by that name`);   // (a typo ran nothing and said all good)
  // a pool of POOL pages at a time (all ~55 at once loaded the machine: slow, and the likely cause of flaky runs. Audit 2026-11-23)
  const POOL = 6, results = [];
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(POOL, tests.length) }, async () => {
    while (next < tests.length) { const i = next++, t = tests[i]; results[i] = await H.runPage(H.testPage(H.GAME, H.wrapTest(t.body), { key: 'test-' + t.name }), { ms: 240000, query: t.query }); }
  }));
  tests.forEach((t, i) => {
    const r = results[i];
    if (r.error) return ok(false, `tests/${t.name}: ${r.error}`);
    const errs = (r.errors || []).filter(e => !/Script error/.test(e));
    ok(!r.fails.length && !errs.length && r.passes > 0, `tests/${t.name}: ${r.passes} passed${r.fails.length ? `, ${r.fails.length} failed` : ''}${errs.length ? ', page errors' : ''}`);
    for (const f of r.fails) console.log('        - ' + f);
    for (const e of errs) console.log('        ! ' + e);
    if (showLog) for (const l of r.log || []) console.log(l);
  });
  // 4. the playtest
  if (!quick && !only.length) {
    const p = node('checks/playtest.js');
    ok(p.ok, 'playtest.js: ' + (p.out.match(/corps: .*/) || [last(p.out)])[0]);
  }
  console.log(failed ? `\n${failed} failed.` : '\nall good.');
  process.exitCode = failed ? 1 : 0;
})();
