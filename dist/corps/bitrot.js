// NeoN+1 corps/bitrot.js
'use strict';
NEON_FILES.push(['corps/bitrot.js', 'v13.94']);
// Its boss mod: LAST BYTE (lastbyte), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
// Made from TRACKER: the same band, its own tune.
SONGS.badsector = { name: 'BAD SECTOR', from: 'tracker', bpm: 144, root: 39, scale: 'phrygian', prog: [0, 1, 0, 6], kit: 'chip', drums: 'break', pump: 0.4, padVoice: 'none', breakdown: 4,
  bassVoice: 'acid', bassLine: '0 . . 0 . . 0 . . . 0 . 1 . . .', stab: 'x..x.x..x..x.x..', stabVoice: 'vox',
  melody: ['0 0 . 0 . 1 . . 0 0 . 3 . 1 . .', '0 0 . 0 . 1 . . 4 4 . 3 . 1 . .', '7 7 . 7 . 8 . . 7 7 . 5 . 4 . .', '3 . 1 . 0 . . . . . . . -1 . 0 .'],
  leadVoice: 'chip', arpVoice: 'chip', arp: 'mirror' };
MUSIC_FOR.bitrot = 'badsector';

// ---- the corp
CORPS.bitrot = {
  key: 'bitrot', name: 'BITROT', code: 'BR', level: 5,
  intel: '"all data decays. yours first."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: it rots faster.',
  rules: () => 'it decays while you look at it.',
  mods: ['lastbyte'],
  // The real node is built only from characters on your HUD (your credit digits and the
  // # of your integrity). Each decoy has one or two characters that aren't. The longer
  // you take, the more of every node rots away. Deeper: decoys have just one odd
  // character. Boss: rots faster.
  dress(lv, k) {
    const r = k.r;
    for (const t of lv.tiles) if (t.loaded) { t.loaded = false; }   // no $ nodes (loot would change your credits)
    const hud = [...new Set((String(st.run ? st.run.credits : 0) + '#').split(''))];
    const other = [...'%&@$*+=<>/|:;~^ABCDEFGHJKMNPQRSTUVWXYZ'].filter(ch => !hud.includes(ch));
    const odd = k.tier >= 2 || k.boss ? 1 : 2;
    const make = extra => {
      const cells = shuffle([...Array(15).keys()], r).slice(0, randInt(r, 7, 10));
      const chars = cells.map((c, j) => j < extra ? pickR(other, r) : pickR(hud, r));
      shuffle(chars, r);
      const g = [[...'     '], [...'     '], [...'     ']];
      cells.forEach((c, j) => { g[Math.floor(c / 5)][c % 5] = chars[j]; });
      return g.map(l => l.join(''));
    };
    for (const t of lv.tiles) t.glyph = t === k.real ? make(0) : make(odd);
    lv.rot = { ramp: k.boss ? 6000 : 9000 };
  },
  fx(t, ft, lv) {
    const rt = lv.rot;
    if (!rt || lv.shownAt == null) return null;
    const f = clamp((ft - lv.shownAt) / rt.ramp, 0, 0.75);
    return { glyph: t.glyph.map((l, y) => [...l].map((ch, x) => ch !== ' ' && h01(t.cell * 15 + y * 5 + x, 7) < f ? ' ' : ch).join('')), dim: f > 0.6 };
  },
  cellLabel(lv, cell) {   // stray characters drift through the empty cells
    const rt = lv.rot, now = performance.now();
    if (!rt || lv.shownAt == null) return null;
    const f = clamp((now - lv.shownAt) / rt.ramp, 0, 0.75), k = Math.floor(now / 350);
    return h01(cell, k) < f * 0.6 ? NOISE[Math.floor(h01(cell + 3, k) * NOISE.length)] : null;
  },
  hint(lv, now) {
    const rt = lv.rot;
    if (!rt || lv.shownAt == null) return null;
    const f = clamp((now - lv.shownAt) / rt.ramp, 0, 0.75);
    return { text: `rot> ${String(Math.round(f / 0.75 * 100)).padStart(3)}%  keep: ${(String(st.run.credits) + '#').split('').filter((c, i, a) => a.indexOf(c) === i).join(' ')}`, col: f > 0.5 ? C.danger : C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.bitrot = "the real node is made only of characters on your HUD: your credit digits and #. each decoy has an odd one. the longer you wait, the more rots away.";
