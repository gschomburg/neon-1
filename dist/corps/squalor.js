// NeoN+1 corps/squalor.js
'use strict';
NEON_FILES.push(['corps/squalor.js', 'v13.79']);
// Its boss mod: INFLUENCER (influencer), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const SQ_FACES = ['[@_@]', '[o_o]', '[^_^]', '[-_-]', '[*_*]', '[>_<]', '[._.]', '[0_0]', '[=_=]', '[u_u]', '[x_x]', '[;_;]'];

// ---- its music
// Made from DANCE ALONE: the same band, its own tune.
SONGS.likeme = { name: 'LIKE ME', from: 'dancealone', bpm: 124, root: 40, scale: 'minor', prog: [0, 3, 5, 4], kit: '808', pump: 0.5, padVoice: 'none',
  beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', open: '..............x.' },
  bassVoice: 'pluck', bassLine: '0 . 0 . 7 . 0 . 0 . 0 . 7 . 5 .', stab: 'x.x.x.x.x.x.x.x.', stabVoice: 'saw',
  melody: ['7 - - - 6 - 4 - . . 4 - 6 - 4 -', '3 - - - . . . . . . 3 - 4 - 6 -', '7 - - - 6 - 4 - . . 4 - 6 - 7 -', '8 - - - 7 - - - 6 - - - . . . .'],
  leadVoice: 'vox', arpVoice: 'chip', arpLine: '. . . . . . . . . . . . 5 . 3 .' };
MUSIC_FOR.squalor = 'likeme';

// ---- the corp
CORPS.squalor = {
  key: 'squalor', name: 'SQUALOR', code: 'SQ', level: 3, drag: true,
  intel: '"like. share. subscribe. obey."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: the comments turn on you.',
  rules: () => 'drag: read the room. hits trend.',
  mods: ['influencer'],
  // A feed. Every node has likes and followers (they mean nothing). Move the pointer
  // around and the crowd reacts: more hearts the closer you get to the real node. A hit
  // goes viral: for 5 seconds the next hit does +1. Boss: the hate gets louder the closer
  // you get: follow the hate.
  dress(lv, k) {
    const r = k.r;
    for (const t of k.tiles) {
      t.likes = randInt(r, 3, 99); t.ph = Math.floor(r() * 1000);
      t.glyph = normMotif([`<3${String(t.likes).padStart(3)}`, pickR(SQ_FACES, r), `${randInt(r, 1, 99)}k`]);
    }
    lv.sq = { hate: k.boss, next: 0, reach: k.tier >= 2 || k.boss ? 2.1 : 2.6 };
  },
  fx(t, ft) {
    if (t.likes == null) return null;
    const n = t.likes + Math.floor(h01(t.ph, Math.floor(ft / 650)) * 6);   // likes tick up and down for no reason
    return { line: [0, `<3${String(n).padStart(3)}`] };
  },
  tick(lv, lt, dt, now) {
    const q = lv.sq;
    if (!q) return;
    const c = nearness(lv, lv.tiles[lv.safe], q.reach);
    if (c == null || now < q.next) return;
    q.next = now + 520 - 360 * c;
    const pool = Math.random() < c ? (q.hate ? SQ_BAD : SQ_GOOD) : SQ_MEH;   // closer: louder (boss: the hate)
    const e = pickR(pool, Math.random), p = st.kbGrid && st.hover >= 0 ? tileCenter(lv.tiles[st.hover]) : st.ptr;
    floatText(e, p.x + rand(-2, 2) * L.cw, p.y - L.chh * rand(0.5, 1.5), pool === SQ_MEH ? C.mid : pool === SQ_BAD ? C.danger : C.accent, 1.2);
  },
  hitDmg: lv2 => (st.lv && st.lv.trendUntil > performance.now() ? 2 : 1),
  onHit() {
    const lv = st.lv;
    const was = lv.trendUntil > performance.now();
    lv.trendUntil = performance.now() + 5000;
    if (!was) setMsg(`${st.msg} it's trending!`, C.danger);
  },
  onSafe(t) {
    const { x, y } = tileCenter(t);
    for (let i = 0; i < 6; i++) floatText(pickR(['<3', '<3 <3', '+1.2k', '+1', ':D'], Math.random), x + rand(-6, 6) * L.cw, y + rand(-2, 1) * L.chh, i % 2 ? C.money : C.accent, 1.8);
    st.run.fol = (st.run.fol || 120) * 1.4 + 40;
  },
  hint(lv, now) {
    if (lv.trendUntil > now) return { text: `TRENDING ${Math.ceil((lv.trendUntil - now) / 1000)}s: next hit +1`, col: C.danger };
    const fol = (st.run.fol || 120) * (1 + 0.04 * Math.sin(now / 1300)), eng = (5 + 4 * Math.sin(now / 900 + 1)).toFixed(1);
    return { text: `@you ${kfmt(fol)} fol  eng ${eng}%  ${Math.sin(now / 700) > 0 ? '^' : 'v'}`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.squalor = "move the pointer around: the crowd reacts with more hearts the closer you get. boss: the hate gets louder near the real one. a hit trends: +1 on the next for 5s.";
