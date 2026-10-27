// NeoN+1 engine/editor.js: The editor bridge (tools/neon_editor.html, and the older palette editor; only with
// ?editor=1), and the debug hook for tests.
'use strict';
NEON_FILES.push(['engine/editor.js', 'v13.41']);

// ---------------- Palette editor bridge ----------------
// tools/palette_editor.html opens the game as index.html?editor=1 in a frame and talks to it with
// messages: 'palettes' (new palette data, live), 'show' (which palette to paint everything in, and
// BLACKOUT's darkness), 'scene' (set up a screen to look at). None of this runs in normal play.
if (EDITOR) {
  save.muted = true; save.musicOn = false; save.effects = 'full'; save.corpColors = true;
  const post = m => { try { parent.postMessage(Object.assign({ from: 'neon-game' }, m), '*'); } catch (e) { /* no editor */ } };
  // New palette data from the editor: resolve it the same way palettes.js is resolved at boot.
  const loadPaletteData = data => {
    for (const k of Object.keys(PALETTES)) delete PALETTES[k];
    for (const [key, p] of Object.entries(data.palettes || {})) PALETTES[key] = Object.assign({}, p);
    if (data.chips) { Object.assign(CHIPS, data.chips); setChipKeys(); }
    if (data.styles) PLAYER_STYLES.splice(0, PLAYER_STYLES.length, ...data.styles);
    refreshPalette();
  };
  // Wait for wipes, intros and animations to finish (skipping intros).
  const settle = async (ms = 25000) => {
    const t0 = performance.now();
    while (st.busy || st.transitioning || st.wipe || st.intro || st.bossIntro) {
      if (st.intro) st.intro.skip = true;
      if (st.bossIntro) st.bossIntro.skip = true;
      if (performance.now() - t0 > ms) throw new Error('the game took too long');
      await wait(40);
    }
  };
  // The corpintro scene holds a corp's intro screen up; any next scene lets it go first.
  const INTRO_HOLD = CONFIG.introHold;
  const letGo = async () => { if (CONFIG.introHold !== INTRO_HOLD) { CONFIG.introHold = INTRO_HOLD; if (st.intro) st.intro.skip = true; await settle(); } };
  let logoWas = null;   // the profile scene's borrowed logo
  const endRun = () => {
    if (logoWas != null) { profile().logo = logoWas; logoWas = null; persist(); }
    if (st.run) { st.run.ended = true; clearRun(); }
    st.pause = false; st.dev = false; showTitle();
  };
  // A practice run on the map, with a mod of every rarity and a few items in the tray.
  const mapRun = async () => {
    endRun();
    startRun('PALETTES', true);
    await settle();
    if (st.mode === 'play' && st.lv) { await pick(st.lv.safe); await settle(); }   // the public net
    if (st.mode !== 'map') { toMap(); await settle(); }
    st.god = true;
    for (const r of Object.keys(RARITY)) { const k = Object.keys(MODS).find(m => MODS[m].rarity === r && MODS[m].kind !== 'exotic' && !st.run.mods.includes(m)); if (k) addMod(k); }
    for (const k of Object.keys(ITEMS).slice(0, 3)) addItem(k);
  };
  const enterCorp = async (corp, boss) => {
    await mapRun();
    const run = st.run, id = availableNodes().find(x => run.map[x].type === 'corp');
    Object.assign(run.map[id], { corp: CORPS[corp] ? corp : 'basic', tier: 1 });
    delete run.map[id].mod;
    if (boss) { run.practice = true; run.at = id; run.visited.push(id); startCorp(run.map[id], 99); }
    else enterNode(run.map[id], true);
    await settle();
  };
  const SCENES = {
    title: async () => { endRun(); },
    help: async () => { endRun(); openHelp(); },
    codex: async () => { endRun(); openCodex(); },
    settings: async () => { endRun(); openSettings(); },
    // the profile; opts.logo shows it wearing that logo (put back at the next scene)
    profile: async o => { endRun(); if (o.logo && LOGO_BY_ID[o.logo]) { const p = profile(); if (logoWas == null) logoWas = p.logo; p.logo = o.logo; } openProfile(); },
    map: mapRun,
    intro: async () => { endRun(); save.bootSeen = false; startIntro(); },   // the first-boot intro (the world map shows ~3-5s in)
    // a corp's intro screen (its art), held up until the next scene
    corpintro: async o => {
      await mapRun();
      const run = st.run, id = availableNodes().find(x => run.map[x].type === 'corp');
      Object.assign(run.map[id], { corp: CORPS[o.corp] ? o.corp : 'basic', tier: 1 });
      delete run.map[id].mod;
      CONFIG.introHold = 1e9;
      enterNode(run.map[id], true);
      for (let i = 0; i < 100 && !st.intro; i++) await wait(40);
    },
    layer: o => enterCorp(o.corp, false),
    boss: o => enterCorp(o.corp, true),
    // a layer after a miss (red node), with one ICE switched off (locked) and the cursor on a node
    hit: async o => {
      await enterCorp(o.corp, false);
      const lv = st.lv;
      const ice = lv.tiles.map((t, i) => i).filter(i => !lv.tiles[i].safe && !lv.tiles[i].loaded && lv.tiles[i].state === 'closed');
      if (ice.length) { await pick(ice[0]); await settle(); }
      const left = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
      if (left.length > 1) lockTile(left[0], C.mid, 'sniffer');
      st.hover = lv.tiles.findIndex(t => t.state === 'closed');
    },
    shop: async () => {
      await mapRun();
      const id = Object.keys(st.run.map).find(k => st.run.map[k].type === 'shop');
      st.run.credits = 48;   // a mix: the items and repair are affordable, most mods aren't (to see both looks)
      openShop(id ? st.run.map[id] : { id: 'editor' });
      await settle();
    },
  };
  // New art from the editor's ART tab (live; the files change only when the editor saves them).
  // a = { glyphs: [{ name, lore, art }], special: { k: { art } }, logos: [{ id, ..., art }], map }, any of them.
  // Everything made from the art at load is changed in place, so the game's lists keep working.
  // (A new glyph shows on nodes right away; the codex lists it after a reload.)
  const same = (to, from) => { to.length = 0; to.push(...from); };
  const trimLead = rows => { const lead = Math.min(...rows.filter(l => l.trim()).map(l => l.length - l.trimStart().length)); return rows.map(l => l.slice(isFinite(lead) ? lead : 0).trimEnd()); };
  const loadArt = a => {
    if (!a) return;
    if (a.glyphs) { same(ART_GLYPHS, a.glyphs); same(MOTIFS, a.glyphs.map(g => normMotif(g.art))); same(GLYPH_LORE, a.glyphs.map(g => [g.name, g.lore])); }
    if (a.special) for (const [k, g] of [['jack', JACK_GLYPH], ['loot', LOOT_GLYPH], ['bone', BONE_GLYPH], ['mask', MASK_GLYPH]]) if (a.special[k]) same(g, normMotif(a.special[k].art));
    if (a.logos) {
      same(ART_LOGOS, a.logos);
      for (const k of Object.keys(LOGO_BY_ID)) delete LOGO_BY_ID[k];
      for (const l of a.logos) LOGO_BY_ID[l.id] = l;
      same(PLAYER_LOGOS, a.logos.filter(l => l.kind === 'player'));
      for (const l of a.logos) if (l.kind === 'corp' && l.corp) CORP_ART[l.corp] = trimLead(l.art);
    }
    if (a.map) same(INTRO_MAP, a.map);
  };
  let queue = Promise.resolve();
  window.addEventListener('message', e => {
    const m = e.data;
    if (!m || m.to !== 'neon-game') return;
    if (m.type === 'palettes') loadPaletteData(m.data);
    if (m.type === 'art') loadArt(m.art);
    if (m.type === 'show') { st.editorPal = m.key; st.editorDark = m.dark || 0; refreshPalette(); post({ type: 'shown', key: m.key, bg: C.bg, accent: C.accent }); }
    if (m.type === 'scene' && SCENES[m.name]) {
      queue = queue.then(letGo).then(() => SCENES[m.name](m.opts || {}))
        .then(() => post({ type: 'scene', name: m.name, ok: true, info: { mode: st.mode, corp: st.corp && st.corp.def.name, boss: !!(st.lv && st.lv.boss), bg: C.bg, accent: C.accent } }))
        .catch(err => post({ type: 'scene', name: m.name, ok: false, error: String((err && err.message) || err) }));
    }
  });
  // ---- The music tab (tools/neon_editor.html). The music plays here, in the game, so you hear what the game plays.
  // 'music-data' { songs: { key: track }, assign: { place: key or '' } }: the tab's changed tracks and assignments
  //   (live only; the files don't change). Tracks it no longer sends go back to the game's own.
  // 'music-ctl' { playing, key (a track, or null: what this screen plays), level (null: the game's), urgency, low, sfx }
  // 'music-test' { kind: 'win' | 'death' }: an end jingle over the track, then it starts again.
  // The game sends back 'beat' { key, lit, bs, beat, level }: what's playing and where it is in the bar.
  const ownSongs = {}, ownFor = Object.assign({}, MUSIC_FOR);
  const swapSong = (k, t) => { const s = SONGS[k]; if (!s) { SONGS[k] = t; return; } for (const f of Object.keys(s)) delete s[f]; Object.assign(s, t); };
  const musicData = m => {
    const songs = m.songs || {};
    for (const k of Object.keys(ownSongs)) if (!songs[k]) { if (ownSongs[k]) swapSong(k, ownSongs[k]); else delete SONGS[k]; delete ownSongs[k]; }
    for (const [k, t] of Object.entries(songs)) { if (!(k in ownSongs)) ownSongs[k] = SONGS[k] ? JSON.parse(JSON.stringify(SONGS[k])) : null; swapSong(k, JSON.parse(JSON.stringify(t))); }
    for (const k of Object.keys(MUSIC_FOR)) if (!(k in ownFor)) delete MUSIC_FOR[k];
    Object.assign(MUSIC_FOR, ownFor);
    for (const [pl, k] of Object.entries(m.assign || {})) { if (!k) delete MUSIC_FOR[pl]; else if (SONGS[k]) MUSIC_FOR[pl] = k; }
  };
  let beatT = 0, lastBeatMsg = '';
  let lastRestart = 0;
  const musicCtl = m => {
    st.editorMusic = m;
    if (m.restart && m.restart !== lastRestart) { lastRestart = m.restart; setTimeout(() => Music.restart(), 0); }   // the track from the top
    save.musicOn = !!m.playing; save.musicVol = m.volume != null ? m.volume : 0.8; save.muted = !m.sfx; save.sfxVol = 0.8;
    Sound.init(); Sound.levels();
    clearInterval(beatT);
    if (m.playing) beatT = setInterval(() => {
      const b = Music.beat(), key = Music.current(), sg = SONGS[key];
      let lit = -1;
      if (b && sg) { const into = (performance.now() - b.perf) / b.ms, bs = barSteps(sg), bt = beatSteps(sg); if (into >= 0 && into < 1.5) lit = ((b.n % (bs / bt)) * bt + Math.floor(into * bt)) % bs; }
      const ms = musicState(), msg = { type: 'beat', key: ms.song, lit, bs: sg ? barSteps(sg) : 16, beat: sg ? beatSteps(sg) : 4, level: ms.level, audio: !!b };
      const sig = JSON.stringify(msg);
      if (sig !== lastBeatMsg) { lastBeatMsg = sig; post(msg); }
    }, 40);
  };
  window.addEventListener('message', e => {
    const m = e.data;
    if (!m || m.to !== 'neon-game') return;
    if (m.type === 'music-data') musicData(m);
    if (m.type === 'music-ctl') musicCtl(m);
    if (m.type === 'music-test' && st.editorMusic && st.editorMusic.playing) {
      Sound.init(); (m.kind === 'win' ? Sound.bossWin : Sound.death)();
      setTimeout(() => Music.restart(), m.kind === 'win' ? 3600 : 3800);
    }
  });
  // Mods (the editor's items & mods tab): it sees what the run holds, at what step, and can
  // add a mod at a step, move it to another step, or take it away. The run turns practice.
  const modsNow = () => {
    const run = st.run && !st.run.ended ? st.run : null;
    return { type: 'mods', run: !!run, mods: run ? run.mods.map(k => [k, modTier(k)]) : [], slots: run ? modSlots() : 0 };
  };
  let lastMods = '';
  const sendMods = force => { const m = modsNow(), s = JSON.stringify(m); if (force || s !== lastMods) { lastMods = s; post(m); } };
  setInterval(sendMods, 300);
  window.addEventListener('message', e => {
    const m = e.data;
    if (!m || m.to !== 'neon-game') return;
    if (m.type === 'mods-get') sendMods(true);
    if (m.type !== 'mod-set' || !MODS[m.key]) return;
    const run = st.run;
    if (!run || run.ended) return post({ type: 'mod-set', ok: false, error: 'no run: start one (the map scene)' });
    run.practice = true;
    const top = tierCount(MODS[m.key]) - 1;
    if (m.tier == null || m.tier < 0) removeMod(m.key);
    else if (!run.mods.includes(m.key)) addMod(m.key, Math.min(m.tier, top));
    else {   // another step of a mod it holds (down too)
      const was = run.modTier[m.key] || 0, to = clamp(m.tier, 0, top);
      run.modTier[m.key] = to;
      if (m.key === 'buffer') { run.maxInt += to - was; run.integrity = clamp(run.integrity + to - was, 1, run.maxInt); }
    }
    Sound.buy();
    sendMods(true);
    post({ type: 'mod-set', ok: true, key: m.key });
  });
  // The TRAINING tab: its lines live in the game as you type, a jump to any line (engine/tutorial.js
  // plays forward to it), and which line is up now.
  let lastTut = '';
  setInterval(() => {
    const T = st.tut, s = T ? (T.pop ? T.pop.id : '') + '|' + (T.at || '') + '|' + (T.auto || '') : 'off';
    if (s !== lastTut) { lastTut = s; post({ type: 'tut-at', on: !!T, id: T && T.pop ? T.pop.id : null, last: T ? T.at || null : null, auto: T ? T.auto || null : null }); }
  }, 200);
  window.addEventListener('message', e => {
    const m = e.data;
    if (!m || m.to !== 'neon-game') return;
    if (m.type === 'tut-copy' && Array.isArray(m.copy)) {
      TUT_COPY.length = 0; TUT_COPY.push(...m.copy);
      const p = st.tut && st.tut.pop;
      if (p) { const c = tutLine(p.id); p.text = tutFill(c.text); if (!p.ok) p.act = tutFill(c.act); else p.timer = c.timer || 0; }
    }
    if (m.type === 'tut-jump' && m.id) tutJump(m.id);
    // the ECONOMY tab: its numbers, live (changed in place, so everything holding ECON / TIER_PRICE sees them)
    if (m.type === 'econ' && m.econ) {
      const put = (to, from) => { for (const [k, v] of Object.entries(from)) {
        if (Array.isArray(v)) { to[k].length = 0; to[k].push(...v); } else if (v && typeof v === 'object') put(to[k], v); else to[k] = v; } };
      put(ECON, m.econ);
    }
  });
  post({ type: 'ready', version: VERSION, scenes: Object.keys(SCENES),
    corpNames: Object.fromEntries(Object.entries(CORPS).map(([k, c]) => [k, c.name])) });
}

