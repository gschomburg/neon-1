// NeoN+1 engine/scene.js: Building each frame: HUD, board, tray, map, text fields.
'use strict';
NEON_FILES.push(['engine/scene.js', 'v13.09']);

// ---------------- Scene ----------------
let hits = [];
let bgs = [];           // background-tinted cells for the current frame
const pad2 = n => String(n).padStart(2, '0');
const rule = w => '- '.repeat(Math.ceil(w / 2)).slice(0, w);
const decodeDelay = (cx, cy) => 40 + ((((Math.round(cx * 2) + 1) * 374761393) ^ ((Math.round(cy * 2) + 1) * 668265263)) >>> 0) % 380;

// raw = skip transitions (used for snapshots).
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
  const addHit = (cx, cy, w, h, hit) => {
    if (!collectHits) return;
    let x = L.ox + cx * L.cw, y = L.oy + cy * L.chh, pw = w * L.cw, ph = h * L.chh;
    if (ph < 40) { y -= (40 - ph) / 2; ph = 40; }   // finger-sized tap targets
    if (pw < 40) { x -= (40 - pw) / 2; pw = 40; }
    hits.push(Object.assign({ x, y, w: pw, h: ph }, hit));
  };
  const ctx = { now, put, putC, putR, addHit, bg, cells, collectHits };

  if (st.hideAll) { if (collectHits) bgs = []; return cells; }
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
  put(0, 0, 'BETA_RUNNER', C.accent);
  const headerBtn = (x, label, id, onTap, active) => {
    put(x, 0, label, active ? C.accent : C.mid, 'ui');
    if (st.hoverBtn === id) bg(x, 0, label.length, C.accent, 0.2);
    addHit(x, 0, label.length, 1, { kind: 'btn', id, onTap, noFocus: true });
  };
  if (st.mp) headerBtn(12, '[LEAVE]', 'leave', mpLeave, false);
  else if (run && (st.mode === 'map' || st.mode === 'play' || st.mode === 'panel')) headerBtn(12, '[MENU]', 'menu', togglePause, st.pause);
  else put(12, 0, `// ${VERSION}`, C.dim);
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
      putR(2, bar, fsBlink ? C.bright : cur <= 1 ? C.danger : C.accent);
      put(L.wc - bar.length - 10, 2, 'INTEGRITY', C.mid);
    }
    const fw = st.corp && st.corp.wallAll ? 'FW*' : run.shield ? `FW${run.shield}` : '';
    if (fw) put(L.wc - bar.length - 10 - 1 - fw.length, 2, fw, C.accent);

    let where = run.sector ? `OVERWORLD // SECTOR ${run.sector + 1}` : 'OVERWORLD';
    if (st.mode === 'play' && st.corp) {
      const c = st.corp;
      const prog = c.hasBoss ? (st.lv && st.lv.boss ? 'BOSS' : `${c.idx + 1}/${c.counts.length - 1}`) : '';
      where = `${c.def.name} ${prog}`;
    } else if (st.mode === 'panel') where = st.panelTitle || '';
    put(0, 3, where, st.lv && st.lv.boss && st.mode === 'play' ? C.danger : C.text);
    // LEVERAGE: in debt the credits go red, with your limit after them (CR -120/-150)
    const crTxt = `${(st.mode === 'play' && st.corp && st.corp.def.money) || 'CR'} ${run.credits}${leverage() && run.credits < 0 ? '/' + creditFloor() : ''}`;
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
    if (cand > 0) {
      const pct = Math.round(100 * Math.min(reals, cand) / cand);   // QUANTUM: 2 IN n
      const col = cand <= reals ? C.accent : pct < 25 ? C.danger : C.text;
      const val = `${Math.min(reals, cand)} IN ${cand}  ${String(pct).padStart(3)}%`;
      putR(5, val, col);
      put(L.wc - val.length - 5, 5, 'ODDS', C.mid);
    }
  }

  if (st.msg) put(0, 6, st.msg.slice(0, Math.min(L.wc, Math.floor((now - st.msgT) / 16))), (st.msgSlot && C[st.msgSlot]) || st.msgCol || C.text);

  // Row 7: clock or boss warning
  if (st.mode === 'play' && st.lv) {
    // Mod notes (FORECAST, SPELLBOUND...): right side of the row. `ms` notes show briefly.
    const lvn = st.lv;
    const live = (lvn.notes || []).filter(nt => !nt.ms || (lvn.readyAt != null && now - lvn.readyAt < nt.ms));
    const brief = live.filter(nt => nt.ms);   // a brief note (PHOTOGRAPHIC) gets the row to itself
    // A corp's button (CALL, BID, TITHE...) sits on the right; notes give it the room.
    const act = st.corp && st.corp.hasBoss && st.corp.def.action && !st.mp ? st.corp.def.action(st.lv) : null;
    const actLabel = act ? `[${act.label}]` : '';
    const notes = act ? '' : (brief.length ? brief : live).map(nt => nt.text).join('  ');
    if (act) {
      const ax = L.wc - actLabel.length, canAct = act.ok && !st.busy;
      put(ax, 7, actLabel, act.hot ? C.danger : canAct ? C.accent : C.dim, 'ui', true);
      if (st.hoverBtn === 'corpact' && canAct) bg(ax, 7, actLabel.length, C.accent, 0.2);
      addHit(ax, 7, actLabel.length, 1, { kind: 'btn', id: 'corpact', noFocus: true, onTap: () => { const a2 = st.corp && st.corp.def.action && st.corp.def.action(st.lv); if (a2 && a2.ok && !st.busy && st.mode === 'play') a2.use(); else Sound.deny(); } });
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
      const h = st.corp && st.corp.hasBoss && st.corp.def.hint ? st.corp.def.hint(st.lv, now) : null;
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
    else buildTextBoard(ctx, panelLines());
  }

  // Tray: mods, items, info
  put(0, boardEnd + 1, rule(L.wc), ruleCol);
  buildTray(ctx, boardEnd + 2);

  // Footer: the run's seed, small and out of the way.
  // Left side of the footer, clipped so it never runs into [DEV] / the version.
  const footRoom = L.wc - versionTag.length - (st.devAccess || st.dev ? 8 : 1) - 1;
  if (run && st.mode !== 'over') put(0, boardEnd + 6, `seed ${run.seed}${run.practice ? ' practice' : ''}`.slice(0, footRoom), C.dim);
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
  }
  // A fake ad goes over everything, after the wipe too (a wipe between layers holds the screen while
  // an ad is up; drawn under the wipe, the ad was invisible). Its characters and backgrounds are kept
  // apart and added on top; what was under the box is dropped.
  const adBgs = [];
  if (st.ad && !st.dev) {
    const ac = [];
    const aput = (cx, cy, str, col, own = 'hud', bold = false) => { for (let k = 0; k < str.length; k++) if (str[k] !== ' ') ac.push({ ch: str[k], cx: cx + k, cy, col, own, bold }); };
    buildAd(Object.assign({}, ctx, { put: aput, bg: (cx, cy, w, col, alpha) => adBgs.push({ cx, cy, w, col, alpha }), cells: result, under: true }), now);
    result = result.concat(ac);
  }
  if (collectHits) bgs = (st.wipe && !st.dev ? (st.wipe.full ? [] : frameBgs.filter(b => b.cy < BOARD_Y || b.cy >= boardEnd)) : frameBgs).concat(adBgs);
  if (collectHits) st.focusables = hits.filter(h => h.kind === 'btn' && !h.noFocus).sort((a, b) => a.y - b.y || a.x - b.x).map(h => ({ id: h.id, onTap: h.onTap }));
  return result;
}

// A mod's key color (its rarity chip's background).
const modColor = m => rarityCol(m.rarity);
// Text on its rarity chip: the chip's background behind it, the chip's text color on top.
function putChip(put, bg, x, y, text, r, own = 'ui', bold = false) {
  const ch = chipOf(r);
  bg(x, y, text.length, ch.bg, 1);
  put(x, y, text, ch.fg, own, bold);
}

