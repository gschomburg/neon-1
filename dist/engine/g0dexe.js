// NeoN+1 engine/g0dexe.js: G0D.exe, the gear that plays for you (docs/BACKLOG.md "G0D.exe", Greg 2026-11-08).
// Needs engine/hackers.js (HK_AI: it's a crew hacker there, its cursor and notes line in a corp) and engine/scene.js
// (OVERLAYS: its stop card) loaded first. While playing it calls engine/run.js (pick, enterNode), engine/active.js
// (useItem), engine/panels.js (markets, rewards), engine/runend.js (the UPLINK) and engine/bench.js.
// engine/render.js frameBody calls g0dxDrive every frame; engine/scene.js draws its cursor off the board (g0dxDrawScreen).
//
// In a corp layer it's a crew hacker (HK_AI.g0dexe below): it taps the real node in corps you've beaten, guesses in the
// rest (helped by its gear: 0DAY, SPLIT, PING...). A corp with its own rules can add an `auto` hook next to `dress`:
//     auto(lv, g) -> a tile to tap, null to wait, or undefined for the default.  g = { known, cands, real }
//     (or g0dxCell(lv, cell): a cell to tap, for a corp that takes cell taps, LAGRANGE)
//   With an auto hook, it looks again as its @ lands (the board may have moved while it flew).
// Everywhere else (the map, markets, rewards, the UPLINK, the workbench, popups) the driver (g0dxDrive) picks one
// click at a time and flies its @ to the button or node it's about to press. Every click costs one of its clicks.
// When it can't go on (no clicks, can't pay the UPLINK, nowhere to go, a screen it doesn't know) it stops with a
// card saying why, how many clicks it used and how far it got.
//
// st.run.g0dx: { on, left (clicks), used, card (its card still to show), corps (breached with it on), stuck, log }
// st.g0dxD: the driver's moment to moment state (its cursor off the board, the flight, what it's waiting on)
// save.g0dx: the dev settings (g0dxCfg)
'use strict';
NEON_FILES.push(['engine/g0dexe.js', 'v14.73']);

// ---------- settings ----------
const G0DX_CLICKS = [100, 250, 500, 1000, 9999];
const G0DX_SPEEDS = [1, 2, 4];
// ms at 1x: thinking at the start of a layer, a look at a new screen, the flight out, the flight back, the gap after
const G0DX_MS = { think: 1000, screen: 500, out: 220, back: 260, gap: 300 };
// clicks: how many it gets. speed: 1x 2x 4x. beaten: wins before it knows a corp. popups: it clicks through popups and
// skips scenes (false: it waits for you). countWins: a corp it breaches counts in your codex (so it knows it after).
// build: at a workbench it builds gear it uses, from your components (off: it only shreds what it doesn't use).
// phish: "phish it all away" (Greg, for laughs): it heads for every pier and casts till it's out of clicks or credits
// (off: it skips the pier). handoff: low, nothing to heal, and every way on is a corp it doesn't know: it stops.
function g0dxCfg() {
  save.g0dx = Object.assign({ clicks: 500, speed: 1, beaten: 1, popups: true, countWins: true, build: false, phish: false, handoff: false }, save.g0dx || {});
  return save.g0dx;
}
const g0dxMs = k => G0DX_MS[k] / (g0dxCfg().speed || 1);

// ---------- the switch ----------
const g0dxState = () => (st.run && st.run.g0dx) || null;
const g0dxOn = () => { const g = g0dxState(); return !!(g && g.on && holds('g0dexe')); };
const g0dxCanToggle = () => !!(st.run && !st.run.ended && holds('g0dexe'));   // (no state yet, or a spent one: the tap sets it up)
const g0dxWhy = () => { const g = g0dxState(); return !g ? 'not set up: give it from the dev menu.' : g.left <= 0 ? 'out of clicks.' : 'wait a moment.'; };
const g0dxKnows = key => corpStat(key).breached >= (g0dxCfg().beaten || 1);
const g0dxNote = () => { const g = g0dxState(); return g && g.on ? `+G0D.exe ${g.left}` : 'G0D.exe ||'; };

