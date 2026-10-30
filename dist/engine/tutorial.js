// NeoN+1 engine/tutorial.js: the training run. A guided practice run in its own palette, with POPS, an old
// runner, talking you through it: the public net, a reward (TRACER), the map, then BASIC CORP in 3 layers
// (an ICE hit on purpose, a PATCH, the tell, the boss), the breach reward, and out. One thing at a time;
// while a popup is up, only what it asks for works. What he says is in data/tutorial.js (the neon editor's
// TRAINING tab). Started from the title ([ TRAINING ], until you've done it once) and from HOW TO PLAY.
'use strict';
NEON_FILES.push(['engine/tutorial.js', 'v13.84']);

const TUT = {
  palette: 'c_safeharbor',   // navy + teal: clearly not a normal run
  seed: 'TRAINING',
  corpNode: '1:1',           // the map spot that becomes BASIC CORP
  counts: [2, 3, 4],         // BASIC CORP's layers here (the last is the boss)
  okDelay: 250,              // ms after a popup is fully in before a tap puts it away (no double-tap skips)
  // POPS's popups: a yellow tag over the game (drawn in pixels, off the grid), his face on its corner
  col: { tag: '#ffd84a', ink: '#111111', hint: '#3a3110', shadow: 'rgba(0,0,0,0.55)' },
  style: 'stroke',           // under the tag: 'stroke' (a yellow line along its right and bottom, the user's pick) or 'shadow' (dark, down-right)
  // ms: he pops in, the tag fills in a row at a time (he talks), a gap, the arrow draws out;
  // out: a row folds away per `out` ms, then he pops out; between: a beat before the next popup;
  // mini: the small version (just his face and the "do this" line, up by the message line) slides out
  anim: { pop: 240, line: 60, gap: 80, arrow: 200, out: 25, faceOut: 140, between: 120, mini: 160 },
  face: [" '-, ", '┌@\\@┐', '╯{=╭╰'],   // POPS (the user's, made in asXii); data/art/faces.js has it now (ART_FACES.pops), this is the stand-in
  curtain: ['hello', 'runner'],
  curtainEnd: ['bye', 'out'],   // ...and the last ones: the game goes out to the lines again, and the title comes in from them   // said over the wipe's lines, held (the menu button and the footer stay), before the game comes in
  timerChars: '@Oo.',        // a banter timer's spinners: each one steps through these, then it's gone
  name: 'POPS',
};
const tutOn = () => !!(st.tut && st.run && st.run.tutorial);
const tutLine = id => (typeof TUT_COPY !== 'undefined' && TUT_COPY.find(l => l.id === id)) || { id, text: id };
const tutFill = s => (s || '').replace(/\{name\}/g, () => profile().name || 'runner').replace(/\{int\}/g, () => st.run ? st.run.integrity : '');

// ---- gates: game actions ask before they go (pick, useItem, selectNode, buttons)
// allow: { pick: [i] | 'any', item: [slot], node: [id], btn: [id] }. An "ok" popup blocks everything.
function tutAllows(kind, x) {
  if (!tutOn()) return true;
  if (st.pause) return true;                       // the pause menu works (and can end the training)
  if (kind === 'btn' && ['menu', 'snd', 'dev'].includes(x)) return true;   // header buttons
  const a = st.tut.allow;
  if (!a || (st.tut.pop && st.tut.pop.ok)) return false;
  const v = a[kind];
  return v === 'any' || (Array.isArray(v) && v.includes(x));
}
function tutNo() { Sound.deny(); if (st.tut) st.tut.nudge = performance.now(); }
// A popup's timeline (ms after it appeared): the tag is full at `fill`, the arrow lands at `land`,
// and the entrance is over at `done`.
function tutTimes(p) {
  const A = TUT.anim;
  if (p.mini) { const fill = A.pop + A.mini; return { fill, land: fill, done: fill }; }
  const n = p.lay ? p.lay.rows.length : 1;
  const fill = A.pop + n * A.line, land = fill + A.gap + A.arrow;
  return { fill, land, done: p.lay && p.lay.arrow ? land + 90 : fill };
}
const tutExitMs = p => (p.mini ? TUT.anim.mini : (p.lay ? p.lay.rows.length : 1) * TUT.anim.out) + TUT.anim.faceOut;
// A tap during the entrance: jump to the whole popup.
function tutSkip(p, now = performance.now()) {
  const d = tutTimes(p).done;
  if (now - p.t0 >= d) return false;
  p.t0 = now - d; p.shownAt = now; p.said = 1e9;
  return true;
}
// Put the popup away: it folds up and he pops out (drawn from T.leaving).
function tutClose(T) {
  const p = T.pop;
  if (p && p.lay) {
    // fold up from where it got to (closed while still coming in: from there, not from the whole tag)
    const A = TUT.anim, t = performance.now() - p.t0;
    if (!p.mini) p.exitFrom = clamp(Math.floor((t - A.pop) / A.line) + 1, 0, p.lay.rows.length);
    T.leaving = { pop: p, t0: performance.now() };
  }
  T.pop = null;
}
// A line said in place of the do-this line for a moment (a wrong tap) or for good (the boss beaten).
// Lines like 'oops' hold a few ways to say it, one per line: one is picked at random.
function tutAlt(p, id, ms, pre = '') {
  const opts = tutLine(id).text.split('\n').map(s => s.trim()).filter(Boolean);
  if (!p || !opts.length) return;
  p.alt = pre + tutFill(opts[Math.floor(Math.random() * opts.length)]);
  p.altT = performance.now(); p.altUntil = p.altT + ms;
  Sound.talk();
}
// Hover: only what the training lets you tap lights up (input.js asks).
function tutHoverOk(h) {
  if (!h || !tutOn()) return true;
  const k = { tile: 'pick', node: 'node', btn: 'btn', item: 'item', mod: 'mod' }[h.kind];
  if (!k) return true;
  const x = h.kind === 'tile' || h.kind === 'item' ? h.i : h.kind === 'mod' ? st.run && st.run.mods[h.i] : h.id;
  return tutAllows(k, x);
}
// An "ok" popup: a tap / Enter / Space finishes the entrance, then puts it away (input.js asks first).
function tutDismiss() {
  const p = st.tut && st.tut.pop;
  if (!p || !p.ok) return false;
  const now = performance.now();
  if (tutSkip(p, now)) return true;
  if (now - Math.max(p.t0 + tutTimes(p).done, p.shownAt || 0) < TUT.okDelay) return true;
  tutClose(st.tut); Sound.tick();
  return true;
}
// A tap while a popup is up. True: the popup used it. A popup that waits for you lets taps through
// to the game (the gates decide), except on the tag itself, where a tap skips the entrance.
function tutTap(h) {
  const p = st.tut && st.tut.pop;
  if (!p || (h && h.kind === 'btn' && ['menu', 'snd'].includes(h.id))) return false;
  if (p.ok) { tutDismiss(); return true; }
  if (h && h.kind === 'tutbox') { tutSkip(p); return true; }
  return false;
}

