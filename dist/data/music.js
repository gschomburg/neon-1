// NeoN+1 data/music.js: Music: scales, every track, and which track plays where.
'use strict';
NEON_FILES.push(['data/music.js', 'v13.28']);

// ---------------- Music ----------------
// Generated 80s-style synthwave: pad, bass, drums, arp and lead, scheduled a little
// ahead in 16th-note steps. Each corp has its own song; layers come in as you go deeper.
//   level 0: pad + bass   1: + drums   2: + arp   3: + lead (boss)   4: final boss
// urgency (0..1): Chronos clock pressure; speeds up, opens the filter, doubles the hats.
const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10], harmonic: [0, 2, 3, 5, 7, 8, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
};
// Tracks, by their own names. Where each one plays is set in MUSIC_FOR below,
// so tracks can be moved between corps/screens by changing one line.
const SONGS = {
  // Slow and mellow, Blade Runner-ish: long pad swells, a low brass-like swell, sparse
  // bell notes into a long echo, no drums. (echo/feedback: per-track delay.)
  night_rain: { name: 'NIGHT RAIN',     bpm: 64,  root: 40, scale: 'minor',    prog: [0, 5, 3, 6], style: 'ambient', echo: 0.62, feedback: 0.55 },
  gridlock:   { name: 'GRIDLOCK',       bpm: 96,  root: 45, scale: 'minor',    prog: [0, 5, 3, 4], bass: 'eighths', drums: 'four',  arp: 'up' },
};
// Where each track plays: menus, the map (+ market, caches, safehouses), and each corp.
// A corp with no track of its own plays the map track (trackFor in engine/music.js).
const MUSIC_FOR = {
  menu: 'night_rain', map: 'gridlock',
  omni: 'dropzone',   // DROP ZONE (the user's note: "boss"); MELTDOWN was cut 2026-10-24
};

// GRAVE ROBBER (BONEYARD's mod): while you hold it, this plays instead of the map track (engine/boot.js).
const GRAVE_TRACK = 'graverobber';

