// tools/checks/lab_check.js: the lab pages (dist/lab/) load a few of the game's files (palettes, core, fx). This runs
// dist/lab/infiltr8.html headless and checks that it starts with no errors, builds floors for a run of seeds, plays
// some turns, and draws in every palette. A change to a shared game file that breaks the lab page shows up here.
// It also builds a few seeds' floors in Node and checks Chrome built the same: a seed has to mean one floor anywhere
// (a random sort comparator once made them differ, so the Node stats and text dumps didn't match the browser).
// Run by tools/test.js; on its own: node tools/checks/lab_check.js
'use strict';
if (['-h', '--help'].includes(process.argv[2])) { console.log('usage: node tools/checks/lab_check.js   (runs dist/lab/infiltr8.html headless; prints "lab ok" or what failed)'); process.exit(0); }
const fs = require('fs'), path = require('path'), vm = require('vm'), H = require('./harness.js');
const LAB = path.join(__dirname, '..', '..', 'dist', 'lab');
// the seeds built in both Chrome and Node, and compared: their F2 and F3, as text
const SAME = ['SAME0', 'SAME1', 'MNHDB4', '9DM432', 'H3SDQ4'];
const floorsOf = D => SAME.map(sd => { D.newRun(sd); return D.S.floors.slice(1).map(fl => fl.t.map(row => row.join('')).join('\n')).join('\n--\n'); });

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
    // the dev panel's floor jump and show all
    D.newRun('LABDEV'); D.goFloor(2); if (D.S.fi !== 2 || D.S.x !== D.S.floors[2].up.x) out.fails.push('dev floor: to F3 at its stairs up');
    document.getElementById('dev-up').click(); if (D.S.fi !== 1 || D.S.x !== D.S.floors[1].down.x) out.fails.push('dev UP: to F2 at its stairs down');
    document.getElementById('dev-down').click(); if (D.S.fi !== 2) out.fails.push('dev DOWN: to F3');
    D.setReveal(true); if (!D.S.vis.flat().every(Boolean)) out.fails.push('dev show all: not every cell'); D.setReveal(false);
    // low cover: a desk hides you from a CAM only if you're right behind it; you see over it either way
    { const L = D.sight, fl = L.newFloor('T'); for (let x = 0; x < 12; x++) L.set(fl, x, 5, '.'); L.set(fl, 5, 5, 'd');
      if (L.losLow(fl, 0, 5, 6, 5)) out.fails.push('low cover: seen right behind a desk');
      if (!L.losLow(fl, 0, 5, 8, 5)) out.fails.push('low cover: hidden 3 cells behind a desk');
      if (!L.los(fl, 0, 5, 6, 5)) out.fails.push('low cover: you should see over a desk'); }
    // the same seeds built here, for the Node side to compare
    const SAME = ${JSON.stringify(SAME)};
    out.same = (${floorsOf.toString()})(D);
    // every palette draws
    for (let p = 0; p < D.PALS.length; p++) { D.setPal(p); D.draw(); }
    out.log.push(D.PALS.length + ' palettes');
  } catch (e) { out.fails.push('threw: ' + (e.stack || e.message)); }
  out.errors = (window.__errs || []).slice(0, 10);
  const p = document.createElement('pre'); p.id = 'out'; p.textContent = JSON.stringify(out); document.body.appendChild(p);
})();
</script>`;

// The page's script run in Node, with stand-ins for the screen, to build the same seeds.
function nodeFloors() {
  const s = fs.readFileSync(path.join(LAB, 'infiltr8.html'), 'utf8'), js = s.split('<script>').pop().split('</script>')[0];
  const noop = () => {}, g = new Proxy({}, { get: (t, k) => k in t ? t[k] : noop, set: (t, k, v) => (t[k] = v, true) });
  const el = () => ({ getContext: () => g, style: {}, addEventListener: noop, classList: { toggle: noop }, closest: () => null, options: [], set innerHTML(v) {}, hidden: true });
  Object.assign(global, {
    document: { getElementById: el, querySelector: el, fonts: null, documentElement: { style: { setProperty: noop } }, body: { style: {}, classList: { toggle: noop } }, createElement: el },
    window: global, innerWidth: 390, innerHeight: 844, addEventListener: noop, location: { search: '' },
    localStorage: { getItem: () => 'seen', setItem: noop }, requestAnimationFrame: noop, NEON_FILES: [],
  });
  const dist = path.join(LAB, '..');
  for (const p of ['data/palettes.js', 'engine/core.js', 'data/fx.js', 'engine/fx.js']) vm.runInThisContext(fs.readFileSync(path.join(dist, p), 'utf8'));
  vm.runInThisContext('var GAME = { get C() { return C; }, PALETTES, CHIPS, applyPalette, mixHex, FX }; window.hkInk = () => C.text;');
  vm.runInThisContext(js);
  return floorsOf(global.__demo);
}

(async () => {
  let html = fs.readFileSync(path.join(LAB, 'infiltr8.html'), 'utf8');
  // (runPage writes the page to a temp folder: a <base> points its ../data/... links back at dist/lab/)
  const base = 'file:///' + LAB.replace(/\\/g, '/') + '/';
  html = html.replace('<head>', `<head><base href="${base}"><script>window.__errs = []; addEventListener('error', e => window.__errs.push(e.message + ' @' + e.lineno));</script>`)
    .replace('</body>', driver + '\n</body>');
  const r = await H.runPage(html, { ms: 60000, size: '390,844' });
  const bad = r.error ? [r.error] : r.fails.concat(r.errors);
  if (!r.error) { const mine = nodeFloors(); SAME.forEach((sd, i) => { if (mine[i] !== (r.same || [])[i]) bad.push('seed ' + sd + ': Chrome and Node built different floors'); }); }
  if (bad.length) { console.log('lab FAILED:\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('lab ok: infiltr8.html, 25 seeds, ' + r.log.join(', '));
})();