// ---- start / end
// auto: a line id to play forward to (the neon editor's TRAINING tab): the lines before it are skipped
// and what they ask for is done for you.
function startTutorial(auto = null, seedWas = st.seed, practiceWas = st.practice) {
  if (st.transitioning || st.tut) return;
  if (typeof auto !== 'string') auto = null;   // (a button's tap passes its event)
  const T = st.tut = { pop: null, allow: null, seedWas, practiceWas, spots: {}, auto, curtain: !auto || TUT.curtain.includes(auto) };
  startRun(TUT.seed, true, { tutorial: true });
  tutScript(T).catch(() => {}).then(() => {   // ends when it's done, or when the run is gone (abandoned)
    if (st.tut === T) st.tut = null;
    st.seed = T.seedWas; st.practice = !!T.practiceWas;   // your own seed and run type back (not the training's practice run)
  });
}
// The tutorial's run: a fixed seed, a PATCH on the belt, BASIC CORP on the first map step.
function tutorialRun(run) {
  run.tutorial = true;
  run.integrity = run.maxInt = CONFIG.startIntegrity;   // the same for everyone (no BOARD unlocks)
  run.credits = 0;
  run.items = [{ key: 'patch', tier: 0, n: 1 }];
  const n = run.map[TUT.corpNode];
  if (n) { Object.assign(n, { type: 'corp', corp: 'basic', tier: 1 }); delete n.mod; }
}
async function endTutorial() {
  save.tutorialDone = true; persist();
  featTrained();   // the NEWB feat (its FEAT box comes up on the title)
  const run = st.run;
  if (run) run.ended = true;
  const held = st.wipe && st.wipe.tIn == null;
  st.tut = null;
  if (held) { delete st.wipe.top; delete st.wipe.bot; } else await wipeOut(0);
  showTitle();
  setMsg('> training complete.', C.accent);
}
// Jump to a line (the editor): further on in this training, play forward to it; earlier (or no training
// running), start over and play forward.
const tutIndex = id => (typeof TUT_COPY !== 'undefined' ? TUT_COPY.findIndex(l => l.id === id) : -1);
async function tutJump(id) {
  const T = st.tut;
  if (T && tutOn() && T.at && tutIndex(id) > tutIndex(T.at)) {
    T.auto = id;
    if (T.pop) tutClose(T);
    return;
  }
  // start over (a new run replaces this one; the old script sees it's no longer the training and stops)
  const seedWas = T ? T.seedWas : st.seed, practiceWas = T ? T.practiceWas : st.practice;
  if (T) st.tut = null;
  for (let i = 0; i < 100 && (st.transitioning || st.wipe); i++) await wait(50);
  if (st.pause) togglePause();
  st.transitioning = false;
  startTutorial(id, seedWas, practiceWas);
}
// Playing forward: do what a popup asks (a pick, an item, a map node, a button), one step at a time.
function tutAuto(T, allow) {
  const now = performance.now();
  if (st.intro) st.intro.skip = true;
  if (st.bossIntro) st.bossIntro.skip = true;
  if (!allow || st.busy || st.transitioning || st.wipe || st.intro || st.bossIntro || (T.autoT && now - T.autoT < 350)) return;
  T.autoT = now;
  if (allow.pick && st.mode === 'play' && st.lv) pick(allow.pick === 'any' ? st.lv.safe : allow.pick[0]);
  else if (allow.item) useItem(allow.item[0]);
  else if (allow.node) selectNode(allow.node[0]);
  else if (allow.btn) { const h = hits.find(h => h.kind === 'btn' && h.id === allow.btn[0]); if (h && h.onTap) h.onTap(); }
}
// The map stop to point at: the nearest market / cache / safehouse that's on screen.
function tutStop(T) {
  const run = st.run;
  const stops = Object.values(run.map).filter(n => ['shop', 'cache', 'repair'].includes(n.type) && T.spots[n.id]);
  stops.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  return stops.length ? stops[0].id : null;
}

