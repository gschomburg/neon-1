// NeoN+1 engine/deck.js: THE DECK (docs/DECK.md), a dev-only screen for now. Only the editor opens it (the screen
// picker's "the deck (dev)": engine/editor.js SCENES.deck). Its state lives in memory, never in the save: it's a
// mockup in the engine, to tune on the real grid. The board art: SCENE_ART.deck (asxii_art/deck_board_v06, copied in
// by tools/data/scene_art.js). The socket and part spots below are read off that art: move them when the art moves.
'use strict';
NEON_FILES.push(['engine/deck.js', 'v15.00']);

// ---------- data (a stand-in: the real lists come once Greg has sorted the chip ideas) ----------
// groups: [name, palette color key, what it's for]
const DECK_GROUPS = {
  boot: ['BOOT', 'rep', 'what a run starts with'], bios: ['BIOS', 'rep', "the run's rules"],
  crash: ['CRASH', 'bright', 'what happens when you die'], spoils: ['SPOILS', 'money', 'what corp bosses give'],
  shell: ['SHELL', 'accent', 'one command for THE SHELL'], psu: ['PSU', 'money', 'the cell: your power budget'],
  glyph: ['GLYPH', 'bright', 'your favourite glyph'], ov: ['OVERVOLT', 'danger', 'pay with integrity'],
  sudo: ['SUDO', 'accent', 'the strong commands'], boss: ['BOSS', 'money', 'wide chips from the big bosses'],
  heat: ['HEAT', 'danger', 'harder runs, more REP'],
};
const deckGroupCol = g => C[DECK_GROUPS[g][1]] || C.text;
// chips: key: [name, group, rarity, power, what it does, face (top row, bottom row: 3 wide, 5 for BOSS)]
const DECK_CHIPS = {
  DM5: ['DEADMAN', 'crash', 'epic', 1, 'dying keeps 50% of the REP you would have banked.', ['DED', 'MAN']],
  '1UP': ['1UP', 'crash', 'exotic', 3, "b0y's crash unit. die and go back to the start of the corp, once a run.", ['1UP', '^_^']],
  EJ1: ['EJECT', 'crash', 'common', 1, 'cash out from anywhere, once a run.', ['/^\\', 'EJT']],
  BB7: ['BLACK BOX', 'crash', 'rare', 1, 'when you die, one mod goes to the LOCKER.', ['[#]', 'BOX']],
  SP3: ['SPOILS', 'spoils', 'common', 0, 'a switch for corp bosses: take the REWARDS, or skip them for a HEAL or for CASH.', ['SPL', null]],
  GM7: ['GAMBLE', 'spoils', 'epic', 2, 'boss rewards come face down. one of them is a jackpot: two mods.', ['?!?', 'BET']],
  CD2: ['cd ..', 'shell', 'rare', 2, 'THE SHELL learns cd ..: back a row on the map, once a sector.', ['cd ', ' ..']],
  MK7: ['market', 'shell', 'epic', 2, 'THE SHELL learns market: a small black market right where you are, once a sector.', ['mkt', '[$]']],
  LS1: ['ls', 'shell', 'common', 1, 'THE SHELL learns ls: how many ICE and $ nodes are on this layer.', ['ls ', '#?$']],
  PS4: ['ps', 'shell', 'rare', 1, 'THE SHELL learns ps: where the rival hackers are on the map.', ['ps ', '@ @']],
  UN0: ['undo', 'shell', 'epic', 2, 'THE SHELL learns undo: take back your last ICE hit, once a sector.', ['und', '<-o']],
  ST4: ['STARTER', 'boot', 'rare', 1, "pick a mod you've found: it can show up in the starter perk.", ['STR', '>>>']],
  PT1: ['PET', 'boot', 'common', 0, 'pick the pet that comes along: COMPANION, the chick, the bug, the fish.', ['PET', '^.^']],
  HS2: ['HEADSTART', 'boot', 'common', 1, 'start on the second row of sector 1. pays a little less REP.', ['GO!', '>>2']],
  SM1: ['SIMON CHIP', 'bios', 'rare', 1, 'a corp chip: SIMON shows up 3x as often. flip it and it shows up less.', ['SIM', 'x3!']],
  QT0: ['QUIET', 'bios', 'rare', 1, 'no rival hackers turn up.', ['shh', '...']],
  AD5: ['ADWARE', 'bios', 'common', 1, 'more ads, and tapping one heals 1 INT.', ['AD!', '[x]']],
  SC1: ['STOCK CELL', 'psu', 'common', 0, 'comes with the deck. power 6.', ['[+]', 'C:6']],
  LI2: ['LI-ION', 'psu', 'rare', 0, 'a better cell. power 9.', ['[+]', 'Li9']],
  RX9: ['REACTOR', 'psu', 'legendary', 0, 'power 14, but -1 starting INT.', ['(*)', 'R14']],
  GR8: ['GREED', 'ov', 'rare', 2, '-1 starting INT. +25% credits.', ['GRD', '$-1']],
  LK7: ['LUCK', 'ov', 'epic', 2, '-1 starting INT. 1 in 5 drops roll a step rarer.', ['777', 'LCK']],
  GD0: ['mode.god', 'sudo', 'legendary', 3, 'THE SHELL learns mode.god: no damage for a sector, then it wears off.', ['g0d', 'mod']],
  OMNI: ["OMNI'S EYE", 'boss', 'exotic', 3, "every corp's card on the map shows its tell.", ['<(@)>', 'OMNI ']],
  HC1: ['HARDCORE', 'heat', 'epic', 0, 'no CRASH chip works. +50% REP.', ['HRD', 'x_x']],
  HN2: ['HUNTED', 'heat', 'rare', 0, 'twice as many rivals. +20% REP.', ['HNT', '>@<']],
};
const DECK_CELL = { SC1: 6, LI2: 9, RX9: 14 };
const DECK_SPOILS = [['REWARDS', 'RWD', 'take the REWARDS.'], ['HEAL', 'HP+', 'skip them: HEAL 2 INT.'], ['CASH', '$$$', 'skip them: take CASH.']];
const DECK_GLYPHS = [
  ['THE WATCHER', [' .-. ', '( o )', " '-' "]], ['COOKIE', [' .-. ', '(::.)', " '-' "]],
  ['GHOST USER', [' .-. ', '(o o)', ' vvv ']], ['DIAMOND', [' / \\ ', '<   >', ' \\ / ']],
];
// the sockets (where the socket labels layer puts them): id, x, y, group, the mk that opens it, size
const deckS = (id, x, y, g, mk, w = 5, h = 4) => ({ id, x, y, g, mk, w, h });
const DECK_SOCKETS = [
  deckS('BT1', 20, 1, 'boot', 2), deckS('BT2', 26, 1, 'boot', 2), deckS('BI1', 20, 5, 'bios', 2), deckS('BI2', 26, 5, 'bios', 2),
  deckS('CRS', 27, 11, 'crash', 2), deckS('SH1', 0, 17, 'shell', 2), deckS('SPL', 15, 17, 'spoils', 2), deckS('SH3', 20, 17, 'shell', 2),
  deckS('SH4', 28, 17, 'shell', 2), deckS('PSU', 0, 23, 'psu', 2), deckS('SH2', 12, 23, 'shell', 2),
  deckS('GLY', 8, 33, 'glyph', 3, 7, 5), deckS('OV1', 16, 34, 'ov', 3), deckS('OV2', 22, 34, 'ov', 3), deckS('OV3', 28, 34, 'ov', 3),
  deckS('SU1', 10, 43, 'sudo', 4), deckS('SU2', 10, 47, 'sudo', 4), deckS('SU3', 10, 51, 'sudo', 4),
  deckS('BS1', 18, 43, 'boss', 4, 7), deckS('BS2', 18, 47, 'boss', 4, 7),
  deckS('HT1', 28, 43, 'heat', 4), deckS('HT2', 28, 47, 'heat', 4), deckS('HT3', 28, 51, 'heat', 4),
];
// the parts that aren't sockets: id, x, y, w, h
const DECK_PARTS = [['cpu', 3, 4, 14, 7], ['rom', 3, 11, 14, 1], ['stick', 22, 9, 3, 7], ['readout', 29, 16, 3, 1],
  ['byte', 25, 22, 10, 4], ['hdr3', 6, 28, 14, 4], ['fuse', 23, 27, 4, 6], ['ports', 33, 28, 3, 3],
  ['crew', 0, 32, 5, 6], ['hdr4', 10, 41, 23, 2], ['uplink', 0, 44, 4, 5]].map(([id, x, y, w, h]) => ({ id, x, y, w, h }));
