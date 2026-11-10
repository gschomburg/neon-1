// NeoN+1 corps/fossil.js
'use strict';
NEON_FILES.push(['corps/fossil.js', 'v14.70']);
// Its boss gear: SHOVEL x3 (shovel), defined with the gear in data/mods.js (ITEMS), its effect in engine/active.js
// (BOSS_GEAR). Design: docs/CORPS.md A28 (Greg, 2026-11-07).

// ---- its own helpers
// The fossils: the real node is one, and it has an eye (o) in its middle row. Fakes (tier 2 on) have the same
// bones and no eye. The boss: a skeleton across several nodes; only the skull has the eye.
const FOSSILS = [
  { real: [' ___ ', '(o o)', ' \\^/ '], fake: [' ___ ', '(. .)', ' \\^/ '] },
  { real: ['  ,  ', '<o}}>', "  '  "], fake: ['  ,  ', '<.}}>', "  '  "] },
  { real: [' .-. ', '(o@ )', " '-~ "], fake: [' .-. ', '(.@ )', " '-~ "] },
  { real: ['  __ ', '_/o \\', '/_/\\_'], fake: ['  __ ', '_/. \\', '/_/\\_'] },
];
const FOSSIL_BONES = [['=-=-=', '-=-=-', '=-=-='], [' ))) ', '=)))=', ' ))) '], ['   ~-', '~-=-=', '     '], [' /|\\ ', ' ||| ', '  V  ']];
const FOSSIL_DIRT = '.,:;\'`~';
const FOSSIL_ORDER = [1, 0, 2];   // a brush shows the middle row first, then the top; the last one uncovers the bottom
const fossilFree = lv => lv.fossil.boss || lv.fossil.tier >= 3 ? 1 : 2;   // free brushes before a tap commits
// A node as dug so far: the rows brushed off, dirt on the rest.
function fossilGlyph(t) {
  const shown = FOSSIL_ORDER.slice(0, t.dug || 0);
  return t.bones.map((l, r) => shown.includes(r) ? l : [...l].map((ch, x) => FOSSIL_DIRT[(t.cell * 3 + r * 5 + x * 2 + (t.cell * x) % 4) % FOSSIL_DIRT.length]).join(''));
}
function fossilBrush(lv, t, n) {
  t.dug = Math.min(3, (t.dug || 0) + n);
  t.glyph = normMotif(fossilGlyph(t));
}

// ---- its music
MUSIC_FOR.fossil = 'hollow';   // HOLLOW (in data/music.js): a quiet dig

// ---- the corp
// ---- Brushing is a fast tap (`intercept`); the tap after the free brushes commits (the normal pick).
CORPS.fossil = {
  key: 'fossil', name: 'FOSSIL', code: 'FS', level: 3,
  intel: '"we\'ve been around a long time."',
  tell: null, timer: 15,
  bossDesc: 'boss: a whole skeleton. find the skull.',
  rules: () => 'brush the nodes. each brush costs a second.',
  gear: { key: 'shovel', n: 3 },   // its boss reward: a stack of gear
  dress(lv, k) {
    const r = k.r, real = k.real, ice = shuffle(lv.tiles.filter(t => !t.safe), r);
    lv.fossil = { tier: k.tier || 1, boss: !!k.boss };
    // the ICE: its own glyph, minus any eye in the middle row (only a fossil has one)
    for (const t of ice) t.bones = t.glyph.map((l, i) => i === 1 ? l.replace(/o/g, '0') : l);
    if (k.boss) {
      real.bones = FOSSILS[0].real;
      ice.slice(0, 3).forEach((t, i) => { t.bones = FOSSIL_BONES[i % FOSSIL_BONES.length]; });
    } else {
      const f = pickR(FOSSILS, r);
      // the tell isn't true every layer: then the eye sits on a fake, and the real one has none
      const eye = k.follow || !ice.length ? real : ice[0];
      real.bones = eye === real ? f.real : f.fake;
      if (eye !== real) ice[0].bones = pickR(FOSSILS, r).real;
      const fakes = k.tier >= 3 ? 2 : k.tier >= 2 ? 1 : 0;
      ice.slice(eye === real ? 0 : 1, (eye === real ? 0 : 1) + fakes).forEach(t => { t.bones = pickR(FOSSILS, r).fake; });
    }
    for (const t of lv.tiles) { t.dug = 0; t.glyph = normMotif(fossilGlyph(t)); }
  },
  // A brush: a second off the clock, a bit more of the glyph. Past the free brushes, the normal pick (it resolves).
  intercept(i) {
    const lv = st.lv, t = lv && lv.tiles[i];
    if (!lv || !lv.fossil || !t || t.state !== 'closed' || (t.dug || 0) >= fossilFree(lv)) return false;
    fossilBrush(lv, t, 1);
    if (st.timer) { st.timer.left = Math.max(0.5, st.timer.left - 1); st.timer.lastSec = Math.ceil(st.timer.left); }
    Sound.tick(); shake(0.8, 0.08);
    setMsg(`> brush. ${t.dug}/${fossilFree(lv) + 1}`, C.mid);
    return true;
  },
  tap(t) { if (st.lv.fossil) fossilBrush(st.lv, t, 3); return false; },   // dug out: a fossil is real, the rest is ICE
};

// the codex, once you've beaten it
CORP_TELL.fossil = "1. tap a node to brush it: the middle row of its glyph shows first, then the top. each brush costs a second of the clock. 2. the tap after that digs it out and counts (deeper: one brush, then it counts). 3. the real node is a fossil with an eye (o). fakes have the same bones and no eye. the tell isn't true every layer. boss: a skeleton across several nodes: only the skull has the eye.";
