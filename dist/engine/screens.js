// NeoN+1 engine/screens.js: Screens made of lines: the title, results, reveals.
'use strict';
NEON_FILES.push(['engine/screens.js', 'v13.81']);

// The title art as a grid: each cell's char and layer (f face, l logo letters,
// w logo words, b background), plus every route a pulse can take along the traces,
// from a pad on the head out to a loose end.
const TITLE = (() => {
  const H = TITLE_BG.length, W = TITLE_W;
  const ch = [], cls = [];
  for (let y = 0; y < H; y++) { ch.push(Array(W).fill(' ')); cls.push(Array(W).fill('')); }
  COVER.forEach(([l, m, r], y) => [...(l.padEnd(16) + m + r.padEnd(14))].forEach((c, x) => { if (c !== ' ') { ch[y][x] = c; cls[y][x] = 'f'; } }));
  const top = H - TITLE_LOGO.length;
  TITLE_LOGO.forEach((s, k) => [...s].forEach((c, x) => {
    const y = top + k;
    if (c === '%') { ch[y][x] = ' '; cls[y][x] = ''; }
    else if (c !== ' ') { ch[y][x] = c; cls[y][x] = (y === top + 7 && x >= 13) || x >= 20 ? 'w' : 'l'; }   // words: the name row and the build number
  }));
  TITLE_BG.forEach((s, y) => [...s].forEach((c, x) => { if (c !== ' ' && !cls[y][x]) { ch[y][x] = c; cls[y][x] = 'b'; } }));
  // Trace cells: '-' links sideways, '|' up and down, '+' and 'o' every way.
  const isT = (y, x) => y >= 0 && y < H && x >= 0 && x < W && cls[y][x] === 'b' && '-|+o'.includes(ch[y][x]);
  const links = (y, x) => [[0, 1], [0, -1], [1, 0], [-1, 0]].filter(([dy, dx]) => {
    if (!isT(y + dy, x + dx)) return false;
    const side = dy === 0, a = ch[y][x], b = ch[y + dy][x + dx];
    return !((a === '-' || b === '-') && !side) && !((a === '|' || b === '|') && side);
  }).map(([dy, dx]) => [y + dy, x + dx]);
  const touchesFace = (y, x) => [-1, 0, 1].some(dy => [-1, 0, 1].some(dx => (cls[y + dy] || [])[x + dx] === 'f'));
  const starts = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    if (isT(y, x) && ch[y][x] === 'o' && links(y, x).length === 1 && touchesFace(y, x)) starts.push(y * W + x);
  const paths = [];
  const walk = p => {
    const last = p[p.length - 1], next = links(Math.floor(last / W), last % W).map(([y, x]) => y * W + x).filter(k => !p.includes(k));
    if (!next.length) { if (p.length > 1 && !starts.includes(last)) paths.push(p); return; }
    next.forEach(k => walk([...p, k]));
  };
  starts.forEach(s => walk([s]));
  return { ch, cls, paths, H, W };
})();

// Pulses: a yellow spark runs out from the head along a trace, with a short tail.
// How the spark shows (dev menu): 'color' recolors the trace, 'char' swaps the
// character for noise, 'both' does both.
const PULSE = { speed: 14, tail: 3, gapMin: 250, gapMax: 900, max: 4 };
const PULSE_STYLES = ['color', 'char', 'both'];
const titlePulses = [];
let pulseNext = 0;

