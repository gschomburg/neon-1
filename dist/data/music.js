// NeoN+1 data/music.js: Music: scales, every track, and which track plays where.
'use strict';
NEON_FILES.push(['data/music.js', 'v14.34']);

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
  // H3AV3N (2026-10-31): first picks from the G0D tracks below; the user picks the real ones
  maze: 'labyrinth', godfight: 'pursuit', g0dstand: 'lastbreath',   // (godfight: the G0D fight; the user: not just g0d)
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
  upword: { name: 'UPWORD', bpm: 120, root: 38, scale: 'minor', prog: [0, 4, 5, 3], kit: 'industrial', padVoice: 'none', pump: 0.0, breakdown: 0, swing: 0.00, echo: 0.25,
    beat: { kick: '..x. ..x. ..x. xxxx', snare: 'x...x...x...x...', hat: '..x...x...x...x.', ghost: '.......x.......x', clap: '............x...' },
    bassVoice: 'pluck', bassLine: '0 . 0 . 0 . 0 . 0 . 0 . 0 . 0 .',
    melody: ['5 4 3 4 3 2 3 2 1 2 1 0 1 2 3 4', '6 5 4 5 4 3 4 3 2 3 2 1 2 1 0 4', '5 4 3 4 3 2 3 2 1 2 1 0 1 2 3 4', '5 4 3 4 3 2 3 2 1 2 1 0 1 2 3 4'],
    melodyAt: 2, leadVoice: 'saw', arpLine: '0 0 . 0 0 . 0 . 0 0 . 0 0 . 0 .' },
});

// SEA LEGS (from the music tool's demo_shanty): one of the PIER tracks (engine/boot.js, FISH_TRACKS in engine/fishing.js)
SONGS.sealegs = { name: 'SEA LEGS', bpm: 66, root: 50, scale: 'dorian', prog: [0, 6, 0, 4], meter: 6, bass: 'jig', bassVoice: 'picked', drums: 'shanty', kit: 'break', padVoice: 'organ', arp: 'updown', arpVoice: 'bell', leadVoice: 'brass', pump: 0, echo: 0.3 };

