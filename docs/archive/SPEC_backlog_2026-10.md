# SPEC.md planning lists, archived 2026-10-26

These sections of SPEC.md (16f pending revisions, 16i mods & corps, 16k endless map, 17 ideas backlog) mixed built
and open work, which made the open work hard to find. They are kept here as they were. **What is still open was
pulled into [../BACKLOG.md](../BACKLOG.md)**; what was built is in SPEC.md's version logs. Links in here are relative to
docs/ (they were written in SPEC.md).

## 16f. Pending revisions (next round)

**Set aside for now (the user, 2026-10-22):**
- **A UI / phone pass, together, later:** the spacing / copy pass on the pick screens, bigger phone buttons, and the
  scaling questions (pushing past the 4x4 grid, how the screen scales on phones).
  - **The menu button in the header should maybe be right-aligned** (the user, 2026-10-23).
  - **The swap screen on a phone** (the user, 2026-10-24): too easy to tap the wrong mod. The 2-step swap is BUILT (v13.12);
    its row spacing belongs to this pass.
- **Back burner:** the logotype (rounds 4-7 in NAMES.md).
- **Talks to have (the user, 2026-10-25), before building more on either:**
  - **Reputation (REP):** what it's for and how it feels. Today: a run is worth depth + 3 per corp + perfects +
    earned/40 + 10 per sector cleared (`repFor`, engine/save.js); cashing out banks it all, dying banks nothing
    (DEADMAN keeps 25% / 50%); it's spent at THE BOARD on the LEGACY unlocks. REP ideas spread around this file: the
    codex-complete unlock, mod storage between runs, achievements / cosmetics. The play stats (v13.16) show what
    runs actually earn (run_end `rep`).
  - **Money balancing: started 2026-10-26.** The numbers are in `docs/ECONOMY.md` (sources, sinks, pay by level,
    a sector at 0 / 50 / 90% perfects). The user's directions so far:
    - **Pay to reroll a market's stock:** a limited number (a few per market or per run); a REP unlock at THE BOARD
      for more.
    - **Prices go up as you get deeper** (by sector).
    - **More things you have to pay for,** e.g. a toll to go to some corps.
    - **Keep an eye on BLOOD MONEY:** with this much income it's basically immortal (hits cost 20cr, +10 a sector).
    - Paying to upgrade a mod: less interesting (not for now).
    - Open: the perfect multiplier (the biggest source of the flood); the target feel; a sim before tuning.
    - **The sim** (tools/econsim.js, v13.37) and its what-ifs are in docs/ECONOMY.md. Best so far: perfects a flat x2, plus a
      **fee to push on** at each sector checkpoint (the user's idea), **per mod you hold** (100 x sector: drop mods if short).
    - **The checkpoint: BUILT v13.40 as THE UPLINK** (the user, 2026-10-26; before the reward, from a [ SECTOR CLEARED ] button). Pushing on to the next sector costs a fee per mod you
      carry, by its rarity (a bribe / bandwidth fee), plus a minimum everyone pays. Its own new screen (the sector-clear
      screen is full already): a list of your mods with check boxes, keep or not, each with its price; the ones you don't
      keep are sold for credits. The cash-out screen stays. Watch LEVERAGE (debt) with it. Questions out to the user: before
      or after the sector reward; showing the coming bill on the map; LEVERAGE covering it; BLOOD MONEY / ZOMBIE not
      sellable; items free; numbers (spend units x sector: common 3, rare 5, epic 8, legendary 12, exotic 10, minimum 5;
      selling pays back ~1/3 of market value) to sim first; HAGGLE / a smuggler mod; not in the training; name (UPLINK?).
    - **A mod idea: chained perfects** (the user, 2026-10-26, when perfects went to a flat x2): a mod that brings back a
      growing perfect bonus, e.g. each perfect in a row raises the next one's multiplier (x2, x2.5, x3...), a miss resets it.
      (The old per-node curve is still one ECON edit away: perfect 1, per node 0.5.)
    - **Showing the coming uplink bill on the map: dropped for now** (the user: the UPLINK screen shows it, next to the mods).
    - **Sell mods at the checkpoint** (the user, 2026-10-26): keep (pay its upkeep), sell (credits back, e.g. a third of
      the market price), or drop. Pairs with the per-mod fee: short, you sell your weakest.
    - **A credit scale** (**BUILT v13.38**: data/economy.js) (the user, 2026-10-26): every money number as a multiple of a base unit (e.g. 10), so one value
      moves them all (repair = x2; tune 10 or the x2). *(Claude)*: two units (earning, spending), each with its own growth a
      sector; one file, data/economy.js, every money number by name in units; mod / item prices stay in data/mods.js times
      the spending unit. A refactor first (same values, playtest unchanged), then the balance changes go in as one-line edits.
    - **Repair** is a flat 20cr every time today (the user asked; it doesn't climb). Options: per market (20 / 30 / 45...)
      and / or by sector.
    - **Difficulty that takes money or mods away** (the user, 2026-10-26: not built yet). Today only as one-off corp twists
      (THIEF, OMERTA, FAMIGLIA...). Open: corp modifiers on map nodes (TAXED, AUDITED, RANSOM...) or a run-wide difficulty
      dial (REP unlocked levels that stack drains, paying more REP)?
  - **Money balancing:** the economy tuning pass (below: money feels easy to get and not very powerful). The
    play stats help here too: run_end `credits` / `earned`, and `buy` events (what people buy, at what price).

(Things waiting for the user to look at, rather than to build, are in `docs/REVIEW.md`.)

Agreed changes not built yet.
- **Mod ideas are parked** (the user, 2026-10-26: "we have enough mods for now"). The new-mod ideas in CORPS.md (Notes),
  ECONOMY.md (THROTTLE, chained perfects, TIME IS MONEY) and here stay logged for later; the work now is tuning the mods we have.
- **Credits to REP:** REP counts the credits you earned (1 per 40); DEADMAN on THE BOARD keeps 25% / 50% of that REP when
  you die (the user: that is the credits-to-REP buy). No new buy needed.
- **INTRO PASS (later, after the user has lived with it a while)** (the user, 2026-10-26). Everything intro waits for this:
  - The intro keeps playing every time (the user's opinion: always play it). What goes: the NEWB / LEET screen shows only
    on a truly fresh start. Maybe a URL command keeps it all in (for testing). `INTRO_ALWAYS` in engine/intro.js today.
  - Glitch / animation effects on the NeoN title card (meat notes 2026-10-26).
  - **The title card art:** a round on it later; the user is trying things in asXii first and will say when it needs input.
    The old lettering samples (NeoN+1 in Amiga styles, round 4 / 5: `docs/art/logotype_round4.png`, `logotype_n1.png`,
    `logotype_round5.png`, text in docs/NAMES.md) and the idea of the title switching between the face and the lettering.
  - Any other intro notes that come in go here.
- **PHONE PASS (later)** (the user, 2026-10-26: put off for now): bigger, roomier buttons on phones; more room for long
  text (the codex, mod descriptions); the phone UI notes in this section.
  - **Palette warnings** (40 palettes, the palette tab's checks): look at them. MOCHI MOCHI is really hard to read: the
    user will probably change it.
- **COPY PASS (text)** (the user, 2026-10-26). One pass over the words: the INFO page (the footer's version tag), the
  training (POPS's lines, data/tutorial.js), the mod and gear descriptions (data/mods.js), and the ~180 "integrity"
  mentions (the header says INT since v13.47).
- **MULTIPLAYER: shelved** (the user, 2026-10-26): it works and stays in; finish the core game first.
- **Meat notes, 2026-10-26 evening** (the user, meat notes 2026-10-26). Fixes first, then the rest.
  - **Fix: the training leaves you on its seed.** DONE v13.45. After the training you're locked into practice mode by the TRAINING seed;
    it should drop you back on your own (the seed is put back, but the title still says practice / TRAINING?).
  - **Fix: the leaderboard renames old scores.** DONE v13.46 + greglytics 1.4 (needs the PHP uploaded). Entering new initials changes the name on your older scores (enter ABC,
    then later GHI: the ABC score should still say ABC). Today greglytics' setName renames every entry for the device.
  - **Training fixes (DONE v13.45):** the PATCH popup covers the PATCH description / hover: move it up a little. The NeoN+1 menu
    shows under the training popups: it should be on top, with a solid background so nothing shows through.
    **"no timer clicks" = feedback: no timed popups.** DONE v13.44: every training popup waits for a tap (the timer stays as a feature).
  - **Intro:** the upbeat track (ON CAMERA) is great, but the cut to the title is rough: at least a fade, or a
    transition like the win / lose ones. (The glitch / animation effects on the title card moved to the intro pass, below.) A better copy line on the
    card, like a title card's "network intrusion // prototype". A click sound on the NEWB and LEET buttons.
  - **The header: INT.** DONE v13.47 (the HUD says INT; HOW TO PLAY's MORE page explains it). **To do: the other ~180
    mentions of "integrity"** in the game's text (most in engine/run.js ~51, data/mods.js ~34, then panels, the training,
    multiplayer, help, a few corps: HALFLIFE, AEGIS, MOCHI...). Decide: INT everywhere, or INT only where space is tight.
  - **The terminal line should stand out** (feedback: players didn't notice it). DONE v13.44: inverted, on a band across the row.
  - **Naming the belt and items** (the user: "components or software? change items to software and call the belt a drive?").
    Ideas: items = **SOFTWARE** on your **DRIVE** (and mods = HARDWARE in your rig?); items = SCRIPTS on a DECK; EXPLOITS in
    a PAYLOAD; PROGRAMS / UTILITIES in BAYS or EXPANSION SLOTS. STASH (+1 slot) and RAM DOUBLER (no belt) fit DRIVE well.
    The rename touches "belt" in ~25 places and "item(s)" in ~70 lines of text (panels, mods, the training, help, codex).
  - **Make it more of a hacking game:** something in the game itself you can hack, like the seed.
  - **HOW TO PLAY (advanced):** DONE v13.47: the MORE tab (INT, the seed, REP, corp events, the uplink). Quests later.
- **Tutorial popups: DOC** (the user, 2026-10-26; mockups: the "NeoN+1 Tutorial Popups" artifact, round 5). **BUILT v13.30.** Replaces the
  boxed accent popups (v13.29). Agreed look (D2, no box):
  - **A yellow tag** (#ffd84a), dark text, no border, a hard dark drop shadow, centered on the screen and drawn off the grid.
    The "do this" line is yellow on black; "your move" / "tap to go on" is bold dark text, bottom right.
  - **DOC**, the handler (a "clippy for hacking"): a small ASCII face on a dark chip, half off the tag's top-left
    corner, with a 1px yellow line and a 2px dark gap outside it. Name and face are placeholders.
  - **The pointer:** a plain 2px yellow arrow, about 45°, from the tag's edge to the target, with an open head (two strokes
    at a square corner). It doesn't move. No box or glow around the target: the target itself pulses (scales up and down).
  - **Animation (to discuss / tune):** DOC pops in; the tag fills in from the top one line at a time while DOC bobs as if
    talking; then the arrow draws out to the target; then the target pulses. A tap: the tag folds back up, DOC pops out.
    Open: a tap during the entrance skips to the full popup? a talking blip per line? timings on a phone.
- **Tutorial, round 2** (the user's meat notes, 2026-10-26, after playing v13.30). **BUILT v13.31** (the stroke style too: S2), all but the boot-up with your logo (the user: later, with the intro's profile shuffle). Answers: the handler is **POPS**; the other names went to CORPS.md (hacker / NPC name pool); timed banter with a draining line; two kinds of CTA (tap anywhere = TAP >, do this = a short inverted line), no YOUR MOVE; POPS minimized = his face chip plus a one-line CTA by the message line.
  - **Name:** maybe call it TRAINING (or something better) instead of TUTORIAL.
  - **DOC has a character.** Open with an intro: DOC introduces himself ("ok newb, welcome to your training sim. i'm
    doc, i'll walk you through and show you how to stay alive", rough copy). A very quick boot at the start: your hacker
    logo shows while DOC boots up. **He calls you by your hacker profile name.**
  - **Banter** (short, timed popups: a long timer, a tap skips): after the ICE hit ("that hurt didn't it, let's heal
    you back up", then the items popup), when a layer is done, after the corp is breached (then the explanation), and
    on the last screen before he sends you off, with a good luck.
  - **Handler name:** DOC is liked; come up with 10 other options (hacker trainers: maybe AI, or old grizzled retired hackers).
  - **Shorter popups:** break the long ones up. The first corp popup in two (you're in BASIC CORP, then integrity).
    The NET in three (tap to go on each): the NET, pointing at a corp, pointing at a stop / safehouse. Some simple
    ones could be on a timer too (long, and a tap moves ahead).
  - **Explain ICE** the first time it comes up (we never say what ICE is).
  - **Calls to action, consistent:** there are two kinds, "tap anywhere to go on" and "tap that thing". The inverted
    CTA is liked, but gross when long: keep them short ("find the [ ]" or "tap the [ ]"). Maybe drop "your move"
    altogether, since there is usually a CTA.
  - **Placement:** the jack-in popup on the NET goes near the top, pointing down, so the corp's info and the jack-in
    button show. "find the [ ]" covers the board: put it up top, over the header. The boss layer: DOC up in the header,
    off the nodes, maybe shrunk to just his icon or gone. The boss-defeat screen: DOC minimizes after he says to pick a
    mod or skip.
  - **Style, sample first:** the yellow tag gets a yellow stroke on its bottom and right, a stroked-out shadow line
    (instead of the dark drop shadow, which today is drawn over the arrow's start: not minded). Check how the arrow
    looks against it.
  - **The copy, editable:** all the tutorial copy in one place. A new NEON EDITOR tab: walk through the tutorial, edit
    each copy block, skip ahead and back.
- **Training, round 3** (the user's meat notes, 2026-10-26, after playing v13.31). **BUILT v13.32.** The user: a real loot node on layer 2, POPS points at it and says there may be other weird nodes out there.
  - **ICE comes in when there is ICE:** "touch ICE and it bites" on the public net makes no sense (there's no ICE there).
    Introduce ICE on the first layer that has some.
  - **After TRACER:** a little something that shows where it went in the tray.
  - **Jack in:** on the map, the BREACH button should work too, not just tapping the node again.
  - **Items:** maybe say where items come from. **Loot nodes:** maybe mention them too.
  - **The terminal line** in the header: point it out? It sometimes gives you clues.
  - **The boss layer** (you can't die there, which is liked): a wrong node gets a little banter, nothing that takes over:
    the "breach it" line swaps to something like "ouch, that's not right" / "try again".
  - **The banter timer:** not the progress bar. Something ASCII in the top-right corner of the tag: a countdown, like
    4 little spinners that each count down and disappear (&&&& -> O&&& -> o&&& -> .&&& -> &&&; not those exact
    characters).
  - **Beating the boss:** right when you win, the little line says something like "great" before / while the win
    transition plays.
  - **Hover:** while a training popup is up, nodes still light up on hover though they can't be tapped. No rollover on
    what can't be tapped.
  - **A glitch:** sometimes the popup doesn't go all the way away, or shows whole for a moment, flashes back to hidden,
    then animates in. The user will describe it better after catching it again.
- **Training, round 4** (the user's meat notes, 2026-10-26, after playing v13.32: "this is feeling really good"). **BUILT v13.33.** The user: drop the arrows on NODES / -1 INTEGRITY / TRACER went off, and an arrow checkbox per line; the opening is just the first 2 popups, then it resolves into the game.
  Questions out to the user first.
  - **The first few screens without the game:** keep the NeoN+1 menu button and the footer, but behind POPS just the
    transition lines animating, the way some ads do it (the user likes that animated background).
  - **Playing vs. tapping through should be clear.** When POPS wants you to play the game, he always minimizes, with
    just the call to action ("tap BC1" / "breach BC1" on the map: he just pointed at it, so that's enough). No arrow on
    the minimized one. (The screen shake on an invalid tap is liked.)
  - **Some arrows aren't needed** (the user, no list yet).
- **Faces in the art catalog, later** (the user, 2026-10-26: not now). With NPCs coming, the game may get a lot of faces
  (POPS's is `TUT.face` in engine/tutorial.js today). They could live in data/art/ (a faces file, or a kind in
  logos.js), with the neon editor's ART tab and asXii round trip, like the glyphs and logos.
- **Play stats + leaderboard initials** (the user, 2026-10-24; greglytics, see `greglytics/PLAN.md`). **BUILT v13.16** (engine/stats.js), all but the opt-out.
  - **A run id** made at run start, kept in the run save (a resumed run keeps it); every event carries it.
  - **Events:** `run_start` (seed, version, BOARD unlocks, practice / multiplayer); `node` when you leave a map spot
    (corp / type, sector, layers on arrival, time spent, cleared / died / skipped, ICE hit, integrity in and out);
    `run_end` (layers, corps, sectors, cashed out / died + where, every mod at its tier, items, credits, REP, total
    time, ICE hit, perfect layers, reroutes, resumes); `mod_pick` (offered + taken: **most-taken mods**);
    **exotic found** (an exotic offered / taken: does anyone ever find one); `run_quit` (left mid-run).
  - **Dashboard:** averages / medians of a number field (time per corp), a most-taken-mods view, an exotics list.
  - **Dev data:** file / localhost pages already send as dev (separate). Add: a tester switch for the live site
    (e.g. `?dev=1`, remembered on the device) so phone testing goes in dev too; a **clear dev data** button in the dashboard.
  - **Opt-out: dropped** (the user, 2026-10-25: not needed).
  - **3-letter initials: BUILT v13.11** (on the end screen, Bigfig letters, UPLOAD). Original plan: set on the LEADERBOARD screen
    (a `[ VWD ]` button + letter picker); default = letters from the hacker name. Rows show the player's *current*
    initials (server change), the logo mark + color stay beside them, a small blocklist of rude words.

- **NeoN+1 logotype on the title page: first pass BUILT in v11** (2026-10-21). Uses NAMES.md **#15
  EXPONENT** (big N + raised +1) tucked under the jaw, with two tweaks: the build number (`v011`, from
  `VERSION`) beside the +1 one row lower where `N E O N` was, and `N e o N + 1` along the bottom instead
  of `R U N N E R`. "For now"
  (the user may change it more). Background from **#3 CIRCUIT**: circuit traces on the right side and a few
  on the left, static in the top-left corner. **Pulses radiate out from the head:** a yellow spark (gold)
  with a short tail runs from a pad touching the head out along a trace (traces are dim cyan). Dev menu
  `[ title pulse: COLOR / CHAR / BOTH ]` compares recoloring vs. swapping the spark's character for noise.
  Off on REDUCED effects. Code: `TITLE_LOGO`, `TITLE_BG`, `TITLE`, `titleArtLines()`.
  - **To try next:** traces coming *into* the head from the left and out the right (the user's alternative).
- **DONE v11.04: INFO page, opened from the footer** (2026-10-21): a link in the footer (all screens, like the version tag) opens an
  INFO page about the game: what it is, when it was made, who made it (design by the user), and how: built in
  conversation with Claude (Anthropic's AI) in Claude Code, which wrote the code, music and placeholder art.
  Maybe a link to the repo (github.com/gschomburg/neon-1). Could mention One True Door / HackJack.
- **DONE v11.04: Flesh out the repo readme** (2026-10-21): `readme.md` is the GitHub front page; expand it (what the game is,
  how to play, features, multiplayer, version history, how it was made). Not game code: can be done any time.
- **DONE v11.04: Persona names: add THE and PLAGUE** (2026-10-21): `THE` to the before-words (`NAME_A`) and `PLAGUE` to the
  middle words (`NAME_B`), so THE_PLAGUE (Hackers) can roll, along with THE_POTATO, ACID_PLAGUE and so on.
- **Make mod effects easier to see when they trigger** (2026-10-21). *DONE: X-AXIS / Y-AXIS in v12.11, VIRUS, KEYLOGGER, SHATTER, FAILSAFE, TRACER in v12.12 (plus a tray badge flash for mods that fire). Others could use modFired / callout the same way.* Some mods go off too fast to tell what
  happened; give them a beat. Start with **X-AXIS / Y-AXIS**: on the scan, pause a moment and light up the
  whole row / column being checked, especially when the real node is in it, before the reveal (today: the
  tapped tile locks, a quick flash, the message, 420ms, then the real node). Then go through the other
  mods (VIRUS, KEYLOGGER, SHATTER, FAILSAFE, TRACER...) for the same problem.
- **Bigger, roomier buttons on phones** (2026-10-21). On the user's iPhone, some buttons are small and close
  together, mainly the **tray buttons** and **lists**. Think through a mobile pass: bigger tap areas (the
  §12 rule is ~44px), more space between buttons, maybe fewer per row on narrow screens.
- **DONE v11.04: Multiplayer: type the join code on the page** (2026-10-21). JOIN GAME opens a browser popup today; use
  the game's own text field instead, like the other text fields.
- **DONE v11.04: Multiplayer: share link** (2026-10-21). The host gets a `[ SHARE ]` button that copies (or opens the
  phone share sheet for) the page URL with the code in it, e.g. `?room=YUAH`. Opening that link goes
  straight into the room (or the join screen with the code filled in).
- **DONE v11.04: Hacker logo: draw it on your color style's background** (2026-10-21). The big logo is drawn in your
  style's text color straight on the screen background (black for the user), so dark styles hide it. Give
  the logo block the same background as the name on the runner card. Same fix in all 3 places: the
  PROFILE screen, CORP BREACHED, and the multiplayer turn card.
  - **PROFILE layout: logo + name as one lockup** (same day). Today it goes logo, then the logo picker
    (`[ < ] NAME [ > ]`), then the runner card with your name. Put the logo right on top of the card (same
    background) so logo, name and stats read as one block, and move all the controls (logo picker, NEW NAME,
    COLOR, RANDOMIZE ALL) together below it.
- **DONE v12.11: Corp map codes** (2026-10-21; the user's twist 2026-10-22: 2 letters + the corp's level, `SK1`). Many corps
  share a first letter and most single characters are taken (the v11 corps got `{` `(` `5`). Each corp
  gets a static 3-letter code (`SKR`, `BNY`, `CPH`) in the same 3 cells as `[S]`, in its corp colors; the
  special nodes keep their brackets (`[$]` `[?]` `[+]` `[!]`), so they stand out more. Maybe one shared,
  occasional effect (like the mods' scramble glint) on nodes you can travel to; nothing busy. Also used
  in the codex, the results' breached list, the dev corp list and OMNI's intro. Claude drafts all 78
  codes for the user to review before wiring them in.
- **Dev menu palette cycles every palette** (2026-10-21; from §17 "Two palette lists"). The dev menu's
  `[ palette ]` steps through the player palettes plus all 76 corp palettes (75 corps + OMNI), named, to
  preview them. SETTINGS keeps the player list only (`playerPalettes()`). Close pairs are fine as they are
  (PLAYTIME / DIALTONE ONLINE, COLDBREW / CARAPACE ARMOR...). *(Part of the palette pass below; the
  editor's preview may cover it.)*
- **DONE v13.18: BLACKOUT: a grue joke** (the user, 2026-10-23). Somewhere in the corp that goes dark, a nod to Zork's grue ("it is
  pitch black. you are likely to be eaten by a grue."), something like `a wild gru is NEAR!`. *(Claude)*: fits the
  intel line, a codex line, or a message on the boss layer when it's nearly black.

### Breaking the game into files: DONE in v12.00 (see the version log in §16n)

`dist/index.html` is ~10,500 lines. `palettes.js` was the first file out. Next:
- **Data split pass** (easy, pure data): corp intro art (~630 lines), codex corp text, music tracks +
  where they play (`SONGS`, `MUSIC_FOR`; sets up a music editor later), glyphs / hacker logos / name lists,
  help and info text (pairs with keyword highlighting). Mods and items: their names / tips / descriptions
  move, their effects stay in the code.
- **Version stamps** (the user likes it; do it with the data split): every data file carries the build
  number, and the game warns if they don't match (a file the FTP upload missed, or an old copy cached on
  a phone). The `<script src>` links get the build number too (`palettes.js?v=11.01`) so phones fetch the
  new copy.
- **Corp kit files** (the user likes it; its own project, after the data split): each corp in its own file
  (`corps/cipher.js`), registered with the game through a "corp kit" object of the game functions the corps
  use (~50: messages, sounds, locking nodes, moving tiles...). Adding a corp = adding one file. The biggest
  part of the code (~2,800 lines of corps).

- **Spacing / copy pass on the pick screens** (2026-10-22, the user's ask): the black market, data caches, safehouses,
  boss rewards and the swap screens. The copy feels squeezed to fit (short tips, cut descriptions) when there may
  be room for more, and it's making things less clear (e.g. STASH's upgrade read like +2 slots). Look at layout and
  spacing, show the full description where there's room, and say plainly what an upgrade changes.
- **When the game moves** (2026-10-21, the user: gregschomburg.com/br is not its final home; it may get its own
  URL or another folder). The only absolute address is `og:image` in `dist/index.html` (the link preview,
  now `https://gregschomburg.com/br/preview.png`; the site redirects to www): point it at the new place and
  upload `preview.png` there. Everything else is relative (share links use the page's own address). Fold the
  www fix into the next update.

- **Debt: credits that go negative** (2026-10-22, the user's idea). **BUILT v12.16 as the EXOTIC mod LEVERAGE** (one mod: debt + the debt shield; see docs/EXOTICS.md); a LEDGER TRUST rework is still open. Some mods already take
  money instead of integrity (OMERTA, FRIENDSHIP). This goes further: something lets your credits go **below 0**, into
  debt. A second mod gets **stronger the deeper in debt you are**, e.g. a better chance that an ICE hit does no damage.
  The user sees it mixed into existing corps, most likely **LEDGER TRUST** (the bank, LV2: balances whose digits add up
  to 10; boss mod INTEREST). Reworking LEDGER around debt is on the table.
  - Pieces to decide: what opens debt (a mod, an item, LEDGER's boss mod, a corp rule inside LEDGER?); how far down
    (a credit limit?); what debt costs (interest each layer / corp, worse prices, a collector, no CONTINUE?); how the
    debt-power mod scales (per 10cr owed, capped?), and whether it's a block (in `blockHit`, with OMERTA / FRIENDSHIP).
  - Fits / clashes: OMERTA and FRIENDSHIP would charge into debt instead of stopping at what you have; INTEREST pays
    5% of your credits (in debt: it charges you?); the market (can you buy on credit?); CONTINUE? (needs 100cr); the
    credits HUD (`CR -40` in the danger color). Other corps with the money theme: PAWN BROS, LUCKEEZ CASINO, LA FAMIGLIA.
  - Code note: ~25 places check or spend credits assuming they never go below 0; check them all when this is built.
- **Loading / intro screen** (2026-10-22, the user). **BUILT v13.03** (engine/intro.js). Follow-up idea (the user): on a first run, take the player to the profile setup (logo, name, color), maybe not right away (after the first run, or while the profile is still the random default). The game is 111 script files now (~1MB), so a boot
  - **Next for the intro (the user, 2026-10-22):** (**v13.36:** the LOGIN tap, key clicks, the modem, line blips and beeps, music on the card; still open: the glitch / particle effects) music or sound effects, and more glitchy particle effects. The
    catch (the user spotted it): browsers block audio until the first tap or key, so the first boot plays silent.
    *(Claude)* fix: open on `>_ press any key to connect` (a tap or key starts the login with sound, which fits the
    terminal), instead of tap = skip; a second tap skips. Sounds: modem handshake / dial-up screech under the boot log,
    key clicks as the login types, a beep per `ok` (a buzz on `FAIL`), a chirp on `handshake complete`, the title theme
    fading in. Glitches: noise characters flickering through the log, the map drawing in with scan lines / static, a
    burst of characters (like the fireworks) on `handshake complete`, the logo decoding in (like the codex decode).
  - **The title should wipe in** (**BUILT v13.36**: every step of the intro changes with the wipe) after the intro (the user, 2026-10-22): today the intro just ends and the title is there.
    The intro text goes out, then the title comes in with a wipe (like the game's other screen changes), not a cut.
  - **First launch: NEWB or ELITE** (**BUILT v13.36** as NEWB / LEET) (the user, 2026-10-26, from the tutorial notes; linked to the intro): after the
    first-ever intro, a choice. NEWB takes you into the tutorial, ELITE to the title screen.
  - **The intro pass, later** (the user, 2026-10-26): glitch / animation effects on the NeoN title card (and the other
    intro glitch ideas above: noise in the log, the map drawing in with static, a burst on handshake, the logo decoding in).
  - **Your profile randomizing as you log in** (the user, 2026-10-26, later): the intro shows your profile / logo
    shuffling as you log in. Not part of the training.
  moment before the title, mostly for the feel of it (it barely needs to load). *(Claude)* ideas: an old-terminal
  boot log that lists the real files as they load (`engine/run.js ..... ok`, `corps/seekr.js ..... ok`; the version
  stamps in `NEON_FILES` are already there, and a missed or stale file could show as `FAIL` right there instead of the
  red warning on the title), a modem handshake sound, a progress bar out of ASCII, then a cut to the title. Fast and
  skippable (tap / key), shorter after the first visit, off on REDUCED effects. Has to be drawn before the game code
  loads (a small inline script in index.html, or the first file in the list). Could also be where the fake ads show
  first (a "sponsored" line while it "loads": [ADS.md](ADS.md)).
  - **The user's sequence** (2026-10-22): a little text prompt `>_`, the profile name typing in (a login); boot
    text scrolling up; then a **map**: the overworld, or (the user's first thought) an ASCII world / country map with
    a location blinking on it (where you are in the game, not in real life); an **IP address** shown as part of
    start-up; "handshake complete" (or similar), then into the game. The loading bar is worked in as a
    `*****-----` bar that fills during / after the login.
  - *(Claude)* on the IP: the player's **real** IP would need a call to an outside service (the game is static files;
    the page can't see its own IP), and showing it can feel creepy or leak on a stream / screenshot. Suggest a
    **fake IP** made from the profile (same one every time, like `10.0.4.17`), which can also show in the VPN ad
    ([ADS.md](ADS.md)). Real-IP could be an opt-in later if wanted.
  - *(Claude)* the map step could use the ascii-art.de collection in `ascii-editor/reference/` for a world map to start
    from (credit / ask before shipping a piece), and the blinking spot could be the run seed's "city".
- **Multiplayer backend: maybe move off Firebase to p5.party** (2026-10-22, the user; to look into). https://p5party.org/,
  GitHub https://github.com/jbakse/p5.party. Built for p5.js but works with plain JS (`p5party.connect()`,
  `loadShared()`; there's a `hello_party_vanilla` example). Rooms plus shared objects you just change and it
  syncs. *(Claude, from its docs, to check when we get there)*: its own helpers for a host, per-guest shared data
  and messages (`partyIsHost`, guest shareds, `partyEmit`) map closely to our lobby / host / turn model in
  engine/multiplayer.js, which already sits behind a small `Net` layer, so the swap is mostly inside `Net`. Things
  to weigh: the demo server (`wss://demoserver.p5party.org`) is meant for prototypes and teaching, so for real
  players we'd run our own server (a small Node server, i.e. a host to pay for / keep up), vs Firebase (no
  server of ours, but the test-mode rules expire, see §16 multiplayer). No accounts or security rules to speak
  of either way; cheating stays as it is (answers come from the seed).
- **Analytics: see how people play** (2026-10-22, the user; a bigger thing, needs its own plan). Which bosses / corps
  get beaten (and which beat people), and lots more. **Not Google**: build our own, an open-source tool, or a free
  service that isn't gross. *(Claude)* starting points for the plan:
  - **What to track** (game events, not people): run start / end (seed, sector, layers, cause of death or cash
    out, mods and items taken), each corp entered / breached / died in (by layer, misses, time), boss results,
    mod picks vs offers (which get taken, which get skipped), market buys, how long layers take, palette / settings
    picks, device size (phone vs desktop), errors (the red file warning, script errors), multiplayer games.
  - **Options:** (1) **our own**: the game sends small JSON events to a tiny endpoint that appends them to a
    database (Firebase is already in for multiplayer; or a Cloudflare Worker / Supabase free tier), and we read
    them with a script or a small dashboard page; full control, game-shaped data. (2) **open source, self-hosted or
    their free cloud:** Umami, Plausible (self-host free; cloud paid), GoatCounter (free for small / non-commercial,
    mostly page views), PostHog (open source, generous free cloud tier, has custom events and funnels, heavier).
    (3) a mix: a light page-view counter + our own events for the game stuff. Game events ("died to SIGIL on layer
    3") fit (1) best; the web tools are built around page views and clicks.
  - **Not gross:** no personal data, no cookies, an anonymous random id per device (not the profile name), a
    line on the INFO page saying what's sent, and a settings switch to turn it off. Batch events (send at run
    end / when the tab hides) so it doesn't slow play. Ties to leaderboards (§17), which need a backend too, and to
    the multiplayer backend choice above (p5.party / Firebase).
- **Flipped characters: effects that mirror text** (2026-10-22, the user; ideas, not built). The renderer can
  already turn a cell 180° (UPSIDE's `r180`, engine/render.js) and the whole screen (UPSIDE's `flipNow`, with taps
  flipped to match). Adding per-cell `flipX` / `flipY` (mirror around the cell's center) is ~5 lines; a whole-screen
  left-right mirror is the same as UPSIDE's rotate with taps mirrored. Pixel-flipped glyphs read backwards (`b`
  looks like `d`); for art that should still read as ASCII, swap characters instead (`/` `\`, `(` `)`; MIRRORLINE
  has `mirrorGlyph`).
  - **MIRRORLINE flips its characters when the mirror flips.** Its tell: the real node mirrors last layer's spot
    (left-right; deeper top-bottom; boss through the center). *(Claude)*: each layer the glyphs flip on the same axis
    the tell uses (`flipX` for left-right, `flipY` for top-bottom, both = 180° for the boss), maybe with a quick
    "mirror sweep" across the board as the layer opens. Doubles as a hint about which axis is in play.
  - **A corp or mod that flips things backwards.** *(Claude)* where it could fit: **UPSIDE** (screen upside down,
    the real node's word reads right side up): a deeper / boss variant in mirror writing (left-right) instead of
    rotated; **KERNING** (one character of the real node is a pixel off): a variant where one character is mirrored;
    a new **corp modifier** like ARMORED / THIEF (engine/map.js `CORP_MODS`): BACKWARDS / REARVIEW, the whole corp
    is mirrored left-right (taps too); a **mod** (*(Claude)* names: REARVIEW, MIRROR WRITING, DA VINCI): e.g. the
    real node's glyph flips for a blink at layer start, or ICE you hit flips to show it's dead. Also usable in ads
    and art (a backwards ad, a flipped logo).
- **Economy tuning pass** (2026-10-22, the user: money feels easy to get and not very powerful). Look at what layers,
  caches and loot pay vs what things cost (market prices, repairs), and what money is for late in a run. The exotics
  that trade in money (BLOOD MONEY, LEVERAGE, COIN FLIP's $ bets) lean on this.

- **Popup overlays over the board: reuse the coin box** (2026-10-22, the user). COIN FLIP (v12.19) already has the
  pieces of a general "popup over a node": a **hold on a node** that opens it (`st.coinPress`, `coinTick` / `coinDrag`
  in engine/input.js and engine/run.js), **drag to a choice and let go** (or keys: left / right, enter; Esc / let go
  elsewhere cancels), and an **overlay drawn over the board and header** (`drawCoin` in engine/scene.js; `clearRect`
  drops the characters under it, since characters always draw over backgrounds). The x N drop-in (`drawCoinPop`)
  is a second overlay of the same kind. When something else wants a popup, pull these into one shared piece (e.g.
  `nodePopup({ i, choices, onPick })`) instead of copying the coin's code. *(Claude)* possible uses: ALL OR NOTHING's
  lever, items that target a node (PURGE on the node you hold), a quick info card for a node (its glyph / tell
  marks), the fake ads (an ad box over the board), confirm prompts ("replace this mod?") without leaving the board.

- **A THE BOARD unlock for finishing the codex** (2026-10-22, the user). Something you can only buy with REP once the codex
  is complete (every corp, tell, mod, item and glyph found). THE BOARD already sells REP unlocks (`LEGACY` in
  engine/save.js: HARDENED, SEED MONEY, FIELD KIT, WIDE BELT, SHORTLIST, DEADMAN); this would be a locked entry there,
  shown as `???` / "complete the codex" until then. What it is: open. *(Claude)* ideas, from most to least fitting:
  - **THE ARCHIVE:** start every run by picking any one mod you've ever found (the codex becomes your armory). Pricey.
  - **ARCHIVIST** (a mod you start with): you've learned every tell, so each corp's tell is printed when you enter it
    (SPOILER for every corp, every time).
  - **An exotic pick:** the sector boss offers two exotics instead of one, or you start with one exotic of your choice.
  - **Cosmetic:** a gold codex palette, a title-screen badge, a special logo for your profile.

- **HOW TO PLAY pass** (2026-10-22, the user). Go through it and touch it up; a lot is new. Today it has three pages
  (engine/help.js): THE BASICS, THE NET (the map, stops, corps, sectors), THE TRAY (mods, items). Corps and tells are only
  on the NET page; **THE BASICS should at least mention corps and their tells** (the heart of the game: each corp hides
  the real node its own way; learn it and you beat it). *(Claude)* what else is new since it was written:
  - **Map:** corp codes with levels (`SK1` = SEEKR, level 1), the glint on nodes you can go to, `off here:` lines.
  - **Tray:** the mod flash when a mod fires; items that say why they can't be used; a locked mod; RAM DOUBLER's two rows.
  - **Exotics:** what EXOTIC means, where they drop (sector bosses, markets, caches), rule clashes ("it will replace X").
  - **Gestures:** hold a node for COIN FLIP; the keys (C, arrows, enter).
  - **Other:** the login intro (tap to skip), the fake ads (`[x]` after the countdown; SETTINGS turns them off),
    THE BOARD and REP if they aren't explained, run resume (CONTINUE).

- **DONE v13.18 (the tags; the rarity / level part is still open): Say what each offer is: mod or item** (2026-10-22, the user). The black market tags every line (`mod`, `mod+`, `item`,
  `svc`), but the reward screens (CORP BREACHED, OMNI / sector boss, data cache, safehouse, the starter perk) only show
  the name and its rarity (`RARE`, `BOSS`, `EXOTIC`). Wherever a list mixes or could mix mods and items, say which each
  one is, the same way as the market. Goes with the spacing / copy pass on the pick screens (set aside, the UI pass).
  - **The data cache too** (the user, 2026-10-22): its list needs the mod / item tag on each line.
  - **Rarity vs level, shown the same way** (the user, 2026-10-22): mods that start at EPIC (KEYLOGGER, TRACER) level up
    LV1-LV3 instead of climbing rarity, and their label shows `LV2` *in place of* the rarity (`tierLabel` in
    engine/mods.js), next to other mods showing `EPIC`. Show both, the same everywhere: the rarity, plus the level when
    it has levels (e.g. `EPIC LV2`, or the EPIC chip and `lv2`).
    - **Open question (the user):** should a higher level look rarer? A LV2 of an EPIC mod as BOSS? *(Claude)*: BOSS and
      EXOTIC already mean something (from a corp boss; rule-benders), so borrowing them would muddle that. Options: (1) rarity =
      where it comes from, level = how upgraded, shown together (`EPIC II` / `EPIC+`); (2) a new top rarity only for maxed
      mods (LEGENDARY / MAXED, its own color), whatever they started as; (3) levels climb EPIC > EXOTIC > BOSS (the user's
      first thought; muddles them). Claude leans to 1, maybe with 2 on top.
    - **DECIDED + BUILT v13.19 (the user, 2026-10-25):** scrap > common > rare > epic > legendary > exotic; BOSS becomes legendary (corp mods, never upgrade); only mods where it makes sense reach legendary. See the v13.19 log.
    - **The user, 2026-10-23: mods need legendary versions.** Maybe BOSS mods just get renamed LEGENDARY, or BOSS turns
      into something else. Or a fuller ladder with a green tier in the middle: **scrap (white), common (green), rare
      (blue), epic (purple), legendary (orange), exotic (gold)** (the usual loot colors). *(Claude)*: that ladder would
      leave BOSS out; it could become a tag (where it drops) rather than a rarity.

- **Integrity animations** (meat notes, 2026-10-25): at 1 integrity the HUD # blinks a little (close to death); gaining
  integrity scales the # up past the grid a moment; losing one makes the # explode and fall (like the other break-apart
  effects). **BUILT v13.22** (see the version log).
- **Fewer rest stops per stage** (meat notes, 2026-10-25): **BUILT v13.26** (2 a stage on the map, the market always one). maybe cap the markets, data caches and safehouses at 2 per stage,
  picked from those (and any other "rest" node). *(Claude)* today each stage's 4 rows of 3 hold 3-4 of them (rows 2-4
  always have one, row 1 too after sector 1: engine/map.js addSector), but a path only passes one per row. Open: cap what
  the map shows (2 per stage, the rest become corps), or what a path can reach?
- **Mod picker out of the dev menu, into the neon editor** (meat notes, 2026-10-25): **BUILT v13.26** (the items & mods tab; the dev menu list stays too). the dev menu's mod list doesn't
  show clearly that you have a mod or at what step. Move it to the editor (the items & mods tab could add / upgrade /
  remove mods on the running game through the bridge), and show the step you hold.
- **Art catalog in the neon editor, with asXii for the drawing** (the user, 2026-10-25; **BUILT v13.27**, option 2: one art file).
  An ART tab: every simple piece of art in one place (node glyphs, corp intro art / logos, hacker logos, the title art;
  maybe more), each with an "edit in asXii" button that opens asXii with that art loaded at its size, and a way to bring
  it back. Ads stay out (their line options and animations don't fit asXii), or later only an ad's plain art block.
  *(Claude)* how it could work:
  - **The round trip:** the editor opens asXii in a new tab with the art and its fixed size; asXii gets a
    "send back to NeoN+1" button that posts the art to the editor (window.opener, same as the game bridge). Copy /
    paste both ways stays as the fallback.
  - **The save:** the editor checks the size and characters, then writes the source file the way PALETTE writes
    palettes.js (Chrome file access). Art inside hand-written files (corps/*.js) is the tricky part: either the editor
    replaces just that `CORP_ART.key = [...]` block (the format is regular), or all the art moves to one generated
    file the editor owns (`data/art.js`, like palettes.js). The editor handles the escaping (`\` and `'`).
  - asXii's special cells (opaque space, character-set codes) already turn into plain characters on export.
  - **BUILT v13.28** (see the log).
  - **Next (the user, 2026-10-25, talking it through):** split art.js by kind: node glyphs (with names + lore), the
    world map, and **one logos file for every logo**: player logos (the 15 now), corp logos (today's corp intro art)
    and later adversary hackers' logos. Each logo: an id (saves keep the id, not the list position), name, a
    3-character mark, the art, and what it is (player / corp + corp key / hacker + hacker id) and how it unlocks
    (corp: beat it; hacker: beat them). Unlocked corp and hacker logos can be picked as your profile logo.
    Snag: 37 of the 79 corp pieces are bigger than the player-logo size (21 x 5): 35 are 6-7 tall, MIRRORLINE and
    PERIMETER are 22-24 wide. To decide: one bigger size for every logo, or a smaller version of those corp logos.
    **Decided (the user): one bigger size for every logo, ~24 x 7.** Where the big logo shows (measured at phone size,
    36 x 38): the profile card (inner width 25: fits; +2 rows, the screen has room), the welcome screen (28 of 38 rows
    used: fits), the multiplayer turn card (the board: fits), CORP BREACHED after a boss win (**already uses all 38
    rows**: +2 doesn't fit). *(Claude)* for CORP BREACHED: a tall logo takes the place of the blank spacer rows, and
    when there still isn't room (shorter screens), only the mark + name line shows.
    Also: add new glyphs / logos in the ART tab. And an idea: a daily seed (DAILY RUN, the same seed for everyone that
    day, feeding the today leaderboard); there is no daily seed today.
- **KERNING: make the tell a whole row, and bigger** (the user, 2026-10-25). **BUILT v13.26.** Today one character of the real node is
  nudged 3 / 2.5 / 2 px (deeper corps 2.5 / 2 / 1.5; boss 2.5). Change: nudge the **whole row** of the glyph (one line
  of the real node), and by a bit more. Keep it shrinking layer by layer (the user likes that).
- **A happier success sound on layers** (the user, meat notes 2026-10-25): **BUILT v13.26.** "it's not always clear you got a node successfully." The real-node
  sound needs to read as a win (brighter, rising, more "yes!"), and the fail sound could differ more from it too.
- **Mod notes (the user, from 2026-10-25, while playing v13.19).** Collect them here, then rebalance in a batch.
  - **BUILT v13.21 (meat notes, "mod rarity notes"):** FAILSAFE epic recharges each stage, legendary (new) each corp;
    VIRUS legendary spreads through touching ICE, up to 4 locked (never the last ICE); SKIMMER common +25% > rare +50% >
    epic +75%; BUFFER common +1 > rare +2 > epic +3 > legendary +4 max integrity (each step heals what it adds); BURNER
    common 1x > rare 2x > epic 3x per corp; X-AXIS and Y-AXIS epic (80cr), kept as two mods. COOLANT and SKIPJACK fine as is.
    Answered in chat: STASH's "loot" is loot nodes in corps and data cache drops (not markets); CACHEKEY adds extra drops
    (common 2 total, rare 3, epic 4: each credits or an item) and raises the cache's exotic chance, not more choices.
  - **FAILSAFE: once per run, then a dead slot.** It saves one killing hit (leaves you at 1), then sits in the tray
    "(spent)" for the rest of the run, taking a slot; nothing resets it and it has one step (epic), so a second copy does
    nothing. *(Claude)* ideas: (1) a **legendary step that recharges** (each sector, or each corp boss); (2) **spent but
    useful**: sell it back, or it turns into something small (+1 max integrity) once it fires; (3) legendary **saves
    twice**. Other legendary-step candidates from the rarity pass: SKIMMER, and the minor mods' top steps (each needs a
    new effect, not just a new label).
  - **BUILT v13.23 (meat notes, "mod notes leg+exotics"):**
    - ICE EATER: the real node bites for 3 (was instant death) and the layer passes with no pay; FAILSAFE catches it if
      the 3 would kill you. ("everytime i got ice eater i died with the one hit pretty quick")
    - LEVERAGE: every corp layer takes a loan payment (5cr, +5 each sector), in debt or not, never past the limit, so
      you stay in debt. The tray tip shows it.
    - CORNERS is now **FENCELINE** (FNC, key still `corners`): every layer locks all the ICE along one random edge,
      always leaving 1+ ICE. An edge with one node left standing points at the real node. Name open if you want another.
    - BULWARK: a perfect in the same corp charges it back up ("bulwark up" on the message).
    - COUPON: markets also make one random offer FREE (plus the extra offer it already gave).
    - SUPERSIZE: every layer pays x2 (was boss layers x1.5). Recheck in the credits balance pass.
    - MUTATE: what it becomes is always rare or better (any step of that mod, legendary included; a mod with no steps
      comes at its top). New each corp: the tray badge flicks between MUT and the new mod for ~2s and the message
      says "mutate: now coolant (rare)". The tray tip shows its name, rarity and tip.
    - TRIAGE: beating a corp drops a PATCH on your belt (they stack up); belt full or RAM DOUBLER: heals as before.
    - CONTINUE?: once per corp (was once per run); 100cr, +100 every time you use it (200, 300...).
    - Tap mods stand out more: a ready tap mod's [brackets] pulse, and the first time each one is ready in a run the
      message line says "[BLS] is ready: tap it in your mods."
    - COMPOST's tray tip shows its count (compost 2/3).
    - Answers: **COMPOST** hurts first and then heals, both before the death check, so the 3rd hit nets 0 and can't kill
      you (a 2-damage hit still nets -1). **TWIN LOCK** has no distance limit already: outside CLONEWORKS it locks the
      closed ICE whose glyph shares the most characters, anywhere on the board, so it plays like a random second lock.
      **INDEX** marks the ICE you hit with >>> (the real node is later in reading order) or <<< (earlier); X/Y-AXIS scan
      a whole row or column, and QUEUE NUMBER shows the exact count (+3).
    - Keepers as is: the pet one (COMPANION), POLICY, UNRAVEL, TRIAGE (now with the patch), CONTINUE.
  - **To talk about (leg+exotics notes):**
    - FORGERY's partner: something else that plays with $ nodes. The user's idea: a mod that turns $ nodes into exotic
      mod nodes. The user: "it would probably need to be pretty rare." Still open: what one costs to open (a hit, like
      $ nodes now?).
    - AFTERIMAGE: the user, 2026-10-25: keep it as is.
    - **BUILT v13.24: SURGE** (the user: "layer has a clock and heal if it's the last 3 seconds"): every corp layer
      has a clock (OVERCLOCK's 15s when the corp has none, no purges), and a real pick in the last 3 seconds heals 1
      (was x1.5 pay).
    - EZPASS is weak (+2cr a layer): health instead, or wait for the credits balance pass. Bigger point: **a corp's
      boss mod should match its difficulty** (harder corps give better mods), so EZPASS can stay small if TOLLGATE is
      an easy corp. Worth a pass over all 78 corps' mods by corp tier.
    - **BUILT v13.25: GRAVE ROBBER's track.** Holding the mod, its own track (GRAVE ROBBER: 5/4, Halloween-inspired,
      a creaking door and an owl) plays instead of the map track. Corps keep their own. See docs/MUSIC.md.
    - CONTINUE? vs FAILSAFE: now both once per corp (FAILSAFE legendary), CONTINUE costs credits that climb. Check after
      some play which one is better.
    - Credits balance pass: POLICY, SUPERSIZE, EZPASS, LEVERAGE's payment all wait on it. The user: soon, not yet.
    - **BLOOD MONEY is too strong** (the user, meat notes 2026-10-25): "super powerful, basically immortal." Hits should cost more; maybe perfect
      combos don't add up (perfects pay you credits = heal you). For the balance pass.
    - **X-AXIS / Y-AXIS need a better "it fired" moment** (the user, meat notes 2026-10-25): **BUILT v13.26** (the band). the timing is fine, the indicator isn't. Idea: a
      background color fills along the row / column, starting at the node you tapped and sweeping to the real node.
  - **Mod and item ideas (the user, meat notes 2026-10-25)** (not designed yet):
    - **Sell at markets:** sell mods or items back at a store. Gives a reason to carry scrap: junk items that are only
      worth credits, sold when you find a market.
    - **More scrap mods:** one that is literally just scrap ("BOX OF WIRES: i'm not going to sort these"), maybe 2
      worthless ones. And **one scrap mod that climbs all the way to legendary and is then super good** (the joke mod
      that pays off if you stick with it). Ties to the quest "carry a worthless scrap mod through 3 stages" (§17 quests).
    - **Random items on perfects** (a mod).
    - **Travel any direction on the map** (a mod; the rules question is in §17 "Moving backwards on the map").
    - **Better drops:** any mod / item you get has a 10-20% chance to come one rarity step higher.
    - **VIRUS, bigger:** a mod (or a VIRUS step) that breaks *all* the connected ICE. (VIRUS legendary does up to 4 today.)
    - **A glyph mod:** changes the glyph characters (or upper / lower case: see CORPS.md #50).
    - Exotics from the same notes are in EXOTICS.md ("New exotic ideas, 2026-10-25").

- **DONE v13.18: Game over: your mods and items go in the scrolling area with the map** (2026-10-22, the user). Today the death
  screen lists the run's mods in rows of 5 above the run's map (which scrolls). Move the mods and the items you held
  into that scrolling area, like the tray, alongside the map. Ties to the user seeing only 3 of their mods on a death
  (2026-10-22; a headless run showed both rows, 5 + 3, so maybe the first row was hidden on the phone): check it there.

- **10 more glyphs, to 32** (2026-10-22, the user). The codex has 22 glyphs: 18 node glyphs (`MOTIFS_RAW` in
  data/glyphs.js, each with a name and 3 lore lines in `GLYPH_LORE`) plus 4 specials (LOADED NODE, SIGIL SIGNATURE,
  REDACTED...). Add 10 node glyphs (5 wide, 3 tall, like the rest) with names and lore, at the end of both lists. Note:
  more glyphs change which glyphs layers roll, so the check baseline's layers shift (re-save it); look at corps whose
  tells read glyphs (KERNING, PURLWISE, KEYLOGGER's lines...) to make sure the new ones work with them.

- **DONE (the neon editor's ? help, 2026-10-26): A content editing guide** (2026-10-22, the user): one doc (e.g. `docs/EDITING.md`) on how to edit the editable
  content, mostly art: where each piece lives, its size, and the little syntax tricks. Not how to edit everything. *(Claude)*
  what it would cover:
  - **Ads** (data/ads.js): 30 x 18 screens; line options (color, centered, bold, inverted, button); `adBig` block
    letters; bars `{bar}` / `{bar:20:6s}` / `{rbar}`.
  - **Corp intro art / logos** (`CORP_ART` in each corps/*.js): size, blank columns trimmed automatically, centering.
  - **Hacker logos** (the profile logos), **node glyphs** (5 x 3, data/glyphs.js, with names and lore), **the title art**
    (data/title.js), **the intro world map** (`INTRO_MAP` in engine/intro.js), **lock labels** (5 letters).
  - **Gotchas:** inside these files' quoted lines a backslash is written `\\` and a quote `\'`; keep lines the right width; then
    `node tools/bump.js minor` and `node tools/check.js` before uploading.
  - **Palettes:** a pointer to tools/palette_editor.html.

- **An ASCII art tool** (2026-10-22, the user; working name asXii, v0 bare bones built 2026-10-23): everything for it lives in its own folder,
  [ascii-editor/](../ascii-editor/README.md) (plan: [PLAN.md](../ascii-editor/PLAN.md); may become its own repo later)
  (standalone, not part of the game).
- **More room for long text** (2026-10-22, the user): the codex and the mod descriptions need more space; some
  descriptions (and the new exotics' codex text) are long and get squeezed. Check other places too: the reward / market
  detail boxes, the tray's info line (one line), the clash screen. *(Claude)*: options are a scrolling detail box, a
  taller box on screens with room, or shorter text with a "more" tap. Goes with the UI pass.

### Palette pass (2026-10-21): sort these out before / with the palette editor

The user's next big task is a **palette editor and preview system**. Everything that changes what a palette
*is* goes first, so the editor is built on the final shape.
1. **DONE in v11 (2026-10-21), with the move to `palettes.js`** (see §16n). Names picked by the user:
   `bg dim mid text bright accent danger dangerDim money` (was cyan / red / redDim / gold). Original note:
   **Rename the color slots to their roles** (the user agreed the names mislead). Today: `bg dim mid text
   bright cyan red redDim gold` + rarity `common rare epic exotic boss` (14). `cyan` is the accent (orange
   in AMBER, pink in DUSK) and `gold` is the money color (dark amber on PAPER, light blue in TWINLINK, ice
   white in GLACIER). Something like `accent`, `money`, `danger`, `dangerDim`. Mechanical, but touches the
   whole file.
2. **Keyword highlighting in text** (the user's idea: code-editor style). In HOW TO PLAY, and throughout
   info pages and mod descriptions, key words take their game color: ICE = danger (red), credits / cr =
   money, integrity = accent (matches the HUD bar), PERFECT / real node = bright, mod names = their rarity.
   No new colors needed. A short keyword list, colored automatically as text is drawn, with an inline tag
   to override. Watch: headings already use the accent (integrity could use bright instead); keep the
   list short. If a dedicated "keyword" color is wanted later, that's one new slot.
3. **Palette checks / fixes** (audit 2026-10-21 over all 84 palettes: 5 player + 78 corps + OMNI):
   - **Accent = money (exactly the same color) in 14 corp palettes:** SIGIL, MEGAMART, HAUTE, BURGERTRON,
     TUMBLER, ZODIAC, PLAYTIME, APIARY, DIALTONE, BIDBLITZ, FAMIGLIA, LUCKEEZ, TOLLGATE (+ close in
     BRIGHTLINE, COLDBREW). Buttons, credits and gold glows look alike. Matters more once keyword
     highlighting and unlocks land.
   - **Secondary text (`mid`) is hard to read in ~20 corp palettes** (contrast under 3:1 on the background):
     STREAMFLIX, PREDATOR, OMNI, LAGRANGE, TWINLINK, ENTROPY, GRAVITAS, FAMIGLIA, CHUCKE, BIDBLITZ,
     BULLET TIME, GROUNDHOG, BITROT, DROP4, UPSIDE, TEMPO, BURGERTRON, AEGIS, MONTE, NOIR. `mid` is used a
     lot (HUD labels, stats, info lines). `dim` is faint on purpose and is fine.
   - **Same color for two jobs:** boss rarity = danger red (AMBER, PAPER, LEXICON); accent = bright
     (SPECTRA, PLAYBALL); text = bright (FOURTH WALL, probably on purpose: the old blue-screen look).
   - **Palettes that look alike:** PLAYTIME / DIALTONE (known), LIFTCO / GROUNDHOG, RYDR / ENTROPY,
     COLDBREW / CARAPACE, TOLLGATE / BLACKOUT, HEADLINE / PAWNBROS, SPECTRA / PLAYBALL, CLONEWORKS / CIPHER.
   - The editor should show these checks live (contrast numbers, "too close" warnings).
4. **One palette list: DONE in v11.01-02** (player palettes folded into corps; starters = the 9 level-1 corps).
   **Unlocks: still to build** (beating a corp shows its palette in SETTINGS). Original note: **One palette list + unlocks** (§17 "Two palette lists"): player and corp palettes become the same thing;
   the 5 player palettes are the free starters, and beating a corp unlocks its palette in SETTINGS.
   Needs a field tying each palette to its corp, and locked ones hidden or shown as `???`.
5. **Dev menu palette cycles every palette** (item above).
6. **Font per palette:** keep the option (OMNI uses weight 700/800 only); decide if the editor exposes it.
   The typeface/size parts are leftovers from the reverted per-corp fonts.
7. **BLACKOUT** fades every slot but red toward the background (v11): the editor should be able to preview
   that, and the rename has to keep red out of it.
8. **Player color styles** (`PLAYER_STYLES`, the persona name colors): **moved to `palettes.js` in v11.01**
   (`styles`); the editor should cover them too. Related: "Hacker logo: draw it on your color style's background" (above).
9. **The palette editor: BUILT in v11.03** (see §16n). As agreed 2026-10-21:
   - **A dev tool, for the user**, not a player feature.
   - **Separate page** `tools/palette_editor.html`: the game in a frame on the left, a regular web form on the
     right (real color pickers, text fields, dropdowns), with none of the game's screen / UI limits.
   - **Preview without playing:** a scene picker (title, overworld, a corp layer, a boss layer, a hit node,
     HOW TO PLAY, codex, settings, reward...) puts the game on that screen with a canned, frozen sample
     state. The game gets a small listener ("show this scene", "use these colors") that's only on when
     opened by the editor, so normal play isn't touched.
   - **Palettes move to their own file** `palettes.js` (the first step of splitting the game into data
     files); the game and the editor both load it. Do the slot rename (item 1) in the same move.
   - **Saving:** the editor writes `palettes.js` directly (Chrome can save to a file you pick), with an
     EXPORT (copy code) fallback. The user is on Chrome, and the game is served from a web host, so the
     extra file is fine (it has to be uploaded next to the game).
   - Order: move + rename first, then the editor; keyword highlighting and unlocks after.
10. **Rarity colors left the palettes in v12.01** (rarity chips: fixed pairs, the same in every palette; see the
   version log). `C.common`... still exist as the chips' key colors.
11. **Colors that live outside the palettes** (the editor should know about them, maybe edit some):
   - **Map corp icons** use each corp's own background + accent, drawn on whatever palette you're in
     (`corpIconCols`; it swaps in the corp's `dim` when the backgrounds are too close).
   - **Player color styles** (`PLAYER_STYLES`, 10 fg/bg pairs: NEON, TOXIC, BLOOD...) and multiplayer
     cursor colors (your style, or palette slots by join order).
   - **SPECTRA's rainbow** (6 fixed colors, its tell), the screen flash (white by default).
   - **Mixed colors:** palette fades, BLACKOUT's darkening, the title's dim traces (background + accent).
12. **Light palettes** (PAPER, MIRRORLINE, LEXICON): check effects made with dark screens in mind (white
   flash, glows, BLACKOUT fading to the background) in the editor's preview.

Built straight into v05 after release:
- **Version number in the footer:** `beta_runner v05`, right-aligned and dim, on every screen (next to the seed during runs, bottom corner on the title).
- **CORPS tab in the codex** (`[MODS] [ITEMS] [GLYPHS] [CORPS]`, compact tabs). Corps show as `???` until you enter one. A found corp shows its quote, special rules, boss twist, its corp mods and your record (breached / lost); its **tell is written in only after you beat it**. Short list (5) with a taller details box. Selecting a found corp switches the codex to that corp's palette. Records are saved across runs (`corpStats`).
- **More diverse corp palettes:** PERIMETER = concrete grey + hazard orange, SIGIL = deep violet + gold, CHRONOS = green terminal, MIRRORLINE = **light** (icy white + deep blue), OMNI = red on black (unchanged). Also shown in the codex when a corp is selected.
- **Suck-in transition removed entirely** (it was only left on the win). Winning now flows from the final boss's big success wipe straight into the win screen, with a victory fanfare (boom, major chord, fast run up two octaves, held top note + sparkle), a flash and kick, and **type fireworks**: ~9 bursts of words (`ROOT`, `ACCESS`, `OWNED`, `0xFF`...) and noise characters exploding across the screen in accent/gold/rarity colors, each with a crackle. Win screen has an unlocked-padlock ASCII header. (Will change once runs go endless; see §17.)
- **Palette changes fade:** every color (background, text, accents) blends from the old palette to the new one over ~0.7s (`PALETTE_FADE_MS`), instead of snapping. Quick changes (scrolling corps in the codex) continue from the current colors. Instant when effects are set to REDUCED.
- **Per-corp fonts: tried and reverted.** Different fonts per corp (Share Tech Mono, Space Mono, VT323, IBM Plex Mono) were too much. Everything is back on JetBrains Mono; OMNI keeps a heavier weight of it (700/800). The per-palette `font` option (family, weight, scale) still exists if we want it for one special corp later (e.g. CIPHER).
- **Dev menu cleanup:** removed `[ jump to final corp ]` and `[ jump to final boss ]` (free travel covers both). Added **`[ god: ON/OFF ]`**: ICE does no damage (message says "god mode: no damage"). `[ jump to boss ]` (current corp, or the corp selected on the map) stays.
- **Dev menu: `[ free travel: ON/OFF ]`** lets you pick and enter any node on the map (including the final corp), going through the normal flow (intro screen, layers). Marks the run as practice.
- **How to play:** the CORPS page merged into NET (map, node types, and how corps hide the real node / tells in the codex). Tabs are now `[BASIC] [NET] [TRAY] [TIERS]`.
- **Keyboard `>` marker only where there's room:** buttons on their own line and the first button in a row keep it; tightly packed buttons (volume `[-]`/`[+]`, how-to-play tabs) get just the background highlight, so the `>` no longer covers neighboring text.


## 16i. Up next: mods & corps (working list)

Brainstorm notes for the next round of work on mods and corps; append here as ideas come up, then
pick from it when building. **Most of this list was built in v08 (see 16j).** Still open: more minor
mods, the full tell balance pass, filler corps / final bosses / new corps, the OVERCLOCK row-flash
variant, scans as patterns, DECODER / HYDRA mods, recon stops, REP.

**Unbuilt mods & items: running list** (one place to check; details in the notes below or the § noted)

| Idea | Type | Status / where |
|---|---|---|
| SHATTER `SHT`: ICE hits have a 1 in 3 chance to do no damage | MIRRORLINE boss mod | **built v08** |
| FAILSAFE `FSF`: once per run, survive a killing hit at 1 | EPIC mod (general pool for now) | **built v08** |
| VIRUS `VRS`: hit ICE, lock one neighboring ICE | EPIC mod (general pool for now) | **built v08** |
| TRACER direction rework (L2 = two directions) | mod change | **built v08** |
| Mod upgrades / levels; minor mods tier COMMON to RARE to EPIC, higher tiers found in the wild | system | **built v08** |
| More minor mods | mods | below (Pool review) |
| Tiered items: PATCH / PURGE / FWALL / SPLIT in rare + epic | items | **built v08** |
| REROUTE + WORMHOLE become items | mod to item | **built v08** (ROUTE, WARP) |
| Scans: tap checks a pattern at once (cross, X, row, column); cost options | upgrade | §7 (first brainstorm, "area click") |
| KEYLOGGER `KLG`: each ICE you hit turns into one line of the real node's glyph (Wordle-ish) | EPIC mod, general pool for now (a corp later) | **built v08** |
| X-AXIS / Y-AXIS (or BINGO / BANGO): tapping ICE in the real node's row / column finds it | RARE mods (two) | **built v08** |
| Tell-hint upgrade | mod | §9 |
| OVERCLOCK alt: at 1s left, flash the real node's row instead of purging | mod variant | §5 boss loot |
| DECODER (translate CIPHER for a layer); mod that keeps the HUD readable | item / mod | §17 CIPHER |
| Mark HYDRA's spawned nodes; stop the first spawn per layer | mods | §17 HYDRA |
| Recon stop (learn a tell); REP unlocks add mods to the pool | map / meta | §6, §17 |
| Boss reward gets a 3rd random option (upgrades a mod if you own it) + tier find/upgrade rules | reward change / system | **built v08** |
| Exotic batch: ICE EATER, QUANTUM, GHOST, all-or-nothing, coin flip, carried-over ICE, WORM / LOGIC BOMB / FORK BOMB, the slot trade, exotic items | EXOTIC mods / items | **[EXOTICS.md](EXOTICS.md)** (concepts, 2026-10-22) |
| NUKE: wipe a corp node off the map, no reward (HALFLIFE) | EXOTIC item | CORPS.md A21; §17 (hidden quest) |
| Debt: something that lets credits go negative + a mod stronger the deeper in debt (2026-10-22) | mods / LEDGER rework | §16f "Debt" |
| A backwards / flip mod (REARVIEW, MIRROR WRITING) and a BACKWARDS corp modifier (2026-10-22) | mod / corp modifier | §16f "Flipped characters" |
| Ad mods: free trial of a corp's mod from its ad; AD BLOCKER (the user likes it); secret ad + mod combos (2026-10-22) | mods, wait for the ads | ADS.md |
| Second boss mod for the corps that have one (74 of 78) | boss mods | (no list yet) |
| TRUTH METER: says whether the corp's tell is really in effect (2026-10-23, the user) | mod; maybe a REP bonus, or unlocked once you've found the corp | not designed |
| Dummy ICE: a mod that adds ICE, clearly marked as dummies, to combo with other mods (VIRUS, KEYLOGGER...: more ICE to hit) (2026-10-23, the user) | mod | not designed |
| Legendary versions of mods / a fuller rarity ladder (2026-10-23, the user) | system | §16f "Rarity vs level" |

**KEYLOGGER: a Wordle-style clue mod** (noted v07)
- The real node's glyph is the "word". **Each ICE you hit changes its glyph into one line of the
  real node's glyph**: top line on the first miss, middle on the second, bottom on the third. Rule
  out every node whose line doesn't match. Readable at a glance; builds up like Wordle.
- Working name **KEYLOGGER** `KLG` "each miss logs a line of the key."
- **Decided:** option A (line by line). **EPIC**, in the general pool for now; can move to a corp's boss later.
- Upgrades: L2 reveals two lines per miss, L3 the whole glyph on the first miss.
- Alt / L3 / separate EPIC: **Wordle colors**: the hit ICE keeps its glyph, each character colored
  green (same char, same spot in the real glyph), yellow (in the real glyph elsewhere), dim (not
  in it). Closer to Wordle, but a lot to read on tiny glyphs mid-run.
- Needs **glyphs unique within a layer** when active (today two nodes can share one).
- **SIGIL counters it** (on purpose?): its real node shares the signature with decoys, so the lines
  point at all of them. Weak in SIGIL, strong elsewhere.

**X-AXIS / Y-AXIS: row and column scans** (noted v07; replaces the reveal-a-row item idea)
- A grid row as an item isn't very useful with so many empty cells. Instead, two **RARE** mods:
  - **X-AXIS** (row) and **Y-AXIS** (column). Alt names: **BINGO / BANGO**.
- Behavior (as understood; confirm when building): when you tap an ICE node and the real node is in
  the **same row** (X-AXIS) or **same column** (Y-AXIS), the scan catches it: **no damage**, the
  layer counts as found. If it's not lined up, you take the normal hit from the node you tapped
  only, **never from the other ICE in that row/column** (no risky-scan penalty).
- Suggested cost: a scan pass is **not a perfect** (no perfect pay or heal), so it's a safety net,
  not free money. Open: anything else (once per layer? charges?).
- Draft text: X-AXIS tip `row scan finds real.`, desc "tap ICE in the real node's row: the scan
  catches it. no perfect." (Y-AXIS the same with column.) The scanned ICE node shows `SCAN` / the code.

**TRACER: direction instead of distance** (noted v07)
- Today a hit ICE node shows `<3>`: the distance to the real node in grid steps (columns + rows,
  diagonals count 2). Problem: there's no time to read and work out a number right after a miss.
- Instead: show **one direction**. If the real node is to the left, the ICE node's **whole left side**
  turns into `<` marks (right side `>`, top `^`, bottom `v`). Readable at a glance.
- Open: which side when the real node is diagonal (e.g. up-left): the bigger of the two gaps,
  or pick one at random? Tie at equal gaps?
- **Level 2 TRACER** (or two TRACERs) shows **both** directions, e.g. left side `<` and top `^` for
  up-and-left. Possibly level 3 adds the distance back, or marks the exact row/column.

**Mods that level up / stack** (noted v07)
- What happens when you get the same mod twice? Today a mod you own is never offered again.
- Idea: owning a mod and getting it again **levels it up** (L1 to L2 to L3), each level a bit stronger.
  The badge shows the level (e.g. `oTRC2`, or a pip). Offers could show `TRACER +1`.
- Each mod needs a level plan. Examples: TRACER 1 side to 2 sides; SKIMMER +50% to +75%;
  SNIFFER 1 to 2 ICE locked; BURNER 1 to 2 uses per corp; BUFFER +1 again; COOLANT +3s to +5s.
- Some mods may not level (one-off effects); those stay "never offered twice".

**Tap-to-use mods need their own look + a spent state** (noted v07)
- Keep as is: SNIFFER, SKIMMER, BUFFER (passives, fine).
- Today: tap-to-use mods (BURNER, REROUTE, WORMHOLE) look exactly like passive mods while usable;
  they only go **dim** when they can't be used. Uses left are a bare digit on the label (`BRN1`,
  `RRT2`, `WRM1`), easy to miss. The info line says `>tap` / `(not now)` only after you select one.
  "Not usable *here*" (BURNER on the map) and "used up" (BURNER after its once-per-corp use)
  look the same.
- Want:
  - an **"activate" look** that marks a mod as tappable at a glance, distinct from passives
    (e.g. brackets or a highlight around the badge, a pulse when usable right now).
  - **charges shown clearly**, e.g. `BRN[1]` / `RRT[2]`, or pips `BRN ■` / `RRT ■■`.
  - a **spent / disabled state** distinct from "not now": e.g. `BRN[0]` dim with the brackets
    in red or crossed out, until it refills (BURNER refills each corp; REROUTE / WORMHOLE never).
  - "not now" (wrong screen) stays plain dim.
- Idea: **once-per-corp mods become an item** each corp (e.g. a `[BURN]` appears in the item belt
  when you enter a corp). Space: the belt is 4 slots (5 with STASH), 7 chars each, and 5 already uses
  35 of the 36 columns, so a 6th thing needs a second tray line (which shrinks the text a bit on
  phones). Options:
  1. it takes a belt slot (reads like an item; competes with real items; full-belt edge cases).
  2. its own slot outside the belt (`[PURGE] ... | {BRN}`), probably needs a second item line.
  3. (recommended) keep it in the mods row but draw tap-to-use mods **as buttons**: `[BRN]` bright
     when usable, red / crossed out when spent, plain dim when not now; charges inside (`[RRT 2]`).
     No belt or layout cost.

**Boss reward: a third option** (noted v08)
- Today CORP BREACHED offers 2: one of the corp's boss mods + one general mod (or skip +20cr).
- Add a **third slot, still random** (any general mod at any tier). If it rolls a mod you already
  own, taking it **upgrades** yours (see the upgrade rules below), shown as e.g. `TRACER +1`.

**Mod tiers: how finds and upgrades combine** (noted v08)
- Mods that have tiers (COMMON / RARE / EPIC, e.g. the minor mods) can be **found at any tier** in
  the wild: an EPIC COOLANT can drop even if you've never had COOLANT.
- If you **don't own it:** you get it at the tier you found.
- If you **own it** and find it again:
  - found tier **at or below** yours: it goes **up one step** (COMMON + COMMON = RARE, RARE + COMMON = EPIC).
  - found tier **above** yours: it **jumps to the found tier** (it replaces yours; COMMON + EPIC = EPIC).
- Each mod has a **max tier** (its limit). A maxed mod isn't offered again (or shows as maxed and
  can't be picked).
- Upgrading never takes a new mod slot (it's the same mod).

**New mod names / ideas from the user** (noted v10, 2026-10-21). Only the names so far; effects to work out.
- **WORM**: WORMHOLE is now the item WARP, so the WRM clash noted under VIRUS is gone.
- **LOGIC BOMB**
- **FORK BOMB**
- **ICE EATER**
- **A mod that swaps your item list for more mod slots**: no items while you have it, but more mods.
  Name to come.

**Tray limits, stacking and hot swap** (noted v07)
- **Mods get a limit.** A fixed number of mod slots (how many fits the mods row; badges are ~4-6
  chars, so roughly 5-6 on a 36-col line). Getting a mod you already own **upgrades it** (see
  "Mods that level up") instead of adding a second copy, so it never takes another slot.
- **Items stack.** Same items share **one belt slot** with a count: `[PURGE x3]` (or `PURGEx3`).
  Wanted regardless of the rest. **Counts are in hex, max `F` (15) per stack**, so it's always one
  digit: `x9`, then `xA` ... `xF`.
- **Hot swap when full.** If the mod slots (or the belt) are full and you take a new mod / item,
  you choose one to **swap out**: a small "replace which?" step on the offer / market screen
  showing your current ones; skipping keeps what you have. **Swapping gives nothing back.**
- Ties into the tap-to-use look above and option 3 (tap-to-use mods drawn as buttons in the mods row).

**Pool review** (noted v07)
- **REROUTE and WORMHOLE become items**, not mods. They're limited-use anyway (2 uses / 1 use),
  so they're really temporary mods. As items they'd sit in the belt (and stack, hex counts).
  Neither feels very useful yet; WORMHOLE may get better once the map has more variety (see §17
  map layouts / backtracking). Their tap-to-use mod handling then only matters for BURNER.
- **Minor pool (STASH, HAGGLE, CACHEKEY, COOLANT) is good but samey.** You see these a lot because
  they're the start perks, and they're a bit boring (COOLANT is the most useful). Want:
  - **More minor mods** in the pool.
  - **Minor mods with tiers that upgrade:** each one climbs COMMON to RARE to EPIC as you get it
    again (ties into "Mods that level up"), getting stronger each step, e.g. COOLANT +3s to +5s to
    +8s; HAGGLE -25% to -35% to -50%; STASH +1 to +2 slots; CACHEKEY double to triple loot.
  - **Higher-tier versions can also be found directly "in the wild"** (an EPIC COOLANT from a
    cache or the market), skipping the lower steps.
  - The rarity color/animation then shows how far a mod has been upgraded.

**Boss mod review + clearer mod text** (noted v07)
- Fine as is: CORNERS, BULWARK, FORGERY. **SIGSCAN is weak** (only pays off on SIGIL-heavy paths).
- **Bug: the codex shows only the first 2 lines of a mod's description** (wrapped at 34), so
  longer ones get cut off. OVERCLOCK loses "...cuts the pay 20%." Show all lines (the codex is
  full screen now, there's room).
- **Each mod gets an optional longer codex text** (`codex` field) next to the short tray `tip`
  and the offer `desc`, for the full details. Drafts:
  - **OVERCLOCK** tip `late clock purges ICE` (was `clock purges ICE.`). Codex: "adds a 15s clock
    to every corp layer (corps with a clock keep their own). at 6s, 4s and 2s left it purges one
    ICE node for you, up to 3 a layer. each purge cuts that layer's pay by 20%."
  - **FASTPAY** tip `speedy picks pay more` (was `fast picks pay x1.5`). Codex: "find the real node
    within 3 seconds and that layer pays x1.5. the 3 seconds start when the layer opens, and start
    over after each ICE you hit." (the reset after a miss is how it already works; not in today's text)

**MIRRORLINE boss mods** (noted v07)
- **AFTERIMAGE:** good, keep.
- **ECHO is weak and hard to describe.** Today: hit ICE, and the node in the same row, opposite
  column locks, but only if a node sits in that exact cell and it's ICE. With 2-6 nodes on 16
  cells that's rare (~1 in 5). Clearer text: "hit ICE: the node straight across the row locks too."
  Fix ideas: lock the nearest ICE on the opposite side, or replace it with FRACTURE (below).
- **Decided:** MIRRORLINE's boss mods become **AFTERIMAGE + SHATTER** (SHATTER replaces ECHO).
  - **SHATTER** `SHT` "ICE might shatter.": every ICE hit has a 1 in 3 chance to shatter harmlessly
    (no integrity lost; the node bursts into glass shards). Differs from BULWARK (first hit per
    corp, always) and FWALL (one-shot item). Upgrades: 25% to 33% to 50%.
- **In our pocket** (for a new corp's boss, or the general EPIC pool). Names don't need the glass
  theme; working names:
  - **FAILSAFE** `FSF` (was SAFETY GLASS; alts: ROLLBACK, DEADMAN, SAFEMODE): once per run, the hit
    that would kill you leaves you at 1 integrity instead; then the badge shows spent.
  - **VIRUS** `VRS` (was FRACTURE; alts: CASCADE, BOTNET, CONTAGION): hit ICE, and the infection
    spreads to one neighboring ICE node (up/down/left/right) and locks it. Avoid WORM (WRM is taken
    by WORMHOLE).

**Items: more of them, with rarity tiers** (noted v07)
- Current items (PATCH, PURGE, FWALL, SPLIT) are all good. Move **REROUTE** and **WORMHOLE** in from
  the mods (see Pool review).
- **Tiered items:** stronger versions at higher rarity, shown by the rarity color/animation like
  mods (label stays 7 chars, `[PATCH]`). Different tiers stack separately. Drafts:

  | Item | Common | Rare | Epic |
  |---|---|---|---|
  | PATCH | +1 integrity | +2 | +3 |
  | PURGE | lock 1 ICE | lock 2 | lock 3 |
  | FWALL | block next hit | block next 2 | block the rest of this corp |
  | SPLIT | rule out half | rule out 2/3 | leave just 2 nodes |

- **FWALL needs explaining.** How it works today: you use it like any item (works anywhere, even
  on the map); it raises a firewall shown as `FW1` in the HUD by INTEGRITY; the firewall absorbs
  the next ICE hit, whenever that is (it carries across layers and corps); using two stacks it
  (`FW2`). Nothing on screen says this; the tip is just "block next ICE hit." Better tip / codex
  text, e.g. "use any time: blocks the next ICE hit, whenever it comes."

**Already noted elsewhere that belong to this round** (see §17)
- Tell balance pass with `tools/tell_odds.js` (PERIMETER and MIRRORLINE too easy once learned; target ~x2).
- PERIMETER has no tier-2 twist; SIGIL tier 2 (X shape with random characters) is hard to read
  (try one repeated character per signed node); SIGIL tier 1 can show a "fake signature" when two
  unsigned nodes share a glyph by chance.
- Rarity doesn't affect offer odds today (all uniform); decide if it should.
- Filler corps vs signature corps; more unique final bosses; new corp ideas (CIPHER, HYDRA, BLACKOUT).


## 16k. Next update: endless map (planning list)

Collected for the next build: the map goes on forever. Pulled together from the user's notes
(2026-10-20) plus the related backlog items in §6, §9 and §17 (those stay where they are; this is
the working list). **Built in v08** (see 16j "Endless map round" for what was built and the
choices made while building). Kept as the record of the plan; open questions were marked **Q**.

**Today (v08), for reference:** the map has 6 steps: start `@`, 4 steps of 3 lanes (corps, `[$]`
`[?]` `[+]`), then OMNI//CORE at the top. You can go to any unlocked node. A corp is 4 layers
(3 + boss) with `tier + 1 ... tier + 4` nodes; tier 1 corps on steps 1-2, tier 2 on steps 3-4,
OMNI tier 3 (4-7 nodes). Beating OMNI ends the run with the win screen.

### The user's notes

- **Sectors.** The first map stays as it is today. Beating OMNI opens **another set** (sector 2),
  then another, with no end. One seed for the whole run; each sector is made from the seed + the
  sector number (§17 "Endless runs: sectors").
- **The overworld map scrolls, one sector at a time.** All sectors stay on one map you can look
  through, but scrolling snaps by sector so it isn't fiddly: one tick / click / key press (or a
  swipe) moves to the next or previous sector. The move is **animated line by line** (fast, but you
  can see it travel), not a jump cut, so it's clear which way the map went.
  - The current sector is the default view; coming back from a corp shows it again.
  - Probably a small `SECTOR 2 / 3` label and up/down hints (`^` `v`) when there's more map.
- **The fail screen (and maybe the win screen) shows the map, scrollable.** The fail screen already
  has a scrollable map of the current run (v07); it needs to cope with several sectors.
- **A "win" screen after each big section, where you can cash out your credits.** The push-your-luck
  at map level from §6 "jack out": bank and end the run, or push into the next sector.
  - **Decided:** cashing out gives **REP**. **Dying gives no REP.**
  - Good idea for later: a **REP unlock that lets a death keep some REP** (e.g. 25% of what you'd
    have banked), as one of THE BOARD's upgrades.
  - **Decided (try it):** the current OMNI win screen becomes the **sector clear** screen, with the
    fireworks kept for every sector clear, plus `[ CASH OUT ]` / `[ PUSH ON ]`.
- **Legacy abilities (keep-between-runs progression).** Needed now so cashing out means something.
  From §17 "Keep-between-runs progression":
  - Currency, leaning **REP** (others: ROOT, SALVAGE, SHARDS, LEGACY CODE, GHOST DATA).
  - **Now: earned only by cashing out** (dying gives none, unless the unlock above). From layers,
    corps breached, perfects, credits. Not from practice or abandoned runs. (The old §17 note said
    win or lose; this replaces it.)
  - Spent at a meta shop from the title, styled as an old hacker BBS ("THE BOARD").
  - Unlock ideas: +1 starting integrity, +1 item slot, an extra starting item, starting credits,
    mods added to the pool (locked until bought), palettes, seed replay, new corps, codex lore.
  - Related: §4 seeds (replays and typed seeds are practice and earn no REP); §17 "Clues as
    unlocks"; achievements / persona unlocks; corp palettes unlocking into settings.
- **Corps get one more layer:** 5 layers (4 + boss) instead of 4, so counts become
  `tier + 1 ... tier + 5`. OMNI goes up to 8 nodes, still inside the current grid.
  - **Decided:** PUBLIC NET is always the first stop of a run, 1 layer.
  - Re-run `tools/tell_odds.js` afterwards; payouts per corp go up about 25%, so check the market prices.
- **New mod: skip a layer on a perfect.** A chance that a perfect pick (first try) jumps you past
  the next layer. Working names: **SKIPJACK**, LEAPFROG, FASTTRACK, HOPPER.
  - Fits the tiered minor/general mods, e.g. 15% / 25% / 40% (COMMON / RARE / EPIC).
  - **Decided: it can skip the boss too.** If it triggers on the layer before the boss, the prompt
    gets an extra warning that you're skipping the final layer (e.g. `!! SKIP THE BOSS? !!`).
  - **Decided: skipping the boss gives no boss rewards**, but the corp still counts as breached. On
    OMNI you still get the sector clear and can **cash out**.
    - The reward screen still shows what you could have had, **greyed out**, with a line like
      `skipped: no rewards`, so the trade is clear.
    - The **SKIP button itself warns** when it's a boss (e.g. `[ SKIP BOSS: NO REWARD ]`).
    - The mod's **codex text** says so too ("can skip a boss, but you get no boss reward").
  - **Switch:** a constant (e.g. `SKIP_BOSS = true`) so bosses can be made unskippable in one place
    if it plays badly. Then the boss warning / greyed rewards just never show.
  - **Decided:** a skipped layer **adds depth, pays nothing**. A speed / safety mod, not money.
  - **Decided: the player chooses.** When it triggers, a small prompt asks whether to skip, e.g.
    `SKIPJACK READY   [ SKIP ]  [ PLAY ]` (needs a bit of new UI; keyboard + tap). Playing the
    layer keeps its pay and perfect chance, so it's a real choice: safety vs money/healing.
  - Pairs with the longer corps (more layers to skip) and with an endless run (less grind).

### Other things to sort out for an infinite map

- **Difficulty per sector.** What makes sector 3 harder than sector 2? Options from §17:
  - Node count keeps climbing (+1 node per sector, or the full "climbs every layer" idea).
  - Harder tell variants (tier 3+ tells), shorter clocks, ICE hitting harder.
  - New corps and node types appearing in later sectors (HYDRA, CIPHER, BLACKOUT, bad security,
    corrupted corp, filler corps), so each sector brings something new.
  - **Grid cap:** phones fit about 6 columns, so past ~16-20 nodes we need a plan (smaller tiles,
    taller grids that scroll, or a soft cap where difficulty comes from tells/ICE instead).
- **The end of each sector.** OMNI as the end of every sector, a remixed OMNI each time (it already
  borrows a random tell), or a pool of final bosses, one per sector (§17 "More final bosses").
- **Between sectors (the user's idea):** the next sector **starts at the beaten OMNI**. It takes the
  place PUBLIC NET has on the first map, and the new sector branches out from it. It doesn't have to
  go straight up: the new sector can branch off in any direction from the old boss.
  - Or put something valuable at the start of each new sector (a cache or a market), like §17's
    "the first node of a new sector is something good".
  - **Decided:** the map stays **3 columns** and sectors stack upward. "Any direction" means
    **sideways links**: connections from one column to the one beside it (left / right) within a
    step, not only upward (ties into §17 "More varied map layouts: sideways links").
- **Map layouts per sector.** Missing nodes, skip-lane links, sideways links, other shapes (§17
  "More varied map layouts"). Lets sectors look different. Frontier / backwards-travel ideas
  (§17 "Moving backwards") could come in here too, or later.
- **Power creep.** Endless runs hit the 6-mod cap, max-tier mods and full item stacks. Options:
  stronger sector rewards that change what you have (swaps, upgrades), corps that counter specific
  mods, or the cap is the point and the run gets harder until you die or cash out.
- **Healing over a long run.** Integrity only comes back from perfects, safehouses, PATCH and the
  market repair. Each sector probably needs a guaranteed heal spot.
- **Credits.** With endless runs, credits pile up. Options: market prices scale by sector, credits
  convert into REP on cash-out, or a credit sink (bigger items, rerolling offers).
- **Score and leaderboards.** "Layers" stays the main score; add sector reached
  (`S3  41 layers  4 mods`). Cashed-out vs died could show as a tag. Ties into §17 leaderboards
  (local first) and the NAKED tag.
- **Saving mid-run.** Long runs will need **resume**: save the run state to localStorage after each
  map node, with `[ CONTINUE ]` on the title. Today a reload loses the run. Seeds make this easier
  (seed + choices), but the simplest is to store the run object.
- **Music and palettes per sector.** Sector 2+ could shift the music (key/tempo up, an extra layer)
  or the map palette, so you can feel the progress. Ties into the corp-colored map icons (§17).
- **HUD / map info.** Show the sector in the HUD and on the map (`SECTOR 2`), and on the fail screen
  (`traced in SIGIL 3/5, sector 2`).
- **Codex and records.** Best sector, best layers, times cashed out. Per-corp records keep working.
- **Map scroll details.** Auto-scroll to keep `@` in view; the current sector framed; a mini "you
  are here" marker; keyboard up/down scroll like the fail screen; the map transition between
  sectors (e.g. the old map scrolls down and away, the new one rises in).
- **Multiplayer.** Today multiplayer races through layers, not the map. Endless sectors probably stay
  single player; check nothing shared breaks (the v06-v08 rooms share Firebase).
- **Dev menu.** `[ jump to sector N ]`, `[ +REP ]`, `[ reset legacy ]`, so it can be tested quickly.
- **Tools.** `tools/tell_odds.js` and the smoke bots need the 5-layer corps and multi-sector runs.

### Suggested order

1. Corps get 5 layers; the skip mod.
2. Sectors: OMNI opens sector 2; seed + sector map; sector in HUD/fail screen; scrolling map.
3. Sector clear screen with cash out; run save / resume.
4. REP + THE BOARD (a small first set of legacy unlocks).
5. Then difficulty per sector, layouts, new corps.



## 17. Ideas backlog

- **Corp logo on the boss intro** (the user, 2026-10-21). The boss entrance (`!! WARNING !!`, the corp name, its line) could show the corp's logo too. Logged, not built.

- **Stage boss rethink** (the user, 2026-10-20). **Built in v09** (2026-10-21, see §16l "Tier 3"):
  sector bosses after sector 1 are a third OMNI and otherwise a LV4-5 corp with a modifier, and
  OMNI copies a corp you beat in that sector. Left over from the idea: two modifiers stacked.

Not yet placed in a version.
- Trap types: damage, instant kill, alarm (raises a corp-wide trace meter), lockout
- Trace meter: misses raise alarm across a corp; at max, the boss arrives early or ICE hunts you
- Daily seed challenge
- Corp codex of learned tells
- Recon nodes / items that hint at a tell

- Hurtful clue nodes: like loot ICE, but they give a clue about the real node instead of loot
- Clues as unlocks: TRACER-style clue tools could also be meta unlocks
- Corp palettes (see §11)

- **Big ASCII art for player logos.** Each player logo keeps its short 3-character form (`<#>`, `{@}`) for tight spots (HUD, cursors, lists), but also gets a bigger ASCII illustration like the in-game corps' intro art (~5-7 rows). Used on the profile / runner card, the multiplayer lobby and results, maybe a short "player intro" when a multiplayer game starts or when it's your turn. More big logos could be achievement / REP unlocks.
- **Achievements + persona unlocks.** Achievements for things like a first win, a naked (0 mod) win, beating each corp, perfect streaks, reaching layer X, winning a multiplayer game. They unlock cosmetics for your persona / runner card: more logos, **hats** and accessories (ASCII bits above or beside the logo), card frames and colors, titles under your name ("SIGIL BREAKER"). Could tie into REP (buy some with REP, earn others only via achievements). Shown on the profile card and to other players in multiplayer.
  - **Easy ones too** (the user, meat notes 2026-10-25): things people trigger anyway: die on the first corp, spend 1000 credits, earn 1000 credits
    and then get back down to 0. Beating G0D is the top one (see REP ideas below).
- **Leaderboards / scores, front and center.** Show how you're doing right on the title screen, e.g. a small panel or line: `TODAY 07   ALL TIME 21`, plus a `[ SCORES ]` screen.
  - **Daily vs all time:** pairs with the daily seed idea; everyone plays the same seed today, so a daily board is fair.
  - **Local first (easy):** your own best today / this week / all time, and a top-10 list of your runs (seed, depth, corps, date) from saved history. Works offline in the browser.
  - **Online later (needs a server):** a real shared leaderboard needs a backend (e.g. a small hosted database, or Game Center / Google Play / Steam leaderboards if this becomes an app). Also needs some cheat-proofing: seeded runs help (a run can be replayed from its seed + moves to verify it).
  - **What's the score?** Layers stay the main score. Mods taken count *against* you as a sign of difficulty: a deep run with few or no mods should rank as impressive.
    - Every board entry shows depth **and** how many mods you took, e.g. `21 layers  3 mods`. Ties break in favor of fewer mods.
    - A **NAKED** tag (and maybe its own board) for runs with 0 mods.
    - Optional later: a combined score, e.g. layers x a bonus that shrinks with each mod, if a single number is needed.
  - Practice / cheated / abandoned runs never count.
- **Endless runs: sectors.** Today a run ends after OMNI//CORE. Instead, beating a map's final corp opens the next map ("sector 2", "sector 3", ...), and the run can go on indefinitely.
  - Each new sector introduces something new: new corps, new corp effects, harder tell variants, new node types.
  - The first node of a new sector is something good (market, safehouse, or a choice).
  - Clearing a sector ties into the legacy system: bank some REP / unlock legacy stuff (see below).
  - Seed: still one seed for the whole run; each sector's map is generated from the seed + sector number, so every sector is different.
- **Node count keeps climbing.** Today each corp resets (tier 1 layers start at 2 nodes, tier 2 at 3, the final corp at 4). Idea: node count keeps stacking across the run instead, +1 every layer (corp to corp, sector to sector), so difficulty grows naturally.
  - The grid already grows past 12 nodes (4x5, 5x5, ...), but phone screens cap out around 6 columns, so this needs a plan for very big grids (bigger rows, scrolling, smaller tiles) or a soft cap.
  - Opens up mods/items that change node count: e.g. remove a node from the next layer, freeze the count for a corp, "+1 node but double pay".
  - Balance: much harder without more healing/tools; tune together with REP unlocks.
- **More varied map layouts.** Today every map is the same grid (6 steps, 3 lanes, all nodes present); only the links change. Ideas:
  - Missing nodes (gaps in the grid).
  - Links that skip a lane (a diagonal two lanes over).
  - Sideways links within the same step (move left/right before going up).
  - Dead ends. Careful: you can only move forward, so a true dead end would end the run. Options: dead ends hold a big reward and then let you "jack out" (end the sector early) or warp back onto the map; or only allow them when a sideways link leads out.
  - Different lane counts or shapes per sector (wider, narrower, diamond).
- **Moving backwards on the map.** Today you can only go up. Allowing any link (back, sideways) would make the map a real network and makes dead ends work naturally (walk back out). Why maps are usually one-way: no farming of safehouses/caches/markets, route choices stay meaningful (taking one path means skipping another), and runs have a set length. Ways to keep that if backtracking is allowed:
  - **Spent nodes:** visited nodes give nothing a second time (beaten corps are cleared, markets close after one visit).
  - **Trace meter:** every move (or every move backwards) raises trace; at max something hunts you (an ICE ambush layer, integrity damage, or the final corp's clock starts).
  - **Move budget:** a set number of moves per sector.
  - Leaning: spent nodes + a trace meter.
  - **Refined idea (frontier):** no walking back step by step. Instead you can pick **any node linked to any node you've already visited** (the open frontier of the map). Visited nodes can't be activated again. Dead ends stop being a problem, since other branches stay open. Still needs a limit so you can't clear the whole map: a trace meter, or a set number of stops per sector (e.g. the final corp opens / forces itself after N stops).
  - **Or: allow clearing the whole map.** Corps are already risky (each costs integrity, you can die in any of them), so a full clear is a push-your-luck choice at map level. Risks to manage: it becoming the obvious move every run, power creep (more mods make the final corp too easy), longer runs (~13 stops vs 5). Balancing options: the final corp scales with what you took (more nodes / shorter clock per extra corp cleared), diminishing rewards later in a sector, or a special bonus for a full clear (extra REP, a rare mod). Leaning: allow it; corp risk + a final corp that scales does the balancing, no trace meter or stop limit needed.
- **Keep-between-runs progression** (like 1TD's souls + Altar of Souls; planned for v05). Nothing carries over between runs yet besides stats and the codex.
  - **Currency name** (not "souls"): ideas: **REP** (street reputation), **ROOT** points, **SALVAGE**, **SHARDS**, **LEGACY CODE**, **GHOST DATA**. Leaning REP: you earn rep by how deep you got.
  - **Earned** at the end of every run (win or lose): from layers cleared, corps breached, perfect picks, credits earned. Not from practice or abandoned runs.
  - **Spent at** a meta shop reached from the title. Fits the look: an old-school hacker **BBS** (bulletin board) screen, e.g. "THE BOARD".
  - **Unlock ideas:** +1 starting integrity, +1 item slot, start with an extra item, starting credits, add mods to the pool (like 1TD's locked relics), unlock palettes (ties into "palettes as unlockables"), seed replay, maybe new corps or the codex lore.
- **Corp idea: CIPHER** (working name; **built v11**, see §16n). Inside this corp everything is shown in a symbol "font", Wingdings-style: messages, HUD labels, node info, maybe even the tile glyphs turn into symbols. You have to play by shape and memory instead of reading.
  - Tech note: real Wingdings isn't available on the web/phones, so do it as our own substitution: each letter/character maps to a symbol (e.g. Unicode shapes like `◆ ▲ ☼ ♠ ⌘ ✦`, or a custom set). Same idea, works everywhere, and we control it.
  - Tell idea: the cipher is consistent, so the real node's glyph is always the same *symbol* even though you can't "read" it; or one line of the HUD stays readable as a hint.
  - Counter items/mods: a DECODER that translates for one layer, or a mod that keeps the HUD readable.
  - Boss twist: the cipher re-shuffles mid-layer, or after every miss.
- **Corp idea: bad security** (noted v07; working names: BUDGETWALL, LOWBID SECURITY, PASSWORD123 INC). A corp with laughably weak security. The nodes show **passwords** instead of glyphs. The real node's password on layer 1 is something like `12345`; each next layer it **changes just a little** (`1234!`, then `1235!`, then `12E5!`...), the way people "rotate" a password. Decoys show other passwords that changed a lot, or aren't related at all.
  - The tell: find the password that's one small edit away from the last real one (you saw it when you found the real node).
  - Fun, readable, a little funny: a good **filler corp** candidate (see "filler vs signature corps"). Pairs with KEYLOGGER-style ideas.
  - Harder versions / boss: decoys that are also near-misses (one edit away, but the wrong edit), or two characters change at once. Passwords fit the 5-wide node face (5 characters).
- **Corp idea: corrupted / rotting corp** (noted v07; working names: BITROT, LEGACY SYS, DEADLINK, ARCHIVE-9). An old corp whose data is busted. Mostly an **aesthetic** corp: nodes look glitchy and falling apart (frames with missing pieces, glyphs flickering to noise, characters dropping out), and they **drift / jitter around a little** (ties to the early "moving tiles" idea). Palette: faded, washed-out colors with bad-pixel accents; music: a detuned, wobbly (tape-warped) track.
  - Tell: open / not required. Light ideas if wanted: the real node is the **least corrupted** one (or the one that stays still), or the real node is the one whose glyph **holds steady** for a moment between glitches. Could also just use no tell (like CHRONOS) and be pure atmosphere, maybe as a filler corp.
  - Boss: corruption spreads each miss (more nodes glitch harder, or nodes swap places).
- **Corp idea: HYDRA** (working name; "cut one head off, another grows"; **built v11**, see §16n). Hitting an ICE node spawns a new node somewhere else on the grid, so your odds never improve just by guessing.
  - The skill part: spawned nodes are always ICE. If you keep track of which nodes appeared mid-layer, you can rule them out. Maybe a tiny tell on new nodes (they glitch in, or a frame detail differs) that gets subtler at higher tiers.
  - Boss twist: each hit spawns two, or spawned nodes look identical to the originals.
  - Could also work as a boss for another corp instead of a full corp.
  - Mod ideas around it: something that marks spawned nodes, or stops the first spawn per layer.
- **Tell balance pass** (noted v07). `tools/tell_odds.js` measures how much each corp's tell helps once known (first-pick odds, knowing vs blind) and ranks the corps; results in CONTENT.md "Difficulty ranking". Today PERIMETER and MIRRORLINE are too easy once learned (x2.3-3.5 over blind; MIRRORLINE's boss ~80% first try), SIGIL is about right (x1.4-2), CHRONOS has no tell (x1.0, the clock is its difficulty). Levers: lower `tellStrength` (0.75) for position tells, add decoys on target cells (PERIMETER: extra ICE on corners; MIRRORLINE: ICE beside the mirror cell), bosses that counter the tell instead of moving it, a tier-2 twist for PERIMETER (e.g. any edge cell). Goal: each corp around x2, re-run the tool to check.
- **Show corp difficulty in game** (noted v07). Use the tell-odds ranking to show how hard each corp is: e.g. a difficulty rating (`DIFF ###--`) on the codex CORPS page and/or the map node info, maybe a "hardest corps" list. Rank by the tool's numbers (rerun when tells change), possibly blended with real stats later (breach/loss rates from the codex records, or leaderboards).
- **More final bosses, each truly unique** (noted v07). OMNI//CORE is interesting because it's different every run (it borrows a tell), but it's the only final. Idea: a pool of big end bosses, one per run/sector (pairs well with endless sectors), each with its own mechanic, art, palette and music rather than a remix of corp tells. Seeds for ideas: a boss that changes the rules between layers, one that fights back (moves nodes, hides glyphs, eats items), one built around the clock, one that uses your own run against you (your mods, your last picks). Use `tools/tell_odds.js` to check each one lands in a "hard but learnable" band.
- **Corp tiers of difficulty: filler vs signature corps** (noted v07). Add a set of **easier filler corps** (simple, readable tells, low stakes) to pad maps and teach the basics, alongside the current corps as the main/signature ones, and the big bosses on top. The difficulty ranking (CONTENT.md) can place each corp: filler corps aim for a big tell advantage (easy once learned), signature corps around x2, bosses lower. Map generation could then place filler corps early (tier 1) and harder ones deeper.
- **Built v08:** **Overworld corp icons in their corp colors** (noted v08). On the map, draw each corp node (`[S]`, `[P]`, ...) in that corp's palette so you can tell them apart at a glance, e.g. the corp's background color behind the `[S]`. Needs a tweak because the map itself can be in any corp's palette: when a node's color is too close to the current map background, fall back (outline, inverted, or a nudged shade) so it still reads.
- **Persona: a randomize button** (noted v08). On the profile screen, one `[ RANDOMIZE ]` that rolls everything at once: name (from the 3 word lists), logo and color style.
- **[DEV] button: settled, no change** (noted v08). It's hidden by default and shows with `?dev=1`; the backtick key opens the menu and turns the button on until a refresh. The user is fine with that.
- **Minesweeper ideas** (noted v08). A mod where tripping an ICE also **deactivates any ICE close to it** (all neighbors, not just one). Note: VIRUS (EPIC) already locks **one** neighboring ICE on a hit, so this could be VIRUS's bigger version (a tier, or its own EXOTIC mod, e.g. CHAINLOCK / DETONATOR), or VIRUS could become tiered (1 / 2 / all neighbors). *(Claude)*: a minesweeper corp where hit ICE shows a **number**: how many steps away the real node is (or how many ICE touch it).
- **Corp idea: shell game** (noted v08; names *(Claude)*: SHELLGAME, THREE CARD, MONTE). The real node **moves** to another node without you seeing the switch. *(Claude)*: nodes shuffle positions in a quick animation (cups sliding) you can follow if you're sharp; or swaps happen unseen but leave a tell (a glyph line flickers on the two nodes that swapped); boss: more swaps, faster.
- **Corp idea: gambling** (noted v08; names *(Claude)*: HOUSE EDGE, LUCKY 7, CASINO.SYS). Ideas: **double down** on a node (bet that your pick is right: double pay if real, double damage if ICE), either as the corp's mechanic or as its boss mod. *(Claude)*: slot-machine glyphs (the real node shows three matching symbols); a "let it ride" choice after each layer.
- **Corp idea: punk** (the user, 2026-10-22; listed again 2026-10-23, details still to come from the user).
- **THE CHOIR as a "ministry", not a corp** (the user, 2026-10-22). The cult (THE CHOIR, LV3: faith x2 or tithe;
  boss mod SACRIFICE) would be a ministry. *(Claude)*: a name like THE MINISTRY or MINISTRY OF THE CHOIR (map code
  then MN / MC instead of CH), and its own words where the game says "corp" ("MINISTRY BREACHED", the codex line).
  Opens a door: other non-corps could get their own word too (a gang, an agency, a family: LA FAMIGLIA). That
  needs a per-corp label (e.g. `kind: 'ministry'`) the screens read, instead of "CORP" written in.
- **Corp idea: an arms dealer** (the user, 2026-10-22). A corp that sells weapons; it also runs gun ads
  ([ADS.md](ADS.md)). Close to it today: AEGIS DEFENSE, CARAPACE ARMOR, PREDATOR, DEMOLITION CO (none is a dealer;
  one could become one). *(Claude)* names: GUNMETAL, SURPLUS, ARSENAL, BRASS & SONS. Tell sketch: the nodes are
  crates with serial numbers / calibers, the real one matches a manifest on the hint line; boss: a sting (one
  decoy is a federal crate, hit it and it costs more). Mod: a sidearm-style one-shot (tap: lock 1 ICE, once a corp).
- **Lean more cyberpunk: cyberware** (the user, 2026-10-22). The game mentions almost no cyberpunk stuff (the theme
  was kept light on purpose, see the top). Ways to add it without changing play: the ads ([ADS.md](ADS.md), implant
  and chrome ads), mod / item names and flavor (*(Claude)*: some items as implants: an optic, a neural port, reflex
  boosters), corp intel lines, the codex, MEDIX as a chrome clinic, and the runner card (installed chrome as a stat).
- **Corp idea: a dating app** (the user, 2026-10-22; like Bumble or Match). Not designed yet. *(Claude)* sketches to
  react to: names SPARKD, KINDLR, SOULM8, LOVE.EXE. Nodes are profiles (a tiny face + 3 interests); the hint line is
  your profile, and the real node is your match (shares the most interests, or a compatibility %). Swipe-style
  picking (left / right instead of a tap?). Boss: a **catfish**, a decoy that copies the real profile with one thing
  off. Boss mod ideas: SUPERLIKE (one pick a layer can't hurt you), GHOSTED (hit ICE disappears from the board).
  Ad line in [ADS.md](ADS.md).
- **Multiplayer mode idea: roulette** (noted v08). A roulette-style mode for multiplayer (the user's idea was more a multiplayer mode than a corp). *(Claude)*: players place bets on nodes before the reveal; or a spinning cursor lands on a node and whoever's turn it is must take it or pay to respin.
- **Corp ideas batch** (noted v08, 2026-10-20). Suggestions marked *(Claude)* are mine, not the user's.
  - **BASIC** (working name; could literally be called BASIC). An easy, plain corp to sneak in
    anywhere: early sectors, filler slots, a breather between hard corps. Simple, readable tell (or a
    very strong one), low pay. Fits "filler vs signature corps" above. *(Claude)*: plain grey palette,
    a simple chiptune loop, boss = just one extra node.
  - **Medical corp** (names *(Claude)*: MEDIX, VITALIS, ST. CYBER). Its mods are about healing / integrity.
    - User's mod idea: **every corp you beat heals 1 integrity; if you're already full, it adds +1
      max integrity instead.**
    - *(Claude)* more: a mod that heals on perfects twice; a "triage" item; a corp twist where ICE
      only hurts on the 2nd hit (hits "bruise" first).
    - *(Claude)* tell idea: the real node has a heartbeat (its glyph pulses on a steady rhythm,
      decoys flicker irregularly).
  - **AI corp** (names *(Claude)*: SYNAPSE, NEURALINE, HAL-CORP). User isn't sure what it does yet.
    *(Claude)* ideas:
    - It **learns you**: it tracks where you tend to pick (corners, middle, the same column) and hides
      the real node away from your habits. The tell is reading yourself.
    - Or it **predicts**: after each miss it moves the real node away from where you looked last.
    - Or nodes "talk": each shows a short line (`NOT ME`, `TRY 4`), and the AI lies by a rule
      (always / never / every other) that you work out.
  - **GENCORP** (genetics). Mod idea: **MUTATE**: counts as a random other mod and **mutates** into a
    different one every layer, or every time you hit ICE. Shown in the tray as the mod it is right now
    (with a mutate glyph). *(Claude)*: the corp's twist could mutate glyphs between layers (the real
    node's glyph changes one line at a time, like the bad-security passwords).
  - **Military corp that hunts you** (names *(Claude)*: AEGIS, IRONCLAD, BLACKWATCH). Feel: nodes
    closing in. Following the cursor doesn't work on mobile. *(Claude)* ideas without a cursor:
    - The nodes **advance** toward one edge (or the HUD) a step every few seconds or every miss; if
      one "reaches" you, you take a hit. Like CHRONOS but spatial.
    - Nodes **flock** toward where you last tapped, so the grid reshapes after every miss.
    - A **search beam** sweeps the grid row by row; picking a node under the beam costs extra.
  - **Armadillo corp** (armored nodes; names *(Claude)*: SHELLCO, CARAPACE, ARMATEK). Nodes have
    **armor** you break first. Each break hurts you like ICE, but **when you take damage you get a hint
    about which node is the real one**. Trades integrity for information.
    - *(Claude)*: armor shown as a thicker frame (`#=====#`); hints could be the TRACER-style arrows or
      KEYLOGGER-style glyph lines; the real node could have thinner armor (cracks in 1 hit vs 2).
  - **Church / cult corp** (noted v09, 2026-10-20; names *(Claude)*: THE CHOIR, ASCENSION, SAINT.EXE,
    CHURCH OF THE NODE). *(Claude)* ideas:
    - **Faith**: tithe credits before a layer to get a "revelation" (a hint), or play on faith (no tell,
      bigger pay).
    - **Followers**: decoy ICE nodes "worship" the real one: their glyphs face or point toward it.
    - **Sacrifice**: give up integrity (or a mod) for a sure pick.
    - Look: candle / halo glyphs, a slow chant loop, the boss is the prophet.
  - **Random / chaos corp** (noted v09, 2026-10-20; names *(Claude)*: ENTROPY, FLUX, SCRAMBLE.NET).
    The nodes **change position**, either when an ICE breaks or on a timer (user's idea, not decided
    which). *(Claude)*: the real node keeps its tell through the shuffle, so you track it as it moves;
    the timer version could pair with a visible countdown; boss = shuffles on both. Overlaps with the
    shell game corp above (that one moves only the real node); could merge or keep them separate.

- **Corp ideas dump, v09** (noted 2026-10-20). The user says corps may be the **next area of focus**.
  Rough on purpose: some are one word. The user's idea comes first; *(Claude)* marks my additions.
  - **Sudoku / crossword corp.** *(Claude)*: nodes show digits, and the real node is the one that
    completes a row / column with no repeats (sudoku); or a tiny crossword clue in the intel line
    whose answer is on one node.
  - **Board game corp (a Parker Bros parody; names *(Claude)*: PAWN BROS, BOARDWALK INC, MONOPOLE).**
    *(Claude)*: a die roll each layer says how many spaces from a start node the real one is; boss is
    a little board loop you move around.
  - **Social media corp ("SQUALOR").** *(Claude)*: nodes show like / follower counts; the real node is
    the one with the "real" numbers (the bots all have the same count, or round numbers); ICE hits
    could "go viral" and spread like VIRUS but against you.
  - **Connect 4 corp.** *(Claude)*: nodes drop in from the top like chips; the real node is the one
    that would make 4 in a row; or picks fall to the bottom of their column.
  - **Word corp: the real nodes spell a word.** Each correct node carries a letter; across the 5
    layers the letters spell any 5-letter word. *(Claude)*: nodes show letters, so by layer 3-4 you
    can guess the word and read the next letter (`C R A _ _`); a word list sets it per corp; the boss
    is the last letter with decoys that also make real words.
  - **Chroma corp.** The colors of the nodes are the tell / pattern. *(Claude)*: the real node is the
    odd hue out, or follows a color sequence across layers (R, G, B...); needs a check for
    color-blind players (pair colors with a shape or a glyph).
  - **Yarn corp** (knit and purl). *(Claude)*: knit / purl as two glyphs (`v` and `-`) in a stitch
    pattern; the real node is the dropped stitch, the one that breaks the pattern. Names: PURLWISE,
    KNITWORK, SKEIN.
  - **Pink anime corp** (Japanese and fun, Sanrio-ish). Maybe really easy, and they actually **want**
    you to find the node. *(Claude)*: a breather corp with cute glyphs, the real node waves or blinks
    at you; hits do no damage but cost credits ("sorry!"); could fill the BASIC slot. Names:
    KAWAII.SYS, MOCHI MOCHI, PIKOPIKO.
  - **Seed corp.** Uses the current run seed as clues; maybe it also **changes the seed** mid-run.
    *(Claude)*: the seed's characters map to node positions (e.g. the 3rd letter of the seed is the
    column); changing the seed mid-run is doable (the map ahead is rebuilt from a new seed), but it
    needs care with saves / resumes and multiplayer sync.
  - **Destroy-the-ICE corp.** Reverse rules: you're meant to break the ICE, not find the node.
    *(Claude)*: clear all ICE without tapping the real node; tapping the real node is what hurts.
    Like minesweeper.
  - **Radiation corp.** Maybe gives a **nuke** that wipes a whole corp node off the map. *(Claude)*:
    a NUKE item (EXOTIC): skip a whole corp, no reward; the corp's twist could be radiation that
    builds up per layer and costs integrity at the end of the corp unless you're fast.
  - **Pet corp.** A corp with pets. *(Claude)*: a pet follows you as a mod-like companion (sniffs out
    1 ICE per corp); or the corp's nodes are pets and the real one is the one that comes when you
    call it. Overlaps with the "companion" idea, if there's one later.
  - **Linked nodes / double-size nodes corp.** *(Claude)*: linked pairs open together (pick one, both
    flip: helps or hurts); 2x nodes take two cells and are always ICE, or always hide the real one.
  - **Mod thief corp.** Hitting ICE steals one of your mods. Could be:
    - a boss ability, or a modifier for a whole stage of the map (all corps in it);
    - or a **corp modifier** that can be randomly mixed into any corp. We don't have that yet, but
      maybe we should. *(Claude)*: a new layer for corps, "**corp affixes**" (THIEF, ARMORED, FAST,
      CURSED...), rolled per corp node and shown on the map; gives variety without new corps.
      Stolen mods could be won back by beating the boss.
  - **Art / clothing corp.** *(Claude)*: fashion "seasons": the real node wears this season's
    pattern, decoys wear last season's; or art: the real node is the original, the rest are forgeries
    (a pixel off, see the next idea).
  - **Toy corp.** *(Claude)*: nodes are little toys (jack in the box, top, robot); the real one is
    wound up and moves. Could share a bright, playful look with the anime corp.
  - **Misalignment / OCD corp.** The tell is that some characters are **slightly misaligned**, by a
    pixel or two. *(Claude)*: easy to do in the canvas renderer (offset one character of the real
    node's glyph by 1-2px); gets subtler each layer; the boss misaligns the decoys too. Names:
    KERNING, OFFSET, PERFECTIONIST.
  - **Sport corp.** *(Claude)*: a ball moves around the grid and the real node is where it lands; or
    a scoreboard counts down layers like quarters; boss = overtime.

- **REP idea: mod storage / stash** (noted v09, 2026-10-20). Keep mods you have for a later run.
  - A **LEGACY unlock** on THE BOARD (bought with REP) before you can use it.
  - **Rent**: storing costs something per run (REP or credits), so it isn't free power.
  - You can only **store** at the sector boss (after OMNI) or at a **ripper doc** (a new map stop).
  - Getting them back: either **start a run with them**, or a **new map location** shows up where
    you can pick them up.
  - *(Claude)*: cap it at 1-2 stored mods; stored mods could lose a tier (or go back to COMMON) so
    they help without skipping the build; name ideas: LOCKER, COLD STORAGE, DEAD DROP. A ripper doc
    could also be where you remove or reorder mods. Note: the minor mod is already called STASH,
    so this needs another name.
- **Corps: see [CORPS.md](CORPS.md)** (updated 2026-10-20). It holds the user's corps (Part A, the
  ones above written up with a special / tell / mod) and Claude's revised 50 (Part B). New ideas
  from the review, to keep in mind:
  - **Mods cross over:** a mod built for one corp (SIGSCAN, the clock mods, CORNERS, FORGERY)
    should also matter in some other corps. Every corp in CORPS.md has a "works with" line, and
    HAUTE//COUTURE is a corp built around the Sigil mods.
  - **Corp modifiers:** tags rolled onto any corp node, shown on the map, more common deeper:
    RIVAL (a rival hacker with health who burns ICE or steals your pay), THIEF (the mod thief),
    ARMORED, CURSED, RUSH, LOADED, BRANDED (adds Sigil signatures so SIGSCAN works there).
  - **One-use effects are items, not mods** (user's rule), unless the mod survives use. E.g. BITFLIP
    became an EXOTIC item.
  - Mods pool: EVENT HORIZON (BOARD: a hit locks the nearest closed ICE).
  - **Corp levels** (user, 2026-10-20). Every corp gets a level (1-5) on top of the node tier we
    already have. Deeper on the map, higher-level corps get picked more often (weighted around a
    target level of sector + 1 or 2). First-pass levels and the weights are in CORPS.md, under
    "Corp levels". Part of the corp kit build.
  - **Build plan:** CORPS.md "Build plan" groups every corp by how hard it is to build (step 0 corp
    kit, then tiers 1-3).
- **Mod idea: puzzle on ICE** (noted v09, 2026-10-20; probably EXOTIC). Tap an ICE node and instead
  of hurting you it opens a small **mini-game puzzle**. Solve it and you take no damage; fail and
  you take the hit (maybe more). Stage: BLOCK. *(Claude)*:
  - Puzzle seeds: a quick lock-pick (stop a moving bar in a zone), a 3-symbol sequence to repeat
    (Simon), match the glyph (pick the node's glyph from 3), a 4-tile slide, a hex code to type back.
  - Keep each one 5-10 seconds and on the clock (the layer clock pauses while it's up).
  - Tiers: easier puzzles, or a fail only does half damage.
  - Could be its own corp too (every ICE hit is a puzzle).
- **More EXOTIC mods and items** (noted v08). EXOTIC is nearly empty: WORMHOLE is the only exotic, and it's moving to items (see §16i). Exotics should feel strange and rule-bending, not just bigger numbers. Seeds:
  - **QUANTUM** (mod): two nodes are real each layer (either one passes), but layers pay half.
  - **GHOST** (mod): one random ICE node per layer shows as see-through (faint frame) from the start.
  - **PARADOX** (item): undo your last ICE hit (integrity back, node closes again).
  - **ENTANGLE** (item): link two nodes; if either is real, both open.
  - Exotic tiers of existing items (e.g. an EXOTIC SPLIT that leaves only the real node and one ICE).
  - **The user's exotic batch** (2026-10-21; probably all mods). Names marked *(Claude)* are my working names.
    - **All or nothing** *(Claude: DOUBLE OR NOTHING, ROULETTE)*: a chance to clear the whole layer at once,
      but also a chance it adds ICE to the layer instead.
    - **Coin flip** *(Claude: COINFLIP, 50/50)*: every tap becomes a 50/50. Tap a node and a small window opens
      with 2 options; pick one. Maybe double damage on a wrong answer. Open question: does the window pause
      the clock and animations? Maybe not, so the clock keeps pressure on.
    - **More real nodes**: more valid nodes each layer (maybe limited, e.g. one corp only). Close to QUANTUM
      above.
    - **ICE that comes with you** (time travel or procrastination theme; *(Claude: LATER, BACKLOG, DEJA VU)*):
      a 50% chance that ICE you trigger carries over and adds to the next layer's ICE count. It doesn't
      need to land in the same spot, but it would be cool if it did, and if carried ICE looked a little
      different.
    - **OMNI reveal** *(Claude: MIMIC, TELLTALE)*: tells you which corp OMNI is copying. (CORPS.md's SPOILER
      prints a corp's tell on entry, which covers OMNI too; this would be the narrower version.)
    - **Remove a corp from the run** (more an item): take a corp out of the playthrough entirely. Different
      from HALFLIFE's NUKE (CORPS.md A21: wipe a corp node off the map, get past it with no reward).
      - **Hidden quest line:** a nuked or removed corp's node stays on the map, and going there has
        something special: maybe the start of a strange hidden quest line.
      - **Another hidden-quest entrance: a secret ad** (the user, 2026-10-22). Most fake ads do nothing when
        tapped, but one particular ad does something special, or a certain ad + a certain mod you own does
        (e.g. an extra EXOTIC mod). Details in [ADS.md](ADS.md) "Secret ads". Could be how the nuke quest starts.
- **Tutorial mode** (noted v08). A guided first run (or a separate `[ TUTORIAL ]` on the title) that teaches by playing instead of reading How to Play. Ideas:
  - A short scripted run on a fixed seed: the PUBLIC NET (one node, it's real), a tiny corp with an obvious tell, a $ node, a stop (cache / market), using an item, a boss.
  - Short prompts typed into the message line or a small box ("one of these is real. tap one."), pointing at things (the tray, a mod, the clock).
  - Explain a tell by showing it: highlight the corners after a PERIMETER layer, show the mirror line for MIRRORLINE.
  - Can't lose (or ICE does no damage) until the end; skippable; offered once on first launch.
  - Pairs with the "filler corps" idea (easy corps that teach) and could unlock the codex corps entries it covers.
- **More palettes.** Keep the current 5; add more, with more variety.
- **Corp palettes.** Each corp gets its own palette, so you know where you are at a glance.
- **Two palette lists: dev vs settings, corp palettes as unlocks.** (noted v07)
  - **Dev menu palette select stays** (moved to the 16f pending list, 2026-10-21), but it cycles **every** palette: the player ones plus all the corp palettes (PERIMETER, SIGIL, CHRONOS, MIRRORLINE, OMNI, and future corps), for previewing / tuning. *Today both the dev menu and SETTINGS cycle the same list (player palettes only; corp palettes are hidden from both).*
  - **SETTINGS palette list is the player list only:** it does *not* include the corp palettes by default.
  - **Corp palettes unlock into SETTINGS** through corp achievements, e.g. breach a corp (or beat its boss N times / perfect it) to unlock its palette as a player palette. Could also be a REP purchase (see REP meta progression).
  - **Every corp gets its own unique palette**, including future corps (CIPHER, HYDRA, BLACKOUT, ...), and maybe more than one per corp (an alt palette unlocked by a harder achievement).
- **Palette change animation.** When the palette switches (entering a corp with its own palette), animate it. Options:
  - Ripple: a wave spreads out from the tapped node; characters switch to the new colors as it passes, with a little scramble right at the wave's edge
  - Scanline wipe: a line sweeps top to bottom, recoloring as it goes (old-CRT feel)
  - Glitch: characters flip to the new colors at random times over ~0.5s
  - When: maybe a subtle preview on **select** (the info panel or node takes the corp's colors), then the full transition on **enter**. Pairs well with the existing suck-into-the-node effect.
- **Palette as a corp effect.** Example corp, working name **BLACKOUT** (**built v11**, see §16n): the palette gets darker every layer, fading toward black, making the board harder to read. Wrong tiles you hit stay **bright red**, so your mistakes become the only clear landmarks. Ideas around it:
  - Boss twist: starts nearly black, or only the tile under your finger/cursor lights up
  - Counter items/mods: FLARE (resets brightness for one layer), something that makes hit tiles light up their neighbors
  - Tech note: easy to build, since all colors come from one table. Blend every color toward black each layer, except red.
- **Juice / graphics pass** (later): the ASCII look and badge animations work, but the game needs more graphical bits. Options to try:
  - Unicode symbols that still take palette colors: block shading `░▒▓█`, geometric shapes `◆ ◇ ▲ ● ◉`, braille dots for smooth spinners and tiny pictures `⠋⠙⠹⠸⠼⠴⠦⠧`
  - ASCII emoticons / kaomoji for flavor, e.g. `(⌐■_■)` `[o_o]` `x_x`
  - Real emoji: most colorful, but they ignore the palette (can't be recolored) and look different on each device, so they'd clash with the console look. Use sparingly if at all.
  - Bigger mini-art (3–5 lines) for mods in reward/market details boxes, while the tray keeps the small badges
- **A spooky corp** (noted 2026-10-20; **built v10 as BONEYARD**, see §16m). Working names: BONEYARD, OSSUARY, SPOOKY INC. Pulls from the "the bones are their money" sketch, and works in the quote **"the guy asked for something spooky"** (as the intel line, the intro, or a line on the CORP BREACHED screen).
  - **Tell idea:** every node casts a faint shadow (a dim copy one cell off) except the real one: "the dead cast no shadow." Or the reverse, where only the real node has a ghostly afterimage.
  - **Bones are their money:** credits show as bones while you're inside (`12 bones`). $ nodes become bone piles. Hitting ICE could rattle (a skeleton clack sound).
  - **Boss twist:** the ghost moves. One ICE node drifts to a new spot when you aren't looking, either after each tap or on a timer.
  - **Boss mod seed:** something like GRAVE ROBBER, where each ICE hit drops a bone you can cash in at the end.
  - **Look and feel:** a sickly green and purple palette, a minor or harmonic theme with an organ-like pad, and a skull for the intro art.
- **NeoN+m: co-op** (the user, meat notes 2026-10-25). A co-op multiplayer mode, like Keep Talking and Nobody Explodes: one player hacks, the
  others hold the information. Maybe you need to be in the same room, like Spaceteam.
- **Encrypted codex** (the user, meat notes 2026-10-25). Most codex entries aren't "???" but scrambled, encrypted-looking text that decrypts over
  time as you beat corps, so the codex has content to scroll from the start. Maybe decryption isn't tied to corps, so
  you can unscramble things you haven't seen yet.
- **Hackers** (the user, 2026-10-25): ICE MAN is one of the adversary hackers you go up against, and hitting ICE could
  call an enemy hacker into your corp (part of the enemy hacker stage / corp event). Filed with RIVAL in CORPS.md
  ("Corp modifiers" > RIVAL).
- **REP ideas** (the user, meat notes 2026-10-25):
  - Levels of unlocks.
  - A booster that picks corps you haven't beaten more often.
  - Unlocking all corps (or the whole codex) unlocks new REP options.
  - **Unlock mods into the starter pool:** choose 3 mods; one of them has a chance to show up at the start.
  - **Nemesis:** mark a corp as your nemesis and it shows up more often.
  - **Beat G0D** is the top achievement: first unlock G0D through REP rewards, then a quest to defeat it.
- **Quests and story** (the user, meat notes 2026-10-25):
  - **Start with just one quest.**
  - Get through the first OMNI stage with fewer mods (no mods, or nothing above epic).
  - Carry a worthless scrap mod through 3 stages (see the scrap mods in the mod notes).
  - "You thought this was a game": a REP unlock that changes the game, e.g. unlocks quests.
  - **The call:** someone calls; you choose whether to answer. They might give you a quest (go raid this corp), or
    just offer you something. Maybe a whole meta quest line that continues across runs.
  - The call as an item: call them to heal you or to take you to a totally different level; random, or expensive.
    (PATCH already heals, so it should do something more than that.)
  - Other things a call could do: soften the stage / corp events, or cancel them.
  - An emoji (like INFLUENCER's) could have a special purpose in a quest.
  - Hidden quests in ads are in ADS.md ("Secret ads").
  - **More quests** (the user, meat notes 2026-10-26): sometimes a call from an AI. **The first quest to make: defeat d0g.** A quest gives you a
    seed; entering that seed unlocks god (H3AV3N). **Break a fellow hacker out of a corp:** one spot on the map is that
    corp; get to it and beat it to break them out (maybe offered after you beat a stage, so the next stage is set up
    around that corp or something hard on the way); you unlock the meta thing; you don't have to accept it.
  - **The feel: FTL's quests and interactions.** Keep that in mind when we brainstorm more together.
- **Music: the engine pass, fewer / better tracks, inspirations: all in [MUSIC.md](MUSIC.md)** (moved there
  2026-10-24, with everything else about the music).
- **A NeoN+1 tool suite** (the user, 2026-10-24, meat notes): put asXii, the palette editor and any other tools
  together as a tool suite for the game. Maybe add a **music preview tool** there, so the music player isn't all
  inside the game; music is the one thing that seems better out of the game (see MUSIC.md).

- **Pushing past the 4x4 grid** (the user, 2026-10-21; "at some point"). What does it mean to go bigger,
  even double the grid (e.g. 8x8)? How it scales on screen (tile size, phones, scrolling), in odds and
  pacing, and in tells and mods (row/column scans, PERIMETER, mirror tells). Ties to "Node count keeps
  climbing" above and the tap-size limit in §12.
- **Fake ads** (the user, 2026-10-21). Parody ads in the game. **The idea list is [ADS.md](ADS.md)** (since 2026-10-22). Ideas so far:
  - **Interstitial ads** between parts of a run: after a boss, or on the way into a safehouse or black market.
  - **Ads for the game's own corps.**
  - Maybe a **corp built around ads** (pop-ups, banners over the board).

- **Publishing: link previews and page metadata** (the user, 2026-10-21). For when the game goes public, so
  link previews (Discord, iMessage, Slack, X...) and crawlers pick it up:
  - Meta tags: description, Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) and
    `twitter:card` (`summary_large_image`).
  - A **poster image** for previews (~1200x630 PNG, the ASCII title look), plus a favicon / home-screen icon
    (`apple-touch-icon`) and a `theme-color`.
  - The page has `<meta name="robots" content="noindex, nofollow">` today: drop it for the public build.
  - Previews need absolute URLs, so this goes with picking where it's hosted (§10 Tech / hosting).

- **Browser back button works as BACK** (the user, 2026-10-21; "might be opening a can of worms"). On a
  menu page (settings, codex, how to play, profile, multiplayer...), the browser / phone back button (and
  Android's back gesture) should do what `[ BACK ]` does, instead of leaving the page. Today the game never
  touches browser history, so back leaves the game. The worms:
  - Push a history entry when a menu opens and catch `popstate` to go back; keep it in step with the game's
    own BACK and ESC, or the history fills with stale entries.
  - During a run, back should never quietly drop you out: pause, or ask "abandon run?" (the run save helps).
  - Multiplayer: back in a lobby or game should ask before leaving the room.
  - The title is the bottom: back from there leaves the page as normal. Keep the URL clean (`?seed`,
    `?dev`, a future `?room`) while doing this.
  - iOS Safari's swipe-back is the same event, so it gets covered too.

- **"New version" notice for the game** (the user, 2026-10-23; built first in asXii v0.25, see `ascii-editor/PLAN.md`).
  `tools/bump.js` would also write a `dist/version.json`; the running game checks it (on load, when you come back to the
  tab, every ~10 min, never from cache) and, if a newer build was uploaded, shows a small "NeoN+1 v13.10 is out ·
  REFRESH" notice. Careful mid-run: offer it on the map / menus, not in the middle of a layer (the save carries over). 2026-10-24 (the user, again): a small version file like asXii's, but the notice gets its own neon look (not asXii's), and maybe shows **only on the title screen or the death screen**.

