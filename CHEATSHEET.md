# Speaker Cheatsheet — Real Patterns From My Reports

Quick reference for Q&A / improvising during the talk.
Sanitized from ~270 H1 reports. **No client info.**

---

## Distribution (for the "what actually works" slide)

| Category | Count | Top bounty |
|---|---|---|
| XSS / DOM | 77 | 8.3 (chained) |
| API / IDOR | 50 | 10.0 (export IDOR) |
| Injection | 46 | 9.4 (SQLi+WAF bypass) |
| Auth bypass | 41 | Critical (email swap) |
| Cloud / SSRF | 35 | 10.0 (SSRF→IMDS) |
| Recon / exposed | 20 | 9.3 (config.json) |
| CI/CD | 8 | 8.9 (.npmrc) |
| Mobile | 12 | 10.0 (deeplink SSRF) |

---

## The Repeaters (if someone asks "what should I look for FIRST")

| Found | Pattern | Why it works |
|---|---|---|
| **15+** | Same vulnerable plugin (Elementor-style) on unrelated targets | One CVE → scan the internet |
| **10+** | Export/report endpoint, auth'd but no ownership check | Added late, by different dev, copies auth but not authz |
| **8+** | SSRF via Referer / User-Agent / X-Forwarded-For | WAF watches body+query, not headers. Analytics logs them raw. |
| **6+** | `/actuator/prometheus` open, leaks full endpoint map | Spring Boot default. Nobody locks it. |
| **6+** | Missing authz on PUT/PATCH (GET is protected) | Middleware guards read path, forgot write path |
| **5+** | `?debug=true` still works in prod | Flag check is `if (debug)` not `if (debug && !prod)` |
| **5+** | Phone/email field swap during multi-step signup | Step N trusts step N-1 blindly |
| **5+** | Config file at `/config.json` or `/assets/config/*.json` with secrets | SPAs bundle config client-side. "It's in /assets, nobody will look." |

---

## High-Bounty Shapes (if someone asks "what pays")

### 10.0 — SSRF → AWS metadata → creds
- File proxy / "fetch from URL" feature
- GUID lookup fails → falls back to fetching URL param literally
- URL = `169.254.169.254/latest/meta-data/iam/security-credentials/`
- Error message contained the JSON response. Exfil via error.
- **Lesson:** SSRF severity = what it reaches, not the SSRF itself

### 9.3 — Exposed config.json
- SPA served `/assets/config/config.dev.json` alongside prod
- Contained OAuth client_id + client_secret
- Client secret → forge tokens for any user
- **Lesson:** grep the JS bundle for `.json` paths, fetch all of them

### 8.9 — .npmrc onload-script (CI/CD)
- Pipeline: `npm ci --ignore-scripts` (defensive! good!)
- PR adds `.npmrc` with `onload-script=./x.js`
- `--ignore-scripts` doesn't cover `onload-script` — different hook
- `x.js` runs with full CI env (AWS keys, GITHUB_TOKEN)
- **Variant:** `.npmrc` with `git=./evil.sh` → git-sourced deps run your "git"
- **Lesson:** read the SOURCE of your mitigations, not the docs

### 8.5 — Blind SQLi via Referer header
- Body/query params → WAF blocks `'` instantly
- `Referer: https://x.com/'||pg_sleep(5)||'` → 5 sec delay
- Analytics middleware: `INSERT INTO visits (referer) VALUES ('...')`
- **Lesson:** anything logged is probably stored. Stored = query.

### 8.3 — XSS + CORS + cookie scope chain
- Reflected XSS on `marketing.target.com` (would be 5.0 alone)
- Main API: `Access-Control-Allow-Origin` reflects any `*.target.com`
- Session cookie scoped to `.target.com` not `app.target.com`
- XSS payload fetches `app.target.com/api/me` with `credentials:'include'`
- CORS allows it (subdomain). Cookie sends (parent domain). ATO.
- **Lesson:** triage sees one bug. Chains need you to hold 3 in your head.

---

## Counterintuitive Gems (good for Q&A)

- **`--ignore-scripts` doesn't mean no scripts run.** onload-script, git overrides, lifecycle in deps-of-deps.
- **IMDSv2 isn't a fix if you can PUT.** Header-injection SSRF, gopher://, or apps that follow redirects with method preservation.
- **GraphQL introspection off ≠ schema hidden.** Apollo "Did you mean X?" errors leak field names. Tool: clairvoyance.
- **2FA can be decorative.** If session cookie is issued at password step (not OTP step), 2FA protects a page you don't need to visit.
- **Low severity ≠ low value.** `/actuator/prometheus` is a 3.7. It's also the best API recon tool ever built.
- **"Export" is a cursed word.** 10+ IDOR hits. Export features are always bolted on, always by a different dev, always missing the ownership check.

---

## One-Liners For Slides (if I need to improvise)

> "The WAF was watching the front door. I walked in through the HVAC." *(Referer SQLi)*

> "Three won't-fix findings. One critical chain. The triager only sees one at a time." *(CORS chain)*

> "The defense was correct. The assumption wasn't." *(npm --ignore-scripts)*

> "Export features: added late, by a different dev, as a convenience. They copy the auth. They forget the authz. Every. Time."

> "Multi-step flows trust that earlier steps stay true. They don't."

> "SSRF isn't the bug. SSRF is the door. The bug is what's behind it."

> "I found the same Elementor XSS on 15 different companies. One afternoon of reading plugin source. Fifteen reports."

---

## If demo fails — backup stories to tell instead

**Demo 1 (postMessage) backup:** The `.includes('trusted.com')` story — registered `trusted.com.mydomain.net`, passed the check, eval'd my payload.

**Demo 2 (SSRF) backup:** Automotive cloud — webhook test feature → IMDS → creds leaked in the "invalid image format" error message. The error did my exfil.

**Demo 3 (grep) backup:** Elementor full timeline — 2 weeks in weird.md, 2 hours from grep to PoC, 6M sites.
