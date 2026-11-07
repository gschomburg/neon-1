// tools/tests/batch1450.js: the v14.50 changes stay put (Greg's meat notes 2026-11-06): b0y's one cursor everywhere,
// his [b] hint on the OMNI RAID, short hacker chat in the cursor tag, the initials in the workbench's letters. Run by
// tools/test.js (a headless page).
module.exports = { name: 'batch1450', body: `
  // b0y's first OMNI RAID call puts away to the hint: its arrow on [b]; a tap on [b] puts it away and goes through
  {
    Object.assign(questOf('pops'), { step: 'raid', seen: true, raidCalled: false }); save.legacy = save.legacy || {}; save.legacy.crew_b0y = 1; persist();
    B.startRun('B1450TEST', false); await settle('start'); await B.pick(st.lv.safe); await settle('public'); if (st.mode !== 'map') { B.toMap(); await settle('map'); }
    if (st.evCard) closeEventCard();
    for (let i = 0; i < 100 && !st.callBox; i++) await sleep(100);
    check(st.callBox && st.callBox.who === 'b0y', 'b0y calls on the raid');
    await sleep(800); callClose(); await sleep(600);
    check(st.hint && st.hint.pop && st.hint.pop.lay && st.hint.pop.lay.arrow, 'his hint is up, with an arrow');
    check(!featCalm(), 'calls and feats wait while it is up');
    const hb = hits.find(h => h.kind === 'btn' && h.id === 'b0y');
    check(hb && hintTap(hb) === false, 'a tap on [b] goes through');
    check(!st.hint || !st.hint.pop, 'the hint is put away');
  }

  // the hackers' cursor: their mark, the tag under it (inverted while they talk); b0y's marks in the G0D fight use it
  {
    const drawn = [], put = (x, y, s, col) => drawn.push({ x, y, s, col }), bgs = [], bg = (x, y, w, col, a) => bgs.push({ x, y, w, col, a });
    drawHkCursor(put, bg, 5, 10, 'b0y', { say: 'closer.' });
    const sty = hkStyle('b0y');
    check(drawn[0].s === logoMark('b0y') && drawn[0].y === 10, 'his mark on the cursor row');
    check(drawn[1].y === 11 && drawn[1].s === ' closer. ' && drawn[1].col === sty.bg && bgs[1].col === sty.fg, 'what he says: under it, inverted');
    const cells = hkCursorCells(5, 10, 'b0y', { say: 'closer.' });
    check(cells.length === 3 + ' closer. '.length, 'his cells: the mark and the tag');
    const p = { stage: 'fight', boy: { single: true, phase: 'found', until: performance.now() + 5000, curs: [{ x: 10, y: 8, tx: 10, ty: 8, tag: 'here', point: true }] } };
    const m = g0dfBoyMarks(p, performance.now());
    check(m.length === 1 && m[0].v && m[0].v.x === 10 && m[0].y === m[0].v.y - 2, 'in the fight: his v on the spot, his cursor above it');
  }

  // short chat from a hacker goes in their cursor tag (every time now)
  {
    await enterNode(Object.values(st.run.map).find(n => n.type === 'corp'), true); await settle('corp');
    hkSpawn('b0y', 'call'); await sleep(1500);
    const h = hkList().find(x => x.id === 'b0y');
    let tagged = 0; for (let i = 0; i < 6; i++) { hkSay(h, 'closer.', false, true); if (hkS(st.lv, h).bubble && hkS(st.lv, h).bubble.text === 'closer.') tagged++; hkS(st.lv, h).bubble = null; }
    check(tagged === 6, 'short chat in the tag: ' + tagged + ' of 6');
  }
` };
