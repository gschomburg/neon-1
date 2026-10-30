// NeoN+1 engine/feats.js: THE RECORD (save.stats), FEATS (data/feats.js), titles, the FEAT box, the * marks
// and the progression wipe. The plan: docs/PROGRESSION.md.
'use strict';
NEON_FILES.push(['engine/feats.js', 'v13.85']);

// ---------------- The record ----------------
// save.stats: one flat map of numbers (data/feats.js lists them). tally adds, best keeps the highest.
// Practice runs, the training and multiplayer don't count.
const FEAT_BY_ID = Object.fromEntries(FEATS.map(f => [f.id, f]));
const statOf = k => (save.stats && save.stats[k]) || 0;
const counting = () => !(st.run && (st.run.practice || st.run.tutorial)) && !st.mp;
function tally(stat, by = 1) {
  if (!counting() || !by) return;
  save.stats = save.stats || {};
  save.stats[stat] = statOf(stat) + by;
  checkFeats(stat);
  persist();
}
function best(stat, v) {
  if (!counting() || !(v > statOf(stat))) return;
  save.stats = save.stats || {};
  save.stats[stat] = v;
  checkFeats(stat);
  persist();
}
// A corp breached: the count, and (the first time for that corp) the different corps.
function tallyCorp(key) {
  if (!counting()) return;
  if (CORPS[key]) {
    const k = 'corp:' + key;
    save.stats = save.stats || {};
    if (!save.stats[k]) tally('corpKinds');
    save.stats[k] = statOf(k) + 1;
  }
  tally('corps');
}
// A layer cleared (engine/run.js onSafe): layers, perfects, the streak, the deepest layer, credits held, a boss at 1.
function tallyLayer(run, lv, perfect) {
  if (!counting() || lv.n <= 1) return;
  tally('layers');
  if (perfect) { tally('perfects'); run.perfRow = (run.perfRow || 0) + 1; best('bestStreak', run.perfRow); }
  else run.perfRow = 0;
  best('bestDepth', run.depth);
  best('bestHeld', run.credits);
  if (lv.boss && run.integrity === 1) tally('bossAt1');
}
function tallySector(run) {
  tally('sectors');
  best('bestSectors', run.sectorsCleared || 0);
  if (!run.mods.length) tally('nakedSector');
}
// The run's end (engine/run.js endRun): win = cashed out.
function tallyRunEnd(run, win, rep) {
  if (!counting()) return;
  tally('runs');
  if (win) tally('cashouts');
  else { tally('deaths'); if (!run.corps) tally('diedFirst'); }
  tally('earned', run.earned);
  if (rep) tally('repBanked', rep);
  best('bestDepth', run.depth);
  best('bestSpent', Math.max(0, (run.cr0 || 0) + run.earned - run.credits));
  if (run.earned >= 1000 && run.credits < 10) tally('easyCome');
}

// ---------------- Feats ----------------
const featNeed = f => f.n === 'all' ? Object.keys(CORPS).length : f.n;
const featDone = id => !!(save.feats && save.feats[id]);
const featProgress = f => Math.min(statOf(f.stat), featNeed(f));
function checkFeats(stat) {
  for (const f of FEATS) if (f.stat === stat && !featDone(f.id) && statOf(stat) >= featNeed(f)) grantFeat(f.id);
}
// Done: it's yours (and its title). quiet: no news (NEWB for players who skipped the training, a wipe).
function grantFeat(id, quiet = false) {
  const f = FEAT_BY_ID[id];
  if (!f || featDone(id)) return;
  save.feats = save.feats || {};
  save.feats[id] = Date.now();
  if (save.stats && statOf(f.stat) < featNeed(f) && typeof f.n === 'number') { save.stats[f.stat] = f.n; checkFeats(f.stat); }   // (granted by hand: the record agrees)
  if (!quiet) {
    (save.unseen = save.unseen || {})[id] = 1;
    if (f.title) save.newTitle = true;
    for (const u of LEGACY) if (u.pm === id) (save.unseenPosts = save.unseenPosts || {})[u.key] = 1;   // a PRIVATE MESSAGE it opens
    featNews(f);
  }
  const prof = profile();
  if (f.title && !prof.title) prof.title = f.title;   // your first title goes on your card
  persist();
}
// Undo one (the editor's FEATS tab): the feat and its title go; the record stays as it is.
function ungrantFeat(id) {
  if (!save.feats) return;
  delete save.feats[id];
  if (save.unseen) delete save.unseen[id];
  const prof = profile();
  if (prof.title && !myTitles().includes(prof.title)) prof.title = myTitles()[0] || null;
  persist();
}

