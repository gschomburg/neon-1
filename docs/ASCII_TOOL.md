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

## Tools

- **Pen:** version 1 is point-to-point; curve handles later.
- **Select + move** (the user): box-select characters on the ASCII layer and drag them; keep or drop the rest.
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
