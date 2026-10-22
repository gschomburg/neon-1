// NeoN+1 corps/headline.js
'use strict';
NEON_FILES.push(['corps/headline.js', 'v12.14']);
// Its boss mod: SCOOP (scoop), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
// HEADLINE's ticker.
const NEWS_VERBS = ['markets crash', 'mayor resigns', 'icebergs sighted', 'cats elected', 'stocks soar', 'aliens land', 'pizza recalled', 'drones strike'];
const NEWS_FILLER = ['LOCAL MAN WINS NOTHING', 'WEATHER: YES', 'EXPERTS BAFFLED', 'SPORTS: A TEAM WON', 'CELEB SAYS THING', 'NEW PHONE SAME AS OLD PHONE', 'TRAFFIC: BAD'];

// ---- its music
SONGS.newsdesk = { name: 'NEWS DESK',      bpm: 128, root: 48, scale: 'minor',    prog: [0, 3, 4, 4], bass: 'march',   drums: 'march', arp: 'up', tick: true };
MUSIC_FOR.headline = 'newsdesk';

// ---- the corp
CORPS.headline = {
  key: 'headline', name: 'HEADLINE NEWS', code: 'HN', level: 3,
  intel: '"if it bleeds, it leads."',
  tell: null,
  bossDesc: 'boss: rumors everywhere.',
  mods: ['scoop'],
  // A news ticker scrolls along the hint row. One headline says where the real node is.
  // Deeper: it only names a row or a column (BREAKING), and a RUMOR names a wrong one.
  // Boss: three rumors.
  dress(lv, k) {
    const r = k.r, t = k.tellTile;
    const fill = shuffle(NEWS_FILLER.slice(), r).slice(0, k.boss ? 1 : 2);
    const verb = () => pickR(NEWS_VERBS, r);
    let items;
    if (k.tier < 2 && !k.boss) items = [...fill, `${verb()}: ${ROW_NAMES(lv.rows, t.row)}, ${COL_NAMES(lv.cols, t.col)}`.toUpperCase()];
    else {
      const byRow = r() < 0.5, n = byRow ? lv.rows : lv.cols, at = byRow ? t.row : t.col, nm = i => (byRow ? ROW_NAMES(lv.rows, i) : COL_NAMES(lv.cols, i)).toUpperCase();
      const wrong = shuffle(Array.from({ length: n }, (_, i) => i).filter(i => i !== at), r).slice(0, k.boss ? 3 : 1);
      items = [...fill, `BREAKING: ${verb()} IN ${nm(at)}`, ...wrong.map(i => `RUMOR: ${verb()} IN ${nm(i)}`)];
    }
    lv.ticker = '+++ ' + shuffle(items, r).map(x => x.toUpperCase()).join(' +++ ') + ' ';
    t.tell = true;
  },
  hint(lv, now) {
    if (!lv.ticker) return null;
    const s2 = lv.ticker + lv.ticker, off = Math.floor((now - (lv.shownAt || now)) / 110) % lv.ticker.length;
    return { text: s2.slice(off, off + L.wc), col: C.accent };
  },
};

// the codex, once you've beaten it
CORP_TELL.headline = "one headline on the ticker says where the real node is. deeper, BREAKING names a row or column, and RUMOR names a wrong one.";

// intro art
CORP_ART.headline = [
  "  .--------------.",
  "  | HEADLINE  NEWS|",
  "  |  ____  ~~~~~  |",
  "  | |    | ~~~~~  |",
  "  '--------------'",
  "  +++ breaking +++",
];
