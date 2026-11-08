// NeoN+1 engine/g0dexe.js: G0D.exe, the gear that plays for you (docs/BACKLOG.md "G0D.exe", Greg 2026-11-08).
// Needs engine/hackers.js (it's a crew hacker there: its card, cursor and notes line), engine/run.js (pick) and
// engine/active.js (the gear switch) loaded first.
//
// Step 1 (this file today): the gear, its card, its cursor, the click count, pausing, and playing corp layers.
//   Corps you've beaten (the codex page is open): it taps the real node. The rest: a guess.
//   A corp with its own rules can add an `auto` hook next to `dress` / `hint`:
//     auto(lv, g) -> a tile to tap, null to wait, or undefined for the default.  g = { known, cands, real }
//     (or g0dxCell(lv, cell): a cell to tap, for a corp that takes cell taps, LAGRANGE)
//   With an auto hook, it looks again as its @ lands (the board may have moved while it flew).
// Later steps: the map and money, gear in corps, phishing.
//
// st.run.g0dx: { on, left (clicks), used, card (show the card when it next comes in), stuck }
// save.g0dx: the dev settings { clicks, speed, beaten }
'use strict';
NEON_FILES.push(['engine/g0dexe.js', 'v14.60']);

// ---------- settings ----------
const G0DX_CLICKS = [100, 250, 500, 1000, 9999];
const G0DX_SPEEDS = [1, 2, 4];
// ms at 1x: thinking at the start of a layer, the flight out to a node, the flight back, the gap before the next tap
const G0DX_MS = { think: 1000, out: 220, back: 260, gap: 300 };
function g0dxCfg() {
  save.g0dx = Object.assign({ clicks: 500, speed: 1, beaten: 1 }, save.g0dx || {});
  return save.g0dx;
}
const g0dxMs = k => G0DX_MS[k] / (g0dxCfg().speed || 1);

// ---------- the switch ----------
const g0dxState = () => (st.run && st.run.g0dx) || null;
const g0dxOn = () => { const g = g0dxState(); return !!(g && g.on && holds('g0dexe')); };
const g0dxCanToggle = () => { const g = g0dxState(); return !!(st.run && !st.run.ended && g && (g.on || g.left > 0)); };
const g0dxWhy = () => { const g = g0dxState(); return !g ? 'not set up: give it from the dev menu.' : g.left <= 0 ? 'out of clicks.' : 'wait a moment.'; };
const g0dxKnows = key => corpStat(key).breached >= (g0dxCfg().beaten || 1);
const g0dxNote = () => { const g = g0dxState(); return g && g.on ? `+G0D.exe ${g.left}` : 'G0D.exe ||'; };

// The dev menu's [give G0D.exe]: onto your belt, with a fresh count of clicks.
function g0dxGive() {
  const run = st.run;
  if (!run) return false;
  if (!holds('g0dexe') && !addItem('g0dexe', 0)) { setMsg('> no room on the belt for G0D.exe.', C.danger); return false; }
  run.g0dx = { on: false, left: g0dxCfg().clicks, used: 0, card: true };
  run.practice = true;
  setMsg(`> G0D.exe on your belt. ${run.g0dx.left} clicks. tap it on.`, C.divine);
  return true;
}
function g0dxToggle() {
  const g = g0dxState();
  if (!g) return;
  st.hoverItem = -1; st.selItem = -1;
  if (g.on) return g0dxPause('paused. tap it to go on.');
  g.on = true; g.stuck = null;
  Sound.shield();
  setMsg(`> G0D.exe online. ${g.left} clicks.`, C.divine);
  g0dxLog(`on, ${g.left} clicks`);
}
// Paused: by its own gear, by you tapping something yourself (engine/input.js), or when it's stuck.
function g0dxPause(why) {
  const g = g0dxState();
  if (!g || !g.on) return;
  g.on = false;
  Sound.tick();
  setMsg(`> G0D.exe ${why}`, C.divine);
  g0dxLog('paused: ' + why);
}
// A short line per decision: the console, and the last 60 on the run (to read back while tuning it).
function g0dxLog(text) {
  const g = g0dxState();
  if (g) { (g.log = g.log || []).push(text); if (g.log.length > 60) g.log.shift(); }
  try { console.log('[g0d] ' + text); } catch (e) { /* no console */ }
}

