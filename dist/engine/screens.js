// NeoN+1 engine/screens.js: Screens made of lines: the title, results, reveals.
'use strict';
NEON_FILES.push(['engine/screens.js', 'v14.90']);

// ---------- circuit traces (the title's, and the intro card's wires: engine/intro.js) ----------
// Which way each trace char connects (n e s w). Two cells link when each has a port facing the other.
const TRACE_PORTS = { '-': 'ew', ':': 'ew', '=': 'ew', '<': 'ew', '>': 'ew', '|': 'ns', '+': 'nesw', 'o': 'nesw',
  '─': 'ew', '│': 'ns', '╭': 'es', '╮': 'sw', '╯': 'nw', '╰': 'ne', '┼': 'nesw', '┴': 'new', '┬': 'esw', '├': 'nes', '┤': 'nsw' };
const TRACE_DIRS = [['n', -1, 0, 's'], ['e', 0, 1, 'w'], ['s', 1, 0, 'n'], ['w', 0, -1, 'e']];
// isT(y, x): is this cell a trace. pickStarts(ends, cells): the cells of one connected trace that pulses start from
// (ends: its loose ends). Returns every route from a start to another loose end (cells as y * W + x), and the
// set of cells on a trace that has a start (the others aren't wires: static, a stray '=').
function traceNet(ch, W, H, isT, pickStarts) {
  const links = k => {
    const y = Math.floor(k / W), x = k % W, a = TRACE_PORTS[ch[y][x]];
    return TRACE_DIRS.filter(([d, dy, dx, back]) => {
      const yy = y + dy, xx = x + dx;
      return a.includes(d) && yy >= 0 && yy < H && xx >= 0 && xx < W && isT(yy, xx) && TRACE_PORTS[ch[yy][xx]].includes(back);
    }).map(([, dy, dx]) => (y + dy) * W + x + dx);
  };
  const seen = new Set(), paths = [], on = new Set();
  for (let k = 0; k < W * H; k++) {
    if (seen.has(k) || !isT(Math.floor(k / W), k % W)) continue;
    const cells = [k]; seen.add(k);
    for (let i = 0; i < cells.length; i++) links(cells[i]).forEach(n => { if (!seen.has(n)) { seen.add(n); cells.push(n); } });
    const ends = cells.filter(c => links(c).length === 1), starts = pickStarts(ends, cells);
    if (!starts.length) continue;
    cells.forEach(c => on.add(c));
    const walk = p => {
      if (paths.length > 400) return;   // (a tangle: plenty to pick from already)
      const next = links(p[p.length - 1]).filter(n => !p.includes(n));
      if (!next.length) { if (p.length > 1 && !starts.includes(p[p.length - 1])) paths.push(p); return; }
      next.forEach(n => walk([...p, n]));
    };
    starts.forEach(s => walk([s]));
  }
  return { paths, on };
}
// Pulses: a yellow spark runs along a route, with a short tail. pulses: { list, next } (one per screen).
// Returns the cells they're on now (k -> { j: 0 the spark, 1.. the tail; ch: a noise char for the spark }).
const PULSE = { speed: 14, tail: 3, gapMin: 250, gapMax: 900, max: 4 };
function pulseCells(pulses, paths, now, o = PULSE) {
  if (reduced()) pulses.list.length = 0;
  else if (now >= pulses.next && paths.length) {
    if (pulses.list.length < o.max) pulses.list.push({ path: paths[Math.floor(Math.random() * paths.length)], t0: now, seed: Math.floor(Math.random() * 97) });
    pulses.next = now + rand(o.gapMin, o.gapMax);
  }
  const hot = new Map();
  for (let i = pulses.list.length - 1; i >= 0; i--) {
    const p = pulses.list[i], step = Math.floor((now - p.t0) / 1000 * o.speed);
    if (step - o.tail >= p.path.length) { pulses.list.splice(i, 1); continue; }
    for (let j = 0; j <= o.tail; j++) {
      const n = step - j;
      if (n < 0 || n >= p.path.length) continue;
      const k = p.path[n], had = hot.get(k);
      if (!had || had.j > j) hot.set(k, { j, ch: NOISE[(n * 7 + p.seed) % NOISE.length] });
    }
  }
  return hot;
}
// A trace cell's look with the pulses on it (style: the dev menu's pulse style, below).
function pulseLook(h, trace, style) {
  const tailCols = [C.money, mixHex(C.money, C.accent, 0.5), C.accent, mixHex(trace, C.accent, 0.5)];
  return { ch: h && style !== 'color' && h.j === 0 ? h.ch : null, col: h && style !== 'char' ? tailCols[h.j] : h && h.j === 0 ? C.money : trace, bold: !!h && h.j === 0 };
}

