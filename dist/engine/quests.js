// NeoN+1 engine/quests.js: quests (docs/QUESTS.md). The main quest, SYSTEM FAILURE (POPS's).
// It opens when POPS joins your crew: PROVE IT (clear a sector). Then THE DISC: a DISC (quest gear) can turn up anywhere
// loot drops: a loot node, a market, the PIER (MEDIX's corp boss always has one: the map marks MEDIX). Pick it up and
// POPS calls: cash out with it at the next UPLINK. Cash out with it and he asks for it (a call with a button); then the
// scene, and on through the steps.
//
// save.quests.pops: { step, seen, lost, news }
//   step: a key from QUEST_INFO.pops.steps (data/quests.js says how each one ends): sector -> find -> deliver -> d0g
//         -> trace -> raid -> g0d -> done (saves from before v14.47 start at find)
//   seen: you've had the DISC once   lost: died with it (it drops more for a while)
//   (the quest shows on THE BOARD once POPS is on your crew, or you've had the DISC)
//   leashTold: POPS's LEASH call on your first HAD3S run (questRunStart)
// The CALL box: a hacker's face, their lines and a button, over everything when things are calm (like the FEAT box).
// The scene: full screen, a line at a time (QUEST_SCENES).
'use strict';
NEON_FILES.push(['engine/quests.js', 'v14.71']);

// ---------------- State ----------------
const QUEST_ODDS = { loot: 0.25, shop: 0.2, fish: 0.08, lost: 2 };   // the DISC's chance at each spot (x2 for a while after you lose one)
const questOf = id => { save.quests = save.quests || {}; return save.quests[id] = save.quests[id] || { step: 'sector' }; };
const questOpen = () => statOf('sectors') >= 1 && hkCrewOn('pops');   // a sector cleared (ever) and POPS on the crew
// Quests move in real runs (and in the neon editor, which has its own save); never in the training or multiplayer.
const questRun = () => !!(st.run && !st.run.tutorial && !st.mp && (!st.run.practice || EDITOR));   // (run kinds: engine/save.js)
const holdingDisc = () => hasLoot('disc');   // (in the LOOT bag)
function questStep(id, step) { const q = questOf(id); q.step = step; q.news = true; persist(); }
// The steps and how each ends are data (QUEST_INFO in data/quests.js): the step you're on, and the one after it.
const questStepInfo = id => QUEST_INFO[id].steps.find(s => s.key === questOf(id).step) || {};
const questStepAfter = id => { const s = QUEST_INFO[id].steps; return s[s.findIndex(x => x.key === questOf(id).step) + 1] || null; };
// On to the next step (crew: who joins now), with a QUEST card
function questNext(id) {
  const s = questStepInfo(id), n = questStepAfter(id);
  if (!n) return;
  if (s.crew) { save.legacy = save.legacy || {}; save.legacy['crew_' + s.crew] = 1; }   // (no REP, no LVL: the user, 2026-11-04)
  questStep(id, n.key); questCard(id);
}
// T A K E   I T   T O   P O P S (a box's spaced-out words)
const spacedOut = t => t.split(' ').map(w => [...w].join(' ')).join('   ');
// The UPLINK's reminder line while you carry the step's item (engine/runend.js), or null
// What THE BOARD and the QUEST card show for the step: its name and goal (holding its item: held; lost it: lost)
function questView(id) {
  const info = QUEST_INFO[id], q = questOf(id), at = Math.max(0, info.steps.findIndex(s => s.key === q.step)), step = info.steps[at];
  const held = step.held && step.carry && st.run && hasLoot(step.carry);
  return { at, step, name: held ? step.held.name : step.name, goal: held ? step.held.goal : q.lost && step.lost ? step.lost : step.goal };
}
function questCarryLine() {
  const s = questStepInfo('pops');
  return s.carry && hasLoot(s.carry) && questRun() ? `+ cash out to bring ${QUEST_INFO.pops.from} the ${ITEMS[s.carry].name}` : null;
}

