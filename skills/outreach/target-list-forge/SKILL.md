---
name: target-list-forge
description: Use when a campus lead needs a ranked shortlist to fill event seats — club amplifiers and officers first, CS before CS-adjacent, quality over spray (default ~12), drafts only after the user greenlights the list.
---

# Target list forge

## When to use
You have research, club pages, or people cards (from **campus-signal-scout**, **linkedin-target-list**, or the lead). Job is to **rank and cut** into a seat-filling list. For build nights / workshops, prefer **org amplifiers** (club email, Discord, newsletter, officers) over a spray of cold individual DMs.

## Inputs to confirm first
- Locked goal in one line (headcount + audience + event)
- Raw research / prior skill output
- Cap: default **12** strong amplifiers (≤20 hard preference)
- Priority rule: e.g. CS majors first, CS-adjacent second
- Exclusions / already contacted

## Process
1. Normalize orgs + officers + public channels. Dedupe.
2. Score for seat-fill power: audience fit, blast reach, reachable public channel, officer clarity.
3. Split:
   - **Hit first this week** — top ~5, clearest fit + channel
   - **Rest of P1** — still primary audience
   - **P2** — adjacent audience, after P1
   - **Runners-up** — only if they need more seats (name them, don’t expand the main list)
4. Flag anything that needs a LinkedIn/browser verify (stale officer titles) → hand to `/linkedin-target-list`.
5. **Do not draft** until the user greenlights the list (unless they said “just draft”).

## Gold output shape

```
Locked: ~[N] at [School] [event] — [audience priority].

I’m pulling a short target list of clubs, officers, and channels that can fill those seats. Drafts come after you approve the list.

Target list for [event] (~[N], [priority]). Quality over volume — [cap] strong amplifiers, not a spray list.

Hit these [K] first this week
1. [Org] — [why one line] — [public email] · [Officer (email if public)] · [site]
2. …

Rest of the P1 list
6. …

P2 ([adjacent label], after P1)
8. …

Runners-up if you need more seats: [Org A], [Org B].

[Optional] A few officer titles need a LinkedIn/browser pass to verify who’s current. No drafts until you greenlight the list.
```

Use real public contacts from research. Never invent emails or Discord invites. If a channel isn’t public, say “via [org] Discord (verify leads …)” instead of faking a link.

## Guardrails
- This skill is the **only** ranker/cutter.
- Quality over spray. Under 5 usable amplifiers → say so; don’t pad.
- Never send. Never invent contact info.
- School-specific lists stay in the bot/chat — don’t write them into a shareable skill.
