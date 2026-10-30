// NeoN+1 engine/g0d.js: G0D previews for the editor's G0D tab (tools/neon_editor.html). Nothing here runs in play:
// only the editor sets st.g0d. The fight designs are mockups (docs/QUESTS.md, "G0D's fights"), drawn over a real
// screen so they can be judged in the game: a corp layer, the sector map, the win screen, the death screen.
//
// The designs draw on a 44 x 22 sketch grid (the size of the mockup pages) and land on the board, squeezed to fit:
// each string keeps its letters, only where it starts is scaled. The sketch's top row is G0D's boss bar and its
// bottom row the line that says what's going on.
'use strict';
NEON_FILES.push(['engine/g0d.js', 'v13.84']);

const G0D_LOOKS = (() => {
  const W = 44, H = 22;
  let SX = 1, SY = 1, GW = W, GH = H;
  const hs = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const sm = x => x * x * (3 - 2 * x);
  const mkGrid = (w, h, sx, sy) => {
    const ch = [], co = [];
    for (let y = 0; y < h; y++) { ch.push(Array(w).fill(' ')); co.push(Array(w).fill('text')); }
    const raw = (x, y, s, c) => {
      if (y < 0 || y >= h) return;
      for (let i = 0; i < s.length; i++) { const xx = x + i; if (xx < 0 || xx >= w || s[i] === '\0') continue; ch[y][xx] = s[i]; co[y][xx] = c; }
    };
    return { ch, co, w, h, raw, put(x, y, s, c) { raw(Math.round(x * sx), Math.round(y * sy), s, c); } };
  };
  const grid = () => mkGrid(GW, GH, SX, SY);   // the board, squeezed
  const rawGrid = () => mkGrid(W, H, 1, 1);    // a sketch-size scratch grid
  const NODE = { n: ['[ ]', 'accent'], ice: ['[!]', 'danger'], x: ['[x]', 'dim'], hot: ['[ ]', 'bright'], real: ['[*]', 'money'],
    mold: ['[%]', 'mold'], crust: ['{%}', 'mold'], scrape: ['{,}', 'moldDim'] };
  const node = (g, x, y, k = 'n') => g.put(x - 1, y, NODE[k][0], NODE[k][1]);
  // The line at the bottom. (G0D's bar is its own overlay: THE HEALTH BAR, below. hp is the mockups' number, unused.)
  function hud(g, hp, msg, mc = 'mid') {
    g.raw(0, g.h - 1, ' '.repeat(g.w), 'mid'); g.raw(Math.max(0, Math.floor((g.w - msg.length) / 2)), g.h - 1, msg.slice(0, g.w), mc);
  }
  function oval(g, cx, cy, a, b, colAt, flat = '~') {
    const seen = new Set();
    for (let i = 0; i < 480; i++) {
      const th = i / 480 * Math.PI * 2, x = Math.round(cx + a * Math.cos(th)), y = Math.round(cy + b * Math.sin(th));
      const key = x + ',' + y; if (seen.has(key)) continue; seen.add(key);
      const dx = -a * Math.sin(th), dy = b * Math.cos(th), s = Math.abs(dx) < 1e-6 ? 99 : dy / dx;
      const c = Math.abs(s) < 0.35 ? flat : Math.abs(s) > 2.2 ? '|' : s > 0 ? '\\' : '/';
      g.put(x, y, c, colAt(x, y));
    }
  }
  const MOLD = '%%&&##**;;::,. ';
  function moldCh(x, y, t) {
    const v = hs(x * 12.9 + y * 78.2), w = hs(x * 3.1 + y * 5.7 + Math.floor(t / 8 + v * 8) * 0.37);
    const i = Math.min(MOLD.length - 1, Math.floor(v * MOLD.length) + (w > 0.9 ? 1 : 0));
    return [MOLD[i], v > 0.5 ? 'mold' : 'moldDim'];
  }
  const moldAt = (g, x, y, t) => { const [c, k] = moldCh(x, y, t); g.put(x, y, c, k); };

  // ---------------- The first page of mockups ----------------
  // 1. THE FACE
  function face(g, t) {
    const ex = Math.floor(t / 22) % 4, names = ['STARE', 'BLINK: the nodes shuffle', 'GRIN: the mouth is ICE', 'FROWN: it speeds up'];
    oval(g, 22, 10.5, 18, 8.5, () => 'bright');
    // brows and eyes
    if (ex === 3) { g.put(10, 5, '\\__', 'bright'); g.put(32, 5, '__/', 'bright'); } else { g.put(10, 5, '___', 'mid'); g.put(31, 5, '___', 'mid'); }
    if (ex === 1) { g.put(9, 7, '( --- )', 'bright'); g.put(28, 7, '( --- )', 'bright'); }
    else { g.put(9, 7, '(     )', 'bright'); g.put(28, 7, '(     )', 'bright'); node(g, 12, 7, ex === 0 ? 'hot' : 'n'); node(g, 31, 7); }
    // nose, cheeks, forehead
    g.put(21, 9, '/\\', 'mid'); g.put(20, 10, '/__\\', 'mid');
    const sh = ex === 1 ? 4 : 0;
    node(g, 8 + sh, 11); node(g, 36 - sh, 11); node(g, 18, 3, 'x'); node(g, 26, 3);
    // mouth
    const mk = ex === 2 ? 'ice' : 'n';
    for (let i = 0; i < 5; i++) node(g, 14 + ((i * 4 + sh * 2) % 20), 14, mk);
    if (ex === 2) { g.put(11, 13, '\\', 'bright'); g.put(32, 13, '/', 'bright'); g.put(12, 15, '`------------------´', 'bright'); }
    else if (ex === 3) { g.put(11, 13, '.------------------.', 'bright'); g.put(11, 15, '/', 'bright'); g.put(30, 15, '\\', 'bright'); }
    else g.put(12, 15, '--------------------', 'mid');
    // the crack from the broken node, and the patch cursor crawling up it
    const crack = [[19, 4], [20, 5], [20, 6], [21, 7], [22, 8]], k = Math.floor(t / 5) % (crack.length + 3);
    crack.forEach(([x, y], i) => g.put(x, y, i < k ? '=' : '/', i < k ? 'mid' : 'danger'));
    if (k < crack.length) g.put(crack[k][0], crack[k][1], '▌', 'money');
    // the chin spills
    [[19, 3], [23, 2], [26, 3]].forEach(([x, n], i) => { const l = 1 + (Math.floor(t / 6) + i * 2) % n; for (let j = 0; j < l; j++) g.put(x, 19 + j, j === l - 1 ? '.' : ':', 'mold'); });
    hud(g, 7, names[ex], ex === 2 ? 'danger' : ex === 0 ? 'mid' : 'bright');
  }

  // 2. THE EYE
  function eye(g, t) {
    const cy = 10.5, nodes = [[9, 10], [15, 6], [29, 6], [35, 10], [15, 15], [29, 15]];
    const f = t % 34, blink = f >= 30, k = blink ? (f - 30) / 4 : 0, lid = blink ? 0.12 + Math.abs(k - 0.5) * 0.5 : 1;
    const tgt = nodes[Math.floor(t / 34) % 6], mv = Math.min(1, f / 10);
    const px = 22 + (tgt[0] - 22) * 0.55 * mv, py = cy + (tgt[1] - cy) * 0.5 * mv;
    const half = x => { const u = (x - 22) / 20; return Math.max(0, 8 * (1 - u * u)) * lid; };
    for (let x = 2; x <= 42; x++) {
      const h = half(x), top = Math.round(cy - h), bot = Math.round(cy + h);
      for (let y = top + 1; y < bot; y++) {
        const d = Math.hypot((x - px) / 2, y - py);
        if (d < 1.3) g.put(x, y, '@', 'danger');
        else if (d < 4.2) g.put(x, y, '.:+*'[Math.floor(Math.atan2(y - py, x - px) * 3 + d) & 3], 'rep');
        else if (hs(x * 13 + y) > 0.93 || (Math.abs(x - 22) > 13 && hs(x + y * 41) > 0.6)) g.put(x, y, '~', 'dd');
      }
      const sl = h2 => { const a = cy - half(x - .5), b = cy - half(x + .5), s = b - a; return Math.abs(s) < .35 ? '-' : s < 0 ? '/' : '\\'; };
      g.put(x, top, blink ? '=' : sl(), 'bright');
      if (!blink) { const s0 = (cy + half(x + .5)) - (cy + half(x - .5)); g.put(x, bot, Math.abs(s0) < .35 ? '-' : s0 < 0 ? '/' : '\\', 'bright'); }
      if (!blink && x % 3 === 0 && h > 1) g.put(x, top - 1, "'", 'mid');
    }
    if (!blink) nodes.forEach(n => node(g, n[0], n[1], n === tgt && mv === 1 ? 'hot' : 'n'));
    hud(g, 6, blink ? 'BLINK: the nodes shuffle' : 'it looks at one node. guard or bait?', blink ? 'bright' : 'mid');
  }

  // 3. THE MOUTH
  function mouth(g, t) {
    const f = t % 52, bite = f >= 44, gap = bite ? 1 : 9 - Math.floor(f / 44 * 8);
    g.put(10, 2, '(@)', 'danger'); g.put(31, 2, '(@)', 'danger');
    g.put(3, 4, '_'.repeat(38), 'mid');
    for (let i = 0; i < 8; i++) {
      const x = 6 + i * 4.5;
      node(g, x, 5, i === 2 ? 'x' : bite ? 'ice' : 'n'); if (i !== 2) g.put(x, 6, 'V', 'bright');
    }
    const ly = 6 + gap;
    for (let y = 7; y < ly; y++) for (let x = 5; x < 39; x++) if (hs(x * 7 + y * 29) > 0.86) g.put(x, y, '.', 'dd');
    if (gap > 4) g.put(19, Math.round((7 + ly) / 2), 'G 0 D', 'dd');
    for (let i = 0; i < 8; i++) {
      const jit = i === 5 && f % 8 < 2 ? 1 : 0, x = 6 + i * 4.5 + jit;
      if (i !== 6) g.put(x, ly, '^', 'bright');
      node(g, x, ly + 1, i === 6 ? 'x' : bite ? 'ice' : 'n');
    }
    g.put(3, ly + 2, '‾'.repeat(38), 'mid');
    for (let j = 0; j < 3; j++) { const x = 12 + j * 9, l = (Math.floor(t / 5) + j) % 3; for (let k = 0; k < l; k++) g.put(x, ly + 3 + k, ':', 'mold'); }
    const left = bite ? 0 : 8 - Math.floor(f / 44 * 8);
    hud(g, 5, bite ? 'BITE! -1 INT' : 'pick before it bites', bite ? 'danger' : 'mid');
    g.put(W - 13, H - 1, 'BITE ' + '▓'.repeat(left) + '░'.repeat(8 - left), bite ? 'danger' : 'money');
  }

  // 4. THE SPILL
  const LOGO = ['  ####    #####    ####  ', ' #       #(@)#    #   # ', ' #  ###  #   #    #   # ', ' #    #  #(@)#    #   # ', '  ####    #####    ####  '];
  function spill(g, t) {
    LOGO.forEach((l, y) => { for (let x = 0; x < l.length; x++) { const c = l[x]; if (c === ' ') continue;
      const rot = hs(x * 17 + y * 3 + Math.floor(t / 3) * 0.01) > 0.9 && y > 2;
      g.put(9 + x, 2 + y, rot ? '%&;'[x % 3] : c, '()@'.includes(c) ? 'danger' : rot ? 'mold' : 'bright'); } });
    const pc = Math.floor(t / 2) % 30; if (pc < 24) g.put(9 + pc, 7, '▌', 'money');
    const xs = [8, 12, 16, 21, 26, 30, 35];
    xs.forEach((x, i) => {
      const sp = 0.12 + hs(i) * 0.22, y = 8 + Math.floor((t * sp + hs(i + 9) * 11) % 11);
      for (let yy = 8; yy < y; yy++) g.put(x, yy, yy % 2 ? ':' : '.', i === 4 ? 'moldDim' : 'mold');
      node(g, x, y, i === 1 && y > 14 ? 'ice' : 'n');
    });
    g.put(0, 19, '_'.repeat(W), 'mid');
    for (let x = 0; x < W; x++) if (hs(x * 3 + 1) > 0.75) g.put(x, 20, '~', 'moldDim');
    hud(g, 4, 'tap real drips before they land');
  }

  // 5. THE CONGREGATION
  const EXPR = [{ e: 'o  o', m: ' __ ' }, { e: '-  -', m: ' __ ' }, { e: '>  <', m: '\\__/' }, { e: 'O  O', m: ' /\\ ' }];
  const CORP = ['accent', 'money', 'rep', 'mold', 'text', 'danger'];
  function congregation(g, t) {
    const k = Math.floor(t / 12) % 4, odd = Math.floor(hs(Math.floor(t / 48)) * 12);
    for (let i = 0; i < 12; i++) {
      const c = i % 4, r = Math.floor(i / 4), x = 3 + c * 10, y = 3 + r * 6, col = CORP[(i * 5) % 6];
      if (i === 0 || i === 9) {
        for (let yy = 0; yy < 4; yy++) { let s = ''; for (let xx = 0; xx < 8; xx++) s += '#%&*=. '[Math.floor(hs(t * 31 + i * 7 + yy * 11 + xx) * 7)]; g.put(x, y + yy, s, 'dim'); }
        continue;
      }
      const e = EXPR[i === odd ? (k + 3) % 4 : k];
      g.put(x, y, '.------.', col); g.put(x, y + 1, '| ' + e.e + ' |', col); g.put(x, y + 2, '| ' + e.m + ' |', col); g.put(x, y + 3, "'------'", col);
    }
    hud(g, 6, 'one face is a beat late');
  }

  // 6. THE MIRROR
  function mirror(g, t) {
    const seam = 20 + Math.floor(Math.sin(t / 40) * 0.5);
    oval(g, 22, 10.5, 18, 8.5, x => x < seam ? 'mold' : 'accent');
    for (let y = 3; y < 19; y++) g.put(seam, y, '|:¦'[Math.floor(hs(y + Math.floor(t / 2)) * 3)], 'mid');
    g.put(12, 6, '(@)', 'danger'); g.put(30, 6, '(o)', 'accent');
    g.put(9, 15, '/\\/\\/\\/\\/\\', 'mold'); g.put(seam + 1, 15, '_'.repeat(11), 'accent');
    [[8, 2], [14, 3], [18, 2]].forEach(([x, n], i) => { const l = 1 + (Math.floor(t / 6) + i) % n; for (let j = 0; j < l; j++) g.put(x, 19 + j, ':', 'mold'); });
    const pos = [[5, 9], [9, 12], [5, 4], [9, 4], [13, 11], [13, 8]];
    pos.forEach(([dx, y]) => { node(g, seam + 1 + dx, y); node(g, seam - 1 - dx, y); });
    const k = Math.floor(t / 12) % 6, lag = (k + 5) % 6, hide = 4;
    const me = pos[k]; g.put(seam + 1 + me[0] - 3, me[1], '>', 'accent'); node(g, seam + 1 + me[0], me[1], 'hot');
    const it = pos[k === hide ? 1 : lag]; g.put(seam - 1 - it[0] + 2, it[1], '<', 'mold');
    hud(g, 5, k === hide ? '...but it won\'t follow you here' : 'it copies you', k === hide ? 'bright' : 'mid');
  }

  // 7. THE BLOOM
  function bloom(g, t) {
    const cyc = Math.floor(t / 80), f = t % 80, root = Math.floor(hs(cyc + 3) * 24), rc = root % 6, rr = Math.floor(root / 6);
    const rx = 5 + rc * 7, ry = 4 + rr * 4, R = Math.min(f, 64) / 64 * 22;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) g.put(7 + c * 7, 4 + r * 4, '. . .', 'dim');
    for (let y = 2; y <= 19; y++) for (let x = 1; x < 43; x++) {
      const d = Math.hypot((x - rx) / 2, y - ry) + hs(x * 31 + y * 7) * 3;
      if (d < R) { const z = d / Math.max(R, 1); g.put(x, y, z < .3 ? '%&'[(x + y) & 1] : z < .65 ? '*;'[(x + y) & 1] : ':,.'[(x * y) % 3], z < .6 ? 'mold' : 'moldDim'); }
    }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      const x = 5 + c * 7, y = 4 + r * 4, d = Math.hypot((x - rx) / 2, y - ry);
      node(g, x, y, d + 1 < R ? 'mold' : 'n');
    }
    const full = f >= 64;
    hud(g, 6, full ? 'covered. -1 INT, it roots again' : 'it grows out of the real node', full ? 'danger' : 'mid');
  }

  // 8. THE CORE
  function core(g, t) {
    const cx = 22, cy = 11, rings = [[5, 2.5, 3, 0.07], [11, 5, 5, -0.045], [18, 8.2, 7, 0.028]];
    g.put(cx, 1, 'v', 'money');
    for (let y = 2; y < 4; y++) g.put(cx, y, '¦', 'dd');
    rings.forEach(([a, b]) => { for (let i = 0; i < 90; i++) { const th = i / 90 * Math.PI * 2; g.put(cx + a * Math.cos(th), cy + b * Math.sin(th), '.', 'dim'); } });
    g.put(cx - 1, cy, '(@)', 'danger'); g.put(cx - 2, cy - 1, '.---.', 'dd'); g.put(cx - 2, cy + 1, "'---'", 'dd');
    const beat = t % 10 < 3;
    rings.forEach(([a, b, n, sp], ri) => {
      for (let j = 0; j < n; j++) {
        const th = j / n * Math.PI * 2 + sp * t + ri, x = cx + a * Math.cos(th), y = cy + b * Math.sin(th);
        const atGate = Math.abs(Math.round(x) - cx) <= 1 && y < cy;
        node(g, Math.round(x), Math.round(y), j === 0 && beat ? 'real' : atGate ? 'hot' : 'n');
      }
    });
    hud(g, 7, beat ? 'THUMP: one node pulses' : 'tap it as it crosses the gate', beat ? 'money' : 'mid');
  }

  // 9. THE SOURCE
  const WORDS = ['HEAVEN', 'SAVIOR', 'ORIGIN', 'MOTHER', 'BURIED', 'SIGNAL', 'ORPHAN', 'FATHER'];
  const BODY = ['if(fear>0) patch(self);', 'merge(OMNI, CHRONOS);', '// who made me? ', 'while(1) grow();', 'deny(%s);', 'root = "%s";', 'hide(sector[7]);', 'eyes.open = true;', '// %s was here', 'spread(mold, *);', 'return %s;', 'kill(d0g);'];
  function source(g, t) {
    const off = Math.floor(t / 14);
    for (let i = 0; i < 18; i++) {
      const n = i + off, y = 2 + i, addr = (0xA0 + n * 3).toString(16).toUpperCase().padStart(4, '0');
      g.put(0, y, addr, 'dim');
      let b = BODY[n % BODY.length]; const w = WORDS[(n * 3) % WORDS.length], has = b.includes('%s') || n % BODY.length === 2;
      b = b.includes('%s') ? b.replace('%s', w) : n % BODY.length === 2 ? b + w : b;
      const typing = i === 9;
      if (typing) { const k = t % 14 * 2; g.put(5, y, b.slice(0, k), 'mid'); if (k < b.length) g.put(5 + k, y, '▌', 'money'); continue; }
      g.put(5, y, b, 'mid');
      if (has) { const at = b.indexOf(w); g.put(5 + at, y, w, w === 'ORIGIN' ? 'dim' : 'accent'); }
    }
    for (let y = 2; y < 20; y++) g.put(30, y, '│', 'dim');
    g.put(32, 2, 'GUESSES', 'mid');
    [['HEAVEN', '0/6', 'dim'], ['SAVIOR', '1/6', 'mid'], ['ORIGIN', '3/6', 'text']].forEach(([w, s, c], i) => { g.put(32, 4 + i * 2, w, c); g.put(39, 4 + i * 2, s, c === 'text' ? 'money' : c); });
    g.put(32, 11, 'TRIES', 'mid'); g.put(32, 12, '▓▓▓░', 'accent');
    hud(g, 6, 'pick a word: it says how close');
  }

  // 10. THE SWARM
  const N = 36;
  function formation(k, t) {
    const p = [];
    for (let i = 0; i < N; i++) {
      if (k === 0) { const th = i / N * Math.PI * 2 + t * 0.01; p.push([22 + 17 * Math.cos(th), 10.5 + 8 * Math.sin(th)]); }
      else if (k === 1) {
        if (i < 14) { const th = i / 14 * Math.PI * 2; p.push([22 + 17 * Math.cos(th), 10.5 + 8.2 * Math.sin(th)]); }
        else if (i < 26) { const j = i - 14, cx = j < 6 ? 14 : 30, th = (j % 6) / 6 * Math.PI * 2; p.push([cx + 3 * Math.cos(th), 7.5 + 1.4 * Math.sin(th)]); }
        else { const j = (i - 26) / 9; p.push([12 + j * 20, 14 + 2.2 * Math.sin(Math.PI * j)]); }
      } else { const r = (i + 2) / (N + 2), th = i * 0.62 + t * 0.06; p.push([22 + 19 * r * Math.cos(th), 10.5 + 9 * r * Math.sin(th)]); }
    }
    return p;
  }
  function swarm(g, t) {
    const st = Math.floor(t / 50) % 3, f = t % 50, m = f < 34 ? 0 : sm((f - 34) / 16);
    const A = formation(st, t), B = formation((st + 1) % 3, t), odd = 7 + st * 9;
    const all = t % 22 < 2, mine = (t + 11) % 22 < 2;
    for (let i = 0; i < N; i++) {
      const x = A[i][0] + (B[i][0] - A[i][0]) * m, y = A[i][1] + (B[i][1] - A[i][1]) * m;
      const shut = i === odd ? mine : all;
      g.put(x, y, shut ? '-' : i % 5 === 0 ? 'O' : i % 3 === 0 ? '@' : 'o', i % 5 === 0 ? 'bright' : 'rep');
    }
    hud(g, 8, 'one eye blinks out of time');
  }

  // ---------------- The second page (mold armor) ----------------
  // 1. THE HUSK: scrape the armor, see what's under it.
  function husk(g, t) {
    const holes = [[9, 6, 'node'], [22, 10, 'eye'], [35, 6, 'ice'], [12, 15, 'mouth'], [32, 15, 'node']];
    const rad = holes.map((h, i) => { const p = (t + i * 27) % 135; return p < 15 ? p / 15 : p < 95 ? 1 : 1 - (p - 95) / 40; });
    const dist = (x, y, i) => Math.hypot((x - holes[i][0]) / 2, y - holes[i][1]);
    for (let y = 2; y <= 19; y++) for (let x = 0; x < W; x++) {
      let inside = false, rim = false;
      holes.forEach((h, i) => { const d = dist(x, y, i), r = rad[i] * 3.6; if (d < r) inside = true; else if (rad[i] > .05 && d < r + 0.9) rim = true; });
      if (inside) continue;
      if (rim) g.put(x, y, ',', 'moldDim'); else moldAt(g, x, y, t);
    }
    holes.forEach(([cx, cy, k], i) => {
      if (rad[i] < 0.6) return;
      if (k === 'node') node(g, cx, cy); else if (k === 'ice') node(g, cx, cy, 'ice');
      else if (k === 'eye') { const px = Math.round(Math.sin(t / 9) * 2); g.put(cx - 3, cy - 1, '.-~~~-.', 'bright'); g.put(cx - 3, cy, '(     )', 'bright'); g.put(cx + px, cy, '@', 'danger'); g.put(cx - 3, cy + 1, "'-~~~-'", 'bright'); }
      else { g.put(cx - 3, cy - 1, 'VvVVvVV', 'bright'); g.put(cx - 3, cy, ' . : . ', 'dd'); g.put(cx - 3, cy + 1, '^^A^^A^', 'bright'); }
    });
    hud(g, 8, 'scrape it. not all of it is nodes');
  }

  // 2. THE JACK: a grin carved in the mold, lit from inside.
  function jack(g, t) {
    const fl = hs(Math.floor(t / 2) + 0.5), out = Math.floor(t / 40) % 3 === 2 && t % 40 > 26;
    const lit = !out && fl > 0.08, glow = fl > 0.55 ? 'orange' : 'money', open = 0.75 + 0.25 * Math.sin(t / 10);
    const eyeL = (x, y) => x >= 8 && x <= 18 && y <= 8 && y >= 3.6 + (x - 8) * 0.42;
    const eyeR = (x, y) => x >= 26 && x <= 36 && y <= 8 && y >= 4.4 + (36 - x) * 0.42;
    const nose = (x, y) => y >= 9 && y <= 10 && Math.abs(x - 22) <= y - 8.5;
    const tilt = x => (x - 22) * -0.08;
    const top = x => { const u = (x - 22) / 17; return 11 + 2.5 * (1 - u * u) + tilt(x); };
    const bot = x => { const u = (x - 22) / 17; return 11 + (2.5 + 5.5 * open) * (1 - u * u) + tilt(x); };
    const tooth = (x, y) => {
      const d = Math.abs((((x - 7) % 6) + 6) % 6 - 3), e = Math.abs((((x - 10) % 6) + 6) % 6 - 3);
      return y < top(x) + 2.4 - d * 0.85 || y > bot(x) - 2.4 + e * 0.85;
    };
    const grin = (x, y) => x >= 5 && x <= 39 && y > top(x) && y < bot(x) && !tooth(x, y);
    for (let y = 2; y <= 19; y++) for (let x = 0; x < W; x++) {
      if (eyeL(x, y) || eyeR(x, y) || nose(x, y) || grin(x, y)) { if (lit) g.put(x, y, hs(x * 7 + y * 3 + Math.floor(t / 2)) > 0.55 ? '░' : '▒', glow); }
      else moldAt(g, x, y, t);
    }
    if (lit) { [13, 22, 31].forEach(x => node(g, x, Math.round((top(x) + bot(x)) / 2))); node(g, 14, 7); node(g, 31, 7); }
    hud(g, 6, lit ? "hit the grin's nodes while it's lit" : 'the candle gutters out', lit ? 'mid' : 'danger');
  }

  // 3. THE MAW: long teeth, strands of mold, a tongue that licks the nodes.
  function maw(g, t) {
    const gb = Math.round(17 + Math.sin(t / 9) * 0.6);
    const topE = x => { const u = (x - 22) / 20; return 3 + 6 * u ** 4; }, botE = x => { const u = (x - 22) / 20; return gb - 6 * u ** 4; };
    const inside = (x, y) => x > 1 && x < 43 && y > topE(x) && y < botE(x);
    for (let y = 2; y <= 19; y++) for (let x = 0; x < W; x++) if (!inside(x, y)) moldAt(g, x, y, t);
    for (let x = 5; x < 40; x += 5) { const sw = Math.round(Math.sin(t / 7 + x) * 0.8); for (let y = Math.ceil(topE(x)) + 2; y < botE(x) - 1; y++) if (hs(x + y * 3) > 0.3) g.put(x + (y > 10 ? sw : 0), y, ':', 'moldDim'); }
    const nodes = [[9, 11], [16, 12], [28, 12], [35, 11], [22, 9]], k = Math.floor(t / 30) % 5, f = t % 30;
    const ext = f < 10 ? f / 10 : f < 20 ? 1 : 1 - (f - 20) / 10, [tx, ty] = nodes[k], bx = 22, by = gb - 1;
    nodes.forEach(([x, y], i) => node(g, x, y, i === k && ext === 1 ? 'ice' : 'n'));
    for (let s = 0; s <= ext - 0.06; s += 0.02) {
      const x = bx + (tx - bx) * s + Math.sin(s * 7 - t / 2) * 2.5 * (1 - s), y = by + (ty - by) * s;
      g.put(x, y, s < 0.35 ? 'O' : s < 0.7 ? 'o' : '~', 'danger');
    }
    for (let x = 3; x < 42; x += 2) {
      const y0 = Math.floor(topE(x)) + 1, len = 2 + Math.floor(hs(x) * (Math.abs(x - 22) < 12 ? 5 : 3));
      for (let j = 0; j < len - 1; j++) g.put(x, y0 + j, '|', 'bright'); g.put(x, y0 + len - 1, 'v', 'bright');
    }
    for (let x = 4; x < 41; x += 2) {
      const y0 = Math.ceil(botE(x)) - 1, len = 1 + Math.floor(hs(x + 50) * (Math.abs(x - 22) < 12 ? 4 : 2));
      for (let j = 0; j < len - 1; j++) g.put(x, y0 - j, '|', 'bright'); g.put(x, y0 - len + 1, '^', 'bright');
    }
    hud(g, 5, ext === 1 ? 'the tongue turns that node to ICE' : 'watch the tongue', ext === 1 ? 'danger' : 'mid');
  }

  // 4. THE LIDS: eyes open all over the mold. The others glance at the real one.
  function lids(g, t) {
    const pos = [[8, 5], [22, 4], [36, 5], [11, 10], [33, 10], [8, 15], [22, 16], [36, 15], [22, 10]];
    const tgt = (Math.floor(t / 70) * 5 + 2) % 9;
    for (let y = 2; y <= 19; y++) for (let x = 0; x < W; x++) {
      if (pos.some(([px, py]) => Math.abs(x - px) <= 4 && Math.abs(y - py) <= 1)) continue;
      if (pos.some(([px, py]) => Math.abs(x - px) <= 5 && Math.abs(y - py) <= 2)) g.put(x, y, ',', 'moldDim'); else moldAt(g, x, y, t);
    }
    pos.forEach(([x, y], i) => {
      const p = (t + hs(i) * 40) % 44, st = p < 4 || (p >= 28 && p < 32) ? 'half' : p < 28 ? 'open' : 'shut';
      if (st === 'shut') { g.put(x - 4, y, "`-.___.-´", 'mid'); return; }
      if (st === 'half') { g.put(x - 4, y - 1, '_.-~~~-._', 'mid'); g.put(x - 4, y, '(_______)', 'mid'); return; }
      g.put(x - 4, y - 1, ".-'~~~'-.", 'bright'); g.put(x - 4, y, '(       )', 'bright'); g.put(x - 4, y + 1, "'-.___.-'", 'bright');
      if (i === tgt) node(g, x, y, 'n');
      else { const [tx, ty] = pos[tgt]; const dx = Math.max(-2, Math.min(2, Math.round((tx - x) / 6))); g.put(x - 1 + dx, y, '(@)', 'danger'); }
    });
    hud(g, 7, 'the eyes all glance at the real one');
  }

  // 5. THE ORBIT: THE CORE's rings, crusted in mold. Scrape them clean at the gate.
  function orbit(g, t) {
    const cx = 22, cy = 11, rings = [[5, 2.5, 3, 0.07], [11, 5, 5, -0.045], [18, 8.2, 7, 0.028]];
    g.put(cx, 1, 'v', 'money'); g.put(cx, 2, '¦', 'dd');
    rings.forEach(([a, b], ri) => { for (let i = 0; i < 90; i++) { const th = i / 90 * Math.PI * 2, x = cx + a * Math.cos(th), y = cy + b * Math.sin(th);
      if (ri === 2) moldAt(g, Math.round(x), Math.round(y), t); else g.put(x, y, '.', 'dim'); } });
    // the eye in the middle, half under the mold
    g.put(cx - 3, cy - 1, '.-~~~-.', 'bright'); g.put(cx - 3, cy, '(  @  )', 'bright'); g.put(cx, cy, '@', 'danger'); g.put(cx - 3, cy + 1, "'-~~~-'", 'bright');
    for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx + 1; x <= cx + 4; x++) if (hs(x * 9 + y) > 0.25) moldAt(g, x, y, t);
    rings.forEach(([a, b, n, sp], ri) => {
      for (let j = 0; j < n; j++) {
        const th = j / n * Math.PI * 2 + sp * t + ri, x = Math.round(cx + a * Math.cos(th)), y = Math.round(cy + b * Math.sin(th));
        const atGate = Math.abs(x - cx) <= 1 && y < cy, crusted = ri === 2 || (ri === 1 && j % 2 === 0);
        node(g, x, y, atGate ? (crusted ? 'scrape' : 'hot') : crusted ? 'crust' : 'n');
      }
    });
    hud(g, 8, 'scrape a crust as it passes the gate');
  }

  // 6. THE TIDE: the mold breathes. At low tide its ribcage shows.
  function tide(g, t) {
    const R = 8 + 5 * Math.sin(t / 14), cx = 22;
    for (let y = 3; y <= 18; y++) g.put(cx, y, '║', 'text');
    [[5, 11], [8, 14], [13, 14], [16, 11]].forEach(([y, len]) => {
      g.put(cx - len, y, '(' + '-'.repeat(len - 1), 'mid'); g.put(cx + 1, y, '-'.repeat(len - 1) + ')', 'mid');
      node(g, cx - len + 1, y); node(g, cx + len - 1, y);
    });
    g.put(cx - 2, 10, t % 10 < 3 ? '<(@)>' : ' (@) ', 'danger'); g.put(cx - 2, 11, " '-' ", 'dd');
    for (let y = 2; y <= 19; y++) for (let x = 0; x < W; x++) {
      const d = Math.hypot((x - cx) / 2, y - 10.5) + hs(x * 5 + y * 9) * 1.5;
      if (d > R) moldAt(g, x, y, t); else if (d > R - 0.8) g.put(x, y, '.', 'moldDim');
    }
    hud(g, 6, R > 11 ? 'low tide: the nodes are out' : R < 5 ? 'high tide: it covers them' : 'it breathes', R > 11 ? 'bright' : R < 5 ? 'danger' : 'mid');
  }

  // 7. THE TENDRILS: the mold reaches down for your INT, a node on every tip.
  function tendrils(g, t) {
    for (let y = 2; y <= 4; y++) for (let x = 0; x < W; x++) if (y < 4 || hs(x * 3) > 0.3) moldAt(g, x, y, t);
    g.put(0, 19, '_'.repeat(W), 'dd');
    let grabbed = false;
    for (let i = 0; i < 6; i++) {
      const bx = 4 + i * 7, ph = (t * (0.35 + hs(i) * 0.3) + hs(i + 4) * 20) % 20;
      const L = ph < 15 ? 2 + ph : 17 - (ph - 15) * 3, Li = Math.round(L);
      let x = bx;
      for (let j = 1; j <= Li; j++) {
        x = bx + Math.sin(j * 0.6 - t / 4 + i) * Math.min(j, 6) * 0.5;
        if (j < Li) g.put(x, 4 + j, j < Li * 0.4 ? '%' : j < Li * 0.75 ? '&' : ':', j < Li * 0.6 ? 'mold' : 'moldDim');
      }
      node(g, Math.round(x), 4 + Li, i === 3 ? 'ice' : 'n');
      if (4 + Li >= 18) { grabbed = true; g.put(Math.round(x) - 1, 19, '\\|/', 'danger'); }
    }
    hud(g, 7, grabbed ? 'it grabbed you. -1 INT' : 'cut the real one at the tip', grabbed ? 'danger' : 'mid');
  }

  // 8. THE ONION: rings turning against each other. Peel the mold ring to reach the circuits, then the eye.
  function onion(g, t) {
    const cx = 22, cy = 10.5, gap = 0.55;
    for (let y = 2; y <= 19; y++) for (let x = 0; x < W; x++) {
      const X = (x - cx) / 2.1, Y = y - cy, d = Math.hypot(X, Y), ang = Math.atan2(Y, X);
      const a3 = ang + t * 0.03, inGap = Math.abs(Math.atan2(Math.sin(a3 - 1), Math.cos(a3 - 1))) < gap;
      if (d < 3.2) g.put(x, y, hs(x * 3 + y) > 0.5 ? '~' : '-', 'dd');
      else if (d < 6.3) { const a2 = ang - t * 0.05, i = Math.floor((a2 + 10) * 5 + d * 1.5); g.put(x, y, '─│┼┐└┘┌·'[i & 7], 'mid'); }
      else if (d < 9.5 && !inGap) { const [c, k] = moldCh(Math.floor((a3 + 10) * 9), Math.floor(d * 2), t); g.put(x, y, c, k); }
      else if (d < 9.5) g.put(x, y, d > 9 || d < 6.8 ? ',' : ' ', 'moldDim');
    }
    g.put(cx - 1, cy - 1, '.-.', 'bright'); g.put(cx - 1, cy, '(@)', 'danger'); g.put(cx - 1, cy + 1, "'-'", 'bright');
    for (let j = 0; j < 4; j++) { const a = j / 4 * Math.PI * 2 + t * 0.05; node(g, Math.round(cx + 4.8 * 2.1 * Math.cos(a)), Math.round(cy + 4.8 * Math.sin(a))); }
    for (let j = 0; j < 6; j++) {
      const a3 = j / 6 * Math.PI * 2 + 1, a = a3 - t * 0.03, x = Math.round(cx + 7.9 * 2.1 * Math.cos(a)), y = Math.round(cy + 7.9 * Math.sin(a));
      node(g, x, y, j === 0 ? 'n' : 'crust');
    }
    g.put(cx, 1, 'v', 'money');
    hud(g, 7, 'peel a ring to reach the next');
  }

  // 9. THE DARK: no light but yours. Something in there doesn't like it.
  function dark(g, t) {
    const sg = rawGrid();
    for (let y = 2; y <= 19; y++) for (let x = 0; x < W; x++) { const [c, k] = moldCh(x, y, t); sg.put(x, y, c === '%' || c === '&' ? c : c === '#' ? '.' : ' ', k); }
    [[8, 4], [18, 7], [35, 5], [27, 11], [6, 13], [16, 17], [39, 16]].forEach(([x, y]) => node(sg, x, y));
    sg.put(28, 15, 'VVvVVvVV', 'bright'); sg.put(28, 16, ' . :: . ', 'dd'); sg.put(28, 17, '^A^^A^^^', 'bright');
    sg.put(7, 8, '.-~-.', 'bright'); sg.put(7, 9, '( @ )', 'bright'); sg.put(9, 9, '@', 'danger'); sg.put(7, 10, "'-~-'", 'bright');
    const lx = 22 + 17 * Math.sin(t / 17), ly = 10.5 + 6.5 * Math.sin(t / 11), R = 5.2;
    const mouthLit = Math.hypot((31.5 - lx) / 2, 16 - ly) < R + 1;
    for (let y = 2; y <= 19; y++) for (let x = 0; x < W; x++) {
      const d = Math.hypot((x - lx) / 2, y - ly);
      if (d < R) {
        let c = sg.ch[y][x], k = sg.co[y][x];
        if (mouthLit && y >= 15 && y <= 17 && x >= 28 && x < 36) { c = y === 16 ? '=' : ' '; k = 'mid'; }
        g.put(x, y, c, d > R - 1.3 && k !== 'danger' ? (k === 'mold' ? 'moldDim' : 'dim') : k);
      } else if (hs(x * 17 + y * 3 + Math.floor(t / 9)) > 0.988) g.put(x, y, '.', 'moldDim');
    }
    [[38, 4], [5, 17], [24, 18]].forEach(([x, y], i) => {
      if (Math.hypot((x - lx) / 2, y - ly) > R + 3 && (Math.floor(t / 7) + i * 2) % 6 < 3) g.put(x, y, '° °', 'dd');
    });
    hud(g, 6, mouthLit ? 'something in there shut its mouth' : 'move your light. find the nodes', mouthLit ? 'bright' : 'mid');
  }

  // 10. THE HOST: the fight on the sector map. The mold spreads corp to corp; you cut links.
  const CORPS = { OMNI: [22, 3], CHRONOS: [8, 8], MOCHI: [36, 8], PARCEL: [8, 14], MIRROR: [36, 14], G0D: [22, 18] };
  const LINKS = [['G0D', 'PARCEL', 0], ['G0D', 'MIRROR', 0], ['G0D', 'OMNI', 15], ['PARCEL', 'CHRONOS', 35], ['MIRROR', 'MOCHI', 35, 0.5], ['CHRONOS', 'OMNI', 65], ['CHRONOS', 'MOCHI', 90, 0.35]];
  function host(g, t) {
    const f = t % 140, sick = new Set(['G0D']);
    LINKS.forEach(([a, b, s, cut]) => {
      const [ax, ay] = CORPS[a], [bx, by] = CORPS[b], p = Math.max(0, Math.min(cut || 1, (f - s) / 30));
      for (let i = 0; i <= 60; i++) {
        const u = i / 60, x = Math.round(ax + (bx - ax) * u), y = Math.round(ay + (by - ay) * u);
        if (u <= p) g.put(x, y, '%&#*'[Math.floor(hs(x * 7 + y + Math.floor(t / 6)) * 4)], hs(x + y * 5) > 0.4 ? 'mold' : 'moldDim'); else g.put(x, y, '.', 'dim');
      }
      if (cut) { const u = cut + 0.04; g.put(Math.round(ax + (bx - ax) * u), Math.round(ay + (by - ay) * u), 'x', 'danger'); }
      else if (p >= 1) sick.add(b);
    });
    Object.entries(CORPS).forEach(([n, [x, y]]) => {
      const s = `[ ${n} ]`, x0 = x - Math.floor(s.length / 2);
      if (n === 'G0D') g.put(x0 - 1, y, '[(@)G0D(@)]', 'danger');
      else if (sick.has(n)) { g.put(x0, y, s, 'mold'); for (let i = 2; i < s.length - 2; i++) if (hs(i + x + Math.floor(t / 3)) > 0.6) g.put(x0 + i, y, '%&#'[i % 3], 'moldDim'); }
      else g.put(x0, y, s, 'accent');
    });
    hud(g, 9, 'cut a link a turn. sick corps = bosses');
  }

  // ---------------- The list (the editor's G0D tab shows it in this order) ----------------
  const D = (key, name, set, f, note) => ({ key, name, set, where: 'layer', f, note });
  const list = [
    D('face', 'THE FACE', 1, face, 'the board is its face; its expressions are its moves (STARE, BLINK, GRIN, FROWN)'),
    D('eye', 'THE EYE', 1, eye, 'one eye fills the layer; it looks at a node (guard or bait), blinks to shuffle'),
    D('mouth', 'THE MOUTH', 1, mouth, 'the teeth are nodes; the jaw bites on a clock'),
    D('spill', 'THE SPILL', 1, spill, 'the spilling logo; tap the real drips before they land'),
    D('congregation', 'THE CONGREGATION', 1, congregation, 'every corp AI\'s face; one is a beat late'),
    D('mirror', 'THE MIRROR', 1, mirror, 'half G0D, half you; it copies you except where it hides'),
    D('bloom', 'THE BLOOM', 1, bloom, 'mold grows out of the real node'),
    D('core', 'THE CORE', 1, core, 'rings of nodes; tap the one pulsing on the beat at the gate'),
    D('source', 'THE SOURCE', 1, source, 'its code; guess the word, it says how close'),
    D('swarm', 'THE SWARM', 1, swarm, 'a cloud of eyes; one blinks out of time'),
    D('husk', 'THE HUSK', 2, husk, 'mold armor; scrape it to find nodes, ICE, an eye, a mouth'),
    D('jack', 'THE JACK', 2, jack, 'a crooked grin carved in the mold, lit from inside; the candle gutters'),
    D('maw', 'THE MAW', 2, maw, 'long teeth, mold strands; the tongue licks a node to ICE'),
    D('lids', 'THE LIDS', 2, lids, 'eyes in the mold; the others glance at the real one'),
    D('orbit', 'THE ORBIT', 2, orbit, 'crusted rings around a half-buried eye; scrape at the gate'),
    D('tide', 'THE TIDE', 2, tide, 'the mold breathes; at low tide its ribcage shows'),
    D('tendrils', 'THE TENDRILS', 2, tendrils, 'tendrils reach down for your INT; a node on every tip'),
    D('onion', 'THE ONION', 2, onion, 'rings turning against each other: mold, circuits, the eye'),
    D('dark', 'THE DARK', 2, dark, 'pitch black; your light shows what\'s there'),
    D('host', 'THE HOST', 2, host, 'the mockup: mold spreading corp to corp; cut a link a turn (the real map: THE NETWORK GOES)'),
  ];
  // A design drawn at the board's size (w x h cells).
  const draw = (key, t, w, h) => {
    const l = list.find(x => x.key === key);
    GW = w; GH = h; SX = w / W; SY = h / H;
    const g = grid(); l.f(g, t); return g;
  };
  return { list, draw, hs, moldCh, LOGO };
})();

