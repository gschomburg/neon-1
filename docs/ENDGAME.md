# The end game

What happens once you beat G0D: the ending, the rewards for beating the game, and what it opens up. Kept apart
from the quests (the user, 2026-10-30). The main quest and G0D's fights, up to the final stand: docs/QUESTS.md.

## The ending (the user, 2026-10-30, a brain dump)
After G0D FINAL STAND, in order:
1. **A cutscene** (the end of the game).
2. **A brief credit and "thanks for playing".**
3. **"There is more to explore"** (or something like it).
4. **The reward for beating the game.** It shows up as a REP unlock, but already bought: you don't pay for it.

## Built v14.41: the ending, the 1UP, REPLAYS (2026-11-05)

**Decided (Greg, 2026-11-05):**
- G0D just dies: no "there will be others", no "it's not gone". Its last lines: "n0. n0. i AM the net." then it comes apart ("i am th3 n3t. i am th3 n%... i am"). The ending says its code broke into pieces and scattered across the net, too small to think: a quiet seed for the G0D.exe quest later (BACKLOG item 3).
- A clean, happy ending: POPS and b0y reunite ("let's go crack a corp").
- The rewards are handed over in the story: **b0y gives you the 1UP** (a crash unit he pulled out of MEDIX on his way out of sub-basement three); **POPS teaches you the seeds** (with the mold gone they hold still, so replays count) and gives you **his log of your runs** (REPLAYS). The gauntlet seed and G0D's eye: later.
- Credits: made by Greg Schomburg and Claude; playtesting Justin Bakse and friends; then THANKS TO a list of made-up hacker handles.
- New art, all placeholders for now (Claude's, ascii-editor/saves/n_cutscene_04_ending, to redraw in asXii): a skyline at dawn, the rooftop, the crash unit, the seed terminal; your own logo at the end.

**The scene** (data/quests.js `h3av3n`, a strip; music EVENT HORIZON): G0D IS DOWN · dawn over the city, its lights going out (G0D's code scattered) · the mold goes with it · the rooftop, two mugs of coffee · "doc." / "kid." · the crash unit (b0y: the 1UP) · the seed terminal (POPS: seeds, his log) · "come on, doc. let's go crack a corp." / "one. then breakfast." · your logo: "and you? you've got a seed to type in." · THERE IS MORE TO EXPLORE · THANKS FOR PLAYING · CREDITS · THANKS TO. Then H3AV3N CLEARED lists the three unlocks, then POPS's call.

**The 1UP** (engine/run.js, "THE 1UP"): as designed below. You start every run with one once you've beaten G0D, and it charges again every sector. The save point is the run as you enter a corp (`run.oneUpSave`; not the public net, not heaven's MAZE / G0D). Die holding it: a CONTINUE? screen; USE 1UP puts you back at the start of that corp with what you had going in, and the seed brings the same layers back. A gold 1UP shows next to INT while you hold one. Tracked: a `oneup` event (sector, corp, layer), `oneUps` on run_end. Leaderboard tie: 1UPs x 100 + mods (fewer 1UPs wins first; the board shows the mods), and every score now carries its seed and 1UPs in its data (for a seed board later).

**REPLAYS** (engine/menus.js): a [REPLAYS] on the title's seed row once you've beaten G0D. POPS's log: your 10 deepest seeds (`save.bestSeeds`, built from your history the first time) and the 5 you played last. Tap one to run it.

Not done: showing the three as already-paid posts on THE BOARD (they're listed on H3AV3N CLEARED); a seed leaderboard (the scores carry the seed now).

## Reward 1: seeds for real
Replaying a seed no longer counts as practice, so the run goes on a leaderboard. Maybe
those runs get **a leaderboard of their own** (any game played this way).
- Already there (checked 2026-10-30): greglytics gets practice on run_start / run_end / run_quit, and the seed on run_start;
  the save's run history keeps each run's seed and practice flag.
- Missing: leaderboard scores don't carry the seed (engine/leaders.js, lbSubmit's data). A seed board needs it.
- (Claude) A seed board could group by seed: the best depth on each seed, so players race each other on the same one.
- **The plan (talked through 2026-11-05, not built; Greg: just talk for now):**
  - No server change: greglytics takes any board name, so each seed gets its own board, `seed-<SEED>` (like
    `day-2026-11-05`). Every run that posts also posts to its seed's board, random seeds too, so a replay has your
    first run to beat.
  - A **SEED tab** on the LEADERBOARD (TODAY / ALL TIME / SEED): the board for the seed in the title's seed field, or
    your last run's; the seed in its header. Same rows as the others.
  - The end screen: on a replayed seed, one more line, `#2 of 5 on K7XQ2M` (the rank line is near 32 columns already).
  - Before G0D, a typed seed is practice and doesn't post, so racing a chosen seed is end game only (fits the story).
  - Not possible without a server change: a "most played seeds" list across everyone (the server reads one board at a time).
  - **Greg's shape (2026-11-05):** the SEED tab opens on the top scores from any seed, all replays, each showing its
    seed (Claude: the hacker-name column shows the seed; long typed seeds scroll). Tap a row: a little menu, filter to
    this seed or play it. A seed's own page shows just its scores. A way to enter a seed or filter on the front page.
    Claude's take: the front page is one more board, `replays` (only replay runs post there); a seed's page is
    `seed-<SEED>`. Front page: `[ FIND SEED ]` (a field like the title's) over the rows; tap a row: `[ THIS SEED ]
    [ PLAY IT ] [ BACK ]`. A seed's page: header `SEED K7XQ2M`, `[ ALL SEEDS ]` and `[ PLAY IT ]`; esc / BACK steps back
    one level (seed -> front page -> title). All time only.
  - **Open (to decide):**
    - Practice runs (a typed seed before G0D) post to nothing today, so a friend you send a seed to can't get on its
      board. Claude: let them post to the seed boards only (never TODAY / ALL TIME): fair, since seed boards only
      compare the same map. And on the `replays` front page too, or only the seed's own board?
    - One player grinding a seed could fill the front page: show each player's best per seed (fetch more, dedupe in
      the game).
    - Quest seeds (HADES, H3AV3N, the gauntlet): Claude: off the front page, but each gets its own board (that's
      "replay H3AV3N"'s leaderboard for free).
    - Random runs post to their seed's board (so a replay has your first run to beat) but not the front page.
    - Scores before v14.41 have no seed: the boards start empty.
  - **Leaning (Greg, 2026-11-05): seeds aren't an end-game reward any more.** Gating them behind G0D takes the fun out;
    better that anyone can compete on a seed without playing a ton first. Still track who has beaten the game.
    Claude's shape:
    - Today "practice" means two things: a typed seed before G0D, and cheats (dev menu, the editor's jumps). Split
      them: typed seeds get their own flag; "practice" is only cheats, which stay off every board.
    - Typed seeds post to the seed boards (`replays` and `seed-<SEED>`) for everyone, from the first run.
    - Typed seeds never go on TODAY / ALL TIME, for anyone (memorizing a map shouldn't win the main boards).
    - Each seed-board entry carries whether you'd beaten G0D; the board marks only those (gold rank or initials,
      "gold = beat G0D"; or call it LEET). The only call-outs today: "practice" and "quest".
    - Open: REP on typed seeds for everyone (Claude's pick: then typed seeds aren't practice at all) or none until G0D.
    - The end-game rewards then: the 1UP, REPLAYS (POPS's log), the gold mark, and something fun instead (a G0D
      palette, G0D's logo to use, later G0D's eye). POPS's ending line about replays counting gets rewritten.
  - Goes well with **a daily seed** (BACKLOG, parked): the same seed for everyone each day, its board the SEED tab. It
    would have to count for everyone, not only after G0D, since nobody picks it.

## Your seeds: a REPLAYS button on the title (the user, 2026-10-30, a side note)
Once the end game is unlocked, a new
title button (HISTORY or REPLAYS) keeps seeds handy so nobody has to remember them. Two lists: **your best seeds** (the
10 you got deepest on, or the last 10 you replayed) and **the 5 seeds you played most recently**. Tap one to play it.
(Already there: the save keeps the last 20 runs with their seed and depth, save.history; the best list needs its own
store, since 20 runs scroll off fast.)

## Reward 2: the 1UP (the user, 2026-10-30, decided)
- **Any run, once unlocked** (not only seed runs), always tracked. Once it's in, check it doesn't overpower people;
  seed runs still give the biggest edge (you can memorize the map).
- **You hold one 1UP at most.** It refills each sector you get through (used or not, you start each sector with one).
- **Dying with a 1UP: a CONTINUE screen.** Continuing takes you back to **the start of the corp** you died in (not the
  sector), with what you had when you went in: a moment to compose yourself.
- **The seed is the seed** (the user, 2026-10-30): continuing rerolls nothing. The corp's layers come back exactly as
  the seed made them; memorizing node positions is a fun part of it. Same for resuming a run after closing the browser:
  today resuming rerolls the layers on purpose (run.resumes salts genLayer, engine/run.js + menus.js resumeRun); take that
  out so the seed always decides the node positions. (Checked: picks, rewards and market rerolls don't change later
  corps; every roll is keyed to the seed + that node / layer. Markets can differ a little with your build.)
- **No penalty, just a tie breaker:** two runs with the same score, the one that used fewer 1UPs ranks above.
  (Claude: today the tie is the mods count; 1UPs used would go before it.)
- **Tracked in analytics:** a 1UP event when one is used (where: sector, corp, layer), and the count on run_end and in
  the leaderboard score's data.
- (Claude) A seed makes the save point cheap: the seed, where you are, and your mods / gear / credits / INT as you
  entered the corp.

## Replaying H3AV3N (the user, 2026-10-30)
Heaven and G0D can be played again once you've won. Maybe a custom leaderboard for it, though the logs already have
the seed on every run (greglytics run_start), so we'll know who's replaying it either way.

## A gauntlet seed: one of each corp, in order (the user, 2026-10-30, an end game note)
A seed sort of like heaven but different: **one of each corp, in order.** Not a regular network with every corp on it:
**a single line, like GAUNTLET**, one corp after another. Maybe stores or fishing off to the sides that you can visit,
but you always have to fight every corp in a row: no skipping one by going to the store.

## Still to decide
- More rewards? G0D's rewards so far (meat notes 2026-10-29): replaying seeds for real, and a mod you always start
  with (Claude: or a G0D piece of gear, its eye: very powerful).
- The cutscene, the credits and the "more to explore" screen: what they show and say.