// The title art as a grid (data/title.js): each cell's char and layer (f face, l the name's Ns, w the name's
// e o and +1, b background), plus every route a pulse can take along the traces, from a pad on the head out to
// a loose end.
const TITLE = (() => {
  const H = TITLE_NAME_AT + TITLE_NAME.length, W = TITLE_W;
  const ch = [], cls = [];
  for (let y = 0; y < H; y++) { ch.push(Array(W).fill(' ')); cls.push(Array(W).fill('')); }
  COVER.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === ' ' || x >= W) return;
    const sp = TITLE_FACE_SPAN[y];
    ch[y][x] = c; cls[y][x] = sp && x >= sp[0] && x <= sp[1] ? 'f' : 'b';
  }));
  TITLE_NAME.forEach((s, k) => [...s].forEach((c, x) => {
    if (c === ' ' || x >= W) return;
    const y = TITLE_NAME_AT + k, word = (x >= TITLE_NAME_WORD[0] && x <= TITLE_NAME_WORD[1]) || c === '+' || (c === '1' && s[x - 1] === '+');
    ch[y][x] = c; cls[y][x] = word ? 'w' : 'l';
  }));
  const isT = (y, x) => cls[y][x] === 'b' && !!TRACE_PORTS[ch[y][x]];
  const nearFace = (k, r) => { const y = Math.floor(k / W), x = k % W; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if ((cls[y + dy] || [])[x + dx] === 'f') return true; return false; };
  // Pulses start at the pads touching the head; a trace with none starts from a loose end near it (the chin's stub).
  const pick = ends => { for (const f of [k => ch[Math.floor(k / W)][k % W] === 'o' && nearFace(k, 1), k => nearFace(k, 1), k => nearFace(k, 2)]) { const s = ends.filter(f); if (s.length) return s; } return []; };
  const { paths, on } = traceNet(ch, W, H, isT, pick);
  return { ch, cls, paths, on, H, W };
})();

// How the spark shows (dev menu): 'color' recolors the trace, 'char' swaps the
// character for noise, 'both' does both.
const PULSE_STYLES = ['color', 'char', 'both'];
const titlePulses = { list: [], next: 0 };
// The meter in the face ([====]): how full it is, a step at a time (a level meter's bounce).
const TITLE_METER = [1, 2, 3, 4, 3, 4, 2, 3, 1, 2, 4, 3, 2, 4, 4, 3];

// The title art with a little life: the eye blinks, the circuit eye scans, the meter bounces, a light runs down
// the chip column, the <> flips, the [#] flickers, a scanline drifts down the face, now and then a row glitches
// sideways, the name glitches, and pulses run out along the traces.
function titleArtLines(now) {
  const t = now / 1000, { ch, cls, on, H, W } = TITLE;
  const faceRows = COVER.length;
  const blink = (t % 4.3) < 0.14;
  const scanEye = ['@@', '@ ', ' @', '@@'][Math.floor(t * 3) % 4];
  const meter = TITLE_METER[Math.floor(t * 6) % TITLE_METER.length];
  const [chipX, chipY, chipN] = TITLE_CHIP, chipLit = chipY + Math.floor(t * 4) % (chipN + 3);   // (3 dark steps between runs)
  const flip = (t % 2.3) < 0.3, flicker = (t % 3.7) < 0.12;
  const scanRow = Math.floor(now / 140) % (faceRows + 6);
  const glitchRow = (t % 3.1) < 0.12 ? Math.floor(t * 7) % faceRows : -1;
  const style = st.pulseStyle || 'color';
  const hot = pulseCells(titlePulses, TITLE.paths, now);
  const trace = mixHex(C.bg, C.accent, 0.4);
  return ch.map((rowCh, y) => {
    const chars = rowCh.slice(), cols = [], bolds = [];
    const lit = y === scanRow, nameGlitch = y >= TITLE_NAME_AT && ((t + (y - TITLE_NAME_AT) * 0.9) % 4.5) < 0.09;
    for (let x = 0; x < W; x++) {
      const c = cls[y][x];
      if (c === 'f') {
        const chip = y === chipLit && (x === chipX || x === chipX + 1);
        if (chip && chars[x] === 'X') chars[x] = '+';
        cols.push(lit || chip ? C.bright : x < TITLE_MID ? C.text : x === TITLE_MID ? C.dim : C.accent); bolds.push(lit || chip);
      } else if (c === 'l' || c === 'w') {
        if (nameGlitch && Math.random() < 0.3) chars[x] = noiseCh();
        cols.push(c === 'w' ? C.bright : C.accent); bolds.push(true);
      } else if (c === 'b' && on.has(y * W + x)) {
        const p = pulseLook(hot.get(y * W + x), trace, style);
        if (p.ch) chars[x] = p.ch;
        cols.push(p.col); bolds.push(p.bold);
      } else { cols.push(C.dim); bolds.push(false); }
    }
    let text = chars.join('');
    if (blink) text = text.replace('{o}', '{-}');
    text = text.replace('[@@]', `[${scanEye}]`).replace('[====]', `[${'='.repeat(meter).padEnd(4, '-')}]`);
    if (flip && y < faceRows) text = text.replace('|<>|', '|><|');
    if (flicker) text = text.replace('[#]', `[${noiseCh()}]`);
    if (y === glitchRow) {
      text = (' ' + text.slice(0, -1)).replace(/[^ ]/g, c => Math.random() < 0.25 ? noiseCh() : c);
      cols.unshift(cols[0]); bolds.unshift(false);
    }
    return { text, colorAt: i => cols[i], boldAt: i => bolds[i] };
  });
}

