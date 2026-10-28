// NeoN+1 engine/hackers.js: hackers in play (docs/PROGRESSION.md step 3). Rivals come in with the RIVAL anomaly (one
// per corp, for the whole corp); crew come in when you use CALL gear (for the rest of the corp). Who they are, their
// colors and their lines: data/hackers.js. How each one plays: HK_AI below.
//
// st.corp.hk: the hackers in this corp: [{ id, side, hp, max, lv2, out, stole, took, row, refrozen }]
// st.lv.hks: per layer, per hacker: { next, aim, cur: { x, y } (their cursor, in cells), ... }
// Rivals: beat one (breach the corp it's in) and it counts toward its logo (5: the feat). Crew: each call counts (5:
// CREW on THE BOARD; 10: LVL 2). Crew never take your pay.
'use strict';
NEON_FILES.push(['engine/hackers.js', 'v13.71']);

const HK_RIVALS = Object.keys(HACKERS).filter(k => HACKERS[k].side === 'bad');
const HK_CREW = Object.keys(HACKERS).filter(k => HACKERS[k].side === 'good');
const hkDef = id => HACKERS[id];
const hkStyle = id => (hkDef(id) && hkDef(id).style) || { fg: C.bright, bg: C.dim };
// Their color as text on the game's background: the style's text color, or its background when that's the light one (POPS).

const hkInk = id => { const s = hkStyle(id); return hexLum(s.fg) < 0.25 ? s.bg : s.fg; };
// D0PPEL wears your name, glitched
const hkName = id => id === 'doppel' ? String((profile().name || 'RUNNER')).toUpperCase().replace(/A/g, '4').replace(/E/g, '3').replace(/I/g, '1').replace(/O/g, '0').slice(0, 9) : hkDef(id).name;
const hkList = () => (st.corp && st.corp.hk) || [];
const hkUp = id => hkList().find(h => h.id === id && !h.out) || null;   // in this corp and still going
const hkRivalsUp = () => hkList().filter(h => h.side === 'bad' && !h.out);
const hkCrewOn = id => legacyLv('crew_' + id) > 0;   // CREW: NAME bought on THE BOARD
const hkLvl2 = id => legacyLv('crew2_' + id) > 0;
const hkBars = h => '#'.repeat(Math.max(0, h.hp)) + '-'.repeat(Math.max(0, h.max - h.hp));
const hkLine = (h, k) => { const d = hkDef(h.id), l = d[k]; return Array.isArray(l) ? pickR(l, Math.random) : l || ''; };

// ---------------- Coming in ----------------
// A rival for a corp with the RIVAL anomaly: one of the cast, fixed by the seed (d0g only from sector 3 on).
function hkRivalFor(node) {
  const pool = HK_RIVALS.filter(k => k !== 'd0g' || (node.sector || 0) >= 2);
  return pickR(pool, rngFor(st.run.seed, 'rival', node.id));
}
// Bring one in (its card first). how: 'rival' | 'call'
function hkSpawn(id, how) {
  const c = st.corp, d = hkDef(id);
  if (!c || !d || hkUp(id)) return null;
  const lv2 = d.side === 'good' && hkLvl2(id);
  const max = d.hp + (lv2 && (id === 'brick') ? 2 : 0) + (lv2 && (id === 'baud' || id === 'mother') ? 2 : 0);
  const h = { id, side: d.side, hp: max, max, lv2, out: false, stole: 0, took: 0, row: 0 };
  (c.hk = c.hk || []).push(h);
  markSeen('hk_' + id);   // the codex
  tally(how === 'call' ? 'hack:call:' + id : 'hack:met:' + id);
  hkCard(h);
  petHacker(h);   // your pet notices (engine/pet.js)
  if (st.lv) hkLayerStart(st.lv);   // into the layer that's up
  // counters that work the moment they arrive
  if (id === 'nana' && hkUp('ggez')) hkOut(hkUp('ggez'), 'LANGUAGE. *logs off*');
  if (id === 'ggez' && hkUp('nana')) hkOut(h, 'LANGUAGE. *logs off*');
  if (id === 'kludge' && canHeal() && !c.kludgeHealed) { c.kludgeHealed = true; heal(1); }
  return h;
}

