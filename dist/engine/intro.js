// NeoN+1 engine/intro.js: the intro, before the title. Four steps:
//   1. LOGIN: a prompt and a [ LOGIN ] button. Nothing moves (or makes a sound: browsers wait for a tap) until you tap it.
//   2. The login screen: your name and password type in (key clicks), a modem dials, the bar fills, the > lines
//      flicker through jargon and settle (a blip, then a beep), the world map draws in with spots blinking, and the
//      readout ends with your own records (best score, today's net activity, REP, status).
//   3. The title card (the NeoN art), with the music starting. A few seconds, or a tap.
//   4. A first run: NEWB or LEET, under your logo and name (tap them to shuffle). NEWB starts the training, LEET the title.
// Screens change with the game's wipe. A tap skips ahead.
'use strict';
NEON_FILES.push(['engine/intro.js', 'v13.82']);

// For now (the user, 2026-10-26, while we work on it): every launch plays all of it, NEWB / LEET too.
// Later: NEWB / LEET only the first time (save.bootSeen).
const INTRO_ALWAYS = true;

// The music from the title card on (the NEWB / LEET pick too): WATCHPOINT's ON CAMERA, at level 2 (the user's pick).
const INTRO_MUSIC = { song: 'oncamera', level: 2 };
const INTRO_MAP = ART_MAP;   // data/art/worldmap.js (the neon editor's ART tab)
// What the > lines flicker through before they settle.
const INTRO_JARGON = [
  'routing via proxy 3/7', 'spoofing mac 4e:7a:..:c1', 'opening socket :1337', 'bouncing off relay.kr', 'masking ip',
  'warming up ICE breaker', 'loading tells', 'syncing clock', 'checking for traces', 'decrypting the net', 'cache warm',
  'dialing out', 'handshake 2/3', 'scrubbing logs', 'forging certs', 'tunneling :443', 'pinging the void', 'rerouting',
];
// The title card: the NeoN art (the user's, from asXii: NeoN_1_screens_v04, "NeoN_fullscreen"), at INTRO_CARD_AT.
const INTRO_CARD = [
  "    ____          ____",
  "   /\\   \\__      /\\   \\",
  "  /;;\\    _\\__  /;;\\   \\",
  " /;;;;\\   \\/\\_\\/_;;;\\   \\",
  " \\;;;;;\\   \\/ /\\_\\__;\\   \\",
  "  \\;;;;;\\   \\/;/ /\\_\\_\\   \\",
  "   \\;;;;;\\   \\/ /;/ /\\__   \\",
  "    \\;;;;;\\___\\/;/ /;/ /\\___\\",
  "     \\;;;;/   /\\/_/;/ /;/   /",
  "      \\;;/   /    \\/_/;/   /",
  "    __/\\/___/\\  __/\\ \\/___/",
  "   /\\ \\:\\_____\\/\\ \\.\\_____\\",
  "  /::\\_\\/ ____/\\.\\_\\/ __  /\\",
  " /:::/   /__\\/ /./   /./   /",
  " \\::/   ______/./   /./   /",
  "  \\/_  /____\\ \\/_  /\\/ __/",
  "  /\\/_______/  \\/_____/",
  " /;;\\    _\\__  /;;\\   \\",
  "/;;;;\\   \\/\\_\\/_;;;\\   \\",
  "\\;;;;;\\   \\/ /\\_\\__;\\   \\",
  " \\;;;;;\\   \\/;/ /\\_\\_\\   \\",
  "  \\;;;;;\\   \\/ /;/ /\\__   \\",
  "   \\;;;;;\\___\\/;/ /;/ /\\___\\",
  "    \\;;;;/   /\\/_/;/ /;/   /",
  "     \\;;/   /    \\/_/;/   /",
  "      \\/___/        \\/___/",
  "",
  "            NeoN+1",
  "     ____________________",
  "network intrusion // prototype",
];
const INTRO_CARD_AT = [2, 4];
// Timing (ms). The login screen: from the tap; the card: from when it's in.
const INTRO_T = {
  name: 300, key: 55, pass: 150,      // typing: when the name starts, per key, the pause before the password
  bar: 1500, top: 1700, gapTop: 320,  // the bar shows; the top two lines
  map: 2400, mapRow: 55,              // the map's box, then a row at a time
  lines: 3300, line: 230,             // the readout under the map: one line every `line`
  flick: 45, settle: 300,             // a line flickers (a new bit of jargon every `flick`) for `settle`, then settles
  hold: 1000,                         // after the last line, before the card
  card: 5200,                         // the card stays up this long (a tap moves on)
};

