// NeoN+1 corps/fourthwall.js
'use strict';
NEON_FILES.push(['corps/fourthwall.js', 'v13.64']);
// Its boss mod: SPOILER (spoiler), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
function fwLines(top, colTop) {
  const chat = [];
  const killer = Object.entries(save.corpStats || {}).sort((a, b) => (b[1].lost || 0) - (a[1].lost || 0))[0];
  if (killer && killer[1].lost) chat.push(`> ${killer[1].lost} deaths to ${corpDef(killer[0]).name.toLowerCase()}. again?`);
  chat.push(`> ${save.runs} runs. ${save.wins} wins. hm.`);
  const m = st.run && st.run.mods.length ? MODS[st.run.mods[Math.floor(Math.random() * st.run.mods.length)]] : null;
  chat.push(m ? `> ${m.name.toLowerCase()}? bold choice.` : '> no mods? brave.');
  const d = new Date(), hh = d.getHours();
  chat.push(`> it's ${hh}:${String(d.getMinutes()).padStart(2, '0')}. ${hh >= 23 || hh < 5 ? 'go to bed.' : 'on company time?'}`);
  chat.push('> i can see your cursor, you know.');
  return { tell: `> ${FW_ZONE[top]}${colTop != null ? ` + col ${colTop + 1}` : ''}? not today.`, chat };
}
const FW_BUTTONS = ['  OK ', 'RETRY', ' SEND', ' HELP', ' [X] ', ' (x) ', ' [+] ', ' {x} ', ' [*] ', 'CLOSE', ' x   ', ' [k] '];

// ---- its music
// Made from DEADPAN: the same band, its own tune.
SONGS.helloyou = { name: 'HELLO YOU', from: 'deadpan', bpm: 132, root: 45, scale: 'minor', prog: [0, 0, 5, 4], kit: '808', pump: 0.3, gate: 'x...x...x...x...',
  beat: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..x...x...x...x.' },
  bassVoice: 'pluck', bassLine: '0 . 0 7 . 0 0 . 0 . 0 7 . 0 3 .',
  melody: ['4 . 4 . 4 . 5 . 4 - - - . . . .', '4 . 4 . 4 . 3 . 4 - - - . . . .', '3 . 3 . 3 . 4 . 5 - - - . . . .', '6 . 6 . 5 . 6 . 7 - - - . . . .'],
  leadVoice: 'chip', arpVoice: 'chip', arpLine: '. . . . 0 . . . . . . . 2 . . .' };
MUSIC_FOR.fourthwall = 'helloyou';

// ---- the corp
CORPS.fourthwall = {
  key: 'fourthwall', name: 'FOURTH WALL', code: 'FW', level: 5,
  intel: '"hi. yes, you. holding the phone."',
  tell: null, alwaysFollow: true,
  bossDesc: 'boss: runner.exe has stopped.',
  rules: () => 'it knows how you play.',
  mods: ['spoiler'],
  // It talks to you, not your runner, and it reads your save: your deaths, your mods, the
  // time. It knows where you like to pick (every pick you've ever made) and it hides the
  // real node somewhere else, and it says so. Deeper: your favorite column too. Boss: a
  // fake crash. The real node is the [x] that closes it.
  dress(lv, k) {
    const r = k.r;
    if (k.boss) {
      const btn = shuffle(FW_BUTTONS.slice(), r);
      k.tiles.forEach((t, i) => { t.glyph = normMotif(['', t === k.real ? ' [x] ' : btn[i % btn.length], '']); });
      lv.crash = true;
      return;
    }
    const hb = save.habits || { total: 0, corner: 0, edge: 0, middle: 0 };
    const zones = ['corner', 'edge', 'middle'].filter(z => k.tiles.some(t => cellZone(t, lv) === z));
    const top = hb.total >= 5 ? zones.slice().sort((a, b) => (hb[b] || 0) - (hb[a] || 0))[0] : pickR(zones, r);
    let colTop = null;
    if (k.tier >= 2) {
      colTop = randInt(r, 0, lv.cols - 1);
      if (hb.total >= 5) for (let c = 0; c < lv.cols; c++) if ((hb['c' + c] || 0) > (hb['c' + colTop] || 0)) colTop = c;
    }
    const ok = t => cellZone(t, lv) !== top && (colTop == null || t.col !== colTop);
    const q = k.real;
    if (!ok(q)) {
      const opts = k.tiles.filter(t => t !== q && ok(t));
      if (opts.length) { const sw = pickR(opts, r); for (const f of ['cell', 'col', 'row']) { const v = q[f]; q[f] = sw[f]; sw[f] = v; } }
      else {   // nobody to swap with: move the real node to an empty cell somewhere else
        const used = new Set(lv.tiles.map(t => t.cell)), free = [];
        for (let c = 0; c < lv.cols * lv.rows; c++) if (!used.has(c) && ok({ col: c % lv.cols, row: Math.floor(c / lv.cols) })) free.push(c);
        if (free.length) setCellOf(lv, q, pickR(free, r)); else colTop = null;
      }
    }
    lv.fw = fwLines(top, colTop);
  },
  fx(t, ft, lv) { return lv.crash ? { frame: ['+=====+', '+-----+'], side: '|' } : null; },
  async intro(lv) {
    if (!lv.crash) return;
    Sound.trap(); flash(C.bright, 0.3, 0.5); shake(6);
    setMsg('> runner.exe has stopped responding.', C.danger);
    await wait(400);
  },
  hint(lv, now) {
    if (lv.crash) return { text: Math.floor(now / 600) % 2 ? 'FATAL: runner.exe stopped' : 'FATAL: close this window', col: C.danger };
    if (!lv.fw) return null;
    const k = Math.floor(now / 3200);
    return { text: k % 2 === 0 ? lv.fw.tell : lv.fw.chat[(k >> 1) % lv.fw.chat.length], col: k % 2 === 0 ? C.bright : C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.fourthwall = "it knows where you like to pick (every pick you've made) and hides the real node somewhere else, and it tells you so. boss: the real node is the [x].";
