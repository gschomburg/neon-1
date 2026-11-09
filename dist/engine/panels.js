// NeoN+1 engine/panels.js: Panels: rewards, markets, caches...
'use strict';
NEON_FILES.push(['engine/panels.js', 'v14.68']);

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
  st.panelReveal = opts.reveal ? { t0: performance.now() + 100, shown: 0, typed: 0, y: null, lt: 0, done: false, center: 'board', sound: 'climb', rival: opts.rival || null, escaped: !!opts.escaped } : null;
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
  if (key === 'companion') petRoll(run, 'companion');   // COMPANION: a pet for the run (engine/pet.js)
  if (key === 'goat') goatJoins(run);   // MONTY's zonk: your pet is a goat now
  if (run.mods.includes(key)) {
    const was = modTier(key);
    run.modTier[key] = upgradeTo(key, tier);
    if (key === 'buffer') { const d = run.modTier[key] - was; run.maxInt += d; run.integrity += d; }   // each step: +1 more, healed
    if (key === 'wires') wiresUp(was);
    return 'up';
  }
  run.mods.push(key);
  run.modTier[key] = clamp(tier, 0, tierCount(MODS[key]) - 1);
  if (key === 'wires') wiresUp(0);
  if (key === 'buffer') { run.maxInt += run.modTier[key] + 1; run.integrity += run.modTier[key] + 1; }   // +1 common ... +4 legendary
  if (key === 'stash') run.beltSlots++;
  if (key === 'ramdoubler') {   // the belt goes: what you hold is sold for half
    const cash = run.items.reduce((a, s) => a + (ITEMS[s.key].value ? gearValue(s.key, s.tier) : Math.floor(itemView(s.key, s.tier).price * TIER_PRICE[s.tier || 0] * priceScale() * ECON.mods.ramDoublerSell)) * s.n, 0);
    run.items = []; earn(cash, run);
    if (cash) setTimeout(() => setMsg(`> ram doubler: gear sold, +${cash}cr.`, C.money), 400);
  }
  if (key === 'bloodmoney') { earn(BLOOD.bonus, run); }
  if (key === 'zombie') { run.rot = 0; if (has('failsafe')) run.failsafeUsed = true; }   // dead: FAILSAFE has nothing to save
  return 'new';
}
function removeMod(key) {
  const run = st.run;
  if (!run.mods.includes(key)) return;
  run.mods = run.mods.filter(k => k !== key);
  const tierWas = run.modTier[key] || 0;
  delete run.modTier[key];
  if (key === 'buffer') { run.maxInt -= tierWas + 1; run.integrity = Math.min(run.integrity, run.maxInt); }
  if (key === 'stash') { run.beltSlots--; run.items = run.items.slice(0, run.beltSlots); }
}
const modRoom = key => has(key) || st.run.mods.length < modSlots();

// Add an item to the belt: onto a matching stack (same item + tier, up to F), else a free
// slot. Returns false when there's no room.
function addItem(key, tier = 0) {
  const run = st.run;
  if (isLoot(key)) return addLoot(key, tier);   // loot goes in the LOOT bag, not the belt
  if (has('ramdoubler')) return false;   // RAM DOUBLER: nowhere to put it (finds turn into credits)
  markSeen(key);
  const stack = run.items.find(s => s.key === key && s.tier === tier && s.n < STACK_MAX);
  if (stack) { stack.n++; return true; }
  if (run.items.length >= run.beltSlots) return false;
  run.items.push({ key, tier, n: 1 });
  if (ITEMS[key].quest) questGot(key);   // quest gear: its quest moves (engine/quests.js)
  return true;
}
const itemRoom = (key, tier) => isLoot(key) || st.run.items.some(s => s.key === key && s.tier === tier && s.n < STACK_MAX) || st.run.items.length < st.run.beltSlots;
// An item's belt label: [PURGE], or PURGEx3 when stacked (hex count, up to F).
// The belt's short codes (the user, 2026-10-31: high priority: the names were too long once the x2 went on, ENCORE ran
// into FWALL): three letters like the mods. The full name shows everywhere else (the info line, a drag, the trash,
// markets). A gear not listed here: the first three letters of its name.
const ITEM_SHORT = { repeat: 'RPT', shovel: 'SHV', disc: 'DSC', dogtag: 'TAG', leash: 'LSH', bone: 'BNE', muzzle: 'MZL', honey: 'HNY', patch: 'PCH', purge: 'PRG', wall: 'FWL', split: 'SPL', route: 'RTE', warp: 'WRP', allin: 'ALL',
  tunnel: 'TUN', mesh: 'MSH', tilt: 'TLT', shake: 'SHK', frag: 'FRG', rewind: 'RWD', shoe: 'SHO', pass: 'PAS', flare: 'FLR',
  remote: 'RMT', rollup: 'RLP', freeze: 'FRZ', blast: 'BLS', snitch: 'SNT', tithe: 'TTH', anchor: 'ANC', slomo: 'SLO', bees: 'BEE',
  call: 'CAL', call_pops: 'POP', call_b0y: 'B0Y', call_brick: 'BRK', call_null: 'NUL', call_nana: 'NAN', call_dialup: 'DIA', call_baud: 'BAU',
  call_mother: 'MOM', call_root: 'ROO', call_kludge: 'KLG', call_hype: 'HYP', lotto: 'LTO', ping: 'PNG', magnet: 'MAG',
  encore: 'ENC', egg: 'EGG', exorcist: 'EXO', stim: 'STM', zeroday: '0DY', worm: 'WRM', skip: 'SKP', swap: 'SWP', fake: 'FAK', nuke: 'NUK', g0dexe: 'G0D' };
