// NeoN+1 corps/halflife.js
'use strict';
NEON_FILES.push(['corps/halflife.js', 'v12.08']);
// Its boss mod: LEAD LINING (leadlining), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// HALFLIFE: which node the Geiger counter is on, and the corp's radiation limit (s).
function geigerAt(lv, lt) {
  const gg = lv.geiger;
  if (!gg) return null;
  const open = gg.order.filter(t => t.state === 'closed');
  return open.length ? open[Math.floor(lt / gg.per) % open.length] : null;
}
const radLimit = c => (c.tier >= 2 ? 7 : 8) * c.counts.length;

// ---- its music
SONGS.falloutd = { name: 'FALLOUT',        bpm: 108, root: 38, scale: 'harmonic', prog: [0, 1, 5, 4], bass: 'gallop',  drums: 'heavy', arp: 'down' };
MUSIC_FOR.halflife = 'falloutd';

// ---- the corp
CORPS.halflife = {
  key: 'halflife', name: 'HALFLIFE NUCLEAR', letter: 'h', level: 4,
  intel: '"perfectly safe. mostly."',
  tell: null,
  bossDesc: 'boss: the counter crackles.',
  rules: tier => `rad: ${tier >= 2 ? 7 : 8}s a layer max, or -1 int`,
  mods: ['leadlining'],
  // A Geiger counter sweeps the nodes one by one (lit frame). The closer to the real node,
  // the faster it clicks (and the fuller the meter). Taking your time costs: over the
  // corp's radiation limit, you lose 1 integrity at the end.
  dress(lv, k) {
    const r = k.r, q = k.tellTile, noisy = k.tier >= 2 || k.boss;
    k.tiles.forEach(t => {
      const d = Math.max(Math.abs(t.col - q.col), Math.abs(t.row - q.row));
      let g = d === 0 ? 5 : d === 1 ? 3 : d === 2 ? 2 : 1;
      if (d && noisy && r() < 0.4) g = Math.min(4, g + 1);
      t.geiger = g;
    });
    q.tell = true;
    lv.geiger = { per: k.boss ? 520 : 700, order: shuffle(k.tiles.slice(), r), acc: 0 };
  },
  tick(lv, lt, dt) {
    const c = st.corp;
    c.rad = (c.rad || 0) + dt / 1000;
    const cur = geigerAt(lv, lt);
    if (!cur) return;
    lv.geiger.acc += dt / 1000 * [0, 1.5, 3, 6, 10, 18][cur.geiger];
    if (lv.geiger.acc >= 1) { lv.geiger.acc = 0; Sound.tick(); }
  },
  fx: (t, ft, lv) => geigerAt(lv, lv.lt || 0) === t ? { fc: C.accent } : null,
  hint(lv) {
    const cur = geigerAt(lv, lv.lt || 0), c = st.corp, lim = radLimit(c);
    return { text: `geiger [${':'.repeat(cur ? cur.geiger : 0).padEnd(5, '.')}]  rad ${Math.floor(c.rad || 0)}/${lim}s`, col: (c.rad || 0) > lim ? C.danger : C.accent };
  },
  // at the end of the corp: over the limit costs 1 integrity (never below 1)
  onClear(c) {
    if ((c.rad || 0) <= radLimit(c)) return null;
    st.run.integrity = Math.max(1, st.run.integrity - 1);
    return '> radiation dose: -1 integrity.';
  },
};

// the codex, once you've beaten it
CORP_TELL.halflife = "the geiger counter sweeps the nodes. the real node reads full ::::: and the ones near it click faster. too slow and the radiation costs 1 at the end.";

// intro art
CORP_ART.halflife = [
  "      .-.",
  "   .-(   )-.",
  "  (   \\./   )",
  "   '-'   '-'",
  "  H A L F L I F E",
];
