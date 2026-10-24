// NeoN+1 engine/leaders.js: the online leaderboard (greglytics, on s3iz.com/glx).
// A finished run (not practice, not multiplayer) sends its depth to two boards: today's (UTC day) and all time.
// Ranked by layers reached; fewer mods breaks a tie. Each device's best counts. Pages opened from a file
// or localhost use the test boards (kept apart on the server), so testing never touches the real ones.
'use strict';
NEON_FILES.push(['engine/leaders.js', 'v13.10']);

const LB_ENDPOINT = 'https://s3iz.com/glx/api/';
const LB_TABS = [{ key: 'day', label: 'TODAY' }, { key: 'all', label: 'ALL TIME' }];
const LB_ROWS = 10;
let lbGl;   // the greglytics client (null if it couldn't start)
function lbClient() {
  if (lbGl === undefined) {
    try { lbGl = window.Greglytics ? Greglytics.init({ endpoint: LB_ENDPOINT, app: 'neon', version: VERSION.slice(1) }) : null; }
    catch (e) { lbGl = null; }
  }
  return lbGl;
}
const lbBoard = (key, t = Date.now()) => key === 'day' ? 'day-' + new Date(t).toISOString().slice(0, 10) : 'all';

// A run's score goes into the save first, then out; sends that fail (offline) go next time.
// Automated runs (the playtest tools drive a headless browser) don't send, unless a test asks (LB_TEST).
function lbSubmit(run, win) {
  try {
    if (run.practice || st.mp || EDITOR || !(run.depth > 0)) return;
    if (navigator.webdriver && !window.LB_TEST) return;
    const prof = profile(), at = Date.now();
    const s = { score: run.depth, tie: run.mods.length, player: prof.name, logo: logoMark(prof.logo),
      data: { style: prof.style, win: !!win, sector: (run.sector || 0) + 1, v: VERSION } };
    save.lbQueue = (save.lbQueue || []).concat(LB_TABS.map(t => Object.assign({ board: lbBoard(t.key, at) }, s))).slice(-10);
    persist();
    lbFlush();
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
    return gl.submitScore(q[0].board, q[0]).then(r => {
      const retry = r && r.error && /slow down|server|database|config/.test(r.error);
      if (retry) return null;
      save.lbQueue.shift(); persist();
      return next();
    }, () => null);
  };
  lbSending = Promise.resolve(next()).finally(() => { lbSending = null; });
  return lbSending;
}

// ---------------- The screen ----------------
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

  // one row, 32 wide: rank, mark, name, layers, mods
  const row = (e, X) => {
    const name = (e.player || '???').slice(0, 17);
    const text = `${String(e.rank).padStart(2)} ${(e.logo || '   ').padEnd(3).slice(0, 3)} ${name.padEnd(17)} ${pad2(e.score).padStart(3)} ${String(e.tie).padStart(3)}`;
    const sty = styleOf((e.data && e.data.style) || 0), mark = lbLum(sty.fg) >= lbLum(sty.bg) ? sty.fg : sty.bg;   // a style's brighter color reads on black
    X({ text, colorAt: i => i < 2 ? C.dim : i < 6 ? mark :i < 24 ? (e.me ? C.accent : C.bright) : i < 28 ? C.money : C.mid,
      bold: !!e.me, bgCol: e.me ? C.accent : null, bgA: 0.15 });
  };

  openPanel('LEADERBOARD', (T, B, X) => {
    const name = lbBoard(tab().key), g = got[name] || { state: 'load' };
    if (!got[name]) load();
    T('L E A D E R B O A R D', C.accent);
    X({ gap: 2, row: LB_TABS.map(t => ({ text: `[ ${t.label} ]`, id: 'lbt' + t.key, sel: t === tab(), onTap: () => show(t.key) })) });
    T(SEP, C.dim);
    T(` #     ${'hacker'.padEnd(17)} lyr mod`, C.dim);
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
    T(gl && gl.dev ? 'test board (opened from a file)' : tab().key === 'day' ? 'today = the UTC day' : 'most layers. fewer mods wins ties.', C.dim);
    T('');
    B('[ BACK ]', 'back', () => swapTo(showTitle));
  }, '> pulling the board.', { full: true });
  st.keyHandler = k => {
    if (k === 'escape') { swapTo(showTitle); return true; }
    if (k === 'arrowleft' || k === 'arrowright') { go(k === 'arrowleft' ? -1 : 1); st.kbFocus = st.hoverBtn = 'lbt' + tab().key; return true; }
    return false;
  };
}
