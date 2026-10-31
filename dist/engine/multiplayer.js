// NeoN+1 engine/multiplayer.js: Online multiplayer, profiles, INFO.
'use strict';
NEON_FILES.push(['engine/multiplayer.js', 'v13.91']);

// ---------------- Online multiplayer ----------------
// 2-6 players take turns on one seeded run ("Jenga" rules, elimination):
//   - turn order is shuffled at the start of each game
//   - one pick per turn
//   - hit ICE: you lose 1 integrity, and the next player still in picks on the same layer
//   - find the real node: the layer is cleared (first try: +1 integrity), and the next,
//     bigger layer starts with the next player
//   - at 0 integrity you're knocked out and spectate; the last one standing wins
// Anyone who joins once the game is full spectates. After a game the host picks who
// plays the next one. Firebase only relays data: every game rebuilds the layers from
// the round's seed and replays the same moves, so all screens stay in sync.
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD9u6jTq-Kg2NRY4JlX9V9CDMyMEC0K-Qo',
  authDomain: 'runner-c83ba.firebaseapp.com',
  databaseURL: 'https://runner-c83ba-default-rtdb.firebaseio.com',
  projectId: 'runner-c83ba',
  storageBucket: 'runner-c83ba.firebasestorage.app',
  messagingSenderId: '1056518066367',
  appId: '1:1056518066367:web:411df8755d2ce68252760a',
};
// A fresh id per page load, so two windows on one computer count as two people.
const MY_ID = 'p' + Math.random().toString(36).slice(2, 10);

// Room data (rooms/{code}/...):
//   meta      { host, max, round, status: lobby|playing, picks: {id: true} }
//   members   {id: { name, logo, joined, online }}
//   rounds    {n: { seed, order: [ids] }}
//   moves     {n: {pushId: { by, tile, layer } | { kind: 'drop', by, layer }}}
//   cursors   {id: { x, y, r }}      emotes {pushId: { by, e }}
const Net = window.__fakeNet || (() => {
  let db = null;
  function init() {
    if (db) return true;
    try {
      if (!window.firebase) return false;
      const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.database(app);
      return true;
    } catch (e) { return false; }
  }
  const get = async path => (await db.ref(path).get()).val();
  const set = (path, val) => db.ref(path).set(val);
  const update = (path, obj) => db.ref(path).update(obj);
  const push = (path, val) => db.ref(path).push(val);
  const remove = path => db.ref(path).remove();
  const onDisconnectSet = (path, val) => db.ref(path).onDisconnect().set(val);
  const onDisconnectRemove = path => db.ref(path).onDisconnect().remove();
  function watch(path, ev, fn) {
    const ref = db.ref(path), cb = s => fn(s.val(), s.key);
    ref.on(ev, cb);
    return () => ref.off(ev, cb);
  }
  return { init, get, set, update, push, remove, onDisconnectSet, onDisconnectRemove, watch };
})();
// Logos (data/art/logos.js): players' logos, corps' (unlocked by beating the corp) and later rival
// hackers'. A profile keeps its logo's id; old saves kept a number (the place in the player logos'
// list then), which still reads as that logo.
const LOGO_W = 24, LOGO_H = 7;   // every logo is drawn in this box, centered
const LOGO_BY_ID = Object.fromEntries(ART_LOGOS.map(l => [l.id, l]));
const PLAYER_LOGOS = ART_LOGOS.filter(l => l.kind === 'player');
const logoOf = id => LOGO_BY_ID[id] || (typeof id === 'number' && PLAYER_LOGOS.length ? PLAYER_LOGOS[((id % PLAYER_LOGOS.length) + PLAYER_LOGOS.length) % PLAYER_LOGOS.length] : PLAYER_LOGOS[0]);
const logoUnlocked = l => l.kind === 'player' || (l.kind === 'corp' && corpStat(l.corp).breached > 0) || (l.kind === 'hacker' && (featDone('beat_' + l.hacker) || featDone('call_' + l.hacker)));   // a rival beaten 5 times, crew called 5 times
const myLogos = () => ART_LOGOS.filter(logoUnlocked);
const randomLogo = () => pickR(PLAYER_LOGOS, Math.random).id;
// A logo's art in the logo box: the blank columns every row shares trimmed off, then centered in
// LOGO_W x LOGO_H (every row LOGO_W wide), so every screen knows how much room a logo takes.
function hackerArt(id) {
  const rows = (logoOf(id).art || []).slice(0, LOGO_H), lead = Math.min(...rows.filter(l => l.trim()).map(l => l.length - l.trimStart().length));
  const out = rows.map(l => l.slice(isFinite(lead) ? lead : 0).trimEnd()), w = Math.min(LOGO_W, Math.max(0, ...out.map(l => l.length)));
  const left = Math.floor((LOGO_W - w) / 2), top = Math.floor((LOGO_H - out.length) / 2);
  const box = Array.from({ length: LOGO_H }, () => ' '.repeat(LOGO_W));
  out.forEach((l, k) => { box[top + k] = (' '.repeat(left) + l.slice(0, LOGO_W)).padEnd(LOGO_W); });
  return box;
}
// Logo + name as one block on your color style's background (dark styles used to vanish on a dark
// screen). Every row the same width, with a space of background on each side.
function logoBlock(logo, name, sty) {
  const art = hackerArt(logo), tag = `${logoMark(logo)} ${name}`;
  const w = Math.max(tag.length, ...art.map(l => l.length)) + 2;
  const mid = s => { const l = Math.floor((w - s.length) / 2); return (' '.repeat(l) + s).padEnd(w); };
  return [...art, tag].map(l => ({ text: mid(l), col: sty.fg, bgCol: sty.bg, bold: true }));
}
// RANDOMIZE ALL: a new name, logo and color at once.
function randomizeProfile(prof) {
  prof.name = randomName();
  prof.logo = randomLogo();
  prof.style = Math.floor(Math.random() * PLAYER_STYLES.length);
  persist();
}
// Player color styles: a text color on a background, picked to read well together. Fixed colors
// (not palette-based), so a player looks the same on everyone's screen. They live in palettes.js
// (NEON only if it didn't load).
const PLAYER_STYLES = (window.NEON_PALETTES && window.NEON_PALETTES.styles) || [{ name: 'NEON', fg: '#3cf0ff', bg: '#06303a' }];
const styleOf = i => PLAYER_STYLES[((i % PLAYER_STYLES.length) + PLAYER_STYLES.length) % PLAYER_STYLES.length];
const randomName = () => {
  const mid = pickR(NAME_B, Math.random);
  return Math.random() < 0.5 ? pickR(NAME_A, Math.random) + '_' + mid : mid + '_' + pickR(NAME_C, Math.random);
};
function profile() {
  if (!save.profile) { save.profile = { name: randomName(), logo: randomLogo() }; persist(); }
  if (typeof save.profile.logo !== 'string' || !LOGO_BY_ID[save.profile.logo]) { save.profile.logo = logoOf(save.profile.logo).id; persist(); }   // old saves: a number
  if (save.profile.style == null) { save.profile.style = Math.floor(Math.random() * PLAYER_STYLES.length); persist(); }
  return save.profile;
}
const logoMark = id => logoOf(id).mark;
const logoChar = id => { const m = [...logoMark(id)]; return m[1] || m[0] || '@'; };
// Step through the logos you've unlocked (the profile's < > and the multiplayer menu's [ LOGO ]).
function stepLogo(prof, d) {
  const list = myLogos(), i = list.findIndex(l => l.id === logoOf(prof.logo).id);
  prof.logo = list[((i < 0 ? 0 : i + d) % list.length + list.length) % list.length].id;
  persist(); Sound.tick();
}
const EMOTES = ['GG', 'GL', 'NICE', 'OOF', 'LOL', 'HURRY', '\\o/', 'x_x', 'o_O', '>:)'];
const MP_MAX = 6;

