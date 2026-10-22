// bump.js: change the build number everywhere at once.
//
//   node tools/bump.js v12.01      (or: node tools/bump.js minor / major)
//
// Updates VERSION in dist/engine/core.js, the stamp line at the top of every game file
// (NEON_FILES.push([..., 'v12.01'])), and the ?v= on every local script link in dist/index.html
// (so phones fetch the new files), palettes.js included (the palette editor writes the stamp it
// gets from the game, so reload the editor after a bump).
// A new major also needs a new save slot (STORE_KEY in core.js): this tool reminds you.

const fs = require('fs'), path = require('path');
const DIST = path.join(__dirname, '..', 'dist');
const core = path.join(DIST, 'engine', 'core.js');
const cur = fs.readFileSync(core, 'utf8').match(/const VERSION = 'v(\d+)\.(\d+)';/);
if (!cur) throw new Error('no VERSION in engine/core.js');
let [maj, min] = [+cur[1], +cur[2]];
const arg = process.argv[2];
if (arg === 'minor') min++;
else if (arg === 'major') { maj++; min = 0; }
else if (/^v?\d+\.\d+$/.test(arg || '')) [maj, min] = arg.replace('v', '').split('.').map(Number);
else { console.log(`now v${maj}.${String(min).padStart(2, '0')}. usage: node tools/bump.js v12.01 | minor | major`); process.exit(1); }
const v = `v${maj}.${String(min).padStart(2, '0')}`, num = v.slice(1);

let n = 0;
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.js')) {
  // the stamp: NEON_FILES.push(['engine/core.js', 'v12.00']) (palettes.js writes it a little differently)
  const t = fs.readFileSync(p, 'utf8'), u = t.replace(/(\.push\(\['[^']+', ')v[\d.]+('\]\);)/, `$1${v}$2`);
  if (u !== t) { fs.writeFileSync(p, u); n++; }
} } };
walk(DIST);
fs.writeFileSync(core, fs.readFileSync(core, 'utf8').replace(/const VERSION = 'v[\d.]+';/, `const VERSION = '${v}';`));
const html = path.join(DIST, 'index.html');
fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace(/(<script src="(?!https?:)[^"?]+)\?v=[\d.]+"/g, `$1?v=${num}"`));
console.log(`build ${v}: VERSION, ${n} file stamps, and the script links.`);
if (min === 0) console.log(`new major: give it a new save slot (STORE_KEY in engine/core.js, beta_runner.v${maj}.save) and copy the old one over, like v12 does.`);
