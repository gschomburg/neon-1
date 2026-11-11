// ---------------- Help: how each tab works, and how what you change gets into the game ----------------
// (the user, 2026-10-26: the content editing guide lives in the editor, a help button that opens on the tab you're on)
(() => {
  const { $ } = NEON_ED;
  const F = p => '<code class="file">' + p + '</code>';
  const go = (k, t) => '<a data-go="' + k + '">' + (t || k) + '</a>';
  const HELP = {
    saving: { name: 'how saving works', html: `
<h1>How saving works</h1>
<p class="lead">The editor runs the real game on the left. You change things on the right; the game shows them right away. Nothing is in the game's files until you save.</p>
<h2>Two kinds of tab</h2>
<ul>
<li><b>Tabs that save a file:</b> palette, art, training, economy. <b>save</b> (or Ctrl S) writes the file into the game's ${F('dist/')} folder.</li>
<li><b>Tabs that copy:</b> music, gear &amp; mods. They don't write files. <b>copy</b> puts text on the clipboard: paste it into a chat with Claude, and it goes in from there.</li>
</ul>
<h2>The first save</h2>
<ol>
<li>Chrome (or Edge) asks you to pick the file or folder. The hint at the top right of each tab names it:
  <ul><li>palette: the file ${F('dist/data/palettes.js')}</li><li>art: the folder ${F('dist/data/art')}</li><li>training, economy and fx: the folder ${F('dist/data')} (one pick for all three)</li></ul></li>
<li>Allow it to edit files. The editor remembers the choice, so later saves just save.</li>
</ol>
<p>Another browser can't write files: save downloads the file instead. Put it in that folder by hand, over the old one.</p>
<h2>The other buttons</h2>
<ul>
<li><b>reload</b>: load the file from disk again. Drops what you haven't saved.</li>
<li><b>revert</b> (on one thing): back to its saved version.</li>
<li><b>reload game</b> (over the game): starts the game frame fresh, with the files as they are on disk. <b>music</b> and <b>sfx</b> beside it switch the game's music and sound effects (lit = on; the same switches as the TESTING tab's).</li>
</ul>
<h2>Saved files</h2>
<p>Save rewrites the whole file in its own neat format, so a hand edit in the same file is fine as long as it keeps that format. (The economy file warns you about a number it doesn't know rather than drop it.)</p>
<h2>Getting it to players</h2>
<ol><li>Save.</li><li>Commit (ask Claude: "commit").</li><li>Upload ${F('dist/')} to the site.</li></ol>` },

    music: { name: 'music', html: `
<h1>Music</h1>
<p class="lead">Every track, and which corp plays which. Pick a corp: the game shows one of its layers and plays its track.</p>
<h2>Corps view</h2>
<ul>
<li>One row per corp: the track it plays now, with its stars.</li>
<li><b>change to</b>: pick a different track. The row is marked changed; <b>undo all</b> puts them back.</li>
<li><b>needs a track</b> / <b>changed</b>: filter to just those.</li>
<li><b>copy assignments</b>: copies your changes. Paste them to Claude to put them in the game.</li>
</ul>
<h2>Tracks view</h2>
<ul>
<li>Every track. Click one to play it; click a column header to sort.</li>
<li><b>Narrowing down</b>: stars (shift + 1-5), keep / maybe / cut (k / y / x), and a note. These stay in this browser.</li>
<li><b>copy the list</b>: your stars, tags and notes as text, to share.</li>
</ul>
<h2>The player</h2>
<ul>
<li><b>level</b> 0-4 plays a track the way the game does at that depth (g: the game's level). <b>urgency</b>, <b>heartbeat</b>, <b>boss win</b> and <b>game over</b> are the moments the game adds.</li>
<li><b>Try another band</b>: swap the instruments. It plays live and is remembered in this browser. <b>copy track</b> / <b>copy all changes</b>: paste to Claude to make it real.</li>
</ul>
<h2>Keys</h2>
<p>space play / stop, up / down the next corp or track, 0-4 level, g the game's level, h heartbeat.</p>` },

    pal: { name: 'palette', html: `
<h1>Palette</h1>
<p class="lead">The game's color palettes, the rarity chips and the player styles. Saves ${F('dist/data/palettes.js')}.</p>
<h2>Editing a palette</h2>
<ul>
<li>Pick one with &lt; / &gt; or the list. Name, note, and <b>starter</b> (offered in SETTINGS from the start).</li>
<li><b>Colors</b>: change any color in its row. <b>random: smart</b> makes one that follows the rules; <b>random: wild</b> is anything. Tick a color's box to lock it before you roll.</li>
<li><b>darkness</b> (top bar): BLACKOUT's effect, every color but danger fading into the background. Only the preview: it isn't saved.</li>
<li><b>Checks</b> warns when colors are too close to read; <b>Looks like</b> lists palettes that are nearly the same.</li>
<li>The game on the left wears the palette as you edit.</li>
</ul>
<h2>The other tabs</h2>
<ul>
<li><b>all palettes</b>: every palette as a card. Filter, sort, click one to edit it.</li>
<li><b>rarity chips</b>: the rarity colors (scrap to exotic), the same on every palette.</li>
<li><b>player styles</b>: name and logo colors. New ones go at the end; none can be removed (saved profiles point at them by place).</li>
</ul>
<h2>Saving</h2>
<p><b>undo</b> / <b>redo</b> (Ctrl Z / Ctrl Shift Z). <b>save palettes.js</b> writes the file (the first time, pick ${F('dist/data/palettes.js')}). <b>export</b> copies the whole file and downloads it. More: ${go('saving', 'how saving works')}.</p>` },

    items: { name: 'gear & mods', html: `
<h1>Gear &amp; mods</h1>
<p class="lead">Every piece of gear and every mod: rarity steps, short tip, full text, codex text. Read from ${F('dist/data/mods.js')}. This tab doesn't save.</p>
<h2>Looking</h2>
<ul>
<li><b>cards</b>: one card each, every rarity step. <b>ladder</b>: one row each, a column per rarity.</li>
<li>Sort: <b>file</b> (as in data/mods.js), <b>corp level</b> (corp mods by their corp's level, LV1 first, OMNI last; pick <b>corp</b> to see only those), <b>a-z</b>, <b>rarity</b> (by the first step).</li>
<li>Filter by kind (gear, general, minor, exotic, corp) or by text. A corp mod's corp name shows that corp in the game.</li>
</ul>
<h2>Testing in the game</h2>
<ul>
<li><b>give</b> / <b>set</b> on a step puts that mod, at that step, on the run in the game. The bar at the top shows what the run holds; <b>held ✕</b> removes one. No slot limit here.</li>
<li><b>+1</b> on a gear step puts one of that gear, at that step, in the run's gear slots (if there's room).</li>
</ul>
<h2>Changing the words</h2>
<ul>
<li><b>copy as text</b> copies what's shown. Edit it, and paste it to Claude with what to change.</li>
<li>Numbers in a mod's text (prices, multipliers) come from the ${go('econ', 'economy')} tab: change them there and the text follows.</li>
</ul>` },

    art: { name: 'art', html: `
<h1>Art</h1>
<p class="lead">Node glyphs, logos (players', corps' and hackers'), hacker faces (POPS's too) and the world map. Saves the changed files in ${F('dist/data/art/')}.</p>
<h2>Editing</h2>
<ol>
<li>Pick a piece on the left (filter to find it).</li>
<li>Edit it in the box, or <b>edit in asXii</b>: it opens in a new tab at the right size (Chrome may ask to allow the pop-up).</li>
<li>In asXii, draw, then <b>send back to NeoN+1</b> in its bottom bar. The art comes back here.</li>
<li><b>show in game</b>: the game shows it where it's used (a layer, the profile, the corp's intro, the boot map).</li>
<li><b>save</b> (the first time, pick the ${F('dist/data/art')} folder).</li>
</ol>
<h2>Adding</h2>
<ul>
<li><b>+ glyph</b>: a new node glyph, at the end. <b>+ logo</b>: a new logo (name, lore, id, mark, kind).</li>
<li>Logos fit one 24 x 7 box.</li>
</ul>
<p><b>copy</b> copies a piece as text; <b>revert</b> puts one back the way it was saved. More: ${go('saving', 'how saving works')}.</p>` },

    tut: { name: 'training', html: `
<h1>Training</h1>
<p class="lead">Everything POPS says, in order. Saves ${F('dist/data/tutorial.js')}. Edits show in the game as you type.</p>
<h2>Moving through it</h2>
<ul>
<li><b>show</b> on a line: the game plays the training up to that line.</li>
<li><b>play from the start</b>, <b>&lt; back</b>, <b>next &gt;</b>. The line the game is on is marked.</li>
</ul>
<h2>The kinds of line</h2>
<ul>
<li><b>tap to go on</b>: POPS says it, and waits for a tap.</li>
<li><b>do this</b>: POPS shrinks to a short order (about 3 words) by the thing to tap. If the line has text too, he explains first, then shrinks.</li>
<li><b>timed</b>: ticked, it moves on by itself after that many ms (a tap still skips it). The training is all tap-through right now.</li>
<li><b>swaps into ...</b>: said in place of another line's do-this (a wrong tap, the boss beaten). One way to say it per line: the game picks one at random.</li>
<li><b>arrow</b>: on a line that points at something, draw the arrow. Off, POPS still sits by it.</li>
</ul>
<p>Words in {braces} are filled in by the game (like <code>{int}</code>). A blank line in the text is a paragraph break.</p>
<p><b>save</b> (the first time, pick the ${F('dist/data')} folder). More: ${go('saving', 'how saving works')}.</p>` },

    econ: { name: 'economy', html: `
<h1>Economy</h1>
<p class="lead">Every money number in the game, in one place. Saves ${F('dist/data/economy.js')}. Edits go to the game live.</p>
<h2>Units</h2>
<ul>
<li>The bar at the top: the <b>earn unit</b> and the <b>spend unit</b> (10cr each), and how much each side grows every sector.</li>
<li>Most numbers are a count of units: repair 2 = 2 spend units = 20cr. Change a unit and that whole side moves together; change one number and only that thing moves.</li>
</ul>
<h2>The kinds</h2>
<ul>
<li><b>earn</b> / <b>spend</b>: units. <b>cr</b>: plain credits. <b>x</b>: a multiplier. <b>%</b>: a share (0.05 = 5%). <b>grow</b>: added each sector. <b>count</b>: how many.</li>
<li>A list (like <code>1, 1.6, 2.5</code>) is one per rarity step.</li>
<li><b>show credits at sector</b> 1 / 2 / 3: what each number comes to in credits that deep.</li>
</ul>
<h2>Saving</h2>
<p><b>revert</b> on a row puts it back. <b>save</b> writes the file (the first time, pick the ${F('dist/data')} folder). More: ${go('saving', 'how saving works')}.</p>
<h2>Checking a change</h2>
<p>Ask Claude to run the economy sim (${F('tools/checks/econsim.js')}): a bot plays whole runs and reports what they earn and hold. Results go in ${F('docs/ECONOMY.md')}.</p>` },
    ads: { name: 'ads', html: `
<h1>Ads</h1>
<p class="lead">Every fake ad in ${F('dist/data/ads.js')}, drawn the way the game draws it (30 x 18 inside the box). Read-only here: ads are changed in the file (or ask Claude).</p>
<ul>
<li><b>show in the game</b> puts that ad up over whatever the game shows (two-screen ads turn on their own). <b>show a random one</b>: any ad.</li>
<li>Underlined lines are buttons: tapping one closes the ad and shows a line (hover to read it).</li>
<li>Bars (<code>{bar}</code>) are drawn half full here; in the game they fill while the screen is up.</li>
<li>How often ads come up: ${F('dist/engine/ads.js')} (AD_CFG). The ideas list: ${F('docs/ADS.md')}.</li>
</ul>` },
    hack: { name: 'hackers', html: `
<h1>Hackers</h1>
<p class="lead">The hacker cast in ${F('dist/data/hackers.js')}: who they are and how each one's AI should play. None of them play yet (RIVAL is the only hacker in the game; it becomes D0PPEL). Read-only here: ask Claude to change them.</p>
<ul>
<li><b>bad</b> hackers show up against you (an anomaly, a sector event, an ICE hit). <b>good</b> ones come only when you call them with gear, never take your pay, and later take mods.</li>
<li>Each card: the face (5 x 3, like POPS's), the logo (beating a bad hacker unlocks it), health, the line the player reads, lore, how the AI plays, and the hacker it counters (click to jump there).</li>
<li>Faces and logos are edited in the ${go('art', 'art tab')} (<b>hacker faces</b>, <b>hacker logos</b>), with asXii too. This tab shows the art tab's unsaved edits.</li>
</ul>` },
    term: { name: 'terminal', html: `
<h1>Terminal</h1>
<p class="lead">A readme for THE TERMINAL, the dev console you type into over the game (${F('dist/engine/terminal.js')}; the plan: ${F('docs/TERMINAL.md')}). The list is read from the game frame, so it's always what the game has. Read-only here: commands are added in the game's code (or ask Claude).</p>
<ul>
<li>Each command: how you type it (<code>&lt;arg&gt;</code> needed, <code>[arg]</code> optional), what it does, and what each argument can be. <b>(list)</b> shows every choice (the mods, the corps...).</li>
<li><b>practice</b> commands mark the run practice (not scored); <b>safe</b> ones don't.</li>
<li><b>type</b> puts the command in the game's terminal for you to finish there (Tab fills in, Enter runs). <b>run</b> runs it now (only commands that need nothing more).</li>
<li>The filter matches names, what a command does, and its group.</li>
</ul>` },
    test: { name: 'testing', html: `
<h1>Testing</h1>
<p class="lead">Cheats and jumps on the game on the left, for playing things through. Nothing here writes a file. Every cheat makes the run practice (not scored).</p>
<ul>
<li><b>Run:</b> a new test run (on the map, after the public net); god (no damage), show the real node, free travel (go to any node); stop clocks (off by default: turn it on and layer timers hold still, for looking at a screen); the game's music and sfx start on; music and sfx (the game's own; the music tab takes over while it plays a track); set credits and INT, heal; set REP (your saved REP: works without a run).</li>
<li><b>Quests:</b> open the quest (marks a sector cleared and puts POPS on your crew), give the DISC (a run needed), set the quest step, make POPS call, play the scene.</li>
<li><b>Sector events:</b> click one and the game starts a new run and climbs straight to sector 2 with that event: its card comes up first. The sector name on the map shows the card again.</li>
<li><b>Jump:</b> to sector 2-5 (events rolled as usual); into this sector's boss; clear the sector (the success screen); straight to the uplink; or <b>go fishing</b> (a PIER, with at least 100cr).</li>
<li><b>Anomaly on the next corps:</b> puts that anomaly on the corps you can go to next (THIEF also adds THE FENCE); <b>none</b> takes them off.</li>
<li><b>THE FENCE:</b> steal my last mod sends it to THE FENCE, next to the sector boss, to buy back.</li>
<li><b>Give:</b> three rows: a <b>mod</b> at any step (by kind: gen, minor, exotic, corp), <b>gear</b> (normal, boss gear, CALL gear), or <b>loot</b> (loot, phish catches, which turn into PHISH like at a pier, and the quest DISC). The gear &amp; mods tab has every one, with its text.</li>
<li><b>Feats:</b> click one to grant it (lit) or take it back; <b>box</b> shows its FEAT box once the game is calm (on a menu or the map). <b>wipe progression</b> does the version wipe on your own save: REP back for THE BOARD's posts, feats, titles and the record cleared. THE BOARD: the <b>board</b> scene button, or the title.</li>
</ul>
<p>The line at the top is the game right now: sector, its event, credits, INT, and what's on.</p>` },
    g0d: { name: 'g0d', html: `
<h1>G0D</h1>
<p class="lead">G0D's fight designs and effects, drawn in the game on the left so they can be judged on a real screen. They're mockups: nothing here is in a run, and nothing is saved.</p>
<ul>
<li><b>Click a look</b> and the game goes to the screen it belongs on (a corp layer, the sector map, the win screen, the death screen), then draws it there. <b>prev / next</b> step through them all; <b>hold still</b> stops the animation; <b>off</b> takes it away.</li>
<li><b>The health bar</b> is its own overlay, so the designs don't carry one: pick a style (in the header: G0D where LAYER was, the bar where the corp's name was; or across the board's top row) and it goes over whatever look is up (or a corp layer). It takes a hit every 1.6s, then fills back up. Click it again for off.</li>
<li><b>The fight</b> (both mockup pages): the design takes the board of a corp layer, squeezed to the board's width. Its top row is G0D's boss bar; its bottom row says what's going on.</li>
<li><b>On other screens:</b> THE NETWORK GOES (the mold eats the sector map, then the bar comes up), NOT DEAD YET (the win screen: the mold creeps back and the bar returns), MOLD GLITCH (bits of the screen flicker to mold), G0D ON THE DEATH SCREEN (its spilling logo). The effects loop.</li>
</ul>
<p>The code: dist/engine/g0d.js. The design notes: docs/QUESTS.md, "G0D's fights".</p>` },

    fx: { name: 'fx', html: `
<h1>FX</h1>
<p class="lead">Every effect's settings, the global look: change one here and every place using that effect changes. Saves ${F('dist/data/fx.js')}. Edits go to the game live.</p>
<ul>
<li><b>show</b> under an effect puts a place that uses it up in the game on the left: a cutscene frame (it plays over and over), d0g's rival card or death screen, or G0D's mold glitch. <b>stop showing</b> takes it off.</li>
<li><b>Numbers drag:</b> drag sideways to change one, or click it to type. Shift moves 10x, Alt 0.1x. A changed setting has an orange edge; <b>revert</b> puts an effect back to what's saved.</li>
<li><b>Colors</b> are a palette name (accent, danger, money, bright, mid, dim...), a <code>#hex</code>, or <code>ink:d0g</code> for a hacker's own.</li>
<li><b>Shared characters</b> at the top: the glitch set and the noise set, used by name in several effects.</li>
<li>A place can still have its own settings (a cutscene layer's <code>glitch: { col: 'danger' }</code> in ${F('dist/data/quests.js')}, d0g's tics in ${F('dist/data/hackers.js')}). Those win over what's here.</li>
</ul>
<p><b>save</b> (the first time, pick the ${F('dist/data')} folder; the same one as training and economy). More: ${go('saving', 'how saving works')}. The plan: docs/EFFECTS.md.</p>` },
  };
  const ORDER = ['saving', null, 'music', 'pal', 'items', 'art', 'tut', 'econ', 'ads', 'hack', 'term', 'test', 'g0d', 'fx'];
  let open = false, at = 'saving';
  const modeNow = () => (document.body.className.match(/mode-(\w+)/) || [])[1] || 'music';
  const nav = $('#helpNav');
  for (const k of ORDER) {
    if (!k) { nav.appendChild(Object.assign(document.createElement('div'), { className: 'sep' })); continue; }
    const b = Object.assign(document.createElement('button'), { textContent: HELP[k].name });
    b.dataset.k = k; b.onclick = () => show(k); nav.appendChild(b);
  }
  function show(k) {
    at = HELP[k] ? k : 'saving';
    $('#helpBody').innerHTML = HELP[at].html;
    $('#helpBody').scrollTop = 0;
    for (const b of nav.querySelectorAll('button')) b.classList.toggle('on', b.dataset.k === at);
  }
  function toggle(on = !open) {
    open = on;
    $('#help').classList.toggle('show', open);
    $('#helpBtn').classList.toggle('on', open);
    if (open) { $('#help').style.top = $('#modes').offsetHeight + 'px'; show(modeNow()); }
  }
  $('#helpBtn').onclick = () => toggle();
  $('#helpBody').addEventListener('click', e => { const a = e.target.closest('a[data-go]'); if (a) show(a.dataset.go); });
  // switching tabs closes it (the tab is what you came to see)
  document.addEventListener('neon-mode', () => toggle(false));
  addEventListener('keydown', e => {
    if (e.key === 'F1') { e.preventDefault(); toggle(); }
    else if (e.key === 'Escape' && open) toggle(false);
  });
})();