function startIntro() {
  const p = profile(), r = rngFor(String(p.name), 'intro');
  st.boot = { stage: 'login', t0: performance.now(), first: INTRO_ALWAYS || !save.bootSeen, r,
    port: 1024 + (hashStr(String(p.name)) >>> 0) % 60000, hops: 2 + Math.floor(r() * 6), where: introSpot(r), said: {} };
  introNetToday(st.boot);
}
function endIntro() {
  if (!st.boot) return;
  st.boot = null;
  if (!save.bootSeen) { save.bootSeen = true; persist(); }
}

// Your spot on the map: a blank cell inside the land (walls on both sides), the same for a name.
function introSpot(r) {
  const spots = [];
  INTRO_MAP.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== ' ') return;
    const left = [...row].slice(Math.max(0, x - 4), x).some(c => c !== ' '), right = [...row].slice(x + 1, x + 5).some(c => c !== ' ');
    const up = y > 0 && [...(INTRO_MAP[y - 1] || '')][x] && [...INTRO_MAP[y - 1]][x] !== ' ', down = [...(INTRO_MAP[y + 1] || '')][x] && [...INTRO_MAP[y + 1]][x] !== ' ';
    if (left && right && (up || down)) spots.push([x, y]);
  }));
  return spots.length ? pickR(spots, r) : [10, 4];
}
// Today's net activity: how many runs are on today's leaderboard (if it answers in time; a made-up number otherwise).
function introNetToday(b) {
  const day = new Date().toISOString().slice(0, 10);
  b.net = 3 + (hashStr(day) >>> 0) % 40;
  const gl = typeof lbClient === 'function' && lbClient();
  if (!gl || EDITOR || (navigator.webdriver && !window.LB_TEST)) return;
  gl.scores(lbBoard('day'), { limit: 100 }).then(d => { const n = d && d.entries ? d.entries.length : 0; if (n) b.net = n >= 100 ? '100+' : n; }).catch(() => {});
}
// The lines: the two at the top, then the readout under the map (your own records at the end).
function introLines(b) {
  const p = profile(), runs = save.runs || 0;
  const status = save.leet ? 'leet' : save.tutorialDone || runs > 0 ? 'runner' : 'newb';
  return {
    top: ['searching open ports', `port ${b.port}`],
    readout: [`trace: ${b.hops} hops // located`, 'locking port', 'binding host', 'sniffing corp', 'line secure',
      'planting decoys', 'INT checks', 'critical sys warnings disabled', 'accessing records',
      save.best ? `best score: ${save.best}` : 'no previous scores', `net activity today: ${b.net}`,
      `runs: ${String(runs).padStart(3, '0')}`, `reputation: ${String(save.rep || 0).padStart(2, '0')}`, `status: ${status}`],
    mine: 9,   // from here on the readout is about you (drawn brighter)
    name: p.name,
  };
}