// Draws one mod badge on its rarity chip: an animated icon character plus its short name.
// Animation gets fancier with rarity: common = still. Flashes invert the chip (dark on key color
// becomes key color on dark), so a badge always reads. EXOTIC breaks the rule on purpose: its
// letters cycle through every rarity's chip. Dim (spent, can't use) = plain grey, no chip. Muted
// (a market offer you can't afford) = the rarity's key color as text, no chip.
// fireKey: in the tray, the mod whose MOD FIRED animation this badge plays (engine/mods.js).
function drawBadge(put, now, x, y, key, i, { selected = false, dim = false, own = 'tray', noCharges = false, tier = 0, bg = null, muted = false, fireKey = null } = {}) {
  const m = tierView(MODS[key], tier || 0);
  const lvl = RARITY[m.rarity].lvl, chip0 = chipOf(m.rarity);
  const phase = i * 0.77, t = (now / 1000 + phase) % 4;
  const icon = m.icon[Math.floor(now / 180 + i * 3) % m.icon.length];
  const label = m.short + (m.lvlTag && m.tier > 0 ? String(m.tier + 1) : '');   // TRC2 = level 2
  const anim = lvl === 0 ? 'none' : lvl === 3 ? 'exotic' : m.anim;
  const fire = k => fireKey ? modFireLook(fireKey, now, k) : null;
  if (fire(0)) dim = false;   // it just went off: play it, even if that spent it (FAILSAFE)
  const flash = (anim === 'blink' && t % 2 < 0.12) || (anim === 'spin' && t < 0.4);
  const cell = (cx, ch, inv, chip, dy = 0, k = 0) => {
    const f = fire(k);
    if (f) { inv = f.inv; dy += f.dy; }
    if (dim || muted || !bg) { put(cx, y + dy, ch, dim ? C.mid : chip.bg, own, lvl >= 4); return; }
    bg(cx, y, 1, inv ? chip.fg : chip.bg, 1);
    put(cx, y + dy, ch, inv ? chip.bg : chip.fg, own, lvl >= 4);
  };
  cell(x, icon === ' ' ? '.' : icon, selected || flash, chip0);
  const rainbow = ['exotic', 'epic', 'rare', 'boss'].map(chipOf);
  for (let k = 0; k < label.length; k++) {
    let ch = label[k], dy = 0, inv = selected || flash, chip = chip0;
    if (anim === 'wave' || anim === 'exotic') { const w = t - k * 0.09; if (w > 0 && w < 0.3) dy = -Math.sin(w / 0.3 * Math.PI) * 0.35; }
    if (anim === 'exotic' && !dim) chip = rainbow[Math.floor(now / 160 + k) % rainbow.length];
    if (anim === 'cycle' && !selected && !dim) inv = Math.floor(now / 300 + k) % 4 === 1;
    if (anim === 'scramble' && t < 0.2 && Math.random() < 0.5) ch = noiseCh();
    cell(x + 1 + k, ch, inv, chip, dy, k + 1);
  }
  return 1 + label.length;
}

// Tray layout (fixed rows, nothing moves so hover stays stable):
//   mods row, mod info line, item belt, item info line.
function buildTray(ctx, y) {
  if (st.mp) return mpTray(ctx, y);
  const { now, put, addHit, bg } = ctx;
  const run = st.run;
  const inRun = run && st.mode !== 'title' && st.mode !== 'over';
  if (!inRun) {
    const hint = st.mode === 'over' ? 'R = retry seed   ENTER = new run' : '';
    put(0, y + 1, hint, C.dim);
    return;
  }

  // Mods row. Tap-to-use mods (BURNER) are drawn as buttons: [^BRN] bright when you can
  // use it now, red brackets when it's spent, dim when it's not the place for it.
  // Spent passives (FAILSAFE) go dim.
  if (!run.mods.length) put(0, y, 'no mods yet', C.dim);
  const widths = run.mods.map(k => { const v = modView(k); return 1 + v.short.length + (v.lvlTag && v.tier > 0 ? 1 : 0) + (v.active ? 2 : 0); });
  // RAM DOUBLER: mods 7-12 go on a second row, where the item belt was
  const pockets = !has('ramdoubler'), rowOf = i => pockets || i < MOD_SLOTS ? 0 : 1;
  const gapOf = row => { const ws = widths.filter((w, i) => rowOf(i) === row); return ws.reduce((a, w) => a + w, 0) + 2 * (ws.length - 1) <= L.wc ? 2 : 1; };
  const gaps = [gapOf(0), gapOf(1)], xs = [0, 0];
  run.mods.forEach((key, i) => {
    const row = rowOf(i), gap = gaps[row], ry = y + row * 2;
    let x = xs[row];
    if (x + widths[i] > L.wc) return;          // more than fits (dev / bots): clip
    const m = MODS[key], sel = st.selMod === i, hov = st.hoverMod === i;
    const spent = modSpent(key) || modOffHere(key), usable = !!m.active && modUsable(key);   // (off in this corp: drawn dim like spent)
    let w;
    if (m.active) {
      const bc = spent ? C.danger : usable ? C.accent : C.dim;
      put(x, ry, '[', bc, 'tray', true);
      const bw = drawBadge(put, now, x + 1, ry, key, i, { dim: !usable, tier: modTier(key), bg, selected: sel, fireKey: key === 'mutate' ? run.mutateAs : key });
      put(x + 1 + bw, ry, ']', bc, 'tray', true);
      w = bw + 2;
    } else w = drawBadge(put, now, x, ry, key, i, { dim: spent, tier: modTier(key), bg, selected: sel, fireKey: key === 'mutate' ? run.mutateAs : key });
    if (hov && !sel) bg(x, ry, w, C.accent, 0.12);
    addHit(x, ry, w, 1, { kind: 'mod', i });
    xs[row] = x + w + gap;
  });
  if (!pockets && run.mods.length <= MOD_SLOTS) put(0, y + 2, `ram doubler: ${modSlots() - run.mods.length} of ${modSlots()} slots free`, C.dim);

  // Mod info line, right under the mods
  const mi = st.selMod >= 0 ? st.selMod : st.hoverMod;
  if (mi >= 0 && run.mods[mi]) {
    const key = run.mods[mi], m = modView(key);
    put(0, y + 1, '\\_', C.mid);
    putChip(put, bg, 2, y + 1, m.short, m.rarity, 'tray', true);
    const tip = key === 'mutate' && run.mutateAs && MODS[run.mutateAs] ? `now: ${MODS[run.mutateAs].name.toLowerCase()}.`
      : key === 'honeycomb' ? `honey ${run.honey || 0}/3. ${m.tip}`
      : key === 'leverage' ? (run.credits < 0 ? `debt shield ${Math.round(debtShield() * 100)}%. limit ${creditFloor()}.` : `no debt. limit ${creditFloor()}.`)
      : key === 'zombie' ? `rot ${run.rot || 0}/${ROT.max}. ${tapsToBreak()} taps a node.` : m.tip;
    const offTip = modOffHere(key) ? 'off in this corp.' : null;   // this corp switches it off
    put(6, y + 1, offTip || tip, offTip ? C.dangerDim : C.text);
    const status = modSpent(key) ? ['(spent)', C.danger] : m.active ? (modUsable(key) ? ['>tap', C.accent] : ['(not now)', C.dim]) : null;
    if (status) put(7 + tip.length, y + 1, status[0], status[1]);
  }

  if (has('ramdoubler')) return;   // RAM DOUBLER: no belt (its row holds mods 7-12)
  // Item belt: every slot is always shown, empty ones too (no brackets: not tappable).
  const slots = run.beltSlots;
  const step = Math.min(8, Math.floor((L.wc + 1) / slots));
  for (let i = 0; i < slots; i++) {
    const stack = run.items[i];
    const dn = st.itemDeny && st.itemDeny.slot === i ? now - st.itemDeny.at : 1e9;
    const ix = i * step + (dn < 320 ? 0.35 * Math.sin(dn / 22) * (1 - dn / 320) : 0);   // a tap it can't take: an error shake
    if (!stack) { put(ix, y + 2, ':  .  :', C.dim, 'tray'); continue; }
    const ok = canUse(stack), v = itemView(stack.key, stack.tier);
    const sel = st.selItem === i, hov = st.hoverItem === i;
    const lab = itemLabel(stack), nameLen = stack.n > 1 ? ITEMS[stack.key].name.length : lab.length;
    if (ok) putChip(put, bg, ix, y + 2, lab.slice(0, nameLen), v.rarity, 'tray', v.tier > 0);   // on its rarity chip
    else put(ix, y + 2, lab.slice(0, nameLen), C.mid, 'tray');
    if (stack.n > 1) put(ix + nameLen, y + 2, lab.slice(nameLen), ok ? C.text : C.dim, 'tray');   // x3: the count, dimmer
    if (sel || hov) bg(ix, y + 2, 7, C.accent, sel ? 0.25 : 0.12);
    addHit(ix, y + 2, 7, 1, { kind: 'item', i });
  }

  // Item info line, right under the belt
  const ii = st.selItem >= 0 ? st.selItem : st.hoverItem;
  if (ii >= 0 && run.items[ii]) {
    const stack = run.items[ii], it = itemView(stack.key, stack.tier);
    put(0, y + 3, '\\_', C.mid);
    putChip(put, bg, 2, y + 3, it.name, it.rarity, 'tray', true);
    const dn = st.itemDeny && st.itemDeny.slot === ii ? now - st.itemDeny.at : 1e9;
    if (dn < 1800) put(3 + it.name.length, y + 3, st.itemDeny.text, C.danger);   // why it can't be used (a second or two)
    else {
      put(3 + it.name.length, y + 3, it.tip, C.text);
      const usable = canUse(stack);
      put(4 + it.name.length + it.tip.length, y + 3, usable ? '>tap' : '(not now)', usable ? C.accent : C.dim);
    }
  }
}

