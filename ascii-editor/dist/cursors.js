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
  wand: { name: 'Magic wand', d: 'M3 17 12 8M10.5 6.5l3 3M15 2v2.5M15 7v2.5M11.5 5.75h2.5M16 5.75h2.5M5 3.5v2M4 4.5h2', hot: [15, 6] },
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
function svg(glyph, badge, dim) {
  const g = GLYPHS[glyph], st = (c, w) => `fill="none" stroke="${c}" stroke-width="${w}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" stroke-linecap="round" stroke-linejoin="round"${dim ? ' opacity=".45"' : ''}>` +
    `<g transform="translate(${OFF} ${OFF}) scale(${SCALE})"><path d="${g.d}" fill="${g.fill ? HALO : 'none'}" stroke="${HALO}" stroke-width="4"/><path d="${g.d}" ${st(INK, 1.6)}/></g>` +
    (badge ? `<g${g.badgeLeft ? ' transform="translate(-13 0)"' : ''}>` + BADGES[badge].draw(st(HALO, 3.4), false) + BADGES[badge].draw(st(INK, 1.4), true) + '</g>' : '') + '</svg>';
}
// The click point on the 24 x 24 image
const hotspot = glyph => GLYPHS[glyph].hot.map(v => Math.round(OFF + v * SCALE));

// A CSS cursor value, ending in a built-in fallback in case the image doesn't load
const cache = new Map();
function css(glyph, badge, dim, fallback = 'crosshair') {
  const key = [glyph, badge, !!dim, fallback].join('|');
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

return { GLYPHS, BADGES, SIZE, svg, hotspot, css, VARIANTS };
})();
