  // Engine demos: tracks that show off what the engine can do now (instruments, kits, grooves, meters).
  // They live only in this tool, not in the game. A track that's liked gets written into the game for real.
  const DEMOS = {
    demo_acid:    { name: 'ACID RAIN',      bpm: 124, root: 45, scale: 'minor',    prog: [0, 0, 5, 3], bass: 'acid', bassOct: true, bassVoice: 'acid', drums: 'four', kit: '808', padVoice: 'glass', arp: 'up', arpVoice: 'pluck', pump: 0.5 },
    demo_crypt:   { name: 'CRYPT ORGAN',    bpm: 100, root: 38, scale: 'harmonic', prog: [0, 5, 1, 4], bass: 'syncopated', bassVoice: 'sub', drums: 'half', kit: 'synth', padVoice: 'organ', arp: 'updown', arpVoice: 'bell', leadVoice: 'brass', pump: 0, echo: 0.42, feedback: 0.42 },
    demo_chip:    { name: 'CHIP RUNNER',    bpm: 140, root: 48, scale: 'major',    prog: [0, 5, 3, 4], bass: 'eighths', bassVoice: 'pluck', drums: 'four', kit: 'chip', padVoice: 'none', arp: 'up', arpVoice: 'chip', leadVoice: 'chip', pump: 0, echo: 0.21 },
    demo_rust:    { name: 'RUST BELT',      bpm: 96,  root: 40, scale: 'phrygian', prog: [0, 1, 0, 6], bass: 'gallop', bassVoice: 'picked', drums: 'heavy', kit: 'industrial', padVoice: 'choir', arp: 'down', arpVoice: 'pluck', leadVoice: 'dist', pump: 0.3 },
    demo_shanty:  { name: 'SEA LEGS',       bpm: 66,  root: 50, scale: 'dorian',   prog: [0, 6, 0, 4], meter: 6, bass: 'jig', bassVoice: 'picked', drums: 'shanty', kit: 'break', padVoice: 'organ', arp: 'updown', arpVoice: 'bell', leadVoice: 'brass', pump: 0, echo: 0.3 },
    demo_disco:   { name: 'ORBIT CLUB',     bpm: 120, root: 42, scale: 'minor',    prog: [0, 5, 2, 6], bass: 'offbeat', bassOct: true, bassVoice: 'pluck', drums: 'disco', kit: '808', padVoice: 'glass', arp: 'up', arpVoice: 'glass', leadVoice: 'bell', pump: 0.6, swing: 0.08 },
    demo_break:   { name: 'BROKEN SIGNAL',  bpm: 132, root: 43, scale: 'minor',    prog: [0, 3, 5, 4], bass: 'sparse', bassVoice: 'sub', drums: 'break', kit: 'break', padVoice: 'choir', arp: 'mirror', arpVoice: 'glass', leadVoice: 'square', pump: 0.2, swing: 0.18 },
    demo_waltz:   { name: 'CLOCKWORK WALTZ', bpm: 132, root: 45, scale: 'harmonic', prog: [0, 3, 4, 0], meter: 3, bass: 'waltz', bassVoice: 'sub', drums: 'waltz', kit: 'synth', padVoice: 'glass', arp: 'up', arpVoice: 'bell', leadVoice: 'bell', pump: 0 },
  };
  for (const k of Object.keys(DEMOS)) SONGS[k] = DEMOS[k];