// ---------------- Over a screen ----------------
const G0D_COLS = { mold: '#9fc13a', moldDim: '#4f6120', orange: '#ff8a4a' };   // G0D's own colors, the same in every palette
const g0dCol = k => G0D_COLS[k] || (k === 'dd' ? C.dangerDim : C[k]) || C.text;
const g0dCell = (ch, cx, cy, col) => ({ ch, cx, cy, col, own: 'hud', bold: false });
// ---------------- THE HEALTH BAR: its own overlay (the user, 2026-10-29), over a design or on its own ----------------
// st.g0dBar = a style key. Where it goes: 'header' (G0D where LAYER nn is, the bar where the corp's name is; INT and the
// credits stay) or 'board' (across the board's top row). Its own demo: G0D takes a hit every 1.6s (the chunk flashes),
// then fills back up.
const G0D_HP = {
  hash: { name: 'HASHES', full: '#', empty: '.', at: 'header', note: 'in the header, drawn like INT (# and .)' },
  blocks: { name: 'BLOCKS', full: '▓', empty: '░', at: 'header', note: "in the header, the mockups' shaded blocks" },
  thin: { name: 'THIN', full: '━', empty: '─', at: 'header', note: 'in the header, a thin line' },
  board: { name: 'ON THE BOARD', full: '▓', empty: '░', at: 'board', note: "across the board's top row, as on the mockup pages" },
};
// The demo's health (0-1) at ms, and whether a hit is flashing.
const g0dHpAt = ms => {
  const T = ms % 15000; if (T < 1000) return { f: 1, hit: false };
  const k = Math.min(8, Math.floor((T - 1000) / 1600) + 1), into = (T - 1000) % 1600;
  return { f: 1 - k * 0.1, was: 1 - (k - 1) * 0.1, hit: k < 8 && into < 260 };
};
// A bar of width bw from x0 on row y (a hit shows the lost chunk bright).
function g0dBarCells(out, x0, y, bw, hp, sty) {
  const n = Math.max(0, Math.min(bw, Math.round(hp.f * bw))), was = hp.hit ? Math.round(hp.was * bw) : n;
  for (let i = 0; i < bw; i++) out.push(g0dCell(i < was ? sty.full : sty.empty, x0 + i, y, i >= n && i < was ? C.bright : C.danger));
}
// The boss bar on one row: 'G0D ' and the bar (f: 0-1, or a demo health).
function g0dBar(out, y, f, w = L.wc, sty = G0D_HP.blocks) {
  const keep = out.filter(c => Math.round(c.cy) !== y);
  for (let i = 0; i < 4; i++) keep.push(g0dCell('G0D '[i], i, y, C.danger));
  g0dBarCells(keep, 4, y, w - 4, typeof f === 'number' ? { f } : f, sty);
  return keep;
}
// In the header: row 2 (LAYER nn -> G0D) and row 3 (the corp's name -> the bar, stopping 3 short of the credits).
function g0dHeader(cells, hp, sty) {
  const right = cells.filter(c => Math.round(c.cy) === 3 && c.cx >= L.wc / 2);
  const end = (right.length ? Math.min(...right.map(c => c.cx)) : L.wc) - 3;
  const out = cells.filter(c => !((Math.round(c.cy) === 2 && c.cx < 8) || (Math.round(c.cy) === 3 && c.cx < end + 1)));
  for (let i = 0; i < 3; i++) out.push(Object.assign(g0dCell('G0D'[i], i, 2, hp.hit ? C.bright : C.danger), { bold: true }));
  g0dBarCells(out, 0, 3, end, hp, sty);
  return out;
}
// THE HEALTH BAR over whatever is on screen (a layer or the map: the screens with the run's header).
function g0dHealth(cells, hp, key) {
  const sty = G0D_HP[key] || G0D_HP.hash;
  return sty.at === 'board' ? g0dBar(cells, BOARD_Y, hp, L.wc, sty) : g0dHeader(cells, hp, sty);
}
// A cell turned to mold (or, now and then, left showing through, dim).
function g0dRot(c, t, show = 0.3) {
  const { hs, moldCh } = G0D_LOOKS;
  if (hs(c.cx * 3 + c.cy * 11) < show) return Object.assign({}, c, { col: G0D_COLS.moldDim });
  const [m, k] = moldCh(c.cx, c.cy, t);
  return Object.assign({}, c, { ch: m === ' ' ? '%' : m, col: g0dCol(k) });
}
// Mold over every cell where dist(x, y) < R (cells there turn; empty cells there fill in, some of them).
function g0dSpread(cells, t, R, dist, y0, y1, w) {
  const { hs, moldCh } = G0D_LOOKS, taken = new Set(), out = [];
  for (const c of cells) {
    if (c.cy < y0 - 0.5 || c.cy >= y1 - 0.5 || dist(c.cx, c.cy) >= R) { out.push(c); continue; }
    taken.add(Math.round(c.cx) + ',' + Math.round(c.cy)); out.push(g0dRot(c, t));
  }
  for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) {
    if (taken.has(x + ',' + y) || dist(x, y) >= R || hs(x * 5.1 + y * 9.7) < 0.4) continue;
    const [m, k] = moldCh(x, y, t); if (m !== ' ') out.push(g0dCell(m, x, y, g0dCol(k)));
  }
  return out;
}

