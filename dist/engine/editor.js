// NeoN+1 engine/editor.js: The editor bridge (tools/neon_editor.html; only with
// ?editor=1), and the debug hook for tests.
'use strict';
NEON_FILES.push(['engine/editor.js', 'v14.65']);

// The editor's loot viewer (the user, 2026-10-31): what a map node could give, read off the seed, nothing taken.
// The node picked on the map (or peeked, or the one you're on). The editor's TESTING tab asks for it (loot here).
// A loot roll as grantLoot would give it, with nothing taken (the same rolls in the same order): what you'd get with
// what you have now (STASH, a full belt, the DISC).
function lootPreview(r, tier) {
  const g = lootRoll(r, tier);   // (engine/loot.js: the same roll the game makes)
  if (g.key === 'disc') return 'the DISC (the quest)';
  if (g.key) return `${ITEMS[g.key].name}${g.tier ? ' ' + RARITY[itemView(g.key, g.tier).rarity].label.toLowerCase() : ''} (${isLoot(g.key) ? 'loot' : 'gear'})`;
  return g.cr + 'cr';
}
// The loot items dropLoot would give (engine/loot.js), nothing taken
function lootPick(r, n, rare = 0) {
  const out = [];
  for (let i = 0; i < n; i++) { const k = pickLootItem(r, rare); rollTier(r, ITEMS[k]); out.push(ITEMS[k].name); }
  return out;
}
// A corp's layers as the game will make them (the seed): which have a $ node, and what each pays you, as you are now
function lootLayers(n) {
  const run = st.run, def = corpDef(n.corp), t = n.tier, out = [];
  const plan = corpPlan(n, def, run), c = Object.assign({ def, node: n, tier: t, hasBoss: true, mod: n.mod }, plan), counts = plan.counts;
  let prev = null;
  counts.forEach((cnt, idx) => {
    const boss = idx === counts.length - 1;
    const lv = genLayer(Object.assign(layerSpec(c, run, idx, prev), { dress: null, lootSure: false, alwaysFollow: !!def.alwaysFollow }));   // (engine/run.js; no dress: the $ nodes are placed before it)
    prev = lv.safeCell;
    const label = `  layer ${idx + 1}${boss ? ' (boss)' : ''}: `;
    if (!lv.tiles.some(o => o.loaded)) return out.push(label + 'no $ node');
    const lr = rngFor(run.seed, 'loot', n.id, idx), got = [lootPreview(lr, t)];
    if (has('priority')) for (let i = 1; i < ECON.modx.priority; i++) got.push(lootPreview(lr, t));
    out.push(label + '$ node: ' + got.join(' + '));
  });
  return out;
}
function lootReport() {
  const run = st.run, id = st.mapSel || st.mapPeek || st.hoverNode || run.at, n = run.map[id];
  if (!n) return 'no node: pick one on the map.';
  const pct = x => (x * 100).toFixed(x < 0.1 ? 1 : 0) + '%';
  const name = o => o.kind === 'gear' || o.kind === 'item' ? `${itemView(o.key, o.tier).name} ${RARITY[itemView(o.key, o.tier).rarity].label.toLowerCase()} x${o.n || 1} (gear)`
    : o.kind === 'repair' ? 'REPAIR (service)' : `${modView(o.key, o.tier).name} ${RARITY[modView(o.key, o.tier).rarity].label.toLowerCase()} (mod)`;
  const drops = () => {   // a loot roll: an item (half loot for the bag, half gear), else credits
    const ch = has('stash') ? tv('stash', ECON.modx.stash) : ECON.loot.itemChance, list = (pool, share) => {
      const tot = pool.reduce((a, k) => a + gearWeight(k), 0);
      return pool.sort((a, b) => gearWeight(b) - gearWeight(a)).map(k => `    ${ITEMS[k].name.padEnd(10)} ${pct(share * gearWeight(k) / tot)}`);
    };
    return [`  an item ${pct(ch)} of the time, else credits.`, `  loot for the bag (${pct(ch * ECON.loot.valueShare)}):`, ...list(lootPool(), ch * ECON.loot.valueShare),
      `  gear (${pct(ch * (1 - ECON.loot.valueShare))}):`, ...list(Object.keys(ITEMS).filter(k => !ITEMS[k].corp && !ITEMS[k].fish && !ITEMS[k].value && gearAllowed(k)), ch * (1 - ECON.loot.valueShare))];
  };
  const out = [`NODE ${n.id}  ${(n.type || '').toUpperCase()}${n.corp ? '  ' + corpDef(n.corp).name : ''}  (sector ${(n.sector || 0) + 1})`, ''];
  if (n.type === 'shop') {
    const left = run.shops && run.shops[n.id];
    for (let k = 0; k <= marketRerolls(); k++) {
      out.push(k ? `reroll ${k}:` : 'opens with:');
      for (const o of (left && k === left.rolls ? left.offers.filter(o => o.kind !== 'repair') : shopRoll(n, k))) out.push(`  ${name(o)}${o.sold ? '  SOLD' : ''}${o.free ? '  FREE' : ''}`);
    }
    out.push('', `(${marketRerolls()} reroll${marketRerolls() > 1 ? 's' : ''} here; RESTOCK on THE BOARD adds more)`);
  } else if (n.type === 'cache') {
    const quest = questMarket(n), extra = has('cachekey') ? tv('cachekey', ECON.modx.cachekey) : quest ? 1 : 0;
    out.push(`loot: ${1 + extra} roll${extra ? 's' : ''}${run.caches && run.caches[n.id] ? ' (already looted)' : ''}`);
    { const lr = rngFor(run.seed, 'cacheloot', n.id), [lo, hi] = ECON.loot.sector;   // (panels.js openCache: the same rolls)
      out.push(lr() < ECON.loot.cache ? '  and a pile of loot: ' + lootPick(lr, lo + Math.floor(lr() * (hi - lo + 1)), 0).join(', ') : '  no loot pile in this one'); }
    out.push('then one pick of:');
    if (quest) for (const o of questCacheOptions(rngFor(run.seed, 'cache', n.id))) out.push('  ' + name(o));
    else out.push(`  2 mods from the general / minor ones you've found; an exotic instead of one ${pct(has('cachekey') ? tv('cachekey', EXOTIC.cacheKeyChance) : EXOTIC.cacheChance)} of the time`);
    out.push('', 'a loot roll:', ...drops());
  } else if (n.type === 'corp' || n.type === 'final') {
    if (n.corp && corpDef(n.corp).reward) out.push('its reward: its own (a corp of its own: see its code)');
    else { out.push('boss reward, pick one:'); for (const o of rewardOptions(n)) out.push('  ' + name(o)); }
    { const sec = n.type === 'final', r = rngFor(run.seed, 'bossloot', n.id), [lo, hi] = sec ? ECON.loot.sector : ECON.loot.boss;   // (loot.js bossLoot: the same rolls)
      out.push(`the boss drops loot: ${run.bossLoot && run.bossLoot[n.id] ? '(already dropped)' : lootPick(r, lo + Math.floor(r() * (hi - lo + 1)), sec ? 1 : 0).join(', ')}`); }
    out.push('', 'its layers (off the seed), what a $ node pays you with what you have now:', ...lootLayers(n));
    if (n.corp === 'omni') out.push('  (OMNI copies a corp you beat: its layers can come out different)');
    out.push('  (a corp that changes its layer sizes as you play can differ later on)', '', 'a loot roll, in general:', ...drops());
  } else out.push('nothing to loot here.');
  return out.join('\n');
}