function titleLines(now) {
  const lines = [];
  const T = (text, col = C.text, extra = {}) => lines.push(Object.assign({ text, col }, extra));
  lines.push(...titleArtLines(now));
  T('network intrusion // prototype', C.dim);
  if (st.fileWarn) { T(st.fileWarn, C.danger); T('reload, or upload the files again.', C.danger); }   // version stamps (boot)
  if (st.newVersion) lines.push({ text: `[ ${st.newVersion} is out: UPDATE ]`, id: 'update', onTap: updateGame, col: C.accent });   // boot.js
  T('');
  const saved = st.savedRun;
  if (saved) lines.push({ box: true, text: 'C O N T I N U E', sub: `- sector ${(saved.run.sector || 0) + 1}  layer ${pad2(saved.run.depth)} -`, id: 'start', onTap: resumeRun, minW: 26 });
  else lines.push({ box: true, text: 'J A C K   I N', sub: '- start a run -', id: 'start', onTap: jackIn, minW: 26 });
  T('');   // (the training: NEWB on a first run, and HOW TO PLAY)
  lines.push({ row: [
    { text: '[ HOW TO PLAY ]', id: 'help', onTap: () => swapTo(openHelp) },
    { text: '[ CODEX ]', id: 'codex', onTap: () => swapTo(openCodex) },
  ] });
  lines.push({ row: [
    { text: '[ SETTINGS ]', id: 'settings', onTap: () => swapTo(openSettings) },
    { text: '[ MULTIPLAYER ]', id: 'mp', onTap: () => swapTo(openMultiplayer) },
  ] });
  lines.push({ row: [
    { text: '[ THE BOARD ]' + (boardNew() ? '*' : ''), id: 'board', onTap: () => swapTo(() => openBoard()) },   // (a * when a feat is new)
    { text: '[ LEADERBOARD ]', id: 'leaders', onTap: () => swapTo(openLeaders) },
  ] });
  if (saved) lines.push({ row: [{ text: st.newArmed ? '[ DROP SAVE? ]' : '[ NEW RUN ]', id: 'newrun', onTap: newOverSave }] });
  T('');
  { const prof = profile(); lines.push({ text: `[ ${logoMark(prof.logo)} ${prof.name} ]${save.newTitle ? '*' : ''}`, id: 'profile', style: styleOf(prof.style), onTap: () => swapTo(() => openBoard('you')) }); }   // THE BOARD's YOU tab (a * for a new title)
  T(`best ${pad2(save.best)}  runs ${save.runs}  wins ${save.wins}  rep ${save.rep || 0}`, C.mid);
  { const b = lbTitleLine(); T(b ? `board: ${b}` : '', C.money); }   // engine/leaders.js (its row is kept, so nothing jumps)
  // Seed: tap to roll a new one; [SHARE] sends its link (engine/multiplayer.js shareSeed).
  { const row = [
      { text: 'seed' },
      { text: `[${st.seed.slice(0, 10)}]`, id: 'seed', onTap: rerollSeed },
      ...(questSeed(st.seed) ? [{ text: 'quest', col: G0DF_BLUE }] : st.seeded ? [{ text: 'replay', col: C.mid }] : []),   // (a chosen seed: the seed boards)
      { text: seedShared() ? '[COPIED]' : '[SHARE]', id: 'shareseed', onTap: () => shareSeed(st.seed) },
      ...(replaysOpen() ? [{ text: '[REPLAYS]', id: 'replays', onTap: () => swapTo(openReplays) }] : []),   // (beat G0D: POPS's log, engine/menus.js)
    ];
    const w = () => row.reduce((a, b) => a + b.text.length, 0) + row.length - 1;
    if (w() > L.wc) row.shift();   // too wide for a phone (a long seed, the tag and [REPLAYS]): the 'seed' label goes
    lines.push({ gap: 1, row }); }
  return lines;
}

