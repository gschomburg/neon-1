// NeoN+1 data/events.js: anomalies (a tag on one corp) and sector events (what each sector rolls).
// The design: docs/SECTOR_EVENTS.md. Sector 1 has no event; every sector after rolls one (seeded, no repeats).
'use strict';
NEON_FILES.push(['data/events.js', 'v14.49']);

// Anomalies: a tag on a corp node on the map. It changes how that corp plays. tag: the mark next to the node.
const ANOMALIES = {
  cursed:   { name: 'CURSED',   tag: '!', desc: 'no perfect heals here.' },
  rush:     { name: 'RUSH',     tag: '>', desc: 'every layer has a 10s clock.' },
  loaded:   { name: 'LOADED',   tag: '$', desc: 'more $ nodes. pays x1.2' },
  branded:  { name: 'BRANDED',  tag: 's', desc: 'some ICE wear a sigil.' },
  thief:    { name: 'THIEF',    tag: '&', desc: 'hits steal mods. THE FENCE has them.' },
  armored:  { name: 'ARMORED',  tag: '#', desc: 'hits point at the real.' },
  rival:    { name: 'RIVAL',    tag: 'V', desc: 'a rival races you for it.' },
  blinders: { name: 'BLINDERS', tag: '*', desc: 'you find out when you get in.' },
  blackice: { name: 'BLACK ICE', tag: 'B', desc: 'some ICE drops you to 1 INT.' },
  // H3AV3N (quest: only on the H3AV3N seed, never rolled; engine/heaven.js THE MOLD IN THE CORPS)
  mold:     { name: 'M0LD',     tag: '%', desc: "mold grows over the board. tap [b].", quest: true },
};

