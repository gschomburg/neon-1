# NeoN+1 music

Every music note in one place (compiled 2026-10-24 from SPEC.md, the meat notes and the code). SPEC.md's
version log still has the history of each change; plans and ideas for the music live here now.

## What's built

**How it's made:** generated live with Web Audio, no audio files (like 1TD's music). Retro 80s synthwave:
detuned "supersaw" pads, sawtooth / square bass through a low-pass filter, synthesized drums (kick, snare,
hats from noise bursts and pitch drops) with a sidechain-style pump on every beat, arpeggios into an echo, a
lead for bosses. Code: `engine/music.js` (the engine), `data/music.js` (scales, the shared tracks, `MUSIC_FOR`),
and each corp file in `corps/` carries its own track.

**The tracks:** 81 in all: 3 shared ones plus one per corp (78). They have their own names, separate from
where they play; `MUSIC_FOR` assigns them (one line to move a track).

| Track | Style | Plays for |
|---|---|---|
| NIGHT RAIN | 64 bpm, E minor, ambient (no drums): long pad swells, a low brass-like swell, sparse bells into a long echo. Blade Runner-ish | title + every menu screen, game over |
| GRIDLOCK | 96 bpm, A minor, four-on-the-floor | the map, markets, caches, safehouses, CORP BREACHED |
| MELTDOWN | 112 bpm, D harmonic minor, heavy gallop | OMNI//CORE |
| (one per corp) | e.g. CONCRETE MARCH (Perimeter, marching snare), VELVET HEX (Sigil, phrygian half-time), OVERDRIVE (Chronos, ticking hats), GLASS ECHO (Mirrorline, ping-pong arp); 6 corps use the ambient style too | inside that corp |

**The engine:** every track is the same engine with different settings: tempo, key, scale, chord
progression, echo, and picks from a few patterns: 4 drum patterns (four, march, half, heavy), a handful of
bass patterns (eighths, offbeat, gallop...) and one shared lead melody (`LEAD_DEGREES`).

**It reacts to the game:**
- **Layers build up inside a corp:** layer 1 = pad + bass, 2 = + drums, 3 = + arp, boss = + lead and a bit
  faster, final boss = a louder lead.
- **Urgency** (Chronos and other clock corps): the clock pushes the tempo, opens the filter, doubles the
  hats; boss misses add more.
- **Low integrity** adds a heartbeat.
- **Boss beaten: the music powers up** (three beats faster and a little higher, a ding climbing the chord, a
  brass fanfare with timpani and a crash, then silence, then the next track fades in).
- **You die: the music powers down** (three beats slower with the pitch sagging, three falling dings in the
  key of the corp you died in, a low power-off tone), with a separate collapse sound under the falling screen.
- **Corp effects:** slow motion (`def.slowmo`: the music slows and drops in pitch, BULLET TIME), and
  `Music.focus()` muffles it (DECIBEL, STETHOSCOPE: the music clears near the real node).
- Tracks cross-fade between screens.

**The music tool: `tools/music.html`** (2026-10-24). Open it in Chrome from the repo. Every track in a sortable,
filterable list (tempo, key, groove, bass, arp, where it plays); click one to play it, and push it like the game does
(level 0-4, urgency, heartbeat, the boss-win / game-over tests). For narrowing down: tag each track keep / maybe /
cut with a note (kept in the browser), then **copy the list** to paste into a chat. It loads the game's own music
files, so it always plays what the game plays; `tools/bump.js` keeps its list of corp files in step.

**Controls:** music and effects each have on/off and a volume bar (settings and the pause menu); N = music,
M = effects. The **dev music player** (dev menu `[music player]`) lists every track (shared ones first, then
the corps in order), shows where each plays, and can push one like the game does: level 0-4, urgency,
heartbeat, `[ boss win ]`, `[ game over ]`.

## Plans

### The music engine pass (noted 2026-10-20)
All the tracks blur together because they share so few patterns. Upgrade the engine rather than the tracks:
- **A melody of its own for each track** (a short motif in the song data, in place of the shared lead).
- **More grooves:** swing, breakbeat, half-time trap hats, a waltz in 3. *The user, 2026-10-21:* start with
  the beat: different grooves and time feels per corp, not just tempo; today it all sits on the same beat.
- **New instrument sounds:** organ, pluck, chiptune square, bell.
- **Fully custom tracks first for a handful of corps:** the signature ones, the final bosses, BONEYARD.

### Fewer, better tracks (the user, 2026-10-23)
Clean up the tracks; not every corp needs its own. Maybe:
- **8 main tracks**, with corps varying off one of them (key, tempo, a layer).
- **About 8 specialty tracks** for bosses and the higher-level corps.
- **2 tracks for corps with timers.**
- **A title track**, and maybe an **overworld (map) track**.

### Smaller ideas
- **Music per sector** (SPEC §17): sector 2+ shifts the music (key / tempo up, an extra layer) so you can
  feel the progress.
- **Sound for the boot intro** (SPEC §16f, the intro follow-ups): a modem handshake / dial-up screech under
  the boot log, key clicks as the login types, a beep per `ok` (a buzz on `FAIL`), a chirp on
  `handshake complete`, the title theme fading in. The catch: browsers block audio until the first tap or key,
  so the first boot plays silent (the fix: open on `>_ press any key to connect`).
- **A music tool outside the game: BUILT** as `tools/music.html` (above). The original note (the user, 2026-10-24, meat notes): a music preview tool in a NeoN+1 tool
  suite (with asXii and the palette editor), so the music player doesn't all live inside the game. Music is
  the one thing that seems better out of the game. (Today's dev music player would move there.)

## Inspirations

Retro, synthy, 80s, without copying anything.
- **Since the start:** Kavinsky-style synthwave; Blade Runner for the menu track.
- **The user, 2026-10-23:** anything electronic or synthy: Daft Punk's *Tron: Legacy*, Arcade Fire, Kavinsky,
  Goblin, Blade Runner, a little Skrillex, Ladytron, The Album Leaf, Nine Inch Nails, Pixel Grip.
- **The user, 2026-10-24 (meat notes):**
  - Robyn.
  - A pirate theme / sea shanty, like *Monkey Island*'s.
  - A Lemonheads dance intro the user remembers, which might have been Moby. *(Claude: not sure which track
    this is; worth pinning down before using it as a reference.)*
  - **Amiga demo / cracktro intros:** https://www.youtube.com/watch?v=h15llbLw9Oc (ties in with the Amiga /
    oldskool logotype styles in NAMES.md, and with the boot intro).