// Its state on the run: a fresh count of clicks (a run with it is practice).
function g0dxSetup() {
  const run = st.run;
  run.g0dx = { on: false, left: g0dxCfg().clicks, used: 0, card: true, corps: 0 };
  st.g0dxStop = null; st.g0dxD = null;
  run.practice = true;
  return run.g0dx;
}
// The dev menu's [give G0D.exe]: onto your belt, set up. (Put on the belt some other way, the editor or [fill gear],
// its first tap sets it up: g0dxToggle.)
function g0dxGive() {
  const run = st.run;
  if (!run) return false;
  if (!holds('g0dexe') && !addItem('g0dexe', 0)) { setMsg('> no room on the belt for G0D.exe.', C.danger); return false; }
  g0dxSetup();
  setMsg(`> G0D.exe on your belt. ${run.g0dx.left} clicks. tap it on.`, C.divine);
  return true;
}
function g0dxToggle() {
  const g0 = g0dxState(), g = g0 && (g0.on || g0.left > 0) ? g0 : g0dxSetup();   // (a new one after one was spent: fresh clicks)
  st.hoverItem = -1; st.selItem = -1;
  if (g.on) return g0dxPause('paused. tap it to go on.');
  g.on = true; g.stuck = null;
  Sound.shield();
  setMsg(`> G0D.exe online. ${g.left} clicks.`, C.divine);
  g0dxLog(`on, ${g.left} clicks`);
  if (g.card) {   // the first time: its card, like a crew CALL's, wherever you are (you close it; it waits)
    g.card = false;
    const c = { id: 'g0dexe', side: 'good', t0: performance.now() };
    if (st.mode === 'play' && st.lv) { c.hold = st.lv.holdUntil || 0; st.lv.holdUntil = Infinity; }
    st.hkCard = c;
  }
}
// Paused: by its own gear, or by you tapping something yourself (engine/input.js). No card: you know why.
function g0dxPause(why) {
  const g = g0dxState();
  if (!g || !g.on) return;
  g.on = false;
  Sound.tick();
  setMsg(`> G0D.exe ${why}`, C.divine);
  g0dxLog('paused: ' + why);
}
// Stopped: it can't go on by itself. Its card says why, the clicks it used and how far it got; you take it from there.
function g0dxStop(why) {
  const g = g0dxState(), run = st.run;
  if (!g) return;
  g.on = false;
  if (st.g0dxD) st.g0dxD.fly = null;
  g0dxLog('stopped: ' + why);
  st.g0dxStop = { why, t0: performance.now(), used: g.used, left: g.left, sector: ((run && run.sector) || 0) + 1, corps: g.corps || 0 };
  Sound.alarm ? Sound.alarm() : Sound.deny();
}
// A short line per decision: the console, and the last 60 on the run (to read back while tuning it).
function g0dxLog(text) {
  const g = g0dxState();
  if (g) { (g.log = g.log || []).push(text); if (g.log.length > 60) g.log.shift(); }
  try { console.log('[g0d] ' + text); } catch (e) { /* no console */ }
}
// What it's doing, on the terminal in its red (Greg: "g0d: market. uplink needs 140cr, have 60.")
function g0dxSay(text) { setMsg('> g0d.exe: ' + text, C.divine); g0dxLog(text); }
// A click spent (every tap it makes, anywhere). False: none left (it stops).
function g0dxSpend() {
  const g = g0dxState();
  if (!g || g.left <= 0) { g0dxOut(); return false; }
  g.left--; g.used++;
  return true;
}
const g0dxSpent = () => {
  const g = g0dxState();
  if (!g || !g.on) return;
  if (g.left === 1 && g0dxCount() >= 2) g.chain = true;   // its last click goes on the next G0D.exe (g0dxChain)
  else if (g.left <= 0) g0dxOut();
};
const g0dxCount = () => st.run.items.filter(s => s.key === 'g0dexe').reduce((a, s) => a + s.n, 0);
// The hand-off (Greg, 2026-11-08): with another G0D.exe on the belt, its last click switches that one on. This one is
// spent and floats away; the next comes in with fresh clicks and its card, and closes the card itself (its first
// click: g0dxPlan). No OFFLINE card in between. (Switched on by you, its card waits for your tap.)
function g0dxChain() {
  const g = g0dxState();
  g.chain = false;
  takeItem('g0dexe');
  const h = hkUp('g0dexe'); if (h) hkOut(h, 'one more of me.');
  g.left = g0dxCfg().clicks; g.chained = (g.chained || 0) + 1;
  g0dxSay(`one more of me. ${g.left} clicks.`);
  const c = { id: 'g0dexe', side: 'good', t0: performance.now(), chain: true };
  if (st.mode === 'play' && st.lv) { c.hold = st.lv.holdUntil || 0; st.lv.holdUntil = Infinity; }
  st.hkCard = c;
  Sound.shield();
}
// Out of clicks (Greg, meat notes 2026-11-08): the gear is spent (one off the belt, like used gear) and its cursor floats
// away (hkOut: a crew member leaving). Another G0D.exe on the belt is ready with fresh clicks: tap it.
function g0dxOut() {
  const g = g0dxState();
  if (!g) return;
  takeItem('g0dexe');
  const h = hkUp('g0dexe'); if (h) hkOut(h, hkLine(h, 'out'));
  const more = holds('g0dexe');
  g0dxStop(more ? 'out of clicks. the gear is spent; the next G0D.exe on your belt is ready: tap it.' : 'out of clicks. the gear is spent.');
  if (more) { g.left = g0dxCfg().clicks; g.used = 0; }
}

// ---------- the corps it breached (engine/run.js finishCorp) ----------
const g0dxWasIn = c => !!(c && (c.hk || []).some(h => h.id === 'g0dexe'));
// countWins off: a corp it breached doesn't count in your codex (so it still doesn't know it)
const g0dxNoCount = c => g0dxWasIn(c) && !g0dxCfg().countWins;
function g0dxCorpDone(c) {
  const g = g0dxState();
  if (!g || !g0dxWasIn(c) || c.node.type === 'start') return;
  g.corps = (g.corps || 0) + 1;
  g0dxLog(`breached ${c.def.key}`);
}

// ---------- gear it uses ----------
// What it does with each gear (everything else is junk to it: trashed for room, shredded at a workbench).
const G0DX_GEAR = {
  map: ['skip', 'warp', 'route'],   // jumping ahead
  ways: ['mesh', 'tunnel'],   // more ways on: used when they open a better one
  keep: ['pass', 'magnet'],   // (PASS: the UPLINK uses it by itself; MAGNET: a $ node in a layer)
  heal: ['patch', 'stim', 'wall'],
  layer: ['zeroday', 'split', 'repeat', 'shovel', 'frag', 'purge', 'ping'],   // corps it doesn't know, best first
  any: ['lotto'],   // use it now: credits
};
const g0dxUses = key => key === 'g0dexe' || key.startsWith('call') || Object.values(G0DX_GEAR).some(l => l.includes(key));
const g0dxSlot = key => st.run.items.findIndex(s => s.key === key);
// A gear it doesn't use, to make room (the cheapest one)
function g0dxJunkSlot() {
  let best = -1, val = Infinity;
  st.run.items.forEach((s, i) => { if (!isLoot(s.key) && !ITEMS[s.key].quest && !g0dxUses(s.key)) { const v = gearValue(s.key, s.tier); if (v < val) { val = v; best = i; } } });
  return best;
}
// Money mods (Greg: it keeps these through the UPLINK): their tip or text talks credits, pay or loot
const g0dxMoneyMod = k => !!MODS[k] && /credit|\bcr\b|\$|\bpay|loot|market|cache|interest/i.test(`${MODS[k].tip || ''} ${MODS[k].desc || ''}`);
const g0dxLvl = r => (RARITY[r] || {}).lvl || 0;

// ---------- money ----------
// What the UPLINK at the end of this sector will cost: the minimum, the money mods it keeps, less what the rest sell for.
function g0dxUplinkNet() {
  const run = st.run;
  let fee = uplinkMin(), sold = 0;
  for (const k of run.mods) if (UPLINK_LOCKED.includes(k) || g0dxMoneyMod(k)) fee += uplinkFee(k); else sold += uplinkSell(k);
  return { fee, net: fee - sold };
}
const g0dxNeed = () => g0dxUplinkNet().net + Math.max(0, creditFloor()) - st.run.credits;
const g0dxHurt = () => { const r = st.run; return zombie() ? (r.rot || 0) > 0 : r.integrity < r.maxInt; };
const g0dxLow = () => { const r = st.run; return !zombie() && r.integrity <= Math.max(1, Math.ceil(r.maxInt / 3)); };

