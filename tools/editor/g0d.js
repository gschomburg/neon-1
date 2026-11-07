// ---------------- G0D: previews of G0D's fight designs and effects in the game (engine/g0d.js, 'test' act 'g0d') ----------------
(() => {
  const { $, toGame, onGame, esc } = NEON_ED;
  let looks = [], cur = '', still = false, bar = '';
  const WHERE = { layer: 'a corp layer', map: 'the sector map', win: 'the win screen', death: 'the death screen' };
  const log = (t, bad) => { const l = $('#gLog'); l.textContent = t; l.classList.toggle('bad', !!bad); };
  const show = key => { log(key ? 'going there...' : 'off'); toGame({ type: 'test', act: 'g0d', key, still }); };
  const draw = () => {
    for (const b of document.querySelectorAll('#g0d button.look')) b.classList.toggle('on', b.dataset.key === cur);
    const lit = document.querySelector('#g0d button.look.on'), grp = lit && lit.closest('details');
    if (grp && !grp.open) grp.open = true;
    $('#g0d button[data-g="still"]').classList.toggle('on', still);
    for (const b of document.querySelectorAll('#g0d button.hp')) b.classList.toggle('on', b.dataset.key === bar);
    const l = looks.find(x => x[0] === cur);
    $('#gState').textContent = l ? `${l[1]}  ·  on ${WHERE[l[3]] || l[3]}  ·  ${l[4]}` : 'pick a look: the game goes to the screen it belongs on and draws it there';
  };
  onGame('*', m => {
    if (m.type === 'ready' && m.g0d) {
      looks = m.g0d;
      const btns = g => looks.filter(l => l[2] === g).map(l => `<button class="look" data-key="${esc(l[0])}" title="${esc(l[4])}">${esc(l[1])}<small>${esc(l[4])}</small></button>`).join('');
      $('#gHp').innerHTML = (m.g0dHp || []).map(([k, n, note]) => `<button class="look hp" data-key="${esc(k)}" title="${esc(note)}">${esc(n)}<small>${esc(note)}</small></button>`).join('');
      $('#gSet1').innerHTML = btns('set1'); $('#gSet2').innerHTML = btns('set2'); $('#gFx').innerHTML = btns('fx');
      draw();
    }
    if (m.type === 'test-state') { cur = m.g0d || ''; bar = m.g0dBar || ''; draw(); }
    if (m.type === 'test-done' && m.act === 'g0dhp') log(m.ok ? (bar ? 'health bar on (it takes a hit every 1.6s)' : 'health bar off') : m.error, !m.ok);
    if (m.type === 'test-done' && m.act === 'heaven') log(m.ok ? 'there: tap on the game' : m.error, !m.ok);
    if (m.type === 'test-done' && m.act === 'g0df') log(m.ok ? (gpStage || 'playing: tap on the game board') : m.error, !m.ok);
    if (m.type === 'test-done' && m.act === 'g0d') log(m.ok ? (cur ? 'showing' : 'off') : m.error, !m.ok);
  });
  for (const d of document.querySelectorAll('#g0d details.xgrp')) {   // open / closed is remembered
    try { const v = localStorage.getItem('neonEditor.g0d.' + d.dataset.g); if (v != null) d.open = v === '1'; } catch (e) { /* no storage */ }   // (none saved: as the HTML has it)
    d.addEventListener('toggle', () => { try { localStorage.setItem('neonEditor.g0d.' + d.dataset.g, d.open ? '1' : '0'); } catch (e) { /* no storage */ } });
  }
  // ---- the prototype: stages, b0y, the numbers (G0DF in engine/g0dfight.js)
  const GP_NUMS = [['mazeLost', 'maze: lost layers'], ['hp', 'G0D hits'], ['hitsPerEye', 'hits per eye'], ['eyeOpen', 'eye open s'], ['eyeBonusTime', '2nd eye: + s'], ['eyeBonusHits', '2nd eye: + hits'], ['corpHeal', 'corp node heals G0D'], ['stageDecoys', 'stage: + corp nodes'], ['stageSpew', 'stage: + spew x'], ['stageHands', 'stage: HANDS OFF sooner x'],
    ['decoys', 'corp nodes'], ['spew', 'mold spew'], ['creep', 'mold creep'], ['handsEvery', 'HANDS OFF every s'], ['charge', 'charge s'], ['burn', 'burn s'],
    ['stealEvery', 'steal after s'], ['standEyes', 'stand: eyes'], ['standTime', 'stand: clock s'], ['standBurn', 'stand: full burn by s'], ['red', 'stand: red s'], ['blue', 'stand: blue s']];
  let gpFilled = false, gpStage = '';
  const gpSet = set => toGame({ type: 'test', act: 'g0dfset', set });
  onGame('test-state', m => {
    gpStage = m.g0df || '';
    for (const b of document.querySelectorAll('#g0d button.gp')) b.classList.toggle('on', !!b.dataset.stage && b.dataset.stage === gpStage);
    if (!gpFilled && m.g0dfCfg) {
      gpFilled = true;
      $('#gpNums').innerHTML = GP_NUMS.map(([k, label]) => `<label title="${esc(k)}">${esc(label)} <input type="number" step="any" data-k="${esc(k)}" value="${esc(m.g0dfCfg[k])}" style="width:4.5em"></label>`).join(' ');
      $('#gpBoy').checked = !!m.g0dfCfg.boy; $('#gpSkip').checked = !!m.g0dfCfg.skipCine; $('#gpTap').checked = !!m.g0dfCfg.tapSkip;
    }
  });
  $('#gpNums').addEventListener('change', ev => { const i = ev.target.closest('input[data-k]'); if (!i || i.value === '') return; gpSet({ [i.dataset.k]: Number(i.value) }); log(`${i.dataset.k} = ${i.value} (the next stage you start uses it)`); });
  $('#gpTap').addEventListener('change', () => { gpSet({ tapSkip: $('#gpTap').checked }); log($('#gpTap').checked ? 'a tap skips cinematics' : 'cinematics play out'); });
  $('#gpSkip').addEventListener('change', () => { gpSet({ skipCine: $('#gpSkip').checked }); log($('#gpSkip').checked ? 'cinematics: skipped' : 'cinematics: played'); });
  $('#gpBoy').addEventListener('change', () => { gpSet({ boy: $('#gpBoy').checked }); log($('#gpBoy').checked ? 'b0y is in' : 'b0y is out'); });
  $('#g0d').addEventListener('click', ev => {
    const hv = ev.target.closest('button.hv');
    if (hv) { log(hv.dataset.to === 'maze' ? 'into the maze...' : hv.dataset.to === 'fight' ? 'G0D wakes...' : 'heaven...'); return toGame({ type: 'test', act: 'heaven', where: hv.dataset.to }); }
    const gp = ev.target.closest('button.gp');
    if (gp) { log(gp.dataset.stage ? 'starting ' + gp.textContent + '...' : 'stopped'); return toGame({ type: 'test', act: 'g0df', stage: gp.dataset.stage }); }
    const hp = ev.target.closest('button.hp');
    if (hp) { const k = hp.dataset.key === bar ? '' : hp.dataset.key; log(k ? 'the health bar...' : 'health bar off'); return toGame({ type: 'test', act: 'g0dhp', key: k }); }
    const look = ev.target.closest('button.look'); if (look) return show(look.dataset.key);
    const b = ev.target.closest('button[data-g]'); if (!b) return;
    const g = b.dataset.g;
    if (g === 'off') return show('');
    if (g === 'still') { still = !still; draw(); return toGame({ type: 'test', act: 'g0dstill', on: still }); }
    if (!looks.length) return;
    const i = looks.findIndex(x => x[0] === cur), n = looks.length;
    show(looks[((i < 0 ? (g === 'next' ? -1 : 0) : i) + (g === 'next' ? 1 : -1) + n) % n][0]);
  });
})();
