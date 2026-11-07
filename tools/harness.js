// harness.js: the two ways the tools run the game without a person.
//
//   loadGame(file, { hook })   the game's scripts in a Node vm sandbox (no drawing, a fixed clock). hook: code put just
//                              before `window.__br = {` (it can see every global), e.g. 'window.__check = {...};'.
//                              Returns { window, errors, files }.
//   testPage(file, script, { key })  one self-contained HTML page: every local script inlined in order, animation frames
//                              on a timer (headless Chrome doesn't run them), a save slot of its own, then `script`.
//   runPage(html, { hash, ms, size })  runs a page in headless Chrome and returns what it put in <pre id="out">
//                              (JSON), or { error }. The page must write that pre when it's done.
//   pageKit                    page-side helpers for a test script: sleep, settle, say, check, done (see below).
//
// Used by tools/check.js, tools/playtest.js and tools/test.js (tools/tests/*.js). Needs Chrome for pages
// (Windows default path, or set CHROME=...).
'use strict';
if (require.main === module) { console.log('usage: require("./harness.js") from a tool (loadGame, testPage, runPage)'); process.exit(0); }
const fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm'), { execFile } = require('child_process');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const GAME = path.join(__dirname, '..', 'dist', 'index.html');

// ---------- the game's local scripts, in load order ----------
function gameScripts(file = GAME) {
  const html = fs.readFileSync(file, 'utf8'), base = path.dirname(file), out = [];
  for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1] || '', src = (attrs.match(/src="([^"]+)"/) || [])[1];
    if (src && /^https?:/.test(src)) continue;   // firebase etc.
    if (src) out.push({ name: src, code: fs.readFileSync(path.join(base, src.split('?')[0]), 'utf8') });
    else out.push({ name: 'inline', code: m[2] });
  }
  return out;
}

// ---------- Node: the game in a vm sandbox ----------
function loadGame(file = GAME, opts = {}) {
  const scripts = gameScripts(file);
  if (opts.hook) {
    const hi = scripts.findIndex(s => s.code.includes('window.__br = {'));
    if (hi < 0) throw new Error('no window.__br in the game');
    scripts[hi].code = scripts[hi].code.replace('window.__br = {', opts.hook + '\nwindow.__br = {');
  }
  const noop = () => {}, errors = [];
  const ctx2d = new Proxy({}, { get: (t, k) => k === 'measureText' ? () => ({ width: 60 }) : (k in t ? t[k] : noop), set: (t, k, v) => (t[k] = v, true) });
  const canvas = { getContext: () => ctx2d, addEventListener: noop, style: {}, width: 0, height: 0 };
  // a fixed clock, so anything that shows the time (FOURTH WALL) comes out the same every run
  const FIXED = new Date('2026-01-01T12:00:00Z').getTime();
  class FixedDate extends Date { constructor(...a) { super(...(a.length ? a : [FIXED])); } static now() { return FIXED; } }
  const sandbox = {
    performance: { now: () => 0 }, setTimeout: noop, setInterval: noop, clearTimeout: noop, clearInterval: noop,
    requestAnimationFrame: noop, URLSearchParams, Math, JSON, Date: FixedDate, Object, Array, Set, Map, WeakMap, WeakSet, Promise, Number, String, RegExp, Proxy, Symbol, Error,
    console: { log: noop, warn: noop, error: (...a) => errors.push(a.join(' ')) },
    localStorage: { getItem: () => null, setItem: noop, removeItem: noop }, location: { search: '', href: 'file:///game/index.html', protocol: 'file:' },
    navigator: {}, history: { replaceState: noop },
    document: { getElementById: () => canvas, addEventListener: noop, createElement: () => ({ style: {}, setAttribute: noop, addEventListener: noop }),
      documentElement: { style: {} }, body: { style: {}, appendChild: noop }, fonts: null, querySelector: () => null },
    getComputedStyle: () => ({}),   // (engine/screen.js reads the safe-area padding)
    fetch: () => new Promise(() => {}),   // offline: the intro asks the leaderboard (it never answers here)
    window: { innerWidth: 390, innerHeight: 844, devicePixelRatio: 1, addEventListener: noop, matchMedia: () => ({ matches: false }) },
  };
  sandbox.window.window = sandbox.window;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  // the game sets window.X; in the browser window IS the global object, so mirror that
  for (const s of scripts) {
    try { vm.runInContext(s.code.replace(/\bwindow\./g, 'globalThis.window.'), sandbox, { filename: s.name }); }
    catch (e) { throw new Error(`loading ${s.name}: ${e.stack || e.message}`); }
    Object.assign(sandbox, sandbox.window);
  }
  return { window: sandbox.window, errors, files: scripts.map(s => s.name) };
}