// ---- room helpers
const mpMember = id => (st.mp && st.mp.members[id]) || { name: '???', logo: 0, online: false };
const mpName = id => mpMember(id).name;
// Short form for tight spots: 3 letters from each half, e.g. NEON_RAT -> NEORAT.
const mpShort = id => mpName(id).split('_').map(w => w.slice(0, 3)).join('').slice(0, 6);
// Each player gets a color by their place in the room.
const mpStyle = id => { const sIdx = mpMember(id).style; return sIdx != null ? styleOf(sIdx) : null; };
const mpBg = id => { const s_ = mpStyle(id); return s_ ? s_.bg : null; };
function mpColor(id) {
  const s_ = mpStyle(id);
  if (s_) return s_.fg;
  const m = st.mp, cols = [C.accent, C.money, C.epic, C.rare, C.legendary, C.exotic];
  const ids = Object.keys(m.members).sort((a, b) => (m.members[a].joined || 0) - (m.members[b].joined || 0));
  return cols[Math.max(0, ids.indexOf(id)) % cols.length];
}
// The host is whoever made the room; if they've gone, the longest-connected player.
function mpHostId() {
  const m = st.mp;
  if (!m || !m.meta) return null;
  if (m.members[m.meta.host] && m.members[m.meta.host].online) return m.meta.host;
  const on = Object.entries(m.members).filter(([, v]) => v.online).sort((a, b) => (a[1].joined || 0) - (b[1].joined || 0));
  return on.length ? on[0][0] : m.meta.host;
}
const amHost = () => !!st.mp && mpHostId() === st.mp.me;
const mpMine = () => !!(st.mp && st.mp.state && !st.mp.state.winner && st.mp.state.turn === st.mp.me);
const mpPlaying = () => !!(st.mp && st.mp.state && st.mp.state.alive[st.mp.me]);
function nextAlive(S, from) {
  const i = S.order.indexOf(from);
  for (let k = 1; k <= S.order.length; k++) {
    const id = S.order[(i + k) % S.order.length];
    if (S.alive[id]) return id;
  }
  return from;
}

const MP_CORPS = ['perimeter', 'sigil', 'mirror']; // Chronos skipped: its clock doesn't fit taking turns

// Which corp and layer a given (shared) layer number is. Corps come in blocks of
// 4 layers (3 + a boss); nodes keep climbing: layer n has n + 1 nodes.
function mpSpec(seed, layer) {
  const seg = Math.floor((layer - 1) / 4), pos = (layer - 1) % 4;
  const order = shuffle(MP_CORPS.slice(), rngFor(seed, 'mp-corps'));
  return {
    seg, pos, corp: order[seg % order.length],
    tier: clamp(1 + Math.floor(seg / order.length), 1, 3),
    boss: pos === 3, n: layer + 1, nodeId: 'mp' + seg,
  };
}

function mpLayer(seed, layer) {
  const sp = mpSpec(seed, layer), def = CORPS[sp.corp];
  let tell = def.tell;
  if (tell === 'mirror' && sp.tier >= 2) tell = 'vmirror';
  if (tell === 'corner' && sp.tier >= 2 && sp.corp !== 'omni') tell = 'edge';
  const mark = tell === 'mark' ? { level: sp.tier, glyph: sp.tier === 1 ? pickR(MOTIFS, rngFor(seed, 'mp-sigil', sp.seg)) : null } : null;
  // Mirror tells need the previous layer of the same corp, so build them in order.
  let prevSafe = null, lv = null;
  for (let i = 0; i <= sp.pos; i++) {
    const spi = mpSpec(seed, layer - sp.pos + i);
    const t = spi.boss && def.bossTell ? def.bossTell : tell;
    lv = genLayer({ seed, nodeId: sp.nodeId, idx: i, n: spi.n, tell: t, prevSafe, loot: false, mark });
    prevSafe = lv.safeCell;
  }
  lv.spec = sp; lv.boss = sp.boss; lv.misses = 0; lv.dmg = 1;
  if (sp.boss && def.bossFlash) lv.maskAt = performance.now() + 900 + CONFIG.maskDelayMs;
  return lv;
}

