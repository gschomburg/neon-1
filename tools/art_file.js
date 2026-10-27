// NeoN+1 tools/art_file.js: writes the art files in dist/data/art/ the same way every time.
// Used by tools/neon_editor.html (the ART tab saves with it) and by node scripts (require it).
//   glyphs.js    ART_GLYPHS (node glyphs: name, codex lore, art) and ART_SPECIAL (the special node glyphs)
//   logos.js     ART_LOGOS: every logo (players', corps', and later rival hackers'), by id
//   worldmap.js  ART_MAP: the boot intro's world map
(function (root) {
  'use strict';
  // Size limits. Logos all sit in one fixed box (LOGO_W x LOGO_H), centered, wherever they show.
  const KINDS = {
    glyphs:  { label: 'node glyphs',         file: 'glyphs.js',   w: 5,  h: 3,  fixedH: true, note: 'drawn on the nodes, each line centered by itself; up to 5 x 3' },
    special: { label: 'special node glyphs', file: 'glyphs.js',   w: 5,  h: 3,  fixedH: true, note: 'the prompt, loaded nodes, bone piles, the ??? mask' },
    logos:   { label: 'logos',               file: 'logos.js',    w: 24, h: 7,  note: 'every logo sits in the same 24 x 7 box, centered; corp logos are also the corp\'s intro art' },
    map:     { label: 'intro world map',     file: 'worldmap.js', w: 34, h: 12, fixedH: true, single: true, note: 'the boot intro map (the login screen\'s box); keep it 34 x 12. its 0 o x [] blink, and your spot is picked inside the land' },
  };
  const LOGO_KINDS = ['player', 'corp', 'hacker'];
  const q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  const key = k => /^[a-z_$][\w$]*$/i.test(k) ? k : q(k);
  const short = rows => '[' + rows.map(q).join(', ') + ']';
  const tall = (rows, pad) => rows.length ? '[\n' + rows.map(r => pad + '  ' + q(r) + ',').join('\n') + '\n' + pad + ']' : '[]';
  const head = (file, what, build, more = []) => [
    `// NeoN+1 data/art/${file}: ${what}`,
    '// The neon editor writes this file (tools/neon_editor.html, ART), and sends art to asXii and back.',
    "// Hand edits are fine too: inside the quotes a backslash is \\\\ and a quote \\'.",
    ...more,
    "'use strict';",
    `NEON_FILES.push(['data/art/${file}', '${build || 'v0'}']);`,
    '',
  ];

  // glyphs: [{ name, lore, art }], special: { key: { name, lore, art } }
  function glyphsText(glyphs, special, build) {
    const out = head('glyphs.js', 'node glyphs: their art, names and codex lore.', build,
      ['// A glyph is up to 5 x 3; each line is centered on the node by itself. Lore lines stay under 26 characters.',
       '// Their order matters: the codex keys are g0, g1... and the game picks from the whole list.']);
    out.push('const ART_GLYPHS = [');
    for (const g of glyphs) out.push(`  { name: ${q(g.name)}, lore: ${short(g.lore || [])}, art: ${short(g.art)} },`);
    out.push('];');
    out.push('// The special node glyphs (code uses them by key).');
    out.push('const ART_SPECIAL = {');
    for (const [k, g] of Object.entries(special)) out.push(`  ${key(k)}: { name: ${q(g.name)}, lore: ${short(g.lore || [])}, art: ${short(g.art)} },`);
    out.push('};');
    return out.join('\n') + '\n';
  }

  // logos: [{ id, name, mark, kind, corp?, hacker?, art }]
  function logosText(logos, build) {
    const out = head('logos.js', 'every logo, by id: players\', corps\' (also their intro art) and rival hackers\'.', build,
      ['// Each: id (saves keep it, so the order is only the order the picker steps through), name, mark (3 characters,',
       '// for the HUD, cursors and buttons), kind: player (everyone has it), corp (unlocked by beating that corp; it is',
       '// also the corp\'s intro art) or hacker (unlocked by beating that hacker), and the art: up to 24 x 7, shown in a',
       '// 24 x 7 box, centered.']);
    out.push('const ART_LOGOS = [');
    for (const l of logos) {
      const link = l.kind === 'corp' ? `, corp: ${q(l.corp)}` : l.kind === 'hacker' ? `, hacker: ${q(l.hacker)}` : '';
      out.push(`  { id: ${q(l.id)}, name: ${q(l.name)}, mark: ${q(l.mark)}, kind: ${q(l.kind)}${link}, art: ${tall(l.art, '  ')} },`);
    }
    out.push('];');
    return out.join('\n') + '\n';
  }

  function mapText(map, build) {
    const out = head('worldmap.js', 'the boot intro\'s world map.', build,
      ['// 34 x 12, in the login screen box. Its 0 o x [] blink; your spot (@) is picked inside the land (engine/intro.js).']);
    out.push('const ART_MAP = ' + tall(map, '') + ';');
    return out.join('\n') + '\n';
  }

  // { 'glyphs.js': text, ... } for the whole art set { glyphs, special, logos, map }
  const files = (a, build) => ({ 'glyphs.js': glyphsText(a.glyphs, a.special, build), 'logos.js': logosText(a.logos, build), 'worldmap.js': mapText(a.map, build) });

  // Problems with one piece of art for its kind: [] when it fits.
  function artProblems(kind, rows) {
    const k = KINDS[kind], p = [];
    if (!k) return ['unknown kind'];
    const w = Math.max(0, ...rows.map(r => [...r].length));
    if (w > k.w) p.push(`${w} wide (max ${k.w})`);
    if (rows.length > k.h) p.push(`${rows.length} tall (max ${k.h})`);
    if (rows.some(r => /[\t\r\n]/.test(r))) p.push('tabs or line breaks inside a line');
    return p;
  }
  // Problems with a logo's details (ids unique, a 3-character mark, a corp / hacker link).
  function logoProblems(l, all) {
    const p = [];
    if (!/^[a-z0-9_]+$/.test(l.id || '')) p.push('id: lowercase letters, digits and _ only');
    else if (all.filter(o => o.id === l.id).length > 1) p.push('id is used twice');
    if ([...(l.mark || '')].length !== 3) p.push('mark: exactly 3 characters');
    if (!LOGO_KINDS.includes(l.kind)) p.push('kind: player, corp or hacker');
    if (l.kind === 'corp' && !l.corp) p.push('which corp?');
    if (l.kind === 'hacker' && !l.hacker) p.push('which hacker?');
    if (!l.name) p.push('needs a name');
    return p;
  }

  // Text from asXii / a paste -> rows for a kind: trailing spaces off; fixed-height kinds keep their
  // height (padded / cut), the rest lose blank rows at the top and bottom.
  function rowsFromText(kind, text) {
    let rows = String(text).replace(/\r/g, '').split('\n').map(r => r.replace(/\s+$/, ''));
    const k = KINDS[kind];
    if (k && k.fixedH) { while (rows.length < k.h) rows.push(''); rows = rows.slice(0, k.h); }
    else { while (rows.length && !rows[0].trim()) rows.shift(); while (rows.length && !rows[rows.length - 1].trim()) rows.pop(); }
    return rows;
  }

  // Read the three files' text back into one art set (eval: they're our own files).
  function parse(texts) {
    const run = (t, names) => new Function('NEON_FILES', t + '\n;return {' + names.join(',') + '};')([]);
    const g = run(texts['glyphs.js'], ['ART_GLYPHS', 'ART_SPECIAL']), l = run(texts['logos.js'], ['ART_LOGOS']), m = run(texts['worldmap.js'], ['ART_MAP']);
    return { glyphs: g.ART_GLYPHS, special: g.ART_SPECIAL, logos: l.ART_LOGOS, map: m.ART_MAP };
  }

  const api = { KINDS, LOGO_KINDS, glyphsText, logosText, mapText, files, artProblems, logoProblems, rowsFromText, parse };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NEON_ART_FILE = api;
})(this);