// ---------------- The card ----------------
// When a hacker comes in: their logo in their colors, name, shtick and their line. The layer's clock holds while
// it's up; a tap (or a key) closes it.
function hkCard(h) {
  (st.hkCards = st.hkCards || []).push({ id: h.id, side: h.side });
  hkSay(h, hkLine(h, 'enter'));
}
function hkCardTick(now) {
  if (!st.hkCard && st.hkCards && st.hkCards.length && !st.wipe && !st.transitioning && !st.intro && !st.bossIntro && st.mode === 'play') {
    st.hkCard = Object.assign(st.hkCards.shift(), { t0: now });
    Sound.alarm && st.hkCard.side === 'bad' ? Sound.alarm() : Sound.shield();
    if (st.lv) { st.hkCard.hold = st.lv.holdUntil || 0; st.lv.holdUntil = Infinity; }
  }
}
function hkCardClose() {
  const c = st.hkCard;
  if (!c || performance.now() - c.t0 < 400) return;
  st.hkCard = null;
  if (st.lv && st.lv.holdUntil === Infinity && !(st.corp && st.corp.frozen)) st.lv.holdUntil = c.hold && c.hold > performance.now() ? c.hold : 0;
  Sound.ui();
}
const hkCardTap = () => hkCardClose();
function hkCardKey(k) { if (k === 'enter' || k === ' ' || k === 'escape' || k === 'x') hkCardClose(); }
function buildHkCard(ctx, now) {
  const { put, bg, cells, addHit } = ctx, cd = st.hkCard, d = hkDef(cd.id), sty = hkStyle(cd.id);
  const W = 34, art = hackerArt(cd.id), lines = [
    ...art.map(l => ({ t: l, col: sty.fg, bgc: sty.bg, bold: true })),
    { t: '' },
    { t: `${hkName(cd.id)}  //  ${d.side === 'bad' ? 'RIVAL' : 'CREW'}`, col: C.bright, bold: true },
    ...wrapText(d.shtick, W - 4).map(l => ({ t: l, col: C.text })),
    { t: '' },
    ...wrapText(`"${hkLine({ id: cd.id }, 'enter')}"`, W - 4).map(l => ({ t: l, col: hkInk(cd.id), bold: true })),
    { t: '' },
    { t: '[ tap ]', col: C.mid, btn: true },
  ];
  const h = lines.length + 2, x0 = Math.max(0, Math.floor((L.wc - W) / 2)), y0 = Math.max(0, Math.floor((L.hc - h) / 2));
  clearRect(cells, x0, y0, W, h);
  for (let r = 0; r < h; r++) bg(x0, y0 + r, W, C.bg, 1);
  addHit(x0, y0, W, h, { kind: 'hkcard' });
  const fc = d.side === 'bad' ? C.danger : C.accent, head = d.side === 'bad' ? ' RIVAL INCOMING ' : ' CREW ON THE LINE ';
  put(x0, y0, ('+-' + head + '-'.repeat(W)).slice(0, W - 1) + '+', fc, 'hud', true);
  put(x0, y0 + h - 1, '+' + '-'.repeat(W - 2) + '+', fc, 'hud', true);
  for (let r = 1; r < h - 1; r++) { put(x0, y0 + r, '|', fc, 'hud'); put(x0 + W - 1, y0 + r, '|', fc, 'hud'); }
  lines.forEach((ln, r) => {
    const t = ln.t.slice(0, W - 4), x = x0 + Math.floor((W - t.length) / 2), y = y0 + 1 + r;
    if (ln.bgc) bg(x0 + 2, y, W - 4, ln.bgc, 1);
    if (t) put(x, y, t, ln.col || C.text, 'hud', !!ln.bold);
  });
}

// ---------------- Talking ----------------
// A hacker's line in the terminal, in their colors, with their face bouncing by their cursor.
function hkSay(h, text) {
  if (!text) return;
  const sty = hkStyle(h.id);
  setMsg(`> ${hkName(h.id).toLowerCase()}: ${text}`, hkInk(h.id));
  if (st.lv) { const s = hkS(st.lv, h); s.faceAt = performance.now(); }
}
// Out: beaten (rivals) or out of bars (crew). Their face glitches away by their cursor.
function hkOut(h, text) {
  if (!h || h.out) return;
  h.out = true; h.hp = 0;
  hkSay(h, text || hkLine(h, 'out'));
  if (st.lv) { const s = hkS(st.lv, h); s.goneAt = performance.now(); }
  Sound.collapse ? Sound.collapse(0.4) : Sound.trap();
  if (h.side === 'bad' && h.took) {   // LEECH coughs up half
    const back = Math.floor(h.took / 2); st.run.credits += back;
    setMsg(`> ${hkName(h.id).toLowerCase()} dropped off. +${back}cr back.`, C.money);
  }
}
function hkHurt(h, n = 1) {
  if (!h || h.out) return;
  h.hp = Math.max(0, h.hp - n);
  if (h.hp <= 0) hkOut(h);
}

