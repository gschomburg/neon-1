(() => {
  'use strict';
  const { $ } = NEON_ED;
  const LEVELS = ['pad + bass', '+ drums', '+ arp', '+ lead (boss)', 'final boss'];
  const TAGS_KEY = 'neon.music.tags';
  let tags = {};
  try { tags = JSON.parse(localStorage.getItem(TAGS_KEY) || '{}'); } catch (e) { tags = {}; }
  const saveTags = () => { try { localStorage.setItem(TAGS_KEY, JSON.stringify(tags)); } catch (e) { /* private mode */ } };

  // Where each track plays: the corps by name, plus the shared spots.
  const PLACES = { menu: 'title + menus', map: 'map, markets, caches', omni: 'OMNI//CORE', theme: 'theme' };
  const usedBy = k => k in DEMOS ? ['engine demo (not in the game)'] : Object.keys(MUSIC_FOR).filter(p => MUSIC_FOR[p] === k).map(p => PLACES[p] || (CORPS[p] && CORPS[p].name) || p.toUpperCase());
  const keyName = s => `${NOTE_NAMES[s.root % 12]} ${s.scale}`;
  const groove = s => s.style === 'ambient' ? 'ambient' : (s.drums || '') + (s.meter === 3 ? ' 3/4' : s.meter === 6 ? ' 6/8' : s.meter === 5 ? ' 5/4' : '') + (s.swing ? ' swing' : '');
  // the band: what differs from the original synthwave sound
  const band = s => s.style === 'ambient' ? '' : [s.kit && s.kit !== 'synth' ? s.kit + ' kit' : '', s.bassVoice && s.bassVoice !== 'saw' ? s.bassVoice + ' bass' : '',
    s.padVoice && s.padVoice !== 'saw' ? (s.padVoice === 'none' ? 'no pad' : s.padVoice + ' pad') : '', s.arpVoice && s.arpVoice !== 'square' ? s.arpVoice + ' arp' : '',
    s.leadVoice && s.leadVoice !== 'square' ? s.leadVoice + ' lead' : '', s.pump != null && s.pump < 1 ? (s.pump ? 'light pump' : 'no pump') : '',
    s.melody ? 'own melody' : '', s.bassLine ? 'bass riff' : '', s.beat ? 'own beat' : '', s.stab ? 'stabs' : '', s.gate ? 'gated pad' : '', s.breakdown ? 'breakdowns' : ''].filter(Boolean).join(', ');
  // ---- where tracks play: changes made in the corps view, remembered in this browser like the stars.
  // The game's files don't change; "copy assignments" hands them over.
  const ASSIGN_KEY = 'neon.music.assign';
  const ORIG_FOR = Object.assign({}, MUSIC_FOR);
  try {
    const a = JSON.parse(localStorage.getItem(ASSIGN_KEY) || '{}');
    for (const [pl, k] of Object.entries(a)) if (pl in MUSIC_FOR || pl in CORPS) { if (!k) delete MUSIC_FOR[pl]; else if (SONGS[k]) MUSIC_FOR[pl] = k; }
  } catch (e) { /* nothing saved */ }
  // every place: the shared ones, then each corp (a corp may have no track of its own: it plays the map track)
  const lvOf = pl => CORPS[pl] ? CORPS[pl].level || 1 : 0;
  const ALL_PLACES = [...new Set([...Object.keys(MUSIC_FOR), ...Object.keys(CORPS)])]
    .sort((a, b) => lvOf(a) - lvOf(b) || (CORPS[a] && CORPS[b] ? CORPS[a].name.localeCompare(CORPS[b].name) : 0));
  const changedPlaces = () => ALL_PLACES.filter(pl => MUSIC_FOR[pl] !== ORIG_FOR[pl]);
  const saveAssign = () => {
    const a = {}; for (const pl of changedPlaces()) a[pl] = MUSIC_FOR[pl] || '';
    try { localStorage.setItem(ASSIGN_KEY, JSON.stringify(a)); } catch (e) { /* private mode */ }
  };

  const tracks = Object.keys(SONGS).map(k => ({ k, s: SONGS[k], used: usedBy(k) }));
  const refreshUsed = () => { for (const t of tracks) t.used = usedBy(t.k); };
  const order = {}; tracks.forEach((t, i) => { order[t.k] = i; });

  // ---- families: which tracks are built alike.
  // "written": the track has its own melody / riff / beat. "recipe": the engine builds it from a few picks
  // (bass, drums and arp patterns, scale, chords), so recipe tracks that share those picks sound like one song.
  // A track made from another one says so with from: 'thatkey' in its line, and joins that track's family.
  const WRITTEN = ['melody', 'bassLine', 'beat', 'arpLine', 'stab'];
  const madeOf = s => s.style === 'ambient' ? 'ambient' : WRITTEN.some(f => s[f]) ? 'written' : 'recipe';
  const soundOf = s => [s.kit || 'synth', s.bassVoice || 'saw', s.padVoice || 'saw', s.arpVoice || 'square'].join();
  function likeness(a, b) {
    if ((a.meter || 4) !== (b.meter || 4)) return { same: [], score: 0 };
    const same = ['bass', 'drums', 'arp', 'scale'].filter(f => a[f] && a[f] === b[f]);
    if (a.prog && b.prog && a.prog.join() === b.prog.join()) same.push('chords');
    return { same, score: same.length + (Math.abs(a.bpm - b.bpm) <= 8 ? 0.5 : 0) + (soundOf(a) === soundOf(b) ? 0.5 : 0) };
  }
  let fam = {};   // track -> { made, like, same, root, size, kids }
  function families() {
    fam = {};
    const parent = {};
    const find = k => parent[k] === k ? k : (parent[k] = find(parent[k]));
    const join = (a, b) => { a = find(a); b = find(b); if (a !== b) { if (order[a] < order[b]) parent[b] = a; else parent[a] = b; } };
    for (const t of tracks) { parent[t.k] = t.k; fam[t.k] = { made: madeOf(t.s), like: '', same: [], kids: 0 }; }
    for (const t of tracks) {
      const f = fam[t.k], s = t.s;
      // made from another track: that track names the family
      if (s.from && SONGS[s.from]) { f.like = s.from; f.from = true; const a = find(t.k), b = find(s.from); if (a !== b) parent[a] = b; fam[s.from].kids++; continue; }
      if (f.made !== 'recipe') continue;
      let best = null, bestL = null;
      for (const o of tracks) {
        if (o.k === t.k || fam[o.k].made !== 'recipe') continue;
        const l = likeness(s, o.s);
        if (!bestL || l.score > bestL.score) { best = o.k; bestL = l; }
        // the same bass, drums, arp and scale: the same song in another key / tempo
        if (['bass', 'drums', 'arp', 'scale'].every(x => l.same.includes(x))) join(t.k, o.k);
      }
      if (best && bestL.score >= 2) { f.like = best; f.same = bestL.same; }
    }
    const size = {};
    for (const t of tracks) { const r = find(t.k); fam[t.k].root = r; size[r] = (size[r] || 0) + 1; }
    for (const t of tracks) fam[t.k].size = size[fam[t.k].root];
  }
  families();
  const famName = k => fam[k] && fam[k].size > 1 ? SONGS[fam[k].root].name : '';
  const likeHtml = k => {
    const f = fam[k]; if (!f) return '';
    const chip = f.size > 1 ? `<span class="fam" title="${f.size} tracks in this family">${SONGS[f.root].name} ×${f.size}</span>` : '';
    if (f.from) return `${chip}from <b>${SONGS[f.like].name}</b>`;
    if (f.made === 'written') return `${chip}<span class="dim">its own parts</span>${f.kids ? ` · ${f.kids} made from it` : ''}`;
    if (f.made === 'ambient') return '<span class="dim">ambient</span>';
    return chip + (f.like ? `like <b>${SONGS[f.like].name}</b> <span class="dim">(same ${f.same.join(', ')})</span>` : '<span class="dim">nothing close</span>');
  };
  const likeText = k => { const f = fam[k]; return f ? [famName(k), f.like ? (f.from ? 'from ' : 'like ') + SONGS[f.like].name : '', f.made].filter(Boolean).join(' ') : ''; };

  // ---- what this mode asks the game to play. The game plays it (engine/editor.js), so it's what the game sounds like.
  // follow: play what the game's screen plays (a corp picked from the list); otherwise the picked track.
  // level: 0-4, or 'game' (the level the game's screen gives it).
  const NE = window.NE;
  const PREF_KEY = 'neon.editor.music';
  const p = { key: null, place: null, follow: false, playing: false, level: 2, urgency: 0, low: false, sfx: false, volume: 0.8, restart: 0, stage: null };
  try { const o = JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); for (const k of ['level', 'sfx', 'volume']) if (k in o) p[k] = o[k]; } catch (e) { /* nothing saved */ }
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify({ level: p.level, sfx: p.sfx, volume: p.volume })); } catch (e) { /* private mode */ } };
  function sendCtl(restart) {
    if (restart) p.restart = Date.now();
    NE.toGame({ type: 'music-ctl', playing: p.playing, key: p.follow ? null : p.key, level: p.level === 'game' ? null : p.level,
      urgency: p.urgency, low: p.low, sfx: p.sfx, volume: p.volume, restart: p.restart, section: p.stage });
    savePrefs();
  }
  // the changed tracks (and the engine demos, which only live here) and changed assignments, to the game
  let dataT = 0;
  function sendData(now) {
    clearTimeout(dataT);
    const go = () => {
      const songs = {};
      for (const k of Object.keys(DEMOS)) songs[k] = SONGS[k];
      for (const k of Object.keys(orig)) if (SONGS[k]) songs[k] = SONGS[k];
      const assign = {}; for (const pl of changedPlaces()) assign[pl] = MUSIC_FOR[pl] || '';
      NE.toGame({ type: 'music-data', songs, assign });
    };
    if (now) go(); else dataT = setTimeout(go, 40);
  }
  const start = () => {};

  // ---- the list
  let sortK = 'order', sortDir = 1, filter = '', tagFilter = 'all';
  const val = (t, k) => k === 'name' ? t.s.name : k === 'made' ? fam[t.k].made : k === 'like' ? (famName(t.k) || '~') + '|' + (fam[t.k].like ? SONGS[fam[t.k].like].name : '') + '|' + t.s.name :k === 'bpm' ? t.s.bpm : k === 'key' ? keyName(t.s) : k === 'style' ? groove(t.s)
    : k === 'bass' ? (t.s.bass || '') : k === 'arp' ? (t.s.arp || '') + (t.s.pingpong ? ' ping-pong' : '') : k === 'band' ? band(t.s) : k === 'used' ? t.used.join(', ') : k === 'tag' ? (tags[t.k] && tags[t.k].tag) || '' : k === 'stars' ? starsOf(t.k) : 0;
  function visible() {
    const f = filter.toLowerCase();
    let out = tracks.filter(t => {
      const tg = (tags[t.k] && tags[t.k].tag) || '';
      if (tagFilter === 'none' ? tg : tagFilter !== 'all' && tg !== tagFilter) return false;
      return !f || [t.s.name, keyName(t.s), groove(t.s), band(t.s), t.s.bass, t.s.arp, t.used.join(' '), t.s.bpm, likeText(t.k)].join(' ').toLowerCase().includes(f);
    });
    if (sortK !== 'order') out = out.slice().sort((a, b) => { const x = val(a, sortK), y = val(b, sortK); return (x > y ? 1 : x < y ? -1 : 0) * sortDir; });
    return out;
  }
  function renderList() {
    families();
    if (document.getElementById('music').classList.contains('corps')) renderCorps();
    const vis = visible();
    $('#rows').innerHTML = vis.map(t => {
      const tg = tags[t.k] && tags[t.k].tag;
      return `<tr class="track${t.k === p.key ? ' playing' : ''}${t.k in DEMOS ? ' demo' : ''}${SONGS[t.k] && SONGS[t.k].tag === 'g0d' ? ' god' : ''}" data-k="${t.k}">
        <td class="name">${t.s.name}</td><td><span class="made ${fam[t.k].made}">${fam[t.k].made}</span></td><td class="like">${likeHtml(t.k)}</td><td class="num mono">${t.s.bpm}</td><td class="mono">${keyName(t.s)}</td><td>${groove(t.s)}</td>
        <td>${t.s.bass || ''}</td><td>${t.s.arp || ''}${t.s.pingpong ? ' <span class="dim">ping-pong</span>' : ''}${t.s.tick ? ' <span class="dim">tick</span>' : ''}</td>
        <td class="band">${band(t.s)}${orig[t.k] ? ' <span class="edited">(tried)</span>' : ''}</td>
        <td class="used">${t.used.join(', ') || '<span class="dim">unused</span>'}</td>
        <td>${starsHtml(t.k)}</td>
        <td>${tg ? `<span class="tag ${tg}">${tg}</span>` : ''}${tags[t.k] && tags[t.k].note ? ' <span class="dim" title="has a note">*</span>' : ''}</td></tr>`;
    }).join('');
    const n = k => Object.values(tags).filter(x => x.tag === k).length;
    if (!document.getElementById('music').classList.contains('corps'))
      $('#mCount').textContent = `${vis.length} of ${tracks.length} tracks · rated ${Object.values(tags).filter(x => x.stars).length} · keep ${n('keep')} · maybe ${n('maybe')} · cut ${n('cut')}`;
    document.querySelectorAll('#trackTable th').forEach(th => th.classList.toggle('sorted', th.dataset.k === sortK));
  }

  // ---- the corps view: every place a track plays, which ones need a new track, and a picker to change it
  let corpFilter = 'all';
  const placeName = pl => PLACES[pl] || (CORPS[pl] && CORPS[pl].name) || pl.toUpperCase();
  const needOf = pl => {   // 2: needs a track (cut or 1 star), 1: weak (2 stars)
    const k = MUSIC_FOR[pl], tg = tags[k] && tags[k].tag, n = starsOf(k);
    return !k || !SONGS[k] || tg === 'cut' || n === 1 ? 2 : n === 2 ? 1 : 0;
  };
  function trackOptions(cur) {
    const opt = t => `<option value="${t.k}"${t.k === cur ? ' selected' : ''}>${starsOf(t.k) ? '★' + starsOf(t.k) + ' ' : ''}${t.s.name}${t.k in DEMOS ? ' (demo)' : ''}${famName(t.k) && famName(t.k) !== t.s.name ? ' · ' + famName(t.k) : ''}${tags[t.k] && tags[t.k].tag === 'cut' ? ' · cut' : ''}</option>`;
    const by = ts => ts.slice().sort((a, b) => starsOf(b.k) - starsOf(a.k) || a.s.name.localeCompare(b.s.name)).map(opt).join('');
    const used = new Set(Object.values(MUSIC_FOR));
    return (cur ? '' : `<option value="" selected>(none: plays the map track)</option>`) + `<optgroup label="written (own parts)">${by(tracks.filter(t => fam[t.k].made === 'written'))}</optgroup>` +
      `<optgroup label="free (playing nowhere)">${by(tracks.filter(t => fam[t.k].made !== 'written' && !used.has(t.k)))}</optgroup>` +
      `<optgroup label="already playing somewhere">${by(tracks.filter(t => fam[t.k].made !== 'written' && used.has(t.k)))}</optgroup>`;
  }
  let shownPlaces = [];
  function renderCorps() {
    const f = filter.toLowerCase();
    const places = ALL_PLACES.filter(pl => {
      if (corpFilter === 'need' && needOf(pl) < 2) return false;
      if (corpFilter === 'changed' && MUSIC_FOR[pl] === ORIG_FOR[pl]) return false;
      const k = MUSIC_FOR[pl];
      return !f || [placeName(pl), SONGS[k] ? SONGS[k].name : 'map track', likeText(k)].join(' ').toLowerCase().includes(f);
    });
    shownPlaces = places;
    $('#crows').innerHTML = places.map(pl => {
      const k = MUSIC_FOR[pl], s = SONGS[k], nd = needOf(pl), ch = MUSIC_FOR[pl] !== ORIG_FOR[pl];
      return `<tr class="place${pl === p.place ? ' sel' : trackFor(pl) === p.key ? ' playing' : ''}" data-pl="${pl}">
        <td class="lv">${CORPS[pl] ? CORPS[pl].level || 1 : ''}</td><td class="pname">${placeName(pl)}</td><td>${s ? s.name : `<span class="dim">none (map track: ${SONGS[MUSIC_FOR.map].name})</span>`}${ch ? ` <span class="chg" title="was ${wasName(pl)}">changed</span>` : ''}</td>
        <td>${s ? starsHtml(k) : ''}</td><td><span class="made ${fam[k] ? fam[k].made : ''}">${fam[k] ? fam[k].made : ''}</span></td><td class="like">${likeHtml(k)}</td>
        <td>${nd === 2 ? '<span class="need">needs a track</span>' : nd === 1 ? '<span class="weak">weak</span>' : ''}${ch ? ` <button class="sm" data-undo="${pl}">undo</button>` : ''}</td>
        <td><select data-pl="${pl}">${trackOptions(k)}</select></td></tr>`;
    }).join('');
    const all = ALL_PLACES;
    $('#mCount').textContent = `${places.length} of ${all.length} places · ${all.filter(pl => needOf(pl) === 2).length} need a track · ${changedPlaces().length} changed`;
  }
  const wasName = pl => SONGS[ORIG_FOR[pl]] ? SONGS[ORIG_FOR[pl]].name : 'none (the map track)';
  function assign(pl, k) {
    if (k) MUSIC_FOR[pl] = k; else delete MUSIC_FOR[pl];
    saveAssign(); refreshUsed(); sendData(true);
    if (p.place === pl) pick(trackFor(pl), true, pl); else showPlace(pl);
  }
  // A place picked in the list: the game shows it (a corp: one of its layers) and plays what it plays there.
  function showPlace(pl) {
    const corp = CORPS[pl] ? pl : null;
    if (corp) NE.showCorp(corp); else NE.runScene(pl === 'menu' ? 'title' : 'map');
    pick(trackFor(pl), true, pl === 'omni' ? null : pl);
    if (pl === 'omni') p.place = pl;
  }
  $('#crows').addEventListener('change', e => { const sel = e.target.closest('select[data-pl]'); if (sel) assign(sel.dataset.pl, sel.value); });
  $('#crows').addEventListener('click', e => {
    if (e.target.closest('select')) return;
    const st = e.target.closest('.stars span');
    if (st) { setStars(st.parentNode.dataset.k, +st.dataset.n); return; }
    const u = e.target.closest('[data-undo]');
    if (u) { assign(u.dataset.undo, ORIG_FOR[u.dataset.undo]); return; }
    const tr = e.target.closest('tr.place'); if (tr) showPlace(tr.dataset.pl);
  });
  const corpBtns = { all: '#cAll', need: '#cNeed', changed: '#cChanged' };
  for (const [k, sel] of Object.entries(corpBtns)) $(sel).addEventListener('click', () => {
    corpFilter = k; for (const [k2, s2] of Object.entries(corpBtns)) $(s2).classList.toggle('on', k2 === k); renderCorps();
  });
  $('#cCopy').addEventListener('click', () => {
    const ch = changedPlaces();
    if (!ch.length) { $('#mCount').textContent = 'no changed places yet.'; return; }
    const txt = ch.map(pl => MUSIC_FOR[pl] ? `MUSIC_FOR.${pl} = '${MUSIC_FOR[pl]}';   // ${placeName(pl)}: ${SONGS[MUSIC_FOR[pl]].name}${MUSIC_FOR[pl] in DEMOS ? ' (a demo: needs writing into the game)' : ''}, was ${wasName(pl)}`
      : `delete MUSIC_FOR.${pl};   // ${placeName(pl)}: back to the map track, was ${wasName(pl)}`).join('\n');
    const done = () => { $('#mCount').textContent = `copied ${ch.length} assignment${ch.length > 1 ? 's' : ''}.`; };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, () => prompt('copy this:', txt)); else prompt('copy this:', txt);
  });
  $('#cReset').addEventListener('click', () => {
    if (!changedPlaces().length || !confirm('Put every place back on its own track?')) return;
    for (const pl of ALL_PLACES) { if (ORIG_FOR[pl]) MUSIC_FOR[pl] = ORIG_FOR[pl]; else delete MUSIC_FOR[pl]; } saveAssign(); refreshUsed(); renderList();
  });
  const setView = v => {
    document.getElementById('music').classList.toggle('corps', v === 'corps');
    $('#vTracks').classList.toggle('on', v !== 'corps'); $('#vCorps').classList.toggle('on', v === 'corps');
    try { localStorage.setItem('neon.music.view', v); } catch (e) { /* private mode */ }
    renderList();
  };
  $('#vTracks').addEventListener('click', () => setView('tracks'));
  $('#vCorps').addEventListener('click', () => setView('corps'));
  $('#rows').addEventListener('click', e => {
    const st = e.target.closest('.stars span');
    if (st) { setStars(st.parentNode.dataset.k, +st.dataset.n); return; }
    const tr = e.target.closest('tr.track'); if (tr) pick(tr.dataset.k, true);
  });
  document.querySelectorAll('#trackTable th').forEach(th => th.addEventListener('click', () => {
    const first = th.dataset.k === 'stars' ? -1 : 1;   // stars: best first
    if (sortK === th.dataset.k) { if (sortDir === first) sortDir = -first; else { sortK = 'order'; sortDir = 1; } } else { sortK = th.dataset.k; sortDir = first; }
    renderList();
  }));
  $('#mFilter').addEventListener('input', e => { filter = e.target.value; renderList(); });
  const tagBtns = { all: '#fAll', keep: '#fKeep', maybe: '#fMaybe', cut: '#fCut', none: '#fNone' };
  for (const [k, sel] of Object.entries(tagBtns)) $(sel).addEventListener('click', () => {
    tagFilter = k; for (const [k2, s2] of Object.entries(tagBtns)) $(s2).classList.toggle('on', k2 === k); renderList();
  });

  // ---- the player
  // place: the corp (or shared spot) it was picked for; the game then plays whatever that screen plays.
  function pick(k, play, place) {
    p.key = k; p.place = place || null; p.follow = !!place;
    if (play) p.playing = true;
    sendCtl(true);
    renderPlayer(); renderList();
    const row = document.querySelector(place ? `tr.place[data-pl="${place}"]` : `tr[data-k="${k}"]`); if (row) row.scrollIntoView({ block: 'nearest' });
  }
  function step(d) {
    if (document.getElementById('music').classList.contains('corps')) {
      if (!shownPlaces.length) return;
      const i = shownPlaces.indexOf(p.place);
      return showPlace(shownPlaces[(i + d + shownPlaces.length) % shownPlaces.length]);
    }
    const vis = visible(); if (!vis.length) return;
    const i = vis.findIndex(t => t.k === p.key);
    pick(vis[(i + d + vis.length) % vis.length].k, true);
  }
  // ---- try another band: change the playing track's settings live (kept in this page only)
  const orig = {};   // track -> its settings before any change
  // Changed tracks are remembered in the browser (like the stars), so a reload keeps them. The game's files
  // never change from here: "copy track" / "copy all changes" hand them over.
  const EDITS_KEY = 'neon.music.edits';
  function saveEdits() {
    const e = {}; for (const k of Object.keys(orig)) if (SONGS[k]) e[k] = SONGS[k];
    try { localStorage.setItem(EDITS_KEY, JSON.stringify(e)); } catch (err) { /* private mode */ }
    sendData();
    const n = Object.keys(orig).length;
    $('#tryAll').textContent = n ? `copy all changes (${n})` : 'copy all changes';
  }
  try {
    const e = JSON.parse(localStorage.getItem(EDITS_KEY) || '{}');
    for (const [k, s] of Object.entries(e)) if (SONGS[k]) {
      orig[k] = JSON.parse(JSON.stringify(SONGS[k]));
      for (const f of Object.keys(SONGS[k])) delete SONGS[k][f];
      Object.assign(SONGS[k], s);
    }
  } catch (err) { /* nothing saved */ }
  const TRY = [
    ['kit', 'kit', MUSIC_VOICES.kit], ['drums', 'drums', Object.keys(DRUMS)], ['bassVoice', 'bass sound', MUSIC_VOICES.bassVoice],
    ['bass', 'bass notes', Object.keys(BASS_STEPS)], ['padVoice', 'pad', MUSIC_VOICES.padVoice], ['arpVoice', 'arp sound', MUSIC_VOICES.arpVoice],
    ['arp', 'arp notes', ['up', 'down', 'updown', 'mirror']], ['leadVoice', 'lead', MUSIC_VOICES.leadVoice], ['stabVoice', 'stab sound', MUSIC_VOICES.stabVoice], ['meter', 'meter', MUSIC_VOICES.meter],
  ];
  const DEFAULTS = { stabVoice: 'saw', kit: 'synth', bassVoice: 'saw', padVoice: 'saw', arpVoice: 'square', leadVoice: 'square', meter: 4, arp: 'up', pump: 1, swing: 0 };
  const meterName = m => ({ 4: '4/4', 3: '3/4 (waltz)', 6: '6/8 (lilt)', 5: '5/4' })[m] || m;
  function renderTry() {
    const s = SONGS[p.key], box = $('#try');
    if (!s || s.style === 'ambient') { box.innerHTML = '<div class="dim">' + (s ? 'ambient tracks have their own sound.' : 'pick a track.') + '</div>'; return; }
    const cur = k => s[k] != null ? s[k] : DEFAULTS[k];
    box.innerHTML = TRY.map(([k, label, opts]) => `<div class="row"><label>${label}</label><select data-k="${k}">${opts.map(o =>
      `<option value="${o}"${String(cur(k)) === String(o) ? ' selected' : ''}>${k === 'meter' ? meterName(o) : o}</option>`).join('')}</select></div>`).join('') +
      `<div class="row"><label>pump</label><input type="range" data-k="pump" min="0" max="1" step="0.1" value="${cur('pump')}"><span class="mono dim">${(+cur('pump')).toFixed(1)}</span></div>` +
      `<div class="row"><label>swing</label><input type="range" data-k="swing" min="0" max="0.5" step="0.02" value="${cur('swing')}"><span class="mono dim">${(+cur('swing')).toFixed(2)}</span></div>` +
      `<div class="row"><label>tempo</label><input type="range" data-k="bpm" min="50" max="180" step="1" value="${s.bpm}"><span class="mono dim">${s.bpm}</span></div>`;
    $('#edited').textContent = orig[p.key] ? '(changed)' : '';
  }
  function tryChange(k, v) {
    const s = SONGS[p.key]; if (!s) return;
    if (!orig[p.key]) orig[p.key] = JSON.parse(JSON.stringify(s));
    s[k] = k === 'meter' || k === 'pump' || k === 'swing' || k === 'bpm' ? +v : v;
    if (k === 'meter') {   // a pattern that fits the new bar length
      if (s.meter === 6) { s.drums = 'shanty'; s.bass = 'jig'; }
      else if (s.meter === 3) { s.drums = 'waltz'; s.bass = 'waltz'; }
      else if (['shanty', 'waltz'].includes(s.drums)) { s.drums = 'four'; s.bass = 'eighths'; }
    }
    renderTry(); renderList(); renderSteps(); saveEdits();
    const i = document.querySelector(`#try [data-k="${k}"]`); if (i && i.type === 'range') i.focus();
  }
  $('#try').addEventListener('change', e => { if (e.target.dataset.k) tryChange(e.target.dataset.k, e.target.value); });
  $('#try').addEventListener('input', e => { if (e.target.type === 'range') { e.target.nextElementSibling.textContent = e.target.value; const s = SONGS[p.key]; if (s) { if (!orig[p.key]) orig[p.key] = JSON.parse(JSON.stringify(s)); s[e.target.dataset.k] = +e.target.value; $('#edited').textContent = '(changed)'; saveEdits(); } } });
  $('#tryReset').addEventListener('click', () => {
    const s = SONGS[p.key]; if (!s || !orig[p.key]) return;
    for (const k of Object.keys(s)) delete s[k];
    Object.assign(s, orig[p.key]); delete orig[p.key];
    renderTry(); renderList(); renderSteps(); renderPlayer(); saveEdits();
  });
  // A track as a line of code (the way the game writes its tracks), to paste.
  const trackLine = key => {
    const s = SONGS[key];
    const body = Object.entries(s).filter(([k, v]) => v != null && !(k in DEFAULTS && DEFAULTS[k] === v))
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? "'" + v + "'" : JSON.stringify(v).replace(/,/g, ', ')}`).join(', ');
    return `SONGS.${key} = { ${body} };`;
  };
  const copyText = (txt, msg) => {
    const done = () => { $('#tryinfo').textContent = msg; };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, () => prompt('copy this:', txt)); else prompt('copy this:', txt);
  };
  $('#tryCopy').addEventListener('click', () => { if (SONGS[p.key]) { const txt = trackLine(p.key); copyText(txt, 'copied: ' + txt); } });
  $('#tryAll').addEventListener('click', () => {
    const keys = Object.keys(orig).filter(k => SONGS[k]);
    if (!keys.length) { $('#tryinfo').textContent = 'no changed tracks yet.'; return; }
    copyText(keys.map(trackLine).join('\n'), `copied ${keys.length} changed track${keys.length > 1 ? 's' : ''}: ${keys.map(k => SONGS[k].name).join(', ')}.`);
  });
  saveEdits();

  function renderPlayer() {
    const s = SONGS[p.key];
    $('#now').textContent = s ? s.name : 'pick a track';
    $('#nowinfo').textContent = s ? `${s.bpm} bpm · ${keyName(s)} · ${groove(s)}${s.bass ? ' · bass ' + s.bass : ''}${s.arp ? ' · arp ' + s.arp : ''}` : '';
    $('#nowused').textContent = s ? 'plays for: ' + (usedBy(p.key).join(', ') || 'nothing (unused)') : '';
    $('#play').textContent = p.playing ? 'stop' : 'play';
    $('#levels').innerHTML = LEVELS.map((_, i) => `<button data-l="${i}" class="${i === p.level ? 'on' : ''}">${i}</button>`).join(' ') +
      ` <button data-l="game" class="${p.level === 'game' ? 'on' : ''}" title="the level the game's screen gives it (layer 1 = 0, layer 2 = 1, layer 3 = 2, boss = 3)">game</button>`;
    $('#levelname').textContent = s && s.style === 'ambient' ? 'ambient: no levels or drums' : p.level === 'game' ? "the game's: what this screen plays" : LEVELS[p.level];
    $('#sfx').textContent = p.sfx ? 'on' : 'off'; $('#sfx').classList.toggle('on', p.sfx);
    $('#vol').value = p.volume;
    $('#low').textContent = p.low ? 'on' : 'off'; $('#low').classList.toggle('on', p.low);
    $('#urgency').value = p.urgency; $('#urgv').textContent = p.urgency.toFixed(2);
    // stage: a staged track (the G0D fights) plays the section for the fight's stage 1 / 2 / 3; game: what the game says
    $('#stages').innerHTML = s && s.stages ? ['A', 'B', 'C'].map((l, i) => `<button data-g="${l}" class="${p.stage === l ? 'on' : ''}">${i + 1}</button>`).join(' ') + ` <button data-g="" class="${!p.stage ? 'on' : ''}">game</button>` : '<span class="dim">(staged tracks only: the G0D fights)</span>';
    renderTry(); renderSteps();
    const t = tags[p.key] || {};
    $('#pstars').outerHTML = starsHtml(p.key, 'pstars');
    for (const [k, sel] of [['keep', '#tKeep'], ['maybe', '#tMaybe'], ['cut', '#tCut']]) $(sel).classList.toggle('on', t.tag === k);
    if (document.activeElement !== $('#note')) $('#note').value = t.note || '';
  }
  $('#play').addEventListener('click', () => { if (!p.key) return step(1); p.playing = !p.playing; sendCtl(p.playing); renderPlayer(); renderList(); });
  $('#mPrev').addEventListener('click', () => step(-1));
  $('#mNext').addEventListener('click', () => step(1));
  $('#levels').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { p.level = b.dataset.l === 'game' ? 'game' : +b.dataset.l; sendCtl(); renderPlayer(); } });
  $('#stages').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { p.stage = b.dataset.g || null; sendCtl(); renderPlayer(); } });
  $('#urgency').addEventListener('input', e => { p.urgency = +e.target.value; $('#urgv').textContent = p.urgency.toFixed(2); sendCtl(); });
  $('#low').addEventListener('click', () => { p.low = !p.low; sendCtl(); renderPlayer(); });
  $('#vol').addEventListener('input', e => { p.volume = +e.target.value; sendCtl(); });
  $('#sfx').addEventListener('click', () => { p.sfx = !p.sfx; sendCtl(); renderPlayer(); });
  // the end jingles over the playing track: it powers up / down, then starts again (in the game)
  $('#win').addEventListener('click', () => { if (p.playing) NE.toGame({ type: 'music-test', kind: 'win' }); });
  $('#death').addEventListener('click', () => { if (p.playing) NE.toGame({ type: 'music-test', kind: 'death' }); });

  // ---- tags and notes
  // ---- stars: 1-5 (click the same star again to clear)
  const starsOf = k => (tags[k] && tags[k].stars) || 0;
  const starsHtml = (k, id) => `<span class="stars"${id ? ` id="${id}"` : ''} data-k="${k || ''}">${[1, 2, 3, 4, 5].map(n => `<span data-n="${n}" class="${n <= starsOf(k) ? 'on' : ''}">★</span>`).join('')}</span>`;
  function setStars(k, n) {
    if (!k) return;
    const t = tags[k] = tags[k] || {};
    if (!n || t.stars === n) delete t.stars; else t.stars = n;
    if (!t.tag && !t.note && !t.stars) delete tags[k];
    saveTags(); renderList(); renderPlayer();
  }
  $('#mPlayer').addEventListener('click', e => { const st = e.target.closest('#pstars span'); if (st) setStars(p.key, +st.dataset.n); });
  function setTag(tag) {
    if (!p.key) return;
    const t = tags[p.key] = tags[p.key] || {};
    if (tag && t.tag !== tag) t.tag = tag; else delete t.tag;
    if (!t.tag && !t.note && !t.stars) delete tags[p.key];
    saveTags(); renderPlayer(); renderList();
  }
  $('#tKeep').addEventListener('click', () => setTag('keep'));
  $('#tMaybe').addEventListener('click', () => setTag('maybe'));
  $('#tCut').addEventListener('click', () => setTag('cut'));
  $('#tClear').addEventListener('click', () => setTag(null));
  $('#note').addEventListener('input', e => {
    if (!p.key) return;
    const t = tags[p.key] = tags[p.key] || {};
    t.note = e.target.value; if (!t.note) delete t.note;
    if (!t.tag && !t.note) delete tags[p.key];
    saveTags(); renderList();
  });
  // The list as text, to paste into a chat or a doc.
  $('#mExport').addEventListener('click', () => {
    const line = t => `- ${starsOf(t.k) ? '★'.repeat(starsOf(t.k)) + ' ' : ''}${t.s.name} (${t.s.bpm} bpm, ${keyName(t.s)}, ${groove(t.s)}; ${t.used.join(', ') || 'unused'}; ${fam[t.k].made}${fam[t.k].like ? (fam[t.k].from ? ', from ' : ', like ') + SONGS[fam[t.k].like].name : ''}${famName(t.k) && famName(t.k) !== t.s.name ? ', family ' + famName(t.k) : ''})${tags[t.k] && tags[t.k].note ? ': ' + tags[t.k].note : ''}`;
    const group = (title, f) => { const ts = tracks.filter(f).sort((a, b) => starsOf(b.k) - starsOf(a.k)); return ts.length ? `${title} (${ts.length})\n${ts.map(line).join('\n')}\n` : ''; };
    const tg = t => (tags[t.k] && tags[t.k].tag) || '';
    const txt = [group('KEEP', t => tg(t) === 'keep'), group('MAYBE', t => tg(t) === 'maybe'), group('CUT', t => tg(t) === 'cut'),
      group('NOT TAGGED YET', t => !tg(t))].filter(Boolean).join('\n');
    const done = () => { $('#copied').textContent = 'copied.'; setTimeout(() => { $('#copied').textContent = ''; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, () => prompt('copy this:', txt));
    else prompt('copy this:', txt);
  });

  // ---- the piano roll: Music View in a frame over the tab. It plays on its own, so the game's music stops.
  const roll = on => {
    $('#music').classList.toggle('roll', on);
    if (!on) { $('#mRollFrame').src = 'about:blank'; return; }
    if (p.playing) { p.playing = false; sendCtl(false); renderPlayer(); renderList(); }
    const k = p.key && !(p.key in DEMOS) ? p.key : null;
    $('#mRollName').textContent = k ? SONGS[k].name : '';
    $('#mRollFrame').src = 'music_view.html' + (k ? '?track=' + k : '');
  };
  $('#mRoll').onclick = () => roll(true);
  $('#mRollClose').onclick = () => roll(false);
  document.addEventListener('neon-mode', () => { if ($('#music').classList.contains('roll')) roll(false); });

  // ---- keys
  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('mode-music')) return;
    if ($('#music').classList.contains('roll')) { if (e.key === 'Escape') roll(false); return; }
    if ((e.target.matches && e.target.matches('input[type=text], textarea, select')) || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === ' ') { e.preventDefault(); $('#play').click(); }
    else if (k === 'arrowdown') { e.preventDefault(); step(1); }
    else if (k === 'arrowup') { e.preventDefault(); step(-1); }
    else if (/^[0-4]$/.test(k)) { p.level = +k; sendCtl(); renderPlayer(); }
    else if (k === 'g') { p.level = 'game'; sendCtl(); renderPlayer(); }
    else if (k === 'h') { p.low = !p.low; sendCtl(); renderPlayer(); }
    else if (e.shiftKey && /^Digit[0-5]$/.test(e.code)) setStars(p.key, +e.code.slice(5));
    else if (k === 'k') setTag('keep'); else if (k === 'y') setTag('maybe'); else if (k === 'x') setTag('cut');
  });

  // ---- the step lights: where the track is in its bar
  const steps = $('#steps');
  let cells = [], cellsFor = '';
  let gameBeat = null;
  function renderSteps() {
    const s = SONGS[p.key], bs = gameBeat ? gameBeat.bs : barSteps(s), beat = gameBeat ? gameBeat.beat : beatSteps(s), sig = bs + '/' + beat;
    if (sig === cellsFor) return;
    cellsFor = sig;
    steps.style.gridTemplateColumns = `repeat(${bs}, 1fr)`;
    steps.innerHTML = Array.from({ length: bs }, (_, i) => `<i class="${i % beat === 0 ? 'beat' : ''}"></i>`).join('');
    cells = [...steps.children];
  }
  renderSteps();
  let quietSince = 0;
  function showBeat() {
    const b = gameBeat;
    renderSteps();
    cells.forEach((c, i) => c.classList.toggle('on', !!(b && p.playing && i === b.lit)));
    const ng = $('#nowgame');
    if (!p.playing) { ng.textContent = ''; ng.classList.remove('warn'); return; }
    if (b && !b.audio && b.key !== 'none') {
      if (!quietSince) quietSince = performance.now();
      if (performance.now() - quietSince > 1200) { ng.textContent = 'no sound yet: click the game once (browsers want a click in the frame).'; ng.classList.add('warn'); }
      return;
    }
    quietSince = 0;
    ng.classList.remove('warn');
    ng.textContent = b && SONGS[b.key] ? `the game is playing ${SONGS[b.key].name} · level ${b.level}` : '';
  }
  NEON_ED.onGame('ready', () => { gameBeat = null; sendData(true); sendCtl(); showBeat(); });
  NEON_ED.onGame('beat', m => { gameBeat = m; showBeat(); });

  if (window.LOAD_ERRORS && window.LOAD_ERRORS.length) $('#mErrors').textContent = 'some files had errors (their tracks may still be fine):\n' + window.LOAD_ERRORS.slice(0, 6).join('\n');
  if (typeof SONGS === 'undefined') document.body.textContent = "Couldn't load the game's music. Open this page from the repo's tools/ folder.";
  let view = 'corps'; try { view = localStorage.getItem('neon.music.view') || 'corps'; } catch (e) { /* private mode */ }
  setView(view); renderPlayer();

})();
