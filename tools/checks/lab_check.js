// tools/checks/lab_check.js: the lab pages (dist/lab/) load a few of the game's files (palettes, core, fx). This runs
// dist/lab/infiltr8.html headless and checks that it starts with no errors, builds floors for a run of seeds, plays
// some turns, and draws in every palette. A change to a shared game file that breaks the lab page shows up here.
// Run by tools/test.js; on its own: node tools/checks/lab_check.js
'use strict';
if (['-h', '--help'].includes(process.argv[2])) { console.log('usage: node tools/checks/lab_check.js   (runs dist/lab/infiltr8.html headless; prints "lab ok" or what failed)'); process.exit(0); }
const fs = require('fs'), path = require('path'), H = require('./harness.js');
const LAB = path.join(__dirname, '..', '..', 'dist', 'lab');

const driver = `<script>
(async () => {
  const out = { fails: [], log: [] };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 200 && !window.__demo; i++) await sleep(50);
  const D = window.__demo;
  if (!D) out.fails.push('the page never started');
  else try {
    // floors for a run of seeds, and some random turns on each
    for (let i = 0; i < 25; i++) {
      D.newRun('LAB' + i);
      for (let k = 0; k < 40 && !D.S.over; k++) { const d = [[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]][(i * 7 + k * 3) % 5]; D.act(d[0], d[1]); }
      if (D.S.floors.length !== 3) out.fails.push('LAB' + i + ': ' + D.S.floors.length + ' floors');
    }
    // every palette draws
    for (let p = 0; p < D.PALS.length; p++) { D.setPal(p); D.draw(); }
    out.log.push(D.PALS.length + ' palettes');
  } catch (e) { out.fails.push('threw: ' + (e.stack || e.message)); }
  out.errors = (window.__errs || []).slice(0, 10);
  const p = document.createElement('pre'); p.id = 'out'; p.textContent = JSON.stringify(out); document.body.appendChild(p);
})();
</script>`;

(async () => {
  let html = fs.readFileSync(path.join(LAB, 'infiltr8.html'), 'utf8');
  // (runPage writes the page to a temp folder: a <base> points its ../data/... links back at dist/lab/)
  const base = 'file:///' + LAB.replace(/\\/g, '/') + '/';
  html = html.replace('<head>', `<head><base href="${base}"><script>window.__errs = []; addEventListener('error', e => window.__errs.push(e.message + ' @' + e.lineno));</script>`)
    .replace('</body>', driver + '\n</body>');
  const r = await H.runPage(html, { ms: 60000, size: '390,844' });
  const bad = r.error ? [r.error] : r.fails.concat(r.errors);
  if (bad.length) { console.log('lab FAILED:\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('lab ok: infiltr8.html, 25 seeds, ' + r.log.join(', '));
})();
