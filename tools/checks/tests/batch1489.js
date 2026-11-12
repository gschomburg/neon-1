// tools/checks/tests/batch1489.js: the INT row (v14.89, engine/hud.js). The life slot (INT / ROT / LIFE) on row 2's
// right; the status chip (FW in hex to F, 1UP, COIN FLIP's $xN) one space left of its label, taking turns;
// n/max past 10 max INT, counting; row 3 without the sector. Run by tools/test.js (a headless page, harness.js).
module.exports = { name: 'batch1489', body: `
  const row = y => { const a = Array(L.wc).fill(' '); for (const c of buildScene(performance.now(), false)) if (Math.round(c.cy) === y && c.cx >= 0 && c.cx < L.wc) a[Math.round(c.cx)] = c.ch; return a.join(''); };
  const at = (y, s) => row(y).indexOf(s);
  await shellOnMap();
  const run = st.run;
  run.sector = 1; run.maxInt = 5; run.integrity = 5; run.shield = 0; run.oneUp = 0;
  await sleep(300);
  check(!/SECTOR/.test(row(3)) && /^OVERWORLD/.test(row(3)), 'row 3 says OVERWORLD, no sector: ' + row(3));
  check(/LAYER \\d\\d S2/.test(row(2)), 'the sector is on row 2: ' + row(2));

  // FW: hex, stops at F; one space left of INT
  run.shield = 3; await sleep(300);
  check(at(2, 'FW3') >= 0 && at(2, 'FW3') === at(2, 'INT') - 4, 'FW3 sits one space left of INT: ' + row(2));
  run.shield = 12; await sleep(400);
  check(at(2, 'FWC') >= 0, 'FW 12 reads FWC: ' + row(2));
  check(fwTag(40) === 'FWF' && FW_MAX === 15, 'FW stops at F');
  run.shield = FW_MAX;
  check(!GEAR.wall.ok({ tier: 0, run, onMap: true }), 'a FWALL can\\'t go past F');

  // two chips take turns
  run.oneUp = 1; await sleep(400);
  const seen = new Set();
  for (let k = 0; k < 40; k++) { const r = row(2); if (r.includes('1UP')) seen.add('1UP'); if (r.includes('FWF')) seen.add('FWF'); await sleep(200); }
  check(seen.size === 2, 'FW and 1UP take turns: ' + [...seen]);
  run.oneUp = 0; run.shield = 0; await sleep(600);
  check(!/FW|1UP/.test(row(2)), 'no chips, nothing there: ' + row(2));

  // COIN FLIP: $xN in the chip, not on row 3
  addMod('coinflip', 0); run.coinMult = 3; await sleep(500);
  check(at(2, '$x3') === at(2, 'INT') - 4, 'COIN FLIP is a chip: ' + row(2));
  check(!/x3/.test(row(3)), 'and not on row 3: ' + row(3));
  run.coinMult = 1; await sleep(500);
  check(!/\\$x/.test(row(2)), 'no chip at x1');

  // past 10 max INT: n/max, padded, counting to a new value
  run.shield = 2; run.maxInt = 15; run.integrity = 15; await sleep(1500);
  check(row(2).endsWith('15/15'), 'n/max past 10: ' + row(2));
  check(at(2, 'FW2') === at(2, 'INT') - 4, 'the chip moves with the width: ' + row(2));
  run.integrity = 9; await sleep(60);
  const mid = row(2);
  check(!mid.endsWith(' 9/15'), 'it counts down, not a jump: ' + mid);
  await sleep(1500);
  check(row(2).endsWith(' 9/15'), 'padded to the max\\'s width: ' + row(2));
  run.integrity = 3; await sleep(1500);
  const three = buildScene(performance.now(), false).find(c => Math.round(c.cy) === 2 && c.cx === L.wc - 4 && c.ch === '3');
  check(three && three.col === C.danger, 'red at 3 in number mode');
  run.maxInt = 5; run.integrity = 5; await sleep(400);
  check(row(2).endsWith('INT #####'), 'back to the bar at 5 max: ' + row(2));

  // BLOOD MONEY: no hit-n on the header; the chip goes left of LIFE
  addMod('bloodmoney', 0); run.shield = 1; await sleep(500);
  check(!/hit/.test(row(2)) && /LIFE/.test(row(2)), 'BLOOD MONEY: LIFE, no hit-n: ' + row(2));
  check(at(2, 'FW1') === at(2, 'LIFE') - 4, 'the chip sits left of LIFE: ' + row(2));
  check(/a hit: \\d+cr\\+/.test(MODS.bloodmoney.tip), 'the tip says what a hit costs: ' + MODS.bloodmoney.tip);
  shellEndRun(); await settle('end');
` };
