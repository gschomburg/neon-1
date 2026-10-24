# asXii: autotile plan

Auto characters: cells that pick their own character from their neighbors, the way tile-based games autotile walls and
paths. Draw a rough shape with an Auto character and it comes out as joined lines or a bordered panel; draw next to it
later and the touching cells re-pick so everything stays joined.

Built in v0.134 (v1 to v3) on the `autotile` branch. Tick an item (`[x]`) when it's built. The open questions got defaults
(under Decisions, at the end): they're Claude's picks, for the user to confirm or change.

## How it differs from Smart lines

The Smart lines (Pencil Smart mode, Shape and Outline styles, v0.70) pick characters **along a stroke, once**, from its
slope and where it crosses each cell. That's right for freehand curves, and they stay as they are.

Autotile picks characters **from the grid**: which neighboring cells are also auto. So it:
- works with every tool, not just strokes: Pencil, Brush, Fill, Shape, Eraser, Mirror, the right button, a selection
- stays live: erase a cell or draw next to one, and the cells around it re-pick
- is exact on the grid (no slopes), so it suits boxes, panels, pipes, maps and UI frames, which are most of NeoN+1's art

## How it's stored

- [x] Each cell keeps its **resolved character** in `layer.cells`, as now, so copy, export, the game, the wand and everything
  else just see normal characters
- [x] Plus a per-layer map of which cells are auto and in which set: `layer.auto: Map "x,y" -> setId`
- [x] Painting an Auto character (a stand-in, like Clear) adds the cell to `layer.auto` and resolves it and its neighbors.
  Painting anything else, or Clear, removes the cell from the map and re-resolves its neighbors
- [x] Re-resolving only touches the changed cells and their 8 neighbors, so big fills stay fast
- [x] Saved in the project file (an `auto` list per layer, for example `[x, y, setId]` runs) and in undo snapshots; older
  files have none and load as before
- [x] A floating block (move, copy, paste) carries its auto cells and re-resolves where it's dropped, against what's there

## How a cell picks its character

- [x] **4-neighbor sets** (lines): look at the cells above, right, below and left: 16 cases, one character each.
  Example, Box: none `·` or `─`, left+right `─`, up+down `│`, right+down `┌`, all four `┼`, and so on
- [x] **8-neighbor sets** (regions): also look at the corners, so a filled area gets edges, outer corners and inner
  corners (the "47-tile blob" from game autotiling). Example, Panel: `┌─┐ │ │ └─┘` around any painted shape, with an
  inside fill (opaque space, a character, or clear). Built as: a cell with all 8 neighbors is inside; an edge cell uses the
  same 16-piece table as the lines, with the edge running through it (so inner corners come out right, and one table
  covers all 47 cases). Blocks and Shade have their own rules (Blocks: the shape shrunk by half a cell, in quarter blocks)
- [x] **What counts as a neighbor**: by default, cells of the same set on the same layer. Option: any auto cell (sets join
  each other), or any non-empty character (join onto plain art, like Box lines already join existing box characters)
- [x] Rules for dead ends and single cells (a lone cell: `+`, `·` or `o`; a line end: the straight piece or a cap)

## The first sets

