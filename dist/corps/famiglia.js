// NeoN+1 corps/famiglia.js
'use strict';
NEON_FILES.push(['corps/famiglia.js', 'v13.07']);
// Its boss mod: OMERTA (omerta), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.omerta = { name: 'OMERTA',         bpm: 84,  root: 43, scale: 'harmonic', prog: [0, 3, 4, 0], bass: 'march',   drums: 'half',  arp: 'down' };
MUSIC_FOR.famiglia = 'omerta';

// ---- the corp
CORPS.famiglia = {
  key: 'famiglia', name: 'LA FAMIGLIA', code: 'FA', level: 3,
  intel: '"nice node you got. shame if..."',
  tell: null,
  bossDesc: 'boss: protection costs 25cr.',
  rules: () => 'protection: 15cr locks 1 ICE.',
  mods: ['omerta'],
  // Protection money: once a layer, 15cr locks one ICE. After every miss, a decoy snitches:
  // another decoy is ratted out (dimmed, ruled out).
  dress(lv, k) { lv.protect = { price: k.boss ? 25 : 15, paid: false }; },
  action(lv) {
    const pr = lv.protect;
    if (!pr) return null;
    return { label: pr.paid ? 'PAID' : `PROTECT ${pr.price}cr`, ok: !pr.paid && canSpend(pr.price) && candidates().length > 1, use() {
      const ice = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
      if (!ice.length) return;
      st.run.credits -= pr.price; pr.paid = true;
      lockTile(pickR(ice, rngFor(st.run.seed, 'protect', st.corp.node.id, st.corp.idx)), C.money, 'protect');
      setMsg('> a pleasure. 1 ICE gone.', C.money);
    } };
  },
  onHit() {
    const lv = st.lv, opts = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed' && !t.ruledOut);
    if (opts.length < 2) return;
    const rat = pickR(opts, rngFor(st.run.seed, 'rat', st.corp.node.id, st.corp.idx, lv.misses));
    rat.ruledOut = true; rat.glyph = normMotif(['', 'RAT', '']);
    setMsg(`${st.msg} a decoy snitched.`, C.danger);
  },
};

// the codex, once you've beaten it
CORP_TELL.famiglia = "protection money: once a layer, pay to lock 1 ICE. after every miss, a decoy snitches on another (RAT: ruled out).";

// intro art
CORP_ART.famiglia = [
  "     _____",
  "   _|_____|_",
  "    ( -_- )",
  "     /|$|\\",
  "  LA  FAMIGLIA",
];
