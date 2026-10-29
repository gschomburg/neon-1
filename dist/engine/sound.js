// NeoN+1 engine/sound.js: Sound effects (generated).
'use strict';
NEON_FILES.push(['engine/sound.js', 'v13.75']);

// ---------------- Sound ----------------
// Everything is synthesized with Web Audio. Two buses: effects and music,
// each with its own on/off and volume.
const Sound = (() => {
  let ac = null, sfxBus = null, noiseBuf = null;
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      sfxBus = ac.createGain(); sfxBus.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const ch = noiseBuf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      Music.init(ac, ac.destination, noiseBuf);
      levels();
    } catch (e) { ac = null; }
  }
  // Apply the volume settings to both buses.
  function levels() {
    if (!ac) return;
    sfxBus.gain.setTargetAtTime(save.muted ? 0 : 0.16 * save.sfxVol, ac.currentTime, 0.02);
    Music.volume();
  }
  function tone(freq, dur, { type = 'square', vol = 1, slide = 0, delay = 0 } = {}) {
    if (!ac || save.muted) return;
    const t = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // Filtered noise; `to` sweeps the filter (for risers).
  function noise(dur, { vol = 0.5, freq = 1000, to = 0, delay = 0, type = 'bandpass' } = {}) {
    if (!ac || save.muted) return;
    const t = ac.currentTime + delay;
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = 0.8;
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus);
    s.start(t); s.stop(t + dur + 0.02);
  }
  // A brass-ish voice: detuned saws + a square through a filter that opens on the attack,
  // with vibrato coming in on long notes.
  function brass(freq, dur, { vol = 0.12, delay = 0 } = {}) {
    if (!ac || save.muted) return;
    const t = ac.currentTime + delay;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(3400, t + 0.05);
    f.frequency.exponentialRampToValueAtTime(1500, t + Math.max(0.1, dur * 0.6));
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    g.gain.setValueAtTime(vol, t + Math.max(0.04, dur - 0.08));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lfo = ac.createOscillator(), lg = ac.createGain();
    lfo.frequency.value = 5.5;
    lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(dur > 0.4 ? 14 : 0, t + dur * 0.7);
    lfo.connect(lg);
    for (const [type, det] of [['sawtooth', -7], ['sawtooth', 7], ['square', 0]]) {
      const o = ac.createOscillator(); o.type = type;
      o.frequency.setValueAtTime(freq, t); o.detune.value = det;
      lg.connect(o.detune);
      o.connect(f); o.start(t); o.stop(t + dur + 0.02);
    }
    lfo.start(t); lfo.stop(t + dur + 0.02);
    f.connect(g); g.connect(sfxBus);
  }
  const arp = (notes, step, opts) => notes.forEach((f, i) => tone(f, 0.12, Object.assign({ type: 'triangle', vol: 0.4, delay: i * step }, opts)));
  const chord = (notes, dur, opts) => notes.forEach(f => tone(f, dur, opts));
  return {
    init, levels,
    tick: () => tone(1800, 0.018, { vol: 0.12 }),
    key: () => { tone(1100 + Math.random() * 700, 0.012, { type: 'square', vol: 0.06 }); noise(0.012, { vol: 0.07, freq: 3200 }); },   // the intro: a key typed
    blip: () => tone(1500 + Math.random() * 900, 0.016, { type: 'sine', vol: 0.07 }),   // the intro: a line flickering through
    lineOk: () => { tone(880, 0.035, { type: 'sine', vol: 0.16 }); tone(1320, 0.03, { type: 'sine', vol: 0.08, delay: 0.035 }); },   // ...and settling
    talk: () => tone([520, 600, 680, 760][Math.floor(Math.random() * 4)], 0.035, { type: 'triangle', vol: 0.16 }),   // POPS talking, a blip a line
    clock: () => tone(1400, 0.03, { vol: 0.25 }),
    ui: () => tone(990, 0.04, { vol: 0.3 }),
    deny: () => tone(160, 0.12, { type: 'square', vol: 0.3 }),
    buy: () => { tone(880, 0.05, { vol: 0.3 }); tone(1320, 0.08, { vol: 0.3, delay: 0.06 }); },
    probe: () => { tone(520, 0.05, { vol: 0.3 }); tone(780, 0.05, { vol: 0.25, delay: 0.09 }); tone(640, 0.05, { vol: 0.25, delay: 0.18 }); },
    layer: n => tone(260 + Math.min(n, 30) * 22, 0.07, { vol: 0.25 }),
    // Boss incoming: a riser, then a deep boom with a bright power chord and rising fifths.
    boss: () => {
      noise(0.5, { vol: 0.35, freq: 300, to: 4000 });
      tone(1320, 0.06, { type: 'square', vol: 0.18 }); tone(1320, 0.06, { type: 'square', vol: 0.18, delay: 0.16 });
      tone(110, 0.7, { type: 'sine', vol: 0.9, slide: 0.4, delay: 0.48 });
      chord([220, 330, 440], 0.5, { type: 'square', vol: 0.12, delay: 0.48 });
      arp([440, 659, 880], 0.1, { vol: 0.35, delay: 0.6 });
      tone(1318, 0.5, { type: 'triangle', vol: 0.3, delay: 0.9 });
    },
    // The real node: a bright "yes!" that climbs (C E G C), lands on a held top note with a
    // sparkle. Major and rising, so it can't be mistaken for a hit (low and falling).
    safe: () => {
      arp([523, 659, 784, 1046], 0.055, { vol: 0.5 });
      tone(1318, 0.38, { type: 'triangle', vol: 0.42, delay: 0.22 });
      tone(1568, 0.3, { type: 'sine', vol: 0.18, delay: 0.22 });
      tone(2093, 0.12, { type: 'sine', vol: 0.12, delay: 0.3 });
      noise(0.25, { vol: 0.12, freq: 8000, type: 'highpass', delay: 0.22 });
    },
    jingle: () => arp([784, 988, 1175, 1568], 0.06, { vol: 0.4 }),
    modem: () => { noise(0.5, { vol: 0.16, freq: 1200, to: 2600 }); tone(980, 0.25, { vol: 0.14, slide: 1.4 }); tone(2100, 0.2, { vol: 0.1, delay: 0.3 }); },
    beep: () => tone(1250, 0.07, { type: 'sine', vol: 0.4 }),
    beeps: n => { for (let i = 0; i < n; i++) tone(1250, 0.06, { type: 'sine', vol: 0.35, delay: 0.3 + i * 0.2 }); },
    dtmf: ch => { const k = '123456789*0#'.indexOf(ch), lo = [697, 770, 852, 941][Math.floor(Math.max(0, k) / 3)], hi = [1209, 1336, 1477][Math.max(0, k) % 3]; tone(lo, 0.12, { type: 'sine', vol: 0.25 }); tone(hi, 0.12, { type: 'sine', vol: 0.25 }); },
    ping: f => { tone(f, 0.09, { type: 'sine', vol: 0.35 }); tone(f * 1.5, 0.05, { type: 'sine', vol: 0.12, delay: 0.03 }); },
    horn: v => { tone(98, 0.7, { type: 'sawtooth', vol: 0.6 * v }); tone(147, 0.7, { type: 'sawtooth', vol: 0.35 * v }); },
    // Boss entrance: a two-tone alarm with a heartbeat thump, a build, the drop, nodes powering on.
    alarm: () => {
      tone(880, 0.17, { type: 'square', vol: 0.22 }); tone(660, 0.17, { type: 'square', vol: 0.22, delay: 0.2 });
      tone(62, 0.14, { type: 'sine', vol: 0.7, slide: 0.6 }); tone(58, 0.14, { type: 'sine', vol: 0.5, slide: 0.6, delay: 0.16 });
    },
    bossBuild: () => {
      noise(0.56, { vol: 0.3, freq: 300, to: 6000 });
      tone(110, 0.56, { type: 'sawtooth', vol: 0.12, slide: 4 });
      for (let i = 0, d = 0; d < 0.5; i++) { noise(0.04, { vol: 0.1 + d * 0.5, freq: 2200, delay: d }); d += 0.11 - 0.07 * (d / 0.5); }
    },
    bossDrop: () => {
      tone(55, 0.9, { type: 'sine', vol: 0.95, slide: 0.5 });
      noise(0.4, { vol: 0.5, freq: 300, type: 'lowpass' });
      chord([110, 165, 220], 0.6, { type: 'sawtooth', vol: 0.1 });
      noise(1.1, { vol: 0.22, freq: 6000, type: 'highpass' });
    },
    shatter: () => { noise(0.35, { vol: 0.35, freq: 7000, type: 'highpass' }); for (let i = 0; i < 6; i++) tone(1800 + Math.random() * 2600, 0.05, { type: 'triangle', vol: 0.12, delay: i * 0.03 }); },
    nodeOn: () => { tone(220 + Math.random() * 60, 0.05, { type: 'square', vol: 0.18 }); noise(0.04, { vol: 0.12, freq: 1500 }); },
    // Page transition: a soft sweep. Success: a rising sweep, bigger at level 2.
    whoosh: () => noise(0.3, { vol: 0.18, freq: 500 }),
    sweep: lvl => {
      tone(220, 0.45, { type: 'sine', vol: 0.4, slide: 5 });
      noise(0.35, { vol: 0.3, freq: 1800 });
      if (lvl >= 2) arp([659, 880, 1175, 1568], 0.06, { vol: 0.35, delay: 0.1 });
    },
    // Offer pops, scaled by rarity level (0 common .. 4 boss). All bright; no low buzz.
    pop: (lvl, step = 0) => {
      if (lvl >= 3) return Sound.bigPop(lvl, step);
      if (lvl <= 0) return tone(900, 0.03, { vol: 0.2 });
      if (lvl === 1) return arp([700, 1050], 0.05, { vol: 0.3 });
      if (lvl === 2) { arp([600, 900, 1200], 0.05, { vol: 0.35 }); noise(0.12, { vol: 0.2, freq: 4000 }); return; }
      if (lvl === 3) { arp([784, 988, 1175, 1568, 1976], 0.04, { vol: 0.35 }); noise(0.4, { vol: 0.22, freq: 7000 }); return; }
      // BOSS: major chord stab, a quick fanfare up, a held high note and some sparkle.
      chord([523, 659, 784], 0.35, { type: 'triangle', vol: 0.3 });
      chord([523, 784], 0.2, { type: 'square', vol: 0.1 });
      arp([523, 659, 784, 1046], 0.07, { vol: 0.35, delay: 0.08 });
      tone(1568, 0.6, { type: 'triangle', vol: 0.32, delay: 0.38 });
      noise(0.35, { vol: 0.2, freq: 9000, delay: 0.38 });
    },
    // Exotic / boss offers: a short fanfare of their own. `step` is the offer's place
    // in the row, so a row of boss mods climbs (each one a whole step higher).
    bigPop: (lvl, step = 0) => {
      const k = Math.pow(2, (step * 2) / 12);
      const n = m => 440 * Math.pow(2, (m - 69) / 12) * k;
      if (lvl === 3) {
        // EXOTIC: a shimmering run up through a strange (lydian) chord, a bell, sparkle
        arp([72, 76, 78, 83, 86, 90].map(n), 0.035, { vol: 0.3 });
        chord([72, 78, 83].map(n), 0.6, { type: 'triangle', vol: 0.12, delay: 0.21 });
        tone(n(95), 0.9, { type: 'sine', vol: 0.2, delay: 0.21 });
        tone(n(95) * 1.01, 0.9, { type: 'sine', vol: 0.12, delay: 0.21 });   // beating, for shimmer
        noise(0.6, { vol: 0.2, freq: 8000, delay: 0.21 });
        return;
      }
      // BOSS: a brass-like stab, a fast run up, a held top note with a shake, a boom, a crash
      chord([60, 64, 67].map(n), 0.3, { type: 'sawtooth', vol: 0.1 });
      chord([60, 67].map(n), 0.3, { type: 'square', vol: 0.08 });
      tone(n(36), 0.5, { type: 'sine', vol: 0.55, slide: 0.6 });
      arp([60, 64, 67, 72, 76].map(n), 0.045, { vol: 0.32, delay: 0.1 });
      tone(n(79), 0.7, { type: 'triangle', vol: 0.32, delay: 0.33 });
      for (let i = 0; i < 5; i++) tone(n(84) * (i % 2 ? 1.01 : 0.99), 0.07, { type: 'square', vol: 0.05, delay: 0.4 + i * 0.07 });
      noise(0.8, { vol: 0.2, freq: 7000, type: 'highpass', delay: 0.33 });
    },
    // Bad things keep the low buzz, so it always means "bad".
    // Falling "uh-oh" on top of the buzz, the opposite of the real node's climb.
    trap: () => { tone(110, 0.35, { type: 'sawtooth', vol: 0.7, slide: 0.5 }); noise(0.25, { vol: 0.6, freq: 900 }); tone(330, 0.1, { type: 'square', vol: 0.18 }); tone(233, 0.22, { type: 'square', vol: 0.18, slide: 0.8, delay: 0.1 }); },
    yourTurn: () => { tone(880, 0.08, { type: 'triangle', vol: 0.45 }); tone(1320, 0.16, { type: 'triangle', vol: 0.45, delay: 0.09 }); },
    shield: () => { tone(1200, 0.15, { type: 'triangle', vol: 0.5, slide: 0.5 }); noise(0.15, { vol: 0.3, freq: 3000 }); },
    loot: () => { for (let i = 0; i < 4; i++) tone(1200 + i * 200, 0.05, { vol: 0.25, delay: i * 0.05 }); },
    // Game over: the music powers down. Over three beats the track slows and sags in
    // pitch, and on each beat a ding plays from the current chord, stepping down
    // (5th, 3rd, root), each one lower, longer and droopier. A low tone powers off
    // under the last one. keepMusic: just the dings (multiplayer, where play goes on).
    death: (keepMusic = false) => {
      if (!ac) return;
      const pd = keepMusic ? Music.keyInfo() : Music.powerDown();
      const now = ac.currentTime;
      const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
      const deg = d => pd.root + 24 + pd.scale[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
      [pd.deg + 4, pd.deg + 2, pd.deg].forEach((d, k) => {
        const t = pd.beats[k], f = mtof(deg(d)) * pd.bend(t), delay = Math.max(0, t - now);
        const len = [0.6, 0.85, 1.5][k], slide = [0.985, 0.95, 0.78][k];
        tone(f, len, { type: 'triangle', vol: 0.55, slide, delay });              // the ding
        tone(f * 2, len * 0.5, { type: 'sine', vol: 0.16, slide, delay });         // its shine
        tone(f * 3.01, 0.05, { type: 'sine', vol: 0.06, delay });                  // a little strike
      });
      const t3 = pd.beats[2];
      tone(mtof(pd.root + 12) * pd.bend(t3), 1.6, { type: 'sine', vol: 0.5, slide: 0.4, delay: Math.max(0, t3 - now) });   // power off
      noise(0.5, { vol: 0.06, freq: 2500, to: 200, delay: Math.max(0, t3 - now) + 0.2 });
    },
    // Boss beaten: the music powers up. Over three beats the track pushes faster and a
    // little higher, and a ding climbs the current chord on each beat (root, 3rd, 5th).
    // Then a bright major chord with a high bell and sparkle, and the music cuts to silence.
    bossWin: () => {
      if (!ac) return 1.5;
      const pd = Music.powerUp();
      const now = ac.currentTime;
      const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
      const deg = d => pd.root + 24 + pd.scale[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
      const at = t => Math.max(0, t - now);
      [pd.deg, pd.deg + 2, pd.deg + 4].forEach((d, k) => {
        const t = pd.beats[k], f = mtof(deg(d)) * pd.bend(t);
        tone(f, 0.35 + k * 0.08, { type: 'triangle', vol: 0.45 + k * 0.08, delay: at(t) });   // the ding
        tone(f * 2, 0.25, { type: 'sine', vol: 0.18, delay: at(t) });                            // its shine
        tone(f * 3.01, 0.04, { type: 'sine', vol: 0.07, delay: at(t) });                         // a little strike
      });
      // the landing: a major chord on the chord's root, an octave up (always major: it's a win)
      const t = pd.end, b = pd.bend(t), r0 = deg(pd.deg) + 12;
      chord([r0, r0 + 4, r0 + 7].map(m => mtof(m) * b), 1.4, { type: 'triangle', vol: 0.2, delay: at(t) });
      chord([r0 - 12, r0 - 5].map(m => mtof(m) * b), 0.9, { type: 'square', vol: 0.06, delay: at(t) });
      tone(mtof(r0 + 12) * b, 1.6, { type: 'triangle', vol: 0.28, delay: at(t) });              // high bell
      tone(mtof(pd.root) * b, 0.6, { type: 'sine', vol: 0.6, slide: 0.6, delay: at(t) });        // boom
      noise(0.7, { vol: 0.16, freq: 9000, delay: at(t) });                                       // sparkle
      arp([r0 + 7, r0 + 12, r0 + 16, r0 + 19].map(m => mtof(m) * b), 0.05, { vol: 0.16, delay: at(t) + 0.08 });

      // On top: a classic "stage clear" layer, separate from the track.
      // A riser and a snare roll build into the landing...
      const build = Math.max(0.3, t - now);
      noise(build, { vol: 0.13, freq: 700, to: 7000 });
      for (let i = 0, d = 0; d < build - 0.04; i++) {
        const u = d / build;
        noise(0.05, { vol: 0.08 + 0.2 * u, freq: 2200, delay: d });
        d += 0.16 - 0.11 * u;                                         // the roll speeds up
      }
      // ...then a brass fanfare: "ta-ta-ta TAAA, ta-da DAAAA" over a held major chord,
      // with timpani under it...
      const br = r0 - 12, B_ = (m, d, len, v) => brass(mtof(m) * b, len, { vol: v, delay: at(t) + d });
      [-0.27, -0.18, -0.09].forEach(d => B_(br - 5, d, 0.08, 0.1));     // pickup triplet
      B_(br, 0, 0.42, 0.13);                                            // TAAA
      B_(br - 12, 0, 1.5, 0.07); B_(br - 5, 0, 1.5, 0.06); B_(br + 4, 0, 1.5, 0.05);   // the chord, held
      B_(br + 4, 0.45, 0.12, 0.11); B_(br + 7, 0.58, 0.12, 0.11);      // ta-da
      B_(br + 12, 0.72, 1.1, 0.14);                                     // DAAAA
      B_(br + 16, 0.74, 1.05, 0.06);                                    // harmony a 3rd up
      const timp = (d, v) => tone(mtof(pd.root + 12) * b, 0.6, { type: 'sine', vol: v, slide: 0.85, delay: Math.max(0, at(t) + d) });
      [-0.36, -0.24, -0.12].forEach((d, i) => timp(d, 0.18 + i * 0.08)); timp(0, 0.55); timp(0.72, 0.5);
      // ...a crash on each big hit, and a twinkle falling away into the silence.
      noise(1.4, { vol: 0.22, freq: 6000, type: 'highpass', delay: at(t) });
      noise(1.6, { vol: 0.2, freq: 6000, type: 'highpass', delay: at(t) + 0.72 });
      [24, 19, 16, 12, 7, 4].forEach((iv, i) => tone(mtof(r0 + iv) * b, 0.18, { type: 'triangle', vol: 0.08 * (1 - i / 7), delay: at(t) + 1.5 + i * 0.09 }));
      return t - now;   // seconds until the fanfare lands (screens time their reveal to it)
    },
    // A line coming in on a success screen: blips that climb a pentatonic scale.
    climb: i => {
      const P = [0, 2, 4, 7, 9], m = 76 + P[i % 5] + 12 * Math.floor(i / 5) % 24;
      tone(440 * Math.pow(2, (m - 69) / 12), 0.06, { type: 'triangle', vol: 0.3 });
    },
    // The losing collapse, under the dings: a crackle, a long falling whistle, data
    // blips breaking up lower and lower as the line sweeps down, and a thud at the bottom.
    collapse: (dur = 2.9) => {
      noise(0.25, { vol: 0.35, freq: 6000, to: 1500 });                       // the crack
      tone(1400, 0.06, { type: 'square', vol: 0.15 }); tone(1100, 0.06, { type: 'square', vol: 0.15, delay: 0.07 });
      tone(900, dur * 0.85, { type: 'sawtooth', vol: 0.06, slide: 0.06, delay: 0.1 });   // falling whistle
      tone(450, dur * 0.85, { type: 'sine', vol: 0.12, slide: 0.08, delay: 0.1 });
      noise(dur * 0.8, { vol: 0.12, freq: 3000, to: 150, delay: 0.1 });       // rushing air, darkening
      const n = 22;
      for (let i = 0; i < n; i++) {
        const u = i / n, f = (2400 - 2000 * u) * rand(0.8, 1.25);              // blips get lower as it falls
        tone(f, 0.025 + Math.random() * 0.03, { type: 'square', vol: 0.12 * (1 - u * 0.5), slide: Math.random() < 0.3 ? 0.5 : 0, delay: 0.15 + u * dur * 0.75 + Math.random() * 0.06 });
      }
      tone(70, 0.6, { type: 'sine', vol: 0.7, slide: 0.5, delay: dur * 0.88 });   // landing thud
      noise(0.3, { vol: 0.25, freq: 400, type: 'lowpass', delay: dur * 0.88 });
    },
    win: () => arp([523, 659, 784, 1046, 1318], 0.1, { vol: 0.5 }),
    // Run won: a boom, a big major chord, a fast run up, and a held top note with sparkle.
    victory: () => {
      tone(98, 0.8, { type: 'sine', vol: 0.8, slide: 0.5 });
      chord([523, 659, 784], 0.6, { type: 'triangle', vol: 0.28 });
      arp([523, 659, 784, 1046, 1318, 1568, 2093], 0.06, { vol: 0.32, delay: 0.15 });
      chord([784, 1046, 1318], 0.9, { type: 'triangle', vol: 0.22, delay: 0.62 });
      tone(2093, 1.0, { type: 'triangle', vol: 0.25, delay: 0.62 });
      noise(0.6, { vol: 0.18, freq: 9000, delay: 0.62 });
    },
    burst: () => { noise(0.25, { vol: 0.22, freq: 6000 + Math.random() * 3000 }); tone(1200 + Math.random() * 1200, 0.08, { type: 'triangle', vol: 0.18 }); },
    // ---- Hackers going down (engine/hackers.js)
    hkBoom: () => { noise(0.4, { vol: 0.55, freq: 700, to: 120, type: 'lowpass' }); tone(95, 0.32, { type: 'sawtooth', vol: 0.4, slide: 0.4 }); for (let i = 0; i < 4; i++) tone(1400 + Math.random() * 1800, 0.03, { type: 'square', vol: 0.08, delay: 0.03 + i * 0.04 }); },
    hkFall: () => { tone(520, 0.7, { type: 'square', vol: 0.12, slide: 0.2 }); noise(0.5, { vol: 0.15, freq: 2000, to: 300 }); },
    hkRise: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.22, delay: i * 0.09 })); noise(0.5, { vol: 0.08, freq: 6000, delay: 0.2 }); },
    hkStamp: () => { tone(110, 0.18, { type: 'square', vol: 0.5, slide: 0.5 }); noise(0.14, { vol: 0.55, freq: 900 }); tone(55, 0.3, { type: 'sine', vol: 0.6 }); },
    // gear dragged to the TRASH: a crunch and a thunk
    trash: () => { noise(0.2, { vol: 0.5, freq: 1400, to: 300 }); tone(180, 0.14, { type: 'square', vol: 0.3, slide: 0.5, delay: 0.05 }); },
    // ---- Fishing (engine/fishing.js)
    // the cast: the line whizzing out and the hook falling (it lands with fishPlop)
    fishCast: () => {
      noise(0.32, { vol: 0.4, freq: 3200, to: 700 }); tone(1500, 0.3, { type: 'sine', vol: 0.16, slide: 0.45 });
      // ...over the reel spinning out (fast clicks slowing down as the hook falls)
      for (let i = 0; i < 12; i++) { const d = 0.02 + i * 0.028 + i * i * 0.0016; tone(1700 - i * 25, 0.012, { type: 'square', vol: 0.16, delay: d }); noise(0.012, { vol: 0.1, freq: 4200, delay: d }); }
    },
    fishPlop: () => { tone(380, 0.09, { type: 'sine', vol: 0.8, slide: 2.2 }); noise(0.08, { vol: 0.24, freq: 900, delay: 0.02 }); },
    // the hook moving a lane: one click of the reel (up = a little higher)
    fishClick: up => { tone(up ? 2100 : 1700, 0.012, { type: 'square', vol: 0.2 }); noise(0.012, { vol: 0.16, freq: 4200 }); },
    // something's on: two quick bloops and an alert
    fishBite: () => { tone(520, 0.06, { type: 'sine', vol: 0.8, slide: 1.6 }); tone(620, 0.06, { type: 'sine', vol: 0.8, slide: 1.6, delay: 0.08 }); tone(1320, 0.12, { type: 'triangle', vol: 0.6, delay: 0.16 }); },
    // the reel, one tick: holding = a fast, high ratchet; let go = slower, lower slack ticks.
    // In the window it's louder and brighter, with a note that climbs as the catch fills (you're doing it).
    fishReel: (hold, inside, p) => {
      if (hold) { tone(inside ? 1900 : 1500, 0.014, { type: 'square', vol: inside ? 0.4 : 0.18 }); noise(0.014, { vol: inside ? 0.28 : 0.14, freq: 4500 }); }
      else { tone(inside ? 900 : 650, 0.02, { type: 'square', vol: inside ? 0.28 : 0.12 }); noise(0.02, { vol: 0.1, freq: 1800 }); }
      if (inside) tone(440 * Math.pow(2, p * 1.5), 0.05, { type: 'triangle', vol: hold ? 0.24 : 0.12 });
    },
    fishSnap: () => { noise(0.18, { vol: 0.6, freq: 5000, type: 'highpass' }); tone(900, 0.25, { type: 'sawtooth', vol: 0.36, slide: 0.25 }); },
    fishReelIn: () => { for (let i = 0; i < 7; i++) tone(1500 + i * 60, 0.012, { type: 'square', vol: 0.16, delay: i * 0.035 }); },
    // a shoe: a sad little wah-wah
    fishShoe: () => [392, 370, 349, 311].forEach((f, i) => tone(f, i === 3 ? 0.5 : 0.18, { type: 'sawtooth', vol: 0.24, delay: i * 0.2, slide: i === 3 ? 0.94 : 1 })),
    // BONEYARD: a skeleton's clack, a handful of dry clicks
    rattle: () => { for (let i = 0; i < 6; i++) { const d = 0.05 + i * 0.045 + Math.random() * 0.02; tone(900 + Math.random() * 700, 0.02, { vol: 0.12, delay: d }); noise(0.03, { vol: 0.15, freq: 2500, delay: d }); } },
  };
})();
