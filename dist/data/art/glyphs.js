// NeoN+1 data/art/glyphs.js: node glyphs: their art, names and codex lore.
// The neon editor writes this file (tools/neon_editor.html, ART), and sends art to asXii and back.
// Hand edits are fine too: inside the quotes a backslash is \\ and a quote \'.
// A glyph is up to 5 x 3; each line is centered on the node by itself. Lore lines stay under 26 characters.
// Their order matters: the codex keys are g0, g1... and the game picks from the whole list.
'use strict';
NEON_FILES.push(['data/art/glyphs.js', 'v13.35']);

const ART_GLYPHS = [
  { name: 'DIAMOND', lore: ['a rhombus with ambition.', 'every corp logo is this', 'plus a gradient.'], art: [' / \\ ', '<   >', ' \\ / '] },
  { name: 'THE CROSS', lore: ['marks the spot.', 'the spot is usually', 'a trap.'], art: ['\\ /', ' X ', '/ \\'] },
  { name: 'STORAGE UNIT', lore: ['contents: nothing.', 'a firewall\'s lunchbox.'], art: ['[===]', '[   ]', '[===]'] },
  { name: 'THE WATCHER', lore: ['it saw you jack in.', 'it says nothing.', 'it judges.'], art: [' .-. ', '( o )', ' \'-\' '] },
  { name: 'SIGNAL NOISE', lore: ['the sound of 4,000', 'routers screaming', 'in harmony.'], art: ['~ ~ ~', ' ~ ~ ', '~ ~ ~'] },
  { name: 'HASHTAG X', lore: ['deprecated social rune.', 'still trending', 'somewhere awful.'], art: ['# #', ' # ', '# #'] },
  { name: 'UPLINK', lore: ['points up.', 'management loves it.'], art: ['  ^  ', ' /|\\ ', '  |  '] },
  { name: 'TRACE PATH', lore: ['a wire that took the', 'long way round to', 'avoid the tolls.'], art: ['o-+  ', '  |  ', '  +-o'] },
  { name: 'BINARY', lore: ['spells "i" if you squint.', 'the rest is a typo.'], art: ['0110', '1001', '0110'] },
  { name: 'SYSADMIN', lore: ['on call since 2071.', 'please be gentle.'], art: ['(o.o)', ' |=| '] },
  { name: 'LATTICE', lore: ['a very small fence', 'for very small data.'], art: ['+-+-+', '| | |', '+-+-+'] },
  { name: 'JUNCTION', lore: ['four roads.', 'no lights.', 'all cops.'], art: ['  |  ', '--+--', '  |  '] },
  { name: 'STATIC', lore: ['what is left when a', 'hard drive dreams.'], art: ['. : .', ': . :', '. : .'] },
  { name: 'FAST FORWARD', lore: ['skips the ads.', 'there are always', 'more ads.'], art: ['>>>', '>>>'] },
  { name: 'PADLOCK', lore: ['the oldest security', 'tech in the net.', 'still mostly works.'], art: [' .-. ', ' | | ', '[###]'] },
  { name: 'CORRUPTION', lore: ['a file that got too', 'close to a magnet once.', 'it does not talk about it.'], art: ['%#@', '@ %', '#%@'] },
  { name: 'BRACKET STAR', lore: ['a JSON object that', 'reached enlightenment.'], art: ['{ }', '{*}', '{ }'] },
  { name: 'FUNNEL', lore: ['data goes in.', 'invoices come out.'], art: ['=====', ' === ', '  =  '] },
];
// The special node glyphs (code uses them by key).
const ART_SPECIAL = {
  jack: { name: 'PROMPT', lore: ['where every bad', 'decision starts.'], art: ['', '>_', ''] },
  loot: { name: 'LOADED NODE', lore: ['always ICE.', 'always worth it?', 'never sure.'], art: ['$ $', '[$]', '$ $'] },
  bone: { name: 'BONE PILE', lore: [], art: ['o=o', 'o=$=o', 'o=o'] },
  mask: { name: 'REDACTED', lore: ['the sigil boss forgot', 'what it signed.', 'you should not.'], art: ['', '???', ''] },
};
