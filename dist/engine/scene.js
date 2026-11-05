// NeoN+1 engine/scene.js: building each frame (buildScene): the HUD, the overlays, and which screen draws. The parts
// it calls live in engine/board.js, tray.js, mapview.js and textboard.js (split out 2026-11-05).
'use strict';
NEON_FILES.push(['engine/scene.js', 'v14.45']);

// ---------------- Scene ----------------
let hits = [];
let bgs = [];           // background-tinted cells for the current frame
const pad2 = n => String(n).padStart(2, '0');
const rule = w => '- '.repeat(Math.ceil(w / 2)).slice(0, w);
const decodeDelay = (cx, cy) => 40 + ((((Math.round(cx * 2) + 1) * 374761393) ^ ((Math.round(cy * 2) + 1) * 668265263)) >>> 0) % 380;

// raw = skip transitions (used for snapshots).
// HUD integrity: watch the shown value. A gain pops each new # (HP_POP ms, scaled past the grid); a loss breaks each
// lost # into bits that hop and fall. Only the live frame (collectHits) watches, so snapshots don't double it.
const HP_POP = 520;
const hpFx = { run: null, shown: null, x0: 0, gain: {} };
function hpWatch(cur, x0, bar, now) {
  const run = st.run;
  if (hpFx.run !== run || hpFx.shown == null) { Object.assign(hpFx, { run, shown: cur, x0, gain: {} }); return; }
  const was = hpFx.shown;
  if (cur > was && !reduced()) { if (bar) for (let i = was; i < cur; i++) hpFx.gain[i] = now + (i - was) * 90; else hpFx.gain.all = now; }
  if (cur < was && !reduced() && bar) {
    for (let i = cur; i < was; i++) {
      const x = pxX(hpFx.x0 + i), y = pxY(2);
      const bits = ['#', '+', '=', '.', "'"].map(ch => ({ ch, x: x + rand(-0.3, 0.3) * L.cw, y: y + rand(-0.3, 0.3) * L.chh, col: C.danger }));
      explode(bits, x, y + L.chh * 0.8, { col: C.danger, power: 0.35, grav: 1, life: [0.55, 0.95] });
    }
  }
  hpFx.shown = cur; hpFx.x0 = x0;
}

// ---------- Overlays: the boxes that come up over everything ----------
// In drawing order, bottom first. on(): it's up. shown(): not hidden by another (a card waits under an ad). The top
// one that's up and shown takes taps and keys (overlayTop: engine/input.js), so what you see is what you tap. None of
// them draw or take input while the dev menu is open. tick: runs every frame it's collected (timers, queues).
// (The training's popup isn't here: it lets some taps through; boot, corp and boss intros are skipped by any tap.)
const OVERLAYS = [
  { id: 'ad', on: () => !!st.ad, shown: () => true, build: (c, now) => buildAd(Object.assign(c, { under: true }), now), tap: h => adTap(h, performance.now()), key: k => adKey(k, performance.now()) },   // engine/ads.js
  { id: 'event', on: () => !!st.evCard, shown: () => !st.ad, build: (c, now) => buildEventCard(c, now), tap: h => evTap(h), key: k => evKey(k) },   // a SECTOR EVENT card, engine/events.js
  { id: 'hacker', on: () => !!st.hkCard, shown: () => !st.ad, tick: now => hkCardTick(now), build: (c, now) => buildHkCard(c, now), tap: () => hkCardTap(), key: k => hkCardKey(k) },   // a rival coming in, crew you called: engine/hackers.js
  { id: 'feat', on: () => !!st.featBox, shown: () => !st.ad && !st.evCard, tick: now => featBoxTick(now), build: (c, now) => buildFeatBox(c, now), tap: h => featTap(h), key: k => featKey(k) },   // engine/feats.js
  { id: 'call', on: () => !!st.callBox, shown: () => !st.ad && !st.evCard && !st.featBox, tick: now => callTick(now), build: (c, now) => buildCallBox(c, now), tap: h => callTap(h), key: k => callKey(k) },   // a CALL, engine/quests.js
  { id: 'scene', on: () => !!st.qScene, shown: () => true, build: (c, now) => buildScene_(c, now), tap: h => sceneTap(h), key: k => sceneKey(k) },   // a quest scene, full screen: engine/quests.js
];
const overlayTop = () => { if (st.dev) return null; for (let i = OVERLAYS.length - 1; i >= 0; i--) { const o = OVERLAYS[i]; if (o.on() && o.shown()) return o; } return null; };
// A drawing layer over the scene: its own put (into cells, added after), bg into bgs. cells: what's already drawn.
function layerCtx(ctx, cells, bgs, owner = 'hud') {
  const out = [];
  const put = (cx, cy, str, col, own = owner, bold = false) => { for (let k = 0; k < str.length; k++) if (str[k] !== ' ') out.push({ ch: str[k], cx: cx + k, cy, col, own, bold }); };
  const c = Object.assign({}, ctx, { put, bg: (cx, cy, w, col, alpha) => bgs.push({ cx, cy, w, col, alpha }) });
  if (cells) c.cells = cells;
  return { ctx: c, cells: out };
}

