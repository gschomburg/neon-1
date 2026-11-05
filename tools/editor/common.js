// NeoN+1 tools/editor/common.js: the helpers every tab of the neon editor (tools/neon_editor.html) shares, as
// window.NEON_ED. Loads after the page's HTML (it needs #game and #toast) and before the tab scripts.
//
// The game frame talks back with postMessage: we send { to: 'neon-game', type, ... } and it answers
// { from: 'neon-game', type, ... }. dist/engine/editor.js is the other end: keep the two in step.
(() => {
  'use strict';
  const $ = s => document.querySelector(s);

  // ---------- the game frame ----------
  const toGame = m => { try { $('#game').contentWindow.postMessage(Object.assign({ to: 'neon-game' }, m), '*'); } catch (e) { /* not loaded */ } };
  // fn(m) for every message from the game of that type ('*': every type)
  const onGame = (type, fn) => window.addEventListener('message', e => { const m = e.data; if (m && m.from === 'neon-game' && (type === '*' || m.type === type)) fn(m, e); });

  // ---------- small things ----------
  const toast = (t, ms = 2400) => { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), ms); };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clone = o => JSON.parse(JSON.stringify(o));
  const hhmm = () => new Date().toTimeString().slice(0, 5);
  // the build a loaded data file was stamped with ('data/economy.js' -> 'v14.44')
  const buildOf = (file, dflt = 'v0') => ((window.NEON_FILES || []).find(f => f[0] === file) || [])[1] || dflt;
  // a file to the downloads folder (browsers that can't write files in place)
  const download = (name, text) => {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/javascript' })), download: name });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  // a toast for a failed save / reload (not for a closed picker or a "no" to a question)
  const failed = (what, e) => { if (e.name !== 'AbortError' && e.message !== 'cancelled') toast(what + ' failed: ' + e.message); };
  // a tab's Ctrl S, only while that tab is up (body.mode-<x>)
  const saveKey = (mode, fn) => document.addEventListener('keydown', e => {
    if (!document.body.classList.contains(mode)) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); fn(); }
  });
  const warnUnsaved = dirty => window.addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });

  // ---------- IndexedDB: file and folder handles, remembered between visits ----------
  // idb('neon-art-editor', 2)(mode, store => request) -> a promise of the request's result (one object store, 'h')
  const idb = (db, version = 1) => (mode, fn) => new Promise((res, rej) => {
    const open = indexedDB.open(db, version);
    open.onupgradeneeded = () => { if (!open.result.objectStoreNames.contains('h')) open.result.createObjectStore('h'); };
    open.onerror = () => rej(open.error);
    open.onsuccess = () => { const tx = open.result.transaction('h', mode), r = fn(tx.objectStore('h')); tx.oncomplete = () => res(r && r.result); tx.onerror = () => rej(tx.error); };
  });

  // ---------- a repo folder the tabs save into (Chrome's File System Access), picked once ----------
  // o: { db, version, key: the handle's key in the db, id: the picker's id, label: 'dist/data' }
  // .dir the handle (null until picked), .where() 'data/' or 'dist/data/', .on(fn) runs fn when the handle arrives,
  // .ensure(check) the handle with write permission (asks, or shows the picker; check: a file the folder should have).
  function folder(o) {
    const db = idb(o.db, o.version), subs = [];
    let dir = null;
    db('readonly', s => s.get(o.key)).then(h => { if (h) { dir = h; subs.forEach(f => f()); } }).catch(() => {});
    return {
      label: o.label,
      get dir() { return dir; },
      where: () => (dir ? dir.name : o.label) + '/',
      on: fn => subs.push(fn),
      async ensure(check) {
        if (dir && ((await dir.queryPermission({ mode: 'readwrite' })) === 'granted' || (await dir.requestPermission({ mode: 'readwrite' })) === 'granted')) return dir;
        toast('pick the ' + o.label + ' folder');
        const h = await window.showDirectoryPicker({ id: o.id, mode: 'readwrite' });
        let ok = true; try { await h.getFileHandle(check); } catch (e) { ok = false; }
        if (!ok && !confirm('The folder ' + h.name + ' has no ' + check + ': is it ' + o.label + '? Use it anyway?')) throw new Error('cancelled');
        dir = h; db('readwrite', s => s.put(h, o.key)).catch(() => {}); subs.forEach(f => f());
        return h;
      },
    };
  }
  // dist/data: TRAINING, ECONOMY and FX share it (and its old db name, so a folder picked before still works)
  const dataDir = folder({ db: 'neon-tut-editor', version: 1, key: 'datadir', id: 'neon-data', label: 'dist/data' });

  // one file in a folder: .where() for the tab's file line, .save(text) (true once written or downloaded: the tab
  // marks itself saved), .load() (the text, or null: cancelled or failed; without file access the page reloads).
  const dataFile = (name, dir = dataDir) => ({
    where: () => dir.where() + name,
    async save(text) {
      if (!window.showDirectoryPicker) { download(name, text); toast('downloaded ' + name + ': put it in ' + dir.label); return true; }
      try {
        const d = await dir.ensure(name), h = await d.getFileHandle(name, { create: true }), w = await h.createWritable();
        await w.write(text); await w.close();
        toast('saved ' + name + ' at ' + hhmm()); return true;
      } catch (e) { failed('save', e); return false; }
    },
    async load() {
      if (!window.showDirectoryPicker) { location.reload(); return null; }
      try { const d = await dir.ensure(name); return await (await (await d.getFileHandle(name)).getFile()).text(); } catch (e) { failed('reload', e); return null; }
    },
  });

  window.NEON_ED = { $, toGame, onGame, toast, esc, clone, hhmm, buildOf, download, failed, saveKey, warnUnsaved, idb, folder, dataDir, dataFile };
})();