// After the collapse, the screen is empty. CONNECTION TERMINATED types in at the
// middle and sits a second; then the results come in one line at a time below it,
// pushing the block up until it's the full, centered results screen.
const REVEAL = { type: 35, hold: 1000, gap: 170, mapGap: 45 }; // ms; map rows come in faster
function buildOverReveal(ctx, now) {
  const all = overLines().flatMap(ln => ln.mapView ? Array.from({ length: ln.h }, (_, k) => Object.assign({}, ln, { h: 1, k, viewH: ln.h })) : [ln]);
  buildReveal(ctx, now, st.overReveal, all);
}
// Show `all` building up: line 0 types in at the middle and holds, then the rest come
// in one at a time below it, the block gliding up to stay centered. Lines with an
// offer `reveal` index wait for their pop (st.panelT0 is set from the first one).
// A rival breach (rv.rival, the user 2026-10-28): the logo rows come in as the RIVAL's; once they're all in, the reveal
// holds: DEFEATED lands across them a letter at a time (the rival's colors inverted), your logo replaces theirs a row at a time, the stamp lifts, and
// the rest of the screen carries on building in. (Times from when the last logo row shows.)
// (the letters land every 70ms: DEFEATED is in at +0.96s; a 0.2s beat, then your logo comes in over it, row by row)
const RIVAL_REVEAL = { stamp: 400, letter: 70, swap: 1160, row: 150, hold: 2900 };
// THE LOGO GOES (a boss win, the user 2026-11-05: the rewards screen was too tall): `wait` ms after the line under the
// logo ("breached ...") is in, its art rows go one at a time, bottom first, each glitching for `glitch` ms; the rest
// glides up. The name line stays. (rv.logoOut, set by openChoice; its lines carry logoArt.)
const LOGO_OUT = { wait: 300, row: 110, glitch: 90 };
function buildReveal(ctx, now, rv, all) {
  const title = all[0].text;
  let logoAt = null;
  // rv.pre: lines already on screen (FIRST BREACH's header): they show at once and the rest build in under them
  const pre = rv.pre || 0;
  const typed = pre ? title.length : clamp(Math.floor((now - rv.t0) / REVEAL.type), 0, title.length);
  // when each line shows up (blank lines come with the next one)
  let k = 1, t = pre ? rv.t0 : rv.t0 + title.length * REVEAL.type + REVEAL.hold, firstPop = null, outAt = null;
  for (let i = 1; i < all.length; i++) {
    const underLogo = all[i - 1].logoRow != null && all[i].logoRow == null;   // the line under the logo: once it's in, the logo goes
    if (i < pre) { k = i + 1; if (underLogo) outAt = rv.t0; continue; }
    if (all[i].reveal != null) {
      if (firstPop == null) firstPop = rv.firstPop || (rv.firstPop = t);
      t = Math.max(t, firstPop + all[i].reveal * CONFIG.revealGap);
    }
    if (now < t) break;
    k = i + 1;
    if (underLogo) outAt = t;
    if (rv.rival && all[i].logoRow != null && !(all[i + 1] && all[i + 1].logoRow != null)) { logoAt = t; t += RIVAL_REVEAL.hold; }   // the rival's moment
    if (all[i].mapView) t += REVEAL.mapGap;
    else if (all[i].text || all[i].box || all[i].row || all[i].list) t += REVEAL.gap;
  }
  if (rv.firstPop && st.panelT0 === Infinity) st.panelT0 = rv.firstPop;
  if (now < rv.t0) k = 0;
  rv.total = all.length; rv.vis = k;   // (the leaderboard fanfare waits for the last line)
  let vis = all.slice(0, k);
  if (rv.rival) {   // rows not swapped yet show the rival's logo
    const sw = logoAt == null ? 0 : Math.max(0, Math.floor((now - logoAt - RIVAL_REVEAL.swap) / RIVAL_REVEAL.row) + 1);
    if (ctx.collectHits && sw > (rv.sw || 0) && logoAt != null && now - logoAt >= RIVAL_REVEAL.swap) { rv.sw = sw; Sound.tick(); }
    vis = vis.map(ln => ln.logoRow != null && ln.rivalRow && ln.logoRow >= sw ? Object.assign({}, ln, ln.rivalRow) : ln);
  }
  if (rv.logoOut && outAt != null) {   // THE LOGO GOES, bottom row first (the lines stay in `all`, so the timing below doesn't move)
    const arts = vis.filter(ln => ln.logoArt), since = now - outAt - LOGO_OUT.wait;
    const n = clamp(Math.floor(since / LOGO_OUT.row) + 1, 0, arts.length), next = arts[arts.length - n - 1];
    const gone = new Set(arts.slice(arts.length - n));
    const dying = next && n < arts.length && since > -LOGO_OUT.glitch && (n * LOGO_OUT.row - since) < LOGO_OUT.glitch ? next : null;
    vis = vis.filter(ln => !gone.has(ln)).map(ln => ln !== dying ? ln : Object.assign({}, ln, {
      text: [...ln.text].map((ch, i) => ch === ' ' ? ' ' : FX.pick(FX_GLITCH, FX.hash(i, ln.logoRow, FX.step(now, 40)))).join('') }));
    if (ctx.collectHits && n > (rv.outN || 0)) { rv.outN = n; Sound.tick(); }
  }
  if (vis.length && typed < title.length) {
    const cursor = Math.floor(now / 250) % 2 ? '_' : ' ';
    vis[0] = Object.assign({}, vis[0], { text: (title.slice(0, typed) + cursor).padEnd(title.length) });
  }
  // (lineRows: engine/textboard.js, the rule buildTextBoard draws by. A copy here missed the initials' 3-row letters, so
  // the death screen sat a row low and UPLOAD ran onto the footer.)
  const H = vis.reduce((a, ln) => a + lineRows(ln), 0);
  // glide toward the centered spot (so new lines push the block up smoothly);
  // 'board' centers like a normal panel, so the finished screen lines up exactly
  const target = rv.whole ? Math.max(0, Math.floor((L.hc - H) / 2)) : rv.center === 'board' ? BOARD_Y + Math.max(0, Math.floor((L.gh - H) / 2)) : (L.hc - Math.max(1, H)) / 2;
  if (rv.y == null) rv.y = target;
  else rv.y += (target - rv.y) * Math.min(1, (now - rv.lt) / 1000 * 9);
  rv.lt = now;
  if (vis.length) buildTextBoard(ctx, vis, { top: rv.y, h: H });
  if (rv.rival && logoAt != null && now - logoAt >= RIVAL_REVEAL.stamp) {   // DEFEATED, across the logo's middle (your rows cover it as they come in)
    if (ctx.collectHits && !rv.stamped) { rv.stamped = true; Sound.hkStamp(); shake(4, 0.25); }
    const first = all.findIndex(ln => ln.logoRow != null);
    const sw = Math.max(0, Math.floor((now - logoAt - RIVAL_REVEAL.swap) / RIVAL_REVEAL.row) + 1) * (now - logoAt >= RIVAL_REVEAL.swap ? 1 : 0);
    const n = hkStamp(ctx, rv.y + first + 2, rv.rival, all[first].text.length, now - logoAt - RIVAL_REVEAL.stamp, RIVAL_REVEAL.letter, r => 2 + r < sw, rv.escaped ? 'ESCAPED' : 'DEFEATED');
    if (ctx.collectHits && n > (rv.letters || 0)) { rv.letters = n; if (n > 1) Sound.tick(); }   // a tick a letter
  }
  if (ctx.collectHits) {
    if (typed > rv.typed) { rv.typed = typed; Sound.tick(); }
    if (k > rv.shown) {
      for (let i = rv.shown; i < k; i++) if (all[i] && all[i].onShow) all[i].onShow();   // a line's moment (FIRST BREACH's fanfare)
      rv.shown = k;
      const ln = all[k - 1];
      if (k > 1 && ln.mapView) Sound.tick();
      else if (k > 1 && ln.reveal != null) { /* its offer pop plays */ }
      else if (k > 1 && (ln.text || ln.box || ln.row || ln.list)) rv.sound === 'climb' ? Sound.climb(rv.climbs = (rv.climbs || 0) + 1) : Sound.ui();
    }
    // all in and settled: hand back to the normal screen (header, HUD, tray return)
    if (k === all.length && now > t + 350 && Math.abs(rv.y - target) < 0.05 && rv.center === 'board' && !rv.done && !rv.hold) {
      rv.done = true; Sound.ui();
      if (rv.msg) setMsg(rv.msg.text, rv.msg.col);   // the header's line types in as it comes back
    }
  }
}