const DECK_NAMES = ['POTATO_SAUCE', 'NEON_FOX', 'STATIC_GOBLIN', 'IRON_MK2', 'THE_YETI'];
const DECK_POSTS = ['HARDENED', 'SEED MONEY', 'FIELD KIT', 'GEAR SLOT', 'RESTOCK', 'SECOND WIND', 'LOCKER', 'WORKBENCH'];
const DECK_SWITCHES = [['TELL', 'TELL LIGHT'], ['STRAY', 'STRAY'], ['LUCKY', 'LUCKY START'], ['POOL', 'STARTER POOL']];
const DECK_CREW = [['POPS', 'one tell hint a sector'], ['NANA', 'a PATCH every sector'], ['BRICK', 'first ICE hit blocked'], ['KLUDGE', 'failed crafts refund']];
const DECK_CODES = {
  '11111111': '0xFF: OVERFLOW wakes up. his seed is armed for your next run.',
  '00101010': '42. but what was the question?',
  '10110000': 'b0y: hey. quit poking my switches.',
  '01111111': 'DEL: access denied.',
  '10000000': '0x80: DOUBLE TIME armed for your next run.',
};
const DECK_ART_SKIP = ['cpu label', 'readouts'];   // drawn live (the hacker name, the stick)
const DECK_ART_W = 36;
const DECK_BOARD_STEP = 5;   // rows a "more" tap moves the board (it's 56 rows)
const DECK_CARD_H = 5;       // the bar (rule / messages / NO POWER) and the 4-row card
const DECK_MORE_UP = '[ ^ ^ ^  more  ^ ^ ^ ]', DECK_MORE_DN = '[ v v v  more  v v v ]';   // engine/codex.js scrollArea's rows
const DECK_OFF = { fg: '#5f7470', bg: '#141b1a' };   // an unpowered chip: grey
const deckBand = by => by >= 41 ? 4 : by >= 32 ? 3 : 2;

// ---------- state (in memory only) ----------
let DECK = null;
function deckState() {
  if (!DECK) DECK = {
    view: 'board', scroll: 0, list: { top: 0 }, sel: { kind: 'socket', id: 'BT1' }, selT: 0, pick: null, carry: null,
    rep: 2400, mk: 2, fuse: false, blown: false, name: 0, spoils: 0, glyph: 0, crew: new Set(['POPS']),
    slots: { PSU: 'SC1', BT1: 'ST4', BI1: 'SM1', CRS: 'DM5', SPL: 'SP3', SH1: 'CD2' },
    order: ['PSU', 'BT1', 'BI1', 'CRS', 'SPL', 'SH1'],   // the sockets in the order their chips went in: power goes oldest first
    sw: new Set(['TELL', 'STRAY']), bits: [0, 0, 0, 0, 0, 0, 0, 0], tick: null, msg: null, leave: 0,
  };
  return DECK;
}
let deckArtRows = null;
function deckArt() {   // the board, flat: every layer in order, but the ones drawn live
  if (deckArtRows) return deckArtRows;
  const a = SCENE_ART.deck, g = Array.from({ length: a.h }, () => Array(a.w).fill(' '));
  for (const [name, l] of Object.entries(a.layers)) {
    if (DECK_ART_SKIP.includes(name)) continue;
    l.rows.forEach((r, j) => [...r].forEach((c, i) => { const y = l.y + j, x = l.x + i; if (c !== ' ' && y < a.h && x < a.w) g[y][x] = c; }));
  }
  return (deckArtRows = g.map(r => r.join('')));
}
const deckOwned = () => Object.keys(DECK_CHIPS);
const deckSock = id => DECK_SOCKETS.find(s => s.id === id);
const deckSlotOf = key => Object.keys(DECK.slots).find(k => DECK.slots[k] === key);
const deckOpen = mk => mk <= DECK.mk && !(mk === 4 && (!DECK.fuse || DECK.blown));
const deckFits = (key, s) => DECK_CHIPS[key][1] === s.g;
const deckMk = m => ['', '', 'II', 'III', 'IV'][m];
const deckSay = (text, col = C.accent) => { DECK.msg = { text, col, t: performance.now() }; };
const deckSelect = sel => { DECK.sel = sel; DECK.selT = performance.now(); };