// ---------------- The G0D fights (2026-10-31) ----------------
// The user: "energetic but also menacing... the maze can be more mysterious, the boss fight and the last stand should
// be good... the fight tracks should ramp up per stage... real variety... high energy, Daft Punk or NIN are always a plus."
// 15 for the fight, 3 for the final stand, 3 for the maze; the user picks (MUSIC_FOR maze / g0d / g0dstand).
// The fight tracks are staged (stages: true, engine/music.js): A plays in stage 1, B in stage 2, C in stage 3 (the new
// one starts at the next bar, on a crash). The final stand's are staged too, by thirds of its 15s clock, and tick: true
// (the clock pushes the tempo). tag: 'g0d' groups them in the tools.
Object.assign(SONGS, {
  // ---- the fight ----
  // 1. Daft Punk, Tron: Legacy (Derezzed): a 16th octave bass under a gritty staccato riff; brass hits come in, then the
  // bass goes acid, the hats go 16ths and the riff turns into a held supersaw line.
  godmode: { name: 'GOD MODE', tag: 'g0d', stages: true, bpm: 128, root: 38, scale: 'minor', prog: [0, 0, 5, 6], kit: '808', pump: 0.6, padVoice: 'glass',
    beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.' },
    bassVoice: 'saw', bassLine: '0 7 0 7 0 7 0 7 0 7 0 7 0 7 0 7',
    melody: ['0 . 0 . 3 . 0 . 5 . 0 . 3 . 2 .', '0 . 0 . 3 . 0 . 7 . 6 . 5 . 3 .'], leadVoice: 'dist',
    arpVoice: 'chip', arpLine: '. . 3 . . . 4 . . . 5 . . . 4 .',
    B: { stab: 'x..x..x...x..x..', stabVoice: 'brass',
      beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', open: '..x...x...x...x.' },
      melody: ['7 . 7 . 10 . 7 . 12 . 7 . 10 . 9 .', '7 . 7 . 10 . 7 . 14 . 13 . 12 . 10 .'] },
    C: { prog: [0, 5, 3, 6], bassVoice: 'acid', bassLine: '0 0 7 0 0 7 0 0 7 0 0 7 0 7 0 7', gate: 'x.xx.xx.x.xx.xx.', stab: 'x..x..x...x..x..', stabVoice: 'brass',
      beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', open: '..x...x...x...x.' },
      melody: ['7 - 6 - 7 - 10 - 9 - 7 - 6 - 3 -', '7 - 6 - 7 - 10 - 12 - - - 10 - 9 -'], leadVoice: 'saw' } },
  // 2. Nine Inch Nails (March of the Pigs, Wish): fast and lurching, the snare off where you expect it, a chugging
  // phrygian riff, a distorted lead that bites; stage 2 adds the choir and claps; stage 3 is a wall: double kick,
  // 16th hats, an acid bass and a screaming line way up.
  killswitch: { name: 'KILL SWITCH', tag: 'g0d', stages: true, bpm: 142, root: 40, scale: 'phrygian', prog: [0, 0, 1, 0], kit: 'industrial', pump: 0.2, padVoice: 'none',
    beat: { kick: 'x.x...x.x.x...x.', snare: '....x..x....x...', hat: 'x.x.x.x.x.x.x.x.' },
    bassVoice: 'picked', bassLine: '0 0 . 0 0 . 1 . 0 0 . 0 3 . 1 .',
    melody: ['. . . . . . . . 7 - 8 - 7 - . .', '. . . . . . . . 10 - 8 - 7 - 5 -'], melodyAt: 2, leadVoice: 'dist',
    arpVoice: 'pluck', arpLine: '0 . 0 . 1 . 0 . 0 . 0 . 2 . 1 .',
    B: { padVoice: 'choir', beat: { kick: 'x.x...x.x.x...x.', snare: '....x..x....x...', clap: '............x...', hat: 'x.x.x.x.x.x.x.x.', open: '..............x.' },
      melody: ['7 . 7 . 8 . 7 . 5 . 4 . 3 . 1 .', '7 . 7 . 8 . 10 . 8 - 7 - 5 - 4 -'] },
    C: { padVoice: 'choir', bassVoice: 'acid', bassLine: '0 0 0 0 1 1 0 0 0 0 0 0 3 3 1 1',
      beat: { kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x..x', ghost: '..x.......x.....', hat: 'xxxxxxxxxxxxxxxx' },
      melody: ['14 - 13 - 12 - 13 - 10 - - - 8 - 7 -', '14 - 13 - 12 - 13 - 15 - - - 14 - - -'] } },
  // 3. Goblin at full tilt (Tenebre): a prog bass ostinato, an organ, a music box that turns into a vocoder line and then
  // a distorted harmonic-minor run.
  moldbloom: { name: 'MOLD BLOOM', tag: 'g0d', stages: true, bpm: 150, root: 45, scale: 'harmonic', prog: [0, 0, 5, 4], kit: 'break', pump: 0, padVoice: 'organ', echo: 0.3, feedback: 0.35,
    beat: { kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
    bassVoice: 'picked', bassLine: '0 . 7 . 5 . 7 . 6 . 7 . 5 . 4 .',
    melody: ['7 . 9 . 11 . 9 . 7 . 9 . 11 . 9 .', '7 . 9 . 11 . 9 . 6 - - - . . . .'], leadVoice: 'bell',
    arpVoice: 'pluck', arpLine: '. . . . . . . . 0 . 1 . 2 . 1 .',
    B: { leadVoice: 'vox', stab: 'x...x...x...x...', stabVoice: 'organ',
      beat: { kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx' },
      melody: ['11 - - - 10 - - - 9 - - - 8 - - -', '9 - - - 8 - - - 7 - - - 6 - 7 -'] },
    C: { bassVoice: 'acid', bassLine: '0 7 5 7 6 7 5 7 0 7 5 7 6 7 5 4', leadVoice: 'dist', stab: 'x...x...x...x...', stabVoice: 'organ',
      beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', open: '..x...x...x...x.' },
      melody: ['7 9 11 9 7 9 11 9 6 8 11 8 6 8 11 8', '7 9 11 9 7 9 11 9 12 11 9 8 7 - - -'] } },
  // 4. Justice (Genesis, Phantom): a heavy pumping groove, fat distorted saw stabs on the off-beats, a brass hook;
  // stage 3 chops the pad and goes acid.
  overclock: { name: 'OVERCLOCK', tag: 'g0d', stages: true, bpm: 118, root: 41, scale: 'minor', prog: [0, 0, 3, 4], kit: '808', pump: 0.9, padVoice: 'none',
    beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.' },
    bassVoice: 'saw', bassLine: '0 - - 0 - - 0 - 0 - - 0 - - 7 -',
    stab: 'x..x..x...x.....', stabVoice: 'saw', stabAt: 0,
    melody: ['0 - - - . . . . 3 - 2 - 0 - . .', '0 - - - . . . . 5 - 3 - 2 - . .'], leadVoice: 'brass',
    arpVoice: 'chip', arpLine: '. . . . . . . . . . . . 3 . 4 .',
    B: { stab: 'x.xx.x.xx.x.x.x.', beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.', open: '......x.......x.' },
      melody: ['7 - - - . . 7 . 8 - 7 - 5 - 3 -', '7 - - - . . 7 . 10 - 8 - 7 - 5 -'] },
    C: { padVoice: 'saw', gate: 'x.x.x.x.x.x.x.x.', bassVoice: 'acid', bassLine: '0 0 0 0 0 0 7 0 0 0 0 0 0 0 7 7', leadVoice: 'dist', stab: 'x.xx.x.xx.x.x.x.',
      beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', open: '..x...x...x...x.' },
      melody: ['10 - 10 - 8 - 7 - 10 - 10 - 12 - 10 -', '10 - 10 - 8 - 7 - 5 - - - 3 - 2 -'] } },
  // 5. Carpenter Brut / Perturbator (darksynth): half-time and huge at first, an octave saw bass, a fast square arp;
  // stage 2 goes four on the floor with brass; stage 3 double kick and a distorted lead.
  rootaccess: { name: 'ROOT ACCESS', tag: 'g0d', stages: true, bpm: 112, root: 38, scale: 'harmonic', prog: [0, 0, 5, 4], kit: 'industrial', pump: 0.5, padVoice: 'saw',
    beat: { kick: 'x.........x.....', snare: '........x.......', hat: 'x.x.x.x.x.x.x.x.' },
    bassVoice: 'saw', bassLine: '0 0 7 0 0 7 0 0 0 0 7 0 0 7 0 0',
    arpVoice: 'square', arpLine: '0 1 2 3 4 5 4 3 2 1 0 1 2 3 4 5',
    melody: ['4 - - - - - 3 - 2 - - - 1 - - -', '0 - - - - - - - -1 - - - . . . .'], leadVoice: 'saw',
    B: { stab: 'x.......x.......', stabVoice: 'brass', beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
      melody: ['7 - - - - - 6 - 4 - - - 3 - - -', '4 - - - 2 - - - 1 - - - - - - -'] },
    C: { bassVoice: 'acid', leadVoice: 'dist', stab: 'x...x...x...x...', stabVoice: 'brass',
      beat: { kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx' },
      melody: ['11 - - - 10 - 9 - 7 - - - 6 - 7 -', '11 - - - 10 - 11 - 14 - - - - - - -'] } },
  // 6. Mick Gordon (DOOM): 5/4, a palm-muted chug that keeps tripping over the bar, choir; stage 2 a sung line; stage 3
  // the kick goes double and the bass goes acid under a screaming lead.
  falseidol: { name: 'FALSE IDOL', tag: 'g0d', stages: true, bpm: 130, meter: 5, root: 36, scale: 'phrygian', prog: [0, 0, 1, 0], kit: 'industrial', pump: 0.3, padVoice: 'choir',
    beat: { kick: 'x..x..x...x..x..x...', snare: '......x.........x...', hat: 'x.x.x.x.x.x.x.x.x.x.' },
    bassVoice: 'picked', bassLine: '0 0 . 0 0 . 0 . 1 . 0 0 . 0 0 . 3 . 1 .',
    melody: ['. . . . . . . . . . 7 - 8 - 7 - 5 - 4 -', '. . . . . . . . . . 7 - 8 - 10 - 8 - 7 -'], melodyAt: 2, leadVoice: 'dist',
    arpVoice: 'pluck', arpLine: '0 . . 0 . . 1 . . . 0 . . 0 . . 2 . 1 .',
    B: { leadVoice: 'vox', stab: 'x.........x.........', stabVoice: 'saw',
      melody: ['7 - - - - - - - - - 8 - - - - - 7 - 5 -', '4 - - - - - - - - - 3 - - - - - 1 - - -'] },
    C: { bassVoice: 'acid', bassLine: '0 0 0 0 0 0 0 0 1 1 0 0 0 0 0 0 3 3 1 1', leadVoice: 'dist', stab: 'x.........x.........', stabVoice: 'saw',
      beat: { kick: 'x.x.x.x.x.x.x.x.x.x.', snare: '....x.......x.....x.', hat: 'xxxxxxxxxxxxxxxxxxxx' },
      melody: ['14 - 13 - 12 - 13 - 10 - - - 8 - 7 - 8 - 10 -', '14 - 13 - 12 - 13 - 15 - - - 14 - - - 12 - - -'] } },
  // 7. Castlevania meets techno: four on the floor, an organ skanking on the off-beats, a choir, a pulse-wave hook that
  // turns to brass, then a supersaw.
  cathedral: { name: 'CATHEDRAL.EXE', tag: 'g0d', stages: true, bpm: 136, root: 45, scale: 'harmonic', prog: [0, 5, 6, 4], kit: '808', pump: 0.5, padVoice: 'choir',
    beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.' },
    bassVoice: 'pluck', bassLine: '0 . 7 . 0 . 7 . 0 . 7 . 0 . 7 .',
    stab: '..x...x...x...x.', stabVoice: 'organ', stabAt: 0,
    melody: ['7 . 6 . 7 . 4 . 3 . 4 . 2 . 0 .', '7 . 6 . 7 . 9 . 10 - 9 - 7 - . .'], leadVoice: 'square',
    arpVoice: 'bell', arpLine: '. . . . 3 . . . . . . . 5 . . .',
    B: { leadVoice: 'brass', arpLine: '0 . 2 . 4 . 2 . 3 . 5 . 3 . 1 .',
      beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', open: '..x...x...x...x.' },
      melody: ['7 - 6 - 7 - 9 - 10 - 9 - 7 - 6 -', '7 - 6 - 7 - 4 - 6 - - - . . . .'] },
    C: { leadVoice: 'saw', bassVoice: 'saw', bassLine: '0 0 7 0 0 7 0 0 7 0 0 7 0 7 0 7', arpLine: '0 1 2 3 4 5 4 3 0 1 2 3 4 5 4 3',
      beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', open: '..x...x...x...x.' },
      melody: ['14 - 13 - 14 - 11 - 10 - 11 - 9 - 7 -', '14 - 13 - 14 - 16 - 17 - - - 14 - - -'] } },
  // 8. The Prodigy (Firestarter, Breathe): a rolling breakbeat, a squelching acid riff, a shouted "hey" stab; stage 3
  // the break doubles up and the riff goes 16ths.
  hivemind: { name: 'HIVE MIND', tag: 'g0d', stages: true, bpm: 138, root: 40, scale: 'phrygian', prog: [0, 0, 0, 1], kit: 'break', pump: 0.3, padVoice: 'none',
    beat: { kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.xxx.xxx.xxx.xx', ghost: '.......x......x.' },
    bassVoice: 'acid', bassLine: '0 . . 0 . . 3 . 0 . . 0 . 5 3 .',
    stab: 'x.....x.........', stabVoice: 'vox', stabAt: 0,
    melody: ['0 . 0 3 . 0 . 5 . . 3 . 1 . 0 .', '0 . 0 3 . 0 . 7 . . 5 . 3 . 1 .'], melodyAt: 2, leadVoice: 'dist',
    arpVoice: 'chip', arpLine: '. . . . . . . . . . . . 3 4 5 4',
    B: { stab: 'x.....x...x.....', padVoice: 'choir', arpLine: '0 . 3 . 0 . 4 . 0 . 3 . 5 . 4 .' },
    C: { bassLine: '0 0 3 0 0 3 0 5 0 0 3 0 0 5 3 1', stab: 'x.....x...x...x.',
      beat: { kick: 'x.x...x.x.x...x.', snare: '....x.......x.x.', hat: 'xxxxxxxxxxxxxxxx', ghost: '..x....x......x.' },
      melody: ['7 . 7 10 . 7 . 12 . . 10 . 8 . 7 .', '7 . 7 10 . 7 . 14 . . 12 . 10 . 8 .'] } },
  // 9. Deus Ex (UNATCO): a cool breakbeat, a sub bass with room in it, bells and an electric piano; it gets less cool:
  // brass and keys stabs, then an acid bass and a supersaw.
  augment: { name: 'AUGMENT', tag: 'g0d', stages: true, bpm: 125, root: 43, scale: 'minor', prog: [0, 0, 5, 4], kit: 'break', pump: 0.3, padVoice: 'glass', echo: 0.4,
    beat: { kick: 'x.........x.x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', ghost: '.......x.......x' },
    bassVoice: 'sub', bassLine: '0 - - . . . 0 . . . 0 - 3 - . .',
    arpVoice: 'bell', arpLine: '0 . 2 . 4 . 2 . 3 . 5 . 3 . 1 .',
    melody: ['4 - - - 3 - 2 - 0 - - - . . . .', '2 - - - 3 - 4 - 6 - - - 4 - - -'], leadVoice: 'keys',
    B: { leadVoice: 'brass', stab: '....x.......x...', stabVoice: 'keys',
      beat: { kick: 'x.........x.x...', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', ghost: '.......x.......x' },
      melody: ['7 - - - 6 - 4 - 7 - - - 9 - - -', '7 - - - 6 - 4 - 3 - - - 2 - - -'] },
    C: { bassVoice: 'acid', bassLine: '0 0 . 0 . 0 0 . 0 0 . 0 3 . 2 .', leadVoice: 'saw', stab: '....x.......x...', stabVoice: 'keys',
      beat: { kick: 'x...x...x.x.x...', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', open: '..x.......x.....' },
      melody: ['11 - - - 10 - 9 - 7 - - - 9 - 10 -', '11 - - - 13 - 14 - 11 - - - - - - -'] } },
  // 10. Drum and bass (Pendulum): 172, a two-step break, a long rolling sub, a saw line; then the reese bass and a glass
  // arp racing; then everything with stabs and a distorted lead.
  terminalvelocity: { name: 'TERMINAL VELOCITY', tag: 'g0d', stages: true, bpm: 172, root: 38, scale: 'minor', prog: [0, 0, 5, 3], kit: 'break', pump: 0.4, padVoice: 'saw',
    beat: { kick: 'x.........x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', ghost: '.......x.x....x.' },
    bassVoice: 'sub', bassLine: '0 - - - - - - - 0 - - - 5 - 3 -',
    melody: ['7 - - - - - - - 6 - - - 4 - - -', '3 - - - - - - - 4 - - - 6 - - -'], melodyAt: 2, leadVoice: 'saw',
    arpVoice: 'glass', arpLine: '. . . . 3 . . . . . . . 4 . . .',
    B: { bassVoice: 'saw', bassLine: '0 - - 0 - - 0 - 0 - - 0 - 7 0 -', arpLine: '0 1 2 3 4 5 4 3 2 1 2 3 4 5 4 3' },
    C: { bassVoice: 'acid', bassLine: '0 - 0 0 - 0 0 - 0 - 0 0 - 7 5 3', stab: 'x.....x.........', stabVoice: 'saw', leadVoice: 'dist', arpLine: '0 1 2 3 4 5 4 3 2 1 2 3 4 5 4 3',
      beat: { kick: 'x.........x.x...', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', ghost: '.......x.x....x.', open: '..............x.' },
      melody: ['14 - - - 13 - - - 11 - - - 10 - - -', '10 - - - 11 - - - 13 - - - 14 - - -'] } },
  // 11. A danse macabre in 6/8: a tarantella gallop (Paganini on a church organ), a music-box run; brass; then
  // everything at once.
  dansemacabre: { name: 'DANSE MACABRE', tag: 'g0d', stages: true, bpm: 92, meter: 6, root: 45, scale: 'harmonic', prog: [0, 0, 5, 4], kit: 'break', pump: 0, padVoice: 'organ', echo: 0.3,
    beat: { kick: 'x.....x.....', snare: '......x.....', hat: 'x.x.x.x.x.x.' },
    bassVoice: 'picked', bassLine: '0 . 4 . 7 . 0 . 4 . 7 .',
    melody: ['7 9 11 12 11 9 7 9 11 12 11 9', '8 9 11 8 9 11 7 - - . . .'], leadVoice: 'keys',
    arpVoice: 'pluck', arpLine: '. . . 2 . . . . . 1 . .',
    B: { leadVoice: 'brass', stab: 'x.....x.....', stabVoice: 'organ',
      beat: { kick: 'x.....x.....', snare: '...x.....x..', hat: 'xxxxxxxxxxxx' },
      melody: ['14 - - 12 - - 11 - - 9 - -', '11 - - 12 - - 14 - - - - -'] },
    C: { bassVoice: 'acid', bassLine: '0 4 7 0 4 7 0 4 7 0 4 7', leadVoice: 'dist', stab: 'x.....x.....', stabVoice: 'organ',
      beat: { kick: 'x..x..x..x..', snare: '...x.....x..', hat: 'xxxxxxxxxxxx', open: '.....x.....x' },
      melody: ['14 16 18 19 18 16 14 16 18 19 18 16', '15 16 18 15 16 18 14 - - - - -'] } },
  // 12. Skrillex / riddim: half-time 150, a stuttering acid bass, a screamer in the gaps; then the wobble goes 16ths
  // under a vocal stab; then the hats roll and the screamer goes up.
  zeroday: { name: 'ZERO DAY', tag: 'g0d', stages: true, bpm: 150, root: 41, scale: 'minor', prog: [0, 0, 5, 6], kit: '808', pump: 0.4, padVoice: 'choir',
    beat: { kick: 'x.........x.....', snare: '........x.......', hat: 'x.x.x.x.x.x.xxx.' },
    bassVoice: 'acid', bassLine: '0 . 0 0 . 0 . . 3 3 . 3 . 1 1 .',
    melody: ['. . . . . . . . 7 - 8 - 7 - 5 -', '. . . . . . . . 10 - 8 - 7 - 3 -'], melodyAt: 2, leadVoice: 'dist',
    arpVoice: 'chip', arpLine: '. . . . . . . . . . . . 3 4 5 4',
    B: { bassLine: '0 0 0 0 0 0 0 0 3 3 3 3 1 1 1 1', stab: '....x.......x...', stabVoice: 'vox' },
    C: { bassLine: '0 0 0 0 0 0 0 0 3 3 3 3 1 1 1 1', stab: '....x.......x...', stabVoice: 'vox',
      beat: { kick: 'x.........x.x...', snare: '........x.......', hat: 'xxxxxxxxxxxxxxxx', open: '......x.......x.' },
      melody: ['12 - 11 - 12 - 15 - 14 - 12 - 11 - 8 -', '12 - 11 - 12 - 15 - 17 - - - 15 - - -'] } },
  // 13. Gesaffelstein (Pursuit): cold dark techno, a kick and metal, an off-beat bass, one menacing half step in brass;
  // the bass fills in to 16ths; then the pad chops and a distorted line comes in.
  pursuit: { name: 'PURSUIT', tag: 'g0d', stages: true, bpm: 126, root: 36, scale: 'phrygian', prog: [0, 0, 0, 1], kit: 'industrial', pump: 0.8, padVoice: 'none',
    beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.' },
    bassVoice: 'saw', bassLine: '. . 0 . . . 0 . . . 0 . . . 0 .',
    melody: ['0 - - - - - - - . . . . . . . .', '1 - - - - - - - . . . . 0 - - -'], melodyAt: 1, leadVoice: 'brass',
    arpVoice: 'pluck', arpLine: '. . . . . . . . . . 0 . . . . .',
    B: { bassVoice: 'acid', bassLine: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
      beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx' },
      melody: ['7 - - - - - - - 8 - - - 7 - - -', '7 - - - - - - - 5 - - - 4 - - -'] },
    C: { bassVoice: 'acid', bassLine: '0 0 0 0 0 0 0 0 0 0 0 0 1 1 0 0', padVoice: 'saw', gate: 'x..x..x.x..x..x.', leadVoice: 'dist',
      beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', open: '..x...x...x...x.' },
      melody: ['7 - 8 - 7 - 5 - 7 - 8 - 10 - 8 -', '7 - 8 - 7 - 5 - 4 - - - 1 - - -'] } },
  // 14. Hans Zimmer (braams): slow and enormous, a brass BRAAM each bar over galloping strings, a choir; stage 2 more
  // braams and drums; stage 3 double time with a brass line on top.
  pantheon: { name: 'PANTHEON', tag: 'g0d', stages: true, bpm: 100, root: 38, scale: 'minor', prog: [0, 0, 5, 6], kit: 'industrial', pump: 0.2, padVoice: 'choir', echo: 0.45, feedback: 0.4,
    beat: { kick: 'x.......x.......', snare: '........x.......', hat: '....x.......x...' },
    stab: 'x...............', stabVoice: 'brass', stabAt: 0,
    bassVoice: 'saw', bassLine: '0 . 0 0 . 0 0 . 0 . 0 0 . 0 0 .',
    melody: ['0 - - - - - - - 3 - - - 2 - - -', '0 - - - - - - - -2 - - - -1 - - -'], melodyAt: 1, leadVoice: 'vox',
    arpVoice: 'bell', arpLine: '. . . . . . . . . . . . . . . .',
    B: { stab: 'x.......x.......', beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
      arpLine: '0 0 1 0 0 1 2 0 0 2 1 0 0 1 2 1',
      melody: ['7 - - - - - - - 5 - - - 3 - - -', '7 - - - - - - - 8 - - - 7 - - -'] },
    C: { stab: 'x...x...x...x...', leadVoice: 'brass', arpLine: '0 0 1 0 0 1 2 0 0 2 1 0 0 1 2 1',
      beat: { kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx' },
      melody: ['7 - - - 8 - - - 10 - - - 9 - 8 -', '7 - - - - - - - 5 - - - 4 - - -'] } },
  // 15. Chiptune metal (a robot boss stage): 164, chip drums, a chip octave bass, a fast pulse melody; stage 2 a gallop
  // and a square lead; stage 3 double kick and the melody an octave up.
  overflow: { name: 'OVERFLOW', tag: 'g0d', stages: true, bpm: 164, root: 45, scale: 'minor', prog: [0, 5, 3, 4], kit: 'chip', pump: 0, padVoice: 'none',
    beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
    bassVoice: 'pluck', bassLine: '0 0 7 0 0 7 0 0 7 0 0 7 0 7 0 7',
    arpVoice: 'chip', arp: 'up',
    melody: ['7 . 6 7 . 4 . 3 4 . 2 . 0 - - -', '5 . 4 5 . 7 . 9 10 . 9 . 7 - - -'], leadVoice: 'chip',
    B: { leadVoice: 'square', bassLine: '0 . 0 0 . 0 0 . 0 . 0 0 . 7 0 7',
      melody: ['9 . 7 9 . 11 . 12 11 . 9 . 7 - - -', '5 . 4 5 . 7 . 9 10 . 12 . 14 - - -'] },
    C: { leadVoice: 'square', bassLine: '0 0 7 0 0 7 0 0 7 0 0 7 0 7 0 7',
      beat: { kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx' },
      melody: ['14 . 13 14 . 11 . 10 11 . 9 . 7 - - -', '12 . 11 12 . 14 . 16 17 . 16 . 14 - - -'] } },

  // ---- the final stand (~15s: staged by thirds of its clock; tick: the clock pushes the tempo) ----
  // A relentless 16th sub pulse and a rising glass arp; then a long climbing line; then a snare roll and a screamer.
  lastbreath: { name: 'LAST BREATH', tag: 'g0d', stages: true, tick: true, bpm: 160, root: 40, scale: 'minor', prog: [0, 5], kit: '808', pump: 0.7, padVoice: 'saw',
    beat: { kick: 'x...x...x...x...', hat: '..x...x...x...x.' },
    bassVoice: 'sub', bassLine: '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
    arpVoice: 'glass', arpLine: '0 1 2 3 4 5 4 3 0 1 2 3 4 5 4 3',
    melody: ['. . . . . . . . . . . . . . . .'], leadVoice: 'saw',
    B: { beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx' },
      melody: ['7 - - - 8 - - - 9 - - - 10 - - -', '10 - - - 11 - - - 12 - - - 13 - - -'] },
    C: { bassVoice: 'acid', leadVoice: 'dist', stab: 'x...x...x...x...', stabVoice: 'saw',
      beat: { kick: 'x...x...x...x...', snare: 'xxxxxxxxxxxxxxxx', hat: 'xxxxxxxxxxxxxxxx', open: '..x...x...x...x.' },
      melody: ['14 - 13 - 14 - 15 - 14 - 13 - 12 - 11 -', '14 - 15 - 16 - 17 - 18 - - - - - - -'] } },
  // A clock: half-time with ticking hats and a heartbeat bass; then four on the floor and brass; then everything,
  // a siren up top.
  countdown: { name: 'COUNTDOWN', tag: 'g0d', stages: true, tick: true, bpm: 140, root: 38, scale: 'phrygian', prog: [0, 1], kit: 'industrial', pump: 0.4, padVoice: 'choir',
    beat: { kick: 'x.......x.......', hat: 'x.x.x.x.x.x.x.x.' },
    bassVoice: 'picked', bassLine: '0 . . . 0 . . . 0 . . . 0 . 1 .',
    melody: ['. . . . . . . . . . . . . . . .'], leadVoice: 'vox',
    arpVoice: 'pluck', arpLine: '. . . . . . . . . . . . 0 . . .',
    B: { bassVoice: 'acid', bassLine: '0 . 0 . 0 . 0 . 0 . 0 . 1 . 0 .', stab: 'x.......x.......', stabVoice: 'brass',
      beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
      melody: ['7 - - - - - - - 8 - - - - - - -'] },
    C: { bassVoice: 'acid', bassLine: '0 0 0 0 0 0 0 0 1 1 1 1 0 0 0 0', stab: 'x...x...x...x...', stabVoice: 'brass',
      beat: { kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx' },
      melody: ['14 - - - 15 - - - 14 - - - 15 - - -'] } },
  // The chords climb a step every bar and don't come back: a choir and a pluck; the drums; then everything, up a third.
  eventhorizon: { name: 'EVENT HORIZON', tag: 'g0d', stages: true, tick: true, bpm: 150, root: 41, scale: 'harmonic', prog: [0, 1, 2, 3], kit: 'break', pump: 0.5, padVoice: 'choir',
    beat: { kick: 'x.......x.......', hat: '....x.......x...' },
    bassVoice: 'sub', bassLine: '0 - - - - - - - 0 - - - 0 - 0 -',
    arpVoice: 'pluck', arpLine: '0 . 1 . 2 . 3 . 4 . 5 . 4 . 3 .',
    melody: ['7 - - - - - - - . . . . . . . .'], leadVoice: 'vox',
    B: { prog: [2, 3, 4, 5], beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' }, bassLine: '0 . 0 . 0 . 0 . 0 . 0 . 0 . 7 .',
      melody: ['7 - - - 8 - - - 9 - - - 10 - - -'] },
    C: { prog: [4, 5, 6, 7], bassVoice: 'saw', bassLine: '0 0 7 0 0 7 0 0 7 0 0 7 0 7 0 7', leadVoice: 'saw', stab: 'x...x...x...x...', stabVoice: 'saw',
      beat: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', open: '..x...x...x...x.' },
      melody: ['14 - - - 13 - - - 14 - - - 16 - - -'] } },

  // ---- the maze (mysterious; it builds a layer as you go deeper: levels 1-3) ----
  // A music box in A harmonic minor over a choir and a held sub; a heartbeat kick; glass in the echo. B drifts to
  // the VI and the V.
  labyrinth: { name: 'LABYRINTH', tag: 'g0d', bpm: 88, root: 45, scale: 'harmonic', prog: [0, 0, 3, 4], kit: 'synth', pump: 0, padVoice: 'choir', echo: 0.55, feedback: 0.5,
    beat: { kick: 'x.........x.....', hat: '....x.......x...' },
    bassVoice: 'sub', bassLine: '0 - - - - - - - - - - - 0 - - -',
    melody: ['7 . . 9 . . 11 . 12 - - - . . . .', '11 . . 9 . . 8 . 9 - - - . . . .', '7 . . 9 . . 11 . 12 - - - 14 - - -', '13 . . 11 . . 9 . 8 - - - . . . .'], melodyAt: 0, leadVoice: 'bell',
    arpVoice: 'glass', arpLine: '. . . . 5 . . . . . . . 3 . . .',
    form: 'AABA', B: { prog: [5, 5, 4, 4], melody: ['12 - - - 11 - - - 9 - - - 8 - - -', '9 - - - 11 - - - 12 - - - - - - -'] } },
  // 5/4, D dorian: a pluck ostinato that never sits where you think, an electric piano that wanders in later.
  codex: { name: 'CODEX', tag: 'g0d', bpm: 108, meter: 5, root: 38, scale: 'dorian', prog: [0, 0, 6, 4], kit: 'break', pump: 0, padVoice: 'glass', echo: 0.45, feedback: 0.45,
    beat: { kick: 'x.........x.........', snare: '..........x.........', hat: '....x.......x.....x.' },
    bassVoice: 'sub', bassLine: '0 - - - - - - - - - 0 - - - - - 4 - - -',
    arpVoice: 'pluck', arpLine: '0 . 2 . 4 . 0 . 2 . 4 . 5 . 4 . 2 . 1 .',
    melody: ['9 - - - - - 8 - - - 7 - - - - - 5 - - -', '6 - - - - - 7 - - - 4 - - - - - - - - -'], melodyAt: 2, leadVoice: 'keys' },
  // E phrygian, slow: a whispered choir that chants on two notes, a picked heartbeat in the bass, a "vox" breath on
  // the bar; a metal tick.
  whispernet: { name: 'WHISPER NET', tag: 'g0d', bpm: 96, root: 40, scale: 'phrygian', prog: [0, 0, 1, 0], kit: 'industrial', pump: 0.1, padVoice: 'choir', echo: 0.5, feedback: 0.5,
    beat: { kick: 'x..x............', hat: '........x.......' },
    bassVoice: 'picked', bassLine: '0 . . 0 . . . . . . . . . . . .',
    stab: '........x.......', stabVoice: 'vox', stabAt: 0,
    melody: ['0 - - - - - - - 1 - - - - - - -', '3 - - - 1 - - - 0 - - - - - - -'], melodyAt: 1, leadVoice: 'vox',
    arpVoice: 'bell', arpLine: '. . . . . . . . . . . . . . 4 .' },
});
