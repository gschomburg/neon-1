# Effects library (plan, not built)

Talked through with the user on 2026-11-04. Nothing here is built yet.

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

## Open questions

- Which effects get names first.
- How the editor FX page should work (sample art, sliders, saving the settings).
