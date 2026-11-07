# NeoN+1 backlog

The one list of open work: features to build, and ideas waiting their turn. Nothing here is built.
When something gets built, take it off this list and log it in SPEC.md's version log (§16n).
New ideas and "n:" notes go here. Details live in the docs each item points to.

- Things for the user to look at or test: `docs/REVIEW.md`.
- This list before the 2026-11-07 cleanup, with the built items and their design history:
  `docs/archive/BACKLOG_2026-11-07.md`. The older planning lists: `docs/archive/SPEC_backlog_2026-10.md`.

Cleaned up 2026-11-07: built items taken out (the SPEC version log has them), open leftovers kept.

## Big features: the next layer of the game

The user, 2026-10-26: these are the features still to flesh out. REP and quests tie together: some quests are
unlocked by REP, and some quests unlock REP.

### 1. Gear and scrap mods
**Greg, 2026-11-07:** "we are pretty good on gear for now."
- **A gear top-up mod** (the user, 2026-10-30): at the start of every corp, if you have any gear it gives you one more;
  or, if you only have one of a gear item, another. At least legendary: a boss reward, or exotic as its own find.
  (RELOAD, legendary, is built: singles get a second each corp. Still open: **PACK RAT**, exotic: mod row = gear
  slots, rewards = gear, every stack +1 each corp; docs/EXOTICS.md, "All items".)
- **Going back a row** on the map is a can of worms: save it for an exotic mod (the user thinks it could be good).
- More map gear ideas (Claude): SCOUT (see the corps / anomalies ahead).
- Exotic gear: only NUKE. Ideas: PARADOX / ENTANGLE / BITFLIP (below).
- **Codex hints for the gear reactions** (not written yet): GRAVITAS (TILT = a free gravity drop), ENTROPY (SHAKE
  sets off its shuffle). Could go in each corp's codex entry.
- **BOX OF WIRES** (built v14.53). Open: the carry-a-scrap-mod challenge quest (section 3).
- **More corp mods -> gear?** (the user, 2026-10-27): only the tap-to-use ones moved (v13.62). Others that could: none
  picked yet.
- **Gear ideas (the user, 2026-10-27):**
  - **SHORT** (short circuit): fries 2 ICE that sit next to each other. (BLAST is an aimed 2x2, so SHORT is close to a
    small BLAST. Keep it only if it gets its own twist.)
  - **Call a market:** gear that opens a black market right where you are (maybe a smaller one). Goes with **ads you
    can buy from**.
  - **CHECKPOINT** (exotic): use it in a corp; if you die in that corp, you start over at its first layer. Variations:
    pay credits to come back; or come back with no mods or gear. A weaker, one-shot cousin of CONTINUE.
  - **Gear names to use:** CHMOD, POKE, JUMP (no effects yet).
- **THE WORKBENCH, what's still open** (built v14.12-v14.15; the whole design talk is in the archive):
  - Keyboard design tweaks and the line over it (the user: not sure yet). The look: off-white / beige Commodore
    colors (the user: leaning, just a note).
  - **DIVINE** red letters (from G0D); blueprints; wildcards (*) from fishing; a use for digits in mods. Letter
    counts: no recipe uses I; digits 1-9 none; J, Q once.
  - What a letter's rarity means once you craft with it (Greg, 2026-11-05: keep each letter's rarity, so the keyboard
    can show the colours).
  - How safehouse gear works (install anything? swap?). Leaning: you can't swap out an equipped mod; maybe you can
    only shred it, or unequip it.
  - Corrupted software (JUNK.DAT...): fishing them up at the PIER.
  - **Sounds:** a failed craft (the components burning), a sound pass on the whole bench (keys, slots, tabs, the
    locker, take / store), better key-press sounds.
- **Scrap mods:** maybe 2 other worthless ones.
- **Gear to concept:** more gear with bonuses, even if it's only worth selling (SHARD and BOND are the first).
  Logged: PARADOX (undo your last ICE hit), ENTANGLE (link two nodes), DECODER (read CIPHER for a layer), exotic tiers
  of today's gear. EXOTICS.md has more.

### 2. REP and THE BOARD
- **The plan: `docs/PROGRESSION.md`** (2026-10-28, screen mockups on a page). Much of it is built (THE BOARD, feats,
  crew, CALL gear); its 4 small questions are still open.
