// ---------------- Terminal: a readme for THE TERMINAL (dist/engine/terminal.js, docs/TERMINAL.md) ----------------
// The command list comes from the game frame (engine/editor.js answers 'term-get' with TERM_CMDS), so this tab
// always shows what the game has. type / run put a line into the game's own terminal.
(() => {
  const { $, esc, toGame, onGame } = NEON_ED;
  let data = null, q = '';
  // what an argument can be, in words
  const OF = { n: 'a number', s: 'text', mods: 'mods', gear: 'gear', corps: 'corps', hackers: 'hackers', events: 'sector events',
    anomalies: 'anomalies', ads: 'ads', scenes: 'quest scenes', feats: 'feats', steps: 'quest steps', palettes: 'palettes', commands: 'commands' };
  const usage = c => `<span class="tmc">${esc(c.name)}</span>` + c.args.map(a => ` <span class="tma">${esc(a.opt ? `[${a.name}]` : `<${a.name}>`)}</span>`).join('');
  const argLine = a => {
    const what = a.list ? a.list.map(([v, h]) => `<code>${esc(v)}</code>${h ? ` <span class="dim">${esc(h)}</span>` : ''}`).join(', ')
      : a.of === 'n' || a.of === 's' ? OF[a.of]
      : `one of the ${OF[a.of] || a.of} <a class="tmlist" data-of="${esc(a.of)}">(list, ${(data.lists[a.of] || []).length})</a>`;
    return `<div class="tmarg"><span class="tma">${esc(a.name)}</span>${a.opt ? ' <span class="dim">(optional)</span>' : ''}: ${what}</div>`;
  };
  // an argument line, unless its name already says it all (on|off)
  const said = a => !(a.list && a.name === a.list.map(x => x[0]).join('|'));
  const row = c => {
    const ready = !c.args.some(a => !a.opt);
    return `<div class="tmcmd" data-name="${esc(c.name)}">
      <div class="tmtop"><span class="tmuse">${usage(c)}</span>
        <span class="tmchip ${c.safe ? '' : 'cheat'}" title="${c.safe ? 'leaves the run scored' : 'marks the run practice (not scored)'}">${c.safe ? 'safe' : 'practice'}</span>
        <span class="tmhelp">${esc(c.help)}</span>
        ${c.alias.length ? `<span class="dim">also: ${c.alias.map(esc).join(', ')}</span>` : ''}
        <span class="tmbtns"><button data-type="${esc(c.name)}" title="put it in the game's terminal, to finish there">type</button>${ready ? `<button data-run="${esc(c.name)}" title="run it in the game now">run</button>` : ''}</span></div>
      ${c.args.filter(said).map(argLine).join('')}</div>`;
  };
  const render = () => {
    if (!data) { $('#tmBody').innerHTML = '<p class="dim">waiting for the game frame...</p>'; return; }
    const list = data.cmds.filter(c => !q || [c.name, c.alias.join(' '), c.help, c.group, c.args.map(a => a.name).join(' ')].join(' ').toLowerCase().includes(q));
    $('#tmCount').textContent = `${list.length} of ${data.cmds.length} commands`;
    const groups = [...new Set(list.map(c => c.group))];
    $('#tmBody').innerHTML = (q ? '' : $('#tmReadme').innerHTML) + (groups.map(g =>
      `<h2>${esc(g)}</h2>${list.filter(c => c.group === g).map(row).join('')}`).join('') || '<p>nothing matches.</p>');
  };
  $('#tmFilter').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); render(); });
  $('#tmBody').addEventListener('click', e => {
    const t = e.target.closest('[data-type]'), r = e.target.closest('[data-run]'), l = e.target.closest('a.tmlist');
    if (t) toGame({ type: 'term-type', line: t.dataset.type + (data.cmds.find(c => c.name === t.dataset.type).args.length ? ' ' : '') });
    if (r) toGame({ type: 'term-run', line: r.dataset.run });
    if (l) {   // the full list, under its argument line
      const box = l.closest('.tmarg'), open = box.querySelector('.tmall');
      if (open) { open.remove(); return; }
      box.insertAdjacentHTML('beforeend', `<div class="tmall">${(data.lists[l.dataset.of] || []).map(([v, h]) => `<span><code>${esc(v)}</code> <span class="dim">${esc(h || '')}</span></span>`).join('')}</div>`);
    }
  });
  onGame('term-cmds', m => { data = m; render(); });
  onGame('ready', () => toGame({ type: 'term-get' }));
  document.addEventListener('neon-mode', e => { if (e.detail === 'term') { if (!data) toGame({ type: 'term-get' }); render(); } });
  render();
})();