// ---------------- Each layer ----------------
const hkS = (lv, h) => { lv.hks = lv.hks || {}; return lv.hks[h.id] = lv.hks[h.id] || { next: 0, aim: null, cur: null }; };
const hkCands = lv => lv.tiles.filter(t => t.state === 'closed' && !t.loaded);
const hkIce = lv => hkCands(lv).filter(t => !isReal(t));
const hkCell = t => { const { tx, ty } = tileOrigin(t); return { x: tx + 3, y: ty + 2 }; };
function hkLayerStart(lv) {
  if (!lv || lv.n < 2) return;
  const now = performance.now(), tier = st.corp.tier || 1;
  for (const h of hkList()) {
    if (h.out) continue;
    const s = hkS(lv, h), ai = HK_AI[h.id];
    if (s.started) continue;
    s.started = true;
    s.next = now + 1800 + Math.random() * 1200 - Math.min(800, tier * 120);
    if (ai && ai.layer) ai.layer(lv, h, s, now);
  }
}
// Every frame in a layer (engine/run.js layerTick): each hacker's own rules, then their cursors drift.
function hkTick(lv, now) {
  if (!lv || lv.n < 2 || st.hkCard || !hkList().length) return;
  hkLayerStart(lv);
  for (const h of hkList()) {
    if (h.out) continue;
    const s = hkS(lv, h), ai = HK_AI[h.id];
    if (ai && ai.tick && !st.busy && lv.readyAt != null && !(st.dying)) ai.tick(lv, h, s, now);
    if (st.lv !== lv || st.busy && !s.aim) { /* a pick is resolving: cursors still move */ }
    // the cursor glides to its aim (or wanders near the middle)
    const to = s.aim && s.aim.t ? hkCell(s.aim.t) : s.home || (s.home = { x: L.gx + rand(2, Math.max(3, lv.cols * (TILE_W + GAP_X) - 2)), y: BOARD_Y + rand(1, Math.max(2, lv.rows * (TILE_H + GAP_Y) - 2)) });
    if (!s.cur) s.cur = { x: to.x, y: to.y - 2 };
    s.cur.x += (to.x - s.cur.x) * 0.12; s.cur.y += (to.y - s.cur.y) * 0.12;
    if (!s.aim && Math.random() < 0.01) s.home = null;
    if (h.side === 'good' || HK_AI[h.id].emotes) { if (!s.emoteAt || now > s.emoteAt) { s.emoteAt = now + 5000 + Math.random() * 6000; if (Math.random() < 0.5) hkSay(h, hkLine(h, h.side === 'bad' ? 'taunt' : 'clue')); } }
    else if (!s.tauntAt || now > s.tauntAt) { s.tauntAt = now + 6000 + Math.random() * 6000; if (s.tauntAt && Math.random() < 0.4) hkSay(h, hkLine(h, 'taunt')); }
  }
  hkNotes(lv);
}
// The notes row: each hacker's name and bars (rivals: vs NAME ###; crew: +NAME ###)
function hkNotes(lv) {
  lv.notes = (lv.notes || []).filter(n => !n.hk);
  for (const h of hkList()) lv.notes.push({ hk: true, text: h.out ? `${hkName(h.id).slice(0, 8).toLowerCase()} x_x` : `${h.side === 'bad' ? 'vs ' : '+'}${hkName(h.id).slice(0, 8)} ${hkBars(h)}`, tag: 'hk_' + h.id });
}
// A rival taps a node: ICE locks for you (and maybe costs it a bar); the real node: it takes the layer's pay.
function hkTap(lv, h, t, iceCost = 1) {
  if (!t || t.state !== 'closed') return;
  if (isReal(t)) return hkSteal(lv, h, t);
  lockTile(t, C.danger, 'rival');
  if (iceCost) hkHurt(h, iceCost);
  if (!h.out && Math.random() < 0.3) hkSay(h, hkLine(h, 'taunt'));
}
function hkSteal(lv, h, t, burned = false) {
  h.stole++; lv.payCut = 1; lv.scanned = true; st.busy = true;
  Sound.trap(); flash(C.danger, 0.15, 0.3);
  setMsg(burned ? '> the fire got the real node. no pay.' : `> ${hkName(h.id).toLowerCase()} got it first. no pay.`, C.danger);
  (async () => { await wait(500); if (st.lv === lv) await onSafe(t); })();
}
// Aim, then tap a beat later (the cursor shows where): s.aim = { t, at, fn }
function hkAim(s, t, ms, fn, now) { s.aim = { t, at: now + ms, fn }; }
function hkFire(lv, h, s, now) {
  if (!s.aim) return false;
  if (now < s.aim.at) return true;
  const a = s.aim; s.aim = null;
  if (a.t.state === 'closed') a.fn(a.t);
  return true;
}