// ---- moving between the steps (the game's wipe; the intro is what the wipe sees while st.boot is up)
async function introGo(stage) {
  const b = st.boot;
  if (!b || b.going) return;
  b.going = true;
  await wipeOut(0);
  if (st.boot !== b) return;
  b.stage = stage; b.t0 = performance.now(); b.going = false; b.said = {};
  if (stage === 'card') b.music = true;   // the music comes in with the card
  wipeIn();
}
// After the card: a first run picks NEWB or LEET; otherwise the title.
function introAfterCard() { const b = st.boot; if (b.first) introGo('pick'); else introDone(); }
// To the title: wipe out of the intro, and the title (already underneath) comes in.
// Leaving the intro: the music powers up and lands on a chord (like beating a boss), then the next track
// eases in (the user: the cut from ON CAMERA to the title was rough).
async function introOut(b) {
  const s = b.music && typeof Sound.bossWin === 'function' ? Sound.bossWin() : 0;
  if (s > 0) await wait(Math.max(0, s * 1000 - 120));
}
async function introDone() {
  const b = st.boot;
  if (!b || b.going) return;
  b.going = true;
  await introOut(b);
  await wipeOut(1);
  endIntro();
  wipeIn();
}
function introLeet() { if (st.boot && st.boot.going) return; Sound.ui(); save.leet = true; persist(); introDone(); }
// NEWB: the training (its start wipes this screen out, then POPS says hello over the lines).
async function introNewb() {
  const b = st.boot;
  if (!b || b.going) return;
  b.going = true;
  Sound.ui();
  await introOut(b);
  startTutorial();   // (startRun captures this screen for its wipe right away)
  endIntro();
}
// A tap (or Enter / Space) with nothing else to do: start, skip ahead, or move on.
function introTap(h) {
  const b = st.boot;
  if (!b || b.going) return;
  if (h && h.kind === 'btn' && h.onTap) return h.onTap();
  const t = performance.now() - b.t0;
  if (b.stage === 'login') { b.stage = 'net'; b.t0 = performance.now(); b.said = {}; Sound.modem(); return; }
  if (b.stage === 'net') { if (t < introNetEnd(b)) { b.t0 = performance.now() - introNetEnd(b); b.skipped = true; } else introGo('card'); return; }
  if (b.stage === 'card') introAfterCard();
}
function introKey(k) {
  const b = st.boot;
  if (!b) return;
  if (b.stage === 'pick') { if (k === 'n') introNewb(); if (k === 'l') introLeet(); return; }
  if (k === 'enter' || k === ' ') introTap(null);
}
const introNetEnd = b => { const L0 = introLines(b); return INTRO_T.lines + (L0.readout.length - 1) * INTRO_T.line + INTRO_T.settle; };

// ---- drawing (engine/scene.js draws this in place of everything else while st.boot is up)
function buildIntro(ctx, now) {
  const b = st.boot, t = now - b.t0;
  if (b.stage === 'login') return introLogin(ctx, now);
  if (b.stage === 'net') return introNet(ctx, now, t);
  if (b.stage === 'card') return introCard(ctx, now, t);
  if (b.stage === 'pick') return introPick(ctx, now);
}
// a sound once per key (k) on this screen
const introOnce = (b, k, fn) => { if (!b.said[k] && !b.skipped) { b.said[k] = 1; fn(); } };

function introLogin(ctx, now) {
  const { put } = ctx, blink = Math.floor(now / 420) % 2;
  put(1, 1, blink ? '>_' : '>', C.accent);
  put(1, 2, 'neon+1 terminal // ' + VERSION, C.dim);
  const y = Math.floor(L.hc / 2) - 2;
  drawBox(ctx, y, { text: 'L O G I N', sub: '- connect -', id: 'login', onTap: () => introTap(null), minW: 24 });
}

