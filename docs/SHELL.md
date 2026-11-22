# THE SHELL: a dev console you can type into

Started 2026-11-11 (Greg: "i'm sort of imagining the unreal console"). A plan to look over before step 1 is built.
Grows BACKLOG section 10 ("The dev menu as a one-line terminal", "More on the terminal", "A second window") and
"Dev menu buttons the editor's TESTING doesn't have yet".

## What it is

**Step 1 is built (v14.79):** `dist/engine/shell.js`, checked by `tools/checks/tests/shell.js`.

- A one-line prompt at the bottom of the screen, with the output lines above it, like a shell. It's plain HTML over
  the canvas, not drawn in the game's text grid: it has its own look (see Decided), and a real text box gives a phone
  its keyboard for free.
- As you type, a list of matching commands pops up above the prompt. **Up / Down** pick one, **Tab** fills it in,
  **Enter** runs it, **Esc** closes the list (a second Esc closes the shell).
- **Up** on an empty prompt walks back through the commands you ran this session (not saved; see Decided).
- Arguments autocomplete too: after `give.mod ` the list is mod codes and names; after `corp.jump ` it's corps.
- `help` lists what you know. `help give.mod` prints its help line and arguments.
- The editor's **shell** tab (v14.81) is a readme: every command by group, with its arguments, read from the
  game so it's always current. Its **type** / **run** buttons put a line into the game's shell.
- Commands are `group.verb` (`give.mod`, `run.seed`, `mode.god`). Typing without the dot still matches
  (`givemod`, `give mod`), and matching is by prefix first, then anywhere in the name.

## Opening it

- **`** (backtick) opens and closes it, any time. **Decided (Greg, 2026-11-20); built v15.03.** Was `~` / Ctrl + `.
- **`~`** (Shift + `) or **Ctrl + `** opens the old dev menu, and only in dev mode (`dev.start`, `?dev=1`, the
  editor): the menu turns dev mode on, so players can't get in that way. **Decided (Greg, 2026-11-20):** the old menu
  stays, on these keys (was: "maybe we ditch it once we complete this", 2026-11-11).
- **Phones:** `[ SHELL ]` in the pause menu, once you have a deck (Greg, 2026-11-20; built v15.03).
- While it's open it takes every key (the game's keys don't fire), and the layer clocks, the eater, G0D.exe and the
  G0D fight hold still (`st.shell`). Taps on the game above it still work.
- **Phones:** see below.

## On a phone

The trouble: no keyboard, and the phone's own keyboard covers about half the screen when it comes up.

- **Tap first, type second.** Opened on a phone, the shell lists every command you know straight away, as rows you
  tap. Tap one and it goes into the prompt, and the list turns into its arguments (the mods, the corps) to tap. You can
  run most commands without the keyboard at all.
- **The keyboard is there to filter.** A `[ type ]` button (or tapping the prompt) brings it up. Typing narrows the
  list, like on desktop.
- **Where it sits:** while the keyboard is up, the shell rides on top of it, so the prompt and the list stay in
  view. The browser says how much room the keyboard leaves (`visualViewport`), and the board just shows less. When the
  keyboard goes, it drops back to the bottom.
- **The typing itself:** a canvas can't bring up a phone's keyboard, so the prompt is a real text box (no autocorrect,
  no capitals, no spellcheck, 16px so iPhones don't zoom). On desktop the same box does the work, so there's one path
  for both. `[run]` and `[x]` buttons sit beside it for fingers.
- **Opening it on a phone:** `[ shell ]` at the top of the dev menu (the footer's `[DEV]` with `?dev=1`). For
  players later, the shell is gear or a node (see "The game part"), so you tap it like anything else.

## Under the hood: one command list

Every command is one entry in a shared list (`engine/shell.js`, `SHELL_CMDS`):

```js
{ name: 'give.mod', args: [{ name: 'mod', of: 'mods' }], help: 'put a mod in your row', learn: 'dev',
  run: (a) => ... }
```

- `args[].of` names what autocompletes there: `mods`, `gear`, `corps`, `seeds`, `hackers`, `events`, `screens`, or a
  fixed list.
- `learn`: how a player learns it (`dev` = dev mode only, for now everything).
- The editor's TESTING tab calls the same entries by name over its postMessage link (`engine/editor.js` TEST becomes
  thin wrappers, or goes). A command added once works in both. The editor could show a shell box too.
- Cheat commands mark the run as practice, like the dev menu's `cheat()` does today.

## The commands (step 1: what the dev menu and the editor do today)

Names are a first pass: easy to change. `help` in the game lists them as built; the list below was the plan. What
changed: `breach <corp> [tier]` took over `corp.tier`; `run.die` is `game.over`; `show <screen>` covers the screens
and `show music` opens the music player (so no `music.play`, `heartbeat` or `urgency`); `corp.anomaly`, `sector`,
`sector.event`, `sector.boss`, `sector.clear`, `kit`, `steal`, `take.mod`, `hacker`, `heaven [where]`, `palette`,
`stats.tester`, `title.pulse` and `menu` (the old dev menu) were added. `boss.win` isn't built (nothing does that
today).

**Decided (Greg, 2026-11-11): the shell doesn't need to do everything the editor does.** It's for getting
around (the intro, a corp, a sector, a screen) and for giving yourself things (mods, gear). It doesn't touch music
tracks, copy or art.
- So these stay editor-only: the G0D tab's looks and health bars, the FX tab's looping scene frames and codex decode,
  the music tab, and the loot viewer.
- Added in step 2: getting around to a few more places the editor's scenes go (a corp's intro screen, the shop),
  and the WORKBENCH's `letters` (giving).
