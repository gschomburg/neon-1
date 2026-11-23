// NeoN+1 engine/keyboard.js: the on-screen keyboard, in pixels, drawn after the grid. The WORKBENCH's today
// (engine/bench.js benchKeys); the cult fight's later (docs/QUESTS.md: the same keys without the SPECIAL row, and its
// own key where ENTER is). It draws and adds its hits; what a key does is the caller's. Loads before engine/bench.js.
'use strict';
NEON_FILES.push(['engine/keyboard.js', 'v15.60']);

const KB_ROWS = ['1234567890', 'QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];   // the key rows; the last gets DEL and ENTER
// Its size, at the bottom of the screen: special: with the SPECIAL row over the 4 key rows (5 rows of keys), else 4.
// kw / kh: a key; top: where it starts when it's all the way up.
function kbGeom(special = true) {
  const n = special ? 5 : 4, gw = L.wc * L.cw, gap = Math.max(3, Math.round(L.cw * 0.35));
  const kw = (gw - 9 * gap) / 10, kh = Math.min(kw * 1.3, L.chh * 2.2), pad = gap * 2;
  const h = n * kh + n * gap + pad * 2;
  return { x0: L.ox, gw, gap, kw, kh, pad, h, top: H - SAFE.b - h };
}
// Draw it. o:
//   top        its top edge (pixels: the caller slides it in and out)
//   live       taps go to it (hits are added)
//   special    the SPECIAL row's keys (an array, up to specialSlots; empty spots dashed), or null: no SPECIAL row
//   count(ch)  how many of a key you hold: its color and the number in its corner; 0: dark (no hit unless dark: true)
//   dark       a key you hold none of still takes taps (the cult fight: it costs INT)
//   del        DEL's tap (null: no DEL)       enter: { label, look: { bg, fg }, onTap } (null: no ENTER)
//   press      { ch, px, py }: a key riding the finger (drawn over it)
//   gate(id)   a button's tap, or a stand-in (the training's: engine/tutorial.js tutAllows)
// A letter key adds a hit { kind: 'benchkey', key }; DEL and ENTER are buttons 'bk_DEL' / 'bk_<label>'.
function kbDraw(o) {
  const G = kbGeom(!!o.special), top = o.top, count = o.count || (() => 1), live = !!o.live;
  g.fillStyle = C.bg; g.fillRect(0, top, W, H - top + 2);
  g.globalAlpha = 0.22; g.fillStyle = C.dim; g.fillRect(0, top, W, H - top + 2); g.globalAlpha = 1;
  g.fillStyle = C.accent; g.fillRect(0, top, W, 1);
  const font = (w, px) => `${w} ${px}px ${DRAW_FONT.family}`;
  const key = (x, y, w, ch, n, onTap = null, label = null, look = null) => {
    const hov = st.ptr && st.ptr.x >= x && st.ptr.x <= x + w && st.ptr.y >= y && st.ptr.y <= y + G.kh && live;
    if (n <= 0 && !onTap) {
      g.strokeStyle = C.dim; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, G.kh - 1);
      g.fillStyle = C.dim; g.font = font(DRAW_FONT.bold, Math.round(G.kh * 0.42)); g.fillText(ch, x + w / 2, y + G.kh / 2);
      if (live && o.dark) hits.push({ x, y, w, h: G.kh, kind: 'benchkey', key: ch, dark: true });
      return;
    }
    const chip = look || letterChip(ch);
    g.fillStyle = chip.bg; g.globalAlpha = hov ? 0.8 : 1; g.fillRect(x, y, w, G.kh); g.globalAlpha = 1;
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x, y + G.kh - 3, w, 3);
    g.fillStyle = chip.fg; g.font = font(DRAW_FONT.bold, Math.round(label ? G.kh * 0.28 : G.kh * 0.46));
    g.fillText(label || ch, x + w / 2, y + G.kh / 2 - 1);
    if (!label && n > 0) { g.font = font(DRAW_FONT.bold, Math.round(G.kh * 0.24)); g.textAlign = 'right'; g.fillText(n > 15 ? '+' : n.toString(16).toUpperCase(), x + w - 2, y + G.kh - 8); g.textAlign = 'center'; }
    const bid = 'bk_' + (label || ch);
    if (live) hits.push(onTap ? { x, y, w, h: G.kh, kind: 'btn', id: bid, onTap: o.gate ? o.gate(bid, onTap) : onTap } : { x, y, w, h: G.kh, kind: 'benchkey', key: ch });
  };
  g.textAlign = 'center'; g.textBaseline = 'middle';
  let y = top + G.pad;
  if (o.special) {   // the SPECIAL row: wildcards, BLANKs (later the DIVINE letters)
    g.fillStyle = C.mid; g.font = font(DRAW_FONT.weight, Math.round(G.kh * 0.24)); g.textAlign = 'left';
    g.fillText('SPECIAL', G.x0, y + G.kh / 2); g.textAlign = 'center';
    let x = G.x0 + G.kw * 1.6 + G.gap;
    for (let i = 0; i < (o.specialSlots || 6); i++) {
      const ch = o.special[i];
      if (ch) key(x, y, G.kw, ch, count(ch));
      else { g.setLineDash([3, 3]); g.strokeStyle = C.dim; g.strokeRect(x + 0.5, y + 0.5, G.kw - 1, G.kh - 1); g.setLineDash([]); }
      x += G.kw + G.gap;
    }
    y += G.kh + G.gap;
    g.fillStyle = C.dim; g.fillRect(G.x0, y - G.gap / 2, G.gw, 1);
  }
  const last = KB_ROWS.length - 1;
  KB_ROWS.forEach((row, r) => {
    const side = G.kw * 1.5, extra = r === last ? (o.del ? side + G.gap : 0) + (o.enter ? side + G.gap : 0) : 0;
    let x = G.x0 + (G.gw - (row.length * G.kw + (row.length - 1) * G.gap + extra)) / 2;
    if (r === last && o.del) { key(x, y, side, 'DEL', 1, o.del, 'DEL', chipOf('scrap')); x += side + G.gap; }
    for (const ch of row) { key(x, y, G.kw, ch, count(ch)); x += G.kw + G.gap; }
    if (r === last && o.enter) key(x, y, side, o.enter.label, 1, o.enter.onTap, o.enter.label, o.enter.look || { bg: C.accent, fg: C.bg });
    y += G.kh + G.gap;
  });
  const p = o.press;   // a key (or a slot's letter) riding your finger
  if (p && p.ch && p.px != null) {
    const c = letterChip(p.ch), w = G.kw * 1.2, h = G.kh * 1.2;
    g.globalAlpha = 0.9; g.fillStyle = c.bg; g.fillRect(p.px - w / 2, p.py - h * 0.8, w, h);
    g.fillStyle = c.fg; g.font = font(DRAW_FONT.bold, Math.round(h * 0.5)); g.fillText(p.ch, p.px, p.py - h * 0.3); g.globalAlpha = 1;
  }
}
