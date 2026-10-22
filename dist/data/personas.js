// NeoN+1 data/personas.js: Persona names and hacker logos.
'use strict';
NEON_FILES.push(['data/personas.js', 'v12.11']);

// ---- player profile: a generated handle (no typing, so nothing to moderate) + a logo
// Persona names: a middle word, with either a word before it (IRON_POTATO)
// or a word after it (POTATO_SAUCE). Half and half.
const NAME_A = ['NEON', 'GHOST', 'ZERO', 'CHROME', 'STATIC', 'RAZOR', 'NULL', 'VOLT', 'HEX', 'DUSK', 'ACID', 'IRON', 'THE'];
const NAME_B = ['RAT', 'FOX', 'WIRE', 'BYTE', 'JACK', 'MOTH', 'KEY', 'SAINT', 'HOUND', 'LOOP', 'DRONE', 'SPIKE', 'POTATO',
  'SHARK', 'VIPER', 'CROW', 'GOBLIN', 'WIDOW', 'PIXEL', 'TOAD', 'SPARK', 'COBRA', 'GLITCH', 'RONIN', 'MANTIS', 'NOODLE', 'PICKLE', 'WAFFLE', 'PLAGUE'];
const NAME_C = ['SAUCE', 'KING', 'PRIME', 'EXE', '9000', 'MK2', 'DELUXE', '404', 'JR', 'MAX', 'LORD', 'OS'];
// Hacker logos: your persona's art (corp-logo size, <= 5 lines), and its mark: 3 characters
// for tight spots (HUD, lists); the middle one is your cursor in multiplayer.
const HACKER_LOGOS = [
  { name: "SKULL", mark: "{x}", art: ["   .-------.", "  /  x   x  \\", " |     ^     |", "  \\  =====  /", "   '-------'"] },
  { name: "ANON", mark: "(v)", art: ["   .-------.", "  / \\/   \\/ \\", " |   -   -   |", "  \\  \\___/  /", "   '._____.'"] },
  { name: "TROLL", mark: ">:)", art: ["   .--------.", "  / ^      ^ \\", " |  ________  |", "  \\ \\______/ /", "   '--------'"] },
  { name: "LOLCAT", mark: "=^=", art: ["  /\\_______/\\", " (  o     o  )", " (   =\\_/=   )", "  )  I CAN  (", " (__HAZ_ROOT__)"] },
  { name: "GLIDER", mark: "[o]", art: [" +---+---+---+", " |   | o |   |", " |   |   | o |", " | o | o | o |", " +---+---+---+"] },
  { name: "SUDO", mark: "<$>", art: [" .--------------.", " | $ sudo rm    |", " |   -rf /      |", " | are you sure_|", " '--------------'"] },
  { name: "ACID", mark: "{~}", art: ["    .-''''-.", "   / o    o \\", "  |  \\____/  |", "   \\   ~~   /", "    '-....-'"] },
  { name: "DOGE", mark: "/w/", art: ["   /\\     /\\", "  (  o   o  )  wow", "   \\   ..  /", "    '-----'   such", "      hack"] },
  { name: "BOT", mark: "[=]", art: ["     [=====]", "    [ O   O ]", "    [  ___  ]", "     [_____]", "      || ||"] },
  { name: "JOLLY ROGER", mark: "#%#", art: [" \\\\   .---.   //", "   \\ ( x x ) /", "     ) /_\\ (", "   / '-----' \\", " //           \\\\"] },
  { name: "404", mark: "[4]", art: [" _  _    ___   _  _", "| || |  / _ \\ | || |", "|__  _|| (_) ||__  _|", "   |_|  \\___/    |_|", "    not found"] },
  { name: "ROFLCOPTER", mark: "-+-", art: [" ROFL:ROFL:LOL", "      _^____", " L   / []   \\", "LOL==        |", " L   \\______/"] },
  { name: "THIS IS FINE", mark: "{&}", art: ["   ( (  ( (", "  .--------.", "  | this   |]", "  | is fine|]", "  '--------'"] },
  { name: "THE EYE", mark: "(@)", art: ["      .----.", "  .--'  __  '--.", " (    ( @@ )    )", "  '--.      .--'", "      '----'"] },
  { name: "HACK THE PLANET", mark: "(#)", art: ["     .-----.", "   .' / | \\ '.", "  |--+--+--+--|", "   '. \\ | / .'", "     '-----'"] },
];
