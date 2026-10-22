// NeoN+1 engine/intro.js: the boot / login intro before the title.
'use strict';
NEON_FILES.push(['engine/intro.js', 'v13.07']);

// A terminal login: a prompt, your runner name typing in, a boot log scrolling (the game's real
// files, plus some fake jargon) with a progress bar, a world map with your spot blinking, then
// "handshake complete" and your logo, and the title. The first time ever it plays in full
// (~6.5s); after that a short version (~1.5s). A tap or any key skips it.

// The world map: our own small drawing (fake-ish continents), in the line style of the old
// ASCII world maps. WHERE: spots on land your location can blink at.
const INTRO_MAP = [
  " ,-''-._       ,-.  ,-----.___    ",
  "(       `.   _/  `-'          `-. ",
  " `.  ,.  ) _(  ,-.   ,--.     ,-' ",
  "   \\/  \\/ (   (   `-'   `.  ,'    ",
  "    \\     )  ,'    ,-.   ( (      ",
  "     `.  /  (     (   )   `.`.    ",
  "       )(    `.    `-'     ,-'    ",
  "      ( (      )        .-'  .-.  ",
  "       `'      `'           (__)  ",
];
const INTRO_WHERE = [[4, 1], [8, 3], [6, 5], [14, 2], [16, 5], [24, 1], [28, 2], [25, 4], [30, 7]];
const INTRO_JARGON = [
  'routing via proxy 3/7', 'spoofing mac 4e:7a:..:c1', 'opening socket :1337', 'bouncing off relay.kr',
  'masking ip', 'warming up ICE breaker', 'loading tells', 'syncing clock', 'checking for traces... none',
  'decrypting the net', 'cache warm', 'dialing out...',
];
// Full and short timelines (ms from the start): when each step begins.
const INTRO_FULL = { login: 450, pass: 1150, log: 1550, map: 3400, hand: 5000, end: 6500 };
const INTRO_SHORT = { login: 150, pass: 99999, log: 450, map: 99999, hand: 850, end: 1500 };

// Your fake IP and spot on the map: the same every time for a profile name.
function introIp(name) { const h = hashStr(String(name)) >>> 0; return `10.${h % 256}.${(h >>> 8) % 256}.${(h >>> 16) % 256}`; }

function startIntro() {
  const full = !save.bootSeen;
  const p = profile(), files = (window.NEON_FILES || []).map(([f, v]) => ({ f, ok: v === VERSION }));
  const r = rngFor(String(p.name), 'intro');
  // The boot log: every file, with a fake line now and then.
  const log = [];
  files.forEach((x, i) => {
    log.push({ text: `${x.f.replace(/\.js$/, '')} `.padEnd(26, '.') + (x.ok ? ' ok' : ' FAIL'), col: x.ok ? C.dim : C.danger });
    if (i % 9 === 4) log.push({ text: '> ' + pickR(INTRO_JARGON, r), col: C.mid });
  });
  log.push({ text: `> ip ${introIp(p.name)} (masked)`, col: C.accent });
  st.boot = { t0: performance.now(), full, T: full ? INTRO_FULL : INTRO_SHORT, log, name: p.name, where: pickR(INTRO_WHERE, r), hops: 2 + Math.floor(r() * 6) };
}
function endIntro() {
  if (!st.boot) return;
  st.boot = null;
  if (!save.bootSeen) { save.bootSeen = true; persist(); }
}

// Drawn in place of everything else while st.boot is set (engine/scene.js).
function buildIntro(ctx, now) {
  const { put, putC, bg } = ctx, b = st.boot, T = b.T, t = now - b.t0;
  if (t >= T.end) { endIntro(); return; }
  const blink = Math.floor(now / 380) % 2;
  const typed = (s, from, ms = 34) => s.slice(0, Math.max(0, Math.floor((t - from) / ms)));
  let y = 1;
  // 1. the prompt, and the login
  if (t < T.login) { put(0, y, blink ? '>_' : '>', C.accent); return; }
  const login = `login: ${b.name}`;
  put(0, y, typed(login, T.login, b.full ? 34 : 14), C.text);
  if (t >= T.pass) put(0, y + 1, typed('password: ********', T.pass, 30), C.text);
  // 2. the boot log, scrolling, and the bar
  // the log and then the map share one area (the map takes over once the log is done)
  const logTop = y + 3, logRows = Math.max(INTRO_MAP.length + 2, Math.min(12, L.hc - 22));
  const showMap = b.full && t >= T.map;
  const bar = (f, yy) => {
    const n = 20, k = Math.round(f * n);
    put(0, yy, `[${'*'.repeat(k)}${'-'.repeat(n - k)}] ${String(Math.round(f * 100)).padStart(3)}%`, f >= 1 ? C.accent : C.money);
  };
  if (t >= T.log) {
    const span = Math.max(1, T.hand - T.log - (b.full ? 1500 : 100)), f = Math.min(1, (t - T.log) / span);
    const shown = Math.round(f * b.log.length);
    if (b.full && !showMap) b.log.slice(Math.max(0, shown - logRows), shown).forEach((ln, k) => put(0, logTop + k, ln.text.slice(0, L.wc), ln.col));
    bar(f, b.full ? logTop + logRows + 1 : y + 2);
  }
  // 3. the map, your spot blinking
  const mapTop = logTop;
  if (showMap) {
    const x0 = Math.floor((L.wc - INTRO_MAP[0].length) / 2), [wx, wy] = b.where;
    const rows = Math.min(INTRO_MAP.length, Math.floor((t - T.map) / 60) + 1);   // it draws in row by row
    INTRO_MAP.slice(0, rows).forEach((l, k) => put(x0, mapTop + k, l, C.mid));
    if (rows >= INTRO_MAP.length) {
      put(x0 + wx, mapTop + wy, blink ? '@' : 'o', C.danger, 'hud', true);
      put(0, mapTop + INTRO_MAP.length, typed(`> trace: ${b.hops} hops // located.`, T.map + 700, 22), C.accent);
    }
  }
  // 4. handshake, and you
  if (t >= T.hand) {
    const hy = b.full ? logTop + logRows + 3 : y + 4;
    put(0, hy, typed('> handshake complete.', T.hand, b.full ? 22 : 10), C.accent, 'hud', true);
    if (t >= T.hand + (b.full ? 450 : 150)) {
      const p = profile(), lines = logoBlock(p.logo, p.name, styleOf(p.style));
      lines.forEach((ln, k) => { const x = Math.floor((L.wc - ln.text.length) / 2); bg(x, hy + 2 + k, ln.text.length, ln.bgCol, 1); put(x, hy + 2 + k, ln.text, ln.col, 'hud', true); });
      putC(hy + 3 + lines.length, `welcome${b.full ? "" : " back"}, ${p.name.toLowerCase()}.`, C.text);   // (first time: just "welcome")
    }
  }
}
