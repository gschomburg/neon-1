// NeoN+1 engine/music.js: The music engine (generated music).
'use strict';
NEON_FILES.push(['engine/music.js', 'v13.92']);

// A track (data/music.js, corps/) picks its band. Everything is optional; left out, it's the original
// synthwave sound (so older tracks play exactly as before):
//   bassVoice  saw | acid | sub | pluck | picked          bassOct  true: every other bass note an octave up
//   padVoice   saw | glass | organ | choir | none
//   arpVoice   square | chip | bell | pluck | glass       leadVoice  square | chip | bell | brass | dist
//   kit        synth | 808 | chip | industrial | break    pump  1 (full) .. 0 (off)
//   meter      4 (4/4) | 3 (3/4, waltz) | 6 (6/8, a lilt: bpm counts the two big beats) | 5 (5/4: 20 steps a bar)
//   swing      0 (straight) .. 0.5 (heavy shuffle): pushes every second 16th late
//   bass / drums: the patterns below (12-step ones are for 3/4 and 6/8; 5/4 parts are written out, 20 tokens a bar)
//   creak, owl sound effects on a pattern like stab ('x' = one), from level sfxAt (0): a door creaking open, an owl's
//              call (pitched to the track's root). GRAVE ROBBER (the track) uses them.
// A track can also carry its own parts (phase 3), written one token per 16th: a number is a note, '-' holds
// the note before it, '.' is a rest (spaces between tokens). A list of bars plays bar by bar, then loops.
//   melody     the hook: scale degrees from the track's root (0 = root, 7 = an octave up), two octaves above the
//              bass; plays from level `melodyAt` (default 1), doubled an octave up for bosses. Voice: leadVoice.
//   bassLine   scale steps from the bar's chord root (0 = root, 4 = fifth, 7 = octave). Replaces `bass`.
//   arpLine    chord tones 0-5 (0-2 the chord, 3-5 an octave up). Replaces `arp`.
//   beat       { kick, snare, hat, open, clap, ghost }: 'x' = a hit, e.g. 'x...x...x...x...'. Replaces `drums`.
//   stab       chord stabs, e.g. 'x.x.x.x.x.x.x.x.' (Robyn's pulsing chords), in `stabVoice`, from level `stabAt` (0).
//   gate       chops the pad into hits, e.g. 'x.xx.xx.x.xx.xx.' (a trance gate).
//   breakdown  n: every n-th time through the chords, the drums and bass drop out.
//   sevenths   true: four-note chords.
// Sections and fills (2026-10-25). One time through the chords (prog) is a "pass"; passes make the sections:
//   B          { ...anything above }: a B section. On a B pass these replace the track's own (chords, melody,
//              beat, bassLine, voices...). Also C, D. Not meter or bpm. A track without one plays as before.
//   form       the order of the sections, e.g. 'AABA' (the default when there's a B), 'AB', 'AABC'.
//   fills      false: no drum fills. They're on by default: the last beat of every second pass (and of the pass
//              before a new section) is a fill, a snare roll, a tom run or a kick-snare pickup, and the next
//              bar lands on a crash. Tracks with a roll of their own (march, shanty) keep theirs.
//   fill       { kick, snare, ... } like beat: your own fill, the whole last bar of a fill pass.
// The track for a place (menu, map, omni or a corp key). A corp without one of its own plays the map track.
function trackFor(place) { const k = MUSIC_FOR[place]; return k && SONGS[k] ? k : MUSIC_FOR.map; }
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BASS_STEPS = {
  eighths: [0, 2, 4, 6, 8, 10, 12, 14], march: [0, 3, 6, 8, 11, 14], pulse: [0, 4, 8, 12],
  offbeat: [2, 6, 10, 14], gallop: [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15],
  syncopated: [0, 3, 6, 10, 12], acid: [0, 2, 3, 6, 8, 10, 11, 14], sparse: [0, 10],
  waltz: [0, 4, 8], jig: [0, 4, 6, 10],   // 12-step bars
};
// kick / snare / hat (closed); optional: open (open hat), ghost (quiet snare), clap, roll (a fill in the last bar)
const DRUMS = {
  four:  { kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14] },
  march: { kick: [0, 8], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], roll: [13, 14, 15] },
  half:  { kick: [0, 10], snare: [8], hat: [4, 12] },
  heavy: { kick: [0, 3, 8, 11], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14] },
  disco: { kick: [0, 4, 8, 12], snare: [4, 12], hat: [0, 4, 8, 12], open: [2, 6, 10, 14], clap: [4, 12] },
  two:   { kick: [0, 7, 10], snare: [4, 12], hat: [2, 6, 10, 14], ghost: [9, 15] },
  break: { kick: [0, 2, 10, 11], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], ghost: [7, 9, 14] },
  trap:  { kick: [0, 7, 10], snare: [8], hat: [0, 2, 4, 6, 8, 10, 11, 12, 14, 15], open: [14] },
  waltz: { kick: [0], snare: [4, 8], hat: [0, 2, 4, 6, 8, 10] },      // 3/4
  shanty: { kick: [0, 6], snare: [6], hat: [0, 2, 4, 6, 8, 10], ghost: [10], roll: [9, 10, 11] },   // 6/8
};
const LEAD_STEPS = [0, 3, 6, 10, 12];
const LEAD_DEGREES = [4, 2, 0, 2, 4, 5, 4, 2];
// steps in a bar, and in a beat (what the beat clock counts)
const barSteps = sg => sg && (sg.meter === 3 || sg.meter === 6) ? 12 : sg && sg.meter === 5 ? 20 : 16;
const beatSteps = sg => sg && sg.meter === 6 ? 6 : 4;
// the voices and kits there are (the music tool lists them)
const MUSIC_VOICES = {
  bassVoice: ['saw', 'acid', 'sub', 'pluck', 'picked'], padVoice: ['saw', 'glass', 'organ', 'choir', 'none'],
  arpVoice: ['square', 'chip', 'bell', 'pluck', 'glass', 'keys'], leadVoice: ['square', 'chip', 'bell', 'brass', 'dist', 'keys', 'vox', 'saw'],
  stabVoice: ['saw', 'brass', 'organ', 'keys', 'vox', 'chip'],
  kit: ['synth', '808', 'chip', 'industrial', 'break'], meter: [4, 3, 6, 5],
};
// A written part ('0 - . 4 ...') as steps: each step a { v: number, len: steps held } or null.
const PART_CACHE = new Map();
function parsePart(str) {
  if (PART_CACHE.has(str)) return PART_CACHE.get(str);
  const s = String(str).trim();
  const tok = /\s/.test(s) ? s.split(/\s+/) : [...s], out = tok.map(() => null);   // no spaces ('x.x.'): one character per step
  tok.forEach((x, i) => {
    if (x === '.' || x === '-') return;
    let len = 1; while (tok[i + len] === '-') len++;
    out[i] = { v: x === 'x' ? 1 : Number(x), len };
  });
  PART_CACHE.set(str, out);
  return out;
}
// 'x...x...' -> the steps with a hit
const hitsOf = str => [...String(str).replace(/\s+/g, '')].map((c, i) => c === 'x' || c === 'X' ? i : -1).filter(i => i >= 0);
const BEAT_CACHE = new WeakMap();
function beatOf(song) {
  if (!BEAT_CACHE.has(song.beat)) {
    const b = {};
    for (const k of ['kick', 'snare', 'hat', 'open', 'clap', 'ghost']) if (song.beat[k]) b[k] = hitsOf(song.beat[k]);
    b.kick = b.kick || []; b.snare = b.snare || []; b.hat = b.hat || [];
    BEAT_CACHE.set(song.beat, b);
  }
  return BEAT_CACHE.get(song.beat);
}
// a part's bar (a part is one string, or a list of bars that plays in turn)
const partBar = (part, n) => parsePart(Array.isArray(part) ? part[n % part.length] : part);
// Sections: which letter a pass plays, and the track as that section hears it (B's parts over the track's own).
const formOf = sg => sg.form || (sg.B ? 'AABA' : 'A');
const sectionAt = (sg, p) => { const f = formOf(sg); return f[p % f.length]; };
// (made fresh each pass, so the music tool's live changes reach the B part too)
function sectionSong(sg, letter) {
  if (letter === 'A' || !sg[letter]) return sg;
  return Object.assign({}, sg, sg[letter], { meter: sg.meter, bpm: sg.bpm });   // the meter and tempo stay the track's
}