// ---------- where it clicks ----------
// A tap target on screen (engine/scene.js hits: cr = its cells) and the cell at its middle.
const g0dxHit = pred => hits.find(pred) || null;
const g0dxAt = h => h && h.cr ? { x: h.cr[0] + Math.max(0, Math.floor(h.cr[2] / 2) - 1), y: h.cr[1] } : null;
const g0dxBtn = id => g0dxHit(h => h.id === id && h.onTap && !h.disabled);
const g0dxMid = () => ({ x: Math.floor(L.wc / 2) - 1, y: Math.floor(L.hc / 2) });
const g0dxBeltAt = slot => g0dxAt(g0dxHit(h => h.kind === 'item' && h.i === slot)) || { x: 4 + slot * 6, y: L.hc - 3 };
// A gear off its belt, as a plan (one click)
const g0dxUseGear = (key, say) => { const i = g0dxSlot(key); return i < 0 ? null : { at: g0dxBeltAt(i), act: () => useItem(i), say }; };

// ---------- the driver: every screen but a corp's layer ----------
// Each frame: the @ flies on (and clicks when it lands); otherwise, once it has looked at the screen a moment, the
// next plan: { at, act, say } (a click), 'wait', or { stop: why }.
function g0dxDrive(now) {
  const D = st.g0dxD || (st.g0dxD = { next: 0 });
  if (D.fly) g0dxFlyStep(D, now);
  if (!g0dxOn() || st.dev || st.pause || (typeof TABS !== 'undefined' && TABS.away) || st.mode === 'title' || (st.run.ended && st.mode !== 'over')) { D.waitAt = 0; return; }
  if (st.mode === 'fish' && st.fish) g0dxFishHold(st.fish, now);   // the pier: the hook and the reel, frame by frame
  if (D.fly || now < D.next) return;
  const key = `${st.mode}:${st.panelTitle || ''}:${st.run && st.run.at}:${overlayTop() ? overlayTop().id : ''}`;
  if (key !== D.key) { D.key = key; D.lookTo = now + g0dxMs('screen'); D.waitAt = 0; D.tries = 0; D.popAt = 0; }
  if (now < D.lookTo) return;
  let plan;
  try { plan = g0dxPlan(now, D); } catch (e) { g0dxLog('plan error: ' + e.message); plan = { stop: 'something broke: ' + e.message }; }
  if (!plan || plan === 'wait') {   // waiting a long while off the board: it doesn't know this screen
    if (!D.waitAt) D.waitAt = now;
    else if (st.mode !== 'play' && st.mode !== 'fish' && !st.transitioning && !st.wipe && now - D.waitAt > 8000 / (g0dxCfg().speed || 1) + 4000) g0dxStop(`it doesn't know this screen (${st.panelTitle || st.mode}).`);
    return;
  }
  D.waitAt = 0;
  if (plan.stop) return g0dxStop(plan.stop);
  if (plan.say) g0dxSay(plan.say);
  D.tries++;
  D.fly = { to: plan.at || g0dxMid(), act: plan.act, t0: now };
}
function g0dxFlyStep(D, now) {
  const f = D.fly;
  if (!f.hit && now >= f.t0 + g0dxMs('out')) {
    f.hit = true; f.hitAt = now;
    if (g0dxOn() && g0dxSpend()) { try { f.act(); } catch (e) { g0dxLog('click error: ' + e.message); } g0dxSpent(); }
  }
  if (f.hit && now >= f.hitAt + g0dxMs('back')) { D.fly = null; D.next = now + g0dxMs('gap'); }
}

function g0dxPlan(now, D) {
  const run = st.run;
  if (!run) return { stop: 'no run.' };
  if (st.wipe || st.transitioning || st.g0dxStop) return 'wait';
  if (g0dxState().chain && !st.busy) { const i = g0dxSlot('g0dexe'); return { at: g0dxBeltAt(i), act: g0dxChain }; }   // its last click: the next G0D.exe
  const o = overlayTop();
  if (o) {
    if (o.id === 'hacker' && st.hkCard && st.hkCard.id === 'g0dexe') return st.hkCard.chain ? { act: () => o.key('enter') } : 'wait';   // its own card: yours to close (a hand-off's: it closes it)
    if (!g0dxCfg().popups) return 'wait';
    if (o.id === 'event' && !evCardShown()) return 'wait';   // (a sector event waits for the map to settle; it takes no taps till then)
    if (!D.popAt) D.popAt = now;
    if (D.tries > 8 && now - D.popAt > 6000) return { stop: `a popup it can't close (${o.id}).` };
    // a key (a scene: skipped; a card, a feat: closed), then a tap on the popup's own button (an ad's [x], a CALL's)
    const own = hits.slice(overlayHits), btn = own.find(h => h.kind === 'btn' && h.onTap && !h.disabled) || own[0];
    if (D.tries % 2 && btn) return { at: g0dxAt(btn), act: () => o.tap(btn) };
    const keys = ['enter', 'escape', ' ', 'x'];
    return { act: () => o.key(keys[Math.floor(D.tries / 2) % keys.length]) };
  }
  if (st.intro) return { act: () => { if (st.intro) st.intro.skip = true; } };
  if (st.bossIntro) return { act: () => { if (st.bossIntro) st.bossIntro.skip = true; } };
  if (run.tutorial) return { stop: 'not in the training.' };
  if (st.mode === 'play') return g0dxPlayPlan();
  if (st.mode === 'map') return g0dxMapPlan();
  if (st.mode === 'panel') return g0dxPanelPlan(D);
  if (st.mode === 'fish' && st.fish) return g0dxFishPlan(now);
  if (st.mode === 'over') {
    if (st.result && st.result.sector) { const b = g0dxBtn('push'); return b ? { at: g0dxAt(b), act: b.onTap, say: 'sector cleared. on to the uplink.' } : 'wait'; }
    return { stop: run.integrity <= 0 ? 'you flatlined.' : 'the run is over.' };
  }
  return 'wait';
}

