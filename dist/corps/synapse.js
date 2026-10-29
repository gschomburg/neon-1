// NeoN+1 corps/synapse.js
'use strict';
NEON_FILES.push(['corps/synapse.js', 'v13.76']);
// Its boss mod: TURING (turing), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const habitTop = hb => ['corner', 'edge', 'middle'].sort((a, b) => hb[b] - hb[a])[0] + 's';

// ---- its music
// Made from DEADPAN: the same band, its own tune.
SONGS.neural = { name: 'NEURAL', from: 'deadpan', bpm: 130, root: 42, scale: 'minor', prog: [0, 0, 5, 6], sevenths: true, kit: '808', pump: 0.3, gate: 'x.xx.xx.x.xx.xx.',
  beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.' },
  bassVoice: 'pluck', bassLine: '0 . 0 7 . 0 0 . 0 . 0 7 . 0 3 .',
  melody: ['7 . . 7 . . 7 . 6 . . . 4 . . .', '7 . . 7 . . 7 . 9 . . . 7 . . .', '5 . . 5 . . 5 . 4 . . . 2 . . .', '6 . . 6 . . 6 . 4 - - - . . . .'],
  leadVoice: 'saw', arpVoice: 'glass', arpLine: '. . . . 0 . . . . . . . 2 . . .' };
MUSIC_FOR.synapse = 'neural';

// ---- the corp
CORPS.synapse = {
  key: 'synapse', name: 'SYNAPSE AI', code: 'SY', level: 4,
  intel: '"we know you. better than you."',
  tell: null,
  bossDesc: 'boss: fully trained.',
  mods: ['turing'],
  // It learns you: it counts where you pick, all run long (corners, edges, middle, and
  // columns), and hides the real node where you pick least. The more you've played, the more
  // sure it is (the meter). Read yourself: pick where you never would.
  dress(lv, k) {
    const hb = st.run && st.run.habits, total = hb ? hb.total : 0;
    const conf = k.boss ? Math.min(95, 50 + total * 4) : Math.min(90, total * 4);
    lv.model = { conf, like: hb ? habitTop(hb) : 'nothing yet' };
    if (!hb || k.r() * 100 >= conf) return;
    const score = t => hb[cellZone(t, lv)] + 0.6 * (hb['c' + t.col] || 0);
    const low = Math.min(...k.tiles.map(score));
    const pick = pickR(k.tiles.filter(t => score(t) === low), k.r), q = k.tellTile;
    if (pick === q) return;
    const swap = ['cell', 'col', 'row'];
    for (const f of swap) { const v = q[f]; q[f] = pick[f]; pick[f] = v; }
  },
  hint: lv => lv.model ? { text: `model> ${lv.model.conf}% sure. you like: ${lv.model.like}`, col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.synapse = "it learns where you pick (corners, edges, middle, columns) and hides the real node where you pick least. the meter shows how sure it is. pick where you never would.";
