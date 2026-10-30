// NeoN+1 engine/loot.js: the LOOT bag (the user, 2026-10-30). Loot (value gear, the PHISH you keep) and quest items
// don't take belt slots: they go in run.loot (addLoot, engine/panels.js), as many as you find. [$] at the end of the
// rule over the mods opens the LOOT screen: everything you have, how many, what it's worth together; tap one for
// what it is. It's a pause (the clock stops). Loot sells at a black market (SELL); it can't be used.
'use strict';
NEON_FILES.push(['engine/loot.js', 'v13.85']);

// A loot stack's label: [CHROME], or CHROMEx12 (a plain count: the bag has no cap, so no hex here).
const lootLabel = s => s.n > 1 ? `${ITEMS[s.key].name}x${s.n}` : `[${ITEMS[s.key].name}]`;
// What the bag would sell for at a market (quest items aren't for sale).
const lootWorth = () => ((st.run && st.run.loot) || []).reduce((a, s) => a + (ITEMS[s.key].quest ? 0 : gearValue(s.key, s.tier) * s.n), 0);
// Quest items first, then the rest by worth (the best on top).
function lootRows() {
  const bag = ((st.run && st.run.loot) || []).slice();
  return bag.sort((a, b) => (ITEMS[b.key].quest ? 1 : 0) - (ITEMS[a.key].quest ? 1 : 0) || gearValue(b.key, b.tier) - gearValue(a.key, a.tier));
}

const LOOT_NEW_MS = 1500;   // a new find shows on its chip by [$] this long, then [$] blinks
let lootUI = { sel: 0, area: { top: 0 } };

function openLoot() {
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

// [$] at the right end of the rule over the mods (y = the rule's row). A new find shows on its rarity chip just left
// of it for a moment, then [$] blinks as it goes in. Dim when the bag is empty.
function buildLootBtn(ctx, y) {
  const run = st.run;
  if (!run || st.mp || run.tutorial || st.mode === 'title' || st.mode === 'over') return;
  const { now, put, addHit, bg } = ctx;
  const x = L.wc - 3, n = (run.loot || []).length;
  const ln = st.lootNew, age = ln ? now - ln.at : 1e9;
  if (ln && age < LOOT_NEW_MS && ITEMS[ln.key]) {   // the find, on its chip, sliding in
    const v = itemView(ln.key, ln.tier), name = v.name, slide = Math.min(1, age / 220);
    const cx = Math.round(x - 1 - name.length - (1 - slide) * 4);
    clearRect(ctx.cells, cx - 1, y, name.length + 2, 1);
    putChip(put, bg, cx, y, name, v.rarity, 'fx', true);
  }
  const blink = ln && age >= LOOT_NEW_MS * 0.6 && age < LOOT_NEW_MS + 600 && Math.floor(age / 120) % 2 === 0;
  const hov = st.hoverBtn === 'loot';
  clearRect(ctx.cells, x, y, 3, 1);
  if (blink) bg(x, y, 3, C.money, 1);
  put(x, y, '[$]', blink ? C.bg : n ? C.money : C.dim, 'ui', !!n);
  if (hov && !blink) bg(x, y, 3, C.money, 0.2);
  addHit(x, y, 3, 1, { kind: 'btn', id: 'loot', onTap: openLoot, noFocus: true });
}
