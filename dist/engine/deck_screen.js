// NeoN+1 engine/deck_screen.js: YOUR DECK's screen: the show (a chip going in, the mk upgrades) and the drawing (the
// board, the sockets, the cards, the picker, the CPU). Moved out of engine/deck.js (the second audit, 2026-11-23).
// Loads after engine/deck_shell.js.
'use strict';
NEON_FILES.push(['engine/deck_screen.js', 'v16.01']);

// ---------- the show (docs/DECK.md "Socketing gets a show", Greg 2026-11-16) ----------
// A chip goes in with power: a burst of confetti and tech blobs (more the rarer it is), and a wave of light runs out of
// its socket along the traces. No power: the light drains back into the socket, the board goes dim, then fills again,
// with static sparks around the chip. d.fx = { kind: 'in' | 'dead', sid, t0, lvl, burst }.
// The board's own look, toned back so it isn't noisy: the traces lean to the mk's color (mk II rare, III epic, IV
// exotic: Greg), silkscreen part numbers in the empty spots, vias, and now and then a data packet running a trace.
// (Greg, 2026-11-16: rare, epic, then legendary; but mk IV takes the exotic gold, he likes it better than the orange)
const DECK_MK_RARITY = { 2: 'rare', 3: 'epic', 4: 'exotic' };
const deckTraceCol = () => rarityCol(DECK_MK_RARITY[DECK.mk] || 'rare');
const DECK_LVL = { scrap: 0, common: 0, rare: 1, epic: 2, legendary: 3, exotic: 4 };
const DECK_TRACE = '-|=:.+o_/\\';   // the characters light runs along
const DECK_WAVE_MS = 13, DECK_DRAIN_MS = 7;   // ms a cell: the wave out, the drain in (and the fill back)
function deckFx(kind, sid, key) {
  const d = DECK; d.fx = { kind, sid, t0: performance.now(), lvl: key ? DECK_LVL[DECK_CHIPS[key][2]] || 0 : 0, burst: false };
  if (kind === 'in' && !reduced()) {
    (d.snakes = d.snakes || []).push(...deckSnakes(sid, 3 + 2 * d.fx.lvl, 12 + 5 * d.fx.lvl, d.fx.t0));   // (snakes along the wires: Greg)
    if (key) d.snakes.push(...deckRoundSnakes(sid, rarityCol(DECK_CHIPS[key][2]), d.fx.t0 + 100));   // ...and a burst of rounded ones out of the chip
    if (key && DECK_TECH_ON) d.techs = (d.techs || []).concat(deckTechs(sid, d.fx.lvl, rarityCol(DECK_CHIPS[key][2]), d.fx.t0));   // tech blobs around it
  }
  if (kind === 'in') Sound.chipIn(d.fx.lvl); else Sound.chipDead();
}
// how far each of the board's cells is from a socket (cached per socket). The art's traces have gaps (it's ASCII), so
// the light spreads out as a ring across the board's lines, a cell's distance jittered a little so the edge crackles.
// (y counts double: a cell is twice as tall as it is wide.)
const deckDists = {};
function deckDist(sid) {
  if (deckDists[sid]) return deckDists[sid];
  const ART = deckArt(), s = deckSock(sid) || DECK_PARTS.find(p => p.id === sid), m = new Map();
  let max = 0;
  for (let y = 0; y < ART.length; y++) for (let x = 0; x < DECK_ART_W; x++) {
    if ((ART[y][x] || ' ') === ' ') continue;
    const dx = x - clamp(x, s.x, s.x + s.w - 1), dy = y - clamp(y, s.y, s.y + s.h - 1), j = ((x * 37 + y * 91) % 7) / 4;
    const dd = Math.sqrt(dx * dx + 4 * dy * dy) + j; m.set(y * 64 + x, dd); max = Math.max(max, dd);
  }
  return (deckDists[sid] = { m, max });
}
// silkscreen (toned back): part numbers, mounting holes, the board's name. Each one only goes where the art is empty.
const DECK_SILK = [[0, 0, '(o)'], [33, 0, '(o)'], [8, 13, 'U1'], [14, 21, '<XTAL>'], [22, 26, 'R12'], [27, 26, '-/\\/-'],
  [12, 39, 'C7'], [26, 39, '+5V'], [2, 52, 'GND'], [2, 53, 'Q2'], [16, 52, 'NEON+1 DECK'], [19, 53, 'REV E'], [0, 55, '(o)'], [33, 55, '(o)']];
let deckSilkCells = null;
function deckLook() {   // the silkscreen's cells and the vias, worked out once
  if (deckSilkCells) return deckSilkCells;
  const ART = deckArt(), cover = (x, y) => DECK_SOCKETS.concat(DECK_PARTS).some(r => x >= r.x - 1 && x < r.x + r.w + 1 && y >= r.y && y < r.y + r.h);
  const free = (x, y) => ART[y] && x >= 0 && x < DECK_ART_W && (ART[y][x] || ' ') === ' ' && !cover(x, y);
  const silk = DECK_SILK.filter(([x, y, t]) => [...t].every((_, i) => free(x + i, y) && free(x + i - 1, y) && free(x + i + 1, y)));
  const vias = [];
  for (let y = 0; y < ART.length; y++) for (let x = 0; x < DECK_ART_W; x++) {
    if (!free(x, y) || silk.some(([sx, sy, t]) => sy === y && x >= sx - 1 && x <= sx + t.length)) continue;
    const near = [[1, 0], [-1, 0]].some(([dx]) => DECK_TRACE.includes((ART[y] || '')[x + dx] || ' '));
    if (near && ((x * 73 + y * 151) % 41) === 0) vias.push([x, y]);
  }
  // hidden tech blobs: dim (or dark) until your deck is alive enough, or a ripple passes (Greg)
  const blobs = [];
  for (let y = 0; y < ART.length; y++) for (let x = 0; x < DECK_ART_W; x++) {
    if (!free(x, y) || silk.some(([sx, sy, t]) => sy === y && x >= sx - 1 && x <= sx + t.length) || vias.some(([vx, vy]) => vx === x && vy === y)) continue;
    const h = ((x * 2654435761 + y * 40503) >>> 0) % 1000 / 1000;
    if (h < 0.07) blobs.push([x, y, 'o*=#:.+'[Math.floor(h * 1000) % 7], h / 0.07]);
  }
  return (deckSilkCells = { silk, vias, blobs });
}
// The wires as a graph (Greg, 2026-11-16: "the pulse should follow the traces"): a wire char links to the wire chars
// around it (a diagonal only through / or \). Snakes: a lit head with a short tail running a random walk along it, a
// few out of a socket when a chip goes in (more and longer the rarer), and now and then on their own.
const DECK_WIRE = '-|=:+o_/\\<>^v{}';
let deckWireMap = null;
function deckWires() {
  if (deckWireMap) return deckWireMap;
  const ART = deckArt(), is = (x, y) => DECK_WIRE.includes((ART[y] || '')[x] || ' '), m = new Map();
  for (let y = 0; y < ART.length; y++) for (let x = 0; x < DECK_ART_W; x++) {
    if (!is(x, y)) continue;
    const n = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if ((!dx && !dy) || !is(x + dx, y + dy)) continue;
      if (dx && dy && !'/\\'.includes(ART[y][x]) && !'/\\'.includes(ART[y + dy][x + dx])) continue;
      n.push([x + dx, y + dy]);
    }
    m.set(y * 64 + x, n);
  }
  return (deckWireMap = m);
}
// a walk along the wires from [x, y]: it keeps its heading when it can
function deckWalk(x, y, len, avoid) {
  const W = deckWires(), path = [[x, y]], seen = new Set([y * 64 + x]);
  let hx = 0, hy = 0;
  for (let i = 0; i < len; i++) {
    const [px, py] = path[path.length - 1];
    const nx = (W.get(py * 64 + px) || []).filter(([a, b]) => !seen.has(b * 64 + a) && !(avoid && avoid(a, b)));
    if (!nx.length) break;
    const ahead = nx.filter(([a, b]) => a - px === hx && b - py === hy);
    const [a, b] = ahead.length && Math.random() < 0.7 ? ahead[0] : nx[Math.floor(Math.random() * nx.length)];
    hx = a - px; hy = b - py; seen.add(b * 64 + a); path.push([a, b]);
  }
  return path;
}
// snakes out of a socket (or a part): from the wires touching it, outward
function deckSnakes(sid, n, len, now, delay = 40) {
  const s = deckSock(sid) || DECK_PARTS.find(p => p.id === sid), W = deckWires(), inside = (x, y) => x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h;
  const starts = [];
  for (let y = s.y - 1; y <= s.y + s.h; y++) for (let x = s.x - 1; x <= s.x + s.w; x++) if (!inside(x, y) && W.has(y * 64 + x)) starts.push([x, y]);
  if (!starts.length) return [];
  return Array.from({ length: n }, (_, i) => { const [x, y] = starts[Math.floor(Math.random() * starts.length)]; return { path: deckWalk(x, y, len + Math.floor(Math.random() * len / 2), inside), t0: now + i * delay, ms: 26 }; });
}
// The under-traces (Greg, 2026-11-16): every socket has a few paths of its own, box-line style, running out from it under
// the board and around (empty board first, across the art when they must, never through a socket or a part). They're
// hidden: they only show while a snake runs them, lit in the slot's chip's rarity. Fixed per socket (seeded by its id).
// deckUnder() = { sid: [ [[x, y, ch], ...], ... ] }
const DECK_UNDER_N = 3;
const DECK_UNDER_ON = false;   // (Greg, 2026-11-16: off for now, to see the slot burst on its own)
let deckUnderMap = null;
function deckUnder() {
  if (deckUnderMap) return deckUnderMap;
  const ART = deckArt(), H = ART.length, rects = DECK_SOCKETS.concat(DECK_PARTS), m = {};
  const blocked = (x, y) => x < 0 || y < 0 || x >= DECK_ART_W || y >= H || rects.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  const empty = (x, y) => (ART[y][x] || ' ') === ' ';
  for (const s of DECK_SOCKETS) {
    if (s.g === 'glyph') continue;
    let seed = [...s.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const ring = [];   // the cells around the socket, heading away from it
    for (let x = s.x; x < s.x + s.w; x++) ring.push([x, s.y - 1, 0, -1], [x, s.y + s.h, 0, 1]);
    for (let y = s.y; y < s.y + s.h; y++) ring.push([s.x - 1, y, -1, 0], [s.x + s.w, y, 1, 0]);
    const starts = ring.filter(([x, y]) => !blocked(x, y));
    m[s.id] = [];
    for (let i = 0; i < DECK_UNDER_N && starts.length; i++) {
      let [x, y, hx, hy] = starts[Math.floor(rnd() * starts.length)];
      const path = [[x, y]], seen = new Set([y * 64 + x]), len = 10 + Math.floor(rnd() * 16);
      for (let k = 0; k < len; k++) {
        // straight on mostly, a turn now and then; empty board wins
        const opts = [[hx, hy, 3], [hy, hx, 1], [-hy, -hx, 1]].filter(([dx, dy]) => !blocked(x + dx, y + dy) && !seen.has((y + dy) * 64 + x + dx));
        if (!opts.length) break;
        let best = null, bs = -1;
        for (const [dx, dy, w] of opts) { const sc = (empty(x + dx, y + dy) ? 2 : 0.35) * w * (0.4 + rnd()); if (sc > bs) { bs = sc; best = [dx, dy]; } }
        [hx, hy] = best; x += hx; y += hy; seen.add(y * 64 + x); path.push([x, y]);
      }
      if (path.length < 5) continue;
      // box lines: a cell's char from where the path comes in and goes out
      m[s.id].push(path.map(([x, y], j) => {
        const nb = [path[j - 1], path[j + 1]].filter(Boolean).map(([a, b]) => [a - x, b - y]);
        const h = nb.some(([a]) => a), v = nb.some(([, b]) => b);
        if (!h || !v) return [x, y, h ? '─' : '│'];
        const l = nb.some(([a]) => a < 0), u = nb.some(([, b]) => b < 0);
        return [x, y, u ? (l ? '┘' : '└') : (l ? '┐' : '┌')];
      }));
    }
  }
  return (deckUnderMap = m);
}
// snakes on a socket's under-traces, in its chip's rarity (back: run one in toward the socket)
function deckUnderSnake(sid, i, now, ms = 45, back = false) {
  const p = (deckUnder()[sid] || [])[i], key = DECK.slots[sid];
  if (!p || !key || !DECK_CHIPS[key]) return null;
  const path = back ? p.slice().reverse() : p;
  return { path: path.map(([x, y]) => [x, y]), ch: path.map(c => c[2]), t0: now, ms, rc: rarityCol(DECK_CHIPS[key][2]), tail: 7 };
}
// The slot burst (Greg, 2026-11-16): 4 to 7 snakes in rounded box lines, out of the chip in random directions,
// gone in about 2 seconds. Their paths are fresh each time and go anywhere on the board, but they run under the
// sockets and the parts (deckUnderAt: they don't draw there), so they never cover a chip.
const deckUnderAt = (x, y) => DECK_SOCKETS.concat(DECK_PARTS).some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
function deckRoundSnakes(sid, rc, now) {
  const s = deckSock(sid), H = deckArt().length, out = [], n = 4 + Math.floor(Math.random() * 4);   // (Greg: 4 to 7)
  const ring = [];   // the cells around the socket, heading away from it
  for (let x = s.x; x < s.x + s.w; x++) ring.push([x, s.y - 1, 0, -1], [x, s.y + s.h, 0, 1]);
  for (let y = s.y; y < s.y + s.h; y++) ring.push([s.x - 1, y, -1, 0], [s.x + s.w, y, 1, 0]);
  const starts = ring.filter(([x, y]) => x >= 0 && y >= 0 && x < DECK_ART_W && y < H);
  for (let i = 0; i < n && starts.length; i++) {
    let [x, y, hx, hy] = pickR(starts, Math.random);
    const path = [[x, y]], seen = new Set([y * 64 + x]), len = 14 + Math.floor(Math.random() * 7);   // (Greg: a bit further, fewer turns, about 2 seconds)
    for (let k = 0; k < len; k++) {
      const turn = Math.random() < 0.15, dirs = (turn ? [[hy, hx], [-hy, -hx], [hx, hy]] : [[hx, hy], [hy, hx], [-hy, -hx]]).filter(([dx, dy]) => {
        const a = x + dx, b = y + dy; return a >= 0 && b >= 0 && a < DECK_ART_W && b < H && !seen.has(b * 64 + a) && !(a >= s.x && a < s.x + s.w && b >= s.y && b < s.y + s.h); });
      if (!dirs.length) break;
      const [dx, dy] = turn && dirs.length > 1 && Math.random() < 0.5 ? dirs[1] : dirs[0];
      hx = dx; hy = dy; x += dx; y += dy; seen.add(y * 64 + x); path.push([x, y]);
    }
    const ch = path.map(([x, y], j) => {
      const nb = [path[j - 1], path[j + 1]].filter(Boolean).map(([a, b]) => [a - x, b - y]);
      const h = nb.some(([a]) => a), v = nb.some(([, b]) => b);
      if (!h || !v) return h ? '─' : '│';
      const l = nb.some(([a]) => a < 0), u = nb.some(([, b]) => b < 0);
      return u ? (l ? '╯' : '╰') : (l ? '╮' : '╭');
    });
    out.push({ path, ch, t0: now + i * 70, ms: (75 + Math.random() * 20) / 1.2, rc, tail: 5, under: true });
  }
  return out;
}
// tech blobs around a chip that just went in: they pop up around the socket, decode, glow in its rarity, then fade
// (more the rarer). d.techs = [{ x, y, t, t0, life, col }]
const DECK_TECH_ON = false;   // the ring of them around the chip (Greg, 2026-11-16: off; they come at the slot burst's ends now: DECK_TECH_END)
const DECK_TECH = ['o', '#', '=o=', '[]', '0x', '::', '<>', '+', '*', '1o', '=#'];
function deckTechs(sid, lvl, col, now, n = 5 + 3 * lvl) {
  const s = deckSock(sid), ART = deckArt(), rects = DECK_SOCKETS.concat(DECK_PARTS), out = [];
  const blocked = (x, y) => x < 0 || y < 0 || x >= DECK_ART_W || y >= ART.length || rects.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  const have = DECK.techs || [];
  for (let tries = 0; out.length < n && tries < n * 12; tries++) {
    const t = pickR(DECK_TECH, Math.random), x = s.x - 3 + Math.floor(Math.random() * (s.w + 6)), y = s.y - 1 + Math.floor(Math.random() * (s.h + 2));
    if ([...t].some((_, i) => blocked(x + i, y)) || out.concat(have).some(o => o.y === y && x < o.x + o.t.length + 1 && o.x < x + t.length + 1)) continue;
    out.push({ x, y, t, t0: now + Math.random() * (250 + 60 * lvl), life: 650 + Math.random() * (400 + 120 * lvl), col });
  }
  return out;
}
// ...and one where a slot burst's snake ends (Greg, 2026-11-16: the wires go out and run around, then a tech blob where
// each one ends, in the chip's rarity). On the end cell or next to it, never on a socket, a part or another blob.
const DECK_TECH_END = true;
function deckTechAt(x, y, col, now) {
  const d = DECK, H = deckArt().length, t = pickR(DECK_TECH, Math.random), have = d.techs || [];
  for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1], [-2, 0], [-1, -1], [-1, 1]]) {
    const bx = x + dx - Math.floor((t.length - 1) / 2), by = y + dy;
    if ([...t].some((_, i) => bx + i < 0 || bx + i >= DECK_ART_W || by < 0 || by >= H || deckUnderAt(bx + i, by))) continue;
    if (have.some(o => o.y === by && bx < o.x + o.t.length + 1 && o.x < bx + t.length + 1)) continue;
    d.techs = have.concat({ x: bx, y: by, t, t0: now, life: 900 + Math.random() * 500, col });
    return;
  }
}
// How alive your deck is (0-1): more chips in, more power used, a higher mk (Greg: more tech blobs, more active, as you
// slot more and your deck levels up). It sets how many hidden blobs glow and how often snakes run on their own.
function deckEnergy(pw) {
  const d = DECK, open = DECK_SOCKETS.filter(s => deckOpen(s.mk) && s.g !== 'glyph');
  const filled = open.length ? open.filter(s => d.slots[s.id] && pw.on.has(s.id)).length / open.length : 0;
  const pf = pw.budget ? pw.used / pw.budget : 0;
  return clamp(0.12 + 0.45 * filled + 0.25 * pf + 0.18 * (d.mk - 2) / 2, 0, 1);
}
// a smooth scroll of the board (Greg: the NO POWER bar jumped; about half a second)
const DECK_SCROLL_MS = 450;
function deckScrollTo(to) { const d = DECK; d.scrollTo = { from: d.scroll, to, t0: performance.now() }; }
const deckScrollGoal = () => DECK.scrollTo ? DECK.scrollTo.to : DECK.scroll;
// the band an mk opens (its first row on the board), for the upgrade's boot sweep
const DECK_BAND_TOP = { 2: 0, 3: 28, 4: 41 }, DECK_BAND_END = { 2: 28, 3: 41, 4: 56 };

