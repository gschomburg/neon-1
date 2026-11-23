// NeoN+1 engine/callouts.js: CALLOUTS, a character's tag over the game pointing at something: POPS's yellow ones in the
// trainings (engine/tutorial.js), b0y's blue hint on the OMNI RAID (showHint). The tag fills in a row at a time with
// their face on its corner, an arrow draws out to the target (which pulses), a small "do this" version sits by the
// message line. Any character's: a callout can bring its own colors (col), face (face: a face's key, a glyph, or rows
// up to 5 x 3) and name (Greg, 2026-11-23). Moved out of engine/tutorial.js (the second audit); the function names kept
// their tut prefix. Loads before engine/tutorial.js.
'use strict';
NEON_FILES.push(['engine/callouts.js', 'v16.01']);

// How a callout looks and moves (POPS's, the default; a callout's own col / face / name go over it)
const CALLOUT = {
  okDelay: 250,              // ms after a popup is fully in before a tap puts it away (no double-tap skips)
  // POPS's popups: a yellow tag over the game (drawn in pixels, off the grid), his face on its corner
  col: { tag: '#ffd84a', ink: '#111111', hint: '#3a3110', shadow: 'rgba(0,0,0,0.55)' },
  style: 'stroke',           // under the tag: 'stroke' (a yellow line along its right and bottom, the user's pick) or 'shadow' (dark, down-right)
  // ms: he pops in, the tag fills in a row at a time (he talks), a gap, the arrow draws out;
  // out: a row folds away per `out` ms, then he pops out; between: a beat before the next popup;
  // mini: the small version (just his face and the "do this" line, up by the message line) slides out
  anim: { pop: 240, line: 60, gap: 80, arrow: 200, out: 25, faceOut: 140, between: 120, mini: 160 },
  face: [" '-, ", '┌@\\@┐', '╯{=╭╰'],   // POPS (the user's, made in asXii); data/art/faces.js has it now (ART_FACES.pops), this is the stand-in
  timerChars: '@Oo.',        // a banter timer's spinners: each one steps through these, then it's gone
  name: 'POPS',
};

// A popup's timeline (ms after it appeared): the tag is full at `fill`, the arrow lands at `land`,
// and the entrance is over at `done`.
function tutTimes(p) {
  const A = CALLOUT.anim;
  if (p.mini) { const fill = A.pop + A.mini; return { fill, land: fill, done: fill }; }
  const n = p.lay ? p.lay.rows.length : 1;
  const fill = A.pop + n * A.line, land = fill + A.gap + A.arrow;
  return { fill, land, done: p.lay && p.lay.arrow ? land + 90 : fill };
}
const tutExitMs = p => (p.mini ? CALLOUT.anim.mini : (p.lay ? p.lay.rows.length : 1) * CALLOUT.anim.out) + CALLOUT.anim.faceOut;
// A tap during the entrance: jump to the whole popup.
function tutSkip(p, now = performance.now()) {
  const d = tutTimes(p).done;
  if (now - p.t0 >= d) return false;
  p.t0 = now - d; p.shownAt = now; p.said = 1e9;
  return true;
}
// Put the popup away: it folds up and he pops out (drawn from T.leaving).
function tutClose(T) {
  const p = T.pop;
  if (p && p.lay) {
    // fold up from where it got to (closed while still coming in: from there, not from the whole tag)
    const A = CALLOUT.anim, t = performance.now() - p.t0;
    if (!p.mini) p.exitFrom = clamp(Math.floor((t - A.pop) / A.line) + 1, 0, p.lay.rows.length);
    T.leaving = { pop: p, t0: performance.now() };
  }
  T.pop = null;
}

