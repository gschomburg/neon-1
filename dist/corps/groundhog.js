// NeoN+1 corps/groundhog.js
'use strict';
NEON_FILES.push(['corps/groundhog.js', 'v13.83']);
// Its boss mod: DEJA VU (dejavu), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from SLOW TIDE: the same band, its own tune.
SONGS.sixamagain = { name: 'SIX AM AGAIN', from: 'slowtide', bpm: 72, root: 46, scale: 'major', prog: [0, 4, 5, 3], meter: 3, kit: 'break', pump: 0, swing: 0.1, padVoice: 'glass', echo: 0.45, feedback: 0.45,
  beat: { kick: 'x...........', snare: '....x...x...', ghost: '..........x.', hat: '..x...x...x.' },
  bassVoice: 'sub', bassLine: '0 - - - - - - - 4 - - -',
  melody: ['. . . . 7 - - - 9 - - -', '. . . . 7 - - - 5 - - -', '. . . . 7 - - - 5 - - -', '. . . . 6 - - - 4 - - -'],
  melodyAt: 0, melodyOct: -1, leadVoice: 'bell', arpVoice: 'keys', arpLine: '0 . 2 . 4 . 2 . 1 . 2 .' };
MUSIC_FOR.groundhog = 'sixamagain';

// ---- the corp
CORPS.groundhog = {
  key: 'groundhog', name: 'GROUNDHOG', code: 'GH', level: 5,
  intel: '"same time tomorrow?"',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: two nodes move each loop.',
  rules: () => 'a miss loops the layer. marks stay.',
  mods: ['dejavu'],
  // A time loop. A miss costs 1 integrity as usual, then the layer starts over: every node
  // closes again, but the spot you hit keeps a red x. Each loop one node moves (it flashes
  // as it goes): watch it, or your marks will lie. Each loop pays 15% less. Boss: two move.
  dress(lv, k) {
    for (const t of lv.tiles) t.g0 = t.glyph;
    lv.gh = { marks: new Set(), loops: 0, movers: k.boss ? 2 : 1, moved: [], movedAt: 0, r: rngFor(k.seed, 'gh', k.idx, k.tier) };
  },
  fx(t, ft, lv) {
    const g = lv.gh;
    if (!g) return null;
    const out = {};
    if (g.marks.has(t.cell)) { out.corner = 'x'; out.cornerCol = C.danger; }
    if (g.moved.includes(t) && ft - g.movedAt < 900) out.bright = true;
    return out.corner || out.bright ? out : null;
  },
  async afterHit(t, lv) {
    const g = lv.gh;
    if (!g || st.run.integrity <= 0) return;
    g.marks.add(t.cell); g.loops++;
    await wait(250);
    flash(C.accent, 0.15, 0.4); Sound.whoosh(); shake(3);
    for (const o of lv.tiles) if (o.state === 'locked' && o.lockedBy === 'hit' && !o.loaded) { o.state = 'closed'; o.lockedBy = null; o.dir = null; o.klog = false; o.glyph = o.g0 || o.glyph; }
    lv.payCut = Math.min(0.6, (lv.payCut || 0) + 0.15);
    const used = new Set(lv.tiles.map(o => o.cell)), free = [];
    for (let c = 0; c < lv.cols * lv.rows; c++) if (!used.has(c)) free.push(c);
    const movers = shuffle(lv.tiles.filter(o => o.state === 'closed'), g.r).slice(0, g.movers);
    for (const o of movers) { if (!free.length) break; const c = free.splice(Math.floor(g.r() * free.length), 1)[0]; free.push(o.cell); slideTo(lv, o, c, 560); }
    g.moved = movers; g.movedAt = performance.now();
    setMsg(`> loop ${g.loops + 1}. again.`, C.accent);
    await wait(slideMs(560) + 50);
  },
  hint: lv => lv.gh ? { text: `loop ${lv.gh.loops + 1}  marks ${lv.gh.marks.size}${lv.gh.loops ? `  pay -${Math.round(lv.payCut * 100)}%` : ''}`, col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.groundhog = "a miss loops the layer: everything closes again, but the spots you hit keep a red x. each loop one node moves (it flashes): watch it, or your marks lie.";
