// Music View's resolver: every note one pass of a track plays, worked out the way engine/music.js plays it
// (playStep), so the piano roll never has to guess. Uses the engine's own tables and helpers (SCALES, DRUMS,
// BASS_STEPS, partBar, beatOf, sectionSong ...), so load it after data/music.js and engine/music.js.
//
// resolvePass(base, pass, { level, urgency }) ->
//   { section, song (the section as the engine hears it), bs (steps a bar), beat (steps a beat), bars, notes,
//     breakdown, fill: null | { style, custom }, crash (the pass starts on a crash), ambient }
// bars:  [{ deg, chord: [midi...], roman, name }] one per chord in prog
// notes: [{ lane, row, bar, k (step in the bar), len (steps), v (the lane's own number), midi, gen, at, ... }]
//   lane  melody | arp | stab | pad | bass | drums | sfx
//   row   drums: kick snare hat open clap ghost tom crash; sfx: creak owl; otherwise the lane
//   v     melody: degree from the root (0 = root, 7 = octave); bass: steps from the chord root; arp: tone 0-5
//   gen   true when the engine made it (a pattern, the stock boss lead, an auto fill), not written in the track
//   at    the level it comes in at (the lane is silent below it)
//   fill / boss / dbl: part of a drum fill / the boss-only extra hats / the boss octave double of the melody
'use strict';
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const AUTO_FILLS = ['snare roll', 'tom run', 'kick-snare pickup'];
const ARP_ORDERS = { up: [0, 1, 2, 3, 4, 5], down: [5, 4, 3, 2, 1, 0], updown: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1] };

// The scale's seven notes spelled the way a musician would (one of each letter: F minor is F G Ab Bb C Db Eb,
// not F G G# A# ...). The root takes whichever spelling needs the fewest sharps and flats.
const SPELL_LETTERS = 'CDEFGAB', SPELL_NATURAL = [0, 2, 4, 5, 7, 9, 11];
function spell(pc, letter) {
  let d = ((pc - SPELL_NATURAL[letter]) % 12 + 12) % 12; if (d > 6) d -= 12;
  return SPELL_LETTERS[letter] + (d > 0 ? '#'.repeat(d) : 'b'.repeat(-d));
}
function scaleNames(sg) {
  const sc = SCALES[sg.scale] || SCALES.minor, pc = sg.root % 12;
  let best = null;
  for (let L = 0; L < 7; L++) {
    const off = ((pc - SPELL_NATURAL[L]) % 12 + 12) % 12;
    if (off > 1 && off < 11) continue;   // the root's letter is within a half step
    const names = sc.map((iv, i) => spell((pc + iv) % 12, (L + i) % 7));
    const cost = names.reduce((a, n) => a + (n.length - 1) * (n.length > 2 ? 10 : 1), 0);
    if (!best || cost < best.cost) best = { names, cost };
  }
  return best.names;
}
// The chord on a scale degree: its notes, roman numeral (case = major / minor) and name.
function chordInfo(sg, deg) {
  const sc = SCALES[sg.scale] || SCALES.minor;
  const note = d => sg.root + sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
  const chord = [note(deg), note(deg + 2), note(deg + 4)];
  if (sg.sevenths) chord.push(note(deg + 6));
  const third = chord[1] - chord[0], fifth = chord[2] - chord[0], sev = sg.sevenths ? chord[3] - chord[0] : 0;
  const q = fifth === 6 ? 'dim' : fifth === 8 ? 'aug' : third === 3 ? 'min' : 'maj';
  const r = ROMAN[((deg % 7) + 7) % 7];
  // with sevenths: maj7, 7 (dominant), m7, m(maj7), ø7 (half-diminished), °7, +maj7
  const sevName = !sev ? '' : q === 'maj' ? (sev === 11 ? 'maj7' : '7') : q === 'min' ? (sev === 11 ? 'm(maj7)' : 'm7') : q === 'dim' ? (sev === 9 ? '°7' : 'ø7') : (sev === 11 ? '+maj7' : '+7');
  const romanSev = { maj7: 'maj7', 7: '7', m7: '7', 'm(maj7)': '(maj7)', 'ø7': 'ø7', '°7': '°7', '+maj7': '+maj7', '+7': '+7' }[sevName] || '';
  const roman = (q === 'maj' || q === 'aug' ? r : r.toLowerCase()) + (sev ? romanSev : q === 'dim' ? '°' : q === 'aug' ? '+' : '');
  const root = scaleNames(sg)[((deg % 7) + 7) % 7];
  const name = root + (sev ? sevName : q === 'min' ? 'm' : q === 'dim' ? '°' : q === 'aug' ? '+' : '');
  return { deg, chord, roman, name };
}