// ---- drawing: the popup, and what it points at
function tutRect(tg, cells) {
  if (!tg) return null;
  if (tg.tile != null) { const t = st.lv && st.lv.tiles[tg.tile]; if (!t || t.hidden) return null; const { tx, ty } = tileOrigin(t); return { x: tx, y: ty, w: TILE_W, h: TILE_H }; }
  if (tg.hud != null) {   // the right half of a HUD row (integrity on row 2, credits on row 3)
    const cs = cells.filter(c => c.own === 'hud' && Math.round(c.cy) === tg.hud && c.cx >= L.wc / 2);
    if (!cs.length) return null;
    const x0 = Math.min(...cs.map(c => c.cx)), x1 = Math.max(...cs.map(c => c.cx));
    return { x: x0, y: tg.hud, w: x1 - x0 + 1, h: 1 };
  }
  if (tg.text && tg.btn) {
    const h = hits.find(h => h.cr && h.kind === 'btn' && h.id === tg.btn);
    if (!h) return tg.found || null;
    const y = h.cr[1], row = Array(L.wc).fill(' ');
    for (const c of cells) if (Math.round(c.cy) === y && c.cx >= 0 && c.cx < L.wc && c.ch) row[Math.round(c.cx)] = c.ch;
    const i = row.join('').indexOf(tg.text);
    if (i >= 0) tg.found = { x: i, y, w: tg.text.length, h: 1 };
    return tg.found || { x: h.cr[0], y, w: h.cr[2], h: 1 };
  }
  if (tg.msg) return st.msg ? { x: 0, y: 6, w: Math.min(L.wc, st.msg.length), h: 1 } : null;   // the terminal line
  if (tg.spot != null) {   // any map spot, tappable or not (mapview.js notes where each was drawn)
    const s = st.mode === 'map' && st.tut && st.tut.spots[tg.spot];
    return s ? { x: s[0], y: s[1], w: 3, h: 1 } : null;
  }
  const h = hits.find(h => h.cr && (tg.btn != null ? h.kind === 'btn' && h.id === tg.btn : tg.item != null ? h.kind === 'item' && h.i === tg.item : tg.mod != null ? h.kind === 'mod' && h.i === tg.mod : tg.node != null ? h.kind === 'node' && h.id === tg.node : false));
  return h ? { x: h.cr[0], y: h.cr[1], w: h.cr[2], h: h.cr[3] } : null;
}
// The scene pass: lay the popup out (in pixels), make its target pulse, and keep taps on the tag
// from reaching the game. The tag itself is drawn by drawTutorial, after the grid.
function buildTutorial(ctx, now, under) {
  const T = st.tut, p = T && T.pop;
  if (!T || !tutOn()) return;
  // the header row (NeoN+1, the menu, [LEAVE >]): drawn again on top of the popups. Copied every frame, its tints too
  // (hover, chips), so it never sits frozen while the live one moves (the flicker between popups: audit 2026-11-23)
  T.head = under.filter(c => Math.round(c.cy) === 0 && c.ch && c.ch !== ' ');
  T.headBg = (st.frameBgs || []).filter(b => Math.round(b.cy) === 0);
  if (!p) return;
  // its target for a frame gone (a blink, a list redrawn): keep the last place, not a jump to the middle
  let r = tutRect(p.target, under);
  if (r) p.lastR = r; else if (p.target && p.lastR) r = p.lastR;
  p.lay = p.mini ? tutMiniLayout(p, r, under) : tutLayout(p, r);
  // the target pulses (scales up and down around its middle) once the arrow has landed: nodes and the HUD; anything
  // else that asks for it (target.pulse: the deck's sockets, the bench's tabs: meat notes 2026-11-23). A pulse target's
  // background tints scale with it (engine/render.js draws a bg's h), so its letters stay on their chips.
  const t = now - p.t0, land = tutTimes(p).land;
  if (r && t >= land && (p.target.tile != null || p.target.hud != null || p.target.pulse)) {
    const s = 1 + (p.target.pulse ? 0.09 : 0.045) * (1 - Math.cos((t - land) / 1100 * Math.PI * 2));
    const mx = r.x + (r.w - 1) / 2, my = r.y + (r.h - 1) / 2;
    const inR = (x, y) => x >= r.x - 0.01 && x <= r.x + r.w - 0.99 && y >= r.y - 0.01 && y <= r.y + r.h - 0.99;
    for (const c of under) {
      if (!inR(c.cx, c.cy)) continue;
      c.cx = mx + (c.cx - mx) * s; c.cy = my + (c.cy - my) * s; c.sc = (c.sc || 1) * s;
    }
    if (p.target.pulse) for (const b of st.frameBgs || []) {   // (bg x / y are a cell's edge; a cell's middle is +0.5)
      if (b.h || !inR(b.cx, b.cy) || b.cx + b.w > r.x + r.w + 0.01) continue;
      b.cx = mx + 0.5 + (b.cx - mx - 0.5) * s; b.cy = my + 0.5 + (b.cy - my - 0.5) * s; b.w *= s; b.h = s;
    }
  }
  const l = p.lay;
  if (!p.ok) ctx.addHit((l.x - L.ox) / L.cw, (l.y - L.oy) / L.chh, l.W / L.cw, l.H / L.chh, { kind: 'tutbox' });   // the tag doesn't pass taps through
}