// ---- the script (the words are in data/tutorial.js, by id)
async function tutScript(T) {
  // alive: the training run is still on (before it has started: just that the tutorial wasn't dropped)
  const alive = () => st.tut === T && (!T.started || (st.run && st.run.tutorial && !st.run.ended));
  const until = async f => {
    while (!f()) {
      if (!alive()) throw new Error('tutorial over');
      if (T.auto) { if (st.intro) st.intro.skip = true; if (st.bossIntro) st.bossIntro.skip = true; }   // playing forward: no waiting
      await wait(40);
    }
  };
  // playing forward (T.auto): skip this line? (reaching the line stops it)
  const skipping = id => { if (T.auto === id) T.auto = null; return !!T.auto; };
  const calm = () => !st.busy && !st.wipe && !st.transitioning && !st.intro && !st.bossIntro && !st.ad && !st.hideAll;
  const inLayer = () => st.mode === 'play' && st.lv && calm() && st.lv.readyAt != null;
  const inPanel = () => st.mode === 'panel' && calm() && (!st.panelReveal || st.panelReveal.done);
  const onMap = () => st.mode === 'map' && calm() && st.mapView && st.mapView.row === st.mapView.target;
  // the last popup finishes leaving (he pops out), a beat, then the next one comes in
  const show = async pop => {
    await until(() => !T.leaving || performance.now() - T.leaving.t0 > tutExitMs(T.leaving.pop));
    T.leaving = null;
    await wait(TUT.anim.between);
    T.pop = Object.assign(pop, { t0: performance.now() });
  };
  // a popup you tap away (banter with a timer also moves on by itself)
  const say = async (id, o = {}) => {
    if (skipping(id)) return;
    const c = tutLine(id);
    T.allow = null; T.at = id;
    await show(Object.assign({ id, text: tutFill(c.text), ok: true, timer: c.timer || 0, noArrow: c.arrow === false }, o));
    const p = T.pop;
    await until(() => T.pop !== p || (p.timer && !st.pause && performance.now() - p.t0 > tutTimes(p).done + p.timer));
    if (T.pop === p) tutClose(T);
  };
  // a popup that waits for you to do something (only that works)
  // o.oops: a line he says on a wrong tap (in place of the do-this line, for a moment);
  // o.win: a line he says once the boss is beaten, kept up through the win until the next screen
  const ask = async (id, allow, done, o = {}) => {
    if (skipping(id)) { T.allow = allow; await until(() => { tutAuto(T, allow); return done(); }); T.allow = null; return; }
    const c = tutLine(id);
    T.allow = null; T.at = id;
    if (c.text) {   // the explaining part: a popup you tap away
      await show({ id, text: tutFill(c.text), ok: true, target: o.target, at: o.at, noArrow: c.arrow === false });
      const p0 = T.pop;
      await until(() => T.pop !== p0);
    }
    await show({ id, act: tutFill(c.act), ok: false, mini: true, target: o.miniTarget || o.target, near: o.near, oops: o.oops, win: o.win });   // (the target keeps pulsing)
    T.allow = allow;
    const p = T.pop, lv0 = st.lv, miss0 = lv0 ? lv0.misses : 0;
    let misses = miss0;
    await until(() => {
      if (T.auto) tutAuto(T, allow);   // (the editor can jump on from here too)
      if (o.oops && st.lv === lv0 && lv0 && lv0.misses > misses) { misses = lv0.misses; tutAlt(p, o.oops, 1800); }
      if (o.win && !p.won && st.lv && st.lv.boss && st.lv.tiles[st.lv.safe].state !== 'closed') { p.won = true; tutAlt(p, o.win, 1e9); }
      if (o.then && !p.thenDone && o.then.when()) { p.thenDone = true; tutAlt(p, o.then.id, 1e9, '> '); }
      return done();
    });
    tutClose(T); T.allow = null;
  };

  // 1. the public net
  await until(() => st.run && st.run.tutorial);
  T.started = true;
  if (T.curtain) {
    // the screen stays a wipe (held: engine/effects.js wipeIn waits) while he says hello
    await until(() => st.mode === 'play' && st.lv && !st.transitioning && (!st.wipe || st.wipe.tIn == null));
    if (!st.wipe) await wipeOut(0);
    Object.assign(st.wipe, { top: 1, bot: L.hc - 1 });   // the header's top row (NeoN+1, the menu) and the footer show
    for (const id of TUT.curtain) await say(id);
    T.curtain = false;
    if (st.wipe && st.wipe.tIn == null) wipeIn();   // and the game resolves in
  } else for (const id of TUT.curtain) await say(id);
  await until(inLayer);
  let lv = st.lv;
  await say('nodes', { target: { tile: lv.safe } });
  await ask('public', { pick: [lv.safe] }, () => st.mode === 'panel', { target: { tile: lv.safe } });

  // 2. a reward: TRACER
  await until(inPanel);
  const trc = { btn: 'opt0', text: (MODS.tracer && MODS.tracer.short) || 'TRC' };   // its 3-letter code
  await say('reward', { target: trc, at: 'above' });
  await say('tracer', { target: trc, at: 'above' });
  await ask('take', { btn: ['take', 'opt0'] }, () => st.mode === 'map', { target: { btn: 'take' }, at: 'below', near: 'below' });

  // 3. the map: the NET, a corp, a stop, then jack in (the tag up top, so the corp's info and JACK IN show)
  await until(onMap);
  await say('tray', { target: { mod: 0 } });
  await say('net', { at: 'top' });
  await say('corps', { target: { node: TUT.corpNode }, at: 'top' });
  const stop = tutStop(T);
  await say('stops', stop ? { target: { spot: stop }, at: 'top' } : { at: 'top' });
  await ask('jackin', { node: [TUT.corpNode], btn: ['enter'] }, () => st.mode === 'play' && st.corp && st.corp.hasBoss,
    { target: { node: TUT.corpNode }, at: 'top' });

  // 4. BASIC CORP, layer 1: integrity, credits, an ICE hit on purpose, TRACER, a PATCH
  await until(inLayer);
  const run = st.run, c = st.corp;
  await say('corp');
  await say('integrity', { target: { hud: 2 } });
  await say('credits', { target: { hud: 3 } });
  await say('ice');
  lv = st.lv;
  const ice = lv.tiles.findIndex(t => !t.safe && t.state === 'closed');
  await ask('hitice', { pick: [ice] }, () => lv.misses >= 1 && !st.busy && (lv.tiles[ice].dirAt || !has('tracer')), { target: { tile: ice } });
  await wait(700);
  await say('hurt', { target: { hud: 2 } });
  await say('traced', { target: { tile: ice } });
  await say('terminal', { target: { msg: true } });
  const slot = run.items.findIndex(x => x.key === 'patch');
  if (slot >= 0) {
    await say('ouch');
    await ask('items', { item: [slot] }, () => run.integrity >= run.maxInt && !st.busy,
      { target: { item: slot }, near: 'right', then: { when: () => st.selItem === slot, id: 'items2' } });   // tapped once: 'tap again to use it'
    await wait(500);
  }
  await ask('real', { pick: [lv.safe] }, () => c.idx >= 1, { target: { tile: ice } });   // he points at the arrows on the ICE you hit

  // 5. layer 2: the tell (then POPS gets out of the way: just his face, up top)
  await until(() => inLayer() && c.idx === 1);
  lv = st.lv;
  await say('layerdone');
  await say('tell');
  await say('basictell');
  const loot = lv.tiles.findIndex(t => t.loaded && t.state === 'closed');
  if (loot >= 0) await say('loot', { target: { tile: loot } });
  await ask('findit', { pick: 'any' }, () => c.idx >= 2, { oops: 'oops' });
  const perfect = lv.misses === 0;

  // 6. the boss
  await until(() => inLayer() && st.lv.boss);
  if (perfect) await say('perfect');
  await say('boss');
  await ask('breachit', { pick: 'any' }, () => st.mode === 'panel', { oops: 'oops', win: 'bosswin' });

  // 7. the breach reward
  await until(inPanel);
  await say('breached');
  await say('bossmods', { at: 'top' });
  await ask('pick', { btn: ['take', 'skip', 'opt0', 'opt1', 'opt2'] }, () => st.mode === 'map');

  // 8. out
  await until(onMap);
  await say('loop');
  await say('sector');
  // the send-off: the game goes out to the lines (held), like the opening
  if (!T.auto || TUT.curtainEnd.includes(T.auto)) {
    T.curtain = true;
    await wipeOut(0);
    Object.assign(st.wipe, { top: 1, bot: L.hc - 1 });
  }
  for (const id of TUT.curtainEnd) await say(id);
  await endTutorial();
}