// the CRASH stick: a name too long for it shows a word (or 4 letters) at a time, swapping with a scramble (Greg)
function deckStickText(name, now) {
  const parts = name.includes(' ') ? name.split(' ') : name.length <= 5 ? [name] : name.match(/.{1,4}/g);
  if (parts.length < 2) return name.replace(/ /g, '');
  const per = 1500, k = Math.floor(now / per) % parts.length, t = now % per, cur = parts[k], prev = parts[(k + parts.length - 1) % parts.length];
  if (t > 300) return cur;
  return Array.from({ length: Math.max(cur.length, prev.length) }, (_, j) => t > 60 + j * 50 ? (cur[j] || ' ') : noiseCh()).join('');
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
// A scroll area by rows, with the "more" rows (engine/codex.js scrollArea). items: { h, stop, draw(g, ctx, y) }: a chip is
// 2 rows (stop: true), with a dim dashed row between (deckSep). The wheel and a drag move it a row at a time and can
// leave an item cut at the edge; a "more" tap or the keys step to the next whole item (Greg, 2026-11-15). s: { top }
// (a row). Returns { line, step, show(i) }.
function deckRows(ctx, g, x0, w, y, rows, items, s, idp) {
  const start = []; let total = 0;
  for (const it of items) { start.push(total); total += it.h; }
  const fits = total <= rows, inner = fits ? rows : rows - 2, wy = fits ? y : y + 1, max = Math.max(0, total - inner);
  s.top = clamp(s.top || 0, 0, max);
  const top = s.top, inRows = yy => yy >= wy && yy < wy + inner;
  // what an item draws with: everything clipped to the window
  const cg = { get dim() { return g.dim; }, set dim(v) { g.dim = v; },
    put: (x, yy, t, col, bold) => { if (inRows(yy)) g.put(x, yy, t, col, bold); },
    clr: (x, yy, ww, h = 1) => { for (let j = 0; j < h; j++) if (inRows(yy + j)) g.clr(x, yy + j, ww, 1); },
    bg: (x, yy, ww, h, col, a) => { for (let j = 0; j < h; j++) if (inRows(yy + j)) g.bg(x, yy + j, ww, 1, col, a); } };
  const clip = (yy, h) => { const a = Math.max(yy, wy), b = Math.min(yy + h, wy + inner); return b > a ? [a, b - a] : null; };
  const cctx = Object.assign({}, ctx, {
    hl: (x, yy, ww, h, id, m) => { const c = clip(yy, h); if (c) ctx.hl(x, c[0], ww, c[1], id, m); },
    addHit: (x, yy, ww, h, hit) => { const c = clip(yy, h); if (c) ctx.addHit(x, c[0], ww, c[1], hit); } });
  items.forEach((it, i) => { const yy = wy + start[i] - top; if (yy + it.h > wy && yy < wy + inner) it.draw(cg, cctx, yy); });
  const line = dd => { const t = clamp(s.top + dd, 0, max); if (t !== s.top) { s.top = t; Sound.tick(); } };
  const stops = items.map((it, i) => i).filter(i => items[i].stop);
  // a step: to the next item that isn't all in view, all of it (the first item takes the rows above it too)
  const step = dd => {
    let t;
    if (dd > 0) { const i = stops.find(i => start[i] + items[i].h > s.top + inner); t = i != null ? Math.max(s.top + 1, start[i] + items[i].h - inner) : max; }
    else { const i = stops.slice().reverse().find(i => start[i] < s.top); t = i != null ? Math.min(s.top - 1, i === stops[0] ? 0 : start[i]) : 0; }
    s.top = clamp(t, 0, max);
  };
  const show = i => {
    if (i == null || i < 0) return;
    const a = i === stops[0] ? 0 : start[i], b = start[i] + items[i].h;
    if (a < s.top) s.top = a; else if (b > s.top + inner) s.top = b - inner;
    s.top = clamp(s.top, 0, max);
  };
  if (!fits) {
    deckMore(ctx, g, x0, w, y, true, top > 0, () => step(-1), idp + 'up');
    deckMore(ctx, g, x0, w, y + rows - 1, false, top < max, () => step(1), idp + 'dn');
  }
  return { line, step, show };
}
// the row between two items: a light dashed line
const deckSep = (x, w) => ({ h: 1, draw: (g, ctx, y) => g.put(x + 1, y, rule(w - 2), C.dim) });
// a chip's face: 3 x 2 (5 x 2 for BOSS), both rows art, on its rarity chip (grey with no power)
function deckFace(g, x, y, key, off) {
  const c = DECK_CHIPS[key], ch = off ? DECK_OFF : chipOf(c[2]), w = c[1] === 'boss' ? 5 : 3;
  const bot = key === 'SP3' ? DECK_SPOILS[DECK.spoils][1] : c[5][1];
  g.bg(x, y, w, 2, ch.bg, 1); g.put(x, y, c[5][0], ch.fg, true); g.put(x, y + 1, bot, ch.fg, true);
  if (deckIsRipped(key) && !off) for (let r = 0; r < 2; r++) deckRipGlow((cx, cy, col, a) => g.bg(cx, cy, 1, 1, col, a), x, y + r, w, performance.now() - r * 150);   // RIPPED: magenta runs through it
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
    else deckFavArt(d.glyph).forEach((l, j) => P(X + 1, Y + 1 + j, l, C.bright, true));
  } else {
    P(X, Y, '+' + (inner > 3 ? '.' : '') + s.id + (inner > 3 ? '.' : '') + '+', col);
    for (let j = 1; j < s.h - 1; j++) { P(X, Y + j, !open || !key ? ':' : ']', col); P(X + w - 1, Y + j, !open || !key ? ':' : '[', col); }
    P(X, Y + s.h - 1, !open ? '+' + '.'.repeat(inner) + '+' : key ? (inner > 3 ? '+-+-+-+' : '+-+-+') : (inner > 3 ? '+ - - +' : '+ - +'), col);
    // the power on the bottom border (Greg, 2026-11-15): the chip's cost, centered (none at 0); the PSU: used / budget
    if (open && key && pw && d.slots[s.id] === key) {
      const c = DECK_CHIPS[key][3], mid = X + Math.floor(w / 2);
      if (s.id === 'PSU') P(X + 1, Y + s.h - 1, deckHex(pw.used) + '/' + deckHex(pw.budget), d.overclock ? C.accent : C.money, true);
      else if (c) P(mid, Y + s.h - 1, deckHex(c), off ? C.danger : C.money, true);
    }
    if (!open) P(X + 1, Y + 1, inner > 3 ? ' mk' + s.mk + ' ' : 'mk' + s.mk, C.mid);
    else if (key) deckFace({ put: P, bg: B }, X + 1, Y + 1, key, off);
    else if (s.id === DECK_KIT_SOCKET) P(X + 1, Y + 1, 'KIT', C.mid);   // (the KIT socket, empty: says so)
    // a SHELL socket before ROOT moves in (its quest: engine/quests.js): something lives in it, glitching in the quest color
    if (open && deckShellPending(s)) for (let j = 1; j < s.h - 1; j++) for (let i = 1; i < w - 1; i++)
      if (hh(i + s.x * 7, j + Math.floor(now / 140) + s.y) < (key ? 0.12 : 0.35)) P(X + i, Y + j, noiseCh(), C.rep);
  }
  if (d.carry && open && deckFits(d.carry, s) && Math.floor(now / 300) % 2) B(X, Y, w, s.h, C.accent, 0.3);
  if (sel) B(X, Y, w, s.h, C.accent, 0.22);
}