// corrupted software: its code glitches too (data/mods.js glitchName)
Object.defineProperties(ITEM_SHORT, { junkdata: { get: () => glitchName(['JNK'], 1) }, corrupt: { get: () => glitchName(['CRP'], 2) }, badsector: { get: () => glitchName(['BAD'], 3) } });
const itemShort = key => ITEM_SHORT[key] || ITEMS[key].name.replace(/[^A-Z0-9]/g, '').slice(0, 3);
// On the belt: [PCH] for one, PCHx2 for a stack (the count in hex, as before: x10 is xA)
const beltLabel = s => s.n > 1 ? `${itemShort(s.key)}x${s.n.toString(16).toUpperCase()}` : `[${itemShort(s.key)}]`;
const itemLabel = s => s.n > 1 ? `${ITEMS[s.key].name}x${s.n.toString(16).toUpperCase()}` : `[${ITEMS[s.key].name}]`;
const itemCol = v => rarityCol(v.rarity);   // an item's key color (its name sits on its rarity chip)

// ---- LOOT (the user, 2026-10-30): everything that's only worth money (value gear, the PHISH you keep) and quest items.
// It goes in the LOOT bag (run.loot), not the belt: no slots, no limit. Opened from [$] on the rule over the mods
// (engine/loot.js). It sells at a black market; it can't be used.
const isLoot = key => !!(ITEMS[key] && (ITEMS[key].value || ITEMS[key].quest));
function addLoot(key, tier = 0) {
  const run = st.run;
  run.loot = run.loot || [];
  markSeen(key);
  const stack = run.loot.find(s => s.key === key && s.tier === tier);
  if (stack) stack.n++;
  else run.loot.push({ key, tier, n: 1 });
  st.lootNew = { key, tier, at: performance.now() };
  lootQueue(key, tier);   // it piles up over the [$] and feeds in (engine/loot.js)
  if (ITEMS[key].quest && !stack) questGot(key);   // quest gear: its quest moves (engine/quests.js)
  return true;
}
const hasLoot = key => !!(st.run && st.run.loot && st.run.loot.some(s => s.key === key));
// Old saves held loot on the belt: move it to the bag.
function lootMigrate(run) {
  if (!run) return;
  run.loot = run.loot || [];
  for (const s of (run.items || []).filter(s => isLoot(s.key))) {
    const key = ITEMS[s.key].fish && !ITEMS[s.key].bag ? 'phish_' + ITEMS[s.key].rarity : s.key;   // a raw catch (the editor's old Give): its PHISH
    const have = run.loot.find(o => o.key === key && o.tier === (s.tier || 0));
    if (have) have.n += s.n; else run.loot.push({ key, tier: s.tier || 0, n: s.n });
  }
  run.items = (run.items || []).filter(s => !isLoot(s.key));
}

// Up to k mod offers ({ key, tier }) from a pool. Mods you have come back as upgrades
// (tiered ones only, until they're maxed). Each offer rolls its tier.
function pickMods(r, pool, k, exclude = []) {
  const ex = exclude.map(o => o.key || o);
  const ok = key => !ex.includes(key) && (!has(key) || (MODS[key].tiers && !modMaxed(key)));
  let keys = shuffle(pool.filter(ok), r);
  if (keys.includes('wires') && has('wires') && r() < WIRES_PULL) keys = ['wires'].concat(keys.filter(x => x !== 'wires'));   // BOX OF WIRES: you notice them now
  return keys.slice(0, k).map(key => ({ key, tier: rollTier(r, MODS[key]) }));
}
const WIRES_PULL = 0.4;   // while you carry a BOX OF WIRES, the chance an offer from a pool it's in is one (data/mods.js wires)

const priceOf = o => o.free ? 0 : Math.round((sectorHas('firesale') ? 1 - ECON.events.fireSale : 1) * (o.kind === 'repair' ? o.price : o.price * TIER_PRICE[o.tier || 0] * (has('haggle') ? 1 - tv('haggle', ECON.haggle) : 1) * priceScale()));   // (priceScale: data/economy.js)
const SEP = '+ - - - - - - - - - - - - - - - +';

// What a market pays for one of a gear stack: value gear (DUDS ... WALLET) its worth, the rest a share of its price.
function gearValue(key, tier = 0) {
  if (key === 'bond') return earnInt(ECON.gear.bond) * ((st.run && st.run.sector || 0) + 1);
  if (ITEMS[key].fish) return fishWorth(key);   // a fish (ECON.fish, by rarity)
  if (ITEMS[key].value) return earnInt(ECON.gear[key]);
  return Math.max(1, Math.floor(ITEMS[key].price * TIER_PRICE[tier || 0] * priceScale() * ECON.gear.sellPct));
}
const marketRerolls = () => 1 + legacyLv('restock');   // per market (RESTOCK on THE BOARD: up to 3)
const shopGear = () => Object.keys(ITEMS).filter(k => !ITEMS[k].value && !ITEMS[k].find && (!ITEMS[k].corp || legacyLv('bossloot')) && gearAllowed(k));   // value gear is loot only; boss gear comes from its boss (BOSS LOOT on THE BOARD: markets too)
// How often a gear shows up (loot and markets): normal gear by its rarity, value gear its own (ECON.drop).
const gearWeight = k => { const w = ECON.drop[ITEMS[k].value ? k : ITEMS[k].rarity]; return w == null ? 1 : w; };
// A market's gear: by rarity, with a plain CALL likelier (CALL_ODDS.shop, engine/hackers.js).
const shopWeight = k => gearWeight(k) * (k === 'call' ? CALL_ODDS.shop : 1) * (st.run && st.run.quest === 'had3s' && (k === 'tunnel' || k === 'mesh') ? 4 : 1);   // (HAD3S: TUNNEL and MESH turn up more: the user, 2026-11-06)
// One key, picked by weight.
function pickWeighted(keys, w, r) {
  let x = r() * keys.reduce((a, k) => a + w(k), 0);
  for (const k of keys) if ((x -= w(k)) < 0) return k;
  return keys[keys.length - 1];
}

