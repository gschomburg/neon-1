// NeoN+1 corps/lagrange.js
'use strict';
NEON_FILES.push(['corps/lagrange.js', 'v13.17']);
// Its boss mod: PRECOG (precog), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
function lagSlide(lv) {
  const now = performance.now();
  for (const t of lv.tiles) {
    const wrap = t.col === lv.cols - 1;
    slideTo(lv, t, lagNext(lv, t), 300);
    if (wrap) { t.slide = null; t.wrapAt = now; }   // wraps around: jumps to the left edge (no drawing off the board)
  }
  Sound.whoosh();
}
// a tap that waited for the slide: whatever is in that cell now gets picked
function lagLand(lv, cell) {
  const i = lv.tiles.findIndex(t => t.cell === cell && t.state === 'closed');
  if (i < 0) { setMsg('> lag: it landed on nothing.', C.mid); Sound.deny(); return; }
  st.lagBypass = true;
  pick(i);
}

// ---- its music
// Made from HOLLOW: the same band, its own tune.
SONGS.farside = { name: 'FAR SIDE', from: 'hollow', bpm: 70, root: 45, scale: 'minor', prog: [0, 6, 5, 6], sevenths: true, kit: 'industrial', pump: 0.2, padVoice: 'choir', breakdown: 3, echo: 0.7, feedback: 0.6,
  beat: { kick: 'x.........x.....', snare: '........x.......', hat: '....x.......x...' },
  bassVoice: 'sub', bassLine: '0 - - - - - - - - - - - 0 - - -',
  melody: ['0 - 4 - 7 - 9 - 7 - 4 - 2 - 4 -', '6 - 10 - 13 - 15 - 13 - 10 - 8 - 10 -', '5 - 9 - 12 - 14 - 12 - 9 - 7 - 9 -', '6 - 10 - 13 - - - - - - - - - - -'],
  melodyAt: 0, melodyOct: -1, leadVoice: 'keys', stab: 'x-------x-------', stabVoice: 'brass', stabAt: 3, arpVoice: 'glass', arpLine: '. . . . 5 - - - . . . . 3 - - -' };
MUSIC_FOR.lagrange = 'farside';

// ---- the corp
CORPS.lagrange = {
  key: 'lagrange', name: 'LAGRANGE NET', code: 'LG', level: 5, moves: true,
  intel: '"we\'ll get back to you. eventually."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: two echoes. one lies.',
  rules: () => 'taps land after the next slide.',
  mods: ['precog'],
  // High latency. The grid slides one column right (wrapping) every 1.5 seconds, and your
  // tap lands after the next slide: you tap the cell where a node is going to be. The
  // sound comes early: just before each slide, a chime and a mark (* *) on the cell where
  // the real node will land. Deeper: the mark is brief. Boss: a second, false mark.
  dress(lv, k) {
    lv.lag = { every: k.boss ? 1300 : 1500, next: null, warn: k.tier >= 2 || k.boss ? 200 : 380, boss: k.boss, pending: null, flash: null, land: null,
      r: rngFor(k.seed, 'lagd', k.idx, k.tier) };
  },
  tick(lv, lt, dt, now) {
    const g = lv.lag;
    if (!g) return;
    if (g.land && now >= g.land.at) { const cell = g.land.cell; g.land = null; lagLand(lv, cell); return; }
    if (lv.anchor) return;
    if (g.next == null) g.next = lt + g.every * moveScale();
    if (!g.flash && g.next - lt < g.warn * moveScale()) {
      const real = lv.tiles[lv.safe], cells = [lagNext(lv, real)];
      if (g.boss) { const ice = lv.tiles.filter(t => !t.safe && t.state === 'closed'); if (ice.length) cells.push(lagNext(lv, pickR(ice, g.r))); }
      g.flash = shuffle(cells, g.r);
      Sound.ping(1320);
    }
    if (lt < g.next) return;
    g.next = lt + g.every * moveScale(); g.flash = null;
    lagSlide(lv);
    if (g.pending) { g.land = { cell: g.pending.cell, at: now + slideMs(300) + 30 }; g.pending = null; }
  },
  intercept(i) { const t = st.lv.tiles[i]; return this.cellTap(t.cell); },
  cellTap(cell) {
    const lv = st.lv, g = lv.lag;
    if (!g || st.busy) return true;
    if (lv.anchor) { lagLand(lv, cell); return true; }   // ANCHOR: no slides, no lag
    if (g.pending || g.land) { Sound.deny(); return true; }
    g.pending = { cell };
    Sound.tick(); setMsg('> sent. it lands after the slide.', C.mid);
    return true;
  },
  marks(lv, now) {
    const g = lv.lag;
    if (!g) return null;
    const out = [];
    if (g.flash) for (const cell of g.flash) out.push({ cell, l: '*', r: '*', col: C.money });
    const pc = g.pending ? g.pending.cell : g.land ? g.land.cell : null;
    if (pc != null && !(g.flash && g.flash.includes(pc))) out.push({ cell: pc, l: '[', r: ']', col: C.accent });
    return out;
  },
  hint(lv) {
    const g = lv.lag;
    if (!g) return null;
    if (lv.anchor) return { text: 'lag> anchored: no lag.', col: C.accent };
    return { text: g.pending || g.land ? 'lag> sending...' : 'lag> tap where it will be', col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.lagrange = "the grid slides one column right every 1.5s, and a tap lands after the next slide. just before each slide, * * marks where the real node will land: tap there.";

// intro art
CORP_ART.lagrange = [
  "  o --------> o",
  "     L1  L2",
  "   . . . . . .",
  "  (   1.5s   )",
  "",
  " L A G R A N G E",
];