// ---- menu, profile, host / join
function openMultiplayer() {
  const online = Net.init();
  openPanel('MULTIPLAYER', (T, B, X) => {
    const prof = profile();
    T('MULTIPLAYER', C.accent);
    T('');
    T('2-6 runners. one run.');
    T('take turns picking nodes.');
    T('hit ICE: lose integrity, and');
    T('the next player picks.');
    T('at 0 you are knocked out.');
    T('last one standing wins.', C.danger);
    T('');
    T('you are', C.mid);
    { const sty = styleOf(prof.style); X({ text: ` ${logoMark(prof.logo)} ${prof.name} `, col: sty.fg, bgCol: sty.bg, bold: true }); }
    X({ row: [
      { text: '[ NEW NAME ]', id: 'mpname', onTap: () => { prof.name = randomName(); persist(); Sound.tick(); } },
      { text: '[ LOGO ]', id: 'mplogo', onTap: () => stepLogo(prof, 1) },
      { text: '[ COLOR ]', id: 'mpcolor', onTap: () => { prof.style = (prof.style + 1) % PLAYER_STYLES.length; persist(); Sound.tick(); } },
    ] });
    B('[ RANDOMIZE ALL ]', 'mprand', () => { randomizeProfile(prof); Sound.ui(); });
    T('');
    if (!online) { T('online is unavailable.', C.danger); T('check your connection.', C.dim); }
    else {
      X({ box: true, text: 'H O S T', sub: 'make a room code', id: 'mphost', onTap: mpHost, minW: 22 });
      T('');
      T('join a room', C.mid);
      X({ row: [
        { field: 'room', width: 6, value: () => st.joinCode || '', clean: cleanRoomCode,
          onCommit: (v, enter) => { st.joinCode = cleanRoomCode(v); if (enter && st.joinCode) mpJoin(); } },
        { text: '[ JOIN ]', id: 'mpjoin', onTap: () => mpJoin() },
      ] });
      T(Field.editing('room') ? 'enter to join, esc to cancel' : 'tap the box to type the code', C.dim);
    }
    B('[ BACK ]', 'back', () => swapTo(showTitle));
  }, '> multiplayer.', { full: true });
  st.keyHandler = k => { if (k === 'escape') { swapTo(showTitle); return true; } return false; };
}

// INFO: what the game is and how it was made. From the version tag in the footer.
const REPO_URL = 'https://github.com/gschomburg/neon-1';
function openInfo() {
  openPanel('INFO', (T, B, X) => {
    const P = (s, col = C.text) => wrapText(s, 31).forEach(l => T(l.padEnd(31), col));
    X({ text: 'N e o N + 1', col: C.accent, bold: true });
    T(`build ${VERSION}`, C.dim);
    T('');
    P('a minimalist cyberpunk push-your-luck game. hack a corp one layer at a time: one node is real, the rest are ICE. every corp hides its real node its own way. learn the tells, get deeper.');
    T('');
    T('idea and design', C.mid);
    P('greg: the original idea, the game, the corps and their tells, and the playtesting.');
    T('');
    T('built with', C.mid);
    P('Claude (Anthropic\'s AI), in Claude Code, which wrote the code, the music and the placeholder art.');
    T('');
    P('started from One True Door (an earlier game, also made with Claude) as the reference. made in 2026.', C.mid);
    T('');
    B('[ GITHUB: gschomburg/neon-1 ]', 'repo', () => { try { window.open(REPO_URL, '_blank', 'noopener'); } catch (e) { /* blocked */ } });
    T('');
    B('[ BACK ]', 'back', () => swapTo(showTitle));
  }, '> info.', { full: true });
  st.keyHandler = k => { if (k === 'escape') { swapTo(showTitle); return true; } return false; };
}

// Your runner persona: a card with your logo, name and record. Used everywhere.
// The profile is THE BOARD's YOU tab now (engine/menus.js).
function openProfile() { openBoard('you'); }

async function mpHost() {
  if (st.mpBusy) return;
  st.mpBusy = true;
  setMsg('> opening a room...', C.mid);
  try {
    const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = null;
    for (let i = 0; i < 6 && !code; i++) {
      const c = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
      if (!(await Net.get(`rooms/${c}/meta`))) code = c;
    }
    if (!code) throw new Error('no free code');
    await Net.set(`rooms/${code}/meta`, { host: MY_ID, max: 4, round: 0, status: 'lobby', picks: { [MY_ID]: true }, created: Date.now() });
    await mpEnterRoom(code);
  } catch (e) { setMsg('> could not open a room.', C.danger); Sound.deny(); }
  st.mpBusy = false;
}

// Copy the room code to the clipboard (the canvas can't be selected).
// The Clipboard API needs https or localhost; a hidden textarea covers file:// pages.
async function copyText(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch (e) { /* try the old way */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) { return false; }
}
async function copyRoomCode(m) {
  const code = m.code, ok = await copyText(code);
  if (ok) { m.copiedAt = performance.now(); Sound.buy(); setMsg(`> room code ${code} copied.`, C.accent); }
  else { Sound.deny(); setMsg(`> couldn't copy. the code is ${code}.`, C.danger); }
}

