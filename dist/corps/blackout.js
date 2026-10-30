// NeoN+1 corps/blackout.js
'use strict';
NEON_FILES.push(['corps/blackout.js', 'v13.87']);
// Its boss reward: FLARE gear x3 (flare), defined with the gear in data/mods.js (ITEMS),
// its effect in engine/active.js.

// ---- its music
// Made from RED DEEP: the same band, its own tune.
SONGS.powercut = { name: 'POWER CUT', from: 'reddeep', bpm: 100, root: 38, scale: 'harmonic', prog: [0, 0, 1, 0], kit: 'industrial', pump: 0, padVoice: 'organ', breakdown: 4, echo: 0.4, feedback: 0.45,
  beat: { kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x...x...x...x...' },
  bassLine: '0 . 0 . 0 . 1 . 0 . 0 . 0 . -1 .',
  melody: ['. . . . 4 - - - 3 - - - 4 - - -', '. . . . 4 - - - 7 - - - 6 - - -', '. . . . 4 - - - 3 - - - 1 - - -', '0 - - - - - - - . . . . . . . .'],
  leadVoice: 'keys', arpVoice: 'pluck', arpLine: '. . . . . . . . 0 . 1 . 2 . 1 .' };
MUSIC_FOR.blackout = 'downward';   // DOWNWARD (in data/music.js; the user, 2026-10-25). Its own track above is unused now.

// ---- the corp
CORPS.blackout = {
  key: 'blackout', name: 'BLACKOUT', code: 'BK', level: 3, dark: true,
  intel: '"lights out. stay where you are."',
  tell: null,
  bossDesc: 'boss: nearly black. short glow.',
  rules: () => 'it gets darker every layer.',
  gear: { key: 'flare', n: 3 },   // its boss reward: a stack of gear
  // Darker every layer (the palette fades into the background, except red: the nodes
  // you hit stay bright). Afterglow: when the lights flash (the layer opening, and every
  // ICE hit), every node lights up and fades; the real node glows longest. Deeper, a
  // decoy shares its slow glow. Boss: nearly black, two slow decoys, a shorter glow.
  dress(lv, k) {
    k.tellTile.tell = true;
    const others = shuffle(k.tiles.filter(t => t !== k.tellTile), k.r);
    for (const t of others.slice(0, k.boss ? 2 : k.tier >= 2 ? 1 : 0)) t.glowSlow = true;
    lv.glow = { fast: 450, slow: k.boss ? 1000 : k.tier >= 2 ? 1200 : 1400 };
    lv.dark = k.boss ? 0.74 : Math.min(0.62, 0.2 * k.idx + (k.tier >= 2 ? 0.1 : 0));
  },
  onHit() { if (st.lv) st.lv.glowAt = performance.now(); },
  fx(t, ft, lv) {
    const gl = lv.glow, at = Math.max(lv.shownAt || 0, lv.glowAt || 0);
    if (!gl || !at) return null;
    const dur = t.tell || t.glowSlow ? gl.slow : gl.fast, g = clamp(1 - (ft - at) / dur, 0, 1);
    if (g <= 0) return null;
    const e = g * (2 - g);
    return { gc: mixHex(C.text, PAL_LIT.bright, e), fc: mixHex(C.mid, PAL_LIT.text, e) };
  },
  hint(lv, now = performance.now()) {
    const d = lv.dark || 0, bars = Math.round((1 - d) * 8);
    // nearly black (the boss): now and then, Zork's grue (the user, 2026-10-23)
    if (d > 0.7 && (now - (lv.shownAt || 0)) % 9000 > 6500) return { text: 'it is pitch black. a grue is near.', col: C.danger };
    return { text: `power [${'#'.repeat(bars).padEnd(8, '.')}]`, col: d > 0.5 ? C.danger : C.mid };
  },
};

// the codex, once you've beaten it
CORP_TELL.blackout = "when the lights flash (a layer opening, every ICE hit), every node lights up and fades. the real node glows longest. deeper, a decoy glows long too. it gets darker every layer; the nodes you hit stay red. (in the dark, you are likely to be eaten by a grue.)";
