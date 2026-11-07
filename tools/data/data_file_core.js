// NeoN+1 tools/data/data_file_core.js: the parts every data-file writer shares (tools/data/economy_file.js, fx_file.js,
// tutorial_file.js, art_file.js, palette_file.js). Loads first: in the browser as a plain <script src> (it sets
// window.NEON_DATA_FILE; tools/neon_editor.html puts it before the writers), in node through require.
//   node tools/data/data_file_core.js --help    (nothing to run on its own: the writers each have a round-trip main)
//
// The stamp line written here must stay in step with tools/bump.js, which rewrites it in every game file.
(function (root) {
  'use strict';
  // 'it\'s' with backslashes doubled: how fx.js, the art files and palettes.js quote strings
  const quote = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  // NEON_FILES.push(['data/economy.js', 'v14.44']); (the game lists its loaded files and their builds with it)
  const stamp = (file, build) => `NEON_FILES.push(['${file}', '${build || 'v0'}']);`;
  // the build a file's stamp line says, or undefined
  const buildOf = (src, file) => (String(src).match(new RegExp("NEON_FILES\\.push\\(\\['" + file.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + "', '([^']+)'\\]\\)")) || [])[1];
  // run a data file's text and return what `expr` says (eval: they're our own files); NEON_FILES is a throwaway list
  const run = (src, expr) => new Function('NEON_FILES', src + '\n;return ' + expr + ';')([]);
  // browser global or module.exports, whichever this is loaded as
  const expose = (rootObj, mod, name, api) => { if (mod && mod.exports) mod.exports = api; else rootObj[name] = api; return api; };
  // node tools/data/x_file.js: a writer's round-trip main, only when that file is run (not required or loaded in a page).
  // fn gets { fs, path, dist } (dist = the repo's dist/ folder).
  const main = (mod, usage, fn) => {
    if (typeof require === 'undefined' || !mod || require.main !== mod) return;
    if (['-h', '--help'].includes(process.argv[2])) { console.log(usage); process.exit(0); }
    const fs = require('fs'), path = require('path');
    fn({ fs, path, dist: path.join(__dirname, '..', '..', 'dist') });
  };
  const api = { quote, stamp, buildOf, run, expose, main };
  expose(root, typeof module !== 'undefined' ? module : null, 'NEON_DATA_FILE', api);
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) console.log('usage: require it from a tools/data/*_file.js writer (node tools/data/economy_file.js etc. are the round-trip checks)');
})(this);
