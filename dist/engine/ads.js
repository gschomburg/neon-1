// NeoN+1 engine/ads.js: the fake ads: when they show up, the ad box, and its two-screen turn.
'use strict';
NEON_FILES.push(['engine/ads.js', 'v13.18']);

// An ad comes up over whatever is on screen, in a bordered box nearly the screen's width, and
// blocks everything under it until you close it. [x] (top right) shows up after a few seconds
// ("skip in 3"). Two-screen ads turn to the next screen on their own (or on a tap): every
// character spins out as the next one spins in, rippling across the box. The ads' content is
// in data/ads.js. Off with SETTINGS > ads.
const AD_CFG = {
  chance: 1 / 6,     // the odds an ad shows up at a chance point (between layers, the map)
  gap: 3,            // at least this many chance points between two ads
  closeMs: 2500,     // [x] shows up after this long
  screenMs: 3800,    // a screen stays up this long before a two-screen ad turns
  turnMs: 520,       // the spin-turn between screens
};
const adsOn = () => save.ads !== false && !!st.run && !st.mp && !EDITOR;

// A chance point: maybe an ad. where: 'layer' (between layers) or 'map' (coming back to the
// map). Never in a run's first corp, before a boss layer, twice in one corp, or too close
// together. Returns a promise that settles when the ad (if any) is closed.
function adBreak(where) {
  const run = st.run;
  if (!adsOn() || !run.corps) return Promise.resolve();
  run.adGap = (run.adGap || 0) + 1;
  const c = st.corp;
  if (where === 'layer' && (!c || c.adShown || c.idx >= c.counts.length - 1)) return Promise.resolve();   // (next is the boss)
  if (run.adGap <= AD_CFG.gap || Math.random() >= AD_CFG.chance) return Promise.resolve();
  if (c) c.adShown = true;
  run.adGap = 0;
  const keys = Object.keys(ADS).filter(k => k !== run.lastAd);
  return showAd(pickR(keys.length ? keys : Object.keys(ADS), Math.random));
}
function showAd(key) {
  const now = performance.now();
  if (st.run) st.run.lastAd = key;
  return new Promise(res => { st.ad = { key, screen: 0, at: now, t0: now, done: res }; Sound.ui(); });
}
function closeAd(msg) {
  const ad = st.ad;
  if (!ad) return;
  st.ad = null;
  Sound.ui();
  if (msg) setMsg(msg, C.dim);
  if (ad.done) ad.done();
}
// Turn to the next screen (the spin-turn); false on the last one.
function adTurn() {
  const ad = st.ad, def = ad && ADS[ad.key];
  if (!def || ad.screen >= def.screens.length - 1) return false;
  ad.turn = { from: ad.screen, at: performance.now() };
  ad.screen++; ad.at = performance.now();
  Sound.tick();
  return true;
}
const adClosable = (ad, now) => now - ad.t0 >= AD_CFG.closeMs;

// A tap while an ad is up: [x] closes (once it shows), a button closes with its line, a tap on
// the ad turns a two-screen ad. Nothing else gets through.
function adTap(h, now) {
  const ad = st.ad;
  if (!h) return;
  if (h.kind === 'adx' && adClosable(ad, now)) return closeAd();
  if (h.kind === 'adbtn') return closeAd(h.msg);
  if (h.kind === 'adbox') { if (!adTurn()) setMsg('> nice try.', C.dim); }
}
function adKey(k, now) {
  const ad = st.ad;
  if ((k === 'escape' || k === 'enter' || k === ' ' || k === 'x') && adClosable(ad, now)) return closeAd();
  if (k === 'arrowright' || k === 'enter' || k === ' ') adTurn();
}