// His face chip's size (it's drawn centered on a point).
const tutFace = k => { const fs = 9 * k; return { fs, w: 5 * 0.6 * fs + 10 * k, h: 3 * 1.12 * fs + 8 * k }; };

// The tag's layout in pixels: centered on the screen, above or below its target, with an arrow
// at about 45 degrees from the tag's edge to the target's nearest corner.
function tutLayout(p, r) {
  const k = L.fs / 12, cw = L.cw, ch = L.chh;
  const W = Math.min(27, L.wc - 4) * cw, pad = 10 * k, bodyFs = 11.5 * k, lh = bodyFs * 1.4;
  g.font = `400 ${bodyFs}px ${FONT}`;
  const cols = Math.max(10, Math.floor((W - 2 * pad) / g.measureText('M').width));
  const rows = [{ kind: 'name', h: 19 * k }];
  if (p.text) for (const para of p.text.split('\n')) {
    if (!para) rows.push({ kind: 'blank', h: lh });
    else for (const t of wrapText(para, cols)) rows.push({ kind: 'body', text: t, h: lh });
  }
  if (p.act) wrapText('> ' + p.act, cols - 2).forEach((t, i) => rows.push({ kind: 'act', text: t, h: lh + (i === 0 && p.text ? 6 * k : 0) }));
  if (p.ok) rows.push({ kind: 'hint', h: 17 * k });   // TAP >
  const H = pad + rows.reduce((a, b) => a + b.h, 0) + 8 * k;
  const scrW = L.wc * cw, x = L.ox + (scrW - W) / 2;
  const scrTop = L.oy, scrBot = L.oy + L.hc * ch, boardTop = L.oy + BOARD_Y * ch, boardBot = L.oy + (BOARD_Y + L.gh) * ch;
  let y, arrow = null;
  if (r) {
    const R = { l: L.ox + r.x * cw - 5 * k, t: L.oy + r.y * ch - 4 * k, r: L.ox + (r.x + r.w) * cw + 5 * k, b: L.oy + (r.y + r.h) * ch + 4 * k };
    const left = (R.l + R.r) / 2 < L.ox + scrW / 2, d = 3 * ch;
    let side = p.at === 'top' || p.at === 'above' ? 'above' : p.at === 'low' || p.at === 'below' ? 'below'
      : (R.t + R.b) / 2 > (scrTop + scrBot) / 2 ? 'above' : 'below';
    if (side === 'above' && p.at !== 'top' && R.t - 14 * k - H < scrTop) side = 'below';
    else if (side === 'below' && p.at !== 'low' && R.b + 14 * k + H > scrBot) side = 'above';
    const wide = R.r - R.l > scrW / 3, ex = wide ? (R.l + R.r) / 2 : left ? R.r + 3 * k : R.l - 3 * k;
    if (side === 'above') {
      y = clamp(p.at === 'top' ? Math.min(boardTop, R.t - d - H) : R.t - d - H, scrTop, scrBot - H);   // 'top': up there, but leave the arrow room
      const ey = R.t - (wide ? 4 : 3) * k, sy = y + H, kk = ey - sy;
      if (kk > 10 * k) arrow = { sx: clamp(ex + (left ? kk : -kk), x + 16 * k, x + W - 16 * k), sy, ex, ey };
      // the stroke style: the arrow comes out of the stroke line under the tag, not the tag's edge
      const o = 4.75 * k;
      if (arrow && CALLOUT.style === 'stroke' && kk > 10 * k + o) { arrow.sx += (arrow.ex - arrow.sx) / (arrow.ey - arrow.sy) * o; arrow.sy += o; }
    } else {
      y = clamp(p.at === 'low' ? Math.max(boardBot - H, R.b + d) : R.b + d, scrTop, scrBot - H);
      const ey = R.b + (wide ? 4 : 3) * k, sy = y, kk = sy - ey;
      if (kk > 10 * k) arrow = { sx: clamp(ex + (left ? kk : -kk), x + 56 * k, x + W - 16 * k), sy, ex, ey };   // clear of his face
    }
  } else y = p.at === 'top' ? boardTop : p.at === 'low' ? boardBot - H : (scrTop + scrBot - H) / 2;
  return { x, y, W, H, rows, k, pad, bodyFs, lh, arrow: p.noArrow ? null : arrow };
}
// The small version: his face at the left of the message line (row 6, between the HUD and the board)
// and the "do this" line beside it. x / y / W / H cover both (the tap area).
function tutMiniLayout(p, r, cells = []) {
  const k = L.fs / 12, F = tutFace(k), fs = 11.5 * k, ph = fs * 1.7;
  g.font = `800 ${fs}px ${FONT}`;
  // where: the message line (row 6); near 'below': the row under its target; near 'right': beside it
  // (below: the first row under it where he and his line fit without covering anything)
  const used = (y0, y1, x1) => cells.some(c => c.ch && c.ch !== ' ' && c.cy >= y0 - 0.5 && c.cy <= y1 + 0.5 && c.cx < x1);
  const span = Math.ceil((F.h + 6 * k) / L.chh / 2), wCells = 6 + p.act.length + 4;
  let below = r ? r.y + r.h + 1 : 6;
  const end = st.bench && st.bench.kb.up ? Math.floor((benchKbGeom().top - L.oy) / L.chh) - span : L.hc - span - 1;   // (the WORKBENCH keyboard is pixels, not cells: stay above it)
  if (r && p.near === 'below') for (let y = r.y + r.h + span; y < end; y++) if (!used(y - span, y + span, wCells)) { below = y; break; }
  const row = r && p.near === 'below' ? below : r && p.near === 'right' ? r.y - 1 : 6;   // (right: a row above, clear of the item's description under it)
  const label = '> ' + p.act, cy = L.oy + (row + 0.5) * L.chh;
  const fx = r && p.near === 'right' ? L.ox + (r.x + r.w + 1) * L.cw : L.ox + 3 * k, px = fx + F.w + 10 * k, pw = g.measureText(label).width + 20 * k;
  return { mini: true, msgRow: row === 6, k, fs, label, rows: [], fx, fy: cy - F.h / 2, pill: { x: px, y: cy - ph / 2, w: pw, h: ph },
    x: fx - 3 * k, y: cy - F.h / 2 - 3 * k, W: px + pw - fx + 3 * k, H: F.h + 6 * k };
}

