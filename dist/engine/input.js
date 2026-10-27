// NeoN+1 engine/input.js: Pause, the keyboard cursor, pointer and keyboard input.
'use strict';
NEON_FILES.push(['engine/input.js', 'v13.46']);

// ---------------- Pause menu ----------------
// the NeoN+1 name in the header or Esc during a run. Stops clocks. Abandon goes to the title.
function togglePause() {
  if (st.dev) return;
  if (!st.pause && (!st.run || st.busy || st.transitioning || st.wipe)) { Sound.deny(); return; }
  st.pause = !st.pause;
  st.abandonArmed = false;
  st.kbFocus = null;
  st.boardStart = performance.now();
  Sound.ui();
}

const toggleEffects = () => { save.effects = save.effects === 'full' ? 'reduced' : 'full'; persist(); Sound.ui(); };
const toggleTapMode = () => { save.tapMode = save.tapMode === 'two' ? 'one' : 'two'; persist(); Sound.ui(); };

// Audio controls (settings + pause menu): on/off and an 8-step volume bar each.
const toggleMusic = () => { save.musicOn = !save.musicOn; persist(); Sound.levels(); Sound.ui(); };
const nudgeVol = (k, d) => { save[k] = clamp(Math.round((save[k] + d) * 8) / 8, 0, 1); persist(); Sound.levels(); Sound.ui(); };
const volBar = v => '#'.repeat(Math.round(v * 8)) + '-'.repeat(8 - Math.round(v * 8));
function audioLines(X, prefix) {
  X({ text: `[ music: ${save.musicOn ? 'ON ' : 'OFF'} ]`, id: prefix + 'mus', onTap: toggleMusic });
  X({ gap: 1, row: [
    { text: 'vol' }, { text: '[-]', id: prefix + 'mvd', onTap: () => nudgeVol('musicVol', -1 / 8) },
    { text: volBar(save.musicVol), col: save.musicOn ? C.accent : C.dim },
    { text: '[+]', id: prefix + 'mvu', onTap: () => nudgeVol('musicVol', 1 / 8) },
  ] });
  X({ text: `[ effects sound: ${save.muted ? 'OFF' : 'ON '} ]`, id: prefix + 'sfx', onTap: toggleMute });
  X({ gap: 1, row: [
    { text: 'vol' }, { text: '[-]', id: prefix + 'svd', onTap: () => nudgeVol('sfxVol', -1 / 8) },
    { text: volBar(save.sfxVol), col: save.muted ? C.dim : C.accent },
    { text: '[+]', id: prefix + 'svu', onTap: () => nudgeVol('sfxVol', 1 / 8) },
  ] });
}

function pauseLines() {
  const lines = [];
  const T = (text, col = C.text) => lines.push({ text, col });
  const B = (text, id, onTap) => lines.push({ text, id, onTap });
  const run = st.run;
  T('PAUSED', C.accent);
  T(`layer ${pad2(run.depth)}   corps ${run.corps}   cr ${run.credits}`, C.text);
  T(`seed ${run.seed}${run.practice ? '  (practice)' : ''}`, C.mid);
  T('');
  lines.push({ box: true, text: 'R E S U M E', id: 'resume', onTap: togglePause, minW: 22 });
  T('');
  B(`[ palette: ${PALETTES[save.palette].name.padEnd(11)} ]`, 'ppal', cyclePalette);
  B(`[ corp colors: ${save.corpColors ? 'ON ' : 'OFF'} ]`, 'pccol', toggleCorpColors);
  B(`[ effects: ${save.effects === 'full' ? 'FULL   ' : 'REDUCED'} ]`, 'pfx', toggleEffects);
  B(`[ items: ${save.tapMode === 'two' ? 'TAP TWICE' : 'TAP ONCE '} ]`, 'ptap', toggleTapMode);
  audioLines(ln => lines.push(ln), 'p_');
  T('');
  B(st.abandonArmed ? '[ TAP AGAIN TO ABANDON ]' : '[ ABANDON RUN ]', 'abandon', abandonRun);
  T(st.abandonArmed ? 'the run ends here.' : 'abandoned runs are not scored.', st.abandonArmed ? C.danger : C.dim);
  return lines;
}

