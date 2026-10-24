# ASCII art tool: plan

A standalone tool for making ASCII art: draw (or import) shapes and get fitting characters, or build in 3D
blocks and get 3D block lettering, then touch up by hand. Not part of the game, and it shares no game code: its own page, its own copy of the font and
the size presets, so it can live in its own folder or repo and work for any ASCII art. Planned with the
user on 2026-10-22; **v0 (bare bones) built 2026-10-23**, see "v0" below. Notes marked *(Claude)* are my suggestions.

**Name: asXii**, kept for now (the user, 2026-10-23: "till i get bored").

## Why

Most online ASCII editors use a single character as a brush. The user wants shapes turned into fitting
characters: a diagonal line becomes `\` and `.` and `_` as it bends, the way a hand-made piece would.
Vector paths are the best input for that: they say exactly where a line goes and which way it runs at
every point (a painted image only gives pixels).

## Layers (bottom to top)

1. **Reference image (onion skin)** (the user): import a raster image (PNG, JPG...), scale and position it,
   turn its opacity down, and draw / trace ASCII over it. Shown only in the tool, never exported. *(Claude)*:
   lock it in place so it doesn't move by accident, toggle it on and off, and maybe a grayscale / contrast
   option so lines are easier to see.
2. **Paths (vector):** import an SVG (paths, lines, curves, arcs); a pen tool to add and edit paths;
   move / scale / rotate them. This is what gets converted to characters.
3. **The character grid** over everything, in the real cell shape: cells are tall (about 0.6 wide to 1
   tall), so slopes map to `/` steeper than 45 degrees; the converter has to use the cell's aspect.
4. **ASCII preview**, live, in the game font: it updates as you move paths, so you can nudge art until it
   lands well on the grid (alignment matters a lot at small sizes).
5. **Touch-up / ASCII layer:** type characters into cells to override the converter. A button clears the
   touch-ups when moving the paths has left them in the wrong place.

**Art layers, maybe** (the user, 2026-10-23): several ASCII layers you can stack, like dnascii.com has. Theirs are a bit
confusing and the user couldn't find the flatten option, so if we do it: a plain layer list and an obvious
flatten / merge down. A floating selection (below) already works like a temporary layer.

## Tools

- **Pen:** version 1 is point-to-point; curve handles later.
- **Select + move** (the user): box-select characters on the ASCII layer and drag them; keep or drop the rest.
  - **More selection** (the user, 2026-10-23): box select and lasso; shift adds to the selection, and the Photoshop
    keys for taking away (alt / option drag).
  - **A selection floats** (the user, 2026-10-23): once selected, move it with the arrow keys or by dragging, and it
    doesn't overwrite what's underneath until you accept the move and deselect. While it moves, show where it would
    replace existing characters: only where two non-blank characters collide (blank cells don't count).
  - **Flip** horizontal and vertical, and **copy / paste** (the user, 2026-10-23). *(Claude)*: flipping should swap the
    characters too (`/` and `\`, `(` and `)`, `<` and `>`), or a flipped slope reads wrong.
- **Shape tools** (the user, 2026-10-23): circle / ellipse and square / rectangle drawn smart, with `/` `\` `-` `|` for
  the sides and `.` `'` in the corners for rounded corners. Plus a **polygon tool**: click out the lines, and once the
  shape is closed it converts to ASCII (goes through the converter like the pen paths). Maybe a **snap to grid** option.
  The patorjk sketchpad (see Reference apps) has good shape tools and line style options.
- **Brush size, fill or stroke, taper** (the user, 2026-10-23): drawing tools get a brush wider than one cell. The
  brush either **fills** every cell it covers or **strokes** it (only the edges); with stroke, the outline characters are
  worked out after you finish the line (on release). Also a brush shape and a **taper**: thinner at the ends, thicker in
  the middle. Maybe the taper scales with the line's length: a min and max width, and a spread setting for how fast it
  reaches the max.
- **Fills** (the user, 2026-10-23): flood fill, pattern fill (a brush that paints a repeating pattern), and noise fill
  (the noise brush below, but for a whole area).
- **ASCII import** (the user): paste text into a box; it becomes a floating block you drag around the canvas
  and drop where you want, on top of what's there (spaces see-through, or not).