// ---------------- Editor bridge ----------------
// tools/neon_editor.html opens the game as index.html?editor=1 in a frame and talks to it with
// messages: 'palettes' (new palette data, live), 'show' (which palette to paint everything in, and
// BLACKOUT's darkness), 'scene' (set up a screen to look at). None of this runs in normal play.
if (EDITOR) {
  save.muted = false; save.musicOn = true; save.effects = 'full'; save.corpColors = true;   // music and sfx on (Greg, 2026-11-07)
  st.editorHold = false;   // the layer clocks run (TESTING: stop clocks holds them)
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
    for (const r of Object.keys(RARITY).filter(r => !RARITY[r].hidden)) { const k = Object.keys(MODS).find(m => MODS[m].rarity === r && MODS[m].kind !== 'exotic' && !st.run.mods.includes(m)); if (k) addMod(k); }
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
    board: async () => { endRun(); openBoard(); },   // THE BOARD (YOU / REP / FEATS + stats / CREW)
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
    // the end of a sector: its boss (OMNI in sector 1), the sector clear screen, the uplink
    sectorboss: async () => {
      await mapRun();
      const run = st.run, node = Object.values(run.map).find(n => n.type === 'final' && (n.sector || 0) === 0);
      run.practice = true; run.at = node.id; run.visited.push(node.id);
      startCorp(node, 99);   // straight to its boss layer
      await settle();
    },
    sectorclear: async (o = {}) => {
      await mapRun();
      const run = st.run;
      Object.assign(run, { credits: 600, sectorsCleared: 1, corps: 4, depth: 20, pending: { kind: 'sector', skipped: false } });
      showSectorClear(false, false, o.root || null);   // o.root: a ROOT picture (the ART tab's "show in game")
      await settle();
    },
    uplink: async () => {
      await mapRun();
      const run = st.run;
      Object.assign(run, { credits: 600, sectorsCleared: 1, corps: 4, depth: 20, pending: { kind: 'sector', skipped: false } });
      openUplink();
      await settle();
    },
  };
  // New art from the editor's ART tab (live; the files change only when the editor saves them).
  // a = { glyphs: [{ name, lore, art }], special: { k: { art } }, logos: [{ id, ..., art }], map, faces: { id: { name, art } } }, any of them.
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
    if (a.faces && typeof ART_FACES !== 'undefined') Object.assign(ART_FACES, a.faces);   // hacker faces (POPS's popups)
    if (a.root) { for (const k of Object.keys(ART_ROOT)) if (!a.root[k]) delete ART_ROOT[k]; Object.assign(ART_ROOT, a.root); }   // the SECTOR CLEARED pictures
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
  let lastRestart = 0, tabPlaying = false, gameMusicOn = save.musicOn, lastSfx = null;   // the game's own music setting, kept while the tab plays
  const musicCtl = m => {
    st.editorMusic = m;
    if (m.restart && m.restart !== lastRestart) { lastRestart = m.restart; setTimeout(() => Music.restart(), 0); }   // the track from the top
    // The tab takes the music over only while it plays a track; stopped, the game plays its own (its settings decide).
    if (m.playing && !tabPlaying) gameMusicOn = save.musicOn;
    if (m.playing) save.musicOn = true; else if (tabPlaying) save.musicOn = gameMusicOn;
    tabPlaying = !!m.playing;
    save.musicVol = m.volume != null ? m.volume : 0.8; if (m.sfx !== lastSfx) { lastSfx = m.sfx; save.muted = !m.sfx; } save.sfxVol = 0.8;   // (sfx: only when the tab's switch changes; the TESTING tab has one too)
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
    if (m.type === 'hush') { if (m.on) Sound.hush(); else Sound.init(); }   // all the game's sound off / back on (the MUSIC tab's piano roll plays its own)
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
    if (m.type !== 'mod-set' || !(MODS[m.key] || ITEMS[m.key])) return;
    const run = st.run;
    if (!run || run.ended) return post({ type: 'mod-set', ok: false, error: 'no run: start one (the map scene)' });
    run.practice = true;
    if (ITEMS[m.key]) {   // gear: one more at that step (gear keys never match mod keys); a phish catch becomes the PHISH of
      // its rarity, like keeping one at a PIER (fishKeepKey, engine/fishing.js); loot goes in the LOOT bag
      const key = ITEMS[m.key].fish ? fishKeepKey({ kind: 'fish', key: m.key, rarity: ITEMS[m.key].rarity }) : m.key;
      if (!addItem(key, clamp(m.tier || 0, 0, tierCount(ITEMS[key]) - 1))) return post({ type: 'mod-set', ok: false, error: 'no room in the gear slots' });
      Sound.buy();
      return sendMods(true);
    }
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
    // the FX tab: the effects' settings, live (changed in place: the effects read FX_LOOKS every frame)
    if (m.type === 'fx' && m.looks) for (const [k, v] of Object.entries(m.looks)) if (FX_LOOKS[k]) Object.assign(FX_LOOKS[k], v);
  });
  // The FX tab's "show": a cutscene frame that plays over and over (a beat after it's all in, it starts again).
  setInterval(() => {
    const sc = st.qScene;
    if (!sc || !sc.fxLoop) return;
    const now = performance.now();
    if (now - sc.t0 > frameMs(QUEST_SCENES[sc.id][sc.i]) + 2500) { sc.t0 = now; sc.fired = new Set(); sc.cam = null; }
  }, 100);
  function fxShowOff() {   // whatever the last "show" put up goes away
    clearTimeout(fxShowOff.t);
    if (st.qScene && st.qScene.fxLoop) st.qScene = null;
    if (st.hkDeath && st.hideAll) { st.hkDeath = null; st.hideAll = false; }
    st.hkCard = null;
    if (st.g0d && st.g0d.key === 'glitch') st.g0d = null;
  }
  // ---- The TESTING tab (meat testing): cheats on the running game, and jumps to a sector with any event.
  // 'test' { act, ... }; the game sends 'test-state' (what the run looks like now) whenever it changes.
  const freshRun = async () => {   // a practice run, on the map after the public net
    endRun();
    startRun('TEST' + Math.floor(Math.random() * 90000 + 10000), true);
    await settle();
    if (st.mode === 'play' && st.lv) { await pick(st.lv.safe); await settle(); }
    if (st.mode !== 'map') { toMap(); await settle(); }
  };
  const onMap = async () => { if (!st.run || st.run.ended) await freshRun(); if (st.panel || st.mode !== 'map') { toMap(); await settle(); } };
  // Climb to sector `to` (1-based sectors: to 2 = the 2nd), with `ev` as that sector's event (the rest roll as usual).
  const toSector = async (to, ev) => {
    if (ev || !st.run || st.run.ended || st.run.sector >= to - 1) await freshRun(); else await onMap();
    const run = st.run;
    run.practice = true;
    while (run.sector < to - 1) {
      const old = run.sector, boss = bossIdOf(old);
      run.at = boss; if (!run.visited.includes(boss)) run.visited.push(boss);
      run.sector++; run.sectorsCleared = (run.sectorsCleared || 0) + 1;
      addSector(run.map, run.seed, run.sector, run.sector === to - 1 ? ev || null : null);
      run.fence = [];
      if (run.sector < to - 1) (run.evSeen = run.evSeen || []).push(run.sector);   // only the last one's card comes up
      if (run.sector === to - 1) { await swapTo(() => toMap(old)); await settle(); }
    }
  };
  // HAD3S: straight into a sector's boss (0: MYCONET, 1: CERBERUS), past the public net
  const had3sBoss = async s => {
    if (st.lv && st.lv.safe != null) { await pick(st.lv.safe); await settle(); }
    if (st.mode !== 'map') { toMap(); await settle(); }
    if (st.evCard) closeEventCard();
    const run = st.run;
    if (s >= 1) { run.sector = 1; addSector(run.map, run.seed, 1); }
    await enterNode(run.map[bossIdOf(s)], true); await settle();
  };
  const TEST = {
    god: () => { st.god = !st.god; },
    debug: () => { st.debug = !st.debug; },
    free: () => { st.freeTravel = !st.freeTravel; st.mapSel = null; },
    stopclocks: () => { st.editorHold = !st.editorHold; },   // the layer clocks hold still (on: for looking at a scene) or run
    // the game's own music setting (while the music tab plays a track, it comes back when the tab stops) and sound effects
    music: () => { if (tabPlaying) gameMusicOn = !gameMusicOn; else save.musicOn = !save.musicOn; Sound.init(); Sound.levels(); },
    sfx: () => { save.muted = !save.muted; Sound.init(); Sound.levels(); if (!save.muted) Sound.ui(); },
    ad: m => { if (!ADS[m.key]) return; if (st.ad) closeAd(); st.dev = false; showAd(m.key); },   // the ADS tab: put that ad up now
    credits: m => { st.run.credits = Math.round(+m.n || 0); },
    int: m => { const n = Math.max(1, Math.round(+m.n || 1)); st.run.maxInt = Math.max(st.run.maxInt, n); st.run.integrity = n; },
    heal: () => { st.run.integrity = st.run.maxInt; },
    rep: m => { save.rep = Math.max(0, Math.round(+m.n || 0)); persist(); },   // REP (the editor's save; no run needed)
    // quests (engine/quests.js): open the DISC quest (a sector cleared + POPS on the crew), give it, set the step, the scene, the call
    qopen: () => { save.stats = save.stats || {}; save.stats.sectors = Math.max(1, save.stats.sectors || 0); save.legacy = save.legacy || {}; save.legacy.crew_pops = Math.max(1, save.legacy.crew_pops || 0); persist(); },
    qdisc: () => { if (st.run && !holdingDisc()) addItem('disc', 0); },
    qstep: m => {
      save.quests = save.quests || {}; save.legacy = save.legacy || {};
      if (m.step === 'none') delete save.quests.pops; else Object.assign(questOf('pops'), { step: m.step, seen: true, news: true });
      if (['raid', 'g0d', 'done'].includes(m.step)) save.legacy.crew_b0y = 1; else delete save.legacy.crew_b0y;   // (b0y on the crew from step 6, OMNI RAID: d0g is w00f then)
      persist();
    },
    qscene: m => playScene(m && m.key && QUEST_SCENES[m.key] ? m.key : 'disc'),
    // the FX tab's "show" (tools/data/fx_file.js LOOKS[].show): a scene frame on a loop, a hacker's card or death screen
    fxoff: () => fxShowOff(),
    fxscene: m => {
      if (!QUEST_SCENES[m.key] || !QUEST_SCENES[m.key][m.frame]) throw new Error('no such scene frame');
      fxShowOff(); playScene(m.key);
      Object.assign(st.qScene, { i: m.frame, t0: performance.now(), fxLoop: true });
    },
    // the mold slider (the G0D tab): how much mold the transitions and the mold glitch carry; null = off
    moldlvl: m => { st.moldDev = m.m == null ? null : clamp(+m.m, 0, 1); },
    moldwipe: async m => {   // a screen transition at the mold level (the same screen comes back)
      if (m.m != null) st.moldDev = clamp(+m.m, 0, 1);
      else if (st.moldDev == null) st.moldDev = 0.7;
      fxShowOff(); await wipeOut(0); wipeIn();
    },
    fxcodex: () => {   // the codex, with the first found mod set to decode again (only the animation: nothing else changes)
      fxShowOff(); openCodex();
      const k = codexMods().find(x => save.seen[x]);
      if (k) delete save.codexRead[k];
    },
    fxcard: m => { if (!HACKERS[m.key]) return; fxShowOff(); st.hkCard = { id: m.key, side: HACKERS[m.key].side, t0: performance.now() - 500 }; },
    fxdeath: m => {
      if (!HACKERS[m.key]) return;
      fxShowOff();
      st.hideAll = true; st.hkDeath = { id: m.key, side: HACKERS[m.key].side, text: hkLine({ id: m.key }, 'kill'), t0: performance.now() };
      fxShowOff.t = setTimeout(fxShowOff, 8000);   // (the screen comes back)
    },
    qcard: () => questCard('pops'),
    qtag: () => { if (st.run && !hasLoot('dogtag')) addItem('dogtag', 0); },
    qwins: m => { questOf('pops').d0g = clamp(Math.round(+m.n || 0), 0, 10); persist(); },
    had3s: async () => { endRun(); st.seed = 'HAD3S'; startRun('HAD3S', false); await settle(); },
    myconet: async () => { endRun(); startRun('HAD3S', false); await settle(); await had3sBoss(0); },
    cerberus: async () => { endRun(); startRun('HAD3S', false); await settle(); await had3sBoss(1); },
    rivalgear: () => { if (st.run) for (const k of ['leash', 'bone', 'muzzle', 'honey']) st.run.items.push({ key: k, tier: 0, n: 1 }); },
    b0yomni: async () => {
      Object.assign(questOf('pops'), { step: 'raid', seen: true }); save.legacy = save.legacy || {}; save.legacy.crew_b0y = 1; persist();
      endRun(); startRun(newSeed(), false); await settle();
      if (st.lv && st.lv.safe != null) { await pick(st.lv.safe); await settle(); }
      if (st.mode !== 'map') { toMap(); await settle(); }
      if (st.evCard) closeEventCard();
      await enterNode(st.run.map[bossIdOf(0)], true); await settle();
      await wait(1200); if (st.corp) hkSpawn('b0y', 'call');
    },
    // the H3AV3N seed, as if you typed it: a QUEST run from the start (engine/heaven.js)
    // The loot viewer (the user, 2026-10-31): what the node picked on the map (or the one you're on) could give. Read
    // straight off the seed, nothing taken: a market's offers and every reroll, a cache's loot and picks, a corp's boss
    // reward, and the loot-drop odds for $ nodes.
    lootview: () => post({ type: 'loot-view', text: lootReport() }),
    h3av3n: async () => { g0dfStop(); st.g0d = null; st.g0dBar = null; endRun(); st.seed = 'H3AV3N'; st.practice = !save.beatG0D; startRun('H3AV3N', st.practice); await settle(); },
    qcall: () => queueCall('pops', QUEST_LINES.found),
    event: m => toSector(2, m.key),
    sector: m => toSector(clamp(Math.round(+m.n || 2), 1, 9), null),
    boss: async () => { await onMap(); const n = Object.values(st.run.map).find(x => x.type === 'final' && x.sector === st.run.sector) || st.run.map[bossIdOf(st.run.sector)]; await enterNode(n, true); await settle(); },   // (HEAD FIRST: the boss is the first node)
    clear: async () => { await onMap(); const run = st.run, b = bossIdOf(run.sector); run.at = b; if (!run.visited.includes(b)) run.visited.push(b); await sectorClear(false); await settle(); },
    bench: async () => {   // a SAFEHOUSE with the WORKBENCH (engine/bench.js): the post unlocked, letters if you have none
      await onMap();
      save.legacy = save.legacy || {}; save.legacy.bench = Math.max(1, save.legacy.bench || 0);
      const b = benchSave();
      if (!benchCount()) Object.assign(b.letters, { E: 3, A: 2, R: 3, S: 2, T: 2, I: 1, O: 2, N: 1, L: 1, P: 3, K: 2, M: 1, W: 2, G: 2, H: 1, C: 1, U: 1, F: 1, Z: 1, '0': 1, '*': 1 });
      persist();
      const node = { id: 'test-rest' + Math.floor(Math.random() * 1e6), type: 'rest', sector: st.run.sector };
      await swapTo(() => openRepair(node)); await settle();
    },
    letters: () => { const b = benchSave(); for (const ch of 'EEAARRSSTTPPKWMNGOZX0*') b.letters[ch] = (b.letters[ch] || 0) + 1; persist(); },
    pier: async () => { await onMap(); st.run.credits = Math.max(st.run.credits, 100); await swapTo(() => openPier({ id: 'test-pier', sector: st.run.sector, type: 'pier' })); await settle(); },   // fishing (engine/fishing.js)
    uplink: async () => { await TEST.clear(); await swapTo(openUplink); await settle(); },
    anomaly: async m => {   // on the corps you can go to next
      await onMap();
      const run = st.run;
      for (const id of availableNodes()) { const n = run.map[id]; if (n.type === 'corp' || n.type === 'final') { if (m.key) n.mod = m.key; else delete n.mod; } }
      if (m.key === 'thief') addFence(run.map, run.seed, run.sector);
    },
    // feats (engine/feats.js): grant / take back one, show its FEAT box (when things are calm), wipe progression
    // hackers (engine/hackers.js): bring one into the layer you're in (a rival, or crew as if you'd called them)
    hacker: m => { if (!HACKERS[m.key] || !st.corp || !st.corp.hasBoss || !st.lv) throw new Error('get into a corp layer first'); hkSpawn(m.key, HACKERS[m.key].side === 'bad' ? 'rival' : 'call'); },
    feat: m => { if (!FEAT_BY_ID[m.key]) return; if (m.on) grantFeat(m.key); else ungrantFeat(m.key); },
    // the G0D tab (engine/g0d.js): go to the screen a look belongs on, then draw it there ('' = off)
    g0d: async m => {
      if (!m.key) { st.g0d = null; return; }
      const where = g0dWhere(m.key);
      if (!where) throw new Error('no such G0D look');
      st.g0d = null;
      const live = st.run && !st.run.ended;
      if (where === 'layer' && !(live && st.mode === 'play' && st.lv)) await enterCorp('basic', false);
      if (where === 'map' && !(live && st.mode === 'map')) await onMap();
      if (where === 'win' && !(st.mode === 'over' && st.result && (st.result.win || st.result.sector))) await SCENES.sectorclear();
      if (where === 'death' && !(st.mode === 'over' && st.result && !st.result.win && !st.result.sector)) {
        await enterCorp('basic', false); await window.endRun(false); await settle();
      }
      st.g0d = { key: m.key, t0: performance.now(), still: !!m.still };
    },
    // THE HEALTH BAR: its own overlay, over the look (or a corp layer if nothing with a header is up); '' = off
    g0dhp: async m => {
      st.g0dBar = null;
      if (!m.key) return;
      if (!(st.run && !st.run.ended && (st.mode === 'play' || st.mode === 'map'))) { st.g0d = null; await enterCorp('basic', false); }
      st.g0dBar = m.key; st.g0dBarT0 = performance.now();
    },
    // the g0d tab's stage buttons ('' = stop): the real H3AV3N, straight to that stage (the prototype's own stages are
    // gone; engine/g0dfight.js). g0dfset: its numbers and b0y
    g0df: async m => {
      if (!m.stage) { g0dfStop(); return; }
      return TEST.heaven({ where: m.stage });
    },
    // H3AV3N in the real game (engine/heaven.js): its sector map, or straight into the maze
    heaven: async m => {
      g0dfStop(); st.g0d = null; st.g0dBar = null;
      await freshRun(); heavenSetup(); toMap(); await settle();
      // heaven's map raises its DEEP MOLD card: going on past the map, close it as a player would (left open under
      // the fight or the maze, it took every tap)
      if (m.where && m.where !== 'map' && st.evCard) closeEventCard();
      if (m.where === 'maze') { const n = Object.values(st.run.map).find(o => o.heaven === 'maze'); await enterNode(n, true); await settle(); }
      if (m.where === 'fight') { const n = Object.values(st.run.map).find(o => o.heaven === 'g0d'); await enterNode(n, true); }
      const g0dNode = () => Object.values(st.run.map).find(o => o.heaven === 'g0d'), real = () => ({ real: true, node: g0dNode(), startInt: st.run.integrity, startCr: st.run.credits });
      if (m.where === 'fake') heavenFakeWin(real());   // the fake win (the rewards screen, frozen), then the stand
      if (m.where === 'die') { g0dfStart('fight', real()); heavenDie(st.g0df); }   // G0D dies, then the fake win
      if (m.where === 'stand') g0dfStart('stand', real());
      if (m.where === 'end') heavenCollapse({ node: g0dNode() });
    },
    // TESTING: kits. They only add: a mod you have only ever goes up, a mod with no free slot is skipped, gear that
    // doesn't fit on the belt is skipped, nothing of yours is replaced. The terminal says what you got.
    kit: m => {
      const run = st.run, got = [], skipped = [];
      const mod = (key, tier) => {
        if (has(key)) {
          const was = modTier(key);
          if (tier <= was) return skipped.push(MODS[key].name + ' (have it)');
          run.modTier[key] = tier;
          if (key === 'buffer') { run.maxInt += tier - was; run.integrity += tier - was; }
          return got.push(MODS[key].name + ' up');
        }
        if (!modRoom(key)) return skipped.push(MODS[key].name + ' (no slot)');
        addMod(key, tier); got.push(MODS[key].name);
      };
      const gear = (key, tier, n) => { let k = 0; while (k < n && addItem(key, tier)) k++; if (k) got.push(ITEMS[key].name + (k > 1 ? 'x' + k : '')); if (k < n) skipped.push(ITEMS[key].name + ' (belt full)'); };
      if (m.key === 'tank') { mod('buffer', 3); gear('patch', 2, 10); run.integrity = Math.max(run.integrity, run.maxInt); }
      if (m.key === 'tracker') { mod('tracer', tierCount(MODS.tracer) - 1); mod('keylogger', tierCount(MODS.keylogger) - 1); }
      if (m.key === 'crew') { gear('call', 0, 5); for (const id of HK_CREW) if (ITEMS['call_' + id]) gear('call_' + id, 0, 2); }
      if (m.key === 'shop') { run.credits += 500; got.push('+500cr'); }
      setMsg(`> ${m.key} kit: ${got.join(', ') || 'nothing new'}${skipped.length ? '. skipped: ' + skipped.join(', ') : ''}`.slice(0, 120), got.length ? C.accent : C.mid);
      Sound.buy();
    },
    g0dfset: m => { for (const [k, v] of Object.entries(m.set || {})) if (k in G0DF && typeof G0DF[k] === typeof v) G0DF[k] = v; },
    g0dstill: m => { if (st.g0d) { st.g0d.still = !!m.on; st.g0d.t0 = performance.now(); } },
    featbox: m => { if (FEAT_BY_ID[m.key]) FEAT_QUEUE.push({ feat: m.key }); },
    wipe: () => { const w = wipeProgress(); FEAT_QUEUE.push({ head: 'THE BOARD', lines: ['progression wiped (test).', '', `refunded: ${w.refund} REP.`] }); },
    steal: async () => {   // your last mod goes to THE FENCE (made if this sector has none)
      const run = st.run;
      if (!run.mods.length) return;
      const key = run.mods.pop();
      (run.fence = run.fence || []).push({ key, tier: (run.modTier || {})[key] || 0 });
      addFence(run.map, run.seed, run.sector);
      setMsg(`> test: ${MODS[key].name} stolen. it's at THE FENCE.`, C.danger);
    },
  };
  const NEEDS_RUN = ['god', 'debug', 'free', 'credits', 'int', 'heal', 'steal', 'kit', 'lootview'];
  window.addEventListener('message', e => {
    const m = e.data;
    if (!m || m.to !== 'neon-game' || m.type !== 'test' || !TEST[m.act]) return;
    if (NEEDS_RUN.includes(m.act) && (!st.run || st.run.ended)) return post({ type: 'test-done', act: m.act, ok: false, error: 'no run: start one first' });
    if (m.act === 'lootview') { try { TEST.lootview(m); } catch (err) { post({ type: 'test-done', act: m.act, ok: false, error: String((err && err.message) || err) }); } return; }   // the loot viewer only reads: right away, outside the queue (it can run every second), and the run stays scored
    if (st.run) st.run.practice = true;
    queue = queue.then(letGo).then(() => TEST[m.act](m))
      .then(() => post({ type: 'test-done', act: m.act, ok: true }))
      .catch(err => post({ type: 'test-done', act: m.act, ok: false, error: String((err && err.message) || err) }));
  });
  let lastTest = '';
  setInterval(() => {
    const run = st.run && !st.run.ended ? st.run : null, ev = run ? sectorEvent(run.sector) : null;
    const m = { type: 'test-state', run: !!run, god: !!st.god, debug: !!st.debug, free: !!st.freeTravel, stopclocks: !!st.editorHold, mode: st.mode,
      music: tabPlaying ? !!gameMusicOn : !!save.musicOn, sfx: !save.muted, tabMusic: tabPlaying,
      credits: run ? run.credits : 0, int: run ? run.integrity : 0, maxInt: run ? run.maxInt : 0, sector: run ? run.sector + 1 : 0,
      event: ev, fence: run ? (run.fence || []).length : 0, mods: run ? run.mods.length : 0, feats: Object.keys(save.feats || {}), rep: save.rep || 0, quest: (save.quests && save.quests.pops && save.quests.pops.step) || 'none', qopen: questOpen(),
      g0d: st.g0d ? st.g0d.key : '', g0dStill: !!(st.g0d && st.g0d.still), g0dBar: st.g0dBar || '', g0df: st.g0df && st.mode === 'g0df' ? st.g0df.stage : '', g0dfCfg: G0DF };
    const s = JSON.stringify(m);
    if (s !== lastTest) { lastTest = s; post(m); }
  }, 300);

  post({ type: 'ready', version: VERSION, scenes: Object.keys(SCENES),
    events: Object.entries(SECTOR_EVENTS).map(([k, e]) => [k, e.name, e.kind, e.anomaly || null]),
    anomalies: Object.entries(ANOMALIES).map(([k, a]) => [k, a.name, a.tag, a.desc]),
    corpNames: Object.fromEntries(Object.entries(CORPS).map(([k, c]) => [k, c.name])), g0d: g0dList(), g0dHp: g0dHpList() });
}

