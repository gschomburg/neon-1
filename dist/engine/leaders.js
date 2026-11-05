// NeoN+1 engine/leaders.js: the online leaderboard (greglytics, on s3iz.com/glx).
// A finished run (not practice, not multiplayer) posts its depth to two boards: today's (UTC day) and all time,
// as soon as it ends (so it's never lost, and the rank comes back right away). Ranked by layers reached; fewer
// mods breaks a tie. Every run is its own entry (one player can be on a board many times). Then the end screen asks for 3-letter initials (big Bigfig
// letters) and UPLOAD sends them: the server keeps one name per device and shows it on all its entries.
// Pages opened from a file or localhost use the test boards (kept apart on the server), and so does a tester
// device: open the game once with ?dev=1 (remembered; ?dev=0 or the dev menu turns it off).
// SEED BOARDS (docs/ENDGAME.md, decided 2026-11-05): every seed has a board of its own (`seed-<SEED>`). A run on a seed
// you chose (run.seeded: typed, REPLAYS, retry) goes on its seed's board and on `replays` (the SEEDS tab's front page),
// never on TODAY / ALL TIME: memorizing a map shouldn't win those. Other runs go on TODAY / ALL TIME and their seed's
// board (so a replay has the first run to beat). Every score says if you'd beaten G0D (data.g0d: tracked, not shown).
'use strict';
NEON_FILES.push(['engine/leaders.js', 'v14.45']);

const LB_ENDPOINT = 'https://s3iz.com/glx/api/';
const LB_TABS = [{ key: 'day', label: 'TODAY' }, { key: 'all', label: 'ALL TIME' }, { key: 'seeds', label: 'SEEDS' }];
const LB_MAIN = ['day', 'all'];   // the boards a normal run's rank line shows
const LB_SEEDS_FETCH = 100;   // the SEEDS front page fetches this many, then keeps each player's best on each seed
const LB_ROWS = 15;   // (the user, 2026-10-29: there's room for 15)
let lbGl;   // the greglytics client (null if it couldn't start)
let lbUrlDone = false;
function lbClient() {
  if (lbGl === undefined) {
    try {
      if (window.Greglytics && params.get('dev') && !lbUrlDone) Greglytics.tester(params.get('dev') === '1');   // once per page load
      lbUrlDone = true;
      lbGl = window.Greglytics ? Greglytics.init({ endpoint: LB_ENDPOINT, app: 'neon', version: VERSION.slice(1) }) : null;
    }
    catch (e) { lbGl = null; }
  }
  return lbGl;
}
// dev menu: turn this device's tester mode on / off (a new client picks it up)
function lbToggleTester() {
  if (!window.Greglytics) return Sound.deny();
  if (lbGl) lbGl.flush();   // send what's queued under the old setting first
  Greglytics.tester(!Greglytics.tester()); lbGl = undefined; Sound.ui();
}
const lbBoard = (key, t = Date.now()) => key === 'day' ? 'day-' + new Date(t).toISOString().slice(0, 10) : key === 'seeds' ? 'replays' : 'all';
const lbSeedBoard = seed => 'seed-' + seed;   // (seeds are A-Z 0-9, up to 16: the server takes [A-Za-z0-9_.:-], 80 long)

