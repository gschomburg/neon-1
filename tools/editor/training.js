// ---------------- Training: what POPS says in the training run (dist/data/tutorial.js) ----------------
// Every line in order, grouped by part. Edits go to the game as you type (a popup that's up changes
// right away). "show" plays the training in the game to that line (engine/tutorial.js skips the lines
// before it and does what they ask); back / next step through. "save" writes the file (tools/tutorial_file.js).
(() => {
  const $ = s => document.querySelector(s);
  const F = window.NEON_TUT_FILE;
  if (typeof TUT_COPY === 'undefined' || !F) { $('#tList').textContent = "Couldn't load ../dist/data/tutorial.js or tutorial_file.js."; return; }
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clone = o => JSON.parse(JSON.stringify(o));
  const build = ((window.NEON_FILES || []).find(f => f[0] === 'data/tutorial.js') || [])[1] || 'v0';
  let copy = clone(TUT_COPY), saved = clone(copy), game = { on: false, id: null, last: null, auto: null }, dir = null;
  const toast = t => { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2400); };
  const toGame = m => { try { $('#game').contentWindow.postMessage(Object.assign({ to: 'neon-game' }, m), '*'); } catch (e) { /* not loaded */ } };
  const dirty = () => F.text(copy, build) !== F.text(saved, build);
  let sendT = 0;
  const sendCopy = () => { clearTimeout(sendT); sendT = setTimeout(() => toGame({ type: 'tut-copy', copy }), 120); };
  const idx = id => copy.findIndex(l => l.id === id);
  const jump = id => { if (!id) return; toGame({ type: 'tut-jump', id }); toast('playing to ' + id); };
  const cur = () => game.id || game.last;

  // the list: built once (and on reload), then kept up to date in place so typing keeps its focus
  function renderList() {
    $('#tList').innerHTML = copy.map((l, i) => {
      if (l.of) {   // said in place of another popup's do-this line (a wrong tap, the boss beaten)
        return (l.part ? '<h2>' + esc(l.part) + '</h2>' : '') +
          '<div class="tl" data-i="' + i + '"><div class="th"><b>' + esc(l.id) + '</b><span class="k">swaps into ' + esc(l.of) + "'s do-this line</span>" +
          '<button class="go" title="Play the training in the game to that popup">show</button></div>' +
          '<textarea data-f="text" rows="' + Math.max(2, (l.text.match(/\n/g) || []).length + 1) + '">' + esc(l.text) + '</textarea>' +
          '<div class="row2">one way to say it per line: one is picked at random</div><div class="warn"></div></div>';
      }
      const waits = 'act' in l;
      const kind = waits ? (l.text ? 'explains, then POPS shrinks to the do-this line' : 'POPS shrinks to the do-this line') : l.timer ? 'banter: moves on by itself' : 'tap to go on';
      const arrowBox = '<label title="On a popup that points at something: draw the arrow (off: it still sits by it)"><input type="checkbox" data-f="arrow"' + (l.arrow === false ? '' : ' checked') + '> arrow</label> ';
      return (l.part ? '<h2>' + esc(l.part) + '</h2>' : '') +
        '<div class="tl" data-i="' + i + '"><div class="th"><b>' + esc(l.id) + '</b><span class="k">' + kind + '</span>' +
        '<button class="go" title="Play the training in the game to this line">show</button></div>' +
        '<textarea data-f="text" rows="' + Math.max(2, Math.ceil(l.text.length / 60) + (l.text.match(/\n/g) || []).length) + '" placeholder="(nothing: just the do-this line)">' + esc(l.text) + '</textarea>' +
        '<div class="row2">' + arrowBox + (waits
          ? 'do this: <input class="act" data-f="act" value="' + esc(l.act) + '" placeholder="about 3 words">'
          : '<label title="Timed: it moves on by itself after the time (a tap still skips it). Not timed: it waits for a tap."><input type="checkbox" data-f="timed"' + (l.timer ? ' checked' : '') + '> timed</label>' +
            '<input class="timer" data-f="timer" type="number" min="500" step="500" value="' + (l.timer || 4000) + '"' + (l.timer ? '' : ' disabled') + '> ms') +
        '</div><div class="warn"></div></div>';
    }).join('');
    marks();
  }
  function marks() {
    const c = cur();
    for (const el of document.querySelectorAll('#tList .tl')) {
      const i = +el.dataset.i, l = copy[i];
      el.classList.toggle('on', !!c && (l.id === c || l.of === c));
      el.classList.toggle('ch', JSON.stringify(l) !== JSON.stringify(saved[i]));
      el.querySelector('.warn').textContent = F.problems(l).join('; ');
    }
    const d = dirty();
    $('#tFile').textContent = (dir ? dir.name + '/' : 'dist/data/') + 'tutorial.js · ' + (d ? 'unsaved' : 'saved');
    $('#tFile').classList.toggle('dirty', d);
    $('#tAt').innerHTML = !game.on ? 'the training isn\'t running' : game.auto ? 'playing to <b>' + esc(game.auto) + '</b>...' : game.id ? 'up now: <b>' + esc(game.id) + '</b>' : game.last ? 'after <b>' + esc(game.last) + '</b>' : 'starting...';
  }
  $('#tList').addEventListener('input', e => {
    const el = e.target.closest('[data-f]'), box = e.target.closest('.tl');
    if (!el || !box) return;
    const l = copy[+box.dataset.i], f = el.dataset.f;
    const tIn = box.querySelector('input.timer');
    if (f === 'arrow') { if (el.checked) delete l.arrow; else l.arrow = false; }
    else if (f === 'timed') {   // on: it moves on by itself after the time in the box; off: it waits for a tap
      if (el.checked) l.timer = Math.max(500, Math.round(+tIn.value) || 4000); else delete l.timer;
      tIn.disabled = !el.checked;
      box.querySelector('.th .k').textContent = l.timer ? 'banter: moves on by itself' : 'tap to go on';
    } else if (f === 'timer') { const v = Math.round(+el.value); if (v > 0) l.timer = v; }
    else l[f] = el.value;
    sendCopy(); marks();
  });
  $('#tList').addEventListener('click', e => {
    const b = e.target.closest('.go'), box = e.target.closest('.tl');
    if (b && box) { const l = copy[+box.dataset.i]; jump(l.of || l.id); }
  });
  $('#tStart').onclick = () => jump(copy[0].id);
  // back / next: the popups before / after this one (the swap-in lines aren't popups of their own)
  const step = d => { let i = idx(cur()); do i += d; while (i > 0 && i < copy.length - 1 && copy[i].of); jump(copy[clamp(i, 0, copy.length - 1)].id); };
  $('#tBack').onclick = () => step(-1);
  $('#tNext').onclick = () => step(1);

  // the game: our lines when it (re)loads, and which line is up
  window.addEventListener('message', e => {
    const m = e.data;
    if (!m || m.from !== 'neon-game') return;
    if (m.type === 'ready') sendCopy();
    if (m.type === 'tut-at') {
      game = m; marks();
      const on = document.querySelector('#tList .tl.on');
      if (on && document.body.classList.contains('mode-tut') && !on.contains(document.activeElement)) on.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });

  // saving: Chrome's file access, the dist/data folder (picked once, remembered)
  const idb = (mode, fn) => new Promise((res, rej) => {
    const open = indexedDB.open('neon-tut-editor', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('h');
    open.onerror = () => rej(open.error);
    open.onsuccess = () => { const tx = open.result.transaction('h', mode), r = fn(tx.objectStore('h')); tx.oncomplete = () => res(r && r.result); tx.onerror = () => rej(tx.error); };
  });
  idb('readonly', s => s.get('datadir')).then(h => { if (h) { dir = h; marks(); } }).catch(() => {});
  async function ensureDir() {
    if (dir && ((await dir.queryPermission({ mode: 'readwrite' })) === 'granted' || (await dir.requestPermission({ mode: 'readwrite' })) === 'granted')) return dir;
    toast('pick the dist/data folder');
    const h = await window.showDirectoryPicker({ id: 'neon-data', mode: 'readwrite' });
    let ok = true; try { await h.getFileHandle('tutorial.js'); } catch (e) { ok = false; }
    if (!ok && !confirm('The folder ' + h.name + ' has no tutorial.js: is it dist/data? Use it anyway?')) throw new Error('cancelled');
    dir = h; idb('readwrite', s => s.put(h, 'datadir')).catch(() => {});
    return h;
  }
  async function saveFile() {
    if (!dirty()) return toast('nothing to save');
    const bad = copy.filter(l => F.problems(l).length);
    if (bad.length && !confirm(bad.length + ' line(s) have notes (' + bad.slice(0, 3).map(l => l.id).join(', ') + '). Save anyway?')) return;
    const text = F.text(copy, build);
    if (!window.showDirectoryPicker) {
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/javascript' })), download: 'tutorial.js' });
      document.body.append(a); a.click(); a.remove(); saved = clone(copy); marks(); toast('downloaded tutorial.js'); return;
    }
    try {
      const d = await ensureDir(), h = await d.getFileHandle('tutorial.js', { create: true }), w = await h.createWritable();
      await w.write(text); await w.close();
      saved = clone(copy); marks(); toast('saved tutorial.js');
    } catch (e) { if (e.name !== 'AbortError' && e.message !== 'cancelled') toast('save failed: ' + e.message); }
  }
  async function reload() {
    if (dirty() && !confirm('Drop your unsaved training changes and load the file again?')) return;
    try {
      if (!window.showDirectoryPicker) { location.reload(); return; }
      const d = await ensureDir(), t = await (await (await d.getFileHandle('tutorial.js')).getFile()).text();
      copy = clone(F.parse(t)); saved = clone(copy); renderList(); sendCopy(); toast('loaded tutorial.js');
    } catch (e) { if (e.name !== 'AbortError' && e.message !== 'cancelled') toast('reload failed: ' + e.message); }
  }
  $('#tSave').onclick = saveFile;
  $('#tReload').onclick = reload;
  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('mode-tut')) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveFile(); }
  });
  window.addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
  renderList();
})();
