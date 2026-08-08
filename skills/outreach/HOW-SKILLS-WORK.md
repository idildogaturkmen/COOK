# How Grok bots use skills (short)

A skill is a reusable playbook (`SKILL.md`) any bot can run.

1. Skills live in **Settings → Plugins → Yours** (private skills, or skills from an installed plugin).
2. Turn the skill **on for that bot** (per-agent toggle).
3. In chat, the lead runs it with `/skill-name` or `@skill-name`, or the bot pulls it in when the task matches the skill’s description.

**Bot** = teammate (persona, walls, memory, logins).  
**Skill** = method (steps + templates).

Keep school-specific stuff in the bot. Keep the method generic in the skill.

## Outreach pack (nested here)

Install each folder as its own skill; toggle on for the **Outreach** bot:

| Skill | Run | Job |
|-------|-----|-----|
| `campus-signal-scout/` | `/campus-signal-scout` | Public campus sources |
| `linkedin-target-list/` | `/linkedin-target-list` | People cards via browser |
| `target-list-forge/` | `/target-list-forge` | Rank/cut shortlist |
| `outreach-draft/` | `/outreach-draft` | First-touch drafts (approve to send) |

Typical seat-fill flow: scout → forge (org amplifiers) → LinkedIn verify if officers look stale → greenlight → draft.

Gold list shape (from real UCSD build-night run): Locked goal → Hit first this week (~5) → Rest of P1 → P2 adjacent → Runners-up → no drafts until greenlight.

If nested skills don’t appear in Plugins, add each subfolder as its own private skill (or promote one level under `skills/`).

`SKILL.md` in this parent folder is the COOK Approvals app stub — not a Grok outreach playbook. Leave it alone unless you’re wiring `/api/ai`.
