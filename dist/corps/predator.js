// NeoN+1 corps/predator.js
'use strict';
NEON_FILES.push(['corps/predator.js', 'v13.28']);
// Its boss mod: INFRARED (infrared), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from RED DEEP: the same band, its own tune.
SONGS.heatsignature = { name: 'HEAT SIGNATURE', from: 'reddeep', bpm: 112, root: 40, scale: 'harmonic', prog: [0, 0, 5, 4], kit: 'industrial', pump: 0, padVoice: 'choir', echo: 0.45, feedback: 0.45,
  beat: { kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
  bassLine: '0 . . 0 . . 0 . 0 . . 0 . . 1 .',
  melody: ['. . . . . . . . 11 - - - 10 - - -', '. . . . . . . . 7 - - - - - - -', '. . . . . . . . 11 - - - 12 - - -', '. . . . . . . . 13 - - - 11 - - -'],
  leadVoice: 'saw', arpVoice: 'pluck', arpLine: '. . . . . . . . 0 . 1 . 2 . 1 .' };
MUSIC_FOR.predator = 'heatsignature';

// ---- the corp
CORPS.predator = {
  key: 'predator', name: 'PREDATOR', code: 'PD', level: 4, moves: true,
  intel: '"we see you. we see your heat."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: a second heat source.',
  rules: () => 'heat vision. they wander.',
  mods: ['infrared'],
  // Heat vision: every node is a heat blob, and they wander the grid. The real node runs
  // warmest on average, but each reading (one a second) is noisy. Deeper: the ICE runs
  // warmer. Boss: one decoy runs nearly as hot.
  dress(lv, k) {
    k.tiles.forEach(t => { t.ph = Math.floor(k.r() * 1000); });
    const ice = k.tiles.filter(t => !t.safe);
    lv.pred = { hot: k.boss && ice.length ? pickR(ice, k.r) : null, spread: k.tier >= 2 || k.boss ? 0.9 : 0.8,
      wander: k.boss ? 900 : k.tier >= 2 ? 1150 : 1400, next: null, n: 0 };
  },
  fx(t, ft, lv) {
    const p = lv.pred;
    if (!p || t.ph == null) return null;
    const v = predHeat(t, ft, p);
    return { glyph: heatGlyph(v, t.ph, ft), gc: heatCol(v), fc: C.dim };
  },
  tick(lv, lt) {
    const p = lv.pred;
    if (!p || lv.anchor) return;
    if (p.next == null) p.next = lt + p.wander * moveScale();
    if (lt < p.next) return;
    p.next = lt + p.wander * moveScale();
    const r = rngFor(st.run.seed, 'pred', st.corp.node.id, st.corp.idx, p.n++);
    const used = new Set(lv.tiles.map(t => t.cell));
    const movers = shuffle(lv.tiles.filter(t => t.state === 'closed' && !t.slide), r).slice(0, r() < 0.5 ? 1 : 2);
    let moved = 0;
    for (const t of movers) {
      const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dc, dr]) => [t.col + dc, t.row + dr])
        .filter(([c, w]) => c >= 0 && c < lv.cols && w >= 0 && w < lv.rows && !used.has(w * lv.cols + c)).map(([c, w]) => w * lv.cols + c);
      if (!opts.length) continue;
      const to = pickR(opts, r);
      used.delete(t.cell); used.add(to);
      slideTo(lv, t, to, 650); moved++;
    }
    if (moved) Sound.tick();
  },
  hint: lv => lv.pred ? { text: 'thermal> the real one runs warm', col: C.money } : null,
};

// the codex, once you've beaten it
CORP_TELL.predator = "heat vision. the real node runs warmest on average, but every reading is noisy, and they wander. watch a few seconds.";