// ---- in a corp, off the layer: a one-node layer (no hacker plays those); the rest is HK_AI.g0dexe
function g0dxPlayPlan() {
  const lv = st.lv;
  if (!lv || st.busy || lv.readyAt == null) return 'wait';
  if (lv.n < 2 && lv.tiles[lv.safe] && lv.tiles[lv.safe].state === 'closed') return { at: hkCell(lv.tiles[lv.safe]), act: () => pick(lv.safe) };
  return 'wait';
}

// ---- the map
// What a node is worth to it: money while it needs it (corps it knows, caches, a market with loot to sell), a
// safehouse while hurt; a corp it doesn't know costs (more when you're low); fishing is skipped. When the money's
// fine, every step costs a little: it heads for the boss.
function g0dxNodeValue(n, c) {
  const t = n.type;
  let v = 0;
  if (t === 'corp' || t === 'final') v = g0dxKnows(n.corp) ? (c.need > 0 ? 3 : 1) : -(c.low ? 6 : 2.5);
  else if (t === 'shop') v = c.loot || c.hurt ? 2 : 0.3;
  else if (t === 'cache') v = 2;
  else if (t === 'repair') v = c.low ? 5 : c.hurt ? 2.5 : 0.2;
  else if (t === 'pier') v = g0dxCfg().phish && st.run.credits >= fishCost() && ((st.run.pierCasts || {})[n.id] || 0) < ECON.fish.casts ? 8 : -1;   // (phish it all away)
  return v - (c.need > 0 ? 0 : 0.6);
}
// The best total along any way from this node to the sector's boss (the map's links; sideways ones go both ways).
function g0dxRoute(id, c, seen, depth = 0) {
  const run = st.run, n = run.map[id];
  if (!n) return -Infinity;
  const here = g0dxNodeValue(n, c);
  if (n.type === 'final' || depth > 14) return here;
  let best = -Infinity;
  for (const nx of n.next || []) {
    const m = run.map[nx];
    if (!m || seen.has(nx) || run.visited.includes(nx) || (m.sector || 0) !== (run.sector || 0)) continue;
    seen.add(nx); best = Math.max(best, g0dxRoute(nx, c, seen, depth + 1)); seen.delete(nx);
  }
  return here + (best === -Infinity ? 0 : best);
}
const g0dxNodeName = n => n.type === 'shop' ? 'market' : n.type === 'cache' ? 'data cache' : n.type === 'repair' ? 'safehouse' : n.type === 'pier' ? 'the pier'
  : n.type === 'fence' ? 'the fence' : (corpDef(n.corp) ? corpDef(n.corp).name.toLowerCase() : 'a corp') + (n.type === 'final' ? ' (the boss)' : '') + (g0dxKnows(n.corp) ? '' : ', a guess');
function g0dxMapPlan() {
  const run = st.run;
  if (st.busy || (st.mapView && st.mapView.row !== st.mapView.target)) return 'wait';
  if (st.swap) return { act: () => { st.swap = null; } };
  const need = g0dxNeed(), hurt = g0dxHurt(), low = g0dxLow();
  // the belt first: heal when low, scratch a LOTTO, make room
  if (low && g0dxSlot('patch') >= 0 && canUse(run.items[g0dxSlot('patch')])) return g0dxUseGear('patch', 'patching up.');
  if (g0dxSlot('lotto') >= 0) return g0dxUseGear('lotto', 'a lotto ticket.');
  const c0 = { need, hurt, low, loot: (run.loot || []).some(s => !ITEMS[s.key].quest) };
  const score = id => g0dxRoute(id, c0, new Set([id])) + run.map[id].step * 0.01;   // (a tie: the deeper one)
  const now0 = availableNodes(), bestNow = Math.max(-Infinity, ...now0.map(score));
  // the hand-off (a setting): low, nothing to heal with, and every way on is a corp it doesn't know
  if (g0dxCfg().handoff && low && g0dxSlot('patch') < 0 && now0.length && now0.every(id => ['corp', 'final'].includes(run.map[id].type) && !g0dxKnows(run.map[id].corp)))
    return { stop: `you're at ${run.integrity} INT with nothing to heal, and every way on is a corp it doesn't know.` };
  // MESH / TUNNEL: when they'd open a better way than the ones there are
  for (const k of G0DX_GEAR.ways) {
    const i = g0dxSlot(k);
    if (i < 0 || !canUse(run.items[i])) continue;
    const cur = run.map[run.at], opens = k === 'tunnel' ? rowMates() : Object.values(run.map).filter(n => n.step === cur.step + 1 && (n.sector || 0) === (run.sector || 0)).concat(meshSides());
    const more = opens.filter(n => !run.visited.includes(n.id) && !now0.includes(n.id));
    if (more.length && Math.max(...more.map(n => score(n.id))) > bestNow + 1.5) return g0dxUseGear(k, `${ITEMS[k].name.toLowerCase()}: a better way on.`);
  }
  // jumping ahead: only when the money's there and you're not hurt
  if (need <= 0 && !hurt) for (const k of G0DX_GEAR.map) {
    const i = g0dxSlot(k);
    if (i < 0 || !canUse(run.items[i]) || (k === 'route' && !availableNodes().every(id => ['corp', 'final'].includes(run.map[id].type) && !g0dxKnows(run.map[id].corp)))) continue;
    return g0dxUseGear(k, k === 'route' ? 'every way on is a guess. rerouting.' : `the money is there. ${ITEMS[k].name.toLowerCase()} ahead.`);
  }
  const ids = availableNodes();
  if (!ids.length) return { stop: 'nowhere left to go on the map.' };
  let best = null, bv = -Infinity;
  for (const id of ids) {
    const v = score(id);
    if (v > bv) { bv = v; best = id; }
  }
  const n = run.map[best], u = g0dxUplinkNet();
  const why = need > 0 ? `uplink needs ${u.net}cr, have ${run.credits}.` : low ? 'you are low.' : 'money is fine. going deep.';
  return { at: g0dxAt(g0dxHit(h => h.kind === 'node' && h.id === best)), act: () => enterNode(run.map[best]), say: `${g0dxNodeName(n)}. ${why}` };
}