// ---------------- How each one plays ----------------
const HK_AI = {
  // ---- rivals
  iceman: {   // re-freezes ICE (locked or ruled out), faster with every ICE you hit
    tick(lv, h, s, now) {
      if (now < s.next) return;
      s.next = now + Math.max(1500, 4000 - 400 * (h.fed || 0));
      const t = pickR(lv.tiles.filter(o => !isReal(o) && ((o.state === 'locked' && o.lockedBy !== 'hit') || (o.state === 'closed' && o.ruledOut))), Math.random);
      if (!t) return;
      s.aim = { t, at: now + 400, fn: () => {} };
      setTimeout(() => { if (st.lv !== lv) return; t.state = 'closed'; t.ruledOut = false; t.refrozen = true; delete t.lockedBy; s.aim = null; Sound.tick(); hkSay(h, 'refrozen.'); }, 400);
    },
    clear(lv, h, perfect) { if (perfect) hkHurt(h); },
    ice(h, t) { h.fed = (h.fed || 0) + 1; if (t.refrozen && hkUp('brick')) hkHurt(h); },   // BRICK hits back
  },
  ggez: {   // only emotes: they stick on nodes and cover them
    tick(lv, h, s, now) {
      if (now < s.next) return;
      s.next = now + 1000 + Math.random() * 1000;
      const t = pickR(hkCands(lv), Math.random);
      if (!t) return;
      t.hkCover = { text: pickR(['xD', 'GG', 'EZ', ':P', 'L', '??', 'lol', 'rekt'], Math.random), until: now + 3000, col: hkStyle(h.id).fg };
      s.aim = { t, at: now + 300, fn: () => {} }; setTimeout(() => { s.aim = null; }, 300);
    },
    clear(lv, h, perfect) { h.row = perfect ? h.row + 1 : 0; if (h.row >= 2) hkOut(h, 'ur hacking. reported. *rage quits*'); },
  },
  turbo: {   // taps in reading order, fast, never reads the tell
    tick(lv, h, s, now) {
      if (hkFire(lv, h, s, now) || now < s.next) return;
      s.next = now + 600;
      const t = hkCands(lv)[0];
      if (t) hkAim(s, t, 250, x => hkTap(lv, h, x, hkUp('baud') ? 2 : 1), now);   // BAUD races him
    },
  },
  doppel: {   // copies your taps, flipped left to right, a beat late
    tick(lv, h, s, now) {
      if (!s.mirror || now < s.mirror.at) return;
      const m = s.mirror; s.mirror = null;
      const t = lv.tiles.find(o => o.col === m.col && o.row === m.row);
      if (t && t.state === 'closed') { s.aim = { t, at: now, fn: () => {} }; hkTap(lv, h, t); setTimeout(() => { s.aim = null; }, 200); }
    },
    you(lv, h, s, t) {
      if (hkUp('hype')) return;   // it copies HYPE instead
      const col = lv.cols - 1 - t.col;
      if (col !== t.col) { s.mirror = { col, row: t.row, at: performance.now() + 900 }; s.aim = { t: lv.tiles.find(o => o.col === col && o.row === t.row), at: Infinity, fn: () => {} }; }
    },
  },
  sysop: {   // ACCESS DENIED on a node for 3s
    tick(lv, h, s, now) {
      if (now < s.next || hkUp('dialup')) return;   // DIALUP: old friends
      s.next = now + 4000;
      const t = pickR(hkCands(lv), Math.random);
      if (!t) return;
      t.denied = now + 3000;
      s.aim = { t, at: Infinity, fn: () => {} }; setTimeout(() => { if (s.aim && s.aim.t === t) s.aim = null; }, 3000);
    },
    clear(lv, h) { hkHurt(h); },
  },
  vulture: {   // waits until 3 nodes are left, then dives
    tick(lv, h, s, now) {
      if (hkFire(lv, h, s, now)) return;
      const c = hkCands(lv);
      if (c.length > 3 || hkUp('pops') || now < s.next) return;   // POPS guards the last three
      s.next = now + 1500;
      const real = c.find(isReal), t = real && Math.random() < 2 / 3 ? real : pickR(c.filter(o => !isReal(o)), Math.random) || real;
      if (t) { hkSay(h, 'mine.'); hkAim(s, t, 700, x => hkTap(lv, h, x), now); }
    },
  },
  phish: {   // fake tells and lies
    layer(lv, h, s) {
      if (hkUp('root')) return;   // ROOT: the fakes don't show
      const t = pickR(hkIce(lv), Math.random);
      if (t) { t.say = ['PICK', 'ME', ':)']; t.phished = true; }
    },
    tick(lv, h, s, now) {
      if (now < s.next) return;
      s.next = now + 5000 + Math.random() * 3000;
      const real = lv.tiles[lv.safe], lie = Math.random() < 0.75;
      const pool = hkCands(lv).filter(o => lie ? !isReal(o) : isReal(o));
      const t = pickR(pool, Math.random);
      if (!t) return;
      const where = `${t.row < lv.rows / 2 ? 'top' : 'bottom'} ${t.col < lv.cols / 2 ? 'left' : 'right'}`;
      hkSay(h, `psst: it's the ${where} one :)${hkUp('root') ? (lie ? '  [ROOT: FALSE]' : '  [ROOT: TRUE]') : ''}`);
      s.aim = { t, at: Infinity, fn: () => {} }; setTimeout(() => { s.aim = null; }, 1500);
      void real;
    },
    clear(lv, h, perfect) { if (perfect) hkHurt(h); },
  },
  d0g: {   // reads the tell: picks only nodes that could be it, often right
    tick(lv, h, s, now) {
      if (hkFire(lv, h, s, now) || now < s.next) return;
      s.next = now + 2200 - Math.min(600, (st.corp.tier || 1) * 80);
      const c = hkCands(lv).filter(o => !o.ruledOut), real = c.find(isReal);
      const read = !hkUp('null');   // NULL: he can't read it
      const t = real && read && Math.random() < 0.3 + 0.5 / Math.max(1, c.length) ? real : pickR(c, Math.random);
      if (t) hkAim(s, t, 600, x => hkTap(lv, h, x, 0), now);   // ICE doesn't cost him
    },
    clear(lv, h) { hkHurt(h); },
  },
  hcf: {   // random taps; ICE it hits catches fire, and fire spreads
    tick(lv, h, s, now) {
      // the fire: each second it spreads to a closed neighbor of a burning node
      if (!s.fireAt || now > s.fireAt) {
        s.fireAt = now + 1000;
        const burning = lv.tiles.filter(o => o.fire && now - o.fire < 3500);
        for (const b of burning) {
          const n = pickR(lv.tiles.filter(o => o.state === 'closed' && Math.abs(o.col - b.col) + Math.abs(o.row - b.row) === 1), Math.random);
          if (!n || Math.random() < 0.4) continue;
          if (isReal(n)) { if (hkUp('kludge')) continue; n.fire = now; hkSteal(lv, h, n, true); return; }   // KLUDGE puts it out
          n.fire = now; lockTile(n, C.danger, 'fire');
        }
      }
      if (hkFire(lv, h, s, now) || now < s.next) return;
      s.next = now + 800;
      const t = pickR(hkCands(lv), Math.random);
      if (t) hkAim(s, t, 300, x => { if (!isReal(x)) x.fire = performance.now(); hkTap(lv, h, x); }, now);
    },
  },
  leech: {   // takes a quarter of your pay; perfects knock it off, ICE feeds it
    clear(lv, h, perfect) { if (perfect) hkHurt(h); },
    ice(h) { if (h.hp < h.max) h.hp++; },
  },
  // ---- crew
  pops: {   // burns an ICE he can read, every 3s (LVL 2: 2s)
    tick(lv, h, s, now) {
      if (hkFire(lv, h, s, now) || now < s.next) return;
      s.next = now + (h.lv2 ? 2000 : 3000);
      const t = pickR(hkIce(lv).filter(o => !o.ruledOut), Math.random);
      if (t && hkCands(lv).length > 2) hkAim(s, t, 500, x => { lockTile(x, C.accent, 'crew'); }, now);
    },
  },
  brick: {},   // takes your ICE hits (hkTakeHit)
  null: {   // hunts the rivals: a bar off one every 4s (LVL 2: 2s)
    tick(lv, h, s, now) {
      if (now < s.next) return;
      s.next = now + (h.lv2 ? 2000 : 4000);
      const r = pickR(hkRivalsUp(), Math.random);
      if (!r) { if (!s.idle) { s.idle = true; hkSay(h, 'nothing to do.'); } return; }
      hkHurt(r); Sound.tick(); hkSay(h, `${hkName(r.id).toLowerCase()}: -1.`);
    },
  },
  nana: {   // heals after each layer you clear; when you hit ICE, she locks 2 out of spite
    clear(lv, h) { if (canHeal()) heal(h.lv2 ? 2 : 1); },
    youIce(h, lv) { for (const t of shuffle(hkIce(lv), Math.random).slice(0, 2)) lockTile(t, C.accent, 'crew'); hkSay(h, 'nobody does that to my grandkid.'); },
  },
  dialup: {   // connects (8s, LVL 2: 4s), then rules out half the ICE, once a layer
    layer(lv, h, s, now) { s.conn = now + (h.lv2 ? 4000 : 8000); },
    tick(lv, h, s, now) {
      if (s.done || now < s.conn) return;
      s.done = true;
      const ice = hkIce(lv).filter(o => !o.ruledOut);
      for (const t of shuffle(ice, Math.random).slice(0, Math.floor(ice.length / 2))) t.ruledOut = true;
      Sound.shield(); hkSay(h, 'connected. half of these are junk.');
    },
  },
  baud: {   // burns an ICE every 0.8s, a bar each; stops at 2 nodes left
    tick(lv, h, s, now) {
      if (hkFire(lv, h, s, now) || now < s.next) return;
      s.next = now + 800;
      if (hkCands(lv).length <= 2) return;
      const t = pickR(hkIce(lv), Math.random);
      if (t) hkAim(s, t, 300, x => { lockTile(x, C.accent, 'crew'); hkHurt(h); }, now);
    },
  },
  mother: {},   // stops a tap on ICE at your last integrity (hkStopTap)
  root: {   // marks ICE (LVL 2: 2) each layer
    layer(lv, h) { for (const t of shuffle(hkIce(lv).filter(o => !o.ruledOut), Math.random).slice(0, h.lv2 ? 2 : 1)) t.ruledOut = true; },
  },
  kludge: {   // tapes 2 nodes (LVL 2: 3) each layer: ICE locks; the tape won't stick to the real node
    layer(lv, h) {
      for (const t of shuffle(hkCands(lv), Math.random).slice(0, h.lv2 ? 3 : 2)) {
        if (isReal(t)) { t.tapeFell = performance.now(); setTimeout(() => hkSay(h, "huh. tape won't stick to that one."), 900); }
        else { t.taped = true; lockTile(t, C.accent, 'crew'); }
      }
    },
  },
  hype: {},   // cheers: a perfect streak pays more (hkPayMult)
};
for (const k of ['ggez', 'hype']) HK_AI[k].emotes = true;