// ---- drawing: the popup, and what it points at
function tutRect(tg, cells) {
  if (!tg) return null;
  if (tg.tile != null) { const t = st.lv && st.lv.tiles[tg.tile]; if (!t || t.hidden) return null; const { tx, ty } = tileOrigin(t); return { x: tx, y: ty, w: TILE_W, h: TILE_H }; }
  if (tg.hud != null) {   // the right half of a HUD row (integrity on row 2, credits on row 3)
    const cs = cells.filter(c => c.own === 'hud' && Math.round(c.cy) === tg.hud && c.cx >= L.wc / 2);
    if (!cs.length) return null;
    const x0 = Math.min(...cs.map(c => c.cx)), x1 = Math.max(...cs.map(c => c.cx));
    return { x: x0, y: tg.hud, w: x1 - x0 + 1, h: 1 };
  }
  if (tg.text && tg.btn) {
    const h = hits.find(h => h.cr && h.kind === 'btn' && h.id === tg.btn);
    if (!h) return tg.found || null;
    const y = h.cr[1], row = Array(L.wc).fill(' ');
    for (const c of cells) if (Math.round(c.cy) === y && c.cx >= 0 && c.cx < L.wc && c.ch) row[Math.round(c.cx)] = c.ch;
    const i = row.join('').indexOf(tg.text);
    if (i >= 0) tg.found = { x: i, y, w: tg.text.length, h: 1 };
    return tg.found || { x: h.cr[0], y, w: h.cr[2], h: 1 };
  }
  if (tg.msg) return st.msg ? { x: 0, y: 6, w: Math.min(L.wc, st.msg.length), h: 1 } : null;   // the terminal line
  if (tg.spot != null) {   // any map spot, tappable or not (scene.js notes where each was drawn)
    const s = st.mode === 'map' && st.tut && st.tut.spots[tg.spot];
    return s ? { x: s[0], y: s[1], w: 3, h: 1 } : null;
  }
  const h = hits.find(h => h.cr && (tg.btn != null ? h.kind === 'btn' && h.id === tg.btn : tg.item != null ? h.kind === 'item' && h.i === tg.item : tg.mod != null ? h.kind === 'mod' && h.i === tg.mod : tg.node != null ? h.kind === 'node' && h.id === tg.node : false));
  return h ? { x: h.cr[0], y: h.cr[1], w: h.cr[2], h: h.cr[3] } : null;
}
// The scene pass: lay the popup out (in pixels), make its target pulse, and keep taps on the tag
// from reaching the game. The tag itself is drawn by drawTutorial, after the grid.
function buildTutorial(ctx, now, under) {
  const T = st.tut, p = T && T.pop;
  if (!p || !tutOn()) return;
  const r = tutRect(p.target, under);
  p.lay = p.mini ? tutMiniLayout(p, r, under) : tutLayout(p, r);
  T.head = under.filter(c => Math.round(c.cy) === 0 && c.ch && c.ch !== ' ');   // the header row (NeoN+1, the menu): drawn again on top
  // the target pulses (scales up and down around its middle) once the arrow has landed: nodes and the
  // HUD only (on buttons, items and map nodes the letters would slide off their color chips)
  const t = now - p.t0, land = tutTimes(p).land;
  if (r && t >= land && (p.target.tile != null || p.target.hud != null)) {
    const s = 1 + 0.045 * (1 - Math.cos((t - land) / 1100 * Math.PI * 2));
    const mx = r.x + (r.w - 1) / 2, my = r.y + (r.h - 1) / 2;
    for (const c of under) {
      if (c.cx < r.x - 0.01 || c.cx > r.x + r.w - 0.99 || c.cy < r.y - 0.01 || c.cy > r.y + r.h - 0.99) continue;
      c.cx = mx + (c.cx - mx) * s; c.cy = my + (c.cy - my) * s; c.sc = (c.sc || 1) * s;
    }
  }
  const l = p.lay;
  if (!p.ok) ctx.addHit((l.x - L.ox) / L.cw, (l.y - L.oy) / L.chh, l.W / L.cw, l.H / L.chh, { kind: 'tutbox' });   // the tag doesn't pass taps through
}