// The title art with a little life: the eye blinks, the circuit eye scans, a scanline
// drifts down the face, now and then a row glitches sideways, the logo glitches, and
// pulses run out along the traces.
function titleArtLines(now) {
  const t = now / 1000, { ch, cls, H, W } = TITLE;
  const blink = (t % 4.3) < 0.14;
  const scanEye = ['@@', '@ ', ' @', '@@'][Math.floor(t * 3) % 4];
  const scanRow = Math.floor(now / 140) % (COVER.length + 6);
  const glitchRow = (t % 3.1) < 0.12 ? Math.floor(t * 7) % COVER.length : -1;
  const style = st.pulseStyle || 'color';

  // Spawn and age the pulses; mark the cells they're on (0 = the spark, 1.. = tail).
  if (reduced()) titlePulses.length = 0;
  else if (now >= pulseNext && TITLE.paths.length) {
    if (titlePulses.length < PULSE.max) titlePulses.push({ path: TITLE.paths[Math.floor(Math.random() * TITLE.paths.length)], t0: now, seed: Math.floor(Math.random() * 97) });
    pulseNext = now + rand(PULSE.gapMin, PULSE.gapMax);
  }
  const hot = new Map();
  for (let i = titlePulses.length - 1; i >= 0; i--) {
    const p = titlePulses[i], step = Math.floor((now - p.t0) / 1000 * PULSE.speed);
    if (step - PULSE.tail >= p.path.length) { titlePulses.splice(i, 1); continue; }
    for (let j = 0; j <= PULSE.tail; j++) {
      const n = step - j;
      if (n < 0 || n >= p.path.length) continue;
      const k = p.path[n], had = hot.get(k);
      if (!had || had.j > j) hot.set(k, { j, ch: NOISE[(n * 7 + p.seed) % NOISE.length] });
    }
  }

  const trace = mixHex(C.bg, C.accent, 0.4);
  const tailCols = [C.money, mixHex(C.money, C.accent, 0.5), C.accent, mixHex(trace, C.accent, 0.5)];
  const logoTop = H - TITLE_LOGO.length;
  return ch.map((rowCh, y) => {
    const chars = rowCh.slice(), cols = [], bolds = [];
    const lit = y === scanRow, logoGlitch = y >= logoTop && ((t + (y - logoTop) * 0.9) % 4.5) < 0.09;
    for (let x = 0; x < W; x++) {
      const c = cls[y][x];
      if (c === 'f') { cols.push(lit ? C.bright : x < 16 ? C.text : x === 16 ? C.dim : C.accent); bolds.push(lit); }
      else if (c === 'l' || c === 'w') {
        if (logoGlitch && Math.random() < 0.3) chars[x] = noiseCh();
        cols.push(c === 'w' ? C.bright : C.accent); bolds.push(true);
      } else if (c === 'b' && '-|+o'.includes(ch[y][x])) {
        const h = hot.get(y * W + x);
        if (h && style !== 'color' && h.j === 0) chars[x] = h.ch;
        cols.push(h && style !== 'char' ? tailCols[h.j] : h && h.j === 0 ? C.money : trace);
        bolds.push(!!h && h.j === 0);
      } else { cols.push(C.dim); bolds.push(false); }
    }
    let text = chars.join('');
    if (y === 5 && blink) text = text.replace('(o)', '(-)');
    if (y === 4) text = text.replace('@@', scanEye);
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
  // Seed: tap to roll a new one.
  lines.push({ gap: 1, row: [
    { text: 'seed' },
    { text: `[${st.seed.slice(0, 10)}]`, id: 'seed', onTap: rerollSeed },
    ...(st.practice ? [{ text: 'practice', col: C.dangerDim }] : []),
  ] });
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
function buildReveal(ctx, now, rv, all) {
  const title = all[0].text;
  let logoAt = null;
  // rv.pre: lines already on screen (FIRST BREACH's header): they show at once and the rest build in under them
  const pre = rv.pre || 0;
  const typed = pre ? title.length : clamp(Math.floor((now - rv.t0) / REVEAL.type), 0, title.length);
  // when each line shows up (blank lines come with the next one)
  let k = 1, t = pre ? rv.t0 : rv.t0 + title.length * REVEAL.type + REVEAL.hold, firstPop = null;
  for (let i = 1; i < all.length; i++) {
    if (i < pre) { k = i + 1; continue; }
    if (all[i].reveal != null) {
      if (firstPop == null) firstPop = rv.firstPop || (rv.firstPop = t);
      t = Math.max(t, firstPop + all[i].reveal * CONFIG.revealGap);
    }
    if (now < t) break;
    k = i + 1;
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
  if (vis.length && typed < title.length) {
    const cursor = Math.floor(now / 250) % 2 ? '_' : ' ';
    vis[0] = Object.assign({}, vis[0], { text: (title.slice(0, typed) + cursor).padEnd(title.length) });
  }
  const hOf = ln => ln.box ? (ln.sub ? 4 : 3) : ln.tileInfo ? TILE_H : ln.mapView ? ln.h : 1;
  const H = vis.reduce((a, ln) => a + hOf(ln), 0);
  // glide toward the centered spot (so new lines push the block up smoothly);
  // 'board' centers like a normal panel, so the finished screen lines up exactly
  const target = rv.center === 'board' ? BOARD_Y + Math.max(0, Math.floor((L.gh - H) / 2)) : (L.hc - Math.max(1, H)) / 2;
  if (rv.y == null) rv.y = target;
  else rv.y += (target - rv.y) * Math.min(1, (now - rv.lt) / 1000 * 9);
  rv.lt = now;
  if (vis.length) buildTextBoard(ctx, vis, { top: rv.y, h: H });
  if (rv.rival && logoAt != null && now - logoAt >= RIVAL_REVEAL.stamp) {   // DEFEATED, across the logo's middle (your rows cover it as they come in)
    if (ctx.collectHits && !rv.stamped) { rv.stamped = true; Sound.hkStamp(); shake(4, 0.25); }
    const first = all.findIndex(ln => ln.logoRow != null);
    const sw = Math.max(0, Math.floor((now - logoAt - RIVAL_REVEAL.swap) / RIVAL_REVEAL.row) + 1) * (now - logoAt >= RIVAL_REVEAL.swap ? 1 : 0);
    const n = hkStamp(ctx, rv.y + first + 2, rv.rival, all[first].text.length, now - logoAt - RIVAL_REVEAL.stamp, RIVAL_REVEAL.letter, r => 2 + r < sw);
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
    T('');
    statLine(`layers ${pad2(r.depth)}   corps ${r.corps}   cr ${r.earned}`);
    { const marks = (r.breached || []).map(k => corpCode(corpDef(k))).join(' '), txt = `breached ${marks || 'none'}`;
      lines.push({ text: txt, colorAt: i => i < 9 ? C.mid : marks ? C.accent : C.dim }); }
    if (r.practice) T('practice run: no REP', C.dangerDim);
    T('');
    lines.push({ box: true, text: 'T H E   U P L I N K', sub: '- push on or cash out -', id: 'push', onTap: () => swapTo(openUplink), minW: 30 });
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
  if (r.newBest) T('** new best **', C.accent);
  else T(`best ${pad2(save.best)}   seed ${r.seed}`, C.mid);
  if (r.practice) T('practice run: not scored', C.dangerDim);
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
  const bottom = [...(lb || []), ...(lbOpen ? [] : [
    { box: true, text: 'N E W   R U N', id: 'new', onTap: newRun, minW: 24 },
    { text: '[ RETRY SEED ]', id: 'retry', onTap: retry },
    { text: '[ BACK ]', id: 'title', onTap: () => swapTo(showTitle) },
  ])];
  // the scrolling area: the mods and items, then the map with the path you took
  const rest = 1 + bottom.reduce((a, ln) => a + (ln.box ? (ln.sub ? 4 : 3) : 1), 0);   // gap + the bottom
  const used = lines.reduce((a, ln) => a + (ln.box ? 3 : 1), 0);
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
  if (w.hasUp) lines.push({ text: '[ ^ ^ ^  more  ^ ^ ^ ]', invert: true, id: 'omup', onTap: () => st.scroll && st.scroll(-1) });
  lines.push(...shown);
  if (mapH) lines.push({ mapView: true, h: mapH, top: Math.max(0, om.top - E), r, noArrows: true });
  if (w.hasDown) lines.push({ text: '[ v v v  more  v v v ]', invert: true, id: 'omdn', onTap: () => st.scroll && st.scroll(1) });
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
    lines.push({ text: `[${v.name}]`, chip: v.rarity, bold: true });
    T('pick the gear to replace:', C.mid);
    run.items.forEach((s, i) => {
      const o = itemView(s.key, s.tier);
      lines.push({ list: true, id: 'sw' + i, name: itemLabel(s), chip: o.rarity, right: s.n > 1 ? `all ${s.n}` : 'gear', rightCol: C.mid,
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
