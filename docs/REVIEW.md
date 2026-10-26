# Greg's review list

Things Claude built or decided that need your eyes. Tick one off (`[x]`) when you've looked, or
leave a note under it for Claude. Newest at the top. (Claude adds to this list; the backlog of things
to build stays in `docs/SPEC.md` §16f.)

## Open

- [ ] **The art catalog** (v13.27-v13.28, asXii v0.143, 2026-10-26). `tools/neon_editor.html`, the **ART** tab. The art
  now lives in `dist/data/art/`: glyphs.js, logos.js (every logo: players' and corps'), worldmap.js. Try: pick
  KERNING under corp logos, **edit in asXii** (Chrome may ask to allow the pop-up), draw, **send back to NeoN+1** in the
  bar at the bottom of asXii; **show in game**; **+ glyph** / **+ logo** (name, lore, id, mark, kind); **save** (the
  first time, pick the `dist/data/art` folder). In the game: beat a corp, then its logo is in your profile's logo
  picker. Check: every logo now sits in one 24 x 7 box (player logos have a blank row above and below), CORP BREACHED
  after a boss win lost its two blank rows to fit, corp marks are their map codes (`KN3`; OMNI `[!]`), and asXii
  loading art replaces its canvas (Ctrl Z there brings yours back). The title art isn't in (it's built from parts).
  Tell Justin: asXii has a new `neon-link.js` and app.js's `window.asxii` exposes changed / zoomFit / toast.

