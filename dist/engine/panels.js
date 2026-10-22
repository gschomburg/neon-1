// NeoN+1 engine/panels.js: Panels: rewards, markets, caches...
'use strict';
NEON_FILES.push(['engine/panels.js', 'v13.01']);

// ---------------- Panels ----------------
// The title and the menu screens use the whole screen: no header, HUD or tray.
const fullScreen = () => st.mode === 'title' || st.mode === 'over' || (st.mode === 'panel' && st.panelFull);

function openPanel(title, fn, msg, opts = {}) {
  st.panelFull = !!opts.full;
  st.swap = null;
  st.bigPops = 0; st.glow = {};
  st.breachReveal = false;
  // Line-by-line reveal out of an empty screen (after a boss): the title types in,
  // then the lines come in under it. Header, HUD and tray come back when it's done.
  st.panelReveal = opts.reveal ? { t0: performance.now() + 100, shown: 0, typed: 0, y: null, lt: 0, done: false, center: 'board', sound: 'climb' } : null;
  st.panelTitle = title;
  st.panelFn = fn;
  st.revealed = new Set();
  showBoard('panel');
  st.panelT0 = performance.now() + (st.wipe ? st.wipe.dur : 0) + CONFIG.revealDelay;
  if (st.panelReveal) { st.panelT0 = Infinity; st.boardStart = -1e9; }   // offers pop as their lines come in
  st.busy = false;
  const m = msg && typeof msg === 'object' ? msg : msg ? { text: msg } : null;
  if (st.panelReveal) { st.panelReveal.msg = m; st.msg = ''; }
  else if (m) setMsg(m.text, m.col);
}

async function leavePanel() {
  if (st.transitioning) return;
  await swapTo(toMap);
}

// Take a mod at a tier. Owning it already upgrades it instead (upgradeTo); that never
// needs a slot. Returns 'new' or 'up'. (Check modRoom first for a new one.)
function addMod(key, tier = 0) {
  const run = st.run;
  if (!MODS[key]) return null;          // a mod that no longer exists (old saves / tests)
  markSeen(key);
  if (run.mods.includes(key)) { run.modTier[key] = upgradeTo(key, tier); return 'up'; }
  run.mods.push(key);
  run.modTier[key] = clamp(tier, 0, tierCount(MODS[key]) - 1);
  if (key === 'buffer') { run.maxInt++; run.integrity++; }
  if (key === 'stash') run.beltSlots++;
  if (key === 'chromed') {   // the belt goes: what you hold is sold for half
    const cash = run.items.reduce((a, s) => a + Math.floor(itemView(s.key, s.tier).price * TIER_PRICE[s.tier || 0] / 2) * s.n, 0);
    run.items = []; run.credits += cash; run.earned += cash;
    if (cash) setTimeout(() => setMsg(`> chromed up: items sold, +${cash}cr.`, C.money), 400);
  }
  if (key === 'bloodmoney') { run.credits += BLOOD.bonus; run.earned += BLOOD.bonus; }
  if (key === 'zombie') { run.rot = 0; if (has('failsafe')) run.failsafeUsed = true; }   // dead: FAILSAFE has nothing to save
  return 'new';
}
function removeMod(key) {
  const run = st.run;
  if (!run.mods.includes(key)) return;
  run.mods = run.mods.filter(k => k !== key);
  delete run.modTier[key];
  if (key === 'buffer') { run.maxInt--; run.integrity = Math.min(run.integrity, run.maxInt); }
  if (key === 'stash') { run.beltSlots--; run.items = run.items.slice(0, run.beltSlots); }
}
const modRoom = key => has(key) || st.run.mods.length < modSlots();

// Add an item to the belt: onto a matching stack (same item + tier, up to F), else a free
// slot. Returns false when there's no room.
function addItem(key, tier = 0) {
  const run = st.run;
  if (has('chromed')) return false;   // CHROMED UP: nowhere to put it (finds turn into credits)
  markSeen(key);
  const stack = run.items.find(s => s.key === key && s.tier === tier && s.n < STACK_MAX);
  if (stack) { stack.n++; return true; }
  if (run.items.length >= run.beltSlots) return false;
  run.items.push({ key, tier, n: 1 });
  return true;
}
const itemRoom = (key, tier) => st.run.items.some(s => s.key === key && s.tier === tier && s.n < STACK_MAX) || st.run.items.length < st.run.beltSlots;
// An item's belt label: [PURGE], or PURGEx3 when stacked (hex count, up to F).
const itemLabel = s => s.n > 1 ? `${ITEMS[s.key].name}x${s.n.toString(16).toUpperCase()}` : `[${ITEMS[s.key].name}]`;
const itemCol = v => rarityCol(v.rarity);   // an item's key color (its name sits on its rarity chip)