// Drawn last, over the whole frame (engine/render.js): the popup coming in, and the last one leaving.
function drawTutorial(now) {
  const T = st.tut;
  if (!T) return;
  const dt = T.lastNow ? Math.min(250, now - T.lastNow) : 0;
  T.lastNow = now;
  if (menuCover() || st.ad || (st.wipe && !(T.pop && T.pop.mini) && !T.curtain) || !tutOn()) { if (T.pop) T.pop.t0 += dt; T.leaving = null; return; }
  if (T.leaving) {
    const te = now - T.leaving.t0;
    if (te > tutExitMs(T.leaving.pop)) T.leaving = null;
    else drawTutPop(T, T.leaving.pop, now, te);
  }
  if (T.pop && T.pop.lay) drawTutPop(T, T.pop, now, -1);
  // the header row stays on top of the popups, on a solid background (the menu has to stay reachable and readable)
  if (T.head && (T.pop || T.leaving)) {
    g.save();
    g.fillStyle = C.bg; g.fillRect(L.ox, L.oy, L.wc * L.cw, L.chh);
    for (const b of T.headBg || []) { g.globalAlpha = b.alpha; g.fillStyle = b.col; g.fillRect(L.ox + b.cx * L.cw, L.oy + b.cy * L.chh, b.w * L.cw, (b.h || 1) * L.chh); }
    g.globalAlpha = 1;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const c of T.head) { g.font = `${c.bold ? DRAW_FONT.bold : DRAW_FONT.weight} ${L.fs * DRAW_FONT.scale}px ${DRAW_FONT.family}`; g.fillStyle = c.col; g.fillText(c.ch, pxX(c.cx), pxY(c.cy)); }
    g.restore();
  }
}
// The yellow under-layer and fill: a dark drop shadow, or a yellow line along the right and bottom.
// (col: a popup's own colors, like CALLOUT.col: b0y's hint in his blue, showHint below)
function tutBack(x, y, w, h, k, col = CALLOUT.col) {
  const o = 4 * k;
  if (CALLOUT.style === 'stroke') {
    g.strokeStyle = col.tag; g.lineWidth = 1.5 * k; g.lineJoin = 'miter';
    g.beginPath(); g.moveTo(x + w, y + o); g.lineTo(x + w + o, y + o); g.lineTo(x + w + o, y + h + o); g.lineTo(x + o, y + h + o); g.lineTo(x + o, y + h); g.stroke();
  } else { g.fillStyle = col.shadow; g.fillRect(x + o, y + o, w, h); }
  g.fillStyle = col.tag; g.fillRect(x, y, w, h);
}
// The face's art: an ART_FACES key ('pops', 'b0y'), a face or glyph object ({ art }), or rows (up to 5 x 3: a glyph's
// size). Unknown: POPS's stand-in.
const calloutArt = face => Array.isArray(face) ? face : face && face.art ? face.art : (typeof ART_FACES !== 'undefined' && ART_FACES[face] && ART_FACES[face].art) || CALLOUT.face;
// His face: a dark chip with a yellow line and a dark gap outside it, centered on (cx, cy).
function tutDrawFace(cx, cy, s, k, col = CALLOUT.col, face = 'pops') {
  if (s <= 0) return;
  const F = tutFace(k);
  g.save();
  g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = col.ink; g.fillRect(-F.w / 2 - 3 * k, -F.h / 2 - 3 * k, F.w + 6 * k, F.h + 6 * k);
  g.fillStyle = col.tag; g.fillRect(-F.w / 2 - 1 * k, -F.h / 2 - 1 * k, F.w + 2 * k, F.h + 2 * k);
  g.fillStyle = col.ink; g.fillRect(-F.w / 2, -F.h / 2, F.w, F.h);
  g.font = `400 ${F.fs}px ${FONT}`; g.fillStyle = col.tag; g.textAlign = 'center'; g.textBaseline = 'middle';
  calloutArt(face).forEach((ln, i) => g.fillText(ln, 0, (i - 1) * 1.12 * F.fs));
  g.restore();
}
const tutPopIn = u => (u < 0.6 ? 1.25 * (u / 0.6) : 1.25 - 0.25 * (u - 0.6) / 0.4);   // his pop: overshoot, settle