const cleanRoomCode = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
// The room's link: this page with ?room=CODE. On phones the share sheet opens; elsewhere
// the link is copied.
async function shareRoom(m) {
  const url = location.href.split('#')[0].split('?')[0] + '?room=' + m.code;
  const web = /^https?:$/.test(location.protocol);
  // The share sheet only on phones, on the web. Chrome's desktop share (the Windows share
  // dialog) crashed the tab ("Aw, Snap!"), and a file:// link only works on this computer.
  const phone = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  if (web && phone && navigator.share) {
    try { await navigator.share({ title: 'NeoN+1', text: `join my NeoN+1 room: ${m.code}`, url }); Sound.buy(); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }   // anything else: copy instead
  }
  if (await copyText(url)) {
    m.sharedAt = performance.now(); Sound.buy();
    setMsg(web ? '> room link copied.' : '> link copied (a local file: it only works on this computer).', C.accent);
  } else { Sound.deny(); setMsg(`> couldn't copy. code: ${m.code}`, C.danger); }
}
async function mpJoin(codeIn) {
  if (st.mpBusy) return;
  const code = cleanRoomCode(codeIn != null ? codeIn : st.joinCode);
  if (!code) { Sound.deny(); setMsg('> type a room code first.', C.mid); return; }
  st.joinCode = code;
  st.mpBusy = true;
  setMsg(`> joining ${code}...`, C.mid);
  try {
    const meta = await Net.get(`rooms/${code}/meta`);
    if (!meta) { setMsg(`> room ${code} not found.`, C.danger); Sound.deny(); }
    else if (meta.kicked && meta.kicked[MY_ID]) { setMsg('> you were removed from that room.', C.danger); Sound.deny(); }
    else await mpEnterRoom(code);
  } catch (e) { setMsg('> could not join.', C.danger); Sound.deny(); }
  st.mpBusy = false;
}

// Become a member of the room and start listening to it.
async function mpEnterRoom(code) {
  const prof = profile();
  const base = `rooms/${code}`;
  await Net.set(`${base}/members/${MY_ID}`, { name: prof.name, logo: prof.logo, style: prof.style, joined: Date.now(), online: true });
  Net.onDisconnectSet(`${base}/members/${MY_ID}/online`, false);
  Net.onDisconnectRemove(`${base}/cursors/${MY_ID}`);
  const m = st.mp = { code, me: MY_ID, meta: null, members: {}, cursors: {}, round: 0, state: null, unsubs: [], cursorAt: 0, emoteAt: 0, seenEmotes: new Set(), dropWatch: {}, autoSeen: new Set() };
  // Don't replay emotes sent before we arrived.
  const old = await Net.get(`${base}/emotes`);
  if (old) for (const k of Object.keys(old)) m.seenEmotes.add(k);
  m.unsubs.push(Net.watch(`${base}/members`, 'value', v => { if (st.mp === m) { m.members = v || {}; mpHostDuties(); } }));
  m.unsubs.push(Net.watch(`${base}/cursors`, 'value', v => { if (st.mp === m) m.cursors = v || {}; }));
  m.unsubs.push(Net.watch(`${base}/emotes`, 'child_added', (v, key) => { if (st.mp === m && !m.seenEmotes.has(key)) { m.seenEmotes.add(key); mpShowEmote(v); } }));
  m.unsubs.push(Net.watch(`${base}/meta`, 'value', v => { if (st.mp === m && v) { m.meta = v; mpOnMeta(); } }));
  await swapTo(mpLobby);
}

// Things only the host does: let newcomers into an unfilled game, and knock out a
// player who disconnects on their turn (so the game can't stall).
function mpHostDuties() {
  const m = st.mp;
  if (!m || !m.meta || !amHost()) return;
  if (m.meta.status === 'lobby') {
    const picks = Object.assign({}, m.meta.picks || {});
    const ids = Object.keys(m.members).filter(id => m.members[id].online && !(m.meta.kicked || {})[id]).sort((a, b) => m.members[a].joined - m.members[b].joined);
    let changed = false;
    // Seat each newcomer once, when they first arrive (if there's room); after that,
    // only the host's own choices change who plays.
    for (const id of ids) {
      if (m.autoSeen.has(id)) continue;
      m.autoSeen.add(id);
      if (!picks[id] && Object.keys(picks).filter(p => m.members[p] && m.members[p].online).length < m.meta.max) { picks[id] = true; changed = true; }
    }
    if (changed) Net.update(`rooms/${m.code}/meta`, { picks });
  }
}

function mpOnMeta() {
  const m = st.mp;
  if (m.meta.kicked && m.meta.kicked[m.me]) {
    mpLeave();
    // Say so once the title screen is up (it sets its own message when it opens).
    (async () => { while (st.transitioning || st.mode !== 'title') await wait(50); setMsg('> you were removed from the room.', C.danger); })();
    return;
  }
  if (m.meta.status === 'playing' && m.meta.round && m.meta.round !== m.round) mpBeginRound(m.meta.round);
  else if (m.meta.status === 'lobby' && m.round && (st.panelTitle === 'RESULT' || (m.state && m.state.winner))) {
    // The host called everyone back to the lobby.
    m.state = null; st.lv = null;
    (async () => { while (st.transitioning) await wait(50); swapTo(mpLobby); })();
  }
  mpHostDuties();
}

