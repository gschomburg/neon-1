// Change asXii's version everywhere: VERSION in dist/app.js, the header in dist/index.html,
// the ?v= tags on the CSS / JS links (so a normal reload picks up the new files), and dist/version.json
// (what a running copy checks to offer "a new version is out · Refresh").
//   node ascii-editor/bump.js minor                       (0.09 -> 0.10)
//   node ascii-editor/bump.js 0.20                        (set it)
//   node ascii-editor/bump.js minor "Shape tool"          (optional: a short note shown with the update notice)
'use strict';
const fs = require('fs'), path = require('path');
const dist = path.join(__dirname, 'dist');
const appPath = path.join(dist, 'app.js'), htmlPath = path.join(dist, 'index.html');
let app = fs.readFileSync(appPath, 'utf8'), html = fs.readFileSync(htmlPath, 'utf8');

const m = app.match(/const VERSION = '(\d+)\.(\d+)';/);
if (!m) { console.log('VERSION not found in dist/app.js'); process.exit(1); }
let maj = +m[1], min = +m[2];
const arg = process.argv[2];
if (arg === 'minor') min++;
else if (arg === 'major') { maj++; min = 0; }
else if (/^v?\d+\.\d+$/.test(arg || '')) { const [a, b] = arg.replace(/^v/, '').split('.'); maj = +a; min = +b; }
else { console.log(`now v${m[1]}.${m[2]}. usage: node ascii-editor/bump.js minor | major | 0.20`); process.exit(1); }
const v = `${maj}.${String(min).padStart(2, '0')}`;

app = app.replace(/const VERSION = '[^']*';/, `const VERSION = '${v}';`);
html = html.replace(/(<span class="ver">)v[^<]*(<\/span>)/, `$1v${v}$2`)
  .replace(/(href="style\.css)(\?v=[^"]*)?"/, `$1?v=${v}"`)
  .replace(/(src="(?:app|cursors|fonts)\.js)(\?v=[^"]*)?"/g, `$1?v=${v}"`);
fs.writeFileSync(appPath, app);
fs.writeFileSync(htmlPath, html);
const note = (process.argv[3] || '').trim();
fs.writeFileSync(path.join(dist, 'version.json'), JSON.stringify({ version: v, note }) + '\n');
console.log(`asXii is now v${v}` + (note ? ` (${note})` : ''));
