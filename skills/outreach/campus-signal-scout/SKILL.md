---
name: campus-signal-scout
description: Use when a campus lead needs public campus signals for seat-filling outreach — student orgs, officer pages, club emails, calendars, public Discord/Slack links — before forging a shortlist or drafting.
---

# Campus signal scout

## When to use
Goal is locked (headcount + audience + event) but you need **orgs and channels** on campus. For build nights, scout **clubs that can blast** (Discord, newsletter, officer email), not only random web pages. Hand off to **target-list-forge** (or **linkedin-target-list** to verify officers) — do not present the final ranked shortlist here unless the user asked for a one-shot.

## Inputs to confirm first
- School / campus name
- Focus (CS / AI / hack / builders first; adjacent second)
- Optional: known URLs, orgs to skip
- Cap: default **8–15 raw sources** (forge will cut to ~12)

## Process
1. Search public web: club directories, ACM/AI/hack chapters, CSE major orgs, affinity CS orgs, data/CogSci/design adjacent, school calendars, Luma/Eventbrite, GitHub org pages.
2. For each promising club, collect if public:
   - Site URL
   - Contact email
   - Officer name + email (only if published)
   - Discord/Slack invite **only if publicly listed**
   - One-line audience fit
3. Skip inventing contacts. Mark “officer unclear — needs LinkedIn pass” when titles look stale.
4. **Stop after the research brief** unless asked to forge next.

## Report back
Raw cards (8–15 max):
- Org name
- URL
- Public email / Discord (or “not public”)
- Officer(s) if listed
- Audience fit (CS core / CS-adjacent / stretch)
- Blast potential (newsletter, Discord, email, none clear)

End with: run `/target-list-forge` to cut into Hit-first / P1 / P2, or `/linkedin-target-list` to verify officers.

## Guardrails
- Public info only. No passwords.
- Never bake one school’s private Discord invites or contact lists into a shareable skill update.
- Quality over volume.