// ---------------- Initials ----------------
// Bigfig (Glenn Chappell, a FIGlet font; from asXii's font list): 3 x 3 letters.
const LB_FONT = {
  A: [' _ ', '|_|', '| |'], B: [' _ ', '|_)', '|_)'], C: [' __', '/  ', '\\__'], D: [' _ ', '| \\', '|_/'], E: [' __', '|_ ', '|__'],
  F: [' __', '|_ ', '|  '], G: [' __', '/__', '\\_|'], H: ['   ', '|_|', '| |'], I: ['___', ' | ', '_|_'], J: ['   ', '  |', '\\_|'],
  K: ['   ', '|/ ', '|\\ '], L: ['   ', '|  ', '|__'], M: ['   ', '|V|', '| |'], N: ['   ', '|\\|', '| |'], O: [' _ ', '/ \\', '\\_/'],
  P: [' _ ', '|_)', '|  '], Q: [' _ ', '/ \\', '\\_X'], R: [' _ ', '|_)', '| \\'], S: [' __', '(_ ', '__)'], T: ['___', ' | ', ' | '],
  U: ['   ', '| |', '|_|'], V: ['\\ /', ' V ', '   '], W: ['   ', '| |', '|^|'], X: ['\\ /', ' X ', '/ \\'], Y: ['\\ /', ' Y ', ' | '],
  Z: ['___', ' _/', '/__'],
  // digits (0 slashed, so it isn't O) and a few symbols; # is a solid block (the user, 2026-10-25)
  '0': [' _ ', '|/|', '|_|'], '1': ['   ', '/| ', ' | '], '2': ['_  ', ' ) ', '/_ '], '3': ['_  ', '_) ', '_) '],
  '4': ['   ', '|_|', '  |'], '5': [' _ ', '|_ ', ' _)'], '6': [' _ ', '|_ ', '|_)'], '7': ['__ ', ' / ', '/  '],
  '8': [' _ ', '(_)', '(_)'], '9': [' _ ', '(_|', '  |'], '*': ['\\|/', '-*-', '/|\\'], '#': ['###', '###', '###'],
  '$': ['_|_', '(_ ', '_|)'], '!': [' | ', ' | ', ' o '], '?': [' _ ', ' _)', ' o '], '+': ['   ', '_|_', ' | '],
};
const LB_ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*#$!?+';   // up / down cycles through these
const LB_OK = /^[A-Z0-9*#$!?+]{3}$/;
const LB_RUDE = ['ASS', 'CUM', 'FAG', 'FUC', 'FUK', 'FCK', 'KKK', 'NIG', 'NGR', 'DIK', 'COK', 'CNT', 'TIT', 'JIZ', 'SHT', 'FKU', 'NAZ', 'HOE', 'WTF'];
// Yours, kept in the save. The first time: the first letters of your hacker name (VOLT_WIDOW -> VWI).
function lbInitials() {
  if (LB_OK.test(save.initials || '')) return save.initials;
  const parts = profile().name.toUpperCase().split(/[^A-Z]+/).filter(Boolean);
  let s = parts.map(p => p[0]).join('');
  if (s.length < 3) s += (parts[parts.length - 1] || 'NEON').slice(1);
  return (s + 'XXX').slice(0, 3);
}

// ---------------- Sending ----------------
// The save holds what's waiting (scores, and a name to set); sends that fail (offline) go next time.
// Automated runs (the playtest tools drive a headless browser) don't send, unless a test asks (LB_TEST).
// st.lbPost: this run's post, for the end screen: { at, score, tie, ranks: {day, all}, state, letters, cur, uploaded }
function lbSubmit(run, win) {
  st.lbPost = null;
  try {
    if (run.practice || st.mp || EDITOR || !(run.depth > 0) || !lbClient()) return;   // (run kinds: engine/save.js)
    if (navigator.webdriver && !window.LB_TEST) return;
    const prof = profile(), at = Date.now(), ini = lbInitials();
    // tie: fewer 1UPs used wins, then fewer mods (1UPs x 100 + mods; the board shows the mods: tie % 100)
    const s = { at, score: run.depth, tie: (run.oneUps || 0) * 100 + run.mods.length, player: ini, logo: logoMark(prof.logo),
      data: { hacker: prof.name, style: prof.style, win: !!win, sector: (run.sector || 0) + 1, v: VERSION, run: at, seed: run.seed, oneUps: run.oneUps || 0,
        seeded: !!run.seeded, g0d: !!save.beatG0D } };   // run: the initials name just this run's scores
    // which boards: [tab, board]. tab 'seed' is the run's own seed's board.
    const posts = (run.seeded ? [['seeds', lbBoard('seeds')]] : LB_MAIN.map(k => [k, lbBoard(k, at)])).concat([['seed', lbSeedBoard(run.seed)]]);
    st.lbPost = { at, score: s.score, tie: s.tie, ranks: {}, of: {}, tabs: posts.map(p => p[0]), seed: run.seed, seeded: !!run.seeded,
      state: 'send', letters: ini.split(''), cur: 0, uploaded: false };
    save.lbQueue = (save.lbQueue || []).concat(posts.map(([tab, board]) => Object.assign({ board, tab }, s))).slice(-15);
    persist();
    lbFlush().then(() => { const p = st.lbPost; if (p && p.at === at && p.state === 'send') p.state = 'offline'; });
  } catch (e) { /* the leaderboard never gets in the way of the game */ }
}
// Send what's waiting, one at a time. Kept for later: no connection, "slow down", a server problem.
// Dropped: anything the server turned down for good (bad data).
let lbSending = null;
function lbFlush() {
  const gl = lbClient();
  if (!gl) return Promise.resolve();
  if (lbSending) return lbSending;
  const next = () => {
    const q = save.lbQueue;
    if (!q || !q.length) return null;
    const it = q[0];
    const send = it.kind === 'name' ? gl.setName(it.name, it.run) : gl.submitScore(it.board, it);
    return send.then(r => {
      const retry = r && r.error && /slow down|server|database|config/.test(r.error);
      if (retry) return null;
      save.lbQueue.shift(); persist();
      const p = st.lbPost;   // this run's ranks, for the end screen
      if (p && it.at === p.at && it.tab && r && r.ok) {
        p.ranks[it.tab] = r.run; p.of[it.tab] = r.of;
        if ((p.tabs || LB_MAIN).every(k => p.ranks[k] != null)) { p.state = 'ok'; lbFanfare(p); }
      }
      return next();
    }, () => null);
  };
  lbSending = Promise.resolve(next()).finally(() => { lbSending = null; });
  return lbSending;
}
const lbRude = s => LB_RUDE.includes(s);
function lbUpload() {
  const p = st.lbPost;
  if (!p || p.uploaded) return;
  const ini = p.letters.join('');
  if (lbRude(ini)) { Sound.deny(); setMsg('> pick other letters.', C.danger); return; }
  save.initials = ini;
  save.lbQueue = (save.lbQueue || []).filter(x => x.kind !== 'name').concat([{ kind: 'name', name: ini, run: p.at }]);
  persist();
  p.uploaded = true;
  Sound.buy(); flash(C.accent, 0.12, 0.3);
  setMsg(`> uploaded as ${ini}.`, C.accent);
  lbFlush();
}

// The fanfare: a top 10 (today or all time) gets fireworks, #1 all time the most; a personal best a flash.
// It waits for the results to finish coming in.
function lbFanfare(p) {
  if (p.fanfare) return;
  p.fanfare = true;
  const go = () => {
    if (st.lbPost !== p || st.mode !== 'over') return;
    const rv = st.overReveal;
    if (rv && !(rv.total && rv.vis >= rv.total)) return setTimeout(go, 200);
    if (p.seeded) {   // a seed: #1 on it (with someone to beat), or a top 10 on the SEEDS front page
      if (p.ranks.seed === 1 && p.of.seed > 1) { flash(C.money, 0.2, 0.5); shake(3, 0.3); Sound.win(); fireworkShow(5, 280, 'over'); }
      else if (p.ranks.seeds <= 10) { flash(C.money, 0.18, 0.5); Sound.jingle(); }
      else if (st.result && st.result.newBest) { flash(C.accent, 0.18, 0.5); Sound.jingle(); }
      return;
    }
    const best = Math.min(p.ranks.all, p.ranks.day);
    if (p.ranks.all === 1) { flash(C.money, 0.3, 0.8); shake(6, 0.5); Sound.victory(); fireworkShow(14, 220, 'over'); }
    else if (best <= 10) { flash(C.money, 0.2, 0.5); shake(3, 0.3); Sound.win(); fireworkShow(best <= 3 ? 9 : 5, 280, 'over'); }
    else if (st.result && st.result.newBest) { flash(C.accent, 0.18, 0.5); Sound.jingle(); }
  };
  go();
}

// ---------------- The end screen's block ----------------
// Lines for the bottom of the results (overLines), or null (practice, multiplayer, no connection code).
function lbOverLines() {
  const p = st.lbPost, r = st.result;
  if (!p || !r || r.sector) return null;
  const out = [];
  // the ranks: this run's place on each board
  if (p.state === 'ok' && p.seeded) {   // a seed: "#2 of 5 on K7XQ2M". (Not the SEEDS page's rank: that page counts each
    // player once, the server's rank counts every run, so the two wouldn't match.)
    const top = p.ranks.seed === 1 && p.of.seed > 1, txt = `#${p.ranks.seed} of ${p.of.seed} on ${p.seed}`;
    out.push({ text: txt, col: top ? C.money : C.mid, bold: top });
  } else if (p.state === 'ok') {
    const tabs = LB_TABS.filter(t => LB_MAIN.includes(t.key)), top = tabs.some(t => p.ranks[t.key] <= 10);
    const txt = tabs.slice().reverse().map(t => `#${p.ranks[t.key]} ${top ? t.label : t.label.toLowerCase()}`).join('   ');
    out.push({ text: top ? `** ${txt} **` : txt, col: top ? C.money : C.mid, bold: top });
  } else if (p.state === 'offline') out.push({ text: 'offline: it posts when you\'re back', col: C.dim });
  else out.push({ text: 'checking the board' + '.'.repeat(1 + Math.floor(performance.now() / 300) % 3).padEnd(3), col: C.dim });
  if (p.uploaded) {
    out.push({ text: `uploaded as ${p.letters.join('')}`, col: C.accent });
    return out;
  }
  // the initials: arrows above and below each big letter (tap to change), the one being typed in the accent color
  const pick = (k, d) => () => { p.cur = k; lbStep(d); };
  out.push({ gap: 3, row: [0, 1, 2].map(k => ({ text: '[^]', id: 'lbu' + k, onTap: pick(k, 1) })) });
  for (let row = 0; row < 3; row++) {
    const text = p.letters.map(ch => (LB_FONT[ch] || LB_FONT.X)[row]).join('   ');
    out.push({ text, bold: true, colorAt: i => i % 6 < 3 && Math.floor(i / 6) === p.cur ? C.accent : C.bright });
  }
  out.push({ gap: 3, row: [0, 1, 2].map(k => ({ text: '[v]', id: 'lbd' + k, onTap: pick(k, -1) })) });
  const rude = lbRude(p.letters.join(''));
  out.push({ box: true, text: 'U P L O A D', sub: rude ? '- pick other letters -' : '- sign your run -', id: 'lbup', onTap: lbUpload, minW: 24, disabled: rude });
  return out;
}
function lbStep(d) {
  const p = st.lbPost; if (!p) return;
  const i = LB_ABC.indexOf(p.letters[p.cur]);
  p.letters[p.cur] = LB_ABC[(i + d + LB_ABC.length) % LB_ABC.length];
  Sound.tick();
}
// Keys while the initials are up: left / right pick a letter, up / down change it, typing a letter (or digit, symbol) sets it and
// moves on, backspace goes back, enter uploads. Everything else goes to the screen's own keys (`prev`).
function lbOverKeys(prev) {
  const h = k => {
    const p = st.lbPost;
    if (!p || p.uploaded || st.mode !== 'over') return prev ? prev(k) : false;
    if (k === 'arrowleft' || k === 'arrowright') { p.cur = clamp(p.cur + (k === 'arrowleft' ? -1 : 1), 0, 2); Sound.tick(); return true; }
    if (k === 'arrowup' || k === 'arrowdown') { lbStep(k === 'arrowup' ? 1 : -1); return true; }
    if (k.length === 1 && LB_ABC.includes(k.toUpperCase())) { p.letters[p.cur] = k.toUpperCase(); p.cur = Math.min(2, p.cur + 1); Sound.tick(); return true; }
    if (k === 'backspace') { p.cur = Math.max(0, p.cur - 1); Sound.tick(); return true; }
    if (k === 'enter') { lbUpload(); return true; }
    return prev ? prev(k) : false;
  };
  h.typing = true;   // letters reach it before the game's own letter keys (M mute, N music)
  return h;
}

// ---------------- The title screen's line ----------------
// Where your best run stands: "board: #5 all time · #2 today". Fetched quietly (at most once a minute while the
// title shows); nothing until there's an answer, and nothing when you're not on a board (or offline).
let lbTitle = { at: -1e9, busy: false, all: null, day: null };
function lbTitleLine() {
  const gl = lbClient();
  if (!gl || EDITOR || (navigator.webdriver && !window.LB_TEST)) return null;
  if (!lbTitle.busy && performance.now() - lbTitle.at > 60000) {
    lbTitle.busy = true; lbTitle.at = performance.now();
    const you = name => gl.scores(name, { limit: 1 }).then(d => d && d.you ? d.you.rank : null, () => undefined);
    lbFlush().then(() => Promise.all([you(lbBoard('all')), you(lbBoard('day'))])).then(([all, day]) => {
      if (all !== undefined) lbTitle.all = all;
      if (day !== undefined) lbTitle.day = day;
    }).finally(() => { lbTitle.busy = false; });
  }
  if (!lbTitle.all && !lbTitle.day) return null;
  return [lbTitle.all ? `#${lbTitle.all} all time` : '', lbTitle.day ? `#${lbTitle.day} today` : ''].filter(Boolean).join(' · ');
}

// ---------------- The leaderboard screen ----------------
const lbLum = hex => { const n = parseInt(String(hex).replace('#', '').slice(0, 6), 16) || 0; return 0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255); };
function openLeaders() {
  const tab = () => LB_TABS.find(t => t.key === (st.lbTab || 'all')) || LB_TABS[1];
  const seedsTab = () => tab().key === 'seeds';
  // which board shows: TODAY, ALL TIME, the SEEDS front page (replays) or one seed's board (st.lbSeed)
  const boardName = () => seedsTab() ? (st.lbSeed ? lbSeedBoard(st.lbSeed) : lbBoard('seeds')) : lbBoard(tab().key);
  const got = {};   // board name -> { state: 'load' | 'ok' | 'err', data }
  const load = (force) => {
    const name = boardName(), gl = lbClient();
    if (!gl) { got[name] = { state: 'err' }; return; }
    if (got[name] && got[name].state !== 'err' && !force) return;
    got[name] = { state: 'load', t: performance.now() };
    const front = seedsTab() && !st.lbSeed;
    lbFlush().then(() => gl.scores(name, { limit: front ? LB_SEEDS_FETCH : LB_ROWS }))
      .then(d => { got[name] = d && d.entries ? { state: 'ok', data: front ? lbBestPerSeed(d) : d } : { state: 'err' }; },
            () => { got[name] = { state: 'err' }; });
  };
  const show = key => { if (st.lbTab === key && !st.lbSeed) return; st.lbTab = key; st.lbSeed = null; st.lbPick = null; Sound.tick(); load(); };
  const go = d => { const i = LB_TABS.indexOf(tab()); show(LB_TABS[(i + d + LB_TABS.length) % LB_TABS.length].key); };
  const openSeed = seed => { st.lbSeed = seed; st.lbPick = null; Sound.ui(); load(); };
  const back = () => { if (seedsTab() && st.lbSeed) { st.lbSeed = null; Sound.tick(); load(); } else swapTo(showTitle); };
  const playSeed = seed => { if (st.transitioning) return; st.seed = seed; st.practice = false; st.seeded = true; startRun(seed, false, { seeded: true }); };

  // one row, 32 wide: rank, mark, initials, hacker name (the SEEDS front page: the seed), layers, mods
  const row = (e, X, opts = {}) => {
    const named = e.data && e.data.hacker;   // entries from before initials: the hacker name was the player
    const ini = named ? (e.player || '???') : '---', who = opts.seed ? String((e.data && e.data.seed) || '?') : named ? e.data.hacker : e.player || '';
    const text = `${String(e.rank).padStart(2)} ${(e.logo || '   ').padEnd(3).slice(0, 3)} ${ini.padEnd(3).slice(0, 3)} ${who.slice(0, 13).padEnd(13)} ${pad2(e.score).padStart(3)} ${String(e.tie % 100).padStart(3)}`;
    const sty = styleOf((e.data && e.data.style) || 0), mark = lbLum(sty.fg) >= lbLum(sty.bg) ? sty.fg : sty.bg;   // a style's brighter color reads on black
    const picked = opts.pick != null && st.lbPick === opts.pick;
    X({ text, colorAt: i => i < 2 ? C.dim : i < 6 ? mark : i < 10 ? (e.me ? C.accent : C.bright) : i < 24 ? (opts.seed ? C.text : C.dim) : i < 28 ? C.money : C.mid,
      bold: !!e.me || picked, bgCol: picked ? C.accent : e.me ? C.accent : null, bgA: picked ? 0.3 : 0.15,
      tap: opts.pick != null ? { id: 'lbr' + opts.pick, onTap: () => { st.lbPick = st.lbPick === opts.pick ? null : opts.pick; Sound.tick(); } } : null });
  };

  openPanel('LEADERBOARD', (T, B, X) => {
    const name = boardName(), g = got[name] || { state: 'load' }, front = seedsTab() && !st.lbSeed;
    if (!got[name]) load();
    T('L E A D E R B O A R D', C.accent);
    X({ gap: 2, row: LB_TABS.map(t => ({ text: `[ ${t.label} ]`, id: 'lbt' + t.key, sel: t === tab(), onTap: () => show(t.key) })) });
    T(SEP, C.dim);
    // the SEEDS tab: a field to find a seed (front page), or the seed you're looking at and a way to play it
    let rows = LB_ROWS;
    if (front) {
      X({ row: [{ text: 'find' }, { field: 'lbseed', width: 16, value: () => '', clean: cleanSeed, onCommit: s => { const c = cleanSeed(s); if (c) openSeed(c); } }] });
      rows--;
    } else if (seedsTab()) {
      X({ row: [{ text: `seed ${st.lbSeed}`, col: C.accent }, { text: '[ PLAY IT ]', id: 'lbplay', onTap: () => playSeed(st.lbSeed) }] });
      rows--;
    }
    T(` #     ${(front ? 'seed' : 'who').padEnd(17)} lyr mod`, C.dim);
    let used = 0;
    if (g.state === 'ok') {
      const d = g.data, list = d.entries.slice(0, rows);
      list.forEach((e, i) => { row(e, X, front ? { seed: true, pick: i } : {}); used++; });
      if (!d.entries.length) {
        T('');
        T(front ? 'no replays yet.' : seedsTab() ? 'nobody on this seed yet.' : tab().key === 'day' ? 'no runs yet today.' : 'no runs yet.', C.mid);
        T(front ? 'pick a seed and run it again.' : 'be the first.', C.dim); used += 3;
      }
      for (; used < rows; used++) T('');
      T(SEP, C.dim);
      const pick = front && st.lbPick != null ? list[st.lbPick] : null, pickSeed = pick && pick.data && pick.data.seed;
      if (pickSeed) X({ gap: 2, row: [{ text: '[ THIS SEED ]', id: 'lbthis', onTap: () => openSeed(pickSeed) }, { text: '[ PLAY IT ]', id: 'lbplay', onTap: () => playSeed(pickSeed) }] });
      else if (d.you && !d.entries.slice(0, rows).some(e => e.me)) row(d.you, X, front ? { seed: true } : {});
      else T(front ? 'tap a run for its seed' : d.you ? `${d.of} run${d.of === 1 ? '' : 's'} on the board` : seedsTab() ? 'run this seed to get on it' : 'finish a run to get on the board', C.dim);
    } else {
      T('');
      if (g.state === 'err') { T('no signal.', C.danger); B('[ RETRY ]', 'lbretry', () => { Sound.ui(); load(true); }); used += 3; }
      else { T('connecting' + '.'.repeat(1 + Math.floor((performance.now() - (g.t || 0)) / 300) % 3).padEnd(3), C.mid); used += 2; }
      for (; used < rows; used++) T('');
      T(SEP, C.dim);
      T('');
    }
    const gl = lbClient();
    T(gl && gl.dev ? 'test board (tester / local page)' : front ? 'replays: each player\'s best on each seed.' : seedsTab() ? 'everyone on this seed. most layers wins.'
      : tab().key === 'day' ? 'today = the UTC day' : 'most layers. fewer 1UPs, then mods, win ties.', C.dim);
    T('');
    B(seedsTab() && st.lbSeed ? '[ ALL SEEDS ]' : '[ BACK ]', 'back', back);
  }, '> pulling the board.', { full: true });
  st.keyHandler = k => {
    if (k === 'escape') { back(); return true; }
    if (k === 'arrowleft' || k === 'arrowright') { go(k === 'arrowleft' ? -1 : 1); st.kbFocus = st.hoverBtn = 'lbt' + tab().key; return true; }
    return false;
  };
}
// The SEEDS front page: one row per player per seed (their best; the board comes best first), ranked again.
function lbBestPerSeed(d) {
  const seen = new Set(), entries = [];
  for (const e of d.entries) {
    const k = `${e.player}|${e.data && e.data.hacker}|${e.data && e.data.seed}`;
    if (seen.has(k)) continue;
    seen.add(k); entries.push(Object.assign({}, e, { rank: entries.length + 1 }));
  }
  const you = entries.find(e => e.me) || null;
  return Object.assign({}, d, { entries, you });
}
