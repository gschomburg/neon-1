// NeoN+1 engine/core.js: Tuning, the build number, constants, the palettes (resolved from palettes.js), the seeded RNG.
'use strict';
NEON_FILES.push(['engine/core.js', 'v12.04']);

// ---------------- Tuning ----------------
const CONFIG = {
  startIntegrity: 4,
  perfectHeal: 1,        // integrity restored by a first-try pick
  tellStrength: 0.75,    // how often a position tell is followed
  maxNodes: 12,          // node cap per layer (a 4x4 grid; more would shrink the tiles on phones)
  sectorHeat: 0.04,      // each sector after the first: tells followed 4% less often (down to 55%)
  corpLayers: 5,         // layers per corp, the boss included
  markDecoyFrac: 0.4,    // share of other tiles that also carry the Sigil signature
  lootChance: 0.3,       // chance a layer has a loaded ($) ICE tile
  beltSlots: 4,
  startItems: ['purge'], // everyone starts with one, like 1TD's torch
  repairAmount: 2,
  maskDelayMs: 1800,     // how long a fading glyph tell stays visible
  overclockClock: 15,    // clock added to every layer by OVERCLOCK
  overclockStart: 6,     // seconds left when OVERCLOCK starts purging
  overclockCut: 0.2,     // payout lost per OVERCLOCK purge
  fastpayMs: 3000,
  revealDelay: 380,      // ms before the first offer pops in
  revealGap: 300,        // ms between offer pops
  introHold: 1600,       // ms a corp's intro screen stays up (tap / any key skips)
  wipeSpeed: 1,      // screen transition speed: 1 = normal, 0.5 = half speed
  wipeOverlap: 0.45,     // page changes: new screen starts when the old front is this far up (lower = more overlap)
  wipeOverlapWin: 0.8,   // same, for success wipes (later, so the lit node gets its moment)
  wipeStagger: 300,      // max random delay (wipe-time ms) before each character starts changing
};

// Build number: vMAJOR.MINOR. The minor ticks (+.01) with every update; the major changes only on
// the user's call. The save slot follows the major only, so minor updates keep your progress.
const VERSION = 'v12.04';
// In the palette editor (index.html?editor=1) the game keeps its own save, so yours is never touched.
const EDITOR = /[?&]editor=1(&|$)/.test(location.search);
const STORE_KEY = EDITOR ? 'beta_runner.editor.save' : 'beta_runner.v12.save';
// A new major gets a new save slot: the first time v12 loads, it takes the v11 save (and a run in
// progress) so nobody starts over.
if (!EDITOR) try {
  const old = localStorage.getItem('beta_runner.v11.save');
  if (old && !localStorage.getItem(STORE_KEY)) {
    localStorage.setItem(STORE_KEY, old);
    const run = localStorage.getItem('beta_runner.v11.save.run');
    if (run) localStorage.setItem(STORE_KEY + '.run', run);
  }
} catch (e) { /* storage unavailable */ }
const SAVE_FORMAT = 1;

const TILE_W = 7, TILE_H = 5;
const GAP_X = 2, GAP_Y = 1;
const BOARD_Y = 8;
const TRAY_ROWS = 5;          // rule, mods, mod info, items, item info (+1 footer row below)
const MIN_CONTENT_W = 36;
const LINE_H = 1.22;
const FONT = '"JetBrains Mono", Consolas, "Courier New", monospace';

// Current colors. Filled from a palette at boot. Slots (see palettes.js): bg dim mid text bright
// accent (buttons, logo) danger (ICE, damage) dangerDim money (credits). The 5 rarity colors are the
// rarity chips' key colors (below): the same in every palette.
const C = {
  bg: '', dim: '', mid: '', text: '', bright: '', accent: '', danger: '', dangerDim: '', money: '',
  common: '', rare: '', epic: '', exotic: '', boss: '',
};

