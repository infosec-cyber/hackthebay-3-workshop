# Let's Hack From The Beginning — HackTheBay 3.0

## Files

| File | Duration | Use |
|---|---|---|
| `presentation/index.html` | **75 min** (45 talk + 30 lab) | Standard conference slot |
| `presentation/index-2hr.html` | **120 min** (70 talk + 50 lab) | Extended: +war stories, +3 live demos, +chain-attack section |
| `labs/WORKSHOP.md` | — | 10 hands-on labs, one per attack surface |

## Run it

```bash
cd presentation
python3 -m http.server 8000
# → http://localhost:8000           (75 min)
# → http://localhost:8000/index-2hr.html  (2 hr)
```

Press `S` for speaker notes. `Esc` for overview. `F` for fullscreen.

## Structure

Both decks follow: **Mindset → 10 Areas → OWASP mapping → Workshop**

Each area: how to start → trick(s) that worked → go deeper.
2hr adds: second trick, war story, 3 live demo slots (#04 postMessage, #06 SSRF, #09 grep-to-bug).

## Files

```
presentation/
  index.html            75-min deck
  index-2hr.html        2-hour deck (extended, 3 live demos)
  assets/
    demo-postmessage/   Working demo target + runbook (offline-ready)
    demo-grep/          47-line vulnerable Node app + runbook
labs/WORKSHOP.md        10 hands-on labs for attendees
HANDOUT.md              1-page takeaway — print or share link
CHEATSHEET.md           Speaker reference — sanitized patterns
```

## Prep checklist for live demos (2hr only)

- [ ] **Demo 1 (postMessage):** `cd presentation && python3 -m http.server 9000` → runbook in `presentation/assets/demo-postmessage/README.md`
- [ ] **Demo 2 (SSRF):** pre-solve flaws.cloud L1-4, have L5 proxy URL ready, AWS CLI configured with a throwaway profile
- [ ] **Demo 3 (grep):** `node presentation/assets/demo-grep/app.js` → runbook in `presentation/assets/demo-grep/README.md`
- [ ] Practice each demo twice. Time them. Demo 1 & 3 should be <4 min each.
- [ ] Labs: `docker pull bkimminich/juice-shop` on workshop wifi beforehand
- [ ] Print `HANDOUT.md` or have short URL ready to share
