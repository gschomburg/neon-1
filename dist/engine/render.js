// NeoN+1 engine/render.js: The render loop and small helpers.
'use strict';
NEON_FILES.push(['engine/render.js', 'v13.92']);

// ---------------- Render loop ----------------
let last = performance.now(), lastRunSave = 0;
function frame(now) {
  // One frame. An error in it is logged (once a second at most) and the loop goes on: before, one bad frame stopped
  // drawing for good and left the screen black.
  try { frameBody(now); } catch (e) { if (now - (frame.errAt || 0) > 1000) { frame.errAt = now; console.error('[neon] frame error:', e); } }
  requestAnimationFrame(frame);
}
function frameBody(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  updateParts(dt);
  updateTimer(dt);
  layerTick(now);
  eaterWatch();   // ICE EATER: a layer with no ICE left clears
  coinTick(now);  // COIN FLIP: a held press brings the coin up
  g0dpTick(now, dt);   // the G0D prototype (engine/g0dproto.js; the editor's g0d tab)
  g0dWakeTick(now);   // H3AV3N: G0D wakes up (engine/heaven.js)
  g0dFakeTick(now);   // H3AV3N: the fake win
  g0dEndTick(now);   // H3AV3N: the collapse
  stepPaletteFade(now);
  if (st.mp) { mpWatchdog(now); mpClockTick(now); }
  mpTabTitle(now);
  if (st.wipe && st.wipe.endsAt && now > st.wipe.endsAt) st.wipe = null;
  if (st.run && now - lastRunSave > 2000) { lastRunSave = now; saveRun(); }   // resume after a reload
  st.fieldRect = null;
  render(now);
  Field.sync();
  Music.focus(st.mode === 'play' && st.lv && st.lv.focus != null && !st.pause && !st.bossIntro && !st.wipe ? st.lv.focus : null);
  { const ta = dragCorp() ? 'none' : ''; if (cv.style.touchAction !== ta) cv.style.touchAction = ta; }   // drags don't scroll the page
}

function render(now) {
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = C.bg;
  g.fillRect(0, 0, W, H);
  const sk = (now - shakeFx.t0) / 1000;
  if (sk < shakeFx.dur) {
    const a = shakeFx.amp * (1 - sk / shakeFx.dur);
    g.translate(rand(-a, a), rand(-a, a));
  }
  st.flipNow = flipNow();
  if (st.flipNow) { g.translate(W, H); g.rotate(Math.PI); }   // UPSIDE
  hits = [];
  const cells = buildScene(now, true);
  const cipher = cipherNow(now);   // CIPHER: letters become symbols
  if (cipher) for (const c of cells) c.ch = cipher(c.ch);
  for (const b of bgs) {
    g.globalAlpha = b.alpha;
    g.fillStyle = b.col;
    g.fillRect(L.ox + b.cx * L.cw, L.oy + b.cy * L.chh, b.w * L.cw, L.chh);
  }
  g.globalAlpha = 1;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (const bold of [false, true]) {
    g.font = `${bold ? DRAW_FONT.bold : DRAW_FONT.weight} ${L.fs * DRAW_FONT.scale}px ${DRAW_FONT.family}`;
    for (const c of cells) {
      if (!!c.bold !== bold) continue;
      g.fillStyle = c.col;
      if (c.r180) { g.save(); g.translate(pxX(c.cx), pxY(c.cy)); g.rotate(Math.PI); g.fillText(c.ch, 0, 0); g.restore(); }
      else if (c.sc && c.sc !== 1) { g.save(); g.translate(pxX(c.cx), pxY(c.cy)); g.scale(c.sc, c.sc); g.fillText(c.ch, 0, 0); g.restore(); }   // a pop (HUD integrity)
      else g.fillText(c.ch, pxX(c.cx), pxY(c.cy));
    }
  }
  g.font = `${DRAW_FONT.weight} ${L.fs * DRAW_FONT.scale}px ${DRAW_FONT.family}`;
  for (const p of parts) {
    if (p.t < 0) continue;
    g.globalAlpha = Math.max(0, p.alpha);
    g.fillStyle = p.col;
    const pch = cipher ? cipher(p.ch) : p.ch;
    if (p.rot) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillText(pch, 0, 0); g.restore(); }
    else g.fillText(pch, p.x, p.y);
  }
  g.globalAlpha = 1;
  if (st.tut) drawTutorial(now);   // the training run's popup (POPS), over everything
  const fk = (now - flashFx.t0) / 1000;
  if (fk < flashFx.dur) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalAlpha = flashFx.a * (1 - fk / flashFx.dur);
    g.fillStyle = flashFx.col;
    g.fillRect(0, 0, W, H);
    g.globalAlpha = 1;
  }
}

// ---------------- Helpers ----------------
const wait = ms => new Promise(r => setTimeout(r, ms));
// A message remembers which color slot it used (danger, accent...), not just the color, so it follows
// palette changes: a corp's colors fading in, or edits in the palette editor.
const slotOf = col => Object.keys(C).find(k => C[k] === col) || (paletteFade && Object.keys(paletteFade.to).find(k => paletteFade.to[k] === col)) || null;
function setMsg(msg, col = C.text, ink = null) { st.msg = msg; st.msgCol = col; st.msgSlot = slotOf(col); st.msgInk = ink; st.msgT = performance.now(); st.msgChat = null; }   // ink: the text color on the band (a hacker's own)
const candidates = () => st.lv ? st.lv.tiles.filter(t => t.state === 'closed' && !t.loaded && !t.ruledOut) : [];

function availableNodes() {
  const run = st.run;
  if (!run) return [];
  // Dev "free travel": every node except the one you're on.
  if (st.freeTravel) return Object.keys(run.map).filter(id => id !== run.at && id !== '0:1');
  // Links out of where you are, minus stops you've been to (sideways links go both ways).
  if (!run.at) return ['0:1'];
  const cur = run.map[run.at], out = new Set(cur.next);
  // map gear: TUNNEL (any node in your row), MESH (every node in the next row, all sector), aimed WARP (anything ahead)
  if (run.tunnel) for (const n of rowMates()) out.add(n.id);
  if (run.mesh === run.sector) for (const n of Object.values(run.map)) if (n.step === cur.step + 1 && (n.sector || 0) === run.sector) out.add(n.id);
  if (run.mesh === run.sector) for (const n of meshSides()) out.add(n.id);   // the row under the boss: the nodes beside you too
  if (run.warpAim) for (const n of nodesAhead()) out.add(n.id);
  if (run.skipAim) for (const n of skipTargets()) out.add(n.id);   // SKIP: two rows ahead
  return [...out].filter(id => !run.visited.includes(id));
}

function showBoard(mode) {
  st.mode = mode;
  st.selItem = -1; st.selMod = -1;
  st.kbFocus = null; st.keyHandler = null; st.scroll = null;
  st.hideBoard = false; st.hideAll = false;
  computeLayout();
  wipeIn();
}

// Wipe the board out, then open the next screen (which wipes in).
async function swapTo(openFn, level = 0) {
  if (st.transitioning) return;
  st.transitioning = true;
  Sound.ui();
  await wipeOut(level);
  st.transitioning = false;
  openFn();
}
