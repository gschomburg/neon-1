// music_view_check.js: proves Music View's resolver (music_view_resolve.js) matches the real engine.
//
// Runs engine/music.js headless on a pretend AudioContext that just records when each sound starts. For every
// track, at levels 0-4, one part at a time (the engine's mute hook silences the rest), it plays 8 passes and
// compares the 16ths that made a sound with the 16ths the resolver says that part plays. (Which 16ths, not
// which pitches: a mismatch means the view would draw a note that isn't there, or miss one that is.)
//
// Usage: node tools/music_view_check.js [track ...]      (no tracks: all of them)

const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');

// ---- the pretend audio: AudioParams that take anything, sources that record their start time
let starts = [];
const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} });
const node = extra => Object.assign({ connect() {}, disconnect() {}, gain: param(), frequency: param(), detune: param(), Q: param(), delayTime: param(), pan: param() }, extra);
const source = () => node({ type: '', buffer: null, setPeriodicWave() {}, start(t) { starts.push(t); }, stop() {} });
const ac = {
  currentTime: 0, state: 'running', sampleRate: 44100, destination: node(),
  createGain: () => node(), createBiquadFilter: () => node(), createDelay: () => node(), createWaveShaper: () => node(),
  createStereoPanner: () => node(), createOscillator: source, createBufferSource: source,
  createPeriodicWave: () => ({}), createBuffer: () => ({ getChannelData: () => new Float32Array(1) }),
};

// ---- load what the music tool loads (its stand-ins, the music files, every corp), then the resolver
const html = fs.readFileSync(path.join(__dirname, 'music.html'), 'utf8');
const head = html.slice(0, html.indexOf('<!-- corps: end -->'));
const ctx = { console, Math, Date, JSON, Object, Array, Map, Set, WeakMap, Number, String, Float32Array, performance: { now: () => 0 } };
ctx.window = ctx; ctx.globalThis = ctx;
ctx.addEventListener = () => {};
ctx.setTimeout = fn => { fn(); return 0; };   // switching tracks waits for a fade: no need here
vm.createContext(ctx);
let code = '';
for (const m of head.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  const src = ((m[1] || '').match(/src="([^"]+)"/) || [])[1];
  code += (src ? fs.readFileSync(path.join(__dirname, src), 'utf8') : m[2]) + '\n;\n';
}
code += fs.readFileSync(path.join(__dirname, 'music_view_resolve.js'), 'utf8');
code += '\n;globalThis.__m = { SONGS, Music, resolvePass, barSteps };';
vm.runInContext(code, ctx, { filename: 'music' });
const { SONGS, Music, resolvePass, barSteps } = ctx.__m;

// the engine's mute names for each of the view's lanes
const PARTS = ['pad', 'stab', 'bass', 'kick', 'snare', 'hat', 'open', 'clap', 'ghost', 'fill', 'arp', 'melody', 'lead', 'sfx'];
const LANES = { pad: ['pad'], stab: ['stab'], bass: ['bass'], drums: ['kick', 'snare', 'hat', 'open', 'clap', 'ghost', 'fill'], arp: ['arp'], melody: ['melody', 'lead'] };
const PASSES = 8;

let state = { song: null, level: 0 };
Music.setSource(() => ({ song: state.song, level: state.level, urgency: 0, low: false, tempo: 1, pitch: 1 }));
// the engine's scheduler: init hands it to setInterval, which gives it to this script to run by hand
let schedule = null;
ctx.setInterval = fn => { schedule = fn; return 0; };
Music.init(ac, ac.destination, {});

function play(key, level, lane) {
  state = { song: key, level };
  Music.mute(PARTS.filter(p => !LANES[lane].includes(p)));
  Music.loop(null);
  starts = [];
  ac.currentTime += 5;
  Music.restart();
  const sg = SONGS[key], spb = 60 / sg.bpm / (sg.meter === 6 ? 6 : 4);
  const stepsPerPass = barSteps(sg) * sg.prog.length;
  schedule();
  const t0 = ac.currentTime + 0.05;   // switchTo starts the track here (see engine/music.js)
  starts = starts.filter(t => t >= t0 - 1e-6);
  const end = t0 + spb * stepsPerPass * PASSES;
  while (ac.currentTime < end) { ac.currentTime += 0.02; schedule(); }
  const heard = new Set();
  for (const t of starts) {
    if (t >= end - 1e-6) continue;
    heard.add(Math.floor((t - t0) / spb + 1e-6));   // swing and the clap's flams land inside their own 16th
  }
  return { heard, stepsPerPass };
}

function expected(key, level, lane, stepsPerPass) {
  const sg = SONGS[key], set = new Set();
  for (let p = 0; p < PASSES; p++) {
    const r = resolvePass(sg, p, { level });
    for (const n of r.notes) if (n.lane === lane && level >= n.at) set.add(p * stepsPerPass + n.bar * r.bs + n.k);
  }
  return set;
}

const only = process.argv.slice(2);
let bad = 0, checked = 0;
for (const key of Object.keys(SONGS)) {
  if (only.length && !only.includes(key)) continue;
  if (SONGS[key].style === 'ambient') continue;
  for (let level = 0; level <= 4; level++) for (const lane of Object.keys(LANES)) {
    const { heard, stepsPerPass } = play(key, level, lane);
    const want = expected(key, level, lane, stepsPerPass);
    const extra = [...heard].filter(s => !want.has(s)), missing = [...want].filter(s => !heard.has(s));
    checked++;
    if (extra.length || missing.length) {
      bad++;
      const fmt = a => a.slice(0, 8).map(s => `p${Math.floor(s / stepsPerPass)}:${s % stepsPerPass}`).join(' ') + (a.length > 8 ? ' …' : '');
      console.log(`${key} level ${level} ${lane}: engine played ${extra.length} the view doesn't show [${fmt(extra)}], view shows ${missing.length} the engine didn't play [${fmt(missing)}]`);
    }
  }
}
console.log(`${checked} checks (${checked / 30 | 0} tracks x 5 levels x 6 parts): ${bad ? bad + ' mismatches' : 'all match'}`);
process.exit(bad ? 1 : 0);