function abandonRun() {
  if (!st.abandonArmed) { st.abandonArmed = true; Sound.deny(); return; }
  const run = st.run;
  statQuit(run);
  run.ended = true; clearRun();
  if (!run.tutorial) save.history.unshift({ seed: run.seed, depth: run.depth, corps: run.corps, win: false, abandoned: true, practice: run.practice, at: Date.now() });   // (the training run leaves no history)
  save.history = save.history.slice(0, 20);
  persist();
  st.pause = false; st.abandonArmed = false; st.timer = null;
  swapTo(showTitle);
}

// ---------------- Keyboard cursor ----------------
// Buttons and list rows: move through them in reading order.
function moveFocus(d) {
  const list = st.focusables;
  if (!list.length) return;
  let i = list.findIndex(f => f.id === st.kbFocus);
  const edge = i >= 0 && ((d > 0 && i === list.length - 1) || (d < 0 && i === 0)) || (i >= 0 && list[i + d] && /^dev(up|dn)$/.test(list[i + d].id));
  if (st.dev && st.devScroll && edge && st.devScroll(d)) return;
  i = i < 0 ? (d > 0 ? 0 : list.length - 1) : (i + d + list.length) % list.length;
  st.kbFocus = list[i].id;
  st.hoverBtn = st.kbFocus;
  Sound.tick();
}

// Grid: jump to the nearest open tile in the arrow's direction.
function moveTileCursor(k) {
  const lv = st.lv;
  if (st.busy) return;
  const open = lv.tiles.map((t, i) => [t, i]).filter(([t]) => t.state === 'closed');
  if (!open.length) return;
  st.kbGrid = true;
  const cur = lv.tiles[st.hover];
  if (!cur || cur.state !== 'closed') {
    // Start at the tile nearest the middle of the grid.
    const mx = (lv.cols - 1) / 2, my = (lv.rows - 1) / 2;
    open.sort((a, b) => Math.hypot(a[0].col - mx, a[0].row - my) - Math.hypot(b[0].col - mx, b[0].row - my));
    st.hover = open[0][1];
    Sound.tick();
    return;
  }
  const [dx, dy] = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] }[k];
  let best = -1, bestScore = Infinity;
  for (const [t, i] of open) {
    if (t === cur) continue;
    const vx = t.col - cur.col, vy = t.row - cur.row;
    const along = vx * dx + vy * dy;
    if (along <= 0) continue;
    const score = along + Math.abs(vx * dy - vy * dx) * 2;
    if (score < bestScore) { bestScore = score; best = i; }
  }
  if (best >= 0) { st.hover = best; Sound.tick(); }
  if (st.mp && lv.tiles[st.hover]) { const { tx, ty } = tileOrigin(lv.tiles[st.hover]); mpSendCursor(tx + 3, ty + 2); }
}

// Map: step through the nodes you can pick next.
function moveMapCursor(k) {
  const run = st.run;
  const avail = availableNodes().slice().sort((a, b) => run.map[a].lane - run.map[b].lane);
  if (!avail.length) return;
  const mv = st.mapView;
  if (mv && mv.sector !== run.sector) { mv.sector = run.sector; mv.target = sectorViewRow(run.sector); }   // back to where you are
  const d = k === 'arrowleft' || k === 'arrowup' ? -1 : 1;
  const i = avail.indexOf(st.mapSel);
  st.mapSel = avail[i < 0 ? 0 : (i + d + avail.length) % avail.length];
  Sound.ui();
}

// ---------------- Input ----------------
// What the wheel / swipe scrolls: the dev menu while it's open, else the screen.
const activeScroll = () => st.dev ? st.devScroll : st.scroll;

function hitAt(x, y) {
  for (let k = hits.length - 1; k >= 0; k--) {
    const h = hits[k];
    if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h;
  }
  return null;
}

