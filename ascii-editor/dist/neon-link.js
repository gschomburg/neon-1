// asXii <-> the NeoN+1 editor (tools/neon_editor.html, the ART tab). Only runs when asXii is opened as
// index.html?neon=1 (the editor's "edit in asXii"). The editor sends a piece of art and its size; a bar at
// the top says what you're editing, and "send back to NeoN+1" posts the canvas back to the editor.
// It only uses the window.asxii hooks (app.js), so the rest of asXii doesn't know about it.
'use strict';
(() => {
  if (!new URLSearchParams(location.search).has('neon')) return;
  const A = window.asxii;
  if (!A) return;
  let cur = null;   // what we're editing: { id, name, label, w, h, note }
  const bar = document.createElement('div');
  bar.id = 'neonBar';
  bar.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:12px;z-index:50;display:flex;gap:10px;align-items:center;' +
    'padding:6px 8px 6px 12px;border-radius:8px;background:#10232c;border:1px solid #2c7ea8;color:#d6e6ee;font:13px system-ui,sans-serif;box-shadow:0 4px 18px #0008';
  bar.innerHTML = '<b style="color:#5cc8ff">NeoN+1</b><span id="neonWhat">waiting for art from the neon editor...</span>' +
    '<button id="neonSend" class="btn primary" disabled title="Send the canvas back to the neon editor (Ctrl Enter)">send back to NeoN+1</button>';
  document.body.append(bar);
  const what = bar.querySelector('#neonWhat'), btn = bar.querySelector('#neonSend');
  const peer = () => (window.opener && !window.opener.closed ? window.opener : null);

  function load(m) {
    A.commitFloat(); A.pushUndo();
    A.loadProject({ app: 'asXii', format: 1, name: 'neon ' + m.name, width: m.w, height: m.h, active: 0,
      layers: [{ name: m.name, visible: true, x: 0, y: 0, rows: m.rows || [] }] });
    A.changed(true); A.zoomFit();
    cur = m;
    what.textContent = `${m.name} (${m.label}, ${m.w} x ${m.h})`;
    what.title = m.note || '';
    btn.disabled = false;
    A.toast(`From NeoN+1: ${m.name}. Draw inside the canvas, then "send back to NeoN+1"`);
  }
  async function send() {
    if (!cur) return;
    A.commitFloat();
    const text = A.canvasText(), p = peer();
    if (p) { p.postMessage({ from: 'asxii', type: 'art', id: cur.id, text }, '*'); A.toast(`Sent ${cur.name} back to NeoN+1`); return; }
    try { await navigator.clipboard.writeText(text); } catch (e) { /* */ }
    A.toast('The neon editor tab is gone: the art is on the clipboard (paste it there)', 'warn');
  }
  btn.addEventListener('click', send);
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && cur) { e.preventDefault(); send(); } });
  window.addEventListener('message', e => { const m = e.data; if (m && m.to === 'asxii' && m.type === 'load') load(m); });
  const p = peer();
  if (p) p.postMessage({ from: 'asxii', type: 'ready' }, '*');
  else what.textContent = 'open this from the neon editor (tools/neon_editor.html, ART, "edit in asXii")';
})();
