// NeoN+1 engine/menus.js: Settings, THE BOARD, resuming a run.
'use strict';
NEON_FILES.push(['engine/menus.js', 'v13.87']);

// ---------------- Settings ----------------
function openSettings() {
  st.resetArmed = false;
  openPanel('SETTINGS', (T, B, X) => {
    T('SETTINGS', C.accent);
    T('');
    B(`[ palette: ${PALETTES[save.palette].name.padEnd(11)} ]`, 'pal', cyclePalette);
    B(`[ corp colors: ${save.corpColors ? 'ON ' : 'OFF'} ]`, 'ccol', toggleCorpColors);
    B(`[ effects: ${save.effects === 'full' ? 'FULL   ' : 'REDUCED'} ]`, 'fx', toggleEffects);
    B(`[ gear: ${save.tapMode === 'two' ? 'TAP TWICE' : 'TAP ONCE '} ]`, 'tap', toggleTapMode);
    B(`[ ads: ${save.ads === false ? 'OFF' : 'ON '} ]`, 'ads', () => { save.ads = save.ads === false; persist(); Sound.ui(); });   // the fake ads
    T('');
    audioLines(X, 's_');
    T('');
    T(`next run seed${st.practice ? ' (practice)' : ''}`, C.text);
    X({ row: [
      { field: 'seed', width: 16, value: () => st.seed, clean: cleanSeed, onCommit: setSeed },
      { text: '[ NEW SEED ]', id: 'rseed', onTap: rerollSeed },
    ] });
    T(Field.editing('seed') ? 'enter to set, esc to cancel' : 'tap the seed to type your own', C.dim);
    T('');
    B(st.resetArmed ? '[ TAP AGAIN TO ERASE ]' : '[ reset save data ]', 'reset', resetSave);
    if (st.resetArmed) T('erases best, runs, codex.', C.danger);
    T('');
    B('[ BACK ]', 'back', () => swapTo(showTitle));
  }, '> settings.', { full: true });
  st.keyHandler = k => { if (k === 'escape') { swapTo(showTitle); return true; } return false; };
}

// A typed seed (from the settings field).
function setSeed(s) {
  const clean = cleanSeed(s);
  if (!clean) return Sound.deny();      // empty: keep the old seed
  if (clean === st.seed) return;
  st.seed = clean;
  st.practice = true;     // a chosen seed is a practice run
  Sound.ui();
  setMsg(`> seed set: ${clean}`);
}

function resetSave() {
  if (!st.resetArmed) { st.resetArmed = true; Sound.deny(); return; }
  const keep = { palette: save.palette, muted: save.muted, effects: save.effects, tapMode: save.tapMode, ads: save.ads, initials: save.initials };   // initials: your name on the online boards
  for (const k of Object.keys(save)) delete save[k];
  Object.assign(save, freshSave(), keep);
  persist();
  clearRun();
  st.resetArmed = false;
  Sound.buy();
  setMsg('> save data erased.', C.danger);
}

