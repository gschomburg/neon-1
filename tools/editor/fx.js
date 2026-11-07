// ---------------- FX: every effect's settings (dist/data/fx.js), live in the game, saved in place ----------------
// tools/data/fx_file.js says what each setting is and where the effect shows; engine/fx.js draws them. "show" asks the game
// (engine/editor.js fxscene / fxcard / fxdeath, or the G0D tab's mold glitch) to put the effect up on a loop.
(() => {
  const { $, toGame, onGame, toast, esc, clone } = NEON_ED;
  const F = window.NEON_FX_FILE;
  if (typeof FX_LOOKS === 'undefined' || !F) { $('#fxList').textContent = "Couldn't load ../dist/data/fx.js or fx_file.js."; return; }
  const build = NEON_ED.buildOf('data/fx.js'), file = NEON_ED.dataFile('fx.js');
  let fx = F.pick({ sets: { FX_GLITCH, FX_NOISE }, looks: FX_LOOKS }), saved = clone(fx);
  let lost = F.unknown({ sets: { FX_GLITCH, FX_NOISE }, looks: FX_LOOKS });   // settings this tab doesn't know: saving would drop them, so it won't save
  const MASK_W = 48, MASK_H = 14;   // the mask preview, in cells
  let maskT0 = performance.now();   // (its fade starts again when the mask changes)
  const dirty = () => JSON.stringify(fx) !== JSON.stringify(saved);
  // the game gets the looks with their shared sets filled in; this page's own FX_LOOKS too (the garble preview)
  let sendT = 0;
  const send = () => {
    const looks = F.expand(fx);
    for (const [k, v] of Object.entries(looks)) Object.assign(FX_LOOKS[k], v);
    clearTimeout(sendT); sendT = setTimeout(() => toGame({ type: 'fx', looks }), 60);
  };

  // ---- the cards: one per effect, each setting a field (numbers drag)
  const NUM = { ms: { step: 10, min: 0 }, share: { step: 0.01, min: 0, max: 1 }, num: { step: 0.1 }, cells: { step: 0.1 } };
  const KIND_TIP = { ms: 'milliseconds', share: '0 to 1', num: 'a number', cells: 'cells', pair: 'two numbers', col: "a palette name (accent, danger, money, bright...), '#hex' or 'ink:<hacker>'", chars: 'characters', sound: 'a Sound name' };
  const UNIT = { ms: ' ms', share: ' 0-1', cells: ' cells' };
  const numField = (look, k, i, v, step, attrs, label, kind) => '<label class="field" data-scrub="x" data-l="' + look + '" data-k="' + k + '"' + (i != null ? ' data-i="' + i + '"' : '') +
    ' title="' + esc(label) + (KIND_TIP[kind] ? ' (' + KIND_TIP[kind] + ')' : '') + ': drag sideways or type">' + '<span class="field-label">' + esc(label) + '<i style="opacity:.6">' + (UNIT[kind] || '') + '</i></span><input type="number" step="' + step + '"' + attrs + ' value="' + v + '"></label>';
  function field(look, Fd) {
    const v = look === '@sets' ? fx.sets[Fd.k] : fx.looks[look][Fd.k];
    if (Fd.kind === 'set') return '<label class="field shared" title="the shared set ' + Fd.set + ': edit it at the top"><span class="field-label">' + esc(Fd.label) + '</span><input type="text" disabled value="' + Fd.set + '"></label>';
    if (NUM[Fd.kind]) { const n = NUM[Fd.kind]; return numField(look, Fd.k, null, v, n.step, (n.min != null ? ' min="' + n.min + '"' : '') + (n.max != null ? ' max="' + n.max + '"' : ''), Fd.label, Fd.kind); }
    if (Fd.kind === 'pair') return v.map((x, i) => numField(look, Fd.k, i, x, Fd.step || 0.1, '', Fd.label.split(' / ')[i] || (i ? 'up to' : Fd.label), 'pair')).join('');
    const sw = Fd.kind === 'col' ? '<span class="sw"></span>' : '';
    return '<label class="field" data-l="' + look + '" data-k="' + Fd.k + '" title="' + esc(Fd.label + ': ' + (KIND_TIP[Fd.kind] || '')) + '">' + sw + '<span class="field-label">' + esc(Fd.label) + '</span><input type="text" value="' + esc(v) + '"></label>';
  }
  const showBtn = (s, i) => '<button data-show="' + i + '">' + esc(s.label) + '</button>';
  function render() {
    const html = ['<div class="fxc" id="fxSets"><h2>SHARED CHARACTERS</h2><p class="note">used by name in the effects below (one glitch set everywhere)</p><div class="fields">' +
      F.SETS.map(s => field('@sets', { k: s.name, kind: 'chars', label: s.label })).join('') + '</div></div>'];
    for (const L of F.LOOKS) {
      html.push('<div class="fxc" data-l="' + L.key + '"><h2>' + esc(L.title) + ' <code>' + L.key + '</code><button class="rv" title="Back to the saved settings">revert</button></h2>' +
        '<p class="note">' + esc(L.note) + '</p>' +
        '<div class="shows">' + (L.show.length ? L.show.map(showBtn).join('') : '<span class="note">nothing uses it now</span>') + '</div>' +
        '<div class="fields">' + L.fields.map(Fd => field(L.key, Fd)).join('') + '</div>' +
        (L.key === 'garble' ? '<div class="garble" id="fxGarble"></div>' : '') +
        (L.preview === 'mask' ? '<canvas class="fxmask" width="' + MASK_W * 8 + '" height="' + MASK_H * 14 + '" title="the mask (grey: its strength) with glitch and tint riding on it, on sample art"></canvas>' : '') + '</div>');
    }
    $('#fxList').innerHTML = html.join('');
    ScrubField.bindAll($('#fxList'));
    marks();
  }
  // which settings changed since the save, the swatches, the file line
  function marks() {
    for (const el of document.querySelectorAll('#fx .field[data-k]')) {
      const l = el.dataset.l, k = el.dataset.k, i = el.dataset.i;
      const get = o => { const v = l === '@sets' ? o.sets[k] : o.looks[l][k]; return i != null ? v[+i] : v; };
      el.classList.toggle('ch', JSON.stringify(get(fx)) !== JSON.stringify(get(saved)));
      const sw = el.querySelector('.sw');
      if (sw) { const c = get(fx); sw.style.background = /^#[0-9a-f]{3,8}$/i.test(c) ? c : 'transparent'; sw.title = c; }
    }
    for (const c of document.querySelectorAll('#fx .fxc[data-l]')) c.classList.toggle('ch', JSON.stringify(fx.looks[c.dataset.l]) !== JSON.stringify(saved.looks[c.dataset.l]));
    const d = dirty();
    $('#fxFile').textContent = file.where() + ' · ' + (d ? 'unsaved' : 'saved');
    $('#fxFile').classList.toggle('dirty', d);
  }
  // an edit: typing, or a drag (scrub = live while dragging)
  const edit = e => {
    const fl = e.target.closest('.field[data-k]');
    if (!fl || e.target.disabled) return;
    const l = fl.dataset.l, k = fl.dataset.k, i = fl.dataset.i, num = e.target.type === 'number';
    let v = num ? parseFloat(e.target.value) : e.target.value;
    if (num && !isFinite(v)) return;
    if (!num && !v) return;   // (an empty color or set would break the effect)
    const host = l === '@sets' ? fx.sets : fx.looks[l];
    if (i != null) host[k][+i] = v; else host[k] = v;
    if (l === 'mask') maskT0 = performance.now();
    send(); marks();
  };
  $('#fxList').addEventListener('input', edit);
  $('#fxList').addEventListener('scrub', edit, true);
  $('#fxList').addEventListener('click', e => {
    const card = e.target.closest('.fxc[data-l]');
    if (!card) return;
    const L = F.LOOKS.find(x => x.key === card.dataset.l);
    if (e.target.closest('.rv')) { fx.looks[L.key] = clone(saved.looks[L.key]); send(); render(); return; }
    const b = e.target.closest('button[data-show]');
    if (!b) return;
    const s = L.show[+b.dataset.show];
    if (s.scene) toGame({ type: 'test', act: 'fxscene', key: s.scene, frame: s.frame });
    else if (s.codex) toGame({ type: 'test', act: 'fxcodex' });
    else if (s.moldwipe) toGame({ type: 'test', act: 'moldwipe' });
    else if (s.card) toGame({ type: 'test', act: 'fxcard', key: s.card });
    else if (s.death) toGame({ type: 'test', act: 'fxdeath', key: s.death });
    else if (s.g0d) { toGame({ type: 'test', act: 'fxoff' }); toGame({ type: 'test', act: 'g0d', key: s.g0d }); }
    toast('showing ' + s.label);
  });
  $('#fxOff').onclick = () => { toGame({ type: 'test', act: 'fxoff' }); toast('stopped'); };
  // the garble line plays here, on this page's copy of the look
  setInterval(() => { const el = $('#fxGarble'); if (el && document.body.classList.contains('mode-fx')) el.textContent = 'loot: ' + FX.garble(['JUNK.DAT', 'JNK.DAT'], 1) + '   ' + FX.garble(['CORRUPT.EXE', 'CRPT.EXE'], 2); }, 60);
  // the mask preview (MASK and TINT cards): grey = the mask's strength, sample art over it, glitching (glitch.rate) and
  // pulling toward tint.col where it's strong. Drawn here from this page's FX_LOOKS (the game's palette isn't loaded:
  // a palette-name color shows as the game's default danger red).
  const SAMPLE = ['      |\\      ___         .-.     ', '   .--| |    |o o|   __   | |     ', '   |o | |  __|o o|  |oo|  |o|  _  ',
    '   |o | |_|oo|o o|__|oo|__|o|_|o| ', '  _|o |_|oo |o o|oo|oo|oo|o|o|o|_', ' |oo|o|oo|oo|o o|oo|oo|oo|o|o|o|o|', ' |oo|o|oo|oo|o o|oo|oo|oo|o|o|o|o|',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'];
  const tintHex = () => /^#[0-9a-f]{6}$/i.test(FX_LOOKS.tint.col) ? FX_LOOKS.tint.col : '#ff4d5e';
  const mixRGB = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)), A = p(a), B = p(b); return 'rgb(' + A.map((c, i) => Math.round(c + (B[i] - c) * k)).join(',') + ')'; };
  setInterval(() => {
    if (!document.body.classList.contains('mode-fx')) return;
    const now = performance.now(), W = FX.where(true), G = FX_LOOKS.glitch, T = FX_LOOKS.tint;
    for (const cv of document.querySelectorAll('#fx canvas.fxmask')) {
      const g = cv.getContext('2d');
      g.fillStyle = '#0b0d10'; g.fillRect(0, 0, cv.width, cv.height);
      g.font = '12px "JetBrains Mono", Consolas, monospace'; g.textBaseline = 'top';
      const y0 = Math.floor((MASK_H - SAMPLE.length) / 2);
      for (let y = 0; y < MASK_H; y++) for (let x = 0; x < MASK_W; x++) {
        const s = FX.mask(W, x, y, now, now - maskT0);
        if (s > 0) { g.fillStyle = 'rgba(200,210,220,' + (s * 0.35).toFixed(3) + ')'; g.fillRect(x * 8, y * 14, 8, 14); }
        const row = SAMPLE[y - y0], ch0 = row ? row[x - 7] : null;
        if (!ch0 || ch0 === ' ') continue;
        let ch = ch0, ink = mixRGB('#9aa4ad', tintHex(), Math.min(1, s * T.amount));
        if (s > 0 && FX.hash(x, y, FX.step(now, G.ms) + 77) < s * G.rate) { ch = FX.pick(G.set, FX.hash(x, y, FX.step(now, G.ms))); ink = '#ffffff'; }
        g.fillStyle = ink; g.fillText(ch, x * 8, y * 14 + 1);
      }
    }
  }, 50);
  // the game: our settings when it (re)loads
  onGame('ready', () => { if (dirty()) send(); });

  // ---- saving: the dist/data folder (the same one the TRAINING and ECONOMY tabs use, picked once; common.js dataDir)
  NEON_ED.dataDir.on(marks);
  async function saveFile() {
    if (lost.length) return toast('not saved: fx.js has settings this tab doesn\'t know (' + lost.join(', ') + '). add them to tools/data/fx_file.js first.');
    if (!dirty()) return toast('nothing to save');
    if (await file.save(F.text(Object.assign(clone(fx), { looks: F.expand(fx) }), build))) { saved = clone(fx); marks(); }
  }
  async function reload() {
    if (dirty() && !confirm('Drop your unsaved FX changes and load the file again?')) return;
    const t = await file.load();
    if (t == null) return;
    try {
      const m = F.parse(t); lost = F.unknown(m);
      if (lost.length) toast('the file has settings this tab doesn\'t know (it won\'t save): ' + lost.join(', '));
      fx = F.pick(m); saved = clone(fx); render(); send(); toast('loaded fx.js');
    } catch (e) { toast('reload failed: ' + e.message); }
  }
  $('#fxSave').onclick = saveFile;
  $('#fxReload').onclick = reload;
  NEON_ED.saveKey('mode-fx', saveFile);
  NEON_ED.warnUnsaved(dirty);
  render();
})();
