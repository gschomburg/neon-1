// ---------------- Economy: every money number (dist/data/economy.js), in units ----------------
// The numbers on the left, grouped (each with its credits at the sector you pick); on the right, what they add up to:
// layer pay by nodes, a corp by level, and market prices. Edits go to the game as you type; "save" writes the file
// (tools/data/economy_file.js). Mod and item prices are edited with the mods (data/mods.js); they show here scaled.
(() => {
  const { $, toGame, onGame, toast, esc, clone } = NEON_ED;
  const F = window.NEON_ECON_FILE;
  if (typeof ECON === 'undefined' || !F) { $('#eList').textContent = "Couldn't load ../dist/data/economy.js or economy_file.js."; return; }
  const build = NEON_ED.buildOf('data/economy.js'), file = NEON_ED.dataFile('economy.js');
  let econ = F.pick(ECON), saved = F.pick(ECON), sector = 0;
  let lost = F.unknown(ECON);   // numbers the file has and this tab doesn't know: saving would drop them, so it won't save
  const dirty = () => JSON.stringify(econ) !== JSON.stringify(saved);
  let sendT = 0;
  const send = () => { clearTimeout(sendT); sendT = setTimeout(() => toGame({ type: 'econ', econ }), 120); };
  // credits for u units of a side, at a sector (0 = the first)
  const unitAt = (side, s) => econ[side].unit * (1 + econ[side].grow * s);
  const cr = (side, u, s = sector) => Math.round(u * unitAt(side, s));

  // ---- the numbers
  // the units (earn.* / spend.*) go in their own bar at the top; everything else in the list
  const isUnit = it => it.path ? /^(earn|spend)\./.test(it.path) : it.sec === 'Units';
  function renderList() {
    const units = F.INFO.find(it => it.sec === 'Units');
    $('#eUnits').innerHTML = '<div class="eu-h"><b>UNITS</b>' + esc(units ? units.note : '') + '</div>' + F.INFO.filter(it => it.path && isUnit(it)).map(row).join('');
    $('#eList').innerHTML = F.INFO.filter(it => !isUnit(it)).map(row).join('');
    values();
  }
  // how each kind is labeled and colored
  const KCLASS = { earn: 'cr', spend: 'cr', cr: 'cr', grow: 'grow', x: 'x', xlist: 'x', pct: 'pct', pctlist: 'pct', n: 'n', nlist: 'n' };
  const KLABEL = { earn: 'earn units', spend: 'spend units', cr: 'credits', grow: 'growth', x: '× multiplier', xlist: '× by rarity', pct: '% share', pctlist: '% by rarity', n: 'count', nlist: 'count by rarity' };
  function row(it) {
      if (it.sec) return '<h2>' + esc(it.sec) + '</h2>' + (it.note ? '<p class="snote">' + esc(it.note) + '</p>' : '');
      const v = F.get(econ, it.path);
      const step = /pct|grow/.test(it.kind) ? '0.01' : it.kind === 'cr' || /^n/.test(it.kind) ? '1' : '0.1';
      const inp = Array.isArray(v)   // a list: one per rarity step
        ? v.map((x, i) => '<input class="l" type="number" step="' + step + '" data-p="' + it.path + '" data-i="' + i + '" value="' + x + '" title="rarity step ' + (i + 1) + '">').join(' ')
        : '<input type="number" step="' + step + '" data-p="' + it.path + '" value="' + v + '">';
      return '<div class="er" data-p="' + it.path + '"><div class="lab"><b>' + esc(it.label) + '</b><span class="k k-' + KCLASS[it.kind] + '">' + KLABEL[it.kind] + '</span>' +
        (it.note ? '<span class="n">' + esc(it.note) + '</span>' : '') + '</div><div>' + inp + '<button class="rv" title="Back to the saved value">revert</button></div><div class="v"></div></div>';
  }
  // each row's credits (and which rows changed)
  function values() {
    for (const row of document.querySelectorAll('#econ .er')) {
      const it = F.INFO.find(i => i.path === row.dataset.p), v = F.get(econ, it.path);
      // each kind looks different: credits (gold, "= 20cr"), multipliers (cyan, "× 1.5"), shares (purple, "25%"), counts
      const pctS = x => Math.round(x * 1000) / 10 + '%', list = a => a.join('<i> / </i>');
      let t = '';
      if (it.kind === 'earn' || it.kind === 'spend') {
        t = '= ' + cr(it.kind, v) + 'cr';
        if (econ[it.kind].grow) t += ' <i>(' + [0, 1, 2].map(s => 's' + (s + 1) + ' ' + cr(it.kind, v, s)).join(' · ') + ')</i>';
      } else if (it.kind === 'pct') t = pctS(v);
      else if (it.kind === 'pctlist') t = list(v.map(pctS)) + ' <i>by rarity step</i>';
      else if (it.kind === 'grow') t = v ? '+' + Math.round(v * 100) + '% a sector <i>(× ' + [0, 1, 2].map(s => (1 + v * s).toFixed(2)).join(' / ') + ')</i>' : 'no growth';
      else if (it.kind === 'x') t = '× ' + v;
      else if (it.kind === 'xlist') t = list(v.map(x => '× ' + x)) + ' <i>by rarity step</i>';
      else if (it.kind === 'n') t = v + ' times';
      else if (it.kind === 'nlist') t = list(v.map(x => '+' + x)) + ' <i>by rarity step</i>';
      else if (it.kind === 'cr') t = v + 'cr';
      const vEl = row.querySelector('.v');
      vEl.innerHTML = t;
      vEl.className = 'v v-' + KCLASS[it.kind];
      row.classList.toggle('ch', JSON.stringify(v) !== JSON.stringify(F.get(saved, it.path)));
    }
    const d = dirty();
    $('#eFile').textContent = file.where() + ' · ' + (d ? 'unsaved' : 'saved');
    $('#eFile').classList.toggle('dirty', d);
    preview();
  }
  $('#econ').addEventListener('input', e => {
    const el = e.target.closest('input[data-p]');
    if (!el) return;
    const v = +el.value;
    if (!isFinite(v)) return;
    if (el.dataset.i != null) F.get(econ, el.dataset.p)[+el.dataset.i] = v; else F.set(econ, el.dataset.p, v);
    send(); values();
  });
  $('#econ').addEventListener('click', e => {
    const b = e.target.closest('.rv'), row = e.target.closest('.er');
    if (!b || !row) return;
    F.set(econ, row.dataset.p, JSON.parse(JSON.stringify(F.get(saved, row.dataset.p))));
    send(); renderList();
  });
  for (const b of document.querySelectorAll('#eSec button')) b.addEventListener('click', () => {
    sector = +b.dataset.s;
    for (const x of document.querySelectorAll('#eSec button')) x.classList.toggle('on', x === b);
    values();
  });

  // ---- what it adds up to
  // a layer's pay, the way the game works it out (engine/run.js payFor), without mods or corp twists
  const layerPay = (n, boss, perfect, s = sector) => {
    if (n <= 1) return 0;
    let base = (econ.pay.base + econ.pay.perNode * n) * unitAt('earn', s);
    if (boss) base *= econ.pay.boss;
    const mult = perfect ? econ.pay.perfect + econ.pay.perfectPerNode * (n - 1) : 1;
    return Math.round(base * mult);
  };
  const corpPay = (lvl, perfect) => [0, 1, 2, 3, 4].reduce((a, i) => a + layerPay(Math.max(2, Math.min(12, lvl + 1 + i)), i === 4, perfect), 0);
  function preview() {
    const s = sector, rows = [];
    rows.push('<h2>A layer pays</h2><p class="note">sector ' + (s + 1) + ', before mods and corp twists</p><table><tr><th>nodes</th><th>normal</th><th>perfect</th><th>boss</th><th>boss perfect</th></tr>');
    for (const n of [2, 3, 4, 6, 8, 10, 12]) rows.push('<tr><td>' + n + '</td><td>' + layerPay(n, 0, 0) + '</td><td>' + layerPay(n, 0, 1) + '</td><td>' + layerPay(n, 1, 0) + '</td><td>' + layerPay(n, 1, 1) + '</td></tr>');
    rows.push('</table>');
    rows.push('<h2>A corp pays (5 layers)</h2><table><tr><th>level</th><th>no perfects</th><th>all perfect</th></tr>');
    for (let l = 1; l <= 6; l++) rows.push('<tr><td>LV' + l + '</td><td>' + corpPay(l, 0) + '</td><td>' + corpPay(l, 1) + '</td></tr>');
    rows.push('</table>');
    // market prices: what the game charges (price x rarity step x the spend unit / 10)
    const scale = unitAt('spend', s) / 10, tp = econ.tierPrice;
    const price = (p, t) => Math.round(p * tp[t] * scale);
    rows.push('<h2>Market prices</h2><p class="note">sector ' + (s + 1) + '. at each rarity step (edit base prices in data/mods.js). repair: ' + cr('spend', econ.repair) + 'cr</p>');
    rows.push('<table><tr><th>item</th><th>base</th><th>step 1</th><th>step 2</th><th>step 3</th></tr>');
    for (const d of Object.values(ITEMS).sort((a, b) => a.price - b.price)) rows.push('<tr><td>' + esc(d.name) + '</td><td>' + d.price + '</td><td>' + price(d.price, 0) + '</td><td>' + price(d.price, 1) + '</td><td>' + price(d.price, 2) + '</td></tr>');
    rows.push('</table><table style="margin-top:8px"><tr><th>mod</th><th>base</th><th>step 1</th><th>step 2</th><th>step 3</th></tr>');
    for (const d of Object.values(MODS).filter(d => d.price).sort((a, b) => a.price - b.price)) rows.push('<tr><td>' + esc(d.name) + '</td><td>' + d.price + '</td><td>' + price(d.price, 0) + '</td><td>' + price(d.price, 1) + '</td><td>' + price(d.price, 2) + '</td></tr>');
    rows.push('</table>');
    $('#ePrev').innerHTML = rows.join('');
  }

  // ---- the game: our numbers when it (re)loads
  onGame('ready', send);

  // ---- saving: the dist/data folder (the same one the TRAINING tab uses, picked once; common.js dataDir)
  NEON_ED.dataDir.on(values);
  async function saveFile() {
    if (lost.length) return toast('not saved: economy.js has numbers this tab doesn\'t know (' + lost.join(', ') + '). add them to tools/data/economy_file.js INFO first.');
    if (!dirty()) return toast('nothing to save');
    if (await file.save(F.text(econ, build))) { saved = clone(econ); values(); }
  }
  async function reload() {
    if (dirty() && !confirm('Drop your unsaved economy changes and load the file again?')) return;
    const t = await file.load();
    if (t == null) return;
    try {
      const e = F.parse(t); lost = F.unknown(e);
      if (lost.length) toast('the file has numbers this tab doesn\'t know (it won\'t save): ' + lost.join(', '));
      econ = F.pick(e); saved = F.pick(e); renderList(); send(); toast('loaded economy.js');
    } catch (e) { toast('reload failed: ' + e.message); }
  }
  $('#eSave').onclick = saveFile;
  $('#eReload').onclick = reload;
  NEON_ED.saveKey('mode-econ', saveFile);
  NEON_ED.warnUnsaved(dirty);
  renderList();
})();