// ---------------- Titles ----------------
// From feats; you wear one on your card (YOU). NEWB is the first (the training, or your first run).
const myTitles = () => FEATS.filter(f => f.title && featDone(f.id)).map(f => f.title);
const titleOf = prof => (prof.title && myTitles().includes(prof.title) ? prof.title : myTitles()[0]) || '';
function stepTitle(prof, d) {
  const list = myTitles();
  if (!list.length) return Sound.deny();
  const i = list.indexOf(titleOf(prof));
  prof.title = list[((i < 0 ? 0 : i + d) % list.length + list.length) % list.length];
  persist(); Sound.tick();
}

// ---------------- The * marks ----------------
// A new feat is starred (on its row, the FEATS tab, THE BOARD on the title) until you've looked at it; a new title
// stars YOU and your name on the title until you open YOU.
const boardNew = () => Object.keys(save.unseen || {}).length > 0 || repNew() || (typeof questsNew === 'function' && questsNew());
const repNew = () => Object.keys(save.unseenPosts || {}).length > 0;   // a new post on REP (a level opened, a PRIVATE MESSAGE)
const postUnseen = key => !!(save.unseenPosts && save.unseenPosts[key]);
function seePost(key) { if (postUnseen(key)) { delete save.unseenPosts[key]; persist(); } }
// A level opened (engine/menus.js, after a buy): its posts are new, and the box says so.
function boardLevelNews(lv) {
  const posts = LEGACY.filter(u => u.tier === lv);
  for (const u of posts) (save.unseenPosts = save.unseenPosts || {})[u.key] = 1;
  persist();
  FEAT_QUEUE.push({ head: 'THE BOARD', lines: [`access: ${BOARD_LEVELS[lv - 1].name}.`, '', posts.length ? 'new posts on THE BOARD:' : 'nothing posted on it yet.', ...posts.map(u => '  ' + u.name)] });
}
const featUnseen = id => !!(save.unseen && save.unseen[id]);
function seeFeat(id) { if (featUnseen(id)) { delete save.unseen[id]; persist(); } }
function seeTitles() { if (save.newTitle) { save.newTitle = false; persist(); } }

// ---------------- The news ----------------
// In a layer: the terminal line, in the rep color, for a moment (then the line goes back). Then, once things are calm
// (not in a layer, nothing else up), the FEAT box: one page per feat. CLOSE drops the rest; NEXT turns the page.
const FEAT_QUEUE = [];
function featNews(f) {
  if (st.mode === 'play' && st.lv) {
    const was = { msg: st.msg, col: st.msgCol }, text = `> FEAT: ${f.name}.`;
    setMsg(text, C.rep);
    Sound.loot();
    setTimeout(() => { if (st.msg === text) { setMsg(was.msg || '', was.col || C.text); st.msgT = 0; } }, 1800);
  }
  FEAT_QUEUE.push({ feat: f.id });
  if (!save.featsIntro) {   // the first feat ever: where they live
    save.featsIntro = true;
    FEAT_QUEUE.push({ head: 'FEAT', lines: ['feats live on THE BOARD:', 'tap THE BOARD on the title, then FEATS.', '', 'your titles go on your card:', 'THE BOARD > YOU.'] });
  }
}
const featCalm = () => !st.ad && !st.evCard && !st.dev && !st.mp && !st.boot && !st.transitioning && !st.wipe && !st.dying && !st.hideAll
  && !(st.tut && (st.tut.pop || st.tut.curtain)) && st.mode !== 'play' && !(st.run && st.run.tutorial && !st.run.ended)
  && !(st.panelReveal && !st.panelReveal.done) && !(st.mode === 'map' && st.mapView && st.mapView.row !== st.mapView.target)
  && !st.intro && !st.bossIntro && !(st.mode === 'fish' && st.fish && (st.fish.hook || st.fish.reel || st.fish.card));   // (the PIER: between casts)
