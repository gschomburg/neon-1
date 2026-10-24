<?php
// greglytics config. Copy this to greglytics-config.php ONE LEVEL ABOVE the web folder on the server (e.g.
// /home/you/greglytics-config.php when the site is /home/you/your.domain/), so the web can't read it.
// For local testing, copy it to server/config.php instead (git-ignored) and use the SQLite line.
return [
  // MySQL on DreamHost: the hostname, database, user and password from the panel (MySQL Databases)
  'db' => ['dsn' => 'mysql:host=mysql.your-domain.com;dbname=greglytics;charset=utf8mb4', 'user' => 'greglytics', 'pass' => 'CHANGE ME'],
  // local testing: a file database, no setup
  // 'db' => ['dsn' => 'sqlite:' . __DIR__ . '/greglytics.sqlite'],

  // The apps that may send, and the sites each one runs on (exact origins: scheme + host, no path).
  // Pages opened from a file or from localhost are always let in, as dev data.
  'apps' => [
    'neon' => [
      'origins' => ['https://gregschomburg.com', 'https://www.gregschomburg.com'],
      'scores' => ['order' => 'desc', 'tie' => 'asc'],   // more layers first; fewer mods breaks ties
    ],
    'asxii' => [
      'origins' => ['https://gregschomburg.com'],
    ],
  ],

  // The dashboard (/admin/) password, as a hash. Make one with:  php -r "echo password_hash('your password', PASSWORD_DEFAULT);"
  'admin_password_hash' => '',

  // Any random text: it salts the short-lived IP hashes used to limit spam.
  'salt' => 'CHANGE ME to something random',

  'limits' => [
    'batches_per_minute' => 30,   // event batches per IP per minute
    'events_per_batch' => 50,
    'scores_per_minute' => 10,
    'data_bytes' => 4096,         // the most JSON detail an event / score can carry
    'body_bytes' => 65536,
  ],
];
