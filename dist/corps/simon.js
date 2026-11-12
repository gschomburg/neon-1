// NeoN+1 corps/simon.js
'use strict';
NEON_FILES.push(['corps/simon.js', 'v14.89']);
// Its boss gear: REPEAT x3 (repeat), defined with the gear in data/mods.js (ITEMS), its effect in engine/active.js
// (BOSS_GEAR). Design: docs/CORPS.md A33 (Greg, 2026-11-07).

// ---- its own helpers
// SIMON plays a pattern; you play it back. The last step is always the real node; its ICE never breaks.
// One step a beat of the music (Greg, 2026-11-07: "the tone pattern on the beats"): on = the share of a beat it stays
// lit; start / again = the wait before the first beat (ms).
const SIMON = { on: 0.65, start: 350, again: 450 };
// A node's tone, in the key of the music playing (Greg: the tones lead, the track stays out of the way): a minor
// pentatonic over two octaves up from the track's root, by the node's cell. Also REPEAT's (engine/active.js).
const SIMON_STEPS = [0, 3, 5, 7, 10, 12, 15, 17];
function simonTone(cell) {
  const sg = SONGS[trackFor(st.corp ? st.corp.def.key : 'map')], root = (sg && sg.root) || 48;
  return 440 * Math.pow(2, (root + 24 + SIMON_STEPS[cell % SIMON_STEPS.length] - 69) / 12);
}
// The wait to the next beat (a step that would land right on top of now waits for the one after).
function simonToBeat() { const b = beatClock(performance.now()), ms = 60000 / b.bpm, w = (1 - b.phase) * ms; return { ms, wait: w < 40 ? w + ms : w }; }
// A node's character, by depth: plain marks, then upper and lower case pairs, then look-alikes (16 each, one per node).
const SIMON_CHARS = ['gXk#o@%?=+&$vwsz', 'xXoOsSvVwWzZcCkK', 'xX%*+oO0@iIl1|!:'];
const SIMON_COLS = () => [C.danger, C.accent, C.money, C.rep];   // a lit node, like the toy's four colors (by cell)
const simonGlyph = t => normMotif(['', `[${t.simonCh}]`, '']);
// In play: a node gear or a rival hasn't taken out. The pattern skips the rest (Greg: things that remove ICE still do).
const simonLive = t => t.state === 'closed' && !t.ruledOut;
const simonStepLive = s => s.t.safe || simonLive(s.t);

// The pattern: len steps over the live ICE (no node twice in a row), then the real node. With no ICE left, every
// step is the real node. A deep boss ("simon says"): a few extra steps SIMON didn't say (white), never the last.
// (S.white: tier 3 and up, so not in sector 1. Greg, 2026-11-12: "save the white blinks for deeper areas".)
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
  if (S.white && live.length) for (let k = 0; k < Math.max(1, Math.floor(S.len / 3)); k++) {
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
    const bt = simonToBeat();
    await wait(bt.wait);
    if (st.lv !== lv) return;
    S.lit = { t: s.t, said: s.said, until: performance.now() + bt.ms * SIMON.on };
    Sound.simon(s.said ? s.t.tone : s.t.tone * 2);
    shown.push(s.said ? s.t.simonCh : `(${s.t.simonCh})`);
    simonSay('> simon: ' + shown.join('-'), s.said ? C.accent : C.mid);
    await wait(bt.ms * SIMON.on);
    S.lit = null;
  }
  await wait(simonToBeat().wait);   // your turn starts on the beat after the last step
  if (st.lv === lv) simonTurnMsg(lv);
}

// ---- its music
MUSIC_FOR.simon = 'tracker';   // TRACKER (in data/music.js)

// ---- the corp
// ---- A corp with its own pick rule (`tap`) and a fast path for the steps (`intercept`: no probing pause).
CORPS.simon = {
  key: 'simon', name: 'SIMON', code: 'SM', level: 2, pattern: true, musicMax: 0,   // (the music stays low, pad and bass: the tones lead; Greg 2026-11-08)
  intel: '"simon says: watch."',
  tell: null, timer: 12, noLoot: true, noOdds: true,   // (no $ nodes: a wrong tap doesn't break a node, so its loot would pay again and again)
  bossDesc: "boss: a long pattern. deeper, the white ones don't count.",
  rules: () => 'play it back. the last one is real.',
  gear: { key: 'repeat', n: 3 },   // its boss reward: a stack of gear
  // Every node gets one character ([g] [X] [x]) and a tone. The pattern is made once the START mods have locked their
  // ICE (intro).
  dress(lv, k) {
    const set = SIMON_CHARS[k.boss || k.tier >= 3 ? 2 : k.tier >= 2 ? 1 : 0], chars = shuffle([...set], k.r);
    lv.tiles.forEach((t, i) => { t.loaded = false; t.simonCh = chars[i % chars.length]; t.glyph = simonGlyph(t); t.tone = simonTone(t.cell); });
    lv.simon = { len: k.boss ? 6 : 3 + Math.min(3, k.tier || 1), boss: !!k.boss, white: !!k.boss && (k.tier || 1) >= 3, seq: null, pos: 0, lit: null };
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
    Sound.simon(t.tone);
    simonTurnMsg(lv);
    return true;
  },
  // G0D.exe (engine/g0dexe.js), when it knows the corp: plays the pattern back, step by step (waits while SIMON plays it)
  auto(lv, g) {
    const S = lv.simon;
    if (!S || !g.known) return undefined;
    if (!S.seq || st.busy) return null;
    const nx = simonNext(lv);
    return nx ? nx.t : g.real;
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
// (short: it's the FIRST BREACH box's text too, engine/panels.js; Greg 2026-11-12: the long one ran off the screen)
CORP_TELL.simon = "watch simon light the nodes, then play them back in order. the last one is the real node. a wrong step hurts and simon plays it again. deep bosses: white steps weren't said. skip them.";