function buildBoard({ now, put, addHit, bg, cells }) {
  const lv = st.lv;
  if (lv.litRow != null && bg) for (const t of lv.tiles) if (t.row === lv.litRow && t.state === 'closed') {
    const { tx, ty } = tileOrigin(t);
    for (let k = 0; k < TILE_H; k++) bg(tx, ty + k, TILE_W, C.accent, 0.12);
  }
  const used = new Set();
  const masked = lv.maskAt && now > lv.maskAt;
  const boardDef = st.corp && st.corp.hasBoss ? st.corp.def : null;
  // A node's own clock for its animation: it stops while the node is frozen. FREEZE FRAME
  // freezes all but the real node; STREAMFLIX's buffering freezes all but the live one.
  const fzOn = lv.freeze && now < lv.freeze.until;
  const bufAt = boardDef && boardDef.bufferAt ? boardDef.bufferAt(lv, now) : null;
  const liveTime = t => fzOn && !t.safe ? lv.freeze.from : bufAt != null && !t.tell ? bufAt : now;
  // A lit row: LIFTCO's lift (or EXPRESS), WATCHPOINT's camera. Marker on the left edge.
  const bands = [];
  if (lv.lift) { const row = liftRow(lv, now); if (row != null) bands.push({ row, col: C.accent, ch: '>' }); }
  if (boardDef && boardDef.band) { const b = boardDef.band(lv, now); if (b) bands.push(b); }
  if (bg) for (const b of bands) {
    for (let col = 0; col < lv.cols; col++) {
      const { tx, ty } = tileOrigin({ col, row: b.row });
      for (let k = 0; k < TILE_H; k++) bg(tx, ty + k, TILE_W, b.col, 0.1);
    }
    const { tx, ty } = tileOrigin({ col: 0, row: b.row });
    if (tx >= 1) put(tx - 1, ty + 2, b.ch, b.col, 'fx', true);
  }
  lv.tiles.forEach((t, i) => {
    used.add(t.cell);
    if (t.slide) used.add(Math.round(t.slide.fr) * lv.cols + Math.round(t.slide.fc));   // no dot under a moving node
    const { tx, ty } = tileOrigin(t);
    if (t.wide) used.add(t.cell + 1);
    if (t.state === 'closed') addHit(tx, ty, t.wide ? TILE_W * 2 + GAP_X : TILE_W, TILE_H, { kind: 'tile', i });
    else if (boardDef && boardDef.cellTap) addHit(tx, ty, TILE_W, TILE_H, { kind: 'cell', cell: t.cell });
    if (t.hidden) return;
    if (t.wide) {   // TWINLINK's boss: a node two cells wide (always ICE)
      const ww = TILE_W * 2 + GAP_X, gone = t.state === 'locked', hov = (i === st.hover && !st.busy) || t.probing;
      const fc2 = gone ? C.danger : hov ? C.bright : C.mid, gc2 = gone ? C.danger : hov ? C.bright : C.text, solid2 = gone || hov;
      const e2 = '+' + (solid2 ? '-'.repeat(ww - 2) : '- '.repeat((ww - 2) / 2)) + '+', s2 = solid2 ? '|' : ':';
      put(tx, ty, e2, fc2, 't' + i); put(tx, ty + TILE_H - 1, e2, fc2, 't' + i);
      t.glyph.forEach((l, k) => { put(tx, ty + 1 + k, s2, fc2, 't' + i); put(tx + ww - 1, ty + 1 + k, s2, fc2, 't' + i); put(tx + Math.floor((ww - 5) / 2), ty + 1 + k, l, gc2, 't' + i, gone); });
      return;
    }
    const own = 't' + i;
    // A node you hit stays on the board, bold and red.
    if (t.state === 'locked' && t.lockedBy === 'hit') {
      const fresh = now - t.hitAt < 220;   // brief glitch right after the hit
      // SHATTER: no damage, so it's cracked glass, not a red hit
      if (t.shattered && !t.klog && !t.dir) {
        const rows = ['+-. .-+', '| \\|/ |', '|--*--|', '| /|\\ |', '+-\' \'-+'];
        rows.forEach((r, k) => put(tx, ty + k, r, k === 2 && fresh ? C.bright : C.mid, own, k > 0 && k < 4));
        return;
      }
      // ICE EATER: an eaten node is crumbs (keylogger / tracer marks still show on it)
      if (t.eaten && !t.klog && !t.dir && !t.loaded) {
        const rows = ['+ - . -+', ':. , .:', ' ,.:. ', ':. ` ,:', '+-. - +'];
        rows.forEach((r, k) => put(tx, ty + k, r, fresh ? C.accent : C.dim, own));
        return;
      }
      const glyphCol = t.klog ? C.accent : t.loaded ? C.money : t.shattered || t.eaten ? C.mid : C.danger;   // keylogger lines stand out
      // TRACER: the sides facing the real node turn into arrows (< > sides, ^ v top / bottom).
      // They appear with TRACER's callout after the hit (t.dirAt), blinking a moment.
      const d = t.dir && !(t.dirPending && !t.dirAt) ? t.dir : { h: 0, v: 0 };
      const sl = d.h < 0 ? '<' : '|', sr = d.h > 0 ? '>' : '|';
      // KEYLOGGER: the key line types in with its callout (t.klogAt)
      const typed = t.klog ? (t.klogAt ? Math.floor((now - t.klogAt) / 35) : 0) : 99;
      const glyph = t.glyph.map(l => typed >= l.length ? l : l.slice(0, typed) + ' '.repeat(l.length - typed));
      let rows = [d.v < 0 ? '+^^^^^+' : '+-----+', ...glyph.map(l => sl + l + sr), d.v > 0 ? '+vvvvv+' : '+-----+'];
      if (fresh) rows = rows.map(r => r.replace(/[^ ]/g, ch => Math.random() < 0.6 ? noiseCh() : ch));
      const arrowCol = t.dirAt && now - t.dirAt < 800 && Math.floor((now - t.dirAt) / 120) % 2 ? C.accent : C.bright;
      const edgeCol = ch => !fresh && '<>^v'.includes(ch) ? arrowCol : t.shattered || t.eaten ? C.mid : C.danger;
      rows.forEach((r, k) => {
        const isEdge = k === 0 || k === rows.length - 1;
        put(tx, ty + k, r[0], edgeCol(r[0]), own, true);
        put(tx + 1, ty + k, r.slice(1, TILE_W - 1), isEdge ? edgeCol(r[1]) : glyphCol, own, true);
        put(tx + TILE_W - 1, ty + k, r[TILE_W - 1], edgeCol(r[TILE_W - 1]), own, true);
      });
      return;
    }
    if (t.state === 'locked') {
      // Switched off by an item or mod: the whole tile in dim red, with a label
      // saying what did it (and the mod's code, for mods).
      let [word, code] = LOCK_LABEL[t.lockedBy] || ['INERT', ''];
      if (t.lockedBy === 'demo') { word = lv.boss && now - t.hitAt > 1200 ? '?' : String(t.demoN); code = ''; }   // DEMOLITION
      const mid5 = str => { const l = Math.floor((5 - str.length) / 2); return (' '.repeat(l) + str).padEnd(5); };
      const rows = ['+-----+', '|' + t.glyph[0] + '|', '|' + mid5(word) + '|', '|' + (code ? mid5(code) : t.glyph[2]) + '|', '+-----+'];
      const lc = ['xaxis', 'yaxis', 'virus'].includes(t.lockedBy) ? C.accent : C.dangerDim;   // scans and VIRUS: the mod's color
      rows.forEach((r, k) => {
        put(tx, ty + k, r[0], lc, own);
        put(tx + 1, ty + k, r.slice(1, TILE_W - 1), k === 2 ? C.text : k === 3 && code ? C.mid : lc, own, k === 2);
        put(tx + TILE_W - 1, ty + k, r[TILE_W - 1], lc, own);
      });
      return;
    }
    let solid = false, fc = C.mid, gc = C.text, bold = false;
    if (st.sel === i && t.state === 'closed') {   // drag-to-select: the picked-out node, tap again to confirm
      const { tx: sx, ty: sy } = tileOrigin(t);
      put(sx - 1, sy + 2, '>', C.bright, 'fx', true); put(sx + TILE_W, sy + 2, '<', C.bright, 'fx', true);
    }
    if (t.loaded) { fc = C.dangerDim; gc = C.money; }
    if (t.ruledOut) { fc = C.dim; gc = C.dim; }
    if (t.state === 'safe' || t.state === 'reveal') { solid = true; fc = C.accent; gc = C.accent; }
    else if (t.probing || st.sel === i || (i === st.hover && !st.busy && !(st.press && st.press.moved))) { solid = true; fc = C.bright; if (!t.loaded) gc = C.bright; }
    // X-AXIS / Y-AXIS scan (lv.scan, set in engine/run.js): nodes on the line light up as the
    // scan reaches them. A hit stays lit and the real node glows; a miss is dim and fades.
    const sc = lv.scan;
    if (sc && t.state === 'closed' && t !== sc.from && sc.axes.some(a => a === 'xaxis' ? t.row === sc.from.row : t.col === sc.from.col)) {
      const age = now - sc.t0 - scanDist(t, sc.from) * SCAN_STEP;
      if (sc.real && age >= 0) { solid = true; fc = t === sc.real ? C.bright : C.accent; if (t === sc.real) { gc = C.bright; bold = true; } }
      else if (!sc.real && age >= 0 && age < 450 && !solid) { fc = C.accent; }
    }
    // ICE EATER: a scan found the real node's line (lv.warn): its nodes keep a red frame
    if (lv.warn && t.state === 'closed' && !solid && fc === C.mid && (lv.warn.row === t.row || lv.warn.col === t.col)) fc = C.danger;
    const edge = solid ? '+-----+' : '+- - -+';
    const side = solid ? '|' : ':';
    let glyph = masked && t.state === 'closed' && !t.loaded ? MASK_GLYPH : t.glyph;
    // Node animation (corp fx), plus PIXEL PEEP and FREEZE FRAME's twitch on the real node.
    let dx = 0, dy = 0, kern = null, over = null, corner = null, frame = null, clip = false;
    if (t.say && t.state === 'closed') glyph = normMotif(['', ...t.say]);   // TURING, INTERROGATE
    if (t.brand && t.state === 'closed') corner = { corner: 's', cornerCol: C.money };   // BRANDED
    if (st.corp && st.corp.mod === 'armored' && t.state === 'closed') frame = { frame: ['#=====#', '#=====#'], side: '#' };   // ARMORED
    // CCTV: one ICE flashes ### a second into the layer
    if (lv.cctv && lv.cctv.t === t && t.state === 'closed' && lv.shownAt != null && now - lv.shownAt > lv.cctv.at && now - lv.shownAt < lv.cctv.at + 300) { glyph = ICE_FLASH; gc = C.danger; modFiredOnce('cctv', lv); }
    if (t.state === 'closed' && !masked && !t.loaded) {
      const live = liveTime(t, now);
      const fx = boardDef && boardDef.fx ? boardDef.fx(t, live, lv, i) : null;
      if (fx) {
        dx = fx.dx || 0; dy = fx.dy || 0; kern = fx.kern || null; over = fx.over || null;
        if (fx.glyph) glyph = fx.glyph;
        if (fx.gc && !solid) gc = fx.gc;
        if (fx.fc && !solid) fc = fx.fc;
        if (fx.corner) corner = fx;
        if (fx.frame) frame = fx;
        if (fx.clip) clip = true;
        if (fx.line) glyph = glyph.map((l, k) => k === fx.line[0] ? fx.line[1] : l);
        if (!solid && fx.dim) { fc = C.dim; gc = C.dim; }
        if (!solid && fx.bright) { fc = C.text; gc = C.bright; bold = true; }
      }
      if (lv.prismRow === t.row && !solid) fc = C.accent;   // PRISM
      if (has('infrared') && st.corp && st.corp.hasBoss && !lv.pred && lv.n > 1 && lv.shownAt != null && now - lv.shownAt < 1000 && !solid) {
        const v = t.safe ? 0.85 + 0.15 * h01(i, 3) : 0.78 * h01(i, 7 + lv.n);
        glyph = heatGlyph(v, i * 17, now); gc = heatCol(v); modFiredOnce('infrared', lv);
      }
      if (t.safe) {
        if (lv.peepAt && now - lv.peepAt < 1000) dx += 2 / L.cw;
        if (lv.freeze && now - lv.freeze.from < 200) dx += 0.18 * Math.sin((now - lv.freeze.from) / 16);
      }
    }
    if (kern) glyph = glyph.map((l, k) => k === kern.ln ? l.slice(0, kern.x) + ' ' + l.slice(kern.x + 1) : l);
    // UPSIDE: the real node is drawn the right way up (its cells get turned back)
    const upr = !!(boardDef && boardDef.flip && t.safe && t.state === 'closed' && !masked && cells);
    if (upr) glyph = glyph.slice().reverse().map(l => [...l].reverse().join(''));
    const c0 = cells ? cells.length : 0;
    let rows = frame ? [frame.frame[0], ...glyph.map(l => frame.side + l + frame.side), frame.frame[1]] : [edge, ...glyph.map(l => side + l + side), edge];
    if (corner) rows[0] = rows[0].slice(0, TILE_W - 1) + ' ';
    if (t.probing) rows = rows.map(r => r.replace(/[^ ]/g, ch => Math.random() < 0.5 ? noiseCh() : ch));
    if (t.infectAt) {   // VIRUS spreading into it: it glitches, more and more, in the mod's color
      const f = Math.min(1, (now - t.infectAt) / 420);
      rows = rows.map(r => r.replace(/[^ ]/g, ch => Math.random() < 0.25 + 0.6 * f ? noiseCh() : ch));
      fc = C.accent; gc = C.accent;
    }
    // ZOMBIE: a cracked node (weak taps). Cracks spread over it as the count climbs, the bottom
    // edge counts taps (3/11), and it jolts on each tap. Looks the same for ICE and the real node.
    if (t.cracks && t.state === 'closed' && zombie()) {
      const need = tapsToBreak(), f = Math.min(1, t.cracks / need), CR = '/\\.`,';
      rows = rows.map((r, k) => k === 0 || k === rows.length - 1 ? r : [...r].map((ch, x) =>
        x > 0 && x < TILE_W - 1 && h01(i * 31 + k * 7 + x, 5) < f * 0.6 ? CR[(x + k + i) % CR.length] : ch).join(''));
      const cnt = `${t.cracks}/${need}`;
      if (cnt.length <= TILE_W - 2) { const l = Math.floor((TILE_W - 2 - cnt.length) / 2); rows[rows.length - 1] = '+' + '-'.repeat(l) + cnt + '-'.repeat(TILE_W - 2 - l - cnt.length) + '+'; }
      if (now - (t.crackAt || 0) < 120) dx += 0.15 * Math.sin((now - t.crackAt) / 12);
      fc = C.mid;
    }
    const ox = tx + dx, oy = ty + dy;
    rows.forEach((r, k) => {
      if (clip && oy + k < BOARD_Y - 0.5) return;   // DROP-4: chips falling in from above the board
      const isEdge = k === 0 || k === rows.length - 1;
      put(ox, oy + k, r[0], fc, own);
      put(ox + 1, oy + k, r.slice(1, TILE_W - 1), isEdge ? fc : gc, own, bold && !isEdge);
      put(ox + TILE_W - 1, oy + k, r[TILE_W - 1], fc, own);
    });
    if (upr) for (let k = c0; k < cells.length; k++) cells[k].r180 = true;
    if (kern) put(ox + 1 + kern.x + kern.px / L.cw, oy + 1 + kern.ln + kern.py / L.chh, t.glyph[kern.ln][kern.x], gc, own, bold);
    if (over) for (const o of over) put(ox + o.dx, oy + o.dy, o.ch, o.col || gc, 'fx');
    if (corner) put(ox + TILE_W - 1, oy, corner.corner, corner.cornerCol || gc, own, true);
    if (st.debug && t.safe && t.state === 'closed') put(tx + TILE_W - 1, ty, '*', C.accent, own);
    if (st.kbGrid && i === st.hover && !st.busy && Math.floor(now / 280) % 2) {
      for (const [cx, cy] of [[tx, ty], [tx + TILE_W - 1, ty], [tx, ty + TILE_H - 1], [tx + TILE_W - 1, ty + TILE_H - 1]]) put(cx, cy, '#', C.accent, own, true);
    }
  });
  for (let cell = 0; cell < lv.cols * lv.rows; cell++) {
    if (used.has(cell)) continue;
    const { tx, ty } = tileOrigin({ col: cell % lv.cols, row: Math.floor(cell / lv.cols) });
    if (boardDef && boardDef.cellTap) addHit(tx, ty, TILE_W, TILE_H, { kind: 'cell', cell });
    const lab = boardDef && boardDef.cellLabel ? boardDef.cellLabel(lv, cell) : null;
    if (lab) put(tx + 3 - Math.floor(lab.length / 2), ty + 2, lab, C.accent, 'dot', true);
    else {
      // X-AXIS / Y-AXIS: the scan lights the empty cells on its line too (- for a row, | for a column)
      const sc = lv.scan, c = { col: cell % lv.cols, row: Math.floor(cell / lv.cols) };
      const ax = sc && sc.axes.find(a => a === 'xaxis' ? c.row === sc.from.row : c.col === sc.from.col);
      const age = ax ? now - sc.t0 - scanDist(c, sc.from) * SCAN_STEP : -1;
      const wr = lv.warn && (lv.warn.row === c.row ? '-' : lv.warn.col === c.col ? '|' : null);   // ICE EATER: a warning line
      if (ax && age >= 0 && (sc.real || age < 450)) put(tx + 3, ty + 2, ax === 'xaxis' ? '-' : '|', C.accent, 'dot', !!sc.real);
      else if (wr) put(tx + 3, ty + 2, wr, C.danger, 'dot');
      else put(tx + 3, ty + 2, '.', C.dim, 'dot');
    }
  }
  // corp marks beside a cell (LAGRANGE's early echo and your sent tap)
  if (boardDef && boardDef.marks) for (const m of boardDef.marks(lv, now) || []) {
    const { tx, ty } = tileOrigin({ col: m.cell % lv.cols, row: Math.floor(m.cell / lv.cols) });
    put(tx - 1, ty + 2, m.l || '>', m.col, 'fx', true); put(tx + TILE_W, ty + 2, m.r || '<', m.col, 'fx', true);
  }
  if (boardDef && boardDef.draw) boardDef.draw(put, lv, now);
  if (lv.rv && lv.rv.aim && lv.rv.aim.t.state === 'closed' && Math.floor(now / 120) % 2) {   // RIVAL: where it's about to pick
    const { tx, ty } = tileOrigin(lv.rv.aim.t);
    put(tx - 1, ty + 2, '>', C.danger, 'fx', true); put(tx + TILE_W, ty + 2, '<', C.danger, 'fx', true);
  }
  // AFTERIMAGE: cyan corners where the last layer's real node was.
  if (has('afterimage') && lv.after && lv.after.col < lv.cols && lv.after.row < lv.rows) {
    if (lv.shownAt != null) modFiredOnce('afterimage', lv);
    const { tx, ty } = tileOrigin(lv.after);
    const t = lv.tiles.find(o => o.col === lv.after.col && o.row === lv.after.row);
    if (t && t.state === 'closed' && !t.hidden) {
      put(tx, ty, '+', C.accent, 'fx', true);
      put(tx + TILE_W - 1, ty + TILE_H - 1, '+', C.accent, 'fx', true);
    } else if (!t) put(tx + 3, ty + 2, 'o', C.accent, 'fx');
  }
  drawCoin(put, bg, now, lv, cells);
  drawCoinPop(put, bg, now, cells);
}

