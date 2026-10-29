// NeoN+1 engine/corps.js: After the corps load: OMNI//CORE and the public net, corpDef, RIVAL, the codex corp order, intro art clean-up.
'use strict';
NEON_FILES.push(['engine/corps.js', 'v13.74']);

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
// (RIVAL, the corp modifier, brings in one of the rival hackers now: engine/hackers.js.)
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