// Power: the cell's budget goes to the chips in the order they went in. A chip that doesn't fit what's left gets none,
// and newer ones still try, so the chip you just slotted is the one that goes dark, not one off screen.
function deckPower() {
  const d = DECK, budget = DECK_CELL[d.slots.PSU] || 0, on = new Set(), off = [];
  let left = budget;
  for (const id of d.order) {
    const key = d.slots[id], s = deckSock(id); if (!key || !deckOpen(s.mk)) continue;   // a dark band's chips cost nothing
    const c = DECK_CHIPS[key][3];
    if (c <= left) { left -= c; on.add(id); } else off.push(id);
  }
  return { budget, left, on, off, used: budget - left };
}
function deckSlot(key, sid) {
  const d = DECK, was = d.slots[sid], other = deckSlotOf(key), [name, grp, , cost] = DECK_CHIPS[key];
  if (other) { delete d.slots[other]; d.order = d.order.filter(i => i !== other); }
  d.slots[sid] = key; d.order = d.order.filter(i => i !== sid).concat(sid);
  d.carry = null; deckSelect({ kind: 'socket', id: sid });
  const p = deckPower();
  if (grp === 'psu') { Sound.buy(); return deckSay(p.off.length ? `${name}: ${p.off.length} chip${p.off.length > 1 ? 's' : ''} lost power.` : `${name} in. power ${p.budget}.`, p.off.length ? C.danger : C.money); }
  if (!p.on.has(sid)) { Sound.deny(); return deckSay(`no power: ${name} needs ${cost - p.left} more.`, C.danger); }
  Sound.buy();
  deckSay(was && was !== key ? `${name} in. ${DECK_CHIPS[was][0]} back in your chips.` : other && other !== sid ? `${name} moved to ${sid}.` : `${name} in ${sid}.`);
}
function deckPull(sid) {
  const d = DECK, key = d.slots[sid]; if (!key) return;
  delete d.slots[sid]; d.order = d.order.filter(i => i !== sid);
  Sound.tick();
  const off = deckPower().off.length;
  deckSay(`${DECK_CHIPS[key][0]} back in your chips.` + (sid === 'PSU' && off ? ' no cell: no power.' : ''), sid === 'PSU' && off ? C.danger : C.accent);
}
function deckPick(sid) {
  const s = deckSock(sid);
  if (!deckOpen(s.mk)) return Sound.deny();
  DECK.pick = { id: sid, s: { top: 0 }, t0: performance.now() }; DECK.carry = null;
  Sound.ui();
}
// keep a board row range in view
function deckShow(by, h, rows) { const d = DECK; if (by < d.scroll) d.scroll = Math.max(0, by - 1); else if (by + h > d.scroll + rows) d.scroll = by + h - rows + 1; }

function openDeck() {
  const d = deckState();
  d.pick = null; d.carry = null; d.msg = null; d.selT = performance.now();
  openPanel('THE DECK', deckLines, null, { full: true });
  st.keyHandler = deckKey;
}
function deckLeave() {
  const off = deckPower().off.length, now = performance.now();
  if (off && now - DECK.leave > 3000) { DECK.leave = now; Sound.deny(); return deckSay(`${off} chip${off > 1 ? 's have' : ' has'} no power. LEAVE again to go.`, C.danger); }
  DECK.leave = 0; swapTo(showTitle);
}
function deckKey(k) {
  const d = DECK; if (!d) return false;
  if (k === 'escape') { if (d.pick) { d.pick = null; Sound.tick(); } else if (d.carry) d.carry = null; else deckLeave(); return true; }
  if (k === 'arrowup' || k === 'arrowdown') { if (st.scroll) st.scroll(k === 'arrowup' ? -1 : 1); return true; }
  return false;
}

// ---------- drawing ----------
// A cell grid for one block: the game's put adds cells (two puts on a cell draw both), so the deck draws here, where
// a later put replaces, then hands the cells over.
function deckGrid(ctx) {
  const cells = new Map(), bgs = [], K = (x, y) => y * 4096 + x + 512;
  const g = {
    dim: false,
    put: (x, y, s, col, bold = false) => { for (let i = 0; i < s.length; i++) if (s[i] !== ' ') cells.set(K(x + i, y), { x: x + i, y, ch: s[i], col: g.dim ? C.dim : col, bold: g.dim ? false : bold }); },
    clr: (x, y, w, h = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) cells.delete(K(x + i, y + j)); },
    bg: (x, y, w, h, col, a = 1) => { if (g.dim) return; for (let j = 0; j < h; j++) bgs.push([x, y + j, w, col, a]); },
    flush: () => { for (const b of bgs) ctx.bg(...b); for (const c of cells.values()) ctx.put(c.x, c.y, c.ch, c.col, 'board', c.bold); },
  };
  return g;
}
function deckBtn(ctx, g, x, y, label, col, id, fn, off = false) {
  g.put(x, y, label, off ? C.dim : col);
  if (!off && !g.dim) { ctx.hl(x, y, label.length, 1, id, false); ctx.addHit(x, y, label.length, 1, { kind: 'btn', id, onTap: fn }); }
  return x + label.length + 1;
}
// the "more" rows (engine/codex.js scrollArea): an inverted bar, blank when there's nothing more that way
function deckMore(ctx, g, x0, w, y, up, can, fn, id) {
  if (!can || g.dim) return;
  const s = up ? DECK_MORE_UP : DECK_MORE_DN, x = x0 + Math.floor((w - s.length) / 2);
  g.bg(x, y, s.length, 1, st.hoverBtn === id ? C.accent : C.text, 1); g.put(x, y, s, C.bg, true);
  ctx.addHit(x, y, s.length, 1, { kind: 'btn', id, onTap: () => { fn(); Sound.tick(); } });
}
// A scroll area of blocks (a chip is 2 rows and a gap): it steps a whole block, so a chip is never cut in half.
// s: { top } (a block index). Draws `rows` rows at y; the "more" rows take the first and last when it doesn't fit.
function deckBlocks(ctx, g, x0, w, y, rows, blocks, s, idp) {
  const total = blocks.reduce((n, b) => n + b.h, 0);
  if (total <= rows) { s.top = 0; s.max = 0; let yy = y; for (const b of blocks) { b.draw(yy); yy += b.h; } return () => {}; }
  const inner = rows - 2; let max = 0;
  for (let i = blocks.length - 1, acc = 0; i >= 0; i--) { acc += blocks[i].h; if (acc > inner) { max = i + 1; break; } }
  s.max = max; s.top = clamp(s.top, 0, max);
  let yy = y + 1;
  for (let i = s.top; i < blocks.length && yy + blocks[i].h <= y + 1 + inner; i++) { blocks[i].draw(yy); yy += blocks[i].h; }
  const by = dd => { s.top = clamp(s.top + dd, 0, max); };
  deckMore(ctx, g, x0, w, y, true, s.top > 0, () => by(-1), idp + 'up');
  deckMore(ctx, g, x0, w, y + rows - 1, false, s.top < max, () => by(1), idp + 'dn');
  return by;
}
// a chip's face: 3 x 2 (5 x 2 for BOSS), both rows art, on its rarity chip (grey with no power)
function deckFace(g, x, y, key, off) {
  const c = DECK_CHIPS[key], ch = off ? DECK_OFF : chipOf(c[2]), w = c[1] === 'boss' ? 5 : 3;
  const bot = key === 'SP3' ? DECK_SPOILS[DECK.spoils][1] : c[5][1];
  g.bg(x, y, w, 2, ch.bg, 1); g.put(x, y, c[5][0], ch.fg, true); g.put(x, y + 1, bot, ch.fg, true);
}
// a socket: its code on the top border, the frame by state, the chip inside. P / B / CL: put, bg, clear (the board's
// clip to the rows in view; the card's draw straight)
function deckSocket(s, X, Y, P, B, CL, { sel = false, key, pw, now }) {
  const d = DECK, open = deckOpen(s.mk), gc = deckGroupCol(s.g), w = s.w, inner = w - 2;
  if (key === undefined) key = d.slots[s.id];
  const off = !!(key && open && pw && !pw.on.has(s.id) && DECK_CHIPS[key][1] !== 'psu' && d.slots[s.id] === key);
  CL(X, Y, w, s.h);
  const col = !open ? C.dim : off ? C.danger : key ? gc : C.mid;
  if (s.g === 'glyph') {
    P(X, Y, '+=GLY=+', col); for (let j = 1; j < 4; j++) { P(X, Y + j, ']', col); P(X + 6, Y + j, '[', col); } P(X, Y + 4, '+=-=-=+', col);
    if (!open) P(X + 1, Y + 2, ':mk3:', C.mid);
    else DECK_GLYPHS[d.glyph][1].forEach((l, j) => P(X + 1, Y + 1 + j, l, C.bright, true));
  } else {
    P(X, Y, '+' + (inner > 3 ? '.' : '') + s.id + (inner > 3 ? '.' : '') + '+', col);
    for (let j = 1; j < s.h - 1; j++) { P(X, Y + j, !open || !key ? ':' : ']', col); P(X + w - 1, Y + j, !open || !key ? ':' : '[', col); }
    P(X, Y + s.h - 1, !open ? '+' + '.'.repeat(inner) + '+' : key ? (inner > 3 ? '+-+-+-+' : '+-+-+') : (inner > 3 ? '+ - - +' : '+ - +'), col);
    if (!open) P(X + 1, Y + 1, inner > 3 ? ' mk' + s.mk + ' ' : 'mk' + s.mk, C.mid);
    else if (key) deckFace({ put: P, bg: B }, X + 1, Y + 1, key, off);
  }
  if (d.carry && open && deckFits(d.carry, s) && Math.floor(now / 300) % 2) B(X, Y, w, s.h, C.accent, 0.3);
  if (sel) B(X, Y, w, s.h, C.accent, 0.22);
}

