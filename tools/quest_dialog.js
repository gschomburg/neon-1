// Writes docs/QUEST_DIALOG.md: every quest's calls and scenes from dist/data/quests.js, as a script to read.
// The words live in dist/data/quests.js: edit them there, then run: node tools/quest_dialog.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'dist/data/quests.js'), 'utf8');
const box = { NEON_FILES: [] };
vm.runInNewContext(src + '\n;this.QUEST_INFO = QUEST_INFO; this.QUEST_LINES = QUEST_LINES; this.QUEST_SCENES = QUEST_SCENES;', box);
const { QUEST_INFO, QUEST_LINES, QUEST_SCENES } = box;
const NAMES = { pops: 'POPS', d0g: 'd0g' };
const CALL_WHEN = {
  found: 'You pick up the DISC for the first time.',
  foundOld: 'You pick up the DISC again (you had one before).',
  foundAgain: 'You pick up the DISC after dying with one.',
  uplink: 'You reach the UPLINK with the DISC.',
  deliver: 'The results, after cashing out with the DISC. Buttons: [ TAKE IT TO POPS ] / [ LATER ].',
};
const out = [];
const P = s => out.push(s);
P('# NeoN+1 quest dialog');
P('');
P('Every quest\'s calls and scenes, as a script. **This file is generated:** the words live in `dist/data/quests.js`.');
P('Edit them there, then run `node tools/quest_dialog.js` to rewrite this file.');
P('');
for (const [id, q] of Object.entries(QUEST_INFO)) {
  P(`## ${q.name}`);
  P('');
  P(`From ${q.from}.`);
  P('');
  P('### Steps');
  P('');
  q.steps.forEach((s, i) => { P(`${i + 1}. **${s.name}**: ${s.goal}`); if (s.lost) P(`   - After losing the item: ${s.lost}`); });
  P('');
  P('### Calls');
  P('');
  for (const [k, lines] of Object.entries(QUEST_LINES)) {
    P(`**${k}**${CALL_WHEN[k] ? ': ' + CALL_WHEN[k] : ''}`);
    P('');
    for (const l of lines) P(`> **POPS:** ${l}  `);
    P('');
  }
  P('### Scenes');
  P('');
  for (const [sid, frames] of Object.entries(QUEST_SCENES)) {
    const title = frames.find(f => f.title);
    P(`#### ${title ? title.title.join(': ') : sid} (\`${sid}\`)`);
    P('');
    for (const f of frames) {
      if (f.title) continue;
      if (f.art) { P('```'); for (const l of f.art) P(l); P('```'); P(''); }
      P(f.who ? `**${NAMES[f.who] || f.who.toUpperCase()}:** ${f.text}` : `*${f.text}*`);
      P('');
    }
  }
}
fs.writeFileSync(path.join(ROOT, 'docs/QUEST_DIALOG.md'), out.join('\n'));
console.log('docs/QUEST_DIALOG.md written.');
