# Let's Hack From The Beginning — Workshop Labs

Pick **one** lab that matches the area that grabbed you most. You have ~30 min.
Each lab is self-contained — no dependencies on the others.

> **Rules of engagement:** everything here runs locally or hits intentionally
> vulnerable public labs. Don't point any of this at targets you don't own.

---

## Lab 01 — Web: The IDOR Speedrun
**Area:** #01 Web Apps · **OWASP:** A01 Broken Access Control
**Time:** 15 min · **Needs:** Browser only

### Setup
```bash
docker run --rm -p 3000:3000 bkimminich/juice-shop
# → http://localhost:3000
```

### Task
1. Register two accounts (use different browsers or incognito).
2. Open DevTools → Network. Add an item to your basket as user A.
3. Find the request. Note the `BasketId`.
4. As user A, try to **view and modify user B's basket**.

### Hints (read only if stuck)
<details><summary>Hint 1</summary>
The basket endpoint is <code>GET /rest/basket/{id}</code>. What's stopping you from changing the number?
</details>
<details><summary>Hint 2</summary>
The server checks your JWT... but does it check that the basket <em>belongs</em> to you?
</details>

### Stretch goal
There's a **negative quantity** bug in the basket too. Find it. Get paid to shop.

---

## Lab 02 — API: Mass Assignment
**Area:** #02 APIs · **OWASP:** API3 Broken Object Property Level Auth
**Time:** 20 min · **Needs:** Docker + curl

### Setup
```bash
git clone https://github.com/OWASP/crAPI
cd crAPI/deploy/docker && docker compose up -d
# → http://localhost:8888
```

### Task
1. Register a user. Capture the signup request.
2. `GET` your own profile. List every field the server returns.
3. Try `PUT`ing those fields back — **including ones the UI never sets**.
4. Can you change your `role`? Your `credit`? Someone else's?

### The mirror technique
```bash
# Whatever GET gives you...
curl -H "Authorization: Bearer $TOKEN" http://localhost:8888/identity/api/v2/user/dashboard

# ...try POSTing back with extras
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"me","role":"admin","credit":99999}' \
  http://localhost:8888/identity/api/v2/user/...
```

---

## Lab 03 — Auth: JWT Tampering
**Area:** #03 Auth · **OWASP:** A07 Identification & Auth Failures
**Time:** 15 min · **Needs:** Browser

### Target
https://portswigger.net/web-security/jwt/lab-jwt-authentication-bypass-via-unverified-signature
(free PortSwigger account required — 2 min signup)

### Task
1. Log in as `wiener:peter`. Grab the session JWT from cookies.
2. Decode it at **jwt.io**. Look at the payload.
3. Change `sub` from `wiener` to `administrator`.
4. Put it back. Does the server actually **verify** the signature?

### Speedrun with jwt_tool
```bash
pip install jwt_tool  # or: pipx install jwt-tool
jwt_tool <token> -X a   # try alg:none
jwt_tool <token> -T     # tamper interactively
```

### Stretch
Same lab series has an **algorithm confusion** lab (RS256→HS256). Try it.

---

## Lab 04 — Browser: postMessage Hunt
**Area:** #04 Browser · **OWASP:** A03 Injection (DOM XSS)
**Time:** 20 min · **Needs:** Browser DevTools