// Debug hook for the console and automated tests.
window.__br = {
  state: st, save, C, Music, musicState, CORPS, FINAL, DRAW_FONT, SONGS, MUSIC_FOR, openTrackPlayer, trackLines, HELP_PAGES, Net, openMultiplayer, mpHost, mpLayer, mpSpec, mpStartRound, mpNextGame, mpSendEmote, mpLeave, amHost, mpKick, openProfile, genLayer, genMap, CONFIG, MODS, ITEMS,
  startRun, selectNode, enterNode, pick, useItem, activateMod, modUsable, modSpent, layerTick, predHeat, tilePos, tileCenter, nearness, pointerCell, parts, addMod, removeMod, addItem, pickMods, swapLines,
  toggleDev, devLines, availableNodes, panelLines, swapTo, openHelp, openCodex, openSettings, showTitle, buildScene,
  addSector, sectorClear, showSectorClear, pushOn, cashOut, openOmniReward, STAGES, modsAt, resumeRun, openBoard, LEGACY, legacyLv, repFor, saveRun, savedRun, clearRun,
  askSkip, scrollMapSector, sectorViewRow, SKIP_BOSS, toMap, startCorp, pickCorps, targetLevel, CORP_TELL, CODEX_CORPS, openShop,
  togglePause, pauseLines, abandonRun, moveFocus, moveTileCursor, moveMapCursor,
  cipherNow, TAP_FX, PALETTES, clashWith, exoticOffer, tapsToBreak, openCache, openClash, bloodCost, coinOpen, coinFlip, tileCenter, COIN, showAd, closeAd, adBreak,
};
