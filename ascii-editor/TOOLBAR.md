# asXii: tool settings bar plan

The bar under the menus (`#optionsbar`: the tool name, `#toolopts`, `#hint`). The goal: a calm, stable bar that only holds
the current tool's settings. Actions move to menus, help moves to a sidebar panel, and settings several tools share
move to their own panels.

Tick an item (`[x]`) when it's built. Decisions are from the user (2026-10-24), including their notes on the open
questions (now under Decisions, at the end).

## The problems

- The bar's height changes with the tool and its settings, so everything below it jumps
- Too fussy: boxes inside boxes, controls of different heights
- It does too much: actions (Extrude, Make pattern, Flip...) sit next to settings
- The help line ("Drag to select · Shift adds · ...") is one long strip at the edge, hard to read
- Some settings belong to more than one tool (Mirror, the character, the Paint source) but live in one tool's bar

## 1. A stable, flat bar

- [ ] One row, always the same height (about 36px), whatever the tool. Nothing below it moves when you switch tools or settings
- [ ] Left: the tool name, at a fixed width (Magic wand counts as its own name). Then the settings, left to right
- [ ] Each tool's settings are split in two, and the split is fixed (it doesn't depend on the window):
  - the **main** ones, in the bar: few enough that the bar fits a normal window
  - the **secondary** ones, in a **…** menu at the right end of the bar (a popover with those controls, stacked, under a
    heading). The **…** button is always in the same place, and only shows for tools that have secondary settings
- [ ] If the window is too narrow even for the main settings, the bar clips at the right with a fade (it never wraps or grows)
- [ ] Flat style: no boxes around groups. A muted label, then plain text toggles; the chosen one is tinted (or underlined).
  Thin dividers between groups. Every control the same height. Number fields and dropdowns styled to match
- [ ] The "inside selection" note (`#selnote`) moves to the Help panel (and the canvas outline already shows the selection)
- [ ] The help strip (`#hint`) is removed from the bar (see 3)

## 2. Actions move to menus and a right-click menu

- [ ] New **Select** menu: Select all (Ctrl A), Deselect (Ctrl D), Flip ↔, Flip ↕, Fill selection (Alt Backspace),
  Extrude…, Make pattern…, and for a floating block: Drop (Enter), Drop solid (Shift Enter)
