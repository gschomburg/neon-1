// NeoN+1 corps/demolition.js
'use strict';
NEON_FILES.push(['corps/demolition.js', 'v12.21']);
// Its boss mod: CONTROLLED BLAST (blast), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its music
SONGS.wreckingball = { name: 'WRECKING BALL', bpm: 100, root: 38, scale: 'minor',   prog: [0, 6, 5, 4], bass: 'eighths', drums: 'heavy', arp: 'up' };
MUSIC_FOR.demolition = 'wreckingball';

// ---- the corp
CORPS.demolition = {
  key: 'demolition', name: 'DEMOLITION CO', code: 'DM', level: 4,
  intel: '"everything must go. almost."',
  tell: null,
  bossDesc: 'boss: the numbers fade.',
  rules: () => 'break all the ICE. not the real one.',
  mods: ['blast'],
  // Reverse rules, like minesweeper. Tapping ICE breaks it safely and it shows a number: 1 if
  // the real node is next to it (diagonals too), 0 if not. Clear every ICE to pass. Tap the
  // real node and it hurts (the layer passes, no pay). Boss: the numbers fade after a second.
  dress(lv) { lv.demo = true; },
  tap(t) {
    const lv = st.lv, run = st.run, q = lv.tiles[lv.safe];
    if (!lv.demo) return false;
    if (t.safe) {
      lv.misses++;
      setMsg(blockHit(t, lv.tiles.indexOf(t)) + ' that was the real one.', C.danger);
      lv.payCut = 1; lv.scanned = true;
      (async () => { await failsafeBeat(lv); await wait(450); if (run.integrity <= 0) return die(); await onSafe(t); })();
      return true;
    }
    t.state = 'locked'; t.lockedBy = 'demo'; t.hitAt = performance.now();
    t.demoN = Math.max(Math.abs(q.col - t.col), Math.abs(q.row - t.row)) === 1 ? 1 : 0;
    const { x, y } = tileCenter(t);
    explode(snapshot(c => c.own === 't' + lv.tiles.indexOf(t)), x, y, { col: C.accent, power: 0.7 });
    Sound.shatter(); shake(3);
    setMsg(t.loaded ? '> boom. ' + grantLoot(rngFor(run.seed, 'loot', st.corp.node.id, st.corp.idx), st.corp.tier) : `> boom. ${t.demoN ? 'something is next to it.' : 'clear.'}`, t.loaded ? C.money : C.accent);
    if (!lv.tiles.some(o => !o.safe && o.state === 'closed')) { onSafe(q); return true; }
    st.busy = false; lv.readyAt = performance.now();
    return true;
  },
};

// the codex, once you've beaten it
CORP_TELL.demolition = "reverse rules: break all the ICE, not the real one. broken ICE shows 1 if the real node is next to it (diagonals too), 0 if not. tapping the real node hurts. boss: the numbers fade.";

// intro art
CORP_ART.demolition = [
  "        __",
  "   ____|  |___",
  "  |  BOOM!   |=o",
  "  '----------'",
  "  D E M O L I T I O N",
];