function deckLines(T, B, X) {
  const d = DECK; if (!d) return;
  const sa = L.hc - 1 - 5 - DECK_CARD_H;   // the scroll area: what the header, the card and the footer row leave
  st.scroll = null;
  deckPersist();
  X({ h: 5, draw: (ctx, y) => deckHeader(ctx, y) });
  X({ h: sa, draw: (ctx, y) => { if (d.pick) (d.pick.id === 'CREW' ? deckCrewPicker : deckPicker)(ctx, y, sa); else if (d.cpu) deckCpu(ctx, y, sa); else if (d.view === 'chips') deckChipList(ctx, y, sa); else deckBoard(ctx, y, sa); } });
  X({ h: DECK_CARD_H, draw: (ctx, y) => deckCard(ctx, y) });
}

function deckHeader(ctx, y) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), W = L.wc;
  // top left: the way out (Greg, 2026-11-21: every menu's [< TITLE] sits here). REP isn't up here any more: it's in the
  // buttons that cost it (deckRepBtn)
  if (d.real) deckBtn(ctx, g, 0, y, '[< TITLE]', C.mid, 'back', () => deckLeave('title'));
  else g.put(0, y, 'NeoN+1', C.accent);
  // THE BOARD's tabs, DECK lit (Greg, 2026-11-21: the deck is a BOARD tab; it had its own header and a [LEAVE] that was
  // really a back). The same two rows as THE BOARD (engine/menus.js openBoard), centered. The dev deck: its own row.
  if (d.real) {
    const rows = [['you', 'rep', 'deck'], ['feats', 'crew', 'quests']];
    rows.forEach((ks, ri) => {
      const labels = ks.map(k => `[${k.toUpperCase()}${k !== 'deck' && boardStar(k) ? '*' : ''}]`), w = labels.join(' ').length;
      let x = Math.floor((W - w) / 2);
      ks.forEach((k, i) => {
        if (k === 'deck') { g.bg(x, y + 1 + ri, labels[i].length, 1, C.accent, 0.22); g.put(x, y + 1 + ri, labels[i], C.accent, true); x += labels[i].length + 1; }
        else x = deckBtn(ctx, g, x, y + 1 + ri, labels[i], C.bright, 'dkb_' + k, () => deckLeave(k));
      });
    });
  } else if (d.train) g.put(0, y + 1, 'DECK · TRAINING', C.accent, true);   // (the deck training: engine/tutorial.js)
  else {
    g.put(0, y + 1, 'DECK · DEV', C.danger, true); deckBtn(ctx, g, W - 7, y + 1, '[LEAVE]', C.mid, 'dkleave', () => deckLeave());
  }
  // the sub-tabs: SLOTS and CHIPS, in a strip (the same look as engine/textboard.js drawSubTabs), the power on the right
  g.bg(0, y + 3, W, 1, C.dim, 0.35);
  const tab = (v, label, id, x) => { const s = ` ${label} `, on = d.view === v; if (on) g.bg(x, y + 3, s.length, 1, C.accent, 1);
    deckBtn(ctx, g, x, y + 3, s, on ? C.bg : C.bright, id, () => { if (d.view === v) return; d.view = v; d.pick = null; d.cpu = null; d.carry = null; Sound.tick(); }); return x + s.length + 1; };
  const x2 = tab('board', 'SLOTS', 'dktb', 1); const x3 = tab('chips', `CHIPS ${deckOwned().length}`, 'dktc', x2);
  const pwt = `PWR ${pw.used}/${pw.budget}` + (pw.fuse ? ` F${pw.fuse.used}/${pw.fuse.budget}` : '') + (pw.off.length ? ` !${pw.off.length}` : ''), mkt = `mk ${deckMk(d.mk)} `;
  g.put(W - pwt.length, y + 3, pwt, pw.off.length ? C.danger : C.money, !!pw.off.length);
  if (W - pwt.length - mkt.length >= x3 + 1) g.put(W - pwt.length - mkt.length, y + 3, mkt, C.money);   // (the mk gives way when it's tight)
  g.put(0, y + 4, rule(W), C.dim);
  g.flush();
}