// ---- panels
function g0dxPanelPlan(D) {
  const t = st.panelTitle, run = st.run;
  if (st.swap) return { act: () => { st.swap = null; } };   // (a full belt or mod bar: it never asks for that, so: no)
  const core = g0dxBtn('core');
  if (core) return { at: g0dxAt(core), act: core.onTap };   // FIRST BREACH: see the rewards
  if (t === 'UPLINK' && st.uplink) return g0dxUplinkPlan(D);
  if (t === 'BLACK MARKET' && st.shop) return g0dxShopPlan(D);
  if (t === 'WORKBENCH' && st.bench) return g0dxBenchPlan(D);
  if (st.choice && st.choice.title === t) return g0dxChoicePlan();
  if (t === 'CONTINUE?') return { stop: 'you went down. CONTINUE? is your call.' };
  for (const id of ['play', 'ok', 'done', 'next', 'leave', 'back', 'skip']) {   // the rest (SKIPJACK, the fence...): their own way on
    const b = g0dxBtn(id);
    if (b) return { at: g0dxAt(b), act: b.onTap };
  }
  return 'wait';
}
// Rewards (a corp's, a cache's, a safehouse's): money mods, then gear it uses, then epic+ mods to sell at the UPLINK
// (Greg's idea; in sector 1 a legendary sells for ~40cr, an epic ~26cr, the credits pay 20), else the credits.
function g0dxPickReward(opts) {
  const run = st.run;
  const modOk = o => o.kind !== 'gear' && MODS[o.key] && modRoom(o.key) && !clashWith(o.key);
  const gearOk = o => o.kind === 'gear' && g0dxUses(o.key) && (itemRoom(o.key, o.tier) || g0dxJunkSlot() >= 0);
  return opts.find(o => modOk(o) && g0dxMoneyMod(o.key)) || opts.find(o => gearOk(o) && G0DX_GEAR.map.includes(o.key)) || opts.find(gearOk)
    || opts.find(o => modOk(o) && g0dxLvl(modView(o.key).rarity) >= 3) || null;
}
function g0dxChoicePlan() {
  const ch = st.choice, o = g0dxPickReward(ch.options);
  if (o) {
    const i = ch.options.indexOf(o), name = o.kind === 'gear' ? ITEMS[o.key].name : MODS[o.key].name;
    const why = o.kind === 'gear' ? '' : g0dxMoneyMod(o.key) ? ' (money)' : ' (to sell at the uplink)';
    return { at: g0dxAt(g0dxBtn('opt' + i) || g0dxBtn('take')), say: `takes ${name.toLowerCase()}${why}.`,
      act: () => { if (o.kind === 'gear' && !itemRoom(o.key, o.tier)) { const j = g0dxJunkSlot(); if (j >= 0) trashItem(j); } ch.take(o); } };
  }
  const b = g0dxBtn('skip');
  return { at: g0dxAt(b), act: () => ch.take(null), say: ch.options.length ? 'nothing it wants. takes the credits.' : null };
}
// The UPLINK: keep the money mods, sell the rest (one click), then push on. Can't pay: it stops (cashing out is yours).
function g0dxUplinkPlan(D) {
  const run = st.run, u = st.uplink;
  if (D.upSet !== u) {
    return { at: g0dxAt(g0dxBtn('up0')), act: () => {
      D.upSet = u;
      for (const k of run.mods) if (!u.locked.includes(k)) u.keep[k] = g0dxMoneyMod(k);
      const kept = run.mods.filter(k => u.keep[k] && !u.locked.includes(k)).sort((a, b) => u.fee(a) - u.fee(b));
      while (!u.canGo() && kept.length) u.keep[kept.shift()] = false;   // short: sell money mods too, cheapest first
      const sold = run.mods.filter(k => !u.keep[k]).length;
      g0dxSay(`uplink: keeps ${run.mods.length - sold} mod${run.mods.length - sold === 1 ? '' : 's'}, sells ${sold}. ${u.tally().net}cr.`);
    } };
  }
  if (!u.canGo()) return { stop: `it can't pay the uplink: ${u.tally().net}cr, you have ${run.credits}cr. cashing out is yours.` };
  const b = g0dxBtn('push');
  return { at: g0dxAt(b), act: () => u.push(), say: 'pushing on.' };
}
// A market: sell the loot, a repair when hurt, then a money mod or a gear it uses if there's money past the UPLINK.
function g0dxShopPlan(D) {
  const run = st.run, sh = st.shop;
  if (!D.shop || D.shop.node !== sh.node) D.shop = { node: sh.node, n: 0 };
  if (D.shop.n++ > 12) return g0dxLeave();
  if ((run.loot || []).some(s => !ITEMS[s.key].quest) && sh.sellAll) return { at: g0dxAt(g0dxBtn('sellall')), act: () => sh.sellAll(), say: 'sells the loot.' };
  const P = o => sh.priceOf(o), spare = () => run.credits - Math.max(0, g0dxUplinkNet().net) - 10;
  const rep = sh.offers.findIndex(o => o.kind === 'repair' && !o.sold);
  if (rep >= 0 && g0dxHurt() && canSpend(P(sh.offers[rep])) && (g0dxLow() || P(sh.offers[rep]) <= spare())) return { act: () => sh.buyAt(rep), say: 'a repair.' };
  const k = sh.offers.findIndex(o => !o.sold && canSpend(P(o)) && P(o) <= spare() && (
    (o.kind === 'mod' && g0dxMoneyMod(o.key) && modRoom(o.key) && !clashWith(o.key)) || (o.kind === 'item' && g0dxUses(o.key) && itemRoom(o.key, o.tier))));
  if (k >= 0) { const o = sh.offers[k]; return { act: () => sh.buyAt(k), say: `buys ${(o.kind === 'mod' ? MODS[o.key] : ITEMS[o.key]).name.toLowerCase()}.` }; }
  if (sh.rerollsLeft() > 0 && (D.shop.rolls || 0) < 2 && spare() > sh.rerollPrice() * 3) { D.shop.rolls = (D.shop.rolls || 0) + 1; return { act: () => sh.reroll(), say: `money to spare: a reroll (${sh.rerollPrice()}cr).` }; }
  return g0dxLeave();
}
const g0dxLeave = () => { const b = g0dxBtn('leave') || g0dxBtn('back'); return { at: g0dxAt(b), act: () => (b ? b.onTap() : leavePanel()) }; };
// The workbench: shred the gear it doesn't use; build gear it does (only with the build setting on); then leave.
function g0dxBenchPlan(D) {
  const b = st.bench;
  if (benchBusy()) return 'wait';
  const junk = benchShredList().filter(e => e.kind === 'gear' && !g0dxUses(e.key) && !ITEMS[e.key].quest);
  if (junk.length) {
    if (b.tab !== 'shred') return { act: () => benchTab('shred') };
    return { act: () => benchShred(junk[0]), say: `shreds ${ITEMS[junk[0].key].name.toLowerCase()}.` };
  }
  if (g0dxCfg().build && !D.built) {
    const key = [...G0DX_GEAR.layer, ...G0DX_GEAR.heal, ...G0DX_GEAR.map].find(k => ITEMS[k] && !benchMissing(itemShort(k)) && itemRoom(k, 0));
    if (key) {
      if (b.tab !== 'build') return { act: () => benchTab('build') };
      return { act: () => { D.built = true; benchFill(itemShort(key)); benchBuild(itemShort(key)); }, say: `builds ${ITEMS[key].name.toLowerCase()}.` };
    }
  }
  D.built = false;
  return { act: () => benchLeave() };
}