// A market's offers: roll 0 is the market as it opens; each reroll is a new roll of the same seed (openShop; the editor's
// loot viewer)
function shopRoll(node, n) {
  const run = st.run;
  const r = n ? rngFor(run.seed, 'shop', node.id, 'reroll', n) : rngFor(run.seed, 'shop', node.id);
  const itemKeys = [], qm = questMarket(node);   // 3 gear, picked by weight (rarer gear shows up less); RAM DOUBLER: no gear for sale
  if (qm && !has('ramdoubler')) itemKeys.push('patch');   // (the H3AV3N seed's sector 1: PATCH always, then two of its list: engine/heaven.js QUEST_STOCK)
  for (let pool = has('ramdoubler') ? [] : qm ? QUEST_STOCK.gear.filter(k => ITEMS[k]) : shopGear(); itemKeys.length < 3 && pool.length;) { const k = pickWeighted(pool, shopWeight, r); itemKeys.push(k); pool = pool.filter(o => o !== k); }
  let offers = itemKeys.map(k => ({ kind: 'item', key: k, tier: rollTier(r, ITEMS[k]), price: ITEMS[k].price, sold: false }));
  // More than one copy now and then (commoner gear more often; ECON.stock). Its own roll: the rest of the market stays the same.
  const rs = n ? rngFor(run.seed, 'shop', node.id, 'stock', n) : rngFor(run.seed, 'shop', node.id, 'stock');
  for (const o of offers) { o.n = 1; const p = ECON.stock[ITEMS[o.key].rarity] || 0; while (o.n < ECON.stock.max && rs() < p) o.n++; if (qm && o.key === 'patch') o.n = Math.max(o.n, QUEST_STOCK.patches); }
  const qMods = qm ? pickMods(r, QUEST_STOCK.mods, QUEST_STOCK.mods.length) : [];   // (BUFFER, unless you can't take it again)
  for (const o of qMods.concat(pickMods(r, modsFound('gen', 'minor'), (has('coupon') ? 3 : 2) - qMods.length, qMods))) offers.push({ kind: 'mod', key: o.key, tier: o.tier, price: MODS[o.key].price, sold: false });
  const hvx = node.heaven === 'shop' && n >= 1 ? heavenExotic(r) : null;   // heaven's market: a reroll brings an exotic (engine/heaven.js)
  if (hvx) offers.push({ kind: 'mod', key: hvx, tier: 0, price: MODS[hvx].price, sold: false });
  else if (!qm) for (const o of exoticOffer(run.seed, 'shop', n ? node.id + 'r' + n : node.id, EXOTIC.shopChance)) offers.push({ kind: 'mod', key: o.key, tier: 0, price: MODS[o.key].price, sold: false });
  if (discDrops(rngFor(run.seed, 'shop', node.id, 'disc', n), 'shop')) offers.push({ kind: 'item', key: 'disc', tier: 0, price: ITEMS.disc.price, sold: false, n: 1 });   // the quest (engine/quests.js)
  offers = shuffle(offers, r);   // random order: any slot could be the good one
  if (has('coupon') && offers.length) offers[Math.floor(r() * offers.length)].free = true;   // COUPON: one offer is free
  return offers;
}
const SHOP_LIST_ROWS = 9;   // a market's list area, at most (it scrolls past that)
function openShop(node) {
  const run = st.run;
  const roll = n => shopRoll(node, n);
  for (const k of ['coupon', 'haggle']) if (has(k)) modFired(k);   // the market they change opens
  const repair = { kind: 'repair', key: 'repair', price: costInt(ECON.repair), sold: false };
  // a market you go back into (the user, 2026-10-31) is as you left it: run.shops keeps its offers and rerolls
  const kept = (run.shops = run.shops || {})[node.id];
  let offers = kept ? kept.offers : roll(0).concat([repair]), rolls = kept ? kept.rolls : 0, view = 'buy', sel = 0, sellSel = 0;
  const keep = () => { run.shops[node.id] = { offers, rolls }; questShop(node, offers); };   // (the DISC for sale: POPS calls, engine/quests.js)
  keep();
  const rerollsLeft = () => marketRerolls() - rolls;
  const rerollPrice = () => costInt(ECON.reroll) * (rolls + 1);   // more each time, in the same market
  const reroll = () => {
    if (st.transitioning) return;
    const price = rerollPrice();
    if (rerollsLeft() <= 0 || !canSpend(price)) return Sound.deny();
    run.credits -= price; rolls++;
    offers = roll(rolls).concat([repair]); keep();
    sel = offers.length;   // (the selection stays on the REROLL row: it's the last row)
    st.revealed = new Set(); st.panelT0 = performance.now() + CONFIG.revealDelay;   // the new offers come in again, one row at a time
    Sound.whoosh(); setMsg(`> restocked. -${price}cr.`, C.money);
  };
  // What you can sell: your LOOT first, then your gear. Each row: { s (the stack), list (the array it's in) }.
  const sellRows = () => (run.loot || []).filter(s => !ITEMS[s.key].quest).map(s => ({ s, list: run.loot }))
    .concat((run.loot || []).filter(s => ITEMS[s.key].quest).map(s => ({ s, list: run.loot })))
    .concat(run.items.map(s => ({ s, list: run.items })));
  const sell = i => {
    const row = sellRows()[i], s = row && row.s;
    if (!s || st.transitioning) return Sound.deny();
    if (ITEMS[s.key].quest) { setMsg('> not for sale. POPS wants that.', C.rep); return Sound.deny(); }
    if (ITEMS[s.key].nosell) { setMsg('> not for sale.', C.mid); return Sound.deny(); }   // (G0D.exe)
    const cr = gearValue(s.key, s.tier), name = ITEMS[s.key].name.toLowerCase(), value = !!ITEMS[s.key].value;
    s.n--; if (s.n <= 0) row.list.splice(row.list.indexOf(s), 1);
    st.selItem = -1; st.hoverItem = -1;
    run.credits += cr; if (value) run.earned += cr;   // (only loot counts as earned: buying and selling back isn't)
    sellSel = Math.min(sellSel, Math.max(0, sellRows().length - 1));
    Sound.buy(); setMsg(`> sold ${name}. +${cr}cr.`, C.money);
  };
  const sellAll = () => {
    if (st.transitioning) return;
    const keep = (run.loot || []).filter(s => ITEMS[s.key].quest), sold = (run.loot || []).filter(s => !ITEMS[s.key].quest);
    if (!sold.length) return Sound.deny();
    let cr = 0, n = 0;
    for (const s of sold) { cr += gearValue(s.key, s.tier) * s.n; n += s.n; }
    run.loot = keep; earn(cr, run);
    sellSel = 0; sellArea.top = 0;
    Sound.buy(); setTimeout(() => Sound.loot(), 120); setMsg(`> sold all loot (${n}). +${cr}cr.`, C.money);
  };
  st.shop = { node: node.id, get offers() { return offers; }, priceOf, buyAt: k => buy(offers[k]), reroll, rerollsLeft, rerollPrice, sellAt: sell, sellAll };   // (read by tools/checks/econsim.js and engine/g0dexe.js)

  // What an offer is: gear at its tier; mods as what you'd end up with (upgrades).
  const defOf = o => o.kind === 'item' ? itemView(o.key, o.tier) : o.kind === 'mod' ? modView(o.key, o.sold && o.got != null ? o.got : upgradeTo(o.key, o.tier))   // (sold: what you bought, not the next step up: the user's bug)
    : o.kind === 'reroll' ? { name: 'REROLL', desc: `new offers. ${rerollsLeft()} left here.`, rarity: 'common', tier: 0 }
    : { name: 'REPAIR', desc: 'restore 1 integrity.', rarity: 'common', tier: 0 };
  const buy = o => {
    const price = priceOf(o);
    if (o.sold || !canSpend(price)) return Sound.deny();
    if (o.kind === 'repair' && !canHeal()) return Sound.deny();
    const name = defOf(o).name.toLowerCase();
    const finish = () => { statBuy(o, price); run.credits -= price; o.free = false; if (o.kind === 'mod') o.got = modTier(o.key); if (o.kind === 'item' ? --o.n <= 0 : o.kind !== 'repair') o.sold = true; Sound.buy(); setMsg(`> bought ${name}.`, C.money); };
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

  const whyNot = o => {
    if (o.kind === 'reroll') return rerollsLeft() <= 0 ? 'no rerolls left in this market.' : !canSpend(rerollPrice()) ? (leverage() ? 'past your credit limit.' : 'not enough credits.') : null;
    if (o.sold) return 'sold out.';
    if (o.kind === 'repair' && !canHeal()) return zombie() ? 'no rot to fix.' : 'integrity is full.';
    if (!canSpend(priceOf(o))) return leverage() ? 'past your credit limit.' : 'not enough credits.';
    return null;
  };

  // The REROLL row (the last row of the buy list; not one of the offers, so st.shop.offers / econsim never see it)
  const rerollRow = { kind: 'reroll', key: 'reroll' };
  const rowsOf = () => offers.concat([rerollRow]);
  // Both modes share one layout: the list area is listRows() tall, then the details box (7 rows), then the nav buttons,
  // so [ SELL ] / [ BUY ] and [ LEAVE ] sit in the same spots on both.
  // At most SHOP_LIST_ROWS: past that the list scrolls (the user, 2026-11-06: 10 rows with COUPON CUTTER pushed LEAVE
  // into the loot bar on a phone; engine/textboard.js doesn't squeeze, see CLAUDE.md "Screen space").
  const listRows = () => Math.min(SHOP_LIST_ROWS, Math.max(rowsOf().length, 1 + run.beltSlots));
  const sellArea = { top: 0 }, buyArea = { top: 0 };   // the lists scroll (a big LOOT bag; a long market)
  const pad = (T, used) => { for (let i = used; i < listRows(); i++) T(''); };
  const nav = B => {
    if (view === 'buy') B('[ SELL WARES ]', 'sellv', () => { view = 'sell'; sellSel = 0; sellArea.top = 0; Sound.ui(); }, !sellRows().length);
    else B('[ BUY WARES  ]', 'buyv', () => { view = 'buy'; Sound.ui(); });
    B(node.exit ? '[ JACK OUT ]' : '[ LEAVE ]', 'leave', node.exit ? () => { if (!st.transitioning) swapTo(() => sectorClear(false)); } : leavePanel);   // HEAD FIRST's exit market: the sector is clear
  };

  // SELL: your LOOT and your gear, what the market pays for one of each (the same look as the buy list: a type tag and
  // the price). A long list scrolls.
  const drawSell = (T, B, X) => {
    // SELL ALL LOOT (the user, 2026-11-03): every loot stack but quest items, in one go
    const allCr = (run.loot || []).reduce((a, s) => a + (ITEMS[s.key].quest ? 0 : gearValue(s.key, s.tier) * s.n), 0);
    X({ gap: 2, row: [{ text: 'sell:', col: C.mid }, { text: allCr ? `[ ALL LOOT +${allCr}cr ]` : '[ ALL LOOT ]', id: 'sellall', disabled: !allCr, onTap: sellAll }] });
    const rows = sellRows();
    const items = rows.map(({ s, list }, i) => {
      const v = itemView(s.key, s.tier), q = ITEMS[s.key].quest, tag = list === run.loot ? 'loot' : 'gear';
      return { list: true, id: 'sl' + i, onTap: () => { sellSel = i; Sound.tick(); }, sel: i === sellSel,
        name: v.name + (s.n > 1 ? ' x' + s.n : ''), gear: s.key, gearTier: s.tier, col: C.bright,   // (loot too: its code chip, then its name, like the buy list)
        right: q ? 'QUEST  keep' : `${tag.padEnd(4)} ${(gearValue(s.key, s.tier) + 'cr').padStart(5)}`, rightCol: q ? C.rep : C.money, rightChips: true };
    });
    if (!rows.length) { T('nothing to sell.', C.dim); pad(T, 2); }
    else { scrollFollow(sellArea, sellSel, items.length, listRows() - 1); scrollArea(X, T, sellArea, items, listRows() - 1, 'sla'); }
    T('');
    T(SEP, C.dim);
    const s = rows[sellSel] && rows[sellSel].s;
    if (s) {
      const v = itemView(s.key, s.tier);
      X({ gearHead: s.key, gearTier: s.tier, text: v.name });
      T(v.tip || v.desc, C.text);
      T('');
      if (ITEMS[s.key].quest) X({ box: true, text: 'S E L L', sub: 'POPS wants it', id: 'sell', onTap: () => sell(sellSel), minW: 18, disabled: true });
      else X({ box: true, text: 'S E L L', sub: `+${gearValue(s.key, s.tier)}cr`, id: 'sell', onTap: () => sell(sellSel), minW: 18 });
    } else for (let i = 0; i < 7; i++) T('');
    T(SEP, C.dim);
    nav(B);
  };

  openPanel('BLACK MARKET', (T, B, X) => {
    const now = performance.now();
    T('BLACK MARKET', C.money);
    T(`credits ${run.credits}${leverage() ? `  (limit ${creditFloor()})` : ''}${has('haggle') ? `  (haggle -${Math.round(tv('haggle', ECON.haggle) * 100)}%)` : ''}`, run.credits < 0 ? C.danger : C.money);   // LEVERAGE: the limit
    T('');
    if (view === 'sell') return drawSell(T, B, X);
    const rows = rowsOf(), items = [];
    rows.forEach((o, k) => {
      const def = defOf(o);
      const isMod = o.kind === 'mod', up = isMod && has(o.key), rr = o.kind === 'reroll';
      const price = rr ? (rerollsLeft() > 0 ? `${rerollPrice()}cr` : 'DONE') : o.sold ? 'SOLD' : o.free ? 'FREE' : `${priceOf(o)}cr`;
      const bag = o.kind === 'item' && (ITEMS[o.key].quest || ITEMS[o.key].value || ITEMS[o.key].bag);   // (the DISC and value gear go in the LOOT bag: the user, 2026-11-06)
      const tag = isMod ? (up ? 'mod+' : 'mod') : bag ? 'loot' : o.kind === 'item' ? 'gear' : 'svc';   // gear's rarity shows on its name chip
      const col = C.bright;
      items.push({
        list: true, id: 'offer' + k, onTap: () => { sel = k; Sound.tick(); },
        sel: k === sel, faded: !!whyNot(o),
        badge: isMod ? o.key : null, badgeTier: def.tier, name: rr ? 'REROLL' + (rerollsLeft() > 0 ? ' x' + rerollsLeft() : '') : def.name + (up ? ' +' : '') + (o.n > 1 ? ' x' + o.n : ''), col,   // x2: copies left
        gear: o.kind === 'item' ? o.key : null, gearTier: o.tier,   // (gear: its code chip, then its name)
        right: `${tag.padEnd(4)} ${price.padStart(5)}`, rightCol: C.money, rightChips: true,
        tint: o.kind === 'repair' || rr ? C.accent : null,
        reveal: k, revealId: 'offer' + k,
        rarity: o.kind === 'repair' || rr ? null : def.rarity, seenKey: o.kind === 'repair' || rr ? null : o.key,
      });
    });
    if (items.length <= listRows()) { items.forEach(it => X(it)); pad(T, items.length); }
    else { scrollFollow(buyArea, sel, items.length, listRows()); scrollArea(X, T, buyArea, items, listRows(), 'bla'); }
    T('');
    // Details box for the selected offer (once it has popped in).
    sel = Math.min(sel, rowsOf().length - 1);
    const o = rowsOf()[sel], def = defOf(o), why = whyNot(o);
    const shown = now >= st.panelT0 + sel * CONFIG.revealGap;
    // Fixed height (7 rows) so the layout never jumps while offers pop in.
    T(SEP, C.dim);
    if (!shown) { T('...', C.dim); for (let i = 0; i < 6; i++) T(''); }
    else {
      if (o.kind === 'reroll') { T('REROLL', C.bright); T('service', C.mid); }
      else if (o.kind === 'mod') {
        X({ badge: o.key, badgeTier: def.tier });
        X({ text: has(o.key) ? `upgrade: ${tierLabel(modView(o.key))} > ${tierLabel(def)}` : `${tierLabel(def)} mod`, col: C.text, chips: true });
      } else {
        if (o.kind === 'item') X({ gearHead: o.key, gearTier: o.tier, text: def.name + (o.n > 1 ? ` x${o.n}` : '') }); else T(def.name, C.bright);
        X({ text: o.kind !== 'item' ? 'service' : ITEMS[o.key].quest ? 'quest loot // for POPS' : ITEMS[o.key].value ? 'loot // sell it' : `${def.tier ? RARITY[def.rarity].label + ' ' : ''}gear // single use`, col: C.mid, chips: true });
      }
      T(def.tip || def.desc, C.text);   // the short text: long gear descs ran off the screen
      if (why) { T(''); T(why, C.dangerDim); T(''); T(''); }
      else if (o.kind === 'reroll') X({ box: true, text: 'R E R O L L', sub: `${rerollPrice()}cr`, id: 'buy', onTap: reroll, minW: 18 });
      else X({ box: true, text: 'B U Y', sub: o.free ? 'FREE' : `${priceOf(o)}cr`, id: 'buy', onTap: () => buy(o), minW: 18 });
    }
    T(SEP, C.dim);
    // SELL (the other mode) over LEAVE (REROLL is a row in the list, 1 a market, more with RESTOCK)
    nav(B);
  }, '> the market is open.');
}

// A reward screen: header lines, then a list of mods to pick one from (or skip).
// next: where to go after (default: the map).
function openChoice({ title, col, head = [], extra = [], onTake = null, options, skipLabel, onSkip, msg, reveal = false, locked = false, next = null, by = null, rival = null, escaped = false, first = null, more = [] }) {
  let sel = 0, picked = false;
  // first: { key, art, tell }: FIRST BREACH shows under the header (title, logos, breached line) and holds the reveal;
  // SEE THE CORE swaps it for the rewards, which build in under the header the same way (buildReveal's pre)
  let firstUp = !!(first && reveal), headN = 0;
  const fanfare = () => { flash(C.money, 0.25, 0.7); shake(5, 0.35); Sound.bossWin(); fireworkShow(6, 240, 'panel'); };
  const toCore = () => {
    if (!firstUp) return;
    firstUp = false; Sound.ui();
    const rv = st.panelReveal;
    if (rv) Object.assign(rv, { t0: performance.now(), pre: headN, shown: headN, done: false, hold: false, whole: false, firstPop: null, rival: null, logoOut: !!by });
    st.panelT0 = Infinity; st.revealed = new Set();   // the offers pop as their lines come in
  };
  st.breachRival = null; st.breachEscaped = false;
  const leave = () => next ? (st.transitioning ? null : swapTo(next)) : leavePanel();
  st.choice = { title, options: options.slice(), skip: !!skipLabel, take: o => take(o) };   // (read by tools/checks/econsim.js)
  const take = o => {
    if (st.transitioning) return;
    if (o && locked) return Sound.deny();
    if (!picked && !locked && options.length) { picked = true; statPick(title, options, o); }   // play stats
    if (o && !locked && onTake) onTake(o);   // (a cache: its pick's taken, no going back in for another)
    if (o && o.kind === 'gear') {   // a stack of gear (corp boss rewards): onto the belt, all of it
      const v = itemView(o.key, o.tier);
      if (has('ramdoubler')) {   // RAM DOUBLER: no belt, so it's sold
        const cr = gearValue(o.key, o.tier) * o.n;
        earn(cr);
        Sound.buy(); setMsg(`> ram doubler: ${v.name.toLowerCase()} x${o.n} sold, +${cr}cr.`, C.money);
        return leave();
      }
      const done = () => { for (let k = 1; k < o.n; k++) addItem(o.key, o.tier); Sound.buy(); setMsg(`> took ${v.name.toLowerCase()} x${o.n}.`, C.accent); leave(); };
      if (!itemRoom(o.key, o.tier)) return openSwap('item', o.key, o.tier, done);   // full: pick one to replace
      addItem(o.key, o.tier);
      return done();
    }
    if (o) {
      if (clashWith(o.key)) return openClash(o.key, o.tier, () => leave());   // same rule slot: replace it?
      if (!modRoom(o.key)) return openSwap('mod', o.key, o.tier, () => leave());   // full: pick one to replace
      const how = addMod(o.key, o.tier), v = modView(o.key);
      Sound.buy();
      setMsg(how === 'up' ? `> ${v.name.toLowerCase()} upgraded: ${tierLabel(v).toLowerCase()}.` : `> installed ${v.name.toLowerCase()}.`, C.accent);
    } else if (onSkip) onSkip();
    leave();
  };
  openPanel(title, (T, B, X, lines) => {
    const now = performance.now();
    T(title, col);
    if (by) {   // a boss win: the hacker who did it
      const sty = styleOf(by.style), mine = logoBlock(by.logo, by.name, sty);
      // a rival breach (the reveal, engine/screens.js): each row also has the rival's version, both the same width
      const theirs = rival && HACKERS[rival] ? logoBlock(rival, hkName(rival), hkStyle(rival)) : null;
      const w = Math.max(...mine.concat(theirs || []).map(l => l.text.length));
      const fit = t => { const e = w - t.length, a = Math.floor(e / 2); return ' '.repeat(a) + t + ' '.repeat(e - a); };
      // the logo's art (all but its name line) goes once the rewards come in (buildReveal, engine/screens.js: LOGO_OUT);
      // after the reveal, or with none, only the name line is left (the user, 2026-11-05: the screen was too tall)
      const keepArt = firstUp || (reveal && st.panelReveal && !st.panelReveal.done);
      mine.forEach((ln, k) => {
        const art = k < mine.length - 1;
        if (art && !keepArt) return;
        X(Object.assign({}, ln, { text: fit(ln.text), logoRow: k, logoArt: art, rivalRow: theirs ? Object.assign({}, theirs[k], { text: fit(theirs[k].text) }) : null }));
      });
      for (const h of head) T(`breached ${h[0].toLowerCase()}`, C.mid);
    } else for (const h of head) T(h[0], h[1]);
    for (const h of extra) T(h[0], h[1]);   // (more lines under it: the H3AV3N ending's rewards)
    if (firstUp) {   // FIRST BREACH: the corp's logo and its tell, then on to the rewards
      headN = lines.length;
      T('');
      X({ text: 'F I R S T   B R E A C H', col: C.money, bold: true, onShow: fanfare });
      T('');
      const aw = Math.max(0, ...first.art.map(l => l.length));
      for (const l of first.art) T(l.padEnd(aw), C.accent);
      T('');
      for (const l of wrapText('tell: ' + first.tell, 34)) T(l, C.accent);
      T('logged in your codex.', C.dim);
      T('');
      X({ box: true, text: 'S E E   T H E   C O R E', sub: '- your rewards -', id: 'core', onTap: toCore, minW: 30 });
      return;
    }
    if (!by) T('');   // (with the logo, the screen is full: no gap)
    if (options.length) T(locked ? 'what you could have had:' : options.length > 1 ? (options.some(o => o.kind === 'gear') ? 'choose one:' : 'choose one mod:') : 'mod found:', C.mid);
    // each offer shows what you'd end up with (a mod you have = an upgrade, "+")
    const viewOf = o => o.kind === 'gear' ? itemView(o.key, o.tier) : modView(o.key, upgradeTo(o.key, o.tier));
    options.forEach((o, i) => {
      const v = viewOf(o), up = o.kind !== 'gear' && has(o.key), mc = locked ? C.dim : C.bright;
      if (o.kind === 'gear') {   // a stack of gear: its name on its rarity chip, xN
        X({ list: true, id: 'opt' + i, onTap: () => { sel = i; Sound.tick(); }, sel: i === sel, name: `${v.name} x${o.n}`, gear: o.key, gearTier: o.tier, col: mc, faded: locked,
          right: `${(v.tier ? RARITY[v.rarity].label : '').padStart(6)} gear`, rightCol: mc, reveal: i, revealId: 'opt' + i, rarity: v.rarity, seenKey: o.key });
        return;
      }
      X({
        list: true, id: 'opt' + i, onTap: () => { sel = i; Sound.tick(); },
        sel: i === sel, badge: o.key, badgeTier: v.tier, name: v.name + (up ? ' +' : ''), col: mc, faded: locked,
        right: `${((up ? '> ' : '') + tierLabel(v)).padStart(6)} ${up ? 'mod+' : 'mod '}`, rightCol: mc, rightChips: true,   // says it's a mod (mod+: an upgrade), like the market
        reveal: i, revealId: 'opt' + i, rarity: v.rarity, seenKey: o.key,
      });
    });
    if (options.length) {
      if (!by) T('');   // with the logo (LOGO_H rows) there's no room for the gaps
      const o = options[sel], v = viewOf(o);
      const shown = now >= st.panelT0 + sel * CONFIG.revealGap;
      T(SEP, C.dim);
      if (shown && o.kind === 'gear') {
        const room = itemRoom(o.key, o.tier) && !has('ramdoubler');
        X({ gearHead: o.key, gearTier: o.tier, text: `${v.name} x${o.n}` });
        T(v.tip || v.desc, C.text);
        X({ text: has('ramdoubler') ? 'ram doubler: it gets sold.' : room ? `gear // ${o.n} uses` : "gear slots full: you'll swap one", col: room ? C.mid : C.dangerDim, chips: true });
        if (locked) { T(''); T('skipped: you cannot take it.', C.dangerDim); T(''); }
        else X({ box: true, text: 'T A K E', id: 'take', onTap: () => take(o), minW: 18 });
      } else if (shown) {
        X({ badge: o.key, badgeTier: v.tier });
        T(v.tip, C.text);
        X({ text: has(o.key) ? `upgrade: ${tierLabel(modView(o.key))} > ${tierLabel(v)}` : !modRoom(o.key) ? `mod slots full (${modSlots()}): you'll swap one` : '', col: has(o.key) ? C.text : C.dangerDim, chips: true });
        if (locked) { T(''); T('skipped: you cannot take it.', C.dangerDim); T(''); }
        else X({ box: true, text: 'T A K E', id: 'take', onTap: () => take(o), minW: 18 });
      } else { T('...', C.dim); T(''); T(''); T(''); T(''); T(''); }
      T(SEP, C.dim);
    }
    if (!by) T('');
    for (const m of more) B(m.label, m.id, m.onTap);   // more buttons (the safehouse's [ WORKBENCH ])
    B(options.length && skipLabel ? skipLabel : '[ CONTINUE ]', 'skip', () => take(null));
  }, msg, { reveal, rival, escaped });
  if (by && !firstUp && st.panelReveal) st.panelReveal.logoOut = true;   // (FIRST BREACH: once SEE THE CORE is tapped, toCore)
  if (firstUp && st.panelReveal) Object.assign(st.panelReveal, { hold: true, whole: true });   // the header comes back after the rewards, not before;
  // whole: no header yet, so FIRST BREACH centers on the whole screen (the user: PARCELNET pushed it off the bottom), then glides down to the rewards
}

// PUBLIC NET done: a small starting perk.
function openStartReward(node) {
  const run = st.run;
  const r = rngFor(run.seed, 'choice', node.id);
  openChoice({
    title: 'LINK ESTABLISHED', col: C.accent,
    head: [['you are in. pick a starter perk.', C.text]],
    options: run.tutorial ? [{ key: 'tracer', tier: 0 }] : pickMods(r, legacyLv('starter') ? modsFound('minor', 'gen') : modsOfKind('minor'), 3 + legacyLv('picky')),   // the training run: TRACER; THE BOARD: STARTER POOL (general mods too), SHORTLIST (4)
    skipLabel: `[ SKIP  +${earnInt(ECON.skip.starter)}cr ]`,
    onSkip: () => { const cr = earnInt(ECON.skip.starter); earn(cr, run); },
    msg: '> link established.',
  });
}

// A cache's 2 mod offers; now and then one is an exotic (more often with CACHEKEY).
function cacheOptions(r, node) {
  const opts = pickMods(r, modsFound('gen', 'minor'), 2);
  const ex = exoticOffer(st.run.seed, 'cache', node.id, has('cachekey') ? tv('cachekey', EXOTIC.cacheKeyChance) : EXOTIC.cacheChance);
  return ex.length ? [opts[0], ex[0]].filter(Boolean) : opts;
}
function openCache(node) {
  const run = st.run;
  const r = rngFor(run.seed, 'cache', node.id);
  const again = !!(run.caches = run.caches || {})[node.id], quest = questMarket(node);   // going back in: the loot's gone, the pick is still there
  run.caches[node.id] = run.caches[node.id] || 'open';
  const got = again ? ['already looted.'] : [grantLoot(r, 2)];   // (the H3AV3N seed's sector 1: as if you had the CACHE KEY, and better picks: engine/heaven.js)
  if (!again) for (let i = 0; i < (has('cachekey') ? tv('cachekey', ECON.modx.cachekey) : quest ? 1 : 0); i++) got.push(grantLoot(r, 2));
  if (has('cachekey') && !again) modFired('cachekey');
  // and now and then a pile of loot for the bag (ECON.loot.cache: as many as a sector boss)
  { const lr = rngFor(run.seed, 'cacheloot', node.id), [lo, hi] = ECON.loot.sector;
    if (!again && lr() < ECON.loot.cache) { const l = dropLoot(lr, lo + Math.floor(lr() * (hi - lo + 1))); got.push('+ loot: ' + l.join(', ')); } }
  openChoice({
    title: 'DATA CACHE', col: C.money,
    head: got.map(g => [g, again ? C.dim : C.bright]),
    options: quest ? questCacheOptions(r) : cacheOptions(r, node),
    onTake: () => { run.caches[node.id] = 'taken'; },
    skipLabel: '[ SKIP ]',
    msg: '> cache cracked.',
  });
}

function openRepair(node) {
  const run = st.run;
  const r = rngFor(run.seed, 'rest', node.id);
  if (!node.rested) {   // heal once: back from the WORKBENCH it doesn't heal again
    const before = zombie() ? -(run.rot || 0) : run.integrity;
    heal(CONFIG.repairAmount);
    Sound.buy();
    node.rested = zombie() ? `rot -${-(run.rot || 0) - before}` : `integrity +${run.integrity - before}`;
    if (benchOpen() && !st.mp) node.comps = benchArrive();   // the WORKBENCH: it leaves you a few components
  }
  openChoice({
    title: 'SAFEHOUSE', col: C.accent,
    head: [[node.rested, C.bright]].concat(node.comps ? [[`+${node.comps.length} components: ${node.comps.join(' ')}`, C.money]] : []),
    next: benchOpen() && !st.mp ? () => openBench(node) : null,   // the WORKBENCH: after the pick, straight to the bench (engine/bench.js)
    options: pickMods(r, modsOfKind('minor'), 2),
    skipLabel: '[ SKIP ]',
    msg: '> patched up.',
  });
}

// Corp boss beaten: one corp-specific mod, one general mod, and a random third.
// How the corp you just breached went, for the header line: perfects and ICE hits.
// A rival took the corp's last node (engine/hackers.js hkSteal): a line under the corp's name says so.
const escapedLine = () => st.breachEscaped && st.breachRival && HACKERS[st.breachRival] ? [[`${hkName(st.breachRival).toLowerCase()} escaped. no win.`, C.danger]] : [];
function breachSummary() {
  const c = st.corp || {}, p = c.perfects || 0, n = c.scored || 0, ice = c.ice || 0;
  return { text: `> perfect ${p}/${n}   ice hit ${ice}${ice === 0 ? '  FLAWLESS' : ''}`, col: ice === 0 ? C.accent : C.text };
}

// A boss reward's gear stack (the random third pick, ECON.reward): shop gear picked by rarity (weight), with more
// of the commoner ones (min / max by rarity). Rare and epic gear rolls its tier; scrap and common come plain.
const GEAR_STEP = { scrap: 0, common: 1, rare: 2, epic: 3 };
function rewardGear(r) {
  const R = ECON.reward, pool = shopGear().filter(k => GEAR_STEP[ITEMS[k].rarity] != null);
  const key = pickWeighted(pool, k => R.weight[GEAR_STEP[ITEMS[k].rarity]] || 0, r), s = GEAR_STEP[ITEMS[key].rarity];
  return { kind: 'gear', key, tier: s >= 2 ? rollTier(r, ITEMS[key]) : 0, n: R.min[s] + Math.floor(r() * (R.max[s] - R.min[s] + 1)) };
}
// A corp's boss reward picks (openReward; the editor's loot viewer)
function rewardOptions(node) {
  const run = st.run, r = rngFor(run.seed, 'reward', node.id), def = corpDef(node.corp);
  // a corp with a prize (MONTY: the C.A.R. or the GOAT, by how its boss went) offers that one (nothing if you have it)
  const prize = def.prize && st.corp && st.corp.def === def ? def.prize(st.corp) : null;
  const corpPick = def.gear ? [{ kind: 'gear', key: def.gear.key, tier: def.gear.tier || 0, n: def.gear.n || 1 }] : prize ? (has(prize) ? [] : [{ key: prize, tier: 0 }]) : pickMods(r, def.mods || [], 1);
  const gen = pickMods(r, modsOfKind('gen'), 1, corpPick);
  const third = r() < ECON.reward.gear ? [rewardGear(r)] : pickMods(r, modsOfKind('gen', 'minor'), 1, corpPick.concat(gen));
  const options = shuffle(corpPick.concat(gen, third), r);
  const calls = callReward(rngFor(run.seed, 'callreward', node.id));
  if (calls && !options.some(o => o.key === calls.key)) options.push(calls);   // (not the same CALL twice: the third pick can be one too. the user got b0y x2)
  return options;
}
function openReward(node, skipped = false) {
  const run = st.run;
  const def = corpDef(node.corp);
  // the corp's own pick (its boss gear or its corp mod), a general mod, a random third, and half the time a CALL stack
  const options = rewardOptions(node);
  const loot = skipped ? [] : bossLoot(node);   // loot for the bag (ECON.loot.boss; the user: bosses drop it)
  // FIRST BREACH (the user, 2026-10-29): the first time you ever beat this corp, its logo and its tell come before the
  // rewards (only as the screen builds in after the boss; corpStat counted this breach already)
  const first = st.breachReveal && !run.tutorial && node.type === 'corp' && corpStat(def.key).breached === 1 && CORP_TELL[def.key]
    ? { key: def.key, art: CORP_ART[def.key] || [], tell: CORP_TELL[def.key] } : null;
  openChoice({
    first,
    reveal: st.breachReveal,
    rival: st.breachReveal && !skipped ? st.breachRival : null,   // a rival here: their logo comes in first, DEFEATED, then yours
    escaped: st.breachEscaped,   // (they took the last node: ESCAPED instead, and a line says so)
    title: 'CORP BREACHED', col: C.accent,
    head: skipped ? [[def.name, C.text], ['boss skipped: no rewards.', C.dangerDim]] : [[def.name, C.text]].concat(escapedLine()), extra: lootLine(loot),
    by: skipped ? null : profile(),
    options, locked: skipped,
    skipLabel: skipped ? '[ CONTINUE ]' : '[ SKIP  +20cr ]',
    onSkip: skipped ? null : () => { const cr = earnInt(ECON.skip.boss); earn(cr, run); Sound.loot(); },
    msg: skipped ? { text: '> skipjack: boss skipped.', col: C.dangerDim } : breachSummary(),
  });
}