const DECK_MOLD_CH = '%&#*;:,.';
let deckMoldSkip = null;   // (the sockets' cells: the mold stays off them)
function deckMold(bput, d, now, still) {
  if (!deckMoldSkip) { deckMoldSkip = new Set(); for (const s of DECK_SOCKETS) for (let y = s.y; y < s.y + s.h; y++) for (let x = s.x; x < s.x + (s.w || 5); x++) deckMoldSkip.add(x + ',' + y); }
  const runs = d.real ? (save.deck && save.deck.spore) || 0 : 12, ps = deckSock('PSU'), cx = ps.x + 2, cy = ps.y + 2;
  const R = Math.min(48, 5 + runs * 1.6), ART = deckArt(), fr = still ? 0 : Math.floor(now / 900);
  const hs = (a, b) => { const v = Math.sin(a * 91.7 + b * 47.3) * 43758.5453; return v - Math.floor(v); };
  for (let y = Math.max(0, cy - Math.ceil(R)); y < Math.min(ART.length, cy + R); y++) for (let x = 0; x < DECK_ART_W; x++) {
    if (deckMoldSkip.has(x + ',' + y)) continue;
    const dist = Math.hypot((x - cx) * 0.6, y - cy), edge = R * (0.55 + 0.45 * hs(x, y));
    if (dist > edge) continue;
    const th = Math.max(0, Math.min(3.9, (1 - dist / edge) * 4.2)), fresh = !still && dist > edge - 1.5 && hs(x + fr, y) < 0.08;
    bput(x, y, DECK_MOLD_CH[Math.min(DECK_MOLD_CH.length - 1, Math.floor((4 - th) * 2))], fresh ? MOLD.fresh : moldCol(th), th > 3);
  }
}
function deckBoard(ctx, y0, sa, under = null) {   // under: the picker's grid (the board draws into it, dim, no taps)
  const d = DECK, g = under || deckGrid(ctx), now = ctx.now, pw = deckPower(), ART = deckArt(), BH = ART.length, bv = sa - 2;
  const ax = Math.floor((L.wc - DECK_ART_W) / 2), maxTop = Math.max(0, BH - bv);
  if (d.scrollTo && !under) { const k = clamp((now - d.scrollTo.t0) / DECK_SCROLL_MS, 0, 1), e = 1 - Math.pow(1 - k, 3);
    d.scroll = Math.round(d.scrollTo.from + (clamp(d.scrollTo.to, 0, maxTop) - d.scrollTo.from) * e); if (k >= 1) d.scrollTo = null; }
  d.scroll = clamp(d.scroll, 0, maxTop);
  const top = d.scroll, inView = by => by >= top && by < top + bv, sy = by => y0 + 1 + by - top;
  const bput = (x, by, s, col, bold) => { if (inView(by)) g.put(ax + x, sy(by), s, col, bold); };
  const bbg = (x, by, w, h, col, a) => { const a0 = Math.max(by, top), a1 = Math.min(by + h, top + bv); if (a1 > a0) g.bg(ax + x, sy(a0), w, a1 - a0, col, a); };
  const bclr = (x, by, w, h) => { for (let r = by; r < by + h; r++) if (inView(r)) g.clr(ax + x, sy(r), w, 1); };
  const bhit = (x, by, w, h, id, fn) => { if (under) return; const a0 = Math.max(by, top), a1 = Math.min(by + h, top + bv); if (a1 > a0) { ctx.hl(ax + x, sy(a0), w, a1 - a0, id, false); ctx.addHit(ax + x, sy(a0), w, a1 - a0, { kind: 'btn', id, onTap: fn }); } };
  if (under) g.dim = true;
  // the art, dim where the band is dark
  const tc = deckTraceCol(), idle = mixHex(C.mid, tc, 0.3), silkCol = mixHex(C.dim, C.mid, 0.45);
  for (let by = top; by < top + bv && by < BH; by++) g.put(ax, sy(by), ART[by], deckOpen(deckBand(by)) ? idle : C.dim);
  { const lk = deckLook();   // silkscreen and vias, toned back
    for (const [x, y, t] of lk.silk) bput(x, y, t, silkCol);
    for (const [x, y] of lk.vias) bput(x, y, 'o', mixHex(C.dim, tc, 0.25)); }
  const fx = d.fx, fxAge = fx ? now - fx.t0 : 0, still = reduced(), en = deckEnergy(pw), lk = deckLook();
  const hh = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
  // the hidden tech blobs: the livelier your deck, the more of them glow (dim), and now and then one twinkles
  if (!under) for (const [x, y, ch, h] of lk.blobs) {
    if (!deckOpen(deckBand(y)) || h > en * 0.75) continue;
    const tw = !still && hh(x * 13 + y, Math.floor(now / 350)) < 0.01 + 0.05 * en;
    bput(x, y, ch, tw ? mixHex(tc, C.bright, 0.4) : mixHex(C.dim, tc, 0.15 + 0.3 * en), tw);
  }
  // SPORE CELL (a cell): the mold creeps over your board from the PSU, more with every run it powers (save.deck.spore;
  // the dev deck: some). G0D's mold, its colors and marks (engine/fx.js moldCol). Never over a socket.
  if (d.slots.PSU === 'SPC') deckMold(bput, d, now, still);
  // snakes on their own, more often the livelier your deck is
  d.snakes = d.snakes || [];
  if (!under && !still && now > (d.ambNext || 0)) {
    d.ambNext = now + (1400 + Math.random() * 4000) * (1.5 - en);   // (Greg, 2026-11-16: a little less often)
    const W = deckWires(), ks = [...W.keys()];
    for (let tries = 0; tries < 12; tries++) { const k = ks[Math.floor(Math.random() * ks.length)], x = k % 64, y = Math.floor(k / 64);
      if (deckOpen(deckBand(y)) && inView(y)) { d.snakes.push({ path: deckWalk(x, y, 10 + Math.floor(Math.random() * 14)), t0: now, ms: 55, dim: true }); break; } }
  }
  // ...and out the under-traces of the socket you have selected, if its chip has power, now and then (mostly out,
  // sometimes back in) (Greg, 2026-11-16: only for the selected socket)
  if (DECK_UNDER_ON && !under && !still && now > (d.undNext || 0)) {
    d.undNext = now + (1200 + Math.random() * 3000) * (1.5 - en);   // (Greg, 2026-11-16: a little less often, 2 at a time at most)
    const live = d.snakes.filter(sn => sn.ch && !sn.under).length >= 2 ? [] : DECK_SOCKETS.filter(s => d.sel.kind === 'socket' && d.sel.id === s.id && deckOpen(s.mk) && d.slots[s.id] && pw.on.has(s.id) && (deckUnder()[s.id] || []).length && inView(s.y + 1));
    if (live.length) { const s = pickR(live, Math.random), sn = deckUnderSnake(s.id, Math.floor(Math.random() * deckUnder()[s.id].length), now, 50 + Math.random() * 30, Math.random() < 0.25); if (sn) d.snakes.push(sn); }
  }
  if (fx && !under) {   // the show
    const dm = deckDist(fx.sid);
    if (fx.kind === 'in') {   // a ripple: two rings out of the socket, lighting the lines and showing the hidden blobs as they pass
      const f1 = fxAge / DECK_WAVE_MS, f2 = f1 - 9;
      if (f2 > dm.max + 4) d.fx = null;
      else {
        for (const [k, dd] of dm.m) { const r1 = f1 - dd, r2 = f2 - dd; const on1 = r1 >= 0 && r1 < 3, on2 = r2 >= 0 && r2 < 2; if (!on1 && !on2) continue;
          const x = k % 64, y = Math.floor(k / 64); if (deckOpen(deckBand(y))) bput(x, y, ART[y][x], on1 && r1 < 1.2 ? mixHex(tc, C.bright, 0.55) : mixHex(idle, tc, 0.8), on1 && r1 < 1.2); }
        const s0 = deckSock(fx.sid) || DECK_PARTS.find(p => p.id === fx.sid);
        for (const [x, y, ch] of lk.blobs) { if (!deckOpen(deckBand(y))) continue;
          const dx = x - clamp(x, s0.x, s0.x + s0.w - 1), dy = y - clamp(y, s0.y, s0.y + s0.h - 1), dd = Math.sqrt(dx * dx + 4 * dy * dy);
          if (dd <= f1 && dd > f1 - 10) bput(x, y, ch, mixHex(tc, C.bright, (10 - (f1 - dd)) / 20), true); }
      }
    } else {   // the light drains into the socket, holds dark, then fills back
      const drain = dm.max * DECK_DRAIN_MS, hold = 300, fill = dm.max * DECK_DRAIN_MS * 1.6;
      const front = fxAge < drain ? dm.max - fxAge / DECK_DRAIN_MS : fxAge < drain + hold ? 0 : (fxAge - drain - hold) / (DECK_DRAIN_MS * 1.6);
      if (fxAge > drain + hold + fill) d.fx = null;
      else { for (let by = top; by < top + bv && by < BH; by++) g.put(ax, sy(by), ART[by], C.dim);   // the board goes dim...
        for (const [k, dd] of dm.m) { if (dd > front) continue; const x = k % 64, y = Math.floor(k / 64); if (deckOpen(deckBand(y))) bput(x, y, ART[y][x], idle); } }   // ...but where the light still is
    }
  }
  // the snakes: a lit head, a short tail, along the wires
  if (!under) for (let i = d.snakes.length - 1; i >= 0; i--) {
    const sn = d.snakes[i], hd = Math.floor((now - sn.t0) / sn.ms);
    if (hd < 0) continue;
    const tl = sn.tail || 5;
    if (sn.under && !sn.ended && hd >= sn.path.length - 1) { sn.ended = true; const e = sn.path[sn.path.length - 1]; if (DECK_TECH_END && deckOpen(deckBand(e[1]))) deckTechAt(e[0], e[1], sn.rc, now); }   // (a tech blob where it ends)
    if (hd - tl >= sn.path.length) { d.snakes.splice(i, 1); continue; }
    if (sn.ch) {   // an under-trace: box lines in the chip's rarity, fading down the tail
      for (let j = 0; j <= tl; j++) { const c = sn.path[hd - j]; if (!c || !deckOpen(deckBand(c[1]))) continue;
        if (sn.under && deckUnderAt(c[0], c[1])) continue;   // (under the chips)
        bput(c[0], c[1], sn.ch[hd - j], j ? mixHex(C.dim, sn.rc, 1 - j / (tl + 2)) : mixHex(sn.rc, C.bright, 0.55), j < 2); }
      continue;
    }
    for (let j = 0; j <= 5; j++) { const c = sn.path[hd - j]; if (!c || !deckOpen(deckBand(c[1]))) continue;
      bput(c[0], c[1], j ? ART[c[1]][c[0]] : (sn.dim ? 'o' : '*'), j ? mixHex(idle, tc, (sn.dim ? 0.55 : 1) - j * 0.12) : mixHex(tc, C.bright, sn.dim ? 0.2 : 0.6), !j); }
  }
  // the socket you have selected: a tech blob around it now and then, in its chip's rarity (the board's trace color
  // when it's empty) (Greg, 2026-11-16)
  if (!under && !still && d.sel.kind === 'socket' && now > (d.selTechNext || 0)) {
    d.selTechNext = now + 500 + Math.random() * 900;
    const s = deckSock(d.sel.id), key = s && d.slots[s.id];
    if (s && deckOpen(s.mk) && inView(s.y + 1)) d.techs = (d.techs || []).concat(deckTechs(s.id, 0, key && DECK_CHIPS[key] ? rarityCol(DECK_CHIPS[key][2]) : tc, now, 1));
  }
  // the tech blobs around a chip that just went in: scrambled, then they settle and glow, then dim out
  if (!under && d.techs) {
    d.techs = d.techs.filter(b => now - b.t0 < b.life);
    for (const b of d.techs) { const a = now - b.t0; if (a < 0 || !deckOpen(deckBand(b.y))) continue;
      const k = a / b.life, txt = a < 140 ? [...b.t].map(() => noiseCh()).join('') : k > 0.8 ? b.t.replace(/./g, '.') : b.t;
      bput(b.x, b.y, txt, a < 140 ? C.bright : mixHex(b.col, C.dim, clamp((k - 0.45) / 0.55, 0, 1)), k < 0.5); }
    if (!d.techs.length) d.techs = null;
  }
  // the mk upgrade (Greg, 2026-11-16: big fanfare): the new board boots, a sweep running down it row by row (dark below
  // it), bursts at its sockets as it passes them, then snakes and a ripple out of the CPU. d.up = { mk, t0, bursts }
  const up = d.up, upAge = up ? now - up.t0 : 0;
  if (up && !under && upAge >= 0) {
    const bt = DECK_BAND_TOP[up.mk], be = DECK_BAND_END[up.mk], sweepMs = 1300, sw = bt + (be - bt) * clamp(upAge / sweepMs, 0, 1);
    if (!up.started) {
      up.started = true; Sound.deckUp(); deckSay(`mk ${deckMk(up.mk)} ONLINE.${up.mk === 4 ? ' the FUSE is lit.' : ' new sockets.'}`, tc);   // (it fits the bar)
      deckScrollTo(Math.max(0, bt - 3)); if (!still) { flash(tc, 0.3, 0.5); shake(5, 0.45); }
    }
    if (upAge < sweepMs) for (let by = Math.max(top, Math.floor(sw) + 1); by < Math.min(be, top + bv); by++) g.put(ax, sy(by), ART[by], C.dim);   // not booted yet
    if (upAge < sweepMs) { const ry = Math.floor(sw); if (ry < be) { bput(0, ry, [...ART[ry]].map(c => c === ' ' ? ' ' : still ? c : Math.random() < 0.3 ? noiseCh() : c).join(''), mixHex(tc, C.bright, 0.6), true); } }
    up.bursts = up.bursts || new Set();
    for (const s of DECK_SOCKETS) { if (s.mk !== up.mk || up.bursts.has(s.id) || sw < s.y + 1) continue;
      up.bursts.add(s.id);
      if (!still && inView(s.y + 1)) { const x = pxX(ax + s.x + s.w / 2 - 0.5), y = pxY(sy(s.y + 1)), cells = [];
        for (let k = 0; k < 16; k++) cells.push({ ch: pickR(['o', '*', '+', '0', '1', '#', '=', '<', '>'], Math.random), x: x + rand(-1, 1) * L.cw, y, col: pickR([tc, C.bright, C.money, tc], Math.random) });
        explode(cells, x, y + L.chh / 2, { power: 0.6, grav: 0.6, life: [0.6, 1.3] }); Sound.lamp(); } }
    if (upAge >= sweepMs && !up.done) {
      up.done = true;
      d.snakes.push(...deckSnakes('cpu', 10, 26, now, 30));
      for (const s of DECK_SOCKETS) if (s.mk === up.mk) d.snakes.push(...deckSnakes(s.id, 2, 16, now, 60));
      d.fx = { kind: 'in', sid: 'cpu', t0: now, lvl: 4, burst: true };
      if (!still) { flash(tc, 0.2, 0.4); const x = pxX(L.wc / 2), y = pxY(y0 + Math.floor(bv / 2)), cells = [];
        for (let k = 0; k < 50; k++) cells.push({ ch: pickR(['*', '+', '~', 'x', '.', 'o', '0', '1'], Math.random), x: x + rand(-6, 6) * L.cw, y: y + rand(-2, 2) * L.chh, col: pickR([tc, C.bright, C.money, C.accent, tc], Math.random) });
        explode(cells, x, y, { power: 1, grav: 0.6, life: [1, 1.8] }); }
    }
    if (upAge > 3500) d.up = null;
  }
  // the CPU: your hacker name (2 lines when it doesn't fit), the mk, the pins blinking in turn
  { const n = deckName(), lines = n.length <= 10 ? [n] : n.split('_');
    bclr(4, 5, 12, 5); lines.forEach((l, i) => bput(6, 6 + i, l, C.money, true)); bput(6, 6 + lines.length, 'mk ' + deckMk(d.mk), C.money);
    const k = Math.floor(now / 170) % 12; let pi = 0;
    for (const by of [4, 10]) for (let x = 3; x <= 16; x++) if (ART[by][x] === 'o') { bput(x, by, 'o', pi % 12 === k ? C.bright : C.money, pi % 12 === k); pi++; }
    for (let by = 4; by <= 10; by++) for (const x of [3, 16]) if ('|+o'.includes(ART[by][x])) bput(x, by, ART[by][x], C.money);
    bput(3, 4, '+-', C.money); bput(15, 4, '-+', C.money); bput(3, 10, '+-', C.money); bput(15, 10, '-+', C.money); }
  // the ROM pins: one per BOARD post you've bought (and switch you've turned on), lit
  { const lit = d.real ? LEGACY.filter(u => legacyLv(u.key) > 0 && !u.placeholder).length : DECK_POSTS.length + d.sw.size + (d.nemesis ? 1 : 0); let n = 0;
    for (let x = 6; x <= 13; x++) if (ART[11][x] !== ' ') { bput(x, 11, ART[11][x], n < lit ? C.rep : C.dim, n < lit); n++; } }
  // the CRASH stick reads out its chip, scrolling when the name is longer than 5 (OFF in red with no power)
  { const key = d.slots.CRS, name = key ? DECK_CHIPS[key][0] : '', on = key && pw.on.has('CRS');
    for (let j = 0; j < 5; j++) {
      let ch = '.';
      if (name && !on) ch = ' OFF '[j];
      else if (name) { const w = deckStickText(DECK_CHIPS[key][0], now), o = Math.floor((5 - w.length) / 2); ch = w[j - o] || '.'; }   // (a word at a time, with a scramble: deckStickText)
      bput(23, 10 + j, ch === ' ' ? '.' : ch, name && !on ? C.danger : name && ch !== '.' && ch !== ' ' ? C.bright : C.dim, !!name);
    } }
  // the ]8[ readout: power left, a blinking ! when a chip has none
  bput(30, 16, pw.off.length ? (Math.floor(now / 400) % 2 ? '!' : ' ') : deckHex(pw.left), pw.off.length ? C.danger : pw.left > 0 ? C.money : C.mid, true);
  // THE BYTE's bits, and the ticker under it
  for (let i = 0; i < 8; i++) bput(26 + i, 23, String(d.bits[i]), d.bits[i] ? C.accent : C.mid, !!d.bits[i]);
  { let s = '........';
    if (d.tick) { const pad = '        ', full = pad + d.tick.text + pad, i = Math.floor((now - d.tick.t) / 140);
      if (i > (full.length - 8) * 2) d.tick = null; else s = full.substr(i % (full.length - 8), 8); }
    bclr(26, 25, 8, 1); bput(26, 25, d.tick ? s : s.replace(/ /g, '.'), d.tick ? C.accent : C.dim, !!d.tick); }
  // the FUSE
  { const fc = d.blown ? C.danger : d.fuse ? C.money : C.dim;
    bput(24, 30, d.blown ? (Math.floor(now / 200) % 2 ? '><' : '  ') : ')(', fc, true); bput(24, 29, '||', fc); bput(24, 31, '||', fc);
    if (pw.fuse) { bclr(26, 30, 1, 1); bput(26, 30, deckHex(pw.fuse.left), pw.fuse.left ? C.money : C.mid, true); } }   // (the fuse's power left)
  if (!deckOpen(3)) bput(21, 33, 'mk III', C.dim);
  if (!deckOpen(4)) bput(25, 42, d.blown ? 'FUSE BLOWN' : 'mk IV', d.blown ? C.danger : C.dim);
  // the parts, then the sockets (on top, so their taps win)
  for (const p of DECK_PARTS) bhit(p.x, p.y, p.w, p.h, 'dkp_' + p.id, () => deckTapPart(p.id));
  if (!d.slots.PSU && pw.off.length) { const s = deckSock('PSU'); bbg(s.x, s.y, s.w, s.h, C.danger, 0.15 + 0.2 * (Math.sin(now / 300) + 1) / 2); }   // (no cell: the PSU is where the power goes missing)
  for (const s of DECK_SOCKETS) {
    deckSocket(s, s.x, s.y, bput, bbg, bclr, { sel: d.sel.kind === 'socket' && d.sel.id === s.id, pw, now });
    bhit(s.x, s.y, s.w, s.h, 'dks_' + s.id, () => deckTapSocket(s, bv));
  }
  // sparks: static around a chip that has no power (now and then), and a lot of it while one dies
  const ring = s => { const r = []; for (let x = s.x - 1; x <= s.x + s.w; x++) r.push([x, s.y - 1], [x, s.y + s.h]); for (let y = s.y; y < s.y + s.h; y++) r.push([s.x - 1, y], [s.x + s.w, y]); return r; };
  if (!under) {
    for (const id of pw.off) { const s = deckSock(id), r = ring(s), f = Math.floor(now / 110);
      if (hh(id.charCodeAt(2) + f, f) < 0.18) { const c = r[Math.floor(hh(f, id.charCodeAt(1)) * r.length)]; bput(c[0], c[1], pickR(["'", '*', '+', ','], Math.random), C.danger); } }
    if (fx && fx.kind === 'dead' && fxAge < 1400) { const s = deckSock(fx.sid), r = ring(s);
      for (let i = 0; i < 6; i++) { const c = r[Math.floor(Math.random() * r.length)]; bput(c[0], c[1], noiseCh(), Math.random() < 0.6 ? C.danger : C.bright, true); } }
  }
  // the burst, once, when the socket is on screen (confetti and tech blobs, more the rarer: none when effects are reduced)
  if (fx && !fx.burst && !under) {
    const s = deckSock(fx.sid);
    if (s && inView(s.y + 1)) {
      fx.burst = true;
      const x = pxX(ax + s.x + s.w / 2 - 0.5), y = pxY(sy(s.y + 1));
      if (fx.kind === 'in' && !reduced()) {
        const rc = rarityCol(DECK_CHIPS[d.slots[fx.sid]] ? DECK_CHIPS[d.slots[fx.sid]][2] : 'common'), n = [8, 14, 22, 34, 46][fx.lvl];
        const cells = []; for (let k = 0; k < n; k++) cells.push({ ch: pickR(['o', '*', '+', '0', '1', '#', '=', '.', '<', '>'], Math.random), x: x + rand(-1, 1) * L.cw, y, col: pickR([rc, tc, C.bright, rc, C.money], Math.random) });
        explode(cells, x, y + L.chh / 2, { power: 0.35 + 0.12 * fx.lvl, grav: 0.7, life: [0.5, 0.9 + 0.2 * fx.lvl] });
        if (fx.lvl >= 2) flash(rc, 0.06 + 0.03 * fx.lvl, 0.3);
        if (fx.lvl >= 3) shake(2 + fx.lvl, 0.3);
      } else if (fx.kind === 'dead') { flash(C.danger, 0.08, 0.3); shake(2, 0.25); }
    }
  }
  if (d.sel.kind === 'part') { const p = DECK_PARTS.find(q => q.id === d.sel.id); if (p) bbg(p.x, p.y, p.w, p.h, C.accent, 0.18); }
  if (pw.crewOff && pw.crewOff.length) { const p = DECK_PARTS.find(q => q.id === 'crew'); bbg(p.x, p.y, p.w, p.h, C.danger, 0.15 + 0.2 * (Math.sin(now / 300) + 1) / 2); }   // a CREW JACK with no power: red, glowing
  // the "more" rows; a drag or the wheel moves a row at a time
  g.clr(0, y0, L.wc, 1); g.clr(0, y0 + sa - 1, L.wc, 1);
  deckMore(ctx, g, 0, L.wc, y0, true, top > 0, () => { d.scroll = clamp(d.scroll - DECK_BOARD_STEP, 0, maxTop); }, 'dkup');
  deckMore(ctx, g, 0, L.wc, y0 + sa - 1, false, top < maxTop, () => { d.scroll = clamp(d.scroll + DECK_BOARD_STEP, 0, maxTop); }, 'dkdn');
  if (under) return;
  d.keyStep = null;
  st.scroll = dd => { d.scrollTo = null; const t = clamp(d.scroll + dd, 0, maxTop); if (t !== d.scroll) { d.scroll = t; Sound.tick(); } };
  g.flush();
}
function deckTapSocket(s, rows) {
  const d = DECK;
  if (d.carry) {
    if (deckFits(d.carry, s) && deckOpen(s.mk)) deckSlot(d.carry, s.id);
    else { Sound.deny(); deckSay(DECK_KITS.includes(d.carry) && s.g === 'boot' ? `${DECK_CHIPS[d.carry][0]} is a KIT: KITs go in ${DECK_KIT_SOCKET}.` : `${DECK_CHIPS[d.carry][0]} doesn't go in ${s.id}.`, C.danger); }
    return;
  }
  // the first tap: its card; the second: the picker (Greg, 2026-11-15)
  if (d.sel.kind === 'socket' && d.sel.id === s.id) return deckPick(s.id);
  deckSelect({ kind: 'socket', id: s.id }); Sound.tick();
}
function deckTapPart(id) {
  const d = DECK; d.carry = null;
  if (id === 'rom') id = 'cpu';   // the ROM is the CPU's: its posts and switches are in the CPU's popup
  if (id === 'cpu' && d.sel.kind === 'part' && d.sel.id === 'cpu') return deckCpuOpen();
  if (id === 'crew' && d.sel.kind === 'part' && d.sel.id === 'crew' && deckOpen(3)) return deckCrewOpen();   // (the second tap: its window)
  deckSelect(id === 'stick' ? { kind: 'socket', id: 'CRS' } : { kind: 'part', id }); Sound.tick();
}
function deckCpuOpen() { DECK.pick = null; DECK.cpu = { t0: performance.now() }; deckSelect({ kind: 'part', id: 'cpu' }); Sound.ui(); }

