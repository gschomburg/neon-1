// NeoN+1 tools/fx_file.js: writes and reads dist/data/fx.js (the effects' settings, FX_LOOKS), and says what each
// setting is (LOOKS: label, kind, note; and where the effect shows, for the neon editor's FX tab).
//   node tools/fx_file.js        rewrites the file in its own format (a check that it round-trips)
//
// Kinds: ms = milliseconds; share = 0-1 (a chance, or a part of something); num = a plain number; cells = a distance in
// cells; pair = two numbers; col = a palette name (accent, danger, money...), '#hex', or 'ink:<hacker>'; chars = a few
// characters; sound = a Sound.* name; set = one of the shared character sets (SETS), not edited per effect.
(function (root) {
  // The shared character sets: written once at the top of the file, used by name in the looks.
  const SETS = [
    { name: 'FX_GLITCH', label: 'glitch characters', note: 'the glitch characters (one set everywhere: glitch, cue, garble)' },
    { name: 'FX_NOISE', label: 'noise characters', note: 'the softer noise a burst flashes to (mold, d0g\'s tics)' },
  ];
  // Where an effect shows, for the tab's "show" buttons: a cutscene frame, d0g's card / death screen, the mold glitch.
  const DISC_CITY = { label: 'DISC: the laundromat', scene: 'disc', frame: 1 }, DISC_POPS = { label: 'DISC: POPS', scene: 'disc', frame: 3 };
  const DISC_HEAD = { label: 'DISC: POPS up close', scene: 'disc', frame: 6 }, DISC_SLOT = { label: 'DISC: the slot', scene: 'disc', frame: 5 };
  const DISC_D0G = { label: 'DISC: d0g\'s logo', scene: 'disc', frame: 10 }, PROD_ROOM = { label: 'PRODIGAL: the room', scene: 'prodigal', frame: 4 };
  const PROD_EYES = { label: 'PRODIGAL: the eyes', scene: 'prodigal', frame: 9 }, GATE = { label: 'GATE', scene: 'gate', frame: 1 };
  const CODEX = { label: 'the codex', codex: true }, MOLDWIPE = { label: 'a transition (at the G0D tab\'s mold level)', moldwipe: true };
  const CARD = { label: 'd0g\'s rival card', card: 'd0g' }, DEATH = { label: 'd0g\'s death screen', death: 'd0g' }, MOLD = { label: 'mold glitch (G0D)', g0d: 'glitch' };
  const f = (k, kind, label, extra) => Object.assign({ k, kind, label }, extra || {});
  const LOOKS = [
    { key: 'reveal', title: 'DRAWING IN', show: [DISC_CITY, PROD_ROOM],
      note: 'each mark lands at its own moment: `pos` of it from where it is (top or bottom first), `jitter` random. It flashes `flashCol` for the first `flash` of the draw-in. boxMs: a logo\'s color block flickers in.',
      fields: [f('pos', 'share', 'by position'), f('jitter', 'share', 'random'), f('flash', 'share', 'flash for'), f('flashCol', 'col', 'flash color'), f('boxMs', 'ms', 'logo block flicker')] },
    { key: 'flicker', title: 'FLICKER (drawing in)', show: [DISC_CITY, PROD_ROOM],
      note: 'for the first `window` of a mark\'s draw-in, it blinks (share of the time off, every ms).',
      fields: [f('window', 'share', 'for'), f('ms', 'ms', 'every'), f('share', 'share', 'off')] },
    { key: 'glitch', title: 'GLITCH (drawing in)', show: [DISC_D0G, GATE],
      note: 'for the first `window`, a mark is a random glitch character in col, new every ms.',
      fields: [f('window', 'share', 'for'), f('ms', 'ms', 'every'), f('set', 'set', 'characters', { set: 'FX_GLITCH' }), f('col', 'col', 'color'), f('sound', 'sound', 'sound'), f('vol', 'share', 'volume')] },
    { key: 'cue', title: 'CUE', show: [DISC_CITY],
      note: 'marks stay dark until a word types in, then glitch on for `glitchMs` (hidden `hide` of the time, swapped `swap` of it), then flicker now and then (`share` of the `every` windows, one frame in 3 of `flickMs`).',
      fields: [f('col', 'col', 'color'), f('glitchMs', 'ms', 'glitching on'), f('hideMs', 'ms', 'hide every'), f('hide', 'share', 'hidden'), f('swapMs', 'ms', 'swap every'), f('swap', 'share', 'swapped'),
        f('set', 'set', 'characters', { set: 'FX_GLITCH' }), f('every', 'ms', 'then flicker every'), f('share', 'share', 'flicker chance'), f('flickMs', 'ms', 'flicker frame'), f('sound', 'sound', 'sound')] },
    { key: 'lights', title: 'LIGHTS', show: [DISC_CITY, DISC_POPS, PROD_ROOM],
      note: 'windows and LEDs (ch). Each goes off `off` of the time, re-rolled every `rate` ms; `pulse` of them breathe instead (once a `period`, from breathe[0] up by breathe[1]); `level` = how bright; offCh = the mark when off.',
      fields: [f('col', 'col', 'color'), f('rate', 'ms', 're-roll every'), f('off', 'share', 'off'), f('period', 'ms', 'breathe every'), f('level', 'share', 'brightness'), f('breathe', 'pair', 'breathe from / by', { step: 0.05 })] },
    { key: 'blink', title: 'BLINK', show: [DISC_POPS, DISC_HEAD],
      note: 'marks (match) swap to `to` for `ms`, once an `every` (drifting up to `drift` of it); `twice` = the chance of a double blink.',
      fields: [f('every', 'ms', 'every'), f('ms', 'ms', 'for'), f('drift', 'share', 'drift'), f('twice', 'share', 'double blink')] },
    { key: 'tics', title: 'TICS', show: [DISC_D0G, CARD, DEATH, PROD_EYES],
      note: 'a glitchy logo (d0g): tear + swap + burst together, in col. A hacker\'s own tics are in data/hackers.js.',
      fields: [f('col', 'col', 'color')] },
    { key: 'tear', title: 'TEAR', show: [DISC_D0G, CARD, DEATH],
      note: 'now and then a row jumps a cell sideways for `ms` (share of the rows, once an `every`).',
      fields: [f('every', 'ms', 'every'), f('ms', 'ms', 'for'), f('share', 'share', 'rows')] },
    { key: 'swap', title: 'SWAP', show: [DISC_D0G, CARD],
      note: 'marks swap to their pair (tics.swap: [[from, to]]) for `ms`, `share` of the `every` windows.',
      fields: [f('every', 'ms', 'every'), f('ms', 'ms', 'for'), f('share', 'share', 'chance')] },
    { key: 'burst', title: 'BURST', show: [DISC_D0G, CARD, DEATH, MOLD],
      note: 'a little cluster flashes to noise for `ms`, once an `every`; radius size[0] + up to size[1] (cells are twice as tall as wide, so it\'s round); `gaps` = share of cells in it left alone.',
      fields: [f('every', 'ms', 'every'), f('ms', 'ms', 'for'), f('size', 'pair', 'radius + up to', { step: 0.1 }), f('gaps', 'share', 'gaps'), f('set', 'set', 'characters', { set: 'FX_NOISE' }), f('col', 'col', 'color')] },
    { key: 'ember', title: 'EMBER', show: [DISC_POPS],
      note: 'one mark glows up to col and back over `ms`, once an `every` (a cigarette\'s tip).',
      fields: [f('col', 'col', 'color'), f('every', 'ms', 'every'), f('ms', 'ms', 'for')] },
    { key: 'glow', title: 'GLOW', show: [DISC_CITY],
      note: 'a lamp\'s cone down from (x, y): `rows` deep, `spread` cells out per row, a wash of `alpha`. It comes on at `after` of the draw-in and stutters (dims to `dimTo`) `flickShare` of the `flickMs` windows. The marks in the cone are lit toward col: srcMix / srcBase for the lamp itself, `lit` at the top of the cone.',
      fields: [f('col', 'col', 'color'), f('spread', 'cells', 'spread'), f('alpha', 'share', 'wash'), f('after', 'share', 'on at'), f('flickMs', 'ms', 'stutter every'), f('flickShare', 'share', 'stutter chance'),
        f('dimTo', 'share', 'stutter to'), f('srcMix', 'share', 'lamp mix'), f('srcBase', 'share', 'lamp base'), f('lit', 'share', 'cone light')] },
    { key: 'smoke', title: 'SMOKE', show: [DISC_POPS, DISC_HEAD],
      note: 'puffs off (x, y), one every `every`, drifting (dx, dy) over `life` and fading to the background.',
      fields: [f('every', 'ms', 'a puff every'), f('life', 'ms', 'lasts'), f('dx', 'cells', 'drift x'), f('dy', 'cells', 'drift y'), f('wobble', 'cells', 'wobble'), f('fade', 'share', 'fade')] },
    { key: 'fog', title: 'FOG', show: [DISC_CITY],
      note: 'a band of dots (density) and colons (colons of the dots), drifting `drift` columns a second.',
      fields: [f('density', 'share', 'density'), f('colons', 'share', 'colons'), f('drift', 'num', 'drift')] },
    { key: 'spin', title: 'SPIN', show: [],
      note: 'marks (ch) cycle through `set`, a step every ms (a drive spinning up), once it\'s in and `after` more. (No scene uses it now.)',
      fields: [f('set', 'chars', 'cycle'), f('ms', 'ms', 'step every'), f('after', 'ms', 'after')] },
    { key: 'progress', title: 'PROGRESS', show: [DISC_SLOT],
      note: 'marks light up top to bottom over `ms`: the head cycles `head` (headMs), then all of them `done` (doneMs).',
      fields: [f('col', 'col', 'color'), f('at', 'ms', 'starts at'), f('ms', 'ms', 'takes'), f('head', 'chars', 'head'), f('headMs', 'ms', 'head step'), f('headCol', 'col', 'head color'), f('done', 'chars', 'done'), f('doneMs', 'ms', 'done step')] },
    { key: 'decrypt', title: 'DECRYPT', show: [CODEX],
      note: 'text as ciphertext (the codex\'s unfound entries): letters are `set` characters, re-rolled every `idleMs` at rest, every `ms` while decoding. As you find more of a codex tab, up to `hint` of each unfound name shows through; a newly found one decodes over `dur`.',
      fields: [f('set', 'chars', 'cipher'), f('idleMs', 'ms', 'churn at rest'), f('ms', 'ms', 'churn decoding'), f('dur', 'ms', 'decode takes'), f('hint', 'share', 'shows through, all found')] },
    { key: 'moldwipe', title: 'MOLD TRANSITION', show: [MOLDWIPE],
      note: 'the screen transition with mold in it, at a mold level (0-1: the G0D tab\'s slider; the game doesn\'t turn it up yet). At full mold: blotches (`blotch` cells across) of `fill` of the fill, `noise` of the breakdown noise, and `stay` of the new screen\'s marks held as mold up to `linger` ms longer.',
      fields: [f('set', 'set', 'characters', { set: 'FX_NOISE' }), f('fill', 'share', 'of the fill'), f('blotch', 'cells', 'blotch size'), f('noise', 'share', 'of the noise'), f('stay', 'share', 'lingers'), f('linger', 'ms', 'linger up to')] },
    { key: 'garble', title: 'GARBLE', show: [],
      note: 'a line of text that won\'t hold still (corrupted loot names): it switches versions every `swapMs`, and `share` of its letters are glitch characters, re-rolled every ms.',
      fields: [f('ms', 'ms', 're-roll every'), f('swapMs', 'ms', 'version every'), f('share', 'share', 'glitched'), f('set', 'set', 'characters', { set: 'FX_GLITCH' })] },
  ];
  const HEAD = [
    '// NeoN+1 data/fx.js: the named effects\' settings (the global look). engine/fx.js draws them; docs/EFFECTS.md is the plan.',
    '// The neon editor\'s FX tab edits this file (tools/fx_file.js writes it; the notes come from there).',
    '// Change a number here and every place using that effect changes. A place can override any of them for itself',
    '// (a cutscene layer: { n: \'logo\', glitch: { col: \'ink:b0y\' } }), without becoming its own effect.',
    '// Times are in ms. "share" = the chance (0-1) per cell or per window. "set" = the characters it swaps in.',
    "'use strict';",
  ];
  const quote = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  const val = v => Array.isArray(v) ? '[' + v.map(val).join(', ') + ']' : typeof v === 'string' ? quote(v) : String(+v);
  const wrap = (text, w) => { const out = []; let line = ''; for (const word of text.split(' ')) { if (line && (line + ' ' + word).length > w) { out.push(line); line = word; } else line = line ? line + ' ' + word : word; } if (line) out.push(line); return out; };
  // The file's text, from { sets: { FX_GLITCH, FX_NOISE }, looks: FX_LOOKS } and the build stamp.
  function text(m, build) {
    const out = [...HEAD, `NEON_FILES.push(['data/fx.js', '${build || 'v0'}']);`, ''];
    for (const s of SETS) out.push(`const ${s.name} = ${quote(m.sets[s.name])};   // ${s.note}`);
    out.push('', 'const FX_LOOKS = {');
    for (const L of LOOKS) {
      wrap(L.title + ': ' + L.note, 114).forEach(l => out.push('  // ' + l));
      const parts = L.fields.map(F => F.kind === 'set' ? `${F.k}: ${F.set}` : `${F.k}: ${val(m.looks[L.key][F.k])}`);
      out.push(`  ${L.key}: { ${parts.join(', ')} },`);
    }
    out.push('};', '');
    return out.join('\n');
  }
  // { sets, looks }, from the file's text
  function parse(src) { return new Function('NEON_FILES', src + '\nreturn { sets: { FX_GLITCH, FX_NOISE }, looks: FX_LOOKS };')([]); }
  // a deep copy of just what LOOKS knows (what the editor edits and saves); a set field is left out (it's a shared set)
  function pick(m) {
    const o = { sets: {}, looks: {} };
    for (const s of SETS) o.sets[s.name] = m.sets[s.name];
    for (const L of LOOKS) { o.looks[L.key] = {}; for (const F of L.fields) if (F.kind !== 'set') o.looks[L.key][F.k] = JSON.parse(JSON.stringify(m.looks[L.key][F.k])); }
    return o;
  }
  // The looks with their shared sets filled in (what the game's FX_LOOKS holds).
  function expand(m) {
    const o = JSON.parse(JSON.stringify(m.looks));
    for (const L of LOOKS) for (const F of L.fields) if (F.kind === 'set') o[L.key][F.k] = m.sets[F.set];
    return o;
  }
  // anything in the file LOOKS doesn't know (a setting someone added by hand: it would be lost on save)
  function unknown(m) {
    const out = [];
    for (const [k, v] of Object.entries(m.looks)) {
      const L = LOOKS.find(x => x.key === k);
      if (!L) { out.push(k); continue; }
      for (const kk of Object.keys(v)) if (!L.fields.some(F => F.k === kk)) out.push(k + '.' + kk);
    }
    return out;
  }
  const T = { SETS, LOOKS, text, parse, pick, expand, unknown };
  if (typeof module !== 'undefined' && module.exports) module.exports = T; else root.NEON_FX_FILE = T;
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    if (['-h', '--help'].includes(process.argv[2])) { console.log('usage: node tools/fx_file.js   (rewrites dist/data/fx.js in its own format: a round-trip check)'); process.exit(0); }
    const fs = require('fs'), path = require('path');
    const file = path.join(__dirname, '..', 'dist', 'data', 'fx.js'), src = fs.readFileSync(file, 'utf8');
    const build = (src.match(/NEON_FILES\.push\(\['data\/fx\.js', '([^']+)'\]\)/) || [])[1];
    const m = parse(src), lost = unknown(m);
    if (lost.length) { console.log('fx.js has settings tools/fx_file.js does not know (add them to LOOKS): ' + lost.join(', ')); process.exit(1); }
    const out = text(m, build), back = parse(out);
    if (JSON.stringify(expand(pick(back))) !== JSON.stringify(expand(pick(m))) || JSON.stringify(back.looks) !== JSON.stringify(m.looks)) { console.log('round trip changed a value: not written'); process.exit(1); }
    fs.writeFileSync(file, out);
    console.log(`data/fx.js: ${LOOKS.length} effects, ${src === out ? 'unchanged' : 'rewritten'}`);
  }
})(this);
