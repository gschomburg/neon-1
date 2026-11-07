// NeoN+1 corps/monty.js
'use strict';
NEON_FILES.push(['corps/monty.js', 'v14.57']);
// Its boss mod: THE DEAL (deal), defined with the others in data/mods.js (at the end of MODS), its effect below.
// Design: docs/CORPS.md A32 (Greg, 2026-11-07).

// ---- its own helpers
// MONTY's lines. Tier 1: blunt: when your door is the real one he talks you off it, when it isn't he's relaxed.
// Deeper: the same words either way, a question when you're right, a statement when you're wrong.
const MONTY_PUSH = ['are you SURE?', 'the other door looks good.', 'i would switch. just saying.', 'last chance to switch!'];
const MONTY_EASY = ['your call.', 'take your time.', 'no pressure, kid.', 'stay or switch. up to you.'];
const MONTY_WORDS = ['switch', 'last chance', 'your call', 'are you sure', 'stay or switch', 'take your time', 'big money'];
const montyDoor = (n, hide) => normMotif(['.---.', '|' + (hide ? ' ? ' : String(n).padStart(2).padEnd(3)) + '|', "'---'"]);
// What MONTY says: about your door being right (right), honest or not (a corp's tell isn't true every layer).
function montyLine(lv, right) {
  const M = lv.monty, r = layerRng('montyline'), push = M.honest ? right : !right;
  if (M.tier < 2 && !M.boss) return pickR(push ? MONTY_PUSH : MONTY_EASY, r);
  return pickR(MONTY_WORDS, r) + (push ? '?' : '.');
}

// The first pick: your door holds, MONTY opens the rest but one, says his line (the boss: then swaps the two).
async function montyOpen(lv, t) {
  const M = lv.monty;
  M.stage = 'opening'; M.mine = t;
  const real = lv.tiles[lv.safe], ice = lv.tiles.filter(o => o !== t && o.state === 'closed' && !o.safe);
  M.other = t.safe ? (ice.length ? pickR(ice, layerRng('montyother')) : null) : real;
  if (!M.other) { M.stage = 'decide'; setMsg('> MONTY: one door left. it\'s yours.', C.money); layerReady(lv); return; }
  setMsg('> MONTY: let\'s open some doors...', C.money);
  Sound.probe();
  await wait(450);
  for (const o of shuffle(lv.tiles.filter(o => o.state === 'closed' && o !== t && o !== M.other), layerRng('montyopen'))) {
    if (st.lv !== lv) return;
    lockTile(o, C.mid, 'monty');
    await wait(110);
  }
  await wait(300);
  M.line = montyLine(lv, !!t.safe);
  setMsg('> MONTY: ' + M.line, C.money);
  Sound.jingle && Sound.jingle();
  if (M.boss) {   // the boss: the numbers go, and the two doors swap places a few times
    M.hide = true;
    await wait(700);
    for (let k = 0; k < 3 + Math.floor(layerRng('montyswaps')() * 3); k++) {
      if (st.lv !== lv) return;
      const a = M.mine.cell, b = M.other.cell;
      slideTo(lv, M.mine, b, 420, 0.7); slideTo(lv, M.other, a, 420, -0.7);
      Sound.whoosh();
      await wait(slideMs(420) + 120);
    }
  }
  M.stage = 'decide';
  layerReady(lv);
}

// ---- its music
MUSIC_FOR.monty = 'velvetrope';   // VELVET ROPE (in data/music.js): a game show at the club

// ---- the corp
// ---- Its own pick rule (`tap`): the first tap picks a door (it holds); MONTY opens the rest but one; the next tap
// stays or switches (the normal pick).
CORPS.monty = {
  key: 'monty', name: 'MONTY', code: 'MY', level: 3, doors: true,
  intel: '"let\'s make a deal."',
  tell: null,
  bossDesc: 'boss: he swaps the doors while you think.',
  rules: () => 'pick a door. he opens the rest. stay or switch?',
  mods: ['deal'],
  dress(lv, k) {
    lv.tiles.forEach((t, i) => { t.door = i + 1; t.glyph = montyDoor(t.door); });
    lv.monty = { stage: 'pick', mine: null, other: null, honest: !!k.follow, tier: k.tier || 1, boss: !!k.boss, hide: false, line: '' };
  },
  tap(t) {
    const M = st.lv.monty;
    if (!M || M.stage !== 'pick') return false;   // deciding: your door or the other one, the normal pick
    montyOpen(st.lv, t);   // (it runs on; it hands the layer back when it's done)
    return true;
  },
  fx(t, live, lv) {
    const M = lv.monty;
    if (!M) return null;
    const glyph = montyDoor(t.door, M.hide);
    if (t === M.mine && !M.hide) return { glyph, fc: C.money, gc: C.money };   // your door
    return { glyph };
  },
  hint: lv => lv.monty ? { text: lv.monty.stage === 'pick' ? 'monty> pick a door.' : lv.monty.stage === 'decide' ? 'monty> stay or switch?' : 'monty> ...', col: C.money } : null,
};

// ---- its boss mod's effect: THE DEAL (the HIT stage, engine/mods.js; run from engine/run.js): once a layer, after
// your first ICE hit, every node goes dark but two: the real one and one other.
defineModFx('deal', 'hit', {
  hit(t) {
    const lv = st.lv, real = lv.tiles[lv.safe];
    if (lv.dealt || real.state !== 'closed') return false;
    const ice = lv.tiles.filter(o => o.state === 'closed' && !o.safe && !o.ruledOut);
    if (ice.length < 2) return false;
    lv.dealt = true;
    const keep = pickR(ice, layerRng('deal'));
    (lv.callouts = lv.callouts || []).push({ key: 'deal', text: '> the deal: two doors left.', fn: () => { for (const o of ice) if (o !== keep) o.ruledOut = true; } });
  },
});

// the codex, once you've beaten it
CORP_TELL.monty = "1. pick a door: it doesn't open. 2. MONTY opens every other door but one. 3. listen to him. when your door is the real one, he tries to talk you off it ('are you SURE?'); when it isn't, he's relaxed ('your call.'). deeper, he says the same things, but a question when you're right and a plain statement when you're wrong. he doesn't always tell the truth. 4. stay or switch. boss: the numbers go and he swaps the two doors around: keep your eye on yours.";
