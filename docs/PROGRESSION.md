# Progression: feats, REP, the crew (plan, 2026-10-28, round 4)

A plan, not built. The mockups of every screen are on the "NeoN+1 Progression" page (the link is in the chat).
BACKLOG items 1 (REP and THE BOARD), 2 (quests), 4 (hackers) and 7 (achievements) all feed into this.

## Settled (the user, 2026-10-28)

- **Menu screens take the whole screen**, and any list can scroll.
- **All lists scroll the same way:** the codex's "more" rows (`[ ^ ^ ^  more  ^ ^ ^ ]` at the top and
  `[ v v v  more  v v v ]` at the bottom, when there's more that way). The game-over screen's map scroll should switch
  to the same system, so every scroll area works alike.
- **THE BOARD is the hub.** Its BBS header sits at the top of every hub screen, with the tabs under it: **YOU** (the
  profile), **REP** (the posts you buy), **FEATS**, **CREW**, **STATS**. The title keeps `[ THE BOARD ]` (opens on REP)
  and your name button (opens on YOU).
- **BACK is in one spot on every hub screen:** centered at the bottom, like the codex's.
- **Colors:** everything uses palette colors (text, mid, dim, accent, money, danger), so each palette repaints it. The
  exception is your **player color** (fixed, so you look the same everywhere): it paints your name button and the
  whole profile card on YOU (logo, name, title, access, record).
- **The "more" rows** stay the codex's, in a quiet color (not the gold of the mockups' first try).
- **Where the detail goes:** in places you act (markets, REP) the list is on top and the detail and its button are
  under it. In places you read (the codex, FEATS) the detail is on top and the list under it. CREW is the exception
  for now, with whole cards in the list, to judge in the game.
- **REP's BUY** is today's boxed button.
- **A locked logo:** a banner across the logo itself ("LOCKED: BEAT GG_EZ 5x 3/5"); the name line stays plain. Leave
  YOU while on a locked logo and you keep the last logo you could use.
- **The name is FEATS.** Feats **don't pay REP** (keep the idea in case playtesting says REP is too slow).
- **No hidden feats.** Every feat is listed from the start.
- **Fresh start** for everyone, and a wipe tied to a version number (section 6).
- **Hackers are RIVALS (bad) and CREW (good)**, everywhere the player reads it. Today's RIVAL anomaly fits: it becomes
  one rival (D0PPEL).
- **No spoilers:** a rival's logo isn't in the logo picker until you've met them. Once met, it shows dimmed with your
  progress until it's unlocked.
- **Rivals:** their info is in the codex; how many times you've beaten them is in feats (`GG_EZ x5 ###-- 3/5`). The
  logo at 5 is the whole reward ("your logo is sort of your title").
- **Titles** come from feats and show on your profile card. You pick one on YOU, the same way as a logo. A feat's detail
  says which title it gives. Later they show in multiplayer too.
- **NEWB, the default title** (the user, 2026-10-28): the feat for finishing the training gives it, and its FEAT box
  comes up at the end of the training if you don't have it yet. Skip the training and you get it quietly on your first run,
  so everyone has a title. After a wipe it's your title again.
- **Progress reads like** `###-- 3/5` and `######---- 6/10`.
- **New things get a `*`:** the item, its tab and the title button, until you've looked at it.
- **REP's tiers:** each tier has a few more posts, and the whole list scrolls. PRIVATE MESSAGES (crew posts and other
  posts that feats open) sit at the top.
- **The crew:** 5 calls to recruit. 2 levels. A crew member's LVL 2 upgrade is fixed in the code (a set mod or
  upgrade), so nothing extra to test.
- **STATS:** one scrolling column, values right-aligned, alternating row shading.
- **YOU** keeps [ RANDOMIZE ALL ].
- **During play, a feat shows in the terminal line** (the message line) for a second or two, in a **gold band** (the
  palette's money color behind dark text). No popup, no POPS face. Progress ticks ("GG_EZ down. 3 of 5.") use the
  normal line.
- **The unlock box** says FEAT in its top line (with `1 of 2`), then POPS's copy, then what it gives ("unlocked logo:
  TURBO", "unlocked title: CLEAN HANDS").
- **When calm** (the map between corps, the end of the run), a **short unlock box** with POPS's copy: no face, no
  logo, small. `[ CLOSE ]` always (drops the rest), plus `[ NEXT ]` when there's more than one (`1 of 2` in its
  top line). A tap on the box = NEXT, or CLOSE on the last.
- **The rep color** (built v13.64): a palette role like money, in every palette (blue-violet, lime on 3). Everything
  progression uses it: THE BOARD's header, REP amounts, the feat band, the unlock box, the `*` marks, done ticks. The
  feat band is rep behind the palette's background color (the message band, inverted). Tune any in the palette tab.
- **No hacker colors of their own:** the game's colors (rivals in the danger color, crew in the accent color).

## 1. THE RECORD (stats)

- `save.stats`: one flat map of counters: `runs`, `wins`, `corp:<key>`, `hack:beat:<id>`, `hack:call:<id>`,
  `perfects`, `perfectStreak`, `cr:earned`, `cr:spent`, `ice`, `deaths`, `sector:<event>`, `gear:<key>`, `ads:closed`.
- One function counts: `tally('hack:beat', 'ggez')`. It checks the feats that read that counter and queues the news.
- Practice runs (cheats, the TESTING tab) don't count.

## 2. FEATS