// Palettes live in palettes.js (loaded before this script). If the file didn't load, BASIC keeps
// the game running.
const PALETTE_DATA = window.NEON_PALETTES || { palettes: {
  c_basic: { name: 'BASIC', bg: '#06090a', dim: '#2c3a38', mid: '#5f7470', text: '#a9bdb7', bright: '#e6f4ef', accent: '#3cf0ff', danger: '#ff3b4e', dangerDim: '#7a2630', money: '#e8c66a' },
} };
const PALETTES = {};
for (const [key, p] of Object.entries(PALETTE_DATA.palettes)) PALETTES[key] = Object.assign({}, p);
// Rarity chips: every mod and item shows its rarity as a chip, a text color on its own background,
// the same in every palette (so it reads on any of them). The background is the rarity's key color.
const CHIPS = Object.assign({
  common: { fg: '#1d2326', bg: '#b9c3c1' }, rare: { fg: '#0b2a55', bg: '#7fb6ff' }, epic: { fg: '#2d0a4e', bg: '#c99bff' },
  exotic: { fg: '#3a2800', bg: '#ffd84a' }, boss: { fg: '#4a1300', bg: '#ff8a4a' },
}, PALETTE_DATA.chips || {});
const setChipKeys = () => { for (const r of Object.keys(CHIPS)) C[r] = CHIPS[r].bg; };
setChipKeys();
const playerPalettes = () => Object.keys(PALETTES).filter(k => !PALETTES[k].hidden);
// The default palette: the first starter in palettes.js (BASIC). Old saves named the player
// palettes that were folded into corps (2026-10-21): map them to their corps.
const DEFAULT_PALETTE = playerPalettes()[0] || Object.keys(PALETTES)[0];
const OLD_PALETTES = { default: 'c_basic', amber: 'c_parcelnet', dusk: 'c_mochi', phosphor: 'c_chronos', paper: 'c_mirror' };

// Font used for drawing. Layout always uses the default font's measurements, and
// every character is centered in its own cell, so a corp's font changes the look
// but never moves anything.
const DRAW_FONT = { family: FONT, weight: 400, bold: 700, scale: 1 };
// Palette changes fade every color from the old palette to the new one.
let paletteFade = null;
const PALETTE_FADE_MS = 700;
const hexRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixHex = (a, b, t) => '#' + hexRgb(a).map((v, i) => Math.round(v + (hexRgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
function stepPaletteFade(now) {
  const f = paletteFade;
  if (!f) return;
  const k = clamp((now - f.t0) / PALETTE_FADE_MS, 0, 1), e = k * (2 - k);   // ease out
  for (const key of Object.keys(f.to)) C[key] = mixHex(f.from[key], f.to[key], e);
  document.documentElement.style.background = C.bg;
  document.body.style.background = C.bg;
  if (k >= 1) paletteFade = null;
}

// dark (0-1): BLACKOUT's lights going out. Every color fades into the background, except
// red (the nodes you hit stay bright). PAL_LIT keeps the full-brightness colors.
let PAL_LIT = PALETTES[DEFAULT_PALETTE];
function applyPalette(key, instant = false, dark = 0) {
  const p = PALETTES[key] || PALETTES[DEFAULT_PALETTE];
  PAL_LIT = p;
  const to = {};
  for (const k of Object.keys(C)) if (p[k] && !CHIPS[k]) to[k] = dark && k !== 'bg' && k !== 'danger' ? mixHex(p[k], p.bg, dark) : p[k];
  if (instant || !C.bg || save.effects === 'reduced') { Object.assign(C, to); paletteFade = null; }
  else paletteFade = { from: Object.assign({}, C), to, t0: performance.now() };
  const f = p.font || {};
  DRAW_FONT.family = f.family ? `${f.family}, ${FONT}` : FONT;
  DRAW_FONT.weight = f.weight || 400;
  DRAW_FONT.bold = f.bold || 700;
  DRAW_FONT.scale = f.scale || 1;
  document.documentElement.style.background = C.bg;
  document.body.style.background = C.bg;
}

const NOISE = '#%&@$*+=<>/\\|:;~^01';

// ---------------- Seeded RNG ----------------
function hashStr(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Separate stream per purpose, so player actions never shift the answers.
const rngFor = (...parts) => mulberry32(hashStr(parts.join('|')));

const SEED_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newSeed() {
  let s = '';
  for (let i = 0; i < 6; i++) s += SEED_ALPHABET[Math.floor(Math.random() * SEED_ALPHABET.length)];
  return s;
}
const cleanSeed = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
const pickR = (arr, r) => arr[Math.floor(r() * arr.length)];
const noiseCh = () => NOISE[Math.floor(Math.random() * NOISE.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function shuffle(arr, r) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
