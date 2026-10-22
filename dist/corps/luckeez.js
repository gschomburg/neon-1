// NeoN+1 corps/luckeez.js
'use strict';
NEON_FILES.push(['corps/luckeez.js', 'v12.21']);
// Its boss mod: LET IT RIDE (letitride), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// LUCKEEZ reels, BIDBLITZ's host, BYTEPETS (E = eyes).
const SLOT_SYMS = '7$@*%&#';

// ---- its music
SONGS.jackpot = { name: 'JACKPOT',        bpm: 126, root: 50, scale: 'dorian',   prog: [0, 3, 0, 4], bass: 'offbeat', drums: 'four',  arp: 'up', pingpong: true };
MUSIC_FOR.luckeez = 'jackpot';

// ---- the corp
CORPS.luckeez = {
  key: 'luckeez', name: 'LUCKEEZ CASINO', code: 'LK', level: 2,
  intel: '"everybody wins! eventually!"',
  tell: null,
  bossDesc: 'boss: the reels spin first.',
  rules: () => 'double down: x2 pay, or x2 hit.',
  mods: ['letitride'],
  // Slot machines: the real node shows three of a kind. Deeper, decoys show pairs. Boss:
  // the reels spin first and stop one by one. DOUBLE DOWN (before you pick): x2 pay if
  // it's real, x2 damage if it's ICE.
  dress(lv, k) {
    const r = k.r, syms = shuffle([...SLOT_SYMS], r), win = syms[0], rest = syms.slice(1);
    k.tiles.forEach(t => {
      let reel;
      if (t === k.tellTile) reel = [win, win, win];
      else if (k.tier >= 2 || k.boss) { const a = pickR(syms, r), b = pickR(syms.filter(x => x !== a), r); reel = shuffle([a, a, b], r); }
      else reel = shuffle(rest.slice(), r).slice(0, 3);
      t.reel = reel;
      t.glyph = normMotif([' ___ ', `|${reel.join('')}|`, " ''' "]);
    });
    lv.slots = { spin: k.boss ? 1400 : 0 };
  },
  fx(t, ft, lv) {
    const sl = lv.slots;
    if (!sl || !sl.spin || lv.shownAt == null || !t.reel) return null;
    const e = ft - lv.shownAt;
    if (e >= sl.spin + 800) return null;
    const reel = t.reel.map((sy, j) => e >= sl.spin + j * 400 ? sy : SLOT_SYMS[Math.floor(ft / 70 + j * 3 + t.cell) % SLOT_SYMS.length]);
    return { glyph: normMotif([' ___ ', `|${reel.join('')}|`, " ''' "]) };
  },
  action(lv) {
    if (!lv.slots) return null;
    return { label: lv.dd ? 'DBL: ON!' : 'DBL DOWN', ok: true, hot: !!lv.dd, use() { lv.dd = !lv.dd; Sound.ui(); setMsg(lv.dd ? '> double down! x2 pay, x2 hit.' : '> playing it safe.', lv.dd ? C.danger : C.mid); } };
  },
  hitDmg: (t, lv) => lv.dd ? 2 * lv.dmg : lv.dmg,
};

// the codex, once you've beaten it
CORP_TELL.luckeez = "the real node shows three of a kind. deeper, decoys show pairs. boss: the reels spin first. DBL DOWN: x2 pay if real, x2 damage if ICE.";

// intro art
CORP_ART.luckeez = [
  "  .-----------.",
  "  | 7 | 7 | 7 |o",
  "  '-----------'|",
  "   L U C K E E Z",
];
