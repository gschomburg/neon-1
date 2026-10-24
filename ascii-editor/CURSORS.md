# asXii: cursor feedback plan

The cursor should show what a click will do: which tool is active, plus any mode a key or the top bar has turned on.
Section 1 and the fixes are built (v0.72). Section 2 isn't. Tick an item (`[x]`) when it's built.

**See them all:** open `dist/cursors.html`. Every cursor is numbered (C01...), drawn big on dark and light with its click point,
and at real size; hover one to try it. The drawings live in `dist/cursors.js`, shared by the editor and that page.

## How to build it

- [x] Use CSS image cursors: `cursor: url(...) x y, <fallback>`. The fallback is a built-in cursor, used if the image fails.
  - Drawn like the toolbox icons: the same 20 × 20 grid and round strokes, scaled to 85% on a 24 × 24 image so a badge fits
    in the bottom-right corner (bottom-left on the bucket, whose drip is the click point). Dark ink on a white halo, the same
    on every theme (not theme colors, so they read on light and dark canvases alike).
  - SVG works in Chrome and Firefox; **still to test: Safari**, and fall back to PNG if needed. Also check they look crisp on a retina screen. Keep images 32×32 or smaller (larger ones get ignored).
  - Set the hotspot (the click point) for every image.
  - Build the "crosshair + badge" variants (+ − × ○) in code as `data:` URLs, in the theme colors, so they don't need separate files.
  - Give every cursor a thin contrasting outline so it shows up on dark and light themes.
- [x] Recompute the cursor on key press and key release, not only when the mouse moves (Shift, Option/Alt, Cmd/Ctrl, Space).
- [x] Reset the cursor when the window loses focus, so a modifier never stays "stuck" (the `blur` handler already clears Space).
- [x] One function (`cursorFor()` in `app.js`) picks the cursor from the tool, the keys held, what's under the pointer and whether a
  drag is in progress, and sets it on `#viewport` (it replaces the `over-float` and `panning` toggles and the `t-*` cursor CSS).
  The 3D editor has its own, `update3dCursor()`.
- [ ] (Not chosen) Option: hide the system cursor (`cursor: none`) and draw it on the canvas as ASCII. The drawn cursor can trail the mouse by a frame and disappears outside the canvas.

## Bugs to fix along the way

- [x] Shape tool has no cursor rule: it shows the plain arrow.
- [x] Fill tool has no cursor rule: it shows the plain arrow.
- [x] Hand / Space pan shows `grab` while dragging; it should be `grabbing`.
- [x] 3D view: holding Space doesn't show `grab` until you start dragging.

## 1. Modes asXii already has

"Option" means Alt. "Cmd" means Cmd on a Mac and Ctrl elsewhere; the code accepts both.

### Select
- [x] New selection (default): crosshair, optionally with a small mark for Rectangle or Ellipse
- [x] Lasso shape (top bar): lasso icon
- [x] Add to selection, Shift held before dragging: crosshair with **+**
- [x] Subtract from selection, Option held before dragging: crosshair with **−**
- [x] Move the outline only, hovering inside the selection: arrow with a small dashed box
- [x] Move the content, Cmd held: the Move tool's cursor (arrow with a solid box, or a 4-way arrow)
- [ ] (Probably skip) Fixed aspect or from center, Shift or Option pressed mid-drag: no change, like Photoshop

### Move
- [x] Move the selection (default): 4-way arrow
- [x] Move the whole layer (nothing selected): 4-way arrow with a layer badge

### Type
- [x] Place the caret: I-beam (already right; keep it)

### Pencil, Brush, Eraser
- [x] Painting (default): small dot or thin crosshair, so the brush outline drawn on the canvas is what you read
- [x] (Low priority) Brush in Taper, Outline or Ramp mode, where the stroke is placed when you let go: dot with a small "pending" tick

### Shape
- [x] Rectangle, Ellipse, Line, Polygon (top bar): crosshair with a small mark of the shape
- [x] Polygon: closing the shape, hovering the first point once there are 3 or more points: crosshair with **○**

