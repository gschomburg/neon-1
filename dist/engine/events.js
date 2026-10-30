// NeoN+1 engine/events.js: the SECTOR EVENT card (what a new sector rolled) and THE FENCE (THIEF's stolen mods,
// sold back). The events themselves: data/events.js; the roll: engine/map.js addSector.
'use strict';
NEON_FILES.push(['engine/events.js', 'v13.85']);

// ---------------- The SECTOR EVENT card ----------------
// It comes up over a new sector's map once the climb settles (toMap), and again from the map's sector label.
// Not an ad: narrower, its own frame, a system-message header, no countdown; CONTINUE closes it right away.
const EV_W = 31;   // the card's inside width
function showEventCard(sector, again = false) {
  const ev = sectorEvent(sector);
  if (!ev) return;
  st.evCard = { ev, sector, again, t0: null };   // t0: set when it first shows (after the climb)
}
function closeEventCard() {
  const c = st.evCard;
  if (!c) return;
  st.evCard = null;
  Sound.ui();
  const run = st.run;
  if (run && !c.again) { run.evSeen = run.evSeen || []; if (!run.evSeen.includes(c.sector)) run.evSeen.push(c.sector); saveRun(); }
}
// What a line of the card says, filled in for that sector.
function eventLines(ev, sector) {
  const pct = Math.round(eventShare(ev, sector) * 100) + '%';
  return SECTOR_EVENTS[ev].lines.map(l => l.replace('{pct}', pct).replace('{sale}', Math.round(ECON.events.fireSale * 100) + '%')
    .replace('{cr}', costInt(ECON.events.timeCr)));
}
// The tag line at the bottom: which anomaly (and that the sector boss has it too).
function eventTagLine(ev) {
  const E = SECTOR_EVENTS[ev];
  if (E.kind !== 'anomaly') return '';
  if (E.anomaly === 'any') return 'the boss gets one too.';
  const a = ANOMALIES[E.anomaly];
  return `${a.tag} = ${a.name} (the boss too)`;
}
// The card as rows: { t, col, bold, x ('c' = centered), btn }.
function eventCardRows(ev, sector) {
  const E = SECTOR_EVENTS[ev], rows = [];
  const R = (t, col = C.text, o = {}) => rows.push(Object.assign({ t, col }, o));
  R(`SECTOR ${sector + 1} // EVENT`, C.mid);
  R('');
  for (const a of E.art) R(a, C.bright, { x: 'c' });
  R('');
  const spaced = E.name.split('').join(' ');
  R(spaced.length <= EV_W - 2 ? spaced : E.name, C.bright, { x: 'c', bold: true });
  R('');
  for (const l of eventLines(ev, sector)) R(l);
  const tag = eventTagLine(ev);
  if (tag) { R(''); R(tag, C.money); }
  R('');
  R('[ CONTINUE ]', C.accent, { x: 'c', btn: true, bold: true });
  return rows;
}
const evCardShown = () => !!st.evCard && st.evCard.t0 != null;
function evTap(h) {
  if (!evCardShown()) return;
  if (h && h.id === 'evcont') return closeEventCard();
}
function evKey(k) {
  if (evCardShown() && (k === 'enter' || k === ' ' || k === 'escape' || k === 'x')) closeEventCard();
}
// Drawn over everything (engine/scene.js), on the map once its climb has settled.
function buildEventCard(ctx, now) {
  const { put, bg, cells, addHit } = ctx, c = st.evCard;
  if (!SECTOR_EVENTS[c.ev]) { st.evCard = null; return; }
  const mv = st.mapView;
  if (st.mode !== 'map' || (mv && mv.row !== mv.target) || st.wipe || st.transitioning) return;
  if (c.t0 == null) { c.t0 = now; Sound.shield(); markSeen('ev_' + c.ev); }   // its own alert sound; the codex logs it
  const rows = eventCardRows(c.ev, c.sector);
  const w = EV_W + 2, h = rows.length + 2, x0 = Math.max(0, Math.floor((L.wc - w) / 2)), y0 = Math.max(0, Math.floor((L.hc - h) / 2));
  clearRect(cells, x0, y0, w, h);
  for (let r = 0; r < h; r++) bg(x0, y0 + r, w, C.bg, 1);
  addHit(x0, y0, w, h, { kind: 'evbox' });
  const frame = c.ev && SECTOR_EVENTS[c.ev].kind === 'anomaly' ? C.accent : C.mid;
  put(x0, y0, '#' + '='.repeat(w - 2) + '#', frame, 'hud', true);
  put(x0, y0 + h - 1, '#' + '='.repeat(w - 2) + '#', frame, 'hud', true);
  for (let r = 1; r < h - 1; r++) { put(x0, y0 + r, '|', frame, 'hud'); put(x0 + w - 1, y0 + r, '|', frame, 'hud'); }
  // the lines type in, a few characters a frame
  let budget = Math.floor((now - c.t0) / 8);
  rows.forEach((ln, r) => {
    const t = ln.t.slice(0, EV_W - 2), x = x0 + 2 + (ln.x === 'c' ? Math.floor((EV_W - 2 - t.length) / 2) : 0), y = y0 + 1 + r;
    const shown = t.slice(0, Math.max(0, budget)); budget -= t.length;
    if (!shown) return;
    if (ln.btn) {
      const hov = st.hoverBtn === 'evcont';
      if (hov) bg(x, y, t.length, ln.col, 1);
      put(x, y, shown, hov ? C.bg : ln.col, 'hud', true);
      addHit(x, y, t.length, 1, { kind: 'btn', id: 'evcont', onTap: closeEventCard });
    } else put(x, y, shown, ln.col, 'hud', !!ln.bold);
  });
}

