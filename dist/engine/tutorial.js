// NeoN+1 engine/tutorial.js: the training run. A guided practice run in its own palette, with POPS, an old
// runner, talking you through it: the public net, a reward (TRACER), the map, then BASIC CORP in 3 layers
// (an ICE hit on purpose, a PATCH, the tell, the boss), the breach reward, and out. One thing at a time;
// while a popup is up, only what it asks for works. What he says is in data/tutorial.js (the neon editor's
// TRAINING tab). Started from the title ([ TRAINING ], until you've done it once) and from HOW TO PLAY.
'use strict';
// (POPS's popups themselves, their drawing and hints: engine/callouts.js)
NEON_FILES.push(['engine/tutorial.js', 'v15.61']);

const TUT = {
  palette: 'c_safeharbor',   // navy + teal: clearly not a normal run
  seed: 'TRAINING',
  corpNode: '1:1',           // the map spot that becomes BASIC CORP
  counts: [2, 3, 4],         // BASIC CORP's layers here (the last is the boss)
  // (how POPS's popups look and move: CALLOUT, engine/callouts.js)
  curtain: ['hello', 'runner'],
  curtainEnd: ['bye', 'out'],   // ...and the last ones: the game goes out to the lines again, and the title comes in from them   // said over the wipe's lines, held (the menu button and the footer stay), before the game comes in
};
// on: the corp training's run, or the WORKBENCH training's bench (st.tut.bench: its own components and locker)
const tutOn = () => !!(st.tut && (st.tut.deck ? DECK && DECK.train && st.mode === 'panel' : st.tut.bench ? st.bench : st.run && st.run.tutorial));
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
  const k = { tile: 'pick', node: 'node', btn: 'btn', item: 'item', mod: 'mod', benchkey: 'key' }[h.kind];
  if (!k) return true;
  const x = h.kind === 'tile' || h.kind === 'item' ? h.i : h.kind === 'mod' ? st.run && st.run.mods[h.i] : h.kind === 'benchkey' ? h.key : h.id;
  return tutAllows(k, x);
}
// An "ok" popup: a tap / Enter / Space finishes the entrance, then puts it away (input.js asks first).
function tutDismiss() {
  const p = st.tut && st.tut.pop;
  if (!p || !p.ok) return false;
  const now = performance.now();
  if (tutSkip(p, now)) return true;
  if (now - Math.max(p.t0 + tutTimes(p).done, p.shownAt || 0) < CALLOUT.okDelay) return true;
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
  const T = st.tut = { pop: null, allow: null, seedWas, practiceWas, seededWas: st.seeded, spots: {}, auto, curtain: !auto || TUT.curtain.includes(auto) };
  startRun(TUT.seed, true, { tutorial: true });
  tutScript(T).catch(() => {}).then(() => {   // ends when it's done, or when the run is gone (abandoned)
    if (st.tut === T) st.tut = null;
    st.seed = T.seedWas; st.practice = !!T.practiceWas; st.seeded = !!T.seededWas;   // your own seed and run type back (not the training's practice run)
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
  if (/^d_/.test(id)) { if (!st.tut && save.deck) startDeckTraining('help'); return; }   // (the deck training's lines)
  if (/^b_/.test(id)) { if (!st.tut && benchOpen()) startBenchTraining(); return; }   // (the WORKBENCH training's lines: it starts from the top)
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

// ---- the popups' helpers, shared by the trainings (the corp training below, the WORKBENCH one at the end).
// alive: is this training still on? until / say / ask throw once it isn't, which ends the script.
function tutKit(T, alive) {
  const until = async f => {
    while (!f()) {
      if (!alive()) throw new Error('tutorial over');
      if (T.auto) { if (st.intro) st.intro.skip = true; if (st.bossIntro) st.bossIntro.skip = true; }   // playing forward: no waiting
      await wait(40);
    }
  };
  // playing forward (T.auto): skip this line? (reaching the line stops it)
  const skipping = id => { if (T.auto === id) T.auto = null; return !!T.auto; };
  // the last popup finishes leaving (he pops out), a beat, then the next one comes in
  const show = async pop => {
    await until(() => !T.leaving || performance.now() - T.leaving.t0 > tutExitMs(T.leaving.pop));
    T.leaving = null;
    await wait(CALLOUT.anim.between);
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
  return { until, skipping, show, say, ask };
}

// ---- the script (the words are in data/tutorial.js, by id)
async function tutScript(T) {
  // alive: the training run is still on (before it has started: just that the tutorial wasn't dropped)
  const alive = () => st.tut === T && (!T.started || (st.run && st.run.tutorial && !st.run.ended));
  const { until, say, ask } = tutKit(T, alive);
  const calm = () => !st.busy && !st.wipe && !st.transitioning && !st.intro && !st.bossIntro && !st.ad && !st.hideAll;
  const inLayer = () => st.mode === 'play' && st.lv && calm() && st.lv.readyAt != null;
  const inPanel = () => st.mode === 'panel' && calm() && (!st.panelReveal || st.panelReveal.done);
  const onMap = () => st.mode === 'map' && calm() && st.mapView && st.mapView.row === st.mapView.target;

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
  if (loot >= 0) {   // (the user, 2026-10-31: loot earlier, on purpose) hit it: a loot item, and the bag comes up
    await ask('loot', { pick: [loot] }, () => lv.tiles[loot].state !== 'closed' && !st.busy, { target: { tile: loot } });
    await wait(700);
    st.run.lootShown = true;   // the [£] button (engine/loot.js)
    if (!(st.run.loot || []).length && ITEMS.sim) addLoot('sim', 0);
    await say('lootbag', { target: { btn: 'loot' } });
  }
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
  await say('menu', { target: { btn: 'menu' }, at: 'below' });   // the NeoN+1 menu (Greg, 2026-11-12: point it out at the end)
  // the send-off: the game goes out to the lines (held), like the opening
  if (!T.auto || TUT.curtainEnd.includes(T.auto)) {
    T.curtain = true;
    await wipeOut(0);
    Object.assign(st.wipe, { top: 1, bot: L.hc - 1 });
  }
  for (const id of TUT.curtainEnd) await say(id);
  await endTutorial();
}

// ---------------- the WORKBENCH training (Greg's outline, 2026-11-20; built 2026-11-23) ----------------
// POPS walks you through the bench with the corp training's popups: SHRED a set kit for PURGE's letters, pin PURGE in
// the BOOK, type it on BUILD, TAKE it from the LOCKER. Its own world: st.tut.bench stands in for save.bench (benchSave
// hands it out while this runs), your belt, mods and loot are set aside for the kit, and the run isn't saved till
// they're back (engine/save.js saveRun). At the end you're back where you were, with a feat (APPRENTICE) and a few
// real components. Started from your first WORKBENCH (POPS offers it: engine/bench.js openBench) and from HOW TO PLAY >
// TRAINING (engine/help.js). The words are in data/tutorial.js (the b_ lines).
const BTUT = {
  kit: { items: ['ping', 'route'], mods: ['tracer'], loot: ['sim', 'junkdata'] },   // PING (PNG) and ROUTE (RTE): a P, R and G between them
  letters: { '*': 1 },   // a * on the SPECIAL row to point at
  code: 'PRG',           // PURGE: what you shred for, pin and build
  reward: 5,             // real components at the end (random, like a safehouse's: benchBonusLetter)
};
const benchTutOn = () => !!(st.tut && st.tut.bench);
// node: the safehouse you're at (in a run; back: where its LEAVE goes). No node: from HOW TO PLAY, with a stand-in run.
function startBenchTraining(node = null, back = null) {
  if (st.tut || (st.transitioning && !node)) return;
  const inRun = !!(node && st.run && !st.run.ended);
  const T = st.tut = { bench: { letters: Object.assign({}, BTUT.letters), locker: Array(BENCH.locker).fill(null), pins: [], popsSeen: true, blankSeen: true, bpSeen: true },
    pop: null, allow: null, spots: {}, started: true, inRun, runWas: st.run, node: node || { id: 'benchtut', type: 'rest' }, back };
  const kit = { items: BTUT.kit.items.map(key => ({ key, tier: 0, n: 1 })), mods: BTUT.kit.mods.slice(), modTier: {}, loot: BTUT.kit.loot.map(key => ({ key, tier: 0, n: 1 })) };
  if (inRun) { const r = st.run; T.held = { items: r.items, mods: r.mods, modTier: r.modTier, loot: r.loot }; Object.assign(r, kit); }
  else st.run = Object.assign({ tutorial: true, benchTut: true, seed: 'BENCH', practice: true, map: {}, at: '0:1', visited: [], integrity: CONFIG.startIntegrity, maxInt: CONFIG.startIntegrity,
    shield: 0, credits: 0, earned: 0, beltSlots: CONFIG.beltSlots, reroutes: 0, depth: 0, corps: 0, sector: 0, sectorsCleared: 0, resumes: 0, pending: null }, kit);
  markSeen('purge');   // (the BOOK lists what you've seen: everyone's had a PURGE)
  const go = () => { openBench(T.node, null); st.bench.log = ['> workbench online. (training sim)']; T.open = true; };
  if (inRun) go(); else swapTo(go);
  benchTutScript(T).catch(() => {}).then(() => { if (st.tut === T) benchTutEnd(T, false); });
}
// done: you finished it (the feat, the components). Either way your own things come back, and you're back at the bench
// (a run's) or HOW TO PLAY.
function benchTutEnd(T, done) {
  if (st.tut !== T) return;
  st.tut = null;
  if (T.inRun) { Object.assign(st.run, T.held); saveRun(); }
  else st.run = T.runWas;
  const got = [];
  if (done) {
    for (let i = 0; i < BTUT.reward; i++) { const ch = benchBonusLetter(); if (ch) got.push(ch); }
    benchAdd(got);
    save.stats = save.stats || {}; save.stats.benchTrained = 1; grantFeat('apprentice');
    persist();
  }
  const msg = got.length ? `> +${got.length} components: ${got.join(' ')}.` : '> training over.';
  if (T.inRun) swapTo(() => { openBench(T.node, T.back); benchSay(msg); });
  else swapTo(() => { st.bench = null; openHelp('training'); setMsg(msg, C.accent); });
}
// END TRAINING (the pause menu, engine/input.js): out, nothing earned.
function benchTutQuit() {
  const T = st.tut;
  if (st.pause) togglePause();
  if (T && T.bench) { T.quit = true; if (T.pop) tutClose(T); }
}
async function benchTutScript(T) {
  const alive = () => st.tut === T && !T.quit && (!T.open || !!st.bench);   // (from HOW TO PLAY the bench opens a moment later)
  const { until, say, ask } = tutKit(T, alive);
  const b = () => st.bench;
  const calm = () => st.mode === 'panel' && st.bench && !benchBusy() && !st.swap && !st.callBox && !st.featBox;
  const onTab = t => () => calm() && b().tab === t;
  const has = (...cs) => cs.every(ch => benchHave(ch) > 0);
  await until(onTab('build'));
  await wait(400);   // (the keyboard comes up)
  await say('b_hello');

  // 1. SHRED: the kit's gear, for P R G
  await ask('b_shredtab', { btn: ['bt_shred'] }, onTab('shred'), { target: { btn: 'bt_shred' }, near: 'below' });
  shredPickKind('gear');
  await say('b_shred', { target: { btn: 'shs_gear', pulse: true } });
  await ask('b_shredit', { btn: ['sh0', 'sh1', 'bkshred', 'shs_gear'] }, () => calm() && has('P', 'R', 'G'), { target: { btn: 'bkshred' }, near: 'below' });
  await say('b_comps', { target: { btn: 'shs_mod', pulse: true } });   // (SHRED stays on GEAR: engine/bench.js shredKind)

  // 2. the BOOK: pin PURGE
  await ask('b_booktab', { btn: ['bt_book'] }, onTab('book'), { target: { btn: 'bt_book' }, near: 'below' });
  bookPickKind('gear');
  const bi = bookList().indexOf(BTUT.code);
  if (bi >= 0) { b().bkSel = bi; b().bkT = performance.now(); }
  await ask('b_pin', { btn: ['bkpin'] }, () => calm() && benchSave().pins.includes(BTUT.code), { target: { btn: 'bkpin' }, near: 'below' });

  // 3. BUILD: type it, ENTER
  await ask('b_buildtab', { btn: ['bt_build', 'bkbook'] }, onTab('build'), { target: { btn: 'bt_build' }, near: 'below' });   // (or the BOOK's own BUILD: it doesn't fill the letters in here)
  await wait(450);
  await say('b_pinned', { target: { btn: 'pin' + BTUT.code, pulse: true } });
  await say('b_wild');
  await ask('b_type', { key: BTUT.code.split('').concat('DEL'), btn: ['bk_DEL'] }, () => calm() && (j => j.kind === 'ok' && j.code === BTUT.code)(benchJudge()),
    { target: { btn: 'pin' + BTUT.code } });
  const built = () => calm() && !b().anim && benchSave().locker.some(x => x && x.key === 'purge');
  await ask('b_build', { key: ['ENTER'], btn: ['bk_ENTER', 'bkbuild'] }, built, { target: { btn: 'bkbuild' }, near: 'below' });
  await wait(300);

  // 4. the LOCKER: take it
  await say('b_locker', { target: { btn: 'bt_locker', pulse: true } });
  await ask('b_lockertab', { btn: ['bt_locker', 'lvtake'] }, () => onTab('locker')() && b().lkView === 'take', { target: { btn: 'bt_locker' }, near: 'below' });
  const at = benchSave().locker.findIndex(x => x && x.key === 'purge');
  b().lkSel = Math.max(0, at);
  await ask('b_take', { btn: ['lktake' + Math.max(0, at), 'bktake'] }, () => calm() && st.run.items.some(x => x.key === 'purge'), { target: { btn: 'bktake' }, near: 'below' });
  await say('b_store', { target: { btn: 'lvstore', pulse: true } });
  await say('b_bye');
  benchTutEnd(T, true);
}

// ---------------- the deck training (Greg's outline, 2026-11-20; built 2026-11-23) ----------------
// POPS walks you through your deck with the same popups: a board with a chip in and no cell (NO POWER: slot a cell in
// PSU), slot the cell, power, where chips come from, slot one yourself, SLOTS and CHIPS, the mk upgrades. A training
// deck (DECK.train: engine/deck.js) stands in for yours: nothing it does is saved. Started from your deck the first
// time (POPS offers it: engine/deck.js openDeck) and from HOW TO PLAY > TRAINING. After it: a feat (DECKHAND), and from
// your deck, ROOT's quest card. The words are in data/tutorial.js (the d_ lines).
const DTUT = {
  chips: { SC1: 1, FA1: 1, TF1: 1, SP3: 1 },   // the STOCK CELL to slot, FIRST AID waiting for power, TRUST FUND for you to slot
  slots: { BT1: 'FA1', SPL: 'SP3' },
  yours: 'TF1', into: 'BT2',
};
const deckTutOn = () => !!(st.tut && st.tut.deck);
// from: 'deck' (your deck, the first time: back to it after) or 'help' (HOW TO PLAY > TRAINING)
function startDeckTraining(from = 'help') {
  if (st.tut || st.transitioning) return;   // (swapTo would drop it and the training would never end: audit 2026-11-23)
  const T = st.tut = { deck: true, from, pop: null, allow: null, spots: {}, started: true };
  const go = () => {
    DECK = Object.assign(deckView(), { real: false, train: true, rep: 0, mk: 2, fuse: false, blown: false, spoils: 0, glyph: null, favB: 'loot', crew: new Set(),
      chips: Object.assign({}, DTUT.chips), slots: Object.assign({}, DTUT.slots), order: Object.keys(DTUT.slots), sw: new Set(), nemesis: null, archive: null, overclock: false, seenMk: 2 });
    DECK.sel = { kind: 'socket', id: 'BT1' };
    openPanel('THE DECK', deckLines, null, { full: true });
    st.keyHandler = deckKey;
    T.open = true;
  };
  swapTo(go);
  deckTutScript(T).catch(() => {}).then(() => { if (st.tut === T) deckTutEnd(T, false); });
}
function deckTutEnd(T, done) {
  if (st.tut !== T) return;
  st.tut = null;
  if (done) { save.stats = save.stats || {}; save.stats.deckTrained = 1; grantFeat('deckhand'); persist(); }
  if (T.from === 'deck' && save.deck) swapTo(() => { openDeck(); if (!done) setTimeout(() => setMsg('> training over.', C.accent), 300); });
  else swapTo(() => { DECK = null; openHelp('training'); setMsg(done ? '> deck training complete.' : '> training over.', C.accent); });
}
// Esc on the training deck (engine/deck.js deckKey): out, nothing earned.
function deckTutQuit() { const T = st.tut; if (T && T.deck) { T.quit = true; if (T.pop) tutClose(T); } }
async function deckTutScript(T) {
  const alive = () => st.tut === T && !T.quit && (!T.open || !!(DECK && DECK.train));
  const { until, say, ask } = tutKit(T, alive);
  const d = () => DECK;
  const calm = () => st.mode === 'panel' && DECK && DECK.train && !st.swap && !st.callBox && !st.featBox;
  const powered = id => calm() && d().slots[id] && deckPower().on.has(id);
  const picker = ids => ['dkchg', 'dkgo', 'dkbx', 'dkk_NONE', 'dkcard'].concat(ids);
  await until(calm);
  await wait(500);
  await say('d_hello');
  await say('d_nopower', { target: { btn: 'dkbar', pulse: true }, at: 'above' });
  await ask('d_bar', { btn: ['dkbar'] }, () => calm() && d().sel.kind === 'socket' && d().sel.id === 'PSU', { target: { btn: 'dkbar' } });
  await wait(600);   // (the board scrolls down to it)
  await ask('d_psu', { btn: picker(['dks_PSU', 'dkk_SC1']) }, () => powered('BT1') && d().slots.PSU === 'SC1' && !d().pick, { target: { btn: 'dks_PSU', pulse: true }, miniTarget: { btn: 'dkchg' } });
  await wait(400);
  await say('d_power', { target: { btn: 'dks_BT1', pulse: true } });
  { const pw = deckPower(); await say('d_pwr', { target: { btn: 'dktc', text: `mk ${deckMk(d().mk)} PWR ${pw.used}/${pw.budget}`, pulse: true }, at: 'below' }); }   // (the readout right of the tabs)
  await say('d_find');
  // your turn: TRUST FUND into BT2 (the board scrolls up to it, its card up)
  { const s = deckSock(DTUT.into); deckSelect({ kind: 'socket', id: s.id }); deckShow(s.y, s.h, deckViewRows()); }
  await wait(600);
  await ask('d_slot', { btn: picker(['dks_' + DTUT.into, 'dkk_' + DTUT.yours]) }, () => powered(DTUT.into) && !d().pick, { target: { btn: 'dks_' + DTUT.into, pulse: true }, miniTarget: { btn: 'dkchg' } });
  await wait(400);
  await say('d_red');
  await say('d_slots', { target: { btn: 'dktb' } });
  await say('d_chips', { target: { btn: 'dktc' } });
  await say('d_mk');
  await say('d_bye');
  deckTutEnd(T, true);
}