// Up to k mod offers ({ key, tier }) from a pool. Mods you have come back as upgrades
// (tiered ones only, until they're maxed). Each offer rolls its tier.
function pickMods(r, pool, k, exclude = []) {
  const ex = exclude.map(o => o.key || o);
  const ok = key => !ex.includes(key) && (!has(key) || (MODS[key].tiers && !modMaxed(key)));
  return shuffle(pool.filter(ok), r).slice(0, k).map(key => ({ key, tier: rollTier(r, MODS[key]) }));
}

const priceOf = o => o.kind === 'repair' ? o.price : Math.round(o.price * TIER_PRICE[o.tier || 0] * (has('haggle') ? 1 - tv('haggle', [0.25, 0.35, 0.5]) : 1));
const SEP = '+ - - - - - - - - - - - - - - - +';

function openShop(node) {
  const run = st.run;
  const r = rngFor(run.seed, 'shop', node.id);
  const itemKeys = has('chromed') ? [] : shuffle(Object.keys(ITEMS), r).slice(0, 3);   // CHROMED UP: no items for sale
  let offers = itemKeys.map(k => ({ kind: 'item', key: k, tier: rollTier(r, ITEMS[k]), price: ITEMS[k].price, sold: false }));
  for (const k of ['coupon', 'haggle']) if (has(k)) modFired(k);   // the market they change opens
  for (const o of pickMods(r, modsOfKind('gen', 'minor'), has('coupon') ? 3 : 2)) offers.push({ kind: 'mod', key: o.key, tier: o.tier, price: MODS[o.key].price, sold: false });
  for (const o of exoticOffer(run.seed, 'shop', node.id, EXOTIC.shopChance)) offers.push({ kind: 'mod', key: o.key, tier: 0, price: MODS[o.key].price, sold: false });
  offers = shuffle(offers, r);   // random order: any slot could be the good one
  offers.push({ kind: 'repair', key: 'repair', price: 20, sold: false });

  // What an offer is: items at their tier; mods as what you'd end up with (upgrades).
  const defOf = o => o.kind === 'item' ? itemView(o.key, o.tier) : o.kind === 'mod' ? modView(o.key, upgradeTo(o.key, o.tier)) : { name: 'REPAIR', desc: 'restore 1 integrity.', rarity: 'common', tier: 0 };
  const buy = o => {
    const price = priceOf(o);
    if (o.sold || !canSpend(price)) return Sound.deny();
    if (o.kind === 'repair' && !canHeal()) return Sound.deny();
    const name = defOf(o).name.toLowerCase();
    const finish = () => { run.credits -= price; if (o.kind !== 'repair') o.sold = true; Sound.buy(); setMsg(`> bought ${name}.`, C.money); };
    // No room: pick one of yours to replace (the purchase goes through after the swap).
    if (o.kind === 'item') { if (!itemRoom(o.key, o.tier)) return openSwap('item', o.key, o.tier, finish); addItem(o.key, o.tier); }
    if (o.kind === 'mod') {
      if (clashWith(o.key)) return openClash(o.key, o.tier, finish);
      if (!modRoom(o.key)) return openSwap('mod', o.key, o.tier, finish);
      addMod(o.key, o.tier);
    }
    if (o.kind === 'repair') heal(1);
    finish();
  };

  let sel = 0;
  const whyNot = o => {
    if (o.sold) return 'sold out.';
    if (o.kind === 'repair' && !canHeal()) return zombie() ? 'no rot to fix.' : 'integrity is full.';
    if (!canSpend(priceOf(o))) return leverage() ? 'past your credit limit.' : 'not enough credits.';
    return null;
  };

  openPanel('BLACK MARKET', (T, B, X) => {
    const now = performance.now();
    T('BLACK MARKET', C.money);
    T(`credits ${run.credits}${leverage() ? `  (limit ${creditFloor()})` : ''}${has('haggle') ? `  (haggle -${Math.round(tv('haggle', [0.25, 0.35, 0.5]) * 100)}%)` : ''}`, run.credits < 0 ? C.danger : C.money);   // LEVERAGE: the limit
    T('');
    offers.forEach((o, k) => {
      const def = defOf(o);
      const isMod = o.kind === 'mod', up = isMod && has(o.key);
      const price = o.sold ? 'SOLD' : `${priceOf(o)}cr`;
      const tag = isMod ? (up ? 'mod+' : 'mod') : o.kind === 'item' ? 'item' : 'svc';   // an item's rarity shows on its name chip
      const col = C.bright;
      X({
        list: true, id: 'offer' + k, onTap: () => { sel = k; Sound.tick(); },
        sel: k === sel, faded: !!whyNot(o),
        badge: isMod ? o.key : null, badgeTier: def.tier, name: def.name + (up ? ' +' : ''), col,
        chip: o.kind === 'item' ? def.rarity : null,
        right: `${tag.padEnd(4)} ${price.padStart(5)}`, rightCol: C.money, rightChips: true,
        tint: o.kind === 'repair' ? C.accent : null,
        reveal: k, revealId: 'offer' + k,
        rarity: o.kind === 'repair' ? null : def.rarity, seenKey: o.kind === 'repair' ? null : o.key,
      });
    });
    T('');
    // Details box for the selected offer (once it has popped in).
    const o = offers[sel], def = defOf(o), why = whyNot(o);
    const shown = now >= st.panelT0 + sel * CONFIG.revealGap;
    // Fixed height (7 rows) so the layout never jumps while offers pop in.
    T(SEP, C.dim);
    if (!shown) { T('...', C.dim); for (let i = 0; i < 6; i++) T(''); }
    else {
      if (o.kind === 'mod') {
        X({ badge: o.key, badgeTier: def.tier });
        X({ text: has(o.key) ? `upgrade: ${tierLabel(modView(o.key))} > ${tierLabel(def)}` : `${tierLabel(def)} mod`, col: C.text, chips: true });
      } else {
        if (o.kind === 'item') X({ text: def.name, chip: def.rarity, bold: true }); else T(def.name, C.bright);
        X({ text: o.kind === 'item' ? `${def.tier ? RARITY[def.rarity].label + ' ' : ''}item // single use` : 'service', col: C.mid, chips: true });
      }
      T(def.tip || def.desc, C.text);   // the short text: long item descs ran off the screen
      if (why) { T(''); T(why, C.dangerDim); T(''); T(''); }
      else X({ box: true, text: 'B U Y', sub: `${priceOf(o)}cr`, id: 'buy', onTap: () => buy(o), minW: 18 });
    }
    T(SEP, C.dim);
    B('[ LEAVE ]', 'leave', leavePanel);
  }, '> the market is open.');
}

