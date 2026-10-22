# Greg's review list

Things Claude built or decided that need your eyes. Tick one off (`[x]`) when you've looked, or
leave a note under it for Claude. Newest at the top. (Claude adds to this list; the backlog of things
to build stays in `docs/SPEC.md` §16f.)

## Open

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
- [ ] **The in-game header still says `BETA_RUNNER`.** Switch it to NeoN+1?
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

## Done

(nothing yet)