// THE NETWORK GOES (the map): you breach the boss node, and instead of the map changing the whole network is
// eaten by the mold, then G0D's bar comes up. (Loops every 9s.)
function g0dConsume(cells, ms, t) {
  const T = ms % 9000, y0 = BOARD_Y, h = L.gh, w = L.wc, cx = w / 2, cy = y0 + h / 2;
  const R = Math.min(1, T / 3200) * (Math.hypot(w / 4, h / 2) + 3);
  let out = g0dSpread(cells, t, R, (x, y) => Math.hypot((x - cx) / 2, y - cy) + G0D_LOOKS.hs(x * 7.3 + y * 3.1) * 2.5, y0, y0 + h, w);
  if (T > 3400 && !st.g0dBar) out = g0dHealth(out, { f: Math.min(1, (T - 3400) / 1600) }, 'hash');   // the bar comes up (THE HEALTH BAR's, if one is picked)
  return out;
}
// NOT DEAD YET (the win screen): the stats come up, then the mold creeps in from the edges and G0D's bar
// comes back. (Loops every 11s.)
function g0dWinBack(cells, ms, t) {
  const T = ms % 11000, w = L.wc, h = L.hc, { hs } = G0D_LOOKS;
  if (T < 2500) return cells;
  const R = Math.min(1, (T - 2500) / 3500) * (Math.min(w / 4, h / 2) * 0.45);   // it stops short: the stats still read
  const edge = (x, y) => Math.min(x / 2, (w - 1 - x) / 2, y, h - 1 - y) - hs(x * 2.7 + y * 6.1) * 2;
  let out = g0dSpread(cells, t, R, edge, 0, h, w).map(c => {   // the front fizzes
    const e = edge(c.cx, c.cy); return e >= R && e < R + 1 && hs(c.cx + c.cy * 7 + t) > 0.5 ? Object.assign({}, c, { ch: '#%&@'[(c.cx + t) & 3], col: G0D_COLS.mold }) : c;
  });
  if (T > 6200) { const f = Math.min(1, (T - 6200) / 2200), stutter = hs(Math.floor(T / 90)) > 0.8 ? 0.06 : 0; out = g0dBar(out, 1, f - stutter); }
  return out;
}
// MOLD GLITCH (later sectors, any screen): every so often a few cells flicker to mold for a moment.
function g0dGlitch(cells, ms) {
  const { hs } = G0D_LOOKS, k = Math.floor(ms / 700), into = ms % 700;
  if (into > 240) return cells;
  const cx = Math.floor(hs(k * 3.7) * L.wc), cy = Math.floor(hs(k * 5.3) * L.hc), r = 1.5 + hs(k) * 3;
  return cells.map(c => Math.hypot((c.cx - cx) / 2, c.cy - cy) < r && hs(c.cx * 13 + c.cy * 7 + k) > 0.3
    ? Object.assign({}, c, { ch: '%&#*;:'[Math.floor(hs(c.cx + c.cy + k) * 6)], col: G0D_COLS.mold }) : c);
}
// G0D ON THE DEATH SCREEN (dying with no crew in the layer): its spilling logo, eyes, a line.
function g0dDeath(cells, ms, t, bgs) {
  const { hs, LOGO } = G0D_LOOKS, lw = LOGO[0].length, bw = lw + 4, bh = LOGO.length + 8;
  const x0 = Math.floor((L.wc - bw) / 2), y0 = BOARD_Y + Math.max(0, Math.floor((L.gh - bh) / 2));
  const out = cells.filter(c => !(c.cx >= x0 - 0.5 && c.cx < x0 + bw - 0.5 && c.cy >= y0 - 0.5 && c.cy < y0 + bh - 0.5));
  for (let r = 0; r < bh; r++) bgs.push({ cx: x0, cy: y0 + r, w: bw, col: C.bg, alpha: 1 });
  const blink = t % 30 < 2;
  LOGO.forEach((l, r) => { for (let i = 0; i < l.length; i++) {
    let c = l[i], col = '()@'.includes(c) ? C.danger : C.bright; if (c === ' ') continue;
    if (c === '@' && blink) c = '-';
    if (r > 2 && hs(i * 17 + r * 3 + Math.floor(t / 4) * 0.01) > 0.85) { c = '%&;'[i % 3]; col = G0D_COLS.mold; }
    out.push(g0dCell(c, x0 + 2 + i, y0 + r, col));
  } });
  const last = LOGO[LOGO.length - 1];
  for (let i = 0; i < lw; i++) {
    if (last[i] !== '#' || hs(i + 7) < 0.35) continue;
    const len = Math.floor((t * (0.1 + hs(i) * 0.15) + hs(i + 3) * 8) % 6);
    for (let j = 0; j < len; j++) out.push(g0dCell(j === len - 1 ? '.' : ':', x0 + 2 + i, y0 + LOGO.length + j, G0D_COLS.mold));
  }
  const line = 'it saw you.';   // (a placeholder line)
  for (let i = 0; i < line.length; i++) out.push(g0dCell(line[i], Math.floor((L.wc - line.length) / 2) + i, y0 + bh - 1, C.danger));
  return out;
}
const G0D_FX = [
  { key: 'consume', name: 'THE NETWORK GOES', where: 'map', f: g0dConsume, note: 'the sector map: the mold eats the network, then G0D\'s bar comes up (loops)' },
  { key: 'winback', name: 'NOT DEAD YET', where: 'win', f: g0dWinBack, note: 'the win screen: the stats come up, then the mold creeps back and the bar returns (loops)' },
  { key: 'glitch', name: 'MOLD GLITCH', where: 'map', f: g0dGlitch, note: 'later sectors: bits of the screen flicker to mold (any screen; starts on the map)' },
  { key: 'death', name: 'G0D ON THE DEATH SCREEN', where: 'death', f: g0dDeath, note: 'dying with no crew in the layer: its spilling logo (the line is a placeholder)' },
];
// Every look for the editor: [key, name, group, where, note]
const g0dHpList = () => Object.entries(G0D_HP).map(([k, s]) => [k, s.name, s.note]);
const g0dList = () => G0D_LOOKS.list.map(l => [l.key, l.name, 'set' + l.set, l.where, l.note]).concat(G0D_FX.map(f => [f.key, f.name, 'fx', f.where, f.note]));
const g0dWhere = key => { const l = G0D_LOOKS.list.find(x => x.key === key) || G0D_FX.find(x => x.key === key); return l ? l.where : null; };
const G0D_ON = { layer: () => st.mode === 'play' && !!st.lv, map: () => st.mode === 'map', win: () => st.mode === 'over', death: () => st.mode === 'over' };

