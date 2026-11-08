// tools/checks/tests/g0dexe.js: G0D.exe, step 1 (engine/g0dexe.js; docs/BACKLOG.md, Greg 2026-11-08). The dev menu gives
// it; a tap switches it on (the card once), and it plays a corp you've beaten perfectly, a click a tap; a corp you
// haven't, by guessing; its own gear pauses it; out of clicks, it stops. It's never in a drop or a market.
module.exports = { name: 'g0dexe', body: `
  await settle();
  B.startRun('G0DX1', true); await settle('start');
  if (st.mode !== 'map') { B.toMap(); await sleep(1500); }
  st.god = true;
  save.g0dx = { clicks: 500, speed: 4, beaten: 1 };
  check(!pickGearDrop.toString().includes('g0dexe') && !gearAllowed('g0dexe') && !shopGear().includes('g0dexe'), 'never dropped or sold in a market');
  check(g0dxGive() && holds('g0dexe') && st.run.g0dx.left === 500 && !g0dxOn(), 'the dev menu gives it, off, 500 clicks');
  const slot = () => st.run.items.findIndex(s => s.key === 'g0dexe');
  const node = Object.values(st.run.map).find(n => n.type === 'corp');
  const untilDone = async (corp, ms) => { for (let i = 0; i < ms / 100 && st.corp === corp && st.mode === 'play'; i++) { if (st.hkCard) B.state.hkCard.t0 = 0, hkCardClose(); if (st.intro) st.intro.skip = true; if (st.bossIntro) st.bossIntro.skip = true; await sleep(100); } };
  // a corp you've beaten: the real node every time
  corpStat('basic').breached = 1;
  node.corp = 'basic'; node.tier = 1; startCorp(node, 0);
  const ready = async () => { for (let i = 0; i < 100 && !(st.lv && st.lv.readyAt != null && !st.busy && !st.transitioning && !st.wipe); i++) { if (st.intro) st.intro.skip = true; await sleep(100); } };
  await ready();
  useItem(slot());
  check(g0dxOn() && holds('g0dexe'), 'a tap switches it on (and it stays on the belt)');
  await sleep(300);
  check(!!(st.hkCard && st.hkCard.id === 'g0dexe') || !!(st.hkCards || []).find(c => c.id === 'g0dexe'), 'its card comes up, like a crew CALL');
  const corp = st.corp, layers = corp.counts.length, hp = st.run.integrity;
  await untilDone(corp, 40000);
  check(st.corp !== corp || st.mode !== 'play', 'it plays the corp through (mode ' + st.mode + ')');
  check(st.run.g0dx.used === layers, 'one click a layer in a corp it knows: ' + st.run.g0dx.used + ' for ' + layers);
  check(!(corp.hk || []).some(h => h.id === 'g0dexe' && h.out), 'it never runs out of bars');
  say('log: ' + (st.run.g0dx.log || []).join(' / '));
  // a corp you haven't beaten: it guesses (more clicks than layers, most of the time)
  corpStat('basic').breached = 0;
  const fresh = async tier => { const was = st.run.g0dx.on; st.run.g0dx.on = false; await settle('leave'); st.run.ended = false; st.corp = null; B.toMap(); await sleep(1200); node.corp = 'basic'; node.tier = tier; startCorp(node, 0); await ready(); st.run.g0dx.on = was; };
  const at = () => 'mode ' + st.mode + ' busy ' + !!st.busy + ' trans ' + !!st.transitioning + ' on ' + g0dxOn() + ' left ' + st.run.g0dx.left + ' lv ' + !!st.lv;
  await fresh(3);
  const used0 = st.run.g0dx.used;
  await sleep(1500);
  check(st.run.g0dx.used > used0, 'it guesses in a corp you have not beaten (' + at() + ')');
  check(!st.hkCard && !(st.hkCards || []).find(c => c.id === 'g0dexe'), 'the card only comes the first time');
  // its gear pauses it
  await fresh(3);
  useItem(slot());
  check(!g0dxOn() && /paused/.test(st.msg), 'a tap on its gear pauses it (' + at() + ' msg ' + st.msg + ')');
  const used1 = st.run.g0dx.used; await sleep(1500);
  check(st.run.g0dx.used === used1, 'paused, it taps nothing');
  // out of clicks
  st.run.g0dx.left = 1; useItem(slot());
  for (let i = 0; i < 40 && st.run.g0dx.left > 0; i++) await sleep(100);
  await sleep(300);
  check(st.run.g0dx.left === 0 && !g0dxOn() && !canUse(st.run.items[slot()]), 'out of clicks: it stops, and the gear says so (' + whyNotItem(st.run.items[slot()]) + ' / ' + at() + ')');
  check(chipOf('divine').bg === '#ff3b3b' && RARITY.divine.label === 'DIVINE', 'DIVINE: G0D red');
` };