- **Today:** a run's REP = depth + 3 per corp + 1 per perfect + 1 per 40cr earned + 10 per sector cleared (`repFor`,
  engine/save.js). Cashing out banks it; dying banks nothing (DEADMAN keeps 25% / 50%).
- **Ideas logged:**
  - Levels of unlocks; finishing the codex (or beating every corp) opens new options. For the codex one: THE
    ARCHIVE (start with any mod you've found), ARCHIVIST (every corp's tell printed), an exotic pick, a cosmetic.
  - Mod storage between runs (LOCKER exists: cash out, keep 1 mod a step lower): rent per run, 1-2 mods.
  - A booster that picks corps you haven't beaten more often. A **nemesis**: mark a corp and it shows up more.
  - Unlock mods into the starter pool (choose 3; one may show up at the start).
  - **Palettes unlock** by beating their corp (not built: SETTINGS offers every palette today). Big logos as unlocks.
  - Difficulty levels unlocked with REP that add drains (money or mods taken away) and pay more REP.
  - **Feat ideas:** replay a seed and get further than before; call 2 hackers in the same layer; sell 30 PHISH; catch
    a biiiig PHISH; buy a mod back from the fence (and maybe a REP unlock: fence prices -10%). The FEAT box over the
    win page: a solid background that isn't the screen's (the REP color?).
  - **REP unlocks you can switch on and off** (the user, meat notes 2026-10-29), e.g. +1 to the default corp layer count.
  - **Skip a corp's rewards for a heal** (meat notes 2026-11-06): an option, maybe a choice on the screen, maybe a REP unlock.

### 3. Quests and RPG elements
- **More than one quest at a time** (a quest log: a list that scrolls, the active quests, then the completed ones).
  **Decided (Greg, 2026-11-06):** wait until there's a second quest (probably the first crew quest). Until then,
  anything added to SYSTEM FAILURE shouldn't assume it's the only one.
- **The mold, more of it:** a short side quest that touches on it (the user's idea; held for now). Also: **MOLD as a
  sector event** (2026-10-30): once unlocked, it can come up as a random event in regular runs too.
- **Crew quests** (the user, 2026-11-04: a quest per crew member, some hidden): ideas in `docs/CREW_QUESTS.md` (each
  built on the crew member's counter-rival; ROOT and BRICK's unlock a crew member). To pick from.
- **Break a fellow hacker out of a corp:** one spot on the map is that corp; maybe offered after a stage, with the next
  stage built around it; you can turn it down; beating it unlocks the meta thing.
- **The call as an item** (expensive or random): more than a heal, e.g. a different level, or softening / cancelling
  the corp events.
- **Challenge quests:** the first OMNI stage with few mods (none, or nothing above epic); carry a worthless scrap mod
  through 3 stages (BOX OF WIRES fits).
- "You thought this was a game": a REP unlock that changes the game (unlocks quests).
- **Quest items (the user, 2026-10-26):** MOUSE (an old ball mouse) and MUG (a cold coffee mug off a sysadmin's desk).
  **FLOPPY** (2026-10-27): a floppy disk gear you insert in a terminal somewhere to start a quest.
- **Hidden entrances:** a nuked / removed corp's node stays on the map and leads somewhere strange; a secret ad (or an
  ad + a mod you own) starts something (ADS.md "Secret ads"); ads you can buy from (a puppy for a quest); an emoji
  with a quest purpose.
- **The feel: FTL's quests and interactions.** Brainstorm together. **Random encounters, FTL style** (meat notes
  2026-11-06): you choose from 2 or 3 options, and you might get a reward.
- **Cutscene art:** random traces running up that aren't in the drawings; more color work; more art for the later
  frames maybe. **Cutscene music:** EVENT HORIZON as a possible lighter cutscene track.
- **A hint on the quests tab** (meat notes 2026-11-03): when it's empty, something like "no quests yet. put a crew
  together and maybe you will discover some" / "get to know the other hackers, call them".
- **More quests** (the user, meat notes 2026-10-28):
  - **The symbol path:** you find a symbol that is a path through a network (a very simple treasure map). Go through a
    sector that way and you get a bonus, or the final node turns into a special boss. Needs a special sector map, e.g.:
    `.-.-X` / ` \.-.` / `   /` / `  .`
  - **POPS's old corp:** a quest that unlocks when you call POPS in the corp he used to work for.
  - **Safehouses need something cooler** (meat notes 2026-10-29): they keep some mods from a run you died in, or offer
    crew CALL gear. Probably a REP unlock. Or simpler: a boosted safehouse, 2 INT and an item or two.
  - **The quest object sparkles** (meat notes 2026-10-29): a twinkle / glitter effect on it.