// A reward screen: header lines, then a list of mods to pick one from (or skip).
// next: where to go after (default: the map).
function openChoice({ title, col, head = [], options, skipLabel, onSkip, msg, reveal = false, locked = false, next = null, by = null }) {
  let sel = 0;
  const leave = () => next ? (st.transitioning ? null : swapTo(next)) : leavePanel();
  const take = o => {
    if (st.transitioning) return;
    if (o && locked) return Sound.deny();
    if (o) {
      if (clashWith(o.key)) return openClash(o.key, o.tier, () => leave());   // same rule slot: replace it?
      if (!modRoom(o.key)) return openSwap('mod', o.key, o.tier, () => leave());   // full: pick one to replace
      const how = addMod(o.key, o.tier), v = modView(o.key);
      Sound.buy();
      setMsg(how === 'up' ? `> ${v.name.toLowerCase()} upgraded: ${tierLabel(v).toLowerCase()}.` : `> installed ${v.name.toLowerCase()}.`, C.accent);
    } else if (onSkip) onSkip();
    leave();
  };
  openPanel(title, (T, B, X) => {
    const now = performance.now();
    T(title, col);
    if (by) {   // a boss win: the hacker who did it
      const sty = styleOf(by.style);
      for (const ln of logoBlock(by.logo, by.name, sty)) X(ln);
      for (const h of head) T(`breached ${h[0].toLowerCase()}`, C.mid);
    } else for (const h of head) T(h[0], h[1]);
    if (!by) T('');   // (with the logo, the screen is full: no gap)
    if (options.length) T(locked ? 'what you could have had:' : options.length > 1 ? 'choose one mod:' : 'mod found:', C.mid);
    // each offer shows what you'd end up with (a mod you have = an upgrade, "+")
    const viewOf = o => modView(o.key, upgradeTo(o.key, o.tier));
    options.forEach((o, i) => {
      const v = viewOf(o), up = has(o.key), mc = locked ? C.dim : C.bright;
      X({
        list: true, id: 'opt' + i, onTap: () => { sel = i; Sound.tick(); },
        sel: i === sel, badge: o.key, badgeTier: v.tier, name: v.name + (up ? ' +' : ''), col: mc, faded: locked,
        right: up ? `> ${tierLabel(v)}` : tierLabel(v), rightCol: mc, rightChips: true,
        reveal: i, revealId: 'opt' + i, rarity: v.rarity, seenKey: o.key,
      });
    });
    if (options.length) {
      T('');
      const o = options[sel], v = viewOf(o);
      const shown = now >= st.panelT0 + sel * CONFIG.revealGap;
      T(SEP, C.dim);
      if (shown) {
        X({ badge: o.key, badgeTier: v.tier });
        T(v.tip, C.text);
        X({ text: has(o.key) ? `upgrade: ${tierLabel(modView(o.key))} > ${tierLabel(v)}` : !modRoom(o.key) ? `mod slots full (${modSlots()}): you'll swap one` : '', col: has(o.key) ? C.text : C.dangerDim, chips: true });
        if (locked) { T(''); T('skipped: you cannot take it.', C.dangerDim); T(''); }
        else X({ box: true, text: 'T A K E', id: 'take', onTap: () => take(o), minW: 18 });
      } else { T('...', C.dim); T(''); T(''); T(''); T(''); T(''); }
      T(SEP, C.dim);
    }
    T('');
    B(options.length && skipLabel ? skipLabel : '[ CONTINUE ]', 'skip', () => take(null));
  }, msg, { reveal });
}

