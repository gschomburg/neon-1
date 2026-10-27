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

**The engine upgrade, phases 1 and 2 (2026-10-24):** a track can now pick its band. All optional; a track that
doesn't set them sounds exactly as before (every game track today).
- **Bass sound** `bassVoice`: saw (the original), acid (squelchy 303), sub (deep sine), pluck, picked. `bassOct`: every
  other bass note an octave up.
- **Pad** `padVoice`: saw (the original), glass, organ (drawbars), choir (vowel-ish), none.
- **Arp sound** `arpVoice`: square (the original), chip (a thin 12.5% pulse: Amiga / Game Boy), bell, pluck, glass.
- **Lead** `leadVoice`: square (the original), chip, bell, brass, dist (distorted).
- **Drum kit** `kit`: synth (the original), 808 (boomy kick, clap), chip (8-bit), industrial (distorted kick, metal),
  break (tight and live-feeling).
- **Grooves** (`drums`): four, march, half, heavy (the originals), plus disco (open hats, clap), two (two-step), break,
  trap, waltz (3/4), shanty (6/8). Bass patterns (`bass`): plus syncopated, acid, sparse, waltz, jig.
- **Meter** `meter`: 4 (4/4), 3 (3/4, a waltz), 6 (6/8, the shanty lilt; the bpm counts the two big beats).
- **Swing** `swing` 0-0.5 (pushes every second 16th late), **pump** `pump` 1 (full sidechain) .. 0 (none).
- In the music tool: **"try another band"** swaps any of these on any track, live, and **"copy track"** copies the result
  as a line of code. **9 engine demos** (marked *demo*, only in the tool) show the range: ACID RAIN, CRYPT ORGAN, CHIP
  RUNNER, RUST BELT, SEA LEGS (6/8), ORBIT CLUB (disco), BROKEN SIGNAL, CLOCKWORK WALTZ (3/4), TRAP DOOR.