function drawTutPop(T, p, now, te) {
  const l = p.lay, A = CALLOUT.anim, col = p.col || CALLOUT.col, k = l.k, out = te >= 0;   // (p.col, p.face, p.name: a hint's own: showHint)
  const t = now - p.t0;
  const nud = !out && T.nudge && now - T.nudge < 300 ? Math.sin((now - T.nudge) / 25) * 4 * k : 0;   // a wrong tap: it shakes
  g.save();
  g.textBaseline = 'middle';
  if (l.mini) {
    // the small version: his face pops in, then the line slides out beside it
    let faceS = 1, u = 1;
    if (!out) {
      if (t < A.pop) faceS = tutPopIn(Math.max(0, t / A.pop));
      u = clamp((t - A.pop) / A.mini, 0, 1);
      if (u > 0 && !p.said) { Sound.talk(); p.said = 1; }
    } else {
      u = Math.max(0, 1 - te / A.mini);
      faceS = Math.max(0, 1 - Math.max(0, te - A.mini) / A.faceOut);
    }
    const altOn = p.alt && now < p.altUntil, label = altOn ? p.alt : l.label;
    g.font = `800 ${l.fs}px ${FONT}`;
    const P = l.pill, w = (g.measureText(label).width + 20 * k) * (1 - (1 - u) * (1 - u));
    const bob = p.altT && now - p.altT < 450 ? -3 * k * Math.abs(Math.sin(Math.PI * (now - p.altT) / 150)) : 0;
    // a clean patch of background under him and the line (no half-covered HUD text peeking out)
    const F0 = tutFace(k), back = Math.min(1, faceS) * (out ? u || faceS : 1);
    if (back > 0) {
      g.globalAlpha = back; g.fillStyle = C.bg;
      g.fillRect(l.x - 4 * k + nud, l.y - 2 * k, Math.max(F0.w + 12 * k, P.x + w - l.x + 10 * k), l.H + 4 * k);
      if (l.msgRow) g.fillRect(P.x, L.oy + 6 * L.chh, (L.ox + L.wc * L.cw - P.x) * Math.min(1, u * 1.5), L.chh);   // the rest of the message line: his line replaces it
      g.globalAlpha = 1;
    }
    if (w > 1) {
      tutBack(P.x + nud, P.y, w, P.h, k, col);
      g.save(); g.beginPath(); g.rect(P.x + nud, P.y, w, P.h); g.clip();
      g.font = `800 ${l.fs}px ${FONT}`; g.fillStyle = col.ink; g.textAlign = 'left';
      g.fillText(label, P.x + nud + 10 * k, P.y + P.h / 2);
      g.restore();
    }
    const F = tutFace(k);
    tutDrawFace(l.fx + F.w / 2 + nud, l.fy + F.h / 2 + bob, faceS, k, col, p.face);
    g.restore();
    return;
  }
  const n = l.rows.length, arrowAt = A.pop + n * A.line + A.gap;
  let shown, faceS = 1, faceDy = 0, arrowP = 1, headS = 1, arrowA = 1;
  if (!out) {
    shown = clamp(Math.floor((t - A.pop) / A.line) + 1, 0, n);
    if (t < A.pop) faceS = tutPopIn(Math.max(0, t / A.pop));
    if (t >= A.pop && shown < n) faceDy = -3 * k * Math.abs(Math.sin(Math.PI * (t - A.pop) / 150));   // talking
    if (shown > (p.said || 0)) { if (shown > 1) Sound.talk(); p.said = shown; }
    const u = clamp((t - arrowAt) / A.arrow, 0, 1);
    arrowP = 1 - (1 - u) * (1 - u);
    headS = clamp((t - arrowAt - A.arrow) / 90, 0, 1);
  } else {
    const from = p.exitFrom != null ? p.exitFrom : n;
    shown = clamp(from - Math.floor(te / A.out), 0, from);
    faceS = (p.exitFrom === 0 && t < A.pop ? tutPopIn(Math.max(0, t / A.pop)) : 1) * Math.max(0, 1 - Math.max(0, te - from * A.out) / A.faceOut);
    arrowA = Math.max(0, 1 - te / 100);
  }
  const x = l.x + nud, y = l.y;
  // the arrow, under the tag so it starts cleanly at the tag's edge
  const a = l.arrow;
  if (a && arrowP > 0 && arrowA > 0) {
    g.globalAlpha = arrowA;
    g.strokeStyle = col.tag; g.lineWidth = 2 * k; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(a.sx, a.sy); g.lineTo(a.sx + (a.ex - a.sx) * arrowP, a.sy + (a.ey - a.sy) * arrowP); g.stroke();
    if (headS > 0) {   // an open head: two strokes at a square corner
      const ang = Math.atan2(a.ey - a.sy, a.ex - a.sx), hl = 9.6 * k * headS;
      g.beginPath();
      g.moveTo(a.ex - Math.cos(ang - Math.PI / 4) * hl, a.ey - Math.sin(ang - Math.PI / 4) * hl);
      g.lineTo(a.ex, a.ey);
      g.lineTo(a.ex - Math.cos(ang + Math.PI / 4) * hl, a.ey - Math.sin(ang + Math.PI / 4) * hl);
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  // the tag, filled in down to the last row shown
  if (shown > 0) {
    let hgt = l.pad;
    for (let i = 0; i < shown; i++) hgt += l.rows[i].h;
    if (shown === n) hgt = l.H;
    tutBack(x, y, l.W, hgt, k, col);
    const spaced = 'letterSpacing' in g;
    let ry = y + l.pad;
    for (let i = 0; i < shown; i++) {
      const row = l.rows[i];
      if (row.kind === 'name') {
        g.font = `800 ${10 * k}px ${FONT}`; g.fillStyle = col.ink; g.textAlign = 'left';
        if (spaced) g.letterSpacing = `${1.6 * k}px`;
        g.fillText(p.name || CALLOUT.name, x + 44 * k, ry + 6 * k);
        if (spaced) g.letterSpacing = '0px';
      } else if (row.kind === 'body') {
        g.font = `400 ${l.bodyFs}px ${FONT}`; g.fillStyle = col.ink; g.textAlign = 'left';
        g.fillText(row.text, x + l.pad, ry + l.lh / 2);
      } else if (row.kind === 'act') {
        const top = ry + row.h - l.lh;
        g.font = `800 ${l.bodyFs}px ${FONT}`;
        g.fillStyle = col.ink; g.fillRect(x + l.pad, top + 1 * k, g.measureText(row.text).width + 12 * k, l.lh - 2 * k);
        g.fillStyle = col.tag; g.textAlign = 'left';
        g.fillText(row.text, x + l.pad + 6 * k, top + l.lh / 2);
      } else if (row.kind === 'hint') {
        g.font = `800 ${9.5 * k}px ${FONT}`; g.fillStyle = col.hint; g.textAlign = 'right';
        if (spaced) g.letterSpacing = `${0.95 * k}px`;
        g.fillText('TAP >', x + l.W - l.pad, ry + 4 * k + 6.5 * k);
        if (spaced) g.letterSpacing = '0px';
      }
      ry += row.h;
    }
    // banter: four little spinners in the top-right corner run down, left to right, as its time runs out
    if (p.timer && !out && shown === n) {
      const frac = clamp((t - tutTimes(p).done) / p.timer, 0, 1), STEPS = CALLOUT.timerChars;
      let s4 = '';
      for (let i = 0; i < 4; i++) { const u = frac * 4 - i; s4 += u <= 0 ? STEPS[0] : u >= 1 ? ' ' : STEPS[Math.min(STEPS.length - 1, Math.floor(u * STEPS.length))]; }
      g.font = `800 ${10 * k}px ${FONT}`; g.fillStyle = col.ink; g.textAlign = 'right';
      g.fillText(s4, x + l.W - l.pad, y + l.pad + 6 * k);
    }
  }
  const F = tutFace(k);
  tutDrawFace(x - 10 * k + F.w / 2, y - 15 * k + F.h / 2 + faceDy, faceS, k, col, p.face);
  g.restore();
}

// ---- Hints: a training-style popup in a normal run (Greg, 2026-11-06: b0y's [b] on the OMNI RAID)
// One "ok" popup with its own colors, face and name (the same drawing as POPS's: drawTutPop), its arrow on a target
// (tutRect: { btn: 'b0y' }...). Any tap or Enter puts it away; a tap on its target also goes through to the game.
// st.hint: { pop, leaving } like st.tut. (Built in engine/scene.js, drawn in render.js, taps in input.js.)
function showHint(pop) {
  st.hint = { pop: Object.assign({ ok: true, t0: performance.now() }, pop), leaving: null };
  Sound.talk();
}
function buildHint(ctx, now, under) {
  const H = st.hint, p = H && H.pop;
  if (!p) return;
  const r = tutRect(p.target, under);
  if (p.target && !r && now - p.t0 > 400) { st.hint = H.leaving ? { pop: null, leaving: H.leaving } : null; return; }   // its target's gone (a screen without it): no hint
  p.lay = tutLayout(p, r);
}
function drawHint(now) {
  const H = st.hint;
  if (!H || st.dev || st.ad || st.wipe) return;
  if (H.leaving) { const te = now - H.leaving.t0; if (te > tutExitMs(H.leaving.pop)) H.leaving = null; else drawTutPop(H, H.leaving.pop, now, te); }
  if (H.pop && H.pop.lay) drawTutPop(H, H.pop, now, -1);
  if (!H.pop && !H.leaving) st.hint = null;
}
// A tap (h: what's under it) or Enter / Space while a hint is up. True: the hint used it.
function hintTap(h) {
  const H = st.hint, p = H && H.pop;
  if (!p || (h && h.kind === 'btn' && ['menu', 'snd'].includes(h.id))) return false;
  const now = performance.now();
  const onTarget = h && p.target && h.kind === 'btn' && h.id === p.target.btn;
  if (!onTarget && tutSkip(p, now)) return true;
  if (!onTarget && now - Math.max(p.t0 + tutTimes(p).done, p.shownAt || 0) < CALLOUT.okDelay) return true;
  tutClose(H); Sound.tick();
  return !onTarget;
}

