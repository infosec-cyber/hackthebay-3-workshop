// Tiny "image resizer" API — live demo target for Area #09 (Source Code)
// Run: node app.js  →  http://localhost:3001
//
// DEMO GOAL: grep → find the bug → curl → RCE, all in ~3 min

const http = require('http');
const url = require('url');
const { exec } = require('child_process');   // ← grep hit #1

const server = http.createServer((req, res) => {
  const q = url.parse(req.url, true).query;

  if (req.url.startsWith('/resize')) {
    const width = q.width || '100';
    const file  = q.file  || 'default.png';

    // "Just shell out to imagemagick, it's faster than a library"
    // — a developer, 3am, sprint deadline
    const cmd = `convert ${file} -resize ${width}x ${file}.out`;   // ← grep hit #2
    exec(cmd, (err, stdout, stderr) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(err ? `error: ${stderr}` : `resized to ${width}px\n`);
    });
    return;
  }

  if (req.url.startsWith('/health')) {
    res.writeHead(200);
    res.end('ok\n');
    return;
  }

  res.writeHead(404);
  res.end('not found\n');
});

server.listen(3001, () => console.log('demo target on :3001'));

/*
 * There's a second, subtler bug below — leave it for "anyone spot the
 * other one?" at the end of the demo if time permits.
 */
function loadUserPrefs(userId) {
  const fs = require('fs');
  const path = `./prefs/${userId}.json`;           // ← path traversal
  return JSON.parse(fs.readFileSync(path));
}
