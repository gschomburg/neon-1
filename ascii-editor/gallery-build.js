// Gallery: the art lives in dist/gallery/ as plain .txt files, one piece each, and dist/gallery/index.json lists them
// (file, name, artist, source). This script keeps the two in step and makes dist/gallery.js, the bundle the app
// uses when it is opened from file:// (Chrome won't let a file:// page read the .txt files; served over http it does).
//   node ascii-editor/gallery-build.js
// - a new .txt in the folder is added to the end of index.json, named after its file (edit the name / artist there)
// - an index.json entry whose file is gone is dropped
// - the order in index.json is the order in the gallery
// bump.js runs this too, so a version bump never ships a stale bundle.
'use strict';
const fs = require('fs'), path = require('path');
function buildGallery(quiet) {
  const dist = path.join(__dirname, 'dist'), dir = path.join(dist, 'gallery'), idxPath = path.join(dir, 'index.json');
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.txt'));
  let index = [];
  try { index = JSON.parse(fs.readFileSync(idxPath, 'utf8')); } catch (e) { if (fs.existsSync(idxPath)) throw new Error('gallery/index.json: ' + e.message); }
  const gone = index.filter(e => !files.includes(e.file)).map(e => e.file);
  index = index.filter(e => files.includes(e.file));
  const added = files.filter(f => !index.some(e => e.file === f)).sort();
  for (const f of added) index.push({ file: f, name: f.replace(/\.txt$/i, '').replace(/[-_]+/g, ' ').replace(/(^|\s)\S/g, s => s.toUpperCase()), by: '', subject: '', url: '' });
  fs.writeFileSync(idxPath, '[\n' + index.map(e => '  ' + JSON.stringify(e)).join(',\n') + '\n]\n');
  const items = index.map(e => ({ ...e, art: tidyArt(fs.readFileSync(path.join(dir, e.file), 'utf8')) }));
  fs.writeFileSync(path.join(dist, 'gallery.js'),
    '// asXii gallery bundle, made by ascii-editor/gallery-build.js from dist/gallery/ (edit the .txt files and index.json there, not this).\n' +
    '// Most of the art is from the ASCII Art Dictionary (https://www.ascii-art.de/ascii/); it belongs to its artists.\n' +
    'window.ASXII_GALLERY = [\n' + items.map(o => '  ' + JSON.stringify(o)).join(',\n') + '\n];\n');
  if (!quiet || added.length || gone.length) console.log(`gallery: ${items.length} pieces` + (added.length ? `, added ${added.join(', ')}` : '') + (gone.length ? `, dropped ${gone.join(', ')}` : ''));
  return items.length;
}
// the same tidying the app does on the .txt files: no CRs, tabs as 4 spaces, no trailing spaces or blank lines at the end
function tidyArt(t) {
  const rows = t.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n').map(r => r.replace(/\s+$/, ''));
  while (rows.length && !rows[rows.length - 1]) rows.pop();
  return rows.join('\n');
}
module.exports = buildGallery;
if (require.main === module) buildGallery();