const Music = (() => {
  let ac = null, out = null, songG = null, pump = null, echo = null, noiseBuf = null;
  let key = null, song = null, base = null, step = 0, nextTime = 0, getState = null, echoDelay = null, echoFb = null;
  let pulseWave = null, driveCurve = null;
  let pass = 0;   // how many times through the chords (written parts and breakdowns count bars with it)
  let crashNext = false;   // a fill just played: the next bar starts on a crash
  // Music View (tools/music_view.html) only; the game never sets these, so it plays as before:
  //   muted   parts to leave out: pad stab bass kick snare hat open clap ghost fill arp melody lead sfx
  //   seekTo  start this pass on the next step; loopPass  keep playing this pass instead of moving on
  //   played  what was scheduled lately ({ t, step, pass }), so the playhead can follow what you hear
  let muted = new Set(), seekTo = null, loopPass = null;
  const played = [];
  const on = part => !muted.has(part);
  // A power-down (lose) or power-up (boss beaten) in progress:
  //   { dir: -1 | 1, t0, beats: [3 beat times], end, hold }
  // Down: the tempo drops each beat and the pitch sags (to -8 semitones).
  // Up: the tempo pushes each beat and the pitch lifts a little (+2 semitones).
  // After `end` the track is silent; the next track waits until `hold`, then fades in slowly.
  let fx = null, muff = null, focused = false, lastF = 20000, pitchMul = 1;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const bend = t => {
    if (!fx) return 1;
    const u = clamp((t - fx.t0) / (fx.end - fx.t0), 0, 1);
    return Math.pow(2, (fx.dir < 0 ? -8 : 2) * u * u / 12);
  };
  const slowAt = t => {
    if (!fx) return 1;
    const k = t < fx.beats[1] ? 0 : t < fx.beats[2] ? 1 : 2;
    return (fx.dir < 0 ? [0.8, 0.55, 0.4] : [1.05, 1.1, 1.15])[k];
  };

  // The current track's key, chord and beat, for jingles that play along with it.
  function keyInfo(slowing = false) {
    const sg = song || SONGS[key] || SONGS.gridlock;
    const s = getState ? getState() : null;
    const beat = clamp(60 / (sg.bpm * (s && s.tempo || 1)), 0.45, 0.7);
    const t0 = (ac ? ac.currentTime : 0) + 0.03;
    const beats = slowing === 'up' ? [t0, t0 + beat / 1.05, t0 + beat / 1.05 + beat / 1.1]
      : slowing ? [t0, t0 + beat / 0.8, t0 + beat / 0.8 + beat / 0.55] : [t0, t0 + beat * 1.1, t0 + beat * 2.4];
    const end = beats[2] + (slowing === 'up' ? beat / 1.15 : beat / 0.4);
    return { root: sg.root, scale: SCALES[sg.scale], deg: sg.prog[Math.floor(step / barSteps(sg)) % sg.prog.length], beat, beats, end, t0 };
  }
  // Slow the playing track down to a stop over three beats (game over).
  function powerDown() {
    const info = keyInfo(true);
    if (!ac || !song) return Object.assign(info, { bend: () => 1 });
    fx = { dir: -1, t0: info.t0, beats: info.beats, end: info.end, hold: 0 };
    songG.gain.cancelScheduledValues(info.beats[2]);
    songG.gain.setTargetAtTime(0, info.beats[2], info.beat / 2.5);   // fade over the last beat
    return Object.assign(info, { bend });
  }
  // Push the playing track up over three beats, then cut to silence (boss beaten).
  // The next track waits a moment, then fades in slowly.
  function powerUp() {
    const info = keyInfo('up');
    if (!ac || !song) return Object.assign(info, { bend: () => 1 });
    fx = { dir: 1, t0: info.t0, beats: info.beats, end: info.end, hold: info.end + 2.6 };   // room for the brass fanfare
    songG.gain.cancelScheduledValues(info.beats[2]);
    songG.gain.setTargetAtTime(0, info.end, 0.08);                 // stop on the fanfare's last hit
    return Object.assign(info, { bend });
  }

  function init(ctx, dest, nb) {
    ac = ctx; noiseBuf = nb;
    out = ac.createGain(); out.gain.value = 0;                          // music volume
    muff = ac.createBiquadFilter(); muff.type = 'lowpass'; muff.frequency.value = 20000;
    out.connect(muff); muff.connect(dest);                               // muffle (boss entrance)
    songG = ac.createGain(); songG.gain.value = 0; songG.connect(out);   // fades between songs
    pump = ac.createGain(); pump.connect(songG);                         // "sidechain" pumping
    // Echo for the arp and lead.
    const d = ac.createDelay(1.5), fb = ac.createGain(), lp = ac.createBiquadFilter();
    d.delayTime.value = 0.32; fb.gain.value = 0.3; lp.type = 'lowpass'; lp.frequency.value = 2400;
    echoDelay = d; echoFb = fb;
    echo = ac.createGain(); echo.gain.value = 0.5;
    echo.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(pump);
    // A thin pulse wave (12.5%: the chiptune / Amiga sound), and a soft-clip curve (distortion).
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let h = 1; h < n; h++) im[h] = 2 / (h * Math.PI) * Math.sin(h * Math.PI * 0.125);
    pulseWave = ac.createPeriodicWave(re, im);
    driveCurve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; driveCurve[i] = Math.tanh(x * 4); }
    setInterval(schedule, 25);
  }
  function volume() {
    if (!ac) return;
    out.gain.setTargetAtTime(save.musicOn ? 0.5 * save.musicVol : 0, ac.currentTime, 0.1);
  }

  // Fade out the current song, then start the new one from the top.
  function switchTo(next) {
    const first = key == null;
    key = next;
    const slowIn = fx && fx.dir > 0;   // after a boss fanfare: ease the next track in
    fx = null;
    const now = ac.currentTime;
    songG.gain.cancelScheduledValues(now);
    songG.gain.setValueAtTime(songG.gain.value, now);
    songG.gain.linearRampToValueAtTime(0, now + (first ? 0.01 : 0.35));
    song = null; base = null;
    setTimeout(() => {
      base = SONGS[key] || null;
      song = base && sectionSong(base, sectionAt(base, 0));
      if (!song) return;
      step = 0; pass = loopPass != null ? loopPass : 0; crashNext = false; nextTime = ac.currentTime + 0.05; played.length = 0;
      song = sectionSong(base, sectionAt(base, pass));
      echoDelay.delayTime.setTargetAtTime(song.echo || 0.32, ac.currentTime, 0.05);
      echoFb.gain.setTargetAtTime(song.feedback || 0.3, ac.currentTime, 0.05);
      pump.gain.cancelScheduledValues(ac.currentTime);
      pump.gain.setValueAtTime(1, ac.currentTime);
      const t = ac.currentTime;
      songG.gain.cancelScheduledValues(t);
      songG.gain.setValueAtTime(0, t);
      songG.gain.linearRampToValueAtTime(1, t + (slowIn ? 4 : 0.8));
    }, first ? 0 : 380);
  }

  function schedule() {
    if (!ac || ac.state !== 'running' || !getState) return;
    const s = getState();
    pitchMul = s.pitch || 1;
    // A new track waits for a boss fanfare (and its silence) to finish.
    if (s.song !== key && !(fx && fx.dir > 0 && ac.currentTime < fx.hold)) switchTo(s.song);
    if (!song) return;
    if (seekTo != null) { pass = seekTo; seekTo = null; step = 0; crashNext = false; song = sectionSong(base, sectionAt(base, pass)); nextTime = ac.currentTime + 0.05; }
    // After a stall (background tab), skip ahead instead of playing a burst of missed notes.
    if (nextTime < ac.currentTime - 0.2) nextTime = ac.currentTime + 0.02;
    while (nextTime < ac.currentTime + 0.12) {
      if (fx && nextTime > fx.end) return;        // powered down / fanfare over: silence until the next track
      const bs = barSteps(song), beat = beatSteps(song);
      // seconds per 16th note (6/8: the bpm counts dotted quarters, 6 sixteenths each)
      const spb = 60 / (song.bpm * s.tempo * slowAt(nextTime)) / beat;
      step = step % (bs * song.prog.length);       // (a meter change in the music tool)
      if (step % beat === 0) lastBeat = { perf: performance.now() + (nextTime - ac.currentTime) * 1000, ms: spb * beat * 1000, n: step / beat };   // TEMPO's beat clock
      const late = song.swing && step % 2 === 1 ? song.swing * spb : 0;   // swing: every second 16th comes late
      playStep(step, nextTime + late, spb, s);
      played.push({ t: nextTime, step, pass }); if (played.length > 64) played.shift();
      nextTime += spb;
      step = (step + 1) % (bs * song.prog.length);
      if (step === 0) { pass = loopPass != null ? loopPass : pass + 1; song = sectionSong(base, sectionAt(base, pass)); }   // the next section
    }
  }

  // One note. type: an oscillator type, or 'pulse' (the thin chip wave). ftype: the filter (lowpass by default);
  // drive: through the soft clip (distortion).
  function voice(type, freq, t, dur, { vol = 0.2, cut = 2000, q = 1, attack = 0.005, release = 0.08, detune = 0, sweep = false, send = 0, pan = 0, ftype = 'lowpass', drive = false } = {}) {
    const o = ac.createOscillator();
    if (type === 'pulse') o.setPeriodicWave(pulseWave); else o.type = type;
    o.frequency.value = freq * bend(t) * pitchMul; o.detune.value = detune;
    const f = ac.createBiquadFilter(); f.type = ftype; f.Q.value = q;
    f.frequency.setValueAtTime(sweep ? cut * 2.5 : cut, t);
    if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(80, cut * 0.6), t + dur * 0.8);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.setValueAtTime(vol, t + Math.max(attack, dur - release));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (drive) { const w = ac.createWaveShaper(); w.curve = driveCurve; o.connect(w); w.connect(f); } else o.connect(f);
    f.connect(g);
    let node = g;
    if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); node = p; }
    node.connect(pump);
    if (send) { const sg = ac.createGain(); sg.gain.value = send; node.connect(sg); sg.connect(echo); }
    o.start(t); o.stop(t + dur + 0.05);
  }
  function hit(dur, { vol = 0.3, freq = 1000, type = 'bandpass', t, q = 1, dest = null }) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || pump);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  // A pitched drum (kicks, toms, chip blips): a quick pitch drop. It skips the pump so it stays punchy.
  function thump(t, { type = 'sine', from = 150, to = 42, fall = 0.12, dur = 0.3, vol = 0.7, drive = false }) {
    const o = ac.createOscillator(), g = ac.createGain();
    if (type === 'pulse') o.setPeriodicWave(pulseWave); else o.type = type;
    o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + fall);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (drive) { const w = ac.createWaveShaper(); w.curve = driveCurve; o.connect(w); w.connect(g); } else o.connect(g);
    g.connect(songG);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function kick(t, vol = 0.7) { thump(t, { vol }); }
  // Duck the music right after the kick: the classic synthwave pumping (pump 1 = full, 0 = none).
  function duck(t, spb) {
    const depth = song && song.pump != null ? song.pump : 1;
    if (depth <= 0) return;
    pump.gain.cancelScheduledValues(t);
    pump.gain.setValueAtTime(1 - 0.55 * depth, t);
    pump.gain.linearRampToValueAtTime(1, t + spb * 3);
  }

  // ---- drum kits: kick, snare, hat, open hat, clap, ghost snare
  const KITS = {
    synth: {
      kick: t => kick(t),
      snare: t => { hit(0.22, { vol: 0.28, freq: 1800, t }); hit(0.35, { vol: 0.08, freq: 4000, type: 'lowpass', t }); },   // with a little gated-reverb tail
      hat: (t, v) => hit(0.04, { vol: v, freq: 7000, type: 'highpass', t }),
      open: t => hit(0.22, { vol: 0.06, freq: 8000, type: 'highpass', t }),
      clap: t => { for (const d of [0, 0.012, 0.024]) hit(0.08, { vol: 0.12, freq: 1300, q: 2, t: t + d }); },
      ghost: t => hit(0.08, { vol: 0.07, freq: 1800, t }),
    },
    // 808: a long, boomy kick, a clap for the snare, crisp hats
    '808': {
      kick: t => { thump(t, { from: 110, to: 46, fall: 0.06, dur: 0.75, vol: 0.85 }); hit(0.012, { vol: 0.2, freq: 3000, type: 'highpass', t, dest: songG }); },
      snare: t => { for (const d of [0, 0.011, 0.022, 0.034]) hit(d === 0.034 ? 0.22 : 0.05, { vol: 0.16, freq: 1150, q: 1.5, t: t + d }); },
      hat: (t, v) => hit(0.03, { vol: v * 0.9, freq: 9000, type: 'highpass', t }),
      open: t => hit(0.3, { vol: 0.07, freq: 9000, type: 'highpass', t }),
      clap: t => { for (const d of [0, 0.011, 0.022]) hit(0.09, { vol: 0.12, freq: 1150, q: 1.5, t: t + d }); },
      ghost: t => hit(0.06, { vol: 0.05, freq: 1500, t }),
    },
    // chip: 8-bit drums from a pulse wave and short noise
    chip: {
      kick: t => thump(t, { type: 'pulse', from: 220, to: 55, fall: 0.07, dur: 0.12, vol: 0.32 }),
      snare: t => { hit(0.1, { vol: 0.22, freq: 3500, type: 'lowpass', t }); thump(t, { type: 'pulse', from: 330, to: 180, fall: 0.05, dur: 0.06, vol: 0.12 }); },
      hat: (t, v) => hit(0.018, { vol: v * 1.3, freq: 9000, type: 'highpass', t }),
      open: t => hit(0.12, { vol: 0.08, freq: 7000, type: 'highpass', t }),
      clap: t => hit(0.06, { vol: 0.16, freq: 2500, type: 'lowpass', t }),
      ghost: t => hit(0.04, { vol: 0.08, freq: 3000, type: 'lowpass', t }),
    },
    // industrial: a distorted kick, metallic snare and clanks (NIN)
    industrial: {
      kick: t => thump(t, { from: 140, to: 40, fall: 0.1, dur: 0.35, vol: 0.55, drive: true }),
      snare: t => { hit(0.25, { vol: 0.3, freq: 1400, q: 0.7, t }); thump(t, { type: 'square', from: 340, to: 300, fall: 0.1, dur: 0.12, vol: 0.09, drive: true }); },
      hat: (t, v) => { hit(0.05, { vol: v, freq: 9500, type: 'highpass', t }); hit(0.03, { vol: v * 0.6, freq: 3200, q: 8, t }); },
      open: t => hit(0.3, { vol: 0.08, freq: 5200, q: 4, t }),
      clap: t => hit(0.18, { vol: 0.2, freq: 900, q: 3, t }),
      ghost: t => hit(0.06, { vol: 0.07, freq: 3200, q: 8, t }),
    },
    // break: a tight, live-feeling kit (busy hats with some swing in the hand)
    break: {
      kick: t => thump(t, { from: 180, to: 50, fall: 0.06, dur: 0.18, vol: 0.75 }),
      snare: t => { hit(0.16, { vol: 0.3, freq: 2400, q: 0.8, t }); thump(t, { type: 'triangle', from: 220, to: 160, fall: 0.06, dur: 0.1, vol: 0.12 }); },
      hat: (t, v) => hit(0.035, { vol: v * (0.6 + Math.random() * 0.6), freq: 8000, type: 'highpass', t }),
      open: t => hit(0.18, { vol: 0.07, freq: 7500, type: 'highpass', t }),
      clap: t => hit(0.1, { vol: 0.14, freq: 1600, q: 1.5, t }),
      ghost: t => hit(0.07, { vol: 0.08, freq: 2400, q: 0.8, t }),
    },
  };

  // Fill sounds every kit shares: a crash, and toms (a pitched thump; n = 0 high .. 3 low).
  function crash(t) { hit(1.4, { vol: 0.075, freq: 5200, type: 'highpass', t }); hit(0.5, { vol: 0.04, freq: 3000, q: 0.6, t }); }
  function tom(t, n, vol = 0.45) { const f = [210, 165, 130, 100][clamp(n, 0, 3)]; thump(t, { type: 'sine', from: f * 1.5, to: f, fall: 0.05, dur: 0.28, vol }); }
  // the fill on the last beat (beat = steps in a beat; j = 0 .. beat-1 counts through it)
  function autoFill(kit, style, j, beat, t) {
    const last = j === beat - 1;
    if (style === 0) { if (j < beat / 2) kit.ghost(t); else kit.snare(t); if (last) kit.kick(t); }   // a snare roll, louder at the end
    else if (style === 1) { tom(t, Math.floor(j * 4 / beat)); if (j === 0) kit.snare(t); }          // a tom run, high to low
    else { if (j % 2 === 0) kit.snare(t); else kit.kick(t); if (last) kit.snare(t); }                // kick-snare pickup
  }
  // Is this pass's last bar a fill? Every second pass, and before a new section; not into or out of a breakdown.
  function fillPass(p) {
    if (song.fills === false) return false;
    const brkAt = q => base.breakdown && q % base.breakdown === base.breakdown - 1;
    if (brkAt(p) || brkAt(p + 1)) return false;
    return p % 2 === 1 || sectionAt(base, p + 1) !== sectionAt(base, p);
  }

  // ---- the band: bass, pad, arp and lead, each in the voice the track picked
  function bassNote(n, t, spb, cut) {
    const f = mtof(n), v = song.bassVoice;
    if (v === 'acid') { voice('sawtooth', f, t, spb * 1.1, { vol: 0.12, cut: 420 + cut * 0.45, q: 14, sweep: true, release: 0.05 }); return; }
    if (v === 'sub') { voice('sine', f, t, spb * 2.2, { vol: 0.24, cut: 400, attack: 0.01, release: 0.1 }); voice('triangle', f * 2, t, spb * 1.4, { vol: 0.025, cut: 900 }); return; }
    if (v === 'pluck') { voice('square', f * 2, t, spb * 0.9, { vol: 0.08, cut: 700 + cut * 0.4, q: 3, sweep: true, release: 0.15 }); voice('sine', f, t, spb * 0.9, { vol: 0.09, cut: 500 }); return; }
    if (v === 'picked') { voice('sawtooth', f, t, spb * 0.7, { vol: 0.1, cut: 520, q: 2, release: 0.1 }); voice('triangle', f, t, spb * 0.7, { vol: 0.08, cut: 900 }); return; }
    voice('sawtooth', f, t, spb * 1.7, { vol: 0.15, cut: 260 + cut * 0.25, q: 6, sweep: true });   // saw: the original
    voice('sine', f, t, spb * 1.7, { vol: 0.1, cut: 400 });
  }
  function padChord(chordN, t, len, cut) {
    const v = song.padVoice;
    if (v === 'none') return;
    if (v === 'glass') { for (const n of chordN) for (const det of [-6, 6]) voice('triangle', mtof(n + 24), t, len, { vol: 0.016, cut: 7000, attack: 0.4, release: 0.6, detune: det, send: 0.25 }); return; }
    if (v === 'organ') {   // drawbars: the root's octave below, the note, and a fifth on top
      for (const n of chordN) { voice('sine', mtof(n), t, len, { vol: 0.03, cut: 3000, attack: 0.02, release: 0.06 }); voice('square', mtof(n + 12), t, len, { vol: 0.011, cut: 2400, attack: 0.02, release: 0.06 }); voice('sine', mtof(n + 19), t, len, { vol: 0.008, cut: 4000, attack: 0.02, release: 0.06 }); }
      return;
    }
    if (v === 'choir') {   // saws through two vowel-ish bandpass formants, slow to swell
      for (const n of chordN) for (const fm of [700, 1150]) voice('sawtooth', mtof(n + 12), t, len, { vol: 0.03, cut: fm, q: 5, ftype: 'bandpass', attack: 0.6, release: 0.7, detune: fm === 700 ? -7 : 7 });
      return;
    }
    for (const n of chordN) for (const det of [-9, 9]) voice('sawtooth', mtof(n + 12), t, len, { vol: 0.03, cut: cut * 0.8, attack: 0.25, release: 0.3, detune: det });   // saw: the original
  }
  // keys: an electric piano (soft triangle body, a bell-ish shimmer on top); vox: an "ah" (saws through two vowel
  // formants); saw: a supersaw lead
  function keysNote(f, t, dur, vol, pan = 0, send = 0.3) {
    voice('triangle', f, t, dur, { vol, cut: 3200, attack: 0.004, release: dur * 0.85, pan, send });
    voice('sine', f * 2, t, Math.min(dur, 0.6), { vol: vol * 0.35, cut: 6000, release: 0.4, pan });
  }
  function voxNote(f, t, dur, vol, pan = 0) {
    for (const [fm, det] of [[760, -6], [1180, 6]]) voice('sawtooth', f, t, dur, { vol: vol * 0.9, cut: fm, q: 7, ftype: 'bandpass', attack: 0.03, release: Math.min(0.25, dur * 0.5), detune: det, send: 0.3, pan });
  }
  function sawNote(f, t, dur, vol) {
    for (const det of [-12, 0, 12]) voice('sawtooth', f, t, dur, { vol: vol * 0.45, cut: 3400, attack: 0.01, release: 0.12, detune: det, send: 0.35 });
  }
  // Chord stabs (stab): the chord, short, in the stab voice.
  function stabChord(chordN, t, dur) {
    const v = song.stabVoice || 'saw';
    for (const n of chordN) {
      const f = mtof(n + 12);
      if (v === 'keys') keysNote(f, t, dur, 0.028);
      else if (v === 'vox') voxNote(f, t, dur, 0.03);
      else if (v === 'organ') { voice('sine', f, t, dur, { vol: 0.03, cut: 3000, attack: 0.01, release: 0.05 }); voice('square', f * 2, t, dur, { vol: 0.01, cut: 2400, attack: 0.01, release: 0.05 }); }
      else if (v === 'brass') for (const det of [-8, 8]) voice('sawtooth', f, t, dur, { vol: 0.022, cut: 2000, q: 1.5, attack: 0.03, release: 0.08, detune: det });
      else if (v === 'chip') voice('pulse', f, t, dur, { vol: 0.025, cut: 9000, release: 0.03 });
      else for (const det of [-10, 10]) voice('sawtooth', f, t, dur, { vol: 0.022, cut: 2600, attack: 0.005, release: 0.06, detune: det });
    }
  }
  function arpNote(n, t, spb, u, pan, dur = spb) {
    const v = song.arpVoice, f = mtof(n);
    if (v === 'keys') { keysNote(f, t, Math.max(dur, spb * 1.5), 0.05, pan, 0.45); return; }
    if (v === 'chip') { voice('pulse', f, t, spb * 0.8, { vol: 0.045, cut: 9000, release: 0.03, send: 0.35, pan }); return; }
    if (v === 'bell') { voice('sine', f * 2, t, spb * 3, { vol: 0.04, cut: 8000, release: spb * 2.5, send: 0.6, pan }); voice('sine', f * 7, t, spb, { vol: 0.006, cut: 9000, release: spb * 0.8 }); return; }
    if (v === 'pluck') { voice('sawtooth', f, t, spb * 0.9, { vol: 0.045, cut: 1400 + u * 2000, q: 4, sweep: true, release: 0.06, send: 0.5, pan }); return; }
    if (v === 'glass') { voice('triangle', f * 2, t, spb * 1.6, { vol: 0.05, cut: 7000, release: spb, send: 0.6, pan }); return; }
    voice('square', f, t, spb * 0.9, { vol: 0.04, cut: 1800 + u * 2000, release: 0.04, send: 0.6, pan });   // square: the original
  }
  // dur: how long the note is held (a written melody); the stock boss lead holds 2.6 steps
  function leadNote(n, t, spb, loud, dur = spb * 2.6, volMul = 1) {
    const v = song.leadVoice, f = mtof(n), vol = (loud ? 0.06 : 0.05) * volMul;
    if (v === 'chip') { voice('pulse', f, t, dur, { vol: vol * 1.1, cut: 9000, attack: 0.005, release: 0.06, send: 0.4 }); return; }
    if (v === 'bell') { voice('sine', f, t, Math.max(dur, spb * 4), { vol: vol * 1.3, cut: 8000, release: Math.max(dur, spb * 4) * 0.85, send: 0.6 }); voice('sine', f * 3, t, spb * 1.5, { vol: vol * 0.25, cut: 9000, release: spb }); return; }
    if (v === 'brass') { for (const det of [-8, 8]) voice('sawtooth', f, t, dur * 1.08, { vol: vol * 0.8, cut: 2200, q: 1.5, attack: 0.05, release: 0.12, detune: det, send: 0.35 }); return; }
    if (v === 'dist') { voice('sawtooth', f, t, dur, { vol: vol * 0.7, cut: 2600, attack: 0.01, release: 0.08, send: 0.3, drive: true }); return; }
    if (v === 'keys') { keysNote(f, t, Math.max(dur, spb * 2), vol * 1.4, 0, 0.4); return; }
    if (v === 'vox') { voxNote(f, t, dur, vol * 1.3); return; }
    if (v === 'saw') { sawNote(f, t, dur, vol); return; }
    voice('square', f, t, dur, { vol, cut: 3200, attack: 0.02, release: 0.1, send: 0.5 });   // square: the original
  }

  // A door creaking open: a low saw gliding up through a narrow band, chopped unevenly (the hinge sticks
  // and slips), swelling in and out over ~2 seconds.
  function creak(t) {
    const dur = 1.5 + Math.random() * 0.7, f0 = 75 + Math.random() * 25;
    const o = ac.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0 * bend(t) * pitchMul, t);
    o.frequency.linearRampToValueAtTime(f0 * 2.1, t + dur * 0.6);
    o.frequency.linearRampToValueAtTime(f0 * 1.5, t + dur);
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 6;
    bp.frequency.setValueAtTime(650, t); bp.frequency.linearRampToValueAtTime(1600, t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
    for (let x = t; x < t + dur;) {
      const gap = 0.022 + Math.random() * 0.03, u = (x - t) / dur;
      const v = 1.1 * Math.sqrt(Math.sin(Math.PI * u)) * (0.45 + Math.random() * 0.55) + 0.0002;
      g.gain.setValueAtTime(0.0002, x); g.gain.linearRampToValueAtTime(v, x + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0002, x + gap * 0.9);
      x += gap;
    }
    o.connect(bp); bp.connect(g); g.connect(pump);
    const sg = ac.createGain(); sg.gain.value = 0.35; g.connect(sg); sg.connect(echo);
    o.start(t); o.stop(t + dur + 0.1);
  }
  // An owl: hoo, hoo-hoo, hooo. Soft sine hoots that sag a little in pitch, into the echo.
  function owl(t, midi) {
    const f = mtof(midi), pan = Math.random() < 0.5 ? -0.5 : 0.5;
    for (const [d, len, up] of [[0, 0.32, 1], [0.62, 0.14, 1.04], [0.8, 0.3, 1], [1.3, 0.5, 0.97]]) {
      const at = t + d, o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o2.type = 'sine';
      o.frequency.setValueAtTime(f * up * 1.03 * bend(at) * pitchMul, at); o.frequency.exponentialRampToValueAtTime(f * up * 0.94, at + len);
      o2.frequency.setValueAtTime(f * up * 2.06, at); o2.frequency.exponentialRampToValueAtTime(f * up * 1.88, at + len);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.2, at + 0.06);
      g.gain.setValueAtTime(0.2, at + len * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      const g2 = ac.createGain(); g2.gain.value = 0.12;
      o.connect(g); o2.connect(g2); g2.connect(g);
      let node = g;
      if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); node = p; }
      node.connect(pump);
      const sg = ac.createGain(); sg.gain.value = 0.7; node.connect(sg); sg.connect(echo);
      o.start(at); o2.start(at); o.stop(at + len + 0.05); o2.stop(at + len + 0.05);
    }
  }

  // Ambient songs (the menu track): pads, a brass swell, bells. No drums or pumping.
  function ambientStep(i, t, spb) {
    const sc = SCALES[song.scale];
    const bar = Math.floor(i / 16) % song.prog.length, k = i % 16;
    const deg = song.prog[bar];
    const note = (d, oct = 0) => song.root + sc[((d % 7) + 7) % 7] + 12 * (Math.floor(d / 7) + oct);
    const chordN = [note(deg), note(deg + 2), note(deg + 4)];
    const barLen = spb * 16;
    if (k === 0) {
      // Wide, slow pad: three detuned saws per note, fading in and out across the bar.
      for (const n of chordN) for (const det of [-14, 0, 14]) voice('sawtooth', mtof(n + 12), t, barLen + 1.2, { vol: 0.018, cut: 900, attack: 1.4, release: 1.4, detune: det });
      voice('sine', mtof(note(deg) - 12), t, barLen + 1, { vol: 0.07, cut: 300, attack: 0.8, release: 1 });
      // Every other bar: a low, brassy swell (root + fifth).
      if (bar % 2 === 0) for (const n of [note(deg) + 12, note(deg + 4) + 12]) voice('sawtooth', mtof(n - 12), t, barLen * 1.6, { vol: 0.03, cut: 1300, q: 2, attack: 1.8, release: 1.6, detune: 6 });
    }
    // Sparse bell notes that ring out into the echo.
    const bells = { 0: 2, 6: 1, 10: 0, 13: 2 };
    if (k in bells && (k !== 13 || bar % 2 === 1)) {
      const n = chordN[bells[k]] + 24;
      voice('triangle', mtof(n), t, 2.4, { vol: 0.045, cut: 5000, attack: 0.005, release: 2.2, send: 0.85, pan: (k % 4 === 2) ? 0.4 : -0.3 });
      voice('sine', mtof(n + 12), t, 1.2, { vol: 0.015, cut: 6000, attack: 0.005, release: 1.1 });
    }
  }

  function playStep(i, t, spb, s) {
    if (song.style === 'ambient') return ambientStep(i, t, spb);
    const sc = SCALES[song.scale], bs = barSteps(song);
    const bar = Math.floor(i / bs) % song.prog.length, k = i % bs;
    const deg = song.prog[bar];
    const note = (d, oct = 0) => song.root + sc[((d % 7) + 7) % 7] + 12 * (Math.floor(d / 7) + oct);
    const chordN = [note(deg), note(deg + 2), note(deg + 4)];
    if (song.sevenths) chordN.push(note(deg + 6));
    const lvl = s.level, u = s.urgency;
    const cut = 500 + lvl * 450 + u * 2400;
    const barN = pass * song.prog.length + bar;   // bars since the track started (written parts run on it)
    const brk = song.breakdown && pass % song.breakdown === song.breakdown - 1;   // a breakdown pass: no drums or bass

    // Pad: a held chord each bar, or chopped into hits (gate).
    if (!on('pad')) { /* muted */ }
    else if (song.gate) { const g = partBar(song.gate, barN)[k]; if (g) padChord(chordN, t, spb * g.len * 0.85, cut); }
    else if (k === 0) padChord(chordN, t, spb * bs, cut);
    // Sound effects (the GRAVE ROBBER track)
    if (lvl >= (song.sfxAt || 0) && on('sfx')) {
      if (song.creak && partBar(song.creak, barN)[k]) creak(t);
      if (song.owl && partBar(song.owl, barN)[k]) owl(t, song.root + 24);
    }
    // Chord stabs
    if (song.stab && lvl >= (song.stabAt || 0) && on('stab')) { const g = partBar(song.stab, barN)[k]; if (g) stabChord(chordN, t, spb * g.len * 0.8); }
    // Bass: a written line (scale steps from the chord root), or a pattern (bassOct: every other note an octave up)
    if (!on('bass')) { /* muted */ }
    else if (!brk && song.bassLine) { const b = partBar(song.bassLine, barN)[k]; if (b) bassNote(note(deg + b.v), t, spb * Math.max(1, b.len * 0.6), cut); }
    else if (!brk) {
      const bassSteps = BASS_STEPS[song.bass] || BASS_STEPS.eighths;
      if (bassSteps.includes(k)) bassNote(note(deg) + (song.bassOct && bassSteps.indexOf(k) % 2 === 1 ? 12 : 0), t, spb, cut);
    }
    // Drums
    if (lvl >= 1 && !brk) {
      let d = song.beat ? beatOf(song) : DRUMS[song.drums] || DRUMS.four;
      const kit = KITS[song.kit] || KITS.synth, beat = beatSteps(song);
      if (k === 0 && crashNext && on('fill')) crash(t);
      if (k === 0) crashNext = false;
      // A fill: the track's own (the whole last bar), or the automatic one (the last beat), then a crash.
      const fillHere = bar === song.prog.length - 1 && !d.roll && fillPass(pass);
      if (fillHere && k === bs - 1) crashNext = true;
      if (fillHere && song.fill && on('fill')) d = beatOf({ beat: song.fill });
      else if (fillHere && k >= bs - beat) { if (on('fill')) autoFill(kit, Math.floor(pass / 2) % 3, k - (bs - beat), beat, t); d = null; }
      if (d) {
        if (d.kick.includes(k)) { if (on('kick')) kit.kick(t); duck(t, spb); }
        if (d.snare.includes(k) || (d.roll && bar === song.prog.length - 1 && d.roll.includes(k))) { if (on('snare')) kit.snare(t); }
        if (d.clap && d.clap.includes(k) && on('clap')) kit.clap(t);
        if (d.ghost && d.ghost.includes(k) && on('ghost')) kit.ghost(t);
        const fast = song.tick ? u > 0.45 : lvl >= 3;
        if ((d.hat.includes(k) || (fast && k % 2 === 1)) && on('hat')) kit.hat(t, song.tick ? 0.12 : 0.07);
        if (d.open && d.open.includes(k) && on('open')) kit.open(t);
      }
    } else if (k % beatSteps(song) === 0 && !brk) duck(t, spb);
    // Arp: a written line (chord tones), or a pattern
    if (lvl >= 2 && on('arp')) {
      const tones = [...chordN.slice(0, 3), ...chordN.slice(0, 3).map(n => n + 12)].map(n => n + 12);
      const pan = song.pingpong ? (k % 2 ? 0.6 : -0.6) : 0;
      if (song.arpLine) { const a = partBar(song.arpLine, barN)[k]; if (a) arpNote(tones[clamp(a.v, 0, 5)], t, spb, u, pan, spb * a.len); }
      else {
        const order = song.arp === 'down' ? [5, 4, 3, 2, 1, 0]
          : song.arp === 'updown' ? [0, 1, 2, 3, 4, 5, 4, 3, 2, 1]
          : song.arp === 'mirror' ? (k < bs / 2 ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0]) : [0, 1, 2, 3, 4, 5];
        arpNote(tones[order[k % order.length]], t, spb, u, pan);
      }
    }
    // A written melody (the track's hook), from level melodyAt; bosses double it an octave up.
    if (song.melody) {
      const m = lvl >= (song.melodyAt != null ? song.melodyAt : 1) && partBar(song.melody, barN)[k];
      if (m && on('melody')) {
        const n = song.root + 24 + 12 * (song.melodyOct || 0) + sc[((m.v % 7) + 7) % 7] + 12 * Math.floor(m.v / 7);
        leadNote(n, t, spb, lvl >= 4, spb * m.len * 0.95);
        if (lvl >= 3) leadNote(n + 12, t, spb, false, spb * m.len * 0.95, 0.35);
      }
    }
    // Lead (bosses), when the track has no melody of its own
    else if (lvl >= 3 && LEAD_STEPS.includes(k) && on('lead')) {
      const dg = deg + LEAD_DEGREES[(bar * LEAD_STEPS.length + LEAD_STEPS.indexOf(k)) % LEAD_DEGREES.length];
      leadNote(note(dg, 2), t, spb, lvl >= 4);
    }
    // Heartbeat when integrity is low.
    if (s.low && (k === 0 || k === 3)) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      g.gain.setValueAtTime(k === 0 ? 0.5 : 0.35, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.22);
    }
  }

  let lastBeat = null;
  return { init, volume, setSource: fn => { getState = fn; }, current: () => key, beat: () => (ac && ac.state === 'running' && song ? lastBeat : null), keyInfo: () => Object.assign(keyInfo(), { bend: () => 1 }), powerDown, powerUp,
    restart: () => { if (ac && key) switchTo(key); },
    // Music View: what's playing now ({ step, pass, bar, section } as heard, or null), parts to leave out,
    // jump to a pass, hold on one pass (null: follow the form again)
    position: () => {
      if (!ac || !base) return null;
      let p = null; for (const e of played) if (e.t <= ac.currentTime) p = e;
      if (!p) return null;
      const bs = barSteps(base);
      return { step: p.step % bs, bar: Math.floor(p.step / bs), pass: p.pass, section: sectionAt(base, p.pass), t: p.t };
    },
    mute: parts => { muted = new Set(parts || []); },
    seek: p => { seekTo = Math.max(0, p | 0); played.length = 0; },
    loop: p => { loopPass = p == null ? null : Math.max(0, p | 0); },
    muffle: on => { focused = false; if (ac && muff) muff.frequency.setTargetAtTime(on ? 380 : 20000, ac.currentTime, on ? 0.08 : 0.12); },
    // DECIBEL / STETHOSCOPE: 0 = muffled .. 1 = clear. null hands it back.
    focus: v => {
      if (!ac || !muff) return;
      if (v == null) { if (focused) { focused = false; lastF = 20000; muff.frequency.setTargetAtTime(20000, ac.currentTime, 0.15); } return; }
      const f = v >= 0.97 ? 20000 : 280 + v * v * 9000;
      if (focused && Math.abs(f - lastF) < 40) return;
      focused = true; lastF = f;
      muff.frequency.setTargetAtTime(f, ac.currentTime, 0.08);
    } };
})();
