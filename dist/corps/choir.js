// NeoN+1 corps/choir.js
'use strict';
NEON_FILES.push(['corps/choir.js', 'v13.95']);
// Its boss reward: TITHE gear x2 (tithe), defined with the gear in data/mods.js (ITEMS),
// its effect in engine/active.js.

// ---- its own helpers
const FACE_CH = ['\\', '^', '/', '<', 'o', '>', '/', 'v', '\\'];

// ---- its music
// Made from HOLLOW: the same band, its own tune.
SONGS.vespers = { name: 'VESPERS', from: 'hollow', bpm: 76, root: 43, scale: 'dorian', prog: [0, 6, 3, 0], meter: 3, kit: 'industrial', pump: 0.2, padVoice: 'choir', breakdown: 4, echo: 0.55, feedback: 0.5,
  beat: { kick: 'x...........', snare: '........x...', hat: '..x...x...x.' },
  bassVoice: 'sub', bassLine: '0 - - - - - - - 4 - - -',
  melody: ['0 - 2 - 4 - 7 - 4 - 2 -', '6 - 8 - 10 - 13 - 10 - 8 -', '3 - 5 - 7 - 10 - 7 - 5 -', '0 - 2 - 4 - 7 - - - - -'],
  melodyAt: 0, melodyOct: -1, leadVoice: 'keys', stab: 'x-----------', stabVoice: 'vox', stabAt: 2, arpVoice: 'glass', arpLine: '. . . . . . . . 5 - - -' };
MUSIC_FOR.choir = 'vespers';

// ---- the corp
CORPS.choir = {
  key: 'choir', name: 'THE CHOIR', code: 'CH', level: 3,
  intel: '"have faith. or pay. both work."',
  tell: null, faith: true,
  bossDesc: `boss: the prophet. tithe ${costInt(ECON.corpCosts.choirTitheBoss)}cr.`,
  rules: () => `faith pays x2. tithe ${costInt(ECON.corpCosts.choirTithe)}cr: a sign.`,
  gear: { key: 'tithe', n: 2 },   // its boss reward: a stack of gear
  // Every follower wears the holy mark and keeps its eyes down. Pick on faith (no tell)
  // and the layer pays x2. Or tithe, and the followers turn to face the real node.
  // Deeper: a heretic or two faces the wrong way. SIGSCAN treats the mark as a signature.
  dress(lv, k) {
    // Faces are picked so that no other node draws as many eyes as the real one.
    const r = k.r, q = k.tellTile, others = k.tiles.filter(t => t !== q);
    // four ways to face (< > ^ v): along the bigger of the two distances
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const toward = (a, b) => { const dx = b.col - a.col, dy = b.row - a.row; return Math.abs(dx) >= Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]; };
    const votes = c => k.tiles.filter(t => t !== c && t.dir && t.dir[0] === toward(t, c)[0] && t.dir[1] === toward(t, c)[1]).length;
    const clear = () => { const v = votes(q); return others.every(t => votes(t) < v); };
    others.forEach(t => { t.dir = toward(t, q); });
    q.dir = null;
    for (const d of shuffle(DIRS.slice(), r)) { q.dir = d; if (clear()) break; }
    if (!clear()) q.dir = null;
    const nHer = k.tier >= 2 || k.boss ? Math.min(2, Math.max(0, others.length - 2)) : 0;
    for (const t of shuffle(others.slice(), r).slice(0, nHer)) {
      const keep = t.dir;
      for (const d of shuffle(DIRS.filter(d => d[0] !== keep[0] || d[1] !== keep[1]), r)) { t.dir = d; if (clear()) break; }
      if (!clear()) t.dir = keep;
    }
    k.tiles.forEach(t => {
      t.marked = true;
      t.face = t.dir ? FACE_CH[(t.dir[1] + 1) * 3 + t.dir[0] + 1] : '.';
      t.glyph = normMotif(['+', '(.)', '/|\\']);
    });
    lv.tithe = { price: costInt(k.boss ? ECON.corpCosts.choirTitheBoss : ECON.corpCosts.choirTithe), paid: false };
  },
  action(lv) {
    const ti = lv.tithe;
    if (!ti) return null;
    return { label: ti.paid ? 'BLESSED' : `TITHE ${ti.price}cr`, ok: !ti.paid && canSpend(ti.price), use() {
      st.run.credits -= ti.price; ti.paid = true; lv.tithed = true;
      for (const t of lv.tiles) if (t.face && t.state === 'closed') t.glyph = normMotif(['+', `(${t.face})`, '/|\\']);
      Sound.shield(); flash(C.money, 0.12, 0.4);
      setMsg('> the followers turn.', C.money);
    } };
  },
};

// the codex, once you've beaten it
CORP_TELL.choir = "pick on faith (no tell) for x2 pay, or tithe and the followers turn to face the real node. deeper, a heretic faces the wrong way: go with the crowd.";
