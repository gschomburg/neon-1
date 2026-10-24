// asXii v0: a bare-bones ASCII art editor. Plain JS, no build step: open index.html in Chrome.
// Art lives in layers of sparse cells (Map "x,y" -> character). Blank cells are see-through.
// The canvas is a frame over that grid: art outside it is kept and shown dimmer, and left out of exports.
'use strict';
(() => {

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const K = (x, y) => x + ',' + y;
const unK = k => { const i = k.indexOf(','); return [+k.slice(0, i), +k.slice(i + 1)]; };
const chars = s => Array.from(s);           // split by code point, so Unicode characters stay whole
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const VERSION = '0.125';   // change with: node ascii-editor/bump.js minor
const BASE_FONT_PX = 16;
const LINE_RATIO = 1.25;                     // cell height / font size
const ZOOMS = [0.25, 0.33, 0.5, 0.67, 0.8, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6];
const PROJECT_KEY = 'asxii.project', PREFS_KEY = 'asxii.prefs';

// ---------- state ----------
const S = {
  w: 80, h: 24,
  layers: [], active: 0, nextId: 1,
  tool: 'select',
  zoom: 1, offX: 40, offY: 40, cw: 9.6, ch: 20, fontPx: BASE_FONT_PX,
  font: 'JetBrains Mono', theme: 'blue', grid: true, showSolid: true,   // showSolid: tint opaque spaces red (the Spaces button)
  sel: null,            // Set of cell keys, or null
  float: null,          // { cells: Map "dx,dy" -> ch, x, y, w, h, lifted, origSel }
  cursor: null,         // type cursor { x, y, lineX }
  // The Advanced brush: preset = the brush it started from (see BRUSHES); start / end: taper curves; ramp, minSize, tip,
  // mode (fill | outline), edge (smart | paint), inside (solid | clear). size is the max width. ch is shared with the Pencil.
  brush: { ch: '#', size: 1, preset: 'Plain', start: 'none', end: 'none', tip: 'square', mode: 'fill', minSize: 1, ramp: 6, edge: 'smart', inside: 'solid' },
  brushes: [],          // your own brushes (Save as new brush)
  pencil: { size: 1, tip: 'square', smart: false, style: 'ascii' },   // smart: draw a line that picks its own characters   // the Pencil keeps its own size; both draw with brush.ch
  protectText: true,   // text layers: only the Font tool and Move change them (Layers pane)
  galWs: { mode: 'shape', gap: 1 },
  b3big: false,   // 3D editor window: big (most of the screen) or a bit smaller (80% of that)
  b3color: 'axes',   // 3D editor face colors: plain | axes | height
  b3shape: { kind: 'block', params: {}, turn: 0 },   // 3D editor brush (Add and Remove use it): which shape, sizes per shape, quarter turns
  myShapes: [],   // shapes saved from the 3D editor: { name, cells: [[u, v, h]...] }   // gallery White space: clear | shape | box, and Shape's gap size
  lastDraw: 'pencil',   // Pencil or Brush, whichever was used last (the Picker goes back to it)
  figfont: { name: 'Standard', layout: 'default', ws: 'clear', ls: 0, lh: 0 }, textEdit: null,   // Font tool: the font for new text; the text layer being typed in
  spacesErase: false,   // spaces in a floating block erase what's under them when dropped
  anchor: 0,
  hover: null, drag: null, spaceDown: false,
  undo: [], redo: [], lastTag: null,
  clip: '',
  recent: [],           // last 5 characters placed, newest first
  selShape: 'rect',     // Select tool: rect | ellipse | lasso
  selFixed: false, selCenter: false,   // Fixed aspect (square / circle) and From center, for rect + ellipse
  lastMarquee: 'rect',  // the last non-wand Select shape (the Select button goes back to it; the Wand button picks 'wand')
  selPoly: null,        // a polygon selection being clicked out: { pts: [{x, y}...], mode }
  wandContig: true, selSample: 'layer',   // Wand: connected cells only (off = every match), and which layers it looks at
  fillContig: true,     // Fill: connected cells only (off = every matching cell on the canvas; Shift-click flips it)
  pickSample: 'all',    // Picker: the character you see ('all') or the one on the active layer ('layer')
  ch2: null,
  activeSlot: 'draw',   // the selected chip in the tool panel: picking a character fills it ('draw' or 'right')            // the right-button character for Pencil and Brush (null = erase); Shift or right-click with the Picker sets it
  mirror: 'off',        // Pencil / Brush / Eraser paint a mirrored copy: off | h (left-right) | v (top-bottom) | both
  mirrorUse: { pencil: true, brush: true, eraser: true },   // which tools mirror (the toggle in the bar; TOOLBAR.md 7)
  panels: {},           // right-pane panels that are folded: { id: true }
  sideW: 0,             // the right pane's width, if you resized it (0 = the default)
  mirrorFlip: true,     // mirrored copies flip their characters (/ becomes \); off = the same characters
  mirrorAt: { x: null, y: null },   // where the mirror lines are, in cells from the canvas's left / top, in half-cell steps
                                    // (a whole number: between two cells; a half: through a cell). null = the middle. Saved with the document
  typeInsert: false,    // Type: insert (push the rest of the row along) instead of overwrite; the Insert key flips it
  lastPaint: null,      // where the last paint stroke ended, for Shift-click straight lines
  spring: null,         // a tool key held down: { key, prev, at, used }; letting go goes back to prev
  // What the Brush and Fill paint with: one character, noise (random from a set), or a repeating pattern
  paint: { mode: 'char', noise: { name: 'Dust', set: ".,'`", density: 25 }, pattern: { name: 'Checker', rows: ['# ', ' #'] }, ramp: { name: 'Classic', set: '.:-=+*#%@' } },
  noises: [],           // your own noises (Save in the noise list); the presets are NOISES
  ramps: [],            // your own ramps (Save in the ramp list); the presets are RAMPS
  fillSample: 'layer',  // Fill looks at the active layer, or at all visible layers ('all')
  blanksBrush: 'through', blanksFill: 'replace',   // White space in noise / patterns: Clear ('through') or Solid ('replace')
  patterns: [],         // your own patterns (Make pattern); the presets are PATTERNS
  // Shape tool: which shape, a style per shape, Fixed aspect / From center (rect + ellipse), Fill inside
  shape: { kind: 'rect', rect: 'ascii', ellipse: 'smart', line: 'smart', polygon: 'smart', fixed: false, center: false, fill: false },
  poly: null,           // a polygon being clicked out: { pts: [{x, y}...] }
  // Block tool: painted blocks ("bx,by" on a grid of w x h cells), all `depth` deep; how they bake; Draw or Erase
  blocks: { cells: new Set(), w: 3, h: 2, depth: 1, fill: { front: '', top: '', side: '' }, seams: false, solid: true, erase: false,
    view: 'diag', dcells: new Set(), size: 2, dir: 1, level: 0, flat: true, ox: 0, oy: 0, placed: false, show: 'ascii' },   // diamonds 'u,v,z' built in the 3D editor; size b; depth right (1) or left (-1); ox, oy: where the shape sits on the canvas
  colors: {},
  blinkOn: true,
};

const view = $('#view'), ctx = view.getContext('2d'), vp = $('#viewport');
let dpr = 1, dirty = true;
const redraw = () => { dirty = true; };

// ---------- layers ----------
function makeLayer(name) { return { id: S.nextId++, name: name || 'Layer ' + S.nextId, visible: true, cells: new Map() }; }
const L = () => S.layers[S.active];
function compositeAt(x, y) {
  const k = K(x, y);
  for (let i = S.layers.length - 1; i >= 0; i--) {
    const l = S.layers[i];
    if (l.visible && l.cells.has(k)) return l.cells.get(k);
  }
  return null;
}
function setCell(layer, x, y, c) {
  if (layer.text) { layer.text = null; if (S.textEdit === layer.id) S.textEdit = null; toast('That text layer is plain art now (no longer editable as text)'); }
  if (c == null || c === ' ' || c === '' || c === CLEAR) layer.cells.delete(K(x, y));   // Clear (Special) paints as erasing
  else layer.cells.set(K(x, y), c);
}

// ---------- FIGlet fonts (Font tool): parse .flf fonts and render text with them ----------
// A .flf font: a header line (flf2a<hardblank> height baseline maxlen oldLayout comments [dir fullLayout]), comment
// lines, then each character as <height> lines ending in an end mark (@). Characters 32-126 come first, then 7
// German letters, then code-tagged extras. Layout: full width, fitting (letters slide together until they touch),
// or smushing (they overlap one column, merging the touching characters by the font's rules).
const FIG = { cache: new Map() };
function figFont(name) {
  if (FIG.cache.has(name)) return FIG.cache.get(name);
  const src = (window.ASXII_FONTS || {})[name]; if (!src) return null;
  const lines = src.split('\n'), head = lines[0].split(' ');
  const hard = head[0].charAt(head[0].length - 1), height = +head[1], baseline = +head[2] || +head[1], oldLayout = +head[4], comments = +head[5];
  const full = head.length > 7 ? +head[7] : null;
  let fit = false, smush = false, rules = 0;
  if (full !== null && !isNaN(full)) { smush = !!(full & 128); fit = !!(full & 64); rules = full & 63; if (smush) fit = true; }
  else if (oldLayout === -1) { /* full width */ } else if (oldLayout === 0) fit = true; else { fit = smush = true; rules = oldLayout & 31; }
  const chars = new Map();
  let i = 1 + comments;
  const readChar = () => {
    const rows = [];
    for (let r = 0; r < height && i < lines.length; r++, i++) {
      let s = lines[i].replace(/\s+$/, ''); const end = s.charAt(s.length - 1);
      while (s.length && s.charAt(s.length - 1) === end) s = s.slice(0, -1);   // strip the end mark (one or two)
      rows.push(s);
    }
    const w = Math.max(0, ...rows.map(r => r.length));
    return rows.map(r => r.padEnd(w, ' '));
  };
  for (let c = 32; c <= 126 && i < lines.length; c++) chars.set(c, readChar());
  for (const c of [196, 214, 220, 228, 246, 252, 223]) { if (i >= lines.length) break; chars.set(c, readChar()); }
  while (i < lines.length) {   // code-tagged characters: "<code> <name>" then the rows
    const m = /^\s*(-?(?:0x[0-9a-f]+|0[0-7]*|\d+))/i.exec(lines[i]);
    if (!m) { i++; continue; }
    const code = parseInt(m[1], m[1].toLowerCase().startsWith('0x') ? 16 : m[1].startsWith('0') && m[1].length > 1 ? 8 : 10);
    i++; const rows = readChar(); if (rows.length === height && code > 0) chars.set(code, rows);
  }
  const f = { name, hard, height, baseline, fit, smush, rules, chars };
  FIG.cache.set(name, f);
  return f;
}
// Two touching characters merged into one, or null if these can't merge (controlled smushing rules 1-32).
function figSmushPair(a, b, f, layout) {
  if (a === ' ') return b; if (b === ' ') return a;
  if (layout === 'smush' && !f.rules || !f.rules && f.smush) {   // universal: the later one wins (but not over by a hardblank)
    if (b === f.hard && a !== ' ') return a;
    return b;
  }
  const h = f.hard, r = f.rules;
  if (a === h || b === h) return (r & 32) && a === h && b === h ? h : null;
  if ((r & 1) && a === b) return a;
  if (r & 2) { const s = '|/\\[]{}()<>'; if (a === '_' && s.includes(b)) return b; if (b === '_' && s.includes(a)) return a; }
  if (r & 4) {
    const cls = ['|', '/\\', '[]', '{}', '()', '<>'], ca = cls.findIndex(c => c.includes(a)), cb = cls.findIndex(c => c.includes(b));
    if (ca >= 0 && cb >= 0 && ca !== cb) return ca > cb ? a : b;
  }
  if (r & 8) { const p = a + b; if (p === '[]' || p === '][' || p === '{}' || p === '}{' || p === '()' || p === ')(') return '|'; }
  if (r & 16) { const p = a + b; if (p === '/\\') return '|'; if (p === '\\/') return 'Y'; if (p === '><') return 'X'; }
  return null;
}
// One line of text in a font -> rows of characters. layout: 'default' (the font's own), 'full', 'fit' or 'smush'.
function figLine(text, f, layout = 'default', ls = 0) {
  const fit = layout === 'full' ? false : layout === 'default' ? f.fit : true;
  const smush = layout === 'smush' ? true : layout === 'default' ? f.smush : false;
  let out = Array(f.height).fill('');
  for (const ch of chars(text)) {
    let g = f.chars.get(ch.codePointAt(0));
    // a letter the font doesn't have (or draws blank): the plain character, in the middle of the letter height
    if (ch !== ' ' && (!g || g.every(r => !r.trim()))) { const mid = Math.max(0, Math.floor((Math.min(f.baseline, f.height) - 1) / 2)); g = Array.from({ length: f.height }, (_, k) => k === mid ? ' ' + ch + ' ' : '   '); }
    if (!g) g = f.chars.get(32); if (!g) continue;
    const gw = g[0].length;
    if (!out[0].length) {   // the first letter (in Fit / Smush it slides to the left edge too, like figlet)
      const lead = fit ? Math.min(...g.map(r => r.trim() ? r.length - r.replace(/^ +/, '').length : Infinity)) : 0;
      out = g.map(r => Number.isFinite(lead) ? r.slice(lead) : r); continue;
    }
    // how far the glyph can slide left: the smallest gap over the rows (+1 where the touching pair can smush)
    let amt = fit ? Infinity : 0;
    if (fit) for (let k = 0; k < f.height; k++) {
      const L = out[k], R = g[k];
      const trail = L.length - L.replace(/ +$/, '').length, lead = R.length - R.replace(/^ +/, '').length;
      let a = trail + lead;
      if (smush && trail < L.length && lead < R.length && figSmushPair(L.charAt(L.length - 1 - trail), R.charAt(lead), f, layout) !== null) a++;
      amt = Math.min(amt, a);
    }
    amt -= ls;   // Letters: more room between letters, or (negative) overlap
    if (amt < 0) { out = out.map(r => r + ' '.repeat(-amt)); amt = 0; }
    amt = Math.min(amt, gw, out[0].length);
    out = out.map((L, k) => {
      const R = g[k], keep = L.length - amt; let mid = '';
      for (let j = 0; j < amt; j++) {
        const a = L.charAt(keep + j), b = R.charAt(j);
        mid += a === ' ' ? b : b === ' ' ? a : (figSmushPair(a, b, f, layout) ?? b);
      }
      return L.slice(0, keep) + mid + R.slice(amt);
    });
  }
  return out.map(r => r.split(f.hard).join(' ').replace(/\s+$/, ''));
}
// Text (lines split on \n) -> rows, each line's block stacked under the last.
function figRender(text, fontName, layout, ls = 0, lh = 0) {
  const f = figFont(fontName); if (!f) return [];
  const rows = [];
  String(text).split('\n').forEach((line, n) => {
    const block = figLine(line, f, layout, ls), top = n * Math.max(1, f.height + lh);
    block.forEach((r, k) => {
      const y = top + k; while (rows.length <= y) rows.push('');
      const a = chars(rows[y]), b = chars(r);
      b.forEach((c, i) => { while (a.length <= i) a.push(' '); if (c !== ' ') a[i] = c; });
      rows[y] = a.join('');
    });
  });
  while (rows.length && !rows[rows.length - 1].trim()) rows.pop();
  return rows;
}

// ---------- Font tool (F): text layers in a FIGlet font ----------
// Click to start a text layer and type; it renders live in the chosen font. A text layer keeps its text (l.text:
// str, font, layout, x, y), so you can come back with the Font tool to type more, change the font, or drag it. It turns
// into plain art for good when you paint on it with another tool, or merge it down.
function textCells(t) {
  const m = new Map(), rows = figRender(t.str || '', t.font, t.layout, t.ls || 0, t.lh || 0);
  rows.forEach((r, j) => chars(r).forEach((c, i) => { if (c !== ' ') m.set(K(t.x + i, t.y + j), c); }));
  // White space: fonts only know characters and blanks, so the solid parts are worked out here.
  //   inside: blanks the letters close in (flooded from outside the text, the ones it can't reach)
  //   block:  each row solid from its first character to its last (the text on a solid plate)
  if (t.ws === 'inside' || t.ws === 'block') {
    const H = rows.length, W = Math.max(0, ...rows.map(r => chars(r).length)), ink = (i, j) => j >= 0 && j < H && i >= 0 && (chars(rows[j])[i] || ' ') !== ' ';
    if (t.ws === 'block') rows.forEach((r, j) => { const a = chars(r), lo = a.findIndex(c => c !== ' '); if (lo < 0) return; let hi = a.length - 1; while (a[hi] === ' ') hi--; for (let i = lo; i <= hi; i++) if (a[i] === ' ') m.set(K(t.x + i, t.y + j), SOLID); });
    else {
      const out = new Set(['-1,-1']), q = [[-1, -1]];   // flood the blanks from a ring around the text
      while (q.length) { const [i, j] = q.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj, k = a + ',' + b; if (a < -1 || b < -1 || a > W || b > H || out.has(k) || ink(a, b)) continue; out.add(k); q.push([a, b]); } }
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (!ink(i, j) && !out.has(i + ',' + j)) m.set(K(t.x + i, t.y + j), SOLID);
    }
  }
  if (t.mirror) {   // typed with mirror on: the mirrored copy too (where it doesn't land on the text itself)
    const maps = mirrorMapsFor(t.mirror).slice(1), base = [...m];
    for (const mp of maps) for (const [k, c] of base) { const [x, y] = unK(k), k2 = K(mp.x(x), mp.y(y)); if (!m.has(k2)) m.set(k2, mp.c(c)); }
  }
  return m;
}
// Protect text layers (Layers pane, on by default): other tools leave a text layer alone, the Move tool moves it whole,
// and drops / pastes land on a new layer. Rasterize (Layer menu) or Merge down makes it plain art on purpose.
const textLocked = () => S.protectText && L() && !!L().text;
function textLock(what) {
  if (!textLocked()) return false;
  toast(what + ': this is a text layer. Edit it with the Font tool (F), or Layer › Rasterize to paint on it', 'warn');
  return true;
}
// Font + mirror: the text keeps a copy of the mirror setup it was typed with, and draws its mirrored copy from that
function syncTextMirror(t) { if (mirrorOn('font')) t.mirror = mirrorCfg(); else delete t.mirror; }
function renderTextLayer(l) { if (l && l.text) l.cells = textCells(l.text); }
// still the text it was made from? (another tool may have changed its cells)
function textIntact(l) {
  if (!l || !l.text) return false;
  const m = textCells(l.text); if (m.size !== l.cells.size) return false;
  for (const [k, c] of m) if (l.cells.get(k) !== c) return false;
  return true;
}
// a text layer that was painted on becomes plain art
function checkTextLayers() { for (const l of S.layers) if (l.text && !textIntact(l)) { l.text = null; if (S.textEdit === l.id) S.textEdit = null; } }
// where the text sits (the caret's spot too, so an empty layer still has a box)
function textBox(l) {
  const t = l.text, f = figFont(t.font), h = f ? f.height : 1;
  const lines = String(t.str || '').split('\n');
  let w = 1;
  for (const line of lines) for (const r of (f ? figLine(line, f, t.layout, t.ls || 0) : [])) w = Math.max(w, r.length);
  const last = f ? figLine(lines[lines.length - 1], f, t.layout, t.ls || 0) : [''], step = Math.max(1, h + (t.lh || 0));
  const caretX = t.x + Math.max(0, ...last.map(r => r.length)), caretY = t.y + (lines.length - 1) * step;
  return { x: t.x, y: t.y, w, h: (lines.length - 1) * step + h, caretX, caretY, ch: h };
}
// The index of the top visible text layer whose box covers cell c, or -1
function textLayerAt(c) {
  for (let i = S.layers.length - 1; i >= 0; i--) { const l = S.layers[i]; if (!l.visible || !l.text) continue; const b = textBox(l); if (c.x >= b.x && c.x < b.x + Math.max(b.w, 1) && c.y >= b.y && c.y < b.y + b.h) return i; }
  return -1;
}
const editingText = () => { const l = S.layers.find(q => q.id === S.textEdit); return l && l.text ? l : null; };
function textAutoName(l) { if (l.autoName) l.name = 'Text: ' + (String(l.text.str || '').replace(/\n/g, ' ').trim().slice(0, 18) || '…'); }
// stop editing; an empty text layer goes away
setInterval(() => { if (S.tool === 'font' && S.textEdit) redraw(); }, 265);   // the caret blinks while you type
function endTextEdit() {
  const l = editingText(); S.textEdit = null;
  if (l && !String(l.text.str || '').trim() && !l.cells.size) {
    const i = S.layers.indexOf(l);
    if (i >= 0 && S.layers.length > 1) { S.layers.splice(i, 1); S.active = clamp(S.active > i ? S.active - 1 : S.active, 0, S.layers.length - 1); }
  }
  changed(true);
}
function typeText(fn) {   // change the edited text, as one undo step per run of typing
  const l = editingText(); if (!l) return;
  pushUndo('font' + l.id); fn(l.text); syncTextMirror(l.text); renderTextLayer(l); textAutoName(l); changed(true);
}
// the font list: each font's name with a sample in it
function openFontMenu(btn) {
  const m = $('#fontMenu');
  if (!m.hidden) return closeFontMenu();
  const l = editingText();
  const sample = (l && String(l.text.str || '').split('\n')[0].trim().slice(0, 10)) || 'Abc';
  m.innerHTML = Object.keys(window.ASXII_FONTS || {}).map(n => {
    const rows = figRender(sample, n, 'default').map(r => r.slice(0, 44));
    return '<div class="fontitem' + (n === S.figfont.name ? ' on' : '') + '" data-name="' + esc(n) + '"><span class="pname">' + esc(n) + '</span><pre class="fprev">' + esc(rows.join('\n')) + '</pre></div>';
  }).join('');
  placeUnder(m, btn, 380);
  $$('.fontitem', m).forEach(el => el.addEventListener('click', () => { setFigFont(el.dataset.name, S.figfont.layout); closeFontMenu(); }));
  const on = $('.fontitem.on', m); if (on) on.scrollIntoView({ block: 'center' });
}
function closeFontMenu() { const m = $('#fontMenu'); if (m) m.hidden = true; }
// the font / layout for new text, and for the text being edited (click a text layer with the Font tool to edit it)
// Letters / Lines: the bar's steppers, for new text and the text being edited
function setFigSpacing(key, v) {
  S.figfont[key] = v; savePrefs();
  const l = editingText(); if (l) { pushUndo('fsp' + key + l.id); l.text[key] = v; renderTextLayer(l); changed(true); }
  renderOptions(); redraw();
}
function setFigFont(name, layout, ws = S.figfont.ws || 'clear') {
  S.figfont = { ...S.figfont, name, layout, ws }; savePrefs();
  const l = editingText();
  if (l) { pushUndo(); l.text.font = name; l.text.layout = layout; l.text.ws = ws; renderTextLayer(l); changed(true); }
  renderOptions(); redraw();
}

// ---------- gallery (File › Gallery…): built-in art, plain .txt files in gallery/ ----------
// Served over http, the pieces load from gallery/index.json and gallery/*.txt; from file:// (where Chrome won't let
// the page read them) they come from gallery.js, the same art bundled by ascii-editor/gallery-build.js. Either way
// nothing loads until the pane is first opened.
// A pane on the side lists the pieces. Clicking one previews it over the middle of the view, on a tinted plate;
// Add puts it on a new layer above the active one, ready for the Move tool. The pane closes on Add, ×, Esc, or using a tool.
const gal = { open: false, sel: -1, q: '', shown: [], preview: null, items: null, loading: null };
const galItems = () => gal.items || [];
const APP_BASE = ((document.currentScript && document.currentScript.src) || location.href).replace(/[?#].*$/, '').replace(/[^/]*$/, '');
const tidyArt = t => { const r = t.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n').map(x => x.replace(/\s+$/, '')); while (r.length && !r[r.length - 1]) r.pop(); return r.join('\n'); };
function loadGallery() {
  if (gal.items) return Promise.resolve(gal.items);
  if (gal.loading) return gal.loading;
  const get = (u, how) => fetch(APP_BASE + u, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(u); return r[how](); });
  const fromFiles = () => get('gallery/index.json', 'json').then(list => Promise.all(list.map(e => get('gallery/' + encodeURIComponent(e.file), 'text').then(t => ({ ...e, art: tidyArt(t) })))));
  const fromBundle = () => window.ASXII_GALLERY ? Promise.resolve(window.ASXII_GALLERY) : new Promise((ok, no) => {
    const sc = document.createElement('script'); sc.src = APP_BASE + 'gallery.js?v=' + VERSION;
    sc.onload = () => ok(window.ASXII_GALLERY || []); sc.onerror = no; document.head.appendChild(sc);
  });
  gal.loading = (/^https?:/.test(location.protocol) ? fromFiles().catch(fromBundle) : fromBundle())
    .then(items => { gal.items = items; return items; }, () => [])
    .finally(() => { gal.loading = null; });
  return gal.loading;
}
function galCells(art) {
  const cells = new Map(), rows = art.split('\n'); let w = 0;
  rows.forEach((r, j) => { const cs = chars(r); w = Math.max(w, cs.length); cs.forEach((c, i) => { if (c !== ' ') cells.set(K(i, j), c); }); });
  return { cells, w, h: rows.length };
}
// White space for placed art: which blanks become solid (they hide what's under the art).
//   clear: none · box: every blank in the art's rectangle · shape: the blanks inside the art's outline, where gaps up to
//   `gap` cells in the outline count as closed (0: only blanks fully closed in). Done as a morphological closing: grow the
//   characters by the gap (twice as far across, since cells are tall), fill in what the outside can't reach, shrink back.
// Returns a Set of "x,y" keys (relative to the art's top left).
function artSolid(cells, w, h, mode, gap) {
  const out = new Set();
  if (mode === 'box') { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!cells.has(K(x, y))) out.add(K(x, y)); return out; }
  if (mode !== 'shape') return out;
  const gx = gap * 2, gy = gap, P = gx + 2, W = w + P * 2, H = h + P * 2, at = (x, y) => y * W + x;
  const ink = new Uint8Array(W * H);
  for (const k of cells.keys()) { const [x, y] = unK(k); ink[at(x + P, y + P)] = 1; }
  // grow (or shrink) by a gx x gy box: a running max (min) along the rows, then the columns
  const spread = (src, keep) => {   // keep 1: max (grow) · keep 0: min (shrink)
    const a = new Uint8Array(W * H), b = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 1 - keep; for (let d = -gx; d <= gx; d++) { const xx = x + d; const c = xx < 0 || xx >= W ? 1 - keep : src[at(xx, y)]; if (c === keep) { v = keep; break; } } a[at(x, y)] = v; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 1 - keep; for (let d = -gy; d <= gy; d++) { const yy = y + d; const c = yy < 0 || yy >= H ? 1 - keep : a[at(x, yy)]; if (c === keep) { v = keep; break; } } b[at(x, y)] = v; }
    return b;
  };
  const grown = gap ? spread(ink, 1) : ink;
  const filled = new Uint8Array(W * H).fill(1), q = [0]; filled[0] = 0;   // flood the outside (4-way), from the corner
  while (q.length) {
    const i = q.pop(), x = i % W, y = (i / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      const j = at(xx, yy); if (!filled[j] || grown[j]) continue;
      filled[j] = 0; q.push(j);
    }
  }
  const closed = gap ? spread(filled, 0) : filled;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (closed[at(x + P, y + P)] && !ink[at(x + P, y + P)]) out.add(K(x, y));
  return out;
}
function galSolid() { const p = gal.preview; if (p) p.solid = artSolid(p.cells, p.w, p.h, S.galWs.mode, S.galWs.gap); }
function setGalWs(mode, gap) {
  S.galWs = { mode, gap: clamp(gap, 0, 4) }; savePrefs();
  galSolid(); galWsUi(); redraw();
}
function galWsUi() {
  $$('#galWs [data-gws]').forEach(b => b.classList.toggle('on', b.dataset.gws === S.galWs.mode));
  $('#galGap').hidden = S.galWs.mode !== 'shape';
  $('#galGapN').textContent = S.galWs.gap;
}
function openGallery() {
  commitFloat();
  gal.open = true; $('#gallery').hidden = false;
  const q = $('#galSearch'); q.value = gal.q; q.focus();
  if (!gal.items) $('#galList').innerHTML = '<div class="gal-empty">Loading…</div>';
  return loadGallery().then(items => {
    if (!gal.open) return;
    if (!items.length) { $('#galList').innerHTML = '<div class="gal-empty">The gallery art didn\'t load</div>'; return; }
    renderGallery();
    if (gal.sel >= 0) galPreview(gal.sel);
  });
}
function closeGallery() {
  if (!gal.open) return;
  gal.open = false; gal.preview = null; $('#gallery').hidden = true;
  if (document.activeElement && $('#gallery').contains(document.activeElement)) document.activeElement.blur();
  redraw();
}
function renderGallery() {
  const q = gal.q.trim().toLowerCase(), all = galItems();
  gal.shown = all.map((g, i) => i).filter(i => !q || (all[i].name + ' ' + all[i].by + ' ' + all[i].subject).toLowerCase().includes(q));
  $('#galCount').textContent = gal.shown.length + (q ? ' of ' + all.length : '');
  $('#galList').innerHTML = gal.shown.map(i => {
    const g = all[i], rows = g.art.split('\n'), w = Math.max(...rows.map(r => chars(r).length)), h = rows.length;
    const fs = Math.max(1, Math.min(7, 92 / (w * 0.6), 60 / h)).toFixed(2);   // the thumbnail: the whole piece in a 92 x 60 box
    return `<div class="gal-item${i === gal.sel ? ' on' : ''}" data-gi="${i}" title="${esc(g.name)}${g.by ? ' · ' + esc(g.by) : ''} · ${w} × ${h} · double-click to add">` +
      `<div class="gal-thumb"><pre style="font-size:${fs}px">${esc(g.art)}</pre></div>` +
      `<div class="gal-meta"><b>${esc(g.name)}</b><span>${g.by ? esc(g.by) + ' · ' : ''}${w} × ${h}</span></div></div>`;
  }).join('') || '<div class="gal-empty">Nothing matches</div>';
  galFoot();
}
function galFoot() {
  const g = galItems()[gal.sel];
  $('#galAdd').disabled = !gal.preview;
  $('#galPick').innerHTML = g && gal.preview ? `<b>${esc(g.name)}</b>${g.by ? ' by ' + esc(g.by) : ''}${g.url ? ` · <a href="${esc(g.url)}" target="_blank" rel="noopener">source</a>` : ''}` : 'Click a piece to preview it on the canvas';
}
// preview piece i: centered in the view (kept on the canvas when it fits), floating over the art
function galPreview(i) {
  const g = galItems()[i]; if (!g) return;
  gal.sel = i;
  const { cells, w, h } = galCells(g.art), c = cellAt(vp.clientWidth / 2, vp.clientHeight / 2);
  gal.preview = { cells, w, h, x: clamp(c.x - (w >> 1), 0, Math.max(0, S.w - w)), y: clamp(c.y - (h >> 1), 0, Math.max(0, S.h - h)) };
  galSolid();
  $$('#galList .gal-item').forEach(el => el.classList.toggle('on', +el.dataset.gi === i));
  const el = $(`#galList [data-gi="${i}"]`); if (el) el.scrollIntoView({ block: 'nearest' });
  galFoot(); redraw();
}
function galStep(d) {
  if (!gal.shown.length) return;
  const at = gal.shown.indexOf(gal.sel);
  galPreview(gal.shown[at < 0 ? (d > 0 ? 0 : gal.shown.length - 1) : clamp(at + d, 0, gal.shown.length - 1)]);
}
function galAdd() {
  const g = galItems()[gal.sel], p = gal.preview;
  if (!g || !p) return toast('Pick a piece first', 'warn');
  commitFloat(); pushUndo();
  const l = makeLayer(g.name);
  for (const [k, c] of p.cells) { const [x, y] = unK(k); l.cells.set(K(p.x + x, p.y + y), c); }
  for (const k of p.solid || []) { const [x, y] = unK(k); l.cells.set(K(p.x + x, p.y + y), SOLID); }
  S.layers.splice(S.active + 1, 0, l); S.active = S.layers.indexOf(l);
  S.sel = null; S.lastTag = null;
  closeGallery();
  setTool('move');
  changed(true);
  toast('Added ' + g.name + ' on a new layer: drag it to place it');
}
function initGallery() {
  $('#galClose').addEventListener('click', closeGallery);
  $$('#galWs [data-gws]').forEach(b => b.addEventListener('click', () => setGalWs(b.dataset.gws, S.galWs.gap)));
  $$('#galGap [data-gd]').forEach(b => b.addEventListener('click', () => setGalWs('shape', S.galWs.gap + +b.dataset.gd)));
  galWsUi();
  $('#galAdd').addEventListener('click', galAdd);
  const q = $('#galSearch');
  q.addEventListener('input', () => { gal.q = q.value; renderGallery(); });
  q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); galStep(e.key === 'ArrowDown' ? 1 : -1); }
    else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (gal.preview) galAdd(); else galStep(1); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (q.value) { q.value = gal.q = ''; renderGallery(); } else closeGallery(); }
  });
  $('#galList').addEventListener('click', e => { const it = e.target.closest('.gal-item'); if (it) galPreview(+it.dataset.gi); });
  $('#galList').addEventListener('dblclick', e => { const it = e.target.closest('.gal-item'); if (it) { galPreview(+it.dataset.gi); galAdd(); } });
}

// ---------- start content: the welcome document and the 3D examples (dist/start/, bundled into start.js) ----------
let startLoading = null;
function loadStart() {
  if (window.ASXII_START) return Promise.resolve(window.ASXII_START);
  if (!startLoading) startLoading = new Promise(ok => {
    const sc = document.createElement('script'); sc.src = APP_BASE + 'start.js?v=' + VERSION;
    sc.onload = () => ok(window.ASXII_START || {}); sc.onerror = () => { startLoading = null; ok({}); };
    document.head.appendChild(sc);
  });
  return startLoading;
}
// the welcome document, with its "asXii v0.xx" brought up to this version
function welcomeDoc(st) {
  const w = JSON.parse(JSON.stringify(st.welcome));
  for (const l of w.layers || []) l.rows = (l.rows || []).map(r => r.replace(/(asXii v)\d+\.\d+/g, (m, a) => a + VERSION));
  return w;
}
// Help › Welcome: open the welcome document, like File › New (Ctrl Z brings back what was there)
function showWelcome() {
  return loadStart().then(st => {
    if (!st.welcome) return toast('The welcome screen didn\'t load (start.js)', 'warn');
    commitFloat(); pushUndo(); loadProject(welcomeDoc(st)); S.blocks.moved = false;
    changed(true); zoomFit(); toast('Welcome (Ctrl Z brings back what you had)');
  });
}

// ---------- undo ----------
function snap() {
  return {
    w: S.w, h: S.h, active: S.active, nextId: S.nextId,
    layers: S.layers.map(l => ({ id: l.id, name: l.name, visible: l.visible, cells: new Map(l.cells), text: l.text ? { ...l.text } : null, autoName: l.autoName })),
    sel: S.sel ? new Set(S.sel) : null,
    blocks: { ...S.blocks, cells: new Set(S.blocks.cells), dcells: new Set(S.blocks.dcells) },
  };
}
function restore(s) {
  S.w = s.w; S.h = s.h; S.active = s.active; S.nextId = s.nextId;
  S.layers = s.layers.map(l => ({ ...l, cells: new Map(l.cells), text: l.text ? { ...l.text } : null }));
  if (S.textEdit && !S.layers.some(l => l.id === S.textEdit && l.text)) S.textEdit = null;
  S.sel = s.sel ? new Set(s.sel) : null;
  if (s.blocks) S.blocks = { ...s.blocks, cells: new Set(s.blocks.cells), dcells: new Set(s.blocks.dcells || []) };
  changed(true);
}
// tag groups repeated small edits (typing) into one undo step
function pushUndo(tag) {
  if (tag && tag === S.lastTag) return;
  S.undo.push(snap());
  if (S.undo.length > 200) S.undo.shift();
  S.redo = [];
  S.lastTag = tag || null;
}
function undo() {
  if (S.float) { cancelFloat(); return; }
  if (!S.undo.length) return toast('Nothing to undo');
  S.redo.push(snap()); restore(S.undo.pop()); S.lastTag = null;
}
function redo() {
  if (S.float) commitFloat();
  if (!S.redo.length) return toast('Nothing to redo');
  S.undo.push(snap()); restore(S.redo.pop()); S.lastTag = null;
}

// Called after any change to the art or the document; layout = also refresh the panels.
let saveTimer = 0;
function changed(layout) {
  redraw();
  if (typeof cam !== 'undefined' && cam.open) render3d();
  if (layout) { renderLayers(); syncCanvasInputs(); }
  else updateLayerCounts();
  updateInfo();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(autosave, 400);
}

// ---------- selection ----------
function selBounds(set) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const k of set) { const [x, y] = unK(k); if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
// Combine a set of cells with the selection: new / add (Shift) / sub (Alt) / int (Shift + Alt: keep only the overlap).
// combineSel works it out without changing anything (the live preview while dragging uses it too).
function combineSel(cells, mode) {
  if (S.tool === 'select') cells = mirrorCellSet(cells, 'select');   // with mirror on, the mirrored area is selected too
  if (mode === 'int') { const keep = new Set(); if (S.sel) for (const k of cells) if (S.sel.has(k)) keep.add(k); return keep; }
  const out = mode === 'new' || !S.sel ? new Set() : new Set(S.sel);
  for (const k of cells) { if (mode === 'sub') out.delete(k); else out.add(k); }
  return out;
}
function applyCells(cells, mode) {
  S.sel = combineSel(cells, mode);
  if (!S.sel.size) S.sel = null;
  updateInfo(); redraw();
}
// The box being dragged out: from the start cell to the pointer, or centered on the start cell (From center / Alt),
// optionally kept visually square / round (Fixed aspect / Shift). Cells are tall, so "square" compares on-screen sizes.
function dragBox(d, shift, alt) {
  if (!shift) d.shiftFree = true;
  if (!alt) d.altFree = true;
  const fixedOpt = d.kind === 'shape' ? S.shape.fixed : S.selFixed, centerOpt = d.kind === 'shape' ? S.shape.center : S.selCenter;
  const fixed = fixedOpt || (d.shiftFree && shift), center = centerOpt || (d.altFree && alt);
  let dx = d.cx - d.ax, dy = d.cy - d.ay;
  const sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1;
  if (center) {
    let w = 2 * Math.abs(dx) + 1, h = 2 * Math.abs(dy) + 1;
    if (fixed) {
      const size = Math.max(w * S.cw, h * S.ch);
      w = Math.max(1, Math.round(size / S.cw)); h = Math.max(1, Math.round(size / S.ch));
      if (w % 2 === 0) w++; if (h % 2 === 0) h++;
    }
    const hx = (w - 1) / 2, hy = (h - 1) / 2;
    d.x0 = d.ax - hx; d.x1 = d.ax + hx; d.y0 = d.ay - hy; d.y1 = d.ay + hy;
  } else {
    if (fixed) {
      const size = Math.max((Math.abs(dx) + 1) * S.cw, (Math.abs(dy) + 1) * S.ch);
      dx = sx * (Math.max(1, Math.round(size / S.cw)) - 1); dy = sy * (Math.max(1, Math.round(size / S.ch)) - 1);
    }
    d.x0 = d.ax; d.y0 = d.ay; d.x1 = d.ax + dx; d.y1 = d.ay + dy;
  }
  d.fixed = fixed; d.center = center;
}
function rectCells(ax, ay, bx, by) {
  const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx), y0 = Math.min(ay, by), y1 = Math.max(ay, by), out = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push(K(x, y));
  return out;
}
function applyRect(ax, ay, bx, by, mode) { applyCells(rectCells(ax, ay, bx, by), mode); }
// Ellipse inside the dragged box: cells whose centers fall inside it.
function ellipseCells(ax, ay, bx, by) {
  const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx), y0 = Math.min(ay, by), y1 = Math.max(ay, by);
  const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2, rx = (x1 - x0 + 1) / 2, ry = (y1 - y0 + 1) / 2, out = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const ux = (x + 0.5 - cx) / rx, uy = (y + 0.5 - cy) / ry;
    if (ux * ux + uy * uy <= 1) out.push(K(x, y));
  }
  return out.length ? out : rectCells(ax, ay, bx, by);
}
// Lasso: pts are in cell units (floats). Cells whose centers are inside the loop, plus the cells the line crosses.
function lassoCells(pts) {
  const out = new Set();
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  for (let y = Math.floor(y0); y <= Math.floor(y1); y++) for (let x = Math.floor(x0); x <= Math.floor(x1); x++) {
    const tx = x + 0.5, ty = y + 0.5;
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], b = pts[j];
      if ((a.y > ty) !== (b.y > ty) && tx < (b.x - a.x) * (ty - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    if (inside) out.add(K(x, y));
  }
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    line(Math.floor(a.x), Math.floor(a.y), Math.floor(b.x), Math.floor(b.y), (x, y) => out.add(K(x, y)));
  }
  return [...out];
}
// The selection mode from the keys held: Shift adds, Alt takes away, both keep only the overlap
const SEL_SHAPES = ['rect', 'ellipse', 'lasso', 'polygon', 'wand'];
const SEL_NAMES = { rect: 'Rectangle', ellipse: 'Ellipse', lasso: 'Lasso', polygon: 'Polygon', wand: 'Magic wand' };
const selMode = e => e.shiftKey && e.altKey ? 'int' : e.shiftKey ? 'add' : e.altKey ? 'sub' : 'new';
// Magic wand: the connected cells with the same character as x, y (inside the canvas), or every matching cell
// (Contiguous off). Looks at the active layer or at everything you see (Look at: All). Blank cells match blank cells.
function wandCells(x, y) {
  if (x < 0 || y < 0 || x >= S.w || y >= S.h) { toast('Click inside the canvas to use the wand', 'warn'); return null; }
  const lay = L(), get = S.selSample === 'all' ? (a, b) => { const c = compositeAt(a, b); return c === SOLID ? null : c; }
    : (a, b) => lay.cells.has(K(a, b)) ? lay.cells.get(K(a, b)) : null;
  const target = get(x, y), out = new Set();
  if (!S.wandContig) {
    for (let j = 0; j < S.h; j++) for (let i = 0; i < S.w; i++) if (get(i, j) === target) out.add(K(i, j));
    if (target != null) for (const l of S.selSample === 'all' ? S.layers.filter(l => l.visible) : [lay])
      for (const [k, c] of l.cells) if (c === target && get(...unK(k)) === target) out.add(k);   // art outside the canvas too
    return out;
  }
  const stack = [[x, y]]; out.add(K(x, y));
  while (stack.length) {
    const [cx, cy] = stack.pop();
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      const k = K(nx, ny);
      if (out.has(k) || nx < 0 || ny < 0 || nx >= S.w || ny >= S.h || get(nx, ny) !== target) continue;
      out.add(k); stack.push([nx, ny]);
    }
  }
  return out;
}
// Polygon selection: the cells inside the clicked points, plus the cells its edges cross (points are cells: use their centers)
const polySelCells = pts => lassoCells(pts.map(p => ({ x: p.x + 0.5, y: p.y + 0.5 })));
function finishSelPoly(cancel) {
  const sp = S.selPoly; S.selPoly = null;
  if (!cancel && sp && sp.pts.length >= 2) applyCells(polySelCells(sp.pts), sp.mode);
  redraw();
}
// The character at a cell: what you see ('all') or what's on the active layer ('layer'); null for blank
function pickAt(c, sample) {
  const got = sample === 'layer' ? L().cells.get(K(c.x, c.y)) : compositeAt(c.x, c.y);
  return got || null;   // an opaque space counts: you can pick it and draw with it
}
// Select all (Ctrl A): the canvas plus anything drawn outside it, on any layer, so nothing is left out.
// Select canvas (Ctrl Shift A): just the canvas area.
function selectAll() {
  commitFloat();
  let x0 = 0, y0 = 0, x1 = S.w - 1, y1 = S.h - 1;
  for (const l of S.layers) for (const k of l.cells.keys()) { const [x, y] = unK(k); if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  applyRect(x0, y0, x1, y1, 'new');
}
function selectCanvas() { commitFloat(); applyRect(0, 0, S.w - 1, S.h - 1, 'new'); }
function deselect() { if (S.float) commitFloat(); S.sel = null; updateInfo(); redraw(); }

// Text of a block: rows from a lookup, trailing spaces trimmed.
function blockText(get, x, y, w, h) {
  const rows = [];
  for (let j = 0; j < h; j++) {
    let row = '';
    for (let i = 0; i < w; i++) { const c = get(x + i, y + j); row += !c || c === SOLID ? ' ' : c; }
    rows.push(row.replace(/\s+$/, ''));
  }
  return rows.join('\n');
}
function selectionText() {
  if (S.float) { const f = S.float; return blockText((x, y) => f.cells.get(K(x, y)), 0, 0, f.w, f.h); }
  if (!S.sel) return null;
  const b = selBounds(S.sel), lay = L();
  return blockText((x, y) => S.sel.has(K(x, y)) ? lay.cells.get(K(x, y)) : null, b.x, b.y, b.w, b.h);
}
// Copy merged: the selection as you see it, across all visible layers (and a floating block on top).
function mergedSelectionText() {
  const f = S.float;
  const cells = f ? [...f.cells.keys()].map(k => { const [dx, dy] = unK(k); return K(f.x + dx, f.y + dy); }) : S.sel ? [...S.sel] : null;
  if (!cells || !cells.length) return null;
  const set = new Set(cells), b = selBounds(set);
  const at = (x, y) => {
    if (!set.has(K(x, y))) return null;
    if (f) { const c = f.cells.get(K(x - f.x, y - f.y)); if (c && c !== ' ') return c; }
    return compositeAt(x, y);
  };
  return blockText(at, b.x, b.y, b.w, b.h);
}
async function copyMerged() {
  const t = mergedSelectionText();
  if (t == null) return toast('Select an area to copy merged', 'warn');
  await writeClipboard(t);
  toast('Copied merged (all visible layers)');
}
function deleteSelection() {
  if (S.float) { const lifted = S.float.lifted; S.float = null; if (lifted) changed(); redraw(); return; }
  if (!S.sel) return;
  if (textLock('Deleting')) return;
  pushUndo();
  const lay = L();
  for (const k of S.sel) lay.cells.delete(k);
  changed();
}

// ---------- floating blocks (paste / move) ----------
// copy: leave the original where it is (Alt-drag) and float a copy of it
function liftSelection(copy) {
  if (S.float) return true;
  if (!S.sel || !S.sel.size) return false;
  if (textLock('Moving part of it')) return false;
  // Nothing to lift (the outline was moved off the art, or the art is on another layer): say so instead of moving blanks
  let any = false;
  for (const k of S.sel) if (L().cells.has(k)) { any = true; break; }
  if (!any) {
    const other = S.layers.some((l, i) => i !== S.active && [...S.sel].some(k => l.cells.has(k)));
    toast(other ? 'The selection is empty on this layer (the art is on another layer)' : 'The selection is empty: nothing to move', 'warn');
    return false;
  }
  pushUndo();
  const b = selBounds(S.sel), lay = L(), cells = new Map();
  for (const k of S.sel) {
    const [x, y] = unK(k);
    cells.set(K(x - b.x, y - b.y), lay.cells.get(k) || ' ');
    if (!copy) lay.cells.delete(k);
  }
  S.float = { cells, x: b.x, y: b.y, w: b.w, h: b.h, lifted: true, copy: !!copy, origSel: S.sel };
  S.sel = null;
  changed();
  return true;
}
function floatFromText(text, x, y) {
  commitFloat();
  let rows = text.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
  while (rows.length > 1 && !rows[rows.length - 1].trim()) rows.pop();
  const cells = new Map();
  let w = 0;
  rows.forEach((r, j) => { const cs = chars(r); w = Math.max(w, cs.length); cs.forEach((c, i) => cells.set(K(i, j), c)); });
  if (!w) return toast('Nothing to paste');
  if (x == null) {
    if (S.sel) { const b = selBounds(S.sel); x = b.x; y = b.y; }
    else if (S.cursor && S.tool === 'type') { x = S.cursor.x; y = S.cursor.y; }
    else {   // middle of the view, kept on the canvas
      const c = cellAt(vp.clientWidth / 2, vp.clientHeight / 2);
      x = clamp(c.x - (w >> 1), 0, Math.max(0, S.w - w)); y = clamp(c.y - (rows.length >> 1), 0, Math.max(0, S.h - rows.length));
    }
  }
  S.float = { cells, x, y, w, h: rows.length, lifted: false, origSel: null };
  S.sel = null;
  if (S.tool !== 'move') setTool('move');
  updateInfo(); redraw();
}
// replaceBlanks: true = solid white space, one-off (blank cells wipe what is under them); default = the White space setting
function commitFloat(replaceBlanks) {
  const f = S.float;
  if (!f) return;
  const erase = typeof replaceBlanks === 'boolean' ? replaceBlanks : S.spacesErase;
  if (!f.lifted) pushUndo();
  if (textLocked()) { S.layers.splice(S.active + 1, 0, makeLayer('Layer ' + (S.layers.length + 1))); S.active++; toast('Dropped on a new layer (the active one is a text layer)'); }
  const lay = L(), sel = new Set();
  // with mirror on (Move, or Select with Ctrl), the mirrored copy goes too: the mirrored original is lifted away
  // (unless this was a copy) and the block lands mirrored on the other side as well
  const maps = mirrorMaps(S.tool === 'select' ? 'select' : 'move').slice(1);
  if (maps.length && f.lifted && !f.copy && f.origSel) for (const k of f.origSel) { const [x, y] = unK(k); for (const m of maps) lay.cells.delete(K(m.x(x), m.y(y))); }
  for (const [rk, c] of f.cells) {
    const [dx, dy] = unK(rk), x = f.x + dx, y = f.y + dy;
    if (c !== ' ') lay.cells.set(K(x, y), c);
    else if (erase) lay.cells.delete(K(x, y));
    sel.add(K(x, y));
  }
  for (const m of maps) for (const [rk, c] of f.cells) {
    const [dx, dy] = unK(rk), X = m.x(f.x + dx), Y = m.y(f.y + dy);
    if (sel.has(K(X, Y))) continue;   // where the copies overlap, the block itself wins
    if (c !== ' ') lay.cells.set(K(X, Y), m.c(c)); else if (erase) lay.cells.delete(K(X, Y));
  }
  S.float = null;
  S.sel = sel;
  S.lastTag = null;
  changed();
}
function cancelFloat() {
  const f = S.float;
  if (!f) return;
  S.float = null;
  // A lifted block goes back where it was: the last undo step was taken right before the lift.
  if (f.lifted && S.undo.length) { restore(S.undo.pop()); S.sel = f.origSel; S.lastTag = null; }
  redraw(); updateInfo();
}
function moveFloat(dx, dy) {
  if (!S.float && !liftForMove()) return;
  S.float.x += dx; S.float.y += dy;
  updateInfo(); redraw();
}
// Lift the selection for moving; with nothing selected, lift everything on the active layer (like Photoshop).
function liftForMove(copy) {
  if (S.float) return true;
  if (!S.sel) {
    if (!L().cells.size) { toast('Nothing on this layer to move', 'warn'); return false; }
    S.sel = new Set(L().cells.keys());
  }
  return liftSelection(copy);
}
// Move tool + Ctrl / Cmd click: make the top visible layer with a character under the pointer the active one
function pickLayerAt(c) {
  for (let i = S.layers.length - 1; i >= 0; i--) {
    const l = S.layers[i];
    if (!l.visible || !l.cells.has(K(c.x, c.y))) continue;
    if (i !== S.active) { commitFloat(); S.active = i; renderLayers(); updateInfo(); toast('Layer: ' + l.name); }
    return true;
  }
  return false;
}
function shiftSet(set, dx, dy) {
  const out = new Set();
  for (const k of set) { const [x, y] = unK(k); out.add(K(x + dx, y + dy)); }
  return out;
}
// Select tool: arrows nudge the outline, not the content.
function moveOutline(dx, dy) {
  if (!S.sel) return;
  S.sel = shiftSet(S.sel, dx, dy);
  updateInfo(); redraw();
}

// Flipping swaps characters that point one way, so a flipped slope still reads right.
const FLIP_H = { '/': '\\', '\\': '/', '(': ')', ')': '(', '<': '>', '>': '<', '[': ']', ']': '[', '{': '}', '}': '{', 'b': 'd', 'd': 'b', 'p': 'q', 'q': 'p', '┌': '┐', '┐': '┌', '└': '┘', '┘': '└', '├': '┤', '┤': '├', '╱': '╲', '╲': '╱', '▌': '▐', '▐': '▌' };
const FLIP_V = { '/': '\\', '\\': '/', '^': 'v', 'v': '^', '.': "'", "'": '.', ',': '`', '`': ',', '┌': '└', '└': '┌', '┐': '┘', '┘': '┐', '┬': '┴', '┴': '┬', '╱': '╲', '╲': '╱', '▀': '▄', '▄': '▀' };
function flip(horizontal) {
  if (!S.float && !liftSelection()) return toast('Select something to flip', 'warn');
  const f = S.float, map = horizontal ? FLIP_H : FLIP_V, out = new Map();
  for (const [rk, c] of f.cells) {
    const [dx, dy] = unK(rk);
    out.set(horizontal ? K(f.w - 1 - dx, dy) : K(dx, f.h - 1 - dy), map[c] || c);
  }
  f.cells = out;
  redraw();
}

// ---------- typing ----------
function setCursor(x, y) { S.cursor = { x, y, lineX: x }; S.lastTag = null; S.blinkOn = true; updateInfo(); redraw(); }
// The last 5 different characters actually placed (brush or typing), newest first.
function noteRecent(c) {
  if (!c || c === ' ' || S.recent[0] === c) return;
  S.recent = [c, ...S.recent.filter(r => r !== c)].slice(0, 30);   // the Recent row shows as many as fit
  savePrefs();
  renderRecent();
}
// Typing inside a selection flows in reading order: the next selected cell to the right on this row,
// else the leftmost selected cell of the next row down (dir -1 goes backwards). null = no more cells.
function selStep(x, y, dir) {
  let best = null;
  for (const k of S.sel) {
    const [cx, cy] = unK(k);
    const after = dir > 0 ? (cy > y || (cy === y && cx > x)) : (cy < y || (cy === y && cx < x));
    if (!after) continue;
    if (!best || (dir > 0 ? (cy < best.y || (cy === best.y && cx < best.x)) : (cy > best.y || (cy === best.y && cx > best.x)))) best = { x: cx, y: cy };
  }
  return best;
}
// Enter inside a selection: the leftmost selected cell of the next row that has any.
function selNextRow(y) {
  let best = null;
  for (const k of S.sel) {
    const [cx, cy] = unK(k);
    if (cy > y && (!best || cy < best.y || (cy === best.y && cx < best.x))) best = { x: cx, y: cy };
  }
  return best;
}
// Insert typing: move the cells on row y from x on by dx (1 = make room, -1 = close the gap). Not inside a selection.
const inserting = () => S.typeInsert && !S.sel;
function shiftRow(y, x, dx) {
  const lay = L(), moving = [];
  for (const [k, c] of lay.cells) { const [cx, cy] = unK(k); if (cy === y && cx >= x) moving.push([cx, c]); }
  for (const [cx] of moving) lay.cells.delete(K(cx, y));
  for (const [cx, c] of moving) lay.cells.set(K(cx + dx, y), c);
}
function setTypeInsert(on) {
  S.typeInsert = on; savePrefs(); S.blinkOn = true;
  if (S.tool === 'type') renderOptions();
  toast(on ? 'Insert: typing pushes the rest of the row along' + (S.sel ? ' (not inside a selection)' : '') : 'Overwrite: typing replaces what is there');
  redraw();
}
function typeChar(c) {
  const cur = S.cursor; if (!cur) return;
  if (textLock('Typing')) return;
  if (!editable(cur.x, cur.y)) { warnOutside('Typing'); S.blinkOn = true; redraw(); return; }
  pushUndo('type');
  if (inserting()) shiftRow(cur.y, cur.x, 1);
  putCell(L(), cur.x, cur.y, c);
  noteRecent(c);
  if (S.sel) { const n = selStep(cur.x, cur.y, 1); if (n) { cur.x = n.x; cur.y = n.y; } else cur.x++; }
  else cur.x++;
  S.blinkOn = true;
  changed();
}

// ---------- painting ----------
const toolSize = () => S.tool === 'pencil' ? S.pencil : S.brush;
function brushOffsets(size, tip) {
  const w = size, h = Math.max(1, Math.round(size * S.cw / S.ch));   // look square on tall cells
  const out = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (tip === 'round' && size > 2) {
      const ux = (i + 0.5) / w * 2 - 1, uy = (j + 0.5) / h * 2 - 1;
      if (ux * ux + uy * uy > 1.08) continue;
    }
    out.push([i - ((w - 1) >> 1), j - ((h - 1) >> 1)]);
  }
  return out;
}
// With a selection, Brush / Eraser / Type only change cells inside it (like Photoshop).
const editable = (x, y) => !S.sel || S.sel.has(K(x, y));
function warnOutside(what) {
  toast(what + ' only inside the selection · Ctrl D clears it', 'warn');
  const n = $('#help .help-state'); if (n) shake(n);
}
// Mirror painting (Pencil, Brush, Eraser): the cells a paint at x, y also lands on, across the mirror lines,
// with the characters flipped to match (/ becomes \ and so on) when Flip characters is on.
const mirrorOn = (tool = S.tool) => S.mirror !== 'off' && MIRROR_TOOLS.includes(tool) && !!S.mirrorUse[tool];   // the tool's "uses mirror" toggle
const mirrorX = () => S.mirrorAt.x ?? S.w / 2, mirrorY = () => S.mirrorAt.y ?? S.h / 2;
// The mirror as transforms: the first is "as is", then one per mirrored copy, each mapping x, y and the character.
// cfg: { mode: 'h' | 'v' | 'both', x, y (the lines), flip (flip the characters) }.
function mirrorMapsFor(cfg) {
  const id = { x: v => v, y: v => v, c: v => v }, out = [id];
  if (!cfg || cfg.mode === 'off') return out;
  const mx = v => 2 * cfg.x - 1 - v, my = v => 2 * cfg.y - 1 - v;
  const fh = v => v == null || !cfg.flip ? v : FLIP_H[v] || v, fv = v => v == null || !cfg.flip ? v : FLIP_V[v] || v;
  if (cfg.mode === 'h' || cfg.mode === 'both') out.push({ x: mx, y: id.y, c: fh });
  if (cfg.mode === 'v' || cfg.mode === 'both') out.push({ x: id.x, y: my, c: fv });
  if (cfg.mode === 'both') out.push({ x: mx, y: my, c: v => fv(fh(v)) });
  return out;
}
const mirrorCfg = () => ({ mode: S.mirror, x: mirrorX(), y: mirrorY(), flip: S.mirrorFlip });
const mirrorMaps = (tool = S.tool) => mirrorMapsFor(mirrorOn(tool) ? mirrorCfg() : null);
const mirrorTargets = (x, y, c, tool) => mirrorMaps(tool).map(m => [m.x(x), m.y(y), m.c(c)]);
// a cell map (key -> character, or a number) plus its mirrored copies, for previews; the original wins where they overlap
function mirrorMap(m) {
  const maps = mirrorMaps(); if (maps.length < 2 || !m) return m;
  const out = new Map(m); out.total = m.total;
  for (const mp of maps.slice(1)) for (const [k, v] of m) { const [x, y] = unK(k), k2 = K(mp.x(x), mp.y(y)); if (!out.has(k2)) out.set(k2, typeof v === 'string' ? mp.c(v) : v); }
  return out;
}
// a set of cells plus their mirrored copies (selections)
function mirrorCellSet(cells, tool) {
  const maps = mirrorMaps(tool); if (maps.length < 2) return cells;
  const out = new Set();
  for (const k of cells) { const [x, y] = unK(k); for (const m of maps) out.add(K(m.x(x), m.y(y))); }
  return out;
}
// The mirror lines' drag handles: small tabs just outside the canvas, at both ends of each line.
// Returns 'x' (the left-right line, which sits at an x), 'y' (the top-bottom line) or null.
function mirrorHandleAt(px, py) {
  if (S.mirror === 'off') return null;   // (any tool can move the lines, mirroring or not)
  const cw = S.cw, ch = S.ch, X = S.offX + mirrorX() * cw, Y = S.offY + mirrorY() * ch;
  const top = S.offY, bottom = S.offY + S.h * ch, left = S.offX, right = S.offX + S.w * cw;
  if (S.mirror !== 'v' && Math.abs(px - X) <= Math.max(7, cw * 0.7) && ((py < top && py > top - ch - 4) || (py > bottom && py < bottom + ch + 4))) return 'x';
  if (S.mirror !== 'h' && Math.abs(py - Y) <= Math.max(7, ch * 0.45) && ((px < left && px > left - 2 * cw - 4) || (px > right && px < right + 2 * cw + 4))) return 'y';
  return null;
}
// Drag a mirror line to px, py: it snaps to half cells, and stays on the canvas
function dragMirror(axis, px, py) {
  const v = axis === 'x' ? (px - S.offX) / S.cw : (py - S.offY) / S.ch;
  const at = clamp(Math.round(v * 2) / 2, 0, axis === 'x' ? S.w : S.h);
  S.mirrorAt[axis] = at === (axis === 'x' ? S.w : S.h) / 2 ? null : at;   // back in the middle = follows the canvas again
  updateInfo(); redraw();
}
function centerMirror() { S.mirrorAt = { x: null, y: null }; changed(); toast('Mirror: back in the middle'); }
// Paint one cell (and its mirror copies). only: change a cell only if it holds that character (Eraser's right button).
function putCell(lay, x, y, c, only) {
  const done = new Set();
  for (const [X, Y, v] of mirrorTargets(x, y, c)) {
    if (done.has(K(X, Y))) continue;   // a cell on a mirror line is its own copy: keep what was painted there
    done.add(K(X, Y));
    if ((X !== x || Y !== y) && !editable(X, Y)) continue;
    if (only !== undefined && lay.cells.get(K(X, Y)) !== only) continue;
    setCell(lay, X, Y, v);
  }
}
// Stamp the brush at x, y. c: a character, null = erase, undefined = whatever the Paint setting says.
// only: see putCell. Returns true if some of the brush fell outside the selection.
function stamp(x, y, c, only) {
  const lay = L(); let blocked = false;
  const ts = toolSize();
  for (const [dx, dy] of brushOffsets(ts.size, ts.tip)) {
    const X = x + dx, Y = y + dy;
    if (!editable(X, Y)) { blocked = true; continue; }
    if (c !== undefined) { putCell(lay, X, Y, c, only); continue; }
    const p = paintChar(X, Y, false);
    if (p !== undefined) putCell(lay, X, Y, p);
  }
  return blocked;
}

// ---------- paint sources (Brush + Fill) ----------
// Patterns are tiles lined up to the canvas grid, so neighboring fills match. Spaces in a tile are blank.
const PATTERNS = {
  'Checker': ['# ', ' #'],
  'Bricks': ['___|', '_|__'],
  'Diagonal': ['  /', ' / ', '/  '],
  'Diamonds': ['/\\', '\\/'],
  'Grid': ['+---', '|   '],
  'Dots': ['.   ', '  . '],
  'Waves': ["_.-'^'-.", '        '],
  'Weave': ['|=', '=|'],
  'Stripes': ['=', ' '],
  'Stars': ['*      ', '   .   ', '      +', ' .     ', '    .  '],
};
let patCache = null;
function patternGrid() {
  const rows = S.paint.pattern.rows, key = rows.join('\n');
  if (patCache && patCache.key === key) return patCache;
  const g = rows.map(r => chars(r)), w = Math.max(1, ...g.map(r => r.length));
  return (patCache = { key, g, w, h: Math.max(1, g.length) });
}
// The character to paint at x, y. undefined = leave the cell alone (brush); fills get ' ' (blank) instead.
// White space in noise / patterns: 'through' (Clear) leaves what's under it, 'replace' (Solid) makes it blank. Brush and Fill each keep their own.
function paintChar(x, y, forFill) {
  const p = S.paint, miss = (forFill ? S.blanksFill : S.blanksBrush) === 'replace' ? ' ' : undefined;
  if (p.mode === 'noise') {
    const set = chars(p.noise.set).filter(c => c !== ' ');
    if (!set.length || Math.random() * 100 >= p.noise.density) return miss;
    return set[(Math.random() * set.length) | 0];
  }
  if (p.mode === 'pattern') {
    const { g, w, h } = patternGrid();
    const c = (g[((y % h) + h) % h] || [])[((x % w) + w) % w] || ' ';
    return c === ' ' ? miss : c;
  }
  if (p.mode === 'ramp') { const set = chars(p.ramp.set).filter(c => c !== ' '); return set[set.length - 1] || S.brush.ch; }
  return S.brush.ch;
}

// ---------- fill ----------
// Flood fill: the connected area of the same character, inside the canvas (and the selection, if there is one).
// every: fill every cell on the canvas with that character, connected or not (Contiguous off, or Shift-click)
function floodFill(x, y, every) {
  if (textLock('Filling')) return;
  if (x < 0 || y < 0 || x >= S.w || y >= S.h) return toast('Click inside the canvas to fill', 'warn');
  if (!editable(x, y)) return warnOutside('Filling');
  commitFloat();
  const lay = L();
  const get = S.fillSample === 'all' ? (a, b) => compositeAt(a, b) : (a, b) => lay.cells.has(K(a, b)) ? lay.cells.get(K(a, b)) : null;
  // the area to fill from a start cell: connected cells with its character (or all of them, every)
  const region = (x, y) => {
    const target = get(x, y), seen = new Set([K(x, y)]), stack = [[x, y]], cells = [];
    if (every) {
      stack.length = 0;
      for (let j = 0; j < S.h; j++) for (let i = 0; i < S.w; i++) if (editable(i, j) && get(i, j) === target) cells.push([i, j]);
    }
    while (stack.length) {
      const [cx, cy] = stack.pop();
      cells.push([cx, cy]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy, k = K(nx, ny);
        if (seen.has(k) || nx < 0 || ny < 0 || nx >= S.w || ny >= S.h || !editable(nx, ny) || get(nx, ny) !== target) continue;
        seen.add(k); stack.push([nx, ny]);
      }
    }
    return cells;
  };
  // with mirror on, the mirrored start cells fill their own areas too (the characters flipped to match)
  const jobs = [];
  for (const m of mirrorMaps()) {
    const sx = m.x(x), sy = m.y(y);
    if (sx < 0 || sy < 0 || sx >= S.w || sy >= S.h || !editable(sx, sy)) continue;
    jobs.push([region(sx, sy), m.c]);   // all worked out before anything changes
  }
  pushUndo();
  const done = new Set();
  for (const [cells, flipC] of jobs) for (const [cx, cy] of cells) {
    if (done.has(K(cx, cy))) continue; done.add(K(cx, cy));
    const p = paintChar(cx, cy, true); if (p !== undefined) setCell(lay, cx, cy, flipC(p));
  }
  if (S.paint.mode === 'char') noteRecent(S.brush.ch);
  changed();
}
// Fill every selected cell (Alt Backspace).
function fillSelection() {
  if (S.float) commitFloat();
  if (!S.sel) return toast('Select an area to fill', 'warn');
  if (textLock('Filling')) return;
  pushUndo();
  const lay = L();
  for (const k of S.sel) { const [x, y] = unK(k), p = paintChar(x, y, true); if (p !== undefined) setCell(lay, x, y, p); }
  if (S.paint.mode === 'char') noteRecent(S.brush.ch);
  changed();
}
function setPattern(name, rows) {
  S.paint.pattern = { name, rows };
  S.paint.mode = 'pattern';
  savePrefs(); renderOptions(); redraw();
}
// ---------- pattern library: the presets + your own (saved in the browser) ----------
const PATTERNS_KEY = 'asxii.patterns';
function loadCustomPatterns() {
  try {
    const a = JSON.parse(localStorage.getItem(PATTERNS_KEY));
    if (Array.isArray(a)) S.patterns = a.filter(p => p && typeof p.name === 'string' && Array.isArray(p.rows) && p.rows.length).map(p => ({ name: p.name, rows: p.rows.map(String) }));
  } catch {}
}
function saveCustomPatterns() { try { localStorage.setItem(PATTERNS_KEY, JSON.stringify(S.patterns)); } catch {} }
const allPatterns = () => [...Object.keys(PATTERNS).map(n => ({ name: n, rows: PATTERNS[n], custom: false })), ...S.patterns.map(p => ({ ...p, custom: true }))];
// A tile repeated to cols x nrows, as text (for previews and thumbnails).
function tileText(rows, cols, nrows) {
  const g = rows.map(r => chars(r)), w = Math.max(1, ...g.map(r => r.length)), h = Math.max(1, g.length), out = [];
  for (let y = 0; y < nrows; y++) { let r = ''; for (let x = 0; x < cols; x++) r += (g[y % h] || [])[x % w] || ' '; out.push(r); }
  return out.join('\n');
}
// Select tool: "Make pattern" turns the selection into a tile and asks for a name.
let patDraft = null;
function openPatternDialog() {
  const t = selectionText();
  if (!t || !t.trim()) return toast('Select some art first, then Make pattern', 'warn');
  const rows = t.split('\n'), w = Math.max(...rows.map(r => chars(r).length));
  patDraft = rows.map(r => r + ' '.repeat(w - chars(r).length));
  $('#patTile').textContent = patDraft.join('\n');
  $('#patTiled').textContent = tileText(patDraft, 28, 8);
  let n = 1; while (allPatterns().some(p => p.name === 'Pattern ' + n)) n++;
  const inp = $('#patName'); inp.value = 'Pattern ' + n;
  $('#patDlg').hidden = false;
  inp.focus(); inp.select();
}
function closePatternDialog() { $('#patName').blur(); $('#patDlg').hidden = true; patDraft = null; }
function savePatternDraft() {
  if (!patDraft) return;
  let name = $('#patName').value.trim() || 'Pattern';
  const base = name; let n = 2;
  while (allPatterns().some(p => p.name === name)) name = base + ' ' + n++;
  S.patterns.push({ name, rows: patDraft });
  saveCustomPatterns();
  S.paint.pattern = { name, rows: patDraft }; S.paint.mode = 'pattern'; savePrefs();
  closePatternDialog();
  toast(`Saved pattern "${name}": Brush and Fill can paint with it`);
  renderOptions();
}
function deleteCustomPattern(name) {
  S.patterns = S.patterns.filter(p => p.name !== name);
  saveCustomPatterns();
  toast(`Deleted pattern "${name}"`);
}
// The pattern list that drops down from the pattern button in the options bar.
function openPatternMenu(btn) {
  const m = $('#patMenu');
  if (!m.hidden) return closePatternMenu();
  const cur = S.paint.pattern.name;
  m.innerHTML = allPatterns().map(p =>
    `<div class="patitem${p.name === cur ? ' on' : ''}${p.custom ? ' custom' : ''}" data-name="${esc(p.name)}">` +
    `<pre class="thumb">${esc(tileText(p.rows, 10, 3))}</pre>` +
    `<span class="pname">${esc(p.name)}</span>` +
    (p.custom ? `<span class="ptag">custom</span><button class="btn pdel" title="Delete this pattern">×</button>` : '') +
    `</div>`).join('') +
    `<div class="patnote">Make your own: select some art, then <b>Make pattern</b> in the Select tool's options (or the Edit menu).</div>`;
  const r = btn.getBoundingClientRect();
  m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 300)) + 'px';
  m.style.top = (r.bottom + 6) + 'px';
  m.hidden = false;
  $$('.patitem', m).forEach(el => el.addEventListener('click', e => {
    const p = allPatterns().find(q => q.name === el.dataset.name); if (!p) return;
    if (e.target.classList.contains('pdel')) {
      deleteCustomPattern(p.name);
      if (S.paint.pattern.name === p.name) S.paint.pattern = { name: 'Checker', rows: PATTERNS.Checker };
      closePatternMenu(); renderOptions(); openPatternMenu($('.opts .patbtn'));
      return;
    }
    setPattern(p.name, p.rows); closePatternMenu();
  }));
}
function closePatternMenu() { const m = $('#patMenu'); if (m) m.hidden = true; }
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('#patMenu, .patbtn')) closePatternMenu();
  if (!e.target.closest('#fontMenu, .fontbtn')) closeFontMenu();
  if (!e.target.closest('#paintMenu, .paintbtn')) closePaintMenu();
});

// ---------- what to paint with: Character / Noise / Pattern (Advanced brush + Fill) ----------
const PAINT_MODES = {
  char: { name: 'Character', desc: 'One character, everywhere you paint. Choose it in the bar, from Recent, or with the Picker (I).' },
  noise: { name: 'Noise', desc: 'Random characters from a set you type, scattered at a density. Good for texture, static, dust and glitches.' },
  ramp: { name: 'Ramp', brushOnly: true, desc: 'Characters that change along the stroke: the first one at each end, stepping to the last one in the middle over the Ramp length (with Taper, in step with the width). Brush only.' },
  pattern: { name: 'Pattern', desc: 'A repeating tile, lined up to the canvas grid so separate strokes and fills join up. Make your own with Make pattern (Select tool).' },
};
// A small live preview for each mode: the character, a sprinkle of the noise set, a bit of the pattern.
function modeIcon(m) {
  if (m === 'char') return S.brush.ch;
  if (m === 'ramp') return chars(S.paint.ramp.set).slice(0, 3).join('') || '...';
  if (m === 'noise') { const set = chars(S.paint.noise.set).filter(c => c !== ' '); return set.length ? [0, 2, 1].map(i => set[i % set.length]).join('') : '...'; }
  return tileText(S.paint.pattern.rows, 3, 1);
}
function openPaintMenu(btn) {
  const m = $('#paintMenu');
  if (!m.hidden) return closePaintMenu();
  m.innerHTML = Object.keys(PAINT_MODES).filter(k => !PAINT_MODES[k].brushOnly || S.tool === 'brush').map(k =>
    `<div class="pmitem${S.paint.mode === k ? ' on' : ''}" data-pmode="${k}">` +
    `<span class="micon big">${esc(k === 'pattern' ? tileText(S.paint.pattern.rows, 4, 2) : k === 'noise' ? noiseSample() : k === 'ramp' ? rampMirror(S.paint.ramp.set, 9) : S.brush.ch)}</span>` +
    `<div class="pmtext"><div class="pmname">${PAINT_MODES[k].name}</div><div class="pmdesc">${esc(PAINT_MODES[k].desc)}</div></div></div>`).join('');
  markSolid();
  const r = btn.getBoundingClientRect();
  m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 340)) + 'px';
  m.style.top = (r.bottom + 6) + 'px';
  m.hidden = false;
  $$('.pmitem', m).forEach(el => el.addEventListener('click', () => {
    S.paint.mode = el.dataset.pmode; savePrefs(); closePaintMenu(); renderOptions(); redraw();
  }));
}
// ---------- noise presets + picker (like ramps and patterns) ----------
const NOISES = {
  'Dust':    { set: ".,'`", density: 25 },
  'Static':  { set: '.:#%@', density: 55 },
  'Glitch':  { set: '/\\|-_', density: 40 },
  'Sparkle': { set: '.+*', density: 12 },
  'Snow':    { set: '*.·', density: 20 },
  'Grass':   { set: 'v,\'"', density: 45 },
  'Sand':    { set: '.:,', density: 65 },
  'Binary':  { set: '01', density: 50 },
  'Rubble':  { set: 'oO0@.', density: 35 },
  'Shade':   { set: '░▒▓', density: 60 },
};
const NOISES_KEY = 'asxii.noises';
function loadCustomNoises() {
  try { const a = JSON.parse(localStorage.getItem(NOISES_KEY)); if (Array.isArray(a)) S.noises = a.filter(n => n && typeof n.name === 'string' && typeof n.set === 'string').map(n => ({ name: n.name, set: n.set, density: clamp(+n.density || 50, 5, 100) })); } catch {}
}
function saveCustomNoises() { try { localStorage.setItem(NOISES_KEY, JSON.stringify(S.noises)); } catch {} }
const allNoises = () => [...Object.keys(NOISES).map(n => ({ name: n, ...NOISES[n], custom: false })), ...S.noises.map(n => ({ ...n, custom: true }))];
// A sample patch of a noise, the same every time (seeded), so presets are easy to compare.
function noisePatch(set, density, w = 12, h = 3) {
  const c = chars(set).filter(x => x !== ' ');
  if (!c.length) return '';
  let seed = 7, r = '';
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) r += rnd() * 100 < density ? c[(rnd() * c.length) | 0] : ' '; if (y < h - 1) r += '\n'; }
  return r;
}
function setNoise(name, set, density) { S.paint.noise = { name, set, density }; S.paint.mode = 'noise'; savePrefs(); renderOptions(); redraw(); }
function openNoiseMenu(btn) {
  const m = $('#noiseMenu');
  if (!m.hidden) return closeNoiseMenu();
  const cur = S.paint.noise.name;
  m.innerHTML = allNoises().map(n =>
    `<div class="patitem${n.name === cur ? ' on' : ''}${n.custom ? ' custom' : ''}" data-name="${esc(n.name)}">` +
    `<pre class="thumb">${esc(noisePatch(n.set, n.density))}</pre><span class="pname">${esc(n.name)} <span class="pdens">${n.density}%</span></span>` +
    (n.custom ? `<span class="ptag">custom</span><button class="btn pdel" title="Delete this noise">×</button>` : '') + `</div>`).join('') +
    `<div class="patnote">Make your own: <b>Customize</b> a noise, then <b>Save as new noise</b>.</div>`;
  placeUnder(m, btn, 320);
  $$('.patitem', m).forEach(el => el.addEventListener('click', e => {
    const n = allNoises().find(q => q.name === el.dataset.name); if (!n) return;
    if (e.target.classList.contains('pdel')) {
      S.noises = S.noises.filter(q => q.name !== n.name); saveCustomNoises(); toast(`Deleted noise "${n.name}"`);
      if (S.paint.noise.name === n.name) S.paint.noise = { name: 'Dust', ...NOISES.Dust };
      closeNoiseMenu(); renderOptions(); openNoiseMenu($('.opts .noisebtn'));
      return;
    }
    setNoise(n.name, n.set, n.density); closeNoiseMenu();
  }));
}
// ---------- Customize popover for Noise and Ramp (the same idea as the brush's) ----------
// kind: 'noise' | 'ramp'. Edits the current one live; "edited" + Reset when it differs from the saved one.
const setPopKinds = {
  noise: { cur: () => S.paint.noise, all: () => allNoises(), list: () => S.noises, store: () => saveCustomNoises(), word: 'noise',
    differs: (p, c) => p.set !== c.set || p.density !== c.density,
    preview: c => noisePatch(c.set, c.density, 34, 5) },
  ramp: { cur: () => S.paint.ramp, all: () => allRamps(), list: () => S.ramps, store: () => saveCustomRamps(), word: 'ramp',
    differs: (p, c) => p.set !== c.set,
    preview: c => rampMirror(c.set, 33) },
};
let setPopKind = null;
function setPopEdited(kind) {
  const K2 = setPopKinds[kind], c = K2.cur(), p = K2.all().find(x => x.name === c.name);
  return !p || K2.differs(p, c);
}
function openSetPop(kind, btn) {
  const p = $('#setPop');
  if (!p.hidden && setPopKind === kind) return closeSetPop();
  closeNoiseMenu(); closeRampMenu();
  setPopKind = kind;
  refreshSetPop(true);
  placeUnder(p, btn, 340);
}
function closeSetPop() { const p = $('#setPop'); if (p) p.hidden = true; }
function refreshSetPop(force) {
  const p = $('#setPop'); if (!p || (p.hidden && !force) || !setPopKind) return;
  const kind = setPopKind, K2 = setPopKinds[kind], c = K2.cur(), edited = setPopEdited(kind);
  const saved = K2.all().find(x => x.name === c.name);
  p.innerHTML =
    `<div class="bp-head"><span class="bp-title">${esc(c.name || 'Custom')}${edited ? ' <span class="bp-edited">edited</span>' : ''}</span>` +
    (edited && saved ? `<button class="btn small bp-reset" title="Back to the saved ${K2.word}">Reset</button>` : '') + `</div>` +
    `<pre class="bp-preview">${esc(K2.preview(c))}</pre>` +
    `<div class="bp-row"><span class="bp-label">Characters</span><input class="sp-set" type="text" value="${esc(c.set)}" spellcheck="false" title="${kind === 'ramp' ? 'Light to dense, from the end of the stroke to the middle' : 'Each painted cell gets a random one of these; repeats make one more common'}"></div>` +
    (kind === 'noise' ? `<div class="bp-row"><span class="bp-label">Density</span><span class="bp-note sp-densv">${c.density}%, set in the bar, is saved with it</span></div>` : '') +
    `<div class="bp-save"><input class="bp-name" type="text" maxlength="30" placeholder="New ${K2.word} name" spellcheck="false"><button class="btn primary bp-savebtn">Save as new ${K2.word}</button></div>`;
  const live = () => { $('.bp-preview', p).textContent = K2.preview(K2.cur()); savePrefs(); renderOptions(); redraw(); };
  $('.sp-set', p).addEventListener('input', e => { K2.cur().set = e.target.value; live(); });
  $('.sp-set', p).addEventListener('change', () => refreshSetPop());
  const dn = $('.sp-dens', p);
  if (dn) {
    dn.addEventListener('input', () => { S.paint.noise.density = +dn.value; $('.sp-densv', p).textContent = dn.value + '%'; live(); });
    dn.addEventListener('change', () => refreshSetPop());
  }
  const rs = $('.bp-reset', p);
  if (rs) rs.addEventListener('click', () => {
    if (kind === 'noise') setNoise(saved.name, saved.set, saved.density); else setRamp(saved.name, saved.set);
    refreshSetPop(true);
  });
  const save = () => {
    const cur = K2.cur();
    if (!chars(cur.set).filter(x => x !== ' ').length) return toast('Type some characters first', 'warn');
    let name = $('.bp-name', p).value.trim();
    if (!name) { $('.bp-name', p).focus(); return toast(`Give the ${K2.word} a name`, 'warn'); }
    const base = name; let n = 2;
    while (K2.all().some(x => x.name === name)) name = base + ' ' + n++;
    const item = kind === 'noise' ? { name, set: cur.set, density: cur.density } : { name, set: cur.set };
    K2.list().push(item); K2.store();
    cur.name = name; savePrefs();
    toast(`Saved ${K2.word} "${name}"`);
    renderOptions(); refreshSetPop(true);
  };
  $('.bp-savebtn', p).addEventListener('click', save);
  $('.bp-name', p).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); save(); } });
}
function closeNoiseMenu() { const m = $('#noiseMenu'); if (m) m.hidden = true; }
function noiseSample() {
  const set = chars(S.paint.noise.set).filter(c => c !== ' ');
  if (!set.length) return '';
  let r = '', n = 0; for (let y = 0; y < 2; y++) { for (let x = 0; x < 4; x++) r += [1, 0, 0, 1, 0, 1, 1, 0][(n++) % 8] ? set[(x + y * 3) % set.length] : ' '; r += y ? '' : '\n'; }
  return r;
}
function closePaintMenu() { const m = $('#paintMenu'); if (m) m.hidden = true; }
// ---------- Shape tool (U): rectangle, ellipse, line, polygon ----------
// Each builder returns { outline: Map key -> char, inside: Set of keys or null }. A ' ' in the outline places nothing.
const RECT_STYLES = {
  ascii:   { name: 'ASCII  +-|',     tl: '+', tr: '+', bl: '+', br: '+', h: '-', hb: '-', v: '|' },
  rounded: { name: "Rounded  .-'",   tl: '.', tr: '.', bl: "'", br: "'", h: '-', hb: '-', v: '|' },
  under:   { name: 'Underscore  _|', tl: ' ', tr: ' ', bl: '|', br: '|', h: '_', hb: '_', v: '|' },
  box:     { name: 'Box  ┌─┐',       tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', hb: '─', v: '│' },
  round:   { name: 'Round box  ╭─╮', tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', hb: '─', v: '│' },
  heavy:   { name: 'Heavy  ┏━┓',     tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', hb: '━', v: '┃' },
  double:  { name: 'Double  ╔═╗',    tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', hb: '═', v: '║' },
  char:    { name: 'Character' },
  none:    { name: 'None (fill only)' },
};
// Smart edges pick a character by which way the line runs on screen.
// ---------- Smart lines: one stroke, characters picked as it goes (Pencil: Smart; Shape: Line / Polygon) ----------
// pts are in cell units (a cell spans x .. x+1). Three styles:
//  ascii: by slope and where the stroke crosses the cell: | ( ) steep, / \ diagonal, - ' _ ` . , ´ shallow,
//         < > where a stroke turns back. One character per column (per row when steep), so it stays a clean line.
//  box:   walks the stroke cell to cell (never diagonally) and joins the sides it passes through: ─ │ ╭ ╮ ╰ ╯ ├ ┤ ┬ ┴ ┼.
//         Joins box lines already on the layer, so crossing or touching one makes the junction.
//  block: █ ▌ ▐ ▀ ▄ ▚ ▞ by slope and position.
// (After patorjk's ASCII Art Sketchpad, which the user pointed to.)
const SMART_STYLES = { ascii: 'ASCII', box: 'Box', block: 'Block' };
function asciiLineChar(sl, t, curve) {
  const r = Math.abs(sl);
  if (!Number.isFinite(sl) || r > 1.6) return curve < 0 ? '(' : curve > 0 ? ')' : '|';
  if (r > 0.75) return sl > 0 ? '\\' : '/';
  const i = t < 0.38 ? 0 : t > 0.66 ? 2 : 1;
  if (r > 0.15) return i === 1 ? '-' : sl > 0 ? (i === 0 ? '`' : '.') : (i === 0 ? '´' : ',');
  return i === 0 ? "'" : i === 1 ? '-' : '_';
}
function blockLineChar(sl, tx, ty) {
  const r = Math.abs(sl);
  if (!Number.isFinite(sl) || r > 1.6) return tx < 0.38 ? '▌' : tx > 0.66 ? '▐' : '█';
  if (r > 0.75) return sl > 0 ? '▚' : '▞';
  return ty < 0.38 ? '▀' : ty > 0.66 ? '▄' : '█';
}
// the cell rows (or columns) whose centers a stroke from a to b passes, in the order it passes them
function centersBetween(a, b) {
  const lo = Math.ceil(Math.min(a, b) - 0.5), hi = Math.floor(Math.max(a, b) - 0.5), out = [];
  for (let k = lo; k <= hi; k++) out.push(k);
  return b < a ? out.reverse() : out;
}
// the cells a stroke from a to b passes through, edge to edge (no diagonal steps)
function walk4(a, b, out) {
  let x = Math.floor(a.x), y = Math.floor(a.y);
  const X = Math.floor(b.x), Y = Math.floor(b.y), dx = b.x - a.x, dy = b.y - a.y, sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1;
  const tdx = dx === 0 ? Infinity : Math.abs(1 / dx), tdy = dy === 0 ? Infinity : Math.abs(1 / dy);
  let tx = dx === 0 ? Infinity : (sx > 0 ? x + 1 - a.x : a.x - x) * tdx, ty = dy === 0 ? Infinity : (sy > 0 ? y + 1 - a.y : a.y - y) * tdy;
  const last = out[out.length - 1]; if (!last || last.x !== x || last.y !== y) out.push({ x, y });
  let guard = Math.abs(X - x) + Math.abs(Y - y) + 4;
  while ((x !== X || y !== Y) && guard-- > 0) { if (tx < ty) { tx += tdx; x += sx; } else { ty += tdy; y += sy; } out.push({ x, y }); }
}
// box characters by the sides they join: 1 left, 2 right, 4 up, 8 down
const BOX_SHARP = ['─', '─', '─', '─', '│', '┘', '└', '┴', '│', '┐', '┌', '┬', '│', '┤', '├', '┼'];
const BOX_ROUND = ['─', '─', '─', '─', '│', '╯', '╰', '┴', '│', '╮', '╭', '┬', '│', '┤', '├', '┼'];
const BOX_BITS = (() => { const m = { '─': 3, '│': 12 }; for (const t of [BOX_SHARP, BOX_ROUND]) t.forEach((c, i) => { if (!(c in m)) m[c] = i; }); return m; })();
// opts: round (rounded box corners), plain (no turn-backs or curves: for straight shapes), base(x, y) = what's there
function smartPath(pts, style, opts = {}) {
  const m = new Map();
  if (!pts.length) return m;
  if (style === 'box') {
    const cells = []; let cur = null;
    for (const p of pts) {
      const q = { x: Math.floor(p.x), y: Math.floor(p.y) };
      if (!cur) { cur = q; cells.push(q); continue; }
      if (q.x === cur.x && q.y === cur.y) continue;
      // how far into the new cell the stroke has gone, from the side it came in
      const inX = q.x > cur.x ? p.x - q.x : q.x < cur.x ? q.x + 1 - p.x : 1, inY = q.y > cur.y ? p.y - q.y : q.y < cur.y ? q.y + 1 - p.y : 1;
      if (Math.min(inX, inY) < 0.2 && Math.abs(q.x - cur.x) <= 1 && Math.abs(q.y - cur.y) <= 1) continue;
      walk4({ x: cur.x + 0.5, y: cur.y + 0.5 }, { x: q.x + 0.5, y: q.y + 0.5 }, cells);
      cur = q;
    }
    const bits = new Map(), or = (c, b) => { const k = K(c.x, c.y); bits.set(k, (bits.get(k) || 0) | b); };
    cells.forEach((c, i) => {
      or(c, 0); if (!i) return;
      const p = cells[i - 1];
      if (c.x === p.x + 1) { or(p, 2); or(c, 1); } else if (c.x === p.x - 1) { or(p, 1); or(c, 2); }
      else if (c.y === p.y + 1) { or(p, 8); or(c, 4); } else if (c.y === p.y - 1) { or(p, 4); or(c, 8); }
    });
    const T = opts.round ? BOX_ROUND : BOX_SHARP;
    for (const [k, b] of bits) {
      const [x, y] = unK(k), had = opts.base ? BOX_BITS[opts.base(x, y)] : undefined;
      m.set(k, T[b | (had || 0)]);
    }
    return m;
  }
  let prev = null, last = null;
  // put a character down; if it doesn't touch the last one, fill the cells between with this stretch's character
  const put = (x, y, c) => {
    if (last && Math.max(Math.abs(x - last[0]), Math.abs(y - last[1])) > 1) {
      const jx = x - last[0], jy = y - last[1], js = jx ? jy / jx : Infinity;   // the gap's own direction picks its character
      const gc = style === 'block' ? blockLineChar(js, 0.5, 0.5) : asciiLineChar(js, 0.5, 0);
      line(last[0], last[1], x, y, (fx, fy) => { if ((fx !== last[0] || fy !== last[1]) && (fx !== x || fy !== y) && !m.has(K(fx, fy))) m.set(K(fx, fy), gc); });
    }
    m.set(K(x, y), c); last = [x, y];
  };
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    if (len < 1e-6) continue;
    const sl = Math.abs(dx) < 1e-6 ? Infinity : dy / dx, ux = dx / len, uy = dy / len;
    let curve = 0, turn = null;
    if (prev && style === 'ascii' && !opts.plain) {
      const o = (prev.x * uy - prev.y * ux) * Math.sign(uy || 1);
      if (Math.abs(o) > 0.04) curve = Math.sign(o);
      if (prev.x * ux < 0 && Math.abs(prev.x) > 0.35 && Math.abs(ux) > 0.35 && prev.x * ux + prev.y * uy < 0.2) turn = prev.x > 0 ? '>' : '<';
    }
    if (!Number.isFinite(sl) || Math.abs(sl) > 0.75) {
      for (const row of centersBetween(a.y, b.y)) {
        const x = a.x + dx * (row + 0.5 - a.y) / dy, cx = Math.floor(x);
        const c = style === 'block' ? blockLineChar(sl, x - cx, 0.5) : asciiLineChar(sl, 0.5, curve); put(cx, row, c);
      }
    } else {
      for (const col of centersBetween(a.x, b.x)) {
        const y = a.y + dy * (col + 0.5 - a.x) / dx, cy = Math.floor(y);
        put(col, cy, style === 'block' ? blockLineChar(sl, 0.5, y - cy) : asciiLineChar(sl, y - cy, 0));
      }
    }
    if (turn) m.set(K(Math.floor(a.x), Math.floor(a.y)), turn);
    prev = { x: ux, y: uy };
  }
  if (!m.size) m.set(K(Math.floor(pts[0].x), Math.floor(pts[0].y)), style === 'block' ? '█' : '.');
  return m;
}
const SMART = { ht: '-', hb: '_', v: '|', d1: '/', d2: '\\' };
const BOXLINE = { ht: '─', hb: '─', v: '│', d1: '╱', d2: '╲' };
const LINE_STYLES = { smart: 'Smart  - | / \\ _ . \'', box: 'Box  ─ │ ┌ ┼ (joins up)', block: 'Block  █ ▌ ▀ ▚', char: 'Character' };
const ELLIPSE_STYLES = { smart: 'Smart  - _ / \\ |', char: 'Character', none: 'None (fill only)' };
const POLY_STYLES = { ...LINE_STYLES, none: 'None (fill only)' };
// The style of the current shape. 'none' = no outline, fill only (closed shapes).
const shapeStyle = () => S.shape[S.shape.kind];
// tx, ty: the direction the line runs, in screen pixels. upper: on the top half (horizontal = '-' there, '_' below).
function slopeChar(tx, ty, upper, set) {
  const a = Math.atan2(Math.abs(ty), Math.abs(tx)) * 180 / Math.PI;
  if (a < 27) return upper ? set.ht : set.hb;
  if (a > 70) return set.v;
  return tx * ty < 0 ? set.d1 : set.d2;   // screen y runs down, so up-and-right is '/'
}
// Smart ASCII edge: by the angle on screen, and by how high in the cell the curve passes (fy: 0 top .. 1 bottom).
// Flat: '-' (or '_' along the bottom). Shallow: "'" high, '.' low, '-' middle, so curves read .-' like hand-made art.
// Steep: '/' or '\'. Upright: '|'.
function smartChar(tx, ty, fy) {
  const a = Math.atan2(Math.abs(ty), Math.abs(tx)) * 180 / Math.PI;
  if (a < 22) return fy > 0.72 ? '_' : '-';
  if (a < 52) return fy < 0.42 ? "'" : fy > 0.62 ? '.' : '-';
  if (a < 76) return tx * ty < 0 ? '/' : '\\';
  return '|';
}
function rectShape(x0, y0, x1, y1, st) {
  if (st === 'none') st = 'ascii';
  const m = new Map(), s = RECT_STYLES[st] || RECT_STYLES.ascii, c = S.brush.ch;
  const put = (x, y, ch) => { if (ch && ch !== ' ') m.set(K(x, y), ch); };
  if (st === 'char') {
    for (let x = x0; x <= x1; x++) { put(x, y0, c); put(x, y1, c); }
    for (let y = y0; y <= y1; y++) { put(x0, y, c); put(x1, y, c); }
  } else if (y0 === y1) { for (let x = x0; x <= x1; x++) put(x, y0, s.h); }
  else if (x0 === x1) { for (let y = y0; y <= y1; y++) put(x0, y, s.v); }
  else {
    for (let x = x0 + 1; x < x1; x++) { put(x, y0, s.h); put(x, y1, s.hb); }
    for (let y = y0 + 1; y < y1; y++) { put(x0, y, s.v); put(x1, y, s.v); }
    put(x0, y0, s.tl); put(x1, y0, s.tr); put(x0, y1, s.bl); put(x1, y1, s.br);
  }
  const inside = new Set();
  for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++) inside.add(K(x, y));
  return { outline: m, inside };
}
function ellipseShape(x0, y0, x1, y1, st) {
  if (st === 'none') st = 'smart';
  const inside = new Set(ellipseCells(x0, y0, x1, y1)), m = new Map();
  const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2, rx = (x1 - x0 + 1) / 2, ry = (y1 - y0 + 1) / 2;
  if (st !== 'char' && rx >= 1 && ry >= 1) {
    // Follow the curve: the shallow parts column by column (the cell the curve passes through, and how high),
    // the steep parts row by row. Each crossing gets a character from the angle there.
    const angleAt = (px, py) => {
      const nx = (px - cx) / (rx * rx) / S.cw, ny = (py - cy) / (ry * ry) / S.ch;   // normal, on screen
      return { tx: -ny, ty: nx, a: Math.atan2(Math.abs(nx), Math.abs(ny)) * 180 / Math.PI };
    };
    for (let x = x0; x <= x1; x++) {
      const u = (x + 0.5 - cx) / rx; if (Math.abs(u) > 1) continue;
      const dy = ry * Math.sqrt(1 - u * u);
      for (const yc of [cy - dy, cy + dy]) {
        const t = angleAt(x + 0.5, yc); if (t.a >= 58) continue;   // overlaps the row pass a little, so no gaps
        const row = clamp(Math.floor(yc), y0, y1);
        let c = smartChar(t.tx, t.ty, clamp(yc - row, 0, 1));
        if (row === y0 && c === "'") c = '-';   // nothing above the top line: a high mark there reads as a bump
        if (row === y1 && c === '.') c = '_';
        if (!m.has(K(x, row)) || t.a < 52) m.set(K(x, row), c);
      }
    }
    for (let y = y0; y <= y1; y++) {
      const v = (y + 0.5 - cy) / ry; if (Math.abs(v) > 1) continue;
      const dx = rx * Math.sqrt(1 - v * v);
      for (const xc of [cx - dx, cx + dx]) {
        const t = angleAt(xc, y + 0.5); if (t.a < 46) continue;
        const col = clamp(Math.floor(xc), x0, x1);
        if (!m.has(K(col, y))) m.set(K(col, y), smartChar(t.tx, t.ty, 0.5));
      }
    }
    return { outline: m, inside };
  }
  for (const k of inside) {
    const [x, y] = unK(k);
    if (inside.has(K(x + 1, y)) && inside.has(K(x - 1, y)) && inside.has(K(x, y + 1)) && inside.has(K(x, y - 1))) continue;
    if (st === 'char') { m.set(k, S.brush.ch); continue; }
    // the curve's normal on screen, then the tangent along it
    const nx = (x + 0.5 - cx) / (rx * rx) / S.cw, ny = (y + 0.5 - cy) / (ry * ry) / S.ch;
    // where the curve crosses this cell: push the center out onto the ellipse
    const ex = (x + 0.5 - cx) / rx, ey = (y + 0.5 - cy) / ry, f = Math.sqrt(ex * ex + ey * ey) || 1;
    const fy = clamp(cy + (y + 0.5 - cy) / f - y, 0, 1);
    m.set(k, smartChar(-ny, nx, fy));
  }
  return { outline: m, inside };
}
function segChar(ax, ay, bx, by, st) {
  if (st === 'char') return S.brush.ch;
  return slopeChar((bx - ax) * S.cw || 0.001, (by - ay) * S.ch, true, st === 'box' ? BOXLINE : SMART);
}
// Lines and polygons: each segment gets one character by its angle; corners get '+' or the matching box corner.
function polyShape(pts, closed, st) {
  if (st === 'none') st = 'smart';
  let m = new Map(); const n = pts.length;
  if (!n) return { outline: m, inside: null };
  if (st === 'box' || st === 'block') {   // one connected path through the cell centers (box joins what's on the layer)
    const P = pts.map(p => ({ x: p.x + 0.5, y: p.y + 0.5 })); if (closed && n >= 3) P.push(P[0]);
    const lay = L();
    m = smartPath(P, st, { plain: true, base: (x, y) => lay.cells.get(K(x, y)) });
    return { outline: m, inside: polyInside(pts, closed) };
  }
  if (n === 1) { m.set(K(pts[0].x, pts[0].y), st === 'char' ? S.brush.ch : '+'); return { outline: m, inside: null }; }
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n], ch = segChar(a.x, a.y, b.x, b.y, st);
    if (st !== 'smart') { line(a.x, a.y, b.x, b.y, (x, y) => m.set(K(x, y), ch)); continue; }
    for (const [k, c] of smartPath([{ x: a.x + 0.5, y: a.y + 0.5 }, { x: b.x + 0.5, y: b.y + 0.5 }], 'ascii', { plain: true })) m.set(k, c);
    continue;
    // smart: per cell, by how high the line passes through it
    const tx = (b.x - a.x) * S.cw || 0.001, ty = (b.y - a.y) * S.ch;
    if (Math.atan2(Math.abs(ty), Math.abs(tx)) * 180 / Math.PI >= 52) {
      // steep: one cell per row, like a hand-drawn / or \ (stepping by columns would double them up)
      const sy = Math.sign(b.y - a.y) || 1;
      for (let y = a.y; y !== b.y + sy; y += sy) {
        const x = Math.round(a.x + (y - a.y) * (b.x - a.x) / ((b.y - a.y) || 1));
        m.set(K(x, y), smartChar(tx, ty, 0.5));
      }
      continue;
    }
    line(a.x, a.y, b.x, b.y, (x, y) => {
      const fy = b.x === a.x ? 0.5 : clamp(a.y + 0.5 + (x - a.x) * (b.y - a.y) / (b.x - a.x) - y, 0, 1);
      m.set(K(x, y), smartChar(tx, ty, fy));
    });
  }
  // corners
  const dir = (a, b) => Math.sign(b.x - a.x) + ',' + Math.sign(b.y - a.y);
  const CORNERS = { 'R,D': '┌', 'L,D': '┐', 'R,U': '└', 'L,U': '┘' };
  const name = d => ({ '1,0': 'R', '-1,0': 'L', '0,1': 'D', '0,-1': 'U' })[d];
  for (let i = 0; i < n; i++) {
    if (!closed && (i === 0 || i === n - 1)) continue;
    const p = pts[i], prev = pts[(i - 1 + n) % n], next = pts[(i + 1) % n];
    if (st === 'char') continue;
    const c1 = segChar(prev.x, prev.y, p.x, p.y, st), c2 = segChar(p.x, p.y, next.x, next.y, st);
    if (c1 === c2) continue;
    if (st === 'box') {
      const a = name(dir(p, prev)), b = name(dir(p, next));
      const key = a && b ? ([a, b].includes('R') ? 'R' : 'L') + ',' + ([a, b].includes('D') ? 'D' : 'U') : '';
      m.set(K(p.x, p.y), (a && b && a !== b && CORNERS[key]) || '┼');
    } else m.set(K(p.x, p.y), '+');
  }
  return { outline: m, inside: polyInside(pts, closed) };
}
function polyInside(pts, closed) {
  const n = pts.length;
  let inside = null;
  if (closed && n >= 3) {   // cells whose centers are inside the polygon (points sit on cell centers)
    inside = new Set();
    const P = pts.map(p => ({ x: p.x + 0.5, y: p.y + 0.5 }));
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const p of pts) { bx0 = Math.min(bx0, p.x); by0 = Math.min(by0, p.y); bx1 = Math.max(bx1, p.x); by1 = Math.max(by1, p.y); }
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      const tx = x + 0.5, ty = y + 0.5; let ins = false;
      for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const a = P[i], b = P[j];
        if ((a.y > ty) !== (b.y > ty) && tx < (b.x - a.x) * (ty - a.y) / (b.y - a.y) + a.x) ins = !ins;
      }
      if (ins) inside.add(K(x, y));
    }
  }
  return inside;
}
// The shape being drawn right now (drag or polygon in progress), for the preview and for committing.
function currentShape() {
  const d = S.drag, sh = S.shape;
  if (d && d.kind === 'shape') {
    if (d.shape === 'rect') return rectShape(Math.min(d.x0, d.x1), Math.min(d.y0, d.y1), Math.max(d.x0, d.x1), Math.max(d.y0, d.y1), sh.rect);
    if (d.shape === 'ellipse') return ellipseShape(Math.min(d.x0, d.x1), Math.min(d.y0, d.y1), Math.max(d.x0, d.x1), Math.max(d.y0, d.y1), sh.ellipse);
    if (d.shape === 'line') return polyShape([{ x: d.ax, y: d.ay }, lineEnd(d)], false, sh.line);
  }
  if (S.poly) {
    const pts = S.poly.pts.slice();
    if (S.hover) pts.push(S.hover);
    return polyShape(pts, false, sh.polygon);
  }
  return null;
}
// Line end: Shift snaps to straight or 45 degrees (in cells).
function lineEnd(d) {
  if (!d.shift) return { x: d.cx, y: d.cy };
  const dx = d.cx - d.ax, dy = d.cy - d.ay, adx = Math.abs(dx), ady = Math.abs(dy);
  if (adx > 2 * ady) return { x: d.cx, y: d.ay };
  if (ady > 2 * adx) return { x: d.ax, y: d.cy };
  const m = Math.max(adx, ady);
  return { x: d.ax + Math.sign(dx) * m, y: d.ay + Math.sign(dy) * m };
}
// Put a shape on the active layer: the inside first (with the Paint setting, if Fill inside is on), then the outline.
// Outline off: only the fill, and it covers the edge cells too. (A line is all outline, so it always has one.)
const strokeOn = shape => shapeStyle() !== 'none' || !shape.inside;
// ---------- Advanced brush strokes: tapered ends + outline ----------
// A brush: start / end curve (none, linear, in = ease in, out = ease out), ramp length, min width, tip, stroke fill /
// outline (+ edges, white space). Size is the max width, set in the bar.
const curveF = (kind, t) => kind === 'linear' ? t : kind === 'in' ? t * t : kind === 'out' ? 1 - (1 - t) * (1 - t) : 1;
const tapered = b => (b.start && b.start !== 'none') || (b.end && b.end !== 'none');
// Tapered, outlined or Ramp strokes are collected while you drag (pts, in cell units) and put down on release.
const pencilSmart = () => S.tool === 'pencil' && S.pencil.smart;
const strokeDeferred = () => pencilSmart() || S.tool === 'brush' && (tapered(S.brush) || S.brush.mode === 'outline' || S.paint.mode === 'ramp');
function smartStroke(pts) { const lay = L(); return smartPath(pts, S.pencil.style, { round: true, base: (x, y) => lay.cells.get(K(x, y)) }); }
// The cells a stroke covers. Each end grows from Min to Size over the Ramp length along its curve, so short strokes
// stay thin. Each point also keeps fr (0 at the ends .. 1 in the middle) for the Ramp paint mode.
function strokeRegion(pts, b = S.brush) {
  const maxW = b.size, minW = Math.min(b.minSize || 1, maxW), ramp = Math.max(1, b.ramp || 6);
  const ar = S.ch / S.cw;   // a cell is this many cell-widths tall
  // resample the path every ~0.35 cell, measuring distance on screen (in cell widths)
  const samples = [];
  let dist = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (i === 0) { samples.push({ x: p.x, y: p.y, d: 0, tx: 1, ty: 0 }); continue; }
    const q = pts[i - 1], dx = p.x - q.x, dy = (p.y - q.y) * ar, len = Math.hypot(dx, dy);
    if (!len) continue;
    const n = Math.max(1, Math.ceil(len / 0.35));
    for (let j = 1; j <= n; j++) samples.push({ x: q.x + (p.x - q.x) * j / n, y: q.y + (p.y - q.y) * j / n, d: dist + len * j / n, tx: dx, ty: dy });
    dist += len;
  }
  if (samples.length > 1) { samples[0].tx = samples[1].tx; samples[0].ty = samples[1].ty; }
  const region = new Map();   // key -> the stroke point nearest that cell (its direction, its distance along the stroke)
  // each cell keeps the stroke point nearest its center, so both ends of a stroke come out the same
  const claim = (x, y, smp) => {
    const k = K(x, y), old = region.get(k);
    if (!old) { region.set(k, smp); return; }
    const dn = (smp.x - x - 0.5) ** 2 + ((smp.y - y - 0.5) * ar) ** 2, dq = (old.x - x - 0.5) ** 2 + ((old.y - y - 0.5) * ar) ** 2;
    if (dn < dq) region.set(k, smp);
  };
  const taper = tapered(b);
  for (const s of samples) {
    const ts = clamp(s.d / ramp, 0, 1), te = clamp((dist - s.d) / ramp, 0, 1);
    const f = Math.min(curveF(b.start, ts), curveF(b.end, te));
    s.fr = taper ? f : Math.min(ts, te);   // a plain brush still steps Ramp characters in from both ends
    const w = taper ? minW + (maxW - minW) * f : maxW;
    const rx = w / 2, ry = rx / ar, cx0 = Math.floor(s.x), cy0 = Math.floor(s.y);
    claim(cx0, cy0, s);
    for (let y = Math.floor(s.y - ry - 1); y <= Math.ceil(s.y + ry + 1); y++)
      for (let x = Math.floor(s.x - rx - 1); x <= Math.ceil(s.x + rx + 1); x++) {
        const ux = (x + 0.5 - s.x) / rx, uy = (y + 0.5 - s.y) / Math.max(ry, 0.01);
        const inside = b.tip === 'square' ? Math.abs(ux) <= 1 && Math.abs(uy) <= 1 : ux * ux + uy * uy <= 1;
        if (inside) claim(x, y, s);
      }
  }
  region.total = dist;
  return region;
}
// The edge of a stroke: cells next to the outside, with a smart character from the edge's direction
// (or the Paint setting, if Edges is Paint).
// The outlines of a region (a Map or Set of cell keys), each as a closed path through its edge cells' centers,
// found by walking around the region with a hand on the wall (Moore-neighbor tracing).
function traceOutlines(region) {
  const has = (x, y) => region.has(K(x, y)), loops = [], seen = new Set();
  const N8 = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];   // clockwise from up
  const edge = k => { const [x, y] = unK(k); return !has(x + 1, y) || !has(x - 1, y) || !has(x, y + 1) || !has(x, y - 1); };
  const keys = [...region.keys()].filter(edge).map(unK).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  for (const [sx, sy] of keys) {
    if (seen.has(K(sx, sy))) continue;
    // start with an empty side as the "wall": the first empty 4-neighbor
    let bi = [0, 2, 4, 6].find(d => !has(sx + N8[d][0], sy + N8[d][1]));
    if (bi === undefined) continue;
    const path = [{ x: sx + 0.5, y: sy + 0.5 }]; seen.add(K(sx, sy));
    let cx = sx, cy = sy, startB = bi, guard = region.size * 4 + 16;
    while (guard-- > 0) {
      let found = -1;
      for (let t = 1; t <= 8; t++) { const d = (bi + t) % 8; if (has(cx + N8[d][0], cy + N8[d][1])) { found = d; break; } }
      if (found < 0) break;   // a lone cell
      const nx = cx + N8[found][0], ny = cy + N8[found][1];
      // the new wall: the neighbor just before the one we moved to, seen from the new cell
      const wx = cx + N8[(found + 7) % 8][0], wy = cy + N8[(found + 7) % 8][1];
      bi = N8.findIndex(([dx, dy]) => dx === wx - nx && dy === wy - ny);
      if (bi < 0) bi = (found + 4) % 8;
      if (found % 2) {   // a diagonal step: go around through a cell of the shape, so the line stays on it
        const [dx, dy] = N8[found], via = has(cx + dx, cy) ? [cx + dx, cy] : [cx, cy + dy];
        path.push({ x: via[0] + 0.5, y: via[1] + 0.5 });
      }
      cx = nx; cy = ny;
      path.push({ x: cx + 0.5, y: cy + 0.5 }); seen.add(K(cx, cy));
      if (cx === sx && cy === sy && bi === startB) break;
      if (cx === sx && cy === sy && path.length > 2) break;
    }
    loops.push(path);
  }
  return loops;
}
function strokeOutline(region, b = S.brush) {
  const out = new Map();
  if (b.edge === 'none') return out;
  if (b.edge === 'box') {   // box lines around the shape: trace its outline as one path, then draw it like a Box stroke
    const lay = L(), base = (x, y) => lay.cells.get(K(x, y));
    for (const loop of traceOutlines(region)) for (const [k, c] of smartPath(loop, 'box', { round: true, base })) {
      const prev = out.get(k);   // where loops touch, join them
      out.set(k, prev ? BOX_ROUND[(BOX_BITS[prev] || 0) | (BOX_BITS[c] || 0)] : c);
    }
    return out;
  }
  for (const [k, s] of region) {
    const [x, y] = unK(k);
    if (region.has(K(x + 1, y)) && region.has(K(x - 1, y)) && region.has(K(x, y + 1)) && region.has(K(x, y - 1))) continue;
    if (b.edge === 'char') { out.set(k, b.edgeCh || '#'); continue; }
    if (b.edge === 'paint') { const p = S.paint.mode === 'ramp' ? rampChar(s, region.total) : paintChar(x, y, false); if (p !== undefined) out.set(k, p); continue; }
    // normal = toward the empty neighbors, on screen
    // (a 5 x 5 look-around, weighted toward near cells, gives much finer angles than the 8 neighbors)
    let nx = 0, ny = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if ((!dx && !dy) || region.has(K(x + dx, y + dy))) continue;
      const ex = dx * S.cw, ey = dy * S.ch, d2 = ex * ex + ey * ey;
      nx += ex / d2; ny += ey / d2;
    }
    let tx = -ny, ty = nx, fy = ny < 0 ? 0.25 : ny > 0 ? 0.75 : 0.5;
    const nlen = Math.hypot(nx, ny) * S.cw;
    if (nlen < 0.35) { tx = s.tx * S.cw; ty = s.ty * S.cw; fy = 0.5; }   // ~1 cell wide: follow the stroke
    if (b.edge === 'block') { const sl = Math.abs(tx) < 1e-6 ? Infinity : (ty / S.ch) / (tx / S.cw); out.set(k, blockLineChar(sl, 0.5, fy)); }
    else out.set(k, smartChar(tx, ty, fy));
  }
  return out;
}
function strokeCells(pts, b = S.brush) {
  const region = strokeRegion(pts, b);
  return b.mode === 'outline' ? { outline: strokeOutline(region, b), region } : { outline: null, region };
}
function commitStroke(pts) {
  if (textLock('Painting')) return;
  if (pencilSmart()) {   // a smart line: the characters it picked, on the active layer
    pushUndo(); const lay = L(); let blocked = false;
    for (const [k, c] of smartStroke(pts)) { const [x, y] = unK(k); if (!editable(x, y)) { blocked = true; continue; } putCell(lay, x, y, c); }
    if (blocked) warnOutside('Drawing');
    return changed();
  }
  const st = strokeCells(pts);
  pushUndo();
  const lay = L(); let blocked = false;
  if (st.outline) {
    if (S.brush.inside === 'solid') for (const k of st.region.keys()) {
      if (st.outline.has(k)) continue;
      const [x, y] = unK(k); if (!editable(x, y)) { blocked = true; continue; } putCell(lay, x, y, null);
    }
    if (S.brush.inside === 'paint') for (const [k, smp] of st.region) {   // filled with the Paint setting
      if (st.outline.has(k)) continue;
      const [x, y] = unK(k); if (!editable(x, y)) { blocked = true; continue; }
      const p = S.paint.mode === 'ramp' ? rampChar(smp, st.region.total) : paintChar(x, y, false); if (p !== undefined) putCell(lay, x, y, p);
    }
    for (const [k, c] of st.outline) { const [x, y] = unK(k); if (!editable(x, y)) { blocked = true; continue; } putCell(lay, x, y, c); }
  } else {
    for (const [k, smp] of st.region) {
      const [x, y] = unK(k);
      if (!editable(x, y)) { blocked = true; continue; }
      const p = S.paint.mode === 'ramp' ? rampChar(smp, st.region.total) : paintChar(x, y, false); if (p !== undefined) putCell(lay, x, y, p);
    }
  }
  if (blocked) warnOutside('Painting');
  if (S.paint.mode === 'char' && !(st.outline && S.brush.edge !== 'paint' && S.brush.inside !== 'paint')) noteRecent(S.brush.ch);
  changed();
}
function commitShape(shape) {
  if (!shape || !shape.outline.size) return;
  if (textLock('Drawing')) return;
  const stroke = strokeOn(shape), fill = S.shape.fill && shape.inside;
  if (!stroke && !fill) return toast(shape.inside ? 'Style is None and Fill inside is off: nothing to draw' : 'An open shape needs its outline', 'warn');
  pushUndo();
  const lay = L(); let blocked = false;
  const area = fill ? (stroke ? shape.inside : new Set([...shape.inside, ...shape.outline.keys()])) : [];
  for (const k of area) {
    if (stroke && shape.outline.has(k)) continue;
    const [x, y] = unK(k);
    if (!editable(x, y)) { blocked = true; continue; }
    const p = paintChar(x, y, true); if (p !== undefined) putCell(lay, x, y, p);
  }
  if (stroke) for (const [k, c] of shape.outline) {
    const [x, y] = unK(k);
    if (!editable(x, y)) { blocked = true; continue; }
    putCell(lay, x, y, c);
  }
  if (blocked) warnOutside('Drawing');
  if (shapeStyle() === 'char') noteRecent(S.brush.ch);
  changed();
}
function finishPolygon(closed) {
  const p = S.poly; if (!p) return;
  S.poly = null;
  if (p.pts.length >= 2) commitShape(polyShape(p.pts, closed && p.pts.length >= 3, S.shape.polygon));
  redraw();
}

// A line that only steps sideways or up/down, never diagonally (4-connected): diamonds stay edge to edge.
function line4(x0, y0, x1, y1, fn) {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = Math.sign(x1 - x0), sy = Math.sign(y1 - y0);
  let x = x0, y = y0, e = 0;
  fn(x, y);
  for (let i = 0; i < dx + dy; i++) {
    const e1 = e + dy, e2 = e - dx;
    if (Math.abs(e1) < Math.abs(e2)) { x += sx; e = e1; } else { y += sy; e = e2; }
    fn(x, y);
  }
}
function line(x0, y0, x1, y1, fn) {     // Bresenham, so fast drags don't leave gaps
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    fn(x0, y0);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

// ---------- canvas size ----------
function resizeCanvas(nw, nh, anchor) {
  nw = clamp(nw | 0, 1, 1000); nh = clamp(nh | 0, 1, 1000);
  if (nw === S.w && nh === S.h) return;
  commitFloat();
  pushUndo();
  const ax = anchor % 3, ay = (anchor / 3) | 0;
  const dx = ax === 0 ? 0 : ax === 1 ? Math.floor((nw - S.w) / 2) : nw - S.w;
  const dy = ay === 0 ? 0 : ay === 1 ? Math.floor((nh - S.h) / 2) : nh - S.h;
  if (dx || dy) {
    for (const l of S.layers) {
      const m = new Map();
      for (const [k, c] of l.cells) { const [x, y] = unK(k); m.set(K(x + dx, y + dy), c); }
      l.cells = m;
    }
    S.sel = null;
    if (S.cursor) { S.cursor.x += dx; S.cursor.y += dy; S.cursor.lineX += dx; }
  }
  S.w = nw; S.h = nh;
  changed(true);
}

// ---------- view ----------
function measure() {
  S.fontPx = BASE_FONT_PX * S.zoom;
  ctx.font = `${S.fontPx}px "${S.font}", monospace`;
  S.cw = ctx.measureText('M').width;
  S.ch = S.fontPx * LINE_RATIO;
}
function setZoom(z, px, py) {
  S.viewTouched = true;
  z = clamp(z, ZOOMS[0], ZOOMS[ZOOMS.length - 1]);
  if (px == null) { px = vp.clientWidth / 2; py = vp.clientHeight / 2; }
  const wx = (px - S.offX) / S.cw, wy = (py - S.offY) / S.ch;
  S.zoom = z; measure();
  S.offX = px - wx * S.cw; S.offY = py - wy * S.ch;
  $('#zoomLabel').textContent = Math.round(z * 100) + '%';
  savePrefs(); redraw();
}
function zoomStep(dir, px, py) {
  let i = ZOOMS.findIndex(z => z >= S.zoom - 1e-6);
  if (i < 0) i = ZOOMS.length - 1;
  if (dir > 0) i = ZOOMS[i] > S.zoom + 1e-6 ? i : i + 1; else i = i - 1;
  setZoom(ZOOMS[clamp(i, 0, ZOOMS.length - 1)], px, py);
}
// Fit the canvas in the view. Until you zoom or pan yourself, the view keeps re-fitting (window resize, font load).
function zoomFit() {
  if (vp.clientWidth < 80 || vp.clientHeight < 80) return;   // not laid out yet: don't save a broken view
  S.viewTouched = false;
  const pad = 70, tb = $('#toolbox').getBoundingClientRect(), vr = vp.getBoundingClientRect();
  const left = Math.max(0, tb.right - vr.left) + 20;   // keep clear of the tool palette when it's docked
  const aw = vp.clientWidth - left - pad, ah = vp.clientHeight - pad * 2;
  S.zoom = 1; measure();
  let z = Math.min(aw / (S.w * S.cw), ah / (S.h * S.ch));
  z = clamp(Math.floor(z * 100) / 100, ZOOMS[0], 4);
  S.zoom = z; measure();
  S.offX = left + (aw + pad - S.w * S.cw) / 2;
  S.offY = (vp.clientHeight - S.h * S.ch) / 2;
  $('#zoomLabel').textContent = Math.round(z * 100) + '%';
  savePrefs(); redraw();
}
function cellAt(px, py) { return { x: Math.floor((px - S.offX) / S.cw), y: Math.floor((py - S.offY) / S.ch) }; }
function readColors() {
  const cs = getComputedStyle(document.body), g = n => cs.getPropertyValue(n).trim();
  for (const n of ['bg', 'c-paper', 'c-ink', 'c-grid', 'c-grid-out', 'c-edge', 'c-sel-fill', 'c-sel-line', 'c-float-bg', 'c-float-ink', 'c-clash', 'c-cursor', 'accent'])
    S.colors[n] = g('--' + n);
}
function fitView() {
  dpr = window.devicePixelRatio || 1;
  view.width = Math.round(vp.clientWidth * dpr); view.height = Math.round(vp.clientHeight * dpr);
  redraw();
}

// ---------- render ----------
function render() {
  const C = S.colors, W = vp.clientWidth, H = vp.clientHeight, cw = S.cw, ch = S.ch, ox = S.offX, oy = S.offY;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const x0 = Math.floor(-ox / cw) - 1, x1 = Math.ceil((W - ox) / cw) + 1;
  const y0 = Math.floor(-oy / ch) - 1, y1 = Math.ceil((H - oy) / ch) + 1;
  const inView = (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
  const px = x => ox + x * cw, py = y => oy + y * ch;

  // paper
  ctx.fillStyle = C['c-paper']; ctx.fillRect(px(0), py(0), S.w * cw, S.h * ch);

  // grid: dim everywhere, then stronger inside the canvas
  if (S.grid && cw >= 4) {
    const gridPath = () => {
      ctx.beginPath();
      for (let x = x0; x <= x1; x++) { const X = Math.round(px(x)) + 0.5; ctx.moveTo(X, 0); ctx.lineTo(X, H); }
      for (let y = y0; y <= y1; y++) { const Y = Math.round(py(y)) + 0.5; ctx.moveTo(0, Y); ctx.lineTo(W, Y); }
    };
    ctx.lineWidth = 1;
    ctx.strokeStyle = C['c-grid-out']; gridPath(); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(px(0), py(0), S.w * cw, S.h * ch); ctx.clip();
    ctx.strokeStyle = C['c-grid']; gridPath(); ctx.stroke();
    ctx.restore();
  }

  // selection fill (under the characters)
  if (S.sel) {
    ctx.fillStyle = C['c-sel-fill'];
    for (const k of S.sel) { const [x, y] = unK(k); if (inView(x, y)) ctx.fillRect(px(x), py(y), cw, ch); }
  }

  // floating block background + clashes
  const f = S.float, lay = L(), erase = S.spacesErase || S.shiftDown;
  if (f) {
    for (const [rk, c] of f.cells) {
      const [dx, dy] = unK(rk), x = f.x + dx, y = f.y + dy;
      if (!inView(x, y)) continue;
      if ((c !== ' ' || erase) && lay.visible && lay.cells.has(K(x, y))) ctx.fillStyle = C['c-clash'];
      else if (c !== ' ' || erase) ctx.fillStyle = C['c-float-bg'];
      else continue;
      ctx.fillRect(px(x), py(y), cw, ch);
    }
  }

  // characters: layers bottom to top, so the top one wins
  // comp: key -> [char, is it on the active layer]. With "Dim others" on, the active layer is drawn on top.
  const comp = new Map(), act = L(), focus = S.focusLayer;
  for (const l of S.layers) {
    if (!l.visible) continue;
    const mine = l === act;
    for (const [k, c] of l.cells) {
      const [x, y] = unK(k);
      if (!inView(x, y)) continue;
      if (focus && !mine && comp.has(k) && comp.get(k)[1]) continue;
      comp.set(k, [c, mine]);
    }
  }
  if (f) for (const [rk, c] of f.cells) {
    const [dx, dy] = unK(rk), k = K(f.x + dx, f.y + dy);
    if (c !== ' ' || erase) comp.delete(k);   // drawn by the float pass below
  }
  ctx.font = `${S.fontPx}px "${S.font}", monospace`;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  const ty = ch / 2 + S.fontPx * 0.04;
  // a character in a preview (brush, stroke, shape): Clear is a blue outlined cell, opaque space a faint red one
  const drawCh = (c, x, y) => {
    if (c === CLEAR) { const a = ctx.globalAlpha; ctx.globalAlpha = Math.max(a, 0.8); ctx.strokeStyle = CLEAR_STROKE; ctx.lineWidth = 1.5; ctx.strokeRect(Math.round(px(x)) + 2.5, Math.round(py(y)) + 2.5, Math.round(cw) - 5, Math.round(ch) - 5); ctx.lineWidth = 1; ctx.globalAlpha = a; }
    else if (c === SOLID) { const a = ctx.globalAlpha, f = ctx.fillStyle; ctx.globalAlpha = SOLID_ALPHA; ctx.fillStyle = SOLID_FILL; ctx.fillRect(px(x), py(y), cw, ch); ctx.globalAlpha = a; ctx.fillStyle = f; }
    else ctx.fillText(c, px(x) + cw / 2, py(y) + ty);
  };
  for (const [k, [c, mine]] of comp) {
    const [x, y] = unK(k);
    const inside = x >= 0 && y >= 0 && x < S.w && y < S.h;
    ctx.globalAlpha = (inside ? 1 : 0.38) * (focus && !mine ? 0.22 : 1);
    ctx.fillStyle = C['c-ink'];
    if (c === SOLID) { if (S.showSolid) { ctx.globalAlpha *= SOLID_ALPHA; ctx.fillStyle = SOLID_FILL; ctx.fillRect(px(x), py(y), cw, ch); } }   // opaque space: a faint red cell (Spaces button)
    else ctx.fillText(c, px(x) + cw / 2, py(y) + ty);
  }
  ctx.globalAlpha = 1;
  if (f) {
    ctx.fillStyle = C['c-float-ink'];
    const fmaps = mirrorMaps(S.tool === 'select' ? 'select' : 'move');
    fmaps.forEach((m, i) => {   // with mirror on, where the mirrored copy will land (fainter)
      ctx.globalAlpha = i ? 0.45 : 1;
      for (const [rk, c] of f.cells) {
        if (c === ' ') continue;
        const [dx, dy] = unK(rk), x = m.x(f.x + dx), y = m.y(f.y + dy);
        if (inView(x, y)) ctx.fillText(m.c(c), px(x) + cw / 2, py(y) + ty);
      }
    });
    ctx.globalAlpha = 1;
  }

  // gallery preview: the piece on a plate, over the art
  if (gal.preview) {
    const p = gal.preview;
    for (const k of [...p.cells.keys(), ...(p.solid || [])]) {   // what gets placed: the characters and the solid blanks
      const [x, y] = unK(k), X = p.x + x, Y = p.y + y; if (!inView(X, Y)) continue;
      ctx.fillStyle = C['c-paper']; ctx.fillRect(px(X), py(Y), cw, ch);
      ctx.fillStyle = C['c-float-bg']; ctx.fillRect(px(X), py(Y), cw, ch);
    }
    ctx.save(); ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.strokeStyle = C['c-grid'];
    ctx.strokeRect(Math.round(px(p.x)) - 2.5, Math.round(py(p.y)) - 2.5, p.w * cw + 5, p.h * ch + 5); ctx.restore();
    ctx.fillStyle = C['c-float-ink'];
    for (const [k, c] of p.cells) { const [x, y] = unK(k), X = p.x + x, Y = p.y + y; if (inView(X, Y)) ctx.fillText(c, px(X) + cw / 2, py(Y) + ty); }
  }

  // blocks (Block tool): shaded 3D boxes over the canvas, and the block under the pointer
  if (S.tool === 'font') {
    for (const l of S.layers) {
      if (!l.visible || !l.text) continue;
      const b = textBox(l), ed = l.id === S.textEdit;
      ctx.save(); ctx.setLineDash([4, 3]); ctx.lineWidth = 1; ctx.strokeStyle = ed ? C['c-cursor'] : C['c-grid'];
      ctx.strokeRect(px(b.x) - 2.5, py(b.y) - 2.5, Math.max(b.w, 1) * cw + 5, b.h * ch + 5); ctx.restore();
      if (ed && (Date.now() / 530 | 0) % 2 === 0) { ctx.fillStyle = C['c-cursor']; ctx.fillRect(px(b.caretX) + 1, py(b.caretY), 2, b.ch * ch); }
    }
  }
  if (S.tool === 'block') {   // before baking: the ASCII it would make (pre-bake), or the shapes
    if (S.blocks.show === 'shapes') drawDiagBlocks(ctx, C, px, py);
    else for (const [k, c] of preBake()) {
      const [x, y] = unK(k); if (!inView(x, y)) continue;
      ctx.fillStyle = C['c-paper']; ctx.fillRect(px(x), py(y), cw, ch);
      ctx.fillStyle = C['c-float-bg']; ctx.fillRect(px(x), py(y), cw, ch);
      ctx.fillStyle = C['c-float-ink'];
      if (c === SOLID) { if (S.showSolid) { ctx.globalAlpha = SOLID_ALPHA; ctx.fillStyle = SOLID_FILL; ctx.fillRect(px(x), py(y), cw, ch); ctx.globalAlpha = 1; } }
      else ctx.fillText(c, px(x) + cw / 2, py(y) + ty);
    }
  }

  // Advanced brush stroke preview (Taper / Outline): the area tinted, the outline or the character on top
  if (S.drag && S.drag.kind === 'stroke' && pencilSmart()) {
    for (const [k, c] of mirrorMap(smartStroke(S.drag.pts))) {   // (with its mirrored copies, as it will land)
      const [x, y] = unK(k); if (!inView(x, y)) continue;
      ctx.fillStyle = C['c-paper']; ctx.fillRect(px(x), py(y), cw, ch);
      ctx.fillStyle = C['c-float-ink']; drawCh(c, x, y);
    }
  } else if (S.drag && S.drag.kind === 'stroke') {
    const st0 = strokeCells(S.drag.pts), st = { ...st0, region: mirrorMap(st0.region), outline: st0.outline && mirrorMap(st0.outline) };   // with its mirrored copies
    if (st.outline && S.brush.inside === 'solid') {   // the inside will be wiped: cover what's there
      ctx.fillStyle = C['c-paper'];
      for (const k of st.region.keys()) { const [x, y] = unK(k); if (inView(x, y)) ctx.fillRect(px(x), py(y), cw, ch); }
    }
    ctx.fillStyle = C['c-float-bg'];
    for (const k of st.region.keys()) { const [x, y] = unK(k); if (inView(x, y)) ctx.fillRect(px(x), py(y), cw, ch); }
    ctx.fillStyle = C['c-float-ink'];
    if (st.outline && S.brush.inside === 'paint' && (S.paint.mode === 'char' || S.paint.mode === 'ramp')) for (const [k, smp] of st.region) {
      if (st.outline.has(k)) continue; const [x, y] = unK(k);
      if (inView(x, y)) drawCh(S.paint.mode === 'ramp' ? rampChar(smp, st.region.total) : S.brush.ch, x, y);
    }
    if (st.outline) for (const [k, c] of st.outline) { const [x, y] = unK(k); if (inView(x, y)) ctx.fillText(c, px(x) + cw / 2, py(y) + ty); }
    else if (S.paint.mode === 'char') for (const k of st.region.keys()) { const [x, y] = unK(k); if (inView(x, y)) drawCh(S.brush.ch, x, y); }
    else if (S.paint.mode === 'ramp') for (const [k, smp] of st.region) { const [x, y] = unK(k); if (inView(x, y)) ctx.fillText(rampChar(smp, st.region.total), px(x) + cw / 2, py(y) + ty); }
  }

  // Extrude preview: the result drawn over the canvas while the Extrude popover is open
  if (extrude.open) {
    const ex = extrudeCells();
    if (ex) for (const [k, c] of ex) {
      const [x, y] = unK(k); if (!inView(x, y)) continue;
      ctx.fillStyle = C['c-paper']; ctx.fillRect(px(x), py(y), cw, ch);
      ctx.fillStyle = C['c-float-bg']; ctx.fillRect(px(x), py(y), cw, ch);
      ctx.fillStyle = C['c-float-ink'];
      if (c === SOLID) { if (S.showSolid) { ctx.globalAlpha = SOLID_ALPHA; ctx.fillStyle = SOLID_FILL; ctx.fillRect(px(x), py(y), cw, ch); ctx.globalAlpha = 1; } }
      else ctx.fillText(c, px(x) + cw / 2, py(y) + ty);
    }
  }

  // shape preview (Shape tool, while dragging or clicking out a polygon)
  const shp = (S.tool === 'shape') ? currentShape() : null;
  if (shp) {
    const stroke = strokeOn(shp);
    if (S.shape.fill && shp.inside) {
      ctx.fillStyle = C['c-float-bg'];
      for (const k of (stroke ? shp.inside : new Set([...shp.inside, ...shp.outline.keys()]))) { const [x, y] = unK(k); if (inView(x, y)) ctx.fillRect(px(x), py(y), cw, ch); }
    }
    if (!stroke) ctx.globalAlpha = 0.3;   // no outline: show it faintly, as a guide only
    for (const [k, c0] of shp.outline) for (const [x, y, c] of mirrorTargets(...unK(k), c0)) {   // (and its mirrored copies)
      if (!inView(x, y)) continue;
      ctx.fillStyle = C['c-paper']; ctx.fillRect(px(x), py(y), cw, ch);
      ctx.fillStyle = C['c-float-ink']; drawCh(c, x, y);
    }
    ctx.globalAlpha = 1;
    if (S.poly) {   // mark the points; the first one closes the shape
      ctx.strokeStyle = C['c-float-ink'];
      S.poly.pts.forEach((p, i) => { ctx.lineWidth = i ? 1 : 2; ctx.strokeRect(Math.round(px(p.x)) + 0.5, Math.round(py(p.y)) + 0.5, Math.round(cw) - 1, Math.round(ch) - 1); });
      ctx.lineWidth = 1;
    }
  }

  // canvas edge
  ctx.strokeStyle = C['c-edge']; ctx.lineWidth = 1;
  ctx.strokeRect(Math.round(px(0)) + 0.5, Math.round(py(0)) + 0.5, Math.round(S.w * cw), Math.round(S.h * ch));
  if (S.mirror !== 'off') {   // the mirror lines, with a drag handle (a small triangle) just outside the canvas at each end;
    // always shown, faded to 25% when the current tool isn't mirroring
    const live = mirrorOn(), X = Math.round(px(mirrorX())) + 0.5, Y = Math.round(py(mirrorY())) + 0.5, t = Math.max(5, Math.min(8, ch * 0.4));
    ctx.strokeStyle = C['c-cursor']; ctx.fillStyle = C['c-cursor'];
    ctx.globalAlpha = live ? 0.6 : 0.25; ctx.setLineDash([6, 4]); ctx.beginPath();
    if (S.mirror !== 'v') { ctx.moveTo(X, py(0)); ctx.lineTo(X, py(S.h)); }
    if (S.mirror !== 'h') { ctx.moveTo(px(0), Y); ctx.lineTo(px(S.w), Y); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = S.drag && S.drag.kind === 'mirror' ? 1 : live ? 0.85 : 0.25; ctx.beginPath();
    const tri = (ax, ay, bx, by, cx, cy) => { ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); };
    if (S.mirror !== 'v') { const a = py(0) - 3, b = py(S.h) + 3; tri(X, a, X - t, a - t * 1.4, X + t, a - t * 1.4); tri(X, b, X - t, b + t * 1.4, X + t, b + t * 1.4); }
    if (S.mirror !== 'h') { const a = px(0) - 3, b = px(S.w) + 3; tri(a, Y, a - t * 1.4, Y - t, a - t * 1.4, Y + t); tri(b, Y, b + t * 1.4, Y - t, b + t * 1.4, Y + t); }
    ctx.fill(); ctx.globalAlpha = 1;
  }

  // selection outline (marching ants), the float's box
  const now = performance.now();
  const live = liveSelection();   // while dragging out a selection: the cells it will end up with, instead of the old ones
  if (live) { if (live.size) outlineCells(live, C['c-sel-line'], now); }
  else if (S.sel) outlineCells(S.sel, C['c-sel-line'], now);
  if (S.selPoly) {   // a polygon selection being clicked out: its points (the first one closes it)
    ctx.strokeStyle = C['c-sel-line'];
    S.selPoly.pts.forEach((p, i) => { ctx.lineWidth = i ? 1 : 2; ctx.strokeRect(Math.round(px(p.x)) + 0.5, Math.round(py(p.y)) + 0.5, Math.round(cw) - 1, Math.round(ch) - 1); });
    ctx.lineWidth = 1;
  }
  if (f) {
    ctx.setLineDash([4, 3]); ctx.lineDashOffset = -now / 60;
    ctx.strokeStyle = C['c-float-ink'];
    ctx.strokeRect(Math.round(px(f.x)) + 0.5, Math.round(py(f.y)) + 0.5, Math.round(f.w * cw), Math.round(f.h * ch));
    ctx.setLineDash([]);
  }

  // a lasso being dragged: a faint line where it's been (the cells it will select show as marching ants, below)
  const d = S.drag;
  if (d && d.kind === 'lasso' && d.pts.length > 1) {
    ctx.strokeStyle = C['c-sel-line']; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.5;
    ctx.beginPath();
    d.pts.forEach((p, i) => { const X = ox + p.x * cw, Y = oy + p.y * ch; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
    ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 1;
  }

  // the cell under the pointer, always (not while panning, or with the Hand or Zoom, which don't act on a cell);
  // with Mirror on, its mirrored copies too, muted
  const hv = S.hover, panning = (S.drag && S.drag.kind === 'pan') || S.spaceDown || S.tool === 'hand' || S.tool === 'zoom';
  if (hv && !panning && !(S.drag && S.drag.kind === 'mirror')) {
    const W = Math.round(cw), H = Math.round(ch), seen = new Set();
    mirrorTargets(hv.x, hv.y, null).forEach(([x, y], i) => {
      if (seen.has(K(x, y)) || !inView(x, y)) return; seen.add(K(x, y));
      const X = Math.round(px(x)), Y = Math.round(py(y));
      ctx.fillStyle = C['c-cursor']; ctx.globalAlpha = i ? 0.08 : 0.16; ctx.fillRect(X, Y, W, H);
      if (!i) { ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.strokeRect(X + 0.5, Y + 0.5, W - 1, H - 1); }
      ctx.globalAlpha = i ? 0.45 : 1; ctx.lineWidth = i ? 1 : 1.5; ctx.strokeStyle = C['c-cursor']; ctx.strokeRect(X + 0.5, Y + 0.5, W - 1, H - 1);
    });
    ctx.globalAlpha = 1; ctx.lineWidth = 1;
  }

  // type cursor
  if (S.tool === 'type' && S.cursor) {
    const { x, y } = S.cursor;
    ctx.strokeStyle = C['c-cursor']; ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(px(x)) + 0.5, Math.round(py(y)) + 0.5, Math.round(cw) - 1, Math.round(ch) - 1);
    // Overwrite: a bar under the cell. Insert: a bar down its left edge (where the character goes in)
    if (S.blinkOn) { ctx.fillStyle = C['c-cursor']; if (inserting()) ctx.fillRect(px(x), py(y) + 1, 2, ch - 2); else ctx.fillRect(px(x) + 1, py(y) + ch - 3, cw - 2, 2); }
  }

  // brush preview
  if ((S.tool === 'pencil' || S.tool === 'brush' || S.tool === 'eraser') && S.hover && !S.drag) {
    ctx.strokeStyle = C['c-cursor']; ctx.globalAlpha = 0.7;
    const ts = toolSize();
    for (const [dx, dy] of brushOffsets(ts.size, ts.tip)) {
      const x = S.hover.x + dx, y = S.hover.y + dy;
      ctx.strokeRect(Math.round(px(x)) + 0.5, Math.round(py(y)) + 0.5, Math.round(cw) - 1, Math.round(ch) - 1);
    }
    ctx.globalAlpha = 1;
    if (S.tool === 'pencil' || (S.tool === 'brush' && S.paint.mode === 'char')) {
      ctx.globalAlpha = 0.5; ctx.fillStyle = C['c-ink'];
      drawCh(S.brush.ch, S.hover.x, S.hover.y);
      ctx.globalAlpha = 1;
    }
  }
}
// The selection a drag in progress will make (Rectangle, Ellipse, Lasso, or a Polygon being clicked out), combined
// with the current one the way letting go will (new / add / sub / int). null when nothing is being dragged out.
let liveCache = { key: '', set: null };
function liveSelection() {
  const d = S.drag;
  let cells, mode, key;
  if (d && d.kind === 'rect') {
    mode = d.mode; key = ['r', d.ellipse, d.x0, d.y0, d.x1, d.y1].join();
    cells = () => d.ellipse ? ellipseCells(d.x0, d.y0, d.x1, d.y1) : rectCells(d.x0, d.y0, d.x1, d.y1);
  } else if (d && d.kind === 'lasso') {
    const l = d.pts[d.pts.length - 1];
    mode = d.mode; key = ['l', d.pts.length, l.x, l.y].join();
    cells = () => d.pts.length >= 3 ? lassoCells(d.pts) : [];
  } else if (S.selPoly) {
    const pts = S.selPoly.pts.slice(); if (S.hover) pts.push(S.hover);
    mode = S.selPoly.mode; key = ['p', ...pts.map(p => p.x + ':' + p.y)].join();
    cells = () => polySelCells(pts);
  } else return null;
  key += '|' + mode + '|' + (S.sel ? S.sel.size : 0);   // (the selection can't change mid-drag; its size is a cheap check)
  if (liveCache.key !== key) liveCache = { key, set: combineSel(cells(), mode) };
  return liveCache.set;
}
// Outline only the edges of a cell set (neighbors outside it).
function outlineCells(set, color, now) {
  const cw = S.cw, ch = S.ch, ox = S.offX, oy = S.offY;
  ctx.beginPath();
  for (const k of set) {
    const [x, y] = unK(k), X = Math.round(ox + x * cw) + 0.5, Y = Math.round(oy + y * ch) + 0.5;
    const X2 = Math.round(ox + (x + 1) * cw) + 0.5, Y2 = Math.round(oy + (y + 1) * ch) + 0.5;
    if (!set.has(K(x, y - 1))) { ctx.moveTo(X, Y); ctx.lineTo(X2, Y); }
    if (!set.has(K(x, y + 1))) { ctx.moveTo(X, Y2); ctx.lineTo(X2, Y2); }
    if (!set.has(K(x - 1, y))) { ctx.moveTo(X, Y); ctx.lineTo(X, Y2); }
    if (!set.has(K(x + 1, y))) { ctx.moveTo(X2, Y); ctx.lineTo(X2, Y2); }
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.setLineDash([]); ctx.stroke();
  ctx.strokeStyle = color; ctx.setLineDash([4, 3]); ctx.lineDashOffset = -now / 60; ctx.stroke();
  ctx.setLineDash([]);
}
function loop() {
  // the ants and the float's box move, so keep drawing while either is up
  if (dirty || S.sel || S.float || S.selPoly || (S.drag && (S.drag.kind === 'rect' || S.drag.kind === 'lasso'))) { render(); dirty = false; updateCursor(); }   // (after clearing dirty: a cursor change can ask for another frame)
  requestAnimationFrame(loop);
}
setInterval(() => { if (S.tool === 'type' && S.cursor) { S.blinkOn = !S.blinkOn; redraw(); } }, 530);

// ---------- cursors ----------
// Our own cursors (drawn in cursors.js, like the toolbox icons): a tool glyph plus a badge for the mode.
// See ascii-editor/CURSORS.md for the full list, and dist/cursors.html for all of them side by side.
const curImage = (glyph, badge, dim, fallback) => window.ASXII_CURSORS.css(glyph, badge, dim, fallback);
// Modifier keys, kept current from every key and pointer event, so the cursor can change the moment one is pressed
S.mods = { shift: false, alt: false, cmd: false };
function trackMods(e) {
  const m = { shift: !!e.shiftKey, alt: !!e.altKey, cmd: !!(e.ctrlKey || e.metaKey) };
  if (m.shift === S.mods.shift && m.alt === S.mods.alt && m.cmd === S.mods.cmd) return;
  S.mods = m; redraw(); update3dCursor();
}
window.addEventListener('keydown', trackMods, true);
window.addEventListener('keyup', trackMods, true);
window.addEventListener('pointermove', trackMods, true);
window.addEventListener('pointerdown', trackMods, true);
window.addEventListener('blur', () => { S.mods = { shift: false, alt: false, cmd: false }; redraw(); update3dCursor(); });
const MODE_BADGE = { add: 'plus', sub: 'minus', int: 'times', new: null };
const SEL_GLYPH = { rect: 'cross', ellipse: 'cross', lasso: 'lasso', polygon: 'polylasso', wand: 'wand' };
// What a click (or the drag in progress) will do, as a cursor
function cursorFor() {
  const t = S.tool, d = S.drag, c = S.hover, m = S.mods;
  const blocked = c && S.sel && !editable(c.x, c.y);   // with a selection, edits only land inside it
  const move = badge => curImage('move', badge, false, 'move');
  if (d) {
    if (d.kind === 'pan') return 'grabbing';
    if (d.kind === 'mirror') return curImage(d.axis === 'x' ? 'moveH' : 'moveV', null, false, d.axis === 'x' ? 'ew-resize' : 'ns-resize');
    if ((d.kind === 'rect' || d.kind === 'shape') && S.spaceDown) return move();   // Space mid-drag: moving the box
    if (d.kind === 'float') return d.axis ? curImage(d.axis === 'h' ? 'moveH' : 'moveV', null, false, 'move') : move(d.copy ? 'plus' : null);
    if (d.kind === 'blockmove' || d.kind === 'textmove') return move();
    if (d.kind === 'outline') return curImage('arrow', 'dashbox', false, 'default');
    if (d.kind === 'rect') return curImage('cross', MODE_BADGE[d.mode] || (d.ellipse ? 'ellipse' : 'rect'));
    if (d.kind === 'lasso') return curImage('lasso', MODE_BADGE[d.mode]);
    if (d.kind === 'shape') return curImage('cross', S.shape.kind);
    if (d.kind === 'paint' && d.right) return t === 'eraser' ? curImage('eraser', 'charA') : d.ch == null ? curImage('eraser') : curImage('fine', 'two');
    if (d.kind === 'paint' || d.kind === 'stroke') return curImage('fine', d.kind === 'stroke' ? 'wait' : mirrorOn() ? 'mirror' : null);
  }
  if (S.spaceDown || t === 'hand') return 'grab';
  const mh = S.hoverPt && mirrorHandleAt(S.hoverPt.px, S.hoverPt.py);   // over a mirror line's handle: drag to move it
  if (mh) return curImage(mh === 'x' ? 'moveH' : 'moveV', null, false, mh === 'x' ? 'ew-resize' : 'ns-resize');
  if (t === 'select') {
    if (m.cmd) return move(m.alt ? 'plus' : null);
    const mode = m.shift && m.alt ? 'int' : m.shift ? 'add' : m.alt ? 'sub' : 'new';
    if (S.selPoly) {   // clicking out a polygon: its mode was set by the first click
      const p = S.selPoly.pts, f = p[0];
      return curImage('polylasso', p.length >= 3 && c && c.x === f.x && c.y === f.y ? 'ring' : MODE_BADGE[S.selPoly.mode]);
    }
    if (mode === 'new' && c && S.sel && S.sel.has(K(c.x, c.y))) return curImage('arrow', 'dashbox', false, 'default');
    const shapeBadge = S.selShape === 'rect' || S.selShape === 'ellipse' ? S.selShape : S.selShape === 'wand' && !S.wandContig ? 'dots' : null;
    return curImage(SEL_GLYPH[S.selShape], MODE_BADGE[mode] || shapeBadge);
  }
  if (t === 'move') {
    if (m.cmd) return curImage('arrow', 'layer', false, 'default');   // a click picks the layer under the pointer
    if (m.alt) return move('plus');
    if (m.shift) return move('lock');
    return move(S.sel || S.float ? null : 'layer');
  }
  if (t === 'type') return 'text';
  if (t === 'font') return c && textLayerAt(c) >= 0 ? move() : 'text';   // over text: click edits it, drag moves it; elsewhere: new text
  if (t === 'pencil' || t === 'brush' || t === 'eraser') {
    if (blocked) return 'not-allowed';
    if (m.alt && t !== 'eraser') return curImage('picker', null, false, 'cell');
    if (m.shift && S.lastPaint) return curImage('fine', 'line');
    if (t === 'brush' && strokeDeferred()) return curImage('fine', 'wait');
    return curImage('fine', mirrorOn() ? 'mirror' : null);
  }
  if (t === 'shape') {
    if (blocked) return 'not-allowed';
    const p = S.poly && S.poly.pts, f = p && p[0];
    if (p && p.length >= 3 && c && c.x === f.x && c.y === f.y) return curImage('cross', 'ring');   // a click here closes it
    return curImage('cross', S.shape.kind);
  }
  if (t === 'fill') {
    if (c && (blocked || c.x < 0 || c.y < 0 || c.x >= S.w || c.y >= S.h)) return 'not-allowed';
    if (m.alt) return curImage('picker', null, false, 'cell');
    if (S.fillContig === m.shift) return curImage('bucket', 'dots', false, 'cell');   // every matching cell
    return curImage('bucket', S.fillSample === 'all' ? 'layer' : null, false, 'cell');
  }
  if (t === 'picker') return curImage('picker', m.shift ? 'two' : S.pickSample === 'all' ? 'layer' : null, false, 'cell');   // (an empty cell picks Clear)
  if (t === 'zoom') return curImage(m.alt ? 'zoomout' : 'zoomin', null, false, m.alt ? 'zoom-out' : 'zoom-in');
  if (t === 'block') return S.blocks.dcells.size ? move() : curImage('cube', null, false, 'pointer');
  return 'default';
}
let lastCur = '';
function updateCursor() { const v = cursorFor(); if (v !== lastCur) { vp.style.cursor = v; lastCur = v; } renderHelp(); }   // (renderHelp only redraws when something it shows changed)
// The 3D editor's canvas: Add / Remove (Shift = Remove), Alt or right-drag turns the view, Space or middle-drag pans
let last3dCur = '';
function update3dCursor() {
  const c = b3dCanvas(); if (!c || !cam.open) return;
  const m = S.mods, d = cam.drag;
  const v = d && d.pan ? 'grabbing' : d ? curImage('orbit', null, false, 'move') : S.spaceDown ? 'grab' : m.alt ? curImage('orbit', null, false, 'move')
    : curImage('cross', (cam.tool === 'remove') !== !!m.shift ? 'minus' : 'plus');
  if (v !== last3dCur) { c.style.cursor = v; last3dCur = v; }
}

// ---------- pointer ----------
function pt(e) { const r = vp.getBoundingClientRect(); return { px: e.clientX - r.left, py: e.clientY - r.top }; }
function inFloat(c) { const f = S.float; return f && c.x >= f.x && c.y >= f.y && c.x < f.x + f.w && c.y < f.y + f.h; }

// The right button works with these tools: Block (3D), Pencil / Brush (the right-button character), Eraser (only the
// brush character), Picker (picks the right-button character)
const rightButtonTool = () => ['block', 'pencil', 'brush', 'eraser', 'picker'].includes(S.tool);
vp.addEventListener('pointerdown', e => {
  if (S.spring) S.spring.used = true;   // a held tool key was used: letting go of it goes back
  if (e.button === 2 && !rightButtonTool()) return;
  if ((e.button === 2 && (e.ctrlKey || e.metaKey)) || (isMac && e.button === 0 && e.ctrlKey && !e.metaKey)) return;   // the right-click menu
  vp.setPointerCapture(e.pointerId);
  const { px, py } = pt(e), c = cellAt(px, py);
  if (gal.open && !(e.button === 1 || S.spaceDown || S.tool === 'hand' || S.tool === 'zoom')) closeGallery();   // drawing on the canvas puts the gallery away (panning and zooming don't)
  if (e.button === 1 || S.spaceDown || S.tool === 'hand') {
    S.drag = { kind: 'pan', sx: px, sy: py, ox: S.offX, oy: S.offY };
    redraw(); e.preventDefault(); return;
  }
  if (e.button !== 0 && !(e.button === 2 && rightButtonTool())) return;
  const t = S.tool;
  const mh = e.button === 0 && mirrorHandleAt(px, py);   // grab a mirror line by its handle
  if (mh) { S.drag = { kind: 'mirror', axis: mh }; redraw(); return; }
  if (!S.float && ['pencil', 'brush', 'eraser', 'shape', 'fill'].includes(t) && textLock({ pencil: 'Drawing', brush: 'Painting', eraser: 'Erasing', shape: 'Drawing', fill: 'Filling' }[t])) return;
  if ((t === 'move' || (t === 'select' && (e.ctrlKey || e.metaKey))) && !S.float && textLocked()) {   // a protected text layer moves whole
    const l = L(); pushUndo(); S.sel = null; S.drag = { kind: 'textmove', id: l.id, sx: c.x, sy: c.y, ox: l.text.x, oy: l.text.y }; redraw(); return;
  }
  // Move tool (or Ctrl with Select): drag the selected content from anywhere; no selection = the whole layer
  // Alt: drag a copy (on a floating block: drop it, then float a copy, so each Alt-drag stamps one). Shift: lock to one axis.
  // Move + Ctrl / Cmd: first pick the layer under the pointer.
  if (t === 'move' || (t === 'select' && (e.ctrlKey || e.metaKey))) {
    if (t === 'move' && (e.ctrlKey || e.metaKey)) pickLayerAt(c);
    if (e.altKey && S.float) commitFloat();
    if (!S.float && !liftForMove(e.altKey)) return;
    S.drag = { kind: 'float', sx: c.x, sy: c.y, fx: S.float.x, fy: S.float.y, axis: null, copy: e.altKey };
    redraw(); return;
  }
  if (t === 'select') {
    commitFloat();
    if (S.selShape === 'polygon' && S.selPoly) {   // clicking out a polygon selection
      const pts = S.selPoly.pts, first = pts[0], last = pts[pts.length - 1];
      if ((pts.length >= 3 && c.x === first.x && c.y === first.y) || (c.x === last.x && c.y === last.y)) finishSelPoly();   // back to the start, or a double-click
      else pts.push(c);
      redraw(); return;
    }
    const mode = selMode(e);
    if (mode === 'new' && S.sel && S.sel.has(K(c.x, c.y))) {    // drag inside the selection: move the outline only (a Wand click without a drag re-selects)
      S.drag = { kind: 'outline', sx: c.x, sy: c.y, base: S.sel, wand: S.selShape === 'wand' ? c : null };
      return;
    }
    if (S.selShape === 'wand') { const cells = wandCells(c.x, c.y); if (cells) applyCells(cells, mode); redraw(); return; }
    if (mode === 'new' && S.sel) { S.sel = null; updateInfo(); }   // a new selection clears the old one right away, like Photoshop
    if (S.selShape === 'polygon') S.selPoly = { pts: [c], mode };
    else if (S.selShape === 'lasso') S.drag = { kind: 'lasso', pts: [{ x: (px - S.offX) / S.cw, y: (py - S.offY) / S.ch }], mode };
    else {
      // shiftFree / altFree: a modifier held from the start means add / subtract; pressed again mid-drag it means
      // fixed aspect (Shift) or from the center (Alt), like Photoshop
      S.drag = { kind: 'rect', ax: c.x, ay: c.y, cx: c.x, cy: c.y, mode, ellipse: S.selShape === 'ellipse', shiftFree: !e.shiftKey, altFree: !e.altKey };
      dragBox(S.drag, e.shiftKey, e.altKey);
    }
  } else if (t === 'type') {
    commitFloat(); setCursor(c.x, c.y);
  } else if ((t === 'pencil' || t === 'brush' || t === 'fill') && e.altKey) {   // hold Alt: pick a character without leaving the tool
    const got = pickAt(c, 'all') || CLEAR;   // an empty cell is Clear
    pickInto(got); toast(`${S.activeSlot === 'draw' ? 'Draw' : 'Right'}: ${chName(got)}`);
  } else if ((t === 'pencil' || t === 'brush' || t === 'eraser') && e.button === 2) {
    // the right button: Pencil / Brush paint the right-button character (or erase), the Eraser erases only the brush character
    commitFloat(); pushUndo();
    const ch = t === 'eraser' ? null : S.ch2, only = t === 'eraser' ? S.brush.ch : undefined;
    const what = t === 'eraser' ? 'Erasing' : 'Drawing', blocked = stamp(c.x, c.y, ch, only);
    if (blocked) warnOutside(what);
    S.drag = { kind: 'paint', lx: c.x, ly: c.y, ch, only, right: true, warned: blocked, what };
    changed();
  } else if (strokeDeferred()) {
    commitFloat();
    const at = { x: (px - S.offX) / S.cw, y: (py - S.offY) / S.ch };
    if (e.shiftKey && S.lastPaint) { commitStroke([{ x: S.lastPaint.x + 0.5, y: S.lastPaint.y + 0.5 }, at]); S.lastPaint = c; redraw(); return; }   // Shift-click: a straight line from the last stroke
    S.drag = { kind: 'stroke', pts: [at] };
  } else if (t === 'pencil' || t === 'brush' || t === 'eraser') {
    commitFloat();
    pushUndo();
    // Pencil: the character. Brush: undefined = the Paint setting (character / noise / pattern). Eraser: null.
    const ch = t === 'pencil' ? S.brush.ch : t === 'brush' ? undefined : null;
    if (t === 'pencil' || (t === 'brush' && S.paint.mode === 'char')) noteRecent(S.brush.ch);
    let blocked = false;
    if (e.shiftKey && S.lastPaint) line(S.lastPaint.x, S.lastPaint.y, c.x, c.y, (x, y) => { if (stamp(x, y, ch)) blocked = true; });   // Shift-click: a straight line
    else blocked = stamp(c.x, c.y, ch);
    const what = t === 'eraser' ? 'Erasing' : t === 'pencil' ? 'Drawing' : 'Painting';
    if (blocked) warnOutside(what);
    S.drag = { kind: 'paint', lx: c.x, ly: c.y, ch, warned: blocked, what };
    changed();
  } else if (t === 'font') {
    if (isField(document.activeElement)) document.activeElement.blur();   // the keys should come to the text
    commitFloat(); checkTextLayers();
    // a text layer under the click: edit it (and drag to move it); otherwise start a new one here
    const hit = textLayerAt(c);
    if (hit >= 0) {
      const l = S.layers[hit]; if (S.textEdit !== l.id) endTextEdit();
      S.active = S.layers.indexOf(l); S.textEdit = l.id; S.figfont = { name: l.text.font, layout: l.text.layout, ws: l.text.ws || 'clear', ls: l.text.ls || 0, lh: l.text.lh || 0 };
      pushUndo(); S.drag = { kind: 'textmove', id: l.id, sx: c.x, sy: c.y, ox: l.text.x, oy: l.text.y };
      renderOptions(); changed(true);
    } else {
      endTextEdit(); pushUndo();
      const l = makeLayer('Text'); l.text = { str: '', font: S.figfont.name, layout: S.figfont.layout, ws: S.figfont.ws || 'clear', ls: S.figfont.ls || 0, lh: S.figfont.lh || 0, x: c.x, y: c.y }; l.autoName = true; textAutoName(l);
      S.layers.splice(S.active + 1, 0, l); S.active++; S.textEdit = l.id;
      renderOptions(); changed(true);
    }
  } else if (t === 'block') {
    commitFloat();
    if (!S.blocks.dcells.size) open3d();   // nothing yet: build it in 3D
    else { pushUndo(); S.drag = { kind: 'blockmove', sx: c.x, sy: c.y, ox: S.blocks.ox || 0, oy: S.blocks.oy || 0 }; }
  } else if (t === 'shape') {
    commitFloat();
    if (S.shape.kind === 'polygon') {
      if (!S.poly) S.poly = { pts: [c] };
      else {
        const pts = S.poly.pts, first = pts[0], last = pts[pts.length - 1];
        if (pts.length >= 3 && c.x === first.x && c.y === first.y) finishPolygon(true);       // back to the start: closed
        else if (c.x === last.x && c.y === last.y) finishPolygon(false);                      // same cell twice (double-click): open
        else pts.push(c);
      }
    } else {
      S.drag = { kind: 'shape', shape: S.shape.kind, ax: c.x, ay: c.y, cx: c.x, cy: c.y, shiftFree: !e.shiftKey, altFree: !e.altKey, shift: e.shiftKey };
      if (S.shape.kind !== 'line') dragBox(S.drag, e.shiftKey, e.altKey);
    }
  } else if (t === 'fill') {
    floodFill(c.x, c.y, S.fillContig === e.shiftKey);
  } else if (t === 'picker') {
    const got = pickAt(c, S.pickSample) || CLEAR;   // an empty cell is Clear (it erases)
    const other = e.button === 2 || e.shiftKey;   // the selected chip; Shift / right-click: the other one
    pickInto(got, other); toast(`${(other ? otherSlot() : S.activeSlot) === 'draw' ? 'Draw' : 'Right'}: ${chName(got)}`); setTool(S.lastDraw);
  } else if (t === 'zoom') {
    zoomStep(e.altKey ? -1 : 1, px, py);
  }
  redraw();
});
vp.addEventListener('pointermove', e => {
  const { px, py } = pt(e), c = cellAt(px, py);
  const moved = !S.hover || S.hover.x !== c.x || S.hover.y !== c.y;
  const wasOnHandle = S.hoverPt && mirrorHandleAt(S.hoverPt.px, S.hoverPt.py);
  S.hover = c; S.hoverPt = { px, py };
  if (S.mirror !== 'off' && wasOnHandle !== mirrorHandleAt(px, py)) redraw();   // the cursor changes over a handle
  const d = S.drag;
  if (d) {
    if (d.kind === 'pan') { S.offX = d.ox + px - d.sx; S.offY = d.oy + py - d.sy; S.viewTouched = true; redraw(); return; }
    if (d.kind === 'mirror') { dragMirror(d.axis, px, py); return; }
    // hold Space mid-drag: move the box or shape you're drawing instead of resizing it
    if ((d.kind === 'rect' || d.kind === 'shape') && S.spaceDown) { d.ax += c.x - d.cx; d.ay += c.y - d.cy; }
    if (d.kind === 'rect') { d.cx = c.x; d.cy = c.y; dragBox(d, e.shiftKey, e.altKey); }
    if (d.kind === 'shape') { d.cx = c.x; d.cy = c.y; d.shift = e.shiftKey; if (d.shape !== 'line') dragBox(d, e.shiftKey, e.altKey); }
    if (d.kind === 'textmove' && moved) { const l = S.layers.find(q => q.id === d.id); if (l && l.text) { l.text.x = d.ox + c.x - d.sx; l.text.y = d.oy + c.y - d.sy; renderTextLayer(l); changed(); } }
    if (d.kind === 'blockmove' && moved) { S.blocks.ox = d.ox + c.x - d.sx; S.blocks.oy = d.oy + c.y - d.sy; S.blocks.placed = true; S.blocks.moved = true; changed(); }
    if (d.kind === 'stroke') {
      const p = { x: (px - S.offX) / S.cw, y: (py - S.offY) / S.ch }, l = d.pts[d.pts.length - 1];
      if (Math.abs(p.x - l.x) + Math.abs(p.y - l.y) * S.ch / S.cw > (pencilSmart() ? 0.2 : 0.3)) { d.pts.push(p); redraw(); }
    }
    if (d.kind === 'lasso') {
      const p = { x: (px - S.offX) / S.cw, y: (py - S.offY) / S.ch }, l = d.pts[d.pts.length - 1];
      if (Math.abs(p.x - l.x) + Math.abs(p.y - l.y) > 0.25) { d.pts.push(p); redraw(); }
    }
    if (d.kind === 'float' && S.float) {
      let dx = c.x - d.sx, dy = c.y - d.sy;
      d.axis = null;
      if (e.shiftKey && (dx || dy)) { if (Math.abs(dx) * S.cw >= Math.abs(dy) * S.ch) { dy = 0; d.axis = 'h'; } else { dx = 0; d.axis = 'v'; } }
      S.float.x = d.fx + dx; S.float.y = d.fy + dy;
    }
    if (d.kind === 'outline' && moved) { S.sel = shiftSet(d.base, c.x - d.sx, c.y - d.sy); }
    if (d.kind === 'paint' && moved) {
      line(d.lx, d.ly, c.x, c.y, (x, y) => { if (stamp(x, y, d.ch, d.only) && !d.warned) { d.warned = true; warnOutside(d.what); } });
      d.lx = c.x; d.ly = c.y; changed();
    }
  }
  if (moved) { updateInfo(); redraw(); }
});
function endDrag() {
  if (S.drag && S.drag.kind === 'shape') { const sh = currentShape(); S.drag = null; commitShape(sh); redraw(); return; }
  if (S.drag && S.drag.kind === 'stroke') {
    const pts = S.drag.pts, l = pts[pts.length - 1]; S.drag = null; commitStroke(pts);
    S.lastPaint = { x: Math.floor(l.x), y: Math.floor(l.y) }; redraw(); return;
  }
  const d = S.drag; S.drag = null;
  if (!d) return;
  if (d.kind === 'paint') S.lastPaint = { x: d.lx, y: d.ly };
  if (d.kind === 'mirror') { changed(); renderOptions(); }   // saved with the document; Center can be used now
  if (d.kind === 'rect') {
    if (d.ax === d.cx && d.ay === d.cy && d.mode === 'new') { S.sel = null; updateInfo(); }   // a plain click deselects
    else if (d.ellipse) applyCells(ellipseCells(d.x0, d.y0, d.x1, d.y1), d.mode);
    else applyRect(d.x0, d.y0, d.x1, d.y1, d.mode);
  }
  if (d.kind === 'lasso') {
    if (d.pts.length < 3) { if (d.mode === 'new') { S.sel = null; updateInfo(); } }   // a click deselects
    else applyCells(lassoCells(d.pts), d.mode);
  }
  if (d.kind === 'outline' && d.wand && S.sel === d.base) applyCells(wandCells(d.wand.x, d.wand.y) || [], 'new');   // a Wand click, not a drag
  if (d.kind === 'pan') savePrefs();
  redraw();
}
vp.addEventListener('pointerup', endDrag);
vp.addEventListener('pointercancel', endDrag);
vp.addEventListener('pointerleave', () => { if (!S.drag) { S.hover = null; updateInfo(); redraw(); } });
vp.addEventListener('contextmenu', e => e.preventDefault());
vp.addEventListener('wheel', e => {
  e.preventDefault();
  const { px, py } = pt(e);
  if (e.ctrlKey || e.metaKey) {
    const z = S.zoom * Math.pow(1.0015, -e.deltaY);
    setZoom(z, px, py);
  } else {
    // Shift: sideways. (macOS already turns Shift + wheel into deltaX; elsewhere it stays in deltaY)
    if (e.shiftKey) S.offX -= e.deltaX || e.deltaY; else { S.offX -= e.deltaX; S.offY -= e.deltaY; }
    S.viewTouched = true; redraw();
  }
}, { passive: false });

// ---------- keyboard ----------
const isField = el => el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA');
window.addEventListener('keydown', e => {
  // the New pattern dialog takes the keys while it is open
  if (!$('#patDlg').hidden) {
    if (e.key === 'Escape') { e.preventDefault(); closePatternDialog(); }
    else if (e.key === 'Enter') { e.preventDefault(); savePatternDraft(); }
    return;
  }
  if (cam.open && !(e.ctrlKey || e.metaKey) && e.key !== ' ' && !isField(document.activeElement)) {
    if (e.key === 'Escape') { if (!closeB3Brush() && !closeB3Examples()) close3d(); } else if (e.key === 'Enter') preview3d();
    else if (e.key === 'q' || e.key === 'Q') { b3shapeTurn(); }
    else if (e.key === 'c' || e.key === 'C') { const m = ['plain', 'axes', 'height']; S.b3color = m[(m.indexOf(S.b3color) + 1) % 3]; savePrefs(); b3ColorUi(); render3d(); }
    else if (e.key === 'a' || e.key === 'A') setB3Tool('add');
    else if (e.key === 'r' || e.key === 'R' || e.key === 'x' || e.key === 'X') setB3Tool('remove');
    else if (e.key === 'Shift') { cam.shift = true; render3d(); }
    else if (e.key === 'f' || e.key === 'F') focus3d();
    else if (e.key === 'z' || e.key === 'Z') $('#b3dSize').click();
    else if (e.key === '1') setCamView('front');
    else if (e.key === '2') setCamView('angled');
    else if (e.key === '3') setCamView('diamond');
    else if (e.key === 'g' || e.key === 'G') setCamView('angled');
    else if (e.key === 'd' || e.key === 'D') setCamView('diamond');
    e.preventDefault(); return;
  }
  if (gal.open && !isField(document.activeElement) && !(e.ctrlKey || e.metaKey)) {
    if (e.key === 'Escape') { e.preventDefault(); closeGallery(); return; }
    if (e.key === 'Enter') { e.preventDefault(); galAdd(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); galStep(e.key === 'ArrowDown' ? 1 : -1); return; }
  }
  if (e.key === 'Escape' && !$('#patMenu').hidden) { closePatternMenu(); return; }
  if (e.key === 'Escape' && !$('#fontMenu').hidden) { closeFontMenu(); return; }
  if (e.key === 'Escape' && !$('#paintMenu').hidden) { closePaintMenu(); return; }
  if (e.key === 'Escape' && (!$('#brushMenu').hidden || !$('#brushPop').hidden)) { closeBrushMenu(); closeBrushPop(); return; }
  if (e.key === 'Escape' && !$('#rampMenu').hidden) { closeRampMenu(); return; }
  if (e.key === 'Escape' && !$('#noiseMenu').hidden) { closeNoiseMenu(); return; }
  if (e.key === 'Escape' && !$('#setPop').hidden) { closeSetPop(); return; }
  if (e.key === 'Escape' && !$('#blockPop').hidden) { closeBlockPop(); return; }
  if (extrude.open && (e.key === 'Escape' || e.key === 'Enter')) { e.preventDefault(); if (e.key === 'Enter') applyExtrude(); else closeExtrude(); return; }
  if (isField(document.activeElement)) {
    if (e.key === 'Escape' || (e.key === 'Enter' && document.activeElement.tagName !== 'TEXTAREA')) document.activeElement.blur();
    return;
  }
  const mod = e.ctrlKey || e.metaKey, k = e.key;
  if (k === 'Shift') { S.shiftDown = true; if (S.float) redraw(); }
  if (k === 'Alt') e.preventDefault();
  if ((k === 'Shift' || k === 'Alt') && S.drag && (S.drag.kind === 'rect' || S.drag.kind === 'shape')) { S.drag.shift = e.shiftKey; if (S.drag.shape !== 'line') dragBox(S.drag, e.shiftKey, e.altKey); redraw(); }
  // a polygon being clicked out: Enter finishes it open, Esc cancels, Backspace takes back the last point
  if (S.selPoly && !mod) {   // the same keys for a polygon selection (Enter closes it)
    if (k === 'Enter') { e.preventDefault(); finishSelPoly(); return; }
    if (k === 'Escape') { e.preventDefault(); finishSelPoly(true); return; }
    if (k === 'Backspace' || k === 'Delete') { e.preventDefault(); S.selPoly.pts.pop(); if (!S.selPoly.pts.length) S.selPoly = null; redraw(); return; }
  }
  if (S.poly && !mod) {
    if (k === 'Enter') { e.preventDefault(); finishPolygon(false); return; }
    if (k === 'Escape') { e.preventDefault(); S.poly = null; redraw(); return; }
    if (k === 'Backspace' || k === 'Delete') { e.preventDefault(); S.poly.pts.pop(); if (!S.poly.pts.length) S.poly = null; redraw(); return; }
  }
  if (mod) {
    const lk = k.toLowerCase();
    if (lk === 'c' && e.shiftKey) { e.preventDefault(); copyMerged(); }
    else if (lk === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (lk === 'y') { e.preventDefault(); redo(); }
    else if (lk === 'a') { e.preventDefault(); e.shiftKey ? selectCanvas() : selectAll(); }
    else if (lk === 'd') { e.preventDefault(); if (S.float && e.shiftKey) commitFloat(true); deselect(); }
    else if (lk === 's') { e.preventDefault(); saveProject(); }
    else if (lk === 'o') { e.preventDefault(); $('#fileOpen').click(); }
    else if (k === '=' || k === '+') { e.preventDefault(); zoomStep(1); }
    else if (k === '-') { e.preventDefault(); zoomStep(-1); }
    else if (k === '0') { e.preventDefault(); zoomFit(); }
    else if (k.startsWith('Arrow') && S.tool !== 'type') {
      e.preventDefault();
      const st = e.shiftKey ? 5 : 1;
      nudge(k === 'ArrowLeft' ? -st : k === 'ArrowRight' ? st : 0, k === 'ArrowUp' ? -st : k === 'ArrowDown' ? st : 0, true);
    }
    return;   // c / x / v go through the copy / cut / paste events
  }
  closeMenus();

  // Font tool: type into the text layer being edited
  if (S.tool === 'font' && editingText()) {
    if (k === 'Escape' || (k === 'Enter' && e.ctrlKey)) { e.preventDefault(); endTextEdit(); renderOptions(); return; }
    if (k === 'Backspace') { e.preventDefault(); typeText(t => { t.str = chars(t.str).slice(0, -1).join(''); }); return; }
    if (k === 'Enter') { e.preventDefault(); typeText(t => { t.str += '\n'; }); return; }
    if (k.startsWith('Arrow')) { e.preventDefault(); const l = editingText(); pushUndo(); l.text.x += k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0; l.text.y += k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0; renderTextLayer(l); changed(); return; }
    if (chars(k).length === 1) { e.preventDefault(); typeText(t => { t.str += k; }); return; }
  }

  // typing mode
  if (S.tool === 'type' && S.cursor) {
    const cur = S.cursor;
    if ((k === 'Backspace' || k === 'Delete') && textLock('Typing')) { e.preventDefault(); return; }
    if (k === 'Escape') { setTool('select'); return; }
    if (k === 'Enter') {
      const n = S.sel && selNextRow(cur.y);
      if (n) { cur.x = n.x; cur.y = n.y; } else { cur.y++; cur.x = cur.lineX; }
    }
    else if (k === 'Backspace' && S.sel) {
      const p = selStep(cur.x, cur.y, -1);
      if (p) { cur.x = p.x; cur.y = p.y; pushUndo('type'); putCell(L(), cur.x, cur.y, null); changed(); } else warnOutside('Typing');
    }
    else if (k === 'Backspace') { if (editable(cur.x - 1, cur.y)) { cur.x--; pushUndo('type'); putCell(L(), cur.x, cur.y, null); if (inserting()) shiftRow(cur.y, cur.x + 1, -1); changed(); } else warnOutside('Typing'); }
    else if (k === 'Delete') { if (editable(cur.x, cur.y)) { pushUndo('type'); putCell(L(), cur.x, cur.y, null); if (inserting()) shiftRow(cur.y, cur.x + 1, -1); changed(); } else warnOutside('Typing'); }
    else if (k === 'Insert') setTypeInsert(!S.typeInsert);
    else if (k === 'ArrowLeft') cur.x--;
    else if (k === 'ArrowRight') cur.x++;
    else if (k === 'ArrowUp') cur.y--;
    else if (k === 'ArrowDown') cur.y++;
    else if (k === 'Home') cur.x = cur.lineX;
    else if ([...k].length === 1 && !e.altKey) { typeChar(k); e.preventDefault(); return; }
    else return;
    if (k.startsWith('Arrow') || k === 'Home') { cur.lineX = k === 'ArrowUp' || k === 'ArrowDown' ? cur.lineX : cur.x; S.lastTag = null; }
    S.blinkOn = true; e.preventDefault(); updateInfo(); redraw();
    return;
  }

  if (k === ' ') { if (!S.spaceDown) { S.spaceDown = true; redraw(); update3dCursor(); } e.preventDefault(); return; }
  const step = e.shiftKey ? 5 : 1;
  // Spring-loaded tools: hold a tool's key, use it, let go to go back (a quick tap just switches). Not T or K.
  if (SPRING_KEYS.includes(k.toLowerCase()) && !e.shiftKey) {
    if (e.repeat) { e.preventDefault(); return; }
    S.spring = { key: k.toLowerCase(), prev: S.tool, prevShape: S.selShape, at: Date.now(), used: false };
  }
  switch (k) {
    case 'ArrowLeft': nudge(-step, 0); break;
    case 'ArrowRight': nudge(step, 0); break;
    case 'ArrowUp': nudge(0, -step); break;
    case 'ArrowDown': nudge(0, step); break;
    case 'Enter':
      if (S.float) commitFloat(e.shiftKey || undefined);
      else {
        const b = S.sel ? selNextRow(-Infinity) : S.hover || S.cursor || { x: 0, y: 0 };
        setTool('type'); setCursor(b.x, b.y);
      }
      break;
    case 'Escape': if (S.float) cancelFloat(); else deselect(); break;
    case 'Delete': case 'Backspace': if (e.altKey) fillSelection(); else deleteSelection(); break;
    case 'd': case 'D': if (S.float) commitFloat(e.shiftKey || undefined); deselect(); break;
    case 'm': case 'M':
      if (e.shiftKey) { const order = ['rect', 'ellipse', 'lasso', 'polygon']; setSelShape(order[(order.indexOf(S.lastMarquee) + 1) % order.length]); }
      else if (S.tool !== 'select' || S.selShape === 'wand') setSelShape(S.lastMarquee, true);
      break;
    case 'w': case 'W': setSelShape('wand', true); break;
    case 'g': case 'G': setTool('fill'); break;
    case 'u': case 'U': setTool('shape'); break;
    case 'k': case 'K': setTool('block'); break;
    case 'v': case 'V': setTool('move'); break;
    case 't': case 'T': setTool('type'); break;
    case 'b': case 'B': setTool('brush'); break;
    case 'p': case 'P': setTool('pencil'); break;
    case 'f': case 'F': setTool('font'); break;
    case 's': case 'S': if (S.tool === 'pencil') { S.pencil.smart = !S.pencil.smart; savePrefs(); renderOptions(); toast(S.pencil.smart ? 'Smart line: ' + SMART_STYLES[S.pencil.style] : 'Character'); } break;
    case 'e': case 'E': setTool('eraser'); break;
    case 'i': case 'I': setTool('picker'); break;
    case 'h': case 'H': setTool('hand'); break;
    case 'z': case 'Z': setTool('zoom'); break;
    case 'x': case 'X': swapSlots(); break;
    case 'l': case 'L': CMDS.focusToggle(); break;
    case '[': setBrushSize(toolSize().size - 1); break;
    case ']': setBrushSize(toolSize().size + 1); break;
    case '=': case '+': zoomStep(1); break;
    case '-': case '_': zoomStep(-1); break;
    case '0': zoomFit(); break;
    case '1': setZoom(1); break;
    default: return;
  }
  e.preventDefault();
});
// Arrows: a floating block or the Move tool moves content; the Select tool moves just the outline.
// Select: arrows move the outline (a floating block drops first), Ctrl + arrows move the content.
// Move: arrows move the content.
function nudge(dx, dy, ctrl) {
  if (!S.float && textLocked() && (S.tool === 'move' || (S.tool === 'select' && ctrl))) { const l = L(); pushUndo('tnudge' + l.id); l.text.x += dx; l.text.y += dy; renderTextLayer(l); changed(); return; }
  if (S.tool === 'move' || (S.tool === 'select' && ctrl)) moveFloat(dx, dy);
  else if (S.tool === 'select') { if (S.float) commitFloat(); moveOutline(dx, dy); }
  else if (S.float) moveFloat(dx, dy);
}
const SPRING_KEYS = ['m', 'w', 'v', 'p', 'b', 'e', 'u', 'g', 'i', 'h', 'z'], SPRING_MS = 400;
window.addEventListener('keyup', e => {
  const sp = S.spring;
  if (sp && e.key.toLowerCase() === sp.key) {
    S.spring = null;
    const moved = S.tool !== sp.prev || (S.tool === 'select' && S.selShape !== sp.prevShape);
    if (moved && (sp.used || Date.now() - sp.at > SPRING_MS)) { if (sp.prev === 'select') setSelShape(sp.prevShape, true); else setTool(sp.prev); }
  }
  if (e.key === 'Shift') { S.shiftDown = false; if (S.float) redraw(); }
  if (e.key === 'Alt') e.preventDefault();
  if ((e.key === 'Shift' || e.key === 'Alt') && S.drag && (S.drag.kind === 'rect' || S.drag.kind === 'shape')) { S.drag.shift = e.shiftKey; if (S.drag.shape !== 'line') dragBox(S.drag, e.shiftKey, e.altKey); redraw(); }
  if (e.key === ' ') { S.spaceDown = false; redraw(); update3dCursor(); }
});
window.addEventListener('blur', () => { S.spaceDown = false; S.shiftDown = false; S.spring = null; redraw(); });

// ---------- clipboard (the copy / cut / paste events work without a permission prompt) ----------
document.addEventListener('copy', e => {
  if (isField(document.activeElement)) return;
  const t = selectionText(); if (t == null) return;
  e.clipboardData.setData('text/plain', t); e.preventDefault();
  S.clip = t; toast('Copied');
});
document.addEventListener('cut', e => {
  if (isField(document.activeElement)) return;
  const t = selectionText(); if (t == null) return;
  e.clipboardData.setData('text/plain', t); e.preventDefault();
  S.clip = t; deleteSelection(); toast('Cut');
});
document.addEventListener('paste', e => {
  if (isField(document.activeElement)) return;
  const t = e.clipboardData.getData('text/plain'); if (!t) return;
  if (S.tool === 'font' && editingText()) { e.preventDefault(); typeText(x => { x.str += t.replace(/\r\n?/g, '\n'); }); return; }   // pasting into the text
  e.preventDefault(); floatFromText(t);
});
async function writeClipboard(text) {
  S.clip = text;
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  }
}

// ---------- files ----------
function projectData() {
  return {
    app: 'asXii', appVersion: VERSION, format: 1, name: $('#docname').value, width: S.w, height: S.h, active: S.active,
    mirror: { x: S.mirrorAt.x, y: S.mirrorAt.y },
    blocks: { w: S.blocks.w, h: S.blocks.h, depth: S.blocks.depth, fill: S.blocks.fill, seams: S.blocks.seams, solid: S.blocks.solid,
      view: S.blocks.view, size: S.blocks.size, dir: S.blocks.dir, level: S.blocks.level, flat: S.blocks.flat, ox: S.blocks.ox, oy: S.blocks.oy, placed: S.blocks.placed, moved: !!S.blocks.moved, dcells: [...S.blocks.dcells], cells: [...S.blocks.cells] },
    layers: S.layers.map(l => {
      const cells = [...l.cells.keys()];
      if (!cells.length) return { name: l.name, visible: l.visible, x: 0, y: 0, rows: [], ...(l.text ? { text: { ...l.text }, autoName: !!l.autoName } : {}) };
      const b = selBounds(cells);
      const rows = [];
      for (let j = 0; j < b.h; j++) { let r = ''; for (let i = 0; i < b.w; i++) r += l.cells.get(K(b.x + i, b.y + j)) || ' '; rows.push(r.replace(/\s+$/, '')); }
      return { name: l.name, visible: l.visible, x: b.x, y: b.y, rows, ...(l.text ? { text: { ...l.text }, autoName: !!l.autoName } : {}) };
    }),
  };
}
function loadProject(d) {
  if (!d || !Array.isArray(d.layers)) throw new Error('Not an asXii project');
  S.w = d.width | 0 || 80; S.h = d.height | 0 || 24;
  S.layers = d.layers.map(ld => {
    const l = makeLayer(ld.name); l.visible = ld.visible !== false;
    (ld.rows || []).forEach((r, j) => chars(r).forEach((c, i) => { if (c !== ' ') l.cells.set(K(ld.x + i, ld.y + j), c); }));
    const t = ld.text;
    if (t && typeof t === 'object' && (window.ASXII_FONTS || {})[t.font]) { l.text = { str: String(t.str || ''), font: t.font, layout: ['default', 'full', 'fit', 'smush'].includes(t.layout) ? t.layout : 'default', ws: ['inside', 'block'].includes(t.ws) ? t.ws : 'clear', ls: clamp(t.ls | 0, -3, 20), lh: clamp(t.lh | 0, -30, 20), x: t.x | 0, y: t.y | 0 }; l.autoName = !!ld.autoName; }
    return l;
  });
  if (!S.layers.length) S.layers.push(makeLayer('Layer 1'));
  S.active = clamp(d.active | 0, 0, S.layers.length - 1);
  S.sel = null; S.float = null; S.cursor = null; S.textEdit = null;
  const half = (v, max) => typeof v === 'number' && isFinite(v) && v >= 0 && v <= max ? Math.round(v * 2) / 2 : null;
  S.mirrorAt = { x: half(d.mirror && d.mirror.x, S.w), y: half(d.mirror && d.mirror.y, S.h) };
  const bk = d.blocks || {};
  S.blocks = { cells: new Set(Array.isArray(bk.cells) ? bk.cells.filter(k => /^-?\d+,-?\d+$/.test(k)) : []),
    w: clamp(bk.w | 0 || 3, 1, 12), h: clamp(bk.h | 0 || 2, 1, 12), depth: clamp(bk.depth | 0 || 1, 1, 12),
    fill: bk.fill && typeof bk.fill === 'object' ? { front: String(bk.fill.front || '').slice(0, 2), top: String(bk.fill.top || '').slice(0, 2), side: String(bk.fill.side || '').slice(0, 2) } : { front: '', top: '', side: '' },
    seams: !!bk.seams, solid: bk.solid !== false, erase: false,
    // Diagonal is the default view; a saved Straight view stays only if it has straight blocks in it
    view: 'diag', size: clamp(bk.size | 0 || 2, 1, 8), dir: bk.dir < 0 ? -1 : 1,
    dcells: new Set(Array.isArray(bk.dcells) ? bk.dcells.filter(k => /^-?\d+,-?\d+(,-?\d+)?$/.test(k)).map(k => dkey(...dparse(k))) : []),
    level: clamp(bk.level | 0, 0, 20), flat: bk.flat !== false, ox: bk.ox | 0, oy: bk.oy | 0, placed: !!bk.placed, moved: !!bk.moved, show: S.blocks.show === 'shapes' ? 'shapes' : 'ascii' };
  if (d.name) $('#docname').value = d.name;
}
// ---------- Block tool (K): paint 3D blocks, then bake them to ASCII ----------
// Blocks sit on a grid of w x h character cells and all extrude back by `depth` (oblique, grid-aligned: each step of
// depth is one column right and one row up). They're kept with the project (and in undo) until you clear them.
// Bake always draws the outline, then fills each face with a character, or leaves it blank.
const BLOCK_FILLS = {
  none:    { name: 'None (outline only)', front: '', top: '', side: '' },
  dots:    { name: 'Dots  .', front: '.', top: '', side: '' },
  texture: { name: 'Texture  :', front: ':', top: '', side: '' },
  cross:   { name: 'Cross  X', front: 'X', top: '', side: '' },
  shaded:  { name: 'Shaded  # : %', front: '#', top: ':', side: '%' },
  blocks:  { name: 'Blocks  █ ▓ ▒', front: '█', top: '▓', side: '▒' },
};
const blockFillPreset = f => Object.keys(BLOCK_FILLS).find(k => ['front', 'top', 'side'].every(x => (BLOCK_FILLS[k][x] || '') === (f[x] || '')));
const blockKey = (bx, by) => bx + ',' + by;
// A solid space: a blank cell that still covers the layers below (White space: Solid). It is a no-break space in the
// cell, drawn as a faint dot in the editor, and becomes a plain space in everything you copy or export.
const SOLID = '\u00A0';
// Opaque space: an empty cell that covers the layers under it. Shown as a faint red cell; copied and exported as a space.
const SOLID_FILL = '#ff0000', SOLID_ALPHA = 0.15;
// Clear: a stand-in character that erases wherever it's painted, so any drawing tool can erase (Fill a region, cut a
// Shape...). setCell turns it into a delete, so it's never stored. Shown as a blue outlined cell.
const CLEAR = '\uE000', CLEAR_STROKE = '#4ea1ff';
const chName = c => c === SOLID ? 'opaque space' : c === CLEAR ? 'clear (erases)' : c;   // for messages
// Everything a bake puts down: the outline, the face fills, and (Solid) solid spaces in the faces left blank.
// ---------- Diagonal view: diamond blocks on a 45° grid, extruded straight right or left (the Lennert Stock look) ----------
// Block (u, v): its top point is at (X, Y) = ((u - v) * b, (u + v) * b) in cell-corner units; it reaches b down-right to
// its right point, b down-left to its left point, 2b down to its bottom point. Neighbors across its edges:
// NE (u, v-1) shares top-right, SE (u+1, v) bottom-right, SW (u, v+1) bottom-left, NW (u-1, v) top-left.
const diagXY = (u, v, b) => [(u - v) * b, (u + v) * b];
// the diamond under a character cell (the nearest center, measured diamond-wise)
function diagAt(cx, cy, b) {
  const p = cx + 0.5, q = cy + 0.5, s1 = p / b, s2 = (q - b) / b;
  const u0 = Math.floor((s1 + s2) / 2), v0 = Math.floor((s2 - s1) / 2);
  let best = null, bd = Infinity;
  for (const [u, v] of [[u0, v0], [u0 + 1, v0], [u0, v0 + 1], [u0 + 1, v0 + 1]]) {
    const [X, Y] = diagXY(u, v, b), d = Math.abs(p - X) + Math.abs(q - (Y + b));
    if (d < bd) { bd = d; best = [u, v]; }
  }
  return best;
}
// Diagonal blocks are voxels: "u,v,z" (z = depth level; 0 is the front, deeper levels sit one depth step further back).
// Older two-part keys ("u,v") are level 0.
const dkey = (u, v, z) => u + ',' + v + ',' + (z || 0);
const dparse = k => { const a = k.split(',').map(Number); return [a[0], a[1], a[2] || 0]; };
// Painting order: deeper levels first; within a level, with depth going right a block further right is nearer
// (its side faces cover the back edges of blocks to its left); going left, the other way round.
function diagOrder(cells, D) {
  return [...cells].map(dparse).sort((p, q) => q[2] - p[2] || (D > 0 ? (p[0] - p[1]) - (q[0] - q[1]) : (q[0] - q[1]) - (p[0] - p[1])));
}
// Bake the diagonal view. Per level (deepest first): each block puts down its side faces (hiding what is behind them),
// then its back edges, joiners and folds; then that level's fronts. A block with another directly behind it draws no
// back edges, so the depth just carries on into the next level.
function diagBake(B = S.blocks) {
  const OX = B.ox || 0, OY = B.oy || 0;
  const b = Math.max(1, B.size || 2), D = (B.depth || 1) * (B.dir < 0 ? -1 : 1), f = B.fill || {}, n = Math.abs(D);
  const cells = new Set([...B.dcells].map(k => dkey(...dparse(k))));
  // Flatten horizontal runs: side-by-side diamonds leave V notches between their points; fill each empty notch with
  // half a diamond, so the run's top and bottom are flat lines ('_') instead of a zigzag.
  const halves = new Map();
  if (B.flat !== false) for (const k of cells) {
    const [u, v, z] = dparse(k);
    if (!cells.has(dkey(u + 1, v - 1, z))) continue;
    // a notch with a block right beside it (same row) is a slot in a solid shape, not a zigzag: leave it open
    const open = (a, c) => !cells.has(dkey(a, c, z)) && !cells.has(dkey(a - 1, c + 1, z)) && !cells.has(dkey(a + 1, c - 1, z));
    if (open(u, v - 1)) halves.set(dkey(u, v - 1, z), 'lower');   // the notch above: the lower half of the diamond there
    if (open(u + 1, v)) halves.set(dkey(u + 1, v, z), 'upper');   // the notch below: the upper half
  }
  const has = (u, v, z) => cells.has(dkey(u, v, z)) || halves.has(dkey(u, v, z));
  const fill = c => chars(c || '')[0], sideFill = fill(f.side), frontFill = fill(f.front);
  const out = new Map(), order = diagOrder(new Set([...cells, ...halves.keys()]), D), owner = new Map();
  const frontEdge = new Set();   // cells showing a front edge of a farther block (a top ridge in front leaves them be)
  // a half diamond's cells, and its flat cut line (the row above a lower half, the last row of an upper half)
  const halfCells = (X, Y, kind) => { const s = new Set(); for (let r = kind === 'lower' ? b : 0; r < (kind === 'lower' ? 2 * b : b); r++) { const hw = r < b ? r : 2 * b - 1 - r; for (let x = X - 1 - hw; x <= X + hw; x++) s.add(K(x, Y + r)); } return s; };   // owner: which block drew an edge cell
  const diamond = (X, Y) => { const s = new Set(); for (let r = 0; r < 2 * b; r++) { const hw = r < b ? r : 2 * b - 1 - r; for (let x = X - 1 - hw; x <= X + hw; x++) s.add(K(x, Y + r)); } return s; };
  for (let i = 0; i < order.length;) {
    const z = order[i][2], level = [];
    while (i < order.length && order[i][2] === z) level.push(order[i++]);
    // side faces, back edges, joiners
    for (const [u, v] of level) {
      const half = halves.get(dkey(u, v, z));
      const [X0, Y0] = diagXY(u, v, b), X = X0 + z * D + OX, Y = Y0 + OY, mine = half ? halfCells(X, Y, half) : diamond(X, Y), back = new Map();
      const bset = (k, c) => { const o = back.get(k); if (c === '_' && o && o !== '_') return; back.set(k, c); };
      const ridge = new Set();   // the top point's line: it runs along the bottom of its cells, so what is above it still shows
      if (half) {   // the flat line carries on back along the depth, like the other joiners
        const row = Y + b - 1;
        if (D > 0) for (let x = X + b; x < X + b + D; x++) bset(K(x, row), '_'); else for (let x = X - b + D; x < X - b; x++) bset(K(x, row), '_');
      } else {
      const NE = has(u, v - 1, z), SE = has(u + 1, v, z), SW = has(u, v + 1, z), NW = has(u - 1, v, z), behind = has(u, v, z + 1);
      const UP = has(u - 1, v - 1, z), DN = has(u + 1, v + 1, z);   // the blocks straight above and below (their points touch ours)
      if (D > 0) {
        // a side face ends here (back edge) unless the block behind has the same face open, carrying it on
        const eNE = !NE && (!behind || has(u, v - 1, z + 1)), eSE = !SE && (!behind || has(u + 1, v, z + 1));
        for (let j = 0; j < b; j++) { if (eNE) bset(K(X + j + D, Y + j), '\\'); if (eSE) bset(K(X + b - 1 - j + D, Y + b + j), '/'); }
        if (!NE && (!NW || UP)) for (let x = X; x < X + D; x++) { bset(K(x, Y - 1), '_'); ridge.add(K(x, Y - 1)); }
        if (!SE && (!SW || DN)) for (let x = X; x < X + D; x++) bset(K(x, Y + 2 * b - 1), '_');
        if (!NE && !SE) for (let x = X + b; x < X + b + D; x++) bset(K(x, Y + b - 1), '_');   // the right point's fold
      } else {
        const eNW = !NW && (!behind || has(u - 1, v, z + 1)), eSW = !SW && (!behind || has(u, v + 1, z + 1));
        for (let j = 0; j < b; j++) { if (eNW) bset(K(X - b + j + D, Y + b - 1 - j), '/'); if (eSW) bset(K(X - 1 - j + D, Y + 2 * b - 1 - j), '\\'); }
        if (!NW && (!NE || UP)) for (let x = X + D; x < X; x++) { bset(K(x, Y - 1), '_'); ridge.add(K(x, Y - 1)); }
        if (!SW && (!SE || DN)) for (let x = X + D; x < X; x++) bset(K(x, Y + 2 * b - 1), '_');
        if (!NW && !SW) for (let x = X - b + D; x < X - b; x++) bset(K(x, Y + b - 1), '_');   // the left point's fold
      }
      }
      for (const k of mine) {
        const [x, y] = unK(k);
        for (let t = 1; t <= n; t++) {
          const s2 = K(x + Math.sign(D) * t, y);
          if (mine.has(s2)) continue;
          // edges of the blocks stacked right behind this one are the same edges carrying on: keep them
          const ow = owner.get(s2);
          if (ow && ow[0] === u && ow[1] === v && ow[2] > z) continue;
          if (sideFill && sideFill !== ' ') out.set(s2, sideFill); else if (B.solid) out.set(s2, SOLID); else out.delete(s2);
          owner.delete(s2); frontEdge.delete(s2);
        }
      }
      for (const [k, c] of back) {
        if (c === '_' && ridge.has(k) && frontEdge.has(k)) continue;   // a farther block's edge above the ridge line stays
        out.set(k, c); owner.set(k, [u, v, z]); frontEdge.delete(k);
      }
    }
    // this level's fronts: the faces, then their edges (edges shared with a neighbor on the same level merge away)
    const edges = new Map();
    for (const [u, v] of level) {
      if (has(u, v, z - 1)) continue;   // a block right in front of it hides this front completely
      const [X0, Y0] = diagXY(u, v, b), X = X0 + z * D + OX, Y = Y0 + OY, half = halves.get(dkey(u, v, z));
      if (half) {
        for (const k of halfCells(X, Y, half)) { frontEdge.delete(k); if (frontFill && frontFill !== ' ') out.set(k, frontFill); else if (B.solid) out.set(k, SOLID); else out.delete(k); }
        for (let x = X - b; x < X + b; x++) edges.set(K(x, Y + b - 1), '_');
        continue;
      }
      for (const k of diamond(X, Y)) { frontEdge.delete(k); if (frontFill && frontFill !== ' ') out.set(k, frontFill); else if (B.solid) out.set(k, SOLID); else out.delete(k); }
      const NE = has(u, v - 1, z), SE = has(u + 1, v, z), SW = has(u, v + 1, z), NW = has(u - 1, v, z);
      for (let j = 0; j < b; j++) {
        if (!NW) edges.set(K(X - b + j, Y + b - 1 - j), '/');
        if (!NE) edges.set(K(X + j, Y + j), '\\');
        if (!SE) edges.set(K(X + b - 1 - j, Y + b + j), '/');
        if (!SW) edges.set(K(X - 1 - j, Y + 2 * b - 1 - j), '\\');
      }
    }
    for (const [k, c] of edges) { out.set(k, c); if (c !== '_') frontEdge.add(k); }
  }
  return out;
}
// The diagonal blocks in the editor: shaded 3D diamonds, deepest level first; levels other than the one you are
// painting on are dimmer.
function drawDiagBlocks(ctx, C, px, py) {
  const OX = S.blocks.ox || 0, OY = S.blocks.oy || 0, B = S.blocks, b = Math.max(1, B.size || 2), D = (B.depth || 1) * (B.dir < 0 ? -1 : 1), cur = B.level || 0;
  const cells = new Set([...B.dcells].map(k => dkey(...dparse(k))));
  const has = (u, v, z) => cells.has(dkey(u, v, z));
  const halves = new Map();
  if (B.flat !== false) for (const k of cells) {
    const [u, v, z] = dparse(k);
    if (!cells.has(dkey(u + 1, v - 1, z))) continue;
    // a notch with a block right beside it (same row) is a slot in a solid shape, not a zigzag: leave it open
    const open = (a, c) => !cells.has(dkey(a, c, z)) && !cells.has(dkey(a - 1, c + 1, z)) && !cells.has(dkey(a + 1, c - 1, z));
    if (open(u, v - 1)) halves.set(dkey(u, v - 1, z), 'lower');
    if (open(u + 1, v)) halves.set(dkey(u + 1, v, z), 'upper');
  }
  const order = diagOrder(cells, D);
  const poly = (P, alpha) => {
    ctx.beginPath(); P.forEach(([x, y], i) => i ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y))); ctx.closePath();
    ctx.globalAlpha = alpha; ctx.fillStyle = C.accent; ctx.fill(); ctx.globalAlpha = Math.min(0.85, alpha + 0.35); ctx.strokeStyle = C['c-ink']; ctx.lineWidth = 1; ctx.stroke();
  };
  for (let i = 0; i < order.length;) {
    const z = order[i][2], level = [];
    while (i < order.length && order[i][2] === z) level.push(order[i++]);
    const dim = 1;   // all levels alike: depth is edited in 3D now
    for (const [u, v] of level) {
      const [X0, Y0] = diagXY(u, v, b), X = X0 + z * D + OX, Y = Y0 + OY, T = [X, Y], R = [X + b, Y + b], Bt = [X, Y + 2 * b], Lf = [X - b, Y + b], sh = ([x, y]) => [x + D, y];
      if (D > 0) { if (!has(u, v - 1, z)) poly([T, R, sh(R), sh(T)], 0.7 * dim); if (!has(u + 1, v, z)) poly([R, Bt, sh(Bt), sh(R)], 0.25 * dim); }
      else { if (!has(u - 1, v, z)) poly([Lf, T, sh(T), sh(Lf)], 0.7 * dim); if (!has(u, v + 1, z)) poly([Bt, Lf, sh(Lf), sh(Bt)], 0.25 * dim); }
    }
    for (const [u, v] of level) { const [X0, Y0] = diagXY(u, v, b), X = X0 + z * D + OX, Y = Y0 + OY; poly([[X, Y], [X + b, Y + b], [X, Y + 2 * b], [X - b, Y + b]], 0.5 * dim); }
    for (const [hk, kind] of halves) {   // the notches flattening fills
      const [u, v, hz] = dparse(hk); if (hz !== z) continue;
      const [X0, Y0] = diagXY(u, v, b), X = X0 + z * D + OX, Y = Y0 + OY;
      poly(kind === 'lower' ? [[X - b, Y + b], [X + b, Y + b], [X, Y + 2 * b]] : [[X - b, Y + b], [X, Y], [X + b, Y + b]], 0.5 * dim);
    }
  }
  ctx.globalAlpha = 1;
}
// the bake, remembered until the blocks or their settings change (the canvas redraws on every hover)
let preBakeMemo = { key: '', cells: new Map() };
function preBake() {
  if (cam.open && preBakeMemo.cells) return preBakeMemo.cells;   // behind the 3D window: catch up when it closes
  const B = S.blocks, key = [...B.dcells].join(';') + '|' + JSON.stringify([B.size, B.depth, B.dir, B.fill, B.solid, B.seams, B.flat, B.ox, B.oy]);
  if (key !== preBakeMemo.key) preBakeMemo = { key, cells: bakeCells() };
  return preBakeMemo.cells;
}
function bakeCells(B = S.blocks) {
  if (B.view === 'diag') return diagBake(B);
  const out = blockOutlineMap(B), cells = new Map(out), f = B.fill || {};
  for (const [k, face] of blockFaceMap(B)) {
    if (out.has(k)) continue;
    const c = chars(f[face] || '')[0];
    if (c && c !== ' ') cells.set(k, c); else if (B.solid) cells.set(k, SOLID);
  }
  return cells;
}
// A small sample shape (2 x 2 blocks, sizes capped) baked with the current settings, as text for the preview.
function blockPreview() {
  const B = { ...S.blocks, w: Math.min(S.blocks.w, 5), h: Math.min(S.blocks.h, 3), depth: Math.min(S.blocks.depth, S.blocks.view === 'diag' ? 6 : 3), size: Math.min(S.blocks.size, 3),
    cells: new Set(['0,1', '1,1', '0,2', '1,2']), dcells: new Set(['0,0,0', '1,0,0', '2,0,0', '2,1,0']) };
  const m = bakeCells(B), keys = [...m.keys()].map(unK);
  const x0 = Math.min(...keys.map(k => k[0])), x1 = Math.max(...keys.map(k => k[0])), y0 = Math.min(...keys.map(k => k[1])), y1 = Math.max(...keys.map(k => k[1]));
  const rows = [];
  for (let y = y0; y <= y1; y++) { let r = ''; for (let x = x0; x <= x1; x++) { const c = m.get(K(x, y)); r += c === SOLID ? '·' : (c || ' '); } rows.push(r); }
  return rows.join('\n');
}
// The three faces of a block, as polygons in character-cell units (top / side only where no neighbor covers them).
function blockFaces(bx, by, B = S.blocks) {
  const x0 = bx * B.w, y0 = by * B.h, x1 = x0 + B.w, y1 = y0 + B.h, D = B.depth;
  const f = { front: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]] };
  if (!B.cells.has(blockKey(bx, by - 1))) f.top = [[x0, y0], [x1, y0], [x1 + D, y0 - D], [x0 + D, y0 - D]];
  if (!B.cells.has(blockKey(bx + 1, by))) f.side = [[x1, y0], [x1 + D, y0 - D], [x1 + D, y1 - D], [x1, y1]];
  return f;
}
// Painter's order: the tops and sides first (lower rows first), then all the fronts, which are nearest.
function blockOrder(B = S.blocks) {
  return [...B.cells].map(k => k.split(',').map(Number)).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
}
const inPoly = (P, x, y) => {
  let ins = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++)
    if ((P[i][1] > y) !== (P[j][1] > y) && x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) ins = !ins;
  return ins;
};
// Which face shows in each character cell: key -> 'front' | 'top' | 'side'.
function blockFaceMap(B = S.blocks) {
  const map = new Map(), order = blockOrder(B);
  const paint = (P, face) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of P) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++)
      if (inPoly(P, x + 0.5, y + 0.5)) map.set(K(x, y), face);
  };
  for (const [bx, by] of order) { const f = blockFaces(bx, by, B); if (f.top) paint(f.top, 'top'); if (f.side) paint(f.side, 'side'); }
  for (const [bx, by] of order) paint(blockFaces(bx, by, B).front, 'front');
  return map;
}
// Outline bake: the edges of the whole block shape, the classic 3D-font look. Horizontal edges are '_' on the line
// above them, vertical edges '|', depth edges '/'. Edges two blocks share are left out (a row of blocks reads as one
// piece), and blocks are drawn back to front, each clearing what it hides first.
function blockOutlineMap(B = S.blocks) {
  const w = B.w, h = B.h, D = B.depth, has = (x, y) => B.cells.has(blockKey(x, y)), m = new Map();
  // '_' and '.' (weak) never cover another edge character
  const put = (x, y, c) => { const k = K(x, y), o = m.get(k); if ((c === '_' || c === '.') && o && o !== '_' && o !== '.') return; m.set(k, c); };
  const clear = (x, y) => m.delete(K(x, y));
  const diag = (x, y, s) => { for (let k = 0; k < D; k++) put(x + k + s, y - 1 - k, '/'); };
  for (const [bx, by] of blockOrder(B)) {
    const x0 = bx * w, y0 = by * h, x1 = x0 + w, y1 = y0 + h;
    const top = !has(bx, by - 1), side = !has(bx + 1, by);
    // what this block hides: its front, top and side
    for (let y = y0; y < y1; y++) for (let x = x0; x <= x1; x++) clear(x, y);   // the front, its border cells too
    if (top) for (let k = 0; k < D; k++) for (let x = x0 + k + 1; x < x1 + k; x++) clear(x, y0 - 1 - k);
    if (side) for (let j = 1; j < D; j++) for (let y = y0 - j; y < y1 - j; y++) clear(x1 + j, y);
    // horizontal edges
    if (!has(bx, by + 1)) for (let x = x0; x < x1; x++) put(x, y1 - 1, '_');
    if (top) {
      for (let x = x0; x < x1; x++) put(x, y0 - 1, '_');                 // the front's top edge
      for (let x = x0 + D; x < x1 + D; x++) put(x, y0 - D - 1, '_');     // the top's back edge
    }
    // seams: where two blocks meet, a dotted line (: up and down, . across) instead of nothing
    if (B.seams && has(bx - 1, by)) for (let y = y0; y < y1; y++) put(x0, y, ':');
    if (B.seams && has(bx, by + 1)) for (let x = x0 + 1; x < x1; x++) put(x, y1 - 1, '.');
    // vertical edges
    if (!has(bx - 1, by)) for (let y = y0; y < y1; y++) put(x0, y, '|');
    if (side) for (let y = y0; y < y1; y++) put(x1, y, '|');
    if (side) for (let y = y0 - D; y < y1 - D; y++) put(x1 + D, y, '|');
    // depth edges
    if (top && !(has(bx - 1, by) && !has(bx - 1, by - 1))) diag(x0, y0, 0);
    if ((top || side) && !(has(bx + 1, by) && !has(bx + 1, by - 1)) && !(!top && has(bx, by - 1) && !has(bx + 1, by - 1))) diag(x1, y0, 0);
    if (side && !has(bx + 1, by + 1) && !(has(bx, by + 1) && !has(bx + 1, by + 1))) diag(x1, y1, 1);
  }
  return m;
}
// Bake: the blocks become characters on a new layer (one undo step); the blocks stay, to tweak and bake again.
function bakeBlocks() {
  if (!(S.blocks.view === 'diag' ? S.blocks.dcells : S.blocks.cells).size) return toast('No blocks to bake: build some with Edit 3D first', 'warn');
  const f = S.blocks.fill, preset = blockFillPreset(f);
  commitFloat(); pushUndo();
  const l = makeLayer('Blocks' + (preset && preset !== 'none' ? ' (' + BLOCK_FILLS[preset].name.split(' ')[0] + ')' : ''));
  const baked = bakeCells();
  for (const [k, c] of baked) l.cells.set(k, c);
  for (const m of mirrorMaps('block').slice(1)) for (const [k, c] of baked) { const [x, y] = unK(k), k2 = K(m.x(x), m.y(y)); if (!baked.has(k2)) l.cells.set(k2, m.c(c)); }   // mirror on: the mirrored blocks too
  S.layers.splice(S.active + 1, 0, l); S.active++;
  changed(true);
  toast(`Baked to a new layer, "${l.name}". The blocks are still here: tweak and bake again, or Clear them`);
}
function drawBlocks(ctx, C, px, py, inView) {
  const order = blockOrder(); if (!order.length) return;
  const poly = P => { ctx.beginPath(); P.forEach(([x, y], i) => i ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y))); ctx.closePath(); };
  const face = (P, alpha) => { poly(P); ctx.globalAlpha = alpha; ctx.fillStyle = C.accent; ctx.fill(); ctx.globalAlpha = 0.85; ctx.strokeStyle = C['c-ink']; ctx.lineWidth = 1; ctx.stroke(); };
  for (const [bx, by] of order) { const f = blockFaces(bx, by); if (f.side) face(f.side, 0.28); if (f.top) face(f.top, 0.75); }
  for (const [bx, by] of order) face(blockFaces(bx, by).front, 0.5);
  ctx.globalAlpha = 1;
}
function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const fileBase = () => ($('#docname').value.trim() || 'untitled').replace(/[\\/:*?"<>|]+/g, '-');
function saveProject() { commitFloat(); download(fileBase() + '.asxii.json', JSON.stringify(projectData(), null, 1), 'application/json'); toast('Saved ' + fileBase() + '.asxii.json'); }
function canvasText() { return blockText((x, y) => compositeAt(x, y), 0, 0, S.w, S.h); }
function codeLines() {
  const rows = [];
  for (let y = 0; y < S.h; y++) {
    let r = ''; for (let x = 0; x < S.w; x++) { const c = compositeAt(x, y); r += !c || c === SOLID ? ' ' : c; }
    rows.push("  '" + r.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "',");
  }
  return rows.join('\n');
}
function newDoc() {
  commitFloat(); pushUndo();
  S.layers = [makeLayer('Layer 1')]; S.active = 0; S.sel = null; S.cursor = null;
  S.mirrorAt = { x: null, y: null };
  $('#docname').value = 'untitled';
  changed(true); zoomFit(); toast('New canvas (Ctrl Z brings the old one back)');
}
$('#fileOpen').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    commitFloat(); pushUndo(); loadProject(d);
    if (!d.name) $('#docname').value = f.name.replace(/\.asxii\.json$|\.json$/i, '');
    changed(true); zoomFit(); toast('Opened ' + f.name);
  } catch (err) { toast('Could not open: ' + err.message); }
});
$('#fileTxt').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  floatFromText(await f.text()); toast('Imported ' + f.name + ': drag it, then Enter to drop');
});

// ---------- autosave + prefs (browser storage is a convenience only) ----------
function autosave() { try { localStorage.setItem(PROJECT_KEY, JSON.stringify(projectData())); } catch {} }
function savePrefs() {
  try {
    const tb = $('#toolbox');
    localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: S.theme, font: S.font, grid: S.grid, showSolid: S.showSolid,
      brush: S.brush, pencil: S.pencil, figfont: S.figfont, shape: S.shape, recent: S.recent, selShape: S.selShape, lastMarquee: S.lastMarquee, wandContig: S.wandContig, selSample: S.selSample, fillContig: S.fillContig, pickSample: S.pickSample, ch2: S.ch2, mirror: S.mirror, activeSlot: S.activeSlot, mirrorUse: S.mirrorUse, panels: S.panels, sideW: S.sideW, mirrorFlip: S.mirrorFlip, typeInsert: S.typeInsert, selFixed: S.selFixed, selCenter: S.selCenter, blanksBrush: S.blanksBrush, blanksFill: S.blanksFill, paint: S.paint, fillSample: S.fillSample, spacesErase: S.spacesErase, dimOthers: S.focusLayer, protectText: S.protectText, galWs: S.galWs, b3big: S.b3big, b3color: S.b3color, b3brush: S.b3shape, myShapes: S.myShapes, toolbox: tb.dataset.moved ? { l: tb.style.left, t: tb.style.top } : null }));
  } catch {}
}
function loadPrefs() { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || null; } catch { return null; } }

// ---------- commands ----------
const CMDS = {
  new: newDoc,
  open: () => $('#fileOpen').click(),
  save: saveProject,
  importTxt: () => $('#fileTxt').click(),
  gallery: () => gal.open ? closeGallery() : openGallery(),
  exportTxt: () => { commitFloat(); download(fileBase() + '.txt', canvasText() + '\n', 'text/plain'); toast('Exported ' + fileBase() + '.txt'); },
  copyMerged: () => copyMerged(),
  blocksBake: () => bakeBlocks(),
  blocks3d: () => open3d(),
  welcome: () => showWelcome(),
  fontDone: () => { endTextEdit(); renderOptions(); },
  blocksClear: () => { const set = S.blocks.dcells; if (!set.size) return; pushUndo(); set.clear(); S.blocks.placed = false; S.blocks.moved = false; changed(); toast('Blocks cleared (Ctrl Z brings them back)'); },
  copyText: async () => { commitFloat(); await writeClipboard(canvasText()); toast('Canvas copied as text'); },
  copyCode: async () => { commitFloat(); await writeClipboard(codeLines()); toast('Canvas copied as code lines'); },
  undo, redo,
  cut: () => { if (!document.execCommand('cut')) toast('Use Ctrl X'); },
  copy: () => { if (!document.execCommand('copy')) toast('Use Ctrl C'); },
  paste: async () => {
    try { const t = await navigator.clipboard.readText(); if (t) return floatFromText(t); } catch {}
    if (S.clip) floatFromText(S.clip); else toast('Use Ctrl V to paste from other apps');
  },
  delete: deleteSelection,
  selectAll, selectCanvas, deselect,
  flipH: () => flip(true), flipV: () => flip(false),
  drop: () => commitFloat(),
  fillSel: () => fillSelection(),
  makePattern: () => openPatternDialog(),
  extrude: () => openExtrude(),
  dropReplace: () => commitFloat(true),
  layerNew: () => { commitFloat(); pushUndo(); S.layers.splice(S.active + 1, 0, makeLayer('Layer ' + (S.layers.length + 1))); S.active++; changed(true); },
  layerDup: () => {
    commitFloat(); pushUndo(); const l = L(), n = makeLayer(l.name + ' copy');
    n.cells = new Map(l.cells); n.visible = l.visible; n.text = l.text ? { ...l.text } : null; S.layers.splice(S.active + 1, 0, n); S.active++; changed(true);
  },
  layerDel: () => {
    commitFloat();
    if (S.layers.length < 2) { pushUndo(); L().cells.clear(); changed(true); return toast('Cleared the last layer'); }
    pushUndo(); S.layers.splice(S.active, 1); S.active = Math.max(0, S.active - 1); changed(true);
  },
  layerUp: () => moveLayer(1), layerDown: () => moveLayer(-1),
  rasterize: () => {
    const l = L(); if (!l.text) return toast('This layer is already plain art', 'warn');
    commitFloat(); pushUndo(); if (S.textEdit === l.id) S.textEdit = null; l.text = null; l.autoName = false; changed(true); renderOptions();
    toast('Rasterized: plain art now');
  },
  protectToggle: () => { S.protectText = !S.protectText; $('#protectChk').checked = S.protectText; savePrefs(); toast(S.protectText ? 'Text layers protected' : 'Text layers editable by any tool'); },
  mergeDown: () => {
    commitFloat();
    if (S.active === 0) return toast('Nothing below to merge into', 'warn');
    pushUndo(); const top = L(), below = S.layers[S.active - 1];
    if (top.id === S.textEdit) S.textEdit = null;
    below.text = null;   // merged: plain art for good
    for (const [k, c] of top.cells) below.cells.set(k, c);
    S.layers.splice(S.active, 1); S.active--; changed(true);
  },
  flatten: () => {
    commitFloat();
    if (S.layers.length < 2) return toast('Only one layer', 'warn');
    pushUndo(); const out = makeLayer('Layer 1');
    for (const l of S.layers) if (l.visible) for (const [k, c] of l.cells) out.cells.set(k, c);
    S.layers = [out]; S.active = 0; changed(true); toast('Flattened (hidden layers were dropped)');
  },
  zoomIn: () => zoomStep(1), zoomOut: () => zoomStep(-1), zoomFit, zoom100: () => setZoom(1),
  focusToggle: () => { S.focusLayer = !S.focusLayer; $('#focusChk').checked = S.focusLayer; savePrefs(); redraw(); toast(S.focusLayer ? 'Layer focus on' : 'Layer focus off'); },
  gridToggle: () => { S.grid = !S.grid; $('#gridBtn').classList.toggle('on', S.grid); savePrefs(); redraw(); },
  solidToggle: () => { S.showSolid = !S.showSolid; $('#solidBtn').classList.toggle('on', S.showSolid); savePrefs(); redraw(); },
};
function moveLayer(dir) {
  const i = S.active, j = i + dir;
  if (j < 0 || j >= S.layers.length) return;
  commitFloat(); pushUndo();
  [S.layers[i], S.layers[j]] = [S.layers[j], S.layers[i]]; S.active = j; changed(true);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-cmd]');
  if (b) { closeMenus(); CMDS[b.dataset.cmd](); return; }
  const mb = e.target.closest('.menu-btn');
  if (mb) { const m = mb.parentElement, was = m.classList.contains('open'); closeMenus(); m.classList.toggle('open', !was); return; }
  if (!e.target.closest('.menu')) closeMenus();
});
// hovering across the menu bar while one is open switches menus
$$('.menu-btn').forEach(b => b.addEventListener('mouseenter', () => {
  if ($('.menu.open') && !b.parentElement.classList.contains('open')) { closeMenus(); b.parentElement.classList.add('open'); }
}));
function closeMenus() { $$('.menu.open').forEach(m => m.classList.remove('open')); }
// buttons don't take focus, so Enter / Space keep going to the canvas
document.addEventListener('mousedown', e => { if (!isField(e.target) && e.target.closest('.btn, .chip, .layer, .cbtn, .patitem, .pmitem')) e.preventDefault(); });   // (a text box inside a button-like pill still takes clicks)

// ---------- tools + options bar ----------
// A few basics stay in the options bar; the full set is the Characters pane on the right.
// White space: what the blank cells (spaces) in a moved block, a pattern or noise do where they land on characters.
const WS_TIP = 'White space = the blank cells (spaces) in what you are placing. Where they land on existing characters: Solid covers them, Clear lets them show through.';
const WS_SOLID = 'Solid: blank cells cover what is under them and leave it blank. What you place lands exactly as it looks.';
const WS_CLEAR = 'Clear: blank cells are see-through. Only the characters land; whatever is under the blank cells stays.';
// The Characters pane: plain ASCII first, then Unicode.
const CHAR_GROUPS = [
  ['Special', SOLID + CLEAR],   // opaque space, clear
  ['ASCII symbols', "#*.:+=-_|/\\<>()[]{}^~'\"`,;!?@$%&"],
  ['Digits', '0123456789'],
  ['Uppercase', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  ['Lowercase', 'abcdefghijklmnopqrstuvwxyz'],
  ['Blocks + shades', '░▒▓█▀▄▌▐▖▗▘▝▙▛▜▟▚▞■□▪▫▬'],
  ['Box lines', '─│┌┐└┘├┤┬┴┼╭╮╯╰╱╲╳'],
  ['Box heavy + double', '━┃┏┓┗┛┣┫┳┻╋═║╔╗╚╝╠╣╦╩╬'],
  ['Shapes', '●○◉◎◆◇◢◣◤◥▲△▼▽◀▶★☆♥♦♣♠'],
  ['Arrows', '←↑→↓↖↗↘↙↔↕⇐⇑⇒⇓'],
  ['Misc', '·•°∙…¤§¶©®™±×÷≈≠≤≥∞√∑πΩµ¬¦'],
];
function renderCharPane() {
  const box = $('#charpane');
  box.innerHTML = `<div class="cgroup">Recent</div><div class="cgrid recentrow"></div>` + CHAR_GROUPS.map(([name, set]) =>
    `<div class="cgroup">${esc(name)}</div><div class="cgrid">` +
    chars(set).map(c => c === SOLID ? `<button class="cbtn${c === S.brush.ch ? ' on' : ''}" title="Opaque space: an empty cell that covers the layers under it (copied and exported as a space)">${SOLID}</button>` :
      c === CLEAR ? `<button class="cbtn${c === S.brush.ch ? ' on' : ''}" title="Clear: erases wherever you paint it, with any tool (Fill a region, draw a Shape...)">${CLEAR}</button>` : `<button class="cbtn${c === S.brush.ch ? ' on' : ''}" title="${esc(c)}  U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}">${esc(c)}</button>`).join('') +
    `</div>`).join('');
  $$('.cbtn', box).forEach(b => {
    b.addEventListener('click', () => pickFromPane(b.textContent));
    b.addEventListener('contextmenu', e => { e.preventDefault(); pickInto(b.textContent, true); });   // right-click: the other chip
  });
  renderRecent();
}
// Opaque space and Clear have no glyph: anywhere the drawing character is shown (chip, palette, recents, the input, the
// right-button setting), a cell holding it gets the same faint red tint as on the canvas.
function markSolid() {
  for (const el of $$('#chipBox input, #charpane .cbtn, .opts .micon, #paintMenu .micon')) {
    const c = el.tagName === 'INPUT' ? el.value : el.textContent;
    el.classList.toggle('solidch', c === SOLID); el.classList.toggle('clearch', c === CLEAR);
  }
}
// Clicking a character in the pane: type it (Type tool), or make it the character to draw with. The tool stays the same.
function pickFromPane(c) {
  if (S.tool === 'type' && S.cursor) { typeChar(c); return; }
  pickInto(c);   // the selected chip
}
// Help panel (TOOLBAR.md 3): per tool, a summary and one key per line. keys: [keys, what] (the keys are words separated
// by spaces; Shift, Alt, Ctrl and Space light up while held). drag: the keys that matter while dragging.
const HELP = {
  select: { sum: 'Drag to select. Press inside the selection to move just its outline.',
    keys: [['Shift', 'add to the selection'], ['Alt', 'take away'], ['Shift Alt', 'keep only the overlap'], ['Ctrl', 'drag the content'], ['Ctrl Alt', 'drag a copy of it'], ['Arrows', 'move the outline (Ctrl: the content)'], ['Esc', 'deselect']],
    drag: [['Shift', 'square / circle'], ['Alt', 'from the center'], ['Space', 'move the box']] },
  lasso: { sum: 'Drag around what you want; let go to close it.', keys: 'select', drag: [] },
  polygon: { sum: 'Click the corners. Click the first point, double-click or press Enter to close.',
    keys: [['Shift', 'add to the selection'], ['Alt', 'take away'], ['Shift Alt', 'keep only the overlap'], ['Backspace', 'take back a point'], ['Esc', 'cancel']] },
  wand: { sum: 'Click a character to select it: the connected ones, or every one with Contiguous off.',
    keys: [['Shift', 'add to the selection'], ['Alt', 'take away'], ['Shift Alt', 'keep only the overlap'], ['Drag', 'inside the selection: move its outline']] },
  move: { sum: 'Drag to move the selection, or the whole layer when nothing is selected.',
    keys: [['Alt', 'drag a copy'], ['Shift', 'lock to one direction'], ['Ctrl', 'click: pick the layer under the pointer'], ['Arrows', 'nudge (Shift: 5)'], ['Enter', 'drop it (Shift Enter: solid)'], ['Esc', 'put it back']],
    drag: [['Shift', 'lock to one direction']] },
  type: { sum: 'Click a cell and type.',
    keys: [['Enter', 'next line'], ['Arrows', 'move the caret'], ['Backspace', 'delete back'], ['Insert', 'Overwrite / Insert'], ['Esc', 'stop typing']] },
  font: { sum: 'Click to start text in the font, or click text to edit it. Drag text to move it.',
    keys: [['Enter', 'new line'], ['Arrows', 'move the text'], ['Esc', 'done']] },
  pencil: { sum: 'Draw with the Draw character, or Smart: a line that picks its own characters.',
    keys: [['Shift', 'click: a straight line from the last stroke'], ['Alt', 'click: pick a character'], ['Right', 'paint the Right character'], ['S', 'Character / Smart'], ['[ ]', 'size'], ['X', 'swap Draw and Right']] },
  brush: { sum: 'Paint with the Paint panel\'s setting. Taper and Outline strokes land when you let go.',
    keys: [['Shift', 'click: a straight line from the last stroke'], ['Alt', 'click: pick a character'], ['Right', 'paint the Right character'], ['[ ]', 'size'], ['X', 'swap Draw and Right']] },
  eraser: { sum: 'Drag to erase on the active layer.',
    keys: [['Shift', 'click: a straight line from the last stroke'], ['Right', 'erase only the Draw character'], ['[ ]', 'size']] },
  shape: { sum: 'Drag to draw the shape. Polygon: click the corners.',
    keys: [['Enter', 'Polygon: finish it open'], ['Backspace', 'Polygon: take back a point'], ['Esc', 'Polygon: cancel']],
    drag: [['Shift', 'square / circle / straight'], ['Alt', 'from the center'], ['Space', 'move it']] },
  block: { sum: 'Drag the ASCII preview to move the blocks (before baking). Double-click to build them in 3D (or Layer › Edit blocks in 3D); Layer › Bake makes them ASCII on a new layer.', keys: [] },
  fill: { sum: 'Click to fill the connected area of the same character, with the Paint panel\'s setting.',
    keys: [['Shift', 'click: every matching cell (the opposite of Contiguous)'], ['Alt', 'click: pick a character']] },
  picker: { sum: 'Click a character to put it in the selected chip (tool panel). An empty cell picks Clear (it erases).', keys: [['Shift', 'click: the other chip'], ['Right', 'the other chip']] },
  hand: { sum: 'Drag to pan.', keys: [] },
  zoom: { sum: 'Click to zoom in.', keys: [['Alt', 'click: zoom out'], ['Ctrl 0', 'fit the canvas']] },
};
const HELP_ANY = [['Space', 'drag: pan'], ['Ctrl Wheel', 'zoom'], ['Shift Wheel', 'scroll sideways'], ['Tool_key', 'hold it: use that tool for a moment']];
function setTool(t) {
  if (t === S.tool) return;
  if (t !== 'move' && t !== 'hand') commitFloat();
  S.tool = t;
  if (t === 'pencil' || t === 'brush') S.lastDraw = t;
  closeBrushMenu(); closeBrushPop(); closeSetPop(); closeBlockPop(); closeFontMenu(); closeGallery(); if (extrude.open) closeExtrude();
  if (S.textEdit) endTextEdit();
  if (S.poly) S.poly = null;
  if (S.selPoly) S.selPoly = null;
  if (t === 'type' && !S.cursor) {
    const b = S.sel ? selNextRow(-Infinity) : S.hover || { x: 0, y: 0 };
    S.cursor = { x: b.x, y: b.y, lineX: b.x };
  }
  syncToolbox();
  vp.className = 't-' + t;
  renderOptions(); updateInfo(); redraw();
  if (t === 'block' && !S.blocks.dcells.size) open3d();   // nothing to show yet: start in the 3D editor
}
function setBrushChar(c) {
  c = chars(c).pop(); if (!c || c === ' ') return;
  S.brush.ch = c;
  $$('#charpane .cbtn').forEach(b => b.classList.toggle('on', b.textContent === c));
  renderSlots(); savePrefs(); redraw();
}
function setBrushSize(n) {
  const ts = toolSize();
  ts.size = clamp(n, 1, 25);
  const s = $('.opts .size'); if (s) s.value = ts.size;
  savePrefs(); redraw();
}
// Recent: the top group of Characters, one row (as many as fit)
function renderRecent() {
  const box = $('#charpane .recentrow'); if (!box) return;
  box.innerHTML = S.recent.map(c => `<button class="cbtn${c === S.brush.ch ? ' on' : ''}" title="${c === SOLID ? 'Opaque space' : c === CLEAR ? 'Clear' : esc(c)}">${esc(c)}</button>`).join('');
  $$('.cbtn', box).forEach(b => {
    b.addEventListener('click', () => pickFromPane(b.textContent));
    b.addEventListener('contextmenu', e => { e.preventDefault(); pickInto(b.textContent, true); });
  });
  markSolid();
}
// ---------- brush library: presets + your own (saved in the browser), a picker, and the customizer ----------
// The settings a brush carries (Size is not one of them: it is the max width, set in the bar).
const BRUSH_KEYS = ['start', 'end', 'ramp', 'minSize', 'tip', 'mode', 'edge', 'inside'];
const BRUSH_BASE = { start: 'none', end: 'none', ramp: 6, minSize: 1, tip: 'round', mode: 'fill', edge: 'smart', inside: 'solid', edgeCh: '#' };   // edgeCh: Outline Character's character
const BRUSHES = {
  'Plain':      { ...BRUSH_BASE, tip: 'square' },
  'Taper':      { ...BRUSH_BASE, start: 'linear', end: 'linear', ramp: 8 },
  'Soft taper': { ...BRUSH_BASE, start: 'out', end: 'out', ramp: 10 },
  'Taper in':   { ...BRUSH_BASE, start: 'linear', ramp: 10 },
  'Taper out':  { ...BRUSH_BASE, end: 'linear', ramp: 10 },
  'Point':      { ...BRUSH_BASE, start: 'in', end: 'in', ramp: 14 },
  'Outline':    { ...BRUSH_BASE, mode: 'outline' },
  'Outline taper': { ...BRUSH_BASE, start: 'out', end: 'out', ramp: 10, mode: 'outline' },
};
const BRUSHES_KEY = 'asxii.brushes';
const CURVES = { none: 'None (full size)', linear: 'Linear', in: 'Ease in (slow start)', out: 'Ease out (fast start)' };
// little curve icons: width (up) against distance from the end (right)
const CURVE_ICON = {
  none:   '<svg viewBox="0 0 24 14"><path d="M2 3H22"/></svg>',
  linear: '<svg viewBox="0 0 24 14"><path d="M2 12L22 3"/></svg>',
  in:     '<svg viewBox="0 0 24 14"><path d="M2 12C12 12 18 9 22 3"/></svg>',
  out:    '<svg viewBox="0 0 24 14"><path d="M2 12C5 5 12 3 22 3"/></svg>',
};
function loadCustomBrushes() {
  try {
    const a = JSON.parse(localStorage.getItem(BRUSHES_KEY));
    if (Array.isArray(a)) S.brushes = a.filter(x => x && typeof x.name === 'string').map(x => ({ name: x.name, ...cleanBrush(x) }));
  } catch {}
}
function saveCustomBrushes() { try { localStorage.setItem(BRUSHES_KEY, JSON.stringify(S.brushes)); } catch {} }
function cleanBrush(x) {
  const c = { ...BRUSH_BASE };
  if (CURVES[x.start]) c.start = x.start;
  if (CURVES[x.end]) c.end = x.end;
  c.ramp = clamp(Math.round(+x.ramp) || 6, 1, 30);
  c.minSize = clamp(Math.round(+x.minSize) || 1, 1, 25);
  if (x.tip === 'square') c.tip = 'square';
  if (x.mode === 'outline') c.mode = 'outline';
  if (['box', 'block', 'none', 'char'].includes(x.edge)) c.edge = x.edge;
  if (x.edge === 'paint') c.edge = 'char';   // the old Outline Paint
  { const e = chars(x.edgeCh || '')[0]; if (e && e !== ' ') c.edgeCh = e; }
  if (x.inside === 'clear' || x.inside === 'paint') c.inside = x.inside;
  return c;
}
const allBrushes = () => [...Object.keys(BRUSHES).map(n => ({ name: n, ...BRUSHES[n], custom: false })), ...S.brushes.map(b => ({ ...b, custom: true }))];
const brushByName = n => allBrushes().find(b => b.name === n);
// edited = the live settings differ from the brush they started from
const brushEdited = () => { const p = brushByName(S.brush.preset); return !p || BRUSH_KEYS.some(k => p[k] !== S.brush[k]); };
function setBrushPreset(name) {
  const p = brushByName(name); if (!p) return;
  for (const k of BRUSH_KEYS) S.brush[k] = p[k];
  S.brush.preset = name;
  savePrefs(); renderOptions(); refreshBrushPop(); redraw();
}
// A small sample stroke drawn with a brush, as text (thumbnails, previews).
// h rows tall; the ramp is scaled to the thumbnail's length (a real stroke is longer), so each brush's shape reads.
function brushThumb(b, w = 26, size = 13, h = 5) {
  const bb = { ...b, size, ramp: clamp(Math.round((b.ramp || 6) * w / 18), 1, Math.floor(w / 2)) }, pts = [];
  // inset each end by its half-width, so full-size (un-tapered) ends and their caps fit inside the thumbnail
  const inset = c => (c && c !== 'none' ? Math.min(bb.minSize || 1, size) : size) / 2 + 0.5;
  const x0 = Math.min(inset(bb.start), w / 2 - 1), x1 = Math.max(w - inset(bb.end), w / 2 + 1);
  for (let x = x0; x <= x1; x += 0.5) pts.push({ x, y: h / 2 });
  const st = strokeCells(pts, bb), rows = [];
  for (let y = 0; y < h; y++) {
    let r = '';
    for (let x = 0; x < w; x++) {
      const k = K(x, y);
      r += st.outline ? (st.outline.get(k) || (bb.inside === 'paint' && st.region.has(k) ? '#' : ' ')) : (st.region.has(k) ? '#' : ' ');
    }
    rows.push(r);
  }
  return rows.join('\n');
}
// The bar: Brush ▾ (thumbnail + name) and ⚙ (the customizer).
function brushStrokeOptions(add) {
  add(`<span class="label">Brush</span><button class="btn dd brushbtn" title="Choose a brush"><span class="pname">${esc(S.brush.preset)}${brushEdited() ? ' •' : ''}</span><span class="caret">▾</span></button>` +
    `<button class="btn icon brushgear" title="Customize the brush: tapered ends, ramp length, min width, tip, fill or outline, and save your own"><span class="gear">⚙</span></button><span class="sep"></span>`);
}
// Paint: Ramp (Advanced brush): characters that change along the stroke, from the first one at each end to the last in
// the middle, over the Ramp length. Elsewhere (Fill, Shape) it paints with the last one.
// Ramp presets, light to dense (from the end of the stroke to the middle).
const RAMPS = {
  'Classic': '.:-=+*#%@',
  'Bubbles': '.,:oO',
  'Round': '.oO0@',
  'Dots': '.·:•●',
  'Shade': '░▒▓█',
  'Blocks': '▁▂▃▄▅▆▇█',
  'Stars': '.+*✦★',
  'Lines': '_-=≡',
  'Fine': ".'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
};
const RAMPS_KEY = 'asxii.ramps';
function loadCustomRamps() {
  try { const a = JSON.parse(localStorage.getItem(RAMPS_KEY)); if (Array.isArray(a)) S.ramps = a.filter(r => r && typeof r.name === 'string' && typeof r.set === 'string' && r.set.trim()); } catch {}
}
function saveCustomRamps() { try { localStorage.setItem(RAMPS_KEY, JSON.stringify(S.ramps)); } catch {} }
const allRamps = () => [...Object.keys(RAMPS).map(n => ({ name: n, set: RAMPS[n], custom: false })), ...S.ramps.map(r => ({ ...r, custom: true }))];
// The ramp up and back down, as a stroke would draw it (squeezed to about n characters for long ramps).
function rampMirror(set, n = 17) {
  let c = chars(set).filter(x => x !== ' ');
  if (!c.length) return '';
  const half = Math.max(2, Math.ceil(n / 2));
  if (c.length > half) c = Array.from({ length: half }, (_, i) => c[Math.round(i * (c.length - 1) / (half - 1))]);
  return c.join('') + c.slice(0, -1).reverse().join('');
}
function setRamp(name, set) { S.paint.ramp = { name, set }; S.paint.mode = 'ramp'; savePrefs(); renderOptions(); redraw(); }
function openRampMenu(btn) {
  const m = $('#rampMenu');
  if (!m.hidden) return closeRampMenu();
  const cur = S.paint.ramp.name;
  m.innerHTML = allRamps().map(r =>
    `<div class="patitem${r.name === cur ? ' on' : ''}${r.custom ? ' custom' : ''}" data-name="${esc(r.name)}">` +
    `<span class="micon ramppv">${esc(rampMirror(r.set))}</span><span class="pname">${esc(r.name)}</span>` +
    (r.custom ? `<span class="ptag">custom</span><button class="btn pdel" title="Delete this ramp">×</button>` : '') + `</div>`).join('') +
    `<div class="patnote">Light to dense, from the end of the stroke to the middle. Make your own: <b>Customize</b> a ramp, then <b>Save as new ramp</b>.</div>`;
  placeUnder(m, btn, 340);
  $$('.patitem', m).forEach(el => el.addEventListener('click', e => {
    const r = allRamps().find(q => q.name === el.dataset.name); if (!r) return;
    if (e.target.classList.contains('pdel')) {
      S.ramps = S.ramps.filter(q => q.name !== r.name); saveCustomRamps(); toast(`Deleted ramp "${r.name}"`);
      if (S.paint.ramp.name === r.name) S.paint.ramp = { name: 'Classic', set: RAMPS.Classic };
      closeRampMenu(); renderOptions(); openRampMenu($('.opts .rampbtn'));
      return;
    }
    setRamp(r.name, r.set); closeRampMenu();
  }));
}
function closeRampMenu() { const m = $('#rampMenu'); if (m) m.hidden = true; }
function rampChar(s, total) {
  const set = chars(S.paint.ramp.set).filter(c => c !== ' ');
  if (!set.length) return S.brush.ch;
  const f = s.fr !== undefined ? s.fr : clamp(Math.min(s.d, total - s.d) / Math.max(1, S.brush.ramp || 6), 0, 1);
  return set[Math.round(f * (set.length - 1))];
}
function bindBrushStrokeOptions(o) {
  const bb = $('.brushbtn', o); if (bb) bb.addEventListener('click', () => openBrushMenu(bb));
  const bg = $('.brushgear', o); if (bg) bg.addEventListener('click', () => openBrushPop(bg));
}
// The brush list (like the pattern list): presets, then your own.
function openBrushMenu(btn) {
  const m = $('#brushMenu');
  if (!m.hidden) return closeBrushMenu();
  closeBrushPop();
  m.innerHTML = allBrushes().map(b =>
    `<div class="patitem${b.name === S.brush.preset ? ' on' : ''}${b.custom ? ' custom' : ''}" data-name="${esc(b.name)}">` +
    `<pre class="thumb">${esc(brushThumb(b))}</pre><span class="pname">${esc(b.name)}</span>` +
    (b.custom ? `<span class="ptag">custom</span><button class="btn pdel" title="Delete this brush">×</button>` : '') + `</div>`).join('') +
    `<div class="patnote">Make your own: <b>Customize</b> a brush, then <b>Save as new brush</b>.</div>`;
  placeUnder(m, btn, 320);
  $$('.patitem', m).forEach(el => el.addEventListener('click', e => {
    const name = el.dataset.name;
    if (e.target.classList.contains('pdel')) {
      S.brushes = S.brushes.filter(b => b.name !== name); saveCustomBrushes();
      toast(`Deleted brush "${name}"`);
      if (S.brush.preset === name) S.brush.preset = 'Plain';
      closeBrushMenu(); renderOptions(); openBrushMenu($('.opts .brushbtn'));
      return;
    }
    setBrushPreset(name); closeBrushMenu();
  }));
}
function closeBrushMenu() { const m = $('#brushMenu'); if (m) m.hidden = true; }
function placeUnder(m, btn, width) {
  const r = btn.getBoundingClientRect();
  m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8)) + 'px';
  m.style.top = (r.bottom + 6) + 'px';
  m.hidden = false;
}
// The customizer: everything about the current brush in one compact popover.
function openBrushPop(btn) {
  const p = $('#brushPop');
  if (!p.hidden) return closeBrushPop();
  closeBrushMenu();
  refreshBrushPop(true);
  placeUnder(p, btn, 440);
}
function closeBrushPop() { const p = $('#brushPop'); if (p) p.hidden = true; }
function refreshBrushPop(force) {
  const p = $('#brushPop'); if (!p || (p.hidden && !force)) return;
  const b = S.brush;
  const curveRow = (key, label) => `<div class="bp-row"><span class="bp-label">${label}</span><span class="seg curves">` +
    Object.keys(CURVES).map(c => `<button class="btn${b[key] === c ? ' on' : ''}" data-bkey="${key}" data-bval="${c}" title="${CURVES[c]}">${CURVE_ICON[c]}</button>`).join('') + `</span></div>`;
  const seg = (key, v, label, title) => `<button class="btn${b[key] === v ? ' on' : ''}" data-bkey="${key}" data-bval="${v}" title="${title}">${label}</button>`;
  const fseg = (v, label, title) => `<button class="btn${fillOf(b) === v ? ' on' : ''}" data-bfill="${v}" title="${title}">${label}</button>`;
  const oseg = (v, label, title) => `<button class="btn${outlineOf(b) === v ? ' on' : ''}" data-boutline="${v}" title="${title}">${label}</button>`;
  p.innerHTML =
    `<div class="bp-head"><span class="bp-title">${esc(b.preset)}${brushEdited() ? ' <span class="bp-edited">edited</span>' : ''}</span>` +
    (brushEdited() && brushByName(b.preset) ? `<button class="btn small bp-reset" title="Back to the saved brush">Reset</button>` : '') + `</div>` +
    `<pre class="bp-preview">${esc(brushThumb(b, 34, 15, 7))}</pre>` +
    curveRow('start', 'Start') + curveRow('end', 'End') +
    `<div class="bp-row"><span class="bp-label">Ramp length</span><input class="bramp" type="range" min="1" max="30" value="${b.ramp}" title="How many cells each end takes to grow to full size (and to step through Ramp characters)"><span class="rampv">${b.ramp}</span></div>` +
    `<div class="bp-row"><span class="bp-label">Min width</span><button class="btn icon" data-bmin="-1">−</button><span class="bminv">${b.minSize}</span><button class="btn icon" data-bmin="1">+</button><span class="bp-note">Size (in the bar) is the max</span></div>` +
    `<div class="bp-row"><span class="bp-label">Tip</span><span class="seg">${seg('tip', 'round', 'Round', 'Round tip')}${seg('tip', 'square', 'Square', 'Square tip')}</span></div>` +
    // Fill (inside) and Outline (edge). Stored as before: Fill Paint + Outline None is a plain stroke (mode fill);
    // anything else is mode outline with edge = Outline and inside = Fill.
    `<div class="bp-row"><span class="bp-label" title="What goes inside the stroke">Fill</span><span class="seg">${fseg('paint', 'Paint', 'Paint the stroke with the Paint setting (character, noise, pattern or ramp)')}${fseg('solid', 'Solid', 'Wipe the inside blank (on this layer)')}${fseg('clear', 'Clear', 'Leave the inside alone: what is there shows through')}</span></div>` +
    `<div class="bp-row"><span class="bp-label" title="What goes on the edge of the stroke">Outline</span><span class="seg">${oseg('none', 'None', 'No outline')}${oseg('smart', 'Smart', 'Edge characters that follow the shape: - _ | / \\')}${oseg('box', 'Box', 'Connected box lines around the shape, joining box lines already there')}${oseg('block', 'Block', 'Block characters along the edge')}${outlineOf(b) === 'char' ? `<span class="btn on charpill" title="The edge in one character of its own: type it in the box">Character <input class="bedgech" type="text" maxlength="2" value="${esc(b.edgeCh || '#')}" title="The outline's character"></span>` : oseg('char', 'Character', 'The edge in one character of its own (type it in the box)')}</span></div>` +
    (fillOf(b) === 'clear' && outlineOf(b) === 'none' ? `<div class="bp-row"><span class="bp-label"></span><span class="bp-note warnnote">Fill Clear with no outline draws nothing</span></div>` : '') +
    `<div class="bp-save"><input class="bp-name" type="text" maxlength="40" placeholder="New brush name" spellcheck="false"><button class="btn primary bp-savebtn">Save as new brush</button></div>`;
  $$('[data-bkey]', p).forEach(el => el.addEventListener('click', () => { S.brush[el.dataset.bkey] = el.dataset.bval; brushChanged(); }));
  $$('[data-bfill]', p).forEach(el => el.addEventListener('click', () => { setFillOutline(S.brush, el.dataset.bfill, outlineOf(S.brush)); brushChanged(); }));
  const focusEdgeCh = () => { const i = $('#brushPop .bedgech'); if (i) { i.focus(); i.select(); } };   // ready to type the outline's character
  $$('[data-boutline]', p).forEach(el => el.addEventListener('click', () => { setFillOutline(S.brush, fillOf(S.brush), el.dataset.boutline); brushChanged(); if (el.dataset.boutline === 'char') focusEdgeCh(); }));
  const pill = $('.charpill', p); if (pill) pill.addEventListener('click', focusEdgeCh);
  $$('[data-bmin]', p).forEach(el => el.addEventListener('click', () => { S.brush.minSize = clamp(S.brush.minSize + +el.dataset.bmin, 1, 25); brushChanged(); }));
  const ec = $('.bedgech', p);
  if (ec) ec.addEventListener('input', () => {   // typing a character: keep the popover (and the focus) as it is
    const c = chars(ec.value).pop(); if (!c || c === ' ') return;
    S.brush.edgeCh = c; ec.value = c; ec.select();
    $('.bp-preview', p).textContent = brushThumb(S.brush, 34, 15, 7); savePrefs(); renderOptions(); redraw();
  });
  const rp = $('.bramp', p);
  rp.addEventListener('input', () => { S.brush.ramp = +rp.value; $('.rampv', p).textContent = rp.value; $('.bp-preview', p).textContent = brushThumb(S.brush, 34, 15, 7); savePrefs(); });
  rp.addEventListener('change', () => brushChanged());
  const rs = $('.bp-reset', p); if (rs) rs.addEventListener('click', () => setBrushPreset(S.brush.preset));
  const save = () => {
    let name = $('.bp-name', p).value.trim();
    if (!name) { $('.bp-name', p).focus(); return toast('Give the brush a name', 'warn'); }
    const base = name; let n = 2;
    while (brushByName(name)) name = base + ' ' + n++;
    const nb = { name }; for (const k of BRUSH_KEYS) nb[k] = S.brush[k];
    S.brushes.push(nb); saveCustomBrushes();
    S.brush.preset = name; savePrefs();
    toast(`Saved brush "${name}"`);
    renderOptions(); refreshBrushPop(true);
  };
  $('.bp-savebtn', p).addEventListener('click', save);
  $('.bp-name', p).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); save(); } });
}
// a brush's Fill (paint / solid / clear) and Outline (none / smart / box / block / paint), from mode, inside and edge
const fillOf = b => b.mode === 'outline' ? (b.inside || 'solid') : 'paint';
const outlineOf = b => b.mode === 'outline' ? (b.edge || 'smart') : 'none';
function setFillOutline(b, fill, outline) {
  if (fill === 'paint' && outline === 'none') { b.mode = 'fill'; b.edge = 'smart'; b.inside = 'solid'; return; }   // a plain stroke (stored like the presets)
  b.mode = 'outline'; b.edge = outline; b.inside = fill;
}
function brushChanged() { savePrefs(); renderOptions(); refreshBrushPop(true); redraw(); }
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('#brushMenu, .brushbtn')) closeBrushMenu();
  if (!e.target.closest('#rampMenu, .rampbtn')) closeRampMenu();
  if (!e.target.closest('#noiseMenu, .noisebtn')) closeNoiseMenu();
  if (!e.target.closest('#setPop, .setgear, .opts .density')) closeSetPop();
  if (!e.target.closest('#blockPop, .blockgear')) closeBlockPop();
  if (extrude.open && !e.target.closest('#extrudePop, .extrudebtn, [data-cmd="extrude"]')) closeExtrude();
  if (!e.target.closest('#brushPop, .brushgear')) closeBrushPop();
});
// Block tool options: Draw / Erase, block size, depth, style, Clear, Bake.
function blockOptions(add) {
  const B = S.blocks, num = (key, label, title) => stepper(label, `data-bnum="${key}" data-d="-1"`, `<span class="bminv">${B[key]}</span>`, `data-bnum="${key}" data-d="1"`, title);
  add(`<span class="label">Angle</span><span class="seg"><button class="btn${B.dir < 0 ? ' on' : ''}" data-bdir="-1" title="Depth going back to the left">Left</button><button class="btn${B.dir < 0 ? '' : ' on'}" data-bdir="1" title="Depth going back to the right">Right</button></span><span class="sep"></span>`);
  add(`<span class="label">Show</span><span class="seg"><button class="btn${B.show === 'shapes' ? '' : ' on'}" data-bshow="ascii" title="Pre-bake: the ASCII the blocks will make (amber until you Bake)">ASCII</button><button class="btn${B.show === 'shapes' ? ' on' : ''}" data-bshow="shapes" title="The block shapes">Shapes</button></span><span class="sep"></span>`);
  add(num('size', 'Size', 'How big each block\'s diamond is') + num('depth', 'Depth', 'How many columns one block reaches back') + `<span class="sep"></span>`);
  add(`<button class="btn icon blockgear" title="Faces: how the blocks bake (a fill for each face, white space), with a preview"><span class="gear">⚙</span></button>`);

}
function bindBlockOptions(o) {
  $$('[data-bshow]', o).forEach(b => b.addEventListener('click', () => { S.blocks.show = b.dataset.bshow; renderOptions(); redraw(); }));
  $$('[data-bdir]', o).forEach(b => b.addEventListener('click', () => { pushUndo(); S.blocks.dir = +b.dataset.bdir; changed(); renderOptions(); refreshBlockPop(); }));
  $$('[data-bnum]', o).forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.bnum; pushUndo(); S.blocks[k] = clamp(S.blocks[k] + +b.dataset.d, 1, k === 'size' ? 8 : 12); changed(); renderOptions(); refreshBlockPop();
  }));
  const bg = $('.blockgear', o); if (bg) bg.addEventListener('click', () => openBlockPop(bg));
}
// Block tool: the Faces popover (fills per face, white space, seams) with a live preview of a baked sample.
function openBlockPop(btn) {
  const p = $('#blockPop');
  if (!p.hidden) return closeBlockPop();
  refreshBlockPop(true);
  placeUnder(p, btn, 340);
}
function closeBlockPop() { const p = $('#blockPop'); if (p) p.hidden = true; }
function refreshBlockPop(force) {
  const p = $('#blockPop'); if (!p || (p.hidden && !force)) return;
  const B = S.blocks, pre = blockFillPreset(B.fill);
  const seg = (v, label, title) => `<button class="btn${(v === 'solid') === !!B.solid ? ' on' : ''}" data-bsolid="${v}" title="${title}">${label}</button>`;
  p.innerHTML =
    `<div class="bp-head"><span class="bp-title">Faces</span><span class="bp-note">how the blocks bake</span></div>` +
    `<pre class="bp-preview bpv">${esc(blockPreview())}</pre>` +
    `<div class="bp-row"><span class="bp-label">Preset</span><select class="bfill">${pre ? '' : '<option value="" selected>Custom</option>'}${Object.keys(BLOCK_FILLS).map(k => `<option value="${k}"${k === pre ? ' selected' : ''}>${esc(BLOCK_FILLS[k].name)}</option>`).join('')}</select></div>` +
    ['front', 'top', 'side'].filter(x => !(x === 'top' && B.view === 'diag')).map(x => `<div class="bp-row"><span class="bp-label">${x[0].toUpperCase() + x.slice(1)}</span><input class="bface" data-face="${x}" type="text" maxlength="2" value="${esc(B.fill[x] || '')}" placeholder="–" title="A character to fill the ${x} faces with, or empty for none"><span class="bp-note">${B.fill[x] ? '' : 'none'}</span></div>`).join('') +
    `<div class="bp-row"><span class="bp-label" title="${WS_TIP}">White space</span><span class="seg">${seg('solid', 'Solid', 'Faces left unfilled are solid: they cover whatever is behind the blocks (shown as faint dots, exported as spaces)')}${seg('clear', 'Clear', 'Faces left unfilled are see-through')}</span></div>` +
    (B.view === 'diag' ? `<div class="bp-row"><span class="bp-label">Runs</span><label class="label check" title="Side-by-side diamonds make a zigzag top and bottom; flattening fills the notches so a horizontal run reads as one flat bar"><input type="checkbox" class="bflat"${B.flat !== false ? ' checked' : ''}> flatten horizontal runs</label></div>` : '') +
    `<div class="bp-row"><span class="bp-label">Seams</span><label class="label check" title="Draw the lines between neighboring blocks, dotted (: up and down, . across)"><input type="checkbox" class="bseams"${B.seams ? ' checked' : ''}> lines between blocks</label></div>`;
  const upd = () => { $('.bpv', p).textContent = blockPreview(); changed(); };
  $('.bfill', p).addEventListener('change', e => { const f = BLOCK_FILLS[e.target.value]; if (f) B.fill = { front: f.front, top: f.top, side: f.side }; changed(); refreshBlockPop(); });
  $$('.bface', p).forEach(inp => {
    inp.addEventListener('input', () => { B.fill[inp.dataset.face] = chars(inp.value).slice(-1).join(''); inp.value = B.fill[inp.dataset.face]; upd(); });
    inp.addEventListener('change', () => refreshBlockPop());
  });
  $$('[data-bsolid]', p).forEach(b => b.addEventListener('click', () => { B.solid = b.dataset.bsolid === 'solid'; changed(); refreshBlockPop(); }));
  $('.bseams', p).addEventListener('change', e => { B.seams = e.target.checked; changed(); refreshBlockPop(); });
  const bfl = $('.bflat', p); if (bfl) bfl.addEventListener('change', e => { B.flat = e.target.checked; changed(); refreshBlockPop(); });
}
// ---------- Extrude (Select tool): give selected art depth ----------
// The filled shape (the art plus what it encloses) is swept back along (dx, dy); the outline of that swept solid gets
// smart edge characters (those are the depth lines), the art stays on top, and (Solid) the side surfaces are solid spaces.
const extrude = { dx: 4, dy: 0, solid: true, stroke: false, open: false };
function extrudeCells(dx = extrude.dx, dy = extrude.dy, solid = extrude.solid, stroke = extrude.stroke) {
  if (!S.sel) return null;
  const lay = L(), front = new Map();
  for (const k of S.sel) { const c = lay.cells.get(k); if (c && c !== SOLID) front.set(k, c); }
  if (!front.size) return null;
  // the filled shape: the art plus every cell it encloses (not reachable from outside through blank cells)
  const keys = [...front.keys()].map(unK);
  const bx0 = Math.min(...keys.map(k => k[0])) - 1, bx1 = Math.max(...keys.map(k => k[0])) + 1;
  const by0 = Math.min(...keys.map(k => k[1])) - 1, by1 = Math.max(...keys.map(k => k[1])) + 1;
  const outside = new Set([K(bx0, by0)]), stack = [[bx0, by0]];
  while (stack.length) {
    const [x, y] = stack.pop();
    for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + ex, ny = y + ey, k = K(nx, ny);
      if (nx < bx0 || nx > bx1 || ny < by0 || ny > by1 || outside.has(k) || front.has(k)) continue;
      outside.add(k); stack.push([nx, ny]);
    }
  }
  let mask = new Set();
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) if (!outside.has(K(x, y))) mask.add(K(x, y));
  // Stroke: grow the shape by one cell (left, right and down; a flat top's '_' already sits on the line above), so its
  // outline goes around the art without touching it
  if (stroke) {
    const grown = new Set(mask);
    for (const k of mask) { const [x, y] = unK(k); for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [1, 1], [-1, 1]]) grown.add(K(x + ex, y + ey)); }
    mask = grown;
  }
  // sweep it back
  const n = Math.max(Math.abs(dx), Math.abs(dy)) * 2 || 1, swept = new Set();
  for (let t = 0; t <= n; t++) {
    const ox = Math.round(dx * t / n), oy = Math.round(dy * t / n);
    for (const k of mask) { const [x, y] = unK(k); swept.add(K(x + ox, y + oy)); }
  }
  const out = regionEdges(swept, mask, solid);   // the depth: the swept solid's outline (not over the shape itself)
  if (stroke) for (const [k, c] of regionEdges(mask, null, false)) out.set(k, c);   // the stroke around the shape, in front
  // the shape's blanks: solid too, so the front covers what's behind it
  if (solid) for (const k of mask) if (!out.has(k) && !front.has(k) && !lay.cells.has(k)) out.set(k, SOLID);
  for (const [k, c] of front) out.set(k, c);
  return out;
}
// The outline of a region of cells, with smart characters: '_' on the line above a flat top, '_' along a flat bottom,
// '|' for straight sides, '/' '\' for slopes (from a 5 x 5 look-around), square corners where it really turns.
// Cells in `skip` get nothing; the region's inner cells become solid spaces if `solid`.
function regionEdges(region, skip, solid) {
  const out = new Map(), corners = [];
  const steep = c => c === '|' || c === '/' || c === '\\';
  const isOut = (a, b) => !region.has(K(a, b));
  for (const k of region) {
    if (skip && skip.has(k)) continue;
    const [x, y] = unK(k);
    const swept = region;
    const up = isOut(x, y - 1), down = isOut(x, y + 1), lft = isOut(x - 1, y), rgt = isOut(x + 1, y), side = lft || rgt;
    if (!up && !down && !side) { if (solid) out.set(k, SOLID); continue; }
    if ((up || down) && side) {
      // a real corner: the flat edge carries on inward along the row, and the side edge carries on along the column.
      // (Steps of a slope don't, so they get a slanted character below instead.)
      const ix = lft ? x + 1 : x - 1, vy = up ? y + 1 : y - 1;
      const flatGoesOn = swept.has(K(ix, y)) && (up ? isOut(ix, y - 1) : isOut(ix, y + 1));
      const sideGoesOn = swept.has(K(x, vy)) && (lft ? isOut(x - 1, vy) : isOut(x + 1, vy));
      if (flatGoesOn && sideGoesOn) { corners.push([x, y, up, down]); continue; }
    } else if (up) { out.set(K(x, y - 1), '_'); if (solid) out.set(k, SOLID); continue; }   // flat top: '_' on the line above
    else if (down) { out.set(k, '_'); continue; }                                            // flat bottom
    // a side: smart character from a 5 x 5 look-around (| for upright, / or \ for slanted)
    // a straight upright side: the cells above and below are side cells on the same side too
    // (both cells above and below are in the region, and at least one carries the side on: inside corners count too)
    const sideOut = yy => lft ? isOut(x - 1, yy) : isOut(x + 1, yy);
    if (!up && !down && swept.has(K(x, y - 1)) && swept.has(K(x, y + 1)) && (sideOut(y - 1) || sideOut(y + 1))) { out.set(k, '|'); continue; }
    let nx = 0, ny = 0;
    for (let ey = -2; ey <= 2; ey++) for (let ex = -2; ex <= 2; ex++) {
      if ((!ex && !ey) || swept.has(K(x + ex, y + ey))) continue;
      const px = ex * S.cw, py = ey * S.ch, d2 = px * px + py * py;
      nx += px / d2; ny += py / d2;
    }
    // steps of a slope may come out shallow (. - ' _); a plain side is always upright or slanted
    const c = smartChar(-ny, nx, up ? 0.25 : down ? 0.75 : 0.5);
    out.set(k, steep(c) || up || down ? c : '|');
  }
  // a corner takes the top / bottom '_' and the character of the side edge it sits on
  for (const [x, y, up, down] of corners) {
    const k = K(x, y), along = out.get(K(x, up ? y + 1 : y - 1));
    if (up) out.set(K(x, y - 1), '_');
    out.set(k, steep(along) ? along : (down ? '_' : '|'));
  }
  return out;
}
function openExtrude(btn) {
  if (S.float) commitFloat();
  if (!S.sel) return toast('Select some art first, then Extrude', 'warn');
  if (!extrudeCells()) return toast('The selection is empty on this layer: nothing to extrude', 'warn');
  extrude.open = true;
  refreshExtrudePop();
  placeUnder($('#extrudePop'), btn || $('#toolname'), 320);
  redraw();
}
function closeExtrude() { extrude.open = false; const p = $('#extrudePop'); if (p) p.hidden = true; redraw(); }
function applyExtrude() {
  const cells = extrudeCells(); if (!cells) return closeExtrude();
  if (textLock('Extruding')) return;
  pushUndo();
  const lay = L();
  for (const [k, c] of cells) { const [x, y] = unK(k); if (c === SOLID && lay.cells.has(k)) continue; setCell(lay, x, y, c); }
  closeExtrude(); changed();
  toast('Extruded (Ctrl Z undoes it)');
}
function refreshExtrudePop() {
  const p = $('#extrudePop'); if (!p) return;
  const num = (key, label, title) => `<div class="bp-row"><span class="bp-label" title="${title}">${label}</span><button class="btn icon" data-ex="${key}" data-d="-1">−</button><span class="bminv">${extrude[key] > 0 ? '+' : ''}${extrude[key]}</span><button class="btn icon" data-ex="${key}" data-d="1">+</button></div>`;
  const seg = (v, label, title) => `<button class="btn${(v === 'solid') === extrude.solid ? ' on' : ''}" data-exs="${v}" title="${title}">${label}</button>`;
  p.innerHTML =
    `<div class="bp-head"><span class="bp-title">Extrude <span class="beta">beta</span></span><span class="bp-note">shown live on the canvas</span></div>` +
    num('dx', 'Depth across', 'How far back the shape goes, in columns (+ right, − left)') +
    num('dy', 'Depth down', 'How far back the shape goes, in rows (+ down, − up)') +
    `<div class="bp-row"><span class="bp-label">Presets</span><span class="seg">` +
    [[4, 0, '→'], [2, -1, '↗'], [2, 1, '↘'], [-4, 0, '←'], [-2, -1, '↖']].map(([x, y, a]) => `<button class="btn${extrude.dx === x && extrude.dy === y ? ' on' : ''}" data-exp="${x},${y}" title="${x > 0 ? '+' : ''}${x} across, ${y > 0 ? '+' : ''}${y} down">${a}</button>`).join('') + `</span></div>` +
    `<div class="bp-row"><span class="bp-label" title="${WS_TIP}">White space</span><span class="seg">${seg('solid', 'Solid', 'The sides (and the inside of the shape) cover what is behind them')}${seg('clear', 'Clear', 'Only the edges land')}</span></div>` +
    `<div class="bp-row"><span class="bp-label">Stroke</span><label class="label check" title="Draw an outline around the shape first (one cell outside it, so the art stays intact), then extrude that"><input type="checkbox" class="ex-stroke"${extrude.stroke ? ' checked' : ''}> outline the shape</label></div>` +
    `<div class="bp-save"><button class="btn ex-cancel">Cancel</button><span class="spacer"></span><button class="btn primary ex-apply">Apply</button></div>`;
  p.hidden = false;
  $$('[data-ex]', p).forEach(b => b.addEventListener('click', () => { const k = b.dataset.ex; extrude[k] = clamp(extrude[k] + +b.dataset.d, -20, 20); if (!extrude.dx && !extrude.dy) extrude[k] = +b.dataset.d; refreshExtrudePop(); redraw(); }));
  $$('[data-exp]', p).forEach(b => b.addEventListener('click', () => { const [x, y] = b.dataset.exp.split(',').map(Number); extrude.dx = x; extrude.dy = y; refreshExtrudePop(); redraw(); }));
  $$('[data-exs]', p).forEach(b => b.addEventListener('click', () => { extrude.solid = b.dataset.exs === 'solid'; refreshExtrudePop(); redraw(); }));
  $('.ex-stroke', p).addEventListener('change', e => { extrude.stroke = e.target.checked; e.target.blur(); redraw(); });
  $('.ex-cancel', p).addEventListener('click', closeExtrude);
  $('.ex-apply', p).addEventListener('click', applyExtrude);
}
// ---------- 3D block editor (an overlay over the canvas) ----------
// Blocks are diamond-faced cubes on the same 45° grid the bake uses: block (u, v, z) has its front diamond centered on
// world (x, y) = (u - v, u + v), its points 1 away, and it runs from depth z to z + 1. You turn the view around them,
// click a face to add a block on that side (or the floor grid to start one), and Preview swings back to the bake angle
// and puts the shape on the canvas, where you can drag it around and Bake it.
// The view's turn is a trackball: right-drag turns the shape the way the pointer moves, about the screen's own axes
// (across = side to side, up / down = toward or away from you), from whatever angle it is at. Kept as a quaternion
// (cam.q), so there are no stops to lock up at. The views (Front, Angled, Diamond) are a turn + tilt, as before.
const cam = { roll: 0, pan: [0, 0], m: 0,   // roll: 0.5 = turned 45° (Angled), 1 = shaped like the canvas (Diamond)
  q: [1, 0, 0, 0], zoom: 1, tool: 'add', open: false, hover: null, drag: null, center: [0, 0, 0], faces: [] };
// orthographic views: Front, Top, Left and Right look straight along an axis; Angled is the 3/4 view
// the views: Front shows the square grid; Angled turns it 45° and looks from the depth side (turn 57°, tilt -2°, picked by
// eye to read close to the bake); Diamond is the canvas look (turned, stretched, straight on with the depth shifted sideways)
const CAM_VIEWS = { front: [0, 0, 0], angled: [-57 * Math.PI / 180, -2 * Math.PI / 180, 0.5], diamond: [0, 0, 1] };   // [turn, tilt, roll]
// quaternions [w, x, y, z]
const qMul = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2], a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
const qAxis = (ax, ay, az, ang) => { const s = Math.sin(ang / 2); return [Math.cos(ang / 2), ax * s, ay * s, az * s]; };
const qNorm = q => { const m = Math.hypot(...q) || 1; return q.map(c => c / m); };
function qSlerp(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  if (d < 0) { b = b.map(c => -c); d = -d; }   // the short way round
  if (d > 0.9995) return qNorm(a.map((c, i) => c + (b[i] - c) * t));
  const th = Math.acos(d), sa = Math.sin((1 - t) * th) / Math.sin(th), sb = Math.sin(t * th) / Math.sin(th);
  return a.map((c, i) => c * sa + b[i] * sb);
}
// a view from a turn (side to side) and a tilt (toward you), the tilt after the turn
const qView = (turn, tilt) => qMul(qAxis(1, 0, 0, tilt), qAxis(0, 1, 0, -turn));
function camM() {   // the rotation matrix, kept while cam.q stays the same
  if (cam.Mq !== cam.q) { const [w, x, y, z] = cam.q; cam.Mq = cam.q;
    cam.M = [[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]]; }
  return cam.M;
}
const camTurnTilt = () => { const M = camM(); return [Math.atan2(-M[0][2], M[0][0]), Math.atan2(M[2][1], M[1][1])]; };   // for the readout
// faces in the editor's square grid: ne = north (up), se = east, sw = south, nw = west (they become the diamond's edges)
const FACE_N = { front: [0, 0, -1], back: [0, 0, 1], ne: [0, -1, 0], se: [1, 0, 0], sw: [0, 1, 0], nw: [-1, 0, 0] };
const FACE_STEP = { front: [0, 0, -1], back: [0, 0, 1], ne: [0, -1, 0], se: [1, 0, 0], sw: [0, 1, 0], nw: [-1, 0, 0] };
// face colors. Axes: a tint per axis (across = red, along = green, up = blue). Height: a hue per level, so you can
// tell how high a block is from any view. Plain: the accent color.
const B3_AXIS_HUE = { se: 0, nw: 0, ne: 130, sw: 130, front: 215, back: 215 };
const b3HeightHue = h => ((205 - h * 47) % 360 + 360) % 360;
function b3FaceFill(f, C) {
  const mode = S.b3color;
  if (mode === 'axes') return `hsl(${B3_AXIS_HUE[f.face]} 70% 60%)`;
  if (mode === 'height') return `hsl(${b3HeightHue(-f.vox[2])} 72% 58%)`;
  return C.accent;
}
const LIGHT = (() => { const l = [-0.3, -0.55, -0.8], m = Math.hypot(...l); return l.map(c => c / m); })();
function camRot(x, y, z) { const M = camM(); return [M[0][0] * x + M[0][1] * y + M[0][2] * z, M[1][0] * x + M[1][1] * y + M[1][2] * z, M[2][0] * x + M[2][1] * y + M[2][2] * z]; }
const voxels3d = () => [...S.blocks.dcells].map(dparse);
function b3dCanvas() { return $('#b3dCanvas'); }
function b3dUnit() { return 26 * cam.zoom / (1 + Math.max(0, Math.max(cam.m, cam.roll) * 2 - 1) * (Math.SQRT2 * ((S.ch / S.cw) || 2) - 1) * 0.6); }   // shrinks as Preview stretches the shape
// The editor shows plain cubes on a square grid (cam.m = 0). The bake's diamonds are that grid turned 45° and stretched
// to the cell shape, with Depth / Size setting how far back a block reaches; Preview animates cam.m to 1 to show the turn.
// Model space: block (u, v, z) fills a in [u-.5, u+.5], b in [v-.5, v+.5], depth z to z+1.
function b3dXf() {
  // roll goes 0 -> 1 in two steps: up to 0.5 the grid turns 45° (cubes stay cubes: Angled), then it stretches to the
  // tall cells and the real depth, with the sideways depth shift (Diamond). Preview runs cam.m the same way.
  const r = Math.max(cam.m, cam.roll), turn = Math.min(1, r * 2), m = Math.max(0, r * 2 - 1), th = turn * Math.PI / 4, ar = (S.ch / S.cw) || 2;
  // the canvas look is oblique: straight on, each depth step shifted sideways. The shift fades out as the view turns away.
  const sh = (S.blocks.dir < 0 ? -1 : 1) * m * Math.max(0, 1 - 2 * Math.acos(Math.min(1, Math.abs(cam.q[0]))) / 0.3);
  return { sh, c: Math.cos(th), sn: Math.sin(th), s: 1 + m * (Math.SQRT2 - 1), ky: 1 + m * (ar - 1), kz: 1 + m * (Math.max(S.blocks.depth, 1) / Math.max(S.blocks.size, 1) - 1) };
}
function b3dProj(a, b, z) {
  const c = b3dCanvas(), [ca, cb, cz] = cam.center, X = b3dXf(), da = a - ca, db = b - cb;
  const x = X.s * (da * X.c - db * X.sn), y = X.s * (da * X.sn + db * X.c) * X.ky;
  const zz = (z - cz) * X.kz, [p, q, d] = camRot(x + X.sh * zz, y, zz), u = b3dUnit();
  return [c.clientWidth / 2 + cam.pan[0] + p * u, c.clientHeight / 2 + cam.pan[1] + q * u, d];
}
// screen point -> the floor (the front plane, depth 0) -> the square there
function b3dFloorAt(sx, sy) {
  const c = b3dCanvas(), u = b3dUnit(), x1 = (sx - c.clientWidth / 2 - cam.pan[0]) / u, y2 = (sy - c.clientHeight / 2 - cam.pan[1]) / u;
  const M = camM();
  if (Math.abs(M[2][2]) < 0.05) return null;   // looking along the floor: no good hit
  const [ca, cb, cz] = cam.center, X = b3dXf(), zt = (0 - cz) * X.kz;
  const d = (zt - M[0][2] * x1 - M[1][2] * y2) / M[2][2];   // how deep the floor is under the point; then undo the turn
  const A = M[0][0] * x1 + M[1][0] * y2 + M[2][0] * d, B = M[0][1] * x1 + M[1][1] * y2 + M[2][1] * d;
  const x = (A - X.sh * zt) / X.s, y = B / X.ky / X.s;
  return [Math.round(x * X.c + y * X.sn + ca), Math.round(-x * X.sn + y * X.c + cb)];
}
// the visible faces of every block, far to near (painter's order), with their screen polygons
function b3dFaces(vox = voxels3d()) {
  const set = new Set(vox.map(v => dkey(...v))), faces = [], X = b3dXf(), show = [];
  // which way a side faces doesn't depend on the block (the view is orthographic): find the sides that show, once
  for (const f of Object.keys(FACE_N)) {
    const [nx, ny, nz] = FACE_N[f];
    const n = [(nx * X.c - ny * X.sn) / X.s, (nx * X.sn + ny * X.c) / X.s / X.ky, nz / X.kz];   // normals scale inversely
    n[2] -= X.sh * n[0];   // and shear inversely
    const m = Math.hypot(...n), nn = n.map(c => c / m);
    if (camRot(...nn)[2] >= -0.001) continue;               // facing away
    show.push([f, FACE_STEP[f], 0.35 + 0.65 * Math.max(0, nn[0] * LIGHT[0] + nn[1] * LIGHT[1] + nn[2] * LIGHT[2])]);
  }
  const pc = new Map(), at = (a, b, d) => { const k = a + ',' + b + ',' + d; let p = pc.get(k); if (!p) pc.set(k, p = b3dProj(a, b, d)); return p; };   // corners are shared
  for (const [u, v, z] of vox) {
    for (const [f, [du, dv, dz], shade] of show) {
      if (set.has(dkey(u + du, v + dv, z + dz))) continue;   // covered by a neighbor
      const a0 = u - 0.5, a1 = u + 0.5, b0 = v - 0.5, b1 = v + 0.5, z1 = z + 1;
      const P = f === 'front' ? [at(a0, b0, z), at(a1, b0, z), at(a1, b1, z), at(a0, b1, z)]
        : f === 'back' ? [at(a0, b0, z1), at(a0, b1, z1), at(a1, b1, z1), at(a1, b0, z1)]
        : f === 'ne' ? [at(a0, b0, z), at(a1, b0, z), at(a1, b0, z1), at(a0, b0, z1)]
        : f === 'se' ? [at(a1, b0, z), at(a1, b1, z), at(a1, b1, z1), at(a1, b0, z1)]
        : f === 'sw' ? [at(a1, b1, z), at(a0, b1, z), at(a0, b1, z1), at(a1, b1, z1)]
        : [at(a0, b1, z), at(a0, b0, z), at(a0, b0, z1), at(a0, b1, z1)];
      faces.push({ vox: [u, v, z], face: f, P, depth: (P[0][2] + P[1][2] + P[2][2] + P[3][2]) / 4, shade });
    }
  }
  return faces.sort((a, b) => b.depth - a.depth);
}
const inScreenPoly = (P, x, y) => inPoly(P.map(p => [p[0], p[1]]), x, y);
function b3dPick(sx, sy) {
  for (let i = cam.faces.length - 1; i >= 0; i--) { const f = cam.faces[i]; if (inScreenPoly(f.P, sx, sy)) return f; }
  const g = b3dFloorAt(sx, sy);
  return g ? { floor: [g[0], g[1], 0] } : null;
}
// where a click would add a block, and which block it would remove
function b3dTarget(h) {
  if (!h) return null;
  if (h.floor) return { add: h.floor, remove: null };
  const [du, dv, dz] = FACE_STEP[h.face];
  return { add: [h.vox[0] + du, h.vox[1] + dv, h.vox[2] + dz], remove: h.vox };
}
// the ground (the bottom of level 0, depth 1): the footprint of the blocks about to go in, and for each column above
// the ground a dashed line down to it, so you can see where in space they are
function b3dShadow(g, C, cells) {
  const cols = new Map();
  for (const [u, v, z] of cells) { const k = u + ',' + v; if (!cols.has(k) || z > cols.get(k)) cols.set(k, z); }   // the lowest block per column
  g.save(); g.fillStyle = C['c-cursor']; g.globalAlpha = 0.22;
  for (const k of cols.keys()) {
    const [u, v] = k.split(',').map(Number), q = [[u - 0.5, v - 0.5], [u + 0.5, v - 0.5], [u + 0.5, v + 0.5], [u - 0.5, v + 0.5]].map(p => b3dProj(p[0], p[1], 1));
    g.beginPath(); q.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
  }
  if (cols.size <= 4) {   // a block or a small shape: lines down from each column
    g.globalAlpha = 0.85; g.strokeStyle = C['c-cursor']; g.setLineDash([3, 3]); g.lineWidth = 1.25; g.beginPath();
    for (const [k, z] of cols) { if (z + 1 >= 1) continue; const [u, v] = k.split(',').map(Number), a = b3dProj(u, v, z + 1), b = b3dProj(u, v, 1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  }
  g.restore();
}
function render3d() {
  const c = b3dCanvas(); if (!c || !cam.open) return;
  update3dCursor();
  const dpr = window.devicePixelRatio || 1, W = c.clientWidth, H = c.clientHeight;
  if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
  const g = c.getContext('2d'), C = S.colors;
  // the grid and the blocks: drawn into a layer, reused until the blocks, the view or the colors change
  const key = [W, H, dpr, cam.q.join(), cam.roll, cam.m, cam.pan.join(), cam.center.join(), cam.zoom, S.b3color, C['c-paper'], C.accent, C['c-ink'], C['c-grid'],
    S.blocks.dir, S.blocks.depth, S.blocks.size, S.ch / S.cw, [...S.blocks.dcells].join(';')].join('|');
  if (key === cam.layerKey && cam.layer) { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(cam.layer, 0, 0); g.setTransform(dpr, 0, 0, dpr, 0, 0); }
  else {
  const L = cam.layer || (cam.layer = document.createElement('canvas')); L.width = c.width; L.height = c.height;
  const gm = g;   // draw the layer, then copy it to the screen
  { const g = L.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = C['c-paper']; g.fillRect(0, 0, W, H);
  // the floor grid (squares on the front plane), around the center
  const ca = Math.round(cam.center[0]), cb = Math.round(cam.center[1]), RR = 16;
  g.strokeStyle = C['c-grid']; g.lineWidth = 1; g.beginPath();
  for (let k = -RR; k <= RR; k++) {
    const l1 = [b3dProj(ca + k + 0.5, cb - RR, 0), b3dProj(ca + k + 0.5, cb + RR, 0)], l2 = [b3dProj(ca - RR, cb + k + 0.5, 0), b3dProj(ca + RR, cb + k + 0.5, 0)];
    for (const [p, q] of [l1, l2]) { g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
  }
  g.stroke();
  // the blocks
  cam.faces = b3dFaces();
  for (const f of cam.faces) {
    g.beginPath(); f.P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath();
    g.globalAlpha = 1; g.fillStyle = C['c-paper']; g.fill();
    g.globalAlpha = 0.25 + 0.7 * f.shade; g.fillStyle = b3FaceFill(f, C); g.fill();
    g.globalAlpha = 0.9; g.strokeStyle = C['c-ink']; g.stroke();
  }
  g.globalAlpha = 1;
  }
  cam.layerKey = key;
  gm.setTransform(1, 0, 0, 1, 0, 0); gm.drawImage(L, 0, 0); gm.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  // hover: the face under the pointer, and a ghost of the block a click would add (or the one it would remove)
  const t = b3dTarget(cam.hover);
  const removing = (cam.tool === 'remove') !== !!cam.shift;
  const ghost = cam.drag ? null : removing ? b3removeCells() : b3shapeGhost();
  if (ghost && !removing) b3dShadow(g, C, ghost);
  if (ghost && ghost.length) {   // Add: the brush where it would go · Remove: the blocks it would take (see-through, dashed)
    const col = removing ? C['c-clash'] : C['c-cursor'];
    g.setLineDash([4, 3]);
    for (const f of b3dFaces(ghost)) {
      g.beginPath(); f.P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath();
      g.globalAlpha = (removing ? 0.35 : 0.2) + 0.3 * f.shade; g.fillStyle = col; g.fill();
      g.globalAlpha = 0.9; g.strokeStyle = col; g.stroke();
    }
    g.setLineDash([]); g.globalAlpha = 1;
  }
  const at = !cam.drag && t ? (removing ? t.remove : t.add) : null;
  $('#b3dAt').textContent = at ? `${removing ? 'remove' : 'add'} at ${at[0]}, ${at[1]} · height ${-at[2]}` : '';
  $('#b3dCount').textContent = `${S.blocks.dcells.size} block${S.blocks.dcells.size === 1 ? '' : 's'}`;
  const deg = r => Math.round(r * 180 / Math.PI), rr = Math.max(cam.m, cam.roll);
  const [tn, tl] = camTurnTilt();
  $('#b3dAngles').textContent = `turn ${deg(-tn)}° · tilt ${deg(tl)}° · grid ${Math.round(Math.min(1, rr * 2) * 45)}°${rr > 0.5 ? ' · stretch ' + Math.round((rr * 2 - 1) * 100) + '%' : ''}`;
}
// the middle of the blocks (what the view turns around), and a zoom that fits them, as they look from this angle,
// into about 75% of the window
function b3dFrame() {
  const vox = voxels3d();
  if (!vox.length) return { center: [0, 0, 0], zoom: cam.zoom };
  const xs = vox.map(v => v[0]), ys = vox.map(v => v[1]), zs = vox.map(v => v[2]);
  const lo = [Math.min(...xs) - 0.5, Math.min(...ys) - 0.5, Math.min(...zs)], hi = [Math.max(...xs) + 0.5, Math.max(...ys) + 0.5, Math.max(...zs) + 1];
  const center = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  const c = b3dCanvas(); if (!c || !c.clientWidth) return { center, zoom: cam.zoom };
  // project the corners of the blocks' box at zoom 1, centered, and see how big it comes out
  const keep = [cam.center, cam.zoom, cam.pan]; cam.center = center; cam.zoom = 1; cam.pan = [0, 0];
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const a of [lo[0], hi[0]]) for (const b of [lo[1], hi[1]]) for (const d of [lo[2], hi[2]]) { const p = b3dProj(a, b, d); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  [cam.center, cam.zoom, cam.pan] = keep;
  const zoom = clamp(0.75 * Math.min(c.clientWidth / Math.max(x1 - x0, 1), c.clientHeight / Math.max(y1 - y0, 1)), 0.25, 5);
  return { center, zoom };
}
function b3dCenter() { const f = b3dFrame(); cam.pan = [0, 0]; cam.center = f.center; cam.zoom = f.zoom; }
// Focus (F, like Unity / Blender): glide back to the blocks: the view turns around their middle again, panned back and
// zoomed to fit. Keeps the angle.
function focus3d() {
  const f = b3dFrame(), p0 = cam.pan.slice(), c0 = cam.center.slice(), z0 = cam.zoom, t0 = performance.now(), dur = 280;
  let fin = false;
  const end = () => { if (fin) return; fin = true; cam.pan = [0, 0]; cam.center = f.center; cam.zoom = f.zoom; render3d(); };
  const step = now => { if (fin) return; const k = Math.min(1, (now - t0) / dur), e = 1 - (1 - k) * (1 - k);
    cam.pan = p0.map(v => v * (1 - e)); cam.center = c0.map((v, i) => v + (f.center[i] - v) * e); cam.zoom = z0 * Math.pow(f.zoom / z0, e);
    render3d(); if (k < 1) requestAnimationFrame(step); else end(); };
  requestAnimationFrame(step); setTimeout(end, dur + 150);
}
// ---------- 3D brushes ----------
// Add and Remove work with a brush: Block (one block, the default) or a premade shape with its sizes. Add puts the brush
// on the face (or floor square) pointed at, a ghost showing where; Remove carves it out, centered on the block pointed at. Each shape is a list of [u, v, h]: u, v across the floor,
// centered on 0; h up from the floor (toward you: the editor's -z). "Save blocks as a shape" keeps your own (My shapes).
const B3_BOX = (w, l, h, keep = () => true) => { const out = [], u0 = (w - 1) >> 1, v0 = (l - 1) >> 1; for (let k = 0; k < h; k++) for (let j = 0; j < l; j++) for (let i = 0; i < w; i++) if (keep(i, j, k)) out.push([i - u0, j - v0, k]); return out; };
const B3_ROUND = (r, h, inner = -1, lift = 0) => { const out = []; for (let k = 0; k < h; k++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const d = i * i + j * j; if (d <= r * (r + 1) && (inner < 0 || d > inner * (inner + 1))) out.push([i, j, k + lift]); } return out; };
const B3D_SHAPES = {
  block: { name: 'Block', p: {}, tip: 'One block', make: () => [[0, 0, 0]] },
  cube: { name: 'Cube', p: { s: ['Size', 8, 1, 24] }, make: p => B3_BOX(p.s, p.s, p.s) },
  box: { name: 'Box', p: { w: ['Width', 8, 1, 40], l: ['Length', 5, 1, 40], h: ['Height', 3, 1, 40] }, make: p => B3_BOX(p.w, p.l, p.h) },
  plane: { name: 'Plane', p: { w: ['Width', 12, 1, 60], l: ['Length', 12, 1, 60], h: ['Thickness', 1, 1, 8] }, make: p => B3_BOX(p.w, p.l, p.h) },
  walls: { name: 'Walls', p: { w: ['Width', 10, 3, 40], l: ['Length', 8, 3, 40], h: ['Height', 4, 1, 30] }, tip: 'A room: a floor and four walls, no roof',
    make: p => B3_BOX(p.w, p.l, p.h + 1, (i, j, k) => k === 0 || i === 0 || j === 0 || i === p.w - 1 || j === p.l - 1) },
  disc: { name: 'Disc', p: { r: ['Radius', 6, 1, 24], h: ['Height', 1, 1, 30] }, make: p => B3_ROUND(p.r, p.h) },
  cylinder: { name: 'Cylinder', p: { r: ['Radius', 4, 1, 24], h: ['Height', 8, 1, 40] }, make: p => B3_ROUND(p.r, p.h) },
  ring: { name: 'Ring', p: { r: ['Radius', 6, 2, 24], t: ['Wall', 2, 1, 12], h: ['Height', 1, 1, 30] }, make: p => B3_ROUND(p.r, p.h, Math.max(0, p.r - p.t)) },
  sphere: { name: 'Sphere', p: { r: ['Radius', 4, 1, 16] }, make: p => { const out = [], r = p.r; for (let k = -r; k <= r; k++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j + k * k <= r * (r + 1)) out.push([i, j, k + r]); return out; } },
  dome: { name: 'Dome', p: { r: ['Radius', 6, 1, 20] }, make: p => { const out = [], r = p.r; for (let k = 0; k <= r; k++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j + k * k <= r * (r + 1)) out.push([i, j, k]); return out; } },
  pyramid: { name: 'Pyramid', p: { s: ['Base', 9, 1, 41] }, tip: 'Steps in by one block on each side per level',
    make: p => { const out = [], half = (p.s - 1) / 2; for (let k = 0; half - k >= 0; k++) for (let j = -Math.floor(half - k); j <= Math.ceil(half - k); j++) for (let i = -Math.floor(half - k); i <= Math.ceil(half - k); i++) out.push([i, j, k]); return out; } },
  stairs: { name: 'Stairs', p: { w: ['Width', 4, 1, 30], n: ['Steps', 5, 1, 30] }, tip: 'Q turns them',
    make: p => B3_BOX(p.w, p.n, p.n, (i, j, k) => k <= j) },
};
function b3shapeCells() {   // the chosen shape's blocks, turned by Q
  const sh = S.b3shape, my = sh.kind.startsWith('my:') ? S.myShapes.find(m => 'my:' + m.name === sh.kind) : null;
  const def = B3D_SHAPES[sh.kind];
  let cells = my ? my.cells : def ? def.make(b3shapeParams(sh.kind)) : [];
  for (let t = 0; t < (sh.turn & 3); t++) cells = cells.map(([u, v, h]) => [-v, u, h]);
  return cells;
}
function b3shapeParams(kind) {
  const def = B3D_SHAPES[kind], cur = S.b3shape.params[kind] || {}, out = {};
  for (const [k, [, dflt, lo, hi]] of Object.entries(def.p)) out[k] = clamp(cur[k] == null ? dflt : cur[k] | 0, lo, hi);
  return out;
}
// where the ghost goes: its floor middle on the square a click would add to (the floor, or the face pointed at)
function b3shapeGhost() {
  const t = b3dTarget(cam.hover); if (!t || !t.add) return null;
  const [ou, ov, oz] = t.add;
  return b3shapeCells().map(([u, v, h]) => [ou + u, ov + v, oz - h]);
}
function b3removeCells() {
  const t = b3dTarget(cam.hover); if (!t || !t.remove) return null;
  const [ou, ov, oz] = t.remove, cells = b3shapeCells(), mid = Math.floor(Math.max(0, ...cells.map(c => c[2])) / 2);
  return cells.map(([u, v, h]) => [ou + u, ov + v, oz - h + mid]).filter(v => S.blocks.dcells.has(dkey(...v)));
}
function b3brushRemove() {
  const r = b3removeCells(); if (!r || !r.length) return;
  pushUndo();
  for (const v of r) S.blocks.dcells.delete(dkey(...v));
  changed(); render3d();
}
function b3shapePlace() {
  const g = b3shapeGhost(); if (!g || !g.length) return;
  pushUndo();
  for (const v of g) S.blocks.dcells.add(dkey(...v));
  changed(); render3d();
}
function renderB3Shapes() {
  const p = $('#b3dShapes'); if (!p) return;
  const nm = $('#b3dBrushName'); if (nm) nm.textContent = b3brushLabel();
  const sh = S.b3shape, all = [...Object.entries(B3D_SHAPES).map(([k, d]) => [k, d.name, d.tip]), ...S.myShapes.map(m => ['my:' + m.name, m.name, 'Your shape (' + m.cells.length + ' blocks)'])];
  if (!all.some(a => a[0] === sh.kind)) sh.kind = 'block';
  const def = B3D_SHAPES[sh.kind], pr = def ? b3shapeParams(sh.kind) : null;
  p.innerHTML =
    '<div class="b3s-title">Brush</div><div class="b3s-list">' +
    all.map(([k, name, tip]) => '<button class="btn' + (k === sh.kind ? ' on' : '') + (k.startsWith('my:') ? ' mine' : '') + '" data-b3s="' + esc(k) + '"' + (tip ? ' title="' + esc(tip) + '"' : '') + '>' + esc(name) + '</button>').join('') + '</div>' +
    (pr ? '<div class="b3s-params">' + Object.entries(def.p).map(([k, [label, , lo, hi]]) =>
      '<label>' + label + ' <input type="number" data-b3p="' + k + '" min="' + lo + '" max="' + hi + '" value="' + pr[k] + '"></label>').join('') + '</div>' : '') +
    (sh.kind === 'block' ? '' : '<div class="b3s-row"><button class="btn" id="b3sTurn" title="Turn the brush a quarter (Q)">⟳ Turn</button><span class="b3s-n">' + b3shapeCells().length + ' blocks</span></div>') +
    '<div class="b3s-hint">' + (sh.kind === 'block' ? 'Add puts a block on the face you point at; Remove takes one away.' : 'Add puts the shape on the face you point at; Remove carves it out around the block you point at.') + ' Shift-click does the other one.</div>' +
    '<div class="b3s-mine">' +
    '<button class="btn" id="b3sSave" title="Keep the blocks in the editor now as a brush you can use again (saved in this browser)">Save blocks as a brush</button>' +
    (sh.kind.startsWith('my:') ? '<button class="btn" id="b3sDel" title="Remove this brush">Delete this brush</button>' : '') + '</div>';
  $$('[data-b3s]', p).forEach(b => b.addEventListener('click', () => { S.b3shape.kind = b.dataset.b3s; savePrefs(); renderB3Shapes(); render3d(); }));
  $$('[data-b3p]', p).forEach(inp => inp.addEventListener('input', () => {
    const v = parseInt(inp.value, 10); if (!Number.isFinite(v)) return;
    (S.b3shape.params[S.b3shape.kind] = S.b3shape.params[S.b3shape.kind] || {})[inp.dataset.b3p] = v;
    savePrefs(); const n = $('.b3s-n', p); if (n) n.textContent = b3shapeCells().length + ' blocks'; $('#b3dBrushName').textContent = b3brushLabel(); render3d();
  }));
  const tb = $('#b3sTurn', p); if (tb) tb.addEventListener('click', b3shapeTurn);
  $('#b3sSave', p).addEventListener('click', b3shapeSave);
  const del = $('#b3sDel', p);
  if (del) del.addEventListener('click', () => { const n = sh.kind.slice(3); S.myShapes = S.myShapes.filter(m => m.name !== n); S.b3shape.kind = 'block'; savePrefs(); renderB3Shapes(); render3d(); toast('Deleted the shape ' + n); });
}
// Examples (3D window): replace all the blocks with a made example, its block look too (Ctrl Z brings yours back)
function openB3Examples() {
  const pop = $('#b3dExamples'), btn = $('#b3dExBtn'), win = $('#b3d .b3d-win');
  pop.innerHTML = '<div class="b3s-title">Examples</div><div class="b3s-hint">Replaces all the blocks (Ctrl Z brings yours back)</div><div class="b3x-list">Loading…</div>';
  pop.hidden = false; btn.classList.add('open');
  const r = btn.getBoundingClientRect(), w = win.getBoundingClientRect();
  pop.style.left = (r.left - w.left) + 'px'; pop.style.top = (r.bottom - w.top + 4) + 'px';
  loadStart().then(st => {
    const list = $('.b3x-list', pop); if (!list) return;
    const ex = st.blocks || [];
    list.innerHTML = ex.length ? ex.map((e, i) => '<button class="btn" data-b3x="' + i + '">' + esc(e.name) + ' <span class="b3s-n">' + e.blocks.dcells.length + ' blocks</span></button>').join('') : '<div class="b3s-hint">No examples loaded</div>';
    $$('[data-b3x]', list).forEach(b => b.addEventListener('click', () => { closeB3Examples(); loadB3Example(ex[+b.dataset.b3x]); }));
  });
}
function closeB3Examples() { const pop = $('#b3dExamples'); if (!pop || pop.hidden) return false; pop.hidden = true; $('#b3dExBtn').classList.remove('open'); return true; }
function loadB3Example(e) {
  if (!e) return;
  pushUndo();
  const B = S.blocks, x = e.blocks;
  B.dcells = new Set((x.dcells || []).filter(k => /^-?\d+,-?\d+(,-?\d+)?$/.test(k)).map(k => dkey(...dparse(k))));
  if (x.size) B.size = clamp(x.size | 0, 1, 8); if (x.depth) B.depth = clamp(x.depth | 0, 1, 12); if (x.dir) B.dir = x.dir < 0 ? -1 : 1;
  if (x.fill && typeof x.fill === 'object') B.fill = { front: String(x.fill.front || '').slice(0, 2), top: String(x.fill.top || '').slice(0, 2), side: String(x.fill.side || '').slice(0, 2) };
  if (typeof x.solid === 'boolean') B.solid = x.solid; if (typeof x.seams === 'boolean') B.seams = x.seams;
  B.moved = false; B.placed = false;
  changed(); focus3d(); toast(e.name + ': all the blocks replaced (Ctrl Z brings yours back)');
}
// the Brush button: its name and sizes; the dropdown opens under it and folds away on a click elsewhere or Esc
function b3brushLabel() {
  const sh = S.b3shape, def = B3D_SHAPES[sh.kind];
  if (!def) return sh.kind.startsWith('my:') ? sh.kind.slice(3) : 'Block';
  const p = b3shapeParams(sh.kind), v = Object.values(p);
  // short sizes: Disc r6, Cylinder r4 h8, Box 8×5×3, Stairs 4 wide · 5 steps
  const dims = ['w', 'l', 'h'].filter(k => k in p && !(def.p.r && k === 'h'));
  const bits = [p.r != null ? 'r' + p.r : '', p.s != null ? String(p.s) : '', dims.length > 1 ? dims.map(k => p[k]).join('×') : '', def.p.r && p.h > 1 ? 'h' + p.h : '', p.t != null ? 'wall ' + p.t : '', p.n != null ? p.w + ' wide · ' + p.n + ' steps' : ''].filter(Boolean);
  void v; return def.name + (bits.length ? ' ' + bits.join(' ') : '');
}
function openB3Brush() {
  const pop = $('#b3dShapes'), btn = $('#b3dBrushBtn'), win = $('#b3d .b3d-win');
  renderB3Shapes(); pop.hidden = false; btn.classList.add('open');
  const r = btn.getBoundingClientRect(), w = win.getBoundingClientRect();
  pop.style.left = (r.left - w.left) + 'px'; pop.style.top = (r.bottom - w.top + 4) + 'px';
}
function closeB3Brush() { const pop = $('#b3dShapes'); if (!pop || pop.hidden) return false; pop.hidden = true; $('#b3dBrushBtn').classList.remove('open'); return true; }
function b3shapeTurn() { if (S.b3shape.kind === 'block') return; S.b3shape.turn = ((S.b3shape.turn | 0) + 1) & 3; savePrefs(); render3d(); }
function b3shapeSave() {
  const vox = voxels3d(); if (!vox.length) return toast('Build something first: there are no blocks to save', 'warn');
  const name = (prompt('Name for this brush', 'My brush ' + (S.myShapes.length + 1)) || '').trim(); if (!name) return;
  const us = vox.map(v => v[0]), vs = vox.map(v => v[1]), zs = vox.map(v => v[2]);
  const cu = Math.round((Math.min(...us) + Math.max(...us)) / 2), cv = Math.round((Math.min(...vs) + Math.max(...vs)) / 2), zb = Math.max(...zs);
  const cells = vox.map(([u, v, z]) => [u - cu, v - cv, zb - z]);
  S.myShapes = [...S.myShapes.filter(m => m.name !== name), { name, cells }];
  S.b3shape.kind = 'my:' + name; S.b3shape.turn = 0; savePrefs(); renderB3Shapes(); render3d();
  toast('Saved the brush ' + name + ' (' + cells.length + ' blocks)');
}
const B3_ICON_OUT = '<svg viewBox="0 0 20 20"><path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5M3 3l5 5M17 3l-5 5M3 17l5-5M17 17l-5-5"/></svg>';   // arrows out: bigger
const B3_ICON_IN = '<svg viewBox="0 0 20 20"><path d="M8 3v5H3M12 3v5h5M8 17v-5H3M12 17v-5h5M3 3l5 5M17 3l-5 5M3 17l5-5M17 17l-5-5"/></svg>';    // arrows in: smaller
function b3SizeUi() {
  $('#b3d .b3d-win').classList.toggle('big', S.b3big);
  const b = $('#b3dSize'); b.innerHTML = S.b3big ? B3_ICON_IN : B3_ICON_OUT;
  b.title = S.b3big ? 'Smaller window, so more of the editor shows (Z)' : 'Fill most of the screen (Z)';
}
function b3ColorUi() { $$('#b3d [data-b3color]').forEach(b => b.classList.toggle('on', b.dataset.b3color === S.b3color)); }
function setB3Tool(t) {
  cam.tool = t === 'remove' ? 'remove' : 'add';
  $$('#b3d [data-b3tool]').forEach(x => x.classList.toggle('on', x.dataset.b3tool === cam.tool));
  render3d();
}

function open3d() {
  commitFloat();
  if (S.tool !== 'block') setTool('block');
  if (!cam.view) setCamView('angled', true);   // the first time: Angled
  cam.open = true; cam.hover = null; b3ColorUi(); b3SizeUi(); renderB3Shapes(); closeB3Brush();
  $('#b3d').hidden = false;
  b3dCenter();   // after it shows, so it can fit the window
  render3d();
  requestAnimationFrame(() => { if (cam.open && !cam.drag) { b3dCenter(); render3d(); } });   // again once the window has its final size
}
function close3d() { closeB3Brush(); closeB3Examples(); cam.open = false; cam.drag = null; $('#b3d').hidden = true; renderOptions(); redraw(); }
// Preview: turn back to the bake angle, close, and show the shape on the canvas (placed in view the first time)
function animCam(to, dur, done, toRoll = cam.roll) {
  const q0 = cam.q, q1 = qView(to[0], to[1]), r0 = cam.roll, t0 = performance.now(); let fin = false;
  const end = () => { if (fin) return; fin = true; cam.q = q1; cam.roll = toRoll; render3d(); if (done) done(); };
  const step = now => { if (fin) return; const k = Math.min(1, (now - t0) / dur), e = 1 - (1 - k) * (1 - k);
    cam.q = qSlerp(q0, q1, e); cam.roll = r0 + (toRoll - r0) * e; render3d(); if (k < 1) requestAnimationFrame(step); else end(); };
  requestAnimationFrame(step); setTimeout(end, dur + 150);
}
function preview3d() {
  if (cam.previewing) return;
  // end straight on, turned into diamonds with the sideways depth shift: exactly how the canvas shows it
  const from = cam.q, to = [1, 0, 0, 0], t0 = performance.now(), dur = 650;
  cam.previewing = true;
  const finish = () => {
    if (!cam.previewing) return;
    cam.previewing = false;
    cam.q = from; cam.m = 0;   // keep their editing angle for next time
    if (S.blocks.dcells.size) placeBlocksInView();
    close3d();
  };
  const step = now => {
    if (!cam.previewing) return;
    const k = Math.min(1, (now - t0) / dur), e = 1 - (1 - k) * (1 - k);
    cam.q = qSlerp(from, to, e); cam.m = clamp(k * 1.6 - 0.6, 0, 1); render3d();
    if (k < 1) requestAnimationFrame(step); else finish();
  };
  requestAnimationFrame(step);
  setTimeout(finish, dur + 150);   // in case animation frames are paused (a background tab)
}
// Where the ASCII preview sits when you come back from the 3D editor: centered on the canvas, unless you've dragged it
// somewhere (B.moved), where it stays, unless it has ended up mostly off the canvas. If it's out of sight, the view
// pans to it.
function placeBlocksInView(force) {
  const B = S.blocks, box = () => { const ks = [...diagBake(B).keys()].map(unK); if (!ks.length) return null;
    const xs = ks.map(k => k[0]), ys = ks.map(k => k[1]), inside = ks.filter(([x, y]) => x >= 0 && y >= 0 && x < S.w && y < S.h).length;
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), inside: inside / ks.length }; };
  let b = box(); if (!b) return;
  if (force || !B.moved || b.inside < 0.5) {
    B.ox = Math.round((B.ox || 0) + (S.w - 1) / 2 - (b.x0 + b.x1) / 2); B.oy = Math.round((B.oy || 0) + (S.h - 1) / 2 - (b.y0 + b.y1) / 2);
    B.placed = true; if (force) B.moved = false; b = box();
  }
  const a = cellAt(0, 0), z = cellAt(vp.clientWidth, vp.clientHeight);
  if (b.x1 < a.x || b.x0 > z.x || b.y1 < a.y || b.y0 > z.y) {   // out of sight: bring the view to it
    S.offX = vp.clientWidth / 2 - ((b.x0 + b.x1 + 1) / 2) * S.cw; S.offY = vp.clientHeight / 2 - ((b.y0 + b.y1 + 1) / 2) * S.ch; S.viewTouched = true;
  }
  changed();
}
// Angled follows the Angle setting (which side the depth goes); the others are fixed
function setCamView(name, instant) {
  const v = CAM_VIEWS[name]; if (!v) return;
  const k = S.blocks.dir < 0 ? -1 : 1, to = [v[0] * k, v[1]];
  cam.view = name;
  $$('#b3d [data-b3view]').forEach(b => b.classList.toggle('on', b.dataset.b3view === name));
  if (instant) { cam.q = qView(to[0], to[1]); cam.roll = v[2]; render3d(); } else animCam(to, 350, null, v[2]);
}
(() => {
  const c = b3dCanvas(); if (!c) return;
  const pos = e => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  c.addEventListener('contextmenu', e => e.preventDefault());
  c.addEventListener('pointerdown', e => {
    try { c.setPointerCapture(e.pointerId); } catch (_) {}
    const [x, y] = pos(e);
    if (e.button === 1 || S.spaceDown) { cam.drag = { pan: true, x, y, px: cam.pan[0], py: cam.pan[1] }; update3dCursor(); e.preventDefault(); return; }   // move the view
    if (e.button !== 0 || e.altKey) { cam.drag = { x, y, lx: x, ly: y }; update3dCursor(); return; }   // turn the view
    cam.hover = b3dPick(x, y);
    if ((cam.tool === 'remove') !== e.shiftKey) b3brushRemove(); else b3shapePlace();   // Shift-click does the other one
    cam.faces = b3dFaces(); cam.hover = b3dPick(x, y); render3d();
  });
  c.addEventListener('pointermove', e => {
    const [x, y] = pos(e); cam.shift = e.shiftKey;
    if (cam.drag && cam.drag.pan) { cam.pan = [cam.drag.px + x - cam.drag.x, cam.drag.py + y - cam.drag.y]; render3d(); return; }
    if (cam.drag) {   // trackball: turn about the screen axis at right angles to the pointer's move
      const dx = x - cam.drag.lx, dy = y - cam.drag.ly, len = Math.hypot(dx, dy); cam.drag.lx = x; cam.drag.ly = y;
      if (len) cam.q = qNorm(qMul(qAxis(dy / len, -dx / len, 0, len * 0.01), cam.q));
      render3d(); return;
    }
    cam.hover = b3dPick(x, y); render3d();
  });
  const end = () => { cam.drag = null; update3dCursor(); };
  c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
  c.addEventListener('pointerleave', () => { if (!cam.drag) { cam.hover = null; render3d(); } });
  c.addEventListener('wheel', e => { e.preventDefault(); cam.zoom = clamp(cam.zoom * Math.pow(1.0015, -e.deltaY), 0.25, 5); render3d(); }, { passive: false });
  $$('#b3d [data-b3tool]').forEach(b => b.addEventListener('click', () => { b.blur(); setB3Tool(b.dataset.b3tool); }));
  $$('#b3d [data-b3view]').forEach(b => b.addEventListener('click', () => { b.blur(); setCamView(b.dataset.b3view); }));
  $$('#b3d [data-b3color]').forEach(b => b.addEventListener('click', () => { b.blur(); S.b3color = b.dataset.b3color; savePrefs(); b3ColorUi(); render3d(); }));
  $('#b3dPreview').addEventListener('click', preview3d);
  $('#b3dClose').addEventListener('click', close3d);
  $('#b3dBrushBtn').addEventListener('click', e => { e.currentTarget.blur(); if (!closeB3Brush()) openB3Brush(); });
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#b3dShapes, #b3dBrushBtn')) closeB3Brush(); if (!e.target.closest('#b3dExamples, #b3dExBtn')) closeB3Examples(); }, true);
  $('#b3dExBtn').addEventListener('click', e => { e.currentTarget.blur(); if (!closeB3Examples()) openB3Examples(); });   // a click elsewhere folds it away
  $('#b3dSize').addEventListener('click', e => { e.currentTarget.blur(); S.b3big = !S.b3big; savePrefs(); b3SizeUi(); });
  $('#b3dFocus').addEventListener('click', e => { e.currentTarget.blur(); focus3d(); });
  $('#b3dClear').addEventListener('click', () => { if (!S.blocks.dcells.size) return; pushUndo(); S.blocks.dcells.clear(); changed(); render3d(); toast('All blocks removed (Ctrl Z brings them back)'); });
  new ResizeObserver(() => render3d()).observe(c);
})();
// Shape tool options: which shape, its style, Fixed aspect / From center, Fill inside.
function shapeOptions(add) {
  const sh = S.shape, k = sh.kind;
  const seg = (v, ic, title) => iconBtn(`data-shapek="${v}"`, ic, title, k === v);
  add(`<span class="seg">${seg('rect', 'shRect', 'Rectangle')}${seg('ellipse', 'shEllipse', 'Ellipse')}${seg('line', 'shLine', 'Line')}${seg('polygon', 'shPoly', 'Polygon: click the corners')}</span><span class="sep"></span>`);
  const styles = k === 'rect' ? RECT_STYLES : k === 'ellipse' ? ELLIPSE_STYLES : k === 'polygon' ? POLY_STYLES : LINE_STYLES;
  const cur = sh[k];
  add(choiceBtn('shapestyle', 'Style: how the edges are drawn', ['none', ...Object.keys(styles).filter(s => s !== 'none')].filter(s => styles[s]).map(s => [s, typeof styles[s] === 'string' ? styles[s] : styles[s].name]), cur));
  if (cur === 'char') add(`<span class="micon" title="The Draw character">${esc(S.brush.ch)}</span>`);
  add(`<span class="sep"></span>` + well((k === 'rect' || k === 'ellipse' ? togBtn('shape.fixed', 'fixed', `Fixed aspect: keep it a ${k === 'ellipse' ? 'circle' : 'square'} (or hold Shift while dragging)`) + togBtn('shape.center', 'center', 'From center: grow from where you start (or hold Alt while dragging)') : '') +
    (k !== 'line' ? togBtn('shape.fill', 'fillIn', 'Fill inside, with the Paint panel\'s setting (Polygons fill when closed)') : '')));
}
function bindShapeOptions(o) {
  $$('[data-shapek]', o).forEach(b => b.addEventListener('click', () => { S.shape.kind = b.dataset.shapek; S.poly = null; savePrefs(); renderOptions(); redraw(); }));
}
// The tools that can mirror what they do (each has a "uses mirror" toggle in the bar; the lines are set up in Symmetry)
const MIRROR_TOOLS = ['select', 'move', 'type', 'font', 'pencil', 'brush', 'eraser', 'shape', 'block', 'fill'];
const TOOL_NAMES = { select: 'Select', move: 'Move', type: 'Type', pencil: 'Pencil', brush: 'Brush', font: 'Font', shape: 'Shape', block: 'Block', eraser: 'Eraser', fill: 'Fill', picker: 'Picker', hand: 'Hand', zoom: 'Zoom' };
const toolName = () => S.tool === 'select' && S.selShape === 'wand' ? 'Magic wand' : TOOL_NAMES[S.tool] || '';
const paintUsed = () => S.tool === 'brush' || S.tool === 'fill' || (S.tool === 'shape' && S.shape.fill && S.shape.kind !== 'line');
// The settings bar (one row: the tool's main settings), its … menu (the secondary ones), and the Paint and Symmetry
// panels on the right. Each control is built once, in the place it belongs; bindOptions wires up each place.
// Icons for the settings bar (the toolbox icons' 20 x 20 grid and strokes): long settings are icon buttons
const MIRROR_SVG = '<svg viewBox="0 0 20 20"><path d="M10 2.5v15" stroke-dasharray="2 2"/><path d="M7.5 5.5 3 10l4.5 4.5zM12.5 5.5 17 10l-4.5 4.5z"/></svg>';
const OPT_ICONS = {
  selRect: '<rect x="3.5" y="4.5" width="13" height="11" stroke-dasharray="2.5 2"/>',
  selEllipse: '<ellipse cx="10" cy="10" rx="7" ry="5.5" stroke-dasharray="2.5 2"/>',
  selLasso: '<path d="M7.5 12.6C3.5 11.6 4 5 11 5s7.5 7.5 0 7.5c-2.3 0-3.8 1.3-3.3 2.8s-.6 2.2-2.2 2.7"/>',
  selPoly: '<path d="M4.5 14 3 6.5l7-3.5 7 4.5-2.5 8z" stroke-dasharray="2.5 2"/>',
  wand: '<path d="M3 17 11.5 8.5M14.5 1.5q.5 3.5 4 4-3.5.5-4 4-.5-3.5-4-4 3.5-.5 4-4z"/>',
  shRect: '<rect x="3.5" y="4.5" width="13" height="11" rx="1"/>',
  shEllipse: '<ellipse cx="10" cy="10" rx="7" ry="5.5"/>',
  shLine: '<path d="M4 16 16 4"/>',
  shPoly: '<path d="M10 3.5 16.5 8.5 14 16.5H6L3.5 8.5z"/>',
  fixed: '<rect x="4" y="4" width="12" height="12" rx="1"/><path d="M4 16 16 4"/>',
  center: '<path d="M10 3v3.5M10 13.5V17M3 10h3.5M13.5 10H17"/><circle cx="10" cy="10" r="1.3" fill="currentColor"/>',
  fillIn: '<rect x="4" y="4" width="12" height="12" rx="1" fill="currentColor" fill-opacity=".45"/>',
  contig: '<path d="M2.5 7.5h5v5h-5zM7.5 7.5h5v5h-5zM12.5 7.5h5v5h-5z"/>',
  layer: '<path d="M3 10l7-3.5 7 3.5-7 3.5z"/>',
  layers: '<path d="M3 8l7-3.5L17 8l-7 3.5zM3 11.5l7 3.5 7-3.5"/>',
  tipSquare: '<rect x="5.5" y="5.5" width="9" height="9"/>',
  tipRound: '<circle cx="10" cy="10" r="4.8"/>',
};
const optIcon = k => `<svg viewBox="0 0 20 20">${OPT_ICONS[k]}</svg>`;
// an icon button; on = selected. tog: a setting it switches on and off ("selFixed", "shape.fill"...)
const iconBtn = (attrs, k, title, on) => `<button class="btn icon${on ? ' on' : ''}" ${attrs} title="${esc(title)}">${optIcon(k)}</button>`;
const well = html => `<span class="seg">${html}</span>`;   // a segment well around buttons (choices or toggles)
// the one increment widget: − value +, in a segment well
// (− and + are drawn, not text, so they sit exactly in the middle)
const STEP_SVG = { minus: '<svg viewBox="0 0 20 20"><path d="M6 10h8"/></svg>', plus: '<svg viewBox="0 0 20 20"><path d="M6 10h8M10 6v8"/></svg>' };
const stepper = (label, minus, value, plus, title) => `<span class="label"${title ? ` title="${esc(title)}"` : ''}>${label}</span><span class="seg stepper"><button class="btn icon" ${minus} title="Less">${STEP_SVG.minus}</button>${value}<button class="btn icon" ${plus} title="More">${STEP_SVG.plus}</button></span>`;
// a dropdown like the others (a dd button and a tray), for a short list of choices: [[value, label]...]
const FONT_LAYOUTS = [['default', 'Default spacing'], ['full', 'Full width'], ['fit', 'Fit'], ['smush', 'Smush']];
const FONT_WS = [['clear', 'Clear blanks'], ['inside', 'Solid inside'], ['block', 'Solid block']];
const choiceSets = {};
function choiceBtn(key, title, items, cur) {
  choiceSets[key] = items;
  const it = items.find(([v]) => v === cur) || items[0];
  return `<button class="btn dd" data-choice="${key}" data-cur="${esc(String(cur))}" title="${esc(title)}"><span class="pname">${esc(it[1])}</span><span class="caret">▾</span></button>`;
}
function openChoice(btn) {
  const m = $('#choiceMenu'), key = btn.dataset.choice;
  if (!m.hidden && m.dataset.key === key) return closeChoice();
  m.dataset.key = key;
  m.innerHTML = choiceSets[key].map(([v, label]) => `<div class="patitem${v === btn.dataset.cur ? ' on' : ''}" data-v="${esc(v)}"><span class="pname">${esc(label)}</span></div>`).join('');
  const r = btn.getBoundingClientRect();
  m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 260)) + 'px'; m.style.top = (r.bottom + 6) + 'px'; m.hidden = false;
  $$('.patitem', m).forEach(el => el.addEventListener('click', () => { closeChoice(); pickChoice(key, el.dataset.v); }));
}
function closeChoice() { const m = $('#choiceMenu'); if (m) m.hidden = true; }
function pickChoice(key, v) {
  if (key === 'shapestyle') { S.shape[S.shape.kind] = v; savePrefs(); renderOptions(); redraw(); }
  else if (key === 'flayout') setFigFont(S.figfont.name, v);
  else if (key === 'fws') setFigFont(S.figfont.name, S.figfont.layout, v);
}
document.addEventListener('pointerdown', e => { if (!e.target.closest('#choiceMenu, [data-choice]')) closeChoice(); });
window.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#choiceMenu').hidden) { closeChoice(); e.stopImmediatePropagation(); } }, true);
const togGet = path => path.split('.').reduce((o, k) => o[k], S);
const togBtn = (path, k, title) => iconBtn(`data-tog="${path}"`, k, title, !!togGet(path));
const lookAt = (attr, cur, what) => `<span class="seg">${iconBtn(`${attr}="layer"`, 'layer', `${what}: the active layer`, cur === 'layer')}${iconBtn(`${attr}="all"`, 'layers', `${what}: what you see (all visible layers)`, cur === 'all')}</span>`;
// The settings bar (one row: every setting of the tool, long ones as icons), and the Paint and Symmetry panels on the
// right. Each control is built once, in the place it belongs; bindOptions wires up each place.
function renderOptions() {
  closePatternMenu(); closePaintMenu(); closeRampMenu(); closeNoiseMenu();
  const t = S.tool, bar = $('#toolopts'), paint = $('#paintOpts'), sym = $('#symOpts');
  for (const el of [bar, paint, sym]) el.innerHTML = '';
  const add = html => bar.insertAdjacentHTML('beforeend', html);
  const addPaint = html => paint.insertAdjacentHTML('beforeend', `<div>${html}</div>`);
  const addSym = html => sym.insertAdjacentHTML('beforeend', `<div>${html}</div>`);
  const sep = '<span class="sep"></span>';
  const sizeCtl = () => stepper('Size', 'data-size="-1"', `<input class="size" type="text" inputmode="numeric" maxlength="2" value="${toolSize().size}" title="Size, 1-25 ([ and ] change it)">`, 'data-size="1"');
  const tipCtl = () => `<span class="seg">${iconBtn('data-tip="square"', 'tipSquare', 'Tip: square', toolSize().tip !== 'round')}${iconBtn('data-tip="round"', 'tipRound', 'Tip: round', toolSize().tip === 'round')}</span>`;
  $('#toolname .name').textContent = toolName();

  if (t === 'select') {
    const shp = (v, k, title) => iconBtn(`data-shape="${v}"`, k, title, S.selShape === v);
    add(`<span class="seg">${shp('rect', 'selRect', 'Rectangle (Shift M cycles the shapes)')}${shp('ellipse', 'selEllipse', 'Ellipse')}${shp('lasso', 'selLasso', 'Lasso')}${shp('polygon', 'selPoly', 'Polygon: click the corners')}${shp('wand', 'wand', 'Magic wand (W): the same character')}</span>`);
    if (S.selShape === 'rect' || S.selShape === 'ellipse') add(sep + well(togBtn('selFixed', 'fixed', `Fixed aspect: keep it a ${S.selShape === 'ellipse' ? 'circle' : 'square'} (or hold Shift while dragging)`) + togBtn('selCenter', 'center', 'From center: grow from where you start (or hold Alt while dragging)')));
    if (S.selShape === 'wand') add(sep + well(togBtn('wandContig', 'contig', 'Contiguous: on, the connected cells with that character; off, every one')) + sep + lookAt('data-selsample', S.selSample, 'Match characters on'));
  }
  if (t === 'move') add(`<span class="label" title="${WS_TIP}">White space</span><span class="seg"><button class="btn blanks${S.spacesErase ? ' on' : ''}" data-blank="1" title="${WS_SOLID}">Solid</button><button class="btn blanks${S.spacesErase ? '' : ' on'}" data-blank="0" title="${WS_CLEAR}">Clear</button></span>`);
  if (t === 'type') add(`<span class="seg"><button class="btn${S.typeInsert ? '' : ' on'}" data-insert="0" title="Type over what's there (Insert key switches)">Overwrite</button><button class="btn${S.typeInsert ? ' on' : ''}" data-insert="1" title="Push the rest of the row along (Insert key switches)">Insert</button></span>`);
  if (t === 'font') {
    add(`<button class="btn dd fontbtn" title="Choose a font"><span class="pname">${esc(S.figfont.name)}</span><span class="caret">▾</span></button>`);
    add(sep + choiceBtn('flayout', 'Spacing: how the letters fit together', FONT_LAYOUTS, S.figfont.layout));
    const step = (key, label, title) => stepper(label, `data-fsp="${key}" data-d="-1"`, `<span class="bminv">${S.figfont[key] || 0}</span>`, `data-fsp="${key}" data-d="1"`, title);
    add(step('ls', 'Letters', 'Extra space between letters (after Spacing); below 0 they overlap') + step('lh', 'Lines', 'Extra rows between lines of text; below 0 they tuck in'));
    const ws = S.figfont.ws || 'clear';
    add(sep + choiceBtn('fws', WS_TIP, FONT_WS, ws));
  }
  if (t === 'pencil') {
    add(`<span class="seg"><button class="btn${S.pencil.smart ? '' : ' on'}" data-psmart="0" title="Draw with the Draw character">Character</button><button class="btn${S.pencil.smart ? ' on' : ''}" data-psmart="1" title="A line that picks its own characters as you draw (S)">Smart</button></span>`);
    if (S.pencil.smart) add(sep + `<span class="seg">${Object.keys(SMART_STYLES).map(k => `<button class="btn${S.pencil.style === k ? ' on' : ''}" data-pstyle="${k}" title="${{ ascii: 'Picks - | / \ _ . , ( ) < > by the direction you draw', box: 'Connected box lines ─ │ ╭ ╮ ╰ ╯, joining box lines already there', block: 'Block characters █ ▌ ▐ ▀ ▄' }[k]}">${SMART_STYLES[k]}</button>`).join('')}</span>`);
    else add(sep + sizeCtl() + tipCtl());
  }
  if (t === 'brush') { brushStrokeOptions(add); add(sizeCtl()); }
  if (t === 'eraser') add(sizeCtl() + tipCtl());
  if (t === 'shape') shapeOptions(add);
  if (t === 'block') blockOptions(add);
  if (t === 'fill') add(well(togBtn('fillContig', 'contig', 'Contiguous: on, the connected area; off, every cell with that character (Shift-click does the other one)')) + sep + lookAt('data-sample', S.fillSample, 'Fill the area as it is on'));
  if (t === 'picker') add(lookAt('data-picksample', S.pickSample, 'Pick from'));

  // Paint panel: what the Brush, Fill and a filled Shape paint with
  const pm = S.paint.mode;
  addPaint(`<button class="btn dd paintbtn" title="What to paint with"><span class="micon">${esc(modeIcon(pm))}</span><span class="pname">${PAINT_MODES[pm].name}</span><span class="caret">▾</span></button>`);
  if (pm === 'ramp') addPaint(`<button class="btn dd rampbtn" title="Choose a ramp (light to dense, from the end of the stroke to the middle)"><span class="micon">${esc(rampMirror(S.paint.ramp.set, 13))}</span><span class="pname">${esc(S.paint.ramp.name || 'Custom')}${setPopEdited('ramp') ? ' •' : ''}</span><span class="caret">▾</span></button>` +
      `<button class="btn icon setgear" data-kind="ramp" title="Customize: edit the ramp's characters and save your own"><span class="gear">⚙</span></button>`);
  else if (pm === 'noise') {
    addPaint(`<button class="btn dd noisebtn" title="Choose a noise"><span class="micon">${esc(noisePatch(S.paint.noise.set, S.paint.noise.density, 6, 2))}</span><span class="pname">${esc(S.paint.noise.name || 'Custom')}${setPopEdited('noise') ? ' •' : ''}</span><span class="caret">▾</span></button>` +
      `<button class="btn icon setgear" data-kind="noise" title="Customize: edit the noise's characters and density, and save your own"><span class="gear">⚙</span></button>`);
    addPaint(`<span class="label" title="How many of the cells you paint get a character (the rest are skipped; White space decides what skipped cells do)">Density</span><input class="density" type="range" min="5" max="100" step="5" value="${S.paint.noise.density}" title="How many of the cells you paint get a character"><span class="label dens">${S.paint.noise.density}%</span>`);
  } else if (pm === 'pattern') addPaint(`<button class="btn dd patbtn" title="Choose a pattern"><pre class="patprev">${esc(patternPreview())}</pre><span class="pname">${esc(S.paint.pattern.name)}</span><span class="caret">▾</span></button>`);
  if (pm === 'noise' || pm === 'pattern') {   // (Character and Ramp have no blank spots)
    const bk = t === 'fill' ? S.blanksFill : S.blanksBrush;
    addPaint(`<span class="label" title="${WS_TIP}">White space</span><span class="seg"><button class="btn${bk === 'replace' ? ' on' : ''}" data-pblank="replace" title="${WS_SOLID}">Solid</button><button class="btn${bk === 'through' ? ' on' : ''}" data-pblank="through" title="${WS_CLEAR}">Clear</button></span>`);
  }
  $('[data-panel="paint"]').classList.toggle('unused', !paintUsed());   // faded when the tool doesn't paint with it

  // Symmetry panel: the mirror lines (each tool chooses whether it uses them, with the toggle in the bar)
  const h = S.mirror === 'h' || S.mirror === 'both', v = S.mirror === 'v' || S.mirror === 'both';
  addSym(well(`<button class="btn${h ? ' on' : ''}" data-symline="h" title="A left-right mirror (a vertical line)">↔ Left-right</button><button class="btn${v ? ' on' : ''}" data-symline="v" title="A top-bottom mirror (a horizontal line)">↕ Top-bottom</button>`));
  if (h || v) {
    addSym((h ? `<span class="label">↔ at</span><input type="text" class="symat" data-symat="x" value="${mirrorX()}" title="Where the left-right line is, in cells from the left (half cells: .5 runs through a cell)">` : '') +
      (v ? `<span class="label">↕ at</span><input type="text" class="symat" data-symat="y" value="${mirrorY()}" title="Where the top-bottom line is, in cells from the top">` : '') +
      well(`<button class="btn" data-mirrorcenter title="Put the lines back in the middle of the canvas (or drag the triangles at their ends)"${S.mirrorAt.x == null && S.mirrorAt.y == null ? ' disabled' : ''}>Center</button>`));
    addSym(well(`<button class="btn${S.mirrorFlip ? ' on' : ''}" data-tog="mirrorFlip" title="Flip characters: the mirrored copy turns / into \, ( into ) and so on">Flip characters</button>`));
  }
  const canMirror = MIRROR_TOOLS.includes(t), uses = canMirror && !!S.mirrorUse[t];
  $('[data-panel="sym"]').classList.toggle('unused', !uses || S.mirror === 'off');   // faded when the tool isn't mirroring
  // the tool's "uses mirror" toggle: the last thing in the bar, with the rest of its settings
  if (canMirror) add((bar.children.length ? sep : '') + well(`<button class="btn icon mirroruse${uses ? ' on' : ''}" data-mirroruse title="${uses ? `${toolName()} mirrors (click to stop). The lines are set up in the Symmetry panel` : `Mirror with ${toolName()} (set the lines up in the Symmetry panel)`}">${MIRROR_SVG}</button>`));

  for (const o of [bar, paint, sym]) bindOptions(o);
  renderSlots(); renderHelp(true); clipBar(); redraw();
}
// The bar never wraps or grows: if the window is too narrow, it fades out at the right edge.
function clipBar() { const b = $('#toolopts'); b.classList.toggle('clipped', b.scrollWidth > b.clientWidth + 1); }
window.addEventListener('resize', clipBar);
function bindOptions(o) {
  $$('[data-size]', o).forEach(b => b.addEventListener('click', () => setBrushSize(toolSize().size + +b.dataset.size)));
  const sz = $('.size', o); if (sz) sz.addEventListener('change', () => setBrushSize(+sz.value || 1));
  $$('[data-psmart]', o).forEach(b => b.addEventListener('click', () => { S.pencil.smart = b.dataset.psmart === '1'; savePrefs(); renderOptions(); updateInfo(); redraw(); }));
  $$('[data-pstyle]', o).forEach(b => b.addEventListener('click', () => { S.pencil.style = b.dataset.pstyle; savePrefs(); renderOptions(); }));
  const fb = $('.fontbtn', o); if (fb) fb.addEventListener('click', () => openFontMenu(fb));
  $$('[data-flayout]', o).forEach(b => b.addEventListener('click', () => setFigFont(S.figfont.name, b.dataset.flayout)));
  $$('[data-fsp]', o).forEach(b => b.addEventListener('click', () => { const k = b.dataset.fsp, f = figFont(S.figfont.name); setFigSpacing(k, clamp((S.figfont[k] || 0) + +b.dataset.d, k === 'ls' ? -3 : -((f ? f.height : 2) - 1), 20)); }));
  $$('[data-fws]', o).forEach(b => b.addEventListener('click', () => setFigFont(S.figfont.name, S.figfont.layout, b.dataset.fws)));
  $$('[data-mirroruse]', o).forEach(b => b.addEventListener('click', () => {
    const t = S.tool; if (!MIRROR_TOOLS.includes(t)) return;
    S.mirrorUse[t] = !S.mirrorUse[t]; savePrefs(); renderOptions(); redraw();
  }));
  $$('[data-tip]', o).forEach(b => b.addEventListener('click', () => { toolSize().tip = b.dataset.tip; savePrefs(); renderOptions(); redraw(); }));
  $$('[data-tog]', o).forEach(b => b.addEventListener('click', () => {   // an on / off setting, by its path in S
    const keys = b.dataset.tog.split('.'), last = keys.pop(), obj = keys.reduce((x, k) => x[k], S);
    obj[last] = !obj[last]; savePrefs(); renderOptions(); redraw();
  }));
  $$('[data-choice]', o).forEach(b => b.addEventListener('click', () => openChoice(b)));
  $$('[data-blank]', o).forEach(b => b.addEventListener('click', () => { S.spacesErase = b.dataset.blank === '1'; savePrefs(); renderOptions(); redraw(); }));
  const sf = $('.selfixed', o); if (sf) sf.addEventListener('change', () => { S.selFixed = sf.checked; sf.blur(); savePrefs(); });
  const sc = $('.selcenter', o); if (sc) sc.addEventListener('change', () => { S.selCenter = sc.checked; sc.blur(); savePrefs(); });
  $$('[data-shape]', o).forEach(b => b.addEventListener('click', () => setSelShape(b.dataset.shape)));
  $$('[data-symline]', o).forEach(b => b.addEventListener('click', () => {
    const h = S.mirror === 'h' || S.mirror === 'both', v = S.mirror === 'v' || S.mirror === 'both';
    const nh = b.dataset.symline === 'h' ? !h : h, nv = b.dataset.symline === 'v' ? !v : v;
    S.mirror = nh && nv ? 'both' : nh ? 'h' : nv ? 'v' : 'off'; savePrefs(); renderOptions(); redraw();
  }));
  $$('[data-symat]', o).forEach(inp => inp.addEventListener('change', () => {
    const ax = inp.dataset.symat, max = ax === 'x' ? S.w : S.h, v = clamp(Math.round((+inp.value || 0) * 2) / 2, 0, max);
    S.mirrorAt[ax] = v === max / 2 ? null : v; inp.blur(); changed(); renderOptions();
  }));
  const mf = $('.mirrorflip', o); if (mf) mf.addEventListener('change', () => { S.mirrorFlip = mf.checked; mf.blur(); savePrefs(); });
  const mc = $('[data-mirrorcenter]', o); if (mc) mc.addEventListener('click', () => { centerMirror(); renderOptions(); });
  $$('[data-insert]', o).forEach(b => b.addEventListener('click', () => setTypeInsert(b.dataset.insert === '1')));
  const fc = $('.fillcontig', o); if (fc) fc.addEventListener('change', () => { S.fillContig = fc.checked; fc.blur(); savePrefs(); redraw(); });
  $$('[data-picksample]', o).forEach(b => b.addEventListener('click', () => { S.pickSample = b.dataset.picksample; savePrefs(); renderOptions(); redraw(); }));
  const wc = $('.wandcontig', o); if (wc) wc.addEventListener('change', () => { S.wandContig = wc.checked; wc.blur(); savePrefs(); redraw(); });
  $$('[data-selsample]', o).forEach(b => b.addEventListener('click', () => { S.selSample = b.dataset.selsample; savePrefs(); renderOptions(); }));
  $$('[data-pmode]', o).forEach(b => b.addEventListener('click', () => { S.paint.mode = b.dataset.pmode; savePrefs(); renderOptions(); redraw(); }));
  $$('[data-sample]', o).forEach(b => b.addEventListener('click', () => { S.fillSample = b.dataset.sample; savePrefs(); renderOptions(); }));
  const rb = $('.rampbtn', o); if (rb) rb.addEventListener('click', () => openRampMenu(rb));
  const nb = $('.noisebtn', o); if (nb) nb.addEventListener('click', () => openNoiseMenu(nb));
  $$('.setgear', o).forEach(g => g.addEventListener('click', () => openSetPop(g.dataset.kind, g)));
  const dn = $('.density', o);
  if (dn) dn.addEventListener('input', () => { S.paint.noise.density = +dn.value; $('.dens', o).textContent = dn.value + '%'; savePrefs(); refreshSetPop(); });
  const pb = $('.patbtn', o); if (pb) pb.addEventListener('click', () => openPatternMenu(pb));
  const pmb = $('.paintbtn', o); if (pmb) pmb.addEventListener('click', () => openPaintMenu(pmb));
  bindShapeOptions(o);
  bindBrushStrokeOptions(o);
  bindBlockOptions(o);
  $$('[data-pblank]', o).forEach(b => b.addEventListener('click', () => {
    if (S.tool === 'fill') S.blanksFill = b.dataset.pblank; else S.blanksBrush = b.dataset.pblank;
    savePrefs(); renderOptions();
  }));
}

// ---------- Characters panel: the Draw and Right slots (TOOLBAR.md 5) ----------
// Draw is the brush character (the left button); Right is S.ch2 (the right button; null = erase, shown as Clear).
// The Draw and Right chips (the tool panel): one is selected; picking a character (palette, Picker, Alt-click) fills it,
// and right-click / Shift fills the other one
const otherSlot = () => S.activeSlot === 'draw' ? 'right' : 'draw';
function setSlot(slot, c) {
  if (slot === 'draw') { setBrushChar(c); if ((S.tool === 'brush' || S.tool === 'fill') && S.paint.mode !== 'char') { S.paint.mode = 'char'; savePrefs(); renderOptions(); redraw(); } }
  else { S.ch2 = !c || c === CLEAR ? null : c; savePrefs(); renderSlots(); renderOptions(); }
}
const pickInto = (c, other) => setSlot(other ? otherSlot() : S.activeSlot, c);
function selectSlot(slot) { if (S.activeSlot === slot) return; S.activeSlot = slot; savePrefs(); renderSlots(); }
function setCh2(c) { setSlot('right', c); }
function swapSlots() {
  const draw = S.brush.ch, right = S.ch2 || CLEAR;
  S.ch2 = draw === CLEAR ? null : draw; setBrushChar(right); savePrefs();
}
// Typing into a chip ends on Enter, Tab, Esc, a character, or a click anywhere else
function endChipTyping() {
  const w = $('#chipBox input:not([readonly])'); if (!w) return;
  w.readOnly = true; w.classList.remove('typing');
  if (document.activeElement === w) w.blur();
  renderSlots();
}
document.addEventListener('pointerdown', e => { if (!e.target.closest('#chipBox input:not([readonly])')) endChipTyping(); }, true);
// The chips at the bottom of the tool panel: Draw (top left) and Right (bottom right), overlapping; the selected one is
// in front. Click one to select it; double-click to type a character into it (Enter, Tab or a click elsewhere ends that).
function renderSlots() {
  const box = $('#chipBox'); if (!box) return;
  const editing = box.querySelector('input:not([readonly])'); if (editing) { markSolid(); return; }
  const chip = (slot, c, title) => `<input class="chipc ${slot}${S.activeSlot === slot ? ' sel' : ''}" data-slot="${slot}" readonly value="${esc(c)}" title="${title}">`;
  box.innerHTML = chip('right', S.ch2 || CLEAR, 'Right: what the right button paints (blue: erase). Click to select, double-click to type a character') +
    chip('draw', S.brush.ch, 'Draw: what the left button paints. Click to select, double-click to type a character') +
    `<button class="chipswap" title="Swap Draw and Right (X)">⇄</button>`;
  $('.chipswap', box).addEventListener('click', swapSlots);
  $$('input.chipc', box).forEach(w => {
    w.addEventListener('mousedown', e => { if (w.readOnly) e.preventDefault(); });   // (no text caret until a double-click)
    w.addEventListener('click', () => selectSlot(w.dataset.slot));
    w.addEventListener('dblclick', () => { selectSlot(w.dataset.slot); const e2 = $(`#chipBox input[data-slot="${w.dataset.slot}"]`); e2.readOnly = false; e2.classList.add('typing'); e2.focus(); e2.select(); });
    w.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); endChipTyping(); } });
    w.addEventListener('input', () => { const c = chars(w.value).filter(x => x !== ' ').pop(); endChipTyping(); if (c) setSlot(w.dataset.slot, c); });
    w.addEventListener('blur', () => endChipTyping());
  });
  markSolid();
}

// ---------- Help panel (TOOLBAR.md 3): the current tool's keys, live ----------
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
const keyLabel = k => ({ Ctrl: isMac ? 'Cmd' : 'Ctrl', Alt: isMac ? 'Option' : 'Alt', Right: 'Right-click' }[k] || k.replace(/_/g, ' '));
let helpKey = '';
function renderHelp(force) {
  const box = $('#help'); if (!box) return;
  const t = S.tool, d = S.drag, m = S.mods;
  const sub = t === 'select' ? (S.selShape === 'wand' ? 'wand' : S.selShape === 'polygon' ? 'polygon' : S.selShape === 'lasso' ? 'lasso' : 'select') : t;
  const H = HELP[sub] || { sum: '', keys: [] }, keys = typeof H.keys === 'string' ? HELP[H.keys].keys : H.keys;
  const dragging = d && ['rect', 'lasso', 'shape', 'float', 'paint', 'stroke'].includes(d.kind);
  const held = [m.shift && 'Shift', m.alt && 'Alt', m.cmd && 'Ctrl', S.spaceDown && 'Space'].filter(Boolean);
  // what's going on right now
  const state = [];
  if (S.float) state.push('Floating: Enter drops it, Esc puts it back.');
  const key = [sub, held.join('+'), dragging ? d.kind : '', state.join('|'), toolName()].join('/');
  if (!force && key === helpKey) return;
  helpKey = key;
  const list = (rows, live) => `<div class="help-list${live ? '' : ' help-any'}">` + rows.map(([k, what]) => {
    const toks = k.split(' '), mods = toks.filter(x => ['Shift', 'Alt', 'Ctrl', 'Space'].includes(x));
    const on = live && mods.length && mods.length === held.length && mods.every(x => held.includes(x));
    return `<span class="hk${on ? ' on' : ''}">${toks.map(x => `<b>${esc(keyLabel(x))}</b>`).join(' ')}</span><span class="hd">${esc(what)}</span>`;
  }).join('') + '</div>';
  const now = dragging && H.drag ? H.drag : keys;
  box.innerHTML = `<div class="help-tool">${esc(toolName())}</div><div class="help-sum">${esc(H.sum)}</div>` +
    (state.length ? `<div class="help-state">${state.map(esc).join('<br>')}</div>` : '') +
    (dragging && H.drag ? `<div class="help-sub">While dragging</div>` : '') +
    (now.length ? list(now, true) : '') +
    (!dragging && H.drag && H.drag.length ? `<div class="help-sub">While dragging</div>` + list(H.drag, false) : '') +   // (lights up once you drag)
    `<div class="help-sub">Any tool</div>` + list(HELP_ANY, false);
}


// ---------- right pane: fold panels by their titles, resize by the left edge (TOOLBAR.md 4) ----------
function applyPanels() {
  $$('#rightpane section[data-panel]').forEach(sec => sec.classList.toggle('folded', !!S.panels[sec.dataset.panel]));
  if (S.sideW) $('#rightpane').style.width = S.sideW + 'px';
}
$$('#rightpane section[data-panel] > h2').forEach(h => h.addEventListener('click', () => {
  const id = h.parentElement.dataset.panel; S.panels[id] = !S.panels[id]; applyPanels(); savePrefs();
}));
(() => {
  const grip = $('#sideGrip'), pane = $('#rightpane'); let d = null;
  grip.addEventListener('pointerdown', e => { try { grip.setPointerCapture(e.pointerId); } catch (_) {} d = { x: e.clientX, w: pane.offsetWidth }; grip.classList.add('drag'); e.preventDefault(); });
  grip.addEventListener('pointermove', e => { if (!d) return; S.sideW = clamp(d.w - (e.clientX - d.x), 240, 480); pane.style.width = S.sideW + 'px'; });
  const end = () => { if (!d) return; d = null; grip.classList.remove('drag'); savePrefs(); };
  grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
  grip.addEventListener('dblclick', () => { S.sideW = 0; pane.style.width = ''; savePrefs(); });
})();

// ---------- right-click menu on the canvas (TOOLBAR.md 2) ----------
// Right-click, for the tools that don't paint with the right button; Ctrl / Cmd + right-click (or Ctrl-click on a Mac) on those.
function openCtxMenu(x, y) {
  const m = $('#ctxMenu'), L0 = L(), items = [];
  const it = (cmd, label, k) => items.push(`<button class="btn" data-cmd="${cmd}">${label}${k ? ` <kbd>${k}</kbd>` : ''}</button>`), hr = () => items.push('<hr>');
  it('undo', 'Undo', 'Ctrl Z'); it('redo', 'Redo', 'Ctrl Shift Z'); hr();
  if (S.sel || S.float) { it('cut', 'Cut', 'Ctrl X'); it('copy', 'Copy', 'Ctrl C'); }
  it('paste', 'Paste', 'Ctrl V');
  if (S.sel) it('delete', 'Delete', 'Del');
  hr(); it('selectAll', 'Select all', 'Ctrl A'); it('selectCanvas', 'Select canvas', 'Ctrl Shift A');
  if (S.sel || S.float) {
    it('deselect', 'Deselect', 'Ctrl D'); it('fillSel', 'Fill selection', 'Alt Backspace');
    it('flipH', 'Flip horizontal'); it('flipV', 'Flip vertical');
    it('extrude', 'Extrude selection (beta)...'); it('makePattern', 'Make pattern from selection...');
  }
  if (S.float) { hr(); it('drop', 'Drop floating block', 'Enter'); it('dropReplace', 'Drop with solid white space', 'Shift Enter'); }
  if (L0 && L0.text) { hr(); it('rasterize', 'Rasterize text layer'); it('mergeDown', 'Merge down'); }
  if (S.tool === 'block' || S.blocks.dcells.size) { hr(); it('blocks3d', 'Edit blocks in 3D...'); if (S.blocks.dcells.size) { it('blocksBake', 'Bake blocks to a new layer'); it('blocksClear', 'Clear blocks'); } }
  m.innerHTML = items.join('').replace(/(<hr>)+/g, '<hr>').replace(/^<hr>|<hr>$/g, '').replace(/Ctrl /g, isMac ? 'Cmd ' : 'Ctrl ');
  m.hidden = false;
  m.style.left = Math.min(x, window.innerWidth - m.offsetWidth - 6) + 'px';
  m.style.top = Math.min(y, window.innerHeight - m.offsetHeight - 6) + 'px';
}
const closeCtxMenu = () => { $('#ctxMenu').hidden = true; };
vp.addEventListener('contextmenu', e => {
  e.preventDefault();
  if (rightButtonTool() && !(e.ctrlKey || e.metaKey)) return;   // these tools paint with the right button
  if (S.drag) return;
  openCtxMenu(e.clientX, e.clientY);
});
document.addEventListener('pointerdown', e => { if (!$('#ctxMenu').hidden && !e.target.closest('#ctxMenu')) closeCtxMenu(); }, true);
document.addEventListener('click', e => { if (e.target.closest('#ctxMenu [data-cmd]')) closeCtxMenu(); });
window.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#ctxMenu').hidden) { closeCtxMenu(); e.stopImmediatePropagation(); } }, true);
// Block: double-click the blocks to build them in the 3D editor
vp.addEventListener('dblclick', () => { if (S.tool === 'block') open3d(); });
// A few repeats of the pattern tile, for the options bar.
function patternPreview() {
  const { g, w, h } = patternGrid(), rows = [];
  for (let y = 0; y < Math.min(3, Math.max(h, 2)); y++) {
    let r = ''; for (let x = 0; x < Math.min(12, w * 3); x++) r += (g[y % h] || [])[x % w] || ' ';
    rows.push(r);
  }
  return rows.join('\n');
}
// The Select tool's shapes. The toolbox has two buttons for the one tool: Select (the marquee shapes) and Magic wand.
function setSelShape(s, quiet) {
  if (s !== 'wand') S.lastMarquee = s;
  if (S.selPoly && s !== 'polygon') S.selPoly = null;
  S.selShape = s; savePrefs();
  if (S.tool !== 'select') setTool('select'); else { renderOptions(); syncToolbox(); redraw(); }
  if (!quiet) toast('Select: ' + SEL_NAMES[s]);
}
function syncToolbox() {
  const wand = S.tool === 'select' && S.selShape === 'wand';
  $$('#toolbox .tool').forEach(b => b.classList.toggle('on', b.dataset.tool === 'wand' ? wand : b.dataset.tool === S.tool && !(S.tool === 'select' && wand)));
  // the Select button shows the shape it selects with (the last marquee shape; the Wand has its own button)
  const sel = $('#toolbox [data-tool="select"]'), shape = S.lastMarquee;
  if (sel && sel.dataset.shape !== shape) {
    sel.dataset.shape = shape;
    sel.querySelector('svg').innerHTML = shape === 'rect' ? '<rect x="3.5" y="3.5" width="13" height="13" stroke-dasharray="2.5 2"/>' : OPT_ICONS[{ ellipse: 'selEllipse', lasso: 'selLasso', polygon: 'selPoly' }[shape]];
    sel.title = `Select (M): ${SEL_NAMES[shape]} · Shift M cycles the shapes`;
  }
}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
$$('#toolbox .tool').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.tool === 'wand') setSelShape('wand', true);
  else if (b.dataset.tool === 'select' && S.selShape === 'wand') setSelShape(S.lastMarquee, true);
  else setTool(b.dataset.tool);
}));
$('#patSave').addEventListener('click', savePatternDraft);
$('#patCancel').addEventListener('click', closePatternDialog);
$('#patDlg').addEventListener('pointerdown', e => { if (e.target.id === 'patDlg') closePatternDialog(); });

// tool palette: drag by the grip, double-click to dock
(() => {
  const tb = $('#toolbox'), grip = $('.grip', tb);
  let d = null;
  grip.addEventListener('pointerdown', e => {
    grip.setPointerCapture(e.pointerId);
    d = { sx: e.clientX, sy: e.clientY, l: tb.offsetLeft, t: tb.offsetTop };
  });
  grip.addEventListener('pointermove', e => {
    if (!d) return;
    const ws = $('#workspace');
    tb.style.left = clamp(d.l + e.clientX - d.sx, 0, ws.clientWidth - tb.offsetWidth) + 'px';
    tb.style.top = clamp(d.t + e.clientY - d.sy, 0, ws.clientHeight - tb.offsetHeight) + 'px';
    tb.dataset.moved = '1';
  });
  grip.addEventListener('pointerup', () => { d = null; savePrefs(); });
  grip.addEventListener('dblclick', () => { tb.style.left = ''; tb.style.top = ''; delete tb.dataset.moved; savePrefs(); });
})();

// ---------- right pane ----------
// Marker next to the tool name when a selection limits what the tool can change.
function updateInfo() {
  const h = S.hover, f = S.float;
  let selTxt = '—';
  if (f) selTxt = `${f.w} x ${f.h} at ${f.x},${f.y} <span style="color:var(--c-float-ink)">floating</span>`;
  else if (S.sel) { const b = selBounds(S.sel); selTxt = `${b.w} x ${b.h} at ${b.x},${b.y}`; }
  $('#info').innerHTML =
    `<div><span class="k">Cell</span>${h ? `${h.x}, ${h.y}${h.x < 0 || h.y < 0 || h.x >= S.w || h.y >= S.h ? ' <span style="color:var(--mute)">(outside)</span>' : ''}` : '—'}</div>` +
    `<div><span class="k">Canvas</span>${S.w} x ${S.h}</div>` +
    `<div><span class="k">Selection</span>${selTxt}</div>` +
    (S.tool === 'type' && S.cursor ? `<div><span class="k">Cursor</span>${S.cursor.x}, ${S.cursor.y}</div>` : '') +
    `<div><span class="k">Layer</span>${esc(L() ? L().name : '')}</div>`;
}
function syncCanvasInputs() { $('#cw').value = S.w; $('#chh').value = S.h; }
function renderAnchor() { $$('#anchor .btn').forEach(b => b.classList.toggle('on', +b.dataset.a === S.anchor)); }
$$('#anchor .btn').forEach(b => b.addEventListener('click', () => { S.anchor = +b.dataset.a; renderAnchor(); }));
$('#applySize').addEventListener('click', () => resizeCanvas(+$('#cw').value, +$('#chh').value, S.anchor));
$('#sizePreset').addEventListener('change', e => {
  const v = e.target.value; e.target.value = ''; e.target.blur();
  if (!v) return;
  const [w, h] = v.split('x').map(Number);
  $('#cw').value = w; $('#chh').value = h;
});

function renderLayers() {
  checkTextLayers();
  const box = $('#layers');
  box.innerHTML = '';
  for (let i = S.layers.length - 1; i >= 0; i--) {
    const l = S.layers[i], row = document.createElement('div');
    row.className = 'layer' + (i === S.active ? ' on' : '');
    row.innerHTML = `<span class="eye${l.visible ? '' : ' off'}" title="Show / hide">${l.visible ? '◉' : '○'}</span>${l.text ? '<span class="ltag" title="A text layer: edit it with the Font tool (F). Merge down to make it plain art.">T</span>' : ''}<span class="name" title="Double-click to rename">${esc(l.name)}</span><span class="count">${l.cells.size}</span>`;
    row.addEventListener('click', e => {
      if (e.target.classList.contains('eye')) { l.visible = !l.visible; changed(true); return; }
      if (S.active !== i) { commitFloat(); S.active = i; renderLayers(); updateInfo(); redraw(); }
    });
    row.querySelector('.name').addEventListener('dblclick', () => {
      const nm = row.querySelector('.name'), inp = document.createElement('input');
      inp.type = 'text'; inp.value = l.name; nm.replaceWith(inp); inp.focus(); inp.select();
      const done = () => { const v = inp.value.trim(); if (v && v !== l.name) { pushUndo(); l.name = v; l.autoName = false; } changed(true); };
      inp.addEventListener('blur', done);
    });
    box.appendChild(row);
  }
  const on = box.querySelector('.layer.on'); if (on) on.scrollIntoView({ block: 'nearest' });   // keep the active layer in view
}
function updateLayerCounts() {
  // a text layer that stopped being text (painted on, moved in part, rasterized) loses its T: redraw the list
  checkTextLayers();
  const rows = $$('#layers .layer');
  if (rows.length !== S.layers.length || rows.some((r, n) => { const l = S.layers[S.layers.length - 1 - n]; return !l || !!r.querySelector('.ltag') !== !!l.text; })) return renderLayers();
  rows.forEach((r, n) => { const l = S.layers[S.layers.length - 1 - n]; if (l) r.querySelector('.count').textContent = l.cells.size; });
}

// ---------- top bar ----------
$('#focusChk').addEventListener('change', e => { e.target.blur(); if (e.target.checked !== S.focusLayer) CMDS.focusToggle(); });
$('#protectChk').addEventListener('change', e => { e.target.blur(); if (e.target.checked !== S.protectText) CMDS.protectToggle(); });
$('#themeSel').addEventListener('change', e => { setTheme(e.target.value); e.target.blur(); });
$('#fontSel').addEventListener('change', e => { setFont(e.target.value); e.target.blur(); });
$('#docname').addEventListener('change', () => { autosave(); });
function setTheme(t) { S.theme = t; document.body.dataset.theme = t; $('#themeSel').value = t; readColors(); savePrefs(); redraw(); }
function setFont(f) {
  S.font = f; $('#fontSel').value = f;
  const apply = () => { measure(); if (!S.viewTouched) zoomFit(); savePrefs(); redraw(); };
  apply();
  if (document.fonts && document.fonts.load) document.fonts.load(`${BASE_FONT_PX}px "${f}"`).then(apply, apply);
}

// ---------- update check: when hosted, offer a refresh if a newer version has been uploaded ----------
// dist/version.json is written by bump.js. Checked a few seconds after load, when you come back to the tab,
// and every 10 minutes. Not from a local file (the browser blocks it there), which is fine.
const verNum = v => { const [a, b] = String(v).split('.').map(n => parseInt(n, 10) || 0); return a * 10000 + b; };
let lastUpdateCheck = 0;
async function checkForUpdate(force) {
  if (location.protocol === 'file:') return;
  if (!force && Date.now() - lastUpdateCheck < 60000) return;
  lastUpdateCheck = Date.now();
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    const d = await r.json();
    if (!d || verNum(d.version) <= verNum(VERSION)) return;
    let dismissed = ''; try { dismissed = sessionStorage.getItem('asxii.dismissedUpdate') || ''; } catch {}
    if (dismissed === d.version) return;
    showUpdate(d.version, d.note);
  } catch {}
}
function showUpdate(v, note) {
  const b = $('#update');
  $('#updateText').textContent = `asXii v${v} is out` + (note ? ` · ${note}` : '');
  b.dataset.version = v;
  b.hidden = false;
}
$('#updateRefresh').addEventListener('click', () => { commitFloat(); autosave(); location.reload(); });
$('#updateClose').addEventListener('click', () => {
  const b = $('#update'); b.hidden = true;
  try { sessionStorage.setItem('asxii.dismissedUpdate', b.dataset.version || ''); } catch {}
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkForUpdate(); });
window.addEventListener('focus', () => checkForUpdate());
setInterval(() => checkForUpdate(true), 10 * 60 * 1000);
setTimeout(() => checkForUpdate(true), 4000);

let toastTimer = 0;
// kind 'warn': something you tried isn't allowed. Amber, a warning icon, and a shake every time (even if already showing).
function toast(msg, kind) {
  const t = $('#toast'), warn = kind === 'warn';
  t.textContent = msg;
  t.classList.toggle('warn', warn);
  t.classList.add('show');
  if (warn) shake(t);
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), warn ? 2600 : 1800);
}
function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

// ---------- start ----------
function welcomeArt() {
  // "asXii" in figlet's standard font, glyph by glyph
  const G = [
    ['       ', '  __ _ ', ' / _` |', '| (_| |', ' \\__,_|'],
    ['     ', ' ___ ', '/ __|', '\\__ \\', '|___/'],
    ['__  __', '\\ \\/ /', ' \\  / ', ' /  \\ ', '/_/\\_\\'],
    [' _ ', '(_)', '| |', '| |', '|_|'],
    [' _ ', '(_)', '| |', '| |', '|_|'],
  ];
  const rows = G[0].map((_, j) => G.map(g => g[j]).join(' '));
  rows.push('', 'v' + VERSION + ' - bare bones', '', 'T  type      P  pencil', 'M  select    V  move', 'B  brush     G  fill', 'Ctrl V pastes text here');
  return rows;
}
function start() {
  const p = loadPrefs() || {};
  readColors();
  if (p.theme) setTheme(p.theme); else readColors();
  S.font = p.font || S.font; $('#fontSel').value = S.font;
  if (typeof p.grid === 'boolean') S.grid = p.grid;
  $('#gridBtn').classList.toggle('on', S.grid);
  if (p.showSolid === false) S.showSolid = false;
  $('#solidBtn').classList.toggle('on', S.showSolid);
  if (p.brush) { Object.assign(S.brush, p.brush); if (S.brush.edge === 'paint') S.brush.edge = 'char'; }   // the old Outline Paint
  loadCustomBrushes();
  loadCustomRamps();
  loadCustomNoises();
  if (S.brush.taper === true && !S.brush.start) { S.brush.start = S.brush.end = 'linear'; }   // v0.30-0.32 Taper checkbox
  delete S.brush.taper;
  Object.assign(S.brush, cleanBrush(S.brush));
  if (typeof S.brush.preset !== 'string' || !brushByName(S.brush.preset)) S.brush.preset = 'Plain';
  if (SEL_SHAPES.includes(p.selShape)) S.selShape = p.selShape;
  if (SEL_SHAPES.includes(p.lastMarquee) && p.lastMarquee !== 'wand') S.lastMarquee = p.lastMarquee;
  if (p.wandContig === false) S.wandContig = false;
  if (p.selSample === 'all') S.selSample = 'all';
  if (p.fillContig === false) S.fillContig = false;
  if (p.pickSample === 'layer') S.pickSample = 'layer';
  if (typeof p.ch2 === 'string' && p.ch2) S.ch2 = p.ch2;
  if (['h', 'v', 'both'].includes(p.mirror)) S.mirror = p.mirror;
  if (p.mirrorFlip === false) S.mirrorFlip = false;
  if (p.mirrorUse && typeof p.mirrorUse === 'object') S.mirrorUse = { ...p.mirrorUse };
  if (p.activeSlot === 'right') S.activeSlot = 'right';
  if (p.panels && typeof p.panels === 'object') S.panels = { ...p.panels };
  if (p.sideW) S.sideW = clamp(+p.sideW || 0, 240, 480);
  applyPanels();
  S.typeInsert = !!p.typeInsert;
  S.selFixed = !!p.selFixed; S.selCenter = !!p.selCenter;
  if (p.blanksBrush === 'replace') S.blanksBrush = 'replace';
  if (p.blanksFill === 'through') S.blanksFill = 'through';
  loadCustomPatterns();
  if (p.fillSample === 'all') S.fillSample = 'all';
  if (p.paint && typeof p.paint === 'object') {
    if (['char', 'noise', 'pattern', 'ramp'].includes(p.paint.mode)) S.paint.mode = p.paint.mode;
    if (p.paint.ramp && typeof p.paint.ramp.set === 'string' && p.paint.ramp.name) S.paint.ramp = { name: String(p.paint.ramp.name), set: p.paint.ramp.set };   // (older saves had no name: they get the new Classic default)
    if (p.paint.noise && typeof p.paint.noise.set === 'string') S.paint.noise = { name: p.paint.noise.name ? String(p.paint.noise.name) : 'Custom', set: p.paint.noise.set, density: clamp(+p.paint.noise.density || 50, 5, 100) };
    if (p.paint.pattern && Array.isArray(p.paint.pattern.rows) && p.paint.pattern.rows.length) S.paint.pattern = { name: String(p.paint.pattern.name || 'Custom'), rows: p.paint.pattern.rows.map(String) };
  }
  if (Array.isArray(p.recent)) S.recent = p.recent.filter(c => typeof c === 'string' && c && c !== ' ').slice(0, 30);   // (opaque space counts)
  S.brush.size = clamp(Math.round(+S.brush.size) || 1, 1, 25);
  if (p.shape && typeof p.shape === 'object') {
    const q = p.shape;
    if (['rect', 'ellipse', 'line', 'polygon'].includes(q.kind)) S.shape.kind = q.kind;
    if (RECT_STYLES[q.rect]) S.shape.rect = q.rect;
    if (ELLIPSE_STYLES[q.ellipse]) S.shape.ellipse = q.ellipse;
    if (LINE_STYLES[q.line]) S.shape.line = q.line;
    S.shape.fixed = !!q.fixed; S.shape.center = !!q.center; S.shape.fill = !!q.fill;
    if (POLY_STYLES[q.polygon]) S.shape.polygon = q.polygon;
  }
  S.b3big = p.b3big === true;
  if (['plain', 'axes', 'height'].includes(p.b3color)) S.b3color = p.b3color;
  if (p.b3brush && typeof p.b3brush === 'object') S.b3shape = { kind: String(p.b3brush.kind || 'block'), params: p.b3brush.params && typeof p.b3brush.params === 'object' ? p.b3brush.params : {}, turn: p.b3brush.turn & 3 };
  if (Array.isArray(p.myShapes)) S.myShapes = p.myShapes.filter(m => m && typeof m.name === 'string' && Array.isArray(m.cells));
  if (p.galWs && ['clear', 'shape', 'box'].includes(p.galWs.mode)) S.galWs = { mode: p.galWs.mode, gap: clamp(p.galWs.gap | 0, 0, 4) };
  if (p.figfont && (window.ASXII_FONTS || {})[p.figfont.name]) S.figfont = { name: p.figfont.name, layout: ['default', 'full', 'fit', 'smush'].includes(p.figfont.layout) ? p.figfont.layout : 'default', ws: ['inside', 'block'].includes(p.figfont.ws) ? p.figfont.ws : 'clear', ls: clamp(p.figfont.ls | 0, -3, 20), lh: clamp(p.figfont.lh | 0, -30, 20) };
  if (p.pencil) S.pencil = { size: clamp(Math.round(+p.pencil.size) || 1, 1, 25), tip: p.pencil.tip === 'round' ? 'round' : 'square', smart: !!p.pencil.smart, style: SMART_STYLES[p.pencil.style] ? p.pencil.style : 'ascii' };
  renderSlots();
  S.spacesErase = !!p.spacesErase;
  // "Dim others" is on by default
  S.focusLayer = p.dimOthers !== false; $('#focusChk').checked = S.focusLayer;
  S.protectText = p.protectText !== false; $('#protectChk').checked = S.protectText;
  if (p.toolbox) { const tb = $('#toolbox'); tb.style.left = p.toolbox.l; tb.style.top = p.toolbox.t; tb.dataset.moved = '1'; }

  let loaded = false;
  if (!new URLSearchParams(location.search).has('fresh')) {
    try { const d = JSON.parse(localStorage.getItem(PROJECT_KEY)); if (d) { loadProject(d); loaded = true; } } catch {}
  }
  if (!loaded) {   // a first visit: the welcome document (drawn from welcomeArt until start.js has loaded, or if it can't)
    S.layers = [makeLayer('Layer 1')];
    const art = welcomeArt(), ox = 4, oy = 3;
    art.forEach((r, j) => chars(r).forEach((c, i) => setCell(S.layers[0], ox + i, oy + j, c)));
    loadStart().then(st => { if (st.welcome && !S.undo.length && !S.float && S.tool === 'select' && !S.drag) { loadProject(welcomeDoc(st)); changed(true); clearTimeout(saveTimer); zoomFit(); } });   // showing the welcome isn't an edit: don't autosave it over anything
  }
  fitView(); measure();
  renderLayers(); renderCharPane(); syncCanvasInputs(); renderAnchor();
  S.tool = '';
  initGallery();
  setTool('select');
  zoomFit();
  requestAnimationFrame(() => { if (!S.viewTouched) zoomFit(); });   // again once layout has settled
  updateInfo();
  // Resizing the window keeps the zoom and keeps the view centered (it doesn't re-fit)
  // A size under 80 px isn't a real layout (a hidden tab can report one): skip it, and keep centering on the last real size.
  let vpSize = [vp.clientWidth, vp.clientHeight];
  new ResizeObserver(() => {
    const w = vp.clientWidth, h = vp.clientHeight;
    if (w < 80 || h < 80) return;
    if (vpSize[0] < 80 || vpSize[1] < 80) { if (!S.viewTouched) zoomFit(); }   // first real layout: fit once
    else { S.offX += (w - vpSize[0]) / 2; S.offY += (h - vpSize[1]) / 2; }
    vpSize = [w, h];
    // Resizing the canvas wipes it, and this runs after the frame's drawing: draw now, or the next paint shows it blank (a flicker)
    fitView(); render(); dirty = false;
  }).observe(vp);
  if (document.fonts && document.fonts.load) document.fonts.load(`${BASE_FONT_PX}px "${S.font}"`).then(() => { measure(); if (!S.viewTouched) zoomFit(); redraw(); }, () => {});
  requestAnimationFrame(loop);
}

// Hooks for the headless self-test (index.html?selftest)
window.asxii = { S, CMDS, loadStart, showWelcome, loadB3Example, openB3Examples, placeBlocksInView, openB3Brush, closeB3Brush, b3brushLabel, b3brushRemove, b3removeCells, focus3d, b3dFrame, qView, camTurnTilt, b3dFloorAt, b3dProj, B3D_SHAPES, b3shapeCells, b3shapeGhost, b3shapePlace, setB3Tool, b3shapeTurn, gal, artSolid, setGalWs, loadGallery, openGallery, closeGallery, galPreview, galAdd, galStep, figRender, figFont, textCells, textIntact, textBox, editingText, endTextEdit, setFigFont, openFontMenu, strokeOutline, traceOutlines, smartPath, polyShape, preBake, setCamView, cam, open3d, close3d, preview3d, render3d, b3dFaces, b3dPick, placeBlocksInView, dkey, dparse, line4, diagBake, diagAt, diagXY, extrudeCells, extrude, applyExtrude, openExtrude, openBlockPop, blockPreview, bakeCells, SOLID, blockOutlineMap, blockFaceMap, bakeBlocks, blockFaces, openSetPop, setPopEdited, allNoises, setNoise, noisePatch, openNoiseMenu, allRamps, setRamp, rampMirror, openRampMenu, setBrushPreset, allBrushes, brushThumb, brushEdited, openBrushPop, openBrushMenu, rampChar, strokeRegion, strokeCells, commitStroke, mergedSelectionText, rectShape, ellipseShape, polyShape, commitShape, finishPolygon, currentShape, dragBox, floodFill, fillSelection, paintChar, setPattern, openPatternDialog, savePatternDraft, closePatternDialog, allPatterns, applyCells, ellipseCells, lassoCells, setSelShape, setTool, moveOutline, liftForMove, nudge, setCursor, typeChar, applyRect, liftSelection, moveFloat, commitFloat, cancelFloat,
  floatFromText, selectionText, deleteSelection, flip, stamp, resizeCanvas, canvasText, codeLines, projectData, loadProject,
  undo, redo, pushUndo, compositeAt, setBrushChar, setBrushSize, render };

start();
})();