// ---- lobby
function mpLobby() {
  scenePalette(null);
  openPanel('LOBBY', (T, B, X) => {
    const m = st.mp;
    if (!m || !m.meta) { T('connecting...', C.mid); return; }
    const host = amHost(), picks = m.meta.picks || {};
    const copied = m.copiedAt && performance.now() - m.copiedAt < 1500;
    X({ gap: 2, row: [
      { text: `ROOM  ${m.code.split('').join(' ')}`, col: C.accent },
      { text: copied ? '[ COPIED ]' : '[ COPY ]', id: 'mpcopy', sel: copied, onTap: () => copyRoomCode(m) },
    ] });
    const shared = m.sharedAt && performance.now() - m.sharedAt < 1500;
    B(shared ? '[ LINK COPIED ]' : '[ SHARE LINK ]', 'mpshare', () => shareRoom(m));
    T('send the code or the link to invite.', C.dim);
    T('');
    if (host) {
      X({ gap: 1, row: [
        { text: 'players' },
        { text: '[-]', id: 'mpmaxd', onTap: () => { Net.update(`rooms/${m.code}/meta`, { max: Math.max(2, m.meta.max - 1) }); Sound.tick(); } },
        { text: String(m.meta.max), col: C.bright },
        { text: '[+]', id: 'mpmaxu', onTap: () => { Net.update(`rooms/${m.code}/meta`, { max: Math.min(MP_MAX, m.meta.max + 1) }); Sound.tick(); } },
      ] });
    } else T(`players: ${m.meta.max}`, C.mid);
    const clk = mpClock();
    if (host) {
      const i = MP_CLOCKS.indexOf(clk);
      X({ gap: 1, row: [
        { text: 'turn clock' },
        { text: '[-]', id: 'mpclkd', onTap: () => { Net.update(`rooms/${m.code}/meta`, { clock: MP_CLOCKS[Math.max(0, i - 1)] }); Sound.tick(); } },
        { text: clk ? `${clk}s` : 'off', col: C.bright },
        { text: '[+]', id: 'mpclku', onTap: () => { Net.update(`rooms/${m.code}/meta`, { clock: MP_CLOCKS[Math.min(MP_CLOCKS.length - 1, i + 1)] }); Sound.tick(); } },
      ] });
      X({ text: `[ kick: ${m.kickMode ? 'ON ' : 'OFF'} ]`, id: 'mpkick', onTap: () => { m.kickMode = !m.kickMode; Sound.tick(); } });
    } else T(`turn clock: ${clk ? clk + 's' : 'off'}`, C.mid);
    T(host ? (m.kickMode ? 'tap someone to remove them.' : 'tap people to choose who plays.') : '', m.kickMode ? C.danger : C.dim);
    const ids = Object.keys(m.members).filter(id => !(m.meta.kicked || {})[id]).sort((a, b) => m.members[a].joined - m.members[b].joined).slice(0, 8);
    for (const id of ids) {
      const mem = m.members[id], plays = !!picks[id];
      const tags = [id === mpHostId() ? 'HOST' : '', !mem.online ? 'GONE' : plays ? 'PLAY' : 'WATCH'].filter(Boolean).join(' ');
      X({
        list: true, id: 'mem_' + id, sel: id === m.me,
        name: `${logoMark(mem.logo)} ${mem.name}`, col: mem.online ? mpColor(id) : C.dim, tint: mem.online ? mpBg(id) : null,
        right: tags, rightCol: plays ? C.accent : C.mid,
        onTap: () => {
          if (host && m.kickMode) { mpKick(id); return; }
          if (!host || !mem.online) return;
          const next = Object.assign({}, picks);
          if (next[id]) delete next[id];
          else if (Object.keys(next).filter(p => m.members[p] && m.members[p].online).length < m.meta.max) next[id] = true;
          else { Sound.deny(); return; }
          Net.update(`rooms/${m.code}/meta`, { picks: next });
          Sound.tick();
        },
      });
    }
    T('');
    const ready = Object.keys(picks).filter(id => m.members[id] && m.members[id].online).length;
    if (host) X({ box: true, text: 'S T A R T', sub: `${ready} playing`, id: 'mpstart', onTap: mpStartRound, minW: 22, disabled: ready < 2 });
    else T('waiting for the host to start' + '.'.repeat(1 + Math.floor(performance.now() / 400) % 3), C.mid);
    B('[ LEAVE ]', 'mpleave', mpLeave);
  }, '> lobby.');
  st.keyHandler = k => { if (k === 'escape') { mpLeave(); return true; } return false; };
}

async function mpStartRound() {
  const m = st.mp;
  if (!m || !amHost()) return;
  const ids = Object.keys(m.meta.picks || {}).filter(id => m.members[id] && m.members[id].online);
  if (ids.length < 2) { Sound.deny(); return; }
  const n = (m.meta.round || 0) + 1;
  await Net.set(`rooms/${m.code}/rounds/${n}`, { seed: newSeed(), order: shuffle(ids.slice(), Math.random) });
  await Net.update(`rooms/${m.code}/meta`, { round: n, status: 'playing' });
}

// ---- a game (round)
async function mpBeginRound(n) {
  const m = st.mp;
  m.round = n;
  const rd = await Net.get(`rooms/${m.code}/rounds/${n}`);
  if (!rd || st.mp !== m || m.round !== n) return;
  const max = CONFIG.startIntegrity, per = v => Object.fromEntries(rd.order.map(id => [id, v]));
  m.seed = rd.seed;
  m.state = { layer: 1, order: rd.order, alive: per(true), hp: per(max), max, cleared: per(0), turn: rd.order[0], winner: null, out: [] };
  m.waiting = false;
  if (m.unmoves) m.unmoves();
  // Moves wait until the first layer is on screen, then apply one at a time, in order.
  m.queue = new Promise(res => { m.ready = res; });
  m.unmoves = Net.watch(`rooms/${m.code}/moves/${n}`, 'child_added', mv => { m.queue = m.queue.then(() => mpApply(mv, n)).catch(e => console.error('multiplayer move failed', e)); });
  while (st.transitioning) await wait(50);
  swapTo(mpEnterLayer);
}

function mpEnterLayer() {
  const m = st.mp;
  if (!m || !m.state) return;
  const lv = mpLayer(m.seed, m.state.layer);
  st.corp = null; st.lv = lv; st.hover = -1; st.timer = null;
  scenePalette(lv.spec.corp);
  showBoard('play');
  st.busy = false;
  if (lv.boss) { Sound.boss(); shake(5, 0.5); } else Sound.layer(m.state.layer);
  mpTurnMsg();
  if (m.ready) { m.ready(); m.ready = null; }
}