- `data/feats.js`: id, name, group (RIVALS, CORPS, RUNS, ODD), text, the counter and how many, what it gives.
- `save.feats`: { id: the date it was done }.
- **A feat gives:** a logo (rivals at 5), a title, or a post on REP (crew posts are the first). Later maybe card frames,
  palettes, quests.
- **The first batch (before the hackers play):** corps, runs and odd ones (about 25), several of them giving titles.
  The rival rows arrive with the hacker bot.

## 3. THE CREW

1. **The random call:** a **CALL** gear (markets and loot) brings in a random crew hacker for the rest of the corp.
   Each visit counts for that hacker.
2. **The preview:** after the first call, REP's PRIVATE MESSAGES shows them as a locked post: `POPS  ##--- 2/5`.
3. **Join:** at 5 calls the post opens, **CREW: POPS** for REP. He joins your crew, his logo unlocks, and his own gear
   (named after him: all 10 names fit the gear bar's 6 letters) turns up in markets and loot.
4. **LVL 2:** a new post, **POPS LVL 2** `######---- 6/10` (use him 5 more times). Buy it: his fixed upgrade (POPS:
   TRACER, he reads the tell better).

- **The CREW tab:** a scroll list of crew cards: face, name, level, what they do, the upgrade, the LVL 2 progress.
  Called-but-not-recruited hackers show dimmed at the bottom with their count. Strangers don't show.

## 4. REP (the posts on THE BOARD) and its tiers

- REP is earned as today (cash out; DEADMAN keeps some on death).
- **One scrolling list:**
  1. **PRIVATE MESSAGES:** crew posts and previews; later other feat-opened posts. New ones get a `*`.
  2. **LEVEL 1 GUEST:** today's 7 posts plus a couple more.
  3. **LEVEL 2 USER** (buy 4 on GUEST): LOCKER, BETTER DROPS, BOSS LOOT, NEMESIS, STARTER POOL.
  4. **LEVEL 3 ELITE** (buy 3 on USER): HEAT (harder runs, more REP), "you thought this was a game" (quests), the G0D quest.
  5. **LEVEL 4 SYSOP** (buy 2 on ELITE): THE ARCHIVE, cosmetics.
- A locked level shows its header and what opens it. A post with levels counts once. The counts are a guess.
- **Your access level is your rank** ("access USER" on the card).

## 5. The news

- **In a layer:** the terminal line, about 1.5s. A finished feat gets the gold band ("FEAT: FIRST BLOOD"); progress
  ticks use the normal line. If the line is busy, it waits.
- **When calm:** the unlock box, one per unlock, over whatever screen is up: on the map between corps, and over the end
  screen (live or die). `[ CLOSE ]` always, `[ NEXT ]` when there's more; a tap on the box goes on.
- **First time:** the first feat, the first REP post and the first crew member each get one box that says where to
  look.
- **The copy:** a file like the training's (`data/pops.js`), in POPS's voice, editable in the neon editor. A setting
  turns the boxes off.

## 6. The fresh start, and wiping on a version upgrade

- `PROGRESS_EPOCH` (a number in the code) and `save.epoch`. When the game's number is higher than the save's, on load:
  - **REP:** you keep it, and everything you spent on REP's posts comes back.
  - **Wiped:** posts bought, crew, feats, titles, the record, rival logos.
  - **Kept:** best, runs, wins, history, the codex, your profile (a wiped logo or title falls back to a default).
  - One unlock box says so ("they wiped the board. your REP's still here.").
- The first feats build sets it to 1, so everyone starts fresh then (today's BOARD buys are refunded).
- The neon editor's TESTING tab gets **wipe progression**.

## 7. The screens (mockups on the page)

1. **Title:** `[ THE BOARD ]` and your name button (in your player color); a `*` on either when something is new.
2. **THE BOARD:** its header, then the tabs YOU, REP, FEATS, CREW, STATS; BACK centered at the bottom.
3. **YOU:** the card (logo, name, title, access level, record), then logo / title / color pickers, NEW NAME,
   RANDOMIZE ALL. Met rivals' logos are in the picker, dimmed with progress.
4. **REP:** PRIVATE MESSAGES, then the levels, scrolling, with the detail box.
5. **FEATS:** grouped, scrolling, with the detail box (and the title it gives).
6. **CREW:** a scroll list of crew cards.
7. **STATS:** one column, right-aligned values, alternating shading.
8. **Codex HACKERS** (the codex tab row wraps to two rows): laid out like the mod list. The selected hacker's details
   are at the top (face, name, RIVAL or CREW, shtick, lore, in that side's color, no logo). Below is a scroll list with
   the name and RIVAL / CREW on the right. Only hackers you've met; ??? for the rest.
9. **In a layer:** the gold band. **When calm:** the unlock box.

## 8. Build order

1. **The record, feats and the hub:** save.stats, data/feats.js, tally(), ~25 feats (corps, runs, odd), the hub (YOU,
   REP as today's board, FEATS, STATS), the title buttons, `*` marks, the gold band + the unlock box queue, titles,
   the epoch wipe, the shared scroll area (and the game-over map moved onto it). Neon editor: a FEATS tab (see them,
   grant / reset one) and wipe progression.
2. **REP's tiers:** levels, PRIVATE MESSAGES, then the USER posts one at a time (LOCKER, BETTER DROPS, BOSS LOOT).
3. **The hackers play:** the hacker bot (RIVAL becomes D0PPEL), rivals showing up, CALL and the named gear, the CREW
   tab and posts, the codex HACKERS tab, rival feats and logos, LVL 2 upgrades.
4. **Quests:** the call, FLOPPY, defeat d0g, opened by an ELITE post.

## Still open

- How rare CALL is (5 calls is the bar for now).
