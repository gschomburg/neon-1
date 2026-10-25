// Compare the live greglytics server with the files here.
//   node greglytics/check-version.js [https://s3iz.com/glx/]
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const base = (process.argv[2] || 'https://s3iz.com/glx/').replace(/\/?$/, '/');
const dir = path.join(__dirname, 'server');
const local = f => {
  const p = path.join(dir, f.includes('/') ? f : 'api/' + f);
  if (!fs.existsSync(p)) return 'missing';
  return crypto.createHash('md5').update(fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 8);
};
fetch(base + 'api/version.php', { cache: 'no-store' })
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status + ' (is version.php uploaded?)'); return r.json(); })
  .then(live => {
    console.log(`live: ${live.app} v${live.version} at ${base}`);
    let old = 0;
    for (const [f, h] of Object.entries(live.files)) {
      const ok = h === local(f);
      if (!ok) old++;
      console.log(`  ${ok ? 'ok      ' : 'DIFFERS '} ${f}${ok ? '' : `  (live ${h}, here ${local(f)})`}`);
    }
    console.log(old ? `${old} file(s) need uploading.` : 'All up to date.');
  })
  .catch(e => { console.log('could not check: ' + e.message); process.exitCode = 1; });
