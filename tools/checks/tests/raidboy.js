// tools/checks/tests/raidboy.js: the OMNI RAID (engine/quests.js questOmniBoy, Greg 2026-11-21): on OMNI's boss layer
// without b0y, he comes in by himself (this corp's [b]); not on an earlier layer, not off the raid step, not in another corp.
module.exports = { name: 'raidboy', body: `
  await settle();
  save.quests = save.quests || {}; save.legacy = save.legacy || {}; save.legacy.crew_b0y = 1;
  Object.assign(questOf('pops'), { step: 'raid', seen: true, raidCalled: true }); persist();
  B.startRun('RAIDBOY', false); await settle('start');
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  check(st.run.boyTray && !st.run.practice, 'the raid: b0y in the tray, a real run');
  const node = Object.values(st.run.map).find(n => n.type === 'corp');
  const ready = async () => { for (let i = 0; i < 100 && (!st.lv || st.busy); i++) await sleep(100); await sleep(1200); };
  const boyIn = () => (st.corp.hk || []).some(h => h.id === 'b0y');
  node.corp = 'omni'; node.tier = 2;
  startCorp(node, 1); await ready();
  check(!st.lv.boss && !boyIn(), 'an OMNI layer before the boss: no b0y');
  startCorp(node, 99); await ready();
  check(st.lv.boss && boyIn() && st.corp.boyTrayUsed, 'the OMNI boss: b0y comes in by himself');
  // not the raid step: no b0y
  questOf('pops').step = 'g0d'; startCorp(node, 99); await ready();
  check(st.lv.boss && !boyIn(), 'off the raid step: he stays out');
  // not OMNI
  questOf('pops').step = 'raid'; node.corp = 'basic'; startCorp(node, 99); await ready();
  check(!boyIn(), "another corp's boss: he stays out");
` };
