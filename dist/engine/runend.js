// NeoN+1 engine/runend.js: the end of a run (die, endRun), the sector clear, and THE UPLINK between sectors.
// Moved out of engine/run.js (2026-11-05).
'use strict';
NEON_FILES.push(['engine/runend.js', 'v14.44']);

async function die() {
  // CONTINUE?: once per corp, 10 seconds to pay and keep going. 100cr, +100 every time you use it.
  const run0 = st.run, contPrice = costInt(ECON.continue) * ((run0 && run0.continues || 0) + 1);
  if (run0 && has('continue') && !zombie() && st.corp && !st.corp.contUsed && canSpend(contPrice) && st.lv && !st.mp) {
    st.corp.contUsed = true;
    modFired('continue');
    const go = await askContinue(contPrice);
    if (go) {
      run0.credits -= contPrice; run0.integrity = 1; run0.continues = (run0.continues || 0) + 1;
      await wipeOut(0);
      showBoard('play');
      resetTimer();
      layerReady(st.lv);
      setMsg('> CONTINUE! 1 integrity left.', C.accent);
      return;
    }
    await wipeOut(0);
    showBoard('play');
  }
  if (oneUpReady(run0) && await askOneUp()) return useOneUp(run0);   // the 1UP: back to the start of this corp
  if (st.corp && st.corp.hasBoss) { corpStat(st.corp.def.key).lost++; persist(); }   // codex record
  lightsOn();
  st.busy = true;
  st.timer = null;
  const safeTile = st.lv.tiles[st.lv.safe];
  if (safeTile.state === 'closed') safeTile.state = 'reveal';
  setMsg(zombie() ? '> you fell apart.' : bloodMoney() ? '> broke. real node revealed.' : '> traced. real node revealed.', C.danger);
  st.dying = true;      // the music powers down instead of cutting out
  Sound.death();
  await wait(1100);
  st.hkDeath = hkDeathFor();   // a hacker's last word as the screen falls apart
  if (st.hkDeath) st.hkDeath.t0 = performance.now();
  await endRun(false);
}