// ---------- the pier (only with "phish it all away" on; else it leaves) ----------
// Frame by frame (engine/fishing.js): the hook goes to the lane of the shape that will reach it first; on the reel it holds
// while the mark is short of the window's middle and lets go past it. (Holding isn't a click: the cast and the
// tap on a bite are.)
function g0dxFishHold(f, now) {
  if (!g0dxOn()) return;
  const rl = f.reel;
  if (rl) { f.hold = rl.mark < rl.win + rl.w * 0.5; return; }
  const hk = f.hook;
  if (!hk || hk.bite || hk.drop) return;
  const eta = s => (hk.x - fishHead(s)) * s.dir / Math.max(0.1, s.spd);   // (how long till it swims to the hook, s)
  let best = f.g0dxFish;   // stay on the one it picked till it's nosed the hook or swum past
  if (!best || best.nosed || best.flee || !f.shapes.includes(best) || eta(best) < -0.5) {
    best = null; let bd = Infinity;
    for (const s of f.shapes) {
      if (s.nosed || s.flee || s.hooked) continue;
      const d = eta(s);
      if (d > 0.8 && d < bd) { bd = d; best = s; }   // (time to get the hook there first)
    }
    f.g0dxFish = best;
  }
  f.g0dxComing = best ? now : f.g0dxComing;
  if (best) { hk.lane = best.lane; f.hold = true; } else f.hold = false;
}
function g0dxFishPlan(now) {
  const f = st.fish, phish = g0dxCfg().phish;
  if (f.card) {   // landed: keep it (PHISH and loot go in the bag); gear it uses with the belt full: junk out first; else back it goes
    const key = fishKeepKey(f.card.out), tier = f.card.out.tier, junk = g0dxJunkSlot();
    const room = itemRoom(key, tier), make = !room && g0dxUses(key) && junk >= 0;
    if (room || make) return { at: g0dxAt(g0dxBtn('fkeep')), act: () => { if (!itemRoom(key, tier)) trashItem(g0dxJunkSlot()); fishKeep(); }, say: make ? `makes room for ${ITEMS[key].name.toLowerCase()}.` : null };
    return { at: g0dxAt(g0dxBtn('fback')), act: () => fishThrowBack(), say: `throws back ${ITEMS[key].name.toLowerCase()}.` };
  }
  if (f.reel) return 'wait';   // (g0dxFishHold has the line)
  const hk = f.hook;
  if (hk && hk.bite) return { at: { x: Math.round(hk.x), y: Math.round(hk.y) }, act: () => { if (f.hook && f.hook.bite) fishStartReel(); } };
  if (hk) {   // nothing heading for the hook for a while: reel in, cast again
    return now - Math.max(hk.since || (hk.since = now), f.g0dxComing || 0) > 4000 ? { at: g0dxAt(g0dxBtn('freel')), act: () => fishReelIn() } : 'wait';
  }
  if (phish && fishCanCast() && st.run.credits >= fishCost()) {   // (its own money only: never into LEVERAGE's debt)
    const lane = Math.floor(Math.random() * FISH_LANES), g = fishGeo();
    return { at: { x: Math.round(L.wc * 0.42), y: g.laneY(lane) }, act: () => { if (fishCast(lane)) f.hold = true; }, say: g0dxPhishSay() };
  }
  return { at: g0dxAt(g0dxBtn('fleave')), act: () => leavePier(),
    say: !phish ? 'no phishing today.' : fishCasts() >= ECON.fish.casts ? 'fished out. on to the next pier.' : 'out of credits to cast.' };
}
const g0dxPhishSay = () => `phishing it all away. ${fishCost()}cr a cast, ${st.run.credits}cr left.`;

