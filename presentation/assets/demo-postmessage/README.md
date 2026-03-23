# postMessage Live Demo — Runbook

**Timing:** 4 min. Practice twice before the talk.

## Setup (before talk)

```bash
cd hackthebay-workshop
python3 -m http.server 9000   # separate terminal, leave running
```

Pre-open in browser tabs:
- Tab 1: `http://localhost:9000/assets/demo-postmessage/vulnerable.html`
- Tab 2: `http://localhost:9000/assets/demo-postmessage/attacker.html`

## Script

**[0:00]** Switch to Tab 1. "This is a support portal. Logged-in admin. Chat widget embedded as iframe."

**[0:30]** DevTools → Console. "See the cookie? `session=admin_token...`. See the iframe traffic coming in every 3 seconds."

**[1:00]** DevTools → Sources → `vulnerable.html` → scroll to the listener (line ~50). "Here's the bug. Two lines."

Point at: `.includes('acmecorp')` — "substring match. `acmecorp.evil.net` passes."
Point at: `innerHTML +=` — "and whatever passes goes straight into the DOM."

**[2:00]** "In the real world I'd host my page on `acmecorp.attacker.net`. For the demo—" switch to Tab 2, copy the payload.

**[2:30]** Back to Tab 1. Paste in console. Hit enter.

**[2:45]** Chat log turns red. Cookie is printed. **Pause. Let it land.**

**[3:00]** "That's it. `.includes()` for origin check + `innerHTML` sink. Two very normal-looking lines. Full session theft."

**[3:30]** "The fix is on the attacker page — exact origin match, `textContent` not `innerHTML`. Ten seconds to fix. Ten seconds to find. If you look."

## If it breaks

- Payload doesn't fire → likely a copy-paste encoding issue with `&lt;`. Type the `<img>` tag manually.
- Nothing in console → refresh Tab 1, the listener only binds once.
- Total failure → "demo gods have spoken" → describe it verbally, show the code in Sources. Still lands.
