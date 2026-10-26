// NeoN+1 corps/safeharbor.js
'use strict';
NEON_FILES.push(['corps/safeharbor.js', 'v13.26']);
// Its boss mod: POLICY (policy), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from CAST ON: the same band, its own tune.
SONGS.drydock = { name: 'DRY DOCK', from: 'caston', bpm: 120, root: 45, scale: 'dorian', prog: [0, 3, 0, 4], meter: 6, swing: 0.4, bass: 'jig', drums: 'shanty', arp: 'mirror', pingpong: true, kit: 'break', padVoice: 'organ',
  bassVoice: 'picked',
  melody: ['0 - - 2 - 4 7 - - 4 - -', '3 - - 5 - 7 10 - - 7 - -', '0 - - 2 - 4 7 - 9 7 - 4', '4 - - 6 - 4 2 - - - - -'],
  leadVoice: 'square' };
MUSIC_FOR.safeharbor = 'drydock';

// ---- the corp
CORPS.safeharbor = {
  key: 'safeharbor', name: 'SAFEHARBOR', code: 'SH', level: 2,
  intel: '"read the fine print."',
  tell: null,
  bossDesc: 'boss: the fakes forge the print.',
  rules: () => 'premium 10cr. hits pay 5cr claims.',
  mods: ['policy'],
  // The fine print: a tiny dot in the bottom right corner of the real node's glyph.
  // Deeper: decoys get dots in other corners. Boss: decoys get a , in the same corner.
  dress(lv, k) {
    const r = k.r, plain = MOTIFS.filter(m => !m.join('').includes('.') && !m.join('').includes(','));
    const deck = shuffle(plain.slice(), r);
    const put = (g, y, x, ch) => g.map((l, yy) => yy === y ? l.slice(0, x) + ch + l.slice(x + 1) : l);
    k.tiles.forEach((t, i) => {
      let g = deck[i % deck.length];
      if (t === k.tellTile) { g = put(g, 2, 4, '.'); t.marked = true; }
      else if (k.boss) { g = put(g, 2, 4, ','); t.marked = true; }
      else if (k.tier >= 2 && r() < 0.6) { const [y, x] = pickR([[0, 0], [0, 4], [2, 0]], r); g = put(g, y, x, '.'); t.marked = true; }
      t.glyph = g;
    });
  },
  onEnter() { const run = st.run, p = Math.max(0, Math.min(10, run.credits - creditFloor())); run.credits -= p; if (p) setMsg(`> premium paid: -${p}cr`, C.money); },
  onHit() { st.run.credits += 5; st.run.earned += 5; },
};

// the codex, once you've beaten it
CORP_TELL.safeharbor = "the fine print: a dot in the bottom right corner of the real node. deeper, decoys have dots in other corners; boss: a comma in the same one.";

// intro art
CORP_ART.safeharbor = [
  "      _|_",
  "     /_|_\\",
  "   ____|____",
  "   \\_______/",
  "  ~~~~~~~~~~~~",
  "   SAFEHARBOR",
];
