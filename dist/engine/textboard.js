// NeoN+1 engine/textboard.js: centered text screens (buildTextBoard), the big box button (drawBox), text fields
// (Field, drawField), info tile rows and offer pops. Moved out of engine/scene.js (2026-11-05).
'use strict';
NEON_FILES.push(['engine/textboard.js', 'v14.65']);

// Big boxed primary button. 3 rows, or 4 with a subtitle.
function drawBox(ctx, y, ln) {
  const { now, put, addHit } = ctx;
  const label = ln.text, sub = ln.sub || '';
  const w = Math.max(ln.minW || 20, Math.max(label.length, sub.length) + 8);
  const x = Math.floor((L.wc - w) / 2);
  const h = sub ? 4 : 3;
  const pulse = (Math.sin(now / 420) + 1) / 2;
  // col: the box's color (default accent); disCol: its color when disabled (default dim)
  const base = ln.col || C.accent, off = ln.disCol || C.dim;
  const fcol = ln.disabled ? off : base;
  const lcol = ln.disabled ? off : pulse > 0.85 ? C.bright : base;   // a slow, gentle pulse
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

// Centered text screens: title, panels, help, codex, settings, game over.
// Line types:
//   text {text,col}           button {text,id,onTap,disabled,sel,faded}
//   box {box,text,sub,id}     row of small buttons {row:[...]}
//   badge {badge}             list row {list,id,onTap,sel,name,right,badge,col,tint}
//   gap {gap:n} (empty rows)   any text line: tap {id,onTap} makes it tappable
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
  const heightOf = ln => ln.box ? (ln.sub ? 4 : 3) : ln.tileInfo ? TILE_H : ln.mapView || ln.draw ? ln.h || 1 : 1;
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
    // a scrolling area's first / last line: arrows in both margins when there's more (the game-over screen)
    if (ln.arrowUp || ln.arrowDown) { const ch = ln.arrowUp ? '^' : 'v', blink = Math.floor(now / 600) % 2 ? C.mid : C.dim; put(0, y, ch, blink, 'board'); put(L.wc - 1, y, ch, blink, 'board'); }

    if (ln.box) drawBox(ctx, y, ln);
    else if (ln.draw) ln.draw(ctx, y);   // a line that draws itself, h rows (the WORKBENCH: engine/bench.js)
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
    else if (ln.gearHead && !ln.list && ITEMS[ln.gearHead]) {   // a gear's header (the detail box): its code chip, then its name, like a mod's
      const code = itemShort(ln.gearHead), name = ln.text || ITEMS[ln.gearHead].name, x = Math.floor((L.wc - (code.length + 2 + name.length)) / 2);
      putChip(put, bg, x, y, code, itemView(ln.gearHead, ln.gearTier || 0).rarity, 'board', true);
      put(x + code.length + 2, y, name, C.bright, 'board', true);
    } else if (ln.badge && !ln.list) {
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
      // check: 'x' / ' ' / '*' (locked): a checkbox before the badge (the UPLINK)
      if (ln.check != null) { put(cx, y, '[' + ln.check + ']', ln.checkCol || C.mid, 'ui', ln.check === 'x'); cx += 4; }
      if (ln.badge) cx += drawBadge(put, now, cx, y, ln.badge, 1, { own: 'board', tier: ln.badgeTier, bg, dim: !!ln.badgeDim }) + 1;
      // gear: its code on its rarity chip, then its name (the user, 2026-10-31: the same as mods, in every list)
      if (ln.gear && ITEMS[ln.gear]) { const code = itemShort(ln.gear); putChip(put, bg, cx, y, code, itemView(ln.gear, ln.gearTier || 0).rarity, 'ui', true); cx += Math.max(code.length + 1, 5); }   // (names line up with the mods': a badge is 4 wide)
      // faded (can't afford, sold, locked): the color bit stays (a mod's badge, an item's name chip),
      // everything else goes grey, so you see what you're missing
      // clip: the name stops a space short of the right text ('ellipsis' ends it with ...; 'cut' just cuts: a ticker)
      let name = ln.name;
      if (ln.clip) { const room = (ln.right ? x + LW - ln.right.length - 1 : x + LW) - cx; if (name.length > room) name = ln.clip === 'ellipsis' ? name.slice(0, Math.max(0, room - 2)) + '..' : name.slice(0, Math.max(0, room)); }
      if (ln.chip) putChip(put, bg, cx, y, name, ln.chip, 'ui', !!ln.sel);
      else put(cx, y, name, ln.faded ? C.mid : (ln.col || C.bright), 'ui', !!ln.sel);
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
      if (ln.tap) {   // a tappable text line (a leaderboard row): {id, onTap}
        if (st.hoverBtn === ln.tap.id) bg(x, y, ln.text.length, C.accent, 0.2);
        addHit(x, y, ln.text.length, 1, { kind: 'btn', id: ln.tap.id, onTap: ln.tap.onTap });
      }
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
  if (t && t.kw) { const ca = kwCols(t.text, t.col); for (let i = 0; i < t.text.length; i++) put(x + TILE_W + 2 + i, y, t.text[i], ca(i), 'board', k === 0); }   // keywords in color (HOW TO PLAY)
  else if (t) put(x + TILE_W + 2, y, t.text, t.col, 'board', k === 0);
}

// Pop effect for an offer appearing: sound + burst scaled by rarity.
function popFx(ln, y) {
  const lvl = ln.rarity ? ({ scrap: 0, common: 0, rare: 1, epic: 2, exotic: 3, legendary: 4 })[ln.rarity] || 0 : 0;
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