function deckLines(T, B, X) {
  const d = DECK; if (!d) return;
  const sa = L.hc - 1 - 5 - DECK_CARD_H;   // the scroll area: what the header, the card and the footer row leave
  st.scroll = null;
  X({ h: 5, draw: (ctx, y) => deckHeader(ctx, y) });
  X({ h: sa, draw: (ctx, y) => { if (d.pick) deckPicker(ctx, y, sa); else if (d.view === 'chips') deckChipList(ctx, y, sa); else deckBoard(ctx, y, sa); } });
  X({ h: DECK_CARD_H, draw: (ctx, y) => deckCard(ctx, y) });
}

function deckHeader(ctx, y) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), W = L.wc;
  g.put(0, y, 'NeoN+1', C.accent); const rep = `${d.rep} REP`; g.put(W - rep.length, y, rep, C.rep);
  g.put(0, y + 1, rule(W), C.dim);
  g.put(0, y + 2, 'SAFEHOUSE // ', C.mid); g.put(13, y + 2, 'THE DECK', C.bright, true);
  deckBtn(ctx, g, W - 7, y + 2, '[LEAVE]', C.mid, 'dkleave', deckLeave);
  const tab = (v, label, id, x) => deckBtn(ctx, g, x, y + 3, d.view === v ? `[${label}]` : ` ${label} `, d.view === v ? C.accent : C.mid, id, () => { if (d.view === v) return; d.view = v; d.pick = null; d.carry = null; Sound.tick(); });
  const x2 = tab('board', 'BOARD', 'dktb', 0); tab('chips', `CHIPS ${deckOwned().length}`, 'dktc', x2);
  const pwt = `PWR ${pw.used}/${pw.budget}` + (pw.off.length ? ` !${pw.off.length}` : ''), mkt = `mk ${deckMk(d.mk)} `;
  g.put(W - pwt.length, y + 3, pwt, pw.off.length ? C.danger : C.money, !!pw.off.length); g.put(W - pwt.length - mkt.length, y + 3, mkt, C.money);
  g.put(0, y + 4, rule(W), C.dim);
  g.flush();
}

