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

**The rule for where an effect sits:** key its randomness to the content (a mark's place in its art layer, a letter's index in its line plus that line's seed, a logo's own rows), and only turn that into a screen position when drawing. Then scrolling, parallax, slides and text pushing things up all carry the effect along. Key to the screen only for things that sit on the glass and are brief (the mold glitch, bursts on screen cells). Fixed for slides in v14.37.

**Decided (Claude, 2026-11-05, for Greg to check):**
- The one hash is the cutscenes' old `stripHash`, so the cutscenes stay exactly as they were. The loot names and the mold glitch moved onto it, so different letters and spots glitch than before; the look is the same.
- One glitch set: `#%&@$!?*<>/=+`. The loot names lose the backslash they had.
- G0D's own hash (`G0D_LOOKS.hs`) stays for now. The mold spread, CERBERUS and the H3AV3N fight use it about 20 times, and their shapes were tuned by eye. Switching would change them.

**v14.33:** a hacker's tics live in `data/hackers.js` (`HACKERS.d0g.tics`; w00f is a copy, so he has them too). The cutscene logo, the rival card and the death screen all read them: `FX.tics` + `FX.putTics` for a block of text rows. The d -> b swap is in his name, so it shows on the card's name line and the cutscene's tag; the death screen has no name, so it gets the tears and bursts only.
- Not done: the breach screen, where a rival's logo is swapped for yours under DEFEATED. Those rows are plain one-color panel lines; tics there need a new option in the text board.

**v14.34:** the neon editor's **FX tab** (step 4).
- One card per effect: its note, its settings as draggable number fields (the shared scrub fields), colors and characters as text, and revert.
- **show** puts up a place that uses the effect. That's the real thing, not sample art: a cutscene frame on a loop, d0g's rival card or death screen, or G0D's mold glitch. The garble card plays its own line.
- Edits go to the game live, and save writes `dist/data/fx.js` in place (Ctrl S, the same dist/data folder as training and economy).
- `tools/fx_file.js` reads and writes the file and holds each effect's note, settings and show list. `node tools/fx_file.js` is the round-trip check.
- **Decided (Claude, 2026-11-05):** the preview uses the real scenes rather than sample art, so what you tune is what plays. A new effect gets a show once a scene uses it.

## Next

- New effects (step 5) go where a place needs them (**Decided (Greg, 2026-11-05):** build the ones with a place to go; keep the other ideas). Each one: code in engine/fx.js, settings in data/fx.js, an entry in tools/fx_file.js LOOKS.
  - **Built v14.35: decrypt**, for the encrypted codex (BACKLOG 9). Unfound names are ciphertext (hex), at their real length. Up to `hint` (half) of the letters show through as you find more of that tab. A new find decodes the first time the codex shows it (`save.codexRead`; a save from before it counts everything found as read). A corp's tell is ciphertext until you breach it, then decodes once.
  - **Built v14.36: the mold transition** (`moldwipe`), with the mold slider on the G0D tab (BACKLOG, G0D's fights: "the g0d tab grows"). At a mold level from 0 to 1 (`st.moldDev`; engine/effects.js `wipeMold`), the regular wipe gets blotches of mold scrolling in the fill, mold in the breakdown noise, and mold lingering on some of the new screen a moment. The mold glitch reads the same slider (0.5 = its normal size). At 0 the wipe is exactly as before. The game doesn't turn it up yet; heaven.js `moldLevel()` (the M0LD events) is the obvious hook.
  - The intro pass bits (BACKLOG Polish): the logo decoding in (decrypt), noise in the log, the map drawing in with static, a burst on the handshake. Wait for the user: the intro pass comes after they've lived with it.
- Ideas with no place yet, kept (the user: "rain could be cool"): **rain** (a scene's weather, maybe the DISC city), **color cycling**, **dither fades**.
- Maybe: tics on the breach screen's rival logo (see above).

## The mask: where an effect sits (v14.38)

**Decided (Greg, 2026-11-05):** not painted mask layers ("we don't need to be that specific"). Instead: pick an area, and the effect shows in drifting noise patches there, with a density (how much is covered, swinging up and down) and an intensity read off the noise (strongest in a patch's middle). The plan for polishing: Greg names an area and an effect, then turns density or strength up or down.

- `FX.mask(W, X, Y, now, t)`: a cell's strength 0-1, from smooth value noise (`FX.noise2`; `FX.noise1` swings the density over time). Settings in data/fx.js `mask`: scale (blob size), drift, density, swing, swingMs, soft (the edge fade), strength, fade (ms to come in: any effect on a mask fades in), seed; a place adds `rect: [x, y, w, h]`.
- Keyed to the content (the art's cells), so the patches ride along with scrolling.
- Effects that take one (`where`): **glitch** (`rate` x strength, all along), **flicker** (blinks off `share` x strength), **tint** (new: the color pulls toward col, `amount` x strength).
- In a cutscene layer: `{ n: 'a_skyline', glitch: { where: { rect: [0, 8, 20, 10], density: 0.5 } }, tint: { col: 'danger', where: true } }`.
- On a screen: `FX.apply(cells, 'glitch', { where: {...} }, now, t, origin)`.
- The FX tab's MASK and TINT cards play a live preview: grey = strength, sample art glitching and tinting on it.
- Nothing in the game uses a mask yet. It's waiting for the polish pass.