// win = cashed out after a sector clear.
async function endRun(win) {
  const run = st.run;
  st.busy = true;
  st.timer = null;
  run.ended = true;
  statRunEnd(run, win);
  questRunEnd(run, win);   // died with the DISC: it drops again (engine/quests.js)
  clearRun();
  if (!win) {
    // Losing: the whole screen glitches out.
    const cells = snapshot(() => true);
    st.hideAll = true;
    st.wipe = null;
    const ms = fallOut(cells); flash(C.danger, 0.2, 0.4);
    Sound.collapse(ms / 1000);
    await wait(ms + 150 + (st.hkDeath ? 1600 : 0));
    st.hkDeath = null;
  }
  // Winning: the final boss's success wipe carries straight into the results screen.

  const newBest = !run.practice && run.depth > save.best;
  if (!run.practice) {
    save.runs++;
    if (win) save.wins++;
    if (newBest) save.best = run.depth;
  }
  // REP: cashing out banks it all; dying banks nothing (DEADMAN keeps a part).
  const repWorth = repFor(run);
  const rep = run.practice ? 0 : win ? repWorth : Math.floor(repWorth * [0, 0.25, 0.5][legacyLv('dms')]);
  if (rep) { save.rep = (save.rep || 0) + rep; save.repTotal = (save.repTotal || 0) + rep; }
  if (win && !run.practice) save.cashouts = (save.cashouts || 0) + 1;
  tallyRunEnd(run, win, rep);   // THE RECORD (the FEAT box comes up over the end screen)
  noteHistory(run, { win, rep });
  bestSeedsNote(run);   // REPLAYS: your 10 deepest seeds (engine/menus.js)
  persist();
  lbSubmit(run, win);   // the online leaderboard (engine/leaders.js)

  // Where you were traced, and the corps you breached (visited corp nodes you finished).
  const c = st.corp;
  const diedAt = !win && c ? `${c.def.name}${c.hasBoss ? (st.lv && st.lv.boss ? ' BOSS' : ` ${c.idx + 1}/${c.counts.length - 1}`) : ''}${run.sector ? `, sector ${run.sector + 1}` : ''}` : '';
  const breached = run.visited.map(id => run.map[id])
    .filter(n => (n.type === 'corp' || n.type === 'final') && (win || n.id !== run.at)).map(n => n.corp);
  st.result = { win, depth: run.depth, corps: run.corps, earned: run.earned, newBest, practice: run.practice, seed: run.seed, heaven: !!run.heaven, quest: run.quest || null,
    rep, repWorth, sectors: run.sectorsCleared || 0,
    diedAt, breached, mods: run.mods.slice(), modTier: Object.assign({}, run.modTier), items: run.items.map(x => Object.assign({}, x)),
    map: run.map, visited: run.visited.slice(), at: run.at };
  st.corp = null; st.lv = null;
  st.dying = false;
  scenePalette(null);
  showBoard('over');
  // Losing builds the results up out of the empty screen (no decode-in).
  st.overReveal = win ? null : { t0: performance.now() + 200, shown: 0, typed: 0, y: null, lt: 0 };
  st.overMap = null;
  if (!win) st.boardStart = -1e9;
  {
    const scrollMap = d => {
      const om = st.overMap; if (!om || om.view == null) return;
      const t = nextTop(om.top, d, om.max != null ? om.max : (om.total || mapRows(st.result.map)) - om.view);   // (the shared scroll area's steps)
      if (t !== om.top) { om.top = t; Sound.tick(); }
    };
    st.scroll = scrollMap;
    st.keyHandler = k => { if (k === 'arrowup' || k === 'arrowdown') { scrollMap(k === 'arrowup' ? -1 : 1); return true; } return false; };
    if (st.lbPost) st.keyHandler = lbOverKeys(st.keyHandler);   // the leaderboard initials (engine/leaders.js)
  }
  st.busy = false;
  setMsg(win ? '> root access_' : '> link severed_', win ? C.accent : C.danger);
  if (win) { flash(C.accent, 0.25, 0.8); Sound.ui(); }
}

