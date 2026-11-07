// tools/checks/tests/batch1451.js: sharing a seed (v14.51, Greg 2026-11-07). The page opens as a shared link (?seed=SHARE7):
// it plays like a seed picked in game (the seed boards, not practice), the seed leaves the address bar, and [SHARE]
// builds the link and puts it on the title and the results. Run by tools/test.js (a headless page).
module.exports = { name: 'batch1451', query: 'seed=SHARE7&nointro=1', body: `
  await settle();
  check(st.seed === 'SHARE7' && st.seeded && !st.practice, 'a link seed: on the seed boards, not practice');
  check(!/seed=/.test(location.search) && /nointro=1/.test(location.search), 'the seed left the address bar (other params stay)');
  check(hits.some(h => h.id === 'shareseed'), '[SHARE] on the title');
  { let got = null; const was = copyText; copyText = async t => { got = t; return true; };
    await shareSeed('ABC123');
    check(got && got.endsWith('?seed=ABC123') && !/nointro/.test(got), 'the link: this page with ?seed= only (' + got + ')');
    check(seedShared(), 'the button says it copied');
    copyText = was; }
  B.startRun(st.seed, st.practice, { seeded: st.seeded }); await settle('start');
  check(st.run.seeded && !st.run.practice, 'the run from it is ranked on the seed boards');
` };
