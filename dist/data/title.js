// NeoN+1 data/title.js: The title screen art: the face, the NeoN+1 lockup, the circuit traces.
'use strict';
NEON_FILES.push(['data/title.js', 'v12.00']);

// ---------------- Screens built from lines ----------------
// Title cover art: a face, half human (left) and half circuitry (right).
// Each row: [left half, divider, right half].
const COVER = [
  ['            _.-~', '~', '~~~~-._'],
  ["         .-'   .", '|', " [#]  '-."],
  ["       .'    .' ", '|', "  |  +--o'."],
  ['      /     /   ', '|', '  +--+    \\'],
  ['     |   .-""-. ', '|', ' [@@]=+    |'],
  ['     |  ( (o)  )', '|', '  ||  |    |'],
  ["     |   '-..-' ", '|', ' o++o |    |'],
  ['     |     )    ', '|', '  ||  +=   |'],
  ['     |    (_    ', '|', ' ++==++    |'],
  ['      \\    __   ', '|', ' [====]   /'],
  ["       \\  '--'  ", '|', '   ||    /'],
  ["        '.      ", '|', "  o--  .'"],
  ["          '-._  ", '|', "   _.-'"],
  ["              '-", '~', "-'"],
];
// NeoN+1 lockup (docs/NAMES.md #15 EXPONENT): a big N with a raised +1, the build number
// beside it (v11.00) and the name along the bottom. Rows 12-19 of the title art,
// tucked under the jaw. '%' clears a face cell.
const TITLE_LOGO = [
  "   _      _%",
  "  | \\    | |",
  "  |  \\   | |     _",
  "  | . \\  | |  | / |",
  "  | |\\ \\ | | -+-| |",
  `  | | \\ \\| |  | |_|  ${VERSION}`,
  "  | |  \\   |",
  "  |_|   \\__| N e o N + 1",
];
// Background behind the face: static (. : ' ` * =) in the top-left corner and circuit
// traces (- | + o) on both sides. Every trace starts at an 'o' pad touching the head.
const TITLE_BG = [
  ".: '**                   o---+ ",
  " *:                          | ",
  "                             +-",
  "*==                          | ",
  ":                            +-",
  " o                             ",
  " |.                          o-",
  "-+--o                          ",
  "                               ",
  "                            o-+",
  " +----o                    o--+",
  " |                            |",
  " o                        +---+",
  "                          |   |",
  "                    o-----+   |",
  "                              |",
  "                              |",
  "                              |",
  "                              |",
  "                         o----+",
];
const TITLE_W = 31;
