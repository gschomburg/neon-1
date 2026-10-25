<?php
// greglytics: what's deployed. Open api/version.php in a browser.
// "files" is a short fingerprint of each server file, so we can tell which ones are out of date
// (compare with: node greglytics/check-version.js). No database, no config needed.
header('Content-Type: application/json');
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');

$files = [];
foreach (['e.php', 'lib.php', 'name.php', 'scores.php', 'version.php'] as $f) {
  $p = __DIR__ . '/' . $f;
  $files[$f] = is_file($p) ? substr(md5(str_replace("\r\n", "\n", file_get_contents($p))), 0, 8) : 'missing';
}
$admin = dirname(__DIR__) . '/admin/index.php';
$files['admin/index.php'] = is_file($admin) ? substr(md5(str_replace("\r\n", "\n", file_get_contents($admin))), 0, 8) : 'missing';

echo json_encode(['app' => 'greglytics', 'version' => '1.2', 'files' => $files], JSON_PRETTY_PRINT);
