// NeoN+1 data/art/worldmap.js: the boot intro's world map.
// The neon editor writes this file (tools/neon_editor.html, ART), and sends art to asXii and back.
// Hand edits are fine too: inside the quotes a backslash is \\ and a quote \'.
// 34 x 12, in the login screen box. Its 0 o x [] blink; your spot (@) is picked inside the land (engine/intro.js).
'use strict';
NEON_FILES.push(['data/art/worldmap.js', 'v13.79']);

const ART_MAP = [
  '         ._._._._.  ╭──-  ╦─╮',
  ' ╭─────╮.         .╭╯  \'    ╰┬╮',
  '(┤  0  ╰┬╮         │   --─╯  ╰┤',
  ' ╰─╮ -. ├╯    ╭──╮ │ --\'     ╭╯',
  ' . ╰┬╮╭─┤ ╭╮  ╰──┴┬╯  o   ╭──╯ ╭╮',
  '  \' ╰┴╯ ╰─┼┴╮─   ╭┤ -. ╭──╯    ╰╯',
  '     ╭┬───╯ │.-- ╰┼╮ ╭─╯   ;:╭──╮',
  '  ─x ├╯  ┏  │     ╰┴─╯ ╭╮   ╭╯  ├╮',
  '     │   [] │__._╭─━───╯│  ╭┤,  ╰┤',
  '     ╰───┴┬─╯   ╭╯ ╬────╯  ╰┴────╯',
  '          \'     │  │',
  '                ╰──╯',
];
