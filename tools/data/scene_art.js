// NeoN+1 tools/data/scene_art.js: copies cutscene art from asXii saves into dist/data/scene_art.js (SCENE_ART).
//   node tools/data/scene_art.js        rewrites the file from the saves listed in SOURCES
// Each scene's art is the save's visible drawn layers (image tracing layers and hidden ones are skipped), by layer
// name, at their canvas position. Which layers a scene shows, in what order and color: data/quests.js QUEST_SCENES.
if (['-h', '--help'].includes(process.argv[2])) { console.log("usage: node tools/data/scene_art.js   (rewrites dist/data/scene_art.js from the asXii saves in SOURCES)"); process.exit(0); }
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SOURCES = { disc: 'ascii-editor/saves/n_cutscene_01_v02.asxii.json', popshead: 'ascii-editor/saves/n_cutscene_01_pops_head.asxii.json',
  prodigal: 'ascii-editor/saves/n_cutscene_02_prodigal.asxii.json', gate: 'ascii-editor/saves/n_cutscene_03_gate.asxii.json',
  ending: 'ascii-editor/saves/n_cutscene_04_ending.asxii.json' };
const VERSION = (fs.readFileSync(path.join(ROOT, 'dist/data/quests.js'), 'utf8').match(/NEON_FILES\.push\(\['data\/quests\.js', '([^']+)'\]\)/) || [, 'v0'])[1];

const out = [
  "// NeoN+1 data/scene_art.js: cutscene art, drawn in asXii (ascii-editor/saves). Made by tools/data/scene_art.js: edit the",
  "// save and run it again, don't edit here. SCENE_ART[scene]: { src, w, h, layers: { name: { x, y, rows } } }.",
  "'use strict';",
  `NEON_FILES.push(['data/scene_art.js', '${VERSION}']);`,
  '',
  'const SCENE_ART = {',
];
for (const [key, file] of Object.entries(SOURCES)) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  out.push(`  ${key}: { src: ${JSON.stringify(path.basename(file))}, w: ${d.width}, h: ${d.height}, layers: {`);
  for (const l of d.layers) {
    if (!l.visible || l.img || !l.rows || !l.rows.some(r => r.trim())) continue;
    out.push(`    ${JSON.stringify(l.name)}: { x: ${l.x}, y: ${l.y}, rows: [`);
    for (const r of l.rows) out.push(`      ${JSON.stringify(r)},`);
    out.push('    ] },');
  }
  out.push('  } },');
}
out.push('};', '');
fs.writeFileSync(path.join(ROOT, 'dist/data/scene_art.js'), out.join('\n'));
console.log('data/scene_art.js: ' + Object.keys(SOURCES).join(', '));
