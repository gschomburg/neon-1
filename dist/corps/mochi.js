// NeoN+1 corps/mochi.js
'use strict';
NEON_FILES.push(['corps/mochi.js', 'v13.71']);
// Its boss mod: FRIENDSHIP (friendship), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// MOCHI MOCHI faces, ears and feet; PLAYTIME toys.
const MOCHI_FACES = ['(^.^)', '(o.o)', '(=.=)', '(>.<)', '(*.*)', '(-.-)', '(^o^)', '(u.u)', "('.')", '(o_o)', '(^_^)', '(;.;)', '(@.@)', '(n.n)'];
const MOCHI_TOPS = ['/\\ /\\', ' ^ ^ ', ' o o ', '  *  ', ' ~ ~ ', '(\\ /)'];
const MOCHI_BOTS = [' u u ', ' <3  ', '  w  ', ' ) ( ', ' v v ', ' " " '];

// ---- its music
SONGS.pikopiko = { name: 'PIKO PIKO',      bpm: 136, root: 52, scale: 'major',    prog: [0, 4, 5, 3], bass: 'offbeat', drums: 'four',  arp: 'up', pingpong: true };
MUSIC_FOR.mochi = 'dancealone';   // DANCE ALONE (in data/music.js). Its old track above isn't playing anywhere now (PIKO PIKO moved to BYTEPETS).

// ---- the corp
CORPS.mochi = {
  key: 'mochi', name: 'MOCHI MOCHI', code: 'MO', level: 1,
  intel: '"you found us!! yay!!"',
  tell: null,
  bossDesc: `boss: they all wave. ICE: ${costInt(ECON.corpCosts.mochiBoss)}cr.`,
  rules: () => `ICE costs ${costInt(ECON.corpCosts.mochi)}cr, not integrity.`,
  mods: ['friendship'],
  // It wants you to find it: the real node waves (a double bounce, "hi hi!"). Deeper and
  // the boss: some decoys bob too, but only once.
  dress(lv, k) {
    const r = k.r, faces = shuffle(MOCHI_FACES.slice(), r);
    k.tiles.forEach((t, i) => { t.glyph = normMotif([pickR(MOCHI_TOPS, r), faces[i % faces.length], pickR(MOCHI_BOTS, r)]); t.ph = Math.floor(r() * 3000); });
    k.tellTile.tell = true;
    lv.wave = { bob: k.tier >= 2 || k.boss };
  },
  fx(t, ft, lv) {
    if (!lv.wave) return null;
    const p = (ft + t.ph) % 1700;
    const bob = (at, len = 220) => p >= at && p < at + len ? -0.3 * Math.sin((p - at) / len * Math.PI) : 0;
    if (t.tell) return { dy: bob(0) + bob(280) };
    if (lv.wave.bob && t.ph % 2) return { dy: bob(0) * 0.8 };
    return null;
  },
  // ICE costs credits instead of integrity, while you have them
  block(t, lv) {
    const run = st.run, cost = costInt(lv.boss ? ECON.corpCosts.mochiBoss : ECON.corpCosts.mochi);
    if (!canSpend(cost)) return null;
    run.credits -= cost; Sound.shield(); flash(C.accent, 0.1, 0.3);
    return `> ICE. "sorry!!" -${cost}cr.`;
  },
};

// the codex, once you've beaten it
CORP_TELL.mochi = `the real node waves at you: a double bounce, hi hi! deeper, some decoys bob once. ICE costs ${costInt(ECON.corpCosts.mochi)}cr instead of integrity (boss: ${costInt(ECON.corpCosts.mochiBoss)}cr).`;
