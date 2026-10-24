# asXii: autotile plan

Auto characters: cells that pick their own character from their neighbors, the way tile-based games autotile walls and
paths. Draw a rough shape with an Auto character and it comes out as joined lines or a bordered panel; draw next to it
later and the touching cells re-pick so everything stays joined.

Not built yet. Tick an item (`[x]`) when it's built.

## How it differs from Smart lines

The Smart lines (Pencil Smart mode, Shape and Outline styles, v0.70) pick characters **along a stroke, once**, from its
slope and where it crosses each cell. That's right for freehand curves, and they stay as they are.

Autotile picks characters **from the grid**: which neighboring cells are also auto. So it:
- works with every tool, not just strokes: Pencil, Brush, Fill, Shape, Eraser, Mirror, the right button, a selection
- stays live: erase a cell or draw next to one, and the cells around it re-pick
- is exact on the grid (no slopes), so it suits boxes, panels, pipes, maps and UI frames, which are most of NeoN+1's art

## How it's stored

- [ ] Each cell keeps its **resolved character** in `layer.cells`, as now, so copy, export, the game, the wand and everything
  else just see normal characters
- [ ] Plus a per-layer map of which cells are auto and in which set: `layer.auto: Map "x,y" -> setId`
- [ ] Painting an Auto character (a stand-in, like Clear) adds the cell to `layer.auto` and resolves it and its neighbors.
  Painting anything else, or Clear, removes the cell from the map and re-resolves its neighbors
- [ ] Re-resolving only touches the changed cells and their 8 neighbors, so big fills stay fast
- [ ] Saved in the project file (an `auto` list per layer, for example `[x, y, setId]` runs) and in undo snapshots; older
  files have none and load as before
- [ ] A floating block (move, copy, paste) carries its auto cells and re-resolves where it's dropped, against what's there

## How a cell picks its character

- [ ] **4-neighbor sets** (lines): look at the cells above, right, below and left: 16 cases, one character each.
  Example, Box: none `·` or `─`, left+right `─`, up+down `│`, right+down `┌`, all four `┼`, and so on
- [ ] **8-neighbor sets** (regions): also look at the corners, so a filled area gets edges, outer corners and inner
  corners (the "47-tile blob" from game autotiling). Example, Panel: `┌─┐ │ │ └─┘` around any painted shape, with an
  inside fill (opaque space, a character, or clear)
- [ ] **What counts as a neighbor**: by default, cells of the same set on the same layer. Option: any auto cell (sets join
  each other), or any non-empty character (join onto plain art, like Box lines already join existing box characters)
- [ ] Rules for dead ends and single cells (a lone cell: `+`, `·` or `o`; a line end: the straight piece or a cap)

## The first sets

- [ ] **ASCII lines** (4): `- | +` with `+` corners and joins. Variants: rounded corners `. ' ` (` .-. `), and `/ \` corners
- [ ] **Box** (4): `─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼`. Variants: Rounded `╭ ╮ ╰ ╯`, Heavy `━ ┃ ┏ ...`, Double `═ ║ ╔ ...`
- [ ] **Panel** (8): a bordered region in Box or ASCII lines, inside opaque space (a window or dialog: paint the area, get the frame)
- [ ] **Blocks** (8): `█` inside, `▀ ▄ ▌ ▐` edges, `▘ ▝ ▖ ▗` and `▛ ▜ ▙ ▟` corners, for chunky shapes with clean edges
- [ ] Later: **Pipes** (4, with `═ ║` and `╬`), **Shade** (8: `▓` inside fading to `▒ ░` at the edge), **Brick / stone** (8)

## Tools and UI

- [ ] **Characters > Special** gets an **Auto** swatch, next to opaque space and Clear (a green outline, say, so the three are
  told apart). Picking it makes the active set the drawing character, for any tool
- [ ] The top bar shows **Set: Box ▾** whenever Auto is the character: the set list with a 3 x 3 preview of each, like the
  pattern and ramp menus
- [ ] The cursor and the cell highlight show the cell that will change; a faint preview of the neighbors that will re-pick
- [ ] A view toggle next to **Spaces**: **Auto** marks auto cells (a small corner tick) so you can tell them from plain art
- [ ] The right button paints the right-button character as usual (it can be Auto too, in another set)
- [ ] The Eraser and Clear remove auto cells and re-resolve the neighbors (so erasing the middle of a box line leaves two clean ends)
- [ ] Mirror: the mirrored copies are auto too, and resolve on their own side (no character flipping needed)
- [ ] The Picker on an auto cell picks Auto in that set

## Converting

- [ ] **Bake auto** (Layer menu or selection): the cells keep their characters and stop being auto (the art is final)
- [ ] **Make auto** (selection): cells whose characters belong to a set become auto in it (turn old box art live again)
- [ ] Text layers (the Font tool) and protected layers: auto painting follows the same protect rules as the other tools

## Your own sets

- [ ] A set editor, like the ramp and noise customizers: a 4 x 4 grid (16 cases) or the 47-case blob grid, a character in each,
  live preview, Save as new set; kept in the browser like your own ramps and brushes
- [ ] **Learn from an example**: select a small hand-drawn sample (a box, a panel) and the editor fills in the table from it
- [ ] Sets as files: export and import a set, so NeoN+1 corps or players can share them

## Versions

- **v1**: the stored map, 4-neighbor resolving, ASCII lines and Box (with Rounded / Heavy / Double), the Auto swatch and
  Set menu, all drawing tools, Eraser / Clear, undo, save and load, Bake auto
- **v2**: 8-neighbor sets (Panel, Blocks), the Auto view toggle, floating blocks, Make auto, Mirror
- **v3**: your own sets, learn from an example, Pipes / Shade / Brick, set files

## Open questions

- [ ] Does Auto join plain art by default (like Box lines do today), or only other auto cells?
- [ ] Two sets touching: do they join (a Box line running into a Heavy line gets `┝`), or stay apart?
- [ ] Should the Shape tool's styles become sets (Rectangle in Box = a Box auto rectangle), or stay as they are?
- [ ] Is auto per cell (as planned) or per layer (a whole layer is "a Box layer")? Per cell is more flexible; per layer is simpler
- [ ] What do lone cells and line ends look like in each set?
