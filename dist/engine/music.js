// NeoN+1 engine/music.js: The music engine (generated music).
'use strict';
NEON_FILES.push(['engine/music.js', 'v12.14']);

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BASS_STEPS = {
  eighths: [0, 2, 4, 6, 8, 10, 12, 14], march: [0, 3, 6, 8, 11, 14], pulse: [0, 4, 8, 12],
  offbeat: [2, 6, 10, 14], gallop: [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15],
};
const DRUMS = {
  four:  { kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14] },
  march: { kick: [0, 8], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], roll: [13, 14, 15] },
  half:  { kick: [0, 10], snare: [8], hat: [4, 12] },
  heavy: { kick: [0, 3, 8, 11], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14] },
};
const LEAD_STEPS = [0, 3, 6, 10, 12];
const LEAD_DEGREES = [4, 2, 0, 2, 4, 5, 4, 2];

const Music = (() => {
  let ac = null, out = null, songG = null, pump = null, echo = null, noiseBuf = null;
  let key = null, song = null, step = 0, nextTime = 0, getState = null, echoDelay = null, echoFb = null;
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
    return { root: sg.root, scale: SCALES[sg.scale], deg: sg.prog[Math.floor(step / 16) % sg.prog.length], beat, beats, end, t0 };
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
    song = null;
    setTimeout(() => {
      song = SONGS[key] || null;
      if (!song) return;
      step = 0; nextTime = ac.currentTime + 0.05;
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
    // After a stall (background tab), skip ahead instead of playing a burst of missed notes.
    if (nextTime < ac.currentTime - 0.2) nextTime = ac.currentTime + 0.02;
    while (nextTime < ac.currentTime + 0.12) {
      if (fx && nextTime > fx.end) return;        // powered down / fanfare over: silence until the next track
      const spb = 60 / (song.bpm * s.tempo * slowAt(nextTime)) / 4;   // seconds per 16th note
      if (step % 4 === 0) lastBeat = { perf: performance.now() + (nextTime - ac.currentTime) * 1000, ms: spb * 4000, n: step / 4 };   // TEMPO's beat clock
      playStep(step, nextTime, spb, s);
      nextTime += spb;
      step = (step + 1) % (16 * song.prog.length);
    }
  }

  function voice(type, freq, t, dur, { vol = 0.2, cut = 2000, q = 1, attack = 0.005, release = 0.08, detune = 0, sweep = false, send = 0, pan = 0 } = {}) {
    const o = ac.createOscillator(); o.type = type; o.frequency.value = freq * bend(t) * pitchMul; o.detune.value = detune;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = q;
    f.frequency.setValueAtTime(sweep ? cut * 2.5 : cut, t);
    if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(80, cut * 0.6), t + dur * 0.8);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.setValueAtTime(vol, t + Math.max(attack, dur - release));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g);
    let node = g;
    if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); node = p; }
    node.connect(pump);
    if (send) { const sg = ac.createGain(); sg.gain.value = send; node.connect(sg); sg.connect(echo); }
    o.start(t); o.stop(t + dur + 0.05);
  }
  function hit(dur, { vol = 0.3, freq = 1000, type = 'bandpass', t }) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(pump);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  function kick(t, vol = 0.7) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g); g.connect(songG);   // the kick skips the pump so it stays punchy
    o.start(t); o.stop(t + 0.32);
  }
  // Duck the music right after the kick: the classic synthwave pumping.
  function duck(t, spb) {
    pump.gain.cancelScheduledValues(t);
    pump.gain.setValueAtTime(0.45, t);
    pump.gain.linearRampToValueAtTime(1, t + spb * 3);
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
    const sc = SCALES[song.scale];
    const bar = Math.floor(i / 16) % song.prog.length, k = i % 16;
    const deg = song.prog[bar];
    const note = (d, oct = 0) => song.root + sc[((d % 7) + 7) % 7] + 12 * (Math.floor(d / 7) + oct);
    const chordN = [note(deg), note(deg + 2), note(deg + 4)];
    const lvl = s.level, u = s.urgency;
    const cut = 500 + lvl * 450 + u * 2400;

    // Pad: a held, detuned chord each bar.
    if (k === 0) for (const n of chordN) for (const det of [-9, 9]) voice('sawtooth', mtof(n + 12), t, spb * 16, { vol: 0.03, cut: cut * 0.8, attack: 0.25, release: 0.3, detune: det });
    // Bass
    if (BASS_STEPS[song.bass].includes(k)) {
      voice('sawtooth', mtof(note(deg)), t, spb * 1.7, { vol: 0.15, cut: 260 + cut * 0.25, q: 6, sweep: true });
      voice('sine', mtof(note(deg)), t, spb * 1.7, { vol: 0.1, cut: 400 });
    }
    // Drums
    if (lvl >= 1) {
      const d = DRUMS[song.drums];
      if (d.kick.includes(k)) { kick(t); duck(t, spb); }
      if (d.snare.includes(k) || (d.roll && bar === song.prog.length - 1 && d.roll.includes(k))) {
        hit(0.22, { vol: 0.28, freq: 1800, t });
        hit(0.35, { vol: 0.08, freq: 4000, type: 'lowpass', t });   // a little gated-reverb tail
      }
      const fast = song.tick ? u > 0.45 : lvl >= 3;
      if (d.hat.includes(k) || (fast && k % 2 === 1)) hit(0.04, { vol: song.tick ? 0.12 : 0.07, freq: 7000, type: 'highpass', t });
    } else if (k % 4 === 0) duck(t, spb);
    // Arp
    if (lvl >= 2) {
      const tones = [...chordN, ...chordN.map(n => n + 12)].map(n => n + 12);
      const order = song.arp === 'down' ? [5, 4, 3, 2, 1, 0]
        : song.arp === 'updown' ? [0, 1, 2, 3, 4, 5, 4, 3, 2, 1]
        : song.arp === 'mirror' ? (k < 8 ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0]) : [0, 1, 2, 3, 4, 5];
      const n = tones[order[k % order.length]];
      voice('square', mtof(n), t, spb * 0.9, { vol: 0.04, cut: 1800 + u * 2000, release: 0.04, send: 0.6, pan: song.pingpong ? (k % 2 ? 0.6 : -0.6) : 0 });
    }
    // Lead (bosses)
    if (lvl >= 3 && LEAD_STEPS.includes(k)) {
      const dg = deg + LEAD_DEGREES[(bar * LEAD_STEPS.length + LEAD_STEPS.indexOf(k)) % LEAD_DEGREES.length];
      voice('square', mtof(note(dg, 2)), t, spb * 2.6, { vol: lvl >= 4 ? 0.06 : 0.05, cut: 3200, attack: 0.02, release: 0.1, send: 0.5 });
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
