# greglytics: plan

A small, generic events + leaderboards service for Greg's projects (neon first, then asXii and whatever comes next).
Lives in this repo for now (like asXii), to be broken out later. Started 2026-10-24.

## Why

- See how people play (which corps end runs, which mods get taken...) without Google, and without anything gross.
- Online leaderboards (daily / all time) for neon, and any other project that wants one.
- One service for every project: each sends its own **app** name (`neon`, `asxii`, ...).

## Where it runs

- **DreamHost shared hosting**: PHP + MySQL, on its own domain (not the games' domains). Shared hosting runs PHP
  per request only (no always-on programs), which is all this needs.
- The games call it **cross-domain**, so the server sends CORS headers for each app's allowed sites.
- **Local testing without PHP set up**: the game, opened from a file or from localhost, sends to the live service
  and its data is marked **dev** (kept apart from the real numbers). The PHP also runs locally on SQLite
  (`php -S localhost:8080`), for working on the service itself.

## Not gross

- No cookies (except the admin dashboard's login), no names beyond what a game generates (neon's handles), no stored
  IP addresses (only a salted daily hash, briefly, to limit spam).
- An anonymous random id per device (in localStorage), a session id per page load.
- Each game says what it sends (an INFO line) and has an off switch (`optOut`).
- Ad / tracker blockers: addresses avoid words they block (`analytics`, `track`, `collect`, `stats`, `pixel`...):
  the API is `/api/e.php` and `/api/scores.php`, the dashboard is `/admin/`.

## Data

Two tables (MySQL or SQLite), times as Unix seconds:

- **events**: id, app, dev (0/1), at, device, session, version, name, data (JSON text)
- **scores**: id, app, dev, board, at, device, player, logo, score, tie, data (JSON text)
- (**hits**: a spam limit per hashed IP per minute; old rows are cleared as it goes)

A game's events are whatever it wants, e.g. neon's `run_end` `{seed, daily, sector, layers, mods, end: "died",
corp: "SIGIL", layer: 3}`. A **board** is just a name a game picks: `daily-2026-10-24`, `all`, `naked`...

## API

- `POST /api/e.php`: a batch of events. Body (sent as text/plain, so no CORS preflight):
  `{"app":"neon","v":"13.09","device":"…","session":"…","dev":0,"events":[{"n":"run_end","t":1761300000,"d":{…}}]}`
  Answers `204` (or `400` / `403` / `429` with a short reason).
- `POST /api/scores.php`: submit a score `{app, board, device, player, logo, score, tie, data, dev}`. Answers the
  entry's rank.
- `GET /api/scores.php?app=neon&board=all&limit=10&device=…`: the top of a board, one entry per device (its best),
  ordered by the app's rule (neon: score high to low, then tie low to high: fewer mods wins), plus **you**: that
  device's best and rank.

## The browser script (`client/greglytics.js`)

```js
const gl = Greglytics.init({ endpoint: 'https://…/api/', app: 'neon', version: '13.09' });
gl.track('run_end', { layers: 21, mods: 3 });     // batched; sent every 20 events / 30 s, and when the tab hides
gl.submitScore('all', { score: 21, tie: 3, player: 'NEON_RAT', logo: '<#>', data: { sector: 2 } });  // Promise
gl.scores('all', { limit: 10 });                  // Promise: { entries: [...], you: {...} }
gl.optOut(true);                                  // stop sending events (remembered)
```

Dev is automatic: pages on `file://`, `localhost` or `127.0.0.1` are dev (or pass `dev: true / false`).
A **tester device** is dev everywhere: `Greglytics.tester(true)` remembers it (neon sets it from `?dev=1`).

## Dashboard (`/admin/`)

Password from the config. Pick an app, real / dev, last 1 / 7 / 30 / 365 days: events per day, events by name, a
**breakdown** (an event name + a data field: counts by value, e.g. `run_end` by `corp`), the boards with their top
entries, CSV export of events. Number fields show average / median / min / max; list fields count each
thing in them; a `where` filter (`corp=seekr`) narrows the rows. On dev data: a **clear dev data** button (1.2).

## Setup on DreamHost (see README)

A MySQL database from the panel, the `server/` files uploaded to the domain's folder, and the config (database login,
apps and their allowed sites, admin password hash) one level above the web folder, where the web can't read it.

## Later

- neon: hooked in (v13.16, engine/stats.js). Still to do: the title-screen best / board line.
- Rollups if the events table gets big (counts per day per name).
- Break out into its own repo.