// ---------------- The DISC dropping ----------------
// where: 'loot' | 'shop' | 'fish'. r: the spot's own roll.
const discCan = () => questRun() && questOpen() && !holdingDisc() && questOf('pops').step === 'find';
function discDrops(r, where) {
  return discCan() && r() < QUEST_ODDS[where] * (questOf('pops').lost ? QUEST_ODDS.lost : 1);
}
// MEDIX's boss always drops it while you're looking (meat notes 2026-11-05; the story: b0y was in MEDIX's
// sub-basement). In its boss loot: engine/loot.js bossLoot.
const DISC_CORP = 'medix';
// A node the map marks while you're looking: MEDIX (engine/mapview.js: a ! by it, and a line in its info)
const questHintNode = n => !!(n && n.type === 'corp' && n.corp === DISC_CORP && discCan());
// The DISC for sale in a market: POPS says so, once a market (engine/panels.js openShop, and its rerolls)
function questShop(node, offers) {
  const run = st.run;
  if (!questRun() || !run || !offers.some(o => o.key === 'disc' && !o.sold)) return;
  run.discShops = run.discShops || [];
  if (run.discShops.includes(node.id)) return;
  run.discShops.push(node.id);
  setTimeout(() => queueCall('pops', QUEST_LINES.shop), 900);
}
// The quest's start (meat notes 2026-11-05): the first time you CALL POPS in, in a real run, he joins your crew for
// free (CREW: POPS on THE BOARD shows as bought). Called by hkSpawn (engine/hackers.js).
function questCalled(id) {
  if (id !== 'pops' || hkCrewOn('pops') || !questRun()) return;
  save.legacy = save.legacy || {}; save.legacy.crew_pops = 1;
  const q = questOf('pops'); if (q.step === 'find' && !q.seen) q.step = 'sector';   // (a save from before PROVE IT: start there)
  q.news = true; persist();
  queueCall('pops', QUEST_LINES.joined);
  questCard('pops');
}
// PROVE IT: a sector cleared with POPS on your crew (engine/runend.js sectorClear): he calls, and THE DISC starts.
function questSector() {
  if (st.run && st.run.boyTray) st.run.boyTray = false;   // the OMNI RAID: b0y's tray ride ends with the sector
  if (!questRun() || questOf('pops').step !== 'sector' || !hkCrewOn('pops')) return;
  queueCall('pops', QUEST_LINES.sector);
  questNext('pops');
}
// Any DISC that lands in your gear (addItem): POPS calls.
function questGot(key) {
  if (key === 'dogtag' && questRun()) { const q = questOf('pops'); q.news = true; persist(); setTimeout(() => Sound.shield(), 120); queueCall('pops', QUEST_LINES.dogtag); return; }
  if (key !== 'disc' || !questRun()) return;
  const q = questOf('pops'), first = !q.seen;
  q.seen = true; q.news = true; persist();
  Sound.loot && setTimeout(() => Sound.shield(), 120);
  if (st.mode === 'play' && st.lv) setMsg(`> QUEST: ${QUEST_INFO.pops.name}`, C.rep);
  queueCall('pops', first ? QUEST_LINES.found : q.lost ? QUEST_LINES.foundAgain : QUEST_LINES.foundOld);
  q.lost = false; persist();
  if (questOf('pops').step === 'find') questCard('pops');   // the step turns into GET OUT WITH THE DISC
}
// The run ends: died with it, and it can drop again (more often for a while).
function questRunEnd(run, win) {
  if (!run || !(run.loot || []).some(s => s.key === 'disc')) return;
  if (!win) { const q = questOf('pops'); q.lost = true; persist(); }
}
// The UPLINK with the step's item (the DISC, the DOGTAG): POPS reminds you (once per uplink).
function questUplink() {
  const s = questStepInfo('pops');
  if (s.carry && hasLoot(s.carry) && questRun()) queueCall('pops', QUEST_LINES[s.uplinkLine]);
}
// CASH OUT with the step's item: the step is done (saved), and POPS asks for it once the results are up (its button:
// the next step's scene, e.g. the DISC -> TAKE IT TO POPS, the DOGTAG -> GO TO POPS, the trace).
function questCashOut(run) {
  const s = questStepInfo('pops'), n = questStepAfter('pops');
  if (!questRun() || !s.carry || !n || !(run.loot || []).some(x => x.key === s.carry)) return;
  questStep('pops', n.key);
  setTimeout(() => queueCall('pops', QUEST_LINES[s.doneLine], { text: `[ ${n.goTo} ]`, onTap: () => playScene(n.scene) }), 600);
}
// ---------------- DOG DAYS (docs/QUESTS.md step 5) ----------------
// The HAD3S seed: two sectors, THE HUNT in both (d0g in some corps and on the bosses), ZERO DAY on the map. A d0g win:
// finishing a corp he's in before he takes its last node (else he escaped). Wins count anywhere while you're on the step.
// At ten, the DOGTAG drops (again on the next win if you lose it); cash out with it and the trace starts.
const HAD3S_SECTORS = 2;
const d0gWinsNeeded = () => (QUEST_INFO.pops.steps.find(s => s.key === 'd0g') || {}).wins || 10;
function questD0g(h) {
  if (!questRun() || questOf('pops').step !== 'd0g' || h.exorcised) return;
  const q = questOf('pops'), need = d0gWinsNeeded();
  if (h.stoleLast) { setTimeout(() => setMsg("> d0g escaped. he got the corp's last node first.", C.danger), 900); return; }
  q.d0g = (q.d0g || 0) + 1; q.news = true; persist();
  setTimeout(() => setMsg(`> d0g beaten. ${Math.min(q.d0g, need)} / ${need} for POPS.`, C.rep), 900);
  if (q.d0g >= need && !hasLoot('dogtag')) setTimeout(() => addItem('dogtag'), 1500);
}
const runHad3s = () => startRun('HAD3S', false);
// THE BOARD > QUESTS: [ PLAY IT ] on a step with a seed (HAD3S, H3AV3N): set it like a typed seed and start
function questPlaySeed(seed) {
  if (st.transitioning || st.run) return;
  st.seed = seed; st.practice = false; st.seeded = false;
  startRun(seed, false);
}
// OMNI RAID: break an OMNI boss with b0y there (engine/run.js finishCorp): HEAVEN'S GATE.
function questOmni(c) {
  if (!questRun() || questOf('pops').step !== 'raid' || !c || c.def.key !== 'omni' || !(c.hk || []).some(h => h.id === 'b0y')) return;
  setTimeout(() => playScene('gate'), 900);
}
// A run starts on the OMNI RAID: b0y's number comes with you, and he calls (once).
function questRunStart(run) {
  if (run.quest === 'had3s' && questRun()) {   // HAD3S, the first time: POPS tells you about the LEASH you start with (the user, 2026-11-06)
    const q = questOf('pops'); if (!q.leashTold) { q.leashTold = true; persist(); setTimeout(() => queueCall('pops', QUEST_LINES.leash), 2500); }
  }
  if (!questRun() || questOf('pops').step !== 'raid' || !hkCrewOn('b0y')) return;
  run.boyTray = true;   // b0y rides in the tray ([b]) until you clear the sector (Greg, 2026-11-06; was a CALL b0y stack: engine/heaven.js boyTrayCall)
  const q = questOf('pops'); if (!q.raidCalled) { q.raidCalled = true; persist(); setTimeout(() => queueCall('b0y', QUEST_LINES.raid, null, boyTrayHint), 2500); }   // (then the hint: his [b])
}

// The words (QUEST_INFO, QUEST_LINES, QUEST_SCENES) live in data/quests.js.

