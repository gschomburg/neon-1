// NeoN+1 engine/codex.js: The codex.
'use strict';
NEON_FILES.push(['engine/codex.js', 'v15.36']);

// ---------------- Codex ----------------
const RARITY_ORDER = Object.keys(RARITY);
const codexMods = () => Object.keys(MODS).filter(k => !MODS[k].hidden).sort((a, b) => RARITY_ORDER.indexOf(MODS[a].rarity) - RARITY_ORDER.indexOf(MODS[b].rarity) || MODS[a].name.localeCompare(MODS[b].name));
// THE SHELL's mark (Greg, 2026-11-20): the word SHELL as a chip in the color of the top rarity give.mod / give.gear can
// call up (engine/deck.js deckGiveTiers: found = up to rare, shredded = higher). Only once THE SHELL is yours (ROOT on
// your crew). It sits in front of the "from" line, or on its own row when that would run past 34.
const cxShellTop = (kind, k) => {
  if (typeof deckGiveTiers !== 'function' || !(typeof rootOn === 'function' && rootOn())) return null;
  const ts = deckGiveTiers(kind, k);
  return ts.length ? tierView(kind === 'mod' ? MODS[k] : ITEMS[k], ts[ts.length - 1]).rarity : null;
};
const CX_SHELL = 'SHELL';
const cxWhereOwn = (where, top) => top && where.length + CX_SHELL.length + 1 > 34 ? 1 : 0;   // (1: the mark takes its own row)
function cxWhere(X, T, where, top) {
  if (!top) { T(where, C.mid); return 0; }
  if (cxWhereOwn(where, top)) { X({ text: CX_SHELL, chip: top }); T(where, C.mid); return 1; }
  X({ text: CX_SHELL + ' ' + where, col: C.mid, moreChips: [{ from: 0, len: CX_SHELL.length, r: top }] });
  return 0;
}
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
// A list that doesn't fit keeps both "more" rows (the user, 2026-10-30: a step is always one line): hasUp / hasDown say
// the rows are there; canUp / canDown say there's more that way (a row with nothing more is drawn blank).
function listWindow(top, n, rows = CODEX_ROWS) {
  if (n <= rows) return { hasUp: false, hasDown: false, canUp: false, canDown: false, shown: n };
  const shown = Math.min(rows - 2, n - top);
  return { hasUp: true, hasDown: true, canUp: top > 0, canDown: top + rows - 2 < n, shown };
}
const maxTop = (n, rows = CODEX_ROWS) => n <= rows ? 0 : n - (rows - 2);
const nextTop = (top, d, max) => clamp(top + d, 0, max);

// The scroll area every list uses (THE BOARD's tabs; the codex draws the same thing by hand): `rows` lines high,
// with the "more" rows at the top / bottom when there's more that way, the wheel and swipes scroll it.
// s: { top } (the caller keeps it). items: X specs, one per line. Always draws exactly `rows` lines.
function scrollArea(X, T, s, items, rows, idp = 'sa') {
  const n = items.length, max = maxTop(n, rows);
  s.top = clamp(s.top || 0, 0, max);
  const by = d => { const t = nextTop(s.top, d, maxTop(n, rows)); if (t !== s.top) { s.top = t; Sound.tick(); } };
  const w = listWindow(s.top, n, rows);
  let used = 0;
  if (w.hasUp) { X({ text: w.canUp ? '[ ^ ^ ^  more  ^ ^ ^ ]' : '', invert: true, id: idp + 'up', onTap: () => by(-1) }); used++; }
  for (let i = s.top; i < s.top + w.shown; i++) { X(items[i]); used++; }
  if (w.hasDown) { X({ text: w.canDown ? '[ v v v  more  v v v ]' : '', invert: true, id: idp + 'dn', onTap: () => by(1) }); used++; }
  for (; used < rows; used++) T('');
  st.scroll = by;
  return w;
}
// Keep line idx inside a scroll area's window.
function scrollFollow(s, idx, n, rows) {
  if (s.fIdx === idx && s.fN === n) return;   // only when the selection moves (else it fights a scroll by hand)
  s.fIdx = idx; s.fN = n;
  for (let i = 0; i < 4; i++) {
    const w = listWindow(s.top, n, rows);
    if (idx < s.top) s.top = idx;
    else if (idx >= s.top + w.shown) s.top = idx - w.shown + 1;
    else break;
    s.top = clamp(s.top, 0, maxTop(n, rows));
  }
}

