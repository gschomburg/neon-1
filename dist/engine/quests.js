// NeoN+1 engine/quests.js: quests (docs/QUESTS.md). The first piece of the main quest: THE DISC.
// It opens once you've cleared a sector and POPS is on your crew. Then a DISC (quest gear) can turn up anywhere loot
// drops: a loot node, a market, the PIER. Pick it up and POPS calls: cash out with it at the next UPLINK. Cash out
// with it and he asks for it (a call with a button); then the scene. After that, the next step (d0g) is "coming".
//
// save.quests.pops: { step, seen, lost, news }
//   step: 'find' (the DISC can drop) -> 'deliver' (cashed out with it; take it to POPS) -> 'd0g' (the scene is done)
//   seen: you've had the DISC once (the quest shows on THE BOARD)   lost: died with it (it drops more for a while)
// The CALL box: a hacker's face, their lines and a button, over everything when things are calm (like the FEAT box).
// The scene: full screen, a line at a time (QUEST_SCENES).
'use strict';
NEON_FILES.push(['engine/quests.js', 'v13.85']);

// ---------------- State ----------------
const QUEST_ODDS = { loot: 0.25, shop: 0.2, fish: 0.08, lost: 2 };   // the DISC's chance at each spot (x2 for a while after you lose one)
const questOf = id => { save.quests = save.quests || {}; return save.quests[id] = save.quests[id] || { step: 'find' }; };
const questOpen = () => statOf('sectors') >= 1 && hkCrewOn('pops');   // a sector cleared (ever) and POPS on the crew
// Quests move in real runs (and in the neon editor, which has its own save); never in the training or multiplayer.
const questRun = () => !!(st.run && !st.run.tutorial && !st.mp && (!st.run.practice || EDITOR));
const holdingDisc = () => hasLoot('disc');   // (in the LOOT bag)
function questStep(id, step) { const q = questOf(id); q.step = step; q.news = true; persist(); }

// ---------------- The DISC dropping ----------------
// where: 'loot' | 'shop' | 'fish'. r: the spot's own roll.
function discDrops(r, where) {
  if (!questRun() || !questOpen() || holdingDisc()) return false;
  const q = questOf('pops');
  if (q.step !== 'find') return false;
  return r() < QUEST_ODDS[where] * (q.lost ? QUEST_ODDS.lost : 1);
}
// Any DISC that lands in your gear (addItem): POPS calls.
function questGot(key) {
  if (key !== 'disc' || !questRun()) return;
  const q = questOf('pops'), first = !q.seen;
  q.seen = true; q.news = true; persist();
  Sound.loot && setTimeout(() => Sound.shield(), 120);
  if (st.mode === 'play' && st.lv) setMsg(`> QUEST: ${QUEST_INFO.pops.name}`, C.rep);
  queueCall('pops', first ? QUEST_LINES.found : q.lost ? QUEST_LINES.foundAgain : QUEST_LINES.foundOld);
  q.lost = false; persist();
}
// The run ends: died with it, and it can drop again (more often for a while).
function questRunEnd(run, win) {
  if (!run || !(run.loot || []).some(s => s.key === 'disc')) return;
  if (!win) { const q = questOf('pops'); q.lost = true; persist(); }
}
// The UPLINK with the DISC: POPS reminds you (once per uplink).
function questUplink() {
  if (holdingDisc() && questRun() && questOf('pops').step === 'find') queueCall('pops', QUEST_LINES.uplink);
}
// CASH OUT with the DISC: the step is done (saved), and POPS asks for it once the results are up.
function questCashOut(run) {
  if (!questRun() || !(run.loot || []).some(s => s.key === 'disc') || questOf('pops').step !== 'find') return;
  questStep('pops', 'deliver');
  setTimeout(() => queueCall('pops', QUEST_LINES.deliver, { text: '[ TAKE IT TO POPS ]', onTap: () => playScene('disc') }), 600);
}

// The words (QUEST_INFO, QUEST_LINES, QUEST_SCENES) live in data/quests.js.