// ---------------- Sector clear ----------------
// OMNI beaten: fireworks, then cash out (bank REP, the run ends) or push on into the
// next sector, which starts at the OMNI you just beat.
async function sectorClear(skipped) {
  const run = st.run;
  run.sectorsCleared = (run.sectorsCleared || 0) + 1;
  run.pending = { kind: 'sector', skipped };
  tallySector(run);   // THE RECORD
  if (has('failsafe') && !has('zombie')) run.failsafeUsed = false;   // FAILSAFE recharges each stage
  if (!run.practice && run.sectorsCleared > (save.bestSector || 0)) { save.bestSector = run.sectorsCleared; persist(); }
  st.corp = null; st.lv = null; st.timer = null; st.dying = false;
  saveRun();
  showSectorClear(skipped, true);
}
function showSectorClear(skipped, fanfare, root = null) {
  const run = st.run;
  // the corps you breached in this sector (by code, like the end screen), and a ROOT picture (data/art/root.js)
  const breached = run.visited.map(id => run.map[id]).filter(n => n && (n.sector || 0) === run.sector && (n.type === 'corp' || n.type === 'final')).map(n => n.corp);
  const roots = Object.keys(ART_ROOT);
  st.result = { sector: true, skipped, depth: run.depth, corps: run.corps, earned: run.earned, n: run.sectorsCleared,
    rep: repFor(run), practice: run.practice, quest: run.quest || null, broken: !!(run.quest === 'h3av3n' && run.sector === 0), seed: run.seed, boss: st.corp ? st.corp.def.name : FINAL.name,
    breached, root: root && ART_ROOT[root] ? root : roots[Math.floor(Math.random() * roots.length)] };
  st.corp = null; st.lv = null; st.timer = null;
  scenePalette(null);
  showBoard('over');
  st.overReveal = null; st.overMap = null;
  st.busy = false;
  setMsg('> root access_', C.accent);
  if (fanfare) {
    if (skipped) Sound.bossWin();   // a skipped boss never played its fanfare
    flash(C.accent, 0.25, 0.8); shake(6, 0.5); fireworkShow();
  }
}
async function pushOn() {
  const run = st.run;
  if (st.transitioning || !run) return;
  const old = run.sector, skipped = !!(run.pending && run.pending.skipped);
  run.sector++;
  if (legacyLv('wind') && run.integrity < run.maxInt && !zombie()) run.integrity++;   // SECOND WIND (THE BOARD)
  if (oneUpOpen(run)) run.oneUp = 1;   // the 1UP charges again every sector (used or not, you hold one)
  if (run.quest === 'h3av3n' && run.sector === 1) addHeavenSector(run.map, run.seed, 1);   // the H3AV3N seed: sector 2 is heaven (engine/heaven.js)
  else addSector(run.map, run.seed, run.sector, run.forceEvent || null);   // (forceEvent: the editor's TESTING tab)
  run.forceEvent = null; run.fence = [];   // what THE FENCE didn't sell back is gone
  st.result = null;
  // Beat OMNI (not skipped): its boss reward first, then the map climbs from the old
  // sector to the new one. Cashing out skips it (the run ends anyway).
  if (skipped || sectorHas('headfirst', old)) { run.pending = null; return swapTo(() => toMap(old)); }   // (HEAD FIRST: its spoils came first)
  run.pending = { kind: 'omni', from: old };
  saveRun();
  await swapTo(() => openOmniReward(old));
}
// ---- THE UPLINK: the checkpoint between sectors (the user's idea, 2026-10-26). Pushing on costs bandwidth: a fee
// for every mod you carry, by its rarity, plus a minimum, all x the sector you're leaving (data/economy.js
// ECON.uplink). The mods you don't keep are sold for a share of their fee. Then the sector boss's reward (free).
// CASH OUT ends the run here. BLOOD MONEY and ZOMBIE can't be sold (they rewrite your health); LEVERAGE can
// cover the fee (into debt).
const UPLINK_LOCKED = ['bloodmoney', 'zombie'];
const uplinkMult = () => ((st.run && st.run.sector) || 0) + 1;
const uplinkMin = () => costInt(ECON.uplink.min) * uplinkMult();
const uplinkFee = key => costInt(ECON.uplink[modView(key).rarity] != null ? ECON.uplink[modView(key).rarity] : ECON.uplink.common) * uplinkMult();
const uplinkSell = key => Math.floor(uplinkFee(key) * ECON.uplink.sellPct);
function openUplink() {
  const run = st.run;
  if (!run) return;
  if (run.quest === 'h3av3n' && run.sector === 0) return openBrokenUplink();   // the H3AV3N seed: it's broken
  if (run.quest === 'had3s' && run.sector >= HAD3S_SECTORS - 1) { setMsg('> the bottom of HAD3S. nowhere deeper to go.', C.rep); return cashOut(); }   // HAD3S: two sectors, then out
  const keep = Object.fromEntries(run.mods.map(k => [k, true]));
  // PASS (gear): the whole fee is cut (ECON.uplink.pass); on by default when you hold one, tap to save it
  const hasPass = () => run.items.some(s => s.key === 'pass');
  let usePass = hasPass();
  const tally = () => {
    let fee = uplinkMin(), sold = 0;
    for (const k of run.mods) if (keep[k]) fee += uplinkFee(k); else sold += uplinkSell(k);
    const cut = usePass && hasPass() ? Math.round(fee * ECON.uplink.pass) : 0;
    return { fee: fee - cut, raw: fee, cut, sold, net: fee - cut - sold };
  };
  const canGo = () => run.credits - tally().net >= creditFloor();
  const go = () => {
    if (st.transitioning) return;
    if (!canGo()) return Sound.deny();
    const t = tally(), sold = run.mods.filter(k => !keep[k]);
    for (const k of sold) removeMod(k);
    if (t.cut) takeItem('pass');
    run.credits -= t.net;
    run.uplinks = (run.uplinks || 0) + 1; run.uplinkPaid = (run.uplinkPaid || 0) + t.fee;
    Sound.buy();
    st.uplink = null;
    pushOn();
    setMsg(`> uplink: -${t.fee}cr${t.cut ? ' (pass used)' : ''}${sold.length ? `, sold ${sold.length} for +${t.sold}cr` : ''}.`, C.money);
  };
  const togglePass = () => { if (!hasPass()) return Sound.deny(); usePass = !usePass; Sound.tick(); };
  const toggle = k => { if (UPLINK_LOCKED.includes(k)) return Sound.deny(); keep[k] = !keep[k]; Sound.tick(); };
  st.uplink = { keep, tally, canGo, toggle, togglePass, push: go, cash: cashOut, fee: uplinkFee, sell: uplinkSell, locked: UPLINK_LOCKED };   // (read by tools/econsim.js)
  questUplink();   // with the DISC: POPS reminds you (engine/quests.js)
  // The screen (the user's design, 2026-10-29): a checkbox list of your mods (unchecked = sold), each showing the
  // tray's short text; tapping a row toggles it and runs its ticker (its name, then its whole description, scrolling).
  // The list scrolls when it's long (RAM DOUBLER). Then the fees, their total and your credits (a sold mod's money
  // is in them), and the two buttons: PAY XXXcr (push on) and EARN XX REP (cash out).
  const area = { top: 0 };
  let tick = null;   // { k, t0 }: the row whose ticker runs
  const ticker = k => {
    const v = modView(k), full = `${v.name}: ${v.desc}      `;
    const steps = Math.max(0, Math.floor((performance.now() - tick.t0 - 900) / 140));   // a beat on the name, then it scrolls
    const o = steps % full.length;
    return (full + full).slice(o, o + 40);
  };
  const sp = s => String(s).split('').join(' ');   // P A Y
  const feeLine = (label, val, col, bold = false) => {
    const txt = label + val.padStart(32 - label.length);
    return { text: txt, colorAt: i => i < label.length ? C.mid : col, bold };
  };
  openPanel('UPLINK', (T, B, X) => {
    const t = tally(), ok = canGo(), mods = run.mods;
    T('U P L I N K', C.accent);
    T('going deeper costs credits.', C.mid);
    T('each mod you carry costs more.', C.mid);
    T('');
    const items = mods.map((k, i) => {
      const v = modView(k), locked = UPLINK_LOCKED.includes(k), on = keep[k], ticking = tick && tick.k === k;
      return { list: true, id: 'up' + i, onTap: () => { tick = { k, t0: performance.now() }; toggle(k); },
        check: locked ? '*' : on ? 'x' : ' ', checkCol: locked ? C.dim : on ? C.accent : C.mid,
        badge: k, badgeTier: run.modTier[k] || 0, badgeDim: !on,
        name: ticking ? ticker(k) : (v.tip || v.desc), clip: ticking ? 'cut' : 'ellipsis', col: ticking ? C.bright : on ? C.text : C.mid,
        right: on ? String(uplinkFee(k)) : '+' + uplinkSell(k), rightCol: on ? C.money : C.accent };
    });
    // PASS (gear): a row of its own at the end, checked = use it
    if (hasPass()) items.push({ list: true, id: 'pass', onTap: togglePass, check: usePass ? 'x' : ' ', checkCol: usePass ? C.accent : C.mid,
      name: 'PASS: half the fee', clip: 'ellipsis', col: usePass ? C.text : C.mid,
      right: '-' + Math.round(t.raw * ECON.uplink.pass), rightCol: usePass ? C.money : C.dim });
    // the list gets what the rest of the screen leaves (the rest: ~22 rows)
    const rest = 23 + (leverage() ? 1 : 0) + (t.cut ? 1 : 0) + (holdingDisc() ? 1 : 0) + (hasLoot('dogtag') ? 1 : 0);
    const rows = Math.max(1, Math.min(items.length, L.hc - 2 - rest));
    if (items.length) scrollArea(X, T, area, items, rows, 'upl');
    else T('no mods to carry.', C.dim);
    T('');
    const have = run.credits + t.sold, short = creditFloor() - (have - t.fee);
    X(feeLine('uplink fee', uplinkMin() + 'cr', C.money));
    X(feeLine('mod fees', (t.raw - uplinkMin()) + 'cr', C.money));
    if (t.cut) X(feeLine('pass', '-' + t.cut + 'cr', C.money));
    X({ text: ' '.repeat(26) + '------', col: C.dim });
    X(feeLine('total', t.fee + 'cr', C.money, true));
    X(feeLine('your credits', have + 'cr', ok ? C.accent : C.danger));
    if (leverage()) T(`leverage: you can go down to ${creditFloor()}cr`, C.dim);
    T('');
    const subPush = ok ? `- enter sector ${run.sector + 2} -` : `- need ${short}cr more to move on -`;
    const subCash = run.practice ? '- practice: no REP -' : '- cash out: end the run -';
    const w = Math.max(30, subPush.length + 8, subCash.length + 8);   // the two buttons the same width (drawBox pads 8)
    X(ok ? { box: true, text: `${sp('PAY')}   ${sp(t.fee + 'cr')}`, sub: subPush, id: 'push', onTap: go, minW: w, col: C.money }
      : { box: true, text: `${sp('REMOVE')}   ${sp('MODS')}`, sub: subPush, id: 'push', onTap: go, minW: w, disabled: true, disCol: C.danger });
    X({ box: true, text: run.practice ? `${sp('END')}   ${sp('RUN')}` : `${sp('EARN')}   ${sp(repFor(run))}   ${sp('REP')}`, sub: subCash, id: 'cash', onTap: cashOut, minW: w, col: C.rep });
    if (!run.practice) T(legacyLv('dms') ? `dying later keeps ${[0, 25, 50][legacyLv('dms')]}% of your REP.` : 'die later and you bank nothing.', C.dim);
    if (holdingDisc() && questRun() && questOf('pops').step === 'find') T('+ cash out to bring POPS the DISC', C.rep);
    if (hasLoot('dogtag') && questRun() && questOf('pops').step === 'd0g') T('+ cash out to bring POPS the DOGTAG', C.rep);
  }, '> uplink: what do you carry?', { full: true });
}
// The H3AV3N seed's uplink (docs/QUESTS.md): broken. No fee, no cash out: the only way is on, into heaven.
function openBrokenUplink() {
  const run = st.run, sp = s => String(s).split('').join(' ');
  const go = () => { if (st.transitioning) return; Sound.ui(); pushOn(); setMsg('> b0y: the uplink\'s dead. we go up.', G0DF_BLUE); };
  openPanel('UPLINK', (T, B, X) => {
    T('U P L I N K', C.danger);
    const t = 'the uplink is broken.';
    T([...t].map((ch, i) => FX.hs(i * 3.1 + Math.floor(performance.now() / 140)) < 0.08 ? noiseCh() : ch).join(''), C.danger);
    T('no way out from here.', C.mid);
    T('and nothing to pay.', C.mid);
    T('');
    T('your mods come with you.', C.dim);
    T('');
    X({ box: true, text: `${sp('PUSH')}   ${sp('ON')}`, sub: '- into H3AV3N -', id: 'push', onTap: go, minW: 30, col: C.danger });
  }, '> uplink: no signal.', { full: true });
  st.keyHandler = k => { if (k === 'enter' || k === ' ') { go(); return true; } return false; };
}
// OMNI is every corp at once: a boss mod from any corp, a general mod, and one more.
function openOmniReward(from) {
  const run = st.run;
  const r = rngFor(run.seed, 'omni', from), boss = run.map[bossIdOf(from)], cerb = boss && boss.corp === 'cerberus';
  const corpPick = cerb ? pickMods(r, ['bleach'], 1) : pickMods(r, modsOfKind('corp'), 1);   // (CERBERUS: its BLEACH)
  const gen = pickMods(r, modsOfKind('gen'), 1, corpPick);
  const third = pickMods(r, modsOfKind('gen', 'minor'), 1, corpPick.concat(gen));
  const exotic = exoticOffer(run.seed, 'sector', from, 1);   // the sector boss always has one (if any are left)
  const loot = bossLoot(boss, true);   // and loot for the bag (ECON.loot.sector)
  openChoice({
    title: cerb ? 'CERBERUS BREACHED' : 'OMNI//CORE BREACHED', col: C.accent,
    head: [[`sector ${from + 1} spoils. take one.`, C.text]], extra: lootLine(loot),
    options: shuffle(corpPick.concat(gen, third), r).concat(exotic),
    skipLabel: `[ SKIP  +${earnInt(ECON.skip.sector)}cr ]`,
    onSkip: () => { const cr = earnInt(ECON.skip.sector); earn(cr, run); Sound.loot(); },
    msg: '> the core is open.',
    next: () => toMap(from),
  });
}
async function cashOut() {
  if (st.transitioning || !st.run) return;
  // LOCKER (THE BOARD): first, put one mod away for your next run
  const run = st.run;
  if (legacyLv('locker') && !run.practice && !run.tutorial && !run.lockerAsked && run.mods.some(k => !UPLINK_LOCKED.includes(k))) {
    run.lockerAsked = true;
    return swapTo(openLocker);
  }
  st.transitioning = true;
  Sound.ui();
  questCashOut(run);   // out with the DISC: POPS asks for it (engine/quests.js)
  await wipeOut(0);
  st.transitioning = false;
  endRun(true);
}

