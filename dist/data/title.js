// NeoN+1 data/title.js: The title screen art: the face, the NeoN+1 name, the circuit traces.
'use strict';
NEON_FILES.push(['data/title.js', 'v14.73']);

// ---------------- Screens built from lines ----------------
// Title cover art (the user's, from asXii: asxii_art/NeoN_1_screens_v06, "title: art FACE v2"): a face, half human
// (left of the '|' at TITLE_MID) and half circuitry, with circuit traces around it. The face and the traces share
// rows; TITLE_FACE_SPAN says which columns of each row are face ([from, to], or null), the rest is background
// (static and traces). engine/screens.js TITLE reads all three, and its animations look for '{o}', '[@@]',
// '[====]', '<>' and the vv /\ ^^ X column at TITLE_CHIP: keep those if the art changes.
const COVER = [
  "                          o---++",
  "  .: '**      _.-~~~~~~-._    _|",
  "   *:      .-'   .| [#]  '-.   |",
  "         .'    .' |  |  +--o'. +-:--",
  "  *==   /     /   |  +--+  ..\\ |",
  "  :    |   .-\"\"-. | [@@]=+ vv |+-",
  "   o   |  (-{o}- )|<>||  | /\\ |",
  "   |.  |   '-..-' | o++o | /\\ |o-<=>",
  "  -+--o|     )    L__||__+=/\\ |",
  "       |    (_    | ++==++ ^^ |",
  "        \\    __   | [====] X /o-+",
  "<>-+----o\\  '=='  |   ||  []/o--+",
  "   |      '.      |  o--  .'    |",
  "   o        ';._  L_.._.-'  +---+",
  "          |     '-~-'       |   |",
  "      +---o           o-----+   ++",
  "                                 |",
  "                                 o",
];
const TITLE_FACE_SPAN = [null, [14, 25], [11, 27], [9, 29], [8, 29], [7, 30], [7, 30], [7, 30], [7, 30], [7, 30],
  [8, 29], [9, 28], [10, 27], [12, 25], [16, 20], null, null, null];
const TITLE_MID = 18;           // the column between the human half and the circuit half
const TITLE_CHIP = [27, 5, 6];  // the chip column (vv /\ /\ /\ ^^ X): x, first row, rows
// The NeoN+1 name (the user's, asXii "neon_title"), from row TITLE_NAME_AT of the art. Its middle columns
// (TITLE_NAME_WORD: the e and o) and the +1 are drawn brighter than the Ns.
const TITLE_NAME = [
  "    {]\\\\  [}           {]\\\\  [=}",
  "     [ \\\\ ]   __   __   [ \\\\ ]",
  "     [  \\\\]  /..} /  \\  [  \\\\]",
  "   {=]   \\[} \\__, \\__/ {]   \\[}+1",
];
const TITLE_NAME_AT = 17;
const TITLE_NAME_WORD = [13, 21];
const TITLE_W = 36;
// G0D's eyes on the title (engine/scene.js): the global look (data/fx.js eyes) with these over it.
// anywhere 0.5 (Greg, 2026-11-09): half the eyes land on anything, the UI too. (So the FX tab's `anywhere` doesn't reach
// the title; its other settings do.)
const TITLE_EYES = { anywhere: 0.5 };