// ---------------- The CALL box ----------------
const CALL_QUEUE = [];
function queueCall(who, lines, btn = null) { CALL_QUEUE.push({ who, lines, btn }); }
function callTick(now) {
  if (st.callBox || st.featBox || st.qScene || !CALL_QUEUE.length || !featCalm()) return;
  st.callBox = Object.assign(CALL_QUEUE.shift(), { t0: now });
  st.kbFocus = st.hoverBtn = null;
  Sound.shield();
}
function callClose() { st.callBox = null; Sound.ui(); }
function callTap(h) {
  if (!h) return;
  if (h.kind === 'btn' && (h.id === 'cok' || h.id === 'cgo')) return h.onTap();
}
function callKey(k) {
  const b = st.callBox;
  if (k === 'escape' || k === 'x') return callClose();
  if (k === 'enter' || k === ' ') { if (b && b.btn) { st.callBox = null; b.btn.onTap(); } else callClose(); }
}
const CALL_W = 32;
function buildCallBox(ctx, now) {
  const { put, bg, cells, addHit } = ctx, b = st.callBox, d = HACKERS[b.who] || { name: b.who.toUpperCase() };
  const face = (ART_FACES[b.who] || { art: ['', '', ''] }).art, ink = hkInk(b.who);
  const rows = b.lines.flatMap(l => wrapText(l, CALL_W - 2));
  const w = CALL_W + 2, h = rows.length + 9, x0 = Math.max(0, Math.floor((L.wc - w) / 2)), y0 = Math.max(0, Math.floor((L.hc - h) / 2));
  clearRect(cells, x0, y0, w, h);
  for (let r = 0; r < h; r++) bg(x0, y0 + r, w, C.bg, 1);
  const head = 'CALL', ring = Math.floor((now - b.t0) / 400) % 2 && now - b.t0 < 1600 ? ' ((( ' : ' ';
  put(x0, y0, ('+- ' + head + ring + '-'.repeat(w)).slice(0, w - 1) + '+', C.rep, 'hud', true);
  put(x0, y0 + h - 1, '+' + '-'.repeat(w - 2) + '+', C.rep, 'hud', true);
  for (let r = 1; r < h - 1; r++) { put(x0, y0 + r, '|', C.rep, 'hud'); put(x0 + w - 1, y0 + r, '|', C.rep, 'hud'); }
  // the face, bobbing a little while the lines type in (like the training's POPS), and the name beside it
  const bob = now - b.t0 < 1800 && Math.floor((now - b.t0) / 180) % 2 ? -1 : 0, sty = hkStyle(b.who);
  face.forEach((l, k) => { bg(x0 + 2, y0 + 2 + k + bob, 5, sty.bg, 1); put(x0 + 2, y0 + 2 + k + bob, l, sty.fg, 'hud', true); });
  put(x0 + 9, y0 + 2, d.name, ink, 'hud', true);
  put(x0 + 9, y0 + 3, 'is calling.', C.mid, 'hud');
  let budget = Math.floor((now - b.t0 - 300) / 18);
  rows.forEach((t, r) => { const shown = t.slice(0, Math.max(0, budget)); budget -= t.length; if (shown) put(x0 + 2, y0 + 6 + r, shown, C.text, 'hud'); });
  const btns = b.btn ? [{ id: 'cgo', text: b.btn.text, onTap: () => { st.callBox = null; b.btn.onTap(); } }, { id: 'cok', text: '[ LATER ]', onTap: callClose }]
    : [{ id: 'cok', text: '[ OK ]', onTap: callClose }];
  const bw = btns.reduce((s, x) => s + x.text.length, 0) + (btns.length - 1) * 2;
  let bx = x0 + Math.floor((w - bw) / 2);
  const by = y0 + h - 2;
  for (const x of btns) {
    const hov = st.hoverBtn === x.id;
    bg(bx, by, x.text.length, hov ? C.bright : C.rep, 1);
    put(bx, by, x.text, C.bg, 'hud', true);
    addHit(bx, by, x.text.length, 1, { kind: 'btn', id: x.id, onTap: x.onTap });
    bx += x.text.length + 2;
  }
}

