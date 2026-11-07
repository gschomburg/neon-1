// NeoN+1 corps/medix.js
'use strict';
NEON_FILES.push(['corps/medix.js', 'v14.54']);
// Its boss mod: TRIAGE (triage), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.vitals = { name: 'VITALS',         bpm: 60,  root: 44, scale: 'dorian',   prog: [0, 5, 3, 4], bass: 'pulse',   drums: 'break', arp: 'updown', echo: 0.5, feedback: 0.4, arpVoice: 'bell', bassVoice: 'sub', kit: 'industrial' };   // the user's mix, 2026-10-24
MUSIC_FOR.medix = 'vitals';

// ---- the corp
CORPS.medix = {
  key: 'medix', name: 'MEDIX', code: 'MD', level: 2,
  intel: '"this might sting a little."',
  tell: null,
  bossDesc: 'boss: no bruises. hits hurt.',
  rules: () => 'first ICE hit each layer: a bruise.',
  mods: ['triage'],
  // The real node has a heartbeat: lub-dub on a steady beat. Decoys flicker unevenly
  // (deeper: in twos, like a beat, but never on time). Boss: a faster heart.
  dress(lv, k) {
    k.tellTile.tell = true;
    lv.pulse = { per: k.boss ? 760 : 1000, irr: k.tier >= 2 || k.boss };
    k.tiles.forEach(t => { t.ph = Math.floor(k.r() * 1000); t.noise = k.r() * 100; });
  },
  fx(t, ft, lv) {
    const pl = lv.pulse;
    if (!pl) return null;
    if (t.tell) { const p = ((ft + t.ph) % pl.per) / pl.per; return p < 0.09 || (p > 0.2 && p < 0.29) ? { bright: true } : null; }
    const slot = Math.floor(ft / 120);
    return h01(t.noise, slot) < 0.09 || (pl.irr && h01(t.noise, slot - 2) < 0.09) ? { bright: true } : null;
  },
  // the first ICE hit in a layer only bruises (not on the boss)
  block(t, lv) {
    if (lv.boss || lv.bruised) return null;
    lv.bruised = true; Sound.shield(); flash(C.dangerDim, 0.14, 0.3); shake(3);
    return '> ICE. bruised. the next one hurts.';
  },
};

// ---- its boss mod's effect: TRIAGE (the END stage, engine/mods.js; run from engine/run.js)
defineModFx('triage', 'end', {
  // TRIAGE: a corp you beat heals 1; at full, +1 max integrity
  end() {
    const run = st.run, c = st.corp;
    if (!c.hasBoss || c.idx < c.counts.length) return false;
    if (zombie()) heal(1);
    else if (addItem('patch', 0)) { /* a PATCH on the belt (stores up) */ }
    else if (run.integrity < run.maxInt) run.integrity++;   // no room (or RAM DOUBLER): heal instead
    else { run.maxInt++; run.integrity++; }
    Sound.shield();
  },
});

// the codex, once you've beaten it
CORP_TELL.medix = "the real node has a steady heartbeat, lub-dub. decoys flicker unevenly. the first ICE hit each layer only bruises (not the boss).";
