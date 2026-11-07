// NeoN+1 tools/data/palette_file.js: writes and reads dist/data/palettes.js (NEON_PALETTES: the rarity chips, the
// palettes, the player color styles), for the neon editor's PALETTE tab.
//   node tools/data/palette_file.js        rewrites the file in its own format (a check that it round-trips)
// Needs tools/data/data_file_core.js loaded first in a page (node requires it).
//
// palettes.js stamps its build its own way ((window.NEON_FILES = ...).push), because the game loads it before
// core.js: tools/bump.js's stamp pattern matches both forms.
(function (root) {
  'use strict';
  const mod = typeof module !== 'undefined' ? module : null;
  const C = mod && mod.exports ? require('./data_file_core.js') : root.NEON_DATA_FILE;
  // the color slots, in the order they're written, with what each is for (the PALETTE tab labels them with these)
  const BASE = [
    ['bg', 'background'], ['dim', 'faint text, dividers'], ['mid', 'secondary text, labels'], ['text', 'normal text'],
    ['bright', 'headings, emphasis'], ['accent', 'buttons, the logo, highlights'], ['danger', 'ICE, damage, warnings'],
    ['dangerDim', 'locked nodes, dark red frames'], ['money', 'credits, rewards'], ['rep', 'REP, feats, unlocks (THE BOARD)'],
  ];
  const RAR = [['scrap', 'scrap: the basics'], ['common', 'common'], ['rare', 'rare'], ['epic', 'epic'], ['legendary', 'legendary: corp mods, top upgrades'], ['exotic', 'exotic']];

  const HEADER = `// NeoN+1 palettes. The game loads this file before its own scripts (so does the palette editor).
// Edit with the neon editor's PALETTE tab (tools/neon_editor.html), or by hand: one palette per line, colors as '#rrggbb'.
//
// Slots (what each color is for):
//   bg         background               accent     buttons, the logo, highlights (the "main" color)
//   dim        faint text, dividers     danger     ICE, damage, warnings
//   mid        secondary text, labels   dangerDim  locked nodes, dark red frames
//   text       normal text              money      credits, rewards, gold glows
//   bright     headings, emphasis       rep        REP, feats, unlocks (THE BOARD)
// hidden: locked (not offered in SETTINGS; corps will unlock theirs when beaten). font: { weight, bold } (OMNI only). note: a description.
// Rarity colors aren't in the palettes: every mod and item shows its rarity as a chip (chips, below),
// the same in every palette.
`;
  const q = C.quote;
  function paletteLine(key, p) {
    const parts = [`name: ${q(p.name)}`];
    if (p.hidden) parts.push('hidden: true');
    for (const [s] of BASE) parts.push(`${s}: ${q(p[s])}`);
    if (p.font && (p.font.weight || p.font.bold)) parts.push(`font: { ${Object.entries(p.font).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}: ${typeof v === 'string' ? q(v) : v}`).join(', ')} }`);
    if (p.note) parts.push(`note: ${q(p.note)}`);
    return `    ${(key + ':').padEnd(15)} { ${parts.join(', ')} },`;
  }
  // the file's text, from NEON_PALETTES ({ chips, palettes, styles }) and the build stamp
  function text(data, build) {
    const keys = Object.keys(data.palettes);
    const starters = keys.filter(k => !data.palettes[k].hidden), locked = keys.filter(k => data.palettes[k].hidden);
    const chips = RAR.map(([r]) => `    ${(r + ':').padEnd(10)} { fg: ${q(data.chips[r].fg)}, bg: ${q(data.chips[r].bg)} },`);
    const styles = data.styles.map(s => `    { name: ${(q(s.name) + ',').padEnd(9)} fg: ${q(s.fg)}, bg: ${q(s.bg)} },`);
    return HEADER + `(window.NEON_FILES = window.NEON_FILES || []).push(['data/palettes.js', '${build}']);   // the build it's from (see index.html)\n` +
      'window.NEON_PALETTES = {\n' +
      '  // Rarity chips: a text color on its own background, for each rarity (bg = the rarity\'s key color).\n' +
      '  chips: {\n' + chips.join('\n') + '\n  },\n  palettes: {\n' +
      '    // starters: offered in SETTINGS from the start (the first one is the default for new players)\n' +
      starters.map(k => paletteLine(k, data.palettes[k])).join('\n') + '\n' +
      '    // locked: unlocked by beating the corp (for now: hidden from SETTINGS)\n' +
      locked.map(k => paletteLine(k, data.palettes[k])).join('\n') + '\n  },\n' +
      '  // Player color styles: the colors of your name and logo (PROFILE > COLOR, multiplayer). Saved\n' +
      '  // profiles store a style by its position here, so add new ones at the end.\n' +
      '  styles: [\n' + styles.join('\n') + '\n  ],\n};\n';
  }
  // keep the file's order the way it's written: starters, then locked (changes data.palettes in place)
  function reorder(data) {
    const keys = Object.keys(data.palettes), out = {};
    for (const k of keys.filter(k => !data.palettes[k].hidden)) out[k] = data.palettes[k];
    for (const k of keys.filter(k => data.palettes[k].hidden)) out[k] = data.palettes[k];
    data.palettes = out;
    return data;
  }
  // NEON_PALETTES, from the file's text (it sets window.NEON_PALETTES: run it against a stand-in window)
  const parse = text => { const w = {}; new Function('window', text)(w); if (!w.NEON_PALETTES || !w.NEON_PALETTES.palettes) throw new Error('no palettes in that file'); return w.NEON_PALETTES; };
  // the build the file's stamp line says, or undefined
  const buildOf = src => (String(src).match(/\.push\(\['data\/palettes\.js', '([^']+)'\]\)/) || [])[1];

  const api = { BASE, RAR, text, reorder, parse, buildOf };
  C.expose(root, mod, 'NEON_PALETTE_FILE', api);
  C.main(mod, 'usage: node tools/data/palette_file.js   (rewrites dist/data/palettes.js in its own format: a round-trip check)', ({ fs, path, dist }) => {
    const f = path.join(dist, 'data', 'palettes.js'), src = fs.readFileSync(f, 'utf8');
    const data = parse(src), out = text(reorder(JSON.parse(JSON.stringify(data))), buildOf(src) || 'v0');
    if (JSON.stringify(parse(out)) !== JSON.stringify(reorder(data))) { console.log('round trip changed a value: not written'); process.exit(1); }
    fs.writeFileSync(f, out);
    console.log(`data/palettes.js: ${Object.keys(data.palettes).length} palettes, ${src === out ? 'unchanged' : 'rewritten'}`);
  });
})(this);
