// NeoN+1 engine/dev.js: The dev menu.
'use strict';
NEON_FILES.push(['engine/dev.js', 'v13.83']);

// ---------------- Dev menu ----------------
// Open with ` (backtick), or the [DEV] button in the footer when the URL has ?dev=1.
// Using cheats on a run marks it as practice, so it doesn't count.
function toggleDev() {
  if (st.transitioning || st.wipe) return;
  st.dev = !st.dev;
  st.devPage = null;     // always open on the main page; closing ends any music preview
  st.preview = null;
  st.devTop = 0; st.devScroll = null;
  st.devAccess = true;
  st.boardStart = performance.now();
  Sound.ui();
}

function cheat(fn) {
  return () => {
    if (st.run) st.run.practice = true;
    fn();
    Sound.buy();
  };
}

// Jump straight to a corp's boss layer.
function jumpToBoss(node) {
  const run = st.run;
  st.dev = false;
  if (st.mode === 'play' && st.corp && st.corp.hasBoss && !st.lv.boss) {
    st.corp.idx = st.corp.counts.length - 1;
    enterLayer();
    return;
  }
  if (!node) return;
  run.practice = true;
  if (run.at !== node.id) { run.at = node.id; run.visited.push(node.id); }
  startCorp(node, 99);
}

// Dev music player: preview every track and push it through its intensity levels,
// the way the game does as you go deeper.
const LEVEL_LABELS = ['pad + bass', '+ drums', '+ arp', '+ lead', 'final boss'];
function trackLines() {
  const lines = [];
  const T = (text, col = C.text) => lines.push({ text, col });
  const B = (text, id, onTap) => lines.push({ text, id, onTap });
  const p = st.preview;
  const keys = Object.keys(SONGS);
  const usedBy = k => Object.keys(MUSIC_FOR).filter(place => MUSIC_FOR[place] === k).join(', ') || 'unused';
  const set = patch => { Object.assign(p, patch); Sound.tick(); };
  T('MUSIC PLAYER', C.accent);
  T('tap a track to play it.', C.dim);
  T('');
  const rows = 8, n = keys.length;
  p.top = clamp(p.top || 0, 0, maxTop(n, rows));
  const w = listWindow(p.top, n, rows);
  let used = 0;
  if (w.hasUp) { lines.push({ text: '[ ^ ^ ^  more  ^ ^ ^ ]', invert: true, id: 'trup', onTap: () => { p.top = nextTop(p.top, -1, maxTop(n, rows)); Sound.tick(); } }); used++; }
  for (let i = p.top; i < p.top + w.shown; i++) {
    const k = keys[i];
    lines.push({ list: true, id: 'tr_' + k, sel: k === p.key, name: SONGS[k].name, col: k === p.key && p.playing ? C.accent : C.bright,
      right: usedBy(k), rightCol: C.mid, onTap: () => set({ key: k, playing: true }) });
    used++;
  }
  if (w.hasDown) { lines.push({ text: '[ v v v  more  v v v ]', invert: true, id: 'trdn', onTap: () => { p.top = nextTop(p.top, 1, maxTop(n, rows)); Sound.tick(); } }); used++; }
  for (; used < rows; used++) T('');
  T(SEP, C.dim);
  const tr = SONGS[p.key];
  T(`${tr.name}  ${tr.bpm} bpm  ${NOTE_NAMES[tr.root % 12]} ${tr.scale}`, p.playing ? C.accent : C.text);
  if (tr.style === 'ambient') T('ambient: no levels or drums', C.dim);
  else lines.push({ gap: 1, row: [
    { text: 'level' }, { text: '[-]', id: 'trlvd', onTap: () => set({ level: Math.max(0, p.level - 1) }) },
    { text: `${p.level} ${LEVEL_LABELS[p.level]}`.padEnd(12), col: C.bright },
    { text: '[+]', id: 'trlvu', onTap: () => set({ level: Math.min(4, p.level + 1) }) },
  ] });
  const ub = Math.round(p.urgency * 8);
  lines.push({ gap: 1, row: [
    { text: 'urgency' }, { text: '[-]', id: 'trurd', onTap: () => set({ urgency: Math.max(0, Math.round((p.urgency - 0.25) * 4) / 4) }) },
    { text: '#'.repeat(ub) + '-'.repeat(8 - ub), col: p.urgency ? C.danger : C.dim },
    { text: '[+]', id: 'truru', onTap: () => set({ urgency: Math.min(1, Math.round((p.urgency + 0.25) * 4) / 4) }) },
  ] });
  lines.push({ row: [
    { text: `[ heartbeat: ${p.low ? 'ON ' : 'OFF'} ]`, id: 'trlow', onTap: () => set({ low: !p.low }) },
    { text: p.playing ? '[ STOP ]' : '[ PLAY ]', id: 'trplay', onTap: () => set({ playing: !p.playing }) },
  ] });
  // Hear the end jingles over this track (it powers down / up, then restarts).
  const test = (fn, ms) => () => {
    if (!p.playing) return Sound.deny();
    fn();
    clearTimeout(p.restartT);
    p.restartT = setTimeout(() => { if (st.preview === p) Music.restart(); }, ms);
  };
  lines.push({ row: [
    { text: 'test' },
    { text: '[ boss win ]', id: 'trwin', onTap: test(() => Sound.bossWin(), 3600) },
    { text: '[ game over ]', id: 'trdeath', onTap: test(() => Sound.death(), 3800) },
  ] });
  T(SEP, C.dim);
  B('[ back ]', 'trback', () => { st.devPage = null; st.preview = null; st.devTop = 0; Sound.ui(); });
  return lines;
}