// ---------------- Hooks (engine/run.js, engine/active.js) ----------------
// You tapped a node (D0PPEL copies it).
function hkYouTap(t) { const lv = st.lv; for (const h of hkList()) if (!h.out && HK_AI[h.id] && HK_AI[h.id].you) HK_AI[h.id].you(lv, h, hkS(lv, h), t); }
// SYSOP: a denied node can't be tapped.
function hkDenied(t) { if (t.denied && t.denied > performance.now()) { Sound.deny(); setMsg('> ACCESS DENIED.', hkStyle('sysop').fg); return true; } return false; }
// MOTHER: at your last integrity, a tap on ICE is stopped (it costs her a bar).
function hkStopTap(t) {
  const m = hkUp('mother');
  if (!m || isReal(t) || st.god || zombie() || st.run.integrity > 1) return false;
  hkSay(m, 'no, dear.'); hkHurt(m); Sound.shield();
  return true;
}
// BRICK: an ICE hit costs him a bar instead (returns the terminal line, or null).
function hkTakeHit() {
  const b = hkUp('brick');
  if (!b) return null;
  hkHurt(b); Sound.shield(); shake(4);
  return b.out ? '> ICE. brick took it. brick is down.' : `> ICE. brick took it. ${hkBars(b)}`;
}
// Your ICE hit: rivals feed on it (LEECH, ICE MAN), NANA locks 2 out of spite.
function hkOnIce(t) {
  const lv = st.lv;
  for (const h of hkList()) {
    if (h.out) continue;
    const ai = HK_AI[h.id];
    if (ai && ai.ice) ai.ice(h, t);
    if (ai && ai.youIce && lv) ai.youIce(h, lv);
  }
}
// A layer you cleared: rivals lose bars by their rules, NANA heals, HYPE counts the streak.
function hkOnClear(lv, perfect) {
  const c = st.corp;
  if (!c || !hkList().length || lv.n < 2) return;
  c.hypeRow = perfect ? (c.hypeRow || 0) + 1 : 0;
  for (const h of hkList()) { if (h.out) continue; const ai = HK_AI[h.id]; if (ai && ai.clear) ai.clear(lv, h, perfect); }
  const n = hkUp('null'); if (n && !hkRivalsUp().length && hkS(lv, n).idle) hkOut(n, 'nothing here. logging off.');
}
// Pay: LEECH takes a quarter (not with MOTHER up); HYPE adds 10% (LVL 2: 15%) per perfect in the streak (up to 5).
function hkPayMult(lv) {
  let m = 1;
  if (hkUp('leech') && !hkUp('mother')) m *= 0.75;
  const hy = hkUp('hype');
  if (hy && st.corp.hypeRow) m *= 1 + (hy.lv2 ? 0.15 : 0.1) * Math.min(5, st.corp.hypeRow);
  return m;
}
function hkAfterPay(pay) { const l = hkUp('leech'); if (l && pay && !hkUp('mother')) l.took += Math.round(pay / 3); }
// The corp is done: rivals there are beaten (the record), the old RIVAL bonus, then everyone leaves.
function hkCorpEnd(c) {
  const run = st.run;
  for (const h of c.hk || []) {
    if (h.side !== 'bad') continue;
    tally('hack:beat:' + h.id);
    const bonus = h.out ? earnInt(ECON.rival.flatlined) : h.stole === 0 ? earnInt(ECON.rival.beat) : 0;
    if (bonus) { run.credits += bonus; run.earned += bonus; setMsg(h.out ? `> ${hkName(h.id).toLowerCase()} flatlined. +${bonus}cr` : `> you beat ${hkName(h.id).toLowerCase()}. +${bonus}cr`, C.money); }
  }
}
// You died with hackers there: a rival's logo and taunt, or a crew member calling your name, as the screen falls apart.
function hkDeathFor() {
  const all = hkList(), r = all.find(h => h.side === 'bad'), crew = all.find(h => h.side === 'good' && !h.out);
  if (r) return { id: r.id, side: 'bad', text: hkLine(r, 'kill') };
  if (crew) return { id: crew.id, side: 'good', text: hkLine(crew, 'snake').replace(/\{name\}/g, profile().name) };
  return null;
}
function buildHkDeath(ctx, now) {
  const { put, bg } = ctx, dd = st.hkDeath, sty = hkStyle(dd.id), age = now - dd.t0;
  if (age < 250) return;
  const rows = dd.side === 'bad' ? hackerArt(dd.id) : (ART_FACES[dd.id] || { art: [] }).art;
  const y0 = Math.floor(L.hc / 2) - rows.length - 1, w = dd.side === 'bad' ? LOGO_W + 4 : 9, x0 = Math.floor((L.wc - w) / 2);
  const shakeX = dd.side === 'good' ? Math.round(Math.sin(age / 50) * (age < 1500 ? 1 : 0)) : 0;
  rows.forEach((l, k) => { bg(x0 + shakeX, y0 + k, w, sty.bg, 1); put(x0 + shakeX + Math.floor((w - l.length) / 2), y0 + k, l, sty.fg, 'hud', true); });
  const text = dd.text.slice(0, Math.floor((age - 250) / 40));
  put(Math.floor((L.wc - dd.text.length) / 2), y0 + rows.length + 1, text, hkInk(dd.id), 'hud', true);
}