function buildScene(now, collectHits, raw = false) {
  const cells = [];
  const frameBgs = [];
  const put = (cx, cy, str, col, own = 'hud', bold = false) => {
    for (let k = 0; k < str.length; k++) {
      if (str[k] !== ' ') cells.push({ ch: str[k], cx: cx + k, cy, col, own, bold });
    }
  };
  const putC = (cy, str, col, own) => put(Math.floor((L.wc - str.length) / 2), cy, str, col, own);
  const putR = (cy, str, col, own) => put(L.wc - str.length, cy, str, col, own);
  const bg = (cx, cy, w, col, alpha) => frameBgs.push({ cx, cy, w, col, alpha });
  st.frameBgs = frameBgs;   // (H3AV3N's fake win reads a cell's background: what falls out of the hole falls with it)
  const addHit = (cx, cy, w, h, hit) => {
    if (!collectHits) return;
    let x = L.ox + cx * L.cw, y = L.oy + cy * L.chh, pw = w * L.cw, ph = h * L.chh;
    if (ph < 40) { y -= (40 - ph) / 2; ph = 40; }   // finger-sized tap targets
    if (pw < 40) { x -= (40 - pw) / 2; pw = 40; }
    if (hit.kind === 'btn' && hit.onTap && st.tut && !tutAllows('btn', hit.id)) hit = Object.assign({}, hit, { onTap: tutNo });   // the training run: only what it asks for
    hits.push(Object.assign({ x, y, w: pw, h: ph, cr: [cx, cy, w, h] }, hit));
  };
  const ctx = { now, put, putC, putR, addHit, bg, cells, collectHits };

  if (st.hideAll) { if (st.hkDeath && !st.dev) buildHkDeath(ctx, now); if (collectHits) bgs = frameBgs.slice(); return cells; }   // (a hacker's last word over the fall-out)
  const run = st.run;

  const boardEnd = BOARD_Y + L.gh;
  // Hover / keyboard cursor look, the same everywhere: a background highlight
  // (plus a > marker for the keyboard cursor). Buttons keep their own colors.
  // marker = false where the > would land on neighboring text (tightly packed rows).
  const hl = (x, y, w, h, id, marker = true) => {
    if (st.hoverBtn !== id) return;
    for (let r = 0; r < h; r++) bg(x, y + r, w, C.accent, st.kbFocus === id ? 0.3 : 0.2);
    if (marker && st.kbFocus === id && x >= 2) put(x - 2, y + Math.floor((h - 1) / 2), '>', C.accent, 'ui', true);
  };
  ctx.hl = hl;

  // The title gets the whole screen: no header, HUD or tray.
  const versionTag = `neon+1 ${VERSION} [?]`;
  // Footer, bottom row on every screen: [DEV] (when dev access is on) + build version. The
  // version is the link to the INFO page (not during a run or a multiplayer game).
  const footerRight = () => {
    const y = L.hc - 1, x0 = L.wc - versionTag.length, live = !st.run && !st.mp && !st.busy && !st.transitioning;
    putR(y, versionTag, st.hoverBtn === 'info' ? C.accent : C.dim);
    if (live) {
      if (st.hoverBtn === 'info') bg(x0, y, versionTag.length, C.accent, 0.2);
      addHit(x0, y, versionTag.length, 1, { kind: 'btn', id: 'info', onTap: () => swapTo(openInfo), noFocus: true });
    }
    if (st.devAccess || st.dev) {   // ?dev=1 in the URL, or the backtick key (until a refresh)
      const label = '[DEV]', x = L.wc - versionTag.length - label.length - 2;
      put(x, y, label, st.dev ? C.accent : C.mid, 'ui');
      if (st.hoverBtn === 'dev') bg(x, y, label.length, C.accent, 0.2);
      addHit(x, y, label.length, 1, { kind: 'btn', id: 'dev', onTap: toggleDev, noFocus: true });
    }
  };
  if (!st.dev && st.boot) {
    buildIntro(ctx, now);   // the boot / login intro (engine/intro.js)
  } else if (!st.dev && st.bossIntro) {
    buildBossIntro(ctx, now);
  } else if (!st.dev && st.mode === 'over' && st.overReveal) {
    buildOverReveal(ctx, now);
    footerRight();
  } else if (!st.dev && !st.pause && st.mode === 'panel' && st.panelReveal && !st.panelReveal.done) {
    buildReveal(ctx, now, st.panelReveal, panelLines());
  } else if (fullScreen() || st.dev) {
    buildTextBoard(ctx, st.dev ? devLines() : st.mode === 'title' ? titleLines(now) : panelLines(), { top: 0, h: L.hc });
    footerRight();
  } else {

  // Header
  const headerBtn = (x, label, id, onTap, active) => {
    put(x, 0, label, active ? C.accent : C.mid, 'ui');
    if (st.hoverBtn === id) bg(x, 0, label.length, C.accent, 0.2);
    addHit(x, 0, label.length, 1, { kind: 'btn', id, onTap, noFocus: true });
  };
  // The name is the menu button during a run (no [MENU] of its own).
  const menuOk = !st.mp && run && !(st.g0df && st.g0df.wake) && (st.mode === 'map' || st.mode === 'play' || st.mode === 'panel' || st.mode === 'fish' || (st.mode === 'g0df' && st.g0df && st.g0df.real));   // (G0D's fight: you can still quit)
  put(0, 0, 'NeoN+1', C.accent, menuOk ? 'ui' : undefined, menuOk && st.pause === true);
  if (menuOk) {
    if (st.hoverBtn === 'menu' || st.pause === true) bg(0, 0, 6, C.accent, 0.2);
    addHit(0, 0, 6, 1, { kind: 'btn', id: 'menu', onTap: togglePause, noFocus: true });
  }
  if (st.mp) headerBtn(12, '[LEAVE]', 'leave', mpLeave, false);
  else if (!menuOk) put(12, 0, `// ${VERSION}`, C.dim);
  put(0, 1, rule(L.wc), C.dim);

  // HUD
  if (st.mp && st.mp.state && st.mode === 'play') {
    // Up to 6 players, 3 per row: logo + name + integrity. Current turn highlighted.
    const m = st.mp, S = m.state;
    S.order.forEach((id, i) => {
      const mem = mpMember(id), x = (i % 3) * 12, y = 2 + Math.floor(i / 3);
      const out = !S.alive[id], turn = S.turn === id && !S.winner;
      const hp = out ? 'xxxx'.slice(0, S.max) : '#'.repeat(Math.max(0, S.hp[id])) + '-'.repeat(Math.max(0, S.max - S.hp[id]));
      const col = out ? C.dim : mpColor(id), back = mpBg(id);
      if (back && !out) bg(x, y, 12, back, turn ? 1 : 0.6);   // their style's background
      else if (turn) bg(x, y, 12, col, 0.25);
      if (turn && back && Math.floor(now / 400) % 2) bg(x, y, 12, col, 0.18);   // current turn pulses
      put(x, y, logoChar(mem.logo), col, 'hud', true);
      put(x + 1, y, mpShort(id), col, 'hud', id === m.me);
      put(x + 8, y, hp, out ? C.dim : S.hp[id] <= 1 ? C.danger : col, 'hud');
    });
  } else if (run && st.mode !== 'title' && st.mode !== 'over') {
    put(0, 2, 'LAYER ', C.mid); put(6, 2, pad2(run.depth), C.bright);
    if (run.sector) { put(9, 2, 'S', C.mid); put(10, 2, String(run.sector + 1), C.bright); }
    // FAILSAFE: shows 0 for a beat after the killing hit, then blinks back to 1
    const fsAge = st.fsAt && now >= st.fsAt ? now - st.fsAt : 1e9;
    const cur = fsAge < FAILSAFE_BEAT ? 0 : Math.max(0, run.integrity);
    const bar = run.maxInt <= 10 ? '#'.repeat(cur) + '-'.repeat(Math.max(0, run.maxInt - cur)) : `${cur}/${run.maxInt}`;
    const fsBlink = fsAge >= FAILSAFE_BEAT && fsAge < FAILSAFE_BEAT + 900 && Math.floor(fsAge / 110) % 2;
    if (zombie()) {   // ZOMBIE: rot in place of integrity, sickly as it climbs
      const rot = run.rot || 0, txt = `${String(rot).padStart(3, '0')}/${ROT.max}`;
      putR(2, txt, rot >= ROT.max - 30 ? C.danger : rot >= ROT.max / 2 ? C.money : C.accent);
      put(L.wc - txt.length - 4, 2, 'ROT', C.mid);
    } else if (bloodMoney()) {   // BLOOD MONEY: your credits are your life; red when one more hit breaks you
      const txt = `${run.credits}cr`, cost = bloodCost(1);
      putR(2, txt, run.credits < cost ? C.danger : run.credits < cost * 3 ? C.money : C.accent);
      put(L.wc - txt.length - 5, 2, 'LIFE', C.mid);
      put(L.wc - txt.length - 5 - 9, 2, `hit-${cost}`, C.dim);
    } else {
      const x0 = L.wc - bar.length, base = fsBlink ? C.bright : cur <= 1 ? C.danger : C.accent;
      if (collectHits) hpWatch(cur, x0, run.maxInt <= 10, now);
      // one char at a time: a new # pops up past the grid; at 1 left it beats like a heart (two quick blinks)
      const beat = cur === 1 && !fsBlink && (now % 1400 < 90 || (now % 1400 > 200 && now % 1400 < 290));
      for (let i = 0; i < bar.length; i++) {
        const t0 = hpFx.gain[run.maxInt <= 10 ? i : 'all'], k = t0 != null ? (now - t0) / HP_POP : 1;
        const pop = k >= 0 && k < 1, isHash = run.maxInt > 10 || bar[i] === '#';
        cells.push({ ch: bar[i], cx: x0 + i, cy: 2, own: 'hud', col: pop && k < 0.6 ? C.bright : beat && isHash ? C.bright : base,
          bold: pop || (beat && isHash), sc: pop ? 1 + 0.75 * Math.sin(Math.PI * k) : beat && isHash ? 1.15 : 1 });
      }
      put(L.wc - bar.length - 4, 2, 'INT', C.mid);   // (was INTEGRITY; the user, 2026-10-26)
    }
    const fw = st.corp && st.corp.wallAll ? 'FW*' : run.shield ? `FW${run.shield}` : '';
    if (fw) put(L.wc - bar.length - 4 - 1 - fw.length, 2, fw, C.accent);
    if (run.oneUp > 0) put(L.wc - bar.length - 4 - 1 - (fw ? fw.length + 1 : 0) - 3, 2, '1UP', C.money);   // the 1UP, charged (engine/oneup.js)

    let where = run.sector ? `OVERWORLD // SECTOR ${run.sector + 1}` : 'OVERWORLD';
    if (st.mode === 'play' && st.corp) {
      const c = st.corp;
      const prog = c.def.progLabel ? c.def.progLabel(c) : c.hasBoss ? (st.lv && st.lv.boss ? 'BOSS' : `${c.idx + 1}/${c.counts.length - 1}`) : '';
      where = `${c.def.name} ${prog}`;
    } else if (st.mode === 'panel') where = st.panelTitle || '';
    else if (st.mode === 'fish') where = 'THE PIER';
    else if (st.mode === 'g0dfake') where = 'G0D // BREACHED';
    else if (st.mode === 'g0dend') where = 'G0D // DOWN';
    else if (st.mode === 'g0ddie') where = 'G0D // FIGHT';
    else if (st.mode === 'g0df' && st.g0df) where = `G0D // ${{ maze: 'MAZE', fight: 'FIGHT', stand: 'FINAL STAND' }[st.g0df.stage]}`;
    put(0, 3, where, st.lv && st.lv.boss && st.mode === 'play' ? C.danger : C.text);
    // LEVERAGE: in debt the credits go red, with your limit after them (CR -120/-150)
    const crTxt = `${(st.mode === 'play' && corpFlag('money')) || 'CR'} ${run.credits}${leverage() && run.credits < 0 ? '/' + creditFloor() : ''}`;
    putR(3, crTxt, run.credits < 0 ? C.danger : C.money);
    if (has('coinflip')) { const m = run.coinMult || 1; put(L.wc - crTxt.length - 4, 3, `x${m}`, m >= COIN.max ? C.bright : m > 1 ? C.money : C.dim, 'hud', m > 1); }   // COIN FLIP: the multiplier
  } else {
    put(0, 2, `BEST ${pad2(save.best)}   RUNS ${save.runs}   WINS ${save.wins}`, C.mid);
  }
  const ruleCol = st.mp && mpMine() ? (Math.floor(now / 350) % 2 ? C.accent : C.mid) : C.dim;   // glows on your turn
  put(0, 4, rule(L.wc), ruleCol);

  // Row 5: odds in a layer, seed elsewhere
  if (st.mode === 'play' && st.lv) {
    const cand = candidates().length, reals = Math.max(1, candidates().filter(isReal).length);
    const open = st.lv.tiles.filter(t => t.state === 'closed').length;
    put(0, 5, 'OPEN ', C.mid); put(5, 5, `${pad2(open)}/${pad2(st.lv.n)}`, C.text);
    if (cand > 0 && !corpFlag('noOdds')) {   // (G0D MAZE: no odds: every node goes somewhere)
      const pct = Math.round(100 * Math.min(reals, cand) / cand);   // QUANTUM: 2 IN n
      const col = cand <= reals ? C.accent : pct < 25 ? C.danger : C.text;
      const val = `${Math.min(reals, cand)} IN ${cand}  ${String(pct).padStart(3)}%`;
      putR(5, val, col);
      put(L.wc - val.length - 5, 5, 'ODDS', C.mid);
    }
  }

  // The terminal line: inverted, on a band of its color across the whole row, so it reads as its own thing
  // (players missed it under the HUD). It types in as before.
  // a hacker's line has had its time: the game's line from before comes back, as it was (engine/hackers.js hkSay)
  if (st.msgChat && now > st.msgChat.until) {
    const w = st.msgChat.was; st.msgChat = null;
    if (w.lv === st.lv) { if (w.msg) { setMsg(w.msg, w.col, w.ink); st.msgT = now - 1e5; } else st.msg = ''; }
  }
  if (st.msg) {
    const col = (st.msgSlot && C[st.msgSlot]) || st.msgCol || C.text;
    bg(0, 6, L.wc, col, 1);
    // the text: the palette's background, unless the band is about as light (POPS's yellow on a light palette): then its text color
    const lum = c => /^#[0-9a-f]{6}$/i.test(c) ? hexLum(c) : 0.5;
    const dBg = Math.abs(lum(col) - lum(C.bg)), ink = st.msgInk ? st.msgInk : dBg < 0.25 && Math.abs(lum(col) - lum(C.text)) > dBg ? C.text : C.bg;   // (only when it can't be read: every other band stays as it was)
    put(0, 6, st.msg.slice(0, Math.min(L.wc, Math.floor((now - st.msgT) / 16))), ink, 'hud', true);
  }

  // Row 7: clock or boss warning
  if (st.mode === 'play' && st.lv) {
    // Mod notes (FORECAST, SPELLBOUND...): right side of the row. `ms` notes show briefly.
    const lvn = st.lv;
    const live = (lvn.notes || []).filter(nt => !nt.ms || (lvn.readyAt != null && now - lvn.readyAt < nt.ms));
    const brief = live.filter(nt => nt.ms);   // a brief note (PHOTOGRAPHIC) gets the row to itself
    // A corp's button (CALL, BID, TITHE...) sits on the right; notes give it the room.
    const act = !st.mp ? corpHook('action', st.lv) || null : null;
    const actLabel = act ? `[${act.label}]` : '';
    const tl = legacyLv('tellscope') && st.lv && st.lv.hasTell && !st.mp && st.corp && st.corp.hasBoss ? (st.lv.tellOn ? 'TELL ON' : 'TELL OFF') : '';   // TELL LIGHT (THE BOARD)
    const notes = act ? '' : [tl].concat((brief.length ? brief : live).map(nt => nt.text)).filter(Boolean).join('  ');
    if (act) {
      const ax = L.wc - actLabel.length, canAct = act.ok && !st.busy;
      put(ax, 7, actLabel, act.hot ? C.danger : canAct ? C.accent : C.dim, 'ui', true);
      if (st.hoverBtn === 'corpact' && canAct) bg(ax, 7, actLabel.length, C.accent, 0.2);
      addHit(ax, 7, actLabel.length, 1, { kind: 'btn', id: 'corpact', noFocus: true, onTap: () => { const a2 = corpHook('action', st.lv); if (a2 && a2.ok && !st.busy && st.mode === 'play') a2.use(); else Sound.deny(); } });
    }
    if (st.timer) {
      const w = notes || act ? 10 : 20, f = Math.max(0, st.timer.left / st.timer.max);
      const fill = Math.ceil(f * w);
      const low = st.timer.left <= 3;
      put(0, 7, 'CLOCK ', C.mid);
      put(6, 7, '=' .repeat(fill), low ? C.danger : C.text);
      put(6 + w, 7, '|', C.dim);
      put(6 + w + 2, 7, `${Math.ceil(st.timer.left)}s`, low ? C.danger : C.text);
      if (notes) putR(7, notes.slice(0, L.wc - w - 12), C.accent);
    } else if (st.mp && st.mp.state) {
      // The turn bar: the whole row in the current player's colors; the brighter part is
      // what's left of the turn clock. Flashes red on your last 5 seconds.
      const S = st.mp.state, mine = mpMine(), id = S.turn;
      let textCol = C.mid;
      if (!S.winner) {
        const sty = mpStyle(id), barCol = sty ? sty.bg : mpColor(id);
        const left = mpClockLeft(now), sec = mpClock();
        const hurry = mine && left != null && left <= 5 && Math.floor(now / 250) % 2;
        bg(0, 7, L.wc, hurry ? C.danger : barCol, 0.4);
        bg(0, 7, left == null ? L.wc : Math.ceil(L.wc * left / sec), hurry ? C.danger : barCol, 1);
        textCol = sty ? sty.fg : C.bg;
        put(0, 7, mine ? '>> YOUR TURN' : `.. ${mpName(id).slice(0, 12)}`, textCol, 'hud', true);
      }
      const sp = st.lv.spec;
      if (sp) { const tag = `L${pad2(S.layer)} ${CORPS[sp.corp] ? CORPS[sp.corp].name.split(' ')[0] : corpDef(sp.corp).name}${sp.boss ? ' BOSS' : ''}`; putR(7, tag, textCol); }
    } else {
      // The corp's hint (corp kit), or the boss warning. Mod notes go on the right; if they
      // don't fit next to the hint, the two take turns.
      const h = corpHook('hint', st.lv, now) || null;
      const left = h ? h.text : st.lv.boss && st.corp ? '!! ' + st.corp.def.bossDesc : '';
      const fits = !notes || (h && h.x != null) || left.length + notes.length + 2 <= L.wc;
      const showNotes = notes && (fits || Math.floor(now / 2500) % 2);
      const room = act ? L.wc - actLabel.length - 1 : L.wc;
      if (left && (fits || !showNotes)) {
        if (h) put(h.x != null ? h.x : 0, 7, h.text.slice(0, room - (h.x || 0)), h.col || C.text);
        else put(0, 7, left.slice(0, room), C.dangerDim);
      }
      if (showNotes) putR(7, notes.slice(0, L.wc), C.accent);
    }
  }

  // Board
  if (st.pause) buildTextBoard(ctx, pauseLines());
  else if (!st.hideBoard) {
    if (st.mode === 'play' && st.lv) {
      if (st.mp && mpCardOn(now)) mpTurnCard(ctx);   // the turn card covers the board for a moment
      else { if (st.mp) mpTurnFrame(ctx); buildBoard(ctx); if (st.mp) { mpDrawCursors(ctx); mpTurnBanner(ctx); } }
    }
    else if (st.mode === 'map') buildMap(ctx);
    else if (st.mode === 'g0df') buildG0df(ctx);   // the G0D prototype (engine/g0dfight.js)
    else if (st.mode === 'g0dfake') buildG0dFake(ctx);   // H3AV3N: the fake win (engine/heaven.js)
    else if (st.mode === 'g0dend') buildG0dEnd(ctx);   // H3AV3N: the collapse
    else if (st.mode === 'g0ddie') buildG0dDie(ctx);   // H3AV3N: G0D dies (before the fake win)
    else if (st.mode === 'fish') buildFish(ctx);   // the PIER (engine/fishing.js)
    else buildTextBoard(ctx, panelLines());
  }

  // Tray: mods, items, info
  put(0, boardEnd + 1, rule(L.wc), ruleCol);
  buildTray(ctx, boardEnd + 2);
  buildPet(ctx, boardEnd + 1);   // the pet, sitting on the rule over the tray (engine/pet.js)
  buildLootBtn(ctx, boardEnd + 1);   // [$], the LOOT bag, at the rule's right end (engine/loot.js)
  buildBoyBtn(ctx, boardEnd + 1);   // [b], b0y, at its left end (H3AV3N: engine/heaven.js)

  // Footer: the run's seed, small and out of the way.
  // Left side of the footer, clipped so it never runs into [DEV] / the version.
  const footRoom = L.wc - versionTag.length - (st.devAccess || st.dev ? 8 : 1) - 1;
  if (run && st.mode !== 'over') put(0, boardEnd + 6, `seed ${run.seed}${run.quest ? ' quest' : run.practice ? ' practice' : run.seeded ? ' replay' : ''}`.slice(0, footRoom), C.dim);
  else if (st.mp) put(0, boardEnd + 6, `room ${st.mp.code}`, C.dim);
  footerRight();
  }

  let result = cells;
  if (!raw) {
    if (st.wipe && !st.dev) result = applyWipe(cells, now);
    else {
      // Board characters "decode" in when a screen appears without a wipe.
      const age = now - st.boardStart;
      if (age < 500) {
        for (const c of cells) {
          if (c.cy >= BOARD_Y && c.cy < boardEnd && age < decodeDelay(c.cx, c.cy)) { c.ch = noiseCh(); c.col = C.dim; }
        }
      }
    }
    if (st.moldLag && !st.dev) result = applyMoldLag(result, now);   // the mold a wipe left behind, clearing late (engine/effects.js)
  }
  // A fake ad goes over everything, after the wipe too (a wipe between layers holds the screen while
  // an ad is up; drawn under the wipe, the ad was invisible). Its characters and backgrounds are kept
  // apart and added on top; what was under the box is dropped.
  const adBgs = [];
  // The editor's G0D tab (engine/g0d.js): a G0D design or effect drawn over this screen. Never in play.
  if ((st.g0d || st.g0dBar) && !st.dev) result = g0dOverlay(result, now, adBgs);
  if (st.mode === 'g0df' && !st.dev) result = g0dfOverlay(result, now, adBgs);   // the G0D prototype: its bar, the mold on your INT
  if ((st.mode === 'play' || st.mode === 'panel') && !st.dev) result = moldOverlay(result, now, adBgs);   // H3AV3N: the M0LD in a corp (and on the broken UPLINK)
  if (st.g0dFake && !st.dev) result = g0dFakeOverlay(result, now, adBgs);   // H3AV3N: the fake win (over the rewards screen)
  if (st.mode === 'g0ddie' && !st.dev) result = g0dDieOverlay(result, now, adBgs);   // H3AV3N: G0D dies
  if (st.mode === 'g0dend' && !st.dev) result = g0dEndOverlay(result, now, adBgs);   // H3AV3N: the collapse
  // The overlays (OVERLAYS, below): bottom first, so the top one is drawn last.
  for (const o of OVERLAYS) {
    if (collectHits && o.tick) o.tick(now);
    if (!st.dev && o.on() && o.shown()) { const lc = layerCtx(ctx, result, adBgs); o.build(lc.ctx, now); result = result.concat(lc.cells); }
  }
  // The training run's popup (engine/tutorial.js): over everything but an ad, the same way.
  if (st.tut && st.tut.pop && !st.dev && !st.ad && (!st.wipe || st.tut.curtain)) {
    const lc = layerCtx(ctx, null, adBgs, 'tut');
    buildTutorial(lc.ctx, now, result);
    result = result.concat(lc.cells);
  }
  const wTop = st.wipe && st.wipe.top != null ? st.wipe.top : BOARD_Y, wBot = st.wipe && st.wipe.bot != null ? st.wipe.bot : boardEnd;
  if (collectHits) bgs = (st.wipe && !st.dev ? (st.wipe.full && st.wipe.top == null ? [] : frameBgs.filter(b => b.cy < wTop || b.cy >= wBot)) : frameBgs).concat(adBgs);
  if (collectHits) st.focusables = hits.filter(h => h.kind === 'btn' && !h.noFocus).sort((a, b) => a.y - b.y || a.x - b.x).map(h => ({ id: h.id, onTap: h.onTap }));
  return result;
}
