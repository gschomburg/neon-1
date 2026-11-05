// ---------------- Items & mods: every item and mod, its rarity steps and its copy (read-only) ----------------
(() => {
  const $ = s => document.querySelector(s);
  if (typeof MODS === 'undefined' || typeof ITEMS === 'undefined') { $('#iBody').textContent = "Couldn't load ../dist/data/mods.js."; return; }
  const LADDER = Object.keys(RARITY).sort((a, b) => RARITY[a].lvl - RARITY[b].lvl);
  const chips = (window.NEON_PALETTES || {}).chips || {};
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const chip = r => { const c = chips[r] || { fg: '#000', bg: '#888' }; return `<span class="c" style="color:${c.fg};background:${c.bg}">${esc((RARITY[r] || { label: r }).label)}</span>`; };
  const KINDS = [['item', 'Gear', 'one use each, on the belt. ' + ITEM_WHERE], ['loot', 'Loot', 'worth money: it goes in the LOOT bag ([$]) and sells at a black market. quest items too.'], ['gen', 'General mods', 'the main pool'], ['minor', 'Minor mods', 'small perks'],
    ['exotic', 'Exotic mods', 'rule-benders: sector bosses, markets, caches'], ['corp', 'Corp mods', "only from that corp's boss; legendary, never upgrade"]];
  const corpName = k => (CORPS[k] && CORPS[k].name) || k;

  // one entry per item / mod, with its steps worked out the way the game does (base + that step's overrides)
  const all = [];
  for (const [k, d] of Object.entries(ITEMS)) all.push({ key: k, kind: d.value || d.quest ? 'loot' : 'item', d });
  const isGearish = e => e.kind === 'item' || e.kind === 'loot';   // (gear and loot: given +1 at a time)
  for (const [k, d] of Object.entries(MODS)) all.push({ key: k, kind: d.kind, d });
  for (const e of all) e.steps = (e.d.tiers || [{}]).map(t => Object.assign({}, e.d, t));

  // the mod picker: the game tells us what its run holds (engine/editor.js), we send mod-set
  const toGame = m => { try { $('#game').contentWindow.postMessage(Object.assign({ to: 'neon-game' }, m), '*'); } catch (e) { /* not loaded */ } };
  let game = { run: false, mods: [], slots: 0 }, held = {};
  const setMod = (key, tier) => toGame({ type: 'mod-set', key, tier });
  const gameBar = () => {
    const names = game.mods.map(([k, t]) => { const d = MODS[k], st = d && Object.assign({}, d, (d.tiers || [])[t]); return d ? `<span class="held">${esc(d.short || d.name)}</span> ${st && (d.tiers || []).length > 1 ? chip(st.rarity) : ''}` : esc(k); });
    $('#iGame').innerHTML = game.run
      ? `in the game: ${game.mods.length}/${game.slots} mods ${names.join(' · ') || '(none)'} <span style="margin-left:auto">give a mod at any step below; the run becomes practice</span>`
      : 'the game has no run: <button id="iStart">start a test run</button> (the map scene) to give it mods';
    const b = $('#iStart'); if (b) b.onclick = () => toGame({ type: 'scene', name: 'map', opts: {} });
  };
  window.addEventListener('message', e => {
    const m = e.data;
    if (!m || m.from !== 'neon-game') return;
    if (m.type === 'ready') toGame({ type: 'mods-get' });
    if (m.type === 'mods') { game = m; held = Object.fromEntries(m.mods); render(); }
  });

  let view = 'cards', kind = 'all', q = '', sort = 'file';
  try { view = localStorage.getItem('neon.items.view') || 'cards'; kind = localStorage.getItem('neon.items.kind') || 'all'; sort = localStorage.getItem('neon.items.sort') || 'file'; } catch (e) { /* private mode */ }
  all.forEach((e, i) => { e.i = i; });
  const corpLv = e => e.d.corp ? (e.d.corp === 'omni' ? 9 : (CORPS[e.d.corp] && CORPS[e.d.corp].level) || 1) : 0;   // OMNI (the final) last
  const SORTS = {
    file: (a, b) => a.i - b.i,
    level: (a, b) => corpLv(a) - corpLv(b) || (a.d.corp ? corpName(a.d.corp).localeCompare(corpName(b.d.corp)) : 0) || a.i - b.i,
    name: (a, b) => a.d.name.localeCompare(b.d.name),
    rarity: (a, b) => RARITY[a.steps[0].rarity].lvl - RARITY[b.steps[0].rarity].lvl || a.d.name.localeCompare(b.d.name),
  };
  const shown = () => all.filter(e => (kind === 'all' || e.kind === kind) && (!q || [e.key, e.d.name, e.d.short, e.d.corp && corpName(e.d.corp), e.d.slot, e.d.codex,
    ...e.steps.flatMap(s => [s.tip, s.desc, s.rarity])].join(' ').toLowerCase().includes(q))).sort(SORTS[sort] || SORTS.file);

  const meta = e => {
    const d = e.d, bits = [];
    if (d.short) bits.push(`<span class="mono">${esc(d.short)}</span>`);
    bits.push(isGearish(e) ? (e.kind === 'loot' ? 'loot' : 'gear') : e.kind + ' mod');
    if (d.price) bits.push(d.price + 'cr');
    if (d.corp) bits.push(`from <a data-corp="${esc(d.corp)}" title="show this corp in the game">${esc(corpName(d.corp))}</a>${CORPS[d.corp] ? ' LV' + (CORPS[d.corp].level || 1) : ''}`);
    if (d.icon) bits.push(`icon <span class="mono">${esc(d.icon)}</span>` + (d.anim ? ' ' + esc(d.anim) : ''));
    const flags = [d.active && 'tap to use', d.slot && 'slot: ' + d.slot, d.locked && 'locked in'].filter(Boolean).map(f => `<span class="flag">${esc(f)}</span>`);
    return bits.join(' · ') + ' ' + flags.join(' ');
  };
  const giveBtn = (e, i) => {
    if (isGearish(e)) return `<td class="igive"><button class="give" data-key="${esc(e.key)}" data-tier="${i}" title="give one at this step (${e.kind === 'loot' ? 'it goes in your LOOT bag' : 'it goes in your gear slots'})"${game.run ? '' : ' disabled'}>+1</button></td>`;
    const on = held[e.key] === i;
    return `<td class="igive"><button class="give${on ? ' on' : ''}" data-key="${esc(e.key)}" data-tier="${on ? -1 : i}" title="${on ? 'held at this step: click to remove it' : (e.key in held ? 'move it to this step' : 'give it at this step')}"${game.run ? '' : ' disabled'}>${on ? 'held ✕' : e.key in held ? 'set' : 'give'}</button></td>`;
  };
  const card = e => `<div class="icard${e.key in held ? ' has' : ''}"><div class="ihead"><span class="iname">${esc(e.d.name)}</span><span class="imeta">${meta(e)}</span>${e.key in held ? '<span class="ihave">held</span>' : ''}</div>
    <table>${e.steps.map((s, i) => `<tr><td class="ichip">${chip(s.rarity)}</td><td class="itip">${esc(s.tip)}</td><td>${esc(s.desc)}</td>${giveBtn(e, i)}</tr>`).join('')}</table>
    ${e.d.codex ? `<div class="icodex"><b>codex:</b> ${esc(e.d.codex)}</div>` : ''}</div>`;
  const ladder = list => {
    const cols = LADDER.map(r => `<th>${chip(r)}</th>`).join('');
    const rows = list.map(e => {
      const at = {}; e.steps.forEach((s, i) => { at[s.rarity] = s; s.i = i; });
      const first = RARITY[e.steps[0].rarity].lvl, last = RARITY[e.steps[e.steps.length - 1].rarity].lvl;
      return `<tr><td class="n">${esc(e.d.name)}<small>${e.kind === 'item' ? 'gear' : e.kind}${e.d.corp ? ' · ' + esc(corpName(e.d.corp)) + (CORPS[e.d.corp] ? ' LV' + (CORPS[e.d.corp].level || 1) : '') : ''}</small></td>` + LADDER.map(r => {
        const s = at[r], l = RARITY[r].lvl, c = chips[r] || {};
        if (s) {
          const mod = !isGearish(e) && game.run, on = held[e.key] === s.i;
          return `<td class="s${mod ? ' pick' : ''}${on ? ' on' : ''}" style="border-left-color:${c.bg}" title="${esc(s.desc)}${mod ? (on ? '&#10;(held: click to remove)' : '&#10;(click: give it at this step)') : ''}"${mod ? ` data-key="${esc(e.key)}" data-tier="${on ? -1 : s.i}"` : ''}>${esc(s.tip)}</td>`;
        }
        return `<td class="s">${l > first && l < last ? '<i>(skips)</i>' : ''}</td>`;
      }).join('') + '</tr>';
    }).join('');
    return `<table class="ilad"><tr><th>name</th>${cols}</tr>${rows}</table>`;
  };

  const render = () => {
    gameBar();
    for (const b of document.querySelectorAll('#iView button')) b.classList.toggle('on', b.dataset.v === view);
    for (const b of document.querySelectorAll('#iKind button')) b.classList.toggle('on', b.dataset.k === kind);
    for (const b of document.querySelectorAll('#iSort button')) b.classList.toggle('on', b.dataset.s === sort);
    const list = shown();
    $('#iCount').textContent = `${list.length} of ${all.length}`;
    // the ladder strip: how many things reach each rarity (at any step)
    $('#iLadder').innerHTML = 'ladder: ' + LADDER.map(r => `${chip(r)} <span>${list.filter(e => e.steps.some(s => s.rarity === r)).length}</span>`).join(' <span class="arrow">&gt;</span> ') +
      ' <span style="margin-left:10px">(counts: how many shown reach that rarity at any step)</span>';
    if (view === 'ladder') { $('#iBody').innerHTML = list.length ? ladder(list) : '<p>nothing matches.</p>'; return; }
    $('#iBody').innerHTML = KINDS.map(([k, title, note]) => {
      const g = list.filter(e => e.kind === k);
      return g.length ? `<h2>${title} <small>${g.length} · ${esc(note)}</small></h2>` + g.map(card).join('') : '';
    }).join('') || '<p>nothing matches.</p>';
  };

  // plain text of what's shown, to paste into notes or a chat
  const asText = () => shown().map(e => {
    const d = e.d, head = `${d.name}${d.short ? ' (' + d.short + ')' : ''}, ${isGearish(e) ? (e.kind === 'loot' ? 'loot' : 'gear') : e.kind + ' mod'}${d.price ? ', ' + d.price + 'cr' : ''}${d.corp ? ', from ' + corpName(d.corp) : ''}${d.slot ? ', slot ' + d.slot : ''}${d.locked ? ', locked' : ''}${d.active ? ', tap to use' : ''}`;
    return [head, ...e.steps.map(s => `  ${RARITY[s.rarity].label.padEnd(7)} ${s.tip}  |  ${s.desc}`), ...(d.codex ? ['  codex: ' + d.codex] : [])].join('\n');
  }).join('\n\n');

  $('#iView').addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; view = b.dataset.v; try { localStorage.setItem('neon.items.view', view); } catch (e) { /* */ } render(); });
  $('#iKind').addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; kind = b.dataset.k; try { localStorage.setItem('neon.items.kind', kind); } catch (e) { /* */ } render(); });
  $('#iSort').addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; sort = b.dataset.s; try { localStorage.setItem('neon.items.sort', sort); } catch (e) { /* */ } render(); });
  $('#iFilter').addEventListener('input', ev => { q = ev.target.value.trim().toLowerCase(); render(); });
  $('#iCopy').addEventListener('click', () => {
    const t = asText(), b = $('#iCopy');
    const done = ok => { b.textContent = ok ? 'copied' : "couldn't copy"; setTimeout(() => { b.textContent = 'copy as text'; }, 1200); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => done(true), () => done(false)); else done(false);
  });
  $('#iBody').addEventListener('click', ev => {
    const a = ev.target.closest('a[data-corp]'); if (a && window.NE) window.NE.showCorp(a.dataset.corp);
    const g = ev.target.closest('[data-key][data-tier]'); if (g && game.run) setMod(g.dataset.key, +g.dataset.tier);
  });
  window.NE_ITEMS = { render, asText };
  render();
})();