- Dropped: `show music` (the music player) because the shell stays out of music tracks. `music on|off` and
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
  `g0dexe.wins`, `g0dexe.phish`, `g0dexe.risky`, `g0dexe.build`, `g0dexe.log` (its decision log, printed). Typed with an o (`godexe`) they work too (v15.25).

**Screens and effects**
- `show.ad [ad]`, `show.intro first|short`, `show.screen <screen>`
- `fx.off`, `fx.mold <level>`, `fx.eyes <level>`, `fx.eyewipe`, `fx.moldwipe`, `fx.title`, `fx.card`, `fx.death`
- `music on|off`, `sfx on|off`, `music.play <song>`, `heartbeat`, `urgency <n>`

**The shell itself**
- `help [command]`, `clear`, `history`, `exit`

Step 1 starts by going through engine/dev.js and engine/editor.js TEST line by line, so nothing is left out.

## The game part (step 3)

Talked through with Greg, 2026-11-20.

**How you get it:** ROOT's crew quest, PAPERWORK (docs/CREW_QUESTS.md). ROOT lives in your deck; once ROOT is on your
crew, the shell opens. **Decided (Greg, 2026-11-20).**
- Before that, `~` still opens the shell, but it only says `paperwork pending.` (a hint), and `dev.start` still works.
- SHELL chips can drop and be slotted before ROOT, but their socket says to get ROOT on your crew. They do nothing yet.
- A save that already has ROOT on its crew (bought on THE BOARD before this) keeps ROOT and has the shell open.
- ROOT's reward: ROOT's starter chip (`man`: this corp's codex entry, mid-layer, plus a couple of charges).

**Charges.** **Decided (Greg, 2026-11-20).**
- SHELL chips give a command, charges, or both. A strong command comes with few charges (0-1); a weak one with more
  (2-3); a battery chip gives only charges. The charges all go in one pool.
- Each command costs charges (1-3). The cost shows beside the name in the autocomplete (`rm  ·1`), the way sockets
  show power.
- The deck's sockets and power are the real limit: a full shell build is one strong command and a few batteries, in
  place of other chips.
- Hard limits only where spamming breaks the game (`flatline` needs a rival, `eject` only from the map, `rm` maybe
  once a layer).
- A command that makes a chip (`compile`?): costs a lot, puts a strong chip in your belt; you still cash out with it.
  It never makes a SHELL chip with charges (no loop). **Decided (Greg, 2026-11-21):** a special one-time use inside a
  quest: find something in a run, compile it, cash out with a special chip. Where: later.
- **Decided (Greg, 2026-11-20): they refill each sector, for now.** It's one setting (engine/deck.js `SHELL_REFILL`).
  Later the default becomes "they last the run", and a BOSS chip, **CRON** (the scheduler), brings the sector refill
  back.
- **Decided (Greg, 2026-11-20):** a corp boss can offer a **CHARGE** (gear: +2 charges, up to your max) as one of its
  picks, while you have SHELL chips and ROOT. Never in markets or at the bench.
- **Decided (Greg, 2026-11-20): ROOTKIT**, a CRASH chip: die with charges left and they all burn, and you're back with
  1 INT. Get charges back and it can save you again.
- **Decided (Greg, 2026-11-20):** the charges show in the shell, top right: `charges [###..] 3/5`.
- **Built v15.02** (first numbers, to playtest): whoami +3 (costs 1), ps +2 (1), man +2 (1), CAPACITOR +4 (no
  command), flatline +1 (3). A CHARGE pick 35% of corp bosses. ROOTKIT epic, power 2. `help` lists costs and the
  free commands. Check: tools/checks/tests/charges.js.

**Free commands.** `help`, `clear`, `history`, `exit` (maybe `crew` or `status`) cost nothing, need no chip, and don't
mark the run hacked. `help` lists them. **Decided (Greg, 2026-11-20):** in place of a help chip. **Built v15.02.**

**Dev mode: `dev.start`.** **Decided (Greg, 2026-11-20).** **Built v15.02:** `dev.start` turns on dev access (like
`?dev=1`) and makes the run practice; no costs. Not built yet: separate player and dev versions of one command.
- **`dev.real` (Greg, 2026-11-21), built v15.26:** a dev run that still counts. `dev.real on` / `off` (or a flip),
  for this session: this run and the next ones. Nothing can make the run practice while it's on (dev.start, G0D.exe,
  cheats), so quests move, REP banks and scores post. Off makes the run practice again. (engine/run.js runKeepReal.)