function openTrackPlayer() {
  st.devPage = 'tracks';
  st.devTop = 0;
  st.preview = { key: MUSIC_FOR.menu, level: 2, urgency: 0, low: false, playing: true, top: 0 };
  Sound.init();
  Sound.ui();
}

// The dev menu scrolls like the other menus when it's taller than the screen.
// Title and close stay put; everything between scrolls (wheel, swipe, arrows).
function devLines() {
  const all = st.devPage === 'tracks' ? trackLines() : st.devPage === 'corps' ? devCorpLines() : devMenuLines();
  const head = all.slice(0, 2), body = all.slice(2, -1), foot = all.slice(-1);
  const rows = L.hc - head.length - foot.length - 4;   // room left, with a little margin
  const max = maxTop(body.length, rows);
  st.devTop = clamp(st.devTop || 0, 0, max);
  st.devScroll = max > 0 ? d => { const t = nextTop(st.devTop, d, max); if (t !== st.devTop) { st.devTop = t; Sound.tick(); return true; } return false; } : null;
  if (!max) return all;
  const w = listWindow(st.devTop, body.length, rows), out = [...head];
  if (w.hasUp) out.push({ text: '[ ^ ^ ^  more  ^ ^ ^ ]', invert: true, id: 'devup', onTap: () => st.devScroll(-1) });
  out.push(...body.slice(st.devTop, st.devTop + w.shown));
  if (w.hasDown) out.push({ text: '[ v v v  more  v v v ]', invert: true, id: 'devdn', onTap: () => st.devScroll(1) });
  if (!w.hasDown && body.length && !body[body.length - 1].text) out.pop();   // no double gap at the bottom
  out.push({ text: '' }, ...foot);
  return out;
}

