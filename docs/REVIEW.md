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

- [ ] **THE SHELL's charges** (v15.02; docs/SHELL.md "Charges"). Slot SHELL chips (with ROOT on your crew), start a run,
  press `~`: the charges show top right; the list shows each command's cost (`whoami ·1`); run out and it says so; a
  new sector fills them; a corp boss now and then offers a CHARGE (+2). ROOTKIT in CRASH: die with charges and you
  live at 1 INT. `dev.start` in the shell: dev mode, no costs, the run is practice. My numbers: whoami +3, ps +2,
  man +2, CAPACITOR +4, flatline +1 (costs 3); a CHARGE in 35% of corp boss rewards.

- [ ] **ROOT's quest, PAPERWORK** (v15.01; docs/CREW_QUESTS.md). To start fresh: THE SHELL (~ with `?dev=1`) >
  `root.reset`, then open your deck at USER. Watch: the glitched SHELL sockets (their fine print), the QUEST card, the
  WORKBENCH step (if you haven't bought it), a shred where a lowercase letter stays under the shredder with a fanfare,
  the QUEST card with the letter big, PH1SH's spam ad (try both buttons: the fish, the confetti, "thanks, chump.", your
  credits going; POPS after), the 4th slot (`r o o t`, a `*` fills one), the hijacked build and the scene, ROOT's call,
  then `~`: ROOT's hello and `man` from ROOT's chip in a corp. Shortcuts: `root.letters`, `root.phish`, `root.step`.
  My calls: 60% a shred gives a letter, 1 in 3 letters after the first get the ad, PH1SH takes 30cr, the 4 spam texts,
  the scene's words (data/quests.js), ROOT's chip is `man`. Saves that bought CREW: ROOT keep it (and the shell).

- [ ] **G0D.exe** (v14.60-v14.61): dev menu (backtick) > [give G0D.exe], then tap the red [G0D] on your belt. Watch a
  run: its card, the <@> cursor thinking and the @ flying out, the map lines (why it goes where), markets, rewards, the
  UPLINK, and its OFFLINE card when it stops. Settings in the dev menu: speed, clicks, wins before it knows a corp,
  popups (click / wait), its wins (count / not), the workbench (shred only / + build), phish (skip / ALL OF IT: watch it
  phish your money away at a pier), risky (go on / hand back). My calls: the eye art (placeholder), how it scores the map,
  what it buys, when it taps a $ node.

- [ ] **Credits instead of a mod may be too low** (found planning G0D.exe, 2026-11-08). Skipping a boss reward pays
  2 earn units (20cr in sector 1). Taking an epic or legendary mod and selling it at the UPLINK pays 33% of its fee:
  ~26cr (epic) or ~40cr (legendary), times the sector, and you have the mod until then. So from epic up, "take it and
  sell it" always beats the credits. Rare (~16cr) and common (~10cr) don't. Fine as a hidden strategy, or raise
  ECON.skip.boss / lower ECON.uplink.sellPct?

- [ ] **MONTY and FOSSIL** (v14.57): editor > TESTING, breach each. MONTY: is his tell readable but not free (blunt at tier 1, ? vs . deeper)? The boss's swaps: too fast? Its prize (v14.58): clean boss = the C.A.R. (v14.59: no tap; every node in the sector is open until you drive off the links), ICE on the boss = a GOAT named ZONK that eats an ICE a corp and sometimes your loot: does the goat steal too often (1 in 3)? FOSSIL: brushing feel (a second a brush, 15s), the fossil glyphs (4 kinds, the eye is an o), the dirt, the boss skeleton. SHOVEL as its reward. My calls: both level 3, the logos, VELVET ROPE / HOLLOW.