// ---------------- The CALL box ----------------
const CALL_QUEUE = [];
function queueCall(who, lines, btn = null, onClose = null) { CALL_QUEUE.push({ who, lines, btn, onClose }); }   // (onClose: put away without a button)
// A QUEST card (the call box, no face): the quest's name, the step you're on now, its goal (and seed).
function questCard(id) {
  const info = QUEST_INFO[id], v = questView(id);
  CALL_QUEUE.push({ who: info.from.toLowerCase(), quest: { name: info.name, step: `STEP ${v.at + 1}: ${v.name}`, seed: v.step.seed }, lines: [v.goal] });
}
function callTick(now) {
  if (st.callBox || st.featBox || (st.qScene && !sceneDark(now)) || !CALL_QUEUE.length || !featCalm()) return;   // (after a scene: over its dark)
  st.callBox = Object.assign(CALL_QUEUE.shift(), { t0: now });
  st.kbFocus = st.hoverBtn = null;
  Sound.shield();
}
function callClose() { const b = st.callBox; st.callBox = null; Sound.ui(); if (b && b.onClose) b.onClose(); }   // (onClose: closed without a button)
function callTap(h) {
  if (!h) return;
  if (h.kind === 'btn' && (h.id === 'cok' || h.id === 'cgo' || /^cb\d$/.test(h.id))) return h.onTap();
}
function callKey(k) {
  const b = st.callBox;
  if (k === 'escape' || k === 'x') return callClose();
  if (k === 'enter' || k === ' ') { const go = b && (b.btns ? b.btns[0] : b.btn); if (go) { st.callBox = null; go.onTap(); } else callClose(); }
}
const CALL_W = 32;
function buildCallBox(ctx, now) {
  const { put, bg, cells, addHit } = ctx, b = st.callBox, d = HACKERS[b.who] || { name: b.who.toUpperCase() };
  const face = (ART_FACES[b.who] || { art: ['', '', ''] }).art, ink = hkInk(b.who);
  const rows = b.lines.flatMap(l => wrapText(l, CALL_W - 2));
  const w = CALL_W + 2, h = rows.length + 9, x0 = Math.max(0, Math.floor((L.wc - w) / 2)), y0 = Math.max(0, Math.floor((L.hc - h) / 2));
  clearRect(cells, x0, y0, w, h);
  popupBg(bg, 'call', x0, y0, w, h);   // (its look: POPUP_LOOK, engine/render.js)
  const head = b.quest ? 'QUEST' : 'CALL', ring = !b.quest && Math.floor((now - b.t0) / 400) % 2 && now - b.t0 < 1600 ? ' ((( ' : ' ';
  put(x0, y0, ('+- ' + head + ring + '-'.repeat(w)).slice(0, w - 1) + '+', C.rep, 'hud', true);
  put(x0, y0 + h - 1, '+' + '-'.repeat(w - 2) + '+', C.rep, 'hud', true);
  for (let r = 1; r < h - 1; r++) { put(x0, y0 + r, '|', C.rep, 'hud'); put(x0 + w - 1, y0 + r, '|', C.rep, 'hud'); }
  // the face, bobbing a little while the lines type in (like the training's POPS), and the name beside it
  const bob = now - b.t0 < 1800 && Math.floor((now - b.t0) / 180) % 2 ? -1 : 0, sty = hkStyle(b.who);
  if (b.quest) {   // a QUEST card: the quest, the new step, its seed
    put(x0 + 2, y0 + 2, b.quest.name, C.rep, 'hud', true);
    put(x0 + 2, y0 + 3, b.quest.step, C.bright, 'hud', true);
    if (b.quest.seed) { const t = 'seed: ', sx = x0 + 2 + t.length; put(x0 + 2, y0 + 4, t, C.mid, 'hud'); bg(sx, y0 + 4, b.quest.seed.length + 2, C.rep, 1); put(sx + 1, y0 + 4, b.quest.seed, C.bg, 'hud', true); }
  } else {
    // the chip is 6 cells wide, the face centered in it (half a cell in): 5 x 3 cells is taller than wide, and the face
    // looked squashed next to the training's square chip (the user, 2026-11-06)
    face.forEach((l, k) => { bg(x0 + 2, y0 + 2 + k + bob, 6, sty.bg, 1); put(x0 + 2.5, y0 + 2 + k + bob, l, sty.fg, 'hud', true); });
    put(x0 + 10, y0 + 2, d.name, ink, 'hud', true);
    put(x0 + 10, y0 + 3, 'is calling.', C.mid, 'hud');
  }
  let budget = Math.floor((now - b.t0 - 300) / 18);
  rows.forEach((t, r) => { const shown = t.slice(0, Math.max(0, budget)); budget -= t.length; if (shown) put(x0 + 2, y0 + 6 + r, shown, C.text, 'hud'); });
  const btns = b.btns ? b.btns.map((x, i) => ({ id: 'cb' + i, text: x.text, onTap: () => { st.callBox = null; x.onTap(); } }))   // (its own buttons: the G0D ending)
    : b.btn ? [{ id: 'cgo', text: b.btn.text, onTap: () => { st.callBox = null; b.btn.onTap(); } }, { id: 'cok', text: '[ LATER ]', onTap: callClose }]
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
function playScene(id, onEnd = null) {   // (onEnd: what comes after it: the H3AV3N ending)
  if (!QUEST_SCENES[id]) return;
  st.callBox = null;
  st.qScene = { id, i: 0, t0: performance.now(), onEnd };
  st.kbFocus = st.hoverBtn = null;
  Sound.whoosh && Sound.whoosh();
}
const sceneTyped = (sc, now) => Math.floor((now - sc.t0) / 28);
const frameLen = fr => fr.title ? 0 : fr.text.length;   // a title card is up at once
// ---- A strip scene (data/quests.js, disc): one tall page; each frame's art draws in, then its text types under it,
// and the page scrolls up to keep the newest at the bottom. Timings (ms): gap / reveal = a layer's default start step
// and draw-in time; type = a character; pause / comma = the extra wait after a sentence / a comma.
// Words that show on their own colors in a scene's text (the user, 2026-11-04): a hacker's id (their name, on their
// colors: d0g white on red), or { word, fg, bg } (palette names: a seed in the quest color).
const STRIP_CHIPS = ['d0g', 'b0y', { word: 'HAD3S', fg: 'bg', bg: 'rep' }, { word: 'H3AV3N', fg: 'bg', bg: 'rep' }];
const STRIP = { w: 32, gap: 420, reveal: 700, type: 28, pause: 480, comma: 160, top: 3, foot: 4, ease: 3 };
const isStrip = id => QUEST_SCENES[id].some(f => f.pic);
// A frame's art: a scene_art.js canvas, or a hacker's full logo block (their logo + mark and name, on their colors:
// logoBlock, engine/multiplayer.js) made into one.
function stripLogo(id, pic = {}) {
  const p = id === '@you' ? profile() : null;   // '@you': your own logo, name and colors (the ending)
  // (pic.name / pic.style: a logo with no hacker behind it, G0D's)
  const blk = p ? logoBlock(p.logo, p.name, styleOf(p.style)) : logoBlock(id, pic.name || (HACKERS[id] ? HACKERS[id].name : id), pic.style || hkStyle(id)), w = blk[0].text.length;
  return { w: 36, h: blk.length, fg: blk[0].col, bgc: blk[0].bgCol, bw: w, layers: { logo: { x: Math.floor((36 - w) / 2), y: 0, rows: blk.map(b => b.text) } } };
}
const stripArt = pic => pic.logo ? stripLogo(pic.logo, pic) : SCENE_ART[pic.art];
const picRows = pic => pic.rows || [0, stripArt(pic).h - 1];
const picLayers = pic => { if (!pic.logo) return pic.layers; const a = stripArt(pic); return [Object.assign({ n: 'logo', col: a.fg, glitch: true, dur: 900, box: { w: a.bw, col: a.bgc } }, HACKERS[pic.logo] && HACKERS[pic.logo].tics ? { tics: HACKERS[pic.logo].tics } : {}, pic.look || {})]; };   // (a hacker's tics: data/hackers.js)
const layerAt = (ly, k) => ly.at != null ? ly.at : k * STRIP.gap;
const layerEnd = (ly, k) => layerAt(ly, k) + (ly.dur || STRIP.reveal) + (ly.slide ? (ly.slide.at || 0) + ly.slide.ms : 0);   // (a progress runs on past it: the text doesn't wait)
const stripArtMs = fr => fr.pic ? Math.max(...picLayers(fr.pic).map(layerEnd)) + (fr.pic.hold || 0) : fr.upload ? UPLOAD.in : 0;
// ---- An upload frame (data/quests.js upload: PRODIGAL's DISC into b0y): a bar the mold has grown over draws in, the
// line types, then a tap starts the fill. The mold pushes it back twice (back: [time, fill] points, 0-1), then it's
// in. Its own tap to go on after. in / ms: how long the bar takes to draw in / to fill.
const UPLOAD = { w: 26, rows: 3, in: 900, ms: 4200, back: [[0, 0], [0.28, 0.4], [0.36, 0.22], [0.6, 0.68], [0.68, 0.5], [1, 1]],
  col: '#4aa8ff', moldCh: '%&#*@;' };
const uploadFill = u => { const b = UPLOAD.back; for (let i = 1; i < b.length; i++) if (u <= b[i][0]) { const [t0, f0] = b[i - 1], [t1, f1] = b[i]; return f0 + (f1 - f0) * (u - t0) / (t1 - t0); } return 1; };
const uploadU = (sc, now) => sc.upI === sc.i ? Math.min(1, (now - sc.up) / UPLOAD.ms) : -1;   // -1: not started
function drawUpload(ctx, now, sc, fr, at, el, yOf, inView) {
  const { put, bg } = ctx, W = UPLOAD.w, x0 = Math.floor((L.wc - W - 2) / 2), cur = sc.lay[sc.i] === at;
  const u = cur ? uploadU(sc, now) : 1, fill = u < 0 ? 0 : uploadFill(u), lit = Math.round(fill * W), drawn = Math.min(1, el / UPLOAD.in);
  const mold = G0D_COLS.mold, y0 = yOf(at.top), label = fr.upload.from + '  >>  ' + fr.upload.to;
  if (inView(y0)) put(Math.floor((L.wc - label.length) / 2), y0, label, C.mid, 'hud');
  const y1 = yOf(at.top + 1);
  if (inView(y1)) {
    put(x0, y1, '[', C.mid, 'hud'); put(x0 + W + 1, y1, ']', C.mid, 'hud');
    for (let c = 0; c < W; c++) {
      if (c / W > drawn) break;   // the mold creeps in from the left as the frame starts
      if (c < lit) { bg(x0 + 1 + c, y1, 1, UPLOAD.col, 0.35); put(x0 + 1 + c, y1, u >= 1 ? '#' : '=', UPLOAD.col, 'hud', true); continue; }
      const ch = UPLOAD.moldCh[Math.floor(FX.hash(c, 7, Math.floor(now / 260)) * UPLOAD.moldCh.length)];
      put(x0 + 1 + c, y1, ch, c === lit && u > 0 && u < 1 ? C.danger : mold, 'hud');   // (where it meets the fill: the fight)
    }
  }
  const y2 = yOf(at.top + 2);
  if (inView(y2) && u >= 0) {
    const t = u >= 1 ? 'UPLOAD COMPLETE' : 'uploading ' + Math.round(fill * 100) + '%';
    put(Math.floor((L.wc - t.length) / 2), y2, t, u >= 1 ? UPLOAD.col : C.mid, 'hud', u >= 1);
  }
  if (cur && u > 0) {   // its sounds: a crackle each time the mold pushes it back, a rise when it's in
    sc.fired = sc.fired || new Set();
    UPLOAD.back.forEach(([t, f], k) => { if (k && f < UPLOAD.back[k - 1][1] && u >= UPLOAD.back[k - 1][0] && !sc.fired.has('up' + k)) { sc.fired.add('up' + k); Sound.static && Sound.static(0.3); } });
    if (u >= 1 && !sc.fired.has('updone')) { sc.fired.add('updone'); Sound.hkRise && Sound.hkRise(); }
  }
}
// When each character of a line shows (ms from the start of its typing): a pause after a sentence, a short one after a comma.
const stripTimes = new WeakMap();
function textTimes(fr) {
  if (!stripTimes.has(fr)) {
    const out = [], s = fr.text; let t = 0;
    for (let i = 0; i < s.length; i++) {
      t += STRIP.type; out.push(t);
      if (s[i + 1] === ' ' && /[.?!]/.test(s[i])) t += STRIP.pause;
      else if (s[i + 1] === ' ' && /[,:;]/.test(s[i])) t += STRIP.comma;
    }
    stripTimes.set(fr, out);
  }
  return stripTimes.get(fr);
}
const typedBy = (fr, ms) => { const tt = textTimes(fr); let n = 0; while (n < tt.length && tt[n] <= ms) n++; return n; };
const frameMs = fr => fr.title ? 0 : stripArtMs(fr) + (textTimes(fr).slice(-1)[0] || 0);
function stripLayout(id) {   // where each frame sits on the page (rows)
  let y = 0;
  return QUEST_SCENES[id].map(fr => {
    if (fr.title) return null;
    const top = y, rr = fr.pic ? picRows(fr.pic) : null, artH = rr ? rr[1] - rr[0] + 1 : fr.upload ? UPLOAD.rows : 0;
    y += artH ? artH + 1 : 0;
    const lines = wrapText(fr.text, STRIP.w), textTop = y + (fr.who ? 1 : 0);
    y = textTop + lines.length;
    const out = { top, artH, textTop, lines, bottom: y };
    y += 2;
    return out;
  });
}
function buildStrip(ctx, now, sc, frames) {
  const { put, bg } = ctx, lay = sc.lay = sc.lay || stripLayout(sc.id), cur = lay[sc.i], fr0 = frames[sc.i];
  sc.fired = sc.fired || new Set();
  const once = (key, f) => { if (!sc.fired.has(key)) { sc.fired.add(key); f(); } };
  // the camera: a frame with hold keeps its art in place until it's all in (and a beat more), then the page scrolls
  const view = L.hc - STRIP.top - STRIP.foot, el0 = now - sc.t0;
  const restAt = at => Math.max(0, at.top + at.artH - view);   // its art's bottom at the bottom of the view
  const holding = fr0.pic && fr0.pic.hold && el0 < stripArtMs(fr0);
  const target = holding ? restAt(cur) : Math.max(0, cur.bottom + 1 - view);
  const dt = Math.min(0.1, Math.max(0, (now - (sc.last || now)) / 1000)); sc.last = now;
  if (sc.cam == null) sc.cam = target;
  sc.cam += (target - sc.cam) * (1 - Math.exp(-dt * STRIP.ease));
  const cam = sc.cam, yOf = r => STRIP.top + r - Math.round(cam), inView = y => y >= STRIP.top && y < L.hc - STRIP.foot + 1;
  for (let j = 0; j <= sc.i; j++) {
    const fr = frames[j], at = lay[j];
    if (!at) continue;
    const el = j < sc.i ? Infinity : now - sc.t0, textStart = stripArtMs(fr);
    if (fr.pic) {
      const art = stripArt(fr.pic), [r0, r1] = picRows(fr.pic), x0 = Math.floor((L.wc - art.w) / 2), lys = picLayers(fr.pic);
      const taken = new Set(), base = restAt(at);
      // front to back: a mark hides what's behind it; a solid layer hides it all between its first and last mark on a row
      lys.map((ly, k) => [ly, k]).reverse().forEach(([ly, k]) => {
        const src = ly.fog || ly.fly ? null : art.layers[ly.n];
        if (!ly.fog && !ly.fly && !src) return;
        const t = el - layerAt(ly, k), dur = ly.dur || STRIP.reveal, p = Math.min(1, Math.max(0, t / dur)), col = FX.col(ly.col);
        if (p <= 0) return;
        const shift = ly.par ? Math.round(ly.par * Math.max(0, cam - base)) : 0;
        const rowY = Y => yOf(at.top + Y - r0 + shift);   // a canvas row on the screen
        // a slide: from an offset to where it's drawn, after it's in
        let dx = ly.off ? ly.off[0] : 0, dy = ly.off ? ly.off[1] : 0;   // (off: drawn this far from where it is in the save)
        if (ly.slide) {
          const s = ly.slide, k2 = Math.min(1, Math.max(0, (t - dur - (s.at || 0)) / s.ms)), e = FX.easeOut(k2);
          const to = s.to || [0, 0];
          dx += Math.round(s.from[0] + (to[0] - s.from[0]) * e); dy += Math.round(s.from[1] + (to[1] - s.from[1]) * e);
          if (k2 > 0 && s.startSound && j === sc.i) once(j + ':' + k + ':slide0', () => Sound[s.startSound] && Sound[s.startSound]((s.ms || 1000) / 1000));
          if (k2 >= 1 && s.sound && j === sc.i) once(j + ':' + k + ':slide', () => Sound[s.sound] && Sound[s.sound]());
        }
        // FLY: things crossing the sky right to left, off the grid (smooth), behind whatever is in front
        if (ly.fly) {
          for (const v of ly.fly) {
            const x = art.w + 1 - (((now + (v.delay || 0)) % v.every) / 1000) * v.speed, Y = v.y;
            if (x < -v.art.length - 1 || Y < r0 || Y > r1) continue;
            const sy = rowY(Y);
            if (!inView(sy)) continue;
            for (let i = 0; i < v.art.length; i++) {
              const X = x + i;
              if (v.art[i] === ' ' || X < 0 || X > art.w - 1 || taken.has(Math.round(X) + ',' + sy)) continue;
              put(x0 + X, sy, v.art[i], v.col ? FX.col(v.col) : col, 'hud');
            }
          }
          return;
        }
        // the layer's effects: data/fx.js's looks, with the layer's own settings over them
        const fl = ly.flicker ? FX.look('flicker', ly.flicker) : null, gl = ly.glitch ? FX.look('glitch', ly.glitch) : null;
        const BL = ly.blink && FX.look('blink', ly.blink), CU = ly.cue && FX.look('cue', ly.cue), LT = ly.lights && FX.look('lights', ly.lights);
        const SP = ly.spin && FX.look('spin', ly.spin), PR = ly.progress && FX.look('progress', ly.progress), EM = ly.ember && FX.look('ember', ly.ember);
        // on a mask (an effect's where: data/fx.js mask): glitch / flicker all along in drifting patches, tint pulling the color there
        const GW = gl && gl.where ? FX.where(gl.where) : null, FW = fl && fl.where ? FX.where(fl.where) : null;
        const TN = ly.tint ? FX.look('tint', ly.tint) : null, TW = TN && TN.where ? FX.where(TN.where) : null;
        // TICS (a glitchy logo, like G0D's flickers): a row tears sideways, marks swap (tics.swap: [[from, to]], d0g's
        // d -> b), a little cluster flashes to noise; all in tics.col
        const TC = ly.tics && p >= 1 ? FX.look('tics', ly.tics) : null, TR = TC && FX.look('tear', TC.tear);
        const SWP = TC && TC.swap && FX.swapOn(FX_LOOKS.swap, now), BU = TC && FX.burst(FX.look('burst', TC.burst), now, 0, r0, art.w, r1 - r0 + 1);
        // GLOW: a light that throws a cone down (a lamp): a faint wash behind, and the marks in it lit
        const GL = ly.glow ? FX.glow(FX.look('glow', ly.glow), now, t, dur) : null;
        if (GL) FX.glowWash(GL, (X, Y, w, c, a) => { if (Y < r0 || Y > r1) return; const sy = rowY(Y); if (inView(sy)) bg(x0 + X, sy, w, c, a); });
        const FG = ly.fog && FX.look('fog', ly.fog);
        const rows = FG ? FX.fogRows(FG, now, art.w) : src.rows, sx = FG ? 0 : src.x, syy = FG ? FG.rows[0] : src.y;
        const bottom = syy + rows.length - 1;
        // the cue: marks that stay dark until a word of the text types in, then glitch on (and flicker now and then)
        let cueT = null;
        if (CU) { const i = fr.text.indexOf(CU.word); cueT = i < 0 ? 0 : textStart + textTimes(fr)[i + CU.word.length - 1]; }
        rows.forEach((row, r) => {
          const Y = syy + r + dy;
          if (Y < r0 || Y > r1 || (ly.par && Y + shift > Math.min(bottom, r1))) return;
          const sy = rowY(Y);
          if (!inView(sy)) return;
          const cueAt = CU ? row.indexOf(CU.match) : -1, rel = (syy + r - r0) / Math.max(1, r1 - r0);
          const hid = ly.hide ? new Set(ly.hide.flatMap(h => { const out = []; let i = row.indexOf(h); while (i >= 0) { for (let q = 0; q < h.length; q++) out.push(i + q); i = row.indexOf(h, i + 1); } return out; })) : null;
          const blinkAt = BL ? row.indexOf(BL.match) : -1;
          const tear = TC ? FX.tear(TR, now, r) : 0;
          if (ly.box) { const a = FX.boxIn(p, r, now), bc = FX.col(ly.box.col); bg(x0 + sx + dx + tear, sy, ly.box.w, bc, a); if (r < rows.length - 1) bg(x0 + sx + dx + tear, sy + 0.5, ly.box.w, bc, a); }   // a logo's block of color (the half step covers the gap between rows)
          // PROGRESS: the mark after progress.after on each row, top to bottom, lights up one by one, spinning
          const prAt = PR ? row.indexOf(PR.after) : -1, prC = prAt >= 0 ? prAt + PR.after.length : -1;
          const prList = PR ? (src._pr = src._pr || src.rows.map(rw => { const i = rw.indexOf(PR.after); return i >= 0 && PR.ch.includes(rw[i + PR.after.length]); })) : null;
          const prRank = prList && prList[r] ? prList.slice(0, r).filter(Boolean).length : -1, prN = prList ? prList.filter(Boolean).length : 0;
          for (let c = 0; c < row.length; c++) {
            const X = sx + c + dx;
            if (row[c] === ' ' || X < 0 || X >= art.w || taken.has(X + ',' + sy) || (hid && hid.has(c))) continue;
            // (the effects key on the mark's place in its layer, kx / ky, not where it's drawn: they ride along with a slide)
            const kx = sx + c, ky = syy + r, cell = { ch: row[c], ink: col, X: kx, Y: ky };
            if (blinkAt >= 0 && c >= blinkAt && c < blinkAt + BL.match.length) { const b = FX.blink(BL, now, c - blinkAt); if (b != null) cell.ch = b; }
            if (!FX.reveal(cell, p, FX.order(rel, ly.from, kx, ky), fl, gl, now)) continue;
            if (cueAt >= 0 && c >= cueAt && c < cueAt + CU.match.length) {   // the cue's marks
              const since = el - cueT;
              if (since >= 0 && j === sc.i) once(j + ':' + k + ':cue', () => Sound[CU.sound] && Sound[CU.sound]());
              if (!FX.cue(cell, CU, since, now, c, r)) continue;
            }
            if (LT) FX.lights(cell, LT, now);   // windows and LEDs: some go on and off, some (pulse) breathe
            if (GL) FX.glowCell(cell, GL);
            if (SP && j === sc.i && SP.ch.includes(cell.ch) && t > dur + SP.after) cell.ch = FX.spin(SP, now, r);   // the drive spins up
            if (prRank >= 0 && c === prC) {
              const k2 = (t - PR.at) / PR.ms, lit = Math.floor(k2 * prN);
              if (k2 >= 0 && PR.sound && j === sc.i) once(j + ':' + k + ':prog', () => Sound[PR.sound] && Sound[PR.sound](PR.ms / 1000));
              if (k2 >= 0 && prRank <= lit) {
                cell.ink = FX.col(PR.col);
                if (prRank === lit && k2 < 1) { cell.ch = FX.cycle(PR.head, now, PR.headMs); cell.ink = FX.col(PR.headCol); }   // the head of the bar
                else if (k2 >= 1) cell.ch = FX.cycle(PR.done, now, PR.doneMs, prRank);   // all in: they spin
              }
            }
            if (TC) {
              if (SWP) { const sw = TC.swap.find(s => s[0] === cell.ch); if (sw) { cell.ch = sw[1]; cell.ink = FX.col(TC.col); } }
              const nz = FX.burstCh(BU, kx, ky);
              if (nz) { cell.ch = nz; cell.ink = FX.col(TC.col); }
            }
            if (EM && kx === EM.x && ky === EM.y) FX.ember(cell, EM, now);   // EMBER: a cigarette's tip, glowing up now and then
            if (TN) FX.tint(cell, TN, TW ? FX.mask(TW, kx, ky, now, t) : 1);
            if (GW) FX.glitchOn(cell, gl, FX.mask(GW, kx, ky, now, t), now);
            if (FW && FX.flickerOff(cell, fl, FX.mask(FW, kx, ky, now, t), now)) continue;
            put(x0 + X + tear, sy, cell.ch, cell.ink, 'hud');
            taken.add(X + ',' + sy);
          }
          if (ly.cut && Y >= ly.cut.rows[0] && Y <= ly.cut.rows[1]) for (let X = 0; X < art.w; X++) if ((ly.cut.a || 1) * X + (ly.cut.b || 1) * Y >= ly.cut.c) taken.add(X + ',' + sy);   // CUT: hides what's behind past a line (a slot)
          if (ly.solid && (p >= 1 || p >= FX.orderRow(rel, ly.from))) {   // (a solid row hides what's behind once it starts in)
            const a = row.search(/\S/), b = row.length - 1 - [...row].reverse().join('').search(/\S/);
            for (let c = a; c <= b; c++) taken.add((sx + c + dx) + ',' + sy);
          }
        });
        if (gl && j === sc.i) once(j + ':' + k + ':glitch', () => Sound[gl.sound] && Sound[gl.sound](gl.vol));
        // SMOKE: puffs off a point, drifting up and fading out
        if (ly.smoke && p >= 1) FX.smoke(FX.look('smoke', ly.smoke), now, (X, Y, ch, ink) => { if (Y < r0 || Y > r1) return; const sy = rowY(Y); if (inView(sy)) put(x0 + X, sy, ch, ink, 'hud'); });
      });
    }
    if (fr.upload) drawUpload(ctx, now, sc, fr, at, el, yOf, inView);
    // its text, under the art (older frames dimmer), with a pause between sentences
    let budget = j < sc.i ? Infinity : typedBy(fr, el - textStart);
    if (j === sc.i) {   // a soft tick as each mark types in (a lower blip when someone's talking)
      if (sc.typedAt !== j) { sc.typedAt = j; sc.typed = 0; }
      const n = Math.min(budget, fr.text.length);
      if (n > sc.typed) { if (fr.text[n - 1] !== ' ' && now - (sc.tickAt || 0) > 38 && Sound.typeTick) { Sound.typeTick(!!fr.who); sc.tickAt = now; } sc.typed = n; }
    }
    const tx = Math.floor((L.wc - STRIP.w) / 2), old = j < sc.i;
    if (fr.who && budget > 0 && inView(yOf(at.textTop - 1))) put(tx, yOf(at.textTop - 1), (HACKERS[fr.who] ? HACKERS[fr.who].name : fr.who.toUpperCase()) + ':', old ? C.mid : hkInk(fr.who), 'hud', true);
    at.lines.forEach((t, k) => {
      const s = t.slice(0, Math.max(0, budget)); budget -= t.length + 1;
      const y = yOf(at.textTop + k);
      if (s && inView(y)) {
        // a hacker's name in STRIP_CHIPS shows on their colors (d0g: white on his red), as much of it as has typed
        let plain = s;
        for (const id of STRIP_CHIPS) {
          const hk = typeof id === 'string', nm = hk ? (HACKERS[id] ? HACKERS[id].name : id) : id.word, sty = hk ? hkStyle(id) : { fg: FX.col(id.fg), bg: FX.col(id.bg) };
          for (let i = t.indexOf(nm); i >= 0 && i < s.length; i = t.indexOf(nm, i + 1)) {
            const part = s.slice(i, i + nm.length);
            bg(tx + i, y, part.length, sty.bg, old ? 0.55 : 1);
            put(tx + i, y, part, old ? mixHex(sty.fg, sty.bg, 0.35) : sty.fg, 'hud', true);
            plain = plain.slice(0, i) + ' '.repeat(part.length) + plain.slice(i + part.length);
          }
        }
        put(tx, y, plain, old ? C.mid : fr.who ? C.bright : C.text, 'hud', !!fr.who && !old);
      }
    });
  }
  put(1, 1, `- ${sc.i + 1} / ${frames.length} -`, C.dim, 'hud');
  const upU = fr0.upload ? uploadU(sc, now) : 1;   // (an upload frame: its own tap first, none while it fills)
  if (el0 >= frameMs(fr0) && (upU < 0 || upU >= 1) && Math.floor(now / 500) % 2) {
    const t = upU < 0 ? 'tap to upload' : sc.i < frames.length - 1 ? 'tap to go on' : 'tap to end';
    put(Math.floor((L.wc - t.length) / 2), L.hc - 2, t, upU < 0 ? C.bright : C.dim, 'hud');
  }
}
// A scene's music (data/quests.js SCENE_MUSIC): its song; each frame's mood (or the last one's) says the levels and
// stages it wanders between, a new pick every step ms.
function sceneMusic(sc, now) {
  const M = SCENE_MUSIC[sc.id], frames = QUEST_SCENES[sc.id];
  let mood = M.mood;
  for (let j = 0; j <= sc.i; j++) if (frames[j].mood) mood = frames[j].mood;
  sc.m0 = sc.m0 || now;
  const n = Math.floor((now - sc.m0) / M.step);
  return { song: M.song, level: mood.levels[Math.floor(FX.hash(n, 3) * mood.levels.length)], section: mood.stages[Math.floor(FX.hash(n, 8) * mood.stages.length)],
    urgency: 0, low: false, tempo: 1, pitch: 1 };
}
function sceneNext() {
  const sc = st.qScene;
  if (!sc) return;
  const fr = QUEST_SCENES[sc.id][sc.i], now = performance.now();
  if (isStrip(sc.id)) { if (now - sc.t0 < frameMs(fr)) { sc.t0 = now - frameMs(fr) - 1; return; } }   // (a strip: finish the art and the line first)
  if (fr.upload) {   // an upload frame: this tap starts it; taps while it fills do nothing
    const u = uploadU(sc, now);
    if (u < 0) { sc.up = now; sc.upI = sc.i; Sound.vcrSpin && Sound.vcrSpin(UPLOAD.ms / 1000 * 0.4); return; }
    if (u < 1) return;
  }
  else if (sceneTyped(sc, now) < frameLen(fr)) { sc.t0 = now - frameLen(fr) * 28 - 1; return; }   // finish the line first
  if (sc.i < QUEST_SCENES[sc.id].length - 1) { sc.i++; sc.t0 = now; Sound.tick(); return; }
  sceneEnd();
}
// The beat after a scene (the user, 2026-11-06): the screen goes dark (the scene breaks up into it) and the music fades
// down; the QUEST card for the new step comes up there if there is one; then back to the screen you were on, decoding
// in. dark: ms to go dark; hold: ms it stays dark at least; music: ms the scene's song takes to fade (then silent until
// the next screen's); cardWait: ms it waits for the card to come up. (The editor's looped frames end at once.)
const SCENE_OUT = { dark: 700, hold: 900, music: 1300, cardWait: 2500 };
const sceneDark = now => !!(st.qScene && st.qScene.out && now - st.qScene.out.t0 >= SCENE_OUT.dark);
function sceneEnd() {
  const sc = st.qScene;
  if (!sc || sc.out) return;
  Sound.ui();
  const q0 = CALL_QUEUE.length;
  if (questStepInfo('pops').scene === sc.id) questNext('pops');   // the step's scene: on to the next step, on a QUEST card
  if (sc.fxLoop) { st.qScene = null; if (sc.onEnd) sc.onEnd(); return; }
  sc.out = { t0: performance.now(), card: CALL_QUEUE.length > q0 };
  st.hoverBtn = null;
  Music.fadeOut(SCENE_OUT.music / 1000);
}
function sceneOutTick(now) {
  const sc = st.qScene;
  if (!sc || !sc.out) return;
  const o = sc.out, el = now - o.t0;
  if (st.callBox && st.callBox.quest) o.shown = true;
  if (el < SCENE_OUT.dark + SCENE_OUT.hold || st.callBox || (o.card && !o.shown && el < SCENE_OUT.dark + SCENE_OUT.cardWait)) return;
  st.qScene = null;
  st.boardStart = now;   // the screen under it decodes back in
  if (sc.onEnd) sc.onEnd();
}
// The music while it's dark (engine/boot.js): silent once the scene's song has faded
const sceneOutMusic = now => st.qScene && st.qScene.out && now - st.qScene.out.t0 >= SCENE_OUT.music ? { song: 'none', level: 0, urgency: 0, low: false, tempo: 1, pitch: 1 } : null;
function sceneKey(k) { if (st.qScene && st.qScene.out) return; if (k === 'escape') sceneEnd(); else if (k === 'enter' || k === ' ' || k === 'arrowright') sceneNext(); }
function buildScene_(ctx0, now) {
  const sc = st.qScene, frames = QUEST_SCENES[sc.id], fr = frames[sc.i], { cells } = ctx0;
  const strip = isStrip(sc.id), dark = sc.out ? Math.min(1, (now - sc.out.t0) / SCENE_OUT.dark) : 0;
  { const ex = Math.ceil(L.ox / L.cw) + 1, ey = Math.ceil(L.oy / L.chh) + 1, bg = ctx0.bg;
    clearRect(cells, -ex, -ey, L.wc + 2 * ex, L.hc + 2 * ey);   // the page under it, past the content edges too (a stray [ of the board's [YOU] showed)
    if (strip || dark >= 0.5) for (let y = -ey; y < L.hc + ey; y++) { bg(-ex, y, L.wc + 2 * ex, C.bg, 1); bg(-ex, y + 0.5, L.wc + 2 * ex, C.bg, 1); }   // a strip: the dark bg, light text (the user, 2026-11-04)
    else popupBg(bg, 'scene', -ex, -ey, L.wc + 2 * ex, L.hc + 2 * ey, false); }   // the whole screen, past the content edges (POPUP_LOOK)
  ctx0.addHit(0, 0, L.wc, L.hc, { kind: 'scene' });
  if (dark >= 1) return;   // dark: the QUEST card (if any) comes up over it
  // going dark: the scene breaks up, a mark at a time (each at its own point in the fade)
  const gone = (x, y) => dark > 0 && FX.hash(Math.round(x * 2), Math.round(y * 2), 5) < dark;
  const ctx = !dark ? ctx0 : Object.assign({}, ctx0, {
    put: (x, y, str, col, own, bold) => { for (let k = 0; k < str.length; k++) if (str[k] !== ' ' && !gone(x + k, y)) ctx0.put(x + k, y, str[k], col, own, bold); },
    bg: (x, y, w, col, a) => { if (!gone(x, y)) ctx0.bg(x, y, w, col, a); },
    addHit: () => {} });
  const { put, bg, addHit } = ctx;
  const W = 30, x0 = Math.floor((L.wc - W) / 2), mid = Math.floor(L.hc / 2);
  if (strip && fr.title) put(1, 1, `- ${sc.i + 1} / ${frames.length} -`, C.dim, 'hud');   // a strip's title card: top left, like its other frames (the user: it sat low)
  else if (!strip) put(x0, mid - 8, `- ${String(sc.i + 1)} / ${frames.length} -`.padStart(W), C.dim, 'hud');   // (a strip: its own, top left)
  const skip = '[ SKIP ]';
  put(L.wc - skip.length - 1, 1, skip, st.hoverBtn === 'qskip' ? C.bright : C.mid, 'hud');
  addHit(L.wc - skip.length - 1, 1, skip.length, 1, { kind: 'btn', id: 'qskip', onTap: sceneEnd });
  if (fr.title) {   // a title card: the quest's name, the step under it
    // a long card (the ending's credits) is centered, with its tap under it (it ran over the last lines: the user)
    const n = fr.title.length, top = Math.min(mid - 2, mid - n), tapY = Math.max(mid + 6, top + 2 * n + 1);
    fr.title.forEach((t, k) => put(Math.floor((L.wc - t.length) / 2), top + k * 2, t, k ? C.mid : C.rep, 'hud', !k));
    if (Math.floor(now / 500) % 2) { const t = sc.i < frames.length - 1 ? 'tap to go on' : 'tap to end'; put(Math.floor((L.wc - t.length) / 2), tapY, t, C.dim, 'hud'); }
    return;
  }
  if (strip) return buildStrip(ctx, now, sc, frames);
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
  if (st.qScene && st.qScene.out) return;   // (going dark: taps wait)
  if (h && h.kind === 'btn' && h.id === 'qskip') return h.onTap();
  sceneNext();
}

// ---------------- THE BOARD > QUESTS ----------------
const questsNew = () => !!(save.quests && Object.entries(save.quests).some(([id, q]) => q.news && (q.seen || (id === 'pops' && hkCrewOn('pops')))));
function questBoardLines(T, X) {
  const q = save.quests && save.quests.pops;
  if (!q || !(q.seen || hkCrewOn('pops'))) {
    T('no quests yet.', C.mid);
    T('');
    for (const l of wrapText('put a crew together and maybe you will find some. get to know the other hackers: call them.', 32)) T(l, C.dim);
    return;
  }
  q.news = false;
  const info = QUEST_INFO.pops, v = questView('pops'), at = v.at, step = v.step;
  X({ text: info.name, col: C.rep, bold: true });
  T(`from ${info.from}`, C.mid);
  T('');
  X({ text: `STEP ${at + 1}: ${v.name}`, col: C.bright, bold: true });
  for (const l of wrapText(v.goal, 32)) T(l, C.text);
  if (step.wins) { T(''); X({ text: `d0g: ${Math.min(q.d0g || 0, step.wins)} / ${step.wins}`, col: C.bright, bold: true }); }   // (DOG DAYS: the wins so far)
  if (step.seed) {   // the seed POPS gave you, and (off the title, no run waiting) a link that starts it (the user, 2026-11-06)
    T('');
    if (st.run || st.savedRun) X({ text: `seed: ${step.seed}`, col: C.rep, bold: true });
    else X({ gap: 2, row: [{ text: `seed: ${step.seed}`, col: C.rep }, { text: '[ PLAY IT ]', id: 'qplay', onTap: () => questPlaySeed(step.seed) }] });
  }
  T('');
  info.steps.slice(0, at).forEach((s, i) => T(`x ${i + 1}. ${s.name}`, C.mid));   // the steps done
  T('');
  if (step.goTo) X({ box: true, text: spacedOut(step.goTo), id: 'qgive', onTap: () => playScene(step.scene), minW: 30 });
  else { const last = info.steps.slice(0, at).reverse().find(s => s.scene); if (last) X({ text: '[ REPLAY THE SCENE ]', id: 'qreplay', onTap: () => playScene(last.scene) }); }   // the last scene you saw
}
