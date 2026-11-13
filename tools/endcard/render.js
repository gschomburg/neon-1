// tools/endcard/render.js: bundles the end card's art and renders the card (endcard.html) to a 4K 60fps MP4, a frame
// at a time in headless Chrome (exact frames: no screen recording), piped to ffmpeg.
//   node tools/endcard/render.js art [art.asxii.json]           write endcard_art.js (open endcard.html to watch it live)
//   node tools/endcard/render.js render [out.mp4] [--art f] [--frames n] [--still t]
//        out.mp4 defaults to ../video/trailer/endcard.mp4; --still t writes one PNG at t seconds instead.
// Needs: Chrome (CHROME env to override), ffmpeg on PATH, the art (default asxii_art/neon_1_4k_v03.asxii.json).
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args = process.argv.slice(2), cmd = args[0];
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const USAGE = 'usage: node tools/endcard/render.js art [art.asxii.json] | render [out.mp4] [--art f] [--frames n] [--still seconds]';
if (!cmd || cmd === '--help' || !['art', 'render'].includes(cmd)) { console.log(USAGE); process.exit(cmd && cmd !== '--help' ? 1 : 0); }

// ---------- the art: the asXii file's visible layers -> endcard_art.js ----------
function bundleArt(file) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const layers = doc.layers.filter(l => l.visible).map(l => ({ name: l.name, x: l.x, y: l.y, rows: l.rows }));
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const js = `// Made by tools/endcard/render.js from ${rel}. Edit that (in asXii), not this.\n` +
    `window.ENDCARD_ART = ${JSON.stringify({ name: doc.name, width: doc.width, height: doc.height, layers }, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, 'endcard_art.js'), js);
  console.log(`endcard_art.js: ${layers.map(l => l.name).join(', ')} (${doc.width} x ${doc.height})`);
}
const artFile = path.resolve(cmd === 'art' && args[1] && !args[1].startsWith('--') ? args[1] : opt('--art', path.join(ROOT, 'asxii_art', 'neon_1_4k_v03.asxii.json')));
bundleArt(artFile);
if (cmd === 'art') process.exit(0);

// ---------- Chrome, over its debugging protocol (as video/trailer/render_music.js) ----------
async function withPage(fn) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'neon-endcard-'));
  const url = 'file:///' + path.join(__dirname, 'endcard.html').split(path.sep).join('/') + '?render';
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', '--allow-file-access-from-files',
    '--window-size=1280,720', '--hide-scrollbars', `--user-data-dir=${path.join(tmp, 'profile')}`, url]);
  try {
    const port = await new Promise((res, rej) => {
      let err = '';
      chrome.stderr.on('data', d => { err += d; const m = /DevTools listening on ws:\/\/[^:]+:(\d+)\//.exec(err); if (m) res(m[1]); });
      chrome.on('exit', c => rej(new Error('chrome exited ' + c + '\n' + err)));
    });
    let target = null;
    for (let i = 0; i < 50 && !target; i++) {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find(t => t.type === 'page' && t.url.startsWith('file:'));
      if (!target) await new Promise(r => setTimeout(r, 100));
    }
    if (!target) throw new Error('no page in chrome');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const waiting = new Map();
    ws.onmessage = e => { const m = JSON.parse(e.data); if (waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } };
    const call = (method, params) => new Promise(r => { waiting.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
    const evaluate = async expr => {
      const r = await call('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 800));
      return r.result.result.value;
    };
    for (let i = 0; i < 150; i++) {   // the page's scripts and the font
      if (await evaluate('!!(window.endcard && window.endcard.ready)')) break;
      if (i === 149) throw new Error('the page never got ready');
      await new Promise(r => setTimeout(r, 100));
    }
    const out = await fn(evaluate);
    ws.close();
    return out;
  } finally {
    chrome.kill();
    setTimeout(() => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* chrome may still hold it */ } }, 1500);
  }
}

// ---------- render ----------
(async () => {
  const still = opt('--still', null);
  const out = path.resolve(args[1] && !args[1].startsWith('--') ? args[1] : path.join(ROOT, '..', 'video', 'trailer', still != null ? 'endcard_still.png' : 'endcard.mp4'));
  await withPage(async evaluate => {
    const fps = await evaluate('endcard.FPS');
    if (still != null) {   // one frame (it runs the card from 0 up to it)
      const i = Math.round(+still * fps);
      fs.writeFileSync(out, Buffer.from(await evaluate(`endcard.frame(${i})`), 'base64'));
      console.log(`wrote ${out}  (${still}s)`, JSON.stringify(await evaluate('endcard.stats()')));
      return;
    }
    const n = +opt('--frames', await evaluate('endcard.frames()'));
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('exit', c => c ? rej(new Error('ffmpeg exited ' + c)) : res()));
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const png = Buffer.from(await evaluate(`endcard.frame(${i})`), 'base64');
      if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 60 === 0) process.stdout.write(`\rframe ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await done;
    console.log(`\rwrote ${out}  ${n} frames at ${fps}fps in ${((Date.now() - t0) / 1000).toFixed(0)}s`, JSON.stringify(await evaluate('endcard.stats()')));
  });
})().catch(e => { console.error(e.message || e); process.exit(1); });
