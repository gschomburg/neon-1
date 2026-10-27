# Greg's review list

Things Claude built or decided that need your eyes. Tick one off (`[x]`) when you've looked, or
leave a note under it for Claude. Newest at the top. (Claude adds to this list; the backlog of things
to build is `docs/BACKLOG.md`.)

## Live testing (the user's; logged here, not repeated in answers)

- [ ] Push / upload: `dist/` to the site; greglytics 1.4 (`api/name.php`, `api/scores.php`, `api/version.php`).
- [ ] Money (v13.49-v13.50): the retuned money mods (SKIMMER, SUPERSIZE, FASTPAY, EZPASS, POLICY, INTEREST, CHANCE CARD),
  BLOOD MONEY hits x2, QUANTUM x0.75; LEVERAGE, HAGGLE, STASH, CACHE KEY as they are. Sim numbers: docs/ECONOMY.md.
- [ ] The market: REROLL / SELL / LEAVE row fits on the phone; RESTOCK on THE BOARD; SHARD and BOND (loot only).
- [ ] **Play through everything** (the user, 2026-10-26: "i basically need to go through and test everything"): the mods (incl. SNOOZE, ALL-IN, COIN FLIP, ICE EATER, ZOMBIE, the v13.23 changes), the rarity ladder, the corps, mods flashing when they fire, X / Y-AXIS, map codes, the boss intro, the v13.26 batch.

## Open

- [ ] **Sector events** (v13.54, 2026-10-27): built from `docs/SECTOR_EVENTS.md`. Try it from the neon editor's new
  **TESTING** tab (each event is a button: a new run, straight to sector 2 with it). Look at: the card (its look, and
  the 14 placeholder pictures: yours to draw, in data/events.js); the card text I wrote; BLINDERS on the map; THE FENCE.
  My calls (top of SECTOR_EVENTS.md): the share grows 10% a sector after the 2nd (to 80%); DEAD AIR rolls a third as
  often; TIME IS MONEY makes timed corps 3x as likely and costs 1cr a second; FIRE SALE -30% (repairs too). The codex has a SECTORS
  tab (v13.55): each event logs the first time its card shows.
- [ ] **TESTING tab** (v13.54): the cheats and jumps you asked for; the dev menu's mod grid is gone (the tab's give
  box and the gear & mods tab do that). Tell me what else you want on it.

- [ ] **More than one copy at a market** (v13.53, 2026-10-27): a gear offer can be PATCH x2 or x3. Odds per extra copy (ECONOMY tab, "more copies"): scrap 50% / common 35% / rare 20% / epic 8%, up to 3. So half of scrap offers come as x2 or more, a quarter as x3; an epic x2 is about 1 in 13. Too many? COUPON only makes the first copy free.

- [ ] **Nine new gear** (v13.52, 2026-10-27): TUNNEL, MESH, WARP (rare random / epic aimed), TILT, SHAKE, FRAG, REWIND,
  SHOE, PASS. Dev panel [fill gear] gives one of each (scrap / first step); the neon editor's items page sets the step.
  Look at: the codex text I wrote (CODEX > GEAR) and SHOE's miss lines (engine/active.js SHOE_MISS); prices (TUNNEL 35,
  MESH 80, WARP 45, TILT 30, SHAKE 18, FRAG 28, REWIND 25, SHOE 4, PASS 90). Three calls for you:
  - **FRAG on small layers:** 3 hits on a 2-3 node layer always hit the real node: a sure free clear (no pay). Fine, or
    cap the hits (e.g. never more than half the closed nodes)?
  - **Gear odds by rarity** (ECONOMY tab, "Gear: how often each shows up"): markets now pick by weight, so PATCH is in
    ~25% of markets (was ~43%: 15 gear share the shelf now) and ALL-IN / MESH / PASS ~10%.
  - **WARP** never lands on the sector boss itself (both steps): the rows before it only.

- [ ] **Value gear ladder** (v13.51, 2026-10-26): DUDS / SIM / SHARD / BOND / CHROME / WALLET. Check the codex text (CODEX > GEAR) I wrote for DUDS, SIM, CHROME, WALLET; the worth (5 / 15 / 40 / 100 / 250cr) and drop weights in the ECONOMY tab ("selling gear", "Loot: which gear drops"); a WALLET is about 1 in 500 loot rolls. Dev panel [fill gear] gives one of each.

## Done

- [x] **The art catalog** (v13.27-v13.28, asXii v0.143, 2026-10-26): closed 2026-10-26, in use; the editor has its own ? help now.
- [x] **Items & mods page in the editor** (2026-10-25): closed 2026-10-26, in use; no text editing there for now (the user).
- [x] **The new editor: `tools/neon_editor.html`** (v13.17, 2026-10-25): closed 2026-10-26, in use; the editor has its own ? help now.
- [x] **asXii v0, the ASCII editor** (2026-10-23): closed 2026-10-26, in use, well past v0.
- [x] **Logotype round 4: oldskool / Amiga styles** (2026-10-22): closed 2026-10-26, the user is trying title card art in asXii first; the samples are noted in the INTRO PASS (BACKLOG.md).
- [x] **INFO page wording** (v11.05): closed 2026-10-26, moved to the COPY PASS (BACKLOG.md).
- [x] **Multiplayer join box and share link, on a real room** (v11.04; share fixed in v11.06): closed 2026-10-26, shelved: it works; finish the core game first (BACKLOG.md).
- [x] **PROFILE and CORP BREACHED logo block** (v11.04): closed 2026-10-26, reworked since (one 24 x 7 logo box, v13.27).
- [x] **Palette pass** (palette editor, v11.03): closed 2026-10-26, fine for now; the warnings (and MOCHI MOCHI being hard to read) moved to the PHONE PASS (BACKLOG.md).
- [x] **Title screen** (v11.00): closed 2026-10-26, reworked since; the title card art round comes later (the user, in asXii).

