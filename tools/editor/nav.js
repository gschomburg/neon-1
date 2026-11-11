// NeoN+1 tools/editor/nav.js: the neon editor's frame (tools/neon_editor.html): the tab picker, the divider between
// the game and the tabs, and the game frame's size. Loads last, after every tab script, so the first tab switch
// reaches every listener.
//
// A tab switch is the 'neon-mode' event on document (detail: the tab's key). body gets the class mode-<key>
// (the CSS shows that tab's <section>; common.js saveKey and a few tabs check it).
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { /* private mode */ } return null; };

  // ---------- the tab picker ----------
  // [key, label]: groups in the dropdown. The keys match the <section id>s (pal is #panel) and help.js's HELP.
  const GROUPS = [
    ['on the running game', [['test', 'testing'], ['g0d', 'g0d prototypes']]],
    ['edit a data file', [['pal', 'palette'], ['art', 'art'], ['tut', 'training'], ['econ', 'economy'], ['fx', 'fx']]],
    ['look up', [['music', 'music'], ['items', 'gear & mods'], ['ads', 'ads'], ['hack', 'hackers'], ['term', 'terminal']]],
  ];
  const KEYS = GROUPS.flatMap(g => g[1].map(t => t[0]));
  const sel = $('#modeSel');
  for (const [name, tabs] of GROUPS) {
    const og = document.createElement('optgroup'); og.label = name;
    for (const [k, label] of tabs) og.append(new Option(label, k));
    sel.append(og);
  }
  const setMode = m => {
    if (!KEYS.includes(m)) m = 'music';
    for (const k of KEYS) document.body.classList.toggle('mode-' + k, m === k);
    sel.value = m;
    store('neon.editor.mode', m);
    document.dispatchEvent(new CustomEvent('neon-mode', { detail: m }));
  };
  sel.onchange = () => setMode(sel.value);
  // Alt + up / down: the tab before / after
  addEventListener('keydown', e => {
    if (!e.altKey || !['ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const i = KEYS.indexOf(sel.value) + (e.key === 'ArrowDown' ? 1 : -1);
    setMode(KEYS[(i + KEYS.length) % KEYS.length]);
  });
  window.NEON_ED.setMode = setMode;

  // ---------- the game frame: its size, scaled down when the column is narrower ----------
  const stage = $('#stage'), wrap = $('#framewrap'), frame = $('#game'), widthSel = $('#width');
  const fitFrame = () => {
    const ww = wrap.clientWidth, wh = wrap.clientHeight;
    if (!ww || !wh) return;
    const w = widthSel.value === 'fit' ? ww : +widthSel.value, s = Math.min(1, ww / w);
    frame.style.width = w + 'px';
    frame.style.height = (wh / s) + 'px';
    frame.style.transform = s < 1 ? `scale(${s})` : '';
    frame.style.left = Math.max(0, (ww - w * s) / 2) + 'px';
    $('#frameScale').textContent = s < 1 ? Math.round(s * 100) + '%' : '';
  };
  new ResizeObserver(fitFrame).observe(wrap);
  widthSel.onchange = () => { store('neon.editor.frame', widthSel.value); fitFrame(); };
  { const f = store('neon.editor.frame'); if (f && [...widthSel.options].some(o => o.value === f)) widthSel.value = f; }

  // ---------- the divider: drag it to share the width; double-click: back to the frame's own width ----------
  const MIN_STAGE = 260, MIN_RIGHT = 380;
  const fitStage = w => Math.round(Math.max(MIN_STAGE, Math.min(w, innerWidth - MIN_RIGHT)));
  const natural = () => (widthSel.value === 'fit' ? 480 : +widthSel.value) + 24;
  let stageW = +store('neon.editor.split') || natural();
  const place = () => { stage.style.width = fitStage(stageW) + 'px'; };
  const split = $('#split');
  split.addEventListener('pointerdown', e => {
    e.preventDefault();
    split.setPointerCapture(e.pointerId);
    document.body.classList.add('dragging');   // (the iframe would swallow the pointer)
    const x0 = e.clientX, w0 = stage.offsetWidth;
    const move = ev => { stageW = fitStage(w0 + ev.clientX - x0); place(); };
    const up = () => {
      split.removeEventListener('pointermove', move); split.removeEventListener('pointerup', up); split.removeEventListener('pointercancel', up);
      document.body.classList.remove('dragging');
      store('neon.editor.split', stageW);
    };
    split.addEventListener('pointermove', move); split.addEventListener('pointerup', up); split.addEventListener('pointercancel', up);
  });
  split.addEventListener('dblclick', () => { stageW = natural(); place(); store('neon.editor.split', stageW); });
  addEventListener('resize', place);
  place();

  setMode(store('neon.editor.mode') || 'music');
})();
