// NeoN+1 data/events.js: anomalies (a tag on one corp) and sector events (what each sector rolls).
// The design: docs/SECTOR_EVENTS.md. Sector 1 has no event; every sector after rolls one (seeded, no repeats).
'use strict';
NEON_FILES.push(['data/events.js', 'v13.55']);

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
};

// Sector events. kind 'anomaly': puts its anomaly on a share of the sector's corps (an exact count) and on the
// sector boss ('any': a random one each). kind 'sector': changes the whole sector, no tags. share grows by
// 10% a sector after the 2nd (up to 80%). art: 5 x 3, glyph-sized (placeholders; the user draws the real ones).
// lines: the card's text, 27 characters a line at most; {pct} = the share, {sale} = FIRE SALE's cut,
// {cr} = TIME IS MONEY's credits a second. weight: how often it rolls (1 = normal).
const SECTOR_EVENTS = {
  ratrace:     { name: 'RAT RACE', kind: 'anomaly', anomaly: 'rival', share: 0.5,
    art: ['()_()', '(o.o)', ' ~~~ '],
    lines: ['rival hackers: {pct} of the', 'corps in this sector.', 'they burn ICE for you,', 'and they steal the pay.'] },
  blind:       { name: 'WHERE AM I GOING?', kind: 'anomaly', anomaly: 'blinders', share: 0.5,
    art: ['.---.', '|?_?|', "'---'"],
    lines: ['{pct} of the corps here hide', 'who they are. you see the', 'level. you find out when', 'you get in.'] },
  crunch:      { name: 'CRUNCH TIME', kind: 'anomaly', anomaly: 'rush', share: 0.4,
    art: [' _|_ ', '( : )', ' --- '],
    lines: ['deadlines. {pct} of the', 'corps here put every layer', 'on a 10s clock.'] },
  sticky:      { name: 'STICKY FINGERS', kind: 'anomaly', anomaly: 'thief', share: 0.4,
    art: ['.-&-.', '|>&<|', "'---'"],
    lines: ['a thief works {pct} of the', 'corps here: ICE hits steal', 'your mods. buy them back', 'at THE FENCE, by the boss.'] },
  lockdown:    { name: 'LOCKDOWN', kind: 'anomaly', anomaly: 'armored', share: 0.5,
    art: ['[###]', '[#.#]', '[###]'],
    lines: ['{pct} of the corps here are', 'armored: a hit points you', 'toward the real node.'] },
  badjuju:     { name: 'BAD JUJU', kind: 'anomaly', anomaly: 'cursed', share: 0.5,
    art: [' .-. ', '(x_x)', ' |!| '],
    lines: ['{pct} of the corps here are', 'cursed: no perfect heals.'] },
  payday:      { name: 'PAYDAY', kind: 'anomaly', anomaly: 'loaded', share: 0.4,
    art: ['$ $ $', ' $$$ ', '$ $ $'],
    lines: ['{pct} of the corps here are', 'loaded: more $ nodes,', 'and they pay x1.2.'] },
  brand:       { name: 'BRAND SAFETY', kind: 'anomaly', anomaly: 'branded', share: 0.5,
    art: ['/\\ /\\', '\\ X /', '\\/ \\/'],
    lines: ['sigils on the ICE in {pct}', 'of the corps here.', 'SIGSCAN works there.'] },
  chef:        { name: "CHEF'S CHOICE", kind: 'anomaly', anomaly: 'any', share: 0.5,
    art: [' ___ ', '(___)', ' |#| '],
    lines: ['a little of everything:', '{pct} of the corps here get', 'a random anomaly.'] },
  copypaste:   { name: 'COPY PASTE', kind: 'sector',
    art: ['A1 A1', ' A1  ', 'A1 A1'],
    lines: ['every corp in this sector', 'is the same corp.', 'learn it once.'] },
  firesale:    { name: 'FIRE SALE', kind: 'sector',
    art: ['  )  ', ' ( ) ', '-%%%-'],
    lines: ['markets are {sale} off', 'this sector.'] },
  flush:       { name: 'FLUSH', kind: 'sector',
    art: ['$?$?$', '?$?$?', '$?$?$'],
    lines: ['loot everywhere: rest stops', 'are caches, and corps have', 'more $ nodes.'] },
  timeismoney: { name: 'TIME IS MONEY', kind: 'sector',
    art: [' _$_ ', '(1:0)', ' --- '],
    lines: ['every clock in this sector', 'costs you {cr}cr a second.', 'timed corps come up more.'] },
  deadair:     { name: 'DEAD AIR', kind: 'sector', weight: 0.3,
    art: ['     ', ' ... ', '     '],
    lines: ['quiet sector.', 'enjoy it.'] },
};
