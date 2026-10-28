// NeoN+1 engine/help.js: HOW TO PLAY.
'use strict';
NEON_FILES.push(['engine/help.js', 'v13.64']);

// ---------------- How to play ----------------
const HELP_PAGES = [
  { title: 'THE BASICS', tab: 'BASIC',
    paragraph: 'each layer is a grid of nodes. one is the real node, the rest are ICE. ' +
      'guess which node is real and tap it. hit ICE and you lose 1 integrity, then guess again. ' +
      "at 0 integrity you're out. find it on the first try for a PERFECT: +1 integrity and more credits.",
    nodeTile: true, lootTile: true },
  { title: 'THE NET', tab: 'NET', build: buildNetPage },
  { title: 'THE TRAY', tab: 'TRAY', build: buildTrayPage },
  { title: 'ADVANCED', tab: 'MORE', build: buildAdvancedPage },
];

// ---- How to play page builders. One style everywhere: section headers in the
// accent color, plain text under them, game things drawn the way they look in game.
const HELP_W = 32;
function helpKit(T, X) {
  const H = text => X({ text: text.padEnd(HELP_W), col: C.accent, bold: true });
  const P = (str, indent = 0) => wrapText(str, HELP_W - indent).forEach(l => T((' '.repeat(indent) + l).padEnd(HELP_W), C.text));
  return { H, P };
}

// A small overworld sample, drawn like the real map.
function netSample() {
  // 4 node rows (start, two layers, the final), 4 rows apart so the links read.
  const W = HELP_W, H = 13, rows = Array.from({ length: H }, () => Array(W).fill(' '));
  const cols = Array.from({ length: H }, () => Array(W).fill(null));
  const lanes = [5, 16, 27], R = [12, 8, 4, 0];
  const node = (lane, r, ch, col) => { const x = lanes[lane] - 1; [...`[${ch}]`].forEach((c, i) => { rows[R[r]][x + i] = c; cols[R[r]][x + i] = col; }); };
  // dotted link, like the real map; links you can take right now are brighter
  const link = (la, ra, lb, rb, col = C.dim) => {
    const dy = R[ra] - R[rb];
    for (let k = 1; k < dy; k++) {
      const f = k / dy, y = R[ra] - k;
      const x = Math.round(lanes[la] + (lanes[lb] - lanes[la]) * f);
      rows[y][x] = '·'; cols[y][x] = col;
    }
  };
  [0, 1, 2].forEach(l => link(1, 0, l, 1, C.mid));            // start -> layer 1 (all open)
  link(0, 1, 0, 2); link(0, 1, 1, 2); link(1, 1, 1, 2);        // layer 1 -> layer 2 (branching)
  link(2, 1, 1, 2); link(2, 1, 2, 2);
  [0, 1, 2].forEach(l => link(l, 2, 1, 3));                    // layer 2 -> final
  node(1, 0, '>', C.accent);
  rows[R[0]][lanes[1] - 3] = '@'; cols[R[0]][lanes[1] - 3] = C.bright;
  node(0, 1, 'P', C.bright); node(1, 1, '$', C.bright); node(2, 1, 'S', C.bright);
  node(0, 2, '+', C.bright); node(1, 2, 'C', C.bright); node(2, 2, '?', C.bright);
  node(1, 3, '!', C.danger);
  return rows.map((r, y) => ({ text: r.join(''), colorAt: i => cols[y][i] || C.dim }));
}