// ---------------- THE BOARD ----------------
// The hub for everything that lasts between runs (docs/PROGRESSION.md): YOU (your card: logo, title, color), REP
// (the posts you buy with REP), FEATS, STATS. The BBS header sits over the tabs on every tab, the body is always
// BOARD_BODY lines and BACK stays in one spot. The title's [ THE BOARD ] opens it (on FEATS when a feat is new,
// else on REP); your name opens it on YOU.
const BOARD_TABS = [['you', 'YOU', 'tby'], ['rep', 'REP', 'tbr'], ['feats', 'FEATS', 'tbf'], ['crew', 'CREW', 'tbc'], ['quests', 'QUESTS', 'tbq']];   // (STATS is under the feats list)
const BOARD_BODY = 24;
const FEAT_GROUPS = [['runs', 'RUNS'], ['corps', 'CORPS'], ['odd', 'ODD'], ['rivals', 'RIVALS'], ['crew', 'CREW']];
// A hacker's feats show once you've met them (a rival came in, you called the crew member).
const hkMet = id => statOf('hack:met:' + id) > 0 || statOf('hack:call:' + id) > 0 || statOf('hack:beat:' + id) > 0;
const featShown = f => !f.hacker || hkMet(f.hacker);
const featsShown = () => FEATS.filter(featShown);
const FEAT_LIST_ROWS = BOARD_BODY - 7;   // FEATS: 6 lines of detail, then the list
// A progress bar: 10 wide (fewer for small counts).
function featBar(v, n) { const w = n >= 10 ? 10 : Math.max(1, n), k = Math.min(w, Math.floor(v / n * w)); return '#'.repeat(k) + '-'.repeat(w - k); }
const featProgText = f => featDone(f.id) ? 'done' : `${featBar(featProgress(f), featNeed(f))} ${featProgress(f)}/${featNeed(f)}`;
// The FEATS list: group headers and feats (only the feats can be picked).
function featLines() {
  const lines = [];
  for (const [g, label] of FEAT_GROUPS) {
    const fs = FEATS.filter(f => f.group === g && featShown(f));
    if (!fs.length) continue;
    lines.push({ hdr: label });
    for (const f of fs) lines.push({ f });
  }
  return lines;
}
// REP: PRIVATE MESSAGES (shown once its feat has some progress), then each level: open ones list their posts, the next
// locked one says what opens it. Lines: { hdr, right } | { post } | { note }.
const REP_LIST_ROWS = 13;
function repLines() {
  const lines = [], lvl = boardLevel();
  const pms = LEGACY.filter(u => u.pm && FEAT_BY_ID[u.pm] && (!u.needs || legacyLv(u.needs)) && (featDone(u.pm) || featProgress(FEAT_BY_ID[u.pm]) > 0));
  if (pms.length) { lines.push({ hdr: 'PRIVATE MESSAGES', right: '' }); for (const u of pms) lines.push({ post: u }); }
  BOARD_LEVELS.forEach((L, i) => {
    const t = i + 1, posts = LEGACY.filter(u => u.tier === t), open = t <= lvl;
    lines.push({ hdr: `${t} ${L.name}`, right: !open ? 'locked' : posts.length ? `${boughtOn(t)}/${posts.length}` : '' });
    if (!open) { if (t === lvl + 1) lines.push({ note: `buy ${L.need - boughtOn(t - 1)} more on ${BOARD_LEVELS[t - 2].name} to open.` }); return; }
    if (!posts.length) lines.push({ note: 'nothing posted yet.' });
    for (const u of posts) lines.push({ post: u });
  });
  return lines;
}
const repHdr = (t, right) => { const r = right ? ' ' + right + ' --' : ''; return ('-- ' + t + ' ').padEnd(32 - r.length, '-') + r; };
// NEMESIS: the corps you can pick (ones you've breached).
const nemesisPool = () => Object.keys(CORPS).filter(k => corpStat(k).breached > 0).sort((a, b) => CORPS[a].name.localeCompare(CORPS[b].name));
function stepNemesis(d) {
  const pool = nemesisPool();
  if (!pool.length) return Sound.deny();
  const i = pool.indexOf(save.nemesis);
  save.nemesis = pool[((i < 0 ? 0 : i + d) % pool.length + pool.length) % pool.length];
  persist(); Sound.tick();
}
// STATS: one column, values on the right, every other line shaded (under the feats list)
function boardStatItems() {
  return boardStatRows().map(([label, v], i) => {
    const val = typeof v === 'number' ? v.toLocaleString('en-US') : String(v);
    const s = label + ' '.repeat(Math.max(1, 32 - label.length - val.length)) + val;
    return { text: s, colorAt: k => k >= s.length - val.length ? C.bright : C.text, bgCol: i % 2 ? C.dim : null, bgA: 0.35 };
  });
}
// STATS: the record, one line each.
function boardStatRows() {
  const done = featsShown().filter(f => featDone(f.id)).length;
  return [
    ['runs', statOf('runs')], ['deaths', statOf('deaths')], ['cash-outs', statOf('cashouts')],
    ['corps breached', statOf('corps')], ['different corps', `${statOf('corpKinds')}/${Object.keys(CORPS).length}`],
    ['layers cleared', statOf('layers')], ['perfect layers', statOf('perfects')], ['best perfect streak', statOf('bestStreak')],
    ['deepest layer', statOf('bestDepth')], ['sectors cleared', statOf('sectors')], ['most sectors in a run', statOf('bestSectors')],
    ['ICE hits', statOf('ice')], ['credits earned', statOf('earned')], ['most credits held', statOf('bestHeld')],
    ['most spent in a run', statOf('bestSpent')], ['REP banked', statOf('repBanked')], ['gear used', statOf('gear')],
    ['ads closed', statOf('ads')], ['casts', statOf('casts')], ['phish landed', statOf('fish')], ['biggest catch', statOf('phishKB') ? fmtKB(statOf('phishKB')) : '-'],
    ['rivals beaten', HK_RIVALS.reduce((a, id) => a + statOf('hack:beat:' + id), 0)], ['crew called', HK_CREW.reduce((a, id) => a + statOf('hack:call:' + id), 0)], ['feats', `${done}/${featsShown().length}`],
  ];
}
// The logo picker: yours, plus hacker logos you've met (still locked, they show with a banner on the card).
const pickerLogos = () => ART_LOGOS.filter(l => logoUnlocked(l) || (l.kind === 'hacker' && hkMet(l.hacker)));
function stepBoardLogo(prof, d) {
  const list = pickerLogos(), i = list.findIndex(l => l.id === logoOf(prof.logo).id);
  const l = list[((i < 0 ? 0 : i + d) % list.length + list.length) % list.length];
  if (logoUnlocked(logoOf(prof.logo))) prof.goodLogo = logoOf(prof.logo).id;
  prof.logo = l.id;
  if (logoUnlocked(l)) prof.goodLogo = l.id;
  persist(); Sound.tick();
}
// Off YOU (or out of THE BOARD) on a locked logo: back to the last one you could wear.
function boardFixLogo() {
  const prof = profile();
  if (!logoUnlocked(logoOf(prof.logo))) { prof.logo = prof.goodLogo && LOGO_BY_ID[prof.goodLogo] ? prof.goodLogo : randomLogo(); persist(); }
}
const lockedLogoText = l => { const f = FEATS.find(x => x.logo === l.hacker); return f ? `LOCKED: ${f.text.replace(/\.$/, '').toUpperCase()} ${featProgress(f)}/${featNeed(f)}` : 'LOCKED'; };
// CREW: your crew as cards (face, name, level, what they do, LVL 2), then the ones you've called who aren't crew yet.
function crewItems() {
  const items = [], ink = hkInk;
  const crew = HK_CREW.filter(hkCrewOn), called = HK_CREW.filter(id => !hkCrewOn(id) && statOf('hack:call:' + id) > 0);
  if (!crew.length) items.push({ text: 'no crew yet.', col: C.mid }, { text: 'CALL gear brings in a hacker.', col: C.dim }, { text: 'call one 5 times: they can join.', col: C.dim }, { text: '' });
  for (const id of crew) {
    const d = HACKERS[id], face = (ART_FACES[id] || { art: ['', '', ''] }).art, lv2 = hkLvl2(id), col = ink(id);
    const what = wrapText(d.shtick, 24);
    const row = (k, txt, c2) => { const fl = (face[k] || '').padEnd(5); const line = (' ' + fl + '  ' + txt).padEnd(32); return { text: line, colorAt: i => i >= 1 && i < 6 ? col : c2 || C.text, bold: k === 0 }; };
    items.push(row(0, `${d.name.padEnd(14)}${lv2 ? 'LVL 2' : 'LVL 1'}`, C.bright), row(1, what[0] || ''), row(2, what[1] || ''));
    const f = FEAT_BY_ID['call10_' + id];
    items.push({ text: ('  ' + (lv2 ? `upgrade: ${d.lvl2}` : featDone(f.id) ? 'LVL 2 is on THE BOARD > REP.' : `LVL 2: ${featBar(featProgress(f), featNeed(f))} ${featProgress(f)}/${featNeed(f)} calls`)).slice(0, 32).padEnd(32), col: lv2 ? C.accent : C.mid });
    items.push({ text: '' });
  }
  if (called.length) {
    items.push({ text: '-- called, not crew yet '.padEnd(32, '-'), col: C.mid });
    for (const id of called) { const f = FEAT_BY_ID['call_' + id]; items.push({ text: (HACKERS[id].name.padEnd(12) + `${featBar(featProgress(f), featNeed(f))} ${featProgress(f)}/${featNeed(f)} calls`).padEnd(32), col: C.text }); }
  }
  return items;
}
function openBoard(tab) {
  if (!tab) tab = Object.keys(save.unseen || {}).length ? 'feats' : 'rep';
  const featS = { top: 0 }, statS = { top: 0 }, repS = { top: 0 }, crewS = { top: 0 };
  // REP starts on the first new post (or the first post)
  let repSel = (() => { const ls = repLines(), i = ls.findIndex(l => l.post && postUnseen(l.post.key)); return i >= 0 ? i : ls.findIndex(l => l.post); })();
  scrollFollow(repS, repSel, repLines().length, REP_LIST_ROWS);
  // FEATS starts on the first new one (or the first feat)
  let featSel = (() => { const ls = featLines(), i = ls.findIndex(l => l.f && featUnseen(l.f.id)); return i >= 0 ? i : ls.findIndex(l => l.f); })();
  scrollFollow(featS, featSel, featLines().length, FEAT_LIST_ROWS);
  const setTab = k => { if (k === tab) return; if (tab === 'you') boardFixLogo(); tab = k; Sound.tick(); if (k === 'you') seeTitles(); };
  if (tab === 'you') seeTitles();
  const back = () => { boardFixLogo(); swapTo(showTitle); };
  const buy = u => {
    const lv = legacyLv(u.key), cost = u.costs[lv];
    if (cost == null || !postOpen(u)) return Sound.deny();
    const was = boardLevel();
    if ((save.rep || 0) < cost) { Sound.deny(); setMsg('> not enough REP.', C.danger); return; }
    save.rep -= cost;
    save.legacy = save.legacy || {};
    save.legacy[u.key] = lv + 1;
    persist();
    Sound.buy();
    setMsg(`> ${u.name.toLowerCase()} unlocked${u.costs.length > 1 ? `: level ${lv + 1}` : ''}.`, C.rep);
    if (u.key === 'nemesis' && !save.nemesis && nemesisPool().length) { save.nemesis = nemesisPool()[0]; persist(); }
    for (let l = was + 1; l <= boardLevel(); l++) boardLevelNews(l);   // a level opened
  };
  openPanel('THE BOARD', (T, B, X) => {
    st.scroll = null;
    T('+------------------------------+', C.dim);
    X({ text: '|  T H E   B O A R D   //  BBS |', colorAt: i => i === 0 || i === 31 ? C.dim : C.rep, bold: true });
    T('+------------------------------+', C.dim);
    const star = k => (k === 'feats' && Object.keys(save.unseen || {}).length > 0) || (k === 'rep' && repNew()) || (k === 'you' && save.newTitle) || (k === 'quests' && questsNew());
    X({ gap: 1, row: BOARD_TABS.map(([k, label, id]) => ({ text: `[${label}${star(k) ? '*' : ''}]`, id, sel: tab === k, onTap: () => setTab(k) })) });
    T('');
    let used = 0;
    const t = (s, c) => { T(s, c); used++; }, x = o => { X(o); used += o.box ? (o.sub ? 4 : 3) : 1; };

    if (tab === 'you') {
      // your card, all in your player color: logo, name, title, record
      const prof = profile(), sty = styleOf(prof.style), W = 32;
      const mid = (s, w = W) => { const l = Math.max(0, Math.floor((w - s.length) / 2)); return (' '.repeat(l) + s).padEnd(w).slice(0, w); };
      const card = (s, bold = false) => x({ text: mid(s), col: sty.fg, bgCol: sty.bg, bold });
      const ttl = titleOf(prof);
      card('');
      const locked = !logoUnlocked(logoOf(prof.logo));
      hackerArt(prof.logo).forEach((l, k) => { if (locked && k === 3) x({ text: mid(lockedLogoText(logoOf(prof.logo)).slice(0, W)), col: C.bg, bgCol: C.danger, bold: true }); else card(l, true); });
      card(`${logoMark(prof.logo)} ${prof.name}`, true);
      card(ttl ? `"${ttl}"` : '');
      card(`access ${accessName()}`);
      card(`best ${pad2(save.best)}   runs ${save.runs}   wins ${save.wins}`);
      card('');
      t('');
      const pick = (label, name, idp, step) => x({ gap: 1, row: [{ text: label.padEnd(5) },
        { text: '[ < ]', id: idp + 'L', onTap: () => step(-1) }, { text: mid(name, 15), id: idp + 'N', onTap: () => step(1) }, { text: '[ > ]', id: idp, onTap: () => step(1) }] });
      pick('logo', logoOf(prof.logo).name, 'plogo', d => stepBoardLogo(prof, d));
      pick('title', ttl || 'none yet', 'ptitle', d => stepTitle(prof, d));
      pick('color', sty.name, 'pcolor', d => { prof.style = ((prof.style + d) % PLAYER_STYLES.length + PLAYER_STYLES.length) % PLAYER_STYLES.length; persist(); Sound.tick(); });
      t('');
      x({ row: [
        { text: '[ NEW NAME ]', id: 'pname', onTap: () => { prof.name = randomName(); persist(); Sound.tick(); } },
        { text: '[ RANDOMIZE ALL ]', id: 'prand', onTap: () => { randomizeProfile(prof); Sound.ui(); } },
      ] });
    } else if (tab === 'rep') {
      // the posts (scrolling), then the picked one with its BUY box under it
      const lines = repLines();
      if (!lines[repSel] || !lines[repSel].post) repSel = lines.findIndex(l => l.post);
      const u = lines[repSel].post;
      seePost(u.key);   // looked at: its * goes
      x({ text: `REP ${save.rep || 0}   //   access ${accessName()}`, colorAt: i => i < 4 + String(save.rep || 0).length ? C.rep : C.mid, bold: true });
      const items = lines.map((l, i) => {
        if (l.hdr) return { text: repHdr(l.hdr, l.right), col: l.right === 'locked' ? C.dim : C.mid };
        if (l.note) return { text: ('   ' + l.note).padEnd(32), col: C.dim };
        const p = l.post, lv = legacyLv(p.key), max = lv >= p.costs.length, cost = p.costs[lv], open = postOpen(p);
        const lvTxt = p.costs.length > 1 ? ` ${'#'.repeat(lv)}${'-'.repeat(p.costs.length - lv)}` : '';
        const fe = p.pm && FEAT_BY_ID[p.pm];
        return { list: true, id: 'lg' + i, onTap: () => { repSel = i; Sound.tick(); }, sel: i === repSel,
          name: (postUnseen(p.key) ? '*' : '') + p.name + lvTxt, col: max ? C.accent : !open ? C.mid : lv ? C.text : C.bright,
          right: !open ? `${featBar(featProgress(fe), featNeed(fe))} ${featProgress(fe)}/${featNeed(fe)}` : max ? 'OWNED' : `${cost} REP`,
          rightCol: max ? C.accent : !open ? C.mid : (save.rep || 0) >= cost ? C.rep : C.dim, tint: max ? C.accent : null };
      });
      scrollArea(x, t, repS, items, REP_LIST_ROWS, 'rl');
      const lv = legacyLv(u.key), max = lv >= u.costs.length, cost = u.costs[lv], open = postOpen(u);
      t(SEP, C.dim);
      x({ text: u.name, col: C.bright, bold: true });
      const dl = wrapText(u.levels ? u.levels[Math.min(lv, u.levels.length - 1)] : u.desc, 32);
      for (let k = 0; k < 2; k++) t(dl[k] || '', C.text);
      // the line under it: how it opens, its steps, or what it holds (LOCKER, NEMESIS)
      if (!open) t(`opens: ${FEAT_BY_ID[u.pm].text}`, C.mid);
      else if (u.key === 'nemesis' && lv) {
        const pool = nemesisPool();
        if (!pool.length) t('breach a corp first.', C.mid);
        else x({ gap: 1, row: [{ text: '[ < ]', id: 'nemL', onTap: () => stepNemesis(-1) }, { text: (CORPS[save.nemesis] ? CORPS[save.nemesis].name : '?').slice(0, 16).padEnd(16), id: 'nemN', onTap: () => stepNemesis(1) }, { text: '[ > ]', id: 'nemR', onTap: () => stepNemesis(1) }] });
      } else if (u.key === 'locker' && lv) t(save.locker && MODS[save.locker.key] ? `in it: ${MODS[save.locker.key].name} (next run)` : 'empty. cash out to put one away.', C.mid);
      else t(u.costs.length > 1 ? `level ${lv} of ${u.costs.length}` : '', C.mid);
      if (!open) { t(''); t('a private message. not yet.', C.dim); t(''); }
      else if (max) { t(''); t('owned.', C.accent); t(''); }
      else x({ box: true, text: `B U Y  ${cost} REP`, id: 'buy', onTap: () => buy(u), minW: 20, disabled: (save.rep || 0) < cost });
      t(SEP, C.dim);
    } else if (tab === 'feats') {
      // the picked feat on top, the list (scrolling) under it
      const lines = featLines(), done = featsShown().filter(f => featDone(f.id)).length;
      if (!lines[featSel] || !lines[featSel].f) featSel = lines.findIndex(l => l.f);
      const f = lines[featSel].f;
      seeFeat(f.id);   // looked at: its * goes
      t(`${done} of ${featsShown().length} done`, C.mid);
      x({ text: f.name, col: featDone(f.id) ? C.rep : C.bright, bold: true });
      t(f.text, C.text);
      t(featProgText(f), featDone(f.id) ? C.rep : C.mid);
      t(f.title ? `gives the title "${f.title}"` : '', C.rep);
      t(SEP, C.dim);
      const items = lines.map((l, i) => l.hdr
        ? { text: ('-- ' + l.hdr + ' ').padEnd(32, '-'), col: C.mid }
        : { list: true, id: 'ft' + i, onTap: () => { featSel = i; Sound.tick(); }, sel: i === featSel,
          name: (featUnseen(l.f.id) ? '*' : '') + l.f.name, col: featDone(l.f.id) ? C.rep : C.bright,
          right: featProgText(l.f), rightCol: featDone(l.f.id) ? C.rep : C.mid });
      items.push({ text: '' }, { text: '-- STATS '.padEnd(32, '-'), col: C.mid }, ...boardStatItems());   // the record, under the feats
      scrollArea(x, t, featS, items, FEAT_LIST_ROWS, 'fl');
    } else if (tab === 'crew') {
      scrollArea(x, t, crewS, crewItems(), BOARD_BODY, 'cl');
    } else if (tab === 'quests') questBoardLines(t, x);   // engine/quests.js
    for (; used < BOARD_BODY; used++) T('');
    T('');
    B('[ BACK ]', 'back', back);
  }, '> connected to the board.', { full: true });
  // keys: left / right = tabs, up / down = the list (REP, FEATS) or scroll (STATS), esc = back
  st.keyHandler = k => {
    if (k === 'escape') { back(); return true; }
    if (k === 'arrowleft' || k === 'arrowright') {
      const i = BOARD_TABS.findIndex(b => b[0] === tab), nx = BOARD_TABS[(i + (k === 'arrowright' ? 1 : BOARD_TABS.length - 1)) % BOARD_TABS.length];
      setTab(nx[0]); st.kbFocus = st.hoverBtn = nx[2];
      return true;
    }
    if (k === 'arrowup' || k === 'arrowdown') {
      const d = k === 'arrowdown' ? 1 : -1;
      if (tab === 'rep') {
        const lines = repLines(), picks = lines.map((l, i) => l.post ? i : -1).filter(i => i >= 0), j = picks.indexOf(repSel);
        repSel = picks[clamp(j + d, 0, picks.length - 1)];
        scrollFollow(repS, repSel, lines.length, REP_LIST_ROWS); Sound.tick();
        return true;
      }
      if (tab === 'feats') {
        const lines = featLines(), picks = lines.map((l, i) => l.f ? i : -1).filter(i => i >= 0), j = picks.indexOf(featSel);
        featSel = picks[clamp(j + d, 0, picks.length - 1)];
        scrollFollow(featS, featSel, lines.length, FEAT_LIST_ROWS); Sound.tick();
        return true;
      }
      if (tab === 'crew') { if (st.scroll) st.scroll(d); return true; }
    }
    return false;
  };
}

// ---------------- Resume a saved run ----------------
async function resumeRun() {
  const d = savedRun();
  if (!d || st.transitioning) return;
  st.transitioning = true;
  Sound.ui();
  await wipeOut(0);
  st.transitioning = false;
  const run = d.run;
  run.resumes = (run.resumes || 0) + 1;   // layers come back different
  st.run = run; st.seed = run.seed; st.practice = run.practice;
  st.result = null;
  const p = d.pending;
  if (p && p.kind === 'sector') return showSectorClear(p.skipped, false);
  if (p && p.kind === 'omni') return openOmniReward(p.from);
  if (p && p.kind === 'reward' && run.map[p.id]) { st.breachReveal = false; return openReward(run.map[p.id], p.skipped); }
  if (p && p.kind === 'start') return openStartReward(run.map['0:1']);
  if (d.corp && run.map[d.corp.node]) {
    // Back into the corp you were in, at the layer you were on (a fresh layer).
    await startCorp(run.map[d.corp.node], d.corp.idx, d.corp);
    return;
  }
  toMap();
}
function newOverSave() {
  if (!st.newArmed) { st.newArmed = true; Sound.deny(); return; }
  st.newArmed = false;
  clearRun(); st.savedRun = null;
  jackIn();
}
