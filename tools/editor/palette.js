(() => {
  'use strict';
  const { $, toGame, onGame, clone } = NEON_ED;
  const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); for (const k of kids) e.append(k); return e; };

  // ---------------- Data ----------------
  // the slots and rarities, and the palettes.js writer, are tools/data/palette_file.js's
  const P = window.NEON_PALETTE_FILE;
  if (!P) { document.body.textContent = "Couldn't load palette_file.js. Open this page from the repo's tools/ folder."; return; }
  const BASE = P.BASE, RAR = P.RAR;
  // how readable each color should be on the background (contrast ratio): dim and dangerDim are faint on purpose
  const NEED = { dim: 1.2, mid: 3, text: 4.5, bright: 4.5, accent: 3, danger: 3, dangerDim: 1.2, money: 3, rep: 3 };
  const PAIRS = [['accent', 'money'], ['accent', 'danger'], ['danger', 'money'], ['accent', 'bright'], ['money', 'bright'], ['rep', 'money'], ['rep', 'accent'], ['rep', 'danger'], ['rep', 'bright'], ['text', 'bright'], ['mid', 'text'], ['dim', 'mid']];

  if (!window.NEON_PALETTES) { document.body.textContent = "Couldn't load ../dist/data/palettes.js. Open this page from the repo's tools/ folder."; return; }
  let data = clone(window.NEON_PALETTES);
  let sel = Object.keys(data.palettes)[0];

  // a palette as the game sees it (palettes are self-contained since v12: no shared rarity set)
  const resolved = key => Object.assign({}, data.palettes[key]);
  // the build to stamp into palettes.js: the game's own (from its 'ready' message), else the stamp the file came with
  let build = NEON_ED.buildOf('data/palettes.js', 'v12.00');

  // ---------------- Color math ----------------
  const isHex = s => /^#[0-9a-f]{6}$/i.test(s);
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = h => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const dist = (a, b) => { const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b), rm = (r1 + r2) / 2;
    return Math.sqrt((2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2); };
  const likeness = (a, b) => dist(a.bg, b.bg) + dist(a.text, b.text) + 2 * dist(a.accent, b.accent);
  const mix = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

  function warnings(p) {
    const out = [];
    for (const [s] of BASE.slice(1)) {
      const c = contrast(p[s], p.bg);
      if (c < NEED[s]) out.push({ text: `${s} is hard to read on the background: ${c.toFixed(2)}:1 (want ${NEED[s]})`, bad: c < NEED[s] * 0.8 });
    }
    for (const [a, b] of PAIRS) {
      const d = dist(p[a], p[b]);
      if (d < 60) out.push({ text: p[a].toLowerCase() === p[b].toLowerCase() ? `${a} and ${b} are the same color` : `${a} and ${b} look alike`, bad: d < 20 });
    }
    return out;
  }

  // ---------------- Writing palettes.js (tools/data/palette_file.js writes and reads it) ----------------
  const fileText = () => P.text(data, build);
  // keep the file's order the way it's written: starters, then locked
  const reorder = () => { P.reorder(data); };
  const parseFile = P.parse;

  // ---------------- Undo / dirty ----------------
  let undo = [], redo = [], lastPush = 0, saved = JSON.stringify(data);
  function before() {   // call before a change; typing / dragging in a burst counts as one step
    const now = Date.now();
    if (now - lastPush > 700) { undo.push(JSON.stringify(data)); if (undo.length > 200) undo.shift(); redo = []; }
    lastPush = now;
  }
  function stepHistory(from, to) {
    if (!from.length) return;
    to.push(JSON.stringify(data));
    data = JSON.parse(from.pop());
    if (!data.palettes[sel]) sel = Object.keys(data.palettes)[0];
    lastPush = 0;
    changed(true);
  }
  const dirty = () => JSON.stringify(data) !== saved;

  // ---------------- The game frame ----------------
  const frame = $('#game');
  let gameReady = false, scene = 'title', sendQueued = false;
  function sendAll() {
    if (!gameReady || sendQueued) return;
    sendQueued = true;
    setTimeout(() => {   // a burst of edits (dragging a picker) goes out as one message
      sendQueued = false;
      toGame({ type: 'palettes', data });
      toGame({ type: 'show', key: sel, dark: +$('#dark').value });
    }, 30);
  }
  const corpOf = key => key.startsWith('c_') ? key.slice(2) : 'basic';
  function runScene(name) {
    scene = name;
    for (const b of document.querySelectorAll('#scenes button')) b.classList.toggle('on', b.dataset.scene === name);
    if (!gameReady) return;
    const corp = $('#corpsel').value === 'auto' ? corpOf(sel) : $('#corpsel').value;
    $('#scenestate').textContent = `setting up: ${name}${['layer', 'hit', 'boss'].includes(name) ? ' (' + corp + ')' : ''}...`;
    toGame({ type: 'scene', name, opts: { corp } });
  }
  onGame('*', m => {
    if (m.type === 'ready') {
      gameReady = true;
      if (m.version) build = m.version;   // stamp palettes.js with the game's build
      $('#scenestate').textContent = `game ${m.version} ready`;
      sendAll();
      runScene(scene);
    }
    if (m.type === 'scene') $('#scenestate').textContent = m.ok ? `scene: ${m.name}${m.info && m.info.corp ? ' · ' + m.info.corp + (m.info.boss ? ' (boss)' : '') : ''}` : `scene ${m.name} failed: ${m.error}`;
    if (m.type === 'shown') window.__lastShown = m;   // (for tests)
  });
  function loadGame() { gameReady = false; $('#scenestate').textContent = 'loading the game...'; frame.src = '../dist/index.html?editor=1&t=' + Date.now(); }

  const SCENES = [['title', 'title'], ['intro', 'intro'], ['map', 'map'], ['layer', 'layer'], ['hit', 'a miss'], ['boss', 'boss'], ['shop', 'shop'], ['sectorboss', 'sector boss'], ['sectorclear', 'sector clear'], ['uplink', 'uplink'], ['help', 'how to play'], ['codex', 'codex'], ['settings', 'settings'], ['profile', 'profile']];
  for (const [k, label] of SCENES) {
    const b = el('button', { textContent: label, onclick: () => runScene(k), title: `show the ${label} screen` });
    b.dataset.scene = k;
    $('#scenes').append(b);
  }
  function fillCorps() {
    const s = $('#corpsel'), cur = s.value || 'auto';
    s.innerHTML = '';
    s.append(el('option', { value: 'auto', textContent: "this palette's corp" }));
    // every corp (the corp files are loaded for the music mode); a corp with a palette of its own is marked *
    const keys = Object.keys(CORPS).sort((a, b) => (CORPS[a].level || 1) - (CORPS[b].level || 1) || CORPS[a].name.localeCompare(CORPS[b].name));
    for (const k of keys) s.append(el('option', { value: k, textContent: `LV${CORPS[k].level || 1} ${CORPS[k].name}${data.palettes['c_' + k] ? ' *' : ''}` }));
    s.value = [...s.options].some(o => o.value === cur) ? cur : 'auto';
  }
  $('#corpsel').onchange = () => { if (['layer', 'hit', 'boss'].includes(scene)) runScene(scene); };
  // (the frame's size and the divider: editor/nav.js)
  $('#reloadgame').onclick = loadGame;
  // music / sfx by the game frame: the game's own switches (engine/editor.js test acts 'music', 'sfx'); lit while on
  for (const [id, act] of [['#gameMusic', 'music'], ['#gameSfx', 'sfx']]) $(id).onclick = () => toGame({ type: 'test', act });
  onGame('test-state', m => {
    $('#gameMusic').classList.toggle('on', !!m.music); $('#gameSfx').classList.toggle('on', !!m.sfx);
  });
  $('#dark').oninput = () => { $('#darkv').textContent = Math.round($('#dark').value * 100) + '%'; sendAll(); };

  // ---------------- The palette tab ----------------
  function fillPicker() {
    const s = $('#palsel');
    s.innerHTML = '';
    const groups = [['starters', k => !data.palettes[k].hidden], ['locked', k => data.palettes[k].hidden]];
    for (const [label, f] of groups) {
      const g = el('optgroup', { label });
      for (const k of Object.keys(data.palettes).filter(f)) {
        const n = warnings(resolved(k)).length;
        g.append(el('option', { value: k, textContent: data.palettes[k].name + (n ? `  (${n} warning${n > 1 ? 's' : ''})` : '') }));
      }
      s.append(g);
    }
    s.value = sel;
  }
  function select(key) { if (!data.palettes[key]) return; sel = key; renderAll(); sendAll(); if (['layer', 'hit', 'boss'].includes(scene) && $('#corpsel').value === 'auto') runScene(scene); }
  $('#palsel').onchange = () => select($('#palsel').value);
  const stepSel = d => { const k = [...$('#palsel').options].map(o => o.value), i = k.indexOf(sel); select(k[(i + d + k.length) % k.length]); };
  $('#prev').onclick = () => stepSel(-1);
  $('#next').onclick = () => stepSel(1);

  // one color row: [name] [role] [picker] [#hex] [contrast]
  function colorRow(name, role, value, onSet, opts = {}) {
    const tr = el('tr', opts.inherited ? { className: 'inherited' } : {});
    const pick = el('input', { type: 'color', value, disabled: !!opts.locked });
    const hex = el('input', { type: 'text', value, className: 'hex mono', disabled: !!opts.locked, spellcheck: false });
    pick.oninput = () => { hex.value = pick.value; onSet(pick.value); };
    hex.oninput = () => { let v = hex.value.trim(); if (/^[0-9a-f]{6}$/i.test(v)) v = '#' + v; if (isHex(v)) { pick.value = v.toLowerCase(); onSet(v.toLowerCase()); } };
    const tdName = el('td', { className: 'name' });
    if (opts.toggle) tdName.append(opts.toggle);
    tdName.append(name);
    tr.append(tdName, el('td', { className: 'role', textContent: role }), el('td', {}, pick), el('td', {}, hex), el('td', { className: 'cr' }));
    if (opts.cr) { const c = contrast(value, opts.cr), need = NEED[name] || 3; tr.lastChild.innerHTML = `<span class="${c >= need ? 'good' : c >= need * 0.8 ? 'meh' : 'badc'}">${c.toFixed(2)}:1</span>`; tr.lastChild.title = `contrast on the background (want ${need})`; }
    return tr;
  }
  // ---------------- Randomizer ----------------
  // smart: a palette built by rules. A background (dark or light), a text ladder in one hue that
  // steps up in contrast (dim faint, mid readable, text easy, bright strongest), an accent from a
  // color-wheel scheme, danger kept reddish and money goldish (pushed away from the accent when they
  // land too close), and every color nudged lighter / darker until it meets its contrast target.
  // wild: every color random. Locked colors stay as they are (and smart builds around them).
  const locks = new Set();
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  const hsl = (H, S, L) => {   // H 0-360, S and L 0-1
    H = ((H % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * L - 1)) * S, x = c * (1 - Math.abs((H / 60) % 2 - 1)), m = L - c / 2;
    const [r, g, b] = H < 60 ? [c, x, 0] : H < 120 ? [x, c, 0] : H < 180 ? [0, c, x] : H < 240 ? [0, x, c] : H < 300 ? [x, 0, c] : [c, 0, x];
    return '#' + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
  };
  const hueOf = hex => {
    const [r, g, b] = rgb(hex).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (!d) return 0;
    const h0 = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h0 * 60 + 360) % 360;
  };
  const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
  // the lightness that gives this hue/saturation the wanted contrast on bg (or as close as it gets),
  // searching from the background's side toward the far end
  function toContrast(H, S, want, bg, dark) {
    // contrast grows as L moves away from the background: binary search for the first L that meets it
    const far = dark ? 1 : 0;
    if (contrast(hsl(H, S, far), bg) < want) return hsl(H, S, far);
    let a = dark ? 0 : 1, b = far;
    for (let i = 0; i < 24; i++) { const mL = (a + b) / 2; if (contrast(hsl(H, S, mL), bg) >= want) b = mL; else a = mL; }
    return hsl(H, S, b);
  }
  function smartPalette(p) {
    const tone = $('#rtone').value, keep = s => locks.has(s);
    const dark = keep('bg') ? lum(p.bg) < 0.4 : tone === 'dark' ? true : tone === 'light' ? false : Math.random() < 0.8;
    const H0 = keep('bg') ? hueOf(p.bg) : rnd(0, 360);
    const out = {};
    out.bg = keep('bg') ? p.bg : dark ? hsl(H0, rnd(0.15, 0.6), rnd(0.03, 0.09)) : hsl(H0, rnd(0.1, 0.45), rnd(0.9, 0.96));
    const bg = out.bg;
    // the text ladder: one hue (the background's, nudged a little), gentle saturation
    const Ht = H0 + rnd(-20, 20), St = rnd(0.08, 0.35);
    const ladder = { dim: rnd(1.35, 1.7), mid: rnd(3.4, 4.2), text: rnd(7, 9.5), bright: dark ? rnd(13, 17) : rnd(12, 15) };
    for (const s of ['dim', 'mid', 'text', 'bright']) out[s] = keep(s) ? p[s] : toContrast(Ht, s === 'bright' ? St * 0.5 : St, ladder[s], bg, dark);
    // the accent: a color-wheel scheme against the background's hue
    const scheme = pickOne([180, 150, 210, 120, 240, 30, -30]);
    const Ha = keep('accent') ? hueOf(p.accent) : H0 + scheme + rnd(-15, 15);
    out.accent = keep('accent') ? p.accent : toContrast(Ha, rnd(0.75, 1), rnd(5, 9), bg, dark);
    // danger: reddish, away from the accent's hue
    let Hd = rnd(345, 375);
    if (hueGap(Hd, Ha) < 35) Hd = Ha + (Math.random() < 0.5 ? 50 : -50);
    out.danger = keep('danger') ? p.danger : toContrast(Hd, rnd(0.75, 1), rnd(4, 6), bg, dark);
    out.dangerDim = keep('dangerDim') ? p.dangerDim : toContrast(hueOf(out.danger), rnd(0.4, 0.7), rnd(1.6, 2.3), bg, dark);
    // money: goldish, away from the accent and danger; otherwise the next free hue round the wheel
    let Hm = rnd(38, 55);
    for (let k = 0; k < 12 && (hueGap(Hm, Ha) < 40 || hueGap(Hm, hueOf(out.danger)) < 30); k++) Hm += 30;
    out.money = keep('money') ? p.money : toContrast(Hm, rnd(0.7, 0.95), rnd(5, 8), bg, dark);
    // rep: blue-violet, or lime when violet lands near the accent, money or danger
    let Hr = rnd(245, 270);
    if ([Ha, hueOf(out.danger), Hm].some(h => hueGap(Hr, h) < 35)) Hr = rnd(84, 100);
    out.rep = keep('rep') ? p.rep : toContrast(Hr, 0.85, rnd(4.5, 6.5), bg, dark);
    return out;
  }
  function wildPalette(p) {
    const out = {}, r = () => '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
    for (const [s] of BASE) out[s] = locks.has(s) ? p[s] : r();
    return out;
  }
  function randomize(fn) {
    const p = data.palettes[sel];
    lastPush = 0; before();   // always its own undo step
    const out = fn(p);
    Object.assign(p, out);
    changed(true);
  }
  $('#rsmart').onclick = () => randomize(smartPalette);
  $('#rwild').onclick = () => randomize(wildPalette);

  // a color change: update the data, the game, and the readouts (not the inputs being typed in)
  function setColor(fn) { before(); fn(); changed(false); }

  function renderPalette() {
    const p = data.palettes[sel], r = resolved(sel);
    fillPicker();
    $('#pname').value = p.name; $('#pnote').value = p.note || ''; $('#pkey').textContent = sel; $('#pstarter').checked = !p.hidden;
    const base = $('#baseslots'); base.innerHTML = '';
    for (const [s, role] of BASE) {
      const lock = el('input', { type: 'checkbox', checked: locks.has(s), title: 'lock: the randomizer leaves this one alone' });
      lock.onchange = () => { if (lock.checked) locks.add(s); else locks.delete(s); };
      base.append(colorRow(s, role, p[s], v => setColor(() => { p[s] = v; }), { cr: s === 'bg' ? null : p.bg, toggle: lock }));
    }
    $('#fweight').value = (p.font && p.font.weight) || ''; $('#fbold').value = (p.font && p.font.bold) || '';
    renderReadouts();
  }
  // the parts that follow the colors: contrast numbers, quick look, checks, look-alikes
  function renderReadouts() {
    const p = data.palettes[sel], r = resolved(sel);
    for (const tr of $('#baseslots').children) { const s = tr.firstChild.textContent; if (s !== 'bg') { const c = contrast(p[s], p.bg), need = NEED[s]; tr.lastChild.innerHTML = `<span class="${c >= need ? 'good' : c >= need * 0.8 ? 'meh' : 'badc'}">${c.toFixed(2)}:1</span>`; } }
    // quick look: a few lines in the palette's own colors
    const sp = (c, t, bold) => `<span style="color:${r[c]}${bold ? ';font-weight:700' : ''}">${t}</span>`;
    $('#sample').style.background = r.bg;
    $('#sample').innerHTML =
      sp('accent', 'NeoN+1', true) + ' ' + sp('dim', '// ' + r.name.toLowerCase()) + '\n' +
      sp('dim', '- - - - - - - - - - - - - - - -') + '\n' +
      sp('mid', 'LAYER ') + sp('bright', '04') + '   ' + sp('mid', 'INTEGRITY ') + sp('accent', '###') + sp('danger', '#') + '\n' +
      sp('text', 'PERIMETER SYS 2/4') + '  ' + sp('rep', 'REP 9') + '  ' + sp('money', 'CR 32') + '\n' +
      sp('danger', '> ICE. -1 integrity.') + '\n' +
      sp('text', 'a ') + sp('bright', 'real node', true) + sp('text', ', a ') + sp('danger', 'locked', false) + sp('text', ' one: ') + sp('dangerDim', '[INERT]') + '\n' +
      sp('accent', '[ JACK IN ]') + '  ' + sp('text', '[ CODEX ]') + '\n' +
      RAR.map(([s]) => chipHtml(s, s.toUpperCase())).join(' ');
    // checks
    const ws = warnings(r), ul = $('#checks'); ul.innerHTML = '';
    if (!ws.length) ul.append(el('li', { className: 'none', textContent: 'all clear' }));
    for (const w of ws) ul.append(el('li', { className: w.bad ? 'badc' : 'meh', textContent: w.text }));
    // look-alikes
    const sim = $('#similar'); sim.innerHTML = '';
    const near = Object.keys(data.palettes).filter(k => k !== sel).map(k => [likeness(r, resolved(k)), k]).filter(([d]) => d < 140).sort((a, b) => a[0] - b[0]);
    if (!near.length) sim.append(el('li', { className: 'none', textContent: 'no close look-alikes' }));
    for (const [d, k] of near) { const li = el('li', {}, el('a', { className: 'jump', textContent: data.palettes[k].name, onclick: () => select(k) }), ` (difference ${Math.round(d)}; under 140 reads as close)`); sim.append(li); }
  }
  $('#pname').oninput = () => { before(); data.palettes[sel].name = $('#pname').value; changed(false); fillPicker(); };
  $('#pnote').oninput = () => { before(); const v = $('#pnote').value; if (v) data.palettes[sel].note = v; else delete data.palettes[sel].note; changed(false); };
  $('#pstarter').onchange = () => { before(); const p = data.palettes[sel]; if ($('#pstarter').checked) delete p.hidden; else p.hidden = true; reorder(); changed(true); };
  const setFont = () => {
    before(); const p = data.palettes[sel], w = +$('#fweight').value || null, b = +$('#fbold').value || null;
    if (w || b) p.font = Object.assign({}, w ? { weight: w } : {}, b ? { bold: b } : {}); else delete p.font;
    changed(false);
  };
  $('#fweight').oninput = setFont; $('#fbold').oninput = setFont;

  // ---------------- All palettes ----------------
  function renderGrid() {
    const g = $('#grid'); g.innerHTML = '';
    const selR = resolved(sel);
    let keys = Object.keys(data.palettes);
    const f = $('#gridfilter').value;
    if (f === 'starters') keys = keys.filter(k => !data.palettes[k].hidden);
    if (f === 'locked') keys = keys.filter(k => data.palettes[k].hidden);
    if (f === 'warn') keys = keys.filter(k => warnings(resolved(k)).length);
    const sort = $('#gridsort').value;
    if (sort === 'like') keys.sort((a, b) => likeness(selR, resolved(a)) - likeness(selR, resolved(b)));
    if (sort === 'light') keys.sort((a, b) => lum(resolved(b).bg) - lum(resolved(a).bg));
    $('#gridcount').textContent = `${keys.length} palettes`;
    for (const k of keys) {
      const r = resolved(k), n = warnings(r).length;
      const sp = (c, t, bold) => `<span style="color:${r[c]}${bold ? ';font-weight:700' : ''}">${t}</span>`;
      const card = el('div', { className: 'card' + (k === sel ? ' sel' : ''), title: (r.note || '') + (n ? `\n${n} warning(s)` : '') });
      card.style.background = r.bg;
      card.innerHTML = `<span class="tag" style="color:${r.mid}">${data.palettes[k].hidden ? 'locked' : 'starter'}${n ? ' · ' + n + '!' : ''}</span>` +
        sp('bright', r.name, true) + '\n' + sp('text', 'text ') + sp('mid', 'mid ') + sp('dim', 'dim') + '\n' +
        sp('accent', '[ GO ]') + ' ' + sp('danger', 'ICE') + ' ' + sp('money', 'CR 32') + ' ' + sp('rep', 'REP') + '\n' +
        RAR.map(([s]) => chipHtml(s, s[0].toUpperCase())).join(' ');
      card.onclick = () => { select(k); showTab('pal'); };
      g.append(card);
    }
  }
  $('#gridfilter').onchange = renderGrid; $('#gridsort').onchange = renderGrid;

  // ---------------- Rarity chips ----------------
  const chipHtml = (r, text) => `<span class="c" style="color:${data.chips[r].fg};background:${data.chips[r].bg}">${text}</span>`;
  function renderShared() {
    const t = $('#chipslots'); t.innerHTML = '';
    for (const [s, role] of RAR) {
      // two rows per rarity: its text color (contrast against its own background) and its background
      t.append(colorRow(s, role + ': text', data.chips[s].fg, v => setColor(() => { data.chips[s].fg = v; renderChipGrid(); }), { cr: data.chips[s].bg }));
      t.append(colorRow(s, role + ': background (key color)', data.chips[s].bg, v => setColor(() => { data.chips[s].bg = v; renderChipGrid(); })));
    }
    renderChipGrid();
  }
  function renderChipGrid() {
    const g = $('#chipgrid'); g.innerHTML = '';
    for (const k of Object.keys(data.palettes)) {
      const p = data.palettes[k], row = el('div', { className: 'chiprow' });
      row.style.background = p.bg;
      row.innerHTML = `<span style="color:${p.text}">${p.name.padEnd(12).replace(/ /g, '&nbsp;')}</span>` + RAR.map(([s]) => chipHtml(s, s.toUpperCase())).join('');
      g.append(row);
    }
  }

  // ---------------- Player styles ----------------
  function renderStyles() {
    const t = $('#styles'); t.innerHTML = '';
    data.styles.forEach((s, i) => {
      const chip = el('span', { className: 'chip', textContent: ` <#> ${s.name} ` });
      const paint = () => { chip.style.color = s.fg; chip.style.background = s.bg; };
      paint();
      const name = el('input', { type: 'text', value: s.name, size: 9 });
      name.oninput = () => { before(); s.name = name.value.toUpperCase(); chip.textContent = ` <#> ${s.name} `; changed(false); };
      const pick = (k) => { const p = el('input', { type: 'color', value: s[k] }); p.oninput = () => { before(); s[k] = p.value; paint(); changed(false); }; return p; };
      const c = contrast(s.fg, s.bg);
      t.append(el('tr', {}, el('td', { className: 'mono', textContent: String(i + 1).padStart(2) }), el('td', {}, name), el('td', {}, 'text ', pick('fg')), el('td', {}, 'back ', pick('bg')), el('td', {}, chip),
        el('td', { className: c >= 4.5 ? 'good' : c >= 3 ? 'meh' : 'badc', textContent: c.toFixed(2) + ':1' })));
    });
  }
  $('#addstyle').onclick = () => { before(); data.styles.push({ name: 'NEW', fg: '#ffffff', bg: '#333333' }); changed(true); };

  // ---------------- Tabs, rendering, files ----------------
  let tab = 'pal';
  function showTab(name) {
    tab = name;
    for (const b of document.querySelectorAll('#tabs button')) b.classList.toggle('on', b.dataset.tab === name);
    for (const t of document.querySelectorAll('.tab')) t.classList.toggle('show', t.id === 'tab-' + name);
    renderTab();
  }
  for (const b of document.querySelectorAll('#tabs button')) b.onclick = () => showTab(b.dataset.tab);
  function renderTab() { if (tab === 'pal') renderPalette(); if (tab === 'all') renderGrid(); if (tab === 'rar') renderShared(); if (tab === 'sty') renderStyles(); }
  function renderAll() { fillCorps(); renderTab(); renderFileState(); }
  // full: rebuild the form (structure changed); otherwise just the readouts, so typing isn't interrupted
  function changed(full) {
    sendAll();
    if (full) renderAll();
    else { if (tab === 'pal') renderReadouts(); renderFileState(); }
  }

  let handle = null;   // the palettes.js file on disk (Chrome / Edge)
  function renderFileState() {
    const d = dirty();
    $('#filestate').innerHTML = (handle ? `file: <span class="mono">${handle.name}</span>` : 'file: not linked yet (save asks for dist/data/palettes.js)') + (d ? ' · <b>unsaved changes</b>' : ' · saved');
    $('#undo').disabled = !undo.length; $('#redo').disabled = !redo.length;
    document.title = (d ? '* ' : '') + 'NeoN+1 editor';
  }
  const toast = t => NEON_ED.toast(t, 2200);

  // remember the linked file between sessions (IndexedDB can store file handles)
  const idb = NEON_ED.idb('neon-palette-editor', 1);
  const rememberHandle = h => idb('readwrite', s => s.put(h, 'palettes-data')).catch(() => {});
  idb('readonly', s => s.get('palettes-data')).then(h => { if (h) { handle = h; renderFileState(); } }).catch(() => {});

  async function ensureHandle() {
    if (handle) {
      if ((await handle.queryPermission({ mode: 'readwrite' })) === 'granted' || (await handle.requestPermission({ mode: 'readwrite' })) === 'granted') return handle;
    }
    const [h] = await window.showOpenFilePicker({ id: 'neon-palettes', types: [{ description: 'palettes.js', accept: { 'text/javascript': ['.js'] } }] });
    if (h.name !== 'palettes.js' && !confirm(`That file is ${h.name}, not palettes.js. Use it anyway?`)) throw new Error('cancelled');
    if ((await h.requestPermission({ mode: 'readwrite' })) !== 'granted') throw new Error('no permission to write the file');
    handle = h; rememberHandle(h);
    return h;
  }
  const download = text => NEON_ED.download('palettes.js', text);
  async function save() {
    reorder();
    const text = fileText();
    if (!window.showOpenFilePicker) { download(text); saved = JSON.stringify(data); renderFileState(); toast('downloaded palettes.js (this browser cannot write files directly)'); return; }
    try {
      const h = await ensureHandle();
      const w = await h.createWritable();
      await w.write(text); await w.close();
      saved = JSON.stringify(data); renderFileState();
      toast('saved ' + h.name);
    } catch (e) { NEON_ED.failed('save', e); }
  }
  async function reloadFile() {
    if (dirty() && !confirm('Drop your unsaved changes and load the file again?')) return;
    try {
      let text;
      if (window.showOpenFilePicker) { const h = await ensureHandle(); text = await (await h.getFile()).text(); }
      else { location.reload(); return; }
      data = clone(parseFile(text)); saved = JSON.stringify(data); undo = []; redo = [];
      if (!data.palettes[sel]) sel = Object.keys(data.palettes)[0];
      renderAll(); sendAll(); toast('loaded ' + handle.name);
    } catch (e) { NEON_ED.failed('reload', e); }
  }
  async function exportText() {
    reorder();
    const text = fileText();
    try { await navigator.clipboard.writeText(text); toast('copied palettes.js to the clipboard (and downloaded it)'); } catch (e) { toast('downloaded palettes.js'); }
    download(text);
  }
  $('#save').onclick = save; $('#reload').onclick = reloadFile; $('#export').onclick = exportText;
  $('#undo').onclick = () => stepHistory(undo, redo); $('#redo').onclick = () => stepHistory(redo, undo);
  document.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey;
    if (document.body.classList.contains('mode-art') || document.body.classList.contains('mode-tut') || document.body.classList.contains('mode-econ') || document.body.classList.contains('mode-fx')) return;   // the art, training, economy and fx tabs have their own keys
    if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
    else if (mod && e.key.toLowerCase() === 'z' && !(e.target.matches && e.target.matches('input[type=text]'))) { e.preventDefault(); e.shiftKey ? stepHistory(redo, undo) : stepHistory(undo, redo); }
    else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); stepHistory(redo, undo); }
  });
  window.addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });

  // a check that what we write reads back the same (the editor never changes colors on its own)
  try { const back = parseFile(fileText()); if (JSON.stringify(back.palettes) !== JSON.stringify(data.palettes)) console.warn('palette editor: the file writer does not round-trip'); } catch (e) { console.warn(e); }

  renderAll();
  loadGame();
  window.__editor = { fileText, get data() { return data; } };   // for tests

  // ---------------- The bridge for the music mode ----------------
  // Show a corp in the game: its own palette when it has one, then one of its layers (or the boss / a miss, if
  // that's what's up). The music mode asks for this when you pick a corp.
  window.NE = {
    toGame, runScene, ready: () => gameReady, scene: () => scene,
    showCorp(corp) {
      const pk = 'c_' + corp;
      if (data.palettes[pk]) { $('#corpsel').value = 'auto'; sel = pk; renderAll(); sendAll(); }
      else $('#corpsel').value = CORPS[corp] ? corp : 'auto';
      runScene(['layer', 'hit', 'boss'].includes(scene) ? scene : 'layer');
    },
  };
})();
