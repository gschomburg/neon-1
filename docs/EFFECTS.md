# Effects library

Talked through with the user on 2026-11-04. Steps 1-3 built in v14.32 (2026-11-05); see "Where it stands" at the end.

**Decided (Greg, 2026-11-04):** pull most of the ASCII effects into one shared library, with one locked-down way to apply them, so you can "add the glitch effect" anywhere in one line and change a look globally. Special cases stay special.

## What we have now

Most effects come down to "which cells + when + what happens to them". They share six building blocks, but each place builds its own copy:

- **Per-cell randomness:** 4+ hash functions (stripHash in engine/quests.js, h01, G0D_LOOKS.hs, the inline hash in glitchName).
- **Timelines and reveal order:** cutscene `at` / `dur`, flicker-in, type-on text.
- **On/off windows:** blink, tics, lights `period`, flicker.
- **Character swaps:** 3+ glitch sets (GLITCH_SET, GLITCH_CH, the mold ramps).
- **Color changes:** mixHex in engine/core.js, moldCol / moldMix.
- **Hiding and covering:** the cutscene's `taken` cells, CERBERUS and MYCONET pulling covered cells out of ctx.cells.
- Plus **motion:** slide, fly, spin, parallax.

The real one-offs: G0D's mold spread, CERBERUS's eyes, and the particles (they work in pixels, not cells).

## The plan

- **Named effects with settings** in one data file: `glitch`, `flicker-in`, `blink`, `pulse`, `tear`, `decrypt`, `lights`... Each has defaults (speed, how often, how much, characters, color).
- **Global look:** change `glitch`'s settings, and every place using `glitch` changes.
- **Local overrides:** a place can say "`glitch`, but rarer and in b0y's blue" without becoming its own effect.
- **Special behaviors stay special.** CERBERUS's eyes and the mold spread are game logic. They can use the shared blocks inside.

One way to attach them, anywhere:

- a cutscene layer: `{ n: 'sign', fx: ['cue', 'flicker'] }`
- a logo or card (d0g's tics on his rival card, death screen and cutscene, all the same)
- a rectangle of the screen ("glitch this area of the map for a second")
- a line of text (decrypting codex entries, glitchy loot names)
- later, asXii layer names: `sign [glitch]`

An **FX page in the neon editor**, like the g0d tab's mold slider: each effect playing on sample art, with its settings as sliders. Tune the global look there; try new effects there first.

## Steps

1. Pull the six building blocks into one file (one hash, one glitch set, windows, timelines, recolor, masking, motion).
2. Rebuild the current effects on top of them as named effects, looking exactly as they do now. Check with before-and-after screenshots.
3. Point the cutscenes, d0g's logo, the glitchy loot names and the mold flickers at the library.
4. Add the editor's FX page.
5. New effects (decrypt, dither fades, color cycling, rain...) become mostly a new entry.

Steps 1-3 change nothing you can see.

## Where it stands (v14.32, 2026-11-05)

- `dist/engine/fx.js` is the library (`FX`): the building blocks (`hash`, `step`, `cycle`, `pick`, `easeOut`, `col`, `look`) and the effects built on them.
- `dist/data/fx.js` is the global look (`FX_LOOKS`): every effect's numbers, each with a comment. They used to be written inline in the cutscene code.
- `FX.look('glitch', { col: 'danger' })` gives the global settings with a place's own over them.
- Named so far: `reveal`, `flicker`, `glitch`, `cue`, `lights`, `blink`, `ember`, `spin`, `glow`, `tear`, `swap`, `burst`, `smoke`, `fog`, `progress`, `garble`. `tics` is `tear` + `swap` + `burst` together.
- Pointed at the library so far:
  - The cutscene strips (`buildStrip` in engine/quests.js). Checked: 2,028 sampled frames of DISC, PRODIGAL and HEAVEN'S GATE are identical before and after, and all 78 corps play the same.
  - Corrupted loot names (`glitchName` -> `FX.garble`).
  - G0D's mold glitch (`g0dGlitch` -> `FX.burstCells` with its own settings).
- Attach modes so far: a cutscene layer (its keys), a list of screen cells (`FX.burstCells`: any rectangle of the screen), a line of text (`FX.garble`).

**Decided (Claude, 2026-11-05, for Greg to check):**
- The one hash is the cutscenes' old `stripHash`, so the cutscenes stay exactly as they were. The loot names and the mold glitch moved onto it, so different letters and spots glitch than before; the look is the same.
- One glitch set: `#%&@$!?*<>/=+`. The loot names lose the backslash they had.
- G0D's own hash (`G0D_LOOKS.hs`) stays for now. The mold spread, CERBERUS and the H3AV3N fight use it about 20 times, and their shapes were tuned by eye. Switching would change them.

**v14.33:** a hacker's tics live in `data/hackers.js` (`HACKERS.d0g.tics`; w00f is a copy, so he has them too). The cutscene logo, the rival card and the death screen all read them: `FX.tics` + `FX.putTics` for a block of text rows. The d -> b swap is in his name, so it shows on the card's name line and the cutscene's tag; the death screen has no name, so it gets the tears and bursts only.
- Not done: the breach screen, where a rival's logo is swapped for yours under DEFEATED. Those rows are plain one-color panel lines; tics there need a new option in the text board.

## Next

- The editor's FX page (step 4).
- New effects (step 5): decrypt for codex entries, dither fades, color cycling, rain.

## Open questions

- How the editor FX page should work (sample art, sliders, saving the settings). Saving needs a `tools/fx_file.js` writer for data/fx.js, like the other data files.