// ---------------- New tracks (2026-10-24), not playing anywhere yet ----------------
// One per artist the user named as an inspiration (docs/MUSIC.md), each with its own melody, bass riff and beat
// (the written parts: see the top of engine/music.js). To use one, point a MUSIC_FOR line at it.
// Scale degrees: 0 = the root, 7 = an octave up. Bars play in turn.
// A track made from another one says so with from: 'thatkey' (the game ignores it; the music tool groups them).
Object.assign(SONGS, {
  // GRAVE ROBBER (2026-10-25): inspired by John Carpenter's Halloween, its own notes. 5/4, a high piano figure
  // (3 + 3 + 4 eighths) that never stops while the chords move under it; the B section drops the bass a half step
  // under the figure. A door creaks open every other time through, an owl calls in the B section.
  graverobber: { name: 'GRAVE ROBBER', bpm: 150, root: 42, scale: 'harmonic', meter: 5, prog: [0, 0, 5, 4], kit: 'synth', pump: 0,
    padVoice: 'choir', bassVoice: 'sub', echo: 0.5, feedback: 0.45, form: 'AABA',
    beat: { kick: 'x...........x.......', snare: '........x.......x...', hat: 'x...x...x...x...x...' },
    bassLine: '0 - - . 0 - - . 0 - - . 0 - - . 0 - 7 .',
    melody: ['7 . 2 . 4 . 7 . 2 . 4 . 9 . 7 . 4 . 2 .', '7 . 2 . 4 . 7 . 2 . 4 . 9 . 7 . 4 . 2 .',
      '7 . 2 . 4 . 7 . 2 . 4 . 8 . 7 . 4 . 2 .', '7 . 2 . 4 . 7 . 2 . 4 . 5 . 4 . 2 . 1 .'],
    melodyAt: 0, leadVoice: 'keys', arpVoice: 'glass', arpLine: '. . . . . . . . . . 5 . . . . . . . 4 .',
    creak: ['x...................', '....................', '....................', '....................', '....................', '....................', '....................', '....................'],
    // B: the bass sinks a half step (F over the F# figure), the drums thin out, the owl
    B: { prog: [6, 6, 5, 5], bassLine: '-7 - - . -7 - - . -7 - - . -7 - - . -7 - 0 .',
      beat: { kick: 'x...................', snare: '................x...', hat: 'x.......x.......x...' },
      owl: ['....................', '....x...............', '....................', '....................'] } },
  // Daft Punk, Tron: Legacy: a 16th-note octave bass, a gritty staccato riff, brass hits on the bar
  lightcycle: { name: 'LIGHT CYCLE', bpm: 128, root: 38, scale: 'minor', prog: [0, 0, 5, 3], kit: '808', pump: 0.7, padVoice: 'glass',
    beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.', open: '..............x.' },
    bassLine: '0 7 0 7 0 7 0 7 0 7 0 7 0 7 0 7',
    melody: ['7 . 7 . 6 . 7 . 4 . . . 3 . 4 .', '7 . 7 . 6 . 7 . 9 . . . 7 . 6 .', '5 . 5 . 4 . 5 . 2 . . . 1 . 2 .', '3 . 3 . 4 . 3 . 0 . 0 . 1 . 2 .'],
    leadVoice: 'dist', arpVoice: 'chip', arpLine: '. . 3 . . . 4 . . . 5 . . . 4 .', stab: 'x...............', stabVoice: 'brass', stabAt: 2,
    // B (v13.16): a half-time bridge, long bass notes and a slow brass line, before the riff comes back
    B: { prog: [3, 3, 5, 6], bassLine: '0 - - - - - - - 0 - - - 7 - - -', stab: 'x.......x.......',
      beat: { kick: 'x.......x.......', snare: '........x.......', hat: '..x...x...x...x.' },
      melody: ['5 - - - - - - - 4 - - - 3 - - -', '5 - - - - - - - 7 - - - - - - -', '8 - - - - - - - 7 - - - 5 - - -', '6 - - - - - - - 4 - 5 - 6 - 7 -'] } },
  // Nine Inch Nails: an industrial kit, a chugging phrygian riff, a lonely piano over it, breakdowns
  machineheart: { name: 'MACHINE HEART', bpm: 104, root: 40, scale: 'phrygian', prog: [0, 0, 1, 0], kit: 'industrial', pump: 0.2, padVoice: 'choir', breakdown: 4,
    beat: { kick: 'x.....x.x.......', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', ghost: '...........x...x' },
    bassVoice: 'picked', bassLine: '0 . 0 0 . 0 1 . 0 . 0 0 . 3 . 1',
    melody: ['4 - - - . . . . 3 - - - 1 - - -', '0 - - - - - - - . . . . . . . .', '4 - - - 5 - - - 4 - - - 3 - - -', '1 - - - - - - - . . . . -1 - - -'],
    melodyAt: 0, leadVoice: 'keys', arpVoice: 'pluck', arpLine: '0 . . 0 . . 0 . 1 . . 1 . . 2 .' },
  // Kavinsky, Nightcall: slow and heavy, the big pumping pad, a long supersaw line
  nightdrive: { name: 'NIGHT DRIVE', bpm: 92, root: 41, scale: 'minor', prog: [0, 5, 2, 6], echo: 0.4,
    beat: { kick: 'x.......x.......', snare: '....x.......x...', hat: '..x...x...x...x.' },
    bassLine: '0 - - - - - - - 0 - - - 0 - 0 -',
    melody: ['4 - - - - - 3 - 2 - - - 0 - - -', '2 - - - - - - - . . . . . . . .', '5 - - - - - 4 - 3 - - - 2 - - -', '4 - - - - - - - . . . . . . 2 3'],
    leadVoice: 'saw',
    // B (v13.16): the chords climb (Bb C Db Eb) under a higher line; played A A B
    form: 'AAB', B: { prog: [3, 4, 5, 6],
      melody: ['7 - - - 5 - - - 3 - - - - - - -', '8 - - - 6 - - - 4 - - - - - - -', '9 - - - 7 - - - 5 - - - - - - -', '10 - - - - - - - 8 - - - 7 - - -'] } },
  // Goblin, Suspiria / Profondo Rosso: a prog-rock bass ostinato, a church organ, a music-box melody
  reddeep: { name: 'RED DEEP', bpm: 120, root: 45, scale: 'harmonic', prog: [0, 0, 5, 4], kit: 'break', pump: 0, padVoice: 'organ', echo: 0.35, feedback: 0.4,
    beat: { kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
    bassLine: '0 . 7 . 5 . 7 . 6 . 7 . 5 . 4 .',
    melody: ['7 . 9 . 11 . 9 . 7 . 9 . 11 . 9 .', '7 . 9 . 11 . 9 . 6 - - - . . . .', '5 . 7 . 9 . 7 . 5 . 7 . 9 . 7 .', '4 . 6 . 8 . 6 . 4 - - - . . . .'],
    leadVoice: 'bell', arpVoice: 'pluck', arpLine: '. . . . . . . . 0 . 1 . 2 . 1 .' },
  // Arcade Fire: an indie anthem, driving eighths, an organ, glockenspiel and a "whoa-oh" chant
  anthem: { name: 'ANTHEM', bpm: 128, root: 43, scale: 'major', prog: [0, 4, 5, 3], kit: 'break', pump: 0, padVoice: 'organ', echo: 0.3,
    beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
    bassVoice: 'picked', bassLine: '0 . 0 . 0 . 0 . 0 . 0 . 0 . 0 .',
    melody: ['4 - - - 4 - 5 - 4 - - - 2 - - -', '4 - - - 4 - 5 - 4 - - - 1 - - -', '2 - - - 2 - 4 - 2 - - - 0 - - -', '0 - - - - - - - . . . . . . . .'],
    leadVoice: 'vox', arpVoice: 'bell', arp: 'updown' },
  // Skrillex: half-time, a wobbling acid bass, a screaming lead, a breakdown before the drop
  dropzone: { name: 'DROP ZONE', bpm: 140, root: 41, scale: 'minor', prog: [0, 0, 5, 6], kit: '808', pump: 0.4, padVoice: 'choir', breakdown: 4,
    beat: { kick: 'x.........x.....', snare: '........x.......', hat: 'x.x.x.x.x.xxx.x.', open: '..............x.' },
    bassVoice: 'acid', bassLine: '0 0 0 0 0 0 0 0 3 3 3 3 5 5 7 7',
    melody: ['. . . . . . . . 7 - 6 - 7 - . .', '. . . . . . . . 9 - 7 - 6 - 4 -'],
    leadVoice: 'dist', arpVoice: 'chip', arpLine: '. . . . . . . . . . . . 3 4 5 4' },
  // Ladytron: electroclash, a deadpan line, a gated pad, an analog bass bouncing between octaves
  deadpan: { name: 'DEADPAN', bpm: 124, root: 45, scale: 'minor', prog: [0, 0, 3, 4], kit: '808', pump: 0.3, gate: 'x.x.x.x.x.x.x.x.',
    beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.' },
    bassVoice: 'pluck', bassLine: '0 . 0 7 . 0 0 . 0 . 0 7 . 0 3 .',
    melody: ['4 . 4 . 4 . 3 . 4 - - - . . . .', '4 . 4 . 4 . 5 . 4 - - - . . . .', '5 . 5 . 5 . 4 . 3 - - - . . . .', '2 . 2 . 3 . 2 . 1 - - - . . . .'],
    leadVoice: 'saw', arpVoice: 'chip', arpLine: '. . . . 0 . . . . . . . 2 . . .' },
  // The Album Leaf: soft and warm, electric piano, glockenspiel, a brushed beat with a little swing
  slowtide: { name: 'SLOW TIDE', bpm: 84, root: 48, scale: 'major', prog: [0, 5, 3, 4], kit: 'break', pump: 0, swing: 0.1, padVoice: 'glass', echo: 0.45, feedback: 0.45,
    beat: { kick: 'x.......x.x.....', snare: '....x.......x...', ghost: '.......x.....x..', hat: '..x...x...x...x.' },
    bassVoice: 'sub', bassLine: '0 - - - - - - - 4 - - - - - - -',
    melody: ['. . . . 7 - - - . . . . 9 - - -', '. . . . 7 - - - . . . . 5 - - -', '. . . . 7 - - - . . . . 5 - - -', '. . . . 6 - - - . . . . 4 - - -'],
    melodyAt: 0, melodyOct: -1, leadVoice: 'bell', arpVoice: 'keys', arpLine: '0 . 2 . 4 . 2 . 3 . 2 . 1 . 2 .' },
  // Robyn, Dancing On My Own: pulsing eighth-note chords, four on the floor, claps, a bittersweet hook
  dancealone: { name: 'DANCE ALONE', bpm: 118, root: 42, scale: 'minor', prog: [0, 5, 2, 6], kit: '808', pump: 0.6, padVoice: 'none',
    beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', open: '......x.......x.' },
    bassVoice: 'pluck', bassLine: '0 . 7 . 0 . 7 . 0 . 7 . 0 . 7 .', stab: 'x.x.x.x.x.x.x.x.', stabVoice: 'saw',
    melody: ['. . 4 - 4 - 4 - 3 - 2 - . . . .', '. . 4 - 4 - 4 - 5 - 4 - . . . .', '. . 4 - 4 - 4 - 3 - 2 - . . 0 -', '2 - - - - - - - . . . . . . . .'],
    leadVoice: 'keys', arpVoice: 'glass', arpLine: '. . . . . . . . . . . . 3 . 4 .',
    // B (v13.16): the chorus, up on B C# D, a higher line, busier glass and open hats on the off-beats
    B: { prog: [3, 4, 5, 5], arpLine: '3 . 4 . 5 . 4 . 3 . 4 . 5 . 4 .',
      beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', open: '..x...x...x...x.' },
      melody: ['7 - 7 - 7 - 6 - 7 - - - 4 - - -', '8 - 8 - 8 - 7 - 8 - - - 4 - - -', '9 - 9 - 9 - 8 - 7 - - - 5 - - -', '7 - - - - - - - . . . . 4 - 5 -'] } },
  // Moby ("ah-ah") and Amiga cracktros: a breakbeat, "ah-ah" vocal stabs, a chip melody, fast chip arpeggios
  tracker: { name: 'TRACKER', bpm: 136, root: 40, scale: 'minor', prog: [0, 5, 3, 6], kit: 'break', drums: 'break', pump: 0.4, padVoice: 'none',
    bassVoice: 'sub', bassLine: '0 . . 0 . . 0 . . . 0 . 3 . . .', stab: 'x..x....x..x....', stabVoice: 'vox',
    melody: ['7 . 7 9 . 7 . 4 . . 5 . 4 . 2 .', '4 . 4 5 . 4 . 2 . . 0 . . . . .', '5 . 5 7 . 5 . 3 . . 4 . 3 . 0 .', '6 . 6 8 . 6 . 4 . . 5 . 4 . 1 .'],
    leadVoice: 'chip', arpVoice: 'chip', arp: 'up' },
  // Evanescence: light and haunting at first (a choir pad, a held sub bass, a piano figure from the start), then the
  // build: half-time rock drums, chugging power chords and a high glass line, the piano doubled up for bosses.
  // Every 4th time round the drums and bass drop out and the piano is alone again.
  hollow: { name: 'HOLLOW', bpm: 90, root: 40, scale: 'minor', prog: [0, 5, 2, 6], kit: 'industrial', pump: 0.2, padVoice: 'choir', breakdown: 4,
    echo: 0.5, feedback: 0.45,
    beat: { kick: 'x.........x.....', snare: '........x.......', hat: 'x...x...x...x...', ghost: '.............x.x' },
    bassVoice: 'sub', bassLine: '0 - - - - - - - - - - - 0 - 4 -',
    melody: ['0 - 4 - 7 - 4 - 2 - 4 - 7 - 4 -', '5 - 9 - 12 - 9 - 7 - 9 - 12 - 9 -', '2 - 6 - 9 - 6 - 4 - 6 - 9 - 6 -', '6 - 10 - 13 - 10 - 8 - 10 - 13 - 10 -'],
    melodyAt: 0, melodyOct: -1, leadVoice: 'keys',
    stab: 'x.x.xx.x.x.xx.x.', stabVoice: 'saw', stabAt: 2,
    arpVoice: 'glass', arpLine: '. . . . . . . . 5 - - - 4 - - -',
    // B (v13.16): the chorus. It lifts to C D Em, and a sung "ah" line takes over from the piano.
    B: { prog: [5, 6, 0, 0], leadVoice: 'vox', stab: 'x.x.x.x.x.x.x.x.',
      melody: ['7 - - - - - - - 9 - - - 7 - 6 -', '8 - - - - - - - 10 - - - 8 - 6 -', '7 - - - - - - - 4 - - - 6 - - -', '7 - - - - - - - . . . . . . . .'] } },
  // Three more (2026-10-25), not playing anywhere yet (the user picks):
  // Monkey Island: a lazy Caribbean bounce. One-drop reggae drums, an organ skank on the off-beats, a plucked
  // bass that walks the chord, and a steel-drum-ish bell tune (E minor: Em C D Em).
  lookbehind: { name: 'LOOK BEHIND YOU', bpm: 104, root: 40, scale: 'minor', prog: [0, 5, 6, 0], kit: 'break', pump: 0, padVoice: 'none', swing: 0.22, echo: 0.3,
    beat: { kick: '........x.......', snare: '........x.......', hat: '..x...x...x...x.', ghost: '.....x.......x..' },
    bassVoice: 'acid', bassLine: '0 - . 0 4 . . 2 0 - . . 4 . 6 .',
    stab: '..x...x...x...x.', stabVoice: 'organ', stabAt: 0,
    melody: ['4 . 7 . 7 . 6 7 9 . 7 . 4 - - .', '5 . 7 . 9 . 7 5 4 . 2 . 4 - - .', '6 . 8 . 10 . 8 6 5 . 4 . 3 . 2 .', '4 - 2 . 4 - 7 . 6 . 4 . 0 - - .'],
    leadVoice: 'bell', arpVoice: 'pluck', arpLine: '0 . 2 . 1 . 2 . 0 . 2 . 1 . 2 .', drums: 'trap' },
  // Pixel Grip: cold Chicago darkwave. Four on the floor, a sequenced 16th bass, a gated pad, and a deadpan
  // sung line that mostly sits on one note (A minor: Am Am F G).
  velvetrope: { name: 'VELVET ROPE', bpm: 122, root: 45, scale: 'minor', prog: [0, 0, 5, 6], kit: '808', pump: 0.4, padVoice: 'glass', echo: 0.28,
    beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.', open: '..............x.' },
    bassVoice: 'saw', bassLine: '0 0 7 0 0 0 7 0 0 0 7 0 0 7 0 7',
    gate: 'x.xx.x.xx.x.xx.x',
    melody: ['4 . 4 . 4 . 3 . 4 - - - . . . .', '4 . 4 . 4 . 3 . 2 - - - . . . .', '5 . 5 . 5 . 4 . 2 - - - 0 - - -', '6 . 6 . 6 . 5 . 4 - - - . . 3 4'],
    leadVoice: 'vox', stab: '......x.......x.', stabVoice: 'saw', stabAt: 2,
    arpVoice: 'glass', arpLine: '0 . 3 . 1 . 4 . 2 . 5 . 1 . 4 .' },
  // Nine Inch Nails again, the Closer / Downward Spiral side: slow and mechanical, a squelching bass, a pad
  // that stutters, a distorted lead that keeps falling (D phrygian). 120 bpm (the user, 2026-10-25).
  downward: { name: 'DOWNWARD', bpm: 120, root: 38, scale: 'phrygian', prog: [0, 0, 5, 1], kit: 'industrial', pump: 0.3, breakdown: 4, swing: 0.08, echo: 0.25,
    beat: { kick: 'x..x....x.x.....', snare: '....x.......x...', hat: '..x...x...x...x.', ghost: '.......x.......x', clap: '............x...' },
    bassVoice: 'acid', bassLine: '0 - - 0 . . 0 . 0 - . 7 . . 6 .',
    gate: 'x..x..x.x..x..x.',
    melody: ['7 - - - 6 - - - 5 - - - 4 - - -', '3 - - - 4 - - - 1 - - - - - - -', '7 - - - 6 - - - 5 - - - 4 - 5 -', '1 - - - - - - - 0 - - - - - - -'],
    melodyAt: 2, leadVoice: 'dist', arpLine: '0 0 . 0 0 . 1 . 0 0 . 0 2 . 1 .' },
});