// Overlays (the coin box, the multiplier pop): drop whatever was drawn under a rectangle,
// since characters always draw over backgrounds.
const clearRect = (cells, x0, y0, w, h) => { for (let k = cells.length - 1; k >= 0; k--) { const c = cells[k]; if (c.cx >= x0 - 0.5 && c.cx < x0 + w - 0.5 && c.cy >= y0 - 0.5 && c.cy < y0 + h - 0.5) cells.splice(k, 1); } };
// COIN FLIP: the coin box over a held node. Two node-sized faces side by side (a coin spinning
// between them), above the node (below it on the top row), drawn over the board.
function drawCoin(put, bg, now, lv, cells) {
  const cn = st.coin, t = cn && lv.tiles[cn.i];
  if (!t) return;
  const { tx, ty } = tileOrigin(t);
  const w = TILE_W * 2 + 3, x0 = clamp(tx + Math.floor(TILE_W / 2) - Math.floor(w / 2), 0, L.wc - w);
  const y0 = cn.below ? ty + TILE_H : ty - TILE_H;
  clearRect(cells, x0, y0, w, TILE_H);   // drawn over whatever is under it
  for (let r = 0; r < TILE_H; r++) bg(x0, y0 + r, w, C.bg, 1);
  const spinning = cn.flipAt && cn.landed == null;
  const lit = spinning ? Math.floor(now / 90) % 2 : cn.landed != null ? cn.landed : cn.side;
  cn.faces.forEach((f, k) => {
    const x = x0 + k * (TILE_W + 3), on = lit === k, chosen = cn.side === k;
    const sym = f.kind === 'hp' ? '♥' : '$';
    const amt = String(cn.vals ? cn.vals[k] : coinValue(f));
    const mid = s => { const l = Math.floor((TILE_W - 2 - s.length) / 2); return (' '.repeat(l) + s).padEnd(TILE_W - 2); };
    const res = cn.landed != null && chosen ? (cn.landed === k ? 'WIN' : 'LOSE') : f.big ? 'BIG' : '';
    const rows = [on ? '+-----+' : '+- - -+', '|' + mid(sym) + '|', '|' + mid(amt) + '|', '|' + mid(res) + '|', on ? '+-----+' : '+- - -+'];
    const col = f.kind === 'hp' ? C.danger : C.money;
    const fc = on ? C.bright : chosen ? col : C.mid;
    if (on && !spinning) bg(x, y0, TILE_W, col, 0.25);
    rows.forEach((r, i) => put(x, y0 + i, r, fc, 'fx', on));
    put(x + 1, y0 + 1, mid(sym), col, 'fx', true);
    if (res) put(x + 1, y0 + 3, mid(res), res === 'LOSE' ? C.danger : res === 'WIN' ? C.accent : C.money, 'fx', true);
  });
  // the coin between the faces: spins while it's up, fast while flipping
  const spin = '|/-\\'[Math.floor(now / (spinning ? 60 : 160)) % 4];
  put(x0 + TILE_W + 1, y0 + 2, cn.landed != null ? 'o' : spin, C.money, 'fx', true);
  if (!cn.flipAt) put(x0 + TILE_W, y0 + (cn.below ? 4 : 0), '< >', C.dim, 'fx');   // drag to a side
}
// COIN FLIP: the multiplier went up: a boxed xN drops onto the board, bounces, then fades.
function drawCoinPop(put, bg, now, cells) {
  const p = st.coinPop;
  if (!p) return;
  const age = now - p.at;
  if (age > 1300) { st.coinPop = null; return; }
  const txt = ` x ${p.m} `, w = txt.length + 2, x0 = Math.floor((L.wc - w) / 2);
  const land = p.y, fall = Math.min(1, age / 320);
  const bounce = age < 320 ? 0 : Math.max(0, Math.sin((age - 320) / 90) * 0.6 * Math.exp(-(age - 320) / 160));
  const y = land - 5 * (1 - fall) * (1 - fall) - bounce;
  const cols = [C.money, C.accent, C.bright, C.exotic || C.money];
  const col = cols[Math.floor(now / 90) % cols.length];
  clearRect(cells, x0, Math.round(y), w, 3);
  for (let r = 0; r < 3; r++) bg(x0, Math.round(y) + r, w, C.bg, 1);
  put(x0, y, '+' + '='.repeat(w - 2) + '+', col, 'fx', true);
  put(x0, y + 1, '|' + txt + '|', col, 'fx', true);
  put(x0, y + 2, '+' + '='.repeat(w - 2) + '+', col, 'fx', true);
}

