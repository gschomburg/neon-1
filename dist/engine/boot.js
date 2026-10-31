// NeoN+1 engine/boot.js: What the music follows, and booting the game.
'use strict';
NEON_FILES.push(['engine/boot.js', 'v13.94']);

// ---------------- Music state ----------------
// Which song and how intense, from what's on screen. Read by the music scheduler.
// The editor's music tab (tools/neon_editor.html, engine/editor.js) can pick the track and level itself.
function musicState() {
  const s = gameMusicState(), m = EDITOR && st.editorMusic;
  if (!m) return s;
  if (!m.playing) return s;   // the tab isn't playing: the game's own music (if its settings have music on)
  const song = m.key && SONGS[m.key] ? m.key : s.song, level = m.level != null ? m.level : s.level;
  const urgency = m.urgency || s.urgency, tr = SONGS[song];
  return Object.assign(s, { song, level, urgency, low: !!m.low || s.low,
    tempo: (1 + (tr && tr.tick ? urgency * 0.25 : 0) + (level >= 3 ? 0.05 : 0)) * (s.pitch < 1 ? 0.55 : 1) });
}
function gameMusicState() {
  // The dev music player takes over while it's open.
  if (st.dev && st.devPage === 'tracks' && st.preview) {
    const p = st.preview, tr = SONGS[p.key];
    return { song: p.playing ? p.key : 'none', level: p.level, urgency: p.urgency, low: p.low,
      tempo: 1 + (tr && tr.tick ? p.urgency * 0.25 : 0) + (p.level >= 3 ? 0.05 : 0) };
  }
  const run = st.run;
  let song = 'theme', level = 1, urgency = 0;
  // the intro, from the title card on: its own track (engine/intro.js INTRO_MUSIC)
  if (st.boot && st.boot.music && SONGS[INTRO_MUSIC.song]) return { song: INTRO_MUSIC.song, level: INTRO_MUSIC.level, urgency: 0, low: false, tempo: 1, pitch: 1 };
  if (st.mp && st.mp.state && st.mode === 'play' && st.lv && st.lv.spec) {
    const sp = st.lv.spec;
    return { song: trackFor(sp.corp), level: sp.boss ? 3 : clamp(sp.pos, 0, 2), urgency: 0, low: mpPlaying() && st.mp.state.hp[st.mp.me] <= 1, tempo: sp.boss ? 1.05 : 1 };
  }
  // Menus (title, settings, codex, how to play, profile, multiplayer menu / lobby,
  // game over) get the mellow menu track; gameplay keeps the theme and corp songs.
  const inMenu = st.mode === 'title' || st.mode === 'over' || (!st.run && !(st.mp && st.mp.state && st.mode === 'play'));
  if (st.boot && !st.boot.music) song = 'none';         // the intro: quiet until the title card
  else if (st.hideAll && !st.dying) song = 'none';           // the end-of-run screen glitch: silence (a death powers down instead)
  else if (inMenu) song = 'menu';
  else if (st.corp && st.corp.hasBoss) {
    song = st.corp.def.key;
    if (st.intro) level = 0;
    else if (st.mode === 'play' && st.lv) level = st.lv.boss ? (song === 'omni' || st.corp.node.type === 'final' ? 4 : 3) : clamp(st.corp.idx, 0, 2);
    else if (st.mode === 'panel' && st.panelTitle === 'CORP BREACHED') { song = 'theme'; level = 1; }   // boss reward: back to the overworld track
    else level = 0;                                      // between the intro and the first layer
    if (st.timer && st.timer.max) urgency = clamp(1 - st.timer.left / st.timer.max, 0, 1);
    if (song === 'chronos' && st.lv && st.lv.boss) urgency = Math.min(1, urgency + st.lv.misses * 0.25);
    if (song !== 'chronos') urgency *= 0.3;
  } else if (st.corp) level = 0;                         // public net
  // the PIER: its own track (one of FISH_TRACKS, picked when you arrive), amped up while you reel one in
  if (st.mode === 'fish' && st.fish && SONGS[st.fish.track] && song !== 'none') return { song: st.fish.track, level: st.fish.reel ? 3 : 1, urgency: 0, low: false, tempo: 1, pitch: 1 };
  const low = !!(run && st.mode === 'play' && (zombie() ? (run.rot || 0) >= ROT.max - 30 : bloodMoney() ? run.credits < bloodCost(1) : run.integrity <= 1) && !st.dying);
  const slowmo = !!(st.mode === 'play' && st.corp && st.corp.hasBoss && st.corp.def.slowmo && st.lv);   // BULLET TIME
  const tempo = (1 + (song === 'chronos' ? urgency * 0.25 : 0) + (level >= 3 ? 0.05 : 0)) * (slowmo ? 0.55 : 1);
  // GRAVE ROBBER: its own spooky track follows you around the map (corps keep theirs)
  const track = song === 'none' ? 'none' : song === 'theme' && run && has('graverobber') && SONGS[GRAVE_TRACK] ? GRAVE_TRACK : trackFor(song === 'theme' ? 'map' : song);
  return { song: track, level, urgency, low, tempo, pitch: slowmo ? 0.8 : 1 };
}
Music.setSource(musicState);

