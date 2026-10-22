// NeoN+1 engine/menus.js: Settings, THE BOARD, resuming a run.
'use strict';
NEON_FILES.push(['engine/menus.js', 'v12.22']);

// ---------------- Settings ----------------
function openSettings() {
  st.resetArmed = false;
  openPanel('SETTINGS', (T, B, X) => {
    T('SETTINGS', C.accent);
    T('');
    B(`[ palette: ${PALETTES[save.palette].name.padEnd(11)} ]`, 'pal', cyclePalette);
    B(`[ corp colors: ${save.corpColors ? 'ON ' : 'OFF'} ]`, 'ccol', toggleCorpColors);
    B(`[ effects: ${save.effects === 'full' ? 'FULL   ' : 'REDUCED'} ]`, 'fx', toggleEffects);
    B(`[ items: ${save.tapMode === 'two' ? 'TAP TWICE' : 'TAP ONCE '} ]`, 'tap', toggleTapMode);
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
  const keep = { palette: save.palette, muted: save.muted, effects: save.effects, tapMode: save.tapMode };
  for (const k of Object.keys(save)) delete save[k];
  Object.assign(save, freshSave(), keep);
  persist();
  clearRun();
  st.resetArmed = false;
  Sound.buy();
  setMsg('> save data erased.', C.danger);
}

// ---------------- THE BOARD (legacy shop) ----------------
// An old hacker bulletin board: spend REP on unlocks that last between runs.
function openBoard() {
  let sel = 0;
  const buy = u => {
    const lv = legacyLv(u.key), cost = u.costs[lv];
    if (cost == null) return Sound.deny();
    if ((save.rep || 0) < cost) { Sound.deny(); setMsg('> not enough REP.', C.danger); return; }
    save.rep -= cost;
    save.legacy = save.legacy || {};
    save.legacy[u.key] = lv + 1;
    persist();
    Sound.buy();
    setMsg(`> ${u.name.toLowerCase()} unlocked${u.costs.length > 1 ? `: level ${lv + 1}` : ''}.`, C.money);
  };
  openPanel('THE BOARD', (T, B, X) => {
    T('+------------------------------+', C.dim);
    X({ text: '|  T H E   B O A R D   //  BBS |', colorAt: i => i === 0 || i === 31 ? C.dim : C.money, bold: true });
    T('+------------------------------+', C.dim);
    T(`sysop: ${profile().name.toLowerCase()}`, C.mid);
    X({ text: `REP ${save.rep || 0}`, col: C.money, bold: true });
    T('cash out after a sector for REP.', C.dim);
    T('');
    LEGACY.forEach((u, i) => {
      const lv = legacyLv(u.key), max = lv >= u.costs.length, cost = u.costs[lv];
      const lvTxt = u.costs.length > 1 ? ` ${'#'.repeat(lv)}${'-'.repeat(u.costs.length - lv)}` : '';
      X({
        list: true, id: 'lg' + i, onTap: () => { sel = i; Sound.tick(); }, sel: i === sel,
        name: u.name + lvTxt, col: max ? C.accent : lv ? C.text : C.mid,
        right: max ? 'OWNED' : `${cost} REP`, rightCol: max ? C.accent : (save.rep || 0) >= cost ? C.money : C.dim,
        tint: max ? C.accent : null,
      });
    });
    T('');
    const u = LEGACY[sel], lv = legacyLv(u.key), max = lv >= u.costs.length, cost = u.costs[lv];
    T(SEP, C.dim);
    X({ text: u.name, col: C.bright, bold: true });
    const dl = wrapText(u.levels ? u.levels[Math.min(lv, u.levels.length - 1)] : u.desc, 32);
    for (let k = 0; k < 2; k++) T(dl[k] || '', C.text);
    T(u.costs.length > 1 ? `level ${lv} of ${u.costs.length}` : '', C.mid);
    if (max) { T('owned.', C.accent); T(''); T(''); }
    else X({ box: true, text: `B U Y  ${cost} REP`, id: 'buy', onTap: () => buy(u), minW: 20, disabled: (save.rep || 0) < cost });
    T(SEP, C.dim);
    T('');
    B('[ BACK ]', 'back', () => swapTo(showTitle));
  }, '> connected to the board.', { full: true });
  st.keyHandler = k => { if (k === 'escape') { swapTo(showTitle); return true; } return false; };
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
