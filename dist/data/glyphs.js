// NeoN+1 data/glyphs.js: Node glyphs (the ASCII art on nodes) and their helpers.
'use strict';
NEON_FILES.push(['data/glyphs.js', 'v12.23']);

// ---------------- Glyphs ----------------
const MOTIFS_RAW = [
  [' / \\ ', '<   >', ' \\ / '],
  ['\\ /', ' X ', '/ \\'],
  ['[===]', '[   ]', '[===]'],
  [' .-. ', '( o )', " '-' "],
  ['~ ~ ~', ' ~ ~ ', '~ ~ ~'],
  ['# #', ' # ', '# #'],
  ['  ^  ', ' /|\\ ', '  |  '],
  ['o-+  ', '  |  ', '  +-o'],
  ['0110', '1001', '0110'],
  ['(o.o)', ' |=| '],
  ['+-+-+', '| | |', '+-+-+'],
  ['  |  ', '--+--', '  |  '],
  ['. : .', ': . :', '. : .'],
  ['>>>', '>>>'],
  [' .-. ', ' | | ', '[###]'],
  ['%#@', '@ %', '#%@'],
  ['{ }', '{*}', '{ }'],
  ['=====', ' === ', '  =  '],
];
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
const JACK_GLYPH = normMotif(['', '>_', '']);
const LOOT_GLYPH = normMotif(['$ $', '[$]', '$ $']);
const BONE_GLYPH = normMotif(['o=o', 'o=$=o', 'o=o']); // BONEYARD's $ nodes: bone piles
const MASK_GLYPH = normMotif(['', '???', '']);
const X_SHAPE = normMotif(['\\ /', ' X ', '/ \\']);
const shapeOf = gl => gl.map(l => l.replace(/[^ ]/g, '#')).join('|');
const X_MASK = shapeOf(X_SHAPE);
const MARK_CHARS = '#%@*+=o0&';

// Codex entries for every tile glyph: a name and some (unreliable) lore.
// Lore lines stay under 26 characters so they fit next to the tile art.
const GLYPH_LORE = [
  ['DIAMOND',      ['a rhombus with ambition.', 'every corp logo is this', 'plus a gradient.']],
  ['THE CROSS',    ['marks the spot.', 'the spot is usually', 'a trap.']],
  ['STORAGE UNIT', ['contents: nothing.', 'a firewall\'s lunchbox.']],
  ['THE WATCHER',  ['it saw you jack in.', 'it says nothing.', 'it judges.']],
  ['SIGNAL NOISE', ['the sound of 4,000', 'routers screaming', 'in harmony.']],
  ['HASHTAG X',    ['deprecated social rune.', 'still trending', 'somewhere awful.']],
  ['UPLINK',       ['points up.', 'management loves it.']],
  ['TRACE PATH',   ['a wire that took the', 'long way round to', 'avoid the tolls.']],
  ['BINARY',       ['spells "i" if you squint.', 'the rest is a typo.']],
  ['SYSADMIN',     ['on call since 2071.', 'please be gentle.']],
  ['LATTICE',      ['a very small fence', 'for very small data.']],
  ['JUNCTION',     ['four roads.', 'no lights.', 'all cops.']],
  ['STATIC',       ['what is left when a', 'hard drive dreams.']],
  ['FAST FORWARD', ['skips the ads.', 'there are always', 'more ads.']],
  ['PADLOCK',      ['the oldest security', 'tech in the net.', 'still mostly works.']],
  ['CORRUPTION',   ['a file that got too', 'close to a magnet once.', 'it does not talk about it.']],
  ['BRACKET STAR', ['a JSON object that', 'reached enlightenment.']],
  ['FUNNEL',       ['data goes in.', 'invoices come out.']],
];
const SPECIAL_GLYPHS = [
  { key: 'gjack', name: 'PROMPT',          glyphOf: () => JACK_GLYPH, lore: ['where every bad', 'decision starts.'] },
  { key: 'gloot', name: 'LOADED NODE',     glyphOf: () => LOOT_GLYPH, lore: ['always ICE.', 'always worth it?', 'never sure.'] },
  { key: 'gsig',  name: 'SIGIL SIGNATURE', glyphOf: () => X_SHAPE,    lore: ['sigil signs its work.', 'the signature changes.', 'the habit does not.'] },
  { key: 'gmask', name: 'REDACTED',        glyphOf: () => MASK_GLYPH, lore: ['the sigil boss forgot', 'what it signed.', 'you should not.'] },
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
