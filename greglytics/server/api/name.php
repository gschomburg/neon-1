<?php
// greglytics: a player's name (e.g. arcade initials), one per device per app.
//   POST {app, device, name, dev}  -> {ok, name}
// It shows on every board entry from that device, so changing it renames them all.
// Letters and digits only (upper-cased), up to 12; a few rude words come back as ???.
declare(strict_types=1);
require __DIR__ . '/lib.php';

$devOrigin = gl_cors(null);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') gl_fail(405, 'POST only');
$src = gl_body();
$app = gl_app($src);
gl_cors($app);
$cfg = gl_config();
gl_limit('n', (int)($cfg['limits']['scores_per_minute'] ?? 10));
$dev = $devOrigin || !empty($src['dev']) ? 1 : 0;
$device = gl_str($src['device'] ?? '', 32, '/^[A-Za-z0-9_-]+$/');
if ($device === '') gl_fail(400, 'device');
$name = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string)($src['name'] ?? '')));
$name = substr($name, 0, 12);
if ($name === '') gl_fail(400, 'name');
$rude = ['ASS', 'CUM', 'FAG', 'FUC', 'FUK', 'FCK', 'KKK', 'NIG', 'NGR', 'DIK', 'COK', 'CNT', 'TIT', 'JIZ', 'SHT', 'FKU', 'NAZ', 'HOE', 'WTF'];
foreach ($rude as $w) if (strpos($name, $w) !== false) { $name = '???'; break; }

$db = gl_db();
$db->beginTransaction();
$db->prepare('DELETE FROM names WHERE app = ? AND dev = ? AND device = ?')->execute([$app, $dev, $device]);
$db->prepare('INSERT INTO names (app, dev, device, name, at) VALUES (?, ?, ?, ?, ?)')->execute([$app, $dev, $device, $name, time()]);
$db->commit();
gl_out(['ok' => true, 'name' => $name]);
