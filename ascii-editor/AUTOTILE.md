# asXii: autotile plan

Auto characters: cells that pick their own character from their neighbors, the way tile-based games autotile walls and
paths. Draw a rough shape with an Auto character and it comes out as joined lines or a bordered panel; draw next to it
later and the touching cells re-pick so everything stays joined.

Built on the `autotile` branch: v0.134 kept auto cells in a map beside the art; v0.135 switched to the user's model,
where the code is stored in the cell (below). The user's notes from v0.135 are under Decisions, at the end.

## How it differs from Smart lines

The Smart lines (Pencil Smart mode, Shape and Outline styles, v0.70) pick characters **along a stroke, once**, from its
slope and where it crosses each cell. That's right for freehand curves, and they stay as they are.

Autotile picks characters **from the grid**: which neighboring cells are also auto. So it:
- works with every tool, not just strokes: Pencil, Brush, Fill, Shape, Eraser, Mirror, the right button, a selection
- stays live: erase a cell or draw next to one, and the cells around it re-pick
- is exact on the grid (no slopes), so it suits boxes, panels, pipes, maps and UI frames, which are most of NeoN+1's art

## How it's stored (v0.135)

- [x] A layer is still a grid of characters (a sparse map, "x,y" -> character). An auto cell holds its **set's code**:
  a private-use character, U+E101 for set 1, U+E102 for set 2 and so on. Nothing else is stored, so copy, paste, move,
  undo, layers and save carry auto cells like any other character
- [x] Wherever the art is **shown, copied as text or exported**, a code resolves to a real character, picked from its
  neighbors: the cells with the same code on the same layer (`glyphAt`, `compositeAt`). A copied piece resolves on its own
- [x] **Copy and Cut** (v0.139) put both on the clipboard: the resolved text (what Slack, a text editor and so on paste) and the
  raw cells under asXii's own type (`application/x-asxii-raw`), so pasting back into asXii keeps auto cells auto
- [x] **Copy raw** (Edit menu, right-click menu, Ctrl Alt C) puts the codes in the plain text, for apps like the game; with
  nothing selected it copies the whole canvas. Pasting codes back (from Copy raw or a file) gives auto cells
- [x] Saved files store the codes in the rows. Older files have none and load as before
- [x] The **Wand and Fill** match raw characters, so clicking any piece of a Box line selects or fills the whole set
  (connected, or all of it with Contiguous off), and plain art never matches auto cells. The Picker picks the code

## How a cell picks its character

- [x] **Lines** (4 neighbors): up, right, down and left, 16 cases, one character each (0 is a lone cell). Line ends are the
  straight piece
- [x] **Regions** (8 neighbors): a cell with all 8 neighbors is inside; an edge cell uses the same 16-piece table, with the
  edge running through it, so outer and inner corners come out right (the "47-tile blob", from one table). Blocks and
  Shade have rules of their own (Blocks: the shape shrunk by half a cell, in quarter blocks)
- [x] A cell only joins cells of **its own set** on the same layer

## The sets (a fixed library)

Labeled in the order below; a set's label and code never change (new sets go at the end, E-Z).
`1` ASCII, `2` ASCII rounded, `3` ASCII slashes, `4` Box, `5` Box rounded, `6` Box heavy, `7` Box double, `8` Pipes,
`9` Panel, `0` Panel rounded, `A` Panel ASCII, `B` Blocks, `C` Shade, `D` Brick.


- [x] **ASCII lines** (4): `- | +` with `+` corners and joins. Variants: rounded corners `. ' ` (` .-. `), and `/ \` corners
- [x] **Box** (4): `─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼`. Variants: Rounded `╭ ╮ ╰ ╯`, Heavy `━ ┃ ┏ ...`, Double `═ ║ ╔ ...`
- [x] **Panel** (8): a bordered region in Box or ASCII lines, inside opaque space (a window or dialog: paint the area, get the frame)
- [x] **Blocks** (8): `█` inside, `▀ ▄ ▌ ▐` edges, `▘ ▝ ▖ ▗` and `▛ ▜ ▙ ▟` corners, for chunky shapes with clean edges
- [x] Later: **Pipes** (4, with `═ ║` and `╬`), **Shade** (8: `▓` inside fading to `▒ ░` at the edge), **Brick / stone** (8)

## Tools and UI

- [x] **Characters › Autotile**, a group under Special: one green button per set, by label (1-9, 0, A-Z). Hovering one shows
  its name and a preview. Click one to put it in the selected chip; any tool that paints a character can draw it
- [x] The chips, Recent and the bar show an auto code as its green label
- [x] Painting previews (the brush under the pointer, a Shape being dragged) show the cells as they'll come out, and the
  auto cells around them that will re-pick. The Eraser previews the re-picks too
- [x] The **Auto** button (top bar) switches the canvas between what auto cells resolve to and their labels (green)
- [x] The right button paints the Secondary chip as usual (it can be auto too). Erasing re-picks the cells around it
- [x] Mirror: the mirrored copies are auto too, and resolve on their own side
- [x] The Type tool can't type a code (clicking a set with a caret puts it in the chip)

## Converting

- [x] **Bake auto cells** (Layer menu, right-click menu): the auto cells in the selection, or on the whole layer, become the
  characters they show
- [x] **Make auto** (Select menu, right-click menu): the selected cells whose characters belong to a set become auto in it
  (the set that fits the most of them)
- [x] Text layers: auto painting follows the same protect rules as the other tools

## Decisions (the user's notes on v0.134)

- **Data model**: the code in the cell, resolved when read (not a map beside the art)
- **Raw copy**: private-use characters, one per set (the same codes the file stores)
- **Wand and Fill**: match by set
- **Sets**: a fixed library, the 14 above. No set editor, no sets of your own, no set files (v0.134 had them)
- **Joining**: a set joins only itself (v0.134's Same set / Any auto / Any art setting is gone)
- **Copy raw**: its own command (Ctrl Alt C); Ctrl C copies what you see
- **The Set dropdown** in the bar is replaced by the Autotile group
