// NeoN+1 data/art/root.js: the SECTOR CLEARED pictures, by key (one is picked at random).
// The neon editor writes this file (tools/neon_editor.html, ART), and sends art to asXii and back.
// Hand edits are fine too: inside the quotes a backslash is \\ and a quote \'.
// Each is up to 30 x 13, drawn as is (not centered line by line), centered in a 30 x 13 box.
'use strict';
NEON_FILES.push(['data/art/root.js', 'v13.88']);

const ROOT_ART_H = 13;
const ART_ROOT = {
  padlock: { name: 'PADLOCK', art: [
    '     .-------.',
    '    /  .---.  \\',
    '   |  |     |  |',
    '   |  |     |  |',
    '   |  |     |',
    '   |  |',
    '.--\'--\'-----------.',
    '|  .-------------.|',
    '|  |  R O O T    ||',
    '|  \'-------------\'|',
    '|        (_)      |',
    '|        |=|      |',
    '\'-----------------\'',
  ] },
  roots: { name: 'ROOTS', art: [
    '      .:::::::.',
    '    .:::::::::::.',
    '   :::::::::::::::',
    '    \':::::::::::\'',
    '       \'::|::\'',
    '          |',
    '          |',
    '~~~~~~~~~~|~~~~~~~~~~~',
    '       _/ | \\_',
    '     _/ / | \\ \\_',
    '    /  /  |  \\  \\',
    '   /  /   |   \\  \\',
    '  R   O   O    T',
  ] },
  shell: { name: 'ROOT SHELL', art: [
    '.--------------------------.',
    '| $ whoami                 |',
    '| ghost                    |',
    '| $ sudo -s                |',
    '| password: ********       |',
    '| # whoami                 |',
    '| root                     |',
    '| # _                      |',
    '|                          |',
    '\'--------------------------\'',
    '     ___|__________|___',
    '    /__________________\\',
  ] },
  crown: { name: 'CROWN', art: [
    '   *       *       *',
    '  /\\      /\\      /\\',
    ' /  \\    /  \\    /  \\',
    '/    \\  /    \\  /    \\',
    '|     \\/  <>  \\/     |',
    '|   ()    ()    ()   |',
    '|____________________|',
    '[====================]',
    '',
    '     R  O  O  T',
  ] },
};