// the CHIPS tab: every chip you own, grouped (a chip is 2 rows, a dashed row between)
function deckChipList(ctx, y0, sa) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), W = L.wc, items = [];
  for (const gk of Object.keys(DECK_GROUPS)) {
    const ks = deckOwned().filter(k => DECK_CHIPS[k][1] === gk); if (!ks.length) continue;
    if (items.length) items.push({ h: 1, draw: () => {} });
    items.push({ h: 1, draw: (g, ctx, y) => { const n = DECK_GROUPS[gk][0]; g.put(1, y, `-- ${n} `, deckGroupCol(gk)); g.put(5 + n.length, y, rule(W - 7 - n.length), C.dim); } });
    ks.forEach((key, i) => {
      if (i) items.push(deckSep(0, W));
      items.push({ h: 2, stop: true, draw: (g, ctx, y) => {
        const c = DECK_CHIPS[key], where = deckSlotOf(key), off = !!(where && !pw.on.has(where) && c[1] !== 'psu'), id = 'dkc_' + key;
        if (d.sel.kind === 'chip' && d.sel.key === key) g.bg(0, y, W, 2, C.accent, 0.18);
        ctx.hl(0, y, W, 2, id, false);
        deckFace(g, 2, y, key, off);
        g.put(9, y, c[0], C.bright, true);   // (no counts: a chip home is unlocked, Greg 2026-11-21)
        if (deckBeta(key) && !where) g.put(W - 5, y, 'BETA', C.danger);   // (DECK_BETA: not all there yet)
        // slotted: inverted, so it stands out in the list (Greg, 2026-11-21: white with black text; red with no power)
        if (where) { const t = ' in ' + where + ' ', tx = W - 1 - t.length; g.bg(tx, y, t.length, 1, off ? C.danger : C.bright, 1); g.put(tx, y, t, C.bg, true); }
        g.put(9, y + 1, c[1] === 'psu' ? `+${deckCellPower(key)} PWR` : `PWR ${c[3]}`, C.mid);
        g.put(16, y + 1, c[6].slice(0, W - 17), C.text);
        if (off) { g.clr(W - 10, y + 1, 10); g.put(W - 9, y + 1, 'NO POWER', C.danger, true); }
        ctx.addHit(0, y, W, 2, { kind: 'btn', id, onTap: () => { deckSelect({ kind: 'chip', key }); Sound.tick(); } });
      } });
    });
  }
  const sc = deckRows(ctx, g, 0, W, y0, sa, items, d.list, 'dkl');
  st.scroll = sc.line; d.keyStep = sc.step;
  g.flush();
}