### Task — on ANY site you're legally allowed to test
(Juice Shop from Lab 01 works, or your own company's staging)

1. Open console, paste the listener:
   ```js
   window.addEventListener('message',
     e => console.log('[postMessage]', e.origin, '→', e.data), true);
   ```
2. Navigate around. Open any embedded widgets (chat, video, payment).
3. When you see traffic: **find the receiving code**.
   DevTools → Sources → Ctrl+Shift+F → search `addEventListener('message'` or `onmessage`
4. Read the handler. Does it check `e.origin`? How?

### What bad looks like
```js
// ❌ Bypassable with attacker-trusted.com
if (e.origin.indexOf('trusted.com') !== -1)

// ❌ Bypassable with trusted.com.evil.net
if (e.origin.startsWith('https://trusted.com'))

// ✅ Only this is safe
if (e.origin === 'https://trusted.com')
```

---

## Lab 05 — Mobile: APK Secrets
**Area:** #05 Mobile · **OWASP:** M1 Improper Credential Usage
**Time:** 20 min · **Needs:** `unzip`, `grep` (jadx optional)

### Setup
```bash
# Intentionally vulnerable APK
wget https://github.com/dineshshetty/Android-InsecureBankv2/raw/master/InsecureBankv2.apk
```

### Task — the lazy way first
```bash
unzip InsecureBankv2.apk -d bank/
strings bank/classes.dex | grep -iE "http://|https://|api|key|password|secret" | sort -u
```
**Question:** What backend URL does this app talk to? What creds are baked in?

### Task — the proper way
```bash
# Install: https://github.com/skylot/jadx/releases
jadx-gui InsecureBankv2.apk
```
Search (Ctrl+Shift+F) for:
- `SharedPreferences` — where is it storing credentials?
- `TrustManager` — is cert validation disabled?
- `setJavaScriptEnabled` — WebView XSS surface?

### Stretch
Find an **exported Activity** in `AndroidManifest.xml` that shouldn't be
exported. What could another app on the device do with it?

---

## Lab 06 — Cloud: SSRF to Metadata
**Area:** #06 Cloud · **OWASP:** A10 SSRF
**Time:** 20 min · **Needs:** Browser

### Target
**http://flaws.cloud** — Scott Piper's classic. No signup. Just start.

### Task
Work through **Level 1 → Level 5**. Level 5 is the SSRF-to-IMDS payoff.

Each level has hints built in. Try without them first.

### Key moments to watch for
- **Level 1:** S3 bucket listing via DNS
- **Level 2:** Authenticated S3 access with ANY AWS account
- **Level 5:** The proxy. You know what to do. `169.254.169.254`.

### Local alternative if flaws.cloud is slow
```bash
# SSRF lab in a box
docker run -p 80:80 aif4thah/dojo-101-ssrf
```

---

## Lab 07 — CI/CD: Pipeline Injection
**Area:** #07 Supply Chain · **OWASP:** A08 Software & Data Integrity
**Time:** 25 min · **Needs:** Docker + git

### Setup
```bash
git clone https://github.com/cider-security-research/cicd-goat
cd cicd-goat && docker compose up -d
# Jenkins: http://localhost:8080 (alice:alice)
# Gitea:   http://localhost:3000 (thealice:thealice)
```

### Task — "White Rabbit" challenge
You have **write access to a repo** but not to Jenkins secrets.
The Jenkinsfile runs your code. Steal the `flag1` credential.

<details><summary>Hint 1</summary>
You control the <code>Jenkinsfile</code>. What runs during build?
</details>
<details><summary>Hint 2</summary>
<code>withCredentials</code> injects secrets as env vars. <code>env | base64</code> defeats log masking.
</details>

### Stretch — "Mad Hatter"
You can't edit the Jenkinsfile but you CAN edit `Makefile`.
The pipeline runs `make`. Same destination, different road.

---

## Lab 08 — IoT: Firmware Dumpster Dive
**Area:** #08 IoT · **OWASP:** A05 Security Misconfiguration
**Time:** 20 min · **Needs:** `binwalk`

### Setup
```bash
# Debian/Ubuntu: apt install binwalk
# macOS: brew install binwalk
wget https://github.com/OWASP/IoTGoat/releases/download/v1.0/IoTGoat-raspberry-pi2.img
```

### Task
```bash
binwalk -e IoTGoat-raspberry-pi2.img
cd _IoTGoat*/squashfs-root/
```

Now **grep your way to root:**
```bash
cat etc/shadow                     # crackable hashes?
cat etc/passwd                     # any UID 0 surprises?
grep -r "telnet\|dropbear" etc/    # backdoor services?
find . -name "*.pem" -o -name "*.key" -o -name "id_rsa"
grep -rn "password\|passwd" etc/ --include="*.conf"
```

### Questions
1. What's the root password hash? (Crack it: `john shadow.txt`)
2. Is there a hardcoded SSH key?
3. Any service listening that shouldn't be?

---

## Lab 09 — Source: Grep-Driven Development
**Area:** #09 Source Code · **OWASP:** A03 Injection
**Time:** 20 min · **Needs:** git + grep

### Setup
```bash
git clone https://github.com/appsecco/dvna   # Damn Vulnerable NodeJS App
cd dvna
```

### Task — find 3 bug classes without running the app

**SQL Injection:**
```bash
grep -rn "query.*+\|query.*\${" --include="*.js"
# Look for: string concatenation into db.query()
```

**Command Injection:**
```bash
grep -rn "exec\|spawn\|execSync" --include="*.js"
# Look for: user input reaching child_process
```

**SSRF:**
```bash
grep -rn "http.get\|axios\|fetch\|request(" --include="*.js"
# Look for: req.body or req.query flowing into the URL
```

### For each hit
Trace backwards: **where does that variable come from?**
If it reaches `req.` without sanitization → write it down. That's a finding.

### Stretch — Semgrep
```bash
pip install semgrep
semgrep --config=auto .
# Compare: did it find what you found? Did you find something it missed?
```

---

## Lab 10 — Recon: JS Endpoint Mining
**Area:** #10 Recon · **Time:** 15 min · **Needs:** curl + grep

### Task
Pick a target you're **authorized** to test (Juice Shop from Lab 01 is fine).

```bash
# 1. Get the main bundle
curl -s http://localhost:3000/main.js > main.js

# 2. Pull every path-looking string
grep -oE '"/[a-zA-Z0-9_/-]+"' main.js | tr -d '"' | sort -u > paths.txt

# 3. Pull every full URL
grep -oE 'https?://[a-zA-Z0-9./_-]+' main.js | sort -u > urls.txt

# 4. Probe them
while read p; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$p")
  echo "$code $p"
done < paths.txt | sort
```

### Questions
- Which paths return `200` that **aren't linked** anywhere in the UI?
- Any `/api/` routes the frontend references but doesn't use?
- Any third-party URLs (analytics, CDNs) that could be a supply-chain pivot?

### Stretch — automate it
```bash
# The pro pipeline
pip install jsluice   # or use LinkFinder
jsluice urls main.js
```

---

## Done early?

**Combine labs.** The real world doesn't come pre-labeled:
- Lab 10 (recon) → find hidden API → Lab 02 (mass assignment) on it
- Lab 05 (mobile) → extract API URL → Lab 06 (SSRF) against that backend
- Lab 09 (source) → find the bug → Lab 01 (exploit it in the running app)

**Then come find me and tell me what you broke.**
