// NeoN+1 corps/monte.js
'use strict';
NEON_FILES.push(['corps/monte.js', 'v13.41']);
// Its boss mod: QUICK EYE (quickeye), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const MONTE_CUP = normMotif([' ___ ', '/   \\', "'---'"]);
const MONTE_BALL = normMotif([' ___ ', '/___\\', '  o  ']);
// MONTE: swap cups. Most swaps take the ball along.
async function monteShuffle(lv, count, ms, boss) {
  const m = lv.monte;
  m.moving = true;
  const r = rngFor(st.run.seed, 'monte', st.corp.node.id, st.corp.idx, lv.misses);
  for (let i = 0; i < count && st.lv === lv; i++) {
    const cups = lv.tiles.filter(t => t.state === 'closed');
    if (cups.length < 2) break;
    const real = cups.find(t => t.safe);
    const a = real && r() < 0.65 ? real : pickR(cups, r), b = pickR(cups.filter(t => t !== a), r);
    const pairs = [[a, b]];
    if (boss && i % 2 && cups.length >= 4) {
      const rest = cups.filter(t => t !== a && t !== b), c1 = pickR(rest, r);
      pairs.push([c1, pickR(rest.filter(t => t !== c1), r)]);
    }
    for (const [x, y] of pairs) { const cx = x.cell, cy = y.cell; slideTo(lv, x, cy, ms, 0.5); slideTo(lv, y, cx, ms, -0.5); }
    Sound.whoosh();
    await wait(slideMs(ms) + 40);
  }
  m.moving = false;
}

// ---- its music
// Made from LIGHT CYCLE: the same band, its own tune.
SONGS.shellgame = { name: 'SHELL GAME', from: 'lightcycle', bpm: 136, root: 43, scale: 'harmonic', prog: [0, 5, 4, 0], kit: '808', pump: 0.7, padVoice: 'glass',
  beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.', open: '......x.......x.' },
  bassLine: '0 7 0 7 0 7 0 7 0 7 0 7 0 7 0 7',
  melody: ['4 . 6 . 7 . 6 . 4 . 6 . 7 . 6 .', '5 . 7 . 8 . 7 . 5 . 7 . 8 . 7 .', '4 . 6 . 7 . 9 . 11 . 9 . 7 . 6 .', '4 . . . 6 . . . 7 . . . . . . .'],
  leadVoice: 'saw', arpVoice: 'chip', arpLine: '. . 3 . . . 4 . . . 5 . . . 4 .', stab: 'x.......x.......', stabVoice: 'brass', stabAt: 2 };
MUSIC_FOR.monte = 'shellgame';

// ---- the corp
CORPS.monte = {
  key: 'monte', name: 'MONTE', code: 'MT', level: 4, moves: true,
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
