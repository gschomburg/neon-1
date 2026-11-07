// NeoN+1 engine/had3s.js: HAD3S's own corps (docs/QUESTS.md step 5; the seed itself: engine/quests.js DOG DAYS).
// They live in HEAVEN (engine/heaven.js) with the other story corps, so the map never picks them at random:
// HAD3S puts MYCONET on sector 1's boss node and CERBERUS (no mold there: engine/heaven.js) on sector 2's.
'use strict';
NEON_FILES.push(['engine/had3s.js', 'v14.49']);

// ---------------- MYCONET: the mold corp ----------------
// (the user, 2026-11-04: "start with some scraping, or maybe the ice spawns mold that you need to scrape")
// Mold grows in over every node. A covered node can't be picked: a tap scrapes it off (it grows back in a few
// seconds), a second tap picks it. The tell: the mold feeds on ICE, so over the real node it only grows thin and pale.
// Hit ICE and it spores: the nodes around it are covered again, and for a moment the thin one thickens too.
// Boss: one ICE grows thin as well. d0g studied it down here (docs/QUESTS.md).
const MYCO = { grow: 1500, rate: 2.2, regrow: 3600, spore: 2600, thin: '.,:;\'`', thick: '%&#@*%&' };
function mycoScrape(t, now) {
  const { tx, ty } = tileOrigin(t), bits = [];
  for (let y = ty + 1; y <= ty + 3; y++) for (let x = tx + 1; x <= tx + 5; x++)
    if (bits.length < 12 && Math.random() < 0.6 && !reduced()) bits.push({ ch: MYCO.thick[(x + y) % MYCO.thick.length], x: pxX(x), y: pxY(y), col: moldCol(2.6) });
  if (bits.length) explode(bits, pxX(tx + 3), pxY(ty + 2) - L.chh * 0.5, { power: 0.45, grav: 1.4, life: [0.3, 0.7] });
  Sound.moldBreak(t.mycThin ? 1 : 2.4);
  t.myc = 0; t.mycOff = now;
}
HEAVEN.myconet = {
  key: 'myconet', name: 'MYCONET', code: 'MY', level: 4,
  intel: '"we grow the network now."',
  tell: null, pay: 1.3,
  bossDesc: 'boss: a decoy grows thin too.',
  rules: () => 'mold covers the nodes. tap: scrape.',
  mods: ['bleach'],
  layerMsg: () => ({ text: '> it grows over everything. scrape it.', col: C.text }),
  dress(lv, k) {
    lv.myco = { t0: null, boss: k.boss, last: 0, said: false };
    for (const t of lv.tiles) { t.myc = 0; t.mycThin = false; t.mycOff = 0; }
    k.tellTile.mycThin = true;
    if (k.boss) { const d = pickR(k.tiles.filter(t => t !== k.tellTile && !t.safe), k.r); if (d) d.mycThin = true; }
    shuffle(lv.tiles.slice(), k.r).forEach((t, i, a) => { t.mycAt = 150 + i * (MYCO.grow / Math.max(1, a.length)); });
  },
  hint(lv) { return lv.myco ? { text: 'it feeds on ICE. thin mold: look.', col: C.mid } : null; },
  // a tap on a covered node scrapes it; on a clear one it's a pick
  intercept(i) {
    const lv = st.lv, t = lv && lv.tiles[i];
    if (!lv || !lv.myco || !t || lv.shownAt == null || t.state !== 'closed') return false;
    if (t.myc < 0.5) return false;
    mycoScrape(t, performance.now());
    if (!lv.myco.said) { lv.myco.said = true; setMsg('> scraped. it will grow back.', moldCol(2.6)); }
    return true;
  },
  onHit() { Sound.moldBreak(3); },
  // ICE spores: its neighbors are covered again, and the thin mold thickens for a moment
  async afterHit(t, lv) {
    if (!lv.myco || st.run.integrity <= 0) return;
    const now = performance.now();
    for (const o of lv.tiles) if (o !== t && o.state === 'closed' && Math.abs(o.col - t.col) <= 1 && Math.abs(o.row - t.row) <= 1) { o.myc = 1; o.mycOff = 0; }
    lv.myco.sporeUntil = now + MYCO.spore;
    setMsg('> spores. the mold surges.', moldCol(3));
  },
  overlay(ctx, lv, now) {
    const m = lv.myco;
    if (!m || lv.shownAt == null) return;
    if (m.t0 == null) m.t0 = now;
    const dt = Math.min(0.05, Math.max(0, (now - (m.last || now)) / 1000)); m.last = now;
    const spore = m.sporeUntil && now < m.sporeUntil, cover = new Set(), draw = [];
    for (const t of lv.tiles) {
      if (t.state !== 'closed' || t.hidden) continue;
      if (now - m.t0 > t.mycAt && (!t.mycOff || now - t.mycOff > MYCO.regrow) && t.myc < 1) t.myc = Math.min(1, t.myc + MYCO.rate * dt);   // it grows (back)
      if (t.myc <= 0) continue;
      const { tx, ty } = tileOrigin(t), thin = t.mycThin && !spore;
      for (let y = ty + 1; y <= ty + 3; y++) for (let x = tx + 1; x <= tx + 5; x++) {
        if (h01(t.cell * 7 + x, y) > t.myc) continue;   // (growing in: patchy)
        cover.add(x + ',' + y);
        const set = thin ? MYCO.thin : MYCO.thick, ch = set[Math.floor(h01(x * 3 + y, t.cell + Math.floor(now / 900)) * set.length)];
        draw.push([x, y, ch, thin ? moldCol(0.8) : moldCol(1.8 + h01(x, y * 5) * 1.6)]);
      }
    }
    const keep = ctx.cells.filter(c => !cover.has(Math.round(c.cx) + ',' + Math.round(c.cy)));
    ctx.cells.length = 0; ctx.cells.push(...keep);
    for (const [x, y, ch, col] of draw) ctx.put(x, y, ch, col, 'fx');
  },
};
CORP_TELL.myconet = "mold grows over every node: tap one to scrape it off (it grows back), tap again to pick. it feeds on ICE: over the real node it only grows thin and pale. hit ICE and it spores: the nodes around it are covered again, and for a moment the thin one goes thick too. boss: one ICE grows thin as well.";
MUSIC_FOR.myconet = MUSIC_FOR.bitrot || 'theme';   // (BAD SECTOR, BITROT's: decay)