function overLines() {
  const lines = [];
  const T = (text, col = C.text) => lines.push({ text, col });
  const r = st.result;
  const statLine = txt => lines.push({ text: txt, colorAt: i => /\d/.test(txt[i]) ? C.bright : C.mid });
  if (r.sector) {
    // Sector clear: a ROOT picture (one of data/art/root.js, picked at random), the stats, the corps you breached in
    // this sector, then on to the uplink (push on or cash out: the REP lines are there now).
    { const art = (ART_ROOT[r.root] || Object.values(ART_ROOT)[0]).art, H = ROOT_ART_H;
      const w = Math.max(...art.map(l => l.length)), top = Math.floor((H - art.length) / 2);
      for (let i = 0; i < H; i++) { const l = art[i - top]; lines.push({ text: l == null ? '' : l.padEnd(w), col: C.money, bold: true }); } }
    T('');
    lines.push({ text: `SECTOR ${r.n} CLEARED`, col: C.accent, bold: true });
    T(r.skipped ? `${r.boss} skipped. no reward.` : `${r.boss} is yours.`, r.skipped ? C.dangerDim : C.text);
    { const prof = profile(), sty = styleOf(prof.style);
      lines.push({ text: ` ${logoMark(prof.logo)} ${prof.name} `, col: sty.fg, bgCol: sty.bg, bold: true }); }
    // a rival on the boss: did you beat them, or did they take the last node? (on the blank line, so the screen's rows don't grow)
    if (r.foe && HACKERS[r.foe.id]) T(r.foe.escaped ? `${hkName(r.foe.id).toLowerCase()} escaped. no win.` : `${hkName(r.foe.id).toLowerCase()} beaten.`, r.foe.escaped ? C.danger : C.rep);
    else T('');
    statLine(`layers ${pad2(r.depth)}   corps ${r.corps}   cr ${r.earned}`);
    { const marks = (r.breached || []).map(k => corpCode(corpDef(k))).join(' '), txt = `breached ${marks || 'none'}`;
      lines.push({ text: txt, colorAt: i => i < 9 ? C.mid : marks ? C.accent : C.dim }); }
    if (r.practice) T(r.quest ? 'quest run: no REP' : 'practice run: no REP', C.dangerDim);
    T('');
    // (the bottom of HAD3S: no UPLINK, openUplink cashes you out, so the button says so)
    const bottom = st.run && st.run.quest === 'had3s' && st.run.sector >= HAD3S_SECTORS - 1;
    if (bottom) lines.push({ box: true, text: 'J A C K   O U T', sub: '- nowhere deeper to go -', id: 'push', onTap: () => swapTo(openUplink), minW: 30 });
    else lines.push({ box: true, text: 'T H E   U P L I N K', sub: r.broken ? '- something is wrong -' : '- push on or cash out -', id: 'push', onTap: () => swapTo(openUplink), minW: 30 });
    return lines;
  }
  if (r.win) {
    lines.push({ text: 'JACKED OUT CLEAN', col: C.accent, bold: true });
    { const prof = profile(), sty = styleOf(prof.style);
      lines.push({ text: ` ${logoMark(prof.logo)} ${prof.name} `, col: sty.fg, bgCol: sty.bg, bold: true }); }
    T(`${r.sectors} sector${r.sectors === 1 ? '' : 's'} cleared`, C.text);
    T('');
  } else {
  T('CONNECTION TERMINATED', C.danger);
  { const prof = profile(), sty = styleOf(prof.style);   // your persona, in your colors
    lines.push({ text: ` ${logoMark(prof.logo)} ${prof.name} `, col: sty.fg, bgCol: sty.bg, bold: true }); }
  if (r.diedAt) T(`traced in ${r.diedAt}`, C.dangerDim);
  T('');
  }
  statLine(`layers ${pad2(r.depth)}   corps ${r.corps}   cr ${r.earned}`);
  if (!r.practice) {
    if (r.rep) lines.push({ text: `+${r.rep} REP banked   ${save.rep} REP`, col: C.money, bold: !!r.win });
    else T(`REP lost: ${r.repWorth} (cash out to bank it)`, C.dim);
  }
  if (r.quest === 'had3s' && save.quests && save.quests.pops && save.quests.pops.step === 'd0g') lines.push({ text: `d0g: ${Math.min(save.quests.pops.d0g || 0, d0gWinsNeeded())} / ${d0gWinsNeeded()} for POPS`, col: C.rep, bold: true });   // HAD3S
  if (r.newBest) T('** new best **', C.accent);
  else T(`best ${pad2(save.best)}   seed ${r.seed}`, C.mid);
  if (r.practice) T(r.quest ? 'quest run: not scored' : 'practice run: not scored', C.dangerDim);
  // corps breached, by code
  // (a long run's list doesn't fit: it shows a page at a time and cycles, with the page count)
  { const codes = r.breached.map(k => corpCode(corpDef(k))), per = Math.max(1, Math.floor((L.wc - 9 - 7) / 4));
    const pages = Math.max(1, Math.ceil(codes.length / per)), pg = pages > 1 ? Math.floor(performance.now() / 2500) % pages : 0;
    const marks = codes.slice(pg * per, pg * per + per).join(' ');
    const txt = `breached ${marks || 'none'}` + (pages > 1 ? `  ${pg + 1}/${pages}` : '');
    lines.push({ text: txt, colorAt: i => i < 9 ? C.mid : i >= 9 + marks.length ? C.dim : marks ? C.accent : C.dim }); }
  T('');
  // mods (drawn like the tray) and items: they scroll together with the map below them (the user, 2026-10-22)
  const extras = [];
  if (r.mods.length) {
    for (let i = 0; i < r.mods.length; i += 5) extras.push({ gap: 2, row: r.mods.slice(i, i + 5).map(k => ({ badge: k, plain: true, tier: r.modTier[k] || 0 })) });
  } else extras.push({ text: 'no mods: a naked run', col: C.dim });
  extras.push(r.items.length ? { gap: 1, row: r.items.map(x => ({ text: itemLabel(x), chip: itemView(x.key, x.tier).rarity })) } : { text: 'no gear', col: C.dim });
  extras.push({ text: '' });
  // the bottom: the leaderboard block (ranks, initials, UPLOAD) until you upload, then the buttons
  const lb = lbOverLines(), lbOpen = lb && !(st.lbPost && st.lbPost.uploaded);
  const bottom = [...(lb || []), ...(lbOpen ? [] : r.quest === 'had3s' ? [   // HAD3S: running it again is the big one
    { box: true, text: 'R U N   H A D 3 S   A G A I N', id: 'had3s', onTap: runHad3s, minW: 30 },
    { text: '[ NEW RUN ]', id: 'new', onTap: newRun },
    { text: '[ BACK ]', id: 'title', onTap: () => swapTo(showTitle) },
  ] : r.heaven && !r.win ? [   // died in H3AV3N: retrying heaven is the big one
    { box: true, text: 'R E T R Y   H 3 A V 3 N', id: 'retryh', onTap: retryHeaven, minW: 28 },
    { text: '[ NEW RUN ]', id: 'new', onTap: newRun },
    { text: '[ BACK ]', id: 'title', onTap: () => swapTo(showTitle) },
  ] : [
    { box: true, text: 'N E W   R U N', id: 'new', onTap: newRun, minW: 24 },
    { row: [   // (one row: the screen's rows are counted below)
      { text: '[ RETRY SEED ]', id: 'retry', onTap: retry },
      { text: seedShared() ? '[ COPIED ]' : '[ SHARE ]', id: 'shareseed', onTap: () => shareSeed(r.seed) },
    ] },
    { text: '[ BACK ]', id: 'title', onTap: () => swapTo(showTitle) },
  ])];
  // the scrolling area: the mods and items, then the map with the path you took
  const rest = 1 + bottom.reduce((a, ln) => a + lineRows(ln), 0);   // gap + the bottom (lineRows: engine/textboard.js, as it draws them)
  const used = lines.reduce((a, ln) => a + lineRows(ln), 0);
  const E = extras.length, total = E + mapRows(r.map);
  const view = clamp(L.hc - 2 - used - rest, 5, total);
  const om = st.overMap || (st.overMap = { top: null });
  const atRow = E + mapRowOf(r.map[r.at], r.map);
  if (om.top == null) om.top = atRow - view + 2;   // as high as it goes with where the run ended in view: the mods first
  // the scroll area every list uses (engine/codex.js): a "more" row at the top / bottom when there's more that way
  om.max = maxTop(total, view);
  om.top = clamp(om.top, 0, om.max);
  om.view = view; om.total = total;
  const w = listWindow(om.top, total, view);
  const shown = extras.slice(om.top, om.top + w.shown);
  const mapH = w.shown - shown.length;
  if (w.hasUp) lines.push({ text: w.canUp ? '[ ^ ^ ^  more  ^ ^ ^ ]' : '', invert: true, id: 'omup', onTap: () => st.scroll && st.scroll(-1) });
  lines.push(...shown);
  if (mapH) lines.push({ mapView: true, h: mapH, top: Math.max(0, om.top - E), r, noArrows: true });
  if (w.hasDown) lines.push({ text: w.canDown ? '[ v v v  more  v v v ]' : '', invert: true, id: 'omdn', onTap: () => st.scroll && st.scroll(1) });
  T('');
  lines.push(...bottom);
  return lines;
}