- [x] **ASCII lines** (4): `- | +` with `+` corners and joins. Variants: rounded corners `. ' ` (` .-. `), and `/ \` corners
- [x] **Box** (4): `─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼`. Variants: Rounded `╭ ╮ ╰ ╯`, Heavy `━ ┃ ┏ ...`, Double `═ ║ ╔ ...`
- [x] **Panel** (8): a bordered region in Box or ASCII lines, inside opaque space (a window or dialog: paint the area, get the frame)
- [x] **Blocks** (8): `█` inside, `▀ ▄ ▌ ▐` edges, `▘ ▝ ▖ ▗` and `▛ ▜ ▙ ▟` corners, for chunky shapes with clean edges
- [x] Later: **Pipes** (4, with `═ ║` and `╬`), **Shade** (8: `▓` inside fading to `▒ ░` at the edge), **Brick / stone** (8)

## Tools and UI

- [x] **Characters > Special** gets an **Auto** swatch, next to opaque space and Clear (a green outline, say, so the three are
  told apart). Picking it makes the active set the drawing character, for any tool
- [x] The top bar shows **Set: Box ▾** whenever Auto is the character: the set list with a 3 x 3 preview of each, like the
  pattern and ramp menus. (Pencil, Brush, Fill and Shape; it changes the selected chip if it holds Auto, else the other one.
  The menu's footer has the join setting: Same set / Any auto / Any art)
- [x] The cursor and the cell highlight show the cell that will change; a faint preview of the neighbors that will re-pick
- [x] A view toggle next to **Spaces**: **Auto** marks auto cells (a small corner tick) so you can tell them from plain art
- [x] The right button paints the right-button character as usual (it can be Auto too, in another set)
- [x] The Eraser and Clear remove auto cells and re-resolve the neighbors (so erasing the middle of a box line leaves two clean ends)
- [x] Mirror: the mirrored copies are auto too, and resolve on their own side (no character flipping needed)
- [x] The Picker on an auto cell picks Auto in that set

## Converting

- [x] **Bake auto** (Layer menu or selection): the cells keep their characters and stop being auto (the art is final)
- [x] **Make auto** (selection): cells whose characters belong to a set become auto in it (turn old box art live again)
- [x] Text layers (the Font tool) and protected layers: auto painting follows the same protect rules as the other tools

## Your own sets

- [x] A set editor, like the ramp and noise customizers: a 4 x 4 grid (16 cases) or the 47-case blob grid, a character in each,
  live preview, Save as new set; kept in the browser like your own ramps and brushes. (The ⚙ next to Set. Regions use the
  same 4 x 4 grid for their edge, plus the Inside; a document that uses your sets saves them with it)
- [x] **Learn from an example**: select a small hand-drawn sample (a box, a panel) and the editor fills in the table from it
- [x] Sets as files: export and import a set, so NeoN+1 corps or players can share them

## Versions

- **v1**: the stored map, 4-neighbor resolving, ASCII lines and Box (with Rounded / Heavy / Double), the Auto swatch and
  Set menu, all drawing tools, Eraser / Clear, undo, save and load, Bake auto
- **v2**: 8-neighbor sets (Panel, Blocks), the Auto view toggle, floating blocks, Make auto, Mirror
- **v3**: your own sets, learn from an example, Pipes / Shade / Brick, set files

## Open questions

Defaults picked for now (see Decisions); change any of them.

- [ ] Does Auto join plain art by default (like Box lines do today), or only other auto cells?
- [ ] Two sets touching: do they join (a Box line running into a Heavy line gets `┝`), or stay apart?
- [ ] Should the Shape tool's styles become sets (Rectangle in Box = a Box auto rectangle), or stay as they are?
- [ ] Is auto per cell (as planned) or per layer (a whole layer is "a Box layer")? Per cell is more flexible; per layer is simpler
- [ ] What do lone cells and line ends look like in each set?

## Decisions (Claude's defaults, v0.134; for the user to confirm)

- **Joining plain art**: no, by default. Auto cells join the same set on the same layer. The Set menu has the setting (saved
  with the document): **Same set**, **Any auto** (sets join each other), **Any art** (any character counts, so auto lines
  run into plain art). Changing it re-picks everything, as one undo step
- **Two sets touching**: with Same set, they stay apart; with Any auto, each joins the other in its own characters (a Box
  line running into a Heavy line gets `┤` on its side, the Heavy line `━`). No mixed characters like `┝`
- **Shape styles**: stay as they are. Shape's Character style draws with the Primary character, so Auto in a chip draws an
  auto rectangle (a Box auto rectangle comes out as a box, and two overlapping ones join)
- **Per cell or per layer**: per cell, as planned
- **Lone cells and line ends**: line ends are the straight piece (`─`, `│`); a lone cell is `+` (ASCII), `□` (Box,
  Rounded, Double), `■` (Heavy), `◎` (Pipes). Pipes ends get a flange (`╞ ╡ ╥ ╨`). In Blocks, a lone cell is `█`
- **The Auto swatch**: one in Special, showing the last set used (green). Recent keeps the built-in sets' Auto too
- **Typing**: the Type tool can't type Auto (clicking the swatch with a caret sets the chip instead)
