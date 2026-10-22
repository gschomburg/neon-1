// NeoN+1 corps/noir.js
'use strict';
NEON_FILES.push(['corps/noir.js', 'v12.09']);
// Its boss mod: INTERROGATE (interrogate), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// NOIR: one statement for node t. true: it must be true if q is the real node (q tells the
// truth, everyone else lies). test(x): is it true if x were the real node.
function noirStatement(t, ts, lv, kind, r, truth, q) {
  const others = ts.filter(o => o !== t);
  const mk = (text, test) => test(q) === truth ? { text, test } : null;
  if (kind === 'me') return mk(['I AM', 'REAL'], x => x === t);
  if (!others.length) return mk(['I AM', 'REAL'], x => x === t);
  if (kind === 'is') { const o = truth ? q : pickR(others.filter(o2 => o2 !== q), r) || others[0]; return mk([`${o.label} IS`, 'REAL'], x => x === o); }
  if (kind === 'not') { const o = pickR(others, r); return mk(['NOT', o.label], x => x !== o); }
  if (kind === 'lies') { const o = pickR(others, r); return mk([o.label, 'LIES'], x => x !== o); }
  if (kind === 'row') { const row = truth ? q.row : randInt(r, 0, lv.rows - 1); return mk(['REAL', `ROW ${row + 1}`], x => x.row === row); }
  const side = pickR(Object.keys(NOIR_SIDES), r);
  return mk(NOIR_SIDES[side].text, NOIR_SIDES[side].test(t));
}
// A side claim by t that's false whoever is real: q isn't on that side (and t never is).
function noirSide(t, q, r) {
  const ok = Object.keys(NOIR_SIDES).filter(k => !NOIR_SIDES[k].test(t)(q));
  const k = pickR(ok, r);
  return { text: NOIR_SIDES[k].text, test: NOIR_SIDES[k].test(t) };
}

// ---- its music
SONGS.gumshoe = { name: 'GUMSHOE',        bpm: 72,  root: 45, scale: 'harmonic', prog: [0, 5, 3, 4], bass: 'pulse',   drums: 'half',  arp: 'down', echo: 0.55, feedback: 0.45 };
MUSIC_FOR.noir = 'gumshoe';

// ---- the corp
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