// The corp list for the corp tester, by level. Tap one to pick it.
function devCorpLines() {
  const lines = [];
  lines.push({ text: 'PICK A CORP', col: C.accent }, { text: `${Object.keys(CORPS).length} corps, by level. tap one.`, col: C.dim });
  let lvl = 0;
  for (const k of corpsByLevel()) {
    const d = CORPS[k];
    if ((d.level || 1) !== lvl) { lvl = d.level || 1; lines.push({ text: '' }, { text: `- LEVEL ${lvl} -`, col: C.mid }); }
    lines.push({ text: `${k === st.devCorp ? '>' : ' '} ${corpCode(d)}  ${d.name.slice(0, 16).padEnd(16)}`, id: 'dc_' + k, onTap: () => { st.devCorp = k; st.devPage = null; st.devTop = 0; Sound.ui(); } });
  }
  lines.push({ text: '' }, { text: '[ back ]', id: 'dcback', onTap: () => { st.devPage = null; st.devTop = 0; Sound.ui(); } });
  return lines;
}
// Breach a corp right now: the first open corp node on the map becomes it.
function devBreach(key, tier) {
  const run = st.run;
  if (!run || st.mode !== 'map' || st.busy || st.transitioning) return Sound.deny();
  const id = availableNodes().find(x => run.map[x].type === 'corp');
  if (!id) return Sound.deny();
  Object.assign(run.map[id], { corp: key, tier });
  if (st.devCMod) run.map[id].mod = st.devCMod; else delete run.map[id].mod;
  run.practice = true;
  if (st.dev) toggleDev();
  enterNode(run.map[id], true);
}
// A practice run on a test seed (a corp's name, or DEV1).
function devTestRun(seed) {
  if (st.dev) toggleDev();
  startRun(seed, true);
}