// Older Safari (before iOS 13) has no pointer events: turn touches (and mouse) into the
// pointer events below, so taps, holds and drags work the same.
if (!window.PointerEvent) {
  const fire = (type, x, y, kind, buttons) => {
    const ev = document.createEvent('Event');
    ev.initEvent(type, true, true);
    Object.assign(ev, { clientX: x, clientY: y, pointerType: kind, buttons });
    cv.dispatchEvent(ev);
  };
  let last = null;
  const touch = (type, buttons) => e => {
    const t = e.changedTouches[0];
    if (!t) return;
    e.preventDefault();   // no page scroll / zoom, and no copycat mouse events after
    last = t;
    fire(type, t.clientX, t.clientY, 'touch', buttons);
  };
  cv.addEventListener('touchstart', touch('pointerdown', 1), { passive: false });
  cv.addEventListener('touchmove', touch('pointermove', 1), { passive: false });
  cv.addEventListener('touchend', touch('pointerup', 0), { passive: false });
  cv.addEventListener('touchcancel', () => { if (last) fire('pointercancel', last.clientX, last.clientY, 'touch', 0); });
  cv.addEventListener('mousedown', e => fire('pointerdown', e.clientX, e.clientY, 'mouse', 1));
  cv.addEventListener('mousemove', e => fire('pointermove', e.clientX, e.clientY, 'mouse', e.buttons));
  cv.addEventListener('mouseup', e => fire('pointerup', e.clientX, e.clientY, 'mouse', 0));
}

cv.addEventListener('pointerdown', e => {
  Sound.init();
  Field.blur();   // tapping anywhere else finishes typing (phones don't always do this)
  if (st.boot) { introTap(hitAt(...ptXY(e))); return; }   // the intro: LOGIN, skip ahead, its buttons (engine/intro.js)
  if (st.ad) return adTap(hitAt(...ptXY(e)), performance.now());   // an ad is up: it takes the tap
  if (st.intro) { st.intro.skip = true; return; }   // tap skips a corp intro
  if (st.bossIntro) { st.bossIntro.skip = true; return; }   // ...and a boss entrance
  let h = hitAt(...ptXY(e));
  if (st.tut && st.tut.pop && !st.pause && !st.dev && tutTap(h)) return;   // the training run's popup (POPS)
  if (h && h.kind === 'tile' && upsideMirror()) { const m = hitAt(e.clientX, e.clientY); h = m && m.kind === 'tile' ? m : null; }   // UPSIDE boss
  st.drag = activeScroll() ? { y: e.clientY } : null;
  // Ignore taps during a wipe, except the header buttons.
  if (st.wipe && !(h && (h.id === 'snd' || h.id === 'dev'))) return;
  // While paused, only buttons respond.
  if (st.pause && h && h.kind !== 'btn') return;
  if (!h) {
    if (st.mode === 'map' && !st.dev && !st.pause) st.mapSel = null;
    st.selItem = -1; st.selMod = -1;
    return;
  }
  const oneTap = save.tapMode === 'one';
  if (h.kind === 'tile' && coinOn() && !st.busy && !st.coin) {
    // COIN FLIP: a press waits: a quick tap picks, a hold (or a drag up) brings the coin up
    st.coinPress = { i: h.i, x: e.clientX, y: e.clientY, t0: performance.now() };
    return;
  }
  if (h.kind === 'tile') {
    // drag-to-select corps (DECIBEL, SQUALOR) on touch: a press waits to see if it's a drag.
    // Tapping the selected node confirms it.
    if (dragCorp() && e.pointerType !== 'mouse') {
      if (st.sel === h.i) pick(h.i);
      else st.press = { i: h.i, x: e.clientX, y: e.clientY, moved: false };
    } else pick(h.i);
  }
  else if (h.kind === 'cell') { if (st.corp && st.corp.def.cellTap && st.mode === 'play' && !st.busy) st.corp.def.cellTap(h.cell); }
  else if (h.kind === 'node') selectNode(h.id);
  else if (h.kind === 'item') {
    // Two-tap mode: first tap shows info, second tap uses.
    st.selMod = -1;
    if (oneTap || st.selItem === h.i) useItem(h.i);
    else { st.selItem = h.i; Sound.tick(); }
  } else if (h.kind === 'mod') {
    st.selItem = -1;
    const key = st.run.mods[h.i];
    const active = MODS[key].active;
    if (active && (oneTap || st.selMod === h.i)) activateMod(key);
    else if (st.selMod === h.i) st.selMod = -1;
    else { st.selMod = h.i; Sound.tick(); }
  }
  else if (h.kind === 'btn' && !st.transitioning) h.onTap();
});

