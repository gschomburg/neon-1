// NeoN+1 engine/hud.js: a run's header rows 2-3 (buildHudRows, called by buildScene in engine/scene.js).
// Row 2: LAYER / S on the left. On the right the life slot: INT (a # bar up to HP_BAR_MAX max, n/max past it),
// ZOMBIE's ROT or BLOOD MONEY's LIFE. One space left of its label, the status chip: FW, 1UP, COIN FLIP's
// multiplier, 3 characters each, taking turns. Row 3: where you are, and CR.
// Decided (Greg, 2026-11-12): the plan is in docs/BACKLOG.md ("The INT row").
'use strict';
NEON_FILES.push(['engine/hud.js', 'v14.89']);

// ---------- FIREWALL ----------
// FW counts in hex and stops at F (Greg, 2026-11-12), like the belt's counts (engine/panels.js beltLabel).
// engine/active.js (the FWALL gear) and engine/g0dfight.js use these too.
const FW_MAX = 15;
const fwTag = n => 'FW' + clamp(n, 0, FW_MAX).toString(16).toUpperCase();

// ---------- INT ----------
// Watch the shown value. Only the live frame (collectHits) watches, so snapshots don't double it.
// Bar mode: a gain pops each new # (HP_POP ms); a loss breaks each lost # into bits that hop and fall.
// Number mode (max over HP_BAR_MAX): the number counts to the new value a step at a time (HP_STEP ms, quicker for a
// big jump): down in red, each step dropping a digit; up bright, with a pop. A new max flashes (HP_MAX_FLASH ms).
const HP_POP = 520, HP_STEP = 110, HP_STEP_LOOK = 260, HP_MAX_FLASH = 800;
const HP_BAR_MAX = 10;   // past this max INT, n/max
const HP_LOW_NUM = 3;    // number mode goes red at this or below (the bar at 1)
const hpFx = { run: null, shown: null, x0: 0, gain: {}, num: null, numAt: -1e9, numDir: 0, max: null, maxAt: -1e9 };

function hpBurst(cx, chars) {
  const x = pxX(cx), y = pxY(2);
  const bits = chars.map(ch => ({ ch, x: x + rand(-0.3, 0.3) * L.cw, y: y + rand(-0.3, 0.3) * L.chh, col: C.danger }));
  explode(bits, x, y + L.chh * 0.8, { col: C.danger, power: 0.35, grav: 1, life: [0.55, 0.95] });
}

// x0: where the bar or the number starts. bar: bar mode.
function hpWatch(cur, x0, bar, now) {
  const run = st.run;
  if (hpFx.run !== run || hpFx.shown == null) {
    Object.assign(hpFx, { run, shown: cur, x0, gain: {}, num: cur, numAt: -1e9, numDir: 0, max: run.maxInt, maxAt: -1e9 });
    return;
  }
  if (run.maxInt !== hpFx.max) { if (!reduced()) hpFx.maxAt = now; hpFx.max = run.maxInt; }
  const was = hpFx.shown;
  if (bar || reduced()) {
    if (bar && cur > was && !reduced()) for (let i = was; i < cur; i++) hpFx.gain[i] = now + (i - was) * 90;
    if (bar && cur < was && !reduced()) for (let i = cur; i < was; i++) hpBurst(hpFx.x0 + i, ['#', '+', '=', '.', "'"]);
    hpFx.num = cur;
  } else if (hpFx.num !== cur && now - hpFx.numAt >= Math.min(HP_STEP, 700 / Math.abs(cur - hpFx.num))) {
    const dir = cur > hpFx.num ? 1 : -1, left = String(hpFx.num);
    hpFx.num += dir; hpFx.numAt = now; hpFx.numDir = dir;
    if (dir < 0) hpBurst(x0 + String(run.maxInt).length - 1, [left[left.length - 1], '.', "'"]);   // the old ones digit falls off
  }
  hpFx.shown = cur; hpFx.x0 = x0;
}

