<?php
// greglytics: shared helpers for the API and the dashboard. Works on MySQL (DreamHost) or SQLite (local testing).
declare(strict_types=1);

// Anything that goes wrong: the full story to the server's error log, a short code to the caller (no secrets).
// Database codes: 2002 = can't reach the host, 1045 = wrong user / password, 1044 or 1049 = no access to / no such database.
set_exception_handler(function (Throwable $e) {
  error_log('greglytics: ' . $e->getMessage());
  $why = 'server error';
  if ($e instanceof PDOException) $why = 'database error ' . ($e->errorInfo[1] ?? $e->getCode());
  if (!headers_sent()) gl_fail(500, $why); else echo $why;
});

// The config: one level above the web folder on the server (so the web can't read it), or next to the server
// folder when testing locally. See config.example.php.
function gl_config(): array {
  static $cfg = null;
  if ($cfg !== null) return $cfg;
  $paths = [
    getenv('GREGLYTICS_CONFIG') ?: '',
    dirname(__DIR__, 3) . '/greglytics-config.php',   // the server, installed in a subfolder (site.com/glx/): above the site folder
    dirname(__DIR__, 2) . '/greglytics-config.php',   // the server, installed at the site's root: above the web folder
    dirname(__DIR__) . '/config.php',                  // local testing: in server/ (git-ignored)
  ];
  foreach ($paths as $p) if ($p && is_file($p)) { $cfg = require $p; return $cfg; }
  gl_fail(500, 'no config');
}

function gl_db(): PDO {
  static $db = null;
  if ($db) return $db;
  $c = gl_config()['db'];
  $db = new PDO($c['dsn'], $c['user'] ?? null, $c['pass'] ?? null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  if (gl_driver() === 'sqlite') $db->exec('PRAGMA journal_mode = WAL');
  gl_schema($db);
  return $db;
}
function gl_driver(): string { return explode(':', gl_config()['db']['dsn'], 2)[0]; }

// The tables, made the first time (both databases understand this SQL).
function gl_schema(PDO $db): void {
  $auto = gl_driver() === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY';
  $txt = gl_driver() === 'sqlite' ? 'TEXT' : 'MEDIUMTEXT';
  $db->exec("CREATE TABLE IF NOT EXISTS events (
    id $auto, app VARCHAR(40) NOT NULL, dev SMALLINT NOT NULL DEFAULT 0, at INTEGER NOT NULL,
    device VARCHAR(32) NOT NULL DEFAULT '', session VARCHAR(32) NOT NULL DEFAULT '', version VARCHAR(24) NOT NULL DEFAULT '',
    name VARCHAR(60) NOT NULL, data $txt)");
  $db->exec("CREATE TABLE IF NOT EXISTS scores (
    id $auto, app VARCHAR(40) NOT NULL, dev SMALLINT NOT NULL DEFAULT 0, board VARCHAR(80) NOT NULL, at INTEGER NOT NULL,
    device VARCHAR(32) NOT NULL DEFAULT '', player VARCHAR(40) NOT NULL DEFAULT '', logo VARCHAR(16) NOT NULL DEFAULT '',
    score DOUBLE NOT NULL, tie DOUBLE NOT NULL DEFAULT 0, data $txt)");
  $db->exec("CREATE TABLE IF NOT EXISTS hits (k VARCHAR(64) NOT NULL PRIMARY KEY, n INTEGER NOT NULL, at INTEGER NOT NULL)");
  foreach ([
    'CREATE INDEX ev_app ON events (app, dev, name, at)',
    'CREATE INDEX ev_at ON events (app, dev, at)',
    'CREATE INDEX sc_board ON scores (app, dev, board, score)',
  ] as $sql) { try { $db->exec($sql); } catch (Throwable $e) { /* already there */ } }
}

// ---- requests ----

// CORS: an app's own sites, plus file:// ("null") and localhost for testing. Returns whether the origin is a dev one.
function gl_cors(?string $app): bool {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  $cfg = gl_config();
  $dev = gl_is_dev_origin($origin);
  $ok = $dev || $origin === '';
  if (!$ok && $app !== null && isset($cfg['apps'][$app])) $ok = in_array($origin, $cfg['apps'][$app]['origins'] ?? [], true);
  if (!$ok && $app === null) foreach ($cfg['apps'] as $a) if (in_array($origin, $a['origins'] ?? [], true)) { $ok = true; break; }
  if ($ok && $origin !== '') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
  }
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
  if (!$ok) gl_fail(403, 'origin not allowed');
  return $dev;
}
function gl_is_dev_origin(string $o): bool {
  if ($o === 'null') return true;   // a page opened from a file
  return (bool)preg_match('#^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$#', $o);
}

function gl_body(): array {
  $raw = file_get_contents('php://input') ?: '';
  if (strlen($raw) > (gl_config()['limits']['body_bytes'] ?? 65536)) gl_fail(413, 'too big');
  $j = json_decode($raw, true);
  if (!is_array($j)) gl_fail(400, 'not JSON');
  return $j;
}

function gl_app(array $src): string {
  $app = (string)($src['app'] ?? '');
  if (!isset(gl_config()['apps'][$app])) gl_fail(400, 'unknown app');
  return $app;
}

// A spam limit: so many requests a minute per IP (the IP is only kept as a salted hash, for a minute).
function gl_limit(string $what, int $perMinute): void {
  $ip = $_SERVER['REMOTE_ADDR'] ?? '';
  $salt = gl_config()['salt'] ?? 'greglytics';
  $min = intdiv(time(), 60);
  $k = substr(hash('sha256', "$salt|$what|$ip|$min"), 0, 40);
  $db = gl_db();
  $db->prepare('DELETE FROM hits WHERE at < ?')->execute([time() - 120]);
  $row = $db->prepare('SELECT n FROM hits WHERE k = ?'); $row->execute([$k]); $n = $row->fetchColumn();
  if ($n === false) $db->prepare('INSERT INTO hits (k, n, at) VALUES (?, 1, ?)')->execute([$k, time()]);
  else {
    if ((int)$n >= $perMinute) gl_fail(429, 'slow down');
    $db->prepare('UPDATE hits SET n = n + 1 WHERE k = ?')->execute([$k]);
  }
}

// ---- small helpers ----
function gl_str($v, int $max, string $re = ''): string {
  $s = is_scalar($v) ? (string)$v : '';
  $s = mb_substr(trim($s), 0, $max);
  if ($re !== '' && !preg_match($re, $s)) return '';
  return $s;
}
function gl_json_data($d, int $max): ?string {
  if ($d === null) return null;
  $s = json_encode($d, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  if ($s === false || strlen($s) > $max) return null;
  return $s;
}
function gl_out($data, int $code = 200): void {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function gl_fail(int $code, string $why): void { gl_out(['error' => $why], $code); }
