# Fake ads: idea list

Parody ads for the game: the corps selling themselves, plus anything else that's funny. Nothing here is
built yet. Add freely; mark where an idea came from. Lines marked *(Claude)* are my drafts for you to
keep, change or cut. The screen is 36 columns wide, so short copy works best.

## Where ads could show up

- **Interstitials** between parts of a run: after a boss, or on the way into a safehouse or black market.
- **Ads for the game's own corps** (most of the list below).
- A **corp built around ads**: pop-ups and banners over the board (see SPEC §17).
- *(Claude)* A banner strip on the map screen, or a "sponsored" line on the loading / layer messages.
- *(Claude)* A "skip ad in 5..." button that does something (or doesn't).

## The main style: spammy "sponsored stories" (the user, 2026-10-22)

A lot of the ads should be like the junk at the bottom of news sites (the "chumbox"): fake news stories
that are really ads, and open-ended clickbait ("4 things that are killing you"). The look: a block of
2-4 tiles, each a crude little picture plus a headline, a tiny `sponsored` / `promoted by` line, and a
made-up source name. Never says what it's selling.

*(Claude)* Format ideas:
- A tile = a tiny ASCII thumbnail (a face, a hand, a "before / after", a red circle around something) and a
  1-2 line headline. Source line like `PROMOTED BY HEALTHTRUTHS DAILY`.
- Shows on the reward screen or between corps, under a `SPONSORED STORIES` header, 2 or 4 at a time.
- Tapping one does nothing, or opens a fake article that's one line long, or costs 1cr.

The user's headlines:
- "is your dog in danger?"

*(Claude)* Headline drafts (mixing game-world jokes and plain clickbait):
- "4 things that are killing you (number 3 is your integrity)"
- "runners hate him: local man finds the real node every time"
- "doctors are stunned by this one weird ICE trick"
- "you won't believe what this OMNI//CORE sysadmin looks like now"
- "the BURGERTRON menu item employees won't eat"
- "if you own a 4x4 grid, you need to read this"
- "this hacker deleted her trace. what happened next is shocking"
- "the 7 worst corps to breach in 2026 (#4 will surprise you)"
- "seniors in your sector are getting free firewalls"
- "MEGAMART is ending this tomorrow"
- "throw out your mods now: here's why"
- "what your favorite glyph says about you"
- "the one thing LEDGER TRUST doesn't want you to know about debt"
- "she thought it was a decoy. she was wrong."
- "20 runners who flatlined too soon"
- "your sector's top-rated safehouse (it's not what you think)"

## Secret ads: hidden quests (the user, 2026-10-22)

Most ads do nothing when you tap them (that's the joke). But **one particular ad, if you actually tap it,
gives you something special**. Or it needs a combination: **own a certain mod, and when a certain ad shows
up, tap it** to trigger something, like an extra EXOTIC mod. A hidden quest, the kind players whisper about.
It joins the **nuke quest** (SPEC §17, "Remove a corp from the run": a nuked or removed corp's node stays on
the map, and going there starts a strange hidden quest line).

*(Claude)* ideas to react to:
- The secret ad looks almost like the others, with one tell (a headline that's slightly off, a source
  name that's a corp you've beaten, a thumbnail that's a real node's glyph).
- Mod + ad pairs: KEYLOGGER + an ad whose headline is a password; CIPHER's PARITY + an ad written in cipher;
  SNIFFER + "is your dog in danger?" (the dog is your companion: tap it to get COMPANION).
- A chain: tapping the right ad gives a map coordinate or a seed; the nuked corp's node there is the next step.
- Rare on purpose (one per run at most, and not every run), and a codex entry once you find it.

## Corp ads give a free trial of their mod (the user, 2026-10-22)

When an ad for a corp comes up, tap it and you get **that corp's boss mod, temporarily**. A "free trial", the
way real ads push them.

*(Claude)* things to decide:
- How long the trial lasts: the next corp, a few layers, or until the next ad. Shown on the badge (a `TRIAL`
  tag or a countdown) and the badge greys out / leaves when it ends.
- Whether it takes a mod slot (a full bar: it replaces nothing, or it rides along as an extra slot).
- The catch, in ad style: tapping costs something (a few credits, a "subscription" that renews: it charges
  you each layer unless you cancel, which fits the debt idea), or the trial ends at the worst time.
- Is it a mod that unlocks this (an EXOTIC "AD BLOCKER" that does the opposite? an "early adopter" mod that
  makes trials last longer?), or do all corp ads work this way?
- Ads for corps you've never met: a trial of a mod you haven't seen, a way to discover boss mods.

## Gun ads and cyberware ads (the user, 2026-10-22)

Ads for guns (maybe from an arms-dealer corp, SPEC §17) and for **cyberware**: a way to lean the world more
cyberpunk without changing the gameplay. The ads are where the setting can show: implants, chrome, body mods,
sold like phones and supplements.

*(Claude)* drafts:
- "the new SMARTGUN 9: it aims so you don't have to. (it also decides.)"
- "home defense made easy. 0% APR on all sidearms. ask about our trade-in program for limbs."
- "CARAPACE ARMOR: stops 9 out of 10 bullets. the 10th is on us."
- "PREDATOR: smart ammo that remembers your face."
- "upgrade your eyes this weekend! 20% off all optics. old eyes recycled free."
- "doctors HATE this neural port (it's installed by a dentist)"
- "tired of your arms? 3 new models in stock."
- "is your spine up to date? 1 in 4 runners are running last year's firmware."
- "MEDIX CHROME CLINIC: walk in human, walk out 30% faster. financing available."
- "subscription reflexes: first month free. cancel anytime (reflexes stop working)."
- chumbox style: "she replaced her hands. you won't believe what she does now" / "7 implants that are
  secretly spying on you (#2 is your heart)"

## Gambling ads (the user, 2026-10-22)

The sports-betting / online-casino kind: loud, "free bonus", tiny fine print. Natural sponsors: LUCKEEZ
CASINO, BIDBLITZ LIVE, PLAYBALL, CHUCK E. CACHE'S. *(Claude)* the fine print could be a running gag
(`must be 18+. odds not real. nodes may be ICE.`), and the ad could offer an actual bet (ties to LET IT RIDE
and the debt idea).

*(Claude)* drafts:
- "NEW RUNNERS: bet 10cr, get 500cr in bonus bets!*" (`*bonus bets are not credits.`)
- "parlay your next 3 layers. 1 in 4,096 odds. feeling lucky?"
- "LUCKEEZ: deposit match up to 1000cr. your first loss is on us. so is your second."
- "boosted odds: the real node is in the top row (+340)"
- "live in-layer betting is HERE. bet on yourself. bet against yourself."
- "risk-free boss bet! (risk not free)"
- "PLAYBALL SPORTSBOOK: same-game parlay on your own death"
- "this runner turned 5cr into 12,000cr. you could too.*"
- "spin the wheel every day for FREE FIREWALLS"
- "gambling problem? call 1-800-ICE-HITS. (it's a betting line.)"
- fine print bits: "past nodes do not predict future nodes." / "the house is OMNI." / "debt available."

## Ad ideas

- *(Claude)* **MEGAMART:** "everything you need. nothing you asked for."
- *(Claude)* **BURGERTRON:** "now with 30% more meat-adjacent product."
- *(Claude)* **RYDR:** "your driver is 2 minutes away. he has been 2 minutes away for an hour."
- *(Claude)* **STREAMFLIX:** "are you still watching? we are."
- *(Claude)* **SEEKR:** "we found what you were looking for. we also found everything else."
- *(Claude)* **LUCKEEZ CASINO:** "the house always wins. you could be the house. (you can't.)"
- *(Claude)* **NIMBUS WEATHER:** "100% chance of forecast."
- *(Claude)* **MEDIX:** "side effects may include: side effects."
- *(Claude)* **LEDGER TRUST:** "your balance is our business. your debt is our pleasure." (ties to the debt idea, SPEC §16f)
- *(Claude)* **The dating corp** (idea in SPEC §17): "someone in your area wants to breach you."
- *(Claude)* **OMNI//CORE:** "you shouldn't be here. but since you are: try OMNI premium."