// ---------------- THE FENCE ----------------
// THIEF's stolen mods, for sale next to the sector boss. A mod costs its uplink fee (by its rarity; HAGGLE works
// here). It comes back as it was (its tier, no slot needed: it was yours). What you don't buy is gone at the uplink.
const fencePrice = o => Math.round(costInt(ECON.uplink[modView(o.key, o.tier).rarity] != null ? ECON.uplink[modView(o.key, o.tier).rarity] : ECON.uplink.common)
  * uplinkMult() * (has('haggle') ? 1 - tv('haggle', ECON.haggle) : 1));
function openFence(node) {
  const run = st.run;
  let sel = 0;
  const stock = () => run.fence || [];
  const buy = i => {
    const o = stock()[i];
    if (!o || st.transitioning) return Sound.deny();
    const price = fencePrice(o);
    if (run.mods.includes(o.key) || !canSpend(price)) return Sound.deny();
    run.credits -= price;
    run.mods.push(o.key); run.modTier = run.modTier || {}; run.modTier[o.key] = o.tier;
    stock().splice(i, 1);
    sel = Math.min(sel, Math.max(0, stock().length - 1));
    Sound.buy(); setMsg(`> bought back ${MODS[o.key].name.toLowerCase()}. -${price}cr.`, C.money);
    saveRun();
  };
  const whyNot = o => run.mods.includes(o.key) ? 'you have one already.' : !canSpend(fencePrice(o)) ? 'not enough credits.' : null;
  st.fence = { buyAt: buy, price: fencePrice, get stock() { return stock(); } };   // (tests)
  for (const k of ['haggle']) if (has(k)) modFired(k);
  openPanel('THE FENCE', (T, B, X) => {
    T('THE FENCE', C.money);
    T(`credits ${run.credits}${has('haggle') ? `  (haggle -${Math.round(tv('haggle', ECON.haggle) * 100)}%)` : ''}`, C.money);
    T('');
    if (!stock().length) {
      T('nothing here. nobody took', C.text);
      T('anything from you. lucky.', C.text);
      for (let i = 0; i < 6; i++) T('');
    } else {
      T('your stolen mods, for sale:', C.mid);
      stock().forEach((o, k) => {
        const v = modView(o.key, o.tier);
        X({ list: true, id: 'fence' + k, onTap: () => { sel = k; Sound.tick(); }, sel: k === sel, faded: !!whyNot(o),
          badge: o.key, badgeTier: v.tier, name: v.name, col: C.bright, right: `${fencePrice(o)}cr`.padStart(6), rightCol: C.money });
      });
      T('');
      T(SEP, C.dim);
      const o = stock()[sel], v = modView(o.key, o.tier), why = whyNot(o);
      X({ badge: o.key, badgeTier: v.tier });
      T(v.tip || v.desc, C.text);
      if (why) { T(''); T(why, C.dangerDim); T(''); }
      else X({ box: true, text: 'B U Y   B A C K', sub: `${fencePrice(o)}cr`, id: 'fbuy', onTap: () => buy(sel), minW: 18 });
      T(SEP, C.dim);
    }
    B('[ LEAVE ]', 'leave', leavePanel);
  }, stock().length ? '> the fence has your stuff.' : '> the fence shrugs.');
}