cv.addEventListener('pointermove', e => {
  { const [px, py] = ptXY(e); st.ptr = { x: px, y: py }; st.ptrAt = performance.now(); }
  if (st.press && Math.hypot(e.clientX - st.press.x, e.clientY - st.press.y) > 12) st.press.moved = true;
  if (st.coinPress) coinDrag(e);   // COIN FLIP
  if (st.mp) mpSendCursor((e.clientX - L.ox - L.cw / 2) / L.cw, (e.clientY - L.oy - L.chh / 2) / L.chh);
  // Swipe to scroll lists (one entry per row of finger travel).
  if (st.drag && e.buttons && activeScroll()) {
    const dy = e.clientY - st.drag.y;
    if (Math.abs(dy) > L.chh) { activeScroll()(dy < 0 ? 1 : -1); st.drag.y = e.clientY; }
  }
  let h = hitAt(...ptXY(e));
  if (h && st.tut && !tutHoverOk(h)) h = null;   // the training: what you can't tap now doesn't light up
  const tile = h && h.kind === 'tile' ? h.i : -1;
  if (tile !== st.hover && tile >= 0 && !st.busy) Sound.tick();
  st.hover = tile;
  st.kbGrid = false;
  st.kbFocus = null;   // the mouse takes over the cursor
  st.hoverBtn = h && h.kind === 'btn' ? h.id : null;
  st.hoverNode = h && h.kind === 'node' ? h.id : null;
  st.hoverItem = h && h.kind === 'item' ? h.i : -1;
  st.hoverMod = h && h.kind === 'mod' ? h.i : -1;
  cv.style.cursor = h ? 'pointer' : 'default';
});
cv.addEventListener('pointerup', e => {
  st.drag = null;
  if (st.coinPress) {   // COIN FLIP: let go: a quick tap picks, on a side flips, anywhere else skips
    const cp = st.coinPress;
    st.coinPress = null;
    if (!st.coin) return pick(cp.i);
    if (st.coin.side != null) return coinFlip();
    return coinCancel();
  }
  const pr = st.press;
  st.press = null;
  if (!pr) return;
  if (!pr.moved) return pick(pr.i);   // a plain tap
  const h = hitAt(...ptXY(e));   // a drag: lifting selects (a second tap confirms)
  if (h && h.kind === 'tile' && st.mode === 'play' && !st.busy) { st.sel = h.i; Sound.tick(); }
});
cv.addEventListener('pointercancel', () => { st.press = null; if (st.coinPress) { st.coinPress = null; coinCancel(); } });
// COIN FLIP: while held, dragging up opens the coin and picks a side (left / right of the node).
function coinDrag(e) {
  const p = st.coinPress, t = st.lv && st.lv.tiles[p.i];
  if (!t) return;
  const [px, py] = ptXY(e), [sx, sy] = ptXY({ clientX: p.x, clientY: p.y });
  if (!st.coin && Math.abs(py - sy) > 12) coinOpen(p.i);
  const cn = st.coin;
  if (!cn || cn.flipAt) return;
  const c = tileCenter(t), out = cn.below ? py > c.y + L.chh * 2 : py < c.y - L.chh * 2;
  const side = out ? (px < c.x ? 0 : 1) : null;
  if (side !== cn.side) { cn.side = side; if (side != null) Sound.tick(); }
}
// Closing the tab or switching away: save the run now (phones may not come back).
window.addEventListener('pagehide', saveRun);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveRun(); });