// His face chip's size (it's drawn centered on a point).
const tutFace = k => { const fs = 9 * k; return { fs, w: 5 * 0.6 * fs + 10 * k, h: 3 * 1.12 * fs + 8 * k }; };

// The tag's layout in pixels: centered on the screen, above or below its target, with an arrow
// at about 45 degrees from the tag's edge to the target's nearest corner.
function tutLayout(p, r) {
  const k = L.fs / 12, cw = L.cw, ch = L.chh;
  const W = Math.min(27, L.wc - 4) * cw, pad = 10 * k, bodyFs = 11.5 * k, lh = bodyFs * 1.4;
  g.font = `400 ${bodyFs}px ${FONT}`;
  const cols = Math.max(10, Math.floor((W - 2 * pad) / g.measureText('M').width));
  const rows = [{ kind: 'name', h: 19 * k }];
  if (p.text) for (const para of p.text.split('\n')) {
    if (!para) rows.push({ kind: 'blank', h: lh });
    else for (const t of wrapText(para, cols)) rows.push({ kind: 'body', text: t, h: lh });
  }
  if (p.act) wrapText('> ' + p.act, cols - 2).forEach((t, i) => rows.push({ kind: 'act', text: t, h: lh + (i === 0 && p.text ? 6 * k : 0) }));
  if (p.ok) rows.push({ kind: 'hint', h: 17 * k });   // TAP >
  const H = pad + rows.reduce((a, b) => a + b.h, 0) + 8 * k;
  const scrW = L.wc * cw, x = L.ox + (scrW - W) / 2;
  const scrTop = L.oy, scrBot = L.oy + L.hc * ch, boardTop = L.oy + BOARD_Y * ch, boardBot = L.oy + (BOARD_Y + L.gh) * ch;
  let y, arrow = null;
  if (r) {
    const R = { l: L.ox + r.x * cw - 5 * k, t: L.oy + r.y * ch - 4 * k, r: L.ox + (r.x + r.w) * cw + 5 * k, b: L.oy + (r.y + r.h) * ch + 4 * k };
    const left = (R.l + R.r) / 2 < L.ox + scrW / 2, d = 3 * ch;
    let side = p.at === 'top' || p.at === 'above' ? 'above' : p.at === 'low' || p.at === 'below' ? 'below'
      : (R.t + R.b) / 2 > (scrTop + scrBot) / 2 ? 'above' : 'below';
    if (side === 'above' && p.at !== 'top' && R.t - 14 * k - H < scrTop) side = 'below';
    else if (side === 'below' && p.at !== 'low' && R.b + 14 * k + H > scrBot) side = 'above';
    const wide = R.r - R.l > scrW / 3, ex = wide ? (R.l + R.r) / 2 : left ? R.r + 3 * k : R.l - 3 * k;
    if (side === 'above') {
      y = clamp(p.at === 'top' ? Math.min(boardTop, R.t - d - H) : R.t - d - H, scrTop, scrBot - H);   // 'top': up there, but leave the arrow room
      const ey = R.t - (wide ? 4 : 3) * k, sy = y + H, kk = ey - sy;
      if (kk > 10 * k) arrow = { sx: clamp(ex + (left ? kk : -kk), x + 16 * k, x + W - 16 * k), sy, ex, ey };
      // the stroke style: the arrow comes out of the stroke line under the tag, not the tag's edge
      const o = 4.75 * k;
      if (arrow && TUT.style === 'stroke' && kk > 10 * k + o) { arrow.sx += (arrow.ex - arrow.sx) / (arrow.ey - arrow.sy) * o; arrow.sy += o; }
    } else {
      y = clamp(p.at === 'low' ? Math.max(boardBot - H, R.b + d) : R.b + d, scrTop, scrBot - H);
      const ey = R.b + (wide ? 4 : 3) * k, sy = y, kk = sy - ey;
      if (kk > 10 * k) arrow = { sx: clamp(ex + (left ? kk : -kk), x + 56 * k, x + W - 16 * k), sy, ex, ey };   // clear of his face
    }
  } else y = p.at === 'top' ? boardTop : p.at === 'low' ? boardBot - H : (scrTop + scrBot - H) / 2;
  return { x, y, W, H, rows, k, pad, bodyFs, lh, arrow: p.noArrow ? null : arrow };
}
// The small version: his face at the left of the message line (row 6, between the HUD and the board)
// and the "do this" line beside it. x / y / W / H cover both (the tap area).
function tutMiniLayout(p, r, cells = []) {
  const k = L.fs / 12, F = tutFace(k), fs = 11.5 * k, ph = fs * 1.7;
  g.font = `800 ${fs}px ${FONT}`;
  // where: the message line (row 6); near 'below': the row under its target; near 'right': beside it
  // (below: the first row under it where he and his line fit without covering anything)
  const used = (y0, y1, x1) => cells.some(c => c.ch && c.ch !== ' ' && c.cy >= y0 - 0.5 && c.cy <= y1 + 0.5 && c.cx < x1);
  const span = Math.ceil((F.h + 6 * k) / L.chh / 2), wCells = 6 + p.act.length + 4;
  let below = r ? r.y + r.h + 1 : 6;
  if (r && p.near === 'below') for (let y = r.y + r.h + span; y < L.hc - span - 1; y++) if (!used(y - span, y + span, wCells)) { below = y; break; }
  const row = r && p.near === 'below' ? below : r && p.near === 'right' ? r.y - 1 : 6;   // (right: a row above, clear of the item's description under it)
  const label = '> ' + p.act, cy = L.oy + (row + 0.5) * L.chh;
  const fx = r && p.near === 'right' ? L.ox + (r.x + r.w + 1) * L.cw : L.ox + 3 * k, px = fx + F.w + 10 * k, pw = g.measureText(label).width + 20 * k;
  return { mini: true, msgRow: row === 6, k, fs, label, rows: [], fx, fy: cy - F.h / 2, pill: { x: px, y: cy - ph / 2, w: pw, h: ph },
    x: fx - 3 * k, y: cy - F.h / 2 - 3 * k, W: px + pw - fx + 3 * k, H: F.h + 6 * k };
}

