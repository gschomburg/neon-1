// NeoN+1 corps/parcelnet.js
'use strict';
NEON_FILES.push(['corps/parcelnet.js', 'v13.64']);
// Its boss mod: PRIORITY (priority), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.conveyor = { name: 'CONVEYOR',       bpm: 112, root: 45, scale: 'minor',    prog: [0, 4, 5, 3], bass: 'eighths', drums: 'four',  arp: 'up' };
MUSIC_FOR.parcelnet = 'conveyor';

// ---- the corp
CORPS.parcelnet = {
  key: 'parcelnet', name: 'PARCELNET', code: 'PN', level: 1,
  intel: '"it\'s out for delivery. somewhere."',
  tell: null,
  bossDesc: 'boss: final delivery. ends in 0.',
  mods: ['priority'],
  // Tracking numbers. The real node's ends in the layer number (boss: 0). Deeper,
  // decoys end in the numbers next to it.
  dress(lv, k) {
    const r = k.r, want = k.boss ? 0 : k.idx + 1;
    const used = new Set();
    const num = last => { for (;;) { const s = String(randInt(r, 100, 999)) + last; if (!used.has(s)) { used.add(s); return s; } } };
    for (const t of k.tiles) {
      let last = want;
      if (t !== k.tellTile) do last = k.tier >= 2 && r() < 0.6 ? (want + (r() < 0.5 ? 9 : 1)) % 10 : randInt(r, 0, 9); while (last === want);
      t.glyph = normMotif(['.---.', '#' + num(last), "'---'"]);
    }
  },
};

// the codex, once you've beaten it
CORP_TELL.parcelnet = "the real node's tracking number ends in the layer number (1-4). boss: ends in 0. deeper, decoys end in the numbers next to it.";
