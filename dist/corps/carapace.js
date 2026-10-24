// NeoN+1 corps/carapace.js
'use strict';
NEON_FILES.push(['corps/carapace.js', 'v13.11']);
// Its boss mod: ROLL UP (rollup), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.shellshock = { name: 'SHELL SHOCK',    bpm: 108, root: 40, scale: 'phrygian', prog: [0, 1, 5, 0], bass: 'eighths', drums: 'heavy', arp: 'down' };
MUSIC_FOR.carapace = 'shellshock';

// ---- the corp
CORPS.carapace = {
  key: 'carapace', name: 'CARAPACE ARMOR', code: 'CA', level: 3,
  intel: '"roll with it."',
  tell: null,
  bossDesc: 'boss: no thin spots.',
  rules: () => 'armor: every hit points at the real.',
  mods: ['rollup'],
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

// intro art
CORP_ART.carapace = [
  "      _____",
  "    .#=====#.",
  "   /#=#=#=#=#\\",
  "  (_o_________)",
  "  C A R A P A C E",
];
