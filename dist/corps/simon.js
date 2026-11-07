// NeoN+1 corps/simon.js
'use strict';
NEON_FILES.push(['corps/simon.js', 'v14.55']);
// Its boss gear: REPEAT x3 (repeat), defined with the gear in data/mods.js (ITEMS), its effect in engine/active.js
// (BOSS_GEAR). Design: docs/CORPS.md A33 (Greg, 2026-11-07).

// ---- its own helpers
// SIMON plays a pattern; you play it back. The last step is always the real node; its ICE never breaks.
// on / gap: how long a step lights, and the pause after it (ms). notes: a node's tone, by its cell.
const SIMON = { on: 380, gap: 170, start: 450, again: 500, notes: [262, 294, 330, 392, 440, 523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093] };
// A node's character, by depth: plain marks, then upper and lower case pairs, then look-alikes (16 each, one per node).
const SIMON_CHARS = ['gXk#o@%?=+&$vwsz', 'xXoOsSvVwWzZcCkK', 'xX%*+oO0@iIl1|!:'];
const SIMON_COLS = () => [C.danger, C.accent, C.money, C.rep];   // a lit node, like the toy's four colors (by cell)
const simonGlyph = t => normMotif(['', `[${t.simonCh}]`, '']);
// In play: a node gear or a rival hasn't taken out. The pattern skips the rest (Greg: things that remove ICE still do).
const simonLive = t => t.state === 'closed' && !t.ruledOut;
const simonStepLive = s => s.t.safe || simonLive(s.t);

// The pattern: len steps over the live ICE (no node twice in a row), then the real node. With no ICE left, every
// step is the real node. Boss ("simon says"): a few extra steps SIMON didn't say (white), never the last.
function simonSeq(lv) {
  const S = lv.simon, real = lv.tiles[lv.safe], r = layerRng('simon');
  const live = lv.tiles.filter(t => t !== real && simonLive(t));
  const steps = [];
  for (let k = 0; k < S.len - 1; k++) {
    const prev = steps.length ? steps[steps.length - 1].t : null;
    const opts = live.length > 1 ? live.filter(t => t !== prev) : live.length ? live : [real];
    steps.push({ t: pickR(opts, r), said: true });
  }
  steps.push({ t: real, said: true });
  if (S.boss && live.length) for (let k = 0; k < Math.max(1, Math.floor(S.len / 3)); k++) {
    const at = 1 + Math.floor(r() * (steps.length - 1));
    steps.splice(at, 0, { t: pickR(live, r), said: false });
  }
  S.seq = steps; S.pos = 0;
}
// The next step you have to play (said, still live), moving past the rest. Null once it's all played.
function simonNext(lv) {
  const S = lv.simon;
  while (S.pos < S.seq.length && !(S.seq[S.pos].said && simonStepLive(S.seq[S.pos]))) S.pos++;
  return S.seq[S.pos] || null;
}
// A SIMON line on the terminal: only what's new types in (the part it shares with the line before shows at once),
// so the pattern keeps up with the flashes (engine/scene.js types 16ms a letter from st.msgT).
function simonSay(text, col) {
  const prev = st.msg || '';
  let k = 0;
  while (k < prev.length && k < text.length && prev[k] === text[k]) k++;
  setMsg(text, col);
  st.msgT = performance.now() - 16 * k;
}
// The terminal on your turn: the steps you've played, then a _ for each one left (> simon: g-X-_-_).
function simonTurnMsg(lv) {
  const S = lv.simon, parts = [];
  S.seq.forEach((s, k) => { if (s.said && simonStepLive(s)) parts.push(k < S.pos ? s.t.simonCh : '_'); });
  simonSay('> simon: ' + parts.join('-'), C.text);
}
// SIMON plays the pattern: each step lights with its tone, and the terminal types it (> simon: g-X-(x)-g).
// The clock waits (st.busy); whoever called it hands the layer back.
async function simonPlay(lv, again = false) {
  const S = lv.simon;
  if (!S || !S.seq) return;
  st.busy = true;
  S.pos = 0;
  const shown = [];
  await wait(again ? SIMON.again : SIMON.start);
  for (const s of S.seq) {
    if (st.lv !== lv) return;
    if (!simonStepLive(s)) continue;   // taken out since: not played
    S.lit = { t: s.t, said: s.said, until: performance.now() + SIMON.on };
    Sound.ping(s.said ? s.t.tone : s.t.tone * 2);
    shown.push(s.said ? s.t.simonCh : `(${s.t.simonCh})`);
    simonSay('> simon: ' + shown.join('-'), s.said ? C.accent : C.mid);
    await wait(SIMON.on);
    S.lit = null;
    await wait(SIMON.gap);
  }
  if (st.lv === lv) simonTurnMsg(lv);
}

