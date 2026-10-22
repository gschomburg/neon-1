// NeoN+1 corps/mochi.js
'use strict';
NEON_FILES.push(['corps/mochi.js', 'v12.01']);
CORPS.mochi = {
  key: 'mochi', name: 'MOCHI MOCHI', letter: '^', level: 1,
  intel: '"you found us!! yay!!"',
  tell: null,
  bossDesc: 'boss: they all wave. ICE: 20cr.',
  rules: () => 'ICE costs 10cr, not integrity.',
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
    const run = st.run, cost = lv.boss ? 20 : 10;
    if (run.credits < cost) return null;
    run.credits -= cost; Sound.shield(); flash(C.accent, 0.1, 0.3);
    return `> ICE. "sorry!!" -${cost}cr.`;
  },
};

// the codex, once you've beaten it
CORP_TELL.mochi = "the real node waves at you: a double bounce, hi hi! deeper, some decoys bob once. ICE costs 10cr instead of integrity (boss: 20cr).";

// intro art
CORP_ART.mochi = [
  "    /\\_/\\   /\\_/\\",
  "   ( ^.^ ) ( o.o )",
  "    (   )   (   )",
  "     u u     u u",
  "   mochi mochi <3",
];
