// NeoN+1 data/fx.js: the named effects' settings (the global look). engine/fx.js draws them; docs/EFFECTS.md is the plan.
// The neon editor's FX tab edits this file (tools/data/fx_file.js writes it; the notes come from there).
// Change a number here and every place using that effect changes. A place can override any of them for itself
// (a cutscene layer: { n: 'logo', glitch: { col: 'ink:b0y' } }), without becoming its own effect.
// Times are in ms. "share" = the chance (0-1) per cell or per window. "set" = the characters it swaps in.
'use strict';
NEON_FILES.push(['data/fx.js', 'v14.84']);

const FX_GLITCH = '#%&@$!?*<>/=+';   // the glitch characters (one set everywhere: glitch, cue, garble)
const FX_NOISE = '%&#*;:';   // the softer noise a burst flashes to (mold, d0g's tics)

const FX_LOOKS = {
  // DRAWING IN: each mark lands at its own moment: `pos` of it from where it is (top or bottom first), `jitter`
  // random. It flashes `flashCol` for the first `flash` of the draw-in. boxMs: a logo's color block flickers in.
  reveal: { pos: 0.6, jitter: 0.4, flash: 0.07, flashCol: 'bright', boxMs: 60 },
  // MASK (where an effect sits): an effect with `where` only shows in drifting patches of noise, strongest in their
  // middles. `scale` = blob size (cells), `drift` = how they move (cells a second), `density` = how much is covered,
  // swinging up and down by `swing` over about `swingMs`; `soft` = the edge fade; `strength` = the most it gets;
  // `fade` = ms to come in. A place can add rect: [x, y, w, h] to keep it in a box (in its art's cells).
  mask: { scale: 6, drift: [0.8, -0.3], density: 0.4, swing: 0.15, swingMs: 4000, soft: 0.15, strength: 1, fade: 0, seed: 0 },
  // FLICKER: drawing in: for the first `window` of a mark's draw-in, it blinks (share of the time off, every ms). With
  // `where` (a mask): marks in it blink off share x strength of the time, all along.
  flicker: { window: 0.2, ms: 55, share: 0.5 },
  // GLITCH: drawing in: for the first `window`, a mark is a random glitch character in col, new every ms. With `where`
  // (a mask): marks in it glitch `rate` x strength of the time, all along.
  glitch: { window: 0.3, ms: 70, set: FX_GLITCH, col: 'bright', sound: 'static', vol: 0.35, rate: 0.4 },
  // TINT: with `where` (a mask): marks in it pull toward col, `amount` x strength of the way (without one: the whole
  // layer).
  tint: { col: 'danger', amount: 0.7 },
  // CUE: marks stay dark until a word types in, then glitch on for `glitchMs` (hidden `hide` of the time, swapped
  // `swap` of it), then flicker now and then (`share` of the `every` windows, one frame in 3 of `flickMs`).
  cue: { col: 'accent', glitchMs: 700, hideMs: 50, hide: 0.45, swapMs: 90, swap: 0.35, set: FX_GLITCH, every: 2600, share: 0.3, flickMs: 70, sound: 'neonOn' },
  // LIGHTS: windows and LEDs (ch). Each goes off `off` of the time, re-rolled every `rate` ms; `pulse` of them breathe
  // instead (once a `period`, from breathe[0] up by breathe[1]); `level` = how bright; offCh = the mark when off.
  lights: { col: 'accent', rate: 2000, off: 0.2, period: 2000, level: 1, breathe: [0.15, 0.85] },
  // BLINK: marks (match) swap to `to` for `ms`, once an `every` (drifting up to `drift` of it); `twice` = the chance
  // of a double blink.
  blink: { every: 4200, ms: 160, drift: 0.6, twice: 0.25 },
  // TICS: a glitchy logo (d0g): tear + swap + burst together, in col. A hacker's own tics are in data/hackers.js.
  tics: { col: 'danger' },
  // TEAR: now and then a row jumps a cell sideways for `ms` (share of the rows, once an `every`).
  tear: { every: 1900, ms: 110, share: 0.35 },
  // SWAP: marks swap to their pair (tics.swap: [[from, to]]) for `ms`, `share` of the `every` windows.
  swap: { every: 2600, ms: 320, share: 0.6 },
  // BURST: a little cluster flashes to noise for `ms`, once an `every`; radius size[0] + up to size[1] (cells are
  // twice as tall as wide, so it's round); `gaps` = share of cells in it left alone.
  burst: { every: 1300, ms: 190, size: [1.2, 2.2], gaps: 0.3, set: FX_NOISE, col: 'danger' },
  // EMBER: one mark glows up to col and back over `ms`, once an `every` (a cigarette's tip).
  ember: { col: 'danger', every: 5000, ms: 1300 },
  // GLOW: a lamp's cone down from (x, y): `rows` deep, `spread` cells out per row, a wash of `alpha`. It comes on at
  // `after` of the draw-in and stutters (dims to `dimTo`) `flickShare` of the `flickMs` windows. The marks in the cone
  // are lit toward col: srcMix / srcBase for the lamp itself, `lit` at the top of the cone.
  glow: { col: 'money', spread: 0.8, alpha: 0.12, after: 0.7, flickMs: 140, flickShare: 0.05, dimTo: 0.35, srcMix: 0.5, srcBase: 0.2, lit: 0.6 },
  // SMOKE: puffs off (x, y), one every `every`, drifting (dx, dy) over `life` and fading to the background.
  smoke: { every: 700, life: 2800, dx: -2, dy: -5, wobble: 0.7, fade: 0.85 },
  // FOG: a band of dots (density) and colons (colons of the dots), drifting `drift` columns a second.
  fog: { density: 0.15, colons: 0.35, drift: 0 },
  // SPIN: marks (ch) cycle through `set`, a step every ms (a drive spinning up), once it's in and `after` more. (No
  // scene uses it now.)
  spin: { set: '%#%&', ms: 160, after: 0 },
  // PROGRESS: marks light up top to bottom over `ms`: the head cycles `head` (headMs), then all of them `done`
  // (doneMs).
  progress: { col: 'accent', at: 0, ms: 1800, head: 'o0O@', headMs: 70, headCol: 'bright', done: 'o0', doneMs: 140 },
  // DECRYPT: text as ciphertext (the codex's unfound entries): letters are `set` characters, re-rolled every `idleMs`
  // at rest, every `ms` while decoding. As you find more of a codex tab, up to `hint` of each unfound name shows
  // through; a newly found one decodes over `dur`.
  decrypt: { set: '0123456789ABCDEF', idleMs: 700, ms: 50, dur: 1100, hint: 0.5 },
  // MOLD TRANSITION: the screen transition with mold in it, at a mold level (0-1): `light` / `heavy` in a M0LD event's
  // corps (H3AV3N), or the G0D tab's slider while it's on. At full mold: blotches (`blotch` cells across) of `fill` of
  // the fill, `noise` of the breakdown noise, and `stay` of the new screen's marks held as mold up to `linger` ms
  // longer. The fill's blotches lag behind: they stay put as the new screen comes in and clear up to `lag` ms later
  // (taps work meanwhile).
  moldwipe: { set: FX_NOISE, fill: 0.8, blotch: 4, noise: 0.7, stay: 0.35, linger: 500, lag: 1800, light: 0.3, heavy: 0.7 },
  // G0D'S EYES: red eyes come and go in an area's blank spots (the title). A slot comes up every `every`; `share` of
  // them get an eye, `big` / `mid` of them bigger ones (the rest small), living life[0] + up to life[1]. Each glitches
  // in over `inMs` (each mark settling on its own), looks around (a glance every `look`) and blinks (once a
  // `blinkEvery`, for `blinkMs`), glitches `glitch` of the time (a new mark every ms), and glitches out over the last
  // `outMs`. Its rim is `rim` of the way from the background to col. `anywhere` of them skip the clear-space rule and
  // land on anything, the UI too (0 = never, 1 = all of them). seed: another seed, other eyes.
  eyes: { every: 700, share: 0.45, life: [1400, 1600], inMs: 300, outMs: 280, look: 450, blinkEvery: 2300, blinkMs: 130, big: 0.08, mid: 0.35, glitch: 0.05, ms: 80, set: FX_GLITCH, col: 'danger', rim: 0.65, anywhere: 0, seed: 0 },
  // EYES TRANSITION: G0D in the screen transition, at an eyes level (0-1): `chance` of the wipes get him at `level`
  // (not in the intro or the training), or the G0D tab's eyes slider while it's on. At full: `count` eyes in the fill
  // (`big` of them big), sitting still on the glass: they glitch in as the old screen goes, may blink once, and stay
  // up to `linger` ms after the new screen's front passes them, then glitch out. `letters` of the fill and `noise` of
  // the breakdown noise are red `word` letters. They look like G0D'S EYES (its in / out, blink, glitch, color).
  eyewipe: { chance: 0.15, level: 1, count: 6, big: 0.25, linger: 600, letters: 0.05, noise: 0.15, word: 'g0d' },
  // GARBLE: a line of text that won't hold still (corrupted loot names): it switches versions every `swapMs`, and
  // `share` of its letters are glitch characters, re-rolled every ms.
  garble: { ms: 120, swapMs: 1700, share: 0.12, set: FX_GLITCH },
};
