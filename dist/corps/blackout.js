// NeoN+1 corps/blackout.js
'use strict';
NEON_FILES.push(['corps/blackout.js', 'v13.08']);
// Its boss mod: FLARE (flare), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.lightsout = { name: 'LIGHTS OUT',     bpm: 80,  root: 38, scale: 'minor',    prog: [0, 6, 5, 6], style: 'ambient', echo: 0.7, feedback: 0.6 };
MUSIC_FOR.blackout = 'lightsout';

// ---- the corp
CORPS.blackout = {
  key: 'blackout', name: 'BLACKOUT', code: 'BK', level: 3, dark: true,
  intel: '"lights out. stay where you are."',
  tell: null,
  bossDesc: 'boss: nearly black. short glow.',
  rules: () => 'it gets darker every layer.',
  mods: ['flare'],
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
  hint(lv) {
    const d = lv.dark || 0, bars = Math.round((1 - d) * 8);
    return { text: `power [${'#'.repeat(bars).padEnd(8, '.')}]`, col: d > 0.5 ? C.danger : C.mid };
  },
};

// the codex, once you've beaten it
CORP_TELL.blackout = "when the lights flash (a layer opening, every ICE hit), every node lights up and fades. the real node glows longest. deeper, a decoy glows long too. it gets darker every layer; the nodes you hit stay red.";

// intro art
CORP_ART.blackout = [
  "      .---.",
  "     (  x  )",
  "      '|=|'",
  "       '-'",
  "  B L A C K O U T",
];