// The life slot, right-aligned on row 2. Returns where its label starts (the status chip goes left of it).
function hudLife(ctx, run, now) {
  const { put, putR, cells, collectHits } = ctx;
  // FAILSAFE: shows 0 for a beat after the killing hit, then blinks back to 1
  const fsAge = st.fsAt && now >= st.fsAt ? now - st.fsAt : 1e9;
  const cur = fsAge < FAILSAFE_BEAT ? 0 : Math.max(0, run.integrity);
  const fsBlink = fsAge >= FAILSAFE_BEAT && fsAge < FAILSAFE_BEAT + 900 && Math.floor(fsAge / 110) % 2;
  if (zombie()) {   // ZOMBIE: rot in place of integrity, sickly as it climbs
    const rot = run.rot || 0, txt = `${String(rot).padStart(3, '0')}/${rotMax()}`;
    putR(2, txt, rot >= rotMax() - 30 ? C.danger : rot >= rotMax() / 2 ? C.money : C.accent);
    put(L.wc - txt.length - 4, 2, 'ROT', C.mid);
    return L.wc - txt.length - 4;
  }
  if (bloodMoney()) {   // BLOOD MONEY: your credits are your life; red when one more hit breaks you (a hit's cost: its tip)
    const txt = `${run.credits}cr`, cost = bloodCost(1);
    putR(2, txt, run.credits < cost ? C.danger : run.credits < cost * 3 ? C.money : C.accent);
    put(L.wc - txt.length - 5, 2, 'LIFE', C.mid);
    return L.wc - txt.length - 5;
  }
  const bar = run.maxInt <= HP_BAR_MAX, w = String(run.maxInt).length;
  const num = !bar && hpFx.run === run && hpFx.num != null ? hpFx.num : cur;
  const text = bar ? '#'.repeat(cur) + '-'.repeat(Math.max(0, run.maxInt - cur)) : `${String(num).padStart(w)}/${run.maxInt}`;
  const x0 = L.wc - text.length;
  if (collectHits) hpWatch(cur, x0, bar, now);
  const shownN = bar ? cur : num;
  const base = fsBlink ? C.bright : shownN <= (bar ? 1 : HP_LOW_NUM) ? C.danger : C.accent;
  // at 1 left it beats like a heart (two quick blinks)
  const beat = shownN === 1 && !fsBlink && (now % 1400 < 90 || (now % 1400 > 200 && now % 1400 < 290));
  const maxAge = now - hpFx.maxAt, maxBlink = hpFx.run === run && maxAge < HP_MAX_FLASH && Math.floor(maxAge / 100) % 2 === 0;
  const stepAge = now - hpFx.numAt, stepK = !bar && hpFx.run === run && hpFx.numDir && stepAge < HP_STEP_LOOK ? stepAge / HP_STEP_LOOK : -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ') continue;
    let col = base, bold = false, sc = 1;
    if (bar) {   // one char at a time: a new # pops up past the grid
      const t0 = hpFx.gain[i], k = t0 != null ? (now - t0) / HP_POP : 1, pop = k >= 0 && k < 1, isHash = ch === '#';
      if (pop) { col = k < 0.6 ? C.bright : base; bold = true; sc = 1 + 0.75 * Math.sin(Math.PI * k); }
      else if (beat && isHash) { col = C.bright; bold = true; sc = 1.15; }
      else if (maxBlink && !isHash) { col = C.bright; bold = true; }
    } else if (i < w) {   // your INT: counting
      if (stepK >= 0) { col = hpFx.numDir < 0 ? C.danger : C.bright; bold = true; sc = 1 + (hpFx.numDir < 0 ? 0.2 : 0.4) * Math.sin(Math.PI * stepK); }
      else if (beat) { col = C.bright; bold = true; sc = 1.15; }
    } else if (maxBlink) { col = C.bright; bold = true; }   // the /max part: it just changed
    cells.push({ ch, cx: x0 + i, cy: 2, own: 'hud', col, bold, sc });
  }
  put(x0 - 4, 2, 'INT', C.mid);   // (was INTEGRITY; the user, 2026-10-26)
  return x0 - 4;
}

// ---------- The status chip ----------
// Things that are on right now, 3 characters each on their own chip. With two or more they take turns
// (HUD_CHIP_MS each); one that's new or just changed jumps to the front. The swap goes a character at a time.
const HUD_CHIP_MS = 2400, HUD_SWAP_MS = 70;
const HUD_SCRAMBLE = '#%&@*!?=';
const hudChip = { run: null, seen: {}, idx: 0, at: 0, shown: null, from: null, swapAt: -1e9 };

function hudChips(run) {
  const out = [];
  if (st.corp && st.corp.wallAll) out.push({ key: 'fw', text: 'FW*', r: 'rare' });   // a FWALL's top tier: no hits this corp
  else if (run.shield > 0) out.push({ key: 'fw', text: fwTag(run.shield), r: 'rare' });
  if (run.oneUp > 0) out.push({ key: '1up', text: '1UP', r: 'legendary' });   // charged (engine/oneup.js)
  if (has('coinflip') && (run.coinMult || 1) > 1) out.push({ key: 'coin', text: '$x' + run.coinMult, r: MODS.coinflip.rarity });   // COIN FLIP's streak
  return out;
}