// THE ENCRYPTED CODEX (BACKLOG 9): an entry you haven't found shows its real name as ciphertext (FX.decrypt, data/fx.js
// decrypt). As you find more of that tab, more letters show through (up to decrypt.hint of them, all found). A newly
// found entry decodes the first time the codex shows it; save.codexRead keeps the ones that have.
const CX_DECODING = {};   // key -> when its decode started (this session)
function cxName(key, real, seen, frac, now) {
  const D = FX_LOOKS.decrypt, seed = FX.seedOf(key), hint = frac * D.hint;
  if (!seen) return FX.decrypt(real, hint, seed, now);
  if (save.codexRead[key]) return real;
  if (!CX_DECODING[key]) { CX_DECODING[key] = now; if (Sound.static) Sound.static(0.15); }
  const k = (now - CX_DECODING[key]) / D.dur;
  if (k >= 1) { save.codexRead[key] = 1; persist(); delete CX_DECODING[key]; return real; }
  return FX.decrypt(real, hint + (1 - hint) * k, seed, now, true);
}

// THE CODEX's tabs (Greg, 2026-11-21): [id, label, its sub-tabs]. CHIPS shows once you've got a chip of your own (not
// the two the deck comes with: DECK_START).
const CX_SUB = { items: 'gear', mods: 'mods', chips: 'chips', corps: 'corps', glyphs: 'glyphs', sectors: 'sectors', crew: 'crew', rivals: 'rivals' };
const cxChipsOn = () => typeof DECK_CHIPS !== 'undefined' && Object.keys(DECK_CHIPS).some(k => !DECK_START.chips[k] && deckHave(k) > 0);
const cxTabs = () => [['tech', 'TECH', ['items', 'mods', ...(cxChipsOn() ? ['chips'] : [])]], ['net', 'NET', ['corps', 'glyphs', 'sectors']], ['hk', 'HACKERS', ['crew', 'rivals']]];
// the chips, by group (DECK_GROUPS' order) then rarity. Not the BETA ones (not built yet).
const cxChips = () => Object.keys(DECK_CHIPS).filter(k => !deckBeta(k)).sort((a, b) => {
  const g = Object.keys(DECK_GROUPS), A = DECK_CHIPS[a], B = DECK_CHIPS[b];
  return g.indexOf(A[1]) - g.indexOf(B[1]) || RARITY_ORDER.indexOf(A[2]) - RARITY_ORDER.indexOf(B[2]) || A[0].localeCompare(B[0]);
});
// where a chip comes from (engine/deck.js: deckRollChip's pool, DECK_RIPPED, DECK_NO_DROP, the BOSS chips)
const cxChipWhere = k => DECK_START.chips[k] ? 'from: it comes with your deck.' : k === '1UP' ? "from: b0y, for beating G0D." : k === 'MN1' ? "from: ROOT's quest."
  : deckIsRipped(k) ? 'from: rivals and THE FENCE. never a cache or a market.' : DECK_CHIPS[k][1] === 'boss' ? 'from: the big bosses.'
  : 'from: caches, the pier, markets and corp bosses. or build it at a WORKBENCH.';