// ---------- in a corp ----------
// Switched on, it's in every corp layer (engine/hackers.js hkTick calls this each frame).
function g0dxEnsure(lv) {
  const run = st.run, c = st.corp;
  if (!g0dxOn() || !lv || st.mode !== 'play' || !c || !c.hasBoss || run.tutorial || hkUp('g0dexe')) return;
  const h = { id: 'g0dexe', side: 'good', hp: 1, max: 1, lv2: false, out: false, stole: 0, took: 0, row: 0 };
  (c.hk = c.hk || []).push(h);
  markSeen('hk_g0dexe');
  g0dxLog(`${c.def.key}: ${g0dxKnows(c.def.key) ? 'known' : 'a guess'}`);
}
// What to tap. A corp it knows: the real node (or its auto hook). One it doesn't: a node it's been shown (0DAY, PING,
// b0y), else a guess among the ones not ruled out.
function g0dxChoose(lv) {
  const def = st.corp.def, now = performance.now();
  const cands = lv.tiles.filter(t => t.state === 'closed' && !t.loaded && !(t.denied && t.denied > now));
  const real = cands.find(isReal) || null, known = g0dxKnows(def.key);
  if (def.auto) { const r = def.auto(lv, { known, cands, real }); if (r !== undefined) return r; }
  if (known && real) {   // a $ node first (Greg): at full health, while the UPLINK needs money, never on a boss layer
    const cash = lv.tiles.find(t => t.loaded && t.state === 'closed' && !isReal(t));
    if (cash && !def.auto && !lv.boss && !zombie() && (st.run.integrity >= st.run.maxInt || has('forgery')) && g0dxNeed() > 0) return cash;
    return real;
  }
  const shown = cands.find(t => t.zd);
  if (shown) return shown;
  const open = cands.filter(t => !t.ruledOut);
  return pickR(open.length ? open : cands, Math.random) || null;
}
// Gear in a layer: a PATCH when you're low (any corp); in a corp it doesn't know, one helper a layer (0DAY, SPLIT...),
// and on its boss a CALL.
function g0dxLayerGear(lv, s) {
  const run = st.run, known = g0dxKnows(st.corp.def.key);
  const use = k => { const i = g0dxSlot(k); return i >= 0 && canUse(run.items[i]) ? k : null; };
  if (g0dxLow()) { const k = use('patch') || use('stim') || use('wall'); if (k) return k; }
  if (lv.tiles.some(t => t.loaded && t.state === 'closed') && use('magnet')) return 'magnet';   // a $ node: its loot, free
  if (known || s.gear || lv.tiles.some(t => t.zd && t.state === 'closed')) return null;
  const k = G0DX_GEAR.layer.map(use).find(Boolean);
  if (k) return k;
  if (lv.boss && !hkList().some(h => h.side === 'good' && h.id !== 'g0dexe' && !h.out)) { const c = run.items.find(x => x.key.startsWith('call') && canUse(x)); if (c) return c.key; }
  return null;
}
// A cell as a target (a corp's cellTap: LAGRANGE), for an auto hook: where it is, and that it's a cell.
const g0dxCell = (lv, cell) => ({ cell, col: cell % lv.cols, row: Math.floor(cell / lv.cols), state: 'closed', cellTap: true });
// The tap itself: a click spent, then the same pick() your own tap goes through (a cell: the corp's cellTap, like input.js).
function g0dxTap(lv, h, t) {
  if (!g0dxOn() || st.lv !== lv || st.mode !== 'play' || st.busy || t.state !== 'closed') return false;
  if (!g0dxSpend()) return false;
  const s = hkS(lv, h);
  s.taps = (s.taps || 0) + 1;
  if (t.cellTap) corpHook('cellTap', t.cell); else pick(lv.tiles.indexOf(t));
  g0dxSpent();
  return true;
}

// ---------- how it plays a layer (HK_AI, engine/hackers.js) ----------
// Each layer: the cursor hovers about the board for a second (thinking), then its @ flies out to a node, taps it
// and flies back. s.fly = { t (a node) or to (a cell: its belt), act, t0, hit } while it's out.
HK_AI.g0dexe = {
  layer(lv, h, s, now) { s.next = 0; s.thinkTo = now + g0dxMs('think'); s.fly = null; s.taps = 0; s.gear = false; },
  tick(lv, h, s, now) {
    if (now > (s.wanderAt || 0)) {   // hovering: a new spot over the board every so often
      s.wanderAt = now + 250 + Math.random() * 300;
      s.home = { x: L.gx + rand(2, Math.max(3, lv.cols * (TILE_W + GAP_X) - 2)), y: BOARD_Y + rand(1, Math.max(2, lv.rows * (TILE_H + GAP_Y) - 2)) };
    }
    if (!g0dxOn() || overlayTop() || g0dxState().chain) { if (!g0dxOn()) { s.fly = null; s.lastTick = 0; } return; }   // (the hand-off: the driver)
    if (!s.lastTick || s.held) { s.held = false; s.thinkTo = Math.max(s.thinkTo || 0, now + g0dxMs('think')); }   // back from a pause or a card: think again
    s.lastTick = now;
    if (s.fly) {
      if (!s.fly.hit && now >= s.fly.t0 + g0dxMs('out')) {
        s.fly.hit = true; s.fly.hitAt = now;
        if (s.fly.act) { if (g0dxSpend()) { s.fly.act(); g0dxSpent(); } }   // gear off the belt
        else {
          if (st.corp.def.auto) { const t2 = g0dxChoose(lv); if (t2) s.fly.t = t2; else { s.fly.missed = true; return; } }   // (look again: LAGRANGE slid)
          if (!g0dxTap(lv, h, s.fly.t)) s.fly.missed = true;
        }
      }
      if (s.fly && s.fly.hit && now >= s.fly.hitAt + g0dxMs('back')) { s.fly = null; s.next = now + g0dxMs('gap'); }
      return;
    }
    if (now < (s.thinkTo || 0) || now < (s.next || 0)) return;
    if ((s.taps || 0) > lv.tiles.length * 3 + 4) {   // tapping and getting nowhere: hand it back
      const g = g0dxState(); if (g) g.stuck = `${st.corp.def.key} layer ${st.corp.idx}`;
      return g0dxStop(`it got stuck in ${st.corp.def.name.toLowerCase()}.`);
    }
    const gk = g0dxLayerGear(lv, s);
    if (gk) {
      const i = g0dxSlot(gk);
      if (!G0DX_GEAR.heal.includes(gk)) s.gear = true;
      hkSay(h, ITEMS[gk].name.toLowerCase() + '.', false, true);
      s.fly = { to: g0dxBeltAt(i), act: () => useItem(g0dxSlot(gk)), t0: now, hit: false };
      return;
    }
    const t = g0dxChoose(lv);
    if (!t) return;
    s.fly = { t, t0: now, hit: false };
  },
  // its cursor: <@> on G0D's red, its name (or its words) under it. While the @ is out, the cursor shows < >.
  draw(ctx, lv, h, s, now) {
    if (st.hkCard) s.held = true;   // (a card is up: it thinks again after)
    const at = s.fly ? (s.fly.t ? hkCell(s.fly.t) : s.fly.to) : null;
    g0dxCursor(ctx, Math.round(s.cur.x - 1), Math.round(s.cur.y), s.fly, at, s.bubble && now < s.bubble.until ? s.bubble.text : null, now);
    if (s.faceAt && now - s.faceAt < 1600) {   // talking: the eye bounces up above the cursor (like the crew's faces)
      const { put, bg } = ctx, sty = hkStyle('g0dexe'), x = Math.round(s.cur.x - 1), y = Math.round(s.cur.y);
      const fc = (ART_FACES.g0dexe || { art: [] }).art, hop = Math.round(Math.abs(Math.sin((now - s.faceAt) / 120)) * 1);
      fc.forEach((l, k) => { bg(x - 1, y - 4 + k - hop, 5, sty.bg, 1); put(x - 1, y - 4 + k - hop, l, sty.fg, 'fx', true); });
    }
  },
};

