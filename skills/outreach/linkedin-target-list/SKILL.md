---
name: linkedin-target-list
description: Use when a campus lead needs to find or verify people on LinkedIn/X for outreach — officers, builders, amplifiers — signed-in browser, quality caps, no passwords, no sending.
---

# LinkedIn target list

## When to use
- Verify **current officers** after a club list (common after **target-list-forge** flags stale titles).
- Or build a **people** list when org blasts aren’t enough.
Optional warm-up: **campus-signal-scout**. After: **target-list-forge** if messy, then **outreach-draft**.

## Inputs to confirm first
- School / campus
- Goal in one line
- Mode: `verify officers` (names/orgs given) or `find people` (keywords)
- Cap: default **10–20** (verify mode can be smaller)
- Channels: LinkedIn and/or X

## Browser process
1. Use the computer’s browser with the user’s **saved** LinkedIn/X session.
2. If login or 2FA is needed, **stop** and have them sign in. Never ask for passwords.
3. **Verify mode:** search each named person/org; confirm role is current; update email/channel only from public sources.
4. **Find mode:** search campus + keywords; open real relevant profiles.
5. If LinkedIn blocks you: fall back to club sites, X, GitHub, Luma/Eventbrite, union pages. Say you fell back.
6. No mass-scrape. No fighting rate limits.

## People card format
- Name
- Role / year if visible (note if unverified)
- School or club
- Profile or post link
- Why relevant
- Best public channel
- Fit: strong / maybe / stale-title?

## Report back
- Cards (cap-respecting)
- What changed in verify mode (confirmed / replaced / still unclear)
- Next: back to `/target-list-forge` to re-tier, or approve → `/outreach-draft`

## Guardrails
- Never send, post, or DM.
- 10–20 strong beats 200 weak.
- Don’t invent emails. Don’t put private lists into shareable skills.