// where you were last time (this session): the codex opens there again
const CX_LAST = { tab: null, sel: 0, top: 0 };
function openCodex(want) {
  // (first time with the encrypted codex: what you'd already found doesn't decode again)
  if (!save.codexRead) { save.codexRead = {}; for (const k of Object.keys(save.seen || {})) if (save.seen[k]) save.codexRead[k] = 1;
    for (const c of CODEX_CORPS) if (corpStat(c).breached) for (let i = 0; i < 3; i++) save.codexRead['tell_' + c + i] = 1;
    persist(); }
  const tabs = cxTabs(), subs = tabs.flatMap(t => t[2]);
  if (want === 'gear') want = 'items';
  let tab = subs.includes(want) ? want : subs.includes(CX_LAST.tab) ? CX_LAST.tab : 'items', sel = 0, top = 0, shownPal = null;
  if (tab === CX_LAST.tab) ({ sel, top } = CX_LAST);
  const main = () => tabs.find(t => t[2].includes(tab));
  const isChip = () => tab === 'chips', isHk = () => tab === 'crew' || tab === 'rivals';
  const entries = () => tab === 'mods' ? codexMods() : tab === 'items' ? Object.keys(ITEMS).filter(k => !ITEMS[k].bag && !ITEMS[k].chip)
    : tab === 'chips' ? cxChips().map(deckChipItem)
    : tab === 'glyphs' ? GLYPHS.map(gl => gl.key) : tab === 'sectors' ? Object.keys(SECTOR_EVENTS).map(k => 'ev_' + k)
    : tab === 'crew' ? HK_CREW.map(k => 'hk_' + k) : tab === 'rivals' ? HK_RIVALS.map(k => 'hk_' + k) : CODEX_CORPS.map(k => 'corp_' + k);
  // found: seen; a chip also when it's in your deck (the ones it came with were never picked up)
  const seenOf = key => !!save.seen[key] || (isChip() && deckHave(ITEMS[key].chip) > 0);
  // an entry's name, as the codex shows it once it's found (what the ciphertext hides)
  const nameOf = key => tab === 'corps' ? (d => `${corpCode(d)}  ${d.name}`)(corpDef(key.slice(5))) : isHk() ? hkName(key.slice(3))
    : tab === 'sectors' ? SECTOR_EVENTS[key.slice(3)].name : tab === 'glyphs' ? GLYPH_BY_KEY[key].name : (tab === 'mods' ? MODS : ITEMS)[key].name;
  // Corps: a short list and a taller details box.
  const rowsFor = () => tab === 'corps' ? CODEX_ROWS - 5 : tab === 'glyphs' ? CODEX_ROWS : CODEX_ROWS - 7;   // details: corps 10 rows, mods / items / chips 12, glyphs 5
  const setTab = name => { if (name === tab) return; tab = name; sel = 0; top = 0; Sound.tick(); };
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
    Object.assign(CX_LAST, { tab, sel, top });
    const found = list.filter(seenOf).length, now = performance.now();
    const cx = key => cxName(key, nameOf(key), seenOf(key), found / n, now);   // the name, or its ciphertext
    T(`CODEX  ${CX_SUB[tab]} ${found}/${n} found`, C.accent);
    // THE CODEX's tabs (Greg, 2026-11-21): three main ones, and the sub-tab strip under them (drawSubTabs, like the
    // BOOK's). The same two rows the six tabs used to take.
    X({ gap: 1, row: tabs.map(([id, label, s]) => ({ text: `[${label}]`, id: 'tab_' + id, sel: main()[0] === id, onTap: () => setTab(s[0]) })) });
    X({ h: 1, draw: (ctx, y) => drawSubTabs(ctx, y, main()[2].map(s => ({ id: 'cxs_' + s, text: CX_SUB[s].toUpperCase(), on: tab === s, onTap: () => setTab(s) }))) });

    // Details of the selected entry (5 rows; 10 for corps).
    T(SEP, C.dim);
    const k = list[sel], seen = seenOf(k);
    // A found corp is shown in its own palette (if corp colors are on).
    const palKey = tab === 'corps' && seen ? k.slice(5) : null;
    if (palKey !== shownPal) { shownPal = palKey; scenePalette(palKey); }
    if (tab === 'corps') {
      const key = k.slice(5), d = corpDef(key), rec = corpStat(key);
      const pad = (arr, nRows) => { while (arr.length < nRows) arr.push(''); return arr.slice(0, nRows); };
      if (!seen) {
        T(cx(k), C.dim); T('not found yet.', C.mid); T('enter it on the map to log it.', C.dim);
        for (let i = 0; i < 7; i++) T('');
      } else {
        X({ text: `${corpCode(d)}  ${d.name}${d.level ? '  LV' + d.level : ''}`, col: key === 'omni' ? C.danger : C.accent, bold: true });
        T(d.intel, C.text);
        (wrapText(corpRules(d, 1), 34).length ? wrapText(corpRules(d, 1), 34) : ['']).forEach(l => T(l, C.mid));
        T(d.bossDesc || '', C.dangerDim);
        T('');
        // The tell: ciphertext until you've beaten this corp (its first line, and a hint), then it decodes once.
        const tl = pad(wrapText('tell: ' + CORP_TELL[key], 34), 3), on = !!rec.breached;
        const line = (t, i) => i ? cxName('tell_' + key + i, t, on, 0, now) : 'tell: ' + cxName('tell_' + key + i, t.slice(6), on, 0, now);   // ('tell: ' stays clear)
        const tell = on ? tl.map(line) : [line(tl[0], 0), 'beat this corp to log its tell.', ''];
        tell.forEach((t, i) => T(t, rec.breached ? C.accent : i === 0 ? C.mid : C.dim));
        T(d.gear ? `boss gear: ${ITEMS[d.gear.key].name} x${d.gear.n}` : d.mods ? `mods: ${d.mods.map(m => MODS[m].name).join(', ')}` : 'mods: none', C.mid);
        T(`breached ${rec.breached}   lost ${rec.lost}`, C.text);
      }
    } else if (isHk()) {
      // 12 rows: the face in their colors, name and side, the shtick, the lore
      const id = k.slice(3), h = HACKERS[id], sty = hkStyle(id), face = (ART_FACES[id] || { art: ['', '', ''] }).art;
      if (!seen) {
        T(cx(k), C.dim); T('not met yet.', C.mid); T(h.side === 'bad' ? 'rivals show up in RIVAL corps.' : 'CALL gear brings crew in.', C.dim);
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
        X({ tileInfo: MASK_GLYPH, lines: [{ text: cx(k), col: C.dim }, { text: 'not found yet.', col: C.mid }, { text: 'sectors 2 and up roll one.', col: C.dim }] });
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
        : [{ text: cx(k), col: C.dim }, { text: 'not found yet.', col: C.mid }, { text: 'it shows up on a board.', col: C.dim }] });
    } else if (isChip()) {
      // 12 rows: the name, rarity // group // power, what it does, where it comes from, whether it's yours
      const ck = ITEMS[k].chip, c = DECK_CHIPS[ck];
      if (!seen) {
        T(cx(k), C.dim); T('not found yet.', C.mid);
        T(deckIsRipped(ck) ? 'rivals carry these.' : 'pick one up, or see one for sale.', C.dim);
        for (let i = 0; i < 9; i++) T('');
      } else {
        X({ text: c[0], chip: c[2], bold: true });
        X({ text: `${RARITY[c[2]].label} // ${DECK_GROUPS[c[1]][0]} chip // power ${c[3]}`, col: C.mid, chips: true });
        const wh = wrapText(cxChipWhere(ck), 34), dl = wrapText(c[4], 34).slice(0, 12 - 4 - wh.length);
        dl.forEach(l => T(l.padEnd(34), C.text));
        T('');
        wh.forEach(l => T(l, C.mid));
        T(deckHave(ck) ? `${ck}: in your deck.` : `${ck}: not yours yet.`, deckHave(ck) ? C.accent : C.dim);
        for (let i = 4 + dl.length + wh.length; i < 12; i++) T('');
      }
    } else if (!seen) {
      T(cx(k), C.dim); T('not found yet.', C.mid);
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
      const d = wrapText(m.codex || m.desc, 34).slice(0, 12 - 3 - tiers.length - (tiers.length ? 1 : 0) - cxWhereOwn(modWhere(m), cxShellTop('mod', k)));
      d.forEach(l => T(l.padEnd(34), C.text));
      if (tiers.length) { T(''); tiers.forEach(v => X({ text: `${tierLabel(v).padEnd(7)}${v.tip}`.padEnd(34), col: C.text, chips: true })); }
      const own = cxWhere(X, T, modWhere(m), cxShellTop('mod', k));
      for (let i = 3 + d.length + tiers.length + (tiers.length ? 1 : 0) + own; i < 12; i++) T('');
    } else {
      const it = ITEMS[k], tiers = it.tiers ? it.tiers.map((_, i) => tierView(it, i)) : [];
      X(isLoot(k) ? { text: it.name, chip: it.rarity, bold: true } : { gearHead: k, gearTier: 0, text: it.name }); X({ text: `${!['scrap', 'common'].includes(it.rarity) ? RARITY[it.rarity].label + ' ' : ''}gear // single use`, col: C.mid, chips: true });
      const boss = it.corp && CORPS[it.corp];   // boss gear: which boss gives it, how many
      const from = `from: ${boss ? `${boss.name} boss (x${boss.gear ? boss.gear.n : 1}).` : it.where || ITEM_WHERE}`, shTop = cxShellTop('gear', k);
      const dl = wrapText(it.codex || it.desc, 34).slice(0, 12 - 3 - tiers.length - (tiers.length ? 1 : 0) - cxWhereOwn(from, shTop));
      dl.forEach(l => T(l.padEnd(34), C.text));
      if (tiers.length) { T(''); tiers.forEach(v => X({ text: `${RARITY[v.rarity].label.padEnd(7)}${v.tip}`.padEnd(34), col: C.text, chips: true })); }
      const own = cxWhere(X, T, from, shTop);
      for (let i = 3 + dl.length + tiers.length + (tiers.length ? 1 : 0) + own; i < 12; i++) T('');
    }
    T(SEP, C.dim);

    // The list window, with "more" rows when there are entries above/below.
    const w = listWindow(top, n, rows);
    let used = 0;
    if (w.hasUp) { X({ text: w.canUp ? '[ ^ ^ ^  more  ^ ^ ^ ]' : '', invert: true, id: 'moreup', onTap: () => scrollBy(-1) }); used++; }
    for (let idx = top; idx < top + w.shown; idx++) {
      const key = list[idx], seenK = seenOf(key);
      const base = { list: true, id: 'cx' + idx, onTap: () => { sel = idx; Sound.tick(); }, sel: idx === sel };
      if (isHk()) {
        const h = HACKERS[key.slice(3)];
        X(Object.assign(base, { name: cx(key), col: seenK ? C.bright : C.dim, right: seenK ? (h.side === 'bad' ? 'RIVAL' : 'CREW') : '', rightCol: h.side === 'bad' ? C.danger : C.accent }));
      } else if (isChip()) {
        const ck = ITEMS[key].chip;
        X(Object.assign(base, { name: cx(key), col: seenK ? C.bright : C.dim, chip: seenK ? DECK_CHIPS[ck][2] : null, right: seenK ? ck : '', rightCol: C.mid }));
      } else if (tab === 'sectors') {
        const E = SECTOR_EVENTS[key.slice(3)];
        X(Object.assign(base, { name: cx(key), col: seenK ? C.bright : C.dim, right: seenK ? (E.kind === 'sector' ? 'sector' : 'anomaly') : '', rightCol: C.mid }));
      } else if (tab === 'glyphs') {
        X(Object.assign(base, { name: cx(key), col: seenK ? C.bright : C.dim, right: `#${pad2(idx + 1)}`, rightCol: C.mid }));
      } else if (tab === 'corps') {
        const ck = key.slice(5), d = corpDef(ck), rec = corpStat(ck);
        X(Object.assign(base, {
          name: cx(key), col: seenK ? C.bright : C.dim,
          right: rec.breached ? 'BREACHED' : seenK ? 'SEEN' : '', rightCol: rec.breached ? C.accent : C.mid,
        }));
      } else {
        const isMod = tab === 'mods';
        const def = isMod ? MODS[key] : ITEMS[key];
        X(Object.assign(base, {
          badge: isMod && seenK ? key : null,
          gear: seenK && !isMod && !isLoot(key) ? key : null,
          name: cx(key), col: seenK ? C.bright : C.dim, chip: seenK && !isMod && isLoot(key) ? def.rarity : null,
          right: isMod ? (seenK ? RARITY[def.rarity].label : '') : 'gear', rightCol: C.mid, rightChips: seenK,
        }));
      }
      used++;
    }
    if (w.hasDown) { X({ text: w.canDown ? '[ v v v  more  v v v ]' : '', invert: true, id: 'moredn', onTap: () => scrollBy(1) }); used++; }
    for (; used < rows; used++) T('');
  }, '> codex open.', { full: true, top: TO_TITLE });

  // Keys: left/right = sub-tabs, up/down = move through the list, esc = back.
  st.keyHandler = k => {
    if (k === 'arrowleft' || k === 'arrowright') {
      // every sub-tab in order, into the next main tab at the end (Greg, 2026-11-21)
      const all = cxTabs().flatMap(t => t[2]), i = all.indexOf(tab);
      setTab(all[(i + (k === 'arrowright' ? 1 : all.length - 1)) % all.length]);
      st.kbFocus = st.hoverBtn = 'tab_' + main()[0];   // cursor follows the active tab
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