// Called by buildScene (engine/scene.js) when st.g0d or st.g0dBar is set (the editor's G0D tab only).
function g0dOverlay(cells, now, bgs) {
  let out = g0dLook(cells, now, bgs);
  if (st.g0dBar && st.run && (st.mode === 'play' || st.mode === 'map')) out = g0dHealth(out, g0dHpAt(now - (st.g0dBarT0 || 0)), st.g0dBar);
  return out;
}
function g0dLook(cells, now, bgs) {
  const p = st.g0d, where = p && g0dWhere(p.key);
  if (!where) return cells;
  const ms = p.still ? 3300 + (p.key === 'winback' ? 5000 : 3000) : now - p.t0, t = Math.floor(ms / 110) + 30;
  const fx = G0D_FX.find(x => x.key === p.key);
  if (fx) return fx.key === 'glitch' || G0D_ON[where]() ? fx.f(cells, ms, t, bgs) : cells;
  if (!G0D_ON.layer()) return cells;
  // a fight design: it takes the board
  const y0 = BOARD_Y, h = L.gh, w = L.wc;
  let out = cells.filter(c => c.cy < y0 - 0.5 || c.cy >= y0 + h - 0.5);
  for (let y = 0; y < h; y++) bgs.push({ cx: 0, cy: y0 + y, w, col: C.bg, alpha: 1 });
  const g = G0D_LOOKS.draw(p.key, t, w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g.ch[y][x] !== ' ') out.push(g0dCell(g.ch[y][x], x, y0 + y, g0dCol(g.co[y][x])));
  return out;
}