// Called whenever the turn may have changed: restarts the turn clock, and makes a
// fuss when it becomes your turn.
function mpTurnMsg() {
  const m = st.mp;
  if (!m || !m.state || m.state.winner) return;
  const key = `${m.state.layer}:${m.state.turn}:${m.applied || 0}`;
  if (key !== m.turnKey) {
    m.turnKey = key;
    m.turnStart = performance.now();
    if (m.state.turn !== m.cardId) { m.cardId = m.state.turn; m.cardAt = performance.now(); }   // the turn card
    m.clockLast = null;
    m.nudged = false;
    if (mpMine()) {
      m.yourTurnAt = performance.now(); Sound.yourTurn(); flash(C.accent, 0.1, 0.4);
      try { if (navigator.vibrate) navigator.vibrate([120, 60, 120]); } catch (e) { /* not supported */ }
    }
  }
  if (mpMine()) setMsg('> your turn. pick a node.', C.accent);
  else setMsg(`> ${mpName(m.state.turn).toLowerCase()} is picking...`, C.mid);
}

// Whose turn, on the board itself: your turn = the board's edges glow in your colors;
// someone else's turn = the board is tinted with theirs (you're watching).
function mpTurnFrame({ now, bg }) {
  const m = st.mp;
  if (!m || !m.state || m.state.winner) return;
  if (mpMine()) {
    const sty = mpStyle(m.me), col = sty ? sty.fg : C.accent, a = 0.35 + 0.25 * Math.sin(now / 250);
    for (let r = 0; r < L.gh; r++) { bg(0, BOARD_Y + r, 1, col, a); bg(L.wc - 1, BOARD_Y + r, 1, col, a); }
  } else {
    const sty = mpStyle(m.state.turn);
    for (let r = 0; r < L.gh; r++) bg(0, BOARD_Y + r, L.wc, sty ? sty.bg : C.dim, 0.2);
  }
}

// The turn card: when the turn goes to another player, their logo and name fill the board
// for a moment, in their colors (yours says YOUR TURN).
const MP_CARD_MS = 1100;
const mpCardOn = now => !!(st.mp && st.mp.state && !st.mp.state.winner && st.mp.cardAt != null && now - st.mp.cardAt < MP_CARD_MS);
function mpTurnCard({ now, put, bg }) {
  const m = st.mp, id = m.state.turn, mem = mpMember(id), sty = mpStyle(id) || { fg: mpColor(id), bg: C.bg };
  const age = now - m.cardAt, art = hackerArt(mem.logo || 0), mine = id === m.me;
  const f = Math.min(1, age / 120, (MP_CARD_MS - age) / 160);   // fade in and out
  for (let r = 0; r < L.gh; r++) bg(0, BOARD_Y + r, L.wc, sty.bg, 0.9 * f);
  const label = mine ? 'Y O U R   T U R N' : `${mem.name}'S TURN`.slice(0, L.wc);
  const h = art.length + 2, y0 = BOARD_Y + Math.floor((L.gh - h) / 2);
  art.forEach((l, k) => put(Math.floor((L.wc - l.length) / 2), y0 + k, l, sty.fg, 'mp', true));
  put(Math.floor((L.wc - label.length) / 2), y0 + art.length + 1, label, sty.fg, 'mp', true);
}

// "YOUR TURN" across the board for a moment.
function mpTurnBanner({ now, put, bg }) {
  const m = st.mp;
  const age = now - (m.yourTurnAt || -1e9);
  if (!mpMine() || age > 1300) return;
  const y = BOARD_Y + Math.floor(L.gh / 2), a = 0.45 * (1 - age / 1300);
  for (let r = -1; r <= 1; r++) bg(0, y + r, L.wc, C.accent, a);
  const text = 'Y O U R   T U R N';
  put(Math.floor((L.wc - text.length) / 2), y, text, C.bright, 'mp', true);
}

// Turn clock: the host sets it in the lobby (0 = off). When it runs out on your
// turn, a random node is picked for you.
const MP_CLOCKS = [0, 10, 15, 20, 30];
const mpClock = () => (st.mp && st.mp.meta && st.mp.meta.clock != null) ? st.mp.meta.clock : 20;
function mpClockLeft(now) {
  const m = st.mp, sec = mpClock();
  if (!sec || !m || !m.state || m.state.winner || m.turnStart == null) return null;
  return Math.max(0, sec - (now - m.turnStart) / 1000);
}
function mpClockTick(now) {
  const m = st.mp;
  if (!m || !m.state || m.state.winner || !mpMine() || st.busy || m.waiting || st.wipe || st.mode !== 'play') return;
  // nudge once if you haven't picked after 5s: the chime and banner again
  if (!m.nudged && m.turnStart != null && now - m.turnStart > 5000) { m.nudged = true; m.yourTurnAt = now; Sound.yourTurn(); }
  const left = mpClockLeft(now);
  if (left == null) return;
  const s = Math.ceil(left);
  if (s !== m.clockLast) { m.clockLast = s; if (s <= 5 && s > 0) Sound.clock(); }
  if (left <= 0) {
    const open = st.lv.tiles.map((t, i) => [t, i]).filter(([t]) => t.state === 'closed');
    if (!open.length) return;
    mpTap(open[Math.floor(Math.random() * open.length)][1]);
    setMsg('> clock ran out. random pick!', C.danger);
  }
}

// Browser tab title: flashes "YOUR TURN" while it's your turn and the tab isn't in front.
let baseTitle = null;
function mpTabTitle(now) {
  if (typeof document === 'undefined' || document.title == null) return;
  if (baseTitle == null) baseTitle = document.title;
  const want = st.mp && st.mp.state && !st.mp.state.winner && st.mode === 'play' && mpMine() && document.hidden
    ? (Math.floor(now / 700) % 2 ? '▶ YOUR TURN' : baseTitle) : baseTitle;
  if (document.title !== want) document.title = want;
}