// One screen as text rows (ADS_W wide), with each row's color and style.
function adRows(screen, sinceScreen) {
  return screen.map(ln => {
    let t = ln.t || '';
    // bars: {bar} fills, {rbar} empties; {bar:20} sets the width (inside the brackets), {bar:20:6s}
    // the time (default: most of the time the screen is up)
    t = t.replace(/{(r?)bar(?::(d+))?(?::(d+(?:.d+)?)s)?}/g, (m, rev, w, secs) => {
      const n = Math.max(1, Math.min(ADS_W - 2, w ? +w : 10)), dur = secs ? +secs * 1000 : AD_CFG.screenMs * 0.85;
      let f = Math.min(1, sinceScreen / dur);
      if (rev) f = 1 - f;
      const k = Math.round(f * n);
      return `[${'#'.repeat(k)}${'-'.repeat(n - k)}]`;
    });
    t = t.slice(0, ADS_W);
    const x = ln.x === 'c' ? Math.floor((ADS_W - t.length) / 2) : (ln.x || 0);
    return { s: (' '.repeat(x) + t).padEnd(ADS_W).slice(0, ADS_W), col: C[ln.c || 'text'] || C.text, inv: !!ln.inv, b: !!ln.b, btn: ln.btn, x, len: t.length };
  });
}

// Drawn last, over everything (engine/scene.js).
function buildAd(ctx, now) {
  const { put, bg, cells, addHit } = ctx, ad = st.ad, def = ADS[ad.key];
  if (!def) { closeAd(); return; }
  const w = ADS_W + 4, h = ADS_H + 2, x0 = Math.max(0, Math.floor((L.wc - w) / 2)), y0 = Math.max(0, Math.floor((L.hc - h) / 2));
  clearRect(cells, x0, y0, w, h);
  for (let r = 0; r < h; r++) bg(x0, y0 + r, w, C.bg, 1);
  addHit(x0, y0, w, h, { kind: 'adbox' });
  // the frame: AD in the corner, then a countdown, then [x]
  const left = Math.max(0, Math.ceil((AD_CFG.closeMs - (now - ad.t0)) / 1000));
  const tag = '[ AD ]', right = left > 0 ? ` skip in ${left} ` : '[x]';
  put(x0, y0, '+' + tag + '-'.repeat(w - 2 - tag.length - right.length) + right + '+', C.mid);
  put(x0 + 1, y0, tag, C.money, 'hud', true);
  if (left <= 0) { put(x0 + w - 1 - right.length, y0, right, C.bright, 'hud', true); addHit(x0 + w - 1 - right.length, y0, right.length, 1, { kind: 'adx' }); }
  put(x0, y0 + h - 1, '+' + '-'.repeat(w - 2) + '+', C.mid);
  for (let r = 1; r < h - 1; r++) { put(x0, y0 + r, '|', C.mid); put(x0 + w - 1, y0 + r, '|', C.mid); }
  // the screen (or the spin-turn between two)
  const rows = adRows(def.screens[ad.screen], now - ad.at);
  const tr = ad.turn && now - ad.turn.at < AD_CFG.turnMs + 400 ? ad.turn : null;
  const old = tr ? adRows(def.screens[tr.from], AD_CFG.screenMs) : null;
  const SPIN = '|/-\\';
  for (let r = 0; r < ADS_H; r++) {
    const ln = rows[r], o = old && old[r];
    const y = y0 + 1 + r, x = x0 + 2;   // (a space of padding inside the border)
    if (!tr) {
      if (!ln) continue;
      if (ln.inv) { bg(x + ln.x, y, ln.len, ln.col, 1); put(x, y, ln.s, C.bg, 'hud', true); }
      else put(x, y, ln.s, ln.col, 'hud', ln.b);
      if (ln.btn) addHit(x + ln.x, y, ln.len, 1, { kind: 'adbtn', msg: ln.btn });
      continue;
    }
    // spin-turn: each cell flips once its ripple reaches it (left to right, top to bottom)
    for (let k = 0; k < ADS_W; k++) {
      const a = o ? o.s[k] : ' ', b2 = ln ? ln.s[k] : ' ';
      if (a === ' ' && b2 === ' ') continue;
      const tt = now - tr.at - (k * 6 + r * 14);
      if (tt < 0) put(x + k, y, a, o ? o.col : C.text);
      else if (tt < 110) put(x + k, y, SPIN[Math.floor(tt / 28) % 4], C.mid);
      else if (b2 !== ' ') put(x + k, y, b2, ln.inv ? C.bg : ln.col, 'hud', ln.b);
      if (tt >= 110 && ln && ln.inv && b2 !== ' ') bg(x + k, y, 1, ln.col, 1);
    }
  }
  // two-screen ads turn on their own
  if (!ad.turn || now - ad.turn.at > AD_CFG.turnMs) { if (now - ad.at > AD_CFG.screenMs && ad.screen < def.screens.length - 1) adTurn(); }
}
