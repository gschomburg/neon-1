// NeoN+1 engine/tray.js: the mod tray and mod badges (drawBadge, putChip, buildTray). Moved out of engine/scene.js
// (2026-11-05). buildScene (engine/scene.js) calls buildTray each frame.
'use strict';
NEON_FILES.push(['engine/tray.js', 'v14.46']);

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
  const g0dm = m.anim === 'g0d';   // !G0D (data/mods.js): an exotic's wave and colors, G0D going to g0d, flickering red
  const anim = lvl <= 1 ? 'none' : m.rarity === 'exotic' ? 'exotic' : m.anim;
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
  const rainbow = ['exotic', 'epic', 'rare', 'legendary'].map(chipOf);
  for (let k = 0; k < label.length; k++) {
    let ch = label[k], dy = 0, inv = selected || flash, chip = chip0;
    if (anim === 'wave' || anim === 'exotic') { const w = t - k * 0.09; if (w > 0 && w < 0.3) dy = -Math.sin(w / 0.3 * Math.PI) * 0.35; }
    if (anim === 'exotic' && !dim) chip = rainbow[Math.floor(now / 160 + k) % rainbow.length];
    if (g0dm) { if (Math.floor(now / 420) % 3 === 1) ch = ch.toLowerCase(); if (!dim && FX.hs(Math.floor(now / 90) * 1.7 + k * 7.3) < 0.3) chip = { bg: G0DF_RED, fg: C.bg }; }
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
      const bc = spent ? C.danger : usable ? (Math.floor(now / 450) % 2 ? C.bright : C.accent) : C.dim;   // ready: the brackets pulse
      put(x, ry, '[', bc, 'tray', true);
      const bw = drawBadge(put, now, x + 1, ry, key, i, { dim: !usable, tier: modTier(key), bg, selected: sel, fireKey: key === 'mutate' ? run.mutateAs : key });
      put(x + 1 + bw, ry, ']', bc, 'tray', true);
      w = bw + 2;
    } else if (key === 'mutate' && run.mutateAs && MODS[run.mutateAs] && now - (st.mutateAt || -1e9) >= 0 && now - st.mutateAt < 2400 && Math.floor((now - st.mutateAt) / 400) % 2 === 0) {
      w = drawBadge(put, now, x, ry, run.mutateAs, i, { tier: run.mutateTier || 0, bg, selected: sel });   // MUTATE just mutated: flicks between MUT and what it became
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
    const mv = key === 'mutate' && run.mutateAs && MODS[run.mutateAs] ? modView(run.mutateAs, run.mutateTier || 0) : null;
    const tip = mv ? `now: ${mv.name.toLowerCase()} (${RARITY[mv.rarity].label.toLowerCase()}). ${mv.tip}`
      : key === 'compost' ? `compost ${(run.compost || 0) % 3}/3. ${m.tip}`
      : key === 'leverage' ? (run.credits < 0 ? `debt shield ${Math.round(debtShield() * 100)}%. limit ${creditFloor()}.` : `no debt. limit ${creditFloor()}.`) + ` loan ${DEBT.payment + DEBT.paymentSector * (run.sector || 0)}cr/layer.`
      : key === 'zombie' ? `rot ${run.rot || 0}/${rotMax()}. ${tapsToBreak()} taps a node.` : m.tip;
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
    const lab = beltLabel(stack), nameLen = stack.n > 1 ? itemShort(stack.key).length : lab.length;   // (its short code: engine/panels.js ITEM_SHORT)
    const listy = st.mode === 'panel' || st.mode === 'fish';   // a list screen: you compare your gear with what's on offer
    if (st.gearPress && st.gearPress.moved && st.gearPress.i === i) { put(ix, y + 2, ':  .  :', C.dim, 'tray'); addHit(ix, y + 2, 7, 1, { kind: 'item', i }); continue; }   // dragged out: its slot is empty (the full name rides your finger)
    if (ok || listy) putChip(put, bg, ix, y + 2, lab.slice(0, nameLen), v.rarity, 'tray', v.tier > 0);   // on its rarity chip
    else put(ix, y + 2, lab.slice(0, nameLen), C.mid, 'tray');
    if (stack.n > 1) {   // x3: the count on a darker chip of the same rarity (the user, 2026-11-06: plain text was hard to read on some backgrounds)
      const cnt = lab.slice(nameLen), ch = chipOf(v.rarity);
      if (ok || listy) { bg(ix + nameLen, y + 2, cnt.length, mixHex(ch.bg, '#000000', 0.45), 1); put(ix + nameLen, y + 2, cnt, ch.bg, 'tray'); }
      else put(ix + nameLen, y + 2, cnt, C.dim, 'tray');
    }
    if (gearOn(stack.key)) { bg(ix, y + 2, 7, C.accent, 0.3 + 0.25 * Math.sin(now / 160)); put(ix + 7 - 1, y + 2, '*', C.accent, 'tray', true); }   // ENCORE on: it glows
    if (sel || hov) bg(ix, y + 2, 7, C.accent, sel ? 0.25 : 0.12);
    addHit(ix, y + 2, 7, 1, { kind: 'item', i });
  }

  // Dragging gear: the TRASH (centered on the line above the mods), the gear under your finger
  const gp = st.gearPress;
  if (gp && gp.moved && run.items[gp.i] && st.ptr) {
    const t = trashSpot(), over = gearOverTrash(), s = run.items[gp.i], name = '[' + ITEMS[s.key].name + ']';
    // over the trash, the gear drops into it: the trash shows its name (solid red); otherwise [ TRASH ] and the gear on your
    // cursor (a finger covers it, so on touch it rides one row up)
    const lab = over ? name : '[ TRASH ]', tw = Math.max(t.w, lab.length + 2), tx = Math.floor((L.wc - tw) / 2);
    clearRect(ctx.cells, tx, t.y, tw, 1);   // (the rule line doesn't show through)
    bg(tx, t.y, tw, C.danger, over ? 1 : 0.25);
    put(tx + Math.floor((tw - lab.length) / 2), t.y, lab, over ? C.bg : C.danger, 'fx', true);
    if (!over) {
      const cx = Math.round((st.ptr.x - L.ox) / L.cw - name.length / 2), cy = Math.floor((st.ptr.y - L.oy) / L.chh) - (gp.touch ? 1 : 0);
      bg(cx, cy, name.length, C.bg, 0.85);
      put(cx, cy, name, rarityCol(ITEMS[s.key].rarity), 'fx', true);
    }
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
      const usable = canUse(stack);
      const onOff = stack.key === 'encore' || ARMS[stack.key] ? (gearOn(stack.key) ? '>tap: off' : '>tap: on') : null;   // switches: ENCORE, and the gear you arm
      const act = onOff || (usable ? '>tap' : '(not now)'), x0 = 3 + it.name.length, room = L.wc - x0 - act.length - 1;
      let tip = (stack.n > 1 ? `x${stack.n} ` : '') + it.tip;
      if (tip.length > room) {   // too long: it scrolls (a beat first), like the UPLINK's ticker
        if (st.tipTick !== ii + ':' + stack.key) { st.tipTick = ii + ':' + stack.key; st.tipT0 = now; }
        const full = tip + '     ', o = Math.max(0, Math.floor((now - st.tipT0 - 900) / 140)) % full.length;
        tip = (full + full).slice(o, o + room);
      }
      put(x0, y + 3, tip, C.text);
      put(x0 + Math.min(room, tip.length) + 1, y + 3, act, usable ? C.accent : C.dim);
    }
  }
}