// Big boxed primary button. 3 rows, or 4 with a subtitle.
function drawBox(ctx, y, ln) {
  const { now, put, addHit } = ctx;
  const label = ln.text, sub = ln.sub || '';
  const w = Math.max(ln.minW || 20, Math.max(label.length, sub.length) + 8);
  const x = Math.floor((L.wc - w) / 2);
  const h = sub ? 4 : 3;
  const pulse = (Math.sin(now / 420) + 1) / 2;
  const fcol = ln.disabled ? C.dim : C.accent;
  const lcol = ln.disabled ? C.dim : pulse > 0.85 ? C.bright : C.accent;   // a slow, gentle pulse
  if (!ln.disabled && ctx.hl) ctx.hl(x, y, w, h, ln.id);
  let edge = '+' + '='.repeat(w - 2) + '+';
  // Occasional glitch on the frame.
  if (!ln.disabled && ((now / 1000 + y * 0.37) % 3.2) < 0.07) {
    const i = 1 + Math.floor(Math.random() * (w - 2));
    edge = edge.slice(0, i) + noiseCh() + edge.slice(i + 1);
  }
  put(x, y, edge, fcol, 'ui', true);
  for (let r = 1; r < h - 1; r++) { put(x, y + r, '|', fcol, 'ui', true); put(x + w - 1, y + r, '|', fcol, 'ui', true); }
  put(x + Math.floor((w - label.length) / 2), y + 1, label, lcol, 'ui', true);
  if (sub) put(x + Math.floor((w - sub.length) / 2), y + 2, sub, C.mid, 'ui');
  put(x, y + h - 1, '+' + '='.repeat(w - 2) + '+', fcol, 'ui', true);
  if (!ln.disabled) addHit(x, y, w, h, { kind: 'btn', id: ln.id, onTap: ln.onTap });
  return h;
}

// Map: final node at the top, start at the bottom. Edges are dotted lines.
// x for a node; start / final nodes sit in the middle lane.
const mapX = n => {
  const mid = Math.floor(L.wc / 2);
  return n.type === 'start' || n.type === 'final' ? mid : mid + (n.lane - 1) * 11;
};

// Rows of the whole map (top = the newest OMNI), and a node's row in it.
const mapRows = (map = st.run.map) => mapTop(map) * 3 + 1;
const mapRowOf = (n, map = st.run.map) => (mapTop(map) - n.step) * 3;
const SECTOR_ROWS = SECTOR_STEPS * 3 + 1; // one sector on screen: 16 rows

// Dotted link between two nodes. Sideways links (same row) run between the brackets.
function linkDots(a, b, f) {
  if (a.row === b.row) {
    const lo = Math.min(a.x, b.x) + 2, hi = Math.max(a.x, b.x) - 2, out = [];
    for (let x = lo + 1; x < hi; x += 2) out.push({ x, row: a.row, ch: '-' });
    return out;
  }
  const out = [];
  for (let k = 1; k < 6; k++) { const t = k / 6; out.push({ x: a.x + (b.x - a.x) * t, row: a.row + (b.row - a.row) * t }); }
  return out;
}

// Corp node colors on the map: the corp's own palette behind its code. If that
// background is too close to the map's, use the corp's dim color instead so it reads.
const hexLum = h => { const v = parseInt(String(h).slice(1), 16); return ((v >> 16) * 0.299 + ((v >> 8) & 255) * 0.587 + (v & 255) * 0.114) / 255; };
function corpIconCols(n) {
  if (n.type !== 'corp' && n.type !== 'final') return null;
  const p = PALETTES['c_' + n.corp];
  if (!p) return null;
  const bgc = Math.abs(hexLum(p.bg) - hexLum(C.bg)) < 0.08 ? p.dim : p.bg;
  return { bg: bgc, fg: p.accent };
}

