// NeoN+1 engine/codex.js: The codex.
'use strict';
NEON_FILES.push(['engine/codex.js', 'v13.46']);

// ---------------- Codex ----------------
const RARITY_ORDER = Object.keys(RARITY);
const codexMods = () => Object.keys(MODS).sort((a, b) => RARITY_ORDER.indexOf(MODS[a].rarity) - RARITY_ORDER.indexOf(MODS[b].rarity) || MODS[a].name.localeCompare(MODS[b].name));
const CODEX_ROWS = 24; // height of the list window, including "more" rows

function wrapText(str, w) {
  const lines = [];
  let cur = '';
  for (const word of str.split(' ')) {
    if (cur && (cur + ' ' + word).length > w) { lines.push(cur); cur = word; }
    else cur = cur ? cur + ' ' + word : word;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Which entries fit in the list window when it starts at `top`.
// A "more" row takes a slot at the top/bottom when there are entries that way.
function listWindow(top, n, rows = CODEX_ROWS) {
  const hasUp = top > 0;
  let shown = rows - (hasUp ? 1 : 0);
  const hasDown = top + shown < n;
  if (hasDown) shown -= 1;
  return { hasUp, hasDown, shown: Math.min(shown, n - top) };
}
const maxTop = (n, rows = CODEX_ROWS) => n <= rows ? 0 : n - (rows - 1);
// Scrolling off the very top makes a "more" row appear in the freed space, which would
// look like nothing moved. So the first step down skips one extra line, and stepping
// back to line 1 snaps to the top.
function nextTop(top, d, max) {
  let t = top + d;
  if (top === 0 && d > 0) t += 1;
  if (t === 1 && d < 0) t = 0;
  return clamp(t, 0, max);
}

function openCodex() {
  const TABS = [['mods', 'MODS', 'tabm'], ['items', 'ITEMS', 'tabi'], ['glyphs', 'GLYPHS', 'tabg'], ['corps', 'CORPS', 'tabc']];
  let tab = 'mods', sel = 0, top = 0, shownPal = null;
  const entries = () => tab === 'mods' ? codexMods() : tab === 'items' ? Object.keys(ITEMS)
    : tab === 'glyphs' ? GLYPHS.map(gl => gl.key) : CODEX_CORPS.map(k => 'corp_' + k);
  // Corps: a short list and a taller details box.
  const rowsFor = () => tab === 'corps' ? CODEX_ROWS - 5 : tab === 'glyphs' ? CODEX_ROWS : CODEX_ROWS - 7;   // details: corps 10 rows, mods / items 12, glyphs 5
  const setTab = name => { tab = name; sel = 0; top = 0; Sound.tick(); };
  const scrollBy = d => { const n = entries().length; const t = nextTop(top, d, maxTop(n, rowsFor())); if (t !== top) { top = t; Sound.tick(); } };
  // Keep the selected entry inside the list window.
  const follow = () => {
    const n = entries().length, rows = rowsFor();
    for (let i = 0; i < 4; i++) {
      const w = listWindow(top, n, rows);
      if (sel < top) top = sel;
      else if (sel >= top + w.shown) top = sel - w.shown + 1;
      else break;
      top = clamp(top, 0, maxTop(n, rows));
    }
  };

  openPanel('CODEX', (T, B, X) => {
    const list = entries(), n = list.length, rows = rowsFor();
    sel = clamp(sel, 0, n - 1);
    top = clamp(top, 0, maxTop(n, rows));
    const found = list.filter(k => save.seen[k]).length;
    T(`CODEX  ${tab} ${found}/${n} found`, C.accent);
    X({ gap: 1, row: TABS.map(([name, label, id]) => ({ text: `[${label}]`, id, sel: tab === name, onTap: () => setTab(name) })) });

    // Details of the selected entry (5 rows; 10 for corps).
    T(SEP, C.dim);
    const k = list[sel], seen = !!save.seen[k];
    // A found corp is shown in its own palette (if corp colors are on).
    const palKey = tab === 'corps' && seen ? k.slice(5) : null;
    if (palKey !== shownPal) { shownPal = palKey; scenePalette(palKey); }
    if (tab === 'corps') {
      const key = k.slice(5), d = corpDef(key), rec = corpStat(key);
      const pad = (arr, nRows) => { while (arr.length < nRows) arr.push(''); return arr.slice(0, nRows); };
      if (!seen) {
        T('???', C.dim); T('not found yet.', C.mid); T('enter it on the map to log it.', C.dim);
        for (let i = 0; i < 7; i++) T('');
      } else {
        X({ text: `${corpCode(d)}  ${d.name}${d.level ? '  LV' + d.level : ''}`, col: key === 'omni' ? C.danger : C.accent, bold: true });
        T(d.intel, C.text);
        T(corpRules(d, 1), C.mid);
        T(d.bossDesc || '', C.dangerDim);
        T('');
        // The tell only appears once you've beaten this corp.
        const tell = rec.breached ? pad(wrapText('tell: ' + CORP_TELL[key], 34), 3)
          : ['tell: ???', 'beat this corp to log its tell.', ''];
        tell.forEach((t, i) => T(t, rec.breached ? C.accent : i === 0 ? C.mid : C.dim));
        T(d.mods ? `mods: ${d.mods.map(m => MODS[m].name).join(', ')}` : 'mods: none', C.mid);
        T(`breached ${rec.breached}   lost ${rec.lost}`, C.text);
      }
    } else if (tab === 'glyphs') {
      const gl = GLYPH_BY_KEY[k];
      X({ tileInfo: seen ? gl.glyphOf() : MASK_GLYPH, lines: seen
        ? [{ text: gl.name, col: C.accent }, ...gl.lore.map(t => ({ text: t, col: C.text }))]
        : [{ text: '???', col: C.dim }, { text: 'not found yet.', col: C.mid }, { text: 'it shows up on a board.', col: C.dim }] });
    } else if (!seen) {
      T('???', C.dim); T('not found yet.', C.mid);
      T(tab === 'mods' ? 'find it in a run to unlock it.' : 'pick one up to unlock it.', C.dim);
      for (let i = 0; i < 9; i++) T('');
    } else if (tab === 'mods') {
      // 12 rows: badge, kind, the full text, its tiers, where it comes from
      const m = MODS[k];
      const kind = m.kind === 'corp' ? 'corp mod' : m.kind === 'minor' ? 'minor mod' : 'mod';
      X({ badge: k });
      const sg = STAGES[m.stage];   // when it fires (the trigger order)
      X({ text: `${RARITY[m.rarity].label} // ${kind} // ${sg.order ? sg.order + '.' : ''}${sg.label}`, col: C.mid, chips: true });
      const tiers = m.tiers ? m.tiers.map((_, i) => tierView(m, i)) : [];
      const d = wrapText(m.codex || m.desc, 34).slice(0, 12 - 3 - tiers.length - (tiers.length ? 1 : 0));
      d.forEach(l => T(l.padEnd(34), C.text));
      if (tiers.length) { T(''); tiers.forEach(v => X({ text: `${tierLabel(v).padEnd(7)}${v.tip}`.padEnd(34), col: C.text, chips: true })); }
      T(modWhere(m), C.mid);
      for (let i = 3 + d.length + tiers.length + (tiers.length ? 1 : 0); i < 12; i++) T('');
    } else {
      const it = ITEMS[k], tiers = it.tiers ? it.tiers.map((_, i) => tierView(it, i)) : [];
      X({ text: it.name, chip: it.rarity, bold: true }); X({ text: `${!['scrap', 'common'].includes(it.rarity) ? RARITY[it.rarity].label + ' ' : ''}item // single use`, col: C.mid, chips: true });
      const dl = wrapText(it.codex || it.desc, 34).slice(0, 12 - 3 - tiers.length - (tiers.length ? 1 : 0));
      dl.forEach(l => T(l.padEnd(34), C.text));
      if (tiers.length) { T(''); tiers.forEach(v => X({ text: `${RARITY[v.rarity].label.padEnd(7)}${v.tip}`.padEnd(34), col: C.text, chips: true })); }
      T(`from: ${ITEM_WHERE}`, C.mid);
      for (let i = 3 + dl.length + tiers.length + (tiers.length ? 1 : 0); i < 12; i++) T('');
    }
    T(SEP, C.dim);

    // The list window, with "more" rows when there are entries above/below.
    const w = listWindow(top, n, rows);
    let used = 0;
    if (w.hasUp) { X({ text: '[ ^ ^ ^  more  ^ ^ ^ ]', invert: true, id: 'moreup', onTap: () => scrollBy(-1) }); used++; }
    for (let idx = top; idx < top + w.shown; idx++) {
      const key = list[idx], seenK = !!save.seen[key];
      const base = { list: true, id: 'cx' + idx, onTap: () => { sel = idx; Sound.tick(); }, sel: idx === sel };
      if (tab === 'glyphs') {
        X(Object.assign(base, { name: seenK ? GLYPH_BY_KEY[key].name : '???', col: seenK ? C.bright : C.dim, right: `#${pad2(idx + 1)}`, rightCol: C.mid }));
      } else if (tab === 'corps') {
        const ck = key.slice(5), d = corpDef(ck), rec = corpStat(ck);
        X(Object.assign(base, {
          name: seenK ? `${corpCode(d)}  ${d.name}` : '???', col: seenK ? C.bright : C.dim,
          right: rec.breached ? 'BREACHED' : seenK ? 'SEEN' : '', rightCol: rec.breached ? C.accent : C.mid,
        }));
      } else {
        const isMod = tab === 'mods';
        const def = isMod ? MODS[key] : ITEMS[key];
        X(Object.assign(base, {
          badge: isMod && seenK ? key : null,
          name: seenK ? def.name : '???', col: seenK ? C.bright : C.dim, chip: seenK && !isMod ? def.rarity : null,
          right: isMod ? (seenK ? RARITY[def.rarity].label : '') : 'item', rightCol: C.mid, rightChips: seenK,
        }));
      }
      used++;
    }
    if (w.hasDown) { X({ text: '[ v v v  more  v v v ]', invert: true, id: 'moredn', onTap: () => scrollBy(1) }); used++; }
    for (; used < rows; used++) T('');
    B('[ BACK ]', 'back', () => swapTo(showTitle));
  }, '> codex open.', { full: true });

  // Keys: left/right = tabs, up/down = move through the list, esc = back.
  st.keyHandler = k => {
    if (k === 'arrowleft' || k === 'arrowright') {
      const i = TABS.findIndex(t => t[0] === tab);
      const next = TABS[(i + (k === 'arrowright' ? 1 : TABS.length - 1)) % TABS.length];
      setTab(next[0]);
      st.kbFocus = st.hoverBtn = next[2];   // cursor follows the active tab
      return true;
    }
    if (k === 'arrowup' || k === 'arrowdown') {
      // Past the last entry the cursor moves to BACK; up from BACK returns to the list.
      const n = entries().length;
      if (k === 'arrowdown' && st.kbFocus === 'back') return true;
      if (k === 'arrowup' && st.kbFocus === 'back') { st.kbFocus = st.hoverBtn = null; Sound.tick(); return true; }
      if (k === 'arrowdown' && sel >= n - 1) { st.kbFocus = st.hoverBtn = 'back'; Sound.tick(); return true; }
      sel = clamp(sel + (k === 'arrowdown' ? 1 : -1), 0, n - 1);
      follow();
      Sound.tick();
      return true;
    }
    if (k === 'escape') { swapTo(showTitle); return true; }
    return false;
  };
  st.scroll = scrollBy;   // mouse wheel and swipe
}