- [ ] **Layer** menu gets: Rasterize and Merge down (from the Font tool's bar), and the Block tool's Bake and Clear blocks
- [ ] Block: **Edit 3D** becomes a menu item and a double-click on the blocks (it opens the 3D editor)
- [ ] Font: **Done** goes (Esc already finishes the text; the Help panel says so)
- [ ] A **right-click menu** on the canvas with whatever applies there: the Select items when there's a selection or a
  floating block, the Layer items for a text layer or blocks, plus Undo / Redo / Copy / Paste. See the open question
  about tools that already use the right button
- [ ] Every menu item shows its shortcut

## 3. Help panel (top of the right sidebar)

- [ ] The first panel in the sidebar: the tool's name, a one-line summary, then **one modifier or key per line**: the key in
  bold (a small key chip: **Shift**, **Alt**, **Space**), then what it does
- [ ] Live: the line for a key you're holding lights up, and while you drag it switches to the keys that matter mid-drag
  (Select: before the drag Shift adds / Alt takes away; during it Shift = square, Alt = from center, Space moves it)
- [ ] It shows the current state too: "inside the selection" when a selection limits drawing, "Mirror: ↔" when the tool is
  mirroring, the polygon being clicked out ("click the first point to close")
- [ ] A short "any tool" section at the bottom, dimmer: Space pans, Ctrl + wheel zooms, Shift + wheel scrolls sideways, hold
  a tool key to use it for a moment
- [ ] The text comes from one table per tool (replacing `HINTS`), so the Help menu and the panel stay in step

## 4. Collapsible sidebar panels

- [ ] Every panel (Help, Info, Canvas, Characters, Paint, Symmetry, Layers) folds by clicking its title, with a ▸ / ▾ marker
- [ ] Each remembers open or closed (in the browser prefs). Any number can be open
- [ ] Order: Help, Info, Canvas, Characters, Paint, Symmetry, Layers. Layers keeps taking the leftover height
- [ ] The sidebar is **resizable**: drag its left edge (about 240 to 480px), remembered in the browser prefs
- [ ] **Paint** and **Symmetry** always show, dimmed with a note ("not used by Select") when the current tool doesn't use them

## 5. Characters panel: two slots

- [ ] Like foreground / background colors: a **Draw** slot (left button) and a **Right** slot (right button, today's
  "Right button" setting), side by side at the top of Characters, with a swap button (X swaps, like Photoshop)
- [ ] Clicking a character in the palette sets Draw; right-clicking one sets Right. The Picker keeps working as now
  (click = Draw, Shift-click or right-click = Right)
- [ ] The Pencil's character box (type any character), the quick characters and **Recent** move here, under the slots
- [ ] The brush chip at the bottom of the toolbox shows both slots

## 6. Paint panel

- [ ] The Paint source moves out of the Brush and Fill bars into its own panel: Character / Noise / Pattern / Ramp, with each
  one's options (the noise set and Density, the pattern, the ramp, Customize, White space)
- [ ] Used by the Brush, Fill, and Shape's Fill inside; dimmed for other tools
- [ ] Character mode paints the Draw slot

## 7. Symmetry panel and "uses mirror" per tool

- [ ] A **Symmetry** panel holds the mirror setup: the left-right and top-bottom lines on or off, their positions (as numbers,
  plus dragging the triangles on the canvas), Center, Flip characters
- [ ] Each tool that changes art gets a **uses mirror** icon toggle in its bar (always in the same spot, at the right end
  before **…**). Remembered per tool. Tools that don't change art (Hand, Zoom, Picker) don't have it
- [ ] The mirror lines and triangles show on the canvas whenever the current tool uses mirror
- [ ] It applies to everything that changes art:
  - [ ] Pencil, Brush, Eraser (as today)
  - [ ] Shape: the mirrored shape is drawn too
  - [ ] Fill: the mirrored cell is filled too (its own region on that side)
  - [ ] Selections: selecting also selects the mirrored area
  - [ ] Move and paste: the mirrored copy moves or lands opposite, flipped
  - [ ] Type and Font: typing on one side types mirrored on the other (characters flipped, order reversed)
  - [ ] Block: a bake is mirrored
- [ ] The Help panel says when mirroring is on for the tool

## 8. What stays in each tool's bar

Main settings sit in the bar; secondary ones in the **…** menu. Every tool that changes art also has **uses mirror** (7).

| Tool | Main (in the bar) | Secondary (in …) |
|---|---|---|
| Select | Shape (Rectangle, Ellipse, Lasso, Polygon, Wand); Wand: Contiguous | Fixed aspect, From center (Rectangle, Ellipse); Look at (Wand) |
| Move | White space (Solid / Clear) | |
| Type | Overwrite / Insert | |
| Font | Font ▾ | Spacing, letter and line spacing, White space |
| Pencil | Character / Smart, Style (Smart), Size | Tip |
| Brush | Brush ▾ (presets, Customize), Size | |
| Eraser | Size | Tip |
| Shape | Shape kind, Style | Fixed aspect, From center, Fill inside |
| Block | Angle, Show (ASCII / Shapes) | Block size |
| Fill | Contiguous | Look at |
| Picker | Look at | |
| Hand, Zoom | (just the tool name) | |

Moved out: every action (2), the help text (3), the character, quick characters, Recent and Right button (5), the Paint
source (6), the Mirror setup (7).

## Versions

- **v1**: the stable flat bar with **…**, actions to the Select and Layer menus, the Help panel (live), collapsible panels
- **v2**: Characters slots, the Paint panel, the Symmetry panel with uses-mirror for Pencil, Brush, Eraser, Shape and Fill,
  the right-click menu
- **v3**: mirroring for selections, move and paste, Type and Font, and Block

## Decisions (the user's notes on the open questions)

- **Right-click menu vs the right button**: as planned. The menu opens on right-click for the tools that don't use the right
  button, and with **Ctrl / Cmd + right-click** (or a long press) on Pencil, Brush, Eraser, Picker and Block
- **Look at: Layer / All**: stays per tool (Wand, Fill and Picker each have their own)
- **White space** (Solid / Clear): stays one per place (Move, Font, the Paint panel)
- **Size and Tip**: stay separate per tool, as now
- **The … menu**: fixed contents. It's not "what didn't fit", it's "the additional settings that don't need to be on the main
  bar"; the main bar stays small enough to usually fit (see 1 and 8)
- **Sidebar width**: resizable (see 4)
