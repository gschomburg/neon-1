// ---------------- Art: the art files in dist/data/art/ (glyphs, logos, world map), edited here or in asXii ----------------
// The list on the left, the piece on the right: a preview inside its size limit, a text box, its details (a glyph's
// name and lore, a logo's id / name / mark / kind), and buttons to send it to asXii (it comes back with asXii's
// "send back to NeoN+1"), copy / paste, and show it in the game. Changes go to the game live; "save" writes the
// files that changed (tools/data/art_file.js makes the text). "+ glyph" and "+ logo" add new ones at the end.
(() => {
  const { $, toGame, toast, esc, clone } = NEON_ED;
  const F = window.NEON_ART_FILE;
  if (typeof ART_GLYPHS === 'undefined' || typeof ART_LOGOS === 'undefined' || typeof ART_MAP === 'undefined' || !F) {
    $('#aDetail').textContent = "Couldn't load ../dist/data/art/*.js or art_file.js."; return;
  }
  let art = clone({ glyphs: ART_GLYPHS, special: ART_SPECIAL, logos: ART_LOGOS, map: ART_MAP, faces: typeof ART_FACES !== 'undefined' ? ART_FACES : {}, root: typeof ART_ROOT !== 'undefined' ? ART_ROOT : {} });
  let saved = clone(art), sel = null, q = '';
  let build = NEON_ED.buildOf('data/art/logos.js');
  let corpNames = {};
  const fileOf = { glyphs: 'glyphs.js', special: 'glyphs.js', logos: 'logos.js', map: 'worldmap.js', faces: 'faces.js', root: 'root.js' };
  const texts = a => F.files(a, build);
  const changedFiles = () => { const a = texts(art), b = texts(saved); return Object.keys(a).filter(f => a[f] !== b[f]); };
  const dirty = () => changedFiles().length > 0;
  const CORPS_ = typeof CORPS !== 'undefined' ? CORPS : {};   // (a top-level const: not on window)
  const corpName = k => k === 'omni' ? 'OMNI//CORE' : (corpNames[k] || (CORPS_[k] && CORPS_[k].name) || k);
  const corpKeys = () => [...Object.keys(CORPS_).sort((a, b) => corpName(a).localeCompare(corpName(b))), 'omni'];

  // every piece: { id, kind, i or k, label, sub }
  const pieces = () => [
    ...art.glyphs.map((g, i) => ({ id: 'glyphs:' + i, kind: 'glyphs', i, label: g.name || 'glyph ' + (i + 1), isNew: i >= saved.glyphs.length })),
    ...Object.keys(art.special).map(k => ({ id: 'special:' + k, kind: 'special', k, label: art.special[k].name || k })),
    ...art.logos.map((l, i) => ({ id: 'logos:' + i, kind: 'logos', i, label: l.name || l.id, sub: l.kind, isNew: !saved.logos.some(s => s.id === l.id) })),
    ...Object.keys(art.faces).map(k => ({ id: 'faces:' + k, kind: 'faces', k, label: art.faces[k].name || k })),
    ...Object.keys(art.root).map(k => ({ id: 'root:' + k, kind: 'root', k, label: art.root[k].name || k })),
    { id: 'map:', kind: 'map', label: 'WORLD MAP' },
  ];
  const itemOf = p => p.kind === 'glyphs' ? art.glyphs[p.i] : p.kind === 'special' ? art.special[p.k] : p.kind === 'faces' ? art.faces[p.k] : p.kind === 'root' ? art.root[p.k] : p.kind === 'logos' ? art.logos[p.i] : null;
  const getRows = p => p.kind === 'map' ? art.map : itemOf(p).art;
  const setRowsRaw = (p, rows) => { if (p.kind === 'map') art.map = rows; else itemOf(p).art = rows; };
  const setRows = (p, rows) => { setRowsRaw(p, rows); sendLive(p.kind); render(); };
  const savedItem = p => p.kind === 'glyphs' ? saved.glyphs[p.i] : p.kind === 'special' ? saved.special[p.k] : p.kind === 'faces' ? saved.faces[p.k] : p.kind === 'root' ? saved.root[p.k] : p.kind === 'logos' ? saved.logos.find(s => s.id === itemOf(p).id) : null;
  const savedRows = p => p.kind === 'map' ? saved.map : (savedItem(p) || {}).art;
  const isChanged = p => p.kind === 'map' ? JSON.stringify(art.map) !== JSON.stringify(saved.map) : JSON.stringify(itemOf(p)) !== JSON.stringify(savedItem(p) || null);
  const findPiece = id => pieces().find(p => p.id === id);
  const problems = p => [...F.artProblems(p.kind, getRows(p)), ...(p.kind === 'logos' ? F.logoProblems(itemOf(p), art.logos) : [])];

  // live in the game (debounced): only what changed
  let liveT = null, liveKinds = new Set();
  function sendLive(kind) {
    liveKinds.add(kind);
    clearTimeout(liveT);
    liveT = setTimeout(() => { const a = {}; for (const k of liveKinds) a[k] = art[k]; liveKinds.clear(); toGame({ type: 'art', art: a }); }, 150);
  }
  window.addEventListener('message', e => {
    const m = e.data;
    if (!m) return;
    if (m.from === 'neon-game' && m.type === 'ready') {
      if (m.version) build = m.version;
      corpNames = m.corpNames || {};
      if (dirty()) toGame({ type: 'art', art });   // a reloaded game gets the unsaved art back
      render();
    }
    if (m.from === 'asxii') fromAsxii(m, e.source);
  });

  // ---- asXii: it opens in its own tab; "send back to NeoN+1" there posts the art here
  let ax = null, axReady = false, pending = null;
  const asDrawn = rows => {   // glyphs go over the way the game draws them: each line centered, 1 line in the middle, 2 at the top
    let r = rows.slice(0, 3);
    if (r.length === 1) r = ['', r[0], '']; else if (r.length === 2) r = [r[0], r[1], ''];
    return r.map(l => { l = l.slice(0, 5); const pad = 5 - l.length, left = Math.floor(pad / 2); return ' '.repeat(left) + l + ' '.repeat(pad - left); });
  };
  const loadMsg = p => { const k = F.KINDS[p.kind], rows = getRows(p);
    return { to: 'asxii', type: 'load', id: p.id, name: p.label, label: k.label, rows: p.kind === 'glyphs' || p.kind === 'special' ? asDrawn(rows) : rows, w: k.w, h: k.h, note: k.note }; };
  function editInAsxii(p) {
    pending = loadMsg(p);
    if (ax && !ax.closed && axReady) { ax.postMessage(pending, '*'); try { ax.focus(); } catch (e) { /* */ } pending = null; toast('sent to asXii'); return; }
    axReady = false;
    ax = window.open('../ascii-editor/dist/index.html?neon=1', 'neon-asxii');
    if (!ax) toast('the browser blocked the asXii tab: allow pop-ups for this page');
  }
  function fromAsxii(m, src) {
    if (m.type === 'ready') { ax = src || ax; axReady = true; if (pending && ax) { ax.postMessage(pending, '*'); pending = null; } }
    if (m.type === 'art') {
      const p = findPiece(m.id);
      if (!p) return toast("asXii sent art for something that isn't in the list any more");
      setRows(p, F.rowsFromText(p.kind, m.text));
      sel = p.id; render(); toast(`${p.label}: back from asXii`);
      try { window.focus(); } catch (e) { /* */ }
    }
  }

  // ---- adding and removing
  function addGlyph() {
    art.glyphs.push({ name: 'NEW GLYPH', lore: ['a line of lore.'], art: ['', ' ? ', ''] });
    sel = 'glyphs:' + (art.glyphs.length - 1); sendLive('glyphs'); render();
  }
  function addLogo() {
    let n = 1; while (art.logos.some(l => l.id === 'new_' + n)) n++;
    art.logos.push({ id: 'new_' + n, name: 'NEW LOGO', mark: '[?]', kind: 'player', art: ['  .---.', ' ( ? ? )', "  '---'"] });
    sel = 'logos:' + (art.logos.length - 1); sendLive('logos'); render();
  }
  function remove(p) {
    if (p.kind === 'glyphs') {
      if (!p.isNew) return toast("saved glyphs can't be removed here (the codex keeps them by place)");
      art.glyphs.splice(p.i, 1);
    } else if (p.kind === 'logos') {
      const l = itemOf(p);
      if (!p.isNew && !confirm(`Remove the logo ${l.name} (${l.id})? Profiles that use it fall back to the first logo.` + (l.kind === 'corp' ? ' Its corp loses its intro art.' : ''))) return;
      art.logos.splice(p.i, 1);
    } else return;
    sel = null; sendLive(p.kind); render();
  }
  function moveLogo(p, d) {
    const j = p.i + d; if (j < 0 || j >= art.logos.length) return;
    const [l] = art.logos.splice(p.i, 1); art.logos.splice(j, 0, l);
    sel = 'logos:' + j; sendLive('logos'); render();
  }

  // ---- the files: pick the dist/data/art folder once; save writes only the files that changed
  const artDir = NEON_ED.folder({ db: 'neon-art-editor', version: 2, key: 'artdir', id: 'neon-art', label: 'dist/data/art' });
  artDir.on(renderFile);
  const ensureDir = () => artDir.ensure('logos.js'), download = NEON_ED.download;
  async function save() {
    const files = changedFiles();
    if (!files.length) return toast('nothing to save');
    const bad = pieces().filter(p => problems(p).length);
    if (bad.length && !confirm(`${bad.length} piece(s) have problems (${bad.slice(0, 3).map(p => p.label).join(', ')}...). Save anyway?`)) return;
    const t = texts(art);
    if (!window.showDirectoryPicker) { for (const f of files) download(f, t[f]); saved = clone(art); render(); toast('downloaded ' + files.join(', ')); return; }
    try {
      const d = await ensureDir();
      for (const f of files) { const h = await d.getFileHandle(f, { create: true }), w = await h.createWritable(); await w.write(t[f]); await w.close(); }
      saved = clone(art); render(); toast('saved ' + files.join(', '));
    } catch (e) { if (e.name !== 'AbortError' && e.message !== 'cancelled') toast('save failed: ' + e.message); }
  }
  async function reload() {
    if (dirty() && !confirm('Drop your unsaved art changes and load the files again?')) return;
    try {
      if (!window.showDirectoryPicker) { location.reload(); return; }
      const d = await ensureDir(), t = {};
      for (const f of ['glyphs.js', 'logos.js', 'worldmap.js']) t[f] = await (await (await d.getFileHandle(f)).getFile()).text();
      try { t['faces.js'] = await (await (await d.getFileHandle('faces.js')).getFile()).text(); } catch (e) { t['faces.js'] = null; }
      try { t['root.js'] = await (await (await d.getFileHandle('root.js')).getFile()).text(); } catch (e) { t['root.js'] = null; }
      art = clone(F.parse(t)); art.faces = art.faces || {}; art.root = art.root || {}; saved = clone(art); sel = null; render(); toGame({ type: 'art', art }); toast('loaded the art files');
    } catch (e) { if (e.name !== 'AbortError' && e.message !== 'cancelled') toast('reload failed: ' + e.message); }
  }
  function renderFile() {
    const f = $('#aFile'), ch = changedFiles();
    f.textContent = artDir.where() + (ch.length ? ' · unsaved: ' + ch.join(', ') : ' · saved');
    f.classList.toggle('dirty', ch.length > 0);
  }

  // ---- drawing
  const GROUPS = [
    ['glyphs', p => p.kind === 'glyphs', 'node glyphs'],
    ['special', p => p.kind === 'special', 'special node glyphs'],
    ['player logos', p => p.kind === 'logos' && p.sub === 'player', 'player logos (everyone has them)'],
    ['corp logos', p => p.kind === 'logos' && p.sub === 'corp', 'corp logos (also the intro art; unlocked by beating the corp)'],
    ['hacker logos', p => p.kind === 'logos' && p.sub === 'hacker', "hackers' logos (data/hackers.js; a bad hacker's is unlocked by beating them)"],
    ['other logos', p => p.kind === 'logos' && !F.LOGO_KINDS.includes(p.sub), ''],
    ['hacker faces', p => p.kind === 'faces', "hackers' faces, 5 x 3 (POPS's is the training handler's)"],
    ['sector clear', p => p.kind === 'root', 'the SECTOR CLEARED pictures, up to 30 x 13 (one at random each time)'],
    ['map', p => p.kind === 'map', 'intro world map'],
  ];
  function renderList() {
    const all = pieces().filter(p => !q || p.label.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.kind === 'logos' && (itemOf(p).id + ' ' + itemOf(p).mark).toLowerCase().includes(q)));
    $('#aList').innerHTML = GROUPS.map(([name, test, title]) => {
      const g = all.filter(test);
      if (!g.length) return '';
      return `<h2 title="${esc(title)}">${esc(name)} <small>${g.length}</small></h2>` + g.map(p => {
        const rows = getRows(p), small = p.kind === 'glyphs' || p.kind === 'special' || p.kind === 'faces';
        const tag = p.kind === 'logos' ? `<pre>${esc(itemOf(p).mark)}</pre>` : small ? `<pre>${esc(rows.join('\n'))}</pre>` : '';
        return `<div class="ai${p.id === sel ? ' on' : ''}" data-id="${esc(p.id)}">${tag}<span>${esc(p.label)}</span>${p.isNew ? '<i title="new, not saved">new</i>' : isChanged(p) ? '<i title="changed, not saved">*</i>' : ''}${problems(p).length ? '<b title="' + esc(problems(p).join('; ')) + '">!</b>' : ''}</div>`;
      }).join('');
    }).join('') || '<p class="note" style="padding:0 12px">nothing matches.</p>';
  }
  const field = (label, id, value, attrs = '') => `<label class="af"><span>${label}</span><input type="text" id="${id}" value="${esc(value)}" ${attrs} autocomplete="off" spellcheck="false"></label>`;
  function renderDetail() {
    const p = sel && findPiece(sel), d = $('#aDetail');
    if (!p) { d.innerHTML = '<p class="note">Pick a piece on the left, or add one with <b>+ glyph</b> / <b>+ logo</b>. Edit the art in the box, or in asXii ("edit in asXii", then "send back to NeoN+1" there). The game shows changes right away; <b>save</b> writes the files that changed.</p>'; return; }
    const k = F.KINDS[p.kind], rows = getRows(p), probs = problems(p), it = itemOf(p);
    const w = Math.max(0, ...rows.map(r => [...r].length));
    const show = p.kind === 'logos' ? (it.kind === 'corp' ? 'corpintro' : 'profile') : { glyphs: 'layer', special: 'layer', map: 'intro', root: 'sectorclear' }[p.kind];   // faces: nowhere to show yet (POPS's: play the training)
    let info = '';
    if (p.kind === 'glyphs' || p.kind === 'special') {
      info = `<div class="afields">${field('name', 'fName', it.name)}</div>
        <label class="af"><span>codex lore</span><textarea id="fLore" rows="3" spellcheck="false">${esc((it.lore || []).join('\n'))}</textarea></label>
        <p class="note">One line per row in the codex, under 26 characters each.${p.kind === 'glyphs' ? ' New glyphs show on nodes right away; the codex lists them after the game reloads.' : ''}</p>`;
    } else if (p.kind === 'faces') {
      const h = typeof HACKERS !== 'undefined' && HACKERS[p.k];
      info = `<div class="afields">${field('name', 'fName', it.name)}</div>
        <p class="note">${h ? esc(h.name) + ' (' + h.side + '): ' + esc(h.shtick) + ' The hackers tab has the rest.' : 'Not in dist/data/hackers.js.'}${p.k === 'pops' ? ' POPS: the training popups use this face (play the training to see it).' : ''}</p>`;
    } else if (p.kind === 'logos') {
      const corpOpts = corpKeys().map(c => `<option value="${esc(c)}"${c === it.corp ? ' selected' : ''}>${esc(corpName(c))}</option>`).join('');
      info = `<div class="afields">${field('id', 'fId', it.id, 'style="width:130px"')}${field('name', 'fName', it.name)}${field('mark', 'fMark', it.mark, 'maxlength="3" style="width:56px" class="mono"')}
        <label class="af"><span>kind</span><select id="fKind">${F.LOGO_KINDS.map(x => `<option${x === it.kind ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
        ${it.kind === 'corp' ? `<label class="af"><span>corp</span><select id="fCorp">${corpOpts}</select></label>` : ''}
        ${it.kind === 'hacker' ? field('hacker id', 'fHacker', it.hacker || '', 'style="width:120px"') : ''}</div>
        <p class="note">id: what saves keep (lowercase, no spaces; changing it on a saved logo resets profiles using it). mark: 3 characters for the HUD, cursors and buttons (the middle one is your cursor in multiplayer).
        ${it.kind === 'player' ? 'player: everyone has it.' : it.kind === 'corp' ? 'corp: unlocked by beating that corp; it is also the corp\'s intro art.' : 'hacker: unlocked by beating that hacker (the cast is in dist/data/hackers.js; none play yet).'}</p>`;
    }
    d.innerHTML = `<div class="ahead"><span class="aname">${esc(p.label)}</span><span class="note">${esc(k.label)} · ${w} x ${rows.length} (max ${k.w} x ${k.h})${p.isNew ? ' · <b style="color:var(--warn)">new</b>' : isChanged(p) ? ' · <b style="color:var(--warn)">changed</b>' : ''}</span></div>
      <p class="note">${esc(k.note)}</p>
      <div class="aprev"><div class="box" style="width:${k.w}ch;height:${k.h * 1.25}em"></div><span id="aPrevText">${esc(rows.join('\n')) || ' '}</span></div>
      ${probs.length ? `<div class="aprob">${esc(probs.join('; '))}</div>` : ''}
      <div class="abtns">
        <button id="aAsx" class="primary" title="Open it in asXii (a new tab) at its size; there, 'send back to NeoN+1' brings it here">edit in asXii</button>
        <button id="aCopy" title="Copy the art as text">copy</button>
        <button id="aPaste" title="Replace the art with the text on the clipboard">paste</button>
        <button id="aRevert" ${isChanged(p) && !p.isNew ? '' : 'disabled'} title="Back to the saved version">revert</button>
        ${show ? '' : '<!--'}<button id="aShow" title="${esc({ layer: 'a corp layer (glyphs come up at random)', profile: 'the profile screen, wearing this logo', corpintro: "this corp's intro screen", intro: 'the boot intro (the map shows a few seconds in)', sectorclear: 'the SECTOR CLEARED screen, with this picture' }[show])}">show in game</button>${show ? '' : '-->'}
        ${p.kind === 'logos' ? '<button id="aUp" title="Earlier in the logo picker">&uarr;</button><button id="aDown" title="Later in the logo picker">&darr;</button>' : ''}
        ${(p.kind === 'glyphs' && p.isNew) || p.kind === 'logos' ? '<button id="aDel" title="Remove it">remove</button>' : ''}
      </div>
      <textarea id="aText" rows="${Math.max(k.h, rows.length) + 1}" spellcheck="false">${esc(rows.join('\n'))}</textarea>
      ${info}`;
    $('#aAsx').onclick = () => editInAsxii(p);
    $('#aCopy').onclick = () => navigator.clipboard.writeText(getRows(p).join('\n')).then(() => toast('copied'), () => toast("couldn't copy"));
    $('#aPaste').onclick = () => navigator.clipboard.readText().then(t => { setRows(p, F.rowsFromText(p.kind, t)); toast('pasted'); }, () => toast("couldn't read the clipboard"));
    $('#aRevert').onclick = () => { if (p.kind === 'map') art.map = saved.map.slice(); else Object.assign(itemOf(p), clone(savedItem(p))); sendLive(p.kind); render(); };
    if ($('#aShow')) $('#aShow').onclick = () => {
      sendLive(p.kind);
      setTimeout(() => {
        if (show === 'corpintro' || show === 'profile') toGame({ type: 'scene', name: show, opts: show === 'corpintro' ? { corp: it.corp } : { logo: it.id } });
        else if (show === 'sectorclear') toGame({ type: 'scene', name: show, opts: { root: p.k } });
        else if (window.NE) NE.runScene(show);
      }, 200);   // after the live art
    };
    if ($('#aUp')) { $('#aUp').onclick = () => moveLogo(p, -1); $('#aDown').onclick = () => moveLogo(p, 1); }
    if ($('#aDel')) $('#aDel').onclick = () => remove(p);
    $('#aText').oninput = e => {   // typing: keep the box as it is, update everything else
      const rows2 = F.rowsFromText(p.kind, e.target.value);
      setRowsRaw(p, rows2); sendLive(p.kind); renderList(); renderFile();
      $('#aPrevText').textContent = rows2.join('\n') || ' ';
    };
    // the details: names, lore, logo fields (typing updates the list, not this box)
    const upd = (fn, kind = p.kind) => { fn(); sendLive(kind); renderList(); renderFile(); };
    if ($('#fName')) $('#fName').oninput = e => upd(() => { it.name = e.target.value.toUpperCase(); });
    if ($('#fLore')) $('#fLore').oninput = e => upd(() => { it.lore = e.target.value.replace(/\r/g, '').split('\n').map(l => l.trimEnd()).filter((l, i, a) => l || i < a.length - 1); });
    if ($('#fId')) $('#fId').onchange = e => upd(() => { it.id = e.target.value.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_'); renderDetail(); });
    if ($('#fMark')) $('#fMark').oninput = e => upd(() => { it.mark = e.target.value; });
    if ($('#fKind')) $('#fKind').onchange = e => upd(() => {
      it.kind = e.target.value; delete it.corp; delete it.hacker;
      if (it.kind === 'corp') it.corp = corpKeys()[0]; if (it.kind === 'hacker') it.hacker = it.id;
      renderDetail();
    });
    if ($('#fCorp')) $('#fCorp').onchange = e => upd(() => { it.corp = e.target.value; });
    if ($('#fHacker')) $('#fHacker').oninput = e => upd(() => { it.hacker = e.target.value.trim().toLowerCase(); });
  }
  function render() { renderList(); renderDetail(); renderFile(); }

  $('#aList').addEventListener('click', e => { const it = e.target.closest('.ai'); if (it) { sel = it.dataset.id; render(); } });
  $('#aFilter').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); renderList(); });
  $('#aSave').onclick = save; $('#aReload').onclick = reload;
  $('#aAddGlyph').onclick = addGlyph; $('#aAddLogo').onclick = addLogo;
  NEON_ED.saveKey('mode-art', save);
  NEON_ED.warnUnsaved(dirty);
  window.NE_ART = { render, save, get art() { return art; }, pieces, setRows, findPiece, addGlyph, addLogo, changedFiles, texts };
  render();
})();