// Picks the chip to show and runs its swap (live frame only; a snapshot draws what's there).
function hudChipTick(list, now) {
  const H = hudChip;
  if (H.run !== st.run) Object.assign(H, { run: st.run, seen: {}, idx: 0, at: now, shown: null, from: null, swapAt: -1e9 });
  let jump = -1;
  list.forEach((c, i) => { if (H.seen[c.key] !== c.text) jump = i; });
  H.seen = {}; for (const c of list) H.seen[c.key] = c.text;
  if (jump >= 0) { H.idx = jump; H.at = now; }
  else if (list.length > 1 && now - H.at >= HUD_CHIP_MS) { H.idx = (H.idx + 1) % list.length; H.at = now; }
  if (H.idx >= list.length) H.idx = 0;
  const want = list[H.idx] || null;
  const same = (a, b) => (a ? a.text + a.r : '') === (b ? b.text + b.r : '');
  if (!same(want, H.shown)) { H.from = H.shown; H.shown = want; H.swapAt = reduced() ? -1e9 : now; }
}

function hudChipDraw(ctx, x, now) {
  const { put, bg } = ctx, H = hudChip;
  for (let i = 0; i < 3; i++) {
    const t = now - H.swapAt - i * HUD_SWAP_MS;
    const from = H.from && H.from.text[i], to = H.shown && H.shown.text[i];
    let c, ch;
    if (t < 0) { c = H.from; ch = from; }
    else if (t < HUD_SWAP_MS && (from || to)) { c = H.shown || H.from; ch = HUD_SCRAMBLE[(Math.floor(now / 35) + i * 3) % HUD_SCRAMBLE.length]; }
    else { c = H.shown; ch = to; }
    if (!c || !ch) continue;
    const chip = chipOf(c.r);
    bg(x + i, 2, 1, chip.bg, 1);
    put(x + i, 2, ch, chip.fg, 'hud', true);
  }
}

// ---------- Rows 2-3 ----------
function buildHudRows(ctx, run, now) {
  const { put, putR, collectHits } = ctx;
  put(0, 2, 'LAYER ', C.mid); put(6, 2, pad2(run.depth), C.bright);
  if (run.sector) { const x = 7 + pad2(run.depth).length; put(x, 2, 'S', C.mid); put(x + 1, 2, String(run.sector + 1), C.bright); }
  const labelX = hudLife(ctx, run, now);
  const list = hudChips(run);
  if (collectHits) hudChipTick(list, now);
  else if (hudChip.run !== run) { hudChip.shown = list[0] || null; hudChip.from = null; hudChip.swapAt = -1e9; }
  hudChipDraw(ctx, labelX - 1 - 3, now);

  // Row 3: where you are (the sector's on row 2), cut short before CR
  let where = 'OVERWORLD';
  if (st.mode === 'play' && st.corp) {
    const c = st.corp;
    const prog = c.def.progLabel ? c.def.progLabel(c) : c.hasBoss ? (st.lv && st.lv.boss ? 'BOSS' : `${c.idx + 1}/${c.counts.length - 1}`) : '';
    where = `${c.def.name} ${prog}`;
  } else if (st.mode === 'panel') where = st.panelTitle || '';
  else if (st.mode === 'fish') where = 'THE PIER';
  else if (st.mode === 'g0dfake') where = 'G0D // BREACHED';
  else if (st.mode === 'g0dend') where = 'G0D // DOWN';
  else if (st.mode === 'g0ddie') where = 'G0D // FIGHT';
  else if (st.mode === 'g0df' && st.g0df) where = `G0D // ${{ maze: 'MAZE', fight: 'FIGHT', stand: 'FINAL STAND' }[st.g0df.stage]}`;
  // LEVERAGE: in debt the credits go red, with your limit after them (CR -120/-150)
  const crTxt = `${(st.mode === 'play' && corpFlag('money')) || 'CR'} ${run.credits}${leverage() && run.credits < 0 ? '/' + creditFloor() : ''}`;
  putR(3, crTxt, run.credits < 0 ? C.danger : C.money);
  put(0, 3, where.slice(0, Math.max(0, L.wc - crTxt.length - 1)), st.lv && st.lv.boss && st.mode === 'play' ? C.danger : C.text);
}
