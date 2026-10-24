<?php
// greglytics: take a batch of events.  POST (text/plain JSON):
//   {"app":"neon","v":"13.09","device":"…","session":"…","dev":0,"events":[{"n":"run_end","t":1761300000,"d":{…}}]}
declare(strict_types=1);
require __DIR__ . '/lib.php';

$devOrigin = gl_cors(null);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') gl_fail(405, 'POST only');
$b = gl_body();
$app = gl_app($b);
gl_cors($app);   // this app's sites only
$lim = gl_config()['limits'] ?? [];
gl_limit('e', (int)($lim['batches_per_minute'] ?? 30));

$events = $b['events'] ?? null;
if (!is_array($events) || !$events) gl_fail(400, 'no events');
$events = array_slice($events, 0, (int)($lim['events_per_batch'] ?? 50));
$dev = $devOrigin || !empty($b['dev']) ? 1 : 0;
$device = gl_str($b['device'] ?? '', 32, '/^[A-Za-z0-9_-]*$/');
$session = gl_str($b['session'] ?? '', 32, '/^[A-Za-z0-9_-]*$/');
$version = gl_str($b['v'] ?? '', 24);
$now = time();

$db = gl_db();
$ins = $db->prepare('INSERT INTO events (app, dev, at, device, session, version, name, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
$db->beginTransaction();
$n = 0;
foreach ($events as $e) {
  if (!is_array($e)) continue;
  $name = gl_str($e['n'] ?? '', 60, '/^[A-Za-z0-9_.:-]+$/');
  if ($name === '') continue;
  $t = (int)($e['t'] ?? $now);
  if ($t > $now + 300 || $t < $now - 7 * 86400) $t = $now;   // a clock that's off, or a batch kept too long
  $ins->execute([$app, $dev, $t, $device, $session, $version, $name, gl_json_data($e['d'] ?? null, (int)($lim['data_bytes'] ?? 4096))]);
  $n++;
}
$db->commit();
http_response_code(204);
