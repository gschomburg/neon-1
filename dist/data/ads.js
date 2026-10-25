// NeoN+1 data/ads.js: the fake ads: their screens, text and art. (Shown by engine/ads.js.)
'use strict';
NEON_FILES.push(['data/ads.js', 'v13.15']);

// An ad is 1 or 2 screens. A screen is a list of lines, up to ADS_W characters, drawn inside
// the ad box from the top. A line: { t: text, c: color (a palette slot: text, dim, mid, bright,
// accent, danger, money), x: column (default 0; 'c' = centered), inv: drawn inverted (dark
// text on a bar of its color), b: bold, btn: a button (tapping it closes the ad; its value is
// the line shown after) }.
// Bars: {bar} in a line becomes a bar that fills while the screen is up; {rbar} one that empties.
// {bar:20} sets its width (inside the brackets; default 10), {bar:20:6s} how long it takes (default:
// most of the time the screen is up). E.g. 'installing... {bar:16:8s}', 'battery {rbar:8}'.
const ADS_W = 30, ADS_H = 18;

// Big block letters for headlines (4 wide, 5 tall, made of #).
const AD_FONT = {
  A: [' ## ', '#  #', '####', '#  #', '#  #'], L: ['#   ', '#   ', '#   ', '#   ', '####'],
  E: ['####', '#   ', '### ', '#   ', '####'], R: ['### ', '#  #', '### ', '# # ', '#  #'],
  T: ['####', ' ## ', ' ## ', ' ## ', ' ## '], '!': ['#', '#', '#', ' ', '#'],
};
// A word in block letters: 5 lines of text.
const adBig = (word, c = 'danger') => [0, 1, 2, 3, 4].map(r => ({ t: [...word].map(ch => (AD_FONT[ch] || ['    '])[r]).join(' '), c, x: 'c', b: true }));

const ADS = {
  // SPONSORED STORIES: the junk at the bottom of news sites. Four tiles, thumbnails and bait.
  chumbox: {
    name: 'SPONSORED STORIES',
    screens: [[
      { t: 'SPONSORED STORIES', c: 'bright', b: true },
      { t: 'you may also like', c: 'dim' },
      { t: '' },
      { t: ' /^-^\\          .-"-. ', c: 'money' },
      { t: '( o o )        ( x x )', c: 'money' },
      { t: ' \\ v /          \\ ^ / ', c: 'money' },
      { t: 'is your dog    4 things that', c: 'text' },
      { t: 'in danger?     are killing you', c: 'text' },
      { t: '               (#3: integrity)', c: 'dim' },
      { t: ' +---+          _|_|_ ', c: 'accent' },
      { t: ' |ICE|         | 0 0 |', c: 'accent' },
      { t: ' +---+          \\___/ ', c: 'accent' },
      { t: 'doctors are    she replaced', c: 'text' },
      { t: 'stunned by a   her hands. #2', c: 'text' },
      { t: 'weird ICE      will shock you', c: 'text' },
      { t: 'trick', c: 'text' },
      { t: 'promoted by HEALTHTRUTHS DAILY', c: 'dim', x: 'c' },
    ]],
  },
  // Scareware: an antivirus that wants you to renew. Two screens.
  antivirus: {
    name: 'VIRUSHIELD PRO',
    screens: [[
      { t: '[ VIRUSHIELD PRO 2026 ]', c: 'money', x: 'c', b: true },
      { t: '' },
      ...adBig('ALERT!'),
      { t: '' },
      { t: '3 VIRUSES DETECTED.', c: 'danger', x: 'c', b: true },
      { t: 'one of them is you.', c: 'text', x: 'c' },
      { t: '' },
      { t: 'scanning... {bar}', c: 'money' },
      { t: '81 threats found.', c: 'dim' },
      { t: 'do not close this window.', c: 'dim' },
    ], [
      { t: '[ VIRUSHIELD PRO 2026 ]', c: 'money', x: 'c', b: true },
      { t: '' },
      { t: 'your subscription has', c: 'text', x: 'c' },
      { t: '    E X P I R E D    ', c: 'danger', x: 'c', inv: true, b: true },
      { t: '' },
      { t: '.---.', c: 'accent', x: 'c' },
      { t: '/ ### \\', c: 'accent', x: 'c' },
      { t: '|  !  |', c: 'danger', x: 'c' },
      { t: '\\ ### /', c: 'accent', x: 'c' },
      { t: "'---'", c: 'accent', x: 'c' },
      { t: '' },
      { t: 'your nodes are UNPROTECTED.', c: 'danger', x: 'c' },
      { t: '' },
      { t: '[ RENEW 49cr ]', c: 'money', x: 'c', btn: '> nice try. (it was free all along.)' },
      { t: '[ remind me later ]', c: 'dim', x: 'c', btn: '> we will remind you.' },
    ]],
  },
};
