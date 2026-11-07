// NeoN+1 tools/data/tutorial_file.js: writes and reads dist/data/tutorial.js, the training's lines (what POPS says).
// Used by the neon editor's TRAINING tab (save / reload) and by node:
//   node tools/data/tutorial_file.js        rewrites the file in its own format (a check that it round-trips)
// Needs tools/data/data_file_core.js loaded first in a page (node requires it).
(function (root) {
  const mod = typeof module !== 'undefined' ? module : null;
  const C = mod && mod.exports ? require('./data_file_core.js') : root.NEON_DATA_FILE;
  const HEAD = [
    '// NeoN+1 data/tutorial.js: everything POPS says in the training run, in the order he says it.',
    "// The neon editor's TRAINING tab edits this file (tools/data/tutorial_file.js writes it). Each line:",
    "//   id:    what engine/tutorial.js asks for (don't rename)",
    '//   part:  a heading for the lines from here on (the editor groups by it)',
    '//   text:  what he says. \\n\\n is a blank line. {name} is your hacker name.',
    '//   act:   the "do this" line: POPS shrinks to it while you play (after the text, if there is any). Keep it short.',
    '//   arrow: false: no arrow, on a popup that points at something (it still sits by it).',
    '//   timer: banter: ms before it moves on by itself (a tap skips it).',
    '//   of:    said in place of that popup\'s do-this line (a wrong tap, the boss beaten): one way to say it per line,',
    '//          picked at random.',
    "'use strict';",
  ];
  const q = s => JSON.stringify(String(s == null ? '' : s));
  // the file's text, from a list of lines and the build stamp ('v13.30')
  function text(copy, build) {
    const out = [...HEAD, C.stamp('data/tutorial.js', build), '', 'const TUT_COPY = ['];
    for (const l of copy) {
      if (l.part) out.push(`  // ${l.part}`);
      const f = [`id: ${q(l.id)}`];
      if (l.part) f.push(`part: ${q(l.part)}`);
      if (l.of) f.push(`of: ${q(l.of)}`);
      f.push(`text: ${q(l.text)}`);
      if (l.act) f.push(`act: ${q(l.act)}`);
      if (l.timer) f.push(`timer: ${Math.round(+l.timer) || 0}`);
      if (l.arrow === false) f.push('arrow: false');
      out.push(`  { ${f.join(', ')} },`);
    }
    out.push('];', '');
    return out.join('\n');
  }
  // the lines, from the file's text
  function parse(src) {
    return C.run(src, 'TUT_COPY');
  }
  // what looks wrong with a line (the editor shows these)
  function problems(l) {
    const p = [];
    if (!l.text && !l.act) p.push('says nothing');
    if (l.of && l.text.split('\n').some(s => s.trim().length > 24)) p.push('a line here is long for the small popup (keep each to about 24 characters)');
    if (l.act && l.act.length > 22) p.push('the "do this" line is long (' + l.act.length + ' characters): keep it to about 3 words');
    if (l.timer && (l.timer < 1000 || l.timer > 15000)) p.push('timer is ' + l.timer + 'ms (1000-15000 reads well)');
    return p;
  }
  const T = { text, parse, problems };
  C.expose(root, mod, 'NEON_TUT_FILE', T);
  // node tools/data/tutorial_file.js: rewrite the file in this format
  C.main(mod, "usage: node tools/data/tutorial_file.js   (rewrites dist/data/tutorial.js in its own format: a round-trip check)", ({ fs, path, dist }) => {
    const f = path.join(dist, 'data', 'tutorial.js'), src = fs.readFileSync(f, 'utf8');
    const build = C.buildOf(src, 'data/tutorial.js');
    const copy = parse(src), out = text(copy, build);
    fs.writeFileSync(f, out);
    console.log(`data/tutorial.js: ${copy.length} lines, ${src === out ? 'unchanged' : 'rewritten'}`);
  });
})(this);
