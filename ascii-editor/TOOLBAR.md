# asXii: tool settings bar plan

The bar under the menus (`#optionsbar`: the tool name, `#toolopts`, `#hint`). The goal: a calm, stable bar that only holds
the current tool's settings. Actions move to menus, help moves to a sidebar panel, and settings several tools share
move to their own panels.

Built in v0.105 (all of v1 to v3). Tick an item (`[x]`) when it's built. Decisions are from the user (2026-10-24), including their notes on the open
questions (now under Decisions, at the end).

## The problems

- The bar's height changes with the tool and its settings, so everything below it jumps
- Too fussy: boxes inside boxes, controls of different heights
- It does too much: actions (Extrude, Make pattern, Flip...) sit next to settings
- The help line ("Drag to select · Shift adds · ...") is one long strip at the edge, hard to read
- Some settings belong to more than one tool (Mirror, the character, the Paint source) but live in one tool's bar

## 1. A stable, flat bar

- [x] One row, always the same height (about 36px), whatever the tool. Nothing below it moves when you switch tools or settings
- [x] Left: the tool name, at a fixed width (Magic wand counts as its own name). Then the settings, left to right
- [x] Each tool's settings are split in two, and the split is fixed (it doesn't depend on the window):
  - the **main** ones, in the bar: few enough that the bar fits a normal window
  - the **secondary** ones, in a **…** menu at the right end of the bar (a popover with those controls, stacked, under a
    heading). The **…** button is always in the same place, and only shows for tools that have secondary settings
- [x] If the window is too narrow even for the main settings, the bar clips at the right with a fade (it never wraps or grows)
- [x] Flat style: no boxes around groups. A muted label, then plain text toggles; the chosen one is tinted (or underlined).
  Thin dividers between groups. Every control the same height. Number fields and dropdowns styled to match
- [x] The "inside selection" note (`#selnote`) moves to the Help panel (and the canvas outline already shows the selection)
- [x] The help strip (`#hint`) is removed from the bar (see 3)

## 2. Actions move to menus and a right-click menu

- [x] New **Select** menu: Select all (Ctrl A), Deselect (Ctrl D), Flip ↔, Flip ↕, Fill selection (Alt Backspace),
  Extrude…, Make pattern…, and for a floating block: Drop (Enter), Drop solid (Shift Enter)
