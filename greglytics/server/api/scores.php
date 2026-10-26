<?php
// greglytics: leaderboards.
//   POST {app, board, device, player, logo, score, tie, data, dev}  -> {ok, rank, of, run, best}
//        rank: your best's place; run: where this run places; best: this run is your best on this board
//   GET  ?app=neon&board=all&limit=10&device=…&dev=0              -> {board, entries: [...], you: {...}|null}
// A board is any name a game picks (daily-2026-10-24, all, naked...). Every run is its own entry, so one player can be
// on a board many times (config 'scores' => ['per' => 'device'] keeps only each device's best instead).
// A name set with name.php shows on all that device's entries (so a player's latest initials are what you see).
// Order per app (config 'scores'): score high to low by default, then tie (e.g. neon's mods taken) low to high.
declare(strict_types=1);
require __DIR__ . '/lib.php';

$devOrigin = gl_cors(null);
$method = $_SERVER['REQUEST_METHOD'] ?? '';
$src = $method === 'POST' ? gl_body() : $_GET;
$app = gl_app($src);
gl_cors($app);
$cfg = gl_config();
$rule = $cfg['apps'][$app]['scores'] ?? [];
$hiFirst = ($rule['order'] ?? 'desc') !== 'asc';
$tieLowFirst = ($rule['tie'] ?? 'asc') !== 'desc';
$perDevice = ($rule['per'] ?? 'run') === 'device';
$board = gl_str($src['board'] ?? '', 80, '/^[A-Za-z0-9_.:-]+$/');
if ($board === '') gl_fail(400, 'board');
$dev = $devOrigin || !empty($src['dev']) ? 1 : 0;
$device = gl_str($src['device'] ?? '', 32, '/^[A-Za-z0-9_-]*$/');
$db = gl_db();

// is a better than b?
$better = function (array $a, array $b) use ($hiFirst, $tieLowFirst): bool {
  if ((float)$a['score'] !== (float)$b['score']) return $hiFirst ? $a['score'] > $b['score'] : $a['score'] < $b['score'];
  if ((float)$a['tie'] !== (float)$b['tie']) return $tieLowFirst ? $a['tie'] < $b['tie'] : $a['tie'] > $b['tie'];
  return $a['at'] < $b['at'];   // the earlier one
};
// the board's entries, best first: every run, or (per device) each device's best
$bests = function () use ($db, $app, $dev, $board, $better, $perDevice): array {
  $q = $db->prepare('SELECT device, player, logo, score, tie, at, data FROM scores WHERE app = ? AND dev = ? AND board = ?');
  $q->execute([$app, $dev, $board]);
  $by = [];
  $all = [];
  foreach ($q as $r) {
    if (!$perDevice) { $all[] = $r; continue; }
    $k = $r['device'] !== '' ? $r['device'] : 'x' . $r['at'];
    if (!isset($by[$k]) || $better($r, $by[$k])) $by[$k] = $r;
  }
  if ($perDevice) $all = array_values($by);
  $names = $db->prepare('SELECT device, name FROM names WHERE app = ? AND dev = ?');
  $names->execute([$app, $dev]);
  $nameOf = [];
  foreach ($names as $n) $nameOf[$n['device']] = $n['name'];
  foreach ($all as &$r) if (isset($nameOf[$r['device']])) $r['player'] = $nameOf[$r['device']];
  unset($r);
  usort($all, fn($a, $b) => $better($a, $b) ? -1 : ($better($b, $a) ? 1 : 0));
  return $all;
};
$shape = fn(array $r, int $rank): array => ['rank' => $rank, 'player' => $r['player'], 'logo' => $r['logo'],
  'score' => +$r['score'], 'tie' => +$r['tie'], 'at' => (int)$r['at'], 'data' => $r['data'] !== null ? json_decode($r['data'], true) : null,
  'me' => $r['device'] !== '' && $r['device'] === ($GLOBALS['device'] ?? '')];

if ($method === 'POST') {
  gl_limit('s', (int)($cfg['limits']['scores_per_minute'] ?? 10));
  if (!is_numeric($src['score'] ?? null)) gl_fail(400, 'score');
  $row = [
    'score' => (float)$src['score'], 'tie' => is_numeric($src['tie'] ?? null) ? (float)$src['tie'] : 0.0, 'at' => time(),
    'player' => gl_str($src['player'] ?? '', 40), 'logo' => gl_str($src['logo'] ?? '', 16),
  ];
  $db->prepare('INSERT INTO scores (app, dev, board, at, device, player, logo, score, tie, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    ->execute([$app, $dev, $board, $row['at'], $device, $row['player'], $row['logo'], $row['score'], $row['tie'],
      gl_json_data($src['data'] ?? null, (int)($cfg['limits']['data_bytes'] ?? 4096))]);
  $all = $bests(); $rank = null; $run = 1; $best = false;
  $same = fn(array $r): bool => $r['device'] === $device && (int)$r['at'] === $row['at'] && (float)$r['score'] === $row['score'] && (float)$r['tie'] === $row['tie'];
  foreach ($all as $i => $r) {
    $mine = $device !== '' && $r['device'] === $device;
    if ($mine && $rank === null) { $rank = $i + 1; $best = $same($r); }   // your best entry: the first of yours
    if ($same($r)) continue;
    if ($perDevice ? (!$mine && $better($r, $row)) : $better($r, $row)) $run++;   // entries ahead of this run
  }
  gl_out(['ok' => true, 'rank' => $rank, 'of' => count($all), 'run' => $run, 'best' => $best]);
}

if ($method !== 'GET') gl_fail(405, 'GET or POST');
$limit = max(1, min(100, (int)($src['limit'] ?? 10)));
$all = $bests();
$out = [];
foreach (array_slice($all, 0, $limit) as $i => $r) $out[] = $shape($r, $i + 1);
$you = null;
if ($device !== '') foreach ($all as $i => $r) if ($r['device'] === $device) { $you = $shape($r, $i + 1); break; }
gl_out(['board' => $board, 'entries' => $out, 'you' => $you, 'of' => count($all)]);