**Phase 3, the written parts (2026-10-24):** a track can carry its own parts, one token per 16th (a number is a
note, `-` holds it, `.` is a rest; a list of bars plays in turn). All optional, details at the top of `engine/music.js`:
`melody` (the track's hook, from level `melodyAt`, doubled for bosses), `bassLine` (a riff), `arpLine`, `beat` (its own
drum pattern, `x...x...`), `stab` (chord stabs, `stabVoice`), `gate` (a chopped pad), `breakdown` (every n-th time
through the chords the drums and bass drop out), `sevenths`. New voices: **keys** (electric piano), **vox** (an "ah"
choir), **saw** (a supersaw lead). **Sections and fills (v13.17, 2026-10-25):** one time through the chords is a *pass*. A track can add a `B: {...}`
(also C, D) with anything that should change on B passes (chords, melody, beat, bass, voices; not meter or bpm), and
`form` sets the order (`'AABA'` by default). **Fills** are automatic on every track with drums: the last beat of every
second pass, and of the pass before a new section, becomes a snare roll, a tom run or a kick-snare pickup (taking
turns), landing on a crash. `fills: false` turns them off, `fill: { snare: '...' }` writes your own (the whole last
bar). Tracks with their own roll (march, shanty) keep it, and nothing fills into or out of a breakdown. B sections so far:
HOLLOW (a sung chorus on C D Em), DANCE ALONE (the chorus, up on B C# D), LIGHT CYCLE (a half-time bridge), NIGHT
DRIVE (climbing chords, played A A B). Still to come: the tool as a full editor.

**10 new tracks (2026-10-24), one per inspiration**, in `data/music.js`, not playing anywhere yet (the user picks):
| Track | Inspired by | What makes it |
|---|---|---|
| LIGHT CYCLE | Daft Punk, *Tron: Legacy* | 128 bpm D minor, 16th octave bass, gritty staccato riff, brass hits |
| MACHINE HEART | Nine Inch Nails | 104 bpm E phrygian, industrial kit, chugging riff, lonely piano, breakdowns |
| NIGHT DRIVE | Kavinsky, *Nightcall* | 92 bpm F minor, the big pumping pad, a long supersaw line |
| RED DEEP | Goblin (*Suspiria*, *Profondo Rosso*) | 120 bpm A harmonic minor, bass ostinato, church organ, music box |
| ANTHEM | Arcade Fire | 128 bpm G major, driving eighths, organ, glockenspiel, a "whoa-oh" chant |
| DROP ZONE | Skrillex | 140 bpm half-time, wobbling acid bass, screaming lead, breakdown before the drop |
| DEADPAN | Ladytron | 124 bpm electroclash, deadpan line, gated pad, octave-bouncing bass |
| SLOW TIDE | The Album Leaf | 84 bpm C major, electric piano, glockenspiel, brushed beat with swing |
| DANCE ALONE | Robyn, *Dancing On My Own* | 118 bpm, pulsing eighth-note chords, four on the floor, claps |
| TRACKER | Moby ("ah-ah") + Amiga cracktros | 136 bpm breakbeat, "ah-ah" vocal stabs, chip melody, chip arpeggios |
| HOLLOW | Evanescence (added after, v13.14) | 90 bpm, E minor; light at first (choir pad, sub bass, a piano figure from level 0), then half-time rock drums, chugging saw chords and a glass line; the piano doubles for bosses; every 4th pass drops to piano alone |
**Three more (v13.16, 2026-10-25)**, no variations (the user): LOOK BEHIND YOU on PLAYTIME (1) and LUCKEEZ (2), VELVET ROPE on CHANNEL 9 (3, a timer) and TWINLINK (4, can be a sector boss), DOWNWARD on CLONEWORKS (2) and BLACKOUT (3). Their old tracks (WIND IT UP, LUCKY STREAK, BREAKING, PLUS ONE, MITOSIS, POWER CUT) stay in the files, unused.
| Track | Inspired by | What makes it |
|---|---|---|
| LOOK BEHIND YOU | *Monkey Island* | 104 bpm E minor, one-drop reggae drums with swing, an organ skank on the off-beats, a walking plucked bass, a steel-drum-ish bell tune |
| VELVET ROPE | Pixel Grip | 122 bpm A minor darkwave, four on the floor, a sequenced 16th bass, a gated pad, a deadpan "vox" line that sits on one note |
| DOWNWARD | Nine Inch Nails (*Closer*, *The Downward Spiral*) | 96 bpm D phrygian, a slow mechanical groove, a squelching acid bass, a stuttering gated pad, a distorted lead that keeps falling, breakdowns |

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

**The editor: `tools/neon_editor.html`** (v13.17, 2026-10-25): the music tool and the palette editor in one page. The game
runs on the left; MUSIC and PALETTE are the two modes up top. In MUSIC the list starts on the corps (sorted by level):
pick one and the game shows one of its layers in its own palette *and plays its track itself*, so what you hear is what
the game plays. The level buttons pick how much of the band plays (0-4), or "game" (what the screen gives it). Up /
down walks through the corps. Everything else works as in the music tool below (stars, tags, notes, the tracks view,
try another band, assignments); changes are remembered in the browser and copied out for Claude, and the game frame
gets them live. The stars, notes and changes are shared with the old music tool (same browser storage). The old
`music.html` and `palette_editor.html` stay for now.

**The music tool: `tools/music.html`** (2026-10-24). Open it in Chrome from the repo. Every track in a sortable,
filterable list (tempo, key, groove, bass, arp, where it plays); click one to play it, and push it like the game does
(level 0-4, urgency, heartbeat, the boss-win / game-over tests). For narrowing down: tag each track keep / maybe /
cut with a note (kept in the browser), then **copy the list** to paste into a chat. It loads the game's own music
files, so it always plays what the game plays; `tools/bump.js` keeps its list of corp files in step.

**Families and the corps view** (2026-10-24). The list shows how each track is **made**: "written" (its own
melody / riff / beat), "recipe" (the engine builds it from picks: bass, drums and arp patterns, scale, chords), or
ambient. **family / like** names the closest other track and what they share. Recipe tracks with the same bass,
drums, arp and scale are one family (the same song in another key and tempo; GRIDLOCK ×6 is the biggest). A track
made from another one carries `from: 'thatkey'` and joins its family. The **corps** view lists every place a track
plays, flags the ones whose track is cut or 1 star ("needs a track"), and has a picker to change it (plays right
away, kept in the browser); **copy assignments** hands over the `MUSIC_FOR` lines.

**Controls:** music and effects each have on/off and a volume bar (settings and the pause menu); N = music,
M = effects. The **dev music player** (dev menu `[music player]`) lists every track (shared ones first, then
the corps in order), shows where each plays, and can push one like the game does: level 0-4, urgency,
heartbeat, `[ boss win ]`, `[ game over ]`.

**GRAVE ROBBER** (v13.25, 2026-10-25, the user: "inspired by the halloween theme... some sort of creaky door opening...
owl hoots"). Key `graverobber` in data/music.js (not `graveshift`: that's BONEYARD's old GRAVE SHIFT). It plays in
place of the map track while you hold the GRAVE ROBBER mod (engine/boot.js, `GRAVE_TRACK`); corps keep their own.
5/4 (new: `meter: 5`, 20 steps a bar, parts written 20 tokens long), 150 bpm, F# harmonic minor. A high piano
figure (3 + 3 + 4 eighths, its own notes) never stops while the chords move under it (i, i, VI, V); the B section
drops the bass a half step under the figure (F under F#), thins the drums, and an owl calls. Form AABA.
**Sound effects in tracks** (new): `creak` and `owl` are patterns like `stab` ('x' = one), from level `sfxAt`.
The creak is a low saw gliding up through a narrow band, chopped unevenly (the hinge sticking and slipping) over
~2s; the owl is four soft sine hoots (hoo, hoo-hoo, hooo) pitched to the track's root, panned, into the echo. Here
a door creaks every other time through.

**Music View** (2026-10-25): `tools/music_view.html`, a sequencer-style look inside one track (the music tool links
to it). A piano roll per part (melody, arp, stabs, pad, bass, drums, sound fx), each in the numbers the track is
written in: melody in degrees from the root, bass in steps from the chord root, arp in chord tones 0-5. On top: the
chords (roman numerals and names) and the form as a strip of passes, lettered by section, with fills and breakdowns
marked; click a pass to jump there, loop it, or switch to the song view (every pass left to right). Parts the
engine makes itself (patterns, the stock boss lead, fills) are drawn hollow; parts above the current level are
dimmed. Mute / solo per part and per drum row, a playhead, levels 0-4 and urgency like the game. It uses four
small hooks in engine/music.js (`Music.position / mute / seek / loop`) that the game never calls.
`node tools/music_view_check.js` proves the view matches the engine. Plan and what's next: docs/MUSIC_VIEW.md.

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
- **The engine demos go to new corps** (the user, 2026-10-25): ACID RAIN, CRYPT ORGAN, CHIP RUNNER, RUST BELT, SEA
  LEGS, ORBIT CLUB, BROKEN SIGNAL, CLOCKWORK WALTZ are pocketed: when a new corp is built, give it one of these
  (not the existing corps; the music is in a good place, the user says).
- **Music per sector** (the archived SPEC §17 (docs/archive)): sector 2+ shifts the music (key / tempo up, an extra layer) so you can
  feel the progress.
- **Sound for the boot intro** (the archived SPEC §16f (docs/archive), the intro follow-ups): a modem handshake / dial-up screech under
  the boot log, key clicks as the login types, a beep per `ok` (a buzz on `FAIL`), a chirp on
  `handshake complete`, the title theme fading in. The catch: browsers block audio until the first tap or key,
  so the first boot plays silent (the fix: open on `>_ press any key to connect`).
- **A music tool outside the game: BUILT** as `tools/music.html` (above). The original note (the user, 2026-10-24, meat notes): a music preview tool in a NeoN+1 tool
  suite (with asXii and the palette editor), so the music player doesn't all live inside the game. Music is
  the one thing that seems better out of the game. (Today's dev music player would move there.)

## The user's ratings (2026-10-24, first listen in the music tool)

- **5 stars:** NIGHT RAIN (title + menus), GRIDLOCK (map), OVERDRIVE (CHRONOS).
- **4 stars:** VELVET HEX (SIGIL), CAST ON (PURLWISE), VITALS (MEDIX). CAST ON and VITALS with the user's own new-band
  mixes, now in the game: CAST ON in 6/8 (shanty groove, jig bass, swing 0.46, 136 bpm); VITALS with the break groove,
  industrial kit, sub bass and a bell arp going up and down.
- **3 stars:** PLAIN TEXT (BASIC), QUERY (SEEKR), MITOSIS (CLONEWORKS), CONVEYOR (PARCELNET), FORGET (FORGET-ME-NOT),
  PIKO PIKO (MOCHI MOCHI), NEWS DESK (HEADLINE), FALLOUT (HALFLIFE), INSERT COIN (CHUCK E. CACHE'S), SLOW MOTION
  (BULLET TIME), and **all 9 engine demos** (the user likes the variety, though they all carry the same tune: phase 3).
- **2 stars:** LOW PRESSURE (NIMBUS), QUIET PLEASE (DEWEY), GRAVE SHIFT (BONEYARD).
- **1 star:** the other 61 corp tracks, and MELTDOWN (OMNI//CORE).
- None tagged keep / maybe / cut yet.
- **Round 2 (2026-10-24): the cut.** The user cut 64 tracks: all the 1-star corp tracks, MELTDOWN, QUIET PLEASE (2 stars)
  and the TRAP DOOR demo. They're gone from the files (git has them). The 62 corps that lost their track play the map
  track (GRIDLOCK) until they get a new one: `trackFor()` in engine/music.js; the music tool's corps view lists them as
  "needs a track". OMNI//CORE now plays DROP ZONE.
  New tracks rated: 5 stars MACHINE HEART ("good for slow corp"), DROP ZONE ("boss"), DEADPAN, DANCE ALONE; 4 stars LIGHT
  CYCLE ("boss or race"), RED DEEP ("spooky"), ANTHEM; 3 stars NIGHT DRIVE, SLOW TIDE ("super slow"), TRACKER. VITALS
  went up to 5 stars. Kept from before: NIGHT RAIN, GRIDLOCK, OVERDRIVE, VELVET HEX, CAST ON, VITALS, the 3-star corp tracks,
  LOW PRESSURE and GRAVE SHIFT (2 stars), and 8 engine demos (3 stars). HOLLOW (v13.14) isn't rated yet.
- **Round 3 (2026-10-24, v13.15): building back up.** Every new track went to its best corp (the user's notes), then
  55 variations filled the other corps: each made `from:` one of the 12 (the same band and groove, its own melody, key,
  tempo and chords), written in the corp's own file. Spread so every family plays somewhere at levels 1-2. DANCE ALONE
  took MOCHI MOCHI (PIKO PIKO moved to BYTEPETS), SLOW TIDE took NIMBUS, TRACKER took SEEKR, RED DEEP took BONEYARD, so
  QUERY, LOW PRESSURE and GRAVE SHIFT play nowhere now. OMNI//CORE: DROP ZONE.
  - **HOLLOW** (5): DEWEY SYSTEMS (L2): HOLLOW **(the original)**; DEEP FREEZE (L4): DEEP FREEZE; PING (L3): PING; VESPERS (L3): VESPERS; FAR SIDE (L5): FAR SIDE
  - **DANCE ALONE** (5): PIKO PIKO (L1): DANCE ALONE **(the original)**; BE THE BEAT (L3): BE THE BEAT; LUCKY STREAK (L2): LUCKY STREAK; LIKE ME (L3): LIKE ME; PLUS ONE (L4): PLUS ONE
  - **SLOW TIDE** (6): REFLECTION (L2): REFLECTION; LOW PRESSURE (L1): SLOW TIDE **(the original)**; MOSS (L3): MOSS; PLEASE HOLD (L3): PLEASE HOLD; LIGHT LEAK (L3): LIGHT LEAK; SIX AM AGAIN (L5): SIX AM AGAIN
  - **TRACKER** (5): QUERY (L1): TRACKER **(the original)**; HANDSHAKE 56K (L2): HANDSHAKE 56K; LINE CLEAR (L3): LINE CLEAR; BAD SECTOR (L5): BAD SECTOR; CRACKTRO (L4): CRACKTRO
  - **DEADPAN** (6): PRICE CHECK (L1): PRICE CHECK; HAUTE//COUTURE (L2): DEADPAN **(the original)**; DEFINITION (L3): DEFINITION; SANS (L3): SANS; NEURAL (L4): NEURAL; HELLO YOU (L5): HELLO YOU
  - **DROP ZONE** (5): ESPRESSO (L2): ESPRESSO; SWARM (L3): SWARM; BREAKING (L3): BREAKING; CHAOS THEORY (L4): CHAOS THEORY; REDLINE (L5): REDLINE; OMNI//CORE: DROP ZONE **(the original)**
  - **ANTHEM** (6): ORDER UP (L1): ORDER UP; THAT'S NUMBERWONG (L4): THAT'S NUMBERWONG; WIND IT UP (L1): WIND IT UP; GOING UP (L3): GOING UP; SOLD! (L3): SOLD!; PLAYBALL (L5): ANTHEM **(the original)**
  - **RED DEEP** (6): SPECIMEN (L3): SPECIMEN; RETROGRADE MOON (L2): RETROGRADE MOON; GRAVE SHIFT (L3): RED DEEP **(the original)**; VENDETTA (L3): VENDETTA; HEAT SIGNATURE (L4): HEAT SIGNATURE; POWER CUT (L3): POWER CUT
  - **NIGHT DRIVE** (6): RYDR (L2): NIGHT DRIVE **(the original)**; EXACT CHANGE (L2): EXACT CHANGE; STILL WATCHING (L3): STILL WATCHING; RUSH HOUR (L4): RUSH HOUR; RAIN ON GLASS (L4): RAIN ON GLASS; INVERTED (L5): INVERTED
  - **MACHINE HEART** (6): FORTIFY (L1): FORTIFY; in reading order (L4): IN TRIPLICATE; EXOSKELETON (L3): EXOSKELETON; IMPACT (L4): IMPACT; AEGIS DEFENSE (L4): MACHINE HEART **(the original)**; TWO MORE HEADS (L3): TWO MORE HEADS
  - **LIGHT CYCLE** (6): BALANCE SHEET (L2): BALANCE SHEET; KERNEL (L3): LIGHT CYCLE **(the original)**; HIGH VOLTAGE (L2): HIGH VOLTAGE; ON CAMERA (L3): ON CAMERA; SHELL GAME (L4): SHELL GAME; ESCAPE VELOCITY (L5): ESCAPE VELOCITY
  - **CAST ON** (4): DRY DOCK (L2): DRY DOCK; PIECES OF EIGHT (L2): PIECES OF EIGHT; CAST ON (L2): CAST ON **(the original)**; BOARDWALK (L3): BOARDWALK

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