// Host: remove someone from the room.
function mpKick(id) {
  const m = st.mp;
  if (!m || !amHost() || id === m.me) return;
  const picks = Object.assign({}, m.meta.picks || {});
  delete picks[id];
  Net.update(`rooms/${m.code}/meta`, { picks, ['kicked/' + id]: true });
  Sound.deny();
}

// Tapping a node on your turn sends the move; it resolves when it comes back.
function mpTap(i) {
  const m = st.mp;
  if (!m || !m.state || m.state.winner || st.busy || m.waiting) return;
  if (!mpPlaying()) { setMsg('> you are spectating.', C.mid); return; }
  if (!mpMine()) { Sound.deny(); setMsg('> not your turn.', C.mid); return; }
  const t = st.lv.tiles[i];
  if (!t || t.state !== 'closed') return;
  m.waiting = true;
  t.probing = true;
  Net.push(`rooms/${m.code}/moves/${m.round}`, { by: m.me, tile: i, layer: m.state.layer });
}

function mpKnockOut(S, id, why) {
  S.alive[id] = false;
  S.out.push(id);
  const mine = id === st.mp.me;
  setMsg(mine ? `> you are out. ${why}` : `> ${mpName(id).toLowerCase()} is out. ${why}`, mine ? C.danger : C.mid);
  const alive = S.order.filter(p => S.alive[p]);
  if (alive.length <= 1) { S.winner = alive[0] || id; return true; }
  return false;
}

async function mpApply(mv, n) {
  const m = st.mp;
  if (!m || !m.state || !mv || n !== m.round) return;
  const S = m.state;
  if (S.winner || mv.by !== S.turn || mv.layer !== S.layer) return;   // ignore anything out of turn
  m.applied = (m.applied || 0) + 1;
  if (mv.kind === 'drop') {
    const over = mpKnockOut(S, mv.by, 'disconnected.');
    if (over) return mpOver();
    S.turn = nextAlive(S, mv.by);
    await wait(600);
    mpTurnMsg();
    return;
  }
  const lv = st.lv, t = lv && lv.tiles[mv.tile];
  if (!t || t.state !== 'closed') return;
  const mine = mv.by === m.me, who = mpName(mv.by).toLowerCase();
  st.busy = true;
  t.probing = true;
  Sound.probe();
  setMsg(mine ? '> probing...' : `> ${who} probes a node...`, C.mid);
  await wait(mine ? 300 : 650);   // a bit longer for others, so you can see what they picked
  t.probing = false;
  m.waiting = false;
  if (t.safe) {
    const perfect = lv.misses === 0;
    if (perfect) S.hp[mv.by] = Math.min(S.max, S.hp[mv.by] + 1);
    S.cleared[mv.by]++;
    t.state = 'safe';
    Sound.safe();
    flash(C.accent, 0.12, 0.3);
    setMsg(mine ? (perfect ? '> perfect. layer cleared. +1 int' : '> you cleared the layer.') : `> ${who} cleared the layer.`, mine ? C.accent : C.mid);
    await wait(420);
    const idx = lv.tiles.indexOf(t);
    const lit = buildScene(performance.now(), false, true).filter(c => c.own === 't' + idx);
    await wipeOut(perfect || lv.boss ? 2 : 1, lit);
    S.layer++;
    S.turn = nextAlive(S, mv.by);
    mpEnterLayer();
  } else {
    lv.misses++;
    t.state = 'locked'; t.lockedBy = 'hit'; t.hitAt = performance.now();
    S.hp[mv.by] -= lv.dmg;
    Sound.trap();
    shake(mine ? 9 : 4);
    if (mine) flash(C.danger, 0.18, 0.35);
    setMsg(mine ? '> ICE. your integrity -1.' : `> ${who} hit ICE. -1.`, mine ? C.danger : C.mid);
    await wait(500);
    if (S.hp[mv.by] <= 0) {
      if (mine) Sound.death(true);   // play goes on: dings only, the music keeps going
      if (mpKnockOut(S, mv.by, 'traced.')) return mpOver();
      await wait(700);
    }
    S.turn = nextAlive(S, mv.by);
    st.busy = false;
    mpTurnMsg();
  }
}

async function mpOver() {
  const m = st.mp, S = m.state, won = S.winner === m.me;
  if (won) Sound.victory(); else if (S.alive[m.me] === undefined || !S.alive[m.me]) Sound.win();
  await wait(won ? 400 : 900);
  while (st.transitioning) await wait(50);
  await swapTo(() => {
    scenePalette(null);
    openPanel('RESULT', (T, B, X) => {
      const mm = st.mp;
      if (!mm || !mm.state) return;
      const SS = mm.state, w = SS.winner;
      X({ text: w === mm.me ? 'Y O U   W I N' : `${mpName(w)} WINS`, col: w === mm.me ? C.accent : mpColor(w), bold: true });
      T(`reached layer ${pad2(SS.layer)}`, C.mid);
      T('');
      // Standings: the winner, then the last one knocked out, and so on.
      const ranking = [w, ...SS.out.slice().reverse()];
      ranking.forEach((id, i) => {
        const mem = mpMember(id);
        T(`${i + 1}. ${logoMark(mem.logo)} ${mem.name.padEnd(12)} cleared ${SS.cleared[id] || 0}`.padEnd(34), i === 0 ? C.bright : C.text);
      });
      T('');
      if (amHost()) X({ box: true, text: 'N E X T   G A M E', sub: 'back to the lobby', id: 'mpnext', onTap: mpNextGame, minW: 24 });
      else T('waiting for the host...', C.mid);
      B('[ LEAVE ]', 'mpleave', mpLeave);
    }, won ? '> you win.' : `> ${mpName(S.winner).toLowerCase()} wins.`);
    if (won) fireworkShow(9, 280, 'panel');
  });
}

