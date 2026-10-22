// NeoN+1 corps/cipher.js
'use strict';
NEON_FILES.push(['corps/cipher.js', 'v12.21']);
// Its boss mod: PARITY (parity), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.enigma = { name: 'ENIGMA',         bpm: 104, root: 43, scale: 'phrygian', prog: [0, 1, 5, 6], bass: 'offbeat', drums: 'four',  arp: 'mirror', tick: true };
MUSIC_FOR.cipher = 'enigma';

// ---- the corp
CORPS.cipher = {
  key: 'cipher', name: 'CIPHER', code: 'CI', level: 4, cipher: true,
  intel: '"we have nothing to hide. read it yourself."',
  tell: null,
  bossDesc: 'boss: the cipher shifts every miss.',
  rules: () => 'everything is in cipher here.',
  mods: ['parity'],
  // Inside, every letter is a symbol (see cipherNow). The hint line gives the key:
  // ROW n or COL n, in cipher too, so you have to learn which word is which. The cipher
  // holds for the whole visit, and the messages you already know help you crack it.
  // Boss: the cipher reshuffles after every miss.
  dress(lv, k) {
    const q = k.tellTile;
    q.tell = true;
    lv.cipherKey = k.r() < 0.5 ? `ROW ${q.row + 1}` : `COL ${q.col + 1}`;
  },
  hint: lv => lv.cipherKey ? { text: `key: ${lv.cipherKey}`, col: C.accent } : null,
  async afterHit(t, lv) {
    if (!lv.boss || st.run.integrity <= 0) return;
    const c = st.corp;
    c.cipherSalt = (c.cipherSalt || 0) + 1;
    c.cipherShiftAt = performance.now();
    Sound.modem();
    setMsg('> the cipher shifts.', C.accent);
    await wait(350);
  },
};

// the codex, once you've beaten it
CORP_TELL.cipher = "the key line says ROW or COL and a number: that's where the real node is (most of the time). learn which symbols spell ROW and which spell COL; the messages you already know help. boss: the cipher shifts after every miss.";

// intro art
CORP_ART.cipher = [
  "  .---------------.",
  "  | A > ◆ | B > ▲ |",
  "  | C > ● | D > ★ |",
  "  '---------------'",
  "     C I P H E R",
];
