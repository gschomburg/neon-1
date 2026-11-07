// NeoN+1 engine/render.js: The render loop and small helpers.
'use strict';
NEON_FILES.push(['engine/render.js', 'v14.54']);

// ---------------- Popup looks (the user, 2026-10-31) ----------------
// Every popup-style box fills its background through popupBg(kind): its look is set here, in one place. A new popup
// type: add it to POPUP_LOOK (and to the table in docs/SPEC.md, "Popup looks").
//   quest: a dark purple: the palette's REP color, POPUP_TINT of the way into its background (it follows the palette)
//   plain: the palette's background color (not black: brown on PARCELNET, pink on MOCHI...)
// (The training's POPS popup and the ads draw their own styles; the ads still fill through here, plain.)
const POPUP_LOOK = { call: 'quest', feat: 'quest', scene: 'quest', hacker: 'plain', event: 'plain', ad: 'plain' };
const POPUP_TINT = 0.16;
const HEX6 = /^#[0-9a-f]{6}$/i;
function popupCol(kind) {
  if ((POPUP_LOOK[kind] || 'plain') !== 'quest' || !HEX6.test(C.bg) || !HEX6.test(C.rep)) return C.bg;
  return moldMix(C.bg, C.rep, POPUP_TINT);
}
// A popup's box (cells): solid, with half-row overlaps so no hairlines show between the rows. A framed box (border, the
// default) keeps its frame on the palette's background and its look inside it (the user, 2026-10-31); border: false
// fills it all (the quest scenes: the whole screen, no frame).
function popupBg(bg, kind, x0, y0, w, h, border = true) {
  const fill = (x, y, ww, hh, col) => { for (let r = 0; r < hh; r++) { bg(x, y + r, ww, col, 1); if (r < hh - 1) bg(x, y + r + 0.5, ww, col, 1); } };
  const col = popupCol(kind);
  if (!border || col === C.bg || w < 3 || h < 3) return fill(x0, y0, w, h, col);
  fill(x0, y0, w, h, C.bg);
  fill(x0 + 1, y0 + 1, w - 2, h - 2, col);
}

// ---------------- Render loop ----------------
let last = performance.now(), lastRunSave = 0;
function frame(now) {
  // One frame. An error in it is logged (once a second at most) and the loop goes on: before, one bad frame stopped
  // drawing for good and left the screen black.
  try { if (TABS.away) drawTabsAway(); else frameBody(now); } catch (e) { if (now - (frame.errAt || 0) > 1000) { frame.errAt = now; console.error('[neon] frame error:', e); } }
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
  g0dfTick(now, dt);   // the G0D prototype (engine/g0dfight.js; the editor's g0d tab)
  g0dFakeTick(now);   // H3AV3N: the fake win
  g0dVoiceTick(now);   // H3AV3N: G0D's lines make his voice as they type
  g0dEndTick(now);   // H3AV3N: the collapse
  g0dDieTick(now);   // H3AV3N: G0D dies
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
  for (const c of cells) if (c.piece) drawPiece(c);   // big letters, a piece per cell (the WORKBENCH: engine/bench.js)
  for (const bold of [false, true]) {
    g.font = `${bold ? DRAW_FONT.bold : DRAW_FONT.weight} ${L.fs * DRAW_FONT.scale}px ${DRAW_FONT.family}`;
    for (const c of cells) {
      if (!!c.bold !== bold || c.piece) continue;
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
    if (p.bg) { g.save(); g.translate(p.x, p.y); if (p.rot) g.rotate(p.rot); g.fillStyle = p.bg; g.fillRect(-L.cw / 2, -L.chh / 2, L.cw, L.chh); g.fillStyle = p.col; g.fillText(pch, 0, 0); g.restore(); }   // a whole cell (its background too)
    else if (p.rot) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillText(pch, 0, 0); g.restore(); }
    else g.fillText(pch, p.x, p.y);
  }
  g.globalAlpha = 1;
  if (st.bench) benchKeys(now);   // the WORKBENCH keyboard: its own layer, over the bottom of the screen
  if (st.tut) drawTutorial(now);   // the training run's popup (POPS), over everything
  if (st.hint) drawHint(now);   // a hint in a normal run (b0y's [b]: engine/tutorial.js showHint)
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

// BOX OF WIRES (data/mods.js wires): nothing at all until exotic (Greg, 2026-11-07: "you go from scrap all the way up to
// exotic to get it to function"). Exotic: every node in every sector is open for the rest of the run, the boss too.
const WIRES_EXO = 5;   // (its tiers: scrap, common, rare, epic, legendary, exotic)
const wiresOpen = () => !!st.run && has('wires') && modTier('wires') >= WIRES_EXO;
function wiresUp(was) {   // it went up a step (engine/panels.js addMod)
  if (modTier('wires') >= WIRES_EXO && was < WIRES_EXO) setTimeout(() => setMsg('> box of wires: it all connects. the whole net is wired: any node, any order.', C.accent), 400);
}
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
  if (run.warpAim) for (const n of warpTargets()) out.add(n.id);   // (anywhere you haven't been, behind you too)
  if (run.skipAim) for (const n of skipTargets()) out.add(n.id);   // SKIP: two rows ahead
  if (wiresOpen()) for (const n of Object.values(run.map)) if ((n.sector || 0) === (run.sector || 0) && n.id !== run.at) out.add(n.id);   // BOX OF WIRES
  let ids = [...out].filter(id => !run.visited.includes(id));
  // a pocket (WARP landed you where every way on is explored): any of the ways up, the next row with somewhere new
  if (!ids.length && cur.type !== 'final') for (let s = cur.step + 1; s < SECTOR_STEPS * (run.sector + 1) + 1 && !ids.length; s++)
    ids = Object.values(run.map).filter(n => n.step === s && (n.sector || 0) === (run.sector || 0) && !run.visited.includes(n.id)).map(n => n.id);
  return ids;
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
