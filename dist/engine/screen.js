// NeoN+1 engine/screen.js: The canvas, layout, and the game state (st).
'use strict';
NEON_FILES.push(['engine/screen.js', 'v13.91']);

// ---------------- Canvas & layout ----------------
const cv = document.getElementById('screen');
const g = cv.getContext('2d');
let W = 0, H = 0, dpr = 1;
let L = null;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  W = window.innerWidth; H = window.innerHeight;
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
  let fs = Math.min((W - 2 * gutter) / (wc * ratio), (H - 2 * gutter) / (hc * LINE_H));
  fs = Math.max(7, Math.min(26, fs));
  const cw = fs * ratio, chh = fs * LINE_H;
  L = {
    fs, cw, chh, wc, hc, gw, gh,
    gx: Math.floor((wc - gw) / 2),
    cols: gd.cols, rows: gd.rows,
    ox: Math.round((W - wc * cw) / 2),
    oy: Math.round((H - hc * chh) / 2),
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
  practice: !!urlSeed,
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
