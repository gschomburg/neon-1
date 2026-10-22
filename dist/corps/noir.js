// NeoN+1 corps/noir.js
'use strict';
NEON_FILES.push(['corps/noir.js', 'v12.00']);
CORPS.noir = {
  key: 'noir', name: 'NOIR & ASSOCIATES', letter: 'k', level: 4,
  intel: '"everybody lies. except one."',
  tell: null,
  bossDesc: 'boss: no confessions.',
  rules: () => 'one node tells the truth: the real.',
  mods: ['interrogate'],
  // A logic puzzle. Every node makes a statement; exactly one tells the truth, and that one
  // is the real node. (Only one answer fits.) Deeper: no "I AM REAL" or "X IS REAL". Boss:
  // only positions and liars.
  dress(lv, k) {
    const r = k.r, ts = k.tiles.slice().sort((a, b) => a.cell - b.cell);
    ts.forEach((t, i) => { t.label = 'ABCDEFGHIJKL'[i]; });
    const kinds = k.boss ? ['lies', 'row', 'side'] : k.tier >= 2 ? ['not', 'lies', 'row', 'side'] : ['me', 'is', 'not', 'lies', 'side'];
    const q = k.tellTile;
    const statesOf = () => ts.map(t => noirStatement(t, ts, lv, pickR(kinds, r), r, t === q, q));
    // Random statements first; then every other node that would also fit gets a side claim
    // that's false whoever is real (so it can't be the one telling the truth).
    let best = null;
    for (let tries = 0; tries < 60 && !best; tries++) { const a = statesOf(); if (a.every(x => x)) best = a; }
    if (!best) best = ts.map(t => t === q ? { text: ['I AM', 'REAL'], test: x => x === q } : noirSide(t, q, r));
    for (let it = 0; it < 40; it++) {
      const extra = ts.filter(x => x !== q && ts.every((t, i) => best[i].test(x) === (t === x)));
      if (!extra.length) break;
      const X = pickR(extra, r);
      best[ts.indexOf(X)] = noirSide(X, q, r);
    }
    ts.forEach((t, i) => { t.glyph = normMotif([t.label + ':', ...best[i].text]); });
  },
};

// the codex, once you've beaten it
CORP_TELL.noir = "every node makes a statement. exactly one tells the truth, and that's the real node. only one answer fits.";

// intro art
CORP_ART.noir = [
  "     _____",
  "   _|_____|_",
  "     (. .)  ~",
  "     /|=|\\",
  "  NOIR & ASSOCIATES",
];