// Each frame (engine/scene.js): open the box when there's news and it's calm.
function featBoxTick(now) {
  if (st.featBox || !FEAT_QUEUE.length || !featCalm()) return;
  st.featBox = { items: FEAT_QUEUE.splice(0), i: 0, t0: now };
  st.kbFocus = st.hoverBtn = null;   // (the screen under it lets go of its cursor)
  Sound.shield();
}
function featBoxNext() {
  const b = st.featBox;
  if (!b) return;
  if (b.i < b.items.length - 1) { b.i++; b.t0 = performance.now(); Sound.tick(); }
  else featBoxClose();
}
function featBoxClose() { st.featBox = null; Sound.ui(); }
function featTap(h) {
  if (!h) return;
  if (h.kind === 'btn' && (h.id === 'fclose' || h.id === 'fnext')) return h.onTap();
  if (h.kind === 'fbox') featBoxNext();
}
function featKey(k) {
  if (k === 'escape' || k === 'x') return featBoxClose();
  if (k === 'enter' || k === ' ' || k === 'arrowright') featBoxNext();
}
const FEAT_W = 32;   // the box's inside
// One page as lines: { t, col, bold }
function featPage(it) {
  const out = [];
  if (it.feat) {
    const f = FEAT_BY_ID[it.feat];
    out.push({ t: f.name, col: C.bright, bold: true });
    out.push({ t: '' });
    for (const l of wrapText(f.say || f.text, FEAT_W - 2)) out.push({ t: l, col: C.text });
    if (f.title) { out.push({ t: '' }); out.push({ t: `unlocked title: ${f.title}`, col: C.rep, bold: true }); }
    if (f.logo) { out.push({ t: '' }); out.push({ t: `unlocked logo: ${HACKERS[f.logo].name}`, col: C.rep, bold: true }); }
    for (const u of LEGACY.filter(u => u.pm === f.id)) { out.push({ t: '' }); out.push({ t: `new post: ${u.name}`, col: C.rep, bold: true }); out.push({ t: '(THE BOARD > REP)', col: C.mid }); }
  } else for (const l of it.lines) out.push({ t: l, col: C.text });
  // every line wraps to the box (the how-it-works page's lines were cut off)
  return out.flatMap(r => r.t.length > FEAT_W - 2 ? wrapText(r.t, FEAT_W - 2).map(t => Object.assign({}, r, { t })) : [r]);
}
// Drawn over everything (engine/scene.js), like the SECTOR EVENT card.
function buildFeatBox(ctx, now) {
  const { put, bg, cells, addHit } = ctx, b = st.featBox, it = b.items[b.i];
  if (!it) { st.featBox = null; return; }
  const rows = featPage(it), more = b.items.length > 1;
  const w = FEAT_W + 2, h = rows.length + 5, x0 = Math.max(0, Math.floor((L.wc - w) / 2)), y0 = Math.max(0, Math.floor((L.hc - h) / 2));
  clearRect(cells, x0, y0, w, h);
  for (let r = 0; r < h; r++) bg(x0, y0 + r, w, C.bg, 1);
  addHit(x0, y0, w, h, { kind: 'fbox' });
  const head = it.head || 'FEAT', count = more ? ` ${b.i + 1} of ${b.items.length} -` : '';
  put(x0, y0, ('+- ' + head + ' ' + '-'.repeat(w)).slice(0, w - 1 - count.length) + count + '+', C.rep, 'hud', true);
  put(x0, y0 + h - 1, '+' + '-'.repeat(w - 2) + '+', C.rep, 'hud', true);
  for (let r = 1; r < h - 1; r++) { put(x0, y0 + r, '|', C.rep, 'hud'); put(x0 + w - 1, y0 + r, '|', C.rep, 'hud'); }
  let budget = Math.floor((now - b.t0) / 6);   // the lines type in
  rows.forEach((ln, r) => {
    const t = ln.t.slice(0, FEAT_W - 2), shown = t.slice(0, Math.max(0, budget)); budget -= t.length;
    if (shown) put(x0 + 2, y0 + 2 + r, shown, ln.col || C.text, 'hud', !!ln.bold);
  });
  // the buttons: inverted, in the rep color. CLOSE always; NEXT when there's another page.
  const btns = [{ id: 'fclose', text: '[ CLOSE ]', onTap: featBoxClose }];
  if (b.i < b.items.length - 1) btns.push({ id: 'fnext', text: '[ NEXT ]', onTap: featBoxNext });
  const bw = btns.reduce((s, x) => s + x.text.length, 0) + (btns.length - 1) * 4;
  let bx = x0 + Math.floor((w - bw) / 2);
  const by = y0 + h - 2;
  for (const x of btns) {
    const hov = st.hoverBtn === x.id;
    bg(bx, by, x.text.length, hov ? C.bright : C.rep, 1);
    put(bx, by, x.text, C.bg, 'hud', true);
    addHit(bx, by, x.text.length, 1, { kind: 'btn', id: x.id, onTap: x.onTap });
    bx += x.text.length + 4;
  }
}

