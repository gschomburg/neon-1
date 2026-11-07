# Corp hooks

Every key a corp definition (`CORPS.key = { ... }` in `dist/corps/key.js`) can have. Call a hook from the engine
with `corpHook('name', ...args)`, test one with `corpHas('name')`, read a flag with `corpFlag('name')`
(engine/corps.js): they count only in a real corp visit, not on the public net's start node.

`tools/check.js` fails on a corp key that isn't listed here (a misspelled hook does nothing, silently). Adding a
new hook: add it here, in the right section, with where the engine calls it.

## Who it is
| key | what |
|---|---|
| `key`, `name`, `code`, `level` | its id, display name, 2-letter map code, level (the map's SK1, BR5) |
| `letter` | a symbol instead of a code (OMNI, the public net, the heaven corps) |
| `intel` | its one-line pitch on the map |
| `rules()` | its rules line on the map (a function: it can depend on the tier) |
| `bossDesc` | what its boss does, on the map |
| `mods` | its boss mods (keys in data/mods.js, the reward's corp pick) |
| `gear` | `{ key, tier, n }`: boss gear as the corp pick instead of a mod |

## Its layers
| key | what |
|---|---|
| `tell`, `bossTell` | the built-in tell (engine/layers.js), and the boss layer's own |
| `alwaysFollow` | the tell is always true |
| `counts(tier)` | its own node counts per layer (default: tier + 1 + layer) |
| `nodes` | more (or fewer) nodes per layer than the default |
| `timer`, `pay` | a clock per layer (seconds) and a pay multiplier |
| `bossDmg` | how much its boss hits for |
| `noLoot` | no $ nodes |
| `dress(lv, k)` | sets up a layer: glyphs, state on `lv` (k: rng, tiles, real, tellTile, tier, boss, carry, seed...) |

## While a layer is up
| key | what | called from |
|---|---|---|
| `intro(lv, c)` | an animation before you can pick (MONTE's shuffle) | run.js enterLayer |
| `layerMsg(lv, c)` | its own line as the layer opens | run.js enterLayer |
| `tick(lv, t, dt, now)` | every frame | run.js |
| `hint(lv, now)` | the hint line `{ text, col }` | scene.js |
| `progLabel(c)` | its own progress label in the header | scene.js |
| `money` | its own word for credits on the HUD | scene.js |
| `noOdds` | don't show the odds | scene.js |
| `action(lv)` | a button on the board: `{ label, ok, use }` | scene.js |
| `onEnter(c)` | when the corp starts (not on a resume) | run.js startCorp |

## Drawing
| key | what |
|---|---|
| `fx(t, live, lv, i)` | per node: `{ glyph, gc, dim, dx, kern, frame, clip... }` |
| `draw(put, lv, now)` | its own drawing on the board |
| `overlay(ctx, lv, now)` | drawing over the board (G0D MAZE: b0y) |
| `band(lv, now)`, `bufferAt(lv, now)` | a band / the buffer line on the board |
| `marks(lv, now)` | extra marks on the board |
| `cellLabel(lv, cell)` | a label in an empty cell |

## Taps and hits
| key | what | called from |
|---|---|---|
| `intercept(i)` | takes a tap before anything else; true: handled | run.js |
| `onPick(t)` | every tap, before the reveal (TOLLGATE's toll) | run.js |
| `tap(t, i)` | its own pick rules; true: handled (the engine does nothing else) | run.js |
| `cellTap(cell)` | a tap on an empty cell | input.js |
| `boardTap(cx, cy)` | a tap anywhere on the board (CERBERUS digging); true: handled | input.js |
| `block(t, lv)` | an ICE hit it stops: returns the message | run.js |
| `hitDmg(t, lv)` | how much an ICE hit costs | run.js |
| `onHit(t)` | after an ICE hit, after your mods | run.js |
| `afterHit(t, lv)` | after a hit, async (MONTE, GRAVITAS move) | run.js |
| `onSafe(t, lv)` | the real node found | run.js onSafe |
| `onClear(c)` | the corp beaten; can return a message | run.js finishCorp |
| `reward(c)` | its own reward screen instead of the normal one (G0D MAZE) | run.js finishCorp |
| `clockOut()` | the clock ran out: its own outcome (G0D MAZE) | run.js |
| `onGear(key, lv)` | a gear used here: truthy if the corp did its own thing (GRAVITAS's TILT, ENTROPY's SHAKE) | active.js |

## Flags the engine handles for one corp each
These work, but each is engine code for one corp (docs/ARCHITECTURE.md: a general hook would be better).
| key | corp | what |
|---|---|---|
| `flip` | UPSIDE | the screen is upside down |
| `cipher` | CIPHER | the screen is enciphered |
| `dark` | BLACKOUT | the lights dim |
| `faith` | THE CHOIR | a pay bonus on faith |
| `surge` | RYDR | pay grows as the clock runs down |
| `shot` | COLDBREW | the clock shortens each layer |
| `tickets` | CHUCK E. CACHE'S | pays in tickets |
| `bossFlash` | SIGIL | the boss's glyphs flash then hide |
| `bossShrink` | CHRONOS | the boss's clock shrinks with misses |
| `maskMs` | FORGET-ME-NOT | glyphs go face down after this long |
| `slowmo` | (BULLET TIME) | the game runs slow |
| `drag` | hot and cold corps | taps by dragging |
| `moves` | moving corps | nodes move (ANCHOR stops them) |
| `musicMax` | SIMON | the music's level never goes above this (engine/boot.js) |
| `doors` | MONTY | the first tap picks a door: ICE EATER is off (MOD_OFF), ZOMBIE's weak taps don't crack |
| `pattern` | SIMON | taps play a pattern back: ICE EATER is off (MOD_OFF), ZOMBIE's weak taps don't crack |
| `marks` | | see Drawing |