// Drawn last, over the whole frame (engine/render.js): the popup coming in, and the last one leaving.
function drawTutorial(now) {
  const T = st.tut;
  if (!T) return;
  const dt = T.lastNow ? Math.min(250, now - T.lastNow) : 0;
  T.lastNow = now;
  if (st.dev || st.ad || (st.wipe && !(T.pop && T.pop.mini) && !T.curtain) || !tutOn()) { if (T.pop) T.pop.t0 += dt; T.leaving = null; return; }
  if (T.leaving) {
    const te = now - T.leaving.t0;
    if (te > tutExitMs(T.leaving.pop)) T.leaving = null;
    else drawTutPop(T, T.leaving.pop, now, te);
  }
  if (T.pop && T.pop.lay) drawTutPop(T, T.pop, now, -1);
  // the header row stays on top of the popups, on a solid background (the menu has to stay reachable and readable)
  if (T.head && (T.pop || T.leaving)) {
    g.save();
    g.fillStyle = C.bg; g.fillRect(L.ox, L.oy, L.wc * L.cw, L.chh);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const c of T.head) { g.font = `${c.bold ? DRAW_FONT.bold : DRAW_FONT.weight} ${L.fs * DRAW_FONT.scale}px ${DRAW_FONT.family}`; g.fillStyle = c.col; g.fillText(c.ch, pxX(c.cx), pxY(c.cy)); }
    g.restore();
  }
}
// The yellow under-layer and fill: a dark drop shadow, or a yellow line along the right and bottom.
function tutBack(x, y, w, h, k) {
  const col = TUT.col, o = 4 * k;
  if (TUT.style === 'stroke') {
    g.strokeStyle = col.tag; g.lineWidth = 1.5 * k; g.lineJoin = 'miter';
    g.beginPath(); g.moveTo(x + w, y + o); g.lineTo(x + w + o, y + o); g.lineTo(x + w + o, y + h + o); g.lineTo(x + o, y + h + o); g.lineTo(x + o, y + h); g.stroke();
  } else { g.fillStyle = col.shadow; g.fillRect(x + o, y + o, w, h); }
  g.fillStyle = col.tag; g.fillRect(x, y, w, h);
}
// His face: a dark chip with a yellow line and a dark gap outside it, centered on (cx, cy).
function tutDrawFace(cx, cy, s, k) {
  if (s <= 0) return;
  const col = TUT.col, F = tutFace(k);
  g.save();
  g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = col.ink; g.fillRect(-F.w / 2 - 3 * k, -F.h / 2 - 3 * k, F.w + 6 * k, F.h + 6 * k);
  g.fillStyle = col.tag; g.fillRect(-F.w / 2 - 1 * k, -F.h / 2 - 1 * k, F.w + 2 * k, F.h + 2 * k);
  g.fillStyle = col.ink; g.fillRect(-F.w / 2, -F.h / 2, F.w, F.h);
  g.font = `400 ${F.fs}px ${FONT}`; g.fillStyle = col.tag; g.textAlign = 'center'; g.textBaseline = 'middle';
  ((typeof ART_FACES !== 'undefined' && ART_FACES.pops && ART_FACES.pops.art) || TUT.face).forEach((ln, i) => g.fillText(ln, 0, (i - 1) * 1.12 * F.fs));
  g.restore();
}
const tutPopIn = u => (u < 0.6 ? 1.25 * (u / 0.6) : 1.25 - 0.25 * (u - 0.6) / 0.4);   // his pop: overshoot, settle