// ---------------- On the board ----------------
// Cursors (the full mark on their colors, the name under it), faces when they talk, emote covers, denied nodes,
// fire, tape. (engine/scene.js, after the board)
function buildHackers(ctx, lv, now) {
  const { put, bg } = ctx;
  for (const t of lv.tiles) {
    if (t.state !== 'closed' && !t.fire) continue;
    const { tx, ty } = tileOrigin(t);
    if (t.hkCover && t.hkCover.until > now && t.state === 'closed') { const s = t.hkCover.text; bg(tx + 1, ty + 2, 5, C.bg, 1); put(tx + 1 + Math.floor((5 - s.length) / 2), ty + 2, s, t.hkCover.col, 'fx', true); }
    if (t.denied && t.denied > now && t.state === 'closed') { bg(tx, ty + 2, TILE_W, hkStyle('sysop').bg, 1); put(tx, ty + 2, 'DENIED!', hkStyle('sysop').fg, 'fx', true); }
    if (t.fire && now - t.fire < 3500) put(tx + 1, ty, Math.floor(now / 150) % 2 ? '^v^v^' : 'v^v^v', C.danger, 'fx', true);
    if (t.taped && t.state !== 'closed') put(tx + 1, ty + 2, '#TAPE', C.mid, 'fx');
    if (t.tapeFell && now - t.tapeFell < 1200) put(tx + 1, ty + 4 + Math.floor((now - t.tapeFell) / 300), '#tape', C.dim, 'fx');
  }
  for (const h of hkList()) {
    const s = lv.hks && lv.hks[h.id];
    if (!s || !s.cur) continue;
    const sty = hkStyle(h.id), mark = logoMark(h.id), x = Math.round(s.cur.x - 1), y = Math.round(s.cur.y);
    if (h.out) {   // gone: the face glitches out
      if (s.goneAt && now - s.goneAt < 900) { const f = (ART_FACES[h.id] || { art: [] }).art; f.forEach((l, k) => put(x - 1, y - 3 + k, [...l].map(ch => Math.random() < (now - s.goneAt) / 900 ? ' ' : ch).join(''), sty.fg, 'fx', true)); }
      continue;
    }
    bg(x, y, 3, sty.bg, 1); put(x, y, mark, sty.fg, 'fx', true);
    const tag = hkName(h.id).toLowerCase().slice(0, 8);
    bg(x, y + 1, tag.length, sty.bg, 0.8); put(x, y + 1, tag, sty.fg, 'fx');
    if (s.faceAt && now - s.faceAt < 1600) {   // talking: the face bounces up above the cursor
      const f = (ART_FACES[h.id] || { art: [] }).art, hop = Math.round(Math.abs(Math.sin((now - s.faceAt) / 120)) * 1);
      f.forEach((l, k) => { bg(x - 1, y - 4 + k - hop, 5, sty.bg, 1); put(x - 1, y - 4 + k - hop, l, sty.fg, 'fx', true); });
    }
  }
}

