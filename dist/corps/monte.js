// NeoN+1 corps/monte.js
'use strict';
NEON_FILES.push(['corps/monte.js', 'v12.00']);
CORPS.monte = {
  key: 'monte', name: 'MONTE', letter: '3', level: 4, moves: true,
  intel: '"keep your eye on the ball."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: faster hands. more cups.',
  rules: () => 'cups shuffle. a miss shuffles more.',
  mods: ['quickeye'],
  // A shell game. The ball shows under one cup, the cups come down and shuffle, and you
  // follow it with your eyes. A miss shuffles 2 more times. Deeper: more swaps, faster.
  // Boss: two pairs swap at once.
  dress(lv, k) {
    for (const t of k.tiles) t.glyph = MONTE_CUP;
    lv.monte = { show: true, swaps: k.boss ? 9 : Math.min(8, 3 + k.tier), ms: k.boss ? 300 : k.tier >= 3 ? 340 : 400, boss: k.boss };
  },
  fx(t, ft, lv) { return lv.monte && lv.monte.show && t.safe ? { glyph: MONTE_BALL, gc: C.money } : null; },
  async intro(lv) {
    const m = lv.monte;
    setMsg('> monte: here is the ball...', C.accent);
    await wait((m.boss ? 700 : 1000) * moveScale());
    m.show = false; Sound.pop(0);
    await wait(250);
    await monteShuffle(lv, m.swaps, m.ms, m.boss);
    setMsg('> monte: where is it?', C.accent);
  },
  async afterHit(t, lv) { if (lv.monte && !lv.anchor) await monteShuffle(lv, 2, lv.monte.ms, lv.monte.boss); },
  hint: lv => lv.monte ? { text: lv.monte.moving ? 'monte> watch the hands...' : 'monte> where is the ball?', col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.monte = "a shell game: the ball shows under one cup, then the cups shuffle. follow it. a miss shuffles twice more.";

// intro art
CORP_ART.monte = [
  "  ___    ___    ___",
  " /   \\  /   \\  /   \\",
  " '---'  '---'  '-o-'",
  "",
  "    M  O  N  T  E",
];