- [ ] **SIMON** (v14.55): editor > TESTING, breach SIMON (or find it on the map, level 2). Watch the pattern, play it back; try a wrong step (it hurts, replays). Since v14.56 a step is one beat of TRACKER (136 BPM: about 440ms): too fast? The tones (in the track's key, by node), the four colors, the look-alike characters deep in (`[l]` `[I]` `[1]` `[|]`: maybe too mean?). The boss's white steps. My calls: level 2, 12s clock, REPEAT as its boss gear, TRACKER music, the logo.

- [ ] **This session** (v14.50-v14.53, 2026-11-07): b0y's one cursor and his [b] hint on the OMNI RAID; the initials in the workbench letters; [SHARE] on the title and the results (open a `?seed=` link: it counts on the seed boards); open the game in two tabs (the second says PLAY HERE; tap it, the first goes quiet); REWIND legendary from COLDBREW's boss; CERBERUS's card on a phone; BOX OF WIRES (editor TESTING > Give it 6 times: every node opens). Is a box turning up 40% of the time while you carry one too often?

- [ ] **H3AV3N fixes** (v14.48): CERBERUS with VIRUS (few nodes left): the eyes keep moving, the real node frees up. G0D MAZE's intro on a phone (the quote wraps). G0D DEFEATED: the mod chips go with their letters. The ending's last cards (THERE IS MORE TO EXPLORE, CREDITS): the tap line under the text, the counter top left. The OMNI RAID: [b] in the tray, tap it in a corp (once a corp; on the map he says wait); his three cursors closing in. After the credits: G0D FIGHT / TITLE. STEADY HANDS on THE BOARD (USER, 300): a legendary PHISH stays catchable.

- [ ] **SYSTEM FAILURE** (v14.47): a fresh save: CALL POPS in, he joins and the QUEST card says PROVE IT; clear a sector: POPS's mold call, THE DISC. The map's ! on MEDIX and its info line. Pick the DISC up: GET OUT WITH THE DISC. A market with the DISC: POPS calls. After a scene (THE BOARD > QUESTS replay, or the editor's buttons): it goes dark, the card, then back (music fades and comes back in). PRODIGAL: read it through; the upload bar (tap, it fights back, tap on). d0g in a corp: three heads as he taps; his new lines; w00f's. The MEDIX CULTURE ad (editor ADS tab). Does SYSTEM FAILURE fit as a name on the board and the card?

- [ ] **The playtest batch** (v14.46): lose a corp to d0g (he takes the last node): the reveal stamps ESCAPED, a line says "escaped. no win."; on a sector boss, SECTOR CLEARED says beaten / escaped. A market with 10+ rows (COUPON CUTTER): the list scrolls, LEAVE stays put. A CALL over the map: nothing under it lights up. POPS's face in a CALL (6-wide chip): square enough now? Gear x3 counts on their darker chips. STIM with ZOMBIE: rot limit 225 for the corp. TUNNEL: its = lines while armed, the dug path after. Music after a FIRST BREACH comes back. HAD3S: no safehouse in sector 1, MEDIX, more sideways links; POPS's LEASH call on the first run (a save that hasn't had it); THE BOARD > QUESTS: [ PLAY IT ].

- [ ] **Seed boards** (v14.44): type a seed on the title (it says `replay`), play it, the end screen shows `#1 of 1 on SEED`. LEADERBOARD > SEEDS: the rows, tap one (THIS SEED / PLAY IT), the find field, a seed's page, esc back. Typed seeds earn REP now. (Off file:// they post to the test boards.)

- [ ] **G0D's logo** (v14.43): the art (an eye in a triangle, mine: redraw if you like, editor > ART), its frame in the ending, the new lines on THERE IS MORE TO EXPLORE, H3AV3N CLEARED's list. With a G0D win it shows in the logo picker.

- [ ] **Meat notes** (v14.42): UPSIDE's boss: tap near a gap or a hit ICE, the real node is always reachable (a node with nothing open across from it takes the tap itself). A fresh save: the first CALL that brings POPS puts him on your crew, with a call. On THE DISC step, MEDIX's boss loot has the DISC.

- [ ] **The ending** (v14.41): editor > g0d > IN THE GAME, or play the H3AV3N seed to the end. Read the whole scene (the copy is a first pass; data/quests.js h3av3n), the placeholder art (redraw any of it in asXii: asxii_art/n_cutscene_04_ending), the credits and THANKS TO handles. Then the 1UP: die in a corp, USE 1UP, the same layers come back. REPLAYS on the title's seed row. (Your save needs a G0D win for both.)

- [ ] **Boss rewards screen** (v14.40): beat a corp boss: after "breached ..." your logo folds away a row at a time and the rewards sit under your name line. Speed: engine/screens.js LOGO_OUT (wait 300, row 110, glitch 90 ms). Also try a first breach and a rival breach.

Older open items (v13.51-v14.39), mostly covered by your playthroughs since: [archive/REVIEW_2026-11-07.md](archive/REVIEW_2026-11-07.md). Pull any back that still matter.
