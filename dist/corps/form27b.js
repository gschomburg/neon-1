// NeoN+1 corps/form27b.js
'use strict';
NEON_FILES.push(['corps/form27b.js', 'v13.20']);
// Its boss mod: QUEUE NUMBER (queuenumber), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// FORM 27B: the orders a form can ask for.
const FORM_ORDERS = [
  { name: 'in reading order', by: () => (a, b) => a.cell - b.cell },
  { name: 'backwards', by: () => (a, b) => b.cell - a.cell },
  { name: 'by columns', by: () => (a, b) => a.col - b.col || a.row - b.row },
  { name: 'bottom row up', by: () => (a, b) => b.row - a.row || a.col - b.col },
];

// ---- its music
// Made from MACHINE HEART: the same band, its own tune.
SONGS.triplicate = { name: 'IN TRIPLICATE', from: 'machineheart', bpm: 112, root: 45, scale: 'phrygian', prog: [0, 0, 1, 6], kit: 'industrial', pump: 0.2, padVoice: 'choir', breakdown: 4,
  beat: { kick: 'x...x...x...x...', snare: '....x.......x...', ghost: '.x.x.x.x.x.x.x.x', hat: '..x...x...x...x.' },
  bassVoice: 'picked', bassLine: '0 . 0 . 0 . 0 . 1 . 1 . 0 . 0 .',
  melody: ['0 . 0 . 0 . . . 1 - - - . . . .', '0 . 0 . 0 . . . -1 - - - . . . .', '3 . 3 . 3 . . . 4 - - - . . . .', '1 . 1 . 1 . . . 0 - - - . . . .'],
  melodyAt: 0, leadVoice: 'keys', arpVoice: 'pluck', arpLine: '0 . . 0 . . 0 . 1 . . 1 . . 2 .' };
MUSIC_FOR.form27b = 'triplicate';

// ---- the corp
// ---- Tier 2, group 5: new pick rules (corp `tap` takes over a tap; true = handled).
CORPS.form27b = {
  key: 'form27b', name: 'FORM 27B', code: 'FM', level: 4,
  intel: '"please take a number."',
  tell: null,
  bossDesc: 'boss: the form is longer.',
  rules: () => 'file in order: safe, -15% pay each.',
  mods: ['queuenumber'],
  // Paperwork. The form says the order to tap the nodes in (the next one is lit). A decoy
  // tapped in order is FILED: no damage, but a fee off the pay. Out of order: REJECTED, a hit,
  // unless you jumped the queue straight onto the real node.
  dress(lv, k) {
    const r = k.r, forms = k.boss ? FORM_ORDERS.slice(2) : k.tier >= 2 ? FORM_ORDERS.slice(1) : FORM_ORDERS.slice(0, 2);
    const f = pickR(forms, r);
    lv.form = { name: f.name, order: lv.tiles.slice().sort(f.by(lv)), fee: k.tier >= 2 || k.boss ? 0.2 : 0.15 };
  },
  tap(t) {
    const lv = st.lv, f = lv.form;
    if (!f) return false;
    const next = f.order.find(o => o.state === 'closed');
    if (t !== next || t.safe) {
      if (!t.safe) t.rejected = true;
      return false;   // the real node (in order or not) opens; out of order ICE is a hit
    }
    lockTile(t, C.accent, 'filed');
    if (t.loaded) setMsg('> FILED. ' + grantLoot(rngFor(st.run.seed, 'loot', st.corp.node.id, st.corp.idx), st.corp.tier), C.money);
    lv.payCut = Math.min(0.9, (lv.payCut || 0) + f.fee);
    if (!t.loaded) setMsg(`> FILED. pay -${Math.round(lv.payCut * 100)}%`, C.accent);
    st.busy = false; lv.readyAt = performance.now();
    return true;
  },
  fx(t, ft, lv) {
    const f = lv.form;
    return f && f.order.find(o => o.state === 'closed') === t ? { fc: C.accent } : null;
  },
  hint: lv => lv.form ? { text: `form 27B> file ${lv.form.name}`, col: C.accent } : null,
};

// the codex, once you've beaten it
CORP_TELL.form27b = "1. read the form on the hint row (the order to tap in). 2. tap nodes in that order (the next one is lit): ICE in order is FILED, no damage, but a fee off the pay. 3. a tap out of order is REJECTED and hits you, unless it's the real node: then you jumped the queue.";

// intro art
CORP_ART.form27b = [
  "   .----------.",
  "   | FORM 27B |",
  "   | [x] [ ]  |",
  "   | ____  ## |",
  "   '----------'",
  "  REJECTED. NEXT.",
];
