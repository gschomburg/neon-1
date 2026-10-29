// NeoN+1 corps/carapace.js
'use strict';
NEON_FILES.push(['corps/carapace.js', 'v13.77']);
// Its boss reward: ROLLUP gear x2 (rollup), defined with the gear in data/mods.js (ITEMS),
// its effect in engine/active.js.

// ---- its music
// Made from MACHINE HEART: the same band, its own tune.
SONGS.exoskeleton = { name: 'EXOSKELETON', from: 'machineheart', bpm: 110, root: 40, scale: 'minor', prog: [0, 3, 0, 5], kit: 'industrial', pump: 0.2, padVoice: 'choir', breakdown: 4,
  beat: { kick: 'x.......x.......', snare: '....x.......x.xx', hat: 'x.x.x.x.x.x.x.x.' },
  bassVoice: 'picked', bassLine: '0 . 0 . 0 0 . 0 . 0 0 . 0 . 3 .',
  melody: ['0 - - - 0 - 4 - 4 - - - 3 - - -', '2 - - - 2 - 3 - 4 - - - - - - -', '0 - - - 0 - 4 - 7 - - - 6 - - -', '4 - - - 3 - - - 0 - - - . . . .'],
  leadVoice: 'brass', arpVoice: 'pluck', arpLine: '0 . . 0 . . 0 . 1 . . 1 . . 2 .' };
MUSIC_FOR.carapace = 'exoskeleton';

// ---- the corp
CORPS.carapace = {
  key: 'carapace', name: 'CARAPACE ARMOR', code: 'CA', level: 3,
  intel: '"roll with it."',
  tell: null,
  bossDesc: 'boss: no thin spots.',
  rules: () => 'armor: every hit points at the real.',
  gear: { key: 'rollup', n: 2 },   // its boss reward: a stack of gear
  // Every node wears armor (# frame). The real node has a thin spot (a - in the top edge).
  // Deeper: every node has one; the real node's is on top, the decoys' on the bottom. Boss: no
  // thin spots. Every ICE you hit points toward the real node.
  dress(lv, k) {
    const r = k.r;
    k.tiles.forEach(t => {
      t.armor = { top: '#=====#', bot: '#=====#' };
      const thin = (row, x) => row.slice(0, x) + '-' + row.slice(x + 1);
      if (k.boss) return;
      if (t === k.tellTile) t.armor.top = thin(t.armor.top, randInt(r, 1, 5));
      else if (k.tier >= 2) t.armor.bot = thin(t.armor.bot, randInt(r, 1, 5));
    });
    k.tellTile.tell = true;
  },
  fx: t => t.armor ? { frame: [t.armor.top, t.armor.bot], side: '#' } : null,
  onHit(t) {
    const lv = st.lv, q = lv.tiles[lv.safe], dx = Math.sign(q.col - t.col), dy = Math.sign(q.row - t.row);
    t.dir = Math.abs(q.col - t.col) >= Math.abs(q.row - t.row) ? { h: dx, v: 0 } : { h: 0, v: dy };
  },
};

// the codex, once you've beaten it
CORP_TELL.carapace = "every node wears armor. the real node has a thin spot (-) in its top edge. deeper, every node has one: the real node's is on top, the decoys' on the bottom. every ICE you hit points toward the real node.";