// ---------------- Boot ----------------
window.addEventListener('resize', resize);
applyPalette(save.palette, true);
checkEpoch();   // engine/feats.js: a progression wipe, when PROGRESS_EPOCH went up
st.msgCol = C.text;
resize();
// Version stamps: every game file says which build it's from. One missing (not uploaded) or from
// another build (an old copy cached on a phone) puts a warning on the title screen.
try {
  const want = [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src').split('?')[0])
    .filter(f => !/^https?:/.test(f));
  const got = new Map(window.NEON_FILES || []);
  const bad = want.filter(f => got.get(f) !== VERSION);
  if (bad.length) st.fileWarn = `${bad.length} game file${bad.length > 1 ? 's' : ''} not ${VERSION}: ${bad[0]}${bad.length > 1 ? '...' : ''}`;
} catch (e) { /* no document (tests) */ }
// A newer build on the server (dist/version.json, written by tools/bump.js): the title offers an update.
// Checked a few seconds after load, when you come back to the tab, and every 10 minutes. Not from a file.
const verNum = v => { const [a, b] = String(v).replace('v', '').split('.').map(n => parseInt(n, 10) || 0); return a * 1000 + b; };
let verCheckAt = 0;
function checkVersion(force) {
  if (location.protocol === 'file:' || EDITOR || (!force && Date.now() - verCheckAt < 60000)) return;
  verCheckAt = Date.now();
  fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null)
    .then(d => { if (d && verNum(d.version) > verNum(VERSION)) st.newVersion = d.version; }).catch(() => {});
}
// the update: load the page again past the cache (the new index.html brings new ?v= tags for every file)
function updateGame() { const u = new URL(location.href); u.searchParams.set('u', Date.now()); location.replace(u.toString()); }
setTimeout(() => checkVersion(true), 4000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkVersion(); });
setInterval(() => checkVersion(true), 600000);
showTitle();
if (!EDITOR && !params.get('room') && !params.get('nointro')) startIntro();   // the boot / login intro over the title
// A shared room link (?room=CODE): straight to multiplayer, code filled in, and join.
{ const rc = !EDITOR && cleanRoomCode(params.get('room'));
  if (rc) { st.joinCode = rc; setTimeout(() => { openMultiplayer(); setTimeout(() => mpJoin(rc), 400); }, 50); } }
requestAnimationFrame(t => { last = t; frame(t); });
if (document.fonts && document.fonts.load) {
  document.fonts.load(`16px "JetBrains Mono"`).then(() => computeLayout()).catch(() => {});
  document.fonts.load(`800 16px "JetBrains Mono"`).catch(() => {});   // OMNI's heavy weight
}
