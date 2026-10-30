// NeoN+1 engine/codex.js: The codex.
'use strict';
NEON_FILES.push(['engine/codex.js', 'v13.84']);

// ---------------- Codex ----------------
const RARITY_ORDER = Object.keys(RARITY);
const codexMods = () => Object.keys(MODS).sort((a, b) => RARITY_ORDER.indexOf(MODS[a].rarity) - RARITY_ORDER.indexOf(MODS[b].rarity) || MODS[a].name.localeCompare(MODS[b].name));
const CODEX_ROWS = 23; // height of the list window, including "more" rows (the tabs take two rows)

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

// The scroll area every list uses (THE BOARD's tabs; the codex draws the same thing by hand): `rows` lines high,
// with the "more" rows at the top / bottom when there's more that way, the wheel and swipes scroll it.
// s: { top } (the caller keeps it). items: X specs, one per line. Always draws exactly `rows` lines.
function scrollArea(X, T, s, items, rows, idp = 'sa') {
  const n = items.length, max = maxTop(n, rows);
  s.top = clamp(s.top || 0, 0, max);
  const by = d => { const t = nextTop(s.top, d, maxTop(n, rows)); if (t !== s.top) { s.top = t; Sound.tick(); } };
  const w = listWindow(s.top, n, rows);
  let used = 0;
  if (w.hasUp) { X({ text: '[ ^ ^ ^  more  ^ ^ ^ ]', invert: true, id: idp + 'up', onTap: () => by(-1) }); used++; }
  for (let i = s.top; i < s.top + w.shown; i++) { X(items[i]); used++; }
  if (w.hasDown) { X({ text: '[ v v v  more  v v v ]', invert: true, id: idp + 'dn', onTap: () => by(1) }); used++; }
  for (; used < rows; used++) T('');
  st.scroll = by;
  return w;
}
// Keep line idx inside a scroll area's window.
function scrollFollow(s, idx, n, rows) {
  for (let i = 0; i < 4; i++) {
    const w = listWindow(s.top, n, rows);
    if (idx < s.top) s.top = idx;
    else if (idx >= s.top + w.shown) s.top = idx - w.shown + 1;
    else break;
    s.top = clamp(s.top, 0, maxTop(n, rows));
  }
}