// ---- its music
MUSIC_FOR.simon = 'tracker';   // TRACKER (in data/music.js)

// ---- the corp
// ---- A corp with its own pick rule (`tap`) and a fast path for the steps (`intercept`: no probing pause).
CORPS.simon = {
  key: 'simon', name: 'SIMON', code: 'SM', level: 2, pattern: true,
  intel: '"simon says: watch."',
  tell: null, timer: 12, noLoot: true, noOdds: true,   // (no $ nodes: a wrong tap doesn't break a node, so its loot would pay again and again)
  bossDesc: "boss: simon says. the white ones don't count.",
  rules: () => 'play the pattern back. the last one is real.',
  gear: { key: 'repeat', n: 3 },   // its boss reward: a stack of gear
  // Every node gets one character ([g] [X] [x]) and a tone. The pattern is made once the START mods have locked their
  // ICE (intro).
  dress(lv, k) {
    const set = SIMON_CHARS[k.boss || k.tier >= 3 ? 2 : k.tier >= 2 ? 1 : 0], chars = shuffle([...set], k.r);
    lv.tiles.forEach((t, i) => { t.loaded = false; t.simonCh = chars[i % chars.length]; t.glyph = simonGlyph(t); t.tone = SIMON.notes[t.cell % SIMON.notes.length]; });
    lv.simon = { len: k.boss ? 6 : 3 + Math.min(3, k.tier || 1), boss: !!k.boss, seq: null, pos: 0, lit: null };
  },
  async intro(lv) { simonSeq(lv); await simonPlay(lv); },
  // The right step: it lights, the next one's up (no probing pause). The last step, a wrong one, or the real node
  // early: the normal pick (the tap hook, below).
  intercept(i) {
    const lv = st.lv, S = lv && lv.simon, t = lv && lv.tiles[i];
    if (!S || !S.seq || !t || t.state !== 'closed') return false;
    const nx = simonNext(lv);
    if (!nx || nx.t !== t || S.pos >= S.seq.length - 1) return false;
    S.pos++;
    S.lit = { t, said: true, until: performance.now() + 220 };
    Sound.ping(t.tone);
    simonTurnMsg(lv);
    return true;
  },
  tap(t) {
    const lv = st.lv, S = lv.simon;
    if (!S || !S.seq) return false;
    const nx = simonNext(lv);
    if (t.safe && nx && nx.t !== t) { lv.payCut = 1; lv.scanned = true; setMsg('> skipped the pattern. no pay.', C.mid); }   // a finder told you (FORM 27B's rule)
    return false;   // the real node opens (onSafe); ICE is a hit (onTrap), then afterHit
  },
  // A wrong step: it hurt, but SIMON's ICE doesn't break. The node closes again and the pattern plays from the start.
  async afterHit(t, lv) {
    if (!lv.simon || !lv.simon.seq || st.run.integrity <= 0) return;
    if (t.lockedBy === 'hit') { t.state = 'closed'; t.lockedBy = null; t.hitAt = null; t.glyph = simonGlyph(t); }
    await simonPlay(lv, true);
  },
  fx(t, live, lv) {
    const L = lv.simon && lv.simon.lit;
    if (!L || L.t !== t || performance.now() > L.until) return null;
    if (!L.said) return { bright: true };   // simon didn't say this one (white)
    const col = SIMON_COLS()[t.cell % 4];
    return { fc: col, gc: col };
  },
};

// the codex, once you've beaten it
CORP_TELL.simon = "1. watch: simon lights nodes one at a time, each with its tone, and the terminal spells it out (g-X-x-g). 2. play it back in the same order. 3. the last step is the real node. a wrong step hurts, and simon plays it all again. the ICE never breaks. boss: steps in white (in brackets on the terminal) weren't said: skip them. gear that takes ICE out takes its steps out too. tap the real node early and it clears, but pays nothing.";