cv.addEventListener('wheel', e => {
  const sc = activeScroll();
  if (!sc || st.wipe) return;
  e.preventDefault();
  sc(e.deltaY > 0 ? 1 : -1);
}, { passive: false });

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  Sound.init();
  const k = e.key.toLowerCase();
  const arrow = k.startsWith('arrow');
  if (arrow || k === ' ' || k === 'enter') e.preventDefault();
  if (st.boot && e.key !== '`') { introKey(e.key.toLowerCase()); return; }   // the intro: Enter / Space start and skip, N / L pick
  if (st.ad && e.key !== '`') { e.preventDefault(); return adKey(e.key.toLowerCase(), performance.now()); }   // an ad is up
  if (st.intro && e.key !== '`') { st.intro.skip = true; return; }   // any key skips a corp intro
  if (st.bossIntro && e.key !== '`') { st.bossIntro.skip = true; return; }
  if (e.key === '`') return toggleDev();
  if (st.keyHandler && st.keyHandler.typing && !st.dev && k.length === 1 && st.keyHandler(k)) return;   // typing (leaderboard initials)
  if (k === 'm' && !st.dev) return toggleMute();
  if (k === 'n' && !st.dev) return toggleMusic();
  if (k === 'escape') {
    if (st.dev) return toggleDev();
    if (st.pause) return togglePause();
    if (st.keyHandler && st.keyHandler(k)) return;
    if (st.coin) return coinCancel();   // COIN FLIP: skip the flip
    if (st.run && (st.mode === 'map' || st.mode === 'play' || st.mode === 'panel')) return togglePause();
    return;
  }
  if ((st.transitioning || st.wipe) && !(st.tut && st.tut.curtain)) return;   // (the training's opening is a held wipe: its popups still take keys)
  if (st.tut && st.tut.pop && st.tut.pop.ok && !st.dev && !st.pause) { if (k === 'enter' || k === ' ') tutDismiss(); return; }   // (the curtain: see above)   // the training run's popup
  const overlay = st.dev || st.pause;
  if (!overlay) {
    if (st.keyHandler && st.keyHandler(k)) return;
    if (/^[1-9]$/.test(e.key) && st.run && (st.mode === 'play' || st.mode === 'map')) return useItem(Number(e.key) - 1);
    if (st.mode === 'play' && st.lv) {
      if (st.coin && !st.coin.flipAt) {   // COIN FLIP: left / right picks a side, enter flips
        if (k === 'arrowleft' || k === 'a') { st.coin.side = 0; return Sound.tick(); }
        if (k === 'arrowright' || k === 'd') { st.coin.side = 1; return Sound.tick(); }
        if ((k === 'enter' || k === ' ') && st.coin.side != null) return coinFlip();
        return;
      }
      if (k === 'c' && st.hover >= 0 && coinOn()) return coinOpen(st.hover);
      if (arrow) return moveTileCursor(k);
      if ((k === 'enter' || k === ' ') && st.hover >= 0) return pick(st.hover);
      return;
    }
    if (st.mode === 'map') {
      if (k === 'pageup' || k === 'pagedown') return scrollMapSector(k === 'pageup' ? 1 : -1);
      if (arrow) return moveMapCursor(k);
      if ((k === 'enter' || k === ' ') && st.mapSel) return enterNode(st.run.map[st.mapSel]);
      return;
    }
    if (st.mode === 'over' && k === 'r') return retry();
  }
  // Everything else (title, panels, menus): a cursor over the buttons.
  if (arrow) return moveFocus(k === 'arrowup' || k === 'arrowleft' ? -1 : 1);
  if (k === 'enter' || k === ' ') {
    const f = st.kbFocus && st.focusables.find(x => x.id === st.kbFocus);
    if (f) return f.onTap();
    // Nothing focused yet: the screen's main action.
    if (!overlay && st.mode === 'title') return st.savedRun ? resumeRun() : jackIn();
    if (!overlay && st.mode === 'over') return newRun();
  }
});