// The picker: a popup over the scroll area, a set height, like a store: the list (it scrolls), then the one you
// picked: its name, its power, its long text, and SLOT. A tap picks; SLOT puts it in and closes (Greg, 2026-11-15).
const DECK_PICK_INFO = 8;
const DECK_DOUBLE_MS = 450;   // two taps on a picker row this close: slot it   // the divider and 7 rows: name, power, 4 rows of text, the buttons
function deckPicker(ctx, y0, sa) {
  const d = DECK, p = d.pick, s = deckSock(p.id), g = deckGrid(ctx), pw = deckPower(), now = ctx.now;
  const W = Math.min(L.wc, DECK_ART_W), X0 = Math.floor((L.wc - W) / 2), gc = deckGroupCol(s.g), cur = d.slots[s.id];
  const IX = X0 + 1, IW = W - 2, H = sa, LR = Math.max(5, H - 3 - DECK_PICK_INFO);
  const done = () => { d.pick = null; };
  // the choices: NONE (or the glyphs), then what fits
  const keys = s.g === 'glyph' ? deckFavPool() : ['NONE'].concat(deckOwned().filter(k => deckFits(k, s)));
  if (s.g === 'glyph' && !keys.length) { d.pick = null; return; }   // (nothing seen yet)
  if (p.sel == null) p.sel = s.g === 'glyph' ? (keys.includes(d.glyph) ? d.glyph : keys[0]) : cur || keys[1] || 'NONE';
  const items = [], idx = {};
  keys.forEach((k, i) => {
    if (i) items.push(deckSep(IX, IW));
    idx[k] = items.length;
    items.push({ h: s.g === 'glyph' ? 3 : 2, stop: true, draw: (g, ctx, y) => deckPickRow(g, ctx, y, k, { IX, IW, s, cur, pw }) });
  });
  deckBox(ctx, g, y0, sa, X0, W, H, gc, `${s.id} · ${DECK_GROUPS[s.g][0]}${s.id === DECK_KIT_SOCKET ? ' · KIT' : ''}`, done);
  // a status line (the group's text for now; the header already shows your power). It gets the whole row: whatever
  // goes here later has to fit W - 4 (Greg, 2026-11-15)
  g.put(X0 + 2, y0 + 1, (s.g !== 'boot' ? DECK_GROUPS[s.g][2] : s.id === DECK_KIT_SOCKET ? 'KIT: one KIT, or any BOOT chip' : 'what a run starts with. KIT: BT1').slice(0, W - 4), C.dim);
  const sc = deckRows(ctx, g, IX, IW, y0 + 2, LR, items, p.s, 'dkpk');
  if (!p.shown) { sc.show(idx[p.sel]); p.shown = true; }
  st.scroll = sc.line; d.keyStep = null;
  const go = () => deckPickGo(p.sel, s, cur);
  p.keys = { go, move: dd => { const i = keys.indexOf(p.sel), j = clamp(i + dd, 0, keys.length - 1); if (j !== i) { p.sel = keys[j]; sc.show(idx[p.sel]); Sound.tick(); } } };
  // the one you picked
  const iy = y0 + 2 + LR;
  g.put(X0, iy, '|' + '-'.repeat(W - 2) + '|', gc);
  deckPickInfo(ctx, g, IX, IW, iy + 1, p, s, cur, pw, go);
  g.flush();
}
// A popup over the scroll area: the board, dim, around it; a box W wide and H tall at X0, y0 with the title on its
// top border and [X] at the right. Returns nothing; the caller fills rows y0 + 1 to y0 + H - 2.
function deckBox(ctx, g, y0, sa, X0, W, H, col, title, close) {
  deckBoard(ctx, y0, sa, g); g.dim = false;
  g.clr(X0, y0, W, H);
  g.put(X0, y0, '+' + '-'.repeat(W - 2) + '+', col);
  const t = ` ${title} `.slice(0, W - 8); g.clr(X0 + 2, y0, t.length); g.put(X0 + 2, y0, t, col, true);
  for (let j = 1; j < H - 1; j++) { g.put(X0, y0 + j, '|', col); g.put(X0 + W - 1, y0 + j, '|', col); }
  g.put(X0, y0 + H - 1, '+' + '-'.repeat(W - 2) + '+', col);
  deckBtn(ctx, g, X0 + W - 4, y0, '[X]', C.mid, 'dkbx', () => { close(); Sound.tick(); });
}
// a row in the picker's list
function deckPickRow(g, ctx, y, k, { IX, IW, s, cur, pw }) {
  const d = DECK, p = d.pick, h = s.g === 'glyph' ? 3 : 2, id = 'dkk_' + k;
  if (p.sel === k) g.bg(IX, y, IW, h, C.accent, 0.18);
  ctx.hl(IX, y, IW, h, id, false);
  // a tap picks it; a second tap on it soon after (a double tap / click) puts it in, like SLOT (Greg, 2026-11-15)
  ctx.addHit(IX, y, IW, h, { kind: 'btn', id, onTap: () => {
    const t = performance.now(), dbl = p.tap && p.tap.k === k && t - p.tap.t < DECK_DOUBLE_MS;
    p.tap = dbl ? null : { k, t };
    if (dbl) return deckPickGo(k, s, cur);
    if (p.sel !== k) { p.sel = k; Sound.tick(); }
  } });
  if (s.g === 'glyph') {
    deckFavArt(k).forEach((l, j) => g.put(IX + 1, y + j, l, C.bright, true));
    g.put(IX + 8, y, deckFavName(k), C.bright, true); if (k === d.glyph) g.put(IX + IW - 7, y, 'in GLY', C.accent);
    g.put(IX + 8, y + 1, (ART_GLYPHS[k].lore[0] || '').slice(0, IW - 9), C.mid);
    return;
  }
  if (k === 'NONE') {
    g.put(IX + 1, y, '- -', C.mid); g.put(IX + 1, y + 1, ' - ', C.mid);
    g.put(IX + 6, y, 'NONE', cur ? C.bright : C.mid, true); if (!cur) g.put(IX + IW - 6, y, 'empty', C.accent);
    g.put(IX + 6, y + 1, cur ? `pull ${DECK_CHIPS[cur][0]} out` : `leave ${s.id} empty`, C.mid);
    return;
  }
  const c = DECK_CHIPS[k], where = deckSlotOf(k), nx = IX + (c[1] === 'boss' ? 8 : 6), sh = deckPickShort(k, s, cur, pw);
  deckFace(g, IX + 1, y, k, false);
  g.put(nx, y, c[0], C.bright, true);
  if (where) g.put(IX + 19, y, 'in ' + where, where === s.id ? C.accent : C.mid);
  const pt = c[1] === 'psu' ? `+${deckCellPower(k)}` : `PWR ${c[3]}`; g.put(IX + IW - pt.length, y, pt, sh ? C.danger : C.money, sh > 0);
  g.put(nx, y + 1, c[6].slice(0, IX + IW - nx), C.text);
}
// how much power a chip would be short in this socket: what's left, plus what this socket's chip frees, plus its own
// if it's on somewhere else (0: it'd get power)
function deckPickShort(k, s, cur, pw) {
  const c = DECK_CHIPS[k], where = deckSlotOf(k);
  if (c[1] === 'psu' || where === s.id) return 0;
  const room = deckLeft(pw, s) + (cur && pw.on.has(s.id) ? DECK_CHIPS[cur][3] : 0) + (where && pw.on.has(where) ? c[3] : 0);
  return Math.max(0, c[3] - room);
}
function deckPickGo(k, s, cur) {
  const d = DECK; d.pick = null;
  if (s.g === 'glyph') { if (k !== d.glyph) { d.glyph = k; Sound.buy(); deckSay(`${deckFavName(k)} is your glyph.`); } return; }
  if (k === 'NONE') { if (cur) deckPull(s.id); else Sound.tick(); return; }
  if (deckSlotOf(k) !== s.id) deckSlot(k, s.id); else Sound.tick();
}
// the picked one: its name on its rarity chip, rarity and power, its long text (4 rows at most), the button
function deckPickInfo(ctx, g, IX, IW, y, p, s, cur, pw, go) {
  const d = DECK, k = p.sel, x = IX + 1, w = IW - 2, by = y + 6;
  const btn = (label, col, off) => deckBtn(ctx, g, x, by, label, col, 'dkgo', go, off);
  const text = t => wrapText(t, w).slice(0, 4).forEach((l, j) => g.put(x, y + 2 + j, l, C.text));
  if (s.g === 'glyph') {
    g.put(x, y, deckFavName(k), C.bright, true); g.put(x, y + 1, 'GLYPH · codex glyphs only', C.mid);
    // the bonus (the socket's, whichever glyph): [<] NAME [>] and what it does; the ones still to buy, on THE BOARD
    const fb = DECK_FAV_B[d.favB] || DECK_FAV_B.loot, lock = Object.keys(DECK_FAV_B).filter(b => !deckFavBOpen(b)).map(b => DECK_FAV_B[b][0]);
    g.put(x, y + 2, 'bonus', C.mid);
    deckBtn(ctx, g, x + 6, y + 2, '[<]', C.accent, 'dkfbL', () => deckFavStep(-1));
    deckBtn(ctx, g, x + 10, y + 2, fb[0].padEnd(9), C.rep, 'dkfb', () => deckFavStep(1));
    deckBtn(ctx, g, x + 20, y + 2, '[>]', C.accent, 'dkfbR', () => deckFavStep(1));
    wrapText(fb[2] + '.', w).slice(0, 2).forEach((l, j) => g.put(x, y + 3 + j, l, C.text));
    if (lock.length) g.put(x, y + 5, ('on THE BOARD: ' + lock.join(', ')).slice(0, w), C.dim);
    btn(k === d.glyph ? '[ IN GLY ]' : '[ PICK IT ]', C.accent, k === d.glyph);
    return;
  }
  if (k === 'NONE') {
    g.put(x, y, 'NONE', C.bright, true); g.put(x, y + 1, 'an empty socket', C.mid);
    text(cur ? `pull ${DECK_CHIPS[cur][0]} out of ${s.id}. it goes back in your chips.` : `leave ${s.id} empty.`);
    btn(cur ? `[ EMPTY ${s.id} ]` : '[ EMPTY ]', C.bright, !cur);
    return;
  }
  const c = DECK_CHIPS[k], ch = chipOf(c[2]), where = deckSlotOf(k), sh = deckPickShort(k, s, cur, pw);
  g.bg(x, y, c[0].length + 2, 1, ch.bg, 1); g.put(x + 1, y, c[0], ch.fg, true);
  const meta = `${c[2]} · ` + (c[1] === 'psu' ? `power ${deckCellPower(k)}` : `PWR ${c[3]}`) + (deckBeta(k) ? ' · BETA' : ''); g.put(x, y + 1, meta, C.mid);
  if (sh) g.put(x + meta.length + 1, y + 1, `· needs ${sh} more`, C.danger);
  text(c[4]);
  if (where === s.id) btn(`[ IN ${s.id} ]`, C.accent, true);
  else { const nx = btn(`[ ${where ? 'MOVE' : 'SLOT'} TO ${s.id} ]`, C.accent); if (where) g.put(nx, by, `from ${where}`, C.mid); }
}

// The CREW JACKS' window (Greg, 2026-11-22: a window, like the CPU's): your crew, a row each, then the one you picked:
// its boon and [ PLUG IN ] / [ UNPLUG ]. The jacks fill in order; power goes to the chips first, then the jacks.
function deckCrewOpen() { const d = DECK; d.cpu = null; d.carry = null; d.pick = { id: 'CREW', s: { top: 0 }, t0: performance.now() }; deckSelect({ kind: 'part', id: 'crew' }); Sound.ui(); }
function deckCrewPicker(ctx, y0, sa) {
  const d = DECK, p = d.pick, g = deckGrid(ctx), pw = deckPower();
  const W = Math.min(L.wc, DECK_ART_W), X0 = Math.floor((L.wc - W) / 2), IX = X0 + 1, IW = W - 2, LR = Math.max(5, sa - 3 - DECK_PICK_INFO);
  const keys = deckCrewPool(), max = deckJackMax(), inn = deckJacked();
  deckBox(ctx, g, y0, sa, X0, W, sa, C.text, 'CREW JACKS', () => { d.pick = null; });
  g.put(X0 + 2, y0 + 1, (inn.length + '/' + max + ' jacks · PWR 1 each, LVL 2: 2').slice(0, W - 4), C.dim);
  if (!keys.length) {
    wrapText('no crew yet. call crew in on your runs: after 5 calls one can join your crew (THE BOARD > REP). then plug them in here.', IW - 2).forEach((l, j) => g.put(IX + 1, y0 + 3 + j, l, C.mid));
    p.keys = null; g.flush(); return;
  }
  if (p.sel == null || !keys.includes(p.sel)) p.sel = inn[0] || keys[0];
  const items = [], idx = {};
  keys.forEach((k, i) => { if (i) items.push(deckSep(IX, IW)); idx[k] = items.length; items.push({ h: 2, stop: true, draw: (g, ctx, y) => deckCrewRow(g, ctx, y, k, inn, pw, IX, IW) }); });
  const sc = deckRows(ctx, g, IX, IW, y0 + 2, LR, items, p.s, 'dkcr');
  if (!p.shown) { sc.show(idx[p.sel]); p.shown = true; }
  st.scroll = sc.line; d.keyStep = null;
  const go = () => deckJackToggle(p.sel);
  p.keys = { go, move: dd => { const i = keys.indexOf(p.sel), j = clamp(i + dd, 0, keys.length - 1); if (j !== i) { p.sel = keys[j]; sc.show(idx[p.sel]); Sound.tick(); } } };
  const iy = y0 + 2 + LR;
  g.put(X0, iy, '|' + '-'.repeat(W - 2) + '|', C.text);
  // the one you picked: name, level and power, its boon (and what LVL 2 does), the button
  const k = p.sel, x = IX + 1, w = IW - 2, y = iy + 1, lv = deckCrewLv(k), on = inn.includes(k), dark = pw.crewOff.includes(k);
  g.put(x, y, HACKERS[k].name, hkInk(k), true);
  g.put(x, y + 1, 'LVL ' + lv + ' · PWR ' + lv + (on ? (dark ? ' · NO POWER' : ' · jacked in') : ''), dark ? C.danger : C.mid);
  const boon = wrapText(DECK_JACKS[k][lv - 1] + '.', w).slice(0, 2);
  boon.forEach((l, j) => g.put(x, y + 2 + j, l, C.text));
  if (lv < 2) wrapText('LVL 2: ' + DECK_JACKS[k][1] + '.', w).slice(0, 4 - boon.length).forEach((l, j) => g.put(x, y + 2 + boon.length + j, l, C.dim));
  deckBtn(ctx, g, x, y + 6, on ? '[ UNPLUG ]' : '[ PLUG IN ]', on ? C.bright : C.accent, 'dkgo', go);
  g.flush();
}
function deckCrewRow(g, ctx, y, k, inn, pw, IX, IW) {
  const d = DECK, p = d.pick, id = 'dkcr_' + k, lv = deckCrewLv(k), j = inn.indexOf(k);
  if (p.sel === k) g.bg(IX, y, IW, 2, C.accent, 0.18);
  ctx.hl(IX, y, IW, 2, id, false);
  ctx.addHit(IX, y, IW, 2, { kind: 'btn', id, onTap: () => {   // a tap picks; a double tap plugs in (or out), like the picker
    const t = performance.now(), dbl = p.tap && p.tap.k === k && t - p.tap.t < DECK_DOUBLE_MS;
    p.tap = dbl ? null : { k, t };
    if (dbl) return deckJackToggle(k);
    if (p.sel !== k) { p.sel = k; Sound.tick(); } } });
  g.put(IX + 1, y, j >= 0 ? '[' + (j + 1) + ']' : '[ ]', j >= 0 ? (pw.crewOff.includes(k) ? C.danger : C.accent) : C.dim, j >= 0);
  const dark = pw.crewOff.includes(k);   // (no power: red, and NO POWER blinks over its level)
  g.put(IX + 5, y, HACKERS[k].name, dark ? C.danger : hkInk(k), true);
  const r = dark && Math.floor(ctx.now / 500) % 2 ? 'NO POWER' : 'LVL ' + lv + ' · PWR ' + lv; g.put(IX + IW - r.length - 1, y, r, dark ? C.danger : C.mid, dark);
  g.put(IX + 5, y + 1, FX.ticker(DECK_JACKS[k][lv - 1], IW - 6, p.t0, ctx.now, 6), C.text);
}
function deckJackToggle(k) {
  const d = DECK, max = deckJackMax(), name = HACKERS[k].name;
  if (d.crew.has(k)) { d.crew.delete(k); Sound.tick(); return deckSay(name + ' unplugged.'); }
  if (deckJacked().length >= max) { Sound.deny(); return deckSay(max + ' jacks: unplug one first.', C.danger); }
  d.crew.add(k);
  if (deckPower().crewOff.includes(k)) { Sound.deny(); return deckSay('no power: ' + name + ' needs ' + deckCrewLv(k) + '.', C.danger); }
  Sound.buy(); deckSay(name + ' jacked in.');
}

