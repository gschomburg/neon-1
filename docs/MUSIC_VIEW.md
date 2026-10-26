# Music View

A sequencer-style view of NeoN+1's music: a piano roll for every part of a track, laid out the way the engine
actually builds the music (passes, sections, form, levels), so you can see and hear exactly what plays and why.

`tools/music_view.html`, next to the existing music tool (`tools/music.html`). The music tool stays the place for
browsing, rating and assigning tracks; Music View is for looking inside one track and working on its parts.

## Decisions (2026-10-25)

- **First batch: view + mute / solo.** Sections 1-4 and 7 first; editing (5) and export (6) come after the view
  reads right.
- **Small engine hooks** in `engine/music.js` for the playhead, mute, seek and loop. Off by default, so the game
  plays exactly as before.
- **Rows use each lane's own numbers** (melody degrees, bass steps from the chord root, arp tones 0-5), the same
  numbers the track is written in. A toggle adds note names.
- **Default timeline: section view + form strip.** One section's pass at a time, the form strip on top to jump
  around; the whole-song unrolled view is a second mode.

## The engine, as the view has to show it

What the view is built around (all from `dist/engine/music.js`):

- **A pass** is one time through the chords (`prog`): `prog.length` bars of 16 steps (12 in 3/4 and 6/8).
- **Sections:** the track itself is A. `B`, `C`, `D` override any field except `bpm` and `meter`. `form` (e.g.
  `'AABA'`, the default when there's a B) says which section each pass plays, then loops.
- **Written parts are bar lists that run on a global bar count** (`pass × prog.length + bar`), not per section. A
  2-bar melody over a 4-chord prog plays twice per pass; a B section's melody list is indexed by the same count.
- **Each lane has its own number system:**
  - melody: scale degrees from the track's root (0 = root, 7 = an octave up), two octaves above the bass
  - bassLine: scale steps from the current chord's root
  - arpLine: chord tones 0-5 (0-2 the chord, 3-5 an octave up)
  - beat / stab / gate: hits (`x`)
- **Parts come in by level:** 0 pad + bass, 1 drums, 2 arp, 3 lead (boss, melody doubled up), 4 final boss
  (louder). `melodyAt` and `stabAt` move those.
- **Generated parts:** `drums`, `bass`, `arp` patterns when there's no written part; the stock boss lead
  (`LEAD_DEGREES`) when there's no melody; automatic drum fills on every second pass and before a section change,
  with a crash on the next bar; `breakdown` passes drop drums and bass.
- **Ambient tracks** (`style: 'ambient'`) are a separate player with no parts to show.

## Layout

```
┌ track: NIGHT DRIVE ▾   F minor · 92 bpm · 4/4   [▶] [■]  level 0 1 2 3 4   urgency ━━○  loop: pass ▾ ┐
├ FORM  [A][A][B]   ← passes; click one to jump there, the playing one lit                               ┤
├ CHORDS   i      VI     III    VII        (per bar of the section being shown)                          ┤
├─────────┬──────────────────────────────────────────────────────────────────────────────────────────────┤
│ M S  melody   │ piano roll, degree rows (… 9 8 7 | 6 5 4 3 2 1 0 …), notes as bars, holds as length    │
│ M S  arp      │ 6 rows: tones 0-5, labeled with what they are in each bar's chord                      │
│ M S  stab     │ hit row (chord shown)                                                                  │
│ M S  pad      │ chord blocks per bar, or the gate's hits                                               │
│ M S  bass     │ chord-relative rows, root line marked                                                  │
│ M S  drums    │ kick / snare / hat / open / clap / ghost rows; fills and crashes marked                │
├─────────┴──────────────────────────────────────────────────────────────────────────────────────────────┤
│ inspector: the selected lane's voice, pattern or written part, level gate, the raw text of the part    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Plan

## First batch: done 2026-10-25

Files: `tools/music_view.html` (the page), `tools/music_view_resolve.js` (the resolver),
`tools/music_view_check.js` (resolver vs engine), engine hooks in `dist/engine/music.js`, a link in `tools/music.html`.

### 1. Groundwork
- [x] `tools/music_view.html`: loads the same game files as the music tool (data/music.js, engine/music.js,
      engine/sound.js, every corp), with the same stand-ins for the game globals
- [x] add it to `tools/bump.js`'s corp-list sync (`<!-- corps: begin/end -->`) so new corps show up
- [x] track picker: every track in `SONGS` (the music tool's demos stay in the music tool), grouped shared / new / by corp,
      showing where it plays (`MUSIC_FOR`)
- [x] the player state the engine reads (level, urgency, low integrity), same shape as the music tool's

### 2. Engine hooks (small, game-safe: the game never calls them)
- [x] `Music.position()`: the current step, bar, pass and section letter, for the playhead
- [x] `Music.mute(set)`: lanes to silence (melody, lead, arp, stab, pad, bass, kick, snare, hat, open, clap,
      ghost, fills), checked in `playStep`; solo is done in the view as "mute everything else"
- [x] `Music.seek(pass)`: start from a given pass, so you can jump to the B section
- [x] `Music.loop(pass | null)`: hold on one pass (or one section) instead of following the form
- [x] check the game still plays the same (the hooks default to off)

### 3. The resolver: what actually plays
One function that takes a track and returns every note of a pass, already worked out, so the roll never has
to guess:
- [x] section merge (`sectionSong`), form, global bar count for bar lists
- [x] each note with: lane, step, length, its number in the lane's own system, the scale degree it lands on,
      and the MIDI note (for a "show note names" toggle)
- [x] generated parts filled in and flagged as generated: drum / bass / arp patterns, the stock boss lead, auto
      fills (which style, from the pass number), the crash after a fill, breakdown passes
- [x] level gating: each note knows the level it starts at
- [x] unit-check it against the engine: `node tools/music_view_check.js` plays every track headless, one part
      at a time at every level, and compares the 16ths that sound with the resolver's notes (2580 checks, all match)

### 4. The views
- [x] **form strip:** one block per pass in `form`, lettered, colored per section; breakdown and fill passes
      marked; the playing pass lit; click to jump / loop
- [x] **chord row:** the chord of each bar (roman numerals in the track's scale, plus the actual chord name)
- [x] **lanes**, each with its own axis (see above), sharing one time grid with beat and bar lines (12-step
      bars for 3/4 and 6/8)
- [x] notes drawn with their length (held `-`), rests empty; generated notes drawn hollow / dimmer than written ones
- [x] lanes above the current level greyed out ("comes in at level 2")
- [x] the boss octave double shown as a ghost line above the melody at level 3+
- [x] playhead that follows the music
- [ ] swing shown in the roll (late 16ths drawn offset)
- [x] **song view:** the whole form unrolled left to right (every pass), zoomable
- [x] **section view:** one section's parts (A, B, C, D tabs), where editing happens
- [x] **mute / solo** per lane, and per drum row
- [x] inspector: the lane's voice, pattern, level gate, and its part as the raw text the game uses
- [x] ambient tracks: a simple read-only panel (chords, tempo, echo) since they have no parts

### 5. Editing
- [ ] click / drag to add, move, lengthen, delete notes in a lane's own number system; hits toggle on click
- [ ] edit per section: changing B writes to `B.melody`, etc.; a lane B doesn't override shows A's part
      (dimmed) with an "override in B" button
- [ ] bar lists: add / remove / duplicate bars of a part; show how a short list repeats across the pass
- [ ] form editor: add / remove / reorder passes, add a C or D section (copied from A or B)
- [ ] chords: change `prog` per section
- [ ] track settings: bpm, root, scale, meter, swing, pump, echo, feedback, breakdown, fills, sevenths, voices, kit
- [ ] turn a generated part into a written one (e.g. "write out this drum pattern") to edit from there
- [ ] undo / redo
- [ ] changes play live (the engine reads the track each step)

### 6. Getting changes out
- [ ] remember edits in the browser, like the music tool does
- [ ] "copy track": the track as a line of code in the game's format, ready to paste into data/music.js or a
      corp file; "copy all changes"
- [ ] reset a track to the game's version

### 7. Finish
- [x] keyboard: space play / stop, 0-4 level, M / S on the focused lane, arrows to move between passes
- [x] link between the two tools (music tool → "open in Music View")
- [x] docs/MUSIC.md: a short section on Music View and the track format
- [x] check every track loads and renders without errors (all 88, both views, levels 0 and 4)