function devMenuLines() {
  const lines = [];
  const T = (text, col = C.text) => lines.push({ text, col });
  const B = (text, id, onTap, disabled = false) => lines.push({ text, id, onTap, disabled });
  const run = st.run;
  const idle = !st.busy && !st.transitioning;
  T('DEV MENU', C.accent);
  T(run ? (run.practice ? 'run is practice (not scored)' : 'cheats mark the run as practice') : 'start a run for cheats', C.dim);
  B(`[ palette: ${PALETTES[save.palette].name.padEnd(11)} ]`, 'pal', cyclePalette);
  B(`[ show real node: ${st.debug ? 'ON ' : 'OFF'} ]`, 'dbg', () => { st.debug = !st.debug; if (run) run.practice = true; Sound.ui(); });
  B(`[ god: ${st.god ? 'ON ' : 'OFF'} ]`, 'god', () => { st.god = !st.god; if (run) run.practice = true; Sound.ui(); });
  B(`[ free travel: ${st.freeTravel ? 'ON ' : 'OFF'} ]`, 'free', () => { st.freeTravel = !st.freeTravel; if (run) run.practice = true; st.mapSel = null; Sound.ui(); });
  { const gl = lbClient(); B(`[ stats: ${gl && gl.dev ? (window.Greglytics.tester() ? 'TESTER (dev data)' : 'LOCAL (dev data) ') : 'REAL             '} ]`, 'tester', lbToggleTester); }
  B(`[ title pulse: ${(st.pulseStyle || 'color').toUpperCase().padEnd(5)} ]`, 'pulse', () => { st.pulseStyle = PULSE_STYLES[(PULSE_STYLES.indexOf(st.pulseStyle || 'color') + 1) % PULSE_STYLES.length]; Sound.ui(); });
  // the boot / login intro: replay the first-boot version (as if new) or the short one
  lines.push({ row: [
    { text: '[intro: first boot]', id: 'introfull', onTap: () => { save.bootSeen = false; persist(); toggleDev(); startIntro(); } },
    { text: '[intro: short]', id: 'introshort', onTap: () => { save.bootSeen = true; persist(); toggleDev(); startIntro(); } },
    { text: '[show ad]', id: 'showad', onTap: () => { toggleDev(); showAd(pickR(Object.keys(ADS), Math.random)); } },
  ] });
  T('');
  // Corp tester: pick a corp from the list, then breach it now (on the map) or start a
  // run where every node is that corp. DEV1: every corp in level order.
  T('corp tester', C.mid);
  const tc = st.devCorp && CORPS[st.devCorp] ? st.devCorp : 'basic', td = CORPS[tc];
  st.devTier = st.devTier || 1;
  B(`[ corp: ${(corpCode(td) + ' ' + td.name).slice(0, 16).padEnd(16)} LV${td.level || 1} v ]`, 'dcorp', () => { st.devPage = 'corps'; st.devTop = 0; Sound.ui(); });
  const cmKeys = [null, ...Object.keys(ANOMALIES)];
  B(`[ anomaly: ${(st.devCMod ? ANOMALIES[st.devCMod].name : 'none').padEnd(8)} ]`, 'dcmod', () => { st.devCMod = cmKeys[(cmKeys.indexOf(st.devCMod || null) + 1) % cmKeys.length]; Sound.tick(); });
  lines.push({ row: [
    { text: `[tier ${st.devTier}]`, id: 'dtier', onTap: () => { st.devTier = st.devTier % 3 + 1; Sound.tick(); } },
    { text: '[breach now]', id: 'dbreach', onTap: () => devBreach(tc, st.devTier), disabled: !idle || st.mode !== 'map' },
  ] });
  lines.push({ row: [
    { text: `[run: all ${tc.toUpperCase().slice(0, 8)}]`, id: 'drun', onTap: () => devTestRun(tc.toUpperCase()), disabled: !idle },
    { text: '[run: DEV1]', id: 'drun1', onTap: () => devTestRun('DEV1'), disabled: !idle },
  ] });
  if (st.mode !== 'map') T('(breach now: be on the map)', C.dim);
  T('');
  T('mods / gear: the neon editor', C.dim);
  T('');
  lines.push({ row: [
    { text: '[+100cr]', id: 'cr', onTap: cheat(() => { run.credits += 100; }), disabled: !run },
    { text: '[heal]', id: 'hp', onTap: cheat(() => { run.integrity = run.maxInt; }), disabled: !run },
    { text: '[fill gear]', id: 'belt', onTap: cheat(() => { for (const k of Object.keys(ITEMS)) addItem(k, 0); }), disabled: !run },
  ] });
  B('[unlock codex]', 'seenall', () => {
    for (const k of [...Object.keys(MODS), ...Object.keys(ITEMS), ...GLYPHS.map(gl => gl.key), ...CODEX_CORPS.map(c => 'corp_' + c), ...Object.keys(SECTOR_EVENTS).map(e => 'ev_' + e)]) save.seen[k] = true;
    for (const c of CODEX_CORPS) if (!corpStat(c).breached) corpStat(c).breached = 1;
    persist(); Sound.buy();
  });
  T('');
  const inCorp = st.mode === 'play' && st.corp && st.corp.hasBoss && st.lv && !st.lv.boss;
  const sel = st.mode === 'map' && st.mapSel && run.map[st.mapSel];
  const selCorp = sel && (sel.type === 'corp' || sel.type === 'final') ? sel : null;
  const bossLabel = inCorp ? '[ jump to this boss ]' : selCorp ? `[ jump to ${corpCode(corpDef(selCorp.corp))} boss ]` : '[ jump to boss ]';
  B(bossLabel, 'boss', cheat(() => jumpToBoss(selCorp)), !idle || !(inCorp || selCorp));
  if (!inCorp && !selCorp) T('(select a corp on the map first)', C.dim);
  B('[ go fishing ]', 'fish', cheat(() => { if (st.dev) toggleDev(); swapTo(() => openPier({ id: 'dev-pier', sector: run.sector, type: 'pier' })); }), !idle || st.mode !== 'map');   // the PIER (engine/fishing.js)
  B('[ clear this sector ]', 'sclr', cheat(() => {
    const omni = `${SECTOR_STEPS * (run.sector + 1)}:1`;
    run.at = omni; if (!run.visited.includes(omni)) run.visited.push(omni);
    if (st.dev) toggleDev();
    sectorClear(false);
  }), !idle || st.mode !== 'map');
  lines.push({ row: [
    { text: '[+100 REP]', id: 'rep', onTap: () => { save.rep = (save.rep || 0) + 100; persist(); Sound.buy(); } },
    { text: '[reset legacy]', id: 'leg0', onTap: () => { save.legacy = {}; save.rep = 0; persist(); Sound.deny(); } },
  ] });
  T('');
  T(SEP, C.dim);
  B('[ music player ]', 'tracks', openTrackPlayer);
  T(SEP, C.dim);
  T('');
  B('[ close ]', 'close', toggleDev);
  return lines;
}
