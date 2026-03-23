# Let's Hack From The Beginning — Takeaway Sheet

*Rotem Bar · HackTheBay 3.0 · github.com/infosec-cyber/hackthebay-3-workshop*

---

## The only 3 questions

1. **Where does my data go?**
2. **What does the server trust that it shouldn't?**
3. **What happens if I lie?**

Every OWASP Top 10 entry is a specific answer to one of these.

---

## Per-area: the one thing to try first

| # | Area | Do this tonight |
|---|---|---|
| 01 | **Web** | DevTools → Network → XHR. Find the request with most params. Change the ID. |
| 02 | **API** | `GET` your profile. `PUT` back every field it returns. See what sticks. |
| 03 | **Auth** | Decode every token (`eyJ` = JWT). Check what's inside before trying to break it. |
| 04 | **Browser** | Console: `addEventListener('message', e=>console.log(e.origin, e.data))`. Use the site. Watch. |
| 05 | **Mobile** | `unzip app.apk && strings classes.dex \| grep -i secret`. No tools needed. |
| 06 | **Cloud** | Find any "fetch URL" feature → point at `169.254.169.254`. |
| 07 | **CI/CD** | Read `.github/workflows/*.yml`. Look for `${{ }}` inside `run:`. |
| 08 | **IoT** | Download firmware from vendor site → `binwalk -e` → `cat etc/shadow`. |
| 09 | **Source** | `grep -rn "exec\|query.*+\|eval(" --include="*.js"`. Trace hits back to `req.`. |
| 10 | **Recon** | `grep -oE '"/[a-zA-Z0-9_/-]+"' main.js \| sort -u`. Frontend JS is a sitemap. |

---

## Patterns that keep paying (from ~270 real reports)

- **Export/report endpoints** — auth check ✅, ownership check ❌. Found 10+ times. "Export" is a cursed word.
- **SSRF via headers** (`Referer`, `User-Agent`) — WAF watches body & query. Headers go to the logger. Logger goes to the DB.
- **`/actuator/prometheus`** — 3.7 severity. Also the best API recon ever. Every endpoint, every method, call counts.
- **Multi-step signup field swap** — verify phone in step 2, change email in step 3. Server trusts step 2 forever.
- **`?debug=true`** — still works. In prod. In 2026.
- **Same plugin, 15 targets** — one afternoon reading plugin source → scan the internet → 15 reports.

---

## The chain math

```
XSS alone                    = 5.0  (medium, "nice find")
+ wildcard CORS on main API  = still 5.0 alone
+ cookie scoped to .target.com = still 5.0 alone
────────────────────────────────────────────────
All three together           = 8.3  (account takeover, $$$$)
```

**The triager sees one bug. You have to hold three in your head.**

---

## Your `weird.md` starter

Keep one file. Append-only. Come back when bored.

```
2026-03-23 · target · /api/export takes `template` param, looks like
            a path. 403 on `../`. Try double-encode? %252e%252e%252f

2026-03-23 · target · JWT has `scope` claim I've never seen. What
            consumes it? grep the frontend bundle.

2026-03-23 · target · /actuator/prometheus is open. Pulled endpoint
            list. 3 endpoints have /internal/ in the path. Probe later.
```

---

## Legal targets (do it tonight)

| Free | Real |
|---|---|
| PortSwigger Web Security Academy | Bug bounty programs (read scope!) |
| flaws.cloud / flaws2.cloud | Your own apps |
| HackTheBox / TryHackMe | Your company staging (ask first) |
| crAPI / Juice Shop / DVWA (docker) | That $20 router in your closet |
| CI/CD Goat | Open source you actually use |

**Not sure if you're allowed? You're not. Ask.**

---

## Tools mentioned (all free)

**Web/API:** Burp Community, Caido, mitmproxy
**Auth:** jwt_tool, flask-unsign
**Mobile:** jadx, apktool, objection
**Cloud:** Pacu, ScoutSuite, cloudfox
**CI/CD:** zizmor, actionlint
**IoT:** binwalk, unblob, Ghidra
**Source:** Semgrep, CodeQL, weggli
**Recon:** subfinder, httpx, nuclei, waybackurls, gau

---

*Pick ONE area. Do the "first thing" tonight. Feed your weird.md. Repeat.*