function introNet(ctx, now, t) {
  const { put } = ctx, b = st.boot, T = INTRO_T, X = 1, lines = introLines(b);
  const blink = Math.floor(now / 380) % 2;
  // 1. your name and password type in, a click a key
  const typed = (s, from, k) => {
    const n = clamp(Math.floor((t - from) / T.key), 0, s.length);
    for (let i = 1; i <= n; i++) introOnce(b, k + i, Sound.key);
    return s.slice(0, n);
  };
  const name = '>' + lines.name, pass = '>password:' + '*'.repeat(12);
  const passAt = T.name + name.length * T.key + T.pass;
  put(X, 1, typed(name, T.name, 'n'), C.text);
  if (t >= passAt) put(X, 2, typed(pass, passAt, 'p'), C.text);
  // a line: flickers through jargon (a blip each change), then settles (a beep)
  const line = (y, text, at, key, col = C.text) => {
    if (t < at) return;
    if (t < at + T.settle && !b.skipped) {
      const f = Math.floor((t - at) / T.flick);
      introOnce(b, key + 'f' + f, Sound.blip);
      put(X, y, '>' + INTRO_JARGON[(hashStr(key) + f * 7) % INTRO_JARGON.length], C.dim);
      return;
    }
    introOnce(b, key + 'ok', Sound.lineOk);
    put(X, y, '>' + text, col);
  };
  // 2. the bar: it fills as the readout comes in
  const end = introNetEnd(b);
  if (t >= T.bar) {
    const f = clamp((t - T.bar) / (end - T.bar), 0, 1), n = 31, k = Math.round(f * n);
    put(X, 4, '[' + '@'.repeat(k) + '.'.repeat(n - k) + ']', f >= 1 ? C.accent : C.money);
    const pct = Math.round(f * 100) + '%';
    put(X + 33 - pct.length, 5, pct, f >= 1 ? C.accent : C.mid);
  }
  lines.top.forEach((s, i) => line(6 + i, s, T.top + i * T.gapTop, 't' + i));
  // 3. the map in its box, drawing in a row at a time; its marks blink, and your spot
  if (t >= T.map) {
    const edge = '+' + '-'.repeat(31) + '+', my = 9;
    put(X, my - 1, edge, C.dim);
    const rows = Math.min(INTRO_MAP.length, Math.floor((t - T.map) / T.mapRow) + 1);
    INTRO_MAP.slice(0, rows).forEach((row, k) => put(X, my + k, row, C.mid));
    if (rows >= INTRO_MAP.length) {
      put(X, my + INTRO_MAP.length, edge, C.dim);
      INTRO_MAP.forEach((row, y) => [...row].forEach((ch, x) => {
        if (!'0ox[]'.includes(ch) || ch === ' ') return;
        const on = Math.floor((now + (x * 131 + y * 71)) / 300) % 3;   // each mark blinks on its own beat
        put(X + x, my + y, ch, on === 0 ? C.bright : on === 1 ? C.accent : C.mid, 'hud', on === 0);
      }));
      const [wx, wy] = b.where;
      put(X + wx, my + wy, blink ? '@' : 'o', C.danger, 'hud', true);
    }
  }
  // 4. the readout: the trace, the jargon, then you
  const y0 = 9 + INTRO_MAP.length + 1;
  lines.readout.forEach((s, i) => line(y0 + i, s, T.lines + i * T.line, 'r' + i, i === 0 ? C.accent : i >= lines.mine ? C.bright : C.text));
  if (t >= end + T.hold && !b.going) introGo('card');
}

function introCard(ctx, now, t) {
  const { put } = ctx, [x0, y0] = INTRO_CARD_AT;
  INTRO_CARD.forEach((row, y) => {
    const s = row.trim();
    if (s === 'NeoN+1') return put(x0 + row.indexOf(s), y0 + y, s, C.bright, 'hud', true);
    if (/^[a-z/ ]+$/.test(s)) return put(x0 + row.indexOf(s), y0 + y, s, C.mid);   // the copy line
    [...row].forEach((ch, x) => { if (ch !== ' ') put(x0 + x, y0 + y, ch, ';:.'.includes(ch) ? C.dim : '_'.includes(ch) && /^_+$/.test(s) ? C.dim : C.accent); });
  });
  if (t > 1200 && Math.floor(now / 600) % 2) ctx.putC(L.hc - 2, 'tap to continue', C.dim);
  if (t >= INTRO_T.card && !st.boot.going) introAfterCard();
}

function introPick(ctx, now) {
  const { put, putC, bg, addHit } = ctx, p = profile();
  putC(2, `welcome, ${p.name.toLowerCase()}.`, C.text);
  // your logo and name: tap to shuffle them
  const block = logoBlock(p.logo, p.name, styleOf(p.style)), by = 4;
  const bw = block[0].text.length, bx = Math.floor((L.wc - bw) / 2);
  block.forEach((ln, k) => { bg(bx, by + k, bw, ln.bgCol, 1); put(bx, by + k, ln.text, ln.col, 'hud', true); });
  addHit(bx, by, bw, block.length, { kind: 'btn', id: 'shuffle', onTap: () => { randomizeProfile(profile()); Sound.tick(); } });
  putC(by + block.length + 1, st.hoverBtn === 'shuffle' ? '- tap to shuffle -' : 'tap to shuffle', st.hoverBtn === 'shuffle' ? C.accent : C.dim);
  // NEWB or LEET
  const y1 = by + block.length + 4;
  drawBox(ctx, y1, { text: 'N E W B', id: 'newb', onTap: introNewb, minW: 22 });
  putC(y1 + 3, 'if you have to ask, start here.', C.mid);
  drawBox(ctx, y1 + 6, { text: 'L E E T', id: 'leet', onTap: introLeet, minW: 22 });
  putC(y1 + 9, 'you know the drill. jack in.', C.mid);
}
