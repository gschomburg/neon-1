// NeoN+1 engine/corps.js: After the corps load: OMNI//CORE and the public net, corpDef, RIVAL, the codex corp order, intro art clean-up.
'use strict';
NEON_FILES.push(['engine/corps.js', 'v12.18']);

const FINAL = {
  key: 'omni', name: 'OMNI//CORE', letter: '!',
  intel: '"you shouldn\'t be here."',
  timer: 12, pay: 2, bossDmg: 2,
  bossDesc: 'boss: ICE hits for 2.',
};
const PUBLIC = { key: 'public', name: 'PUBLIC NET', letter: '>', intel: 'one node. it is real.', tell: null };
const corpDef = key => CORPS[key] || (key === 'omni' ? FINAL : PUBLIC);
// A corp's code on the map and in lists: its 2 letters and its level (SK1, BR5).
// OMNI and the public net keep a symbol in brackets, like the other special nodes.
const corpCode = d => d.code ? d.code + (d.level || 1) : `[${d.letter}]`;
// ---- RIVAL (corp modifier): a bot runs the same corp. Every few seconds it aims (red > <)
// and picks. ICE it hits is locked for you and costs it 1 of 3 health; if it finds the real
// node first, it takes that layer's pay. Beat the corp with it flatlined (+30cr) or without
// it ever stealing a layer (+15cr).
const rivalName = () => String((profile().name || 'RUNNER')).toUpperCase().replace(/A/g, '4').replace(/E/g, '3').replace(/I/g, '1').replace(/O/g, '0').slice(0, 12);
function rivalTick(lv, now) {
  const c = st.corp, rv = c.rival = c.rival || { hp: 3, stole: 0, name: rivalName() };
  if (lv.n < 2) return;
  const nt = (lv.notes = lv.notes || []).find(n2 => n2.tag === 'rival'), txt = rv.hp > 0 ? `vs ${rv.name.slice(0, 9)} ${'#'.repeat(rv.hp)}${'-'.repeat(3 - rv.hp)}` : 'rival: x_x';
  if (nt) nt.text = txt; else lv.notes.push({ text: txt, tag: 'rival' });
  if (rv.hp <= 0) return;
  const s = lv.rv = lv.rv || { next: now + 2600 - Math.min(1000, 150 * c.tier) + Math.random() * 1200, aim: null };
  if (s.aim) {
    if (now < s.aim.at) return;
    const t = s.aim.t;
    s.aim = null;
    s.next = now + 2200 - Math.min(900, 120 * c.tier) + Math.random() * 1400;
    if (t.state !== 'closed') return;
    if (t.safe) {
      rv.stole++; lv.payCut = 1; lv.scanned = true; st.busy = true;
      Sound.trap(); flash(C.danger, 0.15, 0.3);
      setMsg(`> ${rv.name.toLowerCase()} got it first. no pay.`, C.danger);
      (async () => { await wait(500); if (st.lv === lv) await onSafe(t); })();
      return;
    }
    lockTile(t, C.danger, 'rival');
    rv.hp--;
    setMsg(rv.hp > 0 ? `> ${rv.name.toLowerCase()} hit ICE. ${'#'.repeat(rv.hp)}${'-'.repeat(3 - rv.hp)}` : `> ${rv.name.toLowerCase()} flatlined.`, rv.hp > 0 ? C.mid : C.money);
    return;
  }
  if (now < s.next) return;
  const opts = lv.tiles.filter(t => t.state === 'closed');
  if (!opts.length) return;
  const real = lv.tiles[lv.safe];
  s.aim = { t: real.state === 'closed' && Math.random() < 0.12 ? real : pickR(opts, Math.random), at: now + 700 };
}
// OMNI copies one corp you beat in this sector: its tell and its hooks, with OMNI's teeth.
function omniCopy(key, pool) {
  const src = CORPS[key], letters = [...new Set(pool)].map(k => corpCode(CORPS[k])).join(' ');
  return Object.assign({}, src, { key: 'omni', name: FINAL.name, code: null, letter: FINAL.letter, intel: FINAL.intel, level: null,
    pay: Math.max(2, src.pay || 1), bossDmg: 2, bossDesc: FINAL.bossDesc, copied: key, timer: src.timer || 0,
    rules: () => `it copies one of: ${letters}`.slice(0, 36) });
}
// The codex lists corps by level, then OMNI.
const CODEX_CORPS = [...Object.keys(CORPS).sort((a, b) => (CORPS[a].level || 1) - (CORPS[b].level || 1) || a.localeCompare(b)), 'omni'];

// Center each logo by its visible art: drop the blank columns every row shares.
for (const k of Object.keys(CORP_ART)) {
  const rows = CORP_ART[k];
  const lead = Math.min(...rows.filter(l => l.trim()).map(l => l.length - l.trimStart().length));
  CORP_ART[k] = rows.map(l => l.slice(lead).trimEnd());
}

// Corp numbers by tier: deeper corps get harder versions.
function corpTimer(def, tier) { return def.timer ? def.timer - (def.key === 'chronos' && tier >= 2 ? 2 : 0) : 0; }
function corpPay(def, tier) { return (def.pay || 1) + (def.key === 'chronos' && tier >= 2 ? 0.2 : 0); }
function corpRules(def, tier) {
  if (def.rules) return def.rules(tier);
  if (def.key === 'chronos') return `${corpTimer(def, tier)}s clock per pick. pays x${corpPay(def, tier).toFixed(1)}`;
  if (def.key === 'omni') return '12s clock. tell unknown. pays x2';   // (a copying OMNI has its own rules)
  return '';
}