- **G0D:**
  - **G0D as an acronym** (meat notes 2026-11-07): the name should stand for something, a hacker reference with a G
    (the 0 can read as zero, nil or o) that hints at where G0D came from. Greg's ideas: gibson zero day, gibson 0
    defense, g omnipotent device.
  - **The mold turned up as the quest goes on** (today: the M0LD events set it, v14.39).
  - **G0D flashing in on SECTOR CLEARED** now and then (meat notes 2026-10-29).
  - **G0D.exe** (the user, meat notes 2026-11-03): a personal AI hacker assistant, exotic gear. After you beat G0D, a
    quest to reassemble it: find the G, the 0 and the D, then put G0D together at a workshop. It knows the tells of
    every corp you've beaten more than ~5 times (feat unlocks). Activated, it plays perfectly: it knows the real nodes
    (not just tells) and clicks them for you. It stays with you from corp to corp, uses gear, goes to stores and buys,
    moves through the network, and goes for depth; it won't buy many mods unless they boost credits (for the UPLINKs).
    Maybe a limit of 256 clicks; if so it tries to get another of itself to activate; it can call crew too. (Same idea
    as "An AI crew member that plays the game" in Low priority: G0D.exe may be that one.)

### 4. The end game (details: docs/ENDGAME.md)
- **The ending's leftovers:** the art (placeholders to redraw); the three unlocks as already-paid posts on THE BOARD.
- **KITCHEN and ZER0** (the terminal's log in the ending) are only art today. Hide a seed or two in there that are
  real special seeds (the gauntlet, below, or fun made-up ones). **Decided (Greg, 2026-11-06):** not now; later.
- **An end game quest: from a hacking game to a hacker game** (Greg, 2026-11-06: "this and rebuilding god as a ai
  assistant i think would be interesting and take it up a notch"). After G0D, a quest that reaches outside the game:
  the PSYCHO MANTIS boss (section 7: go offline, a hidden word in the URL / tab title / console) and rebuilding G0D as
  your AI assistant (G0D.exe, section 3). Claude's thoughts, to talk through: the G, the 0 and the D (G0D.exe's pieces)
  could each be hidden that way (one in the page's URL, one in the console, one only while you're offline), and MANTIS
  guards the last one. Section 10 ("make it more of a hacking game") fits here too.
- **More boss seeds** (Greg, 2026-11-06: "i really like how the god boss turned out"; "all worth keeping around", he's
  thinking on them). Not a long quest like SYSTEM FAILURE: find a seed somewhere, two sectors of buildup, then a boss
  (like H3AV3N). Do the "per-seed definitions" cleanup (Medium and small) with the first one. Claude's ideas:
  - **TWIN:** it can only watch one window. Open the game in a second tab and hit it from behind. Hint: "i can only
    watch one of you." (The two-tab save guard it needed is built, v14.52.)
    - **How tabs talk (2026-11-07):** neither tab launches the other. Any tabs of the game in the same browser hear
      each other on a `BroadcastChannel` (engine/save.js TABS uses one). Not across browsers or a normal and a private
      window; across devices it's Firebase (multiplayer has it): a TWIN where your phone is the second window. A
      hidden tab barely runs (desktop timers ~1/s, no drawing; iOS freezes it), so each tab acts while you look at it
      and the shared state lives in the save. `window.open` isn't needed (phones block pop-ups without a tap).
      file://: Chrome lets local tabs talk, Firefox doesn't; test it.
    - **The fight:** desktop: two windows side by side, it faces the focused one, you strike from the other. Phone:
      switch tabs; the page knows you left (page visibility, SLEEPER's signal), it turns to the tab you're in, and the
      other one gets a few seconds' opening.
  - **PHREAK:** a phone phreak. It talks in keypad tones; you play them back (the Simon corp's idea). Weird-hard: it
    wants 2600 Hz, whistled or played into the mic (asks for the mic; phones too). Seed: a PIER catch, or a payphone node.
    - **The mic (Greg, 2026-11-06: analyze the frequency):** getUserMedia + an AnalyserNode (FFT ~8192 at 48 kHz: ~6 Hz a
      bin). It counts within ~±40 Hz of 2600, held ~1s, with a meter showing how close you are. 2600 is a high whistle:
      a tone app or another device counts too (that's phreaking). A way through without the mic (denied, or none): a
      keypad of the tones, harder but possible. Say on the prompt that it only measures pitch, nothing is recorded or
      sent. The mic needs a secure page (https is fine; test file://).
    - **The hint (Greg likes it):** the real 2600 trick came from a cereal box toy whistle. A made-up cereal ad: "free
      toy whistle inside!" The ad is where you find the seed.
    - More with the same pitch check: match the boss's tone to break a shield; hum its keypad tones back.
  - **The mic, more broadly** (Greg, 2026-11-06): pitch, loudness, silence and claps work offline in every browser
    (shout to break a shield, blow on the mic to clear mold, ICE that wakes at a noise, clap a rhythm). Speech to text:
    the browser's own (Web Speech API: Chrome / Edge send audio to Google / Microsoft, Safari to Apple or on device;
    needs the net; not Firefox, so a typed fallback). Fully offline: a small model in the browser (a 40-75 MB download).
    A paid service would need a server for the key (a PHP proxy on DreamHost): overkill for now. Speech to text is for
    the special moments: saying a password, talking back to G0D.exe or MANTIS.
  - **SLEEPER:** it can't see you when you close your eyes. Turn the screen off or switch apps and its guard drops
    (page visibility).
  - **CRON:** only there at a real time ("come back at 3:33"). Ties to the daily seed.
  - **OVERFLOW:** a buffer overflow. Its health counter wraps: heal it past its max and it rolls to zero. Or a long
    string typed into the seed field. (Section 10: something in the game you can hack.)
    - **The long seed (Greg, 2026-11-07):** seeds stay capped at 16 (`cleanSeed` cuts the rest), so normal seeds never
      break. OVERFLOW looks at the raw text before the cut: a `?seed=` link over 16 characters (or full of junk
      symbols) wakes him instead of being trimmed. In settings the seed box could let you type past its edge, the text
      glitching and spilling over the screen, and that wakes him too.
  - **SOURCE:** the word is in the page source / a code comment (desktop). Phones need the URL fallback (MANTIS): a
    stage of a fight, not a whole one.
  - **KONAMI:** too strong to beat, until you enter a cheat code mid-fight and the game's own dev menu opens against it.
    (Greg likes it, 2026-11-07; the dev menu as a terminal: section 10.)
  - **PHISHER:** a social engineer. It phishes you with fake prompts (session expired, enter your seed; a fake update;
    a fake CONTINUE), each with a tell (a typo, the wrong font); a fake costs you. The PHISH theme turned around.
  - **GHOST:** your own best run (REPLAYS) as a boss: it taps what you tapped; race yourself. Close to DOPPEL, at boss size.
  - **Where the seeds turn up:** the ending's log (KITCHEN, ZER0), a hidden ad, a PHISH catch, a crew call, the codex's
    ciphertext, the console.
  - Claude's picks: TWIN (works everywhere, nobody expects it), OVERFLOW (pure hacker logic), PHISHER (fits the story).
    PHREAK's whistle is the weird-hard one, like going offline.
- **Replay H3AV3N** after winning (maybe its own leaderboard).
- **A gauntlet seed:** one of each corp, in order, in a single line (stores / fishing off the sides, no skipping corps).
- **A daily seed** and a daily leaderboard (none today): a pinned row on LEADERBOARD > SEEDS.
- **More rewards?** A mod you always start with (meat notes 2026-10-29).
- **CODEX** (the track) might be good for the credits or the cutscenes (meat notes 2026-10-31).

### 5. The map and run structure
- **Fishing, what's still open:** unlock the PIER with a feat; a quest item on the line; mods or gear that affect
  fishing? (a note for now; the first notes said no fishing upgrades).
- **Different markets** (the user, meat notes 2026-10-28): black market / grey market / open market.
- More varied layouts: missing nodes, skip-lane links, sideways links, dead ends, other shapes per sector.
- Moving backwards / the frontier (pick any node linked to one you've visited), or allow clearing the whole map.
- Node count that keeps climbing; past the 4x4 grid (phones fit ~6 columns).
- More final bosses, each its own mechanic (OMNI is the only one).
- Long-run issues: power creep, a guaranteed heal each sector.

### 6. Anomalies and sector events (design: `docs/SECTOR_EVENTS.md`)
- **Still open:** a THREAT level later; a REP option to turn events on in sector 1; tying the sector boss to the
  event (parked). Idea: ICE STORM.
- **Other ideas (Claude's):** TAXED, AUDITED, RANSOM, BACKWARDS, a trace meter.
- **Overlapping events, still open:** more scales (quests, REP level: the user, 2026-11-04, 'quests or other things can
  start to scale those values'); the editor's TESTING picking a pair; turn RAT RACE / CHEF'S CHOICE down to 3-4 after
  the d0g quest is real (today the scale keys off beating d0g as a rival).
- **Decided (Greg, 2026-11-05):** don't worry about sector event balance or tiers for now; the recent updates (stacking,
  weights, scales) should even them out.
- **New event ideas** (meat notes 2026-11-06, later):
  - **Glitching up:** each ICE hit and derez adds more glitch filter over the screen, like chroma separation.
  - **Dying moves you:** a death restarts you somewhere else.
- **Event tiers, later** (the user, 2026-10-30: not now): harder events only deeper. For now the rule stands: sector 1
  is clean, and from sector 2 any event can show up.

### 7. New corps
- **A PSYCHO MANTIS boss** (the user, meat notes 2026-11-06; **Decided (Greg, 2026-11-06):** part of an end game quest,
  section 4): a boss that reaches outside the game: "unplug your internet", "open the inspector"? Talked through
  2026-11-06 (Greg: "i like the weird hard ones"):
  - **It reads your mind:** it knows where you'll tap (your cursor on desktop, your habits from the save), so playing
    normally can't beat it. FOURTH WALL already reads your save; this is the step past that (Mantis's port 2).
  - **Go offline:** "unplug your internet" (airplane mode on a phone). The browser sees it go offline; it loses you and
    can be beaten. Greg likes this one.
  - **A hidden word you type in** (Greg's idea for "the inspector"): the console alone won't do (phones have none, and
    browsers differ). Claude: put the word in several places at once, so every device has one: the address bar (the
    URL's #word: "look up"), the tab's title (a phone's tab switcher), and the console (a bonus for the curious on
    desktop). You type it in the seed's text field. (Copying it to the clipboard works too, but it overwrites what you
    had: probably not.)
  - Other outside tricks the browser can see: switching tabs, turning the phone, resizing, keyboard instead of a
    cursor. Fake-outs between phases: a fake crash, a fake update prompt, black with its name.
  - The trick has to be findable: after a couple of fails, a hint (b0y or POPS).
  - Open: how many phases.
- **A drug dealer corp** (the user, 2026-10-27).
- From CORPS.md, not built: UNICORN (very rare), MAGIC (stage magic), ALARMS, the chain corp, the case corp
  (upper / lower case), the stock market corp. CORPS.md marks every built corp `(built)` on its heading.
- From the old ideas list, not built: bad security (passwords that rotate: BUDGETWALL / PASSWORD123), the dating app
  (SPARKD, a catfish boss), an arms dealer (GUNMETAL), the punk corp (details to come from the user), sudoku /
  crossword, the seed corp (uses or changes the run seed). THE CHOIR as a "ministry" (a per-corp word instead of "corp").
- A second boss mod for the corps that have one (71 corp mods left; 11 corps give boss gear instead, v13.62).
- **CHUCK E. CACHE has a 1UP in its logo** (meat notes 2026-11-06): do something with that once 1UPs are unlocked?
- **RED TAPE:** a mod or gear (just the name so far). **B1BL3** (meat notes 2026-10-31): a portable codex (gear).

### 8. Achievements and cosmetics
- First win, a naked (0 mod) win, beat each corp, perfect streaks, reach layer X; easy ones too (die on the first
  corp, spend 1000cr, earn 1000cr then get back to 0); beat G0D at the top.
- Unlock cosmetics: logos, hats / accessories, card frames, titles ("SIGIL BREAKER"). Some bought with REP.
- **INFIDEL** (the user, meat notes 2026-10-30): a feat (a title) for beating G0D with a SHOE. (So SHOE has to work in the
  G0D fight.)

### 9. Lean more cyberpunk
- Cyberware in names and flavor (implants as gear, MEDIX as a chrome clinic, chrome on the runner card), the ads.

### 10. Make it more of a hacking game
- Something in the game itself you can hack, like the seed (OVERFLOW, section 4).
- **The dev menu as a one-line terminal** (Greg, meat notes 2026-11-07: "i like that hack boss idea where you open up
  the dev menu. i kinda think we might want to update the dev menu to be more like just a one line terminal that shows
  with ` and you can type in it and maybe it has auto complete"). Today ` opens the dev menu's button page
  (engine/dev.js). Instead: a one-line prompt, commands typed in, with autocomplete. It's the same terminal KONAMI
  turns against its boss, and the one the second window could hold.
- **A second window** (Greg, 2026-11-07: "a boss is neat. but we could also just open another browser window and have
  a little terminal there you could type in or all sorts of stuff"). TWIN's trick (tabs talk on a BroadcastChannel)
  for more than a boss: a second window that's a little terminal you type commands into, feeding the game. Other uses
  to think about: a second screen showing the map or a trace, a crew member "on the line" in the other window, a
  rival's window you hack into. Same limits as TWIN (same browser; a hidden tab barely runs). One terminal could do
  both: the dev-menu terminal above, popped out to its own window.

## Low priority

- **An AI crew member that plays the game** (the user, meat notes 2026-10-31): it learns as you beat corps: beat a corp
  10 times and the AI knows its tell (it gets it right); beat all of them 10 times and you can let it run. It doesn't
  use markets, but takes what lets it go deeper faster: SKIP, WARP, money boosters to get through the UPLINKs. You
  bring it in with an exotic CALL item. Names: ZEUS? APOLLO? (Maybe the same thing as G0D.exe, section 3.)

### Enemy and ally hackers (low: the user 2026-10-29, "we don't need any more"; the lore was great)
- **Still open:** special per-hacker emotes; multiplayer on the new cursor; more hackers (RTFM: its line is not "real
  time fun machine"; names from the user's notes: **s3iz**, **alpha haxor**, **kupreg**, **circo 77**, **Doctor kitten
  face**); balance from play. Using a crew member's logo (as yours) makes their calls less rare.
- **Dying to a rival** (meat notes 2026-10-28): better sounds on that screen (their logo over your death): a wah-wah,
  but more jingly, bad-news sounding.
- **Allies, more:** upgrade crew, give them mods (POPS with TRACER), tie them to REP or to your history with that
  hacker. Mods on good hackers.
- **The pet:** other ways to get one (today only COMPANION).

## Polish (the user, 2026-10-29: the finishing passes)
- **Boss intro pass** (the user, 2026-10-29: "it's all working for now", but the whole boss intro could use a little more): the corp's logo on it, and more.
- **INTRO PASS:** after the user has lived with it. The intro keeps playing every time; the NEWB / LEET screen only on
  a truly fresh start (maybe a URL switch keeps it all, for testing; `INTRO_ALWAYS` in engine/intro.js). Glitch /
  animation effects on the title card (noise in the log, the map drawing in with static, a burst on handshake, the
  logo decoding in). The title card art round (the user is trying things in asXii first; the old lettering samples:
  `docs/art/logotype_round4.png`, `logotype_n1.png`, `logotype_round5.png`, text in NAMES.md; the title switching
  between the face and the lettering). Your profile shuffling as you log in. The maps more animated (the user,
  2026-10-27): the white path lines light up, or each continent lights up with brighter white borders.
- **Sector event cards:** the user's art for the 14 card pictures (5 x 3 placeholders in data/events.js). (Still wanted: "update art for sector events", meat notes 2026-11-06.)
- **COPY PASS (text):** a terminology pass on the whole game, to lock the terms down. Settled so far (the user, 2026-10-29):
  **going deeper** = moving on through the sectors (the UPLINK says it; push on, next sector... say it this way). The INFO page, the training (POPS's lines), the mod and gear descriptions, and the ~180
  "integrity" mentions (the header says INT; INT everywhere, or only where space is tight). **Ad copy** (meat notes
  2026-11-06): "you are the product!"
- **Codex and menus pass** (with HOW TO PLAY):
  - **HOW TO PLAY pass:** touch it up (corps and tells on THE BASICS; gestures, exotics, ads, run resume).
  - **Keyword highlighting in text** (started v13.75 on HOW TO PLAY > THE BASICS: ICE, INT, credits; next the other HOW TO PLAY pages and the codex, the user's aim: neater): ICE in red, credits in money, mod names in their rarity...
- **The training sim** may need a little redesign (meat notes 2026-11-06).
- **PHONE PASS:** (the user, 2026-10-31, as a home-screen app on an older, smaller iPhone: it works, but everything feels small; the text size is set by the widest screens fitting the width) bigger, roomier buttons (the tray, lists; ~44px); more room for long text (codex, mod
  descriptions, detail boxes, the clash screen); the swap screen's row spacing; the spacing / copy on the pick
  screens; the header menu button right-aligned?; the palette warnings (40 palettes; MOCHI MOCHI is hard to read,
  the user will probably change it).
- **A juice / graphics pass:** Unicode shading and shapes, kaomoji, bigger mini-art for mods in detail boxes.
- **Effects on the beat** (the user, 2026-10-27): effects that land on the music's beat; subtle.

## Medium and small
- **Pets you can toggle** (meat notes 2026-11-07): a small button in the loot bar, like b0y's on the left (if b0y's
  is there, shift it right so they don't overlap), that turns a pet on or off. Today it's one pet a run: COMPANION, the
  EGG's chick, STRAY's bug and CATPHISH's fish don't stack (with STRAY and CATPHISH, the seed picks one). Maybe they
  can all be out at once, each with its own toggle ([p] [f]... by name). Open: how several pets behave together.
- **If the C.A.R. confuses** (Greg, 2026-11-07: "i think it'll be fine", keep it as a potential fix): with the C.A.R.
  every node in the sector looks reachable, so the map doesn't show which moves are a drive. Fix if it comes up: draw the
  drive-only nodes differently (dimmer, or a little car mark).
- **The neon editor** (meat notes 2026-11-06): clean up the UI; terminal-style commands with autocomplete?; Justin's
  music track viewer in the music tab?
- **Code cleanups left from the arch pass** (the user, 2026-11-05: "keep those all around so we can hit them when it makes sense"). Do each one with the feature that needs it, not on its own. Details: docs/ARCHITECTURE.md.
  - **One popup card (`drawCard`):** with the next new kind of popup.
  - **Per-seed definitions:** when a new seed comes in (crew quests), so HAD3S / H3AV3N / the next one are mostly data.
  - **`say()`, one way for characters to talk:** when crew quests add more voices.
  - **The `MODES` registry:** with the next new screen mode, or if input bugs keep coming from pointerdown's early returns.
  - **Hover / keyboard focus in popups:** with a desktop or accessibility pass.
- **Hacker logo pass** (the user, 2026-11-04, looking at them now): the game always adds the name under a logo (logoBlock: mark + name; the hacker card's NAME // RIVAL line), so logos don't need the name in their art: 24 x 7 is all picture. 17 hacker logos spell their name in the art and show it twice: pops, iceman, turbo, sysop, vulture, phish, hcf, leech, brick, null, nana, dialup, baud, mother, root, kludge, hype (not ggez, doppel, d0g). Redraw them (art only, no code).
- **asXii size presets** (the user, 2026-11-04): update asXii's Presets list (ascii-editor/dist/index.html #sizePreset) to the game's real art sizes, and check the ones there. Today it has: node glyph 5 x 3 (right), corp art 24 x 12 (wrong: corp intro art is the logo, 24 x 7), ad box 30 x 18 (right: ADS_W / ADS_H), intro map 34 x 9 (the map is 34 x 12 now), title art 32 x 20 (check: TITLE_W is 31), terminal 80 x 24. Add: logo 24 x 7 (the name goes on row 8, LOGO_W / LOGO_H), hacker face 5 x 3, SECTOR CLEARED 30 x 13, sector event card 5 x 3, cutscene 36 wide (any height; the game's grid). asXii is Justin's too: check his recent commits first.
- **Pull asXii out into its own repo** (the user, 2026-11-04), and **greglytics** too (meat notes 2026-11-06). asXii is
  already separate in most ways: its own version, bump script, README and docs, and no game code. What moving it
  would touch:
  - **Keep its history:** split `ascii-editor/` out with `git subtree split` (or `git filter-repo`), so Justin's and
    Greg's commits come with it. Then remove the folder here.
  - **The neon editor's ART tab** opens asXii at `../ascii-editor/dist/index.html?neon=1`
    (`tools/neon_editor.html`, `editInAsxii`) and talks to it with `postMessage`. After the move, that path has to
    point somewhere else: a hosted copy (simplest, works from anywhere), or a sibling folder on disk
    (`../../asxii/dist/`). The messages already check `from: 'asxii'`, so they work across sites;
    `dist/neon-link.js` goes with asXii.
  - **Cutscene art:** `tools/scene_art.js` reads the asXii saves in `ascii-editor/saves/` (gitignored, so they're
    only on Greg's disk). Give it a path setting, or keep the cutscene saves in this repo (e.g. `art/scenes/`), since
    they're the game's art more than asXii's.
  - **Docs and settings to update:** CLAUDE.md (the asXii line), readme.md (the layout tree), SPEC §14 and §16f,
    `.gitignore` (the ascii-art.de catalog line moves to asXii's), and the new repo's own CLAUDE.md, `.gitattributes`
    and `.gitignore`. Comments in `dist/data/art/*.js` and `scene_art.js` that say "asXii" can stay.
  - **Justin** needs access to the new repo, and his open branches (if any) need rebasing onto it.
  - **Hosting:** asXii gets its own deploy (and its link-preview tags once it has an address). Its update notice
    already works on its own (`version.json`).
  - **Gains:** asXii can be public or shared on its own, and its commits stop mixing with the game's.
    **Costs:** two repos to keep in step for the art round trip, and the neon editor depends on where asXii lives.
- **FORGERY's partner:** a rare mod that turns $ nodes into exotic mod nodes (open: what one costs to open).
- **Ads that do things** (later, the user 2026-10-28; the fake ads are done and great): an ad that sells you gear or a mod; a free trial of a corp's mod; AD BLOCKER.
- (fine as is, the user 2026-10-29) A REROLL in a market with COUPON adds another free option. Epic FIREWALL with FAILSAFE: "no hits this corp", working. BLOOD MONEY's repair glitch (a repair pays a little in the early sectors) stays: "if someone wants to they should be able to". BLOOD MONEY scaling: fine as is.
- (dropped, the user 2026-10-28: fine for now) Boss rewards by difficulty; showing corp difficulty in game; the tell balance pass.

## Deploy and release (later: a browser-testing pass opens these)
- **Browser back = BACK** on menu pages (the user, 2026-10-29: it only came up once; a can of worms for that pass) (and ask before leaving a run or a room).
- **Going public:** drop the page's `noindex`; maybe the game's own domain.

## Parked (later, when the user says)
- **THE DEAL** (a mod, parked 2026-11-07 when MONTY's prize became the C.A.R. / GOAT): once a layer, after your first ICE hit,
  every node goes dark but the real one and one other. A good fit for another game-show corp.
- **G0D comes out of its own logo** (parked, Greg 2026-11-07: "it's pretty nice as it is right now"; Greg, 2026-11-05:
  "god could have popped out of his own logo for the final stand"): its logo (v14.43) up first in the final stand,
  then the eye tears out of the triangle.
- **Not sure yet** (the user, 2026-10-29): **A general popup over a node:** pull COIN FLIP's hold / drag box into one shared piece (`nodePopup`). **Flipped characters:** MIRRORLINE's glyphs flip with its mirror; a backwards mod.
- **MULTIPLAYER: shelved** (it works and stays in; finish the core game first). Later: maybe p5.party instead of
  Firebase; co-op (NeoN+m, Keep Talking style); a roulette mode.
- **Music:** the engine pass and fewer, better tracks: docs/MUSIC.md.
- **Analytics:** the play stats are collected (greglytics); reading them (which corps beat people, what gets bought).

## Parked mod ideas (the user, 2026-10-26: "we have enough mods for now")
- **DELUX** (probably exotic; the user, 2026-10-31: parked): gives you a random set of mods.
- **Item stacks become health** (probably an exotic mod; parked 2026-10-31): your gear stacks count as integrity.
- **Name ideas** (the user's notes, 2026-10-31: "brain dumps of words that might be good mods or gear"): MIMIC, NEON, SCAM, MERCH.
Where they are, for when mods open up again:
- **CLUSTER** (the user, 2026-10-26): a mod name to build something around; no idea for it yet.
- **A random gear every corp** (the user, 2026-10-27): a mod that gives you a new random loot gear at each corp's start.
- CORPS.md "Notes": open map, THROTTLE (cheaper uplink), DIGIPET's pet on screen.
- ECONOMY.md: chained perfects, TIME IS MONEY, items as a store of value.
- EXOTICS.md: "New exotic ideas, 2026-10-25".
- The archive (`docs/archive/SPEC_backlog_2026-10.md`): random gear on perfects, better drops (10-20% one step up),
  a bigger VIRUS / CHAINLOCK, a glyph mod, TRUTH METER, dummy ICE, scans as patterns, OVERCLOCK's row-flash
  variant, HYDRA counters, recon stops, puzzle on ICE.