// "No room": pick one of yours to replace with the new one (or keep what you have).
// st.swap = { kind: 'mod' | 'item', key, tier, onDone }
function openSwap(kind, key, tier, onDone) { st.swap = { kind, key, tier, onDone }; Sound.deny(); }
// Taking `key` clashes with a mod you own (same rule slot): replace it, or keep what you have.
// A locked mod can't be replaced.
function openClash(key, tier, onDone) { st.swap = { kind: 'clash', key, tier, old: clashWith(key), onDone }; Sound.deny(); }
function swapLines() {
  const sw = st.swap, run = st.run, lines = [];
  const T = (text, col = C.text) => lines.push({ text, col });
  const done = () => { const f = sw.onDone; st.swap = null; if (f) f(); };
  if (sw.kind === 'clash') {
    const v = modView(sw.key, sw.tier), o = modView(sw.old), locked = modLocked(sw.old);
    T('MODS CLASH', C.danger);
    T('');
    lines.push({ badge: sw.key, badgeTier: sw.tier });
    for (const ln of wrapText(`${v.name.toLowerCase()} ${SLOT_TEXT[MODS[sw.key].slot] || 'clashes'}.`, 34)) T(ln, C.text);
    T('');
    lines.push({ badge: sw.old, badgeTier: o.tier });
    if (locked) {
      T(`${o.name.toLowerCase()} is locked in.`, C.dangerDim);
      T("you can't take this one.", C.dangerDim);
      T('');
      lines.push({ text: '[ OK ]', id: 'swkeep', onTap: () => { st.swap = null; Sound.ui(); } });
      return lines;
    }
    T(`it will replace ${o.name.toLowerCase()}.`, C.dangerDim);
    T('');
    lines.push({ text: '[ REPLACE IT ]', id: 'swclash', onTap: () => {
      removeMod(sw.old); addMod(sw.key, sw.tier); Sound.buy();
      setMsg(`> ${o.name.toLowerCase()} out, ${v.name.toLowerCase()} in.`, C.accent); done();
    } });
    lines.push({ text: '[ KEEP WHAT I HAVE ]', id: 'swkeep', onTap: () => { st.swap = null; Sound.ui(); } });
    return lines;
  }
  // Two steps (a mis-tap on a phone used to throw away the wrong one): tap one of yours to pick it, which
  // shows what it does; then the SWAP button does it. sw.sel = the picked one's index.
  T(sw.kind === 'mod' ? 'MOD SLOTS FULL' : 'GEAR SLOTS FULL', C.danger);
  T('');
  const pick = i => () => { if (sw.sel !== i) { sw.sel = i; Sound.tick(); } };
  const DESC_ROWS = 2;
  const desc = str => { const dl = wrapText(str || '', 34); for (let r = 0; r < DESC_ROWS; r++) T(dl[r] || '', C.text); };
  let go = null, outName = '';
  if (sw.kind === 'mod') {
    const v = modView(sw.key, sw.tier);
    T('to take', C.mid);
    lines.push({ badge: sw.key, badgeTier: sw.tier });
    T(`pick one of your ${modSlots()} mods to replace:`, C.mid);
    run.mods.forEach((k, i) => {
      const o = modView(k);
      if (modLocked(k)) {   // locked in: can't be swapped out
        lines.push({ list: true, id: 'sw' + i, badge: k, badgeTier: o.tier, name: o.name, col: C.dim, faded: true, right: 'LOCKED', rightCol: C.dangerDim,
          onTap: () => { Sound.deny(); setMsg(`> ${o.name.toLowerCase()} is locked in.`, C.dangerDim); } });
        return;
      }
      lines.push({ list: true, id: 'sw' + i, badge: k, badgeTier: o.tier, name: o.name, col: C.bright, right: tierLabel(o), rightCol: C.mid, rightChips: true,
        sel: sw.sel === i, onTap: pick(i) });
    });
    T(SEP, C.dim);
    const k = sw.sel != null && run.mods[sw.sel], o = k && !modLocked(k) ? modView(k) : null;
    if (o) {
      lines.push({ badge: k, badgeTier: o.tier });
      desc(o.tip || o.desc);
      outName = o.name.toLowerCase();
      go = () => { removeMod(k); addMod(sw.key, sw.tier); Sound.buy(); setMsg(`> swapped ${outName} for ${v.name.toLowerCase()}.`, C.accent); done(); };
    } else { T('tap one of yours to see it.', C.dim); desc(''); }
  } else {
    const v = itemView(sw.key, sw.tier);
    T('to take', C.mid);
    lines.push({ gearHead: sw.key, gearTier: sw.tier, text: v.name });
    T('pick the gear to replace:', C.mid);
    run.items.forEach((s, i) => {
      const o = itemView(s.key, s.tier);
      lines.push({ list: true, id: 'sw' + i, name: o.name + (s.n > 1 ? ' x' + s.n : ''), gear: s.key, gearTier: s.tier, right: s.n > 1 ? `all ${s.n}` : 'gear', rightCol: C.mid,
        sel: sw.sel === i, onTap: pick(i) });
    });
    T(SEP, C.dim);
    const s = sw.sel != null && run.items[sw.sel], o = s ? itemView(s.key, s.tier) : null;
    if (o) {
      lines.push({ text: itemLabel(s), chip: o.rarity, bold: true });
      desc(o.tip || o.desc);
      outName = o.name.toLowerCase();
      go = () => { run.items.splice(sw.sel, 1); addItem(sw.key, sw.tier); Sound.buy(); setMsg(`> swapped ${outName} for ${v.name.toLowerCase()}.`, C.accent); done(); };
    } else { T('tap one of yours to see it.', C.dim); desc(''); }
  }
  lines.push({ box: true, text: 'S W A P', sub: go ? `- ${outName} is gone -`.slice(0, 26) : '- pick one above -', id: 'swgo', minW: 22,
    disabled: !go, onTap: () => { if (go) go(); else Sound.deny(); } });
  lines.push({ text: '[ KEEP WHAT I HAVE ]', id: 'swkeep', onTap: () => { st.swap = null; Sound.ui(); } });
  return lines;
}

function panelLines() {
  const now = performance.now();
  if (st.mode === 'panel' && st.swap) return swapLines();
  if (st.mode === 'title') return titleLines(now);
  if (st.mode === 'over' && st.result) return overLines();
  const lines = [];
  const T = (text, col = C.text) => lines.push({ text, col });
  const B = (text, id, onTap, disabled = false) => lines.push({ text, id, onTap, disabled });
  if (st.mode === 'panel' && st.panelFn) st.panelFn(T, B, ln => lines.push(ln), lines);
  return lines;
}
