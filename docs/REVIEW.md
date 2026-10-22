# Greg's review list

Things Claude built or decided that need your eyes. Tick one off (`[x]`) when you've looked, or
leave a note under it for Claude. Newest at the top. (Claude adds to this list; the backlog of things
to build stays in `docs/SPEC.md` §16f.)

## Open

- [ ] **Logotype round 4: oldskool / Amiga styles** (2026-10-22). Five takes on NeoN+1 after your references
  (Blue System, Paso's Ice Cream): open `docs/art/logotype_round4.png` (text in `docs/NAMES.md`, round 4). Pick
  favorites / mix and match; then the title can cycle between the face and the logotype.

- [ ] **Rarity chips** (v12.01). Every mod and item now shows its rarity as a light chip (dark text on the rarity's key
  color), the same in every palette: tray badges and item names, market / rewards / codex lists, and the RARE /
  EPIC words in text. Selected badges invert; EXOTIC letters cycle through all the chips. The chip colors are in
  the palette editor's "rarity chips" tab. Look at the tray, a market, the codex, and a light palette.
  - Watch the COMMON chip (dark text on light grey): grey can read as "disabled". Items you can't use right now
    (most items on the map) are plain grey with no chip, on purpose. If usable common items still look off,
    try a brighter or slightly tinted common in the rarity chips tab (it changes everywhere at once).

- [ ] **Upload `preview.png` to the root of gregschomburg.com/br/** (v12.00), above the version folders, once.
  Every version's link preview points at `https://gregschomburg.com/br/preview.png`. It's `dist/preview.png`
  (the title art and a pitch, no build number, so it never goes stale). Then paste a game link in a chat
  to see the card.
- [ ] **v12 on the web host** (v12.00). The game is now a folder: upload all of `dist/` (`engine/`, `data/`,
  `corps/`, the icons and `preview.png`, not just index.html). If a file is missed or a phone has an old copy,
  the title shows a red warning naming the file. Your v11 save should carry over on first load.
- [ ] **Link preview and icons** (v12.00): `dist/preview.png` (shows "v12.00"; Claude can re-render it any
  time), `dist/icon.svg` (tab icon) and `dist/icon-180.png` (phone home screen).

- [ ] **INFO page wording** (v11.05). Tap the version tag in the footer (`neon+1 v11.05 [?]`). Credits:
  "idea and design: greg: the original idea, the game, the corps and their tells, and the playtesting",
  built with Claude in Claude Code, "started from One True Door (an earlier game, also made with
  Claude) as the reference", made in 2026, a GitHub button. Change anything you like.
- [ ] **Multiplayer join box and share link, on a real room** (v11.04; share fixed in v11.06). Your first try:
  `[ SHARE LINK ]` on the local file crashed the Chrome tab ("Aw, Snap!"): Chrome's desktop share dialog.
  Now the share sheet only opens on phones on the web; on a computer the link is copied (from a local file
  it says the link only works on that computer). Quick retry after the fix: the copied link looked right;
  a full test (joining from a second device) is still to do. Not tested live (it needs
  Firebase and two players). Host on one device, then on another: type the code in the box and
  press Enter; and try `[ SHARE LINK ]` from the lobby (phone share sheet / copied link, which opens
  straight into the join).
- [ ] **PROFILE and CORP BREACHED logo block** (v11.04). Logo + name (+ stats on PROFILE) now sit on
  your color style's background as one block, with the PROFILE controls under the card.
- [ ] **The in-game header still says `BETA_RUNNER`.** Switch it to NeoN+1?
- [ ] **The new corps: CIPHER, HYDRA, BLACKOUT** (v11.00). Tells, bosses, mods (PARITY, HEADCOUNT,
  FLARE) and difficulty were Claude's calls (measured about x2 over blind). Their map letters
  `{` `(` `5` are placeholders (the 3-letter map codes on the backlog would replace them). Their
  palettes land close to others (CIPHER ~ CLONEWORKS, BLACKOUT ~ TOLLGATE).
- [ ] **Palette pass** (palette editor, v11.03). 40 palettes have warnings: hard-to-read secondary
  text, accent = money in 14 corps, look-alike pairs. BASIC, PARCELNET, MOCHI, CHRONOS and MIRRORLINE
  now wear the old player palettes; their old looks are in each palette's note (and git) if you want
  any back.
- [ ] **Title screen** (v11.00). The #15 lockup with the build number and `N e o N + 1`, circuit
  traces, and pulses running out from the head. Dev menu `[ title pulse: COLOR / CHAR / BOTH ]` to
  compare the spark styles. Next idea to try: traces in from the left, out the right.

## Done

(nothing yet)
