// NeoN+1 engine/pet.js: the pet (data/pets.js has its looks, names and lines). st.run.pet = { kind, name }: yours for
// the run once you have one (COMPANION gives one; the pet isn't tied to it). It lives on the tray line: walks back
// and forth, sits now and then, sleeps when you've been idle, dances on the beat when the music plays, runs over when
// it sniffs something out (COMPANION), and a tap pets it. Looks only: it never changes play.
'use strict';
NEON_FILES.push(['engine/pet.js', 'v13.79']);

// A pet for this run (when you take COMPANION, or anything else that gives one later): a cat or a dog, and a name.
function petRoll(run, why = 'pet') {
  if (run.pet) return run.pet;
  const r = rngFor(run.seed, why, run.depth || 0, (run.mods || []).length);
  run.pet = { kind: r() < 0.5 ? 'cat' : 'dog', name: pickR(PET_NAMES, r) };
  if (st.mode === 'play' || st.mode === 'map' || st.mode === 'panel') setTimeout(() => setMsg(`> ${run.pet.name} the ${run.pet.kind} follows you.`, C.accent), 400);
  return run.pet;
}
const petOf = () => (st.run && !st.run.ended && st.run.pet) || null;
// Mirrored (facing left)
const PET_FLIP = { '(': ')', ')': '(', '/': '\\', '\\': '/', '<': '>', '>': '<', '[': ']', ']': '[', '{': '}', '}': '{' };
const petFlip = l => [...l].reverse().map(c => PET_FLIP[c] || c).join('');
// Its state (not saved: it starts fresh after a reload)
const petS = () => st.petS || (st.petS = { x: 6, dir: 1, mode: 'walk', until: 0, sitUntil: 0, heartAt: 0, sniffX: null, sniffAt: 0 });

// You petted it: a heart and a little sound (the record counts it: there's a feat).
function petPet() {
  const p = petOf(); if (!p) return;
  const s = petS(); s.heartAt = performance.now(); s.sitUntil = s.heartAt + 1500;
  Sound.tick(); setTimeout(() => Sound.tick(), 90);
  floatText('<3', pxX(s.x + 3), pxY(s.y != null ? s.y - 1 : L.hc - 8), C.danger, 1.2);
  tally('pets');
}
// COMPANION sniffed out an ICE: it runs over under that node.
function petSniff(t) {
  if (!petOf() || !t) return;
  const s = petS(), { tx } = tileOrigin(t);
  s.sniffX = tx; s.sniffAt = performance.now();
}
// A hacker came in: maybe a line about the pet (data/pets.js PET_LINES), about half the time.
function petHacker(h) {
  const p = petOf(); if (!p || Math.random() < 0.5) return;
  const pool = PET_LINES[h.id] || (h.side === 'bad' ? PET_LINES.rival[p.kind] : null);
  if (!pool) return;
  const line = pickR(pool, Math.random).replace(/\{pet\}/g, p.name).replace(/\{hk\}/g, hkName(h.id).toLowerCase());
  setTimeout(() => { if (petOf()) setMsg('> ' + line, C.accent); }, 2500);
}

// Drawn on the rule over the tray (y = the rule; its top line sits just above). In play and on the map.
function buildPet(ctx, y) {
  const p = petOf();
  if (!p || (st.mode !== 'play' && st.mode !== 'map') || st.mp) return;
  const { now, put, addHit } = ctx, s = petS(), look = PETS[p.kind] || PETS.cat;
  s.y = y;
  const w = 9, maxX = Math.max(1, L.wc - w - 1), idle = now - (st.lastInput || now);
  const beat = Music.beat && save.musicOn && Music.beat();
  let frame, mode;
  if (s.sniffX != null && now - s.sniffAt < 2600) {   // COMPANION: run over, then look
    mode = 'sniff';
    const tx = clamp(s.sniffX, 0, maxX);
    if (Math.abs(tx - s.x) > 0.5) { s.dir = tx > s.x ? 1 : -1; s.x += s.dir * 0.6; frame = look.walk[Math.floor(now / 120) % 2]; }
    else frame = look.alert;
  } else if (now < s.sitUntil) { mode = 'happy'; frame = look.happy; }
  else if (idle > 15000) { mode = 'sleep'; frame = look.sleep; }
  else if (beat && beat.ms > 0 && Math.floor(now / 9000) % 3 === 0) { mode = 'dance'; frame = look.dance[(((beatClock(now).n % 2) + 2) % 2)]; }   // (the beat count can be -1 just before a beat: keep it 0 or 1)
  else {
    if (s.mode === 'sit' && now < s.until) { mode = 'sit'; frame = look.sit; }
    else {
      if (s.mode === 'sit' || now > s.until) { s.mode = Math.random() < 0.3 && s.mode !== 'sit' ? 'sit' : 'walk'; s.until = now + (s.mode === 'sit' ? 2500 + Math.random() * 3000 : 4000 + Math.random() * 5000); }
      mode = s.mode;
      if (mode === 'walk') {
        s.x += s.dir * 0.05;
        if (s.x <= 0 || s.x >= maxX) { s.x = clamp(s.x, 0, maxX); s.dir = -s.dir; }
        frame = look.walk[Math.floor(now / 260) % 2];
      } else frame = look.sit;
    }
  }
  if (mode !== 'sniff') s.sniffX = null;
  if (!frame) frame = look.sit;   // (never draw nothing: a missing frame used to stop the whole game)
  const x = Math.round(s.x), rows = s.dir < 0 && (mode === 'walk' || mode === 'sniff') ? frame.map(petFlip) : frame;
  rows.forEach((l, k) => put(x, y - 1 + k, l, mode === 'sleep' ? C.mid : C.bright, 'fx', false));
  if (mode === 'sleep') put(x + 7, y - 2 - (Math.floor(now / 700) % 2), 'z', C.mid, 'fx');
  if (mode === 'sniff' && now - s.sniffAt > 900) put(x + 3, y - 2, '!', C.accent, 'fx', true);
  if (now - s.heartAt < 900) put(x + 3, y - 2 - Math.floor((now - s.heartAt) / 300), '<3', C.danger, 'fx', true);
  addHit(x, y - 1, w, 2, { kind: 'btn', id: 'pet', onTap: petPet, noFocus: true });
}