- [ ] **The to-do batch** (v13.26, 2026-10-25). Play and listen:
  - **KERNING**: a whole line of the real node is off now, and by more. Still easy enough at layer 3 / deep corps?
  - **The real-node sound**: a climbing "yes!" with a held high note. Bad hits add a falling "uh-oh". Too much / too long?
  - **X-AXIS / Y-AXIS**: the color band along the row / column, from your tap to the real node (a miss fills the whole
    line, dim, and fades).
  - **Rest stops**: 2 a stage on the map. My call: the market (row 3) always stays, plus one random stop from the other
    rows (data cache or safehouse, sometimes a second market). If you'd rather have the cap on the path instead, say so.
  - **Editor mod picker**: `tools/neon_editor.html`, ITEMS & MODS. The bar at the top says what the game's run holds.
    Click give / set on any step (cards), or a cell (ladder); `held ✕` removes. No slot limit there (it's for testing).

- [ ] **Items & mods page in the editor** (2026-10-25): `tools/neon_editor.html`, the ITEMS & MODS tab. Every item and mod with its rarity steps (chip, tip, full text) and codex text; **ladder** view puts one mod per row, one column per rarity; filter by kind or text; **copy as text** for notes. Click a corp mod's corp to show it in the game. Read-only for now: say if you want to edit copy there.
- [ ] **The new rarity ladder** (v13.19, 2026-10-25). SCRAP white, COMMON green, RARE blue, EPIC purple, LEGEND orange
  (was BOSS), EXOTIC gold. My rebalance calls, for you to check in play: PATCH / PURGE / COOLANT start at scrap, BURNER is
  common, TRACER rare > epic, KEYLOGGER rare > epic > legendary, and new legendary steps for SNIFFER (2 ICE a layer) and
  VIRUS (spreads twice). Legendary steps roll 5% of the time (or take the mod twice). The chip colors can be tuned in the
  editor's palette mode (rarity chips tab).

- [ ] **Small batch** (v13.18, 2026-10-25). BLACKOUT's boss layer now and then says `it is pitch black. a grue is near.`;
  pick screens tag offers `mod` / `mod+`; the game-over screen scrolls your mods and items with the map; the title shows
  your board rank; and the hosted game offers `[ vX is out: UPDATE ]` when a newer build is uploaded (upload
  `dist/version.json` with the rest of `dist/`). My test runs put a few scores on the **dev** boards: the dashboard's
  "clear dev data" (dev / testing view) cleans them up.

- [ ] **The new editor: `tools/neon_editor.html`** (v13.17, 2026-10-25). Open it in Chrome. MUSIC mode (the default):
  click a corp, the game on the left shows one of its layers and plays its track. If there's no sound, click the game
  once (browsers want a click inside the frame). Try: up / down through the corps, the level buttons (and "game"), the
  scene buttons over the game (boss, a miss), "try another band" while it plays, the PALETTE mode (same as the palette
  editor, and the corp picker now lists every corp). Notes on what doesn't fit or feel right: the layout was a first pass.

- [ ] **Header, play stats, tester mode** (v13.16, 2026-10-25).
  - The header says **NeoN+1**; in a run, tap it (or Esc) for the menu. `[MENU]` is gone.
  - **Upload** `dist/` (the game) and the greglytics `server/` files (`admin/index.php`, `api/version.php`); then
    `node greglytics/check-version.js` should say 1.2, all ok.
  - **On your phone, open the game once with `?dev=1`** so your test runs go to the dev data, not the real stats and
    leaderboard. The dev menu shows `[ stats: TESTER (dev data) ]`; `?dev=0` turns it off.
  - **Dashboard** (s3iz.com/glx/admin/): pick "dev / testing" for the **clear dev data** button. Try a breakdown:
    `node` by `secs` where `corp=seekr` (time in a corp), `mod_pick` by `taken` (most-taken mods) or `offered`,
    `exotic` by `key`, `run_end` by `at` (where runs die).
- [ ] **Two talks to have: reputation (REP) and money balancing** (2026-10-25). Notes in SPEC §16f ("Talks to have").
  Once real stats come in, they help both (what runs earn, what people buy).

- [ ] **Meat notes filed, and the music notes compiled** (2026-10-24). New: **`docs/MUSIC.md`**, everything about the
  music in one place (what's built, the plans, your inspirations incl. Robyn / Monkey Island / the Amiga intros link).
  The SPEC's music plan now points there. Filed: the alarm corp (CORPS.md A31), the rival waiting its turn (CORPS.md
  RIVAL), the corp modifiers' name + stage-wide effects (CORPS.md "Corp modifiers": a list of name ideas for you to
  pick from), the tool suite (SPEC §17). Open: the "Lemonheads dance intro, maybe Moby" reference: which track is it?
  Not filed: "hackers ICE man" (left in meat notes; not sure what it's for).

- [x] **asXii: decide what a selection does when you switch tools** (decided: option 2, built v0.11) (2026-10-23). Clear it on the drawing tools, or
  keep it and make Brush / Eraser / Type stay inside it (Photoshop; you lean this way). Details in
  `ascii-editor/PLAN.md`, "Open: what a selection does...".

- [ ] **asXii v0, the ASCII editor** (2026-10-23). Open `ascii-editor/dist/index.html` in Chrome. Try: T and type, V and drag a
  box, drag it around (watch the red clash cells), Enter to drop / Esc to put it back, Ctrl V some text in, B to draw, layers on
  the right, resizing the canvas. Check: the layout (palette left, options top, info right), how typing vs shortcuts feels,
  the brush shape (sizes are kept roughly square, so size 3 is 3 wide x 1 tall), and the four styles.

- [ ] **Meat notes filed** (2026-10-23). Check the spots I picked, and two open calls: the ASCII tool's default (plain
  ASCII or Unicode; ascii-editor/PLAN.md "How the conversion picks characters") and the rarity ladder (SPEC §16f "Rarity vs
  level": rename BOSS to LEGENDARY, or the scrap / common / rare / epic / legendary / exotic ladder). Also: the
  ascii-art.de catalog is now git-ignored and removed from the repo (still on your disk; still in old commits).

- [ ] **The first fake ads** (v13.05): SPONSORED STORIES and VIRUSHIELD PRO. They pop up between layers or on the way back
  to the map, from your second corp on (1 in 6, one per corp at most). To see one now: dev menu `[show ad]`. Look at the art, the skip countdown, the spin-turn on the two-screen one, and how often feels right.

- [ ] **The boot / login intro** (v13.03). To replay it: dev menu `[intro: first boot]` (the full
  first-time version) or `[intro: short]`; `?nointro` in the URL skips it. Look at: the pacing (~6.5s full, ~1.5s after), the world map
  drawing (`INTRO_MAP` in `dist/engine/intro.js`, easy to redraw), the fake jargon lines (`INTRO_JARGON`).

- [ ] **v13.00 on the web host** (2026-10-22). Upload all of `dist/` again (most files changed). Your v12 save carries over
  on first load (new save slot `beta_runner.v13.save`).

- [ ] **RAM DOUBLER** (v12.24 as CHROMED UP; v13.08 renamed, 12 slots). No item belt, 12 mod slots (the 7th-12th on the belt's row). Held items are sold for half when you take
  it. Feel: is 3 slots worth losing items? (STASH and CACHEKEY's item side do nothing with it.)

- [ ] **SNOOZE** (v12.23). Half your ICE hits do no damage and come back next layer as an extra node with a z in its glyph.
  Is the z readable enough (or too easy)? If it plays too strong: the held-back rule "the backlog comes due" (leftover
  snoozed ICE hits you at the end of the corp).

- [ ] **ALL-IN item, and "why not" on items** (v12.22). ALL-IN (EPIC, 60cr): 50/50, the layer clears or +2 ICE (copies of a
  decoy, so a glyph can show up 3 times: a small hint those are ICE; fine?). Tapping an item you can't use now shakes it and
  says why in red under the belt (try ALL-IN in DEMOLITION, or a PATCH at full integrity).

- [ ] **COIN FLIP** (v12.19). Hold a node (or drag from it) and the coin box pops up; drag to ♥ or $ and let go. Feel
  the gesture on your phone (hold time 260ms, how far you drag), whether the bet is worth it, and the x N drop-in.
  The multiplier (HUD, by the credits) is the strong part: watch the pay. Numbers: `COIN` in `dist/engine/mods.js`.

- [ ] **QUANTUM** (v12.17). Two real nodes a layer (3+ nodes), either passes, half pay. The tell finds the first; the second
  is random. Watch the odds (`2 IN 5`) and the `quantum: 2 real` note. Is half pay the right price?

- [ ] **LEVERAGE: debt** (v12.16). Credits go negative (limit -150, -100 a sector), debt shields you (debt/250, up to 60%),
  grows 10% a layer, and past the limit the collectors take 1 integrity a layer. Try it with BLOOD MONEY. The HUD shows
  `CR -120/-150`; the tray tip shows the shield odds. Numbers: `DEBT` in `dist/engine/mods.js`.

- [ ] **BLOOD MONEY and the MODS CLASH screen** (v12.15). Credits are your health (+100cr when taken; hits cost 20cr +10 a
  sector). To see the clash: dev menu, add BLOOD MONEY, then take ZOMBIE from a sector boss / market / cache ("it will
  replace blood money"); the other way round, ZOMBIE is locked in and BLOOD MONEY can't be taken. Numbers: `BLOOD` in
  `dist/engine/mods.js`.

- [ ] **ICE EATER and ZOMBIE, the first exotic mods** (v12.14). Fastest way to try them: dev menu, add the mod (or wait
  for a sector boss: its reward always has one exotic). ICE EATER: eat every ICE, never the real one; X-AXIS / Y-AXIS turn
  the real node's line red. ZOMBIE: watch the `ROT 000/150` counter and the crack counts on nodes. Numbers to tune are in
  `dist/engine/mods.js`: `EXOTIC` (drop odds) and `ROT` (rot per layer / ICE / timeout, taps per rot). Also look at the
  MODS CLASH screen (no real clash exists yet: ICE EATER and ZOMBIE use different slots, so it shows up with the next
  exotic that shares one).

- [ ] **Boss intro animation** (2026-10-22, your ask; you'll have notes). Today (~2.5 s, tap or any key skips): the
  screen empties and the music goes muffled, then `!! WARNING !!` / `<CORP> // BOSS` / the boss line /
  `n nodes. one is real.` type in with an alarm + 3 heartbeat thumps, red pulses and a growing shake; a riser,
  then the board slams in (boom, shake, red flash) and the nodes power on one by one. Code: `bossEntrance()` in
  `dist/engine/run.js`. Quick way to see it: dev menu `[ jump to boss ]`. Already on the ideas list: show the
  corp's logo in it (SPEC §17).

- [ ] **Every mod flashes when it fires** (v12.13). One shared animation: the badge blinks inverted and the letters hop.
  To change it for all mods: `MOD_FIRE` at the top of `dist/engine/mods.js` (`ms`, `blinkMs`, `hop`, `hopMs`), or rewrite
  `modFireLook()` right under it for a different style. Watch for mods that fire every layer (EZPASS, SKIMMER, the hint
  notes): if the tray gets too busy at layer start, those could be left out.

- [ ] **Corp map codes** (v12.11). Corps on the map are now 2 letters + their level (`SK1` = SEEKR, level 1),
  in the corp's colors, in place of `[S]`. Nodes you can travel to get a small glint across the code now and then
  (it replaces the old blinking brackets). Stops and OMNI keep brackets: `[$]` `[?]` `[+]` `[!]`. Also in the codex,
  help, results and dev corp list. The level digit is in the same color as the letters; it could get its own color
  (or be bars) if it doesn't read as "level". Rename any code: it's `code:` near the top of each `corps/*.js`. All 78:
  - LV1: `BC1` BASIC CORP, `BG1` BURGERTRON, `MM1` MEGAMART, `MO1` MOCHI MOCHI, `NB1` NIMBUS WEATHER, `PN1` PARCELNET, `PR1` PERIMETER SYS, `PT1` PLAYTIME, `SK1` SEEKR
  - LV2: `BL2` BRIGHTLINE POWER, `BP2` BYTEPETS, `CB2` COLDBREW, `CW2` CLONEWORKS, `DT2` DIALTONE ONLINE, `DW2` DEWEY SYSTEMS, `HC2` HAUTE//COUTURE, `LD2` LEDGER TRUST, `LK2` LUCKEEZ CASINO, `MD2` MEDIX, `ML2` MIRRORLINE, `PW2` PURLWISE, `RY2` RYDR, `SG2` SIGIL DYNAMICS, `SH2` SAFEHARBOR, `TG2` TOLLGATE, `TU2` TUMBLER LOCKS, `ZD2` ZODIAC HOUSE
  - LV3: `AP3` APIARY, `BB3` BIDBLITZ LIVE, `BK3` BLACKOUT, `BY3` BONEYARD, `CA3` CARAPACE ARMOR, `CE3` CHUCK E. CACHE'S, `CH3` THE CHOIR, `CN3` CHANNEL 9, `CR3` CHRONOS, `DR3` DROP-4, `EC3` ECHO LABS, `FA3` LA FAMIGLIA, `FN3` FORGET-ME-NOT, `GC3` GENCORP, `HN3` HEADLINE NEWS, `HY3` HYDRA, `KN3` KERNING, `KR3` KERNEL, `LC3` LIFTCO, `LX3` LEXICON, `PB3` PAWN BROS, `SF3` STREAMFLIX, `SP3` SPECTRA, `SQ3` SQUALOR, `TM3` TEMPO RECORDS, `TX3` TELEPHONIX, `VD3` VERDANT, `WP3` WATCHPOINT
  - LV4: `AE4` AEGIS DEFENSE, `CI4` CIPHER, `DM4` DEMOLITION CO, `EN4` ENTROPY, `FM4` FORM 27B, `GL4` GLACIER STORAGE, `GR4` GRIDLOCK TRAFFIC, `HL4` HALFLIFE NUCLEAR, `MT4` MONTE, `NR4` NOIR & ASSOCIATES, `NW4` NUMBERWONG, `PD4` PREDATOR, `SY4` SYNAPSE AI, `TL4` TWINLINK
  - LV5: `BR5` BITROT, `BT5` BULLET TIME INC, `DB5` DECIBEL LABS, `FW5` FOURTH WALL, `GH5` GROUNDHOG, `GV5` GRAVITAS LABS, `LG5` LAGRANGE NET, `PL5` PLAYBALL, `UP5` UPSIDE
- [ ] **X-AXIS / Y-AXIS scan** (v12.11). Own one, tap ICE in the real node's row / column: the scan runs out from
  the tap a node at a time, the real node lights up with a ping, a beat, then the reveal (~1 s, was ~0.4 s). A miss
  lights its line dim for a moment without slowing the hit.
- [ ] **Mods you can see go off** (v12.12). The mod's tray badge flashes when it fires. KEYLOGGER / TRACER: after the hit,
  a line says what they showed ("real node's top line.", "real node is down+right.") as the key line types in / the
  arrows blink in. VIRUS: the next node glitches, then locks. SHATTER: the node shows cracked glass, not a red hit.
  FAILSAFE: "integrity gone." and the HUD at 0 for a beat, then the save. A miss with KEYLOGGER + TRACER now takes
  ~1.5 s before you can pick again (was ~0.75 s): say if that drags.

- [ ] **Logotype round 4: oldskool / Amiga styles** (2026-10-22). Five takes on NeoN+1 after your references
  (Blue System, Paso's Ice Cream): open `docs/art/logotype_round4.png` (text in `docs/NAMES.md`, round 4). Pick
  favorites / mix and match; then the title can cycle between the face and the logotype.
  - Round 5 (same day): just N+1 in the 3D styles (`docs/art/logotype_n1.png`), and Blue System-style
    interlocking type (`docs/art/logotype_round5.png`, F1 / F2). Text in `docs/NAMES.md`, round 5.

- [ ] **Rarity chips** (v12.01). Every mod and item now shows its rarity as a light chip (dark text on the rarity's key
  color), the same in every palette: tray badges and item names, market / rewards / codex lists, and the RARE /
  EPIC words in text. Selected badges invert; EXOTIC letters cycle through all the chips. The chip colors are in
  the palette editor's "rarity chips" tab. Look at the tray, a market, the codex, and a light palette.
  - Watch the COMMON chip (dark text on light grey): grey can read as "disabled". Items you can't use right now
    (most items on the map) are plain grey with no chip, on purpose. If usable common items still look off,
    try a brighter or slightly tinted common in the rarity chips tab (it changes everywhere at once).

- [ ] **Upload `preview.png` to the root of gregschomburg.com/br/** (v12.00), above the version folders, once.
  Every version's link preview points at `https://gregschomburg.com/br/preview.png`. It's `dist/preview.png`
  (the title art and a pitch, no build number, so it never goes stale). Then paste a game link in a chat
  to see the card.
- [ ] **v12 on the web host** (v12.00). The game is now a folder: upload all of `dist/` (`engine/`, `data/`,
  `corps/`, the icons and `preview.png`, not just index.html). If a file is missed or a phone has an old copy,
  the title shows a red warning naming the file. Your v11 save should carry over on first load.
- [ ] **Link preview and icons** (v12.00): `dist/preview.png` (shows "v12.00"; Claude can re-render it any
  time), `dist/icon.svg` (tab icon) and `dist/icon-180.png` (phone home screen).

- [ ] **INFO page wording** (v11.05). Tap the version tag in the footer (`neon+1 v11.05 [?]`). Credits:
  "idea and design: greg: the original idea, the game, the corps and their tells, and the playtesting",
  built with Claude in Claude Code, "started from One True Door (an earlier game, also made with
  Claude) as the reference", made in 2026, a GitHub button. Change anything you like.
- [ ] **Multiplayer join box and share link, on a real room** (v11.04; share fixed in v11.06). Your first try:
  `[ SHARE LINK ]` on the local file crashed the Chrome tab ("Aw, Snap!"): Chrome's desktop share dialog.
  Now the share sheet only opens on phones on the web; on a computer the link is copied (from a local file
  it says the link only works on that computer). Quick retry after the fix: the copied link looked right;
  a full test (joining from a second device) is still to do. Not tested live (it needs
  Firebase and two players). Host on one device, then on another: type the code in the box and
  press Enter; and try `[ SHARE LINK ]` from the lobby (phone share sheet / copied link, which opens
  straight into the join).
- [ ] **PROFILE and CORP BREACHED logo block** (v11.04). Logo + name (+ stats on PROFILE) now sit on
  your color style's background as one block, with the PROFILE controls under the card.
- [ ] **The new corps: CIPHER, HYDRA, BLACKOUT** (v11.00). Tells, bosses, mods (PARITY, HEADCOUNT,
  FLARE) and difficulty were Claude's calls (measured about x2 over blind). Their map letters
  `{` `(` `5` are placeholders (the 3-letter map codes on the backlog would replace them). Their
  palettes land close to others (CIPHER ~ CLONEWORKS, BLACKOUT ~ TOLLGATE).
- [ ] **Palette pass** (palette editor, v11.03). 40 palettes have warnings: hard-to-read secondary
  text, accent = money in 14 corps, look-alike pairs. BASIC, PARCELNET, MOCHI, CHRONOS and MIRRORLINE
  now wear the old player palettes; their old looks are in each palette's note (and git) if you want
  any back.
- [ ] **Title screen** (v11.00). The #15 lockup with the build number and `N e o N + 1`, circuit
  traces, and pulses running out from the head. Dev menu `[ title pulse: COLOR / CHAR / BOTH ]` to
  compare the spark styles. Next idea to try: traces in from the left, out the right.

- [ ] **Leg + exotic mod changes** (v13.23). Try: ICE EATER (real node -3, not death), FENCELINE (was
  CORNERS: a whole edge of ICE locks; is the name OK?), MUTATE (the tray flash on a new corp), COUPON (one free
  market offer), CONTINUE? (once per corp, price climbs), the pulsing [brackets] on ready tap mods. Open questions
  are in SPEC.md under "Mod notes" > "To talk about".
## Done

- [x] **The in-game header still says `BETA_RUNNER`.** Done in v13.16: it says NeoN+1 and is the menu button.
