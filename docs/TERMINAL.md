# THE TERMINAL: a dev console you can type into

Started 2026-11-11 (Greg: "i'm sort of imagining the unreal console"). A plan to look over before step 1 is built.
Grows BACKLOG section 10 ("The dev menu as a one-line terminal", "More on the terminal", "A second window") and
"Dev menu buttons the editor's TESTING doesn't have yet".

## What it is

**Step 1 is built (v14.79):** `dist/engine/terminal.js`, checked by `tools/checks/tests/terminal.js`.

- A one-line prompt at the bottom of the screen, with the output lines above it, like a shell. It's plain HTML over
  the canvas, not drawn in the game's text grid: it has its own look (see Decided), and a real text box gives a phone
  its keyboard for free.
- As you type, a list of matching commands pops up above the prompt. **Up / Down** pick one, **Tab** fills it in,
  **Enter** runs it, **Esc** closes the list (a second Esc closes the terminal).
- **Up** on an empty prompt walks back through the commands you ran this session (not saved; see Decided).
- Arguments autocomplete too: after `give.mod ` the list is mod codes and names; after `corp.jump ` it's corps.
- `help` lists what you know. `help give.mod` prints its help line and arguments.
- Commands are `group.verb` (`give.mod`, `run.seed`, `mode.god`). Typing without the dot still matches
  (`givemod`, `give mod`), and matching is by prefix first, then anywhere in the name.

## Opening it

