// NeoN+1 engine/boot.js: What the music follows, and booting the game.
'use strict';
NEON_FILES.push(['engine/boot.js', 'v12.06']);

// ---------------- Music state ----------------
// Which song and how intense, from what's on screen. Read by the music scheduler.
function musicState() {
  // The dev music player takes over while it's open.
  if (st.dev && st.devPage === 'tracks' && st.preview) {
    const p = st.preview, tr = SONGS[p.key];
    return { song: p.playing ? p.key : 'none', level: p.level, urgency: p.urgency, low: p.low,
      tempo: 1 + (tr && tr.tick ? p.urgency * 0.25 : 0) + (p.level >= 3 ? 0.05 : 0) };
  }
  const run = st.run;
  let song = 'theme', level = 1, urgency = 0;
  if (st.mp && st.mp.state && st.mode === 'play' && st.lv && st.lv.spec) {
    const sp = st.lv.spec;
    return { song: MUSIC_FOR[sp.corp], level: sp.boss ? 3 : clamp(sp.pos, 0, 2), urgency: 0, low: mpPlaying() && st.mp.state.hp[st.mp.me] <= 1, tempo: sp.boss ? 1.05 : 1 };
  }
  // Menus (title, settings, codex, how to play, profile, multiplayer menu / lobby,
  // game over) get the mellow menu track; gameplay keeps the theme and corp songs.
  const inMenu = st.mode === 'title' || st.mode === 'over' || (!st.run && !(st.mp && st.mp.state && st.mode === 'play'));
  if (st.hideAll && !st.dying) song = 'none';           // the end-of-run screen glitch: silence (a death powers down instead)
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
  const low = !!(run && st.mode === 'play' && run.integrity <= 1 && !st.dying);
  const slowmo = !!(st.mode === 'play' && st.corp && st.corp.hasBoss && st.corp.def.slowmo && st.lv);   // BULLET TIME
  const tempo = (1 + (song === 'chronos' ? urgency * 0.25 : 0) + (level >= 3 ? 0.05 : 0)) * (slowmo ? 0.55 : 1);
  const track = song === 'none' ? 'none' : MUSIC_FOR[song === 'theme' ? 'map' : song] || song;
  return { song: track, level, urgency, low, tempo, pitch: slowmo ? 0.8 : 1 };
}
Music.setSource(musicState);

// ---------------- Boot ----------------
window.addEventListener('resize', resize);
applyPalette(save.palette, true);
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
showTitle();
// A shared room link (?room=CODE): straight to multiplayer, code filled in, and join.
{ const rc = !EDITOR && cleanRoomCode(params.get('room'));
  if (rc) { st.joinCode = rc; setTimeout(() => { openMultiplayer(); setTimeout(() => mpJoin(rc), 400); }, 50); } }
requestAnimationFrame(t => { last = t; frame(t); });
if (document.fonts && document.fonts.load) {
  document.fonts.load(`16px "JetBrains Mono"`).then(() => computeLayout()).catch(() => {});
  document.fonts.load(`800 16px "JetBrains Mono"`).catch(() => {});   // OMNI's heavy weight
}