function deckBoard(ctx, y0, sa, under = null) {   // under: the picker's grid (the board draws into it, dim, no taps)
  const d = DECK, g = under || deckGrid(ctx), now = ctx.now, pw = deckPower(), ART = deckArt(), BH = ART.length, bv = sa - 2;
  const ax = Math.floor((L.wc - DECK_ART_W) / 2), maxTop = Math.max(0, BH - bv);
  d.scroll = clamp(d.scroll, 0, maxTop);
  const top = d.scroll, inView = by => by >= top && by < top + bv, sy = by => y0 + 1 + by - top;
  const bput = (x, by, s, col, bold) => { if (inView(by)) g.put(ax + x, sy(by), s, col, bold); };
  const bbg = (x, by, w, h, col, a) => { const a0 = Math.max(by, top), a1 = Math.min(by + h, top + bv); if (a1 > a0) g.bg(ax + x, sy(a0), w, a1 - a0, col, a); };
  const bclr = (x, by, w, h) => { for (let r = by; r < by + h; r++) if (inView(r)) g.clr(ax + x, sy(r), w, 1); };
  const bhit = (x, by, w, h, id, fn) => { if (under) return; const a0 = Math.max(by, top), a1 = Math.min(by + h, top + bv); if (a1 > a0) { ctx.hl(ax + x, sy(a0), w, a1 - a0, id, false); ctx.addHit(ax + x, sy(a0), w, a1 - a0, { kind: 'btn', id, onTap: fn }); } };
  if (under) g.dim = true;
  // the art, dim where the band is dark
  for (let by = top; by < top + bv && by < BH; by++) g.put(ax, sy(by), ART[by], deckOpen(deckBand(by)) ? C.mid : C.dim);
  // the CPU: your hacker name (2 lines when it doesn't fit), the mk, the pins blinking in turn
  { const n = DECK_NAMES[d.name], lines = n.length <= 10 ? [n] : n.split('_');
    bclr(4, 5, 12, 5); lines.forEach((l, i) => bput(6, 6 + i, l, C.money, true)); bput(6, 6 + lines.length, 'mk ' + deckMk(d.mk), C.money);
    const k = Math.floor(now / 170) % 12; let pi = 0;
    for (const by of [4, 10]) for (let x = 3; x <= 16; x++) if (ART[by][x] === 'o') { bput(x, by, 'o', pi % 12 === k ? C.bright : C.money, pi % 12 === k); pi++; }
    for (let by = 4; by <= 10; by++) for (const x of [3, 16]) if ('|+o'.includes(ART[by][x])) bput(x, by, ART[by][x], C.money);
    bput(3, 4, '+-', C.money); bput(15, 4, '-+', C.money); bput(3, 10, '+-', C.money); bput(15, 10, '-+', C.money); }
  // the ROM pins: one per BOARD post you've bought (and switch you've turned on), lit
  { const lit = DECK_POSTS.length + d.sw.size; let n = 0;
    for (let x = 6; x <= 13; x++) if (ART[11][x] !== ' ') { bput(x, 11, ART[11][x], n < lit ? C.rep : C.dim, n < lit); n++; } }
  // the CRASH stick reads out its chip, scrolling when the name is longer than 5 (OFF in red with no power)
  { const key = d.slots.CRS, name = key ? DECK_CHIPS[key][0].replace(/ /g, '') : '', on = key && pw.on.has('CRS');
    for (let j = 0; j < 5; j++) {
      let ch = '.';
      if (name && !on) ch = ' OFF '[j];
      else if (name) { if (name.length <= 5) { const o = Math.floor((5 - name.length) / 2); ch = name[j - o] || '.'; } else { const s = name + '   '; ch = s[(Math.floor(now / 320) + j) % s.length]; } }
      bput(23, 10 + j, ch === ' ' ? '.' : ch, name && !on ? C.danger : name && ch !== '.' && ch !== ' ' ? C.bright : C.dim, !!name);
    } }
  // the ]8[ readout: power left, a blinking ! when a chip has none
  bput(30, 16, pw.off.length ? (Math.floor(now / 400) % 2 ? '!' : ' ') : pw.left > 9 ? '+' : String(pw.left), pw.off.length ? C.danger : pw.left > 0 ? C.money : C.mid, true);
  // THE BYTE's bits, and the ticker under it
  for (let i = 0; i < 8; i++) bput(26 + i, 23, String(d.bits[i]), d.bits[i] ? C.accent : C.mid, !!d.bits[i]);
  { let s = '........';
    if (d.tick) { const pad = '        ', full = pad + d.tick.text + pad, i = Math.floor((now - d.tick.t) / 140);
      if (i > (full.length - 8) * 2) d.tick = null; else s = full.substr(i % (full.length - 8), 8); }
    bclr(26, 25, 8, 1); bput(26, 25, d.tick ? s : s.replace(/ /g, '.'), d.tick ? C.accent : C.dim, !!d.tick); }
  // the FUSE
  { const fc = d.blown ? C.danger : d.fuse ? C.money : C.dim;
    bput(24, 30, d.blown ? (Math.floor(now / 200) % 2 ? '><' : '  ') : ')(', fc, true); bput(24, 29, '||', fc); bput(24, 31, '||', fc); }
  if (!deckOpen(3)) bput(21, 33, 'mk III', C.dim);
  if (!deckOpen(4)) bput(25, 42, d.blown ? 'FUSE BLOWN' : 'mk IV', d.blown ? C.danger : C.dim);
  // the parts, then the sockets (on top, so their taps win)
  for (const p of DECK_PARTS) bhit(p.x, p.y, p.w, p.h, 'dkp_' + p.id, () => deckTapPart(p.id));
  for (const s of DECK_SOCKETS) {
    deckSocket(s, s.x, s.y, bput, bbg, bclr, { sel: d.sel.kind === 'socket' && d.sel.id === s.id, pw, now });
    bhit(s.x, s.y, s.w, s.h, 'dks_' + s.id, () => deckTapSocket(s, bv));
  }
  if (d.sel.kind === 'part') { const p = DECK_PARTS.find(q => q.id === d.sel.id); if (p) bbg(p.x, p.y, p.w, p.h, C.accent, 0.18); }
  // the "more" rows; a drag or the wheel moves a row at a time
  g.clr(0, y0, L.wc, 1); g.clr(0, y0 + sa - 1, L.wc, 1);
  deckMore(ctx, g, 0, L.wc, y0, true, top > 0, () => { d.scroll = clamp(d.scroll - DECK_BOARD_STEP, 0, maxTop); }, 'dkup');
  deckMore(ctx, g, 0, L.wc, y0 + sa - 1, false, top < maxTop, () => { d.scroll = clamp(d.scroll + DECK_BOARD_STEP, 0, maxTop); }, 'dkdn');
  if (under) return;
  st.scroll = dd => { const t = clamp(d.scroll + dd, 0, maxTop); if (t !== d.scroll) { d.scroll = t; Sound.tick(); } };
  g.flush();
}
function deckTapSocket(s, rows) {
  const d = DECK;
  if (d.carry) {
    if (deckFits(d.carry, s) && deckOpen(s.mk)) deckSlot(d.carry, s.id);
    else { Sound.deny(); deckSay(`${DECK_CHIPS[d.carry][0]} doesn't go in ${s.id}.`, C.danger); }
    return;
  }
  // the first tap: its card; the second: the picker (Greg, 2026-11-15)
  if (d.sel.kind === 'socket' && d.sel.id === s.id) return deckPick(s.id);
  deckSelect({ kind: 'socket', id: s.id }); Sound.tick();
}
function deckTapPart(id) {
  const d = DECK; d.carry = null;
  deckSelect(id === 'stick' ? { kind: 'socket', id: 'CRS' } : { kind: 'part', id }); Sound.tick();
}

// the CHIPS tab: every chip you own, grouped; a chip is 2 rows and a gap, and a "more" tap steps a chip
function deckChipList(ctx, y0, sa) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), W = L.wc, blocks = [];
  for (const gk of Object.keys(DECK_GROUPS)) {
    const ks = deckOwned().filter(k => DECK_CHIPS[k][1] === gk); if (!ks.length) continue;
    blocks.push({ h: 1, draw: y => { const n = DECK_GROUPS[gk][0]; g.put(1, y, `-- ${n} `, deckGroupCol(gk)); g.put(5 + n.length, y, rule(W - 7 - n.length), C.dim); } });
    for (const key of ks) blocks.push({ h: 3, draw: y => {
      const c = DECK_CHIPS[key], where = deckSlotOf(key), off = !!(where && !pw.on.has(where) && c[1] !== 'psu'), id = 'dkc_' + key;
      if (d.sel.kind === 'chip' && d.sel.key === key) g.bg(0, y, W, 2, C.accent, 0.18);
      ctx.hl(0, y, W, 2, id, false);
      deckFace(g, 2, y, key, off);
      g.put(9, y, c[0], C.bright, true);
      if (where) g.put(W - 1 - where.length - 3, y, 'in ' + where, off ? C.danger : C.accent);
      g.put(9, y + 1, `${DECK_GROUPS[c[1]][0]} · ` + (c[1] === 'psu' ? `+${DECK_CELL[key]} PWR` : `PWR ${c[3]}`), C.money);
      if (off) g.put(W - 9, y + 1, 'NO POWER', C.danger, true);
      ctx.addHit(0, y, W, 2, { kind: 'btn', id, onTap: () => { deckSelect({ kind: 'chip', key }); Sound.tick(); } });
    } });
  }
  const by = deckBlocks(ctx, g, 0, W, y0, sa, blocks, d.list, 'dkl');
  st.scroll = dd => by(dd);
  g.flush();
}

