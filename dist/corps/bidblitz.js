// NeoN+1 corps/bidblitz.js
'use strict';
NEON_FILES.push(['corps/bidblitz.js', 'v12.14']);
// Its boss mod: SNIPE (snipe), defined with the others in data/mods.js (their order there
// decides reward rolls), its effect in engine/run.js or engine/active.js.

// ---- its own helpers
const AUCTION_CALLS = ['going once!', 'going twice!', 'do I hear 10?', 'bid now! BID NOW!', 'look at this ICE!'];
const AUCTION_SOLD = ['SOLD!', 'SOLD to the runner!', 'SOLD! another?', 'what a steal!'];

// ---- its music
SONGS.pennybid = { name: 'PENNY BID',      bpm: 140, root: 48, scale: 'major',    prog: [0, 4, 5, 3], bass: 'gallop',  drums: 'four',  arp: 'updown', tick: true };
MUSIC_FOR.bidblitz = 'pennybid';

// ---- the corp
// ---- Tier 2, group 4: corps with a button on the hint row (corp `action`) or a choice.
CORPS.bidblitz = {
  key: 'bidblitz', name: 'BIDBLITZ LIVE', code: 'BB', level: 3,
  intel: '"going once! going twice!"',
  tell: null,
  bossDesc: 'boss: prices are up.',
  rules: () => 'no tell. bid: lock 1 ICE, -15% pay.',
  mods: ['snipe'],
  // No tell: you buy information. Each bid locks one ICE, costs more than the last (it's
  // a penny auction) and cuts the pay. The host shouts on the hint row.
  dress(lv, k) { lv.auction = { price: k.boss ? 15 : 10, step: 5, bids: 0 }; },
  hint(lv, now) {
    if (!lv.auction) return null;
    const a = lv.auction, shout = a.bids ? AUCTION_SOLD[(a.bids - 1) % AUCTION_SOLD.length] : AUCTION_CALLS[Math.floor(now / 1800) % AUCTION_CALLS.length];
    return { text: shout, col: C.accent };
  },
  action(lv) {
    const a = lv.auction;
    if (!a) return null;
    return { label: `BID ${a.price}cr`, ok: st.run.credits >= a.price && candidates().length > 1, use() {
      const ice = lv.tiles.filter(t => !t.safe && !t.loaded && t.state === 'closed');
      if (!ice.length) return;
      st.run.credits -= a.price; a.bids++; a.price += a.step;
      lv.payCut = Math.min(0.9, (lv.payCut || 0) + 0.15);
      lockTile(pickR(ice, rngFor(st.run.seed, 'bid', st.corp.node.id, st.corp.idx, a.bids)), C.money, 'bid');
      setMsg(`> SOLD! 1 ICE. pay -${Math.round(lv.payCut * 100)}%`, C.money);
    } };
  },
};

// the codex, once you've beaten it
CORP_TELL.bidblitz = "no tell. bid to lock ICE: every bid costs more than the last and cuts the pay. SNIPE: hold 100cr and the first lock is free.";

// intro art
CORP_ART.bidblitz = [
  "    __",
  "   |__|____",
  "      |    SOLD!",
  "     _|_",
  "  B I D B L I T Z",
];
