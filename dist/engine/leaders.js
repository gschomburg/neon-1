// NeoN+1 engine/leaders.js: the online leaderboard (greglytics, on s3iz.com/glx).
// A finished run (not practice, not multiplayer) posts its depth to two boards: today's (UTC day) and all time,
// as soon as it ends (so it's never lost, and the rank comes back right away). Ranked by layers reached; fewer
// mods breaks a tie. Every run is its own entry (one player can be on a board many times). Then the end screen asks for 3-letter initials (big Bigfig
// letters) and UPLOAD sends them: the server keeps one name per device and shows it on all its entries.
// Pages opened from a file or localhost use the test boards (kept apart on the server), and so does a tester
// device: open the game once with ?dev=1 (remembered; ?dev=0 or the dev menu turns it off).
'use strict';
NEON_FILES.push(['engine/leaders.js', 'v13.90']);

const LB_ENDPOINT = 'https://s3iz.com/glx/api/';
const LB_TABS = [{ key: 'day', label: 'TODAY' }, { key: 'all', label: 'ALL TIME' }];
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
const lbBoard = (key, t = Date.now()) => key === 'day' ? 'day-' + new Date(t).toISOString().slice(0, 10) : 'all';

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
    if (run.practice || st.mp || EDITOR || !(run.depth > 0) || !lbClient()) return;
    if (navigator.webdriver && !window.LB_TEST) return;
    const prof = profile(), at = Date.now(), ini = lbInitials();
    const s = { at, score: run.depth, tie: run.mods.length, player: ini, logo: logoMark(prof.logo),
      data: { hacker: prof.name, style: prof.style, win: !!win, sector: (run.sector || 0) + 1, v: VERSION, run: at } };   // run: the initials name just this run's scores
    st.lbPost = { at, score: s.score, tie: s.tie, ranks: {}, state: 'send', letters: ini.split(''), cur: 0, uploaded: false };
    save.lbQueue = (save.lbQueue || []).concat(LB_TABS.map(t => Object.assign({ board: lbBoard(t.key, at), tab: t.key }, s))).slice(-12);
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
        p.ranks[it.tab] = r.run;
        if (LB_TABS.every(t => p.ranks[t.key] != null)) { p.state = 'ok'; lbFanfare(p); }
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
  if (p.state === 'ok') {
    const top = LB_TABS.some(t => p.ranks[t.key] <= 10);
    const txt = LB_TABS.slice().reverse().map(t => `#${p.ranks[t.key]} ${top ? t.label : t.label.toLowerCase()}`).join('   ');
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
  const got = {};   // board name -> { state: 'load' | 'ok' | 'err', data }
  const load = (force) => {
    const name = lbBoard(tab().key), gl = lbClient();
    if (!gl) { got[name] = { state: 'err' }; return; }
    if (got[name] && got[name].state !== 'err' && !force) return;
    got[name] = { state: 'load', t: performance.now() };
    lbFlush().then(() => gl.scores(name, { limit: LB_ROWS }))
      .then(d => { got[name] = d && d.entries ? { state: 'ok', data: d } : { state: 'err' }; },
            () => { got[name] = { state: 'err' }; });
  };
  const show = key => { if (st.lbTab === key) return; st.lbTab = key; Sound.tick(); load(); };
  const go = d => { const i = LB_TABS.indexOf(tab()); show(LB_TABS[(i + d + LB_TABS.length) % LB_TABS.length].key); };

  // one row, 32 wide: rank, mark, initials, hacker name, layers, mods
  const row = (e, X) => {
    const named = e.data && e.data.hacker;   // entries from before initials: the hacker name was the player
    const ini = named ? (e.player || '???') : '---', hk = (named ? e.data.hacker : e.player || '').slice(0, 13);
    const text = `${String(e.rank).padStart(2)} ${(e.logo || '   ').padEnd(3).slice(0, 3)} ${ini.padEnd(3).slice(0, 3)} ${hk.padEnd(13)} ${pad2(e.score).padStart(3)} ${String(e.tie).padStart(3)}`;
    const sty = styleOf((e.data && e.data.style) || 0), mark = lbLum(sty.fg) >= lbLum(sty.bg) ? sty.fg : sty.bg;   // a style's brighter color reads on black
    X({ text, colorAt: i => i < 2 ? C.dim : i < 6 ? mark : i < 10 ? (e.me ? C.accent : C.bright) : i < 24 ? C.dim : i < 28 ? C.money : C.mid,
      bold: !!e.me, bgCol: e.me ? C.accent : null, bgA: 0.15 });
  };

  openPanel('LEADERBOARD', (T, B, X) => {
    const name = lbBoard(tab().key), g = got[name] || { state: 'load' };
    if (!got[name]) load();
    T('L E A D E R B O A R D', C.accent);
    X({ gap: 2, row: LB_TABS.map(t => ({ text: `[ ${t.label} ]`, id: 'lbt' + t.key, sel: t === tab(), onTap: () => show(t.key) })) });
    T(SEP, C.dim);
    T(` #     ${'who'.padEnd(17)} lyr mod`, C.dim);
    let used = 0;
    if (g.state === 'ok') {
      const d = g.data;
      for (const e of d.entries.slice(0, LB_ROWS)) { row(e, X); used++; }
      if (!d.entries.length) { T(''); T(tab().key === 'day' ? 'no runs yet today.' : 'no runs yet.', C.mid); T('be the first.', C.dim); used += 3; }
      for (; used < LB_ROWS; used++) T('');
      T(SEP, C.dim);
      if (d.you && !d.entries.some(e => e.me)) row(d.you, X);
      else T(d.you ? `${d.of} hacker${d.of === 1 ? '' : 's'} on the board` : 'finish a run to get on the board', C.dim);
    } else {
      T('');
      if (g.state === 'err') { T('no signal.', C.danger); B('[ RETRY ]', 'lbretry', () => { Sound.ui(); load(true); }); used += 3; }
      else { T('connecting' + '.'.repeat(1 + Math.floor((performance.now() - (g.t || 0)) / 300) % 3).padEnd(3), C.mid); used += 2; }
      for (; used < LB_ROWS; used++) T('');
      T(SEP, C.dim);
      T('');
    }
    const gl = lbClient();
    T(gl && gl.dev ? 'test board (tester / local page)' : tab().key === 'day' ? 'today = the UTC day' : 'most layers. fewer mods wins ties.', C.dim);
    T('');
    B('[ BACK ]', 'back', () => swapTo(showTitle));
  }, '> pulling the board.', { full: true });
  st.keyHandler = k => {
    if (k === 'escape') { swapTo(showTitle); return true; }
    if (k === 'arrowleft' || k === 'arrowright') { go(k === 'arrowleft' ? -1 : 1); st.kbFocus = st.hoverBtn = 'lbt' + tab().key; return true; }
    return false;
  };
}