// the picker: a popup over the scroll area, a scroll area of what fits (or NONE); one tap slots it and closes
function deckPicker(ctx, y0, sa) {
  const d = DECK, p = d.pick, s = deckSock(p.id), g = deckGrid(ctx), pw = deckPower(), now = ctx.now;
  const W = Math.min(L.wc, DECK_ART_W), X0 = Math.floor((L.wc - W) / 2), gc = deckGroupCol(s.g), cur = d.slots[s.id];
  const done = () => { d.pick = null; };
  const blocks = [], IX = X0 + 1, IW = W - 2;
  if (s.g === 'glyph') {
    DECK_GLYPHS.forEach(([name, art], i) => blocks.push({ h: 4, draw: y => {
      const id = 'dkg' + i; ctx.hl(IX, y, IW, 3, id, false);
      art.forEach((l, j) => g.put(IX + 1, y + j, l, C.bright, true));
      g.put(IX + 8, y, name, C.bright, true); if (i === d.glyph) g.put(IX + IW - 7, y, 'in GLY', C.accent);
      g.put(IX + 8, y + 1, 'seen on ' + (3 + i * 2) + ' layers', C.mid);
      ctx.addHit(IX, y, IW, 3, { kind: 'btn', id, onTap: () => { d.glyph = i; done(); Sound.buy(); deckSay(`${name} is your glyph.`); } });
    } }));
  } else {
    blocks.push({ h: 3, draw: y => {   // NONE: empty the socket
      ctx.hl(IX, y, IW, 2, 'dknone', false);
      g.put(IX + 1, y, '- -', C.mid); g.put(IX + 1, y + 1, ' - ', C.mid);
      g.put(IX + 6, y, 'NONE', cur ? C.bright : C.mid, true); if (!cur) g.put(IX + IW - 6, y, 'empty', C.accent);
      g.put(IX + 6, y + 1, cur ? `pull ${DECK_CHIPS[cur][0]} out` : `leave ${s.id} empty`, C.mid);
      ctx.addHit(IX, y, IW, 2, { kind: 'btn', id: 'dknone', onTap: () => { done(); if (cur) deckPull(s.id); else Sound.tick(); } });
    } });
    deckOwned().filter(k => deckFits(k, s)).forEach((key, i) => blocks.push({ h: 3, draw: y => {
      const c = DECK_CHIPS[key], where = deckSlotOf(key), wide = c[1] === 'boss', id = 'dkk_' + key;
      ctx.hl(IX, y, IW, 2, id, false);
      deckFace(g, IX + 1, y, key, false);
      const nx = IX + (wide ? 8 : 6);
      g.put(nx, y, c[0], C.bright, true);
      if (where) g.put(IX + 19, y, 'in ' + where, where === s.id ? C.accent : C.mid);
      // would it get power here? what's left, plus what this socket's chip frees, plus its own if it's on elsewhere
      const room = pw.left + (cur && pw.on.has(s.id) ? DECK_CHIPS[cur][3] : 0) + (where && where !== s.id && pw.on.has(where) ? c[3] : 0);
      const short = c[1] !== 'psu' && where !== s.id && c[3] > room, pt = c[1] === 'psu' ? `+${DECK_CELL[key]}` : `PWR ${c[3]}`;
      g.put(IX + IW - pt.length, y, pt, short ? C.danger : C.money, short);
      g.put(nx + 1, y + 1, FX.ticker(c[4], IX + IW - nx - 1, p.t0 + i * 700, now), C.text);
      ctx.addHit(IX, y, IW, 2, { kind: 'btn', id, onTap: () => { done(); if (where !== s.id) deckSlot(key, s.id); else Sound.tick(); } });
    } }));
  }
  // as tall as what's in it (up to the whole scroll area); the board shows, dim, under the rest
  const H = Math.min(sa, Math.max(9, blocks.reduce((n, b) => n + b.h, 0) + 4));
  deckBoard(ctx, y0, sa, g); g.dim = false;
  g.clr(X0, y0, W, H);
  g.put(X0, y0, '+' + '-'.repeat(W - 2) + '+', gc);
  const title = ` ${s.id} · ${DECK_GROUPS[s.g][0]} `; g.clr(X0 + 2, y0, title.length); g.put(X0 + 2, y0, title, gc, true);
  for (let j = 1; j < H - 1; j++) { g.put(X0, y0 + j, '|', gc); g.put(X0 + W - 1, y0 + j, '|', gc); }
  g.put(X0, y0 + H - 1, '+' + '-'.repeat(W - 2) + '+', gc);
  g.put(X0 + 2, y0 + 1, DECK_GROUPS[s.g][2], C.dim);
  const by = deckBlocks(ctx, g, IX, IW, y0 + 2, H - 4, blocks, p.s, 'dkpk');
  st.scroll = dd => by(dd);
  g.put(X0 + 2, y0 + H - 2, s.g === 'glyph' ? 'tap one to pick it' : `tap one to slot it · ${pw.left} PWR left`, C.dim);
  deckBtn(ctx, g, X0 + W - 4, y0, '[X]', C.mid, 'dkpx', () => { done(); Sound.tick(); });
  g.flush();
}