// Debug hook for the console and automated tests.
window.__br = {
  state: st, save, C, Music, musicState, CORPS, FINAL, DRAW_FONT, SONGS, MUSIC_FOR, openTrackPlayer, trackLines, HELP_PAGES, Net, openMultiplayer, mpHost, mpLayer, mpSpec, mpStartRound, mpNextGame, mpSendEmote, mpLeave, amHost, mpKick, openProfile, tally, best, grantFeat, ungrantFeat, wipeProgress, FEATS, FEAT_QUEUE, featDone, statOf, genLayer, genMap, CONFIG, MODS, ITEMS,
  startRun, selectNode, enterNode, pick, useItem, activateMod, modUsable, modSpent, layerTick, predHeat, tilePos, tileCenter, nearness, pointerCell, parts, addMod, removeMod, addItem, pickMods, swapLines,
  toggleDev, devLines, availableNodes, panelLines, swapTo, openHelp, openCodex, openSettings, showTitle, buildScene,
  addSector, sectorClear, showSectorClear, pushOn, cashOut, openOmniReward, STAGES, modsAt, resumeRun, openBoard, LEGACY, legacyLv, repFor, saveRun, savedRun, clearRun,
  askSkip, scrollMapSector, sectorViewRow, SKIP_BOSS, toMap, startCorp, pickCorps, targetLevel, CORP_TELL, CODEX_CORPS, openShop,
  togglePause, pauseLines, abandonRun, moveFocus, moveTileCursor, moveMapCursor,
  cipherNow, BOSS_GEAR, PALETTES, clashWith, exoticOffer, tapsToBreak, openCache, openClash, bloodCost, coinOpen, coinFlip, tileCenter, COIN, showAd, closeAd, adBreak,
};
