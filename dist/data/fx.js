// NeoN+1 data/fx.js: the named effects' settings (the global look). engine/fx.js draws them; docs/EFFECTS.md is the plan.
// Change a number here and every place using that effect changes. A place can override any of them for itself
// (a cutscene layer: { n: 'logo', glitch: { col: 'ink:b0y' } }), without becoming its own effect.
// Times are in ms. "share" = the chance (0-1) per cell or per window. "set" = the characters it swaps in.
'use strict';
NEON_FILES.push(['data/fx.js', 'v14.33']);

const FX_GLITCH = '#%&@$!?*<>/=+';   // the glitch characters (one set everywhere)
const FX_NOISE = '%&#*;:';           // the softer noise a burst flashes to (mold, d0g's tics)

const FX_LOOKS = {
  // DRAWING IN: each mark lands at its own moment: `pos` of it from where it is (top or bottom first), `jitter`
  // random. It flashes `flashCol` for the first `flash` of the draw-in. boxMs: a logo's color block flickers in.
  reveal: { pos: 0.6, jitter: 0.4, flash: 0.07, flashCol: 'bright', boxMs: 60 },
  // FLICKER (drawing in): for the first `window` of a mark's draw-in, it blinks (share of the time off, every ms).
  flicker: { window: 0.2, ms: 55, share: 0.5 },
  // GLITCH (drawing in): for the first `window`, a mark is a random glitch character in col, new every ms.
  glitch: { window: 0.3, ms: 70, set: FX_GLITCH, col: 'bright', sound: 'static', vol: 0.35 },
  // CUE: marks stay dark until a word types in, then glitch on for `glitchMs` (hidden `hide` of the time, swapped
  // `swap` of it), then flicker now and then (`share` of the `every` windows, one frame in 3 of `flickMs`).
  cue: { col: 'accent', glitchMs: 700, hideMs: 50, hide: 0.45, swapMs: 90, swap: 0.35, set: FX_GLITCH,
    every: 2600, share: 0.3, flickMs: 70, sound: 'neonOn' },
  // LIGHTS: windows and LEDs (ch). Each goes off `off` of the time, re-rolled every `rate` ms; `pulse` of them
  // breathe instead (once a `period`, from breathe[0] up by breathe[1]); `level` = how bright; offCh = the mark when off.
  lights: { col: 'accent', rate: 2000, off: 0.2, period: 2000, level: 1, breathe: [0.15, 0.85] },
  // BLINK: marks (match) swap to `to` for `ms`, once an `every` (drifting up to `drift` of it); `twice` = the chance of a double blink.
  blink: { every: 4200, ms: 160, drift: 0.6, twice: 0.25 },
  // TICS: a glitchy logo (d0g): tear + swap + burst together, in col.
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
  // SPIN: marks (ch) cycle through `set`, a step every ms (a drive spinning up), once it's in and `after` more.
  spin: { set: '%#%&', ms: 160, after: 0 },
  // PROGRESS: marks light up top to bottom over `ms`: the head cycles `head` (headMs), then all of them `done` (doneMs).
  progress: { col: 'accent', at: 0, ms: 1800, head: 'o0O@', headMs: 70, headCol: 'bright', done: 'o0', doneMs: 140 },
  // GARBLE: a line of text that won't hold still (corrupted loot names): it switches versions every `swapMs`, and
  // `share` of its letters are glitch characters, re-rolled every ms.
  garble: { ms: 120, swapMs: 1700, share: 0.12, set: FX_GLITCH },
};