// ---------- into each corp ----------
// Switched on, it's in every corp layer (engine/hackers.js hkTick calls this each frame). The card comes once,
// the first time after you switch it on.
function g0dxEnsure(lv) {
  const run = st.run, c = st.corp, g = g0dxState();
  if (!g0dxOn() || !lv || st.mode !== 'play' || !c || !c.hasBoss || run.tutorial || hkUp('g0dexe')) return;
  const h = { id: 'g0dexe', side: 'good', hp: 1, max: 1, lv2: false, out: false, stole: 0, took: 0, row: 0 };
  (c.hk = c.hk || []).push(h);
  markSeen('hk_g0dexe');
  if (g.card) { g.card = false; hkCard(h); }
  g0dxLog(`${c.def.key}: ${g0dxKnows(c.def.key) ? 'known' : 'a guess'}`);
}

// ---------- what to tap ----------
function g0dxChoose(lv) {
  const def = st.corp.def, now = performance.now();
  const cands = lv.tiles.filter(t => t.state === 'closed' && !t.loaded && !(t.denied && t.denied > now));
  const real = cands.find(isReal) || null, known = g0dxKnows(def.key);
  if (def.auto) { const r = def.auto(lv, { known, cands, real }); if (r !== undefined) return r; }
  if (known && real) return real;
  const open = cands.filter(t => !t.ruledOut);
  return pickR(open.length ? open : cands, Math.random) || null;
}
// A cell as a target (a corp's cellTap: LAGRANGE), for an auto hook: where it is, and that it's a cell.
const g0dxCell = (lv, cell) => ({ cell, col: cell % lv.cols, row: Math.floor(cell / lv.cols), state: 'closed', cellTap: true });
// The tap itself: a click spent, then the same pick() your own tap goes through (a cell: the corp's cellTap, like input.js).
function g0dxTap(lv, h, t) {
  const g = g0dxState();
  if (!g || !g.on || st.lv !== lv || st.mode !== 'play' || st.busy || t.state !== 'closed') return false;
  if (g.left <= 0) { g0dxPause('is out of clicks.'); return false; }
  g.left--; g.used++;
  const s = hkS(lv, h);
  s.taps = (s.taps || 0) + 1;
  if (t.cellTap) corpHook('cellTap', t.cell); else pick(lv.tiles.indexOf(t));
  if (g.left <= 0) { hkSay(h, hkLine(h, 'out')); g0dxPause('is out of clicks.'); }
  return true;
}