- **Type:** click a cell and type, for touch-ups.
- **Noise brush** (the user): pick a set of characters (a list you type in, e.g. `.:;'`), and painting drops a random one
  from the set in each cell. *(Claude)*: a brush size, a density (how many cells it fills), saved sets (dust `.,'`,
  static `#%&@`, glitch `/\|-_`, the game's own noise characters), and weights (some characters more often). Great for
  texture, static, and glitch fills.

## How the conversion picks characters

*(Claude)* Sample each path about 8 points per cell, noting where in the cell each point falls and which way
the line runs there. Per cell:
- **By direction:** flat gives `_` or `-` depending on how high in the cell it runs; upright gives `|`;
  slanted gives `/` or `\`.
- **Bends:** `(` and `)`, and small marks `.` `,` `'`.
- **Line ends:** `.` or `'`.
- **Crossings:** `+` or `X`.
- An option for plain ASCII only, or Unicode line characters too.
  - **Decided (the user, 2026-10-23): Unicode.** The distinction doesn't really matter; the content will mostly be Unicode,
    so focus on Unicode. If we add a character palette: plain ASCII at the top, Unicode below it (or a toggle).
  - **The user's question (2026-10-23): pure ASCII, or is Unicode allowed?** *(Claude)*: nothing decided yet. The plan so
    far is a toggle (plain ASCII by default; block mode's `▓ ▒ ░` style needs Unicode). The game font, JetBrains Mono,
    has box-drawing and block characters, so Unicode art would show in the game too. Needs the user's call on the default.
- Filled shapes are ignored for now (maybe a shading option later).

## Block mode: build in 3D, get ASCII 3D text (the user, 2026-10-22)

**Built v0.40 (v1):** the **Block tool (K)**. Decided with the user (2026-10-23): **oblique, grid-aligned** projection (each
step of depth = one column right, one row up, so bakes line up with the character grid) and **paint blocks + one Depth**
(free 3D stacking later). Drag adds blocks on a grid of W x H characters (Block size), Alt / right-drag or Erase mode
removes them; all blocks extrude back by Depth. In the editor they show as shaded 3D boxes (not ASCII). **Bake** works
out which face (front / top / side) shows in each character cell and writes a new layer in the chosen Style: Shaded
`# : %`, Blocks `█ ▓ ▒`, Dots `@ : .`, Hatch `# / |`. The blocks stay (saved with the project, part of undo) to tweak and
bake again; Clear removes them. **Outline style** (the user, v0.41; now the default, with 3 x 2 blocks): the edges of the whole shape, the classic
3D-font look: `_` on the line above horizontal edges, `|` verticals, `/` depth edges; edges shared by neighbors are left
out so blocks merge into one piece; back to front, each block hiding what is behind it. Single blocks and straight runs
are clean; pixel diagonals (stair-steps) are busy, especially at 2 x 1. **Fills + seams** (the user, v0.42, from the examples in `reference/selections.txt`): Bake always draws the outline,
then fills each face with a character or leaves it blank: **Fill** presets None (outline only, default), Dots `.`,
Texture `:`, Cross `X`, Shaded `# : %`, Blocks `█ ▓ ▒`, plus Front / Top / Side boxes for your own (the Lennert Stock
letters around line 305). **Seams** draws the lines between neighboring blocks, dotted (`:` up and down, `.` across),
like the puzzle blocks around line 2649.
**Faces popover + White space** (the user, v0.43): the fill controls moved into a **⚙ Faces** popover on the Block bar,
with a **live preview** (a 2 x 2 sample baked with the current settings), the Preset list, a box per face (Front / Top
/ Side; empty = none), **White space: Solid / Clear** and Seams. **Solid** (default) makes the faces left unfilled
**solid spaces**, so baked blocks cover what is behind them.

**Extrude** (the user, v0.45; for shapes like the slanted Lennert Stock letters at line 306, which blocks cannot make):
Select tool → **Extrude…** (or Edit menu). Works on any selected art: the filled shape (the art plus what it encloses)
is swept back by **Depth across / down** (presets → ↗ ↘ ← ↖; +4 across = the line-306 look), and the outline of the
swept solid becomes the depth lines: `_` on the line above for flat tops, `|` for straight sides, `/` `\` for slopes,
real corners kept square. The art stays on top; **White space: Solid** fills the sides and the shape's inside with solid
spaces. Live preview on the canvas; Enter applies, Esc cancels; one undo step. **Stroke** (the user, v0.45): outline the shape
first (one cell outside it, so the art stays intact), then extrude that; plain filled art or text gets a clean front edge.
**Extrude is BETA** (marked in the app, v0.46). **Keep it, explore more later** (the user, 2026-10-23: "not quite perfect, but worth exploring"). Notes:
- **Extruding straight left uses a backtick (`) where it should be `\`.** Probably the shallow-slope pick (fy / the
  angle bands in smartChar, or the 5 x 5 normal) mirrored wrong for depth going left; check the left presets (← ↖).
- **The diagonal box test case** is saved at lines 12-22 of `reference/selections.txt` (a diamond of `.`). It came out
  close and fixable, but the **box extrusion and the Stroke around the original should look better**: cleaner depth
  lines off diagonal edges, and a tighter stroke that follows slopes. The user's finding: a dot at a pointed corner
  (the bottom tip) forces a flat corner; with that cell empty the corner can close as `\/`. So pointed tips may want
  special handling (or a hint to leave the tip cell empty).
- Also open: holes inside letters (an A's triangle) get filled by the sweep, so their inner depth walls don't show.

**Diagonal view** (the user, v0.47; the Lennert Stock letters around line 320 of `selections.txt`): Block tool **View (Diagonal is the default since v0.51):
Straight / Diagonal**. Diagonal blocks are diamonds on a 45° grid (edges `/` `\`; **Size** = rows from the top point
to the middle), extruded straight **right or left** by **Depth** columns: back edges parallel to the front ones and
`_` joiners at the top and bottom points, and a `_` fold from a side point that sticks out (v0.49-0.50, the user); shared edges merge, so diamonds build slanted strokes (strokes run along the
two diagonals; side-by-side diamonds only touch at a point). Fill (Front, Side) and White space from the Faces popover;
the preview follows the view. Diagonal blocks are kept apart from Straight ones (both saved with the project).
**Bake paints back to front** (v0.52, from the user's `reference/3d_samples.txt`): with depth going right, blocks further right
are nearer, so each block's side faces now hide the back edges / joiners of blocks behind it (stray `\` and `/` were
showing through). Still open from that sample: an inner corner missing its `_` (to check with the project file).
**Depth levels** (the user, v0.53; instead of per-block depth): set a short Depth and stack diamonds behind each other in
**levels** (Level − 0 +; 0 is the front, each level one depth step further back). You paint on the current level; the
others show dimmer. Bake treats it as voxels: deepest level first; a block with another right behind it draws no back
edges (the depth carries on), its side faces keep the stacked edges behind it, and a block with one right in front of
it is hidden. Two levels at depth 2 bake exactly like one block at depth 4. Steps where a stack ends show their edges.
**Flatten horizontal runs** (the user, v0.54, from `reference/3d_samples.txt` lines 35-36 vs 56-57): side-by-side diamonds
leave V notches, so a horizontal run had a zigzag top and bottom (`\/\/\/`). Each empty notch is now filled with half a
diamond, so the run reads as one flat bar with `_` lines along the top and bottom (carried back along the depth).
Diagonal strokes are unchanged. A checkbox in Faces (Diagonal view), on by default; the editor shows the halves too. v0.59 (from `reference/3d_samples.txt` 61-91): a notch with a block beside it in the same row is a slot in a solid shape, so it stays open; and a block straight above / below makes an inside corner, so the top / bottom point's `_` line shows there. v0.65 (hollow box, `reference/3d_samples.txt` 94-133, project `reference/untitled.asxii.json`): a side face carries on behind only if the block behind has that face open too, otherwise its back edge shows (inside corners against a back wall); and a top-point `_` ridge no longer wipes a farther block's edge in the same cell (the ridge runs along the bottom of the cell, the edge above it still shows).
**3D block editor** (the user, v0.56; replaces painting blocks flat on the canvas, which kept every block on one plane
so blocks only *looked* behind each other). The Block tool opens a 3D window over the editor: click a face to add a block
on that side (or the floor grid to start), Shift-click or Remove takes one away; right-, Alt- or Space-drag turns the view,
scroll zooms, views Front / Angled / Top / Left / Right. v0.57: the editor shows plain cubes on a square grid (the diamond view was too hard to read); Preview animates the 45° turn into diamonds. Same voxels (u,v,z) as the bake, and the turned model has
the bake's proportions: tall cells, and Depth vs Size sets how far back a block reaches, so what you build is what bakes.
**Preview** (Enter) turns the model toward the bake angle, closes, and shows the shape on the canvas (centered the first
time); there you drag the whole shape around on the grid. **Edit 3D** reopens it. The bar is now Edit 3D, Angle Left /
Right (which way the depth goes), Size, Depth, Faces, Clear, Bake. The Level control, flat painting and the Straight
view are gone (old saves load as the diagonal view). Undo works inside the 3D window. **Pre-bake** (v0.58): on the canvas the Block tool shows the ASCII the blocks will make, in amber until you Bake, instead of the block shapes (Show: ASCII / Shapes on the bar).


**Block views to add later** (the user, 2026-10-23, from the examples): other perspectives: the isometric angle of the
user's sketch at line 1 (top tilts back with `/`, front leans with `\`, the side comes to a point), depth going back-left
(mirrored), doubled depth edges (`//` `\\`, line 502), see-through wireframe boxes with `+` corners and `.'` / `` `. ``
diagonals from several viewpoints (Richard Kirk, line 761), seams on the top faces too. Also: type-to-blocks, free
stacking, smarter stair-step joints.

The original notes:

A second mode, for the blocky 3D ASCII lettering the user likes (the oldskool / Amiga look from the logotype rounds in
[NAMES.md](../docs/NAMES.md), e.g. "N+1 in 3D"). You build with **3D blocks (voxels) on a grid, seen at a three-quarter view**, and the
tool converts them to ASCII: tops, fronts and sides each get their own characters, and blocks in front hide the ones
behind.

*(Claude)* how it could work:
- **Building:** a 3D grid shown at a three-quarter angle; click to place or remove blocks, a layer (height) slider, and
  a few stamp tools (a line of blocks, a filled box).
- **Type to blocks:** type letters and they become extruded block letters (a pixel font, each pixel a column of
  blocks a set depth deep): 3D text in one step, then edit it block by block.
- **Converting:** every block is drawn as a small fixed tile of characters (e.g. 2-3 wide, 2 tall) for its visible
  faces, back to front, so nearer blocks cover farther ones. Shared edges between neighboring blocks merge, so a row of
  blocks reads as one solid shape, not a stack of boxes.
- **Styles** (presets, like the 3D figlet fonts): outlines only (`_ / \ |`), solid with shaded faces (`#` on the
  front, `:` on the side, `_` on top), or block shading characters (`▓ ▒ ░`) for the faces.
- **View:** from the left or the right, a steeper or flatter angle, and the depth of the extrusion.
- Then it lands on the ASCII layer like any other art, for touch-up, select / move, and export.

## Canvas and view (the user, 2026-10-23)

- **Zoom** in and out (good, keep).
- **Canvas size** is great, but also show the grid **outside the canvas**, so you see what's inside the canvas and what's
  hanging out of it. The canvas sits centered in the view.
- **Font setting:** pick the monospace font. The default is the game's (JetBrains Mono); the user likes it.
- **Styles:** light and dark mode, maybe a couple of looks: a toned-down blueish one and a lighter green one (the user
  liked dnascii's look and feel).

## Layout (the user, 2026-10-23)

The Photoshop setup:
- **Tool palette on the left**, draggable, docked left by default.
- **Tool options in a bar along the top** (probably locked): once you pick a tool, its options show there.
- **Info pane on the right** for tools with more options, layers, selection info and transform settings. Fine on the
  right (the user doesn't mind info panes there); repositionable or locked, locked is probably fine.
- **Global things at the very top**, outside the canvas: zoom level, light / dark mode, and menus if we need them
  (File: save, export).

## 3D shapes (the user, 2026-10-24; v0.93)

- **v0.99: shapes are brushes** (the user: a Shape tool next to Add / Remove felt off, since Add is a one-block shape).
  The tools are just Add and Remove; the panel on the left is the **Brush**: Block (the default, one block) or a shape
  with its sizes. Add puts the brush on the face pointed at (ghost + ground shadow); Remove carves the brush out,
  centered on the block pointed at (the blocks it would take show in the clash color). Shift-click does the other one;
  Q turns the brush. "Save blocks as a brush" stays (for the asXii shape); no bigger custom-brush system.
  The size toggle is a fullscreen-style icon (arrows out / in), Z.
- **Two rows on top** (the user, v0.101): row 1 is the view (View, Color, Focus, the angle readout, fullscreen); row 2
  is the content (Add / Remove, **Brush ▾**, Clear, "add at ..."). The brush is a dropdown under its button (like the
  Advanced brush menu), named with its sizes (Disc r6, Box 8x5x3); it folds away on a click elsewhere or Esc. The block
  count sits in the bottom-right corner of the 3D view; the bottom bar is the key hints, Close and Preview.
  Both rows have their controls centered in a box, like the main options bar (title left, readouts right) (v0.103).

- The 3D editor has a **Shape** tool (S) next to Add / Remove: a side panel picks a premade shape and its sizes; a ghost
  of it follows the pointer onto the floor or the face pointed at, and a click places it (keep clicking for more; Q turns
  it; Shift-click still removes a block; Esc goes back to Add). Shapes: Cube (8), Box, Plane (12 x 12), Walls (a room
  with no roof), Disc (radius 6), Cylinder, Ring, Sphere, Dome, Pyramid, Stairs. A shape is [u, v, h] cells with h up
  from the floor (the editor's -z).
- **Easier to read** (the user, 2026-10-24; v0.94): **Color** Plain | **Axes** (default: each side tinted by its axis,
  across red, along green, up blue) | **Height** (a hue per level, so higher blocks read from any view); C cycles.
  The block or shape about to go in casts a **shadow** on the ground (the bottom of level 0), with dashed lines down to
  it for a block or a small shape, and the head reads **add at u, v · height h**.
- **Turning is a trackball** (v0.95; the user found v0.94's turntable wonky from Front): right-drag turns the shape
  the way the pointer moves, about the screen's own axes (across = side to side, up / down = toward or away from you),
  from any angle. The turn is a quaternion (cam.q), so nothing locks up (before v0.94: turn + tilt with the tilt clamped
  at ±90°, which locked). Views set it from turn + tilt and animate with slerp; the readout shows turn / tilt.
- **Opening fits the blocks** (v0.100): open (and F) fit the blocks as they look from the current angle into ~75% of the
  window (it was half the window, sized by the longest side), and fit again once the window has its final size.
- **Focus** (the user, 2026-10-24; v0.96; F, like Unity / Blender, or the Focus button): glides back to the blocks,
  with the pivot in their middle, the pan undone and the zoom fit; keeps the angle. The views moved to 1 / 2 / 3
  (Front / Angled / Diamond; G and D still work).
- **Speed** (the user, 2026-10-24; v0.97): with many blocks, adding / removing got slow. Measured at 2744 blocks: the
  3D redraw was ~35 ms and ran on every pointer move (hover); the canvas pre-bake behind it ~5 ms (mostly its memo key,
  which sorted and stringified every block per redraw). Now: the sides that can show are found once per view (it is
  orthographic), corners are shared (faces 36 -> 3 ms); the grid + blocks are drawn into a layer reused until the
  blocks / view / colors change (a hover redraw is ~0 ms); the pre-bake waits while the 3D window is open, and its key
  no longer sorts. The 3D window has two sizes (v0.98; Bigger / Smaller button
  in its head, or Z): Smaller (default) is 80% of Bigger, which is most of the screen (100vw - 80px by 100vh - 80px).
- **Save blocks as a shape** keeps whatever is in the editor as one of My shapes (in this browser's prefs). The
  user plans an **asXii** shape that spells the name: build it, save it (and save the project to saves/), and it can
  then become a built-in shape.

## Built-in art (the user, 2026-10-23)

- The app comes with a bunch of **premade art you can load**. One app the user liked had a browsable gallery; to start,
  skip the gallery and just build art in, maybe picked from `reference/selections.txt` (the user's picks). **Credit
  the artists** (their signatures / initials in the pieces, and ascii-art.de as the source).
- The full ascii-art.de catalog (`reference/ascii-art-de/`, ~10MB) is kept local only: taken out of the repo and
  git-ignored on 2026-10-23. `selections.txt` stays in the repo.
- **Gallery** (the user, 2026-10-24; v0.90): File › Gallery… opens a pane on the side (left of the Info pane). It lists
  every piece with a thumbnail, name, artist and size, plus a search box. Clicking a piece previews it floating over
  the middle of the view on a tinted plate (kept on the canvas when it fits), without touching the layers. **Add to
  canvas** (or Enter / double-click) puts it on a new layer above the active one, named after the piece, and picks
  the Move tool to place it. The pane closes on Add, ×, Esc, picking another tool, or drawing on the canvas (panning
  and zooming leave it open). Arrows step through the list.
  - **The art is plain text** (the user, 2026-10-24): one `.txt` per piece in `dist/gallery/`, listed in
    `dist/gallery/index.json` (file, name, artist, source subject + URL; its order is the gallery order). Served over
    http the app reads those directly; from file:// (Chrome blocks reading them) it loads `dist/gallery.js`, the same
    art bundled by `node ascii-editor/gallery-build.js` (bump.js runs it too). The build adds new .txt files to the
    index (named from the file name) and drops entries whose file is gone. Nothing loads until the pane first opens.
  - **White space** (the user, 2026-10-24; v0.92): Clear | **Shape** (default) | Box, in the pane, shown live in the
    preview (only what gets placed is tinted; the art under see-through blanks shows). Shape makes the blanks inside
    the art's outline solid and leaves the space around it clear, so placed art isn't a box. **Gaps** (0-4, default 1):
    openings in the outline up to that size count as closed (0 = only fully closed spaces). It is a morphological
    closing: grow the characters by the gap (2x across, cells are tall), fill what the outside can't reach, shrink
    back (`artSolid`). Not perfect on very open art; Clear or a hand fix after covers that. Could also serve the Font
    tool, imports and pastes later.
  - The first 192 pieces came from `selections.txt` by a one-off script: split on double blank lines, matched back
    to the catalog subject (for the source link), named, the artist taken from the signature, and the email /
    commentary lines trimmed; single-line notes were left out.

## Animation (the user, 2026-10-23; ideas)

- **How animations could be stored:** like a sprite sheet, as a text file (frames one after another).
- **An animation tool in the editor?** Preview an animation and export it as code; e.g. add live fields like `{bar}` (the
  game's fill-in values) in the art, preview them, and export. Would mean more syntax in the art format.
- **Particle generator** in the animation tool: pick an emitter cell, a set of characters to emit, an initial force, a
  fall-off speed and a death time. Or keep it simple with **presets** (rain, explosion...) that cover the common cases.

## Reference apps (the user, 2026-10-23)

- **[ASCII Art Sketchpad](https://patorjk.com/ascii-art-sketchpad/)** (patorjk): great drawing and shape tools, and line
  style options.
- **[dnascii](https://dnascii.com/)** ([GitHub](https://github.com/dnisdv/ascii-editor)): has the select-and-move the
  user wants, and layers (a bit confusing; flatten is hard to find). The user likes its overall look and feel, light /
  dark mode. Thought about forking it (and offering our features back), but the user would change the UI too much: use
  it as a reference point instead.
  - **Decided 2026-10-23: no fork, we build our own** (the user was leaning no). Their code is React / TypeScript with a
    build step, and the Photoshop-style layout would mean rewriting most of their UI anyway. Plain HTML / JS here,
    no setup. dnascii stays the reference for selection, move and layers.
- **[TAAG](https://patorjk.com/software/taag/#p=display&f=Patorjk%27s+Cheese&t=NeoN%2B1&x=none&v=1&h=0&w=80&we=false)**
  (patorjk, text to ASCII art): great type options. Fonts the user liked: Isometric (great), Small Isometric1 (very nice),
  Impossible, Slant Relief, Swamp Land, Tmplr, Twisted, Stronger Than All, Small ASCII 9, Big Fig, Braced, Broadway KB,
  Contessa, Chunky, Cursive. Worth having for block mode / a text tool.
- **[ASCII Studio](https://asciistudio.app/)**: janky pasting, and most tools are missing pieces or confusing; **don't
  lean on it much.** Good parts: the text typing mode, the Adobe-style layout with a tool palette, and a box select you
  drag out.

## Output

- **Size presets** for the game's art: 5x3 node glyphs, the 30x18 ad box, 36-wide corp art, the intro map
  (34 x 9), plus free sizes.
- **Copy** as plain text, or as code lines (quoted, with backslashes and quotes escaped) ready to paste into
  the game's data files.

## v0: bare bones, UI in place (the user, 2026-10-23)

A quick first app with the whole layout in place, so we can see how it feels before the converter and block mode.
Plain HTML / CSS / JS in `dist/` (`index.html`, `style.css`, `app.js`), no build step: open `dist/index.html` in Chrome.

**Decided with the user (2026-10-23):**
- **Typing is a tool.** The Type tool (or `T` / Enter) puts a text cursor on the grid; keys type, arrows move the
  cursor. `Esc` leaves type mode, and then single keys are tool shortcuts (Photoshop style).
- **Basic layers** in v0: add, delete, rename, reorder, show / hide, the active layer, merge down, flatten. Blank cells
  are see-through. A selection being moved floats above the layers until you drop it.
- **No fork** of dnascii (see Reference apps).
- **Select and Move are two tools, like Photoshop** (the user, 2026-10-23): Select (M) draws the box, and dragging inside it
  or the arrows move only the outline. Move (V) drags the selected content from anywhere; with nothing selected it
  moves the whole active layer. Ctrl + drag or Ctrl + arrows in Select move the content too, and you stay in Select (plain arrows then drop it
  and move the outline again). Paste switches to Move.
- **Dropping a moved block** (the user, 2026-10-23): blanks are see-through by default. A one-off full replace: Shift Enter
  (or Shift D, which also deselects); holding Shift previews it. The options bar has Drop / Drop (replace all) and a
  Blanks: See-through / Replace setting.

**Decided (the user, 2026-10-23): a selection limits the drawing tools (option 2, Photoshop).** While a selection is
active, Brush, Eraser and Type only change cells inside it. A marker next to the tool name says so ("inside selection ·
Ctrl D clears"), and trying to paint or type outside it shows a message. Built v0.11.
**Typing in a selection wraps** (the user, v0.13): the cursor goes to the next selected cell to the right, else the
leftmost selected cell of the next row (works for any shape); Enter jumps to the next selected row, Backspace steps back.

**In v0** (the user's list, plus *(Claude)* extras marked):
- Canvas: set its size (with an anchor for which side grows), zoom in / out, pan; the grid continues past the canvas
  edge, dimmer, so you see what's in and what's out. Art outside the canvas is kept (not cut) and left out of exports.
- Type on the grid and arrow around.
- Box selection (shift adds, alt takes away), copy / cut / paste / delete, move (drag or arrows; it floats and doesn't
  overwrite until you drop it, and cells where two characters would collide are marked). Flip horizontal / vertical
  (swapping `/` `\`, `(` `)`, `<` `>` and so on).
- Paste from the clipboard onto the canvas as a floating block.
- Brush: draw with a chosen character, brush size, square or round tip. Eraser. *(Claude)*: picker (take a character
  from the canvas).
- Layers as above. Plus a **Layer focus** checkbox in a settings area at the top of the Layers panel (the user, 2026-10-23; `L`; on by default): only the active layer at full brightness, drawn on top.
- File: new, open / save a project file (`.asxii.json`, keeps layers), import a `.txt` (as a floating block), export
  `.txt` (the canvas, visible layers flattened), copy as text, copy as code lines (quoted, escaped, for the game's data
  files).
- View: font choice (JetBrains Mono default), styles (dark, light, blue, green), grid on / off.
- *(Claude)*: **undo / redo** (essential), and an autosave in the browser so a reload doesn't lose work.

**Added v0.15** (the user, 2026-10-23): **selection shapes** (Rectangle / Ellipse / Lasso, Shift M cycles; the lasso takes
the cells inside the loop plus the ones the line crosses), a **Fill tool** (G: the connected area of the same character,
inside the canvas and the selection; looks at the active layer or all layers; Alt Backspace fills the selection), and
**Paint** sources shared by Brush and Fill: **Character**, **Noise** (random from a set, with a density; with the Brush
this is the noise brush) and **Pattern** (a tile lined up to the canvas grid; presets plus **From selection**). Brush
noise / pattern leave misses alone; fills turn them blank.
**Fixed aspect + From center** (the user, v0.16; like Photoshop): for Rectangle and Ellipse, Shift pressed mid-drag keeps
it square / round (on screen, so cells are taller than wide), Alt pressed mid-drag grows it from the center. Held from
the start they still mean add / subtract (press again mid-drag for the second meaning). Checkboxes in the options too.
**Pattern library** (the user, v0.17; like Photoshop): the options bar shows the current pattern (preview + name);
clicking it drops down every pattern with a thumbnail, the presets first, then your own (marked "custom", with a delete
button) and a note on making more. New patterns come from the Select tool: **Make pattern** (also in the Edit menu) opens
a dialog with the tile, how it repeats, and a name. Custom patterns are saved in the browser (not in project files yet).
**Blanks: See-through / Replace** (the same name as the Move tool's) for Noise and Pattern: whether their blank spots
leave what is under them or wipe it. Brush defaults to See-through, Fill to Replace; each remembers its own.
**Pencil and Brush** (the user, v0.18; like Photoshop): **Pencil (P)** is the simple one: one character, size, tip
(the original brush). **Advanced brush (B)**, renamed v0.19, is the full one: Paint Character / Noise / Pattern, Blanks, size, tip, and later taper
and stroke. They share the character (the chip in the palette) but keep their own sizes; the Picker returns to whichever
was used last.
**Paint picker** (the user, v0.19): Character / Noise / Pattern is one button (a small live preview + the name) that
opens a list like the pattern list: each mode with its preview, name and a short description. Used by the Advanced
brush and Fill (and anything that paints later); each mode's own settings stay in the bar.
**Characters pane** (the user, v0.21): a scrolling grid above Layers on the right, ASCII first (symbols, digits,
letters) then Unicode (blocks + shades, box lines, heavy + double box, shapes, arrows, misc). Click: sets the character
(Advanced brush / Fill switch Paint to Character; other tools switch to the Pencil); with the Type tool it types it at
the cursor. Hover shows the code (U+2591). The options bar keeps the character box, Recent and 5 basics (# * . - |).
Segmented controls (v0.20) for every either/or choice in the bar: Blanks, Look at, Shape.
**Renamed v0.23** (the user): "Blanks: See-through / Replace" is now **White space: Solid / Clear** everywhere (Move, Advanced
brush, Fill; the menu and help), with tooltips on the label and both options spelling it out. Solid = blank cells cover
what is under them; Clear = they let it show through. "Drop (replace all)" is now "Drop solid".

**Shape tool (U), v0.24** (the user, 2026-10-23): Rectangle (ASCII +-|, Rounded .-', Underscore _|, Box, Round box,
Heavy, Double, or the Pencil's character), Ellipse (smart edges or the character), Line and Polygon (smart, box lines, or
the character; polygon: click points, click the first to close, Enter / double-click to finish open, Backspace takes a
point back, Esc cancels; corners get + or the matching box corner). Shift = square / circle / straight, Alt = from
center (plus checkboxes). Fill inside uses the Paint setting. **Style: None (fill only)** (v0.27, the user; replaced the v0.26
Outline checkbox) for Rectangle, Ellipse and Polygon: no edge, the fill covers the edge cells too. Line has no None;
Polygon has its own style setting. Live preview; one undo step; respects the selection.
**Smart edges** follow the curve: the cell it actually passes through, and how high in that cell: flat - or _, shallow
' . - (so curves read .-' like hand-made art), steep /  (one per row), upright |. First step toward the converter.

**Copy merged** (the user, v0.29): Edit menu or Ctrl Shift C copies the selection as you see it, from all visible layers
(plain Copy takes only the active layer).

**Update notice** (the user, v0.25): when hosted, the app checks `dist/version.json` (written by bump.js) and, if a newer
version has been uploaded, shows a small notice with Refresh (your work is autosaved first) and × (not now, for this
session). Not from a local file.

**Advanced brush: Taper + Outline** (the user, v0.30). **Stroke: Fill / Outline**: Outline keeps only the edge of the stroke,
worked out on release, with smart edge characters (from a 5 x 5 look-around; or Edges: Paint). **Taper**: Size becomes the
max, Min sets the ends, Ramp = how many cells to grow from min to max, so short strokes stay thin. With either on, the
stroke is collected while you drag (live preview) and lands on release as one undo step. Tapered tips of outlined
strokes are still a bit rough.
**Paint: Ramp** (the user, v0.31; Advanced brush only): characters that change along the stroke, typed from the end to the
middle (`.,:oO`): the stroke starts on the first, steps up to the last over the **Ramp length** (the slider Taper uses,
renamed), holds it, and steps back down at the other end, so `.,:oOOOo:,.` happens on its own; with Taper the width and
the characters change together. **Noise picker** (the user, v0.37): like the ramps, each preset sets characters + density (Density = how many of the
painted cells get a character; the rest are skipped and White space decides what they do): Dust (default), Static,
Glitch, Sparkle, Snow, Grass, Sand, Binary, Rubble, Shade, then your own (typed at the bottom of the list, saved with the
current density). The list shows a fixed sample patch of each; Density stays in the bar. Decided (the user): Density alone controls how much;
spaces in the set are ignored (not a second way to thin it out). Repeated characters still weight the mix (`...:`).
**Customize for Noise and Ramp** (the user, v0.38; the same as the brush's): a ⚙ Customize button next to each picker
opens a popover with the name (+ "edited" / Reset), a live preview, the characters (noise: a note that the Density set in the bar is saved with it), and **Save
as new noise / ramp**. The lists are just lists now (the make-your-own box moved into Customize). Density stays in the bar.
**Ramp picker** (v0.36): like the pattern list, with a mirrored preview of each: Classic `.:-=+*#%@` (the new default),
Bubbles `.,:oO`, Round, Dots, Shade, Blocks, Stars, Lines, Fine (the 70-step ramp), then your own (type one at the bottom
of the list and Save; custom, deletable; saved in the browser). Fill / Shape (no stroke) use the last one.
**Brush library + customizer** (the user, v0.33; replaced the Taper checkbox and the Stroke / Tip controls in the bar).
The Advanced brush bar is now Paint ▾ · **Brush ▾ ⚙** · Size. **Brush ▾** opens a list like the patterns (thumbnail
strokes): Plain, Taper, Soft taper, Taper in, Taper out, Point, Outline, Outline taper, then your own (custom, deletable).
**⚙** opens the customizer: a live preview, **Start / End curves** (icons: none, linear, ease in, ease out), Ramp length,
Min width, Tip, Stroke Fill / Outline (+ Edges, White space), Reset (when edited, shown as • / "edited"), and **Save as
new brush** (saved in the browser). A brush carries everything but Size; **Size is the max width**. The Ramp paint mode
follows the brush's curves.
**Outline + White space** (the user, v0.32): with Stroke: Outline, **White space: Solid** (default) wipes the inside of the
stroke blank on the active layer, so the outline reads as a clean shape; **Clear** lets what is inside show through.

**Smart lines** (the user, v0.70, after patorjk's ASCII Art Sketchpad): the Pencil has **Character | Smart** (S switches). Smart draws a
single-stroke line that picks its own characters, in three styles: **ASCII** (by slope and where the stroke crosses the
cell: | ( ) steep, /  diagonal, - ' _ ` . , ´ shallow, < > where it turns back; one character per column, or per row
when steep), **Box** (walks cell to cell and joins the sides: ─ │ ╭ ╮ ╰ ╯ ├ ┤ ┬ ┴ ┼, and joins box lines already on the
layer; a cell only counts once the stroke is a fifth of the way in, so jitter on an edge makes no stubs) and **Block**
(█ ▌ ▐ ▀ ▄ ▚ ▞; the user doesn't love these, kept for completeness). The Shape tool's Line / Polygon styles use the same:
Smart (ASCII), Box (now connected, sharp corners), Block. v0.71: the Advanced brush's Outline **Edges** also has Box (the outline traced as one path, then drawn like a Box stroke) and Block, next to Smart and Paint. v0.72: Outline's inside is now **Inside: Paint | Solid | Clear** (was White space: Solid / Clear); Paint fills the inside with the Paint setting and the edges go on top. v0.73 (the user: less redundancy): the customizer's Stroke / Edges / Inside rows became two: **Fill** Paint | Solid | Clear and **Outline** None | Smart | Box | Block | Paint. Stored the same way (Fill Paint + Outline None = a plain stroke, mode fill; anything else = mode outline with edge and inside), so saved brushes keep working. v0.75: Outline Paint became **Character** with its own character box (Paint is the Paint setting, so an outline in it was the same as no outline); old Outline Paint brushes switch to Character. The customizer is 440px wide.

**Font tool (F)** (the user, v0.80): text in FIGlet fonts (the TAAG format). Click to start a **text layer** and type; it
renders live. A text layer keeps its text, font and spacing (Default / Full / Fit / Smush), so with the Font tool you
click it to type more or change its font, and drag it (or arrow keys) to move it. It becomes plain art for good when
another tool paints on it or it is merged down. Layers list shows a T tag. Fonts live in `dist/fonts.js` (32 fonts
from the figlet.js package, MIT; the user's TAAG picks plus classics; Tmplr wasn't in the package; the Isometric fonts
have letters only). The font list shows each font with a sample of your text. Saved with the project. v0.81: letters a font lacks show as the plain character, mid-height. v0.82: **White space** per text layer, worked out at runtime (fonts only know characters and blanks): Clear; **Inside** (blanks the letters close in are solid: flooded from outside the text, the cells it can't reach); **Block** (each row solid from its first to its last character: the text on a solid plate). v0.83: **Letters ±** (extra columns between letters after Spacing; below 0 they overlap) and **Lines ±** (extra rows between lines; below 0 they tuck in, the lower line on top), per text layer. v0.84 (the user: a stray selection broke a text layer while moving it): **Protect text layers** (Layers pane checkbox, on by default, to try it locked down): painting tools, Delete, Cut, Flip, Fill and Extrude leave a text layer alone (with a note); the Move tool (or arrows) moves it whole, ignoring any selection; drops / pastes land on a new layer above. **Layer › Rasterize text layer** (also in the Font tool bar) or Merge down makes it plain art on purpose. Off = the old way (any edit quietly makes it plain art).

**Not in v0:** the vector layer and converter, reference image, block
mode, animation, built-in art.

**To do (noted, not built):**
- **Later pile: mazes** (the user, 2026-10-23). A **Maze** pattern fill, and maybe a whole maze tool (generate a maze in a
  box or selection, pick the wall style: `+--+` / `|` ASCII, box lines, blocks).
- **Started v0.43: solid spaces.** A cell can hold a solid space (a no-break space): blank, but it covers the layers
  below. Drawn as a faint dot, exported / copied as a plain space, saved in projects. Only Block bake makes them so far;
  the rest of the item below (how to draw them by hand, etc.) is still open.
- **To discuss: drawing explicit white space** (the user, 2026-10-23; bigger, needs thought). Today a blank cell is always
  empty, so it is see-through on layers. Sometimes you want a cell that is a space but **solid**: it hides what is on
  the layers below (a knock-out, a clean background behind text). Questions: how to draw one (a "solid space" character
  in the Pencil / Characters pane? an eraser mode?), how to show it on the canvas (a faint dot or tint, so it is not
  invisible), how it saves (the project format needs to tell "empty" from "space"), and how it exports (a plain space).
  Ties into White space: Solid / Clear, which today only decides what blanks do when they land.
- **To discuss later: the tool options bar** (the user, 2026-10-23; after more tool options are in, since they may
  change things). Today it spans the full width and changes height from tool to tool (some options are taller), and
  the tool name sits alone on the left, vertically centered, which looks odd. Leaning toward dropping the full-width
  bar for a **floating** options panel that doesn't span, so it is less prominent, with the tool name moving into it
  next to the tool hint.
- **An info / about link** (the user, 2026-10-23): somewhere in the app (Help menu, or the version tag on the logo),
  a short about with a link to the GitHub repo, wherever it ends up living. For now that would be
  github.com/gschomburg/neon-1 (folder `ascii-editor/`); update it if asXii gets its own repo.
- **Page metadata + a poster image for link previews** (the user, 2026-10-23): so links to asXii unfurl nicely in chat
  apps, social sites and the like. A page description, `og:title` / `og:description` / `og:image` (a poster image,
  e.g. 1200 x 630, maybe the asXii logo art in the editor), the Twitter card tags, a favicon and a theme color. Same
  approach as the game (`dist/index.html` meta tags, SPEC §17 "Publishing: link previews"): keep URLs relative except
  `og:image`, which has to be absolute, so it waits until we know where asXii is hosted.

## Version 1

Reference image + SVG import + move / scale + the converter + touch-up + select / move + paste import +
export, and a point-to-point pen. Curve handles later. Tiny art (5x3 glyphs) is coarse, so there the tool is
mostly a starting point for touch-up; bigger pieces (ads, corp art, maps) are where it shines.

Built like the game's palette editor: one HTML page, open it in Chrome, no setup.