// Sector events. kind 'anomaly': puts its anomaly on a share of the sector's corps (an exact count) and on the
// sector boss ('any': a random one each). kind 'sector': changes the whole sector, no tags. share grows by
// 10% a sector after the 2nd (up to 80%). art: 5 x 3, glyph-sized (placeholders; the user draws the real ones).
// lines: the card's text, 27 characters a line at most; {pct} = the share, {sale} = FIRE SALE's cut,
// {cr} = TIME IS MONEY's credits a second. How often each one rolls: ECON.eventOdds (data/economy.js), scaled by
// EVENT_SCALES (below). feel: good / bad / mixed. map: it changes the map's shape (one of those a sector at most).
const SECTOR_EVENTS = {
  // HAD3S (quest: only on the HAD3S seed, both sectors; never rolled): d0g in some of the corps and on the boss.
  hunt:        { name: 'THE HUNT', kind: 'anomaly', anomaly: 'rival', share: 0.5, quest: true, feel: 'mixed',
    art: ['/\\_/\\', '(o o)', ' >w< '],
    lines: ['{dog} runs {pct} of the', 'corps here, and the boss.', "beat him to a corp's end:", "don't let him take the last."] },   // ({dog}: d0g, or w00f once b0y is crew)
  // H3AV3N (quest: only on the H3AV3N seed; never rolled): sector 1's light mold, heaven's deep mold. noBoss: not on its boss.
  mold:        { name: 'M0LD', kind: 'anomaly', anomaly: 'mold', share: 0.5, quest: true, noBoss: true,
    art: ['.%;:.', '%&#&%', "';%;'"],
    lines: ['something grows in {pct}', 'of the corps here. it', "comes and goes. you can't", 'scrape it off. tap [b].'] },
  deepmold:    { name: 'THE DEEP M0LD', kind: 'anomaly', anomaly: 'mold', share: 1, quest: true, noBoss: true,
    art: ['#&@&#', '&@#@&', '#&@&#'],
    lines: ["it's everywhere up here.", 'you can barely see the', 'nodes. tap [b]: b0y holds', 'it back for a moment.'] },
  ratrace:     { name: 'RAT RACE', kind: 'anomaly', anomaly: 'rival', share: 0.5, feel: 'mixed',
    art: ['()_()', '(o.o)', ' ~~~ '],
    lines: ['rival hackers: {pct} of the', 'corps in this sector.', 'they burn ICE for you,', 'and they steal the pay.'] },
  blind:       { name: 'WHERE AM I GOING?', kind: 'anomaly', anomaly: 'blinders', share: 0.5, feel: 'bad',
    art: ['.---.', '|?_?|', "'---'"],
    lines: ['{pct} of the corps here hide', 'who they are. you see the', 'level. you find out when', 'you get in.'] },
  crunch:      { name: 'CRUNCH TIME', kind: 'anomaly', anomaly: 'rush', share: 0.4, feel: 'bad',
    art: [' _|_ ', '( : )', ' --- '],
    lines: ['deadlines. {pct} of the', 'corps here put every layer', 'on a 10s clock.'] },
  sticky:      { name: 'STICKY FINGERS', kind: 'anomaly', anomaly: 'thief', share: 0.4, feel: 'bad',
    art: ['.-&-.', '|>&<|', "'---'"],
    lines: ['a thief works {pct} of the', 'corps here: ICE hits steal', 'your mods. buy them back', 'at THE FENCE, by the boss.'] },
  lockdown:    { name: 'LOCKDOWN', kind: 'anomaly', anomaly: 'armored', share: 0.5, feel: 'good',
    art: ['[###]', '[#.#]', '[###]'],
    lines: ['{pct} of the corps here are', 'armored: a hit points you', 'toward the real node.'] },
  badjuju:     { name: 'BAD JUJU', kind: 'anomaly', anomaly: 'cursed', share: 0.5, feel: 'bad',
    art: [' .-. ', '(x_x)', ' |!| '],
    lines: ['{pct} of the corps here are', 'cursed: no perfect heals.'] },
  payday:      { name: 'PAYDAY', kind: 'anomaly', anomaly: 'loaded', share: 0.4, feel: 'good',
    art: ['$ $ $', ' $$$ ', '$ $ $'],
    lines: ['{pct} of the corps here are', 'loaded: more $ nodes,', 'and they pay x1.2.'] },
  brand:       { name: 'BRAND SAFETY', kind: 'anomaly', anomaly: 'branded', share: 0.5, feel: 'good',
    art: ['/\\ /\\', '\\ X /', '\\/ \\/'],
    lines: ['sigils on the ICE in {pct}', 'of the corps here.', 'SIGSCAN works there.'] },
  chef:        { name: "CHEF'S CHOICE", kind: 'anomaly', anomaly: 'any', share: 0.5, feel: 'mixed',
    art: [' ___ ', '(___)', ' |#| '],
    lines: ['a little of everything:', '{pct} of the corps here get', 'a random anomaly.'] },
  coldsnap:    { name: 'COLD SNAP', kind: 'anomaly', anomaly: 'blackice', share: 0.4, feel: 'bad',
    art: ['\\ | /', '- * -', '/ | \\'],
    lines: ["don't slip. {pct} of the", 'corps here have black ICE:', 'a hit drops you to 1 INT.', 'it never takes the last one.'] },
  copypaste:   { name: 'COPY PASTE', kind: 'sector', feel: 'mixed',
    art: ['A1 A1', ' A1  ', 'A1 A1'],
    lines: ['every corp in this sector', 'is the same corp.', 'learn it once.'] },
  firesale:    { name: 'FIRE SALE', kind: 'sector', feel: 'good',
    art: ['  )  ', ' ( ) ', '-%%%-'],
    lines: ['markets are {sale} off', 'this sector.'] },
  flush:       { name: 'FLUSH', kind: 'sector', feel: 'good',
    art: ['$?$?$', '?$?$?', '$?$?$'],
    lines: ['loot everywhere: rest stops', 'are caches, and corps have', 'more $ nodes.'] },
  timeismoney: { name: 'TIME IS MONEY', kind: 'sector', feel: 'bad',
    art: [' _$_ ', '(1:0)', ' --- '],
    lines: ['every clock in this sector', 'costs you {cr}cr a second.', 'timed corps come up more.'] },
  grind:       { name: 'GRIND', kind: 'sector', feel: 'mixed',
    art: ['@=@=@', '=@=@=', '@=@=@'],
    lines: ['are we there yet?', 'every corp in this sector', 'has one more layer.', 'more layers, more pay.'] },
  rightangles: { name: 'RIGHT ANGLES', kind: 'sector', feel: 'bad', map: true,
    art: ['|    ', '|    ', '+----'],
    lines: ['right angles only.', 'no diagonal links here:', 'up, or sideways.', 'TUNNEL and MESH help.'] },
  gauntlet:    { name: 'GAUNTLET', kind: 'sector', feel: 'bad', map: true,
    art: ['  |  ', '  |  ', '  |  '],
    lines: ['one way through.', 'no choices. one market.', 'good luck.'] },
  eenymeeny:   { name: 'EENY MEENY', kind: 'sector', feel: 'mixed', map: true,
    art: ['! ! !', '| | |', '\\ | /'],
    lines: ['eeny, meeny, miny, mo.', 'three sector bosses.', 'your path picks one.', 'the other two walk.'] },
  headfirst:   { name: 'HEAD FIRST', kind: 'sector', feel: 'mixed', map: true,
    art: ['__o  ', '   \\ ', '~~~~~'],
    lines: ['no diving.', 'the sector boss is the', 'first thing here; its', 'spoils come right away.', 'the way out: a market.'] },
  deadair:     { name: 'DEAD AIR', kind: 'sector', feel: 'mixed', alone: true,   // (alone: never stacks)
    art: ['     ', ' ... ', '     '],
    lines: ['quiet sector.', 'enjoy it.'] },
};

// Stacking (the user, 2026-11-04). A sector after the 2nd can roll a 2nd event (ECON.eventOdds.second2..4).
// It fits the 1st when: neither is alone, they aren't both map shapes, COPY PASTE and TIME IS MONEY don't meet (both
// pick the corps), and the feels differ (or one is mixed). Two corp-tag events split the corps: a corp gets one or
// the other, never both; the boss gets the 1st one's. EVENT_SIDE: events that only ever come as a 2nd (small, good
// ones: the "but" on a bad sector's card).
const EVENT_SIDE = ['lockdown', 'payday', 'brand', 'firesale'];
// What scales the weights, like the economy (the user, 2026-11-04): the base weights are ECON.eventOdds; each scale
// whose when() holds multiplies its events' weights by x(). Quests and progress add theirs here.
const EVENT_SCALES = [
  // early on rivals come up a lot (you run into the hackers, and maybe d0g); once you've beaten d0g, less
  { key: 'd0g', when: () => typeof statOf === 'function' && statOf('hack:beat:d0g') > 0, events: ['ratrace', 'chef'], x: () => ECON.eventOdds.afterD0g },
];