// ---------- its cursor ----------
// <@> on G0D's red with its tag (its name, its words, or 'paused'); while the @ is out (f), the cursor shows < > and
// the @ flies to `to` and back, eased, with a faint trail.
function g0dxCursor(ctx, x, y, f, to, say, now) {
  const { put, bg } = ctx, sty = hkStyle('g0dexe'), on = g0dxOn();
  say = say || (on ? null : 'paused');
  bg(x, y, 3, sty.bg, on ? 1 : 0.6);
  put(x, y, f ? '< >' : logoMark('g0dexe'), on ? sty.fg : mixHex(sty.fg, sty.bg, 0.5), 'fx', true);
  const tag = hkTagText('g0dexe', say), tx = clamp(x, 0, Math.max(0, L.wc - tag.length));
  if (say) { bg(tx, y + 1, tag.length, sty.fg, 1); put(tx, y + 1, tag, sty.bg, 'fx', true); }
  else { bg(tx, y + 1, tag.length, sty.bg, 0.8); put(tx, y + 1, tag, sty.fg, 'fx'); }
  if (!f || !to) return;
  const home = { x: x + 1, y };
  const pos = k => {
    const tt = f.hit ? clamp((now - f.hitAt - k) / g0dxMs('back'), 0, 1) : clamp((now - f.t0 - k) / g0dxMs('out'), 0, 1);
    const e = tt * tt * (3 - 2 * tt), a = f.hit ? to : home, b = f.hit ? home : to;
    return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
  };
  [70, 35].forEach((lag, i) => { const p = pos(lag); put(p.x, p.y, '.', mixHex(sty.fg, sty.bg, 0.55 - i * 0.25), 'fx'); });
  const p = pos(0);
  bg(p.x, p.y, 1, sty.bg, 1); put(p.x, p.y, '@', sty.fg, 'fx', true);
}
// Off the board (the map, the panels): the cursor drifts about the middle of the screen; engine/scene.js draws it over
// everything. In a corp layer the board draws it (HK_AI.g0dexe.draw).
function g0dxDrawScreen(ctx, now) {
  const D = st.g0dxD, g = g0dxState();
  if (!D || !g || (!g.on && !D.fly) || st.mode === 'title' || (st.mode === 'play' && st.lv && hkUp('g0dexe') && st.lv.n > 1)) return;
  if (!D.cur) D.cur = g0dxMid();
  if (!D.home || now > D.homeAt) { D.homeAt = now + 400 + Math.random() * 500; D.home = { x: Math.floor(L.wc / 2) + rand(-8, 6), y: Math.floor(L.hc / 2) + rand(-6, 6) }; }
  D.cur.x += (D.home.x - D.cur.x) * 0.06; D.cur.y += (D.home.y - D.cur.y) * 0.06;
  g0dxCursor(ctx, Math.round(D.cur.x), Math.round(D.cur.y), D.fly, D.fly && D.fly.to, null, now);
}

// ---------- the card when it stops ----------
// Like a hacker's card (engine/hackers.js buildHkCard): its logo, why it stopped, the clicks, how far. A tap closes it.
function g0dxStopClose() { const c = st.g0dxStop; if (!c || performance.now() - c.t0 < 400) return; st.g0dxStop = null; Sound.ui(); }
function buildG0dxStop(ctx, now) {
  const { put, bg, cells, addHit } = ctx, cd = st.g0dxStop, sty = hkStyle('g0dexe');
  const W = 34, art = hackerArt('g0dexe');
  const lines = [
    ...art.map(l => ({ t: l, col: sty.fg, bgc: sty.bg, bold: true })),
    { t: '' },
    { t: 'G0D.exe  //  STOPPED', col: C.bright, bold: true },
    { t: '' },
    ...wrapText(cd.why, W - 4).map(l => ({ t: l, col: sty.fg, bold: true })),
    { t: '' },
    { t: `clicks: ${cd.used} used, ${cd.left} left`, col: C.text },
    { t: `got to: sector ${cd.sector}`, col: C.text },
    { t: `corps breached: ${cd.corps}`, col: C.text },
    { t: '' },
    { t: '[ tap ]', col: C.mid },
  ];
  const h = lines.length + 2, x0 = Math.max(0, Math.floor((L.wc - W) / 2)), y0 = Math.max(0, Math.floor((L.hc - h) / 2));
  clearRect(cells, x0, y0, W, h);
  popupBg(bg, 'hacker', x0, y0, W, h);
  addHit(x0, y0, W, h, { kind: 'g0dxstop' });
  const fc = sty.fg, head = ' G0D.exe OFFLINE ';
  put(x0, y0, ('+-' + head + '-'.repeat(W)).slice(0, W - 1) + '+', fc, 'hud', true);
  put(x0, y0 + h - 1, '+' + '-'.repeat(W - 2) + '+', fc, 'hud', true);
  for (let r = 1; r < h - 1; r++) { put(x0, y0 + r, '|', fc, 'hud'); put(x0 + W - 1, y0 + r, '|', fc, 'hud'); }
  lines.forEach((ln, r) => {
    const t = ln.t.slice(0, W - 4), x = x0 + Math.floor((W - t.length) / 2), y = y0 + 1 + r;
    if (ln.bgc) bg(x0 + 2, y, W - 4, ln.bgc, 1);
    if (t) put(x, y, t, ln.col || C.text, 'hud', !!ln.bold);
  });
}
OVERLAYS.push({ id: 'g0dx', on: () => !!st.g0dxStop, shown: () => !st.ad, build: (c, now) => buildG0dxStop(c, now), tap: () => g0dxStopClose(),
  key: k => { if (k === 'enter' || k === ' ' || k === 'escape' || k === 'x') g0dxStopClose(); } });
