// NeoN+1 engine/ads.js: the fake ads: when they show up, the ad box, and its two-screen turn.
'use strict';
NEON_FILES.push(['engine/ads.js', 'v15.05']);

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
  if (!adsOn() || !run.corps || run.tutorial) return Promise.resolve();
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
  tally('ads');   // THE RECORD (engine/feats.js)
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
  popupBg(bg, 'ad', x0, y0, w, h);   // (its look: POPUP_LOOK, engine/render.js)
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

// ---------------- PH1SH's spam ad (ROOT's quest, PAPERWORK: docs/CREW_QUESTS.md, Greg 2026-11-20) ----------------
// A fake ad over the whole screen, with one of ROOT's letters in it (engine/bench.js benchRootFound). It looks like an
// ad, but off: a wavy border in PH1SH's colors, and a sender that gives it away. It comes up even with SETTINGS > ads
// off (it's the quest). [ close ] keeps the letter; the bait button lets a fish eat it, PH1SH laughs, and your credits
// go. st.phish = { ch, spam, t0, phase: 'ask' | 'keep' | 'eat', at, took, done(eaten) }.
const PHISH = { keepMs: 520, swimMs: 900, laughAt: 1500, laughMs: 2300, take: 30 };
function phishShow(ch, done) {
  const q = save.quests && save.quests.root, seen = (q && q.spam) || 0;
  const spam = PHISH_SPAM[seen % PHISH_SPAM.length];   // the stowaway one first, then the others in turn
  if (q) { q.spam = seen + 1; persist(); }
  st.phish = { ch, spam, t0: performance.now(), phase: 'ask', done };
  st.kbFocus = st.hoverBtn = null;
  Sound.buzz ? Sound.buzz() : Sound.ui();
}
function phishPick(bait) {
  const p = st.phish;
  if (!p || p.phase !== 'ask' || performance.now() - p.t0 < 400) return;   // (a beat before a tap counts)
  p.phase = bait ? 'eat' : 'keep'; p.at = performance.now();
  if (bait) Sound.whiff(); else Sound.ui();
}
function phishEnd() { const p = st.phish; st.phish = null; Sound.ui(); if (p && p.done) p.done(p.phase === 'eat'); }
function phishTick(now) {
  const p = st.phish; if (!p) return;
  const t = now - (p.at || 0);
  if (p.phase === 'keep' && t >= PHISH.keepMs) phishEnd();
  if (p.phase === 'eat' && t >= PHISH.laughAt && p.took == null) {   // he laughs, and takes his cut
    const run = st.run; p.took = run ? Math.min(run.credits, PHISH.take) : 0; p.was = run ? run.credits : 0;
    if (run) run.credits -= p.took;
    Sound.trap();
  }
  if (p.phase === 'eat' && t >= PHISH.laughAt + PHISH.laughMs) phishEnd();
}
function phishTap(h) { if (h && h.kind === 'btn' && (h.id === 'phbait' || h.id === 'phclose')) h.onTap(); }
function phishKey(k) { if (k === 'escape' || k === 'x') phishPick(false); }   // (Enter never takes the bait)
function buildPhish(ctx, now) {
  const { put, bg, cells, addHit } = ctx, p = st.phish, s = p.spam, sty = hkStyle('phish');
  const w = ADS_W + 4, h = 19, x0 = Math.max(0, Math.floor((L.wc - w) / 2)), y0 = Math.max(0, Math.floor((L.hc - h) / 2)), cx = x0 + Math.floor(w / 2);
  clearRect(cells, x0, y0, w, h);
  popupBg(bg, 'ad', x0, y0, w, h);
  const water = HEX6.test(C.bg) ? moldMix(C.bg, sty.bg, 0.55) : sty.bg;   // PH1SH's water, under it (solid: half-row overlaps, like popupBg)
  for (let r = 1; r < h - 1; r++) { bg(x0 + 1, y0 + r, w - 2, water, 1); if (r < h - 2) bg(x0 + 1, y0 + r + 0.5, w - 2, water, 1); }
  // the border: waves, not lines (it's an ad, but off)
  const wave = (y, k, gap = []) => put(x0, y, Array.from({ length: w }, (_, i) => i >= gap[0] && i < gap[1] ? ' ' : '~-'[(i + k + Math.floor(now / 260)) % 2]).join(''), sty.fg);
  wave(y0, 0, [1, 9]); wave(y0 + h - 1, 1);   // (a gap for the [ AD ] tag)
  for (let r = 1; r < h - 1; r++) { put(x0, y0 + r, '{', sty.fg); put(x0 + w - 1, y0 + r, '}', sty.fg); }
  put(x0 + 2, y0, '[ AD ]', C.money, 'hud', true);
  const mid = (y, t, col, bold = false) => put(cx - Math.floor(t.length / 2), y, t, col, 'hud', bold);
  mid(y0 + 1, 'from: ' + s.from, C.mid);
  mid(y0 + 2, '<no-reply@ph1sh.biz>', C.dim);
  const head = ` ${s.head} `, flash = Math.floor(now / 350) % 2;
  bg(cx - Math.floor(head.length / 2), y0 + 4, head.length, flash ? C.danger : C.money, 1); mid(y0 + 4, head, C.bg, true);
  s.lines.forEach((l, i) => mid(y0 + 6 + i, l, C.text));
  // the letter (3x3, ROOT's quest color); the fish comes for it; PH1SH in its place
  const ly = y0 + 9, lx = cx - 1, t = now - (p.at || 0), chip = letterChip(p.ch);
  const eaten = p.phase === 'eat' && t >= PHISH.swimMs;
  if (!eaten) benchBlock(Object.assign({}, ctx, { now }), lx, ly, p.ch, { t0: p.t0 + 200, chip, seed: 7 });
  if (p.phase === 'keep') for (let i = 0; i < 8; i++) { const a = now / 200 + i * Math.PI / 4; put(lx + 1 + Math.round(Math.cos(a) * 3), ly + 1 + Math.round(Math.sin(a) * 2), '*', C.rep, 'fx'); }
  if (p.phase === 'eat') {
    const fx = t < PHISH.swimMs ? x0 + w - 4 - (x0 + w - 4 - lx) * (t / PHISH.swimMs) : lx - (t - PHISH.swimMs) / 60;
    if (fx > x0) put(Math.round(fx), ly + 1, t < PHISH.swimMs ? '<><' : '<>< ~', sty.fg, 'fx', true);
    if (eaten && !p.boom) {   // the letter goes to bits (like INT lost: engine/hud.js hpBurst)
      p.boom = true; Sound.fishBite(); Sound.shatter();
      const px = pxX(lx + 1.5), py = pxY(ly + 1.5), bits = [];
      for (let i = 0; i < 18; i++) bits.push({ ch: i < 6 ? p.ch : pickR(['#', '%', '.', ':', '*', "'"], Math.random), x: px + rand(-1.2, 1.2) * L.cw, y: py + rand(-1, 1) * L.chh, col: i % 3 ? chip.bg : C.danger });
      explode(bits, px, py + L.chh, { power: 0.7, grav: 0.9, life: [0.7, 1.2] });
    }
    if (t >= PHISH.laughAt) {   // PH1SH, laughing; your credits going
      const face = (ART_FACES.phish || { art: [] }).art, bob = Math.floor(now / 140) % 2 ? -1 : 0;
      face.forEach((l, k) => { bg(lx - 1, ly + k + bob, 6, sty.bg, 1); put(lx - 0.5, ly + k + bob, l, sty.fg, 'hud', true); });
      mid(ly + 4, p.took ? 'thanks, chump. :)' : 'broke AND gullible. :)', sty.fg, true);
      if (p.took) { const k = Math.min(1, (t - PHISH.laughAt) / 900), cr = Math.round(p.was - p.took * k); mid(ly + 6, `credits ${cr}cr  -${p.took}`, C.danger, true); }
      else mid(ly + 6, 'he took the letter.', C.danger);
    }
  }
  // the buttons: the bait shouts, [ close ] is plain (and always there)
  if (p.phase === 'ask') {
    const bait = `>> [ ${s.bait} ] <<`, bx = cx - Math.floor(bait.length / 2), close = '[ close ]', kx = cx - Math.floor(close.length / 2);
    bg(bx, y0 + 14, bait.length, flash ? C.money : C.danger, st.hoverBtn === 'phbait' ? 0.7 : 1); put(bx, y0 + 14, bait, C.bg, 'hud', true);
    addHit(bx, y0 + 14, bait.length, 1, { kind: 'btn', id: 'phbait', onTap: () => phishPick(true) });
    put(kx, y0 + 16, close, st.hoverBtn === 'phclose' ? C.bright : C.mid, 'hud');
    addHit(kx, y0 + 16, close.length, 1, { kind: 'btn', id: 'phclose', onTap: () => phishPick(false) });
  }
}