function mpNextGame() {
  const m = st.mp;
  if (!m || !amHost()) return;
  Net.update(`rooms/${m.code}/meta`, { status: 'lobby' });
}

// Host: knock out a player who has been offline on their turn for 5 seconds.
function mpWatchdog(now) {
  const m = st.mp;
  if (!m || !m.state || m.state.winner || !amHost() || st.busy) return;
  const id = m.state.turn, on = (m.members[id] || {}).online;
  if (on) { delete m.dropWatch[id]; return; }
  if (!m.dropWatch[id]) m.dropWatch[id] = now;
  else if (now - m.dropWatch[id] > 5000 && !m.dropSent) {
    m.dropSent = true;
    Net.push(`rooms/${m.code}/moves/${m.round}`, { kind: 'drop', by: id, layer: m.state.layer });
    setTimeout(() => { if (st.mp === m) m.dropSent = false; }, 2000);
  }
}

// ---- shared cursors
function mpSendCursor(x, y) {
  const m = st.mp;
  if (!m || !m.state || st.mode !== 'play') return;
  const now = performance.now();
  if (now - m.cursorAt < 100) return;   // about 10 updates a second at most
  m.cursorAt = now;
  Net.set(`rooms/${m.code}/cursors/${m.me}`, { x: Math.round(x * 2) / 2, y: Math.round(y * 2) / 2, r: m.round });
}
function mpDrawCursors({ put, bg }) {
  const m = st.mp;
  if (!m || !m.state || st.mode !== 'play') return;
  for (const [id, c] of Object.entries(m.cursors)) {
    if (id === m.me || !c || c.r !== m.round) continue;
    const mem = mpMember(id), col = mpColor(id);
    bg(c.x - 0.5, c.y - 0.5, 1, mpBg(id) || col, mpBg(id) ? 0.9 : 0.35);
    put(c.x, c.y, logoChar(mem.logo), col, 'mp', true);
    put(c.x + 1, c.y + 0.6, mpShort(id).toLowerCase(), col, 'mp');
  }
}

// ---- emotes
function mpSendEmote(e) {
  const m = st.mp;
  if (!m) return;
  const now = performance.now();
  if (now - m.emoteAt < 1200) { Sound.deny(); return; }   // no spamming
  m.emoteAt = now;
  Net.push(`rooms/${m.code}/emotes`, { by: m.me, e });
}
function mpShowEmote(v) {
  if (!v || !EMOTES.includes(v.e)) return;
  const mem = mpMember(v.by), col = mpColor(v.by);
  setMsg(`> ${mem.name.toLowerCase()}: ${v.e}`, col);
  Sound.tick();
  // The emote floats up from the sender's cursor (or the middle of the board).
  const c = st.mp.cursors[v.by];
  const x = c && c.r === st.mp.round && st.mode === 'play' ? pxX(c.x) : pxX(L.wc / 2 + rand(-6, 6));
  const y = c && c.r === st.mp.round && st.mode === 'play' ? pxY(c.y - 1) : pxY(BOARD_Y + L.gh / 2);
  const text = `${logoChar(mem.logo)} ${v.e}`;
  [...text].forEach((ch, i) => parts.push({
    mode: 'float', ch, x: x + (i - text.length / 2) * L.cw, y, col, t: 0, life: 2.2, alpha: 1, rot: 0, scr: 0,
  }));
}
// Tray during multiplayer: emote buttons and your status.
function mpTray(ctx, y) {
  const { put, addHit, bg } = ctx;
  const rows = [EMOTES.slice(0, 5), EMOTES.slice(5)];
  rows.forEach((row, r) => {
    let x = 0;
    for (const e of row) {
      const label = `[${e}]`, id = 'emo_' + e;
      if (st.hoverBtn === id) bg(x, y + r * 2, label.length, C.accent, 0.2);
      put(x, y + r * 2, label, C.bright, 'tray');
      addHit(x, y + r * 2, label.length, 1, { kind: 'btn', id, onTap: () => mpSendEmote(e), noFocus: true });
      x += label.length + 2;
    }
  });
  const m = st.mp;
  const status = !m.state ? '' : m.state.winner ? '' : mpPlaying() ? (mpMine() ? 'your turn' : '') : 'spectating';
  put(0, y + 1, 'emotes', C.dim);
  if (status) put(L.wc - status.length, y + 1, status, mpMine() ? C.accent : C.mid);
  // Turn clock bar
  const left = st.mode === 'play' ? mpClockLeft(performance.now()) : null;
  if (left != null && m.state) {
    const total = mpClock(), w = 20, fill = Math.ceil(w * left / total), low = left <= 5;
    const who = mpMine() ? 'YOUR CLOCK ' : 'clock      ';
    put(0, y + 3, who, mpMine() ? C.accent : C.mid, 'tray', mpMine());
    put(who.length, y + 3, '='.repeat(fill), low ? C.danger : mpMine() ? C.accent : C.mid, 'tray');
    put(who.length + w + 1, y + 3, `${Math.ceil(left)}s`, low ? C.danger : C.text, 'tray');
  }
}

function mpLeave() {
  const m = st.mp;
  if (m) {
    try {
      for (const u of m.unsubs) u();
      if (m.unmoves) m.unmoves();
      Net.update(`rooms/${m.code}/members/${m.me}`, { online: false });
      Net.remove(`rooms/${m.code}/cursors/${m.me}`);
    } catch (e) { /* ignore */ }
  }
  st.mp = null; st.lv = null; st.busy = false;
  swapTo(showTitle);
}
