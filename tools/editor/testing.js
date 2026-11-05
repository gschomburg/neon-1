// ---------------- Testing: cheats and jumps on the running game (engine/editor.js 'test') ----------------
(() => {
  const { $, toGame, onGame, esc } = NEON_ED;
  let state = null, evNames = {};
  const log = (t, bad) => { const l = $('#xLog'); l.textContent = t; l.classList.toggle('bad', !!bad); };
  const send = (act, extra = {}) => { if (act !== 'lootview') log(act + '...'); toGame(Object.assign({ type: 'test', act }, extra)); };
  // The loot report, following the map: asks about once a second while it's on and this tab is up (quietly)
  setInterval(() => { const f = $('#xLootFollow'); if (f && f.checked && f.closest('details').open && document.body.classList.contains('mode-test') && state && state.run) send('lootview'); }, 1000);
  const drawState = () => {
    const x = state;
    for (const b of document.querySelectorAll('#test button.tg')) b.classList.toggle('on', !!(x && x[b.dataset.x]));
    for (const b of document.querySelectorAll('#xFeats button[data-x="feat"]')) b.classList.toggle('on', !!(x && (x.feats || []).includes(b.dataset.key)));
    if (!x || !x.run) { $('#xState').textContent = 'no run: click "new test run" or a sector event'; return; }
    $('#xState').textContent = `sector ${x.sector}${x.event ? ' // ' + (evNames[x.event] || x.event) : ''}  ·  ${x.credits}cr  ·  INT ${x.int}/${x.maxInt}  ·  REP ${x.rep}  ·  quest: ${x.quest}${x.qopen ? '' : ' (closed)'}  ·  ${x.mods} mods${x.fence ? '  ·  fence: ' + x.fence : ''}  ·  ${x.mode}${x.god ? '  ·  GOD' : ''}${x.free ? '  ·  free travel' : ''}${x.tabMusic ? '  ·  music tab playing' : ''}`;
  };
  onGame('*', m => {
    if (m.type === 'ready') {
      evNames = Object.fromEntries((m.events || []).map(([k, n]) => [k, n]));
      const an = Object.fromEntries((m.anomalies || []).map(a => [a[0], a]));
      $('#xEvents').innerHTML = (m.events || []).map(([k, n, kind, a]) => `<button class="ev" data-x="event" data-key="${esc(k)}">${esc(n)}<small>${kind === 'anomaly' ? (a === 'any' ? 'any anomaly' : esc(an[a] ? an[a][1] : a)) : 'whole sector'}</small></button>`).join('');
      $('#xAnoms').innerHTML = (m.anomalies || []).map(([k, n, tag, d]) => `<button data-x="anomaly" data-key="${esc(k)}" title="${esc(d)}">${esc(tag)} ${esc(n)}</button>`).join('') + '<button data-x="anomaly" data-key="">none</button>';
    }
    if (m.type === 'test-state') { state = m; drawState(); }
    if (m.type === 'loot-view') { const p = $('#xLoot'); if (p.textContent !== m.text) { const top = p.scrollTop; p.textContent = m.text; p.scrollTop = top; } p.style.display = 'block'; }
    if (m.type === 'test-done' && !(m.act === 'lootview' && m.ok)) log(m.ok ? m.act + ': done' : m.act + ': ' + m.error, !m.ok);   // (the loot report shows itself)
    if (m.type === 'mod-set' && m.ok === false) log('give: ' + m.error, true);
  });
  for (const d of document.querySelectorAll('#test details.xgrp')) {   // open / closed is remembered
    try { d.open = localStorage.getItem('neonEditor.test.' + d.dataset.g) === '1'; } catch (e) { /* no storage */ }
    d.addEventListener('toggle', () => { try { localStorage.setItem('neonEditor.test.' + d.dataset.g, d.open ? '1' : '0'); } catch (e) { /* no storage */ } });
  }
  $('#test').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-x]'); if (!b) return;
    const act = b.dataset.x;
    if (act === 'fresh') return send('sector', { n: 1 });
    if (act === 'credits') return send('credits', { n: $('#xCr').value });
    if (act === 'int') return send('int', { n: $('#xInt').value });
    if (act === 'rep') return send('rep', { n: $('#xRep').value });
    if (act === 'qstep') return send('qstep', { step: $('#xQStep').value });
    if (act === 'qwins') return send('qwins', { n: $('#xQWins').value });
    if (act === 'qscene') return send('qscene', { key: b.dataset.key });
    if (act === 'sector') return send('sector', { n: +b.dataset.n });
    if (act === 'event' || act === 'anomaly') return send(act, { key: b.dataset.key });
    if (act === 'feat') return send('feat', { key: b.dataset.key, on: !(state && (state.feats || []).includes(b.dataset.key)) });
    if (act === 'featbox') return send('featbox', { key: b.dataset.key });
    if (act === 'hacker') return send('hacker', { key: $('#xHk').value });
    if (act === 'kit') return send('kit', { key: b.dataset.key });
    send(act);
  });
  // give: every mod and gear (from dist/data/mods.js, loaded for the gear & mods tab)
  if (typeof MODS !== 'undefined' && typeof ITEMS !== 'undefined') {
    const steps = d => (d.tiers || [{}]).map(t => Object.assign({}, d, t).rarity);
    const opt = (k, d) => `<option value="${esc(k)}">${esc(d.name)}${d.name !== k.toUpperCase() ? ' (' + esc(k) + ')' : ''}</option>`;
    const fill = (groups) => groups.filter(([, list]) => list.length).map(([g, list]) => `<optgroup label="${g}">${list.sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([k, d]) => opt(k, d)).join('')}</optgroup>`).join('');
    // mods by kind; gear by what it is (normal, boss gear, CALL gear); loot (worth money: the LOOT bag) by what it is.
    // A phish catch given turns into the PHISH of its rarity in the game, like keeping one at a PIER.
    const gearKind = ([k, d]) => d.quest ? 'quest' : d.fish ? (d.bag ? '' : 'phish catches (become PHISH)') : d.value ? 'loot' : d.crew || k === 'call' ? 'CALL gear (crew)' : d.corp ? 'boss gear' : 'gear';
    const gearGroups = ['gear', 'boss gear', 'CALL gear (crew)'].map(g => [g, Object.entries(ITEMS).filter(e => gearKind(e) === g)]);
    const lootGroups = ['loot', 'phish catches (become PHISH)', 'quest'].map(g => [g, Object.entries(ITEMS).filter(e => gearKind(e) === g)]);
    // one row each: a picker, its steps, a give button
    const giveRow = (sel, tierSel, btn, groups, table, what) => {
      $(sel).innerHTML = fill(groups);
      const tiers = () => { const d = table[$(sel).value]; $(tierSel).innerHTML = d ? steps(d).map((r, i) => `<option value="${i}">${esc(r)}</option>`).join('') : ''; };
      $(sel).addEventListener('change', tiers); tiers();
      $(btn).addEventListener('click', () => { if (!state || !state.run) return log('give: no run: start one first', true); toGame({ type: 'mod-set', key: $(sel).value, tier: +$(tierSel).value }); log(`gave ${what} ${$(sel).selectedOptions[0].textContent}`); });
    };
    giveRow('#xGiveMod', '#xTierMod', '#xGiveModBtn', ['gen', 'minor', 'exotic', 'corp'].map(k => [k + ' mods', Object.entries(MODS).filter(([, d]) => d.kind === k)]), MODS, 'mod');
    giveRow('#xGiveGear', '#xTierGear', '#xGiveGearBtn', gearGroups, ITEMS, 'gear');
    giveRow('#xGiveLoot', '#xTierLoot', '#xGiveLootBtn', lootGroups, ITEMS, 'loot');
    // random 2-5 loot at once (any loot, phish catches too): to watch them pile up over the [$]
    $('#xGiveLootRnd').addEventListener('click', () => {
      if (!state || !state.run) return log('give: no run: start one first', true);
      const keys = Object.keys(ITEMS).filter(k => ITEMS[k].value), n = 2 + Math.floor(Math.random() * 4), got = [];
      for (let i = 0; i < n; i++) { const k = keys[Math.floor(Math.random() * keys.length)]; got.push(ITEMS[k].name); toGame({ type: 'mod-set', key: k, tier: 0 }); }
      log(`gave ${n} loot: ${got.join(', ')}`);
    });
  }
  if (typeof HACKERS !== 'undefined') $('#xHk').innerHTML = ['bad', 'good'].map(sd => `<optgroup label="${sd === 'bad' ? 'rivals' : 'crew'}">${Object.entries(HACKERS).filter(([, h]) => h.side === sd).map(([k, h]) => `<option value="${esc(k)}">${esc(h.name)}</option>`).join('')}</optgroup>`).join('');
  // feats (dist/data/feats.js): a button each (lit when done) and its "box"
  if (typeof FEATS !== 'undefined') $('#xFeats').innerHTML = FEATS.map(f => `<span class="xf"><button data-x="feat" data-key="${esc(f.id)}" title="${esc(f.text + (f.title ? ' (title: ' + f.title + ')' : ''))}">${esc(f.name)}</button><button data-x="featbox" data-key="${esc(f.id)}" class="sm">box</button></span>`).join('');
  drawState();
})();
