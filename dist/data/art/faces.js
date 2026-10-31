// NeoN+1 data/art/faces.js: hackers' faces, by hacker id (data/hackers.js has who they are).
// The neon editor writes this file (tools/neon_editor.html, ART), and sends art to asXii and back.
// Hand edits are fine too: inside the quotes a backslash is \\ and a quote \'.
// A face is 5 x 3, drawn as is (the lines are not centered one by one). POPS's is the training handler's.
'use strict';
NEON_FILES.push(['data/art/faces.js', 'v13.95']);

const ART_FACES = {
  pops: { name: 'POPS', art: [' \'-, ', '┌@\\@┐', '╯{=╭╰'] },
  iceman: { name: 'ICE MAN', art: ['*\\|/*', '[-_-]', ' ~~~ '] },
  ggez: { name: 'GG_EZ', art: [' _]_ ', '(>w<)', ' /v\\ '] },
  turbo: { name: 'TURBO', art: ['  .==', '=(@@)', '  \'=='] },
  doppel: { name: 'D0PPEL', art: ['.-.-.', '(o|o)', '\'-.-\''] },
  sysop: { name: 'SYSOP', art: [' ___ ', '[o-o]', ' }}} '] },
  vulture: { name: 'VULTURE', art: [' ,__ ', '(.v.)', '/| |\\'] },
  phish: { name: 'PH1SH', art: [' _J_ ', '(^_^)', ' >< '] },
  d0g: { name: 'd0g', art: ['/\\_/\\', '(0.0)', '  w  '] },
  hcf: { name: 'HCF', art: [')(\\()', '[x_x]', ' ### '] },
  leech: { name: 'LEECH', art: ['.---.', '|ooo|', '\'-O-\''] },
  brick: { name: 'BRICK', art: ['.___.', '[-_-]', '|###|'] },
  null: { name: 'NULL', art: ['.---.', '| - |', '\'---\''] },
  nana: { name: 'NANA', art: [' @@@ ', '(o-o)', ' >~< '] },
  dialup: { name: 'DIALUP', art: ['~ ~ ~', '(=.=)', '[###]'] },
  baud: { name: 'BAUD', art: ['  _  ', '(-_-)', '\\\\|//'] },
  mother: { name: 'MOTHER', art: ['.-^-.', '( o )', '\'-~-\''] },
  root: { name: 'ROOT', art: ['.___.', '|# _|', '\'---\''] },
  kludge: { name: 'KLUDGE', art: [' ,_, ', '(#_o)', ' |=| '] },
  hype: { name: 'HYPE', art: [' * * ', '\\^o^/', '  |  '] },
};
