// NeoN+1 engine/loot.js: the LOOT bag (the user, 2026-10-30). Loot (value gear, the PHISH you keep) and quest items
// don't take belt slots: they go in run.loot (addLoot, engine/panels.js), as many as you find. [$] at the end of the
// rule over the mods opens the LOOT screen: everything you have, how many, what it's worth together; tap one for
// what it is. It's a pause (the clock stops). Loot sells at a black market (SELL); it can't be used.
'use strict';
NEON_FILES.push(['engine/loot.js', 'v13.95']);

// A loot stack's label: CHROME, or CHROMEx12 (no brackets (the user, 2026-10-30); a plain count: the bag has no cap, so no hex).
const lootLabel = s => s.n > 1 ? `${ITEMS[s.key].name}x${s.n}` : ITEMS[s.key].name;
// What the bag would sell for at a market (quest items aren't for sale).
const lootWorth = () => ((st.run && st.run.loot) || []).reduce((a, s) => a + (ITEMS[s.key].quest ? 0 : gearValue(s.key, s.tier) * s.n), 0);
// Quest items first, then the rest by worth (the best on top).
function lootRows() {
  const bag = ((st.run && st.run.loot) || []).slice();
  return bag.sort((a, b) => (ITEMS[b.key].quest ? 1 : 0) - (ITEMS[a.key].quest ? 1 : 0) || gearValue(b.key, b.tier) - gearValue(a.key, a.tier));
}

let lootUI = { sel: 0, area: { top: 0 } };

function openLoot() {
  if (st.pause === 'loot') return closeLoot();   // [$] again closes it (the user, 2026-10-30)
  if (st.pause) return;
  if (!st.run || st.busy || st.transitioning || st.wipe || st.dev || st.mp) { Sound.deny(); return; }
  st.pause = 'loot';   // a pause: every clock stops (st.pause), Esc / [ CLOSE ] ends it (togglePause)
  st.kbFocus = null;
  st.boardStart = performance.now();
  lootUI = { sel: 0, area: { top: 0 } };
  Sound.ui();
}
const closeLoot = () => { if (st.pause === 'loot') togglePause(); };

// Word-wrap for the info box.
function lootWrap(text, w) {
  const out = [];
  let line = '';
  for (const word of String(text).split(' ')) {
    if (line && (line + ' ' + word).length > w) { out.push(line); line = word; }
    else line = line ? line + ' ' + word : word;
  }
  if (line) out.push(line);
  return out;
}

// The LOOT screen (drawn on the board, like the pause menu): the total, the list (scrolls), the info box, CLOSE.
const LOOT_INFO_W = 34, LOOT_INFO_ROWS = 3;
function lootLines() {
  const lines = [];
  const T = (text, col = C.text) => lines.push({ text, col });
  const X = o => lines.push(o);
  const rows = lootRows();
  lootUI.sel = clamp(lootUI.sel, 0, Math.max(0, rows.length - 1));
  const worth = lootWorth();
  X({ gap: 2, row: [{ text: `~${worth}cr`, col: C.money }, { text: 'visit a market to sell', col: C.mid }] });
  T('');
  // the list gets what the rest leaves (the rest: the info box, CLOSE and the gaps: ~12 rows)
  const listH = Math.max(3, Math.min(Math.max(rows.length, 3), L.gh - 12));
  if (!rows.length) {
    T('no loot yet.', C.dim);
    T('$ nodes, caches and the PIER drop it.', C.dim);
    for (let i = 2; i < listH; i++) T('');
  } else {
    const items = rows.map((s, i) => {
      const v = itemView(s.key, s.tier), q = ITEMS[s.key].quest;
      return { list: true, id: 'lt' + i, onTap: () => { lootUI.sel = i; Sound.tick(); }, sel: i === lootUI.sel,
        name: lootLabel(s), chip: v.rarity, col: C.bright, right: q ? 'QUEST' : 'LOOT', rightCol: q ? C.rep : C.mid };
    });
    scrollFollow(lootUI.area, lootUI.sel, items.length, listH);
    scrollArea(X, T, lootUI.area, items, listH, 'lta');
  }
  T(SEP, C.dim);
  const s = rows[lootUI.sel];
  if (s) {
    const v = itemView(s.key, s.tier);
    X({ text: v.name, chip: v.rarity, bold: true });
    const info = lootWrap(v.desc || v.tip || '', LOOT_INFO_W).slice(0, LOOT_INFO_ROWS);
    for (let i = 0; i < LOOT_INFO_ROWS; i++) T(info[i] || '', C.text);
  } else for (let i = 0; i <= LOOT_INFO_ROWS; i++) T('');
  T(SEP, C.dim);
  lines.push({ text: '[ CLOSE ]', id: 'lootx', onTap: closeLoot });
  return lines;
}

