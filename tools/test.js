// test.js: every automatic check in one go. Exits 1 if anything fails.
//   1. the data files round-trip through their writers (tools/*_file.js)
//   2. tools/check.js: layers, maps and tables match tools/golden.json
//   3. tools/tests/*.js: headless pages that play a bit and check things (tools/harness.js)
//   4. tools/playtest.js: every corp played, compared to tools/golden-play.json (slow: skip with --quick)
// Usage: node tools/test.js [--quick] [name ...]   (names: only those tests/*.js files)
'use strict';
if (['-h', '--help'].includes(process.argv[2])) { console.log('usage: node tools/test.js [--quick] [test names]   (data round-trips, check.js, tools/tests/*.js, playtest.js)'); process.exit(0); }
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process'), H = require('./harness.js');
const args = process.argv.slice(2), quick = args.includes('--quick'), only = args.filter(a => !a.startsWith('--'));
let failed = 0;
const ok = (good, line) => { console.log((good ? 'ok    ' : 'FAIL  ') + line); if (!good) failed++; };
const node = (file, extra = []) => {
  try { return { ok: true, out: execFileSync(process.execPath, [path.join(__dirname, file), ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim() }; }
  catch (e) { return { ok: false, out: String((e.stdout || '') + (e.stderr || '')).trim() }; }
};
const last = s => s.split('\n').filter(Boolean).pop() || '';

(async () => {
  if (!only.length) {
    // 1. round-trips: each writer rewrites its file; a change means the file and the writer disagree
    for (const f of ['economy_file.js', 'fx_file.js', 'tutorial_file.js', 'art_file.js']) {
      const r = node(f);
      ok(r.ok && !/rewritten/.test(r.out), `${f}: ${last(r.out)}`);
    }
    // 2. the golden fingerprint
    const c = node('check.js');
    ok(c.ok, 'check.js: ' + last(c.out));
    if (!c.ok) console.log(c.out.split('\n').slice(0, 12).map(l => '        ' + l).join('\n'));
  }
  // 3. the test pages
  const dir = path.join(__dirname, 'tests');
  const tests = fs.readdirSync(dir).filter(f => f.endsWith('.js')).map(f => require(path.join(dir, f))).filter(t => !only.length || only.includes(t.name));
  const results = await Promise.all(tests.map(t => H.runPage(H.testPage(H.GAME, H.wrapTest(t.body), { key: 'test-' + t.name }), { ms: 240000 })));
  tests.forEach((t, i) => {
    const r = results[i];
    if (r.error) return ok(false, `tests/${t.name}: ${r.error}`);
    const errs = (r.errors || []).filter(e => !/Script error/.test(e));
    ok(!r.fails.length && !errs.length, `tests/${t.name}: ${r.passes} passed${r.fails.length ? `, ${r.fails.length} failed` : ''}${errs.length ? ', page errors' : ''}`);
    for (const f of r.fails) console.log('        - ' + f);
    for (const e of errs) console.log('        ! ' + e);
  });
  // 4. the playtest
  if (!quick && !only.length) {
    const p = node('playtest.js');
    ok(p.ok, 'playtest.js: ' + (p.out.match(/corps: .*/) || [last(p.out)])[0]);
  }
  console.log(failed ? `\n${failed} failed.` : '\nall good.');
  process.exitCode = failed ? 1 : 0;
})();
