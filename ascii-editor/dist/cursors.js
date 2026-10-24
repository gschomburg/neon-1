// asXii cursors: drawn like the toolbox icons (20 x 20 grid, round 1.5 strokes). A cursor is a tool glyph plus an
// optional badge in the bottom-right corner for the mode (+ adds, − takes away...). Dark ink on a white halo, so they
// read on every theme. Shared by the editor (app.js) and the cursor gallery (cursors.html).
// The plan and the checklist: ascii-editor/CURSORS.md.
'use strict';
window.ASXII_CURSORS = (() => {

const GLYPHS = {   // d: the path on the toolbox's 20 grid; hot: the click point on that grid
  cross: { name: 'Crosshair', d: 'M10 2.5v5M10 12.5v5M2.5 10h5M12.5 10h5', hot: [10, 10] },
  fine: { name: 'Fine crosshair', d: 'M10 5.5v3M10 11.5v3M5.5 10h3M11.5 10h3', hot: [10, 10] },   // the paint tools: the brush outline on the canvas does the rest
  move: { name: 'Move', d: 'M10 2.5v15M2.5 10h15M10 2.5 8 4.5M10 2.5l2 2M10 17.5l-2-2M10 17.5l2-2M2.5 10l2-2M2.5 10l2 2M17.5 10l-2-2M17.5 10l-2 2', hot: [10, 10] },
  arrow: { name: 'Arrow', d: 'M3.5 2.5v13l3.4-3.2 2.4 5.2 2.2-1-2.4-5.1h4.6z', hot: [3.5, 2.5], fill: true },
  lasso: { name: 'Lasso', d: 'M7.5 10.6C3.5 9.6 4 3 11 3s7.5 7.5 0 7.5c-2.3 0-3.8 1.3-3.3 2.8s-.6 3.2-3.2 3.7', hot: [4.5, 17] },
  bucket: { name: 'Bucket', d: 'M4 9.5 9.5 4l6 6-5.5 5.5a1.4 1.4 0 0 1-2 0l-4-4a1.4 1.4 0 0 1 0-2zM4 9.5h11.5M8 2.5l1.5 1.5M17 13.5s1.5 1.8 1.5 2.8a1.5 1.5 0 0 1-3 0c0-1 1.5-2.8 1.5-2.8z', hot: [17, 17.5], badgeLeft: true },   // the drip is the click point: badges go bottom-left, off it
  picker: { name: 'Eyedropper', d: 'M17.2 5a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0zM11.6 5.6l2.8 2.8M13 7 5.2 14.8 3.5 16.5M5.2 14.8l-.6 1.9', hot: [3.5, 16.5] },
  cube: { name: 'Cube', d: 'M4 7.5h8.5V16H4zM4 7.5 7.5 4H16v8.5L12.5 16M12.5 7.5 16 4', hot: [10, 10] },
  orbit: { name: 'Orbit', d: 'M16.5 10a6.5 6.5 0 1 1-1.9-4.6M15 2.5v3.2h-3.2', hot: [10, 10] },
  wand: { name: 'Magic wand', d: 'M3 17 11.5 8.5M14.5 1.5q.5 3.5 4 4-3.5.5-4 4-.5-3.5-4-4 3.5-.5 4-4z', hot: [14.5, 5.5] },   // option W2, Sparkle (the user's pick, 2026-10-24)
  polylasso: { name: 'Polygon lasso', d: 'M7 10.5 3.5 6 9 2.5l8 2.5-2 6zM7 10.5C5.5 11.5 5 13.2 5.5 14.5S5 17 3.5 17.5', hot: [3.5, 17.5] },
  moveH: { name: 'Move left-right', d: 'M2.5 10h15M2.5 10 5 7.5M2.5 10 5 12.5M17.5 10 15 7.5M17.5 10 15 12.5', hot: [10, 10] },
  moveV: { name: 'Move up-down', d: 'M10 2.5v15M10 2.5 7.5 5M10 2.5 12.5 5M10 17.5 7.5 15M10 17.5l2.5-2.5', hot: [10, 10] },
  eraser: { name: 'Eraser', d: 'm8 16.5-4.3-4.3a1.4 1.4 0 0 1 0-2L10.9 3a1.4 1.4 0 0 1 2 0l4.1 4.1a1.4 1.4 0 0 1 0 2l-7.4 7.4H17M6 7.9l6 6', hot: [6, 14.5] },
  zoomin: { name: 'Zoom in', d: 'M14 8.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zM12.5 12.5l4.5 4.5M6 8.5h5M8.5 6v5', hot: [8.5, 8.5] },
  zoomout: { name: 'Zoom out', d: 'M14 8.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zM12.5 12.5l4.5 4.5M6 8.5h5', hot: [8.5, 8.5] },
};
const BADGES = {   // drawn on the 24 x 24 image itself, in the corner; a = the stroke attributes
  plus: { name: 'plus', draw: a => `<path d="M15.5 19h6M18.5 16v6" ${a}/>` },
  minus: { name: 'minus', draw: a => `<path d="M15.5 19h6" ${a}/>` },
  ring: { name: 'ring', draw: a => `<circle cx="18.5" cy="19" r="2.8" ${a}/>` },
  rect: { name: 'rectangle', draw: a => `<rect x="15.5" y="16" width="6" height="6" rx=".5" ${a}/>` },
  ellipse: { name: 'ellipse', draw: a => `<circle cx="18.5" cy="19" r="3" ${a}/>` },
  line: { name: 'line', draw: a => `<path d="M15.5 22l6-6" ${a}/>` },
  polygon: { name: 'polygon', draw: a => `<path d="M18.5 15.8l3.2 6.2h-6.4z" ${a}/>` },
  dashbox: { name: 'dashed box', draw: (a, ink) => `<rect x="15" y="15.5" width="7" height="7" ${a}${ink ? ' stroke-dasharray="2 1.6"' : ''}/>` },
  layer: { name: 'layers', draw: a => `<path d="M14.5 18l4-2 4 2-4 2zM14.5 20.5l4 2 4-2" ${a}/>` },
  times: { name: 'times', draw: a => `<path d="M16 16.5l5 5M21 16.5l-5 5" ${a}/>` },
  dots: { name: 'dots (every match)', draw: a => `<circle cx="16" cy="17" r=".8" ${a}/><circle cx="21" cy="17" r=".8" ${a}/><circle cx="16" cy="21.5" r=".8" ${a}/><circle cx="21" cy="21.5" r=".8" ${a}/>` },
  lock: { name: 'lock', draw: a => `<path d="M15.8 19h5.4v3.6h-5.4zM17 19v-1.4a1.5 1.5 0 0 1 3 0V19" ${a}/>` },
  two: { name: 'two', draw: a => `<path d="M16.3 17.3a2.2 2.2 0 1 1 3.5 1.8L16.3 22.3h4.6" ${a}/>` },
  charA: { name: 'letter A', draw: a => `<path d="M15.8 22.3l2.7-6.6 2.7 6.6M16.8 20.1h3.4" ${a}/>` },
  mirror: { name: 'mirror', draw: (a, ink) => `<path d="M18.5 15v8" ${a}${ink ? ' stroke-dasharray="1.6 1.4"' : ''}/><path d="M16.8 17l-2.3 2 2.3 2zM20.2 17l2.3 2-2.3 2z" ${a}/>` },
  wait: { name: 'pending (clock)', draw: a => `<circle cx="18.5" cy="19" r="3.2" ${a}/><path d="M18.5 17.4V19l1.2.9" ${a}/>` },
};
const INK = '#151515', HALO = '#ffffff', SCALE = 0.85, OFF = 1.5, SIZE = 24;

// The image for a glyph + badge (+ dimmed), as SVG markup
// glyph: a name from GLYPHS, or a glyph object itself ({ d, hot, fill, badgeLeft }), like the options below
// g.ink: parts filled solid ink (drawn over the white body that fill: true gives)
const glyphOf = glyph => typeof glyph === 'string' ? GLYPHS[glyph] : glyph;
function svg(glyph, badge, dim) {
  const g = glyphOf(glyph), st = (c, w) => `fill="none" stroke="${c}" stroke-width="${w}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" stroke-linecap="round" stroke-linejoin="round"${dim ? ' opacity=".45"' : ''}>` +
    `<g transform="translate(${OFF} ${OFF}) scale(${SCALE})"><path d="${g.d}" fill="${g.fill ? HALO : 'none'}" stroke="${HALO}" stroke-width="4"/><path d="${g.d}" ${st(INK, 1.6)}/>` +
    (g.ink ? `<path d="${g.ink}" fill="${INK}" stroke="${INK}" stroke-width="1.6"/>` : '') + '</g>' +
    (badge ? `<g${g.badgeLeft ? ' transform="translate(-13 0)"' : ''}>` + BADGES[badge].draw(st(HALO, 3.4), false) + BADGES[badge].draw(st(INK, 1.4), true) + '</g>' : '') + '</svg>';
}
// The click point on the 24 x 24 image
const hotspot = glyph => glyphOf(glyph).hot.map(v => Math.round(OFF + v * SCALE));

// A CSS cursor value, ending in a built-in fallback in case the image doesn't load
const cache = new Map();
function css(glyph, badge, dim, fallback = 'crosshair') {
  const key = [typeof glyph === 'string' ? glyph : JSON.stringify([glyph.d, glyph.ink, glyph.fill, glyph.hot, glyph.badgeLeft]), badge, !!dim, fallback].join('|');
  if (!cache.has(key)) {
    const [hx, hy] = hotspot(glyph);
    cache.set(key, `url("data:image/svg+xml,${encodeURIComponent(svg(glyph, badge, dim))}") ${hx} ${hy}, ${fallback}`);
  }
  return cache.get(key);
}

// Every cursor the editor uses, with where it shows up (the gallery lists these). native: a browser cursor, not ours.
const VARIANTS = [
  { group: 'Select', glyph: 'cross', badge: 'rect', use: 'Select, Rectangle: new selection' },
  { group: 'Select', glyph: 'cross', badge: 'ellipse', use: 'Select, Ellipse: new selection' },
  { group: 'Select', glyph: 'cross', badge: 'plus', use: 'Select, Rectangle or Ellipse: Shift adds to the selection' },
  { group: 'Select', glyph: 'cross', badge: 'minus', use: 'Select, Rectangle or Ellipse: Option / Alt takes away' },
  { group: 'Select', glyph: 'lasso', badge: null, use: 'Select, Lasso: new selection' },
  { group: 'Select', glyph: 'lasso', badge: 'plus', use: 'Select, Lasso: Shift adds' },
  { group: 'Select', glyph: 'lasso', badge: 'minus', use: 'Select, Lasso: Option / Alt takes away' },
  { group: 'Select', glyph: 'cross', badge: 'times', use: 'Select, Rectangle or Ellipse: Shift + Alt keeps only the overlap' },
  { group: 'Select', glyph: 'lasso', badge: 'times', use: 'Select, Lasso: Shift + Alt keeps only the overlap' },
  { group: 'Select', glyph: 'polylasso', badge: null, use: 'Select, Polygon: click the corners' },
  { group: 'Select', glyph: 'polylasso', badge: 'plus', use: 'Select, Polygon: Shift adds' },
  { group: 'Select', glyph: 'polylasso', badge: 'minus', use: 'Select, Polygon: Alt takes away' },
  { group: 'Select', glyph: 'polylasso', badge: 'times', use: 'Select, Polygon: Shift + Alt keeps only the overlap' },
  { group: 'Select', glyph: 'polylasso', badge: 'ring', use: 'Select, Polygon: over the first point, a click closes it' },
  { group: 'Select', glyph: 'wand', badge: null, use: 'Magic wand: click selects the connected cells with the same character' },
  { group: 'Select', glyph: 'wand', badge: 'dots', use: 'Magic wand, Contiguous off: selects every cell with that character' },
  { group: 'Select', glyph: 'wand', badge: 'plus', use: 'Magic wand: Shift adds' },
  { group: 'Select', glyph: 'wand', badge: 'minus', use: 'Magic wand: Alt takes away' },
  { group: 'Select', glyph: 'wand', badge: 'times', use: 'Magic wand: Shift + Alt keeps only the overlap' },
  { group: 'Select', glyph: 'move', badge: null, use: 'Select or Shape, Space held mid-drag: moves the box you are drawing' },
  { group: 'Select', glyph: 'arrow', badge: 'dashbox', use: 'Select: over the selection, drag moves the outline only' },
  { group: 'Select', glyph: 'move', badge: null, use: 'Select with Cmd / Ctrl held: drag moves the content' },
  { group: 'Move', glyph: 'move', badge: null, use: 'Move: drag the selection (also Block: move the blocks)' },
  { group: 'Move', glyph: 'move', badge: 'layer', use: 'Move, nothing selected: drag moves the whole layer' },
  { group: 'Move', glyph: 'move', badge: 'plus', use: 'Move with Alt (or Select with Ctrl + Alt): drag moves a copy' },
  { group: 'Move', glyph: 'move', badge: 'lock', use: 'Move with Shift: the drag locks to one direction' },
  { group: 'Move', glyph: 'moveH', badge: null, use: 'Move, Shift-drag: locked left-right' },
  { group: 'Move', glyph: 'moveV', badge: null, use: 'Move, Shift-drag: locked up-down' },
  { group: 'Move', glyph: 'arrow', badge: 'layer', use: 'Move with Ctrl / Cmd: a click picks the layer under the pointer' },
  { group: 'Pencil, Brush, Eraser', glyph: 'fine', badge: null, use: 'Pencil, Brush, Eraser: painting (the brush outline shows the cells)' },
  { group: 'Pencil, Brush, Eraser', glyph: 'fine', badge: 'wait', use: 'Brush, Taper / Outline / Ramp: the stroke lands when you let go' },
  { group: 'Pencil, Brush, Eraser', glyph: 'fine', badge: 'line', use: 'Shift held: a click draws a straight line from the last stroke' },
  { group: 'Pencil, Brush, Eraser', glyph: 'fine', badge: 'mirror', use: 'Mirror on: paints a mirrored copy too' },
  { group: 'Pencil, Brush, Eraser', glyph: 'moveH', badge: null, use: 'Mirror on, over the left-right line\'s handle (a triangle above or below the canvas): drag to move the line (same image as Move, Shift-drag)' },
  { group: 'Pencil, Brush, Eraser', glyph: 'moveV', badge: null, use: 'Mirror on, over the top-bottom line\'s handle (a triangle left or right of the canvas): drag to move the line' },
  { group: 'Pencil, Brush, Eraser', glyph: 'eraser', badge: null, use: 'Pencil or Brush, right-drag: erases (the right-button character is Erase)' },
  { group: 'Pencil, Brush, Eraser', glyph: 'fine', badge: 'two', use: 'Pencil or Brush, right-drag: paints the right-button character' },
  { group: 'Pencil, Brush, Eraser', glyph: 'eraser', badge: 'charA', use: 'Eraser, right-drag: erases only the brush character' },
  { group: 'Pencil, Brush, Eraser', glyph: 'picker', badge: null, use: 'Pencil, Brush or Fill with Alt held: a click picks a character (same image as the Picker)' },
  { group: 'Shape', glyph: 'cross', badge: 'rect', use: 'Shape: Rectangle (same image as Select, Rectangle)' },
  { group: 'Shape', glyph: 'cross', badge: 'ellipse', use: 'Shape: Ellipse (same image as Select, Ellipse)' },
  { group: 'Shape', glyph: 'cross', badge: 'line', use: 'Shape: Line' },
  { group: 'Shape', glyph: 'cross', badge: 'polygon', use: 'Shape: Polygon' },
  { group: 'Shape', glyph: 'cross', badge: 'ring', use: 'Shape, Polygon: over the first point, a click closes the shape' },
  { group: 'Fill', glyph: 'bucket', badge: null, use: 'Fill: Look at Layer' },
  { group: 'Fill', glyph: 'bucket', badge: 'layer', use: 'Fill: Look at All (every visible layer)' },
  { group: 'Fill', glyph: 'bucket', badge: 'dots', use: 'Fill: every matching cell (Contiguous off, or Shift-click)' },
  { group: 'Picker', glyph: 'picker', badge: null, use: 'Picker, Look at Layer: over a character' },
  { group: 'Picker', glyph: 'picker', badge: 'layer', use: 'Picker, Look at All (the default): over a character' },
  { group: 'Picker', glyph: 'picker', badge: 'two', use: 'Picker with Shift (or a right-click): picks the right-button character' },
  { group: 'Picker', glyph: 'picker', badge: null, dim: true, use: 'Picker: over an empty cell (nothing to pick)' },
  { group: 'Zoom', glyph: 'zoomin', badge: null, use: 'Zoom: a click zooms in' },
  { group: 'Zoom', glyph: 'zoomout', badge: null, use: 'Zoom with Alt held: a click zooms out' },
  { group: 'Block', glyph: 'cube', badge: null, use: 'Block, no blocks yet: a click opens the 3D editor' },
  { group: '3D editor', glyph: 'cross', badge: 'plus', use: '3D editor, Add: click a face to add a block' },
  { group: '3D editor', glyph: 'cross', badge: 'minus', use: '3D editor, Remove (or Shift held): click a block to remove it' },
  { group: '3D editor', glyph: 'orbit', badge: null, use: '3D editor: Option / Alt held, or right-drag: turn the view' },
  { group: 'Browser cursors (not drawn)', native: 'text', use: 'Type: place the caret' },
  { group: 'Browser cursors (not drawn)', native: 'grab', use: 'Hand tool, or Space held (also middle button), in the editor and the 3D editor' },
  { group: 'Browser cursors (not drawn)', native: 'grabbing', use: 'While panning' },
  { group: 'Browser cursors (not drawn)', native: 'not-allowed', use: 'A drawing tool outside the selection; Fill outside the canvas' },
];

// Redraw candidates for the Magic wand and the Eyedropper, to pick from in the gallery (the user, 2026-10-24).
// Same 20 x 20 grid and strokes as the rest. Not used by the editor.
// E8 (Photoshop-style eyedropper) in parts, so parts can be solid ink
const E8 = {
  bulb: 'M12.5 5.1 15.1 2.5A1.7 1.7 0 0 1 17.5 2.5 1.7 1.7 0 0 1 17.6 4.9L15 7.5z',
  collar: 'M11.5 4.1 10.1 5.5 14.6 9.9 16 8.5z',
  tube: 'M11.1 6.5 4.5 13 4 16 7 15.5 13.6 8.9z',
  tip: 'M5.4 12.1 4.5 13 4 16 7 15.5 7.9 14.6z',
  liquid: 'M7.5 10.1 4.5 13 4 16 7 15.5 10 12.5z',
};
const e8 = (name, ...ink) => ({ name, d: E8.bulb + E8.collar + E8.tube, ink: ink.map(k => E8[k]).join('') || undefined, hot: [4, 16], fill: true });
const OPTIONS = {
  pickerE8: [
    e8('E8 as drawn (white)'),
    e8('Black bulb', 'bulb'),
    e8('Black bulb and collar', 'bulb', 'collar'),
    e8('Black collar', 'collar'),
    e8('Black tip', 'tip'),
    e8('Black bulb and tip', 'bulb', 'tip'),
    e8('Black collar and tip', 'collar', 'tip'),
    e8('Liquid in the tube', 'liquid'),
    e8('Black bulb and liquid', 'bulb', 'liquid'),
    e8('Solid black', 'bulb', 'collar', 'tube'),
  ],
  wand: [
    { name: 'Star tip', d: 'M3 17 11.8 8.2M14.5 1.5l1.06 2.54 2.74.22-2.09 1.8.64 2.68-2.35-1.44-2.35 1.44.64-2.68-2.09-1.8 2.74-.22z', hot: [14.5, 5.5] },
    { name: 'Sparkle', d: 'M3 17 11.5 8.5M14.5 1.5q.5 3.5 4 4-3.5.5-4 4-.5-3.5-4-4 3.5-.5 4-4z', hot: [14.5, 5.5] },
    { name: 'Band and rays', d: 'M3.5 16.5 12 8M10 6l4 4M15.5 4.5 17 3M16.5 7.5h2M12.5 3.5V2', hot: [13, 7] },
    { name: 'Three sparkles', d: 'M3 17l8-8M14 3v6M11 6h6M17.5 9v2.5M16.25 10.25h2.5M10 1.5v2M9 2.5h2', hot: [14, 6] },
    { name: 'Burst', d: 'M3 17l9-9M13.5 3V1.5M16.5 6.5H18M15.8 4.2l1-1M11.2 4.2l-1-1M15.8 8.8l1 1', hot: [13.5, 6.5] },
    { name: 'Knob and rays', d: 'M3 17l8.5-8.5M15.5 6.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM13.5 2v1.5M18 6.5h-1.5M16.7 3.3l-1 1', hot: [13.5, 6.5] },
    { name: 'Big star', d: 'M3.5 16.5l6-6M13 1.5l1.41 3.56 3.82.24-2.95 2.44.95 3.71L13 9.4l-3.23 2.05.95-3.71L7.77 5.3l3.82-.24z', hot: [13, 7] },
    { name: 'Asterisk', d: 'M3 17l9-9M14.5 2.5v6M11.9 4l5.2 3M11.9 7l5.2-3', hot: [14.5, 5.5] },
    { name: 'Rod and diamond', d: 'M2.8 15.7 11 7.5M4.3 17.2 12.5 9M2.8 15.7l1.5 1.5M11 7.5l1.5 1.5M15 2.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z', hot: [15, 5.5] },
    { name: 'Ring target', d: 'M3 17l8.5-8.5M17.5 5.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM14.5 5.5h.01', hot: [14.5, 5.5] },
  ],
  picker: [
    { name: 'Classic dropper', d: 'M13.5 2.5a2.1 2.1 0 0 1 3 0l1 1a2.1 2.1 0 0 1 0 3l-2 2-4-4zM10.5 5.5l4 4M11.5 7.5l-7 7-1 2 2-1 7-7', hot: [3.5, 16.5] },
    { name: 'Filled pipette', d: 'M16.8 3.2a2.5 2.5 0 0 1 0 3.5L14 9.5 10.5 6l2.8-2.8a2.5 2.5 0 0 1 3.5 0zM12 7.5 4.5 15l-1 2 2-1L13 8.5', hot: [3.5, 17], fill: true },
    { name: 'With a drop', d: 'M12 7 5.5 13.5 5 15l1.5-.5L13 8M12 4.5 15.5 8M13.5 5.5l2-2a1.8 1.8 0 0 1 2.5 2.5l-2 2M3.5 16.5s-1.2 1.4-1.2 2.1a1.2 1.2 0 0 0 2.4 0c0-.7-1.2-2.1-1.2-2.1z', hot: [5.2, 14.8] },
    { name: 'Straight down', d: 'M8 2.5h4a1 1 0 0 1 1 1V6H7V3.5a1 1 0 0 1 1-1zM6 6h8M8.5 6v8L10 17.5l1.5-3.5V6', hot: [10, 17.5] },
    { name: 'Chunky', d: 'M14.6 2.9a2 2 0 0 1 2.8 2.8l-2.4 2.4-2.8-2.8zM11 6.5l2.5 2.5M12.2 7.7 5.5 14.4 3.5 16.5l2.1-2 6.7-6.7', hot: [3.5, 16.5] },
    { name: 'Line and ring', d: 'M17.5 4.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6 3.5 16.5', hot: [3.5, 16.5] },
    { name: 'Liquid level', d: 'M11.5 6.5 4 14v2h2l7.5-7.5zM10 5.5l4.5 4.5M12.5 5.5l2-2a1.6 1.6 0 0 1 2.2 2.2l-2 2M6 12l2 2', hot: [4, 16] },
    { name: 'Photoshop-style', d: 'M17.5 2.5a1.7 1.7 0 0 0-2.4 0l-2.6 2.6-1-1-1.4 1.4 1 1L4.5 13l-.5 3 3-.5 6.6-6.6 1 1 1.4-1.4-1-1 2.6-2.6a1.7 1.7 0 0 0 0-2.4z', hot: [4, 16] },
    { name: 'Ring at the tip', d: 'M17 3a2 2 0 0 0-2.8 0l-2 2L15 7.8l2-2A2 2 0 0 0 17 3zM11.4 5.8l2.8 2.8M12.8 7.2 7 13M7.5 14.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z', hot: [5.5, 14.5] },
    { name: 'Square bulb', d: 'M14 3h3v3h-3zM12.5 4.5H14M15.5 6v1.5M14.5 5.5 4 16', hot: [4, 16] },
  ],
};

return { GLYPHS, BADGES, SIZE, svg, hotspot, css, VARIANTS, OPTIONS };
})();
