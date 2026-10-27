// NeoN+1 corps/telephonix.js
'use strict';
NEON_FILES.push(['corps/telephonix.js', 'v13.46']);
// Its boss mod: CALLER ID (callerid), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// TELEPHONIX keypad: [key, letters]. CHOIR: which way a follower faces (by [dx, dy]).
const PHONE_KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', ''], ['#', '']];

// ---- its music
// Made from SLOW TIDE: the same band, its own tune.
SONGS.pleasehold = { name: 'PLEASE HOLD', from: 'slowtide', bpm: 96, root: 50, scale: 'major', prog: [0, 5, 1, 4], sevenths: true, kit: 'break', pump: 0, swing: 0.2, padVoice: 'glass', echo: 0.35, feedback: 0.4,
  beat: { kick: 'x.......x.x.....', snare: '....x.......x...', ghost: '.......x.....x..', hat: 'x..x..x.x..x..x.' },
  bassVoice: 'pluck', bassLine: '0 . . . 2 . . . 4 . . . 5 . . .',
  melody: ['4 - 2 - 4 - - - 7 - - - 6 - 4 -', '2 - - - . . . . . . 0 - 2 - 4 -', '5 - 4 - 5 - - - 8 - - - 7 - 5 -', '4 - - - - - - - . . . . . . . .'],
  melodyAt: 0, melodyOct: -1, leadVoice: 'keys', arpVoice: 'keys', arpLine: '0 . . 1 . . 2 . . . 1 . . . . .' };
MUSIC_FOR.telephonix = 'pleasehold';

// ---- the corp
CORPS.telephonix = {
  key: 'telephonix', name: 'TELEPHONIX', code: 'TX', level: 3,
  intel: '"please hold. your call matters."',
  tell: null,
  bossDesc: 'boss: dial by letter.',
  mods: ['callerid'],
  // The nodes are keys on a phone keypad. The hint dials a number, tone by tone; the last
  // digit is the real key. Then it goes on hold (hidden). Deeper: a shorter look. Boss:
  // the last digit is dialed as a letter (2 = ABC, 7 = PQRS...).
  dress(lv, k) {
    const r = k.r, keys = shuffle(PHONE_KEYS.slice(), r);
    k.tiles.forEach((t, i) => { t.key = keys[i % keys.length]; t.glyph = normMotif([`[${t.key[0]}]`, t.key[1] || '', '']); });
    const real = k.tellTile.key;
    const dg = Array.from({ length: 6 }, () => String(randInt(r, 0, 9)));
    const last = k.boss && real[1] ? pickR([...real[1]], r) : real[0];
    lv.dialNum = { s: `${dg.slice(0, 3).join('')}-${dg.slice(3).join('')}${last}`, show: k.tier >= 2 || k.boss ? 900 : 1600, gap: 200, start: 600, done: 0, doneAt: null };
    k.tellTile.tell = true;
  },
  tick(lv, lt) {
    const d = lv.dialNum;
    if (!d) return;
    while (d.done < d.s.length && lt >= d.start + d.done * d.gap) { const ch = d.s[d.done++]; if (ch !== '-') Sound.dtmf(ch); }
    if (d.done >= d.s.length && d.doneAt == null) d.doneAt = lt;
  },
  hint(lv) {
    const d = lv.dialNum;
    if (!d) return null;
    if (d.doneAt != null && (lv.lt || 0) - d.doneAt > d.show) return { text: `dial> ${d.s.replace(/[^-]/g, '*')}  (on hold)`, col: C.mid };
    return { text: `dial> ${d.s.slice(0, d.done)}`, col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.telephonix = "the nodes are phone keys. the hint dials a number; the last digit is the real key. then the line goes on hold. boss: the last digit is dialed as a letter (2 = ABC).";
