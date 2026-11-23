// Writes docs/QUEST_DIALOG.md: every quest's calls and scenes from dist/data/quests.js, as a script to read.
// The words live in dist/data/quests.js: edit them there, then run: node tools/data/quest_dialog.js
'use strict';
if (['-h', '--help'].includes(process.argv[2])) { console.log("usage: node tools/data/quest_dialog.js [--check]   (rewrites docs/QUEST_DIALOG.md from dist/data/quests.js)"); process.exit(0); }
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'dist/data/quests.js'), 'utf8');
const box = { NEON_FILES: [] };
vm.runInNewContext(src + '\n;this.QUEST_INFO = QUEST_INFO; this.QUEST_LINES = QUEST_LINES; this.QUEST_SCENES = QUEST_SCENES; this.PHISH_SPAM = PHISH_SPAM;', box);
const { QUEST_INFO, QUEST_LINES, QUEST_SCENES, PHISH_SPAM } = box;
const NAMES = { pops: 'POPS', d0g: 'd0g' };
// Who says each call (default: POPS). The game picks the speaker in code: engine/quests.js queueCall('b0y', QUEST_LINES.raid)
// and engine/heaven.js boyTrayHint (raidHint). Change both if a call's speaker changes.
const CALL_WHO = { raid: 'B0Y', raidHint: 'B0Y', rootFine: 'A SHELL SOCKET', rootFirst: 'QUEST CARD', rootJoined: 'ROOT', rootShellHi: 'THE SHELL', rootPending: 'THE SHELL' };
const CALL_WHEN = {
  found: 'You pick up the DISC for the first time.',
  foundOld: 'You pick up the DISC again (you had one before).',
  foundAgain: 'You pick up the DISC after dying with one.',
  uplink: 'You reach the UPLINK with the DISC.',
  deliver: 'The results, after cashing out with the DISC. Buttons: [ TAKE IT TO POPS ] / [ LATER ].',
  rootPops: "The last line of POPS's deck call at USER, while ROOT isn't on your crew.",
  rootFine: "A SHELL socket's card before ROOT moves in (a ticker).",
  rootFirst: 'The first lowercase letter you shred: its QUEST card, with the letter in it.',
  rootClosed: "You close PH1SH's spam ad (the first time).",
  rootBit: "You take PH1SH's bait (the first time).",
  rootBitAgain: "You take PH1SH's bait again.",
  rootAll: 'You have all four letters.',
  rootJoined: 'ROOT joins, after the PAPERWORK scene.',
  rootShellHi: 'THE SHELL, the first time you open it after ROOT joins.',
  rootPending: 'THE SHELL, before ROOT joins.',
};
// Which quest a call or a scene belongs to: ROOT's calls start with root; a scene by its title card's quest name.
const callQuest = k => k.startsWith('root') ? 'root' : 'pops';
const sceneQuest = frames => { const t = frames.find(f => f.title); return (t && Object.keys(QUEST_INFO).find(id => QUEST_INFO[id].name === t.title[0])) || 'pops'; };
const out = [];
const P = s => out.push(s);
P('# NeoN+1 quest dialog');
P('');
P('Every quest\'s calls and scenes, as a script. **This file is generated:** the words live in `dist/data/quests.js`.');
P('Edit them there, then run `node tools/data/quest_dialog.js` to rewrite this file.');
P('');
for (const [id, q] of Object.entries(QUEST_INFO)) {
  P(`## ${q.name}`);
  P('');
  P(`From ${q.from}.`);
  P('');
  P('### Steps');
  P('');
  q.steps.forEach((s, i) => { P(`${i + 1}. **${s.name}**: ${s.goal}`); if (s.held) P(`   - Holding the item, **${s.held.name}**: ${s.held.goal}`); if (s.lost) P(`   - After losing the item: ${s.lost}`); });
  P('');
  P('### Calls');
  P('');
  for (const [k, lines] of Object.entries(QUEST_LINES).filter(([k]) => callQuest(k) === id)) {
    P(`**${k}**${CALL_WHEN[k] ? ': ' + CALL_WHEN[k] : ''}`);
    P('');
    for (const l of [].concat(lines)) P(`> **${CALL_WHO[k] || 'POPS'}:** ${l}  `);
    P('');
  }
  P('### Scenes');
  P('');
  for (const [sid, frames] of Object.entries(QUEST_SCENES).filter(([, f]) => sceneQuest(f) === id)) {
    const title = frames.find(f => f.title);
    P(`#### ${title ? title.title.join(': ') : sid} (\`${sid}\`)`);
    P('');
    for (const f of frames) {
      if (f.title) continue;
      if (f.art) { P('```'); for (const l of f.art) P(l); P('```'); P(''); }
      if (f.upload) { P(`[ ${f.upload.from} >> ${f.upload.to}: the upload bar. A tap starts it; the mold pushes it back twice. ]`); P(''); }
      P(f.who ? `**${NAMES[f.who] || f.who.toUpperCase()}:** ${f.text}` : `*${f.text}*`);
      P('');
    }
  }
  if (id === 'root') {   // PH1SH's spam ads (engine/ads.js phishShow), in turn
    P("### PH1SH's spam ads");
    P('');
    for (const a of PHISH_SPAM) P(`- from **${a.from}**: **${a.head}** ${a.lines.join(' ')} [ ${a.bait} ] / [ close ]`);
    P('');
  }
}
// --check: say whether it's up to date and write nothing (tools/test.js runs it so)
const dest = path.join(ROOT, 'docs/QUEST_DIALOG.md'), text = out.join('\n'), same = fs.existsSync(dest) && fs.readFileSync(dest, 'utf8').replace(/\r\n/g, '\n') === text;
if (process.argv.includes('--check')) { console.log('docs/QUEST_DIALOG.md: ' + (same ? 'unchanged' : 'out of date: run node tools/data/quest_dialog.js')); process.exitCode = same ? 0 : 1; }
else {
  fs.writeFileSync(dest, text);
  console.log('docs/QUEST_DIALOG.md written.');
}
