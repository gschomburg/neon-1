// NeoN+1 engine/screen.js: The canvas, layout, and the game state (st).
'use strict';
NEON_FILES.push(['engine/screen.js', 'v14.73']);

// ---------------- Canvas & layout ----------------
const cv = document.getElementById('screen');
const g = cv.getContext('2d');
let W = 0, H = 0, dpr = 1;
let L = null;

// The phone's safe area (the notch, the clock, the home bar): the page draws edge to edge (viewport-fit=cover), so as a
// home-screen app (the user, 2026-10-31: no Safari bars) the game keeps its rows inside these margins. Read from CSS
// env(safe-area-inset-*) through a hidden probe; all 0 on a desktop.
let SAFE = { t: 0, r: 0, b: 0, l: 0 };
function readSafe() {
  let p = document.getElementById('safeProbe');
  if (!p) {
    p = document.createElement('div'); p.id = 'safeProbe';
    p.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(p);
  }
  const cs = getComputedStyle(p), n = v => parseFloat(v) || 0;
  SAFE = { t: n(cs.paddingTop), r: n(cs.paddingRight), b: n(cs.paddingBottom), l: n(cs.paddingLeft) };
}
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  W = window.innerWidth; H = window.innerHeight;
  readSafe();
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  computeLayout();
}

function computeLayout() {
  const gd = (st.mode === 'play' && st.lv) ? { cols: st.lv.cols, rows: st.lv.rows } : { cols: 4, rows: 4 };
  const gw = gd.cols * TILE_W + (gd.cols - 1) * GAP_X;
  const gh = gd.rows * TILE_H + (gd.rows - 1) * GAP_Y;
  const wc = Math.max(gw, MIN_CONTENT_W);
  const hc = BOARD_Y + gh + TRAY_ROWS + 2;
  g.font = `400 100px ${FONT}`;
  const ratio = (g.measureText('M').width / 100) || 0.6;
  const gutter = 12;
  const UW = W - SAFE.l - SAFE.r, UH = H - SAFE.t - SAFE.b;   // the usable area (inside the notch and the home bar)
  let fs = Math.min((UW - 2 * gutter) / (wc * ratio), (UH - 2 * gutter) / (hc * LINE_H));
  fs = Math.max(7, Math.min(26, fs));
  const cw = fs * ratio, chh = fs * LINE_H;
  L = {
    fs, cw, chh, wc, hc, gw, gh,
    gx: Math.floor((wc - gw) / 2),
    cols: gd.cols, rows: gd.rows,
    ox: Math.round(SAFE.l + (UW - wc * cw) / 2),
    oy: Math.round(SAFE.t + (UH - hc * chh) / 2),
  };
}
const pxX = cx => L.ox + cx * L.cw + L.cw / 2;
const pxY = cy => L.oy + cy * L.chh + L.chh / 2;
const tileOrigin = t => { const p = t.slide ? tilePos(t, performance.now()) : t; return { tx: L.gx + p.col * (TILE_W + GAP_X), ty: BOARD_Y + p.row * (TILE_H + GAP_Y) }; };
const tileCenter = t => { const { tx, ty } = tileOrigin(t); return { x: pxX(tx + (TILE_W - 1) / 2), y: pxY(ty + (TILE_H - 1) / 2) }; };

// ---------------- State ----------------
const params = new URLSearchParams(location.search);
const urlSeed = cleanSeed(params.get('seed'));

const st = {
  mode: 'title',          // title | map | play | panel | over
  seed: urlSeed || newSeed(),
  practice: false,        // (a ?seed= link counts like a typed seed: engine/boot.js sets st.seeded)
  run: null,              // the current run (map, integrity, credits, items, mods)
  corp: null,             // the corp being hacked
  lv: null,               // the current layer
  panelFn: null,          // builds the lines for panel screens
  panelTitle: '',
  panelT0: 0,             // when offers start popping in
  revealed: new Set(),    // offers that already popped
  busy: true,
  hover: -1, hoverBtn: null, hoverNode: null, hoverItem: -1, hoverMod: -1,
  selItem: -1, selMod: -1,  // tray selection: first tap shows info, second tap uses
  mapSel: null,
  timer: null,
  msg: '', msgCol: '', msgT: 0,
  boardStart: 0,
  wipe: null,             // board transition in progress
  hideBoard: false, hideAll: false,
  debug: false,           // show the real node (dev menu)
  dev: false,             // dev menu open
  devAccess: params.get('dev') === '1',
  result: null,
  transitioning: false,
  resetArmed: false,
  pause: false,           // pause menu open (during a run)
  intro: null,            // corp intro screen showing ({ skip })
  mp: null,               // online multiplayer game, when playing one
  freeTravel: false,      // dev: travel to any node on the map
  god: false,             // dev: ICE does no damage
  abandonArmed: false,
  kbFocus: null,          // id of the button the keyboard cursor is on
  kbGrid: false,          // last grid move came from the keyboard (shows a blinking cursor)
  focusables: [],         // tappable buttons on screen, in reading order, for the keyboard
  keyHandler: null,       // screen-specific keys (codex, help, settings)
  scroll: null,           // screen-specific scrolling (wheel, swipe)
  drag: null,
};
// MUTATE counts as the mod it is right now (run.mutateAs, new each corp).
const has = key => !!(st.run && (st.run.mods.includes(key) || (key === st.run.mutateAs && st.run.mods.includes('mutate'))));
const reduced = () => save.effects === 'reduced';