function buildNetPage(T, X) {
  const { H, P } = helpKit(T, X);
  T('THE NET'.padEnd(HELP_W), C.bright);
  T('');
  P('the net is a map you climb from the bottom to OMNI//CORE at the top. ' +
    'each step, pick a node linked to the one you are on (some link sideways too). every stop pays out a mod or loot.');
  T('');
  for (const ln of netSample()) X(ln);
  T('');
  X({ text: '@ you are here   [!] the final'.padEnd(HELP_W), colorAt: i => i === 0 ? C.bright : i >= 17 && i <= 19 ? C.danger : C.mid });
  T('');
  H('STOPS');
  const stop = (ch, name, desc) => {
    X({ text: `[${ch}]  ${name}`.padEnd(HELP_W), colorAt: i => i < 3 ? C.bright : C.money, bold: true });
    P(desc, 5);
  };
  stop('$', 'BLACK MARKET', 'buy gear, mods and repairs. REROLL for new offers, SELL your gear.');
  stop('?', 'DATA CACHE', 'free loot, then pick a mod.');
  stop('+', 'SAFEHOUSE', 'heal 2 integrity, then pick a mod.');
  T('');
  H('CORPS');
  P('4 layers and a boss. each corp hides the real node its own way: its tell. the quote on the map is a hint.');
  for (const d of [CORPS.perimeter, CORPS.sigil, CORPS.chronos, CORPS.mirror, FINAL]) {
    X({ text: `${corpCode(d)}  ${d.name}`.padEnd(HELP_W), colorAt: i => i < 3 ? (d === FINAL ? C.danger : C.bright) : C.text });
  }
  P('beat a corp to log its tell in the CODEX.');
  T('');
  H('SECTORS');
  P('beating OMNI//CORE clears the sector. CASH OUT to end the run and bank REP, or PUSH ON: the net goes on from there, a little harder each sector. die and you bank nothing.');
  P('spend REP on THE BOARD, from the title screen.');
}

// ADVANCED: the things the other pages and the training don't cover (the user, 2026-10-26).
function buildAdvancedPage(T, X) {
  const { H, P } = helpKit(T, X);
  T('ADVANCED'.padEnd(HELP_W), C.bright);
  T('');
  H('INT');
  P("INT is your integrity: your health. ICE takes 1 (a boss can take more), a perfect pick heals 1. at 0 you're traced and the run is over.");
  T('');
  H('THE SEED');
  P('every run grows from a seed: the same seed makes the same map, the same corps and the same layers. the title shows yours: tap it to roll a new one. after a run, RETRY SEED plays the same one again (as practice).');
  T('');
  H('REPUTATION (REP)');
  P('cash out and you bank REP: for how deep you got, the corps you breached, your perfects, the credits you earned and the sectors you cleared. die and you bank nothing. spend REP at THE BOARD on upgrades for every run after.');
  T('');
  H('SECTOR EVENTS');
  P('from sector 2 on, every sector rolls an event: a card tells you what it is when the sector starts (tap the sector name on the map to see it again). most events put an anomaly on some of its corps, and on its boss; others change the whole sector: one corp everywhere, cheap markets, more loot, clocks that cost money.');
  T('');
  H('ANOMALIES');
  P('a corp with an anomaly carries a tag next to its code. each one changes how that corp plays:');
  for (const m of Object.values(ANOMALIES)) X({ text: `${m.tag} ${m.name.padEnd(8)} ${m.desc}`.slice(0, HELP_W).padEnd(HELP_W), colorAt: i => i === 0 ? C.money : i < 10 ? C.accent : C.text });
  T('');
  H('THE UPLINK');
  P('beat a sector boss and you can push on to the next sector, but carrying your mods costs bandwidth: every mod has a fee by its rarity. keep what you can pay for, sell the rest, or cash out.');
}