function openCodex() {
  const TABS = [['mods', 'MODS', 'tabm'], ['items', 'GEAR', 'tabi'], ['glyphs', 'GLYPHS', 'tabg'], ['corps', 'CORPS', 'tabc'], ['sectors', 'SECTORS', 'tabs'], ['hackers', 'HACKERS', 'tabh']];
  let tab = 'mods', sel = 0, top = 0, shownPal = null;
  const entries = () => tab === 'mods' ? codexMods() : tab === 'items' ? Object.keys(ITEMS).filter(k => !ITEMS[k].bag)
    : tab === 'glyphs' ? GLYPHS.map(gl => gl.key) : tab === 'sectors' ? Object.keys(SECTOR_EVENTS).map(k => 'ev_' + k)
    : tab === 'hackers' ? [...HK_RIVALS, ...HK_CREW].map(k => 'hk_' + k) : CODEX_CORPS.map(k => 'corp_' + k);
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
    const tabBtn = ([name, label, id]) => ({ text: `[${label}]`, id, sel: tab === name, onTap: () => setTab(name) });
    X({ gap: 0, row: TABS.slice(0, 4).map(tabBtn) });   // (two rows: 36 wide)
    X({ gap: 0, row: TABS.slice(4).map(tabBtn) });

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
        T(d.gear ? `boss gear: ${ITEMS[d.gear.key].name} x${d.gear.n}` : d.mods ? `mods: ${d.mods.map(m => MODS[m].name).join(', ')}` : 'mods: none', C.mid);
        T(`breached ${rec.breached}   lost ${rec.lost}`, C.text);
      }
    } else if (tab === 'hackers') {
      // 12 rows: the face in their colors, name and side, the shtick, the lore
      const id = k.slice(3), h = HACKERS[id], sty = hkStyle(id), face = (ART_FACES[id] || { art: ['', '', ''] }).art;
      if (!seen) {
        T('???', C.dim); T('not met yet.', C.mid); T(h.side === 'bad' ? 'rivals show up in RIVAL corps.' : 'CALL gear brings crew in.', C.dim);
        for (let i = 0; i < 9; i++) T('');
      } else {
        const side = h.side === 'bad' ? 'RIVAL' : 'CREW', ink = hkInk(id);
        face.forEach((l, i) => { const txt = i === 0 ? hkName(id) : i === 1 ? side : `${'#'.repeat(h.hp)} bars`; const line = (l.padEnd(5) + '   ' + txt).padEnd(32); X({ text: line, colorAt: c => c < 5 ? ink : i === 0 ? C.bright : i === 1 ? (h.side === 'bad' ? C.danger : C.accent) : C.mid, bold: i === 0 }); });
        const sh = wrapText(`"${h.shtick}"`, 34), lore = wrapText(h.lore.join(' '), 34);
        T(sh[0] || '', ink); T(sh[1] || '', ink);
        for (let i = 0; i < 7; i++) T(lore[i] || '', C.mid);
      }
    } else if (tab === 'sectors') {
      // 12 rows: the card's picture with its name and kind, what the card says (at sector 2), the anomaly
      const ev = k.slice(3), E = SECTOR_EVENTS[ev];
      if (!seen) {
        X({ tileInfo: MASK_GLYPH, lines: [{ text: '???', col: C.dim }, { text: 'not found yet.', col: C.mid }, { text: 'sectors 2 and up roll one.', col: C.dim }] });
        for (let i = 0; i < 7; i++) T('');
      } else {
        const a = E.kind === 'anomaly' && E.anomaly !== 'any' ? ANOMALIES[E.anomaly] : null;
        X({ tileInfo: normMotif(E.art), lines: [{ text: E.name, col: C.accent }, { text: 'sector event', col: C.mid },
          { text: E.kind === 'sector' ? 'the whole sector' : a ? `anomaly: ${a.tag} ${a.name}` : 'anomaly: any one', col: C.text }] });
        const ls = eventLines(ev, 1), tag = eventTagLine(ev);
        ls.forEach(l => T(l, C.text));
        T('');
        T(tag || 'no anomalies: the boss is plain.', tag ? C.money : C.mid);
        for (let i = ls.length + 2; i < 7; i++) T('');
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
      X({ text: it.name, chip: it.rarity, bold: true }); X({ text: `${!['scrap', 'common'].includes(it.rarity) ? RARITY[it.rarity].label + ' ' : ''}gear // single use`, col: C.mid, chips: true });
      const dl = wrapText(it.codex || it.desc, 34).slice(0, 12 - 3 - tiers.length - (tiers.length ? 1 : 0));
      dl.forEach(l => T(l.padEnd(34), C.text));
      if (tiers.length) { T(''); tiers.forEach(v => X({ text: `${RARITY[v.rarity].label.padEnd(7)}${v.tip}`.padEnd(34), col: C.text, chips: true })); }
      const boss = it.corp && CORPS[it.corp];   // boss gear: which boss gives it, how many
      T(`from: ${boss ? `${boss.name} boss (x${boss.gear ? boss.gear.n : 1}).` : it.where || ITEM_WHERE}`, C.mid);
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
      if (tab === 'hackers') {
        const h = HACKERS[key.slice(3)];
        X(Object.assign(base, { name: seenK ? hkName(key.slice(3)) : '???', col: seenK ? C.bright : C.dim, right: seenK ? (h.side === 'bad' ? 'RIVAL' : 'CREW') : '', rightCol: h.side === 'bad' ? C.danger : C.accent }));
      } else if (tab === 'sectors') {
        const E = SECTOR_EVENTS[key.slice(3)];
        X(Object.assign(base, { name: seenK ? E.name : '???', col: seenK ? C.bright : C.dim, right: seenK ? (E.kind === 'sector' ? 'sector' : 'anomaly') : '', rightCol: C.mid }));
      } else if (tab === 'glyphs') {
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
          right: isMod ? (seenK ? RARITY[def.rarity].label : '') : 'gear', rightCol: C.mid, rightChips: seenK,
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
