// NeoN+1 corps/aegis.js
'use strict';
NEON_FILES.push(['corps/aegis.js', 'v13.05']);
// Its boss mod: AMBUSH (ambush), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// AEGIS: the line breaks through at the bottom.
async function aegisBreach(lv) {
  const run = st.run, real = lv.tiles[lv.safe];
  st.busy = true;
  lv.scanned = true;   // no perfect after a breach
  const bottom = lv.tiles.filter(t => t.row === lv.rows - 1 && t.state === 'closed');
  if (!st.god) hurt(1);
  Sound.trap(); shake(9); flash(C.danger, 0.18, 0.35);
  if (bottom.includes(real)) {
    setMsg('> it broke through. -1 int.', C.danger);
    await wait(500);
    if (run.integrity <= 0) return die();
    return onSafe(real);
  }
  for (const t of bottom) lockTile(t, C.danger, 'breach');
  setMsg('> breach! -1 int. they fall back.', C.danger);
  await wait(450);
  if (run.integrity <= 0) return die();
  const top = Math.min(...lv.tiles.map(t => t.row));
  for (const t of lv.tiles) slideTo(lv, t, t.cell - top * lv.cols, 520);
  await wait(slideMs(520));
  st.busy = false; lv.readyAt = performance.now();
}

// ---- its music
SONGS.warpath = { name: 'WAR PATH',       bpm: 108, root: 40, scale: 'minor',    prog: [0, 0, 5, 6], bass: 'march',   drums: 'march', arp: 'up' };
MUSIC_FOR.aegis = 'warpath';

// ---- the corp
CORPS.aegis = {
  key: 'aegis', name: 'AEGIS DEFENSE', code: 'AE', level: 4, moves: true,
  intel: '"hold the line. then take it."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: a decoy holds back too.',
  rules: () => 'they advance. at the bottom: -1 int.',
  mods: ['ambush'],
  // A formation marches down a row every few seconds. If it reaches the bottom it breaks
  // through (-1 integrity, the front row is spent) and falls back to the top. The real node
  // holds back: it skips every other advance (from the 1st; deeper, from the 2nd).
  // Boss: a decoy skips the 1st advance too.
  dress(lv, k) {
    const r = k.r, cols = lv.cols, real = k.real;
    const others = shuffle(lv.tiles.filter(t => t !== real), r);
    const back = Math.max(0, Math.min(others.length - 1, randInt(r, 1, Math.max(1, cols - 2))));
    const backCols = shuffle([...Array(cols).keys()], r).slice(0, back + 1);
    setCellOf(lv, real, backCols[0]);
    others.slice(0, back).forEach((t, i) => setCellOf(lv, t, backCols[i + 1]));
    const front = others.slice(back), h = Math.max(1, Math.ceil(front.length / cols));
    const cells = shuffle(Array.from({ length: h * cols }, (_, i) => cols + i), r).slice(0, front.length);
    front.forEach((t, i) => setCellOf(lv, t, cells[i]));
    lv.rows = Math.min(6, Math.max(lv.rows, h + 3));
    lv.aegis = { every: k.boss ? 2300 : k.tier >= 2 ? 2700 : 3200, next: null, k: 0, late: k.tier >= 2 || k.boss,
      decoy: k.boss ? others.slice(0, back).find(t => !t.loaded) || null : null };
  },
  tick(lv, lt) {
    const a = lv.aegis;
    if (!a || lv.anchor) return;
    if (a.next == null) a.next = lt + a.every * moveScale();
    if (lt < a.next) return;
    a.next = lt + a.every * moveScale();
    a.k++;
    const real = lv.tiles[lv.safe];
    const lag = t => (t === real && (a.late ? a.k % 2 === 0 : a.k % 2 === 1)) || (t === a.decoy && a.k === 1);
    const movers = lv.tiles.filter(t => !lag(t));
    if (!movers.length) return;
    if (Math.max(...movers.map(t => t.row)) + 1 >= lv.rows) { aegisBreach(lv); return; }
    for (const t of movers) slideTo(lv, t, t.cell + lv.cols, 380);
    Sound.tick(); shake(1.5);
  },
  hint(lv) {
    const a = lv.aegis;
    if (!a) return null;
    if (lv.anchor) return { text: 'aegis> holding.', col: C.accent };
    const left = Math.max(0, (a.next || 0) - (lv.lt || 0)), n = 6, on = Math.round(n * (1 - left / (a.every * moveScale())));
    return { text: `advance [${'>'.repeat(clamp(on, 0, n)).padEnd(n, '.')}]`, col: on >= n - 1 ? C.danger : C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.aegis = "the formation advances a row every few seconds. the real node holds back: it skips every other advance. at the bottom, a breach: -1 integrity.";

// intro art
CORP_ART.aegis = [
  "  .-------.",
  "  |  /|\\  |",
  "  |   |   |",
  "   \\     /",
  "    '---'",
  "",
  "  A E G I S",
];