### Fill
- [x] Fill (default): bucket
- [x] (Low priority) "Look at: All" (top bar): bucket with a stack badge

### Picker
- [x] Pick (default): eyedropper
- [x] Empty cell under the pointer: dimmed eyedropper, or `not-allowed`

### Any drawing tool (Pencil, Brush, Eraser, Shape, Fill)
- [x] Where a click can't change anything: `not-allowed`. Changed from the plan: art outside the canvas frame is allowed, so this is
  outside the selection (when there is one). Fill also refuses cells off the canvas.

### Hand / pan (Hand tool, Space, middle button)
- [x] Ready: `grab`
- [x] Dragging: `grabbing`

### Block
- [x] Move the blocks (default): 4-way arrow
- [x] No blocks yet, so a click opens the 3D view: `pointer`, or a cube icon

### 3D view
- [x] Add a block (Add, A): crosshair with a small cube and **+**
- [x] Remove a block (Remove, R, or Shift held): crosshair with **−**
- [x] Turn the view (Option-drag or right-drag): circular "orbit" arrows
- [x] Pan (Space or middle button): `grab`, then `grabbing` while dragging

## 2. Modes other editors have (candidates to add at the same time)

Check for key clashes before building any of these. Shift+Option currently means "add" (Shift wins), but in Photoshop it means intersect. If the quick picker uses Option, Option can't do anything else while painting.

### Select
- [ ] Intersect, Shift+Option (Photoshop): keep only the overlap with the current selection. Crosshair with **×**
- [ ] Magic wand (Photoshop, Aseprite): click to select connected cells with the same character; Shift adds, Option subtracts. Wand icon
- [ ] Select every matching character (Aseprite, the wand with Contiguous off): that character anywhere on the layer. Wand with a dots badge
- [ ] Polygon lasso (Photoshop): click corner points instead of dragging freehand. Polygon-lasso icon

### Select and Move
- [ ] Drag a copy, Option with Move (Photoshop): drags a copy and leaves the original. Double arrow

### Move
- [ ] Auto-select layer, Cmd-click (Photoshop): switch to the top layer that has a character under the pointer. Arrow with a layer badge
- [ ] Lock to one axis, Shift-drag (most editors): move only horizontally or only vertically. Arrow with ↔ or ↕

### Type
- [ ] Overwrite vs. insert, the Insert key (REXPaint, Moebius, text editors): overwrite replaces characters, insert pushes the rest of the line along. I-beam for insert, block caret for overwrite

### Pencil, Brush, Eraser
- [ ] Straight line from the last point, Shift-click (Photoshop, Aseprite). Crosshair with a short line
- [ ] Right-click erases (Aseprite, REXPaint): the second mouse button paints empty cells. Eraser icon
- [ ] Mirror painting (Aseprite, Krita): paints a mirrored copy across a center line. Crosshair with a mirror line

### Pencil, Brush, Fill
- [ ] Quick picker, hold Option (Photoshop): picks a character while Option is held. Eyedropper

### Eraser
- [ ] Erase only one character (Aseprite, right-click): erases only cells holding the picked character. Eraser with a character badge

### Shape
- [ ] Reposition while drawing, Space held mid-drag (Photoshop): moves the shape instead of resizing it. 4-way arrow

### Fill
- [ ] Global fill (Aseprite, Contiguous off or Shift-click): fills every matching cell, connected or not. Bucket with a dots badge

### Picker
- [ ] Pick from all layers vs. this layer (Photoshop's sample option). Eyedropper with a stack badge
- [ ] Pick a second character (Aseprite, right-click; like its background color). Eyedropper with a small "2"

### View
- [ ] Zoom in / out, Cmd+Space / Option+Space or a Z tool (Photoshop): click to zoom. Magnifier with **+** or **−**

### Any tool
- [ ] Hold a tool's key to switch to it for a moment; letting go switches back (Photoshop). That tool's cursor