// The run's map on the results screen: the path you took lit, the rest dim, an X
// where you were traced. Shows rows top..top+h of the map, at screen row y.
function drawMapView(ctx, y, ln) {
  const { put } = ctx;
  // A line can be one row (k) of a view viewH tall, so the view can come in row by row.
  const r = ln.r, map = r.map, top = ln.top, k0 = ln.k || 0, h = ln.k != null ? ln.viewH : ln.h;
  y -= k0;   // y is now where the view's first row is
  const pos = n => ({ x: mapX(n), row: mapRowOf(n, map) });
  const lo = ln.k != null ? Math.max(top - 0.01, top + k0 - 0.5) : top - 0.01;
  const hi = ln.k != null ? Math.min(top + h - 0.99, top + k0 + 0.49) : top + h - 0.99;
  const inView = row => row >= lo && row <= hi;
  const onPath = (a, b) => { const i = r.visited.indexOf(a); return i >= 0 && r.visited[i + 1] === b; };
  for (const n of Object.values(map)) {
    for (const id of n.next) {
      const m = map[id], path = onPath(n.id, m.id) || onPath(m.id, n.id);
      for (const d of linkDots(pos(n), pos(m))) if (inView(d.row)) put(d.x, y + d.row - top, d.ch || '·', path ? C.accent : C.dim, 'board');
    }
  }
  for (const n of Object.values(map)) {
    const p = pos(n);
    if (!inView(p.row)) continue;
    const visited = r.visited.includes(n.id), dead = !r.win && n.id === r.at;
    const col = dead ? C.danger : visited ? C.accent : n.type === 'final' ? C.dangerDim : C.dim;
    put(p.x - 1, y + p.row - top, nodeLabel(n), col, 'board', dead || visited);
    if (dead) put(p.x - 3, y + p.row - top, 'X', C.danger, 'board', true);
    if (r.win && n.id === r.at) put(p.x - 3, y + p.row - top, '@', C.bright, 'board', true);
  }
  // more above / below: arrows in both margins (clear of the nodes)
  const blink = Math.floor(performance.now() / 600) % 2 ? C.mid : C.dim;
  const first = ln.k == null || ln.k === 0, last = ln.k == null || ln.k === h - 1;
  if (top > 0 && first) { put(0, y, '^', blink, 'board'); put(L.wc - 1, y, '^', blink, 'board'); }
  if (top + h < mapRows(map) && last) { put(0, y + h - 1, 'v', blink, 'board'); put(L.wc - 1, y + h - 1, 'v', blink, 'board'); }
}

function buildMap(ctx) {
  const { now, put, addHit, putC } = ctx;
  const run = st.run, map = run.map;
  const avail = new Set(availableNodes());
  const nodes = Object.values(map);
  const mv = st.mapView || { row: sectorViewRow(run.sector), sector: run.sector };
  stepMapView(now);
  // Screen y for a map row, and whether it's inside the map area.
  const yOf = row => BOARD_Y + row - mv.row;
  const shown = row => row - mv.row >= -0.01 && row - mv.row <= SECTOR_ROWS - 0.99;
  const pos = n => ({ x: mapX(n), row: mapRowOf(n) });
  const settled = mv.row === mv.target;

  for (const n of nodes) {
    for (const id of n.next) {
      const m = map[id];
      const vi = run.visited.indexOf(n.id), mi = run.visited.indexOf(m.id);
      const onPath = (vi >= 0 && run.visited[vi + 1] === m.id) || (mi >= 0 && run.visited[mi + 1] === n.id);
      const live = run.at === n.id && avail.has(m.id);
      const col = onPath ? C.accent : live ? C.mid : C.dim;
      for (const d of linkDots(pos(n), pos(m))) if (shown(d.row)) put(d.x, yOf(d.row), d.ch || '·', col, 'map');
    }
  }
  for (const n of nodes) {
    const p = pos(n);
    if (!shown(p.row)) continue;
    const y = yOf(p.row);
    const visited = run.visited.includes(n.id), available = avail.has(n.id);
    const sel = st.mapSel === n.id, hov = st.hoverNode === n.id;
    let col = visited ? C.accent : C.dim;
    if (available) col = sel ? C.accent : (Math.floor(now / 500) % 2 ? C.bright : C.text);
    // corps in their own colors (not once you've been there)
    const cc = !visited ? corpIconCols(n) : null;
    const label = nodeLabel(n);
    if (cc && label[0] !== '[') {
      ctx.bg(p.x - 1, y, 3, cc.bg, available ? 1 : 0.55);
      // Nodes you can go to: a glint sweeps across the code now and then (that cell's colors
      // swap), each node at its own time. Selected: the code is drawn inverted.
      const g = available ? Math.floor(((now + p.x * 397 + p.row * 211) % 2400) / 90) : -1;
      for (let i = 0; i < 3; i++) {
        const inv = available && (sel || g === i);
        if (inv) ctx.bg(p.x - 1 + i, y, 1, cc.fg, 1);
        put(p.x - 1 + i, y, label[i], inv ? cc.bg : available ? cc.fg : col, 'map', available);
      }
    }
    else if (cc) { ctx.bg(p.x - 1, y, 3, cc.bg, available ? 1 : 0.55); put(p.x - 1, y, '[', col, 'map'); put(p.x, y, label[1], available ? cc.fg : col, 'map', available); put(p.x + 1, y, ']', col, 'map'); }
    else put(p.x - 1, y, label, col, 'map');
    if (hov) ctx.bg(p.x - 1, y, 3, C.accent, 0.25);
    if (n.mod && CORP_MODS[n.mod] && !visited) put(p.x + 2, y, CORP_MODS[n.mod].tag, C.money, 'map', true);   // corp modifier
    if (sel) { put(p.x - 3, y, '>', C.accent, 'map'); put(p.x + 3, y, '<', C.accent, 'map'); }
    else if (run.at === n.id) put(p.x - 3, y, '@', C.bright, 'map');
    if (available && settled) addHit(p.x - 1, y, 3, 1, { kind: 'node', id: n.id });
  }
  // Which sector you're looking at, and arrows when there's more map below.
  if (run.sector > 0) {
    const v = mv.sector, blink = Math.floor(now / 600) % 2 ? C.mid : C.dim;
    put(0, BOARD_Y, `SECTOR ${v + 1}`, v === run.sector ? C.mid : C.accent, 'map');
    if (v > 0) { put(0, BOARD_Y + SECTOR_ROWS - 1, 'v', blink, 'map'); put(L.wc - 1, BOARD_Y + SECTOR_ROWS - 1, 'v', blink, 'map'); }
    if (v < run.sector) { put(L.wc - 1, BOARD_Y, '^', blink, 'map'); }
  }

  // Info panel under the map
  const y0 = BOARD_Y + SECTOR_ROWS;
  const id = st.mapSel || (avail.has(st.hoverNode) ? st.hoverNode : null);
  if (!id) {
    if (mv.sector !== run.sector) {
      putC(y0 + 1, `sector ${mv.sector + 1}: cleared.`, C.text, 'map');
      putC(y0 + 3, 'scroll up to get back.', C.dim, 'map');
      return;
    }
    putC(y0 + 1, 'choose a target.', C.text, 'map');
    putC(y0 + 3, 'AB3 = corp, level 3   ! = final', C.dim, 'map');
    putC(y0 + 4, '$ = market  ? = cache  + = repair', C.dim, 'map');
    if (run.sector > 0) putC(y0 + 5, 'scroll for older sectors.', C.dim, 'map');
    return;
  }
  const info = nodeInfo(map[id]);
  info.lines.forEach((ln, k) => putC(y0 + k, ln.text, ln.col, 'map'));
  if (st.mapSel) drawBox(ctx, y0 + info.lines.length, { text: info.action, id: 'enter', onTap: () => enterNode(map[st.mapSel]), minW: 18 });
}

function nodeInfo(n) {
  const lines = [];
  const T = (text, col = C.text) => lines.push({ text, col });
  if (n.type === 'corp' || n.type === 'final' || n.type === 'start') {
    const d = corpDef(n.corp);
    if (n.type === 'final' && n.corp !== 'omni') T('SECTOR BOSS', C.danger);
    T(n.tier ? `${d.name} // TIER ${n.tier}${d.level ? ' LV' + d.level : ''}` : d.name, n.type === 'final' ? C.danger : C.accent);
    T(d.intel, C.text);
    const rules = corpRules(d, n.tier);
    if (rules) T(rules, C.mid);
    if (d.bossDesc) T(d.bossDesc, C.dangerDim);
    if (n.mod && CORP_MODS[n.mod]) T(`+ ${CORP_MODS[n.mod].name}: ${CORP_MODS[n.mod].desc}`, C.money);
    { const off = modsOffIn(d); if (off.length) T(`off here: ${off.map(k => MODS[k].name.toLowerCase()).join(', ')}.`, C.dangerDim); }   // e.g. COIN FLIP in a drag corp
    return { lines, action: 'B R E A C H' };
  }
  if (n.type === 'shop') { T('BLACK MARKET', C.money); T('items and mods for credits.'); }
  if (n.type === 'cache') { T('DATA CACHE', C.money); T('loot, then pick a mod.'); }
  if (n.type === 'repair') { T('SAFEHOUSE', C.accent); T(`heal ${CONFIG.repairAmount}, then pick a mod.`); }
  return { lines, action: 'E N T E R' };
}

