# The end game

What happens once you beat G0D: the ending, the rewards for beating the game, and what it opens up. Kept apart
from the quests (the user, 2026-10-30). The main quest and G0D's fights, up to the final stand: docs/QUESTS.md.

## The ending (the user, 2026-10-30, a brain dump)
After G0D FINAL STAND, in order:
1. **A cutscene** (the end of the game).
2. **A brief credit and "thanks for playing".**
3. **"There is more to explore"** (or something like it).
4. **The reward for beating the game.** It shows up as a REP unlock, but already bought: you don't pay for it.

## Reward 1: seeds for real
Replaying a seed no longer counts as practice, so the run goes on a leaderboard. Maybe
those runs get **a leaderboard of their own** (any game played this way).
- Already there (checked 2026-10-30): greglytics gets practice on run_start / run_end / run_quit, and the seed on run_start;
  the save's run history keeps each run's seed and practice flag.
- Missing: leaderboard scores don't carry the seed (engine/leaders.js, lbSubmit's data). A seed board needs it.
- (Claude) A seed board could group by seed: the best depth on each seed, so players race each other on the same one.

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