// [£] (the LOOT bag's button: a pound sign, the user 2026-10-30; the comments say [$]) at the right end of the rule over the mods (y = the rule's row). New finds (the user, 2026-10-30) pile up over it:
// each one's name, on its rarity chip, appears 2 lines above the top of the pile and falls onto it, its last letter over
// the $. The bottom one feeds into the $ a letter at a time (the word slides right as it goes) while [$] blinks; then the
// pile drops a row and the next one feeds. A burst of finds (a boss) staggers in, stacking up as it goes.
// Rarer finds sound bigger: a pop by rarity as one lands, a click a letter, at epic and up a jingle as it goes in
// (legendary: a fanfare and confetti too). Dim when the bag is empty.
const LOOT_STEP = 50, LOOT_GAP = 140, LOOT_HOLD = 170, LOOT_DROP = 45, LOOT_BLINK = 360, LOOT_MAX = 14;   // ms: a row of falling, between finds, held before feeding, a letter, blink after; most on the pile
// A find joins the line (engine/panels.js addLoot).
function lootQueue(key, tier) {
  const q = st.lootPile = st.lootPile || [];
  if (q.length >= LOOT_MAX || !ITEMS[key]) return;
  const now = performance.now(), last = q[q.length - 1];
  q.push({ key, tier, born: Math.max(now, last ? last.born + LOOT_GAP : now), row: 0, target: 0, moveAt: 0, landAt: 0, feedAt: 0, fx: {} });
}
function lootFanfare(e, phase, v, x, y) {   // once each (the entry remembers): 'land', 'drop'+k, 'in'
  if (e.fx[phase]) return;
  e.fx[phase] = true;
  const lvl = RARITY[v.rarity] ? RARITY[v.rarity].lvl : 1;
  if (phase === 'land') { if (lvl >= 2) Sound.pop(Math.min(lvl, 3)); }
  else if (phase !== 'in') Sound.tick();
  else if (lvl >= 3) {
    Sound.jingle();
    if (lvl >= 4) {
      setTimeout(() => Sound.win(), 120);
      if (!reduced()) {
        flash(C.money, 0.15, 0.35); shake(3, 0.25);
        const cx = pxX(x + 1.5), cy = pxY(y), cols = [rarityCol(v.rarity), C.money, C.bright, C.accent], cells = [];
        for (let i = 0; i < 26; i++) cells.push({ ch: pickR(['$', '*', '+', '.', 'o'], Math.random), x: cx + rand(-1, 1) * L.cw, y: cy, col: pickR(cols, Math.random) });
        explode(cells, cx, cy + L.chh, { power: 0.8, grav: 0.8, life: [0.6, 1.2] });
      }
    }
  }
}
// Moves the pile on (by the clock, so drawing twice in a frame changes nothing). Returns what [$] shows: the letter
// falling in, and whether it blinks.
function lootPileTick(now, x, y) {
  const q = st.lootPile || [];
  let shown = 0;
  for (const e of q) {
    if (now < e.born) break;   // not out yet
    shown++;
    if (!e.row) { e.target = shown; e.row = shown + 2; e.moveAt = now; }   // appears 2 above the top of the pile
    e.target = shown;
    while (e.row > e.target && now - e.moveAt >= LOOT_STEP) { e.row--; e.moveAt += LOOT_STEP; }
    if (e.row <= e.target) e.moveAt = now;
    if (e.row === e.target && !e.landAt) { e.landAt = now; lootFanfare(e, 'land', itemView(e.key, e.tier), x, y); }
  }
  const b = q[0];
  if (!b || !b.landAt || b.row !== 1) return { letter: null, blink: !!(st.lootBlinkTo > now && Math.floor(now / 70) % 2 === 0) };
  if (!b.feedAt && now - b.landAt >= (q.length > 1 ? LOOT_HOLD / 3 : LOOT_HOLD)) b.feedAt = now;   // more waiting: a shorter hold
  if (!b.feedAt) return { letter: null, blink: false };
  const v = itemView(b.key, b.tier), name = v.name, gone = Math.floor((now - b.feedAt) / LOOT_DROP);
  if (gone >= 1 && gone <= name.length) lootFanfare(b, gone === name.length ? 'in' : 'drop' + gone, v, x, y);
  if (gone > name.length) { q.shift(); st.lootBlinkTo = now + LOOT_BLINK; return { letter: null, blink: true }; }   // in: the pile drops a row
  return { letter: gone >= 1 && (now - b.feedAt) % LOOT_DROP < LOOT_DROP * 0.7 ? name[name.length - gone] : null, blink: Math.floor(now / 70) % 2 === 0 };
}
function buildLootBtn(ctx, y) {
  const run = st.run;
  if (!run || st.mp || run.tutorial || st.mode === 'title' || st.mode === 'over') { st.lootPile = []; return; }
  const { now, put, addHit, bg } = ctx;
  const x = L.wc - 3, n = (run.loot || []).length;
  const fx = lootPileTick(now, x, y);
  for (const e of st.pause ? [] : st.lootPile || []) {   // the pile: each on its chip, its last letter over the $ (not over the LOOT screen or the pause menu)
    if (now < e.born || !e.row) continue;
    const v = itemView(e.key, e.tier), gone = e.feedAt ? Math.max(0, Math.floor((now - e.feedAt) / LOOT_DROP)) : 0;
    const word = v.name.slice(0, Math.max(0, v.name.length - gone)), wy = y - e.row, wx = x + 2 - word.length;
    if (word && wy >= 0) { clearRect(ctx.cells, wx - 1, wy, word.length + 1, 1); putChip(put, bg, wx, wy, word, v.rarity, 'fx', true); }
  }
  const dropping = fx.letter, blink = fx.blink;
  const hov = st.hoverBtn === 'loot';
  clearRect(ctx.cells, x, y, 3, 1);
  if (blink) bg(x, y, 3, C.money, 1);
  put(x, y, dropping ? '[' + dropping + ']' : '[£]', blink ? C.bg : n ? C.money : C.dim, 'ui', !!n);
  if (hov && !blink) bg(x, y, 3, C.money, 0.2);
  addHit(x, y, 3, 1, { kind: 'btn', id: 'loot', onTap: openLoot, noFocus: true });
}