function buildTrayPage(T, X) {
  const { H, P } = helpKit(T, X);
  T('THE TRAY'.padEnd(HELP_W), C.bright);
  T('');
  P('the bar at the bottom of the screen. it looks like this:');
  T('');
  X({ trayDemo: 'rule' }); X({ trayDemo: 'mods' }); X({ trayDemo: 'modinfo' }); X({ trayDemo: 'items' }); X({ trayDemo: 'iteminfo' });
  T('');
  H('MODS');
  P('upgrades that last the whole run. you get them at every stop. you can hold 6; find one you have and it upgrades instead. tap-to-use ones show as [buttons].');
  T('');
  H('TRIGGER ORDER');
  P('every mod fires at one stage of a pick. the stages go in this order:');
  for (const k of Object.keys(STAGES).filter(k => STAGES[k].order)) {
    const s = STAGES[k], head = `${s.order}.${s.label}`;
    X({ text: `${head.padEnd(14)}${s.desc}`.slice(0, HELP_W).padEnd(HELP_W), colorAt: i => i < 14 ? C.accent : C.text });
  }
  P('inside a stage, mods fire left to right on the bar. a corp\'s own tricks go after your mods. BLOCK is the one exception: free blocks first, then FWALL, and FAILSAFE last.');
  P('the codex shows each mod\'s stage.');
  T('');
  H('GEAR');
  P('single use, in the slots below the mods. you start with one PURGE. the same gear stacks in one slot (PURGEx3). some corp bosses give a stack of their own legendary gear (FLAREx3); a boss reward can be a stack of market gear too.');
  T('');
  H('USING THEM');
  P('tap a mod or gear to see what it does, tap again to use it. on desktop, hover for info; number keys use gear.');
  T('');
  H('MOD RARITY');
  const ex = { scrap: 'the basics', common: 'small perks', rare: 'solid upgrades', epic: 'build-defining', legendary: 'boss mods, top upgrades', exotic: 'they bend the rules' };
  for (const r of Object.keys(RARITY)) X({ text: `${RARITY[r].label.padEnd(7)} ${ex[r]}`.padEnd(HELP_W), col: C.text, chips: true });
}

