# COOK Skills

Club Event Ops (COOK) separates the **app spine** from **AI skills** so teammates can work in parallel.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js App (pages, CRUD, Approvals queue)             │
│  src/app, src/lib, prisma/                              │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
              POST /api/ai  { role, eventId?, input }
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   skills/ops/      skills/outreach/   skills/metrics/
   SKILL.md          SKILL.md           SKILL.md
```

- **App team** owns routing, auth, database, UI, and the `/api/ai` router.
- **Skill authors** own prompt templates, tool definitions, and response shaping inside their `skills/<name>/` folder.
- There is **one AI entrypoint** — not five separate chatbots in the UI.

## Roles

| Role | Folder | Responsibility |
|------|--------|----------------|
| `ops` | `skills/ops/` | Tasks, run-of-show, logistics |
| `outreach` | `skills/outreach/` | Email/Slack drafts → Approvals |
| `metrics` | `skills/metrics/` | Attendance, follow-ups, insights |
| `manager` | (router only) | Intent routing to the right skill |

## Club event / RSVP skills

Reusable Cursor / Grok Bot skills for college club event planning (standalone from the `/api/ai` roles above):

| Skill | Folder | Responsibility |
|-------|--------|----------------|
| Plan club event | `skills/plan-club-event/` | Concept, budget, run-of-show, lock gates before ordering |
| Luma event invite | `skills/luma-event-invite/` | Collect vibes, brand assets, and language; draft Luma invite in browser; no publish without yes |
| Amazon event supplies | `skills/amazon-event-supplies/` | Cafe/party supplies with quality + delivery filters |
| Event food order | `skills/event-food-order/` | Food from any restaurant/app — separate from the Amazon cart |
| In-N-Out event order | `skills/innout-event-order/` | **Deprecated alias** → use Event food order |
| RSVP club loop | `skills/rsvp-club-loop/` | End-to-end orchestration across the skills above |

Typical flow:

1. Plan the event (concept, budget, run-of-show)
2. Create the Luma event invite via `luma-event-invite` — collect **vibes**, **brand assets**, and **language** first; draft in browser; no publish without yes
3. Source cafe/party supplies on Amazon with quality + delivery bars
4. Run a separate **Event food order** plan (user picks vendor) — never mixed into the Amazon cart

### Install on another account

Copy the skill folders under `skills/` into that agent's workflows / skills directory, or add this repo as the shared skills source your team uses. Each `SKILL.md` is self-contained.

### Demo defaults (Cursor Build Night)

- Fun "matcha cafe" station the organizer runs themselves
- User-chosen food vendor via Event food order (no default restaurant)
- Dry-run safe: never publish invites or checkout without explicit approval

## How to add your skill

1. Read your `skills/<role>/SKILL.md` contract.
2. Add prompt files, tools, or helpers under your folder (e.g. `skills/ops/prompts/`).
3. Extend `src/app/api/ai/route.ts` to dispatch `role` → your handler.
4. Return typed JSON matching the contract; set `stub: false` when live.
5. **Never** bypass Approvals for outbound messages.

## Parallel work guidelines

- Do not edit other skill folders without coordination.
- Shared types live in `src/lib/ai/types.ts` — propose changes via PR.
- Database schema changes go through `prisma/schema.prisma` + team review.
- Test with AI off: all CRUD must work without calling `/api/ai`.

## M1

All skills return placeholders. Manual CRUD and the Approvals workflow are fully functional.