// ---------------- NEWB ----------------
// The training gives it (with its FEAT box). Skip the training and your first run gives it quietly.
function featTrained() {
  save.stats = save.stats || {};
  save.stats.newb = 1;
  grantFeat('newb');
}
function featRunStart(run) {
  run.cr0 = run.credits;
  if (!featDone('newb') && !run.tutorial) { save.stats = save.stats || {}; save.stats.newb = 1; grantFeat('newb', true); }
}

// ---------------- The progression wipe ----------------
// PROGRESS_EPOCH: raise it to start everyone's progression over (after a big change). On load, a save from an
// older epoch: the REP spent on THE BOARD comes back, and the posts bought, feats, titles and the record go. Best,
// runs, wins, history, the codex and the profile stay. NEWB comes back for anyone who's played.
const PROGRESS_EPOCH = 1;
function wipeProgress() {
  let refund = 0;
  for (const u of LEGACY) for (let i = 0; i < legacyLv(u.key); i++) refund += u.costs[i] || 0;
  const had = refund > 0 || Object.keys(save.feats || {}).length > 0;
  save.rep = (save.rep || 0) + refund;
  save.legacy = {}; save.stats = {}; save.feats = {}; save.unseen = {}; save.newTitle = false; save.featsIntro = false;
  save.unseenPosts = {}; save.locker = null; save.nemesis = null;   // (REP's posts: what's in the LOCKER, your NEMESIS)
  if (save.profile) {
    save.profile.title = null;
    const l = LOGO_BY_ID[save.profile.logo];
    if (l && l.kind === 'hacker') save.profile.logo = randomLogo();   // (a rival's logo isn't yours any more)
  }
  if (save.tutorialDone || save.runs) { save.stats.newb = 1; save.feats.newb = Date.now(); if (save.profile) save.profile.title = 'NEWB'; }
  save.epoch = PROGRESS_EPOCH;
  persist();
  return { refund, had };
}
function checkEpoch() {
  if ((save.epoch || 0) >= PROGRESS_EPOCH) return;
  const w = wipeProgress();
  if (w.had) FEAT_QUEUE.push({ head: 'THE BOARD', lines: ['they wiped the board. new rules.', '', w.refund ? `your REP's still here, and what` : "your REP's still here.", w.refund ? `you spent came back: +${w.refund} REP.` : ''].filter((l, i, a) => l || i < a.length - 1) });
}
