// ---------------- Hackers: the cast (dist/data/hackers.js), each with its face and logo (data/art/) ----------------
(() => {
  const $ = s => document.querySelector(s);
  if (typeof HACKERS === 'undefined') { $('#hkBody').textContent = "Couldn't load ../dist/data/hackers.js."; return; }
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // the art tab's live copy when there is one (so edits there show here), else the files
  const artNow = () => (window.NE_ART && NE_ART.art) || { faces: typeof ART_FACES !== 'undefined' ? ART_FACES : {}, logos: typeof ART_LOGOS !== 'undefined' ? ART_LOGOS : [] };
  let side = 'all', q = '';
  const jump = k => k ? `<a class="hkjump" data-k="${esc(k)}">${esc((HACKERS[k] || {}).name || k)}</a>` : '';
  const card = (k, h) => {
    const a = artNow(), face = (a.faces[k] || {}).art || ['', '  ?  ', ''], logo = (a.logos.find(l => l.id === k) || {}).art || ['(no logo yet)'];
    const counter = h.side === 'bad' ? jump(h.counter) : h.counter ? jump(h.counter.split(':')[0]) + esc(h.counter.slice(h.counter.split(':')[0].length)) : '';
    return `<div class="hk ${h.side}" id="hk-${esc(k)}"><div class="hktop"><pre class="hkface">${esc(face.join('\n'))}</pre>
      <div style="flex:1"><div><span class="hkname">${esc(h.name)}</span><span class="hkchip">${h.side}</span><span class="hkbars" title="health">${'#'.repeat(h.hp)}</span> <span class="mono dim">${esc(k)}</span></div>
      <div class="hkshtick">"${esc(h.shtick)}"</div></div>
      <pre class="hklogo">${esc(logo.join('\n'))}</pre></div>
      <dl><dt>lore</dt><dd>${esc(h.lore.join(' '))}</dd><dt>ai</dt><dd>${esc(h.ai)}</dd>
      ${h.beat ? `<dt>beat</dt><dd>${esc(h.beat)}</dd>` : ''}<dt>${h.side === 'bad' ? 'countered' : 'counters'}</dt><dd>${counter}</dd></dl></div>`;
  };
  const render = () => {
    const all = Object.entries(HACKERS), list = all.filter(([k, h]) => (side === 'all' || h.side === side) &&
      (!q || [k, h.name, h.shtick, h.lore.join(' '), h.ai, h.beat, h.counter].join(' ').toLowerCase().includes(q)));
    $('#hkCount').textContent = `${list.length} of ${all.length} hackers`;
    $('#hkBody').innerHTML = ['bad', 'good'].map(sd => {
      const g = list.filter(([, h]) => h.side === sd);
      return g.length ? `<div class="hkside">${sd === 'bad' ? 'bad hackers: they show up against you' : 'good hackers: you call them with gear'} (${g.length})</div><div class="hkcards">${g.map(([k, h]) => card(k, h)).join('')}</div>` : '';
    }).join('') || '<p>nothing matches.</p>';
  };
  $('#hkBar').addEventListener('click', e => { const b = e.target.closest('button[data-side]'); if (!b) return; side = b.dataset.side; for (const x of $('#hkBar').querySelectorAll('button[data-side]')) x.classList.toggle('on', x === b); render(); });
  $('#hkFilter').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); render(); });
  $('#hkBody').addEventListener('click', e => {
    const a = e.target.closest('a.hkjump'); if (!a) return;
    if (side !== 'all' || q) { side = 'all'; q = ''; $('#hkFilter').value = ''; for (const x of $('#hkBar').querySelectorAll('button[data-side]')) x.classList.toggle('on', x.dataset.side === 'all'); render(); }
    const c = $('#hk-' + a.dataset.k); if (!c) return;
    c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 1200);
  });
  // redraw when the tab opens (the art tab may have changed a face)
  for (const b of document.querySelectorAll('#modes button[data-mode="hack"]')) b.addEventListener('click', render);
  render();
})();