// The CPU's popup (Greg, 2026-11-15): your deck at a glance (chips in, power), the mk ladder with the upgrade, the
// ROM (the BOARD posts you've bought, lit, and the switches), and a line of lore. A set height, like the picker.
function deckCpu(ctx, y0, sa) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), W = Math.min(L.wc, DECK_ART_W), X0 = Math.floor((L.wc - W) / 2);
  const x = X0 + 2, w = W - 4, close = () => { d.cpu = null; };
  deckBox(ctx, g, y0, sa, X0, W, sa, C.money, `CPU · ${deckName()}`, close);
  const gput = g.put; g.put = (px, py, t, col, bold) => gput(px, py, t.slice(0, Math.max(0, x + w - px)), col, bold);   // (clipped to the box)
  let y = y0 + 1;
  const sep = () => { g.put(X0 + 1, y++, rule(W - 2), C.dim); };
  const head = t => { g.put(x, y++, t, C.mid); };
  g.put(x, y++, `mk ${deckMk(d.mk)} · ${['', '', 'USER', 'ELITE', 'SYSOP'][d.mk]} access`, C.money);
  y++;
  // the deck at a glance
  const open = DECK_SOCKETS.filter(q => deckOpen(q.mk) && q.g !== 'glyph'), inn = open.filter(q => d.slots[q.id]).length;
  g.put(x, y, 'chips in', C.mid); g.put(x + 9, y, `${inn}/${open.length}`, C.bright, true);
  g.put(x + 15, y, 'pwr', C.mid); g.put(x + 19, y, `${pw.used}/${pw.budget}`, pw.off.length ? C.danger : C.money, true);
  if (pw.fuse) g.put(x + 25, y, `F${pw.fuse.used}/${pw.fuse.budget}`, C.money, true);
  else if (pw.off.length) g.put(x + 25, y, `!${pw.off.length}`, C.danger, true);
  y++;
  sep();
  // the mk ladder
  head('THE BOARDS');
  const rungs = [[2, 'USER', 'the top board'], [3, 'ELITE', 'GLYPH, OVERVOLT, crew'], [4, 'SYSOP', 'SUDO, BOSS, HEAT']];
  for (const [m, lv, what] of rungs) {
    const have = m <= d.mk, lit = deckOpen(m);
    g.put(x, y, (have ? '* ' : '. ') + 'mk ' + deckMk(m), have ? (lit ? C.money : C.danger) : C.dim, have);
    g.put(x + 10, y, what.slice(0, w - 10), have ? C.text : C.mid);
    y++;
    let bx = x + 10;
    // not at that access level on THE BOARD yet: it says so, loud, in place of the button (Greg, 2026-11-21)
    if (m === 3 && !have) { if (d.real && !deckPostOpen('deck3')) g.put(bx, y, 'reach ELITE first', C.danger, true); else deckBtn(ctx, g, bx, y, deckRepText('INSTALL', 'deck3'), deckRepCol('deck3'), 'dkmk3', deckUpgrade3, d.mk !== 2); }
    else if (m === 4 && !have) { if (d.mk < 3) g.put(bx, y, 'mk III, then the FUSE', C.dim); else if (d.real && !deckPostOpen('fuse')) g.put(bx, y, 'reach SYSOP first', C.danger, true); else deckBtn(ctx, g, bx, y, deckRepText('THE FUSE', 'fuse'), deckRepCol('fuse'), 'dkmk4', deckFuseIn); }
    else if (m === 4 && d.blown) g.put(bx, y, 'the FUSE is blown', C.danger);
    else g.put(bx, y, lv + ' access', C.dim);
    y++;
  }
  sep();
  // the ROM's switches: BOARD posts you can turn off for your next run (Greg, 2026-11-15: no list of the posts, you
  // can see them lit; the room goes to the switches, each with its text). NEMESIS cycles through the corps, or none.
  head('SETTINGS · for your next run');
  const sws = deckSwitches();
  if (!sws.length) { g.put(x, y++, 'none yet: STARTER POOL, STRAY and', C.dim); g.put(x, y++, 'NEMESIS (THE BOARD) can go here.', C.dim); }
  sws.forEach((k, i) => {
    const pk = DECK_PICKERS.includes(k), on = pk ? !!d[k] : d.sw.has(k), p = deckPost(k);
    g.put(x, y, p.name, on ? C.bright : C.mid, on);
    if (pk) {   // [<] CORP [>] / [<] MOD [>] (Greg, 2026-11-16: lots of corps; like THE BOARD's NEMESIS picker). The name steps forward too.
      const pool = k === 'nemesis' ? deckNemPool : deckArcPool, nameOf = v => k === 'nemesis' ? CORPS[v].name : MODS[v].name;
      const step = dd => { const cs = pool(); d[k] = cs[((cs.indexOf(d[k]) + dd) % cs.length + cs.length) % cs.length]; Sound.tick(); };
      const nw = Math.min(13, w - 9 - p.name.length), n = (d[k] ? nameOf(d[k]) : 'none').slice(0, nw), l = Math.floor((nw - n.length) / 2);
      const bx = x + w - (nw + 8);
      deckBtn(ctx, g, bx, y, '[<]', C.accent, 'dksw' + k + 'L', () => step(-1));
      deckBtn(ctx, g, bx + 4, y, (' '.repeat(l) + n).padEnd(nw), on ? C.accent : C.mid, 'dksw' + k, () => step(1));
      deckBtn(ctx, g, bx + nw + 5, y, '[>]', C.accent, 'dksw' + k + 'R', () => step(1));
    } else { const [ton, toff] = DECK_SWITCH_TEXT[k] || ['[on]', '[off]'], tt = on ? ton : toff;
      deckBtn(ctx, g, x + w - tt.length, y, tt, on ? C.accent : C.mid, 'dksw' + k, () => {
      if (d.sw.has(k)) d.sw.delete(k); else d.sw.add(k);
      Sound.tick(); }); }
    g.put(x, y + 1, FX.ticker(p.desc, w, d.cpu.t0 + i * 900, ctx.now, 6), on ? C.text : C.dim);
    y += 2;
  });
  // a line of lore, at the bottom
  const ly = y0 + sa - 2;
  if (ly > y) g.put(x, ly, 'MEDIX NC-1 · rev 2', C.dim);
  g.put = gput;
  g.flush();
}