// PUBLIC NET done: a small starting perk.
function openStartReward(node) {
  const run = st.run;
  const r = rngFor(run.seed, 'choice', node.id);
  openChoice({
    title: 'LINK ESTABLISHED', col: C.accent,
    head: [['you are in. pick a starter perk.', C.text]],
    options: pickMods(r, modsOfKind('minor'), 3),
    skipLabel: '[ SKIP  +15cr ]',
    onSkip: () => { run.credits += 15; run.earned += 15; },
    msg: '> link established.',
  });
}

// A cache's 2 mod offers; now and then one is an exotic (more often with CACHEKEY).
function cacheOptions(r, node) {
  const opts = pickMods(r, modsOfKind('gen', 'minor'), 2);
  const ex = exoticOffer(st.run.seed, 'cache', node.id, has('cachekey') ? tv('cachekey', EXOTIC.cacheKeyChance) : EXOTIC.cacheChance);
  return ex.length ? [opts[0], ex[0]].filter(Boolean) : opts;
}
function openCache(node) {
  const run = st.run;
  const r = rngFor(run.seed, 'cache', node.id);
  const got = [grantLoot(r, 2)];
  for (let i = 0; i < (has('cachekey') ? tv('cachekey', [1, 2, 3]) : 0); i++) got.push(grantLoot(r, 2));
  if (has('cachekey')) modFired('cachekey');
  openChoice({
    title: 'DATA CACHE', col: C.money,
    head: got.map(g => [g, C.bright]),
    options: cacheOptions(r, node),
    skipLabel: '[ SKIP ]',
    msg: '> cache cracked.',
  });
}

function openRepair(node) {
  const run = st.run;
  const r = rngFor(run.seed, 'rest', node.id);
  const before = zombie() ? -(run.rot || 0) : run.integrity;
  heal(CONFIG.repairAmount);
  Sound.buy();
  openChoice({
    title: 'SAFEHOUSE', col: C.accent,
    head: [[zombie() ? `rot -${-(run.rot || 0) - before}` : `integrity +${run.integrity - before}`, C.bright]],
    options: pickMods(r, modsOfKind('minor'), 2),
    skipLabel: '[ SKIP ]',
    msg: '> patched up.',
  });
}

// Corp boss beaten: one corp-specific mod, one general mod, and a random third.
// How the corp you just breached went, for the header line: perfects and ICE hits.
function breachSummary() {
  const c = st.corp || {}, p = c.perfects || 0, n = c.scored || 0, ice = c.ice || 0;
  return { text: `> perfect ${p}/${n}   ice hit ${ice}${ice === 0 ? '  FLAWLESS' : ''}`, col: ice === 0 ? C.accent : C.text };
}

function openReward(node, skipped = false) {
  const run = st.run;
  const r = rngFor(run.seed, 'reward', node.id);
  const def = corpDef(node.corp);
  const corpPick = pickMods(r, def.mods || [], 1);
  const gen = pickMods(r, modsOfKind('gen'), 1, corpPick);
  const third = pickMods(r, modsOfKind('gen', 'minor'), 1, corpPick.concat(gen));
  const options = shuffle(corpPick.concat(gen, third), r);
  openChoice({
    reveal: st.breachReveal,
    title: 'CORP BREACHED', col: C.accent,
    head: skipped ? [[def.name, C.text], ['boss skipped: no rewards.', C.dangerDim]] : [[def.name, C.text]],
    by: skipped ? null : profile(),
    options, locked: skipped,
    skipLabel: skipped ? '[ CONTINUE ]' : '[ SKIP  +20cr ]',
    onSkip: skipped ? null : () => { run.credits += 20; run.earned += 20; Sound.loot(); },
    msg: skipped ? { text: '> skipjack: boss skipped.', col: C.dangerDim } : breachSummary(),
  });
}