// ---------------- CALL gear ----------------
// In a corp's layer: CALL brings a random crew member who isn't here; a named one brings them.
const hkCallable = () => !!st.corp && st.corp.hasBoss && !!st.lv && st.lv.n > 1;
const CALL_GEAR = {
  call: {
    ok: () => hkCallable() && HK_CREW.some(k => !hkUp(k)),
    why: () => !hkCallable() ? 'only in a corp.' : 'nobody left to call.',
    use() { const id = pickR(HK_CREW.filter(k => !hkUp(k) && !(hkList().find(h => h.id === k))), Math.random) || pickR(HK_CREW.filter(k => !hkUp(k)), Math.random); Sound.ui(); hkSpawn(id, 'call'); },
  },
};
for (const id of HK_CREW) CALL_GEAR['call_' + id] = {
  ok: () => hkCallable() && !hkUp(id),
  why: () => !hkCallable() ? 'only in a corp.' : `${HACKERS[id].name.toLowerCase()} is already here.`,
  use() { Sound.ui(); hkSpawn(id, 'call'); },
};
Object.assign(BOSS_GEAR, CALL_GEAR);   // engine/active.js runs them like the boss gear
// A crew member's own gear only turns up once they're in your crew (engine/panels.js shopGear, engine/run.js loot).
const gearAllowed = k => !ITEMS[k].crew || hkCrewOn(ITEMS[k].crew);