// the card: the bar (the rule, a message, or NO POWER), then 4 rows about what you picked
function deckCard(ctx, y0) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), now = ctx.now, W = L.wc;
  // the bar
  if (d.msg && now - d.msg.t < 2600) { g.put(0, y0, rule(W), C.dim); const s = ` ${d.msg.text} `.slice(0, W); g.clr(1, y0, s.length); g.put(1, y0, s, d.msg.col); }
  else if (d.carry) { g.put(0, y0, rule(W), C.dim); const s = ` slotting ${DECK_CHIPS[d.carry][0]}: tap a blinking socket `.slice(0, W); g.clr(1, y0, s.length); g.put(1, y0, s, C.accent); }
  else if (pw.off.length) {   // NO POWER: red, cycling through the chips that have none; a tap goes to the one showing
    const names = pw.off.map(id => `NO POWER: ${DECK_CHIPS[d.slots[id]][0]} in ${id}`), sw = FX.swapLines(names, W - 2, 0, now, 1800);
    g.bg(0, y0, W, 1, st.hoverBtn === 'dkbar' ? C.accent : C.danger, 1); g.put(1, y0, sw.text, C.bg, true);
    if (!d.pick) ctx.addHit(0, y0, W, 1, { kind: 'btn', id: 'dkbar', onTap: () => {
      const id = pw.off[sw.k], s = deckSock(id); d.view = 'board'; deckSelect({ kind: 'socket', id }); deckShow(s.y, s.h, L.hc - 1 - 5 - DECK_CARD_H - 2); Sound.tick(); } });
  } else g.put(0, y0, rule(W), C.dim);
  // the picker is up: the card waits under it (dim), and a tap on it closes the picker
  if (d.pick) { g.dim = true; ctx.addHit(0, y0 + 1, W, 4, { kind: 'btn', id: 'dkcard', onTap: () => { d.pick = null; Sound.tick(); } }); }
  const y = y0 + 1, tw = (x) => W - x - 1, tick = (x, text, col = C.text) => g.put(x, y + 2, FX.ticker(text, tw(x), d.selT, now), col);
  const btns = (list, bx = 1) => { for (const [label, col, id, fn, off] of list) bx = deckBtn(ctx, g, bx, y + 3, label, col, id, fn, off); };
  const frame = (s, key) => deckSocket(s, 1, y, g.put, g.bg, g.clr, { key, pw, now });
  const sel = d.sel;
  const chipRows = (key, sid) => {   // name; group and power; what it does (a ticker, indented)
    const c = DECK_CHIPS[key], x = c[1] === 'boss' ? 10 : 8, off = !!(sid && !pw.on.has(sid) && c[1] !== 'psu');
    g.put(x, y, c[0], C.bright, true);
    if (off) { if (Math.floor(now / 500) % 2) g.put(W - 9, y, 'NO POWER', C.danger, true); }
    const gn = DECK_GROUPS[c[1]][0]; g.put(x, y + 1, gn, deckGroupCol(c[1]));
    g.put(x + gn.length + 1, y + 1, '· ' + (c[1] === 'psu' ? `${DECK_CELL[key]} PWR` : `PWR ${c[3]}`), off ? C.danger : C.money);
    tick(x + 2, key === 'SP3' ? 'bosses: ' + DECK_SPOILS[d.spoils][2] : c[4]);
    return x;
  };
  if (sel.kind === 'chip') {
    const where = deckSlotOf(sel.key), c = DECK_CHIPS[sel.key];
    frame(where ? deckSock(where) : { id: '---', g: c[1], mk: 2, w: c[1] === 'boss' ? 7 : 5, h: 4 }, sel.key);
    chipRows(sel.key, where);
    btns([['[ SLOT ]', C.accent, 'dkslot', () => { d.carry = sel.key; d.view = 'board'; Sound.ui(); }], ...(where ? [['[ PULL ]', C.bright, 'dkpull', () => deckPull(where)]] : [])], c[1] === 'boss' ? 10 : 8);
  } else if (sel.kind === 'socket') {
    const s = deckSock(sel.id), key = d.slots[s.id], open = deckOpen(s.mk), [gn, , gt] = DECK_GROUPS[s.g], gc = deckGroupCol(s.g);
    if (s.g === 'glyph') {
      if (open) DECK_GLYPHS[d.glyph][1].forEach((l, j) => g.put(1, y + j, l, C.bright, true)); else g.put(1, y + 1, ':mk3:', C.mid);
      g.put(8, y, open ? DECK_GLYPHS[d.glyph][0] : 'GLY · LOCKED', open ? C.bright : C.mid, true); g.put(8, y + 1, 'GLYPH · your favourite', gc);
      tick(10, open ? 'tap it when you see it on a layer and it acts like a loot node, ICE or real.' : 'opens with mk III: the CPU upgrade, an ELITE post on THE BOARD.');
      btns(open ? [['[ CHANGE ]', C.accent, 'dkchg', () => deckPick('GLY')]] : d.mk < 3 ? [['[ mk III · 600 REP ]', C.rep, 'dkmk3', deckUpgrade3]] : [], 8);
    } else if (!open) {
      frame(s);
      g.put(8, y, `${s.id} · LOCKED`, C.mid, true); g.put(8, y + 1, gn, gc);
      tick(10, s.mk === 3 ? 'opens with mk III: the CPU upgrade, an ELITE post on THE BOARD.' : d.blown ? 'the FUSE is blown. replace it to light mk IV again.' : 'opens with mk IV: the FUSE, a SYSOP post on THE BOARD.');
      btns(s.mk === 3 && d.mk < 3 ? [['[ mk III · 600 REP ]', C.rep, 'dkmk3', deckUpgrade3]] : s.mk === 4 ? [[d.blown ? '[ REPLACE FUSE ]' : '[ SEE THE FUSE ]', C.rep, 'dkfuse', () => deckTapPart('fuse')]] : [], s.w + 3);
    } else if (key) {
      frame(s); chipRows(key, s.id);
      btns([['[ CHANGE ]', C.accent, 'dkchg', () => deckPick(s.id)], ...(key === 'SP3' ? [[`[ ${DECK_SPOILS[d.spoils][0]} > ]`, C.money, 'dkspl', () => { d.spoils = (d.spoils + 1) % 3; Sound.tick(); }]] : [])], s.w + 3);
    } else {
      frame(s);
      const n = deckOwned().filter(k => deckFits(k, s)).length;
      g.put(8, y, `${s.id} · EMPTY`, C.bright, true); g.put(8, y + 1, gn, gc); g.put(9 + gn.length, y + 1, `· ${n} fit`, C.mid);
      tick(10, gt + '.');
      btns([['[ CHOOSE ]', C.accent, 'dkchg', () => deckPick(s.id)]], s.w + 3);
    }
  } else if (sel.kind === 'part') deckPartCard(ctx, g, y, sel.id, pw, tick, btns);
  g.flush();
}
function deckPartCard(ctx, g, y, id, pw, tick, btns) {
  const d = DECK, head = (t, sub, subc) => { g.put(1, y, t, C.bright, true); g.put(1, y + 1, sub, subc); };
  if (id === 'cpu') {
    const n = DECK_NAMES[d.name], open = DECK_SOCKETS.filter(s => deckOpen(s.mk)).length;
    head(`CPU · ${n}`, `mk ${deckMk(d.mk)} · ${['', '', 'USER', 'ELITE', 'SYSOP'][d.mk]}`, C.money);
    tick(3, `your name, printed on your deck. ${open} sockets open, ${Object.keys(d.slots).length} chips in, power ${pw.used} of ${pw.budget}.`);
    btns([...(d.mk < 3 ? [['[ mk III · 600 REP ]', C.rep, 'dkmk3', deckUpgrade3]] : []), ['[ NAME > ]', C.mid, 'dkname', () => { d.name = (d.name + 1) % DECK_NAMES.length; Sound.tick(); }]]);
  } else if (id === 'rom') {
    head('ROM · your BOARD posts', `${DECK_POSTS.length + d.sw.size} pins lit`, C.rep);
    tick(3, 'bought: ' + DECK_POSTS.join(', ') + '. the switches turn a post on or off for your next run.', C.mid);
    btns(DECK_SWITCHES.map(([k]) => [`[${k}]`, d.sw.has(k) ? C.accent : C.dim, 'dksw' + k, () => { if (d.sw.has(k)) d.sw.delete(k); else d.sw.add(k); Sound.tick(); }]));
  } else if (id === 'byte') {
    g.put(1, y, 'THE BYTE · secret codes', C.bright, true);
    for (let i = 0; i < 8; i++) { const x = 1 + i * 3, on = d.bits[i]; g.put(x, y + 1, `[${on}]`, on ? C.accent : C.mid, !!on); ctx.hl(x, y + 1, 3, 1, 'dkbit' + i, false); ctx.addHit(x, y + 1, 3, 1, { kind: 'btn', id: 'dkbit' + i, onTap: () => { d.bits[i] ^= 1; Sound.tick(); } }); }
    g.put(26, y + 1, '0x' + parseInt(d.bits.join(''), 2).toString(16).toUpperCase().padStart(2, '0'), C.mid);
    tick(3, '8 switches. most codes do nothing. the hints are around the game: logos, posts, G0D, the codex.', C.mid);
    btns([['[ ENTER ]', C.accent, 'dkenter', deckEnterByte], ['[ CLEAR ]', C.mid, 'dkclear', () => { d.bits.fill(0); Sound.tick(); }]]);
  } else if (id === 'fuse') {
    head('THE FUSE · mk IV power', d.blown ? 'BLOWN' : d.fuse ? 'installed' : 'not installed', d.blown ? C.danger : d.fuse ? C.money : C.mid);
    tick(3, d.blown ? 'a rival breached your deck and blew it. mk IV is dark until you replace it.' : d.fuse ? 'mk IV is lit. a boss that breaches your deck goes for it (the TEST shows it).' : 'the extra power that lights the bottom of the board. a SYSOP post, after mk III.');
    if (!d.fuse) btns([['[ INSTALL · 1500 REP ]', C.rep, 'dkinst', () => { if (d.mk < 3) { Sound.deny(); return deckSay('mk III first.', C.danger); } if (d.rep < 1500) { Sound.deny(); return deckSay('not enough REP.', C.danger); } d.rep -= 1500; d.fuse = true; d.mk = 4; Sound.buy(); deckSay('the fuse is in. mk IV lit.'); }]]);
    else if (!d.blown) btns([['[ TEST: BREACH ]', C.danger, 'dkbreach', () => { d.blown = true; Sound.deny(); deckSay('BREACH: a rival blew your fuse.', C.danger); d.tick = { text: 'FUSE BLOWN. mk IV dark.', t: performance.now() }; }]]);
    else btns([['[ REPLACE · 100 REP ]', C.rep, 'dkrepl', () => { if (d.rep < 100) return Sound.deny(); d.rep -= 100; d.blown = false; Sound.buy(); deckSay('new fuse. mk IV lit again.'); }]]);
  } else if (id === 'readout') {
    head('READOUT', `power left: ${pw.left} · ${pw.used} of ${pw.budget} used`, C.money);
    tick(3, 'the cell in PSU sets the budget. each chip costs 0-3. the oldest chips get power first.');
  } else if (id === 'ports') {
    head('PORTS · dark', 'things outside the page', C.text);
    tick(3, 'MIC: the whistle, the mold. GAMEPAD: a controller. MIDI: play SIMON on keys. MODEM: multiplayer. each waits until its feature is built.', C.mid);
  } else if (id === 'crew') {
    const open = deckOpen(3);
    head('CREW JACKS' + (open ? '' : ' · LOCKED'), open ? 'plug in up to 2 of your crew' : 'opens with mk III', open ? C.text : C.mid);
    tick(3, open ? DECK_CREW.filter(([c]) => d.crew.has(c)).map(([c, t]) => `${c}: ${t}.`).join(' ') || 'nobody plugged in.' : 'the mk III board has the jacks.');
    if (open) btns(DECK_CREW.map(([c]) => [`[${c}]`, d.crew.has(c) ? C.accent : C.dim, 'dkcrew' + c, () => {
      if (d.crew.has(c)) d.crew.delete(c); else if (d.crew.size < 2) d.crew.add(c); else { Sound.deny(); return deckSay('2 jacks: unplug one first.', C.danger); }
      Sound.tick(); }]));
  } else if (id === 'uplink') {
    head('UPLINK' + (deckOpen(4) ? '' : ' · LOCKED'), deckOpen(4) ? 'empty' : 'opens with mk IV', deckOpen(4) ? C.text : C.mid);
    tick(3, 'G0D.exe plugs in here: it plays for you, with its click limit. a second jack doubles the clicks.');
  } else if (id === 'hdr3' || id === 'hdr4') {
    const m = id === 'hdr3' ? 3 : 4;
    head(`EXPANSION · mk ${deckMk(m)}`, deckOpen(m) ? 'plugged in' : 'empty', deckOpen(m) ? C.money : C.mid);
    tick(3, m === 3 ? 'the mk III board plugs in here. the CPU upgrade: 600 REP (ELITE).' : 'the mk IV board plugs in here. it needs the FUSE for power.');
    if (m === 3 && d.mk < 3) btns([['[ mk III · 600 REP ]', C.rep, 'dkmk3', deckUpgrade3]]);
  }
}
function deckUpgrade3() {
  const d = DECK;
  if (d.rep < 600) { Sound.deny(); return deckSay('not enough REP.', C.danger); }
  d.rep -= 600; d.mk = Math.max(d.mk, 3); Sound.buy(); deckSay('mk III: the middle board is in.');
}
function deckEnterByte() {
  const d = DECK, code = d.bits.join('');
  d.tick = { text: DECK_CODES[code] || 'NO CARRIER', t: performance.now() };
  Sound.ui();
  deckShow(22, 4, L.hc - 1 - 5 - DECK_CARD_H - 2);   // the ticker answers on the board: bring it into view
  if (code === '01111111') setTimeout(() => d.bits.fill(0), 900);
}
