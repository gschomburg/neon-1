<?php
// greglytics dashboard: log in with the config's admin password; pick an app, real or dev data and a time range.
declare(strict_types=1);
require dirname(__DIR__) . '/api/lib.php';

session_name('greglytics_admin');
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS'])]);
session_start();
$cfg = gl_config();
$h = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');

if (isset($_POST['password'])) {
  $hash = $cfg['admin_password_hash'] ?? '';
  if ($hash !== '' && password_verify((string)$_POST['password'], $hash)) { session_regenerate_id(true); $_SESSION['ok'] = 1; }
  else { sleep(1); $bad = true; }
}
if (isset($_GET['logout'])) { $_SESSION = []; session_destroy(); header('Location: ./'); exit; }

function page_head(string $title): void { ?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title><?= htmlspecialchars($title) ?></title>
<style>
  :root { --bg: #0e1218; --panel: #151b24; --line: #273141; --text: #d9e1ec; --mute: #8592a6; --accent: #6cb6ff; --bar: #2f5d8f; }
  @media (prefers-color-scheme: light) { :root { --bg: #f3f4f6; --panel: #fff; --line: #d9dde3; --text: #1d2430; --mute: #6b7585; --accent: #2b62d9; --bar: #a9c4ef; } }
  * { box-sizing: border-box; }
  body { margin: 0; font: 14px/1.45 system-ui, sans-serif; background: var(--bg); color: var(--text); }
  header { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; padding: 12px 16px; background: var(--panel); border-bottom: 1px solid var(--line); }
  header b { font-size: 16px; } header b span { color: var(--accent); }
  header form { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 0; }
  main { max-width: 1100px; margin: 0 auto; padding: 16px; display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  section { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; min-width: 0; }
  section.wide { grid-column: 1 / -1; }
  h2 { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--mute); }
  table { width: 100%; border-collapse: collapse; } td, th { padding: 3px 6px; text-align: left; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { color: var(--mute); font-weight: 500; } td.n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .bar { height: 10px; background: var(--bar); border-radius: 3px; min-width: 1px; }
  select, input, button { font: inherit; color: var(--text); background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 4px 8px; }
  button { cursor: pointer; } a { color: var(--accent); } .mute { color: var(--mute); } .big { font-size: 26px; font-weight: 600; }
  .kpis { display: flex; gap: 28px; flex-wrap: wrap; } code { font-size: 12px; }
</style></head><body>
<?php }

if (empty($_SESSION['ok'])) {
  page_head('greglytics'); ?>
  <main><section><h2>greglytics</h2>
  <?php if (($cfg['admin_password_hash'] ?? '') === ''): ?><p>Set <code>admin_password_hash</code> in the config first (see config.example.php).</p>
  <?php else: ?><form method="post"><input type="password" name="password" placeholder="Password" autofocus> <button>Log in</button>
  <?php if (!empty($bad)): ?><span class="mute">Wrong password</span><?php endif; ?></form><?php endif; ?>
  </section></main></body></html><?php
  exit;
}

$db = gl_db();
$apps = array_keys($cfg['apps']);
$app = in_array($_GET['app'] ?? '', $apps, true) ? $_GET['app'] : $apps[0];
$dev = !empty($_GET['dev']) ? 1 : 0;
$days = in_array((int)($_GET['days'] ?? 7), [1, 7, 30, 365], true) ? (int)$_GET['days'] : 7;
$since = time() - $days * 86400;
$dayExpr = gl_driver() === 'sqlite' ? '(at / 86400)' : '(at DIV 86400)';
if (empty($_SESSION['token'])) $_SESSION['token'] = bin2hex(random_bytes(16));

// Clear dev data: deletes this app's dev / testing events and scores (never the real ones)
if (isset($_POST['clear_dev']) && hash_equals($_SESSION['token'], (string)($_POST['token'] ?? ''))) {
  $capp = in_array($_POST['clear_dev'], $apps, true) ? $_POST['clear_dev'] : '';
  if ($capp !== '') {
    $q = $db->prepare('DELETE FROM events WHERE app = ? AND dev = 1'); $q->execute([$capp]); $ne = $q->rowCount();
    $q = $db->prepare('DELETE FROM scores WHERE app = ? AND dev = 1'); $q->execute([$capp]); $ns = $q->rowCount();
    header('Location: ./?' . http_build_query(['app' => $capp, 'dev' => 1, 'days' => $days, 'cleared' => "$ne,$ns"])); exit;
  }
}

// CSV of the events in range
if (isset($_GET['csv'])) {
  header('Content-Type: text/csv; charset=utf-8');
  header("Content-Disposition: attachment; filename=\"$app-events-{$days}d.csv\"");
  $o = fopen('php://output', 'w');
  fputcsv($o, ['time', 'name', 'device', 'session', 'version', 'data']);
  $q = $db->prepare('SELECT at, name, device, session, version, data FROM events WHERE app = ? AND dev = ? AND at >= ? ORDER BY at');
  $q->execute([$app, $dev, $since]);
  foreach ($q as $r) fputcsv($o, [gmdate('Y-m-d H:i:s', (int)$r['at']), $r['name'], $r['device'], $r['session'], $r['version'], $r['data']]);
  exit;
}

$one = function (string $sql, array $a) use ($db) { $q = $db->prepare($sql); $q->execute($a); return $q->fetchColumn(); };
$all = function (string $sql, array $a) use ($db) { $q = $db->prepare($sql); $q->execute($a); return $q->fetchAll(); };
$base = [$app, $dev, $since];
$total = (int)$one('SELECT COUNT(*) FROM events WHERE app = ? AND dev = ? AND at >= ?', $base);
$devices = (int)$one('SELECT COUNT(DISTINCT device) FROM events WHERE app = ? AND dev = ? AND at >= ?', $base);
$sessions = (int)$one('SELECT COUNT(DISTINCT session) FROM events WHERE app = ? AND dev = ? AND at >= ?', $base);
$perDay = $all("SELECT $dayExpr AS d, COUNT(*) AS n, COUNT(DISTINCT device) AS u FROM events WHERE app = ? AND dev = ? AND at >= ? GROUP BY d ORDER BY d DESC", $base);
$byName = $all('SELECT name, COUNT(*) AS n, COUNT(DISTINCT device) AS u FROM events WHERE app = ? AND dev = ? AND at >= ? GROUP BY name ORDER BY n DESC', $base);
$versions = $all('SELECT version, COUNT(DISTINCT device) AS u FROM events WHERE app = ? AND dev = ? AND at >= ? GROUP BY version ORDER BY u DESC LIMIT 12', $base);

// breakdown: an event's data field, counted by value (dotted paths reach inside: end.corp)
$bName = (string)($_GET['bn'] ?? ($byName[0]['name'] ?? ''));
$bField = trim((string)($_GET['bf'] ?? ''));
// only rows where a field has a value: "corp=seekr" (dotted paths work here too)
$bWhere = trim((string)($_GET['bw'] ?? ''));
[$wField, $wVal] = strpos($bWhere, '=') !== false ? array_map('trim', explode('=', $bWhere, 2)) : ['', ''];
$pick = function ($d, string $path) { foreach (explode('.', $path) as $p) $d = is_array($d) && array_key_exists($p, $d) ? $d[$p] : null; return $d; };
$label = fn($v) => $v === null ? '(none)' : (is_bool($v) ? ($v ? 'true' : 'false') : (is_array($v) ? json_encode($v) : (string)$v));
$isList = fn($v) => is_array($v) && ($v === [] || array_keys($v) === range(0, count($v) - 1));
$fields = []; $counts = []; $nums = []; $rowsIn = 0;
if ($bName !== '') {
  $q = $db->prepare('SELECT data FROM events WHERE app = ? AND dev = ? AND at >= ? AND name = ? ORDER BY at DESC LIMIT 100000');
  $q->execute([$app, $dev, $since, $bName]);
  foreach ($q as $r) {
    $d = $r['data'] !== null ? json_decode($r['data'], true) : null;
    if (!is_array($d)) continue;
    foreach ($d as $k => $v) $fields[$k] = true;
    if ($wField !== '' && $label($pick($d, $wField)) !== $wVal) continue;
    $rowsIn++;
    if ($bField === '') continue;
    $v = $pick($d, $bField);
    if (is_int($v) || is_float($v)) $nums[] = $v;
    // a list (offered mods, a run's mods): count each thing in it
    foreach ($isList($v) ? $v : [$v] as $one) { $key = $label($one); $counts[$key] = ($counts[$key] ?? 0) + 1; }
  }
  arsort($counts);
}
// a number field: count, average, median, min, max
$stat = null;
if (count($nums) >= 1 && count($nums) >= 0.8 * $rowsIn) {
  sort($nums); $c = count($nums);
  $stat = ['n' => $c, 'avg' => array_sum($nums) / $c, 'med' => $c % 2 ? $nums[intdiv($c, 2)] : ($nums[$c / 2 - 1] + $nums[$c / 2]) / 2, 'min' => $nums[0], 'max' => $nums[$c - 1]];
}
$boards = $all('SELECT board, COUNT(*) AS n, COUNT(DISTINCT device) AS u, MAX(at) AS last FROM scores WHERE app = ? AND dev = ? GROUP BY board ORDER BY last DESC LIMIT 20', [$app, $dev]);
$qs = fn(array $over) => '?' . http_build_query(array_merge(['app' => $app, 'dev' => $dev, 'days' => $days, 'bn' => $bName, 'bf' => $bField, 'bw' => $bWhere], $over));
$bars = function (array $rows, string $label, string $num = 'n') use ($h) {
  $max = max(1, ...array_map(fn($r) => (int)$r[$num], $rows ?: [['n' => 1, 'u' => 1]]));
  foreach ($rows as $r) echo '<tr><td>' . $h($r[$label]) . '</td><td class="n">' . (int)$r[$num] . '</td><td style="width:45%"><div class="bar" style="width:' . round(100 * (int)$r[$num] / $max, 1) . '%"></div></td></tr>';
};

page_head("greglytics · $app"); ?>
<header>
  <b>greg<span>lytics</span></b>
  <form method="get">
    <select name="app" onchange="this.form.submit()"><?php foreach ($apps as $a): ?><option<?= $a === $app ? ' selected' : '' ?>><?= $h($a) ?></option><?php endforeach; ?></select>
    <select name="dev" onchange="this.form.submit()"><option value="0"<?= $dev ? '' : ' selected' ?>>real</option><option value="1"<?= $dev ? ' selected' : '' ?>>dev / testing</option></select>
    <select name="days" onchange="this.form.submit()"><?php foreach ([1 => 'last day', 7 => 'last 7 days', 30 => 'last 30 days', 365 => 'last year'] as $d => $l): ?><option value="<?= $d ?>"<?= $d === $days ? ' selected' : '' ?>><?= $l ?></option><?php endforeach; ?></select>
  </form>
  <span class="mute" style="flex:1"></span>
  <a href="<?= $h($qs(['csv' => 1])) ?>">CSV</a> <a href="?logout=1">Log out</a>
</header>
<main>
  <section class="wide"><div class="kpis">
    <div><div class="big"><?= $total ?></div><div class="mute">events</div></div>
    <div><div class="big"><?= $devices ?></div><div class="mute">devices</div></div>
    <div><div class="big"><?= $sessions ?></div><div class="mute">sessions</div></div>
  </div></section>
  <section><h2>Events by name</h2><table><?php $bars($byName, 'name'); ?></table><?php if (!$byName): ?><p class="mute">Nothing yet.</p><?php endif; ?></section>
  <section><h2>Per day (devices)</h2><table><?php $bars(array_map(fn($r) => ['day' => gmdate('D M j', (int)$r['d'] * 86400), 'n' => $r['u']], $perDay), 'day'); ?></table></section>
  <section class="wide"><h2>Breakdown</h2>
    <form method="get" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <input type="hidden" name="app" value="<?= $h($app) ?>"><input type="hidden" name="dev" value="<?= $dev ?>"><input type="hidden" name="days" value="<?= $days ?>">
      <select name="bn"><?php foreach ($byName as $r): ?><option<?= $r['name'] === $bName ? ' selected' : '' ?>><?= $h($r['name']) ?></option><?php endforeach; ?></select>
      by <input name="bf" value="<?= $h($bField) ?>" placeholder="a data field, e.g. corp" list="fields">
      <datalist id="fields"><?php foreach (array_keys($fields) as $f): ?><option value="<?= $h($f) ?>"><?php endforeach; ?></datalist>
      where <input name="bw" value="<?= $h($bWhere) ?>" placeholder="optional: corp=seekr" size="14">
      <button>Show</button>
      <?php if ($fields): ?><span class="mute">fields: <?= $h(implode(', ', array_keys($fields))) ?></span><?php endif; ?>
    </form>
    <?php if ($stat): $f = fn($x) => rtrim(rtrim(number_format((float)$x, 2, '.', ''), '0'), '.'); ?>
      <div class="kpis" style="margin-bottom:10px">
        <?php foreach (['avg' => 'average', 'med' => 'median', 'min' => 'min', 'max' => 'max', 'n' => 'values'] as $k => $l): ?><div><div class="big"><?= $f($stat[$k]) ?></div><div class="mute"><?= $l ?></div></div><?php endforeach; ?>
      </div>
    <?php endif; ?>
    <?php if ($bField !== ''): $rows = []; foreach (array_slice($counts, 0, 40, true) as $k => $n) $rows[] = ['v' => $k, 'n' => $n]; ?>
      <p class="mute"><?= $rowsIn ?> <?= $h($bName) ?> events<?= $wField !== '' ? ' where ' . $h($bWhere) : '' ?>. A list field counts each thing in it.</p>
      <table><?php $bars($rows, 'v'); ?></table><?php if (!$rows): ?><p class="mute">No values.</p><?php endif; ?>
    <?php endif; ?>
  </section>
  <section><h2>Versions (devices)</h2><table><?php $bars(array_map(fn($r) => ['v' => $r['version'] !== '' ? $r['version'] : '(none)', 'n' => $r['u']], $versions), 'v'); ?></table></section>
  <section><h2>Boards</h2>
    <?php if (!$boards): ?><p class="mute">No scores yet.</p><?php endif; ?>
    <table><?php foreach ($boards as $b): ?><tr><td><?= $h($b['board']) ?></td><td class="n"><?= (int)$b['u'] ?> players</td><td class="n mute"><?= gmdate('M j', (int)$b['last']) ?></td></tr><?php endforeach; ?></table>
  </section>
  <?php if ($dev): ?>
  <section><h2>Dev data</h2>
    <?php if (isset($_GET['cleared'])): [$ce, $cs] = array_map('intval', explode(',', (string)$_GET['cleared']) + [0, 0]); ?><p>Cleared <?= $ce ?> events and <?= $cs ?> scores.</p><?php endif; ?>
    <form method="post" onsubmit="return confirm('Delete all dev / testing events and scores for <?= $h($app) ?>? Real data is not touched.')">
      <input type="hidden" name="token" value="<?= $h($_SESSION['token']) ?>"><input type="hidden" name="clear_dev" value="<?= $h($app) ?>">
      <button>Clear dev data for <?= $h($app) ?></button> <span class="mute">events and scores marked dev (file / localhost pages and tester devices)</span>
    </form>
  </section>
  <?php endif; ?>
</main></body></html>