// LOCKER: pick one of your mods to put away (a step lower), or none. Then the run ends as a cash out.
function openLocker() {
  const run = st.run, mods = run.mods.filter(k => !UPLINK_LOCKED.includes(k));
  let sel = 0;
  const lower = k => Math.max(0, ((run.modTier || {})[k] || 0) - 1);
  const put = k => {
    if (k) { save.locker = { key: k, tier: lower(k) }; persist(); Sound.buy(); setMsg(`> ${MODS[k].name.toLowerCase()} is in the locker.`, C.rep); }
    cashOut();
  };
  openPanel('LOCKER', (T, B, X) => {
    T('L O C K E R', C.rep);
    T('put one mod away for your next run.', C.text);
    T('it comes back a step lower.', C.mid);
    T('');
    mods.forEach((k, i) => {
      const v = modView(k), dn = modView(k, lower(k));
      X({ list: true, id: 'lk' + i, onTap: () => { sel = i; Sound.tick(); }, sel: i === sel, badge: k, badgeTier: run.modTier[k] || 0, name: v.name,
        right: `back as ${dn.tier === v.tier ? 'is' : RARITY[dn.rarity].label}`, rightCol: C.mid });
    });
    T('');
    X({ box: true, text: 'P U T   I T   A W A Y', sub: `- ${MODS[mods[sel]].name.toLowerCase()} -`, id: 'lkput', onTap: () => put(mods[sel]), minW: 28 });
    B('[ NOTHING: CASH OUT ]', 'lknone', () => put(null));
  }, '> locker: one mod to keep.', { full: true });
}

const jackIn = () => startRun(st.seed, st.practice, { seeded: st.seeded });
const retry = () => startRun(st.result ? st.result.seed : st.seed, false, { seeded: true });   // (the same seed again: the seed boards)
// Died in H3AV3N (engine/heaven.js): the same seed, back at the bottom of heaven's map (the user, 2026-10-30).
const retryHeaven = () => st.result && st.result.quest ? startRun(st.result.seed, true) : startRun(st.result ? st.result.seed : st.seed, true, { heaven: true });   // (the H3AV3N seed: from the start, still QUEST)
const newRun = () => startRun(newSeed(), false);