function openHelp() {
  let page = 0, top = 0;   // top: first content line shown (pages scroll when they're too tall)
  const show = i => { page = (i + HELP_PAGES.length) % HELP_PAGES.length; top = 0; st.boardStart = performance.now(); Sound.tick(); };
  const go = d => show(page + d);
  const CONTENT_ROWS = 30;   // the content window; every tab uses the same height (screen is full height)
  const rowsOf = ln => ln.box ? (ln.sub ? 4 : 3) : ln.tileInfo ? TILE_H : 1;

  // A page's content as lines (built fresh each frame).
  function pageContent(p) {
    const out = [];
    const T = (text, col = C.text) => out.push({ text, col });
    const X = ln => out.push(ln);
    if (p.build) { p.build(T, X); return out; }
    // Sectioned pages skip the title (the tab names the page) and space their own sections.
    if (!p.sections) { T(p.title.padEnd(HELP_W), C.bright); T(''); }
    if (p.lines) for (const [text, col] of p.lines) T(text, col ? C[col] : C.text);
    // A paragraph, wrapped into a left-aligned block.
    if (p.paragraph) for (const l of wrapText(p.paragraph, 32)) T(l.padEnd(32), C.text);
    // A node, cycling through the glyph designs nodes can have.
    if (p.nodeTile) {
      T('');
      const glyph = MOTIFS[Math.floor(performance.now() / 1100) % MOTIFS.length];
      X({ tileInfo: glyph, lines: [
        { text: 'NODE', col: C.accent }, { text: 'one per layer is real,', col: C.text },
        { text: 'the rest are ICE.', col: C.text }, { text: 'the glyph can be a clue:', col: C.text },
        { text: "a corp's tell.", col: C.mid },
      ] });
    }
    // Labeled sections: label column in the accent color, plain text beside it.
    if (p.sections) for (const [label, ...body] of p.sections) {
      T('');   // a gap before each section
      body.forEach((b, i) => X({ text: ((i === 0 ? label : '').padEnd(9) + b).padEnd(34), colorAt: c => c < 9 ? C.accent : C.text }));
    }
    // The loot node, drawn the way it looks on the board.
    if (p.lootTile) {
      T('');
      X({ tileInfo: LOOT_GLYPH, frameCol: C.dangerDim, glyphCol: C.money, lines: [
        { text: 'LOOT NODE', col: C.accent }, { text: 'always ICE: costs 1', col: C.text },
        { text: 'integrity, but drops', col: C.text }, { text: 'credits or gear.', col: C.text },
        { text: 'a trade, not a trap.', col: C.mid },
      ] });
    }
    if (p.rarity) {
      T('mods and gear come in six tiers:');
      T('');
      const ex = { scrap: 'the basics.', common: 'small perks.', rare: 'solid upgrades.', epic: 'build-defining.', legendary: 'boss mods, top upgrades.', exotic: 'they bend the rules.' };
      for (const r of Object.keys(RARITY)) X({ text: `${RARITY[r].label.padEnd(7)} ${ex[r]}`.padEnd(30), col: C.text, chips: true });
    }
    return out;
  }

  // Content as single rows: tiles are split into their 5 rows, so scrolling moves
  // one row at a time.
  const flatRows = p => pageContent(p).flatMap(ln => ln.tileInfo ? Array.from({ length: TILE_H }, (_, k) => ({ tileRow: k, tile: ln })) : [ln]);
  const maxTopOf = rowsArr => maxTop(rowsArr.length, CONTENT_ROWS);
  const scrollBy = d => {
    const rowsArr = flatRows(HELP_PAGES[page]);
    const nt = nextTop(top, d, maxTopOf(rowsArr));
    if (nt !== top) { top = nt; Sound.tick(); }
  };

  openPanel('HOW TO PLAY', (T, B, X, lines) => {
    const p = HELP_PAGES[page];
    T('HOW TO PLAY', C.accent);
    X({ gap: 1, row: HELP_PAGES.map((hp, i) => ({ text: `[${hp.tab}]`, id: 'htab' + i, sel: i === page, onTap: () => show(i) })) });
    T(SEP, C.dim);
    const rowsArr = flatRows(p);
    top = clamp(top, 0, maxTopOf(rowsArr));
    const w = listWindow(top, rowsArr.length, CONTENT_ROWS);
    // The up row is always the window's first row, the down row always its last.
    let used = 0;
    if (w.hasUp) { X({ text: '[ ^ ^ ^  more  ^ ^ ^ ]', invert: true, id: 'hup', onTap: () => scrollBy(-1) }); used++; }
    for (let i = top; i < top + w.shown; i++) { X(rowsArr[i]); used++; }
    for (; used < CONTENT_ROWS - (w.hasDown ? 1 : 0); used++) T('');
    if (w.hasDown) X({ text: '[ v v v  more  v v v ]', invert: true, id: 'hdn', onTap: () => scrollBy(1) });
    T(SEP, C.dim);
    X({ row: [{ text: '[ TRAINING ]', id: 'tutorial', onTap: startTutorial }, { text: '[ BACK ]', id: 'back', onTap: () => swapTo(showTitle) }] });
  }, '> manual loaded.', { full: true });
  st.scroll = scrollBy;   // mouse wheel and swipe
  // Keys: left/right or 1-4 = tabs, up/down = scroll (when the page scrolls), esc = back.
  st.keyHandler = k => {
    const focusTab = () => { st.kbFocus = st.hoverBtn = 'htab' + page; };   // cursor follows the active tab
    if (k === 'arrowleft') { go(-1); focusTab(); return true; }
    if (k === 'arrowright') { go(1); focusTab(); return true; }
    if (/^[1-9]$/.test(k) && Number(k) <= HELP_PAGES.length) { show(Number(k) - 1); focusTab(); return true; }
    // Scrolling pages: up/down scroll; past the bottom the cursor moves to BACK, and up
    // from BACK resumes scrolling. At the very top, up puts the cursor on the tab.
    if ((k === 'arrowup' || k === 'arrowdown') && maxTopOf(flatRows(HELP_PAGES[page])) > 0) {
      const max = maxTopOf(flatRows(HELP_PAGES[page]));
      const focus = (id) => { st.kbFocus = st.hoverBtn = id; Sound.tick(); };
      const unfocus = () => { st.kbFocus = st.hoverBtn = null; };
      if (k === 'arrowdown') {
        if (st.kbFocus === 'back') return true;
        if (st.kbFocus && st.kbFocus.startsWith('htab')) unfocus();
        if (top < max) scrollBy(1); else focus('back');
      } else {
        if (st.kbFocus === 'back') { unfocus(); Sound.tick(); return true; }
        if (top > 0) scrollBy(-1); else focus('htab' + page);
      }
      return true;
    }
    if (k === 'escape') { swapTo(showTitle); return true; }
    return false;
  };
}