// the card: the bar (the rule, a message, or NO POWER), then 4 rows about what you picked
function deckCard(ctx, y0) {
  const d = DECK, g = deckGrid(ctx), pw = deckPower(), now = ctx.now, W = L.wc;
  // the bar
  if (d.msg && now - d.msg.t < 2600) { g.put(0, y0, rule(W), C.dim); const s = ` ${d.msg.text} `.slice(0, W); g.clr(1, y0, s.length); g.put(1, y0, s, d.msg.col); }
  else if (d.carry) { g.put(0, y0, rule(W), C.dim); const s = ` slotting ${DECK_CHIPS[d.carry][0]}: tap a blinking socket `.slice(0, W); g.clr(1, y0, s.length); g.put(1, y0, s, C.accent); }
  else if (pw.off.length || pw.crewOff.length) {   // NO POWER: red, cycling through the chips (and CREW JACKS) that have none; a tap goes to the one showing
    const psu = () => { const s = deckSock('PSU'); d.view = 'board'; d.pick = null; deckSelect({ kind: 'socket', id: 'PSU' }); deckShow(s.y, s.h, deckViewRows()); };
    const offs = !d.slots.PSU && pw.off.length ? [{ text: 'NO POWER: slot a cell in PSU', go: psu }] : pw.off.map(id => ({ text: `NO POWER: ${DECK_CHIPS[d.slots[id]][0]} in ${id}`, go: () => { const s = deckSock(id); d.view = 'board'; deckSelect({ kind: 'socket', id }); deckShow(s.y, s.h, deckViewRows()); } }))
      .concat(pw.crewOff.map(c => ({ text: `NO POWER: ${HACKERS[c].name} in a jack`, go: () => { d.view = 'board'; deckCrewOpen(); d.pick.sel = c; } })));   // (Greg, 2026-11-22: it opens the jacks)
    const sw = FX.swapLines(offs.map(o => o.text), W - 2, 0, now, 1800);
    g.bg(0, y0, W, 1, st.hoverBtn === 'dkbar' ? C.accent : C.danger, 1); g.put(1, y0, sw.text, C.bg, true);
    if (!d.pick && !d.cpu) ctx.addHit(0, y0, W, 1, { kind: 'btn', id: 'dkbar', onTap: () => {   // (each tap: the next one, Greg 2026-11-16)
      d.offI = d.offI == null || d.offI >= offs.length - 1 ? 0 : d.offI + 1;
      offs[d.offI].go(); Sound.tick(); } });
  } else g.put(0, y0, rule(W), C.dim);
  // the picker is up: the card waits under it (dim), and a tap on it closes the picker
  if (d.pick || d.cpu) { g.dim = true; ctx.addHit(0, y0 + 1, W, 4, { kind: 'btn', id: 'dkcard', onTap: () => { d.pick = null; d.cpu = null; Sound.tick(); } }); }
  const y = y0 + 1, tw = (x) => W - x - 1, tick = (x, text, col = C.text) => g.put(x, y + 2, FX.ticker(text, tw(x), d.selT, now, 6), col);
  const btns = (list, bx = 1) => { for (const [label, col, id, fn, off] of list) bx = deckBtn(ctx, g, bx, y + 3, label, col, id, fn, off); };
  const frame = (s, key) => deckSocket(s, 1, y, g.put, g.bg, g.clr, { key, pw, now });
  const sel = d.sel;
  const chipRows = (key, sid) => {   // the group and power (dim); the name on its rarity chip; the short text (a ticker)
    const c = DECK_CHIPS[key], x = c[1] === 'boss' ? 10 : 8, off = !!(sid && !pw.on.has(sid) && c[1] !== 'psu'), ch = off ? DECK_OFF : chipOf(c[2]);
    const meta = `${DECK_GROUPS[c[1]][0]} · ${deckBeta(key) ? 'BETA · ' : ''}`; g.put(x, y, meta, C.mid);
    g.put(x + meta.length, y, c[1] === 'psu' ? `power ${deckCellPower(key)}` : `PWR ${c[3]}`, off ? C.danger : C.mid);
    if (off && Math.floor(now / 500) % 2) g.put(W - 9, y, 'NO POWER', C.danger, true);
    g.bg(x, y + 1, c[0].length + 2, 1, ch.bg, 1); g.put(x + 1, y + 1, c[0], ch.fg, true);
    tick(x + 1, key === 'SP3' ? 'bosses: ' + DECK_SPOILS[d.spoils][2] : key === 'AR1' ? 'every run starts with: ' + (d.archive ? MODS[d.archive].name : 'nothing yet. pick a mod.') : sid && deckShellPending(deckSock(sid)) ? 'no shell yet: get ROOT on your crew (THE BOARD > QUESTS).' : c[6]);
    return x;
  };
  if (sel.kind === 'chip') {
    const where = deckSlotOf(sel.key), c = DECK_CHIPS[sel.key];
    frame(where ? deckSock(where) : { id: '---', g: c[1], mk: 2, w: c[1] === 'boss' ? 7 : 5, h: 4 }, sel.key);
    chipRows(sel.key, where);
    // VIEW: the board, scrolled to its socket (Greg, 2026-11-21)
    const view = () => { const s = deckSock(where); d.view = 'board'; d.pick = null; d.carry = null; deckSelect({ kind: 'socket', id: where }); deckShow(s.y, s.h, deckViewRows()); Sound.tick(); };
    btns([['[ SLOT ]', C.accent, 'dkslot', () => deckCarry(sel.key)], ...(where ? [['[ PULL ]', C.bright, 'dkpull', () => deckPull(where)], ['[ VIEW ]', C.bright, 'dkview', view]] : [])], c[1] === 'boss' ? 10 : 8);
  } else if (sel.kind === 'socket') {
    const s = deckSock(sel.id), key = d.slots[s.id], open = deckOpen(s.mk), [gn, , gt] = DECK_GROUPS[s.g], gc = deckGroupCol(s.g);
    if (s.g === 'glyph') {
      const fb = DECK_FAV_B[d.favB] || DECK_FAV_B.loot;
      if (open) deckFavArt(d.glyph).forEach((l, j) => g.put(1, y + j, l, C.bright, true)); else g.put(1, y + 1, ':mk3:', C.mid);
      g.put(8, y, 'GLYPH · your favourite', C.mid); g.put(9, y + 1, open ? deckFavName(d.glyph) : 'GLY · LOCKED', open ? C.bright : C.mid, true);
      tick(9, open ? (d.glyph == null ? 'pick one of the glyphs you have seen. ' : '') + fb[0] + ': ' + fb[2] + '. (only in corps that show the codex glyphs.)' : 'opens with mk III: the CPU upgrade, an ELITE post on THE BOARD.');
      btns(open ? [['[ CHANGE ]', C.accent, 'dkchg', () => deckPick('GLY')], ['[ ' + fb[0] + ' > ]', C.rep, 'dkfbc', () => deckFavStep(1)]] : d.mk < 3 ? [[deckRepText('mk III', 'deck3'), deckRepCol('deck3'), 'dkmk3', deckUpgrade3]] : [], 8);
    } else if (!open) {
      frame(s);
      g.put(8, y, gn, C.mid); g.put(9, y + 1, `${s.id} · LOCKED`, C.mid, true);
      tick(9, s.mk === 3 ? 'opens with mk III: the CPU upgrade, an ELITE post on THE BOARD.' : d.blown ? 'the FUSE is blown. replace it to light mk IV again.' : 'opens with mk IV: the FUSE, a SYSOP post on THE BOARD.');
      if (s.mk === 3 && d.mk < 3 && d.real && !deckPostOpen('deck3')) g.put(1, y + 3, 'reach ELITE on THE BOARD first.', C.danger, true);
      else btns(s.mk === 3 && d.mk < 3 ? [[deckRepText('mk III', 'deck3'), deckRepCol('deck3'), 'dkmk3', deckUpgrade3]] : s.mk === 4 ? [[d.blown ? '[ REPLACE FUSE ]' : '[ SEE THE FUSE ]', C.rep, 'dkfuse', () => deckTapPart('fuse')]] : [], s.w + 3);
    } else if (key) {
      frame(s); chipRows(key, s.id);
      btns([['[ CHANGE ]', C.accent, 'dkchg', () => deckPick(s.id)], ...(key === 'SP3' ? [[`[ ${DECK_SPOILS[d.spoils][0]} > ]`, C.money, 'dkspl', () => { d.spoils = (d.spoils + 1) % 3; Sound.tick(); }]] : []),
        ...(key === 'AR1' ? [[`[ ${(d.archive ? MODS[d.archive].name : 'PICK').slice(0, 11)} > ]`, C.accent, 'dkarc', deckArcStep]] : [])], s.w + 3);
    } else {
      frame(s);
      const n = deckOwned().filter(k => deckFits(k, s)).length;
      const pend = deckShellPending(s);   // (ROOT's: its fine print, a line at a time)
      g.put(8, y, `${gn} · ${n} fit`, C.mid); g.put(9, y + 1, `${s.id} · ${pend ? 'LEASED' : 'EMPTY'}`, pend ? C.rep : C.bright, true);
      tick(9, pend ? QUEST_LINES.rootFine.join('   ') + '   (ROOT: PAPERWORK, THE BOARD > QUESTS)' : s.g !== 'boot' ? gt + '.'
        : s.id === DECK_KIT_SOCKET ? 'the KIT socket: one KIT (a bundle of mods and gear), or any other BOOT chip.' : gt + '. any BOOT chip but a KIT (those go in ' + DECK_KIT_SOCKET + ').');   // (KITs: DECK_KITS)
      btns([['[ CHOOSE ]', C.accent, 'dkchg', () => deckPick(s.id)]], s.w + 3);
    }
  } else if (sel.kind === 'part') deckPartCard(ctx, g, y, sel.id, pw, tick, btns);
  g.flush();
}
function deckPartCard(ctx, g, y, id, pw, tick, btns) {
  const d = DECK, head = (t, sub, subc) => { g.put(1, y, t, C.bright, true); g.put(1, y + 1, sub, subc); };
  if (id === 'cpu') {
    const n = deckName(), open = DECK_SOCKETS.filter(s => deckOpen(s.mk)).length;
    head(`CPU · ${n}`, `mk ${deckMk(d.mk)} · ${['', '', 'USER', 'ELITE', 'SYSOP'][d.mk]}`, C.money);
    tick(1, `your name, printed on your deck. ${open} sockets open, ${Object.keys(d.slots).length} chips in, power ${pw.used} of ${pw.budget}.`);
    btns([['[ OPEN ]', C.accent, 'dkcpu', deckCpuOpen]]);   // (the name comes from your profile: no button here)
  } else if (id === 'byte') {
    g.put(1, y, 'THE BYTE · secret codes', C.bright, true);
    for (let i = 0; i < 8; i++) { const x = 1 + i * 3, on = d.bits[i]; g.put(x, y + 1, `[${on}]`, on ? C.accent : C.text, !!on); ctx.hl(x, y + 1, 3, 1, 'dkbit' + i, false); ctx.addHit(x, y + 1, 3, 1, { kind: 'btn', id: 'dkbit' + i, onTap: () => { d.bits[i] ^= 1; Sound.tick(); } }); }
    g.put(26, y + 1, '0x' + parseInt(d.bits.join(''), 2).toString(16).toUpperCase().padStart(2, '0'), C.mid);
    // (the 0s in text white, not mid: Greg, so they read as switches)
    tick(1, '8 switches. most codes do nothing. the hints are around the game: logos, posts, G0D, the codex.', C.mid);
    btns([['[ ENTER ]', C.accent, 'dkenter', deckEnterByte], ['[ CLEAR ]', C.mid, 'dkclear', () => { d.bits.fill(0); Sound.tick(); }]]);
  } else if (id === 'fuse') {
    head('THE FUSE · mk IV power', d.blown ? 'BLOWN' : d.fuse ? `installed · ${pw.fuse.used} of ${pw.fuse.budget} used` : `not installed · power ${DECK_FUSE_PWR}`, d.blown ? C.danger : d.fuse ? C.money : C.mid);
    tick(1, d.blown ? 'a rival breached your deck and blew it. mk IV is dark until you replace it.' : d.fuse ? 'mk IV is lit. a boss that breaches your deck goes for it (the TEST shows it).' : 'its own power for the bottom board: SUDO and BOSS chips run on it, not the cell. a SYSOP post, after mk III.');
    if (!d.fuse) btns([[`[ INSTALL · ${deckCost('fuse')} REP ]`, C.rep, 'dkinst', deckFuseIn]]);
    else if (!d.blown && !d.real) btns([['[ TEST: BREACH ]', C.danger, 'dkbreach', () => { d.blown = true; Sound.deny(); deckSay('BREACH: a rival blew your fuse.', C.danger); d.tick = { text: 'FUSE BLOWN. mk IV dark.', t: performance.now() }; }]]);
    else if (d.blown) btns([['[ REPLACE · 100 REP ]', C.rep, 'dkrepl', () => deckBuy(null, 100, () => { d.blown = false; Sound.buy(); deckSay('new fuse. mk IV lit again.'); })]]);
  } else if (id === 'readout') {
    head('READOUT', `cell: ${pw.left} left · ${pw.used} of ${pw.budget} used`, C.money);
    tick(1, 'the cell in PSU powers mk II and III; the FUSE powers mk IV. each chip costs 0-3, shown on its socket. the oldest chips get power first.');
  } else if (id === 'ports') {
    // (Greg, 2026-11-22: cryptic. What goes here is in docs/DECK.md PORTS, for later)
    head('PORTS', FX.swapLines(['no peripherals found...', 'searching...'], L.wc - 2, d.selT, ctx.now, 1800).text, C.mid);
  } else if (id === 'crew') {
    const open = deckOpen(3), inn = open ? deckJacked() : [];
    head('CREW JACKS' + (open ? '' : ' · LOCKED'), open ? inn.length + '/' + deckJackMax() + ' plugged in · their boons, every run' : 'opens with mk III', open ? C.text : C.mid);
    tick(1, !open ? 'the mk III board has the jacks.' : inn.length ? inn.map(c => HACKERS[c].name + ': ' + DECK_JACKS[c][deckCrewLv(c) - 1] + (pw.crewOff.includes(c) ? ' (NO POWER)' : '') + '.').join('   ')
      : deckCrewPool().length ? 'nobody plugged in. OPEN to plug in your crew.' : 'no crew yet: call crew in on your runs. after 5 calls one can join (THE BOARD > REP).');
    if (open) btns([['[ OPEN ]', C.accent, 'dkcrewo', deckCrewOpen]]);
  } else if (id === 'uplink') {
    head('UPLINK' + (deckOpen(4) ? '' : ' · LOCKED'), deckOpen(4) ? 'empty' : 'opens with mk IV', deckOpen(4) ? C.text : C.mid);
    tick(1, 'G0D.exe plugs in here: it plays for you, with its click limit. a second jack doubles the clicks.');
  } else if (id === 'hdr3' || id === 'hdr4') {
    const m = id === 'hdr3' ? 3 : 4;
    head(`EXPANSION · mk ${deckMk(m)}`, deckOpen(m) ? 'plugged in' : 'empty', deckOpen(m) ? C.money : C.mid);
    tick(1, m === 3 ? 'the mk III board plugs in here. the CPU upgrade: 600 REP (ELITE).' : 'the mk IV board plugs in here. it needs the FUSE for power.');
    if (m === 3 && d.mk < 3) btns([['[ mk III · ' + deckCost('deck3') + ' REP ]', C.rep, 'dkmk3', deckUpgrade3]]);
  }
}
// The upgrades are THE BOARD's posts (engine/save.js LEGACY: DECK mk III, THE FUSE): the real deck buys them there
// (buyPost), at those prices; the dev deck pays its own REP. key null: not a post (replacing a blown fuse: REP only).
const deckCost = key => { const u = typeof LEGACY !== 'undefined' && LEGACY.find(p => p.key === key); return u ? u.costs[0] : '?'; };
// A button that costs REP shows what you have against it, dimmed while you're short (Greg, 2026-11-21: REP left the
// deck's top line). It still takes a tap: deckBuy says what's missing.
// a deck post you can buy at your access level on THE BOARD (engine/save.js postOpen)
const deckPostOpen = key => postOpen(LEGACY.find(p => p.key === key));
const deckRepText = (what, key) => `[ ${what} · ${DECK.rep}/${deckCost(key)} REP ]`;
const deckRepCol = key => DECK.rep >= deckCost(key) ? C.rep : C.mid;
function deckBuy(key, cost, done) {
  const d = DECK;
  if (d.real && key) {
    const why = buyPost(LEGACY.find(p => p.key === key));
    if (why) { Sound.deny(); return deckSay(why, C.danger); }
    d.mk = deckMkNow(); d.fuse = legacyLv('fuse') > 0;
    return done();
  }
  if (d.real) { if ((save.rep || 0) < cost) { Sound.deny(); return deckSay('not enough REP.', C.danger); } save.rep -= cost; persist(); return done(); }
  if (d.rep < cost) { Sound.deny(); return deckSay('not enough REP.', C.danger); }
  d.rep -= cost; done();
}
function deckUpgrade3() { deckBuy('deck3', deckCost('deck3'), () => { const d = DECK; d.mk = Math.max(d.mk, 3); deckUpShow(3); }); }
// the upgrade fanfare (deckBoard: d.up). seenMk: the mk it last played for, so buying one on THE BOARD plays it the first
// time you open your deck after.
function deckUpShow(mk, delay = 0) { const d = DECK; d.cpu = null; d.pick = null; d.view = 'board'; d.up = { mk, t0: performance.now() + delay }; d.seenMk = Math.max(d.seenMk || 2, mk); }
function deckFuseIn() {
  const d = DECK;
  if (d.mk < 3) { Sound.deny(); return deckSay('mk III first.', C.danger); }
  deckBuy('fuse', deckCost('fuse'), () => { d.fuse = true; d.mk = 4; deckUpShow(4); });
}
function deckEnterByte() {
  const d = DECK, code = d.bits.join('');
  d.tick = { text: DECK_CODES[code] || 'NO CARRIER', t: performance.now() };
  Sound.ui();
  deckShow(22, 4, deckViewRows());   // the ticker answers on the board: bring it into view
  if (code === '01111111') setTimeout(() => d.bits.fill(0), 900);
  if (code === '00001111') {   // OVERCLOCK: the cell at F, and it stays on (saved) until you enter it again
    d.overclock = !d.overclock; Sound.buy();
    if (!d.overclock) d.tick = { text: '0x0F: OVERCLOCK off. your cell runs at its own power.', t: performance.now() };
  }
}
