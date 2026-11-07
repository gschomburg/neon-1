// deploy_editor.js: a copy of the neon editor for the site, in dist/tools/ (gitignored), so uploading dist/ to /neon/
// puts it at /neon/tools/ next to the game. tools/bump.js runs it after every bump; run it by hand after editor changes.
// It works from disk too (dist/tools/neon_editor.html: the game is the folder above). Keep the folder password-protected
// on the site.
//
// What it changes from tools/ (the files here stay as they are, for running from disk):
//   - only what the editor needs: neon_editor.html, editor/, the data file writers it loads (data/*_file.js),
//     music_view.html (the MUSIC tab's piano roll)
//   - '../dist/' becomes '../': on the site the game is the folder above
//   - every local script and stylesheet gets ?v=<build>: /neon/.htaccess caches .js for a year, so a new build
//     needs new URLs (the game's own index.html does the same: tools/bump.js)
//   - robots noindex in the pages, and an .htaccess: no caching for the editor's own files, noindex
// Not online: "edit in asXii" (the ART tab) opens ../ascii-editor/, which isn't on the site.
'use strict';
const fs = require('fs'), path = require('path');
if (['-h', '--help'].includes(process.argv[2])) { console.log('usage: node tools/deploy_editor.js   (writes dist/tools/: the editor, uploaded with dist/ to /neon/tools/)'); process.exit(0); }
const TOOLS = __dirname, ROOT = path.join(TOOLS, '..'), OUT = path.join(ROOT, 'dist', 'tools');
const build = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist', 'version.json'), 'utf8')).version.replace(/^v/, '');

const FILES = ['neon_editor.html', 'music_view.html',
  ...fs.readdirSync(path.join(TOOLS, 'editor')).map(f => 'editor/' + f),
  ...['data_file_core', 'palette_file', 'art_file', 'tutorial_file', 'economy_file', 'fx_file'].map(f => `data/${f}.js`)];

const page = t => t
  .replace(/(<(?:script|link)\b[^>]*?(?:src|href)=")(?!https?:|\/\/)([^"?#]+\.(?:js|css))"/g, (m, a, src) => `${a}${src.replace(/^\.\.\/dist\//, '../')}?v=${build}"`)
  .replace(/<meta name="viewport"[^>]*>/, m => m + '\n<meta name="robots" content="noindex">');
const code = t => t.replace(/\.\.\/dist\//g, '../');

fs.rmSync(OUT, { recursive: true, force: true });
let n = 0;
for (const f of FILES) {
  const src = path.join(TOOLS, f), dst = path.join(OUT, f);
  if (fs.statSync(src).isDirectory()) continue;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  let t = fs.readFileSync(src, 'utf8');
  t = f.endsWith('.html') ? page(t) : code(t);
  fs.writeFileSync(dst, t);
  n++;
}
fs.writeFileSync(path.join(OUT, '.htaccess'), [
  '# Made by tools/deploy_editor.js. The neon editor: a dev tool, not part of the game.',
  '# Its files carry ?v=<build> but change between builds without one: always ask the server.',
  '<IfModule mod_headers.c>',
  '  Header set Cache-Control "no-cache"',
  '  Header set X-Robots-Tag "noindex, nofollow"',
  '</IfModule>',
  ''].join('\n'));
console.log(`dist/tools/: the editor, ${n} files + .htaccess, build v${build}.`);
