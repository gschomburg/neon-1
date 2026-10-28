// NeoN+1 corps/glacier.js
'use strict';
NEON_FILES.push(['corps/glacier.js', 'v13.61']);
// Its boss mod: ICEBOX (icebox), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from HOLLOW: the same band, its own tune.
SONGS.deepfreeze = { name: 'DEEP FREEZE', from: 'hollow', bpm: 80, root: 38, scale: 'minor', prog: [0, 5, 3, 6], kit: 'industrial', pump: 0.2, padVoice: 'glass', breakdown: 4, echo: 0.55, feedback: 0.45,
  beat: { kick: 'x.........x.....', snare: '........x.......', hat: 'x.x.x.x.x.x.x.x.' },
  bassVoice: 'sub', bassLine: '0 - - - - - - - - - - - - - - -',
  melody: ['7 . 4 . 7 . 4 . 2 . 4 . 7 . 4 .', '12 . 9 . 12 . 9 . 7 . 9 . 12 . 9 .', '10 . 7 . 10 . 7 . 5 . 7 . 10 . 7 .', '13 . 10 . 13 . 10 . 8 . 10 . 13 . 11 .'],
  melodyAt: 0, melodyOct: -1, leadVoice: 'bell', stab: 'x.x.xx.x.x.xx.x.', stabVoice: 'saw', stabAt: 2, arpVoice: 'glass', arpLine: '. . . . . . . . 5 - - - 3 - - -' };
MUSIC_FOR.glacier = 'deepfreeze';

// ---- the corp
// ---- Tier 2, group 2: timed board effects (corp `tick`). tick(lv, lt, dt, now) runs every
// frame while you can pick; lt is the layer's own clock (it stops while you're busy).
CORPS.glacier = {
  key: 'glacier', name: 'GLACIER STORAGE', code: 'GL', level: 4,
  intel: '"everything keeps. forever."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: the frost moves fast.',
  rules: () => 'frost: -10% pay per frozen node.',
  mods: ['icebox'],
  // Frost creeps in from the edges and locks a node every few seconds (each one cuts the
  // pay). The real node freezes last: if the frost gets to it, frostbite (-1 integrity),
  // but the layer still counts.
  dress(lv, k) {
    const edge = t => Math.min(t.col, t.row, lv.cols - 1 - t.col, lv.rows - 1 - t.row);
    const order = shuffle(k.tiles.filter(t => t !== k.real), k.r).sort((a, b) => edge(a) - edge(b));
    lv.frost = { order: order.concat([k.real]), every: k.boss ? 2000 : k.tier >= 2 ? 2500 : 3000, next: null };
  },
  tick(lv, lt) {
    const f = lv.frost;
    if (!f) return;
    const every = f.every + (has('coolant') ? 1500 : 0);   // COOLANT: slower frost
    if (f.next == null) f.next = lt + every;
    if (lt < f.next) return;
    f.next = lt + every;
    const t = f.order.find(o => o.state === 'closed');
    if (!t) return;
    if (t.safe) { frostbite(t); return; }
    lockTile(t, C.accent, 'frost');
    lv.payCut = Math.min(0.9, (lv.payCut || 0) + 0.1);
    setMsg(`> frost: 1 node frozen. pay -${Math.round(lv.payCut * 100)}%`, C.accent);
  },
  hint(lv) {
    const f = lv.frost;
    if (!f) return null;
    const left = Math.max(0, (f.next || 0) - (lv.lt || 0)), n = 6, on = Math.round(n * (1 - left / (f.every + (has('coolant') ? 1500 : 0))));
    return { text: `frost [${'*'.repeat(clamp(on, 0, n)).padEnd(n, '.')}]`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.glacier = "frost locks a node every few seconds, from the edges in, and each one cuts the pay. the real node freezes last: if the frost reaches it, frostbite (-1), but the layer counts.";