// ---------- how it plays (HK_AI, engine/hackers.js) ----------
// Each layer: the cursor hovers about the board for a second (thinking), then its @ flies out to a node, taps it
// and flies back. s.fly = { t, t0, hit } while it's out.
HK_AI.g0dexe = {
  layer(lv, h, s, now) { s.next = 0; s.thinkTo = now + g0dxMs('think'); s.fly = null; s.taps = 0; },
  tick(lv, h, s, now) {
    if (now > (s.wanderAt || 0)) {   // hovering: a new spot over the board every so often
      s.wanderAt = now + 250 + Math.random() * 300;
      s.home = { x: L.gx + rand(2, Math.max(3, lv.cols * (TILE_W + GAP_X) - 2)), y: BOARD_Y + rand(1, Math.max(2, lv.rows * (TILE_H + GAP_Y) - 2)) };
    }
    if (!g0dxOn()) { s.fly = null; s.lastTick = 0; return; }
    if (!s.lastTick || s.held) { s.held = false; s.thinkTo = Math.max(s.thinkTo || 0, now + g0dxMs('think')); }   // back from a pause or a card: think again
    s.lastTick = now;
    if (s.fly) {
      if (!s.fly.hit && now >= s.fly.t0 + g0dxMs('out')) {
        s.fly.hit = true; s.fly.hitAt = now;
        if (st.corp.def.auto) { const t2 = g0dxChoose(lv); if (t2) s.fly.t = t2; else { s.fly.missed = true; return; } }   // (look again: LAGRANGE slid)
        if (!g0dxTap(lv, h, s.fly.t)) s.fly.missed = true;
      }
      if (s.fly && s.fly.hit && now >= s.fly.hitAt + g0dxMs('back')) { s.fly = null; s.next = now + g0dxMs('gap'); }
      return;
    }
    if (now < (s.thinkTo || 0) || now < (s.next || 0)) return;
    if ((s.taps || 0) > lv.tiles.length * 3 + 4) {   // tapping and getting nowhere: hand it back
      const g = g0dxState(); if (g) g.stuck = `${st.corp.def.key} layer ${st.corp.idx}`;
      return g0dxPause(`is stuck here. (${st.corp.def.name.toLowerCase()})`);
    }
    const t = g0dxChoose(lv);
    if (!t) return;
    s.fly = { t, t0: now, hit: false };
  },
  // its cursor: <@> on G0D's red, its name (or its words) under it. While the @ is out, the cursor shows < >.
  draw(ctx, lv, h, s, now) {
    const { put, bg } = ctx, sty = hkStyle(h.id), x = Math.round(s.cur.x - 1), y = Math.round(s.cur.y);
    if (st.hkCard) s.held = true;   // (a card is up: it thinks again after)
    const on = g0dxOn(), f = s.fly;
    const say = s.bubble && now < s.bubble.until ? s.bubble.text : on ? null : 'paused';
    bg(x, y, 3, sty.bg, on ? 1 : 0.6);
    put(x, y, f ? '< >' : logoMark(h.id), on ? sty.fg : mixHex(sty.fg, sty.bg, 0.5), 'fx', true);
    const tag = hkTagText(h.id, say), tx = clamp(x, 0, Math.max(0, L.wc - tag.length));
    if (say) { bg(tx, y + 1, tag.length, sty.fg, 1); put(tx, y + 1, tag, sty.bg, 'fx', true); }
    else { bg(tx, y + 1, tag.length, sty.bg, 0.8); put(tx, y + 1, tag, sty.fg, 'fx'); }
    if (f) {   // the @ in flight: out to the node, then back to the cursor (eased), a faint trail behind it
      const home = { x: x + 1, y }, node = hkCell(f.t);
      const at = k => {
        const tt = f.hit ? clamp((now - f.hitAt - k) / g0dxMs('back'), 0, 1) : clamp((now - f.t0 - k) / g0dxMs('out'), 0, 1);
        const e = tt * tt * (3 - 2 * tt), a = f.hit ? node : home, b = f.hit ? home : node;
        return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
      };
      [70, 35].forEach((lag, i) => { const p = at(lag); put(p.x, p.y, '.', mixHex(sty.fg, sty.bg, 0.55 - i * 0.25), 'fx'); });
      const p = at(0);
      bg(p.x, p.y, 1, sty.bg, 1); put(p.x, p.y, '@', sty.fg, 'fx', true);
    }
    if (s.faceAt && now - s.faceAt < 1600) {   // talking: the eye bounces up above the cursor (like the crew's faces)
      const fc = (ART_FACES[h.id] || { art: [] }).art, hop = Math.round(Math.abs(Math.sin((now - s.faceAt) / 120)) * 1);
      fc.forEach((l, k) => { bg(x - 1, y - 4 + k - hop, 5, sty.bg, 1); put(x - 1, y - 4 + k - hop, l, sty.fg, 'fx', true); });
    }
  },
};
