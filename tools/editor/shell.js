// ---------------- Shell: a readme for THE SHELL (dist/engine/shell.js, docs/SHELL.md) ----------------
// The command list comes from the game frame (engine/editor.js answers 'shell-get' with SHELL_CMDS), so this tab
// always shows what the game has. type / run put a line into the game's own shell.
(() => {
  const { $, esc, toGame, onGame } = NEON_ED;
  let data = null, q = '';
  // what an argument can be, in words
  const OF = { n: 'a number', s: 'text', mods: 'mods', gear: 'gear', corps: 'corps', hackers: 'hackers', events: 'sector events',
    anomalies: 'anomalies', ads: 'ads', scenes: 'quest scenes', feats: 'feats', steps: 'quest steps', palettes: 'palettes', commands: 'commands' };
  const usage = c => `<span class="shc">${esc(c.name)}</span>` + c.args.map(a => ` <span class="sha">${esc(a.opt ? `[${a.name}]` : `<${a.name}>`)}</span>`).join('');
  const argLine = a => {
    const what = a.list ? a.list.map(([v, h]) => `<code>${esc(v)}</code>${h ? ` <span class="dim">${esc(h)}</span>` : ''}`).join(', ')
      : a.of === 'n' || a.of === 's' ? OF[a.of]
      : `one of the ${OF[a.of] || a.of} <a class="shlist" data-of="${esc(a.of)}">(list, ${(data.lists[a.of] || []).length})</a>`;
    return `<div class="sharg"><span class="sha">${esc(a.name)}</span>${a.opt ? ' <span class="dim">(optional)</span>' : ''}: ${what}</div>`;
  };
  // an argument line, unless its name already says it all (on|off)
  const said = a => !(a.list && a.name === a.list.map(x => x[0]).join('|'));
  const row = c => {
    const ready = !c.args.some(a => !a.opt);
    return `<div class="shcmd" data-name="${esc(c.name)}">
      <div class="shtop"><span class="shuse">${usage(c)}</span>
        <span class="shchip ${c.safe ? '' : 'cheat'}" title="${c.safe ? 'leaves the run scored' : 'marks the run practice (not scored)'}">${c.safe ? 'safe' : 'practice'}</span>
        <span class="shhelp">${esc(c.help)}</span>
        ${c.alias.length ? `<span class="dim">also: ${c.alias.map(esc).join(', ')}</span>` : ''}
        <span class="shbtns"><button data-type="${esc(c.name)}" title="put it in the game's shell, to finish there">type</button>${ready ? `<button data-run="${esc(c.name)}" title="run it in the game now">run</button>` : ''}</span></div>
      ${c.args.filter(said).map(argLine).join('')}</div>`;
  };
  const render = () => {
    if (!data) { $('#shBody').innerHTML = '<p class="dim">waiting for the game frame...</p>'; return; }
    const list = data.cmds.filter(c => !q || [c.name, c.alias.join(' '), c.help, c.group, c.args.map(a => a.name).join(' ')].join(' ').toLowerCase().includes(q));
    $('#shCount').textContent = `${list.length} of ${data.cmds.length} commands`;
    const groups = [...new Set(list.map(c => c.group))];
    $('#shBody').innerHTML = (q ? '' : $('#shReadme').innerHTML) + (groups.map(g =>
      `<h2>${esc(g)}</h2>${list.filter(c => c.group === g).map(row).join('')}`).join('') || '<p>nothing matches.</p>');
  };
  $('#shFilter').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); render(); });
  $('#shBody').addEventListener('click', e => {
    const t = e.target.closest('[data-type]'), r = e.target.closest('[data-run]'), l = e.target.closest('a.shlist');
    if (t) toGame({ type: 'shell-type', line: t.dataset.type + (data.cmds.find(c => c.name === t.dataset.type).args.length ? ' ' : '') });
    if (r) toGame({ type: 'shell-run', line: r.dataset.run });
    if (l) {   // the full list, under its argument line
      const box = l.closest('.sharg'), open = box.querySelector('.shall');
      if (open) { open.remove(); return; }
      box.insertAdjacentHTML('beforeend', `<div class="shall">${(data.lists[l.dataset.of] || []).map(([v, h]) => `<span><code>${esc(v)}</code> <span class="dim">${esc(h || '')}</span></span>`).join('')}</div>`);
    }
  });
  onGame('shell-cmds', m => { data = m; render(); });
  onGame('ready', () => toGame({ type: 'shell-get' }));
  document.addEventListener('neon-mode', e => { if (e.detail === 'shell') { if (!data) toGame({ type: 'shell-get' }); render(); } });
  render();
})();