- [x] **Layer** menu gets: Rasterize and Merge down (from the Font tool's bar), and the Block tool's Bake and Clear blocks
- [x] Block: **Edit 3D** becomes a menu item and a double-click on the blocks (it opens the 3D editor)
- [x] Font: **Done** goes (Esc already finishes the text; the Help panel says so)
- [x] A **right-click menu** on the canvas with whatever applies there: the Select items when there's a selection or a
  floating block, the Layer items for a text layer or blocks, plus Undo / Redo / Copy / Paste. See the open question
  about tools that already use the right button
- [x] Every menu item shows its shortcut

## 3. Help panel (top of the right sidebar)

- [x] The first panel in the sidebar: the tool's name, a one-line summary, then **one modifier or key per line**: the key in
  bold (a small key chip: **Shift**, **Alt**, **Space**), then what it does
- [x] Live: the line for a key you're holding lights up, and while you drag it switches to the keys that matter mid-drag
  (Select: before the drag Shift adds / Alt takes away; during it Shift = square, Alt = from center, Space moves it)
- [x] It shows the current state too: a floating block (Enter drops it). (v0.119 and v0.120: the "inside the selection",
  "mirroring" and polygon notes were dropped; the canvas shows those)
- [x] A short "any tool" section at the bottom, dimmer: Space pans, Ctrl + wheel zooms, Shift + wheel scrolls sideways, hold
  a tool key to use it for a moment
- [x] The text comes from one table per tool (replacing `HINTS`), so the Help menu and the panel stay in step

## 4. Collapsible sidebar panels

- [x] Every panel (Help, Info, Canvas, Characters, Paint, Symmetry, Layers) folds by clicking its title, with a ▸ / ▾ marker
- [x] Each remembers open or closed (in the browser prefs). Any number can be open
- [x] Order: Help, Info, Canvas, Characters, Paint, Symmetry, Layers. Layers keeps taking the leftover height
- [x] The sidebar is **resizable**: drag its left edge (about 240 to 480px), remembered in the browser prefs
- [x] **Paint** and **Symmetry** always show, dimmed with a note ("not used by Select") when the current tool doesn't use them

## 5. Characters panel: two slots

- [x] Like foreground / background colors: a **Draw** slot (left button) and a **Right** slot (right button, today's
  "Right button" setting), side by side at the top of Characters, with a swap button (X swaps, like Photoshop)
- [x] Clicking a character in the palette sets Draw; right-clicking one sets Right. The Picker keeps working as now
  (click = Draw, Shift-click or right-click = Right)
- [x] The Pencil's character box (type any character), the quick characters and **Recent** move here, under the slots
- [x] The brush chip at the bottom of the toolbox shows both slots

## 6. Paint panel

- [x] The Paint source moves out of the Brush and Fill bars into its own panel: Character / Noise / Pattern / Ramp, with each
  one's options (the noise set and Density, the pattern, the ramp, Customize, White space)
- [x] Used by the Brush, Fill, and Shape's Fill inside; dimmed for other tools
- [x] Character mode paints the Draw slot

## 7. Symmetry panel and "uses mirror" per tool

- [x] A **Symmetry** panel holds the mirror setup: the left-right and top-bottom lines on or off, their positions (as numbers,
  plus dragging the triangles on the canvas), Center, Flip characters
- [x] Each tool that changes art gets a **uses mirror** icon toggle in its bar (the last thing in the tool's settings, after
  a divider; v0.117). Remembered per tool. Tools that don't change art (Hand, Zoom, Picker) don't have it
- [x] The mirror lines and triangles show on the canvas whenever the current tool uses mirror
- [x] It applies to everything that changes art:
  - [x] Pencil, Brush, Eraser (as today)
  - [x] Shape: the mirrored shape is drawn too
  - [x] Fill: the mirrored cell is filled too (its own region on that side)
  - [x] Selections: selecting also selects the mirrored area
  - [x] Move and paste: the mirrored copy moves or lands opposite, flipped
  - [x] Type and Font: typing on one side types mirrored on the other (characters flipped, order reversed). Font keeps
    the mirror setup on the text, so the layer stays a text layer
    - [ ] Not yet: Insert typing pushes the row along on the typed side only (the mirrored row doesn't shift)
  - [x] Block: a bake is mirrored
- [x] The Help panel says when mirroring is on for the tool

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

## 9. Polish round (v0.114, the user's notes after trying v0.113)

Quieter and more consistent. Changes below supersede the parts of 1, 5, 7 and 8 they touch.

### No instruction text in the UI
- [x] Instructions live in the Help panel only. Remove the ones this branch put in the UI: the Paint and Symmetry notes
  ("Not used by …", "Turn a line on to mirror", "… isn't mirroring"), "Paints the Draw character", "none yet" under
  Recent, and how-to toasts (clicking the Right well, the uses-mirror toggle). An unused Paint or Symmetry panel is just faded
- [x] Toasts that confirm a change made off-screen stay (picking a character, setting Right)

### One selected state everywhere
- [x] Every "on" or "selected" control uses the same look as the selected character in the palette: the bright blue
  (`--accent`) fill with `--accent-ink` text. That covers segment choices (the select shape, Overwrite / Insert…), toggles
  (uses mirror, the Symmetry lines, Fixed aspect…), the palette and Recent
- [x] Toggle buttons that stand alone get an outline when off, so they read as buttons (the Symmetry line buttons first)

### Symmetry
- [x] No "Lines" label: just the ↔ Left-right and ↕ Top-bottom toggle buttons, outlined
- [x] The mirror lines and their triangles always show on the canvas when a line is on, faded to 25% when the current
  tool isn't mirroring (full strength when it is). The triangles can be dragged with any tool
- [x] The cell highlight's mirrored copies only show when the tool is mirroring
- [x] The panel fades when the tool isn't mirroring (no message)

### Characters
- [x] **Recent** becomes its own group at the top of the palette, above Special: one row, as many recent characters as fit
- [x] The Draw and Right slots lose their labels; they sit side by side, centered vertically, with the swap arrows ⇄ between them
- [x] The slots are the wells: click one and type a character to set it (the separate type-in box goes)

### Everything in the bar (no … menu)
- [x] The … menu goes. Every setting is in the bar; long ones become icon buttons (with a tooltip naming the setting and
  each choice) or a compact dropdown:
  - Select: the five shapes as icons; Fixed aspect and From center as icon toggles; Wand: Contiguous and Look at as icons
  - Shape: the four kinds as icons; Style stays a dropdown; Fixed aspect, From center, Fill inside as icon toggles
  - Pencil and Eraser: Tip as two icons (square / round)
  - Brush: Customize becomes a gear icon
  - Fill and Picker: Look at as icons (one layer / all layers); Fill: Contiguous as an icon toggle
  - Block: Size and Depth steppers in the bar; Faces stays a gear (it opens its own panel)
  - Font: Spacing and White space as compact dropdowns; Letters and Lines steppers in the bar
- [x] Complex settings open their own panel from a gear button, as Brush Customize, Block Faces and the Paint panel's
  Customize already do
- [x] The Help panel and the Help menu stop mentioning "…"

## Versions

- **v1**: the stable flat bar with **…**, actions to the Select and Layer menus, the Help panel (live), collapsible panels
- **v2**: Characters slots, the Paint panel, the Symmetry panel with uses-mirror for Pencil, Brush, Eraser, Shape and Fill,
  the right-click menu
- **v3**: mirroring for selections, move and paste, Type and Font, and Block

## Decisions (the user's notes on the open questions)

- **Right-click menu vs the right button**: as planned. The menu opens on right-click for the tools that don't use the right
  button, and with **Ctrl / Cmd + right-click** (or Ctrl-click on a Mac) on Pencil, Brush, Eraser, Picker and Block.
  (Long press, for touch, isn't built yet)
- **Look at: Layer / All**: stays per tool (Wand, Fill and Picker each have their own)
- **White space** (Solid / Clear): stays one per place (Move, Font, the Paint panel)
- **Size and Tip**: stay separate per tool, as now
- **The … menu**: fixed contents. It's not "what didn't fit", it's "the additional settings that don't need to be on the main
  bar"; the main bar stays small enough to usually fit (see 1 and 8). *Superseded in 9: the … menu goes, everything is in
  the bar, long settings as icons*
- **Sidebar width**: resizable (see 4)