- Players and dev mode share one command list. Typing `dev.start` (never autocompleted) turns dev mode on: every
  autocomplete, unlimited charges, the dev-only commands (`rep`, `progress.wipe`, quests, fx...), and each shared
  command's dev version (`mode.god` is a free on / off, not a sector for 4 charges).
- **Built v15.03:** a command can carry a player version (`.play`, from engine/deck.js `DECK_SHELL_PLAY`): its chip,
  cost, arguments and help. Outside dev mode THE SHELL runs that in its place. The shared ones: `mode.god` (no damage
  for the rest of the sector), `mode.hold` (no layer clocks for the rest of the corp), `show.real` (the real node marked
  on this layer, once a corp), `breach` (win this layer, full pay, once a run: the dev one breaches a corp you name),
  `give.mod` and `give.gear` (v15.04: name it, `give.mod tracer epic`: what you've found, epic and up only once you've
  shredded one; charges by rarity, as often as they last; alone it lists yours for free). The dev ones: `give.mod <mod> [tier]`
  sets the tier, `give.gear <gear> [n]` gives n of it.
  **v15.06:** `mode.free` (FT3: any node in this sector, the boss too, till it ends; the dev one is free travel on / off)
  and `corp.jump` (JM4: this corp's boss; the dev one takes a corp to jump to). Player-only: `rm -rf` (RF4: every ICE
  on the layer, not on a sector boss; the name has a space, and shellParse reads it as one) and `chmod <mod>` (CM3: a
  mod up a rarity till the sector ends, once a sector; not BUFFER, BOX OF WIRES or MUTATE). **v15.07:** `fork` (FK2:
  two real nodes on every layer of the corp, one glyph, full pay).