// Centered text screens: title, panels, help, codex, settings, game over.
// Line types:
//   text {text,col}           button {text,id,onTap,disabled,sel,faded}
//   box {box,text,sub,id}     row of small buttons {row:[...]}
//   badge {badge}             list row {list,id,onTap,sel,name,right,badge,col,tint}
//   gap {gap:n} (empty rows)
// Any line can have `reveal` (index) and `rarity` to pop in one at a time.
// area: where to center the lines (default: the board area).
// ---- Text fields. The canvas can't take typing, so a real (invisible) input sits
// exactly over the field. Tapping it is a real tap on an input, so phones open
// their keyboard as usual. What you type is drawn by the game.
//   { field: 'seed', width, value: () => str, clean: str => str, onCommit: (str, enter) => {} }
// (enter: true when the field was left with the Enter key)
const Field = (() => {
  let el = null, spec = null, cancel = false, entered = false;
  const editing = id => !!(el && spec && spec.field === id && document.activeElement === el);
  function make() {
    if (el || !document.createElement) return;
    el = document.createElement('input');
    el.type = 'text';
    for (const [k, v] of Object.entries({ autocomplete: 'off', autocorrect: 'off', autocapitalize: 'characters', spellcheck: 'false', enterkeyhint: 'done', 'aria-label': 'text field' })) el.setAttribute(k, v);
    // font-size 16px stops iOS zooming in on focus
    el.style.cssText = 'position:fixed;display:none;opacity:0;border:0;padding:0;margin:0;outline:none;font-size:16px;background:transparent;color:transparent;caret-color:transparent;cursor:text;z-index:2;';
    document.body.appendChild(el);
    el.addEventListener('focus', () => { if (!spec) return; el.value = spec.value(); cancel = false; entered = false; Sound.init(); Sound.tick(); });
    el.addEventListener('input', () => { if (spec) el.value = spec.clean(el.value); });
    el.addEventListener('keydown', e => {
      e.stopPropagation();   // typing doesn't reach the game's keys
      if (e.key === 'Enter') { e.preventDefault(); entered = true; el.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); cancel = true; el.blur(); }
    });
    el.addEventListener('blur', () => { if (spec && !cancel) spec.onCommit(el.value, entered); cancel = false; entered = false; });
  }
  // Called every frame: keep the input over the field shown this frame (or hide it).
  function sync() {
    make();
    if (!el) return;
    const r = st.fieldRect;
    if (r && !st.wipe && !st.dev && !st.pause) {
      spec = r.spec;
      Object.assign(el.style, { display: 'block', left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
    } else {
      if (document.activeElement === el) { cancel = true; el.blur(); }
      el.style.display = 'none';
    }
  }
  const focus = () => { if (el && el.style.display !== 'none') el.focus(); };
  const text = () => el ? el.value : '';
  const blur = () => { if (el && document.activeElement === el) el.blur(); };   // commits
  return { sync, focus, blur, editing, text };
})();

function drawField(ctx, x, y, b) {
  const { now, put, bg, addHit, collectHits } = ctx;
  const editing = Field.editing(b.field), id = 'f_' + b.field;
  let val = editing ? Field.text() : b.value();
  const room = editing ? b.width - 1 : b.width;   // leave a spot for the cursor
  if (val.length > room) val = val.slice(-room);
  put(x, y, '[', editing ? C.accent : C.mid, 'ui');
  put(x + b.width + 3, y, ']', editing ? C.accent : C.mid, 'ui');
  put(x + 2, y, val, editing ? C.accent : C.bright, 'ui', true);
  if (editing) {
    bg(x, y, b.width + 4, C.accent, 0.18);
    if (Math.floor(now / 500) % 2 === 0) put(x + 2 + val.length, y, '_', C.accent, 'ui', true);
  } else {
    put(x + 2 + val.length, y, '.'.repeat(Math.max(0, b.width - val.length)), C.dim, 'ui');   // empty spots
    ctx.hl(x, y, b.width + 4, 1, id);
  }
  if (collectHits) {
    st.fieldRect = { spec: b, x: L.ox + x * L.cw, y: L.oy + y * L.chh, w: (b.width + 4) * L.cw, h: L.chh };
    addHit(x, y, b.width + 4, 1, { kind: 'btn', id, onTap: Field.focus });   // keyboard: enter to edit
  }
}

function buildTextBoard(ctx, lines, area = null) {
  const { now, put, putC, addHit, bg, cells, collectHits } = ctx;
  const hl = ctx.hl || (() => {});
  const heightOf = ln => ln.box ? (ln.sub ? 4 : 3) : ln.tileInfo ? TILE_H : ln.mapView ? ln.h : 1;
  const total = lines.reduce((s, ln) => s + heightOf(ln), 0);
  const top = area ? area.top : BOARD_Y, areaH = area ? area.h : L.gh;
  let y = top + Math.max(0, Math.floor((areaH - total) / 2));
  // Buttons keep their colors; hover/cursor shows as a background (see hl).
  const btnCol = b => b.disabled ? C.dim : b.sel ? C.accent : b.faded ? C.mid : C.bright;

  for (const ln of lines) {
    const h = heightOf(ln);
    // Escalating reveal: hidden until its turn, then pops with fx scaled by rarity.
    if (ln.reveal != null) {
      const at = st.panelT0 + ln.reveal * CONFIG.revealGap;
      if (now < at) { y += h; continue; }
      const rid = ln.revealId || ('r' + ln.reveal);
      if (collectHits && !st.revealed.has(rid)) { st.revealed.add(rid); popFx(ln, y); }
    }
    const startIdx = cells.length;

    if (ln.box) drawBox(ctx, y, ln);
    else if (ln.tileInfo) {
      // A tile drawn like on the board, with text lines beside it.
      for (let k = 0; k < TILE_H; k++) drawTileRow(put, y + k, ln, k);
    }
    else if (ln.tileRow != null) drawTileRow(put, y, ln.tile, ln.tileRow);   // one row of a tile (for scrolling)
    else if (ln.mapView) drawMapView(ctx, y, ln);
    else if (ln.trayDemo) {
      // One row of a sample tray, drawn like the real one.
      const x0 = Math.floor((L.wc - HELP_W) / 2);
      if (ln.trayDemo === 'rule') put(x0, y, rule(HELP_W), C.dim, 'board');
      if (ln.trayDemo === 'mods') {
        let x = x0;
        ['tracer', 'skimmer', 'burner', 'stash'].forEach((key, i) => { x += drawBadge(put, now, x, y, key, i, { own: 'board', noCharges: true, dim: key === 'burner', bg }) + 2; });
      }
      if (ln.trayDemo === 'modinfo') {
        put(x0, y, '\\_', C.mid, 'board');
        putChip(put, bg, x0 + 2, y, 'TRC', MODS.tracer.rarity, 'board', true);
        put(x0 + 6, y, MODS.tracer.tip, C.text, 'board');
      }
      if (ln.trayDemo === 'items') {
        putChip(put, bg, x0, y, '[PURGE]', ITEMS.purge.rarity, 'board'); putChip(put, bg, x0 + 8, y, '[PATCH]', ITEMS.patch.rarity, 'board');
        put(x0 + 16, y, ':  .  :', C.dim, 'board'); put(x0 + 24, y, ':  .  :', C.dim, 'board');
      }
      if (ln.trayDemo === 'iteminfo') {
        put(x0, y, '\\_', C.mid, 'board');
        putChip(put, bg, x0 + 2, y, 'PURGE', ITEMS.purge.rarity, 'board', true);
        put(x0 + 8, y, ITEMS.purge.tip, C.text, 'board');
        put(x0 + 9 + ITEMS.purge.tip.length, y, '>tap', C.accent, 'board');
      }
    }
    else if (ln.badge && !ln.list) {
      const m = tierView(MODS[ln.badge], ln.badgeTier || 0);
      const bw = 1 + m.short.length + (m.lvlTag && m.tier > 0 ? 1 : 0);
      const x = Math.floor((L.wc - (bw + 2 + m.name.length)) / 2);
      drawBadge(put, now, x, y, ln.badge, 0, { own: 'board', tier: m.tier, bg });
      put(x + bw + 2, y, m.name, C.bright, 'board', true);
    } else if (ln.list) {
      const LW = 32, x = Math.floor((L.wc - LW) / 2);
      const hov = st.hoverBtn === ln.id;
      if (ln.tint) bg(x, y, LW, ln.tint, ln.sel ? 0.3 : 0.1);
      if (hov) bg(x, y, LW, C.accent, 0.2);
      // The selection cursor sits outside the row, clear of its background color.
      if (ln.sel) put(x - 2, y, '>', C.accent, 'ui', true);
      let cx = x + 1;
      if (ln.badge) cx += drawBadge(put, now, cx, y, ln.badge, 1, { own: 'board', tier: ln.badgeTier, bg }) + 1;
      // faded (can't afford, sold, locked): the color bit stays (a mod's badge, an item's name chip),
      // everything else goes grey, so you see what you're missing
      if (ln.chip) putChip(put, bg, cx, y, ln.name, ln.chip, 'ui', !!ln.sel);
      else put(cx, y, ln.name, ln.faded ? C.mid : (ln.col || C.bright), 'ui', !!ln.sel);
      if (ln.right) {
        const rx = x + LW - ln.right.length;
        put(rx, y, ln.right, ln.faded ? C.dim : (ln.rightCol || C.mid), 'ui');
        if (ln.rightChips && !ln.faded) for (const c of rarityChips(ln.right)) putChip(put, bg, rx + c.from, y, ln.right.substr(c.from, c.len), c.r, 'ui');
      }
      if (!ln.disabled) addHit(x, y, LW, 1, { kind: 'btn', id: ln.id, onTap: ln.onTap });
    } else if (ln.row) {
      const gap = ln.gap != null ? ln.gap : 2;
      const itemW = b => b.field ? b.width + 4 : b.badge ? (b.plain ? 4 + (b.tier && MODS[b.badge].lvlTag ? 1 : 0) : 6) : b.text.length;
      const w = ln.row.reduce((s, b) => s + itemW(b), 0) + (ln.row.length - 1) * gap;
      let x = Math.floor((L.wc - w) / 2);
      ln.row.forEach((b, bi) => {
        if (b.field) { drawField(ctx, x, y, b); x += itemW(b) + gap; return; }
        if (b.badge && b.plain) { x += drawBadge(put, now, x, y, b.badge, bi, { own: 'board', tier: b.tier, bg }) + gap; return; }
        if (b.badge) {
          // A mod as it looks in the tray. On = tinted in its rarity color with bright brackets.
          if (!b.disabled) hl(x, y, 6, 1, b.id, bi === 0 || gap >= 3);
          put(x, y, '[', b.on ? C.bright : C.dim, 'ui', !!b.on); put(x + 5, y, ']', b.on ? C.bright : C.dim, 'ui', !!b.on);
          drawBadge(put, now, x + 1, y, b.badge, bi, { own: 'ui', noCharges: true, bg, dim: !b.on && !!b.offDim });
          if (!b.disabled) addHit(x, y, 6, 1, { kind: 'btn', id: b.id, onTap: b.onTap });
          x += 6 + gap; return;
        }
        if (!b.id) { if (b.chip) putChip(put, bg, x, y, b.text, b.chip, 'board'); else put(x, y, b.text, b.col || C.dim, 'board'); x += b.text.length + gap; return; }   // plain text
        if (b.sel) bg(x, y, b.text.length, C.accent, 0.22);
        // The > marker only where there's room for it: the first item, or wide gaps.
        if (!b.disabled) hl(x, y, b.text.length, 1, b.id, bi === 0 || gap >= 3);
        put(x, y, b.text, btnCol(b), 'ui', !!b.sel);
        if (!b.disabled) addHit(x, y, b.text.length, 1, { kind: 'btn', id: b.id, onTap: b.onTap });
        x += b.text.length + gap;
      });
    } else if (ln.id && ln.invert) {
      // Inverted bar (the "more" rows): text color as the background, background color as the text.
      const x = Math.floor((L.wc - ln.text.length) / 2), hov = st.hoverBtn === ln.id;
      bg(x, y, ln.text.length, hov ? C.accent : C.text, 1);
      put(x, y, ln.text, C.bg, 'ui', true);
      if (hov && st.kbFocus === ln.id && x >= 2) put(x - 2, y, '>', C.accent, 'ui', true);
      addHit(x, y, ln.text.length, 1, { kind: 'btn', id: ln.id, onTap: ln.onTap });
    } else if (ln.id) {
      const x = Math.floor((L.wc - ln.text.length) / 2);
      if (ln.style) bg(x, y, ln.text.length, ln.style.bg, 1);   // a player's color style
      if (!ln.disabled) hl(x, y, ln.text.length, 1, ln.id);
      put(x, y, ln.text, ln.style ? ln.style.fg : btnCol(ln), 'ui', !!ln.style);
      if (!ln.disabled) addHit(x, y, ln.text.length, 1, { kind: 'btn', id: ln.id, onTap: ln.onTap });
    } else if (ln.text) {
      const x = Math.floor((L.wc - ln.text.length) / 2);
      // rarity chips: chips: true = the rarity words in it; chip: 'rare' = the whole text (not its padding)
      const chips = ln.chip ? [{ from: ln.text.length - ln.text.trimStart().length, len: ln.text.trim().length, r: ln.chip }] : ln.chips ? rarityChips(ln.text) : null;
      if (chips && chips.length) {
        const chipAt = i => chips.find(c => i >= c.from && i < c.from + c.len);
        for (const c of chips) bg(x + c.from, y, c.len, chipOf(c.r).bg, 1);
        for (let i = 0; i < ln.text.length; i++) if (ln.text[i] !== ' ') { const c = chipAt(i); put(x + i, y, ln.text[i], c ? chipOf(c.r).fg : ln.colorAt ? ln.colorAt(i) : ln.col, 'board', !!ln.bold); }
      } else if (ln.colorAt) {
        // Per-character colors (used by the title art).
        for (let i = 0; i < ln.text.length; i++) if (ln.text[i] !== ' ') put(x + i, y, ln.text[i], ln.colorAt(i), 'board', ln.boldAt ? !!ln.boldAt(i) : !!ln.bold);
      } else put(x, y, ln.text, ln.col, 'board', !!ln.bold);
      if (ln.bgCol) bg(x, y, ln.text.length, ln.bgCol, ln.bgA != null ? ln.bgA : 1);
    }

    // Glitch-in right after a reveal.
    if (ln.reveal != null) {
      const age = now - (st.panelT0 + ln.reveal * CONFIG.revealGap);
      if (age < 180) for (let i = startIdx; i < cells.length; i++) if (Math.random() < 0.55) cells[i].ch = noiseCh();
      const gl = st.glow && st.glow[ln.revealId || ('r' + ln.reveal)];
      if (gl) {
        const ga = now - gl.t0;
        if (ga < 1200) for (let r = 0; r < h; r++) bg(0, y + r, L.wc, gl.col, 0.28 * (1 - ga / 1200) * (0.75 + 0.25 * Math.sin(ga / 60)));
      }
    }
    y += h;
  }
}

// Row k (0-4) of an info tile: the tile's frame/glyph row, and text line k beside it.
function drawTileRow(put, y, ln, k) {
  const x = Math.floor((L.wc - 34) / 2);
  const r = k === 0 || k === TILE_H - 1 ? '+- - -+' : ':' + ln.tileInfo[k - 1] + ':';
  const fc = ln.frameCol || C.mid, gc = ln.glyphCol || C.bright;
  put(x, y, r[0], fc, 'board');
  put(x + 1, y, r.slice(1, TILE_W - 1), k === 0 || k === TILE_H - 1 ? fc : gc, 'board');
  put(x + TILE_W - 1, y, r[TILE_W - 1], fc, 'board');
  const t = ln.lines[k];
  if (t) put(x + TILE_W + 2, y, t.text, t.col, 'board', k === 0);
}

// Pop effect for an offer appearing: sound + burst scaled by rarity.
function popFx(ln, y) {
  const lvl = ln.rarity ? RARITY[ln.rarity].lvl : 0;
  // its place among the rare pops on this screen (a row of boss mods climbs)
  const bigStep = lvl >= 3 ? (st.bigPops = (st.bigPops || 0) + 1) - 1 : 0;
  Sound.pop(lvl, bigStep);
  if (ln.seenKey) markSeen(ln.seenKey);
  if (lvl < 2) return;
  const col = rarityCol(ln.rarity);
  const n = [0, 0, 8, 22, 34][lvl];
  const fake = [];
  const cols = lvl === 3 ? [C.exotic, C.epic, C.rare, C.bright] : [col];   // exotic: rainbow
  for (let i = 0; i < n; i++) fake.push({ ch: lvl >= 3 && i % 3 === 0 ? '*' : noiseCh(), x: pxX(rand(L.wc * 0.15, L.wc * 0.85)), y: pxY(y), col: cols[i % cols.length] });
  explode(fake, pxX(L.wc / 2), pxY(y + 0.5), { power: lvl >= 4 ? 0.75 : lvl >= 3 ? 0.6 : 0.35, grav: 0.4, life: lvl >= 3 ? [0.5, 1.1] : [0.3, 0.7] });
  if (lvl >= 3) {
    flash(col, lvl >= 4 ? 0.2 : 0.14, 0.35); shake(lvl >= 4 ? 5 : 3, 0.3);
    st.glow = st.glow || {};
    st.glow[ln.revealId || ('r' + ln.reveal)] = { t0: performance.now(), col };   // the row glows a moment
    // its rarity floats up off the row
    const tag = lvl >= 4 ? '** BOSS **' : '!! EXOTIC !!';
    [...tag].forEach((ch, i) => parts.push({
      mode: 'float', ch, x: pxX(L.wc / 2 + i - tag.length / 2 + 0.5), y: pxY(y - 0.6),
      col: lvl === 3 ? cols[i % cols.length] : col, t: 0, life: 1.4, alpha: 1, rot: 0, scr: 0,
    }));
  }
}