// ---------------- The scene ----------------
// Full screen: one line at a time, typed in; a tap (or a key) finishes the line, then moves on. The last tap ends it.
function playScene(id) {
  if (!QUEST_SCENES[id]) return;
  st.callBox = null;
  st.qScene = { id, i: 0, t0: performance.now() };
  st.kbFocus = st.hoverBtn = null;
  Sound.whoosh && Sound.whoosh();
}
const sceneTyped = (sc, now) => Math.floor((now - sc.t0) / 28);
const frameLen = fr => fr.title ? 0 : fr.text.length;   // a title card is up at once
function sceneNext() {
  const sc = st.qScene;
  if (!sc) return;
  const fr = QUEST_SCENES[sc.id][sc.i], now = performance.now();
  if (sceneTyped(sc, now) < frameLen(fr)) { sc.t0 = now - frameLen(fr) * 28 - 1; return; }   // finish the line first
  if (sc.i < QUEST_SCENES[sc.id].length - 1) { sc.i++; sc.t0 = now; Sound.tick(); return; }
  sceneEnd();
}
function sceneEnd() {
  const sc = st.qScene;
  st.qScene = null;
  Sound.ui();
  if (sc && sc.id === 'disc' && questOf('pops').step === 'deliver') questStep('pops', 'd0g');
}
function sceneKey(k) { if (k === 'escape') sceneEnd(); else if (k === 'enter' || k === ' ' || k === 'arrowright') sceneNext(); }
function buildScene_(ctx, now) {
  const { put, bg, cells, addHit } = ctx, sc = st.qScene, frames = QUEST_SCENES[sc.id], fr = frames[sc.i];
  clearRect(cells, 0, 0, L.wc, L.hc);
  for (let r = 0; r < L.hc; r++) bg(0, r, L.wc, C.bg, 1);
  addHit(0, 0, L.wc, L.hc, { kind: 'scene' });
  const W = 30, x0 = Math.floor((L.wc - W) / 2), mid = Math.floor(L.hc / 2);
  put(x0, mid - 8, `- ${String(sc.i + 1)} / ${frames.length} -`.padStart(W), C.dim, 'hud');
  const skip = '[ SKIP ]';
  put(L.wc - skip.length - 1, 1, skip, st.hoverBtn === 'qskip' ? C.bright : C.mid, 'hud');
  addHit(L.wc - skip.length - 1, 1, skip.length, 1, { kind: 'btn', id: 'qskip', onTap: sceneEnd });
  if (fr.title) {   // a title card: the quest's name, the step under it
    fr.title.forEach((t, k) => put(Math.floor((L.wc - t.length) / 2), mid - 2 + k * 2, t, k ? C.mid : C.rep, 'hud', !k));
    if (Math.floor(now / 500) % 2) { const t = 'tap to go on'; put(Math.floor((L.wc - t.length) / 2), mid + 6, t, C.dim, 'hud'); }
    return;
  }
  if (fr.art) fr.art.forEach((l, k) => put(Math.floor((L.wc - l.length) / 2), mid - 6 + k, l, C.rep, 'hud', true));
  if (fr.who) {   // the speaker: face + name
    const face = (ART_FACES[fr.who] || { art: [] }).art, sty = hkStyle(fr.who), typing = sceneTyped(sc, now) < fr.text.length;
    const bob = typing && Math.floor(now / 160) % 2 ? -1 : 0;
    face.forEach((l, k) => { bg(x0, mid - 5 + k + bob, 5, sty.bg, 1); put(x0, mid - 5 + k + bob, l, sty.fg, 'hud', true); });
    put(x0 + 7, mid - 4, HACKERS[fr.who] ? HACKERS[fr.who].name : fr.who.toUpperCase(), hkInk(fr.who), 'hud', true);
  }
  const lines = wrapText(fr.text, W);
  let budget = sceneTyped(sc, now);
  lines.forEach((t, k) => { const s = t.slice(0, Math.max(0, budget)); budget -= t.length + 1; if (s) put(x0, mid + k, s, fr.who ? C.bright : C.mid, 'hud', !!fr.who); });
  if (sceneTyped(sc, now) >= fr.text.length && Math.floor(now / 500) % 2) {
    const t = sc.i < frames.length - 1 ? 'tap to go on' : 'tap to end';
    put(Math.floor((L.wc - t.length) / 2), mid + 6, t, C.dim, 'hud');
  }
}
function sceneTap(h) {
  if (h && h.kind === 'btn' && h.id === 'qskip') return h.onTap();
  sceneNext();
}

// ---------------- THE BOARD > QUESTS ----------------
const questsNew = () => !!(save.quests && Object.values(save.quests).some(q => q.news && q.seen));
function questBoardLines(T, X) {
  const q = save.quests && save.quests.pops;
  if (!q || !q.seen) {
    T('no quests yet.', C.mid);
    T('');
    for (const l of wrapText('keep breaching. someone out there will want something from you.', 32)) T(l, C.dim);
    return;
  }
  q.news = false;
  const info = QUEST_INFO.pops, at = Math.max(0, info.steps.findIndex(s => s.key === q.step)), step = info.steps[at];
  X({ text: info.name, col: C.rep, bold: true });
  T(`from ${info.from}`, C.mid);
  T('');
  X({ text: `STEP ${at + 1}: ${step.name}`, col: C.bright, bold: true });
  for (const l of wrapText(q.step === 'find' && q.lost && step.lost ? step.lost : step.goal, 32)) T(l, C.text);
  T('');
  info.steps.slice(0, at).forEach((s, i) => T(`x ${i + 1}. ${s.name}`, C.mid));   // the steps done
  T('');
  if (q.step === 'deliver') X({ box: true, text: 'T A K E   I T   T O   P O P S', id: 'qgive', onTap: () => playScene('disc'), minW: 30 });
  else if (q.step === 'd0g') X({ text: '[ REPLAY THE SCENE ]', id: 'qreplay', onTap: () => playScene('disc') });
}