- Each command has a player version, a dev version, or both.
- Players will find `dev.start` (the game's JS is open). That's fine: dev runs are practice (no REP, no leaderboard),
  like the old dev menu's cheats. Maybe hide it somewhere as a secret worth finding.
- Two marks: **hacked** (you used real commands: the leaderboard's "rooted" mark) and **dev** (practice; it doesn't
  count).

Older ideas, not decided (BACKLOG section 10, Greg 2026-11-08 and 2026-11-11):
- **Learning:** in normal play the shell only autocompletes what you've learned, like recipes. Ways to learn:
  - beating corps (each corp teaches one that fits it), feats (ELITE), crew teaching you, quests (crew quests could
    unlock the shell itself);
  - fragments you find: `g??e.m?d` in a cache, an ad, the codex's ciphertext.
- **Hacking a command out:** type one you don't know and the shell doesn't just say "not found". A near miss gets a
  hint ("close. 4 of 8 right", like Fallout's terminals); exactly right and you learn it. Too many wrong guesses lock it
  for the sector, or cost INT.
- **The cost:** a run that used it is marked **hacked** on the leaderboard. Strong commands could cost REP or hacker
  tokens, or wear off (`mode.god` lasts a sector, then you run it again).
- **Flavour:** a kill command for yourself (end the run now) and maybe one that flatlines a rival in the corp; an API
  key you can type in that does something.
- **Bosses that use it:** KONAMI (the dev menu turned against it), the second window (the shell popped out to its
  own tab, BroadcastChannel).

## Order

1. **The shell, dev mode only.** The prompt, the list, Tab / arrows / history, help, the phone layout, and every
   dev menu and editor command above. Plain ` keeps the old menu. **Done v14.79** (what's left is under the commands).
2. **A small top-up.** `show shop`, `show corpintro <corp>`, `give.letters`. Then the editor's TESTING helpers that
   the shell copied (`settle`, `freshRun`, `toSector`, `heaven`, `kit`...) call the shell's instead, so the
   two can't drift. The editor keeps its own buttons; it doesn't have to become a shell.
   (Was: "one command list for the editor too", with every TESTING button run as a shell command. Dropped
   (Greg, 2026-11-11) because the shell no longer tries to cover the whole editor.)
   **Done v14.80:** `show shop`, `corp.intro <corp>` (named that, not `show corpintro`), `give.letters [letters]`.
   The editor's TESTING tab calls `shellSettle`, `shellFreshRun`, `shellOnMap`, `shellToSector`, `shellHad3sBoss`,
   `shellB0yOmni`, `shellBench`, `shellLetters`, `shellHeaven` and `shellKit`.
3. **The game part.** Designed 2026-11-20 (above). Built in batches: ROOT's quest first (docs/CREW_QUESTS.md), then
   charges, the free commands and `dev.start`. **ROOT's quest: built v15.01. Charges, free commands, `dev.start`:
   v15.02. The SHELL and SUDO chips' commands, and player versions of dev commands: v15.03.**
4. ~~The old dev menu goes once nothing needs it.~~ Dropped (Greg, 2026-11-20) because it's still handy: it stays on
   ~ / Ctrl + `, in dev mode only, and ` is THE SHELL. **Built v15.03.**

## Decided

- **Decided (Greg, 2026-11-12): it's THE SHELL** (was THE TERMINAL). "The terminal" is the game's message line under
  the header (the training names it), so the console needed its own name. A shell is what it is, and "popping a shell"
  is hacker slang for getting in. Its prompt reads `root@neon:~$` (`SHELL_PS`). The editor's tab is **shell**.

- **Decided (Greg, 2026-11-11): you can open it before you know anything.** With nothing learned there are no
  autocompletes; the list shows a short message instead (e.g. `no commands known`). Built: for now "known" means dev
  access (`?dev=1`, `dev.start`, or the editor); without it, `help` says `no commands known.` and only `help`,
  `clear`, `history` and `exit` answer.
- **Decided (Greg, 2026-11-11): its own look, outside the palettes.** A black field with white text, like a generic
  shell. Some colour highlighting picks out commands and objects (mod names, corps). The corp palettes don't touch it.
- **Decided (Greg, 2026-11-11): history lasts the session only.** Nothing goes in the save.
