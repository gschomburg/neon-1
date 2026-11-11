// NeoN+1 engine/oneup.js: THE 1UP (docs/ENDGAME.md): a save point as you enter a corp, and CONTINUE? from it.
// Moved out of engine/run.js (2026-11-05). Needs engine/run.js (startCorp, die) loaded first.
'use strict';
NEON_FILES.push(['engine/oneup.js', 'v14.76']);

// ---------------- THE 1UP (docs/ENDGAME.md; b0y's crash unit from MEDIX, the reward for beating G0D) ----------------
// You hold one at most; it charges again every sector. Die holding it and you can go back to the start of the corp you
// died in, with what you had going in (run.oneUpSave, taken as you entered). The seed is the seed: its layers come back
// exactly the same. No penalty: fewer used breaks a tie on the leaderboard (engine/leaders.js), and it's tracked.
const oneUpOpen = (run, opts = {}) => !!save.beatG0D && !!run && !run.tutorial && !opts.tutorial && !st.mp;   // (run kinds: engine/save.js)
function oneUpSavePoint(node) {
  const run = st.run;
  if (!oneUpOpen(run) || node.type === 'start' || node.heaven) return;   // (not the public net, and not heaven's MAZE / G0D: their own rules)
  const { oneUpSave, ...as } = run;
  run.oneUpSave = JSON.parse(JSON.stringify(as)); run.oneUpAt = node.id;
}
const oneUpReady = run => !!run && run.oneUp > 0 && !!run.oneUpSave && !!st.corp && st.corp.node && st.corp.node.id === run.oneUpAt && !st.mp;
function askOneUp() {
  return new Promise(res => {
    let done = false;
    const choose = v => { if (done) return; done = true; Sound.ui(); res(v); };
    const name = st.corp.def.name;
    openPanel('1UP', (T, B, X) => {
      X({ text: 'C O N T I N U E ?', col: Math.floor(performance.now() / 300) % 2 ? C.money : C.bright, bold: true });
      T('');
      T("b0y's crash unit is charged.", C.mid);
      T('');
      T('back to the start of', C.text);
      X({ text: name, col: C.bright, bold: true });
      T('with what you had going in.', C.text);
      T('it charges again next sector.', C.mid);
      T('');
      X({ box: true, text: 'U S E   1 U P', id: 'oneup', onTap: () => choose(true), minW: 20 });
      T('');
      B('[ GAME OVER ]', 'giveup', () => choose(false));
    }, { text: '> flatlined. the crash unit hums.', col: C.money });
  });
}
async function useOneUp(run0) {
  const c = st.corp, back = JSON.parse(JSON.stringify(run0.oneUpSave));
  Object.assign(back, { oneUp: 0, oneUps: (run0.oneUps || 0) + 1, oneUpAt: run0.oneUpAt, oneUpSave: run0.oneUpSave, stat: run0.stat, resumes: run0.resumes });   // (the stats keep counting)
  stat('oneup', { sector: (c.sector || 0) + 1, corp: c.def.key, layer: st.lv && st.lv.boss ? 'boss' : c.idx + 1 });
  st.run = back; st.dying = false; st.timer = null; st.hkDeath = null;
  Sound.shield(); flash(C.money, 0.25, 0.5);
  await wipeOut(0);
  st.busy = false;
  setMsg(`> 1UP. back to the start of ${c.def.name.toLowerCase()}.`, C.money);
  startCorp(back.map[back.oneUpAt]);
}
