// NeoN+1 corps/bytepets.js
'use strict';
NEON_FILES.push(['corps/bytepets.js', 'v13.50']);
// Its boss mod: COMPANION (companion), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const PET_BODIES = [['/\\_/\\', '(E)', ' u u '], [' .-. ', '(E)', "'' ''"], [' .-. ', '(E)', '|/\\/|'], ['/^ ^\\', '(E)', ' \\_/ '], [' ___ ', '[E]', ' d b '], [' ^ ^ ', '{E}', ' ~~~ ']];
const PET_EYES = ['o.o', 'O.O', '^.^', '-.-', '*.*', 'u.u'];

// ---- its music
MUSIC_FOR.bytepets = 'pikopiko';   // PIKO PIKO (from corps/mochi.js)

// ---- the corp
CORPS.bytepets = {
  key: 'bytepets', name: 'BYTEPETS', code: 'BP', level: 2,
  intel: '"they love you! feed them!"',
  tell: null,
  bossDesc: 'boss: a cat. it might not come.',
  rules: () => `CALL (${costInt(ECON.corpCosts.bytepetsCall)}cr): the real pet comes.`,
  mods: ['companion'],
  // The nodes are little digital pets. CALL them (a 1cr treat): they all turn their heads,
  // and the real one comes a step toward the button. Boss: a cat; half the time it ignores you.
  dress(lv, k) {
    const r = k.r, bodies = shuffle(PET_BODIES.slice(), r), eyes = shuffle(PET_EYES.slice(), r);
    k.tiles.forEach((t, i) => { const b = bodies[i % bodies.length], e = eyes[(i + Math.floor(i / bodies.length) + 1) % eyes.length]; t.glyph = normMotif([b[0], b[1].replace('E', e), b[2]]); });
    k.tellTile.tell = true;
    lv.pets = { boss: k.boss, calls: 0, at: null, comes: false, seed: r() * 1000 };
  },
  fx(t, ft, lv) {
    const pt = lv.pets;
    if (!pt || pt.at == null) return null;
    const e = ft - pt.at;
    if (e < 0 || e > 800) return null;
    const f = Math.sin(Math.min(1, e / 800) * Math.PI);
    if (t.tell && pt.comes) return { dx: 0.35 * f, dy: -0.4 * f };
    return { glyph: mirrorGlyph(t.glyph) };   // heads turn
  },
  action(lv) {
    const pt = lv.pets;
    if (!pt) return null;
    const call = costInt(ECON.corpCosts.bytepetsCall);
    return { label: `CALL ${call}cr`, ok: canSpend(call), use() {
      st.run.credits -= call; pt.calls++;
      pt.at = performance.now();
      pt.comes = !pt.boss || h01(pt.seed, pt.calls) < 0.5;
      Sound.jingle();
      setMsg(`> here, pets! (-${call}cr treat)`, C.accent);
    } };
  },
};

// the codex, once you've beaten it
CORP_TELL.bytepets = `CALL the pets (a ${costInt(ECON.corpCosts.bytepetsCall)}cr treat): they all turn their heads, and the real one comes a step toward you. boss: a cat. it ignores half your calls.`;
