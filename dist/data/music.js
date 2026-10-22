// NeoN+1 data/music.js: Music: scales, every track, and which track plays where.
'use strict';
NEON_FILES.push(['data/music.js', 'v12.18']);

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
  meltdown:   { name: 'MELTDOWN',       bpm: 112, root: 38, scale: 'harmonic', prog: [0, 5, 1, 4], bass: 'gallop',  drums: 'heavy', arp: 'down' },
};
// Where each track plays: menus, the map (+ market, caches, safehouses), and each corp.
const MUSIC_FOR = {
  menu: 'night_rain', map: 'gridlock',
  omni: 'meltdown',
};
