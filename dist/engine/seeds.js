// NeoN+1 engine/seeds.js: QUEST SEEDS, the seeds that are a quest's own run (type it on the title, or [ PLAY IT ] on THE
// BOARD > QUESTS). Each one's rules in one place, so a new one (BAUD's race, the cult's seed: docs/QUESTS.md) is an
// entry here plus its own story code, not edits all over the engine. Loads before engine/map.js.
// A seed (SEED_DEFS[id]; run.quest is the id):
//   seed      what you type (upper case)
//   practice  true / false / a function: is the run unscored (H3AV3N: till you've beaten G0D once)
//   items     gear it starts with                      sectors   how many sectors, then you're out (no deeper)
//   event     the sector event in every sector          mapSong   the map's music (corps keep their own)
//   rival     'dog': the only rival is the dog (d0g, or w00f once b0y's on your crew)
//   gear      an item flag only this seed lets drop (ITEMS[k].hunt)
//   shop      { key: weight x } for market gear          gift      { corp: [item, its line] }: breaching that corp gives it
//   again     the end screen's big button: { text, onTap }
//   start(run) anything else when the run starts (H3AV3N: heaven, the mold)
//   uplink(run) the UPLINK's stand-in, or null for the usual one (H3AV3N's broken one in sector 1)
//   sector(run) makes the next sector's map itself: true if it did (H3AV3N: sector 2 is heaven)
'use strict';
NEON_FILES.push(['engine/seeds.js', 'v16.02']);

const SEED_DEFS = {
  // DOG DAYS (POPS's quest, step 5: engine/quests.js, engine/had3s.js): two sectors of THE HUNT, only the dog
  had3s: { seed: 'HAD3S', practice: false, items: ['leash'], sectors: 2, event: 'hunt', mapSong: 'zeroday', rival: 'dog', gear: 'hunt',
    shop: { tunnel: 4, mesh: 4 }, gift: { apiary: ['honey', 'APIARY left something sweet behind. H0NEY.'] },   // (HAD3S: TUNNEL and MESH turn up more; H0NEY only from APIARY: the user, 2026-11-06)
    again: { text: 'R U N   H A D 3 S   A G A I N', onTap: () => runHad3s() } },
  // G0D MODE (step 7: engine/heaven.js): sector 1 under the mold, a broken UPLINK, sector 2 is heaven
  h3av3n: { seed: 'H3AV3N', practice: () => !save.beatG0D, start: run => { run.heaven = true; questMold(run); },
    uplink: run => run.sector === 0 ? openBrokenUplink : null,
    sector: run => { if (run.sector !== 1) return false; addHeavenSector(run.map, run.seed, 1); return true; } },
};
const questSeed = seed => Object.keys(SEED_DEFS).find(id => SEED_DEFS[id].seed === seed) || null;
const seedDef = (run = st.run) => (run && run.quest && SEED_DEFS[run.quest]) || null;
// the run's last sector on a seed with a count (HAD3S: the bottom; no UPLINK, you cash out)
const seedBottom = (run = st.run) => { const d = seedDef(run); return !!(d && d.sectors && run.sector >= d.sectors - 1); };
