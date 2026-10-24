# greglytics

A small events + leaderboards service for Greg's projects (neon, asXii, ...): PHP + MySQL on DreamHost, a tiny
browser script, and a dashboard. No cookies, no Google. The plan and the reasons are in [PLAN.md](PLAN.md).

```
client/greglytics.js       the browser script: copy it into a project
server/                    upload this folder's contents to the greglytics domain
  api/e.php                events in (batches)
  api/scores.php           leaderboards: submit a score, read a board
  api/lib.php              shared code (config, database, CORS, limits)
  admin/index.php          the dashboard (password)
  config.example.php       the config template
```

## Setting up on DreamHost

1. **The domain**: add it in the panel (Websites), with HTTPS on (the free Let's Encrypt certificate). The games
   are on HTTPS, so this has to be too.
2. **The database**: Databases › MySQL Databases: make a database (e.g. `greglytics`) and a user for it, on a
   hostname like `mysql.your-domain.com`. Note the hostname, database, user and password.
3. **The config**: copy `server/config.example.php` to `greglytics-config.php` in your home folder, one level
   above the domain's folder (e.g. `/home/you/greglytics-config.php` next to `/home/you/your-domain.com/`), so the
   web can't read it. Fill in the database line, each app's sites (`https://gregschomburg.com`, ...), a random
   `salt`, and the admin password hash:
   `php -r "echo password_hash('your password', PASSWORD_DEFAULT);"` (run it over SSH on DreamHost).
4. **Upload** `server/api/` and `server/admin/` into the domain's folder (not the config example). The tables are
   made on the first request.
   A subfolder works too: `s3iz.com/glx/api/` and `s3iz.com/glx/admin/`, with the config still in your home
   folder (`/home/you/greglytics-config.php`, next to `/home/you/s3iz.com/`), never inside the site folder.
5. **Check**: open `https://your-domain.com/admin/`, log in. Open a game from a file, play a bit, and look at the
   dashboard with **dev / testing** picked.

## Using it in a project

```html
<script src="greglytics.js"></script>
<script>
  const gl = Greglytics.init({ endpoint: 'https://your-domain.com/api/', app: 'neon', version: '13.09' });
  gl.track('run_end', { seed: 'X7K2', layers: 21, mods: 3, end: 'died', corp: 'SIGIL' });
</script>
```

- `track(name, data)`: an event; `data` is any small JSON (up to 4 KB).
- `submitScore(board, { score, tie, player, logo, data })`: a board is any name (`all`, `daily-2026-10-24`). Ranks
  by score (high first, unless the app's config says `order: asc`), then tie (low first: neon's mods taken).
  Each device's best counts. Returns `{ ok, rank, of }`.
- `scores(board, { limit })`: `{ entries: [{ rank, player, logo, score, tie, at, data, me }], you, of }`.
- `optOut(true)`: stop sending events (remembered on this device). Tell players what's sent, and give them the switch.
- Pages opened from a file or localhost are **dev** data automatically; the dashboard shows real and dev apart.

## Testing locally

With PHP installed: copy `config.example.php` to `server/config.php` (git-ignored), switch it to the SQLite line,
then `php -S localhost:8080 -t server` and use `http://localhost:8080/api/` as the endpoint.
