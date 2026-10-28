// NeoN+1 data/glyphs.js: Node glyphs (the ASCII art on nodes) and their helpers.
'use strict';
NEON_FILES.push(['data/glyphs.js', 'v13.61']);

// ---------------- Glyphs ----------------
// The art, names and lore are in data/art/glyphs.js (ART_GLYPHS), edited in the neon editor.
const MOTIFS_RAW = ART_GLYPHS.map(g => g.art);
function normMotif(m) {
  let lines = m.slice(0, 3);
  if (lines.length === 1) lines = ['', lines[0], ''];
  else if (lines.length === 2) lines = [lines[0], lines[1], ''];
  return lines.map(l => {
    l = l.slice(0, 5);
    const pad = 5 - l.length, left = Math.floor(pad / 2);
    return ' '.repeat(left) + l + ' '.repeat(pad - left);
  });
}
const MOTIFS = MOTIFS_RAW.map(normMotif);
const JACK_GLYPH = normMotif(ART_SPECIAL.jack.art);
const LOOT_GLYPH = normMotif(ART_SPECIAL.loot.art);
const BONE_GLYPH = normMotif(ART_SPECIAL.bone.art); // BONEYARD's $ nodes: bone piles
const MASK_GLYPH = normMotif(ART_SPECIAL.mask.art);
const X_SHAPE = normMotif(['\\ /', ' X ', '/ \\']);
const shapeOf = gl => gl.map(l => l.replace(/[^ ]/g, '#')).join('|');
const X_MASK = shapeOf(X_SHAPE);
const MARK_CHARS = '#%@*+=o0&';

// Codex entries for every tile glyph: a name and some (unreliable) lore (data/art/glyphs.js).
const GLYPH_LORE = ART_GLYPHS.map(g => [g.name, g.lore]);
const SPECIAL_GLYPHS = [
  { key: 'gjack', name: ART_SPECIAL.jack.name, glyphOf: () => JACK_GLYPH, lore: ART_SPECIAL.jack.lore },
  { key: 'gloot', name: ART_SPECIAL.loot.name, glyphOf: () => LOOT_GLYPH, lore: ART_SPECIAL.loot.lore },
  { key: 'gsig',  name: 'SIGIL SIGNATURE', glyphOf: () => X_SHAPE,    lore: ['sigil signs its work.', 'the signature changes.', 'the habit does not.'] },
  { key: 'gmask', name: ART_SPECIAL.mask.name, glyphOf: () => MASK_GLYPH, lore: ART_SPECIAL.mask.lore },
];
const GLYPHS = [
  ...GLYPH_LORE.map(([name, lore], i) => ({ key: 'g' + i, name, lore, glyphOf: () => MOTIFS[i] })),
  ...SPECIAL_GLYPHS,
];
const GLYPH_BY_KEY = Object.fromEntries(GLYPHS.map(gl => [gl.key, gl]));

// Labels on locked-out nodes: [word, mod code]. 5 characters max.
const LOCK_LABEL = {
  purge: ['PURGE', ''], burner: ['BURNT', ''],
  sniffer: ['INERT', 'SNF'], corners: ['INERT', 'CNR'], sigscan: ['INERT', 'SIG'],
  overclock: ['INERT', 'OVC'], virus: ['INFCT', 'VRS'], xaxis: ['SCAN', 'XAX'], yaxis: ['SCAN', 'YAX'],
  basictraining: ['INERT', 'BSC'], autocomplete: ['NOPE', 'ACP'], twinlock: ['TWIN', 'TWN'], unravel: ['UNRVL', 'UNR'], jackbox: ['POP!', 'JCK'], frost: ['FROZE', ''], bid: ['SOLD', ''], protect: ['GONE', ''], snipe: ['INERT', 'SNP'], chancecard: ['CARD', 'CHC'], filed: ['FILED', ''], fourinarow: ['INERT', 'FIR'], breach: ['BRCH', ''], rival: ['RIVAL', ''], antigrav: ['DROP', 'AGV'], crack: ['CRACK', ''], link: ['LINK', ''], linkup: ['LINK', 'LNK'], blast: ['BLAST', 'BLS'], sacrifice: ['OFFER', 'SAC'], companion: ['SNIFF', 'PET'],
};
