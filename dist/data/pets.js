// NeoN+1 data/pets.js: the pet (engine/pet.js). A pet is yours for the run: it walks the tray line, sits, sleeps when
// you're idle, dances on the beat when the music's on, and you can tap it to pet it. COMPANION (BYTEPETS' corp mod) gives
// you one (a cat or a dog and a name, rolled when you take the mod) and adds its trick: sniffing out ICE. Other things can
// give a pet later without the trick.
//
// Each look is 2 lines (it can overlap the lines above and below). Walking and dancing have 2 frames. They face right;
// facing left they're mirrored ( ) / \ < > swapped). Hand edits are fine: keep each line about 8 wide.
'use strict';
NEON_FILES.push(['data/pets.js', 'v13.90']);

const PET_NAMES = ['BYTE', 'CHIP', 'NIBBLE', 'PIXEL', 'BITSY', 'PING', 'GIGA', 'SOCKET', 'DOT', 'MODEM', 'ZIP', 'TOFU', 'WIDGET', 'JPEG', 'CRUMB', 'PATCHY'];

const PETS = {
  cat: {
    sit:   [' /\\_/\\ ', '( o.o )'],
    walk:  [[' /\\_/\\ ', '~( o.o )'], [' /\\_/\\ ', '_( o.o )']],
    sleep: [' /\\_/\\ ', '( -.- )'],
    dance: [['\\/\\_/\\ ', '( ^.^ )/'], [' /\\_/\\/', '\\( ^.^ )']],
    happy: [' /\\_/\\ ', '( ^.^ )'],
    alert: [' /\\_/\\ ', '( O.O )'],
  },
  dog: {
    sit:   ['  ,--, ', 'U(o o)U'],
    walk:  [['  ,--, ', '~U(o o)U'], ['  ,--, ', '_U(o o)U']],
    sleep: ['  ,--, ', 'U(- -)U'],
    dance: [['\\ ,--, ', 'U(^ ^)U/'], ['  ,--, /', '\\U(^ ^)U']],
    happy: ['  ,--, ', 'U(^o^)U'],
    alert: ['  ,--, ', 'U(O O)U'],
  },
};

// What happens in the terminal when a hacker comes in and you have a pet (about half the time). {pet}: its name,
// {hk}: the hacker's.
const PET_LINES = {
  rival: { dog: ['{pet} growls at {hk}.', '{pet} barks at {hk}. good dog.'], cat: ['{pet} hisses at {hk}.', '{pet} puffs up at {hk}.'] },
  ggez: ['{hk}: lol ur pet', '{hk}: is that a cat or a dog xD'],
  pops: ["pops: who's this little guy?", 'pops scratches {pet} behind the ears.'],
  brick: ['brick pets {pet}. silently.'],
  null: ['null: irrelevant.', 'null: the animal is irrelevant.'],
  nana: ['nana slips {pet} a cookie.', 'nana: who is a good baby?'],
  dialup: ['dialup: we had one named MODEM, back in the day.'],
  baud: ['baud: g o o d   p e t .'],
  mother: ['mother: look who came to help, dear.', 'mother: {pet} is watching over you too.'],
  root: ['root: # {pet} has root access?', 'root: # chmod 777 {pet}'],
  kludge: ['kludge tapes a little bow on {pet}.'],
  hype: ['hype: OMG {pet}!!!', 'hype: chat, look at {pet} <3'],
};
