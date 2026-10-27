// NeoN+1 tools/economy_file.js: writes and reads dist/data/economy.js (every money number, ECON), and says what
// each number is (INFO: its label, its kind, a note), for the neon editor's ECONOMY tab.
//   node tools/economy_file.js        rewrites the file in its own format (a check that it round-trips)
//
// Kinds: earn / spend = a count of that side's units; cr = credits; grow = a share added each sector;
// x = a multiplier; pct = a share (0.05 = 5%); n = a count; xlist / pctlist / nlist = one per rarity step.
(function (root) {
  const INFO = [
    { sec: 'Units', note: 'Every earn / spend number below is a count of these units. Change a unit and that whole side moves together.' },
    { path: 'earn.unit', kind: 'cr', label: 'earn unit', note: 'how many credits one earn unit is' },
    { path: 'earn.grow', kind: 'grow', label: 'earn growth', note: 'everything you earn grows this much each sector (0.35 = +35% a sector)' },
    { path: 'spend.unit', kind: 'cr', label: 'spend unit', note: 'how many credits one spend unit is' },
    { path: 'spend.grow', kind: 'grow', label: 'spend growth', note: 'everything you spend grows this much each sector' },

    { sec: 'Earning: layer pay', note: 'Finding the real node pays: (base + per node x the nodes on the layer), times the multipliers below and any mods. The public net (1 node) pays nothing.' },
    { path: 'pay.base', kind: 'earn', label: 'base', note: 'what every layer pays before its nodes count' },
    { path: 'pay.perNode', kind: 'earn', label: 'per node', note: 'added for each node on the layer (bigger layers pay more)' },
    { path: 'pay.boss', kind: 'x', label: 'boss layer', note: "a corp's boss layer pays this many times a normal one" },
    { path: 'pay.stageBoss', kind: 'x', label: 'sector boss corp', note: "when a corp is the sector boss, all its layers pay this many times more" },
    { path: 'pay.perfect', kind: 'x', label: 'perfect', note: 'finding the real node on the first try multiplies that layer\'s pay by this' },
    { path: 'pay.perfectPerNode', kind: 'x', label: 'perfect, per node', note: 'adds this much more to the perfect multiplier for each node past the first (0 = a flat perfect; the old curve was perfect 1, per node 0.5)' },

    { sec: 'Earning: loot and rewards' },
    { path: 'loot.base', kind: 'earn', label: 'loot: base', note: 'a loot node you hit (or a data cache roll) pays this...' },
    { path: 'loot.perTier', kind: 'earn', label: 'loot: per corp level', note: '...plus this for each corp level (caches count as level 2)...' },
    { path: 'loot.roll', kind: 'earn', label: 'loot: random extra', note: '...plus a random amount up to this' },
    { path: 'loot.itemChance', kind: 'pct', label: 'loot: gear instead', note: 'the chance a loot roll gives gear instead of credits (STASH raises it)' },
    { path: 'skip.starter', kind: 'earn', label: 'skip the starter perk', note: 'take credits instead of a mod at the start of a run' },
    { path: 'skip.boss', kind: 'earn', label: "skip a boss's reward", note: 'take credits instead of a mod after beating a corp' },
    { path: 'skip.sector', kind: 'earn', label: "skip the sector boss's reward", note: 'take credits instead of a mod after the uplink' },
    { path: 'rival.flatlined', kind: 'earn', label: 'RIVAL: knocked out', note: 'beat the rival hacker by knocking it out' },
    { path: 'rival.beat', kind: 'earn', label: 'RIVAL: beat it clean', note: 'beat the rival hacker without it stealing anything' },

    { sec: 'Earning: mods that pay credits' },
    { path: 'mods.ezpass', kind: 'earn', label: 'EZPASS', note: 'every layer you beat pays this bonus' },
    { path: 'mods.policy', kind: 'earn', label: 'POLICY', note: 'every time you hit ICE, the insurance pays this' },
    { path: 'mods.graverobber', kind: 'earn', label: 'GRAVE ROBBER', note: 'beating a layer pays this for each ICE you never touched' },
    { path: 'mods.honeycomb', kind: 'earn', label: 'HONEYCOMB', note: 'a honey drop when your integrity is already full pays this instead' },
    { path: 'mods.interestPct', kind: 'pct', label: 'INTEREST', note: 'beating a corp pays this share of the credits you hold...' },
    { path: 'mods.interestMax', kind: 'earn', label: 'INTEREST: cap', note: '...but never more than this' },
    { path: 'mods.chancecard', kind: 'earn', label: 'CHANCE CARD', note: 'drawing the credits card pays this' },
    { path: 'mods.coinCr', kind: 'earn', label: 'COIN FLIP: $ face', note: 'a $ side wins (or loses) this, times your streak multiplier' },
    { path: 'mods.coinBigCr', kind: 'earn', label: 'COIN FLIP: big $ face', note: 'a big $ side wins (or loses) this, times your streak multiplier' },
    { path: 'mods.ramDoublerSell', kind: 'pct', label: 'RAM DOUBLER: gear sold for', note: 'taking it sells all the gear you hold for this share of its price' },
    { path: 'blood.bonus', kind: 'earn', label: 'BLOOD MONEY: when you take it', note: 'paid once, the moment you take the mod' },
    { path: 'blood.heal', kind: 'earn', label: 'BLOOD MONEY: per heal', note: 'anything that would heal you pays this per point instead' },
    { path: 'corps.safeharborClaim', kind: 'earn', label: 'SAFEHARBOR: insurance claim', note: 'inside SAFEHARBOR, every ICE hit pays this' },
    { path: 'corps.chuckecacheTicket', kind: 'x', label: 'CHUCK E. CACHE: ticket value', note: 'inside CHUCK E. CACHE layers pay in tickets; beating it cashes each ticket in for this many credits' },

    { sec: 'Earning: mod multipliers', note: 'Mods that multiply what you earn, or change loot. A list has one value per rarity step of the mod (common / rare / epic...).' },
    { path: 'modx.supersize', kind: 'x', label: 'SUPERSIZE', note: 'every layer pays this many times more' },
    { path: 'modx.skimmer', kind: 'xlist', label: 'SKIMMER', note: 'every payout is multiplied by this, by rarity step' },
    { path: 'modx.fastpay', kind: 'x', label: 'FASTPAY', note: 'a layer you beat within 3 seconds pays this many times more' },
    { path: 'modx.onbeat', kind: 'x', label: 'ON BEAT', note: 'a real pick on the beat of the music pays this many times more' },
    { path: 'modx.letitride', kind: 'x', label: 'LET IT RIDE', note: 'a perfect\'s pay bets on the next layer: another perfect pays the bet back this many times' },
    { path: 'modx.coinMax', kind: 'x', label: 'COIN FLIP: top streak', note: 'each win raises the streak multiplier by 1, up to this' },
    { path: 'modx.quantum', kind: 'x', label: 'QUANTUM', note: 'every layer has two real nodes, but pays only this much' },
    { path: 'modx.overclockCut', kind: 'pct', label: 'OVERCLOCK', note: 'each ICE the late clock purges cuts that layer\'s pay by this' },
    { path: 'modx.priority', kind: 'n', label: 'PRIORITY', note: 'a loot node delivers its loot this many times' },
    { path: 'modx.stash', kind: 'pctlist', label: 'STASH', note: 'the chance a loot roll is gear, by rarity step (the first is the normal chance)' },
    { path: 'modx.cachekey', kind: 'nlist', label: 'CACHEKEY', note: 'extra loot rolls in every data cache, by rarity step' },

    { sec: 'Earning: selling gear', note: 'At a black market (SELL) gear sells for its worth; used anywhere, value gear cashes in for half. Gear costs nothing at the uplink.' },
    { path: 'gear.sellPct', kind: 'pct', label: 'gear resale', note: 'normal gear sells at a market for this share of its price' },
    { path: 'gear.duds', kind: 'earn', label: 'DUDS (scrap)', note: 'what one DUDS sells for' },
    { path: 'gear.sim', kind: 'earn', label: 'SIM (common)', note: 'what one SIM sells for' },
    { path: 'gear.shard', kind: 'earn', label: 'SHARD (rare)', note: 'what one SHARD sells for' },
    { path: 'gear.bond', kind: 'earn', label: 'BOND (rare)', note: 'what a BOND sells for, times the sector you are in (1, 2, 3...)' },
    { path: 'gear.chrome', kind: 'earn', label: 'CHROME (epic)', note: 'what one CHROME sells for' },
    { path: 'gear.wallet', kind: 'earn', label: 'WALLET (legend)', note: 'what one WALLET sells for' },

    { sec: 'Gear: how often each shows up', note: 'Loot rolls and market offers pick gear by weight. Normal gear weighs by its rarity (its first step); value gear (loot only) has its own. Higher = more often.' },
    { path: 'drop.scrap', kind: 'x', label: 'scrap gear', note: 'PATCH, PURGE, SHOE' },
    { path: 'drop.common', kind: 'x', label: 'common gear', note: 'FWALL, SPLIT, SHAKE, FRAG, REWIND' },
    { path: 'drop.rare', kind: 'x', label: 'rare gear', note: 'ROUTE, WARP, TUNNEL, TILT' },
    { path: 'drop.epic', kind: 'x', label: 'epic gear', note: 'ALL-IN, MESH, PASS' },
    { path: 'drop.duds', kind: 'x', label: 'DUDS', note: 'its weight' },
    { path: 'drop.sim', kind: 'x', label: 'SIM', note: 'its weight' },
    { path: 'drop.shard', kind: 'x', label: 'SHARD', note: 'its weight' },
    { path: 'drop.bond', kind: 'x', label: 'BOND', note: 'its weight' },
    { path: 'drop.chrome', kind: 'x', label: 'CHROME', note: 'its weight' },
    { path: 'drop.wallet', kind: 'x', label: 'WALLET', note: 'its weight' },

    { sec: 'Spending: markets', note: 'Mod and item prices live with the mods (data/mods.js), scaled by the spend unit.' },
    { path: 'tierPrice', kind: 'xlist', label: 'price by rarity step', note: 'a mod or item at its 1st / 2nd / 3rd / 4th rarity step costs its price times this (only FRAG has a 4th)' },
    { path: 'haggle', kind: 'pctlist', label: 'HAGGLE', note: 'market prices are this much lower, by rarity step' },
    { path: 'repair', kind: 'spend', label: 'repair', note: 'a market repair costs this for each integrity point' },
    { path: 'reroll', kind: 'spend', label: 'market reroll', note: 'new offers at a market: costs this, and this much more each time in the same market (1 a market, RESTOCK on THE BOARD adds up to 2)' },
    { path: 'stock.scrap', kind: 'pct', label: 'more copies: scrap gear', note: 'a market gear offer can come with more than one copy: the chance of each extra copy, by its rarity...' },
    { path: 'stock.common', kind: 'pct', label: 'more copies: common gear' },
    { path: 'stock.rare', kind: 'pct', label: 'more copies: rare gear' },
    { path: 'stock.epic', kind: 'pct', label: 'more copies: epic gear' },
    { path: 'stock.max', kind: 'n', label: 'most copies', note: '...up to this many of one gear' },

    { sec: 'Spending: mods that cost credits' },
    { path: 'continue', kind: 'spend', label: 'CONTINUE?', note: 'keep going after you would die: costs this, and this much more each time you use it' },
    { path: 'bloodHit.base', kind: 'spend', label: 'BLOOD MONEY: a hit', note: 'with BLOOD MONEY, each point of damage costs this...' },
    { path: 'bloodHit.perSector', kind: 'spend', label: 'BLOOD MONEY: more per sector', note: '...plus this for each sector you are in past the first' },
    { path: 'debt.limit', kind: 'spend', label: 'LEVERAGE: debt limit', note: 'with LEVERAGE, your credits can go this far below 0...' },
    { path: 'debt.limitPerSector', kind: 'spend', label: 'LEVERAGE: limit per sector', note: '...plus this much deeper for each sector' },
    { path: 'debt.payment', kind: 'spend', label: 'LEVERAGE: loan payment', note: 'every corp layer takes this payment, in debt or not...' },
    { path: 'debt.paymentPerSector', kind: 'spend', label: 'LEVERAGE: payment per sector', note: '...plus this for each sector' },
    { path: 'debt.interestPct', kind: 'pct', label: 'LEVERAGE: interest', note: 'while in debt, the debt grows by this share every layer...' },
    { path: 'debt.interestMin', kind: 'spend', label: 'LEVERAGE: least interest', note: '...but at least this' },
    { path: 'debt.shieldPer', kind: 'spend', label: 'LEVERAGE: shield per debt', note: 'the deeper in debt, the more often ICE does nothing: the odds are your debt / this...' },
    { path: 'debt.shieldMax', kind: 'pct', label: 'LEVERAGE: shield max', note: '...up to this' },
    { path: 'omerta.pct', kind: 'pct', label: 'OMERTA: a hit costs', note: 'with OMERTA, an ICE hit costs this share of your credits instead of integrity...' },
    { path: 'omerta.min', kind: 'spend', label: 'OMERTA: at least', note: '...but at least this' },
    { path: 'friendship', kind: 'spend', label: 'FRIENDSHIP', note: 'once per corp, an ICE hit costs this instead of integrity' },
    { path: 'companion', kind: 'spend', label: 'COMPANION', note: 'the treat your pet takes each time it sniffs out an ICE' },

    { sec: 'Spending: the uplink', note: "Pushing on to the next sector: a fee for every mod you carry (by its rarity) plus a minimum, all times the sector you leave (1, 2, 3...). Mods you don't keep are sold." },
    { path: 'uplink.min', kind: 'spend', label: 'minimum', note: 'everyone pays this to push on, mods or not' },
    { path: 'uplink.scrap', kind: 'spend', label: 'a scrap mod', note: 'to carry one scrap mod' },
    { path: 'uplink.common', kind: 'spend', label: 'a common mod', note: 'to carry one common mod' },
    { path: 'uplink.rare', kind: 'spend', label: 'a rare mod', note: 'to carry one rare mod' },
    { path: 'uplink.epic', kind: 'spend', label: 'an epic mod', note: 'to carry one epic mod' },
    { path: 'uplink.legendary', kind: 'spend', label: 'a legendary mod', note: 'to carry one legendary mod (every corp mod, and fully upgraded ones)' },
    { path: 'uplink.exotic', kind: 'spend', label: 'an exotic mod', note: 'to carry one exotic mod' },
    { path: 'uplink.pass', kind: 'pct', label: 'PASS', note: 'the PASS gear cuts the whole uplink fee by this' },
    { path: 'uplink.sellPct', kind: 'pct', label: 'selling pays back', note: "a mod you sell at the uplink pays back this share of what keeping it would cost" },

    { sec: 'Sector events', note: 'What some sector events do to money (data/events.js, docs/SECTOR_EVENTS.md).' },
    { path: 'events.fireSale', kind: 'pct', label: 'FIRE SALE', note: 'market prices are this much lower in that sector' },
    { path: 'events.timeCr', kind: 'spend', label: 'TIME IS MONEY', note: 'every second a clock runs in that sector costs this' },

    { sec: 'Spending: corps', note: "Each corp's own costs, only inside that corp." },
    { path: 'corpCosts.tollgatePick', kind: 'spend', label: 'TOLLGATE: a pick', note: 'every node you tap costs this' },
    { path: 'corpCosts.safeharborPremium', kind: 'spend', label: 'SAFEHARBOR: premium', note: 'entering takes this insurance premium (if you have it)' },
    { path: 'corpCosts.famiglia', kind: 'spend', label: 'LA FAMIGLIA: protection', note: 'paying protection locks one ICE on a layer' },
    { path: 'corpCosts.famigliaBoss', kind: 'spend', label: 'LA FAMIGLIA: boss protection', note: 'the same on the boss layer' },
    { path: 'corpCosts.choirTithe', kind: 'spend', label: 'THE CHOIR: tithe', note: 'paying the tithe gives you a sign (but loses the faith bonus)' },
    { path: 'corpCosts.choirTitheBoss', kind: 'spend', label: 'THE CHOIR: boss tithe', note: 'the same on the boss layer' },
    { path: 'corpCosts.bidblitz', kind: 'spend', label: 'BIDBLITZ: a bid', note: 'a bid locks one ICE...' },
    { path: 'corpCosts.bidblitzBoss', kind: 'spend', label: 'BIDBLITZ: a boss bid', note: '...on the boss layer it starts here...' },
    { path: 'corpCosts.bidblitzStep', kind: 'spend', label: 'BIDBLITZ: each bid raises it', note: '...and every bid costs this much more than the last' },
    { path: 'corpCosts.mochi', kind: 'spend', label: 'MOCHI: an ICE hit', note: 'ICE costs this instead of integrity' },
    { path: 'corpCosts.mochiBoss', kind: 'spend', label: 'MOCHI: a boss ICE hit', note: 'the same on the boss layer' },
    { path: 'corpCosts.bytepetsCall', kind: 'spend', label: 'BYTEPETS: a call', note: 'calling the pets costs this treat' },
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
  const KIND = { earn: 'earn', spend: 'spend', cr: 'cr', grow: 'grow', x: 'x', pct: '%', xlist: 'x list', pctlist: '% list', n: 'count', nlist: 'count list' };
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