function drawTutPop(T, p, now, te) {
  const l = p.lay, A = TUT.anim, col = TUT.col, k = l.k, out = te >= 0;
  const t = now - p.t0;
  const nud = !out && T.nudge && now - T.nudge < 300 ? Math.sin((now - T.nudge) / 25) * 4 * k : 0;   // a wrong tap: it shakes
  g.save();
  g.textBaseline = 'middle';
  if (l.mini) {
    // the small version: his face pops in, then the line slides out beside it
    let faceS = 1, u = 1;
    if (!out) {
      if (t < A.pop) faceS = tutPopIn(Math.max(0, t / A.pop));
      u = clamp((t - A.pop) / A.mini, 0, 1);
      if (u > 0 && !p.said) { Sound.talk(); p.said = 1; }
    } else {
      u = Math.max(0, 1 - te / A.mini);
      faceS = Math.max(0, 1 - Math.max(0, te - A.mini) / A.faceOut);
    }
    const altOn = p.alt && now < p.altUntil, label = altOn ? p.alt : l.label;
    g.font = `800 ${l.fs}px ${FONT}`;
    const P = l.pill, w = (g.measureText(label).width + 20 * k) * (1 - (1 - u) * (1 - u));
    const bob = p.altT && now - p.altT < 450 ? -3 * k * Math.abs(Math.sin(Math.PI * (now - p.altT) / 150)) : 0;
    // a clean patch of background under him and the line (no half-covered HUD text peeking out)
    const F0 = tutFace(k), back = Math.min(1, faceS) * (out ? u || faceS : 1);
    if (back > 0) {
      g.globalAlpha = back; g.fillStyle = C.bg;
      g.fillRect(l.x - 4 * k + nud, l.y - 2 * k, Math.max(F0.w + 12 * k, P.x + w - l.x + 10 * k), l.H + 4 * k);
      if (l.msgRow) g.fillRect(P.x, L.oy + 6 * L.chh, (L.ox + L.wc * L.cw - P.x) * Math.min(1, u * 1.5), L.chh);   // the rest of the message line: his line replaces it
      g.globalAlpha = 1;
    }
    if (w > 1) {
      tutBack(P.x + nud, P.y, w, P.h, k);
      g.save(); g.beginPath(); g.rect(P.x + nud, P.y, w, P.h); g.clip();
      g.font = `800 ${l.fs}px ${FONT}`; g.fillStyle = col.ink; g.textAlign = 'left';
      g.fillText(label, P.x + nud + 10 * k, P.y + P.h / 2);
      g.restore();
    }
    const F = tutFace(k);
    tutDrawFace(l.fx + F.w / 2 + nud, l.fy + F.h / 2 + bob, faceS, k);
    g.restore();
    return;
  }
  const n = l.rows.length, arrowAt = A.pop + n * A.line + A.gap;
  let shown, faceS = 1, faceDy = 0, arrowP = 1, headS = 1, arrowA = 1;
  if (!out) {
    shown = clamp(Math.floor((t - A.pop) / A.line) + 1, 0, n);
    if (t < A.pop) faceS = tutPopIn(Math.max(0, t / A.pop));
    if (t >= A.pop && shown < n) faceDy = -3 * k * Math.abs(Math.sin(Math.PI * (t - A.pop) / 150));   // talking
    if (shown > (p.said || 0)) { if (shown > 1) Sound.talk(); p.said = shown; }
    const u = clamp((t - arrowAt) / A.arrow, 0, 1);
    arrowP = 1 - (1 - u) * (1 - u);
    headS = clamp((t - arrowAt - A.arrow) / 90, 0, 1);
  } else {
    const from = p.exitFrom != null ? p.exitFrom : n;
    shown = clamp(from - Math.floor(te / A.out), 0, from);
    faceS = (p.exitFrom === 0 && t < A.pop ? tutPopIn(Math.max(0, t / A.pop)) : 1) * Math.max(0, 1 - Math.max(0, te - from * A.out) / A.faceOut);
    arrowA = Math.max(0, 1 - te / 100);
  }
  const x = l.x + nud, y = l.y;
  // the arrow, under the tag so it starts cleanly at the tag's edge
  const a = l.arrow;
  if (a && arrowP > 0 && arrowA > 0) {
    g.globalAlpha = arrowA;
    g.strokeStyle = col.tag; g.lineWidth = 2 * k; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(a.sx, a.sy); g.lineTo(a.sx + (a.ex - a.sx) * arrowP, a.sy + (a.ey - a.sy) * arrowP); g.stroke();
    if (headS > 0) {   // an open head: two strokes at a square corner
      const ang = Math.atan2(a.ey - a.sy, a.ex - a.sx), hl = 9.6 * k * headS;
      g.beginPath();
      g.moveTo(a.ex - Math.cos(ang - Math.PI / 4) * hl, a.ey - Math.sin(ang - Math.PI / 4) * hl);
      g.lineTo(a.ex, a.ey);
      g.lineTo(a.ex - Math.cos(ang + Math.PI / 4) * hl, a.ey - Math.sin(ang + Math.PI / 4) * hl);
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  // the tag, filled in down to the last row shown
  if (shown > 0) {
    let hgt = l.pad;
    for (let i = 0; i < shown; i++) hgt += l.rows[i].h;
    if (shown === n) hgt = l.H;
    tutBack(x, y, l.W, hgt, k);
    const spaced = 'letterSpacing' in g;
    let ry = y + l.pad;
    for (let i = 0; i < shown; i++) {
      const row = l.rows[i];
      if (row.kind === 'name') {
        g.font = `800 ${10 * k}px ${FONT}`; g.fillStyle = col.ink; g.textAlign = 'left';
        if (spaced) g.letterSpacing = `${1.6 * k}px`;
        g.fillText(TUT.name, x + 44 * k, ry + 6 * k);
        if (spaced) g.letterSpacing = '0px';
      } else if (row.kind === 'body') {
        g.font = `400 ${l.bodyFs}px ${FONT}`; g.fillStyle = col.ink; g.textAlign = 'left';
        g.fillText(row.text, x + l.pad, ry + l.lh / 2);
      } else if (row.kind === 'act') {
        const top = ry + row.h - l.lh;
        g.font = `800 ${l.bodyFs}px ${FONT}`;
        g.fillStyle = col.ink; g.fillRect(x + l.pad, top + 1 * k, g.measureText(row.text).width + 12 * k, l.lh - 2 * k);
        g.fillStyle = col.tag; g.textAlign = 'left';
        g.fillText(row.text, x + l.pad + 6 * k, top + l.lh / 2);
      } else if (row.kind === 'hint') {
        g.font = `800 ${9.5 * k}px ${FONT}`; g.fillStyle = col.hint; g.textAlign = 'right';
        if (spaced) g.letterSpacing = `${0.95 * k}px`;
        g.fillText('TAP >', x + l.W - l.pad, ry + 4 * k + 6.5 * k);
        if (spaced) g.letterSpacing = '0px';
      }
      ry += row.h;
    }
    // banter: four little spinners in the top-right corner run down, left to right, as its time runs out
    if (p.timer && !out && shown === n) {
      const frac = clamp((t - tutTimes(p).done) / p.timer, 0, 1), STEPS = TUT.timerChars;
      let s4 = '';
      for (let i = 0; i < 4; i++) { const u = frac * 4 - i; s4 += u <= 0 ? STEPS[0] : u >= 1 ? ' ' : STEPS[Math.min(STEPS.length - 1, Math.floor(u * STEPS.length))]; }
      g.font = `800 ${10 * k}px ${FONT}`; g.fillStyle = col.ink; g.textAlign = 'right';
      g.fillText(s4, x + l.W - l.pad, y + l.pad + 6 * k);
    }
  }
  const F = tutFace(k);
  tutDrawFace(x - 10 * k + F.w / 2, y - 15 * k + F.h / 2 + faceDy, faceS, k);
  g.restore();
}