// The engine's fillPass, for any pass (base: the track; sg: that pass's section).
function isFillPass(base, sg, p) {
  if (sg.fills === false) return false;
  const brkAt = q => base.breakdown && q % base.breakdown === base.breakdown - 1;
  if (brkAt(p) || brkAt(p + 1)) return false;
  return p % 2 === 1 || sectionAt(base, p + 1) !== sectionAt(base, p);
}
const isBreakdown = (base, p) => !!base.breakdown && p % base.breakdown === base.breakdown - 1;
// the drum hits of a section (a written beat, or a pattern)
const drumsOf = sg => sg.beat ? beatOf(sg) : DRUMS[sg.drums] || DRUMS.four;

function resolvePass(base, pass, { level = 4, urgency = 0 } = {}) {
  const sg = sectionSong(base, sectionAt(base, pass));
  const bs = barSteps(sg), beat = beatSteps(sg), nb = sg.prog.length;
  const bars = sg.prog.map(d => chordInfo(sg, d));
  const out = { section: sectionAt(base, pass), song: sg, bs, beat, bars, notes: [], breakdown: false, fill: null, crash: false, ambient: sg.style === 'ambient' };
  if (out.ambient) return out;
  const sc = SCALES[sg.scale];
  const note = (d, oct = 0) => sg.root + sc[((d % 7) + 7) % 7] + 12 * (Math.floor(d / 7) + oct);
  const brk = out.breakdown = isBreakdown(base, pass);
  const add = (n) => out.notes.push(n);
  const d0 = drumsOf(sg);

  // the crash: the pass before ended on a fill (the engine carries it over in crashNext)
  if (pass > 0 && !brk) {
    const prev = sectionSong(base, sectionAt(base, pass - 1));
    if (!drumsOf(prev).roll && isFillPass(base, prev, pass - 1) && !isBreakdown(base, pass - 1)) out.crash = true;
  }
  if (!d0.roll && isFillPass(base, sg, pass)) out.fill = sg.fill ? { custom: true } : { style: AUTO_FILLS[Math.floor(pass / 2) % 3] };

  for (let bar = 0; bar < nb; bar++) {
    const barN = pass * nb + bar, deg = sg.prog[bar], chordN = bars[bar].chord;
    // pad: a chord a bar, or the gate's hits
    if (sg.padVoice !== 'none') {
      if (sg.gate) partBar(sg.gate, barN).forEach((g, k) => g && add({ lane: 'pad', row: 'pad', bar, k, len: g.len, midi: chordN[0], at: 0 }));
      else add({ lane: 'pad', row: 'pad', bar, k: 0, len: bs, midi: chordN[0], at: 0 });
    }
    // sound effects
    for (const fx of ['creak', 'owl']) if (sg[fx]) partBar(sg[fx], barN).forEach((g, k) => g && add({ lane: 'sfx', row: fx, bar, k, len: 1, at: sg.sfxAt || 0 }));
    // stabs
    if (sg.stab) partBar(sg.stab, barN).forEach((g, k) => g && add({ lane: 'stab', row: 'stab', bar, k, len: g.len, midi: chordN[0], at: sg.stabAt || 0 }));
    // bass
    if (!brk) {
      if (sg.bassLine) partBar(sg.bassLine, barN).forEach((b, k) => b && add({ lane: 'bass', row: 'bass', bar, k, len: b.len, v: b.v, midi: note(deg + b.v), at: 0 }));
      else {
        const steps = BASS_STEPS[sg.bass] || BASS_STEPS.eighths;
        steps.forEach((k, i) => { if (k < bs) { const up = sg.bassOct && i % 2 === 1; add({ lane: 'bass', row: 'bass', bar, k, len: 1, v: up ? 7 : 0, midi: note(deg) + (up ? 12 : 0), gen: true, at: 0 }); } });
      }
    }
    // drums
    if (!brk) {
      const last = bar === nb - 1, fillHere = last && !!out.fill;
      let d = d0, gen = !sg.beat, fillBar = false;
      if (fillHere && sg.fill) { d = beatOf({ beat: sg.fill }); gen = false; fillBar = true; }
      if (bar === 0 && out.crash) add({ lane: 'drums', row: 'crash', bar, k: 0, len: 1, gen: true, fill: true, at: 1 });
      for (let k = 0; k < bs; k++) {
        if (fillHere && !sg.fill && k >= bs - beat) {   // the automatic fill on the last beat
          const j = k - (bs - beat), st = Math.floor(pass / 2) % 3, f = { lane: 'drums', bar, k, len: 1, gen: true, fill: true, at: 1 };
          if (st === 0) { add({ ...f, row: j < beat / 2 ? 'ghost' : 'snare' }); if (j === beat - 1) add({ ...f, row: 'kick' }); }
          else if (st === 1) { add({ ...f, row: 'tom', v: Math.floor(j * 4 / beat) }); if (j === 0) add({ ...f, row: 'snare' }); }
          else { add({ ...f, row: j % 2 === 0 ? 'snare' : 'kick' }); if (j === beat - 1) add({ ...f, row: 'snare' }); }
          continue;
        }
        const h = { lane: 'drums', bar, k, len: 1, gen, fill: fillBar, at: 1 };
        if (d.kick.includes(k)) add({ ...h, row: 'kick' });
        if (d.snare.includes(k) || (d.roll && last && d.roll.includes(k))) add({ ...h, row: 'snare', fill: fillBar || (!d.snare.includes(k)) });
        if (d.clap && d.clap.includes(k)) add({ ...h, row: 'clap' });
        if (d.ghost && d.ghost.includes(k)) add({ ...h, row: 'ghost' });
        const fast = sg.tick ? urgency > 0.45 : level >= 3;
        if (d.hat.includes(k)) add({ ...h, row: 'hat' });
        else if (fast && k % 2 === 1) add({ ...h, row: 'hat', gen: true, boss: true, at: sg.tick ? 1 : 3 });
        if (d.open && d.open.includes(k)) add({ ...h, row: 'open' });
      }
    }
    // arp
    if (sg.arpLine) partBar(sg.arpLine, barN).forEach((a, k) => a && add({ lane: 'arp', row: 'arp', bar, k, len: a.len, v: clamp(a.v, 0, 5), midi: chordN[clamp(a.v, 0, 5) % 3] + 12 * (a.v >= 3 ? 2 : 1), at: 2 }));
    else for (let k = 0; k < bs; k++) {
      const order = sg.arp === 'mirror' ? (k < bs / 2 ? ARP_ORDERS.up : ARP_ORDERS.down) : ARP_ORDERS[sg.arp] || ARP_ORDERS.up;
      const v = order[k % order.length];
      add({ lane: 'arp', row: 'arp', bar, k, len: 1, v, midi: chordN[v % 3] + 12 * (v >= 3 ? 2 : 1), gen: true, at: 2 });
    }
    // melody, or the stock boss lead
    if (sg.melody) {
      const at = sg.melodyAt != null ? sg.melodyAt : 1;
      partBar(sg.melody, barN).forEach((m, k) => {
        if (!m) return;
        const midi = sg.root + 24 + 12 * (sg.melodyOct || 0) + sc[((m.v % 7) + 7) % 7] + 12 * Math.floor(m.v / 7);
        add({ lane: 'melody', row: 'melody', bar, k, len: m.len, v: m.v + 7 * (sg.melodyOct || 0), midi, at });
        add({ lane: 'melody', row: 'melody', bar, k, len: m.len, v: m.v + 7 * (sg.melodyOct || 0) + 7, midi: midi + 12, at: Math.max(at, 3), dbl: true });
      });
    } else LEAD_STEPS.forEach((k, i) => {
      if (k >= bs) return;
      const dg = deg + LEAD_DEGREES[(bar * LEAD_STEPS.length + i) % LEAD_DEGREES.length];
      add({ lane: 'melody', row: 'melody', bar, k, len: 2.6, v: dg, midi: note(dg, 2), gen: true, at: 3 });
    });
  }
  return out;
}

if (typeof module !== 'undefined') module.exports = { resolvePass, chordInfo, scaleNames, isFillPass, AUTO_FILLS };