- [x] **The to-do batch** (v13.26, 2026-10-25): closed 2026-10-26, in the play-through ("Live testing").
- [x] **The new rarity ladder** (v13.19, 2026-10-25): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Small batch** (v13.18, 2026-10-25): closed 2026-10-26, in the play-through ("Live testing").
- [x] **The first fake ads** (v13.05): closed 2026-10-26, the user: they are good (more ads later, ADS.md).
- [x] **SNOOZE** (v12.23): closed 2026-10-26, in the play-through ("Live testing").
- [x] **ALL-IN item, and "why not" on items** (v12.22): closed 2026-10-26, in the play-through ("Live testing").
- [x] **COIN FLIP** (v12.19): closed 2026-10-26, in the play-through ("Live testing").
- [x] **ICE EATER and ZOMBIE, the first exotic mods** (v12.14): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Boss intro animation** (2026-10-22, your ask; you'll have notes): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Every mod flashes when it fires** (v12.13): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Corp map codes** (v12.11): closed 2026-10-26, in the play-through ("Live testing").
- [x] **X-AXIS / Y-AXIS scan** (v12.11): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Mods you can see go off** (v12.12): closed 2026-10-26, in the play-through ("Live testing").
- [x] **The new corps: CIPHER, HYDRA, BLACKOUT** (v11.00): closed 2026-10-26, in the play-through ("Live testing").
- [x] **Leg + exotic mod changes** (v13.23): closed 2026-10-26, in the play-through ("Live testing").

- [x] **Open questions** (the Lemonheads track, the ASCII tool default): dropped 2026-10-26, the user: they don't matter.
- [x] **The training** (v13.29, 2026-10-26; the popups v13.30; POPS + round 2 v13.31): closed 2026-10-26, built through round 5 (v13.35) and played; the [TUTORIAL] button it mentions is gone (NEWB starts it now).
- [x] **Header, play stats, tester mode** (v13.16, 2026-10-25): closed 2026-10-26, old upload / setup steps; the header and stats have been live since.
- [x] **Two talks to have: reputation (REP) and money balancing** (2026-10-25): closed 2026-10-26, the money talk happened (v13.37-v13.50: economy file, the sim, THE UPLINK, the retune); the REP talk is still open (on the build list, BACKLOG.md "Talks to have").
- [x] **Meat notes filed, and the music notes compiled** (2026-10-24): closed 2026-10-26, the notes are filed; its open question (the Lemonheads track) moved to "Open questions".
- [x] **asXii: decide what a selection does when you switch tools** (decided: option 2, built v0.11): closed 2026-10-26, decided (option 2, built v0.11).
- [x] **Meat notes filed** (2026-10-23): closed 2026-10-26, the notes are filed; the rarity call was made (v13.19); the ASCII default question moved to "Open questions".
- [x] **The boot / login intro** (v13.03): closed 2026-10-26, replaced by the new intro (v13.36); intro notes go in the INTRO PASS (BACKLOG.md).
- [x] **v13.00 on the web host** (2026-10-22): closed 2026-10-26, old upload step; the game is at gregschomburg.com/neon/ now.
- [x] **RAM DOUBLER** (v12.24 as CHROMED UP; v13.08 renamed, 12 slots): closed 2026-10-26, out of date (it says "item belt"; gear slots since v13.48); its feel is part of live testing.
- [x] **QUANTUM** (v12.17): closed 2026-10-26, retuned to x0.75 (v13.50); in "Live testing".
- [x] **LEVERAGE: debt** (v12.16): closed 2026-10-26, in "Live testing" (as it is, v13.50).
- [x] **BLOOD MONEY and the MODS CLASH screen** (v12.15): closed 2026-10-26, hits now cost twice as much (v13.50); in "Live testing".
- [x] **Rarity chips** (v12.01): closed 2026-10-26, replaced by the rarity ladder (v13.19).
- [x] **Upload `preview.png` to the root of gregschomburg.com/br/** (v12.00): closed 2026-10-26, the site moved to /neon/.
- [x] **v12 on the web host** (v12.00): closed 2026-10-26, old upload step; the site moved to /neon/.
- [x] **Link preview and icons** (v12.00): closed 2026-10-26, from the /br/ days (the preview said v12.00); the og:image is set for /neon/ now.

- [x] **The in-game header still says `BETA_RUNNER`.** Done in v13.16: it says NeoN+1 and is the menu button.