// ---------- Chrome: a test page ----------
function testPage(file = GAME, script = '', opts = {}) {
  const base = path.dirname(file);
  let html = fs.readFileSync(file, 'utf8');
  // inline every local script ('</script>' inside one, e.g. in a comment, would end the tag early)
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => /^https?:/.test(src) ? m :
    '<script>' + fs.readFileSync(path.join(base, src.split('?')[0]), 'utf8').replace(/<\/script>/g, '<\\/script>') + '</script>');
  html = html.replace(/<head>/, '<head><script>window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16); window.__errs = [];' +
    ' window.addEventListener("error", e => window.__errs.push(e.message)); window.addEventListener("unhandledrejection", e => window.__errs.push("rejection: " + ((e.reason && e.reason.message) || e.reason)));</script>');
  html = html.replace(/beta_runner\.v\d+\.save/g, 'beta_runner.' + (opts.key || 'test') + '.save');
  return html.replace('</body>', '<script>' + script.replace(/<\/script>/g, '<\\/script>') + '</script></body>');
}

function runPage(html, opts = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'neon-page-')), page = path.join(tmp, 'page.html');
  fs.writeFileSync(page, html);
  return new Promise(res => {
    execFile(CHROME, ['--headless=new', '--disable-gpu', `--window-size=${opts.size || '400,820'}`, `--virtual-time-budget=${opts.ms || 120000}`,
      '--allow-file-access-from-files', `--user-data-dir=${path.join(tmp, 'profile')}`, '--dump-dom',
      'file:///' + page.replace(/\\/g, '/') + (opts.query ? '?' + opts.query : '') + (opts.hash ?'#' + opts.hash : '')],
      { maxBuffer: 1 << 28, timeout: opts.timeout || 10 * 60 * 1000 }, (err, stdout) => {
        try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* chrome may still hold it */ }
        const m = String(stdout || '').match(/<pre id="out">([\s\S]*?)<\/pre>/);
        if (!m) return res({ error: 'no report from chrome' + (err ? ': ' + err.message : '') });
        const txt = m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
        try { res(JSON.parse(txt)); } catch (e) { res({ error: 'bad report: ' + e.message }); }
      });
  });
}

// Page-side helpers, put at the top of a test's function (not at the top level: the game has its own st, B...). In the body:
//   await settle()            wait out wipes, intros, busy
//   say(text)                 a line in the report
//   check(cond, what)         a pass / fail line
//   done()                    (called for you after the body) writes the report
//   B = window.__br, st = B.state
const pageKit = `
const out = { log: [], fails: [], passes: 0 };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const B = window.__br, st = B.state;
const say = s => out.log.push(String(s));
const check = (cond, what) => { if (cond) out.passes++; else out.fails.push(String(what)); };
const settle = async (what = '') => { for (let i = 0; i < 600; i++) { if (st.intro) st.intro.skip = true; if (st.bossIntro) st.bossIntro.skip = true;
  if (!st.busy && !st.transitioning && !st.wipe && !st.intro && !st.bossIntro) return; await sleep(30); } throw new Error('stuck: ' + what + ' mode=' + st.mode); };
const done = () => { out.errors = (window.__errs || []).slice(0, 10); const p = document.createElement('pre'); p.id = 'out'; p.textContent = JSON.stringify(out); document.body.appendChild(p); };
`;
const wrapTest = body => '(async () => {' + pageKit + 'await sleep(500); try { localStorage.clear(); st.boot = null;\n' + body +
  '\n} catch (e) { out.fails.push("threw: " + (e.stack || e.message)); } done(); })();';

module.exports = { GAME, gameScripts, loadGame, testPage, runPage, pageKit, wrapTest };