- **`~`** (Shift + `) or **Ctrl + `** opens and closes it. Plain **`** keeps opening the old dev menu until the terminal
  covers everything; then the old menu goes (Greg, 2026-11-11: "maybe we ditch it once we complete this").
- While it's open it takes every key (the game's keys don't fire), and the layer clocks, the eater, G0D.exe and the
  G0D fight hold still (`st.term`). Taps on the game above it still work.
- **Phones:** see below.

## On a phone

The trouble: no keyboard, and the phone's own keyboard covers about half the screen when it comes up.

- **Tap first, type second.** Opened on a phone, the terminal lists every command you know straight away, as rows you
  tap. Tap one and it goes into the prompt, and the list turns into its arguments (the mods, the corps) to tap. You can
  run most commands without the keyboard at all.
- **The keyboard is there to filter.** A `[ type ]` button (or tapping the prompt) brings it up. Typing narrows the
  list, like on desktop.
- **Where it sits:** while the keyboard is up, the terminal rides on top of it, so the prompt and the list stay in
  view. The browser says how much room the keyboard leaves (`visualViewport`), and the board just shows less. When the
  keyboard goes, it drops back to the bottom.
- **The typing itself:** a canvas can't bring up a phone's keyboard, so the prompt is a real text box (no autocorrect,
  no capitals, no spellcheck, 16px so iPhones don't zoom). On desktop the same box does the work, so there's one path
  for both. `[run]` and `[x]` buttons sit beside it for fingers.
- **Opening it on a phone:** `[ terminal ]` at the top of the dev menu (the footer's `[DEV]` with `?dev=1`). For
  players later, the terminal is gear or a node (see "The game part"), so you tap it like anything else.

## Under the hood: one command list

Every command is one entry in a shared list (`engine/terminal.js`, `TERM_CMDS`):

```js
{ name: 'give.mod', args: [{ name: 'mod', of: 'mods' }], help: 'put a mod in your row', learn: 'dev',
  run: (a) => ... }
```

- `args[].of` names what autocompletes there: `mods`, `gear`, `corps`, `seeds`, `hackers`, `events`, `screens`, or a
  fixed list.
- `learn`: how a player learns it (`dev` = dev mode only, for now everything).
- The editor's TESTING tab calls the same entries by name over its postMessage link (`engine/editor.js` TEST becomes
  thin wrappers, or goes). A command added once works in both. The editor could show a terminal box too.
- Cheat commands mark the run as practice, like the dev menu's `cheat()` does today.

## The commands (step 1: what the dev menu and the editor do today)

Names are a first pass: easy to change. `help` in the game lists them as built; the list below was the plan. What
changed: `breach <corp> [tier]` took over `corp.tier`; `run.die` is `game.over`; `show <screen>` covers the screens
and `show music` opens the music player (so no `music.play`, `heartbeat` or `urgency`); `corp.anomaly`, `sector`,
`sector.event`, `sector.boss`, `sector.clear`, `kit`, `steal`, `take.mod`, `hacker`, `heaven [where]`, `palette`,
`stats.tester`, `title.pulse` and `menu` (the old dev menu) were added. `boss.win` isn't built (nothing does that
today).

**Decided (Greg, 2026-11-11): the terminal doesn't need to do everything the editor does.** It's for getting
around (the intro, a corp, a sector, a screen) and for giving yourself things (mods, gear). It doesn't touch music
tracks, copy or art.
- So these stay editor-only: the G0D tab's looks and health bars, the FX tab's looping scene frames and codex decode,
  the music tab, and the loot viewer.
- Added in step 2: getting around to a few more places the editor's scenes go (a corp's intro screen, the shop),
  and the WORKBENCH's `letters` (giving).
- Dropped: `show music` (the music player) because the terminal stays out of music tracks. `music on|off` and
  `sfx on|off` stay; they're settings, not tracks.

**The run**
- `int <n>`, `heal`, `credits <n>` (`cr`), `rep <n>`
- `mode.god` (no damage), `mode.free` (free travel), `mode.hold` (the layer clocks stop)
- `show.real` (the debug overlay: real nodes)
- `run.seed <seed>`, `run.dev1`, `run.all <corp>` (every corp a sector is that corp), `run.end`
- `breach` (win this corp now), `boss.win`, `game.over`
- `corp.jump <corp>` (to its boss layer), `corp.tier <n>`

**Stuff**
- `give.mod <mod> [tier]`, `give.gear <gear> [n]`, `gear.fill` (one of every gear), `give.g0dexe`

**Progress and the save**
- `codex.all` (everything seen, every corp breached once), `codex.forget` (every corp back to 0 breaches)
- `legacy.reset` (THE BOARD's unlocks), `progress.wipe` (everything; asks first)
- `feat <feat>` / `feat.reset <feat>`

**Quests**
- `quest.open`, `quest.step <step>`, `quest.disc`, `quest.scene <scene>`, `quest.card`, `quest.wins <n>` (d0g)
- `seed.had3s`, `seed.h3av3n`, `corp.myconet`, `corp.cerberus`, `b0y.omni`, `rival.gear`

**G0D.exe**
- `g0dexe` (on / off), `g0dexe.speed 1|2|4`, `g0dexe.clicks <n>`, `g0dexe.knows <n>`, `g0dexe.popups`,
  `g0dexe.wins`, `g0dexe.phish`, `g0dexe.risky`, `g0dexe.build`, `g0dexe.log` (its decision log, printed)

**Screens and effects**
- `show.ad [ad]`, `show.intro first|short`, `show.screen <screen>`
- `fx.off`, `fx.mold <level>`, `fx.eyes <level>`, `fx.eyewipe`, `fx.moldwipe`, `fx.title`, `fx.card`, `fx.death`
- `music on|off`, `sfx on|off`, `music.play <song>`, `heartbeat`, `urgency <n>`

**The terminal itself**
- `help [command]`, `clear`, `history`, `exit`

Step 1 starts by going through engine/dev.js and engine/editor.js TEST line by line, so nothing is left out.

## The game part (step 3: its own design talk)

Ideas so far (BACKLOG section 10, Greg 2026-11-08 and 2026-11-11):
- **Learning:** in normal play the terminal only autocompletes what you've learned, like recipes. Ways to learn:
  - beating corps (each corp teaches one that fits it), feats (ELITE), crew teaching you, quests (crew quests could
    unlock the terminal itself);
  - fragments you find: `g??e.m?d` in a cache, an ad, the codex's ciphertext.
- **Hacking a command out:** type one you don't know and the terminal doesn't just say "not found". A near miss gets a
  hint ("close. 4 of 8 right", like Fallout's terminals); exactly right and you learn it. Too many wrong guesses lock it
  for the sector, or cost INT.
- **The cost:** a run that used it is marked **hacked** on the leaderboard. Strong commands could cost REP or hacker
  tokens, or wear off (`mode.god` lasts a sector, then you run it again).
- **Flavour:** a kill command for yourself (end the run now) and maybe one that flatlines a rival in the corp; an API
  key you can type in that does something.
- **Bosses that use it:** KONAMI (the dev menu turned against it), the second window (the terminal popped out to its
  own tab, BroadcastChannel).

## Order

1. **The terminal, dev mode only.** The prompt, the list, Tab / arrows / history, help, the phone layout, and every
   dev menu and editor command above. Plain ` keeps the old menu. **Done v14.79** (what's left is under the commands).
2. **A small top-up.** `show shop`, `show corpintro <corp>`, `give.letters`. Then the editor's TESTING helpers that
   the terminal copied (`settle`, `freshRun`, `toSector`, `heaven`, `kit`...) call the terminal's instead, so the
   two can't drift. The editor keeps its own buttons; it doesn't have to become a terminal.
   (Was: "one command list for the editor too", with every TESTING button run as a terminal command. Dropped
   (Greg, 2026-11-11) because the terminal no longer tries to cover the whole editor.)
   **Done v14.80:** `show shop`, `corp.intro <corp>` (named that, not `show corpintro`), `give.letters [letters]`.
   The editor's TESTING tab calls `termSettle`, `termFreshRun`, `termOnMap`, `termToSector`, `termHad3sBoss`,
   `termB0yOmni`, `termBench`, `termLetters`, `termHeaven` and `termKit`.
3. **The game part.** Learning, hacking out, the hacked mark. Talk it through first.
4. **The old dev menu goes** once nothing needs it.

## Decided

- **Decided (Greg, 2026-11-11): you can open it before you know anything.** With nothing learned there are no
  autocompletes; the list shows a short message instead (e.g. `no commands known`). Built: for now "known" means dev
  access (`?dev=1`, the backtick menu, or the editor); without it, `help` says `no commands known.` and only `help`,
  `clear`, `history` and `exit` answer.
- **Decided (Greg, 2026-11-11): its own look, outside the palettes.** A black field with white text, like a generic
  shell. Some colour highlighting picks out commands and objects (mod names, corps). The corp palettes don't touch it.
- **Decided (Greg, 2026-11-11): history lasts the session only.** Nothing goes in the save.
