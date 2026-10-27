// NeoN+1 tools/economy_file.js: writes and reads dist/data/economy.js (every money number, ECON), and says what
// each number is (INFO: its label, its kind, a note), for the neon editor's ECONOMY tab.
//   node tools/economy_file.js        rewrites the file in its own format (a check that it round-trips)
//
// Kinds: earn / spend = a count of that side's units; cr = credits; grow = a share added each sector;
// x = a multiplier; pct = a share (0.05 = 5%); xlist = a list of multipliers.
(function (root) {
  const INFO = [
    { sec: 'Units', note: 'Every earn / spend number below is a count of these. Turn one up and that whole side moves.' },
    { path: 'earn.unit', kind: 'cr', label: 'earn unit', note: 'credits per earn unit' },
    { path: 'earn.grow', kind: 'grow', label: 'earn growth', note: 'everything you earn grows this much a sector (0.35 = +35%)' },
    { path: 'spend.unit', kind: 'cr', label: 'spend unit', note: 'credits per spend unit' },
    { path: 'spend.grow', kind: 'grow', label: 'spend growth', note: 'everything you spend grows this much a sector' },
    { sec: 'Earning: layer pay', note: 'A layer pays (base + per node x nodes), then the multipliers. The public net (1 node) pays 0.' },
    { path: 'pay.base', kind: 'earn', label: 'base', note: 'every layer' },
    { path: 'pay.perNode', kind: 'earn', label: 'per node', note: 'x the nodes on the layer' },
    { path: 'pay.boss', kind: 'x', label: 'boss layer', note: 'the boss pays this many times more' },
    { path: 'pay.stageBoss', kind: 'x', label: 'sector boss corp', note: 'a corp that is the sector boss' },
    { path: 'pay.perfect', kind: 'x', label: 'perfect', note: 'a perfect pays x(this + per node x (nodes - 1))' },
    { path: 'pay.perfectPerNode', kind: 'x', label: 'perfect, per node', note: 'the old curve was perfect 1, per node 0.5 (x2 on 3 nodes up to x6.5 on 12); flat x2 since v13.41' },
    { sec: 'Earning: loot, rewards' },
    { path: 'loot.base', kind: 'earn', label: 'loot: base', note: 'a loot node, or a data cache roll' },
    { path: 'loot.perTier', kind: 'earn', label: 'loot: per level', note: 'x the corp level (caches roll at 2)' },
    { path: 'loot.roll', kind: 'earn', label: 'loot: random', note: 'plus up to this' },
    { path: 'loot.itemChance', kind: 'pct', label: 'loot: an item instead', note: 'the chance a loot roll is an item (STASH raises it)' },
    { path: 'skip.starter', kind: 'earn', label: 'skip: starter perk', note: '"take credits instead"' },
    { path: 'skip.boss', kind: 'earn', label: 'skip: boss reward', note: '' },
    { path: 'skip.sector', kind: 'earn', label: 'skip: sector boss reward', note: '' },
    { path: 'rival.flatlined', kind: 'earn', label: 'RIVAL: flatlined', note: 'you knocked the rival out' },
    { path: 'rival.beat', kind: 'earn', label: 'RIVAL: beat clean', note: 'it stole nothing' },
    { sec: 'Earning: mods' },
    { path: 'mods.ezpass', kind: 'earn', label: 'EZPASS', note: 'every layer' },
    { path: 'mods.policy', kind: 'earn', label: 'POLICY', note: 'every ICE hit' },
    { path: 'mods.graverobber', kind: 'earn', label: 'GRAVE ROBBER', note: 'per untouched ICE' },
    { path: 'mods.honeycomb', kind: 'earn', label: 'HONEYCOMB', note: 'a drop at full integrity' },
    { path: 'mods.interestPct', kind: 'pct', label: 'INTEREST', note: 'of your credits, per corp...' },
    { path: 'mods.interestMax', kind: 'earn', label: 'INTEREST: cap', note: '...up to this' },
    { path: 'mods.chancecard', kind: 'earn', label: 'CHANCE CARD', note: 'the credits card' },
    { path: 'mods.coinCr', kind: 'earn', label: 'COIN FLIP: $ face', note: 'x the streak multiplier' },
    { path: 'mods.coinBigCr', kind: 'earn', label: 'COIN FLIP: big $ face', note: '' },
    { path: 'mods.ramDoublerSell', kind: 'pct', label: 'RAM DOUBLER: sells items for', note: 'of their price' },
    { path: 'blood.bonus', kind: 'earn', label: 'BLOOD MONEY: when you take it', note: '' },
    { path: 'blood.heal', kind: 'earn', label: 'BLOOD MONEY: per heal', note: 'healing pays this instead' },
    { path: 'corps.safeharborClaim', kind: 'earn', label: 'SAFEHARBOR: claim', note: 'an ICE hit pays this' },
    { path: 'corps.chuckecacheTicket', kind: 'x', label: 'CHUCK E. CACHE: per ticket', note: 'credits per ticket at the prize counter' },
    { sec: 'Spending: markets', note: 'Mod and item prices live with the mods (data/mods.js), scaled by the spend unit.' },
    { path: 'tierPrice', kind: 'xlist', label: 'price by rarity step', note: 'x a mod / item price at each rarity step' },
    { path: 'repair', kind: 'spend', label: 'repair', note: 'per integrity, at a market' },
    { sec: 'Spending: mods' },
    { path: 'continue', kind: 'spend', label: 'CONTINUE?', note: 'the first time; this again more each time after' },
    { path: 'bloodHit.base', kind: 'spend', label: 'BLOOD MONEY: a hit', note: 'per point of damage...' },
    { path: 'bloodHit.perSector', kind: 'spend', label: 'BLOOD MONEY: per sector', note: '...plus this x the sector' },
    { path: 'debt.limit', kind: 'spend', label: 'LEVERAGE: debt limit', note: 'how far below 0...' },
    { path: 'debt.limitPerSector', kind: 'spend', label: 'LEVERAGE: limit per sector', note: '...plus this x the sector' },
    { path: 'debt.payment', kind: 'spend', label: 'LEVERAGE: loan payment', note: 'every corp layer...' },
    { path: 'debt.paymentPerSector', kind: 'spend', label: 'LEVERAGE: payment per sector', note: '...plus this x the sector' },
    { path: 'debt.interestPct', kind: 'pct', label: 'LEVERAGE: interest', note: 'debt grows this much a layer...' },
    { path: 'debt.interestMin', kind: 'spend', label: 'LEVERAGE: least interest', note: '...at least this' },
    { path: 'debt.shieldPer', kind: 'spend', label: 'LEVERAGE: shield per', note: 'ICE does nothing with odds debt / this...' },
    { path: 'debt.shieldMax', kind: 'pct', label: 'LEVERAGE: shield max', note: '...up to this' },
    { path: 'omerta.pct', kind: 'pct', label: 'OMERTA: a hit costs', note: 'of your credits...' },
    { path: 'omerta.min', kind: 'spend', label: 'OMERTA: at least', note: '' },
    { path: 'friendship', kind: 'spend', label: 'FRIENDSHIP', note: 'the hit it takes instead' },
    { path: 'companion', kind: 'spend', label: 'COMPANION', note: 'the treat' },
    { sec: 'Spending: the uplink', note: 'Pushing on to the next sector: a fee for every mod you carry (by its rarity) plus a minimum, all x the sector you leave (1, 2, 3...). Mods you don\'t keep are sold.' },
    { path: 'uplink.min', kind: 'spend', label: 'minimum', note: 'everyone pays this' },
    { path: 'uplink.scrap', kind: 'spend', label: 'a scrap mod', note: '' },
    { path: 'uplink.common', kind: 'spend', label: 'a common mod', note: '' },
    { path: 'uplink.rare', kind: 'spend', label: 'a rare mod', note: '' },
    { path: 'uplink.epic', kind: 'spend', label: 'an epic mod', note: '' },
    { path: 'uplink.legendary', kind: 'spend', label: 'a legendary mod', note: 'corp mods, and fully upgraded ones' },
    { path: 'uplink.exotic', kind: 'spend', label: 'an exotic mod', note: '' },
    { path: 'uplink.sellPct', kind: 'pct', label: 'selling pays back', note: 'of that mod\'s fee' },
    { sec: 'Spending: corps', note: 'Each corp\'s own costs.' },
    { path: 'corpCosts.tollgatePick', kind: 'spend', label: 'TOLLGATE: a pick', note: '' },
    { path: 'corpCosts.safeharborPremium', kind: 'spend', label: 'SAFEHARBOR: premium', note: 'when you enter (up to)' },
    { path: 'corpCosts.famiglia', kind: 'spend', label: 'LA FAMIGLIA: protection', note: '' },
    { path: 'corpCosts.famigliaBoss', kind: 'spend', label: 'LA FAMIGLIA: boss protection', note: '' },
    { path: 'corpCosts.choirTithe', kind: 'spend', label: 'THE CHOIR: tithe', note: '' },
    { path: 'corpCosts.choirTitheBoss', kind: 'spend', label: 'THE CHOIR: boss tithe', note: '' },
    { path: 'corpCosts.bidblitz', kind: 'spend', label: 'BIDBLITZ: a bid', note: '' },
    { path: 'corpCosts.bidblitzBoss', kind: 'spend', label: 'BIDBLITZ: a boss bid', note: '' },
    { path: 'corpCosts.bidblitzStep', kind: 'spend', label: 'BIDBLITZ: each bid raises it', note: '' },
    { path: 'corpCosts.mochi', kind: 'spend', label: 'MOCHI: an ICE hit', note: '' },
    { path: 'corpCosts.mochiBoss', kind: 'spend', label: 'MOCHI: a boss ICE hit', note: '' },
    { path: 'corpCosts.bytepetsCall', kind: 'spend', label: 'BYTEPETS: a call', note: '' },
  ];
  const HEAD = [
    '// NeoN+1 data/economy.js: every money number in the game, in one place (the user\'s credit scale, 2026-10-26).',
    '// The neon editor\'s ECONOMY tab edits this file (tools/economy_file.js writes it; the notes come from there).',
    '//',
    '// Two units: EARN (everything that pays you) and SPEND (everything that costs you). A number marked earn / spend is a',
    '// count of that side\'s units: repair 2 = 2 x the spend unit = 20cr. Change a unit and that whole side moves; change',
    '// one number and only that thing moves. Each side can grow every sector (0.35 = +35% a sector). Numbers marked x are',
    '// multipliers, % are shares (0.05 = 5%), cr are credits. Mod and item prices stay with the mods (data/mods.js), at a',
    '// unit of 10, scaled by the spend unit.',
    "'use strict';",
  ];
  const TAIL = [
    '',
    '// Credits for u units, earned or spent, at this sector (not rounded: round where the amount is final).',
    'const econSector = () => { try { return (st.run && st.run.sector) || 0; } catch (e) { return 0; } };   // (st doesn\'t exist yet while files load)',
    "const econUnit = side => ECON[side].unit * (1 + ECON[side].grow * econSector());",
    "const earnCr = u => u * econUnit('earn');",
    "const costCr = u => u * econUnit('spend');",
    'const earnInt = u => Math.round(earnCr(u));',
    'const costInt = u => Math.round(costCr(u));',
    '// Mod and item prices are written at a unit of 10: this scales them.',
    "const priceScale = () => econUnit('spend') / 10;",
    '',
  ];
  const KIND = { earn: 'earn', spend: 'spend', cr: 'cr', grow: 'grow', x: 'x', pct: '%', xlist: 'x' };
  const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const set = (o, path, v) => { const ks = path.split('.'), last = ks.pop(); ks.reduce((a, k) => a[k] = a[k] || {}, o)[last] = v; };
  const num = v => Array.isArray(v) ? '[' + v.map(num).join(', ') + ']' : String(+v);
  // the file's text, from ECON and the build stamp
  function text(econ, build) {
    const out = [...HEAD, `NEON_FILES.push(['data/economy.js', '${build || 'v0'}']);`, '', 'const ECON = {'];
    let open = null;   // the group object open now
    for (const it of INFO) {
      if (it.sec) { if (open) { out.push('  },'); open = null; } out.push(`  // ---- ${it.sec}`); continue; }
      const ks = it.path.split('.'), v = get(econ, it.path), c = `   // ${KIND[it.kind]}: ${it.label}${it.note ? ' (' + it.note + ')' : ''}`;
      if (ks.length === 1) { if (open) { out.push('  },'); open = null; } out.push(`  ${ks[0]}: ${num(v)},${c}`); continue; }
      if (open !== ks[0]) { if (open) out.push('  },'); out.push(`  ${ks[0]}: {`); open = ks[0]; }
      out.push(`    ${ks[1]}: ${num(v)},${c}`);
    }
    if (open) out.push('  },');
    out.push('};', ...TAIL);
    return out.join('\n');
  }
  // ECON, from the file's text
  function parse(src) { return new Function('NEON_FILES', src + '\nreturn ECON;')([]); }
  // a deep copy of just the numbers INFO knows (what the editor edits and saves)
  function pick(econ) { const o = {}; for (const it of INFO) if (it.path) set(o, it.path, JSON.parse(JSON.stringify(get(econ, it.path)))); return o; }
  // anything in the file INFO doesn't know (a new number someone added by hand: it would be lost on save)
  function unknown(econ) {
    const known = new Set(INFO.filter(i => i.path).map(i => i.path)), out = [];
    const walk = (o, pre) => { for (const [k, v] of Object.entries(o)) { const p = pre ? pre + '.' + k : k; if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, p); else if (!known.has(p)) out.push(p); } };
    walk(econ, '');
    return out;
  }
  const T = { INFO, text, parse, pick, unknown, get, set };
  if (typeof module !== 'undefined' && module.exports) module.exports = T; else root.NEON_ECON_FILE = T;
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    const fs = require('fs'), path = require('path');
    const f = path.join(__dirname, '..', 'dist', 'data', 'economy.js'), src = fs.readFileSync(f, 'utf8');
    const build = (src.match(/NEON_FILES\.push\(\['data\/economy\.js', '([^']+)'\]\)/) || [])[1];
    const econ = parse(src), lost = unknown(econ);
    if (lost.length) { console.log('economy.js has numbers tools/economy_file.js does not know (add them to INFO): ' + lost.join(', ')); process.exit(1); }
    const out = text(econ, build);
    const same = JSON.stringify(pick(parse(out))) === JSON.stringify(pick(econ));
    if (!same) { console.log('round trip changed a value: not written'); process.exit(1); }
    fs.writeFileSync(f, out);
    console.log(`data/economy.js: ${INFO.filter(i => i.path).length} numbers, ${src === out ? 'unchanged' : 'rewritten'}`);
  }
})(this);
