# ASCII art tool: plan

A standalone tool for making ASCII art: draw (or import) shapes and get fitting characters, or build in 3D
blocks and get 3D block lettering, then touch up by hand. Not part of the game, and it shares no game code: its own page, its own copy of the font and
the size presets, so it can live in its own folder or repo and work for any ASCII art. Planned with the
user on 2026-10-22; **not started**. Notes marked *(Claude)* are my suggestions.

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
  - **The user's question (2026-10-23): pure ASCII, or is Unicode allowed?** *(Claude)*: nothing decided yet. The plan so
    far is a toggle (plain ASCII by default; block mode's `▓ ▒ ░` style needs Unicode). The game font, JetBrains Mono,
    has box-drawing and block characters, so Unicode art would show in the game too. Needs the user's call on the default.
- Filled shapes are ignored for now (maybe a shading option later).

## Block mode: build in 3D, get ASCII 3D text (the user, 2026-10-22)

A second mode, for the blocky 3D ASCII lettering the user likes (the oldskool / Amiga look from the logotype rounds in
NAMES.md, e.g. "N+1 in 3D"). You build with **3D blocks (voxels) on a grid, seen at a three-quarter view**, and the
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

## Built-in art (the user, 2026-10-23)

- The app comes with a bunch of **premade art you can load**. One app the user liked had a browsable gallery; to start,
  skip the gallery and just build art in, maybe picked from `reference/ascii/selections.txt` (the user's picks). **Credit
  the artists** (their signatures / initials in the pieces, and ascii-art.de as the source).
- The full ascii-art.de catalog (`reference/ascii/ascii-art-de/`, ~10MB) is kept local only: taken out of the repo and
  git-ignored on 2026-10-23. `selections.txt` stays in the repo.

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

## Version 1

Reference image + SVG import + move / scale + the converter + touch-up + select / move + paste import +
export, and a point-to-point pen. Curve handles later. Tiny art (5x3 glyphs) is coarse, so there the tool is
mostly a starting point for touch-up; bigger pieces (ads, corp art, maps) are where it shines.

Built like the game's palette editor: one HTML page, open it in Chrome, no setup.
